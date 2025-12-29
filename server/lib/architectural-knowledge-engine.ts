/**
 * INFERA WebNova - Architectural Knowledge Management System
 * نظام إدارة المعرفة المعمارية
 * 
 * Preserves design decisions with rationale, compares designs, and suggests alternatives
 */

export type ArchitectureCategory = 
  | 'database' | 'api' | 'frontend' | 'security' | 'infrastructure' 
  | 'integration' | 'scalability' | 'performance' | 'storage' | 'messaging';

export type DecisionStatus = 'proposed' | 'accepted' | 'rejected' | 'superseded' | 'deprecated';

export interface ArchitecturalDecision {
  id: string;
  title: string;
  titleAr: string;
  category: ArchitectureCategory;
  status: DecisionStatus;
  context: string;
  contextAr: string;
  decision: string;
  decisionAr: string;
  rationale: string;
  rationaleAr: string;
  consequences: string[];
  consequencesAr: string[];
  alternatives: AlternativeOption[];
  constraints: string[];
  constraintsAr: string[];
  relatedDecisions: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  supersededBy?: string;
}

export interface AlternativeOption {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  pros: string[];
  prosAr: string[];
  cons: string[];
  consAr: string[];
  score: number;
  rejected: boolean;
  rejectionReason?: string;
  rejectionReasonAr?: string;
}

export interface DesignPattern {
  id: string;
  name: string;
  nameAr: string;
  category: ArchitectureCategory;
  description: string;
  descriptionAr: string;
  useCases: string[];
  useCasesAr: string[];
  constraints: PatternConstraint[];
  tradeoffs: PatternTradeoff[];
  relatedPatterns: string[];
  examples: string[];
}

export interface PatternConstraint {
  type: 'requires' | 'conflicts' | 'recommends';
  target: string;
  description: string;
  descriptionAr: string;
}

export interface PatternTradeoff {
  aspect: string;
  aspectAr: string;
  positive: string;
  positiveAr: string;
  negative: string;
  negativeAr: string;
}

export interface DesignComparison {
  id: string;
  title: string;
  titleAr: string;
  designs: ComparedDesign[];
  criteria: ComparisonCriterion[];
  scores: { [designId: string]: { [criterionId: string]: number } };
  recommendation: string;
  recommendationAr: string;
  winner?: string;
  createdAt: string;
  createdBy: string;
}

export interface ComparedDesign {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  patterns: string[];
  technologies: string[];
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  nameAr: string;
  weight: number;
  description: string;
  descriptionAr: string;
}

export interface ConstraintSet {
  budget?: { min?: number; max?: number };
  timeline?: { maxDays?: number };
  team?: { size?: number; skills?: string[] };
  scale?: { users?: number; requests?: number };
  compliance?: string[];
  technology?: { required?: string[]; forbidden?: string[] };
  performance?: { latency?: number; throughput?: number };
}

export interface AlternativeSuggestion {
  pattern: DesignPattern;
  score: number;
  matchedConstraints: string[];
  unmatchedConstraints: string[];
  recommendation: string;
  recommendationAr: string;
}

class ArchitecturalKnowledgeEngine {
  private decisions: Map<string, ArchitecturalDecision> = new Map();
  private patterns: Map<string, DesignPattern> = new Map();
  private comparisons: Map<string, DesignComparison> = new Map();

  constructor() {
    this.initializeBuiltInPatterns();
    console.log("[ArchitecturalKnowledge] Engine initialized | تم تهيئة محرك المعرفة المعمارية");
  }

