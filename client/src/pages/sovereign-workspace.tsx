import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Plus, 
  Shield, 
  Users, 
  Activity, 
  Settings, 
  Rocket, 
  Code2, 
  Database, 
  Globe, 
  Lock, 
  Eye,
  Loader2,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  RefreshCw,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import type { 
  SovereignWorkspace, 
  SovereignWorkspaceProject,
  SovereignWorkspaceMember,
  SovereignWorkspaceAccessLog,
  SovereignPlatformType,
} from "@shared/schema";

const platformTypeLabels: Record<SovereignPlatformType, { en: string; ar: string; icon: any }> = {
  ecommerce: { en: "E-Commerce", ar: "تجارة إلكترونية", icon: Globe },
  healthcare: { en: "Healthcare", ar: "رعاية صحية", icon: Activity },
  government: { en: "Government", ar: "حكومي", icon: Building2 },
  education: { en: "Education", ar: "تعليمي", icon: FileText },
  finance: { en: "Finance", ar: "مالي", icon: Database },
  logistics: { en: "Logistics", ar: "لوجستي", icon: Activity },
  real_estate: { en: "Real Estate", ar: "عقاري", icon: Building2 },
  hospitality: { en: "Hospitality", ar: "ضيافة", icon: Building2 },
  media: { en: "Media", ar: "إعلامي", icon: Eye },
  nonprofit: { en: "Nonprofit", ar: "غير ربحي", icon: Users },
  legal: { en: "Legal", ar: "قانوني", icon: Shield },
  hr_management: { en: "HR Management", ar: "إدارة موارد بشرية", icon: Users },
  crm: { en: "CRM", ar: "إدارة علاقات عملاء", icon: Users },
  erp: { en: "ERP", ar: "تخطيط موارد", icon: Database },
  marketplace: { en: "Marketplace", ar: "سوق", icon: Globe },
  booking: { en: "Booking", ar: "حجوزات", icon: Clock },
  saas: { en: "SaaS", ar: "خدمة برمجية", icon: Code2 },
  analytics: { en: "Analytics", ar: "تحليلات", icon: Activity },
  iot: { en: "IoT", ar: "إنترنت الأشياء", icon: Settings },
  custom: { en: "Custom", ar: "مخصص", icon: Code2 },
};

const statusBadgeVariants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  draft: { variant: "secondary", color: "bg-muted" },
  building: { variant: "outline", color: "bg-yellow-500/20 text-yellow-600" },
  testing: { variant: "outline", color: "bg-blue-500/20 text-blue-600" },
  staging: { variant: "outline", color: "bg-purple-500/20 text-purple-600" },
  deploying: { variant: "outline", color: "bg-orange-500/20 text-orange-600" },
  live: { variant: "default", color: "bg-green-500/20 text-green-600" },
  maintenance: { variant: "outline", color: "bg-amber-500/20 text-amber-600" },
  suspended: { variant: "destructive", color: "bg-red-500/20 text-red-600" },
  archived: { variant: "secondary", color: "bg-gray-500/20 text-gray-600" },
};

