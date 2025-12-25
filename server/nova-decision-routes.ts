/**
 * Nova Sovereign Decision Engine - API Routes
 * مسارات API لمحرك القرارات السيادية لنوفا
 * 
 * "Sovereign Decision Governor - Not Just an Assistant"
 * "حاكم القرارات السيادي - ليس مجرد مساعد"
 */

import express, { Request, Response, Router } from 'express';
import { z } from 'zod';
import { novaDecisionEngine, DecisionRequest, DecisionPhase, RiskLevel, ApprovalLevel } from './nova-decision-engine';
import { db } from './db';
import { eq, desc, and } from 'drizzle-orm';
import { users, isRootOwner } from '@shared/schema';

// ==================== SOVEREIGN AUTHORITY VALIDATION ====================
// Only ROOT_OWNER and users with 'sovereign' role can perform critical actions

const OWNER_ID = 'ROOT_OWNER';
const SOVEREIGN_ROLES = ['owner', 'sovereign'];

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

async function validateSovereignAuthority(
  userId: string | undefined, 
  requiredRole: 'owner' | 'sovereign' | 'admin' = 'owner'
): Promise<{ valid: boolean; error?: string; errorAr?: string }> {
  if (!userId) {
    return { 
      valid: false, 
      error: 'Authentication required', 
      errorAr: 'المصادقة مطلوبة' 
    };
  }

  // ROOT_OWNER has absolute authority
  if (userId === OWNER_ID || isRootOwner(userId)) {
    return { valid: true };
  }

  // Check user role in database
  try {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user.length) {
      return { 
        valid: false, 
        error: 'User not found', 
        errorAr: 'المستخدم غير موجود' 
      };
    }

    const userRole = user[0].role;

    if (requiredRole === 'owner' && userRole !== 'owner') {
      return { 
        valid: false, 
        error: 'Owner authority required for this action', 
        errorAr: 'صلاحية المالك مطلوبة لهذا الإجراء' 
      };
    }

    if (requiredRole === 'sovereign' && !SOVEREIGN_ROLES.includes(userRole || '')) {
      return { 
        valid: false, 
        error: 'Sovereign authority required for this action', 
        errorAr: 'صلاحية سيادية مطلوبة لهذا الإجراء' 
      };
    }

    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: 'Authority validation failed', 
      errorAr: 'فشل التحقق من الصلاحية' 
    };
  }
}
import { 
  novaSovereignDecisions,
  novaDecisionSteps,
  novaDecisionAudit,
  novaPolicies,
  novaApprovalChains,
  novaKillSwitch,
  novaKnowledgeGraph,
  novaPolicyMemory,
  novaModelLifecycle,
  novaHumanInLoop
} from '@shared/schema';

const router = Router();

// ==================== DECISION ENDPOINTS ====================

// Create new sovereign decision
const createDecisionSchema = z.object({
  type: z.enum(['governance', 'policy', 'resource', 'security', 'financial', 'operational', 'strategic', 'emergency']),
  title: z.string().min(1),
  titleAr: z.string().min(1),
  description: z.string().min(1),
  descriptionAr: z.string().min(1),
  targetPlatform: z.string().optional(),
  targetResource: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  urgency: z.enum(['normal', 'urgent', 'critical']).optional()
});

router.post('/decisions', async (req: Request, res: Response) => {
  try {
    const validation = createDecisionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errorAr: 'فشل التحقق',
        details: validation.error.flatten()
      });
    }

    const request: DecisionRequest = {
      ...validation.data,
      requestedBy: req.body.requestedBy || 'system'
    };

    const decision = await novaDecisionEngine.initiateDecision(request);

    res.status(201).json({
      success: true,
      message: 'Decision created and analysis started',
      messageAr: 'تم إنشاء القرار وبدء التحليل',
      data: decision
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      errorAr: 'حدث خطأ أثناء إنشاء القرار'
    });
  }
});

