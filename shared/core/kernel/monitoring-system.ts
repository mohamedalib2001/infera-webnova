/**
 * 📊 Real-Time Monitoring System
 * نظام المراقبة في الوقت الفعلي
 * 
 * Provides:
 * - System metrics collection
 * - Application health monitoring
 * - Performance analytics
 * - Alert management
 * - Resource tracking
 */

import os from 'os';

// ==================== TYPES ====================

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number; // 0-100
    cores: number;
    model: string;
  };
  memory: {
    total: number; // bytes
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
  uptime: number; // seconds
  loadAverage: number[];
  platform: string;
  hostname: string;
}

export interface ApplicationMetrics {
  timestamp: Date;
  requests: {
    total: number;
    perMinute: number;
    averageLatency: number; // ms
    errors: number;
    errorRate: number; // percentage
  };
  activeConnections: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  eventLoop: {
    lag: number; // ms
  };
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number; // ms
  lastCheck: Date;
  message?: string;
  details?: Record<string, unknown>;
}

export interface Alert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'error_rate' | 'latency' | 'custom';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  type: Alert['type'];
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  severity: Alert['severity'];
  cooldown: number; // seconds between alerts
  enabled: boolean;
}

// ==================== METRICS COLLECTOR ====================

class MetricsCollector {
  private requestCount = 0;
  private errorCount = 0;
  private latencies: number[] = [];
  private startTime = Date.now();
  private lastMinuteRequests: number[] = [];
  
  /**
   * Record a request
   */
  recordRequest(latency: number, isError: boolean = false): void {
    this.requestCount++;
    this.latencies.push(latency);
    this.lastMinuteRequests.push(Date.now());
    
    if (isError) {
      this.errorCount++;
    }
    
    // Keep only last 1000 latencies
    if (this.latencies.length > 1000) {
      this.latencies = this.latencies.slice(-1000);
    }
    
    // Clean up old minute requests
    const oneMinuteAgo = Date.now() - 60000;
    this.lastMinuteRequests = this.lastMinuteRequests.filter(t => t > oneMinuteAgo);
  }
  
  /**
   * Get system metrics
   */
  getSystemMetrics(): SystemMetrics {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    // Calculate CPU usage
    let totalIdle = 0;
    let totalTick = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += (cpu.times as any)[type];
      }
      totalIdle += cpu.times.idle;
    }
    const cpuUsage = 100 - (totalIdle / totalTick * 100);
    
    return {
      timestamp: new Date(),
      cpu: {
        usage: Math.round(cpuUsage * 10) / 10,
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercent: Math.round((usedMemory / totalMemory) * 1000) / 10,
      },
      disk: {
        total: 0, // Would need fs.statfs for real disk info
        used: 0,
        free: 0,
        usagePercent: 0,
      },
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
      platform: os.platform(),
      hostname: os.hostname(),
    };
  }
  
  /**
   * Get application metrics
   */
  getApplicationMetrics(): ApplicationMetrics {
    const memUsage = process.memoryUsage();
    const avgLatency = this.latencies.length > 0
      ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
      : 0;
    
    return {
      timestamp: new Date(),
      requests: {
        total: this.requestCount,
        perMinute: this.lastMinuteRequests.length,
        averageLatency: Math.round(avgLatency * 100) / 100,
        errors: this.errorCount,
        errorRate: this.requestCount > 0 
          ? Math.round((this.errorCount / this.requestCount) * 10000) / 100 
          : 0,
      },
      activeConnections: 0, // Would need to track from server
      memoryUsage: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
      },
      eventLoop: {
        lag: 0, // Would need perf_hooks for accurate measurement
      },
    };
  }
  
  /**
   * Reset metrics
   */
  reset(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.latencies = [];
    this.lastMinuteRequests = [];
  }
}

// ==================== HEALTH CHECKER ====================

class HealthChecker {
  private checks: Map<string, () => Promise<HealthCheck>> = new Map();
  private results: Map<string, HealthCheck> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  
  /**
   * Register a health check
   */
  register(name: string, check: () => Promise<HealthCheck>): void {
    this.checks.set(name, check);
  }
  
  /**
   * Unregister a health check
   */
  unregister(name: string): void {
    this.checks.delete(name);
    this.results.delete(name);
  }
  
