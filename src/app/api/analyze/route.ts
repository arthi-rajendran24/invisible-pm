import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generatePrompt } from '@/utils/geminiPrompt';
import { fallbackMockData } from '@/utils/fallbackMockData';
import { parseGeminiResponse } from '@/utils/parseResponse';
import { validateInput } from '@/utils/validation';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { meeting, chat, email } = body;

    // Validate inputs
    const inputs = [meeting, chat, email];
    for (const input of inputs) {
      if (input) {
        const { isValid, error } = validateInput(input);
        if (!isValid) {
          return NextResponse.json({ error }, { status: 400 });
        }
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("No GEMINI_API_KEY found, returning fallback mock data.");
      return NextResponse.json(fallbackMockData);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = generatePrompt(meeting || '', chat || '', email || '');

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const parsedData = parseGeminiResponse(responseText);

    if (!parsedData) {
      console.warn("Failed to parse Gemini response. Returning fallback mock data.");
      return NextResponse.json(fallbackMockData);
    }

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("API error:", error);
    // If the API call fails or times out, return the fallback data to maintain a good user experience in the demo
    return NextResponse.json(fallbackMockData);
  }
}
