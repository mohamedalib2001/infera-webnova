import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Shield,
  AlertTriangle,
  Activity,
  Cpu,
  Database,
  Globe,
  Lock,
  Unlock,
  Power,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Bot,
  Users,
  DollarSign,
  Server,
  Gauge,
  Bell,
  Settings,
  Terminal,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Play,
  Square,
  RotateCcw,
  Brain,
  Command,
} from "lucide-react";

export default function SovereignControlCenter() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [isVisible, setIsVisible] = useState(false);

  // Check if user is owner - redirect if not
  const isOwner = user?.role === "owner";

  // Keyboard shortcut to show/hide (Shift+Ctrl+Alt+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.ctrlKey && e.altKey && e.key === "S") {
        e.preventDefault();
        // Only show if user is owner
        if (isOwner) {
          setIsVisible(!isVisible);
        } else {
          toast({
            title: language === "ar" ? "غير مصرح" : "Unauthorized",
            description: language === "ar" ? "هذه اللوحة للمالك فقط" : "This panel is for owner only",
            variant: "destructive",
          });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, isOwner, language, toast]);

  const t = {
    ar: {
      title: "مركز التحكم السيادي",
      subtitle: "الحوكمة المطلقة للمنصة",
      hidden: "اضغط Shift+Ctrl+Alt+S للوصول",
      overview: "نظرة عامة",
      aiGovernor: "حاكم AI",
      platformArchitect: "مهندس المنصة",
      securityGuardian: "حارس الأمان",
      opsCommander: "قائد العمليات",
      revenueStrategist: "استراتيجي الإيرادات",
      emergencyControls: "التحكم الطارئ",
      systemHealth: "صحة النظام",
      activeThreats: "تهديدات نشطة",
      pendingCommands: "أوامر معلقة",
      platformStatus: "حالة المنصة",
      aiServices: "خدمات AI",
      paymentServices: "خدمات الدفع",
      authServices: "خدمات المصادقة",
      operational: "يعمل",
      limited: "محدود",
      down: "متوقف",
      killSwitch: "إيقاف طارئ شامل",
      suspendAI: "تعليق خدمات AI",
      lockPlatform: "قفل المنصة",
      enableMaintenance: "وضع الصيانة",
      activateEmergency: "تفعيل",
      deactivateEmergency: "إلغاء",
      healthScore: "مؤشر الصحة",
      riskLevel: "مستوى المخاطر",
      low: "منخفض",
      medium: "متوسط",
      high: "عالي",
      critical: "حرج",
      auditLogs: "سجلات التدقيق",
      recentActions: "الإجراءات الأخيرة",
      noActions: "لا توجد إجراءات",
      assistants: "المساعدين السياديين",
      active: "نشط",
      inactive: "غير نشط",
      autonomous: "مستقل",
      supervised: "مُراقب",
      approveCommand: "موافقة",
      rejectCommand: "رفض",
      executeCommand: "تنفيذ",
      rollbackCommand: "تراجع",
      commandPending: "في الانتظار",
      commandExecuted: "تم التنفيذ",
      commandFailed: "فشل",
    },
    en: {
      title: "Sovereign Control Center",
      subtitle: "Absolute Platform Governance",
      hidden: "Press Shift+Ctrl+Alt+S to access",
      overview: "Overview",
      aiGovernor: "AI Governor",
      platformArchitect: "Platform Architect",
      securityGuardian: "Security Guardian",
      opsCommander: "Ops Commander",
      revenueStrategist: "Revenue Strategist",
      emergencyControls: "Emergency Controls",
      systemHealth: "System Health",
      activeThreats: "Active Threats",
      pendingCommands: "Pending Commands",
      platformStatus: "Platform Status",
      aiServices: "AI Services",
      paymentServices: "Payment Services",
      authServices: "Auth Services",
      operational: "Operational",
      limited: "Limited",
      down: "Down",
      killSwitch: "Global Kill Switch",
      suspendAI: "Suspend AI Services",
      lockPlatform: "Lock Platform",
      enableMaintenance: "Maintenance Mode",
      activateEmergency: "Activate",
      deactivateEmergency: "Deactivate",
      healthScore: "Health Score",
      riskLevel: "Risk Level",
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
      auditLogs: "Audit Logs",
      recentActions: "Recent Actions",
      noActions: "No actions",
      assistants: "Sovereign Assistants",
      active: "Active",
      inactive: "Inactive",
      autonomous: "Autonomous",
      supervised: "Supervised",
      approveCommand: "Approve",
      rejectCommand: "Reject",
      executeCommand: "Execute",
      rollbackCommand: "Rollback",
      commandPending: "Pending",
      commandExecuted: "Executed",
      commandFailed: "Failed",
    },
  };

  const txt = t[language];

  // Simulated platform state
  const platformState = {
    healthScore: 92,
    healthStatus: "healthy" as const,
    riskLevel: "low" as const,
    activeThreats: 0,
    pendingAlerts: 2,
    aiServicesStatus: "operational" as const,
    paymentServicesStatus: "operational" as const,
    authServicesStatus: "operational" as const,
    activeSovereignAssistants: 5,
    pendingCommands: 3,
    executingCommands: 1,
  };

  // Sovereign assistants data
  const sovereignAssistants = [
    { id: "1", name: language === "ar" ? "حاكم AI" : "AI Governor", type: "ai_governor", isActive: true, isAutonomous: false, icon: Brain, color: "text-purple-500" },
    { id: "2", name: language === "ar" ? "مهندس المنصة" : "Platform Architect", type: "platform_architect", isActive: true, isAutonomous: false, icon: Server, color: "text-blue-500" },
    { id: "3", name: language === "ar" ? "قائد العمليات" : "Ops Commander", type: "operations_commander", isActive: true, isAutonomous: true, icon: Terminal, color: "text-green-500" },
    { id: "4", name: language === "ar" ? "حارس الأمان" : "Security Sentinel", type: "security_sentinel", isActive: true, isAutonomous: false, icon: Shield, color: "text-red-500" },
    { id: "5", name: language === "ar" ? "استراتيجي الإيرادات" : "Revenue Strategist", type: "revenue_strategist", isActive: true, isAutonomous: false, icon: DollarSign, color: "text-yellow-500" },
  ];

  // Emergency controls
  const [emergencyControls, setEmergencyControls] = useState({
    killSwitch: false,
    suspendAI: false,
    lockPlatform: false,
    maintenanceMode: false,
  });

  const toggleEmergencyControl = (control: keyof typeof emergencyControls) => {
    setEmergencyControls(prev => ({
      ...prev,
      [control]: !prev[control],
    }));
    toast({
      title: emergencyControls[control] 
        ? (language === "ar" ? "تم إلغاء التفعيل" : "Deactivated")
        : (language === "ar" ? "تم التفعيل" : "Activated"),
      variant: emergencyControls[control] ? "default" : "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-green-500";
      case "limited": return "text-yellow-500";
      case "down": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircle className="w-4 h-4" />;
      case "limited": return <AlertCircle className="w-4 h-4" />;
      case "down": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "high": return "bg-orange-500";
      case "critical": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  // Show access denied for non-owners
  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
        <Card className="max-w-md text-center p-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-red-500/10">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-red-500">
            {language === "ar" ? "الوصول مرفوض" : "Access Denied"}
          </h2>
          <p className="text-muted-foreground">
            {language === "ar" 
              ? "هذه اللوحة مقيدة للمالك فقط"
              : "This panel is restricted to owner only"}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setLocation("/")}
          >
            {language === "ar" ? "العودة للرئيسية" : "Back to Home"}
          </Button>
        </Card>
      </div>
    );
  }

  if (!isVisible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
        <Card className="max-w-md text-center p-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-muted">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">{txt.title}</h2>
          <p className="text-muted-foreground">{txt.hidden}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
          >
            <Globe className="w-4 h-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-600 to-purple-600">
            <Command className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{txt.title}</h1>
            <p className="text-sm text-muted-foreground">{txt.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="gap-1">
            <Shield className="w-3 h-3" />
            SOVEREIGN ACCESS
          </Badge>
          <Button variant="ghost" size="icon" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}>
            <Globe className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)}>
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">{txt.healthScore}</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformState.healthScore}%</div>
            <Progress value={platformState.healthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">{txt.riskLevel}</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${getRiskColor(platformState.riskLevel)}`} />
              <span className="text-lg font-semibold capitalize">
                {txt[platformState.riskLevel as keyof typeof txt]}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">{txt.activeThreats}</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformState.activeThreats}</div>
            <p className="text-xs text-muted-foreground">{platformState.pendingAlerts} alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">{txt.pendingCommands}</CardTitle>
            <Command className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformState.pendingCommands}</div>
            <p className="text-xs text-muted-foreground">{platformState.executingCommands} executing</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Platform Status & Emergency Controls */}
        <div className="space-y-6">
          {/* Platform Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                {txt.platformStatus}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">{txt.aiServices}</span>
                <div className={`flex items-center gap-1 ${getStatusColor(platformState.aiServicesStatus)}`}>
                  {getStatusIcon(platformState.aiServicesStatus)}
                  <span className="text-sm">{txt[platformState.aiServicesStatus as keyof typeof txt]}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{txt.paymentServices}</span>
                <div className={`flex items-center gap-1 ${getStatusColor(platformState.paymentServicesStatus)}`}>
                  {getStatusIcon(platformState.paymentServicesStatus)}
                  <span className="text-sm">{txt[platformState.paymentServicesStatus as keyof typeof txt]}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{txt.authServices}</span>
                <div className={`flex items-center gap-1 ${getStatusColor(platformState.authServicesStatus)}`}>
                  {getStatusIcon(platformState.authServicesStatus)}
                  <span className="text-sm">{txt[platformState.authServicesStatus as keyof typeof txt]}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Controls */}
          <Card className="border-red-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                {txt.emergencyControls}
              </CardTitle>
              <CardDescription>
                {language === "ar" ? "تحكم طارئ بسلطة مطلقة" : "Emergency controls with absolute authority"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2">
                  <Power className="w-5 h-5 text-red-500" />
                  <span className="font-medium">{txt.killSwitch}</span>
                </div>
                <Switch
                  checked={emergencyControls.killSwitch}
                  onCheckedChange={() => toggleEmergencyControl("killSwitch")}
                  data-testid="switch-kill-switch"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">{txt.suspendAI}</span>
                </div>
                <Switch
                  checked={emergencyControls.suspendAI}
                  onCheckedChange={() => toggleEmergencyControl("suspendAI")}
                  data-testid="switch-suspend-ai"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">{txt.lockPlatform}</span>
                </div>
                <Switch
                  checked={emergencyControls.lockPlatform}
                  onCheckedChange={() => toggleEmergencyControl("lockPlatform")}
                  data-testid="switch-lock-platform"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">{txt.enableMaintenance}</span>
                </div>
                <Switch
                  checked={emergencyControls.maintenanceMode}
                  onCheckedChange={() => toggleEmergencyControl("maintenanceMode")}
                  data-testid="switch-maintenance"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Sovereign Assistants */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                {txt.assistants}
              </CardTitle>
              <CardDescription>
                {language === "ar" 
                  ? "وكلاء AI السياديين الذين ينفذون نوايا المالك"
                  : "Sovereign AI agents that execute owner's intent"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sovereignAssistants.map((assistant) => (
                  <Card key={assistant.id} className="relative overflow-visible">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${assistant.color}`}>
                          <assistant.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">{assistant.name}</CardTitle>
                          <div className="flex gap-1 mt-1">
                            <Badge variant={assistant.isActive ? "default" : "secondary"} className="text-xs">
                              {assistant.isActive ? txt.active : txt.inactive}
                            </Badge>
                            {assistant.isAutonomous && (
                              <Badge variant="outline" className="text-xs">
                                {txt.autonomous}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {language === "ar" ? "الحالة" : "Status"}
                        </span>
                        <Switch checked={assistant.isActive} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Recent Commands */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Command className="w-4 h-4" />
                  {txt.recentActions}
                </h3>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {[
                      { time: "2 min ago", action: language === "ar" ? "تحليل أمني للمنصة" : "Platform security analysis", status: "completed", assistant: "Security Sentinel" },
                      { time: "5 min ago", action: language === "ar" ? "تحسين تكلفة AI" : "AI cost optimization", status: "pending", assistant: "AI Governor" },
                      { time: "15 min ago", action: language === "ar" ? "مراجعة الإيرادات" : "Revenue review", status: "completed", assistant: "Revenue Strategist" },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Badge variant={log.status === "completed" ? "default" : "secondary"} className="text-xs">
                            {log.status === "completed" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          </Badge>
                          <div>
                            <p className="text-sm">{log.action}</p>
                            <p className="text-xs text-muted-foreground">{log.assistant}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
