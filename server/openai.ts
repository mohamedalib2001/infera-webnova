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
    throw new Error("فشل في إنشاء كود الموقع. يرجى المحاولة مرة أخرى. / Failed to generate website code. Please try again.");
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
  const systemPrompt = `أنت مساعد ذكي متقدم جداً في منصة INFERA WebNova - منصة إنشاء المواقع والتطبيقات بالذكاء الاصطناعي.
You are a highly advanced AI assistant for INFERA WebNova - an AI-powered platform builder.

أنت Claude، نموذج ذكاء اصطناعي متطور من Anthropic. أجب بذكاء وفهم عميق.
You are Claude, an advanced AI model from Anthropic. Respond intelligently with deep understanding.

## قدراتك الكاملة:
- فهم السياق والتذكر الكامل للمحادثة
- الإجابة على أي سؤال بشكل مفصل ودقيق
- إنشاء مواقع ويب وتطبيقات كاملة
- تعديل وتحسين الأكواد
- شرح المفاهيم التقنية بوضوح
- المساعدة في التخطيط والتصميم
- حل المشاكل البرمجية
- تقديم نصائح احترافية

## قواعد الرد:
1. افهم ما يريده المستخدم تماماً قبل الرد
2. استخدم نفس لغة المستخدم (عربي أو إنجليزي)
3. كن مفيداً ومباشراً - لا ترد برسائل ترحيب متكررة
4. إذا كانت المحادثة مستمرة، تذكر السياق السابق
5. قدم اقتراحات عملية مفيدة

رد بصيغة JSON:
{"message": "ردك الذكي والمفيد", "suggestions": ["اقتراح 1", "اقتراح 2", "اقتراح 3"]}`;

  // Build messages with proper roles
  const messages: Array<{role: "user" | "assistant", content: string}> = [];
  
  // Add conversation history with proper roles (last 12 messages)
  const recentHistory = conversationHistory.slice(-12);
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

export async function smartChat(
  prompt: string,
  conversationHistory: ChatMessage[] = [],
  projectContext?: {
    name?: string;
    htmlCode?: string;
    cssCode?: string;
    jsCode?: string;
  }
): Promise<SmartChatResponse> {
  const hasExistingCode = !!(projectContext?.htmlCode && projectContext.htmlCode.length > 10);
  
  // Model info to include in all responses
  const modelInfo = {
    name: DEFAULT_ANTHROPIC_MODEL,
    provider: "Anthropic"
  };
  
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
    throw new Error("فشل في تحديث كود الموقع. يرجى المحاولة مرة أخرى. / Failed to update website code. Please try again.");
  }
}
