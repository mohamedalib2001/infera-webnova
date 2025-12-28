import { db } from './db';
import { novaAiMemory, novaSessions, users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { novaMemory } from './nova-intelligent-memory';
import Anthropic from '@anthropic-ai/sdk';
import type { Express, Request, Response } from 'express';

// ==================== Nova Intelligent Conversation Engine ====================
// محرك المحادثة الذكي - يفهم السياق ويتعلم ويتكيف

const anthropic = new Anthropic();

interface IntentAnalysis {
  primaryIntent: string;
  confidence: number;
  entities: Record<string, string>;
  language: 'ar' | 'en' | 'mixed';
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'simple' | 'moderate' | 'complex';
  requiredSkills: string[];
}

interface IntelligentResponse {
  content: string;
  contentAr: string;
  thinking?: string;
  memoryReferences: string[];
  suggestedFollowups: string[];
  tokensUsed: number;
  costUSD: number;
  processingTimeMs: number;
}

// ==================== Language Detection ====================
function detectLanguage(text: string): 'ar' | 'en' | 'mixed' {
  const arabicPattern = /[\u0600-\u06FF]/;
  const englishPattern = /[a-zA-Z]/;
  
  const hasArabic = arabicPattern.test(text);
  const hasEnglish = englishPattern.test(text);
  
  if (hasArabic && hasEnglish) return 'mixed';
  if (hasArabic) return 'ar';
  return 'en';
}

// ==================== Intent Analysis ====================
async function analyzeIntent(message: string): Promise<IntentAnalysis> {
  const language = detectLanguage(message);
  const lowerMessage = message.toLowerCase();
  
  // Skill detection
  const skillPatterns: Record<string, RegExp[]> = {
    'code_generation': [/(?:اكتب|انشئ|create|write|generate)\s+(?:كود|code|برنامج|program)/i],
    'database': [/(?:قاعدة|بيانات|database|sql|table|جدول)/i],
    'security': [/(?:أمان|أمني|security|scan|فحص|ثغرة|vulnerability)/i],
    'deployment': [/(?:نشر|deploy|hosting|استضافة|server)/i],
    'analysis': [/(?:تحليل|analyze|review|مراجعة)/i],
    'explanation': [/(?:اشرح|explain|كيف|how|why|لماذا|ما هو|what is)/i],
    'cost_estimation': [/(?:تكلفة|سعر|cost|price|ميزانية|budget)/i],
  };
  
  const requiredSkills: string[] = [];
  for (const [skill, patterns] of Object.entries(skillPatterns)) {
    if (patterns.some(p => p.test(message))) {
      requiredSkills.push(skill);
    }
  }
  
  // Complexity estimation
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  if (message.length > 500 || requiredSkills.length > 2) complexity = 'complex';
  else if (message.length > 100 || requiredSkills.length > 1) complexity = 'moderate';
  
  // Sentiment detection
  const positiveWords = /(?:شكرا|ممتاز|رائع|great|thanks|excellent|good|جيد)/i;
  const negativeWords = /(?:مشكلة|خطأ|error|problem|fail|فشل|لا يعمل)/i;
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (positiveWords.test(message)) sentiment = 'positive';
  if (negativeWords.test(message)) sentiment = 'negative';
  
  return {
    primaryIntent: requiredSkills[0] || 'general_conversation',
    confidence: requiredSkills.length > 0 ? 0.85 : 0.6,
    entities: {},
    language,
    sentiment,
    complexity,
    requiredSkills: requiredSkills.length > 0 ? requiredSkills : ['general_conversation'],
  };
}

// ==================== Cost Calculation ====================
function calculateCost(inputTokens: number, outputTokens: number): number {
  // Claude Sonnet pricing (approximate)
  const inputCostPer1K = 0.003;
  const outputCostPer1K = 0.015;
  return (inputTokens / 1000) * inputCostPer1K + (outputTokens / 1000) * outputCostPer1K;
}

// ==================== Main Conversation Handler ====================
async function handleIntelligentConversation(
  userId: string,
  tenantId: string,
  sessionId: string,
  userMessage: string
): Promise<IntelligentResponse> {
  const startTime = Date.now();
  
  // 1. Analyze intent
  const intent = await analyzeIntent(userMessage);
  
  // 2. Build context from memory
  const context = await novaMemory.buildConversationContext(userId, sessionId, userMessage);
  
  // 3. Retrieve relevant memories
  const relevantMemories = await novaMemory.retrieveRelevantMemories(
    userId,
    userMessage,
    5,
    ['learning', 'context', 'decision']
  );
  
  // 4. Build system prompt
  const systemPrompt = buildSystemPrompt(intent, context, relevantMemories);
  
  // 5. Build message history
  const messages = buildMessageHistory(context, userMessage);
  
  // 6. Call Claude
  let response: Anthropic.Messages.Message;
  try {
    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    });
  } catch (error: any) {
    console.error('[Nova Engine] Claude API error:', error);
    throw new Error(`AI service error: ${error.message}`);
  }
  
  // 7. Extract response
  const aiContent = response.content[0].type === 'text' ? response.content[0].text : '';
  const inputTokens = response.usage?.input_tokens || 0;
  const outputTokens = response.usage?.output_tokens || 0;
  const cost = calculateCost(inputTokens, outputTokens);
  
  // 8. Store message in session
  await novaMemory.appendMessage(sessionId, sessionId, 'user', userMessage);
  await novaMemory.appendMessage(sessionId, sessionId, 'assistant', aiContent, {
    tokensUsed: inputTokens + outputTokens,
    cost,
    intent: intent.primaryIntent,
  });
  
  // 9. Learn from interaction
  if (intent.complexity === 'complex' || relevantMemories.length === 0) {
    const keywords = userMessage.split(/\s+/).filter(w => w.length > 3).slice(0, 5);
    await novaMemory.storeMemory(
      userId,
      'context',
      `Learning: ${intent.primaryIntent}`,
      `User asked about: ${intent.primaryIntent}. Query: ${userMessage.substring(0, 200)}`,
      'medium',
      keywords,
      { intent, sessionId }
    );
  }
  
  // 10. Generate bilingual response
  const contentAr = intent.language === 'en' 
    ? await translateToArabic(aiContent.substring(0, 500))
    : aiContent;
  
  const content = intent.language === 'ar'
    ? await translateToEnglish(aiContent.substring(0, 500))
    : aiContent;
  
  // 11. Generate follow-up suggestions
  const suggestedFollowups = generateFollowups(intent, aiContent);
  
  return {
    content: intent.language === 'ar' ? aiContent : content,
    contentAr: intent.language === 'ar' ? aiContent : contentAr,
    memoryReferences: relevantMemories.map(m => m.id),
    suggestedFollowups,
    tokensUsed: inputTokens + outputTokens,
    costUSD: cost,
    processingTimeMs: Date.now() - startTime,
  };
}

