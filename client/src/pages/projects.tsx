import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProjectCard } from "@/components/project-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { Plus, AlertTriangle, Globe, Server, Database, Users, Trash2, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";

interface PlatformDetails {
  domains: { id: string; name: string }[];
  collaborators: number;
  filesCount: number;
  hasDatabase: boolean;
  hasBackend: boolean;
}

export default function Projects() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [platformDetails, setPlatformDetails] = useState<PlatformDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Fetch platform details when deletion dialog opens
  useEffect(() => {
    if (projectToDelete) {
      setIsLoadingDetails(true);
      fetch(`/api/projects/${projectToDelete.id}/deletion-info`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setPlatformDetails(data);
          setIsLoadingDetails(false);
        })
        .catch(() => {
          setPlatformDetails(null);
          setIsLoadingDetails(false);
        });
    } else {
      setPlatformDetails(null);
    }
  }, [projectToDelete]);

  const deleteMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("DELETE", `/api/projects/${projectId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ 
        title: language === "ar" ? "تم حذف المنصة بنجاح" : "Platform deleted successfully" 
      });
      setProjectToDelete(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: language === "ar" ? "فشل حذف المنصة" : "Failed to delete platform",
        description: error.message,
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
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-6 w-6" />
              {t.deleteTitle}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p className="text-base">{t.deleteDescription}</p>
                
                {projectToDelete && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{t.platformName}:</span>
                      <span className="font-bold text-foreground">{projectToDelete.name}</span>
                    </div>
                    
                    {isLoadingDetails ? (
                      <div className="text-center py-2 text-muted-foreground text-sm">
                        {t.loading}
                      </div>
                    ) : platformDetails && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {t.linkedDomains}:
                          </span>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {platformDetails.domains.length > 0 ? (
                              platformDetails.domains.map(d => (
                                <Badge key={d.id} variant="outline" className="text-xs">
                                  {d.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">{t.noDomains}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {t.collaborators}:
                          </span>
                          <Badge variant="secondary">{platformDetails.collaborators}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            {t.database}:
                          </span>
                          <Badge variant={platformDetails.hasDatabase ? "default" : "outline"}>
                            {platformDetails.hasDatabase ? t.hasDatabase : t.noDatabase}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Server className="w-4 h-4" />
                            {t.backend}:
                          </span>
                          <Badge variant={platformDetails.hasBackend ? "default" : "outline"}>
                            {platformDetails.hasBackend ? t.hasBackend : t.noBackend}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                <p className="text-destructive font-medium text-center py-2 bg-destructive/5 rounded-md">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  {t.finalWarning}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel data-testid="button-cancel-delete">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending || isLoadingDetails}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteMutation.isPending ? t.deleting : t.confirmDelete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