  /**
   * Run all health checks
   */
  async runAll(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = [];
    
    for (const [name, check] of this.checks) {
      try {
        const start = Date.now();
        const result = await check();
        result.latency = Date.now() - start;
        result.lastCheck = new Date();
        this.results.set(name, result);
        results.push(result);
      } catch (error: any) {
        const failedCheck: HealthCheck = {
          service: name,
          status: 'unhealthy',
          latency: 0,
          lastCheck: new Date(),
          message: error.message,
        };
        this.results.set(name, failedCheck);
        results.push(failedCheck);
      }
    }
    
    return results;
  }
  
  /**
   * Get last results
   */
  getResults(): HealthCheck[] {
    return Array.from(this.results.values());
  }
  
  /**
   * Get overall health status
   */
  getOverallStatus(): 'healthy' | 'degraded' | 'unhealthy' {
    const results = this.getResults();
    if (results.length === 0) return 'healthy';
    
    const hasUnhealthy = results.some(r => r.status === 'unhealthy');
    const hasDegraded = results.some(r => r.status === 'degraded');
    
    if (hasUnhealthy) return 'unhealthy';
    if (hasDegraded) return 'degraded';
    return 'healthy';
  }
  
  /**
   * Start periodic health checks
   */
  startPeriodicChecks(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.checkInterval = setInterval(() => this.runAll(), intervalMs);
    this.runAll(); // Run immediately
  }
  
  /**
   * Stop periodic checks
   */
  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// ==================== ALERT MANAGER ====================

class AlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Alert[] = [];
  private lastAlertTime: Map<string, number> = new Map();
  private maxAlerts = 1000;
  
  /**
   * Add alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }
  
  /**
   * Remove alert rule
   */
  removeRule(id: string): void {
    this.rules.delete(id);
  }
  
  /**
   * Check metrics against rules
   */
  checkMetrics(metrics: SystemMetrics & ApplicationMetrics): Alert[] {
    const newAlerts: Alert[] = [];
    
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      
      // Get the relevant metric value
      let value: number;
      switch (rule.type) {
        case 'cpu':
          value = metrics.cpu.usage;
          break;
        case 'memory':
          value = metrics.memory.usagePercent;
          break;
        case 'error_rate':
          value = metrics.requests.errorRate;
          break;
        case 'latency':
          value = metrics.requests.averageLatency;
          break;
        default:
          continue;
      }
      
      // Check condition
      let triggered = false;
      switch (rule.condition) {
        case 'gt': triggered = value > rule.threshold; break;
        case 'lt': triggered = value < rule.threshold; break;
        case 'gte': triggered = value >= rule.threshold; break;
        case 'lte': triggered = value <= rule.threshold; break;
        case 'eq': triggered = value === rule.threshold; break;
      }
      
      if (triggered) {
        // Check cooldown
        const lastAlert = this.lastAlertTime.get(rule.id) || 0;
        if (Date.now() - lastAlert < rule.cooldown * 1000) {
          continue;
        }
        
        const alert = this.createAlert(rule, value);
        newAlerts.push(alert);
        this.alerts.push(alert);
        this.lastAlertTime.set(rule.id, Date.now());
      }
    }
    
    // Trim old alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }
    
