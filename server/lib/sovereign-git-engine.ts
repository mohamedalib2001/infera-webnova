/**
 * Sovereign Git Engine | محرك Git السيادي
 * 
 * Internal Git Engine with full Git operations:
 * - Commits, Branches, Tags, Pull Requests
 * - Repository Identity Layer
 * - External provider linking (GitHub, Replit, GitLab)
 * - Complete offline capability
 */

import { randomBytes, createHash } from 'crypto';
import { db } from '../db';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import {
  internalRepositories, insertInternalRepositorySchema,
  internalBranches, insertInternalBranchSchema,
  internalCommits, insertInternalCommitSchema,
  internalTags, insertInternalTagSchema,
  internalPullRequests, insertInternalPullRequestSchema,
  prComments, insertPrCommentSchema,
  repositoryFiles, insertRepositoryFileSchema,
  sovereignSyncLog, insertSovereignSyncLogSchema,
  type InternalRepository, type InternalBranch, type InternalCommit,
  type InternalTag, type InternalPullRequest, type PrComment,
  type RepositoryFile, type SovereignSyncLog
} from '@shared/schema';

// Types
export type SyncProvider = 'github' | 'replit' | 'gitlab' | 'bitbucket';
export type SyncDirection = 'push' | 'pull' | 'bidirectional';
export type PRState = 'open' | 'closed' | 'merged' | 'draft';

export interface CreateRepoInput {
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  visibility?: 'private' | 'internal' | 'public';
  language?: string;
  topics?: string[];
}

export interface CreateBranchInput {
  repositoryId: string;
  name: string;
  fromBranch?: string;
  createdBy: string;
}

export interface CreateCommitInput {
  repositoryId: string;
  branchName: string;
  message: string;
  description?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  files?: { path: string; content: string; action: 'add' | 'modify' | 'delete' }[];
}

export interface CreateTagInput {
  repositoryId: string;
  name: string;
  message?: string;
  targetSha: string;
  taggerId: string;
  taggerName: string;
  taggerEmail: string;
  isRelease?: boolean;
  releaseNotes?: string;
  prerelease?: boolean;
}

export interface CreatePRInput {
  repositoryId: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  sourceBranch: string;
  targetBranch: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  isDraft?: boolean;
  labels?: string[];
  reviewers?: string[];
}

export interface LinkProviderInput {
  repositoryId: string;
  provider: SyncProvider;
  url: string;
  externalId?: string;
  syncEnabled?: boolean;
  syncDirection?: SyncDirection;
}

// Helper functions
function generateSha(): string {
  return createHash('sha256').update(randomBytes(32)).digest('hex');
}

function generateShortSha(sha: string): string {
  return sha.substring(0, 7);
}

function generateInternalId(name: string): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString('hex');
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
  return `${slug}-${timestamp}-${random}`;
}

class SovereignGitEngine {
  constructor() {
    console.log("[SovereignGit] Engine initialized | تم تهيئة محرك Git السيادي");
  }

  // ============ Repository Operations ============

  async createRepository(tenantId: string, ownerId: string, ownerEmail: string, input: CreateRepoInput): Promise<InternalRepository> {
    const internalId = generateInternalId(input.name);
    
    const [repo] = await db.insert(internalRepositories).values({
      tenantId,
      internalId,
      name: input.name,
      nameAr: input.nameAr,
      description: input.description,
      descriptionAr: input.descriptionAr,
      visibility: input.visibility || 'private',
      defaultBranch: 'main',
      ownerId,
      ownerEmail,
      language: input.language,
      topics: input.topics || [],
      stats: { files: 0, commits: 0, branches: 1, size: 0 }
    }).returning();

    // Create default main branch
    await this.createBranch({
      repositoryId: repo.id,
      name: 'main',
      createdBy: ownerId
    }, true);

    return repo;
  }

  async getRepository(id: string): Promise<InternalRepository | undefined> {
    const [repo] = await db.select().from(internalRepositories).where(eq(internalRepositories.id, id));
    return repo;
  }

