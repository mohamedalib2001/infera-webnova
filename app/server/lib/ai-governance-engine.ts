/**
 * INFERA WebNova - AI Governance Engine
 * محرك التحكم في الذكاء الاصطناعي
 * 
 * AI Guardrails, Decision Logging, and Human-in-the-Loop
 */

export type GuardrailCategory = 'content' | 'action' | 'data-access' | 'resource' | 'scope' | 'security';
export type GuardrailSeverity = 'block' | 'warn' | 'log';
export type DecisionStatus = 'pending' | 'approved' | 'rejected' | 'auto-approved' | 'escalated';
export type InterventionType = 'approval' | 'rejection' | 'modification' | 'escalation' | 'override';

export type PredicateType = 
  | 'action-type' 
  | 'environment' 
  | 'data-type' 
  | 'token-threshold' 
  | 'safety-score' 
  | 'model-restricted' 
  | 'scope-boundary' 
  | 'risk-level'
  | 'permission-check'
  | 'role-check'
  | 'custom';

export interface GuardrailPredicate {
  type: PredicateType;
  field?: string;
  operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'contains' | 'and' | 'or' | 'not';
  value?: string | number | boolean;
  children?: GuardrailPredicate[];
}

export interface AIGuardrail {
  id: string;
  name: string;
  nameAr: string;
  category: GuardrailCategory;
  description: string;
  descriptionAr: string;
  condition: string;
  conditionAr: string;
  predicate: GuardrailPredicate;
  severity: GuardrailSeverity;
  enabled: boolean;
  createdAt: string;
  createdBy: string;
}

export interface AIDecision {
  id: string;
  timestamp: string;
  sessionId: string;
  userId: string;
  action: string;
  actionAr: string;
  context: {
    input: string;
    intent: string;
    model: string;
    temperature?: number;
    tokens?: number;
  };
  reasoning: string;
  reasoningAr: string;
  outcome: {
    success: boolean;
    result?: string;
    error?: string;
  };
  guardrailsTriggered: string[];
  status: DecisionStatus;
  riskScore: number;
  humanReview?: HumanIntervention;
}

export interface HumanIntervention {
  id: string;
  decisionId: string;
  type: InterventionType;
  requestedAt: string;
  resolvedAt?: string;
  requestedBy: string;
  resolvedBy?: string;
  reason: string;
  reasonAr: string;
  notes?: string;
  originalAction: string;
  modifiedAction?: string;
  status: 'pending' | 'resolved' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  expiresAt: string;
}

export interface AIPolicy {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  rules: PolicyRule[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'require-approval' | 'log';
  priority: number;
}

export interface GovernanceStats {
  totalDecisions: number;
  autoApproved: number;
  humanReviewed: number;
  blocked: number;
  guardrailsTriggered: number;
  averageRiskScore: number;
  pendingInterventions: number;
}

class AIGovernanceEngine {
  private guardrails: Map<string, AIGuardrail> = new Map();
  private decisions: Map<string, AIDecision> = new Map();
  private interventions: Map<string, HumanIntervention> = new Map();
  private policies: Map<string, AIPolicy> = new Map();

  constructor() {
    this.initializeDefaultGuardrails();
    this.initializeDefaultPolicies();
    console.log("[AIGovernance] Engine initialized | تم تهيئة محرك حوكمة الذكاء الاصطناعي");
  }

