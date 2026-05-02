import { validateInput, AnalyzeRequestSchema } from '../src/utils/validation';

describe('validateInput', () => {
  it('should invalidate empty string', () => {
    expect(validateInput('').isValid).toBe(false);
    expect(validateInput('').error).toBe('Input cannot be empty.');
  });

  it('should invalidate whitespace-only string', () => {
    expect(validateInput('   ').isValid).toBe(false);
  });

  it('should validate normal input', () => {
    expect(validateInput('Hello, this is a test message.').isValid).toBe(true);
    expect(validateInput('Hello, this is a test message.').error).toBeUndefined();
  });

  it('should invalidate input exceeding 10000 characters', () => {
    const longString = 'a'.repeat(10001);
    const result = validateInput(longString);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('10000');
  });

  it('should accept input at exactly 10000 characters', () => {
    const exactString = 'a'.repeat(10000);
    expect(validateInput(exactString).isValid).toBe(true);
  });
});

describe('AnalyzeRequestSchema (Zod)', () => {
  it('should accept valid input with all fields', () => {
    const result = AnalyzeRequestSchema.safeParse({
      meeting: 'Meeting notes here',
      chat: 'Chat thread here',
      email: 'Email content here',
    });
    expect(result.success).toBe(true);
  });

  it('should set defaults for missing fields', () => {
    const result = AnalyzeRequestSchema.safeParse({});
    // Should fail because at least one field must have content
    expect(result.success).toBe(false);
  });

  it('should reject if all fields are empty strings', () => {
    const result = AnalyzeRequestSchema.safeParse({
      meeting: '',
      chat: '',
      email: '',
    });
    expect(result.success).toBe(false);
  });

  it('should accept if at least one field has content', () => {
    const result = AnalyzeRequestSchema.safeParse({
      meeting: 'Some notes',
      chat: '',
      email: '',
    });
    expect(result.success).toBe(true);
  });

  it('should reject if meeting exceeds 10000 characters', () => {
    const result = AnalyzeRequestSchema.safeParse({
      meeting: 'a'.repeat(10001),
      chat: '',
      email: '',
    });
    expect(result.success).toBe(false);
  });
});
