import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Palette,
  RefreshCw,
  History,
  RotateCcw,
  Check,
  Clock,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  Shield,
  Zap
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { platformIconsRegistry, type PlatformIcon as RegistryIcon } from "@/lib/platform-icons-registry";

type ViewMode = "grid" | "list";

interface IconVersion {
  id: string;
  platformIconId: string;
  platformId: string;
  versionNumber: number;
  versionLabel: string | null;
  iconFiles: any;
  primaryIconPath: string;
  generationPrompt: string | null;
  generationStatus: string;
  isActive: boolean;
  isCurrent: boolean;
  restoredFrom: string | null;
  createdAt: string;
}

interface RegenerationRequest {
  id: string;
  platformIconId: string;
  platformId: string;
  reason: string | null;
  customPrompt: string | null;
  status: string;
  requestedAt: string;
}

const translations = {
  en: {
    title: "Dynamic Icon Management",
    subtitle: "Sovereign Platform Icon Version Control",
    description: "Manage, regenerate, and restore platform icons with full version history",
    allCategories: "All Categories",
    sovereign: "Sovereign",
    subsidiary: "Subsidiary",
    viewGrid: "Grid View",
    viewList: "List View",
    regenerate: "Regenerate",
    viewHistory: "Version History",
    restore: "Restore",
    setCurrent: "Set as Current",
    currentVersion: "Current Version",
    noVersions: "No versions available",
    regenerationReason: "Reason for regeneration",
    customPrompt: "Custom prompt (optional)",
    submit: "Submit Request",
    cancel: "Cancel",
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
    version: "Version",
    createdAt: "Created",
    restoredFrom: "Restored from",
    totalVersions: "Total Versions",
    totalRegenerations: "Total Regenerations",
    iconDetails: "Icon Details",
    platformId: "Platform ID",
    category: "Category",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    regenerationHistory: "Regeneration History",
    noRegenerations: "No regeneration requests",
    successRegenerate: "Regeneration request submitted",
    successRestore: "Icon version restored successfully",
    successSetCurrent: "Current version updated",
    errorGeneric: "An error occurred",
    loading: "Loading...",
  },
  ar: {
    title: "إدارة الأيقونات الديناميكية",
    subtitle: "نظام تحكم إصدارات أيقونات المنصة السيادية",
    description: "إدارة وإعادة توليد واستعادة أيقونات المنصات مع سجل الإصدارات الكامل",
    allCategories: "جميع التصنيفات",
    sovereign: "سيادي",
    subsidiary: "فرعي",
    viewGrid: "عرض شبكة",
    viewList: "عرض قائمة",
    regenerate: "إعادة التوليد",
    viewHistory: "سجل الإصدارات",
    restore: "استعادة",
    setCurrent: "تعيين كحالي",
    currentVersion: "الإصدار الحالي",
    noVersions: "لا توجد إصدارات",
    regenerationReason: "سبب إعادة التوليد",
    customPrompt: "موجه مخصص (اختياري)",
    submit: "إرسال الطلب",
    cancel: "إلغاء",
    pending: "قيد الانتظار",
    processing: "جاري المعالجة",
    completed: "مكتمل",
    failed: "فشل",
    version: "الإصدار",
    createdAt: "تاريخ الإنشاء",
    restoredFrom: "مستعاد من",
    totalVersions: "إجمالي الإصدارات",
    totalRegenerations: "إجمالي إعادة التوليد",
    iconDetails: "تفاصيل الأيقونة",
    platformId: "معرف المنصة",
    category: "التصنيف",
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    regenerationHistory: "سجل إعادة التوليد",
    noRegenerations: "لا توجد طلبات إعادة توليد",
    successRegenerate: "تم إرسال طلب إعادة التوليد",
    successRestore: "تم استعادة إصدار الأيقونة بنجاح",
    successSetCurrent: "تم تحديث الإصدار الحالي",
    errorGeneric: "حدث خطأ",
    loading: "جاري التحميل...",
  }
};

