import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Bot,
  User,
  Pin,
  PinOff,
  Check,
  Play,
  Eye,
  RotateCcw,
  Plus,
  Archive,
  Trash2,
  MessageSquare,
  Brain,
  Sparkles,
  Clock,
  Loader2,
  Settings,
  ChevronRight,
  FileText,
} from "lucide-react";
import { DocLinkButton } from "@/components/doc-link-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NovaSession {
  id: string;
  title: string | null;
  summary: string | null;
  language: string;
  status: string;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

interface NovaMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  language: string;
  attachments?: any[];
  modelUsed?: string;
  tokensUsed?: number;
  responseTime?: number;
  actions?: MessageAction[];
  isEdited: boolean;
  isPinned: boolean;
  createdAt: string;
}

interface MessageAction {
  id: string;
  type: "confirm" | "apply" | "preview" | "compare" | "rollback";
  label: string;
  labelAr?: string;
  status: "pending" | "executed" | "cancelled";
  executedAt?: string;
  result?: any;
}

interface NovaPreferences {
  preferredLanguage?: string;
  preferredFramework?: string;
  preferredDatabase?: string;
  detailLevel?: string;
  codeExplanations?: boolean;
  showAlternatives?: boolean;
  learningScore?: number;
  interactionCount?: number;
}

