import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, isConfigured } from '@/lib/firebase';

const resend = new Resend(process.env.RESEND_API_KEY);
const SUBSCRIBERS_PATH = 'artifacts/macro-insights/public/data/subscribers';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Add to Firebase
    if (isConfigured && db) {
      const subscribersRef = collection(db, SUBSCRIBERS_PATH);
      await addDoc(subscribersRef, {
        email,
        subscribedAt: Timestamp.now(),
      });
    }

    // Send notification email to you
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Vantage Post <onboarding@resend.dev>',
        to: process.env.NOTIFICATION_EMAIL || 'your-email@gmail.com',
        subject: 'New Subscriber on Vantage Post!',
        html: `
          <h2>New Subscriber!</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
