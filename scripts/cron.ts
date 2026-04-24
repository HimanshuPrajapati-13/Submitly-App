import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { sendEmail } from '../src/lib/email';

// Load environment variables strictly from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Ensure we have Supabase credentials in the environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the Service Role Key to bypass RLS and fetch all users' applications
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables! Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local.');
  process.exit(1);
}

// Create a Supabase client to fetch applications
// We use the SERVICE_ROLE key here to bypass Row Level Security 
// since the cron job runs external to a user session.
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Automated Email Reminder Service Started!');
console.log('⏰ Waiting for scheduled execution...');

/**
 * The Cron Job Schedule:
 * We are using '0 8 * * *' which means:
 * Run at 8:00 AM every day.
 * 
 * Note: If you want to test this immediately, change the string to '* * * * *' 
 * which will run it every single minute.
 */
cron.schedule('0 8 * * *', async () => {
  console.log(`\n[${new Date().toISOString()}] Running daily database check...`);
  
  try {
    // 1. Fetch all applications that are NOT submitted or completed
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*')
      .neq('status', 'SUBMITTED')
      .neq('status', 'RESULT_PENDING');

    if (error) throw error;
    if (!applications || applications.length === 0) {
      console.log('✅ No pending applications found today.');
      return;
    }

    let emailsSent = 0;
    const now = new Date();
    // Strip the time to compare pure dates
    now.setHours(0, 0, 0, 0);

    // 2. Loop through applications and check custom remiders & deadlines
    for (const app of applications) {
      let shouldSendCustomReminder = false;
      
      // A. Check Custom Scheduled Reminders
      if (app.custom_reminder_date) {
        const customDate = new Date(app.custom_reminder_date);
        customDate.setHours(0, 0, 0, 0);
        
        if (customDate.getTime() === now.getTime()) {
           shouldSendCustomReminder = true;
           console.log(`✉️ Custom Scheduled Reminder Triggered: ${app.title}`);
           
           await sendEmail({
             to: 'workingadi300@gmail.com', 
             subject: `Scheduled Reminder: ${app.title}`,
             html: `
               <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #334155;">
                 <h2 style="color: #60a5fa; margin-bottom: 8px;">Scheduled Reminder</h2>
                 <p style="font-size: 16px; margin-bottom: 24px;">This is the custom reminder you scheduled for your application: <strong>${app.title}</strong>.</p>
                 <p style="color: #94a3b8; font-size: 14px; margin-top: 32px;">Please log in to the Submitly Dashboard to update your status or take action.</p>
               </div>
             `
           });
           
           emailsSent++;
           
           // Clear the custom reminder date so it doesn't fire again tomorrow
           await supabase
             .from('applications')
             .update({ custom_reminder_date: null })
             .eq('id', app.id);
             
           // Skip the standard deadline check since we sent a custom one today
           continue; 
        }
      }

      // B. Check Standard Deadlines if no custom reminder was fired
      if (!app.deadline) continue;

      const deadlineDate = new Date(app.deadline);
      deadlineDate.setHours(0, 0, 0, 0);

      // Calculate the difference in DAYS
      const diffTime = deadlineDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Trigger condition: If due in exactly 7 days, 3 days, or 1 day
      if (diffDays === 7 || diffDays === 3 || diffDays === 1) {
        console.log(`✉️ Impending Deadline Detected: ${app.title} (Due in ${diffDays} days)`);

        await sendEmail({
          to: 'workingadi300@gmail.com', 
          subject: `Automated Reminder: ${app.title} is due in ${diffDays} day(s)!`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; background-color: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #334155;">
              <h2 style="color: #60a5fa; margin-bottom: 8px;">Automated Deadline Alert</h2>
              <p style="font-size: 16px; margin-bottom: 24px;">This is an automated reminder that your application for <strong>${app.title}</strong> is due very soon.</p>
              
              <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 14px;">DEADLINE</p>
                <p style="margin: 0; font-size: 20px; font-weight: bold; color: ${diffDays === 1 ? '#ef4444' : '#f59e0b'};">
                  ${diffDays} Day(s) Remaining
                </p>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; margin-top: 32px;">Please log in to the Submitly Dashboard to update your status.</p>
            </div>
          `
        });
        
        emailsSent++;
      }
    }

    console.log(`✅ Daily check complete. Sent ${emailsSent} reminder emails.`);

  } catch (err) {
    console.error('❌ Error during automated check:', err);
  }
});
