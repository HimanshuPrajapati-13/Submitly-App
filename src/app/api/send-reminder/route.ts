import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
// You can optionally import your auth client here to protect this route
// import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // 1. Parse the incoming JSON request body
    const body = await request.json();
    const { to, subject, text, html } = body;

    // 2. Validate that the required fields are present
    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and either text or html' },
        { status: 400 } // 400 Bad Request
      );
    }

    // 3. Optional: Add Authentication/Authorization checks here
    // Verify that the person/service calling this endpoint is allowed to send emails!
    // Example:
    // const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 4. Call our utility function to send the email
    const result = await sendEmail({ to, subject, text, html });

    // 5. Respond based on whether it succeeded
    if (result.success) {
      return NextResponse.json(
        { message: 'Email sent successfully', messageId: result.messageId },
        { status: 200 } // 200 OK
      );
    } else {
      console.error('Email send failed:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email. Check server logs.' },
        { status: 500 } // 500 Internal Server Error
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing request' },
      { status: 500 }
    );
  }
}
