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
  breakdown?: {
    sourceCode: number;      // ملفات الكود المصدري
    configs: number;         // ملفات الإعداد
    envTemplates: number;    // قوالب البيئة
    buildScripts: number;    // ملفات البناء والتشغيل
    assets: number;          // ملفات الأصول
  };
}

// File categories for comprehensive import
const FILE_CATEGORIES = {
  // Config files - ملفات الإعداد
  configs: [
    '.replit', 'replit.nix', '.replit.toml',
    'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    'tsconfig.json', 'jsconfig.json', 'vite.config.ts', 'vite.config.js',
    'webpack.config.js', 'rollup.config.js', 'esbuild.config.js',
    'tailwind.config.js', 'tailwind.config.ts', 'postcss.config.js',
    'drizzle.config.ts', 'prisma/schema.prisma',
    '.eslintrc', '.eslintrc.js', '.eslintrc.json', '.prettierrc',
    'Cargo.toml', 'Cargo.lock', 'go.mod', 'go.sum',
    'requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile',
    'Gemfile', 'Gemfile.lock', 'composer.json', 'composer.lock',
    'Makefile', 'CMakeLists.txt', 'build.gradle', 'pom.xml'
  ],
  
  // Environment templates - قوالب البيئة
  envTemplates: [
    '.env', '.env.example', '.env.sample', '.env.template',
    '.env.local', '.env.development', '.env.production', '.env.test',
    'env.example', 'sample.env', 'template.env'
  ],
  
  // Build/Run scripts - ملفات البناء والتشغيل
  buildScripts: [
    'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
    '.dockerignore', 'Procfile', 'nixpacks.toml',
    'start.sh', 'run.sh', 'build.sh', 'deploy.sh', 'setup.sh',
    'scripts/', 'bin/', '.github/workflows/'
  ],
  
  // Assets patterns - أنماط الأصول
  assetPatterns: [
    /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i,
    /\.(woff|woff2|ttf|eot|otf)$/i,
    /\.(mp3|mp4|wav|ogg|webm)$/i,
    /\.(pdf|doc|docx|xls|xlsx)$/i
  ]
};

// Database-backed connection storage
class ReplitImportService {
  private baseUrl = 'https://replit.com';
  private apiUrl = 'https://replit.com/graphql';

  /**
   * Categorize a file by its path
   * تصنيف الملف حسب مساره
   */
  private categorizeFile(filePath: string): 'sourceCode' | 'configs' | 'envTemplates' | 'buildScripts' | 'assets' {
    const fileName = filePath.split('/').pop() || filePath;
    
    // Check env templates first (most specific)
    if (FILE_CATEGORIES.envTemplates.some(env => 
      fileName === env || fileName.toLowerCase() === env.toLowerCase()
    )) {
      return 'envTemplates';
    }
    
    // Check config files
    if (FILE_CATEGORIES.configs.some(config => {
      if (config.endsWith('/')) {
        return filePath.startsWith(config) || filePath.includes('/' + config);
      }
      return fileName === config || filePath.endsWith(config);
    })) {
      return 'configs';
    }
    
    // Check build scripts
    if (FILE_CATEGORIES.buildScripts.some(script => {
      if (script.endsWith('/')) {
        return filePath.startsWith(script) || filePath.includes('/' + script);
      }
      return fileName === script || filePath.endsWith(script);
    })) {
      return 'buildScripts';
    }
    
    // Check asset patterns
    if (FILE_CATEGORIES.assetPatterns.some(pattern => pattern.test(filePath))) {
      return 'assets';
    }
    
    // Default to source code
    return 'sourceCode';
  }

