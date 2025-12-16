import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, Sparkles } from "lucide-react";

interface EmptyStateProps {
  type: "projects" | "chat";
  onAction?: () => void;
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  if (type === "projects") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30 flex items-center justify-center mb-6">
          <FolderOpen className="h-10 w-10 text-violet-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Start building your first website with AI assistance. Just describe what you want!
        </p>
        <Button onClick={onAction} className="gap-2" data-testid="button-create-first-project">
          <Plus className="h-4 w-4" />
          Create New Project
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30 flex items-center justify-center mb-6">
        <Sparkles className="h-10 w-10 text-violet-500" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
      <p className="text-muted-foreground max-w-sm">
        Describe the website you want to build and AI will help you create it
      </p>
    </div>
  );
}
