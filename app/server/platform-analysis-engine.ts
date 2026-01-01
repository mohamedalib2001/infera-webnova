import { DEFAULT_ANTHROPIC_MODEL, getAnthropicClientAsync } from "./ai-config";

export interface AnalysisResult {
  overallScore: number;
  performanceScore: number;
  securityScore: number;
  accessibilityScore: number;
  seoScore: number;
  codeQualityScore: number;
  suggestions: SuggestionData[];
  analysisReport: AnalysisReport;
}

export interface AnalysisReport {
  checksPerformed: CheckResult[];
  platformMetadata: PlatformMetadata;
  timestamp: string;
}

export interface CheckResult {
  name: string;
  nameAr: string;
  category: string;
  passed: boolean;
  details: string;
  detailsAr: string;
}

export interface PlatformMetadata {
  hasBackend: boolean;
  hasFrontend: boolean;
  hasDatabase: boolean;
  hasAuth: boolean;
  frameworks: string[];
  linesOfCode: number;
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

interface CodeInput {
  html?: string;
  css?: string;
  js?: string;
  backend?: string;
}

interface AnalysisRule {
  id: string;
  name: string;
  nameAr: string;
  category: 'security' | 'performance' | 'accessibility' | 'seo' | 'code_quality' | 'best_practice' | 'ux';
  priority: 'critical' | 'high' | 'medium' | 'low' | 'info';
  check: (code: CodeInput) => RuleCheckResult | null;
}

interface RuleCheckResult {
  passed: boolean;
  affectedFile: string;
  affectedCode?: string;
  lineNumber?: number;
  codeBeforeFix?: string;
  codeAfterFix?: string;
  canAutoApply: boolean;
  description: string;
  descriptionAr: string;
  suggestedFix: string;
  suggestedFixAr: string;
  expectedImpact: string;
  expectedImpactAr: string;
  estimatedEffort: string;
}

const analysisRules: AnalysisRule[] = [
  {
    id: 'console-log-removal',
    name: 'Remove Console Logs',
    nameAr: 'إزالة سجلات وحدة التحكم',
    category: 'code_quality',
    priority: 'medium',
    check: (code) => {
      const jsCode = code.js || '';
      const match = jsCode.match(/console\.(log|warn|error|debug)\s*\(/);
      if (match) {
        const lines = jsCode.substring(0, match.index || 0).split('\n');
        const lineNumber = lines.length;
        return {
          passed: false,
          affectedFile: 'js',
          affectedCode: match[0] + '...',
          lineNumber,
          canAutoApply: true,
          codeBeforeFix: match[0],
          codeAfterFix: '// Removed debug log',
          description: 'Console logs found in production code. These should be removed or replaced with proper logging.',
          descriptionAr: 'تم العثور على سجلات وحدة التحكم في كود الإنتاج. يجب إزالتها أو استبدالها بسجلات مناسبة.',
          suggestedFix: 'Remove all console.log statements or replace with a proper logging library.',
          suggestedFixAr: 'إزالة جميع عبارات console.log أو استبدالها بمكتبة تسجيل مناسبة.',
          expectedImpact: 'Cleaner production code, better performance',
          expectedImpactAr: 'كود إنتاج أنظف، أداء أفضل',
          estimatedEffort: '5 minutes'
        };
      }
      return null;
    }
  },
  {
    id: 'missing-alt-tags',
    name: 'Missing Image Alt Tags',
    nameAr: 'علامات Alt مفقودة للصور',
    category: 'accessibility',
    priority: 'high',
    check: (code) => {
      const html = code.html || '';
      const imgWithoutAlt = html.match(/<img(?![^>]*alt=)[^>]*>/i);
      if (imgWithoutAlt) {
        const lines = html.substring(0, html.indexOf(imgWithoutAlt[0])).split('\n');
        return {
          passed: false,
          affectedFile: 'html',
          affectedCode: imgWithoutAlt[0],
          lineNumber: lines.length,
          canAutoApply: false,
          description: 'Images without alt attributes reduce accessibility for screen readers.',
          descriptionAr: 'الصور بدون سمات alt تقلل من إمكانية الوصول لقارئات الشاشة.',
          suggestedFix: 'Add descriptive alt text to all img elements.',
          suggestedFixAr: 'إضافة نص alt وصفي لجميع عناصر الصور.',
          expectedImpact: 'Improved accessibility and SEO',
          expectedImpactAr: 'تحسين إمكانية الوصول وتحسين محركات البحث',
          estimatedEffort: '10 minutes'
        };
      }
      return null;
    }
  },
  {
    id: 'inline-styles',
    name: 'Inline Styles Detected',
    nameAr: 'تم اكتشاف أنماط مضمنة',
    category: 'code_quality',
    priority: 'low',
    check: (code) => {
      const html = code.html || '';
      const inlineStyle = html.match(/style\s*=\s*["'][^"']+["']/i);
      if (inlineStyle) {
        return {
          passed: false,
          affectedFile: 'html',
          affectedCode: inlineStyle[0],
          canAutoApply: false,
          description: 'Inline styles make code harder to maintain and reduce reusability.',
          descriptionAr: 'الأنماط المضمنة تجعل الكود أصعب في الصيانة وتقلل من إعادة الاستخدام.',
          suggestedFix: 'Move inline styles to CSS classes.',
          suggestedFixAr: 'نقل الأنماط المضمنة إلى فئات CSS.',
          expectedImpact: 'Better code organization and maintainability',
          expectedImpactAr: 'تنظيم أفضل للكود وسهولة الصيانة',
          estimatedEffort: '15 minutes'
        };
      }
      return null;
    }
  },
  {
    id: 'missing-meta-viewport',
    name: 'Missing Viewport Meta Tag',
    nameAr: 'علامة meta viewport مفقودة',
    category: 'seo',
    priority: 'high',
    check: (code) => {
      const html = code.html || '';
      if (!html.includes('viewport')) {
        return {
          passed: false,
          affectedFile: 'html',
          canAutoApply: true,
          codeBeforeFix: '<head>',
          codeAfterFix: '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
          description: 'Missing viewport meta tag affects mobile responsiveness.',
          descriptionAr: 'غياب علامة viewport يؤثر على استجابة الموقع للهواتف.',
          suggestedFix: 'Add viewport meta tag to the head section.',
          suggestedFixAr: 'إضافة علامة viewport إلى قسم head.',
          expectedImpact: 'Proper mobile display and better SEO',
          expectedImpactAr: 'عرض صحيح على الهاتف وتحسين SEO',
          estimatedEffort: '2 minutes'
        };
      }
      return null;
    }
  },
  {
    id: 'hardcoded-api-keys',
    name: 'Hardcoded API Keys Detected',
    nameAr: 'تم اكتشاف مفاتيح API مشفرة',
    category: 'security',
    priority: 'critical',
    check: (code) => {
      const allCode = (code.js || '') + (code.backend || '');
      const apiKeyPattern = /(api[_-]?key|apikey|secret[_-]?key|auth[_-]?token)\s*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/i;
      const match = allCode.match(apiKeyPattern);
      if (match) {
        return {
          passed: false,
          affectedFile: 'js',
          affectedCode: match[0].substring(0, 40) + '...',
          canAutoApply: false,
          description: 'Hardcoded API keys are a security vulnerability. Use environment variables.',
          descriptionAr: 'مفاتيح API المشفرة تمثل ثغرة أمنية. استخدم متغيرات البيئة.',
          suggestedFix: 'Move API keys to environment variables and use process.env.',
          suggestedFixAr: 'نقل مفاتيح API إلى متغيرات البيئة واستخدام process.env.',
          expectedImpact: 'Improved security, prevents credential leaks',
          expectedImpactAr: 'تحسين الأمان، منع تسريب البيانات',
          estimatedEffort: '20 minutes'
        };
      }
      return null;
    }
  },
  {
    id: 'missing-error-handling',
    name: 'Missing Error Handling',
    nameAr: 'معالجة الأخطاء مفقودة',
    category: 'best_practice',
    priority: 'medium',
    check: (code) => {
      const jsCode = code.js || '';
      const fetchWithoutCatch = jsCode.match(/fetch\s*\([^)]+\)(?![\s\S]*\.catch)/);
      if (fetchWithoutCatch) {
        return {
          passed: false,
          affectedFile: 'js',
          affectedCode: fetchWithoutCatch[0],
          canAutoApply: false,
          description: 'Fetch calls without error handling can cause unhandled promise rejections.',
          descriptionAr: 'استدعاءات fetch بدون معالجة الأخطاء يمكن أن تسبب رفض الوعود غير المعالجة.',
          suggestedFix: 'Add try-catch blocks or .catch() to handle errors.',
          suggestedFixAr: 'إضافة كتل try-catch أو .catch() للتعامل مع الأخطاء.',
          expectedImpact: 'Better error handling and user experience',
          expectedImpactAr: 'معالجة أفضل للأخطاء وتجربة مستخدم أفضل',
          estimatedEffort: '10 minutes'
        };
      }
      return null;
    }
  },
  {
    id: 'no-https-links',
    name: 'Insecure HTTP Links',
    nameAr: 'روابط HTTP غير آمنة',
    category: 'security',
    priority: 'high',
    check: (code) => {
      const allCode = (code.html || '') + (code.js || '');
      const httpLink = allCode.match(/http:\/\/(?!localhost|127\.0\.0\.1)/i);
      if (httpLink) {
        return {
          passed: false,
          affectedFile: 'html',
          affectedCode: httpLink[0],
          canAutoApply: true,
          codeBeforeFix: 'http://',
          codeAfterFix: 'https://',
          description: 'HTTP links are insecure and can be intercepted. Use HTTPS.',
          descriptionAr: 'روابط HTTP غير آمنة ويمكن اعتراضها. استخدم HTTPS.',
          suggestedFix: 'Replace all http:// links with https://.',
          suggestedFixAr: 'استبدال جميع روابط http:// بـ https://.',
          expectedImpact: 'Improved security and user trust',
          expectedImpactAr: 'تحسين الأمان وثقة المستخدم',
          estimatedEffort: '5 minutes'
        };
      }
      return null;
    }
  },
  {
    id: 'large-dom-size',
    name: 'Large DOM Size',
    nameAr: 'حجم DOM كبير',
    category: 'performance',
    priority: 'medium',
    check: (code) => {
      const html = code.html || '';
      const elementCount = (html.match(/<[a-zA-Z][^>]*>/g) || []).length;
      if (elementCount > 100) {
        return {
          passed: false,
          affectedFile: 'html',
          canAutoApply: false,
          description: `Large DOM with ${elementCount} elements may slow rendering. Consider lazy loading.`,
          descriptionAr: `DOM كبير يحتوي على ${elementCount} عنصر قد يبطئ العرض. فكر في التحميل الكسول.`,
          suggestedFix: 'Implement virtual scrolling or lazy loading for large lists.',
          suggestedFixAr: 'تنفيذ التمرير الافتراضي أو التحميل الكسول للقوائم الكبيرة.',
          expectedImpact: 'Faster page load and smoother interactions',
          expectedImpactAr: 'تحميل أسرع للصفحة وتفاعلات أكثر سلاسة',
          estimatedEffort: '30 minutes'
        };
      }
      return null;
    }
  },
  {
    id: 'unminified-css',
    name: 'Unminified CSS',
    nameAr: 'CSS غير مضغوط',
    category: 'performance',
    priority: 'low',
    check: (code) => {
      const css = code.css || '';
      if (css.length > 1000 && css.includes('  ') && css.split('\n').length > 50) {
        return {
          passed: false,
          affectedFile: 'css',
          canAutoApply: true,
          description: 'CSS is not minified. Minification can reduce file size by 30-50%.',
          descriptionAr: 'CSS غير مضغوط. الضغط يمكن أن يقلل حجم الملف بنسبة 30-50%.',
          suggestedFix: 'Use a CSS minifier in your build process.',
          suggestedFixAr: 'استخدم أداة ضغط CSS في عملية البناء.',
          expectedImpact: 'Faster page load, reduced bandwidth',
          expectedImpactAr: 'تحميل أسرع للصفحة، تقليل استهلاك النطاق الترددي',
          estimatedEffort: '10 minutes'
        };
      }
      return null;
    }
  },
  {
    id: 'missing-form-validation',
    name: 'Missing Form Validation',
    nameAr: 'التحقق من النموذج مفقود',
    category: 'ux',
    priority: 'medium',
    check: (code) => {
      const html = code.html || '';
      const formWithoutNovalidate = html.match(/<form[^>]*>[\s\S]*?<input[^>]*type=["']?(email|password|tel|number)[^>]*>[\s\S]*?<\/form>/i);
      if (formWithoutNovalidate && !formWithoutNovalidate[0].includes('required')) {
        return {
          passed: false,
          affectedFile: 'html',
          affectedCode: '<input type="..." (missing required)',
          canAutoApply: false,
          description: 'Form inputs lack validation attributes. Add required and pattern attributes.',
          descriptionAr: 'حقول النموذج تفتقر إلى سمات التحقق. أضف سمات required و pattern.',
          suggestedFix: 'Add HTML5 validation attributes like required, pattern, minlength.',
          suggestedFixAr: 'إضافة سمات التحقق HTML5 مثل required و pattern و minlength.',
          expectedImpact: 'Better user experience and data quality',
          expectedImpactAr: 'تجربة مستخدم أفضل وجودة بيانات أعلى',
          estimatedEffort: '15 minutes'
        };
      }
      return null;
    }
  }
];

function runStaticAnalysis(code: CodeInput): { suggestions: SuggestionData[], checks: CheckResult[] } {
  const suggestions: SuggestionData[] = [];
  const checks: CheckResult[] = [];
  
  for (const rule of analysisRules) {
    const result = rule.check(code);
    
    checks.push({
      name: rule.name,
      nameAr: rule.nameAr,
      category: rule.category,
      passed: result === null,
      details: result ? result.description : 'No issues found',
      detailsAr: result ? result.descriptionAr : 'لم يتم العثور على مشاكل'
    });
    
    if (result && !result.passed) {
      suggestions.push({
        type: rule.category,
        priority: rule.priority,
        title: rule.name,
        titleAr: rule.nameAr,
        description: result.description,
        descriptionAr: result.descriptionAr,
        affectedFile: result.affectedFile,
        affectedCode: result.affectedCode,
        lineNumber: result.lineNumber,
        suggestedFix: result.suggestedFix,
        suggestedFixAr: result.suggestedFixAr,
        codeBeforeFix: result.codeBeforeFix,
        codeAfterFix: result.codeAfterFix,
        canAutoApply: result.canAutoApply,
        expectedImpact: result.expectedImpact,
        expectedImpactAr: result.expectedImpactAr,
        estimatedEffort: result.estimatedEffort
      });
    }
  }
  
  return { suggestions, checks };
}

function calculateScores(code: CodeInput, suggestions: SuggestionData[]): {
  overallScore: number;
  performanceScore: number;
  securityScore: number;
  accessibilityScore: number;
  seoScore: number;
  codeQualityScore: number;
} {
  const baseScore = 100;
  const deductions: Record<string, number> = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3,
    info: 1
  };
  
  const categoryScores: Record<string, number> = {
    performance: baseScore,
    security: baseScore,
    accessibility: baseScore,
    seo: baseScore,
    code_quality: baseScore
  };
  
  for (const suggestion of suggestions) {
    const deduction = deductions[suggestion.priority] || 5;
    const category = suggestion.type === 'best_practice' || suggestion.type === 'ux' 
      ? 'code_quality' 
      : suggestion.type;
    
    if (categoryScores[category] !== undefined) {
      categoryScores[category] = Math.max(0, categoryScores[category] - deduction);
    }
  }
  
  const hasCode = (code.html?.length || 0) + (code.css?.length || 0) + (code.js?.length || 0) > 0;
  if (!hasCode) {
    return {
      overallScore: 50,
      performanceScore: 50,
      securityScore: 50,
      accessibilityScore: 50,
      seoScore: 50,
      codeQualityScore: 50
    };
  }
  
  const overall = Math.round(
    (categoryScores.performance + categoryScores.security + 
     categoryScores.accessibility + categoryScores.seo + 
     categoryScores.code_quality) / 5
  );
  
  return {
    overallScore: overall,
    performanceScore: categoryScores.performance,
    securityScore: categoryScores.security,
    accessibilityScore: categoryScores.accessibility,
    seoScore: categoryScores.seo,
    codeQualityScore: categoryScores.code_quality
  };
}

function getPlatformMetadata(code: CodeInput): PlatformMetadata {
  const linesOfCode = 
    (code.html?.split('\n').length || 0) +
    (code.css?.split('\n').length || 0) +
    (code.js?.split('\n').length || 0) +
    (code.backend?.split('\n').length || 0);
  
  const frameworks: string[] = [];
  const allCode = (code.js || '') + (code.backend || '');
  
  if (allCode.includes('React') || allCode.includes('useState') || allCode.includes('useEffect')) {
    frameworks.push('React');
  }
  if (allCode.includes('express')) {
    frameworks.push('Express');
  }
  if (allCode.includes('tailwind') || (code.css || '').includes('@tailwind')) {
    frameworks.push('Tailwind');
  }
  
  return {
    hasBackend: (code.backend?.length || 0) > 50,
    hasFrontend: (code.html?.length || 0) > 50 || (code.js?.length || 0) > 50,
    hasDatabase: allCode.includes('database') || allCode.includes('postgres') || allCode.includes('mysql'),
    hasAuth: allCode.includes('auth') || allCode.includes('login') || allCode.includes('session'),
    frameworks,
    linesOfCode
  };
}

function getBaselineRecommendations(metadata: PlatformMetadata): SuggestionData[] {
  const recommendations: SuggestionData[] = [];
  
  if (!metadata.hasBackend && metadata.hasFrontend) {
    recommendations.push({
      type: 'best_practice',
      priority: 'info',
      title: 'Consider Adding Backend',
      titleAr: 'فكر في إضافة خلفية',
      description: 'This platform has frontend code but no backend. Consider adding API endpoints for data persistence.',
      descriptionAr: 'هذه المنصة تحتوي على واجهة أمامية بدون خلفية. فكر في إضافة نقاط API لحفظ البيانات.',
      affectedFile: 'backend',
      suggestedFix: 'Create API routes for CRUD operations using Express.js.',
      suggestedFixAr: 'إنشاء مسارات API لعمليات CRUD باستخدام Express.js.',
      canAutoApply: false,
      expectedImpact: 'Enable data persistence and server-side logic',
      expectedImpactAr: 'تمكين حفظ البيانات ومنطق الخادم',
      estimatedEffort: '1-2 hours'
    });
  }
  
  if (!metadata.hasAuth && metadata.hasBackend) {
    recommendations.push({
      type: 'security',
      priority: 'high',
      title: 'Implement Authentication',
      titleAr: 'تنفيذ نظام المصادقة',
      description: 'Backend detected without authentication. Add user authentication for security.',
      descriptionAr: 'تم اكتشاف خلفية بدون مصادقة. أضف مصادقة المستخدم للأمان.',
      affectedFile: 'backend',
      suggestedFix: 'Implement JWT or session-based authentication.',
      suggestedFixAr: 'تنفيذ مصادقة JWT أو مصادقة قائمة على الجلسات.',
      canAutoApply: false,
      expectedImpact: 'Secure user data and protected routes',
      expectedImpactAr: 'تأمين بيانات المستخدم والمسارات المحمية',
      estimatedEffort: '2-4 hours'
    });
  }
  
  if (metadata.linesOfCode < 100) {
    recommendations.push({
      type: 'best_practice',
      priority: 'info',
      title: 'Platform Under Development',
      titleAr: 'المنصة قيد التطوير',
      description: 'This platform has minimal code. Continue development to get more specific suggestions.',
      descriptionAr: 'هذه المنصة تحتوي على كود محدود. استمر في التطوير للحصول على اقتراحات أكثر تحديداً.',
      affectedFile: 'general',
      suggestedFix: 'Add more features and functionality to get comprehensive analysis.',
      suggestedFixAr: 'أضف المزيد من الميزات للحصول على تحليل شامل.',
      canAutoApply: false,
      expectedImpact: 'More actionable suggestions after development',
      expectedImpactAr: 'اقتراحات أكثر قابلية للتنفيذ بعد التطوير',
      estimatedEffort: 'Ongoing'
    });
  }
  
  return recommendations;
}

export async function analyzePlatformComprehensively(
  code: CodeInput,
  analysisType: "full" | "quick" | "security" | "performance" = "full"
): Promise<AnalysisResult> {
  const { suggestions: staticSuggestions, checks } = runStaticAnalysis(code);
  const metadata = getPlatformMetadata(code);
  const baselineRecommendations = getBaselineRecommendations(metadata);
  
  let aiSuggestions: SuggestionData[] = [];
  
  if (analysisType === 'full' || analysisType === 'security' || analysisType === 'performance') {
    try {
      const anthropic = await getAnthropicClientAsync();
      if (anthropic) {
        const focusAreas: Record<string, string> = {
          full: "performance, security, accessibility, SEO, code quality, UX, and optimization",
          quick: "critical issues and high-priority improvements only",
          security: "security vulnerabilities, XSS, CSRF, injection attacks, and data exposure",
          performance: "performance bottlenecks, load time, memory usage, and optimization opportunities",
        };

        const prompt = `You are an expert code analyzer for the INFERA WebNova platform. Analyze the following code and provide 3-7 specific, actionable suggestions.

CRITICAL: You must ALWAYS provide suggestions. Never return empty suggestions.

Focus: ${focusAreas[analysisType]}

## Code Context:
- Lines of code: ${metadata.linesOfCode}
- Has backend: ${metadata.hasBackend}
- Has frontend: ${metadata.hasFrontend}
- Frameworks detected: ${metadata.frameworks.join(', ') || 'None'}

## Code to Analyze:
${code.html ? `### HTML (${code.html.length} chars):\n\`\`\`html\n${code.html.substring(0, 3000)}\n\`\`\`\n` : ""}
${code.css ? `### CSS (${code.css.length} chars):\n\`\`\`css\n${code.css.substring(0, 2000)}\n\`\`\`\n` : ""}
${code.js ? `### JavaScript (${code.js.length} chars):\n\`\`\`javascript\n${code.js.substring(0, 4000)}\n\`\`\`\n` : ""}
${code.backend ? `### Backend (${code.backend.length} chars):\n\`\`\`javascript\n${code.backend.substring(0, 4000)}\n\`\`\`\n` : ""}

Return a JSON array of suggestions. Each suggestion must have:
\`\`\`json
[
  {
    "type": "performance|security|accessibility|seo|best_practice|code_quality|ux|optimization",
    "priority": "critical|high|medium|low",
    "title": "Short title in English",
    "titleAr": "عنوان قصير بالعربية",
    "description": "Detailed explanation",
    "descriptionAr": "شرح تفصيلي بالعربية",
    "affectedFile": "html|css|js|backend",
    "suggestedFix": "How to fix",
    "suggestedFixAr": "كيفية الإصلاح بالعربية",
    "canAutoApply": false,
    "expectedImpact": "Expected benefit",
    "expectedImpactAr": "الفائدة المتوقعة",
    "estimatedEffort": "Time estimate"
  }
]
\`\`\``;

        const response = await anthropic.messages.create({
          model: DEFAULT_ANTHROPIC_MODEL,
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }],
        });

        const textContent = response.content.find(c => c.type === "text");
        if (textContent && textContent.type === "text") {
          try {
            const jsonMatch = textContent.text.match(/```json\n([\s\S]*?)\n```/) || 
                             textContent.text.match(/\[([\s\S]*)\]/);
            const jsonStr = jsonMatch ? (jsonMatch[1].startsWith('[') ? jsonMatch[1] : `[${jsonMatch[1]}]`) : textContent.text;
            const parsed = JSON.parse(jsonStr.trim());
            aiSuggestions = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.error("Failed to parse AI response:", e);
          }
        }
      }
    } catch (error) {
      console.error("AI analysis error:", error);
    }
  }

