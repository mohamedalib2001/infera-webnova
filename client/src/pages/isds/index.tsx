import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Shield, 
  Zap, 
  Code2, 
  Database, 
  Globe, 
  Rocket, 
  FileCode, 
  Terminal,
  Settings,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Play,
  RefreshCw,
  Copy,
  Download,
  Folder,
  Plus,
  MessageSquare,
  Cpu,
  Activity,
  HardDrive,
  Clock,
  ArrowRight,
  Wand2,
  Brain,
  Command,
  ChevronRight,
  History,
  Trash2,
  User,
  X,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  executionPlan?: ExecutionStep[];
  status?: "pending" | "executing" | "completed" | "error";
}

interface ExecutionStep {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  status: "pending" | "in_progress" | "completed" | "error";
  progress?: number;
  output?: string;
}

interface QuickCommand {
  id: string;
  icon: typeof Code2;
  label: string;
  labelAr: string;
  command: string;
  category: string;
}

const quickCommands: QuickCommand[] = [
  { id: "create-api", icon: Code2, label: "Create API", labelAr: "إنشاء API", command: "أنشئ API جديد للمستخدمين مع CRUD كامل", category: "backend" },
  { id: "add-page", icon: Globe, label: "Add Page", labelAr: "إضافة صفحة", command: "أضف صفحة تسجيل دخول مع نموذج", category: "frontend" },
  { id: "create-component", icon: FileCode, label: "Create Component", labelAr: "إنشاء مكون", command: "أنشئ مكون جدول بيانات قابل للتصفية", category: "frontend" },
  { id: "analyze-code", icon: Brain, label: "Analyze Code", labelAr: "تحليل الكود", command: "حلل الكود الحالي واقترح تحسينات", category: "analysis" },
  { id: "fix-errors", icon: AlertCircle, label: "Fix Errors", labelAr: "إصلاح الأخطاء", command: "ابحث عن الأخطاء في المشروع وأصلحها", category: "debug" },
  { id: "create-database", icon: Database, label: "Create Database", labelAr: "إنشاء قاعدة بيانات", command: "أنشئ جدول قاعدة بيانات للمنتجات", category: "database" },
  { id: "deploy-project", icon: Rocket, label: "Deploy Project", labelAr: "نشر المشروع", command: "انشر المشروع على السحابة", category: "deployment" },
];

const translations = {
  ar: {
    title: "مساعد الذكاء الاصطناعي التنفيذي",
    subtitle: "وجّه أوامرك وسأنفذها فوراً",
    placeholder: "اكتب أمرك هنا... مثال: أنشئ API للمستخدمين",
    send: "إرسال",
    quickCommands: "أوامر سريعة",
    executionLog: "سجل التنفيذ",
    projectContext: "سياق المشروع",
    noMessages: "ابدأ بإرسال أمر أو اختر من الأوامر السريعة",
    thinking: "جاري التحليل...",
    executing: "جاري التنفيذ...",
    completed: "اكتمل",
    error: "خطأ",
    pending: "قيد الانتظار",
    inProgress: "قيد التنفيذ",
    files: "ملفات",
    apis: "واجهات برمجية",
    components: "مكونات",
    newConversation: "محادثة جديدة",
    history: "السجل",
    suggestions: "اقتراحات",
    clear: "مسح",
    copy: "نسخ",
    retry: "إعادة المحاولة",
    welcome: "مرحباً! أنا مساعدك الذكي. أخبرني ماذا تريد أن أنفذ لك.",
    cpuUsage: "المعالج",
    memoryUsage: "الذاكرة",
    uptime: "وقت التشغيل",
    accessDenied: "الوصول مرفوض",
    accessDeniedDesc: "هذه الخدمة متاحة فقط للحسابات السيادية",
    goBack: "العودة للوحة التحكم",
    categories: {
      backend: "الخلفية",
      frontend: "الواجهة",
      database: "قاعدة البيانات",
      deployment: "النشر",
      analysis: "التحليل",
      debug: "التصحيح",
    },
  },
  en: {
    title: "AI Executive Assistant",
    subtitle: "Give your commands and I'll execute them instantly",
    placeholder: "Type your command... Example: Create a users API",
    send: "Send",
    quickCommands: "Quick Commands",
    executionLog: "Execution Log",
    projectContext: "Project Context",
    noMessages: "Start by sending a command or choose from quick commands",
    thinking: "Analyzing...",
    executing: "Executing...",
    completed: "Completed",
    error: "Error",
    pending: "Pending",
    inProgress: "In Progress",
    files: "Files",
    apis: "APIs",
    components: "Components",
    newConversation: "New Conversation",
    history: "History",
    suggestions: "Suggestions",
    clear: "Clear",
    copy: "Copy",
    retry: "Retry",
    welcome: "Hello! I'm your AI assistant. Tell me what you want me to execute.",
    cpuUsage: "CPU",
    memoryUsage: "Memory",
    uptime: "Uptime",
    accessDenied: "Access Denied",
    accessDeniedDesc: "This service is only available for sovereign accounts",
    goBack: "Go to Dashboard",
    categories: {
      backend: "Backend",
      frontend: "Frontend",
      database: "Database",
      deployment: "Deployment",
      analysis: "Analysis",
      debug: "Debug",
    },
  },
};

