/**
 * Replit Import Service | خدمة استيراد مشاريع Replit
 * 
 * Service for:
 * 1. Connecting to Replit account (OAuth/Token)
 * 2. Browsing user's Repls
 * 3. Importing Repl files to internal sovereign repository
 */

import { db } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { internalRepositories, internalBranches, internalCommits, repositoryFiles, replitConnections, type ReplitConnection as DBReplitConnection } from '@shared/schema';
import { sovereignGitEngine } from '../lib/sovereign-git-engine';
import { randomBytes, createHash } from 'crypto';

// Types (for API responses - hides sensitive token)
export interface ReplitConnection {
  id: string;
  userId: string;
  replitUserId: string;
  replitUsername: string;
  accessToken: string; // Will be masked in responses
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
  connectedAt: Date;
}

export interface ReplInfo {
  id: string;
  slug: string;
  title: string;
  description?: string;
  language: string;
  isPrivate: boolean;
  url: string;
  iconUrl?: string;
  createdAt: string;
  updatedAt: string;
  files?: ReplFile[];
}

export interface ReplFile {
  path: string;
  content?: string;
  type: 'file' | 'directory';
  size?: number;
}

export interface ImportResult {
  success: boolean;
  repositoryId?: string;
  internalId?: string;
  filesImported: number;
  errors: string[];
  message: string;
  messageAr: string;
}

// Database-backed connection storage
class ReplitImportService {
  private baseUrl = 'https://replit.com';
  private apiUrl = 'https://replit.com/graphql';

  constructor() {
    console.log("[ReplitImport] Service initialized | تم تهيئة خدمة استيراد Replit");
  }

  // ============ Connection Management (Database-backed) ============

