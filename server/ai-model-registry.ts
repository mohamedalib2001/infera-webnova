/**
 * AI Model Registry - Dynamic Model Management System
 * سجل نماذج الذكاء الاصطناعي - نظام إدارة النماذج الديناميكي
 * 
 * CORE PRINCIPLES:
 * 1. NO hardcoded model names in services
 * 2. All model resolution through this registry
 * 3. Owner-controlled via database
 * 4. Provider abstraction layer for future extensibility
 */

import { db } from "./db";
import { 
  aiModels, 
  aiServiceConfigs, 
  aiGlobalSettings,
  aiProviderAdapters,
  type AiModel, 
  type AiServiceConfig,
  type AiGlobalSettings,
  type AiProviderAdapter
} from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";

// ==================== PROVIDER ADAPTERS ====================
// Abstract interface for AI providers - allows swapping providers without changing core logic

export interface AIProviderAdapterInterface {
  providerKey: string;
  
  // Core method to call a model
  callModel(payload: ModelCallPayload): Promise<ModelCallResponse>;
  
  // Health check
  healthCheck(): Promise<boolean>;
  
  // Validate model name
  validateModelName(modelName: string): Promise<boolean>;
  
  // List available models from provider
  listAvailableModels?(): Promise<ProviderModelInfo[]>;
}

export interface ModelCallPayload {
  providerModelName: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stream?: boolean;
}

export interface ModelCallResponse {
  success: boolean;
  content?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  error?: string;
  latencyMs?: number;
}

export interface ProviderModelInfo {
  modelId: string;
  displayName: string;
  capabilities: string[];
  maxTokens?: number;
  contextWindow?: number;
}

// ==================== REPLIT ADAPTER ====================
// Initial provider adapter - can be replaced without changing core logic

export class ReplitAdapter implements AIProviderAdapterInterface {
  providerKey = 'replit';
  
  async callModel(payload: ModelCallPayload): Promise<ModelCallResponse> {
    const startTime = Date.now();
    
    try {
      // Use Replit AI via OpenAI-compatible endpoint
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({
        apiKey: process.env.REPLIT_AI_API_KEY || 'dummy',
        baseURL: 'https://ai.replit.com/v1',
      });

      const messages: any[] = [];
      if (payload.systemPrompt) {
        messages.push({ role: 'system', content: payload.systemPrompt });
      }
      messages.push(...payload.messages);

      const response = await openai.chat.completions.create({
        model: payload.providerModelName,
        messages,
        max_tokens: payload.maxTokens || 4096,
        temperature: payload.temperature ?? 0.7,
      });

      const latencyMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        content,
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        latencyMs,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Replit API call failed',
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - try to list models or make minimal call
      return true; // Assume healthy if no errors during initialization
    } catch {
      return false;
    }
  }

  async validateModelName(modelName: string): Promise<boolean> {
    // Replit model names follow pattern: provider/model-name
    const validPatterns = [
      /^anthropic\/.+$/,
      /^openai\/.+$/,
      /^google\/.+$/,
      /^meta\/.+$/,
      /^mistral\/.+$/,
    ];
    return validPatterns.some(pattern => pattern.test(modelName));
  }

  async listAvailableModels(): Promise<ProviderModelInfo[]> {
    // Return known Replit-supported models
    return [
      { modelId: 'anthropic/claude-sonnet-4', displayName: 'Claude Sonnet 4', capabilities: ['chat', 'code', 'reasoning'], maxTokens: 8192, contextWindow: 200000 },
      { modelId: 'anthropic/claude-3-5-sonnet', displayName: 'Claude 3.5 Sonnet', capabilities: ['chat', 'code', 'reasoning'], maxTokens: 8192, contextWindow: 200000 },
      { modelId: 'openai/gpt-4o', displayName: 'GPT-4o', capabilities: ['chat', 'code', 'vision'], maxTokens: 4096, contextWindow: 128000 },
      { modelId: 'openai/gpt-4o-mini', displayName: 'GPT-4o Mini', capabilities: ['chat', 'code'], maxTokens: 4096, contextWindow: 128000 },
      { modelId: 'google/gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', capabilities: ['chat', 'code'], maxTokens: 8192, contextWindow: 1000000 },
      { modelId: 'meta/llama-3.3-70b', displayName: 'Llama 3.3 70B', capabilities: ['chat', 'code'], maxTokens: 4096, contextWindow: 128000 },
    ];
  }
}

