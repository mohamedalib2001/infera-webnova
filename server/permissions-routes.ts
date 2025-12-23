import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// ==================== SOVEREIGN PERMISSIONS CONTROL SYSTEM ====================
// نظام التحكم السيادي في الصلاحيات

// Permission definitions with Arabic translations
export const PERMISSIONS = {
  // System Level
  "system:admin": { en: "System Administration", ar: "إدارة النظام" },
  "system:config": { en: "System Configuration", ar: "إعدادات النظام" },
  "system:audit": { en: "Audit Logs Access", ar: "الوصول لسجلات التدقيق" },
  
  // User Management
  "users:read": { en: "View Users", ar: "عرض المستخدمين" },
  "users:create": { en: "Create Users", ar: "إنشاء مستخدمين" },
  "users:update": { en: "Update Users", ar: "تحديث المستخدمين" },
  "users:delete": { en: "Delete Users", ar: "حذف المستخدمين" },
  "users:suspend": { en: "Suspend Users", ar: "تعليق المستخدمين" },
  "users:roles": { en: "Manage User Roles", ar: "إدارة أدوار المستخدمين" },
  
  // Projects
  "projects:read": { en: "View Projects", ar: "عرض المشاريع" },
  "projects:create": { en: "Create Projects", ar: "إنشاء مشاريع" },
  "projects:update": { en: "Update Projects", ar: "تحديث المشاريع" },
  "projects:delete": { en: "Delete Projects", ar: "حذف المشاريع" },
  "projects:deploy": { en: "Deploy Projects", ar: "نشر المشاريع" },
  
  // AI Services
  "ai:chat": { en: "AI Chat Access", ar: "الوصول للمحادثة الذكية" },
  "ai:generate": { en: "AI Code Generation", ar: "توليد الكود بالذكاء" },
  "ai:analyze": { en: "AI Analysis", ar: "التحليل الذكي" },
  "ai:unlimited": { en: "Unlimited AI Usage", ar: "استخدام غير محدود للذكاء" },
  
  // Infrastructure
  "infra:servers": { en: "Manage Servers", ar: "إدارة الخوادم" },
  "infra:domains": { en: "Manage Domains", ar: "إدارة النطاقات" },
  "infra:ssl": { en: "Manage SSL", ar: "إدارة SSL" },
  "infra:deploy": { en: "Infrastructure Deploy", ar: "نشر البنية التحتية" },
  
  // Finance
  "finance:view": { en: "View Financial Data", ar: "عرض البيانات المالية" },
  "finance:manage": { en: "Manage Finances", ar: "إدارة المالية" },
  "finance:billing": { en: "Billing Access", ar: "الوصول للفواتير" },
  "finance:refunds": { en: "Process Refunds", ar: "معالجة المبالغ المستردة" },
  
  // API Access
  "api:read": { en: "API Read Access", ar: "قراءة API" },
  "api:write": { en: "API Write Access", ar: "كتابة API" },
  "api:admin": { en: "API Admin Access", ar: "إدارة API" },
  
  // Data
  "data:export": { en: "Export Data", ar: "تصدير البيانات" },
  "data:import": { en: "Import Data", ar: "استيراد البيانات" },
  "data:backup": { en: "Backup Management", ar: "إدارة النسخ الاحتياطي" },
  
  // Owner Exclusive
  "owner:full_access": { en: "Full Owner Access", ar: "صلاحية المالك الكاملة" },
} as const;

export type PermissionCode = keyof typeof PERMISSIONS;

// Role definitions with default permissions
export const ROLE_PERMISSIONS: Record<string, PermissionCode[]> = {
  owner: Object.keys(PERMISSIONS) as PermissionCode[],
  sovereign: [
    "system:admin", "system:config", "system:audit",
    "users:read", "users:create", "users:update", "users:roles",
    "projects:read", "projects:create", "projects:update", "projects:delete", "projects:deploy",
    "ai:chat", "ai:generate", "ai:analyze", "ai:unlimited",
    "infra:servers", "infra:domains", "infra:ssl", "infra:deploy",
    "finance:view", "finance:manage", "finance:billing",
    "api:read", "api:write", "api:admin",
    "data:export", "data:import", "data:backup",
  ],
  admin: [
    "users:read", "users:create", "users:update", "users:suspend",
    "projects:read", "projects:create", "projects:update",
    "ai:chat", "ai:generate", "ai:analyze",
    "infra:domains", "infra:ssl",
    "api:read", "api:write",
    "data:export",
  ],
  enterprise: [
    "users:read",
    "projects:read", "projects:create", "projects:update", "projects:deploy",
    "ai:chat", "ai:generate", "ai:analyze",
    "infra:domains", "infra:ssl",
    "api:read", "api:write",
    "data:export", "data:import",
  ],
  pro: [
    "projects:read", "projects:create", "projects:update",
    "ai:chat", "ai:generate",
    "api:read",
    "data:export",
  ],
  basic: [
    "projects:read", "projects:create",
    "ai:chat",
    "api:read",
  ],
  free: [
    "projects:read",
    "ai:chat",
  ],
};

