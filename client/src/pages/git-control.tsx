import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  GitBranch, 
  GitCommit,
  GitPullRequest,
  GitMerge,
  GitCompare,
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
  FileWarning,
  Loader2,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Shield,
  ShieldAlert,
  Zap,
  Undo2,
  RotateCcw,
  Play,
  Pause,
  Lock,
  Unlock,
  Star,
  Trash2,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  Sparkles,
  Brain,
  FolderGit2,
  History,
  Workflow,
  Target,
  Settings,
  Info,
  Check,
  X,
  Diff,
  Merge,
  ChevronsUpDown
} from "lucide-react";

const translations = {
  ar: {
    title: "التحكم المتقدم بالإصدارات",
    subtitle: "نظام Git احترافي مع تحليل ذكي وإدارة بصرية شاملة",
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
    rebase: "إعادة البناء",
    cherryPick: "انتقاء التغيير",
    squash: "دمج وضغط",
    noChanges: "لا توجد تغييرات",
    staged: "جاهز للحفظ",
    unstaged: "غير جاهز",
    stageAll: "إضافة الكل",
    unstageAll: "إزالة الكل",
    history: "السجل",
    author: "الكاتب",
    date: "التاريخ",
    files: "الملفات",
    added: "مضاف",
    modified: "معدّل",
    deleted: "محذوف",
    success: "تمت العملية بنجاح!",
    error: "حدث خطأ",
    copied: "تم النسخ!",
    smartAnalysis: "التحليل الذكي",
    changeCategory: "تصنيف التغييرات",
    feature: "ميزة جديدة",
    bugfix: "إصلاح خطأ",
    refactor: "إعادة هيكلة",
    config: "تكوين",
    docs: "توثيق",
    style: "تنسيق",
    test: "اختبارات",
    riskyChanges: "تغييرات خطرة",
    riskLevel: "مستوى الخطورة",
    high: "عالي",
    medium: "متوسط",
    low: "منخفض",
    aiCommitMessage: "رسالة مقترحة بالذكاء الاصطناعي",
    generateMessage: "توليد رسالة",
    viewDiff: "عرض الفرق",
    hideDiff: "إخفاء الفرق",
    beforeAfter: "قبل / بعد",
    discardChanges: "تجاهل التغييرات",
    stageFile: "إضافة الملف",
    unstageFile: "إزالة الملف",
    conflicts: "التعارضات",
    resolveConflict: "حل التعارض",
    acceptOurs: "قبول نسختنا",
    acceptTheirs: "قبول نسختهم",
    manualEdit: "تعديل يدوي",
    branchGraph: "رسم الفروع",
    protectedBranch: "فرع محمي",
    quickActions: "إجراءات سريعة",
    workflows: "سير العمل",
    featureWorkflow: "ميزة جديدة",
    hotfixWorkflow: "إصلاح عاجل",
    releaseWorkflow: "إصدار جديد",
    startWorkflow: "بدء سير العمل",
    safetyChecks: "فحوصات الأمان",
    prePushValidation: "التحقق قبل الرفع",
    largeFiles: "ملفات كبيرة",
    secrets: "أسرار مكشوفة",
    forcePush: "رفع قسري",
    warning: "تحذير",
    backup: "نسخة احتياطية",
    rollback: "استرجاع",
    commitImpact: "تأثير التغيير",
    riskScore: "نقاط الخطورة",
    revertCommit: "التراجع عن التغيير",
    syncStatus: "حالة التزامن",
    ahead: "متقدم",
    behind: "متأخر",
    diverged: "متشعب",
    upToDate: "محدّث",
    selectProject: "اختر مشروعاً",
    noProjects: "لا توجد مشاريع",
    createProject: "أنشئ مشروعاً أولاً",
    refreshStatus: "تحديث الحالة",
    conventionalCommit: "التزام بالمعايير",
    commitType: "نوع التغيير",
    commitScope: "نطاق التغيير",
    breaking: "تغيير جذري",
    stashChanges: "حفظ مؤقت",
    applyStash: "تطبيق المحفوظ",
    viewHistory: "عرض السجل الكامل",
    filterByAuthor: "تصفية بالكاتب",
    filterByDate: "تصفية بالتاريخ",
    searchCommits: "البحث في التغييرات",
  },
  en: {
    title: "Advanced Version Control",
    subtitle: "Professional Git system with smart analysis and visual management",
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
    rebase: "Rebase",
    cherryPick: "Cherry Pick",
    squash: "Squash",
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
    copied: "Copied!",
    smartAnalysis: "Smart Analysis",
    changeCategory: "Change Category",
    feature: "Feature",
    bugfix: "Bugfix",
    refactor: "Refactor",
    config: "Config",
    docs: "Docs",
    style: "Style",
    test: "Test",
    riskyChanges: "Risky Changes",
    riskLevel: "Risk Level",
    high: "High",
    medium: "Medium",
    low: "Low",
    aiCommitMessage: "AI-Suggested Message",
    generateMessage: "Generate Message",
    viewDiff: "View Diff",
    hideDiff: "Hide Diff",
    beforeAfter: "Before / After",
    discardChanges: "Discard Changes",
    stageFile: "Stage File",
    unstageFile: "Unstage File",
    conflicts: "Conflicts",
    resolveConflict: "Resolve Conflict",
    acceptOurs: "Accept Ours",
    acceptTheirs: "Accept Theirs",
    manualEdit: "Manual Edit",
    branchGraph: "Branch Graph",
    protectedBranch: "Protected Branch",
    quickActions: "Quick Actions",
    workflows: "Workflows",
    featureWorkflow: "Feature",
    hotfixWorkflow: "Hotfix",
    releaseWorkflow: "Release",
    startWorkflow: "Start Workflow",
    safetyChecks: "Safety Checks",
    prePushValidation: "Pre-Push Validation",
    largeFiles: "Large Files",
    secrets: "Exposed Secrets",
    forcePush: "Force Push",
    warning: "Warning",
    backup: "Backup",
    rollback: "Rollback",
    commitImpact: "Commit Impact",
    riskScore: "Risk Score",
    revertCommit: "Revert Commit",
    syncStatus: "Sync Status",
    ahead: "Ahead",
    behind: "Behind",
    diverged: "Diverged",
    upToDate: "Up to Date",
    selectProject: "Select a project",
    noProjects: "No projects available",
    createProject: "Create a project first",
    refreshStatus: "Refresh Status",
    conventionalCommit: "Conventional Commit",
    commitType: "Type",
    commitScope: "Scope",
    breaking: "Breaking Change",
    stashChanges: "Stash Changes",
    applyStash: "Apply Stash",
    viewHistory: "View Full History",
    filterByAuthor: "Filter by Author",
    filterByDate: "Filter by Date",
    searchCommits: "Search Commits",
  }
};

