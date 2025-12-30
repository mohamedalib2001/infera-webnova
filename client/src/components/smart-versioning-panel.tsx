/**
 * Smart Versioning Panel | لوحة الإصدارات الذكية
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { History, GitBranch, GitCompare, RotateCcw, Lock, Plus, Check, X, ArrowRight, AlertTriangle, ChevronRight } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

interface SystemVersion {
  id: string;
  tenantId: string;
  versionNumber: number;
  versionType: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  status: string;
  snapshot: Record<string, any>;
  changes: { field: string; oldValue: any; newValue: any }[];
  tags: string[];
  createdBy: string;
  createdAt: string;
}

interface VersionComparison {
  id: string;
  sourceVersionId: string;
  targetVersionId: string;
  differences: {
    path: string;
    pathAr: string;
    oldValue: any;
    newValue: any;
    changeType: 'added' | 'removed' | 'modified';
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  stats: { added: number; removed: number; modified: number; unchanged: number };
  summary: string;
  summaryAr: string;
  createdAt: string;
}

interface RollbackHistory {
  id: string;
  fromVersionId: string;
  toVersionId: string;
  rollbackType: string;
  reason: string;
  reasonAr: string;
  status: string;
  executedBy: string;
  executedAt: string;
}

interface DecisionVersion {
  id: string;
  decisionId: string;
  versionNumber: number;
  decisionType: string;
  title: string;
  titleAr: string;
  status: string;
  confidence: number;
  createdAt: string;
}

interface VersioningStats {
  totalVersions: number;
  versionsByType: Record<string, number>;
  totalRollbacks: number;
  totalComparisons: number;
  recentVersions: number;
  recentRollbacks: number;
}

interface SmartVersioningPanelProps {
  userEmail?: string;
  language?: 'en' | 'ar';
}

export function SmartVersioningPanel({ userEmail, language = 'en' }: SmartVersioningPanelProps) {
  const { toast } = useToast();
  const isOwner = userEmail === OWNER_EMAIL;
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState('versions');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [rollbackReason, setRollbackReason] = useState('');

  const { data: versionsData, isLoading: versionsLoading } = useQuery<{ data: SystemVersion[] }>({
    queryKey: ['/api/smart-versioning/versions']
  });

  const { data: comparisonsData } = useQuery<{ data: VersionComparison[] }>({
    queryKey: ['/api/smart-versioning/comparisons']
  });

  const { data: rollbacksData } = useQuery<{ data: RollbackHistory[] }>({
    queryKey: ['/api/smart-versioning/rollbacks']
  });

  const { data: decisionsData } = useQuery<{ data: DecisionVersion[] }>({
    queryKey: ['/api/smart-versioning/decisions']
  });

  const { data: statsData } = useQuery<{ data: VersioningStats }>({
    queryKey: ['/api/smart-versioning/stats']
  });

  const compareMutation = useMutation({
    mutationFn: async () => {
      if (selectedVersions.length !== 2) return;
      const response = await apiRequest('POST', '/api/smart-versioning/compare', {
        sourceVersionId: selectedVersions[0],
        targetVersionId: selectedVersions[1]
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/smart-versioning/comparisons'] });
      setCompareDialogOpen(false);
      setSelectedVersions([]);
      toast({
        title: language === 'ar' ? 'تمت المقارنة' : 'Comparison Complete',
        description: language === 'ar' ? 'تمت مقارنة الإصدارات' : 'Versions compared successfully'
      });
    }
  });

  const rollbackMutation = useMutation({
    mutationFn: async () => {
      if (selectedVersions.length !== 2) return;
      const response = await apiRequest('POST', '/api/smart-versioning/rollback', {
        fromVersionId: selectedVersions[0],
        toVersionId: selectedVersions[1],
        reason: rollbackReason,
        reasonAr: rollbackReason
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/smart-versioning/versions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/smart-versioning/rollbacks'] });
      setRollbackDialogOpen(false);
      setSelectedVersions([]);
      setRollbackReason('');
      toast({
        title: language === 'ar' ? 'تم التراجع' : 'Rollback Complete',
        description: language === 'ar' ? 'تم التراجع للإصدار المحدد' : 'Rolled back to selected version'
      });
    }
  });

  const versions = versionsData?.data || [];
  const comparisons = comparisonsData?.data || [];
  const rollbacks = rollbacksData?.data || [];
  const decisions = decisionsData?.data || [];
  const stats = statsData?.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'superseded': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rolled_back': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'archived': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'decision': return 'D';
      case 'architecture': return 'A';
      case 'data': return 'Da';
      case 'logic': return 'L';
      case 'code': return 'C';
      case 'config': return 'Cf';
      case 'policy': return 'P';
      default: return '?';
    }
  };

  const toggleVersionSelection = (id: string) => {
    if (selectedVersions.includes(id)) {
      setSelectedVersions(selectedVersions.filter(v => v !== id));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, id]);
    }
  };

  return (
    <div className={`p-4 space-y-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold" data-testid="text-panel-title">
            {language === 'ar' ? 'الإصدارات الذكية' : 'Smart Versioning'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {selectedVersions.length === 2 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareDialogOpen(true)}
                data-testid="button-compare"
              >
                <GitCompare className="w-4 h-4 mr-1" />
                {language === 'ar' ? 'مقارنة' : 'Compare'}
              </Button>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRollbackDialogOpen(true)}
                  data-testid="button-rollback"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  {language === 'ar' ? 'تراجع' : 'Rollback'}
                </Button>
              )}
            </>
          )}
          {!isOwner && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-muted-foreground">
                  <Lock className="w-3 h-3 mr-1" />
                  {language === 'ar' ? 'للمالك فقط' : 'Owner Only'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {language === 'ar' ? 'بعض الميزات متاحة للمالك فقط' : 'Some features require owner access'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي الإصدارات' : 'Total Versions'}
                </span>
                <GitBranch className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-total-versions">
                {stats.totalVersions}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'عمليات التراجع' : 'Rollbacks'}
                </span>
                <RotateCcw className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-total-rollbacks">
                {stats.totalRollbacks}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'المقارنات' : 'Comparisons'}
                </span>
                <GitCompare className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-total-comparisons">
                {stats.totalComparisons}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'آخر 24 ساعة' : 'Last 24h'}
                </span>
                <History className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-primary" data-testid="text-recent-versions">
                {stats.recentVersions}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="versions" data-testid="tab-versions">
            {language === 'ar' ? 'الإصدارات' : 'Versions'}
          </TabsTrigger>
          <TabsTrigger value="decisions" data-testid="tab-decisions">
            {language === 'ar' ? 'القرارات' : 'Decisions'}
          </TabsTrigger>
          <TabsTrigger value="comparisons" data-testid="tab-comparisons">
            {language === 'ar' ? 'المقارنات' : 'Comparisons'}
          </TabsTrigger>
          <TabsTrigger value="rollbacks" data-testid="tab-rollbacks">
            {language === 'ar' ? 'التراجعات' : 'Rollbacks'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'سجل الإصدارات' : 'Version History'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'حدد إصدارين للمقارنة أو التراجع'
                  : 'Select two versions to compare or rollback'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {versionsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{language === 'ar' ? 'لا توجد إصدارات' : 'No versions yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {versions.map((version) => (
                      <Card 
                        key={version.id} 
                        className={`p-3 cursor-pointer transition-colors ${
                          selectedVersions.includes(version.id) ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => toggleVersionSelection(version.id)}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                              {getTypeIcon(version.versionType)}
                            </Badge>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">v{version.versionNumber}</span>
                                <span className="text-sm">
                                  {language === 'ar' ? version.titleAr : version.title}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {version.versionType} • {version.createdBy}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(version.status)}>
                              {version.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(version.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            </span>
                          </div>
                        </div>
                        {version.tags && version.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {version.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'إصدارات القرارات' : 'Decision Versions'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تتبع إصدارات القرارات الذكية'
                  : 'Track AI and governance decision versions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {decisions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{language === 'ar' ? 'لا توجد قرارات' : 'No decisions yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {decisions.map((decision) => (
                      <Card key={decision.id} className="p-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">v{decision.versionNumber}</span>
                              <span className="text-sm">
                                {language === 'ar' ? decision.titleAr : decision.title}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {decision.decisionType} • {decision.decisionId}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(decision.status === 'approved' ? 'active' : decision.status === 'rejected' ? 'rolled_back' : 'superseded')}>
                              {decision.status}
                            </Badge>
                            <Badge variant="outline">{Math.round(decision.confidence * 100)}%</Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparisons">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'المقارنات' : 'Comparisons'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'نتائج مقارنة الإصدارات'
                  : 'Version comparison results'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {comparisons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GitCompare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{language === 'ar' ? 'لا توجد مقارنات' : 'No comparisons yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comparisons.map((comparison) => (
                      <Card key={comparison.id} className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">{comparison.sourceVersionId.slice(0, 8)}</Badge>
                          <ArrowRight className="w-4 h-4" />
                          <Badge variant="outline">{comparison.targetVersionId.slice(0, 8)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {language === 'ar' ? comparison.summaryAr : comparison.summary}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className="bg-green-500/20 text-green-400">
                            +{comparison.stats.added}
                          </Badge>
                          <Badge className="bg-red-500/20 text-red-400">
                            -{comparison.stats.removed}
                          </Badge>
                          <Badge className="bg-yellow-500/20 text-yellow-400">
                            ~{comparison.stats.modified}
                          </Badge>
                        </div>
                        {comparison.differences.slice(0, 3).map((diff, i) => (
                          <div key={i} className="mt-2 p-2 bg-muted/50 rounded text-xs">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(diff.severity)}>{diff.severity}</Badge>
                              <span className="font-mono">{language === 'ar' ? diff.pathAr : diff.path}</span>
                              <Badge variant="outline">{diff.changeType}</Badge>
                            </div>
                          </div>
                        ))}
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rollbacks">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'سجل التراجعات' : 'Rollback History'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'سجل جميع عمليات التراجع'
                  : 'History of all rollback operations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {rollbacks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <RotateCcw className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{language === 'ar' ? 'لا توجد تراجعات' : 'No rollbacks yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rollbacks.map((rollback) => (
                      <Card key={rollback.id} className="p-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <RotateCcw className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline">{rollback.fromVersionId.slice(0, 8)}</Badge>
                            <ArrowRight className="w-4 h-4" />
                            <Badge variant="outline">{rollback.toVersionId.slice(0, 8)}</Badge>
                          </div>
                          <Badge className={getStatusColor(rollback.status === 'completed' ? 'active' : 'rolled_back')}>
                            {rollback.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {language === 'ar' ? rollback.reasonAr : rollback.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {rollback.executedBy} • {new Date(rollback.executedAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'مقارنة الإصدارات' : 'Compare Versions'}</DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'سيتم مقارنة الإصدارين المحددين'
                : 'The selected versions will be compared'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-4 py-4">
            <Badge variant="outline" className="text-lg p-2">
              {selectedVersions[0]?.slice(0, 8)}
            </Badge>
            <GitCompare className="w-6 h-6" />
            <Badge variant="outline" className="text-lg p-2">
              {selectedVersions[1]?.slice(0, 8)}
            </Badge>
          </div>
          <Button
            onClick={() => compareMutation.mutate()}
            disabled={compareMutation.isPending}
            data-testid="button-confirm-compare"
          >
            {compareMutation.isPending 
              ? (language === 'ar' ? 'جاري المقارنة...' : 'Comparing...')
              : (language === 'ar' ? 'تأكيد المقارنة' : 'Confirm Compare')}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'تراجع للإصدار السابق' : 'Rollback to Previous Version'}</DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'سيتم التراجع من الإصدار الأول للإصدار الثاني'
                : 'This will rollback from first version to second version'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-4 py-4">
            <Badge variant="outline" className="text-lg p-2 bg-red-500/20">
              {selectedVersions[0]?.slice(0, 8)}
            </Badge>
            <ArrowRight className="w-6 h-6" />
            <Badge variant="outline" className="text-lg p-2 bg-green-500/20">
              {selectedVersions[1]?.slice(0, 8)}
            </Badge>
          </div>
          <Textarea
            placeholder={language === 'ar' ? 'سبب التراجع...' : 'Reason for rollback...'}
            value={rollbackReason}
            onChange={(e) => setRollbackReason(e.target.value)}
            data-testid="input-rollback-reason"
          />
          <div className="flex items-center gap-2 p-2 bg-yellow-500/20 rounded">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">
              {language === 'ar' 
                ? 'تحذير: هذا الإجراء لا يمكن التراجع عنه'
                : 'Warning: This action cannot be undone'}
            </span>
          </div>
          <Button
            variant="destructive"
            onClick={() => rollbackMutation.mutate()}
            disabled={rollbackMutation.isPending || !rollbackReason}
            data-testid="button-confirm-rollback"
          >
            {rollbackMutation.isPending 
              ? (language === 'ar' ? 'جاري التراجع...' : 'Rolling back...')
              : (language === 'ar' ? 'تأكيد التراجع' : 'Confirm Rollback')}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SmartVersioningPanel;
