import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProjectCard } from "@/components/project-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecureDeletionDialog } from "@/components/secure-deletion-dialog";
import { Plus, RotateCcw, FolderOpen, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

export default function Projects() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const handleOpenProject = (project: Project) => {
    setLocation(`/builder/${project.id}`);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteMutation.mutate(projectToDelete.id);
    }
  };

  const translations = {
    ar: {
      title: "منصاتي السيادية",
      subtitle: "إدارة وتشغيل منصاتك المستقلة",
      newPlatform: "منصة جديدة",
      deleteTitle: "تحذير: حذف نهائي للمنصة",
      deleteDescription: "أنت على وشك حذف هذه المنصة نهائياً. هذا الإجراء لا يمكن التراجع عنه!",
      deleteWarning: "جميع البيانات التالية سيتم حذفها بشكل دائم:",
      platformName: "اسم المنصة",
      linkedDomains: "النطاقات المرتبطة",
      collaborators: "المتعاونون",
      database: "قاعدة البيانات",
      backend: "الخادم الخلفي",
      noDomains: "لا توجد نطاقات مرتبطة",
      hasDatabase: "متصلة",
      noDatabase: "غير متصلة",
      hasBackend: "مُعد",
      noBackend: "غير مُعد",
      finalWarning: "هل أنت متأكد تماماً من رغبتك في الحذف؟",
      cancel: "لا، إلغاء الحذف",
      confirmDelete: "نعم، حذف نهائياً",
      deleting: "جاري الحذف...",
      loading: "جاري تحميل تفاصيل المنصة...",
    },
    en: {
      title: "My Sovereign Platforms",
      subtitle: "Manage and operate your autonomous platforms",
      newPlatform: "New Platform",
      deleteTitle: "Warning: Permanent Platform Deletion",
      deleteDescription: "You are about to permanently delete this platform. This action cannot be undone!",
      deleteWarning: "The following data will be permanently deleted:",
      platformName: "Platform Name",
      linkedDomains: "Linked Domains",
      collaborators: "Collaborators",
      database: "Database",
      backend: "Backend Server",
      noDomains: "No linked domains",
      hasDatabase: "Connected",
      noDatabase: "Not connected",
      hasBackend: "Configured",
      noBackend: "Not configured",
      finalWarning: "Are you absolutely sure you want to delete?",
      cancel: "No, Cancel Deletion",
      confirmDelete: "Yes, Delete Permanently",
      deleting: "Deleting...",
      loading: "Loading platform details...",
    }
  };

  const t = translations[language] || translations.en;

  const recycleBinTranslations = {
    ar: {
      recycleBin: "سلة المحذوفات",
      activeProjects: "المنصات النشطة",
      noDeleted: "لا توجد منصات محذوفة",
      restore: "استعادة",
      permanentDelete: "حذف نهائي",
      deletedAt: "تاريخ الحذف",
      restoreSuccess: "تم استعادة المنصة بنجاح",
      restoreFailed: "فشل في استعادة المنصة",
    },
    en: {
      recycleBin: "Recycle Bin",
      activeProjects: "Active Platforms",
      noDeleted: "No deleted platforms",
      restore: "Restore",
      permanentDelete: "Delete Permanently",
      deletedAt: "Deleted At",
      restoreSuccess: "Platform restored successfully",
      restoreFailed: "Failed to restore platform",
    }
  };

  const rt = recycleBinTranslations[language] || recycleBinTranslations.en;

  const { data: deletedProjects, isLoading: isLoadingDeleted } = useQuery<Project[]>({
    queryKey: ["/api/projects/recycle-bin"],
  });

  const restoreMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/restore`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to restore");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects/recycle-bin"] });
      toast({ title: rt.restoreSuccess });
    },
    onError: (error: Error) => {
      toast({ 
        title: rt.restoreFailed,
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-projects-title">{t.title}</h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Button
          onClick={() => setLocation("/builder")}
          className="gap-2"
          data-testid="button-new-project-page"
        >
          <Plus className="h-4 w-4" />
          {t.newPlatform}
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="gap-2" data-testid="tab-active-projects">
            <FolderOpen className="h-4 w-4" />
            {rt.activeProjects}
            {projects && projects.length > 0 && (
              <Badge variant="secondary" className="ml-1">{projects.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="deleted" className="gap-2" data-testid="tab-recycle-bin">
            <Archive className="h-4 w-4" />
            {rt.recycleBin}
            {deletedProjects && deletedProjects.length > 0 && (
              <Badge variant="outline" className="ml-1">{deletedProjects.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={handleOpenProject}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          ) : (
            <EmptyState type="projects" onAction={() => setLocation("/builder")} />
          )}
        </TabsContent>

        <TabsContent value="deleted">
          {isLoadingDeleted ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : deletedProjects && deletedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deletedProjects.map((project) => (
                <div
                  key={project.id}
                  className="border rounded-lg p-4 bg-muted/30 space-y-3"
                  data-testid={`card-deleted-project-${project.id}`}
                >
                  <div className="flex items-center gap-2">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">{project.name}</h3>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreMutation.mutate(project.id)}
                      disabled={restoreMutation.isPending}
                      className="gap-2"
                      data-testid={`button-restore-${project.id}`}
                    >
                      <RotateCcw className="h-4 w-4" />
                      {rt.restore}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{rt.noDeleted}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SecureDeletionDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
        entity={projectToDelete ? {
          id: projectToDelete.id,
          name: projectToDelete.name,
          type: projectToDelete.templateType || 'custom',
          status: projectToDelete.status,
          description: projectToDelete.description || undefined,
          createdAt: projectToDelete.createdAt,
        } : null}
        entityType="platform"
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
          queryClient.invalidateQueries({ queryKey: ["/api/projects/recycle-bin"] });
        }}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}
