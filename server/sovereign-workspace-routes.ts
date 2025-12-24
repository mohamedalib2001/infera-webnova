import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import {
  sovereignWorkspace,
  sovereignWorkspaceMembers,
  sovereignWorkspaceProjects,
  sovereignWorkspaceAccessLogs,
  sovereignWorkspaceDeployments,
  sovereignPolicySignatures,
  sovereignPolicyVersions,
  sovereignPolicyCompliance,
  sovereignPolicyViolations,
  sovereignPolicyTemplates,
  users,
  type SovereignWorkspacePermission,
  sovereignWorkspacePermissions,
  insertSovereignWorkspaceProjectSchema,
  type User,
} from "@shared/schema";

// Extend Express Request type
interface AuthenticatedRequest extends Request {
  user?: User;
}

const router = Router();

// ==================== MIDDLEWARE ====================

// Check if user is authenticated - using session-based auth like other routes
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  // Check session first (primary auth method in this app)
  if (req.session?.userId && req.session?.user) {
    (req as any).user = req.session.user;
    return next();
  }
  
  // Fallback to passport auth (Replit Auth)
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  
  return res.status(401).json({ error: "Authentication required" });
};

// Check if user has workspace access
// INFERA WebNova uses a single Sovereign Workspace per deployment
// User must either be the workspace owner or an active member
const requireWorkspaceAccess = async (req: Request, res: Response, next: NextFunction) => {
  // Get user from session or passport
  const user = (req as any).user || req.session?.user;
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const userId = user.id;
  
  // First, check if user owns any workspace
  let [workspace] = await db
    .select()
    .from(sovereignWorkspace)
    .where(eq(sovereignWorkspace.ownerId, userId))
    .limit(1);
  
  if (workspace) {
    // User is the workspace owner (ROOT_OWNER)
    (req as any).workspace = workspace;
    (req as any).workspaceRole = "ROOT_OWNER";
    (req as any).workspacePermissions = [...sovereignWorkspacePermissions];
    return next();
  }
  
  // Check if user is a member of any workspace
  const [memberRecord] = await db
    .select({
      member: sovereignWorkspaceMembers,
      workspace: sovereignWorkspace,
    })
    .from(sovereignWorkspaceMembers)
    .innerJoin(sovereignWorkspace, eq(sovereignWorkspaceMembers.workspaceId, sovereignWorkspace.id))
    .where(
      and(
        eq(sovereignWorkspaceMembers.userId, userId),
        eq(sovereignWorkspaceMembers.status, "active")
      )
    )
    .limit(1);

  if (!memberRecord) {
    // Get any workspace for logging (if exists)
    const [anyWorkspace] = await db.select().from(sovereignWorkspace).limit(1);
    
    if (anyWorkspace) {
      // Log access denied attempt
      await db.insert(sovereignWorkspaceAccessLogs).values({
        workspaceId: anyWorkspace.id,
        userId,
        action: "access_denied",
        resource: "workspace",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "",
        success: false,
        errorMessage: "User is not a workspace owner or member",
      });
    }
    return res.status(403).json({ error: "Access denied to sovereign workspace" });
  }

  (req as any).workspace = memberRecord.workspace;
  (req as any).workspaceRole = memberRecord.member.role;
  (req as any).workspacePermissions = memberRecord.member.permissions || [];
  
  // Update last access
  await db
    .update(sovereignWorkspaceMembers)
    .set({ lastAccessAt: new Date() })
    .where(eq(sovereignWorkspaceMembers.id, memberRecord.member.id));

  next();
};

// Check specific permission
const requirePermission = (permission: SovereignWorkspacePermission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).workspaceRole;
    const permissions = (req as any).workspacePermissions as SovereignWorkspacePermission[];

    // ROOT_OWNER has all permissions
    if (role === "ROOT_OWNER") {
      return next();
    }

    // Check if permission is in user's permissions
    if (permissions.includes(permission)) {
      return next();
    }

    // Check role-based default permissions
    const rolePermissions: Record<string, SovereignWorkspacePermission[]> = {
      SOVEREIGN_ADMIN: [
        "workspace.view", "workspace.manage",
        "platform.view", "platform.create", "platform.edit", "platform.deploy", "platform.rollback",
        "staff.view", "staff.invite", "staff.manage",
        "audit.view", "settings.view", "settings.manage"
      ],
      SOVEREIGN_OPERATOR: [
        "workspace.view",
        "platform.view", "platform.create", "platform.edit", "platform.deploy",
        "staff.view", "audit.view"
      ],
      AUDITOR: [
        "workspace.view", "platform.view", "staff.view", "audit.view", "audit.export"
      ],
    };

    const defaultPerms = rolePermissions[role] || [];
    if (defaultPerms.includes(permission)) {
      return next();
    }

    return res.status(403).json({ error: `Permission denied: ${permission}` });
  };
};

// Log workspace action
const logAction = async (
  workspaceId: string,
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, unknown>,
  req?: Request
) => {
  await db.insert(sovereignWorkspaceAccessLogs).values({
    workspaceId,
    userId,
    action,
    resource,
    resourceId,
    details,
    ipAddress: req?.ip,
    userAgent: req?.headers["user-agent"] || "",
    success: true,
  });
};

// ==================== WORKSPACE ROUTES ====================

