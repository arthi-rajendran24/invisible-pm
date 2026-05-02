import { NextResponse } from 'next/server';

interface SentimentRequest {
  text: string;
  channel: 'meeting' | 'chat' | 'email';
}

interface SentimentResponse {
  score: number;
  magnitude: number;
  label: 'positive' | 'neutral' | 'negative';
  channel: string;
}

export async function POST(req: Request) {
  try {
    const body: SentimentRequest = await req.json();
    const { text, channel } = body;

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback: simple heuristic sentiment
      return NextResponse.json(heuristicSentiment(text, channel));
    }

    const response = await fetch(
      `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: {
            type: 'PLAIN_TEXT',
            content: text.substring(0, 5000), // API limit
          },
          encodingType: 'UTF8',
        }),
      }
    );

    if (!response.ok) {
      console.warn('NL API error, falling back to heuristic:', response.status);
      return NextResponse.json(heuristicSentiment(text, channel));
    }

    const data = await response.json();
    const sentiment = data.documentSentiment;

    const label: SentimentResponse['label'] =
      sentiment.score > 0.15 ? 'positive' :
      sentiment.score < -0.15 ? 'negative' : 'neutral';

    return NextResponse.json({
      score: Math.round(sentiment.score * 100) / 100,
      magnitude: Math.round(sentiment.magnitude * 100) / 100,
      label,
      channel,
    } as SentimentResponse);

  } catch (error) {
    console.error('Sentiment API error:', error);
    return NextResponse.json({ error: 'Failed to analyze sentiment' }, { status: 500 });
  }
}

function heuristicSentiment(text: string, channel: string): SentimentResponse {
  const lower = text.toLowerCase();
  const positiveWords = ['great', 'good', 'excellent', 'ready', 'done', 'completed', 'on track', 'approved', 'happy', 'excited', 'perfect', 'love'];
  const negativeWords = ['broken', 'stuck', 'blocked', 'delayed', 'worried', 'risk', 'issue', 'problem', 'failed', 'missing', 'urgent', 'critical', 'concerned', 'anxiety'];

  let score = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) score += 0.15; });
  negativeWords.forEach(w => { if (lower.includes(w)) score -= 0.15; });
  score = Math.max(-1, Math.min(1, score));

  return {
    score: Math.round(score * 100) / 100,
    magnitude: Math.round(Math.abs(score) * 1.5 * 100) / 100,
    label: score > 0.15 ? 'positive' : score < -0.15 ? 'negative' : 'neutral',
    channel,
  };
}
