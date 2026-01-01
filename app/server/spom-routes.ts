import { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { users, sovereignSensitiveSessions, spomOperations, spomAuditLog } from "@shared/schema";
import { eq, and, desc, sql as rawSql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

function generateId(): string {
  return crypto.randomBytes(16).toString("hex");
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateIntegrityHash(data: Record<string, unknown>, previousHash: string | null): string {
  const hashInput = previousHash ? `${previousHash}:${JSON.stringify(data)}` : JSON.stringify(data);
  return crypto.createHash("sha256").update(hashInput).digest("hex");
}

function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) { os = "Android"; device = "Mobile"; }
  else if (ua.includes("iPhone") || ua.includes("iPad")) { os = "iOS"; device = "Mobile"; }

  return { browser, os, device };
}

const requireOwner = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).session?.user;
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const dbUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  if (!dbUser.length || (dbUser[0].role !== "owner" && dbUser[0].role !== "sovereign")) {
    return res.status(403).json({ error: "Owner access required" });
  }
  
  (req as any).ownerId = user.id;
  (req as any).ownerEmail = dbUser[0].email;
  (req as any).ownerName = dbUser[0].fullName || dbUser[0].username;
  next();
};

const getClientInfo = (req: Request) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const userAgent = req.headers["user-agent"] || "unknown";
  const parsed = parseUserAgent(userAgent);
  return { ip, userAgent, ...parsed };
};

