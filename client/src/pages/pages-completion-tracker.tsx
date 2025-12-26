import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  Home,
  SquareTerminal,
  Code,
  Sparkles,
  FolderKanban,
  Settings,
  Crown,
  Rocket,
  ShieldCheck,
  Brain,
  Bot,
  CreditCard,
  LayoutTemplate,
  GitBranch,
  Users,
  FileText,
  Shield,
  Globe,
  Cpu,
  Zap,
  Target,
  TrendingUp,
  Building,
  GraduationCap,
  Briefcase,
  Scale,
  Megaphone,
  Store,
  Hotel,
  Train,
  FileSearch,
  Laptop,
  Map,
  Terminal,
  TestTube,
  Puzzle,
  Activity,
  Lock,
  Key,
  Server,
  Database,
  Layers,
  Package,
  RefreshCw,
  FileCode
} from "lucide-react";

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
  lastModified?: string;
}

interface AnalysisResponse {
  success: boolean;
  pages: PageAnalysis[];
}

interface SummaryResponse {
  success: boolean;
  summary: {
    totalPages: number;
    existingPages: number;
    averageCompletion: number;
    totalTasks: number;
    completedTasks: number;
    categoryStats: Record<string, { pages: number; avgCompletion: number }>;
  };
}

const CATEGORY_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  core: { ar: "أساسي", en: "Core", color: "bg-blue-500" },
  owner: { ar: "المالك", en: "Owner", color: "bg-purple-500" },
  development: { ar: "التطوير", en: "Development", color: "bg-green-500" },
  platforms: { ar: "المنصات", en: "Platforms", color: "bg-orange-500" },
  security: { ar: "الأمان", en: "Security", color: "bg-red-500" },
  ai: { ar: "الذكاء الاصطناعي", en: "AI", color: "bg-pink-500" },
  business: { ar: "الأعمال", en: "Business", color: "bg-cyan-500" },
};

const PAGE_ICONS: Record<string, any> = {
  "home.tsx": Home,
  "console.tsx": SquareTerminal,
  "cloud-ide.tsx": Code,
  "ai-app-builder.tsx": Sparkles,
  "projects.tsx": FolderKanban,
  "owner-dashboard.tsx": Crown,
  "owner-control-center.tsx": Target,
  "sovereign-workspace.tsx": Cpu,
  "military-security.tsx": Shield,
  "sovereign-permissions.tsx": Lock,
  "nova-ai-dashboard.tsx": Brain,
  "nova-sovereign-dashboard.tsx": Bot,
  "infera-agent.tsx": Zap,
  "testing-generator.tsx": TestTube,
  "backend-generator.tsx": Server,
  "cicd-pipeline.tsx": Rocket,
  "git-control.tsx": GitBranch,
  "collaboration.tsx": Users,
  "templates.tsx": LayoutTemplate,
  "marketplace.tsx": Store,
  "maps.tsx": Map,
  "pricing.tsx": CreditCard,
  "analytics.tsx": TrendingUp,
  "settings.tsx": Settings,
  "page-performance-monitor.tsx": Activity,
  "pages-completion-tracker.tsx": CheckCircle,
};

function getCompletionColor(percentage: number): string {
  if (percentage >= 80) return "text-green-500";
  if (percentage >= 50) return "text-yellow-500";
  return "text-orange-500";
}

function getCompletionBadge(percentage: number, isArabic: boolean): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (percentage >= 80) return { label: isArabic ? "مكتمل" : "Complete", variant: "default" };
  if (percentage >= 50) return { label: isArabic ? "تقدم جيد" : "In Progress", variant: "secondary" };
  if (percentage > 0) return { label: isArabic ? "بداية" : "Started", variant: "outline" };
  return { label: isArabic ? "غير موجود" : "Missing", variant: "destructive" };
}

