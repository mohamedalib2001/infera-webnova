import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Cloud, Server, Settings, Power, Trash2, Plus, RefreshCw,
  Rocket, Upload, Play, Database, Shield, RotateCw, Heart,
  Archive, BarChart3, Terminal, Key, Copy, Eye, EyeOff,
  Loader2, CheckCircle2, XCircle, AlertTriangle, Activity,
  HardDrive, Cpu, MemoryStick, Globe, DollarSign, Clock,
  GitBranch, FolderOpen, Save, Zap, PowerOff
} from "lucide-react";
import { HolographicNeuron } from "@/components/HolographicNeuron";

interface HetznerCloudServer {
  id: number;
  name: string;
  serverType: string;
  location: string;
  status: string;
  publicIpv4: string;
  publicIpv6: string;
  vcpus: number;
  memory: number;
  disk: number;
  priceMonthly: number;
  createdAt: string;
}

interface DeploySettings {
  serverHost: string;
  sshPort: string;
  sshUser: string;
  repoPath: string;
  deployPath: string;
  privateKey: string;
  postDeployCommand: string;
  restartService: boolean;
  serviceName: string;
}

interface ServerType {
  id: number;
  name: string;
  description: string;
  vcpus: number;
  memory: number;
  disk: number;
  priceMonthly: number;
}

interface DeployHistoryEntry {
  id: string;
  date: Date;
  action: string;
  status: 'success' | 'failed' | 'in_progress';
  duration?: number;
  details?: string;
}

interface ActionEntry {
  id: string;
  action: string;
  status: 'running' | 'success' | 'error';
  progress: number;
  startedAt: Date;
  finishedAt?: Date;
  error?: string;
}

interface HetznerConfig {
  apiKey: string;
  defaultLocation: string;
  defaultServerType: string;
  autoScaling: boolean;
  maxServers: number;
  budgetLimit: number;
}

const DEFAULT_DEPLOY_SETTINGS: DeploySettings = {
  serverHost: "91.96.168.125",
  sshPort: "22",
  sshUser: "root",
  repoPath: "",
  deployPath: "/var/www/app",
  privateKey: "",
  postDeployCommand: "",
  restartService: false,
  serviceName: "",
};

const DEFAULT_CONFIG: HetznerConfig = {
  apiKey: "",
  defaultLocation: "nbg1",
  defaultServerType: "cax31",
  autoScaling: false,
  maxServers: 10,
  budgetLimit: 150,
};

const LOCATIONS = [
  { value: "nbg1", label: "Nuremberg (nbg1)" },
  { value: "fsn1", label: "Falkenstein (fsn1)" },
  { value: "hel1", label: "Helsinki (hel1)" },
];

const SERVER_TYPES = [
  { value: "cx11", label: "CX11 - 1 vCPU, 2GB RAM" },
  { value: "cx21", label: "CX21 - 2 vCPU, 4GB RAM" },
  { value: "cax11", label: "CAX11 - 2 vCPU, 4GB RAM (ARM)" },
  { value: "cax21", label: "CAX21 - 4 vCPU, 8GB RAM (ARM)" },
  { value: "cax31", label: "CAX31 - 8 vCPU, 16GB RAM (ARM)" },
];

