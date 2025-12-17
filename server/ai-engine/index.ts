import { createWebsitePlan, WebsitePlan } from "./planner";
import { buildWebsite, GeneratedCode } from "./builder";
import { validateGeneratedCode, ValidationResult, getQualityReport } from "./validator";
import { findBestTemplate } from "../premium-templates";

export interface GenerationResult {
  html: string;
  css: string;
  js: string;
  message: string;
  plan?: WebsitePlan;
  validation?: ValidationResult;
  attempts: number;
}

export interface GenerationProgress {
  stage: "planning" | "building" | "validating" | "complete" | "error";
  progress: number;
  message: string;
}

const MAX_ATTEMPTS = 2;

export async function generateWebsite(
  userRequest: string,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GenerationResult> {
  
  const report = (stage: GenerationProgress["stage"], progress: number, message: string) => {
    if (onProgress) {
      onProgress({ stage, progress, message });
    }
    console.log(`[${stage}] ${progress}% - ${message}`);
  };

  let attempts = 0;
  let lastResult: GeneratedCode | null = null;
  let lastValidation: ValidationResult | null = null;
  let plan: WebsitePlan | null = null;

  try {
    // === STAGE 1: PLANNING ===
    report("planning", 10, "تحليل طلبك وإنشاء خطة التصميم...");
    
    plan = await createWebsitePlan(userRequest);
    
    report("planning", 30, `تم إنشاء الخطة: ${plan.sections.length} أقسام، نوع ${plan.type}`);

    // === STAGE 2: BUILDING (with retry) ===
    while (attempts < MAX_ATTEMPTS) {
      attempts++;
      
      report("building", 40 + (attempts - 1) * 20, `جاري البناء (محاولة ${attempts}/${MAX_ATTEMPTS})...`);
      
      lastResult = await buildWebsite(plan, userRequest);
      
      // === STAGE 3: VALIDATION ===
      report("validating", 70 + (attempts - 1) * 10, "فحص جودة الكود...");
      
      lastValidation = validateGeneratedCode(lastResult);
      
      console.log(getQualityReport(lastValidation));
      
      if (lastValidation.isValid) {
        report("complete", 100, `تم بنجاح! جودة: ${lastValidation.score}/100`);
        
        return {
          html: lastResult.html,
          css: lastResult.css,
          js: lastResult.js,
          message: `تم إنشاء موقع احترافي بجودة ${lastValidation.score}% (${plan.sections.length} أقسام)`,
          plan,
          validation: lastValidation,
          attempts
        };
      }
      
      // If validation failed but we have more attempts, adjust the plan
      if (attempts < MAX_ATTEMPTS) {
        report("planning", 50, "تحسين الخطة بناءً على نتائج الفحص...");
        
        // Add more specific requirements based on issues
        const issueCategories = lastValidation.issues.map(i => i.category);
        if (issueCategories.includes("icons")) {
          plan.features.push("svg-icons-only");
        }
        if (issueCategories.includes("responsive")) {
          plan.features.push("mobile-first");
        }
      }
    }

    // If we exhausted attempts but have a result, use the template fallback
    if (lastResult && lastResult.html.length > 500) {
      report("complete", 95, "استخدام أفضل نتيجة متاحة...");
      
      return {
        html: lastResult.html,
        css: lastResult.css,
        js: lastResult.js,
        message: `تم إنشاء الموقع (جودة: ${lastValidation?.score || 70}/100)`,
        plan: plan || undefined,
        validation: lastValidation || undefined,
        attempts
      };
    }

    // Ultimate fallback: use premium template directly
    report("building", 90, "استخدام قالب احترافي...");
    
    const template = findBestTemplate(userRequest);
    
    return {
      html: template.html,
      css: template.css,
      js: template.js,
      message: "تم إنشاء موقع احترافي باستخدام قالب متميز",
      plan: plan || undefined,
      attempts
    };

  } catch (error) {
    console.error("Generation pipeline error:", error);
    
    report("error", 0, "حدث خطأ، استخدام القالب الاحتياطي...");
    
    // Fallback to template
    const template = findBestTemplate(userRequest);
    
    return {
      html: template.html,
      css: template.css,
      js: template.js,
      message: "تم إنشاء موقع احترافي",
      attempts: 1
    };
  }
}

export async function refineWebsite(
  userRequest: string,
  currentCode: GeneratedCode,
  onProgress?: (progress: GenerationProgress) => void
): Promise<GenerationResult> {
  
  const report = (stage: GenerationProgress["stage"], progress: number, message: string) => {
    if (onProgress) {
      onProgress({ stage, progress, message });
    }
  };

  try {
    report("building", 30, "تحليل التعديلات المطلوبة...");
    
    // For refinements, we use the existing code as the template
    const mockPlan: WebsitePlan = {
      type: "landing",
      language: /[\u0600-\u06FF]/.test(currentCode.html) ? "ar" : "en",
      sections: [],
      colorScheme: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#06b6d4",
        background: "#ffffff",
        text: "#1e293b",
        gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
      },
      typography: {
        headingFont: "Tajawal",
        bodyFont: "Tajawal",
        arabicFont: "Tajawal"
      },
      features: [],
      targetAudience: "",
      tone: "professional"
    };

    report("building", 60, "تطبيق التعديلات...");
    
    const result = await buildWebsite(mockPlan, `
      EXISTING CODE TO MODIFY:
      HTML (first 3000 chars): ${currentCode.html.substring(0, 3000)}
      
      MODIFICATION REQUEST: ${userRequest}
      
      Apply the requested changes while preserving the existing design quality.
    `);

    report("validating", 85, "فحص النتيجة...");
    
    const validation = validateGeneratedCode(result);
    
    if (validation.isValid) {
      report("complete", 100, "تم تطبيق التعديلات بنجاح!");
      
      return {
        html: result.html,
        css: result.css,
        js: result.js,
        message: `تم تحديث الموقع بنجاح (جودة: ${validation.score}/100)`,
        validation,
        attempts: 1
      };
    }

    // If validation failed, return the current code
    return {
      html: currentCode.html,
      css: currentCode.css,
      js: currentCode.js,
      message: "تعذر تطبيق التعديلات، الكود الحالي محفوظ",
      attempts: 1
    };

  } catch (error) {
    console.error("Refinement error:", error);
    
    return {
      html: currentCode.html,
      css: currentCode.css,
      js: currentCode.js,
      message: "حدث خطأ، الكود الحالي محفوظ",
      attempts: 1
    };
  }
}

// Re-export types
export { WebsitePlan, GeneratedCode, ValidationResult };
