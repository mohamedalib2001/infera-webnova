import Anthropic from "@anthropic-ai/sdk";
import { findBestTemplate } from "./premium-templates";

const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

const anthropic = new Anthropic({
  apiKey: apiKey,
  ...(baseURL && { baseURL }),
});

// ============= Types =============

export interface WebsitePlan {
  type: "landing" | "ecommerce" | "portfolio" | "business" | "blog" | "saas";
  language: "ar" | "en" | "bilingual";
  sections: SectionPlan[];
  colorScheme: ColorScheme;
  typography: Typography;
  features: string[];
  targetAudience: string;
  tone: string;
}

export interface SectionPlan {
  id: string;
  type: string;
  title: string;
  description: string;
  components: string[];
  priority: number;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  gradient: string;
}

export interface Typography {
  headingFont: string;
  bodyFont: string;
  arabicFont: string;
}

export interface GeneratedCode {
  html: string;
  css: string;
  js: string;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  severity: "critical" | "warning" | "info";
  category: string;
  message: string;
}

export interface GenerationResult {
  html: string;
  css: string;
  js: string;
  message: string;
  plan?: WebsitePlan;
  validation?: ValidationResult;
  attempts: number;
}

// ============= Planner =============

const PLANNER_PROMPT = `You are an expert website architect. Analyze the user's request and output a comprehensive JSON plan.

## OUTPUT FORMAT (ONLY valid JSON, no markdown):
{
  "type": "landing|ecommerce|portfolio|business|blog|saas",
  "language": "ar|en|bilingual",
  "sections": [
    {"id": "hero", "type": "hero", "title": "...", "description": "...", "components": [...], "priority": 1}
  ],
  "colorScheme": {"primary": "#6366f1", "secondary": "#8b5cf6", "accent": "#06b6d4", "background": "#ffffff", "text": "#1e293b", "gradient": "..."},
  "typography": {"headingFont": "Tajawal", "bodyFont": "Tajawal", "arabicFont": "Tajawal"},
  "features": ["responsive", "animations"],
  "targetAudience": "...",
  "tone": "professional|playful|luxury|minimal|bold"
}`;

async function createWebsitePlan(userRequest: string): Promise<WebsitePlan> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: userRequest }],
      system: PLANNER_PROMPT,
    });

    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No plan generated");
    }

    let jsonText = textBlock.text.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonText = jsonMatch[1].trim();
    
    const startIdx = jsonText.indexOf('{');
    const endIdx = jsonText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      jsonText = jsonText.substring(startIdx, endIdx + 1);
    }

    const plan = JSON.parse(jsonText) as WebsitePlan;
    if (!plan.sections || plan.sections.length === 0) {
      plan.sections = getDefaultSections(plan.type || "landing");
    }
    if (!plan.colorScheme) plan.colorScheme = getDefaultColorScheme();
    if (!plan.typography) plan.typography = { headingFont: "Tajawal", bodyFont: "Tajawal", arabicFont: "Tajawal" };

    console.log("Plan created:", plan.type, plan.sections.length, "sections");
    return plan;

  } catch (error) {
    console.error("Planning error:", error);
    return getDefaultPlan(userRequest);
  }
}

function getDefaultSections(type: string): SectionPlan[] {
  return [
    { id: "hero", type: "hero", title: "Hero", description: "Main landing", components: ["gradient-bg", "headline", "cta"], priority: 1 },
    { id: "features", type: "features", title: "Features", description: "Key features", components: ["cards", "icons"], priority: 2 },
    { id: "pricing", type: "pricing", title: "Pricing", description: "Plans", components: ["pricing-cards"], priority: 3 },
    { id: "testimonials", type: "testimonials", title: "Testimonials", description: "Reviews", components: ["review-cards"], priority: 4 },
    { id: "cta", type: "cta", title: "CTA", description: "Final call", components: ["gradient-bg", "cta"], priority: 5 },
    { id: "footer", type: "footer", title: "Footer", description: "Footer", components: ["links", "social"], priority: 6 },
  ];
}

function getDefaultColorScheme(): ColorScheme {
  return {
    primary: "#6366f1", secondary: "#8b5cf6", accent: "#06b6d4",
    background: "#ffffff", text: "#1e293b",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
  };
}

