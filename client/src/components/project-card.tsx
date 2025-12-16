import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ExternalLink, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const formattedDate = project.updatedAt
    ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: ar })
    : "";

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
            Open
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
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
            <p className="text-xs text-muted-foreground mt-2">
              {formattedDate}
            </p>
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
                Edit
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
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
