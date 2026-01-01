/**
 * INFERA WebNova - Live Editing + Versioning System
 * Core module for real-time collaboration and version control
 */

import { eventBus, createEvent, EventTypes } from '../event-bus';
import { type Version } from '../contracts';

export interface IVersioningSystem {
  commit(projectId: string, tenantId: string, changes: VersionChange[], message?: string): Promise<Version>;
  getVersion(versionId: string): Promise<Version | null>;
  listVersions(projectId: string): Promise<Version[]>;
  restore(versionId: string): Promise<Version>;
  diff(versionA: string, versionB: string): Promise<VersionDiff>;
  createTag(versionId: string, tag: string): Promise<void>;
}

export interface VersionChange {
  type: 'create' | 'update' | 'delete';
  file: string;
  content?: string;
  previousContent?: string;
}

export interface VersionDiff {
  versionA: string;
  versionB: string;
  changes: Array<{
    file: string;
    type: 'added' | 'modified' | 'deleted';
    additions: number;
    deletions: number;
  }>;
  totalAdditions: number;
  totalDeletions: number;
}

class VersioningSystemImpl implements IVersioningSystem {
  private versions: Map<string, Version> = new Map();
  private projectVersions: Map<string, string[]> = new Map();
  private versionCounter: Map<string, number> = new Map();

  async commit(
    projectId: string,
    tenantId: string,
    changes: VersionChange[],
    description?: string
  ): Promise<Version> {
    const versionNumber = (this.versionCounter.get(projectId) || 0) + 1;
    this.versionCounter.set(projectId, versionNumber);

    const previousVersionId = this.getLatestVersionId(projectId);
    const previousVersion = previousVersionId ? (this.versions.get(previousVersionId) || null) : null;

    const snapshot = this.createSnapshot(previousVersion, changes);

    const version: Version = {
      id: crypto.randomUUID(),
      projectId,
      tenantId,
      version: `v${versionNumber}`,
      description,
      changes: changes.map(c => ({
        type: c.type,
        file: c.file,
        diff: c.previousContent ? this.generateDiff(c.previousContent, c.content || '') : undefined,
      })),
      snapshot,
      createdAt: new Date(),
      createdBy: tenantId,
    };

    this.versions.set(version.id, version);

    if (!this.projectVersions.has(projectId)) {
      this.projectVersions.set(projectId, []);
    }
    this.projectVersions.get(projectId)!.push(version.id);

    await eventBus.publish(createEvent(EventTypes.VERSION_COMMITTED, {
      versionId: version.id,
      projectId,
      tenantId,
      version: version.version,
      changesCount: changes.length,
    }, { tenantId }));

    return version;
  }

  async getVersion(versionId: string): Promise<Version | null> {
    return this.versions.get(versionId) || null;
  }

  async listVersions(projectId: string): Promise<Version[]> {
    const versionIds = this.projectVersions.get(projectId) || [];
    return versionIds
      .map(id => this.versions.get(id))
      .filter((v): v is Version => v !== undefined)
      .reverse();
  }

  async restore(versionId: string): Promise<Version> {
    const version = this.versions.get(versionId);
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }

    const changes: VersionChange[] = Object.entries(version.snapshot.files).map(([file, content]) => ({
      type: 'update' as const,
      file,
      content: content as string,
    }));

    const restoredVersion = await this.commit(
      version.projectId,
      version.tenantId,
      changes,
      `Restored from ${version.version}`
    );

    await eventBus.publish(createEvent(EventTypes.VERSION_RESTORED, {
      originalVersionId: versionId,
      newVersionId: restoredVersion.id,
      projectId: version.projectId,
    }, { tenantId: version.tenantId }));

    return restoredVersion;
  }

  async diff(versionAId: string, versionBId: string): Promise<VersionDiff> {
    const versionA = this.versions.get(versionAId);
    const versionB = this.versions.get(versionBId);

    if (!versionA || !versionB) {
      throw new Error('One or both versions not found');
    }

    const filesA = new Set(Object.keys(versionA.snapshot.files));
    const filesB = new Set(Object.keys(versionB.snapshot.files));

    const changes: VersionDiff['changes'] = [];
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const file of Array.from(filesB)) {
      if (!filesA.has(file)) {
        const content = versionB.snapshot.files[file] as string;
        const additions = content.split('\n').length;
        changes.push({ file, type: 'added', additions, deletions: 0 });
        totalAdditions += additions;
      } else if (versionA.snapshot.files[file] !== versionB.snapshot.files[file]) {
        const oldLines = (versionA.snapshot.files[file] as string).split('\n').length;
        const newLines = (versionB.snapshot.files[file] as string).split('\n').length;
        const additions = Math.max(0, newLines - oldLines);
        const deletions = Math.max(0, oldLines - newLines);
        changes.push({ file, type: 'modified', additions, deletions });
        totalAdditions += additions;
        totalDeletions += deletions;
      }
    }

    for (const file of Array.from(filesA)) {
      if (!filesB.has(file)) {
        const content = versionA.snapshot.files[file] as string;
        const deletions = content.split('\n').length;
        changes.push({ file, type: 'deleted', additions: 0, deletions });
        totalDeletions += deletions;
      }
    }

    return {
      versionA: versionAId,
      versionB: versionBId,
      changes,
      totalAdditions,
      totalDeletions,
    };
  }

  async createTag(versionId: string, tag: string): Promise<void> {
    const version = this.versions.get(versionId);
    if (!version) {
      throw new Error(`Version ${versionId} not found`);
    }
    version.tag = tag;
  }

  private getLatestVersionId(projectId: string): string | undefined {
    const versions = this.projectVersions.get(projectId);
    return versions?.[versions.length - 1];
  }

  private createSnapshot(
    previousVersion: Version | null,
    changes: VersionChange[]
  ): Version['snapshot'] {
    const files: Record<string, string> = previousVersion
      ? { ...previousVersion.snapshot.files }
      : {};

    for (const change of changes) {
      if (change.type === 'delete') {
        delete files[change.file];
      } else if (change.content !== undefined) {
        files[change.file] = change.content;
      }
    }

    return { files, metadata: {} };
  }

  private generateDiff(oldContent: string, newContent: string): string {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    const diff: string[] = [];
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      if (oldLines[i] !== newLines[i]) {
        if (oldLines[i]) diff.push(`- ${oldLines[i]}`);
        if (newLines[i]) diff.push(`+ ${newLines[i]}`);
      }
    }
    
    return diff.join('\n');
  }
}

export const versioningSystem: IVersioningSystem = new VersioningSystemImpl();
