import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface AnalysisResult {
  overallScore: number;
  performanceScore: number;
  securityScore: number;
  accessibilityScore: number;
  seoScore: number;
  codeQualityScore: number;
  suggestions: SuggestionData[];
}

export interface SuggestionData {
  type: string;
  priority: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  affectedFile: string;
  affectedCode?: string;
  lineNumber?: number;
  suggestedFix: string;
  suggestedFixAr: string;
  codeBeforeFix?: string;
  codeAfterFix?: string;
  canAutoApply: boolean;
  expectedImpact: string;
  expectedImpactAr: string;
  estimatedEffort: string;
}

export async function analyzeCodeWithAI(
  code: { html?: string; css?: string; js?: string; backend?: string },
  analysisType: "full" | "quick" | "security" | "performance" = "full"
): Promise<AnalysisResult> {
  const focusAreas = {
    full: "performance, security, accessibility, SEO, code quality, UX, and optimization",
    quick: "critical issues and high-priority improvements only",
    security: "security vulnerabilities, XSS, CSRF, injection attacks, and data exposure",
    performance: "performance bottlenecks, load time, memory usage, and optimization opportunities",
  };

  const prompt = `You are an expert code analyzer for web applications. Analyze the following code and provide suggestions for improvements.

Focus areas: ${focusAreas[analysisType] || focusAreas.full}

## Code to Analyze:

${code.html ? `### HTML:\n\`\`\`html\n${code.html.substring(0, 5000)}\n\`\`\`\n` : ""}
${code.css ? `### CSS:\n\`\`\`css\n${code.css.substring(0, 3000)}\n\`\`\`\n` : ""}
${code.js ? `### JavaScript:\n\`\`\`javascript\n${code.js.substring(0, 5000)}\n\`\`\`\n` : ""}
${code.backend ? `### Backend:\n\`\`\`javascript\n${code.backend.substring(0, 5000)}\n\`\`\`\n` : ""}

## Response Format:
Return a JSON object with the following structure:
\`\`\`json
{
  "overallScore": 75,
  "performanceScore": 80,
  "securityScore": 70,
  "accessibilityScore": 60,
  "seoScore": 85,
  "codeQualityScore": 75,
  "suggestions": [
    {
      "type": "performance|security|accessibility|seo|best_practice|code_quality|ux|optimization",
      "priority": "critical|high|medium|low|info",
      "title": "English title",
      "titleAr": "العنوان بالعربية",
      "description": "Detailed description in English",
      "descriptionAr": "الوصف التفصيلي بالعربية",
      "affectedFile": "html|css|js|backend",
      "affectedCode": "The problematic code snippet",
      "lineNumber": 10,
      "suggestedFix": "How to fix it in English",
      "suggestedFixAr": "كيفية الإصلاح بالعربية",
      "codeBeforeFix": "Original code",
      "codeAfterFix": "Fixed code",
      "canAutoApply": true,
      "expectedImpact": "Expected improvement in English",
      "expectedImpactAr": "التحسين المتوقع بالعربية",
      "estimatedEffort": "5 minutes"
    }
  ]
}
\`\`\`

Provide 3-10 actionable suggestions sorted by priority. Be specific and provide code examples where possible.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return getDefaultAnalysisResult();
    }

    const jsonMatch = textContent.text.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : textContent.text;
    
    const parsed = JSON.parse(jsonStr);
    return {
      overallScore: parsed.overallScore ?? 70,
      performanceScore: parsed.performanceScore ?? 70,
      securityScore: parsed.securityScore ?? 70,
      accessibilityScore: parsed.accessibilityScore ?? 70,
      seoScore: parsed.seoScore ?? 70,
      codeQualityScore: parsed.codeQualityScore ?? 70,
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return getDefaultAnalysisResult();
  }
}

function getDefaultAnalysisResult(): AnalysisResult {
  return {
    overallScore: 70,
    performanceScore: 70,
    securityScore: 70,
    accessibilityScore: 70,
    seoScore: 70,
    codeQualityScore: 70,
    suggestions: [],
  };
}
