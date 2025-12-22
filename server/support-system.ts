/**
 * Intelligent Support System Service
 * نظام الدعم الذكي
 * 
 * AI-powered support system with:
 * - AI-first engagement
 * - Smart routing and escalation
 * - Knowledge base integration
 * - Agent copilot assistance
 */

import { db } from "./db";
import { eq, desc, asc, and, sql, isNull, gte, lte, or, like } from "drizzle-orm";
import {
  supportSessions,
  supportMessages,
  supportKnowledgeBase,
  supportAgents,
  supportSlaPolicies,
  supportRoutingRules,
  supportAnalytics,
  supportDiagnostics,
  users,
  type SupportSession,
  type SupportMessage,
  type SupportKnowledgeBase,
  type SupportAgent,
  type SupportSlaPolicy,
  type SupportRoutingRule,
  type InsertSupportSession,
  type InsertSupportMessage,
} from "@shared/schema";
import { aiExecutionLayer } from "./ai-execution-layer";

// ==================== AI SUPPORT ASSISTANT ====================

interface AIAssistantResponse {
  content: string;
  contentAr?: string;
  confidence: number;
  suggestedCategory?: string;
  suggestedPriority?: string;
  knowledgeBaseArticles?: string[];
  shouldEscalate: boolean;
  escalationReason?: string;
  diagnosticSuggestions?: string[];
}

interface RoutingRecommendation {
  agentId?: string;
  agentName?: string;
  priority: string;
  estimatedResponseTime: number;
  reason: string;
}

class SupportAIAssistant {
  private readonly serviceId = 'support_ai';
  private readonly confidenceThreshold = 0.7;

  async analyzeAndRespond(
    sessionId: string,
    userMessage: string,
    context: {
      category?: string;
      previousMessages?: Array<{ role: string; content: string }>;
      platformContext?: Record<string, unknown>;
      userId?: string;
    }
  ): Promise<AIAssistantResponse> {
    try {
      // Step 1: Pre-analyze the message to detect category
      const preAnalysis = this.preAnalyzeMessage(userMessage);
      const detectedCategory = preAnalysis.category || context.category || 'general';
      
      // Step 2: Run smart diagnostics based on detected category
      const diagnosticInfo = await this.runSmartDiagnostics(
        detectedCategory,
        userMessage,
        context.userId,
        context.platformContext
      );
      
      // Step 3: Search knowledge base
      const knowledgeArticles = await this.searchKnowledgeBase(userMessage);
      
      // Step 4: Build enhanced context with diagnostics
      const systemPrompt = this.buildSystemPrompt(knowledgeArticles, {
        ...context,
        category: detectedCategory,
        diagnosticInfo,
      });
      
      const messages = [
        ...(context.previousMessages || []),
        { role: 'user', content: userMessage }
      ];

      const response = await aiExecutionLayer.executeAI(this.serviceId, messages as any, {
        overrideSystemPrompt: systemPrompt,
        temperature: 0.3,
      });

      if (!response.success) {
        // Provide category-specific fallback response instead of generic error
        const fallbackResponse = this.getCategoryFallbackResponse(detectedCategory, preAnalysis);
        return {
          content: fallbackResponse.en,
          contentAr: fallbackResponse.ar,
          confidence: 0.5,
          suggestedCategory: detectedCategory,
          shouldEscalate: true,
          escalationReason: 'AI processing error - provided guided response',
          diagnosticSuggestions: preAnalysis.diagnostics,
        };
      }

      const aiContent = response.content || '';
      const analysis = this.analyzeResponse(aiContent, userMessage, knowledgeArticles);

      return {
        content: aiContent,
        confidence: analysis.confidence,
        suggestedCategory: analysis.category,
        suggestedPriority: analysis.priority,
        knowledgeBaseArticles: knowledgeArticles.map(a => a.id),
        shouldEscalate: analysis.confidence < this.confidenceThreshold,
        escalationReason: analysis.confidence < this.confidenceThreshold 
          ? `AI confidence ${(analysis.confidence * 100).toFixed(0)}% below threshold`
          : undefined,
        diagnosticSuggestions: analysis.diagnostics,
      };
    } catch (error) {
      console.error('AI Support Assistant error:', error);
      const preAnalysis = this.preAnalyzeMessage(userMessage);
      const fallbackResponse = this.getCategoryFallbackResponse(preAnalysis.category, preAnalysis);
      return {
        content: fallbackResponse.en,
        contentAr: fallbackResponse.ar,
        confidence: 0.4,
        suggestedCategory: preAnalysis.category,
        shouldEscalate: true,
        escalationReason: 'System error - provided guided response',
        diagnosticSuggestions: preAnalysis.diagnostics,
      };
    }
  }