function getDefaultPlan(userRequest: string): WebsitePlan {
  const isArabic = /[\u0600-\u06FF]/.test(userRequest);
  const isEcommerce = /متجر|shop|store|منتج|product/i.test(userRequest);
  return {
    type: isEcommerce ? "ecommerce" : "landing",
    language: isArabic ? "ar" : "en",
    sections: getDefaultSections(isEcommerce ? "ecommerce" : "landing"),
    colorScheme: getDefaultColorScheme(),
    typography: { headingFont: "Tajawal", bodyFont: "Tajawal", arabicFont: "Tajawal" },
    features: ["responsive", "animations"],
    targetAudience: "General",
    tone: "professional"
  };
}

// ============= Builder =============

function generateBuilderPrompt(plan: WebsitePlan, template: GeneratedCode, validationFeedback?: string): string {
  const sectionsGuide = plan.sections.map(s => 
    `- ${s.id}: ${s.description} (${s.components.join(", ")})`
  ).join("\n");

  const featuresText = plan.features.length > 0 ? `\nRequired Features: ${plan.features.join(", ")}` : "";
  const feedbackText = validationFeedback ? `\n\n## CRITICAL FIXES REQUIRED:\n${validationFeedback}` : "";

  return `You are an elite frontend developer creating a premium website. Your output must be production-ready and match award-winning quality.

## WEBSITE PLAN
Type: ${plan.type}
Language: ${plan.language} ${plan.language === "ar" ? "(Arabic RTL - MUST include dir=\"rtl\" on html tag)" : "(English LTR)"}
Tone: ${plan.tone}
Target Audience: ${plan.targetAudience}${featuresText}

## SECTIONS TO BUILD:
${sectionsGuide}

## COLOR SCHEME (use CSS variables):
:root {
  --primary: ${plan.colorScheme.primary};
  --secondary: ${plan.colorScheme.secondary};
  --accent: ${plan.colorScheme.accent};
  --background: ${plan.colorScheme.background};
  --text: ${plan.colorScheme.text};
}
Gradient: ${plan.colorScheme.gradient}

## TYPOGRAPHY:
- Arabic: ${plan.typography.arabicFont}
- Headings: ${plan.typography.headingFont}
- Body: ${plan.typography.bodyFont}

## PREMIUM TEMPLATE (Your starting foundation - COMPLETE CODE):
=== HTML ===
${template.html}

=== CSS ===
${template.css}

=== JAVASCRIPT ===
${template.js}
${feedbackText}

## QUALITY REQUIREMENTS (MANDATORY):
1. Use ONLY SVG icons - NO emojis, NO unicode symbols (✓, ★, ◆, etc.)
2. Every button MUST have :hover effect with transform/color change
3. Every card MUST have :hover with translateY(-4px) and shadow
4. Include CSS transitions: transition: all 0.3s ease;
5. Include @media queries for responsive design (768px, 1280px breakpoints)
6. All colors MUST use CSS variables
7. Include smooth scroll behavior
8. ${plan.language === "ar" ? "Arabic text with dir=\"rtl\" on html tag, Tajawal font" : "English text"}

## OUTPUT FORMAT
Return ONLY a valid JSON object:
{"html": "complete html", "css": "complete css", "js": "complete js"}

CRITICAL: Escape newlines as \\n, quotes as \\", output COMPLETE code for all fields.`;
}

async function buildWebsite(
  plan: WebsitePlan, 
  userRequest: string, 
  previousOutput?: GeneratedCode,
  validationFeedback?: string
): Promise<GeneratedCode> {
  const template = findBestTemplate(userRequest);
  const baseCode = previousOutput || template;
  const isRetry = !!previousOutput;
  
  console.log(`Building ${isRetry ? "(retry with fixes)" : "with template: " + template.id}`);
  
  try {
    const systemPrompt = isRetry 
      ? generateRetryPrompt(plan, previousOutput!, validationFeedback!)
      : generateBuilderPrompt(plan, template);
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 16000,
      messages: [{ role: "user", content: `Build this website: ${userRequest}` }],
      system: systemPrompt,
    });

    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return baseCode;

    return parseBuilderResponse(textBlock.text, baseCode);
  } catch (error) {
    console.error("Builder error:", error);
    return baseCode;
  }
}

