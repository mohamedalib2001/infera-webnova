import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Paperclip, MessageSquare, BarChart3, ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading = false, placeholder = "Ask AI to create your website..." }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card/80 dark:bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg">
        {/* Input area */}
        <div className="p-4">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[44px] max-h-[150px] resize-none border-0 bg-transparent text-base focus-visible:ring-0 placeholder:text-muted-foreground/60"
            disabled={isLoading}
            data-testid="input-chat-message"
          />
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center justify-between px-4 pb-4 gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              data-testid="button-add-new"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              data-testid="button-attach"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground"
              data-testid="button-chat-mode"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              data-testid="button-analytics"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            size="icon"
            className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            data-testid="button-send-message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
