import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Folder, 
  File, 
  Plus, 
  Play, 
  Square, 
  Terminal as TerminalIcon,
  Code2,
  GitBranch,
  Settings,
  Save,
  RefreshCw,
  Trash2,
  FolderPlus,
  FilePlus,
  ChevronRight,
  ChevronDown,
  Bot,
  Zap,
  Shield,
  Server,
  Rocket,
  Bug,
  Search,
  MoreVertical,
  Copy,
  Download,
  Upload,
  Eye,
  Edit,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Command,
  Cpu,
  HardDrive,
  Activity,
  Clock,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FileNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface CommandResult {
  id: string;
  command: string;
  output: string;
  exitCode: number;
  timestamp: Date;
}

interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  status: string;
  settings: Record<string, unknown>;
}

export default function ISDSPage() {
  const { user } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [editorContent, setEditorContent] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<CommandResult[]>([]);
  const [commandInput, setCommandInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root"]));
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);

  if (!user || (user.role !== "owner" && user.role !== "sovereign")) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">
            {isRTL ? "الوصول مرفوض" : "Access Denied"}
          </h1>
          <p className="text-muted-foreground mb-4">
            {isRTL 
              ? "ISDS متاح فقط للحساب السيادي"
              : "ISDS is only available for sovereign accounts"}
          </p>
          <Button onClick={() => setLocation("/owner")} data-testid="button-go-back">
            {isRTL ? "العودة للوحة التحكم" : "Go to Dashboard"}
          </Button>
        </Card>
      </div>
    );
  }

  const { data: workspaces, isLoading: workspacesLoading } = useQuery<WorkspaceData[]>({
    queryKey: ["/api/owner/isds/workspaces"],
    enabled: !!user,
  });

  const { data: files, isLoading: filesLoading, refetch: refetchFiles } = useQuery<FileNode[]>({
    queryKey: ["/api/owner/isds/files", selectedWorkspace],
    enabled: !!selectedWorkspace,
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      return apiRequest("/api/owner/isds/workspaces", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/isds/workspaces"] });
      toast({
        title: isRTL ? "تم إنشاء مساحة العمل" : "Workspace Created",
        description: isRTL ? "تم إنشاء مساحة العمل بنجاح" : "Workspace created successfully",
      });
    },
  });

  const executeCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      return apiRequest("/api/owner/isds/execute", {
        method: "POST",
        body: JSON.stringify({ command, workspaceId: selectedWorkspace }),
      });
    },
    onSuccess: (data: { output: string; exitCode: number }) => {
      const result: CommandResult = {
        id: Date.now().toString(),
        command: commandInput,
        output: data.output,
        exitCode: data.exitCode,
        timestamp: new Date(),
      };
      setTerminalOutput(prev => [...prev, result]);
      setCommandInput("");
    },
    onError: (error: Error) => {
      const result: CommandResult = {
        id: Date.now().toString(),
        command: commandInput,
        output: `Error: ${error.message}`,
        exitCode: 1,
        timestamp: new Date(),
      };
      setTerminalOutput(prev => [...prev, result]);
    },
  });

  const saveFileMutation = useMutation({
    mutationFn: async (data: { fileId: string; content: string }) => {
      return apiRequest(`/api/owner/isds/files/${data.fileId}`, {
        method: "PATCH",
        body: JSON.stringify({ content: data.content }),
      });
    },
    onSuccess: () => {
      toast({
        title: isRTL ? "تم الحفظ" : "Saved",
        description: isRTL ? "تم حفظ الملف بنجاح" : "File saved successfully",
      });
    },
  });

  const aiAnalyzeMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("/api/owner/isds/ai/analyze", {
        method: "POST",
        body: JSON.stringify({ code, language: activeFile?.language || "typescript" }),
      });
    },
    onSuccess: (data: { suggestions: string[] }) => {
      setAiSuggestions(data.suggestions);
      setShowAiPanel(true);
    },
  });

  const handleFileClick = (file: FileNode) => {
    if (file.type === "directory") {
      setExpandedFolders(prev => {
        const next = new Set(prev);
        if (next.has(file.path)) {
          next.delete(file.path);
        } else {
          next.add(file.path);
        }
        return next;
      });
    } else {
      setActiveFile(file);
      setEditorContent(file.content || "");
      if (!openFiles.find(f => f.id === file.id)) {
        setOpenFiles(prev => [...prev, file]);
      }
    }
  };

  const handleCloseFile = (fileId: string) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFile?.id === fileId) {
      const remaining = openFiles.filter(f => f.id !== fileId);
      setActiveFile(remaining[remaining.length - 1] || null);
      setEditorContent(remaining[remaining.length - 1]?.content || "");
    }
  };

  const handleSaveFile = () => {
    if (activeFile) {
      saveFileMutation.mutate({ fileId: activeFile.id, content: editorContent });
    }
  };

  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (commandInput.trim()) {
      executeCommandMutation.mutate(commandInput);
    }
  };

  const handleRunCode = () => {
    if (activeFile) {
      setIsRunning(true);
      const runCommand = getRunCommand(activeFile.name);
      executeCommandMutation.mutate(runCommand);
      setTimeout(() => setIsRunning(false), 2000);
    }
  };

  const getRunCommand = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "mjs":
        return `node ${filename}`;
      case "ts":
        return `npx tsx ${filename}`;
      case "py":
        return `python3 ${filename}`;
      case "go":
        return `go run ${filename}`;
      case "php":
        return `php ${filename}`;
      case "sh":
        return `bash ${filename}`;
      default:
        return `echo "Unknown file type: ${ext}"`;
    }
  };

  const getFileLanguage = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      go: "go",
      php: "php",
      sh: "shell",
      bash: "shell",
      json: "json",
      html: "html",
      css: "css",
      scss: "scss",
      md: "markdown",
      sql: "sql",
      yaml: "yaml",
      yml: "yaml",
      xml: "xml",
      rs: "rust",
    };
    return langMap[ext || ""] || "plaintext";
  };

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div
          className={`flex items-center gap-1 py-1 px-2 hover-elevate cursor-pointer rounded-md ${
            activeFile?.id === node.id ? "bg-accent" : ""
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => handleFileClick(node)}
          data-testid={`file-tree-item-${node.id}`}
        >
          {node.type === "directory" ? (
            <>
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <Folder className="w-4 h-4 text-yellow-500" />
            </>
          ) : (
            <>
              <span className="w-4" />
              <File className="w-4 h-4 text-blue-500" />
            </>
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {node.type === "directory" && expandedFolders.has(node.path) && node.children && (
          <div>{renderFileTree(node.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  const defaultFiles: FileNode[] = [
    {
      id: "root",
      name: "sovereign-workspace",
      path: "root",
      type: "directory",
      children: [
        {
          id: "src",
          name: "src",
          path: "root/src",
          type: "directory",
          children: [
            {
              id: "index-ts",
              name: "index.ts",
              path: "root/src/index.ts",
              type: "file",
              content: `// INFRA Sovereign Dev Studio\n// Welcome to your sovereign development environment\n\nconsole.log("ISDS Active - Sovereign Mode");\n\nfunction main() {\n  console.log("Platform initialized");\n}\n\nmain();`,
              language: "typescript",
            },
            {
              id: "app-tsx",
              name: "App.tsx",
              path: "root/src/App.tsx",
              type: "file",
              content: `import { useState } from "react";\n\nexport default function App() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div className="app">\n      <h1>INFRA Sovereign Platform</h1>\n      <button onClick={() => setCount(c => c + 1)}>\n        Count: {count}\n      </button>\n    </div>\n  );\n}`,
              language: "typescript",
            },
          ],
        },
        {
          id: "package-json",
          name: "package.json",
          path: "root/package.json",
          type: "file",
          content: `{\n  "name": "sovereign-workspace",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "start": "node dist/index.js"\n  }\n}`,
          language: "json",
        },
        {
          id: "readme-md",
          name: "README.md",
          path: "root/README.md",
          type: "file",
          content: `# Sovereign Workspace\n\nThis is a sovereign development workspace.\n\n## Features\n- Full code editing\n- Real-time execution\n- AI assistance\n- Version control`,
          language: "markdown",
        },
      ],
    },
  ];

  const fileTree = files || defaultFiles;

  return (
    <div className="h-screen flex flex-col bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">ISDS</span>
            <Badge variant="outline" className="text-xs">
              {isRTL ? "سيادي" : "Sovereign"}
            </Badge>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-muted-foreground">
            {isRTL ? "بيئة التطوير السيادية" : "Sovereign Dev Environment"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSaveFile}
            disabled={!activeFile}
            data-testid="button-save-file"
          >
            <Save className="w-4 h-4 mr-1" />
            {isRTL ? "حفظ" : "Save"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRunCode}
            disabled={!activeFile || isRunning}
            data-testid="button-run-code"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-1" />
            )}
            {isRTL ? "تشغيل" : "Run"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => aiAnalyzeMutation.mutate(editorContent)}
            disabled={!editorContent}
            data-testid="button-ai-analyze"
          >
            <Bot className="w-4 h-4 mr-1" />
            {isRTL ? "تحليل AI" : "AI Analyze"}
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="icon" data-testid="button-git">
            <GitBranch className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-settings">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <div className="h-full flex flex-col bg-card border-r">
            <div className="flex items-center justify-between p-2 border-b">
              <span className="text-sm font-medium">
                {isRTL ? "الملفات" : "Files"}
              </span>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setShowNewFileDialog(true)}
                  data-testid="button-new-file"
                >
                  <FilePlus className="w-3 h-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setShowNewFolderDialog(true)}
                  data-testid="button-new-folder"
                >
                  <FolderPlus className="w-3 h-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => refetchFiles()}
                  data-testid="button-refresh-files"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-1">
              {renderFileTree(fileTree)}
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70}>
              <div className="h-full flex flex-col">
                {openFiles.length > 0 && (
                  <div className="flex items-center border-b bg-muted/30 overflow-x-auto">
                    {openFiles.map(file => (
                      <div
                        key={file.id}
                        className={`flex items-center gap-2 px-3 py-1.5 border-r cursor-pointer hover-elevate ${
                          activeFile?.id === file.id ? "bg-background" : ""
                        }`}
                        onClick={() => {
                          setActiveFile(file);
                          setEditorContent(file.content || "");
                        }}
                        data-testid={`tab-file-${file.id}`}
                      >
                        <File className="w-3 h-3" />
                        <span className="text-xs">{file.name}</span>
                        <button
                          className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseFile(file.id);
                          }}
                          data-testid={`button-close-tab-${file.id}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex-1">
                  {activeFile ? (
                    <Editor
                      height="100%"
                      language={getFileLanguage(activeFile.name)}
                      value={editorContent}
                      onChange={(value) => setEditorContent(value || "")}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: true },
                        fontSize: 14,
                        fontFamily: "JetBrains Mono, Fira Code, monospace",
                        lineNumbers: "on",
                        wordWrap: "on",
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        renderWhitespace: "selection",
                        bracketPairColorization: { enabled: true },
                        formatOnPaste: true,
                        formatOnType: true,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        folding: true,
                        foldingStrategy: "indentation",
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{isRTL ? "اختر ملفًا للبدء" : "Select a file to start"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={30} minSize={10}>
              <div className="h-full flex flex-col bg-zinc-900">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-700">
                  <TerminalIcon className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-zinc-400">
                    {isRTL ? "الطرفية السيادية" : "Sovereign Terminal"}
                  </span>
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/30">
                    {isRTL ? "متصل" : "Connected"}
                  </Badge>
                </div>
                <ScrollArea className="flex-1 p-2 font-mono text-sm">
                  {terminalOutput.map((result) => (
                    <div key={result.id} className="mb-2">
                      <div className="flex items-center gap-2 text-green-400">
                        <span>$</span>
                        <span>{result.command}</span>
                      </div>
                      <pre className={`whitespace-pre-wrap mt-1 ${
                        result.exitCode === 0 ? "text-zinc-300" : "text-red-400"
                      }`}>
                        {result.output}
                      </pre>
                    </div>
                  ))}
                  <div className="text-zinc-500 text-xs">
                    {isRTL 
                      ? "اكتب أمرًا للتنفيذ السيادي..." 
                      : "Type a command for sovereign execution..."}
                  </div>
                </ScrollArea>
                <form onSubmit={handleExecuteCommand} className="flex items-center border-t border-zinc-700 p-2">
                  <span className="text-green-400 mr-2">$</span>
                  <Input
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder={isRTL ? "أدخل الأمر..." : "Enter command..."}
                    className="flex-1 bg-transparent border-none text-zinc-100 focus-visible:ring-0"
                    data-testid="input-terminal-command"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={executeCommandMutation.isPending}
                    data-testid="button-execute-command"
                  >
                    {executeCommandMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={20} minSize={0} collapsible>
          <div className="h-full flex flex-col bg-card border-l">
            <Tabs defaultValue="ai" className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b justify-start">
                <TabsTrigger value="ai" className="text-xs">
                  <Bot className="w-3 h-3 mr-1" />
                  AI
                </TabsTrigger>
                <TabsTrigger value="status" className="text-xs">
                  <Activity className="w-3 h-3 mr-1" />
                  {isRTL ? "الحالة" : "Status"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="flex-1 m-0 p-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    <span className="font-medium text-sm">
                      {isRTL ? "مساعد التطوير" : "Dev Copilot"}
                    </span>
                  </div>
                  {aiSuggestions.length > 0 ? (
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, i) => (
                        <Card key={i} className="p-2 text-xs">
                          <p>{suggestion}</p>
                          <Button size="sm" variant="ghost" className="mt-2 w-full">
                            <Zap className="w-3 h-3 mr-1" />
                            {isRTL ? "تطبيق" : "Apply"}
                          </Button>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {isRTL 
                        ? "اضغط 'تحليل AI' لتحليل الكود"
                        : "Click 'AI Analyze' to analyze code"}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="status" className="flex-1 m-0 p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {isRTL ? "الحالة" : "Status"}
                    </span>
                    <Badge variant="default" className="bg-green-500">
                      {isRTL ? "نشط" : "Active"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> CPU
                      </span>
                      <span>12%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" /> RAM
                      </span>
                      <span>256MB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Uptime
                      </span>
                      <span>2h 34m</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? "ملف جديد" : "New File"}</DialogTitle>
            <DialogDescription>
              {isRTL ? "أدخل اسم الملف الجديد" : "Enter the new file name"}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder={isRTL ? "اسم الملف..." : "File name..."}
            data-testid="input-new-file-name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFileDialog(false)}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={() => {
              setShowNewFileDialog(false);
              setNewFileName("");
            }} data-testid="button-create-file">
              {isRTL ? "إنشاء" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