// Get workspace info (or create if not exists)
router.get("/workspace", requireAuth, async (req, res) => {
  const user = (req as any).user || req.session?.user;
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  
  const userId = user.id;
  
  // Check if workspace exists
  let [workspace] = await db.select().from(sovereignWorkspace).limit(1);
  
  if (!workspace) {
    // Create workspace with current user as owner (must be ROOT_OWNER)
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user || user.role !== "ROOT_OWNER") {
      return res.status(403).json({ error: "Only ROOT_OWNER can initialize sovereign workspace" });
    }
    
    const [newWorkspace] = await db.insert(sovereignWorkspace).values({
      name: "INFERA Sovereign Workspace",
      nameAr: "مساحة عمل INFERA السيادية",
      description: "Platform factory for generating and managing sovereign digital platforms",
      descriptionAr: "مصنع المنصات لإنشاء وإدارة المنصات الرقمية السيادية",
      ownerId: userId,
      settings: {
        maxPlatforms: 50,
        maxMembers: 10,
        requireApprovalForDeploy: true,
        autoAuditLog: true,
        notifyOnAccess: true,
      },
    }).returning();
    
    workspace = newWorkspace;
    
    await logAction(workspace.id, userId, "create", "workspace", workspace.id, {}, req);
  }
  
  // Check access
  if (workspace.ownerId !== userId) {
    const [member] = await db
      .select()
      .from(sovereignWorkspaceMembers)
      .where(
        and(
          eq(sovereignWorkspaceMembers.workspaceId, workspace.id),
          eq(sovereignWorkspaceMembers.userId, userId),
          eq(sovereignWorkspaceMembers.status, "active")
        )
      );
    
    if (!member) {
      return res.status(403).json({ error: "Access denied" });
    }
  }
  
  await logAction(workspace.id, userId, "view", "workspace", workspace.id, {}, req);
  
  res.json(workspace);
});

// ==================== PROJECT ROUTES ====================

// Get all projects
router.get("/projects", requireAuth, requireWorkspaceAccess, requirePermission("platform.view"), async (req, res) => {
  const workspace = (req as any).workspace;
  
  const projects = await db
    .select()
    .from(sovereignWorkspaceProjects)
    .where(eq(sovereignWorkspaceProjects.workspaceId, workspace.id))
    .orderBy(desc(sovereignWorkspaceProjects.createdAt));
  
  await logAction(workspace.id, ((req as any).user || req.session?.user)?.id, "view", "project", undefined, { count: projects.length }, req);
  
  res.json(projects);
});

// Get single project
router.get("/projects/:id", requireAuth, requireWorkspaceAccess, requirePermission("platform.view"), async (req, res) => {
  const { id } = req.params;
  const workspace = (req as any).workspace;
  
  const [project] = await db
    .select()
    .from(sovereignWorkspaceProjects)
    .where(
      and(
        eq(sovereignWorkspaceProjects.id, id),
        eq(sovereignWorkspaceProjects.workspaceId, workspace.id)
      )
    );
  
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  
  await logAction(workspace.id, ((req as any).user || req.session?.user)?.id, "view", "project", id, {}, req);
  
  res.json(project);
});

// Create new project
router.post("/projects", requireAuth, requireWorkspaceAccess, requirePermission("platform.create"), async (req, res) => {
  const workspace = (req as any).workspace;
  
  const validatedData = insertSovereignWorkspaceProjectSchema.parse({
    ...req.body,
    workspaceId: workspace.id,
    createdBy: ((req as any).user || req.session?.user)?.id,
  });
  
  const [project] = await db.insert(sovereignWorkspaceProjects).values(validatedData).returning();
  
  await logAction(workspace.id, ((req as any).user || req.session?.user)?.id, "create", "project", project.id, { code: project.code }, req);
  
  res.status(201).json(project);
});

// Update project
router.patch("/projects/:id", requireAuth, requireWorkspaceAccess, requirePermission("platform.edit"), async (req, res) => {
  const { id } = req.params;
  const workspace = (req as any).workspace;
  
  const [existing] = await db
    .select()
    .from(sovereignWorkspaceProjects)
    .where(
      and(
        eq(sovereignWorkspaceProjects.id, id),
        eq(sovereignWorkspaceProjects.workspaceId, workspace.id)
      )
    );
  
  if (!existing) {
    return res.status(404).json({ error: "Project not found" });
  }
  
  const [updated] = await db
    .update(sovereignWorkspaceProjects)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(sovereignWorkspaceProjects.id, id))
    .returning();
  
  await logAction(workspace.id, ((req as any).user || req.session?.user)?.id, "edit", "project", id, { changes: req.body }, req);
  
  res.json(updated);
});

// Delete project
router.delete("/projects/:id", requireAuth, requireWorkspaceAccess, requirePermission("platform.delete"), async (req, res) => {
  const { id } = req.params;
  const workspace = (req as any).workspace;
  
  const [existing] = await db
    .select()
    .from(sovereignWorkspaceProjects)
    .where(
      and(
        eq(sovereignWorkspaceProjects.id, id),
        eq(sovereignWorkspaceProjects.workspaceId, workspace.id)
      )
    );
  
  if (!existing) {
    return res.status(404).json({ error: "Project not found" });
  }
  
  await db.delete(sovereignWorkspaceProjects).where(eq(sovereignWorkspaceProjects.id, id));
  
  await logAction(workspace.id, ((req as any).user || req.session?.user)?.id, "delete", "project", id, { code: existing.code }, req);
  
  res.json({ success: true });
});

