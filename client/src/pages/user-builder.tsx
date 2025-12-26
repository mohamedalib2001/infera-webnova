import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInput } from "@/components/chat-input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Building2,
  ShoppingCart,
  GraduationCap,
  HeartPulse,
  Landmark,
  Briefcase,
  Bot,
  Zap,
  Search,
  Sparkles,
  ArrowRight,
  FileCode,
  Layout,
  Database,
  Shield,
  Globe,
  Loader2,
  CheckCircle2,
  Send,
  ArrowLeft,
} from "lucide-react";
import type { Template, Project } from "@shared/schema";

const categoryIcons: Record<string, any> = {
  financial: Building2,
  ecommerce: ShoppingCart,
  education: GraduationCap,
  healthcare: HeartPulse,
  government: Landmark,
  enterprise: Briefcase,
};

const intelligenceColors: Record<string, string> = {
  basic: "from-slate-500 to-gray-500",
  standard: "from-blue-500 to-cyan-500",
  advanced: "from-violet-500 to-purple-500",
  enterprise: "from-amber-500 to-orange-500",
};

interface BuilderStep {
  id: string;
  title: string;
  titleAr: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

export default function UserBuilder() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { t, language, isRtl } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("chat");
  
  // Platform creation state
  const [isBuilding, setIsBuilding] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [buildSteps, setBuildSteps] = useState<BuilderStep[]>([]);
  
  // Parse URL parameters and consume prompt (prevents re-triggering)
  const urlParams = new URLSearchParams(searchString);
  const initialPrompt = urlParams.get('prompt');
  const [promptConsumed, setPromptConsumed] = useState(false);
  
  // Handle initial prompt from URL - consume and clear to prevent re-triggering
  useEffect(() => {
    if (initialPrompt && !isBuilding && !currentPrompt && !promptConsumed) {
      setPromptConsumed(true);
      setCurrentPrompt(initialPrompt);
      // Clear URL param to prevent re-triggering
      setLocation('/user-builder', { replace: true });
      // Start build after clearing URL
      handleStartBuild(initialPrompt);
    }
  }, [initialPrompt, isBuilding, currentPrompt, promptConsumed, setLocation]);

