/**
 * Sovereign Legal Compliance Panel | لوحة التوافق القانوني السيادي
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Globe, Lock, MapPin, AlertTriangle, CheckCircle, XCircle, FileText, Building, Sword } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

interface DataResidencyPolicy {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  region: string;
  allowedCountries: string[];
  blockedCountries: string[];
  dataTypes: string[];
  encryptionRequired: boolean;
  localStorageOnly: boolean;
  crossBorderTransferAllowed: boolean;
  frameworks: string[];
  enabled: boolean;
}

interface GeoRestriction {
  id: string;
  name: string;
  nameAr: string;
  countryCode: string;
  countryName: string;
  countryNameAr: string;
  restrictionLevel: string;
  sectorModes: string[];
  enabled: boolean;
}

interface SectorModeConfig {
  id: string;
  mode: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  securityLevel: string;
  requiredFrameworks: string[];
  encryptionStandard: string;
  auditLevel: string;
  enabled: boolean;
}

interface ComplianceCheck {
  id: string;
  tenantId: string;
  operation: string;
  sourceCountry: string;
  targetCountry?: string;
  sectorMode: string;
  result: string;
  violations: { code: string; severity: string; message: string; messageAr: string }[];
  conditions: string[];
  conditionsAr: string[];
  checkedAt: string;
}

interface ComplianceStats {
  totalPolicies: number;
  activePolicies: number;
  totalChecks: number;
  checksAllowed: number;
  checksDenied: number;
  checksPending: number;
  violationsBySeverity: Record<string, number>;
  checksBySector: Record<string, number>;
}

interface SovereignCompliancePanelProps {
  userEmail?: string;
  language?: 'en' | 'ar';
}

export function SovereignCompliancePanel({ userEmail, language = 'en' }: SovereignCompliancePanelProps) {
  const { toast } = useToast();
  const isOwner = userEmail === OWNER_EMAIL;
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState('check');
  const [checkForm, setCheckForm] = useState({
    tenantId: 'default',
    operation: 'data_transfer',
    sourceCountry: 'SA',
    targetCountry: '',
    dataTypes: ['personal'],
    sectorMode: 'civilian'
  });

  const { data: policiesData } = useQuery<{ data: DataResidencyPolicy[] }>({
    queryKey: ['/api/sovereign-compliance/policies']
  });

  const { data: restrictionsData } = useQuery<{ data: GeoRestriction[] }>({
    queryKey: ['/api/sovereign-compliance/geo-restrictions']
  });

  const { data: sectorsData } = useQuery<{ data: SectorModeConfig[] }>({
    queryKey: ['/api/sovereign-compliance/sector-modes']
  });

  const { data: checksData } = useQuery<{ data: ComplianceCheck[] }>({
    queryKey: ['/api/sovereign-compliance/checks']
  });

  const { data: statsData } = useQuery<{ data: ComplianceStats }>({
    queryKey: ['/api/sovereign-compliance/stats']
  });

  const checkMutation = useMutation({
    mutationFn: async (data: typeof checkForm) => {
      const response = await apiRequest('POST', '/api/sovereign-compliance/check', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-compliance/checks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sovereign-compliance/stats'] });
      toast({
        title: data.data.result === 'allowed' 
          ? (language === 'ar' ? 'تم الموافقة' : 'Approved')
          : data.data.result === 'denied'
          ? (language === 'ar' ? 'مرفوض' : 'Denied')
          : (language === 'ar' ? 'يتطلب شروط' : 'Conditional'),
        description: language === 'ar' 
          ? `${data.data.violations.length} مخالفات`
          : `${data.data.violations.length} violations`,
        variant: data.data.result === 'denied' ? 'destructive' : 'default'
      });
    }
  });

  const policies = policiesData?.data || [];
  const restrictions = restrictionsData?.data || [];
  const sectors = sectorsData?.data || [];
  const checks = checksData?.data || [];
  const stats = statsData?.data;

  const getResultColor = (result: string) => {
    switch (result) {
      case 'allowed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'denied': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'conditional': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'pending-approval': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'top-secret': return 'bg-red-500/20 text-red-400';
      case 'critical': return 'bg-orange-500/20 text-orange-400';
      case 'high': return 'bg-yellow-500/20 text-yellow-400';
      case 'elevated': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-green-500/20 text-green-400';
    }
  };

  const getSectorIcon = (mode: string) => {
    switch (mode) {
      case 'military': return <Sword className="w-4 h-4" />;
      case 'government': return <Building className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className={`p-4 space-y-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold" data-testid="text-panel-title">
            {language === 'ar' ? 'التوافق القانوني السيادي' : 'Sovereign Legal Compliance'}
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
                  {language === 'ar' ? 'السياسات النشطة' : 'Active Policies'}
                </span>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold" data-testid="text-active-policies">
                {stats.activePolicies}/{stats.totalPolicies}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'الفحوصات الناجحة' : 'Checks Passed'}
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-500" data-testid="text-checks-passed">
                {stats.checksAllowed}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'الفحوصات المرفوضة' : 'Checks Denied'}
                </span>
                <XCircle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500" data-testid="text-checks-denied">
                {stats.checksDenied}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'المخالفات الحرجة' : 'Critical Violations'}
                </span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500" data-testid="text-critical-violations">
                {stats.violationsBySeverity.critical || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="check" data-testid="tab-check">
            {language === 'ar' ? 'فحص' : 'Check'}
          </TabsTrigger>
          <TabsTrigger value="policies" data-testid="tab-policies">
            {language === 'ar' ? 'السياسات' : 'Policies'}
          </TabsTrigger>
          <TabsTrigger value="geo" data-testid="tab-geo">
            {language === 'ar' ? 'الجغرافية' : 'Geographic'}
          </TabsTrigger>
          <TabsTrigger value="sectors" data-testid="tab-sectors">
            {language === 'ar' ? 'القطاعات' : 'Sectors'}
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            {language === 'ar' ? 'السجل' : 'History'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="check" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'فحص الامتثال' : 'Compliance Check'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تحقق من امتثال العملية للسياسات والقيود'
                  : 'Verify operation compliance with policies and restrictions'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'العملية' : 'Operation'}
                  </label>
                  <Select
                    value={checkForm.operation}
                    onValueChange={(v) => setCheckForm(f => ({ ...f, operation: v }))}
                  >
                    <SelectTrigger data-testid="select-operation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_transfer">Data Transfer</SelectItem>
                      <SelectItem value="data_storage">Data Storage</SelectItem>
                      <SelectItem value="data_processing">Data Processing</SelectItem>
                      <SelectItem value="cross_border">Cross Border</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'الوضع القطاعي' : 'Sector Mode'}
                  </label>
                  <Select
                    value={checkForm.sectorMode}
                    onValueChange={(v) => setCheckForm(f => ({ ...f, sectorMode: v }))}
                  >
                    <SelectTrigger data-testid="select-sector">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="civilian">Civilian</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="military">Military</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="critical-infrastructure">Critical Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'بلد المصدر' : 'Source Country'}
                  </label>
                  <Select
                    value={checkForm.sourceCountry}
                    onValueChange={(v) => setCheckForm(f => ({ ...f, sourceCountry: v }))}
                  >
                    <SelectTrigger data-testid="select-source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SA">Saudi Arabia</SelectItem>
                      <SelectItem value="AE">UAE</SelectItem>
                      <SelectItem value="EG">Egypt</SelectItem>
                      <SelectItem value="QA">Qatar</SelectItem>
                      <SelectItem value="KW">Kuwait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'بلد الوجهة (اختياري)' : 'Target Country (Optional)'}
                  </label>
                  <Input
                    placeholder="e.g., US, EU"
                    value={checkForm.targetCountry}
                    onChange={(e) => setCheckForm(f => ({ ...f, targetCountry: e.target.value }))}
                    data-testid="input-target"
                  />
                </div>
              </div>
              <Button
                onClick={() => checkMutation.mutate(checkForm)}
                disabled={checkMutation.isPending}
                data-testid="button-check"
              >
                {checkMutation.isPending 
                  ? (language === 'ar' ? 'جاري الفحص...' : 'Checking...')
                  : (language === 'ar' ? 'فحص الامتثال' : 'Check Compliance')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'سياسات إقامة البيانات' : 'Data Residency Policies'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'سياسات السيادة الرقمية وتوطين البيانات'
                  : 'Digital sovereignty and data localization policies'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <Card key={policy.id} className="p-4">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-medium">
                              {language === 'ar' ? policy.nameAr : policy.name}
                            </span>
                            <Badge variant="outline">{policy.region}</Badge>
                            {policy.enabled ? (
                              <Badge className="bg-green-500/20 text-green-400">
                                {language === 'ar' ? 'مفعل' : 'Active'}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                {language === 'ar' ? 'معطل' : 'Inactive'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {language === 'ar' ? policy.descriptionAr : policy.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {policy.localStorageOnly && (
                              <Badge variant="destructive" className="text-xs">
                                {language === 'ar' ? 'تخزين محلي فقط' : 'Local Storage Only'}
                              </Badge>
                            )}
                            {policy.encryptionRequired && (
                              <Badge className="text-xs bg-blue-500/20 text-blue-400">
                                <Lock className="w-3 h-3 mr-1" />
                                {language === 'ar' ? 'تشفير مطلوب' : 'Encryption Required'}
                              </Badge>
                            )}
                            {!policy.crossBorderTransferAllowed && (
                              <Badge variant="destructive" className="text-xs">
                                {language === 'ar' ? 'نقل عبر الحدود محظور' : 'No Cross-Border'}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {policy.frameworks.map((fw, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{fw}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'القيود الجغرافية' : 'Geographic Restrictions'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'قيود العمليات حسب الدولة'
                  : 'Operation restrictions by country'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {restrictions.map((restriction) => (
                    <Card key={restriction.id} className="p-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {language === 'ar' ? restriction.countryNameAr : restriction.countryName}
                          </span>
                          <Badge variant="outline">{restriction.countryCode}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getResultColor(restriction.restrictionLevel === 'none' ? 'allowed' : 'conditional')}>
                            {restriction.restrictionLevel}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {restriction.sectorModes.map((mode, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {getSectorIcon(mode)}
                            <span className="ml-1">{mode}</span>
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الأوضاع القطاعية' : 'Sector Modes'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'أوضاع خاصة للقطاعات المختلفة'
                  : 'Special modes for different sectors'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectors.map((sector) => (
                  <Card key={sector.id} className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getSectorIcon(sector.mode)}
                          <span className="font-medium">
                            {language === 'ar' ? sector.nameAr : sector.name}
                          </span>
                          <Badge className={getSecurityLevelColor(sector.securityLevel)}>
                            {sector.securityLevel}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === 'ar' ? sector.descriptionAr : sector.description}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          <div>
                            <span className="text-xs text-muted-foreground block">
                              {language === 'ar' ? 'التشفير' : 'Encryption'}
                            </span>
                            <Badge variant="outline" className="mt-1">{sector.encryptionStandard}</Badge>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">
                              {language === 'ar' ? 'مستوى التدقيق' : 'Audit Level'}
                            </span>
                            <Badge variant="outline" className="mt-1">{sector.auditLevel}</Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sector.requiredFrameworks.map((fw, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{fw}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'سجل الفحوصات' : 'Check History'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'سجل جميع فحوصات الامتثال'
                  : 'History of all compliance checks'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {checks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{language === 'ar' ? 'لا توجد فحوصات' : 'No compliance checks'}</p>
                    </div>
                  ) : checks.map((check) => (
                    <Card key={check.id} className="p-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {check.result === 'allowed' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : check.result === 'denied' ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                          <Badge variant="outline">{check.operation}</Badge>
                          <span className="text-sm">{check.sourceCountry}</span>
                          {check.targetCountry && (
                            <>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-sm">{check.targetCountry}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getResultColor(check.result)}>{check.result}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(check.checkedAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                      </div>
                      {check.violations.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {check.violations.slice(0, 2).map((v, i) => (
                            <p key={i} className="text-xs text-red-400">
                              [{v.severity}] {language === 'ar' ? v.messageAr : v.message}
                            </p>
                          ))}
                        </div>
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

export default SovereignCompliancePanel;
