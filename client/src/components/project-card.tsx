import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, ExternalLink, Trash2, Edit, User, Calendar, Crown, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@shared/schema";
import { formatDistanceToNow, format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useLanguage } from "@/hooks/use-language";

// Extended project type with owner info
interface ProjectWithOwner extends Project {
  owner?: {
    id: string;
    name: string;
    email?: string | null;
    avatar?: string | null;
    role: string;
    subscriptionExpiry?: string | null;
    createdAt?: string | null;
  } | null;
}

interface ProjectCardProps {
  project: ProjectWithOwner;
  onOpen: (project: Project) => void;
  onDelete: (project: Project) => void;
}

// Role/subscription type labels
const ROLE_LABELS: Record<string, { en: string; ar: string; color: string }> = {
  free: { en: "Free", ar: "مجاني", color: "bg-slate-500" },
  basic: { en: "Basic", ar: "أساسي", color: "bg-blue-500" },
  pro: { en: "Pro", ar: "احترافي", color: "bg-violet-500" },
  enterprise: { en: "Enterprise", ar: "مؤسسي", color: "bg-amber-500" },
  sovereign: { en: "Sovereign", ar: "سيادي", color: "bg-emerald-500" },
  owner: { en: "Owner", ar: "المالك", color: "bg-rose-500" },
};

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const { language } = useLanguage();
  const dateLocale = language === "ar" ? ar : enUS;
  
  const formattedDate = project.updatedAt
    ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: dateLocale })
    : "";
    
  const createdDate = project.createdAt
    ? format(new Date(project.createdAt), "yyyy/MM/dd", { locale: dateLocale })
    : "";
    
  // Get subscription label
  const roleInfo = project.owner?.role ? ROLE_LABELS[project.owner.role] || ROLE_LABELS.free : ROLE_LABELS.free;
  const roleLabel = language === "ar" ? roleInfo.ar : roleInfo.en;
  
  // Format subscription expiry
  const expiryDate = project.owner?.subscriptionExpiry
    ? format(new Date(project.owner.subscriptionExpiry), "yyyy/MM/dd", { locale: dateLocale })
    : null;

  // Translations
  const t = {
    open: language === "ar" ? "فتح" : "Open",
    edit: language === "ar" ? "تعديل" : "Edit",
    delete: language === "ar" ? "حذف" : "Delete",
    owner: language === "ar" ? "المالك" : "Owner",
    subscription: language === "ar" ? "الاشتراك" : "Subscription",
    created: language === "ar" ? "تاريخ الإنشاء" : "Created",
    expires: language === "ar" ? "ينتهي في" : "Expires",
    noOwner: language === "ar" ? "بدون مالك" : "No owner",
  };

  return (
    <Card
      className="group overflow-visible cursor-pointer transition-all duration-200 hover-elevate"
      onClick={() => onOpen(project)}
      data-testid={`card-project-${project.id}`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30 relative overflow-hidden">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-violet-400 to-pink-400 opacity-50" />
          </div>
        )}
        
        {/* Subscription badge */}
        {project.owner && (
          <div className="absolute top-2 right-2">
            <Badge className={`${roleInfo.color} text-white text-xs`}>
              <Crown className="h-3 w-3 mr-1" />
              {roleLabel}
            </Badge>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(project);
            }}
            data-testid={`button-open-project-${project.id}`}
          >
            <ExternalLink className="h-4 w-4" />
            {t.open}
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate" data-testid={`text-project-name-${project.id}`}>
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {project.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-project-menu-${project.id}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(project);
                }}
                data-testid={`menu-edit-project-${project.id}`}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t.edit}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project);
                }}
                className="text-destructive focus:text-destructive"
                data-testid={`menu-delete-project-${project.id}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Owner Info Section */}
        <div className="border-t pt-3 space-y-2">
          {project.owner ? (
            <>
              {/* Owner name with avatar */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={project.owner.avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {project.owner.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1 text-sm">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium truncate" data-testid={`text-owner-name-${project.id}`}>
                    {project.owner.name}
                  </span>
                </div>
              </div>
              
              {/* Platform dates */}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {createdDate && (
                  <div className="flex items-center gap-1" data-testid={`text-created-date-${project.id}`}>
                    <Calendar className="h-3 w-3" />
                    <span>{t.created}: {createdDate}</span>
                  </div>
                )}
                {expiryDate && (
                  <div className="flex items-center gap-1" data-testid={`text-expiry-date-${project.id}`}>
                    <Clock className="h-3 w-3" />
                    <span>{t.expires}: {expiryDate}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{t.noOwner}</span>
            </div>
          )}
        </div>
        
        {/* Last updated */}
        <p className="text-xs text-muted-foreground">
          {formattedDate}
        </p>
      </div>
    </Card>
  );
}
