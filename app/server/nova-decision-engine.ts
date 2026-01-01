/**
 * Nova AI Decision Policy Engine - محرك سياسات القرار السيادي
 * SOVEREIGN DECISION GOVERNOR - NOT JUST AN ASSISTANT
 * 
 * Core Principles (Non-Negotiable):
 * 1. Nova AI GOVERNS, does NOT execute directly
 * 2. Clear separation: Analysis → Decision → Execution
 * 3. Owner Root Authority is ABSOLUTE
 * 4. Full Decision Traceability (Why, How, Who, When)
 * 5. No Trust Above Owner
 */

import { z } from 'zod';
import crypto from 'crypto';
import { db } from './db';
import { eq, and, desc, asc, isNull, sql } from 'drizzle-orm';
import { 
  novaSovereignDecisions, 
  novaDecisionSteps, 
  novaApprovalChains,
  novaPolicies,
  novaDecisionAudit,
  novaKillSwitch,
  type NovaSovereignDecision,
  type NovaDecisionStep,
  type NovaApprovalChain,
  type NovaPolicy,
  type NovaDecisionAudit
} from '@shared/schema';

// ==================== DECISION PHASES ====================
export const DecisionPhase = {
  ANALYSIS: 'analysis',
  DECISION: 'decision', 
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  KILLED: 'killed',
} as const;

export type DecisionPhaseType = typeof DecisionPhase[keyof typeof DecisionPhase];

// ==================== DECISION TYPES ====================
export const DecisionType = {
  GOVERNANCE: 'governance',
  POLICY: 'policy',
  RESOURCE: 'resource',
  SECURITY: 'security',
  FINANCIAL: 'financial',
  OPERATIONAL: 'operational',
  STRATEGIC: 'strategic',
  EMERGENCY: 'emergency',
} as const;

export type DecisionTypeType = typeof DecisionType[keyof typeof DecisionType];

// ==================== RISK LEVELS ====================
export const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
  SOVEREIGN: 'sovereign',
} as const;

export type RiskLevelType = typeof RiskLevel[keyof typeof RiskLevel];

// ==================== APPROVAL LEVELS ====================
export const ApprovalLevel = {
  AUTOMATIC: 'automatic',
  STANDARD: 'standard',
  ELEVATED: 'elevated',
  SOVEREIGN: 'sovereign',
  OWNER_ONLY: 'owner_only',
} as const;

export type ApprovalLevelType = typeof ApprovalLevel[keyof typeof ApprovalLevel];

// ==================== SCHEMAS ====================

export const DecisionRequestSchema = z.object({
  type: z.nativeEnum(DecisionType),
  title: z.string(),
  titleAr: z.string(),
  description: z.string(),
  descriptionAr: z.string(),
  targetPlatform: z.string().optional(),
  targetResource: z.string().optional(),
  requestedBy: z.string(),
  context: z.record(z.unknown()).optional(),
  urgency: z.enum(['normal', 'urgent', 'critical']).default('normal'),
});

export type DecisionRequest = z.infer<typeof DecisionRequestSchema>;

export const DecisionStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  titleAr: z.string(),
  description: z.string(),
  descriptionAr: z.string(),
  order: z.number(),
  requiresApproval: z.boolean(),
  approvalLevel: z.nativeEnum(ApprovalLevel),
  estimatedImpact: z.string().optional(),
  rollbackPlan: z.string().optional(),
});

export type DecisionStepInput = z.infer<typeof DecisionStepSchema>;

export const PolicyConstraintSchema = z.object({
  id: z.string(),
  type: z.enum(['limit', 'require', 'deny', 'conditional']),
  target: z.string(),
  condition: z.string(),
  value: z.unknown(),
  message: z.string(),
  messageAr: z.string(),
});

export type PolicyConstraint = z.infer<typeof PolicyConstraintSchema>;

// ==================== DECISION ANALYSIS RESULT ====================

