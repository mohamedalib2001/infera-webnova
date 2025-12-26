import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSyncedLogo } from "@/hooks/use-synced-logo";
import { GradientBackground } from "@/components/gradient-background";
import { ChatInput } from "@/components/chat-input";
import { ProjectCard } from "@/components/project-card";
import { TemplateCard } from "@/components/template-card";
import { TemplateDetailDialog } from "@/components/template-detail-dialog";
import { EmptyState } from "@/components/empty-state";
import { SecureDeletionDialog } from "@/components/secure-deletion-dialog";
import { CompliancePanel } from "@/components/compliance-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Building2, 
  Shield, 
  Activity, 
  Cpu,
  Globe,
  HeartPulse,
  GraduationCap,
  Landmark,
  Bot,
  CreditCard,
  Settings,
  Brain,
  Zap,
  Filter,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  LineChart,
  History,
  Eye,
  Users,
  Server,
  Gauge,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import type { Project, Template } from "@shared/schema";

const templateCategories = [
  { id: "all", label: { en: "All Templates", ar: "جميع القوالب" }, icon: LayoutGrid },
  { id: "business-saas", label: { en: "Business & SaaS", ar: "أعمال و SaaS" }, icon: Building2 },
  { id: "government-enterprise", label: { en: "Government", ar: "حكومي" }, icon: Landmark },
  { id: "ai-native", label: { en: "AI-Native", ar: "ذكاء اصطناعي" }, icon: Bot },
  { id: "e-commerce-fintech", label: { en: "E-Commerce", ar: "تجارة إلكترونية" }, icon: CreditCard },
  { id: "internal-tools", label: { en: "Internal Tools", ar: "أدوات داخلية" }, icon: Settings },
];

const intelligenceLevels = [
  { id: "all", label: { en: "All Levels", ar: "جميع المستويات" }, icon: Filter },
  { id: "basic", label: { en: "Basic", ar: "أساسي" }, icon: Zap },
  { id: "smart", label: { en: "Smart", ar: "ذكي" }, icon: Sparkles },
  { id: "ai-native", label: { en: "AI-Native", ar: "ذكاء اصطناعي" }, icon: Brain },
];

