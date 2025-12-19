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
  Building2,
  GraduationCap,
  ShoppingCart,
  Users,
  BarChart3,
  FileText,
  Layers,
  Shield,
  Zap
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

const statusConfig: Record<string, { bg: string; text: string; label: string; labelAr: string }> = {
  pending: { bg: "bg-muted", text: "text-muted-foreground", label: "Pending", labelAr: "قيد الانتظار" },
  running: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Running", labelAr: "قيد التنفيذ" },
  completed: { bg: "bg-green-500/10", text: "text-green-500", label: "Completed", labelAr: "مكتمل" },
  failed: { bg: "bg-red-500/10", text: "text-red-500", label: "Failed", labelAr: "فشل" },
  planning: { bg: "bg-yellow-500/10", text: "text-yellow-500", label: "Planning", labelAr: "تخطيط" },
  building: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Building", labelAr: "بناء" },
  planned: { bg: "bg-purple-500/10", text: "text-purple-500", label: "Planned", labelAr: "مُخطط" },
};

const blueprintExamples = [
  {
    id: "hr",
    icon: Users,
    titleAr: "منصة موارد بشرية",
    titleEn: "HR Management",
    descAr: "إدارة الموظفين والإجازات والحضور",
    descEn: "Employees, leaves, attendance",
    prompt: "منصة موارد بشرية مع إدارة الموظفين، طلبات الإجازات، تتبع الحضور، وتقارير الأداء مع لوحة تحكم للمديرين",
    complexity: "enterprise",
  },
  {
    id: "ecommerce",
    icon: ShoppingCart,
    titleAr: "متجر إلكتروني",
    titleEn: "E-Commerce",
    descAr: "منتجات، سلة، دفع، شحن",
    descEn: "Products, cart, payment, shipping",
    prompt: "متجر إلكتروني مع سلة التسوق والدفع وإدارة المنتجات والمخزون",
    complexity: "advanced",
  },
  {
    id: "project",
    icon: Layers,
    titleAr: "إدارة مشاريع",
    titleEn: "Project Management",
    descAr: "مهام، فرق، تتبع التقدم",
    descEn: "Tasks, teams, progress tracking",
    prompt: "نظام إدارة مشاريع مع المهام والفرق وتتبع التقدم",
    complexity: "standard",
  },
  {
    id: "cms",
    icon: FileText,
    titleAr: "نظام إدارة محتوى",
    titleEn: "CMS / Blog",
    descAr: "مقالات، تصنيفات، تعليقات",
    descEn: "Articles, categories, comments",
    prompt: "مدونة مع نظام تعليقات وتصنيفات وإدارة المحتوى",
    complexity: "standard",
  },
  {
    id: "analytics",
    icon: BarChart3,
    titleAr: "لوحة تحليلات",
    titleEn: "Analytics Dashboard",
    descAr: "تقارير، رسوم بيانية، إحصائيات",
    descEn: "Reports, charts, statistics",
    prompt: "لوحة تحكم إدارية مع تقارير ورسوم بيانية وإحصائيات تفاعلية",
    complexity: "advanced",
  },
];

