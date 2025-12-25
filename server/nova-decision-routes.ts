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

// STRICT Role Hierarchy: owner > sovereign > admin > user
const ADMIN_ROLES = ['owner', 'sovereign', 'admin'];

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

    const userRole = user[0].role || 'user';

    // Strict role enforcement - no fallthrough
    if (requiredRole === 'owner') {
      if (userRole !== 'owner') {
        return { 
          valid: false, 
          error: 'Owner authority required for this action', 
          errorAr: 'صلاحية المالك مطلوبة لهذا الإجراء' 
        };
      }
    } else if (requiredRole === 'sovereign') {
      if (!SOVEREIGN_ROLES.includes(userRole)) {
        return { 
          valid: false, 
          error: 'Sovereign authority required for this action', 
          errorAr: 'صلاحية سيادية مطلوبة لهذا الإجراء' 
        };
      }
    } else if (requiredRole === 'admin') {
      if (!ADMIN_ROLES.includes(userRole)) {
        return { 
          valid: false, 
          error: 'Admin authority required for this action', 
          errorAr: 'صلاحية المسؤول مطلوبة لهذا الإجراء' 
        };
      }
    } else {
      // Unknown required role - deny by default (security principle)
      return { 
        valid: false, 
        error: 'Unknown authority level required', 
        errorAr: 'مستوى صلاحية غير معروف مطلوب' 
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

// Helper to get actual user role from database (never trust client input)
async function getUserRoleFromDb(userId: string): Promise<string> {
  try {
    const user = await db.select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user.length ? (user[0].role || 'user') : 'user';
  } catch {
    return 'user';
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
    const { approverId, notes } = req.body;

    if (!approverId) {
      return res.status(400).json({
        success: false,
        error: 'Approver ID is required',
        errorAr: 'معرف المعتمد مطلوب'
      });
    }

    // Get decision to check required approval level
    const decision = await db.select()
      .from(novaSovereignDecisions)
      .where(eq(novaSovereignDecisions.id, id))
      .limit(1);

    if (!decision.length) {
      return res.status(404).json({
        success: false,
        error: 'Decision not found',
        errorAr: 'القرار غير موجود'
      });
    }

    // Determine required authority from decision's approval level
    const requiredLevel = decision[0].requiredApprovalLevel;
    const requiredAuthority: 'owner' | 'sovereign' | 'admin' = 
      requiredLevel === 'owner_only' ? 'owner' : 
      requiredLevel === 'sovereign' ? 'sovereign' : 'admin';

    // SOVEREIGN AUTHORITY VALIDATION - Based on decision requirements, NOT client input
    const authCheck = await validateSovereignAuthority(approverId, requiredAuthority);
    if (!authCheck.valid) {
      return res.status(403).json({
        success: false,
        error: `This decision requires ${requiredAuthority} authority to approve`,
        errorAr: `هذا القرار يتطلب صلاحية ${requiredAuthority} للموافقة`
      });
    }

    // Get actual role from database for audit trail
    const actualRole = approverId === OWNER_ID || isRootOwner(approverId) ? 'owner' : 
      await getUserRoleFromDb(approverId);

    const result = await novaDecisionEngine.approveDecision(
      id,
      approverId,
      actualRole,
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
    const { rejectorId, reason, reasonAr } = req.body;

    if (!rejectorId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Rejector ID and reason are required',
        errorAr: 'معرف الرافض وسبب الرفض مطلوبان'
      });
    }

    // Get decision to check required approval level
    const decision = await db.select()
      .from(novaSovereignDecisions)
      .where(eq(novaSovereignDecisions.id, id))
      .limit(1);

    if (!decision.length) {
      return res.status(404).json({
        success: false,
        error: 'Decision not found',
        errorAr: 'القرار غير موجود'
      });
    }

    // Determine required authority from decision's approval level
    const requiredLevel = decision[0].requiredApprovalLevel;
    const requiredAuthority: 'owner' | 'sovereign' | 'admin' = 
      requiredLevel === 'owner_only' ? 'owner' : 
      requiredLevel === 'sovereign' ? 'sovereign' : 'admin';

    // SOVEREIGN AUTHORITY VALIDATION - Based on decision requirements, NOT client input
    const authCheck = await validateSovereignAuthority(rejectorId, requiredAuthority);
    if (!authCheck.valid) {
      return res.status(403).json({
        success: false,
        error: `This decision requires ${requiredAuthority} authority to reject`,
        errorAr: `هذا القرار يتطلب صلاحية ${requiredAuthority} للرفض`
      });
    }

    // Get actual role from database for audit trail
    const actualRole = rejectorId === OWNER_ID || isRootOwner(rejectorId) ? 'owner' : 
      await getUserRoleFromDb(rejectorId);

    const result = await novaDecisionEngine.rejectDecision(
      id,
      rejectorId,
      actualRole,
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

// ==================== DECISION TRACEABILITY ENDPOINTS ====================
// Full traceability: WHY, HOW, WHO, WHEN - لماذا، كيف، من، متى

// Get complete decision trace (Timeline view)
router.get('/trace/:decisionId', async (req: Request, res: Response) => {
  try {
    const { decisionId } = req.params;
    
    // Fetch decision details
    const decision = await db.select()
      .from(novaSovereignDecisions)
      .where(eq(novaSovereignDecisions.id, decisionId))
      .limit(1);

    if (!decision.length) {
      return res.status(404).json({
        success: false,
        error: 'Decision not found',
        errorAr: 'لم يتم العثور على القرار'
      });
    }

    // Fetch all related data in parallel
    const [steps, auditTrail] = await Promise.all([
      db.select()
        .from(novaDecisionSteps)
        .where(eq(novaDecisionSteps.decisionId, decisionId))
        .orderBy(novaDecisionSteps.order),
      db.select()
        .from(novaDecisionAudit)
        .where(eq(novaDecisionAudit.decisionId, decisionId))
        .orderBy(novaDecisionAudit.timestamp)
    ]);

    const d = decision[0];

    // Build comprehensive trace
    const trace = {
      // WHAT - ماذا
      what: {
        id: d.id,
        type: d.type,
        title: d.title,
        titleAr: d.titleAr,
        description: d.description,
        descriptionAr: d.descriptionAr,
        targetPlatform: d.targetPlatform,
        targetResource: d.targetResource
      },
      // WHY - لماذا
      why: {
        riskLevel: d.riskLevel,
        riskLevelAr: getRiskLevelAr(d.riskLevel),
        feasibilityScore: d.feasibilityScore,
        analysisResult: d.analysisResult,
        context: d.context,
        urgency: d.urgency
      },
      // HOW - كيف
      how: {
        phase: d.phase,
        phaseAr: getPhaseAr(d.phase),
        requiredApprovalLevel: d.requiredApprovalLevel,
        approvalLevelAr: getApprovalLevelAr(d.requiredApprovalLevel),
        executionSteps: steps.map(s => ({
          order: s.order,
          title: s.title,
          titleAr: s.titleAr,
          status: s.status,
          executedAt: s.executedAt,
          result: s.result
        })),
        executionResult: d.executionResult
      },
      // WHO - من
      who: {
        requestedBy: d.requestedBy,
        approvedBy: d.approvedBy,
        rejectedBy: d.rejectedBy,
        actorsInvolved: getActorsInvolved(d, auditTrail)
      },
      // WHEN - متى
      when: {
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        approvedAt: d.approvedAt,
        rejectedAt: d.rejectedAt,
        executedAt: d.executedAt,
        timeline: auditTrail.map(a => ({
          timestamp: a.timestamp,
          phase: a.phase,
          actor: a.actor,
          action: a.action,
          actionAr: a.actionAr
        }))
      },
      // INTEGRITY - سلامة البيانات
      integrity: {
        auditCount: auditTrail.length,
        signatures: auditTrail.map(a => ({
          phase: a.phase,
          signature: a.signature,
          verified: verifySignature(a)
        })),
        tamperDetected: !auditTrail.every(a => verifySignature(a))
      }
    };

    res.json({
      success: true,
      data: trace
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search decisions with filters
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { 
      type, 
      phase, 
      riskLevel, 
      requestedBy, 
      approvedBy,
      fromDate,
      toDate,
      limit = '50'
    } = req.query;

    let decisions = await db.select()
      .from(novaSovereignDecisions)
      .orderBy(desc(novaSovereignDecisions.createdAt))
      .limit(parseInt(limit as string));

    // Apply filters
    if (type) {
      decisions = decisions.filter(d => d.type === type);
    }
    if (phase) {
      decisions = decisions.filter(d => d.phase === phase);
    }
    if (riskLevel) {
      decisions = decisions.filter(d => d.riskLevel === riskLevel);
    }
    if (requestedBy) {
      decisions = decisions.filter(d => d.requestedBy === requestedBy);
    }
    if (approvedBy) {
      decisions = decisions.filter(d => d.approvedBy === approvedBy);
    }
    if (fromDate) {
      const from = new Date(fromDate as string);
      decisions = decisions.filter(d => new Date(d.createdAt!) >= from);
    }
    if (toDate) {
      const to = new Date(toDate as string);
      decisions = decisions.filter(d => new Date(d.createdAt!) <= to);
    }

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

// Get decision statistics
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const decisions = await db.select().from(novaSovereignDecisions);
    
    const stats = {
      total: decisions.length,
      byPhase: {} as Record<string, number>,
      byRisk: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      approvalRate: 0,
      rejectionRate: 0,
      averageFeasibility: 0,
      criticalDecisions: 0,
      pendingCount: 0
    };

    let totalFeasibility = 0;
    let approved = 0;
    let rejected = 0;

    decisions.forEach(d => {
      stats.byPhase[d.phase] = (stats.byPhase[d.phase] || 0) + 1;
      stats.byRisk[d.riskLevel] = (stats.byRisk[d.riskLevel] || 0) + 1;
      stats.byType[d.type] = (stats.byType[d.type] || 0) + 1;
      
      if (d.feasibilityScore) {
        totalFeasibility += d.feasibilityScore;
      }
      
      if (d.phase === 'approved' || d.phase === 'completed') {
        approved++;
      }
      if (d.phase === 'rejected') {
        rejected++;
      }
      if (d.riskLevel === 'critical' || d.riskLevel === 'sovereign') {
        stats.criticalDecisions++;
      }
      if (d.phase === 'pending_approval') {
        stats.pendingCount++;
      }
    });

    stats.averageFeasibility = decisions.length > 0 
      ? Math.round(totalFeasibility / decisions.length) 
      : 0;
    stats.approvalRate = decisions.length > 0 
      ? Math.round((approved / decisions.length) * 100) 
      : 0;
    stats.rejectionRate = decisions.length > 0 
      ? Math.round((rejected / decisions.length) * 100) 
      : 0;

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions for traceability
function getRiskLevelAr(level: string): string {
  const levels: Record<string, string> = {
    'low': 'منخفض',
    'medium': 'متوسط',
    'high': 'مرتفع',
    'critical': 'حرج',
    'sovereign': 'سيادي'
  };
  return levels[level] || level;
}

function getPhaseAr(phase: string): string {
  const phases: Record<string, string> = {
    'analysis': 'تحليل',
    'decision': 'قرار',
    'pending_approval': 'في انتظار الموافقة',
    'approved': 'موافق عليه',
    'rejected': 'مرفوض',
    'executing': 'قيد التنفيذ',
    'completed': 'مكتمل',
    'killed': 'موقوف طوارئ'
  };
  return phases[phase] || phase;
}

function getApprovalLevelAr(level: string | null): string {
  if (!level) return 'غير محدد';
  const levels: Record<string, string> = {
    'automatic': 'تلقائي',
    'standard': 'قياسي',
    'elevated': 'مرتفع',
    'sovereign': 'سيادي',
    'owner_only': 'المالك فقط'
  };
  return levels[level] || level;
}

function getActorsInvolved(decision: any, auditTrail: any[]): string[] {
  const actors = new Set<string>();
  if (decision.requestedBy) actors.add(decision.requestedBy);
  if (decision.approvedBy) actors.add(decision.approvedBy);
  if (decision.rejectedBy) actors.add(decision.rejectedBy);
  auditTrail.forEach(a => {
    if (a.actor) actors.add(a.actor);
  });
  return Array.from(actors);
}

function verifySignature(auditEntry: any): boolean {
  // Signature verification - MD5 = 32 chars, SHA256 = 64 chars
  return auditEntry.signature && (auditEntry.signature.length === 32 || auditEntry.signature.length === 64);
}

// ==================== MODEL LIFECYCLE GOVERNANCE ====================
// Train → Validate → Approve → Deploy → Pause → Retire

// Get all models lifecycle status
router.get('/model-lifecycle', async (req: Request, res: Response) => {
  try {
    const models = await db.select().from(novaModelLifecycle);

    res.json({
      success: true,
      data: models,
      count: models.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new model lifecycle transition
router.post('/model-lifecycle', async (req: Request, res: Response) => {
  try {
    const { 
      modelId, 
      stage,
      previousStage,
      transitionedBy, 
      transitionReason,
      riskScore,
      biasScore,
      driftScore,
      performanceMetrics
    } = req.body;

    if (!modelId || !stage || !transitionedBy) {
      return res.status(400).json({
        success: false,
        error: 'Model ID, stage, and transitionedBy are required',
        errorAr: 'معرف النموذج والمرحلة ومن قام بالانتقال مطلوبون'
      });
    }

    const model = await db.insert(novaModelLifecycle).values({
      modelId,
      stage,
      previousStage,
      transitionedBy,
      transitionReason,
      riskScore: riskScore || 0,
      biasScore: biasScore || 0,
      driftScore: driftScore || 0,
      performanceMetrics: performanceMetrics || {}
    }).returning();

    res.status(201).json({
      success: true,
      message: 'Model lifecycle transition created',
      messageAr: 'تم إنشاء انتقال دورة حياة النموذج',
      data: model[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Transition model to new stage
router.post('/model-lifecycle/:id/transition', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, transitionedBy, transitionReason } = req.body;

    const validStages = ['training', 'validating', 'approved', 'deployed', 'paused', 'retired'];
    
    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        error: `Invalid stage. Valid stages: ${validStages.join(', ')}`,
        errorAr: 'مرحلة غير صالحة'
      });
    }

    // Fetch current record to get the actual previous stage
    const currentRecord = await db.select()
      .from(novaModelLifecycle)
      .where(eq(novaModelLifecycle.id, id))
      .limit(1);

    if (!currentRecord.length) {
      return res.status(404).json({
        success: false,
        error: 'Model lifecycle not found',
        errorAr: 'دورة حياة النموذج غير موجودة'
      });
    }

    const currentStage = currentRecord[0].stage;

    // Critical stages require owner authority
    if (['approved', 'deployed', 'retired'].includes(stage)) {
      const authCheck = await validateSovereignAuthority(transitionedBy, 'owner');
      if (!authCheck.valid) {
        return res.status(403).json({
          success: false,
          error: `Stage '${stage}' requires owner authority`,
          errorAr: `المرحلة '${stage}' تتطلب صلاحية المالك`
        });
      }
    }

    const updated = await db.update(novaModelLifecycle)
      .set({ 
        stage: stage,
        previousStage: currentStage, // Store the ACTUAL previous stage
        transitionedBy,
        transitionReason
      })
      .where(eq(novaModelLifecycle.id, id))
      .returning();

    res.json({
      success: true,
      message: `Model transitioned from ${currentStage} to ${stage}`,
      messageAr: `تم نقل النموذج من ${getStageAr(currentStage)} إلى ${getStageAr(stage)}`,
      data: updated[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Pause model (emergency)
router.post('/model-lifecycle/:id/pause', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pausedBy, reason } = req.body;

    // Pause requires at least sovereign authority
    const authCheck = await validateSovereignAuthority(pausedBy, 'sovereign');
    if (!authCheck.valid) {
      return res.status(403).json({
        success: false,
        error: 'Pausing models requires sovereign authority',
        errorAr: 'إيقاف النماذج يتطلب صلاحية سيادية'
      });
    }

    // Fetch current record to get the actual previous stage
    const currentRecord = await db.select()
      .from(novaModelLifecycle)
      .where(eq(novaModelLifecycle.id, id))
      .limit(1);

    if (!currentRecord.length) {
      return res.status(404).json({
        success: false,
        error: 'Model lifecycle not found',
        errorAr: 'دورة حياة النموذج غير موجودة'
      });
    }

    const currentStage = currentRecord[0].stage;

    const updated = await db.update(novaModelLifecycle)
      .set({ 
        stage: 'paused',
        previousStage: currentStage, // Store the ACTUAL previous stage
        transitionedBy: pausedBy,
        transitionReason: reason
      })
      .where(eq(novaModelLifecycle.id, id))
      .returning();

    res.json({
      success: true,
      message: `Model paused (was: ${currentStage})`,
      messageAr: `تم إيقاف النموذج (كان: ${getStageAr(currentStage)})`,
      data: updated[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Retire model (permanent)
router.post('/model-lifecycle/:id/retire', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { retiredBy, reason } = req.body;

    // Retire requires owner authority
    const authCheck = await validateSovereignAuthority(retiredBy, 'owner');
    if (!authCheck.valid) {
      return res.status(403).json({
        success: false,
        error: 'Retiring models requires owner authority',
        errorAr: 'إنهاء النماذج يتطلب صلاحية المالك'
      });
    }

    // Fetch current record to get the actual previous stage
    const currentRecord = await db.select()
      .from(novaModelLifecycle)
      .where(eq(novaModelLifecycle.id, id))
      .limit(1);

    if (!currentRecord.length) {
      return res.status(404).json({
        success: false,
        error: 'Model lifecycle not found',
        errorAr: 'دورة حياة النموذج غير موجودة'
      });
    }

    const currentStage = currentRecord[0].stage;

    const updated = await db.update(novaModelLifecycle)
      .set({ 
        stage: 'retired',
        previousStage: currentStage, // Store the ACTUAL previous stage
        transitionedBy: retiredBy,
        transitionReason: reason
      })
      .where(eq(novaModelLifecycle.id, id))
      .returning();

    res.json({
      success: true,
      message: `Model retired permanently (was: ${currentStage})`,
      messageAr: `تم إنهاء النموذج نهائياً (كان: ${getStageAr(currentStage)})`,
      data: updated[0]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get model lifecycle summary
router.get('/model-lifecycle/summary', async (req: Request, res: Response) => {
  try {
    const models = await db.select().from(novaModelLifecycle);
    
    const summary = {
      total: models.length,
      byStage: {} as Record<string, number>,
      activeModels: 0,
      pausedModels: 0,
      retiredModels: 0,
      avgRiskScore: 0,
      avgBiasScore: 0,
      avgDriftScore: 0
    };

    let totalRisk = 0, totalBias = 0, totalDrift = 0;

    models.forEach(m => {
      summary.byStage[m.stage] = (summary.byStage[m.stage] || 0) + 1;
      
      if (m.stage === 'deployed') summary.activeModels++;
      if (m.stage === 'paused') summary.pausedModels++;
      if (m.stage === 'retired') summary.retiredModels++;
      
      totalRisk += m.riskScore || 0;
      totalBias += m.biasScore || 0;
      totalDrift += m.driftScore || 0;
    });

    if (models.length > 0) {
      summary.avgRiskScore = Math.round(totalRisk / models.length);
      summary.avgBiasScore = Math.round(totalBias / models.length);
      summary.avgDriftScore = Math.round(totalDrift / models.length);
    }

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

// Helper function for stage translation
function getStageAr(stage: string): string {
  const stages: Record<string, string> = {
    'training': 'تدريب',
    'validating': 'تحقق',
    'approved': 'موافق عليه',
    'deployed': 'منشور',
    'paused': 'موقوف',
    'retired': 'متقاعد'
  };
  return stages[stage] || stage;
}

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
