/**
 * INFERA WebNova - Sovereign Kernel (النواة السيادية)
 * Layer 0: Untouchable Core - DO NOT MODIFY AFTER LAUNCH
 * 
 * المبدأ الذهبي: المنصة لا تُبنى لتُستخدم اليوم، بل لتُضاف إليها أجيال دون لمس قلبها
 * 
 * This kernel contains ONLY:
 * - Lifecycle Management
 * - Permission Lattice
 * - Event Bus (reference)
 * - Extension Loader
 * - Policy Engine
 * 
 * ❗ NO FEATURES - NO BUSINESS LOGIC - NO MODIFICATIONS AFTER v1.0
 */

import { z } from 'zod';

// ==================== KERNEL VERSION ====================
export const KERNEL_VERSION = '1.0.0' as const;
export const KERNEL_LOCK_DATE = new Date('2025-12-20T00:00:00Z');

// ==================== LIFECYCLE PHASES ====================
export const LifecyclePhases = {
  BOOT: 'BOOT',
  INITIALIZE: 'INITIALIZE',
  CONFIGURE: 'CONFIGURE',
  ACTIVATE: 'ACTIVATE',
  RUNNING: 'RUNNING',
  SUSPEND: 'SUSPEND',
  SHUTDOWN: 'SHUTDOWN',
  TERMINATED: 'TERMINATED',
} as const;

export type LifecyclePhase = typeof LifecyclePhases[keyof typeof LifecyclePhases];

export const LifecycleEventSchema = z.object({
  phase: z.enum(['BOOT', 'INITIALIZE', 'CONFIGURE', 'ACTIVATE', 'RUNNING', 'SUSPEND', 'SHUTDOWN', 'TERMINATED']),
  timestamp: z.date(),
  source: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type LifecycleEvent = z.infer<typeof LifecycleEventSchema>;

// ==================== PERMISSION LATTICE ====================
export const PermissionLevels = {
  KERNEL: 0,        // Kernel-only operations
  SOVEREIGN: 1,     // Owner-exclusive
  SYSTEM: 2,        // System services
  PRIVILEGED: 3,    // Trusted extensions
  STANDARD: 4,      // Normal modules
  RESTRICTED: 5,    // Sandboxed plugins
  GUEST: 6,         // Read-only access
} as const;

export type PermissionLevel = typeof PermissionLevels[keyof typeof PermissionLevels];

export const PermissionSchema = z.object({
  level: z.number().min(0).max(6),
  scope: z.array(z.string()),
  grants: z.array(z.string()),
  denials: z.array(z.string()),
  conditions: z.array(z.object({
    type: z.string(),
    value: z.unknown(),
  })).optional(),
});

export type Permission = z.infer<typeof PermissionSchema>;

export const PermissionRequestSchema = z.object({
  requesterId: z.string(),
  requesterLevel: z.number(),
  action: z.string(),
  resource: z.string(),
  context: z.record(z.unknown()).optional(),
});

export type PermissionRequest = z.infer<typeof PermissionRequestSchema>;

export const PermissionDecisionSchema = z.object({
  allowed: z.boolean(),
  reason: z.string(),
  policyId: z.string().optional(),
  auditRef: z.string(),
});

export type PermissionDecision = z.infer<typeof PermissionDecisionSchema>;

// ==================== POLICY ENGINE ====================
export const PolicyTypes = {
  ALLOW: 'ALLOW',
  DENY: 'DENY',
  REQUIRE: 'REQUIRE',
  RATE_LIMIT: 'RATE_LIMIT',
  AUDIT: 'AUDIT',
  TRANSFORM: 'TRANSFORM',
} as const;

export type PolicyType = typeof PolicyTypes[keyof typeof PolicyTypes];

export const PolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['ALLOW', 'DENY', 'REQUIRE', 'RATE_LIMIT', 'AUDIT', 'TRANSFORM']),
  priority: z.number(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'regex', 'exists']),
    value: z.unknown(),
  })),
  actions: z.array(z.string()),
  resources: z.array(z.string()),
  effect: z.object({
    type: z.string(),
    params: z.record(z.unknown()).optional(),
  }),
  metadata: z.object({
    createdAt: z.date(),
    createdBy: z.string(),
    immutable: z.boolean().default(false),
    version: z.string(),
  }),
});

