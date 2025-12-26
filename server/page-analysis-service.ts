import * as fs from "fs";
import * as path from "path";

interface AnalysisTask {
  id: string;
  nameAr: string;
  nameEn: string;
  completed: boolean;
  evidence?: string;
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
  lastModified?: Date;
}

interface AnalysisCriteria {
  id: string;
  nameAr: string;
  nameEn: string;
  patterns: RegExp[];
  weight: number;
}

const ANALYSIS_CRITERIA: AnalysisCriteria[] = [
  {
    id: "ui_components",
    nameAr: "مكونات واجهة المستخدم",
    nameEn: "UI Components",
    patterns: [
      /import.*from.*@\/components\/ui/,
      /<Card/,
      /<Button/,
      /<Badge/,
      /className=/
    ],
    weight: 1
  },
  {
    id: "api_integration",
    nameAr: "تكامل API",
    nameEn: "API Integration",
    patterns: [
      /useQuery/,
      /useMutation/,
      /fetch\(/,
      /apiRequest/,
      /\/api\//
    ],
    weight: 1.5
  },
  {
    id: "form_handling",
    nameAr: "معالجة النماذج",
    nameEn: "Form Handling",
    patterns: [
      /useForm/,
      /<Form/,
      /<Input/,
      /onSubmit/,
      /zodResolver/
    ],
    weight: 1
  },
  {
    id: "error_handling",
    nameAr: "معالجة الأخطاء",
    nameEn: "Error Handling",
    patterns: [
      /try\s*{/,
      /catch\s*\(/,
      /\.catch\(/,
      /onError/,
      /isError/,
      /error\s*&&/
    ],
    weight: 1
  },
  {
    id: "loading_states",
    nameAr: "حالات التحميل",
    nameEn: "Loading States",
    patterns: [
      /isLoading/,
      /isPending/,
      /<Skeleton/,
      /Loading/,
      /Spinner/
    ],
    weight: 1
  },
  {
    id: "responsive_design",
    nameAr: "التصميم المتجاوب",
    nameEn: "Responsive Design",
    patterns: [
      /md:/,
      /lg:/,
      /sm:/,
      /xl:/,
      /grid-cols/,
      /flex-wrap/
    ],
    weight: 0.8
  },
  {
    id: "accessibility",
    nameAr: "إمكانية الوصول",
    nameEn: "Accessibility",
    patterns: [
      /aria-/,
      /role=/,
      /data-testid/,
      /alt=/,
      /tabIndex/
    ],
    weight: 0.8
  },
  {
    id: "state_management",
    nameAr: "إدارة الحالة",
    nameEn: "State Management",
    patterns: [
      /useState/,
      /useEffect/,
      /useMemo/,
      /useCallback/,
      /useContext/
    ],
    weight: 1
  },
  {
    id: "navigation",
    nameAr: "التنقل",
    nameEn: "Navigation",
    patterns: [
      /useLocation/,
      /<Link/,
      /navigate\(/,
      /href=/,
      /router/
    ],
    weight: 0.8
  },
  {
    id: "authentication",
    nameAr: "المصادقة",
    nameEn: "Authentication",
    patterns: [
      /useAuth/,
      /isAuthenticated/,
      /user\??\./,
      /login/i,
      /logout/i
    ],
    weight: 1
  },
  {
    id: "internationalization",
    nameAr: "تعدد اللغات",
    nameEn: "Internationalization",
    patterns: [
      /useLanguage/,
      /isArabic/,
      /language\s*===?\s*["']ar["']/,
      /dir=/,
      /rtl/
    ],
    weight: 0.7
  },
  {
    id: "toast_notifications",
    nameAr: "الإشعارات",
    nameEn: "Toast Notifications",
    patterns: [
      /useToast/,
      /toast\(/,
      /toast\./
    ],
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

function analyzeFile(filePath: string): { content: string; lineCount: number; exists: boolean; lastModified?: Date } {
  try {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    const lineCount = content.split("\n").length;
    return { content, lineCount, exists: true, lastModified: stats.mtime };
  } catch {
    return { content: "", lineCount: 0, exists: false };
  }
}

function checkCriteria(content: string, criteria: AnalysisCriteria): { completed: boolean; matchCount: number; evidence: string } {
  let matchCount = 0;
  let evidence = "";
  
  for (const pattern of criteria.patterns) {
    const matches = content.match(new RegExp(pattern, "g"));
    if (matches) {
      matchCount += matches.length;
      if (!evidence && matches.length > 0) {
        evidence = matches[0].substring(0, 50);
      }
    }
  }
  
  const completed = matchCount >= 2;
  return { completed, matchCount, evidence };
}

export function analyzeAllPages(): PageAnalysis[] {
  const pagesDir = path.join(process.cwd(), "client", "src", "pages");
  const results: PageAnalysis[] = [];
  
  for (const pageDef of PAGE_DEFINITIONS) {
    const filePath = path.join(pagesDir, pageDef.fileName);
    const { content, lineCount, exists, lastModified } = analyzeFile(filePath);
    
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
        evidence: completed ? `${matchCount} matches` : undefined
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
      lastModified
    });
  }
  
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
  totalTasks: number;
  completedTasks: number;
  categoryStats: Record<string, { pages: number; avgCompletion: number }>;
} {
  const results = analyzeAllPages();
  const existingPages = results.filter(p => p.fileExists);
  
  const totalTasks = results.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = results.reduce(
    (sum, p) => sum + p.tasks.filter(t => t.completed).length, 
    0
  );
  
  const categoryStats: Record<string, { pages: number; totalCompletion: number; avgCompletion: number }> = {};
  
  for (const page of results) {
    if (!categoryStats[page.category]) {
      categoryStats[page.category] = { pages: 0, totalCompletion: 0, avgCompletion: 0 };
    }
    categoryStats[page.category].pages++;
    categoryStats[page.category].totalCompletion += page.completionPercentage;
  }
  
  for (const cat of Object.keys(categoryStats)) {
    categoryStats[cat].avgCompletion = Math.round(
      categoryStats[cat].totalCompletion / categoryStats[cat].pages
    );
  }
  
  return {
    totalPages: results.length,
    existingPages: existingPages.length,
    averageCompletion: existingPages.length > 0
      ? Math.round(existingPages.reduce((sum, p) => sum + p.completionPercentage, 0) / existingPages.length)
      : 0,
    totalTasks,
    completedTasks,
    categoryStats
  };
}