  async getRepositoryByInternalId(internalId: string): Promise<InternalRepository | undefined> {
    const [repo] = await db.select().from(internalRepositories).where(eq(internalRepositories.internalId, internalId));
    return repo;
  }

  async listRepositories(tenantId: string, ownerId?: string): Promise<InternalRepository[]> {
    if (ownerId) {
      return db.select().from(internalRepositories)
        .where(and(eq(internalRepositories.tenantId, tenantId), eq(internalRepositories.ownerId, ownerId)))
        .orderBy(desc(internalRepositories.updatedAt));
    }
    return db.select().from(internalRepositories)
      .where(eq(internalRepositories.tenantId, tenantId))
      .orderBy(desc(internalRepositories.updatedAt));
  }

  async updateRepository(id: string, updates: Partial<CreateRepoInput>): Promise<InternalRepository | undefined> {
    const [repo] = await db.update(internalRepositories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(internalRepositories.id, id))
      .returning();
    return repo;
  }

  async deleteRepository(id: string): Promise<boolean> {
    const result = await db.delete(internalRepositories).where(eq(internalRepositories.id, id));
    return true;
  }

  async archiveRepository(id: string): Promise<InternalRepository | undefined> {
    const [repo] = await db.update(internalRepositories)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(eq(internalRepositories.id, id))
      .returning();
    return repo;
  }

  // ============ Branch Operations ============

  async createBranch(input: CreateBranchInput, isDefault = false): Promise<InternalBranch> {
    let headCommitId: string | undefined;
    
    if (input.fromBranch) {
      const [sourceBranch] = await db.select().from(internalBranches)
        .where(and(
          eq(internalBranches.repositoryId, input.repositoryId),
          eq(internalBranches.name, input.fromBranch)
        ));
      if (sourceBranch) {
        headCommitId = sourceBranch.headCommitId || undefined;
      }
    }

    const [branch] = await db.insert(internalBranches).values({
      repositoryId: input.repositoryId,
      name: input.name,
      isDefault,
      headCommitId,
      createdBy: input.createdBy
    }).returning();

    // Update repo stats
    await this.updateRepoStats(input.repositoryId);

    return branch;
  }

  async getBranch(repositoryId: string, name: string): Promise<InternalBranch | undefined> {
    const [branch] = await db.select().from(internalBranches)
      .where(and(eq(internalBranches.repositoryId, repositoryId), eq(internalBranches.name, name)));
    return branch;
  }

  async listBranches(repositoryId: string): Promise<InternalBranch[]> {
    return db.select().from(internalBranches)
      .where(eq(internalBranches.repositoryId, repositoryId))
      .orderBy(desc(internalBranches.isDefault), asc(internalBranches.name));
  }

  async deleteBranch(repositoryId: string, name: string): Promise<boolean> {
    const [branch] = await db.select().from(internalBranches)
      .where(and(eq(internalBranches.repositoryId, repositoryId), eq(internalBranches.name, name)));
    
    if (!branch || branch.isDefault || branch.isProtected) {
      return false;
    }

    await db.delete(internalBranches).where(eq(internalBranches.id, branch.id));
    await this.updateRepoStats(repositoryId);
    return true;
  }

  async protectBranch(repositoryId: string, name: string, protect: boolean): Promise<InternalBranch | undefined> {
    const [branch] = await db.update(internalBranches)
      .set({ isProtected: protect, updatedAt: new Date() })
      .where(and(eq(internalBranches.repositoryId, repositoryId), eq(internalBranches.name, name)))
      .returning();
    return branch;
  }

  // ============ Commit Operations ============

