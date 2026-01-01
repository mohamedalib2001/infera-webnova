/**
 * INFERA WebNova - Performance Monitoring Service
 * Real-time performance monitoring and analytics
 * 
 * Features: Build metrics, Resource tracking, Cost analysis, Alerts
 * Standards: SRE, DevOps, ISO 27001
 */

import { EventEmitter } from 'events';
import { generateSecureId } from './utils/id-generator';

// ==================== TYPES ====================
export interface PerformanceMetric {
  id: string;
  projectId: string;
  type: MetricType;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

export type MetricType =
  | 'build_duration'
  | 'build_size'
  | 'test_duration'
  | 'test_count'
  | 'coverage'
  | 'deploy_duration'
  | 'cpu_usage'
  | 'memory_usage'
  | 'disk_usage'
  | 'network_io'
  | 'error_rate'
  | 'success_rate'
  | 'queue_time'
  | 'artifact_size'
  | 'cost';

export interface PerformanceAlert {
  id: string;
  projectId: string;
  name: string;
  nameAr: string;
  metric: MetricType;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // seconds
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  channels: string[]; // notification channel IDs
  lastTriggered?: Date;
  status: 'ok' | 'triggered' | 'acknowledged';
}

export interface DashboardWidget {
  id: string;
  type: 'line_chart' | 'bar_chart' | 'gauge' | 'counter' | 'table' | 'heatmap';
  title: string;
  titleAr: string;
  metrics: MetricType[];
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count';
  refreshInterval: number; // seconds
}

export interface BuildAnalytics {
  totalBuilds: number;
  successfulBuilds: number;
  failedBuilds: number;
  successRate: number;
  averageDuration: number;
  totalBuildTime: number;
  byPlatform: Record<string, { count: number; avgDuration: number; successRate: number }>;
  byFramework: Record<string, { count: number; avgDuration: number; successRate: number }>;
  timeline: Array<{ date: string; success: number; failed: number; avgDuration: number }>;
}

export interface CostAnalytics {
  totalCost: number;
  currency: string;
  byService: Record<string, number>;
  byProject: Record<string, number>;
  byMonth: Record<string, number>;
  projectedMonthly: number;
  savings: number;
}

export interface ResourceUsage {
  cpu: { current: number; average: number; peak: number };
  memory: { current: number; average: number; peak: number; total: number };
  disk: { used: number; total: number; percentage: number };
  network: { inbound: number; outbound: number };
  buildMinutes: { used: number; limit: number; percentage: number };
}

// ==================== PERFORMANCE MONITORING SERVICE ====================
export class PerformanceMonitoringService extends EventEmitter {
  private metrics: PerformanceMetric[] = [];
  private alerts: Map<string, PerformanceAlert> = new Map();
  private maxMetrics = 100000; // Keep last 100k metrics
  private alertCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startAlertChecker();
  }

  private startAlertChecker(): void {
    // Check alerts every 30 seconds
    this.alertCheckInterval = setInterval(() => {
      this.checkAlerts();
    }, 30000);
  }

  recordMetric(
    projectId: string,
    type: MetricType,
    name: string,
    value: number,
    unit: string,
    tags: Record<string, string> = {},
    metadata?: Record<string, any>
  ): PerformanceMetric {
    const metric: PerformanceMetric = {
      id: generateSecureId('metric'),
      projectId,
      type,
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
      metadata,
    };

    this.metrics.push(metric);
    this.emit('metricRecorded', metric);

    // Trim old metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    return metric;
  }

  recordBuildMetrics(
    projectId: string,
    buildId: string,
    platform: string,
    framework: string,
    duration: number,
    success: boolean,
    artifactSize: number
  ): void {
    const tags = { buildId, platform, framework, status: success ? 'success' : 'failed' };

    this.recordMetric(projectId, 'build_duration', 'Build Duration', duration, 'ms', tags);
    this.recordMetric(projectId, 'build_size', 'Artifact Size', artifactSize, 'bytes', tags);
    this.recordMetric(projectId, success ? 'success_rate' : 'error_rate', 'Build Result', 1, 'count', tags);
  }

  recordTestMetrics(
    projectId: string,
    testRunId: string,
    duration: number,
    totalTests: number,
    passedTests: number,
    coverage?: number
  ): void {
    const tags = { testRunId };

    this.recordMetric(projectId, 'test_duration', 'Test Duration', duration, 'ms', tags);
    this.recordMetric(projectId, 'test_count', 'Total Tests', totalTests, 'count', tags);
    
    if (coverage !== undefined) {
      this.recordMetric(projectId, 'coverage', 'Code Coverage', coverage, 'percentage', tags);
    }

    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    this.recordMetric(projectId, 'success_rate', 'Test Pass Rate', passRate, 'percentage', tags);
  }

  recordResourceMetrics(
    projectId: string,
    cpu: number,
    memory: number,
    disk: number
  ): void {
    const tags = { source: 'system' };

    this.recordMetric(projectId, 'cpu_usage', 'CPU Usage', cpu, 'percentage', tags);
    this.recordMetric(projectId, 'memory_usage', 'Memory Usage', memory, 'MB', tags);
    this.recordMetric(projectId, 'disk_usage', 'Disk Usage', disk, 'percentage', tags);
  }

