import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Link2, 
  Shield, 
  Key, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  Settings,
  Eye,
  Lock,
  Unlock,
  FileText,
  Activity,
  Crown,
  Fingerprint,
  ShieldCheck,
  ShieldOff,
  Zap
} from "lucide-react";
import { SiReplit, SiGithub } from "react-icons/si";
import type { ExternalIntegrationSession, ExternalIntegrationLog } from "@shared/schema";

const translations = {
  ar: {
    title: "بوابة التكامل الخارجي",
    subtitle: "إدارة وصول الشركاء التقنيين للدعم والتطوير",
    tabs: {
      sessions: "جلسات التكامل",
      logs: "سجل العمليات",
      settings: "الإعدادات"
    },
    sessions: {
      title: "جلسات التكامل النشطة",
      create: "إنشاء جلسة جديدة",
      activate: "تفعيل",
      deactivate: "إلغاء التفعيل",
      active: "نشطة",
      inactive: "غير نشطة",
      pending: "في الانتظار",
      expired: "منتهية",
      revoked: "ملغاة"
    },
    partners: {
      replit: "Replit",
      github: "GitHub Copilot",
      custom: "شريك مخصص"
    },
    purposes: {
      development_support: "دعم التطوير",
      diagnostic: "تشخيص المشاكل",
      emergency: "طوارئ",
      testing: "اختبار"
    },
    permissions: {
      read: "قراءة",
      write: "كتابة",
      execute: "تنفيذ"
    },
    security: {
      mfaRequired: "يتطلب مصادقة ثنائية",
      mfaVerified: "تم التحقق من MFA",
      signature: "التوقيع الرقمي",
      sandboxOnly: "البيئة التجريبية فقط"
    },
    empty: "لا توجد جلسات",
    loading: "جاري التحميل...",
    warningTitle: "تحذير أمني",
    warningDesc: "تفعيل جلسة التكامل يمنح الشريك صلاحيات محدودة. تأكد من مراجعة الصلاحيات قبل التفعيل."
  },
  en: {
    title: "External Integration Gateway",
    subtitle: "Manage technical partner access for support and development",
    tabs: {
      sessions: "Integration Sessions",
      logs: "Activity Logs",
      settings: "Settings"
    },
    sessions: {
      title: "Active Integration Sessions",
      create: "Create New Session",
      activate: "Activate",
      deactivate: "Deactivate",
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      expired: "Expired",
      revoked: "Revoked"
    },
    partners: {
      replit: "Replit",
      github: "GitHub Copilot",
      custom: "Custom Partner"
    },
    purposes: {
      development_support: "Development Support",
      diagnostic: "Diagnostics",
      emergency: "Emergency",
      testing: "Testing"
    },
    permissions: {
      read: "Read",
      write: "Write",
      execute: "Execute"
    },
    security: {
      mfaRequired: "MFA Required",
      mfaVerified: "MFA Verified",
      signature: "Digital Signature",
      sandboxOnly: "Sandbox Only"
    },
    empty: "No sessions",
    loading: "Loading...",
    warningTitle: "Security Warning",
    warningDesc: "Activating an integration session grants the partner limited access. Review permissions before activation."
  }
};

function getPartnerIcon(name: string) {
  switch (name?.toLowerCase()) {
    case 'replit': return <SiReplit className="w-6 h-6" />;
    case 'github_copilot': return <SiGithub className="w-6 h-6" />;
    default: return <Link2 className="w-6 h-6" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-600 text-white';
    case 'inactive': return 'bg-gray-500 text-white';
    case 'pending_activation': return 'bg-yellow-500 text-black';
    case 'expired': return 'bg-orange-500 text-white';
    case 'revoked': return 'bg-red-500 text-white';
    default: return 'bg-gray-400 text-white';
  }
}

