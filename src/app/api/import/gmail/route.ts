import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';
    const maxResults = parseInt(searchParams.get('maxResults') || '5');

    const accessToken = req.headers.get('x-google-access-token');
    if (!accessToken) {
      return NextResponse.json({ error: 'Google access token required. Please sign in with Google.' }, { status: 401 });
    }

    // Search for messages matching query
    const searchRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!searchRes.ok) {
      return NextResponse.json({ error: 'Failed to search Gmail' }, { status: searchRes.status });
    }

    const searchData = await searchRes.json();
    const messageIds = searchData.messages?.map((m: any) => m.id) || [];

    if (messageIds.length === 0) {
      return NextResponse.json({ emails: [], message: 'No emails found matching query' });
    }

    // Fetch each message
    const emails = await Promise.all(
      messageIds.slice(0, maxResults).map(async (id: string) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!msgRes.ok) return null;
        const msg = await msgRes.json();

        const headers = msg.payload?.headers || [];
        const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

        // Extract body text
        let body = '';
        if (msg.payload?.body?.data) {
          body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
        } else if (msg.payload?.parts) {
          const textPart = msg.payload.parts.find((p: any) => p.mimeType === 'text/plain');
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
          }
        }

        return {
          subject: getHeader('Subject'),
          from: getHeader('From'),
          date: getHeader('Date'),
          snippet: msg.snippet,
          body: body.substring(0, 2000),
        };
      })
    );

    return NextResponse.json({ emails: emails.filter(Boolean) });
  } catch (error: any) {
    console.error('Gmail import error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import from Gmail' }, { status: 500 });
  }
}
