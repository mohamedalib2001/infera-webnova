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
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
  
  const [projectName, setProjectName] = useState("Untitled Project");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(params.id || null);
  const [hasProcessedInitialPrompt, setHasProcessedInitialPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch existing project if editing
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  // Fetch existing messages for project
  const { data: existingMessages } = useQuery<Message[]>({
    queryKey: ["/api/projects", projectId, "messages"],
    enabled: !!projectId,
  });

  // Fetch template if starting from template
  const { data: template } = useQuery<Template>({
    queryKey: ["/api/templates", templateId],
    enabled: !!templateId,
  });

  // Load project data when fetched
  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setHtml(project.htmlCode);
      setCss(project.cssCode);
      setJs(project.jsCode);
    }
  }, [project]);

  // Load existing messages when fetched
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

  // Load template data when fetched
  useEffect(() => {
    if (template) {
      setHtml(template.htmlCode);
      setCss(template.cssCode);
      setJs(template.jsCode);
      setProjectName(`${template.name} - Copy`);
    }
  }, [template]);

  // Process initial prompt (only once)
  useEffect(() => {
    if (initialPrompt && !projectId && !hasProcessedInitialPrompt) {
      setHasProcessedInitialPrompt(true);
      handleSendMessage(initialPrompt);
      // Clear the URL parameter
      window.history.replaceState({}, "", "/builder");
    }
  }, [initialPrompt, projectId, hasProcessedInitialPrompt]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save project mutation
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
      toast({ title: "Project saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save project", variant: "destructive" });
    },
  });

  // Save message mutation
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
      
      // Update code
      setHtml(data.html);
      setCss(data.css);
      setJs(data.js);
      
      // Add AI response
      const aiMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);

      // Save messages to backend if we have a project
      if (projectId) {
        saveMessageMutation.mutate({ projectId, role: "user", content });
        saveMessageMutation.mutate({ projectId, role: "assistant", content: data.message });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Generation failed",
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="max-w-xs font-semibold"
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
          Save
        </Button>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="w-[400px] flex flex-col border-r bg-background">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <EmptyState type="chat" />
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
              placeholder="Describe what you want to change..."
            />
          </div>
        </div>
        
        {/* Preview Panel */}
        <div className="flex-1 p-4">
          <CodePreview
            html={html}
            css={css}
            js={js}
          />
        </div>
      </div>
    </div>
  );
}
