import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Wand2,
  Bug,
  MessageSquare,
  Code2,
  Lightbulb,
  Send,
  Loader2,
  Copy,
  FileCode,
  Sparkles,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Play,
  FileEdit,
  FilePlus,
  FolderPlus,
  Terminal,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Check,
  X,
  Info,
  Target,
  Gauge,
  Lock,
  Unlock,
  History,
  Undo2,
  RotateCcw,
  Plus,
  Minus,
  Search,
  Filter,
  Diff,
  GitCompare,
  BookOpen,
  GraduationCap
} from "lucide-react";

const translations = {
  ar: {
    title: "مساعد AI Copilot الذكي",
    subtitle: "مساعدك الذكي المتقدم - يفهم السياق ويكمل ويشرح ويصلح ويحسّن الكود",
    autocomplete: "إكمال ذكي",
    explain: "شرح متعمق",
    fix: "إصلاح الأخطاء",
    optimize: "تحسين الأداء",
    chat: "محادثة معمارية",
    inputPlaceholder: "الصق الكود هنا أو اكتب سؤالك...",
    generate: "توليد",
    generating: "جاري التوليد...",
    copy: "نسخ",
    copied: "تم النسخ!",
    suggestions: "اقتراحات",
    result: "النتيجة",
    applyChanges: "تطبيق التغييرات",
    createFile: "إنشاء ملف",
    replaceCode: "استبدال الكود",
    previewChanges: "معاينة التغييرات",
    safetyCheck: "فحص الأمان",
    approved: "معتمد",
    pending: "قيد الانتظار",
    context: "السياق",
    currentFile: "الملف الحالي",
    projectStructure: "بنية المشروع",
    framework: "إطار العمل",
    language: "لغة البرمجة",
    detected: "تم الكشف",
    explanation: "الشرح",
    codeOutput: "الكود الناتج",
    actions: "الإجراءات",
    whatItDoes: "ماذا يفعل",
    whyItExists: "لماذا موجود",
    whatCanBreak: "ما قد يفشل",
    performanceRisks: "مخاطر الأداء",
    securityIssues: "مشاكل أمنية",
    designSmells: "روائح التصميم",
    quickActions: "إجراءات سريعة",
    completeFunction: "أكمل الدالة",
    addValidation: "أضف التحقق",
    addErrorHandling: "أضف معالجة الأخطاء",
    addTests: "أضف الاختبارات",
    refactorCode: "أعد الهيكلة",
    secureCode: "أمّن الكود",
    optimizePerformance: "حسّن الأداء",
    addLogging: "أضف السجلات",
    impact: "التأثير",
    confidence: "مستوى الثقة",
    high: "عالي",
    medium: "متوسط",
    low: "منخفض",
    executionMode: "وضع التنفيذ",
    preview: "معاينة",
    apply: "تطبيق",
    confirmApply: "تأكيد التطبيق",
    cancelApply: "إلغاء",
    diffView: "عرض الفرق",
    beforeAfter: "قبل / بعد",
    history: "السجل",
    undo: "تراجع",
    chatHistory: "سجل المحادثة",
    clearChat: "مسح المحادثة",
    sendMessage: "إرسال",
    architectMode: "وضع المهندس",
    patterns: "الأنماط",
    bestPractices: "أفضل الممارسات",
  },
  en: {
    title: "Intelligent AI Copilot",
    subtitle: "Your advanced AI assistant - context-aware completion, explanation, fixing, and optimization",
    autocomplete: "Smart Complete",
    explain: "Deep Explain",
    fix: "Fix Errors",
    optimize: "Optimize",
    chat: "Architect Chat",
    inputPlaceholder: "Paste your code here or type your question...",
    generate: "Generate",
    generating: "Generating...",
    copy: "Copy",
    copied: "Copied!",
    suggestions: "Suggestions",
    result: "Result",
    applyChanges: "Apply Changes",
    createFile: "Create File",
    replaceCode: "Replace Code",
    previewChanges: "Preview Changes",
    safetyCheck: "Safety Check",
    approved: "Approved",
    pending: "Pending",
    context: "Context",
    currentFile: "Current File",
    projectStructure: "Project Structure",
    framework: "Framework",
    language: "Language",
    detected: "Detected",
    explanation: "Explanation",
    codeOutput: "Code Output",
    actions: "Actions",
    whatItDoes: "What It Does",
    whyItExists: "Why It Exists",
    whatCanBreak: "What Can Break",
    performanceRisks: "Performance Risks",
    securityIssues: "Security Issues",
    designSmells: "Design Smells",
    quickActions: "Quick Actions",
    completeFunction: "Complete Function",
    addValidation: "Add Validation",
    addErrorHandling: "Add Error Handling",
    addTests: "Add Tests",
    refactorCode: "Refactor Code",
    secureCode: "Secure Code",
    optimizePerformance: "Optimize Performance",
    addLogging: "Add Logging",
    impact: "Impact",
    confidence: "Confidence",
    high: "High",
    medium: "Medium",
    low: "Low",
    executionMode: "Execution Mode",
    preview: "Preview",
    apply: "Apply",
    confirmApply: "Confirm Apply",
    cancelApply: "Cancel",
    diffView: "Diff View",
    beforeAfter: "Before / After",
    history: "History",
    undo: "Undo",
    chatHistory: "Chat History",
    clearChat: "Clear Chat",
    sendMessage: "Send",
    architectMode: "Architect Mode",
    patterns: "Patterns",
    bestPractices: "Best Practices",
  }
};

