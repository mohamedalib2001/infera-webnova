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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Github, 
  Plus, 
  RefreshCw, 
  GitBranch, 
  GitCommit, 
  Star, 
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
  MoreVertical,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  Pencil,
  AlertTriangle,
  Building2,
  MapPin,
  Link2,
  Mail,
  Calendar
} from "lucide-react";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  company?: string;
  location?: string;
  blog?: string;
  twitter_username?: string;
  email?: string;
  created_at?: string;
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
  created_at?: string;
  default_branch: string;
  size?: number;
  open_issues_count?: number;
  pushed_at?: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

const PulsingDot = ({ className = "" }: { className?: string }) => (
  <span className={`relative flex h-2.5 w-2.5 ${className}`}>
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
  </span>
);

const getLanguageColor = (language: string | undefined) => {
  const colors: Record<string, string> = {
    TypeScript: "bg-blue-500",
    JavaScript: "bg-yellow-400",
    Python: "bg-green-500",
    Java: "bg-orange-500",
    Go: "bg-cyan-400",
    Rust: "bg-orange-600",
    PHP: "bg-purple-500",
    Ruby: "bg-red-500",
    CSS: "bg-pink-500",
    HTML: "bg-orange-400",
    Shell: "bg-green-600",
    C: "bg-gray-500",
    "C++": "bg-pink-600",
    "C#": "bg-green-700",
  };
  return colors[language || ""] || "bg-primary";
};

const formatSize = (size: number | undefined) => {
  if (!size) return "0 KB";
  if (size < 1024) return `${size} KB`;
  return `${(size / 1024).toFixed(1)} MB`;
};

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
    subtitle: "Full control over your GitHub repositories from the sovereign account",
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
    delete: "Delete",
    deleteRepo: "Delete Repository",
    deleteConfirmTitle: "Delete Repository",
    deleteConfirmDesc: "Are you sure you want to delete this repository? This action cannot be undone.",
    deleteSuccess: "Repository deleted successfully",
    deleteError: "Error deleting repository",
    makePrivate: "Make Private",
    makePublic: "Make Public",
    visibilityChanged: "Repository visibility changed",
    visibilityError: "Error changing visibility",
    editRepo: "Edit Repository",
    save: "Save",
    actions: "Actions",
    dangerZone: "Danger Zone",
    confirmDelete: "Type the repository name to confirm deletion",
    settings: "Settings",
    visibility: "Visibility",
    repoCount: "repositories",
    online: "Online",
    synced: "Synced",
    size: "Size",
    issues: "Issues",
    lastPush: "Last Push",
    created: "Created",
    repoDetails: "Repository Details",
    statistics: "Statistics",
  },
  ar: {
    title: "مدير GitHub",
    subtitle: "تحكم كامل في مستودعات GitHub من الحساب السيادي",
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
    delete: "حذف",
    deleteRepo: "حذف المستودع",
    deleteConfirmTitle: "حذف المستودع",
    deleteConfirmDesc: "هل أنت متأكد من حذف هذا المستودع؟ لا يمكن التراجع عن هذا الإجراء.",
    deleteSuccess: "تم حذف المستودع بنجاح",
    deleteError: "خطأ في حذف المستودع",
    makePrivate: "جعله خاصاً",
    makePublic: "جعله عاماً",
    visibilityChanged: "تم تغيير خصوصية المستودع",
    visibilityError: "خطأ في تغيير الخصوصية",
    editRepo: "تعديل المستودع",
    save: "حفظ",
    actions: "الإجراءات",
    dangerZone: "منطقة الخطر",
    confirmDelete: "اكتب اسم المستودع للتأكيد",
    settings: "الإعدادات",
    visibility: "الخصوصية",
    repoCount: "مستودع",
    online: "متصل",
    synced: "متزامن",
    size: "الحجم",
    issues: "المشاكل",
    lastPush: "آخر دفع",
    created: "تاريخ الإنشاء",
    repoDetails: "تفاصيل المستودع",
    statistics: "الإحصائيات",
  }
};

