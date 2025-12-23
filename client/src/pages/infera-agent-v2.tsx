import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import {
  Bot,
  Send,
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
  CheckCircle2,
  Circle,
  AlertCircle,
  Globe,
  X,
  Zap,
  Sparkles,
  Eye,
  FolderOpen,
  File,
  Save,
  MoreHorizontal,
  Command,
  ArrowUp,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
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
}

interface ActionLog {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  status: "running" | "completed" | "failed";
}

export default function InferaAgentV2() {
  const [language, setLanguage] = useState<"en" | "ar">("ar");
  const isRTL = language === "ar";
  
  const t = useMemo(() => ({
    title: language === "ar" ? "وكيل INFERA" : "INFERA Agent",
    subtitle: language === "ar" ? "مهندس برمجيات ذكي مستقل" : "Autonomous AI Engineer",
    placeholder: language === "ar" ? "اكتب ما تريد بناءه أو إصلاحه..." : "Describe what you want to build or fix...",
    send: language === "ar" ? "إرسال" : "Send",
    files: language === "ar" ? "الملفات" : "Files",
    code: language === "ar" ? "الكود" : "Code",
    preview: language === "ar" ? "المعاينة" : "Preview",
    console: language === "ar" ? "الطرفية" : "Console",
    online: language === "ar" ? "متصل" : "Online",
    offline: language === "ar" ? "غير متصل" : "Offline",
    thinking: language === "ar" ? "يفكر..." : "Thinking...",
    working: language === "ar" ? "يعمل..." : "Working...",
    tasks: language === "ar" ? "المهام" : "Tasks",
    noFile: language === "ar" ? "اختر ملفاً للتحرير" : "Select a file to edit",
  }), [language]);

  const welcomeMessage: Message = useMemo(() => ({
    id: "welcome",
    role: "assistant",
    content: language === "ar" 
      ? `مرحباً! أنا وكيل INFERA - مهندس برمجيات ذكي مستقل.

أستطيع مساعدتك في بناء وتعديل المشاريع، تحليل الكود، تنفيذ الأوامر، والمزيد.

**ما الذي تريد بناءه اليوم؟**`
      : `Hello! I'm INFERA Agent - your autonomous AI software engineer.

I can help you build projects, modify code, run commands, and more.

**What would you like to build today?**`,
    timestamp: new Date(),
  }), [language]);

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [actions, setActions] = useState<ActionLog[]>([]);
  const [agentStatus, setAgentStatus] = useState<"online" | "offline" | "checking">("checking");
  
  const [openTabs, setOpenTabs] = useState<{ path: string; content: string; isDirty: boolean }[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(-1);
  const currentFile = activeTabIndex >= 0 ? openTabs[activeTabIndex]?.path : null;
  const fileContent = activeTabIndex >= 0 ? openTabs[activeTabIndex]?.content : "";
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["."]));
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    "$ INFERA Agent initialized",
    "$ Ready to execute commands...",
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/agent/health");
        setAgentStatus(res.ok ? "online" : "offline");
      } catch {
        setAgentStatus("offline");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { data: projectStructureData, refetch: refetchStructure } = useQuery<{ items: FileNode[] }>({
    queryKey: ["/api/infera/agent/project/structure", "."],
    refetchInterval: 60000,
    staleTime: 55000,
    refetchOnWindowFocus: false,
  });
  const projectStructure = projectStructureData?.items || [];

  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      if (!res.ok) throw new Error("Request failed");
      return res.json();
    },
    onMutate: () => {
      setIsThinking(true);
      setActions((prev) => [...prev.slice(-4), {
        id: `action-${Date.now()}`,
        type: "thinking",
        description: language === "ar" ? "يحلل الطلب..." : "Analyzing...",
        timestamp: new Date(),
        status: "running",
      }]);
    },
    onSuccess: (data) => {
      setIsThinking(false);
      setActions((prev) => prev.map((a) => 
        a.status === "running" ? { ...a, status: "completed" as const } : a
      ));
      
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response || data.message || "Done",
        timestamp: new Date(),
      }]);
      
      if (data.tasks) setTasks(data.tasks);
      refetchStructure();
    },
    onError: () => {
      setIsThinking(false);
      setActions((prev) => prev.map((a) => 
        a.status === "running" ? { ...a, status: "failed" as const } : a
      ));
    },
  });

  const fileReadMutation = useMutation({
    mutationFn: async (path: string) => {
      const res = await apiRequest("POST", "/api/infera/agent/file/read", { path });
      return res.json();
    },
    onSuccess: (data, path) => {
      const existingIndex = openTabs.findIndex((tab) => tab.path === path);
      if (existingIndex >= 0) {
        setActiveTabIndex(existingIndex);
      } else {
        setOpenTabs((prev) => [...prev, { path, content: data.content || "", isDirty: false }]);
        setActiveTabIndex(openTabs.length);
      }
    },
  });

  const fileSaveMutation = useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      const res = await apiRequest("POST", "/api/infera/agent/file/write", { path, content });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: language === "ar" ? "تم الحفظ" : "Saved" });
      if (activeTabIndex >= 0) {
        setOpenTabs((prev) => prev.map((tab, i) => 
          i === activeTabIndex ? { ...tab, isDirty: false } : tab
        ));
      }
    },
  });

  const handleSend = () => {
    if (!inputValue.trim() || chatMutation.isPending) return;
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }]);
    chatMutation.mutate(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }, []);

  const closeTab = (index: number) => {
    setOpenTabs((prev) => prev.filter((_, i) => i !== index));
    if (activeTabIndex === index) {
      setActiveTabIndex(Math.max(0, index - 1));
    } else if (activeTabIndex > index) {
      setActiveTabIndex(activeTabIndex - 1);
    }
    if (openTabs.length === 1) setActiveTabIndex(-1);
  };

  const renderFileTree = useCallback((nodes: FileNode[], depth = 0): React.ReactNode => {
    if (!nodes?.length) return null;
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center gap-1.5 py-1 px-2 text-sm cursor-pointer rounded-sm transition-colors ${
            currentFile === node.path 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => node.type === "folder" ? toggleFolder(node.path) : fileReadMutation.mutate(node.path)}
          data-testid={`file-${node.name}`}
        >
          {node.type === "folder" ? (
            <>
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              {expandedFolders.has(node.path) ? (
                <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-3.5" />
              <File className="w-4 h-4 text-blue-400 flex-shrink-0" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {node.type === "folder" && expandedFolders.has(node.path) && node.children && (
          renderFileTree(node.children, depth + 1)
        )}
      </div>
    ));
  }, [currentFile, expandedFolders, toggleFolder, fileReadMutation]);

  const getFileExtension = (path: string) => path.split('.').pop() || '';
  
  const getLanguage = (path: string) => {
    const ext = getFileExtension(path);
    const map: Record<string, string> = {
      ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
      json: 'json', css: 'css', html: 'html', md: 'markdown', py: 'python',
    };
    return map[ext] || 'plaintext';
  };

  return (
    <div className={`h-[calc(100vh-49px)] flex flex-col bg-[#0d1117] text-gray-200 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Top Bar */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-gray-800 bg-[#161b22]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${
                agentStatus === "online" ? "bg-emerald-400" : "bg-gray-500"
              }`} />
            </div>
            <span className="font-semibold text-sm text-white">{t.title}</span>
          </div>
          {agentStatus === "online" && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
              {t.online}
            </Badge>
          )}
          {isThinking && (
            <Badge className="text-[10px] h-5 px-1.5 bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse">
              <Sparkles className="w-3 h-3 me-1" />
              {t.working}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-gray-400 hover:text-white"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            data-testid="button-language-toggle"
          >
            {language === "ar" ? "EN" : "AR"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Chat */}
        <ResizablePanel defaultSize={28} minSize={20} maxSize={45}>
          <div className="h-full flex flex-col bg-[#0d1117] border-e border-gray-800">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-3 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user" ? "bg-blue-600" : "bg-gradient-to-br from-emerald-500 to-teal-600"
                    }`}>
                      {msg.role === "user" ? (
                        <span className="text-white text-xs font-medium">U</span>
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`flex-1 p-2.5 rounded-lg text-sm ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-[#21262d] text-gray-200 border border-gray-700"
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 p-2.5 rounded-lg bg-[#21262d] border border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-gray-500">{t.thinking}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Tasks Display */}
            {tasks.length > 0 && (
              <div className="border-t border-gray-800 p-2 max-h-24 overflow-auto">
                <div className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">{t.tasks}</div>
                {tasks.slice(-3).map((task) => (
                  <div key={task.id} className="flex items-center gap-1.5 text-xs py-0.5">
                    {task.status === "completed" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : task.status === "in_progress" ? (
                      <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                    ) : task.status === "failed" ? (
                      <AlertCircle className="w-3 h-3 text-red-400" />
                    ) : (
                      <Circle className="w-3 h-3 text-gray-500" />
                    )}
                    <span className={task.status === "completed" ? "text-gray-500 line-through" : "text-gray-300"}>
                      {task.content}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-2 border-t border-gray-800 bg-[#161b22]">
              <div className="relative">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  className="min-h-[80px] max-h-32 resize-none bg-[#0d1117] border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-sm pe-10"
                  data-testid="input-agent-prompt"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || chatMutation.isPending}
                  className="absolute bottom-2 end-2 h-8 w-8 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                  data-testid="button-send"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-[10px] text-gray-600">
                  <Command className="w-3 h-3 inline me-0.5" />
                  Enter {language === "ar" ? "للإرسال" : "to send"}
                </span>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-px bg-gray-800 hover:bg-emerald-500/50 transition-colors" />

        {/* Right Panel - IDE */}
        <ResizablePanel defaultSize={72}>
          <ResizablePanelGroup direction="horizontal">
            {/* File Tree */}
            <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
              <div className="h-full bg-[#0d1117] border-e border-gray-800">
                <div className="h-8 flex items-center justify-between px-3 border-b border-gray-800 bg-[#161b22]">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t.files}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-gray-500 hover:text-white"
                    onClick={() => refetchStructure()}
                    data-testid="button-refresh-files"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <ScrollArea className="h-[calc(100%-32px)]">
                  <div className="py-1">
                    {renderFileTree(projectStructure)}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-px bg-gray-800 hover:bg-emerald-500/50 transition-colors" />

            {/* Editor & Console */}
            <ResizablePanel defaultSize={78}>
              <ResizablePanelGroup direction="vertical">
                {/* Editor */}
                <ResizablePanel defaultSize={70} minSize={30}>
                  <div className="h-full flex flex-col bg-[#0d1117]">
                    {/* Tabs */}
                    {openTabs.length > 0 ? (
                      <>
                        <div className="h-9 flex items-center bg-[#161b22] border-b border-gray-800 overflow-x-auto">
                          {openTabs.map((tab, index) => (
                            <div
                              key={tab.path}
                              className={`flex items-center gap-1.5 h-full px-3 border-e border-gray-800 cursor-pointer text-xs group ${
                                activeTabIndex === index 
                                  ? "bg-[#0d1117] text-white border-t-2 border-t-emerald-500" 
                                  : "text-gray-400 hover:text-white hover:bg-[#21262d]"
                              }`}
                              onClick={() => setActiveTabIndex(index)}
                              data-testid={`tab-file-${index}`}
                            >
                              <FileCode className="w-3.5 h-3.5 text-blue-400" />
                              <span className="max-w-24 truncate">{tab.path.split("/").pop()}</span>
                              {tab.isDirty && <span className="text-amber-400">*</span>}
                              <button
                                className="ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-700"
                                onClick={(e) => { e.stopPropagation(); closeTab(index); }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex-1">
                          <Editor
                            height="100%"
                            language={getLanguage(currentFile || '')}
                            value={fileContent}
                            theme="vs-dark"
                            onChange={(value) => {
                              if (activeTabIndex >= 0) {
                                setOpenTabs((prev) => prev.map((tab, i) => 
                                  i === activeTabIndex ? { ...tab, content: value || "", isDirty: true } : tab
                                ));
                              }
                            }}
                            options={{
                              fontSize: 13,
                              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              padding: { top: 12 },
                              lineNumbers: "on",
                              renderLineHighlight: "all",
                              cursorBlinking: "smooth",
                              smoothScrolling: true,
                            }}
                          />
                        </div>
                        {openTabs[activeTabIndex]?.isDirty && (
                          <div className="h-8 flex items-center justify-end px-3 border-t border-gray-800 bg-[#161b22]">
                            <Button
                              size="sm"
                              className="h-6 text-xs bg-emerald-600 hover:bg-emerald-500"
                              onClick={() => {
                                if (currentFile && fileContent) {
                                  fileSaveMutation.mutate({ path: currentFile, content: fileContent });
                                }
                              }}
                              disabled={fileSaveMutation.isPending}
                            >
                              <Save className="w-3 h-3 me-1" />
                              {language === "ar" ? "حفظ" : "Save"}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-600">
                        <div className="text-center">
                          <FileCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">{t.noFile}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ResizablePanel>

                <ResizableHandle className="h-px bg-gray-800 hover:bg-emerald-500/50 transition-colors" />

                {/* Console */}
                <ResizablePanel defaultSize={30} minSize={15}>
                  <div className="h-full flex flex-col bg-[#0d1117]">
                    <div className="h-8 flex items-center px-3 border-b border-gray-800 bg-[#161b22]">
                      <Terminal className="w-3.5 h-3.5 text-gray-500 me-2" />
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t.console}</span>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="p-3 font-mono text-xs text-gray-400 space-y-0.5">
                        {consoleOutput.map((line, i) => (
                          <div key={i} className={line.startsWith("$") ? "text-emerald-400" : ""}>
                            {line}
                          </div>
                        ))}
                        {actions.slice(-3).map((action) => (
                          <div key={action.id} className="flex items-center gap-2">
                            {action.status === "running" ? (
                              <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                            ) : action.status === "completed" ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-red-400" />
                            )}
                            <span className={
                              action.status === "running" ? "text-amber-400" :
                              action.status === "completed" ? "text-emerald-400" : "text-red-400"
                            }>
                              {action.description}
                            </span>
                          </div>
                        ))}
                        <div className="text-emerald-400 animate-pulse">_</div>
                      </div>
                    </ScrollArea>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
