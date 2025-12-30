/**
 * Repository Version Control Component - مكون إدارة التغييرات والتاريخ للمستودعات
 * 
 * واجهة متكاملة لـ:
 * - عرض تاريخ التعديلات
 * - مقارنة النسخ
 * - الرجوع لأي مرحلة
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  History,
  GitBranch,
  GitCommit,
  RotateCcw,
  Camera,
  Clock,
  FileCode,
  Plus,
  Minus,
  RefreshCw,
  ChevronRight,
  ArrowLeftRight,
  Tag,
  User,
  Calendar,
  BarChart3,
  TrendingUp
} from "lucide-react";

interface RepoVersionControlProps {
  repositoryId: string;
  repositoryName: string;
}

interface DiffLine {
  type: 'add' | 'delete' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

interface DiffResult {
  filePath: string;
  originalContent: string | null;
  currentContent: string | null;
  hunks: DiffHunk[];
  stats: {
    additions: number;
    deletions: number;
    changes: number;
  };
  status: 'added' | 'modified' | 'deleted' | 'unchanged';
}

export function RepoVersionControl({ repositoryId, repositoryName }: RepoVersionControlProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("timeline");
  const [snapshotName, setSnapshotName] = useState("");
  const [snapshotDescription, setSnapshotDescription] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch timeline
  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['/api/versions/timeline', repositoryId],
    enabled: !!repositoryId
  });

  // Fetch snapshots
  const { data: snapshotsData, isLoading: snapshotsLoading, refetch: refetchSnapshots } = useQuery({
    queryKey: ['/api/versions/snapshots', repositoryId],
    enabled: !!repositoryId
  });

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/versions/stats', repositoryId],
    enabled: !!repositoryId && activeTab === "stats"
  });

  // Compare with original
  const { data: originalDiffData, isLoading: originalDiffLoading, refetch: refetchOriginalDiff } = useQuery({
    queryKey: ['/api/versions/compare-original', repositoryId],
    enabled: !!repositoryId && activeTab === "original"
  });

  // Create snapshot mutation
  const createSnapshotMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/versions/snapshot/${repositoryId}`, {
        method: "POST",
        body: JSON.stringify({ name: snapshotName, description: snapshotDescription })
      });
    },
    onSuccess: () => {
      toast({ title: "Snapshot created | تم إنشاء اللقطة" });
      setShowCreateDialog(false);
      setSnapshotName("");
      setSnapshotDescription("");
      refetchSnapshots();
      queryClient.invalidateQueries({ queryKey: ['/api/versions/timeline', repositoryId] });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create snapshot", description: error.message, variant: "destructive" });
    }
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (snapshotId: string) => {
      return apiRequest(`/api/versions/rollback/${repositoryId}`, {
        method: "POST",
        body: JSON.stringify({ snapshotId })
      });
    },
    onSuccess: (data: any) => {
      toast({ 
        title: "Rollback successful | تم الرجوع بنجاح",
        description: `Restored ${data.data?.filesRestored || 0} files`
      });
      refetchSnapshots();
      queryClient.invalidateQueries({ queryKey: ['/api/versions/timeline', repositoryId] });
    },
    onError: (error: any) => {
      toast({ title: "Rollback failed", description: error.message, variant: "destructive" });
    }
  });

  const timeline = timelineData?.data || [];
  const snapshots = snapshotsData?.data || [];
  const stats = statsData?.data;
  const originalDiff = originalDiffData?.data || [];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'commit': return <GitCommit className="w-4 h-4" />;
      case 'snapshot': return <Camera className="w-4 h-4" />;
      case 'rollback': return <RotateCcw className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'commit': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'snapshot': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rollback': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'modified': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'deleted': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderDiffHunk = (hunk: DiffHunk) => {
    return (
      <div className="font-mono text-xs">
        <div className="bg-muted/50 px-2 py-1 text-muted-foreground">
          @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
        </div>
        {hunk.lines.map((line, i) => (
          <div
            key={i}
            className={`px-2 py-0.5 flex ${
              line.type === 'add' ? 'bg-green-500/10 text-green-700 dark:text-green-300' :
              line.type === 'delete' ? 'bg-red-500/10 text-red-700 dark:text-red-300' :
              'text-muted-foreground'
            }`}
          >
            <span className="w-8 text-right pr-2 select-none opacity-50">
              {line.oldLineNumber || ' '}
            </span>
            <span className="w-8 text-right pr-2 select-none opacity-50">
              {line.newLineNumber || ' '}
            </span>
            <span className="w-4 select-none">
              {line.type === 'add' ? '+' : line.type === 'delete' ? '-' : ' '}
            </span>
            <span className="flex-1 whitespace-pre">{line.content}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5" />
          <h2 className="font-semibold">{repositoryName}</h2>
          <Badge variant="outline">Version History</Badge>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-create-snapshot">
              <Camera className="w-4 h-4 mr-1" />
              Create Snapshot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Snapshot</DialogTitle>
              <DialogDescription>
                Save the current state of your project as a checkpoint you can return to later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  placeholder="v1.0 Release"
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  data-testid="input-snapshot-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  placeholder="What changes are included in this snapshot?"
                  value={snapshotDescription}
                  onChange={(e) => setSnapshotDescription(e.target.value)}
                  data-testid="input-snapshot-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => createSnapshotMutation.mutate()}
                disabled={!snapshotName || createSnapshotMutation.isPending}
                data-testid="button-confirm-snapshot"
              >
                {createSnapshotMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-1" />
                )}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 justify-start w-fit">
          <TabsTrigger value="timeline" data-testid="tab-timeline">
            <Clock className="w-4 h-4 mr-1" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="snapshots" data-testid="tab-snapshots">
            <Camera className="w-4 h-4 mr-1" />
            Snapshots
          </TabsTrigger>
          <TabsTrigger value="original" data-testid="tab-original">
            <ArrowLeftRight className="w-4 h-4 mr-1" />
            Compare Original
          </TabsTrigger>
          <TabsTrigger value="stats" data-testid="tab-stats">
            <BarChart3 className="w-4 h-4 mr-1" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="flex-1 mt-0 p-4 pt-2 overflow-auto">
          {timelineLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : timeline.length > 0 ? (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {timeline.map((event: any, i: number) => (
                  <div key={event.id || i} className="relative pl-10">
                    <div className={`absolute left-2 p-1.5 rounded-full ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={getEventColor(event.type)}>
                                {event.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(event.timestamp)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm">{event.description}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="w-3 h-3" />
                            {event.author}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <History className="w-12 h-12 mb-4 opacity-50" />
              <p>No history yet</p>
              <p className="text-sm">Changes will appear here as you work</p>
            </div>
          )}
        </TabsContent>

        {/* Snapshots Tab */}
        <TabsContent value="snapshots" className="flex-1 mt-0 p-4 pt-2 overflow-auto">
          {snapshotsLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : snapshots.length > 0 ? (
            <div className="space-y-4">
              {snapshots.map((snapshot: any) => (
                <Card key={snapshot.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{snapshot.snapshotName}</h3>
                          {snapshot.isOriginal && (
                            <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                              Original
                            </Badge>
                          )}
                          {snapshot.tags?.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {snapshot.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {snapshot.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(snapshot.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {snapshot.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileCode className="w-3 h-3" />
                            {snapshot.files?.length || 0} files
                          </span>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" data-testid={`button-rollback-${snapshot.id}`}>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Rollback
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rollback to this snapshot?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will restore all files to the state saved in "{snapshot.snapshotName}". 
                              A backup of your current state will be created automatically.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => rollbackMutation.mutate(snapshot.id)}
                              disabled={rollbackMutation.isPending}
                            >
                              {rollbackMutation.isPending ? "Rolling back..." : "Rollback"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Camera className="w-12 h-12 mb-4 opacity-50" />
              <p>No snapshots yet</p>
              <p className="text-sm">Create a snapshot to save your current state</p>
            </div>
          )}
        </TabsContent>

        {/* Compare with Original Tab */}
        <TabsContent value="original" className="flex-1 mt-0 p-4 pt-2 overflow-auto">
          {originalDiffLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : originalDiff.length > 0 ? (
            <div className="space-y-4">
              {/* Summary */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-green-500/10 text-green-500">
                        {originalDiff.filter((d: DiffResult) => d.status === 'added').length} added
                      </Badge>
                      <Badge className="bg-yellow-500/10 text-yellow-500">
                        {originalDiff.filter((d: DiffResult) => d.status === 'modified').length} modified
                      </Badge>
                      <Badge className="bg-red-500/10 text-red-500">
                        {originalDiff.filter((d: DiffResult) => d.status === 'deleted').length} deleted
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => refetchOriginalDiff()}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* File diffs */}
              {originalDiff.map((diff: DiffResult) => (
                <Card key={diff.filePath}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4" />
                        <CardTitle className="text-sm font-medium">{diff.filePath}</CardTitle>
                        <Badge className={getStatusColor(diff.status)}>
                          {diff.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-500 flex items-center gap-1">
                          <Plus className="w-3 h-3" />
                          {diff.stats.additions}
                        </span>
                        <span className="text-red-500 flex items-center gap-1">
                          <Minus className="w-3 h-3" />
                          {diff.stats.deletions}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-80 border rounded-md overflow-hidden">
                      {diff.hunks.map((hunk, i) => (
                        <div key={i}>
                          {renderDiffHunk(hunk)}
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <ArrowLeftRight className="w-12 h-12 mb-4 opacity-50" />
              <p>No changes from original</p>
              <p className="text-sm">Your code matches the original Replit import</p>
            </div>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="flex-1 mt-0 p-4 pt-2 overflow-auto">
          {statsLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GitCommit className="w-4 h-4" />
                      <span className="text-sm">Total Versions</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{stats.totalVersions}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Camera className="w-4 h-4" />
                      <span className="text-sm">Snapshots</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{stats.totalSnapshots}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-green-500">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Lines Added</span>
                    </div>
                    <p className="text-2xl font-bold mt-1 text-green-500">+{stats.totalAdditions}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-red-500">
                      <Minus className="w-4 h-4" />
                      <span className="text-sm">Lines Removed</span>
                    </div>
                    <p className="text-2xl font-bold mt-1 text-red-500">-{stats.totalDeletions}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Most Changed Files */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Most Changed Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.mostChangedFiles?.length > 0 ? (
                    <div className="space-y-2">
                      {stats.mostChangedFiles.map((file: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-mono">{file.path}</span>
                          </div>
                          <Badge variant="secondary">{file.changes} changes</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No file changes recorded yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentActivity?.length > 0 ? (
                    <div className="flex items-end gap-1 h-24">
                      {stats.recentActivity.map((day: any, i: number) => {
                        const maxChanges = Math.max(...stats.recentActivity.map((d: any) => d.changes));
                        const height = maxChanges > 0 ? (day.changes / maxChanges) * 100 : 0;
                        return (
                          <div
                            key={i}
                            className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors"
                            style={{ height: `${Math.max(height, 4)}%` }}
                            title={`${day.date}: ${day.changes} changes`}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No activity recorded yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
              <p>No statistics available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
