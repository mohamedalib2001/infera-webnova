import * as fs from "fs";
import * as path from "path";

interface AnalysisTask {
  id: string;
  nameAr: string;
  nameEn: string;
  completed: boolean;
  evidence?: string;
  weight: number;
}

interface PageAnalysis {
  path: string;
  fileName: string;
  nameAr: string;
  nameEn: string;
  category: string;
  fileExists: boolean;
  lineCount: number;
  tasks: AnalysisTask[];
  completionPercentage: number;
  weightedScore: number;
  totalWeight: number;
  lastModified?: Date;
}

interface AnalysisCriteria {
  id: string;
  nameAr: string;
  nameEn: string;
  patterns: RegExp[];
  minMatches: number;
  weight: number;
}

const ANALYSIS_CRITERIA: AnalysisCriteria[] = [
  {
    id: "ui_components",
    nameAr: "مكونات واجهة المستخدم",
    nameEn: "UI Components",
    patterns: [
      /import\s*\{[^}]*\}\s*from\s*["']@\/components\/ui/,
      /<Card[\s>]/,
      /<Button[\s>]/,
      /<Badge[\s>]/,
      /<Dialog[\s>]/,
      /<ScrollArea[\s>]/,
    ],
    minMatches: 3,
    weight: 1
  },
  {
    id: "api_integration",
    nameAr: "تكامل API",
    nameEn: "API Integration",
    patterns: [
      /useQuery\s*\(/,
      /useMutation\s*\(/,
      /apiRequest\s*\(/,
      /queryKey:\s*\[["']\/api/,
    ],
    minMatches: 2,
    weight: 1.5
  },
  {
    id: "form_handling",
    nameAr: "معالجة النماذج",
    nameEn: "Form Handling",
    patterns: [
      /useForm\s*\(/,
      /<Form[\s>]/,
      /onSubmit\s*=/,
      /zodResolver\s*\(/,
      /<FormField[\s>]/,
    ],
    minMatches: 2,
    weight: 1
  },
  {
    id: "error_handling",
    nameAr: "معالجة الأخطاء",
    nameEn: "Error Handling",
    patterns: [
      /try\s*\{[\s\S]*?catch\s*\(/,
      /\.catch\s*\(/,
      /onError\s*:/,
      /isError\s*[&|?:]/,
      /error\s*&&\s*</,
    ],
    minMatches: 2,
    weight: 1
  },
  {
    id: "loading_states",
    nameAr: "حالات التحميل",
    nameEn: "Loading States",
    patterns: [
      /isLoading\s*[&|?:]/,
      /isPending\s*[&|?:]/,
      /<Skeleton[\s>]/,
      /import.*Skeleton.*from/,
    ],
    minMatches: 2,
    weight: 1
  },
  {
    id: "responsive_design",
    nameAr: "التصميم المتجاوب",
    nameEn: "Responsive Design",
    patterns: [
      /\bmd:/,
      /\blg:/,
      /\bsm:/,
      /\bxl:/,
      /grid-cols-\d+\s+md:grid-cols/,
    ],
    minMatches: 3,
    weight: 0.8
  },
  {
    id: "accessibility",
    nameAr: "إمكانية الوصول",
    nameEn: "Accessibility",
    patterns: [
      /aria-label=/,
      /aria-describedby=/,
      /role=["']/,
      /data-testid=/,
    ],
    minMatches: 2,
    weight: 0.8
  },
  {
    id: "state_management",
    nameAr: "إدارة الحالة",
    nameEn: "State Management",
    patterns: [
      /useState\s*</,
      /useEffect\s*\(/,
      /useMemo\s*\(/,
      /useCallback\s*\(/,
    ],
    minMatches: 2,
    weight: 1
  },
  {
    id: "navigation",
    nameAr: "التنقل",
    nameEn: "Navigation",
    patterns: [
      /useLocation\s*\(/,
      /<Link\s+/,
      /from\s*["']wouter["']/,
    ],
    minMatches: 1,
    weight: 0.8
  },
  {
    id: "authentication",
    nameAr: "المصادقة",
    nameEn: "Authentication",
    patterns: [
      /useAuth\s*\(/,
      /user\s*\?\./,
      /isAuthenticated/,
    ],
    minMatches: 1,
    weight: 1
  },
  {
    id: "internationalization",
    nameAr: "تعدد اللغات",
    nameEn: "Internationalization",
    patterns: [
      /useLanguage\s*\(/,
      /isArabic\s*[?&|:]/,
      /language\s*===?\s*["']ar["']/,
      /dir=\{isArabic/,
    ],
    minMatches: 2,
    weight: 0.7
  },
  {
    id: "toast_notifications",
    nameAr: "الإشعارات",
    nameEn: "Toast Notifications",
    patterns: [
      /useToast\s*\(/,
      /toast\s*\(\s*\{/,
      /toast\.\w+\s*\(/,
    ],
    minMatches: 1,
    weight: 0.5
  }
];

const PAGE_DEFINITIONS: { route: string; nameAr: string; nameEn: string; category: string; fileName: string }[] = [
  { route: "/", nameAr: "الرئيسية", nameEn: "Home", category: "core", fileName: "home.tsx" },
  { route: "/console", nameAr: "وحدة التحكم", nameEn: "Console", category: "core", fileName: "console.tsx" },
  { route: "/ide", nameAr: "بيئة التطوير", nameEn: "Cloud IDE", category: "development", fileName: "cloud-ide.tsx" },
  { route: "/ai-app-builder", nameAr: "منشئ التطبيقات بالذكاء", nameEn: "AI App Builder", category: "ai", fileName: "ai-app-builder.tsx" },
  { route: "/projects", nameAr: "المشاريع", nameEn: "Projects", category: "core", fileName: "projects.tsx" },
  { route: "/owner", nameAr: "لوحة المالك", nameEn: "Owner Dashboard", category: "owner", fileName: "owner-dashboard.tsx" },
  { route: "/owner-control-center", nameAr: "مركز التحكم", nameEn: "Control Center", category: "owner", fileName: "owner-control-center.tsx" },
  { route: "/sovereign-workspace", nameAr: "مساحة العمل السيادية", nameEn: "Sovereign Workspace", category: "owner", fileName: "sovereign-workspace.tsx" },
  { route: "/military-security", nameAr: "الأمان العسكري", nameEn: "Military Security", category: "security", fileName: "military-security.tsx" },
  { route: "/sovereign-permissions", nameAr: "الصلاحيات السيادية", nameEn: "Sovereign Permissions", category: "security", fileName: "sovereign-permissions.tsx" },
  { route: "/nova-ai-dashboard", nameAr: "لوحة Nova AI", nameEn: "Nova AI Dashboard", category: "ai", fileName: "nova-ai-dashboard.tsx" },
  { route: "/nova-sovereign-dashboard", nameAr: "لوحة Nova السيادية", nameEn: "Nova Sovereign Dashboard", category: "ai", fileName: "nova-sovereign-dashboard.tsx" },
  { route: "/infera-agent", nameAr: "وكيل إنفرا", nameEn: "INFERA Agent", category: "ai", fileName: "infera-agent.tsx" },
  { route: "/testing-generator", nameAr: "مولد الاختبارات", nameEn: "Testing Generator", category: "development", fileName: "testing-generator.tsx" },
  { route: "/backend-generator", nameAr: "مولد الباك إند", nameEn: "Backend Generator", category: "development", fileName: "backend-generator.tsx" },
  { route: "/cicd-pipeline", nameAr: "خط أنابيب CI/CD", nameEn: "CI/CD Pipeline", category: "development", fileName: "cicd-pipeline.tsx" },
  { route: "/git-control", nameAr: "تحكم Git", nameEn: "Git Control", category: "development", fileName: "git-control.tsx" },
  { route: "/collaboration", nameAr: "التعاون", nameEn: "Collaboration", category: "development", fileName: "collaboration.tsx" },
  { route: "/templates", nameAr: "القوالب", nameEn: "Templates", category: "development", fileName: "templates.tsx" },
  { route: "/marketplace", nameAr: "السوق", nameEn: "Marketplace", category: "development", fileName: "marketplace.tsx" },
  { route: "/maps", nameAr: "الخرائط", nameEn: "Maps", category: "development", fileName: "maps.tsx" },
  { route: "/shieldgrid-landing", nameAr: "ShieldGrid", nameEn: "ShieldGrid", category: "platforms", fileName: "shieldgrid-landing.tsx" },
  { route: "/globalcloud-landing", nameAr: "GlobalCloud", nameEn: "GlobalCloud", category: "platforms", fileName: "globalcloud-landing.tsx" },
  { route: "/humaniq-landing", nameAr: "HumanIQ", nameEn: "HumanIQ", category: "platforms", fileName: "humaniq-landing.tsx" },
  { route: "/finance-landing", nameAr: "Finance AI", nameEn: "Finance AI", category: "platforms", fileName: "finance-landing.tsx" },
  { route: "/legal-landing", nameAr: "Legal AI", nameEn: "Legal AI", category: "platforms", fileName: "legal-landing.tsx" },
  { route: "/marketing-landing", nameAr: "Marketing AI", nameEn: "Marketing AI", category: "platforms", fileName: "marketing-landing.tsx" },
  { route: "/education-landing", nameAr: "Education Hub", nameEn: "Education Hub", category: "platforms", fileName: "education-landing.tsx" },
  { route: "/hospitality-landing", nameAr: "Hospitality AI", nameEn: "Hospitality AI", category: "platforms", fileName: "hospitality-landing.tsx" },
  { route: "/trainai-landing", nameAr: "TrainAI", nameEn: "TrainAI", category: "platforms", fileName: "trainai-landing.tsx" },
  { route: "/cvbuilder-landing", nameAr: "CV Builder", nameEn: "CV Builder", category: "platforms", fileName: "cvbuilder-landing.tsx" },
  { route: "/jobs-landing", nameAr: "Jobs AI", nameEn: "Jobs AI", category: "platforms", fileName: "jobs-landing.tsx" },
  { route: "/feasibility-landing", nameAr: "Feasibility", nameEn: "Feasibility", category: "platforms", fileName: "feasibility-landing.tsx" },
  { route: "/appforge-landing", nameAr: "AppForge", nameEn: "AppForge", category: "platforms", fileName: "appforge-landing.tsx" },
  { route: "/pricing", nameAr: "الأسعار", nameEn: "Pricing", category: "business", fileName: "pricing.tsx" },
  { route: "/analytics", nameAr: "التحليلات", nameEn: "Analytics", category: "business", fileName: "analytics.tsx" },
  { route: "/settings", nameAr: "الإعدادات", nameEn: "Settings", category: "core", fileName: "settings.tsx" },
  { route: "/page-performance-monitor", nameAr: "مراقب الأداء", nameEn: "Performance Monitor", category: "development", fileName: "page-performance-monitor.tsx" },
  { route: "/pages-completion", nameAr: "تتبع الإكتمال", nameEn: "Completion Tracker", category: "development", fileName: "pages-completion-tracker.tsx" },
];

let analysisCache: { data: PageAnalysis[]; timestamp: number } | null = null;
const CACHE_TTL = 30000;

function analyzeFileAsync(filePath: string): Promise<{ content: string; lineCount: number; exists: boolean; lastModified?: Date }> {
  return new Promise((resolve) => {
    fs.stat(filePath, (statErr, stats) => {
      if (statErr) {
        resolve({ content: "", lineCount: 0, exists: false });
        return;
      }
      fs.readFile(filePath, "utf-8", (readErr, content) => {
        if (readErr) {
          resolve({ content: "", lineCount: 0, exists: false });
          return;
        }
        const lineCount = content.split("\n").length;
        resolve({ content, lineCount, exists: true, lastModified: stats.mtime });
      });
    });
  });
}

function checkCriteria(content: string, criteria: AnalysisCriteria): { completed: boolean; matchCount: number; evidence: string } {
  let matchCount = 0;
  let evidence = "";
  
  for (const pattern of criteria.patterns) {
    const matches = content.match(new RegExp(pattern, "g"));
    if (matches) {
      matchCount += matches.length;
      if (!evidence && matches.length > 0) {
        const match = matches[0];
        evidence = match.length > 40 ? match.substring(0, 40) + "..." : match;
      }
    }
  }
  
  const completed = matchCount >= criteria.minMatches;
  return { completed, matchCount, evidence };
}

export async function analyzeAllPagesAsync(): Promise<PageAnalysis[]> {
  if (analysisCache && Date.now() - analysisCache.timestamp < CACHE_TTL) {
    return analysisCache.data;
  }

  const pagesDir = path.join(process.cwd(), "client", "src", "pages");
  const results: PageAnalysis[] = [];
  
  const analyses = await Promise.all(
    PAGE_DEFINITIONS.map(async (pageDef) => {
      const filePath = path.join(pagesDir, pageDef.fileName);
      const { content, lineCount, exists, lastModified } = await analyzeFileAsync(filePath);
      
      const tasks: AnalysisTask[] = [];
      let totalWeight = 0;
      let completedWeight = 0;
      
      for (const criteria of ANALYSIS_CRITERIA) {
        const { completed, matchCount, evidence } = checkCriteria(content, criteria);
        
        tasks.push({
          id: criteria.id,
          nameAr: criteria.nameAr,
          nameEn: criteria.nameEn,
          completed,
          evidence: completed ? `${matchCount} matches` : undefined,
          weight: criteria.weight
        });
        
        totalWeight += criteria.weight;
        if (completed) {
          completedWeight += criteria.weight;
        }
      }
      
      const completionPercentage = exists 
        ? Math.round((completedWeight / totalWeight) * 100)
        : 0;
      
      return {
        path: pageDef.route,
        fileName: pageDef.fileName,
        nameAr: pageDef.nameAr,
        nameEn: pageDef.nameEn,
        category: pageDef.category,
        fileExists: exists,
        lineCount,
        tasks,
        completionPercentage,
        weightedScore: completedWeight,
        totalWeight,
        lastModified
      };
    })
  );
  
  results.push(...analyses);
  
  analysisCache = { data: results, timestamp: Date.now() };
  return results;
}

export function analyzeAllPages(): PageAnalysis[] {
  if (analysisCache && Date.now() - analysisCache.timestamp < CACHE_TTL) {
    return analysisCache.data;
  }

  const pagesDir = path.join(process.cwd(), "client", "src", "pages");
  const results: PageAnalysis[] = [];
  
  for (const pageDef of PAGE_DEFINITIONS) {
    const filePath = path.join(pagesDir, pageDef.fileName);
    let content = "";
    let lineCount = 0;
    let exists = false;
    let lastModified: Date | undefined;
    
    try {
      const stats = fs.statSync(filePath);
      content = fs.readFileSync(filePath, "utf-8");
      lineCount = content.split("\n").length;
      exists = true;
      lastModified = stats.mtime;
    } catch {
      exists = false;
    }
    
    const tasks: AnalysisTask[] = [];
    let totalWeight = 0;
    let completedWeight = 0;
    
    for (const criteria of ANALYSIS_CRITERIA) {
      const { completed, matchCount, evidence } = checkCriteria(content, criteria);
      
      tasks.push({
        id: criteria.id,
        nameAr: criteria.nameAr,
        nameEn: criteria.nameEn,
        completed,
        evidence: completed ? `${matchCount} matches` : undefined,
        weight: criteria.weight
      });
      
      totalWeight += criteria.weight;
      if (completed) {
        completedWeight += criteria.weight;
      }
    }
    
    const completionPercentage = exists 
      ? Math.round((completedWeight / totalWeight) * 100)
      : 0;
    
    results.push({
      path: pageDef.route,
      fileName: pageDef.fileName,
      nameAr: pageDef.nameAr,
      nameEn: pageDef.nameEn,
      category: pageDef.category,
      fileExists: exists,
      lineCount,
      tasks,
      completionPercentage,
      weightedScore: completedWeight,
      totalWeight,
      lastModified
    });
  }
  
  analysisCache = { data: results, timestamp: Date.now() };
  return results;
}

export function getPageAnalysis(route: string): PageAnalysis | null {
  const results = analyzeAllPages();
  return results.find(p => p.path === route) || null;
}

export function getAnalysisSummary(): {
  totalPages: number;
  existingPages: number;
  averageCompletion: number;
  totalWeightedScore: number;
  maxPossibleScore: number;
  weightedCompletion: number;
  totalTasks: number;
  completedTasks: number;
  categoryStats: Record<string, { pages: number; avgCompletion: number; weightedAvg: number }>;
} {
  const results = analyzeAllPages();
  const existingPages = results.filter(p => p.fileExists);
  
  const totalTasks = results.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = results.reduce(
    (sum, p) => sum + p.tasks.filter(t => t.completed).length, 
    0
  );
  
  const totalWeightedScore = results.reduce((sum, p) => sum + p.weightedScore, 0);
  const maxPossibleScore = results.reduce((sum, p) => sum + p.totalWeight, 0);
  const weightedCompletion = maxPossibleScore > 0 
    ? Math.round((totalWeightedScore / maxPossibleScore) * 100)
    : 0;
  
  const categoryStats: Record<string, { pages: number; totalCompletion: number; totalWeighted: number; maxWeighted: number; avgCompletion: number; weightedAvg: number }> = {};
  
  for (const page of results) {
    if (!categoryStats[page.category]) {
      categoryStats[page.category] = { pages: 0, totalCompletion: 0, totalWeighted: 0, maxWeighted: 0, avgCompletion: 0, weightedAvg: 0 };
    }
    categoryStats[page.category].pages++;
    categoryStats[page.category].totalCompletion += page.completionPercentage;
    categoryStats[page.category].totalWeighted += page.weightedScore;
    categoryStats[page.category].maxWeighted += page.totalWeight;
  }
  
  for (const cat of Object.keys(categoryStats)) {
    categoryStats[cat].avgCompletion = Math.round(
      categoryStats[cat].totalCompletion / categoryStats[cat].pages
    );
    categoryStats[cat].weightedAvg = categoryStats[cat].maxWeighted > 0
      ? Math.round((categoryStats[cat].totalWeighted / categoryStats[cat].maxWeighted) * 100)
      : 0;
  }
  
  return {
    totalPages: results.length,
    existingPages: existingPages.length,
    averageCompletion: existingPages.length > 0
      ? Math.round(existingPages.reduce((sum, p) => sum + p.completionPercentage, 0) / existingPages.length)
      : 0,
    totalWeightedScore,
    maxPossibleScore,
    weightedCompletion,
    totalTasks,
    completedTasks,
    categoryStats
  };
}

export function clearAnalysisCache(): void {
  analysisCache = null;
}
