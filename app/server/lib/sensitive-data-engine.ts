/**
 * Sensitive Data Management Engine | محرك إدارة البيانات الحساسة
 * 
 * Features:
 * - Automatic data classification (normal/sensitive/highly-sensitive)
 * - Storage and processing policies per classification
 * - Multi-tenant data isolation
 * - AES-256-GCM encryption for sensitive data
 * - Audit logging for all data access
 */

import crypto from 'crypto';

// Data classification levels
export type DataClassification = 'normal' | 'sensitive' | 'highly-sensitive';

// Data categories for automatic classification
export type DataCategory = 
  | 'personal' | 'financial' | 'health' | 'authentication' 
  | 'business' | 'technical' | 'public' | 'internal';

// Storage policies
export type StoragePolicy = 'standard' | 'encrypted' | 'encrypted-isolated';

// Processing policies  
export type ProcessingPolicy = 'unrestricted' | 'restricted' | 'highly-restricted';

// Retention policies
export type RetentionPolicy = 'indefinite' | '1-year' | '90-days' | '30-days' | '7-days';

export interface ClassificationRule {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  patterns: string[];
  keywords: string[];
  category: DataCategory;
  classification: DataClassification;
  enabled: boolean;
  createdAt: string;
  createdBy: string;
}

export interface DataPolicy {
  id: string;
  name: string;
  nameAr: string;
  classification: DataClassification;
  storagePolicy: StoragePolicy;
  processingPolicy: ProcessingPolicy;
  retentionPolicy: RetentionPolicy;
  encryptionRequired: boolean;
  auditRequired: boolean;
  accessRestrictions: string[];
  allowedRoles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DataRecord {
  id: string;
  tenantId: string;
  dataType: string;
  classification: DataClassification;
  category: DataCategory;
  encryptedData?: string;
  metadata: Record<string, any>;
  accessLog: DataAccessLog[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface DataAccessLog {
  id: string;
  recordId: string;
  userId: string;
  userEmail: string;
  action: 'read' | 'write' | 'delete' | 'classify' | 'export';
  timestamp: string;
  ipAddress?: string;
  success: boolean;
  reason?: string;
}

export interface TenantIsolation {
  tenantId: string;
  tenantName: string;
  tenantNameAr: string;
  encryptionKey: string;
  dataPrefix: string;
  allowedCategories: DataCategory[];
  blockedCategories: DataCategory[];
  crossTenantAccess: boolean;
  createdAt: string;
}

export interface ClassificationResult {
  classification: DataClassification;
  category: DataCategory;
  confidence: number;
  matchedRules: string[];
  matchedKeywords: string[];
  recommendations: string[];
  recommendationsAr: string[];
}

export interface DataStats {
  totalRecords: number;
  byClassification: Record<DataClassification, number>;
  byCategory: Record<DataCategory, number>;
  byTenant: Record<string, number>;
  encryptedCount: number;
  accessLogsCount: number;
}

const OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

class SensitiveDataEngine {
  private classificationRules: Map<string, ClassificationRule> = new Map();
  private policies: Map<string, DataPolicy> = new Map();
  private dataRecords: Map<string, DataRecord> = new Map();
  private tenantIsolations: Map<string, TenantIsolation> = new Map();
  private accessLogs: Map<string, DataAccessLog> = new Map();
  private masterKey: string;

  constructor() {
    const envKey = process.env.DATA_ENCRYPTION_KEY;
    
    if (envKey) {
      this.masterKey = envKey;
      console.log('[SensitiveData] Using provided DATA_ENCRYPTION_KEY');
    } else if (process.env.NODE_ENV === 'production') {
      console.error('[SensitiveData] CRITICAL: DATA_ENCRYPTION_KEY required in production!');
      throw new Error('DATA_ENCRYPTION_KEY environment variable is required in production');
    } else {
      this.masterKey = crypto.createHash('sha256')
        .update('infera-dev-key-do-not-use-in-production')
        .digest('hex');
      console.warn('[SensitiveData] WARNING: Using development key - set DATA_ENCRYPTION_KEY for production');
    }
    
    this.initializeDefaultRules();
    this.initializeDefaultPolicies();
    console.log('[SensitiveData] Engine initialized | تم تهيئة محرك البيانات الحساسة');
  }

  private initializeDefaultRules(): void {
    const defaultRules: Omit<ClassificationRule, 'id' | 'createdAt' | 'createdBy'>[] = [
      {
        name: 'Personal Identifiers',
        nameAr: 'المعرفات الشخصية',
        description: 'Detects personal identification data like SSN, passport numbers',
        descriptionAr: 'يكتشف بيانات التعريف الشخصية مثل رقم الهوية وجواز السفر',
        patterns: [
          '\\b\\d{3}-\\d{2}-\\d{4}\\b',
          '\\b[A-Z]{1,2}\\d{6,9}\\b',
          '\\b\\d{10,14}\\b'
        ],
        keywords: ['ssn', 'passport', 'national_id', 'identity', 'هوية', 'جواز'],
        category: 'personal',
        classification: 'highly-sensitive',
        enabled: true
      },
      {
        name: 'Financial Data',
        nameAr: 'البيانات المالية',
        description: 'Detects financial information like credit cards, bank accounts',
        descriptionAr: 'يكتشف المعلومات المالية مثل بطاقات الائتمان والحسابات البنكية',
        patterns: [
          '\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b',
          '\\b[A-Z]{2}\\d{2}[A-Z0-9]{4,30}\\b'
        ],
        keywords: ['credit_card', 'bank_account', 'iban', 'cvv', 'بنك', 'بطاقة'],
        category: 'financial',
        classification: 'highly-sensitive',
        enabled: true
      },
      {
        name: 'Health Records',
        nameAr: 'السجلات الصحية',
        description: 'Detects health and medical information',
        descriptionAr: 'يكتشف المعلومات الصحية والطبية',
        patterns: [],
        keywords: ['diagnosis', 'medical', 'health', 'prescription', 'patient', 'تشخيص', 'طبي', 'صحة'],
        category: 'health',
        classification: 'highly-sensitive',
        enabled: true
      },
      {
        name: 'Authentication Credentials',
        nameAr: 'بيانات المصادقة',
        description: 'Detects passwords, tokens, and API keys',
        descriptionAr: 'يكتشف كلمات المرور والرموز ومفاتيح API',
        patterns: [
          'password[\\s]*[=:][\\s]*["\']?[^"\'\\s]+',
          'api[_-]?key[\\s]*[=:][\\s]*["\']?[^"\'\\s]+',
          'secret[\\s]*[=:][\\s]*["\']?[^"\'\\s]+'
        ],
        keywords: ['password', 'secret', 'token', 'api_key', 'credential', 'كلمة_سر', 'مفتاح'],
        category: 'authentication',
        classification: 'highly-sensitive',
        enabled: true
      },
      {
        name: 'Contact Information',
        nameAr: 'معلومات الاتصال',
        description: 'Detects email addresses and phone numbers',
        descriptionAr: 'يكتشف عناوين البريد الإلكتروني وأرقام الهواتف',
        patterns: [
          '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
          '\\+?\\d{1,3}[- ]?\\d{3,4}[- ]?\\d{3,4}[- ]?\\d{3,4}'
        ],
        keywords: ['email', 'phone', 'mobile', 'contact', 'بريد', 'هاتف'],
        category: 'personal',
        classification: 'sensitive',
        enabled: true
      },
      {
        name: 'Business Confidential',
        nameAr: 'سري تجاري',
        description: 'Detects business confidential markers',
        descriptionAr: 'يكتشف علامات السرية التجارية',
        patterns: [],
        keywords: ['confidential', 'proprietary', 'trade_secret', 'internal_only', 'سري', 'خاص'],
        category: 'business',
        classification: 'sensitive',
        enabled: true
      },
      {
        name: 'Public Data',
        nameAr: 'بيانات عامة',
        description: 'Data explicitly marked as public',
        descriptionAr: 'البيانات المحددة صراحة كعامة',
        patterns: [],
        keywords: ['public', 'published', 'open', 'عام', 'منشور'],
        category: 'public',
        classification: 'normal',
        enabled: true
      }
    ];

    defaultRules.forEach((rule, index) => {
      const id = `rule-default-${index + 1}`;
      this.classificationRules.set(id, {
        ...rule,
        id,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      });
    });
  }

  private initializeDefaultPolicies(): void {
    const defaultPolicies: Omit<DataPolicy, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Normal Data Policy',
        nameAr: 'سياسة البيانات العادية',
        classification: 'normal',
        storagePolicy: 'standard',
        processingPolicy: 'unrestricted',
        retentionPolicy: 'indefinite',
        encryptionRequired: false,
        auditRequired: false,
        accessRestrictions: [],
        allowedRoles: ['user', 'admin', 'owner']
      },
      {
        name: 'Sensitive Data Policy',
        nameAr: 'سياسة البيانات الحساسة',
        classification: 'sensitive',
        storagePolicy: 'encrypted',
        processingPolicy: 'restricted',
        retentionPolicy: '1-year',
        encryptionRequired: true,
        auditRequired: true,
        accessRestrictions: ['no_export', 'no_copy'],
        allowedRoles: ['admin', 'owner']
      },
      {
        name: 'Highly Sensitive Data Policy',
        nameAr: 'سياسة البيانات شديدة الحساسية',
        classification: 'highly-sensitive',
        storagePolicy: 'encrypted-isolated',
        processingPolicy: 'highly-restricted',
        retentionPolicy: '90-days',
        encryptionRequired: true,
        auditRequired: true,
        accessRestrictions: ['no_export', 'no_copy', 'no_cache', 'owner_approval'],
        allowedRoles: ['owner']
      }
    ];

    defaultPolicies.forEach((policy, index) => {
      const id = `policy-${policy.classification}`;
      this.policies.set(id, {
        ...policy,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  classifyData(data: string, context?: { tenantId?: string; dataType?: string }): ClassificationResult {
    const matchedRules: string[] = [];
    const matchedKeywords: string[] = [];
    let highestClassification: DataClassification = 'normal';
    let detectedCategory: DataCategory = 'public';
    let totalConfidence = 0;

    const dataLower = data.toLowerCase();

    for (const rule of this.classificationRules.values()) {
      if (!rule.enabled) continue;

      let ruleMatched = false;

      for (const pattern of rule.patterns) {
        try {
          const regex = new RegExp(pattern, 'gi');
          if (regex.test(data)) {
            ruleMatched = true;
            matchedRules.push(rule.id);
            break;
          }
        } catch (e) {
          console.error(`[SensitiveData] Invalid pattern in rule ${rule.id}:`, pattern);
        }
      }

      if (!ruleMatched) {
        for (const keyword of rule.keywords) {
          if (dataLower.includes(keyword.toLowerCase())) {
            ruleMatched = true;
            matchedKeywords.push(keyword);
            matchedRules.push(rule.id);
            break;
          }
        }
      }

      if (ruleMatched) {
        totalConfidence += 0.3;
        
        if (this.classificationPriority(rule.classification) > this.classificationPriority(highestClassification)) {
          highestClassification = rule.classification;
          detectedCategory = rule.category;
        }
      }
    }

    const confidence = Math.min(totalConfidence, 1);

    const recommendations = this.generateRecommendations(highestClassification, detectedCategory);

    return {
      classification: highestClassification,
      category: detectedCategory,
      confidence,
      matchedRules: [...new Set(matchedRules)],
      matchedKeywords: [...new Set(matchedKeywords)],
      recommendations: recommendations.en,
      recommendationsAr: recommendations.ar
    };
  }

  private classificationPriority(classification: DataClassification): number {
    switch (classification) {
      case 'highly-sensitive': return 3;
      case 'sensitive': return 2;
      case 'normal': return 1;
      default: return 0;
    }
  }

  private generateRecommendations(classification: DataClassification, category: DataCategory): { en: string[]; ar: string[] } {
    const en: string[] = [];
    const ar: string[] = [];

    if (classification === 'highly-sensitive') {
      en.push('Enable AES-256-GCM encryption for storage');
      en.push('Restrict access to owner only');
      en.push('Enable audit logging for all access');
      en.push('Set retention policy to 90 days or less');
      ar.push('تفعيل تشفير AES-256-GCM للتخزين');
      ar.push('تقييد الوصول للمالك فقط');
      ar.push('تفعيل تسجيل التدقيق لجميع الوصول');
      ar.push('تعيين سياسة الاحتفاظ إلى 90 يومًا أو أقل');
    } else if (classification === 'sensitive') {
      en.push('Enable encryption for storage');
      en.push('Restrict access to admins and owner');
      en.push('Enable audit logging');
      ar.push('تفعيل التشفير للتخزين');
      ar.push('تقييد الوصول للمسؤولين والمالك');
      ar.push('تفعيل تسجيل التدقيق');
    }

    if (category === 'authentication') {
      en.push('Never log or display credentials');
      en.push('Use secure hashing for passwords');
      ar.push('عدم تسجيل أو عرض بيانات الاعتماد');
      ar.push('استخدام التجزئة الآمنة لكلمات المرور');
    }

    if (category === 'financial') {
      en.push('Comply with PCI-DSS requirements');
      en.push('Mask card numbers in logs');
      ar.push('الامتثال لمتطلبات PCI-DSS');
      ar.push('إخفاء أرقام البطاقات في السجلات');
    }

    if (category === 'health') {
      en.push('Comply with HIPAA requirements');
      en.push('Obtain consent before processing');
      ar.push('الامتثال لمتطلبات HIPAA');
      ar.push('الحصول على موافقة قبل المعالجة');
    }

    return { en, ar };
  }

  encryptData(data: string, tenantId?: string): string {
    const key = tenantId ? this.getTenantKey(tenantId) : this.masterKey;
    const keyBuffer = Buffer.from(key.slice(0, 64), 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decryptData(encryptedData: string, tenantId?: string): string {
    const key = tenantId ? this.getTenantKey(tenantId) : this.masterKey;
    const keyBuffer = Buffer.from(key.slice(0, 64), 'hex');
    
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  private getTenantKey(tenantId: string): string {
    const tenant = this.tenantIsolations.get(tenantId);
    return tenant?.encryptionKey || this.masterKey;
  }

  createTenantIsolation(tenantId: string, tenantName: string, tenantNameAr: string): TenantIsolation {
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    
    const isolation: TenantIsolation = {
      tenantId,
      tenantName,
      tenantNameAr,
      encryptionKey,
      dataPrefix: `tenant_${tenantId}_`,
      allowedCategories: ['personal', 'financial', 'health', 'business', 'technical', 'public', 'internal'],
      blockedCategories: [],
      crossTenantAccess: false,
      createdAt: new Date().toISOString()
    };

    this.tenantIsolations.set(tenantId, isolation);
    console.log(`[SensitiveData] Created tenant isolation: ${tenantId}`);
    return isolation;
  }

  storeData(
    tenantId: string,
    dataType: string,
    data: string,
    userId: string,
    userEmail: string
  ): DataRecord {
    const classification = this.classifyData(data);
    const policy = this.getPolicyForClassification(classification.classification);
    
    const id = `data-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    let storedData: string | undefined;
    if (policy.encryptionRequired) {
      storedData = this.encryptData(data, tenantId);
    }

    const record: DataRecord = {
      id,
      tenantId,
      dataType,
      classification: classification.classification,
      category: classification.category,
      encryptedData: storedData,
      metadata: {
        originalLength: data.length,
        encrypted: policy.encryptionRequired,
        matchedRules: classification.matchedRules
      },
      accessLog: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: this.calculateExpiration(policy.retentionPolicy)
    };

    this.dataRecords.set(id, record);

    this.logAccess(id, userId, userEmail, 'write', true);

    console.log(`[SensitiveData] Stored data record: ${id} | Classification: ${classification.classification}`);
    return record;
  }

  private calculateExpiration(retentionPolicy: RetentionPolicy): string | undefined {
    const now = new Date();
    switch (retentionPolicy) {
      case '7-days':
        now.setDate(now.getDate() + 7);
        return now.toISOString();
      case '30-days':
        now.setDate(now.getDate() + 30);
        return now.toISOString();
      case '90-days':
        now.setDate(now.getDate() + 90);
        return now.toISOString();
      case '1-year':
        now.setFullYear(now.getFullYear() + 1);
        return now.toISOString();
      case 'indefinite':
      default:
        return undefined;
    }
  }

  retrieveData(
    recordId: string,
    tenantId: string,
    userId: string,
    userEmail: string,
    userRoles: string[]
  ): { success: boolean; data?: string; error?: string; errorAr?: string } {
    const record = this.dataRecords.get(recordId);
    
    if (!record) {
      return { 
        success: false, 
        error: 'Record not found',
        errorAr: 'السجل غير موجود'
      };
    }

    if (record.tenantId !== tenantId) {
      const tenant = this.tenantIsolations.get(record.tenantId);
      if (!tenant?.crossTenantAccess) {
        this.logAccess(recordId, userId, userEmail, 'read', false, 'Cross-tenant access denied');
        return { 
          success: false, 
          error: 'Access denied - data belongs to different tenant',
          errorAr: 'تم رفض الوصول - البيانات تنتمي لمنصة أخرى'
        };
      }
    }

    const policy = this.getPolicyForClassification(record.classification);
    
    const hasAccess = policy.allowedRoles.some(role => userRoles.includes(role)) || userEmail === OWNER_EMAIL;
    if (!hasAccess) {
      this.logAccess(recordId, userId, userEmail, 'read', false, 'Insufficient permissions');
      return { 
        success: false, 
        error: 'Access denied - insufficient permissions',
        errorAr: 'تم رفض الوصول - صلاحيات غير كافية'
      };
    }

    this.logAccess(recordId, userId, userEmail, 'read', true);

    if (record.encryptedData) {
      try {
        const decrypted = this.decryptData(record.encryptedData, record.tenantId);
        return { success: true, data: decrypted };
      } catch (error) {
        return { 
          success: false, 
          error: 'Decryption failed',
          errorAr: 'فشل فك التشفير'
        };
      }
    }

    return { success: true, data: undefined };
  }

  private logAccess(
    recordId: string,
    userId: string,
    userEmail: string,
    action: DataAccessLog['action'],
    success: boolean,
    reason?: string
  ): void {
    const log: DataAccessLog = {
      id: `log-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      recordId,
      userId,
      userEmail,
      action,
      timestamp: new Date().toISOString(),
      success,
      reason
    };

    this.accessLogs.set(log.id, log);

    const record = this.dataRecords.get(recordId);
    if (record) {
      record.accessLog.push(log);
    }
  }

  getPolicyForClassification(classification: DataClassification): DataPolicy {
    return this.policies.get(`policy-${classification}`) || this.policies.get('policy-normal')!;
  }

  getClassificationRules(): ClassificationRule[] {
    return Array.from(this.classificationRules.values());
  }

  getPolicies(): DataPolicy[] {
    return Array.from(this.policies.values());
  }

  getTenantIsolations(): TenantIsolation[] {
    return Array.from(this.tenantIsolations.values()).map(t => ({
      ...t,
      encryptionKey: '***REDACTED***'
    }));
  }

  getDataRecords(tenantId?: string): DataRecord[] {
    const records = Array.from(this.dataRecords.values());
    if (tenantId) {
      return records.filter(r => r.tenantId === tenantId);
    }
    return records;
  }

  getAccessLogs(recordId?: string): DataAccessLog[] {
    const logs = Array.from(this.accessLogs.values());
    if (recordId) {
      return logs.filter(l => l.recordId === recordId);
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getStats(): DataStats {
    const records = Array.from(this.dataRecords.values());
    
    const byClassification: Record<DataClassification, number> = {
      'normal': 0,
      'sensitive': 0,
      'highly-sensitive': 0
    };
    
    const byCategory: Record<DataCategory, number> = {
      'personal': 0,
      'financial': 0,
      'health': 0,
      'authentication': 0,
      'business': 0,
      'technical': 0,
      'public': 0,
      'internal': 0
    };
    
    const byTenant: Record<string, number> = {};
    let encryptedCount = 0;

    for (const record of records) {
      byClassification[record.classification]++;
      byCategory[record.category]++;
      byTenant[record.tenantId] = (byTenant[record.tenantId] || 0) + 1;
      if (record.encryptedData) encryptedCount++;
    }

    return {
      totalRecords: records.length,
      byClassification,
      byCategory,
      byTenant,
      encryptedCount,
      accessLogsCount: this.accessLogs.size
    };
  }

  createClassificationRule(
    rule: Omit<ClassificationRule, 'id' | 'createdAt'>,
    createdBy: string
  ): ClassificationRule {
    const id = `rule-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const newRule: ClassificationRule = {
      ...rule,
      id,
      createdAt: new Date().toISOString(),
      createdBy
    };
    this.classificationRules.set(id, newRule);
    console.log(`[SensitiveData] Created classification rule: ${rule.name}`);
    return newRule;
  }

  updatePolicy(id: string, updates: Partial<DataPolicy>): DataPolicy | null {
    const policy = this.policies.get(id);
    if (!policy) return null;
    
    const updated = {
      ...policy,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.policies.set(id, updated);
    return updated;
  }

  deleteDataRecord(recordId: string, userId: string, userEmail: string): boolean {
    const record = this.dataRecords.get(recordId);
    if (!record) return false;

    this.logAccess(recordId, userId, userEmail, 'delete', true);
    return this.dataRecords.delete(recordId);
  }
}

export const sensitiveDataEngine = new SensitiveDataEngine();
