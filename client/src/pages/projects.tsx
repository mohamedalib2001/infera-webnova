import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Folder, ExternalLink, Calendar } from "lucide-react";
import { Link } from "wouter";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
}

export default function Projects() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const t = {
    ar: {
      title: "مشاريعي",
      subtitle: "إدارة وعرض جميع مشاريعك",
      newProject: "مشروع جديد",
      noProjects: "لا توجد مشاريع بعد",
      startBuilding: "ابدأ ببناء مشروعك الأول",
      status: "الحالة",
      created: "تاريخ الإنشاء",
      view: "عرض",
    },
    en: {
      title: "My Projects",
      subtitle: "Manage and view all your projects",
      newProject: "New Project",
      noProjects: "No projects yet",
      startBuilding: "Start building your first project",
      status: "Status",
      created: "Created",
      view: "View",
    },
  };

  const txt = t[language];

  return (
    <div className="p-6 max-w-6xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-projects-title">
            {txt.title}
          </h1>
          <p className="text-muted-foreground mt-1">{txt.subtitle}</p>
        </div>
        <Link href="/user-builder">
          <Button data-testid="button-new-project">
            <Plus className="h-4 w-4" />
            <span className={isRtl ? "mr-2" : "ml-2"}>{txt.newProject}</span>
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover-elevate" data-testid={`card-project-${project.id}`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </div>
                {project.description && (
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">{project.status}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString(isRtl ? "ar" : "en")}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" data-testid={`button-view-${project.id}`}>
                  <ExternalLink className="h-4 w-4" />
                  <span className={isRtl ? "mr-2" : "ml-2"}>{txt.view}</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{txt.noProjects}</h3>
            <p className="text-muted-foreground mb-4">{txt.startBuilding}</p>
            <Link href="/user-builder">
              <Button data-testid="button-start-building">
                <Plus className="h-4 w-4" />
                <span className={isRtl ? "mr-2" : "ml-2"}>{txt.newProject}</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
