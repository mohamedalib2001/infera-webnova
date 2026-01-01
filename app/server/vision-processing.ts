import type { Express, Request, Response } from "express";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs/promises";
import * as path from "path";

// ==================== نظام معالجة الرؤية ====================
// Vision Processing API for INFERA WebNova
// Supports: Image Analysis, OCR, Screenshot-to-Code

// Initialize Anthropic client
let anthropicClient: Anthropic | null = null;
try {
  anthropicClient = new Anthropic();
} catch (e) {
  console.error("[Vision] Failed to initialize Anthropic client:", e);
}

// Max image size (10MB base64 = ~7.5MB actual file)
const MAX_BASE64_SIZE = 10 * 1024 * 1024;

// Image analysis request schema with size validation
const imageAnalysisSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().max(MAX_BASE64_SIZE, "Image too large (max 10MB)").optional(),
  imageType: z.enum(["jpeg", "png", "gif", "webp"]).default("png"),
  analysisType: z.enum(["general", "ui", "ocr", "code", "screenshot-to-code"]),
  language: z.enum(["ar", "en"]).default("ar"),
  additionalInstructions: z.string().max(2000).optional(),
});

// OCR request schema with size validation
const ocrSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().max(MAX_BASE64_SIZE, "Image too large (max 10MB)").optional(),
  imageType: z.enum(["jpeg", "png", "gif", "webp"]).default("png"),
  extractFormat: z.enum(["text", "json", "markdown"]).default("text"),
  language: z.enum(["ar", "en", "mixed"]).default("mixed"),
});

// Screenshot to code schema with size validation
const screenshotToCodeSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().max(MAX_BASE64_SIZE, "Image too large (max 10MB)").optional(),
  imageType: z.enum(["jpeg", "png", "gif", "webp"]).default("png"),
  framework: z.enum(["react", "vue", "svelte", "html", "tailwind"]).default("react"),
  includeStyles: z.boolean().default(true),
  responsive: z.boolean().default(true),
  language: z.enum(["ar", "en"]).default("ar"),
});

// Get analysis prompt based on type
function getAnalysisPrompt(type: string, language: string, additionalInstructions?: string): string {
  const prompts: Record<string, { ar: string; en: string }> = {
    general: {
      ar: `حلل هذه الصورة بالتفصيل. اذكر:
1. وصف عام للصورة
2. العناصر الرئيسية المرئية
3. الألوان والتصميم
4. أي نص مرئي
5. السياق أو الغرض المحتمل

${additionalInstructions || ""}`,
      en: `Analyze this image in detail. Describe:
1. General description of the image
2. Main visible elements
3. Colors and design
4. Any visible text
5. Possible context or purpose

${additionalInstructions || ""}`,
    },
    ui: {
      ar: `حلل واجهة المستخدم هذه بالتفصيل:
1. نوع التطبيق/الموقع
2. هيكل التخطيط
3. المكونات المستخدمة (أزرار، نماذج، قوائم، إلخ)
4. نظام الألوان والتصميم
5. تجربة المستخدم (UX)
6. نقاط القوة
7. نقاط التحسين المقترحة

${additionalInstructions || ""}`,
      en: `Analyze this user interface in detail:
1. Type of application/website
2. Layout structure
3. Components used (buttons, forms, menus, etc.)
4. Color scheme and design
5. User experience (UX)
6. Strengths
7. Suggested improvements

${additionalInstructions || ""}`,
    },
    ocr: {
      ar: `استخرج جميع النصوص المرئية من هذه الصورة. قم بـ:
1. استخراج كل النص المقروء
2. الحفاظ على التنسيق قدر الإمكان
3. الإشارة إلى أي نص غير واضح

${additionalInstructions || ""}`,
      en: `Extract all visible text from this image. Do:
1. Extract all readable text
2. Preserve formatting as much as possible
3. Indicate any unclear text

${additionalInstructions || ""}`,
    },
    code: {
      ar: `حلل الكود المرئي في هذه الصورة:
1. لغة البرمجة المستخدمة
2. الوظيفة الرئيسية للكود
3. أي أخطاء مرئية
4. اقتراحات للتحسين
5. إعادة كتابة الكود بشكل صحيح

${additionalInstructions || ""}`,
      en: `Analyze the visible code in this image:
1. Programming language used
2. Main function of the code
3. Any visible errors
4. Suggestions for improvement
5. Rewrite the code correctly

${additionalInstructions || ""}`,
    },
    "screenshot-to-code": {
      ar: `حول هذه الصورة/لقطة الشاشة إلى كود. أنشئ كوداً يعيد إنتاج هذا التصميم بأكبر دقة ممكنة.`,
      en: `Convert this image/screenshot to code. Create code that reproduces this design as accurately as possible.`,
    },
  };
  
  const lang = language as "ar" | "en";
  return prompts[type]?.[lang] || prompts.general[lang];
}