  /**
   * Convert .env files to templates (strip values, keep keys)
   * تحويل ملفات .env إلى قوالب
   */
  private convertEnvToTemplate(content: string, originalPath: string): { 
    templateContent: string; 
    templatePath: string;
    varsCount: number;
  } {
    const lines = content.split('\n');
    const templateLines: string[] = [];
    let varsCount = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Keep comments and empty lines
      if (trimmed.startsWith('#') || trimmed === '') {
        templateLines.push(line);
        continue;
      }
      
      // Parse KEY=VALUE
      const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
      if (match) {
        const [, key, value] = match;
        varsCount++;
        
        // Create template with placeholder
        if (value.includes('secret') || value.includes('key') || value.includes('password')) {
          templateLines.push(`${key}=<YOUR_${key}_HERE>`);
        } else if (value.match(/^https?:\/\//)) {
          templateLines.push(`${key}=<URL_HERE>`);
        } else if (value.match(/^\d+$/)) {
          templateLines.push(`${key}=${value}`); // Keep numeric values
        } else {
          templateLines.push(`${key}=<VALUE_HERE>`);
        }
      } else {
        templateLines.push(line);
      }
    }
    
    // Determine template path
    let templatePath = originalPath;
    if (!originalPath.includes('template') && !originalPath.includes('example') && !originalPath.includes('sample')) {
      templatePath = originalPath.replace('.env', '.env.template');
    }
    
    return {
      templateContent: templateLines.join('\n'),
      templatePath,
      varsCount
    };
  }

  /**
   * Generate import manifest documentation
   * إنشاء توثيق الاستيراد
   */
  private generateImportManifest(
    repl: ReplInfo,
    breakdown: { sourceCode: number; configs: number; envTemplates: number; buildScripts: number; assets: number },
    envVarsDiscovered: string[]
  ): string {
    const now = new Date().toISOString();
    const total = breakdown.sourceCode + breakdown.configs + breakdown.envTemplates + breakdown.buildScripts + breakdown.assets;
    
    return `# Import Manifest | وثيقة الاستيراد

## Project Information | معلومات المشروع

| Field | Value |
|-------|-------|
| **Original Name** | ${repl.title} |
| **Slug** | ${repl.slug} |
| **Language** | ${repl.language} |
| **Visibility** | ${repl.isPrivate ? 'Private' : 'Public'} |
| **Original URL** | [${repl.url}](${repl.url}) |
| **Import Date** | ${now} |
| **Original Created** | ${repl.createdAt} |
| **Original Updated** | ${repl.updatedAt} |

## Files Breakdown | تفصيل الملفات

| Category | Count | Description |
|----------|-------|-------------|
| **Source Code** | ${breakdown.sourceCode} | الكود المصدري |
| **Configurations** | ${breakdown.configs} | ملفات الإعداد |
| **Environment Templates** | ${breakdown.envTemplates} | قوالب البيئة |
| **Build Scripts** | ${breakdown.buildScripts} | سكربتات البناء |
| **Assets** | ${breakdown.assets} | الملفات الثابتة |
| **Total** | ${total} | الإجمالي |

${envVarsDiscovered.length > 0 ? `
## Environment Variables Discovered | متغيرات البيئة المكتشفة

> **Security Note**: Actual values have been replaced with placeholders in template files.
> **ملاحظة أمنية**: تم استبدال القيم الفعلية بقوالب في الملفات.

${envVarsDiscovered.map(v => `- ${v}`).join('\n')}
` : ''}

## Imported Files Structure | هيكل الملفات المستوردة

### Configuration Files | ملفات الإعداد
\`\`\`
${repl.files?.filter(f => this.categorizeFile(f.path) === 'configs').map(f => f.path).join('\n') || 'None'}
\`\`\`

### Build/Run Scripts | سكربتات البناء والتشغيل
\`\`\`
${repl.files?.filter(f => this.categorizeFile(f.path) === 'buildScripts').map(f => f.path).join('\n') || 'None'}
\`\`\`

## Sovereignty Status | حالة السيادة

- [x] **Source Code**: Fully sovereign | الكود المصدري: سيادي بالكامل
- [x] **Configurations**: Imported | الإعدادات: تم الاستيراد
- [x] **Environment Templates**: Secure templates created | قوالب البيئة: تم إنشاء قوالب آمنة
- [x] **Build Scripts**: Imported | سكربتات البناء: تم الاستيراد
- [x] **Version Control**: Internal Git | التحكم بالإصدارات: Git داخلي

## Next Steps | الخطوات التالية

1. Review and configure environment variables in \`.env.template\` files
2. Test build and run scripts locally
3. Update any hardcoded Replit-specific paths
4. Configure CI/CD for automated deployments

---

*This manifest was auto-generated by INFERA WebNova Replit Import System*
*تم إنشاء هذا التوثيق تلقائياً بواسطة نظام استيراد Replit في INFERA WebNova*
`;
  }

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

