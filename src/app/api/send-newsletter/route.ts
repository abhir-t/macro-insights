import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, excerpt, articleUrl } = await request.json();

    if (!title || !articleUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email to all subscribers via Buttondown
    const response = await fetch('https://api.buttondown.email/v1/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: `New on Vantage Post: ${title}`,
        body: `
# ${title}

${excerpt}

[Read the full article →](${articleUrl})

---

You're receiving this because you subscribed to Vantage Post.
        `.trim(),
        status: 'sent', // 'sent' to send immediately, 'draft' to save as draft
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Buttondown error:', error);
      throw new Error(error.detail || 'Failed to send newsletter');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
}
