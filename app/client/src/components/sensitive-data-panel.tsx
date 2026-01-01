/**
 * Sensitive Data Management Panel | لوحة إدارة البيانات الحساسة
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
import { Shield, Lock, Database, Eye, FileText, Users, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

interface ClassificationResult {
  classification: 'normal' | 'sensitive' | 'highly-sensitive';
  category: string;
  confidence: number;
  matchedRules: string[];
  matchedKeywords: string[];
  recommendations: string[];
  recommendationsAr: string[];
}

interface ClassificationRule {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  patterns: string[];
  keywords: string[];
  category: string;
  classification: string;
  enabled: boolean;
  createdAt: string;
}

interface DataPolicy {
  id: string;
  name: string;
  nameAr: string;
  classification: string;
  storagePolicy: string;
  processingPolicy: string;
  retentionPolicy: string;
  encryptionRequired: boolean;
  auditRequired: boolean;
  accessRestrictions: string[];
  allowedRoles: string[];
}

interface TenantIsolation {
  tenantId: string;
  tenantName: string;
  tenantNameAr: string;
  dataPrefix: string;
  allowedCategories: string[];
  crossTenantAccess: boolean;
  createdAt: string;
}

interface DataStats {
  totalRecords: number;
  byClassification: Record<string, number>;
  byCategory: Record<string, number>;
  byTenant: Record<string, number>;
  encryptedCount: number;
  accessLogsCount: number;
}

interface AccessLog {
  id: string;
  recordId: string;
  userId: string;
  userEmail: string;
  action: string;
  timestamp: string;
  success: boolean;
  reason?: string;
}

interface SensitiveDataPanelProps {
  userEmail?: string;
  language?: 'en' | 'ar';
}

export function SensitiveDataPanel({ userEmail, language = 'en' }: SensitiveDataPanelProps) {
  const { toast } = useToast();
  const isOwner = userEmail === OWNER_EMAIL;
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState('classify');
  const [classifyInput, setClassifyInput] = useState('');
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);

  const { data: rulesData } = useQuery<{ data: ClassificationRule[] }>({
    queryKey: ['/api/sensitive-data/rules']
  });

  const { data: policiesData } = useQuery<{ data: DataPolicy[] }>({
    queryKey: ['/api/sensitive-data/policies']
  });

  const { data: tenantsData } = useQuery<{ data: TenantIsolation[] }>({
    queryKey: ['/api/sensitive-data/tenants'],
    enabled: isOwner
  });

  const { data: statsData } = useQuery<{ data: DataStats }>({
    queryKey: ['/api/sensitive-data/stats']
  });

  const { data: logsData } = useQuery<{ data: AccessLog[] }>({
    queryKey: ['/api/sensitive-data/logs'],
    enabled: isOwner
  });

  const classifyMutation = useMutation({
    mutationFn: async (data: string) => {
      const response = await apiRequest('POST', '/api/sensitive-data/classify', { data });
      return response.json();
    },
    onSuccess: (data) => {
      setClassificationResult(data.data);
      toast({
        title: language === 'ar' ? 'تم التصنيف' : 'Classification Complete',
        description: language === 'ar' 
          ? `تم تصنيف البيانات كـ ${data.data.classification}`
          : `Data classified as ${data.data.classification}`
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const createTenantMutation = useMutation({
    mutationFn: async (tenant: { tenantId: string; tenantName: string; tenantNameAr: string }) => {
      const response = await apiRequest('POST', '/api/sensitive-data/tenants', tenant);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sensitive-data/tenants'] });
      toast({
        title: language === 'ar' ? 'تم الإنشاء' : 'Created',
        description: language === 'ar' ? 'تم إنشاء عزل المنصة' : 'Tenant isolation created'
      });
    }
  });

  const rules = rulesData?.data || [];
  const policies = policiesData?.data || [];
  const tenants = tenantsData?.data || [];
  const stats = statsData?.data;
  const logs = logsData?.data || [];

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'highly-sensitive': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'sensitive': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'normal': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personal': return <Users className="w-4 h-4" />;
      case 'financial': return <Database className="w-4 h-4" />;
      case 'health': return <Activity className="w-4 h-4" />;
      case 'authentication': return <Lock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className={`p-4 space-y-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold" data-testid="text-panel-title">
            {language === 'ar' ? 'إدارة البيانات الحساسة' : 'Sensitive Data Management'}
          </h2>
        </div>
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

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي السجلات' : 'Total Records'}
                </span>
                <Database className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-total-records">{stats.totalRecords}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'مشفرة' : 'Encrypted'}
                </span>
                <Lock className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500" data-testid="text-encrypted-count">{stats.encryptedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'شديدة الحساسية' : 'Highly Sensitive'}
                </span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500" data-testid="text-highly-sensitive">
                {stats.byClassification['highly-sensitive'] || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'سجلات الوصول' : 'Access Logs'}
                </span>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-access-logs">{stats.accessLogsCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="classify" data-testid="tab-classify">
            {language === 'ar' ? 'تصنيف' : 'Classify'}
          </TabsTrigger>
          <TabsTrigger value="rules" data-testid="tab-rules">
            {language === 'ar' ? 'القواعد' : 'Rules'}
          </TabsTrigger>
          <TabsTrigger value="policies" data-testid="tab-policies">
            {language === 'ar' ? 'السياسات' : 'Policies'}
          </TabsTrigger>
          <TabsTrigger value="tenants" data-testid="tab-tenants" disabled={!isOwner}>
            {language === 'ar' ? 'العزل' : 'Isolation'}
          </TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs" disabled={!isOwner}>
            {language === 'ar' ? 'السجلات' : 'Logs'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'تصنيف البيانات' : 'Classify Data'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'أدخل البيانات لتصنيفها تلقائياً'
                  : 'Enter data to automatically classify it'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={language === 'ar' ? 'أدخل البيانات للتصنيف...' : 'Enter data to classify...'}
                value={classifyInput}
                onChange={(e) => setClassifyInput(e.target.value)}
                className="min-h-[120px]"
                data-testid="input-classify-data"
              />
              <Button
                onClick={() => classifyMutation.mutate(classifyInput)}
                disabled={!classifyInput || classifyMutation.isPending}
                data-testid="button-classify"
              >
                {classifyMutation.isPending 
                  ? (language === 'ar' ? 'جاري التصنيف...' : 'Classifying...')
                  : (language === 'ar' ? 'تصنيف' : 'Classify')}
              </Button>

              {classificationResult && (
                <Card className="mt-4">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(classificationResult.category)}
                        <span className="font-medium">{classificationResult.category}</span>
                      </div>
                      <Badge className={getClassificationColor(classificationResult.classification)}>
                        {classificationResult.classification}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'الثقة:' : 'Confidence:'}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${classificationResult.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(classificationResult.confidence * 100)}%
                      </span>
                    </div>

                    {classificationResult.matchedKeywords.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'الكلمات المطابقة:' : 'Matched Keywords:'}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {classificationResult.matchedKeywords.map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {classificationResult.recommendations.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'التوصيات:' : 'Recommendations:'}
                        </span>
                        <ul className="list-disc list-inside mt-1 text-sm space-y-1">
                          {(language === 'ar' ? classificationResult.recommendationsAr : classificationResult.recommendations)
                            .map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'قواعد التصنيف' : 'Classification Rules'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'القواعد المستخدمة لتصنيف البيانات تلقائياً'
                  : 'Rules used for automatic data classification'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <Card key={rule.id} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getCategoryIcon(rule.category)}
                            <span className="font-medium">
                              {language === 'ar' ? rule.nameAr : rule.name}
                            </span>
                            <Badge className={getClassificationColor(rule.classification)}>
                              {rule.classification}
                            </Badge>
                            {rule.enabled ? (
                              <Badge variant="outline" className="text-green-500 border-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {language === 'ar' ? 'مفعل' : 'Enabled'}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                <XCircle className="w-3 h-3 mr-1" />
                                {language === 'ar' ? 'معطل' : 'Disabled'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {language === 'ar' ? rule.descriptionAr : rule.description}
                          </p>
                          {rule.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {rule.keywords.slice(0, 5).map((kw, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{kw}</Badge>
                              ))}
                              {rule.keywords.length > 5 && (
                                <Badge variant="secondary" className="text-xs">+{rule.keywords.length - 5}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'سياسات البيانات' : 'Data Policies'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'سياسات التخزين والمعالجة لكل مستوى تصنيف'
                  : 'Storage and processing policies for each classification level'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map((policy) => (
                  <Card key={policy.id} className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {language === 'ar' ? policy.nameAr : policy.name}
                          </span>
                          <Badge className={getClassificationColor(policy.classification)}>
                            {policy.classification}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <span className="text-xs text-muted-foreground block">
                              {language === 'ar' ? 'التخزين' : 'Storage'}
                            </span>
                            <Badge variant="outline" className="mt-1">{policy.storagePolicy}</Badge>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">
                              {language === 'ar' ? 'المعالجة' : 'Processing'}
                            </span>
                            <Badge variant="outline" className="mt-1">{policy.processingPolicy}</Badge>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">
                              {language === 'ar' ? 'الاحتفاظ' : 'Retention'}
                            </span>
                            <Badge variant="outline" className="mt-1">{policy.retentionPolicy}</Badge>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">
                              {language === 'ar' ? 'التشفير' : 'Encryption'}
                            </span>
                            {policy.encryptionRequired ? (
                              <Badge className="mt-1 bg-green-500/20 text-green-400">
                                <Lock className="w-3 h-3 mr-1" />
                                {language === 'ar' ? 'مطلوب' : 'Required'}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="mt-1">
                                {language === 'ar' ? 'اختياري' : 'Optional'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {policy.accessRestrictions.length > 0 && (
                          <div className="mt-3">
                            <span className="text-xs text-muted-foreground">
                              {language === 'ar' ? 'القيود:' : 'Restrictions:'}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {policy.accessRestrictions.map((r, i) => (
                                <Badge key={i} variant="destructive" className="text-xs">{r}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <div>
                <CardTitle>{language === 'ar' ? 'عزل المنصات' : 'Tenant Isolation'}</CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'إدارة عزل البيانات بين المنصات'
                    : 'Manage data isolation between platforms'}
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const id = `tenant-${Date.now()}`;
                  createTenantMutation.mutate({
                    tenantId: id,
                    tenantName: `Platform ${id.slice(-4)}`,
                    tenantNameAr: `منصة ${id.slice(-4)}`
                  });
                }}
                disabled={createTenantMutation.isPending}
                data-testid="button-create-tenant"
              >
                {language === 'ar' ? 'إنشاء عزل جديد' : 'Create Isolation'}
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {tenants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{language === 'ar' ? 'لا توجد منصات معزولة' : 'No tenant isolations'}</p>
                    </div>
                  ) : tenants.map((tenant) => (
                    <Card key={tenant.tenantId} className="p-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                              {language === 'ar' ? tenant.tenantNameAr : tenant.tenantName}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {language === 'ar' ? 'البادئة:' : 'Prefix:'} {tenant.dataPrefix}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {tenant.crossTenantAccess ? (
                            <Badge variant="outline" className="text-yellow-500">
                              {language === 'ar' ? 'وصول متقاطع' : 'Cross-Access'}
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500/20 text-green-400">
                              <Shield className="w-3 h-3 mr-1" />
                              {language === 'ar' ? 'معزول' : 'Isolated'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'سجلات الوصول' : 'Access Logs'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'سجل تدقيق لجميع عمليات الوصول للبيانات'
                  : 'Audit log of all data access operations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{language === 'ar' ? 'لا توجد سجلات' : 'No access logs'}</p>
                    </div>
                  ) : logs.map((log) => (
                    <Card key={log.id} className="p-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {log.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <Badge variant="outline">{log.action}</Badge>
                          <span className="text-sm text-muted-foreground">{log.userEmail}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                      {log.reason && (
                        <p className="text-xs text-red-400 mt-1">{log.reason}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SensitiveDataPanel;