  private initializeBuiltInPatterns(): void {
    const builtInPatterns: DesignPattern[] = [
      {
        id: 'pat-microservices',
        name: 'Microservices Architecture',
        nameAr: 'معمارية الخدمات المصغرة',
        category: 'api',
        description: 'Decompose application into small, independent services',
        descriptionAr: 'تقسيم التطبيق إلى خدمات صغيرة مستقلة',
        useCases: ['Large teams', 'Independent scaling', 'Technology diversity'],
        useCasesAr: ['فرق كبيرة', 'تحجيم مستقل', 'تنوع التقنيات'],
        constraints: [
          { type: 'requires', target: 'API Gateway', description: 'Needs API gateway for routing', descriptionAr: 'يحتاج بوابة API للتوجيه' },
          { type: 'requires', target: 'Service Discovery', description: 'Services must be discoverable', descriptionAr: 'يجب أن تكون الخدمات قابلة للاكتشاف' },
          { type: 'recommends', target: 'Container Orchestration', description: 'K8s or similar recommended', descriptionAr: 'يوصى بـ K8s أو ما شابه' }
        ],
        tradeoffs: [
          { aspect: 'Scalability', aspectAr: 'قابلية التوسع', positive: 'Independent scaling per service', positiveAr: 'تحجيم مستقل لكل خدمة', negative: 'Network overhead', negativeAr: 'عبء الشبكة' },
          { aspect: 'Complexity', aspectAr: 'التعقيد', positive: 'Isolated concerns', positiveAr: 'عزل المسؤوليات', negative: 'Distributed system complexity', negativeAr: 'تعقيد النظام الموزع' }
        ],
        relatedPatterns: ['pat-api-gateway', 'pat-event-driven', 'pat-cqrs'],
        examples: ['Netflix', 'Amazon', 'Uber']
      },
      {
        id: 'pat-monolith',
        name: 'Modular Monolith',
        nameAr: 'المونوليث المعياري',
        category: 'api',
        description: 'Single deployable unit with clear module boundaries',
        descriptionAr: 'وحدة نشر واحدة مع حدود وحدات واضحة',
        useCases: ['Small teams', 'Rapid development', 'Simple deployment'],
        useCasesAr: ['فرق صغيرة', 'تطوير سريع', 'نشر بسيط'],
        constraints: [
          { type: 'recommends', target: 'Clear module boundaries', description: 'Modules should be loosely coupled', descriptionAr: 'يجب أن تكون الوحدات متصلة بشكل ضعيف' }
        ],
        tradeoffs: [
          { aspect: 'Simplicity', aspectAr: 'البساطة', positive: 'Easy to develop and deploy', positiveAr: 'سهولة التطوير والنشر', negative: 'Can become tangled', negativeAr: 'قد يصبح متشابكاً' },
          { aspect: 'Scalability', aspectAr: 'قابلية التوسع', positive: 'Simple horizontal scaling', positiveAr: 'تحجيم أفقي بسيط', negative: 'All or nothing scaling', negativeAr: 'تحجيم كل شيء أو لا شيء' }
        ],
        relatedPatterns: ['pat-layered'],
        examples: ['Shopify (initially)', 'Basecamp']
      },
      {
        id: 'pat-event-driven',
        name: 'Event-Driven Architecture',
        nameAr: 'معمارية مدفوعة بالأحداث',
        category: 'messaging',
        description: 'Components communicate through events',
        descriptionAr: 'المكونات تتواصل من خلال الأحداث',
        useCases: ['Async processing', 'Decoupled systems', 'Real-time updates'],
        useCasesAr: ['معالجة غير متزامنة', 'أنظمة منفصلة', 'تحديثات فورية'],
        constraints: [
          { type: 'requires', target: 'Message Broker', description: 'Needs Kafka, RabbitMQ, or similar', descriptionAr: 'يحتاج Kafka أو RabbitMQ أو ما شابه' },
          { type: 'requires', target: 'Event Schema', description: 'Events must have defined schemas', descriptionAr: 'يجب أن يكون للأحداث مخططات محددة' }
        ],
        tradeoffs: [
          { aspect: 'Coupling', aspectAr: 'الترابط', positive: 'Loose coupling between services', positiveAr: 'ترابط ضعيف بين الخدمات', negative: 'Event schema evolution', negativeAr: 'تطور مخطط الأحداث' },
          { aspect: 'Debugging', aspectAr: 'التصحيح', positive: 'Clear event trail', positiveAr: 'مسار أحداث واضح', negative: 'Harder to trace flows', negativeAr: 'أصعب في تتبع التدفقات' }
        ],
        relatedPatterns: ['pat-cqrs', 'pat-event-sourcing', 'pat-saga'],
        examples: ['LinkedIn', 'Twitter']
      },
      {
        id: 'pat-cqrs',
        name: 'CQRS (Command Query Responsibility Segregation)',
        nameAr: 'فصل مسؤولية الأوامر والاستعلامات',
        category: 'database',
        description: 'Separate read and write models',
        descriptionAr: 'فصل نماذج القراءة والكتابة',
        useCases: ['High read/write ratio', 'Complex queries', 'Event sourcing'],
        useCasesAr: ['نسبة قراءة/كتابة عالية', 'استعلامات معقدة', 'مصدر الأحداث'],
        constraints: [
          { type: 'requires', target: 'Eventual Consistency', description: 'Read model may lag behind', descriptionAr: 'قد يتأخر نموذج القراءة' },
          { type: 'recommends', target: 'Event Sourcing', description: 'Often used together', descriptionAr: 'غالباً ما يستخدم معاً' }
        ],
        tradeoffs: [
          { aspect: 'Performance', aspectAr: 'الأداء', positive: 'Optimized read/write paths', positiveAr: 'مسارات قراءة/كتابة محسنة', negative: 'Sync complexity', negativeAr: 'تعقيد المزامنة' },
          { aspect: 'Complexity', aspectAr: 'التعقيد', positive: 'Clear separation', positiveAr: 'فصل واضح', negative: 'Two models to maintain', negativeAr: 'نموذجان للصيانة' }
        ],
        relatedPatterns: ['pat-event-sourcing', 'pat-event-driven'],
        examples: ['Azure', 'Banking systems']
      },
      {
        id: 'pat-api-gateway',
        name: 'API Gateway Pattern',
        nameAr: 'نمط بوابة API',
        category: 'api',
        description: 'Single entry point for all client requests',
        descriptionAr: 'نقطة دخول واحدة لجميع طلبات العميل',
        useCases: ['Microservices', 'Rate limiting', 'Authentication'],
        useCasesAr: ['الخدمات المصغرة', 'تحديد معدل الطلبات', 'المصادقة'],
        constraints: [
          { type: 'requires', target: 'High availability', description: 'Gateway must be highly available', descriptionAr: 'يجب أن تكون البوابة متاحة بشكل عالي' }
        ],
        tradeoffs: [
          { aspect: 'Centralization', aspectAr: 'المركزية', positive: 'Single point for cross-cutting concerns', positiveAr: 'نقطة واحدة للاهتمامات المشتركة', negative: 'Potential bottleneck', negativeAr: 'عنق زجاجة محتمل' }
        ],
        relatedPatterns: ['pat-microservices', 'pat-bff'],
        examples: ['Kong', 'AWS API Gateway', 'Nginx']
      },
      {
        id: 'pat-layered',
        name: 'Layered Architecture',
        nameAr: 'المعمارية متعددة الطبقات',
        category: 'api',
        description: 'Organize code into horizontal layers',
        descriptionAr: 'تنظيم الكود في طبقات أفقية',
        useCases: ['Traditional apps', 'Clear separation', 'Team organization'],
        useCasesAr: ['التطبيقات التقليدية', 'فصل واضح', 'تنظيم الفريق'],
        constraints: [],
        tradeoffs: [
          { aspect: 'Organization', aspectAr: 'التنظيم', positive: 'Clear structure', positiveAr: 'هيكل واضح', negative: 'Can lead to rigid boundaries', negativeAr: 'قد يؤدي إلى حدود صلبة' }
        ],
        relatedPatterns: ['pat-monolith', 'pat-clean-arch'],
        examples: ['Spring Boot apps', 'ASP.NET MVC']
      },
      {
        id: 'pat-serverless',
        name: 'Serverless Architecture',
        nameAr: 'معمارية بدون خوادم',
        category: 'infrastructure',
        description: 'Run code without managing servers',
        descriptionAr: 'تشغيل الكود بدون إدارة الخوادم',
        useCases: ['Variable workloads', 'Cost optimization', 'Event processing'],
        useCasesAr: ['أحمال عمل متغيرة', 'تحسين التكلفة', 'معالجة الأحداث'],
        constraints: [
          { type: 'requires', target: 'Stateless functions', description: 'Functions must be stateless', descriptionAr: 'يجب أن تكون الوظائف بدون حالة' },
          { type: 'conflicts', target: 'Long-running processes', description: 'Not suitable for long tasks', descriptionAr: 'غير مناسب للمهام الطويلة' }
        ],
        tradeoffs: [
          { aspect: 'Cost', aspectAr: 'التكلفة', positive: 'Pay per execution', positiveAr: 'الدفع لكل تنفيذ', negative: 'Cold start latency', negativeAr: 'تأخر البداية الباردة' },
          { aspect: 'Operations', aspectAr: 'العمليات', positive: 'No server management', positiveAr: 'لا إدارة للخوادم', negative: 'Vendor lock-in', negativeAr: 'الارتباط بالمزود' }
        ],
        relatedPatterns: ['pat-event-driven'],
        examples: ['AWS Lambda', 'Azure Functions', 'Cloudflare Workers']
      },
      {
        id: 'pat-event-sourcing',
        name: 'Event Sourcing',
        nameAr: 'مصدر الأحداث',
        category: 'database',
        description: 'Store state as sequence of events',
        descriptionAr: 'تخزين الحالة كتسلسل من الأحداث',
        useCases: ['Audit trails', 'Time travel', 'Complex domains'],
        useCasesAr: ['سجلات التدقيق', 'السفر عبر الزمن', 'المجالات المعقدة'],
        constraints: [
          { type: 'requires', target: 'Event Store', description: 'Need append-only event store', descriptionAr: 'يحتاج مخزن أحداث للإضافة فقط' },
          { type: 'requires', target: 'Event Versioning', description: 'Events must be versioned', descriptionAr: 'يجب ترقيم الأحداث' }
        ],
        tradeoffs: [
          { aspect: 'Auditability', aspectAr: 'قابلية التدقيق', positive: 'Complete history', positiveAr: 'سجل كامل', negative: 'Storage growth', negativeAr: 'نمو التخزين' },
          { aspect: 'Querying', aspectAr: 'الاستعلام', positive: 'Rebuild any state', positiveAr: 'إعادة بناء أي حالة', negative: 'Complex queries', negativeAr: 'استعلامات معقدة' }
        ],
        relatedPatterns: ['pat-cqrs', 'pat-event-driven'],
        examples: ['Banking', 'Git', 'Blockchain']
      }
    ];

    for (const pattern of builtInPatterns) {
      this.patterns.set(pattern.id, pattern);
    }
  }

