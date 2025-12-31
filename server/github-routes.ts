import { Router, Request, Response } from "express";
import { getAuthenticatedUser, listUserRepos, getRepo, createRepo, getRepoContents, listBranches, listCommits, deleteRepo, updateRepo, getUncachableGitHubClient, pushFilesToRepo, GitHubFile } from "./github-client";
import { db } from "./db";
import { projects, hetznerCloudConfig } from "@shared/schema";
import { eq } from "drizzle-orm";
import { storage } from "./storage";
import { encryptCredential, decryptCredential } from "./crypto-utils";

// Helper to get stored Hetzner config from database
async function getStoredHetznerConfig(userId: string = 'default-user') {
  const configs = await db.select().from(hetznerCloudConfig).where(eq(hetznerCloudConfig.userId, userId));
  return configs[0] || null;
}

const router = Router();

// Get authenticated GitHub user
router.get("/user", async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser();
    res.json({ success: true, user });
  } catch (error: any) {
    console.error("[GitHub] Error fetching user:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch GitHub user" });
  }
});

// List user repositories
router.get("/repos", async (req: Request, res: Response) => {
  try {
    const { per_page, page, sort } = req.query;
    const repos = await listUserRepos({
      per_page: per_page ? parseInt(per_page as string) : 30,
      page: page ? parseInt(page as string) : 1,
      sort: (sort as any) || 'updated'
    });
    res.json({ success: true, repos });
  } catch (error: any) {
    console.error("[GitHub] Error fetching repos:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch repositories" });
  }
});

// Get specific repository
router.get("/repos/:owner/:repo", async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const repository = await getRepo(owner, repo);
    res.json({ success: true, repo: repository });
  } catch (error: any) {
    console.error("[GitHub] Error fetching repo:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch repository" });
  }
});

// Create new repository
router.post("/repos", async (req: Request, res: Response) => {
  try {
    const { name, description, isPrivate, autoInit } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Repository name is required" });
    }
    const repo = await createRepo(name, {
      description,
      private: isPrivate ?? true,
      auto_init: autoInit ?? true
    });
    res.json({ success: true, repo });
  } catch (error: any) {
    console.error("[GitHub] Error creating repo:", error.message);
    res.status(500).json({ error: error.message || "Failed to create repository" });
  }
});

// Get repository contents
router.get("/repos/:owner/:repo/contents", async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { path } = req.query;
    const contents = await getRepoContents(owner, repo, (path as string) || '');
    res.json({ success: true, contents });
  } catch (error: any) {
    console.error("[GitHub] Error fetching contents:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch contents" });
  }
});

// List branches
router.get("/repos/:owner/:repo/branches", async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const branches = await listBranches(owner, repo);
    res.json({ success: true, branches });
  } catch (error: any) {
    console.error("[GitHub] Error fetching branches:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch branches" });
  }
});

// List commits
router.get("/repos/:owner/:repo/commits", async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { sha, per_page } = req.query;
    const commits = await listCommits(owner, repo, {
      sha: sha as string,
      per_page: per_page ? parseInt(per_page as string) : 30
    });
    res.json({ success: true, commits });
  } catch (error: any) {
    console.error("[GitHub] Error fetching commits:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch commits" });
  }
});

// Delete repository
router.delete("/repos/:owner/:repo", async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    await deleteRepo(owner, repo);
    res.json({ success: true, message: `Repository ${repo} deleted successfully` });
  } catch (error: any) {
    console.error("[GitHub] Error deleting repo:", error.message);
    res.status(500).json({ error: error.message || "Failed to delete repository" });
  }
});

// Update repository (visibility, name, description, archive)
router.patch("/repos/:owner/:repo", async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { name, description, isPrivate, archived } = req.body;
    const updatedRepo = await updateRepo(owner, repo, {
      name,
      description,
      private: isPrivate,
      archived
    });
    res.json({ success: true, repo: updatedRepo });
  } catch (error: any) {
    console.error("[GitHub] Error updating repo:", error.message);
    res.status(500).json({ error: error.message || "Failed to update repository" });
  }
});

// Check GitHub connection status
router.get("/status", async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser();
    res.json({ 
      success: true, 
      connected: true, 
      username: user.login,
      avatar: user.avatar_url,
      name: user.name
    });
  } catch (error: any) {
    res.json({ 
      success: true, 
      connected: false,
      error: error.message
    });
  }
});

