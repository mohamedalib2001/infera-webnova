import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { 
  Smartphone, Monitor, Tablet, CheckCircle2, XCircle, Clock,
  Play, Pause, RefreshCw, Settings, Search, Filter,
  AlertTriangle, Activity, Loader2, Eye, Camera,
  Cpu, BarChart3, TestTube2, Layers, Grid, List
} from "lucide-react";

interface Device {
  id: string;
  name: string;
  platform: 'ios' | 'android';
  osVersion: string;
  manufacturer: string;
  model: string;
  status: 'available' | 'busy' | 'offline';
  category: 'phone' | 'tablet';
}

interface TestRun {
  id: string;
  name: string;
  nameAr: string;
  status: 'running' | 'passed' | 'failed' | 'queued';
  device: string;
  platform: 'ios' | 'android';
  testsTotal: number;
  testsPassed: number;
  testsFailed: number;
  testsSkipped: number;
  duration: string;
  startedAt: string;
  screenshots: number;
  videos: number;
}

interface TestSuite {
  id: string;
  name: string;
  nameAr: string;
  type: 'unit' | 'integration' | 'e2e' | 'visual';
  tests: number;
  lastRun: string;
  passRate: number;
}

const mockDevices: Device[] = [
  { id: "1", name: "iPhone 15 Pro Max", platform: "ios", osVersion: "17.2", manufacturer: "Apple", model: "A3106", status: "available", category: "phone" },
  { id: "2", name: "iPhone 14", platform: "ios", osVersion: "17.1", manufacturer: "Apple", model: "A2882", status: "busy", category: "phone" },
  { id: "3", name: "Samsung Galaxy S24 Ultra", platform: "android", osVersion: "14", manufacturer: "Samsung", model: "SM-S928B", status: "available", category: "phone" },
  { id: "4", name: "Google Pixel 8 Pro", platform: "android", osVersion: "14", manufacturer: "Google", model: "GP8P", status: "available", category: "phone" },
  { id: "5", name: "iPad Pro 12.9", platform: "ios", osVersion: "17.2", manufacturer: "Apple", model: "A2759", status: "available", category: "tablet" },
  { id: "6", name: "Samsung Galaxy Tab S9", platform: "android", osVersion: "14", manufacturer: "Samsung", model: "SM-X710", status: "offline", category: "tablet" },
  { id: "7", name: "iPhone 13 mini", platform: "ios", osVersion: "16.7", manufacturer: "Apple", model: "A2628", status: "available", category: "phone" },
  { id: "8", name: "OnePlus 12", platform: "android", osVersion: "14", manufacturer: "OnePlus", model: "CPH2573", status: "available", category: "phone" },
];

const mockTestRuns: TestRun[] = [
  {
    id: "1",
    name: "Full Regression Suite",
    nameAr: "مجموعة الانحدار الكاملة",
    status: "running",
    device: "iPhone 15 Pro Max",
    platform: "ios",
    testsTotal: 245,
    testsPassed: 189,
    testsFailed: 3,
    testsSkipped: 0,
    duration: "18m 45s",
    startedAt: "2025-12-22T11:00:00Z",
    screenshots: 45,
    videos: 12,
  },
  {
    id: "2",
    name: "Authentication Flow",
    nameAr: "مسار المصادقة",
    status: "passed",
    device: "Samsung Galaxy S24 Ultra",
    platform: "android",
    testsTotal: 32,
    testsPassed: 32,
    testsFailed: 0,
    testsSkipped: 0,
    duration: "4m 12s",
    startedAt: "2025-12-22T10:30:00Z",
    screenshots: 8,
    videos: 2,
  },
  {
    id: "3",
    name: "Payment Integration",
    nameAr: "تكامل الدفع",
    status: "failed",
    device: "Google Pixel 8 Pro",
    platform: "android",
    testsTotal: 18,
    testsPassed: 15,
    testsFailed: 3,
    testsSkipped: 0,
    duration: "2m 56s",
    startedAt: "2025-12-22T10:15:00Z",
    screenshots: 6,
    videos: 1,
  },
  {
    id: "4",
    name: "Visual Regression",
    nameAr: "الانحدار البصري",
    status: "queued",
    device: "iPad Pro 12.9",
    platform: "ios",
    testsTotal: 56,
    testsPassed: 0,
    testsFailed: 0,
    testsSkipped: 0,
    duration: "-",
    startedAt: "-",
    screenshots: 0,
    videos: 0,
  },
];