// Get screenshot-to-code prompt based on framework
function getScreenshotToCodePrompt(framework: string, includeStyles: boolean, responsive: boolean, language: string): string {
  const frameworkInstructions: Record<string, string> = {
    react: `Generate React JSX code using functional components. ${includeStyles ? "Include inline styles or CSS classes." : "Only structure, no styles."} ${responsive ? "Make it responsive with Tailwind CSS classes." : ""}`,
    vue: `Generate Vue 3 template code with <script setup>. ${includeStyles ? "Include scoped styles." : "Only structure, no styles."} ${responsive ? "Make it responsive." : ""}`,
    svelte: `Generate Svelte component code. ${includeStyles ? "Include component styles." : "Only structure, no styles."} ${responsive ? "Make it responsive." : ""}`,
    html: `Generate clean HTML5 code. ${includeStyles ? "Include CSS styles in a <style> tag." : "Only HTML structure."} ${responsive ? "Make it responsive with flexbox/grid." : ""}`,
    tailwind: `Generate HTML with Tailwind CSS classes. Focus on pixel-perfect recreation using Tailwind utilities. ${responsive ? "Include responsive breakpoints (sm:, md:, lg:)." : ""}`,
  };
  
  const basePrompt = language === "ar"
    ? `أنت محول تصميم إلى كود محترف. حلل الصورة وأنشئ كوداً يعيد إنتاج التصميم بدقة عالية.

${frameworkInstructions[framework]}

المتطلبات:
1. إعادة إنتاج دقيقة للتخطيط
2. ألوان وخطوط مطابقة
3. جميع العناصر المرئية
4. كود نظيف وقابل للصيانة
5. لا تستخدم صور خارجية - استخدم placeholder أو أيقونات

أرجع الكود فقط بدون شرح إضافي.`
    : `You are a professional design-to-code converter. Analyze the image and create code that reproduces the design with high accuracy.

${frameworkInstructions[framework]}

Requirements:
1. Accurate layout reproduction
2. Matching colors and fonts
3. All visible elements
4. Clean, maintainable code
5. Don't use external images - use placeholders or icons

Return only the code without additional explanation.`;

  return basePrompt;
}

// Process image with Claude Vision
async function processImageWithVision(
  imageData: { url?: string; base64?: string; type: string },
  prompt: string
): Promise<string> {
  if (!anthropicClient) {
    throw new Error("AI service not available");
  }
  
  let imageSource: Anthropic.ImageBlockParam["source"];
  
  if (imageData.url) {
    imageSource = {
      type: "url",
      url: imageData.url,
    };
  } else if (imageData.base64) {
    imageSource = {
      type: "base64",
      media_type: `image/${imageData.type}` as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
      data: imageData.base64,
    };
  } else {
    throw new Error("Image URL or base64 data required");
  }
  
  const response = await anthropicClient.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: imageSource,
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });
  
  const textContent = response.content.find(c => c.type === "text");
  return textContent?.text || "";
}

