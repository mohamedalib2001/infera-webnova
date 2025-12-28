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
  Loader2
} from "lucide-react";
import { SiGithub } from "react-icons/si";
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
  syncOnPush: boolean;
  webhookEnabled: boolean;
  lastSyncAt: string | null;
  createdAt: string;
}

interface SyncHistory {
  id: string;
  settingsId: string;
  syncType: string;
  triggeredBy: string;
  status: string;
  filesChanged: number | null;
  commitSha: string | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
}

export default function GitHubSync() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const { toast } = useToast();
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  const { data: status, isLoading: statusLoading } = useQuery<{ success: boolean } & GitHubStatus>({
    queryKey: ["/api/github/status"],
  });

  const { data: reposData, isLoading: reposLoading } = useQuery<{ success: boolean; repos: GitHubRepo[] }>({
    queryKey: ["/api/github/repos"],
    enabled: status?.connected === true,
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery<{ success: boolean; settings: SyncSettings | null }>({
    queryKey: ["/api/github/sync-settings"],
  });

  const { data: historyData, isLoading: historyLoading } = useQuery<{ success: boolean; history: SyncHistory[] }>({
    queryKey: ["/api/github/sync-history"],
  });

  const saveSyncSettings = useMutation({
    mutationFn: async (data: { owner: string; repo: string; branch?: string; autoSync?: boolean; syncOnPush?: boolean; webhookEnabled?: boolean }) => {
      return apiRequest("/api/github/sync-settings", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/sync-settings"] });
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
    mutationFn: async ({ id, ...data }: { id: string; autoSync?: boolean; syncOnPush?: boolean; webhookEnabled?: boolean }) => {
      return apiRequest(`/api/github/sync-settings/${id}`, { method: "PATCH", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/sync-settings"] });
      toast({
        title: isRtl ? "تم التحديث" : "Updated",
        description: isRtl ? "تم تحديث إعدادات المزامنة" : "Sync settings updated",
      });
    },
  });

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
      autoSyncDesc: "مزامنة تلقائية عند حفظ المشروع",
      syncOnPush: "المزامنة عند الدفع",
      syncOnPushDesc: "المزامنة عند دفع التغييرات إلى GitHub",
      webhookEnabled: "تفعيل Webhook",
      webhookEnabledDesc: "استقبال إشعارات من GitHub",
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
      configure: "تكوين",
      save: "حفظ",
      lastSync: "آخر مزامنة",
      branch: "الفرع",
      loading: "جاري التحميل...",
      noRepos: "لا توجد مستودعات",
      connectFirst: "الرجاء الاتصال بـ GitHub أولاً",
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
      autoSyncDesc: "Automatically sync when project is saved",
      syncOnPush: "Sync on Push",
      syncOnPushDesc: "Sync when changes are pushed to GitHub",
      webhookEnabled: "Webhook Enabled",
      webhookEnabledDesc: "Receive notifications from GitHub",
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
      configure: "Configure",
      save: "Save",
      lastSync: "Last Sync",
      branch: "Branch",
      loading: "Loading...",
      noRepos: "No repositories found",
      connectFirst: "Please connect to GitHub first",
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
      autoSync: false,
      syncOnPush: false,
      webhookEnabled: false,
    });
    setSelectedRepo(repo.full_name);
  };

  const handleToggleSetting = (key: "autoSync" | "syncOnPush" | "webhookEnabled", value: boolean) => {
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

  return (
    <div className="p-6 max-w-6xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-8">
        <SiGithub className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-github-sync-title">
            {txt.title}
          </h1>
          <p className="text-muted-foreground mt-1">{txt.subtitle}</p>
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
                    {repos.map((repo) => (
                      <div 
                        key={repo.id} 
                        className="flex items-center justify-between p-3 border rounded-md hover-elevate"
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
                          <Button
                            variant={settings?.repo === repo.name ? "default" : "outline"}
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
                        </div>
                      </div>
                    ))}
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
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label htmlFor="syncOnPush" className="font-medium">{txt.syncOnPush}</Label>
                      <p className="text-xs text-muted-foreground">{txt.syncOnPushDesc}</p>
                    </div>
                    <Switch
                      id="syncOnPush"
                      checked={settings.syncOnPush}
                      onCheckedChange={(checked) => handleToggleSetting("syncOnPush", checked)}
                      disabled={updateSyncSettings.isPending}
                      data-testid="switch-sync-on-push"
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label htmlFor="webhookEnabled" className="font-medium">{txt.webhookEnabled}</Label>
                      <p className="text-xs text-muted-foreground">{txt.webhookEnabledDesc}</p>
                    </div>
                    <Switch
                      id="webhookEnabled"
                      checked={settings.webhookEnabled}
                      onCheckedChange={(checked) => handleToggleSetting("webhookEnabled", checked)}
                      disabled={updateSyncSettings.isPending}
                      data-testid="switch-webhook-enabled"
                    />
                  </div>
                  {settings.lastSyncAt && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {txt.lastSync}: {new Date(settings.lastSyncAt).toLocaleString(isRtl ? "ar" : "en")}
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
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                {txt.syncHistory}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{txt.noHistory}</p>
              ) : (
                <ScrollArea className="h-[250px]">
                  <div className="space-y-3">
                    {history.slice(0, 10).map((entry) => (
                      <div 
                        key={entry.id} 
                        className="p-3 border rounded-md"
                        data-testid={`history-item-${entry.id}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          {getStatusBadge(entry.status)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.startedAt).toLocaleString(isRtl ? "ar" : "en")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {entry.syncType === "push" ? txt.push : entry.syncType === "pull" ? txt.pull : entry.syncType}
                          </Badge>
                          <span className="text-muted-foreground">
                            {entry.triggeredBy === "manual" ? txt.manual : txt.automatic}
                          </span>
                          {entry.filesChanged !== null && (
                            <span className="text-muted-foreground">
                              {entry.filesChanged} {txt.files}
                            </span>
                          )}
                        </div>
                        {entry.errorMessage && (
                          <p className="text-xs text-destructive mt-1 truncate">{entry.errorMessage}</p>
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