  private preAnalyzeMessage(message: string): { category: string; intent: string; diagnostics: string[] } {
    const lowerMessage = message.toLowerCase();
    
    // Detect category from keywords (Arabic + English) - covers all categories
    const categoryPatterns: Record<string, { keywords: string[]; intent: string; diagnostics: string[] }> = {
      billing: {
        keywords: ['payment', 'pay', 'invoice', 'billing', 'charge', 'refund', 'subscription', 'price', 'cost',
          'فاتورة', 'فواتير', 'دفع', 'سداد', 'اشتراك', 'رسوم', 'يقبل', 'لا يقبل', 'بطاقة', 'مالي', 'سعر', 'تكلفة'],
        intent: 'payment_issue',
        diagnostics: ['Check subscription status', 'Review payment history', 'Verify payment method']
      },
      ai: {
        keywords: ['ai', 'model', 'claude', 'openai', 'copilot', 'generate', 'assistant',
          'ذكاء', 'اصطناعي', 'كلود', 'نموذج', 'توليد', 'مساعد'],
        intent: 'ai_issue',
        diagnostics: ['Check API quota', 'Review model availability', 'Check rate limits']
      },
      security: {
        keywords: ['password', 'login', 'access', 'hack', 'security', 'auth', 'token', '2fa',
          'كلمة مرور', 'تسجيل دخول', 'أمان', 'صلاحية', 'اختراق'],
        intent: 'security_issue',
        diagnostics: ['Check login attempts', 'Review account status', 'Verify identity']
      },
      account: {
        keywords: ['account', 'profile', 'settings', 'email', 'user', 'register',
          'حساب', 'ملف', 'إعدادات', 'بريد', 'مستخدم', 'تسجيل'],
        intent: 'account_issue',
        diagnostics: ['Check profile status', 'Verify email', 'Review account flags']
      },
      performance: {
        keywords: ['slow', 'speed', 'timeout', 'loading', 'performance', 'lag', 'hang', 'freeze',
          'بطيء', 'سرعة', 'تحميل', 'أداء', 'تعليق', 'تجمد', 'انتظار'],
        intent: 'performance_issue',
        diagnostics: ['Check system load', 'Review response times', 'Check network latency']
      },
      ui: {
        keywords: ['interface', 'button', 'screen', 'display', 'design', 'dark mode', 'theme', 'layout',
          'واجهة', 'زر', 'شاشة', 'عرض', 'تصميم', 'الوضع الداكن', 'مظهر'],
        intent: 'ui_issue',
        diagnostics: ['Check browser compatibility', 'Review display settings', 'Check theme configuration']
      },
      api: {
        keywords: ['api', 'endpoint', 'rest', 'request', 'response', 'error code', 'integration', 'webhook',
          'واجهة برمجة', 'طلب', 'استجابة', 'خطأ برمجي', 'ربط'],
        intent: 'api_issue',
        diagnostics: ['Check API key status', 'Review rate limits', 'Check endpoint availability']
      },
    };

    for (const [category, config] of Object.entries(categoryPatterns)) {
      if (config.keywords.some(k => lowerMessage.includes(k) || message.includes(k))) {
        return { category, intent: config.intent, diagnostics: config.diagnostics };
      }
    }

    return { category: 'general', intent: 'general_inquiry', diagnostics: [] };
  }

  private async runSmartDiagnostics(
    category: string,
    message: string,
    userId?: string,
    platformContext?: Record<string, unknown>
  ): Promise<string> {
    const diagnostics: string[] = [];

    try {
      if (category === 'billing' && userId) {
        // Check user subscription and payment status
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });
        
        if (user) {
          diagnostics.push(`User Status: ${user.status || 'active'}`);
          diagnostics.push(`Role: ${user.role || 'user'}`);
          if (user.stripeCustomerId) {
            diagnostics.push('Payment Integration: Connected');
          } else {
            diagnostics.push('Payment Integration: Not configured - this may be the issue');
          }
        }
      }

