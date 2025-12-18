import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";
import { 
  aiTaskExecutions, 
  aiKillSwitch, 
  aiModelConfigs, 
  aiAssistants,
  assistantInstructions,
  type AiAssistant,
  type AiModelConfig,
  type InsertAiTaskExecution 
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

const anthropicApiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const anthropicBaseUrl = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

let anthropicClient: Anthropic | null = null;

if (anthropicApiKey) {
  anthropicClient = new Anthropic({
    apiKey: anthropicApiKey,
    ...(anthropicBaseUrl && { baseURL: anthropicBaseUrl }),
  });
}

export interface TaskExecutionRequest {
  instructionId: string;
  assistantId: string;
  userId: string;
  prompt: string;
  executionMode?: 'AUTO' | 'MANUAL';
  preferredModel?: string;
  preferredProvider?: string;
}

export interface TaskExecutionResult {
  success: boolean;
  executionId: string;
  response?: string;
  model: string;
  provider: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: {
    real: number;
    billed: number;
  };
  executionTimeMs: number;
  error?: string;
}

export class AIAgentExecutor {
  private static instance: AIAgentExecutor;
  private modelPricing: Map<string, { input: number; output: number; markup: number }> = new Map();
  
  private constructor() {
    this.initializeDefaultPricing();
  }
  
  static getInstance(): AIAgentExecutor {
    if (!AIAgentExecutor.instance) {
      AIAgentExecutor.instance = new AIAgentExecutor();
    }
    return AIAgentExecutor.instance;
  }
  
  private initializeDefaultPricing() {
    this.modelPricing.set('claude-sonnet-4-20250514', { input: 3, output: 15, markup: 50 });
    this.modelPricing.set('claude-3-opus-20240229', { input: 15, output: 75, markup: 50 });
    this.modelPricing.set('claude-3-sonnet-20240229', { input: 3, output: 15, markup: 50 });
    this.modelPricing.set('claude-3-haiku-20240307', { input: 0.25, output: 1.25, markup: 50 });
    this.modelPricing.set('gpt-4', { input: 30, output: 60, markup: 50 });
    this.modelPricing.set('gpt-4-turbo', { input: 10, output: 30, markup: 50 });
    this.modelPricing.set('gpt-3.5-turbo', { input: 0.5, output: 1.5, markup: 50 });
    this.modelPricing.set('gemini-pro', { input: 0.5, output: 1.5, markup: 50 });
    this.modelPricing.set('deepseek-chat', { input: 0.14, output: 0.28, markup: 50 });
  }
  
  async isKillSwitchActive(assistantId?: string, provider?: string): Promise<{ active: boolean; reason?: string }> {
    const [globalKillSwitch] = await db.select()
      .from(aiKillSwitch)
      .where(and(eq(aiKillSwitch.scope, 'global'), eq(aiKillSwitch.isActive, true)))
      .limit(1);
    
    if (globalKillSwitch) {
      return { active: true, reason: globalKillSwitch.reason || 'Global AI kill switch is active' };
    }
    
    if (assistantId) {
      const [agentKillSwitch] = await db.select()
        .from(aiKillSwitch)
        .where(and(
          eq(aiKillSwitch.scope, 'agent'),
          eq(aiKillSwitch.targetId, assistantId),
          eq(aiKillSwitch.isActive, true)
        ))
        .limit(1);
      
      if (agentKillSwitch) {
        return { active: true, reason: agentKillSwitch.reason || 'Agent kill switch is active' };
      }
    }
    
    if (provider) {
      const [providerKillSwitch] = await db.select()
        .from(aiKillSwitch)
        .where(and(
          eq(aiKillSwitch.scope, 'provider'),
          eq(aiKillSwitch.targetId, provider),
          eq(aiKillSwitch.isActive, true)
        ))
        .limit(1);
      
      if (providerKillSwitch) {
        return { active: true, reason: providerKillSwitch.reason || 'Provider kill switch is active' };
      }
    }
    
    return { active: false };
  }
  
  async selectModel(taskType: string, executionMode: string, preferredModel?: string, preferredProvider?: string): Promise<{ model: string; provider: string }> {
    if (executionMode === 'MANUAL' && preferredModel) {
      return { model: preferredModel, provider: preferredProvider || 'anthropic' };
    }
    
    switch (taskType) {
      case 'analysis':
        return { model: 'claude-3-opus-20240229', provider: 'anthropic' };
      case 'coding':
      case 'development':
        return { model: 'claude-sonnet-4-20250514', provider: 'anthropic' };
      case 'long_context':
        return { model: 'claude-sonnet-4-20250514', provider: 'anthropic' };
      case 'cheap_bulk':
        return { model: 'claude-3-haiku-20240307', provider: 'anthropic' };
      default:
        return { model: 'claude-sonnet-4-20250514', provider: 'anthropic' };
    }
  }
  
  calculateCost(model: string, inputTokens: number, outputTokens: number): { real: number; billed: number } {
    const pricing = this.modelPricing.get(model) || { input: 3, output: 15, markup: 50 };
    const realCost = (inputTokens * pricing.input + outputTokens * pricing.output) / 1000000;
    const billedCost = realCost * (1 + pricing.markup / 100);
    return { real: realCost, billed: billedCost };
  }
  
  async executeTask(request: TaskExecutionRequest): Promise<TaskExecutionResult> {
    const startTime = Date.now();
    
    const killSwitchCheck = await this.isKillSwitchActive(request.assistantId);
    if (killSwitchCheck.active) {
      throw new Error(`AI execution blocked: ${killSwitchCheck.reason}`);
    }
    
    const [assistant] = await db.select()
      .from(aiAssistants)
      .where(eq(aiAssistants.id, request.assistantId))
      .limit(1);
    
    if (!assistant) {
      throw new Error('Assistant not found');
    }
    
    if (!assistant.isActive) {
      throw new Error('Assistant is deactivated');
    }
    
    const { model, provider } = await this.selectModel(
      assistant.specialty,
      request.executionMode || 'AUTO',
      request.preferredModel || assistant.model,
      request.preferredProvider
    );
    
    const providerCheck = await this.isKillSwitchActive(undefined, provider);
    if (providerCheck.active) {
      throw new Error(`Provider ${provider} is blocked: ${providerCheck.reason}`);
    }
    
    const executionRecord: InsertAiTaskExecution = {
      instructionId: request.instructionId,
      assistantId: request.assistantId,
      userId: request.userId,
      model,
      provider,
      executionMode: request.executionMode || 'AUTO',
      inputPrompt: request.prompt,
      systemPrompt: assistant.systemPrompt,
      status: 'running',
      startedAt: new Date(),
    };
    
    const [execution] = await db.insert(aiTaskExecutions)
      .values(executionRecord)
      .returning();
    
    try {
      if (!anthropicClient) {
        throw new Error('AI provider not configured. Please set up API keys.');
      }
      
      const response = await anthropicClient.messages.create({
        model: model,
        max_tokens: assistant.maxTokens,
        temperature: assistant.temperature / 100,
        system: assistant.systemPrompt,
        messages: [{ role: 'user', content: request.prompt }],
      });
      
      const textContent = response.content.find(c => c.type === 'text');
      const responseText = textContent?.type === 'text' ? textContent.text : '';
      
      const inputTokens = response.usage?.input_tokens || 0;
      const outputTokens = response.usage?.output_tokens || 0;
      const totalTokens = inputTokens + outputTokens;
      
      const cost = this.calculateCost(model, inputTokens, outputTokens);
      const executionTimeMs = Date.now() - startTime;
      
      await db.update(aiTaskExecutions)
        .set({
          status: 'completed',
          outputResponse: responseText,
          inputTokens,
          outputTokens,
          totalTokens,
          realCostUSD: cost.real,
          billedCostUSD: cost.billed,
          completedAt: new Date(),
          executionTimeMs,
        })
        .where(eq(aiTaskExecutions.id, execution.id));
      
      await db.update(assistantInstructions)
        .set({
          status: 'completed',
          response: responseText,
          executionTime: Math.round(executionTimeMs / 1000),
          completedAt: new Date(),
        })
        .where(eq(assistantInstructions.id, request.instructionId));
      
      await db.update(aiAssistants)
        .set({
          totalTasksCompleted: assistant.totalTasksCompleted + 1,
          updatedAt: new Date(),
        })
        .where(eq(aiAssistants.id, request.assistantId));
      
      return {
        success: true,
        executionId: execution.id,
        response: responseText,
        model,
        provider,
        tokens: { input: inputTokens, output: outputTokens, total: totalTokens },
        cost,
        executionTimeMs,
      };
      
    } catch (error: any) {
      const executionTimeMs = Date.now() - startTime;
      
      await db.update(aiTaskExecutions)
        .set({
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
          executionTimeMs,
        })
        .where(eq(aiTaskExecutions.id, execution.id));
      
      await db.update(assistantInstructions)
        .set({
          status: 'failed',
          response: `Error: ${error.message}`,
          executionTime: Math.round(executionTimeMs / 1000),
        })
        .where(eq(assistantInstructions.id, request.instructionId));
      
      return {
        success: false,
        executionId: execution.id,
        model,
        provider,
        tokens: { input: 0, output: 0, total: 0 },
        cost: { real: 0, billed: 0 },
        executionTimeMs,
        error: error.message,
      };
    }
  }
  
  async activateKillSwitch(scope: 'global' | 'agent' | 'provider', targetId: string | null, userId: string, reason: string, reasonAr?: string): Promise<void> {
    await db.insert(aiKillSwitch).values({
      scope,
      targetId,
      isActive: true,
      reason,
      reasonAr,
      activatedBy: userId,
      activatedAt: new Date(),
    });
  }
  
  async deactivateKillSwitch(scope: 'global' | 'agent' | 'provider', targetId: string | null, userId: string): Promise<void> {
    await db.update(aiKillSwitch)
      .set({
        isActive: false,
        deactivatedBy: userId,
        deactivatedAt: new Date(),
      })
      .where(and(
        eq(aiKillSwitch.scope, scope),
        targetId ? eq(aiKillSwitch.targetId, targetId) : eq(aiKillSwitch.targetId, ''),
        eq(aiKillSwitch.isActive, true)
      ));
  }
  
  async getTaskHistory(filters: { assistantId?: string; userId?: string; limit?: number } = {}): Promise<any[]> {
    let query = db.select()
      .from(aiTaskExecutions)
      .orderBy(desc(aiTaskExecutions.createdAt))
      .limit(filters.limit || 50);
    
    return query;
  }
  
  async getAICostAnalytics(): Promise<{
    totalRealCost: number;
    totalBilledCost: number;
    margin: number;
    byModel: { model: string; cost: number; billed: number; tasks: number }[];
    byAssistant: { assistantId: string; cost: number; billed: number; tasks: number }[];
  }> {
    const executions = await db.select().from(aiTaskExecutions);
    
    const totals = executions.reduce(
      (acc, ex) => ({
        realCost: acc.realCost + (ex.realCostUSD || 0),
        billedCost: acc.billedCost + (ex.billedCostUSD || 0),
      }),
      { realCost: 0, billedCost: 0 }
    );
    
    const byModelMap = new Map<string, { cost: number; billed: number; tasks: number }>();
    const byAssistantMap = new Map<string, { cost: number; billed: number; tasks: number }>();
    
    for (const ex of executions) {
      const modelData = byModelMap.get(ex.model) || { cost: 0, billed: 0, tasks: 0 };
      modelData.cost += ex.realCostUSD || 0;
      modelData.billed += ex.billedCostUSD || 0;
      modelData.tasks += 1;
      byModelMap.set(ex.model, modelData);
      
      const assistantData = byAssistantMap.get(ex.assistantId) || { cost: 0, billed: 0, tasks: 0 };
      assistantData.cost += ex.realCostUSD || 0;
      assistantData.billed += ex.billedCostUSD || 0;
      assistantData.tasks += 1;
      byAssistantMap.set(ex.assistantId, assistantData);
    }
    
    return {
      totalRealCost: totals.realCost,
      totalBilledCost: totals.billedCost,
      margin: totals.billedCost > 0 ? (totals.billedCost - totals.realCost) / totals.billedCost : 0,
      byModel: Array.from(byModelMap.entries()).map(([model, data]) => ({ model, ...data })),
      byAssistant: Array.from(byAssistantMap.entries()).map(([assistantId, data]) => ({ assistantId, ...data })),
    };
  }
}

export const aiAgentExecutor = AIAgentExecutor.getInstance();