  recordDecision(decision: Omit<ArchitecturalDecision, 'id' | 'createdAt' | 'updatedAt'>): ArchitecturalDecision {
    const id = `adr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const fullDecision: ArchitecturalDecision = {
      ...decision,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.decisions.set(id, fullDecision);
    console.log(`[ArchitecturalKnowledge] Recorded decision: ${decision.title} | تم تسجيل القرار: ${decision.titleAr}`);
    return fullDecision;
  }

  updateDecision(id: string, updates: Partial<ArchitecturalDecision>): ArchitecturalDecision | null {
    const existing = this.decisions.get(id);
    if (!existing) return null;

    const updated: ArchitecturalDecision = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };

    this.decisions.set(id, updated);
    return updated;
  }

  supersedeDecision(oldId: string, newDecision: Omit<ArchitecturalDecision, 'id' | 'createdAt' | 'updatedAt'>): ArchitecturalDecision | null {
    const existing = this.decisions.get(oldId);
    if (!existing) return null;

    const newRecord = this.recordDecision({
      ...newDecision,
      relatedDecisions: [...(newDecision.relatedDecisions || []), oldId]
    });

    this.updateDecision(oldId, {
      status: 'superseded',
      supersededBy: newRecord.id
    });

    return newRecord;
  }

  getDecision(id: string): ArchitecturalDecision | null {
    return this.decisions.get(id) || null;
  }

  getAllDecisions(filters?: { category?: ArchitectureCategory; status?: DecisionStatus; tag?: string }): ArchitecturalDecision[] {
    let results = Array.from(this.decisions.values());

    if (filters?.category) {
      results = results.filter(d => d.category === filters.category);
    }
    if (filters?.status) {
      results = results.filter(d => d.status === filters.status);
    }
    if (filters?.tag) {
      results = results.filter(d => d.tags.includes(filters.tag));
    }

    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  searchDecisions(query: string): ArchitecturalDecision[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.decisions.values()).filter(d =>
      d.title.toLowerCase().includes(lowerQuery) ||
      d.titleAr.includes(query) ||
      d.decision.toLowerCase().includes(lowerQuery) ||
      d.decisionAr.includes(query) ||
      d.context.toLowerCase().includes(lowerQuery) ||
      d.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }

  compareDesigns(title: string, titleAr: string, designs: ComparedDesign[], criteria: ComparisonCriterion[], scores: { [designId: string]: { [criterionId: string]: number } }, createdBy: string): DesignComparison {
    const id = `cmp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const weightedScores: { [designId: string]: number } = {};
    for (const design of designs) {
      let total = 0;
      let totalWeight = 0;
      for (const criterion of criteria) {
        const score = scores[design.id]?.[criterion.id] || 0;
        total += score * criterion.weight;
        totalWeight += criterion.weight;
      }
      weightedScores[design.id] = totalWeight > 0 ? total / totalWeight : 0;
    }

    const sortedDesigns = Object.entries(weightedScores).sort((a, b) => b[1] - a[1]);
    const winner = sortedDesigns.length > 0 ? sortedDesigns[0][0] : undefined;
    const winnerDesign = designs.find(d => d.id === winner);

    const recommendation = winner && winnerDesign
      ? `Based on weighted criteria analysis, "${winnerDesign.name}" scores highest with ${weightedScores[winner].toFixed(1)}/10`
      : 'No clear winner identified';
    const recommendationAr = winner && winnerDesign
      ? `بناءً على تحليل المعايير المرجحة، "${winnerDesign.nameAr}" يحصل على أعلى درجة بـ ${weightedScores[winner].toFixed(1)}/10`
      : 'لم يتم تحديد فائز واضح';

    const comparison: DesignComparison = {
      id,
      title,
      titleAr,
      designs,
      criteria,
      scores,
      recommendation,
      recommendationAr,
      winner,
      createdAt: new Date().toISOString(),
      createdBy
    };

    this.comparisons.set(id, comparison);
    console.log(`[ArchitecturalKnowledge] Created comparison: ${title} | تم إنشاء المقارنة: ${titleAr}`);
    return comparison;
  }

