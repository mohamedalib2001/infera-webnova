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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Key, Plus, Eye, EyeOff, RefreshCw, Trash2, Shield, CheckCircle, XCircle, Loader2, Bot, Sparkles, AlertTriangle, DollarSign } from "lucide-react";
import { SiOpenai, SiGooglecloud } from "react-icons/si";

const translations = {
  en: {
    title: "AI Provider Settings",
    subtitle: "Configure and manage AI providers for the platform",
    addProvider: "Add Provider",
    provider: "Provider",
    displayName: "Display Name",
    apiKey: "API Key",
    apiKeyPlaceholder: "sk-ant-api03-...",
    defaultModel: "Default Model",
    baseUrl: "Custom Base URL (optional)",
    baseUrlPlaceholder: "https://api.anthropic.com",
    isActive: "Active",
    save: "Save",
    cancel: "Cancel",
    test: "Test Connection",
    delete: "Delete",
    testing: "Testing...",
    testSuccess: "Connection successful!",
    testFailed: "Connection failed",
    noProviders: "No AI providers configured",
    noProvidersDesc: "Add your first AI provider to enable AI features",
    lastTested: "Last tested",
    hasKey: "API Key configured",
    noKey: "No API Key",
    connected: "Connected",
    disconnected: "Disconnected",
    models: "Models",
    anthropicModels: "claude-sonnet-4-5, claude-opus-4-5, claude-haiku-4-5",
    openaiModels: "gpt-4o, gpt-4o-mini, gpt-4-turbo",
    googleModels: "gemini-pro, gemini-ultra, palm-2",
    deleteConfirm: "Delete this provider?",
    deleteDesc: "This will remove the API key and configuration.",
    securityNote: "API keys are encrypted and stored securely",
    providerActive: "Provider is active and ready to use",
    providerInactive: "Provider is inactive",
    editProvider: "Edit Provider",
  },
  ar: {
    title: "إعدادات مزودي الذكاء الاصطناعي",
    subtitle: "إدارة وتهيئة مزودي الذكاء الاصطناعي للمنصة",
    addProvider: "إضافة مزود",
    provider: "المزود",
    displayName: "اسم العرض",
    apiKey: "مفتاح API",
    apiKeyPlaceholder: "sk-ant-api03-...",
    defaultModel: "النموذج الافتراضي",
    baseUrl: "رابط مخصص (اختياري)",
    baseUrlPlaceholder: "https://api.anthropic.com",
    isActive: "نشط",
    save: "حفظ",
    cancel: "إلغاء",
    test: "اختبار الاتصال",
    delete: "حذف",
    testing: "جارٍ الاختبار...",
    testSuccess: "الاتصال ناجح!",
    testFailed: "فشل الاتصال",
    noProviders: "لا توجد مزودات مُهيأة",
    noProvidersDesc: "أضف أول مزود ذكاء اصطناعي لتفعيل ميزات AI",
    lastTested: "آخر اختبار",
    hasKey: "مفتاح API مُهيأ",
    noKey: "لا يوجد مفتاح",
    connected: "متصل",
    disconnected: "غير متصل",
    models: "النماذج",
    anthropicModels: "claude-sonnet-4-5, claude-opus-4-5, claude-haiku-4-5",
    openaiModels: "gpt-4o, gpt-4o-mini, gpt-4-turbo",
    googleModels: "gemini-pro, gemini-ultra, palm-2",
    deleteConfirm: "حذف هذا المزود؟",
    deleteDesc: "سيتم حذف مفتاح API والإعدادات.",
    securityNote: "مفاتيح API مشفرة ومخزنة بشكل آمن",
    providerActive: "المزود نشط وجاهز للاستخدام",
    providerInactive: "المزود غير نشط",
    editProvider: "تعديل المزود",
  },
};

const providerInfo = {
  anthropic: {
    icon: Bot,
    color: "bg-orange-500",
    models: ["claude-sonnet-4-5", "claude-opus-4-5", "claude-haiku-4-5", "claude-opus-4-1"],
    placeholder: "sk-ant-api03-...",
  },
  openai: {
    icon: SiOpenai,
    color: "bg-green-600",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    placeholder: "sk-...",
  },
  google: {
    icon: SiGooglecloud,
    color: "bg-blue-500",
    models: ["gemini-pro", "gemini-ultra", "palm-2"],
    placeholder: "AIza...",
  },
  meta: {
    icon: Sparkles,
    color: "bg-purple-600",
    models: ["llama-2-70b", "llama-2-13b"],
    placeholder: "...",
  },
};

type ProviderType = keyof typeof providerInfo;