interface GitBranchInfo {
  name: string;
  current: boolean;
  lastCommit?: string;
  lastCommitDate?: string;
  isProtected?: boolean;
  ahead?: number;
  behind?: number;
}

interface GitCommitInfo {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  email: string;
  date: string;
  files: number;
  additions: number;
  deletions: number;
  riskScore?: number;
  category?: string;
}

interface FileChange {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed" | "conflict";
  staged: boolean;
  category?: "feature" | "bugfix" | "refactor" | "config" | "docs" | "style" | "test";
  riskLevel?: "high" | "medium" | "low";
  diff?: string;
  additions?: number;
  deletions?: number;
}

interface GitState {
  isClean: boolean;
  hasConflicts: boolean;
  isMerging: boolean;
  isRebasing: boolean;
  ahead: number;
  behind: number;
  syncStatus: "ahead" | "behind" | "diverged" | "up-to-date";
}

interface SafetyCheck {
  type: "large-file" | "secret" | "force-push" | "protected-branch";
  message: string;
  severity: "error" | "warning" | "info";
  file?: string;
}

const COMMIT_TYPES = [
  { value: "feat", label: "feat", labelAr: "ميزة", icon: Sparkles, color: "text-green-500" },
  { value: "fix", label: "fix", labelAr: "إصلاح", icon: Zap, color: "text-red-500" },
  { value: "refactor", label: "refactor", labelAr: "إعادة هيكلة", icon: RefreshCw, color: "text-blue-500" },
  { value: "docs", label: "docs", labelAr: "توثيق", icon: FileText, color: "text-purple-500" },
  { value: "style", label: "style", labelAr: "تنسيق", icon: FileEdit, color: "text-pink-500" },
  { value: "test", label: "test", labelAr: "اختبار", icon: CheckCircle, color: "text-yellow-500" },
  { value: "chore", label: "chore", labelAr: "صيانة", icon: Settings, color: "text-gray-500" },
];