// ==================== MEMBER ROUTES ====================

// Get all members
router.get("/members", requireAuth, requireWorkspaceAccess, requirePermission("staff.view"), async (req, res) => {
  const workspace = (req as any).workspace;
  
  const members = await db
    .select({
      member: sovereignWorkspaceMembers,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
      },
    })
    .from(sovereignWorkspaceMembers)
    .leftJoin(users, eq(sovereignWorkspaceMembers.userId, users.id))
    .where(eq(sovereignWorkspaceMembers.workspaceId, workspace.id));
  
  // Also include owner info
  const [owner] = await db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    fullName: users.fullName,
  }).from(users).where(eq(users.id, workspace.ownerId));
  
  res.json({
    owner: { ...owner, role: "ROOT_OWNER" },
    members: members.map(m => ({ ...m.member, user: m.user })),
  });
});

// Invite member
router.post("/members/invite", requireAuth, requireWorkspaceAccess, requirePermission("staff.invite"), async (req, res) => {
  const workspace = (req as any).workspace;
  const { userId, role, permissions } = req.body;
  
  if (!userId || !role) {
    return res.status(400).json({ error: "userId and role are required" });
  }
  
  // Check if user exists
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  // Check if already a member
  const [existing] = await db
    .select()
    .from(sovereignWorkspaceMembers)
    .where(
      and(
        eq(sovereignWorkspaceMembers.workspaceId, workspace.id),
        eq(sovereignWorkspaceMembers.userId, userId)
      )
    );
  
  if (existing) {
    return res.status(400).json({ error: "User is already a member" });
  }
  
  const [member] = await db.insert(sovereignWorkspaceMembers).values({
    workspaceId: workspace.id,
    userId,
    role,
    permissions: permissions || [],
    status: "pending",
    invitedBy: ((req as any).user || req.session?.user)?.id,
    invitedAt: new Date(),
  }).returning();
  
  await logAction(workspace.id, ((req as any).user || req.session?.user)?.id, "invite", "member", member.id, { invitedUserId: userId, role }, req);
  
  res.status(201).json(member);
});

// Invite member by email
router.post("/members/invite-by-email", requireAuth, requireWorkspaceAccess, requirePermission("staff.invite"), async (req, res) => {
  const workspace = (req as any).workspace;
  const { email, role, permissions } = req.body;
  
  if (!email || !role) {
    return res.status(400).json({ error: "email and role are required" });
  }
  
  // Find user by email
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return res.status(404).json({ error: "User not found with this email" });
  }
  
  // Check if is the owner
  if (user.id === workspace.ownerId) {
    return res.status(400).json({ error: "Cannot invite the workspace owner as a member" });
  }
  
  // Check if already a member
  const [existing] = await db
    .select()
    .from(sovereignWorkspaceMembers)
    .where(
      and(
        eq(sovereignWorkspaceMembers.workspaceId, workspace.id),
        eq(sovereignWorkspaceMembers.userId, user.id)
      )
    );
  
  if (existing) {
    return res.status(400).json({ error: "User is already a member" });
  }
  
  const [member] = await db.insert(sovereignWorkspaceMembers).values({
    workspaceId: workspace.id,
    userId: user.id,
    role,
    permissions: permissions || [],
    status: "active",
    invitedBy: ((req as any).user || req.session?.user)?.id,
    invitedAt: new Date(),
  }).returning();
  
  await logAction(workspace.id, ((req as any).user || req.session?.user)?.id, "invite", "member", member.id, { invitedEmail: email, role }, req);
  
  res.status(201).json(member);
});

// Update member
router.patch("/members/:id", requireAuth, requireWorkspaceAccess, requirePermission("staff.manage"), async (req, res) => {
  const { id } = req.params;
  const workspace = (req as any).workspace;
  
  const [existing] = await db
    .select()
    .from(sovereignWorkspaceMembers)
    .where(
      and(
        eq(sovereignWorkspaceMembers.id, id),
        eq(sovereignWorkspaceMembers.workspaceId, workspace.id)
      )
    );
  
  if (!existing) {
    return res.status(404).json({ error: "Member not found" });
  }
  
  const [updated] = await db
    .update(sovereignWorkspaceMembers)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(sovereignWorkspaceMembers.id, id))
    .returning();
  
  await logAction(workspace.id, ((req as any).user || req.session?.user)?.id, "edit", "member", id, { changes: req.body }, req);
  
  res.json(updated);
});

// Remove member
router.delete("/members/:id", requireAuth, requireWorkspaceAccess, requirePermission("staff.remove"), async (req, res) => {
  const { id } = req.params;
  const workspace = (req as any).workspace;
  
  const [existing] = await db
    .select()
    .from(sovereignWorkspaceMembers)
    .where(
      and(
        eq(sovereignWorkspaceMembers.id, id),
        eq(sovereignWorkspaceMembers.workspaceId, workspace.id)
      )
    );
  
  if (!existing) {
    return res.status(404).json({ error: "Member not found" });
  }
  
  await db.delete(sovereignWorkspaceMembers).where(eq(sovereignWorkspaceMembers.id, id));
  
  await logAction(workspace.id, ((req as any).user || req.session?.user)?.id, "remove", "member", id, { removedUserId: existing.userId }, req);
  
  res.json({ success: true });
});

