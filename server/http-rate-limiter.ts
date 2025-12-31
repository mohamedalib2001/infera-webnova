/**
 * INFERA WebNova - HTTP Request Rate Limiter
 * محدد معدل طلبات HTTP
 * 
 * Designed for 5 million users with tiered rate limiting
 * مصمم لـ 5 مليون مستخدم مع تحديد معدل متدرج
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

const TIER_MULTIPLIERS: Record<string, number> = {
  free: 1,
  basic: 2,
  pro: 5,
  enterprise: 10,
  sovereign: 20,
  ROOT_OWNER: 100,
};

const ENDPOINT_LIMITS: Record<string, { windowMs: number; maxRequests: number }> = {
  'auth': { windowMs: 60000, maxRequests: 10 },
  'api': { windowMs: 60000, maxRequests: 100 },
  'search': { windowMs: 60000, maxRequests: 30 },
  'ai': { windowMs: 60000, maxRequests: 20 },
  'upload': { windowMs: 3600000, maxRequests: 50 },
  'default': { windowMs: 60000, maxRequests: 200 },
};

class HttpRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private stats = { totalRequests: 0, blockedRequests: 0 };
  
  constructor() {
    setInterval(() => this.cleanup(), 60000);
  }
  
  isRateLimited(key: string, config: RateLimitConfig): { limited: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.store.get(key);
    this.stats.totalRequests++;
    
    if (!entry || now >= entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + config.windowMs });
      return { limited: false, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
    }
    
    entry.count++;
    if (entry.count > config.maxRequests) {
      this.stats.blockedRequests++;
      return { limited: true, remaining: 0, resetAt: entry.resetAt };
    }
    
    return { limited: false, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
  }
  
  createMiddleware(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const ip = this.getClientIP(req);
      const userTier = (req as any).user?.role || 'free';
      const multiplier = TIER_MULTIPLIERS[userTier] || 1;
      
      const result = this.isRateLimited(ip, { ...config, maxRequests: config.maxRequests * multiplier });
      
      res.setHeader('X-RateLimit-Limit', config.maxRequests * multiplier);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));
      
      if (result.limited) {
        res.setHeader('Retry-After', Math.ceil((result.resetAt - Date.now()) / 1000));
        return res.status(429).json({
          success: false,
          error: config.message || 'Too many requests',
          errorAr: 'طلبات كثيرة جداً',
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
        });
      }
      next();
    };
  }
  
  forEndpoint(endpoint: string) {
    const config = ENDPOINT_LIMITS[endpoint] || ENDPOINT_LIMITS.default;
    return this.createMiddleware({ ...config, message: `Rate limit exceeded for ${endpoint}` });
  }
  
  private getClientIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  }
  
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) this.store.delete(key);
    }
  }
  
  getStats() {
    return { ...this.stats, uniqueClients: this.store.size };
  }
}

export const httpRateLimiter = new HttpRateLimiter();
export const globalRateLimit = httpRateLimiter.createMiddleware({ windowMs: 60000, maxRequests: 200 });
export const authRateLimit = httpRateLimiter.forEndpoint('auth');
export const apiRateLimit = httpRateLimiter.forEndpoint('api');
export const aiRateLimit = httpRateLimiter.forEndpoint('ai');

console.log('[HttpRateLimiter] Initialized for high-traffic capacity');
