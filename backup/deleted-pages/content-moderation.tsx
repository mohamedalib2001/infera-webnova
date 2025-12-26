import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, ShieldAlert, ShieldCheck, ShieldX, Search, Scan, AlertTriangle,
  Clock, User, FileWarning, CheckCircle2, XCircle, Eye, Lock, Unlock,
  RefreshCw, Filter, MoreVertical, Calendar, Activity, BarChart3
} from "lucide-react";
import type { Project, ContentViolation } from "@shared/schema";

export default function ContentModeration() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [quarantineDialogOpen, setQuarantineDialogOpen] = useState(false);
  const [quarantineReason, setQuarantineReason] = useState("");
  const [scanningProjectId, setScanningProjectId] = useState<string | null>(null);

  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.username === "mohamedalib2001";

  const t = {
    title: language === "ar" ? "مراقبة المحتوى" : "Content Moderation",
    subtitle: language === "ar" ? "فحص وإدارة محتوى المنصات" : "Scan and manage platform content",
    allPlatforms: language === "ar" ? "جميع المنصات" : "All Platforms",
    quarantined: language === "ar" ? "المحجوزة" : "Quarantined",
    healthy: language === "ar" ? "السليمة" : "Healthy",
    atRisk: language === "ar" ? "في خطر" : "At Risk",
    search: language === "ar" ? "بحث..." : "Search...",
    scanAll: language === "ar" ? "فحص الكل" : "Scan All",
    scan: language === "ar" ? "فحص" : "Scan",
    scanning: language === "ar" ? "جاري الفحص..." : "Scanning...",
    quarantine: language === "ar" ? "حجز" : "Quarantine",
    release: language === "ar" ? "إطلاق" : "Release",
    view: language === "ar" ? "عرض" : "View",
    owner: language === "ar" ? "المالك" : "Owner",
    score: language === "ar" ? "النتيجة" : "Score",
    lastScan: language === "ar" ? "آخر فحص" : "Last Scan",
    violations: language === "ar" ? "الانتهاكات" : "Violations",
    noViolations: language === "ar" ? "لا يوجد انتهاكات" : "No violations",
    quarantineConfirm: language === "ar" ? "تأكيد الحجز" : "Confirm Quarantine",
    quarantineDesc: language === "ar" ? "سيتم حجز هذه المنصة ومنع الوصول إليها" : "This platform will be quarantined and access will be blocked",
    reason: language === "ar" ? "السبب" : "Reason",
    cancel: language === "ar" ? "إلغاء" : "Cancel",
    confirm: language === "ar" ? "تأكيد" : "Confirm",
    accessDenied: language === "ar" ? "الوصول مرفوض" : "Access Denied",
    ownerOnly: language === "ar" ? "هذه الصفحة للمالك فقط" : "This page is for owner only",
    stats: language === "ar" ? "الإحصائيات" : "Statistics",
    total: language === "ar" ? "الإجمالي" : "Total",
    clean: language === "ar" ? "نظيف" : "Clean",
    flagged: language === "ar" ? "محتجز" : "Flagged",
    pending: language === "ar" ? "معلق" : "Pending",
  };

  // Fetch all projects for moderation (owner only)
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/content-moderation/projects"],
    enabled: isOwner,
  });

  // Scan project mutation
  const scanMutation = useMutation({
    mutationFn: async (projectId: string) => {
      setScanningProjectId(projectId);
      return apiRequest(`/api/content-moderation/scan/${projectId}`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-moderation/projects"] });
      toast({ title: language === "ar" ? "تم الفحص" : "Scan Complete" });
      setScanningProjectId(null);
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشل الفحص" : "Scan Failed", variant: "destructive" });
      setScanningProjectId(null);
    },
  });

  // Quarantine mutation
  const quarantineMutation = useMutation({
    mutationFn: async ({ projectId, reason }: { projectId: string; reason: string }) => {
      return apiRequest(`/api/content-moderation/quarantine/${projectId}`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-moderation/projects"] });
      toast({ title: language === "ar" ? "تم الحجز" : "Quarantined" });
      setQuarantineDialogOpen(false);
      setSelectedProject(null);
      setQuarantineReason("");
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشل الحجز" : "Quarantine Failed", variant: "destructive" });
    },
  });

  // Release mutation
  const releaseMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return apiRequest(`/api/content-moderation/release/${projectId}`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content-moderation/projects"] });
      toast({ title: language === "ar" ? "تم الإطلاق" : "Released" });
    },
    onError: () => {
      toast({ title: language === "ar" ? "فشل الإطلاق" : "Release Failed", variant: "destructive" });
    },
  });

  // Access denied for non-owners
  if (!isOwner) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <ShieldX className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">{t.accessDenied}</h2>
            <p className="text-muted-foreground">{t.ownerOnly}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter projects
  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quarantinedProjects = filteredProjects.filter(p => p.isQuarantined);
  const healthyProjects = filteredProjects.filter(p => !p.isQuarantined && (p.contentScore ?? 100) >= 80);
  const atRiskProjects = filteredProjects.filter(p => !p.isQuarantined && (p.contentScore ?? 100) < 80);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 50) return "secondary";
    return "destructive";
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const violations = (project.contentViolations as ContentViolation[]) || [];
    const score = project.contentScore ?? 100;
    const isScanning = scanningProjectId === project.id;

    return (
      <Card className={project.isQuarantined ? "border-destructive/50 bg-destructive/5" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {project.isQuarantined ? (
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                ) : score >= 80 ? (
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <Shield className="h-5 w-5 text-yellow-500" />
                )}
                <h3 className="font-semibold truncate" data-testid={`text-project-name-${project.id}`}>
                  {project.name}
                </h3>
                {project.isQuarantined && (
                  <Badge variant="destructive" className="text-xs">
                    {t.quarantined}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {project.description || "-"}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>{t.score}:</span>
                  <Badge variant={getScoreBadge(score)} className="text-xs">
                    {score}/100
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <FileWarning className="h-3 w-3" />
                  <span>{violations.length} {t.violations}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(project.lastContentScan)}</span>
                </div>
              </div>

              {project.isQuarantined && project.quarantineReason && (
                <div className="mt-3 p-2 bg-destructive/10 rounded-md">
                  <p className="text-xs text-destructive">
                    <strong>{t.reason}:</strong> {project.quarantineReason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => scanMutation.mutate(project.id)}
                disabled={isScanning}
                data-testid={`button-scan-${project.id}`}
              >
                {isScanning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Scan className="h-4 w-4" />
                )}
                <span className="ml-1">{isScanning ? t.scanning : t.scan}</span>
              </Button>

              {project.isQuarantined ? (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => releaseMutation.mutate(project.id)}
                  disabled={releaseMutation.isPending}
                  data-testid={`button-release-${project.id}`}
                >
                  <Unlock className="h-4 w-4" />
                  <span className="ml-1">{t.release}</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedProject(project);
                    setQuarantineDialogOpen(true);
                  }}
                  data-testid={`button-quarantine-${project.id}`}
                >
                  <Lock className="h-4 w-4" />
                  <span className="ml-1">{t.quarantine}</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Shield className="h-7 w-7 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
              data-testid="input-search"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{projects.length}</p>
              <p className="text-xs text-muted-foreground">{t.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <ShieldCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{healthyProjects.length}</p>
              <p className="text-xs text-muted-foreground">{t.clean}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/10">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{atRiskProjects.length}</p>
              <p className="text-xs text-muted-foreground">{t.atRisk}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{quarantinedProjects.length}</p>
              <p className="text-xs text-muted-foreground">{t.quarantined}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">
            {t.allPlatforms} ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="quarantined" data-testid="tab-quarantined">
            {t.quarantined} ({quarantinedProjects.length})
          </TabsTrigger>
          <TabsTrigger value="healthy" data-testid="tab-healthy">
            {t.healthy} ({healthyProjects.length})
          </TabsTrigger>
          <TabsTrigger value="at-risk" data-testid="tab-at-risk">
            {t.atRisk} ({atRiskProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{language === "ar" ? "لا توجد منصات" : "No platforms found"}</p>
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="quarantined" className="mt-4">
          <div className="grid gap-4">
            {quarantinedProjects.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
                  <p>{language === "ar" ? "لا توجد منصات محجوزة" : "No quarantined platforms"}</p>
                </CardContent>
              </Card>
            ) : (
              quarantinedProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="healthy" className="mt-4">
          <div className="grid gap-4">
            {healthyProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="at-risk" className="mt-4">
          <div className="grid gap-4">
            {atRiskProjects.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
                  <p>{language === "ar" ? "جميع المنصات سليمة" : "All platforms are healthy"}</p>
                </CardContent>
              </Card>
            ) : (
              atRiskProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quarantine Dialog */}
      <Dialog open={quarantineDialogOpen} onOpenChange={setQuarantineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              {t.quarantineConfirm}
            </DialogTitle>
            <DialogDescription>{t.quarantineDesc}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.reason}</label>
              <Textarea
                value={quarantineReason}
                onChange={(e) => setQuarantineReason(e.target.value)}
                placeholder={language === "ar" ? "أدخل سبب الحجز..." : "Enter quarantine reason..."}
                className="mt-1"
                data-testid="input-quarantine-reason"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setQuarantineDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedProject && quarantineReason) {
                  quarantineMutation.mutate({
                    projectId: selectedProject.id,
                    reason: quarantineReason,
                  });
                }
              }}
              disabled={!quarantineReason || quarantineMutation.isPending}
              data-testid="button-confirm-quarantine"
            >
              {t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