  /**
   * Initialize connection with Replit using access token
   * يمكن الحصول على Token من إعدادات حساب Replit
   */
  async connectWithToken(userId: string, accessToken: string, tenantId: string = 'default'): Promise<{
    success: boolean;
    connection?: ReplitConnection;
    error?: string;
  }> {
    try {
      // Verify token by fetching user info
      const userInfo = await this.fetchReplitUser(accessToken);
      
      if (!userInfo) {
        return {
          success: false,
          error: "Invalid access token or unable to fetch user info"
        };
      }

      // Check if connection exists, update or insert
      const [existing] = await db.select().from(replitConnections).where(eq(replitConnections.userId, userId));
      
      let dbConnection: DBReplitConnection;
      if (existing) {
        // Update existing connection
        const [updated] = await db.update(replitConnections)
          .set({
            replitUserId: userInfo.id,
            replitUsername: userInfo.username,
            accessToken,
            isActive: true,
            lastUsedAt: new Date()
          })
          .where(eq(replitConnections.userId, userId))
          .returning();
        dbConnection = updated;
      } else {
        // Insert new connection
        const [inserted] = await db.insert(replitConnections).values({
          userId,
          tenantId,
          replitUserId: userInfo.id,
          replitUsername: userInfo.username,
          accessToken,
          isActive: true
        }).returning();
        dbConnection = inserted;
      }

      const connection: ReplitConnection = {
        id: dbConnection.id,
        userId: dbConnection.userId,
        replitUserId: dbConnection.replitUserId,
        replitUsername: dbConnection.replitUsername,
        accessToken: '***hidden***',
        isActive: dbConnection.isActive,
        connectedAt: dbConnection.connectedAt!
      };

      return {
        success: true,
        connection: {
          ...connection,
          accessToken: '***hidden***' // Don't expose token
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get OAuth URL for Replit authorization
   * رابط المصادقة عبر OAuth
   */
  getOAuthUrl(redirectUri: string, state: string): string {
    const clientId = process.env.REPLIT_CLIENT_ID;
    if (!clientId) {
      throw new Error("REPLIT_CLIENT_ID not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: 'read:user read:repl write:repl'
    });

    return `${this.baseUrl}/auth/oauth?${params.toString()}`;
  }

  /**
   * Exchange OAuth code for access token
   * تبادل كود OAuth بالـ Token
   */
  async exchangeOAuthCode(code: string, redirectUri: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  } | null> {
    const clientId = process.env.REPLIT_CLIENT_ID;
    const clientSecret = process.env.REPLIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Replit OAuth credentials not configured");
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in
      };
    } catch (error) {
      console.error("[ReplitImport] OAuth exchange failed:", error);
      return null;
    }
  }

  /**
   * Get current connection for user (from database)
   */
  async getConnection(userId: string): Promise<ReplitConnection | undefined> {
    const [conn] = await db.select().from(replitConnections).where(eq(replitConnections.userId, userId));
    if (!conn) return undefined;
    
    return {
      id: conn.id,
      userId: conn.userId,
      replitUserId: conn.replitUserId,
      replitUsername: conn.replitUsername,
      accessToken: '***hidden***',
      isActive: conn.isActive,
      connectedAt: conn.connectedAt!
    };
  }

  /**
   * Get connection with token (for internal use)
   */
  private async getConnectionWithToken(userId: string): Promise<DBReplitConnection | undefined> {
    const [conn] = await db.select().from(replitConnections).where(eq(replitConnections.userId, userId));
    return conn;
  }

  /**
   * Disconnect from Replit
   */
  async disconnect(userId: string): Promise<boolean> {
    await db.update(replitConnections)
      .set({ isActive: false })
      .where(eq(replitConnections.userId, userId));
    return true;
  }

  /**
   * Check if user is connected
   */
  async isConnected(userId: string): Promise<boolean> {
    const conn = await this.getConnectionWithToken(userId);
    return !!conn && conn.isActive;
  }

  // ============ Replit API Operations ============

  /**
   * Fetch Replit user info using GraphQL API
   */
  private async fetchReplitUser(accessToken: string): Promise<{
    id: string;
    username: string;
    email?: string;
    bio?: string;
    profileImage?: string;
  } | null> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          query: `
            query CurrentUser {
              currentUser {
                id
                username
                email
                bio
                image
              }
            }
          `
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.errors || !data.data?.currentUser) {
        return null;
      }

      const user = data.data.currentUser;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profileImage: user.image
      };
    } catch (error) {
      console.error("[ReplitImport] Failed to fetch user:", error);
      return null;
    }
  }

  /**
   * List user's Repls
   * استعراض مشاريع المستخدم
   */
  async listRepls(userId: string, options?: {
    limit?: number;
    search?: string;
  }): Promise<ReplInfo[]> {
    const connection = await this.getConnectionWithToken(userId);
    if (!connection || !connection.isActive) {
      throw new Error("Not connected to Replit | غير متصل بـ Replit");
    }

    try {
      const limit = options?.limit || 50;
      const searchFilter = options?.search ? `, search: "${options.search}"` : '';

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connection.accessToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          query: `
            query UserRepls($username: String!) {
              userByUsername(username: $username) {
                repls(count: ${limit}${searchFilter}) {
                  items {
                    id
                    slug
                    title
                    description
                    language
                    isPrivate
                    url
                    iconUrl
                    timeCreated
                    timeUpdated
                  }
                }
              }
            }
          `,
          variables: {
            username: connection.replitUsername
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Repls");
      }

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0]?.message || "GraphQL error");
      }

      const repls = data.data?.userByUsername?.repls?.items || [];
      return repls.map((repl: any) => ({
        id: repl.id,
        slug: repl.slug,
        title: repl.title,
        description: repl.description,
        language: repl.language,
        isPrivate: repl.isPrivate,
        url: repl.url,
        iconUrl: repl.iconUrl,
        createdAt: repl.timeCreated,
        updatedAt: repl.timeUpdated
      }));
    } catch (error: any) {
      console.error("[ReplitImport] Failed to list Repls:", error);
      throw error;
    }
  }

  /**
   * Get Repl details with files
   * الحصول على تفاصيل المشروع مع الملفات
   */
  async getReplDetails(userId: string, replId: string): Promise<ReplInfo | null> {
    const connection = await this.getConnectionWithToken(userId);
    if (!connection || !connection.isActive) {
      throw new Error("Not connected to Replit | غير متصل بـ Replit");
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${connection.accessToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          query: `
            query ReplDetails($id: String!) {
              repl(id: $id) {
                id
                slug
                title
                description
                language
                isPrivate
                url
                iconUrl
                timeCreated
                timeUpdated
                files {
                  path
                  content
                }
              }
            }
          `,
          variables: { id: replId }
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.errors || !data.data?.repl) {
        return null;
      }

      const repl = data.data.repl;
      return {
        id: repl.id,
        slug: repl.slug,
        title: repl.title,
        description: repl.description,
        language: repl.language,
        isPrivate: repl.isPrivate,
        url: repl.url,
        iconUrl: repl.iconUrl,
        createdAt: repl.timeCreated,
        updatedAt: repl.timeUpdated,
        files: repl.files?.map((f: any) => ({
          path: f.path,
          content: f.content,
          type: 'file' as const,
          size: f.content?.length || 0
        })) || []
      };
    } catch (error) {
      console.error("[ReplitImport] Failed to get Repl details:", error);
      return null;
    }
  }

  // ============ Import Operations ============

  /**
   * Import Repl to internal sovereign repository
   * استيراد مشروع Replit إلى المستودع الداخلي السيادي
   */
  async importRepl(
    userId: string,
    userEmail: string,
    replId: string,
    options?: {
      newName?: string;
      preserveHistory?: boolean;
    }
  ): Promise<ImportResult> {
    const errors: string[] = [];
    let filesImported = 0;

    try {
      // 1. Get Repl details with files
      const repl = await this.getReplDetails(userId, replId);
      if (!repl) {
        return {
          success: false,
          filesImported: 0,
          errors: ["Repl not found or access denied | المشروع غير موجود أو الوصول مرفوض"],
          message: "Failed to fetch Repl",
          messageAr: "فشل في جلب المشروع"
        };
      }

      // 2. Create internal repository
      const repoName = options?.newName || repl.title || repl.slug;
      const repo = await sovereignGitEngine.createRepository(
        'default',
        userId,
        userEmail,
        {
          name: repoName,
          description: repl.description || `Imported from Replit: ${repl.slug}`,
          descriptionAr: `تم الاستيراد من Replit: ${repl.slug}`,
          visibility: repl.isPrivate ? 'private' : 'public',
          language: repl.language,
          topics: ['imported-from-replit', repl.language?.toLowerCase()].filter(Boolean) as string[]
        }
      );

      // 3. Link to original Replit
      await sovereignGitEngine.linkProvider({
        repositoryId: repo.id,
        provider: 'replit',
        url: repl.url,
        externalId: repl.id,
        syncEnabled: false, // Initially disabled
        syncDirection: 'pull'
      });

      // 4. Import files
      if (repl.files && repl.files.length > 0) {
        const filesToCommit = repl.files
          .filter(f => f.type === 'file' && f.content)
          .map(f => ({
            path: f.path,
            content: f.content || '',
            action: 'add' as const
          }));

        if (filesToCommit.length > 0) {
          await sovereignGitEngine.createCommit({
            repositoryId: repo.id,
            branchName: 'main',
            message: `Import from Replit: ${repl.title}`,
            description: `Imported ${filesToCommit.length} files from Replit project ${repl.slug}`,
            authorId: userId,
            authorName: 'Replit Import',
            authorEmail: userEmail,
            files: filesToCommit
          });

          filesImported = filesToCommit.length;
        }
      }

      // 5. Create initial tag for import point
      const mainBranch = await sovereignGitEngine.getBranch(repo.id, 'main');
      if (mainBranch?.headCommitId) {
        await sovereignGitEngine.createTag({
          repositoryId: repo.id,
          name: 'v0.0.0-replit-import',
          message: `Initial import from Replit: ${repl.title}`,
          targetSha: mainBranch.headCommitId,
          taggerId: userId,
          taggerName: 'Replit Import',
          taggerEmail: userEmail,
          isRelease: false
        });
      }

      return {
        success: true,
        repositoryId: repo.id,
        internalId: repo.internalId,
        filesImported,
        errors,
        message: `Successfully imported "${repl.title}" with ${filesImported} files`,
        messageAr: `تم استيراد "${repl.title}" بنجاح مع ${filesImported} ملف`
      };

    } catch (error: any) {
      console.error("[ReplitImport] Import failed:", error);
      return {
        success: false,
        filesImported,
        errors: [error.message],
        message: "Import failed",
        messageAr: "فشل الاستيراد"
      };
    }
  }

  /**
   * Sync changes from Replit (pull)
   * مزامنة التغييرات من Replit
   */
  async pullFromReplit(userId: string, repositoryId: string): Promise<{
    success: boolean;
    filesUpdated: number;
    filesAdded: number;
    filesDeleted: number;
    message: string;
  }> {
    try {
      const repo = await sovereignGitEngine.getRepository(repositoryId);
      if (!repo || !repo.replitReplId) {
        return {
          success: false,
          filesUpdated: 0,
          filesAdded: 0,
          filesDeleted: 0,
          message: "Repository not linked to Replit"
        };
      }

      // Get current Repl state
      const repl = await this.getReplDetails(userId, repo.replitReplId);
      if (!repl) {
        return {
          success: false,
          filesUpdated: 0,
          filesAdded: 0,
          filesDeleted: 0,
          message: "Failed to fetch Repl"
        };
      }

      // Get current files in repo
      const currentFiles = await sovereignGitEngine.listFiles(repositoryId, 'main');
      const currentFileMap = new Map(currentFiles.map(f => [f.path, f]));

      // Calculate diffs
      const filesToCommit: { path: string; content: string; action: 'add' | 'modify' | 'delete' }[] = [];
      let filesUpdated = 0;
      let filesAdded = 0;
      let filesDeleted = 0;

      // Check for new/modified files
      for (const replFile of repl.files || []) {
        if (replFile.type !== 'file') continue;
        
        const existing = currentFileMap.get(replFile.path);
        if (!existing) {
          // New file
          filesToCommit.push({
            path: replFile.path,
            content: replFile.content || '',
            action: 'add'
          });
          filesAdded++;
        } else if (existing.content !== replFile.content) {
          // Modified file
          filesToCommit.push({
            path: replFile.path,
            content: replFile.content || '',
            action: 'modify'
          });
          filesUpdated++;
        }
        currentFileMap.delete(replFile.path);
      }

      // Check for deleted files
      for (const [path] of currentFileMap) {
        filesToCommit.push({
          path,
          content: '',
          action: 'delete'
        });
        filesDeleted++;
      }

      // Commit changes if any
      if (filesToCommit.length > 0) {
        await sovereignGitEngine.createCommit({
          repositoryId,
          branchName: 'main',
          message: `Sync from Replit: ${filesAdded} added, ${filesUpdated} modified, ${filesDeleted} deleted`,
          description: `Pulled latest changes from Replit`,
          authorId: userId,
          authorName: 'Replit Sync',
          authorEmail: repo.ownerEmail || 'sync@infera.io',
          files: filesToCommit
        });
      }

      return {
        success: true,
        filesUpdated,
        filesAdded,
        filesDeleted,
        message: `Synced: ${filesAdded} added, ${filesUpdated} modified, ${filesDeleted} deleted`
      };

    } catch (error: any) {
      console.error("[ReplitImport] Pull failed:", error);
      return {
        success: false,
        filesUpdated: 0,
        filesAdded: 0,
        filesDeleted: 0,
        message: error.message
      };
    }
  }

  /**
   * Get import status/history
   */
  async getImportHistory(tenantId: string): Promise<{
    imports: Array<{
      repositoryId: string;
      name: string;
      replitUrl?: string;
      importedAt: Date;
      filesCount: number;
    }>;
  }> {
    const repos = await db.select()
      .from(internalRepositories)
      .where(and(
        eq(internalRepositories.tenantId, tenantId)
      ))
      .orderBy(desc(internalRepositories.createdAt));

    const imports = repos
      .filter(r => r.replitUrl || r.replitReplId)
      .map(r => ({
        repositoryId: r.id,
        name: r.name,
        replitUrl: r.replitUrl || undefined,
        importedAt: r.createdAt!,
        filesCount: r.stats?.files || 0
      }));

    return { imports };
  }
}

export const replitImportService = new ReplitImportService();