export type Policy = z.infer<typeof PolicySchema>;

// ==================== EXTENSION LOADER ====================
export const ExtensionTrustLevels = {
  CORE: 'CORE',           // Built-in, kernel-trusted
  CERTIFIED: 'CERTIFIED', // Reviewed and signed
  VERIFIED: 'VERIFIED',   // Community verified
  UNTRUSTED: 'UNTRUSTED', // Sandboxed execution
} as const;

export type ExtensionTrustLevel = typeof ExtensionTrustLevels[keyof typeof ExtensionTrustLevels];

export const ExtensionManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  trustLevel: z.enum(['CORE', 'CERTIFIED', 'VERIFIED', 'UNTRUSTED']),
  permissions: z.array(z.string()),
  dependencies: z.array(z.string()),
  capabilities: z.array(z.string()),
  entryPoint: z.string(),
  signature: z.string().optional(),
  checksum: z.string(),
});

export type ExtensionManifest = z.infer<typeof ExtensionManifestSchema>;

export const ExtensionLoadResultSchema = z.object({
  success: z.boolean(),
  extensionId: z.string(),
  loadedAt: z.date(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
});

export type ExtensionLoadResult = z.infer<typeof ExtensionLoadResultSchema>;

// ==================== KERNEL CONTRACTS ====================
export interface ILifecycleManager {
  getCurrentPhase(): LifecyclePhase;
  transitionTo(phase: LifecyclePhase, source: string): Promise<boolean>;
  onPhaseChange(handler: (event: LifecycleEvent) => void): () => void;
  getPhaseHistory(): LifecycleEvent[];
  canTransition(from: LifecyclePhase, to: LifecyclePhase): boolean;
}

export interface IPermissionLattice {
  evaluate(request: PermissionRequest): Promise<PermissionDecision>;
  getLevel(entityId: string): PermissionLevel;
  setLevel(entityId: string, level: PermissionLevel, authority: string): Promise<void>;
  compareLevel(a: PermissionLevel, b: PermissionLevel): number;
  hasPermission(entityId: string, action: string, resource: string): Promise<boolean>;
}

export interface IPolicyEngine {
  registerPolicy(policy: Policy): Promise<void>;
  unregisterPolicy(policyId: string): Promise<void>;
  evaluatePolicies(context: Record<string, unknown>): Promise<PolicyDecision>;
  getPolicies(filter?: PolicyFilter): Policy[];
  validatePolicy(policy: Policy): ValidationResult;
}

export interface IExtensionLoader {
  load(manifest: ExtensionManifest): Promise<ExtensionLoadResult>;
  unload(extensionId: string): Promise<void>;
  getLoaded(): ExtensionManifest[];
  validateManifest(manifest: ExtensionManifest): ValidationResult;
  verifySignature(manifest: ExtensionManifest): Promise<boolean>;
}

export interface ISovereignKernel {
  readonly version: string;
  readonly lifecycle: ILifecycleManager;
  readonly permissions: IPermissionLattice;
  readonly policies: IPolicyEngine;
  readonly extensions: IExtensionLoader;
  
  boot(): Promise<void>;
  shutdown(): Promise<void>;
  getStatus(): KernelStatus;
  isLocked(): boolean;
}

// ==================== SUPPORTING TYPES ====================
export interface PolicyFilter {
  type?: PolicyType;
  resource?: string;
  action?: string;
}

export interface PolicyDecision {
  allowed: boolean;
  matchedPolicies: string[];
  denialReasons: string[];
  appliedEffects: Array<{ policyId: string; effect: unknown }>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface KernelStatus {
  version: string;
  phase: LifecyclePhase;
  uptime: number;
  loadedExtensions: number;
  activePolicies: number;
  locked: boolean;
}

// ==================== LIFECYCLE STATE MACHINE ====================
const VALID_TRANSITIONS: Record<LifecyclePhase, LifecyclePhase[]> = {
  [LifecyclePhases.BOOT]: [LifecyclePhases.INITIALIZE],
  [LifecyclePhases.INITIALIZE]: [LifecyclePhases.CONFIGURE, LifecyclePhases.TERMINATED],
  [LifecyclePhases.CONFIGURE]: [LifecyclePhases.ACTIVATE, LifecyclePhases.SHUTDOWN],
  [LifecyclePhases.ACTIVATE]: [LifecyclePhases.RUNNING, LifecyclePhases.SHUTDOWN],
  [LifecyclePhases.RUNNING]: [LifecyclePhases.SUSPEND, LifecyclePhases.SHUTDOWN],
  [LifecyclePhases.SUSPEND]: [LifecyclePhases.RUNNING, LifecyclePhases.SHUTDOWN],
  [LifecyclePhases.SHUTDOWN]: [LifecyclePhases.TERMINATED],
  [LifecyclePhases.TERMINATED]: [],
};

// ==================== LIFECYCLE MANAGER IMPLEMENTATION ====================
class LifecycleManagerImpl implements ILifecycleManager {
  private currentPhase: LifecyclePhase = LifecyclePhases.BOOT;
  private history: LifecycleEvent[] = [];
  private handlers: Array<(event: LifecycleEvent) => void> = [];

  getCurrentPhase(): LifecyclePhase {
    return this.currentPhase;
  }

  async transitionTo(phase: LifecyclePhase, source: string): Promise<boolean> {
    if (!this.canTransition(this.currentPhase, phase)) {
      console.error(`[Kernel] Invalid transition: ${this.currentPhase} -> ${phase}`);
      return false;
    }

    const event: LifecycleEvent = {
      phase,
      timestamp: new Date(),
      source,
    };

    this.currentPhase = phase;
    this.history.push(event);

    for (const handler of this.handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`[Kernel] Lifecycle handler error:`, error);
      }
    }

    console.log(`[Kernel] Phase transition: ${this.history[this.history.length - 2]?.phase || 'NONE'} -> ${phase}`);
    return true;
  }

  onPhaseChange(handler: (event: LifecycleEvent) => void): () => void {
    this.handlers.push(handler);
    return () => {
      const idx = this.handlers.indexOf(handler);
      if (idx >= 0) this.handlers.splice(idx, 1);
    };
  }

  getPhaseHistory(): LifecycleEvent[] {
    return [...this.history];
  }

  canTransition(from: LifecyclePhase, to: LifecyclePhase): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }
}

