import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, AlertCircle, DollarSign, RefreshCw, CheckCircle2, Settings } from "lucide-react";
import type { DashboardTranslations } from "./dashboard-translations";

interface UsageAnalytics {
  totalRealCostUSD: number;
  totalBilledCostUSD: number;
  margin: number;
  top5Users: Array<{ userId: string; email: string; totalRealCost: number; totalBilledCost: number }>;
  losingUsers: Array<{ userId: string; email: string; loss: number }>;
  profitByService: Array<{ service: string; profit: number; totalBilled: number; totalCost: number }>;
}

interface UsageAnalyticsSectionProps {
  t: DashboardTranslations;
  language: 'ar' | 'en';
}

export function UsageAnalyticsSection({ t, language }: UsageAnalyticsSectionProps) {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showLimitsDialog, setShowLimitsDialog] = useState(false);
  const [limitsForm, setLimitsForm] = useState({ monthlyLimitUSD: 100, autoSuspendOnLimit: false });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<UsageAnalytics>({
    queryKey: ['/api/owner/usage-analytics'],
  });

  const setLimitsMutation = useMutation({
    mutationFn: async (data: { userId: string; monthlyLimitUSD: number; autoSuspendOnLimit: boolean }) => {
      return apiRequest('POST', `/api/owner/users/${data.userId}/usage-limits`, {
        monthlyLimitUSD: data.monthlyLimitUSD,
        autoSuspendOnLimit: data.autoSuspendOnLimit,
      });
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تم تحديد الحدود' : 'Limits set successfully' });
      setShowLimitsDialog(false);
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-today-cost">
          <CardHeader className="pb-2">
            <CardDescription>{t.usageAnalytics.todayCost}</CardDescription>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              {analyticsLoading ? '...' : formatCurrency(analytics?.totalRealCostUSD || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-today-billed">
          <CardHeader className="pb-2">
            <CardDescription>{t.usageAnalytics.todayBilled}</CardDescription>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              {analyticsLoading ? '...' : formatCurrency(analytics?.totalBilledCostUSD || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-today-margin">
          <CardHeader className="pb-2">
            <CardDescription>{t.usageAnalytics.todayMargin}</CardDescription>
            <CardTitle className="text-2xl">
              {analyticsLoading ? '...' : `${((analytics?.margin || 0) * 100).toFixed(1)}%`}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t.usageAnalytics.top5Users}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-center py-8"><RefreshCw className="w-8 h-8 mx-auto animate-spin" /></div>
            ) : (analytics?.top5Users?.length || 0) > 0 ? (
              <div className="space-y-3">
                {analytics?.top5Users?.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">{index + 1}</div>
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(user.totalBilledCost)}</p>
                        <p className="text-xs text-muted-foreground">{t.usageAnalytics.realCost}: {formatCurrency(user.totalRealCost)}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => { setSelectedUserId(user.userId); setShowLimitsDialog(true); }}>
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t.usageAnalytics.noData}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              {t.usageAnalytics.losingUsers}
            </CardTitle>
            <CardDescription>{t.usageAnalytics.losingUsersDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-center py-8"><RefreshCw className="w-8 h-8 mx-auto animate-spin" /></div>
            ) : (analytics?.losingUsers?.length || 0) > 0 ? (
              <div className="space-y-3">
                {analytics?.losingUsers?.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                    <span className="text-sm">{user.email}</span>
                    <Badge variant="destructive">{t.usageAnalytics.loss}: {formatCurrency(user.loss)}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-green-600">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                <p>{language === 'ar' ? 'لا يوجد مستخدمون خاسرون' : 'No losing users'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t.usageAnalytics.profitByService}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="text-center py-8"><RefreshCw className="w-8 h-8 mx-auto animate-spin" /></div>
          ) : (analytics?.profitByService?.length || 0) > 0 ? (
            <div className="space-y-3">
              {analytics?.profitByService?.map((service) => (
                <div key={service.service} className="flex items-center justify-between p-3 rounded-lg border">
                  <Badge variant="outline">{service.service}</Badge>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t.usageAnalytics.billedCost}</p>
                      <p className="text-sm">{formatCurrency(service.totalBilled)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t.usageAnalytics.margin}</p>
                      <p className="text-sm font-medium text-green-600">{formatCurrency(service.profit)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">{t.usageAnalytics.noData}</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showLimitsDialog} onOpenChange={setShowLimitsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.usageAnalytics.setLimits}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t.usageAnalytics.monthlyLimit}</Label>
              <Input type="number" value={limitsForm.monthlyLimitUSD} onChange={(e) => setLimitsForm({ ...limitsForm, monthlyLimitUSD: Number(e.target.value) })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t.usageAnalytics.autoSuspend}</Label>
              <Switch checked={limitsForm.autoSuspendOnLimit} onCheckedChange={(checked) => setLimitsForm({ ...limitsForm, autoSuspendOnLimit: checked })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLimitsDialog(false)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={() => selectedUserId && setLimitsMutation.mutate({ userId: selectedUserId, ...limitsForm })} disabled={setLimitsMutation.isPending}>
              {language === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
