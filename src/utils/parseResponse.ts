import { AnalysisResult } from '@/types/analysis';

export function parseGeminiResponse(responseText: string): AnalysisResult | null {
  try {
    const match = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Failed to parse Gemini JSON:", error);
    return null;
  }
}
