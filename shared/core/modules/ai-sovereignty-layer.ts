/**
 * AI SOVEREIGNTY LAYER - طبقة سيادة الذكاء
 * 
 * OWNER EXCLUSIVE - غير مرئية للمشتركين
 * 
 * هذه الطبقة تدير:
 * - AI Layers (طبقات الذكاء)
 * - AI Power Control (التحكم بقوة الذكاء)
 * - External AI Integrations (ربط الذكاء الخارجي)
 * - Subscriber AI Boundaries (حدود المشتركين)
 * - AI Kill Switch (زر الطوارئ)
 * - AI Sovereignty Audit Logs (سجل السيادة)
 * - AI Constitution (دستور الذكاء)
 */

import { z } from 'zod';
import type {
  AILayerRecord,
  AIPowerConfigRecord,
  ExternalAIProviderRecord,
  SubscriberAILimitRecord,
  SovereignAIAgentRecord,
  AIKillSwitchStateRecord,
  AISovereigntyAuditLogRecord,
  AIConstitutionRecord,
  AILayerType,
  AILayerStatus,
} from '../../schema';

// ============ TYPES ============

export interface AISovereigntyContext {
  isOwner: boolean;
  userId: string;
  role: string;
  canManageLayers: boolean;
  canManagePower: boolean;
  canLinkExternal: boolean;
  canSetLimits: boolean;
  canActivateKillSwitch: boolean;
  canViewAuditLogs: boolean;
  canModifyConstitution: boolean;
}

export interface AILayerWithPower extends AILayerRecord {
  powerConfig?: AIPowerConfigRecord;
  assistantCount?: number;
}

export interface AIProhibitionViolation {
  type: 'NO_LAYER' | 'NO_LIMITS' | 'UNDEFINED_POWER' | 'EXTERNAL_WITHOUT_APPROVAL' | 'SUBSCRIBER_WITHOUT_DECISION';
  message: string;
  messageAr: string;
  severity: 'block' | 'warning' | 'log';
}

export interface AIKillSwitchAction {
  scope: 'global' | 'layer' | 'external_only' | 'specific_layer';
  targetLayerId?: string;
  reason: string;
  reasonAr: string;
  autoReactivateMinutes?: number;
}

// ============ VALIDATION SCHEMAS ============

export const createAILayerSchema = z.object({
  name: z.string().min(1, "Layer name is required"),
  nameAr: z.string().min(1, "اسم الطبقة مطلوب"),
  purpose: z.string().min(1, "Layer purpose is required"),
  purposeAr: z.string().optional(),
  type: z.enum(['INTERNAL_SOVEREIGN', 'EXTERNAL_MANAGED', 'HYBRID', 'SUBSCRIBER_RESTRICTED']),
  priority: z.number().min(1).max(10).default(1),
  allowedForSubscribers: z.boolean().default(false),
  subscriberVisibility: z.enum(['hidden', 'limited', 'full']).default('hidden'),
});

export const updateAIPowerSchema = z.object({
  powerLevel: z.number().min(1).max(10).optional(),
  maxTokensPerRequest: z.number().min(100).max(128000).optional(),
  maxRequestsPerMinute: z.number().min(1).max(10000).optional(),
  maxConcurrentRequests: z.number().min(1).max(100).optional(),
  cpuAllocation: z.enum(['minimal', 'standard', 'high', 'maximum']).optional(),
  memoryAllocation: z.enum(['minimal', 'standard', 'high', 'maximum']).optional(),
  monthlyBudgetLimit: z.number().nullable().optional(),
  subscriberCanSeeCost: z.boolean().optional(),
});

export const createExternalProviderSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  provider: z.enum(['openai', 'anthropic', 'google', 'azure', 'custom']),
  apiEndpoint: z.string().optional(),
  apiKeySecretName: z.string().optional(),
  allowedForSubscribers: z.boolean().default(false),
  linkedLayerIds: z.array(z.string()).default([]),
  rateLimit: z.number().min(1).max(10000).default(100),
  monthlyBudget: z.number().nullable().optional(),
});

export const setSubscriberLimitSchema = z.object({
  role: z.enum(['free', 'basic', 'pro', 'enterprise', 'sovereign']),
  maxPowerLevel: z.number().min(1).max(10),
  maxTokensPerRequest: z.number().min(100).max(32000),
  maxRequestsPerDay: z.number().min(1).max(100000),
  maxRequestsPerMinute: z.number().min(1).max(1000),
  allowedTaskTypes: z.array(z.string()).default([]),
  blockedTaskTypes: z.array(z.string()).default([]),
  canAccessExternalAI: z.boolean().default(false),
  canSeeAILayers: z.boolean().default(false),
  enforcementAction: z.enum(['block', 'log', 'auto_suspend']).default('block'),
});

