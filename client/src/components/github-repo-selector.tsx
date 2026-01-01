import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Plus, RefreshCw, Lock, Globe, Check, AlertCircle, FolderGit2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  updated_at: string;
  language: string | null;
  stargazers_count: number;
}

interface GitHubRepoSelectorProps {
  projectId?: string;
  projectName?: string;
  onRepoSelected?: (repo: { owner: string; name: string; fullName: string; url: string; isNew: boolean }) => void;
  onSyncComplete?: (result: { repo: string; url: string; commitSha: string }) => void;
  language?: 'ar' | 'en';
}

export function GitHubRepoSelector({ 
  projectId, 
  projectName = "new-project",
  onRepoSelected, 
  onSyncComplete,
  language = 'en' 
}: GitHubRepoSelectorProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [newRepoName, setNewRepoName] = useState(projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
  const [newRepoDescription, setNewRepoDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");

  const t = (en: string, ar: string) => language === 'ar' ? ar : en;

  const { data: connectionStatus, isLoading: isCheckingConnection } = useQuery<{ 
    connected: boolean; 
    username?: string;
    avatar?: string;
    name?: string;
  }>({
    queryKey: ['/api/github/status'],
  });

  const { data: reposData, isLoading: isLoadingRepos, refetch: refetchRepos } = useQuery<{ 
    success: boolean; 
    repos: GitHubRepo[] 
  }>({
    queryKey: ['/api/github/repos'],
    enabled: connectionStatus?.connected === true,
  });

  const createRepoMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; isPrivate: boolean }) => {
      return apiRequest('POST', '/api/github/repos', data);
    },
    onSuccess: async (result: any) => {
      toast({
        title: t("Repository Created", "تم إنشاء المستودع"),
        description: t(`Repository ${result.repo?.name} created successfully`, `تم إنشاء المستودع ${result.repo?.name} بنجاح`),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/github/repos'] });
      if (onRepoSelected && result.repo) {
        onRepoSelected({
          owner: result.repo.owner?.login || connectionStatus?.username || '',
          name: result.repo.name,
          fullName: result.repo.full_name,
          url: result.repo.html_url,
          isNew: true
        });
      }
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("Error", "خطأ"),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const syncToRepoMutation = useMutation({
    mutationFn: async (data: { projectId: string; repoName: string; isPrivate: boolean; commitMessage: string }) => {
      return apiRequest('POST', `/api/github/sync-project/${data.projectId}`, {
        repoName: data.repoName,
        isPrivate: data.isPrivate,
        commitMessage: data.commitMessage
      });
    },
    onSuccess: (result: any) => {
      toast({
        title: t("Sync Complete", "تمت المزامنة"),
        description: t(`Project synced to ${result.repo}`, `تمت مزامنة المشروع إلى ${result.repo}`),
      });
      if (onSyncComplete) {
        onSyncComplete({
          repo: result.repo,
          url: result.url,
          commitSha: result.commitSha
        });
      }
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("Sync Failed", "فشل المزامنة"),
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSelectExisting = () => {
    if (!selectedRepo || !reposData?.repos) return;
    const repo = reposData.repos.find(r => r.full_name === selectedRepo);
    if (!repo) return;

    if (projectId) {
      const [owner, name] = selectedRepo.split('/');
      syncToRepoMutation.mutate({
        projectId,
        repoName: name,
        isPrivate: repo.private,
        commitMessage: `Sync from INFERA WebNova - ${new Date().toISOString()}`
      });
    } else if (onRepoSelected) {
      const [owner, name] = selectedRepo.split('/');
      onRepoSelected({
        owner,
        name,
        fullName: selectedRepo,
        url: repo.html_url,
        isNew: false
      });
      setOpen(false);
    }
  };

  const handleCreateNew = () => {
    if (!newRepoName.trim()) {
      toast({
        title: t("Error", "خطأ"),
        description: t("Repository name is required", "اسم المستودع مطلوب"),
        variant: "destructive",
      });
      return;
    }

    createRepoMutation.mutate({
      name: newRepoName.trim(),
      description: newRepoDescription || `Platform created with INFERA WebNova`,
      isPrivate
    });
  };

  if (isCheckingConnection) {
    return <Skeleton className="h-9 w-32" />;
  }

  if (!connectionStatus?.connected) {
    return (
      <Button variant="outline" disabled data-testid="button-github-not-connected">
        <AlertCircle className="mr-2 h-4 w-4" />
        {t("GitHub Not Connected", "GitHub غير متصل")}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-open-github-selector">
          <Github className="mr-2 h-4 w-4" />
          {t("Select Repository", "اختر المستودع")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5" />
            {t("GitHub Repository", "مستودع GitHub")}
          </DialogTitle>
          <DialogDescription>
            {t("Select an existing repository or create a new one", "اختر مستودع موجود أو أنشئ واحداً جديداً")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4 p-2 rounded-md bg-muted">
          <img 
            src={connectionStatus.avatar || `https://github.com/${connectionStatus.username}.png`} 
            alt={connectionStatus.username}
            className="h-8 w-8 rounded-full"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">{connectionStatus.name || connectionStatus.username}</p>
            <p className="text-xs text-muted-foreground">@{connectionStatus.username}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Check className="mr-1 h-3 w-3" />
            {t("Connected", "متصل")}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "new")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing" data-testid="tab-existing-repo">
              <FolderGit2 className="mr-2 h-4 w-4" />
              {t("Existing Repository", "مستودع موجود")}
            </TabsTrigger>
            <TabsTrigger value="new" data-testid="tab-new-repo">
              <Plus className="mr-2 h-4 w-4" />
              {t("Create New", "إنشاء جديد")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>{t("Select Repository", "اختر المستودع")}</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchRepos()}
                  disabled={isLoadingRepos}
                  data-testid="button-refresh-repos"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingRepos ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {isLoadingRepos ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                    <SelectTrigger data-testid="select-github-repo">
                      <SelectValue placeholder={t("Choose a repository...", "اختر مستودع...")} />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-64">
                        {reposData?.repos?.map((repo) => (
                          <SelectItem 
                            key={repo.id} 
                            value={repo.full_name}
                            data-testid={`select-repo-${repo.name}`}
                          >
                            <div className="flex items-center gap-2">
                              {repo.private ? (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <Globe className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span>{repo.full_name}</span>
                              {repo.language && (
                                <Badge variant="secondary" className="text-xs ml-auto">
                                  {repo.language}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>

                  {selectedRepo && reposData?.repos && (
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">
                          {reposData.repos.find(r => r.full_name === selectedRepo)?.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {reposData.repos.find(r => r.full_name === selectedRepo)?.description || 
                            t("No description", "بدون وصف")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{t("Branch:", "الفرع:")} {reposData.repos.find(r => r.full_name === selectedRepo)?.default_branch}</span>
                          <span>{t("Updated:", "آخر تحديث:")} {new Date(reposData.repos.find(r => r.full_name === selectedRepo)?.updated_at || '').toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              <Button 
                className="w-full" 
                onClick={handleSelectExisting}
                disabled={!selectedRepo || syncToRepoMutation.isPending}
                data-testid="button-sync-to-repo"
              >
                {syncToRepoMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                {projectId 
                  ? t("Sync to Repository", "مزامنة إلى المستودع")
                  : t("Select Repository", "اختر المستودع")
                }
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="new" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repo-name">{t("Repository Name", "اسم المستودع")}</Label>
                <Input
                  id="repo-name"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="my-awesome-project"
                  data-testid="input-new-repo-name"
                />
                <p className="text-xs text-muted-foreground">
                  {connectionStatus.username}/{newRepoName || 'repository-name'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo-description">{t("Description (Optional)", "الوصف (اختياري)")}</Label>
                <Input
                  id="repo-description"
                  value={newRepoDescription}
                  onChange={(e) => setNewRepoDescription(e.target.value)}
                  placeholder={t("A brief description of your project", "وصف مختصر لمشروعك")}
                  data-testid="input-new-repo-description"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("Private Repository", "مستودع خاص")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {isPrivate 
                      ? t("Only you can see this repository", "أنت فقط من يمكنه رؤية هذا المستودع")
                      : t("Anyone can see this repository", "أي شخص يمكنه رؤية هذا المستودع")
                    }
                  </p>
                </div>
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                  data-testid="switch-private-repo"
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleCreateNew}
                disabled={!newRepoName.trim() || createRepoMutation.isPending}
                data-testid="button-create-new-repo"
              >
                {createRepoMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {t("Create Repository", "إنشاء المستودع")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