  async createCommit(input: CreateCommitInput): Promise<InternalCommit> {
    const sha = generateSha();
    const shortSha = generateShortSha(sha);

    // Get branch
    const [branch] = await db.select().from(internalBranches)
      .where(and(
        eq(internalBranches.repositoryId, input.repositoryId),
        eq(internalBranches.name, input.branchName)
      ));

    if (!branch) {
      throw new Error(`Branch ${input.branchName} not found`);
    }

    const parentSha = branch.headCommitId || undefined;
    const diff = input.files?.map(f => ({
      file: f.path,
      additions: f.action !== 'delete' ? f.content?.split('\n').length || 0 : 0,
      deletions: f.action === 'delete' ? 1 : 0
    })) || [];

    const additions = diff.reduce((sum, d) => sum + d.additions, 0);
    const deletions = diff.reduce((sum, d) => sum + d.deletions, 0);

    const [commit] = await db.insert(internalCommits).values({
      repositoryId: input.repositoryId,
      branchId: branch.id,
      sha,
      shortSha,
      message: input.message,
      description: input.description,
      authorId: input.authorId,
      authorName: input.authorName,
      authorEmail: input.authorEmail,
      committerId: input.authorId,
      committerName: input.authorName,
      committerEmail: input.authorEmail,
      parentSha,
      filesChanged: input.files?.length || 0,
      additions,
      deletions,
      diff: diff as any
    }).returning();

    // Update branch head
    await db.update(internalBranches)
      .set({ headCommitId: sha, updatedAt: new Date() })
      .where(eq(internalBranches.id, branch.id));

    // Process file changes
    if (input.files) {
      for (const file of input.files) {
        if (file.action === 'delete') {
          await db.delete(repositoryFiles)
            .where(and(
              eq(repositoryFiles.repositoryId, input.repositoryId),
              eq(repositoryFiles.branchId, branch.id),
              eq(repositoryFiles.path, file.path)
            ));
        } else {
          const blobHash = createHash('sha256').update(file.content || '').digest('hex');
          const fileName = file.path.split('/').pop() || file.path;
          
          // Upsert file
          await db.insert(repositoryFiles).values({
            repositoryId: input.repositoryId,
            branchId: branch.id,
            path: file.path,
            name: fileName,
            type: 'file',
            content: file.content,
            blobHash,
            size: Buffer.byteLength(file.content || '', 'utf8'),
            lastCommitId: commit.id
          }).onConflictDoUpdate({
            target: [repositoryFiles.repositoryId, repositoryFiles.branchId, repositoryFiles.path],
            set: {
              content: file.content,
              blobHash,
              size: Buffer.byteLength(file.content || '', 'utf8'),
              lastCommitId: commit.id,
              updatedAt: new Date()
            }
          });
        }
      }
    }

    await this.updateRepoStats(input.repositoryId);
    return commit;
  }

  async getCommit(repositoryId: string, sha: string): Promise<InternalCommit | undefined> {
    const [commit] = await db.select().from(internalCommits)
      .where(and(eq(internalCommits.repositoryId, repositoryId), eq(internalCommits.sha, sha)));
    return commit;
  }

  async listCommits(repositoryId: string, branchName?: string, limit = 50): Promise<InternalCommit[]> {
    if (branchName) {
      const [branch] = await db.select().from(internalBranches)
        .where(and(eq(internalBranches.repositoryId, repositoryId), eq(internalBranches.name, branchName)));
      if (!branch) return [];
      
      return db.select().from(internalCommits)
        .where(eq(internalCommits.branchId, branch.id))
        .orderBy(desc(internalCommits.committedAt))
        .limit(limit);
    }

    return db.select().from(internalCommits)
      .where(eq(internalCommits.repositoryId, repositoryId))
      .orderBy(desc(internalCommits.committedAt))
      .limit(limit);
  }

  // ============ Tag Operations ============

  async createTag(input: CreateTagInput): Promise<InternalTag> {
    const [tag] = await db.insert(internalTags).values({
      repositoryId: input.repositoryId,
      name: input.name,
      message: input.message,
      targetSha: input.targetSha,
      targetType: 'commit',
      taggerId: input.taggerId,
      taggerName: input.taggerName,
      taggerEmail: input.taggerEmail,
      isRelease: input.isRelease || false,
      releaseNotes: input.releaseNotes,
      prerelease: input.prerelease || false
    }).returning();

    return tag;
  }

