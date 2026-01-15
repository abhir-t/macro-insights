import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Check if API key is set
    if (!process.env.BUTTONDOWN_API_KEY) {
      console.error('BUTTONDOWN_API_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Add subscriber to Buttondown
    const response = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        tags: ['website'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Buttondown API error:', response.status, errorText);

      try {
        const error = JSON.parse(errorText);
        // If already subscribed, still return success
        if (error.code === 'email_already_exists' || errorText.includes('already')) {
          return NextResponse.json({ success: true, message: 'Already subscribed' });
        }
        // If blocked by firewall (spam protection)
        if (error.code === 'subscriber_blocked') {
          return NextResponse.json({ error: 'Please use a valid email address' }, { status: 400 });
        }
      } catch {
        // Ignore JSON parse error
      }

      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
