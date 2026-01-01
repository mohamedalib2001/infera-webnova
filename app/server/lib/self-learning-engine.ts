import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";

const anthropic = new Anthropic();

interface ProjectPattern {
  id: string;
  projectId: string;
  sector: string;
  patternType: "architecture" | "security" | "integration" | "ui" | "workflow" | "data_model";
  pattern: any;
  successMetrics: SuccessMetrics;
  frequency: number;
  lastUsed: Date;
  createdAt: Date;
}

interface SuccessMetrics {
  buildTime: number;
  errorRate: number;
  performanceScore: number;
  securityScore: number;
  userSatisfaction: number;
  reusability: number;
}

interface LearningInsight {
  id: string;
  type: "optimization" | "pattern" | "anti_pattern" | "best_practice" | "sector_specific";
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  confidence: number;
  applicableSectors: string[];
  recommendations: string[];
  recommendationsAr: string[];
  evidence: string[];
  impact: "low" | "medium" | "high" | "critical";
}

interface AlgorithmOptimization {
  id: string;
  algorithm: string;
  currentVersion: string;
  proposedVersion: string;
  improvements: string[];
  improvementsAr: string[];
  expectedGain: number;
  testResults?: TestResult[];
  status: "proposed" | "testing" | "approved" | "deployed" | "reverted";
}

interface TestResult {
  metric: string;
  before: number;
  after: number;
  improvement: number;
}

interface SectorProfile {
  id: string;
  sector: string;
  sectorAr: string;
  patterns: PatternSummary[];
  commonIntegrations: string[];
  securityRequirements: string[];
  complianceFrameworks: string[];
  bestPractices: string[];
  antiPatterns: string[];
  avgBuildTime: number;
  successRate: number;
}

interface PatternSummary {
  type: string;
  name: string;
  nameAr: string;
  frequency: number;
  successRate: number;
}

const SECTORS = {
  financial: { name: "Financial", nameAr: "مالي", compliance: ["PCI-DSS", "SOX", "GLBA"] },
  healthcare: { name: "Healthcare", nameAr: "صحي", compliance: ["HIPAA", "HITECH", "HL7"] },
  government: { name: "Government", nameAr: "حكومي", compliance: ["FISMA", "FedRAMP", "NIST"] },
  education: { name: "Education", nameAr: "تعليمي", compliance: ["FERPA", "COPPA"] },
  ecommerce: { name: "E-Commerce", nameAr: "تجارة إلكترونية", compliance: ["PCI-DSS", "GDPR"] },
  enterprise: { name: "Enterprise", nameAr: "مؤسسي", compliance: ["SOC2", "ISO27001"] }
};

class SelfLearningEngine {
  private knowledgeBase: Map<string, ProjectPattern[]> = new Map();
  private insights: LearningInsight[] = [];
  private optimizations: AlgorithmOptimization[] = [];
  private sectorProfiles: Map<string, SectorProfile> = new Map();

  constructor() {
    this.initializeSectorProfiles();
  }

  private initializeSectorProfiles() {
    Object.entries(SECTORS).forEach(([key, value]) => {
      this.sectorProfiles.set(key, {
        id: `sector_${key}`,
        sector: key,
        sectorAr: value.nameAr,
        patterns: [],
        commonIntegrations: [],
        securityRequirements: value.compliance,
        complianceFrameworks: value.compliance,
        bestPractices: [],
        antiPatterns: [],
        avgBuildTime: 0,
        successRate: 0
      });
    });
  }

