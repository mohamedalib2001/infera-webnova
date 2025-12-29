import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Play,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  RefreshCw,
  Bug,
  Zap,
  Eye,
  Wrench,
  BarChart3,
  Target,
  Activity
} from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  category: string;
  status: string;
  result?: {
    passed: boolean;
    message: string;
    duration: number;
  };
  lastRun?: string;
}

interface Vulnerability {
  id: string;
  title: string;
  titleAr: string;
  severity: string;
  category: string;
  status: string;
  remediation: string;
  autoFixAvailable: boolean;
}

interface ReadinessReport {
  id: string;
  platformName: string;
  overallScore: number;
  readinessLevel: string;
  generatedAt: string;
  categories: Record<string, { score: number; issues: string[] }>;
  recommendations: Array<{ priority: number; action: string; actionAr: string }>;
  testResults: { passed: number; failed: number; total: number };
}

export function QualityTestingPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRunning, setIsRunning] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [platformName, setPlatformName] = useState("INFERA WebNova");

  const statsQuery = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/quality-testing/stats"]
  });

  const testsQuery = useQuery<{ success: boolean; data: TestCase[] }>({
    queryKey: ["/api/quality-testing/tests"]
  });

  const suitesQuery = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["/api/quality-testing/suites"]
  });

  const vulnsQuery = useQuery<{ success: boolean; data: Vulnerability[] }>({
    queryKey: ["/api/quality-testing/vulnerabilities"]
  });

  const reportsQuery = useQuery<{ success: boolean; data: ReadinessReport[] }>({
    queryKey: ["/api/quality-testing/reports"]
  });

  const handleRunTest = async (testId: string) => {
    try {
      const response = await apiRequest("POST", `/api/quality-testing/tests/${testId}/run`, {});
      const data = await response.json();
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/tests"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/reports"] });
        toast({ title: "Test Complete | اكتمل الاختبار", description: data.data.result?.message || "Test finished" });
      }
    } catch (error: any) {
      toast({ title: "Test Failed | فشل الاختبار", description: error.message, variant: "destructive" });
    }
  };

  const handleRunSuite = async (suiteId: string) => {
    setIsRunning(true);
    try {
      const response = await apiRequest("POST", `/api/quality-testing/suites/${suiteId}/run`, {});
      const data = await response.json();
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/tests"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/suites"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/reports"] });
        toast({ title: "Suite Complete | اكتملت المجموعة", description: `Pass rate | نسبة النجاح: ${data.data.passRate.toFixed(0)}%` });
      }
    } catch (error: any) {
      toast({ title: "Suite Failed | فشلت المجموعة", description: error.message, variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const response = await apiRequest("POST", "/api/quality-testing/scan", {});
      const data = await response.json();
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/vulnerabilities"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/reports"] });
        toast({ title: "Scan Complete | اكتمل الفحص", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Scan Failed | فشل الفحص", description: error.message, variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const handleRemediate = async (vulnId: string) => {
    try {
      const response = await apiRequest("POST", `/api/quality-testing/vulnerabilities/${vulnId}/remediate`, {});
      const data = await response.json();
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/vulnerabilities"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/reports"] });
        toast({ title: "Remediated | تمت المعالجة", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Remediation Failed | فشلت المعالجة", description: error.message, variant: "destructive" });
    }
  };

  const handleGenerateReport = async () => {
    setIsRunning(true);
    try {
      const response = await apiRequest("POST", "/api/quality-testing/reports/generate", {
        platformId: `platform_${Date.now()}`,
        platformName
      });
      const data = await response.json();
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/reports"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/quality-testing/tests"] });
        toast({ title: "Report Generated | تم إنشاء التقرير", description: data.message });
      }
    } catch (error: any) {
      toast({ title: "Report Failed | فشل التقرير", description: error.message, variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  };

  const stats = statsQuery.data?.data;
  const tests = testsQuery.data?.data || [];
  const suites = suitesQuery.data?.data || [];
  const vulns = vulnsQuery.data?.data || [];
  const reports = reportsQuery.data?.data || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'production_ready': return 'text-green-500';
      case 'almost_ready': return 'text-blue-500';
      case 'needs_work': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4" data-testid="quality-testing-panel">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6" />
            Quality & Self-Testing
            <span className="text-muted-foreground text-lg">| الجودة والاختبار الذاتي</span>
          </h2>
          <p className="text-muted-foreground">
            Automated testing, security scanning, and readiness reports
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            statsQuery.refetch();
            testsQuery.refetch();
            vulnsQuery.refetch();
          }}
          data-testid="button-refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.passedTests}/{stats.totalTests}</div>
                <div className="text-sm text-muted-foreground">Tests Passed | اختبارات ناجحة</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-red-500/10">
                <Bug className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.openVulnerabilities}</div>
                <div className="text-sm text-muted-foreground">Open Vulns | ثغرات مفتوحة</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-orange-500/10">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.criticalVulnerabilities}</div>
                <div className="text-sm text-muted-foreground">Critical | حرجة</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-500/10">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.averagePassRate.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Pass Rate | نسبة النجاح</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tests" data-testid="tab-tests">
            <Play className="w-4 h-4 mr-2" />
            Tests | اختبارات
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Shield className="w-4 h-4 mr-2" />
            Security | أمان
          </TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">
            <FileText className="w-4 h-4 mr-2" />
            Reports | تقارير
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions | إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suites.map((suite: any) => (
                  <Button
                    key={suite.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleRunSuite(suite.id)}
                    disabled={isRunning}
                    data-testid={`button-run-suite-${suite.id}`}
                  >
                    {isRunning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    Run {suite.name}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleScan}
                  disabled={isScanning}
                  data-testid="button-security-scan"
                >
                  {isScanning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                  Security Scan | فحص أمني
                </Button>
                <div className="flex gap-2">
                  <Input
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="Platform name"
                    data-testid="input-platform-name"
                  />
                  <Button onClick={handleGenerateReport} disabled={isRunning} data-testid="button-generate-report">
                    {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Recent Vulnerabilities | ثغرات حديثة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {vulns.filter(v => v.status === 'open').slice(0, 5).map((vuln) => (
                      <div key={vuln.id} className="flex items-center justify-between gap-2 p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                          <span className="text-sm truncate max-w-[150px]">{vuln.title}</span>
                        </div>
                        {vuln.autoFixAvailable && (
                          <Button size="sm" variant="ghost" onClick={() => handleRemediate(vuln.id)}>
                            <Wrench className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {vulns.filter(v => v.status === 'open').length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No open vulnerabilities
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests" className="flex-1 mt-4">
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((test) => (
                <Card key={test.id} className="hover-elevate">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        {test.name}
                      </CardTitle>
                      <Badge variant="outline">{test.category}</Badge>
                    </div>
                    <CardDescription>{test.nameAr}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                    {test.result && (
                      <div className="text-xs mb-2">
                        <span className={test.result.passed ? 'text-green-500' : 'text-red-500'}>
                          {test.result.message}
                        </span>
                        <span className="text-muted-foreground ml-2">({test.result.duration}ms)</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRunTest(test.id)}
                      data-testid={`button-run-test-${test.id}`}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Run Test
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="security" className="flex-1 mt-4">
          <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
            <h3 className="font-semibold">Vulnerabilities | الثغرات الأمنية</h3>
            <Button onClick={handleScan} disabled={isScanning} data-testid="button-scan-vulnerabilities">
              {isScanning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
              Scan Now | فحص الآن
            </Button>
          </div>
          <ScrollArea className="h-[450px]">
            <div className="space-y-3">
              {vulns.map((vuln) => (
                <Card key={vuln.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={getSeverityColor(vuln.severity)}>{vuln.severity}</Badge>
                          <Badge variant="outline">{vuln.category}</Badge>
                          <Badge variant={vuln.status === 'resolved' ? 'default' : 'secondary'}>
                            {vuln.status}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{vuln.title}</h4>
                        <p className="text-sm text-muted-foreground">{vuln.titleAr}</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" data-testid={`button-view-vuln-${vuln.id}`}>
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{vuln.title}</DialogTitle>
                            <DialogDescription>{vuln.titleAr}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Remediation | المعالجة</h4>
                              <p className="text-sm">{vuln.remediation}</p>
                            </div>
                            {vuln.autoFixAvailable && vuln.status === 'open' && (
                              <Button onClick={() => handleRemediate(vuln.id)} data-testid="button-auto-fix">
                                <Wrench className="w-4 h-4 mr-2" />
                                Auto Fix | إصلاح تلقائي
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {vulns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No vulnerabilities found. Run a scan to check for issues.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="reports" className="flex-1 mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-lg">{report.platformName}</CardTitle>
                      <Badge className={getReadinessColor(report.readinessLevel)}>
                        {report.readinessLevel.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(report.generatedAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Score | الدرجة الإجمالية</span>
                        <span className="text-2xl font-bold">{report.overallScore}%</span>
                      </div>
                      <Progress value={report.overallScore} className="h-3" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 border rounded-md">
                        <div className="text-lg font-bold text-green-500">{report.testResults.passed}</div>
                        <div className="text-xs text-muted-foreground">Passed</div>
                      </div>
                      <div className="text-center p-2 border rounded-md">
                        <div className="text-lg font-bold text-red-500">{report.testResults.failed}</div>
                        <div className="text-xs text-muted-foreground">Failed</div>
                      </div>
                      <div className="text-center p-2 border rounded-md">
                        <div className="text-lg font-bold">{report.testResults.total}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                      </div>
                    </div>

                    {report.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Top Recommendations | أهم التوصيات</h4>
                        <ul className="space-y-1">
                          {report.recommendations.slice(0, 3).map((rec, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <Badge variant="outline" className="shrink-0">P{rec.priority}</Badge>
                              <span>{rec.action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {reports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No reports generated yet. Generate a readiness report to see results.
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default QualityTestingPanel;
