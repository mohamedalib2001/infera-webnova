import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, Plus, Users, Edit2, Trash2, UserPlus, 
  Palette, Crown, Save, X
} from "lucide-react";
import type { Department, User, DepartmentMember } from "@shared/schema";

const DEPARTMENT_COLORS = [
  { value: "#3b82f6", label: "أزرق / Blue" },
  { value: "#10b981", label: "أخضر / Green" },
  { value: "#f59e0b", label: "برتقالي / Orange" },
  { value: "#ef4444", label: "أحمر / Red" },
  { value: "#8b5cf6", label: "بنفسجي / Purple" },
  { value: "#ec4899", label: "وردي / Pink" },
  { value: "#6366f1", label: "نيلي / Indigo" },
  { value: "#14b8a6", label: "تركوازي / Teal" },
];

export default function DepartmentsPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [newDept, setNewDept] = useState({
    name: "",
    nameAr: "",
    description: "",
    descriptionAr: "",
    color: "#3b82f6",
    maxMembers: "",
  });

  const { data: departments = [], isLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/owner/users"],
  });

  const { data: deptMembers = [] } = useQuery<DepartmentMember[]>({
    queryKey: ["/api/departments", selectedDept?.id, "members"],
    enabled: !!selectedDept,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newDept) => {
      return apiRequest("POST", "/api/departments", {
        ...data,
        maxMembers: data.maxMembers ? parseInt(data.maxMembers) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsCreateOpen(false);
      setNewDept({ name: "", nameAr: "", description: "", descriptionAr: "", color: "#3b82f6", maxMembers: "" });
      toast({ title: "تم إنشاء القسم بنجاح / Department created successfully" });
    },
    onError: () => {
      toast({ title: "فشل في إنشاء القسم / Failed to create department", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Department> }) => {
      return apiRequest("PATCH", `/api/departments/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setEditDept(null);
      toast({ title: "تم تحديث القسم / Department updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({ title: "تم حذف القسم / Department deleted" });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: async (data: { deptId: string; userId: string; role: string; title?: string }) => {
      return apiRequest("POST", `/api/departments/${data.deptId}/members`, { userId: data.userId, role: data.role, title: data.title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments", selectedDept?.id, "members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({ title: "تمت إضافة العضو / Member added" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/department-members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments", selectedDept?.id, "members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({ title: "تمت إزالة العضو / Member removed" });
    },
  });

  const [addMemberData, setAddMemberData] = useState({ userId: "", role: "member", title: "" });

  const handleCreate = () => {
    if (!newDept.name) {
      toast({ title: "اسم القسم مطلوب / Department name is required", variant: "destructive" });
      return;
    }
    createMutation.mutate(newDept);
  };

  const handleUpdate = () => {
    if (editDept) {
      updateMutation.mutate({
        id: editDept.id,
        updates: {
          name: editDept.name,
          nameAr: editDept.nameAr,
          description: editDept.description,
          descriptionAr: editDept.descriptionAr,
          color: editDept.color,
          maxMembers: editDept.maxMembers,
        },
      });
    }
  };

  const handleAddMember = () => {
    if (!addMemberData.userId || !selectedDept) return;
    addMemberMutation.mutate({
      deptId: selectedDept.id,
      userId: addMemberData.userId,
      role: addMemberData.role,
      title: addMemberData.title || undefined,
    });
    setAddMemberData({ userId: "", role: "member", title: "" });
  };

  const getMemberUser = (userId: string) => users.find((u) => u.id === userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">إدارة الأقسام / Departments</h1>
            <p className="text-muted-foreground text-sm">إنشاء وإدارة أقسام المنظمة / Create and manage organization departments</p>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-department">
              <Plus className="h-4 w-4 ml-2" />
              قسم جديد / New Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إنشاء قسم جديد / Create New Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الاسم (إنجليزي)</Label>
                  <Input
                    data-testid="input-dept-name"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                    placeholder="Department Name"
                  />
                </div>
                <div>
                  <Label>الاسم (عربي)</Label>
                  <Input
                    data-testid="input-dept-name-ar"
                    value={newDept.nameAr}
                    onChange={(e) => setNewDept({ ...newDept, nameAr: e.target.value })}
                    placeholder="اسم القسم"
                    dir="rtl"
                  />
                </div>
              </div>
              <div>
                <Label>الوصف (إنجليزي)</Label>
                <Textarea
                  data-testid="input-dept-desc"
                  value={newDept.description}
                  onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
                  placeholder="Department description..."
                />
              </div>
              <div>
                <Label>الوصف (عربي)</Label>
                <Textarea
                  data-testid="input-dept-desc-ar"
                  value={newDept.descriptionAr}
                  onChange={(e) => setNewDept({ ...newDept, descriptionAr: e.target.value })}
                  placeholder="وصف القسم..."
                  dir="rtl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اللون / Color</Label>
                  <Select value={newDept.color} onValueChange={(v) => setNewDept({ ...newDept, color: v })}>
                    <SelectTrigger data-testid="select-dept-color">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: newDept.color }} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENT_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الحد الأقصى للأعضاء</Label>
                  <Input
                    data-testid="input-dept-max-members"
                    type="number"
                    value={newDept.maxMembers}
                    onChange={(e) => setNewDept({ ...newDept, maxMembers: e.target.value })}
                    placeholder="اختياري"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-save-department">
                <Save className="h-4 w-4 ml-2" />
                {createMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="relative overflow-visible" data-testid={`card-department-${dept.id}`}>
            <div className="absolute top-0 right-0 left-0 h-1 rounded-t-md" style={{ backgroundColor: dept.color || "#3b82f6" }} />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ backgroundColor: `${dept.color}20` }}>
                    <Building className="h-5 w-5" style={{ color: dept.color || "#3b82f6" }} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{dept.nameAr || dept.name}</CardTitle>
                    {dept.nameAr && <p className="text-xs text-muted-foreground">{dept.name}</p>}
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {dept.memberCount || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {dept.descriptionAr || dept.description || "لا يوجد وصف / No description"}
              </p>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditDept(dept)}
                    data-testid={`button-edit-dept-${dept.id}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedDept(dept)}
                    data-testid={`button-view-members-${dept.id}`}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("هل أنت متأكد من حذف هذا القسم؟ / Are you sure you want to delete this department?")) {
                        deleteMutation.mutate(dept.id);
                      }
                    }}
                    data-testid={`button-delete-dept-${dept.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Badge variant={dept.status === "active" ? "default" : "secondary"}>
                  {dept.status === "active" ? "نشط / Active" : "غير نشط / Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {departments.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-1">لا توجد أقسام / No Departments</h3>
              <p className="text-muted-foreground text-sm mb-4">ابدأ بإنشاء أول قسم في المنظمة</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                إنشاء قسم
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!editDept} onOpenChange={(open) => !open && setEditDept(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل القسم / Edit Department</DialogTitle>
          </DialogHeader>
          {editDept && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الاسم (إنجليزي)</Label>
                  <Input
                    value={editDept.name}
                    onChange={(e) => setEditDept({ ...editDept, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>الاسم (عربي)</Label>
                  <Input
                    value={editDept.nameAr || ""}
                    onChange={(e) => setEditDept({ ...editDept, nameAr: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>
              <div>
                <Label>الوصف (إنجليزي)</Label>
                <Textarea
                  value={editDept.description || ""}
                  onChange={(e) => setEditDept({ ...editDept, description: e.target.value })}
                />
              </div>
              <div>
                <Label>الوصف (عربي)</Label>
                <Textarea
                  value={editDept.descriptionAr || ""}
                  onChange={(e) => setEditDept({ ...editDept, descriptionAr: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اللون</Label>
                  <Select value={editDept.color || "#3b82f6"} onValueChange={(v) => setEditDept({ ...editDept, color: v })}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: editDept.color || "#3b82f6" }} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENT_COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الحد الأقصى للأعضاء</Label>
                  <Input
                    type="number"
                    value={editDept.maxMembers || ""}
                    onChange={(e) => setEditDept({ ...editDept, maxMembers: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDept(null)}>إلغاء</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedDept} onOpenChange={(open) => !open && setSelectedDept(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              أعضاء {selectedDept?.nameAr || selectedDept?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">إضافة عضو جديد / Add New Member</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <Select value={addMemberData.userId} onValueChange={(v) => setAddMemberData({ ...addMemberData, userId: v })}>
                    <SelectTrigger data-testid="select-member-user">
                      <SelectValue placeholder="اختر مستخدم..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => !deptMembers.some((m) => m.userId === u.id))
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.firstName} {u.lastName} ({u.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Select value={addMemberData.role} onValueChange={(v) => setAddMemberData({ ...addMemberData, role: v })}>
                    <SelectTrigger data-testid="select-member-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">عضو / Member</SelectItem>
                      <SelectItem value="lead">قائد / Lead</SelectItem>
                      <SelectItem value="manager">مدير / Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddMember} disabled={!addMemberData.userId || addMemberMutation.isPending} data-testid="button-add-member">
                    <UserPlus className="h-4 w-4 ml-2" />
                    إضافة
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {deptMembers.map((member) => {
                const user = getMemberUser(member.userId);
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-md border"
                    data-testid={`member-row-${member.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {user?.firstName?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === "manager" ? "default" : member.role === "lead" ? "secondary" : "outline"}>
                        {member.role === "manager" && <Crown className="h-3 w-3 ml-1" />}
                        {member.role === "manager" ? "مدير" : member.role === "lead" ? "قائد" : "عضو"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("هل تريد إزالة هذا العضو؟")) {
                            removeMemberMutation.mutate(member.id);
                          }
                        }}
                        data-testid={`button-remove-member-${member.id}`}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {deptMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  لا يوجد أعضاء في هذا القسم
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
