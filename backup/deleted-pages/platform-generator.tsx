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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ArrowRight,
  Building2,
  GraduationCap,
  HeartPulse,
  ShoppingCart,
  Briefcase,
  Landmark,
  Newspaper,
  Users,
  Palette,
  Settings,
  Shield,
  CreditCard,
  BarChart3,
  MessageSquare,
  Bell,
  Search,
  FileText,
  Database,
  Cloud,
  Lock,
  Zap,
  Sparkles,
  Eye,
  ChevronRight,
  Check,
  X
} from "lucide-react";

interface DevProject {
  id: number;
  name: string;
  description: string | null;
  projectType: string;
  isPublished: boolean;
  publishedUrl: string | null;
}

interface PlatformTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: any;
  color: string;
  category: string;
  features: string[];
  featuresAr: string[];
}

interface PlatformFeature {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: any;
  category: string;
  required?: boolean;
}

const platformTemplates: PlatformTemplate[] = [
  {
    id: "ecommerce",
    name: "E-Commerce Platform",
    nameAr: "منصة تجارة إلكترونية",
    description: "Complete online store with products, cart, checkout, and payments",
    descriptionAr: "متجر إلكتروني متكامل مع المنتجات والسلة والدفع",
    icon: ShoppingCart,
    color: "bg-emerald-500",
    category: "commerce",
    features: ["Products catalog", "Shopping cart", "Payments", "Order management", "Inventory"],
    featuresAr: ["كتالوج المنتجات", "سلة التسوق", "المدفوعات", "إدارة الطلبات", "المخزون"]
  },
  {
    id: "education",
    name: "Education Platform",
    nameAr: "منصة تعليمية",
    description: "Learning management system with courses, quizzes, and certificates",
    descriptionAr: "نظام إدارة تعلم مع الدورات والاختبارات والشهادات",
    icon: GraduationCap,
    color: "bg-blue-500",
    category: "education",
    features: ["Courses", "Video lessons", "Quizzes", "Certificates", "Progress tracking"],
    featuresAr: ["الدورات", "دروس فيديو", "الاختبارات", "الشهادات", "تتبع التقدم"]
  },
  {
    id: "healthcare",
    name: "Healthcare Platform",
    nameAr: "منصة صحية",
    description: "Medical platform with appointments, records, and telemedicine",
    descriptionAr: "منصة طبية مع المواعيد والسجلات والاستشارات عن بعد",
    icon: HeartPulse,
    color: "bg-red-500",
    category: "healthcare",
    features: ["Appointments", "Medical records", "Prescriptions", "Telemedicine", "Lab results"],
    featuresAr: ["المواعيد", "السجلات الطبية", "الوصفات", "الاستشارات عن بعد", "نتائج المختبر"]
  },
  {
    id: "financial",
    name: "Financial Platform",
    nameAr: "منصة مالية",
    description: "Banking and finance platform with accounts and transactions",
    descriptionAr: "منصة بنكية ومالية مع الحسابات والمعاملات",
    icon: Landmark,
    color: "bg-amber-500",
    category: "finance",
    features: ["Accounts", "Transactions", "Reports", "Budgeting", "Analytics"],
    featuresAr: ["الحسابات", "المعاملات", "التقارير", "الميزانية", "التحليلات"]
  },
  {
    id: "corporate",
    name: "Corporate Portal",
    nameAr: "بوابة الشركات",
    description: "Enterprise portal with HR, projects, and internal communications",
    descriptionAr: "بوابة مؤسسية مع الموارد البشرية والمشاريع والاتصالات الداخلية",
    icon: Building2,
    color: "bg-slate-500",
    category: "enterprise",
    features: ["HR management", "Projects", "Documents", "Internal chat", "Calendar"],
    featuresAr: ["إدارة الموارد البشرية", "المشاريع", "المستندات", "الدردشة الداخلية", "التقويم"]
  },
  {
    id: "saas",
    name: "SaaS Platform",
    nameAr: "منصة SaaS",
    description: "Software as a Service platform with subscriptions and multi-tenancy",
    descriptionAr: "منصة برمجيات كخدمة مع الاشتراكات والعزل متعدد المستأجرين",
    icon: Cloud,
    color: "bg-violet-500",
    category: "tech",
    features: ["Multi-tenancy", "Subscriptions", "API access", "Usage analytics", "Billing"],
    featuresAr: ["تعدد المستأجرين", "الاشتراكات", "وصول API", "تحليلات الاستخدام", "الفوترة"]
  },
  {
    id: "news",
    name: "News & Media",
    nameAr: "منصة إخبارية",
    description: "News portal with articles, categories, and multimedia content",
    descriptionAr: "بوابة إخبارية مع المقالات والتصنيفات والمحتوى المتعدد الوسائط",
    icon: Newspaper,
    color: "bg-orange-500",
    category: "media",
    features: ["Articles", "Categories", "Comments", "Newsletter", "SEO optimized"],
    featuresAr: ["المقالات", "التصنيفات", "التعليقات", "النشرة البريدية", "محسّن لمحركات البحث"]
  },
  {
    id: "community",
    name: "Community Platform",
    nameAr: "منصة مجتمعية",
    description: "Social community with profiles, groups, and discussions",
    descriptionAr: "مجتمع اجتماعي مع الملفات الشخصية والمجموعات والنقاشات",
    icon: Users,
    color: "bg-pink-500",
    category: "social",
    features: ["User profiles", "Groups", "Forums", "Messaging", "Events"],
    featuresAr: ["ملفات المستخدمين", "المجموعات", "المنتديات", "الرسائل", "الفعاليات"]
  }
];

