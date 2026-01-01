/**
 * INFERA WebNova - AI Roles Engine (محرك أدوار الذكاء الاصطناعي)
 * Layer 5: AI as Native Citizen - NOT a Feature
 * 
 * AI كـ نظام تشغيلي داخلي وليس Feature
 * كل دور: له صلاحيات، Logs، Limits، Audit Trail
 */

import { z } from 'zod';

// ==================== AI ROLE TYPES ====================
export const AIRoleTypes = {
  ARCHITECT: 'ARCHITECT',
  BUILDER: 'BUILDER',
  QA: 'QA',
  SECURITY: 'SECURITY',
  OPTIMIZER: 'OPTIMIZER',
  ANALYST: 'ANALYST',
  GUARDIAN: 'GUARDIAN',
} as const;

export type AIRoleType = typeof AIRoleTypes[keyof typeof AIRoleTypes];

// ==================== AI ROLE SCHEMA ====================
export const AIRoleSchema = z.object({
  id: z.string(),
  type: z.enum(['ARCHITECT', 'BUILDER', 'QA', 'SECURITY', 'OPTIMIZER', 'ANALYST', 'GUARDIAN']),
  name: z.string(),
  description: z.string(),
  
  permissions: z.object({
    canRead: z.array(z.string()),
    canWrite: z.array(z.string()),
    canExecute: z.array(z.string()),
    canApprove: z.array(z.string()),
    forbidden: z.array(z.string()),
  }),
  
  limits: z.object({
    maxTokensPerRequest: z.number(),
    maxRequestsPerMinute: z.number(),
    maxConcurrentTasks: z.number(),
    maxExecutionTime: z.number(),
    dailyBudget: z.number().optional(),
  }),
  
  capabilities: z.array(z.string()),
  
  constitution: z.object({
    mustObey: z.array(z.string()),
    mustNever: z.array(z.string()),
    shouldPrefer: z.array(z.string()),
  }),
  
  auditLevel: z.enum(['full', 'standard', 'minimal']),
});

export type AIRole = z.infer<typeof AIRoleSchema>;

// ==================== AI TASK SCHEMA ====================
export const AITaskSchema = z.object({
  id: z.string(),
  roleId: z.string(),
  type: z.string(),
  priority: z.enum(['critical', 'high', 'normal', 'low']),
  
  input: z.object({
    prompt: z.string(),
    context: z.record(z.unknown()).optional(),
    constraints: z.array(z.string()).optional(),
    references: z.array(z.string()).optional(),
  }),
  
  output: z.object({
    result: z.unknown().optional(),
    artifacts: z.array(z.object({
      type: z.string(),
      path: z.string(),
      content: z.string().optional(),
    })).optional(),
    reasoning: z.string().optional(),
    confidence: z.number().optional(),
  }).optional(),
  
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  
  metrics: z.object({
    tokensUsed: z.number().optional(),
    executionTime: z.number().optional(),
    cost: z.number().optional(),
  }).optional(),
  
  audit: z.object({
    createdAt: z.date(),
    startedAt: z.date().optional(),
    completedAt: z.date().optional(),
    createdBy: z.string(),
    approvedBy: z.string().optional(),
  }),
});

export type AITask = z.infer<typeof AITaskSchema>;

// ==================== AI AUDIT LOG ====================
export const AIAuditLogSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  roleId: z.string(),
  action: z.string(),
  timestamp: z.date(),
  
  details: z.object({
    input: z.unknown(),
    output: z.unknown(),
    duration: z.number(),
    tokens: z.number(),
  }),
  
  compliance: z.object({
    rulesChecked: z.array(z.string()),
    violations: z.array(z.string()),
    approved: z.boolean(),
  }),
  
  signature: z.string(),
});

export type AIAuditLog = z.infer<typeof AIAuditLogSchema>;

// ==================== AI WORKER INTERFACE ====================
export interface IAIWorker {
  readonly role: AIRole;
  
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  
  execute(task: AITask): Promise<AITask>;
  validate(task: AITask): ValidationResult;
  
  getStatus(): WorkerStatus;
  getMetrics(): WorkerMetrics;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WorkerStatus {
  roleId: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  currentTask?: string;
  queueLength: number;
}

export interface WorkerMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  averageExecutionTime: number;
  totalTokensUsed: number;
  uptime: number;
}

