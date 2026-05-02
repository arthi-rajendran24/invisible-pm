import { parseGeminiResponse } from '../utils/parseResponse';

describe('Parse Utility', () => {
  it('should parse valid JSON', () => {
    const validJson = '{"test": "data"}';
    expect(parseGeminiResponse(validJson)).toEqual({ test: 'data' });
  });

  it('should parse markdown wrapped JSON', () => {
    const markdownJson = '```json\n{"test": "data"}\n```';
    expect(parseGeminiResponse(markdownJson)).toEqual({ test: 'data' });
  });

  it('should return null for invalid JSON', () => {
    // Hide console.error for this test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(parseGeminiResponse('invalid')).toBeNull();
    jest.restoreAllMocks();
  });
});
