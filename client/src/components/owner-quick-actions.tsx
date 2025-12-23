/**
 * Owner Quick Actions - أيقونات الوصول السريع للمالك
 * FAB ذكي يظهر فقط للمالك مع إمكانية الدردشة مع Nova من أي صفحة
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sparkles,
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Minimize2,
  Maximize2,
  Crown,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const translations = {
  ar: {
    quickActions: "الإجراءات السريعة",
    chatWithNova: "محادثة Nova",
    settings: "الإعدادات",
    ownerDashboard: "لوحة المالك",
    typeMessage: "اكتب رسالتك...",
    send: "إرسال",
    novaAssistant: "مساعد Nova",
    thinking: "جاري التفكير...",
    close: "إغلاق",
    minimize: "تصغير",
    maximize: "تكبير",
    sovereignAccess: "وصول سيادي",
  },
  en: {
    quickActions: "Quick Actions",
    chatWithNova: "Chat with Nova",
    settings: "Settings",
    ownerDashboard: "Owner Dashboard",
    typeMessage: "Type your message...",
    send: "Send",
    novaAssistant: "Nova Assistant",
    thinking: "Thinking...",
    close: "Close",
    minimize: "Minimize",
    maximize: "Maximize",
    sovereignAccess: "Sovereign Access",
  },
};

export function OwnerQuickActions() {
  const { user, isSovereign } = useAuth();
  const { isRtl } = useLanguage();
  const [, setLocation] = useLocation();
  const t = isRtl ? translations.ar : translations.en;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/nova/smart-chat", {
        message,
        projectId: null,
        context: {
          currentPage: window.location.pathname,
          timestamp: new Date().toISOString(),
        },
      });
      return response;
    },
    onSuccess: (data: any) => {
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
          },
        ]);
      }
    },
  });

  const handleSend = () => {
    if (!inputValue.trim() || chatMutation.isPending) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: inputValue.trim(), timestamp: new Date() },
    ]);
    chatMutation.mutate(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Only show for sovereign/owner users
  if (!isSovereign) return null;

  const quickActions = [
    {
      id: "chat",
      icon: MessageCircle,
      label: t.chatWithNova,
      onClick: () => {
        setIsChatOpen(true);
        setIsExpanded(false);
      },
      color: "text-primary",
    },
    {
      id: "dashboard",
      icon: Crown,
      label: t.ownerDashboard,
      onClick: () => {
        setLocation("/owner");
        setIsExpanded(false);
      },
      color: "text-amber-500",
    },
    {
      id: "settings",
      icon: Settings,
      label: t.settings,
      onClick: () => {
        setLocation("/settings");
        setIsExpanded(false);
      },
      color: "text-muted-foreground",
    },
  ];

  return (
    <>
      {/* FAB Button */}
      <div
        className={cn(
          "fixed bottom-24 z-40 flex flex-col items-center gap-2",
          isRtl ? "left-4" : "right-4"
        )}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2 mb-2"
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full shadow-lg"
                        onClick={action.onClick}
                        data-testid={`button-quick-${action.id}`}
                      >
                        <action.icon className={cn("h-5 w-5", action.color)} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side={isRtl ? "right" : "left"}>
                      {action.label}
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full shadow-xl transition-all duration-300",
                "bg-gradient-to-br from-primary via-primary to-primary/80",
                "hover:shadow-primary/30 hover:shadow-2xl",
                isExpanded && "rotate-45"
              )}
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-owner-quick-actions"
            >
              <Zap className="h-6 w-6 text-primary-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isRtl ? "right" : "left"}>
            <div className="flex items-center gap-1">
              <Crown className="h-3 w-3 text-amber-500" />
              <span>{t.sovereignAccess}</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : 500,
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-24 z-50 w-80 sm:w-96 rounded-xl border bg-background shadow-2xl overflow-hidden",
              isRtl ? "left-4" : "right-4"
            )}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between gap-2 p-3 border-b bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{t.novaAssistant}</h3>
                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                    <Crown className="h-2 w-2 mr-0.5 text-amber-500" />
                    {t.sovereignAccess}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setIsMinimized(!isMinimized)}
                  data-testid="button-chat-minimize"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setIsChatOpen(false)}
                  data-testid="button-chat-close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            {!isMinimized && (
              <>
                <ScrollArea className="h-[340px] p-3" ref={scrollRef}>
                  <div className="flex flex-col gap-3">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full py-12 text-center text-muted-foreground">
                        <Bot className="h-12 w-12 mb-3 opacity-50" />
                        <p className="text-sm">
                          {isRtl
                            ? "مرحباً! كيف يمكنني مساعدتك؟"
                            : "Hello! How can I help you?"}
                        </p>
                      </div>
                    )}
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex gap-2",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <div
                          className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                            msg.role === "user"
                              ? "bg-primary"
                              : "bg-gradient-to-br from-primary/80 to-primary/40"
                          )}
                        >
                          {msg.role === "user" ? (
                            <User className="h-4 w-4 text-primary-foreground" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatMutation.isPending && (
                      <div className="flex gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t.thinking}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="p-3 border-t bg-muted/30">
                  <div className="flex gap-2">
                    <Textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.typeMessage}
                      className="min-h-[40px] max-h-[100px] resize-none text-sm"
                      disabled={chatMutation.isPending}
                      data-testid="input-quick-chat"
                    />
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!inputValue.trim() || chatMutation.isPending}
                      data-testid="button-quick-chat-send"
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
