import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

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

export interface PlatformIssue {
  id: string;
  type: 'cpu' | 'memory' | 'queue' | 'speed' | 'response';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
}

export interface PlatformHealth {
  status: 'optimal' | 'good' | 'warning' | 'danger' | 'critical';
  severity: 0 | 1 | 2 | 3 | 4;
  issues: PlatformIssue[];
  isHealthy: boolean;
}

interface PlatformMetricsContextType {
  metrics: PlatformMetrics;
  health: PlatformHealth;
  isLoading: boolean;
  refresh: () => void;
}

const defaultMetrics: PlatformMetrics = {
  speedScore: 85,
  intelligenceScore: 92,
  activeModels: 3,
  totalRequests: 15420,
  avgResponseTime: 45,
  uptime: 99.9,
  cpuUsage: 35,
  memoryUsage: 48,
  queueDepth: 12,
};

const PlatformMetricsContext = createContext<PlatformMetricsContextType | null>(null);

function fluctuate(value: number, range: number, min: number = 0, max: number = 100): number {
  const delta = (Math.random() - 0.5) * range;
  return Math.max(min, Math.min(max, value + delta));
}

function detectIssues(metrics: PlatformMetrics): PlatformIssue[] {
  const issues: PlatformIssue[] = [];

  if (metrics.cpuUsage > 90) {
    issues.push({
      id: 'cpu-critical',
      type: 'cpu',
      severity: 'critical',
      message: 'CPU usage critical',
      value: metrics.cpuUsage,
      threshold: 90,
    });
  } else if (metrics.cpuUsage > 80) {
    issues.push({
      id: 'cpu-warning',
      type: 'cpu',
      severity: 'warning',
      message: 'CPU usage high',
      value: metrics.cpuUsage,
      threshold: 80,
    });
  }

  if (metrics.memoryUsage > 90) {
    issues.push({
      id: 'memory-critical',
      type: 'memory',
      severity: 'critical',
      message: 'Memory usage critical',
      value: metrics.memoryUsage,
      threshold: 90,
    });
  } else if (metrics.memoryUsage > 75) {
    issues.push({
      id: 'memory-warning',
      type: 'memory',
      severity: 'warning',
      message: 'Memory usage high',
      value: metrics.memoryUsage,
      threshold: 75,
    });
  }

  if (metrics.queueDepth > 80) {
    issues.push({
      id: 'queue-critical',
      type: 'queue',
      severity: 'critical',
      message: 'Queue depth critical',
      value: metrics.queueDepth,
      threshold: 80,
    });
  } else if (metrics.queueDepth > 50) {
    issues.push({
      id: 'queue-warning',
      type: 'queue',
      severity: 'warning',
      message: 'Queue depth high',
      value: metrics.queueDepth,
      threshold: 50,
    });
  }

  if (metrics.speedScore < 30) {
    issues.push({
      id: 'speed-critical',
      type: 'speed',
      severity: 'critical',
      message: 'Speed critically low',
      value: metrics.speedScore,
      threshold: 30,
    });
  } else if (metrics.speedScore < 50) {
    issues.push({
      id: 'speed-warning',
      type: 'speed',
      severity: 'warning',
      message: 'Speed below optimal',
      value: metrics.speedScore,
      threshold: 50,
    });
  }

  if (metrics.avgResponseTime > 150) {
    issues.push({
      id: 'response-critical',
      type: 'response',
      severity: 'critical',
      message: 'Response time critical',
      value: metrics.avgResponseTime,
      threshold: 150,
    });
  } else if (metrics.avgResponseTime > 100) {
    issues.push({
      id: 'response-warning',
      type: 'response',
      severity: 'warning',
      message: 'Response time high',
      value: metrics.avgResponseTime,
      threshold: 100,
    });
  }

  return issues;
}

function calculateHealth(issues: PlatformIssue[]): PlatformHealth {
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  if (criticalCount >= 2) {
    return { status: 'critical', severity: 4, issues, isHealthy: false };
  }
  if (criticalCount === 1) {
    return { status: 'danger', severity: 3, issues, isHealthy: false };
  }
  if (warningCount >= 2) {
    return { status: 'warning', severity: 2, issues, isHealthy: false };
  }
  if (warningCount === 1) {
    return { status: 'good', severity: 1, issues, isHealthy: true };
  }
  return { status: 'optimal', severity: 0, issues: [], isHealthy: true };
}

export function PlatformMetricsProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<PlatformMetrics>(defaultMetrics);
  const [health, setHealth] = useState<PlatformHealth>(() => {
    const issues = detectIssues(defaultMetrics);
    return calculateHealth(issues);
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateMetrics = useCallback(() => {
    setMetrics(prev => {
      const newMetrics: PlatformMetrics = {
        speedScore: fluctuate(prev.speedScore, 5, 60, 100),
        intelligenceScore: fluctuate(prev.intelligenceScore, 3, 70, 100),
        activeModels: prev.activeModels,
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
        avgResponseTime: fluctuate(prev.avgResponseTime, 10, 20, 200),
        uptime: Math.min(100, fluctuate(prev.uptime, 0.1, 99, 100)),
        cpuUsage: fluctuate(prev.cpuUsage, 8, 10, 95),
        memoryUsage: fluctuate(prev.memoryUsage, 5, 20, 95),
        queueDepth: fluctuate(prev.queueDepth, 10, 0, 100),
      };
      const issues = detectIssues(newMetrics);
      setHealth(calculateHealth(issues));
      return newMetrics;
    });
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      updateMetrics();
      setIsLoading(false);
    }, 500);
  }, [updateMetrics]);

  useEffect(() => {
    const interval = setInterval(updateMetrics, 3000);
    return () => clearInterval(interval);
  }, [updateMetrics]);

  return (
    <PlatformMetricsContext.Provider value={{ metrics, health, isLoading, refresh }}>
      {children}
    </PlatformMetricsContext.Provider>
  );
}

export function usePlatformMetrics() {
  const context = useContext(PlatformMetricsContext);
  if (!context) {
    throw new Error('usePlatformMetrics must be used within PlatformMetricsProvider');
  }
  return context;
}
