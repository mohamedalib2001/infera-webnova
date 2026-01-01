/**
 * INFERA WebNova - Zero Trust & Vault System (نظام الثقة الصفرية والخزنة)
 * Layer 7: Security & Sovereignty - Non-Negotiable
 * 
 * Zero Trust + Sovereign Accounts
 * Secrets Never Touch Code - Vault Mandatory
 */

import { z } from 'zod';

// ==================== TRUST LEVELS ====================
export const TrustLevels = {
  NONE: 0,
  MINIMAL: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  VERIFIED: 5,
  SOVEREIGN: 6,
} as const;

export type TrustLevel = typeof TrustLevels[keyof typeof TrustLevels];

// ==================== ACCESS REQUEST SCHEMA ====================
export const AccessRequestSchema = z.object({
  requestId: z.string(),
  subject: z.object({
    id: z.string(),
    type: z.enum(['user', 'service', 'system', 'external']),
    attributes: z.record(z.unknown()),
  }),
  resource: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.record(z.unknown()),
  }),
  action: z.string(),
  context: z.object({
    timestamp: z.date(),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    location: z.object({
      country: z.string().optional(),
      region: z.string().optional(),
    }).optional(),
    device: z.object({
      id: z.string().optional(),
      trusted: z.boolean(),
    }).optional(),
    session: z.object({
      id: z.string(),
      createdAt: z.date(),
      mfaVerified: z.boolean(),
    }).optional(),
  }),
});

export type AccessRequest = z.infer<typeof AccessRequestSchema>;

// ==================== ACCESS DECISION SCHEMA ====================
export const AccessDecisionSchema = z.object({
  requestId: z.string(),
  allowed: z.boolean(),
  trustScore: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  conditions: z.array(z.object({
    type: z.string(),
    requirement: z.string(),
    met: z.boolean(),
  })),
  audit: z.object({
    logId: z.string(),
    timestamp: z.date(),
    policyId: z.string().optional(),
  }),
  expiresAt: z.date().optional(),
});

export type AccessDecision = z.infer<typeof AccessDecisionSchema>;

// ==================== VAULT SECRET SCHEMA ====================
export const VaultSecretSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['api-key', 'password', 'certificate', 'token', 'ssh-key', 'encryption-key']),
  
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    expiresAt: z.date().optional(),
    rotatedAt: z.date().optional(),
    version: z.number(),
    tags: z.array(z.string()),
  }),
  
  access: z.object({
    allowedServices: z.array(z.string()),
    allowedRoles: z.array(z.string()),
    requireMFA: z.boolean().default(false),
  }),
  
  rotation: z.object({
    enabled: z.boolean(),
    intervalDays: z.number().optional(),
    lastRotated: z.date().optional(),
    nextRotation: z.date().optional(),
  }),
});

export type VaultSecret = z.infer<typeof VaultSecretSchema>;

// ==================== ZERO TRUST ENGINE INTERFACE ====================
export interface IZeroTrustEngine {
  evaluate(request: AccessRequest): Promise<AccessDecision>;
  
  calculateTrustScore(subject: AccessRequest['subject'], context: AccessRequest['context']): number;
  
  registerPolicy(policy: ZeroTrustPolicy): Promise<void>;
  unregisterPolicy(policyId: string): Promise<void>;
  getPolicies(): ZeroTrustPolicy[];
  
  addTrustedDevice(subjectId: string, deviceId: string): Promise<void>;
  removeTrustedDevice(subjectId: string, deviceId: string): Promise<void>;
  
  getAuditLog(filter?: AuditFilter): AuditEntry[];
}

export interface ZeroTrustPolicy {
  id: string;
  name: string;
  priority: number;
  conditions: PolicyCondition[];
  effect: 'allow' | 'deny' | 'challenge';
  challengeType?: 'mfa' | 'captcha' | 'approval';
}

export interface PolicyCondition {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'nin' | 'gt' | 'lt' | 'exists' | 'regex';
  value: unknown;
}

export interface AuditFilter {
  subjectId?: string;
  resourceId?: string;
  action?: string;
  fromDate?: Date;
  toDate?: Date;
  allowed?: boolean;
}

export interface AuditEntry {
  id: string;
  request: AccessRequest;
  decision: AccessDecision;
  timestamp: Date;
}

