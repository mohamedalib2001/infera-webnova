/**
 * INFERA WebNova - Secrets Vault Routes
 * مسارات خزنة الأسرار
 * 
 * REST API for secure secrets management
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import crypto from "crypto";
import { secretsVaultService } from "./secrets-vault-service";

const router = Router();

// Middleware to extract audit context
function getAuditContext(req: Request) {
  const user = (req as any).user;
  // Service identity can be passed via X-Service-ID header for service-to-service auth
  const serviceId = req.headers["x-service-id"] as string | undefined;
  return {
    userId: user?.id || "anonymous",
    userRole: user?.role,
    serviceId, // For allowedServices enforcement
    sessionId: (req as any).sessionID,
    ipAddress: req.ip || (req.headers["x-forwarded-for"] as string),
    userAgent: req.headers["user-agent"],
  };
}

// List of trusted service identifiers for service-to-service authentication
const TRUSTED_SERVICES = [
  "execution-engine",
  "memory-service", 
  "integration-layer",
  "deployment-service",
  "ai-orchestrator",
  "platform-orchestrator",
];

/**
 * Validate service-to-service authentication
 * Services must provide:
 * - X-Service-ID: Service identifier
 * - X-Service-Signature: HMAC-SHA256 signature of: serviceId + timestamp
 * - X-Service-Timestamp: Unix timestamp (must be within 5 minutes)
 */
