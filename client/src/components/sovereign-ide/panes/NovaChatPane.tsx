import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Loader2,
  Send,
  Crown,
  Mic,
  MicOff,
  Pin,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import ownerAvatarUrl from "@assets/unnamed_1766647794224.jpg";
import type { ConversationMessage } from "../utils/ide-types";

interface NovaChatPaneProps {
  isRtl: boolean;
  messages: ConversationMessage[];
  loadingMessages: boolean;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  onSendMessage: () => void;
  isProcessing: boolean;
  streamingMessage: string;
  isConnected: boolean;
  isAuthenticated: boolean;
  isListening?: boolean;
  onToggleVoice?: () => void;
  isVoiceEnabled?: boolean;
  pinnedMessages?: Set<string>;
  onTogglePinMessage?: (id: string) => void;
}

export function NovaChatPane({
  isRtl,
  messages,
  loadingMessages,
  newMessage,
  setNewMessage,
  onSendMessage,
  isProcessing,
  streamingMessage,
  isConnected,
  isAuthenticated,
  isListening = false,
  onToggleVoice,
  isVoiceEnabled = false,
  pinnedMessages = new Set(),
  onTogglePinMessage,
}: NovaChatPaneProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const text = {
    connected: isRtl ? "متصل" : "Connected",
    connecting: isRtl ? "اتصال..." : "Connecting...",
    authenticating: isRtl ? "مصادقة..." : "Auth...",
    typeMessage: isRtl ? "اكتب رسالتك..." : "Type your message...",
    thinking: isRtl ? "Nova AI يفكر..." : "Nova AI is thinking...",
    greeting: isRtl ? "مرحباً! أنا Nova AI" : "Hello! I'm Nova AI",
    assistant: isRtl ? "مساعدك الذكي في المنطقة السيادية" : "Your intelligent assistant in the Sovereign Zone",
    startTyping: isRtl ? "اكتب رسالتك وسأساعدك في بناء منصتك" : "Type a message and I'll help you build your platform",
    owner: isRtl ? "المالك" : "Owner",
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const connectionStatus = isConnected && isAuthenticated
    ? text.connected
    : isConnected
    ? text.authenticating
    : text.connecting;

  const connectionColor = isConnected && isAuthenticated
    ? "bg-green-500"
    : isConnected
    ? "bg-yellow-500"
    : "bg-red-500";

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent">
        <div className="relative w-5 h-5">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-40" />
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
            <Sparkles className="h-2.5 w-2.5 text-white" />
          </div>
        </div>
        <span className="text-xs font-medium bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Nova AI</span>
        <div className="flex-1" />
        <div className={`w-2 h-2 rounded-full ${connectionColor}`} />
        <span className="text-xs text-muted-foreground">{connectionStatus}</span>
        {isProcessing && <Loader2 className="h-3 w-3 animate-spin text-violet-400" />}
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4" data-testid="chat-messages">
          {loadingMessages ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="relative mx-auto mb-4 w-16 h-16">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 animate-pulse opacity-30" />
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {text.greeting}
              </p>
              <p className="text-sm mt-1">{text.assistant}</p>
              <p className="text-xs mt-3 opacity-70">{text.startTyping}</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="relative w-9 h-9">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-30" />
                      <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <span className="text-[9px] mt-0.5 text-violet-400 font-medium">Nova AI</span>
                  </div>
                )}
                <div className="max-w-[80%] group">
                  <div className={`rounded-lg p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-60 mt-1 block">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onTogglePinMessage?.(msg.id)}>
                        <Pin className={`h-3 w-3 ${pinnedMessages.has(msg.id) ? "text-amber-400" : ""}`} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="relative">
                      <img src={ownerAvatarUrl} alt="Owner" className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-500/50" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center ring-2 ring-background">
                        <Crown className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                    <span className="text-[9px] mt-0.5 text-amber-400 font-medium">{text.owner}</span>
                  </div>
                )}
              </div>
            ))
          )}

          {isProcessing && (
            <div className="flex gap-3 justify-start">
              <div className="shrink-0">
                <div className="relative w-9 h-9">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse" />
                  <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                  <span className="text-sm bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-medium">
                    {text.thinking}
                  </span>
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
        <div className="flex items-end gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={text.typeMessage}
            className="min-h-[44px] max-h-32 resize-none text-sm"
            data-testid="nova-message-input"
          />
          <div className="flex flex-col gap-1">
            {onToggleVoice && (
              <Button
                size="icon"
                variant={isListening ? "default" : "outline"}
                className={`h-9 w-9 ${isListening ? "bg-red-500 hover:bg-red-600" : ""}`}
                onClick={onToggleVoice}
                disabled={!isVoiceEnabled && !isListening}
                data-testid="button-voice"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Button
              size="icon"
              className="h-9 w-9 bg-gradient-to-r from-violet-600 to-fuchsia-600"
              onClick={onSendMessage}
              disabled={!newMessage.trim() || isProcessing}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
