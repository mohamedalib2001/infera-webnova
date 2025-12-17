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
import { ArrowRight, Save, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  
  const [projectName, setProjectName] = useState("مشروع جديد");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(params.id || null);
  const [hasProcessedInitialPrompt, setHasProcessedInitialPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      setProjectName(`${template.name} - نسخة`);
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
        const response = await apiRequest("PATCH", `/api/projects/${projectId}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/projects", data);
        return response.json();
      }
    },
    onSuccess: async (data) => {
      if (!projectId && data?.id) {
        setProjectId(data.id);
        window.history.replaceState({}, "", `/builder/${data.id}`);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "تم حفظ المشروع!" });
    },
    onError: () => {
      toast({ title: "فشل في حفظ المشروع", variant: "destructive" });
    },
  });

  const saveMessageMutation = useMutation({
    mutationFn: async (message: { projectId: string; role: string; content: string }) => {
      const response = await apiRequest("POST", "/api/messages", message);
      return response.json();
    },
  });

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    
    try {
      const response = await apiRequest("POST", "/api/generate", {
        prompt: content,
        projectId,
        context: html ? `Current HTML: ${html}\nCurrent CSS: ${css}\nCurrent JS: ${js}` : undefined,
      });
      
      const data: GenerateCodeResponse = await response.json();
      
      setHtml(data.html);
      setCss(data.css);
      setJs(data.js);
      
      const aiMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);

      if (projectId) {
        saveMessageMutation.mutate({ projectId, role: "user", content });
        saveMessageMutation.mutate({ projectId, role: "assistant", content: data.message });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حاول مرة أخرى";
      toast({
        title: "فشل في التوليد",
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

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <header className="flex items-center gap-4 p-3 border-b bg-background/95 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="max-w-xs font-semibold text-right"
          data-testid="input-project-name"
        />
        
        <div className="flex-1" />

        <ComponentLibrary
          onInsertComponent={(newHtml, newCss, newJs) => {
            setHtml((prev) => prev + "\n" + newHtml);
            setCss((prev) => prev + "\n" + newCss);
            if (newJs) setJs((prev) => prev + "\n" + newJs);
          }}
        />
        
        {projectId && <VersionHistory projectId={projectId} onRestore={(h, c, j) => { setHtml(h); setCss(c); setJs(j); }} />}
        
        {projectId && <ShareDialog projectId={projectId} />}
        
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="gap-2"
          data-testid="button-save"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          حفظ
        </Button>
      </header>
      
      {/* Main content - Preview on left, Chat on right for RTL */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Panel - appears on left in RTL */}
        <div className="flex-1 p-4 bg-muted/30">
          <CodePreview
            html={html}
            css={css}
            js={js}
          />
        </div>
        
        {/* Chat Panel - appears on right in RTL */}
        <div className="w-[380px] flex flex-col border-r bg-background">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">ابدأ محادثة</h3>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  صِف الموقع الذي تريد بناءه وسيساعدك الذكاء الاصطناعي في إنشائه
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
          
          <div className="p-4 border-t">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isGenerating}
              placeholder="صِف ما تريد تغييره..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
