import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import {
  Bot,
  Send,
  Play,
  Pause,
  Square,
  FileText,
  Terminal,
  Search,
  Code,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  FolderOpen,
  File,
  RefreshCw,
  Cpu,
  Zap,
  AlertCircle,
  Eye,
  History,
  Settings,
  GitBranch,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  Folder,
  FileCode,
  FilePlus,
  RotateCcw,
} from "lucide-react";

const translations = {
  en: {
    title: "INFERA Agent",
    subtitle: "Autonomous AI Development System",
    newTask: "New Task",
    taskTitle: "Task Title",
    taskDescription: "Description",
    taskPrompt: "What do you want me to do?",
    createTask: "Create Task",
    executeTask: "Execute",
    planTask: "Plan Only",
    tasks: "Tasks",
    executions: "Executions",
    logs: "Logs",
    files: "Files",
    terminal: "Terminal",
    noTasks: "No tasks yet",
    createFirst: "Create your first task to get started",
    pending: "Pending",
    planning: "Planning",
    executing: "Executing",
    completed: "Completed",
    failed: "Failed",
    step: "Step",
    tool: "Tool",
    output: "Output",
    error: "Error",
    status: "Status",
    duration: "Duration",
    ms: "ms",
    searchFiles: "Search in files",
    analyzeCode: "Analyze code",
    generateCode: "Generate code",
    runCommand: "Run command",
    agentThinking: "Agent is thinking...",
    agentExecuting: "Executing step",
    taskCreated: "Task created successfully",
    taskExecuted: "Task executed",
    refreshTasks: "Refresh",
    viewDetails: "View Details",
    priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    steps: "Steps",
    plan: "Plan",
    result: "Result",
    editor: "Editor",
    preview: "Preview",
    fileExplorer: "Files",
    openFile: "Open File",
    saveFile: "Save",
    newFile: "New File",
    filePath: "File path",
    noFileOpen: "No file open",
    selectFile: "Select a file to view or edit",
    livePreview: "Live Preview",
    previewUrl: "Preview URL",
    refreshPreview: "Refresh",
    filesSaved: "File saved successfully",
    fileLoaded: "File loaded",
    enterPath: "Enter file path...",
  },
  ar: {
    title: "عميل INFERA",
    subtitle: "نظام التطوير الذكي المستقل",
    newTask: "مهمة جديدة",
    taskTitle: "عنوان المهمة",
    taskDescription: "الوصف",
    taskPrompt: "ماذا تريد مني أن أفعل؟",
    createTask: "إنشاء المهمة",
    executeTask: "تنفيذ",
    planTask: "تخطيط فقط",
    tasks: "المهام",
    executions: "التنفيذات",
    logs: "السجلات",
    files: "الملفات",
    terminal: "الطرفية",
    noTasks: "لا توجد مهام بعد",
    createFirst: "أنشئ مهمتك الأولى للبدء",
    pending: "قيد الانتظار",
    planning: "جارٍ التخطيط",
    executing: "جارٍ التنفيذ",
    completed: "مكتملة",
    failed: "فشلت",
    step: "خطوة",
    tool: "أداة",
    output: "المخرجات",
    error: "خطأ",
    status: "الحالة",
    duration: "المدة",
    ms: "مللي ثانية",
    searchFiles: "بحث في الملفات",
    analyzeCode: "تحليل الكود",
    generateCode: "توليد كود",
    runCommand: "تشغيل أمر",
    agentThinking: "العميل يفكر...",
    agentExecuting: "جارٍ تنفيذ الخطوة",
    taskCreated: "تم إنشاء المهمة بنجاح",
    taskExecuted: "تم تنفيذ المهمة",
    refreshTasks: "تحديث",
    viewDetails: "عرض التفاصيل",
    priority: "الأولوية",
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
    steps: "الخطوات",
    plan: "الخطة",
    result: "النتيجة",
    editor: "المحرر",
    preview: "المعاينة",
    fileExplorer: "الملفات",
    openFile: "فتح ملف",
    saveFile: "حفظ",
    newFile: "ملف جديد",
    filePath: "مسار الملف",
    noFileOpen: "لا يوجد ملف مفتوح",
    selectFile: "اختر ملف للعرض أو التعديل",
    livePreview: "المعاينة المباشرة",
    previewUrl: "رابط المعاينة",
    refreshPreview: "تحديث",
    filesSaved: "تم حفظ الملف بنجاح",
    fileLoaded: "تم تحميل الملف",
    enterPath: "أدخل مسار الملف...",
  },
};