  getComparison(id: string): DesignComparison | null {
    return this.comparisons.get(id) || null;
  }

  getAllComparisons(): DesignComparison[] {
    return Array.from(this.comparisons.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  suggestAlternatives(constraints: ConstraintSet): AlternativeSuggestion[] {
    const suggestions: AlternativeSuggestion[] = [];

    for (const pattern of this.patterns.values()) {
      const matched: string[] = [];
      const unmatched: string[] = [];
      let score = 5;

      if (constraints.scale?.users) {
        if (constraints.scale.users > 100000) {
          if (pattern.id === 'pat-microservices' || pattern.id === 'pat-serverless') {
            matched.push('High scalability support');
            score += 2;
          } else if (pattern.id === 'pat-monolith') {
            unmatched.push('Limited scalability for very high user counts');
            score -= 2;
          }
        } else if (constraints.scale.users < 10000) {
          if (pattern.id === 'pat-monolith' || pattern.id === 'pat-layered') {
            matched.push('Appropriate for moderate scale');
            score += 1;
          }
        }
      }

      if (constraints.team?.size) {
        if (constraints.team.size < 5) {
          if (pattern.id === 'pat-monolith' || pattern.id === 'pat-serverless') {
            matched.push('Suitable for small teams');
            score += 1;
          } else if (pattern.id === 'pat-microservices') {
            unmatched.push('Microservices typically require larger teams');
            score -= 1;
          }
        } else if (constraints.team.size > 10) {
          if (pattern.id === 'pat-microservices') {
            matched.push('Enables parallel development by multiple teams');
            score += 2;
          }
        }
      }

      if (constraints.timeline?.maxDays) {
        if (constraints.timeline.maxDays < 90) {
          if (pattern.id === 'pat-monolith' || pattern.id === 'pat-serverless') {
            matched.push('Faster initial development');
            score += 1;
          } else if (pattern.id === 'pat-microservices' || pattern.id === 'pat-cqrs') {
            unmatched.push('Higher initial setup time');
            score -= 1;
          }
        }
      }

      if (constraints.compliance?.length) {
        if (constraints.compliance.includes('HIPAA') || constraints.compliance.includes('PCI-DSS')) {
          if (pattern.id === 'pat-event-sourcing') {
            matched.push('Complete audit trail for compliance');
            score += 2;
          }
        }
      }

      if (constraints.performance?.latency) {
        if (constraints.performance.latency < 100) {
          if (pattern.id === 'pat-cqrs') {
            matched.push('Optimized read path for low latency');
            score += 1;
          }
          if (pattern.id === 'pat-serverless') {
            unmatched.push('Cold start may affect latency');
            score -= 1;
          }
        }
      }

      if (constraints.technology?.required?.length) {
        for (const tech of constraints.technology.required) {
          if (tech.toLowerCase().includes('kubernetes') || tech.toLowerCase().includes('docker')) {
            if (pattern.id === 'pat-microservices') {
              matched.push(`Aligns with ${tech}`);
              score += 1;
            }
          }
        }
      }

      const recommendation = score >= 7
        ? `Highly recommended for your constraints`
        : score >= 5
        ? `Worth considering based on your requirements`
        : `May not be the best fit for your constraints`;

      const recommendationAr = score >= 7
        ? `موصى به بشدة حسب قيودك`
        : score >= 5
        ? `يستحق النظر بناءً على متطلباتك`
        : `قد لا يكون الأنسب لقيودك`;

      suggestions.push({
        pattern,
        score: Math.max(1, Math.min(10, score)),
        matchedConstraints: matched,
        unmatchedConstraints: unmatched,
        recommendation,
        recommendationAr
      });
    }

    return suggestions.sort((a, b) => b.score - a.score);
  }

  getPattern(id: string): DesignPattern | null {
    return this.patterns.get(id) || null;
  }

  getAllPatterns(): DesignPattern[] {
    return Array.from(this.patterns.values());
  }

  getPatternsByCategory(category: ArchitectureCategory): DesignPattern[] {
    return Array.from(this.patterns.values()).filter(p => p.category === category);
  }

  getRelatedDecisions(decisionId: string): ArchitecturalDecision[] {
    const decision = this.decisions.get(decisionId);
    if (!decision) return [];

    const related: ArchitecturalDecision[] = [];
    for (const relId of decision.relatedDecisions) {
      const rel = this.decisions.get(relId);
      if (rel) related.push(rel);
    }

    for (const [id, d] of this.decisions) {
      if (id !== decisionId && d.relatedDecisions.includes(decisionId)) {
        if (!related.find(r => r.id === id)) {
          related.push(d);
        }
      }
    }

    return related;
  }

  getDecisionHistory(decisionId: string): ArchitecturalDecision[] {
    const history: ArchitecturalDecision[] = [];
    let currentId: string | undefined = decisionId;

    while (currentId) {
      const decision = this.decisions.get(currentId);
      if (!decision) break;
      history.push(decision);
      
      const superseding = Array.from(this.decisions.values())
        .find(d => d.supersededBy === currentId);
      currentId = superseding?.id;
    }

    return history.reverse();
  }

  exportKnowledgeBase(): { decisions: ArchitecturalDecision[]; patterns: DesignPattern[]; comparisons: DesignComparison[] } {
    return {
      decisions: Array.from(this.decisions.values()),
      patterns: Array.from(this.patterns.values()),
      comparisons: Array.from(this.comparisons.values())
    };
  }

  getCategories(): { id: ArchitectureCategory; name: string; nameAr: string }[] {
    return [
      { id: 'database', name: 'Database', nameAr: 'قاعدة البيانات' },
      { id: 'api', name: 'API & Services', nameAr: 'API والخدمات' },
      { id: 'frontend', name: 'Frontend', nameAr: 'الواجهة الأمامية' },
      { id: 'security', name: 'Security', nameAr: 'الأمان' },
      { id: 'infrastructure', name: 'Infrastructure', nameAr: 'البنية التحتية' },
      { id: 'integration', name: 'Integration', nameAr: 'التكامل' },
      { id: 'scalability', name: 'Scalability', nameAr: 'قابلية التوسع' },
      { id: 'performance', name: 'Performance', nameAr: 'الأداء' },
      { id: 'storage', name: 'Storage', nameAr: 'التخزين' },
      { id: 'messaging', name: 'Messaging', nameAr: 'الرسائل' }
    ];
  }
}

export const architecturalKnowledgeEngine = new ArchitecturalKnowledgeEngine();
