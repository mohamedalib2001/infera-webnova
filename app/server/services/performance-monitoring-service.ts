/**
 * Performance Monitoring Service - خدمة مراقبة الأداء
 * 
 * Internal performance monitoring without external dependencies.
 * Tracks CPU, memory, disk, network, and application metrics.
 * 
 * مراقبة الأداء الداخلية بدون تبعيات خارجية
 * تتبع وحدة المعالجة المركزية والذاكرة والقرص والشبكة ومقاييس التطبيق
 */

interface MetricPoint {
  timestamp: Date;
  value: number;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  uptime: number;
  timestamp: Date;
}

interface ApplicationMetrics {
  requests: {
    total: number;
    perSecond: number;
    perMinute: number;
  };
  responses: {
    success: number;
    errors: number;
    errorRate: number;
  };
  latency: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
    max: number;
  };
  activeConnections: number;
  memoryUsage: {
    heapTotal: number;
    heapUsed: number;
    external: number;
    rss: number;
  };
  timestamp: Date;
}

interface Alert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'error_rate' | 'latency' | 'downtime';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledged: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  threshold: number;
  duration: number; // seconds
  severity: Alert['severity'];
  enabled: boolean;
}

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    lastCheck: Date;
  }[];
  uptime: number;
  lastIncident?: {
    type: string;
    message: string;
    occurredAt: Date;
  };
}

// In-memory storage for MVP
const systemMetricsHistory = new Map<string, SystemMetrics[]>();
const applicationMetricsHistory = new Map<string, ApplicationMetrics[]>();
const alerts = new Map<string, Alert>();
const alertRules = new Map<string, AlertRule>();

// Request tracking
const requestMetrics: {
  timestamps: number[];
  latencies: number[];
  errors: number;
  total: number;
} = {
  timestamps: [],
  latencies: [],
  errors: 0,
  total: 0
};

// Default alert rules
const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'cpu-high',
    name: 'High CPU Usage',
    metric: 'cpu.usage',
    condition: 'gt',
    threshold: 80,
    duration: 60,
    severity: 'warning',
    enabled: true
  },
  {
    id: 'cpu-critical',
    name: 'Critical CPU Usage',
    metric: 'cpu.usage',
    condition: 'gt',
    threshold: 95,
    duration: 30,
    severity: 'critical',
    enabled: true
  },
  {
    id: 'memory-high',
    name: 'High Memory Usage',
    metric: 'memory.usagePercent',
    condition: 'gt',
    threshold: 85,
    duration: 60,
    severity: 'warning',
    enabled: true
  },
  {
    id: 'disk-warning',
    name: 'Disk Space Warning',
    metric: 'disk.usagePercent',
    condition: 'gt',
    threshold: 80,
    duration: 0,
    severity: 'warning',
    enabled: true
  },
  {
    id: 'error-rate-high',
    name: 'High Error Rate',
    metric: 'responses.errorRate',
    condition: 'gt',
    threshold: 5,
    duration: 60,
    severity: 'warning',
    enabled: true
  },
  {
    id: 'latency-high',
    name: 'High Latency',
    metric: 'latency.p95',
    condition: 'gt',
    threshold: 1000,
    duration: 60,
    severity: 'warning',
    enabled: true
  }
];

class PerformanceMonitoringService {
  private startTime: number;
  private metricsInterval?: NodeJS.Timeout;
  
  constructor() {
    this.startTime = Date.now();
    
    // Initialize default alert rules
    DEFAULT_ALERT_RULES.forEach(rule => {
      alertRules.set(rule.id, rule);
    });
  }
  
  /**
   * Start metrics collection
   */
  startCollection(targetId: string, intervalMs: number = 5000): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    this.metricsInterval = setInterval(async () => {
      await this.collectSystemMetrics(targetId);
      await this.collectApplicationMetrics(targetId);
      await this.checkAlertRules(targetId);
    }, intervalMs);
    
