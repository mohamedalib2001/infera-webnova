import { Request, Response, NextFunction } from "express";
import { apiKeyService } from "./api-key-service";
import type { ApiKey } from "@shared/schema";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKey;
      apiKeyId?: string;
      tenantId?: string;
    }
  }
}

// Rate limit tracking (in-memory for now, can be moved to Redis)
const rateLimitStore = new Map<string, {
  minuteCount: number;
  hourCount: number;
  dayCount: number;
  minuteReset: number;
  hourReset: number;
  dayReset: number;
}>();

interface ApiKeyAuthOptions {
  requiredScopes?: string[];
  requireAnyScope?: string[];
}

export function requireApiKey(options: ApiKeyAuthOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Missing or invalid Authorization header',
        errorAr: 'ترويسة التفويض مفقودة أو غير صالحة',
        code: 'MISSING_AUTH_HEADER',
      });
    }

    const apiKeyPlain = authHeader.substring(7);

    // Validate API key
    const validation = await apiKeyService.validateApiKey(apiKeyPlain);

    if (!validation.valid || !validation.apiKey) {
      await logFailedAuth(req, validation.error || 'Invalid key');
      return res.status(401).json({
        error: validation.error || 'Invalid API key',
        errorAr: validation.errorAr || 'مفتاح API غير صالح',
        code: 'INVALID_API_KEY',
      });
    }

    const apiKey = validation.apiKey;

    // Check rate limits
    const rateLimitResult = checkRateLimit(apiKey);
    if (!rateLimitResult.allowed) {
      await apiKeyService.logUsage({
        apiKeyId: apiKey.id,
        tenantId: apiKey.tenantId,
        endpoint: req.path,
        method: req.method,
        statusCode: 429,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        isRateLimited: true,
        errorMessage: 'Rate limit exceeded',
      });

      return res.status(429).json({
        error: 'Rate limit exceeded',
        errorAr: 'تم تجاوز حد الاستخدام',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: rateLimitResult.retryAfter,
      });
    }

    // Check required scopes
    if (options.requiredScopes && options.requiredScopes.length > 0) {
      const hasAllScopes = options.requiredScopes.every(scope => 
        apiKeyService.hasScope(apiKey, scope)
      );
      if (!hasAllScopes) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          errorAr: 'صلاحيات غير كافية',
          code: 'INSUFFICIENT_SCOPES',
          requiredScopes: options.requiredScopes,
        });
      }
    }

    // Check any scope
    if (options.requireAnyScope && options.requireAnyScope.length > 0) {
      const hasAnyScope = apiKeyService.hasAnyScope(apiKey, options.requireAnyScope);
      if (!hasAnyScope) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          errorAr: 'صلاحيات غير كافية',
          code: 'INSUFFICIENT_SCOPES',
          requiredScopes: options.requireAnyScope,
        });
      }
    }

    // Attach to request
    req.apiKey = apiKey;
    req.apiKeyId = apiKey.id;
    req.tenantId = apiKey.tenantId;

    // Log usage on response finish
    res.on('finish', async () => {
      const responseTime = Date.now() - startTime;
      await apiKeyService.logUsage({
        apiKeyId: apiKey.id,
        tenantId: apiKey.tenantId,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTimeMs: responseTime,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        isRateLimited: false,
      });
    });

    next();
  };
}

function checkRateLimit(apiKey: ApiKey): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const keyId = apiKey.id;

  let limits = rateLimitStore.get(keyId);
  if (!limits) {
    limits = {
      minuteCount: 0,
      hourCount: 0,
      dayCount: 0,
      minuteReset: now + 60000,
      hourReset: now + 3600000,
      dayReset: now + 86400000,
    };
    rateLimitStore.set(keyId, limits);
  }

  // Reset counters if needed
  if (now > limits.minuteReset) {
    limits.minuteCount = 0;
    limits.minuteReset = now + 60000;
  }
  if (now > limits.hourReset) {
    limits.hourCount = 0;
    limits.hourReset = now + 3600000;
  }
  if (now > limits.dayReset) {
    limits.dayCount = 0;
    limits.dayReset = now + 86400000;
  }

  // Check limits
  if (limits.minuteCount >= apiKey.rateLimitPerMinute) {
    return { allowed: false, retryAfter: Math.ceil((limits.minuteReset - now) / 1000) };
  }
  if (limits.hourCount >= apiKey.rateLimitPerHour) {
    return { allowed: false, retryAfter: Math.ceil((limits.hourReset - now) / 1000) };
  }
  if (limits.dayCount >= apiKey.rateLimitPerDay) {
    return { allowed: false, retryAfter: Math.ceil((limits.dayReset - now) / 1000) };
  }

  // Increment counters
  limits.minuteCount++;
  limits.hourCount++;
  limits.dayCount++;

  return { allowed: true };
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
  }
  return req.socket.remoteAddress || 'unknown';
}

async function logFailedAuth(req: Request, reason: string): Promise<void> {
  await apiKeyService.logAuditEvent({
    tenantId: 'unknown',
    action: 'AUTH_FAILED',
    actionAr: 'فشل المصادقة',
    details: {
      reason,
      endpoint: req.path,
      method: req.method,
    },
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'],
    severity: 'warning',
  });
}

// Tenant isolation middleware
export function requireTenantMatch() {
  return (req: Request, res: Response, next: NextFunction) => {
    const paramTenantId = req.params.tenantId || req.body?.tenantId;
    
    if (paramTenantId && req.tenantId && paramTenantId !== req.tenantId) {
      return res.status(403).json({
        error: 'Cross-tenant access denied',
        errorAr: 'الوصول عبر المنصات مرفوض',
        code: 'CROSS_TENANT_ACCESS_DENIED',
      });
    }

    next();
  };
}
