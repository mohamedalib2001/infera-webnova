import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { SiGithub } from "react-icons/si";
import {
  Upload,
  Folder,
  FileCode,
  Lock,
  Globe,
  Loader2,
  Crown,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Package
} from "lucide-react";

interface FilesCountResponse {
  success: boolean;
  totalFiles: number;
  byDirectory: Record<string, number>;
  excludedPatterns: string[];
}

export function PlatformSyncCard() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [repoName, setRepoName] = useState("infera-webnova");
  const [isPrivate, setIsPrivate] = useState(true);
  const [commitMessage, setCommitMessage] = useState("");
  const [includeAll, setIncludeAll] = useState(true);
  
  const isOwner = user?.role === "owner" || user?.role === "admin" || user?.email === "mohamed.ali.b2001@gmail.com";

  const t = {
    ar: {
      title: "مزامنة المنصة الكاملة",
      subtitle: "رفع جميع ملفات المنصة إلى GitHub",
      ownerOnly: "للمالك فقط",
      repoName: "اسم المستودع",
      private: "مستودع خاص",
      public: "مستودع عام",
      commitMessage: "رسالة التحديث (اختياري)",
      files: "ملف",
      folders: "مجلدات",
      sync: "مزامنة المنصة",
      syncing: "جاري الرفع...",
      preview: "معاينة الملفات",
      cancel: "إلغاء",
      confirm: "تأكيد المزامنة",
      success: "تمت المزامنة بنجاح!",
      error: "فشلت المزامنة",
      excluded: "الملفات المستثناة",
      loading: "جاري التحميل...",
      includeAll: "مزامنة كاملة (كل الملفات)",
      includeAllDesc: "رفع جميع الملفات بدون أي استثناء"
    },
    en: {
      title: "Full Platform Sync",
      subtitle: "Upload all platform files to GitHub",
      ownerOnly: "Owner Only",
      repoName: "Repository Name",
      private: "Private Repository",
      public: "Public Repository",
      commitMessage: "Commit Message (optional)",
      files: "files",
      folders: "folders",
      sync: "Sync Platform",
      syncing: "Uploading...",
      preview: "Preview Files",
      cancel: "Cancel",
      confirm: "Confirm Sync",
      success: "Sync successful!",
      error: "Sync failed",
      excluded: "Excluded Files",
      loading: "Loading...",
      includeAll: "Full Sync (all files)",
      includeAllDesc: "Upload all files without any exclusions"
    }
  };

  const text = isRtl ? t.ar : t.en;

  const { data: filesCount, isLoading: countLoading, refetch: refetchCount } = useQuery<FilesCountResponse>({
    queryKey: ["/api/github/platform-files-count"],
    enabled: dialogOpen,
  });

  const syncMutation = useMutation({
    mutationFn: async (data: { repoName: string; isPrivate: boolean; commitMessage?: string; includeAll?: boolean }) => {
      const res = await apiRequest("POST", "/api/github/sync-platform", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: text.success,
        description: data.message,
      });
      setDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: text.error,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSync = () => {
    syncMutation.mutate({
      repoName,
      isPrivate,
      commitMessage: commitMessage || undefined,
      includeAll
    });
  };

  if (!isOwner) return null;

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{text.title}</CardTitle>
              <CardDescription>{text.subtitle}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-amber-500/50 text-amber-600">
            <Crown className="h-3 w-3 mr-1" />
            {text.ownerOnly}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2" data-testid="button-open-platform-sync">
              <Upload className="h-4 w-4" />
              {text.sync}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir={isRtl ? "rtl" : "ltr"}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SiGithub className="h-5 w-5" />
                {text.title}
              </DialogTitle>
              <DialogDescription>{text.subtitle}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{text.repoName}</Label>
                <Input
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="infera-webnova"
                  data-testid="input-repo-name"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  {isPrivate ? text.private : text.public}
                </Label>
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                  data-testid="switch-private"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {text.includeAll}
                  </Label>
                  <Switch
                    checked={includeAll}
                    onCheckedChange={setIncludeAll}
                    data-testid="switch-include-all"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{text.includeAllDesc}</p>
              </div>

              <div className="space-y-2">
                <Label>{text.commitMessage}</Label>
                <Input
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Update INFERA WebNova Platform"
                  data-testid="input-commit-message"
                />
              </div>

              {countLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">{text.loading}</span>
                </div>
              ) : filesCount && (
                <div className="space-y-3 p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      {text.files}
                    </span>
                    <Badge variant="secondary">{filesCount.totalFiles}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {Object.entries(filesCount.byDirectory).slice(0, 6).map(([dir, count]) => (
                      <div key={dir} className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Folder className="h-3 w-3" />
                          {dir}
                        </span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel-sync">
                {text.cancel}
              </Button>
              <Button 
                onClick={handleSync} 
                disabled={syncMutation.isPending || !repoName}
                data-testid="button-confirm-sync"
              >
                {syncMutation.isPending ? (
                  <>
                    <Loader2 className={`h-4 w-4 animate-spin ${isRtl ? "ml-2" : "mr-2"}`} />
                    {text.syncing}
                  </>
                ) : (
                  <>
                    <Upload className={`h-4 w-4 ${isRtl ? "ml-2" : "mr-2"}`} />
                    {text.confirm}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
