import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Trash2, 
  RotateCcw, 
  Shield, 
  ShieldOff,
  Search, 
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Archive,
  RefreshCw,
  User,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  FileText,
  Database,
  FolderOpen,
  Layers,
  BarChart3,
  Eye,
  Undo2,
  History,
  Lock,
  Unlock,
  AlertCircle,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import type { DeletedItem, RecycleBinItem, DeletionAuditLog } from "@shared/schema";

type Language = "ar" | "en";

const translations = {
  ar: {
    title: "إدارة المحذوفات",
    subtitle: "إدارة دورة حياة البيانات والاسترجاع الآمن",
    deletedItems: "العناصر المحذوفة",
    recycleBin: "سلة إعادة التدوير",
    auditLogs: "سجلات التدقيق",
    statistics: "الإحصائيات",
    search: "بحث...",
    filterBy: "تصفية حسب",
    entityType: "نوع الكيان",
    status: "الحالة",
    deletionType: "نوع الحذف",
    all: "الكل",
    platform: "منصة",
    project: "مشروع",
    file: "ملف",
    user: "مستخدم",
    recoverable: "قابل للاسترجاع",
    expired: "منتهي الصلاحية",
    locked: "مقفل",
    permanentlyDeleted: "محذوف نهائياً",
    manual: "يدوي",
    automatic: "تلقائي",
    ai: "ذكاء اصطناعي",
    policy: "سياسة",
    system: "نظام",
    restore: "استرجاع",
    permanentDelete: "حذف نهائي",
    protect: "حماية",
    unprotect: "إلغاء الحماية",
    viewDetails: "عرض التفاصيل",
    deletedBy: "حذف بواسطة",
    deletedAt: "تاريخ الحذف",
    expiresAt: "تنتهي في",
    retentionDays: "أيام الاحتفاظ",
    deviceInfo: "معلومات الجهاز",
    restoreOptions: "خيارات الاسترجاع",
    restoreToSameUser: "استرجاع لنفس المستخدم",
    restoreToDifferentUser: "استرجاع لمستخدم آخر",
    restoreToRecycleOnly: "استرجاع لسلة التدوير فقط",
    partialRestore: "استرجاع جزئي",
    confirmPermanentDelete: "تأكيد الحذف النهائي",
    permanentDeleteWarning: "هذا الإجراء لا يمكن التراجع عنه. سيتم حذف البيانات نهائياً.",
    cancel: "إلغاء",
    confirm: "تأكيد",
    totalDeleted: "إجمالي المحذوفات",
    recoverableItems: "قابل للاسترجاع",
    expiredItems: "منتهي الصلاحية",
    protectedItems: "عناصر محمية",
    noDeletedItems: "لا توجد عناصر محذوفة",
    noRecycleBinItems: "سلة إعادة التدوير فارغة",
    noAuditLogs: "لا توجد سجلات تدقيق",
    action: "الإجراء",
    timestamp: "الوقت",
    actor: "المنفذ",
    details: "التفاصيل",
    delete: "حذف",
    purge: "تطهير",
    transfer: "نقل",
    restoreAction: "استرجاع",
    protectAction: "حماية",
    unprotectAction: "إلغاء حماية",
    emergency: "استرجاع طوارئ",
    emergencyRestore: "استرجاع طوارئ",
    impactPreview: "معاينة التأثير",
    estimatedRecoveryTime: "وقت الاسترجاع المقدر",
    dependencies: "التبعيات",
    successRestore: "تم الاسترجاع بنجاح",
    successDelete: "تم الحذف بنجاح",
    successProtect: "تم تفعيل الحماية",
    successUnprotect: "تم إلغاء الحماية",
    errorOccurred: "حدث خطأ",
  },
  en: {
    title: "Deletion Management",
    subtitle: "Data lifecycle management and secure recovery",
    deletedItems: "Deleted Items",
    recycleBin: "Recycle Bin",
    auditLogs: "Audit Logs",
    statistics: "Statistics",
    search: "Search...",
    filterBy: "Filter by",
    entityType: "Entity Type",
    status: "Status",
    deletionType: "Deletion Type",
    all: "All",
    platform: "Platform",
    project: "Project",
    file: "File",
    user: "User",
    recoverable: "Recoverable",
    expired: "Expired",
    locked: "Locked",
    permanentlyDeleted: "Permanently Deleted",
    manual: "Manual",
    automatic: "Automatic",
    ai: "AI",
    policy: "Policy",
    system: "System",
    restore: "Restore",
    permanentDelete: "Permanent Delete",
    protect: "Protect",
    unprotect: "Unprotect",
    viewDetails: "View Details",
    deletedBy: "Deleted by",
    deletedAt: "Deleted at",
    expiresAt: "Expires at",
    retentionDays: "Retention days",
    deviceInfo: "Device Info",
    restoreOptions: "Restore Options",
    restoreToSameUser: "Restore to Same User",
    restoreToDifferentUser: "Restore to Different User",
    restoreToRecycleOnly: "Restore to Recycle Bin Only",
    partialRestore: "Partial Restore",
    confirmPermanentDelete: "Confirm Permanent Delete",
    permanentDeleteWarning: "This action cannot be undone. Data will be permanently deleted.",
    cancel: "Cancel",
    confirm: "Confirm",
    totalDeleted: "Total Deleted",
    recoverableItems: "Recoverable",
    expiredItems: "Expired",
    protectedItems: "Protected Items",
    noDeletedItems: "No deleted items",
    noRecycleBinItems: "Recycle bin is empty",
    noAuditLogs: "No audit logs",
    action: "Action",
    timestamp: "Timestamp",
    actor: "Actor",
    details: "Details",
    delete: "Delete",
    purge: "Purge",
    transfer: "Transfer",
    restoreAction: "Restore",
    protectAction: "Protect",
    unprotectAction: "Unprotect",
    emergency: "Emergency Restore",
    emergencyRestore: "Emergency Restore",
    impactPreview: "Impact Preview",
    estimatedRecoveryTime: "Estimated Recovery Time",
    dependencies: "Dependencies",
    successRestore: "Restored successfully",
    successDelete: "Deleted successfully",
    successProtect: "Protection enabled",
    successUnprotect: "Protection disabled",
    errorOccurred: "An error occurred",
  }
};

