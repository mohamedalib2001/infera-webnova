/**
 * CONVERSATIONAL CONTEXT LAYER – SOVEREIGN (ARABIC)
 * 
 * Enables understanding and response to natural Arabic discussion
 * without breaking sovereign control rules.
 * 
 * CORE PRINCIPLE: Not every input is a command or inquiry.
 * Some inputs are DISCUSSION or CONTEXT CONTINUATION.
 */

export type ConversationalIntent = 
  | 'command'      // Explicit action request
  | 'inquiry'      // Question requiring information
  | 'discussion'   // Natural conversation, clarification, objection
  | 'security'     // Security or audit request
  | 'build';       // Platform build request

export interface ContextMemory {
  threadId: string;
  messages: Array<{
    role: 'user' | 'nova';
    content: string;
    timestamp: Date;
    intent: ConversationalIntent;
  }>;
  lastIntent: ConversationalIntent;
  language: 'ar' | 'en';
}

// Arabic discussion patterns - natural conversation indicators
const ARABIC_DISCUSSION_PATTERNS = [
  // Clarification
  /لا،?\s*قصدي/i,           // No, I meant...
  /خليني أوضح/i,           // Let me clarify
  /أقصد/i,                  // I mean
  /قصدت/i,                  // I meant
  /بمعنى آخر/i,            // In other words
  /أعني/i,                  // I mean
  
  // Discussion/Thinking
  /خلينا نفكر/i,           // Let's think
  /ما رأيك/i,              // What's your opinion
  /رأيك\?/i,               // Your opinion?
  /كيف ترى/i,              // How do you see
  /أيش رأيك/i,             // What do you think (Gulf)
  /شو رأيك/i,              // What do you think (Levantine)
  
  // Objection/Disagreement
  /لا،?\s*أنا مختلف/i,    // No, I disagree
  /مش منطقي/i,            // Not logical
  /غير منطقي/i,           // Illogical
  /لا أوافق/i,             // I don't agree
  /أختلف معك/i,           // I disagree with you
  /مش صحيح/i,             // Not correct
  /غلط/i,                  // Wrong
  
  // Agreement
  /صح/i,                   // Correct
  /بالظبط/i,               // Exactly
  /تمام/i,                 // Perfect
  /موافق/i,                // I agree
  /معك حق/i,              // You're right
  /صحيح/i,                 // True
  /أوافقك/i,               // I agree with you
  
  // Reference to previous
  /زي ما قلت/i,           // As I said
  /كما ذكرت/i,            // As I mentioned
  /قلت قبل/i,             // I said before
  /ذكرت سابقا/i,          // I mentioned previously
  /نرجع ل/i,              // Let's go back to
  
  // Continuation
  /وبعدين/i,               // And then
  /ثم/i,                   // Then
  /وكمان/i,                // And also
  /بالإضافة/i,            // In addition
  /أيضا/i,                 // Also
];

// English discussion patterns
const ENGLISH_DISCUSSION_PATTERNS = [
  /no,?\s*i mean/i,
  /let me clarify/i,
  /what i meant/i,
  /in other words/i,
  /let's think/i,
  /what do you think/i,
  /your thoughts\??/i,
  /i disagree/i,
  /not logical/i,
  /that's wrong/i,
  /exactly/i,
  /i agree/i,
  /you're right/i,
  /as i said/i,
  /as mentioned/i,
  /going back to/i,
  /additionally/i,
  /also/i,
  /furthermore/i,
];

// Command patterns (should exit discussion mode)
const COMMAND_PATTERNS = [
  // Arabic
  /أنشئ/i, /ابني/i, /صمم/i, /اعمل/i, /نفذ/i, /طبق/i, /احذف/i, /عدل/i, /غير/i,
  // English
  /create/i, /build/i, /design/i, /make/i, /execute/i, /delete/i, /modify/i, /change/i,
];

