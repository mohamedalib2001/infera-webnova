import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AppCodeEditor } from "@/components/app-builder/AppCodeEditor";
import { AppLivePreview } from "@/components/app-builder/AppLivePreview";
import { 
  Monitor, 
  Laptop,
  Code2,
  Palette,
  Settings,
  Rocket,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  Brain,
  Zap,
  Shield,
  Globe,
  Bell,
  HardDrive,
  Cpu,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Layers,
  Layout,
  FileCode,
  TestTube,
  Upload,
  Play,
  Box,
  Database,
  Terminal
} from "lucide-react";
import { SiApple, SiLinux, SiElectron, SiRust, SiPython } from "react-icons/si";

const translations = {
  ar: {
    title: "منشئ تطبيقات سطح المكتب",
    subtitle: "صمم وطوّر تطبيقات Windows و Mac و Linux بالذكاء الاصطناعي",
    newProject: "مشروع جديد",
    projectName: "اسم التطبيق",
    projectNamePlaceholder: "أدخل اسم التطبيق",
    description: "وصف التطبيق",
    descriptionPlaceholder: "صف ما يفعله تطبيقك...",
    platform: "المنصة المستهدفة",
    all: "Windows و Mac و Linux",
    windows: "Windows فقط",
    mac: "macOS فقط",
    linux: "Linux فقط",
    framework: "إطار العمل",
    electron: "Electron",
    tauri: "Tauri (Rust)",
    pyqt: "PyQt (Python)",
    features: "الميزات",
    autoUpdate: "التحديث التلقائي",
    systemTray: "أيقونة النظام",
    fileAccess: "الوصول للملفات",
    database: "قاعدة بيانات محلية",
    notifications: "الإشعارات",
    darkMode: "الوضع الداكن",
    create: "إنشاء التطبيق",
    creating: "جاري الإنشاء...",
    myApps: "تطبيقاتي",
    templates: "القوالب",
    aiAssistant: "المساعد الذكي",
    preview: "معاينة",
    build: "بناء",
    publish: "نشر",
    settings: "الإعدادات",
    design: "التصميم",
    code: "الكود",
    test: "الاختبار",
    noApps: "لا توجد تطبيقات بعد",
    startBuilding: "ابدأ ببناء تطبيقك الأول",
    status: {
      draft: "مسودة",
      building: "قيد البناء",
      testing: "قيد الاختبار",
      ready: "جاهز للنشر",
      published: "منشور"
    },
    tabs: {
      overview: "نظرة عامة",
      design: "التصميم",
      features: "الميزات",
      code: "الكود",
      preview: "المعاينة",
      build: "البناء"
    },
    aiSuggestions: "اقتراحات الذكاء الاصطناعي",
    generateUI: "توليد الواجهة بالذكاء الاصطناعي",
    optimizePerformance: "تحسين الأداء",
    securityScan: "فحص الأمان",
    appIcon: "أيقونة التطبيق",
    windowSettings: "إعدادات النافذة",
    colorScheme: "نظام الألوان",
    primaryColor: "اللون الرئيسي",
    buildStatus: "حالة البناء",
    downloadExe: "تحميل EXE",
    downloadDmg: "تحميل DMG",
    downloadDeb: "تحميل DEB",
    downloadAppImage: "تحميل AppImage",
    windowsStore: "Microsoft Store",
    macAppStore: "Mac App Store",
    snapStore: "Snap Store",
    installerType: "نوع المثبت",
    portable: "محمول (بدون تثبيت)",
    installer: "مع مثبت",
    appx: "APPX (Windows Store)",
    minWidth: "العرض الأدنى",
    minHeight: "الارتفاع الأدنى",
    resizable: "قابل لتغيير الحجم",
    fullscreen: "ملء الشاشة"
  },
  en: {
    title: "Desktop App Builder",
    subtitle: "Design and develop Windows, Mac & Linux apps with AI",
    newProject: "New Project",
    projectName: "App Name",
    projectNamePlaceholder: "Enter app name",
    description: "App Description",
    descriptionPlaceholder: "Describe what your app does...",
    platform: "Target Platform",
    all: "Windows, Mac & Linux",
    windows: "Windows Only",
    mac: "macOS Only",
    linux: "Linux Only",
    framework: "Framework",
    electron: "Electron",
    tauri: "Tauri (Rust)",
    pyqt: "PyQt (Python)",
    features: "Features",
    autoUpdate: "Auto Update",
    systemTray: "System Tray",
    fileAccess: "File Access",
    database: "Local Database",
    notifications: "Notifications",
    darkMode: "Dark Mode",
    create: "Create App",
    creating: "Creating...",
    myApps: "My Apps",
    templates: "Templates",
    aiAssistant: "AI Assistant",
    preview: "Preview",
    build: "Build",
    publish: "Publish",
    settings: "Settings",
    design: "Design",
    code: "Code",
    test: "Test",
    noApps: "No apps yet",
    startBuilding: "Start building your first app",
    status: {
      draft: "Draft",
      building: "Building",
      testing: "Testing",
      ready: "Ready to Publish",
      published: "Published"
    },
    tabs: {
      overview: "Overview",
      design: "Design",
      features: "Features",
      code: "Code",
      preview: "Preview",
      build: "Build"
    },
    aiSuggestions: "AI Suggestions",
    generateUI: "Generate UI with AI",
    optimizePerformance: "Optimize Performance",
    securityScan: "Security Scan",
    appIcon: "App Icon",
    windowSettings: "Window Settings",
    colorScheme: "Color Scheme",
    primaryColor: "Primary Color",
    buildStatus: "Build Status",
    downloadExe: "Download EXE",
    downloadDmg: "Download DMG",
    downloadDeb: "Download DEB",
    downloadAppImage: "Download AppImage",
    windowsStore: "Microsoft Store",
    macAppStore: "Mac App Store",
    snapStore: "Snap Store",
    installerType: "Installer Type",
    portable: "Portable (No Install)",
    installer: "With Installer",
    appx: "APPX (Windows Store)",
    minWidth: "Min Width",
    minHeight: "Min Height",
    resizable: "Resizable",
    fullscreen: "Fullscreen"
  }
};

