import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Sparkles, Clock, Bot, Loader2 } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@shared/schema";

interface ChatMessageProps {
  message: ChatMessageType;
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatMessage({ message, onSuggestionClick }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isQueued = message.status === "queued";
  const isThinking = message.status === "thinking";
  const isSending = message.status === "sending";
  
  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      data-testid={`chat-message-${message.id}`}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-gradient-to-br from-violet-500 to-pink-500 text-white"
          }
        >
          {isUser ? (
            isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />
          ) : (
            isThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col gap-1 max-w-[80%]">
        {isQueued && (
          <Badge variant="secondary" className="self-end text-xs gap-1">
            <Clock className="h-3 w-3" />
            في الانتظار
          </Badge>
        )}
        {isSending && (
          <Badge variant="secondary" className="self-start text-xs gap-1 opacity-70">
            <Loader2 className="h-3 w-3 animate-spin" />
            جاري الإرسال
          </Badge>
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? isQueued || isSending
                ? "bg-primary/70 text-primary-foreground"
                : "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          {isThinking ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>جاري التفكير...</span>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        
        {!isUser && message.modelInfo && (
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
            <Bot className="h-3 w-3" />
            <span>{message.modelInfo.name}</span>
            <span className="opacity-50">•</span>
            <span>{message.modelInfo.provider}</span>
          </div>
        )}
        
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-col gap-2 mt-2 w-full">
            {message.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs text-start whitespace-normal h-auto py-2 justify-start"
                onClick={() => onSuggestionClick?.(suggestion)}
                data-testid={`button-suggestion-${index}`}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
