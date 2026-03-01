import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Utility function to send emails using Nodemailer.
 * Requires EMAIL_USER and EMAIL_PASS environment variables to be set.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  // 1. Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    // We are using Gmail as the service for this example.
    // If you are using another provider (like Outlook, SendGrid, etc.), you would change this or use host/port configurations.
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your App Password (not your regular login password)
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to,                           // List of receivers
    subject,                      // Subject line
    text,                         // Plain text body (fallback)
    html,                         // HTML body
  };

  // 3. Send the email and return the result
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