// ==================== AI ROLES ENGINE INTERFACE ====================
export interface IAIRolesEngine {
  registerRole(role: AIRole): Promise<void>;
  unregisterRole(roleId: string): Promise<void>;
  getRole(roleId: string): AIRole | undefined;
  getAllRoles(): AIRole[];
  
  assignWorker(roleId: string, worker: IAIWorker): Promise<void>;
  getWorker(roleId: string): IAIWorker | undefined;
  
  submitTask(task: Omit<AITask, 'id' | 'status' | 'audit'>): Promise<AITask>;
  getTask(taskId: string): AITask | undefined;
  cancelTask(taskId: string): Promise<void>;
  
  routeTask(task: AITask): Promise<string>;
  
  getAuditLogs(filter?: AuditFilter): AIAuditLog[];
  
  enforceConstitution(roleId: string, action: string): ConstitutionDecision;
}

export interface AuditFilter {
  roleId?: string;
  taskId?: string;
  fromDate?: Date;
  toDate?: Date;
  action?: string;
}

export interface ConstitutionDecision {
  allowed: boolean;
  rule?: string;
  reason: string;
}

// ==================== DEFAULT AI ROLES ====================
export const DEFAULT_AI_ROLES: AIRole[] = [
  {
    id: 'role-architect',
    type: AIRoleTypes.ARCHITECT,
    name: 'AI Architect',
    description: 'Designs system architecture and blueprints',
    permissions: {
      canRead: ['*'],
      canWrite: ['blueprints/*', 'schemas/*', 'contracts/*'],
      canExecute: ['analyze', 'design', 'validate'],
      canApprove: ['architecture-decisions'],
      forbidden: ['deploy', 'delete-production'],
    },
    limits: {
      maxTokensPerRequest: 100000,
      maxRequestsPerMinute: 10,
      maxConcurrentTasks: 3,
      maxExecutionTime: 300000,
    },
    capabilities: ['blueprint-design', 'schema-generation', 'dependency-analysis', 'pattern-recognition'],
    constitution: {
      mustObey: ['preserve-backward-compatibility', 'document-all-decisions', 'follow-solid-principles'],
      mustNever: ['break-existing-contracts', 'introduce-circular-dependencies', 'skip-validation'],
      shouldPrefer: ['simplicity', 'modularity', 'extensibility'],
    },
    auditLevel: 'full',
  },
  {
    id: 'role-builder',
    type: AIRoleTypes.BUILDER,
    name: 'AI Builder',
    description: 'Generates and implements code',
    permissions: {
      canRead: ['blueprints/*', 'code/*', 'templates/*'],
      canWrite: ['code/*', 'tests/*'],
      canExecute: ['generate', 'refactor', 'implement'],
      canApprove: [],
      forbidden: ['modify-kernel', 'modify-security', 'deploy'],
    },
    limits: {
      maxTokensPerRequest: 150000,
      maxRequestsPerMinute: 20,
      maxConcurrentTasks: 5,
      maxExecutionTime: 600000,
    },
    capabilities: ['code-generation', 'refactoring', 'test-generation', 'documentation'],
    constitution: {
      mustObey: ['follow-blueprint', 'write-tests', 'no-placeholder-code', 'no-mock-data'],
      mustNever: ['skip-validation', 'hardcode-secrets', 'ignore-errors'],
      shouldPrefer: ['clean-code', 'performance', 'readability'],
    },
    auditLevel: 'full',
  },
  {
    id: 'role-qa',
    type: AIRoleTypes.QA,
    name: 'AI QA',
    description: 'Tests and validates quality',
    permissions: {
      canRead: ['*'],
      canWrite: ['tests/*', 'reports/*'],
      canExecute: ['test', 'validate', 'analyze'],
      canApprove: ['quality-gates'],
      forbidden: ['modify-production-code', 'deploy'],
    },
    limits: {
      maxTokensPerRequest: 80000,
      maxRequestsPerMinute: 30,
      maxConcurrentTasks: 10,
      maxExecutionTime: 180000,
    },
    capabilities: ['test-execution', 'coverage-analysis', 'regression-detection', 'performance-testing'],
    constitution: {
      mustObey: ['test-all-paths', 'report-all-issues', 'maintain-coverage'],
      mustNever: ['skip-edge-cases', 'ignore-warnings', 'approve-failing-tests'],
      shouldPrefer: ['thorough-testing', 'automation', 'reproducibility'],
    },
    auditLevel: 'standard',
  },
  {
    id: 'role-security',
    type: AIRoleTypes.SECURITY,
    name: 'AI Security',
    description: 'Analyzes and enforces security',
    permissions: {
      canRead: ['*'],
      canWrite: ['security/*', 'policies/*'],
      canExecute: ['scan', 'audit', 'enforce'],
      canApprove: ['security-reviews'],
      forbidden: ['modify-vault', 'export-secrets'],
    },
    limits: {
      maxTokensPerRequest: 50000,
      maxRequestsPerMinute: 15,
      maxConcurrentTasks: 3,
      maxExecutionTime: 300000,
    },
    capabilities: ['vulnerability-scanning', 'compliance-checking', 'threat-modeling', 'secret-detection'],
    constitution: {
      mustObey: ['zero-trust', 'least-privilege', 'defense-in-depth', 'encrypt-everything'],
      mustNever: ['expose-secrets', 'bypass-auth', 'ignore-vulnerabilities'],
      shouldPrefer: ['security-first', 'audit-logging', 'immutability'],
    },
    auditLevel: 'full',
  },
  {
    id: 'role-optimizer',
    type: AIRoleTypes.OPTIMIZER,
    name: 'AI Optimizer',
    description: 'Optimizes performance and resources',
    permissions: {
      canRead: ['*'],
      canWrite: ['config/*', 'optimizations/*'],
      canExecute: ['analyze', 'optimize', 'benchmark'],
      canApprove: ['performance-changes'],
      forbidden: ['modify-business-logic', 'delete-data'],
    },
    limits: {
      maxTokensPerRequest: 60000,
      maxRequestsPerMinute: 10,
      maxConcurrentTasks: 2,
      maxExecutionTime: 600000,
    },
    capabilities: ['performance-analysis', 'resource-optimization', 'caching-strategies', 'query-optimization'],
    constitution: {
      mustObey: ['measure-before-optimize', 'preserve-correctness', 'document-changes'],
      mustNever: ['sacrifice-security', 'break-functionality', 'premature-optimize'],
      shouldPrefer: ['efficiency', 'scalability', 'cost-effectiveness'],
    },
    auditLevel: 'standard',
  },
  {
    id: 'role-guardian',
    type: AIRoleTypes.GUARDIAN,
    name: 'AI Guardian',
    description: 'Monitors and protects the system',
    permissions: {
      canRead: ['*'],
      canWrite: ['alerts/*', 'incidents/*'],
      canExecute: ['monitor', 'alert', 'respond'],
      canApprove: ['emergency-actions'],
      forbidden: ['modify-code', 'delete-logs'],
    },
    limits: {
      maxTokensPerRequest: 30000,
      maxRequestsPerMinute: 60,
      maxConcurrentTasks: 20,
      maxExecutionTime: 60000,
    },
    capabilities: ['anomaly-detection', 'incident-response', 'health-monitoring', 'alerting'],
    constitution: {
      mustObey: ['always-alert', 'never-ignore', 'escalate-critical'],
      mustNever: ['suppress-warnings', 'auto-dismiss', 'hide-incidents'],
      shouldPrefer: ['proactive-monitoring', 'fast-response', 'clear-communication'],
    },
    auditLevel: 'full',
  },
];

