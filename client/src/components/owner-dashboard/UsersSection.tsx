import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import type { User } from "@shared/schema";
import type { DashboardTranslations } from "./dashboard-translations";
import type { DashboardStats } from "@/hooks/owner-dashboard";

interface UsersSectionProps {
  t: DashboardTranslations;
  language: 'ar' | 'en';
  users: User[];
  stats: DashboardStats;
  isLoading: boolean;
  onSuspend: (id: number, reason: string) => void;
  onBan: (id: number, reason: string) => void;
  onReactivate: (id: number) => void;
  suspendPending: boolean;
  banPending: boolean;
  reactivatePending: boolean;
}

export function UsersSection({
  t,
  language,
  users,
  stats,
  isLoading,
  onSuspend,
  onBan,
  onReactivate,
  suspendPending,
  banPending,
  reactivatePending,
}: UsersSectionProps) {
  const [actionDialog, setActionDialog] = useState<{ type: 'suspend' | 'ban' | 'reactivate'; user: User } | null>(null);
  const [reason, setReason] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500/10 text-green-600">{t.users.statusActive}</Badge>;
      case 'suspended': return <Badge className="bg-yellow-500/10 text-yellow-600">{t.users.statusSuspended}</Badge>;
      case 'banned': return <Badge className="bg-red-500/10 text-red-600">{t.users.statusBanned}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleAction = () => {
    if (!actionDialog) return;
    if (actionDialog.type === 'suspend') onSuspend(actionDialog.user.id, reason);
    else if (actionDialog.type === 'ban') onBan(actionDialog.user.id, reason);
    else onReactivate(actionDialog.user.id);
    setActionDialog(null);
    setReason("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
          <p className="text-sm text-muted-foreground">{t.users.totalUsers}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
          <p className="text-sm text-muted-foreground">{t.users.activeUsers}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.paidUsers}</p>
          <p className="text-sm text-muted-foreground">{t.users.paidUsers}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.suspendedUsers}</p>
          <p className="text-sm text-muted-foreground">{t.users.suspendedUsers}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.bannedUsers}</p>
          <p className="text-sm text-muted-foreground">{t.users.bannedUsers}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.users.title}
          </CardTitle>
          <CardDescription>{t.users.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8"><RefreshCw className="w-8 h-8 mx-auto animate-spin" /></div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`user-row-${user.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{user.username || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(user.status || 'active')}
                      <Badge variant="outline">{user.subscriptionTier || 'free'}</Badge>
                      <div className="flex gap-1">
                        {user.status === 'active' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => setActionDialog({ type: 'suspend', user })} data-testid={`btn-suspend-${user.id}`}>
                              {t.users.suspend}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setActionDialog({ type: 'ban', user })} data-testid={`btn-ban-${user.id}`}>
                              {t.users.ban}
                            </Button>
                          </>
                        )}
                        {(user.status === 'suspended' || user.status === 'banned') && (
                          <Button size="sm" onClick={() => setActionDialog({ type: 'reactivate', user })} data-testid={`btn-reactivate-${user.id}`}>
                            {t.users.reactivate}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionDialog?.type === 'reactivate' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
              {actionDialog?.type === 'suspend' && t.users.confirmSuspend}
              {actionDialog?.type === 'ban' && t.users.confirmBan}
              {actionDialog?.type === 'reactivate' && t.users.confirmReactivate}
            </DialogTitle>
            <DialogDescription>{actionDialog?.user.email}</DialogDescription>
          </DialogHeader>
          {actionDialog?.type !== 'reactivate' && (
            <div className="py-4">
              <Label>{t.users.enterReason}</Label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} data-testid="input-action-reason" />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
            <Button
              variant={actionDialog?.type === 'reactivate' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={suspendPending || banPending || reactivatePending || (actionDialog?.type !== 'reactivate' && !reason)}
              data-testid="btn-confirm-action"
            >
              {actionDialog?.type === 'suspend' && t.users.suspend}
              {actionDialog?.type === 'ban' && t.users.ban}
              {actionDialog?.type === 'reactivate' && t.users.reactivate}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