export default function NovaChat() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [showPreferences, setShowPreferences] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isArabic = language === "ar";

  // Handle assistant URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const assistantIdFromUrl = urlParams.get("assistant");
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(assistantIdFromUrl);

  // Fetch sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<NovaSession[]>({
    queryKey: ["/api/nova/sessions"],
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch messages for selected session
  const { data: messages = [], isLoading: messagesLoading } = useQuery<NovaMessage[]>({
    queryKey: ["/api/nova/sessions", selectedSessionId, "messages"],
    enabled: !!selectedSessionId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Fetch user preferences
  const { data: preferences } = useQuery<NovaPreferences>({
    queryKey: ["/api/nova/preferences"],
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (assistantId?: string) => {
      return apiRequest("POST", "/api/nova/sessions", { 
        language,
        assistantId: assistantId || selectedAssistantId 
      });
    },
    onSuccess: (data: NovaSession) => {
      setSelectedSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/nova/sessions"] });
      // Clear assistant from URL after session created
      if (assistantIdFromUrl) {
        window.history.replaceState({}, '', '/nova');
      }
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/nova/sessions/${selectedSessionId}/messages`, {
        content,
        language,
      });
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({
        queryKey: ["/api/nova/sessions", selectedSessionId, "messages"],
      });
    },
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return apiRequest("POST", `/api/nova/messages/${messageId}/pin`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/nova/sessions", selectedSessionId, "messages"],
      });
    },
  });

  // Execute action mutation
  const executeActionMutation = useMutation({
    mutationFn: async ({ messageId, actionId }: { messageId: string; actionId: string }) => {
      return apiRequest("POST", `/api/nova/messages/${messageId}/actions/${actionId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/nova/sessions", selectedSessionId, "messages"],
      });
    },
  });

  // Archive session mutation
  const archiveSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest("POST", `/api/nova/sessions/${sessionId}/archive`, {});
    },
    onSuccess: () => {
      setSelectedSessionId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/nova/sessions"] });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Partial<NovaPreferences>) => {
      return apiRequest("PATCH", "/api/nova/preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nova/preferences"] });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-create session when assistant is selected from URL
  useEffect(() => {
    if (assistantIdFromUrl && !selectedSessionId && !createSessionMutation.isPending) {
      createSessionMutation.mutate(assistantIdFromUrl);
    }
  }, [assistantIdFromUrl, selectedSessionId]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedSessionId) return;
    sendMessageMutation.mutate(messageInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "confirm":
        return <Check className="w-3 h-3" />;
      case "apply":
        return <Play className="w-3 h-3" />;
      case "preview":
        return <Eye className="w-3 h-3" />;
      case "rollback":
        return <RotateCcw className="w-3 h-3" />;
      default:
        return <ChevronRight className="w-3 h-3" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(isArabic ? "ar-SA" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen bg-background" dir={isArabic ? "rtl" : "ltr"}>
      {/* Sessions Sidebar */}
      <div className="w-80 border-l dark:border-border flex flex-col bg-sidebar">
        <div className="p-4 border-b dark:border-border">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="w-6 h-6 text-primary" />
                <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
              </div>
              <h1 className="font-bold text-lg">{isArabic ? "محادثة نوفا" : "Nova Chat"}</h1>
              <DocLinkButton pageId="nova-chat" />
            </div>
            <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" data-testid="button-preferences">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isArabic ? "تفضيلات نوفا" : "Nova Preferences"}</DialogTitle>
                  <DialogDescription>
                    {isArabic
                      ? "تخصيص طريقة تفاعل نوفا معك"
                      : "Customize how Nova interacts with you"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <Label>{isArabic ? "مستوى التفصيل" : "Detail Level"}</Label>
                    <Select
                      value={preferences?.detailLevel || "balanced"}
                      onValueChange={(v) => updatePreferencesMutation.mutate({ detailLevel: v })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brief">{isArabic ? "موجز" : "Brief"}</SelectItem>
                        <SelectItem value="balanced">{isArabic ? "متوازن" : "Balanced"}</SelectItem>
                        <SelectItem value="detailed">{isArabic ? "مفصل" : "Detailed"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{isArabic ? "شرح الكود" : "Code Explanations"}</Label>
                    <Switch
                      checked={preferences?.codeExplanations ?? true}
                      onCheckedChange={(v) =>
                        updatePreferencesMutation.mutate({ codeExplanations: v })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{isArabic ? "إظهار البدائل" : "Show Alternatives"}</Label>
                    <Switch
                      checked={preferences?.showAlternatives ?? true}
                      onCheckedChange={(v) =>
                        updatePreferencesMutation.mutate({ showAlternatives: v })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{isArabic ? "التفاعلات" : "Interactions"}</span>
                      <span>{preferences?.interactionCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isArabic ? "مستوى التعلم" : "Learning Score"}</span>
                      <span>{((preferences?.learningScore || 0) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Button
            onClick={() => createSessionMutation.mutate(undefined)}
            disabled={createSessionMutation.isPending}
            className="w-full"
            data-testid="button-new-session"
          >
            {createSessionMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
            ) : (
              <Plus className="w-4 h-4 ml-2" />
            )}
            {isArabic ? "محادثة جديدة" : "New Conversation"}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessionsLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center text-muted-foreground p-4 text-sm">
                {isArabic ? "لا توجد محادثات" : "No conversations yet"}
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-3 rounded-md cursor-pointer hover-elevate transition-colors ${
                    selectedSessionId === session.id
                      ? "bg-sidebar-accent"
                      : ""
                  }`}
                  data-testid={`session-${session.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">
                          {session.title ||
                            (isArabic ? "محادثة جديدة" : "New Conversation")}
                        </span>
                      </div>
                      {session.summary && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {session.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {session.messageCount} {isArabic ? "رسالة" : "msgs"}
                        </Badge>
                        {session.lastMessageAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(session.lastMessageAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveSessionMutation.mutate(session.id);
                      }}
                      data-testid={`archive-session-${session.id}`}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Language Toggle */}
        <div className="p-4 border-t dark:border-border">
          <div className="flex items-center justify-between">
            <Label className="text-sm">{isArabic ? "اللغة" : "Language"}</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={language === "ar" ? "default" : "outline"}
                onClick={() => setLanguage("ar")}
                data-testid="button-lang-ar"
              >
                عربي
              </Button>
              <Button
                size="sm"
                variant={language === "en" ? "default" : "outline"}
                onClick={() => setLanguage("en")}
                data-testid="button-lang-en"
              >
                EN
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedSessionId ? (
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {messagesLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      {isArabic ? "مرحباً بك في نوفا" : "Welcome to Nova"}
                    </h3>
                    <p className="text-muted-foreground">
                      {isArabic
                        ? "ابدأ محادثة لبناء تطبيقك الرقمي"
                        : "Start a conversation to build your digital application"}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                      data-testid={`message-${message.id}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "user" ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div
                        className={`flex-1 ${
                          message.role === "user" ? "text-left" : ""
                        }`}
                      >
                        <Card
                          className={`${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : ""
                          } ${message.isPinned ? "ring-2 ring-yellow-400" : ""}`}
                        >
                          <CardContent className="p-3">
                            <div className="whitespace-pre-wrap text-sm">
                              {message.content}
                            </div>
                            {/* Interactive Actions */}
                            {message.actions && message.actions.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                                {message.actions.map((action) => (
                                  <Button
                                    key={action.id}
                                    size="sm"
                                    variant={
                                      action.status === "executed"
                                        ? "secondary"
                                        : "outline"
                                    }
                                    disabled={action.status !== "pending"}
                                    onClick={() =>
                                      executeActionMutation.mutate({
                                        messageId: message.id,
                                        actionId: action.id,
                                      })
                                    }
                                    data-testid={`action-${action.id}`}
                                  >
                                    {getActionIcon(action.type)}
                                    <span className="mr-1">
                                      {isArabic ? action.labelAr || action.label : action.label}
                                    </span>
                                    {action.status === "executed" && (
                                      <Check className="w-3 h-3 text-green-500" />
                                    )}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{formatTime(message.createdAt)}</span>
                          {message.tokensUsed && (
                            <span>
                              {message.tokensUsed} {isArabic ? "رمز" : "tokens"}
                            </span>
                          )}
                          {message.responseTime && (
                            <span>
                              {(message.responseTime / 1000).toFixed(1)}
                              {isArabic ? "ث" : "s"}
                            </span>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => togglePinMutation.mutate(message.id)}
                            data-testid={`pin-message-${message.id}`}
                          >
                            {message.isPinned ? (
                              <PinOff className="w-3 h-3 text-yellow-500" />
                            ) : (
                              <Pin className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t dark:border-border p-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-2">
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isArabic
                        ? "اكتب رسالتك... (Enter للإرسال)"
                        : "Type your message... (Enter to send)"
                    }
                    className="resize-none min-h-[60px]"
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                    className="self-end"
                    data-testid="button-send"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {sendMessageMutation.isPending && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Brain className="w-4 h-4 animate-pulse" />
                    <span>{isArabic ? "نوفا تفكر..." : "Nova is thinking..."}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <Bot className="w-24 h-24 text-muted-foreground" />
                <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {isArabic ? "مرحباً بك في محرك نوفا" : "Welcome to Nova Engine"}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                {isArabic
                  ? "المساعد الذكي لبناء المنصات الرقمية السيادية. ابدأ محادثة جديدة لتصميم وبناء تطبيقك."
                  : "Your intelligent assistant for building sovereign digital platforms. Start a new conversation to design and build your application."}
              </p>
              <Button
                size="lg"
                onClick={() => createSessionMutation.mutate(undefined)}
                disabled={createSessionMutation.isPending}
                data-testid="button-start-conversation"
              >
                {createSessionMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                ) : (
                  <MessageSquare className="w-5 h-5 ml-2" />
                )}
                {isArabic ? "ابدأ محادثة جديدة" : "Start New Conversation"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