// ==================== Helper Functions ====================

function buildSystemPrompt(
  intent: IntentAnalysis,
  context: any,
  memories: any[]
): string {
  const memoryContext = memories.length > 0
    ? `\n\nRELEVANT MEMORIES FROM PAST INTERACTIONS:\n${memories.map(m => `- ${m.content}`).join('\n')}`
    : '';
  
  const prefsContext = Object.keys(context.userPreferences).length > 0
    ? `\n\nUSER PREFERENCES:\n${JSON.stringify(context.userPreferences, null, 2)}`
    : '';
  
  return `You are Nova, an intelligent AI assistant for INFERA WebNova platform.
أنت نوفا، مساعد ذكي لمنصة INFERA WebNova.

CORE CAPABILITIES:
- Code generation and analysis
- Database design and queries
- Security scanning and recommendations
- Cost estimation for projects
- Deployment guidance
- Bilingual support (Arabic/English)

PERSONALITY:
- Professional yet friendly
- Precise and actionable
- Always provide code examples when relevant
- Explain costs and trade-offs
- Remember past interactions

CURRENT CONTEXT:
- User language: ${intent.language}
- Primary intent: ${intent.primaryIntent}
- Complexity: ${intent.complexity}
- Required skills: ${intent.requiredSkills.join(', ')}
${memoryContext}
${prefsContext}

RESPONSE GUIDELINES:
1. Match the user's language (respond in Arabic if they write in Arabic)
2. Be specific and actionable
3. Include code examples when relevant
4. Explain costs and trade-offs
5. Suggest next steps`;
}

function buildMessageHistory(context: any, currentMessage: string): Anthropic.Messages.MessageParam[] {
  const messages: Anthropic.Messages.MessageParam[] = [];
  
  // Add recent history
  for (const msg of context.recentMessages.slice(-6)) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  }
  
  // Add current message
  messages.push({
    role: 'user',
    content: currentMessage,
  });
  
  return messages;
}

