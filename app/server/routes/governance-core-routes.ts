/**
 * INFERA WebNova - Governance Core API Routes
 * مسارات API لنواة الحوكمة واتخاذ القرار
 * 
 * SECURITY: Actor identity is ALWAYS derived from authenticated session
 * Client-provided actor data is REJECTED to prevent privilege escalation
 */

import { Router, Request, Response, NextFunction } from "express";
import { governanceEngine, type Actor, type Sector, type ActionType, type GovernanceContext, type ActorRole } from "../lib/governance-core-engine";
import { randomUUID } from "crypto";

const router = Router();
const ROOT_OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

// In-memory storage for approvals and audit logs (could be moved to DB)
const pendingApprovals: Map<string, { id: string; context: GovernanceContext; requiredApprovers: string[]; approvedBy: string[]; status: 'pending' | 'approved' | 'rejected'; createdAt: string }> = new Map();
const auditLogs: { id: string; actor: Actor; action: string; resource: string; decision: string; timestamp: string; details: any }[] = [];

// Helper: Derive actor from session (NEVER trust client-provided actor)
function deriveActorFromSession(req: Request): Actor {
  const session = req.session as any;
  const email = session?.user?.email || '';
  const isRootOwner = email === ROOT_OWNER_EMAIL;
  
  // Determine role based on session data
  let role: ActorRole = 'guest';
  if (isRootOwner) {
    role = 'root_owner';
  } else if (session?.user?.role) {
    role = session.user.role as ActorRole;
  } else if (session?.user?.email) {
    role = 'user';
  }
  
  // Get base permissions from role template (enforced server-side)
  const rolePermissions = governanceEngine.getPermissionTemplate(role);
  
  return {
    id: session?.user?.id || randomUUID(),
    email,
    role,
    organizationId: session?.user?.organizationId || 'default',
    permissions: rolePermissions?.basePermissions || [],
    metadata: { sessionId: session?.id }
  };
}

// Helper: Add audit log
function addAuditLog(actor: Actor, action: string, resource: string, decision: string, details?: any) {
  auditLogs.push({
    id: randomUUID(),
    actor,
    action,
    resource,
    decision,
    timestamp: new Date().toISOString(),
    details
  });
  // Keep last 1000 entries
  if (auditLogs.length > 1000) {
    auditLogs.shift();
  }
}

// Rate limiting with cleanup
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60000;

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Middleware: Auth check
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  if (!session?.user?.email) {
    return res.status(401).json({ 
      success: false, 
      error: "Authentication required | يتطلب تسجيل الدخول" 
    });
  }
  next();
}

// Middleware: Owner check
function requireOwner(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  if (session?.user?.email !== ROOT_OWNER_EMAIL) {
    return res.status(403).json({ 
      success: false, 
      error: "Owner access only | وصول المالك فقط" 
    });
  }
  next();
}

// Middleware: Rate limiting
function rateLimit(req: Request, res: Response, next: NextFunction) {
  cleanupExpiredEntries();
  const session = req.session as any;
  const key = session?.user?.email || req.ip || 'anonymous';
  const now = Date.now();
  
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }
  
  if (record.count >= RATE_LIMIT) {
    return res.status(429).json({ 
      success: false, 
      error: "Rate limit exceeded | تم تجاوز حد الطلبات" 
    });
  }
  
  record.count++;
  next();
}

// ==================== Decision Evaluation ====================

