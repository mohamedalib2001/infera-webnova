/**
 * INFERA WebNova - Blueprint Architecture System
 * Core module for capturing product intents and domain blueprints
 * 
 * Supports intelligent context analysis and intent extraction
 */

import { eventBus, createEvent, EventTypes, type DomainEvent } from '../event-bus';
import { BlueprintSchema, type Blueprint } from '../contracts';
import { extensionRegistry, CORE_EXTENSION_POINTS } from '../extension-registry';

export interface IBlueprintSystem {
  createBlueprint(data: Omit<Blueprint, 'id' | 'metadata'>): Promise<Blueprint>;
  updateBlueprint(id: string, data: Partial<Blueprint>): Promise<Blueprint>;
  getBlueprint(id: string): Promise<Blueprint | null>;
  listBlueprints(tenantId: string, filter?: BlueprintFilter): Promise<Blueprint[]>;
  approveBlueprint(id: string, approvedBy: string): Promise<Blueprint>;
  rejectBlueprint(id: string, reason: string): Promise<Blueprint>;
  archiveBlueprint(id: string): Promise<void>;
  
  analyzeIntent(input: IntentAnalysisInput): Promise<IntentAnalysisResult>;
  validateBlueprint(blueprint: Blueprint): Promise<ValidationResult>;
  transformBlueprint(blueprint: Blueprint, target: TransformationTarget): Promise<Blueprint>;
}

export interface BlueprintFilter {
  status?: Blueprint['status'];
  domain?: string;
  platform?: string;
}

export interface IntentAnalysisInput {
  naturalLanguagePrompt: string;
  context?: {
    industry?: string;
    targetAudience?: string;
    existingAssets?: string[];
    preferences?: Record<string, unknown>;
  };
  language: 'ar' | 'en' | 'both';
}

export interface IntentAnalysisResult {
  extractedIntents: Array<{
    id: string;
    type: Blueprint['intents'][0]['type'];
    description: string;
    priority: Blueprint['intents'][0]['priority'];
    confidence: number;
    keywords: string[];
  }>;
  suggestedDomain: string;
  suggestedPlatform: Blueprint['context']['targetPlatform'];
  suggestedConstraints: Blueprint['constraints'];
  clarificationNeeded: Array<{
    topic: string;
    question: string;
    options?: string[];
  }>;
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  estimatedEffort: {
    hours: number;
    aiTokens: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    code: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: string[];
  suggestions: string[];
}

export type TransformationTarget = 'optimized' | 'minimal' | 'full' | 'mobile' | 'api_only';

export interface BlueprintDraftedPayload {
  blueprintId: string;
  tenantId: string;
  name: string;
  domain: string;
  intentsCount: number;
  complexity: string;
}

export interface BlueprintApprovedPayload {
  blueprintId: string;
  tenantId: string;
  approvedBy: string;
  intents: Array<{ id: string; type: string; description: string }>;
}

class BlueprintSystemImpl implements IBlueprintSystem {
  private blueprints: Map<string, Blueprint> = new Map();

  async createBlueprint(data: Omit<Blueprint, 'id' | 'metadata'>): Promise<Blueprint> {
    const blueprint: Blueprint = {
      ...data,
      id: crypto.randomUUID(),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: data.tenantId,
      },
    };

    const validation = await this.validateBlueprint(blueprint);
    if (!validation.valid) {
      const errors = validation.errors.filter(e => e.severity === 'error');
      if (errors.length > 0) {
        throw new Error(`Invalid blueprint: ${errors.map(e => e.message).join(', ')}`);
      }
    }

    this.blueprints.set(blueprint.id, blueprint);

    const complexity = this.assessComplexity(blueprint);

    await eventBus.publish(createEvent<BlueprintDraftedPayload>(
      EventTypes.BLUEPRINT_DRAFTED,
      {
        blueprintId: blueprint.id,
        tenantId: blueprint.tenantId,
        name: blueprint.name,
        domain: blueprint.context.domain,
        intentsCount: blueprint.intents.length,
        complexity,
      },
      { tenantId: blueprint.tenantId, aggregateId: blueprint.id, aggregateType: 'blueprint' }
    ));

    return blueprint;
  }

  async updateBlueprint(id: string, data: Partial<Blueprint>): Promise<Blueprint> {
    const existing = this.blueprints.get(id);
    if (!existing) {
      throw new Error(`Blueprint ${id} not found`);
    }

    const updated: Blueprint = {
      ...existing,
      ...data,
      id: existing.id,
      metadata: {
        ...existing.metadata,
        updatedAt: new Date(),
      },
    };

    this.blueprints.set(id, updated);

    await eventBus.publish(createEvent(
      EventTypes.BLUEPRINT_UPDATED,
      {
        blueprintId: id,
        tenantId: updated.tenantId,
        changes: Object.keys(data),
      },
      { tenantId: updated.tenantId, aggregateId: id, aggregateType: 'blueprint' }
    ));

    return updated;
  }

