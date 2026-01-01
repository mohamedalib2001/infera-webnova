/**
 * Version Control Routes - مسارات إدارة التغييرات والتاريخ
 * 
 * API endpoints for:
 * - Snapshot management
 * - Version history
 * - Diff comparison
 * - Rollback operations
 */

import { Router, Request, Response } from "express";
import { versionControlService } from "../services/version-control-service";

const router = Router();

// Middleware for authentication check
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }
  next();
};

/**
 * POST /api/versions/snapshot/:repositoryId
 * Create a new snapshot
 */
router.post("/snapshot/:repositoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const { name, description } = req.body;
    const author = (req.user as any)?.email || 'system';

    if (!name) {
      return res.status(400).json({ success: false, error: "Snapshot name required" });
    }

    const snapshot = await versionControlService.createSnapshot(
      repositoryId,
      name,
      description || '',
      author
    );

    res.json({ success: true, data: snapshot });
  } catch (error: any) {
    console.error("[VersionControl] Create snapshot error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/versions/original/:repositoryId
 * Create original snapshot from Replit import
 */
router.post("/original/:repositoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const { files } = req.body;
    const author = (req.user as any)?.email || 'system';

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ success: false, error: "Files array required" });
    }

    const snapshot = await versionControlService.createOriginalSnapshot(
      repositoryId,
      files,
      author
    );

    res.json({ success: true, data: snapshot });
  } catch (error: any) {
    console.error("[VersionControl] Create original snapshot error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/versions/snapshots/:repositoryId
 * Get all snapshots for a repository
 */
router.get("/snapshots/:repositoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const snapshots = await versionControlService.getSnapshots(repositoryId);

    res.json({ success: true, data: snapshots });
  } catch (error: any) {
    console.error("[VersionControl] Get snapshots error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/versions/timeline/:repositoryId
 * Get repository timeline
 */
router.get("/timeline/:repositoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const timeline = await versionControlService.getTimeline(repositoryId);

    res.json({ success: true, data: timeline });
  } catch (error: any) {
    console.error("[VersionControl] Get timeline error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/versions/history/:repositoryId/:filePath
 * Get file version history
 */
router.get("/history/:repositoryId/*", requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const filePath = req.params[0];
    
    const history = await versionControlService.getFileHistory(repositoryId, filePath);

    res.json({ success: true, data: history });
  } catch (error: any) {
    console.error("[VersionControl] Get file history error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/versions/record/:repositoryId
 * Record a file change
 */
router.post("/record/:repositoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const { filePath, newContent, previousContent, message } = req.body;
    const author = (req.user as any)?.email || 'system';

    if (!filePath || newContent === undefined) {
      return res.status(400).json({ success: false, error: "File path and content required" });
    }

    const version = await versionControlService.recordChange(
      repositoryId,
      filePath,
      newContent,
      previousContent || null,
      message || 'File updated',
      author
    );

    res.json({ success: true, data: version });
  } catch (error: any) {
    console.error("[VersionControl] Record change error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/versions/compare/:repositoryId
 * Compare two snapshots
 */
router.post("/compare/:repositoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const { sourceId, targetId } = req.body;

    if (!sourceId || !targetId) {
      return res.status(400).json({ success: false, error: "Source and target IDs required" });
    }

    const diff = await versionControlService.compareVersions(repositoryId, sourceId, targetId);

    res.json({ success: true, data: diff });
  } catch (error: any) {
    console.error("[VersionControl] Compare error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/versions/compare-original/:repositoryId
 * Compare current version with original Replit import
 */
router.get("/compare-original/:repositoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const diff = await versionControlService.compareWithOriginal(repositoryId);

    res.json({ success: true, data: diff });
  } catch (error: any) {
    console.error("[VersionControl] Compare with original error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/versions/rollback/:repositoryId
 * Rollback to a snapshot
 */
router.post("/rollback/:repositoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const { snapshotId } = req.body;
    const author = (req.user as any)?.email || 'system';

    if (!snapshotId) {
      return res.status(400).json({ success: false, error: "Snapshot ID required" });
    }

    const result = await versionControlService.rollbackToSnapshot(
      repositoryId,
      snapshotId,
      author
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[VersionControl] Rollback error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/versions/rollback-file/:repositoryId
 * Rollback a specific file to a version
 */
router.post("/rollback-file/:repositoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const { filePath, versionId } = req.body;
    const author = (req.user as any)?.email || 'system';

    if (!filePath || !versionId) {
      return res.status(400).json({ success: false, error: "File path and version ID required" });
    }

    const result = await versionControlService.rollbackFile(
      repositoryId,
      filePath,
      versionId,
      author
    );

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[VersionControl] Rollback file error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/versions/stats/:repositoryId
 * Get version statistics
 */
router.get("/stats/:repositoryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { repositoryId } = req.params;
    const stats = await versionControlService.getVersionStats(repositoryId);

    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error("[VersionControl] Get stats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
