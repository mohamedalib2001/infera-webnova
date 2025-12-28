import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, GitBranch, RefreshCw, Rocket, FolderGit2, Loader2, Lock, Globe } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  default_branch: string;
  updated_at: string;
  html_url: string;
  size?: number;
  language?: string;
}

interface Branch {
  name: string;
  protected: boolean;
}

interface SyncSettings {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  autoSync: boolean;
  lastSyncAt: string | null;
}

interface SyncSettingsCardProps {
  isConnected: boolean;
  onSettingsChange?: (settings: SyncSettings | null) => void;
}

export function SyncSettingsCard({ isConnected, onSettingsChange }: SyncSettingsCardProps) {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const { toast } = useToast();

  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("main");
  const [autoSync, setAutoSync] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data: reposData, isLoading: reposLoading } = useQuery<{ success: boolean; repos: GitHubRepo[] }>({
    queryKey: ["/api/github/repos"],
    enabled: isConnected,
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery<{ success: boolean; settings: SyncSettings | null }>({
    queryKey: ["/api/github/sync-settings"],
    enabled: isConnected,
  });

  const repos = reposData?.repos || [];
  const currentSettings = settingsData?.settings;

  const [repoOwner, repoName] = selectedRepo.split("/");

  const { data: branchesData } = useQuery<{ success: boolean; branches: Branch[] }>({
    queryKey: ["/api/github/repos", repoOwner, repoName, "branches"],
    enabled: !!selectedRepo && !!repoOwner && !!repoName,
  });

  const branches = branchesData?.branches || [];

  useEffect(() => {
    if (currentSettings && !initialized) {
      setSelectedRepo(`${currentSettings.owner}/${currentSettings.repo}`);
      setSelectedBranch(currentSettings.branch);
      setAutoSync(currentSettings.autoSync);
      setInitialized(true);
      onSettingsChange?.(currentSettings);
    }
  }, [currentSettings, initialized, onSettingsChange]);

  const selectedRepoData = repos.find(r => r.full_name === selectedRepo);

  const saveSettings = useMutation({
    mutationFn: async (data: { owner: string; repo: string; branch: string; autoSync: boolean }) => {
      return apiRequest("POST", "/api/github/sync-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/sync-settings"] });
      toast({
        title: isRtl ? "تم الحفظ" : "Saved",
        description: isRtl ? "تم حفظ إعدادات المزامنة" : "Sync settings saved",
      });
    },
    onError: (error: any) => {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncNow = useMutation({
    mutationFn: async () => {
      if (!currentSettings?.id) throw new Error("No settings configured");
      return apiRequest("POST", "/api/github/sync-history", {
        settingsId: currentSettings.id,
        syncType: "manual",
        triggeredBy: "manual",
        status: "success",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/operations-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/github/sync-settings"] });
      toast({
        title: isRtl ? "تمت المزامنة" : "Sync Complete",
        description: isRtl ? "تمت مزامنة المستودع" : "Repository synced successfully",
      });
    },
  });

  const deployNow = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/github/hetzner/deploy", {
        owner: repoOwner,
        repo: repoName,
        branch: selectedBranch,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/operations-history"] });
      toast({
        title: isRtl ? "بدأ النشر" : "Deployment Started",
        description: isRtl ? "جاري النشر" : "Deployment in progress",
      });
    },
  });

  const handleSave = () => {
    if (!selectedRepo) return;
    saveSettings.mutate({
      owner: repoOwner,
      repo: repoName,
      branch: selectedBranch,
      autoSync,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {isRtl ? "إعدادات المزامنة" : "Sync Settings"}
        </CardTitle>
        <CardDescription>
          {isRtl ? "تكوين مزامنة GitHub" : "Configure GitHub synchronization"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="repo-select">{isRtl ? "المستودع" : "Repository"}</Label>
          <Select value={selectedRepo} onValueChange={setSelectedRepo} disabled={reposLoading}>
            <SelectTrigger id="repo-select" data-testid="select-repository">
              <SelectValue placeholder={isRtl ? "اختر مستودع" : "Select a repository"} />
            </SelectTrigger>
            <SelectContent>
              {repos.map((repo) => (
                <SelectItem key={repo.id} value={repo.full_name} data-testid={`select-repo-${repo.name}`}>
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4" />
                    <span>{repo.full_name}</span>
                    {repo.private ? (
                      <Badge variant="secondary" className="text-xs"><Lock className="h-3 w-3 mr-1" />Private</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs"><Globe className="h-3 w-3 mr-1" />Public</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedRepoData && (
            <p className="text-xs text-muted-foreground">
              {selectedRepoData.description || isRtl ? "لا يوجد وصف" : "No description"}
              {selectedRepoData.language && ` • ${selectedRepoData.language}`}
              {selectedRepoData.size && ` • ${selectedRepoData.size} KB`}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch-select">{isRtl ? "الفرع" : "Branch"}</Label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={!selectedRepo}>
            <SelectTrigger id="branch-select" data-testid="select-branch">
              <SelectValue placeholder={isRtl ? "اختر فرع" : "Select a branch"} />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.name} value={branch.name} data-testid={`select-branch-${branch.name}`}>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <span>{branch.name}</span>
                    {branch.protected && <Badge variant="outline" className="text-xs">Protected</Badge>}
                  </div>
                </SelectItem>
              ))}
              {branches.length === 0 && selectedRepo && (
                <SelectItem value="main">main</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-sync">{isRtl ? "المزامنة التلقائية" : "Auto Sync"}</Label>
            <p className="text-xs text-muted-foreground">
              {isRtl ? "مزامنة التغييرات تلقائياً" : "Automatically sync changes periodically"}
            </p>
          </div>
          <Switch
            id="auto-sync"
            checked={autoSync}
            onCheckedChange={setAutoSync}
            data-testid="switch-auto-sync"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleSave} disabled={saveSettings.isPending || !selectedRepo} data-testid="button-save-settings">
            {saveSettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isRtl ? "حفظ" : "Save Settings"}
          </Button>
          <Button variant="outline" onClick={() => syncNow.mutate()} disabled={syncNow.isPending || !currentSettings} data-testid="button-sync-now">
            {syncNow.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {isRtl ? "مزامنة الآن" : "Sync Now"}
          </Button>
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => deployNow.mutate()} 
            disabled={deployNow.isPending || !currentSettings} 
            data-testid="button-deploy"
          >
            {deployNow.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Rocket className="h-4 w-4 mr-2" />}
            {isRtl ? "نشر" : "Deploy"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}