  async listTags(repositoryId: string): Promise<InternalTag[]> {
    return db.select().from(internalTags)
      .where(eq(internalTags.repositoryId, repositoryId))
      .orderBy(desc(internalTags.createdAt));
  }

  async deleteTag(repositoryId: string, name: string): Promise<boolean> {
    await db.delete(internalTags)
      .where(and(eq(internalTags.repositoryId, repositoryId), eq(internalTags.name, name)));
    return true;
  }

  // ============ Pull Request Operations ============

  async createPullRequest(input: CreatePRInput): Promise<InternalPullRequest> {
    // Get next PR number
    const [lastPR] = await db.select().from(internalPullRequests)
      .where(eq(internalPullRequests.repositoryId, input.repositoryId))
      .orderBy(desc(internalPullRequests.number))
      .limit(1);

    const number = (lastPR?.number || 0) + 1;

    // Get branch IDs
    const [sourceBranch] = await db.select().from(internalBranches)
      .where(and(eq(internalBranches.repositoryId, input.repositoryId), eq(internalBranches.name, input.sourceBranch)));
    const [targetBranch] = await db.select().from(internalBranches)
      .where(and(eq(internalBranches.repositoryId, input.repositoryId), eq(internalBranches.name, input.targetBranch)));

    const [pr] = await db.insert(internalPullRequests).values({
      repositoryId: input.repositoryId,
      number,
      title: input.title,
      titleAr: input.titleAr,
      description: input.description,
      descriptionAr: input.descriptionAr,
      state: input.isDraft ? 'draft' : 'open',
      sourceBranchId: sourceBranch?.id,
      sourceBranch: input.sourceBranch,
      targetBranchId: targetBranch?.id,
      targetBranch: input.targetBranch,
      authorId: input.authorId,
      authorName: input.authorName,
      authorEmail: input.authorEmail,
      isDraft: input.isDraft || false,
      labels: input.labels || [],
      reviewers: input.reviewers?.map(r => ({ userId: r, name: r, status: 'pending' })) || []
    }).returning();

    return pr;
  }

  async getPullRequest(repositoryId: string, number: number): Promise<InternalPullRequest | undefined> {
    const [pr] = await db.select().from(internalPullRequests)
      .where(and(eq(internalPullRequests.repositoryId, repositoryId), eq(internalPullRequests.number, number)));
    return pr;
  }

  async listPullRequests(repositoryId: string, state?: PRState): Promise<InternalPullRequest[]> {
    if (state) {
      return db.select().from(internalPullRequests)
        .where(and(eq(internalPullRequests.repositoryId, repositoryId), eq(internalPullRequests.state, state)))
        .orderBy(desc(internalPullRequests.updatedAt));
    }
    return db.select().from(internalPullRequests)
      .where(eq(internalPullRequests.repositoryId, repositoryId))
      .orderBy(desc(internalPullRequests.updatedAt));
  }

