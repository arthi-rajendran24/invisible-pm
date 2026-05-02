import { GoogleGenerativeAI } from '@google/generative-ai';
import { generatePrompt, generateSystemInstruction } from '@/utils/geminiPrompt';
import { fallbackMockData } from '@/utils/fallbackMockData';
import { parseGeminiResponse } from '@/utils/parseResponse';
import { AnalyzeRequestSchema } from '@/utils/validation';
import { checkRateLimit } from '@/utils/rateLimit';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    // Security: Validate Content-Type header
    const reqContentType = req.headers.get('content-type');
    if (!reqContentType || !reqContentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be application/json.' }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Security: Rate limit by client IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const { allowed, resetInMs } = checkRateLimit(clientIp, { maxRequests: 10, windowMs: 60_000 });
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: `Rate limit exceeded. Try again in ${Math.ceil(resetInMs / 1000)}s.` }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(resetInMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await req.json();

    // Validate inputs with Zod schema (single source of truth for validation)
    const parseResult = AnalyzeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Invalid input.';
      return new Response(JSON.stringify({ error: firstError }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { meeting, chat, email } = parseResult.data;
    const { sentimentContext } = body;

    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found, returning fallback mock data via SSE.");
      return createFallbackSSEResponse();
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: generateSystemInstruction(),
    });

    const prompt = generatePrompt(meeting || '', chat || '', email || '', sentimentContext);

    // Use streaming API
    const result = await model.generateContentStream(prompt);

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullText = '';

        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;

            // Check for agent completion markers in accumulated text
            const agentMatches = fullText.matchAll(/<<<AGENT:(.*?)>>>([\s\S]*?)<<<END_AGENT>>>/g);
            const processedAgents = new Set<string>();

            for (const match of agentMatches) {
              const agentName = match[1].trim();
              if (processedAgents.has(agentName)) continue;
              processedAgents.add(agentName);

              try {
                const agentJson = match[2].trim();
                const agentData = JSON.parse(agentJson);
                const sseEvent = `event: agent_complete\ndata: ${JSON.stringify(agentData)}\n\n`;
                controller.enqueue(encoder.encode(sseEvent));
              } catch {
                // If JSON parse fails, still send the agent name
                const sseEvent = `event: agent_complete\ndata: ${JSON.stringify({
                  agent: agentName,
                  status: 'completed',
                  output_summary: 'Processing complete',
                })}\n\n`;
                controller.enqueue(encoder.encode(sseEvent));
              }
            }

            // Check for final result
            const resultMatch = fullText.match(/<<<RESULT>>>([\s\S]*?)<<<END_RESULT>>>/);
            if (resultMatch) {
              try {
                const resultJson = JSON.parse(resultMatch[1].trim());
                const sseEvent = `event: result\ndata: ${JSON.stringify(resultJson)}\n\n`;
                controller.enqueue(encoder.encode(sseEvent));
              } catch {
                // Will try to parse at the end
              }
            }
          }

          // If no result was emitted via delimiters, try to parse the full text
          if (!fullText.includes('<<<RESULT>>>')) {
            const parsed = parseGeminiResponse(fullText);
            if (parsed) {
              const sseEvent = `event: result\ndata: ${JSON.stringify(parsed)}\n\n`;
              controller.enqueue(encoder.encode(sseEvent));
            } else {
              console.warn('Failed to parse streaming response, returning fallback');
              const sseEvent = `event: result\ndata: ${JSON.stringify(fallbackMockData)}\n\n`;
              controller.enqueue(encoder.encode(sseEvent));
            }
          }

          controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
        } catch (err) {
          console.error('Stream error:', err);
          const sseEvent = `event: error\ndata: ${JSON.stringify({ error: 'Stream processing failed' })}\n\n`;
          controller.enqueue(encoder.encode(sseEvent));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process data with AI agents. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function createFallbackSSEResponse(): Response {
  const encoder = new TextEncoder();
  const agents = fallbackMockData.agent_timeline;

  const stream = new ReadableStream({
    async start(controller) {
      // Simulate agent-by-agent completion with delays
      for (let i = 0; i < agents.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        const sseEvent = `event: agent_complete\ndata: ${JSON.stringify(agents[i])}\n\n`;
        controller.enqueue(encoder.encode(sseEvent));
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      const resultEvent = `event: result\ndata: ${JSON.stringify(fallbackMockData)}\n\n`;
      controller.enqueue(encoder.encode(resultEvent));
      controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