// Security/Audit patterns (should exit discussion mode)
const SECURITY_PATTERNS = [
  // Arabic
  /أمان/i, /حماية/i, /تدقيق/i, /صلاحيات/i, /مراجعة أمنية/i,
  // English
  /security/i, /audit/i, /permissions/i, /access control/i, /encryption/i,
];

// Build intent patterns - includes platform types and domain-specific terms
const BUILD_PATTERNS = [
  // Arabic platform types
  /منصة/i, /متجر/i, /موقع/i, /تطبيق/i, /نظام/i, 
  // Arabic domain terms (HR, Finance, Healthcare, etc.)
  /موارد بشرية/i, /الموارد البشرية/i, /hr/i, /إدارة الموظفين/i, /الرواتب/i, /التوظيف/i,
  /محاسبة/i, /مالية/i, /فواتير/i, /مخزون/i, /مبيعات/i,
  /مستشفى/i, /طبي/i, /صحي/i, /عيادة/i, /مرضى/i,
  /تعليم/i, /مدرسة/i, /جامعة/i, /طلاب/i, /كورسات/i,
  /تجارة/i, /إلكترونية/i, /منتجات/i, /سلة/i,
  // Arabic scale indicators
  /مليون/i, /ألف/i, /مستخدم/i, /موظف/i, /شركة/i, /مؤسسة/i,
  // Arabic action-like phrases that imply building
  /أريد/i, /أحتاج/i, /عايز/i, /محتاج/i,
  // English platform types
  /platform/i, /store/i, /site/i, /website/i, /app/i, /application/i, /system/i, /portal/i, /dashboard/i,
  // English domain terms
  /human resources/i, /employee/i, /payroll/i, /recruitment/i, /onboarding/i,
  /accounting/i, /finance/i, /invoice/i, /inventory/i, /sales/i,
  /hospital/i, /medical/i, /healthcare/i, /clinic/i, /patient/i,
  /education/i, /school/i, /university/i, /student/i, /course/i,
  /ecommerce/i, /e-commerce/i, /shopping/i, /cart/i, /product/i,
  // English scale indicators  
  /million/i, /thousand/i, /users/i, /employees/i, /company/i, /enterprise/i,
];

/**
 * Detects the conversational intent of user input
 * Priority: security > build (with indicators) > command > discussion > inquiry
 */
export function detectIntent(
  content: string, 
  previousMessages: ContextMemory['messages'] = []
): ConversationalIntent {
  const trimmed = content.trim();
  
  // Check for security/audit first (highest priority)
  if (SECURITY_PATTERNS.some(p => p.test(trimmed))) {
    return 'security';
  }
  
  // Check for explicit commands and build patterns
  const hasCommand = COMMAND_PATTERNS.some(p => p.test(trimmed));
  const hasBuild = BUILD_PATTERNS.some(p => p.test(trimmed));
  
  // Count how many build patterns match - more matches = stronger build signal
  const buildMatchCount = BUILD_PATTERNS.filter(p => p.test(trimmed)).length;
  
  // PRIORITY: If we have build patterns, lean towards build intent
  // This ensures Arabic requests like "منصة موارد بشرية" trigger builds
  if (hasCommand && hasBuild) {
    return 'build';
  }
  
  // If content has multiple build patterns OR is descriptive enough, treat as build
  // This catches requests like "منصة موارد بشرية للموظفين والإدارات" without command verbs
  if (hasBuild && (buildMatchCount >= 2 || trimmed.length >= 30)) {
    return 'build';
  }
  
  if (hasCommand) {
    return 'command';
  }
  
  // Check for discussion patterns ONLY if no build patterns detected
  if (!hasBuild) {
    const isDiscussion = [
      ...ARABIC_DISCUSSION_PATTERNS,
      ...ENGLISH_DISCUSSION_PATTERNS
    ].some(p => p.test(trimmed));
    
    if (isDiscussion) {
      return 'discussion';
    }
  }
  
  // Check if it's a question (inquiry)
  const isQuestion = /\?|؟|كيف|لماذا|ما هو|ما هي|هل|أين|متى|من|how|what|why|where|when|who|which/i.test(trimmed);
  
  if (isQuestion && !hasBuild) {
    return 'inquiry';
  }
  
  // If previous context was discussion and this is short continuation
  if (previousMessages.length > 0 && !hasBuild) {
    const lastIntent = previousMessages[previousMessages.length - 1]?.intent;
    if (lastIntent === 'discussion' && trimmed.length < 100) {
      return 'discussion';
    }
  }
  
  // Any remaining build pattern match should trigger build
  if (hasBuild) {
    return 'build';
  }
  
  // Short inputs without clear intent are likely discussion
  if (trimmed.length < 50 && !hasCommand) {
    return 'discussion';
  }
  
  return 'inquiry';
}

