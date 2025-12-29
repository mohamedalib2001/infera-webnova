import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface PreviewState {
  id: string;
  html: string;
  css: string;
  javascript: string;
  data: any;
  timestamp: number;
}

export interface ImprovementSuggestion {
  type: "performance" | "security" | "ux" | "accessibility" | "code-quality";
  priority: "high" | "medium" | "low";
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  code?: string;
  autoFix?: boolean;
}

export interface PreviewAnalysis {
  suggestions: ImprovementSuggestion[];
  metrics: {
    complexity: number;
    accessibility: number;
    performance: number;
    security: number;
  };
  warnings: string[];
}

class InstantPreviewEngine {
  private previews = new Map<string, PreviewState>();

  generatePreviewId(): string {
    return `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeHtml(html: string): string {
    const dangerousTags = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const dangerousAttrs = /\s(on\w+|javascript:|data-)|src\s*=\s*["']javascript:/gi;
    const iframeTags = /<iframe\b[^>]*>.*?<\/iframe>/gi;
    const objectTags = /<object\b[^>]*>.*?<\/object>/gi;
    const embedTags = /<embed\b[^>]*>/gi;
    
    let sanitized = html
      .replace(dangerousTags, "<!-- script removed -->")
      .replace(iframeTags, "<!-- iframe removed -->")
      .replace(objectTags, "<!-- object removed -->")
      .replace(embedTags, "<!-- embed removed -->")
      .replace(dangerousAttrs, " ");
    
    return sanitized;
  }

  private sanitizeCss(css: string): string {
    const dangerousPatterns = [
      /expression\s*\(/gi,
      /javascript:/gi,
      /behavior\s*:/gi,
      /-moz-binding/gi,
      /url\s*\(\s*["']?\s*javascript:/gi
    ];
    
    let sanitized = css;
    for (const pattern of dangerousPatterns) {
      sanitized = sanitized.replace(pattern, "/* removed */");
    }
    return sanitized;
  }

  async generateLivePreview(
    architecture: any,
    component?: string
  ): Promise<PreviewState> {
    const previewId = this.generatePreviewId();
    
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `أنت مطور واجهات خبير. قم بإنشاء معاينة HTML/CSS/JS تفاعلية بناءً على المواصفات التالية:

${component ? `المكون المطلوب: ${component}` : ""}

المواصفات:
${JSON.stringify(architecture, null, 2)}

أعد النتيجة بصيغة JSON فقط:
{
  "html": "كود HTML كامل مع التنسيقات",
  "css": "أنماط CSS",
  "javascript": "كود JavaScript للتفاعلية",
  "data": { "sampleData": "بيانات تجريبية للعرض" }
}

ملاحظات:
- استخدم Tailwind CSS للتنسيق
- أضف RTL support للعربية
- اجعل التصميم متجاوب
- استخدم ألوان احترافية`
        }]
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Invalid response");
      
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      
      const preview = JSON.parse(jsonMatch[0]);
      
      const state: PreviewState = {
        id: previewId,
        html: this.sanitizeHtml(preview.html || "<div>Preview</div>"),
        css: this.sanitizeCss(preview.css || ""),
        javascript: "",
        data: preview.data || {},
        timestamp: Date.now()
      };
      
      this.previews.set(previewId, state);
      return state;
    } catch (error) {
      const defaultState: PreviewState = {
        id: previewId,
        html: this.generateDefaultPreview(architecture),
        css: this.generateDefaultCSS(),
        javascript: "",
        data: {},
        timestamp: Date.now()
      };
      this.previews.set(previewId, defaultState);
      return defaultState;
    }
  }

  async analyzeAndSuggest(code: string, type: "html" | "css" | "javascript" | "full"): Promise<PreviewAnalysis> {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{
          role: "user",
          content: `أنت خبير جودة كود. حلل الكود التالي وقدم مقترحات تحسين:

نوع الكود: ${type}

الكود:
${code}

أعد النتيجة بصيغة JSON:
{
  "suggestions": [
    {
      "type": "performance|security|ux|accessibility|code-quality",
      "priority": "high|medium|low",
      "title": "عنوان الاقتراح بالإنجليزية",
      "titleAr": "عنوان الاقتراح بالعربية",
      "description": "وصف التحسين بالإنجليزية",
      "descriptionAr": "وصف التحسين بالعربية",
      "code": "كود الإصلاح إن وجد",
      "autoFix": true/false
    }
  ],
  "metrics": {
    "complexity": 0-100,
    "accessibility": 0-100,
    "performance": 0-100,
    "security": 0-100
  },
  "warnings": ["تحذيرات مهمة"]
}`
        }]
      });

      const content = response.content[0];
      if (content.type !== "text") throw new Error("Invalid response");
      
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      return {
        suggestions: [],
        metrics: { complexity: 50, accessibility: 50, performance: 50, security: 50 },
        warnings: [(error as Error).message]
      };
    }
  }

  async generateComponentPreview(componentType: string, props: any): Promise<string> {
    const templates: Record<string, (props: any) => string> = {
      card: (p) => `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${p.className || ""}">
          ${p.title ? `<h3 class="text-lg font-semibold mb-2">${p.title}</h3>` : ""}
          ${p.description ? `<p class="text-gray-600 dark:text-gray-300">${p.description}</p>` : ""}
          ${p.actions ? `<div class="mt-4 flex gap-2">${p.actions}</div>` : ""}
        </div>
      `,
      button: (p) => `
        <button class="px-4 py-2 rounded-md ${p.variant === "primary" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"} ${p.className || ""}">
          ${p.label || "Button"}
        </button>
      `,
      form: (p) => `
        <form class="space-y-4 ${p.className || ""}">
          ${(p.fields || []).map((f: any) => `
            <div>
              <label class="block text-sm font-medium mb-1">${f.label}</label>
              <input type="${f.type || "text"}" placeholder="${f.placeholder || ""}" 
                class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          `).join("")}
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md">
            ${p.submitLabel || "Submit"}
          </button>
        </form>
      `,
      table: (p) => `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                ${(p.columns || []).map((c: any) => `<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">${c}</th>`).join("")}
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${(p.rows || []).map((row: any) => `
                <tr>
                  ${row.map((cell: any) => `<td class="px-6 py-4 whitespace-nowrap text-sm">${cell}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `,
      dashboard: (p) => `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          ${(p.stats || []).map((s: any) => `
            <div class="bg-white rounded-lg shadow p-6">
              <p class="text-sm text-gray-500">${s.label}</p>
              <p class="text-2xl font-bold">${s.value}</p>
              ${s.change ? `<p class="text-sm ${s.change > 0 ? "text-green-500" : "text-red-500"}">${s.change > 0 ? "+" : ""}${s.change}%</p>` : ""}
            </div>
          `).join("")}
        </div>
      `
    };

    const template = templates[componentType];
    return template ? template(props) : `<div>Unknown component: ${componentType}</div>`;
  }

  getPreview(id: string): PreviewState | undefined {
    return this.previews.get(id);
  }

  updatePreview(id: string, updates: Partial<PreviewState>): PreviewState | null {
    const existing = this.previews.get(id);
    if (!existing) return null;
    
    const updated = { ...existing, ...updates, timestamp: Date.now() };
    this.previews.set(id, updated);
    return updated;
  }

  private generateDefaultPreview(architecture: any): string {
    const projectName = architecture?.overview?.projectName || "New Project";
    const projectNameAr = architecture?.overview?.projectNameAr || "مشروع جديد";
    const entities = architecture?.dataModel?.entities || [];
    
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
  <nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <h1 class="text-xl font-bold text-blue-600">${projectNameAr}</h1>
      <div class="flex gap-4">
        <button class="text-gray-600 hover:text-gray-900">لوحة التحكم</button>
        <button class="text-gray-600 hover:text-gray-900">الإعدادات</button>
      </div>
    </div>
  </nav>
  
  <main class="max-w-7xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      ${entities.slice(0, 3).map((e: any, i: number) => `
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-bold">${(e.nameAr || e.name || "K")[0]}</span>
            </div>
            <div>
              <h3 class="font-semibold">${e.nameAr || e.name}</h3>
              <p class="text-sm text-gray-500">${e.fields?.length || 0} حقول</p>
            </div>
          </div>
          <button class="w-full bg-blue-50 text-blue-600 py-2 rounded-md hover:bg-blue-100">
            إدارة
          </button>
        </div>
      `).join("")}
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">البيانات الأخيرة</h2>
      <div class="text-center text-gray-500 py-8">
        لا توجد بيانات بعد
      </div>
    </div>
  </main>
</body>
</html>`;
  }

  private generateDefaultCSS(): string {
    return `
      * { box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, sans-serif; }
    `;
  }
}

export const instantPreviewEngine = new InstantPreviewEngine();
