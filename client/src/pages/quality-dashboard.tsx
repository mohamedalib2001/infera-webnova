import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';
import {
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Server,
  Gauge,
  FileCode,
  Zap,
  RefreshCw,
  Brain,
  Database,
  Lock,
  CreditCard,
  Rocket,
  Eye,
  Settings,
  BarChart3,
  Clock,
  Target,
  Award,
} from 'lucide-react';

interface ServiceStatus {
  serviceId: string;
  serviceName: string;
  serviceNameAr: string;
  category: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  responseTime: number;
  uptime: number;
  isSimulated: boolean;
}

interface PageMetrics {
  pageId: string;
  pagePath: string;
  pageName: string;
  pageNameAr: string;
  overallScore: number;
  metrics: {
    functionality: { score: number };
    performance: { score: number; loadTime: number };
    accessibility: { score: number };
    security: { score: number };
    codeQuality: { score: number };
    userExperience: { score: number };
  };
  servicesStatus: ServiceStatus[];
  trend: 'improving' | 'stable' | 'declining';
}

interface QualityReport {
  platformId: string;
  generatedAt: string;
  overallHealth: number;
  totalPages: number;
  totalServices: number;
  pagesAnalyzed: PageMetrics[];
  servicesHealth: ServiceStatus[];
  criticalIssues: Array<{
    id: string;
    severity: string;
    category: string;
    description: string;
    descriptionAr: string;
    suggestedFix: string;
    suggestedFixAr: string;
  }>;
  recommendations: Array<{
    id: string;
    priority: number;
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    impact: string;
    effort: string;
    autoFixAvailable: boolean;
  }>;
  qualityGrade: string;
}

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-green-600 dark:text-green-400';
  if (grade.startsWith('B')) return 'text-blue-600 dark:text-blue-400';
  if (grade.startsWith('C')) return 'text-yellow-600 dark:text-yellow-400';
  if (grade.startsWith('D')) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function getStatusColor(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'operational': return 'default';
    case 'degraded': return 'secondary';
    case 'down': return 'destructive';
    default: return 'outline';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'operational': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'down': return <XCircle className="w-4 h-4 text-red-500" />;
    default: return <Clock className="w-4 h-4 text-blue-500" />;
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
    default: return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'ai': return <Brain className="w-4 h-4" />;
    case 'database': return <Database className="w-4 h-4" />;
    case 'auth': return <Lock className="w-4 h-4" />;
    case 'payment': return <CreditCard className="w-4 h-4" />;
    case 'deployment': return <Rocket className="w-4 h-4" />;
    case 'monitoring': return <Activity className="w-4 h-4" />;
    case 'storage': return <Server className="w-4 h-4" />;
    default: return <Settings className="w-4 h-4" />;
  }
}

