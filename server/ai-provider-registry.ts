import { db } from "./db";
import { aiProviderConfigs } from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { decrypt } from "./encryption";

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

  async getProviderClient(provider: string): Promise<any> {
    const providers = await this.getActiveProviders();
    const providerInfo = providers.find(p => p.provider === provider);
    
    if (!providerInfo) {
      throw new Error(`Provider ${provider} not found or not active`);
    }

    switch (provider) {
      case 'anthropic':
        const Anthropic = require("@anthropic-ai/sdk").default;
        return new Anthropic({ apiKey: providerInfo.apiKey });
      
      case 'openai':
        const OpenAI = require("openai").default;
        return new OpenAI({ apiKey: providerInfo.apiKey });
      
      case 'replit':
        const ReplitAnthropic = require("@anthropic-ai/sdk").default;
        return new ReplitAnthropic();
      
      case 'google':
        return { apiKey: providerInfo.apiKey, model: providerInfo.defaultModel };
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async executeWithFallback<T>(
    capability: AICapability,
    operation: (client: any, providerInfo: AIProviderInfo) => Promise<T>,
    options: { preferredProvider?: string } = {}
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
      try {
        const client = await this.getProviderClient(providerInfo.provider);
        const response = await operation(client, providerInfo);
        await this.reportSuccess(providerInfo.provider);
        return response;
      } catch (error: any) {
        console.error(`Provider ${providerInfo.provider} failed:`, error.message);
        await this.reportFailure(providerInfo.provider);
        lastError = error;
      }
    }

    throw lastError || new Error("All providers failed");
  }
}

export const aiProviderRegistry = AIProviderRegistry.getInstance();