  const allSuggestions = [
    ...staticSuggestions,
    ...aiSuggestions.filter(ai => !staticSuggestions.some(s => s.title === ai.title)),
    ...baselineRecommendations.filter(b => 
      !staticSuggestions.some(s => s.title === b.title) && 
      !aiSuggestions.some(a => a.title === b.title)
    )
  ];

  if (allSuggestions.length === 0) {
    allSuggestions.push({
      type: 'best_practice',
      priority: 'info',
      title: 'Platform Analysis Complete',
      titleAr: 'اكتمل تحليل المنصة',
      description: 'Your platform passed all current analysis rules. Consider implementing additional features for a more comprehensive analysis.',
      descriptionAr: 'اجتازت منصتك جميع قواعد التحليل الحالية. فكر في تنفيذ ميزات إضافية للحصول على تحليل أكثر شمولاً.',
      affectedFile: 'general',
      suggestedFix: 'Add more functionality such as user authentication, database integration, or API endpoints to enable deeper analysis.',
      suggestedFixAr: 'أضف المزيد من الوظائف مثل مصادقة المستخدم أو تكامل قاعدة البيانات أو نقاط API لتمكين تحليل أعمق.',
      canAutoApply: false,
      expectedImpact: 'Enable comprehensive platform analysis with more actionable suggestions',
      expectedImpactAr: 'تمكين تحليل شامل للمنصة مع اقتراحات أكثر قابلية للتنفيذ',
      estimatedEffort: 'Varies based on features'
    });
  }

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  allSuggestions.sort((a, b) => 
    (priorityOrder[a.priority as keyof typeof priorityOrder] || 5) - 
    (priorityOrder[b.priority as keyof typeof priorityOrder] || 5)
  );

  const scores = calculateScores(code, allSuggestions);

  return {
    ...scores,
    suggestions: allSuggestions,
    analysisReport: {
      checksPerformed: checks,
      platformMetadata: metadata,
      timestamp: new Date().toISOString()
    }
  };
}
