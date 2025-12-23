import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
  Bot,
  Send,
  FileText,
  Terminal,
  Code,
  Loader2,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Folder,
  FileCode,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  Circle,
  AlertCircle,
  Globe,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeft,
  GitBranch,
  History,
  Settings,
  Sparkles,
  ArrowUp,
  Cpu,
  Eye,
  MessageSquare,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface TaskItem {
  id: string;
  content: string;
  status: "pending" | "in_progress" | "completed" | "failed";
}

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  isExpanded?: boolean;
}

interface ActionLog {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  status: "running" | "completed" | "failed";
}

const translations = {
  en: {
    title: "INFERA Agent",
    subtitle: "Autonomous AI Development Environment",
    placeholder: "Describe what you want to build...",
    send: "Send",
    tasks: "Tasks",
    preview: "Preview",
    console: "Console",
    files: "Files",
    code: "Code",
    logs: "Logs",
    noTasks: "No tasks yet",
    running: "Running",
    stopped: "Stopped",
    startWorkflow: "Start",
    stopWorkflow: "Stop",
    restartWorkflow: "Restart",
    checkpoint: "Checkpoint",
    rollback: "Rollback",
    thinking: "Thinking...",
    working: "Working on:",
    completed: "Completed",
    pending: "Pending",
    inProgress: "In Progress",
    failed: "Failed",
    actions: "Actions",
    noActions: "No actions yet",
    workflowStatus: "Workflow",
  },
  ar: {
    title: "وكيل إنفرا",
    subtitle: "بيئة التطوير الذكية المستقلة",
    placeholder: "صف ما تريد بناءه...",
    send: "إرسال",
    tasks: "المهام",
    preview: "المعاينة",
    console: "الطرفية",
    files: "الملفات",
    code: "الكود",
    logs: "السجلات",
    noTasks: "لا توجد مهام",
    running: "يعمل",
    stopped: "متوقف",
    startWorkflow: "تشغيل",
    stopWorkflow: "إيقاف",
    restartWorkflow: "إعادة تشغيل",
    checkpoint: "نقطة حفظ",
    rollback: "تراجع",
    thinking: "يفكر...",
    working: "يعمل على:",
    completed: "مكتمل",
    pending: "قيد الانتظار",
    inProgress: "جارٍ التنفيذ",
    failed: "فشل",
    actions: "الإجراءات",
    noActions: "لا توجد إجراءات",
    workflowStatus: "حالة العمل",
  },
};

