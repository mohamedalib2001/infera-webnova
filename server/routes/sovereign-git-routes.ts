/**
 * Sovereign Git Routes | مسارات Git السيادي
 */

import { Router, Request, Response } from "express";
import { sovereignGitEngine } from "../lib/sovereign-git-engine";

const router = Router();

// Middleware: Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const rateLimit = (req: Request, res: Response, next: Function) => {
  const key = req.session?.user?.email || req.ip || 'anonymous';
  const now = Date.now();
  const limit = rateLimitMap.get(key);
  
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 });
    return next();
  }
  
  if (limit.count >= 60) {
    return res.status(429).json({
      success: false,
      message: "Rate limit exceeded | تم تجاوز حد الطلبات"
    });
  }
  
  limit.count++;
  next();
};

// Middleware: Auth check
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session?.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required | المصادقة مطلوبة"
    });
  }
  next();
};

// ============ Repository Operations ============

router.get("/stats", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const stats = await sovereignGitEngine.getStats(tenantId);

    res.json({
      success: true,
      message: "Stats retrieved | تم استرجاع الإحصائيات",
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/repos", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const ownerId = req.query.mine === 'true' ? req.session?.user?.id : undefined;
    const repos = await sovereignGitEngine.listRepositories(tenantId, ownerId);

    res.json({
      success: true,
      message: "Repositories retrieved | تم استرجاع المستودعات",
      data: repos
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/repos/:id", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const repo = await sovereignGitEngine.getRepository(req.params.id);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found | المستودع غير موجود"
      });
    }

    res.json({ success: true, data: repo });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/repos", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'default';
    const userId = req.session?.user?.id;
    const userEmail = req.session?.user?.email;
    const { name, nameAr, description, descriptionAr, visibility, language, topics } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Repository name required | اسم المستودع مطلوب"
      });
    }

    const repo = await sovereignGitEngine.createRepository(tenantId, userId, userEmail, {
      name,
      nameAr,
      description,
      descriptionAr,
      visibility,
      language,
      topics
    });

    res.status(201).json({
      success: true,
      message: "Repository created | تم إنشاء المستودع",
      data: repo
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/repos/:id", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const repo = await sovereignGitEngine.updateRepository(req.params.id, updates);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found | المستودع غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Repository updated | تم تحديث المستودع",
      data: repo
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/repos/:id", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    await sovereignGitEngine.deleteRepository(req.params.id);
    res.json({
      success: true,
      message: "Repository deleted | تم حذف المستودع"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/repos/:id/archive", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const repo = await sovereignGitEngine.archiveRepository(req.params.id);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found | المستودع غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Repository archived | تم أرشفة المستودع",
      data: repo
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Branch Operations ============

router.get("/repos/:id/branches", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const branches = await sovereignGitEngine.listBranches(req.params.id);
    res.json({
      success: true,
      message: "Branches retrieved | تم استرجاع الفروع",
      data: branches
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/repos/:id/branches", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { name, fromBranch } = req.body;
    const userId = req.session?.user?.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Branch name required | اسم الفرع مطلوب"
      });
    }

    const branch = await sovereignGitEngine.createBranch({
      repositoryId: req.params.id,
      name,
      fromBranch,
      createdBy: userId
    });

    res.status(201).json({
      success: true,
      message: "Branch created | تم إنشاء الفرع",
      data: branch
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/repos/:id/branches/:name", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const deleted = await sovereignGitEngine.deleteBranch(req.params.id, req.params.name);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete protected or default branch | لا يمكن حذف الفرع المحمي أو الافتراضي"
      });
    }

    res.json({
      success: true,
      message: "Branch deleted | تم حذف الفرع"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/repos/:id/branches/:name/protect", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { protect } = req.body;
    const branch = await sovereignGitEngine.protectBranch(req.params.id, req.params.name, protect !== false);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found | الفرع غير موجود"
      });
    }

    res.json({
      success: true,
      message: protect ? "Branch protected | تم حماية الفرع" : "Branch unprotected | تم إلغاء حماية الفرع",
      data: branch
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Commit Operations ============

router.get("/repos/:id/commits", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const branch = req.query.branch as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const commits = await sovereignGitEngine.listCommits(req.params.id, branch, limit);

    res.json({
      success: true,
      message: "Commits retrieved | تم استرجاع الالتزامات",
      data: commits
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/repos/:id/commits", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { branch, message, description, files } = req.body;
    const userId = req.session?.user?.id;
    const userName = req.session?.user?.fullName || req.session?.user?.username || 'Unknown';
    const userEmail = req.session?.user?.email || 'unknown@example.com';

    if (!branch || !message) {
      return res.status(400).json({
        success: false,
        message: "Branch and message required | الفرع والرسالة مطلوبان"
      });
    }

    const commit = await sovereignGitEngine.createCommit({
      repositoryId: req.params.id,
      branchName: branch,
      message,
      description,
      authorId: userId,
      authorName: userName,
      authorEmail: userEmail,
      files
    });

    res.status(201).json({
      success: true,
      message: "Commit created | تم إنشاء الالتزام",
      data: commit
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/repos/:id/commits/:sha", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const commit = await sovereignGitEngine.getCommit(req.params.id, req.params.sha);

    if (!commit) {
      return res.status(404).json({
        success: false,
        message: "Commit not found | الالتزام غير موجود"
      });
    }

    res.json({ success: true, data: commit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Tag Operations ============

router.get("/repos/:id/tags", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const tags = await sovereignGitEngine.listTags(req.params.id);
    res.json({
      success: true,
      message: "Tags retrieved | تم استرجاع العلامات",
      data: tags
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/repos/:id/tags", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { name, message, targetSha, isRelease, releaseNotes, prerelease } = req.body;
    const userId = req.session?.user?.id;
    const userName = req.session?.user?.fullName || req.session?.user?.username || 'Unknown';
    const userEmail = req.session?.user?.email || 'unknown@example.com';

    if (!name || !targetSha) {
      return res.status(400).json({
        success: false,
        message: "Tag name and target SHA required | اسم العلامة وSHA الهدف مطلوبان"
      });
    }

    const tag = await sovereignGitEngine.createTag({
      repositoryId: req.params.id,
      name,
      message,
      targetSha,
      taggerId: userId,
      taggerName: userName,
      taggerEmail: userEmail,
      isRelease,
      releaseNotes,
      prerelease
    });

    res.status(201).json({
      success: true,
      message: "Tag created | تم إنشاء العلامة",
      data: tag
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/repos/:id/tags/:name", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    await sovereignGitEngine.deleteTag(req.params.id, req.params.name);
    res.json({
      success: true,
      message: "Tag deleted | تم حذف العلامة"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Pull Request Operations ============

router.get("/repos/:id/pulls", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const state = req.query.state as 'open' | 'closed' | 'merged' | 'draft' | undefined;
    const prs = await sovereignGitEngine.listPullRequests(req.params.id, state);

    res.json({
      success: true,
      message: "Pull requests retrieved | تم استرجاع طلبات السحب",
      data: prs
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/repos/:id/pulls", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { title, titleAr, description, descriptionAr, sourceBranch, targetBranch, isDraft, labels, reviewers } = req.body;
    const userId = req.session?.user?.id;
    const userName = req.session?.user?.fullName || req.session?.user?.username || 'Unknown';
    const userEmail = req.session?.user?.email;

    if (!title || !sourceBranch || !targetBranch) {
      return res.status(400).json({
        success: false,
        message: "Title, source and target branches required | العنوان وفروع المصدر والهدف مطلوبة"
      });
    }

    const pr = await sovereignGitEngine.createPullRequest({
      repositoryId: req.params.id,
      title,
      titleAr,
      description,
      descriptionAr,
      sourceBranch,
      targetBranch,
      authorId: userId,
      authorName: userName,
      authorEmail: userEmail,
      isDraft,
      labels,
      reviewers
    });

    res.status(201).json({
      success: true,
      message: "Pull request created | تم إنشاء طلب السحب",
      data: pr
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/repos/:id/pulls/:number", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const pr = await sovereignGitEngine.getPullRequest(req.params.id, parseInt(req.params.number));

    if (!pr) {
      return res.status(404).json({
        success: false,
        message: "Pull request not found | طلب السحب غير موجود"
      });
    }

    res.json({ success: true, data: pr });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/repos/:id/pulls/:number", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const pr = await sovereignGitEngine.updatePullRequest(req.params.id, parseInt(req.params.number), updates);

    if (!pr) {
      return res.status(404).json({
        success: false,
        message: "Pull request not found | طلب السحب غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Pull request updated | تم تحديث طلب السحب",
      data: pr
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/repos/:id/pulls/:number/merge", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    const pr = await sovereignGitEngine.mergePullRequest(req.params.id, parseInt(req.params.number), userId);

    if (!pr) {
      return res.status(404).json({
        success: false,
        message: "Pull request not found | طلب السحب غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Pull request merged | تم دمج طلب السحب",
      data: pr
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/repos/:id/pulls/:number/close", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user?.id;
    const pr = await sovereignGitEngine.closePullRequest(req.params.id, parseInt(req.params.number), userId);

    if (!pr) {
      return res.status(404).json({
        success: false,
        message: "Pull request not found | طلب السحب غير موجود"
      });
    }

    res.json({
      success: true,
      message: "Pull request closed | تم إغلاق طلب السحب",
      data: pr
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ PR Comments ============

router.get("/pulls/:prId/comments", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const comments = await sovereignGitEngine.listPRComments(req.params.prId);
    res.json({
      success: true,
      message: "Comments retrieved | تم استرجاع التعليقات",
      data: comments
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/pulls/:prId/comments", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { body, path, line, side } = req.body;
    const userId = req.session?.user?.id;
    const userName = req.session?.user?.fullName || req.session?.user?.username || 'Unknown';

    if (!body) {
      return res.status(400).json({
        success: false,
        message: "Comment body required | نص التعليق مطلوب"
      });
    }

    const comment = await sovereignGitEngine.addPRComment(
      req.params.prId,
      userId,
      userName,
      body,
      { path, line, side }
    );

    res.status(201).json({
      success: true,
      message: "Comment added | تم إضافة التعليق",
      data: comment
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Provider Linking ============

router.post("/repos/:id/link", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { provider, url, externalId, syncEnabled, syncDirection } = req.body;

    if (!provider || !url) {
      return res.status(400).json({
        success: false,
        message: "Provider and URL required | المزود والرابط مطلوبان"
      });
    }

    const repo = await sovereignGitEngine.linkProvider({
      repositoryId: req.params.id,
      provider,
      url,
      externalId,
      syncEnabled,
      syncDirection
    });

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found | المستودع غير موجود"
      });
    }

    res.json({
      success: true,
      message: `Linked to ${provider} | تم الربط مع ${provider}`,
      data: repo
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/repos/:id/unlink", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: "Provider required | المزود مطلوب"
      });
    }

    const repo = await sovereignGitEngine.unlinkProvider(req.params.id, provider);

    if (!repo) {
      return res.status(404).json({
        success: false,
        message: "Repository not found | المستودع غير موجود"
      });
    }

    res.json({
      success: true,
      message: `Unlinked from ${provider} | تم إلغاء الربط مع ${provider}`,
      data: repo
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ Sync Operations ============

router.post("/repos/:id/sync", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const { provider, direction } = req.body;
    const userId = req.session?.user?.id;

    if (!provider || !direction) {
      return res.status(400).json({
        success: false,
        message: "Provider and direction required | المزود والاتجاه مطلوبان"
      });
    }

    const log = await sovereignGitEngine.startSync(req.params.id, provider, direction, userId);

    // Simulate sync completion (in real implementation, this would be async)
    setTimeout(async () => {
      await sovereignGitEngine.completeSync(log.id, {
        commits: 5,
        files: 12,
        branches: 2,
        tags: 1
      });
    }, 2000);

    res.json({
      success: true,
      message: "Sync started | بدأت المزامنة",
      data: log
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/repos/:id/sync/history", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const history = await sovereignGitEngine.getSyncHistory(req.params.id, limit);

    res.json({
      success: true,
      message: "Sync history retrieved | تم استرجاع سجل المزامنة",
      data: history
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ File Operations ============

router.get("/repos/:id/files", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const branch = req.query.branch as string || 'main';
    const directory = req.query.dir as string | undefined;
    const files = await sovereignGitEngine.listFiles(req.params.id, branch, directory);

    res.json({
      success: true,
      message: "Files retrieved | تم استرجاع الملفات",
      data: files
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/repos/:id/files/*", requireAuth, rateLimit, async (req: Request, res: Response) => {
  try {
    const branch = req.query.branch as string || 'main';
    const path = req.params[0];
    const file = await sovereignGitEngine.getFile(req.params.id, branch, path);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found | الملف غير موجود"
      });
    }

    res.json({ success: true, data: file });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

console.log("[SovereignGit] Routes initialized | تم تهيئة مسارات Git السيادي");

export default router;
