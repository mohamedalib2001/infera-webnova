import Anthropic from "@anthropic-ai/sdk";
import { WebsitePlan, SectionPlan, ColorScheme } from "./planner";
import { findBestTemplate } from "../premium-templates";

const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

const anthropic = new Anthropic({
  apiKey: apiKey,
  ...(baseURL && { baseURL }),
});

export interface GeneratedCode {
  html: string;
  css: string;
  js: string;
}

function generateBuilderPrompt(plan: WebsitePlan, template: { html: string; css: string; js: string }): string {
  const sectionsGuide = plan.sections.map(s => 
    `- ${s.id}: ${s.description} (components: ${s.components.join(", ")})`
  ).join("\n");

  return `You are an elite frontend developer creating a premium website. You have a detailed PLAN and a TEMPLATE as your starting point.

## WEBSITE PLAN (Follow this exactly)
Type: ${plan.type}
Language: ${plan.language}
Tone: ${plan.tone}
Target: ${plan.targetAudience}

### SECTIONS TO BUILD:
${sectionsGuide}

### COLOR SCHEME:
Primary: ${plan.colorScheme.primary}
Secondary: ${plan.colorScheme.secondary}
Accent: ${plan.colorScheme.accent}
Background: ${plan.colorScheme.background}
Text: ${plan.colorScheme.text}
Gradient: ${plan.colorScheme.gradient}

### TYPOGRAPHY:
Heading: ${plan.typography.headingFont}
Body: ${plan.typography.bodyFont}
Arabic: ${plan.typography.arabicFont}

## PREMIUM TEMPLATE (Your starting point)
Use this as your foundation - modify and enhance it according to the plan:

=== HTML ===
${template.html}

=== CSS ===
${template.css}

=== JS ===
${template.js}

## YOUR MISSION
1. Customize the template to match the PLAN exactly
2. Update all text content to be relevant and professional
3. Apply the color scheme from the plan
4. Ensure all sections from the plan are included
5. Keep all hover effects, animations, and transitions
6. Output production-ready code

## QUALITY REQUIREMENTS (CRITICAL - DO NOT SKIP)
- Use ONLY SVG icons (NO emojis, NO unicode symbols like stars)
- Every button must have hover effects
- Every card must have hover lift effect
- All colors must use CSS variables
- Include smooth scroll JavaScript
- Add intersection observer animations
- Responsive at 320px, 768px, 1280px
- ${plan.language === "ar" ? "Arabic text with RTL layout, dir=\"rtl\" on html" : "English text with LTR layout"}

## OUTPUT FORMAT
Return ONLY a valid JSON object (no markdown, no explanation):
{"html": "...", "css": "...", "js": "..."}

CRITICAL:
- Escape newlines as \\n
- Escape quotes as \\"
- Output COMPLETE code for each field
- The output must be a single valid JSON object`;
}

export async function buildWebsite(plan: WebsitePlan, userRequest: string): Promise<GeneratedCode> {
  const template = findBestTemplate(userRequest);
  console.log(`Building with template: ${template.id}, plan type: ${plan.type}`);
  
  const prompt = generateBuilderPrompt(plan, template);
  
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 16000,
      messages: [
        { role: "user", content: `Build this website: ${userRequest}` },
      ],
      system: prompt,
    });

    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.log("No response from builder, using template");
      return template;
    }

    const result = parseBuilderResponse(textBlock.text, template);
    return result;

  } catch (error) {
    console.error("Builder error:", error);
    return template;
  }
}

function parseBuilderResponse(text: string, fallback: GeneratedCode): GeneratedCode {
  try {
    // Try direct JSON parse first
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    
    // Find JSON boundaries
    const startIdx = jsonText.indexOf('{');
    const endIdx = jsonText.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) {
      throw new Error("No JSON object found");
    }
    jsonText = jsonText.substring(startIdx, endIdx + 1);
    
    // Try standard parse
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.html && parsed.html.length > 500) {
        return {
          html: parsed.html,
          css: parsed.css || fallback.css,
          js: parsed.js || fallback.js
        };
      }
    } catch (e) {
      // Continue to field extraction
    }

    // Extract fields individually using robust patterns
    const html = extractField(jsonText, "html");
    const css = extractField(jsonText, "css");
    const js = extractField(jsonText, "js");

    if (html && html.length > 500) {
      return {
        html: html,
        css: css || fallback.css,
        js: js || fallback.js
      };
    }

    throw new Error("Invalid response structure");

  } catch (error) {
    console.error("Parse error:", error);
    return fallback;
  }
}

function extractField(content: string, fieldName: string): string {
  // Pattern 1: Standard JSON string
  const pattern1 = new RegExp(`"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"`, 's');
  const match1 = content.match(pattern1);
  if (match1) {
    return unescapeString(match1[1]);
  }

  // Pattern 2: Find the field and manually extract
  const fieldStart = content.indexOf(`"${fieldName}":`);
  if (fieldStart === -1) return "";

  let searchStart = fieldStart + fieldName.length + 3;
  
  // Skip whitespace
  while (searchStart < content.length && /\s/.test(content[searchStart])) {
    searchStart++;
  }
  
  if (content[searchStart] !== '"') return "";
  
  let endIdx = searchStart + 1;
  let escaped = false;
  
  while (endIdx < content.length) {
    const char = content[endIdx];
    if (escaped) {
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === '"') {
      break;
    }
    endIdx++;
  }
  
  const extracted = content.substring(searchStart + 1, endIdx);
  return unescapeString(extracted);
}

function unescapeString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}
