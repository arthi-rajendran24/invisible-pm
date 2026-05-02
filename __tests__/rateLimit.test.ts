import { checkRateLimit, RateLimitConfig } from '../src/utils/rateLimit';

describe('checkRateLimit', () => {
  const config: RateLimitConfig = { maxRequests: 3, windowMs: 5000 };

  it('should allow the first request', () => {
    const result = checkRateLimit('test-ip-1', config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('should decrement remaining count with each request', () => {
    const result1 = checkRateLimit('test-ip-2', config);
    expect(result1.remaining).toBe(2);

    const result2 = checkRateLimit('test-ip-2', config);
    expect(result2.remaining).toBe(1);

    const result3 = checkRateLimit('test-ip-2', config);
    expect(result3.remaining).toBe(0);
  });

  it('should deny requests after limit is exceeded', () => {
    const ip = 'test-ip-3';
    checkRateLimit(ip, config);
    checkRateLimit(ip, config);
    checkRateLimit(ip, config);

    const result = checkRateLimit(ip, config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should track different IPs independently', () => {
    const ipA = 'test-ip-4a';
    const ipB = 'test-ip-4b';

    checkRateLimit(ipA, config);
    checkRateLimit(ipA, config);
    checkRateLimit(ipA, config);

    // ipA is exhausted
    expect(checkRateLimit(ipA, config).allowed).toBe(false);
    // ipB should still be allowed
    expect(checkRateLimit(ipB, config).allowed).toBe(true);
  });

  it('should return a positive resetInMs value', () => {
    const result = checkRateLimit('test-ip-5', config);
    expect(result.resetInMs).toBeGreaterThan(0);
    expect(result.resetInMs).toBeLessThanOrEqual(config.windowMs);
  });
});
