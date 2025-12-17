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
    },
  };

  const txt = t[language];

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
              {runtime?.status === "running" ? (
                <iframe
                  src={`http://localhost:${runtime.port || 3000}`}
                  className="w-full h-full border-0"
                  title="Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center p-4">
                  {txt.previewNotAvailable}
                </div>
              )}
            </TabsContent>

            <TabsContent value="console" className="flex-1 m-0 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-xs text-muted-foreground">{logs.length} logs</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => clearLogsMutation.mutate()}
                  data-testid="button-clear-logs"
                >
                  <Trash2 className="w-3 h-3 ml-1" />
                  {txt.clearLogs}
                </Button>
              </div>
              <ScrollArea className="flex-1 p-2">
                {logs.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">{txt.noLogs}</div>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className={`px-2 py-1 rounded ${
                          log.logType === "stderr"
                            ? "bg-red-500/10 text-red-400"
                            : log.logType === "system"
                            ? "bg-blue-500/10 text-blue-400"
                            : "text-foreground"
                        }`}
                      >
                        {log.content}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
