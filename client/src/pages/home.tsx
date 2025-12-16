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
    // Navigate to builder with the initial prompt
    setLocation(`/builder?prompt=${encodeURIComponent(message)}`);
  };

  const handleOpenProject = (project: Project) => {
    setLocation(`/builder/${project.id}`);
  };

  const handleDeleteProject = (project: Project) => {
    // Will implement with mutation
    console.log("Delete project:", project.id);
  };

  const handleUseTemplate = (template: Template) => {
    setLocation(`/builder?template=${template.id}`);
  };

  return (
    <GradientBackground className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4" data-testid="text-welcome">
          Let's build something amazing
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-8 max-w-md">
          Describe your website and watch AI bring it to life
        </p>
        
        <ChatInput
          onSend={handleChatSubmit}
          placeholder="Ask AI to create an internal tool..."
        />
        
        {/* Quick suggestions */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl">
          {[
            "Create a landing page for a SaaS product",
            "Build a portfolio website",
            "Design a restaurant menu page",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleChatSubmit(suggestion)}
              className="px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm text-sm text-muted-foreground hover-elevate border border-border/50 transition-all"
              data-testid={`button-suggestion-${suggestion.slice(0, 20)}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      
      {/* Projects/Templates Section */}
      <div className="bg-background/80 backdrop-blur-xl border-t">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="recent" data-testid="tab-recent">Recently viewed</TabsTrigger>
              <TabsTrigger value="projects" data-testid="tab-projects">My projects</TabsTrigger>
              <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
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
                  No templates available yet
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </GradientBackground>
  );
}
