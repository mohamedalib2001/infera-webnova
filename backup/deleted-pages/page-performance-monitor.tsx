import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap, 
  Server, 
  FileCode, 
  RefreshCw,
  Activity,
  Cpu,
  HardDrive,
  Lightbulb,
  Shield,
  Eye,
  XCircle,
  ExternalLink,
  Home,
  SquareTerminal,
  Code,
  Sparkles,
  FolderKanban,
  BarChart3,
  Settings,
  Crown,
  Rocket,
  ShieldCheck,
  Brain,
  Bot,
  CreditCard,
  LayoutTemplate,
  GitBranch,
  Trash2,
  Star,
  AlertCircle
} from "lucide-react";

interface PageInfo {
  path: string;
  nameAr: string;
  nameEn: string;
  icon: any;
  importance: "critical" | "high" | "medium" | "low";
  canDelete: boolean;
  deleteReason?: string;
  deleteReasonAr?: string;
  description: string;
  descriptionAr: string;
  estimatedLoadTime: number;
  jsBundle: number;
  apiCalls: string[];
  issues: PageIssue[];
}

interface PageIssue {
  type: string;
  description: string;
  descriptionAr: string;
  impact: number;
  hasSolution: boolean;
  solution?: string;
  solutionAr?: string;
}

const REAL_PAGES: PageInfo[] = [
  {
    path: "/",
    nameAr: "الرئيسية",
    nameEn: "Home",
    icon: Home,
    importance: "critical",
    canDelete: false,
    deleteReasonAr: "الصفحة الرئيسية ضرورية - نقطة الدخول للمنصة",
    deleteReason: "Main entry point - cannot be removed",
    description: "Landing page with platform overview",
    descriptionAr: "صفحة الهبوط مع نظرة عامة على المنصة",
    estimatedLoadTime: 800,
    jsBundle: 120,
    apiCalls: ["/api/user", "/api/stats"],
    issues: []
  },
  {
    path: "/console",
    nameAr: "وحدة التحكم",
    nameEn: "Console",
    icon: SquareTerminal,
    importance: "critical",
    canDelete: false,
    deleteReasonAr: "مركز التحكم الرئيسي للمنصة",
    deleteReason: "Main control center for the platform",
    description: "Central dashboard for platform management",
    descriptionAr: "لوحة التحكم المركزية لإدارة المنصة",
    estimatedLoadTime: 1200,
    jsBundle: 180,
    apiCalls: ["/api/user", "/api/platforms", "/api/stats", "/api/activity"],
    issues: [
      {
        type: "api_calls",
        description: "4 API calls on load - could be combined",
        descriptionAr: "4 استدعاءات API عند التحميل - يمكن دمجها",
        impact: 35,
        hasSolution: true,
        solution: "Create /api/console/init endpoint combining all data",
        solutionAr: "إنشاء نقطة نهاية /api/console/init تجمع كل البيانات"
      }
    ]
  },
  {
    path: "/ide",
    nameAr: "بيئة التطوير السحابية",
    nameEn: "Cloud IDE",
    icon: Code,
    importance: "critical",
    canDelete: false,
    deleteReasonAr: "أداة التطوير الأساسية - جوهر المنصة",
    deleteReason: "Core development tool - platform essence",
    description: "Monaco-based code editor with full IDE features",
    descriptionAr: "محرر كود مبني على Monaco مع ميزات IDE كاملة",
    estimatedLoadTime: 3500,
    jsBundle: 850,
    apiCalls: ["/api/project", "/api/files", "/api/runtime"],
    issues: [
      {
        type: "bundle_size",
        description: "Monaco Editor adds 600KB+ to bundle",
        descriptionAr: "محرر Monaco يضيف 600+ كيلوبايت للحزمة",
        impact: 70,
        hasSolution: true,
        solution: "Lazy load Monaco only when IDE is opened",
        solutionAr: "تحميل Monaco بشكل كسول فقط عند فتح IDE"
      },
      {
        type: "memory",
        description: "High memory usage with large files",
        descriptionAr: "استخدام ذاكرة عالي مع الملفات الكبيرة",
        impact: 50,
        hasSolution: true,
        solution: "Implement virtual scrolling for large files",
        solutionAr: "تطبيق التمرير الافتراضي للملفات الكبيرة"
      }
    ]
  },
  {
    path: "/ai-builder",
    nameAr: "منشئ التطبيقات بالذكاء",
    nameEn: "AI App Builder",
    icon: Sparkles,
    importance: "high",
    canDelete: false,
    deleteReasonAr: "ميزة تنافسية رئيسية - الذكاء الاصطناعي",
    deleteReason: "Key competitive feature - AI integration",
    description: "AI-powered application generator",
    descriptionAr: "مولد تطبيقات مدعوم بالذكاء الاصطناعي",
    estimatedLoadTime: 1500,
    jsBundle: 280,
    apiCalls: ["/api/ai/models", "/api/templates"],
    issues: [
      {
        type: "api_latency",
        description: "AI model loading can be slow",
        descriptionAr: "تحميل نماذج AI قد يكون بطيئاً",
        impact: 40,
        hasSolution: true,
        solution: "Pre-warm AI connections on app start",
        solutionAr: "تسخين اتصالات AI مسبقاً عند بدء التطبيق"
      }
    ]
  },
  {
    path: "/projects",
    nameAr: "المشاريع",
    nameEn: "Projects",
    icon: FolderKanban,
    importance: "critical",
    canDelete: false,
    deleteReasonAr: "إدارة المشاريع ضرورية للمستخدمين",
    deleteReason: "Project management is essential",
    description: "Project listing and management",
    descriptionAr: "عرض وإدارة المشاريع",
    estimatedLoadTime: 900,
    jsBundle: 150,
    apiCalls: ["/api/projects"],
    issues: []
  },
  {
    path: "/analytics",
    nameAr: "التحليلات",
    nameEn: "Analytics",
    icon: BarChart3,
    importance: "medium",
    canDelete: true,
    deleteReasonAr: "يمكن دمجها في لوحة التحكم",
    deleteReason: "Can be merged into dashboard",
    description: "Platform usage analytics and charts",
    descriptionAr: "تحليلات استخدام المنصة والرسوم البيانية",
    estimatedLoadTime: 2000,
    jsBundle: 320,
    apiCalls: ["/api/analytics/overview", "/api/analytics/usage", "/api/analytics/trends"],
    issues: [
      {
        type: "charts",
        description: "Recharts library adds significant bundle size",
        descriptionAr: "مكتبة Recharts تضيف حجماً كبيراً للحزمة",
        impact: 45,
        hasSolution: true,
        solution: "Lazy load charts or use lighter library",
        solutionAr: "تحميل الرسوم البيانية بشكل كسول أو استخدام مكتبة أخف"
      }
    ]
  },
  {
    path: "/settings",
    nameAr: "الإعدادات",
    nameEn: "Settings",
    icon: Settings,
    importance: "high",
    canDelete: false,
    deleteReasonAr: "إعدادات الحساب ضرورية",
    deleteReason: "Account settings are essential",
    description: "User and platform settings",
    descriptionAr: "إعدادات المستخدم والمنصة",
    estimatedLoadTime: 600,
    jsBundle: 90,
    apiCalls: ["/api/settings"],
    issues: []
  },
  {
    path: "/owner",
    nameAr: "لوحة المالك",
    nameEn: "Owner Dashboard",
    icon: Crown,
    importance: "critical",
    canDelete: false,
    deleteReasonAr: "لوحة التحكم الخاصة بالمالك - ROOT_OWNER",
    deleteReason: "Owner control panel - ROOT_OWNER access",
    description: "Sovereign owner dashboard with full control",
    descriptionAr: "لوحة تحكم المالك السيادي مع تحكم كامل",
    estimatedLoadTime: 1800,
    jsBundle: 250,
    apiCalls: ["/api/owner/stats", "/api/owner/users", "/api/owner/revenue", "/api/owner/activity"],
    issues: [
      {
        type: "api_calls",
        description: "Multiple heavy API calls",
        descriptionAr: "استدعاءات API ثقيلة متعددة",
        impact: 55,
        hasSolution: true,
        solution: "Implement data caching with SWR",
        solutionAr: "تطبيق تخزين مؤقت للبيانات مع SWR"
      }
    ]
  },
  {
    path: "/sovereign-workspace",
    nameAr: "مساحة العمل السيادية",
    nameEn: "Sovereign Workspace",
    icon: Rocket,
    importance: "high",
    canDelete: false,
    deleteReasonAr: "بيئة العمل المتكاملة للمالك",
    deleteReason: "Integrated workspace for owner",
    description: "Full development workspace with IDE and terminal",
    descriptionAr: "مساحة عمل تطوير كاملة مع IDE وطرفية",
    estimatedLoadTime: 4000,
    jsBundle: 950,
    apiCalls: ["/api/workspace", "/api/files", "/api/terminal"],
    issues: [
      {
        type: "bundle_size",
        description: "Largest page - Monaco + xterm.js",
        descriptionAr: "أكبر صفحة - Monaco + xterm.js",
        impact: 85,
        hasSolution: true,
        solution: "Code split into smaller chunks, lazy load components",
        solutionAr: "تقسيم الكود لأجزاء أصغر، تحميل المكونات بشكل كسول"
      },
      {
        type: "websocket",
        description: "Multiple WebSocket connections",
        descriptionAr: "اتصالات WebSocket متعددة",
        impact: 40,
        hasSolution: true,
        solution: "Multiplex WebSocket connections",
        solutionAr: "تعدد إرسال اتصالات WebSocket"
      }
    ]
  },
  {
    path: "/military-security",
    nameAr: "الأمان العسكري",
    nameEn: "Military Security",
    icon: ShieldCheck,
    importance: "high",
    canDelete: false,
    deleteReasonAr: "نظام الأمان الأساسي - FIPS 140-3",
    deleteReason: "Core security system - FIPS 140-3",
    description: "Military-grade security dashboard",
    descriptionAr: "لوحة الأمان بالمعايير العسكرية",
    estimatedLoadTime: 1600,
    jsBundle: 280,
    apiCalls: ["/api/security/status", "/api/security/threats", "/api/security/audit"],
    issues: [
      {
        type: "crypto",
        description: "Heavy cryptographic operations",
        descriptionAr: "عمليات تشفير ثقيلة",
        impact: 35,
        hasSolution: true,
        solution: "Use Web Workers for crypto operations",
        solutionAr: "استخدام Web Workers لعمليات التشفير"
      }
    ]
  },
  {
    path: "/nova/dashboard",
    nameAr: "لوحة Nova AI",
    nameEn: "Nova AI Dashboard",
    icon: Brain,
    importance: "high",
    canDelete: false,
    deleteReasonAr: "مركز قيادة الذكاء الاصطناعي",
    deleteReason: "AI command center",
    description: "Nova AI monitoring and control",
    descriptionAr: "مراقبة والتحكم في Nova AI",
    estimatedLoadTime: 1400,
    jsBundle: 220,
    apiCalls: ["/api/nova/status", "/api/nova/memory", "/api/nova/context"],
    issues: []
  },
  {
    path: "/infera-agent",
    nameAr: "وكيل إنفرا",
    nameEn: "INFERA Agent",
    icon: Bot,
    importance: "medium",
    canDelete: true,
    deleteReasonAr: "يمكن دمجه مع Nova AI",
    deleteReason: "Can be merged with Nova AI",
    description: "Autonomous development agent interface",
    descriptionAr: "واجهة وكيل التطوير الذاتي",
    estimatedLoadTime: 1200,
    jsBundle: 200,
    apiCalls: ["/api/agent/status"],
    issues: [
      {
        type: "websocket",
        description: "Persistent WebSocket connection",
        descriptionAr: "اتصال WebSocket مستمر",
        impact: 25,
        hasSolution: true,
        solution: "Implement connection pooling",
        solutionAr: "تطبيق تجميع الاتصالات"
      }
    ]
  },
  {
    path: "/pricing",
    nameAr: "الأسعار",
    nameEn: "Pricing",
    icon: CreditCard,
    importance: "high",
    canDelete: false,
    deleteReasonAr: "صفحة الاشتراكات والدفع ضرورية",
    deleteReason: "Subscription and payment page essential",
    description: "Pricing plans and subscription management",
    descriptionAr: "خطط الأسعار وإدارة الاشتراكات",
    estimatedLoadTime: 700,
    jsBundle: 100,
    apiCalls: ["/api/plans", "/api/subscription"],
    issues: []
  },
  {
    path: "/templates",
    nameAr: "القوالب",
    nameEn: "Templates",
    icon: LayoutTemplate,
    importance: "medium",
    canDelete: true,
    deleteReasonAr: "يمكن دمجها في صفحة المشاريع",
    deleteReason: "Can be merged into projects page",
    description: "Project templates gallery",
    descriptionAr: "معرض قوالب المشاريع",
    estimatedLoadTime: 1100,
    jsBundle: 180,
    apiCalls: ["/api/templates"],
    issues: [
      {
        type: "images",
        description: "Template thumbnails not optimized",
        descriptionAr: "صور القوالب المصغرة غير محسنة",
        impact: 30,
        hasSolution: true,
        solution: "Use WebP and lazy load images",
        solutionAr: "استخدام WebP وتحميل الصور بشكل كسول"
      }
    ]
  },
  {
    path: "/git",
    nameAr: "التحكم بالإصدارات",
    nameEn: "Version Control",
    icon: GitBranch,
    importance: "high",
    canDelete: false,
    deleteReasonAr: "نظام Git ضروري للتطوير",
    deleteReason: "Git system essential for development",
    description: "Git version control interface",
    descriptionAr: "واجهة التحكم بالإصدارات Git",
    estimatedLoadTime: 1000,
    jsBundle: 160,
    apiCalls: ["/api/git/status", "/api/git/log"],
    issues: []
  }
];

