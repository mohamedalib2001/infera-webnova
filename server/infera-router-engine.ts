import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import crypto from "crypto";

interface InferaAIProvider {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  authType: string;
  authHeader: string;
  availableModels: any[];
  status: string;
  healthScore: number;
  averageLatencyMs: number;
  successRate: number;
  priority: number;
  weight: number;
  isEnabled: boolean;
  isPrimary: boolean;
  rateLimitPerMinute: number;
  rateLimitPerDay: number;
  currentMinuteRequests: number;
}

interface RoutingRule {
  id: string;
  name: string;
  ruleType: string;
  providerOrder: string[];
  fallbackChain: string[];
  maxRetries: number;
  retryDelayMs: number;
  loadBalanceStrategy: string;
  isActive: boolean;
  priority: number;
}

interface RoutingDecision {
  primaryProvider: InferaAIProvider;
  fallbackProviders: InferaAIProvider[];
  routingRule: RoutingRule | null;
  reason: string;
}

interface ProviderHealthMetrics {
  providerId: string;
  requestCount: number;
  successCount: number;
  errorCount: number;
  avgLatencyMs: number;
  lastUpdated: Date;
}

export type RoutingStrategy = 'reliability_first' | 'cost_optimized' | 'latency_optimized' | 'round_robin' | 'weighted';

class InferaRouterEngine {
  private static instance: InferaRouterEngine;
  private providerClients: Map<string, any> = new Map();
  private roundRobinIndex: Map<string, number> = new Map();
  private healthMetrics: Map<string, ProviderHealthMetrics> = new Map();

  private constructor() {}

  static getInstance(): InferaRouterEngine {
    if (!InferaRouterEngine.instance) {
      InferaRouterEngine.instance = new InferaRouterEngine();
    }
    return InferaRouterEngine.instance;
  }

