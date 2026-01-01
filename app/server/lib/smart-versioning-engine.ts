/**
 * Smart Versioning Engine | محرك الإصدارات الذكية
 * 
 * Features:
 * - Version tracking for decisions, architecture, data, logic
 * - Rollback to any previous state
 * - Smart comparison between versions
 * - Full audit trail with bilingual support
 */

import crypto from 'crypto';
import { db } from '../db';
import { 
  systemVersions, 
  versionComparisons, 
  rollbackHistory, 
  decisionVersions,
  InsertSystemVersion,
  InsertVersionComparison,
  InsertRollbackHistory,
  InsertDecisionVersion,
  SystemVersion,
  VersionComparison,
  RollbackHistory,
  DecisionVersion
} from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export type VersionType = 'decision' | 'architecture' | 'data' | 'logic' | 'code' | 'config' | 'policy';

export interface VersionSnapshot {
  type: VersionType;
  data: Record<string, any>;
  checksum: string;
  timestamp: string;
}

export interface DiffResult {
  path: string;
  pathAr: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComparisonStats {
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
}

export interface VersioningStats {
  totalVersions: number;
  versionsByType: Record<string, number>;
  totalRollbacks: number;
  totalComparisons: number;
  recentVersions: number;
  recentRollbacks: number;
}

const OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

class SmartVersioningEngine {
  private versionCounters: Map<string, number> = new Map();

  constructor() {
    console.log('[SmartVersioning] Engine initialized | تم تهيئة محرك الإصدارات الذكية');
  }

  private generateChecksum(data: Record<string, any>): string {
    const json = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(json).digest('hex').substring(0, 16);
  }

  private getNextVersionNumber(tenantId: string, type: VersionType): number {
    const key = `${tenantId}:${type}`;
    const current = this.versionCounters.get(key) || 0;
    const next = current + 1;
    this.versionCounters.set(key, next);
    return next;
  }

  async createVersion(
    tenantId: string,
    type: VersionType,
    title: string,
    titleAr: string,
    snapshot: Record<string, any>,
    changes: { field: string; oldValue: any; newValue: any }[],
    createdBy: string,
    createdByEmail: string,
    metadata: Record<string, any> = {},
    tags: string[] = [],
    parentVersionId?: string
  ): Promise<SystemVersion> {
    const existingVersions = await db.select({ count: sql<number>`count(*)` })
      .from(systemVersions)
      .where(and(eq(systemVersions.tenantId, tenantId), eq(systemVersions.versionType, type)));
    
    const versionNumber = (existingVersions[0]?.count || 0) + 1;

    const [version] = await db.insert(systemVersions).values({
      tenantId,
      versionNumber,
      versionType: type,
      title,
      titleAr,
      description: `Version ${versionNumber} of ${type}`,
      descriptionAr: `الإصدار ${versionNumber} من ${type}`,
      status: 'active',
      parentVersionId: parentVersionId || undefined,
      snapshot: { ...snapshot, _checksum: this.generateChecksum(snapshot) },
      changes,
      metadata,
      tags,
      createdBy,
      createdByEmail
    }).returning();

    if (parentVersionId) {
      await db.update(systemVersions)
        .set({ status: 'superseded' })
        .where(eq(systemVersions.id, parentVersionId));
    }

    console.log(`[SmartVersioning] Created version ${versionNumber} for ${type} | تم إنشاء الإصدار ${versionNumber}`);
    return version;
  }

  async createDecisionVersion(
    tenantId: string,
    decisionId: string,
    decisionType: string,
    title: string,
    titleAr: string,
    input: Record<string, any>,
    output: Record<string, any>,
    reasoning: string,
    reasoningAr: string,
    confidence: number,
    createdBy: string
  ): Promise<DecisionVersion> {
    const existingVersions = await db.select({ count: sql<number>`count(*)` })
      .from(decisionVersions)
      .where(and(eq(decisionVersions.tenantId, tenantId), eq(decisionVersions.decisionId, decisionId)));
    
    const versionNumber = (existingVersions[0]?.count || 0) + 1;

    const [decision] = await db.insert(decisionVersions).values({
      tenantId,
      decisionId,
      versionNumber,
      decisionType,
      title,
      titleAr,
      input,
      output,
      reasoning,
      reasoningAr,
      confidence,
      status: 'pending',
      createdBy
    }).returning();

    console.log(`[SmartVersioning] Created decision version ${versionNumber} | تم إنشاء إصدار القرار ${versionNumber}`);
    return decision;
  }