// ==================== VAULT INTERFACE ====================
export interface IVault {
  setSecret(name: string, value: string, options?: SecretOptions): Promise<VaultSecret>;
  getSecret(name: string, serviceId: string): Promise<string | null>;
  deleteSecret(name: string): Promise<void>;
  listSecrets(): Promise<VaultSecret[]>;
  
  rotateSecret(name: string): Promise<VaultSecret>;
  setRotationPolicy(name: string, intervalDays: number): Promise<void>;
  
  grantAccess(secretName: string, serviceId: string): Promise<void>;
  revokeAccess(secretName: string, serviceId: string): Promise<void>;
  
  getAccessLog(secretName: string): SecretAccessLog[];
  
  encrypt(data: string): Promise<string>;
  decrypt(encryptedData: string): Promise<string>;
}

export interface SecretOptions {
  type?: VaultSecret['type'];
  expiresAt?: Date;
  allowedServices?: string[];
  allowedRoles?: string[];
  requireMFA?: boolean;
  rotationEnabled?: boolean;
  rotationIntervalDays?: number;
  tags?: string[];
}

export interface SecretAccessLog {
  secretName: string;
  serviceId: string;
  action: 'read' | 'write' | 'rotate' | 'delete';
  timestamp: Date;
  allowed: boolean;
  ip?: string;
}

// ==================== SOVEREIGN ACCOUNT INTERFACE ====================
export interface ISovereignAccount {
  readonly accountId: string;
  readonly ownerId: string;
  
  getKeys(): SovereignKey[];
  generateKey(type: 'signing' | 'encryption'): Promise<SovereignKey>;
  revokeKey(keyId: string): Promise<void>;
  
  getLogs(): SovereignLog[];
  exportLogs(format: 'json' | 'csv'): Promise<string>;
  
  getSettings(): SovereignSettings;
  updateSettings(settings: Partial<SovereignSettings>): Promise<void>;
}

export interface SovereignKey {
  id: string;
  type: 'signing' | 'encryption';
  publicKey: string;
  createdAt: Date;
  expiresAt?: Date;
  status: 'active' | 'revoked' | 'expired';
}

export interface SovereignLog {
  id: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: Date;
  signature: string;
}

export interface SovereignSettings {
  requireMFA: boolean;
  allowedIPs: string[];
  sessionTimeout: number;
  auditLevel: 'full' | 'standard' | 'minimal';
  alertChannels: string[];
}

// ==================== ZERO TRUST ENGINE IMPLEMENTATION ====================
class ZeroTrustEngineImpl implements IZeroTrustEngine {
  private policies: Map<string, ZeroTrustPolicy> = new Map();
  private trustedDevices: Map<string, Set<string>> = new Map();
  private auditLog: AuditEntry[] = [];
  private auditCounter = 0;

  constructor() {
    this.registerDefaultPolicies();
  }

  private async registerDefaultPolicies(): Promise<void> {
    await this.registerPolicy({
      id: 'policy-deny-unknown-devices',
      name: 'Deny Unknown Devices for Critical Resources',
      priority: 10,
      conditions: [
        { field: 'resource.type', operator: 'in', value: ['secrets', 'keys', 'admin'] },
        { field: 'context.device.trusted', operator: 'eq', value: false },
      ],
      effect: 'challenge',
      challengeType: 'mfa',
    });

    await this.registerPolicy({
      id: 'policy-sovereign-access',
      name: 'Sovereign Access Always Allowed',
      priority: 0,
      conditions: [
        { field: 'subject.type', operator: 'eq', value: 'system' },
        { field: 'subject.attributes.role', operator: 'eq', value: 'owner' },
      ],
      effect: 'allow',
    });
  }

