import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Crown, 
  Bot, 
  Shield, 
  Zap,
  RefreshCw,
  AlertTriangle,
  User as UserIcon,
  CheckCircle2,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import type { DashboardTranslations } from "./dashboard-translations";

interface GovernanceStatus {
  directive: string;
  valid: boolean;
  checks: { name: string; nameAr: string; passed: boolean; message: string }[];
}

interface PendingApproval {
  id: string;
  requestId: string;
  action: string;
  layerId: string;
  taskType: string;
  impactLevel: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface GovernanceSectionProps {
  t: DashboardTranslations;
  language: 'ar' | 'en';
}

export function GovernanceSection({ t, language }: GovernanceSectionProps) {
  const { toast } = useToast();
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [rollbackReason, setRollbackReason] = useState("");

  const { data: governanceStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<GovernanceStatus>({
    queryKey: ['/api/governance/status'],
  });

  const { data: pendingApprovals = [], refetch: refetchApprovals } = useQuery<PendingApproval[]>({
    queryKey: ['/api/governance/approvals'],
  });

  const activateKillSwitchMutation = useMutation({
    mutationFn: async (data: { scope: string; reason: string; reasonAr: string }) => {
      return apiRequest('POST', '/api/governance/kill-switch/activate', data);
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تم تفعيل زر الطوارئ' : 'Kill switch activated' });
      refetchStatus();
      queryClient.invalidateQueries({ queryKey: ['/api/ai-kill-switches'] });
    },
  });

  const processApprovalMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: 'approve' | 'reject' }) => {
      return apiRequest('POST', `/api/governance/approvals/${id}/decide`, { decision });
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تمت معالجة الموافقة' : 'Approval processed' });
      refetchApprovals();
    },
  });

  const triggerRollbackMutation = useMutation({
    mutationFn: async (data: { reason: string; reasonAr: string }) => {
      return apiRequest('POST', '/api/governance/safe-rollback', data);
    },
    onSuccess: () => {
      toast({ 
        title: language === 'ar' ? 'تم تفعيل التراجع الآمن' : 'Safe rollback triggered',
        variant: 'destructive',
      });
      setShowRollbackDialog(false);
      refetchStatus();
    },
  });

  const hierarchyItems = [
    { key: 'owner', icon: Crown, color: 'text-yellow-500' },
    { key: 'governanceSystem', icon: Shield, color: 'text-blue-500' },
    { key: 'human', icon: UserIcon, color: 'text-green-500' },
    { key: 'ai', icon: Bot, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t.aiSovereignty.governance.title}
            </CardTitle>
            <CardDescription>{t.aiSovereignty.governance.subtitle}</CardDescription>
          </div>
          <Badge variant={governanceStatus?.valid ? 'default' : 'destructive'}>
            {governanceStatus?.directive || 'LOADING'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t.aiSovereignty.governance.hierarchy}</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {hierarchyItems.map((item, index) => (
                <div key={item.key} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {(t.aiSovereignty.governance as Record<string, unknown>)[item.key] as string}
                    </span>
                  </div>
                  {index < hierarchyItems.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t.aiSovereignty.governance.status}</h4>
            {statusLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 p-3 rounded-md ${governanceStatus?.valid ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                  {governanceStatus?.valid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  <span className="font-medium">
                    {governanceStatus?.valid ? t.aiSovereignty.governance.valid : t.aiSovereignty.governance.invalid}
                  </span>
                </div>
                <div className="grid gap-2">
                  {(governanceStatus?.checks || []).map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="text-sm">{language === 'ar' ? check.nameAr : check.name}</span>
                      <Badge variant={check.passed ? 'default' : 'destructive'} className="text-xs">
                        {check.passed ? t.aiSovereignty.governance.passed : t.aiSovereignty.governance.failed}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t.aiSovereignty.killSwitch}</h4>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => activateKillSwitchMutation.mutate({ 
                  scope: 'global', reason: 'Manual activation', reasonAr: 'تفعيل يدوي' 
                })}
                disabled={activateKillSwitchMutation.isPending}
                data-testid="button-kill-switch-global"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {t.aiSovereignty.globalStop}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => activateKillSwitchMutation.mutate({ 
                  scope: 'external_only', reason: 'External providers stopped', reasonAr: 'إيقاف المزودين الخارجيين' 
                })}
                disabled={activateKillSwitchMutation.isPending}
                data-testid="button-kill-switch-external"
              >
                <Zap className="w-4 h-4 mr-2" />
                {t.aiSovereignty.externalStop}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t.aiSovereignty.governance.pendingApprovals}</h4>
            {pendingApprovals.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                {t.aiSovereignty.governance.noApprovals}
              </div>
            ) : (
              <div className="space-y-2">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <span className="font-medium">{approval.action}</span>
                      <span className="text-sm text-muted-foreground ml-2">({approval.impactLevel})</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => processApprovalMutation.mutate({ id: approval.id, decision: 'approve' })}>
                        {t.aiSovereignty.governance.approve}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => processApprovalMutation.mutate({ id: approval.id, decision: 'reject' })}>
                        {t.aiSovereignty.governance.reject}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t.aiSovereignty.governance.safeRollback}</h4>
            <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" data-testid="button-safe-rollback">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t.aiSovereignty.governance.triggerRollback}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.aiSovereignty.governance.triggerRollback}</DialogTitle>
                  <DialogDescription>{t.aiSovereignty.governance.rollbackWarning}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label>{language === 'ar' ? 'سبب التراجع' : 'Rollback Reason'}</Label>
                  <Input value={rollbackReason} onChange={(e) => setRollbackReason(e.target.value)} data-testid="input-rollback-reason" />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRollbackDialog(false)}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => triggerRollbackMutation.mutate({ reason: rollbackReason || 'Manual rollback', reasonAr: rollbackReason || 'تراجع يدوي' })}
                    disabled={triggerRollbackMutation.isPending}
                    data-testid="button-confirm-rollback"
                  >
                    {triggerRollbackMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : t.aiSovereignty.governance.triggerRollback}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
