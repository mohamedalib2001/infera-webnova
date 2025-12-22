import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Briefcase, ListTodo, Clock, CheckCircle2, AlertCircle, 
  Calendar, Building, Play, Pause, MessageSquare, Send, RefreshCw
} from "lucide-react";
import type { EmployeeTask, TaskComment } from "@shared/schema";

const PRIORITY_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  low: { ar: "منخفضة", en: "Low", color: "bg-slate-500" },
  medium: { ar: "متوسطة", en: "Medium", color: "bg-blue-500" },
  high: { ar: "عالية", en: "High", color: "bg-orange-500" },
  urgent: { ar: "عاجلة", en: "Urgent", color: "bg-red-500" },
};

const STATUS_LABELS: Record<string, { ar: string; icon: JSX.Element }> = {
  pending: { ar: "قيد الانتظار", icon: <Clock className="h-4 w-4 text-yellow-500" /> },
  in_progress: { ar: "قيد التنفيذ", icon: <AlertCircle className="h-4 w-4 text-blue-500" /> },
  completed: { ar: "مكتملة", icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
  on_hold: { ar: "معلقة", icon: <Pause className="h-4 w-4 text-orange-500" /> },
  cancelled: { ar: "ملغاة", icon: <Clock className="h-4 w-4 text-gray-500" /> },
};

export default function EmployeeDashboard() {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);
  const [newComment, setNewComment] = useState("");

  const { data: dashboard, isLoading } = useQuery<{
    stats: {
      totalTasks: number;
      pending: number;
      inProgress: number;
      completed: number;
      overdue: number;
      upcomingThisWeek: number;
      departments: number;
    };
    recentTasks: EmployeeTask[];
    memberships: any[];
  }>({
    queryKey: ["/api/employee/dashboard"],
  });

  const { data: tasks = [] } = useQuery<EmployeeTask[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: comments = [], refetch: refetchComments } = useQuery<TaskComment[]>({
    queryKey: ["/api/tasks", selectedTask?.id, "comments"],
    enabled: !!selectedTask,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<EmployeeTask> }) => {
      return apiRequest("PATCH", `/api/tasks/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employee/dashboard"] });
      toast({ title: "تم تحديث المهمة / Task updated" });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: { taskId: string; content: string }) => {
      return apiRequest("POST", `/api/tasks/${data.taskId}/comments`, { content: data.content });
    },
    onSuccess: () => {
      refetchComments();
      setNewComment("");
      toast({ title: "تمت إضافة التعليق / Comment added" });
    },
  });

  const handleStatusChange = (task: EmployeeTask, newStatus: string) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { status: newStatus as EmployeeTask["status"] },
    });
  };

  const handleProgressUpdate = (task: EmployeeTask, progress: number) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { progress },
    });
  };

  const handleAddComment = () => {
    if (!selectedTask || !newComment.trim()) return;
    addCommentMutation.mutate({ taskId: selectedTask.id, content: newComment });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const stats = dashboard?.stats;

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">لوحة تحكم الموظف / Employee Dashboard</h1>
            <p className="text-muted-foreground text-sm">تتبع مهامك ونشاطك / Track your tasks and activity</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/employee/dashboard"] })}
          data-testid="button-refresh"
        >
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">إجمالي المهام</p>
                  <p className="text-2xl font-bold" data-testid="text-total-tasks">{stats.totalTasks}</p>
                </div>
                <ListTodo className="h-8 w-8 text-muted-foreground" />
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
          <Card className={stats.overdue > 0 ? "border-red-500" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">متأخرة</p>
                  <p className={`text-2xl font-bold ${stats.overdue > 0 ? "text-red-600" : ""}`}>{stats.overdue}</p>
                </div>
                <Clock className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                مهامي / My Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  لا توجد مهام مسندة إليك حالياً
                </div>
              ) : (
                tasks.map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";
                  const priority = PRIORITY_LABELS[task.priority];

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-md border ${isOverdue ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}`}
                      data-testid={`task-row-${task.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {STATUS_LABELS[task.status]?.icon}
                            <h4 className="font-medium">{task.titleAr || task.title}</h4>
                            <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {task.descriptionAr || task.description || "لا يوجد وصف"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {task.dueDate && (
                              <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500" : ""}`}>
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString("ar-SA")}
                              </span>
                            )}
                            <span>التقدم: {task.progress || 0}%</span>
                          </div>
                          <Progress value={task.progress || 0} className="h-1 mt-2" />
                        </div>

                        <div className="flex flex-col gap-2">
                          <Select
                            value={task.status}
                            onValueChange={(v) => handleStatusChange(task, v)}
                          >
                            <SelectTrigger className="w-[120px]" data-testid={`select-status-${task.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">قيد الانتظار</SelectItem>
                              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                              <SelectItem value="completed">مكتملة</SelectItem>
                              <SelectItem value="on_hold">معلقة</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTask(task)}
                            data-testid={`button-task-details-${task.id}`}
                          >
                            <MessageSquare className="h-4 w-4 ml-1" />
                            تفاصيل
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                أقسامي / My Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.memberships?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">لست عضواً في أي قسم</p>
              ) : (
                <div className="space-y-2">
                  {dashboard?.memberships?.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-md border">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        <span className="text-sm">قسم #{m.departmentId?.slice(0, 6)}</span>
                      </div>
                      <Badge variant="outline">{m.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">مهام هذا الأسبوع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center py-4">{stats?.upcomingThisWeek || 0}</div>
              <p className="text-center text-sm text-muted-foreground">مهام مستحقة خلال 7 أيام</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المهمة / Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">{selectedTask.titleAr || selectedTask.title}</h3>
                <p className="text-muted-foreground">{selectedTask.descriptionAr || selectedTask.description}</p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="outline">{STATUS_LABELS[selectedTask.status]?.ar}</Badge>
                <Badge className={PRIORITY_LABELS[selectedTask.priority]?.color}>
                  {PRIORITY_LABELS[selectedTask.priority]?.ar}
                </Badge>
                {selectedTask.dueDate && (
                  <span className="text-sm text-muted-foreground">
                    استحقاق: {new Date(selectedTask.dueDate).toLocaleDateString("ar-SA")}
                  </span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">تحديث نسبة الإنجاز: {selectedTask.progress}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedTask.progress || 0}
                  onChange={(e) => setSelectedTask({ ...selectedTask, progress: parseInt(e.target.value) })}
                  className="w-full mt-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => handleProgressUpdate(selectedTask, selectedTask.progress || 0)}
                  disabled={updateTaskMutation.isPending}
                >
                  حفظ التقدم
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  التعليقات
                </h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4 text-sm">لا توجد تعليقات</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="p-2 rounded-md bg-muted text-sm">
                        <p>{c.content}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleString("ar-SA")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="أضف تعليقاً..."
                    className="flex-1"
                    data-testid="input-comment"
                  />
                  <Button onClick={handleAddComment} disabled={addCommentMutation.isPending} data-testid="button-send-comment">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إغلاق</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
