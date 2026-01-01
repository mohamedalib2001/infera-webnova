/**
 * Dynamic AI Execution Layer for Infra Web Nova
 * طبقة تنفيذ الذكاء الاصطناعي الديناميكية
 * 
 * CORE PRINCIPLES (NON-NEGOTIABLE):
 * 1. NO hardcoded models in any page, chat, or service
 * 2. ALL AI execution resolved dynamically at runtime
 * 3. Provider abstraction layer for extensibility
 * 4. Owner-controlled via database only
 */

import { db } from "./db";
import { 
  aiModels, 
  aiServiceConfigs, 
  aiGlobalSettings,
  type AiModel, 
  type AiServiceConfig,
  type AiGlobalSettings,
} from "@shared/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { 
  AIModelRegistry, 
  type ModelCallPayload, 
  type ModelCallResponse 
} from "./ai-model-registry";

// ==================== AI EXECUTION MODES ====================

export type AIMode = 'auto' | 'manual' | 'disabled';
export type ServiceType = 'chat' | 'assistant' | 'analysis' | 'automation' | 'system';
export type PerformanceMode = 'speed' | 'balanced' | 'quality';
export type CostSensitivity = 'low' | 'medium' | 'high';

// ==================== RUNTIME CONTEXT ====================

export interface AIExecutionContext {
  serviceId: string;
  serviceName: string;
  serviceType: ServiceType;
  aiMode: AIMode;
  activeModel: AiModel | null;
  fallbackModel: AiModel | null;
  provider: string;
  providerDisplayName: string;
  isEnabled: boolean;
  systemPrompt?: string;
  maxTokens: number;
  temperature: number;
}

export interface AIStatusInfo {
  serviceId: string;
  displayName: string;
  displayNameAr: string;
  aiMode: AIMode;
  modelName: string;
  modelNameAr: string;
  modelType: string; // e.g., "Reasoning", "Code", "Vision"
  provider: string;
  providerIcon: string;
  isFallbackActive: boolean;
  isEnabled: boolean;
  statusLabel: string; // "Powered by Claude Sonnet 4 • ModelFarm • Auto Mode"
  statusLabelAr: string;
}

// ==================== SMART MODEL SELECTOR ====================

interface ModelScore {
  model: AiModel;
  score: number;
  reasons: string[];
}

class SmartModelSelector {
  /**
   * Auto Mode: Intelligently select the best model based on:
   * - Service type
   * - Required capabilities
   * - Performance mode (speed/balanced/quality)
   * - Cost sensitivity
   * - Provider health
   */
  async selectBestModel(
    serviceConfig: AiServiceConfig,
    availableModels: AiModel[]
  ): Promise<AiModel | null> {
    if (availableModels.length === 0) return null;
    
    const requiredCaps = (serviceConfig.requiredCapabilities as string[]) || [];
    const preferredCaps = (serviceConfig.preferredCapabilities as string[]) || [];
    const performanceMode = (serviceConfig.performanceMode as PerformanceMode) || 'balanced';
    const costSensitivity = (serviceConfig.costSensitivity as CostSensitivity) || 'medium';

    const scoredModels: ModelScore[] = [];

    for (const model of availableModels) {
      if (!model.isActive) continue;
      
      const modelCaps = (model.capabilities as string[]) || [];
      let score = 0;
      const reasons: string[] = [];

      // Check required capabilities (must have all)
      const hasAllRequired = requiredCaps.every(cap => modelCaps.includes(cap));
      if (!hasAllRequired && requiredCaps.length > 0) continue;

      // Score for having required capabilities
      score += requiredCaps.length * 20;
      if (requiredCaps.length > 0) reasons.push('Has required capabilities');

      // Score for preferred capabilities
      const preferredMatches = preferredCaps.filter(cap => modelCaps.includes(cap)).length;
      score += preferredMatches * 10;
      if (preferredMatches > 0) reasons.push(`${preferredMatches} preferred capabilities`);

      // Performance mode scoring
      const latency = 1000; // Default latency estimate
      const contextWindow = model.contextWindow || 32000;
      
      switch (performanceMode) {
        case 'speed':
          score += Math.max(0, 50 - (latency / 100)); // Lower latency = higher score
          if (latency < 500) reasons.push('Fast response');
          break;
        case 'quality':
          score += Math.min(50, contextWindow / 10000); // Larger context = higher quality
          if (modelCaps.includes('reasoning')) {
            score += 30;
            reasons.push('Reasoning capability');
          }
          break;
        case 'balanced':
        default:
          score += 25 - (latency / 200) + (contextWindow / 20000);
          break;
      }

      // Cost sensitivity scoring
      const inputCost = model.inputCostPer1M || 0;
      const outputCost = model.outputCostPer1M || 0;
      const totalCost = inputCost + outputCost;

      switch (costSensitivity) {
        case 'high':
          score += Math.max(0, 50 - totalCost); // Lower cost = higher score
          if (totalCost < 5) reasons.push('Low cost');
          break;
        case 'low':
          // Don't penalize cost much - focus on capability
          score += 10;
          break;
        case 'medium':
        default:
          score += Math.max(0, 25 - (totalCost / 2));
          break;
      }

      // Bonus for default model
      if (model.isDefault) {
        score += 15;
        reasons.push('Default model');
      }

      // Provider reliability bonus (replit has multi-provider routing)
      if (model.provider === 'replit') {
        score += 5;
        reasons.push('Multi-provider routing');
      }

      scoredModels.push({ model, score, reasons });
    }

    // Sort by score descending
    scoredModels.sort((a, b) => b.score - a.score);

    return scoredModels[0]?.model || null;
  }
}