interface CopilotResult {
  type: "explanation" | "code" | "fix" | "optimization" | "chat";
  explanation?: {
    whatItDoes: string;
    whyItExists: string;
    whatCanBreak: string[];
    performanceRisks: string[];
    securityIssues: string[];
    designSmells: string[];
  };
  code?: string;
  language?: string;
  diff?: { before: string; after: string };
  actions?: CopilotAction[];
  confidence: number;
  safetyCheck: {
    passed: boolean;
    warnings: string[];
    requiresApproval: boolean;
  };
}

interface CopilotAction {
  type: "apply" | "create-file" | "replace" | "refactor";
  label: string;
  labelAr: string;
  target?: string;
  content?: string;
  impact: "low" | "medium" | "high";
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  code?: string;
}

interface DetectedContext {
  language: string;
  framework: string;
  fileType: string;
  patterns: string[];
}

const QUICK_ACTIONS = [
  { key: "complete", icon: Wand2, color: "text-violet-500" },
  { key: "validate", icon: Shield, color: "text-green-500" },
  { key: "errorHandling", icon: AlertTriangle, color: "text-amber-500" },
  { key: "tests", icon: CheckCircle, color: "text-blue-500" },
  { key: "refactor", icon: RefreshCw, color: "text-purple-500" },
  { key: "secure", icon: Lock, color: "text-red-500" },
  { key: "optimize", icon: Zap, color: "text-yellow-500" },
  { key: "logging", icon: Terminal, color: "text-cyan-500" },
];

function detectContext(code: string): DetectedContext {
  const context: DetectedContext = {
    language: "unknown",
    framework: "none",
    fileType: "unknown",
    patterns: [],
  };

  if (code.includes("import React") || code.includes("from 'react'") || code.includes("useState") || code.includes("useEffect")) {
    context.language = "typescript";
    context.framework = "React";
    context.patterns.push("hooks", "functional-components");
  } else if (code.includes("express") || code.includes("app.get(") || code.includes("app.post(")) {
    context.language = "typescript";
    context.framework = "Express";
    context.patterns.push("rest-api", "middleware");
  } else if (code.includes("def ") || code.includes("import ") && !code.includes("from '")) {
    context.language = "python";
    if (code.includes("flask") || code.includes("Flask")) {
      context.framework = "Flask";
    } else if (code.includes("django") || code.includes("Django")) {
      context.framework = "Django";
    }
  } else if (code.includes("function") || code.includes("const ") || code.includes("let ")) {
    context.language = code.includes(": ") || code.includes("<") ? "typescript" : "javascript";
  }

  if (code.includes("async ") || code.includes("await ")) {
    context.patterns.push("async-await");
  }
  if (code.includes("try {") || code.includes("catch")) {
    context.patterns.push("error-handling");
  }
  if (code.includes("class ")) {
    context.patterns.push("oop");
  }

  return context;
}

function ContextBadges({ context, language }: { context: DetectedContext; language: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {context.language !== "unknown" && (
        <Badge variant="outline" className="text-xs">
          <Code2 className="h-3 w-3 mr-1" />
          {context.language}
        </Badge>
      )}
      {context.framework !== "none" && (
        <Badge variant="outline" className="text-xs">
          <Settings className="h-3 w-3 mr-1" />
          {context.framework}
        </Badge>
      )}
      {context.patterns.slice(0, 3).map((pattern, idx) => (
        <Badge key={idx} variant="secondary" className="text-xs">
          {pattern}
        </Badge>
      ))}
    </div>
  );
}

