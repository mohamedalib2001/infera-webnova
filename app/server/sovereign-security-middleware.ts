/**
 * Sovereign Security Middleware
 * الحماية الأمنية السيادية
 * 
 * Zero-Tolerance Security for Intelligence/Government/Healthcare Systems
 * حماية صفر تسامح للأنظمة الاستخباراتية والحكومية والصحية
 * 
 * @security CRITICAL - This module is the first line of defense
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// ==================== CONSTANTS ====================

const ROLE_HIERARCHY: Record<string, number> = {
  'ROOT_OWNER': 100,
  'owner': 90,
  'sovereign': 80,
  'admin': 50,
  'user': 10,
  'guest': 0
};

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const SOVEREIGN_RATE_LIMIT = 10; // 10 requests per minute for sovereign endpoints
const MAX_PAYLOAD_SIZE = 10240; // 10KB

// In-memory rate limiting (production: use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Concurrency locks for critical operations
const operationLocks = new Map<string, boolean>();

// ==================== TYPES ====================

export interface AuthenticatedRequest extends Request {
  sovereignAuth?: {
    userId: string;
    userRole: string;
    roleLevel: number;
    sessionId: string;
    timestamp: number;
  };
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  actorId: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  payload?: string;
  payloadHash: string;
  outcome: 'success' | 'failure' | 'denied';
  errorMessage?: string;
  clientIp: string;
  userAgent: string;
  signature: string;
}

// ==================== CORE FUNCTIONS ====================

/**
 * Extract authenticated user ID from session ONLY
 * NEVER trust client-supplied identifiers
 */
export function getAuthenticatedUserId(req: Request): string | null {
  // Priority 1: Replit Auth via Passport
  if (req.user && (req.user as any).claims?.sub) {
    return (req.user as any).claims.sub;
  }
  
  // Priority 2: Custom session (server-side only)
  if (req.session && (req.session as any).userId) {
    return (req.session as any).userId;
  }
  
  // NO FALLBACKS - Headers can be spoofed
  return null;
}

/**
 * Get role level from hierarchy
 */
export function getRoleLevel(role: string): number {
  return ROLE_HIERARCHY[role] || 0;
}

/**
 * Generate HMAC signature for audit entries
 */
function generateAuditSignature(entry: Omit<AuditEntry, 'signature'>): string {
  const secret = process.env.SESSION_SECRET || 'sovereign-audit-secret';
  const data = JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp.toISOString(),
    actorId: entry.actorId,
    action: entry.action,
    payloadHash: entry.payloadHash,
    outcome: entry.outcome
  });
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Generate hash of payload for tamper detection
 */
