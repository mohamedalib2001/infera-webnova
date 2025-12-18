import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Play,
  Square,
  RotateCcw,
  Plus,
  Trash2,
  File,
  Folder,
  FolderOpen,
  Save,
  Terminal,
  Monitor,
  Code2,
  Settings,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Loader2,
  FileCode,
  FileJson,
  FileType,
  Sparkles,
  Globe,
  Download,
  Upload,
  Package,
  Rocket,
  GitBranch,
  GitCommit,
  ExternalLink,
  Search,
  X,
  Check,
} from "lucide-react";
import type { DevProject, ProjectFile, RuntimeInstance, ConsoleLog } from "@shared/schema";
import { SchemaBuilder } from "@/components/schema-builder";
import { Database } from "lucide-react";

interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  file?: ProjectFile;
}

export default function CloudIDE() {
  const { id: projectId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]));
  const [activeTab, setActiveTab] = useState<"preview" | "console" | "database" | "ai">("preview");
  const [showPackageManager, setShowPackageManager] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [packageSearch, setPackageSearch] = useState("");
  const [showGitDialog, setShowGitDialog] = useState(false);
  const [isInstallingPackage, setIsInstallingPackage] = useState(false);
  const [gitCommitMessage, setGitCommitMessage] = useState("");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<Array<{type: "input" | "output" | "error" | "system", content: string}>>([]);
  const [wsTerminal, setWsTerminal] = useState<WebSocket | null>(null);
  const [isTerminalConnected, setIsTerminalConnected] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{role: "user" | "assistant", content: string, timestamp: Date}>>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const t = {
    ar: {
      title: "بيئة التطوير السحابية",
      loading: "جاري التحميل...",
      noProject: "المشروع غير موجود",
      files: "الملفات",
      newFile: "ملف جديد",
      newFolder: "مجلد جديد",
      save: "حفظ",
      run: "تشغيل",
      stop: "إيقاف",
      restart: "إعادة تشغيل",
      preview: "المعاينة",
      console: "السجلات",
      editor: "المحرر",
      running: "يعمل",
      stopped: "متوقف",
      starting: "جاري البدء",
      noFileSelected: "اختر ملفاً للتحرير",
      unsavedChanges: "تغييرات غير محفوظة",
      saved: "تم الحفظ",
      back: "رجوع",
      settings: "الإعدادات",
      deploy: "نشر",
      aiAssist: "مساعد AI",
      clearLogs: "مسح السجلات",
      noLogs: "لا توجد سجلات",
      previewNotAvailable: "المعاينة غير متاحة - قم بتشغيل المشروع أولاً",
      packages: "الحزم",
      searchPackages: "ابحث عن حزمة...",
      install: "تثبيت",
      uninstall: "إزالة",
      installedPackages: "الحزم المثبتة",
      noPackagesFound: "لم يتم العثور على حزم",
      packageManager: "مدير الحزم",
      deployProject: "نشر المشروع",
      deployDescription: "انشر مشروعك وشاركه مع العالم",
      deployNow: "انشر الآن",
      deploying: "جاري النشر...",
      deploySuccess: "تم النشر بنجاح!",
      projectUrl: "رابط المشروع",
      gitIntegration: "Git التكامل مع",
      commit: "إيداع",
      push: "رفع",
      pull: "سحب",
      commitMessage: "رسالة الإيداع",
      commitSuccess: "تم الإيداع بنجاح!",
      noChanges: "لا توجد تغييرات",
      terminal: "الطرفية",
      runCommand: "تشغيل أمر...",
    },
    en: {
      title: "Cloud IDE",
      loading: "Loading...",
      noProject: "Project not found",
      files: "Files",
      newFile: "New File",
      newFolder: "New Folder",
      save: "Save",
      run: "Run",
      stop: "Stop",
      restart: "Restart",
      preview: "Preview",
      console: "Console",
      editor: "Editor",
      running: "Running",
      stopped: "Stopped",
      starting: "Starting",
      noFileSelected: "Select a file to edit",
      unsavedChanges: "Unsaved changes",
      saved: "Saved",
      back: "Back",
      settings: "Settings",
      deploy: "Deploy",
      aiAssist: "AI Assist",
      clearLogs: "Clear Logs",
      noLogs: "No logs yet",
      previewNotAvailable: "Preview not available - run the project first",
      packages: "Packages",
      searchPackages: "Search packages...",
      install: "Install",
      uninstall: "Uninstall",
      installedPackages: "Installed Packages",
      noPackagesFound: "No packages found",
      packageManager: "Package Manager",
      deployProject: "Deploy Project",
      deployDescription: "Deploy your project and share it with the world",
      deployNow: "Deploy Now",
      deploying: "Deploying...",
      deploySuccess: "Deployed Successfully!",
      projectUrl: "Project URL",
      gitIntegration: "Git Integration",
      commit: "Commit",
      push: "Push",
      pull: "Pull",
      commitMessage: "Commit message",
      commitSuccess: "Committed successfully!",
      noChanges: "No changes",
      terminal: "Terminal",
      runCommand: "Run command...",
    },
  };

  const txt = t[language];

  // Sync files to disk before running
  const syncFilesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/dev-projects/${projectId}/sync`);
    },
    onSuccess: () => {
      setTerminalHistory(prev => [...prev, { type: "system", content: language === "ar" ? "تم مزامنة الملفات" : "Files synced to disk" }]);
    },
  });

  // Execute command via API
  const executeCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      return apiRequest("POST", `/api/dev-projects/${projectId}/execute`, { command });
    },
    onSuccess: (data: { stdout: string; stderr: string; code: number }) => {
      if (data.stdout) {
        setTerminalHistory(prev => [...prev, { type: "output", content: data.stdout }]);
      }
      if (data.stderr) {
        setTerminalHistory(prev => [...prev, { type: "error", content: data.stderr }]);
      }
    },
    onError: () => {
      setTerminalHistory(prev => [...prev, { type: "error", content: language === "ar" ? "فشل في تنفيذ الأمر" : "Command execution failed" }]);
    },
  });

  // Terminal command handler - now uses real execution
  const handleTerminalCommand = async (command: string) => {
    setTerminalHistory(prev => [...prev, { type: "input", content: `$ ${command}` }]);
    
    const cmd = command.trim().toLowerCase();
    
    if (cmd === "clear") {
      setTerminalHistory([]);
      return;
    }
    
    if (cmd === "help") {
      const helpText = language === "ar" 
        ? "الأوامر المتاحة:\n  ls - عرض الملفات\n  node <file> - تشغيل ملف Node.js\n  python <file> - تشغيل ملف Python\n  npm install - تثبيت الحزم\n  sync - مزامنة الملفات\n  clear - مسح الشاشة\n  help - هذه المساعدة"
        : "Available commands:\n  ls - list files\n  node <file> - run Node.js file\n  python <file> - run Python file\n  npm install - install packages\n  sync - sync files to disk\n  clear - clear screen\n  help - this help";
      setTerminalHistory(prev => [...prev, { type: "output", content: helpText }]);
      return;
    }
    
    if (cmd === "sync") {
      await syncFilesMutation.mutateAsync();
      return;
    }
    
    // Sync files before any command that might need them
    if (cmd.startsWith("node ") || cmd.startsWith("python ") || cmd.startsWith("npm ")) {
      await syncFilesMutation.mutateAsync();
    }
    
    // Execute real command
    executeCommandMutation.mutate(command);
  };

  // Fetch installed packages
  const { data: packagesData, isLoading: packagesLoading, refetch: refetchPackages } = useQuery<{
    dependencies: Array<{ name: string; version: string; isDev: boolean }>;
    devDependencies: Array<{ name: string; version: string; isDev: boolean }>;
  }>({
    queryKey: ["/api/dev-projects", projectId, "packages"],
    enabled: !!projectId,
  });

  const installedPackages = [
    ...(packagesData?.dependencies?.map(p => p.name) || []),
    ...(packagesData?.devDependencies?.map(p => p.name) || []),
  ];

  // Install package mutation
  const installPackageMutation = useMutation({
    mutationFn: async (packageName: string) => {
      return apiRequest("POST", `/api/dev-projects/${projectId}/packages/install`, { packageName });
    },
    onSuccess: (_, packageName) => {
      toast({ title: `${packageName} ${language === "ar" ? "تم تثبيته بنجاح" : "installed successfully"}` });
      refetchPackages();
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "packages"] });
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشل التثبيت" : "Install failed", variant: "destructive" });
    },
  });

  // Uninstall package mutation
  const uninstallPackageMutation = useMutation({
    mutationFn: async (packageName: string) => {
      return apiRequest("POST", `/api/dev-projects/${projectId}/packages/uninstall`, { packageName });
    },
    onSuccess: (_, packageName) => {
      toast({ title: `${packageName} ${language === "ar" ? "تمت إزالته" : "removed"}` });
      refetchPackages();
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "packages"] });
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشلت الإزالة" : "Uninstall failed", variant: "destructive" });
    },
  });

  // Fetch git status
  const { data: gitStatus, refetch: refetchGitStatus } = useQuery<{
    initialized: boolean;
    branch: string;
    files: Array<{ path: string; status: string }>;
    commitCount: number;
    hasChanges: boolean;
  }>({
    queryKey: ["/api/dev-projects", projectId, "git", "status"],
    enabled: !!projectId,
  });

  // Git commit mutation
  const gitCommitMutation = useMutation({
    mutationFn: async (message: string) => {
      await syncFilesMutation.mutateAsync();
      return apiRequest("POST", `/api/dev-projects/${projectId}/git/commit`, { message });
    },
    onSuccess: (data: { success: boolean; commitHash?: string }) => {
      toast({ 
        title: language === "ar" ? "تم الحفظ بنجاح" : "Committed successfully",
        description: data.commitHash ? `Commit: ${data.commitHash}` : undefined
      });
      setGitCommitMessage("");
      refetchGitStatus();
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشل الحفظ" : "Commit failed", variant: "destructive" });
    },
  });

  // Git init mutation
  const gitInitMutation = useMutation({
    mutationFn: async () => {
      await syncFilesMutation.mutateAsync();
      return apiRequest("POST", `/api/dev-projects/${projectId}/git/init`);
    },
    onSuccess: () => {
      toast({ title: language === "ar" ? "تم تهيئة Git" : "Git initialized" });
      refetchGitStatus();
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشل التهيئة" : "Init failed", variant: "destructive" });
    },
  });

  // Fetch deploy status
  const { data: deployStatus, refetch: refetchDeployStatus } = useQuery<{
    deployed: boolean;
    url: string | null;
    lastDeployed: string | null;
    version: number;
  }>({
    queryKey: ["/api/dev-projects", projectId, "deploy", "status"],
    enabled: !!projectId,
  });

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async () => {
      await syncFilesMutation.mutateAsync();
      return apiRequest("POST", `/api/dev-projects/${projectId}/deploy`);
    },
    onSuccess: (data: { success: boolean; url: string; version: number }) => {
      toast({ 
        title: language === "ar" ? "تم النشر بنجاح" : "Deployed successfully",
        description: `v${data.version} - ${data.url}`
      });
      refetchDeployStatus();
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشل النشر" : "Deployment failed", variant: "destructive" });
    },
  });

  // Fetch project
  const { data: project, isLoading: projectLoading } = useQuery<DevProject>({
    queryKey: ["/api/dev-projects", projectId],
    enabled: !!projectId,
  });

  // Fetch files
  const { data: files = [], isLoading: filesLoading } = useQuery<ProjectFile[]>({
    queryKey: ["/api/dev-projects", projectId, "files"],
    enabled: !!projectId,
  });

  // Fetch runtime status
  const { data: runtime } = useQuery<RuntimeInstance>({
    queryKey: ["/api/dev-projects", projectId, "runtime"],
    enabled: !!projectId,
    refetchInterval: 2000,
  });

  // Fetch console logs
  const { data: logs = [] } = useQuery<ConsoleLog[]>({
    queryKey: ["/api/dev-projects", projectId, "logs"],
    enabled: !!projectId,
    refetchInterval: 1000,
  });

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: string; content: string }) => {
      return apiRequest("PATCH", `/api/dev-projects/${projectId}/files/${fileId}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "files"] });
      setHasUnsavedChanges(false);
      toast({ title: txt.saved });
    },
  });

  // Create file mutation
  const createFileMutation = useMutation({
    mutationFn: async (data: { fileName: string; filePath: string; isDirectory: boolean }) => {
      return apiRequest("POST", `/api/dev-projects/${projectId}/files`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "files"] });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return apiRequest("DELETE", `/api/dev-projects/${projectId}/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "files"] });
      if (selectedFile) setSelectedFile(null);
    },
  });

  // Runtime mutations
  const startRuntimeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/dev-projects/${projectId}/runtime/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "runtime"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "logs"] });
    },
  });

  const stopRuntimeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/dev-projects/${projectId}/runtime/stop`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "runtime"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "logs"] });
    },
  });

  const restartRuntimeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/dev-projects/${projectId}/runtime/restart`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "runtime"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "logs"] });
    },
  });

  const clearLogsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/dev-projects/${projectId}/logs`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects", projectId, "logs"] });
    },
  });

  // Build file tree from flat list
  const buildFileTree = useCallback((files: ProjectFile[]): FileTreeNode[] => {
    const root: FileTreeNode[] = [];
    const folderMap = new Map<string, FileTreeNode>();

    // Sort files so directories come first
    const sortedFiles = [...files].sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.filePath.localeCompare(b.filePath);
    });

    sortedFiles.forEach((file) => {
      const parts = file.filePath.split("/").filter(Boolean);
      let currentPath = "";
      let currentLevel = root;

      parts.forEach((part, index) => {
        currentPath += "/" + part;
        const isLast = index === parts.length - 1;

        if (isLast) {
          currentLevel.push({
            id: file.id,
            name: file.fileName,
            path: file.filePath,
            type: file.isDirectory ? "folder" : "file",
            file: file,
          });
        } else {
          let folder = folderMap.get(currentPath);
          if (!folder) {
            folder = {
              id: currentPath,
              name: part,
              path: currentPath,
              type: "folder",
              children: [],
            };
            folderMap.set(currentPath, folder);
            currentLevel.push(folder);
          }
          currentLevel = folder.children!;
        }
      });
    });

    return root;
  }, []);

  const fileTree = buildFileTree(files);

  const handleFileSelect = (file: ProjectFile) => {
    if (hasUnsavedChanges && selectedFile) {
      // Auto-save before switching
      saveFileMutation.mutate({ fileId: selectedFile.id, content: editorContent });
    }
    setSelectedFile(file);
    setEditorContent(file.content);
    setHasUnsavedChanges(false);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value);
      setHasUnsavedChanges(value !== selectedFile?.content);
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      saveFileMutation.mutate({ fileId: selectedFile.id, content: editorContent });
    }
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFile, editorContent]);

  const getEditorLanguage = (fileType: string): string => {
    const languageMap: Record<string, string> = {
      javascript: "javascript",
      typescript: "typescript",
      python: "python",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      markdown: "markdown",
      sql: "sql",
      shell: "shell",
      yaml: "yaml",
    };
    return languageMap[fileType] || "plaintext";
  };

  const getFileIcon = (file: ProjectFile) => {
    if (file.isDirectory) {
      return expandedFolders.has(file.filePath) ? (
        <FolderOpen className="w-4 h-4 text-yellow-500" />
      ) : (
        <Folder className="w-4 h-4 text-yellow-500" />
      );
    }
    switch (file.fileType) {
      case "javascript":
      case "typescript":
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case "json":
        return <FileJson className="w-4 h-4 text-green-400" />;
      case "html":
        return <FileType className="w-4 h-4 text-orange-400" />;
      case "css":
      case "scss":
        return <FileType className="w-4 h-4 text-blue-400" />;
      default:
        return <File className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderFileTree = (nodes: FileTreeNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.id} style={{ paddingRight: `${depth * 12}px` }}>
        <div
          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover-elevate ${
            selectedFile?.id === node.id ? "bg-accent" : ""
          }`}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.path);
            } else if (node.file) {
              handleFileSelect(node.file);
            }
          }}
          data-testid={`file-tree-item-${node.id}`}
        >
          {node.type === "folder" && (
            <span className="w-4">
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </span>
          )}
          {node.type === "folder" ? (
            expandedFolders.has(node.path) ? (
              <FolderOpen className="w-4 h-4 text-yellow-500" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-500" />
            )
          ) : node.file ? (
            getFileIcon(node.file)
          ) : (
            <File className="w-4 h-4" />
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {node.type === "folder" && node.children && expandedFolders.has(node.path) && (
          <div>{renderFileTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const getRuntimeStatusColor = () => {
    switch (runtime?.status) {
      case "running":
        return "status-running";
      case "starting":
        return "status-starting";
      case "stopping":
        return "bg-orange-500";
      case "error":
        return "bg-red-500";
      default:
        return "status-stopped";
    }
  };

  const getRuntimeStatusText = () => {
    switch (runtime?.status) {
      case "running":
        return txt.running;
      case "starting":
        return txt.starting;
      default:
        return txt.stopped;
    }
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="mr-2">{txt.loading}</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">{txt.noProject}</p>
        <Button onClick={() => setLocation("/ide")} data-testid="button-back-to-projects">
          <ArrowLeft className="w-4 h-4 ml-2" />
          {txt.back}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background gradient-mesh" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Premium Header */}
      <header className="ide-header flex items-center justify-between gap-4 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/ide")}
            className="rounded-lg"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">{project.name}</h1>
              <p className="text-xs text-muted-foreground">{project.projectType}</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1.5 px-3 py-1 rounded-full glass">
            <span className={`w-2 h-2 rounded-full ${getRuntimeStatusColor()}`} />
            <span className="text-xs font-medium">{getRuntimeStatusText()}</span>
          </Badge>
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs rounded-full animate-pulse">
              {txt.unsavedChanges}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Runtime Controls */}
          {runtime?.status === "running" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => stopRuntimeMutation.mutate()}
                disabled={stopRuntimeMutation.isPending}
                data-testid="button-stop"
              >
                <Square className="w-4 h-4 ml-1" />
                {txt.stop}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => restartRuntimeMutation.mutate()}
                disabled={restartRuntimeMutation.isPending}
                data-testid="button-restart"
              >
                <RotateCcw className="w-4 h-4 ml-1" />
                {txt.restart}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => startRuntimeMutation.mutate()}
              disabled={startRuntimeMutation.isPending || runtime?.status === "starting"}
              data-testid="button-run"
            >
              {startRuntimeMutation.isPending || runtime?.status === "starting" ? (
                <Loader2 className="w-4 h-4 ml-1 animate-spin" />
              ) : (
                <Play className="w-4 h-4 ml-1" />
              )}
              {txt.run}
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleSave} disabled={!hasUnsavedChanges} data-testid="button-save">
            <Save className="w-4 h-4 ml-1" />
            {txt.save}
          </Button>

          {/* Package Manager */}
          <Dialog open={showPackageManager} onOpenChange={setShowPackageManager}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-lg" data-testid="button-packages">
                <Package className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg glass" dir={language === "ar" ? "rtl" : "ltr"}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {txt.packageManager}
                </DialogTitle>
                <DialogDescription>{txt.installedPackages}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={txt.searchPackages}
                    value={packageSearch}
                    onChange={(e) => setPackageSearch(e.target.value)}
                    className="pr-10 rounded-lg"
                    data-testid="input-package-search"
                  />
                </div>
                <ScrollArea className="h-72 premium-scrollbar">
                  <div className="space-y-2">
                    {packagesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : installedPackages
                      .filter(pkg => pkg.toLowerCase().includes(packageSearch.toLowerCase()))
                      .map((pkg) => (
                        <div key={pkg} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-mono text-sm font-medium">{pkg}</span>
                              <p className="text-xs text-muted-foreground">
                                {language === "ar" ? "مثبت" : "Installed"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive rounded-lg"
                            disabled={uninstallPackageMutation.isPending}
                            onClick={() => uninstallPackageMutation.mutate(pkg)}
                            data-testid={`button-uninstall-${pkg}`}
                          >
                            {uninstallPackageMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    {packageSearch && !installedPackages.includes(packageSearch) && (
                      <Button
                        className="w-full rounded-lg gap-2"
                        disabled={installPackageMutation.isPending}
                        onClick={() => {
                          toast({ title: language === "ar" ? `جاري تثبيت ${packageSearch}...` : `Installing ${packageSearch}...` });
                          installPackageMutation.mutate(packageSearch);
                          setPackageSearch("");
                        }}
                        data-testid="button-install-package"
                      >
                        {installPackageMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        {txt.install} {packageSearch}
                      </Button>
                    )}
                    {installedPackages.length === 0 && !packageSearch && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">
                          {language === "ar" ? "لا توجد حزم مثبتة" : "No packages installed"}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>

          {/* Premium Deploy Dialog */}
          <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-lg bg-gradient-to-r from-primary to-purple-600 gap-2" data-testid="button-deploy">
                <Rocket className="w-4 h-4" />
                {txt.deploy}
                {deployStatus?.deployed && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    v{deployStatus.version}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md glass" dir={language === "ar" ? "rtl" : "ltr"}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary" />
                  {txt.deployProject}
                </DialogTitle>
                <DialogDescription>{txt.deployDescription}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {deployStatus?.deployed && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">
                        {language === "ar" ? "تم النشر" : "Deployed"}
                      </span>
                      <Badge variant="outline" className="text-green-500 border-green-500/30">
                        v{deployStatus.version}
                      </Badge>
                    </div>
                    <a 
                      href={deployStatus.url || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {deployStatus.url}
                    </a>
                    {deployStatus.lastDeployed && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === "ar" ? "آخر نشر:" : "Last deployed:"} {new Date(deployStatus.lastDeployed).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-purple-600/10 border border-primary/20 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center ${deployMutation.isPending ? "animate-bounce" : ""}`}>
                    {deployMutation.isPending ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Rocket className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    {deployMutation.isPending 
                      ? (language === "ar" ? "جاري النشر..." : "Deploying...")
                      : (language === "ar" 
                          ? "سيتم نشر مشروعك على رابط فريد خلال ثوانٍ"
                          : "Your project will be deployed to a unique URL in seconds")}
                  </p>
                  <Button
                    className="w-full rounded-lg bg-gradient-to-r from-primary to-purple-600 gap-2"
                    onClick={() => deployMutation.mutate()}
                    disabled={deployMutation.isPending}
                    data-testid="button-deploy-now"
                  >
                    {deployMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Rocket className="w-4 h-4" />
                    )}
                    {deployStatus?.deployed 
                      ? (language === "ar" ? "تحديث النشر" : "Update Deployment")
                      : txt.deployNow}
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <code className="text-xs text-muted-foreground">
                    {deployStatus?.url || `https://${project?.name?.toLowerCase().replace(/[^a-z0-9]/g, "-")}.infera.app`}
                  </code>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Premium Git Integration */}
          <Dialog open={showGitDialog} onOpenChange={setShowGitDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-lg" data-testid="button-git">
                <GitBranch className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg glass" dir={language === "ar" ? "rtl" : "ltr"}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  {txt.gitIntegration}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  {gitStatus?.initialized ? (
                    <>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {gitStatus.branch || "main"}
                      </span>
                      <span className="text-muted-foreground">
                        {gitStatus.commitCount} {language === "ar" ? "حفظات" : "commits"}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      {language === "ar" ? "Git غير مهيأ" : "Git not initialized"}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {!gitStatus?.initialized && (
                  <Button
                    className="w-full rounded-lg gap-2"
                    onClick={() => gitInitMutation.mutate()}
                    disabled={gitInitMutation.isPending}
                    data-testid="button-git-init"
                  >
                    {gitInitMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <GitBranch className="w-4 h-4" />
                    )}
                    {language === "ar" ? "تهيئة Git" : "Initialize Git"}
                  </Button>
                )}
                
                {gitStatus?.initialized && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{txt.commitMessage}</label>
                      <Input
                        placeholder={language === "ar" ? "وصف التغييرات..." : "Describe your changes..."}
                        value={gitCommitMessage}
                        onChange={(e) => setGitCommitMessage(e.target.value)}
                        className="rounded-lg"
                        data-testid="input-commit-message"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 rounded-lg gap-2"
                        onClick={() => gitCommitMutation.mutate(gitCommitMessage)}
                        disabled={!gitCommitMessage || gitCommitMutation.isPending}
                        data-testid="button-commit"
                      >
                        {gitCommitMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <GitCommit className="w-4 h-4" />
                        )}
                        {txt.commit}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-lg gap-2"
                        onClick={() => toast({ title: language === "ar" ? "يتطلب ربط GitHub" : "Requires GitHub connection" })}
                        data-testid="button-push"
                      >
                        <Upload className="w-4 h-4" />
                        {txt.push}
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-lg gap-2"
                        onClick={() => toast({ title: language === "ar" ? "يتطلب ربط GitHub" : "Requires GitHub connection" })}
                        data-testid="button-pull"
                      >
                        <Download className="w-4 h-4" />
                        {txt.pull}
                      </Button>
                    </div>
                    
                    {/* Git Status */}
                    <div className="p-4 rounded-lg bg-[#0d1117] border border-[#30363d] font-mono text-xs space-y-2">
                      {gitStatus.hasChanges && gitStatus.files.length > 0 ? (
                        <>
                          <div className="flex items-center gap-2 text-yellow-400">
                            <span className="w-3 h-3 flex items-center justify-center">
                              {gitStatus.files.length}
                            </span>
                            <span>
                              {language === "ar" 
                                ? `${gitStatus.files.length} ملفات متغيرة` 
                                : `${gitStatus.files.length} files changed`}
                            </span>
                          </div>
                          <ScrollArea className="max-h-24">
                            {gitStatus.files.slice(0, 10).map((file, i) => (
                              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                <span className={
                                  file.status === "modified" ? "text-yellow-400" :
                                  file.status === "added" || file.status === "untracked" ? "text-green-400" :
                                  file.status === "deleted" ? "text-red-400" : ""
                                }>
                                  {file.status === "modified" ? "M" :
                                   file.status === "added" || file.status === "untracked" ? "+" :
                                   file.status === "deleted" ? "-" : "?"}
                                </span>
                                <span className="truncate">{file.path}</span>
                              </div>
                            ))}
                          </ScrollArea>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400">
                          <Check className="w-3 h-3" />
                          <span>{language === "ar" ? "لا توجد تغييرات" : "No changes"}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground border-t border-[#30363d] pt-2 mt-2">
                        <GitCommit className="w-3 h-3" />
                        <span>
                          {gitStatus.commitCount > 0 
                            ? `${gitStatus.commitCount} ${language === "ar" ? "حفظات" : "commits"}`
                            : language === "ar" ? "لا توجد حفظات بعد" : "No commits yet"}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="icon" onClick={() => setLanguage(language === "ar" ? "en" : "ar")} data-testid="button-language">
            <Globe className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Premium File Tree Sidebar */}
        <aside className="w-64 border-l bg-card/50 glass flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">{txt.files}</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => {
                  const name = prompt(language === "ar" ? "اسم الملف:" : "File name:");
                  if (name) {
                    createFileMutation.mutate({
                      fileName: name,
                      filePath: "/" + name,
                      isDirectory: false,
                    });
                  }
                }}
                data-testid="button-new-file"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-2 premium-scrollbar">
            {filesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="animate-slide-in">
                {renderFileTree(fileTree)}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Premium Editor */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
          {selectedFile ? (
            <div className="flex-1 overflow-hidden editor-container">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
                <FileCode className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-300">{selectedFile.fileName}</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  {selectedFile.fileType}
                </Badge>
              </div>
              <Editor
                height="calc(100% - 40px)"
                language={getEditorLanguage(selectedFile.fileType)}
                value={editorContent}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true, scale: 0.8 },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  wordWrap: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  renderLineHighlight: "all",
                  bracketPairColorization: { enabled: true },
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground gradient-glow">
              <div className="text-center animate-fade-scale">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                  <Code2 className="w-10 h-10 text-primary/50" />
                </div>
                <p className="text-lg font-medium mb-2">{txt.noFileSelected}</p>
                <p className="text-sm text-muted-foreground/60">
                  {language === "ar" ? "اختر ملفاً من القائمة للبدء" : "Select a file from the sidebar to begin"}
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Premium Preview / Console Panel */}
        <aside className="w-[420px] border-r flex flex-col bg-card/50 glass">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "console" | "database" | "ai")} className="flex flex-col h-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent p-0 gap-0">
              <TabsTrigger
                value="preview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-3 transition-all"
                data-testid="tab-preview"
              >
                <Monitor className="w-4 h-4 ml-1" />
                {txt.preview}
              </TabsTrigger>
              <TabsTrigger
                value="console"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-3 transition-all"
                data-testid="tab-console"
              >
                <Terminal className="w-4 h-4 ml-1" />
                {txt.console}
              </TabsTrigger>
              <TabsTrigger
                value="database"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-4 py-3 transition-all"
                data-testid="tab-database"
              >
                <Database className="w-4 h-4 ml-1" />
                {language === "ar" ? "قاعدة البيانات" : "Database"}
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3 transition-all bg-gradient-to-r from-purple-500/5 to-blue-500/5 data-[state=active]:from-purple-500/10 data-[state=active]:to-blue-500/10"
                data-testid="tab-ai"
              >
                <Sparkles className="w-4 h-4 ml-1 text-purple-500" />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">
                  {language === "ar" ? "مساعد AI" : "AI Assistant"}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
              {runtime?.status === "running" || runtime?.status === "starting" ? (
                <iframe
                  src={`/api/dev-projects/${projectId}/preview?lang=${language}`}
                  className="w-full h-full border-0 bg-white dark:bg-slate-900"
                  title="Preview"
                  key={`${runtime?.status}-${language}`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm text-center p-4 gap-4">
                  <Monitor className="w-12 h-12 opacity-30" />
                  <p>{txt.previewNotAvailable}</p>
                  <Button
                    size="sm"
                    onClick={() => startRuntimeMutation.mutate()}
                    disabled={startRuntimeMutation.isPending}
                    data-testid="button-start-preview"
                  >
                    <Play className="w-4 h-4 ml-1" />
                    {txt.run}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="console" className="flex-1 m-0 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-xs text-muted-foreground">{txt.terminal}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    clearLogsMutation.mutate();
                    setTerminalHistory([]);
                  }}
                  data-testid="button-clear-logs"
                >
                  <Trash2 className="w-3 h-3 ml-1" />
                  {txt.clearLogs}
                </Button>
              </div>
              <ScrollArea className="flex-1 bg-[#0d1117]">
                <div className="p-3 font-mono text-xs text-green-400 min-h-full">
                  {/* Server logs */}
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`py-0.5 ${
                        log.logType === "stderr"
                          ? "text-red-400"
                          : log.logType === "system"
                          ? "text-blue-400"
                          : "text-gray-300"
                      }`}
                    >
                      {log.content}
                    </div>
                  ))}
                  {/* Terminal history */}
                  {terminalHistory.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`py-0.5 whitespace-pre-wrap ${
                        entry.type === "input" 
                          ? "text-cyan-400" 
                          : entry.type === "error"
                          ? "text-red-400"
                          : entry.type === "system"
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      {entry.content}
                    </div>
                  ))}
                  {(logs.length === 0 && terminalHistory.length === 0) && (
                    <div className="text-gray-500">
                      {language === "ar" ? "جاهز للأوامر. اكتب 'help' للمساعدة." : "Ready for commands. Type 'help' for help."}
                    </div>
                  )}
                </div>
              </ScrollArea>
              {/* Terminal input */}
              <div className="flex items-center gap-2 p-2 border-t bg-[#0d1117]">
                <span className="text-green-400 font-mono text-sm">$</span>
                <Input
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && terminalInput.trim()) {
                      handleTerminalCommand(terminalInput);
                      setTerminalInput("");
                    }
                  }}
                  placeholder={txt.runCommand}
                  className="flex-1 bg-transparent border-0 text-green-400 font-mono text-sm focus-visible:ring-0 placeholder:text-gray-600"
                  data-testid="input-terminal"
                />
              </div>
            </TabsContent>

            <TabsContent value="database" className="flex-1 m-0 overflow-hidden">
              {projectId && (
                <SchemaBuilder projectId={projectId} language={language} />
              )}
            </TabsContent>

            <TabsContent value="ai" className="flex-1 m-0 flex flex-col overflow-hidden">
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-3 border-b bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">
                        {language === "ar" ? "مساعد INFERA AI" : "INFERA AI Assistant"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {language === "ar" ? "مدعوم بـ Claude" : "Powered by Claude"}
                      </p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  {aiMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-purple-500" />
                      </div>
                      <h4 className="font-semibold mb-2">
                        {language === "ar" ? "كيف يمكنني مساعدتك؟" : "How can I help you?"}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                        {language === "ar" 
                          ? "اسألني عن أي شيء متعلق بالبرمجة، أو اطلب مني كتابة كود"
                          : "Ask me anything about coding, or request me to write code"}
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                        {[
                          { ar: "اكتب دالة API", en: "Write an API endpoint" },
                          { ar: "اشرح هذا الكود", en: "Explain this code" },
                          { ar: "أصلح الأخطاء", en: "Fix bugs" },
                          { ar: "حسّن الأداء", en: "Optimize performance" },
                        ].map((item, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setAiPrompt(language === "ar" ? item.ar : item.en)}
                            data-testid={`button-ai-suggestion-${idx}`}
                          >
                            {language === "ar" ? item.ar : item.en}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-xs opacity-60 mt-1">
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isAiGenerating && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-2xl px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                              <span className="text-sm text-muted-foreground">
                                {language === "ar" ? "جاري التفكير..." : "Thinking..."}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                <div className="p-3 border-t bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                  <div className="flex gap-2">
                    <Input
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={language === "ar" ? "اكتب رسالتك هنا..." : "Type your message..."}
                      className="flex-1"
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && aiPrompt.trim() && !isAiGenerating) {
                          const userMessage = aiPrompt.trim();
                          setAiPrompt("");
                          setAiMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
                          setIsAiGenerating(true);
                          
                          try {
                            const response = await apiRequest("POST", `/api/dev-projects/${projectId}/ai/assist`, {
                              prompt: userMessage,
                              context: selectedFile ? { fileName: selectedFile.fileName, content: editorContent } : null,
                              language
                            });
                            const data = await response.json();
                            setAiMessages(prev => [...prev, { 
                              role: "assistant", 
                              content: data.response || data.message || (language === "ar" ? "تم بنجاح" : "Done successfully"),
                              timestamp: new Date() 
                            }]);
                          } catch (error) {
                            setAiMessages(prev => [...prev, { 
                              role: "assistant", 
                              content: language === "ar" ? "حدث خطأ. حاول مرة أخرى." : "An error occurred. Please try again.",
                              timestamp: new Date() 
                            }]);
                          } finally {
                            setIsAiGenerating(false);
                          }
                        }
                      }}
                      disabled={isAiGenerating}
                      data-testid="input-ai-prompt"
                    />
                    <Button
                      size="icon"
                      disabled={!aiPrompt.trim() || isAiGenerating}
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                      onClick={async () => {
                        if (aiPrompt.trim() && !isAiGenerating) {
                          const userMessage = aiPrompt.trim();
                          setAiPrompt("");
                          setAiMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
                          setIsAiGenerating(true);
                          
                          try {
                            const response = await apiRequest("POST", `/api/dev-projects/${projectId}/ai/assist`, {
                              prompt: userMessage,
                              context: selectedFile ? { fileName: selectedFile.fileName, content: editorContent } : null,
                              language
                            });
                            const data = await response.json();
                            setAiMessages(prev => [...prev, { 
                              role: "assistant", 
                              content: data.response || data.message || (language === "ar" ? "تم بنجاح" : "Done successfully"),
                              timestamp: new Date() 
                            }]);
                          } catch (error) {
                            setAiMessages(prev => [...prev, { 
                              role: "assistant", 
                              content: language === "ar" ? "حدث خطأ. حاول مرة أخرى." : "An error occurred. Please try again.",
                              timestamp: new Date() 
                            }]);
                          } finally {
                            setIsAiGenerating(false);
                          }
                        }
                      }}
                      data-testid="button-ai-send"
                    >
                      {isAiGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
