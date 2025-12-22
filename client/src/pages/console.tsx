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
  Wand2,
  LayoutGrid,
  FileCode2,
  Lightbulb,
  Rocket,
  Brain,
  ArrowRight,
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
      const data = await apiRequest("POST", "/api/smart-chat", {
        prompt,
        mode,
        settings,
        conversationHistory: messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content
        }))
      });
      return data;
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
      <header className="flex items-center justify-between h-14 px-4 border-b bg-card/80 backdrop-blur-sm" data-testid="console-header">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-primary" />
          <span className="text-base font-semibold tracking-tight" data-testid="text-console-title">Console</span>
          <Badge variant="secondary" className="text-xs font-medium" data-testid="badge-console-mode">
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

              <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50" data-testid="section-fast-mode">
                <Zap className="w-4 h-4 mt-0.5 text-yellow-500" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Fast</div>
                  <div className="text-xs text-muted-foreground">
                    Make lightweight changes, quickly
                  </div>
                </div>
              </div>

              <div className="space-y-3" data-testid="section-autonomy">
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
                <div className="pt-1">
                  <Slider
                    value={[settings.autonomyLevel]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, autonomyLevel: v }))}
                    min={0}
                    max={3}
                    step={1}
                    className="w-full"
                    data-testid="slider-autonomy"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Low</span>
                    <span>Medium</span>
                    <span className={settings.autonomyLevel >= 2 ? "text-primary font-medium" : ""}>High</span>
                    <span>Max</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3" data-testid="section-building-options">
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

              <div className="flex items-center justify-between py-1" data-testid="section-app-testing">
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

              <div className="space-y-3" data-testid="section-other-options">
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
      </header>

      <main className="flex-1 overflow-y-auto" data-testid="container-messages">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8" data-testid="container-empty-state">
            <div className="flex flex-col items-center text-center max-w-2xl w-full">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-3" data-testid="text-welcome-title">
                مرحباً بك في Console
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-10 max-w-md" data-testid="text-welcome-description">
                اكتب ما تريد بناءه أو اسأل أي سؤال. يمكنني مساعدتك في إنشاء المواقع والتطبيقات.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                <button
                  onClick={() => handleSuggestionClick("أنشئ صفحة ويب احترافية مع تصميم حديث")}
                  className="group relative flex flex-col items-start p-5 rounded-xl border border-border bg-card/50 hover-elevate text-right transition-all duration-200"
                  data-testid="button-suggestion-webpage"
                >
                  <div className="flex items-center gap-3 mb-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <LayoutGrid className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="font-semibold text-foreground">أنشئ صفحة ويب</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    صفحة ويب احترافية بتصميم حديث ومتجاوب
                  </p>
                </button>

                <button
                  onClick={() => handleSuggestionClick("ساعدني في التخطيط لمشروع برمجي جديد")}
                  className="group relative flex flex-col items-start p-5 rounded-xl border border-border bg-card/50 hover-elevate text-right transition-all duration-200"
                  data-testid="button-suggestion-planning"
                >
                  <div className="flex items-center gap-3 mb-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="font-semibold text-foreground">ساعدني في التخطيط</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    خطط لمشروعك مع مساعد الذكاء الاصطناعي
                  </p>
                </button>

                <button
                  onClick={() => handleSuggestionClick("أنشئ موقع تجاري متكامل مع نظام دفع")}
                  className="group relative flex flex-col items-start p-5 rounded-xl border border-border bg-card/50 hover-elevate text-right transition-all duration-200"
                  data-testid="button-suggestion-business"
                >
                  <div className="flex items-center gap-3 mb-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <Rocket className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="font-semibold text-foreground">أنشئ موقع تجاري</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    متجر إلكتروني متكامل مع نظام دفع وإدارة
                  </p>
                </button>

                <button
                  onClick={() => handleSuggestionClick("اكتب لي كود برمجي لتطبيق")}
                  className="group relative flex flex-col items-start p-5 rounded-xl border border-border bg-card/50 hover-elevate text-right transition-all duration-200"
                  data-testid="button-suggestion-code"
                >
                  <div className="flex items-center gap-3 mb-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <FileCode2 className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="font-semibold text-foreground">اكتب لي كود</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    توليد كود برمجي ذكي مع شرح مفصل
                  </p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`message-${message.role}-${index}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" && message.type && (
                    <div className="flex items-center gap-2 mb-2">
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
                  <div className="whitespace-pre-wrap text-sm leading-relaxed" data-testid={`text-message-content-${index}`}>
                    {message.content}
                  </div>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                      {message.suggestions.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8"
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
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start" data-testid="container-loading">
                <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">جاري التفكير...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <footer className="border-t bg-card/80 backdrop-blur-sm" data-testid="container-input">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <Button
              variant={mode === "build" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("build")}
              className="h-9 gap-2"
              data-testid="button-mode-build"
            >
              {mode === "build" ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              <span className="font-medium">Build</span>
              <span className="text-xs opacity-70">Make, test, iterate</span>
            </Button>
            <Button
              variant={mode === "plan" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMode("plan")}
              className="h-9 gap-2"
              data-testid="button-mode-plan"
            >
              {mode === "plan" ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              <span className="font-medium">Plan</span>
              <span className="text-xs opacity-70">Ask questions, plan your work</span>
            </Button>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب هنا للبحث..."
                className="min-h-[48px] max-h-32 resize-none pr-12 text-sm"
                data-testid="input-console-message"
              />
              <Button
                size="icon"
                className="absolute bottom-2 right-2 h-8 w-8"
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
              <SelectTrigger className="w-24 h-[48px]" data-testid="select-generate-mode">
                <SelectValue placeholder="Auto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto" data-testid="option-mode-auto">Auto</SelectItem>
                <SelectItem value="code" data-testid="option-mode-code">Code Only</SelectItem>
                <SelectItem value="chat" data-testid="option-mode-chat">Chat Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </footer>
    </div>
  );
}
