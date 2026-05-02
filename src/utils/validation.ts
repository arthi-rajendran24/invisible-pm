import { z } from 'zod';

/**
 * Zod schema for validating the incoming API request body.
 * Ensures all inputs are properly typed and within safe limits.
 */
export const AnalyzeRequestSchema = z.object({
  meeting: z
    .string()
    .max(10000, 'Meeting transcript exceeds 10,000 character limit.')
    .default(''),
  chat: z
    .string()
    .max(10000, 'Chat thread exceeds 10,000 character limit.')
    .default(''),
  email: z
    .string()
    .max(10000, 'Email content exceeds 10,000 character limit.')
    .default(''),
}).refine(
  (data) => data.meeting.trim() || data.chat.trim() || data.email.trim(),
  { message: 'At least one input field must contain text.' }
);

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

/**
 * Validates a single text input for basic safety checks.
 */
export function validateInput(text: string): { isValid: boolean; error?: string } {
  if (!text || text.trim() === '') {
    return { isValid: false, error: 'Input cannot be empty.' };
  }
  if (text.length > 10000) {
    return { isValid: false, error: 'Input is too long (max 10000 characters).' };
  }
  return { isValid: true };
}