const getDeviceIcon = (deviceType?: string) => {
  switch (deviceType?.toLowerCase()) {
    case "mobile": return <Smartphone className="w-4 h-4" />;
    case "tablet": return <Tablet className="w-4 h-4" />;
    default: return <Monitor className="w-4 h-4" />;
  }
};

const getEntityIcon = (entityType: string) => {
  switch (entityType) {
    case "platform": return <Globe className="w-4 h-4" />;
    case "project": return <FolderOpen className="w-4 h-4" />;
    case "file": return <FileText className="w-4 h-4" />;
    case "user": return <User className="w-4 h-4" />;
    case "database": return <Database className="w-4 h-4" />;
    default: return <Layers className="w-4 h-4" />;
  }
};

const getStatusBadge = (status: string, t: typeof translations.ar) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    recoverable: { label: t.recoverable, variant: "default" },
    expired: { label: t.expired, variant: "secondary" },
    locked: { label: t.locked, variant: "outline" },
    permanently_deleted: { label: t.permanentlyDeleted, variant: "destructive" },
  };
  const config = statusMap[status] || { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getDeletionTypeBadge = (type: string, t: typeof translations.ar) => {
  const typeMap: Record<string, string> = {
    manual: t.manual,
    automatic: t.automatic,
    ai: t.ai,
    policy: t.policy,
    system: t.system,
  };
  return <Badge variant="outline">{typeMap[type] || type}</Badge>;
};

export default function DeletionManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [language] = useState<Language>("ar");
  const t = translations[language];
  const isRTL = language === "ar";

  const [activeTab, setActiveTab] = useState("deleted-items");
  const [searchQuery, setSearchQuery] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletionTypeFilter, setDeletionTypeFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<DeletedItem | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  const { data: deletedItems = [], isLoading: loadingItems } = useQuery<DeletedItem[]>({
    queryKey: ["/api/deleted-items", entityTypeFilter, statusFilter],
  });

  const { data: recycleBinItems = [], isLoading: loadingRecycle } = useQuery<RecycleBinItem[]>({
    queryKey: ["/api/recycle-bin"],
  });

  const { data: stats } = useQuery<{
    total: number;
    recoverable: number;
    expired: number;
    byType: Record<string, number>;
  }>({
    queryKey: ["/api/deletion-stats"],
  });

  const restoreMutation = useMutation({
    mutationFn: async ({ id, restoreType }: { id: string; restoreType: string }) => {
      const res = await fetch(`/api/deleted-items/${id}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restoreType }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to restore");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t.successRestore });
      queryClient.invalidateQueries({ queryKey: ["/api/deleted-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recycle-bin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deletion-stats"] });
      setRestoreDialogOpen(false);
      setSelectedItem(null);
    },
    onError: () => {
      toast({ title: t.errorOccurred, variant: "destructive" });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/deleted-items/${id}/permanent`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t.successDelete });
      queryClient.invalidateQueries({ queryKey: ["/api/deleted-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/deletion-stats"] });
    },
    onError: () => {
      toast({ title: t.errorOccurred, variant: "destructive" });
    },
  });

  const protectMutation = useMutation({
    mutationFn: async ({ id, protect }: { id: string; protect: boolean }) => {
      const res = await fetch(`/api/recycle-bin/${id}/protect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isProtected: protect }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update protection");
      return res.json();
    },
    onSuccess: (_, variables) => {
      toast({ title: variables.protect ? t.successProtect : t.successUnprotect });
      queryClient.invalidateQueries({ queryKey: ["/api/recycle-bin"] });
    },
    onError: () => {
      toast({ title: t.errorOccurred, variant: "destructive" });
    },
  });

  const filteredItems = deletedItems.filter(item => {
    if (searchQuery && !item.entityName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (entityTypeFilter !== "all" && item.entityType !== entityTypeFilter) {
      return false;
    }
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    if (deletionTypeFilter !== "all" && item.deletionType !== deletionTypeFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className={`min-h-screen bg-background p-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <Trash2 className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-page-title">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.totalDeleted}</p>
                  <p className="text-2xl font-bold" data-testid="text-total-deleted">{stats?.total || 0}</p>
                </div>
                <div className="p-3 rounded-full bg-destructive/10">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.recoverableItems}</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-recoverable">{stats?.recoverable || 0}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <RotateCcw className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.expiredItems}</p>
                  <p className="text-2xl font-bold text-yellow-500" data-testid="text-expired">{stats?.expired || 0}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.protectedItems}</p>
                  <p className="text-2xl font-bold text-blue-500" data-testid="text-protected">{recycleBinItems.filter(i => i.isProtected).length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deleted-items" className="gap-2" data-testid="tab-deleted-items">
              <Trash2 className="w-4 h-4" />
              {t.deletedItems}
            </TabsTrigger>
            <TabsTrigger value="recycle-bin" className="gap-2" data-testid="tab-recycle-bin">
              <Archive className="w-4 h-4" />
              {t.recycleBin}
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="gap-2" data-testid="tab-audit-logs">
              <History className="w-4 h-4" />
              {t.auditLogs}
            </TabsTrigger>
          </TabsList>

          {/* Deleted Items Tab */}
          <TabsContent value="deleted-items" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={t.search}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search"
                      />
                    </div>
                  </div>
                  
                  <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="select-entity-type">
                      <SelectValue placeholder={t.entityType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      <SelectItem value="platform">{t.platform}</SelectItem>
                      <SelectItem value="project">{t.project}</SelectItem>
                      <SelectItem value="file">{t.file}</SelectItem>
                      <SelectItem value="user">{t.user}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="select-status">
                      <SelectValue placeholder={t.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      <SelectItem value="recoverable">{t.recoverable}</SelectItem>
                      <SelectItem value="expired">{t.expired}</SelectItem>
                      <SelectItem value="locked">{t.locked}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={deletionTypeFilter} onValueChange={setDeletionTypeFilter}>
                    <SelectTrigger className="w-[180px]" data-testid="select-deletion-type">
                      <SelectValue placeholder={t.deletionType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      <SelectItem value="manual">{t.manual}</SelectItem>
                      <SelectItem value="automatic">{t.automatic}</SelectItem>
                      <SelectItem value="ai">{t.ai}</SelectItem>
                      <SelectItem value="policy">{t.policy}</SelectItem>
                      <SelectItem value="system">{t.system}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Items List */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {loadingItems ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Trash2 className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t.noDeletedItems}</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredItems.map((item) => (
                    <Card key={item.id} className="hover-elevate" data-testid={`card-deleted-item-${item.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {getEntityIcon(item.entityType)}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{item.entityName}</h3>
                                {getStatusBadge(item.status, t)}
                                {getDeletionTypeBadge(item.deletionType, t)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {item.deletedByFullName || item.deletedByEmail || t.deletedBy}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.deletedAt!).toLocaleDateString(language)}
                                </span>
                                {item.deviceType && (
                                  <span className="flex items-center gap-1">
                                    {getDeviceIcon(item.deviceType)}
                                    {item.deviceType}
                                  </span>
                                )}
                                {item.country && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {item.country}
                                  </span>
                                )}
                              </div>
                              {item.deletionReason && (
                                <p className="text-sm text-muted-foreground italic">
                                  "{item.deletionReason}"
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {item.status === "recoverable" && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setRestoreDialogOpen(true);
                                }}
                                data-testid={`button-restore-${item.id}`}
                              >
                                <RotateCcw className="w-4 h-4 me-1" />
                                {t.restore}
                              </Button>
                            )}
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" data-testid={`button-details-${item.id}`}>
                                  <Eye className="w-4 h-4 me-1" />
                                  {t.viewDetails}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {getEntityIcon(item.entityType)}
                                    {item.entityName}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {t.deletedAt}: {new Date(item.deletedAt!).toLocaleString(language)}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">{t.entityType}</p>
                                      <p className="capitalize">{item.entityType}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">{t.status}</p>
                                      {getStatusBadge(item.status, t)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">{t.deletionType}</p>
                                      {getDeletionTypeBadge(item.deletionType, t)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">{t.retentionDays}</p>
                                      <p>{item.retentionDays} days</p>
                                    </div>
                                    {item.expiresAt && (
                                      <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t.expiresAt}</p>
                                        <p>{new Date(item.expiresAt).toLocaleDateString(language)}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">{t.deletedBy}</p>
                                      <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6">
                                          <AvatarFallback>{item.deletedByFullName?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                        <span>{item.deletedByFullName || item.deletedByEmail}</span>
                                        <Badge variant="outline" className="text-xs">{item.deletedByRole}</Badge>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {(item.deviceType || item.browser || item.operatingSystem) && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-2">{t.deviceInfo}</p>
                                      <div className="flex items-center gap-4 text-sm">
                                        {item.deviceType && (
                                          <span className="flex items-center gap-1">
                                            {getDeviceIcon(item.deviceType)}
                                            {item.deviceType}
                                          </span>
                                        )}
                                        {item.browser && <span>{item.browser}</span>}
                                        {item.operatingSystem && <span>{item.operatingSystem}</span>}
                                        {item.country && (
                                          <span className="flex items-center gap-1">
                                            <Globe className="w-3 h-3" />
                                            {item.country}, {item.region}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" data-testid={`button-permanent-delete-${item.id}`}>
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-destructive" />
                                    {t.confirmPermanentDelete}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t.permanentDeleteWarning}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => permanentDeleteMutation.mutate(item.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {t.confirm}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Recycle Bin Tab */}
          <TabsContent value="recycle-bin" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {loadingRecycle ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : recycleBinItems.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Archive className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t.noRecycleBinItems}</p>
                    </CardContent>
                  </Card>
                ) : (
                  recycleBinItems.map((item) => (
                    <Card key={item.id} className={`hover-elevate ${item.isProtected ? "border-blue-500/50" : ""}`} data-testid={`card-recycle-item-${item.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {getEntityIcon(item.entityType)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{item.entityName}</h3>
                                {item.isProtected && (
                                  <Badge variant="outline" className="border-blue-500 text-blue-500">
                                    <Shield className="w-3 h-3 me-1" />
                                    {t.protect}
                                  </Badge>
                                )}
                                <Badge variant="outline">{item.priority}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.movedToRecycleAt!).toLocaleDateString(language)}
                                </span>
                                {item.scheduledPurgeAt && (
                                  <span className="flex items-center gap-1 text-yellow-500">
                                    <Clock className="w-3 h-3" />
                                    {t.expiresAt}: {new Date(item.scheduledPurgeAt).toLocaleDateString(language)}
                                  </span>
                                )}
                                {item.dependenciesCount && item.dependenciesCount > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Layers className="w-3 h-3" />
                                    {item.dependenciesCount} {t.dependencies}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant={item.isProtected ? "outline" : "default"}
                              size="sm"
                              onClick={() => protectMutation.mutate({ id: item.id, protect: !item.isProtected })}
                              data-testid={`button-protect-${item.id}`}
                            >
                              {item.isProtected ? (
                                <>
                                  <ShieldOff className="w-4 h-4 me-1" />
                                  {t.unprotect}
                                </>
                              ) : (
                                <>
                                  <Shield className="w-4 h-4 me-1" />
                                  {t.protect}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit-logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  {t.auditLogs}
                </CardTitle>
                <CardDescription>
                  Immutable record of all deletion-related actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t.noAuditLogs}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Restore Dialog */}
        <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-green-500" />
                {t.restoreOptions}
              </DialogTitle>
              <DialogDescription>
                {selectedItem?.entityName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => restoreMutation.mutate({ id: selectedItem!.id, restoreType: "same_user" })}
                data-testid="button-restore-same-user"
              >
                <User className="w-5 h-5" />
                <div className="text-start">
                  <p className="font-medium">{t.restoreToSameUser}</p>
                  <p className="text-sm text-muted-foreground">Restore with original settings and permissions</p>
                </div>
                <ChevronRight className="w-4 h-4 ms-auto" />
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => restoreMutation.mutate({ id: selectedItem!.id, restoreType: "different_user" })}
                data-testid="button-restore-different-user"
              >
                <User className="w-5 h-5" />
                <div className="text-start">
                  <p className="font-medium">{t.restoreToDifferentUser}</p>
                  <p className="text-sm text-muted-foreground">Transfer ownership to another user</p>
                </div>
                <ChevronRight className="w-4 h-4 ms-auto" />
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => restoreMutation.mutate({ id: selectedItem!.id, restoreType: "recycle_only" })}
                data-testid="button-restore-recycle-only"
              >
                <Archive className="w-5 h-5" />
                <div className="text-start">
                  <p className="font-medium">{t.restoreToRecycleOnly}</p>
                  <p className="text-sm text-muted-foreground">Keep in recycle bin without activation</p>
                </div>
                <ChevronRight className="w-4 h-4 ms-auto" />
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => restoreMutation.mutate({ id: selectedItem!.id, restoreType: "partial" })}
                data-testid="button-restore-partial"
              >
                <Layers className="w-5 h-5" />
                <div className="text-start">
                  <p className="font-medium">{t.partialRestore}</p>
                  <p className="text-sm text-muted-foreground">Restore data or settings only</p>
                </div>
                <ChevronRight className="w-4 h-4 ms-auto" />
              </Button>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setRestoreDialogOpen(false)}>
                {t.cancel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