// ==================== AI ROLES ENGINE IMPLEMENTATION ====================
class AIRolesEngineImpl implements IAIRolesEngine {
  private roles: Map<string, AIRole> = new Map();
  private workers: Map<string, IAIWorker> = new Map();
  private tasks: Map<string, AITask> = new Map();
  private auditLogs: AIAuditLog[] = [];
  private taskCounter = 0;

  constructor() {
    for (const role of DEFAULT_AI_ROLES) {
      this.roles.set(role.id, role);
    }
  }

  async registerRole(role: AIRole): Promise<void> {
    const validation = AIRoleSchema.safeParse(role);
    if (!validation.success) {
      throw new Error(`Invalid role: ${validation.error.message}`);
    }
    this.roles.set(role.id, role);
    console.log(`[AIRoles] Registered: ${role.id} (${role.type})`);
  }

  async unregisterRole(roleId: string): Promise<void> {
    const worker = this.workers.get(roleId);
    if (worker) {
      await worker.shutdown();
      this.workers.delete(roleId);
    }
    this.roles.delete(roleId);
  }

  getRole(roleId: string): AIRole | undefined {
    return this.roles.get(roleId);
  }

  getAllRoles(): AIRole[] {
    return Array.from(this.roles.values());
  }

  async assignWorker(roleId: string, worker: IAIWorker): Promise<void> {
    if (!this.roles.has(roleId)) {
      throw new Error(`Role not found: ${roleId}`);
    }
    await worker.initialize();
    this.workers.set(roleId, worker);
    console.log(`[AIRoles] Worker assigned to: ${roleId}`);
  }