// In-memory permission overrides (would be database in production)
const permissionOverrides: Map<string, { granted: PermissionCode[], revoked: PermissionCode[] }> = new Map();

// Permission audit log
const auditLog: Array<{
  id: string;
  userId: string;
  action: string;
  targetUserId?: string;
  permissions: string[];
  performedBy: string;
  timestamp: Date;
  ipAddress?: string;
}> = [];

// Middleware: Check if user is authenticated
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required | المصادقة مطلوبة" });
  }
  next();
}

// Middleware: Check for specific permission
export function requirePermission(...permissions: PermissionCode[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ error: "Authentication required | المصادقة مطلوبة" });
    }
    
    const userPermissions = getUserPermissions(user.id, user.role);
    const hasPermission = permissions.some(p => userPermissions.includes(p));
    
    if (!hasPermission) {
      logAudit(user.id, "permission_denied", undefined, permissions, user.id, req.ip);
      return res.status(403).json({ 
        error: "Permission denied | الصلاحية مرفوضة",
        required: permissions,
        userPermissions,
      });
    }
    
    next();
  };
}

// Get user's effective permissions
function getUserPermissions(userId: string, role: string): PermissionCode[] {
  const rolePermissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.free;
  const overrides = permissionOverrides.get(userId) || { granted: [], revoked: [] };
  
  // Start with role permissions
  let effective = [...rolePermissions];
  
  // Add granted permissions
  overrides.granted.forEach(p => {
    if (!effective.includes(p)) effective.push(p);
  });
  
  // Remove revoked permissions
  effective = effective.filter(p => !overrides.revoked.includes(p));
  
  return effective;
}

// Log permission audit
function logAudit(
  userId: string,
  action: string,
  targetUserId: string | undefined,
  permissions: string[],
  performedBy: string,
  ipAddress?: string
) {
  auditLog.push({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    action,
    targetUserId,
    permissions,
    performedBy,
    timestamp: new Date(),
    ipAddress,
  });
  
  // Keep only last 1000 entries
  if (auditLog.length > 1000) {
    auditLog.shift();
  }
}