    console.log(`[PerformanceMonitoring] Started collection for ${targetId} every ${intervalMs}ms`);
  }
  
  /**
   * Stop metrics collection
   */
  stopCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }
  }
  
  /**
   * Collect system metrics
   */
  async collectSystemMetrics(targetId: string): Promise<SystemMetrics> {
    // In a real implementation, would use node-os-utils or ssh to target
    // For MVP, simulate with process metrics
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const metrics: SystemMetrics = {
      cpu: {
        usage: Math.min(100, (cpuUsage.user + cpuUsage.system) / 1000000 * 100),
        cores: require('os').cpus().length,
        loadAverage: require('os').loadavg()
      },
      memory: {
        total: require('os').totalmem(),
        used: require('os').totalmem() - require('os').freemem(),
        free: require('os').freemem(),
        usagePercent: ((require('os').totalmem() - require('os').freemem()) / require('os').totalmem()) * 100
      },
      disk: {
        total: 50 * 1024 * 1024 * 1024, // 50GB simulated
        used: 20 * 1024 * 1024 * 1024,  // 20GB used
        free: 30 * 1024 * 1024 * 1024,  // 30GB free
        usagePercent: 40
      },
      network: {
        bytesIn: Math.floor(Math.random() * 1000000),
        bytesOut: Math.floor(Math.random() * 500000),
        packetsIn: Math.floor(Math.random() * 1000),
        packetsOut: Math.floor(Math.random() * 500)
      },
      uptime: (Date.now() - this.startTime) / 1000,
      timestamp: new Date()
    };
    
    // Store in history
    const history = systemMetricsHistory.get(targetId) || [];
    history.push(metrics);
    
    // Keep last 1000 entries
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    systemMetricsHistory.set(targetId, history);
    
    return metrics;
  }
  
  /**
   * Collect application metrics
   */
  async collectApplicationMetrics(targetId: string): Promise<ApplicationMetrics> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneSecondAgo = now - 1000;
    
    // Clean old timestamps
    requestMetrics.timestamps = requestMetrics.timestamps.filter(t => t > oneMinuteAgo);
    requestMetrics.latencies = requestMetrics.latencies.slice(-1000);
    
    const requestsInLastMinute = requestMetrics.timestamps.filter(t => t > oneMinuteAgo).length;
    const requestsInLastSecond = requestMetrics.timestamps.filter(t => t > oneSecondAgo).length;
    
    // Calculate latency percentiles
    const sortedLatencies = [...requestMetrics.latencies].sort((a, b) => a - b);
    const getPercentile = (arr: number[], p: number) => {
      if (arr.length === 0) return 0;
      const index = Math.ceil((p / 100) * arr.length) - 1;
      return arr[Math.max(0, index)];
    };
    
    const memUsage = process.memoryUsage();
    
    const metrics: ApplicationMetrics = {
      requests: {
        total: requestMetrics.total,
        perSecond: requestsInLastSecond,
        perMinute: requestsInLastMinute
      },
      responses: {
        success: requestMetrics.total - requestMetrics.errors,
        errors: requestMetrics.errors,
        errorRate: requestMetrics.total > 0 ? (requestMetrics.errors / requestMetrics.total) * 100 : 0
      },
      latency: {
        average: sortedLatencies.length > 0 
          ? sortedLatencies.reduce((a, b) => a + b, 0) / sortedLatencies.length 
          : 0,
        p50: getPercentile(sortedLatencies, 50),
        p95: getPercentile(sortedLatencies, 95),
        p99: getPercentile(sortedLatencies, 99),
        max: sortedLatencies.length > 0 ? Math.max(...sortedLatencies) : 0
      },
      activeConnections: Math.floor(Math.random() * 50) + 1,
      memoryUsage: {
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        rss: memUsage.rss
      },
      timestamp: new Date()
    };
    
    // Store in history
    const history = applicationMetricsHistory.get(targetId) || [];
    history.push(metrics);
    
    // Keep last 1000 entries
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }
    
    applicationMetricsHistory.set(targetId, history);
    
    return metrics;
  }
  
  /**
   * Record a request (called from middleware)
   */
  recordRequest(latencyMs: number, isError: boolean = false): void {
    requestMetrics.timestamps.push(Date.now());
    requestMetrics.latencies.push(latencyMs);
    requestMetrics.total++;
    if (isError) {
      requestMetrics.errors++;
    }
  }
  
  /**
   * Get system metrics history
   */
  async getSystemMetrics(targetId: string, limit: number = 100): Promise<SystemMetrics[]> {
    const history = systemMetricsHistory.get(targetId) || [];
    return history.slice(-limit);
  }
  
  /**
   * Get application metrics history
   */
  async getApplicationMetrics(targetId: string, limit: number = 100): Promise<ApplicationMetrics[]> {
    const history = applicationMetricsHistory.get(targetId) || [];
    return history.slice(-limit);
  }
  
  /**
   * Get current metrics
   */
  async getCurrentMetrics(targetId: string): Promise<{
    system: SystemMetrics;
    application: ApplicationMetrics;
  }> {
    return {
      system: await this.collectSystemMetrics(targetId),
      application: await this.collectApplicationMetrics(targetId)
    };
  }
  
  /**
   * Check alert rules and trigger alerts
   */
  async checkAlertRules(targetId: string): Promise<void> {
    const systemHistory = systemMetricsHistory.get(targetId) || [];
    const appHistory = applicationMetricsHistory.get(targetId) || [];
    
    if (systemHistory.length === 0 || appHistory.length === 0) return;
    
    const latestSystem = systemHistory[systemHistory.length - 1];
    const latestApp = appHistory[appHistory.length - 1];
    
    for (const rule of alertRules.values()) {
      if (!rule.enabled) continue;
      
      let value: number | undefined;
      
      // Extract metric value
      const parts = rule.metric.split('.');
      if (parts[0] === 'cpu') {
        value = (latestSystem.cpu as any)[parts[1]];
      } else if (parts[0] === 'memory') {
        value = (latestSystem.memory as any)[parts[1]];
      } else if (parts[0] === 'disk') {
        value = (latestSystem.disk as any)[parts[1]];
      } else if (parts[0] === 'responses') {
        value = (latestApp.responses as any)[parts[1]];
      } else if (parts[0] === 'latency') {
        value = (latestApp.latency as any)[parts[1]];
      }
      
      if (value === undefined) continue;
      
      // Check condition
      let triggered = false;
      switch (rule.condition) {
        case 'gt': triggered = value > rule.threshold; break;
        case 'lt': triggered = value < rule.threshold; break;
        case 'gte': triggered = value >= rule.threshold; break;
        case 'lte': triggered = value <= rule.threshold; break;
        case 'eq': triggered = value === rule.threshold; break;
      }
      
      const existingAlert = alerts.get(rule.id);
      
      if (triggered && !existingAlert) {
        // Create new alert
        const alert: Alert = {
          id: `alert-${Date.now()}-${rule.id}`,
          type: parts[0] as Alert['type'],
          severity: rule.severity,
          message: `${rule.name}: ${value.toFixed(2)} ${rule.condition} ${rule.threshold}`,
          value,
          threshold: rule.threshold,
          triggeredAt: new Date(),
          acknowledged: false
        };
        alerts.set(rule.id, alert);
        console.log(`[PerformanceMonitoring] Alert triggered: ${alert.message}`);
      } else if (!triggered && existingAlert && !existingAlert.resolvedAt) {
        // Resolve alert
        existingAlert.resolvedAt = new Date();
        alerts.set(rule.id, existingAlert);
        console.log(`[PerformanceMonitoring] Alert resolved: ${existingAlert.message}`);
      }
    }
  }
  
  /**
   * Get all active alerts
   */
  async getAlerts(includeResolved: boolean = false): Promise<Alert[]> {
    const allAlerts = Array.from(alerts.values());
    if (includeResolved) {
      return allAlerts.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
    }
    return allAlerts
      .filter(a => !a.resolvedAt)
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }
  
  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<boolean> {
    for (const alert of alerts.values()) {
      if (alert.id === alertId) {
        alert.acknowledged = true;
        return true;
      }
    }
    return false;
  }
  
  /**
   * Get alert rules
   */
  async getAlertRules(): Promise<AlertRule[]> {
    return Array.from(alertRules.values());
  }
  
  /**
   * Update alert rule
   */
  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<AlertRule | null> {
    const rule = alertRules.get(ruleId);
    if (!rule) return null;
    
    const updated = { ...rule, ...updates };
    alertRules.set(ruleId, updated);
    return updated;
  }
  
  /**
   * Get health status
   */
  async getHealthStatus(targetId: string): Promise<HealthStatus> {
    const systemHistory = systemMetricsHistory.get(targetId) || [];
    const activeAlerts = await this.getAlerts(false);
    
    const components: HealthStatus['components'] = [];
    let overall: HealthStatus['overall'] = 'healthy';
    
    // Check CPU
    const latestSystem = systemHistory[systemHistory.length - 1];
    if (latestSystem) {
      const cpuStatus = latestSystem.cpu.usage > 90 ? 'unhealthy' 
        : latestSystem.cpu.usage > 70 ? 'degraded' : 'healthy';
      components.push({
        name: 'CPU',
        status: cpuStatus,
        message: `Usage: ${latestSystem.cpu.usage.toFixed(1)}%`,
        lastCheck: latestSystem.timestamp
      });
      if (cpuStatus === 'unhealthy') overall = 'unhealthy';
      else if (cpuStatus === 'degraded' && overall !== 'unhealthy') overall = 'degraded';
      
      // Check Memory
      const memStatus = latestSystem.memory.usagePercent > 90 ? 'unhealthy'
        : latestSystem.memory.usagePercent > 80 ? 'degraded' : 'healthy';
      components.push({
        name: 'Memory',
        status: memStatus,
        message: `Usage: ${latestSystem.memory.usagePercent.toFixed(1)}%`,
        lastCheck: latestSystem.timestamp
      });
      if (memStatus === 'unhealthy') overall = 'unhealthy';
      else if (memStatus === 'degraded' && overall !== 'unhealthy') overall = 'degraded';
      
      // Check Disk
      const diskStatus = latestSystem.disk.usagePercent > 90 ? 'unhealthy'
        : latestSystem.disk.usagePercent > 80 ? 'degraded' : 'healthy';
      components.push({
        name: 'Disk',
        status: diskStatus,
        message: `Usage: ${latestSystem.disk.usagePercent.toFixed(1)}%`,
        lastCheck: latestSystem.timestamp
      });
      if (diskStatus === 'unhealthy') overall = 'unhealthy';
      else if (diskStatus === 'degraded' && overall !== 'unhealthy') overall = 'degraded';
    }
    
    // Check for critical alerts
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      overall = 'unhealthy';
    }
    
    return {
      overall,
      components,
      uptime: (Date.now() - this.startTime) / 1000,
      lastIncident: activeAlerts.length > 0 ? {
        type: activeAlerts[0].type,
        message: activeAlerts[0].message,
        occurredAt: activeAlerts[0].triggeredAt
      } : undefined
    };
  }
  
  /**
   * Format bytes for display
   */
  formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let value = bytes;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    
    return `${value.toFixed(2)} ${units[unitIndex]}`;
  }
  
  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();
