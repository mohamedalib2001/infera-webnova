import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  Smartphone, 
  Monitor, 
  Rocket, 
  Download, 
  CheckCircle2, 
  Loader2,
  Code,
  Package,
  Layers,
  ArrowRight
} from "lucide-react";

interface DevProject {
  id: number;
  name: string;
  description: string | null;
  projectType: string;
  isPublished: boolean;
  publishedUrl: string | null;
}

interface GenerationResult {
  success: boolean;
  message: string;
  code?: any;
  platform?: any;
}

export default function PlatformGenerator() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("");

  const translations = {
    ar: {
      title: "مولّد المنصات",
      subtitle: "أنشئ منصة رقمية كاملة: ويب + جوال + سطح مكتب",
      selectProject: "اختر المشروع",
      noProjects: "لا توجد مشاريع",
      createFirst: "أنشئ مشروعاً أولاً في Cloud IDE",
      
      webPlatform: "منصة الويب",
      webDesc: "انشر موقعك على الإنترنت مع نطاق مخصص",
      deploy: "نشر الآن",
      deploying: "جاري النشر...",
      deployed: "تم النشر",
      visitSite: "زيارة الموقع",
      
      mobileApp: "تطبيق الجوال",
      mobileDesc: "تطبيق React Native لـ iOS و Android",
      generate: "توليد الكود",
      generating: "جاري التوليد...",
      download: "تحميل الملفات",
      
      desktopApp: "تطبيق سطح المكتب",
      desktopDesc: "تطبيق Electron لـ Windows و Mac و Linux",
      
      fullPlatform: "المنصة الكاملة",
      fullPlatformDesc: "توليد جميع المنصات دفعة واحدة",
      generateAll: "توليد الكل",
      
      steps: {
        analyzing: "تحليل المشروع...",
        generating: "توليد الكود...",
        packaging: "تجهيز الملفات...",
        done: "تم بنجاح!",
      },
      
      success: "نجاح",
      error: "خطأ",
      projectRequired: "يرجى اختيار مشروع أولاً",
    },
    en: {
      title: "Platform Generator",
      subtitle: "Create a complete digital platform: Web + Mobile + Desktop",
      selectProject: "Select Project",
      noProjects: "No projects found",
      createFirst: "Create a project first in Cloud IDE",
      
      webPlatform: "Web Platform",
      webDesc: "Publish your website with a custom domain",
      deploy: "Deploy Now",
      deploying: "Deploying...",
      deployed: "Deployed",
      visitSite: "Visit Site",
      
      mobileApp: "Mobile App",
      mobileDesc: "React Native app for iOS and Android",
      generate: "Generate Code",
      generating: "Generating...",
      download: "Download Files",
      
      desktopApp: "Desktop App",
      desktopDesc: "Electron app for Windows, Mac, and Linux",
      
      fullPlatform: "Full Platform",
      fullPlatformDesc: "Generate all platforms at once",
      generateAll: "Generate All",
      
      steps: {
        analyzing: "Analyzing project...",
        generating: "Generating code...",
        packaging: "Packaging files...",
        done: "Done!",
      },
      
      success: "Success",
      error: "Error",
      projectRequired: "Please select a project first",
    },
  };

  const text = translations[language];

  const { data: projects = [], isLoading: loadingProjects } = useQuery<DevProject[]>({
    queryKey: ["/api/dev-projects"],
  });

  const deployMutation = useMutation({
    mutationFn: async (projectId: number) => {
      setGenerationProgress(0);
      setCurrentStep(text.steps.analyzing);
      
      await new Promise(r => setTimeout(r, 500));
      setGenerationProgress(30);
      setCurrentStep(text.steps.generating);
      
      const result = await apiRequest("POST", `/api/dev-projects/${projectId}/deploy`, {
        targetPlatform: "web",
        environment: "production",
      });
      
      setGenerationProgress(80);
      setCurrentStep(text.steps.packaging);
      
      await new Promise(r => setTimeout(r, 500));
      setGenerationProgress(100);
      setCurrentStep(text.steps.done);
      
      return result.json();
    },
    onSuccess: (data) => {
      toast({
        title: text.success,
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects"] });
    },
    onError: (error: Error) => {
      toast({
        title: text.error,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const mobileMutation = useMutation({
    mutationFn: async (projectId: number) => {
      setGenerationProgress(0);
      setCurrentStep(text.steps.analyzing);
      
      await new Promise(r => setTimeout(r, 500));
      setGenerationProgress(40);
      setCurrentStep(text.steps.generating);
      
      const result = await apiRequest("POST", `/api/dev-projects/${projectId}/generate/mobile`);
      
      setGenerationProgress(100);
      setCurrentStep(text.steps.done);
      
      return result.json();
    },
    onSuccess: (data) => {
      toast({
        title: text.success,
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: text.error,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const desktopMutation = useMutation({
    mutationFn: async (projectId: number) => {
      setGenerationProgress(0);
      setCurrentStep(text.steps.analyzing);
      
      await new Promise(r => setTimeout(r, 500));
      setGenerationProgress(40);
      setCurrentStep(text.steps.generating);
      
      const result = await apiRequest("POST", `/api/dev-projects/${projectId}/generate/desktop`);
      
      setGenerationProgress(100);
      setCurrentStep(text.steps.done);
      
      return result.json();
    },
    onSuccess: (data) => {
      toast({
        title: text.success,
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: text.error,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fullPlatformMutation = useMutation({
    mutationFn: async (projectId: number) => {
      setGenerationProgress(0);
      setCurrentStep(text.steps.analyzing);
      
      await new Promise(r => setTimeout(r, 300));
      setGenerationProgress(20);
      setCurrentStep(text.steps.generating);
      
      const result = await apiRequest("POST", `/api/dev-projects/${projectId}/generate/full-platform`);
      
      setGenerationProgress(90);
      setCurrentStep(text.steps.packaging);
      
      await new Promise(r => setTimeout(r, 300));
      setGenerationProgress(100);
      setCurrentStep(text.steps.done);
      
      return result.json();
    },
    onSuccess: (data) => {
      toast({
        title: text.success,
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: text.error,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAction = (action: "deploy" | "mobile" | "desktop" | "full") => {
    if (!selectedProject) {
      toast({
        title: text.error,
        description: text.projectRequired,
        variant: "destructive",
      });
      return;
    }

    const projectId = parseInt(selectedProject);
    
    switch (action) {
      case "deploy":
        deployMutation.mutate(projectId);
        break;
      case "mobile":
        mobileMutation.mutate(projectId);
        break;
      case "desktop":
        desktopMutation.mutate(projectId);
        break;
      case "full":
        fullPlatformMutation.mutate(projectId);
        break;
    }
  };

  const selectedProjectData = projects.find(p => p.id.toString() === selectedProject);
  const isAnyLoading = deployMutation.isPending || mobileMutation.isPending || 
                       desktopMutation.isPending || fullPlatformMutation.isPending;

  return (
    <div className="container mx-auto p-6 max-w-6xl" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">{text.title}</h1>
        <p className="text-muted-foreground" data-testid="text-page-subtitle">{text.subtitle}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            {text.selectProject}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingProjects ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{language === "ar" ? "جاري التحميل..." : "Loading..."}</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{text.noProjects}</p>
              <p className="text-sm mb-4">{text.createFirst}</p>
              <Button 
                variant="default"
                onClick={() => window.location.href = "/cloud-ide"}
                data-testid="button-go-to-ide"
              >
                <Code className="w-4 h-4 mr-2" />
                {language === "ar" ? "انتقل إلى Cloud IDE" : "Go to Cloud IDE"}
              </Button>
            </div>
          ) : (
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full max-w-md" data-testid="select-project">
                <SelectValue placeholder={text.selectProject} />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()} data-testid={`select-item-project-${project.id}`}>
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      <span>{project.name}</span>
                      {project.isPublished && (
                        <Badge variant="secondary">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {text.deployed}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {isAnyLoading && (
        <Card className="mb-6 border-primary">
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="font-medium">{currentStep}</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover-elevate transition-all">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle>{text.webPlatform}</CardTitle>
                  <CardDescription>{text.webDesc}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedProjectData?.isPublished && selectedProjectData?.publishedUrl && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">{text.deployed}</span>
                  </div>
                  <a 
                    href={selectedProjectData.publishedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline mt-1 block"
                    data-testid="link-published-url"
                  >
                    {selectedProjectData.publishedUrl}
                  </a>
                </div>
              )}
              <Button 
                onClick={() => handleAction("deploy")}
                disabled={!selectedProject || deployMutation.isPending}
                className="w-full"
                data-testid="button-deploy-web"
              >
                {deployMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {text.deploying}
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    {text.deploy}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Smartphone className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <CardTitle>{text.mobileApp}</CardTitle>
                <CardDescription>{text.mobileDesc}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => handleAction("mobile")}
                disabled={!selectedProject || mobileMutation.isPending}
                className="w-full"
                data-testid="button-generate-mobile"
              >
                {mobileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {text.generating}
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4" />
                    {text.generate}
                  </>
                )}
              </Button>
              {mobileMutation.isSuccess && (
                <Button variant="outline" className="w-full" data-testid="button-download-mobile">
                  <Download className="w-4 h-4" />
                  {text.download}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Monitor className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <CardTitle>{text.desktopApp}</CardTitle>
                <CardDescription>{text.desktopDesc}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => handleAction("desktop")}
                disabled={!selectedProject || desktopMutation.isPending}
                className="w-full"
                data-testid="button-generate-desktop"
              >
                {desktopMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {text.generating}
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4" />
                    {text.generate}
                  </>
                )}
              </Button>
              {desktopMutation.isSuccess && (
                <Button variant="outline" className="w-full" data-testid="button-download-desktop">
                  <Download className="w-4 h-4" />
                  {text.download}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>{text.fullPlatform}</CardTitle>
                <CardDescription>{text.fullPlatformDesc}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => handleAction("full")}
              disabled={!selectedProject || fullPlatformMutation.isPending}
              className="w-full"
              variant="default"
              data-testid="button-generate-full"
            >
              {fullPlatformMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {text.generating}
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  {text.generateAll}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