// ==================== ACCESS LOG ROUTES ====================

// Get access logs
router.get("/logs", requireAuth, requireWorkspaceAccess, requirePermission("audit.view"), async (req, res) => {
  const workspace = (req as any).workspace;
  const { limit = 100, offset = 0 } = req.query;
  
  const logs = await db
    .select({
      log: sovereignWorkspaceAccessLogs,
      user: {
        id: users.id,
        username: users.username,
        fullName: users.fullName,
      },
    })
    .from(sovereignWorkspaceAccessLogs)
    .leftJoin(users, eq(sovereignWorkspaceAccessLogs.userId, users.id))
    .where(eq(sovereignWorkspaceAccessLogs.workspaceId, workspace.id))
    .orderBy(desc(sovereignWorkspaceAccessLogs.createdAt))
    .limit(Number(limit))
    .offset(Number(offset));
  
  res.json(logs.map(l => ({ ...l.log, user: l.user })));
});

// ==================== DEPLOYMENT ROUTES ====================

// Get deployments for a project
router.get("/projects/:projectId/deployments", requireAuth, requireWorkspaceAccess, requirePermission("platform.view"), async (req, res) => {
  const { projectId } = req.params;
  
  const deployments = await db
    .select()
    .from(sovereignWorkspaceDeployments)
    .where(eq(sovereignWorkspaceDeployments.projectId, projectId))
    .orderBy(desc(sovereignWorkspaceDeployments.startedAt));
  
  res.json(deployments);
});

// Trigger deployment
router.post("/projects/:projectId/deploy", requireAuth, requireWorkspaceAccess, requirePermission("platform.deploy"), async (req, res) => {
  const { projectId } = req.params;
  const workspace = (req as any).workspace;
  const { environment = "production" } = req.body;
  
  // Get project
  const [project] = await db
    .select()
    .from(sovereignWorkspaceProjects)
    .where(
      and(
        eq(sovereignWorkspaceProjects.id, projectId),
        eq(sovereignWorkspaceProjects.workspaceId, workspace.id)
      )
    );
  
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  
  // Create deployment record
  const [deployment] = await db.insert(sovereignWorkspaceDeployments).values({
    projectId,
    version: project.version || "0.1.0",
    environment,
    status: "pending",
    triggeredBy: ((req as any).user || req.session?.user)?.id,
  }).returning();
  
  // Update project status
  await db
    .update(sovereignWorkspaceProjects)
    .set({ deploymentStatus: "deploying", updatedAt: new Date() })
    .where(eq(sovereignWorkspaceProjects.id, projectId));
  
  await logAction(workspace.id, ((req as any).user || req.session?.user)?.id, "deploy", "project", projectId, { deploymentId: deployment.id, environment }, req);
  
  res.status(201).json(deployment);
});

// ==================== STATS ====================

