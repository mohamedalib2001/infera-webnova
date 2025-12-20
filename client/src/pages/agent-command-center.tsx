import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, Send, Bot, User, Clock, CheckCircle, AlertCircle, 
  Plus, ArrowUp, Loader2, Sparkles, HelpCircle, Book, Search,
  ChevronRight, Star, ThumbsUp, ThumbsDown, Brain, Zap, Shield,
  Target, Activity, TrendingUp, AlertTriangle, Info, Lightbulb,
  RotateCcw, ArrowRight, Cpu, Eye, Settings, Terminal, Database,
  Code, RefreshCw, CheckCircle2, XCircle, ArrowUpRight, Timer,
  Users, Gauge, HeartPulse, FileText, Play, Pause, MoreVertical,
  ChevronDown, ExternalLink, Copy, Bookmark, History, Layers,
  GitBranch, AlertOctagon, Radio, Headphones, PhoneCall, Mail,
  CreditCard, Crown, Building, Package, UserCircle, MapPin,
  Calendar, Link2, Wifi, WifiOff
} from "lucide-react";

interface AgentSession {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  channel: string;
  category: string;
  aiConfidence?: number;
  aiIntent?: string;
  aiSentiment?: string;
  riskLevel?: string;
  aiCopilotSummary?: string;
  aiCopilotSummaryAr?: string;
  aiSuggestedResponses?: Array<{
    id: string;
    content: string;
    contentAr?: string;
    confidence: number;
    type: 'quick_reply' | 'detailed' | 'escalation';
  }>;
  aiRecommendedActions?: Array<{
    id: string;
    action: string;
    actionAr?: string;
    type: string;
    risk: string;
    requiresConfirmation: boolean;
  }>;
  userContext?: {
    subscriptionTier?: string;
    accountAge?: number;
    totalTickets?: number;
    lastLogin?: string;
    recentActions?: string[];
    lifetimeValue?: number;
  };
  platformContext?: {
    currentPage?: string;
    currentService?: string;
    errorLogs?: string[];
    browserInfo?: string;
    platformVersion?: string;
  };
  stateHistory?: Array<{
    state: string;
    timestamp: string;
    changedBy?: string;
    reason?: string;
  }>;
  slaFirstResponseDue?: string;
  slaResolutionDue?: string;
  slaFirstResponseMet?: boolean;
  slaResolutionMet?: boolean;
  userName?: string;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
}

interface AgentMessage {
  id: string;
  sessionId: string;
  senderType: string;
  senderName?: string;
  content: string;
  contentAr?: string;
  isAiGenerated: boolean;
  aiConfidence?: number;
  aiSuggested?: boolean;
  createdAt: string;
}

interface AgentMetrics {
  activeTickets: number;
  avgResolutionTime: number;
  aiResolutionRate: number;
  humanInterventionRate: number;
  slaBreachRisk: number;
  agentPerformanceIndex: number;
  satisfactionPrediction: number;
  ticketsToday: number;
  escalatedTickets: number;
}

const priorityConfig: Record<string, { color: string; icon: any; label: { en: string; ar: string } }> = {
  low: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: ArrowUp, label: { en: "Low", ar: "منخفض" } },
  medium: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: ArrowUp, label: { en: "Medium", ar: "متوسط" } },
  high: { color: "bg-orange-500/10 text-orange-600 border-orange-500/30", icon: AlertTriangle, label: { en: "High", ar: "عالي" } },
  urgent: { color: "bg-red-500/10 text-red-600 border-red-500/30", icon: AlertCircle, label: { en: "Urgent", ar: "عاجل" } },
  critical: { color: "bg-red-600/10 text-red-700 border-red-600/40", icon: AlertOctagon, label: { en: "Critical", ar: "حرج" } },
};