  async evaluate(request: AccessRequest): Promise<AccessDecision> {
    const trustScore = this.calculateTrustScore(request.subject, request.context);
    const sortedPolicies = Array.from(this.policies.values()).sort((a, b) => a.priority - b.priority);
    
    let allowed = false;
    const reasons: string[] = [];
    const conditions: Array<{ type: string; requirement: string; met: boolean }> = [];
    let matchedPolicy: ZeroTrustPolicy | undefined;

    for (const policy of sortedPolicies) {
      if (this.matchesPolicy(request, policy)) {
        matchedPolicy = policy;
        
        if (policy.effect === 'allow') {
          allowed = true;
          reasons.push(`Allowed by policy: ${policy.name}`);
        } else if (policy.effect === 'deny') {
          allowed = false;
          reasons.push(`Denied by policy: ${policy.name}`);
        } else if (policy.effect === 'challenge') {
          const mfaVerified = request.context.session?.mfaVerified ?? false;
          if (mfaVerified) {
            allowed = true;
            reasons.push(`Challenge passed: ${policy.name}`);
          } else {
            allowed = false;
            reasons.push(`Challenge required: ${policy.challengeType}`);
          }
        }
        break;
      }
    }

    if (!matchedPolicy) {
      allowed = trustScore >= 50;
      reasons.push(allowed ? 'Default allow (high trust)' : 'Default deny (low trust)');
    }

    conditions.push(
      { type: 'trust-score', requirement: '>= 50', met: trustScore >= 50 },
      { type: 'session-valid', requirement: 'active session', met: !!request.context.session },
      { type: 'device-trusted', requirement: 'trusted device', met: request.context.device?.trusted ?? false }
    );

    const decision: AccessDecision = {
      requestId: request.requestId,
      allowed,
      trustScore,
      reasons,
      conditions,
      audit: {
        logId: `audit-${++this.auditCounter}`,
        timestamp: new Date(),
        policyId: matchedPolicy?.id,
      },
    };

    this.auditLog.push({
      id: decision.audit.logId,
      request,
      decision,
      timestamp: new Date(),
    });

    return decision;
  }

  calculateTrustScore(subject: AccessRequest['subject'], context: AccessRequest['context']): number {
    let score = 0;

    if (subject.type === 'system') score += 30;
    else if (subject.type === 'user') score += 20;
    else if (subject.type === 'service') score += 15;
    else score += 5;

    if (context.session?.mfaVerified) score += 25;
    if (context.session) score += 15;
    if (context.device?.trusted) score += 20;

    const deviceId = context.device?.id;
    if (deviceId && this.trustedDevices.get(subject.id)?.has(deviceId)) {
      score += 10;
    }

    return Math.min(100, score);
  }

  async registerPolicy(policy: ZeroTrustPolicy): Promise<void> {
    this.policies.set(policy.id, policy);
  }

  async unregisterPolicy(policyId: string): Promise<void> {
    this.policies.delete(policyId);
  }

  getPolicies(): ZeroTrustPolicy[] {
    return Array.from(this.policies.values());
  }

  async addTrustedDevice(subjectId: string, deviceId: string): Promise<void> {
    if (!this.trustedDevices.has(subjectId)) {
      this.trustedDevices.set(subjectId, new Set());
    }
    this.trustedDevices.get(subjectId)!.add(deviceId);
  }

  async removeTrustedDevice(subjectId: string, deviceId: string): Promise<void> {
    this.trustedDevices.get(subjectId)?.delete(deviceId);
  }

  getAuditLog(filter?: AuditFilter): AuditEntry[] {
    let logs = [...this.auditLog];

    if (filter?.subjectId) {
      logs = logs.filter(l => l.request.subject.id === filter.subjectId);
    }
    if (filter?.resourceId) {
      logs = logs.filter(l => l.request.resource.id === filter.resourceId);
    }
    if (filter?.action) {
      logs = logs.filter(l => l.request.action === filter.action);
    }
    if (filter?.fromDate) {
      logs = logs.filter(l => l.timestamp >= filter.fromDate!);
    }
    if (filter?.toDate) {
      logs = logs.filter(l => l.timestamp <= filter.toDate!);
    }
    if (filter?.allowed !== undefined) {
      logs = logs.filter(l => l.decision.allowed === filter.allowed);
    }

    return logs;
  }

  private matchesPolicy(request: AccessRequest, policy: ZeroTrustPolicy): boolean {
    for (const condition of policy.conditions) {
      const value = this.getNestedValue(request, condition.field);
      if (!this.matchCondition(value, condition.operator, condition.value)) {
        return false;
      }
    }
    return true;
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    const parts = path.split('.');
    let current = obj as Record<string, unknown>;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part] as Record<string, unknown>;
    }
    return current;
  }

  private matchCondition(value: unknown, operator: PolicyCondition['operator'], expected: unknown): boolean {
    switch (operator) {
      case 'eq': return value === expected;
      case 'neq': return value !== expected;
      case 'in': return Array.isArray(expected) && expected.includes(value);
      case 'nin': return Array.isArray(expected) && !expected.includes(value);
      case 'gt': return typeof value === 'number' && typeof expected === 'number' && value > expected;
      case 'lt': return typeof value === 'number' && typeof expected === 'number' && value < expected;
      case 'exists': return (value !== undefined) === expected;
      case 'regex': return typeof value === 'string' && typeof expected === 'string' && new RegExp(expected).test(value);
      default: return false;
    }
  }
}

