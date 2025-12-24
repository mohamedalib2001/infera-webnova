import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Github, 
  Plus, 
  RefreshCw, 
  GitBranch, 
  GitCommit, 
  Star, 
  Eye, 
  GitFork,
  Lock,
  Unlock,
  ExternalLink,
  FolderOpen,
  FileCode,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Filter
} from "lucide-react";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  private: boolean;
  html_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language?: string;
  updated_at: string;
  default_branch: string;
}

interface GitHubBranch {
  name: string;
  protected: boolean;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

const translations = {
  en: {
    title: "GitHub Manager",
    subtitle: "Manage your GitHub repositories from the sovereign account",
    connected: "Connected",
    notConnected: "Not Connected",
    repositories: "Repositories",
    branches: "Branches",
    commits: "Commits",
    createRepo: "Create Repository",
    repoName: "Repository Name",
    description: "Description",
    private: "Private",
    public: "Public",
    create: "Create",
    cancel: "Cancel",
    refresh: "Refresh",
    viewOnGitHub: "View on GitHub",
    lastUpdated: "Last updated",
    loading: "Loading...",
    noRepos: "No repositories found",
    searchRepos: "Search repositories...",
    allRepos: "All",
    publicRepos: "Public",
    privateRepos: "Private",
    stars: "Stars",
    forks: "Forks",
    watchers: "Watchers",
    defaultBranch: "Default Branch",
    protected: "Protected",
    selectRepo: "Select a repository to view details",
    repoCreated: "Repository created successfully",
    errorCreating: "Error creating repository",
    profile: "Profile",
    followers: "Followers",
    following: "Following",
    publicReposCount: "Public Repos",
  },
  ar: {
    title: "مدير GitHub",
    subtitle: "إدارة مستودعات GitHub من الحساب السيادي",
    connected: "متصل",
    notConnected: "غير متصل",
    repositories: "المستودعات",
    branches: "الفروع",
    commits: "الالتزامات",
    createRepo: "إنشاء مستودع",
    repoName: "اسم المستودع",
    description: "الوصف",
    private: "خاص",
    public: "عام",
    create: "إنشاء",
    cancel: "إلغاء",
    refresh: "تحديث",
    viewOnGitHub: "عرض في GitHub",
    lastUpdated: "آخر تحديث",
    loading: "جاري التحميل...",
    noRepos: "لا توجد مستودعات",
    searchRepos: "البحث في المستودعات...",
    allRepos: "الكل",
    publicRepos: "عام",
    privateRepos: "خاص",
    stars: "النجوم",
    forks: "التفرعات",
    watchers: "المتابعون",
    defaultBranch: "الفرع الرئيسي",
    protected: "محمي",
    selectRepo: "اختر مستودعاً لعرض التفاصيل",
    repoCreated: "تم إنشاء المستودع بنجاح",
    errorCreating: "خطأ في إنشاء المستودع",
    profile: "الملف الشخصي",
    followers: "المتابعون",
    following: "يتابع",
    publicReposCount: "المستودعات العامة",
  }
};

export default function GitHubManager() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations] || translations.en;
  const isRtl = language === "ar";

  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [newRepo, setNewRepo] = useState({
    name: "",
    description: "",
    isPrivate: true
  });

  // Fetch GitHub connection status
  const { data: statusData, isLoading: statusLoading } = useQuery<{
    connected: boolean;
    username?: string;
    avatar?: string;
    name?: string;
  }>({
    queryKey: ["/api/github/status"],
  });

  // Fetch GitHub user
  const { data: userData, isLoading: userLoading } = useQuery<{ user: GitHubUser }>({
    queryKey: ["/api/github/user"],
    enabled: statusData?.connected === true,
  });

  // Fetch repositories
  const { data: reposData, isLoading: reposLoading, refetch: refetchRepos } = useQuery<{ repos: GitHubRepo[] }>({
    queryKey: ["/api/github/repos"],
    enabled: statusData?.connected === true,
  });

  // Fetch branches for selected repo
  const { data: branchesData, isLoading: branchesLoading } = useQuery<{ branches: GitHubBranch[] }>({
    queryKey: ["/api/github/repos", selectedRepo?.full_name?.split('/')[0], selectedRepo?.name, "branches"],
    queryFn: async () => {
      if (!selectedRepo) return { branches: [] };
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await fetch(`/api/github/repos/${owner}/${repo}/branches`, { credentials: 'include' });
      return res.json();
    },
    enabled: !!selectedRepo,
  });

  // Fetch commits for selected repo
  const { data: commitsData, isLoading: commitsLoading } = useQuery<{ commits: GitHubCommit[] }>({
    queryKey: ["/api/github/repos", selectedRepo?.full_name?.split('/')[0], selectedRepo?.name, "commits"],
    queryFn: async () => {
      if (!selectedRepo) return { commits: [] };
      const [owner, repo] = selectedRepo.full_name.split('/');
      const res = await fetch(`/api/github/repos/${owner}/${repo}/commits`, { credentials: 'include' });
      return res.json();
    },
    enabled: !!selectedRepo,
  });

  // Create repository mutation
  const createRepoMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; isPrivate: boolean }) => {
      return apiRequest("POST", "/api/github/repos", data);
    },
    onSuccess: () => {
      toast({ title: t.repoCreated });
      setShowCreateDialog(false);
      setNewRepo({ name: "", description: "", isPrivate: true });
      queryClient.invalidateQueries({ queryKey: ["/api/github/repos"] });
    },
    onError: (error: any) => {
      toast({ title: t.errorCreating, description: error.message, variant: "destructive" });
    }
  });

  const filteredRepos = reposData?.repos?.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || 
      (filter === "private" && repo.private) || 
      (filter === "public" && !repo.private);
    return matchesSearch && matchesFilter;
  }) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-full" dir={isRtl ? "rtl" : "ltr"}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
            <Github className="w-7 h-7 text-white dark:text-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-github-title">{t.title}</h1>
            <p className="text-muted-foreground text-sm">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusData?.connected ? (
            <Badge variant="default" className="gap-1 bg-green-500">
              <CheckCircle className="w-3 h-3" />
              {t.connected}
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="w-3 h-3" />
              {t.notConnected}
            </Badge>
          )}
        </div>
      </div>

      {!statusData?.connected ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Github className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t.notConnected}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">{t.profile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userLoading ? (
                <div className="space-y-4">
                  <Skeleton className="w-20 h-20 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ) : userData?.user ? (
                <div className="text-center space-y-4">
                  <Avatar className="w-20 h-20 mx-auto">
                    <AvatarImage src={userData.user.avatar_url} />
                    <AvatarFallback>{userData.user.login[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{userData.user.name || userData.user.login}</h3>
                    <p className="text-sm text-muted-foreground">@{userData.user.login}</p>
                  </div>
                  {userData.user.bio && (
                    <p className="text-sm text-muted-foreground">{userData.user.bio}</p>
                  )}
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold">{userData.user.public_repos}</div>
                      <div className="text-muted-foreground text-xs">{t.publicReposCount}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{userData.user.followers}</div>
                      <div className="text-muted-foreground text-xs">{t.followers}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{userData.user.following}</div>
                      <div className="text-muted-foreground text-xs">{t.following}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchRepos}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-repos"
                />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  data-testid="button-filter-all"
                >
                  {t.allRepos}
                </Button>
                <Button
                  variant={filter === "public" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("public")}
                  data-testid="button-filter-public"
                >
                  <Unlock className="w-3 h-3 mr-1" />
                  {t.publicRepos}
                </Button>
                <Button
                  variant={filter === "private" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("private")}
                  data-testid="button-filter-private"
                >
                  <Lock className="w-3 h-3 mr-1" />
                  {t.privateRepos}
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetchRepos()}
                data-testid="button-refresh-repos"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-1" data-testid="button-create-repo">
                    <Plus className="w-4 h-4" />
                    {t.createRepo}
                  </Button>
                </DialogTrigger>
                <DialogContent dir={isRtl ? "rtl" : "ltr"}>
                  <DialogHeader>
                    <DialogTitle>{t.createRepo}</DialogTitle>
                    <DialogDescription>
                      {isRtl ? "إنشاء مستودع جديد على GitHub" : "Create a new repository on GitHub"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{t.repoName}</Label>
                      <Input
                        value={newRepo.name}
                        onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                        placeholder="my-awesome-project"
                        data-testid="input-new-repo-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.description}</Label>
                      <Textarea
                        value={newRepo.description}
                        onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                        placeholder={isRtl ? "وصف المستودع..." : "Repository description..."}
                        data-testid="input-new-repo-description"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t.private}</Label>
                      <Switch
                        checked={newRepo.isPrivate}
                        onCheckedChange={(checked) => setNewRepo({ ...newRepo, isPrivate: checked })}
                        data-testid="switch-repo-private"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      {t.cancel}
                    </Button>
                    <Button
                      onClick={() => createRepoMutation.mutate(newRepo)}
                      disabled={!newRepo.name || createRepoMutation.isPending}
                      data-testid="button-submit-create-repo"
                    >
                      {createRepoMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                      {t.create}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Repositories Grid */}
            {reposLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRepos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t.noRepos}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredRepos.map((repo) => (
                  <Card 
                    key={repo.id} 
                    className={`cursor-pointer transition-colors hover-elevate ${selectedRepo?.id === repo.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedRepo(repo)}
                    data-testid={`card-repo-${repo.id}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCode className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="font-semibold truncate">{repo.name}</span>
                        </div>
                        <Badge variant={repo.private ? "secondary" : "outline"} className="flex-shrink-0">
                          {repo.private ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
                          {repo.private ? t.private : t.public}
                        </Badge>
                      </div>
                      {repo.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          {repo.forks_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(repo.updated_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Selected Repo Details */}
            {selectedRepo && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-primary" />
                      <CardTitle>{selectedRepo.name}</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedRepo.html_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                        <ExternalLink className="w-4 h-4" />
                        {t.viewOnGitHub}
                      </a>
                    </Button>
                  </div>
                  {selectedRepo.description && (
                    <CardDescription>{selectedRepo.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="branches">
                    <TabsList>
                      <TabsTrigger value="branches" className="gap-1">
                        <GitBranch className="w-4 h-4" />
                        {t.branches}
                      </TabsTrigger>
                      <TabsTrigger value="commits" className="gap-1">
                        <GitCommit className="w-4 h-4" />
                        {t.commits}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="branches" className="mt-4">
                      {branchesLoading ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                        </div>
                      ) : (
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {branchesData?.branches?.map((branch) => (
                              <div key={branch.name} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                <div className="flex items-center gap-2">
                                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                                  <span>{branch.name}</span>
                                  {branch.name === selectedRepo.default_branch && (
                                    <Badge variant="outline" className="text-xs">{t.defaultBranch}</Badge>
                                  )}
                                </div>
                                {branch.protected && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Lock className="w-3 h-3 mr-1" />
                                    {t.protected}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>
                    <TabsContent value="commits" className="mt-4">
                      {commitsLoading ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                      ) : (
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {commitsData?.commits?.map((commit) => (
                              <div key={commit.sha} className="p-3 rounded-md bg-muted/50 space-y-1">
                                <p className="text-sm font-medium line-clamp-1">{commit.commit.message}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{commit.commit.author.name}</span>
                                  <span>•</span>
                                  <span>{formatDate(commit.commit.author.date)}</span>
                                  <span>•</span>
                                  <code className="text-xs bg-muted px-1 rounded">{commit.sha.substring(0, 7)}</code>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
