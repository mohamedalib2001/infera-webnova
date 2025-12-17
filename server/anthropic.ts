import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

const anthropic = new Anthropic({
  apiKey: apiKey,
  ...(baseURL && { baseURL }),
});

function parseJsonResponse(content: string): any {
  let jsonContent = content.trim();
  
  const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1].trim();
  } else {
    jsonContent = jsonContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/g, '').trim();
  }
  
  if (!jsonContent.startsWith('{')) {
    const objMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (objMatch) {
      jsonContent = objMatch[0];
    }
  }
  
  try {
    return JSON.parse(jsonContent);
  } catch (parseError) {
    const htmlMatch = jsonContent.match(/"html"\s*:\s*"((?:[^"\\]|\\[\s\S])*)"/);
    const cssMatch = jsonContent.match(/"css"\s*:\s*"((?:[^"\\]|\\[\s\S])*)"/);
    const jsMatch = jsonContent.match(/"js"\s*:\s*"((?:[^"\\]|\\[\s\S])*)"/);
    const messageMatch = jsonContent.match(/"message"\s*:\s*"((?:[^"\\]|\\[\s\S])*)"/)
    
    if (htmlMatch || cssMatch) {
      return {
        html: htmlMatch ? htmlMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
        css: cssMatch ? cssMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
        js: jsMatch ? jsMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
        message: messageMatch ? messageMatch[1] : 'Generated successfully!'
      };
    }
    throw parseError;
  }
}

export interface GeneratedCode {
  html: string;
  css: string;
  js: string;
  message: string;
}

export async function generateWebsiteCode(
  prompt: string,
  context?: string
): Promise<GeneratedCode> {
  const systemPrompt = `You are an expert web developer. Generate clean, modern website code.

RULES:
1. Generate concise but complete HTML, CSS, and JavaScript
2. Use modern CSS with flexbox/grid
3. Use a gradient color scheme (purple/violet/cyan)
4. Support RTL for Arabic content
5. Keep code minimal but functional

${context ? `Context:\n${context}` : ""}

Respond ONLY with a JSON object (no markdown):
{"html": "...", "css": "...", "js": "...", "message": "..."}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 16384,
      messages: [
        { role: "user", content: prompt },
      ],
      system: systemPrompt,
    });

    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No content generated");
    }

    const result = parseJsonResponse(textBlock.text);
    return {
      html: result.html || "",
      css: result.css || "",
      js: result.js || "",
      message: result.message || "Website generated!",
    };
  } catch (error) {
    console.error("Claude generation error:", error);
    throw new Error("Failed to generate website code. Please try again.");
  }
}

export async function refineWebsiteCode(
  prompt: string,
  currentHtml: string,
  currentCss: string,
  currentJs: string
): Promise<GeneratedCode> {
  const systemPrompt = `You are an expert web developer modifying existing code.

CURRENT CODE:
HTML: ${currentHtml.substring(0, 2000)}
CSS: ${currentCss.substring(0, 1000)}
JS: ${currentJs.substring(0, 500)}

USER REQUEST: ${prompt}

Respond ONLY with a JSON object (no markdown):
{"html": "...", "css": "...", "js": "...", "message": "..."}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 16384,
      messages: [
        { role: "user", content: prompt },
      ],
      system: systemPrompt,
    });

    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No content generated");
    }

    const result = parseJsonResponse(textBlock.text);
    return {
      html: result.html || currentHtml,
      css: result.css || currentCss,
      js: result.js || currentJs,
      message: result.message || "Website updated!",
    };
  } catch (error) {
    console.error("Claude refinement error:", error);
    throw new Error("Failed to update website code. Please try again.");
  }
}
