import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface EmptyStateProps {
  type: "projects" | "chat";
  onAction?: () => void;
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const { t } = useLanguage();

  if (type === "projects") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30 flex items-center justify-center mb-6">
          <FolderOpen className="h-10 w-10 text-violet-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t("empty.noProjects")}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {t("empty.noProjectsDesc")}
        </p>
        <Button onClick={onAction} className="gap-2" data-testid="button-create-first-project">
          <Plus className="h-4 w-4" />
          {t("empty.createProject")}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30 flex items-center justify-center mb-6">
        <Sparkles className="h-10 w-10 text-violet-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{t("builder.startConversation")}</h3>
      <p className="text-muted-foreground max-w-sm">
        {t("builder.startDescription")}
      </p>
    </div>
  );
}