export default function SovereignWorkspacePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("platforms");
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    code: "",
    name: "",
    nameAr: "",
    description: "",
    platformType: "custom" as SovereignPlatformType,
    category: "commercial",
  });

  const { data: workspace, isLoading: workspaceLoading, error: workspaceError } = useQuery<SovereignWorkspace>({
    queryKey: ["/api/sovereign-workspace/workspace"],
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<SovereignWorkspaceProject[]>({
    queryKey: ["/api/sovereign-workspace/projects"],
    enabled: !!workspace,
  });

  const { data: stats } = useQuery<{
    totalProjects: number;
    liveProjects: number;
    draftProjects: number;
    buildingProjects: number;
    totalMembers: number;
    activeMembers: number;
    projectsByType: Record<string, number>;
  }>({
    queryKey: ["/api/sovereign-workspace/stats"],
    enabled: !!workspace,
  });

  const { data: membersData } = useQuery<{
    owner: { id: string; username: string; email: string; fullName: string; role: string };
    members: SovereignWorkspaceMember[];
  }>({
    queryKey: ["/api/sovereign-workspace/members"],
    enabled: !!workspace,
  });

  const { data: logs = [] } = useQuery<(SovereignWorkspaceAccessLog & { user: { id: string; username: string; fullName: string } })[]>({
    queryKey: ["/api/sovereign-workspace/logs"],
    enabled: !!workspace && activeTab === "audit",
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof newProjectForm) => {
      return apiRequest("POST", "/api/sovereign-workspace/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-workspace/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-workspace/stats"] });
      setNewProjectDialogOpen(false);
      setNewProjectForm({
        code: "",
        name: "",
        nameAr: "",
        description: "",
        platformType: "custom",
        category: "commercial",
      });
      toast({
        title: "Platform Created | تم إنشاء المنصة",
        description: "New platform project has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error | خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deployProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return apiRequest("POST", `/api/sovereign-workspace/projects/${projectId}/deploy`, { environment: "production" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-workspace/projects"] });
      toast({
        title: "Deployment Started | بدأ النشر",
        description: "Platform deployment has been triggered.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed | فشل النشر",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (workspaceLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (workspaceError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Shield className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied | تم رفض الوصول</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You do not have permission to access the Sovereign Workspace. This area is restricted to platform owners and authorized staff only.
        </p>
        <p className="text-muted-foreground text-center max-w-md text-sm">
          ليس لديك صلاحية الوصول إلى مساحة العمل السيادية. هذه المنطقة مقتصرة على مالكي المنصات والموظفين المعتمدين فقط.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-workspace-title">
              {workspace?.name || "Sovereign Workspace"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {workspace?.nameAr || "مساحة العمل السيادية"} - Platform Factory
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3 w-3" />
            ISOLATED | معزولة
          </Badge>
          <Badge variant="default" className="gap-1">
            <Activity className="h-3 w-3" />
            {workspace?.status || "active"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Platforms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-platforms">{stats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">إجمالي المنصات</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Live Platforms</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-live-platforms">{stats?.liveProjects || 0}</div>
            <p className="text-xs text-muted-foreground">المنصات النشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">In Development</CardTitle>
            <Code2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-building-platforms">{(stats?.draftProjects || 0) + (stats?.buildingProjects || 0)}</div>
            <p className="text-xs text-muted-foreground">قيد التطوير</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-team-members">{stats?.totalMembers || 1}</div>
            <p className="text-xs text-muted-foreground">أعضاء الفريق</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="platforms" className="gap-2" data-testid="tab-platforms">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Platforms</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2" data-testid="tab-team">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2" data-testid="tab-audit">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Audit Log</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Platform Projects | مشاريع المنصات</h2>
              <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-platform">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Platform
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Platform | إنشاء منصة جديدة</DialogTitle>
                    <DialogDescription>
                      Define the specifications for a new sovereign platform to be generated.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="code" className="text-right">Code</Label>
                      <Input
                        id="code"
                        placeholder="INFERA-ECOM-001"
                        className="col-span-3"
                        value={newProjectForm.code}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, code: e.target.value })}
                        data-testid="input-platform-code"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name (EN)</Label>
                      <Input
                        id="name"
                        placeholder="E-Commerce Platform"
                        className="col-span-3"
                        value={newProjectForm.name}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                        data-testid="input-platform-name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nameAr" className="text-right">Name (AR)</Label>
                      <Input
                        id="nameAr"
                        placeholder="منصة تجارة إلكترونية"
                        className="col-span-3"
                        value={newProjectForm.nameAr}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, nameAr: e.target.value })}
                        data-testid="input-platform-name-ar"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">Type</Label>
                      <Select
                        value={newProjectForm.platformType}
                        onValueChange={(value) => setNewProjectForm({ ...newProjectForm, platformType: value as SovereignPlatformType })}
                      >
                        <SelectTrigger className="col-span-3" data-testid="select-platform-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(platformTypeLabels).map(([key, { en, ar }]) => (
                            <SelectItem key={key} value={key}>
                              {en} | {ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">Category</Label>
                      <Select
                        value={newProjectForm.category}
                        onValueChange={(value) => setNewProjectForm({ ...newProjectForm, category: value })}
                      >
                        <SelectTrigger className="col-span-3" data-testid="select-platform-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="commercial">Commercial | تجاري</SelectItem>
                          <SelectItem value="sovereign">Sovereign | سيادي</SelectItem>
                          <SelectItem value="internal">Internal | داخلي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Platform description..."
                        className="col-span-3"
                        value={newProjectForm.description}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                        data-testid="input-platform-description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewProjectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createProjectMutation.mutate(newProjectForm)}
                      disabled={createProjectMutation.isPending || !newProjectForm.code || !newProjectForm.name}
                      data-testid="button-confirm-create-platform"
                    >
                      {createProjectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Platform
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {projectsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="font-semibold">No Platforms Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first sovereign platform to get started.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      أنشئ أول منصة سيادية لك للبدء.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projects.map((project) => {
                  const typeInfo = platformTypeLabels[project.platformType as SovereignPlatformType] || platformTypeLabels.custom;
                  const TypeIcon = typeInfo.icon;
                  const statusInfo = statusBadgeVariants[project.deploymentStatus] || statusBadgeVariants.draft;
                  
                  return (
                    <Card key={project.id} data-testid={`card-platform-${project.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-md">
                              <TypeIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{project.name}</CardTitle>
                              <CardDescription className="text-xs">{project.nameAr}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={statusInfo.variant} className="text-xs">
                            {project.deploymentStatus}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Code:</span>
                            <code className="text-xs bg-muted px-2 py-0.5 rounded">{project.code}</code>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span>{typeInfo.en}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Version:</span>
                            <span>{project.version || "0.1.0"}</span>
                          </div>
                          {project.deploymentUrl && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">URL:</span>
                              <a 
                                href={project.deploymentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-xs truncate max-w-[150px]"
                              >
                                {project.deploymentUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 gap-2">
                        <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-${project.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          disabled={project.deploymentStatus === "deploying" || deployProjectMutation.isPending}
                          onClick={() => deployProjectMutation.mutate(project.id)}
                          data-testid={`button-deploy-${project.id}`}
                        >
                          {project.deploymentStatus === "deploying" ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Rocket className="h-4 w-4 mr-1" />
                          )}
                          Deploy
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Team Members | أعضاء الفريق</h2>
              <Button variant="outline" data-testid="button-invite-member">
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {membersData?.owner && (
                <Card data-testid="card-owner">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{membersData.owner.fullName || membersData.owner.username}</CardTitle>
                        <CardDescription className="text-xs">{membersData.owner.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="default">ROOT_OWNER | المالك الأصلي</Badge>
                  </CardContent>
                </Card>
              )}

              {membersData?.members.map((member) => (
                <Card key={member.id} data-testid={`card-member-${member.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{(member as any).user?.fullName || (member as any).user?.username || "Unknown"}</CardTitle>
                        <CardDescription className="text-xs">{(member as any).user?.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.status === "active" ? "default" : "secondary"}>
                        {member.role}
                      </Badge>
                      <Badge variant="outline">{member.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Audit Log | سجل التدقيق</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" data-testid="button-refresh-logs">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" data-testid="button-export-logs">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No audit logs yet</p>
                      <p className="text-muted-foreground text-sm">لا توجد سجلات تدقيق بعد</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 gap-4" data-testid={`log-entry-${log.id}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${log.success ? "bg-green-500/10" : "bg-red-500/10"}`}>
                            {log.success ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {log.user?.fullName || log.user?.username} - {log.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.resource} {log.resourceId && `(${log.resourceId.substring(0, 8)}...)`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {log.createdAt ? format(new Date(log.createdAt), "MMM d, yyyy HH:mm") : "-"}
                          </p>
                          {log.ipAddress && (
                            <p className="text-xs text-muted-foreground">{log.ipAddress}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Workspace Settings | إعدادات مساحة العمل</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">General Settings</CardTitle>
                  <CardDescription>Basic workspace configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Max Platforms</p>
                      <p className="text-xs text-muted-foreground">الحد الأقصى للمنصات</p>
                    </div>
                    <Badge variant="outline">{workspace?.settings?.maxPlatforms || 50}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Max Members</p>
                      <p className="text-xs text-muted-foreground">الحد الأقصى للأعضاء</p>
                    </div>
                    <Badge variant="outline">{workspace?.settings?.maxMembers || 10}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Security Settings</CardTitle>
                  <CardDescription>Access and audit configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Require Approval for Deploy</p>
                      <p className="text-xs text-muted-foreground">طلب الموافقة للنشر</p>
                    </div>
                    <Badge variant={workspace?.settings?.requireApprovalForDeploy ? "default" : "secondary"}>
                      {workspace?.settings?.requireApprovalForDeploy ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Auto Audit Log</p>
                      <p className="text-xs text-muted-foreground">سجل التدقيق التلقائي</p>
                    </div>
                    <Badge variant={workspace?.settings?.autoAuditLog !== false ? "default" : "secondary"}>
                      {workspace?.settings?.autoAuditLog !== false ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Notify on Access</p>
                      <p className="text-xs text-muted-foreground">إشعار عند الوصول</p>
                    </div>
                    <Badge variant={workspace?.settings?.notifyOnAccess ? "default" : "secondary"}>
                      {workspace?.settings?.notifyOnAccess ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