const platformFeatures: PlatformFeature[] = [
  { id: "auth", name: "Authentication", nameAr: "المصادقة", description: "User login, registration, and security", descriptionAr: "تسجيل الدخول والتسجيل والأمان", icon: Lock, category: "security", required: true },
  { id: "payments", name: "Payments", nameAr: "المدفوعات", description: "Accept payments via multiple gateways", descriptionAr: "قبول المدفوعات عبر بوابات متعددة", icon: CreditCard, category: "commerce" },
  { id: "analytics", name: "Analytics", nameAr: "التحليلات", description: "Track user behavior and metrics", descriptionAr: "تتبع سلوك المستخدم والمقاييس", icon: BarChart3, category: "insights" },
  { id: "notifications", name: "Notifications", nameAr: "الإشعارات", description: "Push, email, and SMS notifications", descriptionAr: "إشعارات الدفع والبريد الإلكتروني والرسائل", icon: Bell, category: "engagement" },
  { id: "search", name: "Search", nameAr: "البحث", description: "Full-text search across content", descriptionAr: "بحث نصي كامل عبر المحتوى", icon: Search, category: "features" },
  { id: "chat", name: "Chat", nameAr: "الدردشة", description: "Real-time messaging", descriptionAr: "رسائل فورية", icon: MessageSquare, category: "engagement" },
  { id: "reports", name: "Reports", nameAr: "التقارير", description: "Generate and export reports", descriptionAr: "إنشاء وتصدير التقارير", icon: FileText, category: "insights" },
  { id: "api", name: "API Access", nameAr: "وصول API", description: "RESTful API for integrations", descriptionAr: "واجهة برمجة للتكاملات", icon: Database, category: "tech" },
  { id: "rbac", name: "Role-Based Access", nameAr: "صلاحيات الأدوار", description: "Fine-grained permissions", descriptionAr: "صلاحيات دقيقة", icon: Shield, category: "security" },
  { id: "ai", name: "AI Features", nameAr: "ميزات الذكاء الاصطناعي", description: "AI-powered recommendations and automation", descriptionAr: "توصيات وأتمتة مدعومة بالذكاء الاصطناعي", icon: Sparkles, category: "tech" },
];