// Register vision routes
export function registerVisionRoutes(app: Express): void {
  
  // ==================== تحليل الصورة ====================
  // Analyze image
  app.post("/api/vision/analyze", async (req: Request, res: Response) => {
    try {
      const data = imageAnalysisSchema.parse(req.body);
      
      if (!data.imageUrl && !data.imageBase64) {
        return res.status(400).json({
          success: false,
          error: "Image URL or base64 data required",
          errorAr: "مطلوب رابط الصورة أو بيانات base64",
        });
      }
      
      const prompt = getAnalysisPrompt(data.analysisType, data.language, data.additionalInstructions);
      
      const result = await processImageWithVision(
        { url: data.imageUrl, base64: data.imageBase64, type: data.imageType },
        prompt
      );
      
      res.json({
        success: true,
        analysisType: data.analysisType,
        result,
      });
    } catch (error: any) {
      console.error("[Vision] Analysis error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Image analysis failed",
        errorAr: "فشل تحليل الصورة",
      });
    }
  });
  
  // ==================== استخراج النص (OCR) ====================
  // Extract text with OCR
  app.post("/api/vision/ocr", async (req: Request, res: Response) => {
    try {
      const data = ocrSchema.parse(req.body);
      
      if (!data.imageUrl && !data.imageBase64) {
        return res.status(400).json({
          success: false,
          error: "Image URL or base64 data required",
          errorAr: "مطلوب رابط الصورة أو بيانات base64",
        });
      }
      
      const formatInstructions: Record<string, string> = {
        text: "Return the extracted text as plain text, preserving line breaks.",
        json: "Return the extracted text as a JSON object with sections and paragraphs.",
        markdown: "Return the extracted text formatted as Markdown with headers and lists where appropriate.",
      };
      
      const languageInstructions: Record<string, string> = {
        ar: "Focus on Arabic text. Also extract any English text found.",
        en: "Focus on English text. Also extract any Arabic text found.",
        mixed: "Extract text in all languages (Arabic, English, or others).",
      };
      
      const prompt = `Extract all text from this image.
${formatInstructions[data.extractFormat]}
${languageInstructions[data.language]}

Preserve the structure and hierarchy of the text as much as possible.`;
      
      const result = await processImageWithVision(
        { url: data.imageUrl, base64: data.imageBase64, type: data.imageType },
        prompt
      );
      
      res.json({
        success: true,
        format: data.extractFormat,
        text: result,
      });
    } catch (error: any) {
      console.error("[Vision] OCR error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "OCR extraction failed",
        errorAr: "فشل استخراج النص",
      });
    }
  });
  
  // ==================== تحويل لقطة الشاشة إلى كود ====================
  // Screenshot to code
  app.post("/api/vision/screenshot-to-code", async (req: Request, res: Response) => {
    try {
      const data = screenshotToCodeSchema.parse(req.body);
      
      if (!data.imageUrl && !data.imageBase64) {
        return res.status(400).json({
          success: false,
          error: "Image URL or base64 data required",
          errorAr: "مطلوب رابط الصورة أو بيانات base64",
        });
      }
      
      const prompt = getScreenshotToCodePrompt(
        data.framework,
        data.includeStyles,
        data.responsive,
        data.language
      );
      
      const result = await processImageWithVision(
        { url: data.imageUrl, base64: data.imageBase64, type: data.imageType },
        prompt
      );
      
      // Extract code blocks if present
      let code = result;
      const codeBlockMatch = result.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeBlockMatch) {
        code = codeBlockMatch[1].trim();
      }
      
      res.json({
        success: true,
        framework: data.framework,
        responsive: data.responsive,
        code,
        rawResponse: result,
      });
    } catch (error: any) {
      console.error("[Vision] Screenshot-to-code error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Screenshot to code conversion failed",
        errorAr: "فشل تحويل الصورة إلى كود",
      });
    }
  });
  
  // ==================== حالة خدمة الرؤية ====================
  // Vision service status
  app.get("/api/vision/status", async (req: Request, res: Response) => {
    try {
      res.json({
        status: anthropicClient ? "operational" : "unavailable",
        statusAr: anthropicClient ? "يعمل" : "غير متوفر",
        capabilities: {
          imageAnalysis: true,
          uiAnalysis: true,
          ocr: true,
          codeAnalysis: true,
          screenshotToCode: true,
        },
        supportedFormats: ["jpeg", "png", "gif", "webp"],
        supportedFrameworks: ["react", "vue", "svelte", "html", "tailwind"],
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: "Failed to get vision service status",
      });
    }
  });
  
  console.log("[Vision Processing] Routes registered at /api/vision/*");
}