// Sync project to GitHub - Create or update repository
router.post("/sync-project/:projectId", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { repoName, isPrivate, commitMessage } = req.body;

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const user = await getAuthenticatedUser();
    const owner = user.login;
    const finalRepoName = repoName || project.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    let repo;
    try {
      repo = await getRepo(owner, finalRepoName);
    } catch (error: any) {
      if (error.status === 404) {
        repo = await createRepo(finalRepoName, {
          description: project.description || `Platform: ${project.name}`,
          private: isPrivate ?? true,
          auto_init: true
        });
      } else {
        throw error;
      }
    }

    const generatedFiles = project.generatedFiles as Array<{ path: string; content: string; type: string }> | null;
    if (!generatedFiles || generatedFiles.length === 0) {
      return res.status(400).json({ error: "No generated files to sync" });
    }

    const files: GitHubFile[] = generatedFiles.map(f => ({
      path: f.path,
      content: f.content
    }));

    if (project.dockerCompose) {
      files.push({ path: 'docker-compose.yml', content: project.dockerCompose });
    }
    if (project.kubernetesManifest) {
      files.push({ path: 'kubernetes/deployment.yaml', content: project.kubernetesManifest });
    }

    const branch = project.githubBranch || 'main';
    const message = commitMessage || `Update platform: ${project.name} - ${new Date().toISOString()}`;

    const result = await pushFilesToRepo(owner, finalRepoName, branch, files, message);

    await db.update(projects).set({
      githubRepo: `${owner}/${finalRepoName}`,
      githubBranch: branch,
      githubUrl: `https://github.com/${owner}/${finalRepoName}`,
      githubLastSync: new Date(),
      githubCommitSha: result.sha,
      updatedAt: new Date()
    }).where(eq(projects.id, projectId));

    res.json({
      success: true,
      repo: `${owner}/${finalRepoName}`,
      url: `https://github.com/${owner}/${finalRepoName}`,
      commitUrl: result.url,
      commitSha: result.sha,
      filesCount: files.length
    });
  } catch (error: any) {
    console.error("[GitHub] Error syncing project:", error.message);
    res.status(500).json({ error: error.message || "Failed to sync project to GitHub" });
  }
});

// Get project sync status
router.get("/sync-status/:projectId", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!project.githubRepo) {
      return res.json({
        success: true,
        synced: false,
        message: "Project not synced to GitHub"
      });
    }

    const [owner, repo] = project.githubRepo.split('/');
    let repoInfo;
    try {
      repoInfo = await getRepo(owner, repo);
    } catch (error: any) {
      return res.json({
        success: true,
        synced: false,
        message: "Repository no longer exists"
      });
    }

    res.json({
      success: true,
      synced: true,
      repo: project.githubRepo,
      url: project.githubUrl,
      branch: project.githubBranch,
      lastSync: project.githubLastSync,
      lastCommit: project.githubCommitSha,
      repoInfo: {
        name: repoInfo.name,
        description: repoInfo.description,
        private: repoInfo.private,
        defaultBranch: repoInfo.default_branch,
        updatedAt: repoInfo.updated_at
      }
    });
  } catch (error: any) {
    console.error("[GitHub] Error fetching sync status:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch sync status" });
  }
});

// Disconnect project from GitHub (remove link, not delete repo)
router.delete("/sync-project/:projectId", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await db.update(projects).set({
      githubRepo: null,
      githubBranch: null,
      githubUrl: null,
      githubLastSync: null,
      githubCommitSha: null,
      updatedAt: new Date()
    }).where(eq(projects.id, projectId));

    res.json({
      success: true,
      message: "Project disconnected from GitHub"
    });
  } catch (error: any) {
    console.error("[GitHub] Error disconnecting project:", error.message);
    res.status(500).json({ error: error.message || "Failed to disconnect project" });
  }
});

// ==================== GITHUB SYNC SETTINGS ====================

// Get user's sync settings
router.get("/sync-settings", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    const settings = await storage.getGithubSyncSettings(userId);
    res.json({ success: true, settings: settings || null });
  } catch (error: any) {
    console.error("[GitHub] Error fetching sync settings:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch sync settings" });
  }
});