      if (category === 'account' && userId) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, userId),
        });
        
        if (user) {
          diagnostics.push(`Account Status: ${user.status || 'active'}`);
          diagnostics.push(`Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
          diagnostics.push(`Created: ${user.createdAt}`);
        }
      }

      // Add platform context info
      if (platformContext) {
        diagnostics.push(`Platform Context: ${JSON.stringify(platformContext)}`);
      }

    } catch (error) {
      console.error('Diagnostic error:', error);
      diagnostics.push('Unable to fetch some diagnostic data');
    }

    return diagnostics.length > 0 ? diagnostics.join('\n') : 'No additional diagnostic data available';
  }

  private getCategoryFallbackResponse(category: string, analysis: { intent: string; diagnostics: string[] }): { ar: string; en: string } {
    const responses: Record<string, { ar: string; en: string }> = {
      billing: {
        ar: `أفهم أنك تواجه مشكلة في نظام الفواتير أو الدفع. إليك بعض الخطوات التي قد تساعد:

1. تأكد من صلاحية بطاقة الدفع الخاصة بك
2. تحقق من توفر رصيد كافٍ في حسابك البنكي
3. جرب استخدام طريقة دفع مختلفة (بطاقة أخرى أو Apple Pay)
4. تأكد من إدخال معلومات البطاقة بشكل صحيح

إذا استمرت المشكلة، سيتواصل معك أحد أعضاء فريق الدعم قريباً.`,
        en: `I understand you're having a billing or payment issue. Here are some steps that may help:

1. Verify your payment card is still valid
2. Check that you have sufficient funds in your bank account
3. Try using a different payment method (another card or Apple Pay)
4. Ensure your card information is entered correctly

If the issue persists, a support team member will contact you shortly.`
      },
      ai: {
        ar: `أفهم أنك تواجه مشكلة مع خدمات الذكاء الاصطناعي. إليك بعض الحلول المقترحة:

1. تحقق من حالة اتصالك بالإنترنت
2. حاول تحديث الصفحة وإعادة المحاولة
3. تأكد من أن استخدامك ضمن الحد المسموح

سيتم مراجعة طلبك من قبل فريق الدعم الفني.`,
        en: `I understand you're experiencing an AI service issue. Here are some suggested solutions:

1. Check your internet connection
2. Try refreshing the page and retry
3. Ensure your usage is within allowed limits

Your request will be reviewed by our technical support team.`
      },
      security: {
        ar: `أفهم أن لديك استفسار أمني. لحماية حسابك:

1. لا تشارك كلمة المرور مع أي شخص
2. استخدم كلمة مرور قوية وفريدة
3. فعّل المصادقة الثنائية إن أمكن

سيتواصل معك فريق الأمان قريباً للمساعدة.`,
        en: `I understand you have a security concern. To protect your account:

1. Never share your password with anyone
2. Use a strong, unique password
3. Enable two-factor authentication if available

Our security team will contact you shortly to assist.`
      },
      account: {
        ar: `أفهم أن لديك استفسار حول حسابك. يمكنك:

1. تحديث معلومات حسابك من صفحة الإعدادات
2. التحقق من بريدك الإلكتروني لأي رسائل تأكيد
3. مراجعة تفاصيل اشتراكك

سيتم مراجعة طلبك من قبل فريق الدعم.`,
        en: `I understand you have an account inquiry. You can:

1. Update your account information from the Settings page
2. Check your email for any confirmation messages
3. Review your subscription details

Your request will be reviewed by our support team.`
      },
      performance: {
        ar: `أفهم أنك تواجه مشكلة في الأداء أو السرعة. إليك بعض الخطوات:

1. تحقق من اتصالك بالإنترنت
2. جرب تحديث الصفحة (Ctrl+F5)
3. أغلق التبويبات غير الضرورية في المتصفح
4. جرب استخدام متصفح مختلف

إذا استمرت المشكلة، سيتم مراجعة أداء حسابك من قبل فريقنا الفني.`,
        en: `I understand you're experiencing performance or speed issues. Here are some steps:

1. Check your internet connection
2. Try refreshing the page (Ctrl+F5)
3. Close unnecessary browser tabs
4. Try using a different browser

If the issue persists, our technical team will review your account performance.`
      },
      ui: {
        ar: `أفهم أن لديك مشكلة في واجهة المستخدم أو العرض. يمكنك تجربة:

1. تبديل الوضع الداكن/الفاتح من الإعدادات
2. مسح ذاكرة التخزين المؤقت للمتصفح
3. التأكد من تحديث المتصفح لأحدث إصدار
4. تجربة تكبير/تصغير الصفحة (Ctrl + أو -)

سيتم إبلاغ فريق التطوير بملاحظتك.`,
        en: `I understand you have a UI or display issue. You can try:

1. Toggle dark/light mode from settings
2. Clear your browser cache
3. Make sure your browser is updated to the latest version
4. Try zooming in/out (Ctrl + or -)

Your feedback will be reported to our development team.`
      },
      api: {
        ar: `أفهم أنك تواجه مشكلة مع واجهة برمجة التطبيقات (API). إليك بعض النقاط للتحقق منها:

1. تأكد من صلاحية مفتاح API الخاص بك
2. تحقق من عدم تجاوز حد الطلبات المسموح
3. راجع وثائق API للتأكد من صحة الطلب
4. تحقق من رسالة الخطأ المُرجعة

للمساعدة التقنية المتقدمة، سيتواصل معك أحد المطورين.`,
        en: `I understand you're facing an API issue. Here are some points to check:

1. Ensure your API key is valid
2. Check you haven't exceeded the rate limit
3. Review the API documentation to verify your request format
4. Check the error message returned

For advanced technical assistance, a developer will contact you.`
      },
      general: {
        ar: `شكراً لتواصلك معنا. أفهم استفسارك وسأحاول مساعدتك.

يمكنك أيضاً:
- مراجعة مركز المساعدة للإجابات السريعة
- التواصل معنا عبر البريد الإلكتروني

سيتم تحويلك لأحد أعضاء فريق الدعم للمساعدة بشكل أفضل.`,
        en: `Thank you for contacting us. I understand your inquiry and will try to help.

You can also:
- Check the Help Center for quick answers
- Contact us via email

You will be connected with a support team member for better assistance.`
      }
    };

    return responses[category] || responses.general;
  }

  private buildSystemPrompt(
    articles: SupportKnowledgeBase[],
    context: { category?: string; platformContext?: Record<string, unknown>; diagnosticInfo?: string }
  ): string {
    const knowledgeContext = articles.length > 0
      ? `\n\nRelevant Knowledge Base Articles:\n${articles.map(a => `- ${a.title}: ${a.content.substring(0, 500)}`).join('\n')}`
      : '';

    const platformInfo = context.platformContext
      ? `\n\nPlatform Context:\n${JSON.stringify(context.platformContext, null, 2)}`
      : '';

    const diagnosticInfo = context.diagnosticInfo
      ? `\n\nDiagnostic Information:\n${context.diagnosticInfo}`
      : '';

    const categorySpecificInstructions = this.getCategoryInstructions(context.category);

    return `أنت مساعد الدعم الذكي لمنصة INFERA WebNova - منصة سيادية لبناء المنصات الرقمية.
You are an AI Support Assistant for INFERA WebNova - a sovereign-grade platform for building digital platforms.

IMPORTANT: You MUST respond in Arabic first, then English. Always provide bilingual responses.

Your capabilities:
1. Understand and analyze user issues in both Arabic and English
2. Provide step-by-step solutions based on diagnostic data
3. Reference knowledge base articles when available
4. Identify issue severity and urgency
5. Take action to help resolve issues when possible

${categorySpecificInstructions}

Guidelines:
- ALWAYS respond in Arabic first, then English
- Be professional, helpful, and provide specific actionable steps
- Use the diagnostic information provided to give accurate answers
- If you can see the issue from diagnostics, explain what you found
- Only escalate if the issue truly requires human intervention
- Never expose sensitive system information like passwords or tokens
${knowledgeContext}${platformInfo}${diagnosticInfo}

Respond helpfully to the user's issue with specific solutions based on the available data.`;
  }

  private getCategoryInstructions(category?: string): string {
    const instructions: Record<string, string> = {
      billing: `
BILLING ISSUE INSTRUCTIONS:
- Check if the user has an active subscription
- Look for failed payment attempts in recent history
- Common billing issues: expired card, insufficient funds, wrong payment method
- For "payment not accepted" issues: suggest checking card validity, trying different payment method
- Provide steps to update payment information if needed`,
      ai: `
AI/MODEL ISSUE INSTRUCTIONS:
- Check API key status and quota usage
- Look for rate limiting issues
- Common AI issues: timeout, model unavailable, quota exceeded
- Provide guidance on model selection and usage optimization`,
      security: `
SECURITY ISSUE INSTRUCTIONS:
- Never share or reset passwords directly
- Guide user through official password reset flow
- Check for suspicious login attempts
- Verify account ownership before any sensitive actions`,
      account: `
ACCOUNT ISSUE INSTRUCTIONS:
- Check user profile completeness
- Verify email confirmation status
- Look for account restrictions or flags
- Guide through account recovery if needed`,
    };
    return instructions[category || ''] || '';
  }

  private async searchKnowledgeBase(query: string): Promise<SupportKnowledgeBase[]> {
    try {
      const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      
      if (keywords.length === 0) return [];

      const articles = await db.query.supportKnowledgeBase.findMany({
        where: and(
          eq(supportKnowledgeBase.isPublished, true),
          or(
            ...keywords.map(keyword => 
              or(
                like(supportKnowledgeBase.title, `%${keyword}%`),
                like(supportKnowledgeBase.content, `%${keyword}%`)
              )
            )
          )
        ),
        limit: 5,
        orderBy: [desc(supportKnowledgeBase.aiRelevanceScore)],
      });

      return articles;
    } catch (error) {
      console.error('Knowledge base search error:', error);
      return [];
    }
  }

  private analyzeResponse(
    aiResponse: string,
    userMessage: string,
    articles: SupportKnowledgeBase[]
  ): {
    confidence: number;
    category: string;
    priority: string;
    diagnostics: string[];
  } {
    let confidence = 0.8;
    
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    if (articles.length > 0) confidence += 0.1;
    if (lowerResponse.includes('not sure') || lowerResponse.includes('uncertain')) confidence -= 0.2;
    if (lowerResponse.includes('escalate') || lowerResponse.includes('human agent')) confidence -= 0.3;
    if (aiResponse.length < 50) confidence -= 0.2;

    const categoryKeywords: Record<string, string[]> = {
      billing: [
        'payment', 'invoice', 'subscription', 'charge', 'refund', 'price', 'billing', 'pay',
        'فاتورة', 'فواتير', 'دفع', 'سداد', 'اشتراك', 'رسوم', 'استرداد', 'سعر', 'مالية', 'بطاقة', 'يقبل', 'لا يقبل'
      ],
      ai: [
        'model', 'claude', 'openai', 'ai', 'artificial', 'intelligence', 'copilot',
        'ذكاء', 'اصطناعي', 'نموذج', 'كلود', 'مساعد ذكي'
      ],
      api: [
        'api', 'endpoint', 'rest', 'request', 'response', 'error code',
        'واجهة برمجة', 'طلب', 'استجابة', 'خطأ برمجي'
      ],
      security: [
        'password', 'login', 'authentication', 'permission', 'access', 'hack',
        'كلمة مرور', 'تسجيل دخول', 'صلاحية', 'وصول', 'اختراق', 'أمان'
      ],
      ui: [
        'interface', 'button', 'screen', 'display', 'design', 'dark mode',
        'واجهة', 'زر', 'شاشة', 'عرض', 'تصميم', 'الوضع الداكن'
      ],
      account: [
        'account', 'profile', 'settings', 'email', 'user',
        'حساب', 'ملف شخصي', 'إعدادات', 'بريد', 'مستخدم'
      ],
      performance: [
        'slow', 'speed', 'timeout', 'loading', 'performance',
        'بطيء', 'سرعة', 'تحميل', 'أداء', 'تعليق'
      ],
    };

    let category = 'general';
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(k => lowerMessage.includes(k))) {
        category = cat;
        break;
      }
    }

    let priority = 'medium';
    const urgentKeywords = ['urgent', 'emergency', 'down', 'critical', 'broken', 'not working'];
    const lowKeywords = ['question', 'wondering', 'curious', 'feature request'];
    
    if (urgentKeywords.some(k => lowerMessage.includes(k))) priority = 'high';
    if (lowKeywords.some(k => lowerMessage.includes(k))) priority = 'low';

    const diagnostics: string[] = [];
    if (lowerMessage.includes('error')) diagnostics.push('Check error logs');
    if (lowerMessage.includes('api')) diagnostics.push('Review API call history');
    if (lowerMessage.includes('slow')) diagnostics.push('Check performance metrics');

    confidence = Math.max(0, Math.min(1, confidence));

    return { confidence, category, priority, diagnostics };
  }

  async summarizeSession(sessionId: string): Promise<{ summary: string; summaryAr: string }> {
    try {
      const messages = await db.query.supportMessages.findMany({
        where: eq(supportMessages.sessionId, sessionId),
        orderBy: [asc(supportMessages.createdAt)],
      });

      if (messages.length === 0) {
        return { summary: 'No messages in session', summaryAr: 'لا توجد رسائل في الجلسة' };
      }

      const conversation = messages.map(m => 
        `${m.senderType}: ${m.content}`
      ).join('\n');

      const response = await aiExecutionLayer.executeAI(this.serviceId, [
        { role: 'user', content: `Summarize this support conversation in 2-3 sentences:\n\n${conversation}` }
      ], {
        overrideSystemPrompt: 'You are a summarization assistant. Provide concise, professional summaries.',
        maxTokens: 200,
      });

      return {
        summary: response.content || 'Unable to generate summary',
        summaryAr: response.content || 'تعذر إنشاء الملخص',
      };
    } catch (error) {
      console.error('Session summarization error:', error);
      return { summary: 'Summary unavailable', summaryAr: 'الملخص غير متاح' };
    }
  }

  async suggestAgentResponse(
    sessionId: string,
    agentId: string
  ): Promise<{ suggestion: string; confidence: number }> {
    try {
      const messages = await db.query.supportMessages.findMany({
        where: eq(supportMessages.sessionId, sessionId),
        orderBy: [asc(supportMessages.createdAt)],
        limit: 20,
      });

      const conversation = messages.map(m => ({
        role: m.senderType === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const response = await aiExecutionLayer.executeAI(this.serviceId, [
        ...conversation,
        { role: 'user', content: 'Suggest a helpful response for the support agent to send:' }
      ] as any, {
        overrideSystemPrompt: 'You are an AI copilot for support agents. Suggest professional, helpful responses.',
        maxTokens: 500,
      });

      return {
        suggestion: response.content || '',
        confidence: 0.85,
      };
    } catch (error) {
      console.error('Agent suggestion error:', error);
      return { suggestion: '', confidence: 0 };
    }
  }
}

// ==================== SUPPORT SESSION MANAGER ====================

class SupportSessionManager {
  private ticketCounter = 0;

  async generateTicketNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    
    const todayStart = new Date(date.setHours(0, 0, 0, 0));
    const todayEnd = new Date(date.setHours(23, 59, 59, 999));
    
    const todayCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(supportSessions)
      .where(
        and(
          gte(supportSessions.createdAt, todayStart),
          lte(supportSessions.createdAt, todayEnd)
        )
      );
    
    const count = (todayCount[0]?.count || 0) + 1;
    return `SUP-${dateStr}-${count.toString().padStart(4, '0')}`;
  }

  async createSession(data: {
    userId?: string;
    userEmail?: string;
    userName?: string;
    subject: string;
    channel: string;
    category?: string;
    priority?: string;
    platformContext?: Record<string, unknown>;
  }): Promise<SupportSession> {
    const ticketNumber = await this.generateTicketNumber();
    
    const sla = await this.getSLAPolicy(data.priority || 'medium');
    const now = new Date();
    
    const [session] = await db.insert(supportSessions).values({
      ticketNumber,
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      subject: data.subject,
      channel: data.channel as any,
      category: data.category || 'general',
      priority: data.priority || 'medium',
      status: 'open',
      aiHandled: data.channel === 'ai_chat',
      slaId: sla?.id,
      slaFirstResponseDue: sla ? new Date(now.getTime() + sla.firstResponseTime * 60000) : null,
      slaResolutionDue: sla ? new Date(now.getTime() + sla.resolutionTime * 60000) : null,
      platformContext: data.platformContext || {},
    }).returning();

    return session;
  }

  async getSession(sessionId: string): Promise<SupportSession | null> {
    const session = await db.query.supportSessions.findFirst({
      where: eq(supportSessions.id, sessionId),
    });
    return session ?? null;
  }

  async updateSession(
    sessionId: string,
    data: Partial<InsertSupportSession>
  ): Promise<SupportSession | null> {
    const [session] = await db
      .update(supportSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supportSessions.id, sessionId))
      .returning();
    return session || null;
  }

  async addMessage(data: {
    sessionId: string;
    senderType: 'user' | 'agent' | 'ai' | 'system';
    senderId?: string;
    senderName?: string;
    content: string;
    contentAr?: string;
    isAiGenerated?: boolean;
    aiConfidence?: number;
    aiModelUsed?: string;
    isInternal?: boolean;
    attachments?: Array<{ type: string; url: string; name: string }>;
  }): Promise<SupportMessage> {
    const [message] = await db.insert(supportMessages).values({
      sessionId: data.sessionId,
      senderType: data.senderType,
      senderId: data.senderId,
      senderName: data.senderName,
      content: data.content,
      contentAr: data.contentAr,
      isAiGenerated: data.isAiGenerated || false,
      aiConfidence: data.aiConfidence,
      aiModelUsed: data.aiModelUsed,
      isInternal: data.isInternal || false,
      attachments: data.attachments || [],
      contentType: 'text',
    }).returning();

    await db
      .update(supportSessions)
      .set({ updatedAt: new Date() })
      .where(eq(supportSessions.id, data.sessionId));

    return message;
  }

  async getMessages(sessionId: string, includeInternal: boolean = false): Promise<SupportMessage[]> {
    const conditions = [eq(supportMessages.sessionId, sessionId)];
    
    if (!includeInternal) {
      conditions.push(eq(supportMessages.isInternal, false));
    }

    return db.query.supportMessages.findMany({
      where: and(...conditions),
      orderBy: [asc(supportMessages.createdAt)],
    });
  }

  async assignAgent(sessionId: string, agentId: string): Promise<SupportSession | null> {
    const [session] = await db
      .update(supportSessions)
      .set({
        assignedAgentId: agentId,
        assignedAt: new Date(),
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(supportSessions.id, sessionId))
      .returning();

    if (session) {
      await db
        .update(supportAgents)
        .set({ 
          currentChatCount: sql`${supportAgents.currentChatCount} + 1`,
          status: 'busy',
        })
        .where(eq(supportAgents.userId, agentId));
    }

    return session || null;
  }

  async resolveSession(
    sessionId: string,
    resolvedBy: string,
    resolutionType: string,
    notes?: string
  ): Promise<SupportSession | null> {
    const now = new Date();
    const session = await this.getSession(sessionId);
    
    const [updated] = await db
      .update(supportSessions)
      .set({
        status: 'resolved',
        resolvedAt: now,
        resolvedBy,
        resolutionType,
        resolutionNotes: notes,
        closedAt: now,
        slaResolutionMet: session?.slaResolutionDue ? now <= session.slaResolutionDue : null,
        updatedAt: now,
      })
      .where(eq(supportSessions.id, sessionId))
      .returning();

    if (session?.assignedAgentId) {
      await db
        .update(supportAgents)
        .set({
          currentChatCount: sql`GREATEST(0, ${supportAgents.currentChatCount} - 1)`,
          totalSessionsHandled: sql`${supportAgents.totalSessionsHandled} + 1`,
        })
        .where(eq(supportAgents.userId, session.assignedAgentId));
    }

    return updated || null;
  }

  private async getSLAPolicy(priority: string): Promise<SupportSlaPolicy | null> {
    const policy = await db.query.supportSlaPolicies.findFirst({
      where: and(
        eq(supportSlaPolicies.isActive, true),
        or(
          eq(supportSlaPolicies.targetPriority, priority),
          isNull(supportSlaPolicies.targetPriority)
        )
      ),
      orderBy: [asc(supportSlaPolicies.priority)],
    });
    return policy ?? null;
  }

  async getOpenSessions(filters?: {
    status?: string;
    priority?: string;
    channel?: string;
    agentId?: string;
    limit?: number;
  }): Promise<SupportSession[]> {
    const conditions: any[] = [];
    
    if (filters?.status) {
      conditions.push(eq(supportSessions.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(supportSessions.priority, filters.priority));
    }
    if (filters?.channel) {
      conditions.push(eq(supportSessions.channel, filters.channel));
    }
    if (filters?.agentId) {
      conditions.push(eq(supportSessions.assignedAgentId, filters.agentId));
    }

    return db.query.supportSessions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(supportSessions.createdAt)],
      limit: filters?.limit || 50,
    });
  }

  async getUserSessions(userId: string): Promise<SupportSession[]> {
    return db.query.supportSessions.findMany({
      where: eq(supportSessions.userId, userId),
      orderBy: [desc(supportSessions.createdAt)],
      limit: 20,
    });
  }
}

