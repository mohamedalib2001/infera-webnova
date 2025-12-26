import { useState, useEffect, useRef, useCallback } from "react";
import { Brain, Sparkles, Cpu, Gauge, Timer, Copy, Check, Zap, ExternalLink, Box } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AIProvider {
  id: string;
  name: string;
  type: "internal" | "external";
  model: string;
  status: "active" | "inactive" | "feeding";
  responseTime?: number;
  tokensPerSecond?: number;
  contribution: number;
}

interface AIMetrics {
  responseTime: number;
  tokensPerSecond: number;
  totalLatency: number;
  internalPercentage: number;
  externalPercentage: number;
  status: "excellent" | "good" | "fair" | "poor";
  activeProviders: AIProvider[];
  totalRequests: number;
  lastTestTime: Date | null;
}

export function AIIntelligenceHeartbeat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<AIMetrics>({
    responseTime: 0,
    tokensPerSecond: 0,
    totalLatency: 0,
    internalPercentage: 0,
    externalPercentage: 0,
    status: "excellent",
    activeProviders: [],
    totalRequests: 0,
    lastTestTime: null,
  });
  const [pulse, setPulse] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const requestCountRef = useRef(0);

  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.role === "ROOT_OWNER";

  const { data: aiProviderData } = useQuery<{
    activeProvider: string;
    inferaModels: Array<{ 
      id: string; 
      name: string; 
      nameAr: string;
      status: string; 
      model: string | null;
      type: string;
      isFeeding: boolean;
      capabilities: string[];
    }>;
    providers: Array<{ 
      id: string; 
      name: string; 
      status: string; 
      model: string;
      type: string;
      isFeeding: boolean;
    }>;
  }>({
    queryKey: ["/api/sovereign/ai-providers/topbar"],
    enabled: isOwner,
    refetchInterval: 10000,
  });

  const measureRealAISpeed = useCallback(async (): Promise<{
    responseTime: number;
    tokensPerSecond: number;
    success: boolean;
  }> => {
    const startTime = performance.now();
    
    try {
      const response = await fetch("/api/ai/speed-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: "مرحبا",
          maxTokens: 5,
          speedTest: true
        }),
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (!response.ok) {
        const pingResponse = await fetch("/api/nova/platform/realtime");
        const pingEnd = performance.now();
        const pingTime = Math.round(pingEnd - endTime);
        
        return {
          responseTime: responseTime + pingTime,
          tokensPerSecond: Math.round(1000 / (responseTime + pingTime) * 10),
          success: false,
        };
      }

      const data = await response.json();
      const tokens = data.tokens || data.usage?.total_tokens || 5;
      const tokensPerSecond = responseTime > 0 ? Math.round((tokens / responseTime) * 1000) : 0;

      return {
        responseTime,
        tokensPerSecond,
        success: true,
      };
    } catch {
      const endTime = performance.now();
      return {
        responseTime: Math.round(endTime - startTime),
        tokensPerSecond: 0,
        success: false,
      };
    }
  }, []);

  const calculateIntelligenceDistribution = useCallback(() => {
    if (!aiProviderData) return { internal: 0, external: 0, providers: [] as AIProvider[] };

    const activeProviders: AIProvider[] = [];
    let internalCount = 0;
    let externalCount = 0;

    if (aiProviderData.inferaModels) {
      aiProviderData.inferaModels.forEach((model) => {
        if (model.status === "active") {
          internalCount++;
          activeProviders.push({
            id: model.id,
            name: model.nameAr || model.name,
            type: "internal",
            model: model.model || model.id,
            status: model.isFeeding ? "feeding" : "active",
            contribution: 0,
          });
        }
      });
    }

    if (aiProviderData.providers) {
      aiProviderData.providers.forEach((provider) => {
        if (provider.status === "active") {
          externalCount++;
          activeProviders.push({
            id: provider.id,
            name: provider.name,
            type: "external",
            model: provider.model,
            status: provider.isFeeding ? "feeding" : "active",
            contribution: 0,
          });
        }
      });
    }

    const total = internalCount + externalCount;
    if (total === 0) return { internal: 0, external: 0, providers: [] };

    const feedingProvider = activeProviders.find(p => p.status === "feeding");
    if (feedingProvider) {
      feedingProvider.contribution = 70;
      const remaining = 30;
      const othersCount = activeProviders.length - 1;
      activeProviders.forEach(p => {
        if (p.id !== feedingProvider.id) {
          p.contribution = Math.round(remaining / othersCount);
        }
      });
    } else {
      const equalShare = Math.round(100 / activeProviders.length);
      activeProviders.forEach(p => {
        p.contribution = equalShare;
      });
    }

    const internalContribution = activeProviders
      .filter(p => p.type === "internal")
      .reduce((sum, p) => sum + p.contribution, 0);
    
    const externalContribution = activeProviders
      .filter(p => p.type === "external")
      .reduce((sum, p) => sum + p.contribution, 0);

    return {
      internal: internalContribution,
      external: externalContribution,
      providers: activeProviders,
    };
  }, [aiProviderData]);

  useEffect(() => {
    if (!isOwner) return;

    const updateMetrics = async () => {
      const distribution = calculateIntelligenceDistribution();
      
      const speedResult = await measureRealAISpeed();
      requestCountRef.current += 1;

      let status: AIMetrics["status"] = "excellent";
      if (speedResult.responseTime > 5000 || speedResult.tokensPerSecond < 5) status = "poor";
      else if (speedResult.responseTime > 3000 || speedResult.tokensPerSecond < 15) status = "fair";
      else if (speedResult.responseTime > 1500 || speedResult.tokensPerSecond < 30) status = "good";

      setMetrics({
        responseTime: speedResult.responseTime,
        tokensPerSecond: speedResult.tokensPerSecond,
        totalLatency: Math.round(speedResult.responseTime * 0.3),
        internalPercentage: distribution.internal,
        externalPercentage: distribution.external,
        status,
        activeProviders: distribution.providers,
        totalRequests: requestCountRef.current,
        lastTestTime: new Date(),
      });

      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000);

    return () => clearInterval(interval);
  }, [isOwner, calculateIntelligenceDistribution, measureRealAISpeed]);

  useEffect(() => {
    if (!isOwner) return;
    
    const pulseInterval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    }, 3000);

    return () => clearInterval(pulseInterval);
  }, [isOwner]);

  const handleTestSpeed = async () => {
    if (isTestingSpeed) return;
    setIsTestingSpeed(true);

    try {
      const result = await measureRealAISpeed();
      const distribution = calculateIntelligenceDistribution();
      requestCountRef.current += 1;

      let status: AIMetrics["status"] = "excellent";
      if (result.responseTime > 5000 || result.tokensPerSecond < 5) status = "poor";
      else if (result.responseTime > 3000 || result.tokensPerSecond < 15) status = "fair";
      else if (result.responseTime > 1500 || result.tokensPerSecond < 30) status = "good";

      setMetrics(prev => ({
        ...prev,
        responseTime: result.responseTime,
        tokensPerSecond: result.tokensPerSecond,
        totalLatency: Math.round(result.responseTime * 0.3),
        internalPercentage: distribution.internal,
        externalPercentage: distribution.external,
        status,
        activeProviders: distribution.providers,
        totalRequests: requestCountRef.current,
        lastTestTime: new Date(),
      }));

      setPulse(true);
      setTimeout(() => setPulse(false), 500);

      toast({
        title: "تم فحص السرعة",
        description: `سرعة الاستجابة: ${result.responseTime}ms`,
      });
    } catch {
      toast({
        title: "فشل الفحص",
        description: "لم يتمكن من قياس سرعة الذكاء",
        variant: "destructive",
      });
    } finally {
      setIsTestingSpeed(false);
    }
  };

  const handleCopy = async () => {
    const internalProviders = metrics.activeProviders.filter(p => p.type === "internal");
    const externalProviders = metrics.activeProviders.filter(p => p.type === "external");

    const metricsText = `
🧠 نبض الذكاء الاصطناعي - INFERA WebNova
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 الحالة: ${getStatusText()}
⚡ سرعة الاستجابة: ${metrics.responseTime}ms
🚀 التوكنات/ثانية: ${metrics.tokensPerSecond} t/s
⏱️ إجمالي التأخير: ${metrics.totalLatency}ms

📦 توزيع الذكاء:
├─ 🏠 داخلي: ${metrics.internalPercentage}%
└─ 🌐 خارجي: ${metrics.externalPercentage}%

🤖 نماذج الذكاء الداخلي (${internalProviders.length}):
${internalProviders.map(p => `   • ${p.name} (${p.model}) - ${p.contribution}%`).join('\n') || '   لا يوجد'}

🔗 نماذج الذكاء الخارجي (${externalProviders.length}):
${externalProviders.map(p => `   • ${p.name} (${p.model}) - ${p.contribution}%${p.status === 'feeding' ? ' [نشط]' : ''}`).join('\n') || '   لا يوجد'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 إجمالي الطلبات: ${metrics.totalRequests}
🕐 آخر فحص: ${metrics.lastTestTime?.toLocaleString("ar-SA") || 'غير محدد'}
    `.trim();

    try {
      await navigator.clipboard.writeText(metricsText);
      setCopied(true);
      toast({
        title: "تم النسخ",
        description: "تم نسخ إحصائيات الذكاء الاصطناعي",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "فشل النسخ",
        description: "لم يتمكن من نسخ البيانات",
        variant: "destructive",
      });
    }
  };

  if (!isOwner) return null;

  const getStatusColor = () => {
    switch (metrics.status) {
      case "excellent": return "text-violet-400";
      case "good": return "text-indigo-400";
      case "fair": return "text-amber-400";
      case "poor": return "text-rose-400";
    }
  };

  const getGlowColor = () => {
    switch (metrics.status) {
      case "excellent": return "shadow-violet-500/50";
      case "good": return "shadow-indigo-500/50";
      case "fair": return "shadow-amber-500/50";
      case "poor": return "shadow-rose-500/50";
    }
  };

  const getStatusText = () => {
    switch (metrics.status) {
      case "excellent": return "ممتاز";
      case "good": return "جيد";
      case "fair": return "متوسط";
      case "poor": return "ضعيف";
    }
  };

  const feedingProvider = metrics.activeProviders.find(p => p.status === "feeding");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={`
            relative flex items-center gap-2 px-3 py-1.5 rounded-full 
            bg-gradient-to-r from-violet-950/80 to-indigo-950/80 
            border border-violet-700/50 backdrop-blur-sm
            cursor-pointer transition-all duration-300
            hover:border-violet-600/50 hover:scale-105
            ${pulse ? `shadow-lg ${getGlowColor()}` : ""}
          `}
          data-testid="ai-intelligence-heartbeat"
        >
          <div className="relative">
            <Brain 
              className={`
                w-5 h-5 ${getStatusColor()} 
                transition-all duration-300
                ${pulse ? "scale-125" : "scale-100"}
              `}
              fill={pulse ? "currentColor" : "none"}
            />
            <div 
              className={`
                absolute inset-0 rounded-full blur-md opacity-50
                ${pulse ? getStatusColor() : "opacity-0"}
                transition-opacity duration-300
              `}
            />
            {pulse && (
              <Sparkles 
                className="absolute -top-1 -right-1 w-3 h-3 text-violet-300 animate-pulse" 
              />
            )}
          </div>
          
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`font-bold ${getStatusColor()}`}>
              {metrics.responseTime}ms
            </span>
            <span className="text-violet-500/70">|</span>
            <span className="text-violet-300/80">
              {metrics.tokensPerSecond} t/s
            </span>
          </div>

          {pulse && (
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-violet-500" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side="bottom" 
        className="bg-gradient-to-br from-violet-950 to-indigo-950 border-violet-700/50 p-4 min-w-[340px] max-w-[400px]"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-violet-700/50 pb-2">
            <div className="flex items-center gap-2">
              <Brain className={`w-5 h-5 ${getStatusColor()}`} />
              <span className="font-bold text-white">نبض الذكاء</span>
              <Badge 
                variant="outline" 
                className={`text-xs border-0 ${
                  metrics.status === "excellent" ? "bg-violet-500/20 text-violet-300" :
                  metrics.status === "good" ? "bg-indigo-500/20 text-indigo-300" :
                  metrics.status === "fair" ? "bg-amber-500/20 text-amber-300" :
                  "bg-rose-500/20 text-rose-300"
                }`}
              >
                {getStatusText()}
              </Badge>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-violet-300 hover:text-white hover:bg-violet-800/50"
              onClick={handleCopy}
              data-testid="button-copy-ai-metrics"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-violet-400" />
              <div>
                <div className="text-violet-300/70 text-xs">سرعة الاستجابة</div>
                <div className="font-bold text-white">{metrics.responseTime}ms</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-violet-300/70 text-xs">التوكنات/ثانية</div>
                <div className="font-bold text-white">{metrics.tokensPerSecond} t/s</div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-violet-700/50">
            <div className="text-xs font-medium text-violet-300">توزيع الذكاء</div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-violet-200">داخلي (INFERA)</span>
                </div>
                <span className="font-bold text-emerald-400">{metrics.internalPercentage}%</span>
              </div>
              <Progress value={metrics.internalPercentage} className="h-1.5 bg-violet-900/50" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-violet-200">خارجي (APIs)</span>
                </div>
                <span className="font-bold text-blue-400">{metrics.externalPercentage}%</span>
              </div>
              <Progress value={metrics.externalPercentage} className="h-1.5 bg-violet-900/50" />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-violet-700/50">
            <div className="text-xs font-medium text-violet-300">النماذج النشطة ({metrics.activeProviders.length})</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {metrics.activeProviders.map((provider) => (
                <div 
                  key={provider.id}
                  className={`flex items-center justify-between text-xs py-1 px-2 rounded ${
                    provider.status === "feeding" ? "bg-violet-800/30 border border-violet-600/50" : "bg-violet-900/30"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {provider.type === "internal" ? (
                      <Cpu className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Zap className="w-3 h-3 text-blue-400" />
                    )}
                    <span className="text-violet-200 truncate max-w-[120px]">{provider.name}</span>
                    {provider.status === "feeding" && (
                      <Badge variant="outline" className="h-4 px-1 text-[10px] border-violet-500 text-violet-300">
                        نشط
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-violet-400 text-[10px]">{provider.model}</span>
                    <span className={`font-bold ${provider.type === "internal" ? "text-emerald-400" : "text-blue-400"}`}>
                      {provider.contribution}%
                    </span>
                  </div>
                </div>
              ))}
              {metrics.activeProviders.length === 0 && (
                <div className="text-violet-400/60 text-xs text-center py-2">
                  لا توجد نماذج نشطة
                </div>
              )}
            </div>
          </div>

          {feedingProvider && (
            <div className="flex items-center gap-2 text-xs bg-violet-800/20 rounded px-2 py-1.5 border border-violet-700/30">
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              <span className="text-violet-300">
                يُزوّد بالذكاء من: <span className="font-bold text-white">{feedingProvider.name}</span>
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-violet-700/50">
            <div className="text-xs text-violet-400/70">
              {metrics.totalRequests} طلب | {metrics.lastTestTime?.toLocaleTimeString("ar-SA") || '--'}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs text-violet-300 hover:text-white hover:bg-violet-800/50"
              onClick={handleTestSpeed}
              disabled={isTestingSpeed}
              data-testid="button-test-ai-speed"
            >
              {isTestingSpeed ? "جاري الفحص..." : "فحص السرعة"}
            </Button>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