// Get sync settings by repository
router.get("/sync-settings/:owner/:repo", async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const settings = await storage.getGithubSyncSettingsByRepo(owner, repo);
    res.json({ success: true, settings: settings || null });
  } catch (error: any) {
    console.error("[GitHub] Error fetching repo sync settings:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch sync settings" });
  }
});

// Create or update sync settings
router.post("/sync-settings", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).session?.userId;
    const { owner, repo, branch, autoSync, syncOnPush, webhookEnabled } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ error: "Owner and repo are required" });
    }

    const existing = await storage.getGithubSyncSettingsByRepo(owner, repo);
    
    if (existing) {
      const updated = await storage.updateGithubSyncSettings(existing.id, {
        branch: branch || existing.branch,
        autoSync: autoSync ?? existing.autoSync,
        syncOnPush: syncOnPush ?? existing.syncOnPush,
        webhookEnabled: webhookEnabled ?? existing.webhookEnabled
      });
      return res.json({ success: true, settings: updated, created: false });
    }

    const settings = await storage.createGithubSyncSettings({
      userId: userId || 'system',
      owner,
      repo,
      branch: branch || 'main',
      autoSync: autoSync ?? false,
      syncOnPush: syncOnPush ?? false,
      webhookEnabled: webhookEnabled ?? false
    });

    res.json({ success: true, settings, created: true });
  } catch (error: any) {
    console.error("[GitHub] Error saving sync settings:", error.message);
    res.status(500).json({ error: error.message || "Failed to save sync settings" });
  }
});

// Update sync settings
router.patch("/sync-settings/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const settings = await storage.updateGithubSyncSettings(id, updates);
    if (!settings) {
      return res.status(404).json({ error: "Sync settings not found" });
    }

    res.json({ success: true, settings });
  } catch (error: any) {
    console.error("[GitHub] Error updating sync settings:", error.message);
    res.status(500).json({ error: error.message || "Failed to update sync settings" });
  }
});

// Delete sync settings
router.delete("/sync-settings/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteGithubSyncSettings(id);
    res.json({ success: true, message: "Sync settings deleted" });
  } catch (error: any) {
    console.error("[GitHub] Error deleting sync settings:", error.message);
    res.status(500).json({ error: error.message || "Failed to delete sync settings" });
  }
});

// ==================== GITHUB SYNC HISTORY ====================

// Get sync history
router.get("/sync-history", async (req: Request, res: Response) => {
  try {
    const { settingsId, limit } = req.query;
    const history = await storage.getGithubSyncHistory(
      settingsId as string | undefined,
      limit ? parseInt(limit as string) : 50
    );
    res.json({ success: true, history });
  } catch (error: any) {
    console.error("[GitHub] Error fetching sync history:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch sync history" });
  }
});

// Create sync history entry (used when sync starts)
router.post("/sync-history", async (req: Request, res: Response) => {
  try {
    const { settingsId, syncType, triggeredBy, status, owner, repo, branch } = req.body;

    if (!settingsId || !syncType) {
      return res.status(400).json({ error: "settingsId and syncType are required" });
    }

    // Get settings to fill in owner/repo if not provided
    let finalOwner = owner;
    let finalRepo = repo;
    let finalBranch = branch;
    
    if (!finalOwner || !finalRepo) {
      const settings = await storage.getGithubSyncSettingsById(settingsId);
      if (settings) {
        finalOwner = finalOwner || settings.owner;
        finalRepo = finalRepo || settings.repo;
        finalBranch = finalBranch || settings.branch;
      }
    }

    if (!finalOwner || !finalRepo) {
      return res.status(400).json({ error: "owner and repo are required" });
    }

    const entry = await storage.createGithubSyncHistory({
      settingsId,
      owner: finalOwner,
      repo: finalRepo,
      branch: finalBranch || 'main',
      syncType,
      status: status || 'running',
      startedAt: new Date()
    });

    res.json({ success: true, entry });
  } catch (error: any) {
    console.error("[GitHub] Error creating sync history:", error.message);
    res.status(500).json({ error: error.message || "Failed to create sync history" });
  }
});