function hashPayload(payload: any): string {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Generate unique audit ID
 */
function generateAuditId(): string {
  return `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// ==================== MIDDLEWARE ====================

/**
 * MIDDLEWARE: Require authenticated user
 * Must be applied to ALL sovereign endpoints
 */
export function requireAuthenticatedUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userId = getAuthenticatedUserId(req);
  
  if (!userId) {
    logAudit(req, 'AUTH_FAILED', 'session', undefined, null, 'denied', 'No authenticated session');
    return res.status(401).json({
      success: false,
      error: 'Authentication required - please login',
      errorAr: 'المصادقة مطلوبة - يرجى تسجيل الدخول',
      code: 'AUTH_REQUIRED'
    });
  }
  
  // Populate sovereign auth context
  req.sovereignAuth = {
    userId,
    userRole: 'pending', // Will be set by requireRole
    roleLevel: 0,
    sessionId: (req.session as any)?.id || 'unknown',
    timestamp: Date.now()
  };
  
  next();
}

/**
 * MIDDLEWARE: Require minimum role level
 * @param minRole Minimum role required (e.g., 'sovereign', 'owner')
 */
export function requireRole(minRole: string) {
  const minLevel = getRoleLevel(minRole);
  
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.sovereignAuth) {
      return res.status(401).json({
        success: false,
        error: 'Authentication context missing',
        errorAr: 'سياق المصادقة مفقود',
        code: 'AUTH_CONTEXT_MISSING'
      });
    }
    
    try {
      // Fetch user role from database - NEVER trust client
      const [user] = await db.select().from(users).where(eq(users.id, req.sovereignAuth.userId));
      
      if (!user) {
        logAudit(req, 'USER_NOT_FOUND', 'users', req.sovereignAuth.userId, null, 'denied');
        return res.status(403).json({
          success: false,
          error: 'User not found in system',
          errorAr: 'المستخدم غير موجود في النظام',
          code: 'USER_NOT_FOUND'
        });
      }
      
      const userRole = user.role || 'user';
      const userLevel = getRoleLevel(userRole);
      
      // Update auth context with verified role
      req.sovereignAuth.userRole = userRole;
      req.sovereignAuth.roleLevel = userLevel;
      
      if (userLevel < minLevel) {
        logAudit(req, 'ROLE_INSUFFICIENT', 'authorization', undefined, user.id, 'denied', 
          `Required: ${minRole} (${minLevel}), Has: ${userRole} (${userLevel})`);
        return res.status(403).json({
          success: false,
          error: `Requires ${minRole} authority or higher`,
          errorAr: `يتطلب صلاحية ${minRole} أو أعلى`,
          code: 'ROLE_INSUFFICIENT',
          required: minRole,
          current: userRole
        });
      }
      
      next();
    } catch (error: any) {
      logAudit(req, 'ROLE_CHECK_ERROR', 'authorization', undefined, null, 'failure', error.message);
      return res.status(500).json({
        success: false,
        error: 'Authorization check failed',
        errorAr: 'فشل التحقق من الصلاحيات',
        code: 'AUTH_CHECK_ERROR'
      });
    }
  };
}

/**
 * MIDDLEWARE: Rate limiting for sovereign endpoints
 */
export function rateLimitSovereign(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.sovereignAuth?.userId || req.ip || 'anonymous';
  const now = Date.now();
  
  const existing = rateLimitStore.get(userId);
  
  if (existing) {
    if (now > existing.resetTime) {
      // Reset window
      rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else if (existing.count >= SOVEREIGN_RATE_LIMIT) {
      logAudit(req, 'RATE_LIMIT_EXCEEDED', 'rate_limit', undefined, userId, 'denied');
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded - please wait',
        errorAr: 'تم تجاوز الحد المسموح - يرجى الانتظار',
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil((existing.resetTime - now) / 1000)
      });
    } else {
      existing.count++;
    }
  } else {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  }
  
  next();
}

/**
 * MIDDLEWARE: Payload size limit
 */
export function payloadSizeLimit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  
  if (contentLength > MAX_PAYLOAD_SIZE) {
    logAudit(req, 'PAYLOAD_TOO_LARGE', 'validation', undefined, null, 'denied', 
      `Size: ${contentLength}, Max: ${MAX_PAYLOAD_SIZE}`);
    return res.status(413).json({
      success: false,
      error: 'Payload too large',
      errorAr: 'حجم البيانات كبير جداً',
      code: 'PAYLOAD_TOO_LARGE',
      maxSize: MAX_PAYLOAD_SIZE
    });
  }
  
  next();
}

/**
 * MIDDLEWARE: Acquire lock for critical operations
 */
export function requireOperationLock(operationName: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (operationLocks.get(operationName)) {
      logAudit(req, 'OPERATION_LOCKED', operationName, undefined, req.sovereignAuth?.userId, 'denied');
      return res.status(409).json({
        success: false,
        error: 'Operation in progress - please wait',
        errorAr: 'العملية قيد التنفيذ - يرجى الانتظار',
        code: 'OPERATION_LOCKED',
        operation: operationName
      });
    }
    
    // Acquire lock
    operationLocks.set(operationName, true);
    
    // Release lock on response finish
    res.on('finish', () => {
      operationLocks.delete(operationName);
    });
    
    next();
  };
}

// ==================== AUDIT LOGGING ====================

const auditLog: AuditEntry[] = [];

/**
 * Log sovereign audit entry with HMAC signature
 */
export function logAudit(
  req: Request,
  action: string,
  resource: string,
  resourceId?: string,
  actorId?: string | null,
  outcome: 'success' | 'failure' | 'denied' = 'success',
  errorMessage?: string
) {
  const authenticatedReq = req as AuthenticatedRequest;
  const actor = actorId || authenticatedReq.sovereignAuth?.userId || 'anonymous';
  const actorRole = authenticatedReq.sovereignAuth?.userRole || 'unknown';
  
  const entryBase: Omit<AuditEntry, 'signature'> = {
    id: generateAuditId(),
    timestamp: new Date(),
    actorId: actor,
    actorRole,
    action,
    resource,
    resourceId,
    payload: JSON.stringify(req.body || {}).substring(0, 500),
    payloadHash: hashPayload(req.body),
    outcome,
    errorMessage,
    clientIp: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown'
  };
  
  const entry: AuditEntry = {
    ...entryBase,
    signature: generateAuditSignature(entryBase)
  };
  
  auditLog.push(entry);
  
  // Keep last 10000 entries in memory
  if (auditLog.length > 10000) {
    auditLog.shift();
  }
  
  // Log to console for critical events
  if (outcome === 'denied' || outcome === 'failure') {
    console.log(`[SOVEREIGN AUDIT] ${outcome.toUpperCase()}: ${action} on ${resource} by ${actor} - ${errorMessage || 'no details'}`);
  }
  
  return entry;
}

/**
 * Get recent audit entries (owner only)
 */
export function getAuditLog(limit: number = 100): AuditEntry[] {
  return auditLog.slice(-limit);
}

/**
 * Verify audit entry signature (tamper detection)
 */
export function verifyAuditSignature(entry: AuditEntry): boolean {
  const { signature, ...entryWithoutSig } = entry;
  const expectedSignature = generateAuditSignature(entryWithoutSig);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Strip client-supplied sensitive fields from request body
 */
export function stripClientIds(body: any): any {
  const sensitiveFields = [
    'userId', 'createdBy', 'managedBy', 'activatedBy', 'deactivatedBy',
    'approvedBy', 'rejectedBy', 'actorId', 'ownerId', 'triggeredBy'
  ];
  
  const cleaned = { ...body };
  for (const field of sensitiveFields) {
    delete cleaned[field];
  }
  return cleaned;
}

/**
 * Sanitize string input (prevent CRLF injection)
 */
export function sanitizeString(input: string): string {
  return input.replace(/[\r\n]/g, ' ').trim();
}

/**
 * Create combined middleware chain for sovereign endpoints
 */
export function sovereignEndpoint(minRole: string = 'sovereign', lockOperation?: string) {
  const middlewares = [
    payloadSizeLimit,
    rateLimitSovereign,
    requireAuthenticatedUser,
    requireRole(minRole)
  ];
  
  if (lockOperation) {
    middlewares.push(requireOperationLock(lockOperation));
  }
  
  return middlewares;
}

export default {
  getAuthenticatedUserId,
  requireAuthenticatedUser,
  requireRole,
  rateLimitSovereign,
  payloadSizeLimit,
  requireOperationLock,
  sovereignEndpoint,
  logAudit,
  getAuditLog,
  verifyAuditSignature,
  stripClientIds,
  sanitizeString,
  getRoleLevel
};
