import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIntegrationWebSocket } from "@/hooks/use-integration-websocket";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Cloud,
  Shield,
  AlertTriangle,
  ExternalLink,
  Search,
  LayoutGrid,
  List,
  Activity,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  Globe,
  BarChart3,
  Bell,
  RotateCcw,
  Filter,
  Download,
  Upload,
  ChevronRight,
  MessageSquare,
  Map,
  Image,
  Database,
  Terminal,
  Code,
  GitBranch,
  Server,
  Lock,
  Unlock,
  Link2,
  Laptop,
  MonitorPlay,
  Power,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { SiOpenai, SiStripe, SiTwilio, SiGoogle, SiAmazon, SiCloudflare } from "react-icons/si";
import type { ServiceProvider, ProviderApiKey, ProviderAlert, FailoverGroup } from "@shared/schema";

const categoryIcons: Record<string, any> = {
  ai: Sparkles,
  payment: CreditCard,
  communication: MessageSquare,
  cloud: Cloud,
  analytics: BarChart3,
  search: Search,
  media: Image,
  maps: Map,
  custom: Database,
};

const categoryLabels = {
  ai: { en: "AI Providers", ar: "مزودو الذكاء الاصطناعي" },
  payment: { en: "Payment Gateways", ar: "بوابات الدفع" },
  communication: { en: "Communication", ar: "الاتصالات" },
  cloud: { en: "Cloud & Infrastructure", ar: "السحابة والبنية التحتية" },
  analytics: { en: "Analytics", ar: "التحليلات" },
  search: { en: "Search", ar: "البحث" },
  media: { en: "Media", ar: "الوسائط" },
  maps: { en: "Maps", ar: "الخرائط" },
  custom: { en: "Custom", ar: "مخصص" },
};

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-400",
  error: "bg-red-500",
  maintenance: "bg-yellow-500",
  pending: "bg-blue-500",
};

