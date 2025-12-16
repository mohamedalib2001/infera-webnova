import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Sparkles } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@shared/schema";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  
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
      
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
