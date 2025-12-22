import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NovaToolbar, ViewportFrame, type ActivePanel, type ViewportMode } from "@/components/nova-toolbar";
import {
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  Shield,
  Rocket,
  LineChart,
  Crown,
  Terminal,
  Globe,
  Lightbulb,
  Zap,
  Code,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssistantConfig {
  id: string;
  type: string;
  name: string;
  nameAr: string;
  capabilities: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    tokensUsed?: number;
    executionTime?: number;
  };
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
  actions?: any[];
  metadata: {
    tokensUsed: number;
    executionTime: number;
    toolsUsed: string[];
    confidence: number;
  };
}

const t = {
  ar: {
    title: "المساعدون السياديون",
    subtitle: "تحدث مع مساعدي الذكاء الاصطناعي السياديين",
    selectAssistant: "اختر مساعد",
    typeMessage: "اكتب رسالتك...",
    send: "إرسال",
    thinking: "يفكر...",
    suggestions: "اقتراحات",
    capabilities: "القدرات",
    startConversation: "ابدأ محادثة مع أحد المساعدين",
    ai_governor: "الحاكم الذكي",
    platform_architect: "مهندس المنصة",
    operations_commander: "قائد العمليات",
    security_guardian: "حارس الأمان",
    growth_strategist: "استراتيجي النمو",
    tokens: "توكن",
    time: "الوقت",
    ms: "مللي ثانية",
    newChat: "محادثة جديدة",
    preview: "معاينة",
    terminal: "طرفية",
  },
  en: {
    title: "Sovereign Assistants",
    subtitle: "Chat with your sovereign AI assistants",
    selectAssistant: "Select Assistant",
    typeMessage: "Type your message...",
    send: "Send",
    thinking: "Thinking...",
    suggestions: "Suggestions",
    capabilities: "Capabilities",
    startConversation: "Start a conversation with an assistant",
    ai_governor: "AI Governor",
    platform_architect: "Platform Architect",
    operations_commander: "Operations Commander",
    security_guardian: "Security Guardian",
    growth_strategist: "Growth Strategist",
    tokens: "tokens",
    time: "Time",
    ms: "ms",
    newChat: "New Chat",
    preview: "Preview",
    terminal: "Terminal",
  },
};

const assistantIcons: Record<string, any> = {
  ai_governor: Crown,
  platform_architect: Code,
  operations_commander: Rocket,
  security_guardian: Shield,
  growth_strategist: LineChart,
};

const assistantColors: Record<string, string> = {
  ai_governor: "from-purple-500 to-pink-500",
  platform_architect: "from-blue-500 to-cyan-500",
  operations_commander: "from-orange-500 to-red-500",
  security_guardian: "from-green-500 to-emerald-500",
  growth_strategist: "from-yellow-500 to-orange-500",
};