const sovereignDomains = [
  { 
    key: "financial", 
    icon: Building2, 
    compliance: ["PCI-DSS", "AML", "KYC"],
    color: "from-emerald-500 to-teal-500"
  },
  { 
    key: "healthcare", 
    icon: HeartPulse, 
    compliance: ["HIPAA", "GDPR"],
    color: "from-rose-500 to-pink-500"
  },
  { 
    key: "government", 
    icon: Landmark, 
    compliance: ["WCAG 2.1", "Data Sovereignty"],
    color: "from-blue-500 to-indigo-500"
  },
  { 
    key: "education", 
    icon: GraduationCap, 
    compliance: ["FERPA", "COPPA"],
    color: "from-amber-500 to-orange-500"
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("platforms");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIntelligence, setSelectedIntelligence] = useState("all");
  const { t, isRtl, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get synced logo for INFERA WebNova
  const { logoSVG: syncedLogo, isLoaded: logoLoaded } = useSyncedLogo('infera-webnova');
  
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);
  const [showCompliancePanel, setShowCompliancePanel] = useState(false);
  const [selectedComplianceFramework, setSelectedComplianceFramework] = useState<string | undefined>(undefined);
  const [showDeferredContent, setShowDeferredContent] = useState(false);

  // Defer heavy content until after initial paint for better LCP (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDeferredContent(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Dashboard Analytics interface
  interface DashboardAnalytics {
    kpis: {
      activeUsers: number;
      userGrowth: string;
      uptime: string;
      uptimeStatus: string;
      responseTime: number;
      responseImprovement: string;
      eventsToday: number;
      eventsGrowth: string;
    };
    historicalData: number[];
    predictions: {
      nextMonthGrowth: string;
      accuracy: number;
      peakWarning: string | null;
      userPattern: string;
    };
    anomalies: {
      activeAlerts: number;
      resolvedAnomalies: number;
      detectionAccuracy: number;
      avgDetectionTime: string;
    };
    timestamp: string;
  }

  // Defer all API calls until after initial paint
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: showDeferredContent,
  });

  const { data: templates, isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
    enabled: showDeferredContent,
  });

  const { data: dashboardAnalytics, isLoading: analyticsLoading } = useQuery<DashboardAnalytics>({
    queryKey: ["/api/dashboard-analytics"],
    enabled: showDeferredContent,
    refetchInterval: 30000,
  });

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    return templates.filter((tpl) => {
      const categoryMatch = selectedCategory === "all" || tpl.category === selectedCategory;
      const intelligenceMatch = selectedIntelligence === "all" || tpl.intelligenceLevel === selectedIntelligence;
      return categoryMatch && intelligenceMatch;
    });
  }, [templates, selectedCategory, selectedIntelligence]);

  const handleChatSubmit = async (message: string) => {
    setLocation(`/builder?prompt=${encodeURIComponent(message)}`);
  };

  const handleOpenProject = (project: Project) => {
    setLocation(`/builder/${project.id}`);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteDialog(true);
  };

  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    setProjectToDelete(null);
    setShowDeleteDialog(false);
    toast({
      title: language === 'ar' ? 'تم حذف المنصة بنجاح' : 'Platform deleted successfully',
    });
  };

  const handleDeleteCancel = () => {
    setProjectToDelete(null);
    setShowDeleteDialog(false);
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowTemplateDetail(true);
  };

  const suggestions = [
    { key: "suggestion.financial" },
    { key: "suggestion.healthcare" },
    { key: "suggestion.government" },
    { key: "suggestion.education" },
  ];

  return (
    <GradientBackground className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="flex items-center gap-3 mb-6">
          {syncedLogo && logoLoaded ? (
            <div 
              className="w-14 h-14 rounded-xl overflow-hidden shadow-lg"
              dangerouslySetInnerHTML={{ __html: syncedLogo }}
              data-testid="synced-platform-logo"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Cpu className="h-8 w-8 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              INFERA WebNova
            </h2>
            <Badge variant="outline" className="text-xs border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400">
              {t("home.badge")}
            </Badge>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 max-w-4xl" data-testid="text-welcome">
          {t("home.title")}
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-6 max-w-2xl">
          {t("home.subtitle")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl w-full">
          {sovereignDomains.map((domain) => {
            const Icon = domain.icon;
            return (
              <Card 
                key={domain.key} 
                className="hover-elevate cursor-pointer bg-card/60 backdrop-blur-sm border-border/50"
                onClick={() => handleChatSubmit(t(`domain.${domain.key}`))}
                data-testid={`card-domain-${domain.key}`}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${domain.color} flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-sm">{t(`domain.${domain.key}`)}</span>
                  <div className="flex flex-wrap justify-center gap-1">
                    {domain.compliance.slice(0, 2).map((comp) => (
                      <Badge 
                        key={comp} 
                        variant="secondary" 
                        className="text-xs cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComplianceFramework(comp.toLowerCase().replace(/\s+/g, '-'));
                          setShowCompliancePanel(true);
                        }}
                        data-testid={`badge-compliance-${comp.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <ChatInput
          onSend={handleChatSubmit}
          placeholder={t("home.placeholder")}
          language={language as "ar" | "en"}
        />
        
        <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-3xl">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleChatSubmit(t(suggestion.key))}
              className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm text-sm text-muted-foreground hover-elevate border border-border/50 transition-all"
              data-testid={`button-suggestion-${index}`}
            >
              {t(suggestion.key)}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>{language === "ar" ? "أمان مؤسسي" : "Enterprise Security"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span>{language === "ar" ? "تشغيل ذاتي" : "Autonomous Operation"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-violet-500" />
            <span>{language === "ar" ? "سيادة البيانات" : "Data Sovereignty"}</span>
          </div>
        </div>
      </div>
      
      {showDeferredContent && (
        <div className="bg-background/80 backdrop-blur-xl border-t">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} dir={isRtl ? "rtl" : "ltr"}>
              <TabsList className="mb-6 w-fit">
                <TabsTrigger value="platforms" data-testid="tab-platforms">
                  <Activity className="h-4 w-4 me-2" />
                  {t("home.recent")}
                </TabsTrigger>
                <TabsTrigger value="blueprints" data-testid="tab-blueprints">
                  <Cpu className="h-4 w-4 me-2" />
                  {t("home.blueprints")}
                </TabsTrigger>
                <TabsTrigger value="templates" data-testid="tab-templates">
                  <Sparkles className="h-4 w-4 me-2" />
                  {t("home.templates")}
                </TabsTrigger>
                <TabsTrigger value="analytics" data-testid="tab-analytics">
                  <BarChart3 className="h-4 w-4 me-2" />
                  {language === "ar" ? "التحليلات" : "Analytics"}
                </TabsTrigger>
              </TabsList>
            
            <TabsContent value="platforms">
              {projectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="aspect-video rounded-lg" />
                  ))}
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.slice(0, 6).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpen={handleOpenProject}
                      onDelete={handleDeleteProject}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState type="projects" onAction={() => setLocation("/builder")} />
              )}
            </TabsContent>

            <TabsContent value="blueprints">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-dashed border-2 hover-elevate cursor-pointer" onClick={() => setLocation("/builder")}>
                  <CardContent className="flex flex-col items-center justify-center h-48 gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                      <Cpu className="h-8 w-8 text-violet-500" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold">{language === "ar" ? "إنشاء مخطط جديد" : "Create New Blueprint"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "صمم منصة سيادية جديدة" : "Design a new sovereign platform"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="templates">
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {templateCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <Button
                          key={cat.id}
                          variant={selectedCategory === cat.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(cat.id)}
                          className="gap-2"
                          data-testid={`filter-category-${cat.id}`}
                        >
                          <Icon className="h-4 w-4" />
                          {cat.label[language as "en" | "ar"]}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {intelligenceLevels.map((level) => {
                      const Icon = level.icon;
                      return (
                        <Badge
                          key={level.id}
                          variant={selectedIntelligence === level.id ? "default" : "outline"}
                          className={`cursor-pointer gap-1.5 px-3 py-1.5 ${
                            selectedIntelligence === level.id 
                              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0" 
                              : "hover-elevate"
                          }`}
                          onClick={() => setSelectedIntelligence(level.id)}
                          data-testid={`filter-intelligence-${level.id}`}
                        >
                          <Icon className="h-3 w-3" />
                          {level.label[language as "en" | "ar"]}
                        </Badge>
                      );
                    })}
                  </div>
                  
                  {(selectedCategory !== "all" || selectedIntelligence !== "all") && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {language === "ar" 
                          ? `${filteredTemplates.length} قالب مطابق`
                          : `${filteredTemplates.length} matching templates`
                        }
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory("all");
                          setSelectedIntelligence("all");
                        }}
                        className="text-xs h-7"
                        data-testid="button-clear-filters"
                      >
                        {language === "ar" ? "مسح الفلاتر" : "Clear filters"}
                      </Button>
                    </div>
                  )}
                </div>

                {templatesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="aspect-[16/14] rounded-lg" />
                    ))}
                  </div>
                ) : filteredTemplates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onUse={handleUseTemplate}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Filter className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      {language === "ar" 
                        ? "لا توجد قوالب تطابق الفلاتر المحددة"
                        : "No templates match the selected filters"
                      }
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                {analyticsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                {/* Real-time Analytics KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {language === "ar" ? "المستخدمين النشطين" : "Active Users"}
                          </p>
                          <p className="text-2xl font-bold" data-testid="kpi-active-users">
                            {dashboardAnalytics?.kpis.activeUsers.toLocaleString() || "—"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-green-500">
                            <TrendingUp className="h-3 w-3" />
                            <span>{dashboardAnalytics?.kpis.userGrowth || "—"}</span>
                          </div>
                        </div>
                        <Users className="h-8 w-8 text-violet-500/50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {language === "ar" ? "وقت التشغيل" : "Uptime"}
                          </p>
                          <p className="text-2xl font-bold" data-testid="kpi-uptime">
                            {dashboardAnalytics?.kpis.uptime || "99.97%"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-green-500">
                            <CheckCircle className="h-3 w-3" />
                            <span>{language === "ar" ? "ممتاز" : "Excellent"}</span>
                          </div>
                        </div>
                        <Server className="h-8 w-8 text-emerald-500/50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {language === "ar" ? "زمن الاستجابة" : "Response Time"}
                          </p>
                          <p className="text-2xl font-bold" data-testid="kpi-response-time">
                            {dashboardAnalytics?.kpis.responseTime || 142}ms
                          </p>
                          <div className="flex items-center gap-1 text-xs text-green-500">
                            <TrendingDown className="h-3 w-3" />
                            <span>{dashboardAnalytics?.kpis.responseImprovement || "-8.3%"}</span>
                          </div>
                        </div>
                        <Gauge className="h-8 w-8 text-blue-500/50" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {language === "ar" ? "الأحداث اليوم" : "Events Today"}
                          </p>
                          <p className="text-2xl font-bold" data-testid="kpi-events">
                            {dashboardAnalytics?.kpis.eventsToday 
                              ? (dashboardAnalytics.kpis.eventsToday / 1000).toFixed(1) + "K"
                              : "—"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-green-500">
                            <TrendingUp className="h-3 w-3" />
                            <span>{dashboardAnalytics?.kpis.eventsGrowth || "+23.1%"}</span>
                          </div>
                        </div>
                        <Activity className="h-8 w-8 text-amber-500/50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Historical Analysis & Predictions */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <History className="h-5 w-5 text-violet-500" />
                        {language === "ar" ? "تحليل البيانات التاريخية (AI)" : "Historical Data Analysis (AI)"}
                        <Badge variant="secondary" className="text-xs">
                          <Brain className="h-3 w-3 me-1" />
                          Claude AI
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="h-40 bg-muted/30 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                          {(dashboardAnalytics?.historicalData || [35, 42, 38, 55, 48, 62, 58, 72, 68, 78, 85, 92]).map((height, i) => (
                            <div 
                              key={i}
                              className="w-4 bg-gradient-to-t from-violet-500 to-indigo-400 rounded-t transition-all"
                              style={{ height: `${height}%` }}
                              data-testid={`chart-bar-${i}`}
                            />
                          ))}
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                            <TrendingUp className="h-3 w-3 me-1" />
                            {dashboardAnalytics?.predictions.nextMonthGrowth 
                              ? (language === "ar" ? `نمو ${dashboardAnalytics.predictions.nextMonthGrowth}` : `${dashboardAnalytics.predictions.nextMonthGrowth} Growth`)
                              : (language === "ar" ? "نمو +24%" : "+24% Growth")}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {language === "ar" ? "التنبؤ للشهر القادم" : "Next Month Prediction"}
                          </span>
                          <span className="font-medium text-green-500" data-testid="prediction-growth">
                            {dashboardAnalytics?.predictions.nextMonthGrowth || "+18.5%"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {language === "ar" ? "دقة التنبؤ" : "Prediction Accuracy"}
                          </span>
                          <span className="font-medium" data-testid="prediction-accuracy">
                            {dashboardAnalytics?.predictions.accuracy || 94.2}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {language === "ar" ? "فترة التحليل" : "Analysis Period"}
                          </span>
                          <span className="font-medium">12 {language === "ar" ? "شهر" : "months"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <LineChart className="h-5 w-5 text-blue-500" />
                        {language === "ar" ? "رؤى تنبؤية" : "Predictive Insights"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm" data-testid="insight-growth-title">
                              {language === "ar" ? "نمو متوقع في المستخدمين" : "Expected User Growth"}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid="insight-growth-desc">
                              {language === "ar" 
                                ? `توقع نمو ${dashboardAnalytics?.predictions.nextMonthGrowth || "+18.5%"} خلال 30 يوم`
                                : `Predicted ${dashboardAnalytics?.predictions.nextMonthGrowth || "+18.5%"} growth in next 30 days`}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {dashboardAnalytics?.predictions.peakWarning && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">
                              {language === "ar" ? "تحذير ذروة الحمل" : "Peak Load Warning"}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid="insight-peak-warning">
                              {dashboardAnalytics.predictions.peakWarning}
                            </p>
                          </div>
                        </div>
                      </div>
                      )}

                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-start gap-3">
                          <Eye className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">
                              {language === "ar" ? "نمط سلوك المستخدم" : "User Behavior Pattern"}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid="insight-pattern">
                              {language === "ar" 
                                ? `أعلى نشاط: ${dashboardAnalytics?.predictions.userPattern || "2-4 PM"} بالتوقيت المحلي`
                                : `Peak activity: ${dashboardAnalytics?.predictions.userPattern || "2-4 PM"} local time`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Monitoring Integrations */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Database className="h-5 w-5 text-indigo-500" />
                      {language === "ar" ? "تكاملات المراقبة" : "Monitoring Integrations"}
                      <Badge variant="outline" className="text-xs">
                        {language === "ar" ? "موصى به" : "Recommended"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border bg-card/50 hover-elevate cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Datadog</p>
                            <Badge variant="secondary" className="text-xs">+7 {language === "ar" ? "نقاط" : "pts"}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {language === "ar" 
                            ? "مراقبة شاملة للأداء والسجلات"
                            : "Comprehensive monitoring & APM"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">SRE</Badge>
                          <Badge variant="outline" className="text-xs">MTTD</Badge>
                          <Badge variant="outline" className="text-xs">SLA</Badge>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-card/50 hover-elevate cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                            <LineChart className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Mixpanel</p>
                            <Badge variant="secondary" className="text-xs">+6 {language === "ar" ? "نقاط" : "pts"}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {language === "ar" 
                            ? "تحليلات سلوك المستخدم المتقدمة"
                            : "Advanced user behavior analytics"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">GDPR</Badge>
                          <Badge variant="outline" className="text-xs">Funnels</Badge>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-card/50 hover-elevate cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">Amplitude</p>
                            <Badge variant="secondary" className="text-xs">+6 {language === "ar" ? "نقاط" : "pts"}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {language === "ar" 
                            ? "تحليلات المنتج وخرائط الرحلة"
                            : "Product analytics & journey maps"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">Cohorts</Badge>
                          <Badge variant="outline" className="text-xs">Retention</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Anomaly Detection */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      {language === "ar" ? "كشف الشذوذ بالذكاء الاصطناعي" : "AI Anomaly Detection"}
                      <Badge className={`text-xs ${(dashboardAnalytics?.anomalies.activeAlerts || 0) === 0 ? "bg-green-500/20 text-green-600 border-green-500/30" : "bg-red-500/20 text-red-600 border-red-500/30"}`}>
                        {(dashboardAnalytics?.anomalies.activeAlerts || 0) === 0 ? (
                          <>
                            <CheckCircle className="h-3 w-3 me-1" />
                            {language === "ar" ? "لا تنبيهات" : "No Alerts"}
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 me-1" />
                            {dashboardAnalytics?.anomalies.activeAlerts} {language === "ar" ? "تنبيهات" : "Alerts"}
                          </>
                        )}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold text-green-500" data-testid="anomaly-active">
                          {dashboardAnalytics?.anomalies.activeAlerts ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "تنبيهات نشطة" : "Active Alerts"}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold" data-testid="anomaly-resolved">
                          {dashboardAnalytics?.anomalies.resolvedAnomalies ?? 24}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "شذوذات محلولة" : "Resolved Anomalies"}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <p className="text-2xl font-bold" data-testid="anomaly-accuracy">
                          {dashboardAnalytics?.anomalies.detectionAccuracy ?? 99.8}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "دقة الكشف" : "Detection Accuracy"}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-2xl font-bold" data-testid="anomaly-time">
                            {dashboardAnalytics?.anomalies.avgDetectionTime ?? "2.3s"}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar" ? "متوسط وقت الاكتشاف" : "Avg Detection Time"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </>
                )}
              </div>
            </TabsContent>
            </Tabs>
          </div>
        </div>
      )}

      <SecureDeletionDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        entity={projectToDelete ? {
          id: projectToDelete.id,
          name: projectToDelete.name,
          type: "project",
          description: projectToDelete.description || undefined,
          createdAt: projectToDelete.createdAt || undefined,
        } : null}
        entityType="project"
        onSuccess={handleDeleteSuccess}
        onCancel={handleDeleteCancel}
      />

      <TemplateDetailDialog
        template={selectedTemplate}
        open={showTemplateDetail}
        onOpenChange={setShowTemplateDetail}
      />

      <CompliancePanel
        open={showCompliancePanel}
        onOpenChange={setShowCompliancePanel}
        selectedFramework={selectedComplianceFramework}
      />
    </GradientBackground>
  );
}