function DiffViewer({ diff, language }: { diff: string; language: string }) {
  const lines = diff.split("\n");
  
  return (
    <ScrollArea className="h-64 border rounded-lg bg-muted/30 font-mono text-xs">
      <div className="p-2">
        {lines.map((line, idx) => {
          let bgClass = "";
          let textClass = "";
          if (line.startsWith("+") && !line.startsWith("+++")) {
            bgClass = "bg-green-500/10";
            textClass = "text-green-600 dark:text-green-400";
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            bgClass = "bg-red-500/10";
            textClass = "text-red-600 dark:text-red-400";
          } else if (line.startsWith("@@")) {
            textClass = "text-blue-500";
          }
          return (
            <div key={idx} className={`${bgClass} ${textClass} px-2 py-0.5`}>
              {line || " "}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function BranchNode({ branch, current, isProtected, onClick }: { branch: string; current: boolean; isProtected?: boolean; onClick: () => void }) {
  return (
    <div 
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover-elevate ${current ? "bg-primary/10 border border-primary/30" : ""}`}
      onClick={onClick}
    >
      <GitBranch className={`h-4 w-4 ${current ? "text-primary" : "text-muted-foreground"}`} />
      <span className={current ? "font-medium" : ""}>{branch}</span>
      {current && <Badge variant="secondary" className="text-xs">Current</Badge>}
      {isProtected && <Lock className="h-3 w-3 text-amber-500" />}
    </div>
  );
}

function CommitGraph({ commits }: { commits: GitCommitInfo[] }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-muted-foreground/30" />
      {commits.slice(0, 10).map((commit, idx) => (
        <div key={commit.hash} className="relative flex items-start gap-3 pb-4">
          <div className={`absolute left-0 w-4 h-4 rounded-full border-2 ${idx === 0 ? "bg-primary border-primary" : "bg-background border-muted-foreground/50"}`} />
          <div className="flex-1 ml-4">
            <p className="text-sm font-medium truncate">{commit.message}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{commit.shortHash}</span>
              <span>{commit.author}</span>
              <span>{commit.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SafetyCheckItem({ check, language }: { check: SafetyCheck; language: string }) {
  const Icon = check.severity === "error" ? AlertCircle : check.severity === "warning" ? AlertTriangle : Info;
  const colorClass = check.severity === "error" ? "text-red-500 bg-red-500/10" : check.severity === "warning" ? "text-amber-500 bg-amber-500/10" : "text-blue-500 bg-blue-500/10";
  
  return (
    <div className={`flex items-start gap-2 p-2 rounded-lg ${colorClass}`}>
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium">{check.message}</p>
        {check.file && <p className="text-xs opacity-70">{check.file}</p>}
      </div>
    </div>
  );
}

export default function GitControl() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newBranchName, setNewBranchName] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [commitType, setCommitType] = useState("feat");
  const [commitScope, setCommitScope] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [selectedFileDiff, setSelectedFileDiff] = useState<FileChange | null>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("changes");
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [generatingMessage, setGeneratingMessage] = useState(false);

  const { data: projectsData, isLoading: projectsLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });
  const projects = Array.isArray(projectsData) ? projectsData : [];

  const { data: gitData, isLoading, refetch } = useQuery<{
    success: boolean;
    currentBranch: string;
    branches: GitBranchInfo[];
    commits: GitCommitInfo[];
    changes: FileChange[];
    state: GitState;
    safetyChecks: SafetyCheck[];
    categorizedChanges: Record<string, FileChange[]>;
    riskyChanges: FileChange[];
  }>({
    queryKey: ["/api/git/status", selectedProject],
    queryFn: async () => {
      const res = await fetch(`/api/git/status?projectId=${selectedProject}`);
      const data = await res.json();
      return data;
    },
    enabled: !!selectedProject,
    refetchInterval: 10000,
  });

  const categorizedChanges = gitData?.categorizedChanges || {};
  const riskyChanges = gitData?.riskyChanges || [];

  const generateAIMessage = useCallback(async () => {
    if (!gitData?.changes || gitData.changes.length === 0) return;
    setGeneratingMessage(true);
    try {
      const response = await apiRequest("POST", "/api/git/generate-commit-message", {
        projectId: selectedProject,
        changes: gitData.changes,
      });
      if (response?.message) {
        setCommitMessage(response.message);
      }
    } catch (error) {
      const categories = Object.entries(categorizedChanges)
        .filter(([_, files]) => files.length > 0)
        .map(([cat]) => cat);
      const mainCategory = categories[0] || "update";
      const fileCount = gitData.changes.length;
      setCommitMessage(`${commitType}${commitScope ? `(${commitScope})` : ""}: ${mainCategory} - ${fileCount} file(s) changed`);
    } finally {
      setGeneratingMessage(false);
    }
  }, [gitData?.changes, selectedProject, categorizedChanges, commitType, commitScope]);

  const conventionalMessage = useMemo(() => {
    const breaking = isBreaking ? "!" : "";
    const scope = commitScope ? `(${commitScope})` : "";
    return `${commitType}${scope}${breaking}: ${commitMessage}`;
  }, [commitType, commitScope, isBreaking, commitMessage]);

  const commitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/git/commit", { 
        projectId: selectedProject, 
        message: conventionalMessage,
        type: commitType,
        scope: commitScope,
        isBreaking,
      });
      if (!response?.success) throw new Error(response?.error || "Commit failed");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/git/status"] });
      setCommitMessage("");
      setCommitScope("");
      setIsBreaking(false);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/git/status"] });
      toast({ title: t.success });
    },
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

  const stageFileMutation = useMutation({
    mutationFn: async (filePath: string) => {
      const response = await apiRequest("POST", "/api/git/stage", { projectId: selectedProject, file: filePath });
      if (!response?.success) throw new Error(response?.error || "Stage failed");
      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/git/status"] }),
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

  const discardMutation = useMutation({
    mutationFn: async (filePath: string) => {
      const response = await apiRequest("POST", "/api/git/discard", { projectId: selectedProject, file: filePath });
      if (!response?.success) throw new Error(response?.error || "Discard failed");
      return response;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/git/status"] }),
    onError: (error: Error) => toast({ title: t.error, description: error.message, variant: "destructive" }),
  });

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({ title: t.copied });
  };

  const toggleFileExpand = (path: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const stagedChanges = gitData?.changes?.filter(c => c.staged) || [];
  const unstagedChanges = gitData?.changes?.filter(c => !c.staged) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "added": return <FilePlus className="h-4 w-4 text-green-500" />;
      case "modified": return <FileEdit className="h-4 w-4 text-yellow-500" />;
      case "deleted": return <FileMinus className="h-4 w-4 text-red-500" />;
      case "conflict": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getRiskBadge = (level?: string) => {
    if (!level) return null;
    const colors: Record<string, string> = {
      high: "bg-red-500/10 text-red-500",
      medium: "bg-amber-500/10 text-amber-500",
      low: "bg-green-500/10 text-green-500",
    };
    return (
      <Badge variant="outline" className={`text-xs ${colors[level] || ""}`}>
        {level === "high" ? <ShieldAlert className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
        {t[level as keyof typeof t] || level}
      </Badge>
    );
  };

  const getSyncStatusBadge = () => {
    if (!gitData?.state) return null;
    const { syncStatus, ahead, behind } = gitData.state;
    const configs: Record<string, { icon: typeof ArrowUp; color: string; label: string }> = {
      ahead: { icon: ArrowUp, color: "text-green-500", label: `${t.ahead} ${ahead}` },
      behind: { icon: ArrowDown, color: "text-amber-500", label: `${t.behind} ${behind}` },
      diverged: { icon: ArrowLeftRight, color: "text-red-500", label: `${t.diverged} (+${ahead}/-${behind})` },
      "up-to-date": { icon: CheckCircle, color: "text-green-500", label: t.upToDate },
    };
    const config = configs[syncStatus] || configs["up-to-date"];
    return (
      <Badge variant="outline" className={`${config.color}`}>
        <config.icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const startWorkflow = (type: string) => {
    setSelectedWorkflow(type);
    setShowWorkflowDialog(true);
  };

  const executeWorkflow = async () => {
    if (!selectedWorkflow) return;
    const prefixes: Record<string, string> = {
      feature: "feature/",
      hotfix: "hotfix/",
      release: "release/",
    };
    setNewBranchName(prefixes[selectedWorkflow] || "");
    setShowWorkflowDialog(false);
    setShowBranchDialog(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-git-title">
          <FolderGit2 className="h-8 w-8 text-orange-500" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="w-64">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger data-testid="select-git-project">
              <SelectValue placeholder={t.selectProject} />
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              <GitBranch className="h-3 w-3 mr-1" />
              {gitData.currentBranch}
            </Badge>
            {getSyncStatusBadge()}
          </div>
        )}

        <div className="flex-1" />

        <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-1" />
          {t.refreshStatus}
        </Button>
      </div>

      {projectsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <FolderGit2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">{t.noProjects}</p>
            <p className="text-sm text-muted-foreground">{t.createProject}</p>
          </CardContent>
        </Card>
      ) : !selectedProject ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <FolderGit2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t.selectProject}</p>
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    {t.workflows}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startWorkflow("feature")} data-testid="btn-feature-workflow">
                      <Sparkles className="h-4 w-4 mr-1" />
                      {t.featureWorkflow}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => startWorkflow("hotfix")} data-testid="btn-hotfix-workflow">
                      <Zap className="h-4 w-4 mr-1" />
                      {t.hotfixWorkflow}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => startWorkflow("release")} data-testid="btn-release-workflow">
                      <Target className="h-4 w-4 mr-1" />
                      {t.releaseWorkflow}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {gitData?.safetyChecks && gitData.safetyChecks.length > 0 && (
              <Card className="border-amber-500/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-amber-500">
                    <ShieldAlert className="h-5 w-5" />
                    {t.safetyChecks}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {gitData.safetyChecks.map((check, idx) => (
                    <SafetyCheckItem key={idx} check={check} language={language} />
                  ))}
                </CardContent>
              </Card>
            )}

            {riskyChanges.length > 0 && (
              <Card className="border-red-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                    {t.riskyChanges}
                  </CardTitle>
                  <CardDescription>
                    {language === "ar" ? "هذه الملفات تحتوي على تغييرات حساسة" : "These files contain sensitive changes"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {riskyChanges.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          <span className="text-sm">{file.path}</span>
                        </div>
                        {getRiskBadge(file.riskLevel)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t.changes}
                    {(stagedChanges.length + unstagedChanges.length) > 0 && (
                      <Badge variant="secondary">{stagedChanges.length + unstagedChanges.length}</Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => stageAllMutation.mutate()}
                      disabled={unstagedChanges.length === 0 || stageAllMutation.isPending}
                      data-testid="button-stage-all"
                    >
                      {stageAllMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
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
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">{t.staged} ({stagedChanges.length})</span>
                        </div>
                        <div className="space-y-1">
                          {stagedChanges.map((file, idx) => (
                            <div key={idx} className="group">
                              <div 
                                className="flex items-center justify-between p-2 rounded-lg hover-elevate cursor-pointer"
                                onClick={() => toggleFileExpand(file.path)}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {expandedFiles.has(file.path) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                  {getStatusIcon(file.status)}
                                  <span className="text-sm truncate">{file.path}</span>
                                  {file.riskLevel && file.riskLevel !== "low" && getRiskBadge(file.riskLevel)}
                                </div>
                                <div className="flex gap-1 visibility-hidden group-hover:visibility-visible">
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setSelectedFileDiff(file); setShowDiffDialog(true); }}>
                                    <Diff className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              {expandedFiles.has(file.path) && file.diff && (
                                <div className="ml-8 mt-2">
                                  <DiffViewer diff={file.diff} language={language} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {unstagedChanges.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium">{t.unstaged} ({unstagedChanges.length})</span>
                        </div>
                        <div className="space-y-1">
                          {unstagedChanges.map((file, idx) => (
                            <div key={idx} className="group">
                              <div className="flex items-center justify-between p-2 rounded-lg hover-elevate">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {getStatusIcon(file.status)}
                                  <span className="text-sm truncate">{file.path}</span>
                                  {file.riskLevel && file.riskLevel !== "low" && getRiskBadge(file.riskLevel)}
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7"
                                    onClick={() => stageFileMutation.mutate(file.path)}
                                    disabled={stageFileMutation.isPending}
                                    data-testid={`stage-${file.path}`}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-7 w-7 text-red-500"
                                    onClick={() => discardMutation.mutate(file.path)}
                                    disabled={discardMutation.isPending}
                                    data-testid={`discard-${file.path}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

              {stagedChanges.length > 0 && (
                <CardFooter className="flex-col gap-4 border-t pt-4">
                  <div className="w-full">
                    <Label className="mb-2 block">{t.conventionalCommit}</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {COMMIT_TYPES.map((type) => (
                        <Button
                          key={type.value}
                          size="sm"
                          variant={commitType === type.value ? "default" : "outline"}
                          onClick={() => setCommitType(type.value)}
                          className="gap-1"
                          data-testid={`commit-type-${type.value}`}
                        >
                          <type.icon className={`h-3 w-3 ${commitType !== type.value ? type.color : ""}`} />
                          {language === "ar" ? type.labelAr : type.label}
                        </Button>
                      ))}
                    </div>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder={t.commitScope}
                        value={commitScope}
                        onChange={(e) => setCommitScope(e.target.value)}
                        className="w-32"
                        data-testid="input-commit-scope"
                      />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isBreaking}
                          onCheckedChange={setIsBreaking}
                          data-testid="switch-breaking"
                        />
                        <Label className="text-sm">{t.breaking}</Label>
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex gap-2">
                    <Textarea
                      placeholder={t.commitMessage}
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      rows={2}
                      className="flex-1"
                      data-testid="textarea-commit-message"
                    />
                    <Button
                      variant="outline"
                      onClick={generateAIMessage}
                      disabled={generatingMessage}
                      className="shrink-0"
                      data-testid="button-ai-message"
                    >
                      {generatingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                    </Button>
                  </div>
                  {commitMessage && (
                    <div className="w-full p-2 rounded bg-muted text-sm font-mono">
                      {conventionalMessage}
                    </div>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => commitMutation.mutate()}
                    disabled={!commitMessage || commitMutation.isPending}
                    data-testid="button-commit"
                  >
                    {commitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitCommit className="h-4 w-4 mr-2" />}
                    {t.commit}
                  </Button>
                </CardFooter>
              )}
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    {t.history}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder={t.searchCommits}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 h-8"
                      data-testid="input-search-commits"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <CommitGraph commits={gitData?.commits || []} />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    {t.branches}
                  </CardTitle>
                  <Button size="icon" variant="ghost" onClick={() => setShowBranchDialog(true)} data-testid="button-new-branch">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-1">
                    {gitData?.branches?.map((branch) => (
                      <BranchNode
                        key={branch.name}
                        branch={branch.name}
                        current={branch.current}
                        isProtected={branch.isProtected}
                        onClick={() => {}}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {t.quickActions}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => pullMutation.mutate()}
                  disabled={pullMutation.isPending}
                  data-testid="button-pull"
                >
                  {pullMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  {t.pull}
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => pushMutation.mutate()}
                  disabled={pushMutation.isPending || (gitData?.state?.ahead === 0)}
                  data-testid="button-push"
                >
                  {pushMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {t.push}
                  {gitData?.state?.ahead ? <Badge variant="secondary" className="ml-auto">{gitData.state.ahead}</Badge> : null}
                </Button>
                <Separator />
                <Button className="w-full justify-start" variant="outline" onClick={() => setShowBranchDialog(true)}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  {t.newBranch}
                </Button>
                <Button className="w-full justify-start" variant="outline" disabled>
                  <GitMerge className="h-4 w-4 mr-2" />
                  {t.merge}
                </Button>
              </CardContent>
            </Card>

            {gitData?.state?.hasConflicts && (
              <Card className="border-red-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="h-5 w-5" />
                    {t.conflicts}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === "ar" ? "يجب حل التعارضات قبل المتابعة" : "Resolve conflicts before continuing"}
                  </p>
                  <Button className="w-full" variant="destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {t.resolveConflict}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {t.smartAnalysis}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(categorizedChanges).filter(([_, files]) => files.length > 0).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t.noChanges}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(categorizedChanges)
                      .filter(([_, files]) => files.length > 0)
                      .map(([category, files]) => (
                        <div key={category} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="text-sm capitalize">{t[category as keyof typeof t] || category}</span>
                          <Badge variant="secondary">{files.length}</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.newBranch}</DialogTitle>
            <DialogDescription>
              {language === "ar" ? "أدخل اسم الفرع الجديد" : "Enter the name of the new branch"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={language === "ar" ? "اسم الفرع" : "Branch name"}
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              data-testid="input-new-branch"
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
              {branchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitBranch className="h-4 w-4 mr-2" />}
              {t.createBranch}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.startWorkflow}</DialogTitle>
            <DialogDescription>
              {selectedWorkflow === "feature" && (language === "ar" ? "سيتم إنشاء فرع جديد للميزة" : "A new feature branch will be created")}
              {selectedWorkflow === "hotfix" && (language === "ar" ? "سيتم إنشاء فرع للإصلاح العاجل" : "A hotfix branch will be created")}
              {selectedWorkflow === "release" && (language === "ar" ? "سيتم إنشاء فرع للإصدار" : "A release branch will be created")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-3 mb-3">
                {selectedWorkflow === "feature" && <Sparkles className="h-5 w-5 text-green-500" />}
                {selectedWorkflow === "hotfix" && <Zap className="h-5 w-5 text-red-500" />}
                {selectedWorkflow === "release" && <Target className="h-5 w-5 text-blue-500" />}
                <span className="font-medium capitalize">{selectedWorkflow} Workflow</span>
              </div>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>{language === "ar" ? "إنشاء فرع من الفرع الرئيسي" : "Create branch from main"}</li>
                <li>{language === "ar" ? "تطوير وإضافة التغييرات" : "Develop and commit changes"}</li>
                <li>{language === "ar" ? "دمج الفرع عند الانتهاء" : "Merge branch when complete"}</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={executeWorkflow}>
              <Play className="h-4 w-4 mr-2" />
              {t.startWorkflow}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiffDialog} onOpenChange={setShowDiffDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Diff className="h-5 w-5" />
              {selectedFileDiff?.path}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedFileDiff?.diff ? (
              <DiffViewer diff={selectedFileDiff.diff} language={language} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {language === "ar" ? "لا يوجد فرق متاح" : "No diff available"}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiffDialog(false)}>
              {language === "ar" ? "إغلاق" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
