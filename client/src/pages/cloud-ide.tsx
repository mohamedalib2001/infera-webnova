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
  Package,
  Rocket,
  GitBranch,
  Search,
  X,
} from "lucide-react";
import type { DevProject, ProjectFile, RuntimeInstance, ConsoleLog } from "@shared/schema";

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
  const [activeTab, setActiveTab] = useState<"preview" | "console">("preview");
  const [showPackageManager, setShowPackageManager] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [packageSearch, setPackageSearch] = useState("");
  const [installedPackages, setInstalledPackages] = useState<string[]>(["express", "react", "lodash"]);
  const [showGitDialog, setShowGitDialog] = useState(false);
  const [gitCommitMessage, setGitCommitMessage] = useState("");
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<Array<{type: "input" | "output", content: string}>>([]);

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

  // Terminal command handler
  const handleTerminalCommand = (command: string) => {
    setTerminalHistory(prev => [...prev, { type: "input", content: `$ ${command}` }]);
    
    // Simulate command responses
    let output = "";
    const cmd = command.trim().toLowerCase();
    
    if (cmd === "ls" || cmd === "dir") {
      output = files.map(f => f.fileName).join("\n") || "No files";
    } else if (cmd === "pwd") {
      output = `/home/user/projects/${project?.name || "project"}`;
    } else if (cmd.startsWith("echo ")) {
      output = command.substring(5);
    } else if (cmd === "node --version") {
      output = "v20.10.0";
    } else if (cmd === "npm --version") {
      output = "10.2.3";
    } else if (cmd === "python --version") {
      output = "Python 3.11.6";
    } else if (cmd === "git status") {
      output = "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean";
    } else if (cmd === "npm install" || cmd === "npm i") {
      output = "added 0 packages, and audited 1 package in 1s\nfound 0 vulnerabilities";
    } else if (cmd === "clear") {
      setTerminalHistory([]);
      return;
    } else if (cmd === "help") {
      output = "Available commands:\n  ls, pwd, echo, node --version, npm --version, python --version, git status, npm install, clear, help";
    } else if (cmd) {
      output = `Command not found: ${command}`;
    }
    
    if (output) {
      setTerminalHistory(prev => [...prev, { type: "output", content: output }]);
    }
  };

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
        return "bg-green-500";
      case "starting":
        return "bg-yellow-500";
      case "stopping":
        return "bg-orange-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-muted-foreground";
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
    <div className="flex flex-col h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="flex items-center justify-between gap-4 px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/ide")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-semibold">{project.name}</h1>
            <p className="text-xs text-muted-foreground">{project.projectType}</p>
          </div>
          <Badge variant="outline" className="gap-1">
            <span className={`w-2 h-2 rounded-full ${getRuntimeStatusColor()}`} />
            {getRuntimeStatusText()}
          </Badge>
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs">
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
              <Button variant="outline" size="icon" data-testid="button-packages">
                <Package className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir={language === "ar" ? "rtl" : "ltr"}>
              <DialogHeader>
                <DialogTitle>{txt.packageManager}</DialogTitle>
                <DialogDescription>{txt.installedPackages}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={txt.searchPackages}
                    value={packageSearch}
                    onChange={(e) => setPackageSearch(e.target.value)}
                    className="pr-10"
                    data-testid="input-package-search"
                  />
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {installedPackages
                      .filter(pkg => pkg.toLowerCase().includes(packageSearch.toLowerCase()))
                      .map((pkg) => (
                        <div key={pkg} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{pkg}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-destructive"
                            onClick={() => {
                              setInstalledPackages(prev => prev.filter(p => p !== pkg));
                              toast({ title: `${pkg} ${language === "ar" ? "تمت إزالته" : "removed"}` });
                            }}
                            data-testid={`button-uninstall-${pkg}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    {packageSearch && !installedPackages.includes(packageSearch) && (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setInstalledPackages(prev => [...prev, packageSearch]);
                          toast({ title: `${packageSearch} ${language === "ar" ? "تم تثبيته" : "installed"}` });
                          setPackageSearch("");
                        }}
                        data-testid="button-install-package"
                      >
                        <Plus className="w-4 h-4 ml-1" />
                        {txt.install} {packageSearch}
                      </Button>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>

          {/* Deploy */}
          <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" data-testid="button-deploy">
                <Rocket className="w-4 h-4 ml-1" />
                {txt.deploy}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir={language === "ar" ? "rtl" : "ltr"}>
              <DialogHeader>
                <DialogTitle>{txt.deployProject}</DialogTitle>
                <DialogDescription>{txt.deployDescription}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Rocket className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === "ar" 
                      ? "سيتم نشر مشروعك على رابط فريد"
                      : "Your project will be deployed to a unique URL"}
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => {
                      toast({ 
                        title: txt.deploySuccess,
                        description: `https://${project?.name?.toLowerCase().replace(/\s/g, "-")}.infera.app`
                      });
                      setShowDeployDialog(false);
                    }}
                    data-testid="button-deploy-now"
                  >
                    <Rocket className="w-4 h-4 ml-1" />
                    {txt.deployNow}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {txt.projectUrl}: https://{project?.name?.toLowerCase().replace(/\s/g, "-")}.infera.app
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Git Integration */}
          <Dialog open={showGitDialog} onOpenChange={setShowGitDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" data-testid="button-git">
                <GitBranch className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir={language === "ar" ? "rtl" : "ltr"}>
              <DialogHeader>
                <DialogTitle>{txt.gitIntegration}</DialogTitle>
                <DialogDescription>main branch</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder={txt.commitMessage}
                  value={gitCommitMessage}
                  onChange={(e) => setGitCommitMessage(e.target.value)}
                  data-testid="input-commit-message"
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (gitCommitMessage) {
                        toast({ title: txt.commitSuccess, description: gitCommitMessage });
                        setGitCommitMessage("");
                      }
                    }}
                    disabled={!gitCommitMessage}
                    data-testid="button-commit"
                  >
                    {txt.commit}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast({ title: "Pushed to origin/main" })}
                    data-testid="button-push"
                  >
                    {txt.push}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast({ title: "Already up to date" })}
                    data-testid="button-pull"
                  >
                    {txt.pull}
                  </Button>
                </div>
                <div className="p-3 rounded-md bg-muted/50 font-mono text-xs">
                  <div className="text-green-500">+ 2 files changed</div>
                  <div className="text-muted-foreground">Last commit: Initial commit</div>
                </div>
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
        {/* File Tree Sidebar */}
        <aside className="w-60 border-l bg-card flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <span className="font-medium text-sm">{txt.files}</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
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
          <ScrollArea className="flex-1 p-2">
            {filesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              renderFileTree(fileTree)
            )}
          </ScrollArea>
        </aside>

        {/* Editor */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedFile ? (
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={getEditorLanguage(selectedFile.fileType)}
                value={editorContent}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 10 },
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Code2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>{txt.noFileSelected}</p>
              </div>
            </div>
          )}
        </main>

        {/* Preview / Console Panel */}
        <aside className="w-96 border-r flex flex-col bg-card">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "console")} className="flex flex-col h-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="preview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                data-testid="tab-preview"
              >
                <Monitor className="w-4 h-4 ml-1" />
                {txt.preview}
              </TabsTrigger>
              <TabsTrigger
                value="console"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                data-testid="tab-console"
              >
                <Terminal className="w-4 h-4 ml-1" />
                {txt.console}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
              {runtime?.status === "running" || runtime?.status === "starting" ? (
                <iframe
                  src={`/api/dev-projects/${projectId}/preview`}
                  className="w-full h-full border-0 bg-white"
                  title="Preview"
                  key={runtime?.status}
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
                        entry.type === "input" ? "text-cyan-400" : "text-gray-300"
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
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