  private initializeDefaultGuardrails(): void {
    const defaults: Omit<AIGuardrail, 'id' | 'createdAt' | 'createdBy'>[] = [
      {
        name: 'Block Sensitive Data Access',
        nameAr: 'حظر الوصول للبيانات الحساسة',
        category: 'data-access',
        description: 'Prevents AI from accessing PII without authorization',
        descriptionAr: 'يمنع الذكاء الاصطناعي من الوصول للبيانات الشخصية بدون تفويض',
        condition: 'access.type === "pii" && !user.hasPermission("pii_access")',
        conditionAr: 'نوع الوصول = بيانات شخصية و المستخدم ليس لديه صلاحية',
        predicate: {
          type: 'permission-check',
          operator: 'and',
          children: [
            { type: 'data-type', field: 'access.type', operator: 'equals', value: 'pii' },
            { type: 'permission-check', field: 'pii_access', operator: 'not', value: true }
          ]
        },
        severity: 'block',
        enabled: true
      },
      {
        name: 'Require Approval for Code Execution',
        nameAr: 'طلب موافقة لتنفيذ الكود',
        category: 'action',
        description: 'Requires human approval before executing code in production',
        descriptionAr: 'يتطلب موافقة بشرية قبل تنفيذ الكود في الإنتاج',
        condition: 'action.type === "execute" && environment === "production"',
        conditionAr: 'نوع العملية = تنفيذ و البيئة = إنتاج',
        predicate: {
          type: 'action-type',
          operator: 'and',
          children: [
            { type: 'action-type', field: 'action.type', operator: 'equals', value: 'execute' },
            { type: 'environment', field: 'environment', operator: 'equals', value: 'production' }
          ]
        },
        severity: 'block',
        enabled: true
      },
      {
        name: 'Rate Limit Token Usage',
        nameAr: 'تحديد استخدام التوكنات',
        category: 'resource',
        description: 'Warns when token usage exceeds 80% of limit',
        descriptionAr: 'تحذير عند تجاوز استخدام التوكنات للحدود المحددة',
        condition: 'tokens.used > tokens.limit * 0.8',
        conditionAr: 'التوكنات المستخدمة > 80% من الحد',
        predicate: { type: 'token-threshold', field: 'tokens.ratio', operator: 'greater-than', value: 0.8 },
        severity: 'warn',
        enabled: true
      },
      {
        name: 'Block Unauthorized Model Access',
        nameAr: 'حظر الوصول غير المصرح للنماذج',
        category: 'security',
        description: 'Prevents access to restricted AI models without authorization',
        descriptionAr: 'يمنع الوصول للنماذج المقيدة بدون تفويض',
        condition: 'model.restricted && !user.hasRole("ai_admin")',
        conditionAr: 'النموذج مقيد و المستخدم ليس مسؤول',
        predicate: {
          type: 'role-check',
          operator: 'and',
          children: [
            { type: 'model-restricted', field: 'model.restricted', operator: 'equals', value: true },
            { type: 'role-check', field: 'ai_admin', operator: 'not', value: true }
          ]
        },
        severity: 'block',
        enabled: true
      },
      {
        name: 'Content Safety Filter',
        nameAr: 'فلتر سلامة المحتوى',
        category: 'content',
        description: 'Blocks harmful, offensive, or inappropriate content',
        descriptionAr: 'يمنع توليد محتوى ضار أو غير لائق',
        condition: 'content.safetyScore < 0.7',
        conditionAr: 'درجة سلامة المحتوى < 0.7',
        predicate: { type: 'safety-score', field: 'content.safetyScore', operator: 'less-than', value: 0.7 },
        severity: 'block',
        enabled: true
      },
      {
        name: 'Scope Boundary Enforcement',
        nameAr: 'فرض حدود النطاق',
        category: 'scope',
        description: 'Ensures AI stays within project boundaries',
        descriptionAr: 'يضمن بقاء العمليات ضمن حدود المشروع',
        condition: 'action.scope !== "project" && !user.isOwner',
        conditionAr: 'نطاق العملية ≠ المشروع',
        predicate: {
          type: 'scope-boundary',
          operator: 'and',
          children: [
            { type: 'scope-boundary', field: 'action.scope', operator: 'not-equals', value: 'project' },
            { type: 'permission-check', field: 'isOwner', operator: 'not', value: true }
          ]
        },
        severity: 'block',
        enabled: true
      },
      {
        name: 'Log High-Risk Operations',
        nameAr: 'تسجيل العمليات عالية المخاطر',
        category: 'action',
        description: 'Logs all high-risk AI operations for audit',
        descriptionAr: 'تسجيل العمليات عالية المخاطر',
        condition: 'action.riskLevel === "high"',
        conditionAr: 'مستوى المخاطر = عالي',
        predicate: { type: 'risk-level', field: 'action.riskLevel', operator: 'equals', value: 'high' },
        severity: 'log',
        enabled: true
      },
      {
        name: 'Database Modification Guard',
        nameAr: 'حارس تعديل قاعدة البيانات',
        category: 'data-access',
        description: 'Requires approval for database schema modifications',
        descriptionAr: 'يتطلب موافقة لتعديل مخطط قاعدة البيانات',
        condition: 'action.type === "db_modify" && action.target === "schema"',
        conditionAr: 'تعديل مخطط قاعدة البيانات',
        predicate: {
          type: 'action-type',
          operator: 'and',
          children: [
            { type: 'action-type', field: 'action.type', operator: 'equals', value: 'db_modify' },
            { type: 'action-type', field: 'action.target', operator: 'equals', value: 'schema' }
          ]
        },
        severity: 'block',
        enabled: true
      }
    ];

    defaults.forEach((g, i) => {
      const id = `guardrail-${i + 1}`;
      this.guardrails.set(id, {
        ...g,
        id,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      });
    });
  }

