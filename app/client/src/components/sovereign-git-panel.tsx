/**
 * Sovereign Git Panel | لوحة Git السيادي
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  GitBranch, GitCommit, GitPullRequest, Tag, FolderGit2, Plus, RefreshCw,
  GitMerge, Eye, Trash2, Shield, Link2, Unlink, Upload, Download, Check,
  X, Clock, AlertCircle, FileCode, Folder, Github, ExternalLink
} from "lucide-react";
import { SiReplit } from "react-icons/si";

interface Repository {
  id: string;
  internalId: string;
  name: string;
  nameAr?: string;
  description?: string;
  visibility: string;
  defaultBranch: string;
  githubUrl?: string;
  replitUrl?: string;
  syncEnabled: boolean;
  stats?: { files: number; commits: number; branches: number; size: number };
  createdAt: string;
}

interface Branch {
  id: string;
  name: string;
  isDefault: boolean;
  isProtected: boolean;
  headCommitId?: string;
}

interface Commit {
  id: string;
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  committedAt: string;
}

interface PullRequest {
  id: string;
  number: number;
  title: string;
  titleAr?: string;
  state: string;
  sourceBranch: string;
  targetBranch: string;
  authorName: string;
  isDraft: boolean;
  comments: number;
  createdAt: string;
}

interface InternalTag {
  id: string;
  name: string;
  message?: string;
  targetSha: string;
  taggerName: string;
  isRelease: boolean;
  createdAt: string;
}

interface Stats {
  totalRepos: number;
  totalBranches: number;
  totalCommits: number;
  totalPRs: number;
  openPRs: number;
  linkedGitHub: number;
  linkedReplit: number;
}

const stateColors: Record<string, string> = {
  open: "bg-green-500/10 text-green-500",
  closed: "bg-red-500/10 text-red-500",
  merged: "bg-purple-500/10 text-purple-500",
  draft: "bg-gray-500/10 text-gray-500"
};

const visibilityColors: Record<string, string> = {
  private: "bg-red-500/10 text-red-500",
  internal: "bg-yellow-500/10 text-yellow-500",
  public: "bg-green-500/10 text-green-500"
};

export function SovereignGitPanel() {
  const [activeTab, setActiveTab] = useState("repos");
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [createRepoOpen, setCreateRepoOpen] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [newRepoVisibility, setNewRepoVisibility] = useState("private");

  const { data: statsData, isLoading } = useQuery<{ data: Stats }>({
    queryKey: ["/api/git/stats"]
  });

  const { data: reposData, refetch: refetchRepos } = useQuery<{ data: Repository[] }>({
    queryKey: ["/api/git/repos"]
  });

  const { data: branchesData } = useQuery<{ data: Branch[] }>({
    queryKey: ["/api/git/repos", selectedRepo?.id, "branches"],
    enabled: !!selectedRepo
  });

  const { data: commitsData } = useQuery<{ data: Commit[] }>({
    queryKey: ["/api/git/repos", selectedRepo?.id, "commits"],
    enabled: !!selectedRepo
  });

  const { data: prsData } = useQuery<{ data: PullRequest[] }>({
    queryKey: ["/api/git/repos", selectedRepo?.id, "pulls"],
    enabled: !!selectedRepo
  });

  const { data: tagsData } = useQuery<{ data: InternalTag[] }>({
    queryKey: ["/api/git/repos", selectedRepo?.id, "tags"],
    enabled: !!selectedRepo
  });

  const createRepoMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; visibility: string }) =>
      apiRequest("POST", "/api/git/repos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/git/repos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/git/stats"] });
      setCreateRepoOpen(false);
      setNewRepoName("");
      setNewRepoDesc("");
    }
  });

  const deleteRepoMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/git/repos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/git/repos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/git/stats"] });
      setSelectedRepo(null);
    }
  });

  const mergePRMutation = useMutation({
    mutationFn: ({ repoId, number }: { repoId: string; number: number }) =>
      apiRequest("POST", `/api/git/repos/${repoId}/pulls/${number}/merge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/git/repos", selectedRepo?.id, "pulls"] });
    }
  });

  const stats = statsData?.data;
  const repos = reposData?.data || [];
  const branches = branchesData?.data || [];
  const commits = commitsData?.data || [];
  const prs = prsData?.data || [];
  const tags = tagsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="sovereign-git-panel">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderGit2 className="w-6 h-6" />
            Sovereign Git Engine
          </h2>
          <p className="text-muted-foreground">نواة الاستقلال - محرك Git الداخلي</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Github className="w-3 h-3" />
            {stats?.linkedGitHub || 0} GitHub
          </Badge>
          <Badge variant="outline" className="gap-1">
            <SiReplit className="w-3 h-3" />
            {stats?.linkedReplit || 0} Replit
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FolderGit2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalRepos || 0}</p>
                <p className="text-xs text-muted-foreground">Repositories | المستودعات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <GitBranch className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalBranches || 0}</p>
                <p className="text-xs text-muted-foreground">Branches | الفروع</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <GitCommit className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalCommits || 0}</p>
                <p className="text-xs text-muted-foreground">Commits | الالتزامات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <GitPullRequest className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.openPRs || 0}</p>
                <p className="text-xs text-muted-foreground">Open PRs | طلبات مفتوحة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Repository List */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Repositories</CardTitle>
              <Dialog open={createRepoOpen} onOpenChange={setCreateRepoOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-create-repo">
                    <Plus className="w-4 h-4 mr-1" /> New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Repository | إنشاء مستودع</DialogTitle>
                    <DialogDescription>Create a new internal repository</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        placeholder="my-project"
                        data-testid="input-repo-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={newRepoDesc}
                        onChange={(e) => setNewRepoDesc(e.target.value)}
                        placeholder="Project description..."
                        data-testid="input-repo-desc"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Visibility</label>
                      <Select value={newRepoVisibility} onValueChange={setNewRepoVisibility}>
                        <SelectTrigger data-testid="select-visibility">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="internal">Internal</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => createRepoMutation.mutate({
                        name: newRepoName,
                        description: newRepoDesc,
                        visibility: newRepoVisibility
                      })}
                      disabled={!newRepoName || createRepoMutation.isPending}
                      data-testid="button-submit-repo"
                    >
                      {createRepoMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-1" />
                      )}
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {repos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FolderGit2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No repositories</p>
                    <p className="text-sm">لا توجد مستودعات</p>
                  </div>
                ) : (
                  repos.map((repo) => (
                    <div
                      key={repo.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRepo?.id === repo.id ? 'bg-primary/10' : 'bg-muted/50 hover:bg-muted'
                      }`}
                      onClick={() => setSelectedRepo(repo)}
                      data-testid={`repo-${repo.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FolderGit2 className="w-4 h-4" />
                          <span className="font-medium">{repo.name}</span>
                        </div>
                        <Badge className={visibilityColors[repo.visibility]} variant="outline">
                          {repo.visibility}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {repo.description || repo.internalId}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {repo.githubUrl && <Github className="w-3 h-3 text-muted-foreground" />}
                        {repo.replitUrl && <SiReplit className="w-3 h-3 text-muted-foreground" />}
                        <span className="text-xs text-muted-foreground">
                          {repo.stats?.commits || 0} commits
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Repository Details */}
        <Card className="md:col-span-2">
          {!selectedRepo ? (
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center text-muted-foreground">
                <FolderGit2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Select a repository</p>
                <p className="text-sm">اختر مستودعاً للعرض</p>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FolderGit2 className="w-5 h-5" />
                      {selectedRepo.name}
                    </CardTitle>
                    <CardDescription>{selectedRepo.internalId}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedRepo.githubUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={selectedRepo.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-1" />
                          GitHub
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteRepoMutation.mutate(selectedRepo.id)}
                      data-testid="button-delete-repo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="branches" data-testid="tab-branches">
                      <GitBranch className="w-4 h-4 mr-1" />
                      Branches ({branches.length})
                    </TabsTrigger>
                    <TabsTrigger value="commits" data-testid="tab-commits">
                      <GitCommit className="w-4 h-4 mr-1" />
                      Commits ({commits.length})
                    </TabsTrigger>
                    <TabsTrigger value="prs" data-testid="tab-prs">
                      <GitPullRequest className="w-4 h-4 mr-1" />
                      PRs ({prs.length})
                    </TabsTrigger>
                    <TabsTrigger value="tags" data-testid="tab-tags">
                      <Tag className="w-4 h-4 mr-1" />
                      Tags ({tags.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="branches" className="mt-4">
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {branches.map((branch) => (
                          <div key={branch.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              <GitBranch className="w-4 h-4" />
                              <span className="font-medium">{branch.name}</span>
                              {branch.isDefault && (
                                <Badge variant="outline" className="text-xs">default</Badge>
                              )}
                              {branch.isProtected && (
                                <Shield className="w-3 h-3 text-yellow-500" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">
                              {branch.headCommitId?.substring(0, 7) || '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="commits" className="mt-4">
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {commits.map((commit) => (
                          <div key={commit.id} className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GitCommit className="w-4 h-4" />
                                <span className="font-mono text-sm">{commit.shortSha}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(commit.committedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1 truncate">{commit.message}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{commit.authorName}</span>
                              <span className="text-green-500">+{commit.additions}</span>
                              <span className="text-red-500">-{commit.deletions}</span>
                              <span>{commit.filesChanged} files</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="prs" className="mt-4">
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {prs.map((pr) => (
                          <div key={pr.id} className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <GitPullRequest className="w-4 h-4" />
                                <span className="font-medium">#{pr.number}</span>
                                <span className="truncate max-w-[200px]">{pr.title}</span>
                              </div>
                              <Badge className={stateColors[pr.state]}>{pr.state}</Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{pr.sourceBranch}</span>
                              <span>→</span>
                              <span>{pr.targetBranch}</span>
                              <span className="ml-auto">{pr.authorName}</span>
                            </div>
                            {pr.state === 'open' && (
                              <div className="flex justify-end mt-2">
                                <Button
                                  size="sm"
                                  onClick={() => mergePRMutation.mutate({ repoId: selectedRepo.id, number: pr.number })}
                                  disabled={mergePRMutation.isPending}
                                  data-testid={`merge-pr-${pr.number}`}
                                >
                                  <GitMerge className="w-4 h-4 mr-1" />
                                  Merge
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="tags" className="mt-4">
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {tags.map((tag) => (
                          <div key={tag.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              <span className="font-medium">{tag.name}</span>
                              {tag.isRelease && (
                                <Badge variant="outline" className="text-xs">release</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono">{tag.targetSha.substring(0, 7)}</span>
                              <span>{tag.taggerName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default SovereignGitPanel;
