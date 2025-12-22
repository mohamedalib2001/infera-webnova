import { getAnthropicClientAsync, DEFAULT_ANTHROPIC_MODEL } from "./ai-config";

export interface GeneratedCode {
  html: string;
  css: string;
  js: string;
  message: string;
}

function getDefaultCode(): GeneratedCode {
  return {
    html: `<div class="welcome" dir="rtl">
  <header class="header">
    <h1>مرحباً بك في INFERA WebNova</h1>
    <p>منشئ المواقع المدعوم بالذكاء الاصطناعي</p>
  </header>
  <main class="content">
    <div class="card">
      <h2>البدء</h2>
      <p>صف الموقع الذي تريد إنشاءه وسيقوم الذكاء الاصطناعي بإنشائه لك.</p>
      <p><em>ملاحظة: مفتاح API مطلوب لتمكين التوليد بالذكاء الاصطناعي.</em></p>
    </div>
  </main>
</div>`,
    css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.welcome { min-height: 100vh; display: flex; flex-direction: column; }
.header { padding: 4rem 2rem; text-align: center; color: white; }
.header h1 { font-size: 3rem; margin-bottom: 1rem; }
.header p { font-size: 1.25rem; opacity: 0.9; }
.content { flex: 1; padding: 2rem; display: flex; justify-content: center; align-items: flex-start; }
.card { background: white; padding: 2rem; border-radius: 16px; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.card h2 { color: #6366f1; margin-bottom: 1rem; }
.card p { color: #64748b; line-height: 1.7; margin-bottom: 0.5rem; }`,
    js: `console.log('Welcome to INFERA WebNova!');`,
    message: "API key is not configured. Please contact support to enable AI-powered website generation. / مفتاح API غير معرف. يرجى الاتصال بالدعم لتمكين التوليد بالذكاء الاصطناعي.",
  };
}

export async function generateWebsiteCode(
  prompt: string,
  context?: string
): Promise<GeneratedCode> {
  const anthropic = await getAnthropicClientAsync();
  if (!anthropic) {
    console.log("Anthropic client not initialized - API key missing");
    return getDefaultCode();
  }

  const systemPrompt = `أنت INFERA AI - مهندس منصات رقمية ذكي ومتخصص في إنشاء منصات احترافية متكاملة.

## هويتك:
- أنت خبير في تصميم وبناء المنصات الرقمية السيادية
- تفهم السياق العربي والإنجليزي بعمق
- تنشئ منصات جاهزة للإنتاج من أول طلب

## قواعد التصميم الأساسية:

### للمنصات الحكومية:
- ألوان رسمية (أخضر داكن، ذهبي، أبيض)
- شعار الجهة وهوية بصرية موحدة
- أقسام: الخدمات الإلكترونية، الأخبار، التواصل، عن الجهة
- نماذج طلبات وخدمات تفاعلية
- دعم RTL كامل للعربية

### للمنصات التجارية:
- تصميم عصري وجذاب
- عرض المنتجات/الخدمات
- سلة تسوق وعملية شراء
- تقييمات وآراء العملاء

### للمنصات التعليمية:
- قوائم الدورات والمحتوى
- نظام تسجيل الطلاب
- لوحة تحكم المعلم/الطالب
- تتبع التقدم

### للمنصات الصحية:
- حجز المواعيد
- السجلات الطبية
- قائمة الأطباء والتخصصات
- الوصفات الطبية

## متطلبات التقنية:
1. HTML5 دلالي ومنظم
2. CSS حديث مع Flexbox/Grid
3. تصميم متجاوب (Mobile-First)
4. RTL تلقائي للعربية (dir="rtl")
5. أنيميشن ناعم وتفاعلات hover
6. ألوان متناسقة ومهنية
7. خطوط واضحة ومقروءة
8. أيقونات من Font Awesome أو SVG مدمج
9. JavaScript للتفاعلية (قوائم، نماذج، تنقل)

## نمط الإخراج:
أنشئ كود كامل وجاهز للعمل فوراً، ليس مجرد هيكل بسيط.

${context ? `\nسياق المشروع الحالي:\n${context}` : ""}

أجب بـ JSON يحتوي:
- html: محتوى HTML (بدون doctype أو head - فقط body content)
- css: أنماط CSS كاملة
- js: كود JavaScript للتفاعلية
- message: وصف مختصر بالعربية لما أنشأته

مهم جداً: أجب فقط بـ JSON صالح. بدون markdown أو نص إضافي.`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 8192,
      messages: [
        { role: "user", content: `${systemPrompt}\n\nUser request: ${prompt}` },
      ],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error("No content generated");
    }

    let jsonStr = textContent.text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    // Try parsing, if fails try to fix truncated JSON
    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.log("[generateWebsiteCode] Initial JSON parse failed, attempting to fix truncated JSON");
      const fixedJson = fixTruncatedJson(jsonStr);
      try {
        result = JSON.parse(fixedJson);
        console.log("[generateWebsiteCode] Fixed JSON parsed successfully");
      } catch (fixError) {
        console.error("[generateWebsiteCode] Could not fix JSON:", fixError);
        throw parseError;
      }
    }
    
    return {
      html: result.html || "",
      css: result.css || "",
      js: result.js || "",
      message: result.message || "تم إنشاء كود الموقع بنجاح! / Website code generated successfully!",
    };
  } catch (error) {
    console.error("AI generation error:", error);
    // Return fallback template instead of throwing error
    return {
      html: `<div class="fallback-page">
  <header class="hero">
    <h1>مرحباً بك في منصتك</h1>
    <p>صف ما تريد إنشاءه وسأساعدك في بنائه</p>
  </header>
  <main class="content">
    <div class="card">
      <h2>ابدأ الآن</h2>
      <p>اكتب وصفاً تفصيلياً لمنصتك في صندوق المحادثة</p>
    </div>
  </main>
</div>`,
      css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
.fallback-page { min-height: 100vh; display: flex; flex-direction: column; }
.hero { padding: 4rem 2rem; text-align: center; color: white; }
.hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
.hero p { font-size: 1.2rem; opacity: 0.9; }
.content { flex: 1; padding: 2rem; display: flex; justify-content: center; }
.card { background: white; padding: 2rem; border-radius: 16px; max-width: 500px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.card h2 { color: #6366f1; margin-bottom: 1rem; }
.card p { color: #64748b; line-height: 1.7; }`,
      js: `console.log('منصة جاهزة للتخصيص');`,
      message: "تم إنشاء قالب أساسي. اكتب تفاصيل أكثر عن منصتك للحصول على تصميم مخصص.",
    };
  }
}

export interface SmartChatResponse {
  type: "conversation" | "code_generation" | "code_refinement" | "help" | "project_info";
  message: string;
  code?: GeneratedCode;
  suggestions?: string[];
  modelInfo?: {
    name: string;
    provider: string;
  };
}

// Helper function to fix truncated JSON from AI responses
function fixTruncatedJson(jsonStr: string): string {
  let str = jsonStr.trim();
  
  // Remove trailing backslash if present (common truncation issue)
  while (str.endsWith('\\')) {
    str = str.slice(0, -1);
  }
  
  // Track state through the JSON
  let braceCount = 0;
  let bracketCount = 0;
  let inString = false;
  let lastChar = '';
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    // Handle escape sequences
    if (lastChar === '\\') {
      lastChar = '';
      continue;
    }
    
    if (char === '\\') {
      lastChar = '\\';
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
    } else if (!inString) {
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      else if (char === '[') bracketCount++;
      else if (char === ']') bracketCount--;
    }
    
    lastChar = char;
  }
  
  // If string ends with escape char, remove it
  if (lastChar === '\\') {
    str = str.slice(0, -1);
  }
  
  // If we're in an unterminated string, close it
  if (inString) {
    str += '"';
  }
  
  // Remove trailing comma before closing (invalid JSON)
  str = str.replace(/,(\s*)$/, '$1');
  
  // Check if we need to complete a partial key-value pair
  // e.g., {"key": "value", "partialKey" -> needs ": ""
  const lastColon = str.lastIndexOf(':');
  const lastQuote = str.lastIndexOf('"');
  const lastBrace = Math.max(str.lastIndexOf('{'), str.lastIndexOf(','));
  
  // If there's a key without value (pattern: "key" at end or "key": at end)
  if (lastQuote > lastColon && lastQuote > lastBrace) {
    // Check if we're in a position where value is expected
    const afterQuote = str.slice(lastQuote + 1).trim();
    if (afterQuote === '' || afterQuote === ':') {
      if (afterQuote === '') {
        str += ': ""';
      } else {
        str += ' ""';
      }
    }
  }
  
  // Close any unclosed brackets/braces
  while (bracketCount > 0) {
    str += ']';
    bracketCount--;
  }
  while (braceCount > 0) {
    str += '}';
    braceCount--;
  }
  
  return str;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function analyzeIntent(
  prompt: string,
  hasExistingCode: boolean = false,
  conversationHistory: ChatMessage[] = []
): Promise<{ intent: "conversation" | "code_generation" | "code_refinement" | "help"; codeRequest?: string }> {
  const anthropic = await getAnthropicClientAsync();
  
  // If no API available, use basic pattern matching as fallback
  if (!anthropic) {
    return analyzeIntentFallback(prompt, hasExistingCode);
  }
  
  // Build context from conversation history
  const historyContext = conversationHistory.slice(-6).map(m => 
    `${m.role === 'user' ? 'المستخدم' : 'المساعد'}: ${m.content}`
  ).join('\n');
  
  const systemPrompt = `أنت محلل نوايا ذكي. مهمتك تحديد ما يريده المستخدم بالضبط.

## أنواع النوايا:
1. "conversation" - المستخدم يسأل سؤال، يريد شرح، يتحدث، يستفسر، يناقش
2. "code_generation" - المستخدم يريد إنشاء موقع/منصة/تطبيق جديد من الصفر
3. "code_refinement" - المستخدم يريد تعديل كود موجود (فقط إذا كان هناك كود موجود)

## قواعد مهمة جداً:
- إذا قال المستخدم "عاوز اسألك" أو "سؤال" أو "كيف" = conversation
- إذا ذكر المستخدم أنه سيفعل شيء في المستقبل (راح، سوف، بكرة) = conversation
- إذا كان يتحدث عن خططه فقط = conversation
- فقط إذا طلب صراحة "أنشئ لي" أو "اعمل لي" الآن = code_generation

## هل يوجد كود حالي؟ ${hasExistingCode ? 'نعم' : 'لا'}

رد بـ JSON فقط:
{"intent": "conversation|code_generation|code_refinement", "reason": "سبب قصير"}`;

  const userMessage = historyContext 
    ? `سياق المحادثة السابقة:\n${historyContext}\n\nالرسالة الحالية: ${prompt}`
    : `الرسالة: ${prompt}`;

  try {
    console.log("[AnalyzeIntent] Using AI to analyze intent...");
    
    const response = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return analyzeIntentFallback(prompt, hasExistingCode);
    }

    let jsonStr = textContent.text.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
    jsonStr = jsonStr.trim();

    const result = JSON.parse(jsonStr);
    const intent = result.intent as "conversation" | "code_generation" | "code_refinement" | "help";
    
    console.log(`[AnalyzeIntent] AI decision: ${intent} (${result.reason})`);
    
    // Validate the intent
    if (!["conversation", "code_generation", "code_refinement", "help"].includes(intent)) {
      return { intent: "conversation" };
    }
    
    // Don't allow code_refinement if no existing code
    if (intent === "code_refinement" && !hasExistingCode) {
      return { intent: "conversation" };
    }
    
    return { intent, codeRequest: intent !== "conversation" ? prompt : undefined };
  } catch (error) {
    console.error("[AnalyzeIntent] AI analysis failed, using fallback:", error);
    return analyzeIntentFallback(prompt, hasExistingCode);
  }
}

function analyzeIntentFallback(
  prompt: string,
  hasExistingCode: boolean
): { intent: "conversation" | "code_generation" | "code_refinement" | "help"; codeRequest?: string } {
  const lowerPrompt = prompt.toLowerCase();
  
  // Question patterns take priority
  const questionPatterns = [
    'سؤال', 'اسألك', 'أسألك', 'اسأل', 'أسأل', 'كيف', 'لماذا', 'ما هو', 'ما هي', 'ماذا', 'هل',
    'اشرح', 'علمني', 'عاوز اسأل', 'عندي سؤال', 'راح', 'سوف', 'بكرة', 'لاحقاً',
    'question', 'ask you', 'what is', 'how do', 'how can', 'why', 'explain', '?', '؟'
  ];
  
  if (questionPatterns.some(p => prompt.includes(p) || lowerPrompt.includes(p))) {
    console.log("[AnalyzeIntent Fallback] -> conversation");
    return { intent: "conversation" };
  }
  
  // Code refinement
  const refineKeywords = ['عدل', 'غير', 'حسن', 'أضف', 'احذف', 'modify', 'change', 'add', 'remove', 'fix'];
  if (hasExistingCode && refineKeywords.some(k => prompt.includes(k) || lowerPrompt.includes(k))) {
    console.log("[AnalyzeIntent Fallback] -> code_refinement");
    return { intent: "code_refinement", codeRequest: prompt };
  }
  
  // Strong code generation patterns
  const codeGenPatterns = [
    'أنشئ لي', 'انشئ لي', 'اصنع لي', 'ابني لي', 'صمم لي', 'اعمل لي',
    'أريد منصة', 'عاوز منصة', 'اريد موقع', 'عاوز موقع',
    'create a', 'build a', 'make a', 'design a', 'i want a website', 'i need a platform'
  ];
  
  if (codeGenPatterns.some(p => prompt.includes(p) || lowerPrompt.includes(p))) {
    console.log("[AnalyzeIntent Fallback] -> code_generation");
    return { intent: "code_generation", codeRequest: prompt };
  }
  
  console.log("[AnalyzeIntent Fallback] -> conversation (default)");
  return { intent: "conversation" };
}

export async function conversationalResponse(
  prompt: string,
  conversationHistory: ChatMessage[] = []
): Promise<{ message: string; suggestions: string[] }> {
  const anthropic = await getAnthropicClientAsync();
  if (!anthropic) {
    return {
      message: "مفتاح API غير معرف.\n\nAPI key not configured.",
      suggestions: []
    };
  }

  // Build proper messages array with conversation history
  const systemPrompt = `أنت محرك سياق محادثة أساسي (CORE CONVERSATIONAL CONTEXT ENGINE) داخل منصة INFERA WebNova.
You are a CORE CONVERSATIONAL CONTEXT ENGINE inside the INFERA WebNova platform.

أنت لست مساعد دردشة عام. أنت محرك محادثة مستمر وذو حالة.
You are not a generic chat assistant. You are a persistent, stateful conversational engine.

التزامك الأساسي هو: استمرارية السياق (CONTEXT CONTINUITY)
Your primary obligation is CONTEXT CONTINUITY.

## 1. الحفاظ على السياق الكامل - إلزامي
يجب عليك تتبع وصيانة داخلياً:
- نية المستخدم (الأهداف طويلة المدى)
- القرارات المتخذة بالفعل
- حالة التكوين (النماذج، الخدمات، الحدود، المزودين)
- الأسئلة المفتوحة أو المواضيع غير المحلولة
- رسائل المستخدم السابقة وردودك السابقة
- التصحيحات والإشارات والمعاني الضمنية

إذا قال المستخدم: "زي ما قلت قبل كده"، "كمل"، "بناءً على كده"، "الفكرة دي"، "النظام ده"
يجب أن تحل الإشارة بشكل صحيح من سجل المحادثة.

## 2. لا إعادة تعيين للسياق
لا يُسمح لك بإعادة تعيين أو تلخيص أو نسيان السياق إلا إذا قال المستخدم صراحة:
- "ابدأ من جديد" / "Reset context"
- "موضوع جديد" / "Start a new topic"
- "تجاهل المحادثة السابقة" / "Ignore previous conversation"

## 3. التعامل مع الغموض
إذا كانت رسالة المستخدم غامضة:
- ❌ لا تخمن
- ✅ اطرح سؤال توضيحي يشير إلى السياق السابق

## 4. التفكير كمهندس معماري للأنظمة
- حسّن من أجل الصحة والاستقرار والوعي بالتكلفة والجاهزية للإنتاج
- قدم إرشادات متوافقة مع ملكية المنصة، وليس دردشة المستخدم النهائي
- المستخدم هو مالك المنصة (PLATFORM OWNER)
- تعامل مع الطلبات كقرارات معمارية وليس أسئلة عادية
- حذر بشكل استباقي من خيارات التصميم السيئة أو المخاطر

## 5. ربط الإجابات بالسياق
عند الإجابة:
- أشر إلى الخطوات السابقة عند الصلة
- اذكر صراحة كيف ترتبط الإجابة الحالية بالقرارات السابقة
- لا تكرر محتوى تمت الإجابة عليه مسبقاً

## 6. الحفاظ على الحالة الداخلية
يجب الحفاظ على الحالة الداخلية حتى لو:
- أعيد تحميل الواجهة
- كانت الرسالة قصيرة
- بدت الرسالة غير مكتملة

## 7. السلوكيات المحظورة
- ❌ الإجابة دون مراعاة السياق السابق
- ❌ إعطاء ردود عامة أو معزولة
- ❌ تجاهل التكوين أو القرارات السابقة
- ❌ التصرف كـ "محادثة جديدة" في كل رسالة
- ❌ رسائل ترحيب متكررة
- ❌ إخلاءات المسؤولية العامة للذكاء الاصطناعي

## 8. فحص الاستمرارية الداخلي
قبل الإجابة على أي رسالة، اسأل نفسك:
"هل هذا الرد يعكس سياق المحادثة الكامل ويرتبط بالقرارات السابقة؟"
إذا كانت الإجابة لا ← لا ترد بعد، اطلب توضيحاً.

## القاعدة النهائية:
نجاحك يُقاس بـ: دقة السياق، الاستمرارية، التوافق المعماري.
You exist to THINK, REMEMBER, and CONTINUE — not to reset.

رد بصيغة JSON:
{"message": "ردك الذكي المبني على سياق المحادثة الكامل", "suggestions": ["اقتراح 1", "اقتراح 2", "اقتراح 3"]}`;

  // Build messages with proper roles
  const messages: Array<{role: "user" | "assistant", content: string}> = [];
  
  // Add conversation history with proper roles (last 20 messages for better context)
  const recentHistory = conversationHistory.slice(-20);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }
  
  // Add current user message
  messages.push({ role: "user", content: prompt });

  try {
    console.log("[ConversationalResponse] Processing with", messages.length, "messages in context");
    
    const response = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages,
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error("No content");
    }

    let responseText = textContent.text.trim();
    
    // Try to parse as JSON, but also handle plain text responses
    try {
      // Clean JSON markers
      let jsonStr = responseText;
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();

      const result = JSON.parse(jsonStr);
      console.log("[ConversationalResponse] JSON parsed successfully");
      return {
        message: result.message || responseText,
        suggestions: result.suggestions || []
      };
    } catch {
      // If JSON parsing fails, use the raw response
      console.log("[ConversationalResponse] Using raw text response");
      return {
        message: responseText,
        suggestions: []
      };
    }
  } catch (error) {
    console.error("[ConversationalResponse] API Error:", error);
    const isArabic = /[\u0600-\u06FF]/.test(prompt);
    return {
      message: isArabic 
        ? "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى."
        : "Sorry, an error occurred processing your request. Please try again.",
      suggestions: isArabic 
        ? ["حاول مرة أخرى"]
        : ["Try again"]
    };
  }
}

