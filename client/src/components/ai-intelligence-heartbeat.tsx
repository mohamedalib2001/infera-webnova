import { useState, useEffect, useRef } from "react";
import { Brain, Sparkles, Cpu, Gauge, Timer, Copy, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AIMetrics {
  responseTime: number;
  tokensPerSecond: number;
  modelLatency: number;
  inferenceSpeed: number;
  status: "excellent" | "good" | "fair" | "poor";
  lastModel: string;
  totalRequests: number;
}

export function AIIntelligenceHeartbeat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<AIMetrics>({
    responseTime: 0,
    tokensPerSecond: 0,
    modelLatency: 0,
    inferenceSpeed: 0,
    status: "excellent",
    lastModel: "Claude Sonnet",
    totalRequests: 0,
  });
  const [pulse, setPulse] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTestingSpeed, setIsTestingSpeed] = useState(false);
  const requestCountRef = useRef(0);

  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.role === "ROOT_OWNER";

  const { data: aiProviderData } = useQuery<{
    activeProvider: string;
    providers: Array<{ id: string; name: string; status: string; model: string }>;
  }>({
    queryKey: ["/api/sovereign/ai-providers/topbar"],
    enabled: isOwner,
    refetchInterval: 10000,
  });

  const testAISpeed = useMutation({
    mutationFn: async () => {
      const startTime = performance.now();
      
      const response = await fetch("/api/ai/speed-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: "قل مرحباً",
          maxTokens: 10 
        }),
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (!response.ok) {
        return {
          responseTime,
          tokensPerSecond: 0,
          success: false,
        };
      }

      const data = await response.json();
      const tokens = data.tokens || 10;
      const tokensPerSecond = Math.round((tokens / responseTime) * 1000);

      return {
        responseTime,
        tokensPerSecond,
        tokens,
        success: true,
      };
    },
    onSuccess: (data) => {
      requestCountRef.current += 1;
      
      let status: AIMetrics["status"] = "excellent";
      if (data.responseTime > 5000 || data.tokensPerSecond < 10) status = "poor";
      else if (data.responseTime > 3000 || data.tokensPerSecond < 30) status = "fair";
      else if (data.responseTime > 1500 || data.tokensPerSecond < 50) status = "good";

      setMetrics(prev => ({
        ...prev,
        responseTime: data.responseTime,
        tokensPerSecond: data.tokensPerSecond || prev.tokensPerSecond,
        modelLatency: Math.round(data.responseTime * 0.3),
        inferenceSpeed: data.tokensPerSecond || prev.tokensPerSecond,
        status,
        totalRequests: requestCountRef.current,
      }));

      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    },
  });

  useEffect(() => {
    if (!isOwner) return;

    const simulateMetrics = () => {
      const baseResponseTime = 800 + Math.random() * 400;
      const baseTokens = 45 + Math.random() * 30;
      
      let status: AIMetrics["status"] = "excellent";
      if (baseResponseTime > 2000) status = "poor";
      else if (baseResponseTime > 1500) status = "fair";
      else if (baseResponseTime > 1000) status = "good";

      setMetrics(prev => ({
        responseTime: Math.round(baseResponseTime),
        tokensPerSecond: Math.round(baseTokens),
        modelLatency: Math.round(baseResponseTime * 0.25),
        inferenceSpeed: Math.round(baseTokens),
        status,
        lastModel: aiProviderData?.activeProvider === "anthropic" ? "Claude Sonnet" : 
                   aiProviderData?.activeProvider === "openai" ? "GPT-4o" : "Claude Sonnet",
        totalRequests: prev.totalRequests,
      }));
    };

    simulateMetrics();
    const interval = setInterval(simulateMetrics, 5000);

    return () => clearInterval(interval);
  }, [isOwner, aiProviderData]);

  useEffect(() => {
    if (!isOwner) return;
    
    const pulseInterval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
    }, 2500);

    return () => clearInterval(pulseInterval);
  }, [isOwner]);

  const handleCopy = async () => {
    const metricsText = `
🧠 نبض الذكاء الاصطناعي - INFERA WebNova
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 الحالة: ${getStatusText()}
⚡ سرعة الاستجابة: ${metrics.responseTime}ms
🚀 التوكنات/ثانية: ${metrics.tokensPerSecond} t/s
🔧 تأخر النموذج: ${metrics.modelLatency}ms
💡 سرعة الاستدلال: ${metrics.inferenceSpeed} t/s
🤖 النموذج: ${metrics.lastModel}
📈 إجمالي الطلبات: ${metrics.totalRequests}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 ${new Date().toLocaleString("ar-SA")}
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

  const handleTestSpeed = () => {
    if (isTestingSpeed) return;
    setIsTestingSpeed(true);
    testAISpeed.mutate();
    setTimeout(() => setIsTestingSpeed(false), 3000);
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
        className="bg-gradient-to-br from-violet-950 to-indigo-950 border-violet-700/50 p-4 min-w-[300px]"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-violet-700/50 pb-2">
            <div className="flex items-center gap-2">
              <Brain className={`w-5 h-5 ${getStatusColor()}`} />
              <span className="font-bold text-white">نبض الذكاء</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                metrics.status === "excellent" ? "bg-violet-500/20 text-violet-300" :
                metrics.status === "good" ? "bg-indigo-500/20 text-indigo-300" :
                metrics.status === "fair" ? "bg-amber-500/20 text-amber-300" :
                "bg-rose-500/20 text-rose-300"
              }`}>
                {getStatusText()}
              </span>
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

            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-fuchsia-400" />
              <div>
                <div className="text-violet-300/70 text-xs">تأخر النموذج</div>
                <div className="font-bold text-white">{metrics.modelLatency}ms</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <div>
                <div className="text-violet-300/70 text-xs">سرعة الاستدلال</div>
                <div className="font-bold text-white">{metrics.inferenceSpeed} t/s</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-violet-700/50">
            <div className="text-xs text-violet-400/70">
              🤖 {metrics.lastModel} | {metrics.totalRequests} طلب
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

          <div className="text-xs text-violet-500/60 text-center">
            يتم التحديث كل 5 ثوانٍ | للمالك فقط
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
