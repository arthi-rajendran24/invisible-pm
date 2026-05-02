import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_STT_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        transcript: '[Demo Mode] Audio transcription would appear here. Configure GOOGLE_CLOUD_API_KEY to enable Cloud Speech-to-Text.',
        demo: true,
      });
    }

    // Convert audio file to base64
    const buffer = await audioFile.arrayBuffer();
    const audioBytes = Buffer.from(buffer).toString('base64');

    // Call Cloud Speech-to-Text v2 (Chirp 2)
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
            model: 'chirp_2',
            enableAutomaticPunctuation: true,
          },
          audio: { content: audioBytes },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Speech-to-Text error:', errData);
      // Fallback: try default model
      const fallbackRes = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            config: { languageCode: 'en-US', enableAutomaticPunctuation: true },
            audio: { content: audioBytes },
          }),
        }
      );
      if (!fallbackRes.ok) {
        return NextResponse.json({ error: 'Speech-to-Text failed' }, { status: 500 });
      }
      const fallbackData = await fallbackRes.json();
      const transcript = fallbackData.results?.map((r: any) => r.alternatives?.[0]?.transcript).filter(Boolean).join(' ') || '';
      return NextResponse.json({ success: true, transcript, demo: false });
    }

    const data = await response.json();
    const transcript = data.results?.map((r: any) => r.alternatives?.[0]?.transcript).filter(Boolean).join(' ') || '';

    return NextResponse.json({ success: true, transcript, demo: false });
  } catch (error: any) {
    console.error('Transcribe error:', error);
    return NextResponse.json({ error: error.message || 'Transcription failed' }, { status: 500 });
  }
}
