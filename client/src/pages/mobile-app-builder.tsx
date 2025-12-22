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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AppCodeEditor } from "@/components/app-builder/AppCodeEditor";
import { AppLivePreview } from "@/components/app-builder/AppLivePreview";
import DragDropBuilder from "@/components/app-builder/DragDropBuilder";
import { 
  Smartphone, 
  Tablet,
  Apple,
  Play,
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
  Camera,
  MapPin,
  Wifi,
  Battery,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Layers,
  Layout,
  FileCode,
  TestTube,
  Upload,
  UserCheck
} from "lucide-react";
import { SiAndroid, SiApple, SiFlutter, SiReact, SiKotlin, SiSwift } from "react-icons/si";

const translations = {
  ar: {
    title: "منشئ تطبيقات الجوال",
    subtitle: "صمم وطوّر تطبيقات Android و iOS بالذكاء الاصطناعي",
    newProject: "مشروع جديد",
    projectName: "اسم التطبيق",
    projectNamePlaceholder: "أدخل اسم التطبيق",
    description: "وصف التطبيق",
    descriptionPlaceholder: "صف ما يفعله تطبيقك...",
    platform: "المنصة المستهدفة",
    both: "Android و iOS",
    android: "Android فقط",
    ios: "iOS فقط",
    framework: "إطار العمل",
    reactNative: "React Native",
    flutter: "Flutter",
    native: "Native (Kotlin/Swift)",
    features: "الميزات",
    pushNotifications: "الإشعارات",
    camera: "الكاميرا",
    location: "الموقع الجغرافي",
    offline: "العمل بدون إنترنت",
    biometric: "المصادقة البيومترية",
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
      visual: "المحرر البصري",
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
    splashScreen: "شاشة البداية",
    colorScheme: "نظام الألوان",
    primaryColor: "اللون الرئيسي",
    buildStatus: "حالة البناء",
    downloadApk: "تحميل APK",
    downloadIpa: "تحميل IPA",
    testOnDevice: "اختبار على الجهاز",
    appStoreConnect: "App Store Connect",
    playConsole: "Google Play Console"
  },
  en: {
    title: "Mobile App Builder",
    subtitle: "Design and develop Android & iOS apps with AI",
    newProject: "New Project",
    projectName: "App Name",
    projectNamePlaceholder: "Enter app name",
    description: "App Description",
    descriptionPlaceholder: "Describe what your app does...",
    platform: "Target Platform",
    both: "Android & iOS",
    android: "Android Only",
    ios: "iOS Only",
    framework: "Framework",
    reactNative: "React Native",
    flutter: "Flutter",
    native: "Native (Kotlin/Swift)",
    features: "Features",
    pushNotifications: "Push Notifications",
    camera: "Camera",
    location: "Location",
    offline: "Offline Support",
    biometric: "Biometric Auth",
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
      visual: "Visual Editor",
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
    splashScreen: "Splash Screen",
    colorScheme: "Color Scheme",
    primaryColor: "Primary Color",
    buildStatus: "Build Status",
    downloadApk: "Download APK",
    downloadIpa: "Download IPA",
    testOnDevice: "Test on Device",
    appStoreConnect: "App Store Connect",
    playConsole: "Google Play Console"
  }
};

interface AppTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: typeof Package;
  color: string;
  features: Record<string, boolean>;
  screens: string[];
  screensAr: string[];
}

