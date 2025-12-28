import { Router, Request, Response } from "express";
import { getAuthenticatedUser, listUserRepos, getRepo, createRepo, getRepoContents, listBranches, listCommits, deleteRepo, updateRepo, getUncachableGitHubClient, pushFilesToRepo, GitHubFile } from "./github-client";
import { db } from "./db";
import { projects } from "@shared/schema";
import { eq } from "drizzle-orm";
import { storage } from "./storage";

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

export default router;