  async getBlueprint(id: string): Promise<Blueprint | null> {
    return this.blueprints.get(id) || null;
  }

  async listBlueprints(tenantId: string, filter?: BlueprintFilter): Promise<Blueprint[]> {
    let blueprints = Array.from(this.blueprints.values())
      .filter(b => b.tenantId === tenantId);

    if (filter?.status) {
      blueprints = blueprints.filter(b => b.status === filter.status);
    }
    if (filter?.domain) {
      blueprints = blueprints.filter(b => b.context.domain === filter.domain);
    }
    if (filter?.platform) {
      blueprints = blueprints.filter(b => b.context.targetPlatform === filter.platform);
    }

    return blueprints;
  }

  async approveBlueprint(id: string, approvedBy: string): Promise<Blueprint> {
    const blueprint = await this.updateBlueprint(id, {
      status: 'approved',
    });
    
    blueprint.metadata.approvedBy = approvedBy;

    await eventBus.publish(createEvent<BlueprintApprovedPayload>(
      EventTypes.BLUEPRINT_APPROVED,
      {
        blueprintId: blueprint.id,
        tenantId: blueprint.tenantId,
        approvedBy,
        intents: blueprint.intents.map(i => ({
          id: i.id,
          type: i.type,
          description: i.description,
        })),
      },
      { tenantId: blueprint.tenantId, aggregateId: id, aggregateType: 'blueprint' }
    ));

    return blueprint;
  }

  async rejectBlueprint(id: string, reason: string): Promise<Blueprint> {
    const blueprint = await this.updateBlueprint(id, {
      status: 'rejected',
    });

    await eventBus.publish(createEvent(
      EventTypes.BLUEPRINT_REJECTED,
      {
        blueprintId: blueprint.id,
        tenantId: blueprint.tenantId,
        reason,
      },
      { tenantId: blueprint.tenantId, aggregateId: id, aggregateType: 'blueprint' }
    ));

    return blueprint;
  }

  async archiveBlueprint(id: string): Promise<void> {
    await this.updateBlueprint(id, { status: 'archived' });
  }

  async analyzeIntent(input: IntentAnalysisInput): Promise<IntentAnalysisResult> {
    const keywords = this.extractKeywords(input.naturalLanguagePrompt);
    const intents = this.identifyIntents(keywords, input.context);
    const domain = this.suggestDomain(keywords, input.context);
    const platform = this.suggestPlatform(keywords, input.context);
    const complexity = this.estimateComplexity(intents);

    const clarifications: IntentAnalysisResult['clarificationNeeded'] = [];

    if (!input.context?.industry) {
      clarifications.push({
        topic: 'industry',
        question: input.language === 'ar' 
          ? 'ما هو المجال أو الصناعة المستهدفة؟'
          : 'What industry or domain is this for?',
        options: ['E-commerce', 'SaaS', 'Healthcare', 'Education', 'Finance', 'Other'],
      });
    }

    if (!input.context?.targetAudience) {
      clarifications.push({
        topic: 'audience',
        question: input.language === 'ar'
          ? 'من هو الجمهور المستهدف؟'
          : 'Who is the target audience?',
        options: ['B2B', 'B2C', 'Internal', 'Mixed'],
      });
    }

    return {
      extractedIntents: intents,
      suggestedDomain: domain,
      suggestedPlatform: platform,
      suggestedConstraints: this.suggestConstraints(complexity),
      clarificationNeeded: clarifications,
      complexity,
      estimatedEffort: {
        hours: this.estimateHours(complexity),
        aiTokens: this.estimateTokens(complexity),
      },
    };
  }

  async validateBlueprint(blueprint: Blueprint): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const schemaValidation = BlueprintSchema.safeParse(blueprint);
    if (!schemaValidation.success) {
      for (const issue of schemaValidation.error.issues) {
        errors.push({
          field: issue.path.join('.'),
          code: 'SCHEMA_VALIDATION',
          message: issue.message,
          severity: 'error',
        });
      }
    }

    if (blueprint.intents.length === 0) {
      errors.push({
        field: 'intents',
        code: 'NO_INTENTS',
        message: 'Blueprint must have at least one intent',
        severity: 'error',
      });
    }

    if (blueprint.intents.length > 50) {
      warnings.push('Large number of intents may increase generation complexity');
    }