    return newAlerts;
  }
  
  private createAlert(rule: AlertRule, value: number): Alert {
    const messages: Record<string, { en: string; ar: string }> = {
      cpu: { 
        en: `CPU usage is at ${value}%`, 
        ar: `استخدام المعالج عند ${value}%` 
      },
      memory: { 
        en: `Memory usage is at ${value}%`, 
        ar: `استخدام الذاكرة عند ${value}%` 
      },
      error_rate: { 
        en: `Error rate is at ${value}%`, 
        ar: `معدل الأخطاء عند ${value}%` 
      },
      latency: { 
        en: `Average latency is ${value}ms`, 
        ar: `متوسط التأخير ${value}ms` 
      },
    };
    
    const msg = messages[rule.type] || { en: `Alert triggered`, ar: `تم تفعيل التنبيه` };
    
    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      titleAr: rule.name,
      message: msg.en,
      messageAr: msg.ar,
      value,
      threshold: rule.threshold,
      timestamp: new Date(),
      acknowledged: false,
    };
  }
  
  /**
   * Get all alerts
   */
  getAlerts(options: { unacknowledgedOnly?: boolean; severity?: Alert['severity'] } = {}): Alert[] {
    let filtered = this.alerts;
    
    if (options.unacknowledgedOnly) {
      filtered = filtered.filter(a => !a.acknowledged);
    }
    
    if (options.severity) {
      filtered = filtered.filter(a => a.severity === options.severity);
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  /**
   * Acknowledge alert
   */
  acknowledge(id: string): boolean {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }
  
  /**
   * Clear all alerts
   */
  clearAll(): void {
    this.alerts = [];
  }
}

// ==================== MONITORING SYSTEM ====================

export class MonitoringSystem {
  public metrics: MetricsCollector;
  public health: HealthChecker;
  public alerts: AlertManager;
  
  constructor() {
    this.metrics = new MetricsCollector();
    this.health = new HealthChecker();
    this.alerts = new AlertManager();
    
    this.setupDefaultRules();
    this.setupDefaultHealthChecks();
  }
  
  private setupDefaultRules(): void {
    this.alerts.addRule({
      id: 'high-cpu',
      name: 'High CPU Usage',
      type: 'cpu',
      condition: 'gt',
      threshold: 80,
      severity: 'warning',
      cooldown: 300, // 5 minutes
      enabled: true,
    });
    
    this.alerts.addRule({
      id: 'critical-cpu',
      name: 'Critical CPU Usage',
      type: 'cpu',
      condition: 'gt',
      threshold: 95,
      severity: 'critical',
      cooldown: 60, // 1 minute
      enabled: true,
    });
    
    this.alerts.addRule({
      id: 'high-memory',
      name: 'High Memory Usage',
      type: 'memory',
      condition: 'gt',
      threshold: 85,
      severity: 'warning',
      cooldown: 300,
      enabled: true,
    });
    
    this.alerts.addRule({
      id: 'high-error-rate',
      name: 'High Error Rate',
      type: 'error_rate',
      condition: 'gt',
      threshold: 5, // 5%
      severity: 'warning',
      cooldown: 120,
      enabled: true,
    });
    
    this.alerts.addRule({
      id: 'high-latency',
      name: 'High Latency',
      type: 'latency',
      condition: 'gt',
      threshold: 1000, // 1 second
      severity: 'warning',
      cooldown: 120,
      enabled: true,
    });
  }
  
  private setupDefaultHealthChecks(): void {
    // Database health check
    this.health.register('database', async () => {
      const start = Date.now();
      try {
        // Would do actual DB query here
        return {
          service: 'database',
          status: 'healthy',
          latency: Date.now() - start,
          lastCheck: new Date(),
        };
      } catch (error: any) {
        return {
          service: 'database',
          status: 'unhealthy',
          latency: Date.now() - start,
          lastCheck: new Date(),
          message: error.message,
        };
      }
    });
    
    // Memory health check
    this.health.register('memory', async () => {
      const memUsage = process.memoryUsage();
      const usagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      
      return {
        service: 'memory',
        status: usagePercent > 90 ? 'degraded' : 'healthy',
        latency: 0,
        lastCheck: new Date(),
        details: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          usagePercent: Math.round(usagePercent),
        },
      };
    });
  }
  
  /**
   * Get complete dashboard data
   */
  getDashboard(): {
    system: SystemMetrics;
    application: ApplicationMetrics;
    health: HealthCheck[];
    overallHealth: string;
    recentAlerts: Alert[];
  } {
    const system = this.metrics.getSystemMetrics();
    const application = this.metrics.getApplicationMetrics();
    
    // Check for new alerts
    const combinedMetrics = { ...system, ...application } as SystemMetrics & ApplicationMetrics;
    this.alerts.checkMetrics(combinedMetrics);
    
    return {
      system,
      application,
      health: this.health.getResults(),
      overallHealth: this.health.getOverallStatus(),
      recentAlerts: this.alerts.getAlerts({ unacknowledgedOnly: true }).slice(0, 10),
    };
  }
  
  /**
   * Start monitoring
   */
  start(): void {
    this.health.startPeriodicChecks(30000);
    console.log('[Monitoring] System started');
  }
  
  /**
   * Stop monitoring
   */
  stop(): void {
    this.health.stopPeriodicChecks();
    console.log('[Monitoring] System stopped');
  }
}

// Export singleton
export const monitoringSystem = new MonitoringSystem();
