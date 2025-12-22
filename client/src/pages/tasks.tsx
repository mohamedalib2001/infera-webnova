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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  ListTodo, Plus, Clock, CheckCircle2, AlertCircle, Pause, 
  Calendar, User as UserIcon, Building, Edit2, Trash2, Save, MessageSquare
} from "lucide-react";
import type { EmployeeTask, User, Department } from "@shared/schema";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const STATUS_ICONS: Record<string, JSX.Element> = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  in_progress: <AlertCircle className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  cancelled: <Trash2 className="h-4 w-4 text-gray-500" />,
  on_hold: <Pause className="h-4 w-4 text-orange-500" />,
};

export default function TasksPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<EmployeeTask | null>(null);
  const [filter, setFilter] = useState("all");
  const [newTask, setNewTask] = useState({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    assignedTo: "",
    departmentId: "",
    priority: "medium",
    dueDate: "",
    estimatedHours: "",
    notes: "",
  });

  const { data: tasks = [], isLoading } = useQuery<EmployeeTask[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/tasks/stats/overview"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/owner/users"],
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newTask) => {
      return apiRequest("POST", "/api/tasks", {
        ...data,
        estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : null,
        dueDate: data.dueDate || null,
        assignedTo: data.assignedTo || null,
        departmentId: data.departmentId || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats/overview"] });
      setIsCreateOpen(false);
      setNewTask({ title: "", titleAr: "", description: "", descriptionAr: "", assignedTo: "", departmentId: "", priority: "medium", dueDate: "", estimatedHours: "", notes: "" });
      toast({ title: "تم إنشاء المهمة بنجاح / Task created successfully" });
    },
    onError: () => {
      toast({ title: "فشل في إنشاء المهمة / Failed to create task", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<EmployeeTask> }) => {
      return apiRequest("PATCH", `/api/tasks/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats/overview"] });
      setEditTask(null);
      toast({ title: "تم تحديث المهمة / Task updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats/overview"] });
      toast({ title: "تم حذف المهمة / Task deleted" });
    },
  });

  const handleCreate = () => {
    if (!newTask.title) {
      toast({ title: "عنوان المهمة مطلوب / Task title is required", variant: "destructive" });
      return;
    }
    createMutation.mutate(newTask);
  };

  const handleUpdate = () => {
    if (editTask) {
      updateMutation.mutate({
        id: editTask.id,
        updates: {
          title: editTask.title,
          titleAr: editTask.titleAr,
          description: editTask.description,
          descriptionAr: editTask.descriptionAr,
          priority: editTask.priority,
          status: editTask.status,
          progress: editTask.progress,
        },
      });
    }
  };

  const getUser = (userId: string | null) => users.find((u) => u.id === userId);
  const getDept = (deptId: string | null) => departments.find((d) => d.id === deptId);

  const filteredTasks = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

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
          <ListTodo className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">إدارة المهام / Tasks</h1>
            <p className="text-muted-foreground text-sm">إنشاء وتتبع مهام الموظفين / Create and track employee tasks</p>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-task">
              <Plus className="h-4 w-4 ml-2" />
              مهمة جديدة / New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء مهمة جديدة / Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>العنوان (إنجليزي)</Label>
                  <Input
                    data-testid="input-task-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Task Title"
                  />
                </div>
                <div>
                  <Label>العنوان (عربي)</Label>
                  <Input
                    data-testid="input-task-title-ar"
                    value={newTask.titleAr}
                    onChange={(e) => setNewTask({ ...newTask, titleAr: e.target.value })}
                    placeholder="عنوان المهمة"
                    dir="rtl"
                  />
                </div>
              </div>
              <div>
                <Label>الوصف (إنجليزي)</Label>
                <Textarea
                  data-testid="input-task-desc"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description..."
                />
              </div>
              <div>
                <Label>الوصف (عربي)</Label>
                <Textarea
                  data-testid="input-task-desc-ar"
                  value={newTask.descriptionAr}
                  onChange={(e) => setNewTask({ ...newTask, descriptionAr: e.target.value })}
                  placeholder="وصف المهمة..."
                  dir="rtl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>تعيين إلى / Assign To</Label>
                  <Select value={newTask.assignedTo} onValueChange={(v) => setNewTask({ ...newTask, assignedTo: v })}>
                    <SelectTrigger data-testid="select-task-assignee">
                      <SelectValue placeholder="اختر موظف..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون تعيين</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.firstName} {u.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>القسم / Department</Label>
                  <Select value={newTask.departmentId} onValueChange={(v) => setNewTask({ ...newTask, departmentId: v })}>
                    <SelectTrigger data-testid="select-task-dept">
                      <SelectValue placeholder="اختر قسم..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">بدون قسم</SelectItem>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.nameAr || d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>الأولوية / Priority</Label>
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v })}>
                    <SelectTrigger data-testid="select-task-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة / Low</SelectItem>
                      <SelectItem value="medium">متوسطة / Medium</SelectItem>
                      <SelectItem value="high">عالية / High</SelectItem>
                      <SelectItem value="urgent">عاجلة / Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>تاريخ الاستحقاق</Label>
                  <Input
                    data-testid="input-task-due"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>الساعات المقدرة</Label>
                  <Input
                    data-testid="input-task-hours"
                    type="number"
                    step="0.5"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                    placeholder="مثال: 8"
                  />
                </div>
              </div>
              <div>
                <Label>ملاحظات / Notes</Label>
                <Textarea
                  data-testid="input-task-notes"
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-save-task">
                <Save className="h-4 w-4 ml-2" />
                {createMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">الإجمالي</p>
                  <p className="text-2xl font-bold" data-testid="text-total-tasks">{stats.total}</p>
                </div>
                <ListTodo className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">قيد الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">قيد التنفيذ</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">مكتملة</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">نسبة الإنجاز</p>
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                </div>
                <Progress value={stats.completionRate} className="w-12 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">الكل ({tasks.length})</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="in_progress" data-testid="tab-in-progress">قيد التنفيذ</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">مكتملة</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4 mt-4">
          {filteredTasks.map((task) => {
            const assignee = getUser(task.assignedTo);
            const dept = getDept(task.departmentId);
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";

            return (
              <Card key={task.id} className={isOverdue ? "border-red-500" : ""} data-testid={`card-task-${task.id}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        {STATUS_ICONS[task.status]}
                        <h3 className="font-medium">{task.titleAr || task.title}</h3>
                        <div className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority]}`} title={task.priority} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.descriptionAr || task.description || "لا يوجد وصف"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {assignee && (
                        <div className="flex items-center gap-1 text-sm">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{assignee.firstName}</span>
                        </div>
                      )}
                      {dept && (
                        <div className="flex items-center gap-1 text-sm">
                          <Building className="h-4 w-4" style={{ color: dept.color || "#3b82f6" }} />
                          <span>{dept.nameAr || dept.name}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className={`flex items-center gap-1 text-sm ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}>
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(task.dueDate).toLocaleDateString("ar-SA")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditTask(task)}
                        data-testid={`button-edit-task-${task.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
                            deleteMutation.mutate(task.id);
                          }
                        }}
                        data-testid={`button-delete-task-${task.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={task.progress || 0} className="h-2" />
                    </div>
                    <span className="text-xs text-muted-foreground">{task.progress || 0}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredTasks.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-1">لا توجد مهام / No Tasks</h3>
                <p className="text-muted-foreground text-sm mb-4">ابدأ بإنشاء مهمة جديدة</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء مهمة
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل المهمة / Edit Task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>العنوان</Label>
                  <Input
                    value={editTask.title}
                    onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>الحالة</Label>
                  <Select 
                    value={editTask.status} 
                    onValueChange={(v) => setEditTask({ ...editTask, status: v as EmployeeTask["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                      <SelectItem value="completed">مكتملة</SelectItem>
                      <SelectItem value="on_hold">معلقة</SelectItem>
                      <SelectItem value="cancelled">ملغاة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>الأولوية</Label>
                <Select 
                  value={editTask.priority} 
                  onValueChange={(v) => setEditTask({ ...editTask, priority: v as EmployeeTask["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>نسبة الإنجاز: {editTask.progress}%</Label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={editTask.progress || 0}
                  onChange={(e) => setEditTask({ ...editTask, progress: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditTask(null)}>إلغاء</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 ml-2" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