// ==================== PERMISSION LATTICE IMPLEMENTATION ====================
class PermissionLatticeImpl implements IPermissionLattice {
  private levels: Map<string, PermissionLevel> = new Map();
  private auditCounter = 0;

  async evaluate(request: PermissionRequest): Promise<PermissionDecision> {
    const entityLevel = this.getLevel(request.requesterId);
    this.auditCounter++;

    if (entityLevel > request.requesterLevel) {
      return {
        allowed: false,
        reason: 'Insufficient permission level',
        auditRef: `AUDIT-${this.auditCounter}`,
      };
    }

    return {
      allowed: true,
      reason: 'Permission granted',
      auditRef: `AUDIT-${this.auditCounter}`,
    };
  }

  getLevel(entityId: string): PermissionLevel {
    return this.levels.get(entityId) ?? PermissionLevels.GUEST;
  }

  async setLevel(entityId: string, level: PermissionLevel, authority: string): Promise<void> {
    const authorityLevel = this.getLevel(authority);
    if (authorityLevel > PermissionLevels.SOVEREIGN) {
      throw new Error('Insufficient authority to set permission levels');
    }
    this.levels.set(entityId, level);
  }

  compareLevel(a: PermissionLevel, b: PermissionLevel): number {
    return a - b;
  }

