import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type HealthStatus = "optimal" | "good" | "warning" | "danger" | "critical";

export interface PlatformIssue {
  id: string;
  metric: string;
  metricLabel: { en: string; ar: string };
  location: string;
  locationLabel: { en: string; ar: string };
  description: { en: string; ar: string };
  value: number;
  threshold: number;
  severity: 1 | 2 | 3 | 4;
}

export interface PlatformHealth {
  status: HealthStatus;
  severity: 0 | 1 | 2 | 3 | 4;
  issues: PlatformIssue[];
  isHealthy: boolean;
}

export interface PlatformMetrics {
  speedScore: number;
  intelligenceScore: number;
  activeModels: number;
  totalRequests: number;
  avgResponseTime: number;
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  queueDepth: number;
}

export type SpeedLevel = "excellent" | "good" | "moderate" | "slow" | "critical";
export type IntelligenceLevel = "genius" | "advanced" | "standard" | "basic" | "minimal";

interface PlatformMetricsContextType {
  metrics: PlatformMetrics;
  health: PlatformHealth;
  speedLevel: SpeedLevel;
  intelligenceLevel: IntelligenceLevel;
  speedLabel: { en: string; ar: string };
  intelligenceLabel: { en: string; ar: string };
}

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

export function getSpeedLevel(score: number): SpeedLevel {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "moderate";
  if (score >= 30) return "slow";
  return "critical";
}

export function getIntelligenceLevel(score: number): IntelligenceLevel {
  if (score >= 90) return "genius";
  if (score >= 70) return "advanced";
  if (score >= 50) return "standard";
  if (score >= 30) return "basic";
  return "minimal";
}

function computePlatformHealth(metrics: PlatformMetrics): PlatformHealth {
  const issues: PlatformIssue[] = [];
  
  if (metrics.cpuUsage > 80) {
    issues.push({
      id: "cpu-high",
      metric: "cpu",
      metricLabel: { en: "CPU Usage", ar: "استخدام المعالج" },
      location: "runtime",
      locationLabel: { en: "Runtime Manager", ar: "مدير التشغيل" },
      description: { 
        en: metrics.cpuUsage > 90 ? "CPU critically overloaded" : "CPU usage is high",
        ar: metrics.cpuUsage > 90 ? "المعالج محمّل بشكل حرج" : "استخدام المعالج مرتفع"
      },
      value: metrics.cpuUsage,
      threshold: 80,
      severity: metrics.cpuUsage > 90 ? 4 : 2,
    });
  }
  
  if (metrics.memoryUsage > 75) {
    issues.push({
      id: "memory-high",
      metric: "memory",
      metricLabel: { en: "Memory Usage", ar: "استخدام الذاكرة" },
      location: "infrastructure",
      locationLabel: { en: "Infrastructure", ar: "البنية التحتية" },
      description: {
        en: metrics.memoryUsage > 90 ? "Memory critically low" : "Memory usage is elevated",
        ar: metrics.memoryUsage > 90 ? "الذاكرة منخفضة بشكل حرج" : "استخدام الذاكرة مرتفع"
      },
      value: metrics.memoryUsage,
      threshold: 75,
      severity: metrics.memoryUsage > 90 ? 4 : 2,
    });
  }
  
  if (metrics.queueDepth > 50) {
    issues.push({
      id: "queue-deep",
      metric: "queue",
      metricLabel: { en: "Request Queue", ar: "طابور الطلبات" },
      location: "load-balancer",
      locationLabel: { en: "Load Balancer", ar: "موازن الحمل" },
      description: {
        en: metrics.queueDepth > 80 ? "Queue critically backed up" : "Request queue is building up",
        ar: metrics.queueDepth > 80 ? "الطابور متراكم بشكل حرج" : "طابور الطلبات يتراكم"
      },
      value: metrics.queueDepth,
      threshold: 50,
      severity: metrics.queueDepth > 80 ? 3 : 2,
    });
  }
  
  if (metrics.speedScore < 50) {
    issues.push({
      id: "speed-low",
      metric: "speed",
      metricLabel: { en: "Platform Speed", ar: "سرعة المنصة" },
      location: "performance",
      locationLabel: { en: "Performance", ar: "الأداء" },
      description: {
        en: metrics.speedScore < 30 ? "Speed critically degraded" : "Platform speed is below optimal",
        ar: metrics.speedScore < 30 ? "السرعة متدهورة بشكل حرج" : "سرعة المنصة أقل من المثالية"
      },
      value: metrics.speedScore,
      threshold: 50,
      severity: metrics.speedScore < 30 ? 3 : 2,
    });
  }
  
  if (metrics.avgResponseTime > 100) {
    issues.push({
      id: "response-slow",
      metric: "response",
      metricLabel: { en: "Response Time", ar: "وقت الاستجابة" },
      location: "api",
      locationLabel: { en: "API Layer", ar: "طبقة API" },
      description: {
        en: metrics.avgResponseTime > 150 ? "Response time critically slow" : "Response time is elevated",
        ar: metrics.avgResponseTime > 150 ? "وقت الاستجابة بطيء بشكل حرج" : "وقت الاستجابة مرتفع"
      },
      value: metrics.avgResponseTime,
      threshold: 100,
      severity: metrics.avgResponseTime > 150 ? 4 : 2,
    });
  }
  
  const maxSeverity = issues.length > 0 
    ? Math.max(...issues.map(i => i.severity)) as 1 | 2 | 3 | 4
    : 0;
  
  const status: HealthStatus = 
    maxSeverity === 0 ? "optimal" :
    maxSeverity === 1 ? "good" :
    maxSeverity === 2 ? "warning" :
    maxSeverity === 3 ? "danger" : "critical";
  
  return {
    status,
    severity: maxSeverity as 0 | 1 | 2 | 3 | 4,
    issues: issues.sort((a, b) => b.severity - a.severity),
    isHealthy: maxSeverity <= 1,
  };
}

