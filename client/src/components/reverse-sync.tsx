/**
 * Reverse Sync Component - مكون المزامنة العكسية
 * 
 * UI for managing bidirectional sync with Replit
 * واجهة إدارة المزامنة ثنائية الاتجاه مع Replit
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  RefreshCw,
  Upload,
  Download,
  Settings,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileCode,
  Plus,
  Minus,
  Edit,
  Unlink,
  Link,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Ban
} from 'lucide-react';

interface SyncConfig {
  repositoryId: string;
  replitProjectUrl: string;
  replitOwner: string;
  replitSlug: string;
  syncMode: 'disabled' | 'manual' | 'automatic';
  autoSyncInterval?: number;
  lastSyncAt?: string;
  lastSyncDirection?: 'to_replit' | 'from_replit';
  lastSyncStatus?: 'success' | 'failed' | 'partial';
  deprecatedAt?: string;
}

interface SyncStatus {
  configured: boolean;
  mode: string;
  lastSync: string | null;
  lastDirection: string | null;
  lastStatus: string | null;
  isDeprecated: boolean;
  pendingChanges: number;
}

interface SyncPreview {
  repositoryId: string;
  direction: 'to_replit' | 'from_replit';
  totalChanges: number;
  additions: number;
  modifications: number;
  deletions: number;
  files: {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'unchanged';
    linesAdded: number;
    linesDeleted: number;
  }[];
  estimatedTime: number;
  warnings: string[];
}

interface SyncEvent {
  id: string;
  repositoryId: string;
  direction: 'to_replit' | 'from_replit';
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  filesChanged: number;
  filesAdded: number;
  filesDeleted: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  author: string;
}

interface ReverseSyncProps {
  repositoryId: string;
  repositoryName?: string;
  replitUrl?: string;
}

export function ReverseSync({ repositoryId, repositoryName, replitUrl }: ReverseSyncProps) {
  const { toast } = useToast();
  const [syncMode, setSyncMode] = useState<'disabled' | 'manual' | 'automatic'>('manual');
  const [replitProjectUrl, setReplitProjectUrl] = useState(replitUrl || '');
  const [showDeprecateDialog, setShowDeprecateDialog] = useState(false);
  const [preview, setPreview] = useState<SyncPreview | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Get sync status
  const { data: statusData, isLoading: statusLoading } = useQuery<{ success: boolean; status?: SyncStatus }>({
    queryKey: ['/api/sync/status', repositoryId],
    refetchInterval: 30000
  });

  // Get sync config
  const { data: configData } = useQuery<{ success: boolean; config?: SyncConfig }>({
    queryKey: ['/api/sync/config', repositoryId]
  });

  // Get sync history
  const { data: historyData } = useQuery<{ success: boolean; history?: SyncEvent[] }>({
    queryKey: ['/api/sync/history', repositoryId]
  });

  useEffect(() => {
    if (configData?.config) {
      setSyncMode(configData.config.syncMode);
      setReplitProjectUrl(configData.config.replitProjectUrl || replitUrl || '');
    }
  }, [configData, replitUrl]);

  // Configure sync mutation
  const configureMutation = useMutation({
    mutationFn: async (settings: { syncMode: string; replitProjectUrl: string }) => {
      const response = await apiRequest('POST', '/api/sync/configure', {
        repositoryId,
        ...settings
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sync/status', repositoryId] });
      queryClient.invalidateQueries({ queryKey: ['/api/sync/config', repositoryId] });
      toast({
        title: 'Settings Saved | تم حفظ الإعدادات',
        description: 'Sync configuration updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error | خطأ',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sync/preview', { repositoryId });
      return response.json();
    },
    onSuccess: (data) => {
      setPreview(data.preview);
      setSelectedFiles(new Set(data.preview.files.map((f: any) => f.path)));
    },
    onError: (error: any) => {
      toast({
        title: 'Preview Failed | فشلت المعاينة',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Push to Replit mutation
  const pushMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sync/push', {
        repositoryId,
        selectedFiles: Array.from(selectedFiles)
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sync/status', repositoryId] });
      queryClient.invalidateQueries({ queryKey: ['/api/sync/history', repositoryId] });
      setPreview(null);
      toast({
        title: 'Push Complete | اكتمل الدفع',
        description: `${data.event.filesChanged + data.event.filesAdded} files synced to Replit`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Push Failed | فشل الدفع',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Pull from Replit mutation
  const pullMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sync/pull', { repositoryId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sync/status', repositoryId] });
      queryClient.invalidateQueries({ queryKey: ['/api/sync/history', repositoryId] });
      toast({
        title: 'Pull Complete | اكتمل السحب',
        description: 'Changes pulled from Replit successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Pull Failed | فشل السحب',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Deprecate mutation
  const deprecateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/sync/deprecate', { repositoryId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sync/status', repositoryId] });
      queryClient.invalidateQueries({ queryKey: ['/api/sync/config', repositoryId] });
      setShowDeprecateDialog(false);
      toast({
        title: 'Connection Deprecated | تم إهمال الاتصال',
        description: 'Replit connection has been completely disabled'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error | خطأ',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const status: SyncStatus | null = statusData?.status;
  const config: SyncConfig | null = configData?.config;
  const history: SyncEvent[] = historyData?.history || [];

  const getStatusIcon = (eventStatus: string) => {
    switch (eventStatus) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getFileStatusIcon = (fileStatus: string) => {
    switch (fileStatus) {
      case 'added': return <Plus className="h-4 w-4 text-green-500" />;
      case 'modified': return <Edit className="h-4 w-4 text-yellow-500" />;
      case 'deleted': return <Minus className="h-4 w-4 text-red-500" />;
      default: return <FileCode className="h-4 w-4" />;
    }
  };

  const toggleFileSelection = (path: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(path)) {
      newSelection.delete(path);
    } else {
      newSelection.add(path);
    }
    setSelectedFiles(newSelection);
  };

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <CardTitle>Reverse Sync | المزامنة العكسية</CardTitle>
            </div>
            <Badge variant={status?.isDeprecated ? 'destructive' : status?.configured ? 'default' : 'secondary'}>
              {status?.isDeprecated ? 'Deprecated' : status?.configured ? status.mode : 'Not Configured'}
            </Badge>
          </div>
          <CardDescription>
            Manage synchronization between your platform and Replit
            <br />
            إدارة المزامنة بين منصتك و Replit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status?.isDeprecated ? (
            <Alert>
              <Ban className="h-4 w-4" />
              <AlertTitle>Replit Connection Deprecated | تم إهمال اتصال Replit</AlertTitle>
              <AlertDescription>
                This project is now running independently. Replit sync is permanently disabled.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-2xl font-bold">{status?.pendingChanges || 0}</div>
                  <div className="text-sm text-muted-foreground">Pending | معلق</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium">
                    {status?.lastSync 
                      ? new Date(status.lastSync).toLocaleDateString() 
                      : 'Never'}
                  </div>
                  <div className="text-sm text-muted-foreground">Last Sync | آخر مزامنة</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-center gap-1">
                    {status?.lastDirection === 'to_replit' 
                      ? <ArrowUpRight className="h-4 w-4" />
                      : <ArrowDownLeft className="h-4 w-4" />}
                    <span className="text-sm font-medium">
                      {status?.lastDirection === 'to_replit' ? 'Push' : 'Pull'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Direction | الاتجاه</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-center">
                    {status?.lastStatus === 'success' 
                      ? <CheckCircle className="h-5 w-5 text-green-500" />
                      : status?.lastStatus === 'failed'
                      ? <XCircle className="h-5 w-5 text-red-500" />
                      : <Clock className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="text-sm text-muted-foreground">Status | الحالة</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => previewMutation.mutate()}
                  disabled={previewMutation.isPending || status?.mode === 'disabled'}
                  data-testid="button-preview-sync"
                >
                  {previewMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Preview Push | معاينة الدفع
                </Button>
                
                <Button
                  onClick={() => pullMutation.mutate()}
                  disabled={pullMutation.isPending || status?.mode === 'disabled'}
                  variant="outline"
                  data-testid="button-pull-replit"
                >
                  {pullMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Pull from Replit | سحب من Replit
                </Button>
                
                <Button
                  onClick={() => setShowDeprecateDialog(true)}
                  variant="destructive"
                  data-testid="button-deprecate-connection"
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Deprecate | إهمال
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Card */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Push Preview | معاينة الدفع
            </CardTitle>
            <CardDescription>
              {preview.totalChanges} changes to sync | {preview.totalChanges} تغيير للمزامنة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Warnings */}
              {preview.warnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warnings | تحذيرات</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {preview.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Summary */}
              <div className="flex gap-4 flex-wrap">
                <Badge variant="outline" className="gap-1">
                  <Plus className="h-3 w-3" />
                  {preview.additions} added
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Edit className="h-3 w-3" />
                  {preview.modifications} modified
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Minus className="h-3 w-3" />
                  {preview.deletions} deleted
                </Badge>
              </div>

              {/* File List */}
              <ScrollArea className="h-64 rounded-md border">
                <div className="p-2 space-y-1">
                  {preview.files.map((file) => (
                    <div
                      key={file.path}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                        selectedFiles.has(file.path) ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleFileSelection(file.path)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.path)}
                        onChange={() => toggleFileSelection(file.path)}
                        className="rounded"
                        data-testid={`checkbox-file-${file.path.replace(/\//g, '-')}`}
                      />
                      {getFileStatusIcon(file.status)}
                      <span className="font-mono text-sm flex-1 truncate">{file.path}</span>
                      <span className="text-xs text-muted-foreground">
                        +{file.linesAdded} -{file.linesDeleted}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Push Button */}
              <div className="flex gap-2">
                <Button
                  onClick={() => pushMutation.mutate()}
                  disabled={pushMutation.isPending || selectedFiles.size === 0}
                  data-testid="button-execute-push"
                >
                  {pushMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Push {selectedFiles.size} Files | دفع {selectedFiles.size} ملفات
                </Button>
                <Button variant="outline" onClick={() => setPreview(null)}>
                  Cancel | إلغاء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration & History Tabs */}
      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config" data-testid="tab-sync-config">
            <Settings className="h-4 w-4 mr-2" />
            Configuration | التكوين
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-sync-history">
            <History className="h-4 w-4 mr-2" />
            History | السجل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="replit-url">Replit Project URL | رابط مشروع Replit</Label>
                <Input
                  id="replit-url"
                  value={replitProjectUrl}
                  onChange={(e) => setReplitProjectUrl(e.target.value)}
                  placeholder="https://replit.com/@username/project-name"
                  data-testid="input-replit-url"
                />
              </div>

              <div className="space-y-2">
                <Label>Sync Mode | وضع المزامنة</Label>
                <Select value={syncMode} onValueChange={(v: any) => setSyncMode(v)}>
                  <SelectTrigger data-testid="select-sync-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual | يدوي</SelectItem>
                    <SelectItem value="automatic">Automatic | تلقائي</SelectItem>
                    <SelectItem value="disabled">Disabled | معطل</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {syncMode === 'manual' && 'You control when to push/pull changes'}
                  {syncMode === 'automatic' && 'Changes sync automatically at intervals'}
                  {syncMode === 'disabled' && 'No sync - Replit becomes obsolete'}
                </p>
              </div>

              <Button
                onClick={() => configureMutation.mutate({ syncMode, replitProjectUrl })}
                disabled={configureMutation.isPending}
                data-testid="button-save-sync-config"
              >
                {configureMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Configuration | حفظ التكوين
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sync history yet | لا يوجد سجل مزامنة بعد
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {history.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-md gap-2"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(event.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              {event.direction === 'to_replit' 
                                ? <ArrowUpRight className="h-3 w-3" />
                                : <ArrowDownLeft className="h-3 w-3" />}
                              <span className="font-medium">
                                {event.direction === 'to_replit' ? 'Push' : 'Pull'}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {event.filesChanged + event.filesAdded + event.filesDeleted} files
                              {' | '}
                              {new Date(event.startedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant={event.status === 'success' ? 'default' : 'destructive'}>
                          {event.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deprecate Dialog */}
      <Dialog open={showDeprecateDialog} onOpenChange={setShowDeprecateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deprecate Replit Connection | إهمال اتصال Replit</DialogTitle>
            <DialogDescription>
              This will permanently disable all synchronization with Replit. 
              Your project will run completely independently on your own infrastructure.
              This action cannot be undone.
              <br /><br />
              سيتم تعطيل المزامنة مع Replit بشكل دائم. 
              سيعمل مشروعك بشكل مستقل تماماً على بنيتك التحتية الخاصة.
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeprecateDialog(false)}>
              Cancel | إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => deprecateMutation.mutate()}
              disabled={deprecateMutation.isPending}
              data-testid="button-confirm-deprecate"
            >
              {deprecateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              Deprecate Connection | إهمال الاتصال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
