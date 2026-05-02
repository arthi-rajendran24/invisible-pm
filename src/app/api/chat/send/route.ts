import { NextResponse } from 'next/server';

interface ChatSendRequest {
  spaceId: string;
  message: string;
  recipient: string;
}

export async function POST(req: Request) {
  try {
    const body: ChatSendRequest = await req.json();
    const { spaceId, message, recipient } = body;

    if (!message || !spaceId) {
      return NextResponse.json(
        { error: 'Message and spaceId are required' },
        { status: 400 }
      );
    }

    // Format message with recipient mention
    const formattedMessage = recipient
      ? `*Nudge for ${recipient}:*\n\n${message}\n\n_— Sent by The Invisible PM 🤖_`
      : `${message}\n\n_— Sent by The Invisible PM 🤖_`;

    const serviceAccountKey = process.env.GOOGLE_CHAT_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountKey) {
      // Demo mode: simulate sending
      console.log(`[DEMO MODE] Would send to space ${spaceId}:`, formattedMessage);
      return NextResponse.json({
        success: true,
        messageId: `demo-${Date.now()}`,
        demo: true,
        message: 'Message sent (demo mode — no Chat API credentials configured)',
      });
    }

    // Production mode: use Google Chat API with service account
    const { google } = await import('googleapis');
    const credentials = JSON.parse(serviceAccountKey);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/chat.bot'],
    });

    const chat = google.chat({ version: 'v1', auth });

    const result = await chat.spaces.messages.create({
      parent: `spaces/${spaceId}`,
      requestBody: {
        text: formattedMessage,
      },
    });

    return NextResponse.json({
      success: true,
      messageId: result.data.name,
      demo: false,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message to Google Chat' },
      { status: 500 }
    );
  }
}