  async compareVersions(
    tenantId: string,
    sourceVersionId: string,
    targetVersionId: string,
    createdBy: string
  ): Promise<VersionComparison> {
    const [source] = await db.select().from(systemVersions).where(eq(systemVersions.id, sourceVersionId));
    const [target] = await db.select().from(systemVersions).where(eq(systemVersions.id, targetVersionId));

    if (!source || !target) {
      throw new Error('Version not found | الإصدار غير موجود');
    }

    const differences = this.computeDiff(source.snapshot as Record<string, any>, target.snapshot as Record<string, any>);
    const stats = this.computeStats(differences);

    const [comparison] = await db.insert(versionComparisons).values({
      tenantId,
      sourceVersionId,
      targetVersionId,
      comparisonType: 'diff',
      differences,
      summary: `Compared v${source.versionNumber} to v${target.versionNumber}: ${stats.added} added, ${stats.removed} removed, ${stats.modified} modified`,
      summaryAr: `مقارنة الإصدار ${source.versionNumber} مع ${target.versionNumber}: ${stats.added} إضافات، ${stats.removed} حذف، ${stats.modified} تعديل`,
      stats,
      createdBy
    }).returning();

    console.log(`[SmartVersioning] Compared versions | تمت مقارنة الإصدارات`);
    return comparison;
  }

  private computeDiff(source: Record<string, any>, target: Record<string, any>, path: string = ''): DiffResult[] {
    const differences: DiffResult[] = [];
    const allKeys = new Set([...Object.keys(source || {}), ...Object.keys(target || {})]);

    for (const key of allKeys) {
      if (key === '_checksum') continue;
      
      const currentPath = path ? `${path}.${key}` : key;
      const oldValue = source?.[key];
      const newValue = target?.[key];

      if (oldValue === undefined && newValue !== undefined) {
        differences.push({
          path: currentPath,
          pathAr: this.translatePath(currentPath),
          oldValue: null,
          newValue,
          changeType: 'added',
          severity: this.determineSeverity(currentPath, 'added')
        });
      } else if (oldValue !== undefined && newValue === undefined) {
        differences.push({
          path: currentPath,
          pathAr: this.translatePath(currentPath),
          oldValue,
          newValue: null,
          changeType: 'removed',
          severity: this.determineSeverity(currentPath, 'removed')
        });
      } else if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue !== null && newValue !== null) {
        differences.push(...this.computeDiff(oldValue, newValue, currentPath));
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        differences.push({
          path: currentPath,
          pathAr: this.translatePath(currentPath),
          oldValue,
          newValue,
          changeType: 'modified',
          severity: this.determineSeverity(currentPath, 'modified')
        });
      }
    }

    return differences;
  }

  private translatePath(path: string): string {
    const translations: Record<string, string> = {
      'security': 'الأمان',
      'permissions': 'الصلاحيات',
      'roles': 'الأدوار',
      'config': 'الإعدادات',
      'data': 'البيانات',
      'logic': 'المنطق',
      'architecture': 'البنية',
      'decision': 'القرار',
      'policy': 'السياسة'
    };

    let translated = path;
    for (const [en, ar] of Object.entries(translations)) {
      translated = translated.replace(new RegExp(en, 'gi'), ar);
    }
    return translated;
  }

  private determineSeverity(path: string, changeType: 'added' | 'removed' | 'modified'): 'low' | 'medium' | 'high' | 'critical' {
    const criticalPaths = ['security', 'permissions', 'encryption', 'auth', 'password', 'secret'];
    const highPaths = ['roles', 'access', 'policy', 'compliance', 'governance'];
    const mediumPaths = ['config', 'settings', 'options', 'preferences'];

    const lowerPath = path.toLowerCase();
    
    if (criticalPaths.some(p => lowerPath.includes(p))) {
      return 'critical';
    }
    if (highPaths.some(p => lowerPath.includes(p))) {
      return 'high';
    }
    if (mediumPaths.some(p => lowerPath.includes(p))) {
      return 'medium';
    }
    return 'low';
  }

  private computeStats(differences: DiffResult[]): ComparisonStats {
    return {
      added: differences.filter(d => d.changeType === 'added').length,
      removed: differences.filter(d => d.changeType === 'removed').length,
      modified: differences.filter(d => d.changeType === 'modified').length,
      unchanged: 0
    };
  }