  async learnFromProject(projectData: {
    id: string;
    sector: string;
    architecture: any;
    buildMetrics: SuccessMetrics;
    feedback?: string;
  }): Promise<{ patterns: ProjectPattern[]; insights: LearningInsight[] }> {
    const prompt = `Analyze this completed project and extract reusable patterns and insights.

Project Data:
- Sector: ${projectData.sector}
- Architecture: ${JSON.stringify(projectData.architecture, null, 2)}
- Build Metrics: ${JSON.stringify(projectData.buildMetrics)}
- User Feedback: ${projectData.feedback || "None provided"}

Extract:
1. Reusable architectural patterns
2. Security patterns specific to this sector
3. Integration patterns that worked well
4. UI/UX patterns
5. Data model patterns
6. Any anti-patterns to avoid

For each pattern provide:
- Type (architecture|security|integration|ui|workflow|data_model)
- Pattern details
- Why it was successful
- Reusability score (0-100)

Return JSON:
{
  "patterns": [{
    "patternType": "architecture",
    "pattern": { "name": "...", "structure": {...}, "usage": "..." },
    "reason": "Why successful",
    "reasonAr": "السبب بالعربية",
    "reusability": 85
  }],
  "insights": [{
    "type": "optimization|pattern|anti_pattern|best_practice|sector_specific",
    "title": "Insight title",
    "titleAr": "العنوان بالعربية",
    "description": "What we learned",
    "descriptionAr": "الوصف بالعربية",
    "confidence": 80,
    "impact": "low|medium|high|critical",
    "recommendations": ["Do this", "Avoid that"],
    "recommendationsAr": ["افعل هذا", "تجنب ذلك"]
  }]
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return { patterns: [], insights: [] };
    }

    const result = JSON.parse(jsonMatch[0]);
    const now = new Date();

    const patterns: ProjectPattern[] = (result.patterns || []).map((p: any, idx: number) => ({
      id: `pattern_${Date.now()}_${idx}`,
      projectId: projectData.id,
      sector: projectData.sector,
      patternType: p.patternType,
      pattern: p.pattern,
      successMetrics: projectData.buildMetrics,
      frequency: 1,
      lastUsed: now,
      createdAt: now
    }));

    const insights: LearningInsight[] = (result.insights || []).map((i: any, idx: number) => ({
      id: `insight_${Date.now()}_${idx}`,
      type: i.type,
      title: i.title,
      titleAr: i.titleAr,
      description: i.description,
      descriptionAr: i.descriptionAr,
      confidence: i.confidence || 70,
      applicableSectors: [projectData.sector],
      recommendations: i.recommendations || [],
      recommendationsAr: i.recommendationsAr || [],
      evidence: [projectData.id],
      impact: i.impact || "medium"
    }));

    this.storePatterns(projectData.sector, patterns);
    this.mergeInsights(insights);
    this.updateSectorProfile(projectData.sector, patterns, projectData.buildMetrics);

    return { patterns, insights };
  }

  private storePatterns(sector: string, patterns: ProjectPattern[]) {
    const existing = this.knowledgeBase.get(sector) || [];
    
    patterns.forEach(newPattern => {
      const similar = existing.find(p => 
        p.patternType === newPattern.patternType &&
        JSON.stringify(p.pattern.name) === JSON.stringify(newPattern.pattern.name)
      );
      
      if (similar) {
        similar.frequency++;
        similar.lastUsed = new Date();
        similar.successMetrics = this.mergeMetrics(similar.successMetrics, newPattern.successMetrics);
      } else {
        existing.push(newPattern);
      }
    });
    
    this.knowledgeBase.set(sector, existing);
  }

  private mergeMetrics(existing: SuccessMetrics, newMetrics: SuccessMetrics): SuccessMetrics {
    return {
      buildTime: (existing.buildTime + newMetrics.buildTime) / 2,
      errorRate: (existing.errorRate + newMetrics.errorRate) / 2,
      performanceScore: (existing.performanceScore + newMetrics.performanceScore) / 2,
      securityScore: (existing.securityScore + newMetrics.securityScore) / 2,
      userSatisfaction: (existing.userSatisfaction + newMetrics.userSatisfaction) / 2,
      reusability: (existing.reusability + newMetrics.reusability) / 2
    };
  }

  private mergeInsights(newInsights: LearningInsight[]) {
    newInsights.forEach(insight => {
      const existing = this.insights.find(i => 
        i.type === insight.type && 
        i.title.toLowerCase() === insight.title.toLowerCase()
      );
      
      if (existing) {
        existing.confidence = Math.min(100, existing.confidence + 5);
        existing.evidence.push(...insight.evidence);
        existing.applicableSectors = Array.from(new Set([...existing.applicableSectors, ...insight.applicableSectors]));
      } else {
        this.insights.push(insight);
      }
    });
  }

  private updateSectorProfile(sector: string, patterns: ProjectPattern[], metrics: SuccessMetrics) {
    const profile = this.sectorProfiles.get(sector);
    if (!profile) return;

    patterns.forEach(p => {
      const existing = profile.patterns.find(ep => ep.type === p.patternType && ep.name === p.pattern.name);
      if (existing) {
        existing.frequency++;
        existing.successRate = (existing.successRate + metrics.performanceScore) / 2;
      } else {
        profile.patterns.push({
          type: p.patternType,
          name: p.pattern.name || "Unknown",
          nameAr: p.pattern.nameAr || p.pattern.name || "غير معروف",
          frequency: 1,
          successRate: metrics.performanceScore
        });
      }
    });

    const allPatterns = this.knowledgeBase.get(sector) || [];
    profile.avgBuildTime = allPatterns.length > 0 
      ? allPatterns.reduce((sum, p) => sum + p.successMetrics.buildTime, 0) / allPatterns.length 
      : 0;
    profile.successRate = allPatterns.length > 0
      ? allPatterns.reduce((sum, p) => sum + p.successMetrics.performanceScore, 0) / allPatterns.length
      : 0;
  }

  async proposeAlgorithmOptimization(algorithmName: string, currentPerformance: any): Promise<AlgorithmOptimization> {
    const relevantPatterns = Array.from(this.knowledgeBase.values())
      .flat()
      .filter(p => p.patternType === "architecture" || p.patternType === "workflow");

    const prompt = `Based on learned patterns and current performance, propose optimizations for the "${algorithmName}" algorithm.

Current Performance:
${JSON.stringify(currentPerformance, null, 2)}

Learned Patterns (${relevantPatterns.length} total):
${JSON.stringify(relevantPatterns.slice(0, 10).map(p => ({
  type: p.patternType,
  sector: p.sector,
  frequency: p.frequency,
  metrics: p.successMetrics
})), null, 2)}

Propose specific code-level or structural optimizations that could improve:
1. Build speed
2. Error reduction
3. Performance
4. Security
5. Code quality

Return JSON:
{
  "currentVersion": "Description of current approach",
  "proposedVersion": "Description of optimized approach",
  "improvements": ["Specific improvement 1", "Improvement 2"],
  "improvementsAr": ["تحسين 1", "تحسين 2"],
  "expectedGain": 15,
  "testCases": [
    { "metric": "build_time", "expectedImprovement": 20 },
    { "metric": "error_rate", "expectedImprovement": 30 }
  ]
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    const optimization: AlgorithmOptimization = {
      id: `opt_${Date.now()}`,
      algorithm: algorithmName,
      currentVersion: result.currentVersion || "Current implementation",
      proposedVersion: result.proposedVersion || "Optimized implementation",
      improvements: result.improvements || [],
      improvementsAr: result.improvementsAr || [],
      expectedGain: result.expectedGain || 10,
      testResults: (result.testCases || []).map((tc: any) => ({
        metric: tc.metric,
        before: 100,
        after: 100 - tc.expectedImprovement,
        improvement: tc.expectedImprovement
      })),
      status: "proposed"
    };

    this.optimizations.push(optimization);
    return optimization;
  }

  async getSectorRecommendations(sector: string, projectRequirements: any): Promise<{
    patterns: ProjectPattern[];
    bestPractices: string[];
    bestPracticesAr: string[];
    warnings: string[];
    warningsAr: string[];
  }> {
    const sectorPatterns = this.knowledgeBase.get(sector) || [];
    const profile = this.sectorProfiles.get(sector);
    const sectorInfo = SECTORS[sector as keyof typeof SECTORS];

    const prompt = `Provide sector-specific recommendations for a ${sectorInfo?.name || sector} project.

Project Requirements:
${JSON.stringify(projectRequirements, null, 2)}

Known Sector Patterns (${sectorPatterns.length}):
${JSON.stringify(sectorPatterns.slice(0, 5).map(p => ({
  type: p.patternType,
  frequency: p.frequency,
  successRate: p.successMetrics.performanceScore
})), null, 2)}

Sector Compliance: ${sectorInfo?.compliance?.join(", ") || "General"}

Provide:
1. Best practices for this sector
2. Patterns to prioritize
3. Warnings about common pitfalls
4. Security considerations

Return JSON:
{
  "bestPractices": ["Practice 1", "Practice 2"],
  "bestPracticesAr": ["الممارسة 1", "الممارسة 2"],
  "warnings": ["Warning 1", "Warning 2"],
  "warningsAr": ["تحذير 1", "تحذير 2"],
  "recommendedPatterns": ["pattern_type_1", "pattern_type_2"]
}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    const recommendedTypes = result.recommendedPatterns || [];
    const relevantPatterns = sectorPatterns
      .filter(p => recommendedTypes.includes(p.patternType) || p.frequency > 2)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    return {
      patterns: relevantPatterns,
      bestPractices: result.bestPractices || [],
      bestPracticesAr: result.bestPracticesAr || [],
      warnings: result.warnings || [],
      warningsAr: result.warningsAr || []
    };
  }

  getKnowledgeStats(): {
    totalPatterns: number;
    patternsBySector: Record<string, number>;
    patternsByType: Record<string, number>;
    totalInsights: number;
    pendingOptimizations: number;
    topPatterns: ProjectPattern[];
  } {
    const allPatterns = Array.from(this.knowledgeBase.values()).flat();
    
    const patternsBySector: Record<string, number> = {};
    const patternsByType: Record<string, number> = {};
    
    this.knowledgeBase.forEach((patterns, sector) => {
      patternsBySector[sector] = patterns.length;
    });
    
    allPatterns.forEach(p => {
      patternsByType[p.patternType] = (patternsByType[p.patternType] || 0) + 1;
    });

    const topPatterns = allPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    return {
      totalPatterns: allPatterns.length,
      patternsBySector,
      patternsByType,
      totalInsights: this.insights.length,
      pendingOptimizations: this.optimizations.filter(o => o.status === "proposed").length,
      topPatterns
    };
  }

  getInsights(filters?: { type?: string; sector?: string; minConfidence?: number }): LearningInsight[] {
    let filtered = [...this.insights];
    
    if (filters?.type) {
      filtered = filtered.filter(i => i.type === filters.type);
    }
    if (filters?.sector) {
      filtered = filtered.filter(i => i.applicableSectors.includes(filters.sector!));
    }
    if (filters?.minConfidence) {
      filtered = filtered.filter(i => i.confidence >= filters.minConfidence!);
    }
    
    return filtered.sort((a, b) => b.confidence - a.confidence);
  }

  getSectorProfiles(): SectorProfile[] {
    return Array.from(this.sectorProfiles.values());
  }

  getOptimizations(): AlgorithmOptimization[] {
    return this.optimizations;
  }

  approveOptimization(optimizationId: string): boolean {
    const opt = this.optimizations.find(o => o.id === optimizationId);
    if (opt && opt.status === "proposed") {
      opt.status = "approved";
      return true;
    }
    return false;
  }
}

export const selfLearningEngine = new SelfLearningEngine();