  getMetrics(
    projectId: string,
    type?: MetricType,
    startTime?: Date,
    endTime?: Date
  ): PerformanceMetric[] {
    let filtered = this.metrics.filter(m => m.projectId === projectId);

    if (type) {
      filtered = filtered.filter(m => m.type === type);
    }

    if (startTime) {
      filtered = filtered.filter(m => m.timestamp >= startTime);
    }

    if (endTime) {
      filtered = filtered.filter(m => m.timestamp <= endTime);
    }

    return filtered;
  }

  async getBuildAnalytics(projectId: string, days: number = 30): Promise<BuildAnalytics> {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - days);

    const buildMetrics = this.getMetrics(projectId, 'build_duration', startTime);
    const successMetrics = this.getMetrics(projectId, 'success_rate', startTime);
    const errorMetrics = this.getMetrics(projectId, 'error_rate', startTime);

    const totalBuilds = buildMetrics.length;
    const successfulBuilds = successMetrics.filter(m => m.tags.status === 'success').length;
    const failedBuilds = errorMetrics.length;

    const byPlatform: BuildAnalytics['byPlatform'] = {};
    const byFramework: BuildAnalytics['byFramework'] = {};

    for (const metric of buildMetrics) {
      const platform = metric.tags.platform || 'unknown';
      const framework = metric.tags.framework || 'unknown';
      const success = metric.tags.status === 'success';

      // By platform
      if (!byPlatform[platform]) {
        byPlatform[platform] = { count: 0, avgDuration: 0, successRate: 0 };
      }
      byPlatform[platform].count++;
      byPlatform[platform].avgDuration += metric.value;

      // By framework
      if (!byFramework[framework]) {
        byFramework[framework] = { count: 0, avgDuration: 0, successRate: 0 };
      }
      byFramework[framework].count++;
      byFramework[framework].avgDuration += metric.value;
    }

    // Calculate averages
    for (const platform of Object.keys(byPlatform)) {
      byPlatform[platform].avgDuration /= byPlatform[platform].count;
      const platformSuccess = successMetrics.filter(m => m.tags.platform === platform).length;
      byPlatform[platform].successRate = (platformSuccess / byPlatform[platform].count) * 100;
    }

    for (const framework of Object.keys(byFramework)) {
      byFramework[framework].avgDuration /= byFramework[framework].count;
      const frameworkSuccess = successMetrics.filter(m => m.tags.framework === framework).length;
      byFramework[framework].successRate = (frameworkSuccess / byFramework[framework].count) * 100;
    }

    // Generate timeline
    const timeline: BuildAnalytics['timeline'] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayMetrics = buildMetrics.filter(
        m => m.timestamp.toISOString().split('T')[0] === dateStr
      );
      const daySuccess = dayMetrics.filter(m => m.tags.status === 'success').length;
      const dayFailed = dayMetrics.filter(m => m.tags.status === 'failed').length;
      const dayAvgDuration = dayMetrics.length > 0
        ? dayMetrics.reduce((acc, m) => acc + m.value, 0) / dayMetrics.length
        : 0;

