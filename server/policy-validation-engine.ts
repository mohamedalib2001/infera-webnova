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
    const canDeploy = isCompliant;

    return {
      isCompliant,
      overallScore,
      passedChecks,
      totalChecks,
      violations,
      warnings,
      timestamp: new Date(),
      canDeploy,
      blockingViolations,
    };
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
      
      const aiViolations = result.violations.filter(v => v.policyName.includes("AI") || v.ruleId.startsWith("ai-"));
      const securityViolations = result.violations.filter(v => v.policyName.includes("Security") || v.ruleId.includes("trust") || v.ruleId.includes("encrypt") || v.ruleId.includes("threat"));
      const scalabilityViolations = result.violations.filter(v => v.policyName.includes("Scalability") || v.ruleId.includes("modular") || v.ruleId.includes("limit"));
      
      const aiChecks = 4;
      const securityChecks = 5;
      const scalabilityChecks = 5;
      
      const categoryScores = {
        ai_intelligence: { 
          score: Math.max(0, 100 - (aiViolations.length * 25)), 
          status: aiViolations.length === 0 ? "compliant" : "non_compliant", 
          checkedItems: aiChecks - aiViolations.length, 
          totalItems: aiChecks 
        },
        cyber_security: { 
          score: Math.max(0, 100 - (securityViolations.length * 20)), 
          status: securityViolations.length === 0 ? "compliant" : "non_compliant", 
          checkedItems: securityChecks - securityViolations.length, 
          totalItems: securityChecks 
        },
        scalability: { 
          score: Math.max(0, 100 - (scalabilityViolations.length * 20)), 
          status: scalabilityViolations.length === 0 ? "compliant" : "non_compliant", 
          checkedItems: scalabilityChecks - scalabilityViolations.length, 
          totalItems: scalabilityChecks 
        },
      };
      
      const [complianceRecord] = await db.insert(sovereignPolicyCompliance).values({
        projectId: platformId,
        workspaceId: workspaceId || null,
        policyVersion: "2.0",
        overallStatus,
        complianceScore: result.overallScore,
        categoryScores,
        lastCheckAt: new Date(),
        lastCheckBy: userId,
        lastCheckType: "auto",
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
}

export const policyValidationEngine = PolicyValidationEngine.getInstance();
