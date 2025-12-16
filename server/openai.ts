import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface GeneratedCode {
  html: string;
  css: string;
  js: string;
  message: string;
}

// Default fallback code when OpenAI is not available
function getDefaultCode(): GeneratedCode {
  return {
    html: `<div class="welcome">
  <header class="header">
    <h1>Welcome to BuilderAI</h1>
    <p>Your AI-powered website builder</p>
  </header>
  <main class="content">
    <div class="card">
      <h2>Getting Started</h2>
      <p>Describe the website you want to create and AI will generate it for you.</p>
      <p><em>Note: OpenAI API key required for AI generation.</em></p>
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
    js: `console.log('Welcome to BuilderAI!');`,
    message: "OpenAI API key is not configured. Please add your OPENAI_API_KEY to enable AI-powered website generation.",
  };
}

export async function generateWebsiteCode(
  prompt: string,
  context?: string
): Promise<GeneratedCode> {
  if (!openai) {
    return getDefaultCode();
  }

  const systemPrompt = `You are an expert web developer and designer. Generate beautiful, modern, and responsive website code based on user requests.

IMPORTANT RULES:
1. Generate complete, functional HTML, CSS, and JavaScript code
2. Use modern CSS with flexbox/grid for layouts
3. Make designs responsive and mobile-friendly
4. Use clean, semantic HTML
5. Include smooth animations and transitions where appropriate
6. Use a modern color palette (prefer purple/violet, pink, cyan gradients like modern SaaS products)
7. Include hover states and interactive elements
8. Make sure all code is production-ready

${context ? `\nCurrent website context:\n${context}` : ""}

Respond with a JSON object containing:
- html: The HTML body content (without doctype, html, head tags - just the content)
- css: Complete CSS styles
- js: JavaScript code for interactivity
- message: A brief description of what you created/changed

Important: Only respond with valid JSON. No markdown code blocks.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const result = JSON.parse(content);
    return {
      html: result.html || "",
      css: result.css || "",
      js: result.js || "",
      message: result.message || "Website code generated successfully!",
    };
  } catch (error) {
    console.error("OpenAI generation error:", error);
    throw new Error("Failed to generate website code. Please try again.");
  }
}

export async function refineWebsiteCode(
  prompt: string,
  currentHtml: string,
  currentCss: string,
  currentJs: string
): Promise<GeneratedCode> {
  if (!openai) {
    return {
      html: currentHtml,
      css: currentCss,
      js: currentJs,
      message: "OpenAI API key is not configured. Please add your OPENAI_API_KEY to enable AI-powered editing.",
    };
  }

  const context = `Current HTML:\n${currentHtml}\n\nCurrent CSS:\n${currentCss}\n\nCurrent JavaScript:\n${currentJs}`;
  
  const systemPrompt = `You are an expert web developer. The user wants to modify their existing website.

CURRENT WEBSITE CODE:
${context}

USER REQUEST: ${prompt}

Modify the code according to the user's request. Keep what works well and only change what's necessary.

Respond with a JSON object containing:
- html: The complete updated HTML body content
- css: The complete updated CSS styles
- js: The complete updated JavaScript code
- message: A brief description of what you changed

Important: Only respond with valid JSON. No markdown code blocks.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const result = JSON.parse(content);
    return {
      html: result.html || currentHtml,
      css: result.css || currentCss,
      js: result.js || currentJs,
      message: result.message || "Website updated successfully!",
    };
  } catch (error) {
    console.error("OpenAI refinement error:", error);
    throw new Error("Failed to update website code. Please try again.");
  }
}
