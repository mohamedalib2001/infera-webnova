import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { apiKeyService } from "./api-key-service";
import { apiScopes, webhookEventTypes } from "@shared/schema";
import crypto from "crypto";

const router = Router();

// Helper: Check if user is owner
function isOwner(req: Request): boolean {
  const user = (req as any).user;
  return user?.role === 'owner';
}

// Helper: Get user ID
function getUserId(req: Request): string {
  return (req as any).user?.id || 'system';
}

// Helper: Get tenant ID (for owner, use a default tenant)
function getTenantId(req: Request): string {
  return (req as any).user?.id || 'default';
}

// ==================== API KEYS MANAGEMENT ====================

// GET /api/api-keys - List all API keys for tenant
router.get("/", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const tenantId = getTenantId(req);
    const keys = await storage.getApiKeysByTenant(tenantId);
    
    // Remove sensitive data
    const safeKeys = keys.map(key => ({
      id: key.id,
      name: key.name,
      description: key.description,
      prefix: key.prefix,
      lastFourChars: key.lastFourChars,
      scopes: key.scopes,
      status: key.status,
      rateLimitTier: key.rateLimitTier,
      rateLimitPerMinute: key.rateLimitPerMinute,
      rateLimitPerHour: key.rateLimitPerHour,
      rateLimitPerDay: key.rateLimitPerDay,
      lastUsedAt: key.lastUsedAt,
      usageCount: key.usageCount,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
    }));
    
    res.json({ keys: safeKeys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    res.status(500).json({ error: "Failed to fetch API keys", errorAr: "فشل في جلب مفاتيح API" });
  }
});

// POST /api/api-keys - Create new API key
router.post("/", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const { name, description, scopes, expiresInDays, rateLimitTier } = req.body;
    
    // Validate required fields
    if (!name || !scopes || !Array.isArray(scopes) || scopes.length === 0) {
      return res.status(400).json({ 
        error: "Name and at least one scope are required",
        errorAr: "الاسم وصلاحية واحدة على الأقل مطلوبان"
      });
    }
    
    // Validate scopes - no * or all allowed
    if (scopes.includes('*') || scopes.includes('all')) {
      return res.status(400).json({
        error: "Wildcard scopes (* or all) are not allowed",
        errorAr: "لا يُسمح بالصلاحيات الشاملة (* أو all)"
      });
    }
    
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    
    // Check key limit
    const config = await storage.getOrCreateApiConfiguration(tenantId);
    const currentCount = await storage.countApiKeysByTenant(tenantId);
    if (currentCount >= config.maxKeysPerTenant) {
      return res.status(400).json({
        error: `Maximum API keys limit reached (${config.maxKeysPerTenant})`,
        errorAr: `تم الوصول للحد الأقصى من المفاتيح (${config.maxKeysPerTenant})`
      });
    }
    
    // Create key
    const result = await apiKeyService.createApiKey({
      tenantId,
      userId,
      name,
      description,
      scopes,
      expiresInDays,
      rateLimitTier,
    });
    
    // Return with plain text key (shown only once!)
    res.status(201).json({
      key: result.apiKey,
      plainTextKey: result.plainTextKey,
      warning: "This API key will only be displayed once. Store it securely!",
      warningAr: "سيتم عرض هذا المفتاح مرة واحدة فقط. احفظه بأمان!"
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to create API key",
      errorAr: "فشل في إنشاء مفتاح API"
    });
  }
});

// DELETE /api/api-keys/:id - Revoke API key
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const { id } = req.params;
    const { reason } = req.body;
    const userId = getUserId(req);
    
    const key = await storage.getApiKey(id);
    if (!key) {
      return res.status(404).json({ error: "API key not found", errorAr: "المفتاح غير موجود" });
    }
    
    await apiKeyService.revokeApiKey(id, userId, reason);
    
    res.json({ success: true, message: "API key revoked", messageAr: "تم إلغاء المفتاح" });
  } catch (error) {
    console.error("Error revoking API key:", error);
    res.status(500).json({ error: "Failed to revoke API key", errorAr: "فشل في إلغاء المفتاح" });
  }
});

// POST /api/api-keys/:id/rotate - Rotate API key
router.post("/:id/rotate", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const { id } = req.params;
    const userId = getUserId(req);
    
    const key = await storage.getApiKey(id);
    if (!key) {
      return res.status(404).json({ error: "API key not found", errorAr: "المفتاح غير موجود" });
    }
    
    const result = await apiKeyService.rotateApiKey(id, userId);
    
    res.json({
      newKey: result.apiKey,
      plainTextKey: result.plainTextKey,
      warning: "The old key has been revoked. This new key will only be displayed once!",
      warningAr: "تم إلغاء المفتاح القديم. سيتم عرض المفتاح الجديد مرة واحدة فقط!"
    });
  } catch (error) {
    console.error("Error rotating API key:", error);
    res.status(500).json({ error: "Failed to rotate API key", errorAr: "فشل في تدوير المفتاح" });
  }
});

// GET /api/api-keys/:id/usage - Get API key usage logs
router.get("/:id/usage", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const logs = await storage.getApiKeyUsageLogs(id, limit);
    res.json({ logs });
  } catch (error) {
    console.error("Error fetching usage logs:", error);
    res.status(500).json({ error: "Failed to fetch usage logs", errorAr: "فشل في جلب سجلات الاستخدام" });
  }
});

// ==================== API CONFIGURATION ====================

// GET /api/api-keys/config - Get API configuration
router.get("/config", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const tenantId = getTenantId(req);
    const config = await storage.getOrCreateApiConfiguration(tenantId);
    res.json({ config });
  } catch (error) {
    console.error("Error fetching API config:", error);
    res.status(500).json({ error: "Failed to fetch configuration", errorAr: "فشل في جلب الإعدادات" });
  }
});