const appTemplates: AppTemplate[] = [
  { 
    id: "attendance", 
    name: "Attendance System", 
    nameAr: "نظام الحضور والانصراف", 
    description: "Face recognition attendance with multi-role access control",
    descriptionAr: "نظام حضور ببصمة الوجه مع صلاحيات متعددة المستويات",
    icon: UserCheck, 
    color: "#059669",
    features: { biometric: true, camera: true, pushNotifications: true, offline: true, darkMode: true, location: true },
    screens: ["Face Capture", "Dashboard", "Reports", "Employees", "Departments", "Roles & Permissions", "User Management", "Settings"],
    screensAr: ["بصمة الوجه", "لوحة التحكم", "التقارير", "الموظفين", "الأقسام", "الأدوار والصلاحيات", "إدارة المستخدمين", "الإعدادات"]
  },
  { 
    id: "ecommerce", 
    name: "E-Commerce", 
    nameAr: "متجر إلكتروني", 
    description: "Full shopping app with cart & payments",
    descriptionAr: "تطبيق تسوق كامل مع سلة وعمليات دفع",
    icon: Package, 
    color: "#f59e0b",
    features: { pushNotifications: true, offline: true, darkMode: true, location: false, camera: false, biometric: false },
    screens: ["Home", "Products", "Cart", "Checkout", "Orders", "Profile"],
    screensAr: ["الرئيسية", "المنتجات", "السلة", "الدفع", "الطلبات", "الملف الشخصي"]
  },
  { 
    id: "social", 
    name: "Social Network", 
    nameAr: "شبكة اجتماعية", 
    description: "Social media with posts & messaging",
    descriptionAr: "شبكة اجتماعية مع منشورات ورسائل",
    icon: Globe, 
    color: "#3b82f6",
    features: { pushNotifications: true, camera: true, offline: false, darkMode: true, location: false, biometric: false },
    screens: ["Feed", "Messages", "Notifications", "Profile", "Search", "Settings"],
    screensAr: ["الخلاصة", "الرسائل", "الإشعارات", "الملف", "البحث", "الإعدادات"]
  },
  { 
    id: "fitness", 
    name: "Fitness Tracker", 
    nameAr: "متتبع اللياقة", 
    description: "Workout tracking & health monitoring",
    descriptionAr: "تتبع التمارين ومراقبة الصحة",
    icon: Zap, 
    color: "#10b981",
    features: { pushNotifications: true, location: true, offline: true, darkMode: true, camera: false, biometric: false },
    screens: ["Dashboard", "Workouts", "Progress", "Goals", "Profile"],
    screensAr: ["لوحة التحكم", "التمارين", "التقدم", "الأهداف", "الملف"]
  },
  { 
    id: "news", 
    name: "News App", 
    nameAr: "تطبيق أخبار", 
    description: "News feed with categories & bookmarks",
    descriptionAr: "خلاصة أخبار مع فئات وإشارات مرجعية",
    icon: FileCode, 
    color: "#8b5cf6",
    features: { pushNotifications: true, offline: true, darkMode: true, camera: false, location: false, biometric: false },
    screens: ["Headlines", "Categories", "Bookmarks", "Search", "Settings"],
    screensAr: ["العناوين", "الفئات", "المحفوظات", "البحث", "الإعدادات"]
  },
  { 
    id: "delivery", 
    name: "Delivery App", 
    nameAr: "تطبيق توصيل", 
    description: "Order tracking & delivery management",
    descriptionAr: "تتبع الطلبات وإدارة التوصيل",
    icon: MapPin, 
    color: "#ef4444",
    features: { pushNotifications: true, location: true, offline: false, darkMode: true, camera: false, biometric: false },
    screens: ["Home", "Track Order", "Orders", "Profile", "Support"],
    screensAr: ["الرئيسية", "تتبع الطلب", "الطلبات", "الملف", "الدعم"]
  },
  { 
    id: "chat", 
    name: "Chat App", 
    nameAr: "تطبيق محادثة", 
    description: "Real-time messaging with groups",
    descriptionAr: "محادثة فورية مع مجموعات",
    icon: Bell, 
    color: "#06b6d4",
    features: { pushNotifications: true, camera: true, offline: true, darkMode: true, location: false, biometric: false },
    screens: ["Chats", "Contacts", "Groups", "Calls", "Settings"],
    screensAr: ["المحادثات", "جهات الاتصال", "المجموعات", "المكالمات", "الإعدادات"]
  },
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

export default function MobileAppBuilder() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProject, setSelectedProject] = useState<AppProject | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null);
  
  const [newApp, setNewApp] = useState({
    name: "",
    description: "",
    platform: "both",
    framework: "react-native",
    features: {
      pushNotifications: true,
      camera: false,
      location: false,
      offline: true,
      biometric: false,
      darkMode: true,
    },
    primaryColor: "#6366f1"
  });

  const { data: mobileProjects = [], isLoading: isLoadingProjects } = useQuery<AppProject[]>({
    queryKey: ['/api/app-projects', { type: 'mobile' }],
    queryFn: async () => {
      const res = await fetch('/api/app-projects?type=mobile');
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
        primaryColor: data.primaryColor,
        type: 'mobile'
      });
      return res.json();
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects', { type: 'mobile' }] });
      toast({ 
        title: language === "ar" ? "تم إنشاء التطبيق بنجاح!" : "App created successfully!",
        description: language === "ar" ? "يمكنك الآن البدء في التطوير" : "You can now start developing"
      });
      setSelectedProject(project);
      setNewApp({
        name: "",
        description: "",
        platform: "both",
        framework: "react-native",
        features: {
          pushNotifications: true,
          camera: false,
          location: false,
          offline: true,
          biometric: false,
          darkMode: true,
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
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects', { type: 'mobile' }] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/app-projects', { type: 'mobile' }] });
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
      prompt: aiPrompt || `Generate a complete UI design for ${selectedProject.name}`,
      generationType: 'ui'
    });
  };

  const handleOptimize = () => {
    if (!selectedProject) return;
    generateAIMutation.mutate({
      projectId: selectedProject.id,
      prompt: "Optimize the app for better performance",
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <Smartphone className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-mobile-builder-title">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <SiAndroid className="h-3 w-3 text-green-500" />
              Android
            </Badge>
            <Badge variant="outline" className="gap-1">
              <SiApple className="h-3 w-3" />
              iOS
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7 max-w-3xl">
            <TabsTrigger value="overview" data-testid="tab-overview">{t.tabs.overview}</TabsTrigger>
            <TabsTrigger value="design" data-testid="tab-design">{t.tabs.design}</TabsTrigger>
            <TabsTrigger value="visual" data-testid="tab-visual">{t.tabs.visual}</TabsTrigger>
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
                    {language === "ar" ? "أنشئ تطبيق جوال جديد" : "Create a new mobile app"}
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
                        <SelectItem value="both">{t.both}</SelectItem>
                        <SelectItem value="android">{t.android}</SelectItem>
                        <SelectItem value="ios">{t.ios}</SelectItem>
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
                        <SelectItem value="react-native">
                          <div className="flex items-center gap-2">
                            <SiReact className="h-4 w-4 text-cyan-500" />
                            {t.reactNative}
                          </div>
                        </SelectItem>
                        <SelectItem value="flutter">
                          <div className="flex items-center gap-2">
                            <SiFlutter className="h-4 w-4 text-blue-500" />
                            {t.flutter}
                          </div>
                        </SelectItem>
                        <SelectItem value="native">
                          <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4" />
                            {t.native}
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
                  <Smartphone className="h-5 w-5" />
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
                ) : mobileProjects.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <Smartphone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t.noApps}</p>
                    <p className="text-sm">{t.startBuilding}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mobileProjects.map((project) => (
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
                              <Smartphone className="h-5 w-5" style={{ color: project.primaryColor || '#6366f1' }} />
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
                      className={`cursor-pointer hover-elevate transition-all ${selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setNewApp({ 
                          ...newApp, 
                          name: language === "ar" ? template.nameAr : template.name,
                          description: language === "ar" ? template.descriptionAr : template.description,
                          features: {
                            pushNotifications: template.features.pushNotifications || false,
                            camera: template.features.camera || false,
                            location: template.features.location || false,
                            offline: template.features.offline || false,
                            biometric: template.features.biometric || false,
                            darkMode: template.features.darkMode || false,
                          },
                          primaryColor: template.color
                        });
                        toast({
                          title: language === "ar" ? "تم تحديد القالب" : "Template Selected",
                          description: language === "ar" ? template.nameAr : template.name
                        });
                      }}
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
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{language === "ar" ? template.nameAr : template.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {language === "ar" ? template.descriptionAr : template.description}
                            </p>
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      {language === "ar" ? "الشاشات المضمنة:" : "Included Screens:"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(language === "ar" ? selectedTemplate.screensAr : selectedTemplate.screens).map((screen, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {screen}
                        </Badge>
                      ))}
                    </div>
                    {selectedTemplate.id === "attendance" && (
                      <div className="mt-4 p-3 bg-primary/10 rounded-md">
                        <p className="text-sm font-medium text-primary mb-2">
                          {language === "ar" ? "ميزات إدارة المستخدمين:" : "User Management Features:"}
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>{language === "ar" ? "• أدوار متعددة (مدير، مشرف، موظف)" : "• Multiple roles (Admin, Supervisor, Employee)"}</li>
                          <li>{language === "ar" ? "• صلاحيات عرض الصفحات" : "• Page access permissions"}</li>
                          <li>{language === "ar" ? "• أقسام وإدارات متعددة" : "• Multiple departments"}</li>
                          <li>{language === "ar" ? "• التحقق ببصمة الوجه" : "• Face recognition verification"}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
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
                    <Smartphone className="h-5 w-5" />
                    {t.preview}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative mx-auto w-48 h-96 bg-black rounded-3xl p-2">
                    <div className="w-full h-full bg-background rounded-2xl overflow-hidden">
                      <div 
                        className="h-16 flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: newApp.primaryColor }}
                      >
                        {newApp.name || (language === "ar" ? "اسم التطبيق" : "App Name")}
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="h-24 bg-muted rounded-lg" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="visual" className="h-[calc(100vh-200px)]">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  {language === "ar" ? "المحرر البصري" : "Visual Editor"}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "صمم واجهة تطبيقك بالسحب والإفلات" 
                    : "Design your app UI with drag and drop"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)] p-0">
                <DragDropBuilder
                  language={language}
                  type="mobile"
                  onSave={(components) => {
                    toast({
                      title: language === "ar" ? "تم الحفظ" : "Saved",
                      description: language === "ar" ? "تم حفظ التصميم بنجاح" : "Design saved successfully",
                    });
                  }}
                  onExport={(code) => {
                    console.log("Generated code:", code);
                    toast({
                      title: language === "ar" ? "تم التصدير" : "Exported",
                      description: language === "ar" ? "تم تصدير الكود بنجاح" : "Code exported successfully",
                    });
                  }}
                />
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
                    { key: "pushNotifications", icon: Bell, label: t.pushNotifications },
                    { key: "camera", icon: Camera, label: t.camera },
                    { key: "location", icon: MapPin, label: t.location },
                    { key: "offline", icon: Wifi, label: t.offline },
                    { key: "biometric", icon: Shield, label: t.biometric },
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
                  type="mobile"
                  framework={selectedProject?.framework || newApp.framework}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="build" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SiAndroid className="h-5 w-5 text-green-500" />
                    Android Build
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
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2" data-testid="button-build-android">
                      <Play className="h-4 w-4" />
                      {t.build}
                    </Button>
                    <Button variant="outline" className="gap-2" data-testid="button-download-apk">
                      <Download className="h-4 w-4" />
                      APK
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SiApple className="h-5 w-5" />
                    iOS Build
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
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2" data-testid="button-build-ios">
                      <Play className="h-4 w-4" />
                      {t.build}
                    </Button>
                    <Button variant="outline" className="gap-2" data-testid="button-download-ipa">
                      <Download className="h-4 w-4" />
                      IPA
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <Button variant="outline" className="h-auto p-4 justify-start gap-3" data-testid="button-play-store">
                    <SiAndroid className="h-8 w-8 text-green-500" />
                    <div className="text-left">
                      <p className="font-medium">{t.playConsole}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "نشر على Google Play" : "Publish to Google Play"}
                      </p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 justify-start gap-3" data-testid="button-app-store">
                    <SiApple className="h-8 w-8" />
                    <div className="text-left">
                      <p className="font-medium">{t.appStoreConnect}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? "نشر على App Store" : "Publish to App Store"}
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