const appTemplates = [
  { id: "productivity", name: "Productivity Tool", nameAr: "أداة إنتاجية", icon: Zap, color: "#f59e0b" },
  { id: "media", name: "Media Player", nameAr: "مشغل وسائط", icon: Play, color: "#3b82f6" },
  { id: "editor", name: "Code Editor", nameAr: "محرر أكواد", icon: FileCode, color: "#10b981" },
  { id: "dashboard", name: "Dashboard", nameAr: "لوحة تحكم", icon: Layout, color: "#8b5cf6" },
  { id: "database", name: "Database Manager", nameAr: "مدير قواعد بيانات", icon: Database, color: "#ef4444" },
  { id: "terminal", name: "Terminal App", nameAr: "تطبيق طرفية", icon: Terminal, color: "#06b6d4" },
];

interface AppProject {
  id: string;
  name: string;
  description: string | null;
  type: string;
  platform: string;
  framework: string;
  primaryColor: string | null;
  features: Record<string, boolean> | null;
  status: string;
  buildProgress: number | null;
  aiGeneratedSpecs: unknown | null;
  createdAt: string;
  updatedAt: string;
}

interface AIGeneratedSpecs {
  screens?: Array<{ name: string; description: string; components: string[] }>;
  codeFiles?: Array<{ path: string; content: string; language: string }>;
  dataModels?: Array<{ name: string; fields: string[] }>;
  apiEndpoints?: Array<{ method: string; path: string; description: string }>;
}

function parseAISpecs(specs: unknown): AIGeneratedSpecs {
  if (!specs) return {};
  if (typeof specs === 'string') {
    try {
      return JSON.parse(specs);
    } catch {
      return {};
    }
  }
  if (typeof specs === 'object') {
    return specs as AIGeneratedSpecs;
  }
  return {};
}

