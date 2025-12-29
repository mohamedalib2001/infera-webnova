/**
 * INFERA WebNova - Pre-Build Simulation Engine
 * محرك محاكاة قبل البناء
 * 
 * Simulates platform performance before code generation,
 * load/stress testing, and failure point detection
 */

export type SimulationType = 'performance' | 'load' | 'stress' | 'failure' | 'comprehensive';

export interface PlatformSpec {
  name: string;
  sector: 'financial' | 'healthcare' | 'government' | 'education' | 'enterprise' | 'ecommerce' | 'social';
  features: FeatureSpec[];
  integrations: IntegrationSpec[];
  infrastructure: InfrastructureSpec;
  expectedUsers: number;
  peakConcurrentUsers: number;
  dataVolume: 'small' | 'medium' | 'large' | 'massive';
  securityLevel: 'standard' | 'enhanced' | 'military';
}

export interface FeatureSpec {
  id: string;
  name: string;
  type: 'crud' | 'realtime' | 'computation' | 'file-processing' | 'ai-inference' | 'reporting';
  complexity: 'low' | 'medium' | 'high';
  expectedRequestsPerMinute: number;
  dataIntensive: boolean;
}

export interface IntegrationSpec {
  id: string;
  name: string;
  type: 'api' | 'database' | 'queue' | 'storage' | 'auth' | 'payment' | 'notification';
  latencyMs: number;
  failureRate: number;
}

export interface InfrastructureSpec {
  tier: 'starter' | 'professional' | 'enterprise' | 'dedicated';
  regions: number;
  redundancy: boolean;
  autoScaling: boolean;
  cdnEnabled: boolean;
}

export interface SimulationResult {
  id: string;
  platformSpec: PlatformSpec;
  simulationType: SimulationType;
  startedAt: string;
  completedAt: string;
  duration: number;
  status: 'completed' | 'failed' | 'warning';
  performanceMetrics: PerformanceMetrics;
  loadTestResults: LoadTestResult;
  stressTestResults: StressTestResult;
  failurePoints: FailurePoint[];
  recommendations: Recommendation[];
  overallScore: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number;
  errorRate: number;
  cpuUtilization: number;
  memoryUtilization: number;
  networkBandwidth: number;
  databaseConnections: number;
  cacheHitRate: number;
}

export interface LoadTestResult {
  maxConcurrentUsers: number;
  sustainedLoad: number;
  degradationPoint: number;
  responseTimeCurve: { users: number; responseTime: number }[];
  throughputCurve: { users: number; throughput: number }[];
  bottlenecks: Bottleneck[];
}

export interface StressTestResult {
  breakingPoint: number;
  recoveryTime: number;
  gracefulDegradation: boolean;
  cascadeFailures: CascadeFailure[];
  resourceExhaustion: ResourceExhaustion[];
}

export interface Bottleneck {
  component: string;
  componentAr: string;
  type: 'cpu' | 'memory' | 'network' | 'database' | 'external-api' | 'disk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  current: number;
  recommendation: string;
  recommendationAr: string;
}

export interface CascadeFailure {
  trigger: string;
  triggerAr: string;
  affectedComponents: string[];
  propagationTime: number;
  impact: 'partial' | 'major' | 'complete';
}

export interface ResourceExhaustion {
  resource: string;
  resourceAr: string;
  exhaustionPoint: number;
  recoveryStrategy: string;
  recoveryStrategyAr: string;
}

export interface FailurePoint {
  id: string;
  component: string;
  componentAr: string;
  failureType: 'timeout' | 'overload' | 'cascade' | 'resource-exhaustion' | 'integration-failure';
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggerCondition: string;
  triggerConditionAr: string;
  mitigation: string;
  mitigationAr: string;
  estimatedDowntime: number;
}

export interface Recommendation {
  id: string;
  category: 'architecture' | 'infrastructure' | 'code' | 'database' | 'caching' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  impact: string;
  impactAr: string;
  effort: 'low' | 'medium' | 'high';
  costReduction?: number;
  performanceGain?: number;
}

