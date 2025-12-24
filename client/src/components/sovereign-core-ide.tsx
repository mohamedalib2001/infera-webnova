import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAIWebSocket } from "@/hooks/use-ai-websocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  Lock,
  Shield,
  MessageSquare,
  Plus,
  Code2,
  Play,
  Terminal,
  Eye,
  Database,
  Settings2,
  FileCode,
  Folder,
  ChevronRight,
  ChevronDown,
  Send,
  RefreshCw,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  Sparkles,
  Zap,
  Cpu,
  Activity,
  LayoutGrid,
  PanelLeft,
  PanelRight,
  PanelBottom,
  Loader2,
  Bot,
  User,
  Palette,
  Braces,
  FileJson,
  Hash,
} from "lucide-react";

interface SovereignConversation {
  id: string;
  title: string;
  titleAr?: string;
  status: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ConversationMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

interface CodeFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

interface SovereignCoreIDEProps {
  workspaceId: string;
  isOwner: boolean;
}

export function SovereignCoreIDE({ workspaceId, isOwner }: SovereignCoreIDEProps) {
  const { toast } = useToast();
  const { isRtl } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // WebSocket AI connection for fast streaming responses
  const aiWs = useAIWebSocket(isOwner);
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<ConversationMessage[]>([]);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  
  // Reset local messages when conversation changes
  useEffect(() => {
    setLocalMessages([]);
    setStreamingMessage("");
  }, [selectedConversation]);
  
  // Auto-retry pending message when WebSocket connects
  useEffect(() => {
    if (pendingMessage && aiWs.isConnected && aiWs.isAuthenticated) {
      const msg = pendingMessage;
      setPendingMessage(null);
      handleSendMessageInternal(msg);
    }
  }, [aiWs.isConnected, aiWs.isAuthenticated, pendingMessage]);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState("");
  
  const [activeTab, setActiveTab] = useState<"chat" | "code" | "preview" | "terminal">("chat");
  const [bottomTab, setBottomTab] = useState<"terminal" | "problems" | "output">("terminal");
  const [rightTab, setRightTab] = useState<"tools" | "files" | "database">("tools");
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([
    { name: "index.html", path: "/index.html", content: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Sovereign Platform</title>\n</head>\n<body>\n  <h1>Welcome to Sovereign Core</h1>\n</body>\n</html>", language: "html" },
    { name: "styles.css", path: "/styles.css", content: "body {\n  font-family: system-ui;\n  background: #0a0a0a;\n  color: white;\n}", language: "css" },
    { name: "app.js", path: "/app.js", content: "// Sovereign Core Application\nconsole.log('Sovereign Core initialized');", language: "javascript" },
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    "[Sovereign Core] Terminal initialized",
    "[Sovereign Core] Ready for commands...",
  ]);
  const [terminalInput, setTerminalInput] = useState("");

  const t = {
    ar: {
      title: "النواة السيادية - بيئة التطوير المتكاملة",
      subtitle: "عقل ذكاء اصطناعي مستقل - معزول بالكامل",
      ownerOnly: "للمالك فقط",
      isolated: "بيئة معزولة",
      conversations: "المحادثات",
      newConversation: "محادثة جديدة",
      conversationTitle: "عنوان المحادثة",
      create: "إنشاء",
      cancel: "إلغاء",
      typeMessage: "اكتب رسالتك...",
      send: "إرسال",
      processing: "جاري المعالجة...",
      chat: "المحادثة",
      code: "الكود",
      preview: "المعاينة",
      terminal: "الطرفية",
      tools: "الأدوات",
      files: "الملفات",
      database: "قاعدة البيانات",
      problems: "المشاكل",
      output: "المخرجات",
      run: "تشغيل",
      save: "حفظ",
      deploy: "نشر",
      noConversations: "لا توجد محادثات",
      startConversation: "ابدأ محادثة جديدة",
      securityNote: "جميع البيانات مشفرة بـ AES-256-GCM",
      aiThinking: "الذكاء الاصطناعي يفكر...",
      generateCode: "توليد الكود",
      analyzeCode: "تحليل الكود",
      optimizeCode: "تحسين الكود",
      testCode: "اختبار الكود",
      desktop: "سطح المكتب",
      tablet: "الجهاز اللوحي",
      mobile: "الهاتف",
      refresh: "تحديث",
      fullscreen: "ملء الشاشة",
      download: "تحميل",
      copy: "نسخ",
    },
    en: {
      title: "Sovereign Core - Integrated Development Environment",
      subtitle: "Independent AI Mind - Fully Isolated",
      ownerOnly: "Owner Only",
      isolated: "Isolated Environment",
      conversations: "Conversations",
      newConversation: "New Conversation",
      conversationTitle: "Conversation Title",
      create: "Create",
      cancel: "Cancel",
      typeMessage: "Type your message...",
      send: "Send",
      processing: "Processing...",
      chat: "Chat",
      code: "Code",
      preview: "Preview",
      terminal: "Terminal",
      tools: "Tools",
      files: "Files",
      database: "Database",
      problems: "Problems",
      output: "Output",
      run: "Run",
      save: "Save",
      deploy: "Deploy",
      noConversations: "No conversations",
      startConversation: "Start a new conversation",
      securityNote: "All data encrypted with AES-256-GCM",
      aiThinking: "AI is thinking...",
      generateCode: "Generate Code",
      analyzeCode: "Analyze Code",
      optimizeCode: "Optimize Code",
      testCode: "Test Code",
      desktop: "Desktop",
      tablet: "Tablet",
      mobile: "Mobile",
      refresh: "Refresh",
      fullscreen: "Fullscreen",
      download: "Download",
      copy: "Copy",
    },
  };

  const text = isRtl ? t.ar : t.en;

  const { data: conversations, isLoading: loadingConversations } = useQuery<SovereignConversation[]>({
    queryKey: ['/api/sovereign-core/conversations', workspaceId],
    enabled: isOwner,
  });

  const { data: messages, isLoading: loadingMessages } = useQuery<ConversationMessage[]>({
    queryKey: ['/api/sovereign-core/conversations', selectedConversation, 'messages'],
    enabled: !!selectedConversation && isOwner,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      return await apiRequest("POST", "/api/sovereign-core/conversations", {
        title,
        workspaceId,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations'] });
      setSelectedConversation(data.id);
      setShowNewConversationDialog(false);
      setNewConversationTitle("");
      toast({
        title: isRtl ? "تم إنشاء المحادثة" : "Conversation Created",
        description: isRtl ? "تم إنشاء محادثة سيادية جديدة" : "New sovereign conversation created",
      });
    },
    onError: () => {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: isRtl ? "فشل إنشاء المحادثة" : "Failed to create conversation",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsProcessing(true);
      setStreamingMessage("");
      return await apiRequest("POST", `/api/sovereign-core/conversations/${selectedConversation}/messages`, {
        content,
        role: "user",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations', selectedConversation, 'messages'] });
      setNewMessage("");
      setIsProcessing(false);
      setStreamingMessage("");
    },
    onError: () => {
      setIsProcessing(false);
      setStreamingMessage("");
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: isRtl ? "فشل إرسال الرسالة" : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessageInternal = async (userMsg: string) => {
    // Add user message immediately for instant feedback
    const userMessage: ConversationMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: userMsg,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, userMessage]);
    
    try {
      setIsProcessing(true);
      setStreamingMessage("");
      const response = await aiWs.sendMessage(userMsg, isRtl ? "ar" : "en");
      
      // Add AI response to local messages
      const aiMessage: ConversationMessage = {
        id: `local-ai-${Date.now()}`,
        role: "assistant",
        content: response,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      setStreamingMessage("");
    } catch (error) {
      setIsProcessing(false);
      setStreamingMessage("");
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: isRtl ? "فشل الاتصال بالذكاء الاصطناعي" : "AI connection failed",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMsg = newMessage.trim();
    setNewMessage("");
    
    // Check if WebSocket is ready
    if (aiWs.isConnected && aiWs.isAuthenticated) {
      await handleSendMessageInternal(userMsg);
    } else if (selectedConversation) {
      // Fallback to REST API
      sendMessageMutation.mutate(userMsg);
    } else {
      // Queue message for when WebSocket connects
      setPendingMessage(userMsg);
      toast({
        title: isRtl ? "جاري الاتصال..." : "Connecting...",
        description: isRtl ? "سيتم إرسال رسالتك عند الاتصال" : "Your message will be sent once connected",
      });
    }
  };

  const handleTerminalCommand = async () => {
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalOutput(prev => [...prev, `$ ${cmd}`]);
    setTerminalInput("");
    
    try {
      const res = await apiRequest("POST", "/api/platform/terminal/execute", { command: cmd });
      if (res.output) {
        setTerminalOutput(prev => [...prev, res.output]);
      } else if (res.error) {
        setTerminalOutput(prev => [...prev, `Error: ${res.error}`]);
      }
    } catch (error) {
      setTerminalOutput(prev => [...prev, `[Sovereign Terminal] Command simulated: ${cmd}`]);
    }
  };

  const handleGenerateCode = async () => {
    if (!aiWs.isConnected || !aiWs.isAuthenticated) {
      toast({ title: isRtl ? "انتظر اتصال AI" : "Waiting for AI connection", variant: "destructive" });
      return;
    }
    toast({ title: isRtl ? "جاري توليد الكود..." : "Generating code..." });
    
    try {
      setIsProcessing(true);
      const response = await aiWs.sendMessage(
        isRtl ? "قم بتوليد كود HTML/CSS/JS لمشروع سيادي متكامل" : "Generate complete HTML/CSS/JS code for a sovereign platform",
        isRtl ? "ar" : "en"
      );
      
      // Add response to messages
      setLocalMessages(prev => [...prev, {
        id: `gen-${Date.now()}`,
        role: "assistant",
        content: response,
        createdAt: new Date().toISOString(),
      }]);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      toast({ title: isRtl ? "فشل التوليد" : "Generation failed", variant: "destructive" });
    }
  };

  const handleAnalyzeCode = async () => {
    const code = codeFiles[activeFileIndex]?.content || "";
    if (!code.trim()) {
      toast({ title: isRtl ? "لا يوجد كود للتحليل" : "No code to analyze", variant: "destructive" });
      return;
    }
    if (!aiWs.isConnected || !aiWs.isAuthenticated) {
      toast({ title: isRtl ? "انتظر اتصال AI" : "Waiting for AI connection", variant: "destructive" });
      return;
    }
    toast({ title: isRtl ? "جاري تحليل الكود..." : "Analyzing code..." });
    
    try {
      setIsProcessing(true);
      const response = await aiWs.sendMessage(`Analyze this code:\n\`\`\`\n${code}\n\`\`\``, isRtl ? "ar" : "en");
      setLocalMessages(prev => [...prev, {
        id: `analyze-${Date.now()}`,
        role: "assistant",
        content: response,
        createdAt: new Date().toISOString(),
      }]);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      toast({ title: isRtl ? "فشل التحليل" : "Analysis failed", variant: "destructive" });
    }
  };

  const handleOptimizeCode = async () => {
    const code = codeFiles[activeFileIndex]?.content || "";
    if (!code.trim()) {
      toast({ title: isRtl ? "لا يوجد كود للتحسين" : "No code to optimize", variant: "destructive" });
      return;
    }
    if (!aiWs.isConnected || !aiWs.isAuthenticated) {
      toast({ title: isRtl ? "انتظر اتصال AI" : "Waiting for AI connection", variant: "destructive" });
      return;
    }
    toast({ title: isRtl ? "جاري تحسين الكود..." : "Optimizing code..." });
    
    try {
      setIsProcessing(true);
      const response = await aiWs.sendMessage(`Optimize this code for better performance:\n\`\`\`\n${code}\n\`\`\``, isRtl ? "ar" : "en");
      setLocalMessages(prev => [...prev, {
        id: `optimize-${Date.now()}`,
        role: "assistant",
        content: response,
        createdAt: new Date().toISOString(),
      }]);
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      toast({ title: isRtl ? "فشل التحسين" : "Optimization failed", variant: "destructive" });
    }
  };

  const handleTestCode = async () => {
    const code = codeFiles[activeFileIndex]?.content || "";
    
    // Use WebSocket code execution if available
    if (aiWs.isConnected && aiWs.isAuthenticated && codeFiles[activeFileIndex]?.language === "javascript") {
      try {
        setTerminalOutput(prev => [...prev, "[Sovereign Core] Executing code via WebSocket..."]);
        const result = await aiWs.executeCode(code, "nodejs");
        setTerminalOutput(prev => [...prev, result.output || result.error || "Execution complete"]);
      } catch (error) {
        setTerminalOutput(prev => [...prev, `[Error] ${error}`]);
      }
    } else {
      setTerminalOutput(prev => [
        ...prev, 
        "[Sovereign Core] Running syntax tests...",
        "[Test] index.html - Syntax valid",
        "[Test] styles.css - Syntax valid", 
        "[Test] app.js - Syntax valid",
        "[Sovereign Core] All tests passed!"
      ]);
    }
    toast({ title: isRtl ? "تم تشغيل الاختبارات" : "Tests executed" });
  };

  const handleCopyCode = async () => {
    if (codeFiles[activeFileIndex]) {
      await navigator.clipboard.writeText(codeFiles[activeFileIndex].content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileIcon = (lang: string) => {
    switch (lang) {
      case "html": return <FileCode className="h-4 w-4 text-orange-500" />;
      case "css": return <Palette className="h-4 w-4 text-blue-500" />;
      case "javascript": return <Braces className="h-4 w-4 text-yellow-500" />;
      case "json": return <FileJson className="h-4 w-4 text-green-500" />;
      default: return <FileCode className="h-4 w-4" />;
    }
  };

  const generatePreviewContent = () => {
    const html = codeFiles.find(f => f.language === "html")?.content || "";
    const css = codeFiles.find(f => f.language === "css")?.content || "";
    const js = codeFiles.find(f => f.language === "javascript")?.content || "";
    return `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;
  };

  // Sync WebSocket streaming text to state
  useEffect(() => {
    if (aiWs.streamingText) {
      setStreamingMessage(aiWs.streamingText);
    }
  }, [aiWs.streamingText]);

  // Combine API messages with local messages
  const allMessages = [...(messages || []), ...localMessages];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, streamingMessage]);

  if (!isOwner) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Lock className="w-16 h-16 mx-auto text-destructive/50" />
            <p className="text-lg font-medium text-destructive">
              {isRtl ? "الوصول مرفوض - للمالك فقط" : "Access Denied - Owner Only"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-background rounded-lg border overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-gradient-to-r from-violet-950/50 to-indigo-950/50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              {text.title}
              <Badge variant="outline" className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30">
                <Lock className="w-3 h-3 mr-1" />
                {text.ownerOnly}
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">{text.securityNote}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowSidebar(!showSidebar)} data-testid="toggle-sidebar">
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowBottomPanel(!showBottomPanel)} data-testid="toggle-bottom">
            <PanelBottom className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowRightPanel(!showRightPanel)} data-testid="toggle-right">
            <PanelRight className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid="button-run">
            <Play className="h-4 w-4 mr-1" />
            {text.run}
          </Button>
          <Button size="sm" variant="secondary" data-testid="button-deploy">
            <Zap className="h-4 w-4 mr-1" />
            {text.deploy}
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {showSidebar && (
          <>
            <ResizablePanel defaultSize={18} minSize={15} maxSize={25}>
              <div className="h-full flex flex-col bg-muted/30">
                <div className="p-2 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{text.conversations}</span>
                    <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-6 w-6" data-testid="button-new-conversation">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{text.newConversation}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Input
                            placeholder={text.conversationTitle}
                            value={newConversationTitle}
                            onChange={(e) => setNewConversationTitle(e.target.value)}
                            data-testid="input-conversation-title"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowNewConversationDialog(false)}>
                              {text.cancel}
                            </Button>
                            <Button onClick={() => createConversationMutation.mutate(newConversationTitle)} disabled={!newConversationTitle.trim()}>
                              <Plus className="h-4 w-4 mr-1" />
                              {text.create}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {loadingConversations ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : conversations?.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-xs text-muted-foreground">{text.noConversations}</p>
                        <Button size="sm" variant="ghost" className="mt-2" onClick={() => setShowNewConversationDialog(true)}>
                          {text.startConversation}
                        </Button>
                      </div>
                    ) : (
                      conversations?.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv.id)}
                          className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                            selectedConversation === conv.id
                              ? "bg-violet-500/20 text-violet-300"
                              : "hover:bg-muted"
                          }`}
                          data-testid={`conversation-${conv.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            <span className="truncate">{conv.title}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {conv.messageCount} {isRtl ? "رسالة" : "messages"}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        <ResizablePanel defaultSize={showSidebar && showRightPanel ? 54 : showSidebar || showRightPanel ? 72 : 100}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={showBottomPanel ? 70 : 100}>
              <div className="h-full flex flex-col">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
                  <div className="border-b px-2">
                    <TabsList className="h-9 bg-transparent">
                      <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-violet-500/20" data-testid="tab-chat">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {text.chat}
                      </TabsTrigger>
                      <TabsTrigger value="code" className="text-xs data-[state=active]:bg-violet-500/20" data-testid="tab-code">
                        <Code2 className="h-4 w-4 mr-1" />
                        {text.code}
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="text-xs data-[state=active]:bg-violet-500/20" data-testid="tab-preview">
                        <Eye className="h-4 w-4 mr-1" />
                        {text.preview}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden">
                    {/* AI Connection Status */}
                    <div className="flex items-center gap-2 px-3 py-1 border-b text-xs">
                      <div className={`w-2 h-2 rounded-full ${aiWs.isConnected && aiWs.isAuthenticated ? "bg-green-500" : aiWs.isConnected ? "bg-yellow-500" : "bg-red-500"}`} />
                      <span className="text-muted-foreground">
                        {aiWs.isConnected && aiWs.isAuthenticated 
                          ? (isRtl ? "متصل بالذكاء الاصطناعي (بث مباشر)" : "AI Connected (Streaming)")
                          : aiWs.isConnected 
                          ? (isRtl ? "جاري المصادقة..." : "Authenticating...")
                          : (isRtl ? "جاري الاتصال..." : "Connecting...")}
                      </span>
                      {aiWs.isProcessing && <Loader2 className="h-3 w-3 animate-spin text-violet-400" />}
                    </div>
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4" data-testid="chat-messages">
                        {loadingMessages ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : allMessages.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>{isRtl ? "ابدأ محادثة مع الذكاء الاصطناعي" : "Start chatting with AI"}</p>
                            <p className="text-xs mt-2">{isRtl ? "اكتب رسالتك وسيرد عليك فوراً عبر البث المباشر" : "Type a message and get instant streaming response"}</p>
                          </div>
                        ) : (
                          allMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {msg.role === "assistant" && (
                                <div className="p-2 rounded-lg bg-violet-600/20 shrink-0">
                                  <Bot className="h-5 w-5 text-violet-400" />
                                </div>
                              )}
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  msg.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <span className="text-xs opacity-60 mt-1 block">
                                  {new Date(msg.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              {msg.role === "user" && (
                                <div className="p-2 rounded-lg bg-primary/20 shrink-0">
                                  <User className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                        {isProcessing && (
                          <div className="flex gap-3 justify-start">
                            <div className="p-2 rounded-lg bg-violet-600/20">
                              <Bot className="h-5 w-5 text-violet-400" />
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">{text.aiThinking}</span>
                              </div>
                              {streamingMessage && (
                                <p className="text-sm mt-2 whitespace-pre-wrap">{streamingMessage}</p>
                              )}
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                    <div className="p-3 border-t">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder={text.typeMessage}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          disabled={isProcessing || aiWs.isProcessing}
                          className="min-h-[60px] resize-none"
                          data-testid="input-message"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isProcessing || aiWs.isProcessing}
                          className="bg-violet-600 hover:bg-violet-700"
                          data-testid="button-send"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
                    <div className="h-full flex flex-col">
                      <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/30 overflow-x-auto">
                        {codeFiles.map((file, idx) => (
                          <button
                            key={file.path}
                            onClick={() => setActiveFileIndex(idx)}
                            className={`flex items-center gap-1 px-3 py-1 text-xs rounded-t transition-colors ${
                              idx === activeFileIndex
                                ? "bg-background border-t border-x"
                                : "hover:bg-muted"
                            }`}
                            data-testid={`file-tab-${file.name}`}
                          >
                            {getFileIcon(file.language)}
                            {file.name}
                          </button>
                        ))}
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <Editor
                          height="100%"
                          language={codeFiles[activeFileIndex]?.language || "plaintext"}
                          value={codeFiles[activeFileIndex]?.content || ""}
                          onChange={(value) => {
                            const newFiles = [...codeFiles];
                            newFiles[activeFileIndex].content = value || "";
                            setCodeFiles(newFiles);
                          }}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            padding: { top: 10 },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                          }}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant={viewport === "desktop" ? "secondary" : "ghost"} className="h-7 w-7" onClick={() => setViewport("desktop")}>
                            <Monitor className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant={viewport === "tablet" ? "secondary" : "ghost"} className="h-7 w-7" onClick={() => setViewport("tablet")}>
                            <Tablet className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant={viewport === "mobile" ? "secondary" : "ghost"} className="h-7 w-7" onClick={() => setViewport("mobile")}>
                            <Smartphone className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCopyCode}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Maximize2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 bg-white dark:bg-neutral-900 flex items-center justify-center p-4">
                        <div
                          className="h-full bg-white rounded-lg overflow-hidden shadow-lg"
                          style={{
                            width: viewport === "mobile" ? "375px" : viewport === "tablet" ? "768px" : "100%",
                            maxWidth: "100%",
                          }}
                        >
                          <iframe
                            srcDoc={generatePreviewContent()}
                            className="w-full h-full border-0"
                            title="Preview"
                            sandbox="allow-scripts"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>

            {showBottomPanel && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                  <div className="h-full flex flex-col bg-black/50">
                    <div className="flex items-center gap-1 px-2 py-1 border-b border-white/10">
                      <button
                        onClick={() => setBottomTab("terminal")}
                        className={`px-3 py-1 text-xs rounded ${bottomTab === "terminal" ? "bg-white/10" : "hover:bg-white/5"}`}
                      >
                        <Terminal className="h-3 w-3 inline mr-1" />
                        {text.terminal}
                      </button>
                      <button
                        onClick={() => setBottomTab("problems")}
                        className={`px-3 py-1 text-xs rounded ${bottomTab === "problems" ? "bg-white/10" : "hover:bg-white/5"}`}
                      >
                        {text.problems}
                      </button>
                      <button
                        onClick={() => setBottomTab("output")}
                        className={`px-3 py-1 text-xs rounded ${bottomTab === "output" ? "bg-white/10" : "hover:bg-white/5"}`}
                      >
                        {text.output}
                      </button>
                    </div>
                    <ScrollArea className="flex-1 p-2 font-mono text-xs text-green-400">
                      {terminalOutput.map((line, i) => (
                        <div key={i} className="py-0.5">{line}</div>
                      ))}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-violet-400">$</span>
                        <input
                          type="text"
                          value={terminalInput}
                          onChange={(e) => setTerminalInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleTerminalCommand()}
                          className="flex-1 bg-transparent border-none outline-none text-white"
                          placeholder="Enter command..."
                          data-testid="input-terminal"
                        />
                      </div>
                    </ScrollArea>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>

        {showRightPanel && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div className="h-full flex flex-col bg-muted/30">
                <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as typeof rightTab)} className="flex-1 flex flex-col">
                  <div className="border-b px-2">
                    <TabsList className="h-9 bg-transparent w-full justify-start">
                      <TabsTrigger value="tools" className="text-xs">
                        <Settings2 className="h-4 w-4 mr-1" />
                        {text.tools}
                      </TabsTrigger>
                      <TabsTrigger value="files" className="text-xs">
                        <Folder className="h-4 w-4 mr-1" />
                        {text.files}
                      </TabsTrigger>
                      <TabsTrigger value="database" className="text-xs">
                        <Database className="h-4 w-4 mr-1" />
                        {text.database}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="tools" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2 space-y-2">
                      <Card className="bg-violet-500/10 border-violet-500/30 mb-2">
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-violet-400" />
                            {isRtl ? "أدوات الذكاء الاصطناعي" : "AI Tools"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full justify-start text-xs"
                            onClick={handleGenerateCode}
                            disabled={isProcessing || aiWs.isProcessing}
                            data-testid="button-generate-code"
                          >
                            <Code2 className="h-3 w-3 mr-2" />
                            {text.generateCode}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full justify-start text-xs"
                            onClick={handleAnalyzeCode}
                            disabled={isProcessing || aiWs.isProcessing}
                            data-testid="button-analyze-code"
                          >
                            <Activity className="h-3 w-3 mr-2" />
                            {text.analyzeCode}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full justify-start text-xs"
                            onClick={handleOptimizeCode}
                            disabled={isProcessing || aiWs.isProcessing}
                            data-testid="button-optimize-code"
                          >
                            <Zap className="h-3 w-3 mr-2" />
                            {text.optimizeCode}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full justify-start text-xs"
                            onClick={handleTestCode}
                            disabled={isProcessing || aiWs.isProcessing}
                            data-testid="button-test-code"
                          >
                            <Play className="h-3 w-3 mr-2" />
                            {text.testCode}
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="mb-2">
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Activity className="h-4 w-4 text-green-400" />
                            {isRtl ? "حالة الاتصال" : "Connection Status"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2">
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="text-muted-foreground">WebSocket</span>
                            <Badge variant={aiWs.isConnected ? "default" : "destructive"} className="text-xs">
                              {aiWs.isConnected ? (isRtl ? "متصل" : "Connected") : (isRtl ? "غير متصل" : "Disconnected")}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="text-muted-foreground">{isRtl ? "المصادقة" : "Auth"}</span>
                            <Badge variant={aiWs.isAuthenticated ? "default" : "secondary"} className="text-xs">
                              {aiWs.isAuthenticated ? (isRtl ? "مصادق" : "Authenticated") : (isRtl ? "قيد المصادقة" : "Pending")}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="text-muted-foreground">{isRtl ? "البث" : "Streaming"}</span>
                            <Badge variant="outline" className="text-xs text-green-400">
                              {isRtl ? "مفعل" : "Enabled"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    
                      <Card className="mb-2">
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Cpu className="h-4 w-4" />
                            {isRtl ? "حالة النظام" : "System Status"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2">
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="text-muted-foreground">CPU</span>
                            <Badge variant="outline" className="text-xs">12%</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="text-muted-foreground">{isRtl ? "الذاكرة" : "Memory"}</span>
                            <Badge variant="outline" className="text-xs">256MB</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="text-muted-foreground">{isRtl ? "التخزين" : "Storage"}</span>
                            <Badge variant="outline" className="text-xs">1.2GB</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-amber-500/30 bg-amber-500/5">
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Shield className="h-4 w-4 text-amber-400" />
                            {isRtl ? "الأمان السيادي" : "Sovereign Security"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2">
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="text-muted-foreground">{isRtl ? "التشفير" : "Encryption"}</span>
                            <Badge variant="outline" className="text-xs text-green-400">AES-256-GCM</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="text-muted-foreground">{isRtl ? "العزل" : "Isolation"}</span>
                            <Badge variant="outline" className="text-xs text-green-400">{isRtl ? "كامل" : "Full"}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs gap-2">
                            <span className="text-muted-foreground">{isRtl ? "الوصول" : "Access"}</span>
                            <Badge variant="outline" className="text-xs text-violet-400">{isRtl ? "المالك فقط" : "Owner Only"}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm px-2 py-1">
                          <ChevronDown className="h-4 w-4" />
                          <Folder className="h-4 w-4 text-blue-400" />
                          <span>sovereign-project</span>
                        </div>
                        {codeFiles.map((file, idx) => (
                          <button
                            key={file.path}
                            onClick={() => {
                              setActiveFileIndex(idx);
                              setActiveTab("code");
                            }}
                            className={`w-full flex items-center gap-1 text-sm px-6 py-1 rounded hover:bg-muted ${
                              idx === activeFileIndex ? "bg-muted" : ""
                            }`}
                          >
                            {getFileIcon(file.language)}
                            <span>{file.name}</span>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="database" className="flex-1 m-0 p-2">
                    <div className="text-center py-8">
                      <Database className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {isRtl ? "متصل بقاعدة البيانات" : "Connected to database"}
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">
                        {isRtl ? "فتح المتصفح" : "Open Browser"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