// Get all pending decisions
router.get('/decisions/pending', async (req: Request, res: Response) => {
  try {
    const decisions = await novaDecisionEngine.getPendingDecisions();
    res.json({
      success: true,
      data: decisions,
      count: decisions.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get decision by ID with full audit trail
router.get('/decisions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const decision = await db.select()
      .from(novaSovereignDecisions)
      .where(eq(novaSovereignDecisions.id, id))
      .limit(1);

    if (!decision.length) {
      return res.status(404).json({
        success: false,
        error: 'Decision not found',
        errorAr: 'لم يتم العثور على القرار'
      });
    }

    const steps = await db.select()
      .from(novaDecisionSteps)
      .where(eq(novaDecisionSteps.decisionId, id))
      .orderBy(novaDecisionSteps.order);

    const auditTrail = await db.select()
      .from(novaDecisionAudit)
      .where(eq(novaDecisionAudit.decisionId, id))
      .orderBy(novaDecisionAudit.timestamp);

    res.json({
      success: true,
      data: {
        decision: decision[0],
        steps,
        auditTrail
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Approve decision - REQUIRES SOVEREIGN AUTHORITY
router.post('/decisions/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approverId, approverRole, notes } = req.body;

    if (!approverId || !approverRole) {
      return res.status(400).json({
        success: false,
        error: 'Approver ID and role are required',
        errorAr: 'معرف ودور المعتمد مطلوبان'
      });
    }

    // SOVEREIGN AUTHORITY VALIDATION
    const authCheck = await validateSovereignAuthority(approverId, approverRole);
    if (!authCheck.valid) {
      return res.status(403).json({
        success: false,
        error: authCheck.error,
        errorAr: authCheck.errorAr
      });
    }

    const result = await novaDecisionEngine.approveDecision(
      id,
      approverId,
      approverRole,
      notes
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reject decision - REQUIRES SOVEREIGN AUTHORITY
router.post('/decisions/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectorId, rejectorRole, reason, reasonAr } = req.body;

    if (!rejectorId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Rejector ID and reason are required',
        errorAr: 'معرف الرافض وسبب الرفض مطلوبان'
      });
    }

    // SOVEREIGN AUTHORITY VALIDATION
    const authCheck = await validateSovereignAuthority(rejectorId, rejectorRole || 'owner');
    if (!authCheck.valid) {
      return res.status(403).json({
        success: false,
        error: authCheck.error,
        errorAr: authCheck.errorAr
      });
    }

    const result = await novaDecisionEngine.rejectDecision(
      id,
      rejectorId,
      rejectorRole || 'owner',
      reason,
      reasonAr || reason
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get decision status summary
router.get('/decisions/summary/status', async (req: Request, res: Response) => {
  try {
    const allDecisions = await db.select().from(novaSovereignDecisions);
    
    const summary = {
      total: allDecisions.length,
      byPhase: {} as Record<string, number>,
      byRisk: {} as Record<string, number>,
      byType: {} as Record<string, number>
    };

    allDecisions.forEach(d => {
      summary.byPhase[d.phase] = (summary.byPhase[d.phase] || 0) + 1;
      summary.byRisk[d.riskLevel] = (summary.byRisk[d.riskLevel] || 0) + 1;
      summary.byType[d.type] = (summary.byType[d.type] || 0) + 1;
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== KILL SWITCH ENDPOINTS ====================

// Activate kill switch - OWNER ONLY (CRITICAL AUTHORITY)
router.post('/kill-switch/activate', async (req: Request, res: Response) => {
  try {
    const { activatedBy, reason, scope, affectedModels } = req.body;

    if (!activatedBy || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Activator ID and reason are required',
        errorAr: 'معرف المنشط وسبب التنشيط مطلوبان'
      });
    }

    // CRITICAL: OWNER-ONLY AUTHORITY VALIDATION
    const authCheck = await validateSovereignAuthority(activatedBy, 'owner');
    if (!authCheck.valid) {
      return res.status(403).json({
        success: false,
        error: 'KILL SWITCH activation requires OWNER authority',
        errorAr: 'تفعيل مفتاح الإيقاف يتطلب صلاحية المالك'
      });
    }

    const result = await novaDecisionEngine.activateKillSwitch(
      activatedBy,
      reason,
      scope || 'global',
      affectedModels
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Deactivate kill switch - OWNER ONLY (CRITICAL AUTHORITY)
router.post('/kill-switch/deactivate', async (req: Request, res: Response) => {
  try {
    const { deactivatedBy } = req.body;

    if (!deactivatedBy) {
      return res.status(400).json({
        success: false,
        error: 'Deactivator ID is required',
        errorAr: 'معرف المعطل مطلوب'
      });
    }

    // CRITICAL: OWNER-ONLY AUTHORITY VALIDATION
    const authCheck = await validateSovereignAuthority(deactivatedBy, 'owner');
    if (!authCheck.valid) {
      return res.status(403).json({
        success: false,
        error: 'KILL SWITCH deactivation requires OWNER authority',
        errorAr: 'إلغاء تفعيل مفتاح الإيقاف يتطلب صلاحية المالك'
      });
    }

    const result = await novaDecisionEngine.deactivateKillSwitch(deactivatedBy);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get kill switch status
router.get('/kill-switch/status', async (req: Request, res: Response) => {
  try {
    const activeSwitch = await db.select()
      .from(novaKillSwitch)
      .where(eq(novaKillSwitch.isActive, true))
      .limit(1);

    res.json({
      success: true,
      data: {
        isActive: activeSwitch.length > 0,
        details: activeSwitch[0] || null
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== POLICY ENDPOINTS ====================

// Create new policy
const createPolicySchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  description: z.string().min(1),
  descriptionAr: z.string().min(1),
  type: z.enum(['constraint', 'limit', 'require', 'deny', 'conditional']),
  scope: z.enum(['global', 'platform', 'resource', 'user']),
  constraints: z.array(z.object({
    id: z.string(),
    type: z.enum(['limit', 'require', 'deny', 'conditional']),
    target: z.string(),
    condition: z.string(),
    value: z.unknown(),
    message: z.string(),
    messageAr: z.string()
  })).optional(),
  priority: z.number().min(0).max(100).optional()
});

router.post('/policies', async (req: Request, res: Response) => {
  try {
    const validation = createPolicySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten()
      });
    }

    const policy = await db.insert(novaPolicies).values({
      ...validation.data,
      createdBy: req.body.createdBy,
      priority: validation.data.priority || 50
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Policy created successfully',
      messageAr: 'تم إنشاء السياسة بنجاح',
      data: policy[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all policies
router.get('/policies', async (req: Request, res: Response) => {
  try {
    const policies = await db.select()
      .from(novaPolicies)
      .where(eq(novaPolicies.isActive, true))
      .orderBy(desc(novaPolicies.priority));

    res.json({
      success: true,
      data: policies,
      count: policies.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== APPROVAL CHAINS ENDPOINTS ====================

// Create approval chain
router.post('/approval-chains', async (req: Request, res: Response) => {
  try {
    const { name, nameAr, levels, decisionTypes, riskLevels } = req.body;

    if (!name || !nameAr || !levels) {
      return res.status(400).json({
        success: false,
        error: 'Name and levels are required',
        errorAr: 'الاسم والمستويات مطلوبة'
      });
    }

    const chain = await db.insert(novaApprovalChains).values({
      name,
      nameAr,
      levels,
      decisionTypes,
      riskLevels,
      isActive: true
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Approval chain created',
      messageAr: 'تم إنشاء سلسلة الموافقات',
      data: chain[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all approval chains
router.get('/approval-chains', async (req: Request, res: Response) => {
  try {
    const chains = await db.select()
      .from(novaApprovalChains)
      .where(eq(novaApprovalChains.isActive, true));

    res.json({
      success: true,
      data: chains
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== HUMAN-IN-THE-LOOP ENDPOINTS ====================

// Get human-in-loop matrix
router.get('/human-in-loop', async (req: Request, res: Response) => {
  try {
    const matrix = await db.select()
      .from(novaHumanInLoop)
      .where(eq(novaHumanInLoop.isActive, true));

    res.json({
      success: true,
      data: matrix
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create human-in-loop rule
router.post('/human-in-loop', async (req: Request, res: Response) => {
  try {
    const rule = await db.insert(novaHumanInLoop).values({
      ...req.body,
      isActive: true
    }).returning();

    res.status(201).json({
      success: true,
      data: rule[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== KNOWLEDGE GRAPH ENDPOINTS ====================

// Add knowledge node
router.post('/knowledge-graph', async (req: Request, res: Response) => {
  try {
    const node = await db.insert(novaKnowledgeGraph).values({
      ...req.body,
      isActive: true
    }).returning();

    res.status(201).json({
      success: true,
      data: node[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get knowledge graph nodes
router.get('/knowledge-graph', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    let nodes;
    if (type) {
      nodes = await db.select()
        .from(novaKnowledgeGraph)
        .where(and(
          eq(novaKnowledgeGraph.isActive, true),
          eq(novaKnowledgeGraph.nodeType, type as string)
        ));
    } else {
      nodes = await db.select()
        .from(novaKnowledgeGraph)
        .where(eq(novaKnowledgeGraph.isActive, true));
    }

    res.json({
      success: true,
      data: nodes
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== AUDIT TRAIL ENDPOINTS ====================

// Get audit trail for decision
router.get('/audit/:decisionId', async (req: Request, res: Response) => {
  try {
    const { decisionId } = req.params;
    
    const trail = await db.select()
      .from(novaDecisionAudit)
      .where(eq(novaDecisionAudit.decisionId, decisionId))
      .orderBy(desc(novaDecisionAudit.timestamp));

    res.json({
      success: true,
      data: trail,
      count: trail.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== DASHBOARD SUMMARY ====================

router.get('/dashboard/summary', async (req: Request, res: Response) => {
  try {
    const [decisions, policies, chains, killSwitch] = await Promise.all([
      db.select().from(novaSovereignDecisions),
      db.select().from(novaPolicies).where(eq(novaPolicies.isActive, true)),
      db.select().from(novaApprovalChains).where(eq(novaApprovalChains.isActive, true)),
      db.select().from(novaKillSwitch).where(eq(novaKillSwitch.isActive, true))
    ]);

    const pendingDecisions = decisions.filter(d => d.phase === 'pending_approval');
    const criticalDecisions = decisions.filter(d => 
      d.riskLevel === 'critical' || d.riskLevel === 'sovereign'
    );

    res.json({
      success: true,
      data: {
        totalDecisions: decisions.length,
        pendingApprovals: pendingDecisions.length,
        criticalDecisions: criticalDecisions.length,
        activePolicies: policies.length,
        approvalChains: chains.length,
        killSwitchActive: killSwitch.length > 0,
        recentDecisions: decisions.slice(0, 5)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export function registerNovaDecisionRoutes(app: express.Express) {
  app.use('/api/nova-sovereign', router);
}

export default router;