// PUT /api/api-keys/config - Update API configuration
router.put("/config", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const tenantId = getTenantId(req);
    const updates = req.body;
    
    await storage.getOrCreateApiConfiguration(tenantId);
    const config = await storage.updateApiConfiguration(tenantId, updates);
    
    res.json({ config });
  } catch (error) {
    console.error("Error updating API config:", error);
    res.status(500).json({ error: "Failed to update configuration", errorAr: "فشل في تحديث الإعدادات" });
  }
});

// ==================== SCOPES ====================

// GET /api/api-keys/scopes - List available scopes
router.get("/scopes", async (req: Request, res: Response) => {
  const scopeGroups = {
    platform: ['platform.read', 'platform.write', 'platform.delete'],
    domains: ['domains.read', 'domains.manage'],
    ai: ['ai.invoke', 'ai.manage'],
    billing: ['billing.read', 'billing.manage'],
    api_keys: ['api_keys.read', 'api_keys.manage'],
    webhooks: ['webhooks.read', 'webhooks.manage', 'webhooks.send'],
    users: ['users.read', 'users.manage'],
    projects: ['projects.read', 'projects.write', 'projects.delete'],
    analytics: ['analytics.read', 'analytics.export'],
    settings: ['settings.read', 'settings.write'],
  };
  
  res.json({ scopes: apiScopes, scopeGroups });
});

// ==================== WEBHOOKS ====================

// GET /api/api-keys/webhooks - List webhooks
router.get("/webhooks", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const tenantId = getTenantId(req);
    const webhooks = await storage.getWebhookEndpointsByTenant(tenantId);
    
    // Remove secret from response
    const safeWebhooks = webhooks.map(wh => ({
      id: wh.id,
      name: wh.name,
      url: wh.url,
      events: wh.events,
      isActive: wh.isActive,
      failureCount: wh.failureCount,
      lastDeliveryAt: wh.lastDeliveryAt,
      lastDeliveryStatus: wh.lastDeliveryStatus,
      createdAt: wh.createdAt,
    }));
    
    res.json({ webhooks: safeWebhooks, eventTypes: webhookEventTypes });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    res.status(500).json({ error: "Failed to fetch webhooks", errorAr: "فشل في جلب الـ Webhooks" });
  }
});

// POST /api/api-keys/webhooks - Create webhook
router.post("/webhooks", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const { name, url, events } = req.body;
    
    if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        error: "Name, URL, and at least one event are required",
        errorAr: "الاسم والرابط وحدث واحد على الأقل مطلوبين"
      });
    }
    
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    
    // Generate webhook secret
    const secret = apiKeyService.generateWebhookSecret();
    const secretHash = crypto.createHash('sha256').update(secret).digest('hex');
    
    const webhook = await storage.createWebhookEndpoint({
      tenantId,
      userId,
      name,
      url,
      secretHash,
      events,
      isActive: true,
    });
    
    // Return with secret (shown only once!)
    res.status(201).json({
      webhook: {
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
      },
      secret,
      warning: "This webhook secret will only be displayed once. Store it securely!",
      warningAr: "سيتم عرض سر الـ Webhook مرة واحدة فقط. احفظه بأمان!"
    });
  } catch (error) {
    console.error("Error creating webhook:", error);
    res.status(500).json({ error: "Failed to create webhook", errorAr: "فشل في إنشاء الـ Webhook" });
  }
});

// DELETE /api/api-keys/webhooks/:id - Delete webhook
router.delete("/webhooks/:id", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const { id } = req.params;
    
    const deleted = await storage.deleteWebhookEndpoint(id);
    if (!deleted) {
      return res.status(404).json({ error: "Webhook not found", errorAr: "الـ Webhook غير موجود" });
    }
    
    res.json({ success: true, message: "Webhook deleted", messageAr: "تم حذف الـ Webhook" });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    res.status(500).json({ error: "Failed to delete webhook", errorAr: "فشل في حذف الـ Webhook" });
  }
});

// PUT /api/api-keys/webhooks/:id/toggle - Toggle webhook active status
router.put("/webhooks/:id/toggle", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const { id } = req.params;
    
    const webhook = await storage.getWebhookEndpoint(id);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found", errorAr: "الـ Webhook غير موجود" });
    }
    
    const updated = await storage.updateWebhookEndpoint(id, { isActive: !webhook.isActive });
    
    res.json({ webhook: updated });
  } catch (error) {
    console.error("Error toggling webhook:", error);
    res.status(500).json({ error: "Failed to toggle webhook", errorAr: "فشل في تبديل حالة الـ Webhook" });
  }
});

// ==================== AUDIT LOGS ====================

// GET /api/api-keys/audit-logs - Get audit logs
router.get("/audit-logs", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const tenantId = getTenantId(req);
    const limit = parseInt(req.query.limit as string) || 100;
    
    const logs = await storage.getApiAuditLogs(tenantId, limit);
    res.json({ logs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs", errorAr: "فشل في جلب سجلات التدقيق" });
  }
});

// ==================== RATE LIMIT POLICIES ====================

// GET /api/api-keys/rate-limits - Get rate limit policies
router.get("/rate-limits", async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ error: "Owner access required", errorAr: "مطلوب صلاحية المالك" });
    }
    
    const policies = await storage.getRateLimitPolicies();
    res.json({ policies });
  } catch (error) {
    console.error("Error fetching rate limits:", error);
    res.status(500).json({ error: "Failed to fetch rate limits", errorAr: "فشل في جلب حدود الاستخدام" });
  }
});

export default router;
