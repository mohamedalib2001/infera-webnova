import { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, Send, Bot, User, Clock, CheckCircle, AlertCircle, 
  Plus, ArrowUp, Loader2, Sparkles, HelpCircle, Book, Search,
  ChevronRight, Star, ThumbsUp, ThumbsDown
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
  assignedAgentId?: string;
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
}

const priorityColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  urgent: "bg-red-500/10 text-red-500",
  critical: "bg-red-600/10 text-red-600",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-500",
  pending: "bg-yellow-500/10 text-yellow-500",
  in_progress: "bg-purple-500/10 text-purple-500",
  escalated: "bg-orange-500/10 text-orange-500",
  resolved: "bg-green-500/10 text-green-500",
  closed: "bg-muted text-muted-foreground",
};

export default function Support() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedSession, setSelectedSession] = useState<SupportSession | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: "",
    category: "general",
    message: "",
  });
  const [knowledgeSearch, setKnowledgeSearch] = useState("");

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
        description: language === "ar" ? "مساعد الذكاء الاصطناعي يتعامل مع طلبك" : "AI Assistant is handling your request",
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
        title: language === "ar" ? "تم إغلاق الجلسة" : "Session Closed",
        description: language === "ar" ? "شكراً على ملاحظاتك" : "Thank you for your feedback",
      });
      setSelectedSession(null);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2">
            {language === "ar" ? "مركز الدعم" : "Support Center"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar" 
              ? "احصل على المساعدة من مساعد الذكاء الاصطناعي أو فريق الدعم"
              : "Get help from AI Assistant or our support team"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="chat" className="gap-2" data-testid="tab-chat">
              <MessageCircle className="w-4 h-4" />
              {language === "ar" ? "محادثات الدعم" : "Support Chats"}
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2" data-testid="tab-knowledge">
              <Book className="w-4 h-4" />
              {language === "ar" ? "قاعدة المعرفة" : "Knowledge Base"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <CardTitle className="text-lg">
                    {language === "ar" ? "طلباتي" : "My Requests"}
                  </CardTitle>
                  <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-new-request">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>
                          {language === "ar" ? "طلب دعم جديد" : "New Support Request"}
                        </DialogTitle>
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
                              <SelectItem value="general">{language === "ar" ? "عام" : "General"}</SelectItem>
                              <SelectItem value="billing">{language === "ar" ? "الفواتير" : "Billing"}</SelectItem>
                              <SelectItem value="ai">{language === "ar" ? "الذكاء الاصطناعي" : "AI"}</SelectItem>
                              <SelectItem value="api">{language === "ar" ? "واجهة برمجة التطبيقات" : "API"}</SelectItem>
                              <SelectItem value="security">{language === "ar" ? "الأمان" : "Security"}</SelectItem>
                              <SelectItem value="bug_report">{language === "ar" ? "الإبلاغ عن خطأ" : "Bug Report"}</SelectItem>
                              <SelectItem value="feature_request">{language === "ar" ? "طلب ميزة" : "Feature Request"}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{language === "ar" ? "الرسالة" : "Message"}</Label>
                          <Textarea
                            placeholder={language === "ar" ? "صف مشكلتك بالتفصيل..." : "Describe your issue in detail..."}
                            value={newTicketForm.message}
                            onChange={(e) => setNewTicketForm((f) => ({ ...f, message: e.target.value }))}
                            rows={5}
                            data-testid="input-message"
                          />
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                          <Bot className="w-5 h-5 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {language === "ar" 
                              ? "سيتعامل مساعد الذكاء الاصطناعي مع طلبك أولاً"
                              : "AI Assistant will handle your request first"}
                          </span>
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleCreateSession}
                          disabled={createSessionMutation.isPending || !newTicketForm.subject.trim() || !newTicketForm.message.trim()}
                          data-testid="button-submit-request"
                        >
                          {createSessionMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              {language === "ar" ? "إرسال" : "Submit"}
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {loadingSessions ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : sessionsData?.sessions?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                        <HelpCircle className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {language === "ar" ? "لا توجد طلبات دعم" : "No support requests yet"}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewTicket(true)}
                        >
                          {language === "ar" ? "إنشاء طلب جديد" : "Create new request"}
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {sessionsData?.sessions?.map((session) => (
                          <button
                            key={session.id}
                            className={`w-full text-right p-4 hover-elevate transition-colors ${
                              selectedSession?.id === session.id ? "bg-muted/50" : ""
                            }`}
                            onClick={() => setSelectedSession(session)}
                            data-testid={`session-${session.id}`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="font-medium text-sm line-clamp-1">{session.subject}</span>
                              <Badge variant="outline" className={statusColors[session.status] || ""}>
                                {session.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{session.ticketNumber}</span>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(session.createdAt)}</span>
                            </div>
                            {session.aiConfidence && session.aiConfidence > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <Sparkles className="w-3 h-3 text-primary" />
                                <span className="text-xs text-muted-foreground">
                                  AI: {Math.round(session.aiConfidence * 100)}%
                                </span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                {selectedSession ? (
                  <>
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">{selectedSession.subject}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={statusColors[selectedSession.status]}>
                              {selectedSession.status}
                            </Badge>
                            <Badge variant="outline" className={priorityColors[selectedSession.priority]}>
                              {selectedSession.priority}
                            </Badge>
                            <span>{selectedSession.ticketNumber}</span>
                          </CardDescription>
                        </div>
                        {selectedSession.status !== "resolved" && selectedSession.status !== "closed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveSessionMutation.mutate({ rating: 5 })}
                            disabled={resolveSessionMutation.isPending}
                            data-testid="button-close-session"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {language === "ar" ? "إغلاق" : "Close"}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[350px] p-4">
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
                                  message.senderType === "user" ? "flex-row-reverse" : ""
                                }`}
                              >
                                <Avatar className="w-8 h-8">
                                  {message.senderType === "ai" ? (
                                    <AvatarFallback className="bg-primary/10">
                                      <Bot className="w-4 h-4 text-primary" />
                                    </AvatarFallback>
                                  ) : message.senderType === "agent" ? (
                                    <AvatarFallback className="bg-green-500/10">
                                      <User className="w-4 h-4 text-green-500" />
                                    </AvatarFallback>
                                  ) : (
                                    <AvatarFallback className="bg-muted">
                                      <User className="w-4 h-4" />
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div
                                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                    message.senderType === "user"
                                      ? "bg-primary text-primary-foreground"
                                      : message.senderType === "ai"
                                      ? "bg-muted border border-primary/20"
                                      : "bg-muted"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium">
                                      {message.senderType === "ai"
                                        ? "AI Assistant"
                                        : message.senderType === "agent"
                                        ? message.senderName || "Agent"
                                        : language === "ar" ? "أنت" : "You"}
                                    </span>
                                    {message.isAiGenerated && message.aiConfidence && (
                                      <Badge variant="outline" className="text-[10px] py-0">
                                        {Math.round(message.aiConfidence * 100)}%
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  <p className="text-[10px] opacity-60 mt-1">
                                    {formatDate(message.createdAt)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                      {selectedSession.status !== "resolved" && selectedSession.status !== "closed" && (
                        <div className="p-4 border-t">
                          <div className="flex gap-2">
                            <Input
                              placeholder={language === "ar" ? "اكتب رسالتك..." : "Type your message..."}
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                              disabled={sendMessageMutation.isPending}
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
                  <div className="flex flex-col items-center justify-center h-[500px] text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {language === "ar" ? "اختر محادثة" : "Select a Conversation"}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {language === "ar"
                        ? "اختر طلب دعم من القائمة أو أنشئ طلباً جديداً"
                        : "Choose a support request from the list or create a new one"}
                    </p>
                    <Button onClick={() => setShowNewTicket(true)} data-testid="button-start-conversation">
                      <Plus className="w-4 h-4" />
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
                <CardTitle>{language === "ar" ? "قاعدة المعرفة" : "Knowledge Base"}</CardTitle>
                <CardDescription>
                  {language === "ar"
                    ? "ابحث في المقالات والأدلة للعثور على إجابات"
                    : "Search articles and guides to find answers"}
                </CardDescription>
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

                {knowledgeData?.articles?.length === 0 ? (
                  <div className="text-center py-12">
                    <Book className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">
                      {language === "ar" ? "لا توجد مقالات" : "No Articles Found"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? "جرب البحث بكلمات مختلفة"
                        : "Try searching with different keywords"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {knowledgeData?.articles?.map((article) => (
                      <div
                        key={article.id}
                        className="p-4 border rounded-lg hover-elevate cursor-pointer transition-colors"
                        data-testid={`article-${article.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">
                              {language === "ar" && article.titleAr ? article.titleAr : article.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.content.substring(0, 150)}...
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <Badge variant="outline">{article.category}</Badge>
                              <span className="flex items-center gap-1">
                                <Book className="w-3 h-3" />
                                {article.viewCount} {language === "ar" ? "مشاهدة" : "views"}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