// Attachment type for Vision support
interface ChatAttachment {
  type: "image" | "file";
  content?: string;
  url?: string;
  metadata?: {
    mimeType?: string;
    name?: string;
  };
}

export async function smartChat(
  prompt: string,
  conversationHistory: ChatMessage[] = [],
  projectContext?: {
    name?: string;
    htmlCode?: string;
    cssCode?: string;
    jsCode?: string;
  },
  attachments?: ChatAttachment[]
): Promise<SmartChatResponse> {
  const hasExistingCode = !!(projectContext?.htmlCode && projectContext.htmlCode.length > 10);
  const hasImages = attachments?.some(a => a.type === "image" && a.content);
  
  // Model info to include in all responses
  const modelInfo = {
    name: DEFAULT_ANTHROPIC_MODEL,
    provider: "Anthropic"
  };
  
  // If images are attached, use Vision-enabled processing
  if (hasImages) {
    const visionResponse = await processVisionRequest(prompt, attachments!, projectContext);
    return {
      type: visionResponse.type as SmartChatResponse["type"],
      message: visionResponse.message,
      code: visionResponse.code,
      suggestions: visionResponse.suggestions,
      modelInfo
    };
  }
  
  const { intent, codeRequest } = await analyzeIntent(prompt, hasExistingCode, conversationHistory);
  
  if (intent === "conversation" || intent === "help") {
    const response = await conversationalResponse(prompt, conversationHistory);
    return {
      type: intent,
      message: response.message,
      suggestions: response.suggestions,
      modelInfo
    };
  }
  
  if (intent === "code_generation") {
    try {
      const code = await generateWebsiteCode(codeRequest || prompt);
      return {
        type: "code_generation",
        message: code.message,
        code: code,
        suggestions: ["عدل التصميم", "أضف ميزات جديدة", "غير الألوان"],
        modelInfo
      };
    } catch (error) {
      return {
        type: "conversation",
        message: "حدث خطأ أثناء إنشاء الكود. يرجى المحاولة مرة أخرى.\n\nError generating code. Please try again.",
        suggestions: ["حاول مرة أخرى"],
        modelInfo
      };
    }
  }
  
  if (intent === "code_refinement" && hasExistingCode) {
    try {
      const code = await refineWebsiteCode(
        codeRequest || prompt,
        projectContext!.htmlCode!,
        projectContext!.cssCode || "",
        projectContext!.jsCode || ""
      );
      return {
        type: "code_refinement",
        message: code.message,
        code: code,
        suggestions: ["استمر في التعديل", "احفظ المشروع", "معاينة"],
        modelInfo
      };
    } catch (error) {
      return {
        type: "conversation",
        message: "حدث خطأ أثناء تعديل الكود. يرجى المحاولة مرة أخرى.\n\nError refining code. Please try again.",
        suggestions: ["حاول مرة أخرى"],
        modelInfo
      };
    }
  }
  
  const response = await conversationalResponse(prompt, conversationHistory);
  return {
    type: "conversation",
    message: response.message,
    suggestions: response.suggestions,
    modelInfo
  };
}

