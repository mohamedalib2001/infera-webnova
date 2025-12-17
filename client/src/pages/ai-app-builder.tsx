import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Play, 
  Database, 
  Server, 
  Layout, 
  Lock, 
  Palette, 
  Link2,
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  Sparkles,
  Code,
  FileCode,
  Clock,
  Rocket,
  ChevronRight
} from "lucide-react";
import type { AiBuildSession, AiBuildTask, AiBuildArtifact } from "@shared/schema";

interface SessionWithDetails {
  session: AiBuildSession;
  tasks: AiBuildTask[];
  artifacts: AiBuildArtifact[];
}

const taskTypeIcons: Record<string, typeof Database> = {
  database: Database,
  backend: Server,
  frontend: Layout,
  auth: Lock,
  styling: Palette,
  integration: Link2,
};

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  running: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
  failed: "bg-red-500/10 text-red-500",
  planning: "bg-yellow-500/10 text-yellow-500",
  building: "bg-blue-500/10 text-blue-500",
  planned: "bg-purple-500/10 text-purple-500",
};

export default function AiAppBuilder() {
  const [prompt, setPrompt] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<AiBuildSession[]>({
    queryKey: ["/api/ai-builder/sessions"],
    refetchInterval: 5000,
  });

  const { data: sessionDetails, isLoading: detailsLoading } = useQuery<SessionWithDetails>({
    queryKey: ["/api/ai-builder/sessions", activeSessionId],
    enabled: !!activeSessionId,
    refetchInterval: activeSessionId ? 3000 : false,
  });

  const planMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await apiRequest("POST", "/api/ai-builder/plan", { prompt });
      return res.json();
    },
    onSuccess: (data: AiBuildSession) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-builder/sessions"] });
      setActiveSessionId(data.id);
      setPrompt("");
      toast({
        title: "تم إنشاء خطة البناء / Build plan created",
        description: "يمكنك الآن مراجعة الخطة وبدء البناء / You can now review the plan and start building",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في إنشاء الخطة / Failed to create plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const executeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await apiRequest("POST", `/api/ai-builder/sessions/${sessionId}/execute`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-builder/sessions"] });
      toast({
        title: "تم البناء بنجاح / Build completed",
        description: "تم إنشاء التطبيق بنجاح / Application built successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل في البناء / Build failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (prompt.trim().length < 10) {
      toast({
        title: "الوصف قصير جداً / Description too short",
        description: "يرجى وصف التطبيق بشكل أكثر تفصيلاً / Please describe the app in more detail",
        variant: "destructive",
      });
      return;
    }
    planMutation.mutate(prompt);
  };

  const handleExecute = () => {
    if (activeSessionId) {
      executeMutation.mutate(activeSessionId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "running": return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-ai-app-builder">
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">
                منشئ التطبيقات بالذكاء الاصطناعي
              </h1>
              <p className="text-sm text-muted-foreground">
                AI App Builder - Build complete applications with AI
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  وصف التطبيق / Describe Your App
                </CardTitle>
                <CardDescription>
                  اكتب وصفاً لما تريد بناءه وسيقوم الذكاء الاصطناعي بإنشاء التطبيق كاملاً
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="مثال: أريد منصة موارد بشرية تتضمن إدارة الموظفين، طلبات الإجازات، تتبع الحضور، وتقارير الأداء مع لوحة تحكم للمديرين...

Example: I want an HR platform with employee management, leave requests, attendance tracking, and performance reports with a dashboard for managers..."
                  className="min-h-[150px] resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  data-testid="input-app-description"
                />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    {prompt.length}/10 حرف كحد أدنى / minimum characters
                  </p>
                  <Button 
                    onClick={handleSubmit}
                    disabled={planMutation.isPending || prompt.length < 10}
                    data-testid="button-create-plan"
                  >
                    {planMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري التخطيط... / Planning...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        إنشاء خطة البناء / Create Build Plan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {activeSessionId && sessionDetails && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Rocket className="w-5 h-5" />
                        {sessionDetails.session.appName || "تطبيق جديد"}
                      </CardTitle>
                      <CardDescription>
                        {sessionDetails.session.plan?.summary}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[sessionDetails.session.status || "pending"]}>
                      {sessionDetails.session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>التقدم / Progress</span>
                      <span>{sessionDetails.session.progress}%</span>
                    </div>
                    <Progress value={sessionDetails.session.progress || 0} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sessionDetails.session.plan?.features?.map((feature, i) => (
                      <Badge key={i} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">خطوات البناء / Build Steps</h4>
                    <div className="space-y-2">
                      {sessionDetails.tasks.map((task) => {
                        const Icon = taskTypeIcons[task.taskType] || Code;
                        return (
                          <div 
                            key={task.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                          >
                            {getStatusIcon(task.status)}
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{task.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{task.titleAr}</p>
                            </div>
                            {task.status === "running" && (
                              <Progress value={task.progress || 0} className="w-20" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {sessionDetails.session.status === "planned" && (
                    <Button 
                      className="w-full"
                      onClick={handleExecute}
                      disabled={executeMutation.isPending}
                      data-testid="button-start-build"
                    >
                      {executeMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري البناء... / Building...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          بدء البناء / Start Building
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSessionId && sessionDetails?.artifacts && sessionDetails.artifacts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="w-5 h-5" />
                    الملفات المُنشأة / Generated Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList>
                      <TabsTrigger value="all">الكل / All</TabsTrigger>
                      <TabsTrigger value="schema">قاعدة البيانات / Database</TabsTrigger>
                      <TabsTrigger value="backend">الخلفية / Backend</TabsTrigger>
                      <TabsTrigger value="frontend">الواجهة / Frontend</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-4">
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {sessionDetails.artifacts.map((artifact) => (
                            <div 
                              key={artifact.id}
                              className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                            >
                              <Code className="w-4 h-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{artifact.fileName}</p>
                                <p className="text-xs text-muted-foreground truncate">{artifact.filePath}</p>
                              </div>
                              <Badge variant="outline">{artifact.fileType}</Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="schema" className="mt-4">
                      <ScrollArea className="h-[300px]">
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                          {sessionDetails.session.generatedSchema || "لم يتم إنشاء قاعدة البيانات بعد / Schema not generated yet"}
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="backend" className="mt-4">
                      <ScrollArea className="h-[300px]">
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                          {sessionDetails.session.generatedBackend || "لم يتم إنشاء الخلفية بعد / Backend not generated yet"}
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="frontend" className="mt-4">
                      <ScrollArea className="h-[300px]">
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                          {sessionDetails.session.generatedFrontend || "لم يتم إنشاء الواجهة بعد / Frontend not generated yet"}
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  الجلسات السابقة / Previous Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    لا توجد جلسات سابقة / No previous sessions
                  </p>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 rounded-lg border cursor-pointer hover-elevate ${
                            activeSessionId === session.id ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => setActiveSessionId(session.id)}
                          data-testid={`card-session-${session.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm truncate flex-1">
                              {session.appName || "تطبيق جديد"}
                            </p>
                            <Badge className={statusColors[session.status || "pending"]} variant="secondary">
                              {session.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {session.prompt.substring(0, 100)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={session.progress || 0} className="flex-1 h-1" />
                            <span className="text-xs text-muted-foreground">{session.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4" />
                  أمثلة للطلبات / Example Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "منصة موارد بشرية مع إدارة الموظفين والإجازات",
                  "متجر إلكتروني مع سلة التسوق والدفع",
                  "نظام إدارة مشاريع مع المهام والفرق",
                  "مدونة مع نظام تعليقات وتصنيفات",
                  "لوحة تحكم إدارية مع تقارير ورسوم بيانية",
                ].map((example, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setPrompt(example)}
                    data-testid={`button-example-${i}`}
                  >
                    <ChevronRight className="w-4 h-4 shrink-0" />
                    <span className="truncate text-xs">{example}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