const mockTestSuites: TestSuite[] = [
  { id: "1", name: "Unit Tests", nameAr: "اختبارات الوحدة", type: "unit", tests: 523, lastRun: "2h ago", passRate: 99.2 },
  { id: "2", name: "Integration Tests", nameAr: "اختبارات التكامل", type: "integration", tests: 156, lastRun: "3h ago", passRate: 97.4 },
  { id: "3", name: "E2E Tests", nameAr: "اختبارات E2E", type: "e2e", tests: 89, lastRun: "1h ago", passRate: 94.3 },
  { id: "4", name: "Visual Tests", nameAr: "الاختبارات البصرية", type: "visual", tests: 234, lastRun: "5h ago", passRate: 98.7 },
];

export default function DeviceTesting() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("runs");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'ios' | 'android'>('all');
  const isRtl = language === "ar";

  const runTestsMutation = useMutation({
    mutationFn: async (suiteId: string) => {
      return apiRequest('POST', `/api/testing/run/${suiteId}`);
    },
    onSuccess: () => {
      toast({
        title: isRtl ? "بدأت الاختبارات" : "Tests Started",
        description: isRtl ? "جاري تشغيل الاختبارات على الأجهزة" : "Running tests on devices"
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { className: string; icon: React.ReactNode; label: string; labelAr: string }> = {
      running: { 
        className: "bg-blue-500/20 text-blue-600 border-blue-500/30", 
        icon: <Loader2 className="w-3 h-3 animate-spin" />,
        label: "Running",
        labelAr: "قيد التشغيل"
      },
      passed: { 
        className: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30", 
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: "Passed",
        labelAr: "نجح"
      },
      failed: { 
        className: "bg-red-500/20 text-red-600 border-red-500/30", 
        icon: <XCircle className="w-3 h-3" />,
        label: "Failed",
        labelAr: "فشل"
      },
      queued: { 
        className: "bg-amber-500/20 text-amber-600 border-amber-500/30", 
        icon: <Clock className="w-3 h-3" />,
        label: "Queued",
        labelAr: "في الانتظار"
      },
      available: { 
        className: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30", 
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: "Available",
        labelAr: "متاح"
      },
      busy: { 
        className: "bg-amber-500/20 text-amber-600 border-amber-500/30", 
        icon: <Activity className="w-3 h-3" />,
        label: "Busy",
        labelAr: "مشغول"
      },
      offline: { 
        className: "bg-slate-500/20 text-slate-500 border-slate-500/30", 
        icon: <Pause className="w-3 h-3" />,
        label: "Offline",
        labelAr: "غير متصل"
      },
    };
    const config = configs[status] || configs.queued;
    return (
      <Badge className={config.className}>
        {config.icon}
        <span className="ml-1">{isRtl ? config.labelAr : config.label}</span>
      </Badge>
    );
  };

  const filteredDevices = mockDevices.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || d.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-col h-screen">
        <header className="px-6 py-4 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30">
                <TestTube2 className="w-7 h-7 text-cyan-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" data-testid="text-testing-title">
                  {isRtl ? "اختبار الأجهزة الحقيقية" : "Real Device Testing"}
                </h1>
                <p className="text-sm text-slate-400">
                  {isRtl ? "اختبار على أكثر من 3000 جهاز حقيقي" : "Test on 3000+ real devices"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                <Smartphone className="w-3 h-3 mr-1" />
                {mockDevices.filter(d => d.status === 'available').length} {isRtl ? "متاح" : "Available"}
              </Badge>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{mockDevices.length}</p>
                    <p className="text-xs text-slate-400">{isRtl ? "إجمالي الأجهزة" : "Total Devices"}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Smartphone className="w-5 h-5 text-cyan-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{mockTestRuns.filter(r => r.status === 'running').length}</p>
                    <p className="text-xs text-slate-400">{isRtl ? "اختبارات نشطة" : "Active Tests"}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Activity className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">97.8%</p>
                    <p className="text-xs text-slate-400">{isRtl ? "معدل النجاح" : "Pass Rate"}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">1,002</p>
                    <p className="text-xs text-slate-400">{isRtl ? "اختبارات اليوم" : "Tests Today"}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <BarChart3 className="w-5 h-5 text-violet-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 border-slate-700/50 mb-4">
              <TabsTrigger value="runs" className="gap-2">
                <Activity className="w-4 h-4" />
                {isRtl ? "عمليات التشغيل" : "Test Runs"}
              </TabsTrigger>
              <TabsTrigger value="devices" className="gap-2">
                <Smartphone className="w-4 h-4" />
                {isRtl ? "الأجهزة" : "Devices"}
              </TabsTrigger>
              <TabsTrigger value="suites" className="gap-2">
                <Layers className="w-4 h-4" />
                {isRtl ? "مجموعات الاختبار" : "Test Suites"}
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-320px)]">
              <TabsContent value="runs" className="mt-0">
                <div className="space-y-4">
                  {mockTestRuns.map((run) => (
                    <Card 
                      key={run.id} 
                      className="bg-slate-800/50 border-slate-700/50 hover-elevate cursor-pointer"
                      data-testid={`card-testrun-${run.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${run.platform === 'ios' ? 'bg-blue-500/20' : 'bg-emerald-500/20'}`}>
                              <Smartphone className={`w-5 h-5 ${run.platform === 'ios' ? 'text-blue-400' : 'text-emerald-400'}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{isRtl ? run.nameAr : run.name}</h3>
                              <p className="text-sm text-slate-400">{run.device}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(run.status)}
                            <span className="text-sm text-slate-400 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {run.duration}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-400">
                              {run.testsPassed + run.testsFailed} / {run.testsTotal} {isRtl ? "اختبار" : "tests"}
                            </span>
                            <span className="text-sm text-slate-400">
                              {Math.round((run.testsPassed / run.testsTotal) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={(run.testsPassed / run.testsTotal) * 100} 
                            className="h-2"
                          />
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{run.testsPassed} {isRtl ? "نجح" : "passed"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-400">
                            <XCircle className="w-4 h-4" />
                            <span>{run.testsFailed} {isRtl ? "فشل" : "failed"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Camera className="w-4 h-4" />
                            <span>{run.screenshots} {isRtl ? "لقطات" : "screenshots"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Eye className="w-4 h-4" />
                            <span>{run.videos} {isRtl ? "فيديوهات" : "videos"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="devices" className="mt-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder={isRtl ? "بحث عن جهاز..." : "Search devices..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700/50"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={platformFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPlatformFilter('all')}
                    >
                      {isRtl ? "الكل" : "All"}
                    </Button>
                    <Button
                      variant={platformFilter === 'ios' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPlatformFilter('ios')}
                    >
                      iOS
                    </Button>
                    <Button
                      variant={platformFilter === 'android' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPlatformFilter('android')}
                    >
                      Android
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className={viewMode === 'grid' ? "grid grid-cols-4 gap-4" : "space-y-3"}>
                  {filteredDevices.map((device) => (
                    <Card 
                      key={device.id} 
                      className="bg-slate-800/50 border-slate-700/50 hover-elevate cursor-pointer"
                      data-testid={`card-device-${device.id}`}
                    >
                      <CardContent className={viewMode === 'grid' ? "p-4" : "p-4 flex items-center justify-between"}>
                        <div className={viewMode === 'grid' ? "" : "flex items-center gap-4"}>
                          <div className={`p-3 rounded-lg ${device.platform === 'ios' ? 'bg-blue-500/20' : 'bg-emerald-500/20'} ${viewMode === 'grid' ? 'mb-3 w-fit' : ''}`}>
                            {device.category === 'tablet' ? (
                              <Tablet className={`w-6 h-6 ${device.platform === 'ios' ? 'text-blue-400' : 'text-emerald-400'}`} />
                            ) : (
                              <Smartphone className={`w-6 h-6 ${device.platform === 'ios' ? 'text-blue-400' : 'text-emerald-400'}`} />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm">{device.name}</h4>
                            <p className="text-xs text-slate-400">{device.platform.toUpperCase()} {device.osVersion}</p>
                            {viewMode === 'grid' && (
                              <p className="text-xs text-slate-500 mt-1">{device.manufacturer}</p>
                            )}
                          </div>
                        </div>
                        <div className={viewMode === 'grid' ? "mt-3 flex items-center justify-between" : ""}>
                          {getStatusBadge(device.status)}
                          {viewMode === 'grid' && device.status === 'available' && (
                            <Button size="sm" variant="ghost" className="gap-1 h-7">
                              <Play className="w-3 h-3" />
                              {isRtl ? "تشغيل" : "Run"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="suites" className="mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {mockTestSuites.map((suite) => (
                    <Card 
                      key={suite.id} 
                      className="bg-slate-800/50 border-slate-700/50"
                      data-testid={`card-suite-${suite.id}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-violet-500/20">
                              <Layers className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                              <CardTitle className="text-base text-white">{isRtl ? suite.nameAr : suite.name}</CardTitle>
                              <p className="text-xs text-slate-400 capitalize">{suite.type}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {suite.tests} {isRtl ? "اختبار" : "tests"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-slate-400">{isRtl ? "معدل النجاح" : "Pass Rate"}</span>
                          <span className={`text-sm font-semibold ${suite.passRate >= 95 ? 'text-emerald-400' : suite.passRate >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                            {suite.passRate}%
                          </span>
                        </div>
                        <Progress value={suite.passRate} className="h-2 mb-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {isRtl ? "آخر تشغيل" : "Last run"}: {suite.lastRun}
                          </span>
                          <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => runTestsMutation.mutate(suite.id)}
                            disabled={runTestsMutation.isPending}
                          >
                            {runTestsMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            {isRtl ? "تشغيل" : "Run"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