function validateServiceAuth(req: Request): boolean {
  const serviceId = req.headers["x-service-id"] as string | undefined;
  const signature = req.headers["x-service-signature"] as string | undefined;
  const timestamp = req.headers["x-service-timestamp"] as string | undefined;
  
  if (!serviceId || !signature || !timestamp) {
    return false;
  }
  
  // Check if service is in trusted list
  if (!TRUSTED_SERVICES.includes(serviceId)) {
    return false;
  }
  
  // Validate timestamp is within 5 minutes
  const requestTime = parseInt(timestamp, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  if (isNaN(requestTime) || Math.abs(currentTime - requestTime) > 300) {
    return false;
  }
  
  // Validate HMAC signature using SERVICE_AUTH_SECRET
  const secret = process.env.SERVICE_AUTH_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    return false;
  }
  
  const expectedPayload = `${serviceId}:${timestamp}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(expectedPayload)
    .digest("hex");
  
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}

// Require sovereign/owner role OR authenticated service for vault access
function requireVaultAccess(req: Request, res: Response, next: NextFunction) {
  const role = (req as any).user?.role;
  
  // Allow if user has privileged role
  if (role && ["ROOT_OWNER", "sovereign", "owner", "admin"].includes(role)) {
    return next();
  }
  
  // Allow if request is from an authenticated trusted service
  // Requires valid HMAC signature for service-to-service auth
  if (validateServiceAuth(req)) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: "Vault access denied / الوصول إلى الخزنة مرفوض",
    errorAr: "الوصول إلى الخزنة مرفوض",
  });
}

// Validation schemas
const createSecretSchema = z.object({
  name: z.string().min(1).max(255),
  path: z.string().min(1).max(500).regex(/^[a-zA-Z0-9\-_\/\.]+$/),
  value: z.string().min(1),
  scope: z.enum(["global", "organization", "project", "environment"]).optional(),
  secretType: z.enum(["generic", "api-key", "password", "certificate", "token"]).optional(),
  projectId: z.string().optional(),
  environment: z.string().optional(),
  description: z.string().optional(),
  rotationPolicy: z.enum(["none", "weekly", "monthly", "quarterly", "yearly"]).optional(),
  tags: z.record(z.string()).optional(),
  allowedServices: z.array(z.string()).optional(),
  allowedRoles: z.array(z.string()).optional(),
});

const updateSecretSchema = z.object({
  value: z.string().min(1).optional(),
  description: z.string().optional(),
  rotationPolicy: z.enum(["none", "weekly", "monthly", "quarterly", "yearly"]).optional(),
  rotationEnabled: z.boolean().optional(),
  tags: z.record(z.string()).optional(),
  allowedServices: z.array(z.string()).optional(),
  allowedRoles: z.array(z.string()).optional(),
});

const listSecretsSchema = z.object({
  scope: z.enum(["global", "organization", "project", "environment"]).optional(),
  projectId: z.string().optional(),
  environment: z.string().optional(),
  secretType: z.enum(["generic", "api-key", "password", "certificate", "token"]).optional(),
  search: z.string().optional(),
});

/**
 * Create a new secret
 * POST /api/vault/secrets
 */
router.post("/secrets", requireVaultAccess, async (req: Request, res: Response) => {
  try {
    const input = createSecretSchema.parse(req.body);
    const context = getAuditContext(req);
    
    const secret = await secretsVaultService.createSecret(input, context);
    
    // Don't return encrypted data
    const { encryptedValue, previousVersions, ...safeSecret } = secret;
    
    res.status(201).json({
      success: true,
      message: "Secret created successfully / تم إنشاء السر بنجاح",
      messageAr: "تم إنشاء السر بنجاح",
      secret: safeSecret,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input / إدخال غير صالح",
        errorAr: "إدخال غير صالح",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get secret metadata (without value)
 * GET /api/vault/secrets/:path
 */
router.get("/secrets/*", requireVaultAccess, async (req: Request, res: Response) => {
  try {
    const path = (req.params as any)[0];
    const context = getAuditContext(req);
    
    const secret = await secretsVaultService.getSecretMetadata(path, context);
    
    if (!secret) {
      return res.status(404).json({
        success: false,
        error: "Secret not found / السر غير موجود",
        errorAr: "السر غير موجود",
      });
    }
    
    // Don't return encrypted data
    const { encryptedValue, previousVersions, ...safeSecret } = secret;
    
    res.json({
      success: true,
      secret: safeSecret,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get secret value (decrypted)
 * POST /api/vault/secrets/:path/reveal
 */
router.post("/secrets/*/reveal", requireVaultAccess, async (req: Request, res: Response) => {
  try {
    const path = (req.params as any)[0];
    const context = getAuditContext(req);
    
    // Extra security: require explicit confirmation
    if (req.body.confirm !== true) {
      return res.status(400).json({
        success: false,
        error: "Confirmation required / مطلوب التأكيد",
        errorAr: "مطلوب التأكيد",
        hint: "Send { confirm: true } to reveal the secret value",
      });
    }
    
    const value = await secretsVaultService.getSecretValue(path, context);
    
    if (!value) {
      return res.status(404).json({
        success: false,
        error: "Secret not found / السر غير موجود",
        errorAr: "السر غير موجود",
      });
    }
    
    res.json({
      success: true,
      value,
      warning: "This value was logged for audit purposes / تم تسجيل هذا الكشف للتدقيق",
      warningAr: "تم تسجيل هذا الكشف للتدقيق",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Update a secret
 * PATCH /api/vault/secrets/:path
 */
router.patch("/secrets/*", requireVaultAccess, async (req: Request, res: Response) => {
  try {
    const path = (req.params as any)[0];
    const input = updateSecretSchema.parse(req.body);
    const context = getAuditContext(req);
    
    const secret = await secretsVaultService.updateSecret(path, input, context);
    
    // Don't return encrypted data
    const { encryptedValue, previousVersions, ...safeSecret } = secret;
    
    res.json({
      success: true,
      message: "Secret updated successfully / تم تحديث السر بنجاح",
      messageAr: "تم تحديث السر بنجاح",
      secret: safeSecret,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input / إدخال غير صالح",
        errorAr: "إدخال غير صالح",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Rotate a secret
 * POST /api/vault/secrets/:path/rotate
 */
router.post("/secrets/*/rotate", requireVaultAccess, async (req: Request, res: Response) => {
  try {
    const path = (req.params as any)[0];
    const { newValue } = z.object({ newValue: z.string().min(1) }).parse(req.body);
    const context = getAuditContext(req);
    
    const secret = await secretsVaultService.rotateSecret(path, newValue, context);
    
    // Don't return encrypted data
    const { encryptedValue, previousVersions, ...safeSecret } = secret;
    
    res.json({
      success: true,
      message: "Secret rotated successfully / تم تدوير السر بنجاح",
      messageAr: "تم تدوير السر بنجاح",
      secret: safeSecret,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid input / إدخال غير صالح",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Delete a secret
 * DELETE /api/vault/secrets/:path
 */
router.delete("/secrets/*", requireVaultAccess, async (req: Request, res: Response) => {
  try {
    const path = (req.params as any)[0];
    const context = getAuditContext(req);
    
    const deleted = await secretsVaultService.deleteSecret(path, context);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Secret not found / السر غير موجود",
        errorAr: "السر غير موجود",
      });
    }
    
    res.json({
      success: true,
      message: "Secret deleted successfully / تم حذف السر بنجاح",
      messageAr: "تم حذف السر بنجاح",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * List secrets
 * GET /api/vault/list
 */
router.get("/list", requireVaultAccess, async (req: Request, res: Response) => {
  try {
    const filters = listSecretsSchema.parse(req.query);
    const context = getAuditContext(req);
    
    const secrets = await secretsVaultService.listSecrets(filters, context);
    
    res.json({
      success: true,
      secrets,
      count: secrets.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid filters / فلاتر غير صالحة",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get vault statistics
 * GET /api/vault/stats
 */
router.get("/stats", requireVaultAccess, async (req: Request, res: Response) => {
  try {
    const stats = await secretsVaultService.getVaultStats();
    
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get secrets needing rotation
 * GET /api/vault/rotation-needed
 */
router.get("/rotation-needed", requireVaultAccess, async (req: Request, res: Response) => {
  try {
    const secrets = await secretsVaultService.getSecretsNeedingRotation();
    
    // Don't return encrypted data
    const safeSecrets = secrets.map(({ encryptedValue, previousVersions, ...rest }) => rest);
    
    res.json({
      success: true,
      secrets: safeSecrets,
      count: safeSecrets.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
