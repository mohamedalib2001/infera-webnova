/**
 * INFERA WebNova - Sovereign Mode Context Service
 * Implements the dual operational modes system
 * Version: 7.0.0
 * 
 * This service manages:
 * - OWNER_SOVEREIGN_MODE: Full authority, no restrictions
 * - SUBSCRIBER_RESTRICTED_MODE: Subject to policies and limits
 */

import type { Request, Response, NextFunction } from 'express';
import type { User } from '@shared/schema';
import {
  isRootOwner,
  getOperationalMode,
  getAuthorityLevel,
  getIdentityState,
  type OperationalMode,
  type AuthorityLevel,
  type IdentityState,
} from '@shared/schema';

// ==================== TYPES ====================

export interface SovereignCapabilities {
  canDefineRules: boolean;
  canModifyPricing: boolean;
  canCreatePlatforms: boolean;
  canAccessEmergencyControls: boolean;
  canViewAllUsers: boolean;
  canModifyUserRoles: boolean;
  canBypassLimits: boolean;
  canAccessAuditLogs: boolean;
  canManagePaymentMethods: boolean;
  canManageAuthProviders: boolean;
  canSuspendUsers: boolean;
  canDeleteUsers: boolean;
}

export interface SovereignRestrictions {
  maxProjects: number | null;
  maxAIGenerations: number | null;
  allowedPaymentMethods: string[] | null;
  allowedAuthProviders: string[] | null;
  subscribedPlan: string | null;
  billingRequired: boolean;
}

export interface SovereignContext {
  mode: OperationalMode;
  userId: string;
  role: string;
  authorityLevel: AuthorityLevel;
  identityState: IdentityState;
  capabilities: SovereignCapabilities;
  restrictions: SovereignRestrictions;
  determinedAt: Date;
  isRootOwner: boolean;
}

// ==================== CONTEXT BUILDER ====================

/**
 * Get sovereign capabilities based on operational mode
 */
export function getSovereignCapabilities(mode: OperationalMode): SovereignCapabilities {
  if (mode === 'OWNER_SOVEREIGN_MODE') {
    return {
      canDefineRules: true,
      canModifyPricing: true,
      canCreatePlatforms: true,
      canAccessEmergencyControls: true,
      canViewAllUsers: true,
      canModifyUserRoles: true,
      canBypassLimits: true,
      canAccessAuditLogs: true,
      canManagePaymentMethods: true,
      canManageAuthProviders: true,
      canSuspendUsers: true,
      canDeleteUsers: true,
    };
  }

  return {
    canDefineRules: false,
    canModifyPricing: false,
    canCreatePlatforms: false,
    canAccessEmergencyControls: false,
    canViewAllUsers: false,
    canModifyUserRoles: false,
    canBypassLimits: false,
    canAccessAuditLogs: false,
    canManagePaymentMethods: false,
    canManageAuthProviders: false,
    canSuspendUsers: false,
    canDeleteUsers: false,
  };
}

/**
 * Get restrictions based on operational mode and subscription
 */
export function getSovereignRestrictions(
  mode: OperationalMode,
  subscription?: { planId: string; maxProjects?: number; maxAIGenerations?: number }
): SovereignRestrictions {
  if (mode === 'OWNER_SOVEREIGN_MODE') {
    return {
      maxProjects: null,
      maxAIGenerations: null,
      allowedPaymentMethods: null,
      allowedAuthProviders: null,
      subscribedPlan: null,
      billingRequired: false,
    };
  }

  return {
    maxProjects: subscription?.maxProjects || 1,
    maxAIGenerations: subscription?.maxAIGenerations || 10,
    allowedPaymentMethods: ['stripe', 'paypal'],
    allowedAuthProviders: ['email', 'google', 'replit'],
    subscribedPlan: subscription?.planId || 'free',
    billingRequired: true,
  };
}

/**
 * Build complete sovereign context for a user
 */
export function buildSovereignContext(user: User, subscription?: any): SovereignContext {
  const mode = getOperationalMode(user.role);
  const authorityLevel = getAuthorityLevel(user.role);
  const identityState = getIdentityState(user.role);
  const capabilities = getSovereignCapabilities(mode);
  const restrictions = getSovereignRestrictions(mode, subscription);

  return {
    mode,
    userId: user.id,
    role: user.role,
    authorityLevel,
    identityState,
    capabilities,
    restrictions,
    determinedAt: new Date(),
    isRootOwner: isRootOwner(user.role),
  };
}

// ==================== MIDDLEWARE ====================

/**
 * Extend Express Request to include sovereign context
 */
declare global {
  namespace Express {
    interface Request {
      sovereignContext?: SovereignContext;
    }
  }
}

/**
 * Middleware to inject sovereign context into every authenticated request
 */
export function injectSovereignContext(req: Request, res: Response, next: NextFunction) {
  const user = req.user as User | undefined;
  
  if (!user) {
    return next();
  }

  req.sovereignContext = buildSovereignContext(user);
  next();
}

