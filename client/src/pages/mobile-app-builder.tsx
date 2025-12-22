import { useState } from "react";
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
  Upload
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
      features: "الميزات",
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
      features: "Features",
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

const appTemplates = [
  { id: "ecommerce", name: "E-Commerce", nameAr: "متجر إلكتروني", icon: Package, color: "#f59e0b" },
  { id: "social", name: "Social Network", nameAr: "شبكة اجتماعية", icon: Globe, color: "#3b82f6" },
  { id: "fitness", name: "Fitness Tracker", nameAr: "متتبع اللياقة", icon: Zap, color: "#10b981" },
  { id: "news", name: "News App", nameAr: "تطبيق أخبار", icon: FileCode, color: "#8b5cf6" },
  { id: "delivery", name: "Delivery App", nameAr: "تطبيق توصيل", icon: MapPin, color: "#ef4444" },
  { id: "chat", name: "Chat App", nameAr: "تطبيق محادثة", icon: Bell, color: "#06b6d4" },
];

export default function MobileAppBuilder() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreating, setIsCreating] = useState(false);
  
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

  const handleCreate = async () => {
    if (!newApp.name.trim()) {
      toast({ 
        title: language === "ar" ? "يرجى إدخال اسم التطبيق" : "Please enter app name",
        variant: "destructive" 
      });
      return;
    }
    
    setIsCreating(true);
    
    setTimeout(() => {
      setIsCreating(false);
      toast({ 
        title: language === "ar" ? "تم إنشاء التطبيق بنجاح!" : "App created successfully!",
        description: language === "ar" ? "يمكنك الآن البدء في التطوير" : "You can now start developing"
      });
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
    }, 2000);
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
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="overview" data-testid="tab-overview">{t.tabs.overview}</TabsTrigger>
            <TabsTrigger value="design" data-testid="tab-design">{t.tabs.design}</TabsTrigger>
            <TabsTrigger value="features" data-testid="tab-features">{t.tabs.features}</TabsTrigger>
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
                    disabled={isCreating}
                    data-testid="button-create-app"
                  >
                    {isCreating ? (
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
                  <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-generate-ui">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    {t.generateUI}
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-optimize">
                    <Zap className="h-4 w-4 text-orange-500" />
                    {t.optimizePerformance}
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" data-testid="button-security">
                    <Shield className="h-4 w-4 text-green-500" />
                    {t.securityScan}
                  </Button>
                </CardContent>
              </Card>
            </div>

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
