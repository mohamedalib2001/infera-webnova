import { db } from "./db";
import { 
  sovereignPolicyTemplates, 
  sovereignPolicyCompliance,
  sovereignPolicyViolations 
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface PolicyRule {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  status: string;
}

export type DecisionStatus = "approved" | "conditional" | "rejected" | "blocked" | "pending";

export interface PolicyValidationResult {
  isCompliant: boolean;
  overallScore: number;
  passedChecks: number;
  totalChecks: number;
  violations: PolicyViolation[];
  warnings: PolicyWarning[];
  timestamp: Date;
  canDeploy: boolean;
  blockingViolations: PolicyViolation[];
  decisionStatus: DecisionStatus;
  riskIndex: number;
  evolutionReadiness: number;
  categoryBreakdown: {
    architecture: { score: number; status: string; checkedItems: number; totalItems: number };
    aiIntelligence: { score: number; status: string; checkedItems: number; totalItems: number };
    cyberSecurity: { score: number; status: string; checkedItems: number; totalItems: number };
    dynamics: { score: number; status: string; checkedItems: number; totalItems: number };
    policyCoverage: { score: number; status: string; checkedItems: number; totalItems: number };
  };
  recommendations: string[];
  recommendationsAr: string[];
}

export interface PolicyViolation {
  policyId: string;
  policyName: string;
  policyNameAr: string;
  ruleId: string;
  ruleName: string;
  ruleNameAr: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  descriptionAr: string;
  isBlocking: boolean;
}

export interface PolicyWarning {
  policyId: string;
  policyName: string;
  ruleId: string;
  message: string;
  messageAr: string;
}

export interface PlatformContext {
  platformId: string;
  platformName: string;
  industry: string;
  hasAICore?: boolean;
  hasAIAssistant?: boolean;
  hasPredictiveModule?: boolean;
  hasBehavioralAnalytics?: boolean;
  hasZeroTrust?: boolean;
  hasE2EEncryption?: boolean;
  hasThreatDetection?: boolean;
  hasAutoResponse?: boolean;
  hasRedundancy?: boolean;
  isModular?: boolean;
  hasLiveScaling?: boolean;
  hasZeroDowntime?: boolean;
  isForwardCompatible?: boolean;
  hasVendorLockIn?: boolean;
  hasCRUDOnly?: boolean;
  hasStaticDashboard?: boolean;
  hasHardLimits?: boolean;
  hasManualOps?: boolean;
  features?: string[];
  techStack?: string[];
}

export class PolicyValidationEngine {
  private static instance: PolicyValidationEngine;

  static getInstance(): PolicyValidationEngine {
    if (!PolicyValidationEngine.instance) {
      PolicyValidationEngine.instance = new PolicyValidationEngine();
    }
    return PolicyValidationEngine.instance;
  }

  async validatePlatform(context: PlatformContext): Promise<PolicyValidationResult> {
    const violations: PolicyViolation[] = [];
    const warnings: PolicyWarning[] = [];
    let passedChecks = 0;
    let totalChecks = 0;

    const policies = await db.select().from(sovereignPolicyTemplates).where(eq(sovereignPolicyTemplates.isActive, true));

    for (const policy of policies) {
      const rawPolicies = policy.additionalPolicies as unknown as Array<{
        id: string;
        name?: string;
        nameAr?: string;
        description?: string;
        status?: string;
        titleEn?: string;
        titleAr?: string;
      }> || [];
      
      const policyRules: PolicyRule[] = rawPolicies.map(p => ({
        id: p.id,
        name: p.name || p.titleEn || p.id,
        nameAr: p.nameAr || p.titleAr || p.id,
        description: p.description || "",
        status: p.status || "enforcing",
      }));
      
      for (const rule of policyRules) {
        totalChecks++;
        const validationResult = this.validateRule(policy.sector!, rule, context);
        
        if (validationResult.passed) {
          passedChecks++;
        } else {
          violations.push({
            policyId: policy.id,
            policyName: policy.name,
            policyNameAr: policy.nameAr || policy.name,
            ruleId: rule.id,
            ruleName: rule.name,
            ruleNameAr: rule.nameAr || rule.name,
            severity: validationResult.severity,
            description: validationResult.message,
            descriptionAr: validationResult.messageAr,
            isBlocking: validationResult.severity === "critical" || validationResult.severity === "high",
          });
        }

        if (validationResult.warning) {
          warnings.push({
            policyId: policy.id,
            policyName: policy.name,
            ruleId: rule.id,
            message: validationResult.warning,
            messageAr: validationResult.warningAr || validationResult.warning,
          });
        }
      }
    }

    const blockingViolations = violations.filter(v => v.isBlocking);
    const overallScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
    const isCompliant = blockingViolations.length === 0;
    
    const decisionStatus = this.calculateDecisionStatus(overallScore, blockingViolations.length);
    const deploymentStatus = this.getDeploymentStatus(overallScore, decisionStatus);
    
    const riskIndex = this.calculateRiskIndex(violations, context);
    const evolutionReadiness = this.calculateEvolutionReadiness(context);
    const categoryBreakdown = this.calculateCategoryBreakdown(violations, context);
    const { recommendations, recommendationsAr } = this.generateRecommendations(violations, decisionStatus);

    return {
      isCompliant,
      overallScore,
      passedChecks,
      totalChecks,
      violations,
      warnings,
      timestamp: new Date(),
      canDeploy: deploymentStatus.canDeploy,
      blockingViolations,
      decisionStatus,
      riskIndex,
      evolutionReadiness,
      categoryBreakdown,
      recommendations,
      recommendationsAr,
    };
  }

  private calculateDecisionStatus(score: number, blockingCount: number): DecisionStatus {
    if (blockingCount > 0) {
      return score < 70 ? "blocked" : "rejected";
    }
    if (score >= 95) return "approved";
    if (score >= 85) return "conditional";
    if (score >= 70) return "rejected";
    return "blocked";
  }

  private calculateRiskIndex(violations: PolicyViolation[], context: PlatformContext): number {
    let riskScore = 0;
    
    for (const v of violations) {
      switch (v.severity) {
        case "critical": riskScore += 25; break;
        case "high": riskScore += 15; break;
        case "medium": riskScore += 8; break;
        case "low": riskScore += 3; break;
      }
    }
    
    if (!context.hasZeroTrust) riskScore += 10;
    if (!context.hasE2EEncryption) riskScore += 10;
    if (!context.hasThreatDetection) riskScore += 5;
    if (context.hasVendorLockIn) riskScore += 5;
    
    return Math.min(100, riskScore);
  }

  private calculateEvolutionReadiness(context: PlatformContext): number {
    let score = 0;
    const weights = {
      isModular: 20,
      hasLiveScaling: 20,
      hasZeroDowntime: 15,
      isForwardCompatible: 15,
      hasAICore: 10,
      hasPredictiveModule: 10,
      hasRedundancy: 10,
    };
    
    if (context.isModular) score += weights.isModular;
    if (context.hasLiveScaling) score += weights.hasLiveScaling;
    if (context.hasZeroDowntime) score += weights.hasZeroDowntime;
    if (context.isForwardCompatible) score += weights.isForwardCompatible;
    if (context.hasAICore) score += weights.hasAICore;
    if (context.hasPredictiveModule) score += weights.hasPredictiveModule;
    if (context.hasRedundancy) score += weights.hasRedundancy;
    
    return score;
  }

  private calculateCategoryBreakdown(violations: PolicyViolation[], context: PlatformContext): {
    architecture: { score: number; status: string; checkedItems: number; totalItems: number };
    aiIntelligence: { score: number; status: string; checkedItems: number; totalItems: number };
    cyberSecurity: { score: number; status: string; checkedItems: number; totalItems: number };
    dynamics: { score: number; status: string; checkedItems: number; totalItems: number };
    policyCoverage: { score: number; status: string; checkedItems: number; totalItems: number };
  } {
    const categories = {
      architecture: { score: 100, status: "compliant", checkedItems: 0, totalItems: 3 },
      aiIntelligence: { score: 100, status: "compliant", checkedItems: 0, totalItems: 4 },
      cyberSecurity: { score: 100, status: "compliant", checkedItems: 0, totalItems: 5 },
      dynamics: { score: 100, status: "compliant", checkedItems: 0, totalItems: 3 },
      policyCoverage: { score: 100, status: "compliant", checkedItems: 0, totalItems: 3 },
    };

    if (context.isModular) categories.architecture.checkedItems++;
    if (!context.hasVendorLockIn) categories.architecture.checkedItems++;
    if (context.hasRedundancy) categories.architecture.checkedItems++;
    
    if (context.hasAICore) categories.aiIntelligence.checkedItems++;
    if (context.hasAIAssistant) categories.aiIntelligence.checkedItems++;
    if (context.hasPredictiveModule) categories.aiIntelligence.checkedItems++;
    if (context.hasBehavioralAnalytics) categories.aiIntelligence.checkedItems++;
    
    if (context.hasZeroTrust) categories.cyberSecurity.checkedItems++;
    if (context.hasE2EEncryption) categories.cyberSecurity.checkedItems++;
    if (context.hasThreatDetection) categories.cyberSecurity.checkedItems++;
    if (context.hasAutoResponse) categories.cyberSecurity.checkedItems++;
    if (!context.hasManualOps) categories.cyberSecurity.checkedItems++;
    
    if (context.hasLiveScaling) categories.dynamics.checkedItems++;
    if (context.hasZeroDowntime) categories.dynamics.checkedItems++;
    if (context.isForwardCompatible) categories.dynamics.checkedItems++;
    
    if (!context.hasCRUDOnly) categories.policyCoverage.checkedItems++;
    if (!context.hasStaticDashboard) categories.policyCoverage.checkedItems++;
    if (!context.hasHardLimits) categories.policyCoverage.checkedItems++;

    for (const key of Object.keys(categories) as Array<keyof typeof categories>) {
      categories[key].score = Math.round((categories[key].checkedItems / categories[key].totalItems) * 100);
      categories[key].status = categories[key].checkedItems === categories[key].totalItems ? "compliant" : 
        categories[key].checkedItems >= categories[key].totalItems / 2 ? "partial" : "non_compliant";
    }

    return categories;
  }

  private generateRecommendations(violations: PolicyViolation[], status: DecisionStatus): { recommendations: string[]; recommendationsAr: string[] } {
    const recommendations: string[] = [];
    const recommendationsAr: string[] = [];

    if (status === "blocked") {
      recommendations.push("Platform has critical policy violations that must be resolved before deployment");
      recommendationsAr.push("المنصة لديها مخالفات سياسات حرجة يجب حلها قبل النشر");
    }

    for (const v of violations.slice(0, 5)) {
      if (v.severity === "critical" || v.severity === "high") {
        recommendations.push(`Fix: ${v.ruleName} - ${v.description}`);
        recommendationsAr.push(`إصلاح: ${v.ruleNameAr} - ${v.descriptionAr}`);
      }
    }

    if (status === "conditional") {
      recommendations.push("Review all medium-severity warnings before production release");
      recommendationsAr.push("مراجعة جميع التحذيرات متوسطة الخطورة قبل الإطلاق للإنتاج");
    }

    if (status === "approved") {
      recommendations.push("Platform meets all sovereign policy requirements");
      recommendationsAr.push("المنصة تستوفي جميع متطلبات السياسات السيادية");
    }

    return { recommendations, recommendationsAr };
  }

  private validateRule(
    sector: string, 
    rule: PolicyRule, 
    context: PlatformContext
  ): { 
    passed: boolean; 
    severity: "critical" | "high" | "medium" | "low"; 
    message: string; 
    messageAr: string;
    warning?: string;
    warningAr?: string;
  } {
    switch (rule.id) {
      case "ai-core":
        return this.validateAICore(context);
      case "intelligent-ops":
        return this.validateIntelligentOps(context);
      case "no-dumb":
        return this.validateNoDumbSystems(context);
      case "ai-evolution":
        return this.validateAIEvolution(context);
      case "zero-trust":
        return this.validateZeroTrust(context);
      case "e2e-encryption":
        return this.validateE2EEncryption(context);
      case "ai-threat":
        return this.validateAIThreatDetection(context);
      case "auto-response":
        return this.validateAutoResponse(context);
      case "no-spof":
        return this.validateNoSPOF(context);
      case "modular-arch":
        return this.validateModularArch(context);
      case "no-limits":
        return this.validateNoLimits(context);
      case "zero-downtime":
        return this.validateZeroDowntime(context);
      case "forward-compat":
        return this.validateForwardCompat(context);
      case "no-vendor-lock":
        return this.validateNoVendorLock(context);
      default:
        return { passed: true, severity: "low", message: "", messageAr: "" };
    }
  }

  private validateAICore(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    const hasAll = context.hasAICore && context.hasAIAssistant && context.hasPredictiveModule && context.hasBehavioralAnalytics;
    if (hasAll) {
      return { passed: true, severity: "critical", message: "", messageAr: "" };
    }
    
    const missing: string[] = [];
    const missingAr: string[] = [];
    if (!context.hasAICore) { missing.push("AI Core Engine"); missingAr.push("محرك الذكاء الاصطناعي"); }
    if (!context.hasAIAssistant) { missing.push("AI Assistant"); missingAr.push("المساعد الذكي"); }
    if (!context.hasPredictiveModule) { missing.push("Predictive Module"); missingAr.push("وحدة التنبؤ"); }
    if (!context.hasBehavioralAnalytics) { missing.push("Behavioral Analytics"); missingAr.push("تحليلات السلوك"); }
    
    return {
      passed: false,
      severity: "critical",
      message: `Missing AI components: ${missing.join(", ")}`,
      messageAr: `مكونات AI مفقودة: ${missingAr.join("، ")}`,
    };
  }

  private validateIntelligentOps(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    if (context.hasManualOps) {
      return {
        passed: false,
        severity: "high",
        message: "Platform has pure manual operations without AI assistance",
        messageAr: "المنصة تحتوي على عمليات يدوية بحتة بدون مساعدة الذكاء الاصطناعي",
      };
    }
    return { passed: true, severity: "high", message: "", messageAr: "" };
  }

  private validateNoDumbSystems(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    const violations: string[] = [];
    const violationsAr: string[] = [];
    
    if (context.hasCRUDOnly) { violations.push("CRUD-only system"); violationsAr.push("نظام CRUD فقط"); }
    if (context.hasStaticDashboard) { violations.push("Static dashboard"); violationsAr.push("لوحة معلومات ثابتة"); }
    
    if (violations.length > 0) {
      return {
        passed: false,
        severity: "high",
        message: `Dumb system detected: ${violations.join(", ")}`,
        messageAr: `تم اكتشاف نظام غير ذكي: ${violationsAr.join("، ")}`,
      };
    }
    return { passed: true, severity: "high", message: "", messageAr: "" };
  }

  private validateAIEvolution(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    return { passed: true, severity: "medium", message: "", messageAr: "" };
  }

  private validateZeroTrust(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    if (!context.hasZeroTrust) {
      return {
        passed: false,
        severity: "critical",
        message: "Zero-Trust Architecture not implemented",
        messageAr: "بنية انعدام الثقة غير مطبقة",
      };
    }
    return { passed: true, severity: "critical", message: "", messageAr: "" };
  }

  private validateE2EEncryption(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    if (!context.hasE2EEncryption) {
      return {
        passed: false,
        severity: "critical",
        message: "End-to-End Encryption not enabled",
        messageAr: "التشفير من طرف لطرف غير مفعل",
      };
    }
    return { passed: true, severity: "critical", message: "", messageAr: "" };
  }

  private validateAIThreatDetection(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    if (!context.hasThreatDetection) {
      return {
        passed: false,
        severity: "high",
        message: "AI Threat Detection not configured",
        messageAr: "كشف التهديدات بالذكاء الاصطناعي غير مهيأ",
      };
    }
    return { passed: true, severity: "high", message: "", messageAr: "" };
  }

  private validateAutoResponse(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    if (!context.hasAutoResponse) {
      return {
        passed: false,
        severity: "high",
        message: "Automated Incident Response not enabled",
        messageAr: "الاستجابة التلقائية للحوادث غير مفعلة",
      };
    }
    return { passed: true, severity: "high", message: "", messageAr: "" };
  }

  private validateNoSPOF(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    if (!context.hasRedundancy) {
      return {
        passed: false,
        severity: "high",
        message: "No redundancy/failover configured - Single Point of Failure risk",
        messageAr: "لا يوجد تكرار/تجاوز - خطر نقطة فشل واحدة",
      };
    }
    return { passed: true, severity: "high", message: "", messageAr: "" };
  }

  private validateModularArch(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    if (!context.isModular) {
      return {
        passed: false,
        severity: "high",
        message: "Platform does not have modular architecture",
        messageAr: "المنصة لا تملك بنية معيارية",
      };
    }
    return { passed: true, severity: "high", message: "", messageAr: "" };
  }

  private validateNoLimits(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    if (context.hasHardLimits) {
      return {
        passed: false,
        severity: "high",
        message: "Platform has hard limits that restrict growth",
        messageAr: "المنصة لديها حدود صارمة تقيد النمو",
      };
    }
    return { passed: true, severity: "high", message: "", messageAr: "" };
  }

  private validateZeroDowntime(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    if (!context.hasZeroDowntime) {
      return {
        passed: false,
        severity: "medium",
        message: "Zero downtime expansion not supported",
        messageAr: "التوسع دون توقف غير مدعوم",
      };
    }
    return { passed: true, severity: "medium", message: "", messageAr: "" };
  }

  private validateForwardCompat(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    if (!context.isForwardCompatible) {
      return {
        passed: false,
        severity: "medium",
        message: "Platform may not be forward compatible",
        messageAr: "المنصة قد لا تكون متوافقة مستقبلياً",
      };
    }
    return { passed: true, severity: "medium", message: "", messageAr: "" };
  }

  private validateNoVendorLock(context: PlatformContext): { passed: boolean; severity: "critical" | "high" | "medium" | "low"; message: string; messageAr: string } {
    if (context.hasVendorLockIn) {
      return {
        passed: false,
        severity: "high",
        message: "Platform has vendor lock-in that restricts evolution",
        messageAr: "المنصة مرتبطة بمورد يقيد التطور",
      };
    }
    return { passed: true, severity: "high", message: "", messageAr: "" };
  }

  async recordValidation(
    platformId: string,
    platformName: string,
    result: PolicyValidationResult,
    userId: string,
    workspaceId?: string
  ): Promise<void> {
    try {
      const overallStatus = result.isCompliant ? "compliant" : 
        result.overallScore >= 70 ? "partial" : "non_compliant";
      
      const categoryScores = {
        architecture: result.categoryBreakdown.architecture,
        aiIntelligence: result.categoryBreakdown.aiIntelligence,
        cyberSecurity: result.categoryBreakdown.cyberSecurity,
        dynamics: result.categoryBreakdown.dynamics,
        policyCoverage: result.categoryBreakdown.policyCoverage,
      };
      
      const [complianceRecord] = await db.insert(sovereignPolicyCompliance).values({
        projectId: platformId,
        workspaceId: workspaceId || null,
        policyVersion: "2.0",
        overallStatus,
        complianceScore: result.overallScore,
        decisionStatus: result.decisionStatus,
        riskIndex: result.riskIndex,
        evolutionReadiness: result.evolutionReadiness,
        categoryScores,
        lastCheckAt: new Date(),
        lastCheckBy: userId,
        lastCheckType: "ai",
        aiAnalysis: {
          summary: result.recommendations[0] || "No summary",
          summaryAr: result.recommendationsAr[0] || "لا ملخص",
          recommendations: result.recommendations,
          riskLevel: result.riskIndex > 50 ? "high" : result.riskIndex > 25 ? "medium" : "low",
          estimatedFixTime: result.violations.length > 3 ? "2-4 hours" : result.violations.length > 0 ? "30-60 minutes" : "None",
        },
      }).returning();

      for (const violation of result.violations) {
        await db.insert(sovereignPolicyViolations).values({
          projectId: platformId,
          workspaceId: workspaceId || null,
          complianceId: complianceRecord?.id || null,
          policyCategory: violation.policyName,
          policyItem: violation.ruleId,
          severity: violation.severity,
          title: violation.ruleName,
          titleAr: violation.ruleNameAr,
          description: violation.description,
          descriptionAr: violation.descriptionAr,
          status: "open",
          detectedAt: new Date(),
        });
      }
      
      console.log(`[PolicyValidationEngine] Recorded validation for ${platformName}: ${overallStatus} (${result.overallScore}%)`);
    } catch (error) {
      console.error("[PolicyValidationEngine] Error recording validation:", error);
    }
  }

  async getQuickValidation(platformId: string): Promise<{ canDeploy: boolean; score: number; criticalIssues: number }> {
    const compliance = await db.select()
      .from(sovereignPolicyCompliance)
      .where(eq(sovereignPolicyCompliance.projectId, platformId));
    
    if (compliance.length === 0) {
      return { canDeploy: false, score: 0, criticalIssues: 1 };
    }
    
    const totalScore = compliance.reduce((sum, c) => sum + (c.complianceScore || 0), 0);
    const avgScore = Math.round(totalScore / compliance.length);
    const nonCompliant = compliance.filter(c => c.overallStatus !== "compliant");
    
    return {
      canDeploy: nonCompliant.length === 0,
      score: avgScore,
      criticalIssues: nonCompliant.length,
    };
  }

  calculateWeightedScores(categoryScores: Record<string, { score: number; status: string; checkedItems: number; totalItems: number }>) {
    const weights = {
      aiIntelligence: 30,
      cyberSecurity: 30,
      scalability: 20,
      governance: 20,
    };

    const aiScore = categoryScores.aiIntelligence?.score || 0;
    const securityScore = categoryScores.cyberSecurity?.score || 0;
    const archScore = categoryScores.architecture?.score || 0;
    const dynamicsScore = categoryScores.dynamics?.score || 0;
    const policyScore = categoryScores.policyCoverage?.score || 0;

    const scalabilityScore = Math.round((archScore + dynamicsScore) / 2);
    const governanceScore = policyScore;

    return {
      aiIntelligence: { score: aiScore, weight: weights.aiIntelligence, weighted: (aiScore * weights.aiIntelligence) / 100 },
      cyberSecurity: { score: securityScore, weight: weights.cyberSecurity, weighted: (securityScore * weights.cyberSecurity) / 100 },
      scalability: { score: scalabilityScore, weight: weights.scalability, weighted: (scalabilityScore * weights.scalability) / 100 },
      governance: { score: governanceScore, weight: weights.governance, weighted: (governanceScore * weights.governance) / 100 },
    };
  }

  async simulateViolation(platformId: string, scenario: string): Promise<{
    scenarioName: string;
    scenarioNameAr: string;
    predictedScore: number;
    currentScore: number;
    scoreDrop: number;
    riskEscalation: string;
    riskEscalationAr: string;
    riskEscalationCurve: { hour: number; risk: number }[];
    timeToFailure: string;
    timeToFailureAr: string;
    recommendations: string[];
    recommendationsAr: string[];
    impactLevel: string;
    impactLevelAr: string;
    wouldLockPlatform: boolean;
    wouldBlockDeploy: boolean;
  }> {
    const complianceRecords = await db.select()
      .from(sovereignPolicyCompliance)
      .where(eq(sovereignPolicyCompliance.projectId, platformId))
      .orderBy(sovereignPolicyCompliance.createdAt)
      .limit(1);
    
    const latestCompliance = complianceRecords.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )[0];

    const currentScore = latestCompliance?.complianceScore || 75;
    
    const scenarios: Record<string, { 
      name: string;
      nameAr: string;
      scoreDrop: number;
      riskLevel: string;
      riskLevelAr: string;
      timeToFailure: string;
      timeToFailureAr: string;
      recommendations: string[];
      recommendationsAr: string[];
      impact: string;
      impactAr: string;
      riskCurveHours: number[];
    }> = {
      ai_removal: {
        name: "AI Core Removal",
        nameAr: "إزالة نواة الذكاء الاصطناعي",
        scoreDrop: 45,
        riskLevel: "Critical Escalation",
        riskLevelAr: "تصاعد حرج",
        timeToFailure: "Immediate",
        timeToFailureAr: "فوري",
        recommendations: [
          "Restore AI Core Engine immediately",
          "Implement AI Assistant for user interactions",
          "Add Predictive Intelligence module",
          "Enable Behavioral Analysis system",
        ],
        recommendationsAr: [
          "استعادة محرك الذكاء الاصطناعي فوراً",
          "تنفيذ مساعد الذكاء الاصطناعي للتفاعلات",
          "إضافة وحدة الذكاء التنبؤي",
          "تفعيل نظام التحليل السلوكي",
        ],
        impact: "Critical",
        impactAr: "حرج",
        riskCurveHours: [0, 1, 2, 4, 8, 12, 24],
      },
      security_breach: {
        name: "Security Breach",
        nameAr: "اختراق أمني",
        scoreDrop: 40,
        riskLevel: "Severe Escalation",
        riskLevelAr: "تصاعد شديد",
        timeToFailure: "< 24 hours",
        timeToFailureAr: "أقل من 24 ساعة",
        recommendations: [
          "Activate Zero-Trust Architecture",
          "Enable End-to-End Encryption",
          "Deploy AI Threat Detection",
          "Implement Automated Incident Response",
        ],
        recommendationsAr: [
          "تفعيل بنية عدم الثقة",
          "تمكين التشفير من طرف إلى طرف",
          "نشر كشف التهديدات بالذكاء الاصطناعي",
          "تنفيذ الاستجابة الآلية للحوادث",
        ],
        impact: "Critical",
        impactAr: "حرج",
        riskCurveHours: [0, 2, 6, 12, 18, 24],
      },
      vendor_lock: {
        name: "Vendor Lock-in",
        nameAr: "قفل المورد",
        scoreDrop: 25,
        riskLevel: "High Escalation",
        riskLevelAr: "تصاعد عالي",
        timeToFailure: "1-2 weeks",
        timeToFailureAr: "1-2 أسبوع",
        recommendations: [
          "Migrate to cloud-agnostic architecture",
          "Implement abstraction layers",
          "Use open standards and protocols",
          "Create vendor exit strategy",
        ],
        recommendationsAr: [
          "الانتقال إلى بنية محايدة للسحابة",
          "تنفيذ طبقات التجريد",
          "استخدام المعايير والبروتوكولات المفتوحة",
          "إنشاء استراتيجية خروج من المورد",
        ],
        impact: "High",
        impactAr: "عالي",
        riskCurveHours: [0, 24, 48, 72, 120, 168, 336],
      },
      static_injection: {
        name: "Static Component Injection",
        nameAr: "حقن مكون ثابت",
        scoreDrop: 30,
        riskLevel: "High Escalation",
        riskLevelAr: "تصاعد عالي",
        timeToFailure: "48-72 hours",
        timeToFailureAr: "48-72 ساعة",
        recommendations: [
          "Remove static components immediately",
          "Implement dynamic configuration system",
          "Use event-driven architecture",
          "Apply Zero-Code principles",
        ],
        recommendationsAr: [
          "إزالة المكونات الثابتة فوراً",
          "تنفيذ نظام التكوين الديناميكي",
          "استخدام البنية الحدثية",
          "تطبيق مبادئ Zero-Code",
        ],
        impact: "High",
        impactAr: "عالي",
        riskCurveHours: [0, 6, 12, 24, 36, 48, 72],
      },
      scale_explosion: {
        name: "100x Scale Explosion",
        nameAr: "انفجار التوسع 100x",
        scoreDrop: 15,
        riskLevel: "Moderate Escalation",
        riskLevelAr: "تصاعد متوسط",
        timeToFailure: "3-5 days",
        timeToFailureAr: "3-5 أيام",
        recommendations: [
          "Enable horizontal auto-scaling",
          "Implement load balancing",
          "Optimize database queries",
          "Add caching layers",
        ],
        recommendationsAr: [
          "تمكين التوسع الأفقي التلقائي",
          "تنفيذ موازنة الحمل",
          "تحسين استعلامات قاعدة البيانات",
          "إضافة طبقات التخزين المؤقت",
        ],
        impact: "Medium",
        impactAr: "متوسط",
        riskCurveHours: [0, 12, 24, 48, 72, 96, 120],
      },
      cyber_attack: {
        name: "Cyber Attack Simulation",
        nameAr: "محاكاة هجوم سيبراني",
        scoreDrop: 50,
        riskLevel: "Critical Escalation",
        riskLevelAr: "تصاعد حرج",
        timeToFailure: "Immediate",
        timeToFailureAr: "فوري",
        recommendations: [
          "Activate security lockdown protocol",
          "Enable AI-driven threat response",
          "Isolate compromised components",
          "Initiate forensic analysis",
        ],
        recommendationsAr: [
          "تفعيل بروتوكول الإغلاق الأمني",
          "تمكين الاستجابة للتهديدات بالذكاء الاصطناعي",
          "عزل المكونات المخترقة",
          "بدء التحليل الجنائي",
        ],
        impact: "Critical",
        impactAr: "حرج",
        riskCurveHours: [0, 0.5, 1, 2, 4, 8, 12],
      },
    };

    const scenarioData = scenarios[scenario] || scenarios.security_breach;
    const predictedScore = Math.max(0, currentScore - scenarioData.scoreDrop);
    
    const riskEscalationCurve = scenarioData.riskCurveHours.map((hour, index) => ({
      hour,
      risk: Math.min(100, 10 + (index * (100 - 10)) / (scenarioData.riskCurveHours.length - 1)),
    }));

    const wouldLockPlatform = predictedScore < 70;
    const wouldBlockDeploy = predictedScore < 85;

    console.log(`[PolicyValidationEngine] Simulated ${scenario}: ${currentScore} -> ${predictedScore} (Lock: ${wouldLockPlatform}, Block: ${wouldBlockDeploy})`);

    return {
      scenarioName: scenarioData.name,
      scenarioNameAr: scenarioData.nameAr,
      predictedScore,
      currentScore,
      scoreDrop: scenarioData.scoreDrop,
      riskEscalation: scenarioData.riskLevel,
      riskEscalationAr: scenarioData.riskLevelAr,
      riskEscalationCurve,
      timeToFailure: scenarioData.timeToFailure,
      timeToFailureAr: scenarioData.timeToFailureAr,
      recommendations: scenarioData.recommendations,
      recommendationsAr: scenarioData.recommendationsAr,
      impactLevel: scenarioData.impact,
      impactLevelAr: scenarioData.impactAr,
      wouldLockPlatform,
      wouldBlockDeploy,
    };
  }

  async generateStrategicForecast(platformId: string): Promise<{
    day30: { riskLevel: string; riskLevelAr: string; score: number; threats: string[]; threatsAr: string[] };
    day90: { riskLevel: string; riskLevelAr: string; score: number; threats: string[]; threatsAr: string[] };
    day180: { riskLevel: string; riskLevelAr: string; score: number; threats: string[]; threatsAr: string[] };
    sustainabilityScore: number;
    sustainabilityStatus: string;
    sustainabilityStatusAr: string;
    evolutionForecast: string;
    evolutionForecastAr: string;
    weaknessAlerts: string[];
    weaknessAlertsAr: string[];
  }> {
    const complianceHistory = await db.select()
      .from(sovereignPolicyCompliance)
      .where(eq(sovereignPolicyCompliance.projectId, platformId))
      .orderBy(sovereignPolicyCompliance.createdAt)
      .limit(10);

    const violations = await db.select()
      .from(sovereignPolicyViolations)
      .where(eq(sovereignPolicyViolations.projectId, platformId));

    const sortedHistory = complianceHistory.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    const currentScore = sortedHistory[0]?.complianceScore || 75;
    const violationCount = violations.length;
    const criticalViolations = violations.filter(v => v.severity === "critical").length;

    const trendFactor = sortedHistory.length > 1 
      ? (sortedHistory[0]?.complianceScore || 0) - (sortedHistory[sortedHistory.length - 1]?.complianceScore || 0)
      : 0;

    const day30Score = Math.min(100, Math.max(0, currentScore + (trendFactor * 0.5) - (criticalViolations * 5)));
    const day90Score = Math.min(100, Math.max(0, currentScore + (trendFactor * 1.5) - (violationCount * 2)));
    const day180Score = Math.min(100, Math.max(0, currentScore + (trendFactor * 2) - (violationCount * 3)));

    const getRiskLevel = (score: number): { en: string; ar: string } => {
      if (score >= 85) return { en: "Low", ar: "منخفض" };
      if (score >= 70) return { en: "Medium", ar: "متوسط" };
      return { en: "High", ar: "عالي" };
    };

    const threats30: string[] = [];
    const threats30Ar: string[] = [];
    const threats90: string[] = [];
    const threats90Ar: string[] = [];
    const threats180: string[] = [];
    const threats180Ar: string[] = [];
    const weaknesses: string[] = [];
    const weaknessesAr: string[] = [];

    if (criticalViolations > 0) {
      threats30.push("Unresolved critical violations may escalate");
      threats30Ar.push("قد تتصاعد الانتهاكات الحرجة غير المحلولة");
      weaknesses.push(`${criticalViolations} critical violation(s) require immediate attention`);
      weaknessesAr.push(`${criticalViolations} انتهاك(ات) حرجة تتطلب اهتماماً فورياً`);
    }
    if (violationCount > 3) {
      threats90.push("Accumulated violations increasing system risk");
      threats90Ar.push("الانتهاكات المتراكمة تزيد من مخاطر النظام");
      weaknesses.push("High violation frequency indicates systemic issues");
      weaknessesAr.push("تردد الانتهاكات العالي يشير إلى مشاكل منهجية");
    }
    if (currentScore < 85) {
      threats30.push("Current score below conditional threshold");
      threats30Ar.push("الدرجة الحالية أقل من حد الموافقة المشروطة");
    }
    if (trendFactor < 0) {
      threats90.push("Declining compliance trend detected");
      threats90Ar.push("تم اكتشاف اتجاه امتثال متراجع");
      weaknesses.push("Compliance trend is negative - requires intervention");
      weaknessesAr.push("اتجاه الامتثال سلبي - يتطلب تدخلاً");
    }
    if (day180Score < 70) {
      threats180.push("Long-term platform sustainability at risk");
      threats180Ar.push("استدامة المنصة طويلة المدى في خطر");
    }

    const sustainabilityScore = Math.round(
      (currentScore * 0.4) + 
      ((100 - violationCount * 10) * 0.3) + 
      ((100 - criticalViolations * 20) * 0.3)
    );

    let sustainabilityStatus = "Excellent";
    let sustainabilityStatusAr = "ممتاز";
    let evolutionForecast = "Platform is well-positioned for future evolution";
    let evolutionForecastAr = "المنصة في وضع جيد للتطور المستقبلي";
    
    if (sustainabilityScore < 70) {
      sustainabilityStatus = "Critical";
      sustainabilityStatusAr = "حرج";
      evolutionForecast = "Platform requires significant improvements before evolution";
      evolutionForecastAr = "المنصة تتطلب تحسينات كبيرة قبل التطور";
    } else if (sustainabilityScore < 85) {
      sustainabilityStatus = "Moderate";
      sustainabilityStatusAr = "متوسط";
      evolutionForecast = "Platform has moderate evolution readiness - address weaknesses first";
      evolutionForecastAr = "المنصة لديها استعداد متوسط للتطور - عالج نقاط الضعف أولاً";
    }

    const risk30 = getRiskLevel(day30Score);
    const risk90 = getRiskLevel(day90Score);
    const risk180 = getRiskLevel(day180Score);

    return {
      day30: { 
        riskLevel: risk30.en, 
        riskLevelAr: risk30.ar,
        score: Math.round(day30Score), 
        threats: threats30,
        threatsAr: threats30Ar,
      },
      day90: { 
        riskLevel: risk90.en, 
        riskLevelAr: risk90.ar,
        score: Math.round(day90Score), 
        threats: threats90,
        threatsAr: threats90Ar,
      },
      day180: { 
        riskLevel: risk180.en, 
        riskLevelAr: risk180.ar,
        score: Math.round(day180Score), 
        threats: threats180,
        threatsAr: threats180Ar,
      },
      sustainabilityScore: Math.max(0, Math.min(100, sustainabilityScore)),
      sustainabilityStatus,
      sustainabilityStatusAr,
      evolutionForecast,
      evolutionForecastAr,
      weaknessAlerts: weaknesses,
      weaknessAlertsAr: weaknessesAr,
    };
  }

  isPlatformLocked(score: number): boolean {
    return score < 70;
  }

  canDeploy(score: number): boolean {
    return score >= 85;
  }

  getDeploymentStatus(score: number, decisionStatus: string): {
    canDeploy: boolean;
    isPlatformLocked: boolean;
    isDeployDisabled: boolean;
    reason: string;
    reasonAr: string;
    status: "sovereign_grade" | "conditional" | "at_risk" | "blocked";
  } {
    const isPlatformLocked = score < 70 || decisionStatus === "blocked";
    const isDeployDisabled = score < 85 || decisionStatus === "rejected" || decisionStatus === "blocked";
    const canDeploy = score >= 85 && 
                      !isPlatformLocked && 
                      (decisionStatus === "approved" || decisionStatus === "conditional");

    let reason = "";
    let reasonAr = "";
    let status: "sovereign_grade" | "conditional" | "at_risk" | "blocked" = "blocked";

    if (decisionStatus === "blocked" || isPlatformLocked) {
      status = "blocked";
      reason = "Platform is LOCKED. Critical compliance failures or blocking violations detected. Fix all issues to unlock.";
      reasonAr = "المنصة مقفلة. تم اكتشاف فشل امتثال حرج أو انتهاكات محظورة. أصلح جميع المشاكل لفتح القفل.";
    } else if (decisionStatus === "rejected" || score < 85) {
      status = "at_risk";
      reason = "At Risk. Deploy button is disabled. Score must reach 85+ and all blocking violations must be resolved.";
      reasonAr = "معرض للخطر. زر النشر معطل. يجب أن تصل الدرجة إلى 85+ وحل جميع الانتهاكات المحظورة.";
    } else if (score >= 95 && decisionStatus === "approved") {
      status = "sovereign_grade";
      reason = "Sovereign Grade achieved. Platform is fully compliant and ready for deployment.";
      reasonAr = "تم تحقيق الدرجة السيادية. المنصة متوافقة بالكامل وجاهزة للنشر.";
    } else if (score >= 85 && (decisionStatus === "approved" || decisionStatus === "conditional")) {
      status = "conditional";
      reason = "Conditional approval. Platform can deploy but has warnings that should be addressed.";
      reasonAr = "موافقة مشروطة. يمكن نشر المنصة لكن يوجد تحذيرات يجب معالجتها.";
    } else {
      status = "at_risk";
      reason = "At Risk. Deploy button is disabled. Score must reach 85+ to enable deployment.";
      reasonAr = "معرض للخطر. زر النشر معطل. يجب أن تصل الدرجة إلى 85+ لتفعيل النشر.";
    }

    return {
      canDeploy,
      isPlatformLocked,
      isDeployDisabled,
      reason,
      reasonAr,
      status,
    };
  }
}

export const policyValidationEngine = PolicyValidationEngine.getInstance();
