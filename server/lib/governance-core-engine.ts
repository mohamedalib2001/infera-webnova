/**
 * INFERA WebNova - Governance Core Engine
 * نواة الحوكمة واتخاذ القرار الذكية
 * 
 * Features:
 * - Smart Governance Engine: Decides when building is allowed/rejected/restricted
 * - Policy Engine: Enforces rules based on entity and sector
 * - Automatic Permission Separation: Owner, Developer, End-User
 */

import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

const ROOT_OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

// ==================== Types & Interfaces ====================

export type ActorRole = 'root_owner' | 'owner' | 'developer' | 'operator' | 'user' | 'guest';
export type Sector = 'financial' | 'healthcare' | 'government' | 'education' | 'enterprise' | 'general';
export type ActionType = 'build' | 'deploy' | 'modify' | 'delete' | 'access' | 'configure' | 'export' | 'import';
export type DecisionResult = 'allowed' | 'denied' | 'restricted' | 'pending_approval';

export interface Actor {
  id: string;
  email: string;
  role: ActorRole;
  organizationId?: string;
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface GovernanceContext {
  actor: Actor;
  action: ActionType;
  resource: string;
  resourceType: string;
  sector: Sector;
  organizationId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface GovernanceDecision {
  id: string;
  contextId: string;
  result: DecisionResult;
  reason: string;
  reasonAr: string;
  appliedPolicies: string[];
  restrictions?: string[];
  requiredApprovals?: string[];
  timestamp: string;
  expiresAt?: string;
}

export interface Policy {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  sector: Sector | 'all';
  targetRoles: ActorRole[];
  actions: ActionType[];
  effect: 'allow' | 'deny' | 'restrict' | 'require_approval';
  conditions: PolicyCondition[];
  restrictions?: string[];
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

export interface PermissionTemplate {
  id: string;
  role: ActorRole;
  sector: Sector | 'all';
  basePermissions: string[];
  deniedPermissions: string[];
  maxActions: Record<ActionType, number>;
  requiresApproval: ActionType[];
}

export interface AuditLog {
  id: string;
  decisionId: string;
  actor: Actor;
  context: GovernanceContext;
  decision: GovernanceDecision;
  timestamp: string;
}

// ==================== Default Policies ====================

const DEFAULT_POLICIES: Policy[] = [
  {
    id: "policy-root-owner-full-access",
    name: "Root Owner Full Access",
    nameAr: "وصول كامل للمالك الرئيسي",
    description: "Root owner has unrestricted access to all resources",
    descriptionAr: "المالك الرئيسي لديه وصول غير مقيد لجميع الموارد",
    sector: 'all',
    targetRoles: ['root_owner'],
    actions: ['build', 'deploy', 'modify', 'delete', 'access', 'configure', 'export', 'import'],
    effect: 'allow',
    conditions: [],
    priority: 1000,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "policy-financial-strict",
    name: "Financial Sector Strict Controls",
    nameAr: "ضوابط صارمة للقطاع المالي",
    description: "Financial sector requires approval for critical operations",
    descriptionAr: "القطاع المالي يتطلب موافقة للعمليات الحساسة",
    sector: 'financial',
    targetRoles: ['developer', 'operator'],
    actions: ['deploy', 'delete', 'configure'],
    effect: 'require_approval',
    conditions: [],
    priority: 900,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "policy-healthcare-hipaa",
    name: "Healthcare HIPAA Compliance",
    nameAr: "امتثال HIPAA للرعاية الصحية",
    description: "Healthcare sector enforces HIPAA data protection",
    descriptionAr: "قطاع الرعاية الصحية يفرض حماية بيانات HIPAA",
    sector: 'healthcare',
    targetRoles: ['developer', 'operator', 'user'],
    actions: ['export', 'access'],
    effect: 'restrict',
    conditions: [],
    restrictions: ['audit_required', 'encryption_mandatory', 'access_logging'],
    priority: 950,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "policy-government-security",
    name: "Government Security Protocol",
    nameAr: "بروتوكول أمن حكومي",
    description: "Government sector requires enhanced security measures",
    descriptionAr: "القطاع الحكومي يتطلب إجراءات أمنية معززة",
    sector: 'government',
    targetRoles: ['developer', 'operator'],
    actions: ['build', 'deploy', 'modify'],
    effect: 'require_approval',
    conditions: [],
    requiredApprovals: ['security_officer', 'owner'],
    priority: 980,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "policy-user-readonly",
    name: "End User Read-Only",
    nameAr: "المستخدم النهائي للقراءة فقط",
    description: "End users can only access and view resources",
    descriptionAr: "المستخدمون النهائيون يمكنهم فقط الوصول والعرض",
    sector: 'all',
    targetRoles: ['user'],
    actions: ['build', 'deploy', 'modify', 'delete', 'configure'],
    effect: 'deny',
    conditions: [],
    priority: 100,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "policy-guest-restricted",
    name: "Guest Restricted Access",
    nameAr: "وصول محدود للضيوف",
    description: "Guests have minimal access rights",
    descriptionAr: "الضيوف لديهم حقوق وصول محدودة",
    sector: 'all',
    targetRoles: ['guest'],
    actions: ['build', 'deploy', 'modify', 'delete', 'configure', 'export', 'import'],
    effect: 'deny',
    conditions: [],
    priority: 50,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "policy-developer-build",
    name: "Developer Build Access",
    nameAr: "صلاحية بناء المطور",
    description: "Developers can build and modify within their scope",
    descriptionAr: "المطورون يمكنهم البناء والتعديل ضمن نطاقهم",
    sector: 'all',
    targetRoles: ['developer'],
    actions: ['build', 'modify', 'access'],
    effect: 'allow',
    conditions: [],
    priority: 500,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "policy-operator-deploy",
    name: "Operator Deploy Access",
    nameAr: "صلاحية نشر المشغل",
    description: "Operators can deploy and configure systems",
    descriptionAr: "المشغلون يمكنهم نشر وتهيئة الأنظمة",
    sector: 'all',
    targetRoles: ['operator'],
    actions: ['deploy', 'configure', 'access'],
    effect: 'allow',
    conditions: [],
    priority: 600,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ==================== Permission Templates ====================

const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: "template-root-owner",
    role: 'root_owner',
    sector: 'all',
    basePermissions: ['*'],
    deniedPermissions: [],
    maxActions: { build: -1, deploy: -1, modify: -1, delete: -1, access: -1, configure: -1, export: -1, import: -1 },
    requiresApproval: []
  },
  {
    id: "template-owner",
    role: 'owner',
    sector: 'all',
    basePermissions: ['platform:*', 'users:*', 'settings:*', 'reports:*'],
    deniedPermissions: ['system:*', 'governance:modify'],
    maxActions: { build: 100, deploy: 50, modify: 200, delete: 50, access: -1, configure: 100, export: 50, import: 50 },
    requiresApproval: ['delete']
  },
  {
    id: "template-developer",
    role: 'developer',
    sector: 'all',
    basePermissions: ['code:*', 'build:*', 'test:*', 'debug:*'],
    deniedPermissions: ['deploy:production', 'users:delete', 'settings:security'],
    maxActions: { build: 50, deploy: 10, modify: 100, delete: 20, access: -1, configure: 30, export: 20, import: 20 },
    requiresApproval: ['deploy', 'delete']
  },
  {
    id: "template-operator",
    role: 'operator',
    sector: 'all',
    basePermissions: ['deploy:*', 'monitor:*', 'logs:*', 'alerts:*'],
    deniedPermissions: ['code:modify', 'users:create', 'settings:*'],
    maxActions: { build: 10, deploy: 30, modify: 20, delete: 10, access: -1, configure: 50, export: 30, import: 10 },
    requiresApproval: ['modify', 'delete']
  },
  {
    id: "template-user",
    role: 'user',
    sector: 'all',
    basePermissions: ['read:own', 'access:own'],
    deniedPermissions: ['build:*', 'deploy:*', 'modify:*', 'delete:*', 'configure:*'],
    maxActions: { build: 0, deploy: 0, modify: 0, delete: 0, access: -1, configure: 0, export: 5, import: 5 },
    requiresApproval: ['export']
  },
  {
    id: "template-guest",
    role: 'guest',
    sector: 'all',
    basePermissions: ['read:public'],
    deniedPermissions: ['*'],
    maxActions: { build: 0, deploy: 0, modify: 0, delete: 0, access: 10, configure: 0, export: 0, import: 0 },
    requiresApproval: ['access']
  }
];

// ==================== Governance Core Engine ====================

export class GovernanceCoreEngine {
  private policies: Map<string, Policy> = new Map();
  private permissionTemplates: Map<string, PermissionTemplate> = new Map();
  private decisions: Map<string, GovernanceDecision> = new Map();
  private auditLogs: AuditLog[] = [];
  private pendingApprovals: Map<string, GovernanceContext> = new Map();
  private dataPath: string;

  constructor() {
    this.dataPath = path.join(process.cwd(), "data", "governance");
    this.ensureDataDir();
    this.loadData();
    this.initializeDefaults();
    console.log("[GovernanceCore] Engine initialized | تم تهيئة محرك الحوكمة");
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      const policiesPath = path.join(this.dataPath, "policies.json");
      const decisionsPath = path.join(this.dataPath, "decisions.json");
      const auditPath = path.join(this.dataPath, "audit-logs.json");

      if (fs.existsSync(policiesPath)) {
        const data = JSON.parse(fs.readFileSync(policiesPath, "utf-8"));
        data.forEach((p: Policy) => this.policies.set(p.id, p));
      }

      if (fs.existsSync(decisionsPath)) {
        const data = JSON.parse(fs.readFileSync(decisionsPath, "utf-8"));
        data.forEach((d: GovernanceDecision) => this.decisions.set(d.id, d));
      }

      if (fs.existsSync(auditPath)) {
        this.auditLogs = JSON.parse(fs.readFileSync(auditPath, "utf-8"));
      }
    } catch (error) {
      console.error("[GovernanceCore] Error loading data:", error);
    }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(
        path.join(this.dataPath, "policies.json"),
        JSON.stringify(Array.from(this.policies.values()), null, 2)
      );
      fs.writeFileSync(
        path.join(this.dataPath, "decisions.json"),
        JSON.stringify(Array.from(this.decisions.values()).slice(-1000), null, 2)
      );
      fs.writeFileSync(
        path.join(this.dataPath, "audit-logs.json"),
        JSON.stringify(this.auditLogs.slice(-5000), null, 2)
      );
    } catch (error) {
      console.error("[GovernanceCore] Error saving data:", error);
    }
  }

  private initializeDefaults(): void {
    if (this.policies.size === 0) {
      DEFAULT_POLICIES.forEach(p => this.policies.set(p.id, p));
    }
    PERMISSION_TEMPLATES.forEach(t => this.permissionTemplates.set(t.id, t));
    this.saveData();
  }

  // ==================== Core Decision Engine ====================

  async evaluateAction(context: GovernanceContext): Promise<GovernanceDecision> {
    const contextId = randomUUID();
    
    // Check if root owner - always allow
    if (context.actor.email === ROOT_OWNER_EMAIL || context.actor.role === 'root_owner') {
      return this.createDecision(contextId, 'allowed', 
        'Root owner has full access', 
        'المالك الرئيسي لديه وصول كامل',
        ['policy-root-owner-full-access'], context);
    }

    // Get applicable policies sorted by priority (highest first)
    const applicablePolicies = this.getApplicablePolicies(context);
    
    if (applicablePolicies.length === 0) {
      return this.createDecision(contextId, 'denied',
        'No policy grants access for this action',
        'لا توجد سياسة تمنح الوصول لهذا الإجراء',
        [], context);
    }

    // Evaluate policies in priority order
    for (const policy of applicablePolicies) {
      if (!this.evaluateConditions(policy.conditions, context)) {
        continue;
      }

      switch (policy.effect) {
        case 'allow':
          return this.createDecision(contextId, 'allowed',
            `Allowed by policy: ${policy.name}`,
            `مسموح بموجب السياسة: ${policy.nameAr}`,
            [policy.id], context);

        case 'deny':
          return this.createDecision(contextId, 'denied',
            `Denied by policy: ${policy.name}`,
            `مرفوض بموجب السياسة: ${policy.nameAr}`,
            [policy.id], context);

        case 'restrict':
          return this.createDecision(contextId, 'restricted',
            `Restricted by policy: ${policy.name}`,
            `مقيد بموجب السياسة: ${policy.nameAr}`,
            [policy.id], context, policy.restrictions);

        case 'require_approval':
          this.pendingApprovals.set(contextId, context);
          return this.createDecision(contextId, 'pending_approval',
            `Requires approval per policy: ${policy.name}`,
            `يتطلب موافقة بموجب السياسة: ${policy.nameAr}`,
            [policy.id], context, undefined, policy.requiredApprovals);
      }
    }

    // Default deny if no policy matched
    return this.createDecision(contextId, 'denied',
      'No matching policy found',
      'لم يتم العثور على سياسة مطابقة',
      [], context);
  }

  private getApplicablePolicies(context: GovernanceContext): Policy[] {
    const policies = Array.from(this.policies.values())
      .filter(p => p.enabled)
      .filter(p => p.sector === 'all' || p.sector === context.sector)
      .filter(p => p.targetRoles.includes(context.actor.role))
      .filter(p => p.actions.includes(context.action))
      .sort((a, b) => b.priority - a.priority);
    
    return policies;
  }

  private evaluateConditions(conditions: PolicyCondition[], context: GovernanceContext): boolean {
    if (conditions.length === 0) return true;

    for (const condition of conditions) {
      const value = this.getFieldValue(condition.field, context);
      if (!this.evaluateCondition(condition, value)) {
        return false;
      }
    }
    return true;
  }

  private getFieldValue(field: string, context: GovernanceContext): any {
    const parts = field.split('.');
    let value: any = context;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  private evaluateCondition(condition: PolicyCondition, value: any): boolean {
    switch (condition.operator) {
      case 'equals': return value === condition.value;
      case 'not_equals': return value !== condition.value;
      case 'contains': return String(value).includes(condition.value);
      case 'not_contains': return !String(value).includes(condition.value);
      case 'in': return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in': return Array.isArray(condition.value) && !condition.value.includes(value);
      case 'greater_than': return Number(value) > Number(condition.value);
      case 'less_than': return Number(value) < Number(condition.value);
      default: return false;
    }
  }

  private createDecision(
    contextId: string,
    result: DecisionResult,
    reason: string,
    reasonAr: string,
    appliedPolicies: string[],
    context: GovernanceContext,
    restrictions?: string[],
    requiredApprovals?: string[]
  ): GovernanceDecision {
    const decision: GovernanceDecision = {
      id: randomUUID(),
      contextId,
      result,
      reason,
      reasonAr,
      appliedPolicies,
      restrictions,
      requiredApprovals,
      timestamp: new Date().toISOString(),
      expiresAt: result === 'pending_approval' 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
        : undefined
    };

    this.decisions.set(decision.id, decision);
    this.logAudit(decision, context);
    this.saveData();

    return decision;
  }

  private logAudit(decision: GovernanceDecision, context: GovernanceContext): void {
    const log: AuditLog = {
      id: randomUUID(),
      decisionId: decision.id,
      actor: context.actor,
      context,
      decision,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.push(log);
  }

  // ==================== Policy Management ====================

  createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Policy {
    const newPolicy: Policy = {
      ...policy,
      id: `policy-${randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.policies.set(newPolicy.id, newPolicy);
    this.saveData();
    return newPolicy;
  }

  updatePolicy(id: string, updates: Partial<Policy>): Policy | null {
    const policy = this.policies.get(id);
    if (!policy) return null;

    const updated = {
      ...policy,
      ...updates,
      id: policy.id,
      createdAt: policy.createdAt,
      updatedAt: new Date().toISOString()
    };
    this.policies.set(id, updated);
    this.saveData();
    return updated;
  }

  deletePolicy(id: string): boolean {
    const deleted = this.policies.delete(id);
    if (deleted) this.saveData();
    return deleted;
  }

  getPolicy(id: string): Policy | undefined {
    return this.policies.get(id);
  }

  getAllPolicies(): Policy[] {
    return Array.from(this.policies.values());
  }

  getPoliciesBySector(sector: Sector): Policy[] {
    return Array.from(this.policies.values())
      .filter(p => p.sector === sector || p.sector === 'all');
  }

  // ==================== Permission Separation ====================

  getPermissionsForRole(role: ActorRole, sector: Sector = 'general'): PermissionTemplate | undefined {
    // First try sector-specific template
    const sectorTemplate = Array.from(this.permissionTemplates.values())
      .find(t => t.role === role && t.sector === sector);
    
    if (sectorTemplate) return sectorTemplate;

    // Fallback to general template
    return Array.from(this.permissionTemplates.values())
      .find(t => t.role === role && t.sector === 'all');
  }

  getPermissionTemplate(role: ActorRole): PermissionTemplate | undefined {
    return Array.from(this.permissionTemplates.values())
      .find(t => t.role === role);
  }

  separatePermissions(actor: Actor, sector: Sector): {
    granted: string[];
    denied: string[];
    requiresApproval: ActionType[];
    actionLimits: Record<ActionType, number>;
  } {
    const template = this.getPermissionsForRole(actor.role, sector);
    
    if (!template) {
      return {
        granted: [],
        denied: ['*'],
        requiresApproval: ['build', 'deploy', 'modify', 'delete', 'configure', 'export', 'import'],
        actionLimits: { build: 0, deploy: 0, modify: 0, delete: 0, access: 0, configure: 0, export: 0, import: 0 }
      };
    }

    return {
      granted: template.basePermissions,
      denied: template.deniedPermissions,
      requiresApproval: template.requiresApproval,
      actionLimits: template.maxActions
    };
  }

  // ==================== Approval Management ====================

  getPendingApprovals(): Array<{ id: string; context: GovernanceContext }> {
    return Array.from(this.pendingApprovals.entries())
      .map(([id, context]) => ({ id, context }));
  }

  approveAction(contextId: string, approver: Actor): GovernanceDecision | null {
    const context = this.pendingApprovals.get(contextId);
    if (!context) return null;

    // Only root_owner or owner can approve
    if (approver.role !== 'root_owner' && approver.role !== 'owner') {
      return this.createDecision(contextId, 'denied',
        'Only owner can approve actions',
        'فقط المالك يمكنه الموافقة على الإجراءات',
        [], context);
    }

    this.pendingApprovals.delete(contextId);
    return this.createDecision(contextId, 'allowed',
      `Approved by ${approver.email}`,
      `تمت الموافقة بواسطة ${approver.email}`,
      [], context);
  }

  rejectAction(contextId: string, reason: string, reasonAr: string): GovernanceDecision | null {
    const context = this.pendingApprovals.get(contextId);
    if (!context) return null;

    this.pendingApprovals.delete(contextId);
    return this.createDecision(contextId, 'denied', reason, reasonAr, [], context);
  }

  // ==================== Statistics & Reporting ====================

  getStats(): {
    totalPolicies: number;
    enabledPolicies: number;
    totalDecisions: number;
    decisionsByResult: Record<DecisionResult, number>;
    pendingApprovals: number;
    auditLogsCount: number;
    policiesBySector: Record<string, number>;
  } {
    const decisions = Array.from(this.decisions.values());
    const decisionsByResult: Record<DecisionResult, number> = {
      allowed: 0,
      denied: 0,
      restricted: 0,
      pending_approval: 0
    };

    decisions.forEach(d => {
      decisionsByResult[d.result]++;
    });

    const policiesBySector: Record<string, number> = {};
    this.policies.forEach(p => {
      policiesBySector[p.sector] = (policiesBySector[p.sector] || 0) + 1;
    });

    return {
      totalPolicies: this.policies.size,
      enabledPolicies: Array.from(this.policies.values()).filter(p => p.enabled).length,
      totalDecisions: decisions.length,
      decisionsByResult,
      pendingApprovals: this.pendingApprovals.size,
      auditLogsCount: this.auditLogs.length,
      policiesBySector
    };
  }

  getAuditLogs(limit: number = 100, offset: number = 0): AuditLog[] {
    return this.auditLogs.slice(-limit - offset, -offset || undefined).reverse();
  }

  getDecisionHistory(actorId?: string, limit: number = 50): GovernanceDecision[] {
    let decisions = Array.from(this.decisions.values());
    
    if (actorId) {
      const actorDecisionIds = this.auditLogs
        .filter(log => log.actor.id === actorId)
        .map(log => log.decisionId);
      decisions = decisions.filter(d => actorDecisionIds.includes(d.id));
    }

    return decisions.slice(-limit).reverse();
  }

  // ==================== Quick Evaluation Methods ====================

  canBuild(actor: Actor, sector: Sector, resource: string): Promise<GovernanceDecision> {
    return this.evaluateAction({
      actor,
      action: 'build',
      resource,
      resourceType: 'platform',
      sector,
      organizationId: actor.organizationId || 'default',
      timestamp: new Date().toISOString()
    });
  }

  canDeploy(actor: Actor, sector: Sector, resource: string): Promise<GovernanceDecision> {
    return this.evaluateAction({
      actor,
      action: 'deploy',
      resource,
      resourceType: 'platform',
      sector,
      organizationId: actor.organizationId || 'default',
      timestamp: new Date().toISOString()
    });
  }

  canModify(actor: Actor, sector: Sector, resource: string): Promise<GovernanceDecision> {
    return this.evaluateAction({
      actor,
      action: 'modify',
      resource,
      resourceType: 'platform',
      sector,
      organizationId: actor.organizationId || 'default',
      timestamp: new Date().toISOString()
    });
  }

  canDelete(actor: Actor, sector: Sector, resource: string): Promise<GovernanceDecision> {
    return this.evaluateAction({
      actor,
      action: 'delete',
      resource,
      resourceType: 'platform',
      sector,
      organizationId: actor.organizationId || 'default',
      timestamp: new Date().toISOString()
    });
  }
}

// Singleton instance
export const governanceEngine = new GovernanceCoreEngine();
