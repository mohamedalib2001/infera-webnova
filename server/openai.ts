import Anthropic from "@anthropic-ai/sdk";

let anthropic: Anthropic | null = null;

const anthropicApiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const anthropicBaseUrl = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

if (anthropicApiKey) {
  anthropic = new Anthropic({ 
    apiKey: anthropicApiKey,
    ...(anthropicBaseUrl && { baseURL: anthropicBaseUrl }),
  });
}

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
  if (!anthropic) {
    console.log("Anthropic client not initialized - API key missing");
    return getDefaultCode();
  }

  const systemPrompt = `You are an expert web developer and designer specializing in creating beautiful, modern websites. Generate responsive website code based on user requests.

IMPORTANT RULES:
1. Generate complete, functional HTML, CSS, and JavaScript code
2. Use modern CSS with flexbox/grid for layouts
3. Make designs responsive and mobile-friendly
4. Use clean, semantic HTML
5. Include smooth animations and transitions where appropriate
6. Use a modern color palette (prefer purple/violet, indigo, and professional gradients)
7. Include hover states and interactive elements
8. Make sure all code is production-ready
9. For Arabic content, add dir="rtl" to the root element and use appropriate RTL styling
10. Support both Arabic and English content as needed

${context ? `\nCurrent website context:\n${context}` : ""}

Respond with a JSON object containing:
- html: The HTML body content (without doctype, html, head tags - just the content)
- css: Complete CSS styles
- js: JavaScript code for interactivity (can be empty string if not needed)
- message: A brief description of what you created/changed (in Arabic if the prompt is in Arabic)

Important: Only respond with valid JSON. No markdown code blocks or extra text.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
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

    const result = JSON.parse(jsonStr);
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
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function analyzeIntent(
  prompt: string,
  hasExistingCode: boolean = false
): Promise<{ intent: "conversation" | "code_generation" | "code_refinement" | "help"; codeRequest?: string }> {
  if (!anthropic) {
    return { intent: "conversation" };
  }

  const systemPrompt = `أنت محلل للنوايا. حدد نوع طلب المستخدم:
You are an intent analyzer. Determine the user request type:

1. "conversation" - تحيات، أسئلة عامة، محادثة عادية (مرحبا، كيف حالك، ما هو...)
   Greetings, general questions, normal chat (hello, how are you, what is...)
   
2. "code_generation" - طلب إنشاء موقع/صفحة/تطبيق جديد
   Request to create new website/page/app
   
3. "code_refinement" - طلب تعديل/تحسين كود موجود (فقط إذا كان hasExistingCode=true)
   Request to modify/improve existing code (only if hasExistingCode=true)
   
4. "help" - طلب مساعدة تقنية أو شرح
   Request for technical help or explanation

أجب بـ JSON فقط:
{"intent": "...", "codeRequest": "طلب الكود إذا كان النوع code_generation أو code_refinement"}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: systemPrompt,
      messages: [{ role: "user", content: `hasExistingCode: ${hasExistingCode}\nUser message: ${prompt}` }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return { intent: "conversation" };
    }

    let jsonStr = textContent.text.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
    jsonStr = jsonStr.trim();

    const result = JSON.parse(jsonStr);
    return {
      intent: result.intent || "conversation",
      codeRequest: result.codeRequest
    };
  } catch {
    return { intent: "conversation" };
  }
}

export async function conversationalResponse(
  prompt: string,
  conversationHistory: ChatMessage[] = []
): Promise<{ message: string; suggestions: string[] }> {
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
      model: "claude-sonnet-4-20250514",
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
  
  const { intent, codeRequest } = await analyzeIntent(prompt, hasExistingCode);
  
  if (intent === "conversation" || intent === "help") {
    const response = await conversationalResponse(prompt, conversationHistory);
    return {
      type: intent,
      message: response.message,
      suggestions: response.suggestions
    };
  }
  
  if (intent === "code_generation") {
    try {
      const code = await generateWebsiteCode(codeRequest || prompt);
      return {
        type: "code_generation",
        message: code.message,
        code: code,
        suggestions: ["عدل التصميم", "أضف ميزات جديدة", "غير الألوان"]
      };
    } catch (error) {
      return {
        type: "conversation",
        message: "حدث خطأ أثناء إنشاء الكود. يرجى المحاولة مرة أخرى.\n\nError generating code. Please try again.",
        suggestions: ["حاول مرة أخرى"]
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
        suggestions: ["استمر في التعديل", "احفظ المشروع", "معاينة"]
      };
    } catch (error) {
      return {
        type: "conversation",
        message: "حدث خطأ أثناء تعديل الكود. يرجى المحاولة مرة أخرى.\n\nError refining code. Please try again.",
        suggestions: ["حاول مرة أخرى"]
      };
    }
  }
  
  const response = await conversationalResponse(prompt, conversationHistory);
  return {
    type: "conversation",
    message: response.message,
    suggestions: response.suggestions
  };
}

export async function refineWebsiteCode(
  prompt: string,
  currentHtml: string,
  currentCss: string,
  currentJs: string
): Promise<GeneratedCode> {
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
      model: "claude-sonnet-4-20250514",
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