export default function HetznerCloud() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isRtl = language === "ar";
  
  const t = (en: string, ar: string) => isRtl ? ar : en;
  
  const [activeTab, setActiveTab] = useState("config");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [config, setConfig] = useState<HetznerConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  
  const [servers, setServers] = useState<HetznerCloudServer[]>([]);
  const [serverTypes, setServerTypes] = useState<ServerType[]>([]);
  const [deploySettings, setDeploySettings] = useState<DeploySettings>(DEFAULT_DEPLOY_SETTINGS);
  const [deployHistory, setDeployHistory] = useState<DeployHistoryEntry[]>([]);
  const [actions, setActions] = useState<ActionEntry[]>([]);
  const [deployKey, setDeployKey] = useState<string>("");
  const [hasEnvApiKey, setHasEnvApiKey] = useState(false);
  
  const [createServerDialog, setCreateServerDialog] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [newServerType, setNewServerType] = useState("");
  const [newServerLocation, setNewServerLocation] = useState("");
  
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [serverToDelete, setServerToDelete] = useState<HetznerCloudServer | null>(null);
  
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, disk: 0 });

  // Track if initial data has been loaded and modified
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Load config from backend on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/hetzner-cloud/config');
        const result = await response.json();
        
        if (result.success && result.config) {
          setConfig(prev => ({
            ...prev,
            defaultLocation: result.config.location || prev.defaultLocation,
            defaultServerType: result.config.serverType || prev.defaultServerType,
            maxServers: result.config.maxServers ?? prev.maxServers,
            budgetLimit: result.config.budgetLimit ?? prev.budgetLimit,
          }));
          setDeploySettings(prev => ({
            ...prev,
            serverHost: result.config.defaultDeployIp || prev.serverHost,
            sshPort: result.config.sshPort || prev.sshPort,
            sshUser: result.config.defaultDeployUser || prev.sshUser,
            repoPath: result.config.repoPath ?? prev.repoPath,
            deployPath: result.config.defaultDeployPath || prev.deployPath,
            postDeployCommand: result.config.postDeployCommand ?? prev.postDeployCommand,
            restartService: result.config.restartService ?? prev.restartService,
            serviceName: result.config.serviceName ?? prev.serviceName,
          }));
          setHasEnvApiKey(result.config.hasApiKey || false);
          if (result.config.isConnected) {
            setConnectionStatus('success');
          }
        }
        setConfigLoaded(true);
        // Small delay to ensure state is updated before allowing saves
        setTimeout(() => setInitialLoadComplete(true), 100);
      } catch (error) {
        console.error('Failed to load config:', error);
        setConfigLoaded(true);
        setInitialLoadComplete(true);
      }
    };
    
    loadConfig();
  }, []);

  // Auto-save config to backend when changed (debounced)
  useEffect(() => {
    // Don't save until initial load is complete and there are actual changes
    if (!initialLoadComplete || !hasChanges) return;
    
    const saveTimeout = setTimeout(async () => {
      try {
        await fetch('/api/hetzner-cloud/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            defaultLocation: config.defaultLocation,
            defaultServerType: config.defaultServerType,
            maxServers: config.maxServers,
            budgetLimit: config.budgetLimit,
            defaultDeployIp: deploySettings.serverHost,
            defaultDeployUser: deploySettings.sshUser,
            defaultDeployPath: deploySettings.deployPath,
            sshPort: deploySettings.sshPort,
            repoPath: deploySettings.repoPath,
            postDeployCommand: deploySettings.postDeployCommand,
            restartService: deploySettings.restartService,
            serviceName: deploySettings.serviceName,
          }),
        });
        console.log('[Hetzner] Config auto-saved');
      } catch (error) {
        console.error('Failed to auto-save config:', error);
      }
    }, 1000);
    
    return () => clearTimeout(saveTimeout);
  }, [config.defaultLocation, config.defaultServerType, config.maxServers, config.budgetLimit, 
      deploySettings.serverHost, deploySettings.sshUser, deploySettings.deployPath,
      deploySettings.sshPort, deploySettings.repoPath, deploySettings.postDeployCommand,
      deploySettings.restartService, deploySettings.serviceName, initialLoadComplete, hasChanges]);

  const updateConfig = (key: keyof HetznerConfig, value: string | boolean | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    if (initialLoadComplete) setHasChanges(true);
  };

  const updateDeploySettings = (key: keyof DeploySettings, value: string | boolean) => {
    setDeploySettings(prev => ({ ...prev, [key]: value }));
    if (initialLoadComplete) setHasChanges(true);
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hetzner-cloud/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        toast({
          title: t('Configuration Saved', 'تم حفظ الإعدادات'),
          description: t('Your Hetzner configuration has been saved', 'تم حفظ إعدادات Hetzner الخاصة بك'),
        });
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast({
        title: t('Error', 'خطأ'),
        description: t('Failed to save configuration', 'فشل في حفظ الإعدادات'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus('idle');
    try {
      const response = await fetch('/api/hetzner-cloud/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: config.apiKey }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('success');
        // Update connection status in database
        await fetch('/api/hetzner-cloud/update-connection-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isConnected: true, status: 'success' }),
        });
        toast({
          title: t('Connection Successful', 'الاتصال ناجح'),
          description: t('Successfully connected to Hetzner Cloud', 'تم الاتصال بنجاح بـ Hetzner Cloud'),
        });
      } else {
        setConnectionStatus('error');
        // Update connection status in database
        await fetch('/api/hetzner-cloud/update-connection-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isConnected: false, status: 'error' }),
        });
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: t('Connection Failed', 'فشل الاتصال'),
        description: error instanceof Error ? error.message : t('Could not connect to Hetzner', 'تعذر الاتصال بـ Hetzner'),
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncServers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hetzner-cloud/servers');
      const result = await response.json();
      
      if (result.servers) {
        setServers(result.servers);
        toast({
          title: t('Servers Synced', 'تم مزامنة الخوادم'),
          description: t(`Found ${result.servers.length} servers`, `تم العثور على ${result.servers.length} خوادم`),
        });
      }
    } catch (error) {
      toast({
        title: t('Sync Failed', 'فشل المزامنة'),
        description: t('Could not fetch servers', 'تعذر جلب الخوادم'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateServer = async () => {
    if (!newServerName || !newServerType || !newServerLocation) {
      toast({
        title: t('Missing Fields', 'حقول مفقودة'),
        description: t('Please fill all fields', 'يرجى ملء جميع الحقول'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/hetzner-cloud/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newServerName,
          serverType: newServerType,
          location: newServerLocation,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: t('Server Created', 'تم إنشاء الخادم'),
          description: t('Your new server is being provisioned', 'جاري توفير الخادم الجديد'),
        });
        setCreateServerDialog(false);
        setNewServerName("");
        handleSyncServers();
      } else {
        throw new Error(result.error || 'Failed to create server');
      }
    } catch (error) {
      toast({
        title: t('Creation Failed', 'فشل الإنشاء'),
        description: error instanceof Error ? error.message : t('Could not create server', 'تعذر إنشاء الخادم'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleServerAction = async (serverId: number, action: 'poweron' | 'poweroff' | 'reboot') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/hetzner-cloud/servers/${serverId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: t('Action Executed', 'تم تنفيذ العملية'),
          description: t(`Server ${action} initiated`, `تم بدء ${action} للخادم`),
        });
        handleSyncServers();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: t('Action Failed', 'فشل العملية'),
        description: error instanceof Error ? error.message : t('Could not execute action', 'تعذر تنفيذ العملية'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteServer = async () => {
    if (!serverToDelete || deleteConfirmStep < 4) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/hetzner-cloud/servers/${serverToDelete.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: t('Server Deleted', 'تم حذف الخادم'),
          description: t('Server has been permanently deleted', 'تم حذف الخادم نهائياً'),
        });
        setServerToDelete(null);
        setDeleteConfirmStep(0);
        handleSyncServers();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: t('Deletion Failed', 'فشل الحذف'),
        description: error instanceof Error ? error.message : t('Could not delete server', 'تعذر حذف الخادم'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeDeployAction = async (action: string, endpoint: string, method: string = 'POST') => {
    const startTime = Date.now();
    const entryId = `action-${Date.now()}`;
    
    const newEntry: DeployHistoryEntry = {
      id: entryId,
      date: new Date(),
      action,
      status: 'in_progress',
    };
    
    setDeployHistory(prev => [newEntry, ...prev.slice(0, 9)]);
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'GET' ? JSON.stringify({
          serverHost: deploySettings.serverHost,
          sshPort: parseInt(deploySettings.sshPort) || 22,
          sshUser: deploySettings.sshUser,
          repoPath: deploySettings.repoPath,
          deployPath: deploySettings.deployPath,
          privateKey: deploySettings.privateKey,
          postDeployCommand: deploySettings.postDeployCommand,
          restartService: deploySettings.restartService,
          serviceName: deploySettings.serviceName,
        }) : undefined,
      });
      
      const result = await response.json();
      const duration = Date.now() - startTime;
      
      setDeployHistory(prev => prev.map(entry =>
        entry.id === entryId
          ? { ...entry, status: result.success ? 'success' : 'failed', duration, details: result.message || result.error }
          : entry
      ));
      
      toast({
        title: result.success ? t('Success', 'نجاح') : t('Failed', 'فشل'),
        description: result.message || result.error,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      setDeployHistory(prev => prev.map(entry =>
        entry.id === entryId
          ? { ...entry, status: 'failed', duration, details: error instanceof Error ? error.message : 'Unknown error' }
          : entry
      ));
      
      toast({
        title: t('Error', 'خطأ'),
        description: error instanceof Error ? error.message : t('Action failed', 'فشلت العملية'),
        variant: 'destructive',
      });
    }
  };

  const handleCopyDeployKey = () => {
    navigator.clipboard.writeText(deployKey);
    toast({
      title: t('Copied!', 'تم النسخ!'),
      description: t('Deploy key copied to clipboard', 'تم نسخ مفتاح النشر'),
    });
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'off': return <PowerOff className="w-4 h-4 text-gray-500" />;
      case 'starting': return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default: return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Cloud className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">{t('Hetzner Cloud', 'سحابة Hetzner')}</h1>
            <p className="text-sm text-muted-foreground">{t('Manage your cloud infrastructure', 'إدارة البنية التحتية السحابية')}</p>
          </div>
          <Badge variant="outline" className="ml-auto">{t('Owner Only', 'للمالك فقط')}</Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="config" className="flex items-center gap-2" data-testid="tab-config">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Configuration', 'التكوين')}</span>
            </TabsTrigger>
            <TabsTrigger value="servers" className="flex items-center gap-2" data-testid="tab-servers">
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Servers', 'الخوادم')}</span>
            </TabsTrigger>
            <TabsTrigger value="deploy" className="flex items-center gap-2" data-testid="tab-deploy">
              <Rocket className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Deploy', 'النشر')}</span>
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2" data-testid="tab-monitoring">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Monitoring', 'المراقبة')}</span>
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2" data-testid="tab-types">
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Server Types', 'أنواع الخوادم')}</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2" data-testid="tab-actions">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Actions', 'العمليات')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Configuration */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  {t('API Configuration', 'إعدادات API')}
                </CardTitle>
                <CardDescription>
                  {t('Configure your Hetzner Cloud API credentials', 'إعداد بيانات اعتماد Hetzner Cloud API')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('API Key', 'مفتاح API')}</Label>
                  {hasEnvApiKey ? (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          {t('API Key Configured via Environment', 'مفتاح API مُعدّ عبر البيئة')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('Using HETZNER_API_TOKEN secret (secure)', 'يستخدم سر HETZNER_API_TOKEN (آمن)')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground">{t('Enter your API key or set HETZNER_API_TOKEN in secrets', 'أدخل مفتاح API أو أضف HETZNER_API_TOKEN في الأسرار')}</p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showApiKey ? "text" : "password"}
                            value={config.apiKey}
                            onChange={(e) => updateConfig('apiKey', e.target.value)}
                            placeholder={t('Enter your Hetzner API key', 'أدخل مفتاح Hetzner API')}
                            data-testid="input-api-key"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowApiKey(!showApiKey)}
                            data-testid="button-toggle-api-key"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  {!hasEnvApiKey && (
                    <Button onClick={handleSaveConfig} disabled={isLoading || !config.apiKey} data-testid="button-save-api-key">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      {t('Save Config', 'حفظ الإعدادات')}
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleTestConnection} disabled={isTesting || (!config.apiKey && !hasEnvApiKey)} data-testid="button-test-connection">
                    {isTesting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    {t('Test Connection', 'اختبار الاتصال')}
                  </Button>
                  {connectionStatus !== 'idle' && (
                    <HolographicNeuron isConnected={connectionStatus === 'success'} showLabel={false} />
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('Default Location', 'الموقع الافتراضي')}</Label>
                    <Select value={config.defaultLocation} onValueChange={(v) => updateConfig('defaultLocation', v)}>
                      <SelectTrigger data-testid="select-default-location">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map(loc => (
                          <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('Default Server Type', 'نوع الخادم الافتراضي')}</Label>
                    <Select value={config.defaultServerType} onValueChange={(v) => updateConfig('defaultServerType', v)}>
                      <SelectTrigger data-testid="select-default-server-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVER_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {config.defaultServerType === 'cax31' && (
                      <p className="text-xs text-muted-foreground">
                        {t('Target: INFERA-Engine (91.98.166.125)', 'الهدف: INFERA-Engine (91.98.166.125)')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>{t('Auto Scaling', 'التوسع التلقائي')}</Label>
                    <p className="text-sm text-muted-foreground">{t('Automatically scale servers based on load', 'توسيع الخوادم تلقائياً حسب الحمل')}</p>
                  </div>
                  <Switch
                    checked={config.autoScaling}
                    onCheckedChange={(v) => updateConfig('autoScaling', v)}
                    data-testid="switch-auto-scaling"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('Max Servers', 'الحد الأقصى للخوادم')}</Label>
                    <Input
                      type="number"
                      value={config.maxServers}
                      onChange={(e) => updateConfig('maxServers', parseInt(e.target.value) || 0)}
                      min={1}
                      max={100}
                      data-testid="input-max-servers"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('Budget Limit (EUR)', 'حد الميزانية (يورو)')}</Label>
                    <Input
                      type="number"
                      value={config.budgetLimit}
                      onChange={(e) => updateConfig('budgetLimit', parseFloat(e.target.value) || 0)}
                      min={0}
                      data-testid="input-budget-limit"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Servers */}
          <TabsContent value="servers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{t('Your Servers', 'خوادمك')}</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSyncServers} disabled={isLoading} data-testid="button-sync-servers">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {t('Sync Servers', 'مزامنة الخوادم')}
                </Button>
                <Dialog open={createServerDialog} onOpenChange={setCreateServerDialog}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-create-server">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('Create Server', 'إنشاء خادم')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('Create New Server', 'إنشاء خادم جديد')}</DialogTitle>
                      <DialogDescription>
                        {t('Configure your new Hetzner cloud server', 'إعداد خادم Hetzner السحابي الجديد')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>{t('Server Name', 'اسم الخادم')}</Label>
                        <Input
                          value={newServerName}
                          onChange={(e) => setNewServerName(e.target.value)}
                          placeholder="my-server"
                          data-testid="input-new-server-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('Server Type', 'نوع الخادم')}</Label>
                        <Select value={newServerType} onValueChange={setNewServerType}>
                          <SelectTrigger data-testid="select-new-server-type">
                            <SelectValue placeholder={t('Select type', 'اختر النوع')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cx11">CX11 - 1 vCPU, 2GB RAM</SelectItem>
                            <SelectItem value="cx21">CX21 - 2 vCPU, 4GB RAM</SelectItem>
                            <SelectItem value="cx31">CX31 - 2 vCPU, 8GB RAM</SelectItem>
                            <SelectItem value="cx41">CX41 - 4 vCPU, 16GB RAM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('Location', 'الموقع')}</Label>
                        <Select value={newServerLocation} onValueChange={setNewServerLocation}>
                          <SelectTrigger data-testid="select-new-server-location">
                            <SelectValue placeholder={t('Select location', 'اختر الموقع')} />
                          </SelectTrigger>
                          <SelectContent>
                            {LOCATIONS.map(loc => (
                              <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateServerDialog(false)}>
                        {t('Cancel', 'إلغاء')}
                      </Button>
                      <Button onClick={handleCreateServer} disabled={isLoading} data-testid="button-confirm-create-server">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {t('Create', 'إنشاء')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {servers.length === 0 ? (
              <Card className="p-8 text-center">
                <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('No servers found. Click "Create Server" to get started.', 'لا توجد خوادم. انقر على "إنشاء خادم" للبدء.')}</p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {servers.map(server => (
                  <Card key={server.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getStatusIcon(server.status)}
                          {server.name}
                        </CardTitle>
                        <Badge variant={server.status === 'running' ? 'default' : 'secondary'}>
                          {server.status}
                        </Badge>
                      </div>
                      <CardDescription>{server.serverType} - {server.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('IP', 'IP')}</span>
                        <span className="font-mono">{server.publicIpv4}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('vCPUs', 'وحدات المعالجة')}</span>
                        <span>{server.vcpus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('Memory', 'الذاكرة')}</span>
                        <span>{server.memory} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('Disk', 'التخزين')}</span>
                        <span>{server.disk} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('Price', 'السعر')}</span>
                        <span>{server.priceMonthly.toFixed(2)} EUR/mo</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={server.status === 'running' ? 'outline' : 'default'}
                        onClick={() => handleServerAction(server.id, server.status === 'running' ? 'poweroff' : 'poweron')}
                        data-testid={`button-power-${server.id}`}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleServerAction(server.id, 'reboot')} data-testid={`button-reboot-${server.id}`}>
                        <RotateCw className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" onClick={() => { setServerToDelete(server); setDeleteConfirmStep(1); }} data-testid={`button-delete-${server.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('Delete Server', 'حذف الخادم')} - {t('Step', 'خطوة')} {deleteConfirmStep}/4</AlertDialogTitle>
                            <AlertDialogDescription>
                              {deleteConfirmStep === 1 && t('Are you sure you want to delete this server?', 'هل أنت متأكد أنك تريد حذف هذا الخادم؟')}
                              {deleteConfirmStep === 2 && t('This action cannot be undone. All data will be lost.', 'لا يمكن التراجع عن هذا الإجراء. ستفقد جميع البيانات.')}
                              {deleteConfirmStep === 3 && t('Please confirm once more. This is your last chance.', 'يرجى التأكيد مرة أخرى. هذه فرصتك الأخيرة.')}
                              {deleteConfirmStep === 4 && t('Final confirmation: Click delete to permanently remove this server.', 'التأكيد النهائي: انقر على حذف لإزالة هذا الخادم نهائياً.')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => { setDeleteConfirmStep(0); setServerToDelete(null); }}>
                              {t('Cancel', 'إلغاء')}
                            </AlertDialogCancel>
                            {deleteConfirmStep < 4 ? (
                              <Button variant="destructive" onClick={() => setDeleteConfirmStep(prev => prev + 1)}>
                                {t('Continue', 'متابعة')} ({deleteConfirmStep}/4)
                              </Button>
                            ) : (
                              <AlertDialogAction onClick={handleDeleteServer} className="bg-destructive text-destructive-foreground">
                                {t('Delete Permanently', 'حذف نهائياً')}
                              </AlertDialogAction>
                            )}
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Deploy */}
          <TabsContent value="deploy" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Deploy Settings */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    {t('Deploy Settings', 'إعدادات النشر')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>{t('Server Host', 'عنوان السيرفر')}</Label>
                      <Input
                        value={deploySettings.serverHost}
                        onChange={(e) => updateDeploySettings('serverHost', e.target.value)}
                        placeholder="91.96.168.125"
                        data-testid="input-deploy-server-host"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('SSH Port', 'منفذ SSH')}</Label>
                      <Input
                        value={deploySettings.sshPort}
                        onChange={(e) => updateDeploySettings('sshPort', e.target.value)}
                        placeholder="22"
                        data-testid="input-deploy-ssh-port"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('SSH User', 'مستخدم SSH')}</Label>
                      <Input
                        value={deploySettings.sshUser}
                        onChange={(e) => updateDeploySettings('sshUser', e.target.value)}
                        placeholder="root"
                        data-testid="input-deploy-ssh-user"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t('Repository Path', 'رابط المستودع')}</Label>
                      <div className="relative">
                        <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={deploySettings.repoPath}
                          onChange={(e) => updateDeploySettings('repoPath', e.target.value)}
                          placeholder="https://github.com/user/repo"
                          className="pl-9"
                          data-testid="input-deploy-repo-path"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('Deploy Path', 'مسار النشر')}</Label>
                      <div className="relative">
                        <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={deploySettings.deployPath}
                          onChange={(e) => updateDeploySettings('deployPath', e.target.value)}
                          placeholder="/var/www/app"
                          className="pl-9"
                          data-testid="input-deploy-path"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('Private Key (SSH)', 'المفتاح الخاص (SSH)')}</Label>
                    <Textarea
                      value={deploySettings.privateKey}
                      onChange={(e) => updateDeploySettings('privateKey', e.target.value)}
                      placeholder={t('Paste your SSH private key here...', 'الصق مفتاحك الخاص SSH هنا...')}
                      className="font-mono text-xs h-24"
                      data-testid="textarea-deploy-private-key"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {t('Private key is not stored and must be entered each session', 'لا يتم تخزين المفتاح الخاص ويجب إدخاله في كل جلسة')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('Post Deploy Command', 'أمر ما بعد النشر')}</Label>
                    <Input
                      value={deploySettings.postDeployCommand}
                      onChange={(e) => updateDeploySettings('postDeployCommand', e.target.value)}
                      placeholder="npm install && npm run build"
                      data-testid="input-deploy-post-command"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>{t('Restart Service', 'إعادة تشغيل الخدمة')}</Label>
                      <p className="text-sm text-muted-foreground">{t('Restart systemd service after deploy', 'إعادة تشغيل خدمة systemd بعد النشر')}</p>
                    </div>
                    <Switch
                      checked={deploySettings.restartService}
                      onCheckedChange={(v) => updateDeploySettings('restartService', v)}
                      data-testid="switch-restart-service"
                    />
                  </div>

                  {deploySettings.restartService && (
                    <div className="space-y-2">
                      <Label>{t('Service Name', 'اسم الخدمة')}</Label>
                      <Input
                        value={deploySettings.serviceName}
                        onChange={(e) => updateDeploySettings('serviceName', e.target.value)}
                        placeholder="myapp"
                        data-testid="input-deploy-service-name"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SSH Deploy Key */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    {t('SSH Deploy Key', 'مفتاح النشر SSH')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg font-mono text-xs break-all">
                    {deployKey || t('No deploy key generated', 'لم يتم إنشاء مفتاح النشر')}
                  </div>
                  <Button variant="outline" onClick={handleCopyDeployKey} disabled={!deployKey} className="w-full" data-testid="button-copy-deploy-key">
                    <Copy className="w-4 h-4 mr-2" />
                    {t('Copy Key', 'نسخ المفتاح')}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* 12 Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  {t('Deploy Actions', 'عمليات النشر')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  <Button onClick={() => executeDeployAction('Quick Deploy', '/api/hetzner/quick-deploy')} data-testid="button-quick-deploy">
                    <GitBranch className="w-4 h-4 mr-2" />
                    {t('Quick Deploy', 'نشر سريع')}
                  </Button>
                  <Button onClick={() => executeDeployAction('Direct Deploy', '/api/hetzner/direct-deploy')} data-testid="button-direct-deploy">
                    <Upload className="w-4 h-4 mr-2" />
                    {t('Direct Deploy', 'نشر مباشر')}
                  </Button>
                  <Button onClick={() => executeDeployAction('Git Deploy', '/api/hetzner/deploy')} data-testid="button-git-deploy">
                    <Rocket className="w-4 h-4 mr-2" />
                    {t('Git Deploy', 'نشر Git')}
                  </Button>
                  <Button variant="outline" onClick={() => executeDeployAction('Setup Server', '/api/hetzner/setup-server')} data-testid="button-setup-server">
                    <Terminal className="w-4 h-4 mr-2" />
                    {t('Setup Server', 'إعداد الخادم')}
                  </Button>
                  <Button variant="outline" onClick={() => executeDeployAction('Run Migrations', '/api/hetzner/run-migrations')} data-testid="button-run-migrations">
                    <Database className="w-4 h-4 mr-2" />
                    {t('Run Migrations', 'تشغيل الترحيل')}
                  </Button>
                  <Button variant="outline" onClick={() => executeDeployAction('Sync Env', '/api/hetzner/sync-env')} data-testid="button-sync-env">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t('Sync Env', 'مزامنة البيئة')}
                  </Button>
                  <Button variant="outline" onClick={() => executeDeployAction('Reset MFA', '/api/hetzner/reset-mfa')} data-testid="button-reset-mfa">
                    <Shield className="w-4 h-4 mr-2" />
                    {t('Reset MFA', 'إعادة تعيين MFA')}
                  </Button>
                  <Button variant="outline" onClick={() => executeDeployAction('Restart App', '/api/hetzner/restart-app')} data-testid="button-restart-app">
                    <RotateCw className="w-4 h-4 mr-2" />
                    {t('Restart App', 'إعادة تشغيل التطبيق')}
                  </Button>
                  <Button variant="secondary" onClick={() => executeDeployAction('Health Check', '/api/hetzner/health-check', 'GET')} data-testid="button-health-check">
                    <Heart className="w-4 h-4 mr-2" />
                    {t('Health Check', 'فحص الصحة')}
                  </Button>
                  <Button variant="secondary" onClick={() => executeDeployAction('Backup DB', '/api/hetzner/backup-db')} data-testid="button-backup-db">
                    <Archive className="w-4 h-4 mr-2" />
                    {t('Backup DB', 'نسخ احتياطي للقاعدة')}
                  </Button>
                  <Button variant="secondary" onClick={() => executeDeployAction('Clear Cache', '/api/hetzner/clear-cache')} data-testid="button-clear-cache">
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('Clear Cache', 'مسح الذاكرة المؤقتة')}
                  </Button>
                  <Button variant="secondary" onClick={() => executeDeployAction('System Usage', '/api/hetzner/system-usage', 'GET')} data-testid="button-system-usage">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t('System Usage', 'استخدام النظام')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Deploy History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t('Deploy History', 'سجل النشر')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('Action', 'العملية')}</TableHead>
                        <TableHead>{t('Status', 'الحالة')}</TableHead>
                        <TableHead>{t('Date', 'التاريخ')}</TableHead>
                        <TableHead>{t('Duration', 'المدة')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deployHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            {t('No deploy history', 'لا يوجد سجل نشر')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        deployHistory.map(entry => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.action}</TableCell>
                            <TableCell>
                              <Badge variant={entry.status === 'success' ? 'default' : entry.status === 'failed' ? 'destructive' : 'secondary'}>
                                {entry.status === 'in_progress' && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                                {entry.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{entry.date.toLocaleString()}</TableCell>
                            <TableCell>{entry.duration ? formatDuration(entry.duration) : '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Monitoring */}
          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Budget Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {t('Budget Overview', 'نظرة عامة على الميزانية')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('Used', 'المستخدم')}</span>
                      <span>{budgetUsed.toFixed(2)} / {config.budgetLimit} EUR</span>
                    </div>
                    <Progress value={(budgetUsed / config.budgetLimit) * 100} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('Estimated (SAR)', 'التقدير (ريال)')}</span>
                    <span>{(budgetUsed * 4.1).toFixed(2)} SAR</span>
                  </div>
                </CardContent>
              </Card>

              {/* Server Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {t('Server Metrics', 'مقاييس الخادم')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2"><Cpu className="w-4 h-4" /> CPU</span>
                      <span>{metrics.cpu}%</span>
                    </div>
                    <Progress value={metrics.cpu} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2"><MemoryStick className="w-4 h-4" /> {t('Memory', 'الذاكرة')}</span>
                      <span>{metrics.memory}%</span>
                    </div>
                    <Progress value={metrics.memory} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2"><HardDrive className="w-4 h-4" /> {t('Disk', 'التخزين')}</span>
                      <span>{metrics.disk}%</span>
                    </div>
                    <Progress value={metrics.disk} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>{t('Cost Breakdown', 'تفصيل التكاليف')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Resource', 'المورد')}</TableHead>
                      <TableHead>{t('Type', 'النوع')}</TableHead>
                      <TableHead className="text-right">{t('Cost (EUR)', 'التكلفة (يورو)')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servers.map(server => (
                      <TableRow key={server.id}>
                        <TableCell>{server.name}</TableCell>
                        <TableCell>{server.serverType}</TableCell>
                        <TableCell className="text-right">{server.priceMonthly.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {servers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          {t('No servers to display', 'لا توجد خوادم للعرض')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Server Types */}
          <TabsContent value="types" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'CX11', vcpus: 1, memory: 2, disk: 20, price: 3.29 },
                { name: 'CX21', vcpus: 2, memory: 4, disk: 40, price: 5.83 },
                { name: 'CX31', vcpus: 2, memory: 8, disk: 80, price: 10.59 },
                { name: 'CX41', vcpus: 4, memory: 16, disk: 160, price: 18.92 },
                { name: 'CX51', vcpus: 8, memory: 32, disk: 240, price: 35.58 },
                { name: 'CCX11', vcpus: 2, memory: 8, disk: 80, price: 12.99 },
                { name: 'CCX21', vcpus: 4, memory: 16, disk: 160, price: 24.99 },
                { name: 'CCX31', vcpus: 8, memory: 32, disk: 240, price: 47.99 },
                { name: 'CCX41', vcpus: 16, memory: 64, disk: 360, price: 94.99 },
              ].map(type => (
                <Card key={type.name} className="hover-elevate">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2"><Cpu className="w-4 h-4" /> vCPUs</span>
                      <span>{type.vcpus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2"><MemoryStick className="w-4 h-4" /> {t('Memory', 'الذاكرة')}</span>
                      <span>{type.memory} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-2"><HardDrive className="w-4 h-4" /> {t('Disk', 'التخزين')}</span>
                      <span>{type.disk} GB</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>{t('Price', 'السعر')}</span>
                      <span>{type.price.toFixed(2)} EUR/mo</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab 6: Actions */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {t('Recent Actions', 'العمليات الأخيرة')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {actions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('No actions recorded yet', 'لم يتم تسجيل أي عمليات بعد')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {actions.map(action => (
                        <div key={action.id} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="flex-shrink-0">
                            {action.status === 'running' && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                            {action.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                            {action.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{action.action}</p>
                            <p className="text-sm text-muted-foreground">
                              {action.startedAt.toLocaleString()}
                            </p>
                          </div>
                          {action.status === 'running' && (
                            <div className="w-24">
                              <Progress value={action.progress} />
                            </div>
                          )}
                          <Badge variant={action.status === 'success' ? 'default' : action.status === 'error' ? 'destructive' : 'secondary'}>
                            {action.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
