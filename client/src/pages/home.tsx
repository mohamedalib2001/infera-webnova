import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { GradientBackground } from "@/components/gradient-background";
import { ChatInput } from "@/components/chat-input";
import { ProjectCard } from "@/components/project-card";
import { TemplateCard } from "@/components/template-card";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { Project, Template } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("recent");

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: templates, isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const handleChatSubmit = async (message: string) => {
    setLocation(`/builder?prompt=${encodeURIComponent(message)}`);
  };

  const handleOpenProject = (project: Project) => {
    setLocation(`/builder/${project.id}`);
  };

  const handleDeleteProject = (project: Project) => {
    console.log("Delete project:", project.id);
  };

  const handleUseTemplate = (template: Template) => {
    setLocation(`/builder?template=${template.id}`);
  };

  const suggestions = [
    { ar: "أنشئ صفحة هبوط لمنتج تقني", en: "Create a landing page for a tech product" },
    { ar: "صمم موقع شخصي احترافي", en: "Build a professional portfolio" },
    { ar: "أنشئ صفحة مطعم مع القائمة", en: "Design a restaurant menu page" },
    { ar: "صمم متجر إلكتروني عربي", en: "Create an Arabic e-commerce store" },
  ];

  return (
    <GradientBackground className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16" dir="rtl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              INFERA WebNova
            </h2>
            <Badge variant="secondary" className="text-xs">
              المنصة الأولى في منظومة INFERA
            </Badge>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4" data-testid="text-welcome">
          ابنِ موقعك الآن بالذكاء الاصطناعي
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-8 max-w-md">
          صِف موقعك وشاهد الذكاء الاصطناعي يحوله إلى حقيقة
        </p>
        
        <ChatInput
          onSend={handleChatSubmit}
          placeholder="اطلب من الذكاء الاصطناعي بناء موقعك... (مثال: أنشئ موقع لمكتب محاماة)"
        />
        
        <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleChatSubmit(suggestion.ar)}
              className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm text-sm text-muted-foreground hover-elevate border border-border/50 transition-all"
              data-testid={`button-suggestion-${index}`}
            >
              {suggestion.ar}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-background/80 backdrop-blur-xl border-t">
        <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="recent" data-testid="tab-recent">الأخيرة</TabsTrigger>
              <TabsTrigger value="projects" data-testid="tab-projects">مشاريعي</TabsTrigger>
              <TabsTrigger value="templates" data-testid="tab-templates">القوالب</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent">
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
            
            <TabsContent value="projects">
              {projectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="aspect-video rounded-lg" />
                  ))}
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
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
            
            <TabsContent value="templates">
              {templatesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="aspect-video rounded-lg" />
                  ))}
                </div>
              ) : templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onUse={handleUseTemplate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد قوالب متاحة حالياً
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </GradientBackground>
  );
}