      timeline.push({
        date: dateStr,
        success: daySuccess,
        failed: dayFailed,
        avgDuration: dayAvgDuration,
      });
    }

    return {
      totalBuilds,
      successfulBuilds,
      failedBuilds,
      successRate: totalBuilds > 0 ? (successfulBuilds / totalBuilds) * 100 : 0,
      averageDuration: totalBuilds > 0
        ? buildMetrics.reduce((acc, m) => acc + m.value, 0) / totalBuilds
        : 0,
      totalBuildTime: buildMetrics.reduce((acc, m) => acc + m.value, 0),
      byPlatform,
      byFramework,
      timeline: timeline.reverse(),
    };
  }

  async getCostAnalytics(projectId: string): Promise<CostAnalytics> {
    const costMetrics = this.getMetrics(projectId, 'cost');

    const byService: Record<string, number> = {};
    const byMonth: Record<string, number> = {};

    for (const metric of costMetrics) {
      const service = metric.tags.service || 'general';
      const month = metric.timestamp.toISOString().substring(0, 7);

      byService[service] = (byService[service] || 0) + metric.value;
      byMonth[month] = (byMonth[month] || 0) + metric.value;
    }

    const totalCost = costMetrics.reduce((acc, m) => acc + m.value, 0);

    // Project monthly cost
    const currentMonth = new Date().toISOString().substring(0, 7);
    const daysInMonth = new Date().getDate();
    const currentMonthCost = byMonth[currentMonth] || 0;
    const projectedMonthly = (currentMonthCost / daysInMonth) * 30;

    return {
      totalCost,
      currency: 'USD',
      byService,
      byProject: { [projectId]: totalCost },
      byMonth,
      projectedMonthly,
      savings: 0, // Would calculate based on optimizations
    };
  }

  async getResourceUsage(projectId: string): Promise<ResourceUsage> {
    const recentTime = new Date();
    recentTime.setMinutes(recentTime.getMinutes() - 60);

    const cpuMetrics = this.getMetrics(projectId, 'cpu_usage', recentTime);
    const memoryMetrics = this.getMetrics(projectId, 'memory_usage', recentTime);
    const diskMetrics = this.getMetrics(projectId, 'disk_usage', recentTime);

    const calculateStats = (metrics: PerformanceMetric[]) => {
      if (metrics.length === 0) return { current: 0, average: 0, peak: 0 };
      const values = metrics.map(m => m.value);
      return {
        current: values[values.length - 1],
        average: values.reduce((a, b) => a + b, 0) / values.length,
        peak: Math.max(...values),
      };
    };

    const cpuStats = calculateStats(cpuMetrics);
    const memoryStats = calculateStats(memoryMetrics);
    const diskStats = calculateStats(diskMetrics);

    return {
      cpu: cpuStats,
      memory: { ...memoryStats, total: 4096 },
      disk: { used: diskStats.current * 100, total: 10000, percentage: diskStats.current },
      network: { inbound: 0, outbound: 0 },
      buildMinutes: { used: 450, limit: 1000, percentage: 45 },
    };
  }

  // ==================== ALERTS ====================

  createAlert(
    projectId: string,
    name: string,
    nameAr: string,
    metric: MetricType,
    condition: PerformanceAlert['condition'],
    threshold: number,
    severity: PerformanceAlert['severity'],
    channels: string[] = []
  ): PerformanceAlert {
    const alertId = generateSecureId('alert');

    const alert: PerformanceAlert = {
      id: alertId,
      projectId,
      name,
      nameAr,
      metric,
      condition,
      threshold,
      duration: 60,
      severity,
      enabled: true,
      channels,
      status: 'ok',
    };

    this.alerts.set(alertId, alert);
    return alert;
  }

  private checkAlerts(): void {
    for (const alert of Array.from(this.alerts.values())) {
      if (!alert.enabled) continue;

      const recentTime = new Date();
      recentTime.setSeconds(recentTime.getSeconds() - alert.duration);

      const metrics = this.getMetrics(alert.projectId, alert.metric, recentTime);
      if (metrics.length === 0) continue;

      const avgValue = metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length;
      let triggered = false;

      switch (alert.condition) {
        case 'gt':
          triggered = avgValue > alert.threshold;
          break;
        case 'lt':
          triggered = avgValue < alert.threshold;
          break;
        case 'gte':
          triggered = avgValue >= alert.threshold;
          break;
        case 'lte':
          triggered = avgValue <= alert.threshold;
          break;
        case 'eq':
          triggered = avgValue === alert.threshold;
          break;
      }

      if (triggered && alert.status !== 'triggered') {
        alert.status = 'triggered';
        alert.lastTriggered = new Date();
        this.emit('alertTriggered', { alert, value: avgValue });
      } else if (!triggered && alert.status === 'triggered') {
        alert.status = 'ok';
        this.emit('alertResolved', alert);
      }
    }
  }

  getAlerts(projectId: string): PerformanceAlert[] {
    return Array.from(this.alerts.values()).filter(a => a.projectId === projectId);
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.status = 'acknowledged';
    return true;
  }

  // ==================== DASHBOARD ====================

  getDefaultDashboard(): DashboardWidget[] {
    return [
      {
        id: 'build-success-rate',
        type: 'gauge',
        title: 'Build Success Rate',
        titleAr: 'معدل نجاح البناء',
        metrics: ['success_rate'],
        timeRange: '24h',
        aggregation: 'avg',
        refreshInterval: 60,
      },
      {
        id: 'build-duration-trend',
        type: 'line_chart',
        title: 'Build Duration Trend',
        titleAr: 'اتجاه مدة البناء',
        metrics: ['build_duration'],
        timeRange: '7d',
        aggregation: 'avg',
        refreshInterval: 300,
      },
      {
        id: 'test-coverage',
        type: 'gauge',
        title: 'Code Coverage',
        titleAr: 'تغطية الكود',
        metrics: ['coverage'],
        timeRange: '24h',
        aggregation: 'avg',
        refreshInterval: 300,
      },
      {
        id: 'builds-by-platform',
        type: 'bar_chart',
        title: 'Builds by Platform',
        titleAr: 'البناءات حسب المنصة',
        metrics: ['build_duration'],
        timeRange: '7d',
        aggregation: 'count',
        refreshInterval: 300,
      },
      {
        id: 'resource-usage',
        type: 'line_chart',
        title: 'Resource Usage',
        titleAr: 'استخدام الموارد',
        metrics: ['cpu_usage', 'memory_usage'],
        timeRange: '1h',
        aggregation: 'avg',
        refreshInterval: 30,
      },
      {
        id: 'recent-builds',
        type: 'table',
        title: 'Recent Builds',
        titleAr: 'البناءات الأخيرة',
        metrics: ['build_duration'],
        timeRange: '24h',
        aggregation: 'sum',
        refreshInterval: 60,
      },
    ];
  }

  cleanup(): void {
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }
  }
}

// ==================== SINGLETON EXPORT ====================
export const performanceMonitoringService = new PerformanceMonitoringService();