export default function Integrations() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showProviderDetails, setShowProviderDetails] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [apiKeyName, setApiKeyName] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState("providers");
  
  useIntegrationWebSocket();

  const t = {
    ar: {
      title: "مركز تكامل مزودي الخدمات",
      subtitle: "إدارة جميع مزودي الخدمات الخارجية من مكان واحد",
      providers: "المزودون",
      analytics: "التحليلات",
      alerts: "التنبيهات",
      failover: "التبديل التلقائي",
      auditLogs: "سجل العمليات",
      search: "بحث...",
      allProviders: "جميع المزودين",
      active: "نشط",
      inactive: "غير نشط",
      error: "خطأ",
      maintenance: "صيانة",
      pending: "قيد الانتظار",
      addProvider: "إضافة مزود",
      importConfig: "استيراد",
      exportConfig: "تصدير",
      configure: "إعداد",
      viewDetails: "عرض التفاصيل",
      addApiKey: "إضافة مفتاح API",
      apiKeys: "مفاتيح API",
      services: "الخدمات",
      usage: "الاستخدام",
      health: "الصحة",
      cost: "التكلفة",
      requests: "الطلبات",
      responseTime: "زمن الاستجابة",
      successRate: "معدل النجاح",
      keyName: "اسم المفتاح",
      apiKey: "مفتاح API",
      environment: "البيئة",
      production: "إنتاج",
      development: "تطوير",
      test: "اختبار",
      setDefault: "تعيين كافتراضي",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      deleteConfirm: "هل أنت متأكد من الحذف؟",
      deleteDesc: "سيتم حذف هذا العنصر نهائياً",
      noProviders: "لا توجد مزودين",
      initBuiltIn: "تفعيل المزودين المدمجين",
      totalProviders: "إجمالي المزودين",
      activeProviders: "المزودين النشطين",
      totalCost: "التكلفة الإجمالية",
      totalRequests: "إجمالي الطلبات",
      securityNote: "جميع المفاتيح مشفرة بـ AES-256",
      lastUpdated: "آخر تحديث",
      rotate: "تدوير المفتاح",
      disable: "تعطيل",
      enable: "تفعيل",
      docs: "التوثيق",
      website: "الموقع",
      filterByStatus: "تصفية حسب الحالة",
      filterByCategory: "تصفية حسب الفئة",
      allStatuses: "جميع الحالات",
      allCategories: "جميع الفئات",
      gridView: "عرض شبكي",
      listView: "عرض قائمة",
      noApiKeys: "لا توجد مفاتيح API",
      addFirstKey: "أضف أول مفتاح API لتفعيل هذا المزود",
      healthScore: "مؤشر الصحة",
      monthlyBudget: "الميزانية الشهرية",
      monthlySpent: "المنفق الشهري",
      rateLimitMin: "حد الطلبات/دقيقة",
      rateLimitDay: "حد الطلبات/يوم",
      priority: "الأولوية",
      isPrimary: "أساسي",
      isBuiltIn: "مدمج",
      external: "بوابة التكامل",
      externalDesc: "إدارة أدوات التطوير الخارجية والصلاحيات الذكية",
      replitTools: "أدوات Replit",
      replitDesc: "أدوات التطوير السحابية والتشغيل الآمن",
      smartPermissions: "الصلاحيات الذكية",
      remoteDev: "التطوير عن بعد",
      remoteDevDesc: "نشر وإدارة بيئات التطوير على Hetzner",
      sessionActive: "جلسة نشطة",
      sessionInactive: "غير متصل",
      startSession: "بدء جلسة",
      endSession: "إنهاء جلسة",
      readOnly: "قراءة فقط",
      readWrite: "قراءة وكتابة",
      fullAccess: "وصول كامل",
      codeExecution: "تنفيذ الكود",
      fileAccess: "الوصول للملفات",
      terminalAccess: "الوصول للطرفية",
      gitOperations: "عمليات Git",
      deploymentAccess: "الوصول للنشر",
      lastActivity: "آخر نشاط",
      connectedSince: "متصل منذ",
      permissionLevel: "مستوى الصلاحية",
      enableIntegration: "تفعيل التكامل",
      disableIntegration: "تعطيل التكامل",
      configurePermissions: "إعداد الصلاحيات",
      viewSessions: "عرض الجلسات",
    },
    en: {
      title: "Service Providers Integration Hub",
      subtitle: "Manage all external service providers from one place",
      providers: "Providers",
      analytics: "Analytics",
      alerts: "Alerts",
      failover: "Failover",
      auditLogs: "Audit Logs",
      search: "Search...",
      allProviders: "All Providers",
      active: "Active",
      inactive: "Inactive",
      error: "Error",
      maintenance: "Maintenance",
      pending: "Pending",
      addProvider: "Add Provider",
      importConfig: "Import",
      exportConfig: "Export",
      configure: "Configure",
      viewDetails: "View Details",
      addApiKey: "Add API Key",
      apiKeys: "API Keys",
      services: "Services",
      usage: "Usage",
      health: "Health",
      cost: "Cost",
      requests: "Requests",
      responseTime: "Response Time",
      successRate: "Success Rate",
      keyName: "Key Name",
      apiKey: "API Key",
      environment: "Environment",
      production: "Production",
      development: "Development",
      test: "Test",
      setDefault: "Set as Default",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete?",
      deleteDesc: "This action cannot be undone",
      noProviders: "No providers found",
      initBuiltIn: "Initialize Built-in Providers",
      totalProviders: "Total Providers",
      activeProviders: "Active Providers",
      totalCost: "Total Cost",
      totalRequests: "Total Requests",
      securityNote: "All keys encrypted with AES-256",
      lastUpdated: "Last Updated",
      rotate: "Rotate Key",
      disable: "Disable",
      enable: "Enable",
      docs: "Docs",
      website: "Website",
      filterByStatus: "Filter by Status",
      filterByCategory: "Filter by Category",
      allStatuses: "All Statuses",
      allCategories: "All Categories",
      gridView: "Grid View",
      listView: "List View",
      noApiKeys: "No API Keys",
      addFirstKey: "Add your first API key to activate this provider",
      healthScore: "Health Score",
      monthlyBudget: "Monthly Budget",
      monthlySpent: "Monthly Spent",
      rateLimitMin: "Rate Limit/Min",
      rateLimitDay: "Rate Limit/Day",
      priority: "Priority",
      isPrimary: "Primary",
      isBuiltIn: "Built-in",
      external: "Integration Gateway",
      externalDesc: "Manage external development tools and smart permissions",
      replitTools: "Replit Tools",
      replitDesc: "Cloud development tools and secure execution",
      smartPermissions: "Smart Permissions",
      remoteDev: "Remote Development",
      remoteDevDesc: "Deploy and manage development environments on Hetzner",
      sessionActive: "Session Active",
      sessionInactive: "Disconnected",
      startSession: "Start Session",
      endSession: "End Session",
      readOnly: "Read Only",
      readWrite: "Read & Write",
      fullAccess: "Full Access",
      codeExecution: "Code Execution",
      fileAccess: "File Access",
      terminalAccess: "Terminal Access",
      gitOperations: "Git Operations",
      deploymentAccess: "Deployment Access",
      lastActivity: "Last Activity",
      connectedSince: "Connected Since",
      permissionLevel: "Permission Level",
      enableIntegration: "Enable Integration",
      disableIntegration: "Disable Integration",
      configurePermissions: "Configure Permissions",
      viewSessions: "View Sessions",
    },
  };

  const txt = language === "ar" ? t.ar : t.en;

  const { data: providers = [], isLoading } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/service-providers"],
  });

  const { data: alerts = [] } = useQuery<ProviderAlert[]>({
    queryKey: ["/api/provider-alerts"],
  });

  const { data: failoverGroups = [] } = useQuery<FailoverGroup[]>({
    queryKey: ["/api/failover-groups"],
  });

  // External Integration Sessions
  const { data: integrationSessionsData } = useQuery<{ success: boolean; sessions: any[] }>({
    queryKey: ["/api/owner/integrations/sessions"],
  });
  const integrationSessions = integrationSessionsData?.sessions || [];

  // Helper to find session by partner name
  const getSessionByPartner = (partnerName: string) => {
    return integrationSessions.find(s => s.partnerName === partnerName);
  };

  // Check if Replit session is active
  const replitSession = getSessionByPartner("replit");
  const isReplitActive = replitSession?.status === "active";
  
  // Check if Hetzner session is active
  const hetznerSession = getSessionByPartner("hetzner");
  const isHetznerActive = hetznerSession?.status === "active";

  // Session activation mutation
  const activateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, reason }: { sessionId: string; reason?: string }) => {
      return await apiRequest("POST", `/api/owner/integrations/sessions/${sessionId}/activate`, { reason });
    },
    onSuccess: () => {
      toast({ title: language === "ar" ? "تم تفعيل الجلسة" : "Session activated" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/integrations/sessions"] });
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشل تفعيل الجلسة" : "Failed to activate session", variant: "destructive" });
    },
  });

  // Session deactivation mutation
  const deactivateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, reason }: { sessionId: string; reason?: string }) => {
      return await apiRequest("POST", `/api/owner/integrations/sessions/${sessionId}/deactivate`, { reason });
    },
    onSuccess: () => {
      toast({ title: language === "ar" ? "تم إنهاء الجلسة" : "Session deactivated" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/integrations/sessions"] });
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشل إنهاء الجلسة" : "Failed to deactivate session", variant: "destructive" });
    },
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      return await apiRequest("POST", "/api/owner/integrations/sessions", sessionData);
    },
    onSuccess: () => {
      toast({ title: language === "ar" ? "تم إنشاء الجلسة" : "Session created" });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/integrations/sessions"] });
    },
    onError: (error: any) => {
      toast({ 
        title: language === "ar" ? "فشل إنشاء الجلسة" : "Failed to create session", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const initBuiltInMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/service-providers/init-builtin");
    },
    onSuccess: (data: any) => {
      toast({ title: `Initialized ${data.created} providers` });
      queryClient.invalidateQueries({ queryKey: ["/api/service-providers"] });
    },
    onError: () => {
      toast({ title: "Failed to initialize", variant: "destructive" });
    },
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async ({ providerId, name, apiKey, environment }: { providerId: string; name: string; apiKey: string; environment: string }) => {
      return await apiRequest("POST", `/api/service-providers/${providerId}/api-keys`, { name, apiKey, environment });
    },
    onSuccess: () => {
      toast({ title: language === "ar" ? "تم الحفظ بنجاح" : "Saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/service-providers"] });
      setShowAddKeyDialog(false);
      setApiKeyValue("");
      setApiKeyName("");
    },
    onError: (error: any) => {
      console.error("API Key save error:", error);
      toast({ 
        title: language === "ar" ? "فشل في الحفظ" : "Failed to save", 
        description: error.message || "Unknown error",
        variant: "destructive" 
      });
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/service-providers/${id}`);
    },
    onSuccess: () => {
      toast({ title: txt.delete + " - Success" });
      queryClient.invalidateQueries({ queryKey: ["/api/service-providers"] });
      setShowDeleteDialog(false);
      setSelectedProvider(null);
    },
  });

  const filteredProviders = providers.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameAr?.includes(searchQuery) ||
      p.slug.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const groupedByCategory = filteredProviders.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, ServiceProvider[]>);

  const stats = {
    total: providers.length,
    active: providers.filter(p => p.status === "active").length,
    totalCost: providers.reduce((sum, p) => sum + (p.totalCost || 0), 0) / 100,
    totalRequests: providers.reduce((sum, p) => sum + (p.totalRequests || 0), 0),
  };

  const handleAddApiKey = () => {
    if (selectedProvider && apiKeyName && apiKeyValue) {
      createApiKeyMutation.mutate({
        providerId: selectedProvider.id,
        name: apiKeyName,
        apiKey: apiKeyValue,
        environment: "production",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-integrations-title">
            <Plug className="w-8 h-8 text-primary" />
            {txt.title}
          </h1>
          <p className="text-muted-foreground">{txt.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => initBuiltInMutation.mutate()} disabled={initBuiltInMutation.isPending}>
            {initBuiltInMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin me-1" /> : <Zap className="w-4 h-4 me-1" />}
            {txt.initBuiltIn}
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 me-1" />
            {txt.importConfig}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 me-1" />
            {txt.exportConfig}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{txt.totalProviders}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{txt.activeProviders}</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{txt.totalRequests}</p>
              <p className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <DollarSign className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{txt.totalCost}</p>
              <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="providers" data-testid="tab-providers">
              <Globe className="w-4 h-4 me-1" />
              {txt.providers}
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="w-4 h-4 me-1" />
              {txt.analytics}
            </TabsTrigger>
            <TabsTrigger value="alerts" data-testid="tab-alerts">
              <Bell className="w-4 h-4 me-1" />
              {txt.alerts}
              {alerts.filter(a => !a.isAcknowledged).length > 0 && (
                <Badge variant="destructive" className="ms-1">{alerts.filter(a => !a.isAcknowledged).length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="failover" data-testid="tab-failover">
              <RotateCcw className="w-4 h-4 me-1" />
              {txt.failover}
            </TabsTrigger>
            <TabsTrigger value="external" data-testid="tab-external">
              <Terminal className="w-4 h-4 me-1" />
              {txt.external}
            </TabsTrigger>
          </TabsList>

          {activeTab === "providers" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={txt.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9 w-64"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40" data-testid="select-status">
                  <SelectValue placeholder={txt.filterByStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{txt.allStatuses}</SelectItem>
                  <SelectItem value="active">{txt.active}</SelectItem>
                  <SelectItem value="inactive">{txt.inactive}</SelectItem>
                  <SelectItem value="error">{txt.error}</SelectItem>
                  <SelectItem value="maintenance">{txt.maintenance}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40" data-testid="select-category">
                  <SelectValue placeholder={txt.filterByCategory} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{txt.allCategories}</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label[language]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              >
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>

        {/* Providers Tab */}
        <TabsContent value="providers" className="mt-6">
          {providers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">{txt.noProviders}</p>
                <Button onClick={() => initBuiltInMutation.mutate()} disabled={initBuiltInMutation.isPending}>
                  <Zap className="w-4 h-4 me-1" />
                  {txt.initBuiltIn}
                </Button>
              </CardContent>
            </Card>
          ) : filteredProviders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                {txt.noProviders}
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedByCategory).map(([category, categoryProviders]) => {
              const CategoryIcon = categoryIcons[category] || Database;
              return (
                <div key={category} className="mb-8">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CategoryIcon className="w-5 h-5 text-primary" />
                    {categoryLabels[category as keyof typeof categoryLabels]?.[language] || category}
                    <Badge variant="secondary">{categoryProviders.length}</Badge>
                  </h2>
                  <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                    : "space-y-3"
                  }>
                    {categoryProviders.map((provider) => (
                      <Card 
                        key={provider.id} 
                        className={`relative cursor-pointer hover-elevate ${viewMode === "list" ? "flex items-center" : ""}`}
                        onClick={() => {
                          setSelectedProvider(provider);
                          setShowProviderDetails(true);
                        }}
                        data-testid={`card-provider-${provider.slug}`}
                      >
                        <CardHeader className={viewMode === "list" ? "pb-0 flex-1" : "pb-3"}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${statusColors[provider.status || "inactive"]}`} />
                              <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                  {language === "ar" ? provider.nameAr : provider.name}
                                  {provider.isPrimary && <Badge variant="default" className="text-xs">Primary</Badge>}
                                  {provider.isBuiltIn && <Badge variant="outline" className="text-xs">Built-in</Badge>}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1 line-clamp-2">
                                  {language === "ar" ? provider.descriptionAr : provider.description}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        {viewMode === "grid" && (
                          <CardContent className="pt-0">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                {(provider.totalRequests || 0).toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {provider.avgResponseTime || 0}ms
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {(provider.successRate || 100).toFixed(1)}%
                              </span>
                            </div>
                            {provider.healthScore !== undefined && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>{txt.healthScore}</span>
                                  <span>{provider.healthScore}%</span>
                                </div>
                                <Progress value={provider.healthScore} className="h-1" />
                              </div>
                            )}
                          </CardContent>
                        )}
                        {viewMode === "list" && (
                          <CardContent className="py-4 flex items-center gap-6">
                            <div className="text-sm">
                              <span className="text-muted-foreground">{txt.requests}: </span>
                              <span className="font-medium">{(provider.totalRequests || 0).toLocaleString()}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">{txt.responseTime}: </span>
                              <span className="font-medium">{provider.avgResponseTime || 0}ms</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">{txt.successRate}: </span>
                              <span className="font-medium">{(provider.successRate || 100).toFixed(1)}%</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {language === "ar" ? "استخدام المزودين" : "Provider Usage"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providers.filter(p => p.status === "active").slice(0, 5).map(provider => (
                    <div key={provider.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{provider.name}</span>
                        <span className="text-muted-foreground">{(provider.totalRequests || 0).toLocaleString()} requests</span>
                      </div>
                      <Progress 
                        value={Math.min(100, ((provider.totalRequests || 0) / Math.max(1, stats.totalRequests)) * 100)} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {language === "ar" ? "تكلفة المزودين" : "Provider Costs"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providers.filter(p => (p.totalCost || 0) > 0).slice(0, 5).map(provider => (
                    <div key={provider.id} className="flex justify-between items-center">
                      <span>{provider.name}</span>
                      <span className="font-medium">${((provider.totalCost || 0) / 100).toFixed(2)}</span>
                    </div>
                  ))}
                  {providers.filter(p => (p.totalCost || 0) > 0).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No cost data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {txt.alerts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>{language === "ar" ? "لا توجد تنبيهات" : "No alerts"}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className={`p-4 rounded-lg border ${
                        alert.severity === "critical" ? "border-red-500 bg-red-500/5" :
                        alert.severity === "error" ? "border-orange-500 bg-orange-500/5" :
                        alert.severity === "warning" ? "border-yellow-500 bg-yellow-500/5" :
                        "border-blue-500 bg-blue-500/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{language === "ar" ? alert.titleAr : alert.title}</p>
                          <p className="text-sm text-muted-foreground">{language === "ar" ? alert.messageAr : alert.message}</p>
                        </div>
                        {!alert.isAcknowledged && (
                          <Button size="sm" variant="outline">Acknowledge</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Failover Tab */}
        <TabsContent value="failover" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                {txt.failover}
              </CardTitle>
              <CardDescription>
                {language === "ar" ? "إدارة التبديل التلقائي بين المزودين" : "Manage automatic provider failover"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {failoverGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{language === "ar" ? "لا توجد مجموعات تبديل" : "No failover groups configured"}</p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="w-4 h-4 me-1" />
                    {language === "ar" ? "إنشاء مجموعة" : "Create Group"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {failoverGroups.map(group => (
                    <div key={group.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-sm text-muted-foreground">Category: {group.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={group.isActive ? "default" : "secondary"}>
                            {group.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button size="sm" variant="outline">Trigger Failover</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* External Integration Gateway Tab */}
        <TabsContent value="external" className="mt-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Terminal className="w-6 h-6 text-primary" />
                  {txt.external}
                </h2>
                <p className="text-sm text-muted-foreground">{txt.externalDesc}</p>
              </div>
            </div>

            {/* Integration Tools Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Replit Tools Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Code className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{txt.replitTools}</CardTitle>
                      <CardDescription>{txt.replitDesc}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={isReplitActive ? "default" : "secondary"} 
                    className="flex items-center gap-1"
                  >
                    <Power className="w-3 h-3" />
                    {isReplitActive ? txt.sessionActive : txt.sessionInactive}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Permissions Grid - Dynamic based on session */}
                  <div className="grid grid-cols-2 gap-3">
                    {replitSession?.permissions?.map((perm: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {perm.scope === 'code' && <Code className="w-4 h-4 text-muted-foreground" />}
                          {perm.scope === 'files' && <Database className="w-4 h-4 text-muted-foreground" />}
                          {perm.scope === 'system' && <Terminal className="w-4 h-4 text-muted-foreground" />}
                          {!['code', 'files', 'system'].includes(perm.scope) && <GitBranch className="w-4 h-4 text-muted-foreground" />}
                          <span className="text-sm">{perm.scope}</span>
                        </div>
                        <Badge 
                          variant={perm.type === 'admin' || perm.type === 'execute' ? "default" : "secondary"} 
                          className="text-xs"
                        >
                          {perm.type === 'admin' ? txt.fullAccess : perm.type === 'write' ? txt.readWrite : txt.readOnly}
                        </Badge>
                      </div>
                    )) || (
                      <>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{txt.codeExecution}</span>
                          </div>
                          <Badge variant={isReplitActive ? "default" : "outline"} className="text-xs">
                            {isReplitActive ? txt.fullAccess : txt.readOnly}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{txt.fileAccess}</span>
                          </div>
                          <Badge variant={isReplitActive ? "secondary" : "outline"} className="text-xs">
                            {isReplitActive ? txt.readWrite : txt.readOnly}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{txt.terminalAccess}</span>
                          </div>
                          <Badge variant={isReplitActive ? "default" : "outline"} className="text-xs">
                            {isReplitActive ? txt.fullAccess : txt.readOnly}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{txt.gitOperations}</span>
                          </div>
                          <Badge variant={isReplitActive ? "secondary" : "outline"} className="text-xs">
                            {isReplitActive ? txt.readWrite : txt.readOnly}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Session Info */}
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    isReplitActive 
                      ? "bg-green-500/10 border-green-500/20" 
                      : "bg-muted/50 border-border/50"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        isReplitActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      }`} />
                      <div>
                        <p className="text-sm font-medium">
                          {isReplitActive ? txt.connectedSince : txt.lastActivity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {replitSession?.activatedAt 
                            ? new Date(replitSession.activatedAt).toLocaleString() 
                            : language === "ar" ? "لا توجد جلسة" : "No session"}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 me-1" />
                      {txt.configurePermissions}
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isReplitActive && replitSession ? (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deactivateSessionMutation.mutate({ sessionId: replitSession.id })}
                        disabled={deactivateSessionMutation.isPending}
                      >
                        <Power className="w-4 h-4 me-1" />
                        {txt.endSession}
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => {
                          if (replitSession) {
                            activateSessionMutation.mutate({ sessionId: replitSession.id });
                          } else {
                            createSessionMutation.mutate({
                              partnerName: "replit",
                              partnerDisplayName: "Replit",
                              providerType: "development",
                              purpose: "development",
                              purposeDescription: "Replit development environment access",
                              accessLevel: "full_access",
                              permissions: [
                                { type: "execute", scope: "code", resources: ["*"] },
                                { type: "write", scope: "files", resources: ["*"] },
                                { type: "admin", scope: "system", resources: ["terminal"] },
                                { type: "write", scope: "git", resources: ["*"] },
                              ],
                              restrictions: {
                                noAccessTo: [],
                                maxDuration: 480,
                                requireApproval: false,
                                sandboxOnly: false,
                              },
                            });
                          }
                        }}
                        disabled={activateSessionMutation.isPending || createSessionMutation.isPending}
                      >
                        <Link2 className="w-4 h-4 me-1" />
                        {txt.startSession}
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/owner/integrations/sessions"] })}
                    >
                      <RefreshCw className="w-4 h-4 me-1" />
                      {language === "ar" ? "تحديث" : "Refresh"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Remote Development Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Server className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{txt.remoteDev}</CardTitle>
                      <CardDescription>{txt.remoteDevDesc}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={isHetznerActive ? "default" : "secondary"} 
                    className="flex items-center gap-1"
                  >
                    {isHetznerActive ? <Power className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {isHetznerActive ? txt.sessionActive : txt.sessionInactive}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Hetzner Connection Status */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Hetzner Cloud</span>
                      </div>
                      <Badge variant={isHetznerActive ? "default" : "outline"} className="text-xs">
                        {isHetznerActive 
                          ? (language === "ar" ? "متصل" : "Connected") 
                          : (language === "ar" ? "غير متصل" : "Not Connected")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{txt.deploymentAccess}</span>
                      </div>
                      <Badge variant={isHetznerActive ? "secondary" : "outline"} className="text-xs">
                        {hetznerSession?.accessLevel === "full_access" ? txt.fullAccess : 
                         hetznerSession?.accessLevel === "read_write" ? txt.readWrite : txt.readOnly}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MonitorPlay className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {language === "ar" ? "مراقبة الخوادم" : "Server Monitoring"}
                        </span>
                      </div>
                      <Badge variant={isHetznerActive ? "secondary" : "outline"} className="text-xs">
                        {isHetznerActive ? txt.readWrite : txt.readOnly}
                      </Badge>
                    </div>
                  </div>

                  {/* Session Info or Requirements */}
                  {isHetznerActive ? (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div>
                          <p className="text-sm font-medium">{txt.connectedSince}</p>
                          <p className="text-xs text-muted-foreground">
                            {hetznerSession?.activatedAt 
                              ? new Date(hetznerSession.activatedAt).toLocaleString() 
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 me-1" />
                        {txt.configurePermissions}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {language === "ar" ? "متطلبات الاتصال" : "Connection Requirements"}
                        </span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1 ms-6 list-disc">
                        <li>{language === "ar" ? "رمز API لـ Hetzner" : "Hetzner API Token"}</li>
                        <li>{language === "ar" ? "مفاتيح SSH مُعدّة" : "SSH Keys Configured"}</li>
                        <li>{language === "ar" ? "صلاحيات المالك" : "Owner Permissions"}</li>
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isHetznerActive && hetznerSession ? (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deactivateSessionMutation.mutate({ sessionId: hetznerSession.id })}
                        disabled={deactivateSessionMutation.isPending}
                      >
                        <Power className="w-4 h-4 me-1" />
                        {txt.endSession}
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => {
                          if (hetznerSession) {
                            activateSessionMutation.mutate({ sessionId: hetznerSession.id });
                          } else {
                            createSessionMutation.mutate({
                              partnerName: "hetzner",
                              partnerDisplayName: "Hetzner Cloud",
                              providerType: "hosting",
                              purpose: "development",
                              purposeDescription: "Hetzner Cloud remote development and deployment",
                              accessLevel: "read_write",
                              permissions: [
                                { type: "read", scope: "servers", resources: ["*"] },
                                { type: "write", scope: "deployment", resources: ["*"] },
                                { type: "read", scope: "monitoring", resources: ["*"] },
                              ],
                              restrictions: {
                                noAccessTo: ["billing", "account"],
                                maxDuration: 240,
                                requireApproval: true,
                                sandboxOnly: false,
                              },
                            });
                          }
                        }}
                        disabled={activateSessionMutation.isPending || createSessionMutation.isPending}
                      >
                        <Link2 className="w-4 h-4 me-1" />
                        {txt.startSession}
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <UserCog className="w-4 h-4 me-1" />
                      {txt.configurePermissions}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Smart Permissions Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  {txt.smartPermissions}
                </CardTitle>
                <CardDescription>
                  {language === "ar" 
                    ? "التحكم الذكي في صلاحيات التكاملات الخارجية" 
                    : "Smart control over external integration permissions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Permission Levels */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-red-500" />
                      <span className="font-medium">{txt.readOnly}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" 
                        ? "عرض الملفات والسجلات فقط، لا تعديل أو تنفيذ" 
                        : "View files and logs only, no modifications or execution"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">{language === "ar" ? "قراءة" : "Read"}</Badge>
                      <Badge variant="outline" className="text-xs">{language === "ar" ? "عرض" : "View"}</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">{txt.readWrite}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" 
                        ? "تعديل الملفات والإعدادات، لا تنفيذ أكواد" 
                        : "Modify files and settings, no code execution"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">{language === "ar" ? "قراءة" : "Read"}</Badge>
                      <Badge variant="outline" className="text-xs">{language === "ar" ? "كتابة" : "Write"}</Badge>
                      <Badge variant="outline" className="text-xs">{language === "ar" ? "تعديل" : "Modify"}</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                      <span className="font-medium">{txt.fullAccess}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" 
                        ? "وصول كامل شامل التنفيذ والنشر والإدارة" 
                        : "Full access including execution, deployment and management"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="default" className="text-xs">{language === "ar" ? "كامل" : "Full"}</Badge>
                      <Badge variant="default" className="text-xs">{language === "ar" ? "تنفيذ" : "Execute"}</Badge>
                      <Badge variant="default" className="text-xs">{language === "ar" ? "نشر" : "Deploy"}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Provider Details Dialog */}
      <Dialog open={showProviderDetails} onOpenChange={setShowProviderDetails}>
        <DialogContent className="max-w-2xl">
          {selectedProvider && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColors[selectedProvider.status || "inactive"]}`} />
                  {language === "ar" ? selectedProvider.nameAr : selectedProvider.name}
                </DialogTitle>
                <DialogDescription>
                  {language === "ar" ? selectedProvider.descriptionAr : selectedProvider.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{(selectedProvider.totalRequests || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{txt.requests}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{selectedProvider.avgResponseTime || 0}ms</p>
                    <p className="text-xs text-muted-foreground">{txt.responseTime}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{(selectedProvider.successRate || 100).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">{txt.successRate}</p>
                  </div>
                </div>

                {/* Health */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{txt.healthScore}</span>
                    <span>{selectedProvider.healthScore || 100}%</span>
                  </div>
                  <Progress value={selectedProvider.healthScore || 100} />
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button 
                    onClick={() => {
                      setShowProviderDetails(false);
                      setShowAddKeyDialog(true);
                    }}
                  >
                    <Key className="w-4 h-4 me-1" />
                    {txt.addApiKey}
                  </Button>
                  {selectedProvider.docsUrl && (
                    <Button variant="outline" asChild>
                      <a href={selectedProvider.docsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 me-1" />
                        {txt.docs}
                      </a>
                    </Button>
                  )}
                  {selectedProvider.website && (
                    <Button variant="outline" asChild>
                      <a href={selectedProvider.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 me-1" />
                        {txt.website}
                      </a>
                    </Button>
                  )}
                  {!selectedProvider.isBuiltIn && (
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        setShowProviderDetails(false);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 me-1" />
                      {txt.delete}
                    </Button>
                  )}
                </div>

                {/* Security Note */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <Shield className="w-4 h-4" />
                  {txt.securityNote}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add API Key Dialog */}
      <Dialog open={showAddKeyDialog} onOpenChange={setShowAddKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {txt.addApiKey}
            </DialogTitle>
            <DialogDescription>
              {selectedProvider && (language === "ar" ? selectedProvider.nameAr : selectedProvider.name)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">{txt.keyName}</Label>
              <Input
                id="keyName"
                placeholder="Production Key"
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
                data-testid="input-key-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">{txt.apiKey}</Label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-..."
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
            <Button variant="outline" onClick={() => setShowAddKeyDialog(false)}>
              {txt.cancel}
            </Button>
            <Button 
              onClick={handleAddApiKey} 
              disabled={!apiKeyName.trim() || !apiKeyValue.trim() || createApiKeyMutation.isPending}
              data-testid="button-save-api-key"
            >
              {createApiKeyMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin me-1" /> : null}
              {txt.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
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
              onClick={() => selectedProvider && deleteProviderMutation.mutate(selectedProvider.id)}
            >
              {txt.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
