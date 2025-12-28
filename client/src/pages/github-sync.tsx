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
  GitCommit
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GitHubStatus {
  connected: boolean;
  username?: string;
  avatar?: string;
  name?: string;
  error?: string;
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

interface SyncHistory {
  id: string;
  settingsId: string;
  owner: string;
  repo: string;
  branch: string;
  syncType: string;
  status: string;
  totalSize: number | null;
  filesChanged: number | null;
  commitHash: string | null;
  commitMessage: string | null;
  commitAuthor: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  errorMessage: string | null;
}

export default function GitHubSync() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const { toast } = useToast();
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: status, isLoading: statusLoading } = useQuery<{ success: boolean } & GitHubStatus>({
    queryKey: ["/api/github/status"],
  });

  const { data: reposData, isLoading: reposLoading } = useQuery<{ success: boolean; repos: GitHubRepo[] }>({
    queryKey: ["/api/github/repos"],
    enabled: status?.connected === true,
  });

  const { data: settingsData, isLoading: settingsLoading, refetch: refetchSettings } = useQuery<{ success: boolean; settings: SyncSettings | null }>({
    queryKey: ["/api/github/sync-settings"],
    refetchInterval: 30000,
  });

  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery<{ success: boolean; history: SyncHistory[] }>({
    queryKey: ["/api/github/sync-history"],
    refetchInterval: 10000,
  });

  const saveSyncSettings = useMutation({
    mutationFn: async (data: { owner: string; repo: string; branch?: string; autoSync?: boolean }) => {
      return apiRequest("POST", "/api/github/sync-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/sync-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/github/sync-history"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/github/sync-history"] });
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

  const handleSyncNow = () => {
    if (settings) {
      setIsSyncing(true);
      triggerSync.mutate(settings.id);
    }
  };

  const t = {
    ar: {
      title: "مزامنة GitHub",
      subtitle: "إدارة اتصال GitHub ومزامنة المشاريع",
      connectionStatus: "حالة الاتصال",
      connected: "متصل",
      notConnected: "غير متصل",
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
      syncHistory: "سجل المزامنة",
      noHistory: "لا يوجد سجل مزامنة بعد",
      success: "نجح",
      failed: "فشل",
      running: "جاري",
      manual: "يدوي",
      automatic: "تلقائي",
      push: "دفع",
      pull: "سحب",
      files: "ملفات",
      private: "خاص",
      public: "عام",
      configure: "تفعيل",
      configured: "مُفعّل",
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
    },
    en: {
      title: "GitHub Sync",
      subtitle: "Manage GitHub connection and project synchronization",
      connectionStatus: "Connection Status",
      connected: "Connected",
      notConnected: "Not Connected",
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
      syncHistory: "Sync History",
      noHistory: "No sync history yet",
      success: "Success",
      failed: "Failed",
      running: "Running",
      manual: "Manual",
      automatic: "Automatic",
      push: "Push",
      pull: "Pull",
      files: "files",
      private: "Private",
      public: "Public",
      configure: "Enable",
      configured: "Enabled",
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
    },
  };

  const txt = t[language];
  const repos = reposData?.repos || [];
  const settings = settingsData?.settings;
  const history = historyData?.history || [];

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
          <SiGithub className="h-8 w-8" />
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
              refetchHistory();
            }}
            data-testid="button-refresh-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span className={isRtl ? "mr-1" : "ml-1"}>{txt.refresh}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card data-testid="card-connection-status">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  {txt.connectionStatus}
                </CardTitle>
              </div>
              {statusLoading ? (
                <Skeleton className="h-6 w-24" />
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
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : status?.connected ? (
                <div className="flex items-center gap-3">
                  {status.avatar && (
                    <img 
                      src={status.avatar} 
                      alt={status.username || ""} 
                      className="h-10 w-10 rounded-full border"
                      data-testid="img-github-avatar"
                    />
                  )}
                  <div>
                    <p className="font-medium" data-testid="text-github-username">
                      {txt.connectedAs}: <span className="text-primary">@{status.username}</span>
                    </p>
                    {status.name && <p className="text-sm text-muted-foreground">{status.name}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">{txt.connectFirst}</p>
              )}
            </CardContent>
          </Card>

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
                <p className="text-muted-foreground text-center py-4">{txt.connectFirst}</p>
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
                <ScrollArea className="h-[300px]">
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
                            {isConfigured && (
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
                            )}
                            {!isConfigured && (
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

        <div className="space-y-6">
          <Card data-testid="card-sync-settings">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {txt.syncSettings}
              </CardTitle>
              {settings && (
                <CardDescription>
                  {settings.owner}/{settings.repo} ({txt.branch}: {settings.branch})
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
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

          <Card data-testid="card-sync-history">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                {txt.syncHistory}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetchHistory()}
                data-testid="button-refresh-history"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{txt.noHistory}</p>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {history.slice(0, 20).map((entry) => (
                      <div 
                        key={entry.id} 
                        className="p-3 border rounded-md"
                        data-testid={`history-item-${entry.id}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {getStatusBadge(entry.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.startedAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {entry.syncType === "push" ? txt.push : entry.syncType === "pull" ? txt.pull : entry.syncType}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {entry.repo}
                          </span>
                        </div>
                        
                        {entry.commitMessage && (
                          <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                            <GitCommit className="h-3 w-3 mt-0.5 shrink-0" />
                            <span className="truncate">{entry.commitMessage}</span>
                          </div>
                        )}
                        
                        {entry.filesChanged !== null && entry.filesChanged > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {entry.filesChanged} {txt.files}
                            {entry.durationMs && ` • ${formatDuration(entry.durationMs)}`}
                          </div>
                        )}
                        
                        {entry.errorMessage && (
                          <p className="text-xs text-destructive mt-2 truncate">{entry.errorMessage}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