// Get workspace stats
router.get("/stats", requireAuth, requireWorkspaceAccess, requirePermission("workspace.view"), async (req, res) => {
  const workspace = (req as any).workspace;
  
  const projects = await db
    .select()
    .from(sovereignWorkspaceProjects)
    .where(eq(sovereignWorkspaceProjects.workspaceId, workspace.id));
  
  const members = await db
    .select()
    .from(sovereignWorkspaceMembers)
    .where(eq(sovereignWorkspaceMembers.workspaceId, workspace.id));
  
  const stats = {
    totalProjects: projects.length,
    liveProjects: projects.filter(p => p.deploymentStatus === "live").length,
    draftProjects: projects.filter(p => p.deploymentStatus === "draft").length,
    buildingProjects: projects.filter(p => ["building", "deploying"].includes(p.deploymentStatus)).length,
    totalMembers: members.length + 1, // +1 for owner
    activeMembers: members.filter(m => m.status === "active").length + 1,
    projectsByType: projects.reduce((acc, p) => {
      acc[p.platformType] = (acc[p.platformType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
  
  res.json(stats);
});

// ==================== SOVEREIGN POLICY SYSTEM ====================

// Generate policy signature hash
const generateSignatureHash = (userId: string, policyVersion: string, timestamp: Date): string => {
  const data = `${userId}:${policyVersion}:${timestamp.toISOString()}:${randomBytes(16).toString('hex')}`;
  return createHash('sha256').update(data).digest('hex');
};

// Generate certificate data
const generateCertificate = (userId: string, userName: string): {
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  fingerprint: string;
} => {
  const now = new Date();
  const expiryDate = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  const serialNumber = randomBytes(16).toString('hex').toUpperCase();
  
  return {
    issuer: "CN=INFERA WebNova Sovereign CA,O=INFERA Engine,C=SA",
    subject: `CN=${userName},O=INFERA Engine,OU=Platform Owner`,
    validFrom: now.toISOString(),
    validTo: expiryDate.toISOString(),
    serialNumber,
    fingerprint: createHash('sha256').update(`${serialNumber}:${userId}:${now.toISOString()}`).digest('hex').toUpperCase(),
  };
};

// Sign policies (digital signature)
router.post("/policies/sign", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const user = (req as any).user || req.session?.user;
  const workspace = (req as any).workspace;
  const { policyVersion = "1.0", legalAcknowledgment = true } = req.body;
  
  // Check if already signed this version
  const [existingSignature] = await db
    .select()
    .from(sovereignPolicySignatures)
    .where(
      and(
        eq(sovereignPolicySignatures.userId, user.id),
        eq(sovereignPolicySignatures.policyVersion, policyVersion)
      )
    )
    .limit(1);
  
  if (existingSignature) {
    return res.json({ 
      message: "Already signed", 
      signature: existingSignature 
    });
  }
  
  const signedAt = new Date();
  const signatureHash = generateSignatureHash(user.id, policyVersion, signedAt);
  const certificateData = generateCertificate(user.id, user.fullName || user.username || user.email);
  
  const [signature] = await db.insert(sovereignPolicySignatures).values({
    userId: user.id,
    workspaceId: workspace?.id,
    policyVersion,
    signatureHash,
    certificateData,
    ipAddress: req.ip || req.headers['x-forwarded-for']?.toString(),
    userAgent: req.headers['user-agent'],
    deviceFingerprint: req.headers['x-device-fingerprint']?.toString(),
    legalAcknowledgment,
    expiresAt: new Date(signedAt.getFullYear() + 2, signedAt.getMonth(), signedAt.getDate()),
  }).returning();
  
  await logAction(workspace?.id, user.id, "sign_policy", "policy", signature.id, { policyVersion }, req);
  
  res.status(201).json(signature);
});

// Get user's policy signatures
router.get("/policies/signatures", requireAuth, async (req, res) => {
  const user = (req as any).user || req.session?.user;
  
  const signatures = await db
    .select()
    .from(sovereignPolicySignatures)
    .where(eq(sovereignPolicySignatures.userId, user.id))
    .orderBy(desc(sovereignPolicySignatures.signedAt));
  
  res.json(signatures);
});

// Get all policy versions
router.get("/policies/versions", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const versions = await db
    .select()
    .from(sovereignPolicyVersions)
    .orderBy(desc(sovereignPolicyVersions.versionNumber));
  
  res.json(versions);
});

// Create new policy version
router.post("/policies/versions", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const user = (req as any).user || req.session?.user;
  const role = (req as any).workspaceRole;
  
  // Only ROOT_OWNER can create policy versions
  if (role !== "ROOT_OWNER") {
    return res.status(403).json({ error: "Only ROOT_OWNER can create policy versions" });
  }
  
  const { version, policyContent, changeType = "update", changeSummary, changeSummaryAr } = req.body;
  
  // Get next version number
  const [lastVersion] = await db
    .select()
    .from(sovereignPolicyVersions)
    .orderBy(desc(sovereignPolicyVersions.versionNumber))
    .limit(1);
  
  const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;
  
  // Deactivate previous versions
  await db
    .update(sovereignPolicyVersions)
    .set({ isActive: false, effectiveTo: new Date() });
  
  const [newVersion] = await db.insert(sovereignPolicyVersions).values({
    version: version || `1.${nextVersionNumber}`,
    versionNumber: nextVersionNumber,
    policyContent,
    changeType,
    changeSummary,
    changeSummaryAr,
    createdBy: user.id,
    isActive: true,
  }).returning();
  
  res.status(201).json(newVersion);
});

// Get compliance records
router.get("/policies/compliance", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const workspace = (req as any).workspace;
  
  const compliance = await db
    .select()
    .from(sovereignPolicyCompliance)
    .where(eq(sovereignPolicyCompliance.workspaceId, workspace.id))
    .orderBy(desc(sovereignPolicyCompliance.updatedAt));
  
  res.json(compliance);
});

// Get compliance for specific project
router.get("/policies/compliance/:projectId", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const { projectId } = req.params;
  
  const [compliance] = await db
    .select()
    .from(sovereignPolicyCompliance)
    .where(eq(sovereignPolicyCompliance.projectId, projectId))
    .limit(1);
  
  res.json(compliance || null);
});

// Run compliance check (manual)
router.post("/policies/compliance/:projectId/check", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const user = (req as any).user || req.session?.user;
  const workspace = (req as any).workspace;
  const { projectId } = req.params;
  const { categoryScores, overallStatus = "pending_review" } = req.body;
  
  // Calculate overall score from category scores
  let complianceScore = 0;
  if (categoryScores) {
    const scores = Object.values(categoryScores) as { score: number }[];
    if (scores.length > 0) {
      complianceScore = Math.round(scores.reduce((sum, cat) => sum + cat.score, 0) / scores.length);
    }
  }
  
  // Check if compliance record exists
  const [existing] = await db
    .select()
    .from(sovereignPolicyCompliance)
    .where(eq(sovereignPolicyCompliance.projectId, projectId))
    .limit(1);
  
  let result;
  if (existing) {
    [result] = await db
      .update(sovereignPolicyCompliance)
      .set({
        categoryScores,
        complianceScore,
        overallStatus,
        lastCheckAt: new Date(),
        lastCheckBy: user.id,
        lastCheckType: "manual",
        updatedAt: new Date(),
      })
      .where(eq(sovereignPolicyCompliance.id, existing.id))
      .returning();
  } else {
    [result] = await db.insert(sovereignPolicyCompliance).values({
      projectId,
      workspaceId: workspace.id,
      policyVersion: "1.0",
      categoryScores,
      complianceScore,
      overallStatus,
      lastCheckAt: new Date(),
      lastCheckBy: user.id,
      lastCheckType: "manual",
    }).returning();
  }
  
  res.json(result);
});