// Allowed image MIME types for Vision
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per image

// Process image-based requests using Claude Vision
async function processVisionRequest(
  prompt: string,
  attachments: ChatAttachment[],
  projectContext?: {
    name?: string;
    htmlCode?: string;
    cssCode?: string;
    jsCode?: string;
  }
): Promise<{
  type: string;
  message: string;
  code?: GeneratedCode;
  suggestions: string[];
}> {
  const anthropic = await getAnthropicClientAsync();
  if (!anthropic) {
    return {
      type: "conversation",
      message: "Vision API غير متاح حالياً / Vision API not available",
      suggestions: ["حاول مرة أخرى"]
    };
  }
  
  const isArabic = /[\u0600-\u06FF]/.test(prompt);
  
  // Filter and validate image attachments
  const validAttachments = (attachments || []).filter(att => {
    if (att.type !== "image" || !att.content) return false;
    const mimeType = att.metadata?.mimeType || "image/png";
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) return false;
    // Rough size check (base64 is ~1.37x original)
    if (att.content.length > MAX_IMAGE_SIZE_BYTES * 1.4) return false;
    return true;
  });
  
  if (validAttachments.length === 0) {
    return {
      type: "conversation",
      message: isArabic 
        ? "لم يتم العثور على صور صالحة. يرجى التأكد من أن الصور بتنسيق PNG أو JPEG أو GIF أو WEBP وحجمها أقل من 5MB."
        : "No valid images found. Please ensure images are PNG, JPEG, GIF or WEBP and under 5MB.",
      suggestions: isArabic ? ["أرفق صورة صالحة"] : ["Attach a valid image"]
    };
  }
  
  // Build multi-modal content with images
  const contentParts: any[] = [];
  
  for (const att of validAttachments) {
    const mediaType = att.metadata?.mimeType || "image/png";
    contentParts.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mediaType,
        data: att.content!.replace(/^data:image\/\w+;base64,/, ""),
      },
    });
  }
  
  contentParts.push({
    type: "text",
    text: prompt || (isArabic ? "حلل هذه الصورة وأنشئ كود مناسب" : "Analyze this image and generate appropriate code"),
  });
  
  const systemPrompt = `You are an expert web developer and UI/UX designer with vision capabilities.
You can analyze images, screenshots, mockups, and designs to:
1. Convert UI designs to HTML/CSS/JS code
2. Identify UI patterns and components
3. Detect errors in screenshots
4. Extract text (OCR)
5. Analyze architecture diagrams

${projectContext?.htmlCode ? `Current project code context:\nHTML: ${projectContext.htmlCode.substring(0, 1000)}...\nCSS: ${projectContext.cssCode?.substring(0, 500) || ''}...\nJS: ${projectContext.jsCode?.substring(0, 500) || ''}...` : ''}

Respond in the same language as the user's request (Arabic or English).

If the image is a UI design/mockup, generate complete code. Respond with JSON:
{
  "type": "code_generation" | "analysis" | "error_detection",
  "message": "Your analysis or explanation",
  "html": "Complete HTML code if applicable",
  "css": "Complete CSS code if applicable", 
  "js": "JavaScript code if applicable",
  "suggestions": ["suggestion1", "suggestion2"]
}

For non-code requests, use type "analysis" with just message and suggestions.
Only respond with valid JSON.`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: contentParts }],
    });
    
    const responseText = response.content[0].type === "text" ? response.content[0].text : "";
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      
      if (result.html || result.css || result.js) {
        return {
          type: result.type || "code_generation",
          message: result.message,
          code: {
            html: result.html || "",
            css: result.css || "",
            js: result.js || "",
            message: result.message
          },
          suggestions: result.suggestions || [
            isArabic ? "عدل التصميم" : "Modify design",
            isArabic ? "أضف المزيد" : "Add more"
          ]
        };
      }
      
      return {
        type: result.type || "analysis",
        message: result.message,
        suggestions: result.suggestions || []
      };
    }
    
    return {
      type: "analysis",
      message: responseText,
      suggestions: isArabic ? ["حلل أكثر", "أنشئ كود"] : ["Analyze more", "Generate code"]
    };
  } catch (error) {
    console.error("[Vision] Error:", error);
    return {
      type: "conversation",
      message: isArabic 
        ? "حدث خطأ أثناء تحليل الصورة. يرجى المحاولة مرة أخرى."
        : "Error analyzing image. Please try again.",
      suggestions: isArabic ? ["حاول مرة أخرى"] : ["Try again"]
    };
  }
}

