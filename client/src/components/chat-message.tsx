import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Sparkles, Clock } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@shared/schema";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isQueued = message.status === "queued";
  
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
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col gap-1 max-w-[80%]">
        {isQueued && (
          <Badge variant="secondary" className="self-end text-xs gap-1">
            <Clock className="h-3 w-3" />
            في الانتظار
          </Badge>
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? isQueued 
                ? "bg-primary/70 text-primary-foreground"
                : "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
