import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  MessageCircle, Send, Bot, User, Clock, CheckCircle, AlertCircle, 
  Inbox, Users, Activity, Sparkles, Loader2, ChevronRight, 
  Phone, Video, MoreVertical, RefreshCw, Zap, Copy, ThumbsUp,
  AlertTriangle, ArrowUp, ArrowDown, Circle, BookOpen, Timer
} from "lucide-react";

interface SupportSession {
  id: string;
  ticketNumber: string;
  subject: string;
  subjectAr?: string;
  userName?: string;
  userEmail?: string;
  status: string;
  priority: string;
  channel: string;
  category: string;
  aiConfidence?: number;
  aiEscalationReason?: string;
  assignedAgentId?: string;
  slaFirstResponseDue?: string;
  slaResolutionDue?: string;
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
  isInternal: boolean;
  createdAt: string;
}

interface AgentStats {
  totalSessions: number;
  averageRating: number;
  averageResponseTime: number;
  todaySessions: number;
}

const priorityColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-500 border-green-500/30",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  urgent: "bg-red-500/10 text-red-500 border-red-500/30",
  critical: "bg-red-600/10 text-red-600 border-red-600/30",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  in_progress: "bg-purple-500/10 text-purple-500",
  escalated: "bg-orange-500/10 text-orange-500",
  resolved: "bg-green-500/10 text-green-500",
  closed: "bg-muted text-muted-foreground",
};

const channelIcons: Record<string, any> = {
  live_chat: MessageCircle,
  ai_chat: Bot,
  ticket: Inbox,
  system_alert: AlertCircle,
};