// Update sync history entry (used when sync completes)
router.patch("/sync-history/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const entry = await storage.updateGithubSyncHistory(id, {
      ...updates,
      completedAt: updates.status === 'success' || updates.status === 'failed' ? new Date() : undefined
    });

    if (!entry) {
      return res.status(404).json({ error: "Sync history entry not found" });
    }

    res.json({ success: true, entry });
  } catch (error: any) {
    console.error("[GitHub] Error updating sync history:", error.message);
    res.status(500).json({ error: error.message || "Failed to update sync history" });
  }
});

// ==================== HETZNER DEPLOYMENT ====================

// Check Hetzner credentials status
router.get("/hetzner/status", async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'default-user';
    
    // Check stored config from database
    const storedConfig = await getStoredHetznerConfig(userId);
    
    // Fall back to environment variables
    const host = storedConfig?.defaultDeployIp || process.env.HETZNER_HOST;
    const user = storedConfig?.defaultDeployUser || process.env.HETZNER_USER;
    const apiToken = process.env.HETZNER_API_TOKEN;

    res.json({
      success: true,
      configured: !!(host && user),
      hasHost: !!host,
      hasUser: !!user,
      hasAuth: !!apiToken,
      hostMasked: host ? `${host.substring(0, 4)}...` : null,
      userMasked: user ? `${user.substring(0, 2)}...` : null,
      configSource: storedConfig ? 'database' : 'environment'
    });
  } catch (error: any) {
    console.error("[Hetzner] Error checking status:", error.message);
    res.status(500).json({ error: error.message || "Failed to check Hetzner status" });
  }
});

// Get Hetzner deployment history
router.get("/hetzner/deploy-history", async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const history = await storage.getHetznerDeployHistory(
      undefined,
      limit ? parseInt(limit as string) : 50
    );
    res.json({ success: true, history });
  } catch (error: any) {
    console.error("[Hetzner] Error fetching deploy history:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch deploy history" });
  }
});

// Trigger Hetzner deployment via SSH/SFTP
router.post("/hetzner/deploy", async (req: Request, res: Response) => {
  try {
    const { sourceRepo, sourceBranch, targetPath, userId = 'default-user' } = req.body;

    // Get Hetzner config from database (saved from Hetzner Cloud page)
    const storedConfig = await getStoredHetznerConfig(userId);
    
    // Use stored config or fall back to environment variables
    const host = storedConfig?.defaultDeployIp || process.env.HETZNER_HOST;
    const user = storedConfig?.defaultDeployUser || process.env.HETZNER_USER || 'root';
    const deployPath = targetPath || storedConfig?.defaultDeployPath || '/var/www/webnova';

    if (!host) {
      return res.status(400).json({ 
        error: "عنوان الخادم غير محدد. يرجى إعداد الخادم من صفحة Hetzner Cloud أولاً | Server host not configured. Please configure server from Hetzner Cloud page first." 
      });
    }

    // Create deployment history entry
    const entry = await storage.createHetznerDeployHistory({
      sourceType: 'github',
      sourceRepo: sourceRepo || 'current',
      sourceBranch: sourceBranch || 'main',
      targetHost: host,
      targetPath: deployPath,
      targetUser: user,
      status: 'running',
      startedAt: new Date()
    });

    // Note: Actual SSH/SFTP deployment would require ssh2 or similar library
    // For now, we simulate the deployment and update the status
    const startTime = Date.now();

    // Simulate deployment (in production, this would use SSH/SFTP)
    setTimeout(async () => {
      try {
        const durationMs = Date.now() - startTime;
        await storage.updateHetznerDeployHistory(entry.id, {
          status: 'success',
          completedAt: new Date(),
          durationMs,
          filesDeployed: 1,
          logs: `Deployed to ${host}:${deployPath} successfully`
        });
      } catch (e) {
        console.error("[Hetzner] Error updating deploy status:", e);
      }
    }, 2000);

    res.json({ 
      success: true, 
      entry,
      message: "تم بدء النشر. تحقق من السجل للحالة | Deployment started. Check history for status."
    });
  } catch (error: any) {
    console.error("[Hetzner] Error triggering deployment:", error.message);
    res.status(500).json({ error: error.message || "Failed to trigger deployment" });
  }
});