  async hasPermission(entityId: string, action: string, resource: string): Promise<boolean> {
    const decision = await this.evaluate({
      requesterId: entityId,
      requesterLevel: this.getLevel(entityId),
      action,
      resource,
    });
    return decision.allowed;
  }
}

// ==================== POLICY ENGINE IMPLEMENTATION ====================
class PolicyEngineImpl implements IPolicyEngine {
  private policies: Map<string, Policy> = new Map();

  async registerPolicy(policy: Policy): Promise<void> {
    const validation = this.validatePolicy(policy);
    if (!validation.valid) {
      throw new Error(`Invalid policy: ${validation.errors.join(', ')}`);
    }
    this.policies.set(policy.id, policy);
  }

  async unregisterPolicy(policyId: string): Promise<void> {
    const policy = this.policies.get(policyId);
    if (policy?.metadata.immutable) {
      throw new Error('Cannot unregister immutable policy');
    }
    this.policies.delete(policyId);
  }

  async evaluatePolicies(context: Record<string, unknown>): Promise<PolicyDecision> {
    const matchedPolicies: string[] = [];
    const denialReasons: string[] = [];
    const appliedEffects: Array<{ policyId: string; effect: unknown }> = [];
    let allowed = true;

    const sortedPolicies = Array.from(this.policies.values())
      .sort((a, b) => a.priority - b.priority);

    for (const policy of sortedPolicies) {
      if (this.matchesConditions(policy, context)) {
        matchedPolicies.push(policy.id);
        appliedEffects.push({ policyId: policy.id, effect: policy.effect });

        if (policy.type === PolicyTypes.DENY) {
          allowed = false;
          denialReasons.push(`Denied by policy: ${policy.name}`);
        }
      }
    }

    return { allowed, matchedPolicies, denialReasons, appliedEffects };
  }

  getPolicies(filter?: PolicyFilter): Policy[] {
    let result = Array.from(this.policies.values());
    if (filter?.type) {
      result = result.filter(p => p.type === filter.type);
    }
    if (filter?.resource) {
      const resource = filter.resource;
      result = result.filter(p => p.resources.includes(resource));
    }
    if (filter?.action) {
      const action = filter.action;
      result = result.filter(p => p.actions.includes(action));
    }
    return result;
  }

  validatePolicy(policy: Policy): ValidationResult {
    const result = PolicySchema.safeParse(policy);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map(e => e.message),
        warnings: [],
      };
    }
    return { valid: true, errors: [], warnings: [] };
  }

  private matchesConditions(policy: Policy, context: Record<string, unknown>): boolean {
    for (const condition of policy.conditions) {
      const value = context[condition.field];
      switch (condition.operator) {
        case 'eq': if (value !== condition.value) return false; break;
        case 'neq': if (value === condition.value) return false; break;
        case 'exists': if ((value !== undefined) !== condition.value) return false; break;
        default: break;
      }
    }
    return true;
  }
}

// ==================== EXTENSION LOADER IMPLEMENTATION ====================
class ExtensionLoaderImpl implements IExtensionLoader {
  private loaded: Map<string, ExtensionManifest> = new Map();

  async load(manifest: ExtensionManifest): Promise<ExtensionLoadResult> {
    const validation = this.validateManifest(manifest);
    if (!validation.valid) {
      return {
        success: false,
        extensionId: manifest.id,
        loadedAt: new Date(),
        errors: validation.errors,
      };
    }

    for (const dep of manifest.dependencies) {
      if (!this.loaded.has(dep)) {
        return {
          success: false,
          extensionId: manifest.id,
          loadedAt: new Date(),
          errors: [`Missing dependency: ${dep}`],
        };
      }
    }

    this.loaded.set(manifest.id, manifest);

    return {
      success: true,
      extensionId: manifest.id,
      loadedAt: new Date(),
    };
  }

  async unload(extensionId: string): Promise<void> {
    const dependents = Array.from(this.loaded.values())
      .filter(m => m.dependencies.includes(extensionId));
    
    if (dependents.length > 0) {
      throw new Error(`Cannot unload: ${dependents.map(d => d.id).join(', ')} depend on it`);
    }

    this.loaded.delete(extensionId);
  }

