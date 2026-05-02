import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const accessToken = req.headers.get('x-google-access-token');
    if (!accessToken) {
      return NextResponse.json({ error: 'Google access token required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '5');

    // Fetch recent calendar events
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      `timeMin=${weekAgo.toISOString()}&timeMax=${now.toISOString()}&maxResults=${maxResults}` +
      `&singleEvents=true&orderBy=startTime`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!calRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: calRes.status });
    }

    const calData = await calRes.json();
    const events = (calData.items || []).map((event: any) => ({
      summary: event.summary || 'Untitled Event',
      start: event.start?.dateTime || event.start?.date || '',
      end: event.end?.dateTime || event.end?.date || '',
      description: event.description || '',
      attendees: (event.attendees || []).map((a: any) => a.email),
      meetLink: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || '',
      hasTranscript: !!(event.attachments?.some((a: any) => a.title?.includes('Transcript'))),
    }));

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Calendar import error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import calendar' }, { status: 500 });
  }
}
