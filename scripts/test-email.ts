import { sendEmail } from '../src/lib/email';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testEmail() {
  console.log('Testing email configuration...');
  console.log(`Using email: ${process.env.EMAIL_USER}`);

  const testOptions = {
    to: process.env.EMAIL_USER as string, // Sending to yourself for the test
    subject: 'Test Email from Submitly!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
        <h2 style="color: #2563eb;">It works! 🎉</h2>
        <p>This is a test email from your Submitly local development environment.</p>
        <p style="color: #64748b; font-size: 14px;">If you are seeing this, your App Password and Nodemailer configuration are set up correctly.</p>
      </div>
    `,
  };

  try {
    const result = await sendEmail(testOptions);
    if (result.success) {
      console.log('✅ Success! Check your inbox.');
    } else {
      console.log('❌ Failed to send email.');
      console.error(result.error);
    }
  } catch (err) {
    console.error('Test script crashed:', err);
  }
}

testEmail();