    const criticalIntents = blueprint.intents.filter(i => i.priority === 'critical');
    if (criticalIntents.length > 5) {
      warnings.push('Too many critical priority intents may affect planning');
    }

    const intentIds = new Set<string>();
    for (const intent of blueprint.intents) {
      if (intentIds.has(intent.id)) {
        errors.push({
          field: `intents.${intent.id}`,
          code: 'DUPLICATE_INTENT_ID',
          message: `Duplicate intent ID: ${intent.id}`,
          severity: 'error',
        });
      }
      intentIds.add(intent.id);
    }

    for (const intent of blueprint.intents) {
      if (intent.dependencies) {
        for (const dep of intent.dependencies) {
          if (!intentIds.has(dep)) {
            errors.push({
              field: `intents.${intent.id}.dependencies`,
              code: 'MISSING_DEPENDENCY',
              message: `Intent ${intent.id} depends on non-existent intent ${dep}`,
              severity: 'error',
            });
          }
        }
      }
    }

    if (!blueprint.outputs || blueprint.outputs.length === 0) {
      suggestions.push('Consider specifying output formats for better generation');
    }

    const validatedResult = await extensionRegistry.executeHooks(
      CORE_EXTENSION_POINTS.BLUEPRINT_VALIDATION,
      { blueprint, errors, warnings, suggestions },
      async (input) => input
    );

