import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, Send, Bot, User, Clock, CheckCircle, AlertCircle, 
  Plus, ArrowUp, Loader2, Sparkles, HelpCircle, Book, Search,
  ChevronRight, Star, ThumbsUp, ThumbsDown, Brain, Zap, Shield,
  Target, Activity, TrendingUp, AlertTriangle, Info, Lightbulb,
  RotateCcw, ArrowRight, Cpu, Eye, Settings, Terminal, Database,
  Code, RefreshCw, CheckCircle2, XCircle, ArrowUpRight, Timer
} from "lucide-react";

interface SupportSession {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  channel: string;
  category: string;
  aiConfidence?: number;
  resolutionMode?: string;
  assignedAgentId?: string;
  contextSummary?: string;
  rootCause?: string;
  estimatedResolutionTime?: number;
  createdAt: string;
  updatedAt: string;
}

interface SupportMessage {
  id: string;
  sessionId: string;
  senderType: string;
  senderName?: string;
  content: string;
  contentAr?: string;
  isAiGenerated: boolean;
  aiConfidence?: number;
  suggestedActions?: string[];
  metadata?: {
    type?: string;
    diagnosticResults?: any;
    actionTaken?: string;
  };
  createdAt: string;
}

interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  titleAr?: string;
  content: string;
  category: string;
  viewCount: number;
  helpfulVotes?: number;
}

const priorityConfig: Record<string, { color: string; icon: any; label: { en: string; ar: string } }> = {
  low: { color: "bg-green-500/10 text-green-600 border-green-500/20", icon: ArrowUp, label: { en: "Low", ar: "منخفض" } },
  medium: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: ArrowUp, label: { en: "Medium", ar: "متوسط" } },
  high: { color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: AlertTriangle, label: { en: "High", ar: "عالي" } },
  urgent: { color: "bg-red-500/10 text-red-600 border-red-500/20", icon: AlertCircle, label: { en: "Urgent", ar: "عاجل" } },
  critical: { color: "bg-red-600/10 text-red-700 border-red-600/20", icon: AlertCircle, label: { en: "Critical", ar: "حرج" } },
};

const statusConfig: Record<string, { color: string; icon: any; label: { en: string; ar: string } }> = {
  open: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: MessageCircle, label: { en: "Open", ar: "مفتوح" } },
  pending: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock, label: { en: "Pending", ar: "قيد الانتظار" } },
  in_progress: { color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: RefreshCw, label: { en: "In Progress", ar: "قيد المعالجة" } },
  escalated: { color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: ArrowUpRight, label: { en: "Escalated", ar: "تم التصعيد" } },
  resolved: { color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle2, label: { en: "Resolved", ar: "تم الحل" } },
  closed: { color: "bg-muted text-muted-foreground", icon: XCircle, label: { en: "Closed", ar: "مغلق" } },
};

const resolutionModes: Record<string, { color: string; icon: any; label: { en: string; ar: string }; description: { en: string; ar: string } }> = {
  ai_instant: { 
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", 
    icon: Zap, 
    label: { en: "AI Instant", ar: "فوري بالذكاء الاصطناعي" },
    description: { en: "Automatic diagnosis and resolution", ar: "تشخيص وحل تلقائي" }
  },
  ai_guided: { 
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20", 
    icon: Target, 
    label: { en: "Guided Resolution", ar: "حل موجه" },
    description: { en: "Step-by-step troubleshooting", ar: "استكشاف الأخطاء خطوة بخطوة" }
  },
  human_escalated: { 
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20", 
    icon: User, 
    label: { en: "Human Support", ar: "دعم بشري" },
    description: { en: "Escalated to support team", ar: "تم التصعيد لفريق الدعم" }
  },
};

const categoryConfig: Record<string, { icon: any; label: { en: string; ar: string } }> = {
  general: { icon: HelpCircle, label: { en: "General", ar: "عام" } },
  billing: { icon: Activity, label: { en: "Billing", ar: "الفواتير" } },
  ai: { icon: Brain, label: { en: "AI", ar: "الذكاء الاصطناعي" } },
  api: { icon: Code, label: { en: "API", ar: "واجهة برمجة التطبيقات" } },
  security: { icon: Shield, label: { en: "Security", ar: "الأمان" } },
  bug_report: { icon: AlertCircle, label: { en: "Bug Report", ar: "الإبلاغ عن خطأ" } },
  feature_request: { icon: Lightbulb, label: { en: "Feature Request", ar: "طلب ميزة" } },
  performance: { icon: TrendingUp, label: { en: "Performance", ar: "الأداء" } },
  configuration: { icon: Settings, label: { en: "Configuration", ar: "الإعدادات" } },
};

