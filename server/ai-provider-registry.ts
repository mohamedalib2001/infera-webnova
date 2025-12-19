import { db } from "./db";
import { aiProviderConfigs, aiUsageLogs } from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { decrypt } from "./encryption";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// Pricing per 1M tokens (approximate USD)
const PRICING: Record<string, { input: number; output: number }> = {
  'anthropic': { input: 3.0, output: 15.0 },
  'openai': { input: 2.5, output: 10.0 },
  'google': { input: 0.075, output: 0.30 },
  'meta': { input: 0.8, output: 0.8 },
  'replit': { input: 0, output: 0 },
};

export type AICapability = 'chat' | 'coding' | 'image' | 'embedding' | 'tooling';

export interface AIProviderInfo {
  id: string;
  provider: string;
  displayName: string;
  defaultModel: string | null;
  baseUrl: string | null;
  apiKey: string | null;
  priority: number;
  capabilities: string[];
  isHealthy: boolean;
}

class AIProviderRegistry {
  private static instance: AIProviderRegistry;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): AIProviderRegistry {
    if (!AIProviderRegistry.instance) {
      AIProviderRegistry.instance = new AIProviderRegistry();
    }
    return AIProviderRegistry.instance;
  }

  async getActiveProviders(capability?: AICapability): Promise<AIProviderInfo[]> {
    try {
      const configs = await db.select()
        .from(aiProviderConfigs)
        .where(eq(aiProviderConfigs.status, 'active'))
        .orderBy(asc(aiProviderConfigs.priority));
      
      let providers = configs.map(c => ({
        id: c.id,
        provider: c.provider,
        displayName: c.displayName,
        defaultModel: c.defaultModel,
        baseUrl: c.baseUrl,
        apiKey: c.encryptedApiKey ? decrypt(c.encryptedApiKey) : null,
        priority: c.priority,
        capabilities: (c.capabilities as string[]) || ['chat', 'coding'],
        isHealthy: c.isHealthy ?? true,
      }));

      if (capability) {
        providers = providers.filter(p => p.capabilities.includes(capability));
      }

      return providers.filter(p => p.isHealthy);
    } catch (error) {
      console.error("Failed to get active providers:", error);
      return [];
    }
  }

  async selectProvider(options: {
    capability?: AICapability;
    preferredProvider?: string;
    excludeProviders?: string[];
  } = {}): Promise<AIProviderInfo | null> {
    const { capability, preferredProvider, excludeProviders = [] } = options;
    
    let providers = await this.getActiveProviders(capability);
    
    providers = providers.filter(p => !excludeProviders.includes(p.provider));
    
    if (providers.length === 0) {
      console.warn(`No active providers available for capability: ${capability}`);
      return null;
    }

    if (preferredProvider) {
      const preferred = providers.find(p => p.provider === preferredProvider);
      if (preferred) return preferred;
    }

    return providers[0];
  }

  async selectProviderWithFallback(options: {
    capability?: AICapability;
    preferredProvider?: string;
  } = {}): Promise<{ provider: AIProviderInfo; fallbacks: AIProviderInfo[] } | null> {
    const providers = await this.getActiveProviders(options.capability);
    
    if (providers.length === 0) {
      return null;
    }

    let primary: AIProviderInfo;
    let fallbacks: AIProviderInfo[];

    if (options.preferredProvider) {
      const preferredIdx = providers.findIndex(p => p.provider === options.preferredProvider);
      if (preferredIdx >= 0) {
        primary = providers[preferredIdx];
        fallbacks = [...providers.slice(0, preferredIdx), ...providers.slice(preferredIdx + 1)];
      } else {
        primary = providers[0];
        fallbacks = providers.slice(1);
      }
    } else {
      primary = providers[0];
      fallbacks = providers.slice(1);
    }

    return { provider: primary, fallbacks };
  }

  async reportSuccess(provider: string): Promise<void> {
    try {
      await db.update(aiProviderConfigs)
        .set({
          consecutiveFailures: 0,
          isHealthy: true,
        })
        .where(eq(aiProviderConfigs.provider, provider));
    } catch (error) {
      console.error(`Failed to report success for ${provider}:`, error);
    }
  }

  async reportFailure(provider: string): Promise<void> {
    try {
      const configs = await db.select()
        .from(aiProviderConfigs)
        .where(eq(aiProviderConfigs.provider, provider))
        .limit(1);
      
      if (configs.length === 0) return;
      
      const config = configs[0];
      const newConsecutiveFailures = (config.consecutiveFailures || 0) + 1;
      const newFailureCount = (config.failureCount || 0) + 1;
      
      const isHealthy = newConsecutiveFailures < 3;
      
      await db.update(aiProviderConfigs)
        .set({
          lastFailureAt: new Date(),
          failureCount: newFailureCount,
          consecutiveFailures: newConsecutiveFailures,
          isHealthy,
        })
        .where(eq(aiProviderConfigs.provider, provider));
      
      if (!isHealthy) {
        console.warn(`Provider ${provider} marked as unhealthy after ${newConsecutiveFailures} consecutive failures`);
      }
    } catch (error) {
      console.error(`Failed to report failure for ${provider}:`, error);
    }
  }

  async resetHealth(provider: string): Promise<void> {
    try {
      await db.update(aiProviderConfigs)
        .set({
          consecutiveFailures: 0,
          isHealthy: true,
        })
        .where(eq(aiProviderConfigs.provider, provider));
    } catch (error) {
      console.error(`Failed to reset health for ${provider}:`, error);
    }
  }

  async updatePriority(provider: string, priority: number): Promise<void> {
    try {
      await db.update(aiProviderConfigs)
        .set({ priority })
        .where(eq(aiProviderConfigs.provider, provider));
    } catch (error) {
      console.error(`Failed to update priority for ${provider}:`, error);
    }
  }

  async logUsage(params: {
    provider: string;
    model: string;
    inputTokens?: number;
    outputTokens?: number;
    requestType?: string;
    success: boolean;
    errorMessage?: string;
    latencyMs?: number;
    userId?: string;
  }): Promise<void> {
    try {
      const totalTokens = (params.inputTokens || 0) + (params.outputTokens || 0);
      const pricing = PRICING[params.provider] || { input: 1.0, output: 1.0 };
      const estimatedCost = ((params.inputTokens || 0) * pricing.input + (params.outputTokens || 0) * pricing.output) / 1000000;
      
      await db.insert(aiUsageLogs).values({
        provider: params.provider,
        model: params.model || 'unknown',
        inputTokens: params.inputTokens || 0,
        outputTokens: params.outputTokens || 0,
        totalTokens,
        estimatedCost,
        requestType: params.requestType || 'chat',
        success: params.success,
        errorMessage: params.errorMessage || null,
        latencyMs: params.latencyMs || null,
        userId: params.userId || null,
      });
    } catch (error) {
      console.error("Failed to log AI usage:", error);
    }
  }

  async getProviderClient(provider: string): Promise<any> {
    const providers = await this.getActiveProviders();
    const providerInfo = providers.find(p => p.provider === provider);
    
    if (!providerInfo) {
      throw new Error(`Provider ${provider} not found or not active`);
    }

    switch (provider) {
      case 'anthropic':
        if (!providerInfo.apiKey) {
          throw new Error("Anthropic API key not configured");
        }
        return new Anthropic({ apiKey: providerInfo.apiKey });
      
      case 'openai':
        if (!providerInfo.apiKey) {
          throw new Error("OpenAI API key not configured");
        }
        return new OpenAI({ apiKey: providerInfo.apiKey });
      
      case 'replit':
        if (!process.env.ANTHROPIC_API_KEY && !process.env.REPLIT_AI_API_KEY) {
          throw new Error("Replit AI not available - not running in Replit environment or AI not enabled");
        }
        return new Anthropic();
      
      case 'google':
        if (!providerInfo.apiKey) {
          throw new Error("Google API key not configured");
        }
        return { apiKey: providerInfo.apiKey, model: providerInfo.defaultModel };
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  // Execute with fallback and usage tracking - tracks tokens and costs
  async executeWithTracking<T>(
    capability: AICapability,
    operation: (client: any, providerInfo: AIProviderInfo) => Promise<{ result: T; usage?: { inputTokens?: number; outputTokens?: number } }>,
    options: { preferredProvider?: string; userId?: string; requestType?: string } = {}
  ): Promise<T> {
    const result = await this.selectProviderWithFallback({
      capability,
      preferredProvider: options.preferredProvider,
    });

    if (!result) {
      throw new Error(`No active providers available for capability: ${capability}`);
    }

    const allProviders = [result.provider, ...result.fallbacks];
    let lastError: Error | null = null;

    for (const providerInfo of allProviders) {
      const startTime = Date.now();
      try {
        const client = await this.getProviderClient(providerInfo.provider);
        const response = await operation(client, providerInfo);
        const latencyMs = Date.now() - startTime;
        
        await this.reportSuccess(providerInfo.provider);
        
        // Log successful usage
        await this.logUsage({
          provider: providerInfo.provider,
          model: providerInfo.defaultModel || 'unknown',
          inputTokens: response.usage?.inputTokens,
          outputTokens: response.usage?.outputTokens,
          requestType: options.requestType || capability,
          success: true,
          latencyMs,
          userId: options.userId,
        });
        
        return response.result;
      } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        console.error(`Provider ${providerInfo.provider} failed:`, error.message);
        
        await this.reportFailure(providerInfo.provider);
        
        // Log failed usage
        await this.logUsage({
          provider: providerInfo.provider,
          model: providerInfo.defaultModel || 'unknown',
          requestType: options.requestType || capability,
          success: false,
          errorMessage: error.message,
          latencyMs,
          userId: options.userId,
        });
        
        lastError = error;
      }
    }

    throw lastError || new Error("All providers failed");
  }

  // Original execute with fallback (backward compatible) - logs basic usage
  async executeWithFallback<T>(
    capability: AICapability,
    operation: (client: any, providerInfo: AIProviderInfo) => Promise<T>,
    options: { preferredProvider?: string; userId?: string } = {}
  ): Promise<T> {
    const result = await this.selectProviderWithFallback({
      capability,
      preferredProvider: options.preferredProvider,
    });

    if (!result) {
      throw new Error(`No active providers available for capability: ${capability}`);
    }

    const allProviders = [result.provider, ...result.fallbacks];
    let lastError: Error | null = null;

    for (const providerInfo of allProviders) {
      const startTime = Date.now();
      try {
        const client = await this.getProviderClient(providerInfo.provider);
        const response = await operation(client, providerInfo);
        const latencyMs = Date.now() - startTime;
        
        await this.reportSuccess(providerInfo.provider);
        
        // Log basic usage (no token counts without explicit tracking)
        await this.logUsage({
          provider: providerInfo.provider,
          model: providerInfo.defaultModel || 'unknown',
          requestType: capability,
          success: true,
          latencyMs,
          userId: options.userId,
        });
        
        return response;
      } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        console.error(`Provider ${providerInfo.provider} failed:`, error.message);
        
        await this.reportFailure(providerInfo.provider);
        
        // Log failed usage
        await this.logUsage({
          provider: providerInfo.provider,
          model: providerInfo.defaultModel || 'unknown',
          requestType: capability,
          success: false,
          errorMessage: error.message,
          latencyMs,
          userId: options.userId,
        });
        
        lastError = error;
      }
    }

    throw lastError || new Error("All providers failed");
  }
}

export const aiProviderRegistry = AIProviderRegistry.getInstance();