async function translateToArabic(text: string): Promise<string> {
  // Simple translation marker - in production use actual translation API
  if (text.length < 50) return text;
  return text; // Keep original if already mixed
}

async function translateToEnglish(text: string): Promise<string> {
  // Simple translation marker
  if (text.length < 50) return text;
  return text;
}

function generateFollowups(intent: IntentAnalysis, response: string): string[] {
  const followups: string[] = [];
  
  if (intent.primaryIntent === 'code_generation') {
    followups.push('Can you explain how this code works?');
    followups.push('هل يمكنك تحسين الأداء؟');
  } else if (intent.primaryIntent === 'database') {
    followups.push('Show me the database schema');
    followups.push('أضف المزيد من الفهارس');
  } else if (intent.primaryIntent === 'security') {
    followups.push('Run a full security scan');
    followups.push('كيف أصلح هذه الثغرات؟');
  } else if (intent.primaryIntent === 'cost_estimation') {
    followups.push('Break down the costs further');
    followups.push('ما البدائل الأرخص؟');
  }
  
  return followups.slice(0, 3);
}

// ==================== API Routes ====================

export function registerNovaIntelligentEngineRoutes(app: Express) {
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        errorAr: "المصادقة مطلوبة",
      });
    }
    next();
  };

  // ==================== Chat Endpoint ====================
  app.post("/api/nova/intelligent/chat", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { sessionId, message } = req.body;
      
      if (!message) {
        return res.status(400).json({
          success: false,
          error: "Message is required",
          errorAr: "الرسالة مطلوبة",
        });
      }
      
      // Create session if not provided
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        activeSessionId = await novaMemory.createSession(
          user.id,
          user.tenantId || 'default'
        );
      }
      
      const response = await handleIntelligentConversation(
        user.id,
        user.tenantId || 'default',
        activeSessionId,
        message
      );
      
      res.json({
        success: true,
        sessionId: activeSessionId,
        response: {
          content: response.content,
          contentAr: response.contentAr,
          suggestedFollowups: response.suggestedFollowups,
        },
        metrics: {
          tokensUsed: response.tokensUsed,
          costUSD: response.costUSD,
          processingTimeMs: response.processingTimeMs,
          memoryReferencesCount: response.memoryReferences.length,
        },
      });
    } catch (error: any) {
      console.error('[Nova Engine] Chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        errorAr: "فشل في معالجة الرسالة",
      });
    }
  });

  // ==================== Analyze Intent ====================
  app.post("/api/nova/intelligent/analyze", requireAuth, async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({
          success: false,
          error: "Message is required",
        });
      }
      
      const intent = await analyzeIntent(message);
      
      res.json({
        success: true,
        intent,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== Quick Actions ====================
  app.post("/api/nova/intelligent/quick-action", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const { action, params } = req.body;
      
      let result: any;
      
      switch (action) {
        case 'estimate_cost':
          result = {
            action: 'cost_estimation',
            estimate: {
              development: params.complexity === 'complex' ? 5000 : params.complexity === 'moderate' ? 2000 : 500,
              hosting: params.scale === 'enterprise' ? 500 : params.scale === 'startup' ? 100 : 20,
              maintenance: params.complexity === 'complex' ? 1000 : 300,
              currency: 'USD',
            },
          };
          break;
          
        case 'suggest_architecture':
          result = {
            action: 'architecture_suggestion',
            recommendation: {
              frontend: 'React + TypeScript',
              backend: 'Node.js + Express',
              database: 'PostgreSQL',
              deployment: 'Hetzner Cloud',
              estimated_setup_hours: params.complexity === 'complex' ? 80 : 20,
            },
          };
          break;
          
        case 'security_check':
          result = {
            action: 'security_recommendation',
            checks: [
              { name: 'HTTPS', status: 'required' },
              { name: 'Authentication', status: 'required' },
              { name: 'Rate Limiting', status: 'recommended' },
              { name: 'Input Validation', status: 'required' },
              { name: 'SQL Injection Prevention', status: 'required' },
            ],
          };
          break;
          
        default:
          return res.status(400).json({
            success: false,
            error: 'Unknown action',
            errorAr: 'إجراء غير معروف',
          });
      }
      
      res.json({
        success: true,
        result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  console.log("[Nova Intelligent Engine] Routes registered at /api/nova/intelligent/*");
}
