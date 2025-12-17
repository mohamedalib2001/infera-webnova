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