    return {
      valid: errors.length === 0,
      errors: (validatedResult as { errors: ValidationResult['errors'] }).errors || errors,
      warnings: (validatedResult as { warnings: string[] }).warnings || warnings,
      suggestions: (validatedResult as { suggestions: string[] }).suggestions || suggestions,
    };
  }

  async transformBlueprint(blueprint: Blueprint, target: TransformationTarget): Promise<Blueprint> {
    let transformed = { ...blueprint };

    switch (target) {
      case 'minimal':
        transformed = {
          ...transformed,
          intents: transformed.intents.filter(i => 
            i.priority === 'critical' || i.priority === 'high'
          ),
        };
        break;

      case 'mobile':
        transformed = {
          ...transformed,
          context: {
            ...transformed.context,
            targetPlatform: 'mobile',
          },
          constraints: [
            ...(transformed.constraints || []),
            {
              type: 'technical',
              description: 'Mobile-first responsive design',
              enforcementLevel: 'strict',
            },
            {
              type: 'performance',
              description: 'Optimize for mobile network conditions',
              enforcementLevel: 'strict',
            },
          ],
        };
        break;

      case 'api_only':
        transformed = {
          ...transformed,
          context: {
            ...transformed.context,
            targetPlatform: 'api',
          },
          outputs: [
            { type: 'api', format: 'openapi', destination: 'api-spec.yaml' },
            { type: 'code', format: 'typescript', destination: 'src/' },
          ],
        };
        break;

      case 'optimized':
        transformed = {
          ...transformed,
          constraints: [
            ...(transformed.constraints || []),
            {
              type: 'performance',
              description: 'Optimize for speed and efficiency',
              enforcementLevel: 'strict',
            },
          ],
        };
        break;
    }

    const finalResult = await extensionRegistry.executeHooks(
      CORE_EXTENSION_POINTS.BLUEPRINT_TRANSFORMATION,
      { blueprint: transformed, target },
      async (input) => (input as { blueprint: Blueprint }).blueprint
    );

    return finalResult as Blueprint;
  }

  private extractKeywords(prompt: string): string[] {
    const words = prompt.toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);

    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    return words.filter(w => !stopWords.has(w));
  }

  private identifyIntents(keywords: string[], context?: IntentAnalysisInput['context']): IntentAnalysisResult['extractedIntents'] {
    const intents: IntentAnalysisResult['extractedIntents'] = [];
    const keywordSet = new Set(keywords);

    const intentPatterns = [
      { keywords: ['login', 'auth', 'signin', 'signup', 'register'], type: 'feature' as const, description: 'User authentication system', priority: 'critical' as const },
      { keywords: ['dashboard', 'admin', 'panel', 'manage'], type: 'page' as const, description: 'Admin dashboard', priority: 'high' as const },
      { keywords: ['payment', 'checkout', 'cart', 'order'], type: 'feature' as const, description: 'E-commerce payment system', priority: 'critical' as const },
      { keywords: ['chat', 'message', 'notification'], type: 'feature' as const, description: 'Real-time messaging', priority: 'medium' as const },
      { keywords: ['profile', 'settings', 'account'], type: 'page' as const, description: 'User profile management', priority: 'medium' as const },
      { keywords: ['search', 'filter', 'find'], type: 'component' as const, description: 'Search functionality', priority: 'high' as const },
      { keywords: ['api', 'integrate', 'connect', 'webhook'], type: 'integration' as const, description: 'API integration', priority: 'high' as const },
      { keywords: ['report', 'analytics', 'chart', 'graph'], type: 'feature' as const, description: 'Analytics and reporting', priority: 'medium' as const },
    ];

    for (const pattern of intentPatterns) {
      const matchCount = pattern.keywords.filter(k => keywordSet.has(k)).length;
      if (matchCount > 0) {
        intents.push({
          id: crypto.randomUUID(),
          type: pattern.type,
          description: pattern.description,
          priority: pattern.priority,
          confidence: Math.min(0.9, 0.5 + matchCount * 0.2),
          keywords: pattern.keywords.filter(k => keywordSet.has(k)),
        });
      }
    }

    return intents;
  }

  private suggestDomain(keywords: string[], context?: IntentAnalysisInput['context']): string {
    if (context?.industry) return context.industry;

    const domainPatterns: Record<string, string[]> = {
      'e-commerce': ['shop', 'store', 'product', 'cart', 'checkout', 'payment'],
      'saas': ['subscription', 'dashboard', 'analytics', 'admin', 'manage'],
      'social': ['profile', 'feed', 'follow', 'post', 'share', 'like'],
      'education': ['course', 'learn', 'student', 'teacher', 'lesson'],
      'healthcare': ['patient', 'doctor', 'appointment', 'medical', 'health'],
    };

    let bestDomain = 'general';
    let bestScore = 0;

    for (const [domain, patterns] of Object.entries(domainPatterns)) {
      const score = patterns.filter(p => keywords.includes(p)).length;
      if (score > bestScore) {
        bestScore = score;
        bestDomain = domain;
      }
    }

    return bestDomain;
  }

  private suggestPlatform(keywords: string[], context?: IntentAnalysisInput['context']): Blueprint['context']['targetPlatform'] {
    const keywordSet = new Set(keywords);

    if (keywordSet.has('mobile') || keywordSet.has('app') || keywordSet.has('ios') || keywordSet.has('android')) {
      return 'mobile';
    }
    if (keywordSet.has('api') || keywordSet.has('backend') || keywordSet.has('service')) {
      return 'api';
    }
    if (keywordSet.has('desktop') || keywordSet.has('electron')) {
      return 'desktop';
    }

    return 'web';
  }

  private estimateComplexity(intents: IntentAnalysisResult['extractedIntents']): IntentAnalysisResult['complexity'] {
    const criticalCount = intents.filter(i => i.priority === 'critical').length;
    const total = intents.length;

    if (total <= 3 && criticalCount <= 1) return 'simple';
    if (total <= 8 && criticalCount <= 3) return 'moderate';
    if (total <= 20) return 'complex';
    return 'enterprise';
  }

  private suggestConstraints(complexity: IntentAnalysisResult['complexity']): Blueprint['constraints'] {
    const constraints: Blueprint['constraints'] = [];

    constraints.push({
      type: 'security',
      description: 'Follow security best practices',
      enforcementLevel: 'strict',
    });

    if (complexity === 'complex' || complexity === 'enterprise') {
      constraints.push({
        type: 'performance',
        description: 'Implement caching and optimization',
        enforcementLevel: 'strict',
      });
      constraints.push({
        type: 'technical',
        description: 'Use modular architecture',
        enforcementLevel: 'strict',
      });
    }

    return constraints;
  }

  private estimateHours(complexity: IntentAnalysisResult['complexity']): number {
    const estimates = { simple: 4, moderate: 16, complex: 40, enterprise: 120 };
    return estimates[complexity];
  }

  private estimateTokens(complexity: IntentAnalysisResult['complexity']): number {
    const estimates = { simple: 50000, moderate: 200000, complex: 500000, enterprise: 2000000 };
    return estimates[complexity];
  }

  private assessComplexity(blueprint: Blueprint): string {
    const intentsCount = blueprint.intents.length;
    const criticalCount = blueprint.intents.filter(i => i.priority === 'critical').length;

    if (intentsCount <= 3) return 'simple';
    if (intentsCount <= 10 && criticalCount <= 3) return 'moderate';
    if (intentsCount <= 25) return 'complex';
    return 'enterprise';
  }
}

export const blueprintSystem: IBlueprintSystem = new BlueprintSystemImpl();

eventBus.subscribe(EventTypes.BLUEPRINT_APPROVED, async (event: DomainEvent<BlueprintApprovedPayload>) => {
  console.log(`[BlueprintSystem] Blueprint ${event.payload.blueprintId} approved, triggering generation...`);
});