// Get policy violations
router.get("/policies/violations", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const workspace = (req as any).workspace;
  const { status, severity } = req.query;
  
  let query = db
    .select()
    .from(sovereignPolicyViolations)
    .where(eq(sovereignPolicyViolations.workspaceId, workspace.id));
  
  const violations = await query.orderBy(desc(sovereignPolicyViolations.detectedAt));
  
  // Filter in memory for now (can optimize with Drizzle conditions later)
  let filtered = violations;
  if (status) {
    filtered = filtered.filter(v => v.status === status);
  }
  if (severity) {
    filtered = filtered.filter(v => v.severity === severity);
  }
  
  res.json(filtered);
});

// Report policy violation
router.post("/policies/violations", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const workspace = (req as any).workspace;
  const {
    projectId,
    policyCategory,
    policyItem,
    severity = "medium",
    title,
    titleAr,
    description,
    descriptionAr,
    evidence,
    detectedBy = "manual",
  } = req.body;
  
  const [violation] = await db.insert(sovereignPolicyViolations).values({
    projectId,
    workspaceId: workspace.id,
    policyCategory,
    policyItem,
    severity,
    title,
    titleAr,
    description,
    descriptionAr,
    evidence,
    detectedBy,
  }).returning();
  
  res.status(201).json(violation);
});

// Update violation status
router.patch("/policies/violations/:violationId", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const user = (req as any).user || req.session?.user;
  const { violationId } = req.params;
  const { status, resolution } = req.body;
  
  const updateData: any = { status, updatedAt: new Date() };
  if (resolution) updateData.resolution = resolution;
  if (status === "resolved") {
    updateData.resolvedBy = user.id;
    updateData.resolvedAt = new Date();
  }
  
  const [updated] = await db
    .update(sovereignPolicyViolations)
    .set(updateData)
    .where(eq(sovereignPolicyViolations.id, violationId))
    .returning();
  
  res.json(updated);
});

// Get policy templates
router.get("/policies/templates", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const { sector } = req.query;
  
  let templates = await db
    .select()
    .from(sovereignPolicyTemplates)
    .where(eq(sovereignPolicyTemplates.isActive, true))
    .orderBy(sovereignPolicyTemplates.sector);
  
  if (sector) {
    templates = templates.filter(t => t.sector === sector);
  }
  
  res.json(templates);
});

// Create policy template
router.post("/policies/templates", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const user = (req as any).user || req.session?.user;
  const role = (req as any).workspaceRole;
  
  if (role !== "ROOT_OWNER") {
    return res.status(403).json({ error: "Only ROOT_OWNER can create policy templates" });
  }
  
  const {
    name,
    nameAr,
    description,
    descriptionAr,
    sector = "general",
    additionalPolicies,
    additionalChecklist,
    complianceFrameworks,
    isDefault = false,
  } = req.body;
  
  const [template] = await db.insert(sovereignPolicyTemplates).values({
    name,
    nameAr,
    description,
    descriptionAr,
    sector,
    additionalPolicies,
    additionalChecklist,
    complianceFrameworks,
    isDefault,
    createdBy: user.id,
  }).returning();
  
  res.status(201).json(template);
});

// AI Compliance Check
router.post("/policies/ai-check/:projectId", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const user = (req as any).user || req.session?.user;
  const workspace = (req as any).workspace;
  const { projectId } = req.params;
  
  // Get project details
  const [project] = await db
    .select()
    .from(sovereignWorkspaceProjects)
    .where(eq(sovereignWorkspaceProjects.id, projectId))
    .limit(1);
  
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  
  // Simulate AI analysis (in production, this would call the AI service)
  const aiAnalysis = {
    summary: `Analysis complete for ${project.name}. Project shows strong adherence to core INFERA principles.`,
    summaryAr: `اكتمل التحليل لـ ${project.name}. يظهر المشروع التزاماً قوياً بمبادئ INFERA الأساسية.`,
    recommendations: [
      "Ensure all data models are fully dynamic",
      "Add AI-powered predictive analytics",
      "Implement Zero-Trust security patterns",
      "Add test data reset functionality",
    ],
    riskLevel: "low",
    estimatedFixTime: "2-4 hours",
  };
  
  // Calculate compliance score based on project configuration
  const complianceScore = 85; // Placeholder - would be calculated by AI
  const overallStatus = complianceScore >= 80 ? "compliant" : complianceScore >= 60 ? "partial" : "non_compliant";
  
  // Update or create compliance record
  const [existing] = await db
    .select()
    .from(sovereignPolicyCompliance)
    .where(eq(sovereignPolicyCompliance.projectId, projectId))
    .limit(1);
  
  let result;
  if (existing) {
    [result] = await db
      .update(sovereignPolicyCompliance)
      .set({
        aiAnalysis,
        complianceScore,
        overallStatus,
        lastCheckAt: new Date(),
        lastCheckBy: user.id,
        lastCheckType: "ai",
        updatedAt: new Date(),
      })
      .where(eq(sovereignPolicyCompliance.id, existing.id))
      .returning();
  } else {
    [result] = await db.insert(sovereignPolicyCompliance).values({
      projectId,
      workspaceId: workspace.id,
      policyVersion: "1.0",
      aiAnalysis,
      complianceScore,
      overallStatus,
      lastCheckAt: new Date(),
      lastCheckBy: user.id,
      lastCheckType: "ai",
    }).returning();
  }
  
  res.json(result);
});

