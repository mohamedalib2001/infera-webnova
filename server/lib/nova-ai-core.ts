import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface UserIntent {
  action: "create" | "modify" | "delete" | "query" | "analyze" | "deploy" | "configure";
  target: string;
  parameters: Record<string, any>;
  confidence: number;
  context: string[];
}

export interface EntityExtraction {
  entities: Array<{
    type: "platform" | "feature" | "user" | "data" | "workflow" | "integration" | "security";
    value: string;
    confidence: number;
    position: { start: number; end: number };
  }>;
  relationships: Array<{
    source: string;
    target: string;
    type: string;
  }>;
}

export interface NLPAnalysisResult {
  originalText: string;
  language: "ar" | "en" | "mixed";
  intents: UserIntent[];
  entities: EntityExtraction;
  sentiment: "positive" | "neutral" | "negative";
  urgency: "low" | "medium" | "high" | "critical";
  complexity: "simple" | "moderate" | "complex" | "enterprise";
  keywords: string[];
  summary: string;
  suggestedActions: string[];
}

export interface TechnicalSpecification {
  id: string;
  version: string;
  createdAt: string;
  platform: {
    name: string;
    type: "web" | "mobile" | "desktop" | "api" | "hybrid";
    sector: SectorType;
    compliance: string[];
  };
  architecture: {
    frontend: { framework: string; features: string[] };
    backend: { framework: string; features: string[] };
    database: { type: string; schema: Record<string, any>[] };
    security: { level: string; features: string[] };
    infrastructure: { provider: string; services: string[] };
  };
  features: Array<{
    id: string;
    name: string;
    description: string;
    priority: "must" | "should" | "could" | "wont";
    complexity: number;
    estimatedHours: number;
    dependencies: string[];
  }>;
  integrations: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  timeline: {
    phases: Array<{ name: string; duration: string; deliverables: string[] }>;
    totalEstimate: string;
  };
  budget: {
    development: number;
    infrastructure: number;
    maintenance: number;
    currency: string;
  };
}

export type SectorType = "healthcare" | "military" | "government" | "commercial" | "education" | "financial";

export interface SectorContext {
  sector: SectorType;
  confidence: number;
  regulations: string[];
  securityLevel: "standard" | "enhanced" | "high" | "military";
  complianceRequirements: string[];
  dataClassification: "public" | "internal" | "confidential" | "secret" | "top_secret";
  specialRequirements: string[];
  riskFactors: string[];
  recommendedArchitecture: string[];
}

const SECTOR_PROFILES: Record<SectorType, {
  keywords: string[];
  regulations: string[];
  securityLevel: SectorContext["securityLevel"];
  compliance: string[];
  dataClass: SectorContext["dataClassification"];
}> = {
  healthcare: {
    keywords: ["مستشفى", "طبي", "صحة", "مريض", "علاج", "hospital", "medical", "health", "patient", "clinical", "pharmacy", "doctor", "nurse", "diagnosis", "treatment", "ehr", "emr"],
    regulations: ["HIPAA", "HL7", "FHIR", "GDPR-Health", "ISO 27799"],
    securityLevel: "high",
    compliance: ["HIPAA", "HITECH", "FDA 21 CFR Part 11", "ISO 27001", "SOC 2 Type II"],
    dataClass: "confidential"
  },
  military: {
    keywords: ["عسكري", "دفاع", "أمن", "جيش", "قوات", "military", "defense", "army", "security", "tactical", "classified", "intelligence", "combat", "operations", "command"],
    regulations: ["NIST 800-171", "ITAR", "CMMC", "FedRAMP High", "FIPS 140-3"],
    securityLevel: "military",
    compliance: ["CMMC Level 3+", "NIST 800-53", "FIPS 140-3", "Common Criteria EAL4+", "STIGs"],
    dataClass: "secret"
  },
  government: {
    keywords: ["حكومة", "وزارة", "هيئة", "بلدية", "مواطن", "government", "ministry", "agency", "citizen", "public", "municipal", "federal", "state", "regulatory", "policy"],
    regulations: ["FedRAMP", "FISMA", "NIST 800-53", "ADA Section 508"],
    securityLevel: "high",
    compliance: ["FedRAMP Moderate", "FISMA", "SOC 2", "ISO 27001", "WCAG 2.1 AA"],
    dataClass: "internal"
  },
  commercial: {
    keywords: ["تجاري", "متجر", "بيع", "شراء", "عميل", "commercial", "business", "store", "sales", "customer", "ecommerce", "retail", "wholesale", "marketplace", "b2b", "b2c"],
    regulations: ["PCI-DSS", "GDPR", "CCPA", "SOX"],
    securityLevel: "enhanced",
    compliance: ["PCI-DSS Level 1", "SOC 2 Type II", "GDPR", "ISO 27001"],
    dataClass: "confidential"
  },
  education: {
    keywords: ["تعليم", "مدرسة", "جامعة", "طالب", "معلم", "education", "school", "university", "student", "teacher", "learning", "lms", "course", "academic", "training"],
    regulations: ["FERPA", "COPPA", "GDPR-Education", "Accessibility"],
    securityLevel: "enhanced",
    compliance: ["FERPA", "COPPA", "SOC 2", "WCAG 2.1 AA"],
    dataClass: "internal"
  },
  financial: {
    keywords: ["مالي", "بنك", "تمويل", "استثمار", "دفع", "financial", "bank", "finance", "investment", "payment", "trading", "insurance", "fintech", "loan", "credit"],
    regulations: ["PCI-DSS", "SOX", "Basel III", "PSD2", "AML/KYC"],
    securityLevel: "high",
    compliance: ["PCI-DSS Level 1", "SOX", "SOC 1/2", "ISO 27001", "GDPR"],
    dataClass: "confidential"
  }
};

