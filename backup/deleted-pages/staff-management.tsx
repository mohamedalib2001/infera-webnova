import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { 
  Users, UserPlus, Shield, Key, MoreVertical,
  Mail, Calendar, CheckCircle2, XCircle, Loader2,
  AlertTriangle, Crown, Building, RefreshCw
} from "lucide-react";
import type { User } from "@shared/schema";

const ROLE_LABELS: Record<string, { en: string; ar: string; color: string }> = {
  owner: { en: "Owner", ar: "المالك", color: "bg-amber-500" },
  sovereign: { en: "Sovereign", ar: "سيادي", color: "bg-purple-500" },
  admin: { en: "Admin", ar: "مدير", color: "bg-blue-500" },
  finance_admin: { en: "Finance Admin", ar: "مدير المالية", color: "bg-green-500" },
  finance_manager: { en: "Finance Manager", ar: "مسؤول المالية", color: "bg-emerald-500" },
  accountant: { en: "Accountant", ar: "محاسب", color: "bg-teal-500" },
  support_agent: { en: "Support Agent", ar: "وكيل الدعم", color: "bg-cyan-500" },
};

export default function StaffManagement() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    email: "",
    fullName: "",
    role: "admin" as string,
  });
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const { data: staff = [], isLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/owner/staff"],
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: typeof newStaff) => {
      return apiRequest("POST", "/api/owner/staff/invite", data);
    },
    onSuccess: async (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/staff"] });
      setTempPassword(response.tempPassword);
      toast({
        title: isRtl ? "تم إنشاء حساب الموظف" : "Staff account created",
        description: isRtl ? "احفظ كلمة المرور المؤقتة" : "Save the temporary password",
      });
    },
    onError: () => {
      toast({
        title: isRtl ? "فشل في إنشاء الحساب" : "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest("PATCH", `/api/owner/staff/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/staff"] });
      toast({ title: isRtl ? "تم تحديث الدور" : "Role updated" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("POST", `/api/owner/staff/${userId}/reset-password`);
    },
    onSuccess: (response: any) => {
      toast({
        title: isRtl ? "تم إعادة تعيين كلمة المرور" : "Password reset",
        description: `${isRtl ? "كلمة المرور الجديدة:" : "New password:"} ${response.newPassword}`,
      });
    },
  });

  const removeStaffMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: string }) => {
      return apiRequest("DELETE", `/api/owner/staff/${userId}?action=${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/staff"] });
      toast({ title: isRtl ? "تمت العملية بنجاح" : "Operation successful" });
    },
  });

  const handleInvite = () => {
    if (!newStaff.email || !newStaff.fullName) return;
    inviteMutation.mutate(newStaff);
  };

  const handleCloseInvite = () => {
    setInviteOpen(false);
    setNewStaff({ email: "", fullName: "", role: "admin" });
    setTempPassword(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center border border-blue-500/30">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">
              {isRtl ? "إدارة الموظفين" : "Staff Management"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRtl ? "إضافة وإدارة موظفي المنصة" : "Add and manage platform employees"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-invite-staff">
                <UserPlus className="h-4 w-4" />
                {isRtl ? "دعوة موظف" : "Invite Staff"}
              </Button>
            </DialogTrigger>
            <DialogContent dir={isRtl ? "rtl" : "ltr"}>
              <DialogHeader>
                <DialogTitle>{isRtl ? "دعوة موظف جديد" : "Invite New Staff"}</DialogTitle>
                <DialogDescription>
                  {isRtl 
                    ? "أدخل بيانات الموظف لإنشاء حساب عمل" 
                    : "Enter employee details to create a work account"}
                </DialogDescription>
              </DialogHeader>
              
              {tempPassword ? (
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">
                        {isRtl ? "تم إنشاء الحساب بنجاح" : "Account Created Successfully"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isRtl 
                        ? "احفظ كلمة المرور المؤقتة وشاركها بشكل آمن مع الموظف" 
                        : "Save the temporary password and share it securely with the employee"}
                    </p>
                    <div className="p-3 bg-background rounded border font-mono text-center">
                      {tempPassword}
                    </div>
                  </div>
                  <Button onClick={handleCloseInvite} className="w-full">
                    {isRtl ? "إغلاق" : "Close"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{isRtl ? "الاسم الكامل" : "Full Name"}</Label>
                      <Input
                        value={newStaff.fullName}
                        onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                        placeholder={isRtl ? "أحمد محمد" : "John Doe"}
                        data-testid="input-staff-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRtl ? "البريد الإلكتروني" : "Email"}</Label>
                      <Input
                        type="email"
                        value={newStaff.email}
                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                        placeholder="employee@company.com"
                        data-testid="input-staff-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isRtl ? "الدور الوظيفي" : "Role"}</Label>
                      <Select
                        value={newStaff.role}
                        onValueChange={(value) => setNewStaff({ ...newStaff, role: value })}
                      >
                        <SelectTrigger data-testid="select-staff-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            {isRtl ? "مدير" : "Admin"}
                          </SelectItem>
                          <SelectItem value="sovereign">
                            {isRtl ? "سيادي" : "Sovereign"}
                          </SelectItem>
                          <SelectItem value="finance_admin">
                            {isRtl ? "مدير المالية" : "Finance Admin"}
                          </SelectItem>
                          <SelectItem value="finance_manager">
                            {isRtl ? "مسؤول المالية" : "Finance Manager"}
                          </SelectItem>
                          <SelectItem value="accountant">
                            {isRtl ? "محاسب" : "Accountant"}
                          </SelectItem>
                          <SelectItem value="support_agent">
                            {isRtl ? "وكيل الدعم" : "Support Agent"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleCloseInvite}>
                      {isRtl ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button 
                      onClick={handleInvite} 
                      disabled={inviteMutation.isPending}
                      data-testid="button-confirm-invite"
                    >
                      {inviteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {isRtl ? "إنشاء الحساب" : "Create Account"}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{staff.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "إجمالي الموظفين" : "Total Staff"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {staff.filter(s => s.status === "ACTIVE").length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "نشط" : "Active"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {staff.filter(s => s.role === "sovereign" || s.role === "admin").length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "مديرين" : "Admins"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Building className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {staff.filter(s => s.role.includes("finance")).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "المالية" : "Finance"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isRtl ? "قائمة الموظفين" : "Staff List"}
          </CardTitle>
          <CardDescription>
            {isRtl ? "جميع موظفي المنصة وصلاحياتهم" : "All platform employees and their permissions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {staff.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{isRtl ? "لا يوجد موظفين بعد" : "No staff members yet"}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setInviteOpen(true)}
                  >
                    {isRtl ? "دعوة أول موظف" : "Invite first employee"}
                  </Button>
                </div>
              ) : (
                staff.map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                    data-testid={`staff-member-${member.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.fullName?.charAt(0) || member.email?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.fullName || member.email}</span>
                          <Badge className={`${ROLE_LABELS[member.role]?.color || "bg-gray-500"} text-white text-[10px]`}>
                            {isRtl 
                              ? ROLE_LABELS[member.role]?.ar || member.role
                              : ROLE_LABELS[member.role]?.en || member.role}
                          </Badge>
                          {member.status !== "ACTIVE" && (
                            <Badge variant="destructive" className="text-[10px]">
                              {member.status}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </span>
                          {member.createdAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(member.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-actions-${member.id}`}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => resetPasswordMutation.mutate(member.id)}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          {isRtl ? "إعادة تعيين كلمة المرور" : "Reset Password"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => updateRoleMutation.mutate({ userId: member.id, role: "admin" })}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {isRtl ? "ترقية لمدير" : "Promote to Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => removeStaffMutation.mutate({ userId: member.id, action: "demote" })}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {isRtl ? "تخفيض لمستخدم عادي" : "Demote to User"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => removeStaffMutation.mutate({ userId: member.id, action: "deactivate" })}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {isRtl ? "إلغاء تفعيل الحساب" : "Deactivate Account"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