export const createAIAssistantSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  layerId: z.string().min(1, "Layer ID is required - no AI without Layer"),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  model: z.string().default('claude-sonnet-4-20250514'),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(128000).default(4096),
  availableToSubscribers: z.boolean().default(false),
  requiresSovereignApproval: z.boolean().default(true),
});

// ============ AI SOVEREIGNTY CONTEXT BUILDER ============

export function buildAISovereigntyContext(user: { id: string; role: string }): AISovereigntyContext {
  const isOwner = user.role === 'owner';
  
  return {
    isOwner,
    userId: user.id,
    role: user.role,
    canManageLayers: isOwner,
    canManagePower: isOwner,
    canLinkExternal: isOwner,
    canSetLimits: isOwner,
    canActivateKillSwitch: isOwner,
    canViewAuditLogs: isOwner,
    canModifyConstitution: isOwner,
  };
}

// ============ PROHIBITION SYSTEM ============

export function checkAIProhibitions(
  assistant: Partial<AIAssistantRecord>,
  constitution: AIConstitutionRecord | null
): AIProhibitionViolation[] {
  const violations: AIProhibitionViolation[] = [];
  
  if (!constitution || !constitution.isActive) {
    return violations;
  }
  
  const rules = constitution.rules as {
    noAIWithoutLayer: boolean;
    noAIWithoutLimits: boolean;
    noUndefinedPower: boolean;
    noExternalWithoutApproval: boolean;
    noSubscriberAccessWithoutDecision: boolean;
  };
  
  const severity = constitution.enforcementLevel === 'strict' ? 'block' : 
                   constitution.enforcementLevel === 'warning' ? 'warning' : 'log';
  
  if (rules.noAIWithoutLayer && !assistant.layerId) {
    violations.push({
      type: 'NO_LAYER',
      message: 'AI Assistant must be assigned to a Layer',
      messageAr: 'يجب تعيين مساعد الذكاء لطبقة',
      severity,
    });
  }
  
  if (rules.noSubscriberAccessWithoutDecision && assistant.availableToSubscribers === undefined) {
    violations.push({
      type: 'SUBSCRIBER_WITHOUT_DECISION',
      message: 'Subscriber access must be explicitly decided',
      messageAr: 'يجب تحديد وصول المشترك بشكل صريح',
      severity,
    });
  }
  
  return violations;
}

export function checkExternalProviderProhibitions(
  provider: Partial<ExternalAIProviderRecord>,
  constitution: AIConstitutionRecord | null,
  isOwnerAction: boolean
): AIProhibitionViolation[] {
  const violations: AIProhibitionViolation[] = [];
  
  if (!constitution || !constitution.isActive) {
    return violations;
  }
  
  const rules = constitution.rules as {
    noExternalWithoutApproval: boolean;
  };
  
  const severity = constitution.enforcementLevel === 'strict' ? 'block' : 
                   constitution.enforcementLevel === 'warning' ? 'warning' : 'log';
  
  if (rules.noExternalWithoutApproval && !isOwnerAction) {
    violations.push({
      type: 'EXTERNAL_WITHOUT_APPROVAL',
      message: 'External AI linking requires Owner approval',
      messageAr: 'ربط الذكاء الخارجي يتطلب موافقة المالك',
      severity,
    });
  }
  
  return violations;
}

// ============ KILL SWITCH LOGIC ============

export function createKillSwitchPayload(action: AIKillSwitchAction): Partial<AIKillSwitchStateRecord> {
  const now = new Date();
  
  return {
    scope: action.scope,
    targetLayerId: action.targetLayerId || null,
    isActivated: true,
    activatedAt: now,
    reason: action.reason,
    reasonAr: action.reasonAr,
    autoReactivateAt: action.autoReactivateMinutes 
      ? new Date(now.getTime() + action.autoReactivateMinutes * 60000)
      : null,
    canSubscriberDeactivate: false, // NEVER allow subscriber to deactivate
  };
}