const complexityColors: Record<string, string> = {
  standard: "bg-green-500/10 text-green-600",
  advanced: "bg-blue-500/10 text-blue-600",
  enterprise: "bg-purple-500/10 text-purple-600",
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

  const runningSessions = sessions.filter(s => s.status === "running" || s.status === "building");
  const plannedSessions = sessions.filter(s => s.status === "planned" || s.status === "planning");
  const completedSessions = sessions.filter(s => s.status === "completed" || s.status === "failed");

  return (
    <div className="min-h-screen bg-background" data-testid="page-ai-app-builder">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">
                منشئ التطبيقات بالذكاء الاصطناعي
              </h1>
              <p className="text-sm text-muted-foreground">
                AI App Builder - Build complete applications with AI
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Bot className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">وصف التطبيق / Describe Your App</CardTitle>
                    <CardDescription className="text-sm">
                      صف المنصة التي تريد بناءها بالتفصيل
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      نوع المنصة
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      المستخدمين المستهدفين
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      الوحدات الأساسية
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      مستوى الأمان
                    </span>
                  </div>
                  <div className="relative">
                    <Textarea
                      placeholder="صف المنصة التي تريد بناءها...

مثال: أريد منصة موارد بشرية تتضمن إدارة الموظفين، طلبات الإجازات، تتبع الحضور، وتقارير الأداء مع لوحة تحكم للمديرين

Example: I want an HR platform with employee management, leave requests, attendance tracking, and performance reports with a dashboard for managers"
                      className="min-h-[160px] resize-none text-sm leading-relaxed"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      data-testid="input-app-description"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={prompt.length >= 10 ? "text-green-600" : ""}>
                      {prompt.length} حرف
                    </span>
                    <span className="text-border">|</span>
                    <span>10 حرف كحد أدنى</span>
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    disabled={planMutation.isPending || prompt.length < 10}
                    className="gap-2 px-6"
                    data-testid="button-create-plan"
                  >
                    {planMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري التخطيط...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>إنشاء خطة البناء / Create Build Plan</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {activeSessionId && sessionDetails && (
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {sessionDetails.session.appName || "تطبيق جديد"}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-1">
                          {sessionDetails.session.plan?.summary}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      className={`${statusConfig[sessionDetails.session.status || "pending"]?.bg} ${statusConfig[sessionDetails.session.status || "pending"]?.text}`}
                    >
                      {statusConfig[sessionDetails.session.status || "pending"]?.labelAr}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">التقدم / Progress</span>
                      <span className="font-medium">{sessionDetails.session.progress}%</span>
                    </div>
                    <Progress value={sessionDetails.session.progress || 0} className="h-2" />
                  </div>

                  {sessionDetails.session.plan?.features && sessionDetails.session.plan.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {sessionDetails.session.plan.features.map((feature, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      خطوات البناء / Build Steps
                    </h4>
                    <div className="space-y-2">
                      {sessionDetails.tasks.map((task, index) => {
                        const Icon = taskTypeIcons[task.taskType] || Code;
                        const isActive = task.status === "running";
                        return (
                          <div 
                            key={task.id}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              isActive ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center justify-center w-6 h-6">
                              {getStatusIcon(task.status)}
                            </div>
                            <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{task.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{task.titleAr}</p>
                            </div>
                            {task.status === "running" && (
                              <Progress value={task.progress || 0} className="w-24 h-1.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {sessionDetails.session.status === "planned" && (
                    <Button 
                      className="w-full gap-2"
                      onClick={handleExecute}
                      disabled={executeMutation.isPending}
                      data-testid="button-start-build"
                    >
                      {executeMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري البناء... / Building...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>بدء البناء / Start Building</span>
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {activeSessionId && sessionDetails?.artifacts && sessionDetails.artifacts.length > 0 && (
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileCode className="w-5 h-5 text-foreground" />
                    </div>
                    <CardTitle className="text-lg">الملفات المُنشأة / Generated Files</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="w-full justify-start gap-1 bg-muted/50 p-1">
                      <TabsTrigger value="all" className="text-xs">الكل / All</TabsTrigger>
                      <TabsTrigger value="schema" className="text-xs">قاعدة البيانات</TabsTrigger>
                      <TabsTrigger value="backend" className="text-xs">الخلفية</TabsTrigger>
                      <TabsTrigger value="frontend" className="text-xs">الواجهة</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-4">
                      <ScrollArea className="h-[280px]">
                        <div className="space-y-2">
                          {sessionDetails.artifacts.map((artifact) => (
                            <div 
                              key={artifact.id}
                              className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover-elevate cursor-pointer"
                            >
                              <Code className="w-4 h-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{artifact.fileName}</p>
                                <p className="text-xs text-muted-foreground truncate">{artifact.filePath}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">{artifact.fileType}</Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="schema" className="mt-4">
                      <ScrollArea className="h-[280px]">
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono">
                          {sessionDetails.session.generatedSchema || "لم يتم إنشاء قاعدة البيانات بعد / Schema not generated yet"}
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="backend" className="mt-4">
                      <ScrollArea className="h-[280px]">
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono">
                          {sessionDetails.session.generatedBackend || "لم يتم إنشاء الخلفية بعد / Backend not generated yet"}
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="frontend" className="mt-4">
                      <ScrollArea className="h-[280px]">
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono">
                          {sessionDetails.session.generatedFrontend || "لم يتم إنشاء الواجهة بعد / Frontend not generated yet"}
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Clock className="w-5 h-5 text-foreground" />
                  </div>
                  <CardTitle className="text-lg">الجلسات السابقة / Previous Sessions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-xl bg-muted mx-auto flex items-center justify-center mb-3">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      لا توجد جلسات سابقة / No previous sessions
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {runningSessions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            قيد التنفيذ / Running
                          </p>
                          {runningSessions.map((session) => (
                            <SessionCard 
                              key={session.id} 
                              session={session} 
                              isActive={activeSessionId === session.id}
                              onClick={() => setActiveSessionId(session.id)}
                            />
                          ))}
                        </div>
                      )}
                      {plannedSessions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            مُخطط / Planned
                          </p>
                          {plannedSessions.map((session) => (
                            <SessionCard 
                              key={session.id} 
                              session={session} 
                              isActive={activeSessionId === session.id}
                              onClick={() => setActiveSessionId(session.id)}
                            />
                          ))}
                        </div>
                      )}
                      {completedSessions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            مكتمل / Completed
                          </p>
                          {completedSessions.map((session) => (
                            <SessionCard 
                              key={session.id} 
                              session={session} 
                              isActive={activeSessionId === session.id}
                              onClick={() => setActiveSessionId(session.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-foreground" />
                  </div>
                  <CardTitle className="text-lg">أمثلة للطلبات / Example Prompts</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {blueprintExamples.map((example) => {
                  const Icon = example.icon;
                  return (
                    <div
                      key={example.id}
                      className="p-3 rounded-lg border border-border/60 cursor-pointer hover-elevate transition-colors"
                      onClick={() => setPrompt(example.prompt)}
                      data-testid={`button-example-${example.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-medium">{example.titleAr}</p>
                            <Badge 
                              variant="secondary" 
                              className={`text-[10px] ${complexityColors[example.complexity]}`}
                            >
                              {example.complexity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{example.descAr}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionCard({ 
  session, 
  isActive, 
  onClick 
}: { 
  session: AiBuildSession; 
  isActive: boolean; 
  onClick: () => void;
}) {
  const config = statusConfig[session.status || "pending"];
  
  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        isActive 
          ? "border-primary bg-primary/5" 
          : "border-border/60 hover-elevate"
      }`}
      onClick={onClick}
      data-testid={`card-session-${session.id}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="font-medium text-sm truncate flex-1">
          {session.appName || "تطبيق جديد"}
        </p>
        <Badge 
          variant="secondary" 
          className={`text-xs ${config.bg} ${config.text}`}
        >
          {config.labelAr}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {session.prompt.substring(0, 80)}...
      </p>
      <div className="flex items-center gap-3">
        <Progress value={session.progress || 0} className="flex-1 h-1.5" />
        <span className="text-xs font-medium text-muted-foreground min-w-[32px] text-left">
          {session.progress}%
        </span>
      </div>
    </div>
  );
}
