import { storage } from "./storage";
import { db } from "./db";
import { aiUsage, userSubscriptions, subscriptionPlans } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface UsageCheckResult {
  allowed: boolean;
  currentUsage: number;
  limit: number;
  remainingTokens: number;
  percentUsed: number;
  message: string;
  messageAr: string;
}

export interface UsageLimitConfig {
  userId: string;
  tokensToConsume?: number;
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export class AIUsageEnforcer {
  private static instance: AIUsageEnforcer;
  
  private defaultLimits = {
    free: { aiGenerationsPerMonth: 10, tokensPerMonth: 50000 },
    basic: { aiGenerationsPerMonth: 100, tokensPerMonth: 500000 },
    pro: { aiGenerationsPerMonth: 500, tokensPerMonth: 2000000 },
    enterprise: { aiGenerationsPerMonth: 2000, tokensPerMonth: 10000000 },
    sovereign: { aiGenerationsPerMonth: -1, tokensPerMonth: -1 },
  };

  static getInstance(): AIUsageEnforcer {
    if (!AIUsageEnforcer.instance) {
      AIUsageEnforcer.instance = new AIUsageEnforcer();
    }
    return AIUsageEnforcer.instance;
  }

  async checkUsageLimit(config: UsageLimitConfig): Promise<UsageCheckResult> {
    const { userId, tokensToConsume = 0 } = config;
    
    try {
      const subscription = await this.getUserSubscription(userId);
      const planLimits = await this.getPlanLimits(subscription?.planId);
      const currentUsage = await this.getCurrentMonthUsage(userId);
      
      const monthlyLimit = planLimits.tokensPerMonth;
      
      if (monthlyLimit === -1) {
        return {
          allowed: true,
          currentUsage: currentUsage.totalTokens,
          limit: -1,
          remainingTokens: -1,
          percentUsed: 0,
          message: "Unlimited AI usage",
          messageAr: "استخدام AI غير محدود",
        };
      }
      
      const projectedUsage = currentUsage.totalTokens + tokensToConsume;
      const allowed = projectedUsage <= monthlyLimit;
      const remainingTokens = Math.max(0, monthlyLimit - currentUsage.totalTokens);
      const percentUsed = Math.round((currentUsage.totalTokens / monthlyLimit) * 100);
      
      return {
        allowed,
        currentUsage: currentUsage.totalTokens,
        limit: monthlyLimit,
        remainingTokens,
        percentUsed,
        message: allowed 
          ? `${remainingTokens.toLocaleString()} tokens remaining this month`
          : "Monthly AI token limit exceeded. Please upgrade your plan.",
        messageAr: allowed
          ? `متبقي ${remainingTokens.toLocaleString()} رمز هذا الشهر`
          : "تم تجاوز حد الرموز الشهري. يرجى ترقية خطتك.",
      };
    } catch (error) {
      console.error("[AI Usage Enforcer] Error checking usage:", error);
      return {
        allowed: true,
        currentUsage: 0,
        limit: 0,
        remainingTokens: 0,
        percentUsed: 0,
        message: "Unable to verify usage limits",
        messageAr: "تعذر التحقق من حدود الاستخدام",
      };
    }
  }

  async recordUsage(userId: string, tokensUsed: number, model: string, operation: string): Promise<void> {
    const currentMonth = getCurrentMonth();
    
    const existingUsage = await db.select()
      .from(aiUsage)
      .where(
        and(
          eq(aiUsage.userId, userId),
          eq(aiUsage.month, currentMonth),
          eq(aiUsage.generationType, operation)
        )
      )
      .limit(1);
    
    if (existingUsage.length > 0) {
      await db.update(aiUsage)
        .set({
          tokensUsed: sql`${aiUsage.tokensUsed} + ${tokensUsed}`,
        } as any)
        .where(eq(aiUsage.id, existingUsage[0].id));
    } else {
      await db.insert(aiUsage).values({
        userId,
        tokensUsed,
        generationType: operation,
        month: currentMonth,
      } as any);
    }
    
    console.log(`[AI Usage] Recorded ${tokensUsed} tokens for user ${userId}`);
  }

  async getCurrentMonthUsage(userId: string): Promise<{ totalTokens: number; generationCount: number }> {
    const currentMonth = getCurrentMonth();
    
    const usage = await db.select({
      totalTokens: sql<number>`COALESCE(SUM(${aiUsage.tokensUsed}), 0)`,
      generationCount: sql<number>`COUNT(*)`,
    })
    .from(aiUsage)
    .where(
      and(
        eq(aiUsage.userId, userId),
        eq(aiUsage.month, currentMonth)
      )
    );
    
    return {
      totalTokens: Number(usage[0]?.totalTokens || 0),
      generationCount: Number(usage[0]?.generationCount || 0),
    };
  }

  async getUserSubscription(userId: string): Promise<any | null> {
    const subscription = await db.select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active")
        )
      )
      .limit(1);
    
    return subscription[0] || null;
  }

  async getPlanLimits(planId?: string): Promise<{ tokensPerMonth: number; aiGenerationsPerMonth: number }> {
    if (!planId) {
      return this.defaultLimits.free;
    }
    
    const plan = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);
    
    if (!plan[0]) {
      return this.defaultLimits.free;
    }
    
    const planName = plan[0].name.toLowerCase();
    return this.defaultLimits[planName as keyof typeof this.defaultLimits] || this.defaultLimits.free;
  }

  async getUsageAnalytics(userId: string): Promise<{
    thisMonth: { tokens: number; generations: number };
    lastMonth: { tokens: number; generations: number };
    trend: number;
    averageTokensPerGeneration: number;
  }> {
    const currentMonth = getCurrentMonth();
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
    
    const thisMonthUsage = await this.getCurrentMonthUsage(userId);
    
    const lastMonthUsage = await db.select({
      totalTokens: sql<number>`COALESCE(SUM(${aiUsage.tokensUsed}), 0)`,
      generationCount: sql<number>`COUNT(*)`,
    })
    .from(aiUsage)
    .where(
      and(
        eq(aiUsage.userId, userId),
        eq(aiUsage.month, lastMonth)
      )
    );
    
    const lastTokens = Number(lastMonthUsage[0]?.totalTokens || 0);
    const trend = lastTokens > 0 
      ? Math.round(((thisMonthUsage.totalTokens - lastTokens) / lastTokens) * 100)
      : 0;
    
    return {
      thisMonth: {
        tokens: thisMonthUsage.totalTokens,
        generations: thisMonthUsage.generationCount,
      },
      lastMonth: {
        tokens: lastTokens,
        generations: Number(lastMonthUsage[0]?.generationCount || 0),
      },
      trend,
      averageTokensPerGeneration: thisMonthUsage.generationCount > 0 
        ? Math.round(thisMonthUsage.totalTokens / thisMonthUsage.generationCount)
        : 0,
    };
  }
}

export const aiUsageEnforcer = AIUsageEnforcer.getInstance();