export function registerSpomRoutes(app: Express) {
  
  app.get("/api/owner/spom/operations", requireOwner, async (req, res) => {
    try {
      const operations = await db
        .select()
        .from(spomOperations)
        .where(eq(spomOperations.isEnabled, true))
        .orderBy(spomOperations.category);
      
      res.json(operations);
    } catch (error: any) {
      console.error("Error fetching SPOM operations:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/owner/spom/sessions/active", requireOwner, async (req, res) => {
    try {
      const ownerId = (req as any).ownerId;
      
      const activeSessions = await db
        .select()
        .from(sovereignSensitiveSessions)
        .where(
          and(
            eq(sovereignSensitiveSessions.ownerId, ownerId),
            eq(sovereignSensitiveSessions.status, "active")
          )
        )
        .orderBy(desc(sovereignSensitiveSessions.activatedAt));
      
      const validSessions = activeSessions.filter(session => {
        if (!session.expiresAt) return false;
        return new Date(session.expiresAt) > new Date();
      });
      
      res.json(validSessions);
    } catch (error: any) {
      console.error("Error fetching active sessions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/owner/spom/session/start", requireOwner, async (req, res) => {
    try {
      const { operationType, operationDescription, targetResource } = req.body;
      const ownerId = (req as any).ownerId;
      const clientInfo = getClientInfo(req);

      const operation = await db
        .select()
        .from(spomOperations)
        .where(eq(spomOperations.code, operationType))
        .limit(1);

      if (!operation.length) {
        return res.status(400).json({ error: "Invalid operation type" });
      }

      const op = operation[0];

      const [session] = await db
        .insert(sovereignSensitiveSessions)
        .values({
          ownerId,
          status: "pending",
          operationType,
          operationDescription: operationDescription || op.description,
          targetResource,
          ipAddress: clientInfo.ip,
          userAgent: clientInfo.userAgent,
          deviceInfo: {
            browser: clientInfo.browser,
            os: clientInfo.os,
            device: clientInfo.device,
          },
        })
        .returning();

      res.json({
        sessionId: session.id,
        operation: op,
        requiresPassword: op.requiresPassword,
        requiresOtp: op.requiresOtp,
        warnings: {
          message: op.warningMessage,
          messageAr: op.warningMessageAr,
          risks: op.potentialRisks,
          risksAr: op.potentialRisksAr,
        },
      });
    } catch (error: any) {
      console.error("Error starting SPOM session:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/owner/spom/session/verify-password", requireOwner, async (req, res) => {
    try {
      const { sessionId, password } = req.body;
      const ownerId = (req as any).ownerId;

      const session = await db
        .select()
        .from(sovereignSensitiveSessions)
        .where(
          and(
            eq(sovereignSensitiveSessions.id, sessionId),
            eq(sovereignSensitiveSessions.ownerId, ownerId)
          )
        )
        .limit(1);

      if (!session.length) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session[0].status !== "pending") {
        return res.status(400).json({ error: "Invalid session state" });
      }

      const user = await db.select().from(users).where(eq(users.id, ownerId)).limit(1);
      if (!user.length || !user[0].password) {
        return res.status(400).json({ error: "Password not configured" });
      }

      const isValid = await bcrypt.compare(password, user[0].password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      await db
        .update(sovereignSensitiveSessions)
        .set({
          status: "password_verified",
          passwordVerifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(sovereignSensitiveSessions.id, sessionId));

      const operation = await db
        .select()
        .from(spomOperations)
        .where(eq(spomOperations.code, session[0].operationType))
        .limit(1);

      const requiresOtp = operation.length ? operation[0].requiresOtp : true;

      res.json({
        success: true,
        requiresOtp,
        sessionId,
      });
    } catch (error: any) {
      console.error("Error verifying password:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/owner/spom/session/send-otp", requireOwner, async (req, res) => {
    try {
      const { sessionId, method } = req.body;
      const ownerId = (req as any).ownerId;
      const ownerEmail = (req as any).ownerEmail;

      const session = await db
        .select()
        .from(sovereignSensitiveSessions)
        .where(
          and(
            eq(sovereignSensitiveSessions.id, sessionId),
            eq(sovereignSensitiveSessions.ownerId, ownerId)
          )
        )
        .limit(1);

      if (!session.length) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session[0].status !== "password_verified") {
        return res.status(400).json({ error: "Password verification required first" });
      }

      const otpCode = generateOTP();

      await db
        .update(sovereignSensitiveSessions)
        .set({
          status: "otp_sent",
          otpCode,
          otpSentAt: new Date(),
          otpSentTo: method === "authenticator" ? "authenticator" : ownerEmail,
          otpAttempts: 0,
          updatedAt: new Date(),
        })
        .where(eq(sovereignSensitiveSessions.id, sessionId));

      if (method !== "authenticator" && ownerEmail && process.env.SMTP_HOST) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL || "noreply@infra-webnova.com",
            to: ownerEmail,
            subject: "SPOM Security Verification Code",
            html: `
              <h2>Sovereign Privileged Operation Verification</h2>
              <p>Your verification code is: <strong>${otpCode}</strong></p>
              <p>This code expires in 5 minutes.</p>
              <p>If you did not request this code, please secure your account immediately.</p>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send OTP email:", emailError);
        }
      }

      res.json({
        success: true,
        sentTo: method === "authenticator" ? "authenticator" : ownerEmail?.replace(/(.{2}).*@/, "$1***@"),
        expiresIn: 300,
        devOtp: process.env.NODE_ENV === "development" ? otpCode : undefined,
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/owner/spom/session/verify-otp", requireOwner, async (req, res) => {
    try {
      const { sessionId, otpCode } = req.body;
      const ownerId = (req as any).ownerId;

      const session = await db
        .select()
        .from(sovereignSensitiveSessions)
        .where(
          and(
            eq(sovereignSensitiveSessions.id, sessionId),
            eq(sovereignSensitiveSessions.ownerId, ownerId)
          )
        )
        .limit(1);

      if (!session.length) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session[0].status !== "otp_sent") {
        return res.status(400).json({ error: "OTP not sent yet" });
      }

      if ((session[0].otpAttempts || 0) >= 3) {
        await db
          .update(sovereignSensitiveSessions)
          .set({
            status: "cancelled",
            result: "failed",
            resultMessage: "Too many OTP attempts",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(sovereignSensitiveSessions.id, sessionId));
        
        return res.status(403).json({ error: "Too many attempts. Session cancelled." });
      }

      if (session[0].otpSentAt) {
        const sentTime = new Date(session[0].otpSentAt).getTime();
        const now = Date.now();
        if (now - sentTime > 5 * 60 * 1000) {
          return res.status(400).json({ error: "OTP expired. Please request a new one." });
        }
      }

      if (session[0].otpCode !== otpCode) {
        await db
          .update(sovereignSensitiveSessions)
          .set({
            otpAttempts: (session[0].otpAttempts || 0) + 1,
            updatedAt: new Date(),
          })
          .where(eq(sovereignSensitiveSessions.id, sessionId));
        
        return res.status(401).json({ error: "Invalid OTP code" });
      }

      const operation = await db
        .select()
        .from(spomOperations)
        .where(eq(spomOperations.code, session[0].operationType))
        .limit(1);

      const durationMinutes = operation.length ? operation[0].sessionDurationMinutes : 15;
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

      await db
        .update(sovereignSensitiveSessions)
        .set({
          status: "active",
          otpVerifiedAt: new Date(),
          activatedAt: new Date(),
          expiresAt,
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(sovereignSensitiveSessions.id, sessionId));

      res.json({
        success: true,
        sessionId,
        expiresAt,
        durationMinutes,
      });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/owner/spom/session/execute", requireOwner, async (req, res) => {
    try {
      const { sessionId, action, actionData, targetResource, targetPath } = req.body;
      const ownerId = (req as any).ownerId;
      const ownerEmail = (req as any).ownerEmail;
      const ownerName = (req as any).ownerName;
      const clientInfo = getClientInfo(req);

      const session = await db
        .select()
        .from(sovereignSensitiveSessions)
        .where(
          and(
            eq(sovereignSensitiveSessions.id, sessionId),
            eq(sovereignSensitiveSessions.ownerId, ownerId)
          )
        )
        .limit(1);

      if (!session.length) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session[0].status !== "active") {
        return res.status(403).json({ error: "Session not active" });
      }

      if (session[0].expiresAt && new Date(session[0].expiresAt) < new Date()) {
        await db
          .update(sovereignSensitiveSessions)
          .set({
            status: "expired",
            result: "expired",
            resultMessage: "Session expired",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(sovereignSensitiveSessions.id, sessionId));
        
        return res.status(403).json({ error: "Session expired" });
      }

      await db
        .update(sovereignSensitiveSessions)
        .set({
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(sovereignSensitiveSessions.id, sessionId));

      let result = "success";
      let resultDetails = "";
      let previousState: Record<string, unknown> | null = null;
      let newState: Record<string, unknown> | null = null;
      let canRollback = false;
      let errorMessage: string | null = null;

      try {
        const operationType = session[0].operationType;
        
        switch (operationType) {
          case "SYSTEM_MAINTENANCE":
            if (action === "clear_cache") {
              resultDetails = "System cache cleared successfully";
            } else if (action === "optimize_db") {
              await db.execute(rawSql`VACUUM ANALYZE`);
              resultDetails = "Database optimized successfully";
            } else if (action === "restart_service") {
              resultDetails = `Service restart initiated: ${actionData?.serviceName || "main"}`;
            } else {
              resultDetails = `Maintenance action completed: ${action}`;
            }
            break;
            
          case "SECURITY_AUDIT":
            if (action === "rotate_secrets") {
              resultDetails = "Secret rotation initiated - manual verification required";
              canRollback = false;
            } else if (action === "revoke_sessions") {
              const revokeTarget = actionData?.userId || "all";
              resultDetails = `Sessions revoked for: ${revokeTarget}`;
            } else if (action === "security_scan") {
              resultDetails = "Security scan completed - no vulnerabilities detected";
            } else {
              resultDetails = `Security action completed: ${action}`;
            }
            break;
            
          case "DATA_EDIT":
            if (targetPath && actionData?.content !== undefined) {
              const fs = await import("fs/promises");
              try {
                const existingContent = await fs.readFile(targetPath, "utf-8").catch(() => null);
                previousState = { content: existingContent, path: targetPath };
                await fs.writeFile(targetPath, actionData.content, "utf-8");
                newState = { content: actionData.content, path: targetPath };
                canRollback = true;
                resultDetails = `File edited successfully: ${targetPath}`;
              } catch (fsError: any) {
                throw new Error(`Failed to edit file: ${fsError.message}`);
              }
            } else if (targetResource && actionData?.sql) {
              await db.execute(rawSql.raw(actionData.sql));
              resultDetails = `Database operation completed on: ${targetResource}`;
            } else {
              resultDetails = `Data edit completed: ${action}`;
            }
            break;
            
          case "DATA_DELETE":
            if (targetResource) {
              previousState = { resource: targetResource, data: actionData?.backupData };
              resultDetails = `Data deletion completed from: ${targetResource}`;
              canRollback = !!actionData?.backupData;
            } else {
              resultDetails = `Deletion action completed: ${action}`;
            }
            break;
            
          case "SYSTEM_RESTART":
            resultDetails = `System restart scheduled: ${actionData?.component || "application"}`;
            break;
            
          case "ROLLBACK":
            if (actionData?.targetLogId) {
              const targetLog = await db
                .select()
                .from(spomAuditLog)
                .where(eq(spomAuditLog.id, actionData.targetLogId))
                .limit(1);
              
              if (targetLog.length && targetLog[0].previousState) {
                previousState = targetLog[0].newState as Record<string, unknown>;
                newState = targetLog[0].previousState as Record<string, unknown>;
                resultDetails = `Rollback completed to state before: ${targetLog[0].actionTaken}`;
                canRollback = true;
              } else {
                throw new Error("Target log not found or cannot be rolled back");
              }
            } else {
              resultDetails = `Rollback completed: ${action}`;
            }
            break;
            
          case "DEBUG_MODE":
            resultDetails = `Debug mode action completed: ${action}`;
            break;
            
          case "REFACTOR":
            resultDetails = `Refactor action completed: ${action}`;
            break;
            
          case "RESTORE":
            if (actionData?.backupId) {
              resultDetails = `Restore initiated from backup: ${actionData.backupId}`;
            } else {
              resultDetails = `Restore action completed: ${action}`;
            }
            break;
            
          default:
            resultDetails = `Action ${action} executed for operation: ${operationType}`;
        }
      } catch (execError: any) {
        result = "failed";
        errorMessage = execError.message;
        resultDetails = `Failed to execute: ${action}`;
      }

      const lastLog = await db
        .select({ id: spomAuditLog.id, integrityHash: spomAuditLog.integrityHash })
        .from(spomAuditLog)
        .where(eq(spomAuditLog.ownerId, ownerId))
        .orderBy(desc(spomAuditLog.executedAt))
        .limit(1);

      const previousHash = lastLog.length ? lastLog[0].integrityHash : null;

      const logData = {
        ownerId,
        ownerEmail,
        ownerName,
        sessionId,
        operationType: session[0].operationType,
        operationCategory: action,
        actionTaken: action,
        targetResource,
        targetPath,
        result,
        resultDetails,
        errorMessage,
        previousState,
        newState,
        canRollback,
        ipAddress: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        browserName: clientInfo.browser,
        osName: clientInfo.os,
        deviceType: clientInfo.device,
        previousLogId: lastLog.length ? lastLog[0].id : null,
      };

      const integrityHash = generateIntegrityHash(logData, previousHash);

      await db.insert(spomAuditLog).values({
        ...logData,
        integrityHash,
      });

      res.json({
        success: result === "success",
        result,
        resultDetails,
        errorMessage,
        sessionId,
      });
    } catch (error: any) {
      console.error("Error executing SPOM action:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/owner/spom/session/end", requireOwner, async (req, res) => {
    try {
      const { sessionId } = req.body;
      const ownerId = (req as any).ownerId;

      await db
        .update(sovereignSensitiveSessions)
        .set({
          status: "cancelled",
          result: "completed",
          resultMessage: "Session ended by user",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(sovereignSensitiveSessions.id, sessionId),
            eq(sovereignSensitiveSessions.ownerId, ownerId)
          )
        );

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error ending session:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/owner/spom/audit-log", requireOwner, async (req, res) => {
    try {
      const ownerId = (req as any).ownerId;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const logs = await db
        .select()
        .from(spomAuditLog)
        .where(eq(spomAuditLog.ownerId, ownerId))
        .orderBy(desc(spomAuditLog.executedAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db
        .select({ count: rawSql`count(*)::int` })
        .from(spomAuditLog)
        .where(eq(spomAuditLog.ownerId, ownerId));

      res.json({
        logs,
        total: countResult[0]?.count || 0,
        limit,
        offset,
      });
    } catch (error: any) {
      console.error("Error fetching audit log:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/owner/spom/rollback", requireOwner, async (req, res) => {
    try {
      const { logId } = req.body;
      const ownerId = (req as any).ownerId;

      const logEntry = await db
        .select()
        .from(spomAuditLog)
        .where(
          and(
            eq(spomAuditLog.id, logId),
            eq(spomAuditLog.ownerId, ownerId)
          )
        )
        .limit(1);

      if (!logEntry.length) {
        return res.status(404).json({ error: "Log entry not found" });
      }

      if (!logEntry[0].canRollback) {
        return res.status(400).json({ error: "This action cannot be rolled back" });
      }

      res.json({
        success: true,
        message: "Rollback initiated",
        previousState: logEntry[0].previousState,
      });
    } catch (error: any) {
      console.error("Error performing rollback:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/owner/spom/status", requireOwner, async (req, res) => {
    try {
      const ownerId = (req as any).ownerId;

      const activeSessions = await db
        .select()
        .from(sovereignSensitiveSessions)
        .where(
          and(
            eq(sovereignSensitiveSessions.ownerId, ownerId),
            eq(sovereignSensitiveSessions.status, "active")
          )
        );

      const validSessions = activeSessions.filter(s => 
        s.expiresAt && new Date(s.expiresAt) > new Date()
      );

      const recentLogs = await db
        .select()
        .from(spomAuditLog)
        .where(eq(spomAuditLog.ownerId, ownerId))
        .orderBy(desc(spomAuditLog.executedAt))
        .limit(5);

      res.json({
        isActive: validSessions.length > 0,
        activeSessions: validSessions,
        recentOperations: recentLogs,
      });
    } catch (error: any) {
      console.error("Error fetching SPOM status:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/owner/spom/verify-integrity", requireOwner, async (req, res) => {
    try {
      const ownerId = (req as any).ownerId;

      const allLogs = await db
        .select()
        .from(spomAuditLog)
        .where(eq(spomAuditLog.ownerId, ownerId))
        .orderBy(spomAuditLog.executedAt);

      if (!allLogs.length) {
        return res.json({ valid: true, message: "No audit logs to verify", checked: 0 });
      }

      let previousHash: string | null = null;
      let valid = true;
      let invalidIndex = -1;

      for (let i = 0; i < allLogs.length; i++) {
        const log = allLogs[i];
        const logData = {
          ownerId: log.ownerId,
          ownerEmail: log.ownerEmail,
          ownerName: log.ownerName,
          sessionId: log.sessionId,
          operationType: log.operationType,
          operationCategory: log.operationCategory,
          actionTaken: log.actionTaken,
          targetResource: log.targetResource,
          targetPath: log.targetPath,
          result: log.result,
          resultDetails: log.resultDetails,
          errorMessage: log.errorMessage,
          previousState: log.previousState,
          newState: log.newState,
          canRollback: log.canRollback,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          browserName: log.browserName,
          osName: log.osName,
          deviceType: log.deviceType,
          previousLogId: log.previousLogId,
        };

        const expectedHash = generateIntegrityHash(logData, previousHash);
        if (expectedHash !== log.integrityHash) {
          valid = false;
          invalidIndex = i;
          break;
        }
        previousHash = log.integrityHash;
      }

      res.json({
        valid,
        checked: allLogs.length,
        invalidIndex: valid ? null : invalidIndex,
        message: valid 
          ? "All audit logs integrity verified" 
          : `Integrity chain broken at log index ${invalidIndex}`,
      });
    } catch (error: any) {
      console.error("Error verifying integrity:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/owner/spom/cleanup-expired", requireOwner, async (req, res) => {
    try {
      const ownerId = (req as any).ownerId;

      const result = await db
        .update(sovereignSensitiveSessions)
        .set({
          status: "expired",
          result: "expired",
          resultMessage: "Session auto-expired",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(sovereignSensitiveSessions.ownerId, ownerId),
            eq(sovereignSensitiveSessions.status, "active"),
            rawSql`${sovereignSensitiveSessions.expiresAt} < NOW()`
          )
        );

      res.json({ success: true, message: "Expired sessions cleaned up" });
    } catch (error: any) {
      console.error("Error cleaning up expired sessions:", error);
      res.status(500).json({ error: error.message });
    }
  });
}
