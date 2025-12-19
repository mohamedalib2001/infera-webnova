import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";
import { CodePreview } from "@/components/code-preview";
import { EmptyState } from "@/components/empty-state";
import { VersionHistory } from "@/components/version-history";
import { ShareDialog } from "@/components/share-dialog";
import { ComponentLibrary } from "@/components/component-library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowRight, ArrowLeft, Save, Loader2, Sparkles, 
  Globe, Terminal, FolderTree, LayoutGrid, Monitor, 
  Play, Square, ExternalLink, Rocket, Eye, Check,
  Copy, RefreshCw, Settings, ChevronDown, X
} from "lucide-react";
import { ThinkingIndicator } from "@/components/thinking-indicator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project, Message, Template, ChatMessage as ChatMessageType, GenerateCodeResponse } from "@shared/schema";

export default function Builder() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialPrompt = searchParams.get("prompt");
  const templateId = searchParams.get("template");
  const { toast } = useToast();
  const { t, isRtl } = useLanguage();
  
  const getStoredCode = () => {
    try {
      const stored = sessionStorage.getItem('builder_code');
      return stored ? JSON.parse(stored) : { html: '', css: '', js: '' };
    } catch { return { html: '', css: '', js: '' }; }
  };
  
  const storedCode = getStoredCode();
  const [projectName, setProjectName] = useState(t("builder.newProject"));
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [html, setHtml] = useState(storedCode.html);
  const [css, setCss] = useState(storedCode.css);
  const [js, setJs] = useState(storedCode.js);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(params.id || null);
  const [hasProcessedInitialPrompt, setHasProcessedInitialPrompt] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [activeBottomTool, setActiveBottomTool] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<'running' | 'stopped' | 'error'>('stopped');
  const [workflowLogs, setWorkflowLogs] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  
  const bottomTools = [
    { id: 'stop', icon: Square, label: 'Stop', labelAr: 'إيقاف' },
    { id: 'preview', icon: Monitor, label: 'Preview', labelAr: 'معاينة' },
    { id: 'files', icon: LayoutGrid, label: 'Files', labelAr: 'ملفات' },
    { id: 'browser', icon: Globe, label: 'Browser', labelAr: 'متصفح' },
    { id: 'terminal', icon: Terminal, label: 'Terminal', labelAr: 'طرفية' },
  ];

  useEffect(() => {
    if (!isGenerating && pendingMessages.length > 0) {
      const [nextMessage, ...rest] = pendingMessages;
      setPendingMessages(rest);
      processMessage(nextMessage);
    }
  }, [isGenerating, pendingMessages.length]);
  
  useEffect(() => {
    if (html || css || js) {
      sessionStorage.setItem('builder_code', JSON.stringify({ html, css, js }));
    }
  }, [html, css, js]);

  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const { data: existingMessages } = useQuery<Message[]>({
    queryKey: ["/api/projects", projectId, "messages"],
    enabled: !!projectId,
  });

  const { data: template } = useQuery<Template>({
    queryKey: ["/api/templates", templateId],
    enabled: !!templateId,
  });

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setHtml(project.htmlCode);
      setCss(project.cssCode);
      setJs(project.jsCode);
    }
  }, [project]);

  useEffect(() => {
    if (existingMessages && existingMessages.length > 0) {
      const formattedMessages: ChatMessageType[] = existingMessages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
      }));
      setMessages(formattedMessages);
    }
  }, [existingMessages]);

  useEffect(() => {
    if (template) {
      setHtml(template.htmlCode);
      setCss(template.cssCode);
      setJs(template.jsCode);
      setProjectName(`${template.name} - Copy`);
    }
  }, [template]);

  useEffect(() => {
    if (initialPrompt && !projectId && !hasProcessedInitialPrompt) {
      setHasProcessedInitialPrompt(true);
      handleSendMessage(initialPrompt);
      window.history.replaceState({}, "", "/builder");
    }
  }, [initialPrompt, projectId, hasProcessedInitialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; htmlCode: string; cssCode: string; jsCode: string }) => {
      if (projectId) {
        return apiRequest("PATCH", `/api/projects/${projectId}`, data);
      } else {
        return apiRequest("POST", "/api/projects", data);
      }
    },
    onSuccess: async (data) => {
      if (!projectId && data?.id) {
        setProjectId(data.id);
        window.history.replaceState({}, "", `/builder/${data.id}`);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: t("builder.saved") });
    },
    onError: () => {
      toast({ title: t("builder.saveFailed"), variant: "destructive" });
    },
  });

  const saveMessageMutation = useMutation({
    mutationFn: async (message: { projectId: string; role: string; content: string }) => {
      return apiRequest("POST", "/api/messages", message);
    },
  });

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    toast({
      title: t("builder.cancelled"),
      description: t("builder.generationCancelled"),
    });
  };

  const handleSendMessage = async (content: string) => {
    if (isGenerating) {
      setPendingMessages(prev => [...prev, content]);
      const queuedMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
        status: "queued",
      };
      setMessages((prev) => [...prev, queuedMessage]);
      toast({ 
        title: t("builder.messageQueued") || "Message queued",
        description: t("builder.willProcessAfter") || "Will be processed after current generation"
      });
      return;
    }
    processMessage(content);
  };

  interface SmartChatResponse {
    type: "conversation" | "code_generation" | "code_refinement" | "help" | "project_info";
    message: string;
    code?: GenerateCodeResponse;
    suggestions?: string[];
  }

  const processMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
      status: "sending",
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    
    abortControllerRef.current = new AbortController();
    
    const conversationHistory = messages
      .filter(m => m.status !== 'queued')
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }));
    
    try {
      console.log("Starting smart chat request...");
      const data: SmartChatResponse = await apiRequest("POST", "/api/smart-chat", {
        prompt: content,
        conversationHistory,
        projectContext: {
          name: projectName,
          htmlCode: html,
          cssCode: css,
          jsCode: js,
        },
      });
      
      console.log("Smart chat response:", data.type);
      
      if (data.code && (data.type === "code_generation" || data.type === "code_refinement")) {
        setHtml(data.code.html || "");
        setCss(data.code.css || "");
        setJs(data.code.js || "");
      }
      
      const aiMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        suggestions: data.suggestions,
      };
      
      setMessages((prev) => [...prev, aiMessage]);

      if (projectId) {
        saveMessageMutation.mutate({ projectId, role: "user", content });
        saveMessageMutation.mutate({ projectId, role: "assistant", content: data.message });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("builder.tryAgain");
      toast({
        title: t("builder.generateFailed"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    saveMutation.mutate({
      name: projectName,
      htmlCode: html,
      cssCode: css,
      jsCode: js,
    });
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const handlePublish = () => {
    toast({
      title: isRtl ? "جاري النشر..." : "Publishing...",
      description: isRtl ? "سيتم نشر المنصة قريباً" : "Your platform will be published soon",
    });
    setWorkflowStatus('running');
    setWorkflowLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting publish workflow...`]);
  };

  const handlePreview = () => {
    setActiveBottomTool('preview');
    const blob = new Blob([`
<!DOCTYPE html>
<html><head><style>${css}</style></head>
<body>${html}<script>${js}</script></body>
</html>`], { type: 'text/html' });
    setPreviewUrl(URL.createObjectURL(blob));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Toolbar - Mobile Responsive */}
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 px-2 py-2 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <BackIcon className="h-5 w-5" />
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={handlePublish}
          className="gap-1"
          data-testid="button-publish"
        >
          <Rocket className="h-4 w-4" />
          <span className="hidden sm:inline">{isRtl ? "نشر" : "Publish"}</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreview}
          className="gap-1"
          data-testid="button-preview"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">{isRtl ? "معاينة" : "Preview"}</span>
        </Button>
        
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-24 sm:w-32 md:w-40 h-8 text-sm"
          data-testid="input-project-name"
        />
        
        <div className="flex-1" />
        
        <ComponentLibrary
          onInsertComponent={(newHtml, newCss, newJs) => {
            setHtml((prev: string) => prev + "\n" + newHtml);
            setCss((prev: string) => prev + "\n" + newCss);
            if (newJs) setJs((prev: string) => prev + "\n" + newJs);
          }}
        />
        
        {projectId && <VersionHistory projectId={projectId} onRestore={(h, c, j) => { setHtml(h); setCss(c); setJs(j); }} />}
        
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          size="sm"
          className="gap-1"
          data-testid="button-save"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{t("builder.save")}</span>
        </Button>
      </div>
      
      {/* Workflow Status Bar */}
      {(isGenerating || workflowStatus === 'running') && (
        <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 border-b">
          <div className="flex items-center gap-2">
            {workflowStatus === 'running' ? (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">{isRtl ? "نشر المنصة وتفعيل المراقبة" : "Publishing platform"}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">{isRtl ? "جاري العمل..." : "Working..."}</span>
              </div>
            )}
          </div>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
              style={{ width: isGenerating ? '60%' : '100%' }}
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            {messages.length}/{messages.length}
          </Badge>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Preview Panel - Hidden on mobile when chat is focused */}
        <div className="flex-1 p-2 md:p-4 bg-muted/30 min-h-[200px] md:min-h-0">
          <CodePreview
            html={html}
            css={css}
            js={js}
            isGenerating={isGenerating}
          />
        </div>
        
        {/* Chat Panel - Full width on mobile */}
        <div className="w-full md:w-[340px] flex flex-col border-t md:border-t-0 md:border-s bg-background max-h-[50vh] md:max-h-none">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("builder.startConversation")}</h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  {t("builder.startDescription")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message}
                    onSuggestionClick={(suggestion) => handleSendMessage(suggestion)}
                  />
                ))}
                {isGenerating && (
                  <ThinkingIndicator isActive={isGenerating} />
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
          
          <div className="p-4 border-t">
            {pendingMessages.length > 0 && (
              <div className="mb-2 px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("builder.pendingMessages") || "Pending"}: {pendingMessages.length}
              </div>
            )}
            <ChatInput
              onSend={handleSendMessage}
              onCancel={handleCancelGeneration}
              isLoading={isGenerating}
              allowWhileLoading={true}
              placeholder={t("builder.describePlaceholder")}
            />
          </div>
        </div>
      </div>
      
      {/* Bottom Tool Panel - When a tool is active */}
      {activeBottomTool && (
        <div className="h-48 border-t bg-background">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
            <span className="text-sm font-medium">
              {activeBottomTool === 'terminal' && (isRtl ? 'طرفية' : 'Terminal')}
              {activeBottomTool === 'preview' && (isRtl ? 'معاينة' : 'Preview')}
              {activeBottomTool === 'browser' && (isRtl ? 'متصفح' : 'Browser')}
              {activeBottomTool === 'files' && (isRtl ? 'ملفات' : 'Files')}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setActiveBottomTool(null)}
              data-testid="button-close-tool"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-36 p-3">
            {activeBottomTool === 'terminal' && (
              <div className="font-mono text-xs space-y-1 text-green-400 bg-black/90 p-2 rounded">
                <div>$ npm run dev</div>
                <div className="text-muted-foreground">[express] serving on port 5000</div>
                {workflowLogs.map((log, i) => (
                  <div key={i} className="text-muted-foreground">{log}</div>
                ))}
              </div>
            )}
            {activeBottomTool === 'preview' && (
              <iframe 
                src={previewUrl || 'about:blank'} 
                className="w-full h-full bg-white rounded border"
                title="Preview"
              />
            )}
            {activeBottomTool === 'browser' && (
              <div className="text-center text-muted-foreground py-8">
                {isRtl ? 'اضغط على معاينة لعرض المشروع' : 'Click Preview to view the project'}
              </div>
            )}
            {activeBottomTool === 'files' && (
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 p-1 hover-elevate rounded">
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                  <span>index.html</span>
                </div>
                <div className="flex items-center gap-2 p-1 hover-elevate rounded">
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                  <span>styles.css</span>
                </div>
                <div className="flex items-center gap-2 p-1 hover-elevate rounded">
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                  <span>script.js</span>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
      
      {/* Bottom Toolbar - Like Replit Agent */}
      <div className="flex items-center justify-center gap-1 px-2 py-2 border-t bg-background">
        {bottomTools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeBottomTool === tool.id ? "default" : "ghost"}
                size="icon"
                onClick={() => {
                  if (tool.id === 'stop') {
                    setWorkflowStatus('stopped');
                    setActiveBottomTool(null);
                  } else {
                    setActiveBottomTool(activeBottomTool === tool.id ? null : tool.id);
                  }
                }}
                className={tool.id === 'stop' && workflowStatus === 'running' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                data-testid={`button-tool-${tool.id}`}
              >
                <tool.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRtl ? tool.labelAr : tool.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