export default function SovereignChat() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const txt = t[language];
  
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [activePanel, setActivePanel] = useState<ActivePanel>('ai');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: assistantsData } = useQuery<{ configs: AssistantConfig[] }>({
    queryKey: ['/api/platform/sovereign-assistant/configs'],
  });

  const assistants = assistantsData?.configs || [];

  const initSessionMutation = useMutation({
    mutationFn: async (assistantId: string) => {
      return apiRequest('POST', '/api/platform/sovereign-assistant/session', { assistantId });
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      setMessages([]);
    },
  });

  const chatMutation = useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: string }) => {
      return apiRequest('POST', '/api/platform/sovereign-assistant/chat', {
        sessionId,
        message,
      });
    },
    onSuccess: (data: ChatResponse) => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        metadata: data.metadata,
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectAssistant = async (assistantId: string) => {
    setSelectedAssistant(assistantId);
    initSessionMutation.mutate(assistantId);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || chatMutation.isPending) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage("");

    chatMutation.mutate({ sessionId, message: messageToSend });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    textareaRef.current?.focus();
  };

  const selectedAssistantConfig = assistants.find(a => a.id === selectedAssistant);
  const AssistantIcon = selectedAssistant ? assistantIcons[selectedAssistant] : Bot;

  return (
    <div className={cn(
      "flex flex-col h-full",
      isFullscreen && "fixed inset-0 z-50 bg-background"
    )}>
      <NovaToolbar
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        viewportMode={viewportMode}
        onViewportChange={setViewportMode}
        isFullscreen={isFullscreen}
        onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
        isGenerating={chatMutation.isPending}
        language={language}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r bg-muted/30 hidden md:flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">{txt.selectAssistant}</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {assistants.map(assistant => {
                const Icon = assistantIcons[assistant.type] || Bot;
                const isSelected = selectedAssistant === assistant.id;
                
                return (
                  <button
                    key={assistant.id}
                    onClick={() => handleSelectAssistant(assistant.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                      isSelected 
                        ? "bg-primary text-primary-foreground" 
                        : "hover-elevate"
                    )}
                    data-testid={`button-assistant-${assistant.id}`}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected 
                        ? "bg-primary-foreground/20" 
                        : `bg-gradient-to-br ${assistantColors[assistant.type]}`
                    )}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {language === 'ar' ? assistant.nameAr : assistant.name}
                      </p>
                      <p className={cn(
                        "text-xs truncate",
                        isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {assistant.capabilities.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {activePanel === 'ai' && (
            <>
              {!selectedAssistant ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <Card className="max-w-lg w-full">
                    <CardHeader className="text-center">
                      <div className="mx-auto p-4 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full w-fit mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle>{txt.title}</CardTitle>
                      <p className="text-muted-foreground">{txt.startConversation}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {assistants.map(assistant => {
                          const Icon = assistantIcons[assistant.type] || Bot;
                          return (
                            <Button
                              key={assistant.id}
                              variant="outline"
                              className="h-auto p-4 flex flex-col items-start gap-2"
                              onClick={() => handleSelectAssistant(assistant.id)}
                              data-testid={`button-select-${assistant.id}`}
                            >
                              <div className={cn(
                                "p-2 rounded-lg bg-gradient-to-br",
                                assistantColors[assistant.type]
                              )}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-medium">
                                {language === 'ar' ? assistant.nameAr : assistant.name}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-4 border-b bg-muted/30">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      assistantColors[selectedAssistant]
                    )}>
                      <AssistantIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {language === 'ar' 
                          ? selectedAssistantConfig?.nameAr 
                          : selectedAssistantConfig?.name}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {selectedAssistantConfig?.capabilities.slice(0, 3).map(cap => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAssistant(null);
                        setSessionId(null);
                        setMessages([]);
                      }}
                      data-testid="button-new-chat"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {txt.newChat}
                    </Button>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4 max-w-3xl mx-auto">
                      {messages.map(message => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            message.role === 'user' ? "flex-row-reverse" : "flex-row"
                          )}
                          data-testid={`message-${message.id}`}
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className={
                              message.role === 'user'
                                ? "bg-primary text-primary-foreground"
                                : `bg-gradient-to-br ${assistantColors[selectedAssistant]} text-white`
                            }>
                              {message.role === 'user' ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <AssistantIcon className="h-4 w-4" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={cn(
                            "flex flex-col gap-1 max-w-[80%]",
                            message.role === 'user' ? "items-end" : "items-start"
                          )}>
                            <div className={cn(
                              "rounded-2xl px-4 py-3",
                              message.role === 'user'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                            
                            {message.metadata && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Zap className="h-3 w-3" />
                                <span>{message.metadata.tokensUsed} {txt.tokens}</span>
                                <span className="opacity-50">|</span>
                                <span>{message.metadata.executionTime}{txt.ms}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {chatMutation.isPending && (
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className={cn(
                              "bg-gradient-to-br text-white",
                              assistantColors[selectedAssistant]
                            )}>
                              <AssistantIcon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">{txt.thinking}</span>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t bg-background">
                    <div className="max-w-3xl mx-auto flex gap-3">
                      <Textarea
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={txt.typeMessage}
                        className="min-h-[44px] max-h-[200px] resize-none"
                        rows={1}
                        data-testid="input-message"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || chatMutation.isPending}
                        data-testid="button-send"
                      >
                        {chatMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activePanel === 'preview' && (
            <ViewportFrame mode={viewportMode} className="flex-1">
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{txt.preview}</p>
                </div>
              </div>
            </ViewportFrame>
          )}

          {activePanel === 'terminal' && (
            <div className="flex-1 bg-black text-green-400 font-mono p-4 overflow-auto">
              <div className="text-center py-8">
                <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{txt.terminal}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