export default function PlatformGenerator() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["auth"]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [activeTab, setActiveTab] = useState("templates");
  const [platformName, setPlatformName] = useState("");
  const [platformDescription, setPlatformDescription] = useState("");
  const [targetPlatforms, setTargetPlatforms] = useState({
    web: true,
    mobile: false,
    desktop: false
  });
  const [deploymentProvider, setDeploymentProvider] = useState<string>("vercel");

  const isArabic = language === "ar";

  const translations = {
    ar: {
      title: "مولّد المنصات الاحترافي",
      subtitle: "أنشئ منصة رقمية سيادية متكاملة بنقرة واحدة",
      
      tabs: {
        templates: "قوالب المنصات",
        features: "الميزات",
        customize: "التخصيص",
        preview: "المعاينة",
        generate: "التوليد"
      },
      
      selectProject: "اختر المشروع الأساسي",
      noProjects: "لا توجد مشاريع",
      createFirst: "أنشئ مشروعاً أولاً في Cloud IDE",
      
      templateSection: {
        title: "اختر نوع المنصة",
        subtitle: "حدد القالب الأساسي لمنصتك"
      },
      
      featuresSection: {
        title: "اختر الميزات",
        subtitle: "حدد الميزات التي تريدها في منصتك",
        required: "مطلوب",
        selected: "محدد"
      },
      
      customizeSection: {
        title: "تخصيص المنصة",
        subtitle: "أضف التفاصيل والإعدادات",
        platformName: "اسم المنصة",
        platformNamePlaceholder: "مثال: منصة التعلم الذكي",
        description: "وصف المنصة",
        descriptionPlaceholder: "صف المنصة وأهدافها...",
        targetPlatforms: "المنصات المستهدفة",
        web: "الويب",
        mobile: "الجوال",
        desktop: "سطح المكتب"
      },
      
      previewSection: {
        title: "معاينة المنصة",
        subtitle: "راجع إعداداتك قبل التوليد",
        template: "القالب",
        features: "الميزات",
        platforms: "المنصات",
        noTemplate: "لم تختر قالباً",
        noFeatures: "لم تختر ميزات"
      },
      
      generateSection: {
        title: "توليد المنصة",
        subtitle: "ابدأ عملية بناء المنصة",
        ready: "جاهز للتوليد",
        notReady: "أكمل الإعدادات أولاً",
        generate: "توليد المنصة",
        generating: "جاري التوليد...",
        requirements: {
          template: "اختيار قالب",
          features: "اختيار ميزة واحدة على الأقل",
          platform: "اختيار منصة واحدة على الأقل"
        }
      },
      
      steps: {
        analyzing: "تحليل المتطلبات...",
        scaffolding: "إنشاء الهيكل الأساسي...",
        generating: "توليد الكود...",
        integrating: "دمج الميزات...",
        packaging: "تجهيز الملفات...",
        done: "تم بنجاح!"
      },
      
      success: "نجاح",
      error: "خطأ",
      projectRequired: "يرجى اختيار مشروع أولاً",
      
      next: "التالي",
      previous: "السابق",
      goToIDE: "انتقل إلى Cloud IDE"
    },
    en: {
      title: "Professional Platform Generator",
      subtitle: "Create a complete sovereign digital platform with one click",
      
      tabs: {
        templates: "Templates",
        features: "Features",
        customize: "Customize",
        preview: "Preview",
        generate: "Generate"
      },
      
      selectProject: "Select Base Project",
      noProjects: "No projects found",
      createFirst: "Create a project first in Cloud IDE",
      
      templateSection: {
        title: "Choose Platform Type",
        subtitle: "Select the base template for your platform"
      },
      
      featuresSection: {
        title: "Select Features",
        subtitle: "Choose the features you want in your platform",
        required: "Required",
        selected: "Selected"
      },
      
      customizeSection: {
        title: "Customize Platform",
        subtitle: "Add details and settings",
        platformName: "Platform Name",
        platformNamePlaceholder: "e.g., Smart Learning Platform",
        description: "Platform Description",
        descriptionPlaceholder: "Describe your platform and its goals...",
        targetPlatforms: "Target Platforms",
        web: "Web",
        mobile: "Mobile",
        desktop: "Desktop"
      },
      
      previewSection: {
        title: "Preview Platform",
        subtitle: "Review your settings before generating",
        template: "Template",
        features: "Features",
        platforms: "Platforms",
        noTemplate: "No template selected",
        noFeatures: "No features selected"
      },
      
      generateSection: {
        title: "Generate Platform",
        subtitle: "Start building your platform",
        ready: "Ready to generate",
        notReady: "Complete settings first",
        generate: "Generate Platform",
        generating: "Generating...",
        requirements: {
          template: "Select a template",
          features: "Select at least one feature",
          platform: "Select at least one platform"
        }
      },
      
      steps: {
        analyzing: "Analyzing requirements...",
        scaffolding: "Creating base structure...",
        generating: "Generating code...",
        integrating: "Integrating features...",
        packaging: "Packaging files...",
        done: "Done!"
      },
      
      success: "Success",
      error: "Error",
      projectRequired: "Please select a project first",
      
      next: "Next",
      previous: "Previous",
      goToIDE: "Go to Cloud IDE"
    }
  };

  const text = translations[language];

  const { data: projects = [], isLoading: loadingProjects } = useQuery<DevProject[]>({
    queryKey: ["/api/dev-projects"],
  });

  const toggleFeature = (featureId: string) => {
    const feature = platformFeatures.find(f => f.id === featureId);
    if (feature?.required) return;
    
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const isReadyToGenerate = selectedTemplate && selectedFeatures.length > 0 && 
    (targetPlatforms.web || targetPlatforms.mobile || targetPlatforms.desktop);

  const getSelectedTemplate = () => platformTemplates.find(t => t.id === selectedTemplate);

  const generateMutation = useMutation({
    mutationFn: async () => {
      setGenerationProgress(0);
      setCurrentStep(text.steps.analyzing);
      
      await new Promise(r => setTimeout(r, 500));
      setGenerationProgress(15);
      setCurrentStep(text.steps.scaffolding);
      
      await new Promise(r => setTimeout(r, 600));
      setGenerationProgress(35);
      setCurrentStep(text.steps.generating);
      
      const result = await apiRequest("POST", "/api/platform/generate-sovereign", {
        template: selectedTemplate,
        features: selectedFeatures,
        targetPlatforms,
        deploymentProvider,
        name: platformName || getSelectedTemplate()?.name,
        description: platformDescription,
        projectId: selectedProject ? parseInt(selectedProject) : null
      });
      
      setGenerationProgress(70);
      setCurrentStep(text.steps.integrating);
      
      await new Promise(r => setTimeout(r, 400));
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
        description: data.message || (isArabic ? "تم توليد المنصة بنجاح" : "Platform generated successfully"),
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

  const tabOrder = ["templates", "features", "customize", "preview", "generate"];
  const currentTabIndex = tabOrder.indexOf(activeTab);

  const goToNextTab = () => {
    if (currentTabIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentTabIndex + 1]);
    }
  };

  const goToPreviousTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabOrder[currentTabIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isArabic ? "rtl" : "ltr"}>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">{text.title}</h1>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">{text.subtitle}</p>
        </div>

        {loadingProjects ? (
          <Card className="mb-6">
            <CardContent className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </CardContent>
          </Card>
        ) : projects.length === 0 ? (
          <Card className="mb-6">
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">{text.noProjects}</h3>
              <p className="text-muted-foreground mb-6">{text.createFirst}</p>
              <Button onClick={() => window.location.href = "/cloud-ide"} data-testid="button-go-to-ide">
                <Code className="w-4 h-4" />
                {text.goToIDE}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <Card>
              <CardContent className="p-2">
                <TabsList className="w-full grid grid-cols-5 gap-1">
                  <TabsTrigger value="templates" className="gap-2" data-testid="tab-templates">
                    <Layers className="w-4 h-4" />
                    <span className="hidden sm:inline">{text.tabs.templates}</span>
                  </TabsTrigger>
                  <TabsTrigger value="features" className="gap-2" data-testid="tab-features">
                    <Zap className="w-4 h-4" />
                    <span className="hidden sm:inline">{text.tabs.features}</span>
                  </TabsTrigger>
                  <TabsTrigger value="customize" className="gap-2" data-testid="tab-customize">
                    <Palette className="w-4 h-4" />
                    <span className="hidden sm:inline">{text.tabs.customize}</span>
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2" data-testid="tab-preview">
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">{text.tabs.preview}</span>
                  </TabsTrigger>
                  <TabsTrigger value="generate" className="gap-2" data-testid="tab-generate">
                    <Rocket className="w-4 h-4" />
                    <span className="hidden sm:inline">{text.tabs.generate}</span>
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>

            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{text.templateSection.title}</CardTitle>
                  <CardDescription>{text.templateSection.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {platformTemplates.map((template) => {
                      const Icon = template.icon;
                      const isSelected = selectedTemplate === template.id;
                      return (
                        <Card 
                          key={template.id}
                          className={`cursor-pointer transition-all hover-elevate ${
                            isSelected ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                          data-testid={`template-${template.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${template.color} text-white shrink-0`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">
                                  {isArabic ? template.nameAr : template.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {isArabic ? template.descriptionAr : template.description}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                              )}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {(isArabic ? template.featuresAr : template.features).slice(0, 3).map((feature, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={goToNextTab} disabled={!selectedTemplate} data-testid="button-next-templates">
                  {text.next}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{text.featuresSection.title}</CardTitle>
                  <CardDescription>
                    {text.featuresSection.subtitle}
                    <Badge variant="secondary" className="mr-2 ml-2">
                      {selectedFeatures.length} {text.featuresSection.selected}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {platformFeatures.map((feature) => {
                      const Icon = feature.icon;
                      const isSelected = selectedFeatures.includes(feature.id);
                      return (
                        <div 
                          key={feature.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover-elevate ${
                            isSelected ? "border-primary bg-primary/5" : "border-border"
                          } ${feature.required ? "opacity-90" : ""}`}
                          onClick={() => toggleFeature(feature.id)}
                          data-testid={`feature-${feature.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {isArabic ? feature.nameAr : feature.name}
                                  </span>
                                  {feature.required && (
                                    <Badge variant="outline" className="text-xs">
                                      {text.featuresSection.required}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {isArabic ? feature.descriptionAr : feature.description}
                                </p>
                              </div>
                            </div>
                            {isSelected ? (
                              <Check className="w-5 h-5 text-primary shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousTab} data-testid="button-prev-features">
                  {text.previous}
                </Button>
                <Button onClick={goToNextTab} data-testid="button-next-features">
                  {text.next}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="customize" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{text.customizeSection.title}</CardTitle>
                  <CardDescription>{text.customizeSection.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="platformName">{text.customizeSection.platformName}</Label>
                      <Input 
                        id="platformName"
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                        placeholder={text.customizeSection.platformNamePlaceholder}
                        data-testid="input-platform-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{text.selectProject}</Label>
                      <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger data-testid="select-base-project">
                          <SelectValue placeholder={text.selectProject} />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              <div className="flex items-center gap-2">
                                <Code className="w-4 h-4" />
                                {project.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platformDesc">{text.customizeSection.description}</Label>
                    <Textarea 
                      id="platformDesc"
                      value={platformDescription}
                      onChange={(e) => setPlatformDescription(e.target.value)}
                      placeholder={text.customizeSection.descriptionPlaceholder}
                      rows={3}
                      data-testid="input-platform-description"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>{text.customizeSection.targetPlatforms}</Label>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-blue-500" />
                          <span>{text.customizeSection.web}</span>
                        </div>
                        <Switch 
                          checked={targetPlatforms.web}
                          onCheckedChange={(checked) => setTargetPlatforms(p => ({...p, web: checked}))}
                          data-testid="switch-platform-web"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-green-500" />
                          <span>{text.customizeSection.mobile}</span>
                        </div>
                        <Switch 
                          checked={targetPlatforms.mobile}
                          onCheckedChange={(checked) => setTargetPlatforms(p => ({...p, mobile: checked}))}
                          data-testid="switch-platform-mobile"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Monitor className="w-5 h-5 text-purple-500" />
                          <span>{text.customizeSection.desktop}</span>
                        </div>
                        <Switch 
                          checked={targetPlatforms.desktop}
                          onCheckedChange={(checked) => setTargetPlatforms(p => ({...p, desktop: checked}))}
                          data-testid="switch-platform-desktop"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>{isArabic ? "مزود النشر" : "Deployment Provider"}</Label>
                    <Select value={deploymentProvider} onValueChange={setDeploymentProvider}>
                      <SelectTrigger data-testid="select-deployment-provider">
                        <SelectValue placeholder={isArabic ? "اختر مزود النشر" : "Select deployment provider"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vercel">Vercel</SelectItem>
                        <SelectItem value="netlify">Netlify</SelectItem>
                        <SelectItem value="railway">Railway</SelectItem>
                        <SelectItem value="render">Render</SelectItem>
                        <SelectItem value="fly">Fly.io</SelectItem>
                        <SelectItem value="hetzner">Hetzner Cloud</SelectItem>
                        <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                        <SelectItem value="gcp">Google Cloud Platform (GCP)</SelectItem>
                        <SelectItem value="azure">Microsoft Azure</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? "اختر مزود السحابة لنشر منصتك" : "Choose the cloud provider to deploy your platform"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousTab} data-testid="button-prev-customize">
                  {text.previous}
                </Button>
                <Button onClick={goToNextTab} data-testid="button-next-customize">
                  {text.next}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{text.previewSection.title}</CardTitle>
                  <CardDescription>{text.previewSection.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{text.previewSection.template}</h4>
                        {getSelectedTemplate() ? (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            {(() => {
                              const template = getSelectedTemplate();
                              if (!template) return null;
                              const Icon = template.icon;
                              return (
                                <>
                                  <div className={`p-2 rounded-lg ${template.color} text-white`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{isArabic ? template.nameAr : template.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {isArabic ? template.descriptionAr : template.description}
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">{text.previewSection.noTemplate}</p>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{text.previewSection.platforms}</h4>
                        <div className="flex flex-wrap gap-2">
                          {targetPlatforms.web && (
                            <Badge variant="secondary" className="gap-1">
                              <Globe className="w-3 h-3" />
                              {text.customizeSection.web}
                            </Badge>
                          )}
                          {targetPlatforms.mobile && (
                            <Badge variant="secondary" className="gap-1">
                              <Smartphone className="w-3 h-3" />
                              {text.customizeSection.mobile}
                            </Badge>
                          )}
                          {targetPlatforms.desktop && (
                            <Badge variant="secondary" className="gap-1">
                              <Monitor className="w-3 h-3" />
                              {text.customizeSection.desktop}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        {text.previewSection.features} ({selectedFeatures.length})
                      </h4>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {selectedFeatures.map(featureId => {
                            const feature = platformFeatures.find(f => f.id === featureId);
                            if (!feature) return null;
                            const Icon = feature.icon;
                            return (
                              <div key={featureId} className="flex items-center gap-2 text-sm">
                                <Icon className="w-4 h-4 text-primary" />
                                <span>{isArabic ? feature.nameAr : feature.name}</span>
                                {feature.required && (
                                  <Badge variant="outline" className="text-xs">
                                    {text.featuresSection.required}
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={goToPreviousTab} data-testid="button-prev-preview">
                  {text.previous}
                </Button>
                <Button onClick={goToNextTab} data-testid="button-next-preview">
                  {text.next}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="generate" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{text.generateSection.title}</CardTitle>
                  <CardDescription>{text.generateSection.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {selectedTemplate ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className={selectedTemplate ? "" : "text-muted-foreground"}>
                        {text.generateSection.requirements.template}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedFeatures.length > 0 ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className={selectedFeatures.length > 0 ? "" : "text-muted-foreground"}>
                        {text.generateSection.requirements.features}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(targetPlatforms.web || targetPlatforms.mobile || targetPlatforms.desktop) ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className={(targetPlatforms.web || targetPlatforms.mobile || targetPlatforms.desktop) ? "" : "text-muted-foreground"}>
                        {text.generateSection.requirements.platform}
                      </span>
                    </div>
                  </div>

                  {generateMutation.isPending && (
                    <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="font-medium">{currentStep}</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  )}

                  <Button 
                    size="lg"
                    className="w-full"
                    onClick={() => generateMutation.mutate()}
                    disabled={!isReadyToGenerate || generateMutation.isPending}
                    data-testid="button-generate-platform"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {text.generateSection.generating}
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        {text.generateSection.generate}
                      </>
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    {isReadyToGenerate ? text.generateSection.ready : text.generateSection.notReady}
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-start">
                <Button variant="outline" onClick={goToPreviousTab} data-testid="button-prev-generate">
                  {text.previous}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