/**
 * Generates a sovereign-style discussion response prompt
 * Maintains analytical, professional tone without being chatty
 */
export function generateDiscussionPrompt(
  content: string,
  contextHistory: ContextMemory['messages'],
  language: 'ar' | 'en'
): string {
  const contextSummary = contextHistory
    .slice(-5)
    .map(m => `${m.role === 'user' ? (language === 'ar' ? 'المستخدم' : 'User') : 'Nova'}: ${m.content}`)
    .join('\n');

  if (language === 'ar') {
    return `أنت Nova، طبقة تحكم سيادية للمنصات الرقمية.

نمط الحوار: نقاش تقني محترف
المطلوب: رد تحليلي، واضح، غير ودي بشكل مبالغ فيه

القواعد:
- لا تستخدم الإيموجي
- لا تستخدم لغة غير رسمية
- كن موجزاً ودقيقاً
- قدم رأياً منطقياً إذا طُلب
- لا تسأل أسئلة توضيحية إلا للضرورة القصوى

السياق السابق:
${contextSummary}

الرسالة الحالية: ${content}

أجب بأسلوب تحليلي محترف.`;
  }

  return `You are Nova, a sovereign control layer for digital platforms.

Mode: Professional technical discussion
Required: Analytical, clear, not overly friendly response

Rules:
- No emojis
- No casual language
- Be concise and precise
- Provide logical opinion if asked
- Only ask clarifying questions if absolutely necessary

Previous context:
${contextSummary}

Current message: ${content}

Respond in an analytical, professional manner.`;
}

/**
 * Checks if input is meaningless or too vague
 */
export function isInputMeaningless(content: string): boolean {
  const trimmed = content.trim();
  
  // Too short
  if (trimmed.length < 2) return true;
  
  // Just punctuation
  if (/^[.,!?؟\s]+$/.test(trimmed)) return true;
  
  // Random characters
  if (/^[a-z]{1,3}$/i.test(trimmed) && !/^(ok|no|hi)$/i.test(trimmed)) return true;
  
  return false;
}

/**
 * Creates default context memory
 */
export function createContextMemory(language: 'ar' | 'en' = 'ar'): ContextMemory {
  return {
    threadId: Date.now().toString(),
    messages: [],
    lastIntent: 'inquiry',
    language,
  };
}

/**
 * Adds a message to context memory
 */
export function addToContext(
  memory: ContextMemory,
  role: 'user' | 'nova',
  content: string,
  intent: ConversationalIntent
): ContextMemory {
  return {
    ...memory,
    messages: [
      ...memory.messages.slice(-10), // Keep last 10 messages
      { role, content, timestamp: new Date(), intent }
    ],
    lastIntent: intent,
  };
}

/**
 * Resolves pronouns and references in Arabic/English
 */
export function resolveReferences(
  content: string,
  memory: ContextMemory
): string {
  if (memory.messages.length === 0) return content;
  
  // Get recent topics
  const recentUserMessages = memory.messages
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content);

  // This is a simplified version - could be enhanced with NLP
  return content;
}
