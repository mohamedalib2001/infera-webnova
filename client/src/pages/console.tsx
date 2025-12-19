import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Settings2,
  Zap,
  Bot,
  Wrench,
  TestTube,
  Globe,
  Image,
  Loader2,
  Sparkles,
  Code,
  MessageSquare,
  CheckCircle2,
  Circle,
  ChevronUp,
} from "lucide-react";

interface ConsoleMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "conversation" | "code_generation" | "code_refinement" | "help";
  timestamp: Date;
  suggestions?: string[];
}

interface AgentSettings {
  autonomyLevel: number;
  generateAndExecute: boolean;
  reviewCode: boolean;
  expandScope: boolean;
  planNewWork: boolean;
  appTesting: boolean;
  webSearch: boolean;
  mediaGeneration: boolean;
}

type ConsoleMode = "build" | "plan";

export default function ConsolePage() {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ConsoleMode>("build");
  const [settings, setSettings] = useState<AgentSettings>({
    autonomyLevel: 2,
    generateAndExecute: true,
    reviewCode: true,
    expandScope: false,
    planNewWork: false,
    appTesting: false,
    webSearch: true,
    mediaGeneration: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/smart-chat", {
        prompt,
        mode,
        settings,
        conversationHistory: messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content
        }))
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ConsoleMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        type: data.type,
        timestamp: new Date(),
        suggestions: data.suggestions,
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      const errorMessage: ConsoleMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `حدث خطأ: ${error.message}\n\nError: ${error.message}`,
        type: "conversation",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleSubmit = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: ConsoleMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    textareaRef.current?.focus();
  };

  const getAutonomyLabel = (level: number) => {
    const labels = ["Low", "Medium", "High", "Max"];
    return labels[level] || "Medium";
  };

  return (
    <div className="flex flex-col h-full bg-background" data-testid="page-console">
      <div className="flex items-center justify-between gap-2 p-3 border-b bg-card/50">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          <span className="font-medium" data-testid="text-console-title">Console</span>
          <Badge variant="secondary" className="text-xs" data-testid="badge-console-mode">
            {mode === "build" ? "Build Mode" : "Plan Mode"}
          </Badge>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-console-settings">
              <Settings2 className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end" data-testid="popover-agent-settings">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2" data-testid="text-settings-title">
                <Wrench className="w-4 h-4" />
                Agent Tools
              </h4>

              <div className="flex items-start gap-3 p-2 rounded-md bg-muted/50" data-testid="section-fast-mode">
                <Zap className="w-4 h-4 mt-0.5 text-yellow-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Fast</div>
                  <div className="text-xs text-muted-foreground">
                    Make lightweight changes, quickly
                  </div>
                </div>
              </div>

              <div className="space-y-2" data-testid="section-autonomy">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Autonomous</span>
                  <Badge variant="outline" className="text-xs ml-auto" data-testid="badge-autonomy-level">
                    {getAutonomyLabel(settings.autonomyLevel)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Control Agent's level of autonomy
                </div>
                <div className="pt-2">
                  <Slider
                    value={[settings.autonomyLevel]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, autonomyLevel: v }))}
                    min={0}
                    max={3}
                    step={1}
                    className="w-full"
                    data-testid="slider-autonomy"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span className={settings.autonomyLevel >= 2 ? "text-primary font-medium" : ""}>High</span>
                    <span>Max</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2" data-testid="section-building-options">
                <div className="text-sm font-medium">Recommended building experience</div>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.generateAndExecute}
                      onChange={e => setSettings(s => ({ ...s, generateAndExecute: e.target.checked }))}
                      className="rounded"
                      data-testid="input-generate-execute"
                    />
                    <span className="text-muted-foreground">Generates and executes on task lists</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.reviewCode}
                      onChange={e => setSettings(s => ({ ...s, reviewCode: e.target.checked }))}
                      className="rounded"
                      data-testid="input-review-code"
                    />
                    <span className="text-muted-foreground">Reviews latest code changes and fixes issues found</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.expandScope}
                      onChange={e => setSettings(s => ({ ...s, expandScope: e.target.checked }))}
                      className="rounded"
                      data-testid="input-expand-scope"
                    />
                    <span className="text-muted-foreground">Expands review scope to entire app</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.planNewWork}
                      onChange={e => setSettings(s => ({ ...s, planNewWork: e.target.checked }))}
                      className="rounded"
                      data-testid="input-plan-work"
                    />
                    <span className="text-muted-foreground">Plans and completes new work independently</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between" data-testid="section-app-testing">
                <div className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  <span className="text-sm">App testing</span>
                </div>
                <Switch
                  checked={settings.appTesting}
                  onCheckedChange={v => setSettings(s => ({ ...s, appTesting: v }))}
                  data-testid="switch-app-testing"
                />
              </div>

              <div className="space-y-2" data-testid="section-other-options">
                <div className="text-sm font-medium">Other</div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Web search</span>
                    <Switch
                      checked={settings.webSearch}
                      onCheckedChange={v => setSettings(s => ({ ...s, webSearch: v }))}
                      className="scale-75"
                      data-testid="switch-web-search"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Image className="w-3.5 h-3.5" />
                    <span>Media generation</span>
                    <Switch
                      checked={settings.mediaGeneration}
                      onCheckedChange={v => setSettings(s => ({ ...s, mediaGeneration: v }))}
                      className="scale-75"
                      data-testid="switch-media-generation"
                    />
                  </label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="container-messages">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground" data-testid="container-empty-state">
            <Sparkles className="w-12 h-12 mb-4 text-primary/50" />
            <h3 className="text-lg font-medium mb-2" data-testid="text-welcome-title">مرحباً بك في Console</h3>
            <p className="text-sm max-w-md" data-testid="text-welcome-description">
              اكتب ما تريد بناءه أو اسأل أي سؤال. يمكنني مساعدتك في إنشاء المواقع والتطبيقات.
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("أنشئ صفحة ويب")}
                data-testid="button-suggestion-webpage"
              >
                أنشئ صفحة ويب
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("ساعدني في التخطيط")}
                data-testid="button-suggestion-planning"
              >
                ساعدني في التخطيط
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick("أنشئ موقع تجاري")}
                data-testid="button-suggestion-business"
              >
                أنشئ موقع تجاري
              </Button>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              data-testid={`message-${message.role}-${index}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.role === "assistant" && message.type && (
                  <div className="flex items-center gap-1.5 mb-2">
                    {message.type === "code_generation" && (
                      <Badge variant="secondary" className="text-xs" data-testid={`badge-type-${index}`}>
                        <Code className="w-3 h-3 mr-1" />
                        Code Generated
                      </Badge>
                    )}
                    {message.type === "conversation" && (
                      <Badge variant="secondary" className="text-xs" data-testid={`badge-type-${index}`}>
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Chat
                      </Badge>
                    )}
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm" data-testid={`text-message-content-${index}`}>
                  {message.content}
                </div>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-border/50">
                    {message.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => handleSuggestionClick(suggestion)}
                        data-testid={`button-msg-suggestion-${index}-${idx}`}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {chatMutation.isPending && (
          <div className="flex justify-start" data-testid="container-loading">
            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">جاري التفكير...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-card/50 p-3" data-testid="container-input">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant={mode === "build" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("build")}
            className="gap-1.5"
            data-testid="button-mode-build"
          >
            {mode === "build" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
            <span>Build</span>
            <span className="text-xs text-muted-foreground">Make, test, iterate</span>
          </Button>
          <Button
            variant={mode === "plan" ? "default" : "ghost"}
            size="sm"
            onClick={() => setMode("plan")}
            className="gap-1.5"
            data-testid="button-mode-plan"
          >
            {mode === "plan" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
            <span>Plan</span>
            <span className="text-xs text-muted-foreground">Ask questions, plan your work</span>
          </Button>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب هنا للبحث..."
              className="min-h-[44px] max-h-32 resize-none pr-12"
              data-testid="input-console-message"
            />
            <Button
              size="icon"
              className="absolute bottom-1.5 right-1.5"
              onClick={handleSubmit}
              disabled={!input.trim() || chatMutation.isPending}
              data-testid="button-console-send"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          </div>

          <Select defaultValue="auto">
            <SelectTrigger className="w-36" data-testid="select-generate-mode">
              <SelectValue placeholder="Generate Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto" data-testid="option-mode-auto">Auto</SelectItem>
              <SelectItem value="code" data-testid="option-mode-code">Code Only</SelectItem>
              <SelectItem value="chat" data-testid="option-mode-chat">Chat Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