// ==================== ANTHROPIC ADAPTER ====================

export class AnthropicAdapter implements AIProviderAdapterInterface {
  providerKey = 'anthropic';
  
  async callModel(payload: ModelCallPayload): Promise<ModelCallResponse> {
    const startTime = Date.now();
    
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await client.messages.create({
        model: payload.providerModelName,
        max_tokens: payload.maxTokens || 4096,
        system: payload.systemPrompt,
        messages: payload.messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      });

      const latencyMs = Date.now() - startTime;
      const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
      
      return {
        success: true,
        content,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        latencyMs,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Anthropic API call failed',
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  async validateModelName(modelName: string): Promise<boolean> {
    const validModels = [
      'claude-sonnet-4-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-haiku-20240307',
    ];
    return validModels.includes(modelName) || modelName.startsWith('claude-');
  }

  async listAvailableModels(): Promise<ProviderModelInfo[]> {
    return [
      { modelId: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4', capabilities: ['chat', 'code', 'reasoning', 'vision'], maxTokens: 8192, contextWindow: 200000 },
      { modelId: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet', capabilities: ['chat', 'code', 'reasoning', 'vision'], maxTokens: 8192, contextWindow: 200000 },
    ];
  }
}

// ==================== OPENAI ADAPTER ====================

export class OpenAIAdapter implements AIProviderAdapterInterface {
  providerKey = 'openai';
  
  async callModel(payload: ModelCallPayload): Promise<ModelCallResponse> {
    const startTime = Date.now();
    
    try {
      const OpenAI = (await import('openai')).default;
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const messages: any[] = [];
      if (payload.systemPrompt) {
        messages.push({ role: 'system', content: payload.systemPrompt });
      }
      messages.push(...payload.messages);

      const response = await client.chat.completions.create({
        model: payload.providerModelName,
        messages,
        max_tokens: payload.maxTokens || 4096,
        temperature: payload.temperature ?? 0.7,
      });

      const latencyMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';
      
      return {
        success: true,
        content,
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        latencyMs,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'OpenAI API call failed',
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async healthCheck(): Promise<boolean> {
    return !!process.env.OPENAI_API_KEY;
  }

  async validateModelName(modelName: string): Promise<boolean> {
    return modelName.startsWith('gpt-') || modelName.startsWith('o1-') || modelName.startsWith('o3-');
  }

  async listAvailableModels(): Promise<ProviderModelInfo[]> {
    return [
      { modelId: 'gpt-4o', displayName: 'GPT-4o', capabilities: ['chat', 'code', 'vision'], maxTokens: 4096, contextWindow: 128000 },
      { modelId: 'gpt-4o-mini', displayName: 'GPT-4o Mini', capabilities: ['chat', 'code'], maxTokens: 4096, contextWindow: 128000 },
    ];
  }
}

// ==================== AI MODEL REGISTRY ====================
// Central registry for dynamic model management

class AIModelRegistry {
  private static instance: AIModelRegistry;
  private adapters: Map<string, AIProviderAdapterInterface> = new Map();
  private globalSettings: AiGlobalSettings | null = null;
  private lastSettingsLoad: number = 0;
  private settingsCacheTtl = 60000; // 1 minute cache

  private constructor() {
    // Register default adapters
    this.registerAdapter(new ReplitAdapter());
    this.registerAdapter(new AnthropicAdapter());
    this.registerAdapter(new OpenAIAdapter());
  }

  static getInstance(): AIModelRegistry {
    if (!AIModelRegistry.instance) {
      AIModelRegistry.instance = new AIModelRegistry();
    }
    return AIModelRegistry.instance;
  }

  // ==================== ADAPTER MANAGEMENT ====================

  registerAdapter(adapter: AIProviderAdapterInterface): void {
    this.adapters.set(adapter.providerKey, adapter);
  }

  getAdapter(providerKey: string): AIProviderAdapterInterface | undefined {
    return this.adapters.get(providerKey);
  }

  // ==================== GLOBAL SETTINGS ====================

  async getGlobalSettings(): Promise<AiGlobalSettings | null> {
    const now = Date.now();
    if (this.globalSettings && now - this.lastSettingsLoad < this.settingsCacheTtl) {
      return this.globalSettings;
    }

    const [settings] = await db.select().from(aiGlobalSettings).limit(1);
    this.globalSettings = settings || null;
    this.lastSettingsLoad = now;
    return this.globalSettings;
  }

  async isKillSwitchActive(): Promise<boolean> {
    const settings = await this.getGlobalSettings();
    return settings?.emergencyKillSwitch ?? false;
  }

  // ==================== MODEL RESOLUTION ====================

  /**
   * Resolve model for a service with fallback logic:
   * 1. Service-specific primary model
   * 2. Service-specific fallback model
   * 3. Global default model
   * 4. Any active model with required capabilities
   */
  async resolveModelForService(serviceName: string): Promise<AiModel | null> {
    // Check kill switch
    if (await this.isKillSwitchActive()) {
      throw new Error('AI services are currently disabled by administrator');
    }

    // Get service config
    const [serviceConfig] = await db
      .select()
      .from(aiServiceConfigs)
      .where(and(
        eq(aiServiceConfigs.serviceName, serviceName),
        eq(aiServiceConfigs.isEnabled, true)
      ))
      .limit(1);

    // Try primary model
    if (serviceConfig?.primaryModelId) {
      const model = await this.getModelById(serviceConfig.primaryModelId);
      if (model && model.isActive) {
        return model;
      }
    }

    // Try fallback model
    if (serviceConfig?.fallbackModelId) {
      const model = await this.getModelById(serviceConfig.fallbackModelId);
      if (model && model.isActive) {
        return model;
      }
    }

    // Try global default
    const settings = await this.getGlobalSettings();
    if (settings?.globalDefaultModelId) {
      const model = await this.getModelById(settings.globalDefaultModelId);
      if (model && model.isActive) {
        return model;
      }
    }

    // Get any active model with required capabilities
    const requiredCapabilities = serviceConfig?.requiredCapabilities || [];
    return await this.findActiveModelWithCapabilities(requiredCapabilities);
  }

  async getModelById(modelId: string): Promise<AiModel | null> {
    const [model] = await db
      .select()
      .from(aiModels)
      .where(eq(aiModels.modelId, modelId))
      .limit(1);
    return model || null;
  }

  async getActiveModels(): Promise<AiModel[]> {
    return await db
      .select()
      .from(aiModels)
      .where(eq(aiModels.isActive, true))
      .orderBy(asc(aiModels.sortOrder));
  }

  async getAllModels(): Promise<AiModel[]> {
    return await db
      .select()
      .from(aiModels)
      .orderBy(asc(aiModels.sortOrder));
  }

  async findActiveModelWithCapabilities(capabilities: string[]): Promise<AiModel | null> {
    const activeModels = await this.getActiveModels();
    
    if (capabilities.length === 0 && activeModels.length > 0) {
      return activeModels[0];
    }

    for (const model of activeModels) {
      const modelCaps = model.capabilities as string[] || [];
      if (capabilities.every(cap => modelCaps.includes(cap))) {
        return model;
      }
    }

    // If no model matches all capabilities, return first active model
    return activeModels[0] || null;
  }

  // ==================== MODEL EXECUTION ====================

  /**
   * Execute AI call through the registry
   * This is the ONLY entry point for AI calls in the system
   */
  async callModel(
    serviceName: string,
    payload: Omit<ModelCallPayload, 'providerModelName'>,
    options?: { preferredModelId?: string }
  ): Promise<ModelCallResponse> {
    // Check kill switch
    if (await this.isKillSwitchActive()) {
      return {
        success: false,
        error: 'AI services are currently disabled by administrator | تم تعطيل خدمات الذكاء الاصطناعي بواسطة المسؤول',
      };
    }

    // Resolve model
    let model: AiModel | null = null;
    
    if (options?.preferredModelId) {
      model = await this.getModelById(options.preferredModelId);
    }
    
    if (!model) {
      model = await this.resolveModelForService(serviceName);
    }

    if (!model) {
      return {
        success: false,
        error: 'No active AI model available for this service | لا يوجد نموذج ذكاء اصطناعي متاح لهذه الخدمة',
      };
    }

    // Get provider adapter
    const adapter = this.getAdapter(model.provider);
    if (!adapter) {
      // Try replit as fallback (it can route to any provider)
      const replitAdapter = this.getAdapter('replit');
      if (!replitAdapter) {
        return {
          success: false,
          error: `No adapter found for provider: ${model.provider}`,
        };
      }
      
      // Use Replit's routing format: provider/model
      const providerModelName = model.modelId.includes('/') 
        ? model.modelId 
        : `${model.provider}/${model.modelId}`;
        
      return await replitAdapter.callModel({
        ...payload,
        providerModelName,
      });
    }

    // Execute with the provider's native model name
    return await adapter.callModel({
      ...payload,
      providerModelName: model.modelId,
    });
  }

  // ==================== MODEL MANAGEMENT (Owner Only) ====================

  async createModel(data: Partial<AiModel>, createdBy: string): Promise<AiModel> {
    const [model] = await db.insert(aiModels).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning();
    return model;
  }

  async updateModel(modelId: string, data: Partial<AiModel>, updatedBy: string): Promise<AiModel | null> {
    const [model] = await db
      .update(aiModels)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(aiModels.modelId, modelId))
      .returning();
    return model || null;
  }

  async deleteModel(modelId: string): Promise<boolean> {
    const result = await db.delete(aiModels).where(eq(aiModels.modelId, modelId));
    return true;
  }

  async setModelActive(modelId: string, isActive: boolean): Promise<void> {
    await db
      .update(aiModels)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(aiModels.modelId, modelId));
  }

  async setDefaultModel(modelId: string): Promise<void> {
    // First, unset all defaults
    await db.update(aiModels).set({ isDefault: false });
    
    // Set new default
    await db
      .update(aiModels)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(eq(aiModels.modelId, modelId));
  }

  // ==================== SERVICE CONFIG MANAGEMENT ====================

  async getServiceConfigs(): Promise<AiServiceConfig[]> {
    return await db.select().from(aiServiceConfigs).orderBy(asc(aiServiceConfigs.serviceName));
  }

  async getServiceConfig(serviceName: string): Promise<AiServiceConfig | null> {
    const [config] = await db
      .select()
      .from(aiServiceConfigs)
      .where(eq(aiServiceConfigs.serviceName, serviceName))
      .limit(1);
    return config || null;
  }

  async upsertServiceConfig(data: Partial<AiServiceConfig>): Promise<AiServiceConfig> {
    const existing = await this.getServiceConfig(data.serviceName!);
    
    if (existing) {
      const [config] = await db
        .update(aiServiceConfigs)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(aiServiceConfigs.serviceName, data.serviceName!))
        .returning();
      return config;
    } else {
      const [config] = await db.insert(aiServiceConfigs).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any).returning();
      return config;
    }
  }

  // ==================== VALIDATION ====================

  async validateSystemReady(): Promise<{ ready: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if any models are active
    const activeModels = await this.getActiveModels();
    if (activeModels.length === 0) {
      errors.push('No active AI models configured | لم يتم تكوين أي نماذج ذكاء اصطناعي نشطة');
    }

    // Check if kill switch is active
    if (await this.isKillSwitchActive()) {
      errors.push('Emergency kill switch is active | مفتاح الإيقاف الطارئ نشط');
    }

    // Check if at least one adapter is available
    if (this.adapters.size === 0) {
      errors.push('No provider adapters registered | لم يتم تسجيل أي محولات مزودين');
    }

    return {
      ready: errors.length === 0,
      errors,
    };
  }

  async validateModelName(provider: string, modelName: string): Promise<boolean> {
    const adapter = this.getAdapter(provider);
    if (!adapter) return false;
    return await adapter.validateModelName(modelName);
  }

  // ==================== PROVIDER ADAPTER CONFIG ====================

  async getProviderAdapters(): Promise<AiProviderAdapter[]> {
    return await db
      .select()
      .from(aiProviderAdapters)
      .orderBy(asc(aiProviderAdapters.priority));
  }

  async upsertProviderAdapter(data: Partial<AiProviderAdapter>): Promise<AiProviderAdapter> {
    const [existing] = await db
      .select()
      .from(aiProviderAdapters)
      .where(eq(aiProviderAdapters.providerKey, data.providerKey!))
      .limit(1);
    
    if (existing) {
      const [adapter] = await db
        .update(aiProviderAdapters)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(aiProviderAdapters.providerKey, data.providerKey!))
        .returning();
      return adapter;
    } else {
      const [adapter] = await db.insert(aiProviderAdapters).values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any).returning();
      return adapter;
    }
  }
}

// Export singleton instance and class
export const aiModelRegistry = AIModelRegistry.getInstance();
export { AIModelRegistry };
