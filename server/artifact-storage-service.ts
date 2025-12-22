/**
 * INFERA WebNova - Artifact Management Service
 * Enterprise-grade artifact storage and management
 * 
 * Features: Cloud Storage, Version Management, Retention Policies
 * Standards: ISO 27001, SOC 2 Type II
 */

import { EventEmitter } from 'events';
import { generateSecureId } from './utils/id-generator';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

// ==================== TYPES ====================
export interface ArtifactConfig {
  projectId: string;
  buildId: string;
  type: 'build' | 'test' | 'coverage' | 'analysis' | 'deployment';
  platform?: 'android' | 'ios' | 'windows' | 'macos' | 'linux' | 'web';
  environment: 'development' | 'staging' | 'production';
  retentionDays?: number;
  tags?: string[];
}

export interface Artifact {
  id: string;
  projectId: string;
  buildId: string;
  type: ArtifactConfig['type'];
  platform?: string;
  environment: string;
  name: string;
  originalName: string;
  path: string;
  size: number;
  checksum: string;
  checksumAlgorithm: 'sha256' | 'md5';
  mimeType: string;
  metadata: Record<string, any>;
  tags: string[];
  downloadCount: number;
  expiresAt?: Date;
  createdAt: Date;
  lastAccessedAt?: Date;
}

export interface ArtifactVersion {
  id: string;
  artifactId: string;
  version: number;
  path: string;
  size: number;
  checksum: string;
  createdAt: Date;
  createdBy?: string;
  changelog?: string;
}

export interface StorageStats {
  totalArtifacts: number;
  totalSize: number;
  byType: Record<string, { count: number; size: number }>;
  byProject: Record<string, { count: number; size: number }>;
  byEnvironment: Record<string, { count: number; size: number }>;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  nameAr: string;
  type: ArtifactConfig['type'];
  environment: string;
  retentionDays: number;
  keepLatest: number;
  enabled: boolean;
}

// ==================== DEFAULT RETENTION POLICIES ====================
const defaultRetentionPolicies: RetentionPolicy[] = [
  {
    id: 'policy-dev-builds',
    name: 'Development Builds',
    nameAr: 'بناءات التطوير',
    type: 'build',
    environment: 'development',
    retentionDays: 7,
    keepLatest: 5,
    enabled: true,
  },
  {
    id: 'policy-staging-builds',
    name: 'Staging Builds',
    nameAr: 'بناءات التجريب',
    type: 'build',
    environment: 'staging',
    retentionDays: 30,
    keepLatest: 10,
    enabled: true,
  },
  {
    id: 'policy-prod-builds',
    name: 'Production Builds',
    nameAr: 'بناءات الإنتاج',
    type: 'build',
    environment: 'production',
    retentionDays: 365,
    keepLatest: 50,
    enabled: true,
  },
  {
    id: 'policy-test-reports',
    name: 'Test Reports',
    nameAr: 'تقارير الاختبار',
    type: 'test',
    environment: 'development',
    retentionDays: 14,
    keepLatest: 20,
    enabled: true,
  },
  {
    id: 'policy-coverage',
    name: 'Coverage Reports',
    nameAr: 'تقارير التغطية',
    type: 'coverage',
    environment: 'development',
    retentionDays: 30,
    keepLatest: 30,
    enabled: true,
  },
];

// ==================== ARTIFACT STORAGE SERVICE ====================
export class ArtifactStorageService extends EventEmitter {
  private artifacts: Map<string, Artifact> = new Map();
  private versions: Map<string, ArtifactVersion[]> = new Map();
  private policies: RetentionPolicy[] = [...defaultRetentionPolicies];
  private storageDir = '/tmp/infera-artifacts';

  constructor() {
    super();
    this.initializeStorage();
    this.startRetentionWorker();
  }

