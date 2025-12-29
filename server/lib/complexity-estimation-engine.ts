/**
 * INFERA WebNova - Complexity and Cost Estimation Engine
 * محرك تقدير التعقيد والتكلفة
 * 
 * Provides automatic complexity estimation, resource calculations, and smart warnings
 */

export type Sector = 'financial' | 'healthcare' | 'government' | 'education' | 'enterprise' | 'general';
export type PlatformType = 'web' | 'mobile' | 'desktop' | 'hybrid' | 'api';
export type SecurityLevel = 'basic' | 'standard' | 'high' | 'military';

export interface PlatformSpec {
  name: string;
  sector: Sector;
  type: PlatformType;
  securityLevel: SecurityLevel;
  features: FeatureSpec[];
  integrations: IntegrationSpec[];
  dataModels: DataModelSpec[];
  userRoles: number;
  expectedUsers: number;
  multiLanguage: boolean;
  multiTenant: boolean;
  complianceRequirements: string[];
}

export interface FeatureSpec {
  id: string;
  name: string;
  category: 'auth' | 'data' | 'ui' | 'integration' | 'ai' | 'payment' | 'notification' | 'reporting' | 'admin' | 'custom';
  complexity: 'simple' | 'medium' | 'complex' | 'very_complex';
  customDescription?: string;
}

export interface IntegrationSpec {
  id: string;
  name: string;
  type: 'api' | 'database' | 'storage' | 'payment' | 'auth' | 'notification' | 'analytics' | 'custom';
  complexity: 'simple' | 'medium' | 'complex';
}

export interface DataModelSpec {
  name: string;
  fields: number;
  relationships: number;
  hasFiles: boolean;
  hasEncryption: boolean;
}

export interface ComplexityScore {
  overall: number;
  breakdown: {
    features: number;
    integrations: number;
    security: number;
    data: number;
    scale: number;
  };
  level: 'low' | 'medium' | 'high' | 'very_high' | 'extreme';
  levelAr: string;
}

export interface ResourceEstimate {
  time: {
    minDays: number;
    maxDays: number;
    breakdown: {
      planning: number;
      development: number;
      testing: number;
      deployment: number;
    };
  };
  infrastructure: {
    tier: 'starter' | 'professional' | 'enterprise' | 'dedicated';
    tierAr: string;
    servers: number;
    storage: string;
    bandwidth: string;
    database: string;
    cdn: boolean;
    loadBalancer: boolean;
  };
  cost: {
    development: { min: number; max: number; currency: string };
    infrastructure: { monthly: number; yearly: number; currency: string };
    maintenance: { monthly: number; currency: string };
    total: { min: number; max: number; currency: string };
  };
  team: {
    developers: number;
    designers: number;
    qa: number;
    devops: number;
    projectManager: boolean;
    securityExpert: boolean;
  };
}

export interface Warning {
  id: string;
  type: 'info' | 'warning' | 'critical';
  category: 'complexity' | 'cost' | 'time' | 'security' | 'scale' | 'compliance';
  message: string;
  messageAr: string;
  recommendation: string;
  recommendationAr: string;
  threshold?: number;
  currentValue?: number;
}

export interface EstimationResult {
  id: string;
  timestamp: string;
  platform: PlatformSpec;
  complexity: ComplexityScore;
  resources: ResourceEstimate;
  warnings: Warning[];
  recommendations: string[];
  recommendationsAr: string[];
  confidence: number;
  summary: string;
  summaryAr: string;
}

const COMPLEXITY_WEIGHTS = {
  feature: { simple: 1, medium: 3, complex: 7, very_complex: 15 },
  integration: { simple: 2, medium: 5, complex: 10 },
  security: { basic: 1, standard: 2, high: 5, military: 10 },
  sector: { general: 1, education: 1.2, enterprise: 1.5, healthcare: 2, government: 2.5, financial: 3 }
};

const COST_MULTIPLIERS = {
  sector: { general: 1, education: 1.1, enterprise: 1.3, healthcare: 1.5, government: 1.8, financial: 2 },
  security: { basic: 1, standard: 1.2, high: 1.5, military: 2.5 },
  type: { web: 1, api: 0.8, mobile: 1.3, desktop: 1.4, hybrid: 1.6 }
};

