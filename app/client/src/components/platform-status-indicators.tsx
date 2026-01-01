import { useState, useEffect } from "react";
import { Heart, Brain, Copy, Check, Activity, AlertTriangle, XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { usePlatformHealth, type HealthStatus, type PlatformIssue, getSpeedLevel, getIntelligenceLevel } from "@/lib/platform-metrics-context";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type SpeedLevel = "excellent" | "good" | "moderate" | "slow" | "critical";
type IntelligenceLevel = "genius" | "advanced" | "standard" | "basic" | "minimal";

interface PlatformMetrics {
  speedScore: number;
  intelligenceScore: number;
  activeModels: number;
  totalRequests: number;
  avgResponseTime: number;
  uptime: number;
}

const speedColors: Record<SpeedLevel, { base: string; glow: string; text: string }> = {
  excellent: { base: "text-green-500", glow: "shadow-green-500/50", text: "text-green-400" },
  good: { base: "text-emerald-500", glow: "shadow-emerald-500/50", text: "text-emerald-400" },
  moderate: { base: "text-yellow-500", glow: "shadow-yellow-500/50", text: "text-yellow-400" },
  slow: { base: "text-orange-500", glow: "shadow-orange-500/50", text: "text-orange-400" },
  critical: { base: "text-red-500", glow: "shadow-red-500/50", text: "text-red-400" },
};

const intelligenceColors: Record<IntelligenceLevel, { base: string; glow: string; text: string }> = {
  genius: { base: "text-violet-500", glow: "shadow-violet-500/50", text: "text-violet-400" },
  advanced: { base: "text-blue-500", glow: "shadow-blue-500/50", text: "text-blue-400" },
  standard: { base: "text-cyan-500", glow: "shadow-cyan-500/50", text: "text-cyan-400" },
  basic: { base: "text-teal-500", glow: "shadow-teal-500/50", text: "text-teal-400" },
  minimal: { base: "text-gray-500", glow: "shadow-gray-500/50", text: "text-gray-400" },
};

const healthColors: Record<HealthStatus, { color: string; glow: string; bg: string }> = {
  optimal: { color: "#ffffff", glow: "rgba(255, 255, 255, 0.8)", bg: "rgba(255, 255, 255, 0.15)" },
  good: { color: "#a3e635", glow: "rgba(163, 230, 53, 0.6)", bg: "rgba(163, 230, 53, 0.15)" },
  warning: { color: "#fbbf24", glow: "rgba(251, 191, 36, 0.6)", bg: "rgba(251, 191, 36, 0.15)" },
  danger: { color: "#f97316", glow: "rgba(249, 115, 22, 0.6)", bg: "rgba(249, 115, 22, 0.15)" },
  critical: { color: "#ef4444", glow: "rgba(239, 68, 68, 0.8)", bg: "rgba(239, 68, 68, 0.2)" },
};

const healthLabels: Record<HealthStatus, { en: string; ar: string }> = {
  optimal: { en: "All Systems Optimal", ar: "جميع الأنظمة تعمل بشكل مثالي" },
  good: { en: "Systems Operational", ar: "الأنظمة تعمل" },
  warning: { en: "Minor Issues Detected", ar: "تم اكتشاف مشاكل طفيفة" },
  danger: { en: "Performance Degraded", ar: "الأداء منخفض" },
  critical: { en: "Critical Issues", ar: "مشاكل حرجة" },
};

function HolographicHealthIndicator() {
  const { isRtl } = useLanguage();
  const { toast } = useToast();
  const health = usePlatformHealth();
  const [copied, setCopied] = useState(false);
  
  const colors = healthColors[health.status];
  const label = healthLabels[health.status];
  
  const copyIssuesReport = async () => {
    let report = isRtl
      ? `تقرير حالة المنصة\n${"=".repeat(30)}\nالحالة: ${label.ar}\nمستوى الخطورة: ${health.severity}/4\n`
      : `Platform Health Report\n${"=".repeat(30)}\nStatus: ${label.en}\nSeverity: ${health.severity}/4\n`;
    
    if (health.issues.length > 0) {
      report += isRtl ? `\nالمشاكل المكتشفة (${health.issues.length}):\n` : `\nIssues Detected (${health.issues.length}):\n`;
      health.issues.forEach((issue, i) => {
        report += isRtl
          ? `\n${i + 1}. ${issue.metricLabel.ar}\n   الموقع: ${issue.locationLabel.ar}\n   الوصف: ${issue.description.ar}\n   القيمة: ${Math.round(issue.value)} (الحد: ${issue.threshold})\n`
          : `\n${i + 1}. ${issue.metricLabel.en}\n   Location: ${issue.locationLabel.en}\n   Description: ${issue.description.en}\n   Value: ${Math.round(issue.value)} (Threshold: ${issue.threshold})\n`;
      });
    } else {
      report += isRtl ? "\nلا توجد مشاكل مكتشفة." : "\nNo issues detected.";
    }
    
    await navigator.clipboard.writeText(report);
    setCopied(true);
    toast({ title: isRtl ? "تم النسخ" : "Copied", description: isRtl ? "تم نسخ تقرير الحالة" : "Health report copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  const getIssueIcon = (severity: number) => {
    if (severity >= 4) return <XCircle className="h-3 w-3 text-red-500" />;
    if (severity >= 3) return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    if (severity >= 2) return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    return <Activity className="h-3 w-3 text-green-500" />;
  };

  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <button className="relative flex items-center justify-center px-2 h-9 rounded-md hover-elevate cursor-pointer" data-testid="button-health-indicator">
          <div className="absolute inset-0 rounded-md" style={{ background: `radial-gradient(circle, ${colors.bg} 0%, transparent 70%)`, animation: health.isHealthy ? "holoGlow 2s ease-in-out infinite" : "none" }} />
          
          <div className="relative flex items-center gap-1.5" style={{ filter: `drop-shadow(0 0 ${health.isHealthy ? "16px" : "10px"} ${colors.glow}) drop-shadow(0 0 ${health.isHealthy ? "24px" : "14px"} ${colors.glow})`, animation: health.isHealthy ? "holoPulse 1.5s ease-in-out infinite" : health.status === "critical" ? "holoFlicker 0.3s ease-in-out infinite" : "holoPulse 3s ease-in-out infinite" }}>
            <Activity className="h-4 w-4" style={{ color: colors.color, filter: `drop-shadow(0 0 8px ${colors.glow})` }} />
            <span className="text-xs font-extrabold tracking-wider uppercase" style={{ color: colors.color, textShadow: `0 0 10px ${colors.glow}, 0 0 20px ${colors.glow}, 0 0 30px ${colors.glow}` }}>Health</span>
          </div>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4" side="bottom" align="center">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md" style={{ background: colors.bg }}>
              <Activity className="h-6 w-6" style={{ color: colors.color, filter: `drop-shadow(0 0 4px ${colors.glow})` }} />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{isRtl ? "صحة المنصة" : "Platform Health"}</h4>
              <p className="text-xs font-medium" style={{ color: colors.color }}>{isRtl ? label.ar : label.en}</p>
            </div>
          </div>
          
          {health.issues.length > 0 ? (
            <ScrollArea className="h-32">
              <div className="space-y-2 pr-2">
                {health.issues.map((issue) => (
                  <div key={issue.id} className="p-2 rounded-md bg-muted/50 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      {getIssueIcon(issue.severity)}
                      <span className="font-medium">{isRtl ? issue.metricLabel.ar : issue.metricLabel.en}</span>
                    </div>
                    <div className="text-muted-foreground text-[11px] space-y-0.5">
                      <div className="flex gap-1"><span>{isRtl ? "الموقع:" : "Location:"}</span><span className="font-medium">{isRtl ? issue.locationLabel.ar : issue.locationLabel.en}</span></div>
                      <div>{isRtl ? issue.description.ar : issue.description.en}</div>
                      <div className="flex gap-2"><span>{isRtl ? "القيمة:" : "Value:"} {Math.round(issue.value)}</span><span className="text-muted-foreground/60">|</span><span>{isRtl ? "الحد:" : "Threshold:"} {issue.threshold}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="p-4 rounded-md bg-muted/30 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground">{isRtl ? "جميع الأنظمة تعمل بكفاءة" : "All systems operating efficiently"}</p>
            </div>
          )}
          
          <Button variant="outline" size="sm" className="w-full" onClick={copyIssuesReport} data-testid="button-copy-health-report">
            {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
            {isRtl ? (copied ? "تم النسخ" : "نسخ التقرير") : (copied ? "Copied" : "Copy Report")}
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export function PlatformStatusIndicators() {
  const { isRtl } = useLanguage();
  const { toast } = useToast();
  const [copiedSpeed, setCopiedSpeed] = useState(false);
  const [copiedIntelligence, setCopiedIntelligence] = useState(false);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    speedScore: 85,
    intelligenceScore: 78,
    activeModels: 12,
    totalRequests: 15420,
    avgResponseTime: 45,
    uptime: 99.9,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        speedScore: Math.min(100, Math.max(0, prev.speedScore + (Math.random() - 0.5) * 5)),
        intelligenceScore: Math.min(100, Math.max(0, prev.intelligenceScore + (Math.random() - 0.5) * 3)),
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
        avgResponseTime: Math.max(10, Math.min(200, prev.avgResponseTime + (Math.random() - 0.5) * 10)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const speedLevel = getSpeedLevel(metrics.speedScore);
  const intelligenceLevel = getIntelligenceLevel(metrics.intelligenceScore);
  const speedColor = speedColors[speedLevel];
  const intelligenceColor = intelligenceColors[intelligenceLevel];

  const speedLabels: Record<SpeedLevel, { en: string; ar: string }> = {
    excellent: { en: "Excellent", ar: "ممتاز" },
    good: { en: "Good", ar: "جيد" },
    moderate: { en: "Moderate", ar: "متوسط" },
    slow: { en: "Slow", ar: "بطيء" },
    critical: { en: "Critical", ar: "حرج" },
  };

  const intelligenceLabels: Record<IntelligenceLevel, { en: string; ar: string }> = {
    genius: { en: "Genius", ar: "عبقري" },
    advanced: { en: "Advanced", ar: "متقدم" },
    standard: { en: "Standard", ar: "قياسي" },
    basic: { en: "Basic", ar: "أساسي" },
    minimal: { en: "Minimal", ar: "محدود" },
  };

  const copySpeedStatus = async () => {
    const statusText = isRtl 
      ? `سرعة المنصة: ${speedLabels[speedLevel].ar}\nمؤشر السرعة: ${Math.round(metrics.speedScore)}%\nوقت الاستجابة: ${Math.round(metrics.avgResponseTime)}ms\nوقت التشغيل: ${metrics.uptime}%`
      : `Platform Speed: ${speedLabels[speedLevel].en}\nSpeed Score: ${Math.round(metrics.speedScore)}%\nAvg Response: ${Math.round(metrics.avgResponseTime)}ms\nUptime: ${metrics.uptime}%`;
    
    await navigator.clipboard.writeText(statusText);
    setCopiedSpeed(true);
    toast({ title: isRtl ? "تم النسخ" : "Copied", description: isRtl ? "تم نسخ حالة السرعة" : "Speed status copied" });
    setTimeout(() => setCopiedSpeed(false), 2000);
  };

  const copyIntelligenceStatus = async () => {
    const statusText = isRtl 
      ? `ذكاء المنصة: ${intelligenceLabels[intelligenceLevel].ar}\nمؤشر الذكاء: ${Math.round(metrics.intelligenceScore)}%\nالنماذج النشطة: ${metrics.activeModels}\nإجمالي الطلبات: ${metrics.totalRequests.toLocaleString()}`
      : `Platform Intelligence: ${intelligenceLabels[intelligenceLevel].en}\nIntelligence Score: ${Math.round(metrics.intelligenceScore)}%\nActive Models: ${metrics.activeModels}\nTotal Requests: ${metrics.totalRequests.toLocaleString()}`;
    
    await navigator.clipboard.writeText(statusText);
    setCopiedIntelligence(true);
    toast({ title: isRtl ? "تم النسخ" : "Copied", description: isRtl ? "تم نسخ حالة الذكاء" : "Intelligence status copied" });
    setTimeout(() => setCopiedIntelligence(false), 2000);
  };

  return (
    <div className="flex items-center gap-2" data-testid="platform-status-indicators">
      <HolographicHealthIndicator />
      
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button className="relative flex items-center justify-center w-9 h-9 rounded-md hover-elevate cursor-pointer" data-testid="button-speed-indicator">
            <div className={`absolute inset-0 rounded-md opacity-20 blur-sm ${speedColor.base.replace("text-", "bg-")}`} style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
            <Heart className={`h-5 w-5 ${speedColor.base} drop-shadow-lg`} style={{ filter: `drop-shadow(0 0 8px currentColor)`, animation: `heartbeat ${speedLevel === "excellent" ? "0.8s" : speedLevel === "critical" ? "0.4s" : "1.2s"} ease-in-out infinite` }} fill="currentColor" />
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-72 p-4" side="bottom" align="center">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${speedColor.base.replace("text-", "bg-")}/20`}>
                <Heart className={`h-6 w-6 ${speedColor.base}`} fill="currentColor" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{isRtl ? "سرعة المنصة" : "Platform Speed"}</h4>
                <p className={`text-xs font-medium ${speedColor.text}`}>{isRtl ? speedLabels[speedLevel].ar : speedLabels[speedLevel].en}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">{isRtl ? "مؤشر السرعة" : "Speed Score"}</span><span className="font-medium">{Math.round(metrics.speedScore)}%</span></div>
              <Progress value={metrics.speedScore} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-md bg-muted/50"><div className="text-muted-foreground">{isRtl ? "وقت الاستجابة" : "Avg Response"}</div><div className="font-semibold">{Math.round(metrics.avgResponseTime)}ms</div></div>
              <div className="p-2 rounded-md bg-muted/50"><div className="text-muted-foreground">{isRtl ? "وقت التشغيل" : "Uptime"}</div><div className="font-semibold">{metrics.uptime}%</div></div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={copySpeedStatus} data-testid="button-copy-speed-status">
              {copiedSpeed ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
              {isRtl ? (copiedSpeed ? "تم النسخ" : "نسخ الحالة") : (copiedSpeed ? "Copied" : "Copy Status")}
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>

      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <button className="relative flex items-center justify-center w-9 h-9 rounded-md hover-elevate cursor-pointer" data-testid="button-intelligence-indicator">
            <div className={`absolute inset-0 rounded-md opacity-20 blur-sm ${intelligenceColor.base.replace("text-", "bg-")}`} style={{ animation: "pulse 2s ease-in-out infinite" }} />
            <Brain className={`h-5 w-5 ${intelligenceColor.base} drop-shadow-lg`} style={{ filter: `drop-shadow(0 0 8px currentColor)`, animation: `brainPulse ${intelligenceLevel === "genius" ? "1s" : intelligenceLevel === "minimal" ? "2.5s" : "1.5s"} ease-in-out infinite` }} />
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-72 p-4" side="bottom" align="center">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md ${intelligenceColor.base.replace("text-", "bg-")}/20`}>
                <Brain className={`h-6 w-6 ${intelligenceColor.base}`} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{isRtl ? "ذكاء المنصة" : "Platform Intelligence"}</h4>
                <p className={`text-xs font-medium ${intelligenceColor.text}`}>{isRtl ? intelligenceLabels[intelligenceLevel].ar : intelligenceLabels[intelligenceLevel].en}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">{isRtl ? "مؤشر الذكاء" : "Intelligence Score"}</span><span className="font-medium">{Math.round(metrics.intelligenceScore)}%</span></div>
              <Progress value={metrics.intelligenceScore} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-md bg-muted/50"><div className="text-muted-foreground">{isRtl ? "النماذج النشطة" : "Active Models"}</div><div className="font-semibold">{metrics.activeModels}</div></div>
              <div className="p-2 rounded-md bg-muted/50"><div className="text-muted-foreground">{isRtl ? "إجمالي الطلبات" : "Total Requests"}</div><div className="font-semibold">{metrics.totalRequests.toLocaleString()}</div></div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={copyIntelligenceStatus} data-testid="button-copy-intelligence-status">
              {copiedIntelligence ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
              {isRtl ? (copiedIntelligence ? "تم النسخ" : "نسخ الحالة") : (copiedIntelligence ? "Copied" : "Copy Status")}
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); opacity: 1; }
          15% { transform: scale(1.15); opacity: 0.9; }
          30% { transform: scale(1); opacity: 1; }
          45% { transform: scale(1.1); opacity: 0.95; }
          60% { transform: scale(1); opacity: 1; }
        }
        @keyframes brainPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; filter: drop-shadow(0 0 12px currentColor); }
        }
        @keyframes holoPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes holoGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes holoFlicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          25% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 0.9; transform: scale(1.02); }
          75% { opacity: 0.5; transform: scale(0.98); }
        }
      `}</style>
    </div>
  );
}