export default function GitHubManager() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations] || translations.en;
  const isRtl = language === "ar";

  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState<GitHubRepo | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [newRepo, setNewRepo] = useState({
    name: "",
    description: "",
    isPrivate: true
  });
  const [editRepo, setEditRepo] = useState({
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

  // Delete repository mutation
  const deleteRepoMutation = useMutation({
    mutationFn: async ({ owner, repo }: { owner: string; repo: string }) => {
      return apiRequest("DELETE", `/api/github/repos/${owner}/${repo}`);
    },
    onSuccess: () => {
      toast({ title: t.deleteSuccess });
      setShowDeleteDialog(false);
      setRepoToDelete(null);
      setDeleteConfirmName("");
      if (selectedRepo?.id === repoToDelete?.id) {
        setSelectedRepo(null);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/github/repos"] });
    },
    onError: (error: any) => {
      toast({ title: t.deleteError, description: error.message, variant: "destructive" });
    }
  });

  // Update repository mutation
  const updateRepoMutation = useMutation({
    mutationFn: async ({ owner, repo, data }: { owner: string; repo: string; data: { name?: string; description?: string; isPrivate?: boolean } }) => {
      return apiRequest("PATCH", `/api/github/repos/${owner}/${repo}`, data);
    },
    onSuccess: () => {
      toast({ title: t.visibilityChanged });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/github/repos"] });
    },
    onError: (error: any) => {
      toast({ title: t.visibilityError, description: error.message, variant: "destructive" });
    }
  });

  const handleToggleVisibility = (repo: GitHubRepo) => {
    const [owner, repoName] = repo.full_name.split('/');
    updateRepoMutation.mutate({
      owner,
      repo: repoName,
      data: { isPrivate: !repo.private }
    });
  };

  const handleDeleteRepo = () => {
    if (repoToDelete && deleteConfirmName === repoToDelete.name) {
      const [owner, repo] = repoToDelete.full_name.split('/');
      deleteRepoMutation.mutate({ owner, repo });
    }
  };

  const openEditDialog = (repo: GitHubRepo) => {
    setEditRepo({
      name: repo.name,
      description: repo.description || "",
      isPrivate: repo.private
    });
    setSelectedRepo(repo);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (selectedRepo) {
      const [owner, repo] = selectedRepo.full_name.split('/');
      updateRepoMutation.mutate({
        owner,
        repo,
        data: {
          name: editRepo.name,
          description: editRepo.description,
          isPrivate: editRepo.isPrivate
        }
      });
    }
  };

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
          {reposData?.repos && (
            <Badge variant="outline">
              {reposData.repos.length} {t.repoCount}
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
            <CardContent className="pt-6 space-y-4">
              {userLoading ? (
                <div className="space-y-4">
                  <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                  <Skeleton className="h-5 w-40 mx-auto" />
                  <Skeleton className="h-4 w-28 mx-auto" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : userData?.user ? (
                <div className="space-y-4">
                  {/* Avatar with Online Status */}
                  <div className="relative w-24 h-24 mx-auto">
                    <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                      <AvatarImage src={userData.user.avatar_url} />
                      <AvatarFallback className="text-2xl">{userData.user.login[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-1 right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background"></span>
                    </span>
                  </div>

                  {/* Name & Username */}
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{userData.user.name || userData.user.login}</h3>
                    <a 
                      href={userData.user.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      @{userData.user.login}
                    </a>
                  </div>

                  {/* Bio */}
                  {userData.user.bio && (
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">{userData.user.bio}</p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 pt-2 border-t">
                    {userData.user.company && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span>{userData.user.company}</span>
                      </div>
                    )}
                    {userData.user.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{userData.user.location}</span>
                      </div>
                    )}
                    {userData.user.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${userData.user.email}`} className="text-primary hover:underline truncate">
                          {userData.user.email}
                        </a>
                      </div>
                    )}
                    {userData.user.blog && (
                      <div className="flex items-center gap-2 text-sm">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <a href={userData.user.blog.startsWith('http') ? userData.user.blog : `https://${userData.user.blog}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                          {userData.user.blog}
                        </a>
                      </div>
                    )}
                    {userData.user.twitter_username && (
                      <div className="flex items-center gap-2 text-sm">
                        <ExternalLink className="w-4 h-4 text-sky-500" />
                        <a href={`https://twitter.com/${userData.user.twitter_username}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          @{userData.user.twitter_username}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <div className="font-bold text-lg">{userData.user.public_repos}</div>
                      <div className="text-muted-foreground text-[10px]">{t.publicReposCount}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <div className="font-bold text-lg">{userData.user.followers}</div>
                      <div className="text-muted-foreground text-[10px]">{t.followers}</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <div className="font-bold text-lg">{userData.user.following}</div>
                      <div className="text-muted-foreground text-[10px]">{t.following}</div>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a href={userData.user.html_url} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4" />
                      {t.viewOnGitHub}
                    </a>
                  </Button>
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
                    className={`cursor-pointer transition-all hover-elevate ${selectedRepo?.id === repo.id ? 'ring-2 ring-primary' : ''}`}
                    data-testid={`card-repo-${repo.id}`}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header with Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div 
                          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                          onClick={() => setSelectedRepo(repo)}
                        >
                          <div className="relative">
                            <FileCode className="w-6 h-6 text-primary flex-shrink-0" />
                            <PulsingDot className="absolute -top-0.5 -right-0.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold truncate block">{repo.name}</span>
                            <div className="flex items-center gap-1.5 text-xs text-green-500">
                              <PulsingDot />
                              <span>{t.online}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant={repo.private ? "secondary" : "outline"} className="flex-shrink-0">
                            {repo.private ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
                            {repo.private ? t.private : t.public}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`button-repo-menu-${repo.id}`}>
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRtl ? "start" : "end"}>
                              <DropdownMenuItem onClick={() => window.open(repo.html_url, '_blank')}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {t.viewOnGitHub}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(repo)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                {t.editRepo}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleVisibility(repo)}>
                                {repo.private ? (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    {t.makePublic}
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    {t.makePrivate}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setRepoToDelete(repo);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t.delete}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Description */}
                      {repo.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{repo.description}</p>
                      )}

                      {/* Stats Row */}
                      <div className="grid grid-cols-4 gap-2 py-2 px-3 bg-muted/30 rounded-lg">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-500" />
                            <span className="font-semibold text-sm">{repo.stargazers_count}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{t.stars}</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <GitFork className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-semibold text-sm">{repo.forks_count}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{t.forks}</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-green-500" />
                            <span className="font-semibold text-sm">{repo.watchers_count}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{t.watchers}</span>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                            <span className="font-semibold text-sm">{repo.open_issues_count || 0}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{t.issues}</span>
                        </div>
                      </div>

                      {/* Details Row */}
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span className={`w-2.5 h-2.5 rounded-full ${getLanguageColor(repo.language)}`} />
                              <span className="font-medium">{repo.language}</span>
                            </span>
                          )}
                          {repo.size && (
                            <span className="flex items-center gap-1">
                              <FolderOpen className="w-3 h-3" />
                              {formatSize(repo.size)}
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(repo.updated_at)}
                        </span>
                      </div>

                      {/* Owner Info */}
                      <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                        <a 
                          href={repo.owner.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover-elevate rounded-md p-1 -m-1"
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={repo.owner.avatar_url} />
                            <AvatarFallback className="text-[10px]">{repo.owner.login[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">@{repo.owner.login}</span>
                        </a>
                        <div className="flex-1" />
                        <div className="flex items-center gap-1.5 text-xs">
                          <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {repo.default_branch}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="gap-1 text-green-600 border-green-200 dark:border-green-800">
                          <CheckCircle className="w-3 h-3" />
                          <span className="text-[10px]">{t.synced}</span>
                        </Badge>
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
                      <Badge variant={selectedRepo.private ? "secondary" : "outline"}>
                        {selectedRepo.private ? t.private : t.public}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(selectedRepo)}>
                        <Settings className="w-4 h-4 mr-1" />
                        {t.settings}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedRepo.html_url} target="_blank" rel="noopener noreferrer" className="gap-1">
                          <ExternalLink className="w-4 h-4" />
                          {t.viewOnGitHub}
                        </a>
                      </Button>
                    </div>
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
                                  <span>-</span>
                                  <span>{formatDate(commit.commit.author.date)}</span>
                                  <span>-</span>
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

      {/* Edit Repository Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t.editRepo}</DialogTitle>
            <DialogDescription>
              {isRtl ? "تعديل إعدادات المستودع" : "Edit repository settings"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.repoName}</Label>
              <Input
                value={editRepo.name}
                onChange={(e) => setEditRepo({ ...editRepo, name: e.target.value })}
                data-testid="input-edit-repo-name"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.description}</Label>
              <Textarea
                value={editRepo.description}
                onChange={(e) => setEditRepo({ ...editRepo, description: e.target.value })}
                data-testid="input-edit-repo-description"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>{t.visibility}</Label>
                <p className="text-xs text-muted-foreground">
                  {editRepo.isPrivate 
                    ? (isRtl ? "المستودع خاص ومرئي لك فقط" : "Repository is private and only visible to you")
                    : (isRtl ? "المستودع عام ومرئي للجميع" : "Repository is public and visible to everyone")
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t.public}</span>
                <Switch
                  checked={editRepo.isPrivate}
                  onCheckedChange={(checked) => setEditRepo({ ...editRepo, isPrivate: checked })}
                  data-testid="switch-edit-repo-private"
                />
                <span className="text-sm text-muted-foreground">{t.private}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {t.cancel}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateRepoMutation.isPending}
              data-testid="button-submit-edit-repo"
            >
              {updateRepoMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent dir={isRtl ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {t.deleteConfirmTitle}
            </DialogTitle>
            <DialogDescription>
              {t.deleteConfirmDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-destructive/10 rounded-md border border-destructive/20">
              <p className="text-sm font-medium">{repoToDelete?.full_name}</p>
            </div>
            <div className="space-y-2">
              <Label>{t.confirmDelete}</Label>
              <Input
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={repoToDelete?.name}
                data-testid="input-confirm-delete"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setDeleteConfirmName("");
              setRepoToDelete(null);
            }}>
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRepo}
              disabled={deleteConfirmName !== repoToDelete?.name || deleteRepoMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteRepoMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