function generateRetryPrompt(plan: WebsitePlan, previousOutput: GeneratedCode, feedback: string): string {
  return `You are an elite frontend developer. Your previous output had quality issues that MUST be fixed.

## CRITICAL FIXES REQUIRED:
${feedback}

## YOUR PREVIOUS OUTPUT (FIX THIS CODE):
=== HTML ===
${previousOutput.html}

=== CSS ===
${previousOutput.css}

=== JAVASCRIPT ===
${previousOutput.js}

## REQUIREMENTS:
1. Keep the overall structure and design
2. Fix ALL the issues listed above
3. Use ONLY SVG icons - NO emojis, NO unicode symbols
4. Every button needs :hover effects
5. Include media queries for responsive design
6. ${plan.language === "ar" ? 'Arabic text with dir="rtl" on html tag' : "English text"}

## OUTPUT FORMAT
Return ONLY a valid JSON object:
{"html": "fixed html", "css": "fixed css", "js": "fixed js"}

CRITICAL: Fix the specific issues mentioned. Escape newlines as \\n, quotes as \\".`;
}

function parseBuilderResponse(text: string, fallback: GeneratedCode): GeneratedCode {
  try {
    let jsonText = text.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonText = jsonMatch[1].trim();
    
    const startIdx = jsonText.indexOf('{');
    const endIdx = jsonText.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) throw new Error("No JSON");
    jsonText = jsonText.substring(startIdx, endIdx + 1);
    
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.html && parsed.html.length > 500) {
        return { html: parsed.html, css: parsed.css || fallback.css, js: parsed.js || fallback.js };
      }
    } catch {}

    const html = extractField(jsonText, "html");
    const css = extractField(jsonText, "css");
    const js = extractField(jsonText, "js");

    if (html && html.length > 500) {
      return { html, css: css || fallback.css, js: js || fallback.js };
    }
    throw new Error("Invalid structure");
  } catch (error) {
    console.error("Parse error:", error);
    return fallback;
  }
}

