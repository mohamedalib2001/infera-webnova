import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  RefreshCw,
  FileCode,
  Database,
  Settings,
  History,
  Activity,
  Eye,
  Undo2,
} from "lucide-react";

interface SpomOperation {
  id: string;
  code: string;
  name: string;
  nameAr: string;
  description: string | null;
  descriptionAr: string | null;
  category: string;
  riskLevel: string;
  requiresPassword: boolean;
  requiresOtp: boolean;
  sessionDurationMinutes: number;
  warningMessage: string | null;
  warningMessageAr: string | null;
  potentialRisks: string[];
  potentialRisksAr: string[];
}

interface SpomSession {
  id: string;
  status: string;
  operationType: string;
  expiresAt: string | null;
  activatedAt: string | null;
}

interface AuditLogEntry {
  id: string;
  operationType: string;
  operationCategory: string;
  actionTaken: string;
  targetResource: string | null;
  result: string;
  executedAt: string;
  canRollback: boolean;
  browserName: string | null;
  osName: string | null;
  ipAddress: string;
}

type AuthStep = "idle" | "warning" | "password" | "otp" | "active";

export default function SpomPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<AuthStep>("idle");
  const [selectedOperation, setSelectedOperation] = useState<SpomOperation | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const { data: operations, isLoading: loadingOps } = useQuery<SpomOperation[]>({
    queryKey: ["/api/owner/spom/operations"],
  });

  const { data: status } = useQuery<{
    isActive: boolean;
    activeSessions: SpomSession[];
    recentOperations: AuditLogEntry[];
  }>({
    queryKey: ["/api/owner/spom/status"],
    refetchInterval: 10000,
  });

  const { data: auditLogs, isLoading: loadingLogs } = useQuery<{
    logs: AuditLogEntry[];
    total: number;
  }>({
    queryKey: ["/api/owner/spom/audit-log"],
  });

  const startSessionMutation = useMutation({
    mutationFn: async (operationType: string) => {
      const res = await apiRequest("POST", "/api/owner/spom/session/start", {
        operationType,
        operationDescription: null,
        targetResource: null,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setSelectedOperation(data.operation);
      setCurrentStep("warning");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/owner/spom/session/verify-password", {
        sessionId,
        password,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setPassword("");
      if (data.requiresOtp) {
        sendOtpMutation.mutate();
      } else {
        setCurrentStep("active");
        queryClient.invalidateQueries({ queryKey: ["/api/owner/spom/status"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في كلمة المرور",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/owner/spom/session/send-otp", {
        sessionId,
        method: "email",
      });
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentStep("otp");
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      toast({
        title: "تم إرسال الرمز",
        description: `تم إرسال رمز التحقق إلى ${data.sentTo}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/owner/spom/session/verify-otp", {
        sessionId,
        otpCode,
      });
      return res.json();
    },
    onSuccess: () => {
      setOtpCode("");
      setDevOtp(null);
      setCurrentStep("active");
      queryClient.invalidateQueries({ queryKey: ["/api/owner/spom/status"] });
      toast({
        title: "تم التفعيل",
        description: "جلسة العمليات السيادية نشطة الآن",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "رمز غير صالح",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/owner/spom/session/end", {
        sessionId,
      });
      return res.json();
    },
    onSuccess: () => {
      resetState();
      queryClient.invalidateQueries({ queryKey: ["/api/owner/spom/status"] });
      toast({
        title: "انتهت الجلسة",
        description: "تم إنهاء جلسة العمليات السيادية",
      });
    },
  });

  const resetState = () => {
    setCurrentStep("idle");
    setSelectedOperation(null);
    setSessionId(null);
    setPassword("");
    setOtpCode("");
    setDevOtp(null);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/50";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "maintenance":
        return <Settings className="w-5 h-5" />;
      case "code":
        return <FileCode className="w-5 h-5" />;
      case "data":
        return <Database className="w-5 h-5" />;
      case "version":
        return <History className="w-5 h-5" />;
      case "security":
        return <Shield className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">وحدة العمليات السيادية</h1>
            <p className="text-muted-foreground">
              Sovereign Privileged Operations Module (SPOM)
            </p>
          </div>
        </div>

        {status?.isActive && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 gap-2">
            <CheckCircle className="w-4 h-4" />
            SOVEREIGN MODE ACTIVE
          </Badge>
        )}
      </div>

      <Tabs defaultValue="operations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="operations" data-testid="tab-operations">
            العمليات
          </TabsTrigger>
          <TabsTrigger value="sessions" data-testid="tab-sessions">
            الجلسات
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            السجل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          {loadingOps ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {operations?.map((op) => (
                <Card key={op.id} className="relative" data-testid={`card-operation-${op.code}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(op.category)}
                        <CardTitle className="text-lg">{op.nameAr}</CardTitle>
                      </div>
                      <Badge className={getRiskColor(op.riskLevel)}>
                        {op.riskLevel}
                      </Badge>
                    </div>
                    <CardDescription>{op.descriptionAr || op.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>مدة الجلسة: {op.sessionDurationMinutes} دقيقة</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {op.requiresPassword && (
                        <Badge variant="outline" className="gap-1">
                          <Lock className="w-3 h-3" />
                          كلمة مرور
                        </Badge>
                      )}
                      {op.requiresOtp && (
                        <Badge variant="outline" className="gap-1">
                          <Key className="w-3 h-3" />
                          OTP
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => startSessionMutation.mutate(op.code)}
                      disabled={startSessionMutation.isPending}
                      data-testid={`button-start-${op.code}`}
                    >
                      {startSessionMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "بدء العملية"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {status?.activeSessions?.length ? (
            <div className="space-y-4">
              {status.activeSessions.map((session) => (
                <Card key={session.id} className="border-green-500/50" data-testid={`session-${session.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        جلسة نشطة
                      </CardTitle>
                      <Badge className="bg-green-500/20 text-green-400">
                        {session.operationType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span>بدأت: {new Date(session.activatedAt || "").toLocaleString("ar")}</span>
                      <span>تنتهي: {new Date(session.expiresAt || "").toLocaleString("ar")}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSessionId(session.id);
                        endSessionMutation.mutate();
                      }}
                      data-testid={`button-end-session-${session.id}`}
                    >
                      إنهاء الجلسة
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد جلسات نشطة حالياً</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                السجل السيادي
              </CardTitle>
              <CardDescription>
                سجل غير قابل للتعديل لجميع العمليات الحساسة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {auditLogs?.logs?.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50 flex-wrap"
                        data-testid={`audit-log-${log.id}`}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          {log.result === "success" ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{log.actionTaken}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.targetResource || log.operationType}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.executedAt).toLocaleString("ar")}
                          </span>
                          {log.canRollback && (
                            <Button size="sm" variant="outline" className="gap-1">
                              <Undo2 className="w-3 h-3" />
                              تراجع
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {!auditLogs?.logs?.length && (
                      <p className="text-center text-muted-foreground py-8">
                        لا توجد عمليات مسجلة
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={currentStep !== "idle" && currentStep !== "active"} onOpenChange={() => resetState()}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          {currentStep === "warning" && selectedOperation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-orange-500">
                  <AlertTriangle className="w-6 h-6" />
                  تحذير أمني
                </DialogTitle>
                <DialogDescription>
                  أنت على وشك تنفيذ عملية حساسة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert className="border-orange-500/50 bg-orange-500/10">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <AlertTitle>نوع العملية: {selectedOperation.nameAr}</AlertTitle>
                  <AlertDescription>
                    {selectedOperation.warningMessageAr || selectedOperation.warningMessage}
                  </AlertDescription>
                </Alert>

                {selectedOperation.potentialRisksAr?.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-medium">المخاطر المحتملة:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {selectedOperation.potentialRisksAr.map((risk, i) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Alert>
                  <Eye className="w-4 h-4" />
                  <AlertDescription>
                    سيتم تسجيل هذه العملية في السجل السيادي غير القابل للتعديل
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={resetState}>
                  إلغاء
                </Button>
                <Button onClick={() => setCurrentStep("password")} data-testid="button-continue-to-password">
                  متابعة
                </Button>
              </DialogFooter>
            </>
          )}

          {currentStep === "password" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  التحقق من الهوية
                </DialogTitle>
                <DialogDescription>
                  أدخل كلمة المرور السيادية للمتابعة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    data-testid="input-password"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={resetState}>
                  إلغاء
                </Button>
                <Button
                  onClick={() => verifyPasswordMutation.mutate()}
                  disabled={!password || verifyPasswordMutation.isPending}
                  data-testid="button-verify-password"
                >
                  {verifyPasswordMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "تحقق"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {currentStep === "otp" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="w-6 h-6" />
                  التحقق الثنائي
                </DialogTitle>
                <DialogDescription>
                  أدخل رمز التحقق المرسل إلى بريدك الإلكتروني
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">رمز التحقق</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    data-testid="input-otp"
                  />
                </div>
                {devOtp && (
                  <Alert>
                    <AlertDescription>
                      [Dev Mode] رمز التحقق: <strong>{devOtp}</strong>
                    </AlertDescription>
                  </Alert>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sendOtpMutation.mutate()}
                  disabled={sendOtpMutation.isPending}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${sendOtpMutation.isPending ? "animate-spin" : ""}`} />
                  إعادة إرسال الرمز
                </Button>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={resetState}>
                  إلغاء
                </Button>
                <Button
                  onClick={() => verifyOtpMutation.mutate()}
                  disabled={otpCode.length !== 6 || verifyOtpMutation.isPending}
                  data-testid="button-verify-otp"
                >
                  {verifyOtpMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "تفعيل الجلسة"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={currentStep === "active"} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-6 h-6" />
              SOVEREIGN MODE ACTIVE
            </DialogTitle>
            <DialogDescription>
              جلسة العمليات السيادية نشطة الآن
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-lg py-2 px-4">
              <Shield className="w-5 h-5 ml-2" />
              وضع السيادة مفعّل
            </Badge>
            <p className="mt-4 text-sm text-muted-foreground">
              يمكنك الآن تنفيذ العمليات الحساسة. الجلسة ستنتهي تلقائياً بعد فترة عدم النشاط.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => endSessionMutation.mutate()}
              disabled={endSessionMutation.isPending}
              className="w-full"
              data-testid="button-end-active-session"
            >
              {endSessionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "إنهاء الجلسة"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