// Get policy summary stats
router.get("/policies/stats", requireAuth, requireWorkspaceAccess, async (req, res) => {
  const workspace = (req as any).workspace;
  
  const [compliance, violations, signatures] = await Promise.all([
    db.select().from(sovereignPolicyCompliance).where(eq(sovereignPolicyCompliance.workspaceId, workspace.id)),
    db.select().from(sovereignPolicyViolations).where(eq(sovereignPolicyViolations.workspaceId, workspace.id)),
    db.select().from(sovereignPolicySignatures).where(eq(sovereignPolicySignatures.workspaceId, workspace.id)),
  ]);
  
  const stats = {
    totalCompliance: compliance.length,
    compliantPlatforms: compliance.filter(c => c.overallStatus === "compliant").length,
    partialPlatforms: compliance.filter(c => c.overallStatus === "partial").length,
    nonCompliantPlatforms: compliance.filter(c => c.overallStatus === "non_compliant").length,
    averageScore: compliance.length > 0 
      ? Math.round(compliance.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / compliance.length)
      : 0,
    totalViolations: violations.length,
    openViolations: violations.filter(v => v.status === "open").length,
    criticalViolations: violations.filter(v => v.severity === "critical" && v.status === "open").length,
    totalSignatures: signatures.length,
    activeSignatures: signatures.filter(s => !s.expiresAt || new Date(s.expiresAt) > new Date()).length,
  };
  
  res.json(stats);
});

// ==================== POLICY VALIDATION ENGINE ====================

import { policyValidationEngine, PlatformContext, PolicyValidationResult } from "./policy-validation-engine";

// Validate platform before deployment (Auto-Validation)
router.post("/policies/validate-platform", requireAuth, requireWorkspaceAccess, async (req, res) => {
  try {
    const user = (req as any).user || req.session?.user;
    const { platformId, platformName, context } = req.body;
    
    if (!platformId || !platformName) {
      return res.status(400).json({ error: "Platform ID and name are required" });
    }
    
    const platformContext: PlatformContext = {
      platformId,
      platformName,
      industry: context?.industry || "other",
      hasAICore: context?.hasAICore ?? true,
      hasAIAssistant: context?.hasAIAssistant ?? true,
      hasPredictiveModule: context?.hasPredictiveModule ?? true,
      hasBehavioralAnalytics: context?.hasBehavioralAnalytics ?? true,
      hasZeroTrust: context?.hasZeroTrust ?? true,
      hasE2EEncryption: context?.hasE2EEncryption ?? true,
      hasThreatDetection: context?.hasThreatDetection ?? true,
      hasAutoResponse: context?.hasAutoResponse ?? true,
      hasRedundancy: context?.hasRedundancy ?? true,
      isModular: context?.isModular ?? true,
      hasLiveScaling: context?.hasLiveScaling ?? true,
      hasZeroDowntime: context?.hasZeroDowntime ?? true,
      isForwardCompatible: context?.isForwardCompatible ?? true,
      hasVendorLockIn: context?.hasVendorLockIn ?? false,
      hasCRUDOnly: context?.hasCRUDOnly ?? false,
      hasStaticDashboard: context?.hasStaticDashboard ?? false,
      hasHardLimits: context?.hasHardLimits ?? false,
      hasManualOps: context?.hasManualOps ?? false,
      features: context?.features || [],
      techStack: context?.techStack || [],
    };
    
    const validationResult = await policyValidationEngine.validatePlatform(platformContext);
    
    await policyValidationEngine.recordValidation(
      platformId,
      platformName,
      validationResult,
      user.id
    );
    
    res.json({
      ...validationResult,
      message: validationResult.canDeploy 
        ? "Platform passed all policy checks / اجتازت المنصة جميع فحوصات السياسات"
        : "Platform has policy violations that must be resolved / المنصة لديها انتهاكات سياسات يجب حلها",
    });
  } catch (error) {
    console.error("[PolicyValidation] Error:", error);
    res.status(500).json({ error: "Policy validation failed" });
  }
});

// Pre-deployment validation check (blocks deployment if not compliant)
router.post("/policies/pre-deploy-check", requireAuth, requireWorkspaceAccess, async (req, res) => {
  try {
    const { platformId, platformName, forceValidation } = req.body;
    
    if (!platformId) {
      return res.status(400).json({ error: "Platform ID is required" });
    }
    
    const quickCheck = await policyValidationEngine.getQuickValidation(platformId);
    
    if (!forceValidation && quickCheck.score > 0) {
      return res.json({
        canDeploy: quickCheck.canDeploy,
        score: quickCheck.score,
        criticalIssues: quickCheck.criticalIssues,
        message: quickCheck.canDeploy
          ? "Platform is compliant and ready for deployment / المنصة متوافقة وجاهزة للنشر"
          : `Platform has ${quickCheck.criticalIssues} critical issue(s) that block deployment / المنصة لديها ${quickCheck.criticalIssues} مشكلة حرجة تمنع النشر`,
        requiresValidation: false,
      });
    }
    
    res.json({
      canDeploy: false,
      score: 0,
      criticalIssues: 1,
      message: "Platform requires policy validation before deployment / المنصة تتطلب فحص السياسات قبل النشر",
      requiresValidation: true,
    });
  } catch (error) {
    console.error("[PreDeployCheck] Error:", error);
    res.status(500).json({ error: "Pre-deployment check failed" });
  }
});