interface AIProviderConfig {
  id: string;
  provider: string;
  displayName: string;
  apiKeyPrefix: string | null;
  hasApiKey: boolean;
  defaultModel: string | null;
  baseUrl: string | null;
  isActive: boolean;
  lastTestedAt: string | null;
  lastTestResult: string | null;
  lastTestError: string | null;
  currentBalance: number | null;
  lowBalanceThreshold: number | null;
  lastBalanceCheckAt: string | null;
  balanceCheckError: string | null;
}

export default function AISettingsPage() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  const isRTL = language === "ar";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderConfig | null>(null);
  const [formData, setFormData] = useState({
    provider: "anthropic" as ProviderType,
    displayName: "",
    apiKey: "",
    defaultModel: "",
    baseUrl: "",
    isActive: true,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  const { data: providers = [], isLoading } = useQuery<AIProviderConfig[]>({
    queryKey: ["/api/owner/ai-providers"],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/owner/ai-providers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-providers"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: language === "ar" ? "تم الحفظ" : "Saved",
        description: language === "ar" ? "تم حفظ إعدادات المزود" : "Provider settings saved",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message,
      });
    },
  });

  const testMutation = useMutation({
    mutationFn: async (provider: string) => {
      setTestingProvider(provider);
      const response = await apiRequest("POST", `/api/owner/ai-providers/${provider}/test`);
      return response;
    },
    onSuccess: (data) => {
      setTestingProvider(null);
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-providers"] });
      if (data.success) {
        toast({
          title: t.testSuccess,
          description: language === "ar" ? "المزود يعمل بشكل صحيح" : "Provider is working correctly",
        });
      } else {
        toast({
          variant: "destructive",
          title: t.testFailed,
          description: data.error,
        });
      }
    },
    onError: (error: any) => {
      setTestingProvider(null);
      toast({
        variant: "destructive",
        title: t.testFailed,
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (provider: string) => {
      return apiRequest("DELETE", `/api/owner/ai-providers/${provider}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-providers"] });
      setDeleteDialogOpen(false);
      setSelectedProvider(null);
      toast({
        title: language === "ar" ? "تم الحذف" : "Deleted",
        description: language === "ar" ? "تم حذف المزود" : "Provider deleted",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message,
      });
    },
  });

  const [checkingBalance, setCheckingBalance] = useState<string | null>(null);

  const balanceMutation = useMutation({
    mutationFn: async (provider: string) => {
      setCheckingBalance(provider);
      const response = await apiRequest("POST", `/api/owner/ai-providers/${provider}/balance`);
      return response;
    },
    onSuccess: (data) => {
      setCheckingBalance(null);
      queryClient.invalidateQueries({ queryKey: ["/api/owner/ai-providers"] });
      if (data.success) {
        toast({
          title: language === "ar" ? "تم التحقق من الرصيد" : "Balance Checked",
          description: language === "ar" ? `الرصيد: $${data.balance?.toFixed(2) || 0}` : `Balance: $${data.balance?.toFixed(2) || 0}`,
        });
      } else if (data.error) {
        toast({
          variant: "destructive",
          title: language === "ar" ? "تعذر التحقق" : "Check Failed",
          description: data.error,
        });
      }
    },
    onError: (error: any) => {
      setCheckingBalance(null);
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      provider: "anthropic",
      displayName: "",
      apiKey: "",
      defaultModel: "",
      baseUrl: "",
      isActive: true,
    });
    setSelectedProvider(null);
    setShowApiKey(false);
  };

  const openEditDialog = (config: AIProviderConfig) => {
    setSelectedProvider(config);
    setFormData({
      provider: config.provider as ProviderType,
      displayName: config.displayName,
      apiKey: "",
      defaultModel: config.defaultModel || "",
      baseUrl: config.baseUrl || "",
      isActive: config.isActive,
    });
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.displayName) {
      toast({
        variant: "destructive",
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "اسم العرض مطلوب" : "Display name is required",
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const getProviderIcon = (provider: string) => {
    const info = providerInfo[provider as ProviderType];
    if (!info) return Bot;
    return info.icon;
  };

  const getProviderColor = (provider: string) => {
    const info = providerInfo[provider as ProviderType];
    return info?.color || "bg-gray-500";
  };

  const configuredProviders = new Set(providers.map(p => p.provider));
  const availableProviders = Object.keys(providerInfo).filter(p => !configuredProviders.has(p) || selectedProvider?.provider === p);

  return (
    <div className={`min-h-screen bg-background p-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-ai-settings-title">
              <Shield className="h-6 w-6 text-primary" />
              {t.title}
            </h1>
            <p className="text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          <Button onClick={openAddDialog} data-testid="button-add-provider">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t.addProvider}</span>
          </Button>
        </div>

        <Card className="mb-4">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Key className="h-4 w-4" />
              <span>{t.securityNote}</span>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : providers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t.noProviders}</h3>
              <p className="text-muted-foreground mt-1">{t.noProvidersDesc}</p>
              <Button onClick={openAddDialog} className="mt-4" data-testid="button-add-first-provider">
                <Plus className="h-4 w-4" />
                {t.addProvider}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {providers.map((config) => {
              const Icon = getProviderIcon(config.provider);
              return (
                <Card key={config.id} className="relative" data-testid={`card-provider-${config.provider}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getProviderColor(config.provider)}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{config.displayName}</CardTitle>
                          <CardDescription className="capitalize">{config.provider}</CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={config.isActive ? "default" : "secondary"}
                        className={config.isActive ? "bg-green-600" : ""}
                      >
                        {config.isActive ? t.connected : t.disconnected}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      {config.hasApiKey ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{t.hasKey}: {config.apiKeyPrefix}...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-destructive" />
                          <span className="text-destructive">{t.noKey}</span>
                        </>
                      )}
                    </div>

                    {config.defaultModel && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">{t.defaultModel}:</span> {config.defaultModel}
                      </div>
                    )}

                    {config.lastTestedAt && (
                      <div className="flex items-center gap-2 text-sm">
                        {config.lastTestResult === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-muted-foreground">
                          {t.lastTested}: {new Date(config.lastTestedAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                        </span>
                      </div>
                    )}

                    {/* Balance Section */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium">
                            {language === "ar" ? "الرصيد" : "Balance"}:
                          </span>
                          {config.currentBalance !== null ? (
                            <span className={`text-sm font-bold ${
                              config.currentBalance < (config.lowBalanceThreshold || 10) 
                                ? "text-red-500" 
                                : "text-green-600"
                            }`}>
                              {" "}${config.currentBalance.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {" "}{language === "ar" ? "غير متوفر" : "N/A"}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => balanceMutation.mutate(config.provider)}
                        disabled={!config.hasApiKey || checkingBalance === config.provider}
                        data-testid={`button-balance-${config.provider}`}
                      >
                        {checkingBalance === config.provider ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {config.currentBalance !== null && config.currentBalance < (config.lowBalanceThreshold || 10) && (
                      <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                          {language === "ar" 
                            ? `تنبيه: الرصيد أقل من الحد (${config.lowBalanceThreshold || 10}$)` 
                            : `Warning: Balance below threshold ($${config.lowBalanceThreshold || 10})`}
                        </span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(config)}
                        data-testid={`button-edit-${config.provider}`}
                      >
                        <Key className="h-4 w-4" />
                        {t.editProvider}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testMutation.mutate(config.provider)}
                        disabled={!config.hasApiKey || testingProvider === config.provider}
                        data-testid={`button-test-${config.provider}`}
                      >
                        {testingProvider === config.provider ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        {testingProvider === config.provider ? t.testing : t.test}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          setSelectedProvider(config);
                          setDeleteDialogOpen(true);
                        }}
                        data-testid={`button-delete-${config.provider}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedProvider ? t.editProvider : t.addProvider}
              </DialogTitle>
              <DialogDescription>
                {t.securityNote}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t.provider}</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value: ProviderType) => setFormData({ ...formData, provider: value, defaultModel: providerInfo[value].models[0] })}
                  disabled={!!selectedProvider}
                >
                  <SelectTrigger data-testid="select-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedProvider ? [selectedProvider.provider] : availableProviders).map((p) => {
                      const Icon = getProviderIcon(p);
                      return (
                        <SelectItem key={p} value={p}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="capitalize">{p}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t.displayName}</Label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder={formData.provider === "anthropic" ? "Anthropic Claude" : formData.provider === "openai" ? "OpenAI GPT" : "AI Provider"}
                  data-testid="input-display-name"
                />
              </div>

              <div className="space-y-2">
                <Label>{t.apiKey}</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder={selectedProvider?.hasApiKey ? "(leave empty to keep current)" : providerInfo[formData.provider]?.placeholder}
                    data-testid="input-api-key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 end-0 h-full"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.defaultModel}</Label>
                <Select
                  value={formData.defaultModel}
                  onValueChange={(value) => setFormData({ ...formData, defaultModel: value })}
                >
                  <SelectTrigger data-testid="select-model">
                    <SelectValue placeholder={t.defaultModel} />
                  </SelectTrigger>
                  <SelectContent>
                    {providerInfo[formData.provider]?.models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t.baseUrl}</Label>
                <Input
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder={t.baseUrlPlaceholder}
                  data-testid="input-base-url"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>{t.isActive}</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-is-active"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save-provider">
                {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
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
                onClick={() => selectedProvider && deleteMutation.mutate(selectedProvider.provider)}
                disabled={deleteMutation.isPending}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.delete}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