export async function refineWebsiteCode(
  prompt: string,
  currentHtml: string,
  currentCss: string,
  currentJs: string
): Promise<GeneratedCode> {
  const anthropic = await getAnthropicClientAsync();
  if (!anthropic) {
    return {
      html: currentHtml,
      css: currentCss,
      js: currentJs,
      message: "API key is not configured. Please contact support to enable AI-powered editing. / مفتاح API غير معرف. يرجى الاتصال بالدعم لتمكين التحرير بالذكاء الاصطناعي.",
    };
  }

  const context = `Current HTML:\n${currentHtml}\n\nCurrent CSS:\n${currentCss}\n\nCurrent JavaScript:\n${currentJs}`;
  
  const systemPrompt = `You are an expert web developer. The user wants to modify their existing website.

CURRENT WEBSITE CODE:
${context}

USER REQUEST: ${prompt}

Modify the code according to the user's request. Keep what works well and only change what's necessary.
Support RTL (right-to-left) for Arabic content.

Respond with a JSON object containing:
- html: The complete updated HTML body content
- css: The complete updated CSS styles
- js: The complete updated JavaScript code
- message: A brief description of what you changed (in Arabic if the request is in Arabic)

Important: Only respond with valid JSON. No markdown code blocks or extra text.`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 8192,
      messages: [
        { role: "user", content: systemPrompt },
      ],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error("No content generated");
    }

    let jsonStr = textContent.text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const result = JSON.parse(jsonStr);
    return {
      html: result.html || currentHtml,
      css: result.css || currentCss,
      js: result.js || currentJs,
      message: result.message || "تم تحديث الموقع بنجاح! / Website updated successfully!",
    };
  } catch (error) {
    console.error("AI refinement error:", error);
    // Return current code with error message instead of throwing
    return {
      html: currentHtml,
      css: currentCss,
      js: currentJs,
      message: "لم نتمكن من تعديل الكود حالياً. حاول مرة أخرى أو اكتب طلباً مختلفاً.",
    };
  }
}