  async getActiveProviders(): Promise<InferaAIProvider[]> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM infera_ai_providers 
        WHERE is_enabled = true AND status = 'active'
        ORDER BY priority ASC, weight DESC
      `);
      
      return (result.rows || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        displayName: row.display_name,
        baseUrl: row.base_url,
        authType: row.auth_type,
        authHeader: row.auth_header || 'Authorization',
        availableModels: row.available_models || [],
        status: row.status,
        healthScore: row.health_score || 100,
        averageLatencyMs: row.average_latency_ms || 0,
        successRate: row.success_rate || 100,
        priority: row.priority || 1,
        weight: row.weight || 100,
        isEnabled: row.is_enabled ?? true,
        isPrimary: row.is_primary ?? false,
        rateLimitPerMinute: row.rate_limit_per_minute || 60,
        rateLimitPerDay: row.rate_limit_per_day || 10000,
        currentMinuteRequests: row.current_minute_requests || 0,
      }));
    } catch (error) {
      console.error("Failed to get active providers:", error);
      return [];
    }
  }

  async getRoutingRules(): Promise<RoutingRule[]> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM infera_routing_rules 
        WHERE is_active = true
        ORDER BY priority ASC
      `);
      
      return (result.rows || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        ruleType: row.rule_type,
        providerOrder: row.provider_order || [],
        fallbackChain: row.fallback_chain || [],
        maxRetries: row.max_retries || 2,
        retryDelayMs: row.retry_delay_ms || 1000,
        loadBalanceStrategy: row.load_balance_strategy || 'round_robin',
        isActive: row.is_active ?? true,
        priority: row.priority || 100,
      }));
    } catch (error) {
      console.error("Failed to get routing rules:", error);
      return [];
    }
  }

  async selectProvider(options: {
    strategy?: RoutingStrategy;
    preferredProvider?: string;
    excludeProviders?: string[];
    modelCapability?: string;
  } = {}): Promise<RoutingDecision | null> {
    const { 
      strategy = 'reliability_first', 
      preferredProvider, 
      excludeProviders = [],
      modelCapability 
    } = options;

    const providers = await this.getActiveProviders();
    const rules = await this.getRoutingRules();

    let availableProviders = providers.filter(
      p => !excludeProviders.includes(p.name)
    );

    if (availableProviders.length === 0) {
      console.warn("No available providers after exclusion");
      return null;
    }

    if (preferredProvider) {
      const preferred = availableProviders.find(p => p.name === preferredProvider);
      if (preferred && preferred.healthScore >= 70) {
        return {
          primaryProvider: preferred,
          fallbackProviders: availableProviders.filter(p => p.name !== preferredProvider),
          routingRule: rules[0] || null,
          reason: `Selected preferred provider: ${preferredProvider}`
        };
      }
    }

    let sortedProviders: InferaAIProvider[];
    let reason: string;

    switch (strategy) {
      case 'cost_optimized':
        sortedProviders = this.sortByCost(availableProviders);
        reason = 'Selected based on cost optimization';
        break;

      case 'latency_optimized':
        sortedProviders = this.sortByLatency(availableProviders);
        reason = 'Selected based on lowest latency';
        break;

      case 'round_robin':
        sortedProviders = this.applyRoundRobin(availableProviders, strategy);
        reason = 'Selected via round-robin distribution';
        break;

      case 'weighted':
        sortedProviders = this.applyWeightedSelection(availableProviders);
        reason = 'Selected based on weighted distribution';
        break;

      case 'reliability_first':
      default:
        sortedProviders = this.sortByReliability(availableProviders);
        reason = 'Selected based on reliability score';
        break;
    }

    const primaryProvider = sortedProviders[0];
    const fallbackProviders = sortedProviders.slice(1);

    const matchingRule = rules.find(r => r.ruleType === strategy) || rules[0] || null;

    return {
      primaryProvider,
      fallbackProviders,
      routingRule: matchingRule,
      reason
    };
  }

  private sortByReliability(providers: InferaAIProvider[]): InferaAIProvider[] {
    return [...providers].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      
      const scoreA = (a.healthScore * 0.5) + (a.successRate * 0.3) + ((100 - Math.min(a.priority, 100)) * 0.2);
      const scoreB = (b.healthScore * 0.5) + (b.successRate * 0.3) + ((100 - Math.min(b.priority, 100)) * 0.2);
      return scoreB - scoreA;
    });
  }

  private sortByCost(providers: InferaAIProvider[]): InferaAIProvider[] {
    const costPriority: Record<string, number> = {
      'google': 1,
      'openai': 2,
      'anthropic': 3,
    };

    return [...providers].sort((a, b) => {
      const costA = costPriority[a.name] || 99;
      const costB = costPriority[b.name] || 99;
      
      if (costA !== costB) return costA - costB;
      return b.healthScore - a.healthScore;
    });
  }

  private sortByLatency(providers: InferaAIProvider[]): InferaAIProvider[] {
    return [...providers].sort((a, b) => {
      if (a.averageLatencyMs === 0 && b.averageLatencyMs === 0) {
        return a.priority - b.priority;
      }
      if (a.averageLatencyMs === 0) return 1;
      if (b.averageLatencyMs === 0) return -1;
      
      return a.averageLatencyMs - b.averageLatencyMs;
    });
  }

  private applyRoundRobin(providers: InferaAIProvider[], key: string): InferaAIProvider[] {
    const currentIndex = this.roundRobinIndex.get(key) || 0;
    const nextIndex = (currentIndex + 1) % providers.length;
    this.roundRobinIndex.set(key, nextIndex);
    
    const rotated = [
      ...providers.slice(currentIndex),
      ...providers.slice(0, currentIndex)
    ];
    
    return rotated;
  }

  private applyWeightedSelection(providers: InferaAIProvider[]): InferaAIProvider[] {
    const totalWeight = providers.reduce((sum, p) => sum + p.weight, 0);
    const random = Math.random() * totalWeight;
    
    let cumulative = 0;
    let selectedIndex = 0;
    
    for (let i = 0; i < providers.length; i++) {
      cumulative += providers[i].weight;
      if (random <= cumulative) {
        selectedIndex = i;
        break;
      }
    }
    
    return [
      providers[selectedIndex],
      ...providers.filter((_, i) => i !== selectedIndex)
    ];
  }

  async getProviderClient(providerName: string): Promise<any> {
    if (this.providerClients.has(providerName)) {
      return this.providerClients.get(providerName);
    }

    let client: any;

    switch (providerName) {
      case 'anthropic':
        client = new Anthropic();
        break;

      case 'openai':
        if (process.env.OPENAI_API_KEY) {
          client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        } else {
          throw new Error("OpenAI API key not configured");
        }
        break;

      case 'google':
        client = { type: 'google' };
        break;

      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }

    this.providerClients.set(providerName, client);
    return client;
  }

  async executeWithRouting<T>(
    operation: (client: any, provider: InferaAIProvider) => Promise<T>,
    options: {
      strategy?: RoutingStrategy;
      preferredProvider?: string;
      maxRetries?: number;
      retryDelayMs?: number;
    } = {}
  ): Promise<{ result: T; provider: InferaAIProvider; latencyMs: number }> {
    const { maxRetries = 2, retryDelayMs = 1000 } = options;

    const routingDecision = await this.selectProvider(options);
    
    if (!routingDecision) {
      throw new Error("No available providers");
    }

    const allProviders = [routingDecision.primaryProvider, ...routingDecision.fallbackProviders];
    let lastError: Error | null = null;
    let attemptedProviders: string[] = [];

    for (const provider of allProviders) {
      attemptedProviders.push(provider.name);
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const startTime = Date.now();
        
        try {
          const client = await this.getProviderClient(provider.name);
          const result = await operation(client, provider);
          const latencyMs = Date.now() - startTime;

          await this.reportSuccess(provider.name, latencyMs);

          return { result, provider, latencyMs };
        } catch (error: any) {
          const latencyMs = Date.now() - startTime;
          console.error(`Provider ${provider.name} attempt ${attempt + 1} failed:`, error.message);

          await this.reportFailure(provider.name, latencyMs, error.message);

          if (this.isRetryableError(error) && attempt < maxRetries) {
            await this.delay(retryDelayMs * (attempt + 1));
            continue;
          }

          lastError = error;
          break;
        }
      }
    }

    throw lastError || new Error(`All providers failed: ${attemptedProviders.join(', ')}`);
  }

  private isRetryableError(error: any): boolean {
    const retryableStatuses = [429, 500, 502, 503, 504];
    const retryableMessages = ['timeout', 'rate limit', 'overloaded', 'temporarily unavailable'];
    
    if (error.status && retryableStatuses.includes(error.status)) {
      return true;
    }
    
    const message = (error.message || '').toLowerCase();
    return retryableMessages.some(m => message.includes(m));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async reportSuccess(providerName: string, latencyMs: number): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE infera_ai_providers
        SET 
          health_score = LEAST(100, health_score + 1),
          success_rate = LEAST(100, success_rate + 0.1),
          average_latency_ms = CASE 
            WHEN average_latency_ms = 0 THEN ${latencyMs}
            ELSE (average_latency_ms * 0.9 + ${latencyMs} * 0.1)::integer
          END,
          total_requests_today = total_requests_today + 1,
          updated_at = NOW()
        WHERE name = ${providerName}
      `);
    } catch (error) {
      console.error(`Failed to report success for ${providerName}:`, error);
    }
  }

  async reportFailure(providerName: string, latencyMs: number, errorMessage: string): Promise<void> {
    try {
      await db.execute(sql`
        UPDATE infera_ai_providers
        SET 
          health_score = GREATEST(0, health_score - 10),
          success_rate = GREATEST(0, success_rate - 1),
          total_requests_today = total_requests_today + 1,
          updated_at = NOW()
        WHERE name = ${providerName}
      `);
    } catch (error) {
      console.error(`Failed to report failure for ${providerName}:`, error);
    }
  }

  async recordHealthMetric(providerId: string, metrics: {
    requestCount: number;
    successCount: number;
    errorCount: number;
    avgLatencyMs: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCostCents: number;
  }): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO infera_provider_health_metrics (
          provider_id, timestamp, bucket, 
          request_count, success_count, error_count,
          avg_latency_ms, total_input_tokens, total_output_tokens, total_cost_cents
        ) VALUES (
          ${providerId}, NOW(), 'hourly',
          ${metrics.requestCount}, ${metrics.successCount}, ${metrics.errorCount},
          ${metrics.avgLatencyMs}, ${metrics.totalInputTokens}, ${metrics.totalOutputTokens}, ${metrics.totalCostCents}
        )
      `);
    } catch (error) {
      console.error("Failed to record health metric:", error);
    }
  }

  async getProviderStats(): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          name, display_name, status, health_score, 
          average_latency_ms, success_rate, 
          total_requests_today, is_primary, priority
        FROM infera_ai_providers
        WHERE is_enabled = true
        ORDER BY priority ASC
      `);
      
      return result.rows || [];
    } catch (error) {
      console.error("Failed to get provider stats:", error);
      return [];
    }
  }

  async performHealthChecks(): Promise<void> {
    const providers = await this.getActiveProviders();
    
    for (const provider of providers) {
      try {
        const startTime = Date.now();
        const client = await this.getProviderClient(provider.name);
        
        if (provider.name === 'anthropic') {
          await client.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'ping' }]
          });
        }
        
        const latencyMs = Date.now() - startTime;
        await this.reportSuccess(provider.name, latencyMs);
        
        console.log(`Health check passed for ${provider.name}: ${latencyMs}ms`);
      } catch (error: any) {
        await this.reportFailure(provider.name, 0, error.message);
        console.error(`Health check failed for ${provider.name}:`, error.message);
      }
    }
  }
}

export const inferaRouterEngine = InferaRouterEngine.getInstance();