const PlatformMetricsContext = createContext<PlatformMetricsContextType | null>(null);

export function PlatformMetricsProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    speedScore: 85,
    intelligenceScore: 78,
    activeModels: 12,
    totalRequests: 15420,
    avgResponseTime: 45,
    uptime: 99.9,
    cpuUsage: 42,
    memoryUsage: 58,
    queueDepth: 15,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        speedScore: Math.min(100, Math.max(0, prev.speedScore + (Math.random() - 0.5) * 5)),
        intelligenceScore: Math.min(100, Math.max(0, prev.intelligenceScore + (Math.random() - 0.5) * 3)),
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
        avgResponseTime: Math.max(10, Math.min(200, prev.avgResponseTime + (Math.random() - 0.5) * 10)),
        cpuUsage: Math.min(100, Math.max(5, prev.cpuUsage + (Math.random() - 0.5) * 8)),
        memoryUsage: Math.min(100, Math.max(10, prev.memoryUsage + (Math.random() - 0.5) * 6)),
        queueDepth: Math.min(100, Math.max(0, prev.queueDepth + (Math.random() - 0.5) * 10)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const speedLevel = getSpeedLevel(metrics.speedScore);
  const intelligenceLevel = getIntelligenceLevel(metrics.intelligenceScore);
  const health = computePlatformHealth(metrics);

  return (
    <PlatformMetricsContext.Provider value={{
      metrics,
      health,
      speedLevel,
      intelligenceLevel,
      speedLabel: speedLabels[speedLevel],
      intelligenceLabel: intelligenceLabels[intelligenceLevel],
    }}>
      {children}
    </PlatformMetricsContext.Provider>
  );
}

export function usePlatformMetrics() {
  const context = useContext(PlatformMetricsContext);
  if (!context) throw new Error("usePlatformMetrics must be used within PlatformMetricsProvider");
  return context;
}

export function usePlatformHealth() {
  const context = useContext(PlatformMetricsContext);
  if (!context) throw new Error("usePlatformHealth must be used within PlatformMetricsProvider");
  return context.health;
}
