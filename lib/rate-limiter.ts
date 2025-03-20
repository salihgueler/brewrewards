/**
 * Simple in-memory rate limiter
 * In a production environment, this would be replaced with a Redis-based implementation
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitRecord>;
  
  private constructor() {
    this.limits = new Map();
    
    // Clean up expired records periodically
    setInterval(() => this.cleanup(), 60000); // Run every minute
  }
  
  /**
   * Get the singleton instance of the RateLimiter
   */
  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }
  
  /**
   * Check if a key has exceeded its rate limit
   * @param key - The key to check (e.g., IP address, user ID)
   * @param limit - The maximum number of requests allowed
   * @param windowMs - The time window in milliseconds
   * @returns Object containing whether the request is allowed and remaining attempts
   */
  public check(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: Date } {
    const now = Date.now();
    const record = this.limits.get(key);
    
    // If no record exists or the record has expired, create a new one
    if (!record || record.resetAt <= now) {
      const resetAt = now + windowMs;
      this.limits.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt: new Date(resetAt) };
    }
    
    // Check if the limit has been exceeded
    if (record.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: new Date(record.resetAt) };
    }
    
    // Increment the counter
    record.count += 1;
    return { allowed: true, remaining: limit - record.count, resetAt: new Date(record.resetAt) };
  }
  
  /**
   * Clean up expired records
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.limits.entries()) {
      if (record.resetAt <= now) {
        this.limits.delete(key);
      }
    }
  }
}

/**
 * Rate limit configurations for different actions
 */
export const RATE_LIMITS = {
  LOGIN: {
    limit: 5, // 5 attempts
    windowMs: 60000, // 1 minute
  },
  PASSWORD_RESET: {
    limit: 3, // 3 attempts
    windowMs: 300000, // 5 minutes
  },
  API_GENERAL: {
    limit: 100, // 100 requests
    windowMs: 60000, // 1 minute
  },
  API_SENSITIVE: {
    limit: 20, // 20 requests
    windowMs: 60000, // 1 minute
  },
};

/**
 * Middleware to apply rate limiting
 * @param key - The key to use for rate limiting (e.g., IP address, user ID)
 * @param limitConfig - The rate limit configuration to apply
 * @returns Object containing whether the request is allowed and rate limit information
 */
export function checkRateLimit(key: string, limitConfig: { limit: number; windowMs: number }): {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
} {
  const limiter = RateLimiter.getInstance();
  return limiter.check(key, limitConfig.limit, limitConfig.windowMs);
}
