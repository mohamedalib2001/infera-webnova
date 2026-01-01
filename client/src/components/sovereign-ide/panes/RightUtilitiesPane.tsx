import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Wrench,
  Shield,
  Bug,
  Store,
  Crown,
  Lightbulb,
  Wand2,
  Target,
  Rocket,
  Code2,
  FileSearch,
  TestTube,
  GitBranch,
  Cloud,
  Globe,
  Key,
  Activity,
  Workflow,
  BarChart3,
  Layers,
  Database,
} from "lucide-react";
import type { RightTab } from "../utils/ide-types";

interface RightUtilitiesPaneProps {
  isRtl: boolean;
  activeTab: RightTab;
  setActiveTab: (tab: RightTab) => void;
  isConnected?: boolean;
  onGenerateCode?: () => void;
  onAnalyzeCode?: () => void;
  onTestCode?: () => void;
  onOptimizeCode?: () => void;
  onSecurityScan?: () => void;
  isProcessing?: boolean;
}

export function RightUtilitiesPane({
  isRtl,
  activeTab,
  setActiveTab,
  isConnected = true,
  onGenerateCode,
  onAnalyzeCode,
  onTestCode,
  onOptimizeCode,
  onSecurityScan,
  isProcessing = false,
}: RightUtilitiesPaneProps) {
  const text = {
    tools: isRtl ? "الأدوات" : "Tools",
    compliance: isRtl ? "الامتثال" : "Compliance",
    debugger: isRtl ? "المصحح" : "Debugger",
    marketplace: isRtl ? "السوق" : "Marketplace",
    welcomeOwner: isRtl ? "مرحباً سيدي المالك" : "Welcome, Owner",
    allSystems: isRtl ? "جميع الأنظمة تعمل بكفاءة" : "All systems operational",
    smartSuggestions: isRtl ? "اقتراحات ذكية" : "Smart Suggestions",
    optimizePerformance: isRtl ? "تحسين الأداء" : "Optimize Performance",
    securityScan: isRtl ? "فحص أمني" : "Security Scan",
    codeHints: isRtl ? "تلميحات الكود" : "Code Hints",
    quickActions: isRtl ? "إجراءات سريعة" : "Quick Actions",
    generate: isRtl ? "توليد" : "Generate",
    analyze: isRtl ? "تحليل" : "Analyze",
    test: isRtl ? "اختبار" : "Test",
    deploy: isRtl ? "نشر" : "Deploy",
    devTools: isRtl ? "أدوات التطوير" : "Dev Tools",
    liveMetrics: isRtl ? "المقاييس الحية" : "Live Metrics",
    connections: isRtl ? "الاتصالات" : "Connections",
    connected: isRtl ? "متصل" : "Connected",
    disconnected: isRtl ? "غير متصل" : "Disconnected",
    memory: isRtl ? "الذاكرة" : "Memory",
    response: isRtl ? "الاستجابة" : "Response",
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RightTab)} className="h-full flex flex-col">
        <div className="border-b px-1 overflow-x-auto">
          <TabsList className="h-8 bg-transparent p-0 flex-wrap">
            <TabsTrigger value="tools" className="text-[10px] px-2 h-7" data-testid="tab-tools">
              <Wrench className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="compliance" className="text-[10px] px-2 h-7" data-testid="tab-compliance">
              <Shield className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="debugger" className="text-[10px] px-2 h-7" data-testid="tab-debugger">
              <Bug className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="text-[10px] px-2 h-7" data-testid="tab-marketplace">
              <Store className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="database" className="text-[10px] px-2 h-7" data-testid="tab-database">
              <Database className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tools" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full p-2">
            <Card className="bg-gradient-to-br from-amber-500/20 via-violet-500/10 to-transparent border-amber-500/30 mb-2">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-full bg-amber-500/20">
                    <Crown className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">{text.welcomeOwner}</p>
                    <p className="text-[10px] text-muted-foreground">Mohamed Ali Abdalla</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-green-400">
                  <Activity className="h-3 w-3" />
                  <span>{text.allSystems}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-violet-500/5 border-violet-500/20 mb-2">
              <CardHeader className="p-2 pb-1">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  {text.smartSuggestions}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 space-y-1.5">
                <button className="w-full flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left transition-colors" onClick={onOptimizeCode} disabled={isProcessing} data-testid="button-optimize">
                  <Wand2 className="h-3.5 w-3.5 text-violet-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-medium">{text.optimizePerformance}</p>
                    <p className="text-[10px] text-muted-foreground">{isRtl ? "3 تحسينات متاحة" : "3 optimizations available"}</p>
                  </div>
                </button>
                <button className="w-full flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left transition-colors" onClick={onSecurityScan} disabled={isProcessing} data-testid="button-security">
                  <Shield className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-medium">{text.securityScan}</p>
                    <p className="text-[10px] text-muted-foreground">{isRtl ? "لم يتم العثور على ثغرات" : "No vulnerabilities found"}</p>
                  </div>
                </button>
                <button className="w-full flex items-start gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left transition-colors">
                  <Target className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-medium">{text.codeHints}</p>
                    <p className="text-[10px] text-muted-foreground">{isRtl ? "2 تحسينات مقترحة" : "2 improvements suggested"}</p>
                  </div>
                </button>
              </CardContent>
            </Card>

            <Card className="mb-2">
              <CardHeader className="p-2 pb-1">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Rocket className="h-3.5 w-3.5 text-orange-400" />
                  {text.quickActions}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <div className="grid grid-cols-2 gap-1.5">
                  <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" onClick={onGenerateCode} disabled={isProcessing}>
                    <Code2 className="h-4 w-4 text-violet-400" />
                    {text.generate}
                  </Button>
                  <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" onClick={onAnalyzeCode} disabled={isProcessing}>
                    <FileSearch className="h-4 w-4 text-blue-400" />
                    {text.analyze}
                  </Button>
                  <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]" onClick={onTestCode} disabled={isProcessing}>
                    <TestTube className="h-4 w-4 text-green-400" />
                    {text.test}
                  </Button>
                  <Button size="sm" variant="outline" className="h-auto py-2 flex-col gap-1 text-[10px]">
                    <Rocket className="h-4 w-4 text-orange-400" />
                    {text.deploy}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-2">
              <CardHeader className="p-2 pb-1">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" />
                  {text.devTools}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 space-y-1">
                <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                  <span className="flex items-center gap-2">
                    <GitBranch className="h-3.5 w-3.5 text-orange-400" />
                    <span>Git</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] h-5">main</Badge>
                </button>
                <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                  <span className="flex items-center gap-2">
                    <Cloud className="h-3.5 w-3.5 text-blue-400" />
                    <span>{isRtl ? "السحابة" : "Cloud"}</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] h-5 text-green-400">{isRtl ? "مباشر" : "Live"}</Badge>
                </button>
                <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                  <span className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-violet-400" />
                    <span>API</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] h-5">{isRtl ? "12 نقطة" : "12 endpoints"}</Badge>
                </button>
                <button className="w-full flex items-center justify-between p-1.5 rounded text-xs hover:bg-muted transition-colors">
                  <span className="flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-amber-400" />
                    <span>{isRtl ? "المفاتيح" : "Secrets"}</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] h-5">{isRtl ? "آمنة" : "Secure"}</Badge>
                </button>
              </CardContent>
            </Card>

            <Card className="mb-2">
              <CardHeader className="p-2 pb-1">
                <CardTitle className="text-xs flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                  {text.liveMetrics}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">CPU</span>
                    <span className="text-green-400">12%</span>
                  </div>
                  <Progress value={12} className="h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">{text.memory}</span>
                    <span className="text-blue-400">45%</span>
                  </div>
                  <Progress value={45} className="h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">{text.response}</span>
                    <span className="text-violet-400">&lt;0.001s</span>
                  </div>
                  <Progress value={5} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-2 pb-1">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Workflow className="h-3.5 w-3.5 text-green-400" />
                  {text.connections}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                    AI WebSocket
                  </span>
                  <span className={isConnected ? "text-green-400" : "text-red-400"}>
                    {isConnected ? text.connected : text.disconnected}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    Database
                  </span>
                  <span className="text-green-400">{text.connected}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    {isRtl ? "التشفير" : "Encryption"}
                  </span>
                  <span className="text-amber-400">AES-256-GCM</span>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>

        {(["compliance", "debugger", "marketplace", "database"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="flex-1 m-0 p-2">
            <div className="text-center text-muted-foreground text-sm py-8">
              {isRtl ? "قيد التطوير" : `${tab.charAt(0).toUpperCase() + tab.slice(1)} coming soon`}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
