import type { Request, Response, NextFunction, RequestHandler } from "express";
import { hasInfraPermission, type InfrastructureRole } from "@shared/schema";
import { storage } from "./storage";

// Rate limiting store - in-memory for now
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Brute force protection store
const bruteForceStore = new Map<string, { attempts: number; lockUntil: number }>();

// Configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 100, // 100 requests per window
  infraMaxRequests: 30, // 30 requests for infrastructure endpoints
};

const BRUTE_FORCE_CONFIG = {
  maxAttempts: 5, // Max failed attempts
  lockDuration: 15 * 60 * 1000, // 15 minutes lockout
};

// Get user ID from request
function getUserId(req: Request): string | null {
  const user = req.user as any;
  return user?.claims?.sub || user?.id || null;
}

// Get client IP for rate limiting
function getClientKey(req: Request): string {
  const userId = getUserId(req);
  if (userId) return `user:${userId}`;
  
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  return `ip:${ip}`;
}

// Rate limiting middleware
export function rateLimit(maxRequests: number = RATE_LIMIT_CONFIG.maxRequests): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = getClientKey(req);
    const now = Date.now();
    
    let record = rateLimitStore.get(key);
    
    // Reset window if expired
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + RATE_LIMIT_CONFIG.windowMs };
      rateLimitStore.set(key, record);
      
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      res.setHeader('X-RateLimit-Reset', record.resetTime);
      
      return next();
    }
    
    // Check if already over limit before incrementing
    if (record.count >= maxRequests) {
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', record.resetTime);
      
      return res.status(429).json({
        error: 'تم تجاوز حد الطلبات / Rate limit exceeded',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }
    
    // Increment count
    record.count++;
    rateLimitStore.set(key, record);
    
    const remaining = Math.max(0, maxRequests - record.count);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', record.resetTime);
    
    next();
  };
}

// Infrastructure-specific rate limiting
export const infraRateLimit = rateLimit(RATE_LIMIT_CONFIG.infraMaxRequests);

// Brute force protection for sensitive operations
export function bruteForceProtection(operationKey: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientKey = getClientKey(req);
    const key = `${operationKey}:${clientKey}`;
    const now = Date.now();
    
    const record = bruteForceStore.get(key);
    
    if (record && now < record.lockUntil) {
      const retryAfter = Math.ceil((record.lockUntil - now) / 1000);
      return res.status(423).json({
        error: 'تم قفل الحساب مؤقتاً بسبب محاولات فاشلة متكررة / Account temporarily locked due to repeated failed attempts',
        retryAfter,
      });
    }
    
    // Store response handler to track failed attempts
    const originalJson = res.json.bind(res);
    res.json = function(body: any) {
      // Track failed attempts (4xx errors except 429)
      if (res.statusCode >= 400 && res.statusCode < 500 && res.statusCode !== 429) {
        const currentRecord = bruteForceStore.get(key) || { attempts: 0, lockUntil: 0 };
        currentRecord.attempts++;
        
        if (currentRecord.attempts >= BRUTE_FORCE_CONFIG.maxAttempts) {
          currentRecord.lockUntil = now + BRUTE_FORCE_CONFIG.lockDuration;
        }
        
        bruteForceStore.set(key, currentRecord);
      } else if (res.statusCode >= 200 && res.statusCode < 300) {
        // Reset on success
        bruteForceStore.delete(key);
      }
      
      return originalJson(body);
    };
    
    next();
  };
}

// Paths that require strict CSRF validation
const CSRF_PROTECTED_PATHS = [
  '/api/infrastructure/',
  '/api/sovereign/',
  '/api/owner/',
  '/api/admin/',
  '/api/ai/',
  '/api/nova/',
  '/api/deploy',
  '/api/hetzner/',
  '/api/servers/',
  '/api/secrets/',
  '/api/permissions/',
];