export default function PagesCompletionTracker() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: analysisData, isLoading: pagesLoading, refetch: refetchPages } = useQuery<AnalysisResponse>({
    queryKey: ["/api/pages/analysis"],
  });

  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<SummaryResponse>({
    queryKey: ["/api/pages/analysis/summary"],
  });

  const pages = analysisData?.pages || [];
  const summary = summaryData?.summary;

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesSearch = searchTerm === "" || 
        page.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.path.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || page.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [pages, searchTerm, selectedCategory]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { pages: number; completed: number; total: number }> = {};
    
    for (const cat of Object.keys(CATEGORY_LABELS)) {
      stats[cat] = { pages: 0, completed: 0, total: 0 };
    }
    
    for (const page of pages) {
      if (stats[page.category]) {
        stats[page.category].pages++;
        stats[page.category].completed += page.tasks.filter(t => t.completed).length;
        stats[page.category].total += page.tasks.length;
      }
    }
    
    return stats;
  }, [pages]);

  const handleRefresh = () => {
    refetchPages();
    refetchSummary();
  };

  if (pagesLoading || summaryLoading) {
    return (
      <div className="p-6 space-y-6" dir={isArabic ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isArabic ? "تتبع إكتمال الصفحات" : "Pages Completion Tracker"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isArabic 
                ? "تحليل ديناميكي حقيقي للكود - يفحص الملفات ويحلل المعايير" 
                : "Real dynamic code analysis - inspects files and analyzes criteria"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <FileCode className="w-4 h-4" />
              {isArabic ? "تحليل ديناميكي" : "Dynamic Analysis"}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleRefresh} data-testid="button-refresh">
              <RefreshCw className="w-4 h-4 mr-2" />
              {isArabic ? "تحديث" : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "متوسط الإكتمال" : "Average Completion"}
                  </p>
                  <p className={`text-3xl font-bold ${getCompletionColor(summary?.averageCompletion || 0)}`}>
                    {summary?.averageCompletion || 0}%
                  </p>
                </div>
                <CheckCircle className={`w-12 h-12 ${getCompletionColor(summary?.averageCompletion || 0)}`} />
              </div>
              <Progress value={summary?.averageCompletion || 0} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "الصفحات الموجودة" : "Existing Pages"}
                  </p>
                  <p className="text-3xl font-bold">
                    {summary?.existingPages || 0}/{summary?.totalPages || 0}
                  </p>
                </div>
                <Layers className="w-12 h-12 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "المعايير المكتملة" : "Completed Criteria"}
                  </p>
                  <p className="text-3xl font-bold text-green-500">{summary?.completedTasks || 0}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "المعايير المتبقية" : "Remaining Criteria"}
                  </p>
                  <p className="text-3xl font-bold text-orange-500">
                    {(summary?.totalTasks || 0) - (summary?.completedTasks || 0)}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Stats */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "إكتمال الفئات" : "Category Completion"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const stats = categoryStats[key];
                const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                return (
                  <div 
                    key={key}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCategory === key ? "ring-2 ring-primary" : "hover-elevate"
                    }`}
                    onClick={() => setSelectedCategory(selectedCategory === key ? "all" : key)}
                    data-testid={`category-${key}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${label.color}`} />
                      <span className="text-sm font-medium">
                        {isArabic ? label.ar : label.en}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{percentage}%</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.pages} {isArabic ? "صفحة" : "pages"}
                    </div>
                    <Progress value={percentage} className="mt-2 h-1" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Criteria Legend */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "معايير التحليل (12 معيار)" : "Analysis Criteria (12 Criteria)"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { id: "ui_components", ar: "مكونات UI", en: "UI Components", weight: "1x" },
                { id: "api_integration", ar: "تكامل API", en: "API Integration", weight: "1.5x" },
                { id: "form_handling", ar: "معالجة النماذج", en: "Form Handling", weight: "1x" },
                { id: "error_handling", ar: "معالجة الأخطاء", en: "Error Handling", weight: "1x" },
                { id: "loading_states", ar: "حالات التحميل", en: "Loading States", weight: "1x" },
                { id: "responsive_design", ar: "تصميم متجاوب", en: "Responsive", weight: "0.8x" },
                { id: "accessibility", ar: "إمكانية الوصول", en: "Accessibility", weight: "0.8x" },
                { id: "state_management", ar: "إدارة الحالة", en: "State Mgmt", weight: "1x" },
                { id: "navigation", ar: "التنقل", en: "Navigation", weight: "0.8x" },
                { id: "authentication", ar: "المصادقة", en: "Authentication", weight: "1x" },
                { id: "internationalization", ar: "تعدد اللغات", en: "i18n", weight: "0.7x" },
                { id: "toast_notifications", ar: "الإشعارات", en: "Toasts", weight: "0.5x" },
              ].map((c) => (
                <div key={c.id} className="p-2 rounded-md border text-center">
                  <div className="text-xs font-medium">{isArabic ? c.ar : c.en}</div>
                  <Badge variant="outline" className="mt-1 text-xs">{c.weight}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isArabic ? "بحث عن صفحة..." : "Search pages..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          {selectedCategory !== "all" && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory("all")}
              data-testid="button-clear-filter"
            >
              {isArabic ? "عرض الكل" : "Show All"}
            </Button>
          )}
        </div>

        {/* Pages Grid */}
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {filteredPages.map((page) => {
              const badge = getCompletionBadge(page.completionPercentage, isArabic);
              const Icon = PAGE_ICONS[page.fileName] || FileCode;
              const categoryLabel = CATEGORY_LABELS[page.category];
              const completedCount = page.tasks.filter(t => t.completed).length;

              return (
                <Card key={page.path} className="overflow-visible" data-testid={`card-page-${page.path.replace(/\//g, '-')}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${categoryLabel?.color || 'bg-gray-500'} bg-opacity-20`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {isArabic ? page.nameAr : page.nameEn}
                          </CardTitle>
                          <code className="text-xs text-muted-foreground">{page.path}</code>
                        </div>
                      </div>
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* File Info */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileCode className="w-3 h-3" />
                      <span>{page.fileName}</span>
                      {page.fileExists && (
                        <>
                          <span>•</span>
                          <span>{page.lineCount} {isArabic ? "سطر" : "lines"}</span>
                        </>
                      )}
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-2xl font-bold ${getCompletionColor(page.completionPercentage)}`}>
                          {page.completionPercentage}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {completedCount}/{page.tasks.length} {isArabic ? "معيار" : "criteria"}
                        </span>
                      </div>
                      <Progress value={page.completionPercentage} className="h-2" />
                    </div>

                    {/* Tasks */}
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {page.tasks.map((task) => (
                        <div 
                          key={task.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          {task.completed ? (
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          ) : (
                            <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={task.completed ? "text-muted-foreground" : ""}>
                            {isArabic ? task.nameAr : task.nameEn}
                          </span>
                          {task.evidence && (
                            <Badge variant="outline" className="text-[10px] px-1">
                              {task.evidence}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Action */}
                    {page.fileExists ? (
                      <Link href={page.path}>
                        <Button variant="outline" className="w-full" size="sm" data-testid={`button-visit-${page.path.replace(/\//g, '-')}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {isArabic ? "زيارة الصفحة" : "Visit Page"}
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="w-full" size="sm" disabled>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {isArabic ? "الملف غير موجود" : "File Missing"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
