import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProjectCard } from "@/components/project-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, AlertTriangle } from "lucide-react";
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

  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      await apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ 
        title: language === "ar" ? "تم حذف المنصة بنجاح" : "Platform deleted successfully" 
      });
      setProjectToDelete(null);
    },
    onError: () => {
      toast({ 
        title: language === "ar" ? "فشل حذف المنصة" : "Failed to delete platform", 
        variant: "destructive" 
      });
      setProjectToDelete(null);
    },
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
      deleteTitle: "تأكيد حذف المنصة",
      deleteDescription: "هل أنت متأكد من حذف المنصة؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة بها.",
      deleteWarning: "تحذير: سيتم حذف جميع الملفات والإعدادات والبيانات نهائياً.",
      cancel: "إلغاء",
      confirmDelete: "نعم، حذف المنصة",
      deleting: "جاري الحذف...",
    },
    en: {
      title: "My Sovereign Platforms",
      subtitle: "Manage and operate your autonomous platforms",
      newPlatform: "New Platform",
      deleteTitle: "Confirm Platform Deletion",
      deleteDescription: "Are you sure you want to delete this platform? This action cannot be undone and all associated data will be permanently removed.",
      deleteWarning: "Warning: All files, settings, and data will be permanently deleted.",
      cancel: "Cancel",
      confirmDelete: "Yes, Delete Platform",
      deleting: "Deleting...",
    }
  };

  const t = translations[language] || translations.en;

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

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t.deleteTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>{t.deleteDescription}</p>
              {projectToDelete && (
                <p className="font-medium text-foreground">
                  {language === "ar" ? "المنصة:" : "Platform:"} {projectToDelete.name}
                </p>
              )}
              <p className="text-destructive text-sm">{t.deleteWarning}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? t.deleting : t.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