function getPurposeColor(purpose: string) {
  switch (purpose) {
    case 'emergency': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'diagnostic': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'development_support': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'testing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function OwnerIntegrations() {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.ar;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sessions");
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ExternalIntegrationSession | null>(null);
  const [activationReason, setActivationReason] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [newSessionForm, setNewSessionForm] = useState({
    partnerName: "replit",
    partnerDisplayName: "Replit",
    purpose: "development_support",
    purposeDescription: "",
    purposeDescriptionAr: "",
    permissions: [{ type: "read", scope: "code", resources: ["*"] }],
    restrictions: { noAccessTo: ["secrets", "production_db"], maxDuration: 60, requireApproval: true, sandboxOnly: true },
    mfaRequired: true,
    autoCloseAfterTask: true
  });

  const { data: sessionsData, isLoading: loadingSessions, refetch: refetchSessions } = useQuery<{ sessions: ExternalIntegrationSession[] }>({
    queryKey: ['/api/owner/integrations/sessions']
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/owner/integrations/sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/integrations/sessions'] });
      setShowCreateSession(false);
      toast({ title: language === 'ar' ? 'تم إنشاء الجلسة' : 'Session created' });
    }
  });

  const activateSessionMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      apiRequest('POST', `/api/owner/integrations/sessions/${id}/activate`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/integrations/sessions'] });
      setShowActivateDialog(false);
      setSelectedSession(null);
      setActivationReason("");
      toast({ title: language === 'ar' ? 'تم تفعيل الجلسة' : 'Session activated' });
    }
  });

  const deactivateSessionMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      apiRequest('POST', `/api/owner/integrations/sessions/${id}/deactivate`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/integrations/sessions'] });
      toast({ title: language === 'ar' ? 'تم إلغاء تفعيل الجلسة' : 'Session deactivated' });
    }
  });

  const sessions = sessionsData?.sessions || [];
  const activeSessions = sessions.filter(s => s.status === 'active').length;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
            <Link2 className="w-8 h-8 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={async () => { 
            setIsRefreshing(true);
            await refetchSessions();
            setTimeout(() => setIsRefreshing(false), 1000);
          }} 
          data-testid="button-refresh"
          className={isRefreshing ? 'relative overflow-visible' : ''}
        >
          <RefreshCw className={`w-4 h-4 mr-2 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          {language === 'ar' ? 'تحديث' : 'Refresh'}
          {isRefreshing && (
            <span className="absolute inset-0 rounded-md animate-ping bg-primary/30 pointer-events-none" />
          )}
        </Button>
      </div>

      <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">{t.warningTitle}</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{t.warningDesc}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي الجلسات' : 'Total Sessions'}</p>
                <p className="text-2xl font-bold" data-testid="text-stat-total">{sessions.length}</p>
              </div>
              <Link2 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'جلسات نشطة' : 'Active Sessions'}</p>
                <p className="text-2xl font-bold text-green-600" data-testid="text-stat-active">{activeSessions}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'بانتظار التفعيل' : 'Pending'}</p>
                <p className="text-2xl font-bold text-yellow-600" data-testid="text-stat-pending">
                  {sessions.filter(s => s.status === 'pending_activation' || s.status === 'inactive').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'منتهية/ملغاة' : 'Expired/Revoked'}</p>
                <p className="text-2xl font-bold text-red-600" data-testid="text-stat-expired">
                  {sessions.filter(s => s.status === 'expired' || s.status === 'revoked').length}
                </p>
              </div>
              <ShieldOff className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="sessions" className="gap-2" data-testid="tab-sessions">
            <Link2 className="w-4 h-4" />
            {t.tabs.sessions}
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2" data-testid="tab-logs">
            <FileText className="w-4 h-4" />
            {t.tabs.logs}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="text-lg font-medium">{t.sessions.title}</h3>
            <Dialog open={showCreateSession} onOpenChange={setShowCreateSession}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-session">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.sessions.create}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t.sessions.create}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{language === 'ar' ? 'الشريك' : 'Partner'}</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {['replit', 'github_copilot', 'custom'].map((partner) => (
                        <Button
                          key={partner}
                          variant={newSessionForm.partnerName === partner ? "default" : "outline"}
                          className="flex flex-col items-center gap-2 h-auto py-4"
                          onClick={() => setNewSessionForm({
                            ...newSessionForm, 
                            partnerName: partner,
                            partnerDisplayName: partner === 'replit' ? 'Replit' : partner === 'github_copilot' ? 'GitHub Copilot' : 'Custom'
                          })}
                        >
                          {getPartnerIcon(partner)}
                          <span className="text-xs">{t.partners[partner as keyof typeof t.partners]}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'الغرض' : 'Purpose'}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {['development_support', 'diagnostic', 'emergency', 'testing'].map((purpose) => (
                        <Button
                          key={purpose}
                          variant={newSessionForm.purpose === purpose ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewSessionForm({...newSessionForm, purpose})}
                        >
                          {t.purposes[purpose as keyof typeof t.purposes]}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'وصف الغرض' : 'Purpose Description'}</Label>
                    <Textarea 
                      value={newSessionForm.purposeDescription}
                      onChange={(e) => setNewSessionForm({...newSessionForm, purposeDescription: e.target.value})}
                      placeholder={language === 'ar' ? 'صف سبب الحاجة للتكامل...' : 'Describe why integration is needed...'}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4" />
                      <span className="text-sm">{t.security.mfaRequired}</span>
                    </div>
                    <Switch 
                      checked={newSessionForm.mfaRequired}
                      onCheckedChange={(v) => setNewSessionForm({...newSessionForm, mfaRequired: v})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">{t.security.sandboxOnly}</span>
                    </div>
                    <Switch 
                      checked={newSessionForm.restrictions.sandboxOnly}
                      onCheckedChange={(v) => setNewSessionForm({
                        ...newSessionForm, 
                        restrictions: {...newSessionForm.restrictions, sandboxOnly: v}
                      })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => createSessionMutation.mutate(newSessionForm)}
                    disabled={createSessionMutation.isPending || !newSessionForm.purposeDescription}
                    data-testid="button-confirm-create-session"
                  >
                    {t.sessions.create}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="h-[500px]">
            {loadingSessions ? (
              <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t.empty}</div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Card key={session.id} data-testid={`card-session-${session.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {getPartnerIcon(session.partnerName)}
                          <div>
                            <h4 className="font-medium">{session.partnerDisplayName}</h4>
                            <p className="text-sm text-muted-foreground">{session.partnerName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(session.status)}>
                            {t.sessions[session.status as keyof typeof t.sessions] || session.status}
                          </Badge>
                          <Badge className={getPurposeColor(session.purpose)}>
                            {t.purposes[session.purpose as keyof typeof t.purposes] || session.purpose}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {language === 'ar' ? session.purposeDescriptionAr || session.purposeDescription : session.purposeDescription}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">{t.security.mfaRequired}</p>
                          <p className="font-medium flex items-center gap-1">
                            {session.mfaRequired ? (
                              <><CheckCircle className="w-4 h-4 text-green-500" /> {language === 'ar' ? 'نعم' : 'Yes'}</>
                            ) : (
                              <><XCircle className="w-4 h-4 text-red-500" /> {language === 'ar' ? 'لا' : 'No'}</>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t.security.sandboxOnly}</p>
                          <p className="font-medium flex items-center gap-1">
                            {session.restrictions?.sandboxOnly ? (
                              <><Shield className="w-4 h-4 text-green-500" /> {language === 'ar' ? 'نعم' : 'Yes'}</>
                            ) : (
                              <><AlertTriangle className="w-4 h-4 text-yellow-500" /> {language === 'ar' ? 'لا' : 'No'}</>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{language === 'ar' ? 'الصلاحيات' : 'Permissions'}</p>
                          <div className="flex gap-1 flex-wrap">
                            {session.permissions?.map((p, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {t.permissions[p.type as keyof typeof t.permissions] || p.type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{language === 'ar' ? 'المدة القصوى' : 'Max Duration'}</p>
                          <p className="font-medium">{session.restrictions?.maxDuration || 60} {language === 'ar' ? 'دقيقة' : 'min'}</p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="text-sm text-muted-foreground">
                          {session.activatedAt ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {language === 'ar' ? 'مفعّل منذ:' : 'Activated:'} {new Date(session.activatedAt).toLocaleString()}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {language === 'ar' ? 'أُنشئ:' : 'Created:'} {session.createdAt ? new Date(session.createdAt).toLocaleString() : 'N/A'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {session.status === 'inactive' || session.status === 'pending_activation' ? (
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedSession(session);
                                setShowActivateDialog(true);
                              }}
                              data-testid={`button-activate-${session.id}`}
                            >
                              <Unlock className="w-4 h-4 mr-1" />
                              {t.sessions.activate}
                            </Button>
                          ) : session.status === 'active' ? (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => deactivateSessionMutation.mutate({ id: session.id, reason: 'Manual deactivation' })}
                              disabled={deactivateSessionMutation.isPending}
                              data-testid={`button-deactivate-${session.id}`}
                            >
                              <Lock className="w-4 h-4 mr-1" />
                              {t.sessions.deactivate}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'سجل العمليات' : 'Activity Logs'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'جميع العمليات التي قام بها الشركاء التقنيون'
                  : 'All operations performed by technical partners'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {language === 'ar' ? 'اختر جلسة لعرض سجل العمليات' : 'Select a session to view activity logs'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              {language === 'ar' ? 'تأكيد تفعيل الجلسة' : 'Confirm Session Activation'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'سيتم منح الشريك الصلاحيات المحددة. هذا الإجراء مسجل في سجل التدقيق.'
                : 'The partner will be granted specified permissions. This action is logged in the audit trail.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'ar' ? 'سبب التفعيل' : 'Activation Reason'}</Label>
              <Textarea 
                value={activationReason}
                onChange={(e) => setActivationReason(e.target.value)}
                placeholder={language === 'ar' ? 'أدخل سبب التفعيل...' : 'Enter activation reason...'}
                data-testid="input-activation-reason"
              />
            </div>
            {selectedSession && (
              <div className="bg-muted/50 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getPartnerIcon(selectedSession.partnerName)}
                  <span className="font-medium">{selectedSession.partnerDisplayName}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedSession.purposeDescription}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivateDialog(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={() => selectedSession && activateSessionMutation.mutate({ id: selectedSession.id, reason: activationReason })}
              disabled={activateSessionMutation.isPending || !activationReason}
              data-testid="button-confirm-activate"
            >
              <Crown className="w-4 h-4 mr-2" />
              {t.sessions.activate}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
