import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Server, 
  Cloud, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Network, 
  Plus, 
  RefreshCw, 
  Settings,
  Power,
  PowerOff,
  Trash2,
  Activity,
  DollarSign,
  Globe,
  Shield,
  Rocket,
  Box,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Loader2
} from "lucide-react";
import { SiHetzner, SiAmazonwebservices, SiGooglecloud, SiDigitalocean } from "react-icons/si";
import type { InfrastructureProvider, InfrastructureServer, DeploymentRun, InfrastructureBackup, InfrastructureAuditLog, ProviderErrorLog } from "@shared/schema";

const translations = {
  ar: {
    title: "البنية التحتية السيادية",
    subtitle: "إدارة السيرفرات والنشر بدون اعتماد على مزود واحد",
    tabs: {
      providers: "مزودي الخدمات",
      servers: "السيرفرات",
      deployments: "عمليات النشر",
      backups: "النسخ الاحتياطية",
      costs: "التكاليف",
      auditLogs: "سجل العمليات"
    },
    providers: {
      title: "مزودي البنية التحتية",
      add: "إضافة مزود",
      hetzner: "Hetzner",
      aws: "Amazon AWS",
      gcp: "Google Cloud",
      azure: "Microsoft Azure",
      digitalocean: "DigitalOcean",
      connected: "متصل",
      disconnected: "غير متصل",
      primary: "أساسي",
      secondary: "احتياطي"
    },
    servers: {
      title: "السيرفرات النشطة",
      add: "إنشاء سيرفر",
      running: "يعمل",
      stopped: "متوقف",
      provisioning: "جاري الإنشاء",
      error: "خطأ",
      cpu: "المعالج",
      ram: "الذاكرة",
      storage: "التخزين",
      costPerMonth: "التكلفة/شهر"
    },
    deployments: {
      title: "عمليات النشر",
      deploy: "نشر جديد",
      pending: "في الانتظار",
      building: "جاري البناء",
      deploying: "جاري النشر",
      running: "يعمل",
      failed: "فشل",
      rollback: "تراجع"
    },
    backups: {
      title: "النسخ الاحتياطية",
      create: "إنشاء نسخة",
      available: "متاح",
      creating: "جاري الإنشاء",
      restore: "استعادة"
    },
    costs: {
      title: "ملخص التكاليف",
      thisMonth: "هذا الشهر",
      projected: "المتوقع",
      budget: "الميزانية",
      alerts: "تنبيهات التكلفة"
    },
    controls: {
      start: "تشغيل",
      stop: "إيقاف",
      reboot: "إعادة تشغيل",
      reset: "إعادة ضبط",
      powerOff: "إيقاف فوري",
      confirmAction: "تأكيد الإجراء",
      confirmMessage: "اكتب اسم السيرفر للتأكيد:",
      cancel: "إلغاء",
      confirm: "تأكيد",
      actionSuccess: "تم تنفيذ الإجراء بنجاح",
      actionFailed: "فشل تنفيذ الإجراء"
    },
    empty: "لا توجد بيانات",
    loading: "جاري التحميل..."
  },
  en: {
    title: "Sovereign Infrastructure",
    subtitle: "Cloud-agnostic server management and deployment",
    tabs: {
      providers: "Providers",
      servers: "Servers",
      deployments: "Deployments",
      backups: "Backups",
      costs: "Costs",
      auditLogs: "Audit Logs"
    },
    providers: {
      title: "Infrastructure Providers",
      add: "Add Provider",
      hetzner: "Hetzner",
      aws: "Amazon AWS",
      gcp: "Google Cloud",
      azure: "Microsoft Azure",
      digitalocean: "DigitalOcean",
      connected: "Connected",
      disconnected: "Disconnected",
      primary: "Primary",
      secondary: "Secondary"
    },
    servers: {
      title: "Active Servers",
      add: "Create Server",
      running: "Running",
      stopped: "Stopped",
      provisioning: "Provisioning",
      error: "Error",
      cpu: "CPU",
      ram: "RAM",
      storage: "Storage",
      costPerMonth: "Cost/Month"
    },
    deployments: {
      title: "Deployments",
      deploy: "New Deploy",
      pending: "Pending",
      building: "Building",
      deploying: "Deploying",
      running: "Running",
      failed: "Failed",
      rollback: "Rollback"
    },
    backups: {
      title: "Backups",
      create: "Create Backup",
      available: "Available",
      creating: "Creating",
      restore: "Restore"
    },
    costs: {
      title: "Cost Summary",
      thisMonth: "This Month",
      projected: "Projected",
      budget: "Budget",
      alerts: "Cost Alerts"
    },
    controls: {
      start: "Start",
      stop: "Stop",
      reboot: "Reboot",
      reset: "Hard Reset",
      powerOff: "Power Off",
      confirmAction: "Confirm Action",
      confirmMessage: "Type server name to confirm:",
      cancel: "Cancel",
      confirm: "Confirm",
      actionSuccess: "Action executed successfully",
      actionFailed: "Action failed"
    },
    empty: "No data",
    loading: "Loading..."
  }
};