const BASE_COSTS = {
  developerDayRate: 500,
  designerDayRate: 400,
  qaDayRate: 350,
  devopsDayRate: 550,
  pmDayRate: 450,
  securityExpertDayRate: 700
};

const INFRASTRUCTURE_TIERS = {
  starter: { monthly: 50, storage: '10GB', bandwidth: '100GB', database: 'Shared', servers: 1 },
  professional: { monthly: 200, storage: '100GB', bandwidth: '1TB', database: 'Dedicated Small', servers: 2 },
  enterprise: { monthly: 800, storage: '500GB', bandwidth: '5TB', database: 'Dedicated Medium', servers: 4 },
  dedicated: { monthly: 2500, storage: '2TB', bandwidth: 'Unlimited', database: 'Dedicated Large', servers: 8 }
};

class ComplexityEstimationEngine {
  private warningThresholds = {
    complexityScore: { warning: 50, critical: 80 },
    developmentDays: { warning: 90, critical: 180 },
    developmentCost: { warning: 50000, critical: 150000 },
    integrations: { warning: 5, critical: 10 },
    features: { warning: 15, critical: 30 },
    dataModels: { warning: 10, critical: 20 }
  };

  estimatePlatform(spec: PlatformSpec): EstimationResult {
    const complexity = this.calculateComplexity(spec);
    const resources = this.calculateResources(spec, complexity);
    const warnings = this.generateWarnings(spec, complexity, resources);
    const { recommendations, recommendationsAr } = this.generateRecommendations(spec, complexity, warnings);

    const result: EstimationResult = {
      id: `est-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      platform: spec,
      complexity,
      resources,
      warnings,
      recommendations,
      recommendationsAr,
      confidence: this.calculateConfidence(spec),
      summary: this.generateSummary(spec, complexity, resources),
      summaryAr: this.generateSummaryAr(spec, complexity, resources)
    };

    console.log(`[ComplexityEngine] Estimated platform "${spec.name}" | Complexity: ${complexity.level} (${complexity.overall}) | تقدير المنصة "${spec.name}"`);
    return result;
  }

  private calculateComplexity(spec: PlatformSpec): ComplexityScore {
    let featureScore = 0;
    for (const feature of spec.features) {
      featureScore += COMPLEXITY_WEIGHTS.feature[feature.complexity];
    }

    let integrationScore = 0;
    for (const integration of spec.integrations) {
      integrationScore += COMPLEXITY_WEIGHTS.integration[integration.complexity];
    }

    let dataScore = 0;
    for (const model of spec.dataModels) {
      dataScore += model.fields * 0.5;
      dataScore += model.relationships * 2;
      if (model.hasFiles) dataScore += 5;
      if (model.hasEncryption) dataScore += 8;
    }

    const securityScore = COMPLEXITY_WEIGHTS.security[spec.securityLevel] * 5;
    const sectorMultiplier = COMPLEXITY_WEIGHTS.sector[spec.sector];

    let scaleScore = 0;
    if (spec.expectedUsers > 1000) scaleScore += 5;
    if (spec.expectedUsers > 10000) scaleScore += 10;
    if (spec.expectedUsers > 100000) scaleScore += 20;
    if (spec.multiTenant) scaleScore += 15;
    if (spec.multiLanguage) scaleScore += 5;
    scaleScore += spec.userRoles * 2;
    scaleScore += spec.complianceRequirements.length * 5;

    const rawScore = (featureScore + integrationScore + dataScore + securityScore + scaleScore) * sectorMultiplier;
    const normalizedScore = Math.min(100, Math.round(rawScore / 2));

    let level: ComplexityScore['level'];
    let levelAr: string;
    if (normalizedScore < 20) { level = 'low'; levelAr = 'منخفض'; }
    else if (normalizedScore < 40) { level = 'medium'; levelAr = 'متوسط'; }
    else if (normalizedScore < 60) { level = 'high'; levelAr = 'عالي'; }
    else if (normalizedScore < 80) { level = 'very_high'; levelAr = 'عالي جداً'; }
    else { level = 'extreme'; levelAr = 'شديد التعقيد'; }

    return {
      overall: normalizedScore,
      breakdown: {
        features: Math.round(featureScore * sectorMultiplier),
        integrations: Math.round(integrationScore * sectorMultiplier),
        security: Math.round(securityScore * sectorMultiplier),
        data: Math.round(dataScore * sectorMultiplier),
        scale: Math.round(scaleScore * sectorMultiplier)
      },
      level,
      levelAr
    };
  }

  private calculateResources(spec: PlatformSpec, complexity: ComplexityScore): ResourceEstimate {
    const baseDays = 10 + complexity.overall * 2;
    const sectorMultiplier = COST_MULTIPLIERS.sector[spec.sector];
    const securityMultiplier = COST_MULTIPLIERS.security[spec.securityLevel];
    const typeMultiplier = COST_MULTIPLIERS.type[spec.type];
    const totalMultiplier = sectorMultiplier * securityMultiplier * typeMultiplier;

    const developmentDays = Math.round(baseDays * totalMultiplier * 0.6);
    const planningDays = Math.round(baseDays * totalMultiplier * 0.15);
    const testingDays = Math.round(baseDays * totalMultiplier * 0.2);
    const deploymentDays = Math.round(baseDays * totalMultiplier * 0.05);
    const totalDays = planningDays + developmentDays + testingDays + deploymentDays;

    let developers = 1;
    if (complexity.overall > 30) developers = 2;
    if (complexity.overall > 50) developers = 3;
    if (complexity.overall > 70) developers = 4;
    if (complexity.overall > 90) developers = 6;

    const designers = complexity.overall > 40 ? 1 : 0;
    const qa = complexity.overall > 30 ? 1 : 0;
    const devops = complexity.overall > 50 ? 1 : 0;
    const projectManager = complexity.overall > 40;
    const securityExpert = spec.securityLevel === 'high' || spec.securityLevel === 'military';

    let tier: ResourceEstimate['infrastructure']['tier'];
    let tierAr: string;
    if (spec.expectedUsers < 1000) { tier = 'starter'; tierAr = 'مبتدئ'; }
    else if (spec.expectedUsers < 10000) { tier = 'professional'; tierAr = 'احترافي'; }
    else if (spec.expectedUsers < 100000) { tier = 'enterprise'; tierAr = 'مؤسسي'; }
    else { tier = 'dedicated'; tierAr = 'مخصص'; }

    const infraConfig = INFRASTRUCTURE_TIERS[tier];
    const infraMultiplier = spec.multiTenant ? 1.5 : 1;

    const devCostMin = (
      developers * developmentDays * BASE_COSTS.developerDayRate +
      designers * developmentDays * BASE_COSTS.designerDayRate * 0.5 +
      qa * testingDays * BASE_COSTS.qaDayRate +
      devops * deploymentDays * BASE_COSTS.devopsDayRate +
      (projectManager ? planningDays * BASE_COSTS.pmDayRate : 0) +
      (securityExpert ? 10 * BASE_COSTS.securityExpertDayRate : 0)
    ) * 0.8;

    const devCostMax = devCostMin * 1.5;
    const infraMonthly = Math.round(infraConfig.monthly * infraMultiplier);
    const maintenanceMonthly = Math.round(devCostMin * 0.02);

    return {
      time: {
        minDays: Math.round(totalDays * 0.8),
        maxDays: Math.round(totalDays * 1.3),
        breakdown: {
          planning: planningDays,
          development: developmentDays,
          testing: testingDays,
          deployment: deploymentDays
        }
      },
      infrastructure: {
        tier,
        tierAr,
        servers: infraConfig.servers,
        storage: infraConfig.storage,
        bandwidth: infraConfig.bandwidth,
        database: infraConfig.database,
        cdn: spec.expectedUsers > 5000,
        loadBalancer: spec.expectedUsers > 10000
      },
      cost: {
        development: { min: Math.round(devCostMin), max: Math.round(devCostMax), currency: 'USD' },
        infrastructure: { monthly: infraMonthly, yearly: infraMonthly * 12, currency: 'USD' },
        maintenance: { monthly: maintenanceMonthly, currency: 'USD' },
        total: {
          min: Math.round(devCostMin + infraMonthly * 12),
          max: Math.round(devCostMax + infraMonthly * 12 * 1.2),
          currency: 'USD'
        }
      },
      team: { developers, designers, qa, devops, projectManager, securityExpert }
    };
  }

  private generateWarnings(spec: PlatformSpec, complexity: ComplexityScore, resources: ResourceEstimate): Warning[] {
    const warnings: Warning[] = [];

    if (complexity.overall >= this.warningThresholds.complexityScore.critical) {
      warnings.push({
        id: 'w-complexity-critical',
        type: 'critical',
        category: 'complexity',
        message: `Extreme complexity score (${complexity.overall}/100) - Project requires careful planning`,
        messageAr: `درجة تعقيد شديدة (${complexity.overall}/100) - المشروع يتطلب تخطيط دقيق`,
        recommendation: 'Consider breaking project into phases or MVPs',
        recommendationAr: 'فكر في تقسيم المشروع إلى مراحل أو نسخ أولية',
        threshold: this.warningThresholds.complexityScore.critical,
        currentValue: complexity.overall
      });
    } else if (complexity.overall >= this.warningThresholds.complexityScore.warning) {
      warnings.push({
        id: 'w-complexity-warning',
        type: 'warning',
        category: 'complexity',
        message: `High complexity score (${complexity.overall}/100)`,
        messageAr: `درجة تعقيد عالية (${complexity.overall}/100)`,
        recommendation: 'Allocate extra time for testing and QA',
        recommendationAr: 'خصص وقت إضافي للاختبار وضمان الجودة'
      });
    }

    if (resources.time.maxDays >= this.warningThresholds.developmentDays.critical) {
      warnings.push({
        id: 'w-time-critical',
        type: 'critical',
        category: 'time',
        message: `Development may take ${resources.time.maxDays}+ days`,
        messageAr: `التطوير قد يستغرق ${resources.time.maxDays}+ يوم`,
        recommendation: 'Consider phased delivery or team expansion',
        recommendationAr: 'فكر في التسليم المرحلي أو توسيع الفريق',
        threshold: this.warningThresholds.developmentDays.critical,
        currentValue: resources.time.maxDays
      });
    }

    if (resources.cost.development.max >= this.warningThresholds.developmentCost.critical) {
      warnings.push({
        id: 'w-cost-critical',
        type: 'critical',
        category: 'cost',
        message: `Development cost may exceed $${resources.cost.development.max.toLocaleString()}`,
        messageAr: `تكلفة التطوير قد تتجاوز $${resources.cost.development.max.toLocaleString()}`,
        recommendation: 'Review feature priorities and consider MVP approach',
        recommendationAr: 'راجع أولويات الميزات وفكر في نهج النسخة الأولية',
        threshold: this.warningThresholds.developmentCost.critical,
        currentValue: resources.cost.development.max
      });
    }

    if (spec.integrations.length >= this.warningThresholds.integrations.critical) {
      warnings.push({
        id: 'w-integrations-critical',
        type: 'critical',
        category: 'complexity',
        message: `${spec.integrations.length} integrations increase complexity significantly`,
        messageAr: `${spec.integrations.length} تكامل يزيد التعقيد بشكل كبير`,
        recommendation: 'Prioritize essential integrations for initial release',
        recommendationAr: 'أعط الأولوية للتكاملات الأساسية للإصدار الأول'
      });
    }

    if (spec.securityLevel === 'military' && !spec.complianceRequirements.includes('FIPS-140-3')) {
      warnings.push({
        id: 'w-security-compliance',
        type: 'warning',
        category: 'security',
        message: 'Military security level selected but FIPS-140-3 not in compliance list',
        messageAr: 'تم اختيار مستوى أمان عسكري لكن FIPS-140-3 غير موجود في قائمة الامتثال',
        recommendation: 'Add FIPS-140-3 compliance requirement',
        recommendationAr: 'أضف متطلب الامتثال لـ FIPS-140-3'
      });
    }

    if (spec.sector === 'healthcare' && !spec.complianceRequirements.includes('HIPAA')) {
      warnings.push({
        id: 'w-healthcare-hipaa',
        type: 'critical',
        category: 'compliance',
        message: 'Healthcare platform requires HIPAA compliance',
        messageAr: 'منصة الرعاية الصحية تتطلب الامتثال لـ HIPAA',
        recommendation: 'Add HIPAA to compliance requirements',
        recommendationAr: 'أضف HIPAA إلى متطلبات الامتثال'
      });
    }

    if (spec.sector === 'financial' && !spec.complianceRequirements.includes('PCI-DSS')) {
      warnings.push({
        id: 'w-financial-pci',
        type: 'critical',
        category: 'compliance',
        message: 'Financial platform requires PCI-DSS compliance',
        messageAr: 'المنصة المالية تتطلب الامتثال لـ PCI-DSS',
        recommendation: 'Add PCI-DSS to compliance requirements',
        recommendationAr: 'أضف PCI-DSS إلى متطلبات الامتثال'
      });
    }

    if (spec.expectedUsers > 50000 && !resources.infrastructure.loadBalancer) {
      warnings.push({
        id: 'w-scale-lb',
        type: 'warning',
        category: 'scale',
        message: 'High user count may require load balancing',
        messageAr: 'عدد المستخدمين الكبير قد يتطلب موازنة الحمل',
        recommendation: 'Consider load balancer for reliability',
        recommendationAr: 'فكر في موازن الحمل للموثوقية'
      });
    }

    return warnings;
  }

  private generateRecommendations(spec: PlatformSpec, complexity: ComplexityScore, warnings: Warning[]): { recommendations: string[]; recommendationsAr: string[] } {
    const recommendations: string[] = [];
    const recommendationsAr: string[] = [];

    if (complexity.level === 'high' || complexity.level === 'very_high' || complexity.level === 'extreme') {
      recommendations.push('Consider implementing in phases with MVP first');
      recommendationsAr.push('فكر في التنفيذ على مراحل مع النسخة الأولية أولاً');
    }

    if (spec.features.length > 10) {
      recommendations.push('Prioritize features using MoSCoW method');
      recommendationsAr.push('رتب الميزات حسب الأولوية باستخدام طريقة MoSCoW');
    }

    if (spec.multiTenant) {
      recommendations.push('Implement tenant isolation from day one');
      recommendationsAr.push('نفذ عزل المستأجرين من اليوم الأول');
    }

    if (warnings.some(w => w.category === 'security')) {
      recommendations.push('Engage security expert early in development');
      recommendationsAr.push('أشرك خبير أمان مبكراً في التطوير');
    }

    if (spec.integrations.length > 3) {
      recommendations.push('Create integration abstraction layer for flexibility');
      recommendationsAr.push('أنشئ طبقة تجريد للتكاملات للمرونة');
    }

    return { recommendations, recommendationsAr };
  }

  private calculateConfidence(spec: PlatformSpec): number {
    let confidence = 85;
    if (spec.features.some(f => f.complexity === 'very_complex')) confidence -= 10;
    if (spec.features.some(f => f.category === 'custom')) confidence -= 5;
    if (spec.integrations.some(i => i.type === 'custom')) confidence -= 5;
    if (spec.complianceRequirements.length > 3) confidence -= 5;
    return Math.max(50, confidence);
  }

  private generateSummary(spec: PlatformSpec, complexity: ComplexityScore, resources: ResourceEstimate): string {
    return `${spec.name} is a ${complexity.level} complexity ${spec.type} platform for the ${spec.sector} sector. ` +
      `Estimated development time: ${resources.time.minDays}-${resources.time.maxDays} days. ` +
      `Team size: ${resources.team.developers} developers. ` +
      `Estimated cost: $${resources.cost.development.min.toLocaleString()}-$${resources.cost.development.max.toLocaleString()}.`;
  }

  private generateSummaryAr(spec: PlatformSpec, complexity: ComplexityScore, resources: ResourceEstimate): string {
    return `${spec.name} هي منصة ${spec.type} بتعقيد ${complexity.levelAr} لقطاع ${spec.sector}. ` +
      `الوقت المقدر للتطوير: ${resources.time.minDays}-${resources.time.maxDays} يوم. ` +
      `حجم الفريق: ${resources.team.developers} مطورين. ` +
      `التكلفة المقدرة: $${resources.cost.development.min.toLocaleString()}-$${resources.cost.development.max.toLocaleString()}.`;
  }

  quickEstimate(features: number, integrations: number, sector: Sector, securityLevel: SecurityLevel): { complexity: string; days: string; cost: string } {
    const baseComplexity = features * 3 + integrations * 5;
    const multiplier = COMPLEXITY_WEIGHTS.sector[sector] * COMPLEXITY_WEIGHTS.security[securityLevel];
    const score = Math.min(100, Math.round(baseComplexity * multiplier / 2));
    
    let complexity: string;
    if (score < 25) complexity = 'Low | منخفض';
    else if (score < 50) complexity = 'Medium | متوسط';
    else if (score < 75) complexity = 'High | عالي';
    else complexity = 'Very High | عالي جداً';

    const baseDays = 10 + score * 2;
    const days = `${Math.round(baseDays * 0.8)}-${Math.round(baseDays * 1.3)} days | أيام`;

    const baseCost = baseDays * 500 * (features > 10 ? 2 : 1);
    const cost = `$${Math.round(baseCost * 0.8).toLocaleString()}-$${Math.round(baseCost * 1.5).toLocaleString()}`;

    return { complexity, days, cost };
  }

  getFeatureTemplates(): FeatureSpec[] {
    return [
      { id: 'auth-basic', name: 'Basic Authentication', category: 'auth', complexity: 'simple' },
      { id: 'auth-oauth', name: 'OAuth/SSO', category: 'auth', complexity: 'medium' },
      { id: 'auth-mfa', name: 'Multi-Factor Authentication', category: 'auth', complexity: 'complex' },
      { id: 'ui-dashboard', name: 'Admin Dashboard', category: 'ui', complexity: 'medium' },
      { id: 'ui-responsive', name: 'Responsive Design', category: 'ui', complexity: 'simple' },
      { id: 'data-crud', name: 'CRUD Operations', category: 'data', complexity: 'simple' },
      { id: 'data-search', name: 'Advanced Search', category: 'data', complexity: 'medium' },
      { id: 'data-analytics', name: 'Analytics & Reporting', category: 'reporting', complexity: 'complex' },
      { id: 'ai-chat', name: 'AI Chat Assistant', category: 'ai', complexity: 'complex' },
      { id: 'ai-ml', name: 'ML Predictions', category: 'ai', complexity: 'very_complex' },
      { id: 'payment-basic', name: 'Basic Payments', category: 'payment', complexity: 'medium' },
      { id: 'payment-subscription', name: 'Subscription Billing', category: 'payment', complexity: 'complex' },
      { id: 'notif-email', name: 'Email Notifications', category: 'notification', complexity: 'simple' },
      { id: 'notif-push', name: 'Push Notifications', category: 'notification', complexity: 'medium' },
      { id: 'admin-rbac', name: 'Role-Based Access', category: 'admin', complexity: 'medium' },
      { id: 'admin-audit', name: 'Audit Logging', category: 'admin', complexity: 'medium' }
    ];
  }

  getIntegrationTemplates(): IntegrationSpec[] {
    return [
      { id: 'int-stripe', name: 'Stripe Payments', type: 'payment', complexity: 'medium' },
      { id: 'int-postgres', name: 'PostgreSQL', type: 'database', complexity: 'simple' },
      { id: 'int-s3', name: 'AWS S3 Storage', type: 'storage', complexity: 'simple' },
      { id: 'int-sendgrid', name: 'SendGrid Email', type: 'notification', complexity: 'simple' },
      { id: 'int-twilio', name: 'Twilio SMS', type: 'notification', complexity: 'medium' },
      { id: 'int-oauth-google', name: 'Google OAuth', type: 'auth', complexity: 'medium' },
      { id: 'int-analytics', name: 'Analytics Platform', type: 'analytics', complexity: 'simple' },
      { id: 'int-erp', name: 'ERP System', type: 'api', complexity: 'complex' },
      { id: 'int-crm', name: 'CRM Integration', type: 'api', complexity: 'complex' }
    ];
  }
}

export const complexityEngine = new ComplexityEstimationEngine();
