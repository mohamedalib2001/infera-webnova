/**
 * INFERA WebNova - Platform Orchestrator
 * Real orchestration flows coordinating all core modules via events
 * 
 * This is the actual implementation that connects:
 * Blueprint → Code Generation → Runtime
 * All communication via Event Bus (Zero Coupling)
 */

import { eventBus, createEvent, EventTypes, type DomainEvent } from '../event-bus';
import { anthropicProvider, type IAIProvider, AnthropicProviderError } from '../providers/anthropic-provider';
import { extensionRegistry, CORE_EXTENSION_POINTS, type ScopedExtensionContext } from '../extension-registry';
import { postgresEventStore, postgresQueryStore } from '../persistence/postgres-event-store';
import { db } from '../../../server/db';
import { blueprints } from '../../schema';
import { eq, and } from 'drizzle-orm';
import type { Blueprint, GeneratedArtifact } from '../contracts';

export interface OrchestrationContext {
  tenantId: string;
  userId?: string;
  correlationId: string;
  language: 'ar' | 'en';
}

export interface GenerationRequest {
  blueprintId: string;
  context: OrchestrationContext;
  options?: {
    target?: 'web' | 'mobile' | 'api';
    optimize?: boolean;
    includeTests?: boolean;
  };
}

export interface GenerationResult {
  success: boolean;
  artifacts: GeneratedArtifact[];
  metrics: {
    duration: number;
    tokensUsed: number;
    filesGenerated: number;
  };
  errors?: string[];
}

export interface IPlatformOrchestrator {
  generateFromBlueprint(request: GenerationRequest): Promise<GenerationResult>;
  optimizePlatform(tenantId: string): Promise<void>;
  analyzeIntent(prompt: string, context: OrchestrationContext): Promise<Blueprint>;
  getOrchestrationStatus(correlationId: string): Promise<OrchestrationStatus>;
}

export interface OrchestrationStatus {
  correlationId: string;
  status: 'pending' | 'analyzing' | 'planning' | 'generating' | 'validating' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  logs: Array<{ timestamp: Date; message: string; level: string }>;
}

class PlatformOrchestratorImpl implements IPlatformOrchestrator {
  private aiProvider: IAIProvider;
  private orchestrationStates: Map<string, OrchestrationStatus> = new Map();
  private tokenUsage: Map<string, number> = new Map();

  constructor(aiProvider: IAIProvider) {
    this.aiProvider = aiProvider;
    this.setupEventHandlers();
    this.initializePersistence();
  }

  private async initializePersistence(): Promise<void> {
    try {
      await postgresEventStore.initialize();
      console.log('[Orchestrator] Persistence layer initialized');
    } catch (error) {
      console.error('[Orchestrator] Failed to initialize persistence:', error);
    }
  }

  private setupEventHandlers(): void {
    eventBus.subscribe(EventTypes.BLUEPRINT_APPROVED, async (event) => {
      const { blueprintId, tenantId } = event.payload as { blueprintId: string; tenantId: string };
      console.log(`[Orchestrator] Blueprint ${blueprintId} approved, starting generation flow...`);
      
      await this.generateFromBlueprint({
        blueprintId,
        context: {
          tenantId,
          correlationId: event.metadata.correlationId || crypto.randomUUID(),
          language: 'en',
        },
      });
    });

    eventBus.subscribe(EventTypes.GENERATION_FAILED, async (event) => {
      const { correlationId, error } = event.payload as { correlationId: string; error: string };
      console.error(`[Orchestrator] Generation failed for ${correlationId}: ${error}`);
      
      this.updateStatus(correlationId, 'failed', 0, `Failed: ${error}`);
    });

    eventBus.subscribe(EventTypes.RUNTIME_ERROR, async (event) => {
      const { tenantId, error } = event.payload as { tenantId: string; error: string };
      console.error(`[Orchestrator] Runtime error for tenant ${tenantId}: ${error}`);
      
      const analysis = await this.aiProvider.analyze({
        type: 'code',
        data: { error },
        context: 'Analyze this runtime error and suggest fixes',
      });
      
      await eventBus.publish(createEvent('orchestration.error.analyzed', {
        tenantId,
        originalError: error,
        analysis: analysis.analysis,
        recommendations: analysis.recommendations,
      }));
    });
  }