  // Platform creation mutation - isolated to user's workspace
  const createPlatformMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('/api/workspace/create-platform', {
        method: 'POST',
        body: JSON.stringify({ prompt, workspaceId: user?.id }),
      });
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workspace/projects'] });
      toast({
        title: language === 'ar' ? 'تم إنشاء المنصة بنجاح' : 'Platform created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: language === 'ar' ? 'فشل إنشاء المنصة' : 'Failed to create platform',
        variant: 'destructive',
      });
    },
  });
  
  // Handle platform building process
  const handleStartBuild = async (prompt: string) => {
    setIsBuilding(true);
    setAiResponse("");
    
    // Initialize build steps
    const steps: BuilderStep[] = [
      { id: 'analyze', title: 'Analyzing Request', titleAr: 'تحليل الطلب', status: 'pending', progress: 0 },
      { id: 'design', title: 'Designing Platform', titleAr: 'تصميم المنصة', status: 'pending', progress: 0 },
      { id: 'generate', title: 'Generating Code', titleAr: 'توليد الكود', status: 'pending', progress: 0 },
      { id: 'deploy', title: 'Preparing Deployment', titleAr: 'إعداد النشر', status: 'pending', progress: 0 },
    ];
    setBuildSteps(steps);
    
    // Simulate step-by-step processing
    for (let i = 0; i < steps.length; i++) {
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'processing', progress: 0 } : s
      ));
      
      // Simulate progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(r => setTimeout(r, 200));
        setBuildSteps(prev => prev.map((s, idx) => 
          idx === i ? { ...s, progress: p } : s
        ));
      }
      
      setBuildSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'completed', progress: 100 } : s
      ));
    }
    
    // Set AI response
    setAiResponse(language === 'ar' 
      ? `تم تحليل طلبك: "${prompt}"\n\nأقوم الآن بإنشاء منصتك الرقمية مع الميزات التالية:\n• تصميم متجاوب\n• أمان مؤسسي\n• قاعدة بيانات محسنة\n• واجهة مستخدم حديثة\n\nسيتم إنشاء المشروع في مساحة عملك الخاصة.`
      : `Analyzed your request: "${prompt}"\n\nI'm now creating your digital platform with the following features:\n• Responsive design\n• Enterprise security\n• Optimized database\n• Modern UI\n\nThe project will be created in your personal workspace.`
    );
    
    // Trigger actual platform creation
    try {
      await createPlatformMutation.mutateAsync(prompt);
    } catch (error) {
      console.error('Platform creation error:', error);
    }
    
    setIsBuilding(false);
  };
  
  // Cancel build and reset
  const handleCancelBuild = () => {
    setIsBuilding(false);
    setCurrentPrompt("");
    setAiResponse("");
    setBuildSteps([]);
    // Clear URL params
    setLocation('/user-builder');
  };
  
  const { data: templates, isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  // Use workspace-isolated projects for current user only
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/workspace/projects"],
    enabled: !!user, // Only fetch if user is authenticated
  });

  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    return templates.filter((tpl) => {
      const matchesSearch = searchQuery === "" || 
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || tpl.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  const handleChatSubmit = async (message: string) => {
    setLocation(`/user-builder?prompt=${encodeURIComponent(message)}`);
  };

  const handleUseTemplate = (template: Template) => {
    setLocation(`/user-builder?template=${template.id}`);
  };

  const handleOpenProject = (project: Project) => {
    setLocation(`/user-builder?project=${project.id}`);
  };

  const suggestions = [
    { 
      key: "ecommerce",
      text: language === 'ar' ? 'أنشئ متجر إلكتروني' : 'Build an e-commerce store',
      icon: ShoppingCart
    },
    { 
      key: "education",
      text: language === 'ar' ? 'منصة تعليمية تفاعلية' : 'Interactive learning platform',
      icon: GraduationCap
    },
    { 
      key: "healthcare",
      text: language === 'ar' ? 'نظام إدارة العيادات' : 'Clinic management system',
      icon: HeartPulse
    },
    { 
      key: "enterprise",
      text: language === 'ar' ? 'لوحة تحكم الأعمال' : 'Business dashboard',
      icon: Briefcase
    },
  ];

  const categories = [
    { id: "all", name: language === 'ar' ? 'الكل' : 'All' },
    { id: "financial", name: language === 'ar' ? 'المالية' : 'Financial' },
    { id: "ecommerce", name: language === 'ar' ? 'التجارة' : 'E-commerce' },
    { id: "education", name: language === 'ar' ? 'التعليم' : 'Education' },
    { id: "healthcare", name: language === 'ar' ? 'الصحة' : 'Healthcare' },
    { id: "government", name: language === 'ar' ? 'الحكومة' : 'Government' },
    { id: "enterprise", name: language === 'ar' ? 'المؤسسات' : 'Enterprise' },
  ];

  // If building, show the build progress UI
  if (isBuilding || currentPrompt) {
    return (
      <div className={cn("min-h-screen bg-background", isRtl && "rtl")} dir={isRtl ? "rtl" : "ltr"}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={handleCancelBuild}
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className={cn("h-4 w-4", isRtl ? "ml-2 rotate-180" : "mr-2")} />
            {language === 'ar' ? 'رجوع' : 'Back'}
          </Button>
          
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle data-testid="text-building-title">
                    {language === 'ar' ? 'إنشاء منصتك' : 'Building Your Platform'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'ar' ? 'مساحة عملك الشخصية' : 'Your Personal Workspace'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {language === 'ar' ? 'طلبك:' : 'Your Request:'}
                </p>
                <p className="text-foreground" data-testid="text-user-prompt">{currentPrompt}</p>
              </div>
              
              <div className="space-y-3">
                {buildSteps.map((step) => (
                  <div 
                    key={step.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-card border"
                    data-testid={`step-${step.id}`}
                  >
                    <div className="flex-shrink-0">
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : step.status === 'processing' ? (
                        <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {language === 'ar' ? step.titleAr : step.title}
                      </p>
                      {step.status === 'processing' && (
                        <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-200"
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {aiResponse && (
                <div className="mt-6 p-4 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-lg border border-violet-200/50 dark:border-violet-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                      {language === 'ar' ? 'نتيجة الذكاء الاصطناعي' : 'AI Response'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line" data-testid="text-ai-response">{aiResponse}</p>
                </div>
              )}
              
              {!isBuilding && aiResponse && (
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={() => setActiveTab("projects")}
                    className="flex-1"
                    data-testid="button-view-projects"
                  >
                    {language === 'ar' ? 'عرض مشاريعي' : 'View My Projects'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelBuild}
                    data-testid="button-new-build"
                  >
                    {language === 'ar' ? 'إنشاء جديد' : 'Create New'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", isRtl && "rtl")} dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            {language === 'ar' ? 'أنشئ مشروعك' : 'Build Your Project'}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto" data-testid="text-page-description">
            {language === 'ar' 
              ? 'استخدم الذكاء الاصطناعي لإنشاء منصتك الرقمية أو ابدأ من قالب جاهز'
              : 'Use AI to build your digital platform or start from a ready template'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="chat" data-testid="tab-chat">
              <Bot className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {language === 'ar' ? 'محادثة' : 'Chat'}
            </TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              <Layout className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {language === 'ar' ? 'قوالب' : 'Templates'}
            </TabsTrigger>
            <TabsTrigger value="projects" data-testid="tab-projects">
              <FileCode className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {language === 'ar' ? 'مشاريعي' : 'My Projects'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <Card className="border-2 border-dashed" data-testid="card-chat-input">
              <CardContent className="pt-6">
                <ChatInput
                  placeholder={language === 'ar' ? 'صف المنصة التي تريد بناءها...' : 'Describe the platform you want to build...'}
                  onSend={handleChatSubmit}
                  language={language}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {suggestions.map((suggestion) => {
                const Icon = suggestion.icon;
                return (
                  <Button
                    key={suggestion.key}
                    variant="outline"
                    className="h-auto py-3 px-4 flex flex-col items-center gap-2 hover-elevate"
                    onClick={() => handleChatSubmit(suggestion.text)}
                    data-testid={`button-suggestion-${suggestion.key}`}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-center">{suggestion.text}</span>
                  </Button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRtl ? "right-3" : "left-3")} />
                <Input
                  placeholder={language === 'ar' ? 'بحث في القوالب...' : 'Search templates...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(isRtl ? "pr-10" : "pl-10")}
                  data-testid="input-search-templates"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    data-testid={`button-category-${cat.id}`}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {templatesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => {
                  const CategoryIcon = categoryIcons[template.category] || Building2;
                  const gradientClass = intelligenceColors[template.intelligenceLevel] || intelligenceColors.standard;
                  
                  return (
                    <Card key={template.id} className="overflow-hidden hover-elevate group" data-testid={`card-template-${template.id}`}>
                      <div className={cn("h-2 bg-gradient-to-r", gradientClass)} />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", gradientClass)}>
                              <CategoryIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {language === 'ar' ? template.nameAr : template.name}
                              </CardTitle>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {template.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm line-clamp-2 mb-4">
                          {language === 'ar' ? template.descriptionAr : template.description}
                        </CardDescription>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {(template.features || []).slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {(template.features?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.features!.length - 3}
                            </Badge>
                          )}
                        </div>

                        <Button 
                          className="w-full group"
                          onClick={() => handleUseTemplate(template)}
                          data-testid={`button-use-template-${template.id}`}
                        >
                          {language === 'ar' ? 'استخدم القالب' : 'Use Template'}
                          <ArrowRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", isRtl && "rotate-180 group-hover:-translate-x-1")} />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {!templatesLoading && filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2" data-testid="text-no-templates">
                  {language === 'ar' ? 'لم يتم العثور على قوالب' : 'No templates found'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'جرب البحث بكلمات مختلفة' : 'Try searching with different keywords'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {projectsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="overflow-hidden hover-elevate group" data-testid={`card-project-${project.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                            <FileCode className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base" data-testid={`text-project-name-${project.id}`}>{project.name}</CardTitle>
                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-xs mt-1" data-testid={`badge-project-status-${project.id}`}>
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm line-clamp-2 mb-4">
                        {project.description}
                      </CardDescription>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <Globe className="h-3 w-3" />
                        <span>{project.sector}</span>
                        <span className="mx-1">•</span>
                        <Database className="h-3 w-3" />
                        <span>{project.database}</span>
                      </div>

                      <Button 
                        className="w-full group"
                        onClick={() => handleOpenProject(project)}
                        data-testid={`button-open-project-${project.id}`}
                      >
                        {language === 'ar' ? 'فتح المشروع' : 'Open Project'}
                        <ArrowRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", isRtl && "rotate-180 group-hover:-translate-x-1")} />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <FileCode className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2" data-testid="text-no-projects">
                  {language === 'ar' ? 'لا توجد مشاريع بعد' : 'No projects yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === 'ar' ? 'ابدأ بإنشاء مشروعك الأول' : 'Start by creating your first project'}
                </p>
                <Button onClick={() => setActiveTab("chat")} data-testid="button-start-project">
                  {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