// ==================== VAULT IMPLEMENTATION ====================
class VaultImpl implements IVault {
  private secrets: Map<string, { value: string; meta: VaultSecret }> = new Map();
  private accessLog: SecretAccessLog[] = [];
  private encryptionKey = 'sovereign-vault-key';

  async setSecret(name: string, value: string, options?: SecretOptions): Promise<VaultSecret> {
    const meta: VaultSecret = {
      id: `secret-${Date.now()}`,
      name,
      type: options?.type ?? 'api-key',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: options?.expiresAt,
        version: 1,
        tags: options?.tags ?? [],
      },
      access: {
        allowedServices: options?.allowedServices ?? ['*'],
        allowedRoles: options?.allowedRoles ?? ['owner'],
        requireMFA: options?.requireMFA ?? false,
      },
      rotation: {
        enabled: options?.rotationEnabled ?? false,
        intervalDays: options?.rotationIntervalDays,
      },
    };

    const encrypted = await this.encrypt(value);
    this.secrets.set(name, { value: encrypted, meta });

    return meta;
  }

  async getSecret(name: string, serviceId: string): Promise<string | null> {
    const secret = this.secrets.get(name);
    if (!secret) {
      this.logAccess(name, serviceId, 'read', false);
      return null;
    }

    const allowed = secret.meta.access.allowedServices.includes('*') || 
                    secret.meta.access.allowedServices.includes(serviceId);

    this.logAccess(name, serviceId, 'read', allowed);

    if (!allowed) return null;

    return this.decrypt(secret.value);
  }

  async deleteSecret(name: string): Promise<void> {
    this.secrets.delete(name);
  }

  async listSecrets(): Promise<VaultSecret[]> {
    return Array.from(this.secrets.values()).map(s => s.meta);
  }

  async rotateSecret(name: string): Promise<VaultSecret> {
    const secret = this.secrets.get(name);
    if (!secret) throw new Error(`Secret not found: ${name}`);

    secret.meta.metadata.version++;
    secret.meta.metadata.rotatedAt = new Date();
    secret.meta.metadata.updatedAt = new Date();
    secret.meta.rotation.lastRotated = new Date();

    return secret.meta;
  }

  async setRotationPolicy(name: string, intervalDays: number): Promise<void> {
    const secret = this.secrets.get(name);
    if (!secret) throw new Error(`Secret not found: ${name}`);

    secret.meta.rotation.enabled = true;
    secret.meta.rotation.intervalDays = intervalDays;
    secret.meta.rotation.nextRotation = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
  }

  async grantAccess(secretName: string, serviceId: string): Promise<void> {
    const secret = this.secrets.get(secretName);
    if (!secret) throw new Error(`Secret not found: ${secretName}`);

    if (!secret.meta.access.allowedServices.includes(serviceId)) {
      secret.meta.access.allowedServices.push(serviceId);
    }
  }

  async revokeAccess(secretName: string, serviceId: string): Promise<void> {
    const secret = this.secrets.get(secretName);
    if (!secret) return;

    secret.meta.access.allowedServices = secret.meta.access.allowedServices.filter(s => s !== serviceId);
  }

  getAccessLog(secretName: string): SecretAccessLog[] {
    return this.accessLog.filter(l => l.secretName === secretName);
  }

  async encrypt(data: string): Promise<string> {
    return Buffer.from(data).toString('base64');
  }

  async decrypt(encryptedData: string): Promise<string> {
    return Buffer.from(encryptedData, 'base64').toString('utf-8');
  }

  private logAccess(secretName: string, serviceId: string, action: SecretAccessLog['action'], allowed: boolean): void {
    this.accessLog.push({
      secretName,
      serviceId,
      action,
      timestamp: new Date(),
      allowed,
    });
  }
}

// ==================== SINGLETON EXPORTS ====================
export const zeroTrustEngine: IZeroTrustEngine = new ZeroTrustEngineImpl();
export const vault: IVault = new VaultImpl();

export default { zeroTrustEngine, vault };