  async generateFromBlueprint(request: GenerationRequest): Promise<GenerationResult> {
    const { blueprintId, context, options } = request;
    const startTime = Date.now();
    const artifacts: GeneratedArtifact[] = [];
    const logs: OrchestrationStatus['logs'] = [];
    
    this.initializeStatus(context.correlationId);
    
    try {
      this.updateStatus(context.correlationId, 'analyzing', 10, 'Analyzing blueprint...');
      logs.push({ timestamp: new Date(), message: 'Starting blueprint analysis', level: 'info' });

      await eventBus.publish(createEvent(EventTypes.GENERATION_STARTED, {
        blueprintId,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
      }, { tenantId: context.tenantId, correlationId: context.correlationId }));

      const blueprint = await this.fetchBlueprint(blueprintId);
      if (!blueprint) {
        throw new Error(`Blueprint ${blueprintId} not found`);
      }

      const scopedContext: ScopedExtensionContext = extensionRegistry.createScopedContext(
        context.tenantId,
        { userId: context.userId }
      );

      const validatedBlueprint = await extensionRegistry.executeHooks(
        CORE_EXTENSION_POINTS.BLUEPRINT_VALIDATION,
        { blueprint, errors: [], warnings: [], suggestions: [] },
        async (input) => input,
        scopedContext
      );

      this.updateStatus(context.correlationId, 'planning', 30, 'Planning generation steps...');
      logs.push({ timestamp: new Date(), message: 'Blueprint validated, planning generation', level: 'info' });

      await eventBus.publish(createEvent(EventTypes.GENERATION_PROGRESS, {
        blueprintId,
        stage: 'planning',
        progress: 30,
      }, { tenantId: context.tenantId, correlationId: context.correlationId }));

      this.updateStatus(context.correlationId, 'generating', 50, 'Generating code...');
      logs.push({ timestamp: new Date(), message: 'Starting code generation', level: 'info' });

      const generatedCode = await this.generateCode(blueprint, context, options);
      
      for (const [filename, content] of Object.entries(generatedCode)) {
        const artifact: GeneratedArtifact = {
          id: crypto.randomUUID(),
          blueprintId,
          type: this.getArtifactType(filename),
          filename,
          content: content as string,
          language: this.getLanguageFromFilename(filename),
          metadata: {
            generatedAt: new Date(),
            generatedBy: 'anthropic-claude',
            version: '1.0',
            checksum: this.generateChecksum(content as string),
          },
        };
        artifacts.push(artifact);
      }

      await eventBus.publish(createEvent(EventTypes.GENERATION_PROGRESS, {
        blueprintId,
        stage: 'generated',
        progress: 70,
        artifactsCount: artifacts.length,
      }, { tenantId: context.tenantId, correlationId: context.correlationId }));

      this.updateStatus(context.correlationId, 'validating', 80, 'Validating generated code...');
      logs.push({ timestamp: new Date(), message: `Generated ${artifacts.length} artifacts, validating...`, level: 'info' });

      const postGenArtifacts = await extensionRegistry.executeHooks(
        CORE_EXTENSION_POINTS.CODE_GENERATION_POST,
        { artifacts },
        async (input) => (input as { artifacts: GeneratedArtifact[] }).artifacts,
        scopedContext
      );

      const validatedArtifacts = postGenArtifacts as unknown as GeneratedArtifact[];

      await eventBus.publish(createEvent(EventTypes.ARTIFACTS_READY, {
        blueprintId,
        artifacts: validatedArtifacts.map(a => ({ id: a.id, filename: a.filename, type: a.type })),
      }, { tenantId: context.tenantId, correlationId: context.correlationId }));

      this.updateStatus(context.correlationId, 'completed', 100, 'Generation completed successfully');
      logs.push({ timestamp: new Date(), message: 'Generation completed successfully', level: 'info' });

      const duration = Date.now() - startTime;
      
      await eventBus.publish(createEvent(EventTypes.GENERATION_COMPLETED, {
        blueprintId,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
        artifactsCount: validatedArtifacts.length,
        duration,
      }, { tenantId: context.tenantId, correlationId: context.correlationId }));

      const tokensUsed = this.tokenUsage.get(context.correlationId) || 0;
      this.tokenUsage.delete(context.correlationId);

      return {
        success: true,
        artifacts: validatedArtifacts,
        metrics: {
          duration,
          tokensUsed,
          filesGenerated: validatedArtifacts.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logs.push({ timestamp: new Date(), message: `Error: ${errorMessage}`, level: 'error' });
      
      this.updateStatus(context.correlationId, 'failed', 0, `Failed: ${errorMessage}`);

      await eventBus.publish(createEvent(EventTypes.GENERATION_FAILED, {
        blueprintId,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
        error: errorMessage,
      }, { tenantId: context.tenantId, correlationId: context.correlationId }));

      return {
        success: false,
        artifacts: [],
        metrics: {
          duration: Date.now() - startTime,
          tokensUsed: 0,
          filesGenerated: 0,
        },
        errors: [errorMessage],
      };
    }
  }

  async optimizePlatform(tenantId: string): Promise<void> {
    console.log(`[Orchestrator] Starting platform optimization for tenant ${tenantId}`);

    const events = await postgresEventStore.getEvents({ tenantId, limit: 1000 });
    const eventCounts = events.reduce((acc, e) => {
      acc[e.metadata.eventType] = (acc[e.metadata.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const metrics = {
      performance: {
        eventCount: events.length,
        eventTypeDistribution: eventCounts,
        avgEventsPerHour: events.length / 24,
      },
      resources: {
        cpuUtilization: process.cpuUsage().user / 1000000,
        memoryUtilization: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
      },
    };

    try {
      const analysis = await this.aiProvider.analyze({
        type: 'performance',
        data: metrics,
        context: 'Analyze platform metrics and suggest optimizations',
      });

      await postgresQueryStore.update('optimization-report', {
        id: `${tenantId}-${Date.now()}`,
        tenantId,
        recommendations: analysis.recommendations,
        insights: analysis.insights,
        analyzedAt: new Date().toISOString(),
      }, tenantId);

      await eventBus.publish(createEvent('orchestration.optimization.completed', {
        tenantId,
        recommendations: analysis.recommendations,
        insights: analysis.insights,
      }, { tenantId }));
    } catch (error) {
      console.error(`[Orchestrator] Optimization analysis failed for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  async analyzeIntent(prompt: string, context: OrchestrationContext): Promise<Blueprint> {
    console.log(`[Orchestrator] Analyzing intent for tenant ${context.tenantId}`);

    const intentResult = await this.aiProvider.extractIntent(prompt, context.language);

    const blueprint: Blueprint = {
      id: crypto.randomUUID(),
      tenantId: context.tenantId,
      name: `Generated Blueprint - ${new Date().toISOString().split('T')[0]}`,
      description: prompt,
      status: 'draft',
      intents: intentResult.intents.map((intent, index) => ({
        id: `intent-${index}`,
        type: intent.type as Blueprint['intents'][0]['type'],
        description: intent.description,
        priority: intent.priority as Blueprint['intents'][0]['priority'],
        acceptanceCriteria: [],
      })),
      context: {
        domain: intentResult.domain,
        targetPlatform: 'web',
        requirements: [],
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: context.userId || 'system',
      },
    };

    await eventBus.publish(createEvent(EventTypes.BLUEPRINT_DRAFTED, {
      blueprintId: blueprint.id,
      tenantId: context.tenantId,
      name: blueprint.name,
      domain: blueprint.context.domain,
      intentsCount: blueprint.intents.length,
      complexity: intentResult.complexity,
    }, { tenantId: context.tenantId, correlationId: context.correlationId }));

    return blueprint;
  }

  async getOrchestrationStatus(correlationId: string): Promise<OrchestrationStatus> {
    return this.orchestrationStates.get(correlationId) || {
      correlationId,
      status: 'pending',
      progress: 0,
      currentStep: 'Not started',
      logs: [],
    };
  }

  private initializeStatus(correlationId: string): void {
    this.orchestrationStates.set(correlationId, {
      correlationId,
      status: 'pending',
      progress: 0,
      currentStep: 'Initializing...',
      logs: [],
    });
  }

  private updateStatus(
    correlationId: string,
    status: OrchestrationStatus['status'],
    progress: number,
    currentStep: string
  ): void {
    const existing = this.orchestrationStates.get(correlationId);
    if (existing) {
      existing.status = status;
      existing.progress = progress;
      existing.currentStep = currentStep;
      existing.logs.push({ timestamp: new Date(), message: currentStep, level: 'info' });
    }
  }

  private async fetchBlueprint(blueprintId: string): Promise<Blueprint | null> {
    const result = await db
      .select()
      .from(blueprints)
      .where(eq(blueprints.id, blueprintId))
      .limit(1);

    if (result.length === 0) {
      console.log(`[Orchestrator] Blueprint ${blueprintId} not found in database`);
      return null;
    }

    const row = result[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      description: row.description || undefined,
      status: row.status as Blueprint['status'],
      intents: (row.intents || []).map((intent: {
        id: string;
        type: string;
        description: string;
        priority: string;
        dependencies?: string[];
        acceptanceCriteria?: string[];
      }) => ({
        id: intent.id,
        type: intent.type as Blueprint['intents'][0]['type'],
        description: intent.description,
        priority: intent.priority as Blueprint['intents'][0]['priority'],
        dependencies: intent.dependencies || [],
        acceptanceCriteria: intent.acceptanceCriteria || [],
      })),
      context: {
        domain: row.contextDomain || 'general',
        targetPlatform: (row.contextPlatform || 'web') as 'web' | 'mobile' | 'api' | 'cli',
        requirements: (row.contextRequirements || []) as string[],
      },
      constraints: (row.constraints || []) as Blueprint['constraints'],
      outputs: (row.outputs || []) as Blueprint['outputs'],
      metadata: {
        createdAt: row.createdAt || new Date(),
        updatedAt: row.updatedAt || new Date(),
        createdBy: row.metadata?.createdBy,
        approvedBy: row.metadata?.approvedBy,
        version: row.metadata?.version || 1,
      },
    };
  }

  private trackTokens(correlationId: string, tokens: number): void {
    const current = this.tokenUsage.get(correlationId) || 0;
    this.tokenUsage.set(correlationId, current + tokens);
  }

  private async generateCode(
    blueprint: Blueprint,
    context: OrchestrationContext,
    options?: GenerationRequest['options']
  ): Promise<Record<string, string>> {
    const files: Record<string, string> = {};

    const structurePrompt = `Generate the project structure for a ${blueprint.context.targetPlatform} application with these features: ${blueprint.intents.map(i => i.description).join(', ')}. Return only the main entry file code.`;
    
    try {
      const { code: mainCode } = await this.aiProvider.generateCode(structurePrompt, 'typescript');
      files['src/index.ts'] = mainCode;
    } catch (error) {
      if (error instanceof AnthropicProviderError) {
        console.error(`[Orchestrator] Code generation failed: ${error.code}`, error.details);
        throw new Error(`Failed to generate main structure: ${error.message}`);
      }
      throw error;
    }

    for (const intent of blueprint.intents) {
      try {
        if (intent.type === 'page') {
          const { code: pageCode } = await this.aiProvider.generateCode(
            `Generate a React component for: ${intent.description}`,
            'tsx'
          );
          files[`src/pages/${intent.id}.tsx`] = pageCode;
        } else if (intent.type === 'feature') {
          const { code: featureCode } = await this.aiProvider.generateCode(
            `Generate a service/utility for: ${intent.description}`,
            'typescript'
          );
          files[`src/features/${intent.id}.ts`] = featureCode;
        }
      } catch (error) {
        console.error(`[Orchestrator] Failed to generate ${intent.type} for ${intent.id}:`, error);
      }
    }

    if (options?.includeTests) {
      for (const intent of blueprint.intents) {
        try {
          const { code: testCode } = await this.aiProvider.generateCode(
            `Generate tests for: ${intent.description}`,
            'typescript'
          );
          files[`tests/${intent.id}.test.ts`] = testCode;
        } catch (error) {
          console.error(`[Orchestrator] Failed to generate test for ${intent.id}:`, error);
        }
      }
    }

    return files;
  }

  private getArtifactType(filename: string): GeneratedArtifact['type'] {
    if (filename.endsWith('.tsx') || filename.endsWith('.jsx')) return 'component';
    if (filename.endsWith('.ts') || filename.endsWith('.js')) return 'service';
    if (filename.endsWith('.css') || filename.endsWith('.scss')) return 'stylesheet';
    if (filename.endsWith('.html')) return 'template';
    return 'code';
  }

  private getLanguageFromFilename(filename: string): string {
    const ext = filename.split('.').pop() || '';
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      css: 'css',
      scss: 'scss',
      html: 'html',
      json: 'json',
    };
    return languageMap[ext] || 'text';
  }

  private generateChecksum(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
}

export const platformOrchestrator: IPlatformOrchestrator = new PlatformOrchestratorImpl(anthropicProvider);