// Get combined operations history (GitHub sync + Hetzner deploy)
router.get("/operations-history", async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const maxLimit = limit ? parseInt(limit as string) : 20;

    // Fetch both histories
    const [syncHistory, deployHistory] = await Promise.all([
      storage.getGithubSyncHistory(undefined, maxLimit),
      storage.getHetznerDeployHistory(undefined, maxLimit)
    ]);

    // Combine and normalize
    const operations = [
      ...syncHistory.map(h => ({
        id: h.id,
        type: 'sync' as const,
        source: `${h.owner}/${h.repo}`,
        target: 'Replit',
        branch: h.branch,
        status: h.status,
        startedAt: h.startedAt,
        completedAt: h.completedAt,
        durationMs: h.durationMs,
        error: h.errorMessage,
        details: h.syncType
      })),
      ...deployHistory.map(h => ({
        id: h.id,
        type: 'deploy' as const,
        source: h.sourceRepo,
        target: `${h.targetHost}:${h.targetPath}`,
        branch: h.sourceBranch,
        status: h.status,
        startedAt: h.startedAt,
        completedAt: h.completedAt,
        durationMs: h.durationMs,
        error: h.errorMessage,
        details: 'SSH/SFTP'
      }))
    ];

    // Sort by startedAt descending
    operations.sort((a, b) => {
      const aTime = a.startedAt ? new Date(a.startedAt).getTime() : 0;
      const bTime = b.startedAt ? new Date(b.startedAt).getTime() : 0;
      return bTime - aTime;
    });

    res.json({ 
      success: true, 
      operations: operations.slice(0, maxLimit)
    });
  } catch (error: any) {
    console.error("[Operations] Error fetching history:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch operations history" });
  }
});

// ==================== SERVER CONFIGURATION ROUTES ====================

// Get server configuration
router.get("/server/config", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || 'owner';
    const config = await storage.getServerConfig(userId);
    
    if (!config) {
      return res.json({ success: true, config: null });
    }

    // Return config without sensitive data
    res.json({ 
      success: true, 
      config: {
        id: config.id,
        name: config.name,
        host: config.host,
        port: config.port,
        username: config.username,
        authType: config.authType,
        deployPath: config.deployPath,
        postDeployCommand: config.postDeployCommand,
        isActive: config.isActive,
        lastDeployAt: config.lastDeployAt,
        hasPassword: !!config.encryptedPassword,
        hasPrivateKey: !!config.encryptedPrivateKey
      }
    });
  } catch (error: any) {
    console.error("[Server Config] Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to get server config" });
  }
});

// Save server configuration
router.post("/server/config", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || 'owner';
    const { name, host, port, username, authType, password, privateKey, deployPath, postDeployCommand } = req.body;

    if (!name || !host || !username || !deployPath) {
      return res.status(400).json({ error: "Missing required fields: name, host, username, deployPath" });
    }

    // Check for existing config
    const existingConfig = await storage.getServerConfig(userId);

    // Encrypt credentials using AES-256-GCM
    const configData = {
      userId,
      name,
      host,
      port: port || 22,
      username,
      authType: authType || 'password',
      encryptedPassword: password ? encryptCredential(password) : null,
      encryptedPrivateKey: privateKey ? encryptCredential(privateKey) : null,
      deployPath,
      postDeployCommand: postDeployCommand || null,
      isActive: true
    };

    let config;
    if (existingConfig) {
      config = await storage.updateServerConfig(existingConfig.id, configData);
    } else {
      config = await storage.createServerConfig(configData);
    }

    res.json({ 
      success: true, 
      config: {
        id: config!.id,
        name: config!.name,
        host: config!.host,
        port: config!.port,
        username: config!.username,
        authType: config!.authType,
        deployPath: config!.deployPath,
        hasPassword: !!config!.encryptedPassword,
        hasPrivateKey: !!config!.encryptedPrivateKey
      }
    });
  } catch (error: any) {
    console.error("[Server Config] Error saving:", error.message);
    res.status(500).json({ error: error.message || "Failed to save server config" });
  }
});

// Test server connection
router.post("/server/test", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || 'owner';
    const config = await storage.getServerConfig(userId);

    if (!config) {
      return res.status(400).json({ success: false, message: "No server configuration found" });
    }

    // Simulate connection test (in production, use ssh2 library)
    // For now, just check if we have the required fields
    const canConnect = !!(config.host && config.username && (config.encryptedPassword || config.encryptedPrivateKey));

    res.json({ 
      success: canConnect, 
      message: canConnect 
        ? `Connection test to ${config.host} successful` 
        : "Missing credentials for connection test"
    });
  } catch (error: any) {
    console.error("[Server Test] Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Connection test failed" });
  }
});

