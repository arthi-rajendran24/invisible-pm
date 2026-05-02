import { validateInput } from '../utils/validation';

describe('Validation Utility', () => {
  it('should invalidate empty input', () => {
    expect(validateInput('').isValid).toBe(false);
    expect(validateInput('   ').isValid).toBe(false);
  });

  it('should validate normal input', () => {
    expect(validateInput('test message').isValid).toBe(true);
  });

  it('should invalidate too long input', () => {
    const longString = 'a'.repeat(10001);
    expect(validateInput(longString).isValid).toBe(false);
  });
});
