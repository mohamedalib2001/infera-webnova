import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Plug, 
  Key, 
  Plus, 
  Settings, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Trash2, 
  Eye, 
  EyeOff,
  Sparkles,
  CreditCard,
  Mail,
  MessageSquare,
  Cloud,
  Database,
  Shield,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { SiOpenai, SiStripe, SiTwilio, SiGoogle } from "react-icons/si";

interface Provider {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: any;
  category: "ai" | "payment" | "communication" | "storage" | "other";
  secretKey: string;
  isConfigured: boolean;
  isActive: boolean;
  docsUrl: string;
}

const providers: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    nameAr: "OpenAI",
    description: "GPT-4o, GPT-4, GPT-3.5 for AI capabilities",
    descriptionAr: "GPT-4o, GPT-4, GPT-3.5 لقدرات الذكاء الاصطناعي",
    icon: SiOpenai,
    category: "ai",
    secretKey: "OPENAI_API_KEY",
    isConfigured: false,
    isActive: false,
    docsUrl: "https://platform.openai.com/docs"
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    nameAr: "أنثروبيك كلود",
    description: "Claude 3.5 Sonnet, Opus for advanced AI",
    descriptionAr: "Claude 3.5 Sonnet, Opus للذكاء المتقدم",
    icon: Sparkles,
    category: "ai",
    secretKey: "ANTHROPIC_API_KEY",
    isConfigured: true,
    isActive: true,
    docsUrl: "https://docs.anthropic.com"
  },
  {
    id: "google-ai",
    name: "Google AI (Gemini)",
    nameAr: "جوجل AI (جيميني)",
    description: "Gemini Pro, Gemini Ultra models",
    descriptionAr: "نماذج Gemini Pro و Gemini Ultra",
    icon: SiGoogle,
    category: "ai",
    secretKey: "GOOGLE_AI_API_KEY",
    isConfigured: false,
    isActive: false,
    docsUrl: "https://ai.google.dev/docs"
  },
  {
    id: "stripe",
    name: "Stripe",
    nameAr: "سترايب",
    description: "Payment processing and subscriptions",
    descriptionAr: "معالجة المدفوعات والاشتراكات",
    icon: SiStripe,
    category: "payment",
    secretKey: "STRIPE_SECRET_KEY",
    isConfigured: true,
    isActive: true,
    docsUrl: "https://stripe.com/docs"
  },
  {
    id: "paypal",
    name: "PayPal",
    nameAr: "باي بال",
    description: "PayPal payments and checkout",
    descriptionAr: "مدفوعات وتسوق باي بال",
    icon: CreditCard,
    category: "payment",
    secretKey: "PAYPAL_CLIENT_SECRET",
    isConfigured: false,
    isActive: false,
    docsUrl: "https://developer.paypal.com/docs"
  },
  {
    id: "twilio",
    name: "Twilio",
    nameAr: "تويليو",
    description: "SMS, Voice, and WhatsApp messaging",
    descriptionAr: "رسائل SMS والصوت والواتساب",
    icon: SiTwilio,
    category: "communication",
    secretKey: "TWILIO_AUTH_TOKEN",
    isConfigured: false,
    isActive: false,
    docsUrl: "https://www.twilio.com/docs"
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    nameAr: "سيند غريد",
    description: "Email delivery and marketing",
    descriptionAr: "إرسال البريد الإلكتروني والتسويق",
    icon: Mail,
    category: "communication",
    secretKey: "SENDGRID_API_KEY",
    isConfigured: false,
    isActive: false,
    docsUrl: "https://docs.sendgrid.com"
  },
  {
    id: "aws-s3",
    name: "AWS S3",
    nameAr: "AWS S3",
    description: "Cloud storage for files and media",
    descriptionAr: "تخزين سحابي للملفات والوسائط",
    icon: Cloud,
    category: "storage",
    secretKey: "AWS_SECRET_ACCESS_KEY",
    isConfigured: false,
    isActive: false,
    docsUrl: "https://docs.aws.amazon.com/s3"
  },
];