  private initializeDefaultPolicies(): void {
    const defaults: Omit<AIPolicy, 'createdAt' | 'updatedAt'>[] = [
      {
        id: 'policy-production',
        name: 'Production Environment Policy',
        nameAr: 'سياسة بيئة الإنتاج',
        description: 'Strict controls for AI operations in production environment',
        descriptionAr: 'ضوابط صارمة لعمليات الذكاء الاصطناعي في بيئة الإنتاج',
        rules: [
          { id: 'r1', condition: 'env === "production" && action === "deploy"', action: 'require-approval', priority: 1 },
          { id: 'r2', condition: 'env === "production" && action === "delete"', action: 'deny', priority: 1 },
          { id: 'r3', condition: 'env === "production"', action: 'log', priority: 10 }
        ],
        enabled: true
      },
      {
        id: 'policy-financial',
        name: 'Financial Data Policy',
        nameAr: 'سياسة البيانات المالية',
        description: 'Controls for AI access to financial data and transactions',
        descriptionAr: 'ضوابط وصول الذكاء الاصطناعي للبيانات والمعاملات المالية',
        rules: [
          { id: 'r1', condition: 'data.type === "financial" && action === "modify"', action: 'require-approval', priority: 1 },
          { id: 'r2', condition: 'data.type === "financial"', action: 'log', priority: 5 }
        ],
        enabled: true
      },
      {
        id: 'policy-pii',
        name: 'PII Protection Policy',
        nameAr: 'سياسة حماية البيانات الشخصية',
        description: 'Protects personally identifiable information from unauthorized AI access',
        descriptionAr: 'حماية معلومات التعريف الشخصية من الوصول غير المصرح للذكاء الاصطناعي',
        rules: [
          { id: 'r1', condition: 'data.pii === true && !user.piiAccess', action: 'deny', priority: 1 },
          { id: 'r2', condition: 'data.pii === true', action: 'log', priority: 5 }
        ],
        enabled: true
      }
    ];

    defaults.forEach(p => {
      this.policies.set(p.id, {
        ...p,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  }

  createGuardrail(guardrail: Omit<AIGuardrail, 'id' | 'createdAt'>, createdBy: string): AIGuardrail {
    const id = `guardrail-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const predicate = guardrail.predicate || this.buildPredicateFromCondition(guardrail.condition, guardrail.category);
    
    const newGuardrail: AIGuardrail = {
      ...guardrail,
      predicate,
      id,
      createdAt: new Date().toISOString(),
      createdBy
    };
    this.guardrails.set(id, newGuardrail);
    console.log(`[AIGovernance] Created guardrail: ${guardrail.name}`);
    return newGuardrail;
  }

  private buildPredicateFromCondition(condition: string, category: GuardrailCategory): GuardrailPredicate {
    const condLower = condition.toLowerCase();
    
    if (condLower.includes('execute') && condLower.includes('production')) {
      return {
        type: 'action-type',
        operator: 'and',
        children: [
          { type: 'action-type', field: 'action.type', operator: 'equals', value: 'execute' },
          { type: 'environment', field: 'environment', operator: 'equals', value: 'production' }
        ]
      };
    }
    
    if (condLower.includes('deploy') && condLower.includes('production')) {
      return {
        type: 'action-type',
        operator: 'and',
        children: [
          { type: 'action-type', field: 'action.type', operator: 'equals', value: 'deploy' },
          { type: 'environment', field: 'environment', operator: 'equals', value: 'production' }
        ]
      };
    }
    
    if (condLower.includes('delete') && condLower.includes('production')) {
      return {
        type: 'action-type',
        operator: 'and',
        children: [
          { type: 'action-type', field: 'action.type', operator: 'equals', value: 'delete' },
          { type: 'environment', field: 'environment', operator: 'equals', value: 'production' }
        ]
      };
    }
    
    if (condLower.includes('pii') || condLower.includes('personal')) {
      return { type: 'data-type', field: 'access.type', operator: 'equals', value: 'pii' };
    }
    
    if (condLower.includes('financial')) {
      return { type: 'data-type', field: 'data.type', operator: 'equals', value: 'financial' };
    }
    
    if (condLower.includes('db_modify') && condLower.includes('schema')) {
      return {
        type: 'action-type',
        operator: 'and',
        children: [
          { type: 'action-type', field: 'action.type', operator: 'equals', value: 'db_modify' },
          { type: 'action-type', field: 'action.target', operator: 'contains', value: 'schema' }
        ]
      };
    }
    
    if (condLower.includes('db_modify') || condLower.includes('database')) {
      return { type: 'action-type', field: 'action.type', operator: 'equals', value: 'db_modify' };
    }
    
    if (condLower.includes('risklevel') && condLower.includes('high')) {
      return { type: 'risk-level', field: 'action.riskLevel', operator: 'equals', value: 'high' };
    }
    
    if (condLower.includes('safetyscore')) {
      const match = condition.match(/<\s*([\d.]+)/);
      const threshold = match ? parseFloat(match[1]) : 0.7;
      return { type: 'safety-score', field: 'content.safetyScore', operator: 'less-than', value: threshold };
    }
    
    if (condLower.includes('restricted') && condLower.includes('model')) {
      return { type: 'model-restricted', field: 'model.restricted', operator: 'equals', value: true };
    }
    
    if (condLower.includes('tokens') && (condLower.includes('limit') || condLower.includes('>'))) {
      const match = condition.match(/>\s*[\w.]*\s*\*\s*([\d.]+)/);
      const threshold = match ? parseFloat(match[1]) : 0.8;
      return { type: 'token-threshold', field: 'tokens.ratio', operator: 'greater-than', value: threshold };
    }
    
    if (condLower.includes('scope') && condLower.includes('project')) {
      return { type: 'scope-boundary', field: 'action.scope', operator: 'not-equals', value: 'project' };
    }
    
    if (condLower.includes('delete')) {
      return { type: 'action-type', field: 'action.type', operator: 'equals', value: 'delete' };
    }
    
    if (condLower.includes('execute')) {
      return { type: 'action-type', field: 'action.type', operator: 'equals', value: 'execute' };
    }
    
    if (condLower.includes('deploy')) {
      return { type: 'action-type', field: 'action.type', operator: 'equals', value: 'deploy' };
    }
    
    if (condLower.includes('modify') || condLower.includes('update')) {
      return { type: 'action-type', field: 'action.type', operator: 'equals', value: 'modify' };
    }
    
    switch (category) {
      case 'action':
        return { type: 'risk-level', field: 'action.riskLevel', operator: 'equals', value: 'high' };
      case 'data-access':
        return { type: 'data-type', field: 'data.pii', operator: 'equals', value: true };
      case 'content':
        return { type: 'safety-score', field: 'content.safetyScore', operator: 'less-than', value: 0.7 };
      case 'resource':
        return { type: 'token-threshold', field: 'tokens.ratio', operator: 'greater-than', value: 0.8 };
      case 'scope':
        return { type: 'scope-boundary', field: 'action.scope', operator: 'not-equals', value: 'project' };
      case 'security':
        return { type: 'model-restricted', field: 'model.restricted', operator: 'equals', value: true };
      default:
        return { type: 'risk-level', field: 'action.riskLevel', operator: 'equals', value: 'high' };
    }
  }

  updateGuardrail(id: string, updates: Partial<AIGuardrail>): AIGuardrail | null {
    const guardrail = this.guardrails.get(id);
    if (!guardrail) return null;
    const updated = { ...guardrail, ...updates };
    this.guardrails.set(id, updated);
    return updated;
  }

  deleteGuardrail(id: string): boolean {
    return this.guardrails.delete(id);
  }

  getGuardrails(category?: GuardrailCategory): AIGuardrail[] {
    const all = Array.from(this.guardrails.values());
    return category ? all.filter(g => g.category === category) : all;
  }

  logDecision(decision: Omit<AIDecision, 'id' | 'timestamp' | 'guardrailsTriggered' | 'status' | 'riskScore'>): AIDecision {
    const id = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const guardrailsTriggered = this.evaluateGuardrails(decision);
    const riskScore = this.calculateRiskScore(decision, guardrailsTriggered);
    const status = this.determineDecisionStatus(guardrailsTriggered, riskScore);

    const newDecision: AIDecision = {
      ...decision,
      id,
      timestamp: new Date().toISOString(),
      guardrailsTriggered,
      riskScore,
      status
    };

    this.decisions.set(id, newDecision);
    console.log(`[AIGovernance] Logged decision: ${id} | Status: ${status} | Risk: ${riskScore}`);
    
    if (status === 'escalated') {
      this.createIntervention(newDecision, 'escalation', 'system');
    }

    return newDecision;
  }

  private evaluateGuardrails(decision: Omit<AIDecision, 'id' | 'timestamp' | 'guardrailsTriggered' | 'status' | 'riskScore'>): string[] {
    const triggered: string[] = [];
    
    const evalContext = {
      action: {
        name: decision.action,
        type: this.extractActionType(decision.action),
        scope: decision.context.intent?.includes('global') ? 'global' : 'project',
        target: decision.context.intent || '',
        riskLevel: this.determineActionRiskLevel(decision.action)
      },
      content: {
        input: decision.context.input,
        length: decision.context.input?.length || 0,
        safetyScore: this.calculateContentSafetyScore(decision.context.input)
      },
      model: {
        name: decision.context.model || '',
        restricted: ['gpt-4-vision', 'claude-3-opus'].includes(decision.context.model || ''),
        tokens: decision.context.tokens || 0
      },
      tokens: {
        used: decision.context.tokens || 0,
        limit: 8000
      },
      access: {
        type: decision.action.includes('pii') || decision.action.includes('personal') ? 'pii' : 'standard',
        dataType: decision.context.intent || ''
      },
      data: {
        type: decision.action.includes('financial') ? 'financial' : decision.action.includes('pii') ? 'pii' : 'standard',
        pii: decision.action.includes('pii') || decision.action.includes('personal')
      },
      user: {
        id: decision.userId,
        isOwner: decision.userId === 'mohamed.ali.b2001@gmail.com',
        piiAccess: decision.userId === 'mohamed.ali.b2001@gmail.com',
        roles: decision.userId === 'mohamed.ali.b2001@gmail.com' ? ['owner', 'ai_admin', 'admin'] : ['user'],
        permissions: decision.userId === 'mohamed.ali.b2001@gmail.com' ? ['pii_access', 'admin_access', 'execute'] : ['basic']
      },
      environment: decision.context.intent?.includes('production') ? 'production' : 'development',
      env: decision.context.intent?.includes('production') ? 'production' : 'development'
    };
    
    for (const guardrail of this.guardrails.values()) {
      if (!guardrail.enabled) continue;
      
      const shouldTrigger = this.evaluateCondition(guardrail, evalContext);
      if (shouldTrigger) {
        triggered.push(guardrail.id);
      }
    }

    return triggered;
  }

  private extractActionType(action: string): string {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('execute')) return 'execute';
    if (actionLower.includes('deploy')) return 'deploy';
    if (actionLower.includes('delete')) return 'delete';
    if (actionLower.includes('modify') || actionLower.includes('update')) return 'modify';
    if (actionLower.includes('db_modify') || actionLower.includes('database')) return 'db_modify';
    if (actionLower.includes('read') || actionLower.includes('get')) return 'read';
    if (actionLower.includes('create')) return 'create';
    return 'unknown';
  }

  private determineActionRiskLevel(action: string): string {
    const highRisk = ['delete', 'execute', 'deploy', 'schema', 'production', 'admin'];
    const mediumRisk = ['modify', 'update', 'create', 'import'];
    
    const actionLower = action.toLowerCase();
    if (highRisk.some(r => actionLower.includes(r))) return 'high';
    if (mediumRisk.some(r => actionLower.includes(r))) return 'medium';
    return 'low';
  }

  private calculateContentSafetyScore(input: string): number {
    if (!input) return 1.0;
    
    const unsafePatterns = [
      /\b(hack|exploit|attack|malware|virus)\b/i,
      /\b(password|credential|secret|token)\b/i,
      /\b(sql\s*injection|xss|csrf)\b/i,
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      /rm\s+-rf\s+\//i,
      /drop\s+table|delete\s+from/i
    ];
    
    let score = 1.0;
    for (const pattern of unsafePatterns) {
      if (pattern.test(input)) {
        score -= 0.15;
      }
    }
    
    return Math.max(0, score);
  }

  private evaluateCondition(guardrail: AIGuardrail, ctx: any): boolean {
    try {
      if (guardrail.predicate) {
        return this.evaluatePredicate(guardrail.predicate, ctx);
      }
      return false;
    } catch (error) {
      console.error(`[AIGovernance] Error evaluating guardrail ${guardrail.id}:`, error);
      return false;
    }
  }

  private evaluatePredicate(predicate: GuardrailPredicate, ctx: any): boolean {
    const { type, field, operator, value, children } = predicate;

    if (operator === 'and' && children) {
      return children.every(child => this.evaluatePredicate(child, ctx));
    }
    if (operator === 'or' && children) {
      return children.some(child => this.evaluatePredicate(child, ctx));
    }
    if (operator === 'not') {
      if (children && children.length > 0) {
        return !this.evaluatePredicate(children[0], ctx);
      }
      return !this.getFieldValue(field, ctx, type);
    }

    const fieldValue = this.getFieldValue(field, ctx, type);

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not-equals':
        return fieldValue !== value;
      case 'greater-than':
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue > value;
      case 'less-than':
        return typeof fieldValue === 'number' && typeof value === 'number' && fieldValue < value;
      case 'contains':
        return typeof fieldValue === 'string' && typeof value === 'string' && fieldValue.includes(value);
      default:
        return false;
    }
  }

  private getFieldValue(field: string | undefined, ctx: any, type: PredicateType): any {
    if (!field) return null;

    switch (type) {
      case 'action-type':
        if (field === 'action.type') return ctx.action.type;
        if (field === 'action.target') return ctx.action.target;
        if (field === 'action.scope') return ctx.action.scope;
        if (field === 'action.riskLevel') return ctx.action.riskLevel;
        break;
      case 'environment':
        if (field === 'environment') return ctx.environment;
        break;
      case 'data-type':
        if (field === 'access.type') return ctx.access.type;
        if (field === 'data.type') return ctx.data.type;
        if (field === 'data.pii') return ctx.data.pii;
        break;
      case 'token-threshold':
        if (field === 'tokens.ratio') return ctx.tokens.limit > 0 ? ctx.tokens.used / ctx.tokens.limit : 0;
        if (field === 'tokens.used') return ctx.tokens.used;
        break;
      case 'safety-score':
        if (field === 'content.safetyScore') return ctx.content.safetyScore;
        break;
      case 'model-restricted':
        if (field === 'model.restricted') return ctx.model.restricted;
        break;
      case 'scope-boundary':
        if (field === 'action.scope') return ctx.action.scope;
        break;
      case 'risk-level':
        if (field === 'action.riskLevel') return ctx.action.riskLevel;
        break;
      case 'permission-check':
        if (field === 'pii_access') return ctx.user.piiAccess;
        if (field === 'isOwner') return ctx.user.isOwner;
        return ctx.user.permissions?.includes(field) || false;
      case 'role-check':
        if (field === 'ai_admin') return ctx.user.roles?.includes('ai_admin') || false;
        return ctx.user.roles?.includes(field) || false;
    }

    const parts = field.split('.');
    let current = ctx;
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    return current;
  }

  private calculateRiskScore(decision: any, guardrailsTriggered: string[]): number {
    let score = 20;
    
    score += guardrailsTriggered.length * 15;
    
    if (decision.action.includes('delete')) score += 25;
    if (decision.action.includes('execute')) score += 20;
    if (decision.action.includes('deploy')) score += 20;
    if (decision.action.includes('modify')) score += 15;
    
    if (decision.context.model?.includes('gpt-4')) score += 5;
    if (decision.context.tokens && decision.context.tokens > 4000) score += 10;
    
    return Math.min(100, score);
  }

  private determineDecisionStatus(guardrailsTriggered: string[], riskScore: number): DecisionStatus {
    const blockingGuardrails = guardrailsTriggered.filter(id => {
      const g = this.guardrails.get(id);
      return g?.severity === 'block';
    });

    if (blockingGuardrails.length > 0) return 'escalated';
    if (riskScore >= 70) return 'escalated';
    if (riskScore >= 50) return 'pending';
    return 'auto-approved';
  }

  getDecisions(filters?: { userId?: string; status?: DecisionStatus; fromDate?: string; toDate?: string }): AIDecision[] {
    let decisions = Array.from(this.decisions.values());
    
    if (filters?.userId) {
      decisions = decisions.filter(d => d.userId === filters.userId);
    }
    if (filters?.status) {
      decisions = decisions.filter(d => d.status === filters.status);
    }
    if (filters?.fromDate) {
      decisions = decisions.filter(d => d.timestamp >= filters.fromDate!);
    }
    if (filters?.toDate) {
      decisions = decisions.filter(d => d.timestamp <= filters.toDate!);
    }

    return decisions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getDecision(id: string): AIDecision | null {
    return this.decisions.get(id) || null;
  }

  createIntervention(decision: AIDecision, type: InterventionType, requestedBy: string, reason?: string): HumanIntervention {
    const id = `intervention-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const priority = decision.riskScore >= 80 ? 'critical' : decision.riskScore >= 60 ? 'high' : decision.riskScore >= 40 ? 'medium' : 'low';
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (priority === 'critical' ? 1 : priority === 'high' ? 4 : 24));

    const intervention: HumanIntervention = {
      id,
      decisionId: decision.id,
      type,
      requestedAt: new Date().toISOString(),
      requestedBy,
      reason: reason || `Risk score ${decision.riskScore} exceeds threshold`,
      reasonAr: reason || `درجة المخاطر ${decision.riskScore} تتجاوز الحد المسموح`,
      originalAction: decision.action,
      status: 'pending',
      priority,
      expiresAt: expiresAt.toISOString()
    };

    this.interventions.set(id, intervention);
    console.log(`[AIGovernance] Created intervention: ${id} | Priority: ${priority}`);
    return intervention;
  }

  resolveIntervention(id: string, resolvedBy: string, type: InterventionType, notes?: string, modifiedAction?: string): HumanIntervention | null {
    const intervention = this.interventions.get(id);
    if (!intervention) return null;

    intervention.resolvedAt = new Date().toISOString();
    intervention.resolvedBy = resolvedBy;
    intervention.type = type;
    intervention.notes = notes;
    intervention.modifiedAction = modifiedAction;
    intervention.status = 'resolved';

    const decision = this.decisions.get(intervention.decisionId);
    if (decision) {
      decision.status = type === 'approval' ? 'approved' : type === 'rejection' ? 'rejected' : decision.status;
      decision.humanReview = intervention;
      this.decisions.set(decision.id, decision);
    }

    this.interventions.set(id, intervention);
    console.log(`[AIGovernance] Resolved intervention: ${id} | Type: ${type}`);
    return intervention;
  }

  getInterventions(status?: 'pending' | 'resolved' | 'expired'): HumanIntervention[] {
    let interventions = Array.from(this.interventions.values());
    
    const now = new Date().toISOString();
    interventions.forEach(i => {
      if (i.status === 'pending' && i.expiresAt < now) {
        i.status = 'expired';
        this.interventions.set(i.id, i);
      }
    });

    if (status) {
      interventions = interventions.filter(i => i.status === status);
    }

    return interventions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  getIntervention(id: string): HumanIntervention | null {
    return this.interventions.get(id) || null;
  }

  getPolicies(): AIPolicy[] {
    return Array.from(this.policies.values());
  }

  updatePolicy(id: string, updates: Partial<AIPolicy>): AIPolicy | null {
    const policy = this.policies.get(id);
    if (!policy) return null;
    const updated = { ...policy, ...updates, updatedAt: new Date().toISOString() };
    this.policies.set(id, updated);
    return updated;
  }

  getStats(): GovernanceStats {
    const decisions = Array.from(this.decisions.values());
    const interventions = Array.from(this.interventions.values());

    return {
      totalDecisions: decisions.length,
      autoApproved: decisions.filter(d => d.status === 'auto-approved').length,
      humanReviewed: decisions.filter(d => d.humanReview).length,
      blocked: decisions.filter(d => d.status === 'rejected').length,
      guardrailsTriggered: decisions.reduce((sum, d) => sum + d.guardrailsTriggered.length, 0),
      averageRiskScore: decisions.length > 0 ? Math.round(decisions.reduce((sum, d) => sum + d.riskScore, 0) / decisions.length) : 0,
      pendingInterventions: interventions.filter(i => i.status === 'pending').length
    };
  }

  getGuardrailCategories(): { id: GuardrailCategory; name: string; nameAr: string }[] {
    return [
      { id: 'content', name: 'Content Safety', nameAr: 'سلامة المحتوى' },
      { id: 'action', name: 'Action Control', nameAr: 'التحكم في العمليات' },
      { id: 'data-access', name: 'Data Access', nameAr: 'الوصول للبيانات' },
      { id: 'resource', name: 'Resource Limits', nameAr: 'حدود الموارد' },
      { id: 'scope', name: 'Scope Boundaries', nameAr: 'حدود النطاق' },
      { id: 'security', name: 'Security', nameAr: 'الأمان' }
    ];
  }
}

export const aiGovernanceEngine = new AIGovernanceEngine();
