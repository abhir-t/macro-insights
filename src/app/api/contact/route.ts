import { NextResponse } from 'next/server';
import { addContact } from '@/lib/firestore';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    // Store contact in Firebase
    await addContact({ name, email, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed: ${errorMessage}` }, { status: 500 });
  }
}
