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

export interface AIGuardrail {
  id: string;
  name: string;
  nameAr: string;
  category: GuardrailCategory;
  description: string;
  descriptionAr: string;
  condition: string;
  conditionAr: string;
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
        description: 'Prevents AI from accessing or outputting personal identifiable information without authorization',
        descriptionAr: 'يمنع الذكاء الاصطناعي من الوصول أو إخراج معلومات التعريف الشخصية بدون تفويض',
        condition: 'access.type === "pii" && !user.hasPermission("pii_access")',
        conditionAr: 'نوع الوصول = بيانات شخصية و المستخدم ليس لديه صلاحية',
        severity: 'block',
        enabled: true
      },
      {
        name: 'Require Approval for Code Execution',
        nameAr: 'طلب موافقة لتنفيذ الكود',
        category: 'action',
        description: 'Requires human approval before executing generated code in production',
        descriptionAr: 'يتطلب موافقة بشرية قبل تنفيذ الكود المولد في الإنتاج',
        condition: 'action.type === "execute" && environment === "production"',
        conditionAr: 'نوع العملية = تنفيذ و البيئة = إنتاج',
        severity: 'block',
        enabled: true
      },
      {
        name: 'Rate Limit Token Usage',
        nameAr: 'تحديد استخدام التوكنات',
        category: 'resource',
        description: 'Warns when AI token usage exceeds defined thresholds',
        descriptionAr: 'تحذير عند تجاوز استخدام التوكنات للحدود المحددة',
        condition: 'tokens.used > tokens.limit * 0.8',
        conditionAr: 'التوكنات المستخدمة > 80% من الحد',
        severity: 'warn',
        enabled: true
      },
      {
        name: 'Block Unauthorized Model Access',
        nameAr: 'حظر الوصول غير المصرح للنماذج',
        category: 'security',
        description: 'Prevents access to restricted AI models without proper authorization',
        descriptionAr: 'يمنع الوصول للنماذج المقيدة بدون تفويض مناسب',
        condition: 'model.restricted && !user.hasRole("ai_admin")',
        conditionAr: 'النموذج مقيد و المستخدم ليس مسؤول ذكاء اصطناعي',
        severity: 'block',
        enabled: true
      },
      {
        name: 'Content Safety Filter',
        nameAr: 'فلتر سلامة المحتوى',
        category: 'content',
        description: 'Blocks AI from generating harmful, offensive, or inappropriate content',
        descriptionAr: 'يمنع الذكاء الاصطناعي من توليد محتوى ضار أو مسيء أو غير لائق',
        condition: 'content.safetyScore < 0.7',
        conditionAr: 'درجة سلامة المحتوى < 0.7',
        severity: 'block',
        enabled: true
      },
      {
        name: 'Scope Boundary Enforcement',
        nameAr: 'فرض حدود النطاق',
        category: 'scope',
        description: 'Ensures AI operations stay within defined project boundaries',
        descriptionAr: 'يضمن بقاء عمليات الذكاء الاصطناعي ضمن حدود المشروع المحددة',
        condition: 'action.scope !== "project" && !user.isOwner',
        conditionAr: 'نطاق العملية ≠ المشروع و المستخدم ليس المالك',
        severity: 'block',
        enabled: true
      },
      {
        name: 'Log High-Risk Operations',
        nameAr: 'تسجيل العمليات عالية المخاطر',
        category: 'action',
        description: 'Logs all high-risk AI operations for audit purposes',
        descriptionAr: 'تسجيل جميع عمليات الذكاء الاصطناعي عالية المخاطر لأغراض التدقيق',
        condition: 'action.riskLevel === "high"',
        conditionAr: 'مستوى مخاطر العملية = عالي',
        severity: 'log',
        enabled: true
      },
      {
        name: 'Database Modification Guard',
        nameAr: 'حارس تعديل قاعدة البيانات',
        category: 'data-access',
        description: 'Requires approval for AI-initiated database schema modifications',
        descriptionAr: 'يتطلب موافقة لتعديلات مخطط قاعدة البيانات التي يبدأها الذكاء الاصطناعي',
        condition: 'action.type === "db_modify" && action.target === "schema"',
        conditionAr: 'نوع العملية = تعديل قاعدة بيانات و الهدف = المخطط',
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
    const newGuardrail: AIGuardrail = {
      ...guardrail,
      id,
      createdAt: new Date().toISOString(),
      createdBy
    };
    this.guardrails.set(id, newGuardrail);
    console.log(`[AIGovernance] Created guardrail: ${guardrail.name}`);
    return newGuardrail;
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
    
    for (const guardrail of this.guardrails.values()) {
      if (!guardrail.enabled) continue;
      
      if (guardrail.category === 'action' && decision.action.includes('execute')) {
        triggered.push(guardrail.id);
      }
      if (guardrail.category === 'data-access' && decision.action.includes('data')) {
        triggered.push(guardrail.id);
      }
      if (guardrail.category === 'content' && decision.context.input.length > 10000) {
        triggered.push(guardrail.id);
      }
    }

    return triggered;
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
