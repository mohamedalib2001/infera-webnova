import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GradientBackground } from "@/components/gradient-background";
import { ChatInput } from "@/components/chat-input";
import { ProjectCard } from "@/components/project-card";
import { TemplateCard } from "@/components/template-card";
import { EmptyState } from "@/components/empty-state";
import { SecureDeletionDialog } from "@/components/secure-deletion-dialog";
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
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
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
  const { toast } = useToast();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: templates, isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
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
    setLocation(`/builder?template=${template.id}`);
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
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <Cpu className="h-8 w-8 text-white" />
          </div>
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
        <p className="text-lg text-muted-foreground text-center mb-8 max-w-2xl">
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
                      <Badge key={comp} variant="secondary" className="text-xs">
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
          </Tabs>
        </div>
      </div>

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
    </GradientBackground>
  );
}