interface AgentTask {
  id: string;
  title: string;
  description?: string;
  prompt: string;
  status: string;
  priority: number;
  plan?: any;
  result?: any;
  currentStep: number;
  totalSteps: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface AgentExecution {
  id: string;
  taskId: string;
  stepIndex: number;
  tool: string;
  params: any;
  status: string;
  output?: any;
  error?: string;
  durationMs?: number;
  createdAt: string;
}

interface AgentLog {
  id: string;
  taskId: string;
  level: string;
  message: string;
  details?: any;
  createdAt: string;
}

export default function InferaAgentPage() {
  const [language, setLanguage] = useState<"en" | "ar">("ar");
  const t = translations[language];
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<AgentTask | null>(null);
  const [newTaskPrompt, setNewTaskPrompt] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [terminalCommand, setTerminalCommand] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const [currentFilePath, setCurrentFilePath] = useState("");
  const [currentFileContent, setCurrentFileContent] = useState("");
  const [filePathInput, setFilePathInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [fileTree, setFileTree] = useState<any[]>([]);
  const [isFileDirty, setIsFileDirty] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ["/api/infera/agent/tasks"],
  });

  const { data: taskDetails, isLoading: detailsLoading, refetch: refetchDetails } = useQuery({
    queryKey: ["/api/infera/agent/tasks", selectedTask?.id],
    enabled: !!selectedTask?.id,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; prompt: string }) => {
      return apiRequest("POST", "/api/infera/agent/tasks", data);
    },
    onSuccess: () => {
      toast({ title: t.taskCreated });
      setNewTaskPrompt("");
      setNewTaskTitle("");
      queryClient.invalidateQueries({ queryKey: ["/api/infera/agent/tasks"] });
    },
  });

  const executeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest("POST", `/api/infera/agent/tasks/${taskId}/execute`);
    },
    onSuccess: (data: any) => {
      toast({ title: t.taskExecuted });
      queryClient.invalidateQueries({ queryKey: ["/api/infera/agent/tasks"] });
      if (selectedTask) {
        queryClient.invalidateQueries({ queryKey: ["/api/infera/agent/tasks", selectedTask.id] });
        if (data?.task) {
          setSelectedTask(data.task);
        }
      }
      refetchTasks();
    },
  });

  const planTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest("POST", `/api/infera/agent/tasks/${taskId}/plan`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/infera/agent/tasks"] });
      if (selectedTask) {
        queryClient.invalidateQueries({ queryKey: ["/api/infera/agent/tasks", selectedTask.id] });
        refetchDetails();
      }
      refetchTasks();
    },
  });

  const terminalMutation = useMutation({
    mutationFn: async (command: string) => {
      return apiRequest("POST", "/api/infera/agent/terminal", { command });
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setTerminalOutput((prev) => [...prev, `$ ${terminalCommand}`, data.output?.stdout || "", data.output?.stderr || ""]);
      } else {
        setTerminalOutput((prev) => [...prev, `$ ${terminalCommand}`, `Error: ${data.error}`]);
      }
      setTerminalCommand("");
    },
  });

  const fileReadMutation = useMutation({
    mutationFn: async (path: string) => {
      return apiRequest("POST", "/api/infera/agent/file/read", { path });
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setCurrentFileContent(data.content || "");
        setCurrentFilePath(data.path || filePathInput);
        setIsFileDirty(false);
        toast({ title: t.fileLoaded });
      } else {
        toast({ title: data.error || "Failed to read file", variant: "destructive" });
      }
    },
  });

  const fileWriteMutation = useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      return apiRequest("POST", "/api/infera/agent/file/write", { path, content });
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setIsFileDirty(false);
        toast({ title: t.filesSaved });
      } else {
        toast({ title: data.error || "Failed to save file", variant: "destructive" });
      }
    },
  });

  const fileListMutation = useMutation({
    mutationFn: async (path: string) => {
      return apiRequest("POST", "/api/infera/agent/file/list", { path });
    },
    onSuccess: (data: any) => {
      if (data.success && data.files) {
        setFileTree(data.files);
      }
    },
  });

  const handleOpenFile = useCallback(() => {
    if (!filePathInput.trim()) return;
    fileReadMutation.mutate(filePathInput);
  }, [filePathInput]);

  const handleSaveFile = useCallback(() => {
    if (!currentFilePath) return;
    fileWriteMutation.mutate({ path: currentFilePath, content: currentFileContent });
  }, [currentFilePath, currentFileContent]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCurrentFileContent(value);
      setIsFileDirty(true);
    }
  };

  const handleRefreshPreview = () => {
    setPreviewKey((k) => k + 1);
  };

  const getMonacoLanguage = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
      css: "css", html: "html", json: "json", md: "markdown", py: "python",
      rs: "rust", go: "go", sql: "sql", sh: "shell", yml: "yaml", yaml: "yaml"
    };
    return langMap[ext || ""] || "plaintext";
  };

  useEffect(() => {
    fileListMutation.mutate(".");
  }, []);

  useEffect(() => {
    const baseUrl = window.location.origin;
    setPreviewUrl(baseUrl);
  }, []);

  const handleCreateTask = () => {
    if (!newTaskPrompt.trim()) return;
    createTaskMutation.mutate({
      title: newTaskTitle || "مهمة جديدة",
      prompt: newTaskPrompt,
    });
  };

  const handleExecuteTask = (taskId: string) => {
    executeTaskMutation.mutate(taskId);
  };

  const handlePlanTask = (taskId: string) => {
    planTaskMutation.mutate(taskId);
  };

  const handleTerminalSubmit = () => {
    if (!terminalCommand.trim()) return;
    terminalMutation.mutate(terminalCommand);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t.pending}</Badge>;
      case "planning":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />{t.planning}</Badge>;
      case "planned":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500"><Eye className="w-3 h-3 mr-1" />{language === "ar" ? "مخطط" : "Planned"}</Badge>;
      case "executing":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500"><Zap className="w-3 h-3 mr-1" />{t.executing}</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />{t.completed}</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{t.failed}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case "file_read":
      case "file_write":
      case "file_delete":
        return <FileText className="w-4 h-4" />;
      case "terminal":
        return <Terminal className="w-4 h-4" />;
      case "search":
        return <Search className="w-4 h-4" />;
      case "analyze":
      case "generate":
        return <Code className="w-4 h-4" />;
      case "git":
        return <GitBranch className="w-4 h-4" />;
      default:
        return <Cpu className="w-4 h-4" />;
    }
  };

  const tasks = (tasksData as any)?.tasks || [];
  const executions = (taskDetails as any)?.executions || [];
  const logs = (taskDetails as any)?.logs || [];
  const currentTask = (taskDetails as any)?.task || selectedTask;

  return (
    <div className="flex flex-col h-full" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-4 p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" data-testid="text-agent-title">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            data-testid="button-toggle-language"
          >
            {language === "ar" ? "EN" : "AR"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchTasks()}
            data-testid="button-refresh-tasks"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r flex flex-col bg-muted/30">
          <div className="p-4 border-b">
            <div className="space-y-3">
              <Input
                placeholder={t.taskTitle}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                data-testid="input-task-title"
              />
              <Textarea
                placeholder={t.taskPrompt}
                value={newTaskPrompt}
                onChange={(e) => setNewTaskPrompt(e.target.value)}
                className="min-h-[80px] resize-none"
                data-testid="input-task-prompt"
              />
              <Button
                className="w-full"
                onClick={handleCreateTask}
                disabled={createTaskMutation.isPending || !newTaskPrompt.trim()}
                data-testid="button-create-task"
              >
                {createTaskMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {t.createTask}
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {tasksLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t.noTasks}</p>
                  <p className="text-sm">{t.createFirst}</p>
                </div>
              ) : (
                tasks.map((task: AgentTask) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors hover-elevate ${
                      selectedTask?.id === task.id ? "bg-accent border-primary" : "bg-card"
                    }`}
                    onClick={() => setSelectedTask(task)}
                    data-testid={`task-item-${task.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{task.prompt}</p>
                      </div>
                      {getStatusBadge(task.status)}
                    </div>
                    {task.totalSteps > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{t.steps}: {task.currentStep}/{task.totalSteps}</span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${(task.currentStep / task.totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedTask ? (
            <>
              <div className="p-4 border-b bg-card">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{currentTask?.title}</h2>
                    <p className="text-sm text-muted-foreground">{currentTask?.prompt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePlanTask(selectedTask.id)}
                      disabled={planTaskMutation.isPending || selectedTask.status !== "pending"}
                      data-testid="button-plan-task"
                    >
                      {planTaskMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Eye className="w-4 h-4 mr-2" />
                      )}
                      {t.planTask}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleExecuteTask(selectedTask.id)}
                      disabled={executeTaskMutation.isPending || selectedTask.status === "executing" || selectedTask.status === "completed"}
                      data-testid="button-execute-task"
                    >
                      {executeTaskMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {t.executeTask}
                    </Button>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="plan" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="mx-4 mt-4 w-fit flex-wrap gap-1">
                  <TabsTrigger value="plan" data-testid="tab-plan">
                    <Cpu className="w-4 h-4 mr-2" />{t.plan}
                  </TabsTrigger>
                  <TabsTrigger value="editor" data-testid="tab-editor">
                    <FileCode className="w-4 h-4 mr-2" />{t.editor}
                  </TabsTrigger>
                  <TabsTrigger value="preview" data-testid="tab-preview">
                    <Eye className="w-4 h-4 mr-2" />{t.preview}
                  </TabsTrigger>
                  <TabsTrigger value="executions" data-testid="tab-executions">
                    <History className="w-4 h-4 mr-2" />{t.executions}
                  </TabsTrigger>
                  <TabsTrigger value="logs" data-testid="tab-logs">
                    <FileText className="w-4 h-4 mr-2" />{t.logs}
                  </TabsTrigger>
                  <TabsTrigger value="terminal" data-testid="tab-terminal">
                    <Terminal className="w-4 h-4 mr-2" />{t.terminal}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="plan" className="flex-1 overflow-hidden m-4 mt-2">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        {t.plan}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                      {currentTask?.plan?.steps ? (
                        <div className="space-y-3">
                          {currentTask.plan.reasoning && (
                            <div className="p-3 rounded-lg bg-muted text-sm">
                              <p className="font-medium mb-1">{language === "ar" ? "التفكير:" : "Reasoning:"}</p>
                              <p>{currentTask.plan.reasoning}</p>
                            </div>
                          )}
                          {currentTask.plan.steps.map((step: any, index: number) => (
                            <div
                              key={step.id || index}
                              className={`p-3 rounded-lg border ${
                                step.status === "completed"
                                  ? "bg-green-500/5 border-green-500/20"
                                  : step.status === "failed"
                                  ? "bg-red-500/5 border-red-500/20"
                                  : step.status === "executing"
                                  ? "bg-yellow-500/5 border-yellow-500/20"
                                  : "bg-card"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {getToolIcon(step.tool)}
                                    <span className="font-medium">{step.action}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline">{step.tool}</Badge>
                                    {step.status === "completed" && (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                    {step.status === "failed" && (
                                      <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                    {step.status === "executing" && (
                                      <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              {step.error && (
                                <div className="mt-2 p-2 rounded bg-red-500/10 text-red-500 text-sm">
                                  {step.error}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <Bot className="w-16 h-16 mb-4 opacity-30" />
                          <p>{language === "ar" ? "اضغط 'تخطيط فقط' لإنشاء خطة التنفيذ" : "Click 'Plan Only' to create an execution plan"}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="editor" className="flex-1 overflow-hidden m-4 mt-2">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileCode className="w-4 h-4" />
                          {t.editor}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Input
                            value={filePathInput}
                            onChange={(e) => setFilePathInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleOpenFile()}
                            placeholder={t.enterPath}
                            className="w-64"
                            data-testid="input-file-path"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleOpenFile}
                            disabled={fileReadMutation.isPending}
                            data-testid="button-open-file"
                          >
                            {fileReadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4 mr-1" />}
                            {t.openFile}
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveFile}
                            disabled={!currentFilePath || fileWriteMutation.isPending || !isFileDirty}
                            data-testid="button-save-file"
                          >
                            {fileWriteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                            {t.saveFile}
                          </Button>
                        </div>
                      </div>
                      {currentFilePath && (
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                          <FileCode className="w-3 h-3" />
                          {currentFilePath}
                          {isFileDirty && <Badge variant="secondary">Modified</Badge>}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                      {currentFilePath ? (
                        <Editor
                          height="100%"
                          language={getMonacoLanguage(currentFilePath)}
                          value={currentFileContent}
                          onChange={handleEditorChange}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            wordWrap: "on",
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <FileCode className="w-16 h-16 mb-4 opacity-30" />
                          <p className="font-medium">{t.noFileOpen}</p>
                          <p className="text-sm">{t.selectFile}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preview" className="flex-1 overflow-hidden m-4 mt-2">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          {t.livePreview}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Input
                            value={previewUrl}
                            onChange={(e) => setPreviewUrl(e.target.value)}
                            placeholder={t.previewUrl}
                            className="w-64"
                            data-testid="input-preview-url"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRefreshPreview}
                            data-testid="button-refresh-preview"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            {t.refreshPreview}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => window.open(previewUrl, "_blank")}
                            data-testid="button-open-external"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                      <iframe
                        key={previewKey}
                        ref={iframeRef}
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title="Live Preview"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="executions" className="flex-1 overflow-hidden m-4 mt-2">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <History className="w-4 h-4" />
                        {t.executions}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                      {executions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <Zap className="w-16 h-16 mb-4 opacity-30" />
                          <p>{language === "ar" ? "لا توجد تنفيذات بعد" : "No executions yet"}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {executions.map((exec: AgentExecution) => (
                            <div
                              key={exec.id}
                              className="p-3 rounded-lg border bg-card"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getToolIcon(exec.tool)}
                                  <span className="font-medium">{t.step} {exec.stepIndex + 1}</span>
                                  <Badge variant="outline">{exec.tool}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(exec.status)}
                                  {exec.durationMs && (
                                    <span className="text-xs text-muted-foreground">
                                      {exec.durationMs}{t.ms}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {exec.output && (
                                <pre className="mt-2 p-2 rounded bg-muted text-xs overflow-x-auto">
                                  {JSON.stringify(exec.output, null, 2).slice(0, 500)}
                                </pre>
                              )}
                              {exec.error && (
                                <div className="mt-2 p-2 rounded bg-red-500/10 text-red-500 text-sm">
                                  {exec.error}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="logs" className="flex-1 overflow-hidden m-4 mt-2">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t.logs}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                      {logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <FileText className="w-16 h-16 mb-4 opacity-30" />
                          <p>{language === "ar" ? "لا توجد سجلات بعد" : "No logs yet"}</p>
                        </div>
                      ) : (
                        <div className="space-y-1 font-mono text-sm">
                          {logs.map((log: AgentLog) => (
                            <div
                              key={log.id}
                              className={`p-2 rounded ${
                                log.level === "error"
                                  ? "bg-red-500/10 text-red-500"
                                  : log.level === "warn"
                                  ? "bg-yellow-500/10 text-yellow-500"
                                  : "bg-muted"
                              }`}
                            >
                              <span className="text-muted-foreground">
                                [{new Date(log.createdAt).toLocaleTimeString()}]
                              </span>{" "}
                              <span className="uppercase font-bold">[{log.level}]</span>{" "}
                              {log.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="terminal" className="flex-1 overflow-hidden m-4 mt-2">
                  <Card className="h-full flex flex-col bg-zinc-950">
                    <CardContent className="flex-1 flex flex-col p-0">
                      <ScrollArea className="flex-1 p-4" ref={terminalRef}>
                        <div className="font-mono text-sm text-green-400 space-y-1">
                          {terminalOutput.map((line, index) => (
                            <div key={index} className="whitespace-pre-wrap">
                              {line}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="flex items-center gap-2 p-4 border-t border-zinc-800">
                        <span className="text-green-400 font-mono">$</span>
                        <Input
                          value={terminalCommand}
                          onChange={(e) => setTerminalCommand(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleTerminalSubmit()}
                          placeholder={t.runCommand}
                          className="flex-1 bg-transparent border-none font-mono text-green-400 focus-visible:ring-0"
                          data-testid="input-terminal-command"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleTerminalSubmit}
                          disabled={terminalMutation.isPending}
                          data-testid="button-terminal-submit"
                        >
                          {terminalMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Bot className="w-24 h-24 mb-6 opacity-20" />
              <h2 className="text-xl font-semibold mb-2">
                {language === "ar" ? "اختر مهمة للبدء" : "Select a task to begin"}
              </h2>
              <p className="text-sm">
                {language === "ar"
                  ? "أنشئ مهمة جديدة أو اختر مهمة موجودة من القائمة"
                  : "Create a new task or select an existing one from the list"}
              </p>
            </div>
          )}
        </div>
      </div>

      {(executeTaskMutation.isPending || planTaskMutation.isPending) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="p-6 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="font-medium">
              {executeTaskMutation.isPending ? t.agentExecuting : t.agentThinking}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