function ExplanationPanel({ explanation, language }: { explanation: CopilotResult["explanation"]; language: string }) {
  const t = translations[language as keyof typeof translations] || translations.en;
  
  if (!explanation) return null;

  const sections = [
    { key: "whatItDoes", icon: Lightbulb, color: "text-blue-500", items: [explanation.whatItDoes] },
    { key: "whyItExists", icon: Target, color: "text-green-500", items: [explanation.whyItExists] },
    { key: "whatCanBreak", icon: AlertTriangle, color: "text-amber-500", items: explanation.whatCanBreak },
    { key: "performanceRisks", icon: Gauge, color: "text-orange-500", items: explanation.performanceRisks },
    { key: "securityIssues", icon: Shield, color: "text-red-500", items: explanation.securityIssues },
    { key: "designSmells", icon: Bug, color: "text-purple-500", items: explanation.designSmells },
  ];

  return (
    <div className="space-y-4">
      {sections.filter(s => s.items && s.items.length > 0 && s.items[0]).map((section) => (
        <div key={section.key} className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <section.icon className={`h-4 w-4 ${section.color}`} />
            <span className="font-medium text-sm">{t[section.key as keyof typeof t]}</span>
          </div>
          <ul className="space-y-1">
            {section.items.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <ChevronRight className="h-3 w-3 mt-1 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function DiffView({ before, after, language }: { before: string; after: string; language: string }) {
  const t = translations[language as keyof typeof translations] || translations.en;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <Minus className="h-3 w-3 text-red-500" />
          {language === "ar" ? "قبل" : "Before"}
        </div>
        <ScrollArea className="h-48 border rounded-lg bg-red-500/5">
          <pre className="p-3 text-xs font-mono">{before}</pre>
        </ScrollArea>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <Plus className="h-3 w-3 text-green-500" />
          {language === "ar" ? "بعد" : "After"}
        </div>
        <ScrollArea className="h-48 border rounded-lg bg-green-500/5">
          <pre className="p-3 text-xs font-mono">{after}</pre>
        </ScrollArea>
      </div>
    </div>
  );
}

function SafetyIndicator({ safetyCheck, language }: { safetyCheck: CopilotResult["safetyCheck"]; language: string }) {
  const t = translations[language as keyof typeof translations] || translations.en;
  
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${safetyCheck.passed ? "bg-green-500/10" : "bg-amber-500/10"}`}>
      {safetyCheck.passed ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      )}
      <span className="text-sm font-medium">
        {t.safetyCheck}: {safetyCheck.passed ? t.approved : t.pending}
      </span>
      {safetyCheck.warnings.length > 0 && (
        <Badge variant="outline" className="text-xs">
          {safetyCheck.warnings.length} {language === "ar" ? "تحذيرات" : "warnings"}
        </Badge>
      )}
    </div>
  );
}

function ActionButtons({ actions, onAction, language }: { actions: CopilotAction[]; onAction: (action: CopilotAction) => void; language: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, idx) => (
        <Button
          key={idx}
          size="sm"
          variant={action.impact === "high" ? "destructive" : action.impact === "medium" ? "default" : "outline"}
          onClick={() => onAction(action)}
          data-testid={`action-${action.type}`}
        >
          {action.type === "apply" && <Play className="h-3 w-3 mr-1" />}
          {action.type === "create-file" && <FilePlus className="h-3 w-3 mr-1" />}
          {action.type === "replace" && <FileEdit className="h-3 w-3 mr-1" />}
          {action.type === "refactor" && <RefreshCw className="h-3 w-3 mr-1" />}
          {language === "ar" ? action.labelAr : action.label}
        </Button>
      ))}
    </div>
  );
}

export default function AICopilot() {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("autocomplete");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CopilotResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showDiff, setShowDiff] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<CopilotAction | null>(null);
  const [selectedFile, setSelectedFile] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const detectedContext = detectContext(input);

  const { data: projectFiles } = useQuery<string[]>({
    queryKey: ["/api/projects/files"],
    enabled: false,
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/copilot/generate", { 
        input, 
        action: activeTab,
        context: detectedContext,
        file: selectedFile,
      });
      if (!response || !response.success) {
        throw new Error(response?.error || "Generation failed");
      }
      return response;
    },
    onSuccess: (data: any) => {
      const copilotResult: CopilotResult = {
        type: activeTab as CopilotResult["type"],
        code: data.result || data.code,
        confidence: data.confidence || 85,
        safetyCheck: data.safetyCheck || {
          passed: true,
          warnings: [],
          requiresApproval: false,
        },
        actions: data.actions || [],
        explanation: data.explanation,
        diff: data.diff,
      };

      setResult(copilotResult);
      toast({ title: language === "ar" ? "تم التوليد بنجاح" : "Generated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: language === "ar" ? "فشل التوليد" : "Generation failed", description: error.message, variant: "destructive" });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/copilot/chat", { 
        message,
        history: chatMessages.slice(-10),
        context: detectedContext,
      });
      if (!response || !response.success) {
        throw new Error(response?.error || "Chat failed");
      }
      return response;
    },
    onSuccess: (data: any) => {
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: data.response || data.result || "I understand. How can I help further?",
        timestamp: new Date(),
        code: data.code,
      }]);
    },
    onError: (error: Error) => {
      toast({ title: language === "ar" ? "فشل الرسالة" : "Message failed", description: error.message, variant: "destructive" });
    },
  });

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, {
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    }]);
    
    chatMutation.mutate(chatInput);
    setChatInput("");
  };

  const handleAction = (action: CopilotAction) => {
    if (action.impact === "high") {
      setPendingAction(action);
      setShowApplyDialog(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: CopilotAction) => {
    try {
      await apiRequest("POST", "/api/copilot/execute", {
        action,
        content: result?.code,
        file: selectedFile,
      });
      toast({ 
        title: language === "ar" ? "تم التنفيذ" : "Executed", 
        description: language === "ar" ? action.labelAr : action.label 
      });
      setShowApplyDialog(false);
      setPendingAction(null);
    } catch (error) {
      toast({ 
        title: language === "ar" ? "فشل التنفيذ" : "Execution failed", 
        variant: "destructive" 
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t.copied });
  };

  const applyQuickAction = (actionKey: string) => {
    const actionTexts: Record<string, { en: string; ar: string }> = {
      complete: { en: "// Complete this function", ar: "// أكمل هذه الدالة" },
      validate: { en: "// Add Zod validation", ar: "// أضف التحقق باستخدام Zod" },
      errorHandling: { en: "// Add try-catch error handling", ar: "// أضف معالجة الأخطاء" },
      tests: { en: "// Generate unit tests", ar: "// أنشئ اختبارات الوحدة" },
      refactor: { en: "// Refactor for better readability", ar: "// أعد الهيكلة لسهولة القراءة" },
      secure: { en: "// Add security measures", ar: "// أضف إجراءات الأمان" },
      optimize: { en: "// Optimize for performance", ar: "// حسّن الأداء" },
      logging: { en: "// Add logging statements", ar: "// أضف عبارات التسجيل" },
    };

    const text = actionTexts[actionKey]?.[language as "en" | "ar"] || "";
    setInput(prev => prev + "\n" + text);
  };

  const getTabIcon = (tab: string) => {
    const icons: Record<string, typeof Wand2> = {
      autocomplete: Wand2,
      explain: Lightbulb,
      fix: Bug,
      optimize: Zap,
      chat: MessageSquare,
    };
    return icons[tab] || Code2;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-copilot-title">
          <Brain className="h-8 w-8 text-violet-500" />
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  {["autocomplete", "explain", "fix", "optimize", "chat"].map((tab) => {
                    const Icon = getTabIcon(tab);
                    return (
                      <TabsTrigger key={tab} value={tab} data-testid={`tab-${tab}`}>
                        <Icon className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">{t[tab as keyof typeof t]}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {activeTab !== "chat" ? (
                <>
                  {detectedContext.language !== "unknown" && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{t.detected} {t.context}</span>
                      </div>
                      <ContextBadges context={detectedContext} language={language} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{language === "ar" ? "الكود المدخل" : "Input Code"}</Label>
                      {selectedFile && (
                        <Badge variant="outline" className="text-xs">
                          <FileCode className="h-3 w-3 mr-1" />
                          {selectedFile}
                        </Badge>
                      )}
                    </div>
                    <Textarea
                      placeholder={t.inputPlaceholder}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      rows={14}
                      className="font-mono text-sm"
                      data-testid="textarea-copilot-input"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">{t.quickActions}</Label>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_ACTIONS.map((action) => (
                        <Button
                          key={action.key}
                          size="sm"
                          variant="outline"
                          onClick={() => applyQuickAction(action.key)}
                          data-testid={`quick-${action.key}`}
                        >
                          <action.icon className={`h-3 w-3 mr-1 ${action.color}`} />
                          {t[`${action.key === "complete" ? "completeFunction" : action.key === "validate" ? "addValidation" : action.key === "errorHandling" ? "addErrorHandling" : action.key === "tests" ? "addTests" : action.key === "refactor" ? "refactorCode" : action.key === "secure" ? "secureCode" : action.key === "optimize" ? "optimizePerformance" : "addLogging"}` as keyof typeof t]}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-violet-500" />
                      <span className="text-sm font-medium">{t.architectMode}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setChatMessages([])}>
                      <RotateCcw className="h-3 w-3 mr-1" />
                      {t.clearChat}
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-80 border rounded-lg p-4">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">
                            {language === "ar" ? "اسأل عن البنية المعمارية أو الأنماط أو أفضل الممارسات" : "Ask about architecture, patterns, or best practices"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              <p className="text-sm">{msg.content}</p>
                              {msg.code && (
                                <pre className="mt-2 p-2 bg-background/50 rounded text-xs font-mono overflow-x-auto">
                                  {msg.code}
                                </pre>
                              )}
                              <span className="text-xs opacity-50 mt-1 block">
                                {msg.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Textarea
                      placeholder={language === "ar" ? "اكتب سؤالك المعماري..." : "Type your architecture question..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      rows={2}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChat();
                        }
                      }}
                      data-testid="textarea-chat-input"
                    />
                    <Button 
                      onClick={handleSendChat} 
                      disabled={!chatInput.trim() || chatMutation.isPending}
                      data-testid="button-send-chat"
                    >
                      {chatMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>

            {activeTab !== "chat" && (
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => generateMutation.mutate()}
                  disabled={!input.trim() || generateMutation.isPending}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {t.generating}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      {t.generate}
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="min-h-[500px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  {t.result}
                </CardTitle>
                {result && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Gauge className="h-3 w-3 mr-1" />
                      {t.confidence}: {result.confidence}%
                    </Badge>
                    {result.code && (
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(result.code!)} data-testid="button-copy-result">
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <SafetyIndicator safetyCheck={result.safetyCheck} language={language} />

                  {result.explanation && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-sm">{t.explanation}</span>
                      </div>
                      <ExplanationPanel explanation={result.explanation} language={language} />
                    </div>
                  )}

                  {result.diff && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GitCompare className="h-4 w-4 text-blue-500" />
                          <span className="font-medium text-sm">{t.diffView}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setShowDiff(!showDiff)}>
                          {showDiff ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {showDiff && <DiffView before={result.diff.before} after={result.diff.after} language={language} />}
                    </div>
                  )}

                  {result.code && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Code2 className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm">{t.codeOutput}</span>
                      </div>
                      <ScrollArea className="h-64 border rounded-lg bg-muted">
                        <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                          {result.code}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}

                  {result.actions && result.actions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Play className="h-4 w-4 text-violet-500" />
                        <span className="font-medium text-sm">{t.actions}</span>
                      </div>
                      <ActionButtons actions={result.actions} onAction={handleAction} language={language} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      {language === "ar" ? "مساعدك الذكي جاهز" : "Your AI Assistant is Ready"}
                    </p>
                    <p className="text-sm">
                      {language === "ar" 
                        ? "أدخل الكود واختر الإجراء المناسب" 
                        : "Enter code and select an action to begin"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {result && !result.safetyCheck.passed && result.safetyCheck.warnings.length > 0 && (
            <Card className="border-amber-500/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-500 text-base">
                  <AlertTriangle className="h-5 w-5" />
                  {language === "ar" ? "تحذيرات الأمان" : "Safety Warnings"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.safetyCheck.warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              {t.confirmApply}
            </DialogTitle>
            <DialogDescription>
              {language === "ar" 
                ? "هذا الإجراء سيقوم بتعديل ملفاتك. هل أنت متأكد؟" 
                : "This action will modify your files. Are you sure?"}
            </DialogDescription>
          </DialogHeader>
          
          {pendingAction && (
            <div className="py-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3 mb-2">
                  {pendingAction.type === "apply" && <Play className="h-5 w-5 text-violet-500" />}
                  {pendingAction.type === "create-file" && <FilePlus className="h-5 w-5 text-green-500" />}
                  {pendingAction.type === "replace" && <FileEdit className="h-5 w-5 text-amber-500" />}
                  {pendingAction.type === "refactor" && <RefreshCw className="h-5 w-5 text-blue-500" />}
                  <span className="font-medium">
                    {language === "ar" ? pendingAction.labelAr : pendingAction.label}
                  </span>
                </div>
                {pendingAction.target && (
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "الملف المستهدف:" : "Target file:"} {pendingAction.target}
                  </p>
                )}
                <Badge variant={pendingAction.impact === "high" ? "destructive" : "secondary"} className="mt-2">
                  {t.impact}: {t[pendingAction.impact as keyof typeof t]}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              <X className="h-4 w-4 mr-1" />
              {t.cancelApply}
            </Button>
            <Button onClick={() => pendingAction && executeAction(pendingAction)}>
              <Check className="h-4 w-4 mr-1" />
              {t.confirmApply}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