const categoryLabels = {
  ai: { en: "AI Providers", ar: "مزودو الذكاء الاصطناعي" },
  payment: { en: "Payment Gateways", ar: "بوابات الدفع" },
  communication: { en: "Communication", ar: "التواصل" },
  storage: { en: "Storage", ar: "التخزين" },
  other: { en: "Other", ar: "أخرى" },
};

export default function Integrations() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const t = {
    ar: {
      title: "إدارة التكاملات",
      subtitle: "ربط وإدارة مزودي الخدمات الخارجية",
      allProviders: "جميع المزودين",
      configured: "المفعّلة",
      notConfigured: "غير مفعّلة",
      configure: "إعداد",
      edit: "تعديل",
      disable: "تعطيل",
      enable: "تفعيل",
      delete: "حذف",
      active: "نشط",
      inactive: "غير نشط",
      apiKey: "مفتاح API",
      enterApiKey: "أدخل مفتاح API",
      save: "حفظ",
      cancel: "إلغاء",
      testConnection: "اختبار الاتصال",
      connectionSuccess: "الاتصال ناجح",
      connectionFailed: "فشل الاتصال",
      deleteConfirm: "هل أنت متأكد من حذف هذا التكامل؟",
      deleteDesc: "سيتم حذف مفتاح API وإلغاء تفعيل الخدمة",
      docs: "التوثيق",
      securityNote: "مفاتيح API مشفرة ومخزنة بشكل آمن",
      noProviders: "لا توجد مزودين في هذه الفئة",
      lastUpdated: "آخر تحديث",
      status: "الحالة",
      category: "الفئة",
      configureProvider: "إعداد المزود",
      updateSuccess: "تم التحديث بنجاح",
      updateFailed: "فشل التحديث",
    },
    en: {
      title: "Integrations Management",
      subtitle: "Connect and manage external service providers",
      allProviders: "All Providers",
      configured: "Configured",
      notConfigured: "Not Configured",
      configure: "Configure",
      edit: "Edit",
      disable: "Disable",
      enable: "Enable",
      delete: "Delete",
      active: "Active",
      inactive: "Inactive",
      apiKey: "API Key",
      enterApiKey: "Enter API Key",
      save: "Save",
      cancel: "Cancel",
      testConnection: "Test Connection",
      connectionSuccess: "Connection successful",
      connectionFailed: "Connection failed",
      deleteConfirm: "Are you sure you want to delete this integration?",
      deleteDesc: "The API key will be deleted and the service will be disabled",
      docs: "Documentation",
      securityNote: "API keys are encrypted and stored securely",
      noProviders: "No providers in this category",
      lastUpdated: "Last Updated",
      status: "Status",
      category: "Category",
      configureProvider: "Configure Provider",
      updateSuccess: "Updated successfully",
      updateFailed: "Update failed",
    },
  };

  const txt = language === "ar" ? t.ar : t.en;

  const { data: secretsStatus, isLoading } = useQuery<Record<string, boolean>>({
    queryKey: ["/api/integrations/status"],
  });

  const configuredProviders = providers.map(p => ({
    ...p,
    isConfigured: secretsStatus?.[p.secretKey] ?? p.isConfigured,
    isActive: secretsStatus?.[p.secretKey] ?? p.isActive,
  }));

  const saveMutation = useMutation({
    mutationFn: async ({ providerId, apiKey }: { providerId: string; apiKey: string }) => {
      return await apiRequest("POST", "/api/integrations/configure", { providerId, apiKey });
    },
    onSuccess: () => {
      toast({ title: txt.updateSuccess });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/status"] });
      setShowConfigDialog(false);
      setApiKeyValue("");
      setSelectedProvider(null);
    },
    onError: () => {
      toast({ title: txt.updateFailed, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ providerId, enabled }: { providerId: string; enabled: boolean }) => {
      return await apiRequest("POST", "/api/integrations/toggle", { providerId, enabled });
    },
    onSuccess: () => {
      toast({ title: txt.updateSuccess });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/status"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (providerId: string) => {
      return await apiRequest("DELETE", `/api/integrations/${providerId}`);
    },
    onSuccess: () => {
      toast({ title: txt.updateSuccess });
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/status"] });
      setShowDeleteDialog(false);
      setSelectedProvider(null);
    },
  });

  const filteredProviders = configuredProviders.filter(p => {
    if (activeTab === "all") return true;
    if (activeTab === "configured") return p.isConfigured;
    if (activeTab === "not-configured") return !p.isConfigured;
    return p.category === activeTab;
  });

  const groupedByCategory = filteredProviders.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, Provider[]>);

  const handleConfigure = (provider: Provider) => {
    setSelectedProvider(provider);
    setApiKeyValue("");
    setShowApiKey(false);
    setShowConfigDialog(true);
  };

  const handleSave = () => {
    if (selectedProvider && apiKeyValue.trim()) {
      saveMutation.mutate({ providerId: selectedProvider.id, apiKey: apiKeyValue.trim() });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-integrations-title">
            <Plug className="w-8 h-8 text-primary" />
            {txt.title}
          </h1>
          <p className="text-muted-foreground">{txt.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          {txt.securityNote}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all" data-testid="tab-all">{txt.allProviders}</TabsTrigger>
          <TabsTrigger value="configured" data-testid="tab-configured">
            <CheckCircle className="w-4 h-4 me-1" />
            {txt.configured}
          </TabsTrigger>
          <TabsTrigger value="not-configured" data-testid="tab-not-configured">
            <XCircle className="w-4 h-4 me-1" />
            {txt.notConfigured}
          </TabsTrigger>
          <TabsTrigger value="ai" data-testid="tab-ai">
            <Sparkles className="w-4 h-4 me-1" />
            {categoryLabels.ai[language]}
          </TabsTrigger>
          <TabsTrigger value="payment" data-testid="tab-payment">
            <CreditCard className="w-4 h-4 me-1" />
            {categoryLabels.payment[language]}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {Object.entries(groupedByCategory).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {txt.noProviders}
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedByCategory).map(([category, categoryProviders]) => (
              <div key={category} className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {categoryLabels[category as keyof typeof categoryLabels]?.[language] || category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryProviders.map((provider) => {
                    const Icon = provider.icon;
                    return (
                      <Card key={provider.id} className="relative" data-testid={`card-provider-${provider.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-base">
                                  {language === "ar" ? provider.nameAr : provider.name}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  {language === "ar" ? provider.descriptionAr : provider.description}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant={provider.isActive ? "default" : "secondary"}>
                              {provider.isActive ? txt.active : txt.inactive}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {provider.isConfigured ? (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleConfigure(provider)}
                                  data-testid={`button-edit-${provider.id}`}
                                >
                                  <Settings className="w-4 h-4 me-1" />
                                  {txt.edit}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleMutation.mutate({ providerId: provider.id, enabled: !provider.isActive })}
                                  data-testid={`button-toggle-${provider.id}`}
                                >
                                  {provider.isActive ? txt.disable : txt.enable}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedProvider(provider);
                                    setShowDeleteDialog(true);
                                  }}
                                  data-testid={`button-delete-${provider.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleConfigure(provider)}
                                data-testid={`button-configure-${provider.id}`}
                              >
                                <Plus className="w-4 h-4 me-1" />
                                {txt.configure}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 me-1" />
                                {txt.docs}
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedProvider && <selectedProvider.icon className="w-5 h-5" />}
              {txt.configureProvider}: {selectedProvider && (language === "ar" ? selectedProvider.nameAr : selectedProvider.name)}
            </DialogTitle>
            <DialogDescription>
              {language === "ar" ? selectedProvider?.descriptionAr : selectedProvider?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">{txt.apiKey}</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder={txt.enterApiKey}
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                  className="pe-10"
                  data-testid="input-api-key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-0 top-0"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <Shield className="w-4 h-4" />
              {txt.securityNote}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              {txt.cancel}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!apiKeyValue.trim() || saveMutation.isPending}
              data-testid="button-save-api-key"
            >
              {saveMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin me-1" /> : null}
              {txt.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {txt.deleteConfirm}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {txt.deleteDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{txt.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => selectedProvider && deleteMutation.mutate(selectedProvider.id)}
            >
              {txt.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
