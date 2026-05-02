export function validateInput(text: string): { isValid: boolean; error?: string } {
  if (!text || text.trim() === '') {
    return { isValid: false, error: 'Input cannot be empty.' };
  }
  if (text.length > 10000) {
    return { isValid: false, error: 'Input is too long (max 10000 characters).' };
  }
  return { isValid: true };
}