function IconCard({ 
  icon, 
  isRtl, 
  t, 
  onRegenerate, 
  onViewHistory 
}: { 
  icon: RegistryIcon; 
  isRtl: boolean; 
  t: typeof translations.en;
  onRegenerate: (icon: RegistryIcon) => void;
  onViewHistory: (icon: RegistryIcon) => void;
}) {
  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-icon-${icon.platformId}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center flex-shrink-0 border">
            <img 
              src={icon.iconPath} 
              alt={isRtl ? icon.nameAr : icon.name}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-icon.png';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {isRtl ? icon.nameAr : icon.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate mb-2">
              {icon.platformId}
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {icon.category === "sovereign" 
                  ? (isRtl ? t.sovereign : "Sovereign") 
                  : (isRtl ? t.subsidiary : "Subsidiary")}
              </Badge>
              {icon.isRoot && (
                <Badge className="text-xs bg-amber-500/20 text-amber-600 border-amber-500/30">
                  ROOT
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewHistory(icon)}
            data-testid={`button-history-${icon.platformId}`}
          >
            <History className="w-3 h-3 mr-1" />
            {t.viewHistory}
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onRegenerate(icon)}
            data-testid={`button-regenerate-${icon.platformId}`}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            {t.regenerate}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VersionHistoryDialog({ 
  icon, 
  isOpen, 
  onClose, 
  isRtl, 
  t 
}: {
  icon: RegistryIcon | null;
  isOpen: boolean;
  onClose: () => void;
  isRtl: boolean;
  t: typeof translations.en;
}) {
  const { toast } = useToast();

  const { data: versions = [], isLoading } = useQuery<IconVersion[]>({
    queryKey: ['/api/sovereign/platform-icons/platform', icon?.platformId, 'versions'],
    enabled: !!icon && isOpen,
  });

  const { data: regenerations = [] } = useQuery<RegenerationRequest[]>({
    queryKey: ['/api/sovereign/icon-regeneration-requests'],
    enabled: isOpen,
  });

  const restoreMutation = useMutation({
    mutationFn: async ({ platformIconId, versionId }: { platformIconId: string; versionId: string }) => {
      return apiRequest(`/api/sovereign/platform-icons/${platformIconId}/restore/${versionId}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({ title: t.successRestore });
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign/platform-icons'] });
    },
    onError: () => {
      toast({ title: t.errorGeneric, variant: 'destructive' });
    },
  });

  const setCurrentMutation = useMutation({
    mutationFn: async ({ platformIconId, versionId }: { platformIconId: string; versionId: string }) => {
      return apiRequest(`/api/sovereign/platform-icons/${platformIconId}/set-current/${versionId}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({ title: t.successSetCurrent });
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign/platform-icons'] });
    },
    onError: () => {
      toast({ title: t.errorGeneric, variant: 'destructive' });
    },
  });

  if (!icon) return null;

  const iconRegenerations = regenerations.filter(r => r.platformId === icon.platformId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {t.viewHistory}: {isRtl ? icon.nameAr : icon.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 border-b bg-muted/30">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {t.iconDetails}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <img 
                  src={icon.iconPath} 
                  alt={icon.name}
                  className="w-16 h-16 object-contain rounded-md border bg-muted"
                />
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">{t.platformId}:</span> {icon.platformId}</p>
                  <p><span className="text-muted-foreground">{t.category}:</span> {icon.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 border-b bg-muted/30">
              <CardTitle className="text-sm">{t.viewHistory}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : versions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">{t.noVersions}</p>
              ) : (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div 
                      key={version.id} 
                      className={`p-3 rounded-md border ${version.isCurrent ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                            <span className="text-sm font-bold">v{version.versionNumber}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {version.versionLabel || `${t.version} ${version.versionNumber}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(version.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {version.isCurrent && (
                            <Badge className="bg-primary/20 text-primary">
                              <Check className="w-3 h-3 mr-1" />
                              {t.currentVersion}
                            </Badge>
                          )}
                          {version.restoredFrom && (
                            <Badge variant="outline" className="text-xs">
                              <RotateCcw className="w-3 h-3 mr-1" />
                              {t.restoredFrom}
                            </Badge>
                          )}
                          {!version.isCurrent && (
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setCurrentMutation.mutate({ 
                                  platformIconId: version.platformIconId, 
                                  versionId: version.id 
                                })}
                                disabled={setCurrentMutation.isPending}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => restoreMutation.mutate({ 
                                  platformIconId: version.platformIconId, 
                                  versionId: version.id 
                                })}
                                disabled={restoreMutation.isPending}
                              >
                                <RotateCcw className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 border-b bg-muted/30">
              <CardTitle className="text-sm">{t.regenerationHistory}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {iconRegenerations.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">{t.noRegenerations}</p>
              ) : (
                <div className="space-y-2">
                  {iconRegenerations.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                      <div>
                        <p className="text-sm">{req.reason || "No reason provided"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(req.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        req.status === 'completed' ? 'default' :
                        req.status === 'failed' ? 'destructive' :
                        'secondary'
                      }>
                        {req.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {req.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                        {req.status === 'completed' && <Check className="w-3 h-3 mr-1" />}
                        {req.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {t[req.status as keyof typeof t] || req.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RegenerateDialog({
  icon,
  isOpen,
  onClose,
  isRtl,
  t
}: {
  icon: RegistryIcon | null;
  isOpen: boolean;
  onClose: () => void;
  isRtl: boolean;
  t: typeof translations.en;
}) {
  const [reason, setReason] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const { toast } = useToast();

  const regenerateMutation = useMutation({
    mutationFn: async (data: { platformIconId: string; reason: string; customPrompt?: string }) => {
      return apiRequest(`/api/sovereign/platform-icons/${data.platformIconId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: data.reason, customPrompt: data.customPrompt }),
      });
    },
    onSuccess: () => {
      toast({ title: t.successRegenerate });
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign/icon-regeneration-requests'] });
      onClose();
      setReason("");
      setCustomPrompt("");
    },
    onError: () => {
      toast({ title: t.errorGeneric, variant: 'destructive' });
    },
  });

  if (!icon) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            {t.regenerate}: {isRtl ? icon.nameAr : icon.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
            <img 
              src={icon.iconPath} 
              alt={icon.name}
              className="w-12 h-12 object-contain rounded-md border"
            />
            <div>
              <p className="font-medium text-sm">{isRtl ? icon.nameAr : icon.name}</p>
              <p className="text-xs text-muted-foreground">{icon.platformId}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t.regenerationReason}</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isRtl ? "أدخل سبب إعادة التوليد..." : "Enter reason for regeneration..."}
              className="min-h-[80px]"
              data-testid="input-regeneration-reason"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t.customPrompt}</label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={isRtl ? "موجه مخصص لتوليد الأيقونة..." : "Custom prompt for icon generation..."}
              className="min-h-[80px]"
              data-testid="input-custom-prompt"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel">
              {t.cancel}
            </Button>
            <Button 
              onClick={() => regenerateMutation.mutate({
                platformIconId: icon.platformId,
                reason,
                customPrompt: customPrompt || undefined
              })}
              disabled={regenerateMutation.isPending || !reason.trim()}
              data-testid="button-submit-regenerate"
            >
              {regenerateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t.submit}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function IconManagement() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const t = translations[language] || translations.en;
  
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedIcon, setSelectedIcon] = useState<RegistryIcon | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);

  const icons = platformIconsRegistry;
  const filteredIcons = categoryFilter === "all" 
    ? icons 
    : icons.filter(icon => icon.category === categoryFilter);

  const sovereignCount = icons.filter(i => i.category === "sovereign").length;
  const subsidiaryCount = icons.filter(i => i.category === "subsidiary").length;

  const handleViewHistory = (icon: RegistryIcon) => {
    setSelectedIcon(icon);
    setHistoryDialogOpen(true);
  };

  const handleRegenerate = (icon: RegistryIcon) => {
    setSelectedIcon(icon);
    setRegenerateDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-8">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Badge className="mb-4 bg-white/10 text-white border-white/20">
                  <Palette className="w-4 h-4 mr-2" />
                  {t.subtitle}
                </Badge>
                <CardTitle className="text-3xl font-bold mb-3">
                  {t.title}
                </CardTitle>
                <p className="text-sm text-white/70 max-w-xl mx-auto">
                  {t.description}
                </p>
              </motion.div>
            </CardHeader>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sovereignCount}</p>
                <p className="text-xs text-muted-foreground">{t.sovereign}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subsidiaryCount}</p>
                <p className="text-xs text-muted-foreground">{t.subsidiary}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{icons.length}</p>
                <p className="text-xs text-muted-foreground">Total Icons</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
                <SelectValue placeholder={t.allCategories} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allCategories}</SelectItem>
                <SelectItem value="sovereign">{t.sovereign}</SelectItem>
                <SelectItem value="subsidiary">{t.subsidiary}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            <Button 
              variant={viewMode === "grid" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </section>

        <section className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-3"
        }>
          {filteredIcons.map((icon) => (
            viewMode === "grid" ? (
              <IconCard 
                key={icon.platformId}
                icon={icon}
                isRtl={isRtl}
                t={t}
                onRegenerate={handleRegenerate}
                onViewHistory={handleViewHistory}
              />
            ) : (
              <Card key={icon.platformId} className="overflow-hidden hover-elevate" data-testid={`row-icon-${icon.platformId}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={icon.iconPath} 
                        alt={isRtl ? icon.nameAr : icon.name}
                        className="w-10 h-10 object-contain rounded-md border bg-muted"
                      />
                      <div>
                        <p className="font-medium text-sm">{isRtl ? icon.nameAr : icon.name}</p>
                        <p className="text-xs text-muted-foreground">{icon.platformId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {icon.category}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewHistory(icon)}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRegenerate(icon)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </section>

        <VersionHistoryDialog
          icon={selectedIcon}
          isOpen={historyDialogOpen}
          onClose={() => setHistoryDialogOpen(false)}
          isRtl={isRtl}
          t={t}
        />

        <RegenerateDialog
          icon={selectedIcon}
          isOpen={regenerateDialogOpen}
          onClose={() => setRegenerateDialogOpen(false)}
          isRtl={isRtl}
          t={t}
        />
      </div>
    </div>
  );
}
