/**
 * AI Model Registry Management - Owner Only
 * سجل نماذج الذكاء الاصطناعي - للمالك فقط
 * 
 * Complete dynamic AI model management:
 * - Models: Add/Edit/Toggle/Delete AI models
 * - Services: Map services to primary/fallback models
 * - Global Settings: Emergency controls and system-wide config
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, Plus, Edit, Trash2, Power, Star, RefreshCw, Loader2, 
  AlertTriangle, CheckCircle, XCircle, Shield, Settings,
  Zap, Clock, DollarSign, Activity, AlertOctagon
} from "lucide-react";

// Helper function to normalize Arabic numerals to ASCII
const normalizeArabicNumerals = (value: string): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let normalized = value;
  arabicNumerals.forEach((arabic, index) => {
    normalized = normalized.replace(new RegExp(arabic, 'g'), String(index));
  });
  // Also handle Persian numerals
  const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  persianNumerals.forEach((persian, index) => {
    normalized = normalized.replace(new RegExp(persian, 'g'), String(index));
  });
  return normalized;
};

// Parse number from potentially localized string
const parseLocalizedNumber = (value: string): number => {
  const normalized = normalizeArabicNumerals(value);
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

const translations = {
  en: {
    title: "AI Model Registry",
    subtitle: "Dynamic AI model management and service configuration",
    modelsTab: "Models",
    servicesTab: "Dynamic Services",
    settingsTab: "Global Settings",
    serviceRegistryDesc: "Configure how each page, chat, and module uses AI",
    aiModeAuto: "Auto",
    aiModeManual: "Manual",
    aiModeDisabled: "Disabled",
    autoModeDesc: "System automatically selects the best model",
    manualModeDesc: "You explicitly select the model",
    disabledModeDesc: "AI is disabled for this service",
    serviceType: "Service Type",
    aiMode: "AI Mode",
    sidebarPath: "Sidebar Path",
    performanceMode: "Performance",
    costSensitivity: "Cost Sensitivity",
    initializeServices: "Initialize Default Services",
    speed: "Speed",
    balanced: "Balanced",
    quality: "Quality",
    low: "Low",
    medium: "Medium",
    high: "High",
    addModel: "Add Model",
    editModel: "Edit Model",
    modelId: "Model ID",
    modelIdHelp: "Unique identifier used by the system",
    name: "Display Name",
    nameAr: "Arabic Name",
    provider: "Provider",
    capabilities: "Capabilities",
    maxTokens: "Max Tokens",
    contextWindow: "Context Window",
    inputCost: "Input Cost (per 1M)",
    outputCost: "Output Cost (per 1M)",
    isActive: "Active",
    isDefault: "Default Model",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    noModels: "No models configured",
    noModelsDesc: "Add your first AI model to enable AI features",
    active: "Active",
    inactive: "Inactive",
    default: "Default",
    deleteConfirm: "Delete this model?",
    deleteDesc: "This action cannot be undone.",
    serviceName: "Service Name",
    primaryModel: "Primary Model",
    fallbackModel: "Fallback Model",
    noServices: "No service configurations",
    noServicesDesc: "Configure how services use AI models",
    addService: "Add Service Config",
    emergencyKillSwitch: "Emergency Kill Switch",
    killSwitchDesc: "Immediately disable all AI operations",
    killSwitchEnabled: "All AI services are disabled",
    killSwitchReason: "Reason for disabling",
    globalDefault: "Global Default Model",
    autoFallback: "Enable Auto Fallback",
    maxFallbackAttempts: "Max Fallback Attempts",
    dailyCostLimit: "Daily Cost Limit ($)",
    monthlyCostLimit: "Monthly Cost Limit ($)",
    systemStatus: "System Status",
    systemReady: "AI system is ready",
    systemNotReady: "AI system has issues",
    testResolve: "Test Resolution",
  },
  ar: {
    title: "سجل نماذج الذكاء الاصطناعي",
    subtitle: "إدارة النماذج وتكوين الخدمات بشكل ديناميكي",
    modelsTab: "النماذج",
    servicesTab: "الخدمات الديناميكية",
    settingsTab: "الإعدادات العامة",
    serviceRegistryDesc: "تكوين كيفية استخدام كل صفحة ومحادثة ووحدة للذكاء الاصطناعي",
    aiModeAuto: "تلقائي",
    aiModeManual: "يدوي",
    aiModeDisabled: "معطل",
    autoModeDesc: "النظام يختار أفضل نموذج تلقائياً",
    manualModeDesc: "أنت تختار النموذج بشكل صريح",
    disabledModeDesc: "الذكاء الاصطناعي معطل لهذه الخدمة",
    serviceType: "نوع الخدمة",
    aiMode: "وضع الذكاء الاصطناعي",
    sidebarPath: "مسار الشريط الجانبي",
    performanceMode: "الأداء",
    costSensitivity: "حساسية التكلفة",
    initializeServices: "تهيئة الخدمات الافتراضية",
    speed: "سرعة",
    balanced: "متوازن",
    quality: "جودة",
    low: "منخفض",
    medium: "متوسط",
    high: "عالي",
    addModel: "إضافة نموذج",
    editModel: "تعديل النموذج",
    modelId: "معرف النموذج",
    modelIdHelp: "معرف فريد يستخدمه النظام",
    name: "اسم العرض",
    nameAr: "الاسم بالعربية",
    provider: "المزود",
    capabilities: "القدرات",
    maxTokens: "الحد الأقصى للرموز",
    contextWindow: "نافذة السياق",
    inputCost: "تكلفة الإدخال (لكل مليون)",
    outputCost: "تكلفة الإخراج (لكل مليون)",
    isActive: "نشط",
    isDefault: "النموذج الافتراضي",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    noModels: "لا توجد نماذج مُهيأة",
    noModelsDesc: "أضف أول نموذج ذكاء اصطناعي لتفعيل الميزات",
    active: "نشط",
    inactive: "غير نشط",
    default: "افتراضي",
    deleteConfirm: "حذف هذا النموذج؟",
    deleteDesc: "لا يمكن التراجع عن هذا الإجراء.",
    serviceName: "اسم الخدمة",
    primaryModel: "النموذج الأساسي",
    fallbackModel: "النموذج البديل",
    noServices: "لا توجد تكوينات خدمات",
    noServicesDesc: "قم بتهيئة كيفية استخدام الخدمات لنماذج AI",
    addService: "إضافة تكوين خدمة",
    emergencyKillSwitch: "مفتاح الإيقاف الطارئ",
    killSwitchDesc: "تعطيل جميع عمليات AI فوراً",
    killSwitchEnabled: "جميع خدمات AI معطلة",
    killSwitchReason: "سبب التعطيل",
    globalDefault: "النموذج الافتراضي العام",
    autoFallback: "تفعيل الانتقال التلقائي",
    maxFallbackAttempts: "أقصى محاولات انتقال",
    dailyCostLimit: "حد التكلفة اليومية ($)",
    monthlyCostLimit: "حد التكلفة الشهرية ($)",
    systemStatus: "حالة النظام",
    systemReady: "نظام AI جاهز",
    systemNotReady: "نظام AI يواجه مشاكل",
    testResolve: "اختبار التحليل",
  },
};

interface AiModel {
  id: string;
  provider: string;
  modelId: string;
  name: string;
  nameAr: string;
  description: string | null;
  descriptionAr: string | null;
  capabilities: string[];
  maxTokens: number;
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

interface AiServiceConfig {
  id: string;
  serviceName: string;
  displayName: string;
  displayNameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  serviceType: 'chat' | 'assistant' | 'analysis' | 'automation' | 'system';
  aiMode: 'auto' | 'manual' | 'disabled';
  sidebarPath: string | null;
  icon: string | null;
  sortOrder: number | null;
  primaryModelId: string | null;
  fallbackModelId: string | null;
  preferredCapabilities: string[];
  requiredCapabilities: string[];
  performanceMode: string;
  costSensitivity: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  systemPrompt: string | null;
  temperature: number;
  isEnabled: boolean;
  isVisible: boolean;
}

interface AiGlobalSettings {
  id?: string;
  emergencyKillSwitch: boolean;
  killSwitchReason: string | null;
  globalDefaultModelId: string | null;
  enableAutoFallback: boolean;
  maxFallbackAttempts: number;
  dailyCostLimitUsd: number;
  monthlyCostLimitUsd: number;
}

const defaultCapabilities = ['chat', 'code', 'reasoning', 'image', 'embedding', 'vision', 'function_calling', 'json_mode'];
const defaultProviders = ['replit', 'anthropic', 'openai', 'google', 'meta', 'mistral', 'cohere'];

const defaultServices = [
  { serviceName: 'chat', displayName: 'AI Chat', displayNameAr: 'محادثة AI' },
  { serviceName: 'code_generation', displayName: 'Code Generation', displayNameAr: 'إنشاء الكود' },
  { serviceName: 'translation', displayName: 'Translation', displayNameAr: 'الترجمة' },
  { serviceName: 'seo', displayName: 'SEO Optimization', displayNameAr: 'تحسين SEO' },
  { serviceName: 'content', displayName: 'Content Generation', displayNameAr: 'إنشاء المحتوى' },
];

export default function AIModelRegistry() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  const isRTL = language === "ar";

  const [activeTab, setActiveTab] = useState("models");
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AiModel | null>(null);
  const [selectedService, setSelectedService] = useState<AiServiceConfig | null>(null);

  const [modelForm, setModelForm] = useState({
    modelId: "",
    name: "",
    nameAr: "",
    provider: "replit",
    capabilities: ["chat", "code"],
    maxTokens: 4096,
    contextWindow: 128000,
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    isActive: true,
    isDefault: false,
  });

  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    displayName: "",
    displayNameAr: "",
    primaryModelId: "",
    fallbackModelId: "",
    isEnabled: true,
  });

  const { data: models = [], isLoading: modelsLoading } = useQuery<AiModel[]>({
    queryKey: ["/api/owner/ai-models"],
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<AiServiceConfig[]>({
    queryKey: ["/api/owner/ai-services"],
  });

  const { data: globalSettings } = useQuery<AiGlobalSettings>({
    queryKey: ["/api/owner/ai-global-settings"],
  });

  const { data: systemValidation } = useQuery<{ ready: boolean; errors: string[] }>({
    queryKey: ["/api/owner/ai-system/validate"],
  });

  const saveModelMutation = useMutation({
    mutationFn: async (data: any) => {
      if (selectedModel) {
        return apiRequest("PUT", `/api/owner/ai-models/${selectedModel.modelId}`, data);
      }
      return apiRequest("POST", "/api/owner/ai-models", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-models"] });
      setModelDialogOpen(false);
      toast({ title: language === "ar" ? "تم الحفظ بنجاح" : "Saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to save", variant: "destructive" });
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: (modelId: string) => apiRequest("DELETE", `/api/owner/ai-models/${modelId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-models"] });
      setDeleteDialogOpen(false);
      toast({ title: language === "ar" ? "تم الحذف بنجاح" : "Deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to delete", variant: "destructive" });
    },
  });

  const toggleModelMutation = useMutation({
    mutationFn: ({ modelId, isActive }: { modelId: string; isActive: boolean }) =>
      apiRequest("PATCH", `/api/owner/ai-models/${modelId}/toggle`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-models"] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (modelId: string) =>
      apiRequest("PATCH", `/api/owner/ai-models/${modelId}/set-default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-models"] });
      toast({ title: language === "ar" ? "تم تعيين النموذج الافتراضي" : "Default model set" });
    },
  });

  const saveServiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/owner/ai-services", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-services"] });
      setServiceDialogOpen(false);
      toast({ title: language === "ar" ? "تم الحفظ بنجاح" : "Saved successfully" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to save", variant: "destructive" });
    },
  });

  const toggleKillSwitchMutation = useMutation({
    mutationFn: ({ enabled, reason }: { enabled: boolean; reason?: string }) =>
      apiRequest("POST", "/api/owner/ai-kill-switch", { enabled, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-global-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-system/validate"] });
      toast({ 
        title: globalSettings?.emergencyKillSwitch 
          ? (language === "ar" ? "تم إيقاف مفتاح الطوارئ" : "Kill switch deactivated")
          : (language === "ar" ? "تم تفعيل مفتاح الطوارئ" : "Kill switch activated"),
      });
    },
  });

  const saveGlobalSettingsMutation = useMutation({
    mutationFn: (data: Partial<AiGlobalSettings>) =>
      apiRequest("PUT", "/api/owner/ai-global-settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-global-settings"] });
      toast({ title: language === "ar" ? "تم حفظ الإعدادات" : "Settings saved" });
    },
  });

  const initializeServicesMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/owner/ai-execution/initialize"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-execution/services"] });
      toast({ title: language === "ar" ? "تم تهيئة الخدمات بنجاح" : "Services initialized successfully" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to initialize", variant: "destructive" });
    },
  });

  const toggleServiceModeMutation = useMutation({
    mutationFn: ({ serviceName, aiMode }: { serviceName: string; aiMode: 'auto' | 'manual' | 'disabled' }) =>
      apiRequest("PATCH", `/api/owner/ai-execution/services/${serviceName}/mode`, { aiMode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-execution/services"] });
      toast({ title: language === "ar" ? "تم تحديث وضع الخدمة" : "Service mode updated" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to update", variant: "destructive" });
    },
  });

  const handleEditModel = (model: AiModel) => {
    setSelectedModel(model);
    setModelForm({
      modelId: model.modelId,
      name: model.name,
      nameAr: model.nameAr,
      provider: model.provider,
      capabilities: model.capabilities || [],
      maxTokens: model.maxTokens,
      contextWindow: model.contextWindow,
      inputCostPer1M: model.inputCostPer1M,
      outputCostPer1M: model.outputCostPer1M,
      isActive: model.isActive,
      isDefault: model.isDefault,
    });
    setModelDialogOpen(true);
  };

  const handleAddModel = () => {
    setSelectedModel(null);
    setModelForm({
      modelId: "",
      name: "",
      nameAr: "",
      provider: "replit",
      capabilities: ["chat", "code"],
      maxTokens: 4096,
      contextWindow: 128000,
      inputCostPer1M: 0,
      outputCostPer1M: 0,
      isActive: true,
      isDefault: false,
    });
    setModelDialogOpen(true);
  };

  const handleEditService = (service: AiServiceConfig) => {
    setSelectedService(service);
    setServiceForm({
      serviceName: service.serviceName,
      displayName: service.displayName,
      displayNameAr: service.displayNameAr || "",
      primaryModelId: service.primaryModelId || "",
      fallbackModelId: service.fallbackModelId || "",
      isEnabled: service.isEnabled,
    });
    setServiceDialogOpen(true);
  };

  const handleAddService = () => {
    setSelectedService(null);
    setServiceForm({
      serviceName: "",
      displayName: "",
      displayNameAr: "",
      primaryModelId: "",
      fallbackModelId: "",
      isEnabled: true,
    });
    setServiceDialogOpen(true);
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      replit: "bg-indigo-500",
      anthropic: "bg-orange-500",
      openai: "bg-green-600",
      google: "bg-blue-500",
      meta: "bg-purple-600",
      mistral: "bg-yellow-500",
      cohere: "bg-pink-500",
    };
    return colors[provider] || "bg-gray-500";
  };

  return (
    <div className={`container mx-auto py-6 space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Bot className="h-6 w-6" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        {systemValidation && (
          <Badge 
            variant={systemValidation.ready ? "default" : "destructive"}
            className="flex items-center gap-1"
            data-testid="badge-system-status"
          >
            {systemValidation.ready ? (
              <>
                <CheckCircle className="h-3 w-3" />
                {t.systemReady}
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3" />
                {t.systemNotReady}
              </>
            )}
          </Badge>
        )}
      </div>

      {globalSettings?.emergencyKillSwitch && (
        <Card className="border-destructive bg-destructive/10" data-testid="card-kill-switch-active">
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-6 w-6 text-destructive" />
              <div>
                <p className="font-medium text-destructive">{t.killSwitchEnabled}</p>
                {globalSettings.killSwitchReason && (
                  <p className="text-sm text-muted-foreground">{globalSettings.killSwitchReason}</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => toggleKillSwitchMutation.mutate({ enabled: false })}
              disabled={toggleKillSwitchMutation.isPending}
              data-testid="button-deactivate-kill-switch"
            >
              {toggleKillSwitchMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {language === "ar" ? "إلغاء التعطيل" : "Deactivate"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList data-testid="tabs-ai-registry">
          <TabsTrigger value="models" data-testid="tab-models">
            <Bot className="h-4 w-4" />
            {t.modelsTab}
          </TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">
            <Settings className="h-4 w-4" />
            {t.servicesTab}
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Shield className="h-4 w-4" />
            {t.settingsTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {models.length} {language === "ar" ? "نموذج" : "models"}
              {" | "}
              {models.filter(m => m.isActive).length} {language === "ar" ? "نشط" : "active"}
            </div>
            <Button onClick={handleAddModel} data-testid="button-add-model">
              <Plus className="h-4 w-4" />
              {t.addModel}
            </Button>
          </div>

          {modelsLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </CardContent>
            </Card>
          ) : models.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-1">{t.noModels}</h3>
                <p className="text-sm text-muted-foreground">{t.noModelsDesc}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {models.map((model) => (
                <Card 
                  key={model.id} 
                  className={`relative ${!model.isActive ? "opacity-60" : ""}`}
                  data-testid={`card-model-${model.modelId}`}
                >
                  {model.isDefault && (
                    <div className="absolute -top-2 -end-2">
                      <Badge className="bg-yellow-500">
                        <Star className="h-3 w-3" />
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {isRTL ? model.nameAr || model.name : model.name}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs mt-1">
                          {model.modelId}
                        </CardDescription>
                      </div>
                      <Badge className={`${getProviderColor(model.provider)} text-white`}>
                        {model.provider}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities?.map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {model.maxTokens?.toLocaleString()} tokens
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {(model.contextWindow / 1000).toFixed(0)}K context
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={model.isActive}
                          onCheckedChange={(checked) => 
                            toggleModelMutation.mutate({ modelId: model.modelId, isActive: checked })
                          }
                          data-testid={`switch-model-active-${model.modelId}`}
                        />
                        <span className="text-sm">
                          {model.isActive ? t.active : t.inactive}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {!model.isDefault && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDefaultMutation.mutate(model.modelId)}
                            title={t.isDefault}
                            data-testid={`button-set-default-${model.modelId}`}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditModel(model)}
                          data-testid={`button-edit-model-${model.modelId}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedModel(model);
                            setDeleteDialogOpen(true);
                          }}
                          data-testid={`button-delete-model-${model.modelId}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">{t.serviceRegistryDesc}</p>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="text-sm text-muted-foreground">
              {services.length} {language === "ar" ? "خدمة مُهيأة" : "services configured"}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => initializeServicesMutation.mutate()}
                disabled={initializeServicesMutation.isPending}
                data-testid="button-initialize-services"
              >
                {initializeServicesMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {t.initializeServices}
              </Button>
              <Button onClick={handleAddService} data-testid="button-add-service">
                <Plus className="h-4 w-4" />
                {t.addService}
              </Button>
            </div>
          </div>

          {servicesLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </CardContent>
            </Card>
          ) : services.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-1">{t.noServices}</h3>
                <p className="text-sm text-muted-foreground">{t.noServicesDesc}</p>
                <div className="mt-4">
                  <Button 
                    onClick={() => initializeServicesMutation.mutate()}
                    disabled={initializeServicesMutation.isPending}
                    data-testid="button-initialize-services-empty"
                  >
                    {initializeServicesMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    {t.initializeServices}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {services.map((service) => {
                const aiModeColor = service.aiMode === 'auto' ? 'bg-green-500' : service.aiMode === 'manual' ? 'bg-blue-500' : 'bg-gray-400';
                const aiModeLabel = service.aiMode === 'auto' ? t.aiModeAuto : service.aiMode === 'manual' ? t.aiModeManual : t.aiModeDisabled;
                const serviceTypeLabels: Record<string, string> = {
                  chat: isRTL ? 'دردشة' : 'Chat',
                  assistant: isRTL ? 'مساعد' : 'Assistant',
                  analysis: isRTL ? 'تحليل' : 'Analysis',
                  automation: isRTL ? 'أتمتة' : 'Automation',
                  system: isRTL ? 'نظام' : 'System',
                };
                
                return (
                  <Card key={service.id} data-testid={`card-service-${service.serviceName}`}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-10 rounded-full ${service.isEnabled ? aiModeColor : "bg-gray-300"}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {isRTL ? service.displayNameAr || service.displayName : service.displayName}
                              </h4>
                              <Badge variant={service.aiMode === 'auto' ? 'default' : service.aiMode === 'manual' ? 'secondary' : 'outline'}>
                                {service.aiMode === 'auto' && <Zap className="h-3 w-3" />}
                                {service.aiMode === 'manual' && <Settings className="h-3 w-3" />}
                                {aiModeLabel}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {serviceTypeLabels[service.serviceType] || service.serviceType}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-mono">{service.serviceName}</span>
                              {service.sidebarPath && (
                                <span className="ml-2 opacity-70">→ {service.sidebarPath}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-wrap">
                          {service.aiMode !== 'disabled' && (
                            <>
                              <div className="text-sm">
                                <span className="text-muted-foreground">{t.primaryModel}: </span>
                                <Badge variant="outline">
                                  {service.aiMode === 'auto' 
                                    ? (language === "ar" ? "ذكي" : "Smart") 
                                    : (service.primaryModelId || (language === "ar" ? "غير محدد" : "Not set"))}
                                </Badge>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">{t.fallbackModel}: </span>
                                <Badge variant="outline">
                                  {service.fallbackModelId || (language === "ar" ? "تلقائي" : "Auto")}
                                </Badge>
                              </div>
                            </>
                          )}
                          <Select
                            value={service.aiMode}
                            onValueChange={(value: 'auto' | 'manual' | 'disabled') => 
                              toggleServiceModeMutation.mutate({ serviceName: service.serviceName, aiMode: value })
                            }
                          >
                            <SelectTrigger className="w-24" data-testid={`select-mode-${service.serviceName}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">{t.aiModeAuto}</SelectItem>
                              <SelectItem value="manual">{t.aiModeManual}</SelectItem>
                              <SelectItem value="disabled">{t.aiModeDisabled}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditService(service)}
                            data-testid={`button-edit-service-${service.serviceName}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="border-destructive/50" data-testid="card-emergency-controls">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertOctagon className="h-5 w-5" />
                {t.emergencyKillSwitch}
              </CardTitle>
              <CardDescription>{t.killSwitchDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={globalSettings?.emergencyKillSwitch || false}
                    onCheckedChange={(checked) => {
                      const reason = checked 
                        ? prompt(language === "ar" ? "سبب التعطيل (اختياري):" : "Reason for disabling (optional):")
                        : undefined;
                      toggleKillSwitchMutation.mutate({ enabled: checked, reason: reason || undefined });
                    }}
                    data-testid="switch-kill-switch"
                  />
                  <span className={globalSettings?.emergencyKillSwitch ? "text-destructive font-medium" : ""}>
                    {globalSettings?.emergencyKillSwitch 
                      ? (language === "ar" ? "مُفعّل - جميع خدمات AI معطلة" : "ACTIVE - All AI services disabled")
                      : (language === "ar" ? "غير مُفعّل" : "Not Active")
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-global-defaults">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {language === "ar" ? "الإعدادات العامة" : "Global Defaults"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t.globalDefault}</Label>
                  <Select
                    value={globalSettings?.globalDefaultModelId || ""}
                    onValueChange={(value) => saveGlobalSettingsMutation.mutate({ globalDefaultModelId: value })}
                  >
                    <SelectTrigger data-testid="select-global-default">
                      <SelectValue placeholder={language === "ar" ? "اختر نموذج افتراضي" : "Select default model"} />
                    </SelectTrigger>
                    <SelectContent>
                      {models.filter(m => m.isActive).map((model) => (
                        <SelectItem key={model.modelId} value={model.modelId}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.maxFallbackAttempts}</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9٠-٩۰-۹]*"
                    value={String(globalSettings?.maxFallbackAttempts || 3)}
                    onChange={(e) => {
                      const value = parseLocalizedNumber(e.target.value);
                      if (value >= 1 && value <= 10) {
                        saveGlobalSettingsMutation.mutate({ maxFallbackAttempts: Math.floor(value) });
                      }
                    }}
                    data-testid="input-max-fallback"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.dailyCostLimit}</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9٠-٩۰-۹.٫]*"
                    value={String(globalSettings?.dailyCostLimitUsd || 100)}
                    onChange={(e) => {
                      const value = parseLocalizedNumber(e.target.value);
                      if (value >= 0) {
                        saveGlobalSettingsMutation.mutate({ dailyCostLimitUsd: value });
                      }
                    }}
                    data-testid="input-daily-cost-limit"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.monthlyCostLimit}</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9٠-٩۰-۹.٫]*"
                    value={String(globalSettings?.monthlyCostLimitUsd || 2000)}
                    onChange={(e) => {
                      const value = parseLocalizedNumber(e.target.value);
                      if (value >= 0) {
                        saveGlobalSettingsMutation.mutate({ monthlyCostLimitUsd: value });
                      }
                    }}
                    data-testid="input-monthly-cost-limit"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t.autoFallback}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" 
                      ? "الانتقال تلقائياً إلى نموذج بديل عند الفشل"
                      : "Automatically switch to fallback model on failure"}
                  </p>
                </div>
                <Switch
                  checked={globalSettings?.enableAutoFallback !== false}
                  onCheckedChange={(checked) => saveGlobalSettingsMutation.mutate({ enableAutoFallback: checked })}
                  data-testid="switch-auto-fallback"
                />
              </div>
            </CardContent>
          </Card>

          {systemValidation && !systemValidation.ready && (
            <Card className="border-yellow-500/50" data-testid="card-system-issues">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  {t.systemStatus}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {systemValidation.errors.map((error, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      {error}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedModel ? t.editModel : t.addModel}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-1">
              <div className="space-y-2">
                <Label>{t.modelId}</Label>
                <Input
                  value={modelForm.modelId}
                  onChange={(e) => setModelForm({ ...modelForm, modelId: e.target.value })}
                  placeholder="anthropic/claude-sonnet-4"
                  disabled={!!selectedModel}
                  data-testid="input-model-id"
                />
                <p className="text-xs text-muted-foreground">{t.modelIdHelp}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.name}</Label>
                  <Input
                    value={modelForm.name}
                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                    placeholder="Claude Sonnet 4"
                    data-testid="input-model-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.nameAr}</Label>
                  <Input
                    value={modelForm.nameAr}
                    onChange={(e) => setModelForm({ ...modelForm, nameAr: e.target.value })}
                    placeholder="كلود سونيت 4"
                    dir="rtl"
                    data-testid="input-model-name-ar"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.provider}</Label>
                <Select
                  value={modelForm.provider}
                  onValueChange={(value) => setModelForm({ ...modelForm, provider: value })}
                >
                  <SelectTrigger data-testid="select-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultProviders.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t.capabilities}</Label>
                <div className="flex flex-wrap gap-2">
                  {defaultCapabilities.map((cap) => (
                    <Badge
                      key={cap}
                      variant={modelForm.capabilities.includes(cap) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newCaps = modelForm.capabilities.includes(cap)
                          ? modelForm.capabilities.filter(c => c !== cap)
                          : [...modelForm.capabilities, cap];
                        setModelForm({ ...modelForm, capabilities: newCaps });
                      }}
                    >
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.maxTokens}</Label>
                  <Input
                    type="number"
                    value={modelForm.maxTokens}
                    onChange={(e) => setModelForm({ ...modelForm, maxTokens: parseInt(e.target.value) })}
                    data-testid="input-max-tokens"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.contextWindow}</Label>
                  <Input
                    type="number"
                    value={modelForm.contextWindow}
                    onChange={(e) => setModelForm({ ...modelForm, contextWindow: parseInt(e.target.value) })}
                    data-testid="input-context-window"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.inputCost}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={modelForm.inputCostPer1M}
                    onChange={(e) => setModelForm({ ...modelForm, inputCostPer1M: parseFloat(e.target.value) })}
                    data-testid="input-cost"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.outputCost}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={modelForm.outputCostPer1M}
                    onChange={(e) => setModelForm({ ...modelForm, outputCostPer1M: parseFloat(e.target.value) })}
                    data-testid="output-cost"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>{t.isActive}</Label>
                <Switch
                  checked={modelForm.isActive}
                  onCheckedChange={(checked) => setModelForm({ ...modelForm, isActive: checked })}
                  data-testid="switch-model-active"
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModelDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              onClick={() => saveModelMutation.mutate(modelForm)}
              disabled={saveModelMutation.isPending || !modelForm.modelId || !modelForm.name}
              data-testid="button-save-model"
            >
              {saveModelMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedService ? t.editModel : t.addService}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.serviceName}</Label>
              <Input
                value={serviceForm.serviceName}
                onChange={(e) => setServiceForm({ ...serviceForm, serviceName: e.target.value })}
                placeholder="chat"
                disabled={!!selectedService}
                data-testid="input-service-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === "ar" ? "اسم العرض" : "Display Name"}</Label>
                <Input
                  value={serviceForm.displayName}
                  onChange={(e) => setServiceForm({ ...serviceForm, displayName: e.target.value })}
                  placeholder="AI Chat"
                  data-testid="input-service-display-name"
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "ar" ? "الاسم بالعربية" : "Arabic Name"}</Label>
                <Input
                  value={serviceForm.displayNameAr}
                  onChange={(e) => setServiceForm({ ...serviceForm, displayNameAr: e.target.value })}
                  placeholder="محادثة AI"
                  dir="rtl"
                  data-testid="input-service-display-name-ar"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.primaryModel}</Label>
              <Select
                value={serviceForm.primaryModelId || "__auto__"}
                onValueChange={(value) => setServiceForm({ ...serviceForm, primaryModelId: value === "__auto__" ? "" : value })}
              >
                <SelectTrigger data-testid="select-primary-model">
                  <SelectValue placeholder={language === "ar" ? "اختر النموذج الأساسي" : "Select primary model"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__auto__">{language === "ar" ? "تلقائي (استخدام الافتراضي)" : "Auto (use default)"}</SelectItem>
                  {models.filter(m => m.isActive).map((model) => (
                    <SelectItem key={model.modelId} value={model.modelId}>
                      {model.name} ({model.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.fallbackModel}</Label>
              <Select
                value={serviceForm.fallbackModelId || "__auto__"}
                onValueChange={(value) => setServiceForm({ ...serviceForm, fallbackModelId: value === "__auto__" ? "" : value })}
              >
                <SelectTrigger data-testid="select-fallback-model">
                  <SelectValue placeholder={language === "ar" ? "اختر النموذج البديل" : "Select fallback model"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__auto__">{language === "ar" ? "تلقائي" : "Auto"}</SelectItem>
                  {models.filter(m => m.isActive && m.modelId !== serviceForm.primaryModelId).map((model) => (
                    <SelectItem key={model.modelId} value={model.modelId}>
                      {model.name} ({model.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>{t.isActive}</Label>
              <Switch
                checked={serviceForm.isEnabled}
                onCheckedChange={(checked) => setServiceForm({ ...serviceForm, isEnabled: checked })}
                data-testid="switch-service-enabled"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              onClick={() => saveServiceMutation.mutate(serviceForm)}
              disabled={saveServiceMutation.isPending || !serviceForm.serviceName || !serviceForm.displayName}
              data-testid="button-save-service"
            >
              {saveServiceMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteConfirm}</DialogTitle>
            <DialogDescription>{t.deleteDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedModel && deleteModelMutation.mutate(selectedModel.modelId)}
              disabled={deleteModelMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteModelMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