/**
 * Middleware to require OWNER_SOVEREIGN_MODE
 */
export function requireSovereignMode(req: Request, res: Response, next: NextFunction) {
  if (!req.sovereignContext) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.sovereignContext.mode !== 'OWNER_SOVEREIGN_MODE') {
    return res.status(403).json({ 
      error: 'Sovereign authority required',
      errorAr: 'السلطة السيادية مطلوبة'
    });
  }

  next();
}

/**
 * Middleware to check specific capability
 */
export function requireCapability(capability: keyof SovereignCapabilities) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.sovereignContext) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!req.sovereignContext.capabilities[capability]) {
      return res.status(403).json({ 
        error: `Missing capability: ${capability}`,
        errorAr: `صلاحية مفقودة: ${capability}`
      });
    }

    next();
  };
}

// ==================== VALIDATION GUARDS ====================

/**
 * Guard: Prevent actions on ROOT_OWNER
 * ROOT_OWNER cannot be deleted, disabled, or demoted
 */
export function guardRootOwnerImmutability(
  targetUser: User,
  action: 'delete' | 'disable' | 'demote' | 'modify_role'
): { allowed: boolean; reason?: string; reasonAr?: string } {
  if (!isRootOwner(targetUser.role)) {
    return { allowed: true };
  }

  const errorMessages = {
    delete: {
      reason: 'ROOT_OWNER cannot be deleted',
      reasonAr: 'لا يمكن حذف المالك الجذري',
    },
    disable: {
      reason: 'ROOT_OWNER cannot be disabled',
      reasonAr: 'لا يمكن تعطيل المالك الجذري',
    },
    demote: {
      reason: 'ROOT_OWNER cannot be demoted',
      reasonAr: 'لا يمكن تخفيض رتبة المالك الجذري',
    },
    modify_role: {
      reason: 'ROOT_OWNER role is immutable',
      reasonAr: 'دور المالك الجذري غير قابل للتعديل',
    },
  };

  return {
    allowed: false,
    ...errorMessages[action],
  };
}

/**
 * Guard: Prevent billing/subscription actions on ROOT_OWNER
 */
export function guardRootOwnerFinancialImmunity(
  userId: string,
  userRole: string,
  action: 'create_subscription' | 'apply_billing' | 'enforce_limit'
): { allowed: boolean; reason?: string; reasonAr?: string } {
  if (!isRootOwner(userRole)) {
    return { allowed: true };
  }

  const errorMessages = {
    create_subscription: {
      reason: 'ROOT_OWNER is not subject to subscriptions',
      reasonAr: 'المالك الجذري لا يخضع للاشتراكات',
    },
    apply_billing: {
      reason: 'ROOT_OWNER is not subject to billing',
      reasonAr: 'المالك الجذري لا يخضع للفوترة',
    },
    enforce_limit: {
      reason: 'ROOT_OWNER is not subject to limits',
      reasonAr: 'المالك الجذري لا يخضع للقيود',
    },
  };

  return {
    allowed: false,
    ...errorMessages[action],
  };
}

// ==================== SYSTEM AWARENESS ====================

/**
 * System Awareness Check
 * Determines how to process a request based on requester identity
 */
export function systemAwarenessCheck(
  requesterId: string,
  requesterRole: string
): {
  autoApproved: boolean;
  appliedPolicies: string[];
  appliedLimits: string[];
  priority: 'absolute' | 'high' | 'normal' | 'low';
} {
  if (isRootOwner(requesterRole)) {
    return {
      autoApproved: true,
      appliedPolicies: [],
      appliedLimits: [],
      priority: 'absolute',
    };
  }

  return {
    autoApproved: false,
    appliedPolicies: ['standard_access_policy', 'subscription_policy'],
    appliedLimits: ['project_limit', 'ai_generation_limit', 'storage_limit'],
    priority: requesterRole === 'sovereign' ? 'high' : 'normal',
  };
}

/**
 * Check if request should be auto-approved (ROOT_OWNER only)
 */
export function shouldAutoApprove(context: SovereignContext): boolean {
  return context.mode === 'OWNER_SOVEREIGN_MODE' && context.isRootOwner;
}

/**
 * Get applicable policies for a user
 */
export function getApplicablePolicies(context: SovereignContext): string[] {
  if (context.isRootOwner) {
    return [];
  }

  const policies: string[] = ['base_access_policy'];

  if (context.restrictions.billingRequired) {
    policies.push('billing_policy');
  }

  if (context.restrictions.subscribedPlan) {
    policies.push(`plan_policy_${context.restrictions.subscribedPlan}`);
  }

  return policies;
}

/**
 * Get applicable limits for a user
 */
export function getApplicableLimits(context: SovereignContext): Record<string, number | null> {
  if (context.isRootOwner) {
    return {};
  }

  return {
    maxProjects: context.restrictions.maxProjects,
    maxAIGenerations: context.restrictions.maxAIGenerations,
  };
}
