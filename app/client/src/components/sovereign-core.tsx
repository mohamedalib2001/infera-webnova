import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Brain,
  MessageSquare,
  FolderKanban,
  Shield,
  Lock,
  Sparkles,
  Send,
  Plus,
  Trash2,
  Archive,
  RefreshCw,
  ChevronRight,
  Cpu,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Crown,
  Zap,
  Database,
  Network,
} from "lucide-react";
import type { SovereignConversation, ConversationMessage, SovereignWorkspaceProject } from "@shared/schema";

interface SovereignCoreProps {
  workspaceId: string;
  isOwner: boolean;
}

export function SovereignCore({ workspaceId, isOwner }: SovereignCoreProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  
  const [activeRegistry, setActiveRegistry] = useState<"conversations" | "projects">("conversations");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState("");

  const t = {
    ar: {
      title: "النواة السيادية",
      subtitle: "عقل اصطناعي مستقل - معزول بالكامل",
      ownerOnly: "للمالك فقط",
      isolated: "بيئة معزولة",
      conversationsRegistry: "سجل المحادثات",
      projectsRegistry: "سجل المنصات الرقمية",
      noConversations: "لا توجد محادثات سيادية",
      startConversation: "بدء محادثة جديدة",
      newConversation: "محادثة جديدة",
      conversationTitle: "عنوان المحادثة",
      create: "إنشاء",
      cancel: "إلغاء",
      typeMessage: "اكتب رسالتك للنواة السيادية...",
      send: "إرسال",
      processing: "جاري المعالجة...",
      noProjects: "لا توجد منصات رقمية مُنشأة",
      projectsDescription: "المنصات الرقمية المُنشأة عبر الحساب السيادي",
      conversationsDescription: "جميع المحادثات السيادية المعزولة",
      messages: "رسالة",
      lastActivity: "آخر نشاط",
      created: "تاريخ الإنشاء",
      status: "الحالة",
      active: "نشط",
      archived: "مؤرشف",
      delete: "حذف",
      archive: "أرشفة",
      securityNote: "جميع البيانات مشفرة ومعزولة - لا يمكن الوصول إليها من خارج هذه البيئة",
      sovereignMind: "العقل السيادي",
      capabilities: "القدرات",
      selfEvolving: "تطور ذاتي",
      internalKnowledge: "معرفة داخلية",
      noExternalDeps: "بدون تبعيات خارجية",
      coreFeatures: "الميزات الأساسية",
      reasoning: "استدلال منطقي",
      generation: "توليد ذاتي",
      adaptation: "تكيف فوري",
      selectConversation: "اختر محادثة للبدء",
    },
    en: {
      title: "Sovereign Core",
      subtitle: "Independent AI Mind - Fully Isolated",
      ownerOnly: "Owner Only",
      isolated: "Isolated Environment",
      conversationsRegistry: "Conversations Registry",
      projectsRegistry: "Digital Platforms Registry",
      noConversations: "No sovereign conversations",
      startConversation: "Start New Conversation",
      newConversation: "New Conversation",
      conversationTitle: "Conversation Title",
      create: "Create",
      cancel: "Cancel",
      typeMessage: "Type your message to Sovereign Core...",
      send: "Send",
      processing: "Processing...",
      noProjects: "No digital platforms created",
      projectsDescription: "Digital platforms created through sovereign account",
      conversationsDescription: "All isolated sovereign conversations",
      messages: "messages",
      lastActivity: "Last Activity",
      created: "Created",
      status: "Status",
      active: "Active",
      archived: "Archived",
      delete: "Delete",
      archive: "Archive",
      securityNote: "All data is encrypted and isolated - cannot be accessed outside this environment",
      sovereignMind: "Sovereign Mind",
      capabilities: "Capabilities",
      selfEvolving: "Self-Evolving",
      internalKnowledge: "Internal Knowledge",
      noExternalDeps: "No External Dependencies",
      coreFeatures: "Core Features",
      reasoning: "Logical Reasoning",
      generation: "Self-Generation",
      adaptation: "Instant Adaptation",
      selectConversation: "Select a conversation to start",
    },
  };

  const text = isRtl ? t.ar : t.en;

  const { data: conversations, isLoading: loadingConversations } = useQuery<SovereignConversation[]>({
    queryKey: ['/api/sovereign-core/conversations', workspaceId],
    enabled: isOwner,
  });

  const { data: projects, isLoading: loadingProjects } = useQuery<SovereignWorkspaceProject[]>({
    queryKey: ['/api/sovereign/workspace/projects'],
    enabled: isOwner,
  });

  const { data: messages, isLoading: loadingMessages } = useQuery<ConversationMessage[]>({
    queryKey: ['/api/sovereign-core/conversations', selectedConversation, 'messages'],
    enabled: !!selectedConversation && isOwner,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      return await apiRequest("POST", "/api/sovereign-core/conversations", {
        title,
        workspaceId,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations'] });
      setSelectedConversation(data.id);
      setShowNewConversationDialog(false);
      setNewConversationTitle("");
      toast({
        title: isRtl ? "تم إنشاء المحادثة" : "Conversation Created",
        description: isRtl ? "تم إنشاء محادثة سيادية جديدة" : "New sovereign conversation created",
      });
    },
    onError: () => {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: isRtl ? "فشل إنشاء المحادثة" : "Failed to create conversation",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      setIsProcessing(true);
      return await apiRequest("POST", `/api/sovereign-core/conversations/${selectedConversation}/messages`, {
        content,
        role: "user",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-core/conversations', selectedConversation, 'messages'] });
      setNewMessage("");
      setIsProcessing(false);
    },
    onError: () => {
      setIsProcessing(false);
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: isRtl ? "فشل إرسال الرسالة" : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    sendMessageMutation.mutate(newMessage);
  };

  if (!isOwner) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Lock className="w-16 h-16 mx-auto text-destructive/50" />
            <p className="text-lg font-medium text-destructive">
              {isRtl ? "الوصول مرفوض - للمالك فقط" : "Access Denied - Owner Only"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <Card className="bg-gradient-to-br from-violet-950/30 via-background to-indigo-950/20 border-violet-500/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {text.title}
                  <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-500">
                    <Crown className="w-3 h-3 mr-1" />
                    {text.ownerOnly}
                  </Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  {text.subtitle}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500/50 bg-green-500/10 text-green-500">
                <Lock className="w-3 h-3 mr-1" />
                {text.isolated}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium">{text.selfEvolving}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium">{text.internalKnowledge}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Network className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium">{text.noExternalDeps}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {text.securityNote}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeRegistry} onValueChange={(v) => setActiveRegistry(v as "conversations" | "projects")}>
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="conversations" className="gap-2 text-base">
            <MessageSquare className="w-5 h-5" />
            {text.conversationsRegistry}
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2 text-base">
            <FolderKanban className="w-5 h-5" />
            {text.projectsRegistry}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{text.conversationsRegistry}</CardTitle>
                  <Button size="sm" onClick={() => setShowNewConversationDialog(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>{text.conversationsDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {loadingConversations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : conversations && conversations.length > 0 ? (
                    <div className="space-y-2">
                      {conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv.id)}
                          className={cn(
                            "w-full p-3 rounded-lg text-start transition-all",
                            selectedConversation === conv.id
                              ? "bg-violet-500/20 border border-violet-500/50"
                              : "bg-muted/50 hover:bg-muted border border-transparent"
                          )}
                          data-testid={`conversation-item-${conv.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate">{conv.title}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{conv.messageCount} {text.messages}</span>
                            <span>•</span>
                            <span>{format(new Date(conv.createdAt), "MMM d")}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">{text.noConversations}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setShowNewConversationDialog(true)}
                        data-testid="button-start-conversation"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {text.startConversation}
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-violet-500" />
                  {text.sovereignMind}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {selectedConversation ? (
                  <div className="flex flex-col h-[400px]">
                    <ScrollArea className="flex-1 p-4">
                      {loadingMessages ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : messages && messages.length > 0 ? (
                        <div className="space-y-4">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={cn(
                                "p-3 rounded-lg max-w-[80%]",
                                msg.role === "user"
                                  ? "bg-violet-500/20 ml-auto"
                                  : "bg-muted"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {msg.role === "assistant" ? (
                                  <Brain className="w-4 h-4 text-violet-500" />
                                ) : (
                                  <Crown className="w-4 h-4 text-amber-500" />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {msg.role === "user" ? (isRtl ? "المالك" : "Owner") : (isRtl ? "النواة" : "Core")}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Sparkles className="w-12 h-12 mx-auto text-violet-500/50 mb-3" />
                          <p className="text-muted-foreground">
                            {isRtl ? "ابدأ المحادثة مع النواة السيادية" : "Start conversing with Sovereign Core"}
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                    
                    <Separator />
                    
                    <div className="p-4">
                      <div className="flex gap-2">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={text.typeMessage}
                          className="resize-none"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          data-testid="input-sovereign-message"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isProcessing}
                          className="shrink-0"
                          data-testid="button-send-sovereign-message"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="text-center">
                      <Brain className="w-16 h-16 mx-auto text-violet-500/30 mb-4" />
                      <p className="text-muted-foreground">{text.selectConversation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{text.projectsRegistry}</CardTitle>
              <CardDescription>{text.projectsDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProjects ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <Card key={project.id} className="bg-muted/30" data-testid={`project-card-${project.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{isRtl ? project.nameAr || project.name : project.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {project.deploymentStatus}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">{project.code}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {isRtl ? project.descriptionAr || project.description : project.description}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(project.createdAt!), "MMM d, yyyy")}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">{text.noProjects}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-500" />
              {text.newConversation}
            </DialogTitle>
            <DialogDescription>
              {isRtl ? "إنشاء محادثة سيادية جديدة معزولة" : "Create a new isolated sovereign conversation"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{text.conversationTitle}</label>
              <Input
                value={newConversationTitle}
                onChange={(e) => setNewConversationTitle(e.target.value)}
                placeholder={isRtl ? "أدخل عنوان المحادثة..." : "Enter conversation title..."}
                data-testid="input-new-conversation-title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewConversationDialog(false)}>
              {text.cancel}
            </Button>
            <Button
              onClick={() => createConversationMutation.mutate(newConversationTitle)}
              disabled={!newConversationTitle.trim() || createConversationMutation.isPending}
              data-testid="button-create-conversation"
            >
              {createConversationMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              {text.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
