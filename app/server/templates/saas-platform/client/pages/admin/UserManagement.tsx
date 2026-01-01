import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Search, MoreVertical, UserCheck, UserX, Shield, Trash2, Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  status: string;
  isVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  role: {
    id: string;
    name: string;
    nameAr: string;
  };
}

interface UserManagementProps {
  language?: "ar" | "en";
}

export default function UserManagement({ language = "ar" }: UserManagementProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const isRTL = language === "ar";

  const texts = {
    ar: {
      title: "إدارة المستخدمين",
      description: "إدارة حسابات المستخدمين والصلاحيات",
      search: "بحث عن مستخدم...",
      allStatuses: "جميع الحالات",
      active: "نشط",
      suspended: "موقوف",
      banned: "محظور",
      email: "البريد الإلكتروني",
      username: "اسم المستخدم",
      role: "الصلاحية",
      status: "الحالة",
      lastLogin: "آخر دخول",
      actions: "الإجراءات",
      changeRole: "تغيير الصلاحية",
      suspend: "تعليق",
      activate: "تفعيل",
      delete: "حذف",
      noUsers: "لا يوجد مستخدمين",
      loading: "جاري التحميل...",
      confirmDelete: "هل أنت متأكد من حذف هذا المستخدم؟",
      success: "تم بنجاح",
      error: "حدث خطأ",
    },
    en: {
      title: "User Management",
      description: "Manage user accounts and permissions",
      search: "Search users...",
      allStatuses: "All Statuses",
      active: "Active",
      suspended: "Suspended",
      banned: "Banned",
      email: "Email",
      username: "Username",
      role: "Role",
      status: "Status",
      lastLogin: "Last Login",
      actions: "Actions",
      changeRole: "Change Role",
      suspend: "Suspend",
      activate: "Activate",
      delete: "Delete",
      noUsers: "No users found",
      loading: "Loading...",
      confirmDelete: "Are you sure you want to delete this user?",
      success: "Success",
      error: "Error occurred",
    },
  };

  const t = texts[language];

  const { data: usersData, isLoading } = useQuery<{ users: User[]; pagination: any }>({
    queryKey: ["/api/admin/users", { search, status: statusFilter }],
  });

  const { data: rolesData } = useQuery<{ roles: { id: string; name: string; nameAr: string }[] }>({
    queryKey: ["/api/admin/roles"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: t.success });
    },
    onError: () => {
      toast({ title: t.error, variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ roleId }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setRoleDialogOpen(false);
      toast({ title: t.success });
    },
    onError: () => {
      toast({ title: t.error, variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: t.success });
    },
    onError: () => {
      toast({ title: t.error, variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      suspended: "secondary",
      banned: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status === "active" ? t.active : status === "suspended" ? t.suspended : t.banned}</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US");
  };

  return (
    <div className={isRTL ? "rtl" : "ltr"} dir={isRTL ? "rtl" : "ltr"}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t.title}</CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={`absolute top-2.5 h-4 w-4 text-muted-foreground ${isRTL ? "right-3" : "left-3"}`} />
              <Input
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={isRTL ? "pr-9" : "pl-9"}
                data-testid="input-search-users"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder={t.allStatuses} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatuses}</SelectItem>
                <SelectItem value="active">{t.active}</SelectItem>
                <SelectItem value="suspended">{t.suspended}</SelectItem>
                <SelectItem value="banned">{t.banned}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : usersData?.users?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">{t.noUsers}</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.username}</TableHead>
                    <TableHead>{t.email}</TableHead>
                    <TableHead>{t.role}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.lastLogin}</TableHead>
                    <TableHead className="w-[50px]">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.users?.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            {(user.firstName || user.lastName) && (
                              <div className="text-sm text-muted-foreground">
                                {user.firstName} {user.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{language === "ar" ? user.role.nameAr : user.role.name}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${user.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? "start" : "end"}>
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setRoleDialogOpen(true); }}>
                              <Shield className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                              {t.changeRole}
                            </DropdownMenuItem>
                            {user.status === "active" ? (
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ userId: user.id, status: "suspended" })}>
                                <UserX className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                                {t.suspend}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ userId: user.id, status: "active" })}>
                                <UserCheck className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                                {t.activate}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (window.confirm(t.confirmDelete)) {
                                  deleteUserMutation.mutate(user.id);
                                }
                              }}
                            >
                              <Trash2 className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                              {t.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.changeRole}</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {rolesData?.roles?.map((role) => (
              <Button
                key={role.id}
                variant={selectedUser?.role.id === role.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => {
                  if (selectedUser) {
                    updateRoleMutation.mutate({ userId: selectedUser.id, roleId: role.id });
                  }
                }}
                disabled={updateRoleMutation.isPending}
              >
                {language === "ar" ? role.nameAr : role.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