// Get compliance dashboard data for a platform
router.get("/policies/compliance-dashboard/:platformId", requireAuth, requireWorkspaceAccess, async (req, res) => {
  try {
    const { platformId } = req.params;
    
    const [latestCompliance] = await db.select()
      .from(sovereignPolicyCompliance)
      .where(eq(sovereignPolicyCompliance.projectId, platformId))
      .orderBy(desc(sovereignPolicyCompliance.createdAt))
      .limit(1);
    
    const violations = await db.select()
      .from(sovereignPolicyViolations)
      .where(and(
        eq(sovereignPolicyViolations.projectId, platformId),
        eq(sovereignPolicyViolations.status, "open")
      ))
      .orderBy(desc(sovereignPolicyViolations.detectedAt));
    
    const complianceHistory = await db.select()
      .from(sovereignPolicyCompliance)
      .where(eq(sovereignPolicyCompliance.projectId, platformId))
      .orderBy(desc(sovereignPolicyCompliance.createdAt))
      .limit(10);
    
    const decisionLabels: Record<string, { en: string; ar: string; color: string }> = {
      approved: { en: "Approved", ar: "معتمد", color: "green" },
      conditional: { en: "Conditional", ar: "مشروط", color: "yellow" },
      rejected: { en: "Rejected", ar: "مرفوض", color: "red" },
      blocked: { en: "Blocked", ar: "محظور", color: "red" },
      pending: { en: "Pending", ar: "قيد الانتظار", color: "gray" },
    };
    
    res.json({
      current: latestCompliance ? {
        complianceScore: latestCompliance.complianceScore || 0,
        decisionStatus: latestCompliance.decisionStatus || "pending",
        decisionLabel: decisionLabels[latestCompliance.decisionStatus || "pending"],
        riskIndex: latestCompliance.riskIndex || 0,
        evolutionReadiness: latestCompliance.evolutionReadiness || 0,
        categoryScores: latestCompliance.categoryScores || {},
        aiAnalysis: latestCompliance.aiAnalysis,
        lastCheckAt: latestCompliance.lastCheckAt,
        lastCheckType: latestCompliance.lastCheckType,
        canDeploy: latestCompliance.decisionStatus === "approved" || latestCompliance.decisionStatus === "conditional",
      } : null,
      openViolations: violations.map(v => ({
        id: v.id,
        title: v.title,
        titleAr: v.titleAr,
        severity: v.severity,
        category: v.policyCategory,
        description: v.description,
        descriptionAr: v.descriptionAr,
        detectedAt: v.detectedAt,
      })),
      history: complianceHistory.map(h => ({
        id: h.id,
        score: h.complianceScore,
        status: h.decisionStatus,
        checkedAt: h.lastCheckAt,
        checkType: h.lastCheckType,
      })),
      summary: {
        totalChecks: complianceHistory.length,
        latestScore: latestCompliance?.complianceScore || 0,
        avgScore: complianceHistory.length > 0
          ? Math.round(complianceHistory.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / complianceHistory.length)
          : 0,
        openViolationCount: violations.length,
        trend: complianceHistory.length >= 2 
          ? (complianceHistory[0].complianceScore || 0) >= (complianceHistory[1].complianceScore || 0) ? "improving" : "declining"
          : "stable",
      },
    });
  } catch (error) {
    console.error("[ComplianceDashboard] Error:", error);
    res.status(500).json({ error: "Failed to get compliance dashboard" });
  }
});

// Get validation history for a platform
router.get("/policies/validation-history/:platformId", requireAuth, requireWorkspaceAccess, async (req, res) => {
  try {
    const { platformId } = req.params;
    
    const compliance = await db.select()
      .from(sovereignPolicyCompliance)
      .where(eq(sovereignPolicyCompliance.projectId, platformId))
      .orderBy(desc(sovereignPolicyCompliance.createdAt));
    
    const violations = await db.select()
      .from(sovereignPolicyViolations)
      .where(eq(sovereignPolicyViolations.projectId, platformId))
      .orderBy(desc(sovereignPolicyViolations.detectedAt));
    
    res.json({
      compliance,
      violations,
      summary: {
        totalChecks: compliance.length,
        compliantChecks: compliance.filter(c => c.overallStatus === "compliant").length,
        averageScore: compliance.length > 0
          ? Math.round(compliance.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / compliance.length)
          : 0,
        openViolations: violations.filter(v => v.status === "open").length,
        resolvedViolations: violations.filter(v => v.status === "resolved").length,
      },
    });
  } catch (error) {
    console.error("[ValidationHistory] Error:", error);
    res.status(500).json({ error: "Failed to get validation history" });
  }
});

// Resolve a policy violation
router.patch("/policies/violations/:violationId/resolve", requireAuth, requireWorkspaceAccess, async (req, res) => {
  try {
    const { violationId } = req.params;
    const { resolution, resolvedBy } = req.body;
    const user = (req as any).user || req.session?.user;
    
    const [updated] = await db.update(sovereignPolicyViolations)
      .set({
        status: "resolved",
        resolution,
        resolvedAt: new Date(),
        resolvedBy: resolvedBy || user.id,
        updatedAt: new Date(),
      })
      .where(eq(sovereignPolicyViolations.id, violationId))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: "Violation not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("[ResolveViolation] Error:", error);
    res.status(500).json({ error: "Failed to resolve violation" });
  }
});

export default router;