export default function QualityDashboard() {
  const { language, isRtl, t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const { data: report, isLoading, refetch, isFetching } = useQuery<QualityReport>({
    queryKey: ['/api/platform/quality/report'],
    refetchInterval: 60000,
  });
  
  if (isLoading) {
    return (
      <div className="p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }
  
  const operationalServices = report?.servicesHealth?.filter(s => s.status === 'operational').length || 0;
  const totalServices = report?.servicesHealth?.length || 0;
  const realServices = report?.servicesHealth?.filter(s => !s.isSimulated).length || 0;
  
  return (
    <div className="p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            {language === 'ar' ? 'لوحة ضمان الجودة' : 'Quality Assurance Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'مراقبة جودة المنصة والخدمات في الوقت الفعلي'
              : 'Real-time platform and service quality monitoring'}
          </p>
        </div>
        <Button 
          onClick={() => refetch()} 
          disabled={isFetching}
          variant="outline"
          data-testid="button-refresh-quality"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          {language === 'ar' ? 'تحديث' : 'Refresh'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'ar' ? 'التقييم العام' : 'Overall Grade'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={`text-4xl font-bold ${getGradeColor(report?.qualityGrade || 'F')}`}>
                {report?.qualityGrade || 'N/A'}
              </span>
              <Award className="w-8 h-8 text-primary" />
            </div>
            <Progress value={report?.overallHealth || 0} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {report?.overallHealth || 0}% {language === 'ar' ? 'صحة المنصة' : 'Platform Health'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'ar' ? 'الخدمات النشطة' : 'Active Services'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-green-600">
                {operationalServices}/{totalServices}
              </span>
              <Server className="w-8 h-8 text-green-600" />
            </div>
            <Progress value={(operationalServices / totalServices) * 100} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-1">
              {realServices} {language === 'ar' ? 'خدمات حقيقية' : 'real services'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'ar' ? 'الصفحات المحللة' : 'Pages Analyzed'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold">
                {report?.pagesAnalyzed?.length || 0}
              </span>
              <FileCode className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {language === 'ar' ? 'من أصل' : 'of'} {report?.totalPages || 0} {language === 'ar' ? 'صفحة' : 'total pages'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{language === 'ar' ? 'المشاكل الحرجة' : 'Critical Issues'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={`text-4xl font-bold ${(report?.criticalIssues?.length || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {report?.criticalIssues?.length || 0}
              </span>
              <AlertTriangle className={`w-8 h-8 ${(report?.criticalIssues?.length || 0) > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {(report?.criticalIssues?.length || 0) === 0 
                ? (language === 'ar' ? 'لا توجد مشاكل' : 'No issues found')
                : (language === 'ar' ? 'تحتاج اهتمام' : 'Need attention')}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">{language === 'ar' ? 'نظرة عامة' : 'Overview'}</span>
          </TabsTrigger>
          <TabsTrigger value="pages" data-testid="tab-pages">
            <FileCode className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">{language === 'ar' ? 'الصفحات' : 'Pages'}</span>
          </TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">
            <Server className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">{language === 'ar' ? 'الخدمات' : 'Services'}</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" data-testid="tab-recommendations">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">{language === 'ar' ? 'التوصيات' : 'Recommendations'}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {language === 'ar' ? 'حالة الخدمات' : 'Services Status'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {report?.servicesHealth?.map(service => (
                      <div 
                        key={service.serviceId}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                        data-testid={`service-status-${service.serviceId}`}
                      >
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(service.category)}
                          <div>
                            <p className="font-medium text-sm">
                              {language === 'ar' ? service.serviceNameAr : service.serviceName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(service.responseTime)}ms | {service.uptime.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {service.isSimulated && (
                            <Badge variant="outline" className="text-xs">
                              {language === 'ar' ? 'محاكاة' : 'Simulated'}
                            </Badge>
                          )}
                          <Badge variant={getStatusColor(service.status)}>
                            {getStatusIcon(service.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {language === 'ar' ? 'المشاكل المكتشفة' : 'Detected Issues'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {report?.criticalIssues?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
                      <p>{language === 'ar' ? 'لا توجد مشاكل حرجة!' : 'No critical issues found!'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {report?.criticalIssues?.map(issue => (
                        <div 
                          key={issue.id}
                          className="p-3 rounded-md border"
                          data-testid={`issue-${issue.id}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {issue.severity}
                            </Badge>
                            <span className="text-sm font-medium">{issue.category}</span>
                          </div>
                          <p className="text-sm">
                            {language === 'ar' ? issue.descriptionAr : issue.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {language === 'ar' ? issue.suggestedFixAr : issue.suggestedFix}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pages" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'جودة الصفحات' : 'Pages Quality'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تحليل مفصل لجودة كل صفحة في المنصة'
                  : 'Detailed quality analysis of each platform page'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {report?.pagesAnalyzed?.map(page => (
                    <div 
                      key={page.pageId}
                      className="p-4 rounded-md border hover-elevate"
                      data-testid={`page-quality-${page.pageId}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {language === 'ar' ? page.pageNameAr : page.pageName}
                          </span>
                          <Badge variant="outline" className="text-xs">{page.pagePath}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(page.trend)}
                          <span className={`font-bold ${page.overallScore >= 80 ? 'text-green-600' : page.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {page.overallScore}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{language === 'ar' ? 'وظائف' : 'Func'}: {page.metrics.functionality.score}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          <span>{language === 'ar' ? 'أداء' : 'Perf'}: {page.metrics.performance.score}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{language === 'ar' ? 'وصول' : 'A11y'}: {page.metrics.accessibility.score}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>{language === 'ar' ? 'أمان' : 'Sec'}: {page.metrics.security.score}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileCode className="w-3 h-3" />
                          <span>{language === 'ar' ? 'كود' : 'Code'}: {page.metrics.codeQuality.score}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{language === 'ar' ? 'تجربة' : 'UX'}: {page.metrics.userExperience.score}%</span>
                        </div>
                      </div>
                      
                      <Progress value={page.overallScore} className="mt-2 h-1" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'صحة الخدمات' : 'Services Health'}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'حالة جميع الخدمات والمكونات الأساسية'
                  : 'Status of all services and core components'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {report?.servicesHealth?.map(service => (
                  <div 
                    key={service.serviceId}
                    className="p-4 rounded-md border"
                    data-testid={`service-detail-${service.serviceId}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(service.category)}
                        <span className="font-medium">
                          {language === 'ar' ? service.serviceNameAr : service.serviceName}
                        </span>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{language === 'ar' ? 'الحالة' : 'Status'}</span>
                        <Badge variant={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{language === 'ar' ? 'وقت الاستجابة' : 'Response Time'}</span>
                        <span>{Math.round(service.responseTime)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{language === 'ar' ? 'وقت التشغيل' : 'Uptime'}</span>
                        <span>{service.uptime.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{language === 'ar' ? 'النوع' : 'Type'}</span>
                        <Badge variant={service.isSimulated ? 'secondary' : 'default'}>
                          {service.isSimulated 
                            ? (language === 'ar' ? 'محاكاة' : 'Simulated')
                            : (language === 'ar' ? 'حقيقي' : 'Real')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                {language === 'ar' ? 'توصيات الذكاء الاصطناعي' : 'AI Recommendations'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'اقتراحات ذكية لتحسين جودة المنصة'
                  : 'Smart suggestions to improve platform quality'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report?.recommendations?.map((rec, index) => (
                  <div 
                    key={rec.id}
                    className="p-4 rounded-md border"
                    data-testid={`recommendation-${rec.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">#{rec.priority}</Badge>
                          <span className="font-medium">
                            {language === 'ar' ? rec.titleAr : rec.title}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? rec.descriptionAr : rec.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={rec.impact === 'high' ? 'default' : 'secondary'}>
                          {language === 'ar' ? 'تأثير' : 'Impact'}: {rec.impact}
                        </Badge>
                        <Badge variant="outline">
                          {language === 'ar' ? 'جهد' : 'Effort'}: {rec.effort}
                        </Badge>
                        {rec.autoFixAvailable && (
                          <Button size="sm" variant="outline" className="mt-2">
                            <Zap className="w-3 h-3" />
                            {language === 'ar' ? 'إصلاح تلقائي' : 'Auto Fix'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-center text-xs text-muted-foreground">
        {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'}{' '}
        {report?.generatedAt ? new Date(report.generatedAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') : 'N/A'}
      </div>
    </div>
  );
}
