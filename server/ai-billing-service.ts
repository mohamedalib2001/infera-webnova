import Anthropic from '@anthropic-ai/sdk';
import { storage } from './storage';
import type { User, UserSubscription, SubscriptionPlan, Payment, AiBillingInsight } from '@shared/schema';

const anthropic = new Anthropic();

export interface ChurnPrediction {
  userId: string;
  risk: 'low' | 'medium' | 'high';
  probability: number;
  factors: string[];
  recommendations: string[];
  recommendationsAr: string[];
}

export interface UpgradeSuggestion {
  userId: string;
  currentPlan: string;
  suggestedPlan: string;
  reason: string;
  reasonAr: string;
  potentialValue: number;
}

export interface BillingInsight {
  type: 'churn_risk' | 'upgrade_opportunity' | 'payment_issue' | 'usage_pattern';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  actionRequired: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
}

export class AIBillingService {
  async analyzeChurnRisk(userId: string): Promise<ChurnPrediction> {
    const user = await storage.getUser(userId);
    const subscription = await storage.getUserSubscription(userId);
    const payments = await storage.getPaymentsByUser(userId);
    
    if (!user || !subscription) {
      return {
        userId,
        risk: 'low',
        probability: 0,
        factors: [],
        recommendations: ['No active subscription found'],
        recommendationsAr: ['لا يوجد اشتراك نشط'],
      };
    }

    const analysisData = {
      subscriptionStatus: subscription.status,
      billingCycle: subscription.billingCycle,
      daysSinceStart: Math.floor((Date.now() - new Date(subscription.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)),
      paymentHistory: payments.map(p => ({
        status: p.status,
        amount: p.amount,
        date: p.createdAt,
      })),
      failedPayments: payments.filter(p => p.status === 'failed').length,
      totalPayments: payments.length,
    };

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze subscription churn risk based on this data and respond ONLY with valid JSON (no markdown):
${JSON.stringify(analysisData, null, 2)}

Respond with this exact JSON structure:
{
  "risk": "low" or "medium" or "high",
  "probability": 0.0 to 1.0,
  "factors": ["factor1", "factor2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "recommendationsAr": ["توصية1", "توصية2"]
}`
        }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const parsed = JSON.parse(content.text);
        return {
          userId,
          risk: parsed.risk || 'low',
          probability: parsed.probability || 0,
          factors: parsed.factors || [],
          recommendations: parsed.recommendations || [],
          recommendationsAr: parsed.recommendationsAr || [],
        };
      }
    } catch (error: any) {
      console.error('[AI Billing] Churn analysis error:', error.message);
    }

    const failureRate = analysisData.totalPayments > 0 
      ? analysisData.failedPayments / analysisData.totalPayments 
      : 0;

    return {
      userId,
      risk: failureRate > 0.3 ? 'high' : failureRate > 0.1 ? 'medium' : 'low',
      probability: Math.min(failureRate * 2, 1),
      factors: failureRate > 0 ? ['Payment failures detected'] : [],
      recommendations: ['Monitor account closely'],
      recommendationsAr: ['مراقبة الحساب عن كثب'],
    };
  }

  async suggestUpgrades(): Promise<UpgradeSuggestion[]> {
    const subscriptions = await storage.getAllUserSubscriptions();
    const plans = await storage.getSubscriptionPlans();
    const suggestions: UpgradeSuggestion[] = [];

    for (const sub of subscriptions.filter(s => s.status === 'active')) {
      const currentPlan = plans.find(p => p.id === sub.planId);
      if (!currentPlan) continue;

      const higherPlans = plans.filter(p => p.priceMonthly > currentPlan.priceMonthly);
      if (higherPlans.length === 0) continue;

      const daysSinceStart = Math.floor(
        (Date.now() - new Date(sub.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceStart > 30 && sub.billingCycle === 'monthly') {
        const suggestedPlan = higherPlans[0];
        suggestions.push({
          userId: sub.userId,
          currentPlan: currentPlan.name,
          suggestedPlan: suggestedPlan.name,
          reason: `User has been on ${currentPlan.name} for ${daysSinceStart} days with consistent payments. Consider upgrade to ${suggestedPlan.name} for additional features.`,
          reasonAr: `المستخدم على خطة ${currentPlan.name} منذ ${daysSinceStart} يوماً مع دفعات منتظمة. فكر في الترقية إلى ${suggestedPlan.name} للميزات الإضافية.`,
          potentialValue: suggestedPlan.priceMonthly - currentPlan.priceMonthly,
        });
      }
    }

    return suggestions;
  }

  async generateBillingInsights(): Promise<BillingInsight[]> {
    const insights: BillingInsight[] = [];
    const subscriptions = await storage.getAllUserSubscriptions();
    const retryQueue = await storage.getPendingPaymentRetries();

    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const pastDueCount = subscriptions.filter(s => s.status === 'past_due').length;
    const cancelledCount = subscriptions.filter(s => s.status === 'cancelled').length;

    if (pastDueCount > 0) {
      insights.push({
        type: 'payment_issue',
        title: `${pastDueCount} subscriptions past due`,
        titleAr: `${pastDueCount} اشتراكات متأخرة في الدفع`,
        description: `There are ${pastDueCount} subscriptions with overdue payments that need attention.`,
        descriptionAr: `هناك ${pastDueCount} اشتراكات متأخرة في الدفع تحتاج إلى متابعة.`,
        actionRequired: true,
        priority: pastDueCount > 5 ? 'critical' : 'high',
        metadata: { pastDueCount },
      });
    }

    if (retryQueue.length > 0) {
      insights.push({
        type: 'payment_issue',
        title: `${retryQueue.length} payments in retry queue`,
        titleAr: `${retryQueue.length} مدفوعات في قائمة إعادة المحاولة`,
        description: `${retryQueue.length} failed payments are scheduled for automatic retry.`,
        descriptionAr: `${retryQueue.length} مدفوعات فاشلة مجدولة لإعادة المحاولة تلقائياً.`,
        actionRequired: false,
        priority: 'medium',
        metadata: { retryCount: retryQueue.length },
      });
    }

    const churnRate = activeCount > 0 
      ? cancelledCount / (activeCount + cancelledCount) * 100 
      : 0;

    if (churnRate > 10) {
      insights.push({
        type: 'churn_risk',
        title: `High churn rate: ${churnRate.toFixed(1)}%`,
        titleAr: `معدل إلغاء مرتفع: ${churnRate.toFixed(1)}%`,
        description: `The current churn rate of ${churnRate.toFixed(1)}% is above the healthy threshold. Consider implementing retention strategies.`,
        descriptionAr: `معدل الإلغاء الحالي ${churnRate.toFixed(1)}% أعلى من الحد الصحي. فكر في تنفيذ استراتيجيات الاحتفاظ.`,
        actionRequired: true,
        priority: churnRate > 20 ? 'critical' : 'high',
        metadata: { churnRate, activeCount, cancelledCount },
      });
    }

    const upgradeSuggestions = await this.suggestUpgrades();
    if (upgradeSuggestions.length > 0) {
      const totalPotentialRevenue = upgradeSuggestions.reduce((sum, s) => sum + s.potentialValue, 0);
      insights.push({
        type: 'upgrade_opportunity',
        title: `${upgradeSuggestions.length} upgrade opportunities`,
        titleAr: `${upgradeSuggestions.length} فرص ترقية`,
        description: `Found ${upgradeSuggestions.length} users who may benefit from an upgrade. Potential additional monthly revenue: $${(totalPotentialRevenue / 100).toFixed(2)}`,
        descriptionAr: `تم العثور على ${upgradeSuggestions.length} مستخدمين قد يستفيدون من الترقية. الإيرادات الشهرية الإضافية المحتملة: $${(totalPotentialRevenue / 100).toFixed(2)}`,
        actionRequired: false,
        priority: 'medium',
        metadata: { upgradeCount: upgradeSuggestions.length, potentialRevenue: totalPotentialRevenue },
      });
    }

    for (const insight of insights) {
      try {
        await storage.createAiBillingInsight({
          insightType: insight.type,
          title: insight.title,
          titleAr: insight.titleAr,
          description: insight.description,
          descriptionAr: insight.descriptionAr,
          actionRequired: insight.actionRequired,
          metadata: insight.metadata,
        });
      } catch (err) {
        console.error('[AI Billing] Error saving insight:', err);
      }
    }

    return insights;
  }

  async getStoredInsights(limit = 20): Promise<AiBillingInsight[]> {
    return storage.getAiBillingInsights(limit);
  }
}

export const aiBillingService = new AIBillingService();