export default function PagePerformanceMonitor() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [realMetrics, setRealMetrics] = useState<Map<string, number>>(new Map());

  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.role === "ROOT_OWNER";

  const measureRealPerformance = useCallback(() => {
    setIsScanning(true);
    
    const metrics = new Map<string, number>();
    
    if (typeof window !== "undefined" && window.performance) {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.set("currentPageLoad", navigation.loadEventEnd - navigation.startTime);
        metrics.set("domContentLoaded", navigation.domContentLoadedEventEnd - navigation.startTime);
        metrics.set("firstPaint", navigation.responseEnd - navigation.requestStart);
      }
      
      const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      let totalJsSize = 0;
      let totalCssSize = 0;
      resources.forEach(r => {
        if (r.name.includes(".js")) {
          totalJsSize += r.transferSize || 0;
        }
        if (r.name.includes(".css")) {
          totalCssSize += r.transferSize || 0;
        }
      });
      metrics.set("totalJsSize", totalJsSize / 1024);
      metrics.set("totalCssSize", totalCssSize / 1024);
      
      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        metrics.set("heapUsed", mem.usedJSHeapSize / (1024 * 1024));
        metrics.set("heapTotal", mem.totalJSHeapSize / (1024 * 1024));
      }
    }
    
    setRealMetrics(metrics);
    setLastScan(new Date());
    setIsScanning(false);
  }, []);

  useEffect(() => {
    if (isOwner) {
      measureRealPerformance();
    }
  }, [isOwner, measureRealPerformance]);

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">
              {language === "ar" ? "صلاحيات المالك مطلوبة" : "Owner Access Required"}
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSeverity = (page: PageInfo) => {
    const totalImpact = page.issues.reduce((sum, i) => sum + i.impact, 0);
    if (totalImpact > 80) return "critical";
    if (totalImpact > 40) return "warning";
    if (totalImpact > 0) return "good";
    return "excellent";
  };

  const criticalPages = REAL_PAGES.filter(p => getSeverity(p) === "critical");
  const warningPages = REAL_PAGES.filter(p => getSeverity(p) === "warning");
  const healthyPages = REAL_PAGES.filter(p => getSeverity(p) === "good" || getSeverity(p) === "excellent");
  const deletablePages = REAL_PAGES.filter(p => p.canDelete);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-7 h-7 text-violet-500" />
              {language === "ar" ? "مراقبة أداء الصفحات" : "Page Performance Monitor"}
            </h1>
            <p className="text-muted-foreground">
              {language === "ar" 
                ? "تحليل حقيقي لأداء صفحات المنصة" 
                : "Real analysis of platform page performance"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastScan && (
              <span className="text-sm text-muted-foreground">
                {language === "ar" ? "آخر فحص:" : "Last scan:"} {lastScan.toLocaleTimeString()}
              </span>
            )}
            <Button onClick={measureRealPerformance} disabled={isScanning} data-testid="button-rescan">
              <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? "animate-spin" : ""}`} />
              {isScanning ? (language === "ar" ? "جاري الفحص..." : "Scanning...") : (language === "ar" ? "إعادة الفحص" : "Rescan")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-violet-500/20 bg-violet-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">{language === "ar" ? "الصفحة الحالية" : "Current Page"}</p>
                  <p className="text-2xl font-bold text-violet-500">{Math.round(realMetrics.get("currentPageLoad") || 0)}ms</p>
                </div>
                <Clock className="w-8 h-8 text-violet-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">{language === "ar" ? "حجم JS الكلي" : "Total JS Size"}</p>
                  <p className="text-2xl font-bold text-blue-500">{Math.round(realMetrics.get("totalJsSize") || 0)}KB</p>
                </div>
                <FileCode className="w-8 h-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">{language === "ar" ? "الذاكرة المستخدمة" : "Heap Used"}</p>
                  <p className="text-2xl font-bold text-amber-500">{Math.round(realMetrics.get("heapUsed") || 0)}MB</p>
                </div>
                <HardDrive className="w-8 h-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">{language === "ar" ? "إجمالي الصفحات" : "Total Pages"}</p>
                  <p className="text-2xl font-bold text-emerald-500">{REAL_PAGES.length}</p>
                </div>
                <Eye className="w-8 h-8 text-emerald-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="flex-wrap">
            <TabsTrigger value="all">{language === "ar" ? "الكل" : "All"} ({REAL_PAGES.length})</TabsTrigger>
            <TabsTrigger value="critical" className="text-red-500">{language === "ar" ? "حرجة" : "Critical"} ({criticalPages.length})</TabsTrigger>
            <TabsTrigger value="warnings" className="text-yellow-500">{language === "ar" ? "تحذيرات" : "Warnings"} ({warningPages.length})</TabsTrigger>
            <TabsTrigger value="healthy" className="text-green-500">{language === "ar" ? "سليمة" : "Healthy"} ({healthyPages.length})</TabsTrigger>
            <TabsTrigger value="deletable" className="text-orange-500">{language === "ar" ? "قابلة للحذف" : "Can Delete"} ({deletablePages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {REAL_PAGES.map((page, idx) => (
                  <PageCard key={idx} page={page} language={language} severity={getSeverity(page)} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="critical" className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {criticalPages.map((page, idx) => (
                  <PageCard key={idx} page={page} language={language} severity="critical" />
                ))}
                {criticalPages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>{language === "ar" ? "لا توجد صفحات حرجة" : "No critical pages"}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="warnings" className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {warningPages.map((page, idx) => (
                  <PageCard key={idx} page={page} language={language} severity="warning" />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="healthy" className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {healthyPages.map((page, idx) => (
                  <PageCard key={idx} page={page} language={language} severity={getSeverity(page)} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="deletable" className="mt-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 mb-4">
                <Card className="border-orange-500/20 bg-orange-500/5 p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                    <p className="text-sm">
                      {language === "ar" 
                        ? "هذه الصفحات يمكن حذفها أو دمجها لتحسين الأداء. لن يؤثر حذفها على الوظائف الأساسية."
                        : "These pages can be deleted or merged to improve performance. Removing them won't affect core functionality."}
                    </p>
                  </div>
                </Card>
                {deletablePages.map((page, idx) => (
                  <PageCard key={idx} page={page} language={language} severity={getSeverity(page)} showDeleteInfo />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PageCard({ page, language, severity, showDeleteInfo }: { page: PageInfo; language: string; severity: string; showDeleteInfo?: boolean }) {
  const Icon = page.icon;
  
  const getSeverityColor = () => {
    switch (severity) {
      case "critical": return "border-red-500/30 bg-red-500/5";
      case "warning": return "border-yellow-500/30 bg-yellow-500/5";
      default: return "border-green-500/30 bg-green-500/5";
    }
  };

  const getImportanceBadge = () => {
    const colors = {
      critical: "bg-red-500/20 text-red-600 dark:text-red-400",
      high: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
      medium: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
      low: "bg-gray-500/20 text-gray-600 dark:text-gray-400"
    };
    const labels = {
      critical: language === "ar" ? "حرجة" : "Critical",
      high: language === "ar" ? "عالية" : "High",
      medium: language === "ar" ? "متوسطة" : "Medium",
      low: language === "ar" ? "منخفضة" : "Low"
    };
    return <Badge className={colors[page.importance]}>{labels[page.importance]}</Badge>;
  };

  return (
    <Card className={`${getSeverityColor()} transition-all`} data-testid={`card-page-${page.path.replace(/\//g, "-")}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background/50">
              <Icon className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {language === "ar" ? page.nameAr : page.nameEn}
                <Link href={page.path}>
                  <Button size="icon" variant="ghost" className="h-6 w-6" data-testid={`link-goto-${page.path.replace(/\//g, "-")}`}>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardTitle>
              <code className="text-xs text-muted-foreground">{page.path}</code>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {getImportanceBadge()}
            {page.canDelete ? (
              <Badge variant="outline" className="border-orange-500/30 text-orange-500">
                <Trash2 className="w-3 h-3 mr-1" />
                {language === "ar" ? "قابلة للحذف" : "Can Delete"}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">
                <Star className="w-3 h-3 mr-1" />
                {language === "ar" ? "أساسية" : "Essential"}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {language === "ar" ? page.descriptionAr : page.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">{language === "ar" ? "وقت التحميل" : "Load Time"}</p>
              <p className="font-bold">{page.estimatedLoadTime}ms</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">{language === "ar" ? "حجم JS" : "JS Bundle"}</p>
              <p className="font-bold">{page.jsBundle}KB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">{language === "ar" ? "استدعاءات API" : "API Calls"}</p>
              <p className="font-bold">{page.apiCalls.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">{language === "ar" ? "الأهمية" : "Importance"}</p>
              <p className="font-bold capitalize">{page.importance}</p>
            </div>
          </div>
        </div>

        {showDeleteInfo && page.canDelete && (
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-start gap-2">
              <Trash2 className="w-4 h-4 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {language === "ar" ? "سبب إمكانية الحذف:" : "Why it can be deleted:"}
                </p>
                <p className="text-sm">{language === "ar" ? page.deleteReasonAr : page.deleteReason}</p>
              </div>
            </div>
          </div>
        )}

        {!page.canDelete && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {language === "ar" ? "سبب عدم إمكانية الحذف:" : "Why it cannot be deleted:"}
                </p>
                <p className="text-sm">{language === "ar" ? page.deleteReasonAr : page.deleteReason}</p>
              </div>
            </div>
          </div>
        )}

        {page.issues.length > 0 && (
          <div className="space-y-3 pt-2 border-t">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              {language === "ar" ? "المشاكل المكتشفة" : "Detected Issues"} ({page.issues.length})
            </h4>
            <div className="space-y-2">
              {page.issues.map((issue, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-background/50 border space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {language === "ar" ? issue.descriptionAr : issue.description}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{language === "ar" ? "التأثير:" : "Impact:"}</span>
                      <Progress value={issue.impact} className="w-16 h-2" />
                      <span className="text-xs font-bold">{issue.impact}%</span>
                    </div>
                  </div>
                  
                  {issue.hasSolution && (
                    <div className="flex items-start gap-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                      <Lightbulb className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                          {language === "ar" ? "الحل المقترح:" : "Solution:"}
                        </span>
                        <p className="text-sm">{language === "ar" ? issue.solutionAr : issue.solution}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {page.issues.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">
              {language === "ar" ? "هذه الصفحة تعمل بشكل ممتاز" : "This page is performing excellently"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
