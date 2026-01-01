/**
 * INFERA WebNova - Sovereign Contracts & Schemas
 * ROOT_OWNER Authority Definitions
 * Version: 7.0.0
 * 
 * This file defines the core contracts for the Sovereign Operating System
 * following the "Owner Sovereign Account – Final Mandatory Directive"
 */

import { z } from 'zod';

// ==================== SOVEREIGN IDENTITY ====================

/**
 * Authority Levels - Hierarchical power structure
 */
export const AuthorityLevels = {
  ABSOLUTE_SOVEREIGNTY: 'ABSOLUTE_SOVEREIGNTY',
  SOVEREIGN_DELEGATE: 'SOVEREIGN_DELEGATE',
  ENTERPRISE_ACCESS: 'ENTERPRISE_ACCESS',
  PROFESSIONAL_ACCESS: 'PROFESSIONAL_ACCESS',
  BASIC_ACCESS: 'BASIC_ACCESS',
  FREE_ACCESS: 'FREE_ACCESS',
} as const;

export type AuthorityLevel = typeof AuthorityLevels[keyof typeof AuthorityLevels];

/**
 * Identity States - Immutability classification
 */
export const IdentityStates = {
  IMMUTABLE: 'IMMUTABLE',
  PROTECTED: 'PROTECTED',
  STANDARD: 'STANDARD',
} as const;

export type IdentityState = typeof IdentityStates[keyof typeof IdentityStates];

/**
 * Origin Types - Account creation source
 */
export const OriginTypes = {
  SYSTEM_FOUNDATION: 'SYSTEM_FOUNDATION',
  OWNER_CREATED: 'OWNER_CREATED',
  SELF_REGISTERED: 'SELF_REGISTERED',
} as const;

export type OriginType = typeof OriginTypes[keyof typeof OriginTypes];

/**
 * ROOT_OWNER Identity Schema
 * The supreme authority in the system
 */
export const RootOwnerIdentitySchema = z.object({
  userId: z.string(),
  role: z.literal('owner'),
  authorityLevel: z.literal('ABSOLUTE_SOVEREIGNTY'),
  identityState: z.literal('IMMUTABLE'),
  origin: z.literal('SYSTEM_FOUNDATION'),
  constraints: z.object({
    canBeDeleted: z.literal(false),
    canBeDisabled: z.literal(false),
    canBeDemoted: z.literal(false),
    subjectToSubscription: z.literal(false),
    subjectToBilling: z.literal(false),
    subjectToLimits: z.literal(false),
    subjectToPolicies: z.literal(false),
  }),
});

export type RootOwnerIdentity = z.infer<typeof RootOwnerIdentitySchema>;

// ==================== OPERATIONAL MODES ====================

/**
 * Operational Mode Types
 */
export const OperationalModes = {
  OWNER_SOVEREIGN_MODE: 'OWNER_SOVEREIGN_MODE',
  SUBSCRIBER_RESTRICTED_MODE: 'SUBSCRIBER_RESTRICTED_MODE',
} as const;

export type OperationalMode = typeof OperationalModes[keyof typeof OperationalModes];

/**
 * Operational Mode Context Schema
 * Determined at login and stored in session
 */
export const OperationalModeContextSchema = z.object({
  mode: z.enum(['OWNER_SOVEREIGN_MODE', 'SUBSCRIBER_RESTRICTED_MODE']),
  userId: z.string(),
  sessionId: z.string(),
  determinedAt: z.date(),
  capabilities: z.object({
    canDefineRules: z.boolean(),
    canModifyPricing: z.boolean(),
    canCreatePlatforms: z.boolean(),
    canAccessEmergencyControls: z.boolean(),
    canViewAllUsers: z.boolean(),
    canModifyUserRoles: z.boolean(),
    canBypassLimits: z.boolean(),
    canAccessAuditLogs: z.boolean(),
  }),
  restrictions: z.object({
    maxProjects: z.number().nullable(),
    maxAIGenerations: z.number().nullable(),
    allowedPaymentMethods: z.array(z.string()).nullable(),
    allowedAuthProviders: z.array(z.string()).nullable(),
    subscribedPlan: z.string().nullable(),
  }),
});