// ==================== SMART ROUTING ENGINE ====================

class SmartRoutingEngine {
  async getRoutingRecommendation(session: SupportSession): Promise<RoutingRecommendation> {
    const rules = await db.query.supportRoutingRules.findMany({
      where: eq(supportRoutingRules.isActive, true),
      orderBy: [asc(supportRoutingRules.priority)],
    });

    for (const rule of rules) {
      if (this.matchesRule(session, rule)) {
        if (rule.routeToAgentId) {
          const agent = await db.query.supportAgents.findFirst({
            where: eq(supportAgents.id, rule.routeToAgentId),
          });
          
          if (agent && agent.status === 'available' && agent.currentChatCount < agent.maxConcurrentChats) {
            return {
              agentId: agent.userId,
              agentName: agent.displayName,
              priority: rule.priorityOverride || session.priority,
              estimatedResponseTime: agent.averageResponseTime || 300,
              reason: `Matched rule: ${rule.name}`,
            };
          }
        }

        if (rule.routeToSkill) {
          const agent = await this.findAgentBySkill(rule.routeToSkill);
          if (agent) {
            return {
              agentId: agent.userId,
              agentName: agent.displayName,
              priority: rule.priorityOverride || session.priority,
              estimatedResponseTime: agent.averageResponseTime || 300,
              reason: `Matched skill: ${rule.routeToSkill}`,
            };
          }
        }
      }
    }

    const availableAgent = await this.findNextAvailableAgent();
    
    return {
      agentId: availableAgent?.userId,
      agentName: availableAgent?.displayName,
      priority: session.priority,
      estimatedResponseTime: availableAgent?.averageResponseTime || 600,
      reason: availableAgent ? 'Round-robin assignment' : 'No agents available',
    };
  }