class PreBuildSimulationEngine {
  private simulations: Map<string, SimulationResult> = new Map();

  constructor() {
    console.log("[PreBuildSimulation] Engine initialized | تم تهيئة محرك المحاكاة قبل البناء");
  }

  async runSimulation(platformSpec: PlatformSpec, type: SimulationType, createdBy: string): Promise<SimulationResult> {
    const id = `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startedAt = new Date().toISOString();

    console.log(`[PreBuildSimulation] Starting ${type} simulation for ${platformSpec.name}`);

    const performanceMetrics = this.simulatePerformance(platformSpec);
    const loadTestResults = this.simulateLoad(platformSpec);
    const stressTestResults = this.simulateStress(platformSpec);
    const failurePoints = this.detectFailurePoints(platformSpec, performanceMetrics, loadTestResults, stressTestResults);
    const recommendations = this.generateRecommendations(platformSpec, performanceMetrics, loadTestResults, failurePoints);

    const overallScore = this.calculateOverallScore(performanceMetrics, loadTestResults, stressTestResults, failurePoints);

    const completedAt = new Date().toISOString();
    const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();

    const result: SimulationResult = {
      id,
      platformSpec,
      simulationType: type,
      startedAt,
      completedAt,
      duration,
      status: overallScore >= 70 ? 'completed' : overallScore >= 50 ? 'warning' : 'failed',
      performanceMetrics,
      loadTestResults,
      stressTestResults,
      failurePoints,
      recommendations,
      overallScore
    };

    this.simulations.set(id, result);
    console.log(`[PreBuildSimulation] Completed simulation ${id} with score ${overallScore}`);
    
    return result;
  }

  private simulatePerformance(spec: PlatformSpec): PerformanceMetrics {
    const baseResponseTime = this.calculateBaseResponseTime(spec);
    const throughputMultiplier = this.getThroughputMultiplier(spec.infrastructure.tier);
    
    const totalRequests = spec.features.reduce((sum, f) => sum + f.expectedRequestsPerMinute, 0);
    const integrationLatency = spec.integrations.reduce((sum, i) => sum + i.latencyMs * 0.1, 0);
    
    const avgResponse = baseResponseTime + integrationLatency;
    const cpuBase = Math.min(95, 20 + (totalRequests / 100) * 0.5 + spec.features.filter(f => f.complexity === 'high').length * 10);
    const memBase = Math.min(90, 30 + (spec.dataVolume === 'massive' ? 40 : spec.dataVolume === 'large' ? 25 : spec.dataVolume === 'medium' ? 15 : 5));

    return {
      averageResponseTime: Math.round(avgResponse),
      p50ResponseTime: Math.round(avgResponse * 0.8),
      p95ResponseTime: Math.round(avgResponse * 2.5),
      p99ResponseTime: Math.round(avgResponse * 4),
      throughput: Math.round(totalRequests * throughputMultiplier),
      errorRate: this.calculateErrorRate(spec),
      cpuUtilization: Math.round(cpuBase),
      memoryUtilization: Math.round(memBase),
      networkBandwidth: this.calculateNetworkBandwidth(spec),
      databaseConnections: this.calculateDbConnections(spec),
      cacheHitRate: spec.infrastructure.cdnEnabled ? 85 : 60
    };
  }

  private simulateLoad(spec: PlatformSpec): LoadTestResult {
    const tierCapacity = { starter: 100, professional: 500, enterprise: 2000, dedicated: 10000 };
    const baseCapacity = tierCapacity[spec.infrastructure.tier];
    const scalingMultiplier = spec.infrastructure.autoScaling ? 3 : 1;
    
    const maxUsers = Math.round(baseCapacity * scalingMultiplier * (spec.infrastructure.redundancy ? 1.5 : 1));
    const sustainedLoad = Math.round(maxUsers * 0.7);
    const degradationPoint = Math.round(maxUsers * 0.85);

    const bottlenecks: Bottleneck[] = [];
    
    if (spec.features.some(f => f.dataIntensive)) {
      bottlenecks.push({
        component: 'Database',
        componentAr: 'قاعدة البيانات',
        type: 'database',
        severity: 'medium',
        threshold: 80,
        current: 65,
        recommendation: 'Consider read replicas and connection pooling',
        recommendationAr: 'فكر في نسخ القراءة وتجميع الاتصالات'
      });
    }

    if (spec.features.some(f => f.type === 'ai-inference')) {
      bottlenecks.push({
        component: 'AI Processing',
        componentAr: 'معالجة الذكاء الاصطناعي',
        type: 'cpu',
        severity: 'high',
        threshold: 90,
        current: 75,
        recommendation: 'Implement request queuing and batch processing',
        recommendationAr: 'نفذ طابور الطلبات والمعالجة الدفعية'
      });
    }

    if (spec.integrations.filter(i => i.type === 'api').length > 3) {
      bottlenecks.push({
        component: 'External APIs',
        componentAr: 'واجهات برمجة خارجية',
        type: 'external-api',
        severity: 'medium',
        threshold: 100,
        current: 80,
        recommendation: 'Implement circuit breakers and caching',
        recommendationAr: 'نفذ قواطع الدائرة والتخزين المؤقت'
      });
    }

    const responseTimeCurve = [];
    const throughputCurve = [];
    for (let users = 10; users <= maxUsers; users += Math.max(10, Math.round(maxUsers / 20))) {
      const load = users / maxUsers;
      responseTimeCurve.push({
        users,
        responseTime: Math.round(50 + 150 * Math.pow(load, 2) + (load > 0.85 ? 500 * (load - 0.85) : 0))
      });
      throughputCurve.push({
        users,
        throughput: Math.round(users * 10 * (load < 0.85 ? 1 : 1 - (load - 0.85) * 2))
      });
    }

    return {
      maxConcurrentUsers: maxUsers,
      sustainedLoad,
      degradationPoint,
      responseTimeCurve,
      throughputCurve,
      bottlenecks
    };
  }

  private simulateStress(spec: PlatformSpec): StressTestResult {
    const tierCapacity = { starter: 100, professional: 500, enterprise: 2000, dedicated: 10000 };
    const baseCapacity = tierCapacity[spec.infrastructure.tier];
    const breakingPoint = Math.round(baseCapacity * (spec.infrastructure.autoScaling ? 4 : 1.5));
    
    const cascadeFailures: CascadeFailure[] = [];
    const resourceExhaustion: ResourceExhaustion[] = [];

    if (spec.securityLevel === 'military' || spec.sector === 'financial') {
      cascadeFailures.push({
        trigger: 'Authentication service overload',
        triggerAr: 'حمل زائد على خدمة المصادقة',
        affectedComponents: ['API Gateway', 'Session Management', 'Audit Logging'],
        propagationTime: 5000,
        impact: 'major'
      });
    }

    if (spec.dataVolume === 'massive' || spec.dataVolume === 'large') {
      resourceExhaustion.push({
        resource: 'Database Connections',
        resourceAr: 'اتصالات قاعدة البيانات',
        exhaustionPoint: breakingPoint * 0.7,
        recoveryStrategy: 'Connection pool expansion and query optimization',
        recoveryStrategyAr: 'توسيع تجمع الاتصالات وتحسين الاستعلامات'
      });
    }

    if (spec.features.some(f => f.type === 'file-processing')) {
      resourceExhaustion.push({
        resource: 'Memory',
        resourceAr: 'الذاكرة',
        exhaustionPoint: breakingPoint * 0.6,
        recoveryStrategy: 'Stream processing and temporary file cleanup',
        recoveryStrategyAr: 'معالجة التدفق وتنظيف الملفات المؤقتة'
      });
    }

    return {
      breakingPoint,
      recoveryTime: spec.infrastructure.autoScaling ? 30000 : 120000,
      gracefulDegradation: spec.infrastructure.tier !== 'starter',
      cascadeFailures,
      resourceExhaustion
    };
  }

  private detectFailurePoints(spec: PlatformSpec, perf: PerformanceMetrics, load: LoadTestResult, stress: StressTestResult): FailurePoint[] {
    const failurePoints: FailurePoint[] = [];

    if (perf.cpuUtilization > 70) {
      failurePoints.push({
        id: `fp-${Date.now()}-cpu`,
        component: 'CPU Resources',
        componentAr: 'موارد المعالج',
        failureType: 'overload',
        probability: (perf.cpuUtilization - 70) / 30,
        severity: perf.cpuUtilization > 85 ? 'critical' : 'high',
        triggerCondition: `CPU utilization exceeds ${perf.cpuUtilization}%`,
        triggerConditionAr: `استخدام المعالج يتجاوز ${perf.cpuUtilization}%`,
        mitigation: 'Implement horizontal scaling and optimize compute-heavy operations',
        mitigationAr: 'نفذ التوسع الأفقي وحسّن العمليات الثقيلة',
        estimatedDowntime: 300
      });
    }

    if (perf.p99ResponseTime > 1000) {
      failurePoints.push({
        id: `fp-${Date.now()}-timeout`,
        component: 'Request Processing',
        componentAr: 'معالجة الطلبات',
        failureType: 'timeout',
        probability: 0.3 + (perf.p99ResponseTime - 1000) / 3000,
        severity: perf.p99ResponseTime > 3000 ? 'critical' : 'medium',
        triggerCondition: `P99 response time reaches ${perf.p99ResponseTime}ms`,
        triggerConditionAr: `زمن الاستجابة P99 يصل ${perf.p99ResponseTime}ms`,
        mitigation: 'Implement caching, optimize database queries, add CDN',
        mitigationAr: 'نفذ التخزين المؤقت وحسّن استعلامات قاعدة البيانات وأضف CDN',
        estimatedDowntime: 0
      });
    }

    for (const integration of spec.integrations) {
      if (integration.failureRate > 0.01) {
        failurePoints.push({
          id: `fp-${Date.now()}-${integration.id}`,
          component: `Integration: ${integration.name}`,
          componentAr: `تكامل: ${integration.name}`,
          failureType: 'integration-failure',
          probability: integration.failureRate,
          severity: integration.type === 'payment' || integration.type === 'auth' ? 'critical' : 'medium',
          triggerCondition: `${integration.name} failure rate at ${(integration.failureRate * 100).toFixed(1)}%`,
          triggerConditionAr: `معدل فشل ${integration.name} عند ${(integration.failureRate * 100).toFixed(1)}%`,
          mitigation: 'Implement circuit breaker pattern and fallback mechanisms',
          mitigationAr: 'نفذ نمط قاطع الدائرة وآليات الاحتياطي',
          estimatedDowntime: 60
        });
      }
    }

    if (stress.cascadeFailures.length > 0) {
      failurePoints.push({
        id: `fp-${Date.now()}-cascade`,
        component: 'System Architecture',
        componentAr: 'معمارية النظام',
        failureType: 'cascade',
        probability: 0.15,
        severity: 'critical',
        triggerCondition: 'Multiple component failures in sequence',
        triggerConditionAr: 'فشل متعدد المكونات في تسلسل',
        mitigation: 'Implement bulkhead pattern and service isolation',
        mitigationAr: 'نفذ نمط الحواجز وعزل الخدمات',
        estimatedDowntime: 600
      });
    }

    return failurePoints;
  }

  private generateRecommendations(spec: PlatformSpec, perf: PerformanceMetrics, load: LoadTestResult, failures: FailurePoint[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (perf.cacheHitRate < 70) {
      recommendations.push({
        id: `rec-${Date.now()}-cache`,
        category: 'caching',
        priority: 'high',
        title: 'Improve Caching Strategy',
        titleAr: 'تحسين استراتيجية التخزين المؤقت',
        description: 'Current cache hit rate is below optimal. Implement multi-layer caching with Redis and CDN.',
        descriptionAr: 'معدل إصابة التخزين المؤقت أقل من الأمثل. نفذ تخزين مؤقت متعدد الطبقات مع Redis و CDN.',
        impact: 'Reduce response time by 40-60%',
        impactAr: 'تقليل زمن الاستجابة بنسبة 40-60%',
        effort: 'medium',
        performanceGain: 50
      });
    }

    if (!spec.infrastructure.autoScaling && spec.expectedUsers > 1000) {
      recommendations.push({
        id: `rec-${Date.now()}-scaling`,
        category: 'infrastructure',
        priority: 'critical',
        title: 'Enable Auto-Scaling',
        titleAr: 'تفعيل التوسع التلقائي',
        description: 'Expected user load exceeds static infrastructure capacity. Enable auto-scaling.',
        descriptionAr: 'حمل المستخدمين المتوقع يتجاوز سعة البنية التحتية الثابتة. فعّل التوسع التلقائي.',
        impact: 'Handle 300% more traffic without degradation',
        impactAr: 'التعامل مع 300% حركة أكثر بدون تدهور',
        effort: 'low',
        performanceGain: 200
      });
    }

    if (spec.infrastructure.tier === 'starter' && spec.sector === 'financial') {
      recommendations.push({
        id: `rec-${Date.now()}-tier`,
        category: 'infrastructure',
        priority: 'critical',
        title: 'Upgrade Infrastructure Tier',
        titleAr: 'ترقية مستوى البنية التحتية',
        description: 'Financial sector requires enterprise-grade infrastructure for compliance.',
        descriptionAr: 'يتطلب القطاع المالي بنية تحتية من فئة المؤسسات للامتثال.',
        impact: 'Meet compliance requirements and ensure reliability',
        impactAr: 'استيفاء متطلبات الامتثال وضمان الموثوقية',
        effort: 'high',
        costReduction: -50
      });
    }

    if (load.bottlenecks.some(b => b.type === 'database')) {
      recommendations.push({
        id: `rec-${Date.now()}-db`,
        category: 'database',
        priority: 'high',
        title: 'Optimize Database Performance',
        titleAr: 'تحسين أداء قاعدة البيانات',
        description: 'Database is a bottleneck. Add read replicas, optimize queries, implement connection pooling.',
        descriptionAr: 'قاعدة البيانات عنق زجاجة. أضف نسخ قراءة وحسّن الاستعلامات ونفذ تجميع الاتصالات.',
        impact: 'Reduce database load by 60%',
        impactAr: 'تقليل حمل قاعدة البيانات بنسبة 60%',
        effort: 'medium',
        performanceGain: 60
      });
    }

    if (failures.some(f => f.failureType === 'cascade')) {
      recommendations.push({
        id: `rec-${Date.now()}-arch`,
        category: 'architecture',
        priority: 'critical',
        title: 'Implement Fault Isolation',
        titleAr: 'تنفيذ عزل الأخطاء',
        description: 'Cascade failure risk detected. Implement bulkhead pattern and circuit breakers.',
        descriptionAr: 'تم اكتشاف خطر الفشل المتتالي. نفذ نمط الحواجز وقواطع الدائرة.',
        impact: 'Prevent system-wide outages',
        impactAr: 'منع الانقطاعات على مستوى النظام',
        effort: 'high',
        performanceGain: 30
      });
    }

    if (spec.securityLevel === 'military' && !spec.infrastructure.redundancy) {
      recommendations.push({
        id: `rec-${Date.now()}-security`,
        category: 'security',
        priority: 'critical',
        title: 'Enable Geographic Redundancy',
        titleAr: 'تفعيل التكرار الجغرافي',
        description: 'Military-grade security requires geographic redundancy for disaster recovery.',
        descriptionAr: 'يتطلب الأمان العسكري التكرار الجغرافي للتعافي من الكوارث.',
        impact: 'Ensure 99.99% availability',
        impactAr: 'ضمان توفر 99.99%',
        effort: 'high',
        costReduction: -100
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private calculateOverallScore(perf: PerformanceMetrics, load: LoadTestResult, stress: StressTestResult, failures: FailurePoint[]): number {
    let score = 100;

    if (perf.averageResponseTime > 500) score -= 10;
    if (perf.averageResponseTime > 1000) score -= 15;
    if (perf.p99ResponseTime > 2000) score -= 10;
    if (perf.errorRate > 0.01) score -= 15;
    if (perf.errorRate > 0.05) score -= 20;
    if (perf.cpuUtilization > 80) score -= 10;
    if (perf.memoryUtilization > 85) score -= 10;

    if (load.bottlenecks.length > 0) {
      score -= load.bottlenecks.reduce((sum, b) => sum + (b.severity === 'critical' ? 10 : b.severity === 'high' ? 5 : 2), 0);
    }

    if (!stress.gracefulDegradation) score -= 10;
    if (stress.cascadeFailures.length > 0) score -= 15;
    if (stress.resourceExhaustion.length > 0) score -= 10;

    for (const failure of failures) {
      if (failure.severity === 'critical') score -= 15;
      else if (failure.severity === 'high') score -= 8;
      else if (failure.severity === 'medium') score -= 4;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateBaseResponseTime(spec: PlatformSpec): number {
    let base = 50;
    const complexityPenalty = spec.features.filter(f => f.complexity === 'high').length * 30;
    const dataPenalty = spec.dataVolume === 'massive' ? 100 : spec.dataVolume === 'large' ? 50 : spec.dataVolume === 'medium' ? 20 : 0;
    const tierBonus = { starter: 0, professional: -20, enterprise: -40, dedicated: -60 };
    
    return Math.max(20, base + complexityPenalty + dataPenalty + tierBonus[spec.infrastructure.tier]);
  }

  private getThroughputMultiplier(tier: string): number {
    return { starter: 1, professional: 2.5, enterprise: 5, dedicated: 10 }[tier] || 1;
  }

  private calculateErrorRate(spec: PlatformSpec): number {
    let rate = 0.001;
    rate += spec.integrations.reduce((sum, i) => sum + i.failureRate * 0.1, 0);
    rate += spec.features.filter(f => f.complexity === 'high').length * 0.002;
    return Math.min(0.1, rate);
  }

  private calculateNetworkBandwidth(spec: PlatformSpec): number {
    const base = spec.features.reduce((sum, f) => sum + f.expectedRequestsPerMinute * 0.01, 0);
    const fileProcessing = spec.features.some(f => f.type === 'file-processing') ? 50 : 0;
    return Math.round(base + fileProcessing);
  }

  private calculateDbConnections(spec: PlatformSpec): number {
    const tierConnections = { starter: 20, professional: 100, enterprise: 500, dedicated: 2000 };
    const base = tierConnections[spec.infrastructure.tier];
    const dataFactor = spec.features.filter(f => f.dataIntensive).length * 10;
    return Math.min(base, 50 + dataFactor);
  }

  getSimulation(id: string): SimulationResult | null {
    return this.simulations.get(id) || null;
  }

  getAllSimulations(): SimulationResult[] {
    return Array.from(this.simulations.values())
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  getQuickEstimate(params: {
    featureCount: number;
    integrationCount: number;
    expectedUsers: number;
    tier: 'starter' | 'professional' | 'enterprise' | 'dedicated';
    sector: PlatformSpec['sector'];
  }): { score: number; maxUsers: number; responseTime: number; warnings: string[] } {
    const warnings: string[] = [];
    
    const tierCapacity = { starter: 100, professional: 500, enterprise: 2000, dedicated: 10000 };
    const maxUsers = tierCapacity[params.tier] * (params.tier === 'dedicated' ? 1 : 1.5);
    
    const baseResponse = 50 + params.featureCount * 10 + params.integrationCount * 20;
    
    let score = 85;
    if (params.expectedUsers > maxUsers * 0.8) {
      score -= 20;
      warnings.push('Expected users approaching capacity limit');
    }
    if (params.featureCount > 10) {
      score -= 10;
      warnings.push('High feature count may impact performance');
    }
    if (params.sector === 'financial' && params.tier === 'starter') {
      score -= 30;
      warnings.push('Financial sector requires higher infrastructure tier');
    }
    if (params.integrationCount > 5) {
      score -= 5;
      warnings.push('Multiple integrations increase failure risk');
    }

    return {
      score: Math.max(0, score),
      maxUsers: Math.round(maxUsers),
      responseTime: Math.round(baseResponse),
      warnings
    };
  }

  getSectorPresets(): { id: PlatformSpec['sector']; name: string; nameAr: string; defaults: Partial<PlatformSpec> }[] {
    return [
      { id: 'financial', name: 'Financial', nameAr: 'مالي', defaults: { securityLevel: 'military', dataVolume: 'large' } },
      { id: 'healthcare', name: 'Healthcare', nameAr: 'صحي', defaults: { securityLevel: 'enhanced', dataVolume: 'large' } },
      { id: 'government', name: 'Government', nameAr: 'حكومي', defaults: { securityLevel: 'military', dataVolume: 'massive' } },
      { id: 'education', name: 'Education', nameAr: 'تعليمي', defaults: { securityLevel: 'standard', dataVolume: 'medium' } },
      { id: 'enterprise', name: 'Enterprise', nameAr: 'مؤسسي', defaults: { securityLevel: 'enhanced', dataVolume: 'large' } },
      { id: 'ecommerce', name: 'E-Commerce', nameAr: 'تجارة إلكترونية', defaults: { securityLevel: 'enhanced', dataVolume: 'large' } },
      { id: 'social', name: 'Social', nameAr: 'اجتماعي', defaults: { securityLevel: 'standard', dataVolume: 'massive' } }
    ];
  }

  getFeatureTypes(): { id: FeatureSpec['type']; name: string; nameAr: string; defaultComplexity: FeatureSpec['complexity'] }[] {
    return [
      { id: 'crud', name: 'CRUD Operations', nameAr: 'عمليات CRUD', defaultComplexity: 'low' },
      { id: 'realtime', name: 'Real-time Features', nameAr: 'ميزات الوقت الحقيقي', defaultComplexity: 'medium' },
      { id: 'computation', name: 'Heavy Computation', nameAr: 'حسابات ثقيلة', defaultComplexity: 'high' },
      { id: 'file-processing', name: 'File Processing', nameAr: 'معالجة الملفات', defaultComplexity: 'high' },
      { id: 'ai-inference', name: 'AI Inference', nameAr: 'استنتاج الذكاء الاصطناعي', defaultComplexity: 'high' },
      { id: 'reporting', name: 'Reporting & Analytics', nameAr: 'التقارير والتحليلات', defaultComplexity: 'medium' }
    ];
  }

  getIntegrationTypes(): { id: IntegrationSpec['type']; name: string; nameAr: string; defaultLatency: number }[] {
    return [
      { id: 'api', name: 'External API', nameAr: 'واجهة برمجة خارجية', defaultLatency: 200 },
      { id: 'database', name: 'Database', nameAr: 'قاعدة بيانات', defaultLatency: 50 },
      { id: 'queue', name: 'Message Queue', nameAr: 'طابور رسائل', defaultLatency: 20 },
      { id: 'storage', name: 'Object Storage', nameAr: 'تخزين الكائنات', defaultLatency: 100 },
      { id: 'auth', name: 'Authentication', nameAr: 'المصادقة', defaultLatency: 150 },
      { id: 'payment', name: 'Payment Gateway', nameAr: 'بوابة الدفع', defaultLatency: 500 },
      { id: 'notification', name: 'Notifications', nameAr: 'الإشعارات', defaultLatency: 100 }
    ];
  }
}

export const preBuildSimulationEngine = new PreBuildSimulationEngine();
