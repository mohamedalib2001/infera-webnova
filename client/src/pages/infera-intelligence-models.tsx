/**
 * INFERA Intelligence Models Unit - Sovereign AI Model Management
 * وحدة نماذج الذكاء الاصطناعي المملوكة لمنظومة INFERA
 * 
 * INFERA = مصدر للذكاء الاصطناعي وليس مستهلك
 * Dynamic-First Architecture - No Hardcoded Values
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
  Brain, Plus, Edit, Trash2, Power, Loader2, 
  MessageCircle, Users, Code, Hammer, BarChart3,
  Key, Activity, Shield, Settings, Link2, Copy,
  Eye, EyeOff, RefreshCw, Clock, Zap, Crown
} from "lucide-react";

const translations = {
  en: {
    title: "INFERA Intelligence Models",
    subtitle: "Sovereign AI Model Management - Export Intelligence as Service",
    modelsTab: "INFERA Models",
    apiKeysTab: "API Keys",
    usageTab: "Usage Analytics",
    settingsTab: "Configuration",
    
    addModel: "Add Model",
    editModel: "Edit Model",
    createModel: "Create INFERA Model",
    
    displayName: "Display Name",
    displayNameAr: "Arabic Name",
    slug: "URL Slug",
    description: "Description",
    descriptionAr: "Arabic Description",
    functionalRole: "Functional Role",
    serviceLevel: "Service Level",
    status: "Status",
    backendModel: "Backend Model",
    fallbackModel: "Fallback Model",
    
    chat: "Chat",
    consult: "Consulting",
    code: "Code Generation",
    build: "Application Building",
    analyze: "Data Analysis",
    assist: "General Assistant",
    custom: "Custom Role",
    
    core: "Core",
    pro: "Professional",
    elite: "Elite",
    enterprise: "Enterprise",
    sovereign: "Sovereign",
    
    active: "Active",
    inactive: "Inactive",
    testing: "Testing",
    deprecated: "Deprecated",
    
    systemPrompt: "System Prompt",
    temperature: "Temperature",
    maxTokens: "Max Tokens",
    
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    activate: "Activate",
    deactivate: "Deactivate",
    bind: "Bind Backend",
    
    noModels: "No INFERA models configured",
    noModelsDesc: "Create your first sovereign AI model to export intelligence as service",
    
    totalModels: "Total Models",
    activeModels: "Active Models",
    totalRequests: "Total Requests",
    totalTokens: "Total Tokens",
    
    createApiKey: "Create API Key",
    apiKeyName: "Key Name",
    apiKeyDesc: "Description",
    allowedModels: "Allowed Models",
    rateLimit: "Rate Limit (per minute)",
    monthlyBudget: "Monthly Budget ($)",
    
    noApiKeys: "No API keys configured",
    noApiKeysDesc: "Create API keys to allow clients to access INFERA models",
    
    copyKey: "Copy Key",
    revokeKey: "Revoke Key",
    rotateKey: "Rotate Key",
    
    keyCreatedWarning: "Save this key now! It won't be shown again.",
    
    totalKeys: "Total Keys",
    activeKeys: "Active Keys",
    totalSpend: "Total Spend",
    
    bindBackendModel: "Bind to Backend Model",
    selectBackendModel: "Select Backend Model",
    bindSuccess: "Model binding updated",
    
    auditLog: "Audit Log",
    viewAudit: "View Changes",
  },
  ar: {
    title: "نماذج INFERA الذكية",
    subtitle: "إدارة نماذج الذكاء الاصطناعي السيادية - تصدير الذكاء كخدمة",
    modelsTab: "نماذج INFERA",
    apiKeysTab: "مفاتيح API",
    usageTab: "تحليلات الاستخدام",
    settingsTab: "التكوين",
    
    addModel: "إضافة نموذج",
    editModel: "تعديل النموذج",
    createModel: "إنشاء نموذج INFERA",
    
    displayName: "اسم العرض",
    displayNameAr: "الاسم العربي",
    slug: "المعرف URL",
    description: "الوصف",
    descriptionAr: "الوصف العربي",
    functionalRole: "الدور الوظيفي",
    serviceLevel: "مستوى الخدمة",
    status: "الحالة",
    backendModel: "النموذج الخلفي",
    fallbackModel: "النموذج الاحتياطي",
    
    chat: "محادثة",
    consult: "استشارات",
    code: "توليد الأكواد",
    build: "بناء التطبيقات",
    analyze: "تحليل البيانات",
    assist: "مساعد عام",
    custom: "دور مخصص",
    
    core: "أساسي",
    pro: "احترافي",
    elite: "متميز",
    enterprise: "مؤسسي",
    sovereign: "سيادي",
    
    active: "نشط",
    inactive: "غير نشط",
    testing: "اختبار",
    deprecated: "متقادم",
    
    systemPrompt: "موجه النظام",
    temperature: "درجة الحرارة",
    maxTokens: "أقصى عدد رموز",
    
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    activate: "تفعيل",
    deactivate: "إلغاء التفعيل",
    bind: "ربط بالخلفية",
    
    noModels: "لا توجد نماذج INFERA",
    noModelsDesc: "أنشئ أول نموذج ذكاء اصطناعي سيادي لتصدير الذكاء كخدمة",
    
    totalModels: "إجمالي النماذج",
    activeModels: "النماذج النشطة",
    totalRequests: "إجمالي الطلبات",
    totalTokens: "إجمالي الرموز",
    
    createApiKey: "إنشاء مفتاح API",
    apiKeyName: "اسم المفتاح",
    apiKeyDesc: "الوصف",
    allowedModels: "النماذج المسموحة",
    rateLimit: "حد المعدل (في الدقيقة)",
    monthlyBudget: "الميزانية الشهرية ($)",
    
    noApiKeys: "لا توجد مفاتيح API",
    noApiKeysDesc: "أنشئ مفاتيح API للسماح للعملاء بالوصول لنماذج INFERA",
    
    copyKey: "نسخ المفتاح",
    revokeKey: "إلغاء المفتاح",
    rotateKey: "تدوير المفتاح",
    
    keyCreatedWarning: "احفظ هذا المفتاح الآن! لن يظهر مرة أخرى.",
    
    totalKeys: "إجمالي المفاتيح",
    activeKeys: "المفاتيح النشطة",
    totalSpend: "إجمالي الإنفاق",
    
    bindBackendModel: "ربط بنموذج خلفي",
    selectBackendModel: "اختر النموذج الخلفي",
    bindSuccess: "تم تحديث ربط النموذج",
    
    auditLog: "سجل التدقيق",
    viewAudit: "عرض التغييرات",
  }
};

const roleIcons: Record<string, any> = {
  chat: MessageCircle,
  consult: Users,
  code: Code,
  build: Hammer,
  analyze: BarChart3,
  assist: Brain,
  custom: Settings,
};

const levelColors: Record<string, string> = {
  core: "bg-slate-500",
  pro: "bg-blue-500",
  elite: "bg-purple-500",
  enterprise: "bg-amber-500",
  sovereign: "bg-gradient-to-r from-amber-500 to-amber-600",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  testing: "bg-yellow-500",
  deprecated: "bg-red-500",
};

interface InferaModel {
  id: string;
  displayName: string;
  displayNameAr: string | null;
  slug: string;
  description: string | null;
  descriptionAr: string | null;
  functionalRole: string;
  customRole: string | null;
  serviceLevel: string;
  icon: string | null;
  brandColor: string | null;
  backendModelId: string | null;
  fallbackModelId: string | null;
  engineBindings: { primary: string; fallbacks: string[] } | null;
  systemPrompt: string | null;
  systemPromptAr: string | null;
  temperature: number | null;
  maxTokens: number | null;
  capabilities: string[] | null;
  supportedFormats: string[] | null;
  rateLimitPerMinute: number | null;
  rateLimitPerDay: number | null;
  status: string;
  statusMessage: string | null;
  sortOrder: number | null;
  showInCatalog: boolean | null;
  totalRequests: number | null;
  totalTokens: number | null;
  averageLatencyMs: number | null;
  lastUsedAt: string | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  description: string | null;
  keyPrefix: string;
  status: string;
  allowedModelIds: string[] | null;
  allowedFunctionalRoles: string[] | null;
  rateLimitPerMinute: number | null;
  rateLimitPerHour: number | null;
  rateLimitPerDay: number | null;
  monthlyBudgetCents: number | null;
  currentMonthSpendCents: number | null;
  totalRequests: number | null;
  totalTokens: number | null;
  totalCostCents: number | null;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface BackendModel {
  id: string;
  name: string;
  nameAr: string | null;
  provider: string;
  modelType: string;
  status: string;
  capabilities: string[] | null;
}

export default function InferaIntelligenceModels() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations] || translations.en;
  const isRTL = language === "ar";
  
  const [activeTab, setActiveTab] = useState("models");
  const [showModelDialog, setShowModelDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showBindDialog, setShowBindDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<InferaModel | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  
  const [modelForm, setModelForm] = useState({
    displayName: "",
    displayNameAr: "",
    slug: "",
    description: "",
    descriptionAr: "",
    functionalRole: "chat",
    serviceLevel: "core",
    systemPrompt: "",
    systemPromptAr: "",
    temperature: 0.7,
    maxTokens: 4096,
    status: "inactive",
  });
  
  const [apiKeyForm, setApiKeyForm] = useState({
    name: "",
    description: "",
    allowedModelIds: [] as string[],
    rateLimitPerMinute: 60,
    monthlyBudgetCents: 0,
  });

  const { data: modelsData, isLoading: modelsLoading } = useQuery<{
    models: InferaModel[];
    stats: {
      totalModels: number;
      activeModels: number;
      testingModels: number;
      inactiveModels: number;
      totalRequests: number;
      totalTokens: number;
    };
  }>({
    queryKey: ["/api/sovereign/infera-models"],
  });

  const { data: apiKeysData, isLoading: apiKeysLoading } = useQuery<{
    keys: ApiKey[];
    stats: {
      totalKeys: number;
      activeKeys: number;
      totalRequests: number;
      totalSpendCents: number;
    };
  }>({
    queryKey: ["/api/sovereign/infera-api-keys"],
  });

  const { data: backendModels } = useQuery<BackendModel[]>({
    queryKey: ["/api/sovereign/infera-backend-models"],
  });

  const createModelMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/sovereign/infera-models", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign/infera-models"] });
      setShowModelDialog(false);
      resetModelForm();
      toast({ title: language === "ar" ? "تم إنشاء النموذج" : "Model created" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to create model", variant: "destructive" });
    },
  });

  const updateModelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/sovereign/infera-models/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign/infera-models"] });
      setShowModelDialog(false);
      setSelectedModel(null);
      resetModelForm();
      toast({ title: language === "ar" ? "تم تحديث النموذج" : "Model updated" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to update model", variant: "destructive" });
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/sovereign/infera-models/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign/infera-models"] });
      toast({ title: language === "ar" ? "تم حذف النموذج" : "Model deleted" });
    },
  });

  const toggleModelMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/sovereign/infera-models/${id}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign/infera-models"] });
      toast({ title: language === "ar" ? "تم تحديث الحالة" : "Status updated" });
    },
  });

  const bindModelMutation = useMutation({
    mutationFn: async ({ id, backendModelId }: { id: string; backendModelId: string }) => {
      return apiRequest("POST", `/api/sovereign/infera-models/${id}/bind`, { backendModelId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign/infera-models"] });
      setShowBindDialog(false);
      setSelectedModel(null);
      toast({ title: t.bindSuccess });
    },
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/sovereign/infera-api-keys", data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign/infera-api-keys"] });
      setNewApiKey(data.apiKey);
      toast({ title: language === "ar" ? "تم إنشاء المفتاح" : "API key created" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to create API key", variant: "destructive" });
    },
  });

  const revokeApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/sovereign/infera-api-keys/${id}/revoke`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign/infera-api-keys"] });
      toast({ title: language === "ar" ? "تم إلغاء المفتاح" : "API key revoked" });
    },
  });

  const resetModelForm = () => {
    setModelForm({
      displayName: "",
      displayNameAr: "",
      slug: "",
      description: "",
      descriptionAr: "",
      functionalRole: "chat",
      serviceLevel: "core",
      systemPrompt: "",
      systemPromptAr: "",
      temperature: 0.7,
      maxTokens: 4096,
      status: "inactive",
    });
  };

  const openEditModel = (model: InferaModel) => {
    setSelectedModel(model);
    setModelForm({
      displayName: model.displayName,
      displayNameAr: model.displayNameAr || "",
      slug: model.slug,
      description: model.description || "",
      descriptionAr: model.descriptionAr || "",
      functionalRole: model.functionalRole,
      serviceLevel: model.serviceLevel,
      systemPrompt: model.systemPrompt || "",
      systemPromptAr: model.systemPromptAr || "",
      temperature: model.temperature || 0.7,
      maxTokens: model.maxTokens || 4096,
      status: model.status,
    });
    setShowModelDialog(true);
  };

  const handleSaveModel = () => {
    if (selectedModel) {
      updateModelMutation.mutate({ id: selectedModel.id, data: modelForm });
    } else {
      createModelMutation.mutate(modelForm);
    }
  };

  const handleCreateApiKey = () => {
    createApiKeyMutation.mutate({
      ...apiKeyForm,
      monthlyBudgetCents: apiKeyForm.monthlyBudgetCents * 100,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: language === "ar" ? "تم النسخ" : "Copied to clipboard" });
  };

  const models = modelsData?.models || [];
  const stats = modelsData?.stats;
  const apiKeys = apiKeysData?.keys || [];
  const apiKeyStats = apiKeysData?.stats;

  return (
    <div className={`p-6 space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
            <Brain className="h-8 w-8 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
          <Crown className="h-3 w-3 mr-1" />
          Sovereign Only
        </Badge>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{t.totalModels}</span>
              </div>
              <p className="text-2xl font-bold mt-1" data-testid="text-total-models">{stats.totalModels}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Power className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">{t.activeModels}</span>
              </div>
              <p className="text-2xl font-bold mt-1" data-testid="text-active-models">{stats.activeModels}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">{t.totalRequests}</span>
              </div>
              <p className="text-2xl font-bold mt-1" data-testid="text-total-requests">{stats.totalRequests.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">{t.totalTokens}</span>
              </div>
              <p className="text-2xl font-bold mt-1" data-testid="text-total-tokens">{stats.totalTokens.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="models" data-testid="tab-models">
            <Brain className="h-4 w-4 mr-2" />
            {t.modelsTab}
          </TabsTrigger>
          <TabsTrigger value="apikeys" data-testid="tab-apikeys">
            <Key className="h-4 w-4 mr-2" />
            {t.apiKeysTab}
          </TabsTrigger>
          <TabsTrigger value="usage" data-testid="tab-usage">
            <Activity className="h-4 w-4 mr-2" />
            {t.usageTab}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetModelForm(); setSelectedModel(null); setShowModelDialog(true); }} data-testid="button-add-model">
              <Plus className="h-4 w-4 mr-2" />
              {t.addModel}
            </Button>
          </div>

          {modelsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : models.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">{t.noModels}</h3>
                <p className="text-muted-foreground mt-1">{t.noModelsDesc}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {models.map((model) => {
                const RoleIcon = roleIcons[model.functionalRole] || Brain;
                return (
                  <Card key={model.id} className="overflow-visible" data-testid={`card-model-${model.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4">
                          <div 
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: model.brandColor || "#3B82F6" + "20" }}
                          >
                            <RoleIcon className="h-6 w-6" style={{ color: model.brandColor || "#3B82F6" }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg" data-testid={`text-model-name-${model.id}`}>
                                {language === "ar" && model.displayNameAr ? model.displayNameAr : model.displayName}
                              </h3>
                              <Badge variant="outline" className={`text-white ${statusColors[model.status]}`}>
                                {t[model.status as keyof typeof t] || model.status}
                              </Badge>
                              <Badge variant="secondary" className={`text-white ${levelColors[model.serviceLevel]}`}>
                                {t[model.serviceLevel as keyof typeof t] || model.serviceLevel}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {language === "ar" && model.descriptionAr ? model.descriptionAr : model.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {(model.totalRequests || 0).toLocaleString()} requests
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                {(model.totalTokens || 0).toLocaleString()} tokens
                              </span>
                              {model.backendModelId && (
                                <span className="flex items-center gap-1">
                                  <Link2 className="h-3 w-3" />
                                  Bound
                                </span>
                              )}
                              {model.lastUsedAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(model.lastUsedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedModel(model); setShowBindDialog(true); }}
                            data-testid={`button-bind-${model.id}`}
                          >
                            <Link2 className="h-4 w-4 mr-1" />
                            {t.bind}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleModelMutation.mutate(model.id)}
                            disabled={toggleModelMutation.isPending}
                            data-testid={`button-toggle-${model.id}`}
                          >
                            <Power className={`h-4 w-4 mr-1 ${model.status === 'active' ? 'text-green-500' : ''}`} />
                            {model.status === 'active' ? t.deactivate : t.activate}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModel(model)}
                            data-testid={`button-edit-${model.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              if (confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete this model?")) {
                                deleteModelMutation.mutate(model.id);
                              }
                            }}
                            data-testid={`button-delete-${model.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

        <TabsContent value="apikeys" className="space-y-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            {apiKeyStats && (
              <div className="flex gap-4 flex-wrap">
                <Badge variant="outline">{t.totalKeys}: {apiKeyStats.totalKeys}</Badge>
                <Badge variant="outline" className="text-green-600">{t.activeKeys}: {apiKeyStats.activeKeys}</Badge>
                <Badge variant="outline">{t.totalSpend}: ${(apiKeyStats.totalSpendCents / 100).toFixed(2)}</Badge>
              </div>
            )}
            <Button onClick={() => setShowApiKeyDialog(true)} data-testid="button-create-apikey">
              <Plus className="h-4 w-4 mr-2" />
              {t.createApiKey}
            </Button>
          </div>

          {apiKeysLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : apiKeys.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">{t.noApiKeys}</h3>
                <p className="text-muted-foreground mt-1">{t.noApiKeysDesc}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <Card key={key.id} data-testid={`card-apikey-${key.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-semibold">{key.name}</h3>
                          <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                            {key.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{key.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                          <code className="bg-muted px-2 py-1 rounded">{key.keyPrefix}...</code>
                          <span>{(key.totalRequests || 0).toLocaleString()} requests</span>
                          <span>${((key.totalCostCents || 0) / 100).toFixed(2)} spent</span>
                          {key.lastUsedAt && (
                            <span>Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeApiKeyMutation.mutate(key.id)}
                          disabled={key.status === 'revoked' || revokeApiKeyMutation.isPending}
                          data-testid={`button-revoke-${key.id}`}
                        >
                          <EyeOff className="h-4 w-4 mr-1" />
                          {t.revokeKey}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t.usageTab}
              </CardTitle>
              <CardDescription>
                {language === "ar" 
                  ? "تحليلات استخدام نماذج INFERA ومفاتيح API"
                  : "INFERA models and API keys usage analytics"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {language === "ar" 
                  ? "سيتم عرض تحليلات الاستخدام هنا"
                  : "Usage analytics will be displayed here"
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showModelDialog} onOpenChange={setShowModelDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedModel ? t.editModel : t.createModel}</DialogTitle>
            <DialogDescription>
              {language === "ar" 
                ? "أنشئ أو عدل نموذج INFERA الذكي"
                : "Create or edit INFERA Intelligence Model"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.displayName}</Label>
                <Input 
                  value={modelForm.displayName}
                  onChange={(e) => setModelForm({ ...modelForm, displayName: e.target.value })}
                  placeholder="INFERA Chat"
                  data-testid="input-display-name"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.displayNameAr}</Label>
                <Input 
                  value={modelForm.displayNameAr}
                  onChange={(e) => setModelForm({ ...modelForm, displayNameAr: e.target.value })}
                  placeholder="إنفيرا شات"
                  dir="rtl"
                  data-testid="input-display-name-ar"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.slug}</Label>
              <Input 
                value={modelForm.slug}
                onChange={(e) => setModelForm({ ...modelForm, slug: e.target.value })}
                placeholder="infera-chat"
                data-testid="input-slug"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.description}</Label>
                <Textarea 
                  value={modelForm.description}
                  onChange={(e) => setModelForm({ ...modelForm, description: e.target.value })}
                  placeholder="Intelligent conversational AI..."
                  data-testid="input-description"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.descriptionAr}</Label>
                <Textarea 
                  value={modelForm.descriptionAr}
                  onChange={(e) => setModelForm({ ...modelForm, descriptionAr: e.target.value })}
                  placeholder="ذكاء اصطناعي محادثي..."
                  dir="rtl"
                  data-testid="input-description-ar"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t.functionalRole}</Label>
                <Select 
                  value={modelForm.functionalRole}
                  onValueChange={(v) => setModelForm({ ...modelForm, functionalRole: v })}
                >
                  <SelectTrigger data-testid="select-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">{t.chat}</SelectItem>
                    <SelectItem value="consult">{t.consult}</SelectItem>
                    <SelectItem value="code">{t.code}</SelectItem>
                    <SelectItem value="build">{t.build}</SelectItem>
                    <SelectItem value="analyze">{t.analyze}</SelectItem>
                    <SelectItem value="assist">{t.assist}</SelectItem>
                    <SelectItem value="custom">{t.custom}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.serviceLevel}</Label>
                <Select 
                  value={modelForm.serviceLevel}
                  onValueChange={(v) => setModelForm({ ...modelForm, serviceLevel: v })}
                >
                  <SelectTrigger data-testid="select-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">{t.core}</SelectItem>
                    <SelectItem value="pro">{t.pro}</SelectItem>
                    <SelectItem value="elite">{t.elite}</SelectItem>
                    <SelectItem value="enterprise">{t.enterprise}</SelectItem>
                    <SelectItem value="sovereign">{t.sovereign}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.status}</Label>
                <Select 
                  value={modelForm.status}
                  onValueChange={(v) => setModelForm({ ...modelForm, status: v })}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inactive">{t.inactive}</SelectItem>
                    <SelectItem value="testing">{t.testing}</SelectItem>
                    <SelectItem value="active">{t.active}</SelectItem>
                    <SelectItem value="deprecated">{t.deprecated}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t.systemPrompt}</Label>
              <Textarea 
                value={modelForm.systemPrompt}
                onChange={(e) => setModelForm({ ...modelForm, systemPrompt: e.target.value })}
                placeholder="You are INFERA Chat, an intelligent assistant..."
                rows={3}
                data-testid="input-system-prompt"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.temperature}</Label>
                <Input 
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={modelForm.temperature}
                  onChange={(e) => setModelForm({ ...modelForm, temperature: parseFloat(e.target.value) })}
                  data-testid="input-temperature"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.maxTokens}</Label>
                <Input 
                  type="number"
                  min="100"
                  max="128000"
                  value={modelForm.maxTokens}
                  onChange={(e) => setModelForm({ ...modelForm, maxTokens: parseInt(e.target.value) })}
                  data-testid="input-max-tokens"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModelDialog(false)}>
              {t.cancel}
            </Button>
            <Button 
              onClick={handleSaveModel}
              disabled={createModelMutation.isPending || updateModelMutation.isPending}
              data-testid="button-save-model"
            >
              {(createModelMutation.isPending || updateModelMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBindDialog} onOpenChange={setShowBindDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.bindBackendModel}</DialogTitle>
            <DialogDescription>
              {language === "ar" 
                ? `ربط ${selectedModel?.displayNameAr || selectedModel?.displayName} بنموذج خلفي`
                : `Bind ${selectedModel?.displayName} to a backend model`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.selectBackendModel}</Label>
              <Select 
                onValueChange={(v) => {
                  if (selectedModel) {
                    bindModelMutation.mutate({ id: selectedModel.id, backendModelId: v });
                  }
                }}
              >
                <SelectTrigger data-testid="select-backend-model">
                  <SelectValue placeholder={t.selectBackendModel} />
                </SelectTrigger>
                <SelectContent>
                  {(backendModels || []).map((bm) => (
                    <SelectItem key={bm.id} value={bm.id}>
                      {bm.name} ({bm.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBindDialog(false)}>
              {t.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApiKeyDialog} onOpenChange={(open) => { 
        setShowApiKeyDialog(open); 
        if (!open) setNewApiKey(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.createApiKey}</DialogTitle>
          </DialogHeader>
          
          {newApiKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-2 font-medium">
                  {t.keyCreatedWarning}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background p-2 rounded text-xs break-all">{newApiKey}</code>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={() => copyToClipboard(newApiKey)}
                    data-testid="button-copy-key"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { setShowApiKeyDialog(false); setNewApiKey(null); }}>
                  {language === "ar" ? "تم" : "Done"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.apiKeyName}</Label>
                  <Input 
                    value={apiKeyForm.name}
                    onChange={(e) => setApiKeyForm({ ...apiKeyForm, name: e.target.value })}
                    placeholder="Production API Key"
                    data-testid="input-apikey-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.apiKeyDesc}</Label>
                  <Input 
                    value={apiKeyForm.description}
                    onChange={(e) => setApiKeyForm({ ...apiKeyForm, description: e.target.value })}
                    placeholder="API key for production app"
                    data-testid="input-apikey-desc"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.rateLimit}</Label>
                    <Input 
                      type="number"
                      value={apiKeyForm.rateLimitPerMinute}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, rateLimitPerMinute: parseInt(e.target.value) })}
                      data-testid="input-rate-limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.monthlyBudget}</Label>
                    <Input 
                      type="number"
                      value={apiKeyForm.monthlyBudgetCents}
                      onChange={(e) => setApiKeyForm({ ...apiKeyForm, monthlyBudgetCents: parseInt(e.target.value) })}
                      data-testid="input-monthly-budget"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
                  {t.cancel}
                </Button>
                <Button 
                  onClick={handleCreateApiKey}
                  disabled={createApiKeyMutation.isPending || !apiKeyForm.name}
                  data-testid="button-create-key"
                >
                  {createApiKeyMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {t.createApiKey}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
