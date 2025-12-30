/**
 * Version Control Service - خدمة إدارة التغييرات والتاريخ
 * 
 * نظام متكامل لإدارة الإصدارات مع:
 * - تسجيل كل التعديلات داخليًا
 * - مقارنة النسخ (الأصلية والمطورة)
 * - الرجوع لأي مرحلة
 */

import { db } from "../db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

// Version types
interface FileVersion {
  id: string;
  repositoryId: string;
  filePath: string;
  content: string;
  previousContent: string | null;
  version: number;
  commitHash: string;
  message: string;
  author: string;
  timestamp: Date;
  changes: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

interface VersionSnapshot {
  id: string;
  repositoryId: string;
  snapshotName: string;
  description: string;
  files: { path: string; content: string; hash: string }[];
  createdAt: Date;
  author: string;
  tags: string[];
  isOriginal: boolean; // Marks if this is the original Replit import
}

interface DiffResult {
  filePath: string;
  originalContent: string | null;
  currentContent: string | null;
  hunks: DiffHunk[];
  stats: {
    additions: number;
    deletions: number;
    changes: number;
  };
  status: 'added' | 'modified' | 'deleted' | 'unchanged';
}

interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

interface DiffLine {
  type: 'add' | 'delete' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface VersionHistory {
  versions: FileVersion[];
  snapshots: VersionSnapshot[];
  timeline: {
    id: string;
    type: 'commit' | 'snapshot' | 'rollback';
    description: string;
    timestamp: Date;
    author: string;
  }[];
}

// In-memory storage for versions (would be database in production)
const versionStorage = new Map<string, FileVersion[]>();
const snapshotStorage = new Map<string, VersionSnapshot[]>();
const timelineStorage = new Map<string, any[]>();

class VersionControlService {
  constructor() {
    console.log("[VersionControl] Service initialized | تم تهيئة خدمة إدارة التغييرات");
  }

  /**
   * Create initial snapshot from Replit import
   * إنشاء لقطة أولية من استيراد Replit
   */
  async createOriginalSnapshot(
    repositoryId: string,
    files: { path: string; content: string }[],
    author: string
  ): Promise<VersionSnapshot> {
    const snapshot: VersionSnapshot = {
      id: this.generateId(),
      repositoryId,
      snapshotName: 'Original Import',
      description: 'Original version imported from Replit',
      files: files.map(f => ({
        path: f.path,
        content: f.content,
        hash: this.hashContent(f.content)
      })),
      createdAt: new Date(),
      author,
      tags: ['original', 'replit-import'],
      isOriginal: true
    };

    const snapshots = snapshotStorage.get(repositoryId) || [];
    snapshots.unshift(snapshot);
    snapshotStorage.set(repositoryId, snapshots);

    // Add to timeline
    this.addTimelineEvent(repositoryId, {
      id: snapshot.id,
      type: 'snapshot',
      description: 'Original Replit import snapshot created',
      timestamp: new Date(),
      author
    });

    console.log(`[VersionControl] Original snapshot created for ${repositoryId}`);
    return snapshot;
  }

  /**
   * Create a new snapshot (checkpoint)
   * إنشاء لقطة جديدة (نقطة حفظ)
   */
  async createSnapshot(
    repositoryId: string,
    name: string,
    description: string,
    author: string
  ): Promise<VersionSnapshot> {
    const { sovereignGitEngine } = await import('../lib/sovereign-git-engine');
    const files = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');

    const snapshot: VersionSnapshot = {
      id: this.generateId(),
      repositoryId,
      snapshotName: name,
      description,
      files: files.map((f: any) => ({
        path: f.path,
        content: f.content || '',
        hash: this.hashContent(f.content || '')
      })),
      createdAt: new Date(),
      author,
      tags: [],
      isOriginal: false
    };

    const snapshots = snapshotStorage.get(repositoryId) || [];
    snapshots.unshift(snapshot);
    snapshotStorage.set(repositoryId, snapshots);

    this.addTimelineEvent(repositoryId, {
      id: snapshot.id,
      type: 'snapshot',
      description: `Snapshot created: ${name}`,
      timestamp: new Date(),
      author
    });

    console.log(`[VersionControl] Snapshot "${name}" created for ${repositoryId}`);
    return snapshot;
  }

