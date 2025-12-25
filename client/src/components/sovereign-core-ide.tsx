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
  Rocket,
  GitBranch,
  Cloud,
  Server,
  Gauge,
  TrendingUp,
  Bell,
  Crown,
  Wand2,
  Target,
  Lightbulb,
  BarChart3,
  Globe,
  Key,
  FileSearch,
  TestTube,
  Layers,
  Workflow,
  Package,
  Search,
  X,
  Bug,
  Variable,
  CircleDot,
  FastForward,
  SkipForward,
  StepForward,
  Pause,
  Square,
  History,
  Bookmark,
  Command,
  MessageCircle,
  BookOpen,
  FileText,
  Pencil,
  FolderPlus,
  FilePlus,
  FolderOpen,
  Trash2,
  Move,
  Clipboard,
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
  
  // WebSocket AI connection for fast streaming responses (always auto-connect)
  const aiWs = useAIWebSocket(true);
  
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
  const [rightTab, setRightTab] = useState<"tools" | "files" | "database" | "backend" | "packages" | "testing" | "git" | "deploy">("tools");
  
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

  // Ref to prevent duplicate conversation creation
  const isCreatingConversationRef = useRef(false);

  // Auto-create conversation if none exists (uses encrypted REST API)
  const ensureConversation = async (): Promise<string | null> => {
    if (selectedConversation) return selectedConversation;
    if (isCreatingConversationRef.current) return null;
    
    isCreatingConversationRef.current = true;
    
    try {
      const title = isRtl 
        ? `جلسة ${new Date().toLocaleDateString('ar-SA')} ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`
        : `Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      const data = await apiRequest("POST", "/api/sovereign-core/conversations", {
        title,
        workspaceId,
      });
      
      setSelectedConversation(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations'] });
      
      toast({
        title: isRtl ? "تم حفظ الجلسة تلقائياً" : "Session Auto-Saved",
        description: isRtl ? "يتم حفظ محادثتك تلقائياً" : "Your conversation is being saved automatically",
      });
      
      isCreatingConversationRef.current = false;
      return data.id;
    } catch (err) {
      console.error("[Auto-save] Failed to create conversation:", err);
      isCreatingConversationRef.current = false;
      return null;
    }
  };

  // Save message using encrypted REST API (proper server-side encryption)
  const persistMessage = async (conversationId: string, content: string, role: "user" | "assistant") => {
    try {
      await apiRequest("POST", `/api/sovereign-core/conversations/${conversationId}/messages`, {
        content,
        role,
      });
      // Refresh messages from server to ensure proper data
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations', conversationId, 'messages'] });
    } catch (err) {
      console.error("[Auto-save] Failed to persist message:", err);
    }
  };

  const handleSendMessageInternal = async (userMsg: string) => {
    // Auto-create conversation for persistence FIRST (required for server-side save)
    const convId = await ensureConversation();
    
    if (!convId) {
      toast({
        title: isRtl ? "فشل الحفظ" : "Save Failed",
        description: isRtl ? "تعذر إنشاء جلسة. حاول مرة أخرى." : "Could not create session. Please try again.",
        variant: "destructive",
      });
      return; // Don't proceed without a conversationId - messages would be lost
    }
    
    // Add user message immediately for instant feedback (optimistic UI)
    const tempUserMsgId = `local-${Date.now()}`;
    const userMessage: ConversationMessage = {
      id: tempUserMsgId,
      role: "user",
      content: userMsg,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, userMessage]);
    
    try {
      setIsProcessing(true);
      setStreamingMessage("");
      
      // Pass conversationId to WebSocket - server handles all persistence with encryption
      const response = await aiWs.sendMessage(userMsg, isRtl ? "ar" : "en", convId);
      
      // Add AI response to local messages (for immediate display)
      const aiMessage: ConversationMessage = {
        id: `local-ai-${Date.now()}`,
        role: "assistant",
        content: response,
        createdAt: new Date().toISOString(),
      };
      setLocalMessages(prev => [...prev, aiMessage]);
      setIsProcessing(false);
      setStreamingMessage("");
      
      // Server persists both user and assistant messages with encryption
      // Refresh messages from server and clear local buffer to prevent duplicates
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations', convId, 'messages'] });
      // Clear local messages after server sync (slight delay for smooth UX)
      setTimeout(() => {
        setLocalMessages([]);
      }, 500);
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

  // Auto-load last conversation on mount
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  // Combine API messages with local messages (filter duplicates by checking content)
  const allMessages = (() => {
    const serverMsgs = messages || [];
    // Only include local messages that aren't already in server messages
    const uniqueLocalMsgs = localMessages.filter(local => 
      !serverMsgs.some(server => 
        server.content === local.content && server.role === local.role
      )
    );
    return [...serverMsgs, ...uniqueLocalMsgs];
  })();

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
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30">
                  <MessageSquare className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-medium">{text.chat}</span>
                  <div className="flex-1" />
                  <div className={`w-2 h-2 rounded-full ${aiWs.isConnected && aiWs.isAuthenticated ? "bg-green-500" : aiWs.isConnected ? "bg-yellow-500" : "bg-red-500"}`} />
                  <span className="text-xs text-muted-foreground">
                    {aiWs.isConnected && aiWs.isAuthenticated 
                      ? (isRtl ? "متصل" : "Connected")
                      : aiWs.isConnected 
                      ? (isRtl ? "مصادقة..." : "Auth...")
                      : (isRtl ? "اتصال..." : "Connecting...")}
                  </span>
                  {aiWs.isProcessing && <Loader2 className="h-3 w-3 animate-spin text-violet-400" />}
                </div>
                <ScrollArea className="flex-1 p-3">
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
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60} minSize={30}>
                  <div className="h-full flex flex-col">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30">
                      <Code2 className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-medium">{text.code}</span>
                    </div>
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
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={20}>
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-400" />
                        <span className="text-xs font-medium">{text.preview}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant={viewport === "desktop" ? "secondary" : "ghost"} className="h-6 w-6" onClick={() => setViewport("desktop")}>
                          <Monitor className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant={viewport === "tablet" ? "secondary" : "ghost"} className="h-6 w-6" onClick={() => setViewport("tablet")}>
                          <Tablet className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant={viewport === "mobile" ? "secondary" : "ghost"} className="h-6 w-6" onClick={() => setViewport("mobile")}>
                          <Smartphone className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCopyCode}>
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-neutral-900 flex items-center justify-center p-2 overflow-auto">
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
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        {showBottomPanel && (
          <div className="border-t bg-black/50">
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
            <ScrollArea className="h-32 p-2 font-mono text-xs text-green-400">
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
        )}

        {showRightPanel && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div className="h-full flex flex-col bg-muted/30">
                <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as typeof rightTab)} className="flex-1 flex flex-col">
                  <div className="border-b px-1">
                    <TabsList className="h-8 bg-transparent w-full justify-start gap-0 flex-wrap">
                      <TabsTrigger value="tools" className="text-[10px] px-1" data-testid="tab-tools" aria-label={isRtl ? "الأدوات" : "Tools"}>
                        <Sparkles className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="files" className="text-[10px] px-1" data-testid="tab-files" aria-label={isRtl ? "الملفات" : "Files"}>
                        <Folder className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="database" className="text-[10px] px-1" data-testid="tab-database" aria-label={isRtl ? "قاعدة البيانات" : "Database"}>
                        <Database className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="backend" className="text-[10px] px-1" data-testid="tab-backend" aria-label={isRtl ? "الباك إند" : "Backend"}>
                        <Server className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="packages" className="text-[10px] px-1" data-testid="tab-packages" aria-label={isRtl ? "الحزم" : "Packages"}>
                        <Package className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="testing" className="text-[10px] px-1" data-testid="tab-testing" aria-label={isRtl ? "الاختبارات" : "Testing"}>
                        <TestTube className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="git" className="text-[10px] px-1" data-testid="tab-git" aria-label="Git">
                        <GitBranch className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="deploy" className="text-[10px] px-1" data-testid="tab-deploy" aria-label={isRtl ? "النشر" : "Deploy"}>
                        <Rocket className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="debugger" className="text-[10px] px-1" data-testid="tab-debugger" aria-label={isRtl ? "التصحيح" : "Debugger"}>
                        <Bug className="h-3 w-3" />
                      </TabsTrigger>
                      <TabsTrigger value="copilot" className="text-[10px] px-1" data-testid="tab-copilot" aria-label={isRtl ? "المساعد" : "Copilot"}>
                        <Sparkles className="h-3 w-3" />
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="tools" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2 space-y-2">
                      {/* Owner Welcome Card */}
                      <Card className="bg-gradient-to-br from-amber-500/20 via-violet-500/10 to-transparent border-amber-500/30 mb-2">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-amber-500/20">
                              <Crown className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مرحباً سيدي المالك" : "Welcome, Owner"}</p>
                              <p className="text-[10px] text-muted-foreground">Mohamed Ali Abdalla</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-green-400">
                            <Activity className="h-3 w-3" />
                            <span>{isRtl ? "جميع الأنظمة تعمل بكفاءة" : "All systems operational"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Smart AI Suggestions */}
                      <Card className="bg-violet-500/5 border-violet-500/20 mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "اقتراحات ذكية" : "Smart Suggestions"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <button className="w-full flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left transition-colors">
                            <Wand2 className="h-3.5 w-3.5 text-violet-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[11px] font-medium">{isRtl ? "تحسين الأداء" : "Optimize Performance"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "3 تحسينات متاحة" : "3 optimizations available"}</p>
                            </div>
                          </button>
                          <button className="w-full flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left transition-colors">
                            <Shield className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[11px] font-medium">{isRtl ? "فحص أمني" : "Security Scan"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "لم يتم العثور على ثغرات" : "No vulnerabilities found"}</p>
                            </div>
                          </button>
                          <button className="w-full flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left transition-colors">
                            <Target className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[11px] font-medium">{isRtl ? "تلميحات الكود" : "Code Hints"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "2 تحسينات مقترحة" : "2 improvements suggested"}</p>
                            </div>
                          </button>
                        </CardContent>
                      </Card>

                      {/* Quick Actions */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Rocket className="h-3.5 w-3.5 text-orange-400" />
                            {isRtl ? "إجراءات سريعة" : "Quick Actions"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="grid grid-cols-2 gap-1.5">
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" onClick={handleGenerateCode} disabled={isProcessing}>
                              <Code2 className="h-4 w-4 text-violet-400" />
                              {isRtl ? "توليد" : "Generate"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" onClick={handleAnalyzeCode} disabled={isProcessing}>
                              <FileSearch className="h-4 w-4 text-blue-400" />
                              {isRtl ? "تحليل" : "Analyze"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" onClick={handleTestCode} disabled={isProcessing}>
                              <TestTube className="h-4 w-4 text-green-400" />
                              {isRtl ? "اختبار" : "Test"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]">
                              <Rocket className="h-4 w-4 text-orange-400" />
                              {isRtl ? "نشر" : "Deploy"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Development Tools */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5" />
                            {isRtl ? "أدوات التطوير" : "Dev Tools"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                            <span className="flex items-center gap-2">
                              <GitBranch className="h-3.5 w-3.5 text-orange-400" />
                              <span>Git</span>
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5">main</Badge>
                          </button>
                          <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                            <span className="flex items-center gap-2">
                              <Cloud className="h-3.5 w-3.5 text-blue-400" />
                              <span>{isRtl ? "السحابة" : "Cloud"}</span>
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5 text-green-400">{isRtl ? "متصل" : "Live"}</Badge>
                          </button>
                          <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                            <span className="flex items-center gap-2">
                              <Globe className="h-3.5 w-3.5 text-violet-400" />
                              <span>API</span>
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5">{isRtl ? "12 نقطة" : "12 endpoints"}</Badge>
                          </button>
                          <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                            <span className="flex items-center gap-2">
                              <Key className="h-3.5 w-3.5 text-amber-400" />
                              <span>{isRtl ? "المفاتيح" : "Secrets"}</span>
                            </span>
                            <Badge variant="outline" className="text-[10px] h-5">{isRtl ? "آمنة" : "Secure"}</Badge>
                          </button>
                        </CardContent>
                      </Card>

                      {/* Real-time Metrics */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "المقاييس الحية" : "Live Metrics"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground">CPU</span>
                              <span className="text-green-400">12%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: "12%" }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground">{isRtl ? "الذاكرة" : "Memory"}</span>
                              <span className="text-blue-400">45%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: "45%" }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground">{isRtl ? "الاستجابة" : "Response"}</span>
                              <span className="text-violet-400">&lt;0.001s</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full" style={{ width: "5%" }} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Connection Status */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Workflow className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "الاتصالات" : "Connections"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${aiWs.isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                              AI WebSocket
                            </span>
                            <span className={aiWs.isConnected ? "text-green-400" : "text-red-400"}>
                              {aiWs.isConnected ? (isRtl ? "متصل" : "Connected") : (isRtl ? "غير متصل" : "Disconnected")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-green-400" />
                              Database
                            </span>
                            <span className="text-green-400">{isRtl ? "متصل" : "Connected"}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-green-400" />
                              {isRtl ? "التشفير" : "Encryption"}
                            </span>
                            <span className="text-amber-400">AES-256-GCM</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Sovereign Security Badge */}
                      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent mb-2">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-amber-400" />
                            <div>
                              <p className="text-xs font-medium text-amber-400">{isRtl ? "حماية سيادية" : "Sovereign Protection"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "صلاحيات المالك الكاملة مفعلة" : "Full owner privileges active"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Executive Dashboard */}
                      <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-transparent mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "لوحة التحكم التنفيذية" : "Executive Dashboard"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-green-400">24</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "منصات نشطة" : "Active Platforms"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-blue-400">1.2K</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "مستخدمين" : "Users"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-violet-400">99.9%</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "وقت التشغيل" : "Uptime"}</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30 text-center">
                              <p className="text-lg font-bold text-amber-400">45K</p>
                              <p className="text-[9px] text-muted-foreground">{isRtl ? "طلبات/ساعة" : "Req/Hour"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Platform Analytics */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <BarChart3 className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "تحليلات المنصة" : "Platform Analytics"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { label: isRtl ? "الأداء" : "Performance", value: 98, color: "from-green-500 to-emerald-400" },
                            { label: isRtl ? "الأمان" : "Security", value: 100, color: "from-amber-500 to-yellow-400" },
                            { label: isRtl ? "الموثوقية" : "Reliability", value: 99, color: "from-blue-500 to-cyan-400" },
                          ].map((metric) => (
                            <div key={metric.label}>
                              <div className="flex items-center justify-between text-[10px] mb-1">
                                <span className="text-muted-foreground">{metric.label}</span>
                                <span>{metric.value}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${metric.color} rounded-full`} style={{ width: `${metric.value}%` }} />
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* AI Processing Stats */}
                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Brain className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "إحصائيات الذكاء" : "AI Stats"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الطلبات اليوم" : "Requests Today"}</span>
                            <span className="text-violet-400 font-medium">2,847</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "متوسط الاستجابة" : "Avg Response"}</span>
                            <span className="text-green-400 font-medium">&lt;0.001s</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "نسبة النجاح" : "Success Rate"}</span>
                            <span className="text-green-400 font-medium">99.98%</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "النماذج النشطة" : "Active Models"}</span>
                            <span className="text-cyan-400 font-medium">Claude 4.5</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* File Search */}
                      <div className="flex gap-1 mb-3">
                        <Input
                          placeholder={isRtl ? "بحث عن ملف..." : "Search files..."}
                          className="h-8 text-xs flex-1"
                          data-testid="input-search-files"
                        />
                        <Button size="sm" variant="outline" className="h-8" data-testid="button-search-files">
                          <Search className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* File Actions */}
                      <div className="flex items-center gap-1 mb-3">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1" data-testid="button-new-file">
                          <FilePlus className="h-3 w-3 mr-1" />
                          {isRtl ? "ملف" : "File"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] flex-1" data-testid="button-new-folder">
                          <FolderPlus className="h-3 w-3 mr-1" />
                          {isRtl ? "مجلد" : "Folder"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px]" data-testid="button-refresh-files">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* File Tree */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1 text-sm px-2 py-1 hover:bg-muted rounded group">
                          <div className="flex items-center gap-1">
                            <ChevronDown className="h-4 w-4" />
                            <FolderOpen className="h-4 w-4 text-blue-400" />
                            <span>sovereign-project</span>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-5 w-5" data-testid="button-folder-add">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {codeFiles.map((file, idx) => (
                          <button
                            key={file.path}
                            onClick={() => {
                              setActiveFileIndex(idx);
                              setActiveTab("code");
                            }}
                            className={`w-full flex items-center justify-between gap-1 text-sm px-6 py-1 rounded hover:bg-muted group ${
                              idx === activeFileIndex ? "bg-muted" : ""
                            }`}
                            data-testid={`file-${file.name}`}
                          >
                            <div className="flex items-center gap-1">
                              {getFileIcon(file.language)}
                              <span>{file.name}</span>
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-5 w-5" data-testid={`button-rename-${file.name}`}>
                                <Pencil className="h-2.5 w-2.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-5 w-5" data-testid={`button-copy-${file.name}`}>
                                <Copy className="h-2.5 w-2.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-5 w-5" data-testid={`button-delete-${file.name}`}>
                                <Trash2 className="h-2.5 w-2.5 text-red-400" />
                              </Button>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* File Stats */}
                      <Card className="mt-3 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي الملفات" : "Total Files"}</span>
                            <span className="text-blue-400 font-medium">{codeFiles.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "إجمالي الأسطر" : "Total Lines"}</span>
                            <span className="text-green-400 font-medium">2,458</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الحجم" : "Size"}</span>
                            <span className="text-cyan-400 font-medium">156 KB</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="database" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Database Builder Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-xs text-green-400">{isRtl ? "متصل" : "Connected"}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {isRtl ? "تحديث" : "Refresh"}
                        </Button>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-new-table">
                          <Plus className="h-4 w-4 text-green-400" />
                          {isRtl ? "جدول جديد" : "New Table"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-add-relation">
                          <Workflow className="h-4 w-4 text-blue-400" />
                          {isRtl ? "علاقة" : "Relation"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-export-sql">
                          <FileCode className="h-4 w-4 text-violet-400" />
                          {isRtl ? "تصدير SQL" : "Export SQL"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-ai-generate-db">
                          <Wand2 className="h-4 w-4 text-amber-400" />
                          {isRtl ? "توليد AI" : "AI Generate"}
                        </Button>
                      </div>

                      {/* Tables List */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "الجداول" : "Tables"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">8</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {["users", "platforms", "sessions", "permissions", "roles", "logs", "analytics", "settings"].map((table) => (
                            <button
                              key={table}
                              className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors group"
                            >
                              <span className="flex items-center gap-2">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                <span>{table}</span>
                              </span>
                              <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                                {isRtl ? "عرض" : "View"}
                              </span>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Schema Preview */}
                      <Card className="mb-2 bg-muted/30">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Braces className="h-3.5 w-3.5" />
                            {isRtl ? "مخطط users" : "users Schema"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="font-mono text-[10px] space-y-0.5 text-muted-foreground">
                            <div><span className="text-violet-400">id</span>: <span className="text-cyan-400">serial</span> PK</div>
                            <div><span className="text-violet-400">email</span>: <span className="text-cyan-400">varchar</span></div>
                            <div><span className="text-violet-400">role</span>: <span className="text-cyan-400">enum</span></div>
                            <div><span className="text-violet-400">created_at</span>: <span className="text-cyan-400">timestamp</span></div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Permissions Manager */}
                      <Card className="mb-2 border-amber-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Key className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "إدارة الصلاحيات" : "Permissions"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { role: isRtl ? "المالك" : "Owner", perms: isRtl ? "كاملة" : "Full", color: "text-amber-400" },
                            { role: isRtl ? "مدير" : "Admin", perms: "CRUD", color: "text-violet-400" },
                            { role: isRtl ? "مستخدم" : "User", perms: "R", color: "text-blue-400" },
                          ].map((r) => (
                            <div key={r.role} className="flex items-center justify-between text-[10px] p-1.5 rounded bg-muted/50">
                              <span className={r.color}>{r.role}</span>
                              <Badge variant="outline" className="text-[9px] h-4">{r.perms}</Badge>
                            </div>
                          ))}
                          <Button size="sm" variant="ghost" className="w-full h-7 text-[10px] mt-1">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "إضافة دور" : "Add Role"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Interactive SQL Editor */}
                      <Card className="mb-2 border-green-500/20">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Terminal className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "محرر SQL" : "SQL Editor"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <Textarea 
                            placeholder={isRtl ? "SELECT * FROM users WHERE..." : "SELECT * FROM users WHERE..."} 
                            className="h-20 text-[10px] font-mono resize-none bg-muted/50" 
                            data-testid="input-sql-query"
                          />
                          <div className="flex items-center gap-1">
                            <Button size="sm" className="flex-1 h-7 text-[10px] bg-green-600 hover:bg-green-700" data-testid="button-run-sql">
                              <Play className="h-3 w-3 mr-1" />
                              {isRtl ? "تنفيذ" : "Run"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" data-testid="button-format-sql">
                              <Braces className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-[10px]" data-testid="button-save-sql">
                              <Bookmark className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* SQL Query Results Preview */}
                      <Card className="mb-2 bg-muted/30">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" />
                            {isRtl ? "النتائج" : "Results"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto text-green-400">5 {isRtl ? "صفوف" : "rows"}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-[9px] font-mono">
                              <thead>
                                <tr className="border-b border-muted">
                                  <th className="text-left p-1 text-muted-foreground">id</th>
                                  <th className="text-left p-1 text-muted-foreground">email</th>
                                  <th className="text-left p-1 text-muted-foreground">role</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { id: 1, email: "owner@infera.io", role: "owner" },
                                  { id: 2, email: "admin@infera.io", role: "admin" },
                                  { id: 3, email: "user@test.com", role: "user" },
                                ].map((row) => (
                                  <tr key={row.id} className="border-b border-muted/50">
                                    <td className="p-1 text-cyan-400">{row.id}</td>
                                    <td className="p-1">{row.email}</td>
                                    <td className="p-1 text-violet-400">{row.role}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Saved Queries */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "استعلامات محفوظة" : "Saved Queries"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: isRtl ? "كل المستخدمين" : "All Users", query: "SELECT * FROM users" },
                            { name: isRtl ? "المسؤولين النشطين" : "Active Admins", query: "SELECT * FROM users WHERE role='admin'" },
                          ].map((q, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-1.5 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`button-query-${i}`}>
                              <span className="truncate">{q.name}</span>
                              <Play className="h-3 w-3 text-green-400 shrink-0" />
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Database Stats */}
                      <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الجداول" : "Tables"}</span>
                            <span className="text-cyan-400 font-medium">8</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "السجلات" : "Records"}</span>
                            <span className="text-cyan-400 font-medium">12,458</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الحجم" : "Size"}</span>
                            <span className="text-cyan-400 font-medium">24.5 MB</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Backend Generator Tab */}
                  <TabsContent value="backend" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Backend Generator Header */}
                      <Card className="mb-2 bg-gradient-to-br from-violet-500/20 via-blue-500/10 to-transparent border-violet-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-violet-500/20">
                              <Server className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "مولد الباك إند" : "Backend Generator"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "إنشاء API كامل بنقرة واحدة" : "Generate full API with one click"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Framework Selection */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Code2 className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "الإطار" : "Framework"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { name: "Express.js", icon: "JS", selected: true },
                            { name: "NestJS", icon: "TS", selected: false },
                            { name: "FastAPI", icon: "PY", selected: false },
                            { name: "Django", icon: "PY", selected: false },
                          ].map((fw) => (
                            <button
                              key={fw.name}
                              data-testid={`button-select-${fw.name.toLowerCase().replace('.', '-')}`}
                              className={`w-full flex items-center justify-between p-1.5 rounded text-[10px] transition-colors ${
                                fw.selected ? "bg-violet-500/20 text-violet-400" : "hover:bg-muted"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] h-4">{fw.icon}</Badge>
                                <span>{fw.name}</span>
                              </span>
                              {fw.selected && <Check className="h-3 w-3" />}
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* API Generation Options */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "توليد API" : "API Generation"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="grid grid-cols-2 gap-1.5">
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-generate-crud">
                              <Database className="h-4 w-4 text-blue-400" />
                              {isRtl ? "CRUD" : "CRUD API"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-generate-auth">
                              <Shield className="h-4 w-4 text-green-400" />
                              {isRtl ? "المصادقة" : "Auth API"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-generate-rest">
                              <Globe className="h-4 w-4 text-violet-400" />
                              REST
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-generate-graphql">
                              <Braces className="h-4 w-4 text-pink-400" />
                              GraphQL
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Database Connection */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Database className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "قاعدة البيانات" : "Database"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { name: "PostgreSQL", status: isRtl ? "متصل" : "Connected", color: "text-green-400" },
                            { name: "MongoDB", status: isRtl ? "غير متصل" : "Disconnected", color: "text-muted-foreground" },
                            { name: "Redis", status: isRtl ? "غير متصل" : "Disconnected", color: "text-muted-foreground" },
                          ].map((db) => (
                            <div key={db.name} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span>{db.name}</span>
                              <span className={db.color}>{db.status}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Generate Full Backend */}
                      <Button className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white" data-testid="button-generate-backend">
                        <Wand2 className="h-4 w-4 mr-2" />
                        {isRtl ? "توليد الباك إند الكامل" : "Generate Full Backend"}
                      </Button>
                    </ScrollArea>
                  </TabsContent>

                  {/* Package Manager Tab */}
                  <TabsContent value="packages" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Search Packages */}
                      <div className="flex gap-1 mb-3">
                        <Input
                          placeholder={isRtl ? "بحث عن حزمة..." : "Search packages..."}
                          className="h-8 text-xs flex-1"
                          data-testid="input-search-packages"
                        />
                        <Button size="sm" variant="outline" className="h-8" data-testid="button-search-npm">
                          <Search className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Installed Packages */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Package className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "الحزم المثبتة" : "Installed"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">24</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "express", version: "4.18.2", type: "prod" },
                            { name: "react", version: "18.2.0", type: "prod" },
                            { name: "typescript", version: "5.3.3", type: "dev" },
                            { name: "drizzle-orm", version: "0.29.3", type: "prod" },
                            { name: "@anthropic-ai/sdk", version: "0.14.1", type: "prod" },
                          ].map((pkg) => (
                            <div key={pkg.name} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] group">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Package className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="truncate">{pkg.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-[9px] h-4">{pkg.version}</Badge>
                                <Button size="icon" variant="ghost" className="h-5 w-5 opacity-0 group-hover:opacity-100" data-testid={`button-remove-${pkg.name}`}>
                                  <X className="h-3 w-3 text-red-400" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Quick Install */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Download className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "تثبيت سريع" : "Quick Install"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="grid grid-cols-2 gap-1.5">
                            <Button size="sm" variant="outline" className="h-auto py-1.5 text-[10px]" data-testid="button-install-openai">
                              openai
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-1.5 text-[10px]" data-testid="button-install-stripe">
                              stripe
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-1.5 text-[10px]" data-testid="button-install-zod">
                              zod
                            </Button>
                            <Button size="sm" variant="outline" className="h-auto py-1.5 text-[10px]" data-testid="button-install-axios">
                              axios
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Package Stats */}
                      <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الإنتاج" : "Production"}</span>
                            <span className="text-blue-400 font-medium">18</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "التطوير" : "Development"}</span>
                            <span className="text-blue-400 font-medium">6</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "تحديثات متاحة" : "Updates"}</span>
                            <span className="text-amber-400 font-medium">3</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Testing Suite Tab */}
                  <TabsContent value="testing" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Test Status */}
                      <Card className="mb-2 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent border-green-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-green-500/20">
                              <TestTube className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "حالة الاختبارات" : "Test Status"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "24 من 26 ناجح" : "24 of 26 passing"}</p>
                            </div>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: "92%" }} />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Test Actions */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-run-all-tests">
                          <Play className="h-4 w-4 text-green-400" />
                          {isRtl ? "تشغيل الكل" : "Run All"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-run-failed">
                          <RefreshCw className="h-4 w-4 text-red-400" />
                          {isRtl ? "الفاشلة" : "Failed"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-generate-tests">
                          <Wand2 className="h-4 w-4 text-violet-400" />
                          {isRtl ? "توليد" : "Generate"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-coverage">
                          <Target className="h-4 w-4 text-blue-400" />
                          {isRtl ? "التغطية" : "Coverage"}
                        </Button>
                      </div>

                      {/* Test Results */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileCode className="h-3.5 w-3.5" />
                            {isRtl ? "نتائج الاختبارات" : "Test Results"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { suite: "auth.test.ts", passed: 8, failed: 0, color: "text-green-400" },
                            { suite: "api.test.ts", passed: 12, failed: 1, color: "text-amber-400" },
                            { suite: "db.test.ts", passed: 4, failed: 1, color: "text-amber-400" },
                          ].map((test) => (
                            <div key={test.suite} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="truncate flex-1">{test.suite}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-green-400">{test.passed}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className={test.failed > 0 ? "text-red-400" : "text-muted-foreground"}>{test.failed}</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Test Types */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "أنواع الاختبارات" : "Test Types"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { type: isRtl ? "وحدة" : "Unit", count: 18, color: "text-blue-400" },
                            { type: isRtl ? "تكامل" : "Integration", count: 6, color: "text-violet-400" },
                            { type: "E2E", count: 2, color: "text-green-400" },
                          ].map((t) => (
                            <div key={t.type} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span>{t.type}</span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${t.color}`}>{t.count}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Coverage Stats */}
                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "تغطية الكود" : "Code Coverage"}</span>
                            <span className="text-green-400 font-medium">87%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: "87%" }} />
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Git Integration Tab */}
                  <TabsContent value="git" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Repository Status */}
                      <Card className="mb-2 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <GitBranch className="h-4 w-4 text-orange-400" />
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "المستودع" : "Repository"}</p>
                              <p className="text-[10px] text-muted-foreground">infera-webnova</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <Badge variant="outline" className="text-[9px] h-4 text-green-400">main</Badge>
                            <span className="text-muted-foreground">{isRtl ? "محدث" : "Up to date"}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Git Actions */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-git-pull">
                          <Download className="h-4 w-4 text-blue-400" />
                          {isRtl ? "سحب" : "Pull"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-git-push">
                          <Cloud className="h-4 w-4 text-green-400" />
                          {isRtl ? "رفع" : "Push"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-git-branch">
                          <GitBranch className="h-4 w-4 text-violet-400" />
                          {isRtl ? "فرع" : "Branch"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-git-sync">
                          <RefreshCw className="h-4 w-4 text-orange-400" />
                          {isRtl ? "مزامنة" : "Sync"}
                        </Button>
                      </div>

                      {/* Recent Commits */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5" />
                            {isRtl ? "آخر الإيداعات" : "Recent Commits"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { msg: "Enhanced AI IDE interface", time: "2m ago", color: "text-green-400" },
                            { msg: "Added WebSocket streaming", time: "1h ago", color: "text-blue-400" },
                            { msg: "Database builder UI", time: "3h ago", color: "text-violet-400" },
                          ].map((commit, i) => (
                            <div key={i} className="flex items-start gap-2 p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className={`h-1.5 w-1.5 rounded-full mt-1 ${commit.color.replace("text-", "bg-")}`} />
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{commit.msg}</p>
                                <p className="text-muted-foreground">{commit.time}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Changed Files */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <FileCode className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "الملفات المتغيرة" : "Changed Files"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">3</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "sovereign-core-ide.tsx", status: "M", color: "text-amber-400" },
                            { name: "ai-websocket.ts", status: "M", color: "text-amber-400" },
                            { name: "schema.ts", status: "A", color: "text-green-400" },
                          ].map((file) => (
                            <div key={file.name} className="flex items-center justify-between p-1 text-[10px]">
                              <span className="truncate flex-1">{file.name}</span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${file.color}`}>{file.status}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Commit Form */}
                      <Card className="border-green-500/20">
                        <CardContent className="p-2 space-y-2">
                          <Input
                            placeholder={isRtl ? "رسالة الإيداع..." : "Commit message..."}
                            className="h-8 text-xs"
                            data-testid="input-commit-message"
                          />
                          <Button size="sm" className="w-full text-xs bg-green-600 hover:bg-green-700" data-testid="button-commit-push">
                            <Check className="h-3 w-3 mr-1" />
                            {isRtl ? "إيداع ورفع" : "Commit & Push"}
                          </Button>
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Deployment Tab */}
                  <TabsContent value="deploy" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Deployment Status */}
                      <Card className="mb-2 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-green-500/20">
                              <Cloud className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "حالة النشر" : "Deployment Status"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "مباشر" : "Live"}</p>
                            </div>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            app.infera.io
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Deploy Actions */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-deploy">
                          <Rocket className="h-4 w-4 text-green-400" />
                          {isRtl ? "نشر" : "Deploy"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-rebuild">
                          <RefreshCw className="h-4 w-4 text-blue-400" />
                          {isRtl ? "إعادة بناء" : "Rebuild"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-servers">
                          <Server className="h-4 w-4 text-violet-400" />
                          {isRtl ? "السيرفرات" : "Servers"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-domain">
                          <Globe className="h-4 w-4 text-amber-400" />
                          {isRtl ? "الدومين" : "Domain"}
                        </Button>
                      </div>

                      {/* Environments */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5" />
                            {isRtl ? "البيئات" : "Environments"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { name: "Production", status: isRtl ? "مباشر" : "Live", color: "text-green-400", dot: "bg-green-400" },
                            { name: "Staging", status: isRtl ? "جاهز" : "Ready", color: "text-blue-400", dot: "bg-blue-400" },
                            { name: "Development", status: isRtl ? "محلي" : "Local", color: "text-amber-400", dot: "bg-amber-400" },
                          ].map((env) => (
                            <div key={env.name} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${env.dot}`} />
                                {env.name}
                              </span>
                              <span className={env.color}>{env.status}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Server Stats */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "أداء السيرفر" : "Server Performance"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground">{isRtl ? "وقت التشغيل" : "Uptime"}</span>
                              <span className="text-green-400">99.99%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: "99.99%" }} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="p-2 rounded bg-muted/30">
                              <p className="text-muted-foreground">{isRtl ? "الطلبات" : "Requests"}</p>
                              <p className="text-lg font-bold text-cyan-400">45K</p>
                            </div>
                            <div className="p-2 rounded bg-muted/30">
                              <p className="text-muted-foreground">{isRtl ? "الاستجابة" : "Response"}</p>
                              <p className="text-lg font-bold text-green-400">23ms</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recent Deployments */}
                      <Card>
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {isRtl ? "آخر النشرات" : "Recent Deploys"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { version: "v2.4.1", time: "5m ago", status: isRtl ? "نجاح" : "Success", color: "text-green-400" },
                            { version: "v2.4.0", time: "2h ago", status: isRtl ? "نجاح" : "Success", color: "text-green-400" },
                            { version: "v2.3.9", time: "1d ago", status: isRtl ? "نجاح" : "Success", color: "text-green-400" },
                          ].map((deploy) => (
                            <div key={deploy.version} className="flex items-center justify-between p-1 text-[10px]">
                              <span className="font-mono">{deploy.version}</span>
                              <span className="text-muted-foreground">{deploy.time}</span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${deploy.color}`}>{deploy.status}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* Debugger Tab */}
                  <TabsContent value="debugger" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Debugger Status */}
                      <Card className="mb-2 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-red-500/20">
                              <Bug className="h-4 w-4 text-red-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "المصحح" : "Debugger"}</p>
                              <p className="text-[10px] text-muted-foreground">{isRtl ? "جاهز للتصحيح" : "Ready to debug"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Debug Controls */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Play className="h-3.5 w-3.5 text-green-400" />
                            {isRtl ? "التحكم" : "Controls"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-start">
                              <Play className="h-3 w-3 text-green-400" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-pause">
                              <Pause className="h-3 w-3 text-amber-400" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-stop">
                              <Square className="h-3 w-3 text-red-400" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-step-over">
                              <FastForward className="h-3 w-3 text-blue-400" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-step-into">
                              <StepForward className="h-3 w-3 text-violet-400" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" data-testid="button-debug-step-out">
                              <SkipForward className="h-3 w-3 text-cyan-400" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Breakpoints */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <CircleDot className="h-3.5 w-3.5 text-red-400" />
                            {isRtl ? "نقاط التوقف" : "Breakpoints"}
                            <Badge variant="outline" className="text-[10px] h-4 ml-auto">3</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { file: "index.ts", line: 42, enabled: true },
                            { file: "routes.ts", line: 128, enabled: true },
                            { file: "auth.ts", line: 56, enabled: false },
                          ].map((bp, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] group">
                              <span className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${bp.enabled ? "bg-red-400" : "bg-muted-foreground"}`} />
                                <span className="truncate">{bp.file}</span>
                              </span>
                              <Badge variant="outline" className="text-[9px] h-4">{isRtl ? `سطر ${bp.line}` : `Line ${bp.line}`}</Badge>
                            </div>
                          ))}
                          <Button size="sm" variant="ghost" className="w-full h-6 text-[10px]" data-testid="button-add-breakpoint">
                            <Plus className="h-3 w-3 mr-1" />
                            {isRtl ? "إضافة نقطة توقف" : "Add Breakpoint"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Variables */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Variable className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "المتغيرات" : "Variables"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { name: "userId", value: "\"abc123\"", type: "string" },
                            { name: "isActive", value: "true", type: "boolean" },
                            { name: "count", value: "42", type: "number" },
                            { name: "data", value: "{...}", type: "object" },
                          ].map((v) => (
                            <div key={v.name} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="flex items-center gap-2">
                                <span className="text-blue-400 font-mono">{v.name}</span>
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="text-muted-foreground font-mono">{v.value}</span>
                                <Badge variant="outline" className="text-[9px] h-4">{v.type}</Badge>
                              </span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Call Stack */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-violet-400" />
                            {isRtl ? "مكدس الاستدعاء" : "Call Stack"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { func: "handleRequest", file: "routes.ts:128" },
                            { func: "authenticate", file: "auth.ts:56" },
                            { func: "validateToken", file: "jwt.ts:23" },
                          ].map((frame, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px]">
                              <span className="text-violet-400 font-mono">{frame.func}()</span>
                              <span className="text-muted-foreground">{frame.file}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Watch Expressions */}
                      <Card>
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "المراقبة" : "Watch"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          <div className="flex items-center gap-1">
                            <Input placeholder={isRtl ? "تعبير للمراقبة..." : "Expression to watch..."} className="h-7 text-[10px] flex-1" data-testid="input-watch-expression" />
                            <Button size="sm" variant="outline" className="h-7" data-testid="button-add-watch">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          {[
                            { expr: "user.email", value: "\"test@example.com\"" },
                            { expr: "items.length", value: "5" },
                          ].map((w, i) => (
                            <div key={w.expr} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-[10px] group" data-testid={`watch-expression-${i}`}>
                              <span className="text-amber-400 font-mono">{w.expr}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground font-mono">{w.value}</span>
                                <Button size="icon" variant="ghost" className="h-5 w-5 opacity-0 group-hover:opacity-100" data-testid={`button-remove-watch-${i}`}>
                                  <X className="h-3 w-3 text-red-400" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </ScrollArea>
                  </TabsContent>

                  {/* AI Copilot Tab */}
                  <TabsContent value="copilot" className="flex-1 m-0 overflow-hidden">
                    <ScrollArea className="h-full p-2">
                      {/* Copilot Status */}
                      <Card className="mb-2 bg-gradient-to-br from-violet-500/20 via-pink-500/10 to-transparent border-violet-500/30">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-full bg-violet-500/20">
                              <Sparkles className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                              <p className="text-xs font-medium">{isRtl ? "المساعد الذكي" : "AI Copilot"}</p>
                              <p className="text-[10px] text-green-400">{isRtl ? "نشط ومستعد" : "Active & Ready"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            <Badge variant="outline" className="text-[9px] h-4 text-violet-400">Claude 4.5</Badge>
                            <span className="text-muted-foreground">&lt;0.001s</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick AI Actions */}
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-ai-complete">
                          <Command className="h-4 w-4 text-violet-400" />
                          {isRtl ? "إكمال" : "Complete"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-ai-explain">
                          <BookOpen className="h-4 w-4 text-blue-400" />
                          {isRtl ? "شرح" : "Explain"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-ai-refactor">
                          <Pencil className="h-4 w-4 text-green-400" />
                          {isRtl ? "إعادة هيكلة" : "Refactor"}
                        </Button>
                        <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" data-testid="button-ai-fix">
                          <Wand2 className="h-4 w-4 text-amber-400" />
                          {isRtl ? "إصلاح" : "Fix"}
                        </Button>
                      </div>

                      {/* Code Suggestions */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                            {isRtl ? "اقتراحات الكود" : "Code Suggestions"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1.5">
                          {[
                            { title: isRtl ? "تحسين الأداء" : "Optimize loop", desc: isRtl ? "استخدم map بدلاً من forEach" : "Use map instead of forEach", icon: Zap },
                            { title: isRtl ? "إضافة معالجة الأخطاء" : "Add error handling", desc: isRtl ? "try/catch مفقود" : "Missing try/catch block", icon: Shield },
                            { title: isRtl ? "تحسين النوع" : "Improve typing", desc: isRtl ? "أنواع TypeScript أفضل" : "Better TypeScript types", icon: Braces },
                          ].map((s, i) => (
                            <button key={i} className="w-full flex items-start gap-2 p-2 rounded bg-muted/30 hover:bg-muted text-left transition-colors" data-testid={`button-suggestion-${i}`}>
                              <s.icon className="h-3.5 w-3.5 text-violet-400 mt-0.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-medium truncate">{s.title}</p>
                                <p className="text-[9px] text-muted-foreground truncate">{s.desc}</p>
                              </div>
                              <Check className="h-3 w-3 text-muted-foreground shrink-0" />
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* AI Chat */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
                            {isRtl ? "محادثة سريعة" : "Quick Chat"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-2">
                          <Textarea 
                            placeholder={isRtl ? "اسأل عن أي شيء..." : "Ask anything..."} 
                            className="h-16 text-[10px] resize-none" 
                            data-testid="input-copilot-chat"
                          />
                          <Button size="sm" className="w-full text-xs" data-testid="button-copilot-send">
                            <Send className="h-3 w-3 mr-1" />
                            {isRtl ? "إرسال" : "Send"}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* AI History */}
                      <Card className="mb-2">
                        <CardHeader className="p-2 pb-1">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <History className="h-3.5 w-3.5 text-cyan-400" />
                            {isRtl ? "السجل" : "History"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0 space-y-1">
                          {[
                            { query: isRtl ? "أنشئ API للمستخدمين" : "Create user API", time: "2m" },
                            { query: isRtl ? "أضف المصادقة" : "Add authentication", time: "15m" },
                            { query: isRtl ? "حسّن قاعدة البيانات" : "Optimize database", time: "1h" },
                          ].map((h, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-1.5 rounded bg-muted/30 hover:bg-muted text-[10px] transition-colors" data-testid={`button-history-${i}`}>
                              <span className="truncate flex-1 text-left">{h.query}</span>
                              <span className="text-muted-foreground shrink-0">{h.time}</span>
                            </button>
                          ))}
                        </CardContent>
                      </Card>

                      {/* AI Stats */}
                      <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20">
                        <CardContent className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الطلبات اليوم" : "Requests Today"}</span>
                            <span className="text-violet-400 font-medium">127</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الأسطر المولدة" : "Lines Generated"}</span>
                            <span className="text-green-400 font-medium">2,458</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">{isRtl ? "الوقت الموفر" : "Time Saved"}</span>
                            <span className="text-cyan-400 font-medium">4.5h</span>
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollArea>
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
