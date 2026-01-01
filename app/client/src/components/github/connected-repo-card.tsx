import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderGit2, ExternalLink, FileCode, Lock, Globe, Loader2, GitBranch } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

interface SyncSettings {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  autoSync: boolean;
  lastSyncAt: string | null;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
}

export function ConnectedRepoCard() {
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const { toast } = useToast();

  const { data: settingsData } = useQuery<{ success: boolean; settings: SyncSettings | null }>({
    queryKey: ["/api/github/sync-settings"],
  });

  const { data: reposData } = useQuery<{ success: boolean; repos: GitHubRepo[] }>({
    queryKey: ["/api/github/repos"],
  });

  const currentSettings = settingsData?.settings;
  const repos = reposData?.repos || [];
  const connectedRepo = currentSettings 
    ? repos.find(r => r.full_name === `${currentSettings.owner}/${currentSettings.repo}`)
    : null;

  const toggleVisibility = useMutation({
    mutationFn: async ({ owner, repo, isPrivate }: { owner: string; repo: string; isPrivate: boolean }) => {
      return apiRequest("PATCH", `/api/github/repos/${owner}/${repo}`, { isPrivate });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/github/repos"] });
      toast({
        title: isRtl ? "تم التحديث" : "Updated",
        description: variables.isPrivate 
          ? (isRtl ? "المستودع خاص الآن" : "Repository is now private")
          : (isRtl ? "المستودع عام الآن" : "Repository is now public"),
      });
    },
    onError: (error: any) => {
      toast({
        title: isRtl ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!currentSettings || !connectedRepo) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderGit2 className="h-5 w-5" />
          {isRtl ? "المستودع المتصل" : "Connected Repository"}
        </CardTitle>
        <CardDescription>
          {isRtl ? "تفاصيل المستودع المتصل" : "Details of the connected repository"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{currentSettings.owner}/{currentSettings.repo}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <GitBranch className="h-3 w-3 mr-1" />
                  {currentSettings.branch}
                </Badge>
                {connectedRepo.private ? (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    {isRtl ? "خاص" : "Private"}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    {isRtl ? "عام" : "Public"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild data-testid="button-view-github">
              <a href={connectedRepo.html_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {isRtl ? "عرض في GitHub" : "View on GitHub"}
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild data-testid="button-browse-code">
              <a href={`${connectedRepo.html_url}/tree/${currentSettings.branch}`} target="_blank" rel="noopener noreferrer">
                <FileCode className="h-4 w-4 mr-2" />
                {isRtl ? "تصفح الكود" : "Browse Code"}
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toggleVisibility.mutate({
                owner: currentSettings.owner,
                repo: currentSettings.repo,
                isPrivate: !connectedRepo.private,
              })}
              disabled={toggleVisibility.isPending}
              data-testid="button-toggle-visibility"
            >
              {toggleVisibility.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : connectedRepo.private ? (
                <Globe className="h-4 w-4 mr-2" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              {connectedRepo.private ? (isRtl ? "جعل عام" : "Make Public") : (isRtl ? "جعل خاص" : "Make Private")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}