  /**
   * Record a file change
   * تسجيل تغيير في ملف
   */
  async recordChange(
    repositoryId: string,
    filePath: string,
    newContent: string,
    previousContent: string | null,
    message: string,
    author: string
  ): Promise<FileVersion> {
    const versions = versionStorage.get(repositoryId) || [];
    const fileVersions = versions.filter(v => v.filePath === filePath);
    const versionNumber = fileVersions.length + 1;

    const changes = this.calculateChanges(previousContent, newContent);

    const version: FileVersion = {
      id: this.generateId(),
      repositoryId,
      filePath,
      content: newContent,
      previousContent,
      version: versionNumber,
      commitHash: this.generateCommitHash(),
      message,
      author,
      timestamp: new Date(),
      changes
    };

    versions.unshift(version);
    versionStorage.set(repositoryId, versions);

    this.addTimelineEvent(repositoryId, {
      id: version.id,
      type: 'commit',
      description: `${filePath}: ${message}`,
      timestamp: new Date(),
      author
    });

    return version;
  }

  /**
   * Get file history
   * الحصول على تاريخ الملف
   */
  async getFileHistory(repositoryId: string, filePath: string): Promise<FileVersion[]> {
    const versions = versionStorage.get(repositoryId) || [];
    return versions
      .filter(v => v.filePath === filePath)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get all snapshots for a repository
   * الحصول على جميع اللقطات للمستودع
   */
  async getSnapshots(repositoryId: string): Promise<VersionSnapshot[]> {
    return snapshotStorage.get(repositoryId) || [];
  }

  /**
   * Get repository timeline
   * الحصول على الجدول الزمني للمستودع
   */
  async getTimeline(repositoryId: string): Promise<any[]> {
    return timelineStorage.get(repositoryId) || [];
  }

  /**
   * Compare two versions (diff)
   * مقارنة نسختين
   */
  async compareVersions(
    repositoryId: string,
    sourceId: string,
    targetId: string
  ): Promise<DiffResult[]> {
    const snapshots = snapshotStorage.get(repositoryId) || [];
    const source = snapshots.find(s => s.id === sourceId);
    const target = snapshots.find(s => s.id === targetId);

    if (!source || !target) {
      throw new Error('Snapshot not found');
    }

    const results: DiffResult[] = [];
    const allPaths = new Set<string>();

    source.files.forEach(f => allPaths.add(f.path));
    target.files.forEach(f => allPaths.add(f.path));

    for (const path of allPaths) {
      const sourceFile = source.files.find(f => f.path === path);
      const targetFile = target.files.find(f => f.path === path);

      const diff = this.computeDiff(
        sourceFile?.content || null,
        targetFile?.content || null,
        path
      );
      results.push(diff);
    }

    return results.filter(r => r.status !== 'unchanged');
  }

  /**
   * Compare with original Replit version
   * مقارنة مع النسخة الأصلية من Replit
   */
  async compareWithOriginal(repositoryId: string): Promise<DiffResult[]> {
    const snapshots = snapshotStorage.get(repositoryId) || [];
    const original = snapshots.find(s => s.isOriginal);

    if (!original) {
      throw new Error('Original snapshot not found. Import from Replit first.');
    }

    // Get current files
    const { sovereignGitEngine } = await import('../lib/sovereign-git-engine');
    const currentFiles = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');

    const results: DiffResult[] = [];
    const allPaths = new Set<string>();

    original.files.forEach(f => allPaths.add(f.path));
    currentFiles.forEach((f: any) => allPaths.add(f.path));

    for (const path of allPaths) {
      const originalFile = original.files.find(f => f.path === path);
      const currentFile = currentFiles.find((f: any) => f.path === path);

      const diff = this.computeDiff(
        originalFile?.content || null,
        currentFile?.content || null,
        path
      );
      results.push(diff);
    }

    return results.filter(r => r.status !== 'unchanged');
  }

  /**
   * Rollback to a specific snapshot
   * الرجوع إلى لقطة معينة
   */
  async rollbackToSnapshot(
    repositoryId: string,
    snapshotId: string,
    author: string
  ): Promise<{ success: boolean; filesRestored: number; filesDeleted: number }> {
    const snapshots = snapshotStorage.get(repositoryId) || [];
    const targetSnapshot = snapshots.find(s => s.id === snapshotId);

    if (!targetSnapshot) {
      throw new Error('Snapshot not found');
    }

    const { sovereignGitEngine } = await import('../lib/sovereign-git-engine');

    // Create a backup snapshot before rollback
    await this.createSnapshot(
      repositoryId,
      `Pre-rollback backup`,
      `Automatic backup before rollback to "${targetSnapshot.snapshotName}"`,
      author
    );

    // Get current files to determine which need deletion
    const currentFiles = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
    const snapshotFilePaths = new Set(targetSnapshot.files.map(f => f.path));
    
    // Prepare files to commit (update/create from snapshot)
    const filesToCommit: { path: string; content: string; action: 'update' | 'delete' }[] = 
      targetSnapshot.files.map(f => ({
        path: f.path,
        content: f.content,
        action: 'update' as const
      }));

    // Add deletions for files that exist now but not in snapshot
    let filesDeleted = 0;
    for (const currentFile of currentFiles) {
      if (currentFile.type !== 'tree' && !snapshotFilePaths.has(currentFile.path)) {
        filesToCommit.push({
          path: currentFile.path,
          content: '',
          action: 'delete'
        });
        filesDeleted++;
      }
    }

    await sovereignGitEngine.commitFiles(
      repositoryId,
      filesToCommit,
      `Rollback to snapshot: ${targetSnapshot.snapshotName}`
    );

    this.addTimelineEvent(repositoryId, {
      id: this.generateId(),
      type: 'rollback',
      description: `Rolled back to snapshot: ${targetSnapshot.snapshotName} (${targetSnapshot.files.length} restored, ${filesDeleted} deleted)`,
      timestamp: new Date(),
      author
    });

    console.log(`[VersionControl] Rolled back to snapshot "${targetSnapshot.snapshotName}"`);

    return {
      success: true,
      filesRestored: targetSnapshot.files.length,
      filesDeleted
    };
  }

  /**
   * Rollback a specific file to a version
   * إرجاع ملف معين إلى إصدار سابق
   */
  async rollbackFile(
    repositoryId: string,
    filePath: string,
    versionId: string,
    author: string
  ): Promise<{ success: boolean; version: number }> {
    const versions = versionStorage.get(repositoryId) || [];
    const targetVersion = versions.find(v => v.id === versionId && v.filePath === filePath);

    if (!targetVersion) {
      throw new Error('Version not found');
    }

    const { sovereignGitEngine } = await import('../lib/sovereign-git-engine');

    // Get current content for backup
    const currentFiles = await sovereignGitEngine.getRepositoryFiles(repositoryId, 'main');
    const currentFile = currentFiles.find((f: any) => f.path === filePath);

    // Record the rollback as a new version
    await this.recordChange(
      repositoryId,
      filePath,
      targetVersion.content,
      currentFile?.content || null,
      `Rollback to version ${targetVersion.version}`,
      author
    );

    // Commit the rollback
    await sovereignGitEngine.commitFiles(repositoryId, [{
      path: filePath,
      content: targetVersion.content,
      action: 'update'
    }], `Rollback ${filePath} to version ${targetVersion.version}`);

    return {
      success: true,
      version: targetVersion.version
    };
  }

  /**
   * Get version statistics
   * الحصول على إحصائيات الإصدارات
   */
  async getVersionStats(repositoryId: string): Promise<{
    totalVersions: number;
    totalSnapshots: number;
    totalAdditions: number;
    totalDeletions: number;
    mostChangedFiles: { path: string; changes: number }[];
    recentActivity: { date: string; changes: number }[];
  }> {
    const versions = versionStorage.get(repositoryId) || [];
    const snapshots = snapshotStorage.get(repositoryId) || [];

    const fileChangeCounts = new Map<string, number>();
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const v of versions) {
      totalAdditions += v.changes.additions;
      totalDeletions += v.changes.deletions;
      fileChangeCounts.set(v.filePath, (fileChangeCounts.get(v.filePath) || 0) + 1);
    }

    const mostChangedFiles = Array.from(fileChangeCounts.entries())
      .map(([path, changes]) => ({ path, changes }))
      .sort((a, b) => b.changes - a.changes)
      .slice(0, 10);

    // Group by date for activity chart
    const activityMap = new Map<string, number>();
    for (const v of versions) {
      const date = v.timestamp.toISOString().split('T')[0];
      activityMap.set(date, (activityMap.get(date) || 0) + 1);
    }

    const recentActivity = Array.from(activityMap.entries())
      .map(([date, changes]) => ({ date, changes }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    return {
      totalVersions: versions.length,
      totalSnapshots: snapshots.length,
      totalAdditions,
      totalDeletions,
      mostChangedFiles,
      recentActivity
    };
  }

  // Helper methods

  private computeDiff(original: string | null, current: string | null, path: string): DiffResult {
    if (original === null && current === null) {
      return {
        filePath: path,
        originalContent: null,
        currentContent: null,
        hunks: [],
        stats: { additions: 0, deletions: 0, changes: 0 },
        status: 'unchanged'
      };
    }

    if (original === null) {
      const lines = (current || '').split('\n');
      return {
        filePath: path,
        originalContent: null,
        currentContent: current,
        hunks: [{
          oldStart: 0,
          oldLines: 0,
          newStart: 1,
          newLines: lines.length,
          lines: lines.map((line, i) => ({
            type: 'add' as const,
            content: line,
            newLineNumber: i + 1
          }))
        }],
        stats: { additions: lines.length, deletions: 0, changes: lines.length },
        status: 'added'
      };
    }

    if (current === null) {
      const lines = original.split('\n');
      return {
        filePath: path,
        originalContent: original,
        currentContent: null,
        hunks: [{
          oldStart: 1,
          oldLines: lines.length,
          newStart: 0,
          newLines: 0,
          lines: lines.map((line, i) => ({
            type: 'delete' as const,
            content: line,
            oldLineNumber: i + 1
          }))
        }],
        stats: { additions: 0, deletions: lines.length, changes: lines.length },
        status: 'deleted'
      };
    }

    if (original === current) {
      return {
        filePath: path,
        originalContent: original,
        currentContent: current,
        hunks: [],
        stats: { additions: 0, deletions: 0, changes: 0 },
        status: 'unchanged'
      };
    }

    // Compute line-by-line diff
    const originalLines = original.split('\n');
    const currentLines = current.split('\n');
    const hunks = this.computeLinesDiff(originalLines, currentLines);

    let additions = 0;
    let deletions = 0;

    for (const hunk of hunks) {
      for (const line of hunk.lines) {
        if (line.type === 'add') additions++;
        if (line.type === 'delete') deletions++;
      }
    }

    return {
      filePath: path,
      originalContent: original,
      currentContent: current,
      hunks,
      stats: { additions, deletions, changes: additions + deletions },
      status: 'modified'
    };
  }

  private computeLinesDiff(original: string[], current: string[]): DiffHunk[] {
    const hunks: DiffHunk[] = [];
    const lcs = this.longestCommonSubsequence(original, current);
    
    let oldIdx = 0;
    let newIdx = 0;
    let lcsIdx = 0;
    let currentHunk: DiffHunk | null = null;

    const startHunk = (oldStart: number, newStart: number) => {
      currentHunk = {
        oldStart,
        oldLines: 0,
        newStart,
        newLines: 0,
        lines: []
      };
    };

    const addContext = (content: string, oldLine: number, newLine: number) => {
      if (currentHunk) {
        currentHunk.lines.push({ type: 'context', content, oldLineNumber: oldLine, newLineNumber: newLine });
        currentHunk.oldLines++;
        currentHunk.newLines++;
      }
    };

    const addDeletion = (content: string, oldLine: number) => {
      if (!currentHunk) startHunk(oldLine, newIdx + 1);
      currentHunk!.lines.push({ type: 'delete', content, oldLineNumber: oldLine });
      currentHunk!.oldLines++;
    };

    const addAddition = (content: string, newLine: number) => {
      if (!currentHunk) startHunk(oldIdx + 1, newLine);
      currentHunk!.lines.push({ type: 'add', content, newLineNumber: newLine });
      currentHunk!.newLines++;
    };

    const flushHunk = () => {
      if (currentHunk && currentHunk.lines.some(l => l.type !== 'context')) {
        hunks.push(currentHunk);
      }
      currentHunk = null;
    };

    while (oldIdx < original.length || newIdx < current.length) {
      if (lcsIdx < lcs.length && oldIdx < original.length && newIdx < current.length) {
        if (original[oldIdx] === lcs[lcsIdx] && current[newIdx] === lcs[lcsIdx]) {
          // Context line
          if (currentHunk) {
            addContext(original[oldIdx], oldIdx + 1, newIdx + 1);
            // If we have 3+ context lines after changes, flush the hunk
            const contextCount = currentHunk.lines.filter(l => l.type === 'context').length;
            const hasChanges = currentHunk.lines.some(l => l.type !== 'context');
            if (contextCount >= 3 && hasChanges) {
              flushHunk();
            }
          }
          oldIdx++;
          newIdx++;
          lcsIdx++;
        } else if (original[oldIdx] !== lcs[lcsIdx]) {
          addDeletion(original[oldIdx], oldIdx + 1);
          oldIdx++;
        } else {
          addAddition(current[newIdx], newIdx + 1);
          newIdx++;
        }
      } else if (oldIdx < original.length) {
        addDeletion(original[oldIdx], oldIdx + 1);
        oldIdx++;
      } else if (newIdx < current.length) {
        addAddition(current[newIdx], newIdx + 1);
        newIdx++;
      }
    }

    flushHunk();
    return hunks;
  }

  private longestCommonSubsequence(a: string[], b: string[]): string[] {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Reconstruct LCS
    const lcs: string[] = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        lcs.unshift(a[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return lcs;
  }

  private calculateChanges(previous: string | null, current: string): { additions: number; deletions: number; modifications: number } {
    if (!previous) {
      return { additions: current.split('\n').length, deletions: 0, modifications: 0 };
    }

    const prevLines = new Set(previous.split('\n'));
    const currLines = current.split('\n');

    let additions = 0;
    let modifications = 0;

    for (const line of currLines) {
      if (!prevLines.has(line)) {
        additions++;
      }
    }

    const currSet = new Set(currLines);
    let deletions = 0;
    for (const line of prevLines) {
      if (!currSet.has(line)) {
        deletions++;
      }
    }

    return { additions, deletions, modifications: Math.min(additions, deletions) };
  }

  private addTimelineEvent(repositoryId: string, event: any): void {
    const timeline = timelineStorage.get(repositoryId) || [];
    timeline.unshift(event);
    timelineStorage.set(repositoryId, timeline);
  }

  private generateId(): string {
    return `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCommitHash(): string {
    return Math.random().toString(16).substr(2, 8) + Math.random().toString(16).substr(2, 8);
  }

  private hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}

export const versionControlService = new VersionControlService();
