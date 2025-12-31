import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { SiGithub } from "react-icons/si";
import {
  Download,
  Folder,
  FileCode,
  GitBranch,
  Star,
  Eye,
  Lock,
  Globe,
  Loader2,
  Search,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Crown,
  RefreshCw,
  FileText,
  Code,
  Package
} from "lucide-react";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface TreeFile {
  path: string;
  size: number;
  sha: string;
}

interface Branch {
  name: string;
  commit: { sha: string };
  protected: boolean;
}

export default function GitHubImport() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [projectName, setProjectName] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const isOwner = user?.role === "owner" || user?.role === "admin" || user?.email === "mohamed.ali.b2001@gmail.com";

  const t = {
    ar: {
      title: "استيراد مشروع من GitHub",
      subtitle: "استيراد مستودعات GitHub والتطوير عليها داخل المنصة",
      ownerOnly: "متاح للمالك فقط",
      searchPlaceholder: "البحث في المستودعات...",
      yourRepos: "مستودعاتك",
      allRepos: "جميع المستودعات",
      selectRepo: "اختر مستودع للاستيراد",
      noRepos: "لا توجد مستودعات",
      private: "خاص",
      public: "عام",
      stars: "نجوم",
      forks: "تفريعات",
      lastUpdate: "آخر تحديث",
      import: "استيراد",
      importing: "جاري الاستيراد...",
      preview: "معاينة الملفات",
      branch: "الفرع",
      projectName: "اسم المشروع",
      files: "ملف",
      cancel: "إلغاء",
      confirmImport: "تأكيد الاستيراد",
      importSuccess: "تم الاستيراد بنجاح!",
      importError: "فشل الاستيراد",
      noAccess: "ليس لديك صلاحية الوصول لهذه الصفحة",
      goHome: "العودة للرئيسية",
      refresh: "تحديث",
      repoDetails: "تفاصيل المستودع",
      filesPreview: "معاينة الملفات",
      openInDev: "فتح في بيئة التطوير"
    },
    en: {
      title: "Import GitHub Project",
      subtitle: "Import GitHub repositories and develop them within the platform",
      ownerOnly: "Owner Only",
      searchPlaceholder: "Search repositories...",
      yourRepos: "Your Repositories",
      allRepos: "All Repositories",
      selectRepo: "Select a repository to import",
      noRepos: "No repositories found",
      private: "Private",
      public: "Public",
      stars: "stars",
      forks: "forks",
      lastUpdate: "Last updated",
      import: "Import",
      importing: "Importing...",
      preview: "Preview Files",
      branch: "Branch",
      projectName: "Project Name",
      files: "files",
      cancel: "Cancel",
      confirmImport: "Confirm Import",
      importSuccess: "Import successful!",
      importError: "Import failed",
      noAccess: "You don't have access to this page",
      goHome: "Go Home",
      refresh: "Refresh",
      repoDetails: "Repository Details",
      filesPreview: "Files Preview",
      openInDev: "Open in Development"
    }
  };

  const text = isRtl ? t.ar : t.en;

  const { data: githubStatus, isLoading: statusLoading } = useQuery<{ success: boolean; connected: boolean; username?: string; avatar?: string }>({
    queryKey: ["/api/github/status"],
  });

  const { data: reposData, isLoading: reposLoading, refetch: refetchRepos } = useQuery<{ success: boolean; repos: GitHubRepo[] }>({
    queryKey: ["/api/github/repos", { per_page: 100 }],
    enabled: githubStatus?.connected,
  });

  const { data: branchesData } = useQuery<{ success: boolean; branches: Branch[] }>({
    queryKey: ["/api/github/repos", selectedRepo?.owner.login, selectedRepo?.name, "branches"],
    enabled: !!selectedRepo,
  });

  const { data: treeData, isLoading: treeLoading } = useQuery<{ success: boolean; files: TreeFile[]; filesCount: number }>({
    queryKey: ["/api/github/repos", selectedRepo?.owner.login, selectedRepo?.name, "tree", { ref: selectedBranch }],
    enabled: !!selectedRepo && previewOpen,
  });

  const importMutation = useMutation({
    mutationFn: async (data: { owner: string; repo: string; branch: string; projectName: string }) => {
      const res = await apiRequest("POST", "/api/github/import-project", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: text.importSuccess,
        description: data.message,
      });
      setPreviewOpen(false);
      setSelectedRepo(null);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      if (data.project?.id) {
        setLocation(`/projects/${data.project.id}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: text.importError,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredRepos = reposData?.repos?.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSelectRepo = (repo: GitHubRepo) => {
    setSelectedRepo(repo);
    setSelectedBranch(repo.default_branch);
    setProjectName(repo.name);
    setPreviewOpen(true);
  };

  const handleImport = () => {
    if (!selectedRepo) return;
    importMutation.mutate({
      owner: selectedRepo.owner.login,
      repo: selectedRepo.name,
      branch: selectedBranch,
      projectName: projectName || selectedRepo.name
    });
  };

  if (!isAuthenticated || !isOwner) {
    return (
      <div className="h-full flex items-center justify-center" dir={isRtl ? "rtl" : "ltr"}>
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Crown className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <CardTitle>{text.ownerOnly}</CardTitle>
            <CardDescription>{text.noAccess}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setLocation("/")} data-testid="button-go-home">
              {text.goHome}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statusLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!githubStatus?.connected) {
    return (
      <div className="h-full flex items-center justify-center p-6" dir={isRtl ? "rtl" : "ltr"}>
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <SiGithub className="h-12 w-12 mx-auto mb-2" />
            <CardTitle>{isRtl ? "GitHub غير متصل" : "GitHub Not Connected"}</CardTitle>
            <CardDescription>
              {isRtl ? "يرجى ربط حساب GitHub من إعدادات التكاملات" : "Please connect GitHub from integrations settings"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setLocation("/github-sync")} data-testid="button-connect-github">
              {isRtl ? "ربط GitHub" : "Connect GitHub"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <SiGithub className="h-6 w-6" />
              {text.title}
              <Badge variant="outline" className="border-amber-500/30 text-amber-600">
                <Crown className="h-3 w-3 mr-1" />
                {text.ownerOnly}
              </Badge>
            </h1>
            <p className="text-muted-foreground">{text.subtitle}</p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchRepos()}
            disabled={reposLoading}
            data-testid="button-refresh-repos"
          >
            <RefreshCw className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"} ${reposLoading ? "animate-spin" : ""}`} />
            {text.refresh}
          </Button>
        </header>

        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRtl ? "right-3" : "left-3"}`} />
          <Input
            placeholder={text.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRtl ? "pr-10" : "pl-10"}
            data-testid="input-search-repos"
          />
        </div>

        {reposLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredRepos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{text.noRepos}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRepos.map((repo) => (
              <Card 
                key={repo.id} 
                className="hover-elevate cursor-pointer transition-all"
                onClick={() => handleSelectRepo(repo)}
                data-testid={`card-repo-${repo.name}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img 
                        src={repo.owner.avatar_url} 
                        alt={repo.owner.login}
                        className="h-6 w-6 rounded-full flex-shrink-0"
                      />
                      <CardTitle className="text-base truncate">{repo.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      {repo.private ? (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          {text.private}
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          {text.public}
                        </>
                      )}
                    </Badge>
                  </div>
                  {repo.description && (
                    <CardDescription className="line-clamp-2">{repo.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {repo.forks_count}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" className="gap-1" data-testid={`button-import-${repo.name}`}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]" dir={isRtl ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SiGithub className="h-5 w-5" />
                {selectedRepo?.full_name}
              </DialogTitle>
              <DialogDescription>
                {selectedRepo?.description || text.selectRepo}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1" data-testid="tab-details">
                  {text.repoDetails}
                </TabsTrigger>
                <TabsTrigger value="files" className="flex-1" data-testid="tab-files">
                  {text.filesPreview}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>{text.projectName}</Label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder={selectedRepo?.name}
                      data-testid="input-project-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{text.branch}</Label>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger data-testid="select-branch">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {branchesData?.branches?.map((branch) => (
                          <SelectItem key={branch.name} value={branch.name}>
                            <span className="flex items-center gap-2">
                              <GitBranch className="h-3 w-3" />
                              {branch.name}
                              {branch.protected && <Lock className="h-3 w-3 text-amber-500" />}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <span className="text-sm text-muted-foreground">{text.lastUpdate}</span>
                    <span className="text-sm">
                      {selectedRepo?.updated_at && new Date(selectedRepo.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="files" className="mt-4">
                {treeLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>{treeData?.filesCount} {text.files}</span>
                    </div>
                    <ScrollArea className="h-[300px] border rounded-md p-2">
                      {treeData?.files?.map((file, i) => (
                        <div 
                          key={i} 
                          className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded text-sm"
                        >
                          <FileCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{file.path}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {file.size ? `${(file.size / 1024).toFixed(1)}KB` : ''}
                          </span>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setPreviewOpen(false)} data-testid="button-cancel">
                {text.cancel}
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={importMutation.isPending}
                data-testid="button-confirm-import"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className={`h-4 w-4 animate-spin ${isRtl ? "ml-2" : "mr-2"}`} />
                    {text.importing}
                  </>
                ) : (
                  <>
                    <Download className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                    {text.confirmImport}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