function extractField(content: string, fieldName: string): string {
  const pattern = new RegExp(`"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"`);
  const match = content.match(pattern);
  if (match) {
    return match[1].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  return "";
}

// ============= Validator =============

function validateGeneratedCode(code: GeneratedCode): ValidationResult {
  const issues: ValidationIssue[] = [];
  let score = 100;

  if (!code.html.includes("<html")) { issues.push({ severity: "critical", category: "structure", message: "Missing html tag" }); score -= 20; }
  if (!code.html.includes("<head>") && !code.html.includes("<head ")) { issues.push({ severity: "critical", category: "structure", message: "Missing head" }); score -= 15; }
  if (!code.html.includes("<body>") && !code.html.includes("<body ")) { issues.push({ severity: "critical", category: "structure", message: "Missing body" }); score -= 15; }

  const hasArabic = /[\u0600-\u06FF]/.test(code.html);
  if (hasArabic && !code.html.includes('dir="rtl"')) { issues.push({ severity: "critical", category: "rtl", message: "Arabic without RTL" }); score -= 15; }

  const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u;
  if (emojiPattern.test(code.html)) { issues.push({ severity: "critical", category: "icons", message: "Contains emoji" }); score -= 25; }

  if (!code.css.includes('@media')) { issues.push({ severity: "warning", category: "responsive", message: "No media queries" }); score -= 10; }
  if (!code.css.includes(':hover')) { issues.push({ severity: "warning", category: "ux", message: "No hover effects" }); score -= 10; }
  if (code.css.length < 1000) { issues.push({ severity: "critical", category: "css", message: "CSS too short" }); score -= 20; }

  score = Math.max(0, Math.min(100, score));
  const isValid = score >= 60 && !issues.some(i => i.severity === "critical" && (i.category === "icons" || i.category === "structure"));

  return { isValid, score, issues, suggestions: [] };
}

// ============= Main Engine =============

const MAX_ATTEMPTS = 2;

function formatValidationFeedback(validation: ValidationResult): string {
  const criticalIssues = validation.issues
    .filter(i => i.severity === "critical")
    .map(i => `- FIX: ${i.message}`)
    .join("\n");
  
  const warnings = validation.issues
    .filter(i => i.severity === "warning")
    .map(i => `- IMPROVE: ${i.message}`)
    .join("\n");
  
  return `Previous output had quality issues (score: ${validation.score}/100).
${criticalIssues}
${warnings}
Please fix ALL these issues in your next output.`;
}

export async function generateWebsite(userRequest: string): Promise<GenerationResult> {
  console.log("=== MULTI-STAGE AI GENERATION ===");
  
  let attempts = 0;
  let lastResult: GeneratedCode | null = null;
  let lastValidation: ValidationResult | null = null;
  let plan: WebsitePlan | null = null;

  try {
    console.log("[planning] Analyzing request...");
    plan = await createWebsitePlan(userRequest);
    console.log(`[planning] Plan: ${plan.type}, ${plan.sections.length} sections`);

    while (attempts < MAX_ATTEMPTS) {
      attempts++;
      console.log(`[building] Attempt ${attempts}/${MAX_ATTEMPTS}...`);
      
      if (attempts === 1) {
        // First attempt: use template as base
        lastResult = await buildWebsite(plan, userRequest);
      } else {
        // Retry: use previous output + validation feedback
        const feedback = formatValidationFeedback(lastValidation!);
        console.log("[retry] Passing previous output + feedback to builder...");
        lastResult = await buildWebsite(plan, userRequest, lastResult!, feedback);
      }
      
      console.log("[validating] Checking quality...");
      lastValidation = validateGeneratedCode(lastResult);
      console.log(`[validating] Score: ${lastValidation.score}/100, Valid: ${lastValidation.isValid}`);
      
      if (lastValidation.isValid) {
        return {
          html: lastResult.html, css: lastResult.css, js: lastResult.js,
          message: `تم إنشاء موقع احترافي بجودة ${lastValidation.score}%`,
          plan, validation: lastValidation, attempts
        };
      }
    }

    if (lastResult && lastResult.html.length > 500) {
      return {
        html: lastResult.html, css: lastResult.css, js: lastResult.js,
        message: `تم إنشاء الموقع (جودة: ${lastValidation?.score || 70}/100)`,
        plan: plan || undefined, validation: lastValidation || undefined, attempts
      };
    }

    const template = findBestTemplate(userRequest);
    return { html: template.html, css: template.css, js: template.js, message: "تم إنشاء موقع احترافي", attempts };

  } catch (error) {
    console.error("Generation error:", error);
    const template = findBestTemplate(userRequest);
    return { html: template.html, css: template.css, js: template.js, message: "تم إنشاء موقع احترافي", attempts: 1 };
  }
}

export async function generateCodeAssistance(
  prompt: string,
  codeContext: string,
  fileName: string,
  language: "ar" | "en"
): Promise<string> {
  const systemPrompt = language === "ar" 
    ? `أنت مساعد برمجة ذكي. ساعد المستخدم في كتابة الكود وحل المشاكل البرمجية.
أجب بشكل مختصر ومفيد. إذا كان السؤال عن كود، قدم الكود مع شرح بسيط.
إذا تم توفير سياق كود، استخدمه لتقديم إجابة أكثر دقة.`
    : `You are an intelligent coding assistant. Help the user write code and solve programming problems.
Answer concisely and helpfully. If the question is about code, provide code with a brief explanation.
If code context is provided, use it to give a more accurate answer.`;

  const userMessage = codeContext 
    ? `File: ${fileName || "unknown"}\n\nCode context:\n\`\`\`\n${codeContext.substring(0, 3000)}\n\`\`\`\n\nUser request: ${prompt}`
    : prompt;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return language === "ar" ? "لم أتمكن من معالجة طلبك. حاول مرة أخرى." : "I couldn't process your request. Please try again.";
    }

    return textBlock.text;
  } catch (error) {
    console.error("AI assistance error:", error);
    return language === "ar" ? "حدث خطأ. حاول مرة أخرى." : "An error occurred. Please try again.";
  }
}

export async function refineWebsite(userRequest: string, currentCode: GeneratedCode): Promise<GenerationResult> {
  console.log("=== AI REFINEMENT ===");
  
  try {
    const mockPlan: WebsitePlan = {
      type: "landing",
      language: /[\u0600-\u06FF]/.test(currentCode.html) ? "ar" : "en",
      sections: [], colorScheme: getDefaultColorScheme(),
      typography: { headingFont: "Tajawal", bodyFont: "Tajawal", arabicFont: "Tajawal" },
      features: [], targetAudience: "", tone: "professional"
    };

    const result = await buildWebsite(mockPlan, `MODIFY: ${currentCode.html.substring(0, 2000)} REQUEST: ${userRequest}`);
    const validation = validateGeneratedCode(result);

    if (validation.isValid) {
      return { html: result.html, css: result.css, js: result.js, message: "تم تحديث الموقع", validation, attempts: 1 };
    }
    return { html: currentCode.html, css: currentCode.css, js: currentCode.js, message: "الكود محفوظ", attempts: 1 };
  } catch (error) {
    console.error("Refinement error:", error);
    return { html: currentCode.html, css: currentCode.css, js: currentCode.js, message: "الكود محفوظ", attempts: 1 };
  }
}