export default function InferaAgentV2() {
  const [language, setLanguage] = useState<"en" | "ar">("ar");
  const t = translations[language];
  const isRTL = language === "ar";
  
  // Welcome message based on language
  const welcomeMessage: Message = {
    id: "welcome",
    role: "assistant",
    content: language === "ar" 
      ? `مرحباً! أنا **وكيل إنفرا** - مهندس برمجيات ذكي مستقل.

أستطيع مساعدتك في:
- إنشاء وتعديل الملفات والمجلدات
- تحليل وإصلاح الأخطاء في الكود
- تشغيل الأوامر في Terminal
- مراجعة وتحسين المشروع

**ابدأ بوصف ما تريد بناءه أو إصلاحه!**`
      : `Hello! I'm **INFERA Agent** - your autonomous AI software engineer.

I can help you:
- Create and modify files
- Analyze and fix code errors
- Run terminal commands
- Review and improve your project

**Start by describing what you want to build or fix!**`,
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [actions, setActions] = useState<ActionLog[]>([]);
  const [agentStatus, setAgentStatus] = useState<"online" | "offline" | "checking">("checking");
  
  // Multi-tab editor state
  const [openTabs, setOpenTabs] = useState<{ path: string; content: string; isDirty: boolean }[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(-1);
  const currentFile = activeTabIndex >= 0 ? openTabs[activeTabIndex]?.path : null;
  const fileContent = activeTabIndex >= 0 ? openTabs[activeTabIndex]?.content : "";
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["."]));
  const [previewUrl, setPreviewUrl] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Check agent health status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/agent/health");
        if (res.ok) {
          setAgentStatus("online");
        } else {
          setAgentStatus("offline");
        }
      } catch {
        setAgentStatus("offline");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { data: projectStructureData, refetch: refetchStructure } = useQuery<{ items: FileNode[] }>({
    queryKey: ["/api/infera/agent/project/structure", "."],
    refetchInterval: 10000,
  });
  const projectStructure = projectStructureData?.items || [];

  const { data: workflowStatus } = useQuery({
    queryKey: ["/api/infera/agent/workflow/status"],
    refetchInterval: 3000,
  });

  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => {
      // Use the standalone Agent AI chat endpoint via proxy
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      if (!res.ok) throw new Error("Chat request failed");
      return res.json();
    },
    onMutate: () => {
      setIsThinking(true);
      // Add a "thinking" action
      setActions((prev) => [
        ...prev,
        {
          id: `thinking-${Date.now()}`,
          type: "thinking",
          description: language === "ar" ? "يحلل الطلب..." : "Analyzing request...",
          timestamp: new Date(),
          status: "running",
        },
      ]);
    },
    onSuccess: (data) => {
      setIsThinking(false);
      // Update thinking action to completed
      setActions((prev) =>
        prev.map((a) =>
          a.status === "running" ? { ...a, status: "completed" as const } : a
        )
      );
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response || data.message || "تم التنفيذ",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Parse tool calls from response and add as actions
      const toolMatch = data.response?.match(/\{"tool":\s*"([^"]+)"/);
      if (toolMatch) {
        setActions((prev) => [
          ...prev,
          {
            id: `tool-${Date.now()}`,
            type: "tool_call",
            description: `${toolMatch[1]}`,
            timestamp: new Date(),
            status: "completed",
          },
        ]);
      }
      
      if (data.tasks) {
        setTasks(data.tasks);
      }
      refetchStructure();
    },
    onError: (error) => {
      setIsThinking(false);
      setActions((prev) =>
        prev.map((a) =>
          a.status === "running" ? { ...a, status: "failed" as const } : a
        )
      );
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const fileReadMutation = useMutation({
    mutationFn: async (path: string) => {
      const res = await apiRequest("POST", "/api/infera/agent/file/read", { path });
      return res.json();
    },
    onSuccess: (data, path) => {
      // Check if tab already exists
      const existingIndex = openTabs.findIndex((tab) => tab.path === path);
      if (existingIndex >= 0) {
        setActiveTabIndex(existingIndex);
      } else {
        // Add new tab
        setOpenTabs((prev) => [...prev, { path, content: data.content || "", isDirty: false }]);
        setActiveTabIndex(openTabs.length);
      }
    },
  });

  // Tab management functions
  const closeTab = (index: number) => {
    const tab = openTabs[index];
    if (tab?.isDirty) {
      if (!confirm(language === "ar" ? "هل تريد إغلاق الملف بدون حفظ؟" : "Close file without saving?")) {
        return;
      }
    }
    setOpenTabs((prev) => prev.filter((_, i) => i !== index));
    if (activeTabIndex === index) {
      setActiveTabIndex(Math.max(0, index - 1));
    } else if (activeTabIndex > index) {
      setActiveTabIndex(activeTabIndex - 1);
    }
    if (openTabs.length === 1) {
      setActiveTabIndex(-1);
    }
  };

  const updateTabContent = (content: string) => {
    if (activeTabIndex >= 0) {
      setOpenTabs((prev) =>
        prev.map((tab, i) => (i === activeTabIndex ? { ...tab, content, isDirty: true } : tab))
      );
    }
  };

  const fileSaveMutation = useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      const res = await apiRequest("POST", "/api/infera/agent/file/write", { path, content });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: language === "ar" ? "تم الحفظ" : "Saved" });
      refetchStructure();
    },
  });

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    if (!nodes || !Array.isArray(nodes)) return null;
    return nodes.map((node) => (
      <div key={node.path} style={{ paddingInlineStart: depth * 12 }}>
        <div
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover-elevate text-sm ${
            currentFile === node.path ? "bg-accent" : ""
          }`}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.path);
            } else {
              fileReadMutation.mutate(node.path);
            }
          }}
          data-testid={`file-${node.name}`}
        >
          {node.type === "folder" ? (
            <>
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )}
              <Folder className="w-4 h-4 text-primary" />
            </>
          ) : (
            <>
              <span className="w-3" />
              <FileCode className="w-4 h-4 text-muted-foreground" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {node.type === "folder" && expandedFolders.has(node.path) && node.children && (
          renderFileTree(node.children, depth + 1)
        )}
      </div>
    ));
  };

  const getStatusIcon = (status: TaskItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="w-6 h-6 text-primary" />
              <span 
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                  agentStatus === "online" ? "bg-green-500 animate-pulse" : 
                  agentStatus === "checking" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
                }`}
              />
            </div>
            <span className="font-semibold text-lg">{t.title}</span>
          </div>
          <Badge 
            variant={agentStatus === "online" ? "default" : "outline"} 
            className={`text-xs ${agentStatus === "online" ? "bg-green-600" : ""}`}
          >
            {agentStatus === "online" 
              ? (language === "ar" ? "متصل" : "Online") 
              : agentStatus === "checking" 
              ? (language === "ar" ? "جارٍ الاتصال..." : "Connecting...")
              : (language === "ar" ? "غير متصل" : "Offline")}
          </Badge>
          {isThinking && (
            <Badge variant="secondary" className="text-xs animate-pulse">
              <Sparkles className="w-3 h-3 me-1" />
              {language === "ar" ? "يعمل..." : "Working..."}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={workflowRunning ? "destructive" : "default"}
            onClick={() => {
              setWorkflowRunning(!workflowRunning);
              toast({ 
                title: workflowRunning 
                  ? (language === "ar" ? "تم إيقاف سير العمل" : "Workflow stopped")
                  : (language === "ar" ? "تم بدء سير العمل" : "Workflow started")
              });
            }}
            data-testid="button-workflow-toggle"
          >
            {workflowRunning ? <Square className="w-4 h-4 me-1" /> : <Play className="w-4 h-4 me-1" />}
            {workflowRunning ? t.stop : t.start}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            data-testid="button-language-toggle"
          >
            {language === "ar" ? "EN" : "AR"}
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            data-testid="button-panel-toggle"
          >
            {leftPanelCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {!leftPanelCollapsed && (
          <>
            <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
              <div className="h-full flex flex-col border-e bg-card/50">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              msg.role === "user" ? "bg-primary" : "bg-muted"
                            }`}
                          >
                            {msg.role === "user" ? (
                              <span className="text-primary-foreground text-sm">U</span>
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <div
                            className={`flex-1 p-3 rounded-lg ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isThinking && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="flex-1 p-3 rounded-lg bg-muted">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">{t.thinking}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {tasks.length > 0 && (
                    <div className="border-t p-3">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">{t.tasks}</h4>
                      <div className="space-y-1">
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-2 text-sm">
                            {getStatusIcon(task.status)}
                            <span className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                              {task.content}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {actions.length > 0 && (
                    <div className="border-t p-3 max-h-40 overflow-auto">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">{t.actions}</h4>
                      <div className="space-y-1">
                        {actions.slice(-5).map((action) => (
                          <div key={action.id} className="flex items-center gap-2 text-xs">
                            {action.status === "running" ? (
                              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                            ) : action.status === "completed" ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-red-500" />
                            )}
                            <span className="text-muted-foreground">{action.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.placeholder}
                      className="min-h-[60px] resize-none"
                      data-testid="input-agent-prompt"
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || chatMutation.isPending}
                      data-testid="button-send"
                    >
                      {chatMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span className="ms-2">{t.send}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        <ResizablePanel defaultSize={70}>
          <div className="h-full flex flex-col">
            <Tabs defaultValue="code" className="flex-1 flex flex-col">
              <div className="flex items-center justify-between px-2 border-b">
                <TabsList className="bg-transparent h-10">
                  <TabsTrigger value="code" className="gap-1 data-[state=active]:bg-muted" data-testid="tab-code">
                    <Code className="w-4 h-4" />
                    {t.code}
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-1 data-[state=active]:bg-muted" data-testid="tab-preview">
                    <Eye className="w-4 h-4" />
                    {t.preview}
                  </TabsTrigger>
                  <TabsTrigger value="console" className="gap-1 data-[state=active]:bg-muted" data-testid="tab-console">
                    <Terminal className="w-4 h-4" />
                    {t.console}
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => refetchStructure()} data-testid="button-refresh-files">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                    <div className="h-full border-e overflow-hidden">
                      <div className="p-2 border-b">
                        <h4 className="text-xs font-medium text-muted-foreground">{t.files}</h4>
                      </div>
                      <ScrollArea className="h-[calc(100%-36px)]">
                        <div className="p-1">
                          {renderFileTree(projectStructure as FileNode[])}
                        </div>
                      </ScrollArea>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={75}>
                    <div className="h-full flex flex-col">
                      {openTabs.length > 0 && (
                        <div className="flex items-center border-b bg-muted/30 overflow-x-auto">
                          <div className="flex items-center flex-1">
                            {openTabs.map((tab, index) => (
                              <div
                                key={tab.path}
                                className={`flex items-center gap-1 px-3 py-1.5 border-e cursor-pointer text-sm ${
                                  activeTabIndex === index ? "bg-background" : "hover-elevate"
                                }`}
                                onClick={() => setActiveTabIndex(index)}
                                data-testid={`tab-file-${index}`}
                              >
                                <FileCode className="w-3 h-3 text-muted-foreground" />
                                <span className="truncate max-w-32">{tab.path.split("/").pop()}</span>
                                {tab.isDirty && <span className="text-primary">*</span>}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-4 h-4 p-0 ms-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(index);
                                  }}
                                  data-testid={`button-close-tab-${index}`}
                                >
                                  <span className="text-xs">x</span>
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="mx-1"
                            onClick={() => {
                              if (currentFile) {
                                fileSaveMutation.mutate({ path: currentFile, content: fileContent });
                                setOpenTabs((prev) =>
                                  prev.map((tab, i) => (i === activeTabIndex ? { ...tab, isDirty: false } : tab))
                                );
                              }
                            }}
                            disabled={fileSaveMutation.isPending || !currentFile}
                            data-testid="button-save-file"
                          >
                            {fileSaveMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              language === "ar" ? "حفظ" : "Save"
                            )}
                          </Button>
                        </div>
                      )}
                      <div className="flex-1">
                        {currentFile ? (
                          <Editor
                            height="100%"
                            defaultLanguage="typescript"
                            language={
                              currentFile.endsWith(".tsx") || currentFile.endsWith(".ts")
                                ? "typescript"
                                : currentFile.endsWith(".css")
                                ? "css"
                                : currentFile.endsWith(".json")
                                ? "json"
                                : currentFile.endsWith(".html")
                                ? "html"
                                : "plaintext"
                            }
                            value={fileContent}
                            onChange={(value) => updateTabContent(value || "")}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 13,
                              lineNumbers: "on",
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                              tabSize: 2,
                              wordWrap: "on",
                            }}
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <FileCode className="w-12 h-12 mx-auto mb-2 opacity-20" />
                              <p>{language === "ar" ? "اختر ملف للتعديل" : "Select a file to edit"}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 m-0">
                <div className="h-full flex flex-col">
                  <div className="flex items-center gap-2 p-2 border-b">
                    <Input
                      value={previewUrl}
                      onChange={(e) => setPreviewUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 h-8 text-sm"
                    />
                    <Button size="sm" variant="ghost">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1 bg-white dark:bg-zinc-900">
                    {previewUrl ? (
                      <iframe src={previewUrl} className="w-full h-full border-0" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Globe className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p>{language === "ar" ? "أدخل رابط للمعاينة" : "Enter URL to preview"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="console" className="flex-1 m-0">
                <div className="h-full flex flex-col bg-zinc-900 text-zinc-100">
                  <div className="flex items-center gap-2 p-2 border-b border-zinc-700">
                    <Badge variant="outline" className="text-xs" data-testid="status-workflow">
                      {t.workflowStatus}: {workflowRunning ? t.running : t.stopped}
                    </Badge>
                    <div className="flex-1" />
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-zinc-300"
                      onClick={() => {
                        setWorkflowRunning(true);
                        setConsoleOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${language === "ar" ? "بدء التشغيل..." : "Starting..."}`]);
                      }}
                      data-testid="button-start-workflow"
                    >
                      <Play className="w-4 h-4 me-1" />
                      {t.startWorkflow}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-zinc-300"
                      onClick={() => {
                        setWorkflowRunning(false);
                        setConsoleOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${language === "ar" ? "تم الإيقاف" : "Stopped"}`]);
                      }}
                      data-testid="button-stop-workflow"
                    >
                      <Square className="w-4 h-4 me-1" />
                      {t.stopWorkflow}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-zinc-300"
                      onClick={() => {
                        setConsoleOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${language === "ar" ? "إعادة التشغيل..." : "Restarting..."}`]);
                        setWorkflowRunning(false);
                        setTimeout(() => {
                          setWorkflowRunning(true);
                          setConsoleOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${language === "ar" ? "تم إعادة التشغيل بنجاح" : "Restarted successfully"}`]);
                        }, 1000);
                      }}
                      data-testid="button-restart-workflow"
                    >
                      <RotateCcw className="w-4 h-4 me-1" />
                      {t.restartWorkflow}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-zinc-300"
                      onClick={() => setConsoleOutput([])}
                      data-testid="button-clear-console"
                    >
                      {language === "ar" ? "مسح" : "Clear"}
                    </Button>
                  </div>
                  <ScrollArea className="flex-1 p-3 font-mono text-sm" data-testid="console-output">
                    {consoleOutput.length > 0 ? (
                      consoleOutput.map((line, i) => (
                        <div key={i} className="text-zinc-300">
                          {line}
                        </div>
                      ))
                    ) : (
                      <div className="text-zinc-500">
                        {language === "ar" ? "لا توجد مخرجات بعد..." : "No output yet..."}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