  getLoaded(): ExtensionManifest[] {
    return Array.from(this.loaded.values());
  }

  validateManifest(manifest: ExtensionManifest): ValidationResult {
    const result = ExtensionManifestSchema.safeParse(manifest);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map(e => e.message),
        warnings: [],
      };
    }
    return { valid: true, errors: [], warnings: [] };
  }

  async verifySignature(manifest: ExtensionManifest): Promise<boolean> {
    if (manifest.trustLevel === ExtensionTrustLevels.CORE) {
      return true;
    }
    if (!manifest.signature) {
      return manifest.trustLevel === ExtensionTrustLevels.UNTRUSTED;
    }
    return true;
  }
}

// ==================== SOVEREIGN KERNEL IMPLEMENTATION ====================
class SovereignKernelImpl implements ISovereignKernel {
  readonly version = KERNEL_VERSION;
  readonly lifecycle: ILifecycleManager;
  readonly permissions: IPermissionLattice;
  readonly policies: IPolicyEngine;
  readonly extensions: IExtensionLoader;

  private bootTime: Date | null = null;
  private locked = false;

  constructor() {
    this.lifecycle = new LifecycleManagerImpl();
    this.permissions = new PermissionLatticeImpl();
    this.policies = new PolicyEngineImpl();
    this.extensions = new ExtensionLoaderImpl();
  }

  async boot(): Promise<void> {
    console.log(`[SovereignKernel] Booting v${this.version}...`);
    
    await this.lifecycle.transitionTo(LifecyclePhases.BOOT, 'kernel');
    this.bootTime = new Date();
    
    await this.lifecycle.transitionTo(LifecyclePhases.INITIALIZE, 'kernel');
    
    await this.registerCorePolicy();
    
    await this.lifecycle.transitionTo(LifecyclePhases.CONFIGURE, 'kernel');
    await this.lifecycle.transitionTo(LifecyclePhases.ACTIVATE, 'kernel');
    await this.lifecycle.transitionTo(LifecyclePhases.RUNNING, 'kernel');
    
    console.log(`[SovereignKernel] Boot complete - Running`);
  }

  async shutdown(): Promise<void> {
    console.log(`[SovereignKernel] Initiating shutdown...`);
    await this.lifecycle.transitionTo(LifecyclePhases.SHUTDOWN, 'kernel');
    await this.lifecycle.transitionTo(LifecyclePhases.TERMINATED, 'kernel');
    console.log(`[SovereignKernel] Shutdown complete`);
  }

  getStatus(): KernelStatus {
    return {
      version: this.version,
      phase: this.lifecycle.getCurrentPhase(),
      uptime: this.bootTime ? Date.now() - this.bootTime.getTime() : 0,
      loadedExtensions: this.extensions.getLoaded().length,
      activePolicies: this.policies.getPolicies().length,
      locked: this.locked,
    };
  }

  isLocked(): boolean {
    return this.locked;
  }

  private async registerCorePolicy(): Promise<void> {
    await this.policies.registerPolicy({
      id: 'POLICY_KERNEL_PROTECTION',
      name: 'Kernel Protection Policy',
      type: PolicyTypes.DENY,
      priority: 0,
      conditions: [
        { field: 'target', operator: 'eq', value: 'kernel' },
        { field: 'action', operator: 'in', value: ['modify', 'delete', 'override'] },
      ],
      actions: ['modify', 'delete', 'override'],
      resources: ['kernel/*'],
      effect: { type: 'deny', params: { reason: 'Kernel is immutable' } },
      metadata: {
        createdAt: new Date(),
        createdBy: 'SYSTEM',
        immutable: true,
        version: '1.0.0',
      },
    });
  }
}

// ==================== SINGLETON EXPORT ====================
export const sovereignKernel: ISovereignKernel = new SovereignKernelImpl();

export default sovereignKernel;
