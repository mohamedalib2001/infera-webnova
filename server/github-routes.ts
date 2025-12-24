import { Router, Request, Response } from "express";
import { getAuthenticatedUser, listUserRepos, getRepo, createRepo, getRepoContents, listBranches, listCommits, getUncachableGitHubClient } from "./github-client";

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

export default router;