export function isKillSwitchActive(states: AIKillSwitchStateRecord[]): {
  globalKilled: boolean;
  externalKilled: boolean;
  killedLayerIds: string[];
} {
  const now = new Date();
  const activeStates = states.filter(s => {
    if (!s.isActivated) return false;
    if (s.autoReactivateAt && new Date(s.autoReactivateAt) < now) return false;
    return true;
  });
  
  return {
    globalKilled: activeStates.some(s => s.scope === 'global'),
    externalKilled: activeStates.some(s => s.scope === 'external_only' || s.scope === 'global'),
    killedLayerIds: activeStates
      .filter(s => s.scope === 'specific_layer' && s.targetLayerId)
      .map(s => s.targetLayerId!),
  };
}

// ============ AUDIT LOG HELPERS ============

export function createAuditLogChecksum(log: Partial<AISovereigntyAuditLogRecord>): string {
  const data = JSON.stringify({
    action: log.action,
    performedBy: log.performedBy,
    targetType: log.targetType,
    targetId: log.targetId,
    timestamp: log.timestamp || new Date().toISOString(),
  });
  
  // Simple hash for demo - in production use crypto
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `SEAL-${Math.abs(hash).toString(16).toUpperCase().padStart(16, '0')}`;
}

// ============ SUBSCRIBER VISIBILITY FILTER ============

export function filterForSubscriber<T extends { subscriberVisibility?: string }>(
  items: T[],
  userRole: string
): T[] {
  if (userRole === 'owner') {
    return items; // Owner sees everything
  }
  
  return items.filter(item => {
    if (item.subscriberVisibility === 'full') return true;
    if (item.subscriberVisibility === 'limited') return true;
    return false;
  });
}

export function sanitizeForSubscriber<T extends Record<string, unknown>>(
  item: T,
  hiddenFields: string[]
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const key of Object.keys(item)) {
    if (!hiddenFields.includes(key)) {
      sanitized[key as keyof T] = item[key as keyof T];
    }
  }
  
  return sanitized;
}

// ============ DEFAULT CONSTITUTION ============

export const DEFAULT_AI_CONSTITUTION = {
  version: '1.0.0',
  rules: {
    noAIWithoutLayer: true,
    noAIWithoutLimits: true,
    noUndefinedPower: true,
    noExternalWithoutApproval: true,
    noSubscriberAccessWithoutDecision: true,
  },
  enforcementLevel: 'strict' as const,
  isActive: true,
};

// ============ POWER LEVEL DESCRIPTIONS ============

export const POWER_LEVEL_DESCRIPTIONS = {
  1: { en: 'Minimal', ar: 'الحد الأدنى', tokens: 1024, rpm: 10 },
  2: { en: 'Basic', ar: 'أساسي', tokens: 2048, rpm: 20 },
  3: { en: 'Standard', ar: 'قياسي', tokens: 4096, rpm: 30 },
  4: { en: 'Enhanced', ar: 'محسّن', tokens: 8192, rpm: 40 },
  5: { en: 'Professional', ar: 'احترافي', tokens: 16384, rpm: 60 },
  6: { en: 'Advanced', ar: 'متقدم', tokens: 32768, rpm: 80 },
  7: { en: 'High Performance', ar: 'أداء عالي', tokens: 65536, rpm: 100 },
  8: { en: 'Enterprise', ar: 'مؤسسي', tokens: 100000, rpm: 200 },
  9: { en: 'Sovereign', ar: 'سيادي', tokens: 128000, rpm: 500 },
  10: { en: 'Unlimited', ar: 'غير محدود', tokens: 200000, rpm: 1000 },
};

// ============ LAYER TYPE DESCRIPTIONS ============

export const LAYER_TYPE_DESCRIPTIONS: Record<AILayerType, { en: string; ar: string }> = {
  'INTERNAL_SOVEREIGN': {
    en: 'Internal Sovereign - Full owner control, not exposed to subscribers',
    ar: 'سيادي داخلي - تحكم كامل للمالك، غير مكشوف للمشتركين',
  },
  'EXTERNAL_MANAGED': {
    en: 'External Managed - Connected to external AI providers',
    ar: 'خارجي مُدار - متصل بمزودي الذكاء الخارجيين',
  },
  'HYBRID': {
    en: 'Hybrid - Mixed internal and external capabilities',
    ar: 'هجين - قدرات داخلية وخارجية مختلطة',
  },
  'SUBSCRIBER_RESTRICTED': {
    en: 'Subscriber Restricted - Limited capabilities for subscribers',
    ar: 'مقيّد للمشتركين - قدرات محدودة للمشتركين',
  },
};