function getProviderIcon(name: string) {
  switch (name?.toLowerCase()) {
    case 'hetzner': return <SiHetzner className="w-6 h-6" />;
    case 'aws': return <SiAmazonwebservices className="w-6 h-6" />;
    case 'gcp': return <SiGooglecloud className="w-6 h-6" />;
    case 'azure': return <Cloud className="w-6 h-6 text-blue-600" />;
    case 'digitalocean': return <SiDigitalocean className="w-6 h-6" />;
    default: return <Cloud className="w-6 h-6" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'running': case 'connected': case 'available': return 'bg-green-600 text-white';
    case 'stopped': case 'disconnected': return 'bg-gray-500 text-white';
    case 'provisioning': case 'building': case 'deploying': case 'creating': return 'bg-blue-500 text-white';
    case 'error': case 'failed': return 'bg-red-500 text-white';
    default: return 'bg-gray-400 text-white';
  }
}

export default function OwnerInfrastructure() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.ar;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("providers");
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showAddServer, setShowAddServer] = useState(false);
  const [showProviderSettings, setShowProviderSettings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<InfrastructureProvider | null>(null);
  const [newProviderForm, setNewProviderForm] = useState({ name: "", displayName: "", type: "primary" });
  const [apiTokenInput, setApiTokenInput] = useState("");
  const [newServerForm, setNewServerForm] = useState({ name: "", providerId: "", serverType: "", region: "", cpu: 2, ram: 4, storage: 40 });

  const { data: providersData, isLoading: loadingProviders, refetch: refetchProviders } = useQuery<{ providers: InfrastructureProvider[] }>({
    queryKey: ['/api/owner/infrastructure/providers']
  });

  const { data: serversData, isLoading: loadingServers, refetch: refetchServers } = useQuery<{ servers: InfrastructureServer[] }>({
    queryKey: ['/api/owner/infrastructure/servers']
  });

  const { data: deploymentsData, isLoading: loadingDeployments } = useQuery<{ deployments: DeploymentRun[] }>({
    queryKey: ['/api/owner/infrastructure/deployments']
  });

  const { data: auditLogsData, isLoading: loadingAuditLogs } = useQuery<{ logs: InfrastructureAuditLog[] }>({
    queryKey: ['/api/owner/infrastructure/audit-logs']
  });

  const { data: errorLogsData, isLoading: loadingErrorLogs } = useQuery<{ logs: ProviderErrorLog[] }>({
    queryKey: ['/api/owner/infrastructure/error-logs']
  });

  const { data: backupsData, isLoading: loadingBackups } = useQuery<{ backups: InfrastructureBackup[] }>({
    queryKey: ['/api/owner/infrastructure/backups']
  });

  const { data: costAlertsData } = useQuery<{ alerts: any[] }>({
    queryKey: ['/api/owner/infrastructure/cost-alerts']
  });

  const { data: budgetsData } = useQuery<{ budgets: any[] }>({
    queryKey: ['/api/owner/infrastructure/budgets']
  });

  const { data: availableProvidersData } = useQuery<{ providers: { name: string; displayName: string; configured: boolean }[] }>({
    queryKey: ['/api/owner/infrastructure/available-providers']
  });

  const { data: encryptionStatusData, isLoading: loadingEncryptionStatus } = useQuery<{ customEncryptionEnabled: boolean; encryptionActive: boolean }>({
    queryKey: ['/api/owner/infrastructure/encryption-status']
  });

  const connectHetznerMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/owner/infrastructure/providers/connect-hetzner'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/infrastructure/providers'] });
      toast({ 
        title: language === 'ar' ? 'تم ربط Hetzner بنجاح' : 'Hetzner connected successfully',
        description: language === 'ar' ? 'يمكنك الآن إدارة السيرفرات' : 'You can now manage servers'
      });
    },
    onError: (error: any) => {
      toast({ 
        title: language === 'ar' ? 'فشل الربط' : 'Connection failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const testHetznerMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/owner/infrastructure/providers/test-hetzner'),
    onSuccess: (data: any) => {
      if (data.connected) {
        toast({ 
          title: language === 'ar' ? 'الاتصال ناجح' : 'Connection successful',
          description: language === 'ar' ? `عدد السيرفرات: ${data.serverCount}` : `Server count: ${data.serverCount}`
        });
      } else {
        toast({ 
          title: language === 'ar' ? 'فشل الاتصال' : 'Connection failed',
          description: data.error,
          variant: 'destructive'
        });
      }
    }
  });

  const syncServersMutation = useMutation({
    mutationFn: (providerId: string) => apiRequest('POST', `/api/owner/infrastructure/providers/${providerId}/sync-servers`),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/infrastructure/servers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/infrastructure/providers'] });
      toast({ 
        title: language === 'ar' ? 'تمت المزامنة' : 'Sync completed',
        description: data.message
      });
    },
    onError: (error: any) => {
      toast({ 
        title: language === 'ar' ? 'فشلت المزامنة' : 'Sync failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const availableProviders = availableProvidersData?.providers || [];

  const createProviderMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/owner/infrastructure/providers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/infrastructure/providers'] });
      setShowAddProvider(false);
      toast({ title: language === 'ar' ? 'تم إضافة المزود' : 'Provider added' });
    }
  });

  const createServerMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/owner/infrastructure/servers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/infrastructure/servers'] });
      setShowAddServer(false);
      toast({ title: language === 'ar' ? 'تم إنشاء السيرفر' : 'Server created' });
    }
  });

  const deleteServerMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/owner/infrastructure/servers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/infrastructure/servers'] });
      toast({ title: language === 'ar' ? 'تم حذف السيرفر' : 'Server deleted' });
    }
  });

  const [serverActionModal, setServerActionModal] = useState<{
    open: boolean;
    server: InfrastructureServer | null;
    action: string;
    confirmationName: string;
    requiresConfirmation: boolean;
  }>({ open: false, server: null, action: '', confirmationName: '', requiresConfirmation: false });

  const serverActionMutation = useMutation({
    mutationFn: ({ serverId, action, confirmationName }: { serverId: string; action: string; confirmationName?: string }) =>
      apiRequest('POST', `/api/owner/infrastructure/servers/${serverId}/action`, { action, confirmationName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/infrastructure/servers'] });
      setServerActionModal({ open: false, server: null, action: '', confirmationName: '', requiresConfirmation: false });
      toast({ title: t.controls.actionSuccess });
    },
    onError: (error: any) => {
      if (error?.requiresConfirmation) {
        setServerActionModal(prev => ({ ...prev, requiresConfirmation: true }));
      } else {
        toast({ title: t.controls.actionFailed, description: error?.message, variant: 'destructive' });
      }
    }
  });

  const handleServerAction = (server: InfrastructureServer, action: string) => {
    const destructiveActions = ['power_off', 'reset', 'shutdown', 'stop'];
    if (destructiveActions.includes(action)) {
      setServerActionModal({ open: true, server, action, confirmationName: '', requiresConfirmation: true });
    } else {
      serverActionMutation.mutate({ serverId: server.id, action });
    }
  };

  const confirmServerAction = () => {
    if (serverActionModal.server && serverActionModal.action) {
      serverActionMutation.mutate({
        serverId: serverActionModal.server.id,
        action: serverActionModal.action,
        confirmationName: serverActionModal.confirmationName
      });
    }
  };

  const deleteProviderMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/owner/infrastructure/providers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/infrastructure/providers'] });
      setShowProviderSettings(false);
      setSelectedProvider(null);
      toast({ title: language === 'ar' ? 'تم حذف المزود' : 'Provider deleted' });
    },
    onError: (error: any) => {
      toast({ 
        title: language === 'ar' ? 'فشل الحذف' : 'Delete failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const saveCredentialsMutation = useMutation({
    mutationFn: (data: { providerId: string; token: string }) => 
      apiRequest('POST', `/api/owner/infrastructure/providers/${data.providerId}/credentials`, { token: data.token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/infrastructure/providers'] });
      setApiTokenInput("");
      toast({ title: language === 'ar' ? 'تم حفظ بيانات الاعتماد' : 'Credentials saved' });
    },
    onError: (error: any) => {
      toast({ 
        title: language === 'ar' ? 'فشل الحفظ' : 'Save failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const providers = providersData?.providers || [];
  const servers = serversData?.servers || [];
  const deployments = deploymentsData?.deployments || [];
  const backups = backupsData?.backups || [];
  const costAlerts = costAlertsData?.alerts || [];
  const budgets = budgetsData?.budgets || [];

  const hetznerConfigured = availableProviders.some(p => p.name === 'hetzner');
  const hetznerConnected = providers.some(p => p.name === 'hetzner' && p.connectionStatus === 'connected');

  const totalMonthlyCost = servers.reduce((sum, s) => sum + (s.costPerMonth || 0), 0);
  const activeServers = servers.filter(s => s.status === 'running').length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
            <Server className="w-8 h-8 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Button variant="outline" onClick={() => { refetchProviders(); refetchServers(); }} data-testid="button-refresh">
          <RefreshCw className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المزودين' : 'Providers'}</p>
                <p className="text-2xl font-bold" data-testid="text-stat-providers">{providers.length}</p>
              </div>
              <Cloud className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'السيرفرات النشطة' : 'Active Servers'}</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-stat-servers">{activeServers}/{servers.length}</p>
              </div>
              <Server className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'عمليات النشر' : 'Deployments'}</p>
                <p className="text-2xl font-bold text-blue-600" data-testid="text-stat-deployments">{deployments.length}</p>
              </div>
              <Rocket className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'التكلفة/شهر' : 'Cost/Month'}</p>
                <p className="text-2xl font-bold" data-testid="text-stat-cost">${totalMonthlyCost.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="providers" className="gap-2" data-testid="tab-providers">
            <Cloud className="w-4 h-4" />
            {t.tabs.providers}
          </TabsTrigger>
          <TabsTrigger value="servers" className="gap-2" data-testid="tab-servers">
            <Server className="w-4 h-4" />
            {t.tabs.servers}
          </TabsTrigger>
          <TabsTrigger value="deployments" className="gap-2" data-testid="tab-deployments">
            <Rocket className="w-4 h-4" />
            {t.tabs.deployments}
          </TabsTrigger>
          <TabsTrigger value="backups" className="gap-2" data-testid="tab-backups">
            <HardDrive className="w-4 h-4" />
            {t.tabs.backups}
          </TabsTrigger>
          <TabsTrigger value="costs" className="gap-2" data-testid="tab-costs">
            <DollarSign className="w-4 h-4" />
            {t.tabs.costs}
          </TabsTrigger>
          <TabsTrigger value="auditLogs" className="gap-2" data-testid="tab-audit-logs">
            <Activity className="w-4 h-4" />
            {t.tabs.auditLogs}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2" data-testid="tab-security">
            <Shield className="w-4 h-4" />
            {language === 'ar' ? 'الأمان' : 'Security'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-medium">{t.providers.title}</h3>
            <Dialog open={showAddProvider} onOpenChange={setShowAddProvider}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-provider">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.providers.add}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.providers.add}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{language === 'ar' ? 'المزود' : 'Provider'}</Label>
                    <Select value={newProviderForm.name} onValueChange={(v) => setNewProviderForm({...newProviderForm, name: v, displayName: v})}>
                      <SelectTrigger data-testid="select-provider-name">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hetzner">Hetzner</SelectItem>
                        <SelectItem value="aws">Amazon AWS</SelectItem>
                        <SelectItem value="gcp">Google Cloud</SelectItem>
                        <SelectItem value="azure">Microsoft Azure</SelectItem>
                        <SelectItem value="digitalocean">DigitalOcean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'النوع' : 'Type'}</Label>
                    <Select value={newProviderForm.type} onValueChange={(v) => setNewProviderForm({...newProviderForm, type: v})}>
                      <SelectTrigger data-testid="select-provider-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">{t.providers.primary}</SelectItem>
                        <SelectItem value="secondary">{t.providers.secondary}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => createProviderMutation.mutate(newProviderForm)}
                    disabled={createProviderMutation.isPending || !newProviderForm.name}
                    data-testid="button-confirm-add-provider"
                  >
                    {t.providers.add}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Show Hetzner quick connect card if configured but not connected */}
            {hetznerConfigured && !hetznerConnected && (
              <Card className="border-dashed border-2 border-primary/50 bg-primary/5" data-testid="card-hetzner-connect">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <SiHetzner className="w-8 h-8 text-red-500" />
                    <div>
                      <CardTitle className="text-base">Hetzner Cloud</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'مفتاح API جاهز للربط' : 'API key ready to connect'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'تم العثور على مفتاح HETZNER_API_TOKEN. اضغط للربط واستيراد السيرفرات.'
                        : 'HETZNER_API_TOKEN found. Click to connect and import servers.'}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => connectHetznerMutation.mutate()}
                        disabled={connectHetznerMutation.isPending}
                        className="flex-1"
                        data-testid="button-connect-hetzner"
                      >
                        {connectHetznerMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        {language === 'ar' ? 'ربط الآن' : 'Connect Now'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => testHetznerMutation.mutate()}
                        disabled={testHetznerMutation.isPending}
                        data-testid="button-test-hetzner"
                      >
                        {testHetznerMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {loadingProviders ? (
              <div className="col-span-3 text-center py-8 text-muted-foreground">{t.loading}</div>
            ) : providers.length === 0 && !hetznerConfigured ? (
              <div className="col-span-3 text-center py-8 text-muted-foreground">{t.empty}</div>
            ) : (
              providers.map((provider) => (
                <Card key={provider.id} data-testid={`card-provider-${provider.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getProviderIcon(provider.name)}
                        <div>
                          <CardTitle className="text-base">{provider.displayName}</CardTitle>
                          <p className="text-sm text-muted-foreground">{provider.name}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getStatusColor(provider.connectionStatus)}>
                          {provider.connectionStatus === 'connected' ? t.providers.connected : t.providers.disconnected}
                        </Badge>
                        {provider.isPrimary && (
                          <Badge variant="outline">{t.providers.primary}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{language === 'ar' ? 'السيرفرات النشطة' : 'Active Servers'}</span>
                        <span className="font-medium">{provider.activeServers || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{language === 'ar' ? 'التكلفة هذا الشهر' : 'Cost This Month'}</span>
                        <span className="font-medium">${(provider.totalCostThisMonth || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{language === 'ar' ? 'صحة الاتصال' : 'Health Score'}</span>
                        <span className="font-medium">{provider.healthScore || 0}%</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setApiTokenInput("");
                        setShowProviderSettings(true);
                      }}
                      data-testid={`button-provider-settings-${provider.id}`}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'إعدادات' : 'Settings'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Provider Settings Dialog */}
          <Dialog open={showProviderSettings} onOpenChange={setShowProviderSettings}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedProvider && getProviderIcon(selectedProvider.name)}
                  {language === 'ar' ? 'إعدادات المزود' : 'Provider Settings'}
                </DialogTitle>
              </DialogHeader>
              {selectedProvider && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{language === 'ar' ? 'الاسم' : 'Name'}</span>
                      <p className="font-medium">{selectedProvider.displayName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{language === 'ar' ? 'الحالة' : 'Status'}</span>
                      <div className="mt-1">
                        <Badge className={getStatusColor(selectedProvider.connectionStatus)}>
                          {selectedProvider.connectionStatus === 'connected' ? t.providers.connected : t.providers.disconnected}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{language === 'ar' ? 'السيرفرات النشطة' : 'Active Servers'}</span>
                      <p className="font-medium">{selectedProvider.activeServers || 0}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{language === 'ar' ? 'صحة الاتصال' : 'Health Score'}</span>
                      <p className="font-medium">{selectedProvider.healthScore || 0}%</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <Label>{language === 'ar' ? 'رمز API' : 'API Token'}</Label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="password"
                          placeholder={language === 'ar' ? 'أدخل رمز API الخاص بالمزود' : 'Enter provider API token'}
                          value={apiTokenInput}
                          onChange={(e) => setApiTokenInput(e.target.value)}
                          data-testid="input-api-token"
                        />
                        <Button 
                          onClick={() => saveCredentialsMutation.mutate({ providerId: selectedProvider.id, token: apiTokenInput })}
                          disabled={saveCredentialsMutation.isPending || !apiTokenInput.trim()}
                          data-testid="button-save-token"
                        >
                          {saveCredentialsMutation.isPending ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            language === 'ar' ? 'حفظ' : 'Save'
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'ar' ? 'يتم تشفير الرمز وتخزينه بشكل آمن' : 'Token is encrypted and stored securely'}
                      </p>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => testHetznerMutation.mutate()}
                      disabled={testHetznerMutation.isPending || selectedProvider.name !== 'hetzner'}
                      data-testid="button-test-provider-connection"
                    >
                      {testHetznerMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Activity className="w-4 h-4 mr-2" />
                      )}
                      {language === 'ar' ? 'اختبار الاتصال' : 'Test Connection'}
                    </Button>

                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => syncServersMutation.mutate(selectedProvider.id)}
                      disabled={syncServersMutation.isPending || selectedProvider.connectionStatus !== 'connected'}
                      data-testid="button-sync-servers"
                    >
                      {syncServersMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      {language === 'ar' ? 'مزامنة السيرفرات' : 'Sync Servers'}
                    </Button>

                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => {
                        if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المزود؟' : 'Are you sure you want to delete this provider?')) {
                          deleteProviderMutation.mutate(selectedProvider.id);
                        }
                      }}
                      disabled={deleteProviderMutation.isPending}
                      data-testid="button-delete-provider"
                    >
                      {deleteProviderMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      {language === 'ar' ? 'حذف المزود' : 'Delete Provider'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="servers">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-medium">{t.servers.title}</h3>
            <Dialog open={showAddServer} onOpenChange={setShowAddServer}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-server">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.servers.add}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.servers.add}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                    <Input 
                      value={newServerForm.name}
                      onChange={(e) => setNewServerForm({...newServerForm, name: e.target.value})}
                      data-testid="input-server-name"
                    />
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'المزود' : 'Provider'}</Label>
                    <Select value={newServerForm.providerId} onValueChange={(v) => setNewServerForm({...newServerForm, providerId: v})}>
                      <SelectTrigger data-testid="select-server-provider">
                        <SelectValue placeholder={language === 'ar' ? 'اختر المزود' : 'Select Provider'} />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.length === 0 ? (
                          <SelectItem value="none" disabled>{language === 'ar' ? 'لا يوجد مزودين' : 'No providers'}</SelectItem>
                        ) : (
                          providers.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.displayName}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>{t.servers.cpu}</Label>
                      <Input 
                        type="number"
                        value={newServerForm.cpu}
                        onChange={(e) => setNewServerForm({...newServerForm, cpu: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>{t.servers.ram} (GB)</Label>
                      <Input 
                        type="number"
                        value={newServerForm.ram}
                        onChange={(e) => setNewServerForm({...newServerForm, ram: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>{t.servers.storage} (GB)</Label>
                      <Input 
                        type="number"
                        value={newServerForm.storage}
                        onChange={(e) => setNewServerForm({...newServerForm, storage: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => createServerMutation.mutate({
                      ...newServerForm,
                      serverType: 'cx21',
                      region: 'eu-central'
                    })}
                    disabled={createServerMutation.isPending || !newServerForm.name || !newServerForm.providerId}
                    data-testid="button-confirm-add-server"
                  >
                    {t.servers.add}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="h-[500px]">
            {loadingServers ? (
              <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
            ) : servers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t.empty}</div>
            ) : (
              <div className="space-y-4">
                {servers.map((server) => (
                  <Card key={server.id} data-testid={`card-server-${server.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <Server className="w-8 h-8" />
                          <div>
                            <h4 className="font-medium">{server.name}</h4>
                            <p className="text-sm text-muted-foreground">{server.ipv4 || 'Pending IP'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(server.status)}>
                            {t.servers[server.status as keyof typeof t.servers] || server.status}
                          </Badge>
                          {server.status === 'stopped' ? (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleServerAction(server, 'start')}
                              disabled={serverActionMutation.isPending}
                              data-testid={`button-start-${server.id}`}
                            >
                              <Play className="w-4 h-4 text-green-500" />
                            </Button>
                          ) : server.status === 'running' ? (
                            <>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleServerAction(server, 'stop')}
                                disabled={serverActionMutation.isPending}
                                data-testid={`button-stop-${server.id}`}
                              >
                                <Pause className="w-4 h-4 text-orange-500" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleServerAction(server, 'reboot')}
                                disabled={serverActionMutation.isPending}
                                data-testid={`button-reboot-${server.id}`}
                              >
                                <RotateCcw className="w-4 h-4 text-blue-500" />
                              </Button>
                            </>
                          ) : (
                            <Button size="icon" variant="ghost" disabled>
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => deleteServerMutation.mutate(server.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1"><Cpu className="w-3 h-3" /> {t.servers.cpu}</p>
                          <p className="font-medium">{server.cpu} vCPU</p>
                          <Progress value={server.cpuUsage || 0} className="h-1 mt-1" />
                        </div>
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1"><MemoryStick className="w-3 h-3" /> {t.servers.ram}</p>
                          <p className="font-medium">{server.ram} GB</p>
                          <Progress value={server.ramUsage || 0} className="h-1 mt-1" />
                        </div>
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1"><HardDrive className="w-3 h-3" /> {t.servers.storage}</p>
                          <p className="font-medium">{server.storage} GB</p>
                          <Progress value={server.storageUsage || 0} className="h-1 mt-1" />
                        </div>
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" /> {language === 'ar' ? 'المنطقة' : 'Region'}</p>
                          <p className="font-medium">{server.region}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" /> {t.servers.costPerMonth}</p>
                          <p className="font-medium">${(server.costPerMonth || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="deployments">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-medium">{t.deployments.title}</h3>
            <Button data-testid="button-new-deploy">
              <Rocket className="w-4 h-4 mr-2" />
              {t.deployments.deploy}
            </Button>
          </div>

          <ScrollArea className="h-[500px]">
            {loadingDeployments ? (
              <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
            ) : deployments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t.empty}</div>
            ) : (
              <div className="space-y-4">
                {deployments.map((deployment) => (
                  <Card key={deployment.id} data-testid={`card-deployment-${deployment.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <Rocket className="w-6 h-6" />
                          <div>
                            <h4 className="font-medium">{deployment.name}</h4>
                            <p className="text-sm text-muted-foreground">v{deployment.version} - {deployment.environment}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(deployment.status)}>
                            {t.deployments[deployment.status as keyof typeof t.deployments] || deployment.status}
                          </Badge>
                          {deployment.canRollback && (
                            <Button size="sm" variant="outline">
                              <RotateCcw className="w-4 h-4 mr-1" />
                              {t.deployments.rollback}
                            </Button>
                          )}
                        </div>
                      </div>
                      {deployment.progress !== undefined && deployment.progress !== null && deployment.progress < 100 && (
                        <Progress value={deployment.progress} className="h-2 mb-2" />
                      )}
                      {deployment.deployedUrl && (
                        <a href={deployment.deployedUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          {deployment.deployedUrl}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="backups">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-medium">{t.backups.title}</h3>
            <Button data-testid="button-create-backup">
              <Plus className="w-4 h-4 mr-2" />
              {t.backups.create}
            </Button>
          </div>

          <ScrollArea className="h-[500px]">
            {loadingBackups ? (
              <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t.empty}</div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <Card key={backup.id} data-testid={`card-backup-${backup.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <HardDrive className="w-6 h-6" />
                          <div>
                            <h4 className="font-medium">{backup.name}</h4>
                            <p className="text-sm text-muted-foreground">{backup.sizeGb} GB - {backup.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(backup.status)}>
                            {t.backups[backup.status as keyof typeof t.backups] || backup.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            {t.backups.restore}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="costs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t.costs.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.costs.thisMonth}</span>
                    <span className="text-2xl font-bold">${totalMonthlyCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.costs.projected}</span>
                    <span className="font-medium">${(totalMonthlyCost * 1.1).toFixed(2)}</span>
                  </div>
                  {budgets[0] && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">{t.costs.budget}</span>
                        <span className="font-medium">${budgets[0].monthlyLimit}</span>
                      </div>
                      <Progress value={(totalMonthlyCost / (budgets[0].monthlyLimit || 100)) * 100} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Per Server Costs */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  {language === 'ar' ? 'تكلفة كل سيرفر' : 'Per Server Costs'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  {servers.length === 0 ? (
                    <div className="text-center py-4">
                      <Server className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">{language === 'ar' ? 'لا توجد سيرفرات' : 'No servers'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {servers.map((server) => (
                        <div key={server.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md" data-testid={`cost-row-${server.id}`}>
                          <div className="flex items-center gap-3">
                            <Server className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{server.name}</p>
                              <p className="text-xs text-muted-foreground">{server.serverType} • {server.region}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(server.costPerMonth || 0).toFixed(2)}<span className="text-xs text-muted-foreground">/mo</span></p>
                            <p className="text-xs text-muted-foreground">${(server.costPerHour || 0).toFixed(4)}/hr</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Alerts */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t.costs.alerts}</CardTitle>
              </CardHeader>
              <CardContent>
                {costAlerts.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">{language === 'ar' ? 'لا توجد تنبيهات' : 'No alerts'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {costAlerts.map((alert, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">{alert.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="auditLogs">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {language === 'ar' ? 'سجل العمليات' : 'Operations Log'}
                  </CardTitle>
                  <CardDescription>
                    {language === 'ar' 
                      ? 'تتبع جميع العمليات على البنية التحتية' 
                      : 'Track all infrastructure operations'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAuditLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">{t.loading}</span>
                  </div>
                ) : (auditLogsData?.logs?.length || 0) === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد سجلات بعد' : 'No logs yet'}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {auditLogsData?.logs?.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${log.success ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                              <p className="font-medium text-sm">{log.action}</p>
                              <p className="text-xs text-muted-foreground">
                                {log.targetName || log.targetId} • {log.userEmail || log.userId}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={log.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                              {log.success ? (language === 'ar' ? 'نجح' : 'Success') : (language === 'ar' ? 'فشل' : 'Failed')}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  {language === 'ar' ? 'أخطاء المزودين' : 'Provider Errors'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'أخطاء API وحدود المعدل وإخفاقات الشبكة' 
                    : 'API errors, rate limits, and network failures'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingErrorLogs ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">{t.loading}</span>
                  </div>
                ) : (errorLogsData?.logs?.length || 0) === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد أخطاء' : 'No errors'}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {errorLogsData?.logs?.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-900">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="font-medium text-sm">{log.errorType}</p>
                              <p className="text-xs text-muted-foreground">{log.errorMessage}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={log.resolved ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                              {log.resolved ? (language === 'ar' ? 'تم الحل' : 'Resolved') : (language === 'ar' ? 'نشط' : 'Active')}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {language === 'ar' ? 'إعدادات التشفير' : 'Encryption Settings'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'إدارة تشفير بيانات اعتماد مزودي البنية التحتية' 
                    : 'Manage infrastructure provider credential encryption'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingEncryptionStatus ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${encryptionStatusData?.encryptionActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="font-medium">{language === 'ar' ? 'حالة التشفير' : 'Encryption Status'}</p>
                          <p className="text-sm text-muted-foreground">
                            {encryptionStatusData?.encryptionActive 
                              ? (language === 'ar' ? 'نشط' : 'Active')
                              : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                          </p>
                        </div>
                      </div>
                      <Badge className={encryptionStatusData?.encryptionActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                        {encryptionStatusData?.encryptionActive 
                          ? (language === 'ar' ? 'مفعّل' : 'Enabled')
                          : (language === 'ar' ? 'معطّل' : 'Disabled')}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${encryptionStatusData?.customEncryptionEnabled ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <div>
                          <p className="font-medium">{language === 'ar' ? 'مفتاح تشفير مخصص' : 'Custom Encryption Key'}</p>
                          <p className="text-sm text-muted-foreground">
                            {encryptionStatusData?.customEncryptionEnabled 
                              ? (language === 'ar' ? 'تم تكوين INFRA_CREDENTIALS_SECRET' : 'INFRA_CREDENTIALS_SECRET configured')
                              : (language === 'ar' ? 'يستخدم مفتاح الجلسة الافتراضي' : 'Using default session key')}
                          </p>
                        </div>
                      </div>
                      <Badge className={encryptionStatusData?.customEncryptionEnabled ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                        {encryptionStatusData?.customEncryptionEnabled 
                          ? (language === 'ar' ? 'مخصص' : 'Custom')
                          : (language === 'ar' ? 'افتراضي' : 'Default')}
                      </Badge>
                    </div>
                  </>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'ar' 
                      ? 'لتفعيل مفتاح تشفير مخصص، أضف متغير البيئة INFRA_CREDENTIALS_SECRET في إعدادات المشروع.' 
                      : 'To enable a custom encryption key, add the INFRA_CREDENTIALS_SECRET environment variable in project settings.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {language === 'ar' ? 'بيانات الاعتماد المحفوظة' : 'Saved Credentials'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'عرض بيانات اعتماد المزودين المحفوظة' 
                    : 'View saved provider credentials'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProviders ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
                  </div>
                ) : providers.filter(p => p.connectionStatus === 'connected').length === 0 ? (
                  <div className="text-center py-4">
                    <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد بيانات اعتماد محفوظة' : 'No saved credentials'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {providers.filter(p => p.connectionStatus === 'connected').map((provider) => (
                      <div key={provider.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2">
                          {getProviderIcon(provider.name)}
                          <span className="font-medium">{provider.displayName}</span>
                        </div>
                        <Badge className="bg-green-600 text-white">
                          {language === 'ar' ? 'متصل' : 'Connected'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Server Action Confirmation Modal */}
      <Dialog open={serverActionModal.open} onOpenChange={(open) => !open && setServerActionModal({ open: false, server: null, action: '', confirmationName: '', requiresConfirmation: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              {t.controls.confirmAction}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              {language === 'ar' 
                ? `هل أنت متأكد من ${serverActionModal.action === 'stop' ? 'إيقاف' : serverActionModal.action === 'reboot' ? 'إعادة تشغيل' : serverActionModal.action === 'reset' ? 'إعادة ضبط' : serverActionModal.action === 'power_off' ? 'إيقاف فوري' : ''} السيرفر "${serverActionModal.server?.name}"؟`
                : `Are you sure you want to ${serverActionModal.action} the server "${serverActionModal.server?.name}"?`}
            </p>
            {serverActionModal.requiresConfirmation && (
              <div className="space-y-2">
                <Label>{t.controls.confirmMessage}</Label>
                <Input
                  value={serverActionModal.confirmationName}
                  onChange={(e) => setServerActionModal(prev => ({ ...prev, confirmationName: e.target.value }))}
                  placeholder={serverActionModal.server?.name || ''}
                  data-testid="input-confirm-server-name"
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setServerActionModal({ open: false, server: null, action: '', confirmationName: '', requiresConfirmation: false })}
            >
              {t.controls.cancel}
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmServerAction}
              disabled={serverActionMutation.isPending || (serverActionModal.requiresConfirmation && serverActionModal.confirmationName !== serverActionModal.server?.name)}
              data-testid="button-confirm-action"
            >
              {serverActionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t.controls.confirm
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