export type OperationalModeContext = z.infer<typeof OperationalModeContextSchema>;

// ==================== SOVEREIGN PLATFORM FACTORY ====================

/**
 * Platform Types - Categories defined by Owner
 */
export const PlatformTypes = {
  INTERNAL_INFRA: 'INTERNAL_INFRA',
  SUBSCRIBER_COMMERCIAL: 'SUBSCRIBER_COMMERCIAL',
  GOVERNMENT_SOVEREIGN: 'GOVERNMENT_SOVEREIGN',
  CUSTOM_SOVEREIGN: 'CUSTOM_SOVEREIGN',
} as const;

export type PlatformType = typeof PlatformTypes[keyof typeof PlatformTypes];

/**
 * Sovereignty Levels for Platforms
 */
export const SovereigntyLevels = {
  FULL_SOVEREIGN: 'FULL_SOVEREIGN',
  DELEGATED_SOVEREIGN: 'DELEGATED_SOVEREIGN',
  RESTRICTED: 'RESTRICTED',
  MANAGED: 'MANAGED',
} as const;

export type SovereigntyLevel = typeof SovereigntyLevels[keyof typeof SovereigntyLevels];

/**
 * Sovereign Platform Schema
 * Only visible and configurable by ROOT_OWNER
 */
export const SovereignPlatformSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  nameAr: z.string(),
  type: z.enum(['INTERNAL_INFRA', 'SUBSCRIBER_COMMERCIAL', 'GOVERNMENT_SOVEREIGN', 'CUSTOM_SOVEREIGN']),
  sovereigntyLevel: z.enum(['FULL_SOVEREIGN', 'DELEGATED_SOVEREIGN', 'RESTRICTED', 'MANAGED']),
  configuration: z.object({
    subjectToSubscription: z.boolean(),
    defaultRestrictions: z.record(z.unknown()),
    evolutionCapability: z.boolean(),
    crossPlatformLinking: z.boolean(),
    complianceRequirements: z.array(z.string()),
  }),
  status: z.enum(['active', 'suspended', 'archived', 'pending']),
  createdBy: z.literal('ROOT_OWNER'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SovereignPlatform = z.infer<typeof SovereignPlatformSchema>;

// ==================== EMERGENCY CONTROL ====================

/**
 * Emergency Action Types
 */
export const EmergencyActions = {
  HALT_ALL_PLATFORMS: 'HALT_ALL_PLATFORMS',
  FREEZE_ALL_SUBSCRIPTIONS: 'FREEZE_ALL_SUBSCRIPTIONS',
  STOP_ALL_OPERATIONS: 'STOP_ALL_OPERATIONS',
  LOCKDOWN_SYSTEM: 'LOCKDOWN_SYSTEM',
  RESTORE_NORMAL: 'RESTORE_NORMAL',
} as const;

export type EmergencyAction = typeof EmergencyActions[keyof typeof EmergencyActions];

/**
 * Emergency Control Schema
 * Owner-only, global scope, immediate effect
 */
export const EmergencyControlSchema = z.object({
  id: z.string().uuid(),
  action: z.enum([
    'HALT_ALL_PLATFORMS',
    'FREEZE_ALL_SUBSCRIPTIONS',
    'STOP_ALL_OPERATIONS',
    'LOCKDOWN_SYSTEM',
    'RESTORE_NORMAL',
  ]),
  triggeredBy: z.literal('ROOT_OWNER'),
  reason: z.string(),
  scope: z.literal('GLOBAL'),
  timestamp: z.date(),
  reversible: z.boolean(),
  auditLog: z.object({
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    additionalContext: z.record(z.unknown()).optional(),
  }),
  hiddenFromSubscribers: z.literal(true),
});

export type EmergencyControl = z.infer<typeof EmergencyControlSchema>;

// ==================== SYSTEM AWARENESS ====================

/**
 * System Awareness Check Schema
 * For automatic approval of ROOT_OWNER requests
 */
export const SystemAwarenessCheckSchema = z.object({
  requesterId: z.string(),
  isRootOwner: z.boolean(),
  autoApproved: z.boolean(),
  appliedPolicies: z.array(z.string()),
  appliedLimits: z.array(z.string()),
  appliedRestrictions: z.array(z.string()),
  priority: z.enum(['absolute', 'high', 'normal', 'low']),
  timestamp: z.date(),
});

export type SystemAwarenessCheck = z.infer<typeof SystemAwarenessCheckSchema>;

// ==================== FINANCIAL SEPARATION ====================

/**
 * Financial Context Schema
 * Complete separation between Owner and Subscribers
 */
export const FinancialContextSchema = z.object({
  userId: z.string(),
  isRootOwner: z.boolean(),
  billingApplicable: z.boolean(),
  subscriptionApplicable: z.boolean(),
  limitsApplicable: z.boolean(),
  canDefinePricing: z.boolean(),
  canWaiveFees: z.boolean(),
  canSuspendBilling: z.boolean(),
  invoicesGenerated: z.boolean(),
});

export type FinancialContext = z.infer<typeof FinancialContextSchema>;

// ==================== AUDIT LOG ====================

/**
 * Sovereign Audit Log Schema
 * Hidden from subscribers, visible only to ROOT_OWNER
 */
export const SovereignAuditLogSchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  performedBy: z.string(),
  performerRole: z.string(),
  targetType: z.enum(['user', 'platform', 'subscription', 'system', 'emergency']),
  targetId: z.string(),
  details: z.record(z.unknown()),
  timestamp: z.date(),
  visibleToSubscribers: z.boolean().default(false),
});

