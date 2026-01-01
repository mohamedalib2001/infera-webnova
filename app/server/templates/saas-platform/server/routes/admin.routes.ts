import { Router, Request, Response } from "express";
import { z } from "zod";
import { authMiddleware, requireAdmin, requireModerator } from "../middleware/auth.middleware";
import { db } from "../config/database";
import { users, roles, auditLogs, sessions } from "../../db/schema/users";
import { eq, desc, count, and, gte, sql } from "drizzle-orm";

const router = Router();

router.use(authMiddleware);

router.get("/stats", requireModerator, async (req: Request, res: Response) => {
  try {
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [activeUsers] = await db.select({ count: count() })
      .from(users)
      .where(eq(users.status, "active"));
    const [activeSessions] = await db.select({ count: count() })
      .from(sessions)
      .where(gte(sessions.expiresAt, new Date()));

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [newUsersThisMonth] = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));

    const usersByRole = await db.select({
      roleName: roles.name,
      roleNameAr: roles.nameAr,
      count: count(),
    })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .groupBy(roles.name, roles.nameAr);

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers.count,
        activeUsers: activeUsers.count,
        activeSessions: activeSessions.count,
        newUsersThisMonth: newUsersThisMonth.count,
        usersByRole,
      },
    });
  } catch (error) {
    console.error("[Admin] Stats error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
      messageAr: "خطأ في الخادم",
      messageEn: "Server error",
    });
  }
});

router.get("/users", requireModerator, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const offset = (page - 1) * limit;

    let query = db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      avatar: users.avatar,
      status: users.status,
      isVerified: users.isVerified,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      role: {
        id: roles.id,
        name: roles.name,
        nameAr: roles.nameAr,
      },
    })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const usersList = await query;
    const [total] = await db.select({ count: count() }).from(users);

    res.json({
      success: true,
      users: usersList,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    });
  } catch (error) {
    console.error("[Admin] Get users error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

router.get("/users/:id", requireModerator, async (req: Request, res: Response) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.params.id),
      with: { role: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "user_not_found",
        messageAr: "المستخدم غير موجود",
        messageEn: "User not found",
      });
    }

    const { password, ...safeUser } = user;

    const userSessions = await db.select()
      .from(sessions)
      .where(eq(sessions.userId, user.id))
      .orderBy(desc(sessions.createdAt));

    const recentActivity = await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, user.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(20);

    res.json({
      success: true,
      user: safeUser,
      sessions: userSessions,
      recentActivity,
    });
  } catch (error) {
    console.error("[Admin] Get user error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

router.patch("/users/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const updateSchema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      status: z.enum(["active", "suspended", "banned"]).optional(),
      isVerified: z.boolean().optional(),
    });

    const data = updateSchema.parse(req.body);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, req.params.id),
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: "user_not_found",
      });
    }

    const [updatedUser] = await db.update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.params.id))
      .returning();

    await db.insert(auditLogs).values({
      userId: req.user!.userId,
      action: "admin.user_updated",
      entityType: "user",
      entityId: req.params.id,
      oldValues: JSON.stringify({
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        status: existingUser.status,
        isVerified: existingUser.isVerified,
      }),
      newValues: JSON.stringify(data),
    });

    const { password, ...safeUser } = updatedUser;

    res.json({
      success: true,
      user: safeUser,
      messageAr: "تم تحديث المستخدم بنجاح",
      messageEn: "User updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "validation_error",
        details: error.errors,
      });
    }
    console.error("[Admin] Update user error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

router.patch("/users/:id/role", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        error: "missing_role",
        messageAr: "الصلاحية مطلوبة",
        messageEn: "Role is required",
      });
    }

    const role = await db.query.roles.findFirst({
      where: eq(roles.id, roleId),
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: "role_not_found",
      });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, req.params.id),
      with: { role: true },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: "user_not_found",
      });
    }

    const [updatedUser] = await db.update(users)
      .set({
        roleId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.params.id))
      .returning();

    await db.insert(auditLogs).values({
      userId: req.user!.userId,
      action: "admin.user_role_changed",
      entityType: "user",
      entityId: req.params.id,
      oldValues: JSON.stringify({ roleId: existingUser.roleId, roleName: existingUser.role.name }),
      newValues: JSON.stringify({ roleId, roleName: role.name }),
    });

    res.json({
      success: true,
      messageAr: "تم تغيير صلاحية المستخدم بنجاح",
      messageEn: "User role updated successfully",
    });
  } catch (error) {
    console.error("[Admin] Update role error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

router.delete("/users/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.params.id),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "user_not_found",
      });
    }

    if (req.user!.userId === req.params.id) {
      return res.status(400).json({
        success: false,
        error: "cannot_delete_self",
        messageAr: "لا يمكنك حذف حسابك",
        messageEn: "You cannot delete your own account",
      });
    }

    await db.delete(sessions).where(eq(sessions.userId, req.params.id));
    await db.delete(users).where(eq(users.id, req.params.id));

    await db.insert(auditLogs).values({
      userId: req.user!.userId,
      action: "admin.user_deleted",
      entityType: "user",
      entityId: req.params.id,
      oldValues: JSON.stringify({
        email: user.email,
        username: user.username,
      }),
    });

    res.json({
      success: true,
      messageAr: "تم حذف المستخدم بنجاح",
      messageEn: "User deleted successfully",
    });
  } catch (error) {
    console.error("[Admin] Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

router.get("/roles", requireModerator, async (req: Request, res: Response) => {
  try {
    const rolesList = await db.query.roles.findMany();

    res.json({
      success: true,
      roles: rolesList,
    });
  } catch (error) {
    console.error("[Admin] Get roles error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

router.get("/audit-logs", requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const action = req.query.action as string;
    const userId = req.query.userId as string;

    const offset = (page - 1) * limit;

    const logs = await db.select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      oldValues: auditLogs.oldValues,
      newValues: auditLogs.newValues,
      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,
      user: {
        id: users.id,
        email: users.email,
        username: users.username,
      },
    })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const [total] = await db.select({ count: count() }).from(auditLogs);

    res.json({
      success: true,
      logs,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit),
      },
    });
  } catch (error) {
    console.error("[Admin] Get audit logs error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

export default router;
