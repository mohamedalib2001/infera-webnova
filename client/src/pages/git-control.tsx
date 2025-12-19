import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  GitBranch, 
  GitCommit,
  GitPullRequest,
  GitMerge,
  Upload,
  Download,
  Plus,
  RefreshCw,
  Clock,
  User,
  FileText,
  FilePlus,
  FileMinus,
  FileEdit,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy
} from "lucide-react";

const translations = {
  ar: {
    title: "التحكم بالإصدارات",
    subtitle: "إدارة Git بواجهة مرئية سهلة الاستخدام",
    branches: "الفروع",
    commits: "التغييرات",
    changes: "الملفات المعدّلة",
    currentBranch: "الفرع الحالي",
    newBranch: "فرع جديد",
    createBranch: "إنشاء فرع",
    switchBranch: "تبديل الفرع",
    commit: "حفظ التغييرات",
    commitMessage: "رسالة الحفظ",
    push: "رفع",
    pull: "سحب",
    merge: "دمج",
    noChanges: "لا توجد تغييرات",
    staged: "جاهز للحفظ",
    unstaged: "غير جاهز",
    stageAll: "إضافة الكل",
    unstageAll: "إزالة الكل",
    history: "سجل التغييرات",
    author: "الكاتب",
    date: "التاريخ",
    files: "الملفات",
    added: "مضاف",
    modified: "معدّل",
    deleted: "محذوف",
    success: "تمت العملية بنجاح!",
    error: "حدث خطأ",
    copied: "تم النسخ!"
  },
  en: {
    title: "Version Control",
    subtitle: "Visual Git management interface",
    branches: "Branches",
    commits: "Commits",
    changes: "Changes",
    currentBranch: "Current Branch",
    newBranch: "New Branch",
    createBranch: "Create Branch",
    switchBranch: "Switch Branch",
    commit: "Commit",
    commitMessage: "Commit Message",
    push: "Push",
    pull: "Pull",
    merge: "Merge",
    noChanges: "No changes",
    staged: "Staged",
    unstaged: "Unstaged",
    stageAll: "Stage All",
    unstageAll: "Unstage All",
    history: "History",
    author: "Author",
    date: "Date",
    files: "Files",
    added: "Added",
    modified: "Modified",
    deleted: "Deleted",
    success: "Operation successful!",
    error: "An error occurred",
    copied: "Copied!"
  }
};

interface GitBranchInfo {
  name: string;
  current: boolean;
  lastCommit?: string;
  lastCommitDate?: string;
}

interface GitCommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: number;
}

interface FileChange {
  path: string;
  status: "added" | "modified" | "deleted";
  staged: boolean;
}