const statusConfig: Record<string, { color: string; icon: any; label: { en: string; ar: string } }> = {
  new: { color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30", icon: Plus, label: { en: "New", ar: "جديد" } },
  diagnosing: { color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: Search, label: { en: "Diagnosing", ar: "قيد التشخيص" } },
  action_taken: { color: "bg-purple-500/10 text-purple-600 border-purple-500/30", icon: Play, label: { en: "Action Taken", ar: "تم اتخاذ إجراء" } },
  awaiting_user: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Clock, label: { en: "Awaiting User", ar: "بانتظار المستخدم" } },
  resolved: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: CheckCircle2, label: { en: "Resolved", ar: "تم الحل" } },
  escalated: { color: "bg-amber-500/10 text-amber-600 border-amber-500/30", icon: ArrowUpRight, label: { en: "Escalated", ar: "تم التصعيد" } },
  open: { color: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: MessageCircle, label: { en: "Open", ar: "مفتوح" } },
  pending: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Clock, label: { en: "Pending", ar: "معلق" } },
  in_progress: { color: "bg-purple-500/10 text-purple-600 border-purple-500/30", icon: RefreshCw, label: { en: "In Progress", ar: "قيد المعالجة" } },
  closed: { color: "bg-muted text-muted-foreground", icon: XCircle, label: { en: "Closed", ar: "مغلق" } },
};

const sentimentConfig: Record<string, { color: string; icon: any; label: { en: string; ar: string } }> = {
  positive: { color: "text-emerald-600 bg-emerald-500/10", icon: ThumbsUp, label: { en: "Positive", ar: "إيجابي" } },
  neutral: { color: "text-blue-600 bg-blue-500/10", icon: Activity, label: { en: "Neutral", ar: "محايد" } },
  negative: { color: "text-orange-600 bg-orange-500/10", icon: ThumbsDown, label: { en: "Negative", ar: "سلبي" } },
  frustrated: { color: "text-red-600 bg-red-500/10", icon: AlertTriangle, label: { en: "Frustrated", ar: "محبط" } },
  urgent: { color: "text-red-700 bg-red-600/10", icon: AlertOctagon, label: { en: "Urgent", ar: "مستعجل" } },
};

const riskConfig: Record<string, { color: string; label: { en: string; ar: string } }> = {
  low: { color: "bg-emerald-500", label: { en: "Low Risk", ar: "خطر منخفض" } },
  medium: { color: "bg-yellow-500", label: { en: "Medium Risk", ar: "خطر متوسط" } },
  high: { color: "bg-orange-500", label: { en: "High Risk", ar: "خطر عالي" } },
  critical: { color: "bg-red-600", label: { en: "Critical Risk", ar: "خطر حرج" } },
};

