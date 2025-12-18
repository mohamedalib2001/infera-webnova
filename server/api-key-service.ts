import { storage } from "./storage";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { 
  ApiKey, InsertApiKey, 
  ApiKeyUsageLog, InsertApiKeyUsageLog,
  ApiAuditLog, InsertApiAuditLog,
  WebhookEndpoint, InsertWebhookEndpoint,
  WebhookDelivery, InsertWebhookDelivery,
  ApiConfiguration, InsertApiConfiguration,
  RateLimitPolicy,
  ApiScope
} from "@shared/schema";
import { apiScopes } from "@shared/schema";

// ==================== API Key Generation ====================

export interface CreateApiKeyInput {
  tenantId: string;
  userId: string;
  name: string;
  description?: string;
  scopes: string[];
  expiresInDays?: number;
  rateLimitTier?: string;
}

export interface CreateApiKeyResult {
  apiKey: ApiKey;
  plainTextKey: string; // عرض مرة واحدة فقط
}

export class ApiKeyService {
  private readonly SALT_ROUNDS = 12;
  private readonly KEY_LENGTH = 32;

  generatePrefix(environment: 'live' | 'test' = 'live'): string {
    return environment === 'live' ? 'infk_live_' : 'infk_test_';
  }

  generateSecureKey(prefix: string): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomPart = Array.from(
      crypto.randomBytes(this.KEY_LENGTH),
      (byte) => chars[byte % chars.length]
    ).join('');
    return `${prefix}${randomPart}`;
  }

  async hashKey(plainKey: string): Promise<string> {
    return bcrypt.hash(plainKey, this.SALT_ROUNDS);
  }

  async verifyKey(plainKey: string, hashedKey: string): Promise<boolean> {
    return bcrypt.compare(plainKey, hashedKey);
  }

  validateScopes(scopes: string[]): { valid: boolean; invalidScopes: string[] } {
    const validScopeSet = new Set(apiScopes);
    const invalidScopes = scopes.filter(s => !validScopeSet.has(s as ApiScope));
    return {
      valid: invalidScopes.length === 0,
      invalidScopes,
    };
  }

  async createApiKey(input: CreateApiKeyInput): Promise<CreateApiKeyResult> {
    // التحقق من الصلاحيات
    const scopeValidation = this.validateScopes(input.scopes);
    if (!scopeValidation.valid) {
      throw new Error(`صلاحيات غير صالحة: ${scopeValidation.invalidScopes.join(', ')}`);
    }

    // منع استخدام * أو all
    if (input.scopes.includes('*') || input.scopes.includes('all')) {
      throw new Error('لا يُسمح باستخدام صلاحيات شاملة (* أو all)');
    }

    // توليد المفتاح
    const prefix = this.generatePrefix('live');
    const plainTextKey = this.generateSecureKey(prefix);
    const keyHash = await this.hashKey(plainTextKey);
    const lastFourChars = plainTextKey.slice(-4);

    // حساب تاريخ الانتهاء
    let expiresAt: Date | undefined;
    if (input.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);
    }

    // إنشاء المفتاح في قاعدة البيانات
    const apiKeyData: InsertApiKey = {
      tenantId: input.tenantId,
      userId: input.userId,
      name: input.name,
      description: input.description,
      prefix,
      keyHash,
      lastFourChars,
      scopes: input.scopes,
      status: 'active',
      rateLimitTier: input.rateLimitTier || 'standard',
      rateLimitPerMinute: 60,
      rateLimitPerHour: 1000,
      rateLimitPerDay: 10000,
      expiresAt,
    };

    const apiKey = await storage.createApiKey(apiKeyData);

    // تسجيل في سجل التدقيق
    await this.logAuditEvent({
      tenantId: input.tenantId,
      userId: input.userId,
      action: 'API_KEY_CREATED',
      actionAr: 'تم إنشاء مفتاح API',
      resourceType: 'api_key',
      resourceId: apiKey.id,
      newState: { name: input.name, scopes: input.scopes },
      severity: 'info',
    });

    return {
      apiKey,
      plainTextKey, // يُعرض مرة واحدة فقط
    };
  }

  async revokeApiKey(
    keyId: string, 
    revokedBy: string, 
    reason?: string
  ): Promise<ApiKey> {
    const existingKey = await storage.getApiKey(keyId);
    if (!existingKey) {
      throw new Error('المفتاح غير موجود');
    }

    const updatedKey = await storage.updateApiKey(keyId, {
      status: 'revoked',
      revokedAt: new Date(),
      revokedBy,
      revokedReason: reason,
    });

    await this.logAuditEvent({
      tenantId: existingKey.tenantId,
      userId: revokedBy,
      apiKeyId: keyId,
      action: 'API_KEY_REVOKED',
      actionAr: 'تم إلغاء مفتاح API',
      resourceType: 'api_key',
      resourceId: keyId,
      previousState: { status: existingKey.status },
      newState: { status: 'revoked', reason },
      severity: 'warning',
    });

    return updatedKey!;
  }

  async rotateApiKey(keyId: string, userId: string): Promise<CreateApiKeyResult> {
    const existingKey = await storage.getApiKey(keyId);
    if (!existingKey) {
      throw new Error('المفتاح غير موجود');
    }

    // إلغاء المفتاح القديم
    await this.revokeApiKey(keyId, userId, 'تم التدوير إلى مفتاح جديد');

    // إنشاء مفتاح جديد بنفس الإعدادات
    const newKey = await this.createApiKey({
      tenantId: existingKey.tenantId,
      userId,
      name: `${existingKey.name} (مُدوَّر)`,
      description: existingKey.description || undefined,
      scopes: existingKey.scopes as string[],
      rateLimitTier: existingKey.rateLimitTier,
    });

    await this.logAuditEvent({
      tenantId: existingKey.tenantId,
      userId,
      apiKeyId: keyId,
      action: 'API_KEY_ROTATED',
      actionAr: 'تم تدوير مفتاح API',
      resourceType: 'api_key',
      resourceId: keyId,
      previousState: { keyId },
      newState: { newKeyId: newKey.apiKey.id },
      severity: 'info',
    });

    return newKey;
  }

  async validateApiKey(plainKey: string): Promise<{
    valid: boolean;
    apiKey?: ApiKey;
    error?: string;
    errorAr?: string;
  }> {
    // استخراج البادئة
    const prefix = plainKey.substring(0, 10);
    
    // البحث عن المفاتيح بنفس البادئة
    const candidates = await storage.getApiKeysByPrefix(prefix);
    
    for (const candidate of candidates) {
      const isMatch = await this.verifyKey(plainKey, candidate.keyHash);
      if (isMatch) {
        // التحقق من الحالة
        if (candidate.status === 'revoked') {
          return { valid: false, error: 'API key has been revoked', errorAr: 'تم إلغاء المفتاح' };
        }
        if (candidate.status === 'expired') {
          return { valid: false, error: 'API key has expired', errorAr: 'انتهت صلاحية المفتاح' };
        }
        if (candidate.status === 'suspended') {
          return { valid: false, error: 'API key is suspended', errorAr: 'المفتاح معلق' };
        }
        if (candidate.expiresAt && new Date(candidate.expiresAt) < new Date()) {
          await storage.updateApiKey(candidate.id, { status: 'expired' });
          return { valid: false, error: 'API key has expired', errorAr: 'انتهت صلاحية المفتاح' };
        }

        // تحديث آخر استخدام
        await storage.updateApiKey(candidate.id, {
          lastUsedAt: new Date(),
          usageCount: (candidate.usageCount || 0) + 1,
        });

        return { valid: true, apiKey: candidate };
      }
    }

    return { valid: false, error: 'Invalid API key', errorAr: 'مفتاح API غير صالح' };
  }

  hasScope(apiKey: ApiKey, requiredScope: string): boolean {
    const scopes = apiKey.scopes as string[];
    return scopes.includes(requiredScope);
  }

  hasAnyScope(apiKey: ApiKey, requiredScopes: string[]): boolean {
    const scopes = apiKey.scopes as string[];
    return requiredScopes.some(s => scopes.includes(s));
  }

  // ==================== Audit Logging ====================

  async logAuditEvent(input: Omit<InsertApiAuditLog, 'checksum'>): Promise<void> {
    const checksum = this.calculateChecksum(input);
    await storage.createApiAuditLog({ ...input, checksum });
  }

  calculateChecksum(data: Record<string, unknown>): string {
    const content = JSON.stringify(data);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // ==================== Usage Logging ====================

  async logUsage(input: InsertApiKeyUsageLog): Promise<void> {
    await storage.createApiKeyUsageLog(input);
  }

  // ==================== Webhooks ====================

  generateWebhookSecret(): string {
    return `whsec_${crypto.randomBytes(32).toString('hex')}`;
  }

  signWebhookPayload(payload: Record<string, unknown>, secret: string): string {
    const content = JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(content).digest('hex');
  }

  async sendWebhook(
    endpoint: WebhookEndpoint, 
    eventType: string, 
    payload: Record<string, unknown>
  ): Promise<void> {
    const signature = this.signWebhookPayload(payload, endpoint.secretHash);
    
    const deliveryData: InsertWebhookDelivery = {
      endpointId: endpoint.id,
      tenantId: endpoint.tenantId,
      eventType,
      payload,
      signature,
      status: 'pending',
      attempts: 0,
    };

    const delivery = await storage.createWebhookDelivery(deliveryData);

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-INFERA-Signature': signature,
          'X-INFERA-Event': eventType,
          'X-INFERA-Delivery-ID': delivery.id,
        },
        body: JSON.stringify(payload),
      });

      await storage.updateWebhookDelivery(delivery.id, {
        status: response.ok ? 'delivered' : 'failed',
        statusCode: response.status,
        deliveredAt: response.ok ? new Date() : undefined,
        attempts: 1,
        errorMessage: response.ok ? undefined : `HTTP ${response.status}`,
      });

      await storage.updateWebhookEndpoint(endpoint.id, {
        lastDeliveryAt: new Date(),
        lastDeliveryStatus: response.ok ? 'success' : 'failed',
        failureCount: response.ok ? 0 : (endpoint.failureCount || 0) + 1,
      });

    } catch (error) {
      await storage.updateWebhookDelivery(delivery.id, {
        status: 'failed',
        attempts: 1,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      await storage.updateWebhookEndpoint(endpoint.id, {
        lastDeliveryAt: new Date(),
        lastDeliveryStatus: 'failed',
        lastDeliveryError: error instanceof Error ? error.message : 'Unknown error',
        failureCount: (endpoint.failureCount || 0) + 1,
      });
    }
  }

  async triggerWebhooks(tenantId: string, eventType: string, payload: Record<string, unknown>): Promise<void> {
    const endpoints = await storage.getWebhookEndpointsByTenant(tenantId);
    const activeEndpoints = endpoints.filter(e => 
      e.isActive && 
      (e.events as string[]).includes(eventType)
    );

    await Promise.all(activeEndpoints.map(endpoint => 
      this.sendWebhook(endpoint, eventType, payload)
    ));
  }
}

export const apiKeyService = new ApiKeyService();