  private matchesRule(session: SupportSession, rule: SupportRoutingRule): boolean {
    if (rule.matchCategory && rule.matchCategory !== session.category) return false;
    if (rule.matchPriority && rule.matchPriority !== session.priority) return false;
    if (rule.matchChannel && rule.matchChannel !== session.channel) return false;
    
    if (rule.matchKeywords && Array.isArray(rule.matchKeywords) && rule.matchKeywords.length > 0) {
      const subject = session.subject.toLowerCase();
      const hasKeyword = (rule.matchKeywords as string[]).some(k => 
        subject.includes(k.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    return true;
  }

  private async findAgentBySkill(skill: string): Promise<SupportAgent | null> {
    const agents = await db.query.supportAgents.findMany({
      where: and(
        eq(supportAgents.status, 'available'),
      ),
      orderBy: [
        desc(supportAgents.averageRating),
        asc(supportAgents.currentChatCount),
      ],
    });

    return agents.find(a => 
      Array.isArray(a.skills) && 
      (a.skills as string[]).includes(skill) &&
      a.currentChatCount < a.maxConcurrentChats
    ) || null;
  }

  private async findNextAvailableAgent(): Promise<SupportAgent | null> {
    const agent = await db.query.supportAgents.findFirst({
      where: and(
        eq(supportAgents.status, 'available'),
        sql`${supportAgents.currentChatCount} < ${supportAgents.maxConcurrentChats}`,
      ),
      orderBy: [
        asc(supportAgents.currentChatCount),
        desc(supportAgents.averageRating),
      ],
    });
    return agent ?? null;
  }
}

// ==================== KNOWLEDGE BASE MANAGER ====================

class KnowledgeBaseManager {
  async searchArticles(query: string, limit: number = 10): Promise<SupportKnowledgeBase[]> {
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    if (keywords.length === 0) {
      return db.query.supportKnowledgeBase.findMany({
        where: eq(supportKnowledgeBase.isPublished, true),
        limit,
        orderBy: [desc(supportKnowledgeBase.viewCount)],
      });
    }

    return db.query.supportKnowledgeBase.findMany({
      where: and(
        eq(supportKnowledgeBase.isPublished, true),
        or(
          ...keywords.flatMap(keyword => [
            like(supportKnowledgeBase.title, `%${keyword}%`),
            like(supportKnowledgeBase.content, `%${keyword}%`),
          ])
        )
      ),
      limit,
      orderBy: [desc(supportKnowledgeBase.aiRelevanceScore), desc(supportKnowledgeBase.viewCount)],
    });
  }

  async getArticle(slug: string): Promise<SupportKnowledgeBase | null> {
    const article = await db.query.supportKnowledgeBase.findFirst({
      where: eq(supportKnowledgeBase.slug, slug),
    });

    if (article) {
      await db
        .update(supportKnowledgeBase)
        .set({ viewCount: sql`${supportKnowledgeBase.viewCount} + 1` })
        .where(eq(supportKnowledgeBase.id, article.id));
    }

    return article || null;
  }

  async createArticle(data: {
    slug: string;
    title: string;
    titleAr?: string;
    content: string;
    contentAr?: string;
    category: string;
    subcategory?: string;
    tags?: string[];
    isPublished?: boolean;
    isInternal?: boolean;
    createdBy: string;
  }): Promise<SupportKnowledgeBase> {
    const [article] = await db.insert(supportKnowledgeBase).values({
      ...data,
      isPublished: data.isPublished ?? false,
      isInternal: data.isInternal ?? false,
    }).returning();
    return article;
  }

  async updateArticle(
    id: string,
    data: Partial<SupportKnowledgeBase>,
    updatedBy: string
  ): Promise<SupportKnowledgeBase | null> {
    const [article] = await db
      .update(supportKnowledgeBase)
      .set({ ...data, updatedBy, updatedAt: new Date() })
      .where(eq(supportKnowledgeBase.id, id))
      .returning();
    return article || null;
  }

  async markHelpful(id: string, helpful: boolean): Promise<void> {
    const field = helpful ? 'helpfulCount' : 'notHelpfulCount';
    await db
      .update(supportKnowledgeBase)
      .set({ [field]: sql`${supportKnowledgeBase[field]} + 1` })
      .where(eq(supportKnowledgeBase.id, id));
  }
}

// ==================== AGENT MANAGER ====================

class AgentManager {
  async getAgent(userId: string): Promise<SupportAgent | null> {
    const agent = await db.query.supportAgents.findFirst({
      where: eq(supportAgents.userId, userId),
    });
    return agent ?? null;
  }

  async getAvailableAgents(): Promise<SupportAgent[]> {
    return db.query.supportAgents.findMany({
      where: eq(supportAgents.status, 'available'),
      orderBy: [asc(supportAgents.currentChatCount)],
    });
  }

  async updateStatus(userId: string, status: string): Promise<SupportAgent | null> {
    const [agent] = await db
      .update(supportAgents)
      .set({ status, lastActiveAt: new Date(), updatedAt: new Date() })
      .where(eq(supportAgents.userId, userId))
      .returning();
    return agent || null;
  }

  async createAgent(data: {
    userId: string;
    displayName: string;
    displayNameAr?: string;
    skills?: string[];
    languages?: string[];
    supervisorId?: string;
  }): Promise<SupportAgent> {
    const [agent] = await db.insert(supportAgents).values({
      userId: data.userId,
      displayName: data.displayName,
      displayNameAr: data.displayNameAr,
      skills: data.skills || [],
      languages: data.languages || ['en', 'ar'],
      supervisorId: data.supervisorId,
      status: 'offline',
    }).returning();
    return agent;
  }

  async getAgentStats(userId: string): Promise<{
    totalSessions: number;
    averageRating: number;
    averageResponseTime: number;
    todaySessions: number;
  }> {
    const agent = await this.getAgent(userId);
    if (!agent) {
      return { totalSessions: 0, averageRating: 0, averageResponseTime: 0, todaySessions: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(supportSessions)
      .where(
        and(
          eq(supportSessions.assignedAgentId, userId),
          gte(supportSessions.createdAt, today)
        )
      );

    return {
      totalSessions: agent.totalSessionsHandled,
      averageRating: agent.averageRating || 0,
      averageResponseTime: agent.averageResponseTime || 0,
      todaySessions: todaySessions[0]?.count || 0,
    };
  }
}

// ==================== EXPORT SERVICES ====================

export const supportAI = new SupportAIAssistant();
export const supportSessions$ = new SupportSessionManager();
export const routingEngine = new SmartRoutingEngine();
export const knowledgeBase = new KnowledgeBaseManager();
export const agentManager = new AgentManager();

export {
  SupportAIAssistant,
  SupportSessionManager,
  SmartRoutingEngine,
  KnowledgeBaseManager,
  AgentManager,
};