export default function ISDSPage() {
  const { user } = useAuth();
  const { isRtl, language } = useLanguage();
  const isRTL = isRtl || language === "ar";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const t = translations[isRTL ? "ar" : "en"];

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t.welcome,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<ExecutionStep[] | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const executeCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      return apiRequest("POST", "/api/platform/ai/execute-command", { 
        command, 
        language: isRTL ? "ar" : "en",
        context: {
          projectType: "fullstack",
          framework: "react-express",
        }
      });
    },
    onSuccess: (data: { 
      response: string; 
      executionPlan?: ExecutionStep[];
      generatedFiles?: string[];
      status: "success" | "partial" | "error";
    }) => {
      const assistantMessage: AIMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        executionPlan: data.executionPlan,
        status: data.status === "success" ? "completed" : data.status === "error" ? "error" : "executing",
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      
      if (data.executionPlan) {
        setCurrentExecution(data.executionPlan);
      }
    },
    onError: (error: Error) => {
      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: isRTL 
          ? `حدث خطأ: ${error.message}. سأحاول مرة أخرى أو يمكنك تعديل الأمر.`
          : `Error occurred: ${error.message}. I'll try again or you can modify the command.`,
        timestamp: new Date(),
        status: "error",
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
    },
  });

  const handleSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);
    
    executeCommandMutation.mutate(inputValue);
  };

  const handleQuickCommand = (command: QuickCommand) => {
    setInputValue(command.command);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewConversation = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: t.welcome,
      timestamp: new Date(),
    }]);
    setCurrentExecution(null);
  };

  const isAuthorized = user && (user.role === "owner" || user.role === "sovereign");

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">{t.accessDenied}</h1>
          <p className="text-muted-foreground mb-4">{t.accessDeniedDesc}</p>
          <Button onClick={() => setLocation("/owner")} data-testid="button-go-back">
            {t.goBack}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-lg blur opacity-75"></div>
                <div className="relative p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-sm text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">{isRTL ? "نشط" : "Active"}</span>
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNewConversation}
                data-testid="button-new-conversation"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t.newConversation}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`w-64 border-${isRTL ? "l" : "r"} bg-card/30 hidden lg:flex flex-col`}>
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Command className="w-4 h-4" />
              {t.quickCommands}
            </h3>
            <div className="space-y-1">
              {quickCommands.map((cmd) => (
                <Button
                  key={cmd.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => handleQuickCommand(cmd)}
                  data-testid={`quick-command-${cmd.id}`}
                >
                  <cmd.icon className="w-4 h-4 text-muted-foreground" />
                  <span>{isRTL ? cmd.labelAr : cmd.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 flex-1">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <History className="w-4 h-4" />
              {t.history}
            </h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="italic">{isRTL ? "لا يوجد سجل" : "No history"}</p>
            </div>
          </div>

          <div className="p-4 border-t bg-muted/30">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">{t.projectContext}</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Folder className="w-3 h-3" />
                  {t.files}
                </span>
                <Badge variant="secondary" className="text-xs">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  {t.apis}
                </span>
                <Badge variant="secondary" className="text-xs">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <FileCode className="w-3 h-3" />
                  {t.components}
                </span>
                <Badge variant="secondary" className="text-xs">8</Badge>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-gradient-to-br from-purple-500 to-primary"
                  }`}>
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`flex-1 max-w-[80%] ${message.role === "user" ? "text-end" : ""}`}>
                    <div className={`inline-block p-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted rounded-tl-sm"
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {message.executionPlan && message.executionPlan.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Separator />
                          <h4 className="text-sm font-medium flex items-center gap-2 mt-2">
                            <Zap className="w-4 h-4" />
                            {isRTL ? "خطة التنفيذ" : "Execution Plan"}
                          </h4>
                          {message.executionPlan.map((step, idx) => (
                            <div key={step.id} className="flex items-start gap-2 text-sm">
                              <div className="flex-shrink-0 mt-0.5">
                                {step.status === "completed" ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : step.status === "in_progress" ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                ) : step.status === "error" ? (
                                  <AlertCircle className="w-4 h-4 text-destructive" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{isRTL ? step.titleAr : step.title}</p>
                                <p className="text-muted-foreground text-xs">
                                  {isRTL ? step.descriptionAr : step.description}
                                </p>
                                {step.progress !== undefined && step.status === "in_progress" && (
                                  <Progress value={step.progress} className="h-1 mt-1" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.status === "executing" && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {t.executing}
                        </Badge>
                      )}
                      {message.status === "completed" && (
                        <Badge variant="outline" className="text-xs gap-1 text-emerald-500 border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.completed}
                        </Badge>
                      )}
                      {message.status === "error" && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {t.error}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted p-4 rounded-2xl rounded-tl-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{t.thinking}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {messages.length === 1 && (
            <div className="px-4 pb-4">
              <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  {quickCommands.slice(0, 4).map((cmd) => (
                    <Button
                      key={cmd.id}
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 h-auto py-3 text-start"
                      onClick={() => handleQuickCommand(cmd)}
                      data-testid={`suggestion-${cmd.id}`}
                    >
                      <cmd.icon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-xs line-clamp-2">{isRTL ? cmd.labelAr : cmd.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="border-t bg-card/50 backdrop-blur-sm p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.placeholder}
                  className="min-h-[52px] max-h-32 resize-none"
                  disabled={isProcessing}
                  data-testid="input-ai-command"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isProcessing}
                  className="h-[52px] px-6"
                  data-testid="button-send-command"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {isRTL 
                  ? "اكتب أمرك بالعربية أو الإنجليزية - سأفهم وأنفذ"
                  : "Type your command in Arabic or English - I'll understand and execute"}
              </p>
            </div>
          </div>
        </main>

        {currentExecution && (
          <aside className={`w-80 border-${isRTL ? "r" : "l"} bg-card/30 hidden xl:flex flex-col`}>
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                {t.executionLog}
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {currentExecution.map((step, idx) => (
                  <div 
                    key={step.id} 
                    className={`p-3 rounded-lg border ${
                      step.status === "completed" 
                        ? "bg-emerald-500/5 border-emerald-500/20" 
                        : step.status === "in_progress"
                        ? "bg-primary/5 border-primary/20"
                        : step.status === "error"
                        ? "bg-destructive/5 border-destructive/20"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {step.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : step.status === "in_progress" ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : step.status === "error" ? (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{isRTL ? step.titleAr : step.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isRTL ? step.descriptionAr : step.description}
                        </p>
                        {step.progress !== undefined && step.status === "in_progress" && (
                          <Progress value={step.progress} className="h-1 mt-2" />
                        )}
                        {step.output && (
                          <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
                            {step.output}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </div>
  );
}
