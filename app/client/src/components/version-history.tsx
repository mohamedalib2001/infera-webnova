import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { History, RotateCcw, Plus, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProjectVersion } from "@shared/schema";

interface VersionHistoryProps {
  projectId: string;
  onRestore: (html: string, css: string, js: string) => void;
}

export function VersionHistory({ projectId, onRestore }: VersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const { data: versions, isLoading } = useQuery<ProjectVersion[]>({
    queryKey: ["/api/projects", projectId, "versions"],
    enabled: !!projectId && open,
  });

  const createVersionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/versions`, {
        description: description || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "versions"] });
      setDescription("");
      toast({ title: "Version saved!" });
    },
    onError: () => {
      toast({ title: "Failed to save version", variant: "destructive" });
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/restore/${versionId}`);
      return response.json();
    },
    onSuccess: (data) => {
      onRestore(data.htmlCode, data.cssCode, data.jsCode);
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      setOpen(false);
      toast({ title: "Version restored!" });
    },
    onError: () => {
      toast({ title: "Failed to restore version", variant: "destructive" });
    },
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-version-history">
          <History className="h-4 w-4" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>Save snapshots and restore previous versions</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Version description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="input-version-description"
            />
            <Button
              onClick={() => createVersionMutation.mutate()}
              disabled={createVersionMutation.isPending}
              size="icon"
              data-testid="button-save-version"
            >
              {createVersionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : versions && versions.length > 0 ? (
              <div className="space-y-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-3 rounded-md border bg-card hover-elevate"
                    data-testid={`version-item-${version.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {version.versionNumber}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {version.description || "No description"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(version.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => restoreVersionMutation.mutate(version.id)}
                      disabled={restoreVersionMutation.isPending}
                      data-testid={`button-restore-version-${version.id}`}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No versions saved yet. Click the + button to save the current version.
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
