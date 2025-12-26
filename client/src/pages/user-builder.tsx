import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInput } from "@/components/chat-input";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
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

export default function UserBuilder() {
  const [, setLocation] = useLocation();
  const { t, language, isRtl } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("chat");

  const { data: templates, isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
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
                  onSubmit={handleChatSubmit}
                  data-testid="chat-input-builder"
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
                          {template.features.slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {template.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.features.length - 3}
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