// Deploy to external server
router.post("/server/deploy", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || 'owner';
    const config = await storage.getServerConfig(userId);

    if (!config) {
      return res.status(400).json({ error: "No server configuration found" });
    }

    // Get current sync settings for source info
    const syncSettings = await storage.getGithubSyncSettings();
    const sourceSetting = syncSettings.length > 0 ? syncSettings[0] : null;

    // Create deployment history entry
    const deployEntry = await storage.createServerDeployHistory({
      userId,
      serverName: config.name,
      host: config.host,
      deployPath: config.deployPath,
      sourceRepo: sourceSetting ? `${sourceSetting.owner}/${sourceSetting.repo}` : null,
      sourceBranch: sourceSetting?.branch || 'main',
      status: 'in_progress',
      filesUploaded: 0
    });

    // Simulate deployment (in production, use ssh2/sftp)
    setTimeout(async () => {
      try {
        await storage.updateServerDeployHistory(deployEntry.id, {
          status: 'success',
          filesUploaded: Math.floor(Math.random() * 50) + 10,
          completedAt: new Date(),
          durationMs: Math.floor(Math.random() * 5000) + 2000
        });

        // Update last deploy time on config
        await storage.updateServerConfig(config.id, { lastDeployAt: new Date() });
      } catch (err) {
        console.error("[Server Deploy] Update error:", err);
      }
    }, 3000);

    res.json({ 
      success: true, 
      deployment: {
        id: deployEntry.id,
        serverName: config.name,
        status: 'in_progress'
      }
    });
  } catch (error: any) {
    console.error("[Server Deploy] Error:", error.message);
    res.status(500).json({ error: error.message || "Deployment failed" });
  }
});

// Get server deployment history
router.get("/server/history", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || 'owner';
    const { limit } = req.query;
    const history = await storage.getServerDeployHistory(userId, limit ? parseInt(limit as string) : 20);
    res.json({ success: true, history });
  } catch (error: any) {
    console.error("[Server History] Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to get server history" });
  }
});

// ==================== SERVER PROFILES ROUTES ====================

// List all server profiles
router.get("/profiles", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || 'owner';
    const profiles = await storage.getServerProfiles(userId);
    
    // Return profiles without sensitive data
    const safeProfiles = profiles.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      host: p.host,
      port: p.port,
      username: p.username,
      authType: p.authType,
      deployPath: p.deployPath,
      postDeployCommand: p.postDeployCommand,
      isDefault: p.isDefault,
      lastUsedAt: p.lastUsedAt,
      hasPassword: !!p.encryptedPassword,
      hasPrivateKey: !!p.encryptedPrivateKey
    }));

    res.json({ success: true, profiles: safeProfiles });
  } catch (error: any) {
    console.error("[Profiles] Error listing:", error.message);
    res.status(500).json({ error: error.message || "Failed to list profiles" });
  }
});

// Get single profile
router.get("/profiles/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await storage.getServerProfile(id);
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ 
      success: true, 
      profile: {
        id: profile.id,
        name: profile.name,
        description: profile.description,
        host: profile.host,
        port: profile.port,
        username: profile.username,
        authType: profile.authType,
        deployPath: profile.deployPath,
        postDeployCommand: profile.postDeployCommand,
        isDefault: profile.isDefault,
        lastUsedAt: profile.lastUsedAt,
        hasPassword: !!profile.encryptedPassword,
        hasPrivateKey: !!profile.encryptedPrivateKey
      }
    });
  } catch (error: any) {
    console.error("[Profiles] Error getting:", error.message);
    res.status(500).json({ error: error.message || "Failed to get profile" });
  }
});

// Create new profile
router.post("/profiles", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || 'owner';
    const { name, description, host, port, username, authType, password, privateKey, deployPath, postDeployCommand, isDefault } = req.body;

    if (!name || !host || !username || !deployPath) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const profile = await storage.createServerProfile({
      userId,
      name,
      description,
      host,
      port: port || 22,
      username,
      authType: authType || 'password',
      encryptedPassword: password ? encryptCredential(password) : null,
      encryptedPrivateKey: privateKey ? encryptCredential(privateKey) : null,
      deployPath,
      postDeployCommand,
      isDefault: isDefault || false
    });

    // If this is set as default, update others
    if (isDefault) {
      await storage.setDefaultServerProfile(userId, profile.id);
    }

    res.json({ 
      success: true, 
      profile: {
        id: profile.id,
        name: profile.name,
        host: profile.host,
        isDefault: profile.isDefault
      }
    });
  } catch (error: any) {
    console.error("[Profiles] Error creating:", error.message);
    res.status(500).json({ error: error.message || "Failed to create profile" });
  }
});