export class NovaAICore {
  async analyzeRequirements(userInput: string): Promise<NLPAnalysisResult> {
    const language = this.detectLanguage(userInput);
    
    const prompt = `أنت محلل متطلبات ذكي متخصص في فهم طلبات المستخدمين وتحويلها لمواصفات تقنية.

حلل النص التالي واستخرج:
1. النوايا (intents): ماذا يريد المستخدم أن يفعل
2. الكيانات (entities): المنصات، الميزات، المستخدمين، البيانات
3. العلاقات بين الكيانات
4. مستوى الإلحاح والتعقيد
5. الكلمات المفتاحية
6. ملخص موجز
7. الإجراءات المقترحة

النص: "${userInput}"

أجب بصيغة JSON فقط:
{
  "intents": [{"action": "create|modify|delete|query|analyze|deploy|configure", "target": "string", "parameters": {}, "confidence": 0.0-1.0, "context": []}],
  "entities": {"entities": [{"type": "platform|feature|user|data|workflow|integration|security", "value": "string", "confidence": 0.0-1.0}], "relationships": [{"source": "", "target": "", "type": ""}]},
  "sentiment": "positive|neutral|negative",
  "urgency": "low|medium|high|critical",
  "complexity": "simple|moderate|complex|enterprise",
  "keywords": [],
  "summary": "",
  "suggestedActions": []
}`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Unexpected response type");
      
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        originalText: userInput,
        language,
        intents: parsed.intents || [],
        entities: parsed.entities || { entities: [], relationships: [] },
        sentiment: parsed.sentiment || "neutral",
        urgency: parsed.urgency || "medium",
        complexity: parsed.complexity || "moderate",
        keywords: parsed.keywords || [],
        summary: parsed.summary || "",
        suggestedActions: parsed.suggestedActions || []
      };
    } catch (error) {
      console.error("[Nova AI Core] NLP Analysis error:", error);
      return this.fallbackAnalysis(userInput, language);
    }
  }

  async convertToSpecification(
    nlpResult: NLPAnalysisResult,
    sectorContext: SectorContext
  ): Promise<TechnicalSpecification> {
    const prompt = `أنت مهندس معماري برمجيات متخصص في تحويل المتطلبات إلى مواصفات تقنية كاملة.

المتطلبات المحللة:
${JSON.stringify(nlpResult, null, 2)}

السياق القطاعي:
${JSON.stringify(sectorContext, null, 2)}

أنشئ مواصفات تقنية كاملة تشمل:
1. معلومات المنصة (الاسم، النوع، القطاع، الامتثال)
2. البنية المعمارية (الواجهة، الخلفية، قاعدة البيانات، الأمان، البنية التحتية)
3. الميزات المطلوبة مع الأولويات والتقديرات
4. التكاملات المطلوبة
5. الجدول الزمني
6. تقدير الميزانية

أجب بصيغة JSON فقط مع البنية التالية:
{
  "platform": {"name": "", "type": "web|mobile|desktop|api|hybrid", "sector": "", "compliance": []},
  "architecture": {
    "frontend": {"framework": "", "features": []},
    "backend": {"framework": "", "features": []},
    "database": {"type": "", "schema": []},
    "security": {"level": "", "features": []},
    "infrastructure": {"provider": "", "services": []}
  },
  "features": [{"id": "", "name": "", "description": "", "priority": "must|should|could|wont", "complexity": 1-10, "estimatedHours": 0, "dependencies": []}],
  "integrations": [{"name": "", "type": "", "required": true|false}],
  "timeline": {"phases": [{"name": "", "duration": "", "deliverables": []}], "totalEstimate": ""},
  "budget": {"development": 0, "infrastructure": 0, "maintenance": 0, "currency": "USD"}
}`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }]
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Unexpected response type");
      
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        id: `SPEC-${Date.now()}`,
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        platform: {
          name: parsed.platform?.name || "منصة جديدة",
          type: parsed.platform?.type || "web",
          sector: sectorContext.sector,
          compliance: [...(parsed.platform?.compliance || []), ...sectorContext.complianceRequirements]
        },
        architecture: {
          frontend: parsed.architecture?.frontend || { framework: "React + TypeScript", features: [] },
          backend: parsed.architecture?.backend || { framework: "Node.js + Express", features: [] },
          database: parsed.architecture?.database || { type: "PostgreSQL", schema: [] },
          security: {
            level: sectorContext.securityLevel,
            features: [...(parsed.architecture?.security?.features || []), ...this.getSecurityFeatures(sectorContext)]
          },
          infrastructure: parsed.architecture?.infrastructure || { provider: "Hetzner Cloud", services: [] }
        },
        features: parsed.features || [],
        integrations: parsed.integrations || [],
        timeline: parsed.timeline || { phases: [], totalEstimate: "TBD" },
        budget: parsed.budget || { development: 0, infrastructure: 0, maintenance: 0, currency: "USD" }
      };
    } catch (error) {
      console.error("[Nova AI Core] Specification conversion error:", error);
      return this.generateDefaultSpecification(nlpResult, sectorContext);
    }
  }

  analyzeSectorContext(userInput: string): SectorContext {
    const inputLower = userInput.toLowerCase();
    const scores: Record<SectorType, number> = {
      healthcare: 0,
      military: 0,
      government: 0,
      commercial: 0,
      education: 0,
      financial: 0
    };

    for (const [sector, profile] of Object.entries(SECTOR_PROFILES)) {
      for (const keyword of profile.keywords) {
        if (inputLower.includes(keyword.toLowerCase())) {
          scores[sector as SectorType] += 1;
        }
      }
    }

    const maxScore = Math.max(...Object.values(scores));
    const detectedSector = maxScore > 0
      ? (Object.entries(scores).find(([, score]) => score === maxScore)?.[0] as SectorType) || "commercial"
      : "commercial";

    const profile = SECTOR_PROFILES[detectedSector];
    const confidence = maxScore > 0 ? Math.min(maxScore / 5, 1) : 0.5;

    return {
      sector: detectedSector,
      confidence,
      regulations: profile.regulations,
      securityLevel: profile.securityLevel,
      complianceRequirements: profile.compliance,
      dataClassification: profile.dataClass,
      specialRequirements: this.getSpecialRequirements(detectedSector),
      riskFactors: this.getRiskFactors(detectedSector),
      recommendedArchitecture: this.getRecommendedArchitecture(detectedSector)
    };
  }

  private detectLanguage(text: string): "ar" | "en" | "mixed" {
    const arabicPattern = /[\u0600-\u06FF]/;
    const englishPattern = /[a-zA-Z]/;
    const hasArabic = arabicPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasArabic && hasEnglish) return "mixed";
    if (hasArabic) return "ar";
    return "en";
  }

  private fallbackAnalysis(text: string, language: "ar" | "en" | "mixed"): NLPAnalysisResult {
    const keywords = text.split(/\s+/).filter(w => w.length > 3);
    return {
      originalText: text,
      language,
      intents: [{ action: "create", target: "platform", parameters: {}, confidence: 0.5, context: [] }],
      entities: { entities: [], relationships: [] },
      sentiment: "neutral",
      urgency: "medium",
      complexity: "moderate",
      keywords,
      summary: text.substring(0, 200),
      suggestedActions: ["تحليل المتطلبات بشكل أعمق", "تحديد النطاق", "مراجعة مع صاحب المصلحة"]
    };
  }

  private getSecurityFeatures(context: SectorContext): string[] {
    const base = ["TLS 1.3", "AES-256 Encryption", "RBAC", "Audit Logging"];
    const levelFeatures: Record<string, string[]> = {
      standard: [],
      enhanced: ["MFA", "Session Management", "Rate Limiting"],
      high: ["MFA", "Zero Trust", "SIEM Integration", "Encryption at Rest", "Key Management"],
      military: ["FIPS 140-3", "PKI/X.509", "Zero Trust", "Air-Gap Ready", "Hardware Security Modules", "Secure Boot", "Tamper Detection"]
    };
    return [...base, ...(levelFeatures[context.securityLevel] || [])];
  }

  private getSpecialRequirements(sector: SectorType): string[] {
    const requirements: Record<SectorType, string[]> = {
      healthcare: ["Patient Data Isolation", "Consent Management", "Medical Device Integration", "Interoperability (HL7/FHIR)"],
      military: ["Air-Gap Deployment", "Classification Levels", "Need-to-Know Access", "Secure Communications"],
      government: ["Citizen Identity Verification", "Accessibility Compliance", "Multi-Agency Integration", "Public Records Management"],
      commercial: ["Payment Processing", "Customer Analytics", "Inventory Management", "Multi-Currency Support"],
      education: ["Student Information System", "Learning Management", "Parent Portal", "Grade Management"],
      financial: ["Transaction Processing", "Fraud Detection", "Regulatory Reporting", "Real-Time Processing"]
    };
    return requirements[sector] || [];
  }

  private getRiskFactors(sector: SectorType): string[] {
    const risks: Record<SectorType, string[]> = {
      healthcare: ["PHI Breach", "HIPAA Violations", "System Downtime Impact", "Data Integrity"],
      military: ["Unauthorized Access", "Data Exfiltration", "Insider Threats", "Supply Chain Attacks"],
      government: ["Cyber Attacks", "Data Privacy Violations", "Service Disruption", "Compliance Failures"],
      commercial: ["Payment Fraud", "Data Breaches", "Business Disruption", "Reputational Damage"],
      education: ["Student Data Exposure", "FERPA Violations", "System Availability", "Content Security"],
      financial: ["Fraud", "Regulatory Fines", "Market Manipulation", "Systemic Risk"]
    };
    return risks[sector] || [];
  }

  private getRecommendedArchitecture(sector: SectorType): string[] {
    const arch: Record<SectorType, string[]> = {
      healthcare: ["Microservices", "Event Sourcing", "HIPAA-Compliant Cloud", "Redundant Storage"],
      military: ["Zero Trust Architecture", "Air-Gap Ready", "Multi-Level Security", "Hardened Infrastructure"],
      government: ["FedRAMP Architecture", "Multi-Region", "Disaster Recovery", "Secure API Gateway"],
      commercial: ["Scalable Microservices", "CDN", "Auto-Scaling", "Multi-Tenant"],
      education: ["SaaS Architecture", "LTI Integration", "Scalable Storage", "CDN for Content"],
      financial: ["Event-Driven", "Real-Time Processing", "Multi-Region Active-Active", "Immutable Audit Trail"]
    };
    return arch[sector] || ["Microservices", "Cloud-Native", "Auto-Scaling"];
  }

  private generateDefaultSpecification(nlpResult: NLPAnalysisResult, context: SectorContext): TechnicalSpecification {
    return {
      id: `SPEC-${Date.now()}`,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      platform: {
        name: "منصة سيادية جديدة",
        type: "web",
        sector: context.sector,
        compliance: context.complianceRequirements
      },
      architecture: {
        frontend: { framework: "React + TypeScript + Vite", features: ["Responsive", "RTL Support", "Dark Mode"] },
        backend: { framework: "Node.js + Express + TypeScript", features: ["REST API", "WebSocket", "Queue Processing"] },
        database: { type: "PostgreSQL + Drizzle ORM", schema: [] },
        security: { level: context.securityLevel, features: this.getSecurityFeatures(context) },
        infrastructure: { provider: "Hetzner Cloud", services: ["Kubernetes", "Object Storage", "Load Balancer"] }
      },
      features: nlpResult.suggestedActions.map((action, i) => ({
        id: `F-${i + 1}`,
        name: action,
        description: action,
        priority: "should" as const,
        complexity: 5,
        estimatedHours: 40,
        dependencies: []
      })),
      integrations: [],
      timeline: {
        phases: [
          { name: "التحليل والتصميم", duration: "2 أسابيع", deliverables: ["مستندات التصميم", "النماذج الأولية"] },
          { name: "التطوير", duration: "8 أسابيع", deliverables: ["النظام الأساسي", "الاختبارات"] },
          { name: "الاختبار والنشر", duration: "2 أسابيع", deliverables: ["النظام المختبر", "التوثيق"] }
        ],
        totalEstimate: "12 أسبوع"
      },
      budget: { development: 50000, infrastructure: 10000, maintenance: 5000, currency: "USD" }
    };
  }
}

export const novaAICore = new NovaAICore();