// ==================== AI EXECUTION LAYER ====================

class AIExecutionLayer {
  private static instance: AIExecutionLayer;
  private smartSelector: SmartModelSelector;
  private registry: AIModelRegistry;
  private serviceCache: Map<string, AiServiceConfig> = new Map();
  private modelCache: Map<string, AiModel> = new Map();
  private globalSettings: AiGlobalSettings | null = null;
  private lastCacheRefresh: number = 0;
  private cacheTtl = 30000; // 30 second cache

  private constructor() {
    this.smartSelector = new SmartModelSelector();
    this.registry = AIModelRegistry.getInstance();
  }

  static getInstance(): AIExecutionLayer {
    if (!AIExecutionLayer.instance) {
      AIExecutionLayer.instance = new AIExecutionLayer();
    }
    return AIExecutionLayer.instance;
  }

  // ==================== CACHE MANAGEMENT ====================

  private async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCacheRefresh < this.cacheTtl) return;

    // Refresh services cache
    const services = await db.select().from(aiServiceConfigs);
    this.serviceCache.clear();
    for (const service of services) {
      this.serviceCache.set(service.serviceName, service);
    }

    // Refresh models cache
    const models = await db.select().from(aiModels).where(eq(aiModels.isActive, true));
    this.modelCache.clear();
    for (const model of models) {
      this.modelCache.set(model.modelId, model);
    }

    // Refresh global settings
    const [settings] = await db.select().from(aiGlobalSettings).limit(1);
    this.globalSettings = settings || null;

    this.lastCacheRefresh = now;
  }

  // ==================== SERVICE RESOLUTION ====================

  /**
   * Get service configuration by serviceId or path
   */
  async getServiceConfig(serviceIdOrPath: string): Promise<AiServiceConfig | null> {
    await this.refreshCacheIfNeeded();
    
    // Try by serviceName first
    let service = this.serviceCache.get(serviceIdOrPath);
    if (service) return service;

    // Try by sidebarPath
    for (const [, svc] of this.serviceCache) {
      if (svc.sidebarPath === serviceIdOrPath) {
        return svc;
      }
    }

    // Fallback to database query
    const [dbService] = await db
      .select()
      .from(aiServiceConfigs)
      .where(eq(aiServiceConfigs.serviceName, serviceIdOrPath))
      .limit(1);
    
    return dbService || null;
  }

  /**
   * Get all registered services for sidebar/navigation
   */
  async getAllServices(): Promise<AiServiceConfig[]> {
    await this.refreshCacheIfNeeded();
    const services: AiServiceConfig[] = [];
    this.serviceCache.forEach(s => {
      if (s.isVisible) services.push(s);
    });
    return services.sort((a, b) => (a.sortOrder || 50) - (b.sortOrder || 50));
  }

  // ==================== RUNTIME MODEL RESOLUTION ====================

  /**
   * Resolve execution context for a service
   * This is called at page/chat load time to get AI status
   */
  async resolveExecutionContext(serviceId: string): Promise<AIExecutionContext | null> {
    const serviceConfig = await this.getServiceConfig(serviceId);
    if (!serviceConfig) return null;

    const aiMode = (serviceConfig.aiMode as AIMode) || 'auto';
    const isEnabled = serviceConfig.isEnabled;

    // If disabled, return minimal context
    if (aiMode === 'disabled' || !isEnabled) {
      return {
        serviceId: serviceConfig.serviceName,
        serviceName: serviceConfig.displayName,
        serviceType: (serviceConfig.serviceType as ServiceType) || 'chat',
        aiMode: 'disabled',
        activeModel: null,
        fallbackModel: null,
        provider: '',
        providerDisplayName: '',
        isEnabled: false,
        maxTokens: 0,
        temperature: 0.7,
      };
    }

    // Get available models
    await this.refreshCacheIfNeeded();
    const availableModels = Array.from(this.modelCache.values());

    let activeModel: AiModel | null = null;
    let fallbackModel: AiModel | null = null;

    // Manual mode: use explicitly assigned model
    if (aiMode === 'manual') {
      if (serviceConfig.primaryModelId) {
        activeModel = this.modelCache.get(serviceConfig.primaryModelId) || null;
      }
      if (serviceConfig.fallbackModelId) {
        fallbackModel = this.modelCache.get(serviceConfig.fallbackModelId) || null;
      }
    }
    
    // Auto mode: smart selection
    if (aiMode === 'auto' || !activeModel) {
      activeModel = await this.smartSelector.selectBestModel(serviceConfig, availableModels);
      
      // Get fallback (different from primary)
      const remainingModels = availableModels.filter(m => m.modelId !== activeModel?.modelId);
      if (remainingModels.length > 0) {
        fallbackModel = await this.smartSelector.selectBestModel(serviceConfig, remainingModels);
      }
    }

    // If still no model, try global default
    if (!activeModel && this.globalSettings?.globalDefaultModelId) {
      activeModel = this.modelCache.get(this.globalSettings.globalDefaultModelId) || null;
    }

    return {
      serviceId: serviceConfig.serviceName,
      serviceName: serviceConfig.displayName,
      serviceType: (serviceConfig.serviceType as ServiceType) || 'chat',
      aiMode,
      activeModel,
      fallbackModel,
      provider: activeModel?.provider || 'replit',
      providerDisplayName: this.getProviderDisplayName(activeModel?.provider || ''),
      isEnabled: !!activeModel,
      systemPrompt: serviceConfig.systemPrompt || undefined,
      maxTokens: serviceConfig.maxOutputTokens || 4096,
      temperature: serviceConfig.temperature || 0.7,
    };
  }

  /**
   * Get AI status info for UI display
   */
  async getAIStatusInfo(serviceId: string, language: 'en' | 'ar' = 'en'): Promise<AIStatusInfo | null> {
    const context = await this.resolveExecutionContext(serviceId);
    if (!context) return null;

    const serviceConfig = await this.getServiceConfig(serviceId);
    if (!serviceConfig) return null;

    const model = context.activeModel;
    const modelCaps = (model?.capabilities as string[]) || [];
    
    // Determine model type label
    let modelType = 'General';
    if (modelCaps.includes('reasoning')) modelType = language === 'ar' ? 'استدلال' : 'Reasoning';
    else if (modelCaps.includes('code')) modelType = language === 'ar' ? 'برمجة' : 'Code';
    else if (modelCaps.includes('vision')) modelType = language === 'ar' ? 'رؤية' : 'Vision';

    // Build status label
    const modeLabel = context.aiMode === 'auto' 
      ? (language === 'ar' ? 'تلقائي' : 'Auto')
      : context.aiMode === 'manual'
      ? (language === 'ar' ? 'يدوي' : 'Manual')
      : (language === 'ar' ? 'معطل' : 'Disabled');

    const modelName = language === 'ar' && model?.nameAr ? model.nameAr : (model?.name || 'No Model');
    const providerName = this.getProviderDisplayName(context.provider);

    const statusLabel = context.aiMode === 'disabled'
      ? (language === 'ar' ? 'الذكاء الاصطناعي معطل' : 'AI Disabled')
      : `${modelName} • ${providerName} • ${modeLabel}`;

    const statusLabelAr = context.aiMode === 'disabled'
      ? 'الذكاء الاصطناعي معطل'
      : `${model?.nameAr || model?.name || 'لا يوجد'} • ${providerName} • ${modeLabel}`;

    return {
      serviceId: context.serviceId,
      displayName: serviceConfig.displayName,
      displayNameAr: serviceConfig.displayNameAr || serviceConfig.displayName,
      aiMode: context.aiMode,
      modelName,
      modelNameAr: model?.nameAr || model?.name || '',
      modelType,
      provider: context.provider,
      providerIcon: this.getProviderIcon(context.provider),
      isFallbackActive: false, // Will be set during execution if fallback is used
      isEnabled: context.isEnabled,
      statusLabel,
      statusLabelAr,
    };
  }

  // ==================== AI EXECUTION ====================

  /**
   * Execute AI call for a service
   * This is the ONLY entry point for AI calls in the system
   */
  async executeAI(
    serviceId: string,
    messages: Array<{ role: string; content: string }>,
    options?: {
      overrideSystemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ModelCallResponse & { usedModel?: AiModel; usedFallback?: boolean }> {
    // Check kill switch
    if (this.globalSettings?.emergencyKillSwitch) {
      return {
        success: false,
        error: 'AI services are disabled | خدمات الذكاء الاصطناعي معطلة',
      };
    }

    // Get execution context
    const context = await this.resolveExecutionContext(serviceId);
    if (!context) {
      return {
        success: false,
        error: `Service not found: ${serviceId} | الخدمة غير موجودة`,
      };
    }

    if (context.aiMode === 'disabled' || !context.isEnabled) {
      return {
        success: false,
        error: 'AI is disabled for this service | الذكاء الاصطناعي معطل لهذه الخدمة',
      };
    }

    if (!context.activeModel) {
      return {
        success: false,
        error: 'No AI model available | لا يوجد نموذج متاح',
      };
    }

    // Build payload
    const payload: Omit<ModelCallPayload, 'providerModelName'> = {
      messages,
      maxTokens: options?.maxTokens || context.maxTokens,
      temperature: options?.temperature || context.temperature,
      systemPrompt: options?.overrideSystemPrompt || context.systemPrompt,
    };

    // Execute with primary model
    let response = await this.registry.callModel(serviceId, payload, {
      preferredModelId: context.activeModel.modelId,
    });

    // If failed and fallback available, try fallback
    if (!response.success && context.fallbackModel) {
      response = await this.registry.callModel(serviceId, payload, {
        preferredModelId: context.fallbackModel.modelId,
      });
      
      return {
        ...response,
        usedModel: context.fallbackModel,
        usedFallback: true,
      };
    }

    return {
      ...response,
      usedModel: context.activeModel,
      usedFallback: false,
    };
  }

  // ==================== HELPER METHODS ====================

  private getProviderDisplayName(provider: string): string {
    const names: Record<string, string> = {
      'replit': 'ModelFarm',
      'anthropic': 'Anthropic',
      'openai': 'OpenAI',
      'google': 'Google AI',
      'meta': 'Meta AI',
      'mistral': 'Mistral',
    };
    return names[provider] || provider;
  }

  private getProviderIcon(provider: string): string {
    const icons: Record<string, string> = {
      'replit': 'SiReplit',
      'anthropic': 'Brain',
      'openai': 'Bot',
      'google': 'SiGoogle',
      'meta': 'SiMeta',
      'mistral': 'Sparkles',
    };
    return icons[provider] || 'Bot';
  }

  // ==================== SERVICE MANAGEMENT (Owner Only) ====================

  async createService(data: Partial<AiServiceConfig>): Promise<AiServiceConfig> {
    const [service] = await db.insert(aiServiceConfigs).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning();
    
    this.serviceCache.set(service.serviceName, service);
    return service;
  }

  async updateService(serviceName: string, data: Partial<AiServiceConfig>): Promise<AiServiceConfig | null> {
    const [service] = await db
      .update(aiServiceConfigs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiServiceConfigs.serviceName, serviceName))
      .returning();
    
    if (service) {
      this.serviceCache.set(service.serviceName, service);
    }
    return service || null;
  }

  async deleteService(serviceName: string): Promise<boolean> {
    const result = await db
      .delete(aiServiceConfigs)
      .where(eq(aiServiceConfigs.serviceName, serviceName));
    
    this.serviceCache.delete(serviceName);
    return true;
  }

  async updateServiceMode(serviceName: string, aiMode: AIMode): Promise<AiServiceConfig | null> {
    return this.updateService(serviceName, { aiMode });
  }

  async initializeDefaultServices(): Promise<AiServiceConfig[]> {
    const defaultServices = [
      {
        serviceName: 'chat',
        displayName: 'AI Chat',
        displayNameAr: 'محادثة الذكاء الاصطناعي',
        description: 'Main chat interface for AI interactions',
        descriptionAr: 'واجهة المحادثة الرئيسية للتفاعل مع الذكاء الاصطناعي',
        serviceType: 'chat' as ServiceType,
        aiMode: 'auto' as AIMode,
        sidebarPath: '/chat',
        icon: 'MessageSquare',
        preferredCapabilities: ['chat', 'reasoning'],
        requiredCapabilities: ['chat'],
        performanceMode: 'balanced' as PerformanceMode,
        costSensitivity: 'medium' as CostSensitivity,
        isEnabled: true,
        isVisible: true,
      },
      {
        serviceName: 'code_assistant',
        displayName: 'Code Assistant',
        displayNameAr: 'مساعد البرمجة',
        description: 'AI-powered code generation and assistance',
        descriptionAr: 'مساعدة وإنشاء الكود بالذكاء الاصطناعي',
        serviceType: 'assistant' as ServiceType,
        aiMode: 'auto' as AIMode,
        sidebarPath: '/builder',
        icon: 'Code',
        preferredCapabilities: ['code', 'reasoning'],
        requiredCapabilities: ['code'],
        performanceMode: 'quality' as PerformanceMode,
        costSensitivity: 'low' as CostSensitivity,
        isEnabled: true,
        isVisible: true,
      },
      {
        serviceName: 'platform_generator',
        displayName: 'Platform Generator',
        displayNameAr: 'مولد المنصات',
        description: 'Generate complete digital platforms',
        descriptionAr: 'إنشاء منصات رقمية كاملة',
        serviceType: 'automation' as ServiceType,
        aiMode: 'auto' as AIMode,
        sidebarPath: '/generator',
        icon: 'Layers',
        preferredCapabilities: ['code', 'reasoning', 'json_mode'],
        requiredCapabilities: ['code'],
        performanceMode: 'quality' as PerformanceMode,
        costSensitivity: 'low' as CostSensitivity,
        isEnabled: true,
        isVisible: true,
      },
      {
        serviceName: 'analytics_assistant',
        displayName: 'Analytics Assistant',
        displayNameAr: 'مساعد التحليلات',
        description: 'AI-powered data analysis and insights',
        descriptionAr: 'تحليل البيانات والرؤى بالذكاء الاصطناعي',
        serviceType: 'analysis' as ServiceType,
        aiMode: 'auto' as AIMode,
        sidebarPath: '/analytics',
        icon: 'BarChart',
        preferredCapabilities: ['reasoning', 'chat'],
        requiredCapabilities: ['chat'],
        performanceMode: 'balanced' as PerformanceMode,
        costSensitivity: 'medium' as CostSensitivity,
        isEnabled: true,
        isVisible: true,
      },
      {
        serviceName: 'system_ai',
        displayName: 'System AI',
        displayNameAr: 'ذكاء النظام',
        description: 'Background AI for system automation',
        descriptionAr: 'الذكاء الاصطناعي للأتمتة في الخلفية',
        serviceType: 'system' as ServiceType,
        aiMode: 'auto' as AIMode,
        sidebarPath: null,
        icon: 'Settings',
        preferredCapabilities: ['chat', 'json_mode'],
        requiredCapabilities: ['chat'],
        performanceMode: 'speed' as PerformanceMode,
        costSensitivity: 'high' as CostSensitivity,
        isEnabled: true,
        isVisible: false,
      },
    ];

    const createdServices: AiServiceConfig[] = [];

    for (const service of defaultServices) {
      // Check if service already exists
      const existing = await db.query.aiServiceConfigs.findFirst({
        where: eq(aiServiceConfigs.serviceName, service.serviceName),
      });

      if (!existing) {
        const created = await this.createService(service as any);
        createdServices.push(created);
      }
    }

    // Refresh cache
    this.clearCache();
    await this.refreshCacheIfNeeded();

    return createdServices;
  }

  // ==================== VALIDATION ====================

  async validateSystem(): Promise<{ ready: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    await this.refreshCacheIfNeeded();

    // Check if kill switch is active
    if (this.globalSettings?.emergencyKillSwitch) {
      errors.push('Emergency kill switch is active');
    }

    // Check for active models
    if (this.modelCache.size === 0) {
      errors.push('No active AI models configured');
    }

    // Check services with manual mode have valid models
    this.serviceCache.forEach((service) => {
      if (service.aiMode === 'manual' && service.isEnabled) {
        if (!service.primaryModelId) {
          errors.push(`Service "${service.displayName}" is in manual mode without a primary model`);
        } else if (!this.modelCache.has(service.primaryModelId)) {
          errors.push(`Service "${service.displayName}" references non-existent model: ${service.primaryModelId}`);
        }
      }
    });

    return {
      ready: errors.length === 0,
      errors,
    };
  }

  clearCache(): void {
    this.serviceCache.clear();
    this.modelCache.clear();
    this.globalSettings = null;
    this.lastCacheRefresh = 0;
  }
}

// Export singleton instance
export const aiExecutionLayer = AIExecutionLayer.getInstance();
export { AIExecutionLayer };