export default function SupportAgentDashboard() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("queue");
  const [selectedSession, setSelectedSession] = useState<SupportSession | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>("available");

  const { data: queueData, isLoading: loadingQueue, refetch: refetchQueue } = useQuery<{ queue: SupportSession[] }>({
    queryKey: ["/api/support/agent/queue"],
    refetchInterval: 10000,
  });

  const { data: mySessionsData, isLoading: loadingMySessions, refetch: refetchMySessions } = useQuery<{ sessions: SupportSession[] }>({
    queryKey: ["/api/support/agent/sessions"],
    refetchInterval: 10000,
  });

  const { data: statsData } = useQuery<{ stats: AgentStats }>({
    queryKey: ["/api/support/agent/stats"],
  });

  const { data: messagesData, isLoading: loadingMessages, refetch: refetchMessages } = useQuery<{ messages: SupportMessage[] }>({
    queryKey: ["/api/support/sessions", selectedSession?.id],
    enabled: !!selectedSession,
    refetchInterval: 5000,
  });

  const { data: suggestionData, isLoading: loadingSuggestion, refetch: refetchSuggestion } = useQuery<{ suggestion: string; confidence: number }>({
    queryKey: ["/api/support/agent/suggest", selectedSession?.id],
    enabled: !!selectedSession && selectedSession.status !== "resolved",
  });

  const claimSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest("POST", `/api/support/agent/claim/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/agent/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/agent/sessions"] });
      toast({
        title: language === "ar" ? "تم استلام الجلسة" : "Session Claimed",
        description: language === "ar" ? "تم تعيين الجلسة لك" : "Session has been assigned to you",
      });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل استلام الجلسة" : "Failed to claim session",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, isInternal }: { content: string; isInternal: boolean }) => {
      return apiRequest("POST", `/api/support/sessions/${selectedSession?.id}/messages`, { content, isInternal });
    },
    onSuccess: () => {
      setNewMessage("");
      setIsInternalNote(false);
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
    mutationFn: async (notes?: string) => {
      return apiRequest("POST", `/api/support/sessions/${selectedSession?.id}/resolve`, { resolutionType: "agent_resolved", notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/agent/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/agent/queue"] });
      toast({
        title: language === "ar" ? "تم حل الجلسة" : "Session Resolved",
      });
      setSelectedSession(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("POST", "/api/support/agent/status", { status });
    },
    onSuccess: (_, status) => {
      setAgentStatus(status);
      toast({
        title: language === "ar" ? "تم تحديث الحالة" : "Status Updated",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;
    sendMessageMutation.mutate({ content: newMessage.trim(), isInternal: isInternalNote });
  };

  const handleUseSuggestion = () => {
    if (suggestionData?.suggestion) {
      setNewMessage(suggestionData.suggestion);
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

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (language === "ar") {
      if (diffSec < 60) return "الآن";
      if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
      if (diffHour < 24) return `منذ ${diffHour} ساعة`;
      if (diffDay < 7) return `منذ ${diffDay} يوم`;
      return formatDate(date);
    } else {
      if (diffSec < 60) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay < 7) return `${diffDay}d ago`;
      return formatDate(date);
    }
  };

  const formatFullDateTime = (date: string) => {
    const d = new Date(date);
    const timeAgo = formatTimeAgo(date);
    const fullDate = d.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return { fullDate, timeAgo };
  };

  const getSLAStatus = (dueDate?: string): { text: string; urgent: boolean } => {
    if (!dueDate) return { text: "N/A", urgent: false };
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 0) return { text: language === "ar" ? "متأخر" : "Overdue", urgent: true };
    if (minutes < 30) return { text: `${minutes}m`, urgent: true };
    if (minutes < 60) return { text: `${minutes}m`, urgent: false };
    return { text: `${Math.floor(minutes / 60)}h`, urgent: false };
  };

  const stats = statsData?.stats || { totalSessions: 0, averageRating: 0, averageResponseTime: 0, todaySessions: 0 };

  return (
    <div className="min-h-screen bg-background p-6" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold mb-2">
              {language === "ar" ? "لوحة تحكم وكيل الدعم" : "Support Agent Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {language === "ar" 
                ? "إدارة طلبات الدعم مع مساعدة الذكاء الاصطناعي"
                : "Manage support requests with AI assistance"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={agentStatus} onValueChange={(v) => updateStatusMutation.mutate(v)}>
              <SelectTrigger className="w-[140px]" data-testid="select-agent-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">
                  <div className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    {language === "ar" ? "متاح" : "Available"}
                  </div>
                </SelectItem>
                <SelectItem value="busy">
                  <div className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-yellow-500 text-yellow-500" />
                    {language === "ar" ? "مشغول" : "Busy"}
                  </div>
                </SelectItem>
                <SelectItem value="away">
                  <div className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-orange-500 text-orange-500" />
                    {language === "ar" ? "بعيد" : "Away"}
                  </div>
                </SelectItem>
                <SelectItem value="offline">
                  <div className="flex items-center gap-2">
                    <Circle className="w-2 h-2 fill-muted-foreground text-muted-foreground" />
                    {language === "ar" ? "غير متصل" : "Offline"}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => { refetchQueue(); refetchMySessions(); }}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{language === "ar" ? "طلبات اليوم" : "Today's Sessions"}</p>
                  <p className="text-3xl font-bold">{stats.todaySessions}</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{language === "ar" ? "إجمالي الجلسات" : "Total Sessions"}</p>
                  <p className="text-3xl font-bold">{stats.totalSessions}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{language === "ar" ? "متوسط التقييم" : "Avg Rating"}</p>
                  <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
                </div>
                <ThumbsUp className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{language === "ar" ? "متوسط الاستجابة" : "Avg Response"}</p>
                  <p className="text-3xl font-bold">{Math.round(stats.averageResponseTime / 60)}m</p>
                </div>
                <Timer className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-2">
                <TabsList className="w-full">
                  <TabsTrigger value="queue" className="flex-1" data-testid="tab-queue">
                    <Inbox className="w-4 h-4" />
                    {language === "ar" ? "الانتظار" : "Queue"}
                    {queueData?.queue?.length ? (
                      <Badge variant="secondary" className="ml-2">{queueData.queue.length}</Badge>
                    ) : null}
                  </TabsTrigger>
                  <TabsTrigger value="my" className="flex-1" data-testid="tab-my-sessions">
                    <MessageCircle className="w-4 h-4" />
                    {language === "ar" ? "جلساتي" : "My"}
                    {mySessionsData?.sessions?.length ? (
                      <Badge variant="secondary" className="ml-2">{mySessionsData.sessions.length}</Badge>
                    ) : null}
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[550px]">
                  <TabsContent value="queue" className="m-0">
                    {loadingQueue ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : queueData?.queue?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                        <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" ? "لا توجد طلبات في الانتظار" : "No sessions in queue"}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {queueData?.queue?.map((session) => {
                          const ChannelIcon = channelIcons[session.channel] || MessageCircle;
                          const sla = getSLAStatus(session.slaFirstResponseDue);
                          return (
                            <div
                              key={session.id}
                              className="p-4 hover-elevate cursor-pointer"
                              onClick={() => setSelectedSession(session)}
                              data-testid={`queue-session-${session.id}`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <ChannelIcon className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium text-sm line-clamp-1">{session.subject}</span>
                                </div>
                                <Badge variant="outline" className={priorityColors[session.priority]}>
                                  {session.priority === "urgent" || session.priority === "critical" ? (
                                    <ArrowUp className="w-3 h-3" />
                                  ) : null}
                                  {session.priority}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <span>{session.ticketNumber}</span>
                                <span>•</span>
                                <span>{session.userName || session.userEmail || "User"}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {session.aiConfidence && (
                                    <Badge variant="outline" className="text-[10px]">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      AI: {Math.round(session.aiConfidence * 100)}%
                                    </Badge>
                                  )}
                                  {session.status === "escalated" && (
                                    <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-500">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      {language === "ar" ? "مصعّد" : "Escalated"}
                                    </Badge>
                                  )}
                                </div>
                                <div className={`text-xs ${sla.urgent ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {sla.text}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="w-full mt-3"
                                onClick={(e) => { e.stopPropagation(); claimSessionMutation.mutate(session.id); }}
                                disabled={claimSessionMutation.isPending}
                                data-testid={`button-claim-${session.id}`}
                              >
                                {claimSessionMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>{language === "ar" ? "استلام" : "Claim"}</>
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="my" className="m-0">
                    {loadingMySessions ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : mySessionsData?.sessions?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                        <Inbox className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" ? "لا توجد جلسات نشطة" : "No active sessions"}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {mySessionsData?.sessions?.map((session) => {
                          const ChannelIcon = channelIcons[session.channel] || MessageCircle;
                          return (
                            <button
                              key={session.id}
                              className={`w-full text-right p-4 hover-elevate transition-colors ${
                                selectedSession?.id === session.id ? "bg-muted/50" : ""
                              }`}
                              onClick={() => setSelectedSession(session)}
                              data-testid={`my-session-${session.id}`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <ChannelIcon className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium text-sm line-clamp-1">{session.subject}</span>
                                </div>
                                <Badge variant="outline" className={statusColors[session.status]}>
                                  {session.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{session.ticketNumber}</span>
                                <span>•</span>
                                <span>{session.userName || session.userEmail}</span>
                                <span>•</span>
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(session.updatedAt)}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                </ScrollArea>
              </CardContent>
            </Tabs>
          </Card>

          <Card className="lg:col-span-2">
            {selectedSession ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{selectedSession.subject}</CardTitle>
                      </div>
                      <CardDescription className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={statusColors[selectedSession.status]}>
                          {selectedSession.status}
                        </Badge>
                        <Badge variant="outline" className={priorityColors[selectedSession.priority]}>
                          {selectedSession.priority}
                        </Badge>
                        <span className="text-xs">{selectedSession.ticketNumber}</span>
                        <span className="text-xs">•</span>
                        <span className="text-xs">{selectedSession.userName || selectedSession.userEmail}</span>
                      </CardDescription>
                      {selectedSession.aiEscalationReason && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-orange-500/10 rounded-lg text-xs text-orange-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{selectedSession.aiEscalationReason}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedSession.status !== "resolved" && selectedSession.status !== "closed" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => resolveSessionMutation.mutate(undefined)}
                          disabled={resolveSessionMutation.isPending}
                          data-testid="button-resolve-session"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {language === "ar" ? "حل" : "Resolve"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col" style={{ height: "calc(100% - 120px)" }}>
                  <ScrollArea className="flex-1 p-4" style={{ height: "300px" }}>
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messagesData?.messages?.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${
                              message.senderType === "agent" ? "flex-row-reverse" : ""
                            }`}
                          >
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              {message.senderType === "ai" ? (
                                <AvatarFallback className="bg-primary/10">
                                  <Bot className="w-4 h-4 text-primary" />
                                </AvatarFallback>
                              ) : message.senderType === "agent" ? (
                                <AvatarFallback className="bg-green-500/10">
                                  <User className="w-4 h-4 text-green-500" />
                                </AvatarFallback>
                              ) : message.senderType === "system" ? (
                                <AvatarFallback className="bg-muted">
                                  <AlertCircle className="w-4 h-4" />
                                </AvatarFallback>
                              ) : (
                                <AvatarFallback className="bg-muted">
                                  <User className="w-4 h-4" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                message.senderType === "agent"
                                  ? "bg-primary text-primary-foreground"
                                  : message.senderType === "ai"
                                  ? "bg-muted border border-primary/20"
                                  : message.isInternal
                                  ? "bg-yellow-500/10 border border-yellow-500/30"
                                  : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">
                                  {message.senderType === "ai"
                                    ? "AI"
                                    : message.senderType === "agent"
                                    ? language === "ar" ? "أنت" : "You"
                                    : message.senderName || "User"}
                                </span>
                                {message.isInternal && (
                                  <Badge variant="outline" className="text-[10px] py-0 bg-yellow-500/10">
                                    {language === "ar" ? "داخلي" : "Internal"}
                                  </Badge>
                                )}
                                {message.isAiGenerated && message.aiConfidence && (
                                  <Badge variant="outline" className="text-[10px] py-0">
                                    {Math.round(message.aiConfidence * 100)}%
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <div className="flex items-center gap-2 text-[10px] opacity-60 mt-1">
                                <span title={formatFullDateTime(message.createdAt).fullDate}>
                                  {formatTimeAgo(message.createdAt)}
                                </span>
                                <span className="opacity-50">|</span>
                                <span>{formatDate(message.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {suggestionData?.suggestion && (
                    <div className="mx-4 mb-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Sparkles className="w-4 h-4 text-primary" />
                          {language === "ar" ? "اقتراح الذكاء الاصطناعي" : "AI Suggestion"}
                          <Badge variant="outline" className="text-[10px]">
                            {Math.round(suggestionData.confidence * 100)}%
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleUseSuggestion}
                          data-testid="button-use-suggestion"
                        >
                          <Copy className="w-4 h-4" />
                          {language === "ar" ? "استخدام" : "Use"}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {suggestionData.suggestion}
                      </p>
                    </div>
                  )}

                  {selectedSession.status !== "resolved" && selectedSession.status !== "closed" && (
                    <div className="p-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Switch
                          checked={isInternalNote}
                          onCheckedChange={setIsInternalNote}
                          id="internal-note"
                        />
                        <Label htmlFor="internal-note" className="text-xs text-muted-foreground">
                          {language === "ar" ? "ملاحظة داخلية (غير مرئية للعميل)" : "Internal note (not visible to customer)"}
                        </Label>
                      </div>
                      <div className="flex gap-2">
                        <Textarea
                          placeholder={
                            isInternalNote
                              ? language === "ar" ? "اكتب ملاحظة داخلية..." : "Write an internal note..."
                              : language === "ar" ? "اكتب رسالتك..." : "Type your message..."
                          }
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={2}
                          className={isInternalNote ? "border-yellow-500/50" : ""}
                          data-testid="input-agent-message"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={sendMessageMutation.isPending || !newMessage.trim()}
                          data-testid="button-send-agent-message"
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
              <div className="flex flex-col items-center justify-center h-[500px] text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {language === "ar" ? "اختر جلسة" : "Select a Session"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {language === "ar"
                    ? "اختر جلسة من القائمة للبدء في الرد"
                    : "Choose a session from the list to start responding"}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