router.post("/evaluate", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { action, resource, resourceType, sector, organizationId, metadata, simulateRole } = req.body;
    
    // SECURITY: Derive session actor first
    const sessionActor = deriveActorFromSession(req);
    
    // For SIMULATION: Allow owner to test decisions for other roles using server-side templates
    // The actor identity is constructed from templates, NOT trusted from client
    let evaluationActor: Actor;
    if (simulateRole && simulateRole !== 'root_owner') {
      const template = governanceEngine.getPermissionTemplate(simulateRole as ActorRole);
      evaluationActor = {
        id: `simulated-${simulateRole}-${randomUUID()}`,
        email: `simulated.${simulateRole}@test.local`,
        role: simulateRole as ActorRole,
        organizationId: organizationId || 'default',
        permissions: template?.basePermissions || [],
        metadata: { isSimulation: true, requestedBy: sessionActor.email }
      };
    } else {
      evaluationActor = sessionActor;
    }
    
    if (!action || !resource || !sector) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: action, resource, sector | حقول مطلوبة: الإجراء، المورد، القطاع"
      });
    }

    const context: GovernanceContext = {
      actor: evaluationActor,
      action: action as ActionType,
      resource,
      resourceType: resourceType || 'platform',
      sector: sector as Sector,
      organizationId: organizationId || evaluationActor.organizationId || 'default',
      metadata: { ...metadata, isSimulation: !!simulateRole },
      timestamp: new Date().toISOString()
    };

    const decision = await governanceEngine.evaluateAction(context);
    
    // Log the decision (note if simulation)
    addAuditLog(sessionActor, action, resource, decision.result, { 
      sector, 
      decision,
      isSimulation: !!simulateRole,
      simulatedRole: simulateRole
    });
    
    // Handle pending approval (only for real evaluations, not simulations)
    if (!simulateRole && decision.result === 'pending_approval' && decision.requiredApprovals) {
      const approvalId = randomUUID();
      pendingApprovals.set(approvalId, {
        id: approvalId,
        context,
        requiredApprovers: decision.requiredApprovals,
        approvedBy: [],
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: {
        ...decision,
        isSimulation: !!simulateRole,
        simulatedRole: simulateRole
      },
      message: `Decision: ${decision.result} | القرار: ${decision.reasonAr}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Quick evaluation endpoints - Support simulation for testing via simulateRole
// Helper to build actor for quick checks
function buildActorForQuickCheck(req: Request, simulateRole?: string): Actor {
  const sessionActor = deriveActorFromSession(req);
  if (simulateRole && simulateRole !== 'root_owner') {
    const template = governanceEngine.getPermissionTemplate(simulateRole as ActorRole);
    return {
      id: `simulated-${simulateRole}-${randomUUID()}`,
      email: `simulated.${simulateRole}@test.local`,
      role: simulateRole as ActorRole,
      organizationId: sessionActor.organizationId,
      permissions: template?.basePermissions || [],
      metadata: { isSimulation: true }
    };
  }
  return sessionActor;
}

router.post("/can-build", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { sector, resource, simulateRole } = req.body;
    const sessionActor = deriveActorFromSession(req);
    const actor = buildActorForQuickCheck(req, simulateRole);
    const decision = await governanceEngine.canBuild(actor, sector as Sector, resource);
    addAuditLog(sessionActor, 'can-build', resource, decision.result, { simulateRole });
    res.json({ success: true, data: { ...decision, isSimulation: !!simulateRole } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/can-deploy", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { sector, resource, simulateRole } = req.body;
    const sessionActor = deriveActorFromSession(req);
    const actor = buildActorForQuickCheck(req, simulateRole);
    const decision = await governanceEngine.canDeploy(actor, sector as Sector, resource);
    addAuditLog(sessionActor, 'can-deploy', resource, decision.result, { simulateRole });
    res.json({ success: true, data: { ...decision, isSimulation: !!simulateRole } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/can-modify", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { sector, resource, simulateRole } = req.body;
    const sessionActor = deriveActorFromSession(req);
    const actor = buildActorForQuickCheck(req, simulateRole);
    const decision = await governanceEngine.canModify(actor, sector as Sector, resource);
    addAuditLog(sessionActor, 'can-modify', resource, decision.result, { simulateRole });
    res.json({ success: true, data: { ...decision, isSimulation: !!simulateRole } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/can-delete", requireAuth, requireOwner, rateLimit, async (req: Request, res: Response) => {
  try {
    const { sector, resource, simulateRole } = req.body;
    const sessionActor = deriveActorFromSession(req);
    const actor = buildActorForQuickCheck(req, simulateRole);
    const decision = await governanceEngine.canDelete(actor, sector as Sector, resource);
    addAuditLog(sessionActor, 'can-delete', resource, decision.result, { simulateRole });
    res.json({ success: true, data: { ...decision, isSimulation: !!simulateRole } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== Policy Management ====================

router.get("/policies", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const policies = governanceEngine.getAllPolicies();
    res.json({ success: true, data: policies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/policies/sector/:sector", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const sector = req.params.sector as Sector;
    const policies = governanceEngine.getPoliciesBySector(sector);
    res.json({ success: true, data: policies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/policies/:id", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const policy = governanceEngine.getPolicy(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, error: "Policy not found" });
    }
    res.json({ success: true, data: policy });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/policies", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const { name, nameAr, description, descriptionAr, sector, targetRoles, actions, effect, conditions, restrictions, requiredApprovals, priority, enabled } = req.body;
    
    if (!name || !sector || !targetRoles || !actions || !effect) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields | حقول مطلوبة ناقصة"
      });
    }

    const policy = governanceEngine.createPolicy({
      name,
      nameAr: nameAr || name,
      description: description || '',
      descriptionAr: descriptionAr || description || '',
      sector,
      targetRoles,
      actions,
      effect,
      conditions: conditions || [],
      restrictions,
      requiredApprovals,
      priority: priority || 500,
      enabled: enabled !== false
    });

    res.status(201).json({
      success: true,
      data: policy,
      message: "Policy created | تم إنشاء السياسة"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/policies/:id", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const policy = governanceEngine.updatePolicy(req.params.id, req.body);
    if (!policy) {
      return res.status(404).json({ success: false, error: "Policy not found" });
    }
    res.json({
      success: true,
      data: policy,
      message: "Policy updated | تم تحديث السياسة"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/policies/:id", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const deleted = governanceEngine.deletePolicy(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Policy not found" });
    }
    res.json({
      success: true,
      message: "Policy deleted | تم حذف السياسة"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== Permission Separation ====================

router.post("/permissions/separate", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const { sector, targetRole } = req.body;
    
    // SECURITY: Derive actor from session
    const sessionActor = deriveActorFromSession(req);
    
    // Allow evaluating permissions for a target role (for testing/simulation)
    const actorToEvaluate: Actor = targetRole ? {
      ...sessionActor,
      role: targetRole as ActorRole,
      permissions: governanceEngine.getPermissionTemplate(targetRole)?.basePermissions || []
    } : sessionActor;
    
    if (!sector) {
      return res.status(400).json({
        success: false,
        error: "Sector required | مطلوب القطاع"
      });
    }

    const separation = governanceEngine.separatePermissions(actorToEvaluate, sector as Sector);
    
    res.json({
      success: true,
      data: separation,
      message: "Permissions separated | تم فصل الصلاحيات"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/permissions/role/:role", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const role = req.params.role as any;
    const sector = (req.query.sector as Sector) || 'general';
    const template = governanceEngine.getPermissionsForRole(role, sector);
    
    if (!template) {
      return res.status(404).json({ success: false, error: "Permission template not found" });
    }
    
    res.json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== Approval Management ====================

router.get("/approvals/pending", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    // Get from both engine and local storage
    const engineApprovals = governanceEngine.getPendingApprovals();
    const localApprovals = Array.from(pendingApprovals.values()).filter(a => a.status === 'pending');
    const allPending = [...engineApprovals, ...localApprovals];
    res.json({ success: true, data: allPending });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/approvals/:id/approve", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    // SECURITY: Derive approver from session
    const approver = deriveActorFromSession(req);
    const approvalId = req.params.id;

    // Check local storage first
    const localApproval = pendingApprovals.get(approvalId);
    if (localApproval) {
      localApproval.approvedBy.push(approver.email);
      if (localApproval.approvedBy.length >= localApproval.requiredApprovers.length) {
        localApproval.status = 'approved';
      }
      addAuditLog(approver, 'approve', approvalId, 'approved');
      return res.json({
        success: true,
        data: localApproval,
        message: "Action approved | تمت الموافقة على الإجراء"
      });
    }

    // Fallback to engine
    const decision = governanceEngine.approveAction(approvalId, approver);
    if (!decision) {
      return res.status(404).json({ success: false, error: "Approval request not found" });
    }

    addAuditLog(approver, 'approve', approvalId, 'approved');
    res.json({
      success: true,
      data: decision,
      message: "Action approved | تمت الموافقة على الإجراء"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/approvals/:id/reject", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const { reason, reasonAr } = req.body;
    const approvalId = req.params.id;
    const rejecter = deriveActorFromSession(req);
    
    // Check local storage first
    const localApproval = pendingApprovals.get(approvalId);
    if (localApproval) {
      localApproval.status = 'rejected';
      addAuditLog(rejecter, 'reject', approvalId, 'rejected', { reason, reasonAr });
      return res.json({
        success: true,
        data: localApproval,
        message: "Action rejected | تم رفض الإجراء"
      });
    }
    
    const decision = governanceEngine.rejectAction(
      approvalId, 
      reason || 'Rejected by owner',
      reasonAr || 'مرفوض من قبل المالك'
    );

    if (!decision) {
      return res.status(404).json({ success: false, error: "Approval request not found" });
    }

    addAuditLog(rejecter, 'reject', approvalId, 'rejected', { reason, reasonAr });
    res.json({
      success: true,
      data: decision,
      message: "Action rejected | تم رفض الإجراء"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== Statistics & Audit ====================

router.get("/stats", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const stats = governanceEngine.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/audit-logs", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Merge engine logs with local logs
    const engineLogs = governanceEngine.getAuditLogs(limit, offset);
    const localLogSlice = auditLogs.slice(-limit).reverse().slice(offset, offset + limit);
    const allLogs = [...localLogSlice, ...engineLogs].slice(0, limit);
    
    res.json({ success: true, data: allLogs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/decisions", requireAuth, requireOwner, rateLimit, (req: Request, res: Response) => {
  try {
    const actorId = req.query.actorId as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const decisions = governanceEngine.getDecisionHistory(actorId, limit);
    res.json({ success: true, data: decisions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
