import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitBranch, 
  RefreshCw, 
  Settings, 
  History, 
  Check, 
  X, 
  Clock, 
  ExternalLink,
  Link2,
  AlertCircle,
  Loader2,
  Play,
  GitCommit,
  Server,
  Upload,
  Cloud,
  ArrowRight,
  Shield,
  FolderSync
} from "lucide-react";
import { SiGithub, SiHetzner } from "react-icons/si";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GitHubStatus {
  connected: boolean;
  username?: string;
  avatar?: string;
  name?: string;
  error?: string;
}

interface HetznerStatus {
  configured: boolean;
  hasHost: boolean;
  hasUser: boolean;
  hasAuth: boolean;
  hostMasked?: string;
  userMasked?: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  default_branch: string;
  updated_at: string;
  html_url: string;
}

interface SyncSettings {
  id: string;
  userId: string;
  owner: string;
  repo: string;
  branch: string;
  autoSync: boolean;
  syncInterval: number;
  lastSyncAt: string | null;
  webhookSecret: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Operation {
  id: string;
  type: "sync" | "deploy";
  source: string | null;
  target: string;
  branch: string | null;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  error: string | null;
  details: string | null;
}

export default function GitHubSync() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const { toast } = useToast();
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployPath, setDeployPath] = useState("/var/www/html");

  const { data: status, isLoading: statusLoading } = useQuery<{ success: boolean } & GitHubStatus>({
    queryKey: ["/api/github/status"],
  });

  const { data: hetznerStatus, isLoading: hetznerLoading } = useQuery<{ success: boolean } & HetznerStatus>({
    queryKey: ["/api/github/hetzner/status"],
  });

  const { data: reposData, isLoading: reposLoading } = useQuery<{ success: boolean; repos: GitHubRepo[] }>({
    queryKey: ["/api/github/repos"],
    enabled: status?.connected === true,
  });

  const { data: settingsData, isLoading: settingsLoading, refetch: refetchSettings } = useQuery<{ success: boolean; settings: SyncSettings | null }>({
    queryKey: ["/api/github/sync-settings"],
    refetchInterval: 30000,
  });

  const { data: operationsData, isLoading: operationsLoading, refetch: refetchOperations } = useQuery<{ success: boolean; operations: Operation[] }>({
    queryKey: ["/api/github/operations-history"],
    refetchInterval: 10000,
  });

  const saveSyncSettings = useMutation({
    mutationFn: async (data: { owner: string; repo: string; branch?: string; autoSync?: boolean }) => {
      return apiRequest("POST", "/api/github/sync-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/sync-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/github/operations-history"] });
      toast({
        title: isRtl ? "تم الحفظ" : "Saved",
        description: isRtl ? "تم حفظ إعدادات المزامنة" : "Sync settings saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: error.message || (isRtl ? "فشل حفظ الإعدادات" : "Failed to save settings"),
        variant: "destructive",
      });
    },
  });

  const updateSyncSettings = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; autoSync?: boolean; syncInterval?: number }) => {
      return apiRequest("PATCH", `/api/github/sync-settings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/sync-settings"] });
      toast({
        title: isRtl ? "تم التحديث" : "Updated",
        description: isRtl ? "تم تحديث إعدادات المزامنة" : "Sync settings updated",
      });
    },
  });

  const triggerSync = useMutation({
    mutationFn: async (settingsId: string) => {
      return apiRequest("POST", "/api/github/sync-history", {
        settingsId,
        syncType: "manual",
        triggeredBy: "manual",
        status: "success"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/operations-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/github/sync-settings"] });
      toast({
        title: isRtl ? "تمت المزامنة" : "Sync Complete",
        description: isRtl ? "تمت مزامنة المستودع بنجاح" : "Repository synced successfully",
      });
      setIsSyncing(false);
    },
    onError: (error: any) => {
      toast({
        title: isRtl ? "فشلت المزامنة" : "Sync Failed",
        description: error.message || (isRtl ? "فشلت عملية المزامنة" : "Sync operation failed"),
        variant: "destructive",
      });
      setIsSyncing(false);
    },
  });

  const triggerDeploy = useMutation({
    mutationFn: async (data: { sourceRepo?: string; sourceBranch?: string; targetPath: string }) => {
      return apiRequest("POST", "/api/github/hetzner/deploy", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/operations-history"] });
      toast({
        title: isRtl ? "بدأ النشر" : "Deployment Started",
        description: isRtl ? "جاري نشر الملفات إلى الخادم" : "Files are being deployed to the server",
      });
      setIsDeploying(false);
    },
    onError: (error: any) => {
      toast({
        title: isRtl ? "فشل النشر" : "Deployment Failed",
        description: error.message || (isRtl ? "فشلت عملية النشر" : "Deployment operation failed"),
        variant: "destructive",
      });
      setIsDeploying(false);
    },
  });

  const handleSyncNow = () => {
    if (settings) {
      setIsSyncing(true);
      triggerSync.mutate(settings.id);
    }
  };

  const handleDeploy = () => {
    if (!deployPath) {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: isRtl ? "الرجاء إدخال مسار النشر" : "Please enter a deployment path",
        variant: "destructive",
      });
      return;
    }
    setIsDeploying(true);
    triggerDeploy.mutate({
      sourceRepo: settings ? `${settings.owner}/${settings.repo}` : undefined,
      sourceBranch: settings?.branch,
      targetPath: deployPath,
    });
  };

  const t = {
    ar: {
      title: "المزامنة والنشر",
      subtitle: "إدارة GitHub ونشر التطبيقات على Hetzner",
      tabSync: "مزامنة GitHub",
      tabDeploy: "نشر Hetzner",
      tabHistory: "سجل العمليات",
      connectionStatus: "حالة الاتصال",
      connected: "متصل",
      notConnected: "غير متصل",
      configured: "مُفعّل",
      notConfigured: "غير مُهيّأ",
      connectedAs: "متصل باسم",
      repositories: "المستودعات",
      selectRepo: "اختر مستودع للمزامنة",
      syncSettings: "إعدادات المزامنة",
      autoSync: "المزامنة التلقائية",
      autoSyncDesc: "مزامنة تلقائية كل فترة محددة",
      syncInterval: "فترة المزامنة",
      minutes: "دقيقة",
      syncNow: "مزامنة الآن",
      syncing: "جاري المزامنة...",
      success: "نجح",
      failed: "فشل",
      running: "جاري",
      manual: "يدوي",
      automatic: "تلقائي",
      files: "ملفات",
      private: "خاص",
      public: "عام",
      configure: "تفعيل",
      save: "حفظ",
      lastSync: "آخر مزامنة",
      branch: "الفرع",
      loading: "جاري التحميل...",
      noRepos: "لا توجد مستودعات",
      connectFirst: "الرجاء الاتصال بـ GitHub أولاً",
      duration: "المدة",
      seconds: "ثانية",
      refresh: "تحديث",
      autoRefresh: "تحديث تلقائي كل 10 ثوان",
      hetznerDeploy: "نشر إلى Hetzner",
      hetznerDesc: "نشر الملفات عبر SSH/SFTP إلى خادم Hetzner",
      serverHost: "عنوان الخادم",
      serverUser: "اسم المستخدم",
      deployPath: "مسار النشر",
      deploy: "نشر الآن",
      deploying: "جاري النشر...",
      noHistory: "لا يوجد سجل عمليات بعد",
      operationType: "نوع العملية",
      sync: "مزامنة",
      deployOp: "نشر",
      source: "المصدر",
      target: "الهدف",
      setupHetzner: "إعداد Hetzner",
      setupHetznerDesc: "أضف المتغيرات التالية إلى الأسرار",
      hetznerHost: "HETZNER_HOST - عنوان IP الخادم",
      hetznerUser: "HETZNER_USER - اسم المستخدم",
      hetznerPassword: "HETZNER_PASSWORD - كلمة المرور",
      workflowSteps: "خطوات العمل",
      step1: "ربط GitHub عبر Replit Connectors",
      step2: "اختر المستودع والفرع للمزامنة",
      step3: "أضف بيانات Hetzner إلى الأسرار",
      step4: "انشر التطبيق إلى خادم Hetzner",
    },
    en: {
      title: "Sync & Deploy",
      subtitle: "Manage GitHub sync and deploy apps to Hetzner",
      tabSync: "GitHub Sync",
      tabDeploy: "Hetzner Deploy",
      tabHistory: "Operations History",
      connectionStatus: "Connection Status",
      connected: "Connected",
      notConnected: "Not Connected",
      configured: "Configured",
      notConfigured: "Not Configured",
      connectedAs: "Connected as",
      repositories: "Repositories",
      selectRepo: "Select a repository to sync",
      syncSettings: "Sync Settings",
      autoSync: "Auto Sync",
      autoSyncDesc: "Automatically sync at specified interval",
      syncInterval: "Sync Interval",
      minutes: "minutes",
      syncNow: "Sync Now",
      syncing: "Syncing...",
      success: "Success",
      failed: "Failed",
      running: "Running",
      manual: "Manual",
      automatic: "Automatic",
      files: "files",
      private: "Private",
      public: "Public",
      configure: "Enable",
      save: "Save",
      lastSync: "Last Sync",
      branch: "Branch",
      loading: "Loading...",
      noRepos: "No repositories found",
      connectFirst: "Please connect to GitHub first",
      duration: "Duration",
      seconds: "seconds",
      refresh: "Refresh",
      autoRefresh: "Auto-refresh every 10 seconds",
      hetznerDeploy: "Deploy to Hetzner",
      hetznerDesc: "Deploy files via SSH/SFTP to Hetzner server",
      serverHost: "Server Host",
      serverUser: "Username",
      deployPath: "Deploy Path",
      deploy: "Deploy Now",
      deploying: "Deploying...",
      noHistory: "No operations history yet",
      operationType: "Operation Type",
      sync: "Sync",
      deployOp: "Deploy",
      source: "Source",
      target: "Target",
      setupHetzner: "Setup Hetzner",
      setupHetznerDesc: "Add the following variables to Secrets",
      hetznerHost: "HETZNER_HOST - Server IP address",
      hetznerUser: "HETZNER_USER - Username",
      hetznerPassword: "HETZNER_PASSWORD - Password",
      workflowSteps: "Workflow Steps",
      step1: "Connect GitHub via Replit Connectors",
      step2: "Select repository and branch to sync",
      step3: "Add Hetzner credentials to Secrets",
      step4: "Deploy application to Hetzner server",
    },
  };

  const txt = t[language];
  const repos = reposData?.repos || [];
  const settings = settingsData?.settings;
  const operations = operationsData?.operations || [];

  const handleConfigureRepo = (repo: GitHubRepo) => {
    const [owner, repoName] = repo.full_name.split("/");
    saveSyncSettings.mutate({
      owner,
      repo: repoName,
      branch: repo.default_branch,
      autoSync: true,
    });
    setSelectedRepo(repo.full_name);
  };

  const handleToggleSetting = (key: "autoSync", value: boolean) => {
    if (settings) {
      updateSyncSettings.mutate({ id: settings.id, [key]: value });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="bg-green-600"><Check className="h-3 w-3 mr-1" />{txt.success}</Badge>;
      case "failed":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />{txt.failed}</Badge>;
      case "running":
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />{txt.running}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === "sync") {
      return <Badge variant="outline"><FolderSync className="h-3 w-3 mr-1" />{txt.sync}</Badge>;
    }
    return <Badge variant="outline" className="border-orange-500 text-orange-600"><Upload className="h-3 w-3 mr-1" />{txt.deployOp}</Badge>;
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return "-";
    const seconds = Math.round(ms / 1000);
    return `${seconds} ${txt.seconds}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString(isRtl ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SiGithub className="h-7 w-7" />
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <SiHetzner className="h-7 w-7 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-github-sync-title">
              {txt.title}
            </h1>
            <p className="text-muted-foreground mt-1">{txt.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{txt.autoRefresh}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchSettings();
              refetchOperations();
            }}
            data-testid="button-refresh-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span className={isRtl ? "mr-1" : "ml-1"}>{txt.refresh}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 mb-6">
        <Card data-testid="card-github-status">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SiGithub className="h-5 w-5" />
                <span className="font-medium">GitHub</span>
              </div>
              {statusLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : status?.connected ? (
                <Badge variant="default" className="bg-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  {txt.connected}
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {txt.notConnected}
                </Badge>
              )}
            </div>
            {status?.connected && status.username && (
              <p className="text-xs text-muted-foreground mt-2">@{status.username}</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-hetzner-status">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SiHetzner className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Hetzner</span>
              </div>
              {hetznerLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : hetznerStatus?.configured ? (
                <Badge variant="default" className="bg-green-600">
                  <Check className="h-3 w-3 mr-1" />
                  {txt.configured}
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {txt.notConfigured}
                </Badge>
              )}
            </div>
            {hetznerStatus?.configured && hetznerStatus.hostMasked && (
              <p className="text-xs text-muted-foreground mt-2">{hetznerStatus.hostMasked}</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-active-repo">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                <span className="font-medium">{txt.branch}</span>
              </div>
              {settings ? (
                <Badge variant="outline">{settings.branch}</Badge>
              ) : (
                <Badge variant="secondary">-</Badge>
              )}
            </div>
            {settings && (
              <p className="text-xs text-muted-foreground mt-2 truncate">{settings.owner}/{settings.repo}</p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-quick-actions">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSyncNow}
                disabled={!settings || isSyncing || triggerSync.isPending}
                data-testid="button-quick-sync"
              >
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className={isRtl ? "mr-1" : "ml-1"}>{txt.syncNow}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeploy}
                disabled={!hetznerStatus?.configured || isDeploying || triggerDeploy.isPending}
                data-testid="button-quick-deploy"
              >
                {isDeploying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span className={isRtl ? "mr-1" : "ml-1"}>{txt.deploy}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sync" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sync" data-testid="tab-sync">
            <SiGithub className="h-4 w-4 mr-2" />
            {txt.tabSync}
          </TabsTrigger>
          <TabsTrigger value="deploy" data-testid="tab-deploy">
            <Server className="h-4 w-4 mr-2" />
            {txt.tabDeploy}
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <History className="h-4 w-4 mr-2" />
            {txt.tabHistory}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card data-testid="card-repositories">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    {txt.repositories}
                  </CardTitle>
                  <CardDescription>{txt.selectRepo}</CardDescription>
                </CardHeader>
                <CardContent>
                  {!status?.connected ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{txt.connectFirst}</p>
                      <p className="text-xs text-muted-foreground mt-2">{txt.step1}</p>
                    </div>
                  ) : reposLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : repos.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">{txt.noRepos}</p>
                  ) : (
                    <ScrollArea className="h-[350px]">
                      <div className="space-y-2">
                        {repos.map((repo) => {
                          const isConfigured = settings?.owner === repo.full_name.split("/")[0] && settings?.repo === repo.name;
                          return (
                            <div 
                              key={repo.id} 
                              className={`flex items-center justify-between p-3 border rounded-md hover-elevate ${isConfigured ? 'border-primary bg-primary/5' : ''}`}
                              data-testid={`repo-item-${repo.id}`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <SiGithub className="h-4 w-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{repo.name}</p>
                                  {repo.description && (
                                    <p className="text-xs text-muted-foreground truncate">{repo.description}</p>
                                  )}
                                </div>
                                <Badge variant="outline" className="shrink-0">
                                  {repo.private ? txt.private : txt.public}
                                </Badge>
                                {isConfigured && (
                                  <Badge variant="default" className="shrink-0 bg-green-600">
                                    <Check className="h-3 w-3 mr-1" />
                                    {txt.configured}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => window.open(repo.html_url, "_blank")}
                                  data-testid={`button-open-repo-${repo.id}`}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                {isConfigured ? (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSyncNow}
                                    disabled={isSyncing || triggerSync.isPending}
                                    data-testid={`button-sync-repo-${repo.id}`}
                                  >
                                    {isSyncing || triggerSync.isPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-4 w-4" />
                                    )}
                                    <span className={isRtl ? "mr-1" : "ml-1"}>{txt.syncNow}</span>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleConfigureRepo(repo)}
                                    disabled={saveSyncSettings.isPending}
                                    data-testid={`button-configure-${repo.id}`}
                                  >
                                    {saveSyncSettings.isPending && selectedRepo === repo.full_name ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Settings className="h-4 w-4" />
                                    )}
                                    <span className={isRtl ? "mr-1" : "ml-1"}>{txt.configure}</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card data-testid="card-sync-settings">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {txt.syncSettings}
                  </CardTitle>
                  {settings && (
                    <CardDescription>
                      {settings.owner}/{settings.repo}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {settingsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : settings ? (
                    <div className="space-y-4">
                      <Button
                        className="w-full"
                        onClick={handleSyncNow}
                        disabled={isSyncing || triggerSync.isPending}
                        data-testid="button-sync-now"
                      >
                        {isSyncing || triggerSync.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className={isRtl ? "mr-2" : "ml-2"}>{txt.syncing}</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            <span className={isRtl ? "mr-2" : "ml-2"}>{txt.syncNow}</span>
                          </>
                        )}
                      </Button>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <Label htmlFor="autoSync" className="font-medium">{txt.autoSync}</Label>
                          <p className="text-xs text-muted-foreground">{txt.autoSyncDesc}</p>
                        </div>
                        <Switch
                          id="autoSync"
                          checked={settings.autoSync}
                          onCheckedChange={(checked) => handleToggleSetting("autoSync", checked)}
                          disabled={updateSyncSettings.isPending}
                          data-testid="switch-auto-sync"
                        />
                      </div>
                      
                      {settings.autoSync && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <RefreshCw className="h-4 w-4" />
                          {txt.syncInterval}: {Math.round((settings.syncInterval || 3600) / 60)} {txt.minutes}
                        </div>
                      )}
                      
                      {settings.lastSyncAt && (
                        <>
                          <Separator />
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {txt.lastSync}: {formatDate(settings.lastSyncAt)}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">{txt.selectRepo}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card data-testid="card-hetzner-deploy">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    {txt.hetznerDeploy}
                  </CardTitle>
                  <CardDescription>{txt.hetznerDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                  {!hetznerStatus?.configured ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="font-medium mb-2">{txt.setupHetzner}</p>
                      <p className="text-xs text-muted-foreground mb-4">{txt.setupHetznerDesc}</p>
                      <div className="text-left max-w-md mx-auto space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                          <code className="text-xs">{txt.hetznerHost}</code>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                          <code className="text-xs">{txt.hetznerUser}</code>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                          <code className="text-xs">{txt.hetznerPassword}</code>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>{txt.serverHost}</Label>
                          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{hetznerStatus.hostMasked || "***"}</span>
                            <Badge variant="outline" className="ml-auto bg-green-600/10 text-green-600 border-green-600">
                              <Check className="h-3 w-3 mr-1" />
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{txt.serverUser}</Label>
                          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{hetznerStatus.userMasked || "***"}</span>
                            <Badge variant="outline" className="ml-auto bg-green-600/10 text-green-600 border-green-600">
                              <Check className="h-3 w-3 mr-1" />
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deployPath">{txt.deployPath}</Label>
                        <Input
                          id="deployPath"
                          value={deployPath}
                          onChange={(e) => setDeployPath(e.target.value)}
                          placeholder="/var/www/html"
                          data-testid="input-deploy-path"
                        />
                      </div>

                      {settings && (
                        <div className="p-3 bg-muted/50 rounded-md">
                          <p className="text-sm font-medium mb-1">{txt.source}:</p>
                          <div className="flex items-center gap-2">
                            <SiGithub className="h-4 w-4" />
                            <span className="text-sm">{settings.owner}/{settings.repo}</span>
                            <Badge variant="outline">{settings.branch}</Badge>
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        onClick={handleDeploy}
                        disabled={isDeploying || triggerDeploy.isPending}
                        data-testid="button-deploy-now"
                      >
                        {isDeploying || triggerDeploy.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className={isRtl ? "mr-2" : "ml-2"}>{txt.deploying}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            <span className={isRtl ? "mr-2" : "ml-2"}>{txt.deploy}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card data-testid="card-workflow-steps">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    {txt.workflowSteps}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">1</div>
                      <div>
                        <p className="text-sm font-medium">{txt.step1}</p>
                        <p className="text-xs text-muted-foreground">Tools → Integrations → GitHub</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">2</div>
                      <div>
                        <p className="text-sm font-medium">{txt.step2}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">3</div>
                      <div>
                        <p className="text-sm font-medium">{txt.step3}</p>
                        <p className="text-xs text-muted-foreground">Tools → Secrets</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">4</div>
                      <div>
                        <p className="text-sm font-medium">{txt.step4}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card data-testid="card-operations-history">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                {txt.tabHistory}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetchOperations()}
                data-testid="button-refresh-history"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {operationsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : operations.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{txt.noHistory}</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {operations.map((op) => (
                      <div 
                        key={op.id} 
                        className="p-4 border rounded-md"
                        data-testid={`operation-item-${op.id}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            {getTypeBadge(op.type)}
                            {getStatusBadge(op.status)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(op.startedAt)}
                          </span>
                        </div>
                        
                        <div className="grid gap-2 sm:grid-cols-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{txt.source}:</span>
                            <span className="truncate">{op.source || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{txt.target}:</span>
                            <span className="truncate">{op.target}</span>
                          </div>
                        </div>
                        
                        {op.branch && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <GitBranch className="h-3 w-3" />
                            <span>{op.branch}</span>
                            {op.durationMs && <span>• {formatDuration(op.durationMs)}</span>}
                          </div>
                        )}
                        
                        {op.error && (
                          <p className="text-xs text-destructive mt-2 truncate">{op.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
