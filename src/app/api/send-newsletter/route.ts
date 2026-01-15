import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSubscribers } from '@/lib/firestore';

export async function POST(request: Request) {
  try {
    const { title, excerpt, articleUrl } = await request.json();

    if (!title || !articleUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get all subscribers from Firebase
    const subscribers = await getSubscribers();

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscribers to send to' });
    }

    // Send email to all subscribers
    const { error } = await resend.emails.send({
      from: 'Vantage Post <onboarding@resend.dev>',
      to: subscribers,
      subject: `New on Vantage Post: ${title}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 16px;">${title}</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${excerpt}</p>
          <a href="${articleUrl}" style="display: inline-block; background: #e11d24; color: white; padding: 12px 24px; text-decoration: none; font-weight: 500;">Read the full article →</a>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
          <p style="color: #999; font-size: 12px;">You're receiving this because you subscribed to Vantage Post.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
    }

    return NextResponse.json({ success: true, sent: subscribers.length });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
}