export default function Support() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedSession, setSelectedSession] = useState<SupportSession | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [newTicketForm, setNewTicketForm] = useState({
    subject: "",
    category: "general",
    message: "",
  });
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessionsData, isLoading: loadingSessions } = useQuery<{ sessions: SupportSession[] }>({
    queryKey: ["/api/support/sessions"],
  });

  const { data: messagesData, isLoading: loadingMessages, refetch: refetchMessages } = useQuery<{ messages: SupportMessage[] }>({
    queryKey: ["/api/support/sessions", selectedSession?.id],
    enabled: !!selectedSession,
  });

  const { data: knowledgeData } = useQuery<{ articles: KnowledgeArticle[] }>({
    queryKey: ["/api/support/knowledge", knowledgeSearch],
  });

  const { data: analyticsData } = useQuery<{ 
    totalSessions: number;
    resolvedByAI: number;
    avgResolutionTime: number;
    satisfaction: number;
  }>({
    queryKey: ["/api/support/analytics"],
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData?.messages]);

  const createSessionMutation = useMutation({
    mutationFn: async (data: { subject: string; category: string; message: string }) => {
      return apiRequest("POST", "/api/support/sessions", {
        subject: data.subject,
        category: data.category,
        message: data.message,
        channel: "ai_chat",
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/sessions"] });
      setSelectedSession(data.session);
      setShowNewTicket(false);
      setNewTicketForm({ subject: "", category: "general", message: "" });
      toast({
        title: language === "ar" ? "تم إنشاء طلب الدعم" : "Support Request Created",
        description: language === "ar" ? "مساعد الذكاء الاصطناعي يحلل طلبك الآن" : "AI Assistant is analyzing your request",
      });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل إنشاء طلب الدعم" : "Failed to create support request",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/support/sessions/${selectedSession?.id}/messages`, { content });
    },
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل إرسال الرسالة" : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const resolveSessionMutation = useMutation({
    mutationFn: async ({ rating, feedback }: { rating?: number; feedback?: string }) => {
      return apiRequest("POST", `/api/support/sessions/${selectedSession?.id}/resolve`, { rating, feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/sessions"] });
      toast({
        title: language === "ar" ? "تم إغلاق الجلسة" : "Session Resolved",
        description: language === "ar" ? "شكراً على ملاحظاتك القيّمة" : "Thank you for your valuable feedback",
      });
      setSelectedSession(null);
      setShowFeedbackDialog(false);
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleCreateSession = () => {
    if (!newTicketForm.subject.trim() || !newTicketForm.message.trim()) return;
    createSessionMutation.mutate(newTicketForm);
  };

  const handleResolveWithFeedback = () => {
    resolveSessionMutation.mutate({ rating: feedbackRating, feedback: feedbackText });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAIConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return { level: "high", color: "text-emerald-600", bg: "bg-emerald-500" };
    if (confidence >= 0.7) return { level: "medium", color: "text-blue-600", bg: "bg-blue-500" };
    if (confidence >= 0.5) return { level: "low", color: "text-yellow-600", bg: "bg-yellow-500" };
    return { level: "uncertain", color: "text-red-600", bg: "bg-red-500" };
  };

  const sessions = sessionsData?.sessions || [];
  const messages = messagesData?.messages || [];
  const articles = knowledgeData?.articles || [];

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {language === "ar" ? "مركز الدعم الذكي" : "AI Support Center"}
              </h1>
              <p className="text-muted-foreground">
                {language === "ar" 
                  ? "نظام دعم ذاتي التفكير مدعوم بالذكاء الاصطناعي"
                  : "Self-thinking AI-powered support system"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20" data-testid="stat-ai-resolved">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                <span className="text-2xl font-bold text-emerald-600" data-testid="value-ai-resolved">
                  {analyticsData?.resolvedByAI || 0}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? "حُل بالذكاء الاصطناعي" : "AI Resolved"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20" data-testid="stat-avg-resolution">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Timer className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600" data-testid="value-avg-resolution">
                  {analyticsData?.avgResolutionTime || 0}{language === "ar" ? "د" : "m"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? "متوسط وقت الحل" : "Avg Resolution"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20" data-testid="stat-satisfaction">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-5 h-5 text-amber-600" />
                <span className="text-2xl font-bold text-amber-600" data-testid="value-satisfaction">
                  {analyticsData?.satisfaction?.toFixed(1) || "4.8"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? "رضا المستخدمين" : "Satisfaction"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20" data-testid="stat-total-requests">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600" data-testid="value-total-requests">
                  {analyticsData?.totalSessions || sessions.length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? "إجمالي الطلبات" : "Total Requests"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-background" data-testid="tab-chat">
              <MessageCircle className="w-4 h-4" />
              {language === "ar" ? "محادثات الدعم" : "Support Chats"}
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2 data-[state=active]:bg-background" data-testid="tab-knowledge">
              <Book className="w-4 h-4" />
              {language === "ar" ? "قاعدة المعرفة" : "Knowledge Base"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                  <div>
                    <CardTitle className="text-lg">
                      {language === "ar" ? "طلباتي" : "My Requests"}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {sessions.length} {language === "ar" ? "محادثة" : "conversations"}
                    </CardDescription>
                  </div>
                  <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1" data-testid="button-new-request">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{language === "ar" ? "جديد" : "New"}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-primary" />
                          {language === "ar" ? "طلب دعم ذكي" : "Smart Support Request"}
                        </DialogTitle>
                        <DialogDescription>
                          {language === "ar" 
                            ? "صف مشكلتك وسيقوم الذكاء الاصطناعي بتحليلها فوراً"
                            : "Describe your issue and AI will analyze it instantly"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>{language === "ar" ? "الموضوع" : "Subject"}</Label>
                          <Input
                            placeholder={language === "ar" ? "صف مشكلتك باختصار" : "Briefly describe your issue"}
                            value={newTicketForm.subject}
                            onChange={(e) => setNewTicketForm((f) => ({ ...f, subject: e.target.value }))}
                            data-testid="input-subject"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{language === "ar" ? "الفئة" : "Category"}</Label>
                          <Select
                            value={newTicketForm.category}
                            onValueChange={(v) => setNewTicketForm((f) => ({ ...f, category: v }))}
                          >
                            <SelectTrigger data-testid="select-category">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(categoryConfig).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <config.icon className="w-4 h-4" />
                                    {config.label[language as "en" | "ar"]}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{language === "ar" ? "تفاصيل المشكلة" : "Issue Details"}</Label>
                          <Textarea
                            placeholder={language === "ar" 
                              ? "صف مشكلتك بالتفصيل. كلما زادت التفاصيل، كان التحليل أدق..."
                              : "Describe your issue in detail. More details = better analysis..."}
                            value={newTicketForm.message}
                            onChange={(e) => setNewTicketForm((f) => ({ ...f, message: e.target.value }))}
                            rows={5}
                            data-testid="input-message"
                          />
                        </div>
                        <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/20">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Cpu className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">
                                {language === "ar" ? "معالجة ذكية" : "Intelligent Processing"}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {language === "ar" 
                                  ? "سيقوم الذكاء الاصطناعي بتحليل السياق، تشخيص المشكلة، واقتراح الحلول تلقائياً"
                                  : "AI will analyze context, diagnose issues, and suggest solutions automatically"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          className="w-full gap-2"
                          size="lg"
                          onClick={handleCreateSession}
                          disabled={createSessionMutation.isPending || !newTicketForm.subject.trim() || !newTicketForm.message.trim()}
                          data-testid="button-submit-request"
                        >
                          {createSessionMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {language === "ar" ? "جاري التحليل..." : "Analyzing..."}
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              {language === "ar" ? "بدء المحادثة الذكية" : "Start Smart Conversation"}
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <ScrollArea className="h-[500px]">
                    {loadingSessions ? (
                      <div className="flex flex-col items-center justify-center h-32 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {language === "ar" ? "جاري التحميل..." : "Loading..."}
                        </span>
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <MessageCircle className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">
                          {language === "ar" ? "اختر محادثة" : "Select a Conversation"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {language === "ar"
                            ? "اختر طلب دعم من القائمة أو أنشئ طلباً جديداً"
                            : "Choose a support request from the list or create a new one"}
                        </p>
                        <Button onClick={() => setShowNewTicket(true)} className="gap-2" data-testid="button-start-conversation">
                          <Plus className="w-4 h-4" />
                          {language === "ar" ? "طلب دعم جديد" : "New Support Request"}
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {sessions.map((session) => {
                          const status = statusConfig[session.status] || statusConfig.open;
                          const StatusIcon = status.icon;
                          const resMode = resolutionModes[session.resolutionMode || "ai_instant"];
                          const ResModeIcon = resMode?.icon || Zap;
                          const confidence = session.aiConfidence || 0;
                          const confLevel = getAIConfidenceLevel(confidence);
                          
                          return (
                            <button
                              key={session.id}
                              className={`w-full text-start p-4 hover-elevate transition-all ${
                                selectedSession?.id === session.id 
                                  ? "bg-primary/5 border-l-2 border-l-primary" 
                                  : ""
                              }`}
                              onClick={() => setSelectedSession(session)}
                              data-testid={`session-${session.id}`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="font-medium text-sm line-clamp-1 flex-1">
                                  {session.subject}
                                </span>
                                <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status.label[language as "en" | "ar"]}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <span className="font-mono">{session.ticketNumber}</span>
                                <span>•</span>
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(session.createdAt)}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[10px] ${resMode?.color || ""}`}>
                                  <ResModeIcon className="w-3 h-3 mr-1" />
                                  {resMode?.label[language as "en" | "ar"] || "AI"}
                                </Badge>
                                {confidence > 0 && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full ${confLevel.bg} transition-all`}
                                        style={{ width: `${confidence * 100}%` }}
                                      />
                                    </div>
                                    <span className={`text-[10px] font-medium ${confLevel.color}`}>
                                      {Math.round(confidence * 100)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 flex flex-col">
                {selectedSession ? (
                  <>
                    <CardHeader className="border-b pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{selectedSession.subject}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={statusConfig[selectedSession.status]?.color}>
                              {statusConfig[selectedSession.status]?.label[language as "en" | "ar"]}
                            </Badge>
                            <Badge variant="outline" className={priorityConfig[selectedSession.priority]?.color}>
                              {priorityConfig[selectedSession.priority]?.label[language as "en" | "ar"]}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              {selectedSession.ticketNumber}
                            </span>
                          </div>
                        </div>
                        
                        {selectedSession.status !== "resolved" && selectedSession.status !== "closed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => setShowFeedbackDialog(true)}
                            data-testid="button-resolve-session"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {language === "ar" ? "تم الحل" : "Mark Resolved"}
                          </Button>
                        )}
                      </div>

                      {selectedSession.aiConfidence && selectedSession.aiConfidence > 0 && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <Brain className="w-4 h-4 text-primary" />
                              {language === "ar" ? "ثقة الذكاء الاصطناعي" : "AI Confidence"}
                            </span>
                            <span className={`text-sm font-bold ${getAIConfidenceLevel(selectedSession.aiConfidence).color}`}>
                              {Math.round(selectedSession.aiConfidence * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={selectedSession.aiConfidence * 100} 
                            className="h-2"
                          />
                          {selectedSession.rootCause && (
                            <p className="text-xs text-muted-foreground mt-2">
                              <span className="font-medium">{language === "ar" ? "السبب الجذري:" : "Root Cause:"}</span>{" "}
                              {selectedSession.rootCause}
                            </p>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="p-0 flex-1 flex flex-col">
                      <ScrollArea className="flex-1 h-[350px]">
                        <div className="p-4 space-y-4">
                          {loadingMessages ? (
                            <div className="flex items-center justify-center h-32">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          ) : (
                            messages.map((message) => {
                              const isUser = message.senderType === "user";
                              const isAI = message.senderType === "ai";
                              const confidence = message.aiConfidence || 0;
                              
                              return (
                                <div
                                  key={message.id}
                                  className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                                >
                                  <Avatar className="w-9 h-9 shrink-0">
                                    {isAI ? (
                                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50">
                                        <Bot className="w-4 h-4 text-primary-foreground" />
                                      </AvatarFallback>
                                    ) : message.senderType === "agent" ? (
                                      <AvatarFallback className="bg-green-500/10">
                                        <User className="w-4 h-4 text-green-600" />
                                      </AvatarFallback>
                                    ) : (
                                      <AvatarFallback className="bg-muted">
                                        <User className="w-4 h-4" />
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  
                                  <div className={`max-w-[75%] ${isUser ? "items-end" : ""}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium">
                                        {isAI
                                          ? (language === "ar" ? "مساعد الذكاء الاصطناعي" : "AI Assistant")
                                          : message.senderType === "agent"
                                          ? message.senderName || (language === "ar" ? "وكيل الدعم" : "Support Agent")
                                          : language === "ar" ? "أنت" : "You"}
                                      </span>
                                      {isAI && confidence > 0 && (
                                        <Badge 
                                          variant="outline" 
                                          className={`text-[10px] py-0 px-1.5 ${getAIConfidenceLevel(confidence).color}`}
                                        >
                                          <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                          {Math.round(confidence * 100)}%
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div
                                      className={`rounded-2xl px-4 py-3 ${
                                        isUser
                                          ? "bg-primary text-primary-foreground"
                                          : isAI
                                          ? "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                                          : "bg-muted"
                                      }`}
                                    >
                                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                      </p>
                                    </div>
                                    
                                    {message.suggestedActions && message.suggestedActions.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-2">
                                        {message.suggestedActions.map((action, idx) => (
                                          <Button
                                            key={idx}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs h-7"
                                            data-testid={`button-action-${message.id}-${idx}`}
                                          >
                                            {action}
                                          </Button>
                                        ))}
                                      </div>
                                    )}
                                    
                                    <p className="text-[10px] text-muted-foreground mt-1 px-1">
                                      {formatDate(message.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                      
                      {selectedSession.status !== "resolved" && selectedSession.status !== "closed" && (
                        <div className="p-4 border-t bg-muted/20">
                          <div className="flex gap-2">
                            <Input
                              placeholder={language === "ar" ? "اكتب رسالتك..." : "Type your message..."}
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                              disabled={sendMessageMutation.isPending}
                              className="bg-background"
                              data-testid="input-chat-message"
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={sendMessageMutation.isPending || !newMessage.trim()}
                              data-testid="button-send-message"
                            >
                              {sendMessageMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[550px] text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                      <Brain className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {language === "ar" ? "اختر محادثة" : "Select a Conversation"}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                      {language === "ar"
                        ? "اختر طلب دعم من القائمة أو أنشئ طلباً جديداً للحصول على مساعدة فورية من الذكاء الاصطناعي"
                        : "Choose a support request from the list or create a new one for instant AI assistance"}
                    </p>
                    <Button onClick={() => setShowNewTicket(true)} size="lg" className="gap-2" data-testid="button-start-new-conversation">
                      <Sparkles className="w-4 h-4" />
                      {language === "ar" ? "طلب دعم جديد" : "New Support Request"}
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Book className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{language === "ar" ? "قاعدة المعرفة" : "Knowledge Base"}</CardTitle>
                    <CardDescription>
                      {language === "ar"
                        ? "ابحث في المقالات والأدلة للعثور على إجابات فورية"
                        : "Search articles and guides to find instant answers"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={language === "ar" ? "ابحث في قاعدة المعرفة..." : "Search knowledge base..."}
                    value={knowledgeSearch}
                    onChange={(e) => setKnowledgeSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-knowledge-search"
                  />
                </div>

                {articles.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Book className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">
                      {language === "ar" ? "لا توجد مقالات" : "No Articles Found"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? "جرب البحث بكلمات مختلفة أو تصفح الفئات"
                        : "Try searching with different keywords or browse categories"}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {articles.map((article) => (
                      <Card
                        key={article.id}
                        className="hover-elevate cursor-pointer transition-all"
                        data-testid={`article-${article.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium mb-2 line-clamp-1">
                                {language === "ar" && article.titleAr ? article.titleAr : article.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {article.content.substring(0, 120)}...
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-[10px]">
                                  {article.category}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {article.viewCount}
                                </span>
                                {article.helpfulVotes && (
                                  <span className="flex items-center gap-1">
                                    <ThumbsUp className="w-3 h-3" />
                                    {article.helpfulVotes}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {language === "ar" ? "تقييم جلسة الدعم" : "Rate Support Session"}
            </DialogTitle>
            <DialogDescription>
              {language === "ar" 
                ? "ساعدنا على تحسين خدمة الدعم بتقييمك"
                : "Help us improve our support service with your feedback"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>{language === "ar" ? "التقييم" : "Rating"}</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFeedbackRating(rating)}
                    className={`p-2 rounded-lg transition-all ${
                      feedbackRating >= rating 
                        ? "text-amber-500" 
                        : "text-muted-foreground hover:text-amber-400"
                    }`}
                    data-testid={`rating-${rating}`}
                  >
                    <Star className={`w-8 h-8 ${feedbackRating >= rating ? "fill-current" : ""}`} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{language === "ar" ? "ملاحظات إضافية (اختياري)" : "Additional Feedback (Optional)"}</Label>
              <Textarea
                placeholder={language === "ar" 
                  ? "شاركنا تجربتك مع الدعم..."
                  : "Share your experience with our support..."}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                data-testid="input-feedback"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)} data-testid="button-cancel-feedback">
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button 
              onClick={handleResolveWithFeedback}
              disabled={resolveSessionMutation.isPending}
              className="gap-2"
              data-testid="button-submit-feedback"
            >
              {resolveSessionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {language === "ar" ? "إرسال وإغلاق" : "Submit & Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