export default function GitControl() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newBranchName, setNewBranchName] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [showBranchDialog, setShowBranchDialog] = useState(false);

  const { data: projectsData, isLoading: projectsLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });
  const projects = Array.isArray(projectsData) ? projectsData : [];

  const { data: gitData, isLoading } = useQuery<{
    success: boolean;
    currentBranch: string;
    branches: GitBranchInfo[];
    commits: GitCommitInfo[];
    changes: FileChange[];
  }>({
    queryKey: ["/api/git/status", selectedProject],
    queryFn: async () => {
      const res = await fetch(`/api/git/status?projectId=${selectedProject}`);
      return res.json();
    },
    enabled: !!selectedProject,
  });

  const commitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/git/commit", { projectId: selectedProject, message: commitMessage });
      if (!response?.success) throw new Error(response?.error || "Commit failed");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/git/status"] });
      setCommitMessage("");
      toast({ title: t.success });
    },
    onError: (error: Error) => toast({ title: t.error, description: error.message, variant: "destructive" }),
  });

  const branchMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/git/branch", { projectId: selectedProject, name: newBranchName });
      if (!response?.success) throw new Error(response?.error || "Branch creation failed");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/git/status"] });
      setNewBranchName("");
      setShowBranchDialog(false);
      toast({ title: t.success });
    },
    onError: (error: Error) => toast({ title: t.error, description: error.message, variant: "destructive" }),
  });

  const pushMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/git/push", { projectId: selectedProject });
      if (!response?.success) throw new Error(response?.error || "Push failed");
      return response;
    },
    onSuccess: () => toast({ title: t.success }),
    onError: (error: Error) => toast({ title: t.error, description: error.message, variant: "destructive" }),
  });

  const pullMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/git/pull", { projectId: selectedProject });
      if (!response?.success) throw new Error(response?.error || "Pull failed");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/git/status"] });
      toast({ title: t.success });
    },
    onError: (error: Error) => toast({ title: t.error, description: error.message, variant: "destructive" }),
  });

  const stageAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/git/stage-all", { projectId: selectedProject });
      if (!response?.success) throw new Error(response?.error || "Stage failed");
      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/git/status"] }),
    onError: (error: Error) => toast({ title: t.error, description: error.message, variant: "destructive" }),
  });

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({ title: t.copied });
  };

  const stagedChanges = gitData?.changes?.filter(c => c.staged) || [];
  const unstagedChanges = gitData?.changes?.filter(c => !c.staged) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "added": return <FilePlus className="h-4 w-4 text-green-500" />;
      case "modified": return <FileEdit className="h-4 w-4 text-yellow-500" />;
      case "deleted": return <FileMinus className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-git-title">
          <GitBranch className="h-8 w-8 text-orange-500" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="w-64">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger data-testid="select-git-project">
              <SelectValue placeholder={language === "ar" ? "اختر مشروعاً" : "Select project"} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {gitData?.currentBranch && (
          <Badge variant="secondary" className="text-sm">
            <GitBranch className="h-3 w-3 mr-1" />
            {gitData.currentBranch}
          </Badge>
        )}
      </div>

      {projectsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <GitBranch className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              {language === "ar" ? "لا توجد مشاريع متاحة" : "No projects available"}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "ar" ? "قم بإنشاء مشروع أولاً من بيئة التطوير" : "Create a project first from the Development Environment"}
            </p>
          </CardContent>
        </Card>
      ) : !selectedProject ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <GitBranch className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === "ar" ? "اختر مشروعاً للبدء" : "Select a project to start"}
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t.changes}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => stageAllMutation.mutate()}
                      disabled={unstagedChanges.length === 0}
                      data-testid="button-stage-all"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t.stageAll}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {stagedChanges.length === 0 && unstagedChanges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>{t.noChanges}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stagedChanges.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {t.staged} ({stagedChanges.length})
                        </h4>
                        <div className="space-y-1">
                          {stagedChanges.map((change, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                              {getStatusIcon(change.status)}
                              <span className="flex-1 truncate">{change.path}</span>
                              <Badge variant="outline" className="text-xs">
                                {t[change.status as keyof typeof t]}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {unstagedChanges.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          {t.unstaged} ({unstagedChanges.length})
                        </h4>
                        <div className="space-y-1">
                          {unstagedChanges.map((change, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                              {getStatusIcon(change.status)}
                              <span className="flex-1 truncate">{change.path}</span>
                              <Badge variant="outline" className="text-xs">
                                {t[change.status as keyof typeof t]}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              {stagedChanges.length > 0 && (
                <CardFooter className="flex-col gap-3">
                  <div className="w-full">
                    <Label>{t.commitMessage}</Label>
                    <Textarea
                      placeholder={language === "ar" ? "صف التغييرات..." : "Describe your changes..."}
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      rows={2}
                      data-testid="textarea-commit-message"
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button
                      className="flex-1"
                      onClick={() => commitMutation.mutate()}
                      disabled={!commitMessage || commitMutation.isPending}
                      data-testid="button-commit"
                    >
                      {commitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitCommit className="h-4 w-4 mr-2" />}
                      {t.commit}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => pushMutation.mutate()}
                      disabled={pushMutation.isPending}
                      data-testid="button-push"
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      {t.push}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => pullMutation.mutate()}
                      disabled={pullMutation.isPending}
                      data-testid="button-pull"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {t.pull}
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t.history}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {(gitData?.commits || []).map((commit, idx) => (
                      <div key={idx} className="p-3 border rounded-lg" data-testid={`commit-${idx}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{commit.message}</p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {commit.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(commit.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {commit.files} {t.files}
                              </span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyHash(commit.hash)}
                            data-testid={`button-copy-hash-${idx}`}
                          >
                            <code className="text-xs text-muted-foreground mr-1">{commit.hash.slice(0, 7)}</code>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!gitData?.commits || gitData.commits.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <GitCommit className="h-12 w-12 mx-auto mb-4" />
                        <p>{language === "ar" ? "لا توجد تغييرات محفوظة" : "No commits yet"}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    {t.branches}
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowBranchDialog(true)}
                    data-testid="button-new-branch"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {(gitData?.branches || []).map((branch, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2 rounded-lg flex items-center justify-between ${branch.current ? "bg-primary/10 border border-primary/30" : "hover-elevate"}`}
                        data-testid={`branch-${idx}`}
                      >
                        <div className="flex items-center gap-2">
                          <GitBranch className={`h-4 w-4 ${branch.current ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={branch.current ? "font-medium" : ""}>{branch.name}</span>
                        </div>
                        {branch.current && (
                          <Badge variant="secondary" className="text-xs">
                            {t.currentBranch}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  {language === "ar" ? "إجراءات سريعة" : "Quick Actions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => pullMutation.mutate()}
                  disabled={pullMutation.isPending}
                  data-testid="button-quick-pull"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t.pull}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => pushMutation.mutate()}
                  disabled={pushMutation.isPending}
                  data-testid="button-quick-push"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t.push}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowBranchDialog(true)}
                  data-testid="button-quick-branch"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  {t.newBranch}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.newBranch}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>{language === "ar" ? "اسم الفرع" : "Branch Name"}</Label>
            <Input
              placeholder="feature/my-feature"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              data-testid="input-branch-name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBranchDialog(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={() => branchMutation.mutate()}
              disabled={!newBranchName || branchMutation.isPending}
              data-testid="button-create-branch"
            >
              {branchMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t.createBranch}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