export default function AgentCommandCenter() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [selectedSession, setSelectedSession] = useState<AgentSession | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showActionConfirm, setShowActionConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessionsData, isLoading: loadingSessions } = useQuery<{ sessions: AgentSession[] }>({
    queryKey: ["/api/agent/sessions", filterStatus, filterPriority],
  });

  const { data: messagesData, isLoading: loadingMessages, refetch: refetchMessages } = useQuery<{ messages: AgentMessage[] }>({
    queryKey: ["/api/agent/sessions", selectedSession?.id, "messages"],
    enabled: !!selectedSession,
  });

  const { data: metricsData } = useQuery<AgentMetrics>({
    queryKey: ["/api/agent/metrics"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData?.messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/agent/sessions/${selectedSession?.id}/messages`, { content, senderType: "agent" });
    },
    onSuccess: () => {
      setNewMessage("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/agent/sessions"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, reason }: { status: string; reason?: string }) => {
      return apiRequest("PATCH", `/api/agent/sessions/${selectedSession?.id}/status`, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent/sessions"] });
      toast({
        title: language === "ar" ? "تم تحديث الحالة" : "Status Updated",
        description: language === "ar" ? "تم تحديث حالة التذكرة بنجاح" : "Ticket status updated successfully",
      });
    },
  });

  const executeActionMutation = useMutation({
    mutationFn: async (action: any) => {
      return apiRequest("POST", `/api/agent/sessions/${selectedSession?.id}/actions`, { action });
    },
    onSuccess: () => {
      setShowActionConfirm(false);
      setPendingAction(null);
      queryClient.invalidateQueries({ queryKey: ["/api/agent/sessions"] });
      toast({
        title: language === "ar" ? "تم تنفيذ الإجراء" : "Action Executed",
        description: language === "ar" ? "تم تنفيذ الإجراء المطلوب بنجاح" : "The requested action was executed successfully",
      });
    },
  });

  const useSuggestionMutation = useMutation({
    mutationFn: async (suggestion: any) => {
      return apiRequest("POST", `/api/agent/sessions/${selectedSession?.id}/messages`, { 
        content: suggestion.content, 
        senderType: "agent",
        usedAiSuggestion: true,
        suggestionId: suggestion.id
      });
    },
    onSuccess: () => {
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/agent/sessions"] });
      toast({
        title: language === "ar" ? "تم إرسال الرد" : "Response Sent",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleExecuteAction = (action: any) => {
    if (action.requiresConfirmation) {
      setPendingAction(action);
      setShowActionConfirm(true);
    } else {
      executeActionMutation.mutate(action);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSlaStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (diff < 0) return { status: "breached", color: "text-red-600", hours: Math.abs(hours) };
    if (hours < 2) return { status: "critical", color: "text-orange-600", hours };
    if (hours < 8) return { status: "warning", color: "text-yellow-600", hours };
    return { status: "safe", color: "text-emerald-600", hours };
  };

  const sessions = sessionsData?.sessions || [];
  const messages = messagesData?.messages || [];
  const metrics = metricsData || {
    activeTickets: 0,
    avgResolutionTime: 0,
    aiResolutionRate: 0,
    humanInterventionRate: 0,
    slaBreachRisk: 0,
    agentPerformanceIndex: 0,
    satisfactionPrediction: 0,
    ticketsToday: 0,
    escalatedTickets: 0,
  };

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between px-6 py-3 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold" data-testid="text-page-title">
                  {language === "ar" ? "مركز قيادة وكيل الدعم" : "Agent Command Center"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {language === "ar" ? "نظام دعم معزز بالذكاء الاصطناعي" : "AI-Augmented Support System"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`gap-1 ${isOnline ? 'text-emerald-600 border-emerald-500/30' : 'text-red-600 border-red-500/30'}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? (language === "ar" ? "متصل" : "Online") : (language === "ar" ? "غير متصل" : "Offline")}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-muted-foreground">
                {language === "ar" ? "تحديث مباشر" : "Live Updates"}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-3 p-4 bg-muted/30">
          <Card className="col-span-1 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20" data-testid="stat-active-tickets">
            <CardContent className="p-3 text-center">
              <Activity className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-600" data-testid="value-active-tickets">{metrics.activeTickets}</p>
              <p className="text-[10px] text-muted-foreground">{language === "ar" ? "تذاكر نشطة" : "Active Tickets"}</p>
            </CardContent>
          </Card>
          <Card className="col-span-1 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20" data-testid="stat-ai-rate">
            <CardContent className="p-3 text-center">
              <Brain className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-600" data-testid="value-ai-rate">{metrics.aiResolutionRate}%</p>
              <p className="text-[10px] text-muted-foreground">{language === "ar" ? "حل بالذكاء الاصطناعي" : "AI Resolution"}</p>
            </CardContent>
          </Card>
          <Card className="col-span-1 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20" data-testid="stat-avg-time">
            <CardContent className="p-3 text-center">
              <Timer className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-600" data-testid="value-avg-time">{metrics.avgResolutionTime}{language === "ar" ? "د" : "m"}</p>
              <p className="text-[10px] text-muted-foreground">{language === "ar" ? "متوسط الحل" : "Avg Resolution"}</p>
            </CardContent>
          </Card>
          <Card className="col-span-1 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20" data-testid="stat-human-rate">
            <CardContent className="p-3 text-center">
              <Users className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-amber-600" data-testid="value-human-rate">{metrics.humanInterventionRate}%</p>
              <p className="text-[10px] text-muted-foreground">{language === "ar" ? "تدخل بشري" : "Human Intervention"}</p>
            </CardContent>
          </Card>
          <Card className="col-span-1 bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20" data-testid="stat-sla-risk">
            <CardContent className="p-3 text-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-600" data-testid="value-sla-risk">{metrics.slaBreachRisk}</p>
              <p className="text-[10px] text-muted-foreground">{language === "ar" ? "خطر SLA" : "SLA Risk"}</p>
            </CardContent>
          </Card>
          <Card className="col-span-1 bg-gradient-to-br from-cyan-500/5 to-transparent border-cyan-500/20" data-testid="stat-performance">
            <CardContent className="p-3 text-center">
              <Gauge className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-cyan-600" data-testid="value-performance">{metrics.agentPerformanceIndex}</p>
              <p className="text-[10px] text-muted-foreground">{language === "ar" ? "مؤشر الأداء" : "Performance"}</p>
            </CardContent>
          </Card>
          <Card className="col-span-1 bg-gradient-to-br from-pink-500/5 to-transparent border-pink-500/20" data-testid="stat-satisfaction">
            <CardContent className="p-3 text-center">
              <HeartPulse className="w-5 h-5 text-pink-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-pink-600" data-testid="value-satisfaction">{metrics.satisfactionPrediction}%</p>
              <p className="text-[10px] text-muted-foreground">{language === "ar" ? "توقع الرضا" : "Satisfaction"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r flex flex-col bg-card/30">
            <div className="p-3 border-b space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder={language === "ar" ? "بحث في التذاكر..." : "Search tickets..."} 
                  className="pl-9 bg-background"
                  data-testid="input-search-tickets"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 text-xs" data-testid="select-filter-status">
                    <SelectValue placeholder={language === "ar" ? "الحالة" : "Status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                    <SelectItem value="new">{language === "ar" ? "جديد" : "New"}</SelectItem>
                    <SelectItem value="open">{language === "ar" ? "مفتوح" : "Open"}</SelectItem>
                    <SelectItem value="in_progress">{language === "ar" ? "قيد المعالجة" : "In Progress"}</SelectItem>
                    <SelectItem value="escalated">{language === "ar" ? "مصعد" : "Escalated"}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="h-8 text-xs" data-testid="select-filter-priority">
                    <SelectValue placeholder={language === "ar" ? "الأولوية" : "Priority"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                    <SelectItem value="critical">{language === "ar" ? "حرج" : "Critical"}</SelectItem>
                    <SelectItem value="high">{language === "ar" ? "عالي" : "High"}</SelectItem>
                    <SelectItem value="medium">{language === "ar" ? "متوسط" : "Medium"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {loadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{language === "ar" ? "لا توجد تذاكر" : "No tickets"}</p>
                  </div>
                ) : (
                  sessions.map((session) => {
                    const status = statusConfig[session.status] || statusConfig.open;
                    const priority = priorityConfig[session.priority] || priorityConfig.medium;
                    const sentiment = session.aiSentiment ? sentimentConfig[session.aiSentiment] : null;
                    const sla = getSlaStatus(session.slaResolutionDue);
                    
                    return (
                      <button
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`w-full p-3 rounded-lg text-left transition-all hover-elevate ${
                          selectedSession?.id === session.id 
                            ? "bg-primary/10 border border-primary/30" 
                            : "bg-background border border-transparent"
                        }`}
                        data-testid={`button-ticket-${session.id}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">
                            {session.ticketNumber}
                          </span>
                          <div className="flex items-center gap-1">
                            {session.riskLevel && session.riskLevel !== 'low' && (
                              <div className={`w-2 h-2 rounded-full ${riskConfig[session.riskLevel]?.color || 'bg-gray-400'}`} />
                            )}
                            <Badge variant="outline" className={`text-[9px] py-0 px-1 ${priority.color}`}>
                              {priority.label[language === "ar" ? "ar" : "en"]}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm font-medium truncate mb-1">{session.subject}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={`text-[9px] py-0 px-1 ${status.color}`}>
                            <status.icon className="w-2.5 h-2.5 mr-0.5" />
                            {status.label[language === "ar" ? "ar" : "en"]}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {sentiment && (
                              <sentiment.icon className={`w-3 h-3 ${sentiment.color.split(' ')[0]}`} />
                            )}
                            {session.aiConfidence && session.aiConfidence > 0.7 && (
                              <Sparkles className="w-3 h-3 text-primary" />
                            )}
                            {sla && sla.status !== 'safe' && (
                              <Timer className={`w-3 h-3 ${sla.color}`} />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {selectedSession ? (
            <div className="flex-1 flex">
              <div className="flex-1 flex flex-col border-r">
                <div className="p-4 border-b bg-card/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{selectedSession.ticketNumber}</span>
                        <Badge variant="outline" className={statusConfig[selectedSession.status]?.color || ''}>
                          {statusConfig[selectedSession.status]?.label[language === "ar" ? "ar" : "en"]}
                        </Badge>
                        <Badge variant="outline" className={priorityConfig[selectedSession.priority]?.color || ''}>
                          {priorityConfig[selectedSession.priority]?.label[language === "ar" ? "ar" : "en"]}
                        </Badge>
                      </div>
                      <h2 className="text-lg font-semibold">{selectedSession.subject}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={selectedSession.status} onValueChange={(status) => updateStatusMutation.mutate({ status })}>
                        <SelectTrigger className="h-8 w-40" data-testid="select-update-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diagnosing">{language === "ar" ? "قيد التشخيص" : "Diagnosing"}</SelectItem>
                          <SelectItem value="action_taken">{language === "ar" ? "تم اتخاذ إجراء" : "Action Taken"}</SelectItem>
                          <SelectItem value="awaiting_user">{language === "ar" ? "بانتظار المستخدم" : "Awaiting User"}</SelectItem>
                          <SelectItem value="resolved">{language === "ar" ? "تم الحل" : "Resolved"}</SelectItem>
                          <SelectItem value="escalated">{language === "ar" ? "تم التصعيد" : "Escalated"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {selectedSession.aiCopilotSummary && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          {language === "ar" ? "ملخص الذكاء الاصطناعي" : "AI Summary"}
                        </span>
                        {selectedSession.aiConfidence && (
                          <Badge variant="outline" className="text-[9px] py-0 px-1 text-primary border-primary/30">
                            {Math.round(selectedSession.aiConfidence * 100)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? selectedSession.aiCopilotSummaryAr || selectedSession.aiCopilotSummary : selectedSession.aiCopilotSummary}
                      </p>
                    </div>
                  )}
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">{language === "ar" ? "لا توجد رسائل" : "No messages"}</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isUser = message.senderType === "user";
                        const isAgent = message.senderType === "agent";
                        const isAI = message.senderType === "ai" || message.isAiGenerated;
                        
                        return (
                          <div key={message.id} className={`flex gap-3 ${isUser ? "" : "flex-row-reverse"}`}>
                            <Avatar className="w-8 h-8 shrink-0">
                              <AvatarFallback className={
                                isAI ? "bg-gradient-to-br from-primary/20 to-primary/5" :
                                isAgent ? "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5" :
                                "bg-muted"
                              }>
                                {isAI ? <Bot className="w-4 h-4 text-primary" /> : 
                                 isAgent ? <Headphones className="w-4 h-4 text-emerald-600" /> :
                                 <User className="w-4 h-4" />}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`max-w-[70%] ${isUser ? "" : "text-right"}`}>
                              <div className={`flex items-center gap-2 mb-1 ${isUser ? "" : "flex-row-reverse"}`}>
                                <span className="text-xs font-medium">
                                  {isAI ? (language === "ar" ? "مساعد الذكاء الاصطناعي" : "AI Assistant") :
                                   isAgent ? (language === "ar" ? "وكيل الدعم" : "Support Agent") :
                                   selectedSession.userName || (language === "ar" ? "المستخدم" : "User")}
                                </span>
                                {message.aiConfidence && (
                                  <Badge variant="outline" className="text-[9px] py-0 px-1 text-primary">
                                    {Math.round(message.aiConfidence * 100)}%
                                  </Badge>
                                )}
                              </div>
                              <div className={`rounded-2xl px-4 py-3 ${
                                isUser ? "bg-muted" :
                                isAI ? "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20" :
                                "bg-emerald-500/10 border border-emerald-500/20"
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
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

                <div className="p-4 border-t bg-card/30">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={language === "ar" ? "اكتب ردك..." : "Type your response..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[60px] resize-none bg-background"
                      data-testid="input-agent-message"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending || !newMessage.trim()}
                      className="shrink-0"
                      data-testid="button-send-response"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="w-80 flex flex-col bg-card/20">
                <Tabs defaultValue="copilot" className="flex-1 flex flex-col">
                  <TabsList className="m-2 bg-muted/50">
                    <TabsTrigger value="copilot" className="text-xs gap-1" data-testid="tab-copilot">
                      <Brain className="w-3.5 h-3.5" />
                      {language === "ar" ? "المساعد" : "Copilot"}
                    </TabsTrigger>
                    <TabsTrigger value="context" className="text-xs gap-1" data-testid="tab-context">
                      <User className="w-3.5 h-3.5" />
                      {language === "ar" ? "السياق" : "Context"}
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="text-xs gap-1" data-testid="tab-actions">
                      <Zap className="w-3.5 h-3.5" />
                      {language === "ar" ? "إجراءات" : "Actions"}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="copilot" className="flex-1 m-0">
                    <ScrollArea className="h-full p-3">
                      <div className="space-y-4">
                        {selectedSession.aiSuggestedResponses && selectedSession.aiSuggestedResponses.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {language === "ar" ? "ردود مقترحة" : "Suggested Responses"}
                            </h4>
                            <div className="space-y-2">
                              {selectedSession.aiSuggestedResponses.map((suggestion) => (
                                <div
                                  key={suggestion.id}
                                  className="p-3 rounded-lg bg-background border hover-elevate cursor-pointer"
                                  onClick={() => useSuggestionMutation.mutate(suggestion)}
                                  data-testid={`button-suggestion-${suggestion.id}`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <Badge variant="outline" className="text-[9px] py-0 px-1">
                                      {suggestion.type === 'quick_reply' ? (language === "ar" ? "رد سريع" : "Quick") :
                                       suggestion.type === 'detailed' ? (language === "ar" ? "مفصل" : "Detailed") :
                                       (language === "ar" ? "تصعيد" : "Escalation")}
                                    </Badge>
                                    <span className="text-[10px] text-primary">{Math.round(suggestion.confidence * 100)}%</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-3">
                                    {language === "ar" ? suggestion.contentAr || suggestion.content : suggestion.content}
                                  </p>
                                  <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-xs" data-testid={`button-use-suggestion-${suggestion.id}`}>
                                    <Send className="w-3 h-3 mr-1" />
                                    {language === "ar" ? "استخدام" : "Use"}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedSession.aiIntent && (
                          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <h4 className="text-xs font-medium mb-1 flex items-center gap-1 text-blue-600">
                              <Target className="w-3.5 h-3.5" />
                              {language === "ar" ? "النية المكتشفة" : "Detected Intent"}
                            </h4>
                            <p className="text-sm">{selectedSession.aiIntent}</p>
                          </div>
                        )}

                        {selectedSession.aiSentiment && sentimentConfig[selectedSession.aiSentiment] && (() => {
                          const sentimentData = sentimentConfig[selectedSession.aiSentiment];
                          const SentimentIcon = sentimentData.icon;
                          return (
                            <div className={`p-3 rounded-lg ${sentimentData.color || 'bg-muted'}`}>
                              <h4 className="text-xs font-medium mb-1 flex items-center gap-1">
                                <SentimentIcon className="w-3.5 h-3.5" />
                                {language === "ar" ? "تحليل المشاعر" : "Sentiment"}
                              </h4>
                              <p className="text-sm">
                                {sentimentData.label[language === "ar" ? "ar" : "en"]}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="context" className="flex-1 m-0">
                    <ScrollArea className="h-full p-3">
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-background border">
                          <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                            <UserCircle className="w-3.5 h-3.5" />
                            {language === "ar" ? "معلومات المستخدم" : "User Profile"}
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{language === "ar" ? "الاسم" : "Name"}</span>
                              <span>{selectedSession.userName || "-"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{language === "ar" ? "البريد" : "Email"}</span>
                              <span className="truncate max-w-[120px]">{selectedSession.userEmail || "-"}</span>
                            </div>
                            {selectedSession.userContext?.subscriptionTier && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{language === "ar" ? "الاشتراك" : "Tier"}</span>
                                <Badge variant="outline" className="text-[9px]">
                                  <Crown className="w-2.5 h-2.5 mr-0.5" />
                                  {selectedSession.userContext.subscriptionTier}
                                </Badge>
                              </div>
                            )}
                            {selectedSession.userContext?.totalTickets !== undefined && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{language === "ar" ? "إجمالي التذاكر" : "Total Tickets"}</span>
                                <span>{selectedSession.userContext.totalTickets}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {selectedSession.platformContext && (
                          <div className="p-3 rounded-lg bg-background border">
                            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5" />
                              {language === "ar" ? "سياق المنصة" : "Platform Context"}
                            </h4>
                            <div className="space-y-2 text-xs">
                              {selectedSession.platformContext.currentPage && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">{language === "ar" ? "الصفحة" : "Page"}</span>
                                  <span className="truncate max-w-[120px]">{selectedSession.platformContext.currentPage}</span>
                                </div>
                              )}
                              {selectedSession.platformContext.currentService && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">{language === "ar" ? "الخدمة" : "Service"}</span>
                                  <span>{selectedSession.platformContext.currentService}</span>
                                </div>
                              )}
                              {selectedSession.platformContext.errorLogs && selectedSession.platformContext.errorLogs.length > 0 && (
                                <div className="mt-2 p-2 rounded bg-red-500/5 border border-red-500/20">
                                  <span className="text-red-600 font-medium">{language === "ar" ? "سجلات الأخطاء" : "Error Logs"}</span>
                                  <div className="mt-1 text-[10px] text-red-600/80 space-y-0.5">
                                    {selectedSession.platformContext.errorLogs.slice(0, 3).map((log, i) => (
                                      <p key={i} className="truncate">{log}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedSession.slaResolutionDue && (
                          <div className="p-3 rounded-lg bg-background border">
                            <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                              <Timer className="w-3.5 h-3.5" />
                              {language === "ar" ? "معلومات SLA" : "SLA Info"}
                            </h4>
                            {(() => {
                              const sla = getSlaStatus(selectedSession.slaResolutionDue);
                              return sla ? (
                                <div className={`flex items-center gap-2 ${sla.color}`}>
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="text-sm">
                                    {sla.status === 'breached' 
                                      ? (language === "ar" ? `تجاوز بـ ${sla.hours} ساعة` : `Breached by ${sla.hours}h`)
                                      : (language === "ar" ? `${sla.hours} ساعة متبقية` : `${sla.hours}h remaining`)}
                                  </span>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="actions" className="flex-1 m-0">
                    <ScrollArea className="h-full p-3">
                      <div className="space-y-4">
                        <h4 className="text-xs font-medium flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" />
                          {language === "ar" ? "الإجراءات المقترحة" : "Recommended Actions"}
                        </h4>
                        
                        {selectedSession.aiRecommendedActions && selectedSession.aiRecommendedActions.length > 0 ? (
                          <div className="space-y-2">
                            {selectedSession.aiRecommendedActions.map((action) => (
                              <div
                                key={action.id}
                                className={`p-3 rounded-lg border ${
                                  action.risk === 'risky' ? 'bg-red-500/5 border-red-500/20' :
                                  action.risk === 'moderate' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                  'bg-emerald-500/5 border-emerald-500/20'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline" className={`text-[9px] py-0 px-1 ${
                                    action.risk === 'risky' ? 'text-red-600 border-red-500/30' :
                                    action.risk === 'moderate' ? 'text-yellow-600 border-yellow-500/30' :
                                    'text-emerald-600 border-emerald-500/30'
                                  }`}>
                                    {action.type === 'restart' ? (language === "ar" ? "إعادة تشغيل" : "Restart") :
                                     action.type === 'rollback' ? (language === "ar" ? "استرجاع" : "Rollback") :
                                     action.type === 'config_fix' ? (language === "ar" ? "إصلاح الإعدادات" : "Config Fix") :
                                     action.type === 'deep_analysis' ? (language === "ar" ? "تحليل عميق" : "Deep Analysis") :
                                     (language === "ar" ? "تصعيد" : "Escalate")}
                                  </Badge>
                                  {action.requiresConfirmation && (
                                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {language === "ar" ? action.actionAr || action.action : action.action}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-7 text-xs"
                                  onClick={() => handleExecuteAction(action)}
                                  data-testid={`button-action-${action.id}`}
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  {language === "ar" ? "تنفيذ" : "Execute"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground text-xs">
                            {language === "ar" ? "لا توجد إجراءات مقترحة" : "No recommended actions"}
                          </div>
                        )}

                        <Separator />

                        <div>
                          <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                            <Settings className="w-3.5 h-3.5" />
                            {language === "ar" ? "إجراءات يدوية" : "Manual Actions"}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs" data-testid="button-request-analysis">
                              <Brain className="w-3 h-3 mr-1" />
                              {language === "ar" ? "تحليل AI" : "AI Analysis"}
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs" data-testid="button-view-logs">
                              <Terminal className="w-3 h-3 mr-1" />
                              {language === "ar" ? "السجلات" : "View Logs"}
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs" data-testid="button-similar-cases">
                              <Link2 className="w-3 h-3 mr-1" />
                              {language === "ar" ? "حالات مشابهة" : "Similar Cases"}
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs text-red-600 hover:text-red-700" data-testid="button-escalate">
                              <ArrowUpRight className="w-3 h-3 mr-1" />
                              {language === "ar" ? "تصعيد" : "Escalate"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <div className="p-4 rounded-full bg-muted/50 inline-block mb-4">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium mb-1">
                  {language === "ar" ? "اختر تذكرة" : "Select a Ticket"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "اختر تذكرة من القائمة للبدء في المعالجة" : "Choose a ticket from the list to start processing"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showActionConfirm} onOpenChange={setShowActionConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              {language === "ar" ? "تأكيد الإجراء" : "Confirm Action"}
            </DialogTitle>
            <DialogDescription>
              {language === "ar" 
                ? "هذا الإجراء يتطلب تأكيداً قبل التنفيذ"
                : "This action requires confirmation before execution"}
            </DialogDescription>
          </DialogHeader>
          
          {pendingAction && (
            <div className="py-4">
              <div className={`p-4 rounded-lg ${
                pendingAction.risk === 'risky' ? 'bg-red-500/10 border border-red-500/30' :
                'bg-yellow-500/10 border border-yellow-500/30'
              }`}>
                <p className="font-medium mb-2">
                  {language === "ar" ? pendingAction.actionAr || pendingAction.action : pendingAction.action}
                </p>
                <Badge variant="outline" className={`text-xs ${
                  pendingAction.risk === 'risky' ? 'text-red-600 border-red-500/30' :
                  'text-yellow-600 border-yellow-500/30'
                }`}>
                  {pendingAction.risk === 'risky' 
                    ? (language === "ar" ? "إجراء عالي الخطورة" : "High Risk Action")
                    : (language === "ar" ? "إجراء متوسط الخطورة" : "Moderate Risk Action")}
                </Badge>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionConfirm(false)} data-testid="button-cancel-action">
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button 
              onClick={() => pendingAction && executeActionMutation.mutate(pendingAction)}
              disabled={executeActionMutation.isPending}
              className="gap-2"
              variant={pendingAction?.risk === 'risky' ? 'destructive' : 'default'}
              data-testid="button-confirm-action"
            >
              {executeActionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {language === "ar" ? "تأكيد التنفيذ" : "Confirm & Execute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
