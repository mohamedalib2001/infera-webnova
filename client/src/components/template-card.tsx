import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Template } from "@shared/schema";

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  return (
    <Card
      className="group overflow-visible cursor-pointer transition-all duration-200 hover-elevate"
      data-testid={`card-template-${template.id}`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 relative overflow-hidden">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-400 opacity-50" />
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onUse(template);
            }}
            data-testid={`button-use-template-${template.id}`}
          >
            Use Template
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate" data-testid={`text-template-name-${template.id}`}>
              {template.name}
            </h3>
            {template.description && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {template.description}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0">
            {template.category}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