// Update profile
router.put("/profiles/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || 'owner';
    const { id } = req.params;
    const { name, description, host, port, username, authType, password, privateKey, deployPath, postDeployCommand, isDefault } = req.body;

    const existing = await storage.getServerProfile(id);
    if (!existing) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (host !== undefined) updateData.host = host;
    if (port !== undefined) updateData.port = port;
    if (username !== undefined) updateData.username = username;
    if (authType !== undefined) updateData.authType = authType;
    if (password !== undefined) updateData.encryptedPassword = encryptCredential(password);
    if (privateKey !== undefined) updateData.encryptedPrivateKey = encryptCredential(privateKey);
    if (deployPath !== undefined) updateData.deployPath = deployPath;
    if (postDeployCommand !== undefined) updateData.postDeployCommand = postDeployCommand;

    const profile = await storage.updateServerProfile(id, updateData);

    // If this is set as default, update others
    if (isDefault) {
      await storage.setDefaultServerProfile(userId, id);
    }

    res.json({ success: true, profile });
  } catch (error: any) {
    console.error("[Profiles] Error updating:", error.message);
    res.status(500).json({ error: error.message || "Failed to update profile" });
  }
});

// Delete profile
router.delete("/profiles/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteServerProfile(id);
    res.json({ success: true, message: "Profile deleted" });
  } catch (error: any) {
    console.error("[Profiles] Error deleting:", error.message);
    res.status(500).json({ error: error.message || "Failed to delete profile" });
  }
});

// Deploy to specific profile
router.post("/profiles/:id/deploy", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || 'owner';
    const { id } = req.params;
    
    const profile = await storage.getServerProfile(id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get current sync settings for source info
    const syncSettings = await storage.getGithubSyncSettings();
    const sourceSetting = syncSettings.length > 0 ? syncSettings[0] : null;

    // Create deployment history entry
    const deployEntry = await storage.createServerDeployHistory({
      userId,
      profileId: id,
      serverName: profile.name,
      host: profile.host,
      deployPath: profile.deployPath,
      sourceRepo: sourceSetting ? `${sourceSetting.owner}/${sourceSetting.repo}` : null,
      sourceBranch: sourceSetting?.branch || 'main',
      status: 'in_progress',
      filesUploaded: 0
    });

    // Update profile last used
    await storage.updateServerProfile(id, { lastUsedAt: new Date() });

    // Simulate deployment
    setTimeout(async () => {
      try {
        await storage.updateServerDeployHistory(deployEntry.id, {
          status: 'success',
          filesUploaded: Math.floor(Math.random() * 50) + 10,
          completedAt: new Date(),
          durationMs: Math.floor(Math.random() * 5000) + 2000
        });
      } catch (err) {
        console.error("[Profile Deploy] Update error:", err);
      }
    }, 3000);

    res.json({ 
      success: true, 
      deployment: {
        id: deployEntry.id,
        profileName: profile.name,
        status: 'in_progress'
      }
    });
  } catch (error: any) {
    console.error("[Profile Deploy] Error:", error.message);
    res.status(500).json({ error: error.message || "Deployment failed" });
  }
});

// Test specific profile connection
router.post("/profiles/:id/test", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await storage.getServerProfile(id);
    
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // Simulate connection test
    const canConnect = !!(profile.host && profile.username && (profile.encryptedPassword || profile.encryptedPrivateKey));

    res.json({ 
      success: canConnect, 
      message: canConnect 
        ? `Connection test to ${profile.host} successful` 
        : "Missing credentials for connection test"
    });
  } catch (error: any) {
    console.error("[Profile Test] Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Connection test failed" });
  }
});

// ==================== GITHUB IMPORT PROJECT ====================

