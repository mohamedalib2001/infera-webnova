import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Folder,
  Code2,
  FileCode,
  Globe,
  Trash2,
  ExternalLink,
  Loader2,
  Terminal,
  Sparkles,
  Layout,
} from "lucide-react";
import type { DevProject } from "@shared/schema";

export default function IDEProjects() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    projectType: "nodejs",
  });

  const t = {
    ar: {
      title: "بيئة التطوير السحابية",
      subtitle: "منصة تطوير متكاملة مع دعم AI - شبيهة بـ Replit",
      newProject: "مشروع جديد",
      projectName: "اسم المشروع",
      description: "الوصف",
      projectType: "نوع المشروع",
      create: "إنشاء",
      cancel: "إلغاء",
      open: "فتح",
      delete: "حذف",
      noProjects: "لا توجد مشاريع بعد",
      createFirst: "أنشئ أول مشروع تطوير",
      nodejs: "Node.js",
      python: "Python",
      html: "HTML/CSS/JS",
      react: "React",
      fullstack: "Full Stack",
      running: "يعمل",
      stopped: "متوقف",
      loading: "جاري التحميل...",
      projectCreated: "تم إنشاء المشروع",
      projectDeleted: "تم حذف المشروع",
      features: [
        "محرر Monaco احترافي",
        "شجرة ملفات كاملة",
        "تشغيل فوري مع Hot Reload",
        "دعم AI للبرمجة",
        "معاينة مباشرة",
        "نشر بنقرة واحدة",
      ],
    },
    en: {
      title: "Cloud IDE",
      subtitle: "Full development platform with AI support - Replit-like",
      newProject: "New Project",
      projectName: "Project Name",
      description: "Description",
      projectType: "Project Type",
      create: "Create",
      cancel: "Cancel",
      open: "Open",
      delete: "Delete",
      noProjects: "No projects yet",
      createFirst: "Create your first development project",
      nodejs: "Node.js",
      python: "Python",
      html: "HTML/CSS/JS",
      react: "React",
      fullstack: "Full Stack",
      running: "Running",
      stopped: "Stopped",
      loading: "Loading...",
      projectCreated: "Project created",
      projectDeleted: "Project deleted",
      features: [
        "Professional Monaco editor",
        "Full file tree",
        "Instant run with Hot Reload",
        "AI coding support",
        "Live preview",
        "One-click deploy",
      ],
    },
  };

  const txt = t[language];

  const { data: projects = [], isLoading } = useQuery<DevProject[]>({
    queryKey: ["/api/dev-projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: typeof newProject) => apiRequest("POST", "/api/dev-projects", data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects"] });
      toast({ title: txt.projectCreated });
      setIsDialogOpen(false);
      setNewProject({ name: "", description: "", projectType: "nodejs" });
      // Navigate to the new project
      setLocation(`/ide/${data.id}`);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/dev-projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dev-projects"] });
      toast({ title: txt.projectDeleted });
    },
  });

  const getProjectIcon = (type: string) => {
    switch (type) {
      case "nodejs":
        return <Terminal className="w-6 h-6 text-green-500" />;
      case "python":
        return <FileCode className="w-6 h-6 text-blue-500" />;
      case "html":
        return <Globe className="w-6 h-6 text-orange-500" />;
      case "react":
        return <Code2 className="w-6 h-6 text-cyan-500" />;
      case "fullstack":
        return <Layout className="w-6 h-6 text-purple-500" />;
      default:
        return <Folder className="w-6 h-6" />;
    }
  };

  const getProjectTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      nodejs: txt.nodejs,
      python: txt.python,
      html: txt.html,
      react: txt.react,
      fullstack: txt.fullstack,
    };
    return typeMap[type] || type;
  };

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                  <Code2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{txt.title}</h1>
                  <p className="text-muted-foreground">{txt.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                data-testid="button-language-toggle"
              >
                <Globe className="w-4 h-4" />
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-new-project">
                    <Plus className="w-4 h-4 ml-2" />
                    {txt.newProject}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{txt.newProject}</DialogTitle>
                    <DialogDescription>{txt.subtitle}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{txt.projectName}</Label>
                      <Input
                        id="name"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        placeholder={language === "ar" ? "مشروعي الجديد" : "My New Project"}
                        data-testid="input-project-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">{txt.description}</Label>
                      <Input
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        placeholder={language === "ar" ? "وصف المشروع" : "Project description"}
                        data-testid="input-project-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{txt.projectType}</Label>
                      <Select
                        value={newProject.projectType}
                        onValueChange={(v) => setNewProject({ ...newProject, projectType: v })}
                      >
                        <SelectTrigger data-testid="select-project-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nodejs">{txt.nodejs}</SelectItem>
                          <SelectItem value="python">{txt.python}</SelectItem>
                          <SelectItem value="html">{txt.html}</SelectItem>
                          <SelectItem value="react">{txt.react}</SelectItem>
                          <SelectItem value="fullstack">{txt.fullstack}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end mt-6">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        {txt.cancel}
                      </Button>
                      <Button
                        onClick={() => createProjectMutation.mutate(newProject)}
                        disabled={!newProject.name || createProjectMutation.isPending}
                        data-testid="button-create-project"
                      >
                        {createProjectMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                        {txt.create}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Features Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {txt.features.map((feature, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="mr-2">{txt.loading}</span>
          </div>
        ) : projects.length === 0 ? (
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Code2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{txt.noProjects}</h3>
              <p className="text-muted-foreground">{txt.createFirst}</p>
              <Button onClick={() => setIsDialogOpen(true)} data-testid="button-create-first">
                <Plus className="w-4 h-4 ml-2" />
                {txt.newProject}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover-elevate transition-all" data-testid={`card-project-${project.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">{getProjectIcon(project.projectType)}</div>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>{getProjectTypeName(project.projectType)}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={project.status === "running" ? "default" : "secondary"}>
                    {project.status === "running" ? txt.running : txt.stopped}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => setLocation(`/ide/${project.id}`)}
                      data-testid={`button-open-${project.id}`}
                    >
                      <ExternalLink className="w-4 h-4 ml-1" />
                      {txt.open}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (confirm(language === "ar" ? "هل تريد حذف هذا المشروع؟" : "Delete this project?")) {
                          deleteProjectMutation.mutate(project.id);
                        }
                      }}
                      data-testid={`button-delete-${project.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
