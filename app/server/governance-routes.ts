/**
 * Governance Routes - Platform Compliance API
 * ROOT_OWNER only access with audit logging
 */

import { Router, Request, Response } from "express";
import { runComplianceScan, getComplianceStatus } from "./compliance-scanner";
import { db } from "./db";
import { auditLogs as auditLogsTable } from "@shared/schema";

const router = Router();

// Middleware to verify ROOT_OWNER access
const requireOwner = (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  // Allow ROOT_OWNER (id: 1) or sovereign role
  if (user.id !== 1 && user.role !== "sovereign" && user.role !== "owner") {
    return res.status(403).json({ error: "ROOT_OWNER access required" });
  }
  next();
};

// GET /api/governance/compliance-check
router.get("/compliance-check", requireOwner, async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.refresh === "true";
    const result = await runComplianceScan(forceRefresh);

    // Audit log the scan
    await db.insert(auditLogsTable).values({
      action: "GOVERNANCE_COMPLIANCE_SCAN",
      userId: (req as any).user?.id || 1,
      details: JSON.stringify({
        totalFiles: result.totalFiles,
        violations: result.summary.violations,
        warnings: result.summary.warnings,
        compliant: result.summary.compliant,
        timestamp: result.timestamp,
      }),
      ipAddress: req.ip || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
    }).catch(() => {});

    return res.json(result.violations);
  } catch (error) {
    console.error("Compliance scan error:", error);
    return res.status(500).json({ error: "Scan failed" });
  }
});

// GET /api/governance/status
router.get("/status", async (_req: Request, res: Response) => {
  try {
    const status = getComplianceStatus();
    return res.json({ status });
  } catch (error) {
    return res.status(500).json({ error: "Status check failed" });
  }
});

// GET /api/governance/policy
router.get("/policy", (_req: Request, res: Response) => {
  return res.json({
    version: "1.0",
    status: "mandatory",
    limits: {
      page: 400,
      component: 300,
      hook: 200,
      service: 250,
      util: 150,
    },
    performance: {
      firstLoad: "< 2.5s",
      jsExecution: "< 1s",
      maxRerenders: 3,
    },
    rules: [
      "Pages are coordinators only - no business logic",
      "Heavy components require lazy loading",
      "Lists > 100 items require virtualization",
      "No monolithic files - single responsibility",
    ],
  });
});

export default router;