  async updatePullRequest(repositoryId: string, number: number, updates: Partial<{
    title: string;
    description: string;
    state: PRState;
    isDraft: boolean;
    labels: string[];
  }>): Promise<InternalPullRequest | undefined> {
    const [pr] = await db.update(internalPullRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(internalPullRequests.repositoryId, repositoryId), eq(internalPullRequests.number, number)))
      .returning();
    return pr;
  }

  async mergePullRequest(repositoryId: string, number: number, mergedBy: string): Promise<InternalPullRequest | undefined> {
    const [pr] = await db.update(internalPullRequests)
      .set({
        state: 'merged',
        mergedAt: new Date(),
        mergedBy,
        updatedAt: new Date()
      })
      .where(and(eq(internalPullRequests.repositoryId, repositoryId), eq(internalPullRequests.number, number)))
      .returning();

    return pr;
  }

  async closePullRequest(repositoryId: string, number: number, closedBy: string): Promise<InternalPullRequest | undefined> {
    const [pr] = await db.update(internalPullRequests)
      .set({
        state: 'closed',
        closedAt: new Date(),
        closedBy,
        updatedAt: new Date()
      })
      .where(and(eq(internalPullRequests.repositoryId, repositoryId), eq(internalPullRequests.number, number)))
      .returning();

    return pr;
  }

  // ============ PR Comments ============

  async addPRComment(pullRequestId: string, authorId: string, authorName: string, body: string, options?: {
    path?: string;
    line?: number;
    side?: 'LEFT' | 'RIGHT';
  }): Promise<PrComment> {
    const [comment] = await db.insert(prComments).values({
      pullRequestId,
      authorId,
      authorName,
      body,
      path: options?.path,
      line: options?.line,
      side: options?.side
    }).returning();

    // Update comment count
    await db.update(internalPullRequests)
      .set({ comments: sql`${internalPullRequests.comments} + 1` })
      .where(eq(internalPullRequests.id, pullRequestId));

    return comment;
  }

  async listPRComments(pullRequestId: string): Promise<PrComment[]> {
    return db.select().from(prComments)
      .where(eq(prComments.pullRequestId, pullRequestId))
      .orderBy(asc(prComments.createdAt));
  }

  // ============ Provider Linking ============

  async linkProvider(input: LinkProviderInput): Promise<InternalRepository | undefined> {
    const updates: Record<string, any> = {
      syncEnabled: input.syncEnabled ?? false,
      syncDirection: input.syncDirection || 'bidirectional',
      updatedAt: new Date()
    };

    switch (input.provider) {
      case 'github':
        updates.githubUrl = input.url;
        updates.githubRepoId = input.externalId;
        break;
      case 'replit':
        updates.replitUrl = input.url;
        updates.replitReplId = input.externalId;
        break;
      case 'gitlab':
        updates.gitlabUrl = input.url;
        break;
      case 'bitbucket':
        updates.bitbucketUrl = input.url;
        break;
    }

    const [repo] = await db.update(internalRepositories)
      .set(updates)
      .where(eq(internalRepositories.id, input.repositoryId))
      .returning();

    return repo;
  }

  async unlinkProvider(repositoryId: string, provider: SyncProvider): Promise<InternalRepository | undefined> {
    const updates: Record<string, any> = { updatedAt: new Date() };

    switch (provider) {
      case 'github':
        updates.githubUrl = null;
        updates.githubRepoId = null;
        break;
      case 'replit':
        updates.replitUrl = null;
        updates.replitReplId = null;
        break;
      case 'gitlab':
        updates.gitlabUrl = null;
        break;
      case 'bitbucket':
        updates.bitbucketUrl = null;
        break;
    }

    const [repo] = await db.update(internalRepositories)
      .set(updates)
      .where(eq(internalRepositories.id, repositoryId))
      .returning();

    return repo;
  }

  // ============ Sync Operations ============

  async startSync(repositoryId: string, provider: SyncProvider, direction: 'push' | 'pull', triggeredBy: string): Promise<SovereignSyncLog> {
    const [log] = await db.insert(sovereignSyncLog).values({
      repositoryId,
      provider,
      direction,
      status: 'in_progress',
      triggeredBy
    }).returning();

    return log;
  }

  async completeSync(logId: string, stats: { commits?: number; files?: number; branches?: number; tags?: number }, error?: string): Promise<SovereignSyncLog | undefined> {
    const [log] = await db.update(sovereignSyncLog)
      .set({
        status: error ? 'failed' : 'completed',
        commitsSync: stats.commits || 0,
        filesSync: stats.files || 0,
        branchesSync: stats.branches || 0,
        tagsSync: stats.tags || 0,
        errorMessage: error,
        completedAt: new Date()
      })
      .where(eq(sovereignSyncLog.id, logId))
      .returning();

    // Update repo last sync
    if (log) {
      await db.update(internalRepositories)
        .set({
          lastSyncAt: new Date(),
          lastSyncStatus: error ? 'failed' : 'success',
          updatedAt: new Date()
        })
        .where(eq(internalRepositories.id, log.repositoryId));
    }

    return log;
  }

  async getSyncHistory(repositoryId: string, limit = 20): Promise<SovereignSyncLog[]> {
    return db.select().from(sovereignSyncLog)
      .where(eq(sovereignSyncLog.repositoryId, repositoryId))
      .orderBy(desc(sovereignSyncLog.startedAt))
      .limit(limit);
  }

  // ============ File Operations ============

  async getFile(repositoryId: string, branchName: string, path: string): Promise<RepositoryFile | undefined> {
    const [branch] = await db.select().from(internalBranches)
      .where(and(eq(internalBranches.repositoryId, repositoryId), eq(internalBranches.name, branchName)));
    
    if (!branch) return undefined;

    const [file] = await db.select().from(repositoryFiles)
      .where(and(
        eq(repositoryFiles.repositoryId, repositoryId),
        eq(repositoryFiles.branchId, branch.id),
        eq(repositoryFiles.path, path)
      ));

    return file;
  }

  async listFiles(repositoryId: string, branchName: string, directory?: string): Promise<RepositoryFile[]> {
    const [branch] = await db.select().from(internalBranches)
      .where(and(eq(internalBranches.repositoryId, repositoryId), eq(internalBranches.name, branchName)));
    
    if (!branch) return [];

    const files = await db.select().from(repositoryFiles)
      .where(eq(repositoryFiles.branchId, branch.id))
      .orderBy(asc(repositoryFiles.type), asc(repositoryFiles.path));

    if (directory) {
      return files.filter(f => f.path.startsWith(directory + '/') || f.path === directory);
    }

    return files;
  }

  // ============ Statistics ============

  private async updateRepoStats(repositoryId: string): Promise<void> {
    const [branchCount] = await db.select({ count: sql<number>`count(*)` })
      .from(internalBranches)
      .where(eq(internalBranches.repositoryId, repositoryId));

    const [commitCount] = await db.select({ count: sql<number>`count(*)` })
      .from(internalCommits)
      .where(eq(internalCommits.repositoryId, repositoryId));

    const [fileCount] = await db.select({ count: sql<number>`count(*)`, size: sql<number>`coalesce(sum(size), 0)` })
      .from(repositoryFiles)
      .where(eq(repositoryFiles.repositoryId, repositoryId));

    await db.update(internalRepositories)
      .set({
        stats: {
          files: Number(fileCount.count) || 0,
          commits: Number(commitCount.count) || 0,
          branches: Number(branchCount.count) || 0,
          size: Number(fileCount.size) || 0
        },
        updatedAt: new Date()
      })
      .where(eq(internalRepositories.id, repositoryId));
  }

  async getStats(tenantId: string): Promise<{
    totalRepos: number;
    totalBranches: number;
    totalCommits: number;
    totalPRs: number;
    openPRs: number;
    linkedGitHub: number;
    linkedReplit: number;
  }> {
    const repos = await db.select().from(internalRepositories)
      .where(eq(internalRepositories.tenantId, tenantId));

    const repoIds = repos.map(r => r.id);
    
    if (repoIds.length === 0) {
      return {
        totalRepos: 0,
        totalBranches: 0,
        totalCommits: 0,
        totalPRs: 0,
        openPRs: 0,
        linkedGitHub: 0,
        linkedReplit: 0
      };
    }

    const [branchCount] = await db.select({ count: sql<number>`count(*)` })
      .from(internalBranches);

    const [commitCount] = await db.select({ count: sql<number>`count(*)` })
      .from(internalCommits);

    const [prCount] = await db.select({ count: sql<number>`count(*)` })
      .from(internalPullRequests);

    const [openPRCount] = await db.select({ count: sql<number>`count(*)` })
      .from(internalPullRequests)
      .where(eq(internalPullRequests.state, 'open'));

    return {
      totalRepos: repos.length,
      totalBranches: Number(branchCount.count) || 0,
      totalCommits: Number(commitCount.count) || 0,
      totalPRs: Number(prCount.count) || 0,
      openPRs: Number(openPRCount.count) || 0,
      linkedGitHub: repos.filter(r => r.githubUrl).length,
      linkedReplit: repos.filter(r => r.replitUrl).length
    };
  }
}

export const sovereignGitEngine = new SovereignGitEngine();