// CSRF token validation for state-changing operations
export function csrfProtection(strict: boolean = true): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only check for state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    const csrfToken = req.headers['x-csrf-token'] as string;
    const sessionToken = (req.session as any)?.csrfToken;
    
    // Generate token if not exists - always return in response header
    if (!sessionToken) {
      const newToken = crypto.randomUUID();
      (req.session as any).csrfToken = newToken;
      res.setHeader('X-CSRF-Token', newToken);
      
      // First request - allow through but require token next time
      if (!strict) {
        return next();
      }
    } else {
      // Always expose current token for client sync
      res.setHeader('X-CSRF-Token', sessionToken);
    }
    
    // Check if path requires strict CSRF validation
    const requiresStrictCSRF = CSRF_PROTECTED_PATHS.some(path => req.path.includes(path));
    
    // Validate token for protected routes
    if (requiresStrictCSRF && strict) {
      if (!csrfToken || csrfToken !== sessionToken) {
        console.warn(`[CSRF] Invalid token for ${req.method} ${req.path} from ${req.ip}`);
        return res.status(403).json({
          error: 'رمز CSRF غير صالح / Invalid CSRF token',
          errorAr: 'رمز CSRF غير صالح',
          code: 'csrf_invalid',
          hint: 'Refresh the page or include X-CSRF-Token header',
        });
      }
    } else if (!csrfToken && requiresStrictCSRF) {
      // Warn for any protected route without token
      console.warn(`[CSRF] Missing token for ${req.method} ${req.path}`);
    }
    
    next();
  };
}

// Global CSRF middleware for all state-changing routes
export const globalCsrfProtection = csrfProtection(true);

// Get user's infrastructure role
async function getUserInfraRole(userId: string): Promise<InfrastructureRole> {
  // Check if user is ROOT_OWNER
  const isRootOwner = process.env.ROOT_OWNER_ID === userId;
  if (isRootOwner) return 'owner';
  
  // Check user's role from users table or other source
  try {
    const user = await storage.getUser(userId);
    if (user?.role === 'admin') return 'admin';
    if (user?.role === 'owner') return 'owner';
  } catch (error) {
    console.error('[InfraRBAC] Error checking user role:', error);
  }
  
  return 'viewer'; // Default to viewer for authenticated users
}

// RBAC middleware for infrastructure endpoints
export function requireInfraPermission(permission: string): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({
        error: 'غير مصرح / Unauthorized',
      });
    }
    
    try {
      const role = await getUserInfraRole(userId);
      
      // Attach role to request for downstream use
      (req as any).infraRole = role;
      
      if (!hasInfraPermission(role, permission)) {
        // Log unauthorized access attempt
        await storage.createInfrastructureAuditLog({
          userId,
          userRole: role,
          userEmail: (req.user as any)?.claims?.email || 'unknown',
          userIp: req.ip || null,
          action: `access_denied:${permission}`,
          actionCategory: 'security',
          targetType: 'permission',
          targetId: permission,
          targetName: permission,
          success: false,
          errorMessage: `Role ${role} lacks permission ${permission}`,
        });
        
        return res.status(403).json({
          error: 'ليس لديك صلاحية لهذا الإجراء / You do not have permission for this action',
          requiredPermission: permission,
          currentRole: role,
        });
      }
      
      next();
    } catch (error) {
      console.error('[InfraRBAC] Permission check error:', error);
      return res.status(500).json({
        error: 'خطأ في التحقق من الصلاحيات / Permission check error',
      });
    }
  };
}

// Convenience middlewares for common permissions
export const requireServersRead = requireInfraPermission('servers:read');
export const requireServersControl = requireInfraPermission('servers:control');
export const requireProvidersRead = requireInfraPermission('providers:read');
export const requireProvidersManage = requireInfraPermission('providers:manage');
export const requireTokensManage = requireInfraPermission('tokens:manage');
export const requireLogsRead = requireInfraPermission('logs:read');

// Combined middleware for infrastructure routes with strict CSRF
export function infraSecurityChain(...permissions: string[]): RequestHandler[] {
  const middlewares: RequestHandler[] = [
    infraRateLimit,
    csrfProtection(true), // Strict CSRF enforcement
  ];
  
  permissions.forEach(perm => {
    middlewares.push(requireInfraPermission(perm));
  });
  
  return middlewares;
}

// Lenient security chain for public/read-only endpoints only
export function infraSecurityChainLenient(...permissions: string[]): RequestHandler[] {
  const middlewares: RequestHandler[] = [
    infraRateLimit,
    csrfProtection(false), // Lenient for read-only operations
  ];
  
  permissions.forEach(perm => {
    middlewares.push(requireInfraPermission(perm));
  });
  
  return middlewares;
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  
  // Clean rate limit store
  Array.from(rateLimitStore.entries()).forEach(([key, record]) => {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  });
  
  // Clean brute force store
  Array.from(bruteForceStore.entries()).forEach(([key, record]) => {
    if (now > record.lockUntil + BRUTE_FORCE_CONFIG.lockDuration) {
      bruteForceStore.delete(key);
    }
  });
}, 60 * 1000); // Run every minute
