import { Router, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import {
  sovereignWorkspace,
  sovereignWorkspaceMembers,
  sovereignWorkspaceProjects,
  sovereignWorkspaceAccessLogs,
  sovereignWorkspaceDeployments,
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
  
  await logAction(workspace.id, req.user!.id, "view", "project", undefined, { count: projects.length }, req);
  
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
  
  await logAction(workspace.id, req.user!.id, "view", "project", id, {}, req);
  
  res.json(project);
});

// Create new project
router.post("/projects", requireAuth, requireWorkspaceAccess, requirePermission("platform.create"), async (req, res) => {
  const workspace = (req as any).workspace;
  
  const validatedData = insertSovereignWorkspaceProjectSchema.parse({
    ...req.body,
    workspaceId: workspace.id,
    createdBy: req.user!.id,
  });
  
  const [project] = await db.insert(sovereignWorkspaceProjects).values(validatedData).returning();
  
  await logAction(workspace.id, req.user!.id, "create", "project", project.id, { code: project.code }, req);
  
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
  
  await logAction(workspace.id, req.user!.id, "edit", "project", id, { changes: req.body }, req);
  
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
  
  await logAction(workspace.id, req.user!.id, "delete", "project", id, { code: existing.code }, req);
  
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
    invitedBy: req.user!.id,
    invitedAt: new Date(),
  }).returning();
  
  await logAction(workspace.id, req.user!.id, "invite", "member", member.id, { invitedUserId: userId, role }, req);
  
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
    invitedBy: req.user!.id,
    invitedAt: new Date(),
  }).returning();
  
  await logAction(workspace.id, req.user!.id, "invite", "member", member.id, { invitedEmail: email, role }, req);
  
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
  
  await logAction(workspace.id, req.user!.id, "edit", "member", id, { changes: req.body }, req);
  
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
  
  await logAction(workspace.id, req.user!.id, "remove", "member", id, { removedUserId: existing.userId }, req);
  
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
    triggeredBy: req.user!.id,
  }).returning();
  
  // Update project status
  await db
    .update(sovereignWorkspaceProjects)
    .set({ deploymentStatus: "deploying", updatedAt: new Date() })
    .where(eq(sovereignWorkspaceProjects.id, projectId));
  
  await logAction(workspace.id, req.user!.id, "deploy", "project", projectId, { deploymentId: deployment.id, environment }, req);
  
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

export default router;