export type SovereignAuditLog = z.infer<typeof SovereignAuditLogSchema>;

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if a user is ROOT_OWNER
 */
export function isRootOwner(role: string): boolean {
  return role === 'owner';
}

/**
 * Get operational mode based on user role
 */
export function getOperationalMode(role: string): OperationalMode {
  return isRootOwner(role)
    ? OperationalModes.OWNER_SOVEREIGN_MODE
    : OperationalModes.SUBSCRIBER_RESTRICTED_MODE;
}

/**
 * Get ROOT_OWNER identity constraints
 */
export function getRootOwnerConstraints(): RootOwnerIdentity['constraints'] {
  return {
    canBeDeleted: false,
    canBeDisabled: false,
    canBeDemoted: false,
    subjectToSubscription: false,
    subjectToBilling: false,
    subjectToLimits: false,
    subjectToPolicies: false,
  };
}

/**
 * Get capabilities for OWNER_SOVEREIGN_MODE
 */
export function getSovereignCapabilities(): OperationalModeContext['capabilities'] {
  return {
    canDefineRules: true,
    canModifyPricing: true,
    canCreatePlatforms: true,
    canAccessEmergencyControls: true,
    canViewAllUsers: true,
    canModifyUserRoles: true,
    canBypassLimits: true,
    canAccessAuditLogs: true,
  };
}

/**
 * Get capabilities for SUBSCRIBER_RESTRICTED_MODE
 */
export function getSubscriberCapabilities(): OperationalModeContext['capabilities'] {
  return {
    canDefineRules: false,
    canModifyPricing: false,
    canCreatePlatforms: false,
    canAccessEmergencyControls: false,
    canViewAllUsers: false,
    canModifyUserRoles: false,
    canBypassLimits: false,
    canAccessAuditLogs: false,
  };
}

/**
 * Get financial context for ROOT_OWNER
 */
export function getRootOwnerFinancialContext(userId: string): FinancialContext {
  return {
    userId,
    isRootOwner: true,
    billingApplicable: false,
    subscriptionApplicable: false,
    limitsApplicable: false,
    canDefinePricing: true,
    canWaiveFees: true,
    canSuspendBilling: true,
    invoicesGenerated: false,
  };
}

/**
 * Get financial context for Subscriber
 */
export function getSubscriberFinancialContext(userId: string): FinancialContext {
  return {
    userId,
    isRootOwner: false,
    billingApplicable: true,
    subscriptionApplicable: true,
    limitsApplicable: true,
    canDefinePricing: false,
    canWaiveFees: false,
    canSuspendBilling: false,
    invoicesGenerated: true,
  };
}