export interface AnalysisResult {
  decisionId: string;
  feasibility: number;
  riskAssessment: {
    level: RiskLevelType;
    factors: Array<{
      factor: string;
      factorAr: string;
      impact: 'low' | 'medium' | 'high';
      probability: number;
      mitigation: string;
      mitigationAr: string;
    }>;
  };
  policyCompliance: {
    compliant: boolean;
    violations: Array<{
      policyId: string;
      policyName: string;
      violation: string;
      violationAr: string;
    }>;
    warnings: Array<{
      policyId: string;
      message: string;
      messageAr: string;
    }>;
  };
  resourceRequirements: {
    compute: number;
    storage: number;
    estimatedCost: number;
    duration: string;
  };
  recommendations: Array<{
    type: 'proceed' | 'modify' | 'defer' | 'reject';
    reason: string;
    reasonAr: string;
    confidence: number;
  }>;
  requiredApprovalLevel: ApprovalLevelType;
}

// ==================== DECISION TRACEABILITY ====================

export interface DecisionTrace {
  decisionId: string;
  timestamp: Date;
  phase: DecisionPhaseType;
  actor: {
    id: string;
    type: 'nova_ai' | 'owner' | 'sovereign' | 'system';
    name: string;
  };
  action: string;
  actionAr: string;
  reason: string;
  reasonAr: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
  policyReferences: string[];
  signature: string;
}

// ==================== NOVA DECISION ENGINE CLASS ====================

export class NovaDecisionEngine {
  private killSwitchActive: boolean = false;
  
  constructor() {
    this.checkKillSwitch();
  }

  /**
   * Check if emergency kill switch is active
   */
  private async checkKillSwitch(): Promise<boolean> {
    try {
      const killSwitch = await db.select()
        .from(novaKillSwitch)
        .where(eq(novaKillSwitch.isActive, true))
        .limit(1);
      
      this.killSwitchActive = killSwitch.length > 0;
      return this.killSwitchActive;
    } catch {
      return false;
    }
  }