export function registerPermissionRoutes(app: Express) {
  // ==================== GET ALL PERMISSIONS ====================
  app.get("/api/permissions/definitions", requireAuth, async (req, res) => {
    try {
      const permissionList = Object.entries(PERMISSIONS).map(([code, labels]) => ({
        code,
        ...labels,
        category: code.split(":")[0],
      }));
      
      res.json({
        permissions: permissionList,
        categories: Array.from(new Set(permissionList.map(p => p.category))),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== GET ROLE PERMISSIONS ====================
  app.get("/api/permissions/roles", requireAuth, async (req, res) => {
    try {
      const roles = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
        role,
        permissions,
        permissionCount: permissions.length,
        isSystem: ["owner", "sovereign"].includes(role),
      }));
      
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== GET USER PERMISSIONS ====================
  app.get("/api/permissions/user/:userId", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const targetUserId = req.params.userId;
      
      // Only owner/admin can view other users' permissions
      if (targetUserId !== user.id && !["owner", "sovereign", "admin"].includes(user.role)) {
        return res.status(403).json({ error: "Access denied | الوصول مرفوض" });
      }
      
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found | المستخدم غير موجود" });
      }
      
      const permissions = getUserPermissions(targetUserId, targetUser.role);
      const overrides = permissionOverrides.get(targetUserId) || { granted: [], revoked: [] };
      
      res.json({
        userId: targetUserId,
        role: targetUser.role,
        rolePermissions: ROLE_PERMISSIONS[targetUser.role] || [],
        effectivePermissions: permissions,
        overrides,
        permissionDetails: permissions.map(code => ({
          code,
          ...PERMISSIONS[code as PermissionCode],
          category: code.split(":")[0],
          isGranted: overrides.granted.includes(code as PermissionCode),
          isRevoked: false,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== GET MY PERMISSIONS ====================
  app.get("/api/permissions/me", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const permissions = getUserPermissions(user.id, user.role);
      const overrides = permissionOverrides.get(user.id) || { granted: [], revoked: [] };
      
      res.json({
        userId: user.id,
        role: user.role,
        effectivePermissions: permissions,
        overrides,
        canManagePermissions: ["owner", "sovereign", "admin"].includes(user.role),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== GRANT PERMISSION ====================
  app.post("/api/permissions/grant", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { targetUserId, permissions } = req.body;
      
      // Only owner/sovereign can grant permissions
      if (!["owner", "sovereign"].includes(user.role)) {
        return res.status(403).json({ error: "Only owners can grant permissions | المالكون فقط يمكنهم منح الصلاحيات" });
      }
      
      // Cannot grant owner:full_access to non-owners
      if (permissions.includes("owner:full_access") && user.role !== "owner") {
        return res.status(403).json({ error: "Cannot grant owner access | لا يمكن منح صلاحية المالك" });
      }
      
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found | المستخدم غير موجود" });
      }
      
      // Update overrides
      const overrides = permissionOverrides.get(targetUserId) || { granted: [], revoked: [] };
      permissions.forEach((p: PermissionCode) => {
        if (!overrides.granted.includes(p)) {
          overrides.granted.push(p);
        }
        // Remove from revoked if it was there
        overrides.revoked = overrides.revoked.filter(r => r !== p);
      });
      permissionOverrides.set(targetUserId, overrides);
      
      // Log audit
      logAudit(targetUserId, "permission_granted", targetUserId, permissions, user.id, req.ip);
      
      res.json({
        success: true,
        message: "Permissions granted | تم منح الصلاحيات",
        grantedPermissions: permissions,
        effectivePermissions: getUserPermissions(targetUserId, targetUser.role),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== REVOKE PERMISSION ====================
  app.post("/api/permissions/revoke", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { targetUserId, permissions } = req.body;
      
      // Only owner/sovereign can revoke permissions
      if (!["owner", "sovereign"].includes(user.role)) {
        return res.status(403).json({ error: "Only owners can revoke permissions | المالكون فقط يمكنهم سحب الصلاحيات" });
      }
      
      // Cannot revoke owner permissions
      if (targetUserId === user.id && user.role === "owner") {
        return res.status(403).json({ error: "Cannot revoke owner's own permissions | لا يمكن سحب صلاحيات المالك" });
      }
      
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found | المستخدم غير موجود" });
      }
      
      // Update overrides
      const overrides = permissionOverrides.get(targetUserId) || { granted: [], revoked: [] };
      permissions.forEach((p: PermissionCode) => {
        if (!overrides.revoked.includes(p)) {
          overrides.revoked.push(p);
        }
        // Remove from granted if it was there
        overrides.granted = overrides.granted.filter(g => g !== p);
      });
      permissionOverrides.set(targetUserId, overrides);
      
      // Log audit
      logAudit(targetUserId, "permission_revoked", targetUserId, permissions, user.id, req.ip);
      
      res.json({
        success: true,
        message: "Permissions revoked | تم سحب الصلاحيات",
        revokedPermissions: permissions,
        effectivePermissions: getUserPermissions(targetUserId, targetUser.role),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== RESET USER PERMISSIONS ====================
  app.post("/api/permissions/reset/:userId", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const targetUserId = req.params.userId;
      
      if (!["owner", "sovereign"].includes(user.role)) {
        return res.status(403).json({ error: "Access denied | الوصول مرفوض" });
      }
      
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found | المستخدم غير موجود" });
      }
      
      // Clear overrides
      permissionOverrides.delete(targetUserId);
      
      // Log audit
      logAudit(targetUserId, "permissions_reset", targetUserId, [], user.id, req.ip);
      
      res.json({
        success: true,
        message: "Permissions reset to role defaults | تم إعادة تعيين الصلاحيات للافتراضي",
        effectivePermissions: getUserPermissions(targetUserId, targetUser.role),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CHECK PERMISSION ====================
  app.post("/api/permissions/check", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { permissions } = req.body;
      
      const userPermissions = getUserPermissions(user.id, user.role);
      const results = permissions.map((p: string) => ({
        permission: p,
        allowed: userPermissions.includes(p as PermissionCode),
        label: PERMISSIONS[p as PermissionCode] || { en: p, ar: p },
      }));
      
      res.json({
        userId: user.id,
        role: user.role,
        results,
        allAllowed: results.every((r: any) => r.allowed),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== GET AUDIT LOG ====================
  app.get("/api/permissions/audit", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!["owner", "sovereign", "admin"].includes(user.role)) {
        return res.status(403).json({ error: "Access denied | الوصول مرفوض" });
      }
      
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const logs = auditLog
        .slice()
        .reverse()
        .slice(offset, offset + limit);
      
      res.json({
        logs,
        total: auditLog.length,
        limit,
        offset,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== GET PERMISSION STATS ====================
  app.get("/api/permissions/stats", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!["owner", "sovereign", "admin"].includes(user.role)) {
        return res.status(403).json({ error: "Access denied | الوصول مرفوض" });
      }
      
      const stats = {
        totalPermissions: Object.keys(PERMISSIONS).length,
        totalRoles: Object.keys(ROLE_PERMISSIONS).length,
        usersWithOverrides: permissionOverrides.size,
        auditLogEntries: auditLog.length,
        permissionsByCategory: Object.entries(PERMISSIONS).reduce((acc, [code]) => {
          const category = code.split(":")[0];
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        roleBreakdown: Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => ({
          role,
          permissionCount: perms.length,
        })),
      };
      
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  console.log("Permission Control routes registered | تم تسجيل مسارات التحكم في الصلاحيات");
}
