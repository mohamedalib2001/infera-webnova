import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Share2, Copy, Link, Trash2, Loader2, ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ShareLink } from "@shared/schema";

interface ShareDialogProps {
  projectId: string;
}

export function ShareDialog({ projectId }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: shares, isLoading } = useQuery<ShareLink[]>({
    queryKey: ["/api/projects", projectId, "shares"],
    enabled: !!projectId && open,
  });

  const createShareMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/share`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "shares"] });
      toast({ title: "Share link created!" });
    },
    onError: () => {
      toast({ title: "Failed to create share link", variant: "destructive" });
    },
  });

  const deleteShareMutation = useMutation({
    mutationFn: async (shareId: string) => {
      await apiRequest("DELETE", `/api/shares/${shareId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "shares"] });
      toast({ title: "Share link removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove share link", variant: "destructive" });
    },
  });

  const getShareUrl = (shareCode: string) => {
    return `${window.location.origin}/preview/${shareCode}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Link copied to clipboard!" });
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString();
  };

  const activeShares = shares?.filter((s) => s.isActive === "true") || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-share">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>Create shareable links for others to view your project</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={() => createShareMutation.mutate()}
            disabled={createShareMutation.isPending}
            className="w-full gap-2"
            data-testid="button-create-share"
          >
            {createShareMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Link className="h-4 w-4" />
            )}
            Create New Share Link
          </Button>

          <ScrollArea className="h-[250px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeShares.length > 0 ? (
              <div className="space-y-3">
                {activeShares.map((share) => (
                  <div
                    key={share.id}
                    className="p-3 rounded-md border bg-card"
                    data-testid={`share-item-${share.id}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {share.expiresAt ? `Expires ${formatDate(share.expiresAt)}` : "No expiry"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={getShareUrl(share.shareCode)}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(getShareUrl(share.shareCode))}
                        data-testid={`button-copy-${share.id}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(getShareUrl(share.shareCode), "_blank")}
                        data-testid={`button-open-${share.id}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteShareMutation.mutate(share.id)}
                        disabled={deleteShareMutation.isPending}
                        data-testid={`button-delete-${share.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No share links yet. Create one to share your project.
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
