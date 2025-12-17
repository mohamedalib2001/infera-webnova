import Anthropic from "@anthropic-ai/sdk";

// Use Replit's integration for reliable model access, fall back to user's key
const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

const anthropic = new Anthropic({
  apiKey: apiKey,
  ...(baseURL && { baseURL }),
});

function parseJsonResponse(content: string): any {
  let jsonContent = content.trim();
  
  // Try to extract JSON from markdown code blocks
  const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1].trim();
  } else {
    // Clean any stray backticks
    jsonContent = jsonContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/g, '').trim();
  }
  
  // Try to find JSON object if content has extra text
  if (!jsonContent.startsWith('{')) {
    const objMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (objMatch) {
      jsonContent = objMatch[0];
    }
  }
  
  return JSON.parse(jsonContent);
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
9. Support RTL (right-to-left) for Arabic content when requested

${context ? `\nCurrent website context:\n${context}` : ""}

Respond with a JSON object containing:
- html: The HTML body content (without doctype, html, head tags - just the content)
- css: Complete CSS styles
- js: JavaScript code for interactivity
- message: A brief description of what you created/changed (in the same language as the user's request)

Important: Only respond with valid JSON. No markdown code blocks.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
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
      message: result.message || "Website code generated successfully!",
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
  const context = `Current HTML:\n${currentHtml}\n\nCurrent CSS:\n${currentCss}\n\nCurrent JavaScript:\n${currentJs}`;
  
  const systemPrompt = `You are an expert web developer. The user wants to modify their existing website.

CURRENT WEBSITE CODE:
${context}

USER REQUEST: ${prompt}

Modify the code according to the user's request. Keep what works well and only change what's necessary.
Support RTL (right-to-left) for Arabic content when needed.

Respond with a JSON object containing:
- html: The complete updated HTML body content
- css: The complete updated CSS styles
- js: The complete updated JavaScript code
- message: A brief description of what you changed (in the same language as the user's request)

Important: Only respond with valid JSON. No markdown code blocks.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
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
      message: result.message || "Website updated successfully!",
    };
  } catch (error) {
    console.error("Claude refinement error:", error);
    throw new Error("Failed to update website code. Please try again.");
  }
}