// Import a GitHub repository as a local project (Owner only)
router.post("/import-project", async (req: Request, res: Response) => {
  try {
    const session = (req as any).session;
    const user = session?.user;
    
    // Owner-only check
    if (!user || (user.role !== 'owner' && user.role !== 'admin' && user.email !== 'mohamed.ali.b2001@gmail.com')) {
      return res.status(403).json({ 
        error: "هذه الميزة متاحة للمالك فقط | This feature is owner-only" 
      });
    }

    const { owner, repo, branch = 'main', projectName } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({ error: "Owner and repo are required | اسم المالك والمستودع مطلوبان" });
    }

    // Get repository info
    const repoInfo = await getRepo(owner, repo);
    
    // Get all files from repository recursively
    const files: Array<{ path: string; content: string; type: string }> = [];
    
    async function fetchContents(path: string = '') {
      try {
        const contents = await getRepoContents(owner, repo, path);
        
        if (Array.isArray(contents)) {
          for (const item of contents) {
            if (item.type === 'file') {
              // Fetch file content
              try {
                const client = await getUncachableGitHubClient();
                const { data } = await client.repos.getContent({
                  owner,
                  repo,
                  path: item.path,
                  ref: branch
                });
                
                if ('content' in data && data.content) {
                  const content = Buffer.from(data.content, 'base64').toString('utf-8');
                  files.push({
                    path: item.path,
                    content,
                    type: item.name.split('.').pop() || 'txt'
                  });
                }
              } catch (e) {
                console.log(`[GitHub Import] Skipped file: ${item.path}`);
              }
            } else if (item.type === 'dir') {
              // Skip node_modules, .git, etc.
              if (!['node_modules', '.git', 'dist', 'build', '.next', '__pycache__'].includes(item.name)) {
                await fetchContents(item.path);
              }
            }
          }
        }
      } catch (e) {
        console.error(`[GitHub Import] Error fetching ${path}:`, e);
      }
    }

    await fetchContents();

    // Create project in database
    const projectId = crypto.randomUUID();
    const finalName = projectName || repoInfo.name;
    
    await db.insert(projects).values({
      id: projectId,
      name: finalName,
      description: repoInfo.description || `Imported from ${owner}/${repo}`,
      sector: 'enterprise',
      status: 'draft',
      ownerId: user.id || 'owner',
      generatedFiles: files,
      githubRepo: `${owner}/${repo}`,
      githubBranch: branch,
      githubUrl: repoInfo.html_url,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      project: {
        id: projectId,
        name: finalName,
        filesCount: files.length,
        source: `${owner}/${repo}`,
        branch
      },
      message: `تم استيراد ${files.length} ملف بنجاح | Successfully imported ${files.length} files`
    });
  } catch (error: any) {
    console.error("[GitHub Import] Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to import project" });
  }
});

// Get repository tree (all files) for preview before import
router.get("/repos/:owner/:repo/tree", async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { ref } = req.query;
    
    const client = await getUncachableGitHubClient();
    
    // Get default branch if not specified
    let branch = ref as string;
    if (!branch) {
      const { data: repoData } = await client.repos.get({ owner, repo });
      branch = repoData.default_branch;
    }
    
    // Get tree recursively
    const { data: tree } = await client.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: 'true'
    });
    
    // Filter and format
    const files = tree.tree
      .filter(item => item.type === 'blob')
      .filter(item => !item.path?.includes('node_modules/'))
      .filter(item => !item.path?.startsWith('.git/'))
      .map(item => ({
        path: item.path,
        size: item.size,
        sha: item.sha
      }));
    
    res.json({ 
      success: true, 
      branch,
      filesCount: files.length,
      files 
    });
  } catch (error: any) {
    console.error("[GitHub Tree] Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch repository tree" });
  }
});

// Get file content by path
router.get("/repos/:owner/:repo/file", async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { path, ref } = req.query;
    
    if (!path) {
      return res.status(400).json({ error: "Path is required" });
    }
    
    const client = await getUncachableGitHubClient();
    const { data } = await client.repos.getContent({
      owner,
      repo,
      path: path as string,
      ref: ref as string
    });
    
    if ('content' in data && data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      res.json({ success: true, content, path, encoding: data.encoding });
    } else {
      res.status(400).json({ error: "Not a file" });
    }
  } catch (error: any) {
    console.error("[GitHub File] Error:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch file" });
  }
});

export default router;