export default function DesktopAppBuilder() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProject, setSelectedProject] = useState<AppProject | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  
  const [newApp, setNewApp] = useState({
    name: "",
    description: "",
    platform: "all",
    framework: "electron",
    features: {
      autoUpdate: true,
      systemTray: true,
      fileAccess: true,
      database: false,
      notifications: true,
      darkMode: true,
    },
    window: {
      minWidth: 800,
      minHeight: 600,
      resizable: true,
      fullscreen: false,
    },
    primaryColor: "#6366f1"
  });

  const { data: desktopProjects = [], isLoading: isLoadingProjects } = useQuery<AppProject[]>({
    queryKey: ['/api/app-projects', { type: 'desktop' }],
    queryFn: async () => {
      const res = await fetch('/api/app-projects?type=desktop');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newApp) => {
      const res = await apiRequest('POST', '/api/app-projects', {
        name: data.name,
        description: data.description,
        platform: data.platform,
        framework: data.framework,
        features: data.features,
        windowSettings: data.window,
        primaryColor: data.primaryColor,
        type: 'desktop'
      });
      return res.json();
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects', { type: 'desktop' }] });
      toast({ 
        title: language === "ar" ? "تم إنشاء التطبيق بنجاح!" : "App created successfully!",
        description: language === "ar" ? "يمكنك الآن البدء في التطوير" : "You can now start developing"
      });
      setSelectedProject(project);
      setNewApp({
        name: "",
        description: "",
        platform: "all",
        framework: "electron",
        features: {
          autoUpdate: true,
          systemTray: true,
          fileAccess: true,
          database: false,
          notifications: true,
          darkMode: true,
        },
        window: {
          minWidth: 800,
          minHeight: 600,
          resizable: true,
          fullscreen: false,
        },
        primaryColor: "#6366f1"
      });
    },
    onError: () => {
      toast({ 
        title: language === "ar" ? "فشل إنشاء التطبيق" : "Failed to create app",
        variant: "destructive" 
      });
    }
  });

  const generateAIMutation = useMutation({
    mutationFn: async ({ projectId, prompt, generationType }: { projectId: string; prompt: string; generationType: string }) => {
      const res = await apiRequest('POST', `/api/app-projects/${projectId}/generate`, {
        prompt,
        generationType
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects', { type: 'desktop' }] });
      toast({ 
        title: language === "ar" ? "تم التوليد بنجاح!" : "Generation complete!",
        description: language === "ar" ? `تم استخدام ${data.tokensUsed} توكن` : `Used ${data.tokensUsed} tokens`
      });
      setAiPrompt("");
    },
    onError: () => {
      toast({ 
        title: language === "ar" ? "فشل التوليد بالذكاء الاصطناعي" : "AI generation failed",
        variant: "destructive" 
      });
    }
  });

  const buildMutation = useMutation({
    mutationFn: async ({ projectId, platform }: { projectId: string; platform: string }) => {
      const res = await apiRequest('POST', `/api/app-projects/${projectId}/build`, { platform });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects', { type: 'desktop' }] });
      toast({ 
        title: language === "ar" ? "بدأ البناء!" : "Build started!",
        description: language === "ar" ? "سيتم إشعارك عند الانتهاء" : "You'll be notified when complete"
      });
    }
  });

  const handleCreate = async () => {
    if (!newApp.name.trim()) {
      toast({ 
        title: language === "ar" ? "يرجى إدخال اسم التطبيق" : "Please enter app name",
        variant: "destructive" 
      });
      return;
    }
    createMutation.mutate(newApp);
  };

  const handleGenerateUI = () => {
    if (!selectedProject) {
      toast({ title: language === "ar" ? "اختر مشروعاً أولاً" : "Select a project first", variant: "destructive" });
      return;
    }
    generateAIMutation.mutate({
      projectId: selectedProject.id,
      prompt: aiPrompt || `Generate a complete desktop UI design for ${selectedProject.name}`,
      generationType: 'ui'
    });
  };

  const handleOptimize = () => {
    if (!selectedProject) return;
    generateAIMutation.mutate({
      projectId: selectedProject.id,
      prompt: "Optimize the desktop app for better performance",
      generationType: 'optimize'
    });
  };

  const handleSecurityScan = () => {
    if (!selectedProject) return;
    generateAIMutation.mutate({
      projectId: selectedProject.id,
      prompt: "Perform a security analysis and suggest improvements",
      generationType: 'security'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Monitor className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-desktop-builder-title">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Monitor className="h-3 w-3 text-blue-500" />
              Windows
            </Badge>
            <Badge variant="outline" className="gap-1">
              <SiApple className="h-3 w-3" />
              macOS
            </Badge>
            <Badge variant="outline" className="gap-1">
              <SiLinux className="h-3 w-3 text-orange-500" />
              Linux
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 max-w-2xl">
            <TabsTrigger value="overview" data-testid="tab-overview">{t.tabs.overview}</TabsTrigger>
            <TabsTrigger value="design" data-testid="tab-design">{t.tabs.design}</TabsTrigger>
            <TabsTrigger value="features" data-testid="tab-features">{t.tabs.features}</TabsTrigger>
            <TabsTrigger value="code" data-testid="tab-code">{t.tabs.code}</TabsTrigger>
            <TabsTrigger value="preview" data-testid="tab-preview">{t.tabs.preview}</TabsTrigger>
            <TabsTrigger value="build" data-testid="tab-build">{t.tabs.build}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {t.newProject}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "أنشئ تطبيق سطح مكتب جديد" : "Create a new desktop app"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t.projectName}</Label>
                    <Input
                      placeholder={t.projectNamePlaceholder}
                      value={newApp.name}
                      onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                      data-testid="input-app-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t.description}</Label>
                    <Textarea
                      placeholder={t.descriptionPlaceholder}
                      value={newApp.description}
                      onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
                      data-testid="input-app-description"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t.platform}</Label>
                    <Select value={newApp.platform} onValueChange={(v) => setNewApp({ ...newApp, platform: v })}>
                      <SelectTrigger data-testid="select-platform">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.all}</SelectItem>
                        <SelectItem value="windows">{t.windows}</SelectItem>
                        <SelectItem value="mac">{t.mac}</SelectItem>
                        <SelectItem value="linux">{t.linux}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t.framework}</Label>
                    <Select value={newApp.framework} onValueChange={(v) => setNewApp({ ...newApp, framework: v })}>
                      <SelectTrigger data-testid="select-framework">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electron">
                          <div className="flex items-center gap-2">
                            <SiElectron className="h-4 w-4 text-cyan-500" />
                            {t.electron}
                          </div>
                        </SelectItem>
                        <SelectItem value="tauri">
                          <div className="flex items-center gap-2">
                            <SiRust className="h-4 w-4 text-orange-500" />
                            {t.tauri}
                          </div>
                        </SelectItem>
                        <SelectItem value="pyqt">
                          <div className="flex items-center gap-2">
                            <SiPython className="h-4 w-4 text-yellow-500" />
                            {t.pyqt}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full gap-2" 
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    data-testid="button-create-app"
                  >
                    {createMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        {t.creating}
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4" />
                        {t.create}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    {t.aiAssistant}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "دع الذكاء الاصطناعي يساعدك" : "Let AI help you build"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Textarea
                      placeholder={language === "ar" ? "صف ما تريد أن يولده الذكاء الاصطناعي..." : "Describe what you want AI to generate..."}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="min-h-[80px]"
                      data-testid="input-ai-prompt"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2" 
                    onClick={handleGenerateUI}
                    disabled={generateAIMutation.isPending || !selectedProject}
                    data-testid="button-generate-ui"
                  >
                    {generateAIMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                    )}
                    {t.generateUI}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2" 
                    onClick={handleOptimize}
                    disabled={generateAIMutation.isPending || !selectedProject}
                    data-testid="button-optimize"
                  >
                    <Zap className="h-4 w-4 text-orange-500" />
                    {t.optimizePerformance}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2" 
                    onClick={handleSecurityScan}
                    disabled={generateAIMutation.isPending || !selectedProject}
                    data-testid="button-security"
                  >
                    <Shield className="h-4 w-4 text-green-500" />
                    {t.securityScan}
                  </Button>
                  {!selectedProject && (
                    <p className="text-xs text-muted-foreground text-center">
                      {language === "ar" ? "أنشئ مشروعاً أولاً لاستخدام الذكاء الاصطناعي" : "Create a project first to use AI features"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  {t.myApps}
                </CardTitle>
                <CardDescription>
                  {language === "ar" ? "مشاريعك المحفوظة" : "Your saved projects"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : desktopProjects.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t.noApps}</p>
                    <p className="text-sm">{t.startBuilding}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {desktopProjects.map((project) => (
                      <Card 
                        key={project.id} 
                        className={`cursor-pointer hover-elevate ${selectedProject?.id === project.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedProject(project)}
                        data-testid={`project-${project.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg" 
                              style={{ backgroundColor: `${project.primaryColor || '#6366f1'}20` }}
                            >
                              <Monitor className="h-5 w-5" style={{ color: project.primaryColor || '#6366f1' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{project.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {project.framework}
                                </Badge>
                                <Badge 
                                  variant={project.status === 'ready' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {t.status[project.status as keyof typeof t.status] || project.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {project.buildProgress !== null && project.buildProgress > 0 && project.buildProgress < 100 && (
                            <Progress value={project.buildProgress} className="mt-2" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  {t.templates}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {appTemplates.map((template) => (
                    <Card 
                      key={template.id} 
                      className="cursor-pointer hover-elevate"
                      onClick={() => setNewApp({ ...newApp, name: language === "ar" ? template.nameAr : template.name })}
                      data-testid={`template-${template.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-lg" 
                            style={{ backgroundColor: `${template.color}20` }}
                          >
                            <template.icon className="h-5 w-5" style={{ color: template.color }} />
                          </div>
                          <div>
                            <p className="font-medium">{language === "ar" ? template.nameAr : template.name}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="design" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    {t.colorScheme}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t.primaryColor}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newApp.primaryColor}
                        onChange={(e) => setNewApp({ ...newApp, primaryColor: e.target.value })}
                        className="h-10 w-20 rounded cursor-pointer"
                        data-testid="input-color"
                      />
                      <Input 
                        value={newApp.primaryColor} 
                        onChange={(e) => setNewApp({ ...newApp, primaryColor: e.target.value })}
                        className="w-32"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>{t.appIcon}</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "اسحب الأيقونة هنا أو انقر للرفع" : "Drag icon here or click to upload"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t.windowSettings}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t.minWidth}</Label>
                      <Input
                        type="number"
                        value={newApp.window.minWidth}
                        onChange={(e) => setNewApp({ 
                          ...newApp, 
                          window: { ...newApp.window, minWidth: parseInt(e.target.value) || 0 }
                        })}
                        data-testid="input-min-width"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.minHeight}</Label>
                      <Input
                        type="number"
                        value={newApp.window.minHeight}
                        onChange={(e) => setNewApp({ 
                          ...newApp, 
                          window: { ...newApp.window, minHeight: parseInt(e.target.value) || 0 }
                        })}
                        data-testid="input-min-height"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>{t.resizable}</Label>
                    <Switch
                      checked={newApp.window.resizable}
                      onCheckedChange={(checked) => setNewApp({
                        ...newApp,
                        window: { ...newApp.window, resizable: checked }
                      })}
                      data-testid="switch-resizable"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>{t.fullscreen}</Label>
                    <Switch
                      checked={newApp.window.fullscreen}
                      onCheckedChange={(checked) => setNewApp({
                        ...newApp,
                        window: { ...newApp.window, fullscreen: checked }
                      })}
                      data-testid="switch-fullscreen"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  {t.preview}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mx-auto max-w-2xl">
                  <div className="bg-muted rounded-t-lg p-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 text-center text-sm text-muted-foreground">
                      {newApp.name || (language === "ar" ? "اسم التطبيق" : "App Name")}
                    </div>
                  </div>
                  <div className="border-x border-b rounded-b-lg overflow-hidden">
                    <div 
                      className="h-12 flex items-center px-4 text-white text-sm font-medium"
                      style={{ backgroundColor: newApp.primaryColor }}
                    >
                      {language === "ar" ? "شريط الأدوات" : "Toolbar"}
                    </div>
                    <div className="h-64 bg-background p-4">
                      <div className="grid grid-cols-3 gap-4 h-full">
                        <div className="bg-muted rounded-lg" />
                        <div className="col-span-2 bg-muted rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.features}</CardTitle>
                <CardDescription>
                  {language === "ar" ? "اختر الميزات التي تريدها في تطبيقك" : "Choose features for your app"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { key: "autoUpdate", icon: RefreshCw, label: t.autoUpdate },
                    { key: "systemTray", icon: Box, label: t.systemTray },
                    { key: "fileAccess", icon: HardDrive, label: t.fileAccess },
                    { key: "database", icon: Database, label: t.database },
                    { key: "notifications", icon: Bell, label: t.notifications },
                    { key: "darkMode", icon: Palette, label: t.darkMode },
                  ].map((feature) => (
                    <div 
                      key={feature.key} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <feature.icon className="h-5 w-5 text-muted-foreground" />
                        <span>{feature.label}</span>
                      </div>
                      <Switch
                        checked={newApp.features[feature.key as keyof typeof newApp.features]}
                        onCheckedChange={(checked) => 
                          setNewApp({
                            ...newApp,
                            features: { ...newApp.features, [feature.key]: checked }
                          })
                        }
                        data-testid={`switch-${feature.key}`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  {language === "ar" ? "محرر الكود" : "Code Editor"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "عرض وتعديل الكود المُولَّد بالذكاء الاصطناعي" 
                    : "View and edit AI-generated code"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppCodeEditor
                  files={parseAISpecs(selectedProject?.aiGeneratedSpecs).codeFiles || []}
                  language={language}
                  readOnly={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {language === "ar" ? "معاينة التطبيق" : "App Preview"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "معاينة حية لشاشات التطبيق المُولَّدة" 
                    : "Live preview of generated app screens"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppLivePreview
                  projectName={selectedProject?.name || newApp.name || "My App"}
                  screens={parseAISpecs(selectedProject?.aiGeneratedSpecs).screens || []}
                  primaryColor={selectedProject?.primaryColor || newApp.primaryColor}
                  language={language}
                  type="desktop"
                  framework={selectedProject?.framework || newApp.framework}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="build" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-blue-500" />
                    Windows Build
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.buildStatus}</span>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {language === "ar" ? "جاهز" : "Ready"}
                    </Badge>
                  </div>
                  <Progress value={0} />
                  <div className="flex flex-col gap-2">
                    <Button className="w-full gap-2" data-testid="button-build-windows">
                      <Play className="h-4 w-4" />
                      {t.build}
                    </Button>
                    <Button variant="outline" className="w-full gap-2" data-testid="button-download-exe">
                      <Download className="h-4 w-4" />
                      EXE
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SiApple className="h-5 w-5" />
                    macOS Build
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.buildStatus}</span>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {language === "ar" ? "جاهز" : "Ready"}
                    </Badge>
                  </div>
                  <Progress value={0} />
                  <div className="flex flex-col gap-2">
                    <Button className="w-full gap-2" data-testid="button-build-mac">
                      <Play className="h-4 w-4" />
                      {t.build}
                    </Button>
                    <Button variant="outline" className="w-full gap-2" data-testid="button-download-dmg">
                      <Download className="h-4 w-4" />
                      DMG
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SiLinux className="h-5 w-5 text-orange-500" />
                    Linux Build
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t.buildStatus}</span>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {language === "ar" ? "جاهز" : "Ready"}
                    </Badge>
                  </div>
                  <Progress value={0} />
                  <div className="flex flex-col gap-2">
                    <Button className="w-full gap-2" data-testid="button-build-linux">
                      <Play className="h-4 w-4" />
                      {t.build}
                    </Button>
                    <Button variant="outline" className="w-full gap-2" data-testid="button-download-appimage">
                      <Download className="h-4 w-4" />
                      AppImage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t.publish}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Button variant="outline" className="h-auto p-4 justify-start gap-3" data-testid="button-microsoft-store">
                    <Monitor className="h-8 w-8 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium">{t.windowsStore}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "نشر على Microsoft Store" : "Publish to Microsoft Store"}
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 justify-start gap-3" data-testid="button-mac-app-store">
                    <SiApple className="h-8 w-8" />
                    <div className="text-left">
                      <p className="font-medium">{t.macAppStore}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "نشر على Mac App Store" : "Publish to Mac App Store"}
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 justify-start gap-3" data-testid="button-snap-store">
                    <SiLinux className="h-8 w-8 text-orange-500" />
                    <div className="text-left">
                      <p className="font-medium">{t.snapStore}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "نشر على Snap Store" : "Publish to Snap Store"}
                      </p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