  /**
   * PHASE 1: ANALYSIS
   * Analyze a decision request without making any changes
   */
  async analyzeDecision(request: DecisionRequest): Promise<AnalysisResult> {
    if (this.killSwitchActive) {
      throw new Error('KILL_SWITCH_ACTIVE: All Nova AI operations are suspended');
    }

    const decisionId = `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const riskLevel = this.calculateRiskLevel(request);
    const requiredApprovalLevel = this.determineApprovalLevel(request, riskLevel);
    
    const policyViolations = await this.checkPolicyCompliance(request);
    
    const analysis: AnalysisResult = {
      decisionId,
      feasibility: policyViolations.violations.length === 0 ? 85 : 40,
      riskAssessment: {
        level: riskLevel,
        factors: this.identifyRiskFactors(request, riskLevel),
      },
      policyCompliance: policyViolations,
      resourceRequirements: {
        compute: this.estimateComputeResources(request),
        storage: this.estimateStorageResources(request),
        estimatedCost: this.estimateCost(request),
        duration: this.estimateDuration(request),
      },
      recommendations: this.generateRecommendations(request, riskLevel, policyViolations),
      requiredApprovalLevel,
    };

    // NOTE: Audit log is deferred until decision is created in database
    // to satisfy foreign key constraints

    return analysis;
  }

  /**
   * PHASE 2: DECISION
   * Create a formal decision with steps (does NOT execute)
   */
  async createDecision(
    request: DecisionRequest, 
    analysis: AnalysisResult,
    steps: DecisionStepInput[]
  ): Promise<NovaSovereignDecision> {
    if (this.killSwitchActive) {
      throw new Error('KILL_SWITCH_ACTIVE: All Nova AI operations are suspended');
    }

    const decision = await db.insert(novaSovereignDecisions).values({
      id: analysis.decisionId,
      type: request.type,
      title: request.title,
      titleAr: request.titleAr,
      description: request.description,
      descriptionAr: request.descriptionAr,
      targetPlatform: request.targetPlatform || null,
      targetResource: request.targetResource || null,
      requestedBy: request.requestedBy,
      phase: DecisionPhase.PENDING_APPROVAL,
      riskLevel: analysis.riskAssessment.level,
      requiredApprovalLevel: analysis.requiredApprovalLevel,
      feasibilityScore: analysis.feasibility,
      analysisResult: analysis as unknown as Record<string, unknown>,
      context: request.context || {},
      urgency: request.urgency,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Log analysis trace (deferred from analyzeDecision to satisfy FK constraints)
    await this.logTrace({
      decisionId: analysis.decisionId,
      timestamp: new Date(),
      phase: DecisionPhase.ANALYSIS,
      actor: { id: 'nova_ai', type: 'nova_ai', name: 'Nova AI Decision Engine' },
      action: 'Decision Analysis Completed',
      actionAr: 'اكتمل تحليل القرار',
      reason: 'Initial analysis of decision request',
      reasonAr: 'التحليل الأولي لطلب القرار',
      inputs: request as unknown as Record<string, unknown>,
      outputs: analysis as unknown as Record<string, unknown>,
      policyReferences: [],
      signature: this.generateSignature(analysis.decisionId, 'analysis'),
    });

    for (const step of steps) {
      await db.insert(novaDecisionSteps).values({
        id: step.id,
        decisionId: analysis.decisionId,
        title: step.title,
        titleAr: step.titleAr,
        description: step.description,
        descriptionAr: step.descriptionAr,
        order: step.order,
        status: 'pending',
        requiresApproval: step.requiresApproval,
        approvalLevel: step.approvalLevel,
        estimatedImpact: step.estimatedImpact || null,
        rollbackPlan: step.rollbackPlan || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await this.logTrace({
      decisionId: analysis.decisionId,
      timestamp: new Date(),
      phase: DecisionPhase.DECISION,
      actor: { id: 'nova_ai', type: 'nova_ai', name: 'Nova AI Decision Engine' },
      action: 'Decision Created - Awaiting Approval',
      actionAr: 'تم إنشاء القرار - في انتظار الموافقة',
      reason: 'Decision formalized with execution steps',
      reasonAr: 'تم تنسيق القرار مع خطوات التنفيذ',
      inputs: { steps: steps.length },
      outputs: { decisionId: analysis.decisionId, phase: DecisionPhase.PENDING_APPROVAL },
      policyReferences: [],
      signature: this.generateSignature(analysis.decisionId, 'decision'),
    });

    return decision[0];
  }

  /**
   * OWNER APPROVAL
   * Only the Owner can approve sovereign decisions
   */
  async approveDecision(
    decisionId: string,
    approverId: string,
    approverRole: 'owner' | 'sovereign' | 'admin',
    approvalNotes?: string
  ): Promise<{ success: boolean; message: string; messageAr: string }> {
    const decision = await db.select()
      .from(novaSovereignDecisions)
      .where(eq(novaSovereignDecisions.id, decisionId))
      .limit(1);

    if (!decision.length) {
      return { success: false, message: 'Decision not found', messageAr: 'القرار غير موجود' };
    }

    const dec = decision[0];
    
    if (!this.canApprove(dec.requiredApprovalLevel as ApprovalLevelType, approverRole)) {
      return { 
        success: false, 
        message: `Insufficient authority. Required: ${dec.requiredApprovalLevel}`,
        messageAr: `صلاحية غير كافية. المطلوب: ${dec.requiredApprovalLevel}`
      };
    }

    await db.update(novaSovereignDecisions)
      .set({
        phase: DecisionPhase.APPROVED,
        approvedBy: approverId,
        approvedAt: new Date(),
        approvalNotes: approvalNotes || null,
        updatedAt: new Date(),
      })
      .where(eq(novaSovereignDecisions.id, decisionId));

    await this.logTrace({
      decisionId,
      timestamp: new Date(),
      phase: DecisionPhase.APPROVED,
      actor: { id: approverId, type: approverRole, name: approverRole },
      action: 'Decision Approved by Owner Authority',
      actionAr: 'تمت الموافقة على القرار من سلطة المالك',
      reason: approvalNotes || 'Approved',
      reasonAr: approvalNotes || 'تمت الموافقة',
      inputs: { decisionId },
      outputs: { phase: DecisionPhase.APPROVED },
      policyReferences: [],
      signature: this.generateSignature(decisionId, 'approved'),
    });

    return { 
      success: true, 
      message: 'Decision approved successfully',
      messageAr: 'تمت الموافقة على القرار بنجاح'
    };
  }

  /**
   * OWNER REJECTION
   */
  async rejectDecision(
    decisionId: string,
    rejectorId: string,
    rejectorRole: 'owner' | 'sovereign' | 'admin',
    rejectionReason: string
  ): Promise<{ success: boolean; message: string; messageAr: string }> {
    await db.update(novaSovereignDecisions)
      .set({
        phase: DecisionPhase.REJECTED,
        rejectedBy: rejectorId,
        rejectedAt: new Date(),
        rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(novaSovereignDecisions.id, decisionId));

    await this.logTrace({
      decisionId,
      timestamp: new Date(),
      phase: DecisionPhase.REJECTED,
      actor: { id: rejectorId, type: rejectorRole, name: rejectorRole },
      action: 'Decision Rejected',
      actionAr: 'تم رفض القرار',
      reason: rejectionReason,
      reasonAr: rejectionReason,
      inputs: { decisionId },
      outputs: { phase: DecisionPhase.REJECTED },
      policyReferences: [],
      signature: this.generateSignature(decisionId, 'rejected'),
    });

    return { 
      success: true, 
      message: 'Decision rejected',
      messageAr: 'تم رفض القرار'
    };
  }

  /**
   * KILL SWITCH - Emergency Stop All Operations
   * Owner Only
   */
  async activateKillSwitch(
    ownerId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    this.killSwitchActive = true;
    
    await db.insert(novaKillSwitch).values({
      id: `ks_${Date.now()}`,
      isActive: true,
      activatedBy: ownerId,
      activatedAt: new Date(),
      reason,
    });

    await db.update(novaSovereignDecisions)
      .set({ phase: DecisionPhase.KILLED, updatedAt: new Date() })
      .where(eq(novaSovereignDecisions.phase, DecisionPhase.EXECUTING));

    return { 
      success: true, 
      message: 'KILL SWITCH ACTIVATED - All Nova AI operations suspended'
    };
  }

  /**
   * Deactivate Kill Switch
   * Owner Only
   */
  async deactivateKillSwitch(ownerId: string): Promise<{ success: boolean }> {
    await db.update(novaKillSwitch)
      .set({ isActive: false, deactivatedBy: ownerId, deactivatedAt: new Date() })
      .where(eq(novaKillSwitch.isActive, true));
    
    this.killSwitchActive = false;
    return { success: true };
  }

  /**
   * FULL DECISION INITIATION
   * Combines analysis and decision creation with default steps
   */
  async initiateDecision(request: DecisionRequest): Promise<NovaSovereignDecision> {
    // Step 1: Analyze the decision
    const analysis = await this.analyzeDecision(request);
    
    // Step 2: Generate default steps based on decision type
    const defaultSteps: DecisionStepInput[] = [
      {
        id: `step_${Date.now()}_1`,
        title: 'Preparation',
        titleAr: 'التحضير',
        description: 'Prepare resources and validate prerequisites',
        descriptionAr: 'تحضير الموارد والتحقق من المتطلبات المسبقة',
        order: 1,
        requiresApproval: false,
        approvalLevel: 'automatic',
        estimatedImpact: 'Low impact preparation phase',
        rollbackPlan: 'No changes to rollback'
      },
      {
        id: `step_${Date.now()}_2`,
        title: 'Execution',
        titleAr: 'التنفيذ',
        description: 'Execute the main decision action',
        descriptionAr: 'تنفيذ الإجراء الرئيسي للقرار',
        order: 2,
        requiresApproval: analysis.riskAssessment.level === 'critical' || analysis.riskAssessment.level === 'sovereign',
        approvalLevel: analysis.requiredApprovalLevel,
        estimatedImpact: analysis.riskAssessment.factors.map(f => f.factor).join(', ') || 'Standard execution impact',
        rollbackPlan: 'Revert to previous state'
      },
      {
        id: `step_${Date.now()}_3`,
        title: 'Verification',
        titleAr: 'التحقق',
        description: 'Verify the decision was executed successfully',
        descriptionAr: 'التحقق من تنفيذ القرار بنجاح',
        order: 3,
        requiresApproval: false,
        approvalLevel: 'automatic',
        estimatedImpact: 'Validation only',
        rollbackPlan: 'N/A'
      }
    ];
    
    // Step 3: Create the decision
    return await this.createDecision(request, analysis, defaultSteps);
  }

  /**
   * Get all pending decisions awaiting approval
   */
  async getPendingDecisions(): Promise<NovaSovereignDecision[]> {
    return await db.select()
      .from(novaSovereignDecisions)
      .where(eq(novaSovereignDecisions.phase, DecisionPhase.PENDING_APPROVAL))
      .orderBy(desc(novaSovereignDecisions.createdAt));
  }

  /**
   * Get decision history with full trace
   */
  async getDecisionHistory(decisionId: string): Promise<NovaDecisionAudit[]> {
    return await db.select()
      .from(novaDecisionAudit)
      .where(eq(novaDecisionAudit.decisionId, decisionId))
      .orderBy(asc(novaDecisionAudit.timestamp));
  }

  /**
   * Get decision with all steps
   */
  async getDecisionWithSteps(decisionId: string) {
    const decision = await db.select()
      .from(novaSovereignDecisions)
      .where(eq(novaSovereignDecisions.id, decisionId))
      .limit(1);
    
    if (!decision.length) return null;

    const steps = await db.select()
      .from(novaDecisionSteps)
      .where(eq(novaDecisionSteps.decisionId, decisionId))
      .orderBy(asc(novaDecisionSteps.order));

    const audit = await this.getDecisionHistory(decisionId);

    return {
      ...decision[0],
      steps,
      auditTrail: audit,
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private calculateRiskLevel(request: DecisionRequest): RiskLevelType {
    if (request.type === DecisionType.SECURITY || request.type === DecisionType.EMERGENCY) {
      return RiskLevel.CRITICAL;
    }
    if (request.type === DecisionType.FINANCIAL || request.type === DecisionType.STRATEGIC) {
      return RiskLevel.HIGH;
    }
    if (request.type === DecisionType.GOVERNANCE || request.type === DecisionType.POLICY) {
      return RiskLevel.SOVEREIGN;
    }
    if (request.urgency === 'critical') {
      return RiskLevel.HIGH;
    }
    return RiskLevel.MEDIUM;
  }

  private determineApprovalLevel(
    request: DecisionRequest, 
    riskLevel: RiskLevelType
  ): ApprovalLevelType {
    if (riskLevel === RiskLevel.SOVEREIGN) return ApprovalLevel.OWNER_ONLY;
    if (riskLevel === RiskLevel.CRITICAL) return ApprovalLevel.SOVEREIGN;
    if (riskLevel === RiskLevel.HIGH) return ApprovalLevel.ELEVATED;
    if (request.type === DecisionType.GOVERNANCE) return ApprovalLevel.OWNER_ONLY;
    return ApprovalLevel.STANDARD;
  }

  private canApprove(requiredLevel: ApprovalLevelType, approverRole: string): boolean {
    const hierarchy: Record<string, number> = {
      owner: 100,
      sovereign: 80,
      admin: 60,
      user: 20,
    };
    
    const requiredScore: Record<ApprovalLevelType, number> = {
      automatic: 0,
      standard: 40,
      elevated: 60,
      sovereign: 80,
      owner_only: 100,
    };

    return (hierarchy[approverRole] || 0) >= requiredScore[requiredLevel];
  }

  private async checkPolicyCompliance(request: DecisionRequest) {
    const policies = await db.select().from(novaPolicies).where(eq(novaPolicies.isActive, true));
    
    const violations: Array<{ policyId: string; policyName: string; violation: string; violationAr: string }> = [];
    const warnings: Array<{ policyId: string; message: string; messageAr: string }> = [];

    for (const policy of policies) {
      const constraints = policy.constraints as PolicyConstraint[];
      for (const constraint of constraints || []) {
        if (constraint.type === 'deny' && this.matchesConstraint(request, constraint)) {
          violations.push({
            policyId: policy.id,
            policyName: policy.name,
            violation: constraint.message,
            violationAr: constraint.messageAr,
          });
        }
      }
    }

    return { compliant: violations.length === 0, violations, warnings };
  }

  private matchesConstraint(request: DecisionRequest, constraint: PolicyConstraint): boolean {
    if (constraint.target === 'type' && constraint.value === request.type) return true;
    return false;
  }

  private identifyRiskFactors(request: DecisionRequest, riskLevel: RiskLevelType) {
    const factors = [];
    
    if (request.type === DecisionType.SECURITY) {
      factors.push({
        factor: 'Security operations require elevated caution',
        factorAr: 'عمليات الأمان تتطلب حذرًا مرتفعًا',
        impact: 'high' as const,
        probability: 0.3,
        mitigation: 'Multi-factor approval and audit logging',
        mitigationAr: 'موافقة متعددة العوامل وتسجيل التدقيق',
      });
    }
    
    if (request.urgency === 'critical') {
      factors.push({
        factor: 'Critical urgency increases error probability',
        factorAr: 'الإلحاح الحرج يزيد من احتمالية الخطأ',
        impact: 'medium' as const,
        probability: 0.4,
        mitigation: 'Staged rollout with checkpoints',
        mitigationAr: 'نشر مرحلي مع نقاط تفتيش',
      });
    }

    return factors;
  }

  private estimateComputeResources(request: DecisionRequest): number {
    return request.type === DecisionType.STRATEGIC ? 80 : 40;
  }

  private estimateStorageResources(request: DecisionRequest): number {
    return 20;
  }

  private estimateCost(request: DecisionRequest): number {
    return request.type === DecisionType.FINANCIAL ? 100 : 25;
  }

  private estimateDuration(request: DecisionRequest): string {
    return request.urgency === 'critical' ? '< 1 hour' : '2-4 hours';
  }

  private generateRecommendations(
    request: DecisionRequest, 
    riskLevel: RiskLevelType,
    compliance: { compliant: boolean; violations: any[] }
  ) {
    if (!compliance.compliant) {
      return [{
        type: 'reject' as const,
        reason: 'Policy violations detected',
        reasonAr: 'تم اكتشاف انتهاكات للسياسة',
        confidence: 95,
      }];
    }
    
    if (riskLevel === RiskLevel.CRITICAL || riskLevel === RiskLevel.SOVEREIGN) {
      return [{
        type: 'proceed' as const,
        reason: 'Proceed with owner approval and enhanced monitoring',
        reasonAr: 'المضي قدمًا مع موافقة المالك والمراقبة المعززة',
        confidence: 75,
      }];
    }

    return [{
      type: 'proceed' as const,
      reason: 'Analysis indicates low risk - proceed with standard approval',
      reasonAr: 'التحليل يشير إلى مخاطر منخفضة - المضي مع الموافقة القياسية',
      confidence: 85,
    }];
  }

  private async logTrace(trace: DecisionTrace): Promise<void> {
    await db.insert(novaDecisionAudit).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      decisionId: trace.decisionId,
      timestamp: trace.timestamp,
      phase: trace.phase,
      actorId: trace.actor.id,
      actorType: trace.actor.type,
      actorName: trace.actor.name,
      action: trace.action,
      actionAr: trace.actionAr,
      reason: trace.reason,
      reasonAr: trace.reasonAr,
      inputs: trace.inputs,
      outputs: trace.outputs,
      policyReferences: trace.policyReferences,
      signature: trace.signature,
    });
  }

  private generateSignature(decisionId: string, phase: string): string {
    return crypto.createHash('sha256')
      .update(`${decisionId}:${phase}:${Date.now()}:sovereign`)
      .digest('hex')
      .substring(0, 32);
  }
}

export const novaDecisionEngine = new NovaDecisionEngine();