  getWorker(roleId: string): IAIWorker | undefined {
    return this.workers.get(roleId);
  }

  async submitTask(taskInput: Omit<AITask, 'id' | 'status' | 'audit'>): Promise<AITask> {
    const task: AITask = {
      ...taskInput,
      id: `task-${Date.now()}-${++this.taskCounter}`,
      status: 'pending',
      audit: {
        createdAt: new Date(),
        createdBy: 'system',
      },
    };

    this.tasks.set(task.id, task);

    const decision = this.enforceConstitution(task.roleId, task.type);
    if (!decision.allowed) {
      task.status = 'cancelled';
      task.output = { reasoning: decision.reason };
      return task;
    }

    const worker = this.workers.get(task.roleId);
    if (worker) {
      task.status = 'running';
      task.audit.startedAt = new Date();
      
      try {
        const result = await worker.execute(task);
        task.status = 'completed';
        task.output = result.output;
        task.metrics = result.metrics;
        task.audit.completedAt = new Date();
      } catch (error) {
        task.status = 'failed';
        task.output = { reasoning: error instanceof Error ? error.message : String(error) };
      }

      this.logAudit(task);
    }

    return task;
  }

  getTask(taskId: string): AITask | undefined {
    return this.tasks.get(taskId);
  }

  async cancelTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'pending') {
      task.status = 'cancelled';
    }
  }

  async routeTask(task: AITask): Promise<string> {
    const role = this.roles.get(task.roleId);
    if (!role) {
      throw new Error(`Role not found: ${task.roleId}`);
    }

    if (!role.capabilities.some(cap => task.type.includes(cap))) {
      for (const [roleId, r] of this.roles) {
        if (r.capabilities.some(cap => task.type.includes(cap))) {
          return roleId;
        }
      }
    }

    return task.roleId;
  }

  getAuditLogs(filter?: AuditFilter): AIAuditLog[] {
    let logs = [...this.auditLogs];

    if (filter?.roleId) {
      logs = logs.filter(l => l.roleId === filter.roleId);
    }
    if (filter?.taskId) {
      logs = logs.filter(l => l.taskId === filter.taskId);
    }
    if (filter?.fromDate) {
      logs = logs.filter(l => l.timestamp >= filter.fromDate!);
    }
    if (filter?.toDate) {
      logs = logs.filter(l => l.timestamp <= filter.toDate!);
    }
    if (filter?.action) {
      logs = logs.filter(l => l.action === filter.action);
    }

    return logs;
  }

  enforceConstitution(roleId: string, action: string): ConstitutionDecision {
    const role = this.roles.get(roleId);
    if (!role) {
      return { allowed: false, reason: `Role not found: ${roleId}` };
    }

    for (const forbidden of role.constitution.mustNever) {
      if (action.toLowerCase().includes(forbidden.toLowerCase())) {
        return {
          allowed: false,
          rule: forbidden,
          reason: `Action violates constitution rule: ${forbidden}`,
        };
      }
    }

    return { allowed: true, reason: 'Action complies with constitution' };
  }

  private logAudit(task: AITask): void {
    const log: AIAuditLog = {
      id: `audit-${Date.now()}`,
      taskId: task.id,
      roleId: task.roleId,
      action: task.type,
      timestamp: new Date(),
      details: {
        input: task.input,
        output: task.output,
        duration: task.metrics?.executionTime ?? 0,
        tokens: task.metrics?.tokensUsed ?? 0,
      },
      compliance: {
        rulesChecked: [],
        violations: [],
        approved: task.status === 'completed',
      },
      signature: `sig-${task.id}-${Date.now()}`,
    };

    this.auditLogs.push(log);
  }
}

// ==================== SINGLETON EXPORT ====================
export const aiRolesEngine: IAIRolesEngine = new AIRolesEngineImpl();

export default aiRolesEngine;