  async rollback(
    tenantId: string,
    fromVersionId: string,
    toVersionId: string,
    reason: string,
    reasonAr: string,
    executedBy: string,
    executedByEmail: string,
    rollbackType: 'full' | 'partial' | 'selective' = 'full',
    affectedComponents: string[] = []
  ): Promise<RollbackHistory> {
    const [fromVersion] = await db.select().from(systemVersions).where(eq(systemVersions.id, fromVersionId));
    const [toVersion] = await db.select().from(systemVersions).where(eq(systemVersions.id, toVersionId));

    if (!fromVersion || !toVersion) {
      throw new Error('Version not found | الإصدار غير موجود');
    }

    const [rollback] = await db.insert(rollbackHistory).values({
      tenantId,
      fromVersionId,
      toVersionId,
      rollbackType,
      affectedComponents: affectedComponents.length > 0 ? affectedComponents : [fromVersion.versionType],
      reason,
      reasonAr,
      status: 'completed',
      executedBy,
      executedByEmail,
      completedAt: new Date()
    }).returning();

    await db.update(systemVersions)
      .set({ status: 'rolled_back', rolledBackAt: new Date(), rolledBackBy: executedBy })
      .where(eq(systemVersions.id, fromVersionId));

    await db.update(systemVersions)
      .set({ status: 'active' })
      .where(eq(systemVersions.id, toVersionId));

    console.log(`[SmartVersioning] Rolled back from v${fromVersion.versionNumber} to v${toVersion.versionNumber} | تم التراجع`);
    return rollback;
  }

  async getVersions(tenantId: string, type?: VersionType, limit: number = 50): Promise<SystemVersion[]> {
    let query = db.select().from(systemVersions).where(eq(systemVersions.tenantId, tenantId));
    
    if (type) {
      query = db.select().from(systemVersions).where(
        and(eq(systemVersions.tenantId, tenantId), eq(systemVersions.versionType, type))
      );
    }

    return query.orderBy(desc(systemVersions.createdAt)).limit(limit);
  }

  async getVersion(versionId: string): Promise<SystemVersion | undefined> {
    const [version] = await db.select().from(systemVersions).where(eq(systemVersions.id, versionId));
    return version;
  }

  async getDecisionVersions(tenantId: string, decisionId?: string, limit: number = 50): Promise<DecisionVersion[]> {
    let query = db.select().from(decisionVersions).where(eq(decisionVersions.tenantId, tenantId));
    
    if (decisionId) {
      query = db.select().from(decisionVersions).where(
        and(eq(decisionVersions.tenantId, tenantId), eq(decisionVersions.decisionId, decisionId))
      );
    }

    return query.orderBy(desc(decisionVersions.createdAt)).limit(limit);
  }

  async getComparisons(tenantId: string, limit: number = 50): Promise<VersionComparison[]> {
    return db.select().from(versionComparisons)
      .where(eq(versionComparisons.tenantId, tenantId))
      .orderBy(desc(versionComparisons.createdAt))
      .limit(limit);
  }

  async getRollbackHistory(tenantId: string, limit: number = 50): Promise<RollbackHistory[]> {
    return db.select().from(rollbackHistory)
      .where(eq(rollbackHistory.tenantId, tenantId))
      .orderBy(desc(rollbackHistory.executedAt))
      .limit(limit);
  }

  async getStats(tenantId: string): Promise<VersioningStats> {
    const versions = await db.select().from(systemVersions).where(eq(systemVersions.tenantId, tenantId));
    const rollbacks = await db.select().from(rollbackHistory).where(eq(rollbackHistory.tenantId, tenantId));
    const comparisons = await db.select().from(versionComparisons).where(eq(versionComparisons.tenantId, tenantId));

    const versionsByType: Record<string, number> = {};
    for (const v of versions) {
      versionsByType[v.versionType] = (versionsByType[v.versionType] || 0) + 1;
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentVersions = versions.filter(v => v.createdAt && new Date(v.createdAt) > oneDayAgo).length;
    const recentRollbacks = rollbacks.filter(r => r.executedAt && new Date(r.executedAt) > oneDayAgo).length;

    return {
      totalVersions: versions.length,
      versionsByType,
      totalRollbacks: rollbacks.length,
      totalComparisons: comparisons.length,
      recentVersions,
      recentRollbacks
    };
  }

  async approveDecision(decisionVersionId: string, approvedBy: string): Promise<DecisionVersion | undefined> {
    const [updated] = await db.update(decisionVersions)
      .set({ status: 'approved', approvedBy, approvedAt: new Date() })
      .where(eq(decisionVersions.id, decisionVersionId))
      .returning();
    return updated;
  }

  async rejectDecision(decisionVersionId: string, approvedBy: string): Promise<DecisionVersion | undefined> {
    const [updated] = await db.update(decisionVersions)
      .set({ status: 'rejected', approvedBy, approvedAt: new Date() })
      .where(eq(decisionVersions.id, decisionVersionId))
      .returning();
    return updated;
  }
}

export const smartVersioningEngine = new SmartVersioningEngine();