      // 4. Categorize and import files with comprehensive breakdown
      const breakdown = {
        sourceCode: 0,
        configs: 0,
        envTemplates: 0,
        buildScripts: 0,
        assets: 0
      };
      
      const filesToCommit: { path: string; content: string; action: 'add' }[] = [];
      const envVarsDiscovered: string[] = [];
      
      if (repl.files && repl.files.length > 0) {
        for (const file of repl.files) {
          if (file.type !== 'file' || !file.content) continue;
          
          const category = this.categorizeFile(file.path);
          breakdown[category]++;
          
          // Handle .env files specially - convert to templates
          if (category === 'envTemplates' && file.path.includes('.env') && !file.path.includes('template') && !file.path.includes('example')) {
            const template = this.convertEnvToTemplate(file.content, file.path);
            
            // Add template version (safe to commit)
            filesToCommit.push({
              path: template.templatePath,
              content: template.templateContent,
              action: 'add'
            });
            
            // Keep track of env vars for documentation
            if (template.varsCount > 0) {
              envVarsDiscovered.push(`${file.path}: ${template.varsCount} variables`);
            }
          } else {
            // Add file as-is
            filesToCommit.push({
              path: file.path,
              content: file.content,
              action: 'add'
            });
          }
        }
        
        if (filesToCommit.length > 0) {
          // Create main import commit
          await sovereignGitEngine.createCommit({
            repositoryId: repo.id,
            branchName: 'main',
            message: `Import from Replit: ${repl.title}`,
            description: `Imported ${filesToCommit.length} files from Replit project ${repl.slug}\n\n` +
              `Breakdown:\n` +
              `- Source Code: ${breakdown.sourceCode} files\n` +
              `- Configs: ${breakdown.configs} files\n` +
              `- Env Templates: ${breakdown.envTemplates} files\n` +
              `- Build Scripts: ${breakdown.buildScripts} files\n` +
              `- Assets: ${breakdown.assets} files`,
            authorId: userId,
            authorName: 'Replit Import',
            authorEmail: userEmail,
            files: filesToCommit
          });

          filesImported = filesToCommit.length;
        }
        
        // 5. Create IMPORT_MANIFEST.md for documentation
        const manifestContent = this.generateImportManifest(repl, breakdown, envVarsDiscovered);
        await sovereignGitEngine.createCommit({
          repositoryId: repo.id,
          branchName: 'main',
          message: 'Add import manifest documentation',
          description: 'Auto-generated documentation about the imported project',
          authorId: userId,
          authorName: 'Replit Import',
          authorEmail: userEmail,
          files: [{
            path: 'IMPORT_MANIFEST.md',
            content: manifestContent,
            action: 'add'
          }]
        });
      }

      // 6. Create initial tag for import point
      const mainBranch = await sovereignGitEngine.getBranch(repo.id, 'main');
      if (mainBranch?.headCommitId) {
        await sovereignGitEngine.createTag({
          repositoryId: repo.id,
          name: 'v0.0.0-replit-import',
          message: `Initial import from Replit: ${repl.title}\n\n` +
            `Total files: ${filesImported}\n` +
            `Source code: ${breakdown.sourceCode}\n` +
            `Configs: ${breakdown.configs}\n` +
            `Build scripts: ${breakdown.buildScripts}`,
          targetSha: mainBranch.headCommitId,
          taggerId: userId,
          taggerName: 'Replit Import',
          taggerEmail: userEmail,
          isRelease: false
        });
      }

      console.log(`[ReplitImport] Successfully imported ${filesImported} files from "${repl.title}"`);
      console.log(`[ReplitImport] Breakdown: Code=${breakdown.sourceCode}, Configs=${breakdown.configs}, Env=${breakdown.envTemplates}, Build=${breakdown.buildScripts}, Assets=${breakdown.assets}`);

      return {
        success: true,
        repositoryId: repo.id,
        internalId: repo.internalId,
        filesImported,
        errors,
        breakdown,
        message: `Successfully imported "${repl.title}" with ${filesImported} files (${breakdown.sourceCode} source, ${breakdown.configs} configs, ${breakdown.buildScripts} build scripts)`,
        messageAr: `تم استيراد "${repl.title}" بنجاح: ${filesImported} ملف (${breakdown.sourceCode} كود مصدري، ${breakdown.configs} إعدادات، ${breakdown.buildScripts} سكربتات بناء)`
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