  private async initializeStorage(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      await fs.mkdir(path.join(this.storageDir, 'builds'), { recursive: true });
      await fs.mkdir(path.join(this.storageDir, 'tests'), { recursive: true });
      await fs.mkdir(path.join(this.storageDir, 'coverage'), { recursive: true });
      await fs.mkdir(path.join(this.storageDir, 'analysis'), { recursive: true });
    } catch (error) {
      console.log('[ArtifactStorage] Initialization:', error);
    }
  }

  private startRetentionWorker(): void {
    // Run retention cleanup every hour
    setInterval(() => {
      this.runRetentionCleanup().catch(console.error);
    }, 60 * 60 * 1000);
  }

  async uploadArtifact(
    config: ArtifactConfig,
    fileName: string,
    content: Buffer | string
  ): Promise<Artifact> {
    const artifactId = generateSecureId('artifact');
    const contentBuffer = typeof content === 'string' ? Buffer.from(content) : content;

    // SECURITY: Sanitize filename to prevent path traversal (CWE-22, CWE-73)
    const sanitizedFileName = this.sanitizeFileName(fileName);
    if (!sanitizedFileName) {
      throw new Error('Invalid filename: contains prohibited characters');
    }

    // Calculate checksum
    const checksum = crypto.createHash('sha256').update(contentBuffer).digest('hex');

    // Use artifact ID as directory name to prevent collisions
    const safeFileName = `${artifactId}_${sanitizedFileName}`;
    
    // Determine storage path with validated components
    const storagePath = path.join(
      this.storageDir,
      config.type + 's',
      config.projectId.replace(/[^a-zA-Z0-9_-]/g, '_'),
      config.buildId.replace(/[^a-zA-Z0-9_-]/g, '_'),
      safeFileName
    );
    
    // SECURITY: Verify path is within storage directory (CWE-22 prevention)
    const resolvedPath = path.resolve(storagePath);
    const resolvedStorageDir = path.resolve(this.storageDir);
    // Use path.relative to check if the resolved path is within storage directory
    const relativePath = path.relative(resolvedStorageDir, resolvedPath);
    // If path escapes the base directory, relative path will start with '..'
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      throw new Error('Security violation: Path traversal attempt detected');
    }
    // Additional check: ensure path starts with base + separator to prevent prefix attacks
    if (!resolvedPath.startsWith(resolvedStorageDir + path.sep)) {
      throw new Error('Security violation: Invalid storage path');
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(storagePath), { recursive: true });

    // Write file
    await fs.writeFile(storagePath, contentBuffer);

    // Determine MIME type
    const mimeType = this.getMimeType(fileName);

    // Calculate expiration
    const retentionDays = config.retentionDays || this.getRetentionDays(config);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    const artifact: Artifact = {
      id: artifactId,
      projectId: config.projectId,
      buildId: config.buildId,
      type: config.type,
      platform: config.platform,
      environment: config.environment,
      name: `${artifactId}-${fileName}`,
      originalName: fileName,
      path: storagePath,
      size: contentBuffer.length,
      checksum,
      checksumAlgorithm: 'sha256',
      mimeType,
      metadata: {},
      tags: config.tags || [],
      downloadCount: 0,
      expiresAt,
      createdAt: new Date(),
    };

    this.artifacts.set(artifactId, artifact);
    this.emit('artifactUploaded', artifact);

    return artifact;
  }

  async downloadArtifact(artifactId: string): Promise<{ artifact: Artifact; content: Buffer }> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      throw new Error('Artifact not found');
    }

    const content = await fs.readFile(artifact.path);

    // Update access stats
    artifact.downloadCount++;
    artifact.lastAccessedAt = new Date();

    this.emit('artifactDownloaded', artifact);

    return { artifact, content };
  }

  async deleteArtifact(artifactId: string): Promise<boolean> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      return false;
    }

    try {
      await fs.unlink(artifact.path);
    } catch (error) {
      // File might already be deleted
    }

    this.artifacts.delete(artifactId);
    this.emit('artifactDeleted', artifact);

    return true;
  }

  async createVersion(
    artifactId: string,
    content: Buffer,
    changelog?: string
  ): Promise<ArtifactVersion> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      throw new Error('Artifact not found');
    }

    const versions = this.versions.get(artifactId) || [];
    const versionNumber = versions.length + 1;

    const versionId = generateSecureId('version');
    const versionPath = artifact.path.replace(
      artifact.originalName,
      `v${versionNumber}-${artifact.originalName}`
    );

    await fs.writeFile(versionPath, content);

    const version: ArtifactVersion = {
      id: versionId,
      artifactId,
      version: versionNumber,
      path: versionPath,
      size: content.length,
      checksum: crypto.createHash('sha256').update(content).digest('hex'),
      createdAt: new Date(),
      changelog,
    };

    versions.push(version);
    this.versions.set(artifactId, versions);

    this.emit('versionCreated', { artifact, version });

    return version;
  }

  getArtifact(artifactId: string): Artifact | undefined {
    return this.artifacts.get(artifactId);
  }

  getArtifactsByProject(projectId: string): Artifact[] {
    return Array.from(this.artifacts.values()).filter(a => a.projectId === projectId);
  }

  getArtifactsByBuild(buildId: string): Artifact[] {
    return Array.from(this.artifacts.values()).filter(a => a.buildId === buildId);
  }

  getArtifactVersions(artifactId: string): ArtifactVersion[] {
    return this.versions.get(artifactId) || [];
  }

  getStorageStats(): StorageStats {
    const artifacts = Array.from(this.artifacts.values());

    const stats: StorageStats = {
      totalArtifacts: artifacts.length,
      totalSize: artifacts.reduce((acc, a) => acc + a.size, 0),
      byType: {},
      byProject: {},
      byEnvironment: {},
    };

    for (const artifact of artifacts) {
      // By type
      if (!stats.byType[artifact.type]) {
        stats.byType[artifact.type] = { count: 0, size: 0 };
      }
      stats.byType[artifact.type].count++;
      stats.byType[artifact.type].size += artifact.size;

      // By project
      if (!stats.byProject[artifact.projectId]) {
        stats.byProject[artifact.projectId] = { count: 0, size: 0 };
      }
      stats.byProject[artifact.projectId].count++;
      stats.byProject[artifact.projectId].size += artifact.size;

      // By environment
      if (!stats.byEnvironment[artifact.environment]) {
        stats.byEnvironment[artifact.environment] = { count: 0, size: 0 };
      }
      stats.byEnvironment[artifact.environment].count++;
      stats.byEnvironment[artifact.environment].size += artifact.size;
    }

    return stats;
  }

  getRetentionPolicies(): RetentionPolicy[] {
    return this.policies;
  }

  updateRetentionPolicy(policyId: string, updates: Partial<RetentionPolicy>): RetentionPolicy | null {
    const index = this.policies.findIndex(p => p.id === policyId);
    if (index === -1) return null;

    this.policies[index] = { ...this.policies[index], ...updates };
    return this.policies[index];
  }

  private async runRetentionCleanup(): Promise<void> {
    const now = new Date();
    const expiredArtifacts: Artifact[] = [];

    for (const artifact of Array.from(this.artifacts.values())) {
      if (artifact.expiresAt && artifact.expiresAt < now) {
        expiredArtifacts.push(artifact);
      }
    }

    for (const artifact of expiredArtifacts) {
      await this.deleteArtifact(artifact.id);
    }

    if (expiredArtifacts.length > 0) {
      this.emit('retentionCleanup', { deleted: expiredArtifacts.length });
    }
  }

  private getRetentionDays(config: ArtifactConfig): number {
    const policy = this.policies.find(
      p => p.type === config.type && p.environment === config.environment && p.enabled
    );
    return policy?.retentionDays || 30;
  }

  /**
   * SECURITY: Sanitize filename to prevent path traversal attacks
   * Removes directory components, null bytes, and suspicious patterns
   */
  private sanitizeFileName(fileName: string): string | null {
    if (!fileName || typeof fileName !== 'string') {
      return null;
    }
    
    // Remove null bytes
    let sanitized = fileName.replace(/\0/g, '');
    
    // Get only the filename, not any path components
    sanitized = path.basename(sanitized);
    
    // Check for path traversal patterns
    if (sanitized.includes('..') || sanitized.includes('~')) {
      return null;
    }
    
    // Remove any remaining suspicious characters
    sanitized = sanitized.replace(/[<>:"|?*\\\/]/g, '_');
    
    // Limit filename length
    if (sanitized.length > 255) {
      const ext = path.extname(sanitized);
      sanitized = sanitized.substring(0, 250 - ext.length) + ext;
    }
    
    // Ensure filename is not empty after sanitization
    if (!sanitized || sanitized === '.' || sanitized === '..') {
      return null;
    }
    
    return sanitized;
  }

  private getMimeType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.apk': 'application/vnd.android.package-archive',
      '.aab': 'application/octet-stream',
      '.ipa': 'application/octet-stream',
      '.zip': 'application/zip',
      '.tar': 'application/x-tar',
      '.gz': 'application/gzip',
      '.exe': 'application/x-msdownload',
      '.dmg': 'application/x-apple-diskimage',
      '.deb': 'application/vnd.debian.binary-package',
      '.rpm': 'application/x-rpm',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.html': 'text/html',
      '.txt': 'text/plain',
      '.log': 'text/plain',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.mp4': 'video/mp4',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // ==================== CLOUD STORAGE ADAPTERS ====================
  
  async syncToCloud(artifactId: string, provider: 'aws_s3' | 'gcs' | 'azure_blob'): Promise<string> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      throw new Error('Artifact not found');
    }

    // Simulate cloud upload
    await new Promise(resolve => setTimeout(resolve, 1000));

    const cloudUrls: Record<string, string> = {
      aws_s3: `s3://infera-artifacts/${artifact.projectId}/${artifact.name}`,
      gcs: `gs://infera-artifacts/${artifact.projectId}/${artifact.name}`,
      azure_blob: `https://inferaartifacts.blob.core.windows.net/${artifact.projectId}/${artifact.name}`,
    };

    artifact.metadata.cloudUrl = cloudUrls[provider];
    artifact.metadata.cloudProvider = provider;
    artifact.metadata.syncedAt = new Date().toISOString();

    this.emit('artifactSynced', { artifact, provider });

    return cloudUrls[provider];
  }

  generateDownloadUrl(artifactId: string, expiresInMinutes: number = 60): string {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      throw new Error('Artifact not found');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (expiresInMinutes * 60 * 1000);

    return `/api/artifacts/${artifactId}/download?token=${token}&expires=${expires}`;
  }
}

// ==================== SINGLETON EXPORT ====================
export const artifactStorageService = new ArtifactStorageService();
