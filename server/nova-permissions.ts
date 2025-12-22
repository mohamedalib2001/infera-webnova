import type { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "./db";
import { eq, and, desc, inArray } from "drizzle-orm";
import {
  novaPermissions,
  novaPermissionGrants,
  novaPermissionAudit,
  novaPermissionPresets,
  type NovaPermission,
  type NovaPermissionGrant,
} from "@shared/schema";

// ==================== نظام التحكم في صلاحيات نوفا ====================
// Nova AI Permission Control System for INFERA WebNova

// ==================== تعريف الصلاحيات الأساسية ====================
// Default permissions with security levels

export interface PermissionDefinition {
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: string;
  securityLevel: "high" | "medium" | "low" | "danger";
  defaultEnabled: boolean;
}

// Complete list of Nova AI permissions
export const DEFAULT_PERMISSIONS: PermissionDefinition[] = [
  // ==================== تنفيذ الكود ====================
  {
    code: "execute_nodejs",
    nameEn: "Execute Node.js Code",
    nameAr: "تنفيذ كود Node.js",
    descriptionEn: "Run Node.js code in isolated sandbox",
    descriptionAr: "تشغيل كود Node.js في بيئة معزولة",
    category: "code_execution",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "execute_python",
    nameEn: "Execute Python Code",
    nameAr: "تنفيذ كود Python",
    descriptionEn: "Run Python code in isolated sandbox",
    descriptionAr: "تشغيل كود Python في بيئة معزولة",
    category: "code_execution",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "execute_shell",
    nameEn: "Execute Shell Commands",
    nameAr: "تنفيذ أوامر Shell",
    descriptionEn: "Run limited shell commands (ls, cat, echo, etc.)",
    descriptionAr: "تشغيل أوامر shell محدودة (ls, cat, echo, إلخ)",
    category: "code_execution",
    securityLevel: "low",
    defaultEnabled: false,
  },
  {
    code: "install_packages",
    nameEn: "Install Packages",
    nameAr: "تثبيت الحزم",
    descriptionEn: "Install npm/pip packages in sandbox",
    descriptionAr: "تثبيت حزم npm/pip في البيئة المعزولة",
    category: "code_execution",
    securityLevel: "low",
    defaultEnabled: false,
  },

  // ==================== عمليات الملفات ====================
  {
    code: "create_files",
    nameEn: "Create Files",
    nameAr: "إنشاء الملفات",
    descriptionEn: "Create new files in project",
    descriptionAr: "إنشاء ملفات جديدة في المشروع",
    category: "file_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "read_files",
    nameEn: "Read Files",
    nameAr: "قراءة الملفات",
    descriptionEn: "Read existing files in project",
    descriptionAr: "قراءة الملفات الموجودة في المشروع",
    category: "file_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "edit_files",
    nameEn: "Edit Files",
    nameAr: "تعديل الملفات",
    descriptionEn: "Modify existing files in project",
    descriptionAr: "تعديل الملفات الموجودة في المشروع",
    category: "file_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "delete_files",
    nameEn: "Delete Files",
    nameAr: "حذف الملفات",
    descriptionEn: "Remove files from project",
    descriptionAr: "حذف الملفات من المشروع",
    category: "file_operations",
    securityLevel: "low",
    defaultEnabled: false,
  },
  {
    code: "upload_files",
    nameEn: "Upload Files",
    nameAr: "رفع الملفات",
    descriptionEn: "Upload files to object storage",
    descriptionAr: "رفع الملفات إلى التخزين السحابي",
    category: "file_operations",
    securityLevel: "medium",
    defaultEnabled: true,
  },

  // ==================== عمليات قاعدة البيانات ====================
  {
    code: "db_read",
    nameEn: "Read Database",
    nameAr: "قراءة قاعدة البيانات",
    descriptionEn: "Execute SELECT queries on database",
    descriptionAr: "تنفيذ استعلامات SELECT على قاعدة البيانات",
    category: "database_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "db_write",
    nameEn: "Write Database",
    nameAr: "الكتابة في قاعدة البيانات",
    descriptionEn: "Execute INSERT/UPDATE queries",
    descriptionAr: "تنفيذ استعلامات INSERT/UPDATE",
    category: "database_operations",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "db_delete",
    nameEn: "Delete from Database",
    nameAr: "الحذف من قاعدة البيانات",
    descriptionEn: "Execute DELETE queries",
    descriptionAr: "تنفيذ استعلامات DELETE",
    category: "database_operations",
    securityLevel: "low",
    defaultEnabled: false,
  },
  {
    code: "db_schema",
    nameEn: "Modify Database Schema",
    nameAr: "تعديل هيكل قاعدة البيانات",
    descriptionEn: "Create/alter tables and columns",
    descriptionAr: "إنشاء/تعديل الجداول والأعمدة",
    category: "database_operations",
    securityLevel: "danger",
    defaultEnabled: false,
  },

  // ==================== تكامل API ====================
  {
    code: "api_read",
    nameEn: "Read External APIs",
    nameAr: "قراءة APIs الخارجية",
    descriptionEn: "Make GET requests to external services",
    descriptionAr: "إرسال طلبات GET للخدمات الخارجية",
    category: "api_integrations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "api_write",
    nameEn: "Write to External APIs",
    nameAr: "الكتابة في APIs الخارجية",
    descriptionEn: "Make POST/PUT/DELETE requests to external services",
    descriptionAr: "إرسال طلبات POST/PUT/DELETE للخدمات الخارجية",
    category: "api_integrations",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "api_oauth",
    nameEn: "OAuth Integrations",
    nameAr: "تكاملات OAuth",
    descriptionEn: "Connect to services via OAuth",
    descriptionAr: "الاتصال بالخدمات عبر OAuth",
    category: "api_integrations",
    securityLevel: "medium",
    defaultEnabled: false,
  },

  // ==================== النشر والإصدار ====================
  {
    code: "deploy_preview",
    nameEn: "Deploy Preview",
    nameAr: "نشر المعاينة",
    descriptionEn: "Deploy to preview/staging environment",
    descriptionAr: "النشر في بيئة المعاينة/الاختبار",
    category: "deployment",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "deploy_production",
    nameEn: "Deploy to Production",
    nameAr: "النشر للإنتاج",
    descriptionEn: "Deploy to production environment",
    descriptionAr: "النشر في بيئة الإنتاج",
    category: "deployment",
    securityLevel: "low",
    defaultEnabled: false,
  },
  {
    code: "deploy_vercel",
    nameEn: "Deploy to Vercel",
    nameAr: "النشر على Vercel",
    descriptionEn: "Create and deploy projects on Vercel",
    descriptionAr: "إنشاء ونشر المشاريع على Vercel",
    category: "deployment",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "deploy_netlify",
    nameEn: "Deploy to Netlify",
    nameAr: "النشر على Netlify",
    descriptionEn: "Create and deploy sites on Netlify",
    descriptionAr: "إنشاء ونشر المواقع على Netlify",
    category: "deployment",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "deploy_github",
    nameEn: "Push to GitHub",
    nameAr: "الدفع إلى GitHub",
    descriptionEn: "Create repos and push code to GitHub",
    descriptionAr: "إنشاء المستودعات ودفع الكود إلى GitHub",
    category: "deployment",
    securityLevel: "medium",
    defaultEnabled: false,
  },

  // ==================== قدرات الذكاء الاصطناعي ====================
  {
    code: "ai_chat",
    nameEn: "AI Chat",
    nameAr: "محادثة الذكاء الاصطناعي",
    descriptionEn: "Conversational AI assistance",
    descriptionAr: "المساعدة التفاعلية بالذكاء الاصطناعي",
    category: "ai_capabilities",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_code_generation",
    nameEn: "AI Code Generation",
    nameAr: "توليد الكود بالذكاء الاصطناعي",
    descriptionEn: "Generate code using AI models",
    descriptionAr: "توليد الكود باستخدام نماذج الذكاء الاصطناعي",
    category: "ai_capabilities",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_vision",
    nameEn: "AI Vision Processing",
    nameAr: "معالجة الصور بالذكاء الاصطناعي",
    descriptionEn: "Analyze images, OCR, screenshot-to-code",
    descriptionAr: "تحليل الصور، استخراج النصوص، تحويل الصور لكود",
    category: "ai_capabilities",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_autonomous",
    nameEn: "Autonomous AI Operations",
    nameAr: "العمليات الذاتية للذكاء الاصطناعي",
    descriptionEn: "Allow AI to perform multi-step tasks autonomously",
    descriptionAr: "السماح للذكاء الاصطناعي بتنفيذ مهام متعددة الخطوات ذاتياً",
    category: "ai_capabilities",
    securityLevel: "low",
    defaultEnabled: false,
  },

  // ==================== إدارة البنية التحتية ====================
  {
    code: "infra_servers",
    nameEn: "Manage Servers",
    nameAr: "إدارة الخوادم",
    descriptionEn: "Create, configure, and manage cloud servers",
    descriptionAr: "إنشاء وتكوين وإدارة الخوادم السحابية",
    category: "infrastructure",
    securityLevel: "danger",
    defaultEnabled: false,
  },
  {
    code: "infra_domains",
    nameEn: "Manage Domains",
    nameAr: "إدارة النطاقات",
    descriptionEn: "Configure domains and DNS settings",
    descriptionAr: "تكوين النطاقات وإعدادات DNS",
    category: "infrastructure",
    securityLevel: "low",
    defaultEnabled: false,
  },
  {
    code: "infra_ssl",
    nameEn: "Manage SSL Certificates",
    nameAr: "إدارة شهادات SSL",
    descriptionEn: "Issue and manage SSL certificates",
    descriptionAr: "إصدار وإدارة شهادات SSL",
    category: "infrastructure",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "infra_monitoring",
    nameEn: "Access Monitoring",
    nameAr: "الوصول للمراقبة",
    descriptionEn: "View server metrics and logs",
    descriptionAr: "عرض مقاييس الخادم والسجلات",
    category: "infrastructure",
    securityLevel: "high",
    defaultEnabled: true,
  },

  // ==================== المدفوعات والفوترة ====================
  {
    code: "payment_read",
    nameEn: "View Payments",
    nameAr: "عرض المدفوعات",
    descriptionEn: "View payment history and invoices",
    descriptionAr: "عرض سجل المدفوعات والفواتير",
    category: "payment_billing",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "payment_process",
    nameEn: "Process Payments",
    nameAr: "معالجة المدفوعات",
    descriptionEn: "Create and process payment transactions",
    descriptionAr: "إنشاء ومعالجة معاملات الدفع",
    category: "payment_billing",
    securityLevel: "danger",
    defaultEnabled: false,
  },
  {
    code: "payment_refund",
    nameEn: "Issue Refunds",
    nameAr: "إصدار المبالغ المستردة",
    descriptionEn: "Process refunds for customers",
    descriptionAr: "معالجة المبالغ المستردة للعملاء",
    category: "payment_billing",
    securityLevel: "danger",
    defaultEnabled: false,
  },

  // ==================== إدارة المستخدمين ====================
  {
    code: "users_read",
    nameEn: "View Users",
    nameAr: "عرض المستخدمين",
    descriptionEn: "View user profiles and data",
    descriptionAr: "عرض ملفات المستخدمين وبياناتهم",
    category: "user_management",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "users_create",
    nameEn: "Create Users",
    nameAr: "إنشاء المستخدمين",
    descriptionEn: "Create new user accounts",
    descriptionAr: "إنشاء حسابات مستخدمين جديدة",
    category: "user_management",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "users_modify",
    nameEn: "Modify Users",
    nameAr: "تعديل المستخدمين",
    descriptionEn: "Edit user profiles and settings",
    descriptionAr: "تعديل ملفات المستخدمين وإعداداتهم",
    category: "user_management",
    securityLevel: "low",
    defaultEnabled: false,
  },
  {
    code: "users_delete",
    nameEn: "Delete Users",
    nameAr: "حذف المستخدمين",
    descriptionEn: "Remove user accounts",
    descriptionAr: "حذف حسابات المستخدمين",
    category: "user_management",
    securityLevel: "danger",
    defaultEnabled: false,
  },

  // ==================== إعدادات النظام ====================
  {
    code: "config_read",
    nameEn: "View Configuration",
    nameAr: "عرض الإعدادات",
    descriptionEn: "View system configuration settings",
    descriptionAr: "عرض إعدادات تكوين النظام",
    category: "system_config",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "config_modify",
    nameEn: "Modify Configuration",
    nameAr: "تعديل الإعدادات",
    descriptionEn: "Change system configuration settings",
    descriptionAr: "تغيير إعدادات تكوين النظام",
    category: "system_config",
    securityLevel: "danger",
    defaultEnabled: false,
  },
  {
    code: "secrets_read",
    nameEn: "View Secrets",
    nameAr: "عرض الأسرار",
    descriptionEn: "View API keys and secrets (masked)",
    descriptionAr: "عرض مفاتيح API والأسرار (مخفية)",
    category: "system_config",
    securityLevel: "low",
    defaultEnabled: false,
  },
  {
    code: "secrets_modify",
    nameEn: "Modify Secrets",
    nameAr: "تعديل الأسرار",
    descriptionEn: "Create, update, or delete secrets",
    descriptionAr: "إنشاء أو تحديث أو حذف الأسرار",
    category: "system_config",
    securityLevel: "danger",
    defaultEnabled: false,
  },
];

// Default permission presets
export const DEFAULT_PRESETS = [
  {
    code: "restrictive",
    nameEn: "Restrictive",
    nameAr: "مقيد",
    descriptionEn: "Minimal permissions for basic AI assistance only",
    descriptionAr: "صلاحيات محدودة للمساعدة الأساسية فقط",
    permissions: ["ai_chat", "ai_code_generation", "read_files", "config_read"],
    color: "green",
    icon: "Shield",
    displayOrder: 1,
    isSystem: true,
  },
  {
    code: "balanced",
    nameEn: "Balanced",
    nameAr: "متوازن",
    descriptionEn: "Standard permissions for development work",
    descriptionAr: "صلاحيات قياسية لأعمال التطوير",
    permissions: [
      "ai_chat", "ai_code_generation", "ai_vision",
      "create_files", "read_files", "edit_files", "upload_files",
      "execute_nodejs", "execute_python",
      "db_read", "db_write",
      "api_read",
      "deploy_preview",
      "users_read", "config_read", "payment_read", "infra_monitoring"
    ],
    color: "blue",
    icon: "Scale",
    displayOrder: 2,
    isSystem: true,
  },
  {
    code: "full_access",
    nameEn: "Full Access",
    nameAr: "وصول كامل",
    descriptionEn: "All permissions enabled for maximum capability",
    descriptionAr: "جميع الصلاحيات مفعلة للحد الأقصى من القدرات",
    permissions: DEFAULT_PERMISSIONS.map(p => p.code),
    color: "red",
    icon: "Key",
    displayOrder: 3,
    isSystem: true,
  },
];

// ==================== خدمات الصلاحيات ====================

// Initialize default permissions in database
export async function initializeDefaultPermissions(): Promise<void> {
  try {
    for (const perm of DEFAULT_PERMISSIONS) {
      await db
        .insert(novaPermissions)
        .values({
          code: perm.code,
          nameEn: perm.nameEn,
          nameAr: perm.nameAr,
          descriptionEn: perm.descriptionEn,
          descriptionAr: perm.descriptionAr,
          category: perm.category,
          securityLevel: perm.securityLevel,
          defaultEnabled: perm.defaultEnabled,
          isSystem: true,
        })
        .onConflictDoNothing();
    }
    
    for (const preset of DEFAULT_PRESETS) {
      await db
        .insert(novaPermissionPresets)
        .values({
          code: preset.code,
          nameEn: preset.nameEn,
          nameAr: preset.nameAr,
          descriptionEn: preset.descriptionEn,
          descriptionAr: preset.descriptionAr,
          permissions: preset.permissions,
          color: preset.color,
          icon: preset.icon,
          displayOrder: preset.displayOrder,
          isSystem: preset.isSystem,
        })
        .onConflictDoNothing();
    }
    
    console.log("[Nova Permissions] Default permissions initialized");
  } catch (error) {
    console.error("[Nova Permissions] Failed to initialize:", error);
  }
}

// Get user's granted permissions
export async function getUserPermissions(userId: string): Promise<string[]> {
  const grants = await db
    .select()
    .from(novaPermissionGrants)
    .where(
      and(
        eq(novaPermissionGrants.userId, userId),
        eq(novaPermissionGrants.isGranted, true)
      )
    );
  
  return grants.map(g => g.permissionCode);
}

// Check if user has specific permission
export async function hasPermission(userId: string, permissionCode: string): Promise<boolean> {
  const grant = await db
    .select()
    .from(novaPermissionGrants)
    .where(
      and(
        eq(novaPermissionGrants.userId, userId),
        eq(novaPermissionGrants.permissionCode, permissionCode),
        eq(novaPermissionGrants.isGranted, true)
      )
    )
    .limit(1);
  
  return grant.length > 0;
}

// Grant permission to user
export async function grantPermission(
  userId: string,
  permissionCode: string,
  actorId: string,
  reason?: string
): Promise<boolean> {
  try {
    const existingGrant = await db
      .select()
      .from(novaPermissionGrants)
      .where(
        and(
          eq(novaPermissionGrants.userId, userId),
          eq(novaPermissionGrants.permissionCode, permissionCode)
        )
      )
      .limit(1);
    
    const previousState = existingGrant[0]?.isGranted ?? false;
    
    if (existingGrant.length > 0) {
      await db
        .update(novaPermissionGrants)
        .set({
          isGranted: true,
          grantedBy: actorId,
          grantedAt: new Date(),
          revokedBy: null,
          revokedAt: null,
          reason,
          updatedAt: new Date(),
        })
        .where(eq(novaPermissionGrants.id, existingGrant[0].id));
    } else {
      await db.insert(novaPermissionGrants).values({
        userId,
        permissionCode,
        isGranted: true,
        grantedBy: actorId,
        grantedAt: new Date(),
        reason,
      });
    }
    
    // Log audit
    await db.insert(novaPermissionAudit).values({
      userId,
      actorId,
      action: "grant",
      permissionCode,
      previousState,
      newState: true,
      reason,
    });
    
    return true;
  } catch (error) {
    console.error("[Nova Permissions] Grant error:", error);
    return false;
  }
}

// Revoke permission from user
export async function revokePermission(
  userId: string,
  permissionCode: string,
  actorId: string,
  reason?: string
): Promise<boolean> {
  try {
    const existingGrant = await db
      .select()
      .from(novaPermissionGrants)
      .where(
        and(
          eq(novaPermissionGrants.userId, userId),
          eq(novaPermissionGrants.permissionCode, permissionCode)
        )
      )
      .limit(1);
    
    const previousState = existingGrant[0]?.isGranted ?? false;
    
    if (existingGrant.length > 0) {
      await db
        .update(novaPermissionGrants)
        .set({
          isGranted: false,
          revokedBy: actorId,
          revokedAt: new Date(),
          reason,
          updatedAt: new Date(),
        })
        .where(eq(novaPermissionGrants.id, existingGrant[0].id));
    }
    
    // Log audit
    await db.insert(novaPermissionAudit).values({
      userId,
      actorId,
      action: "revoke",
      permissionCode,
      previousState,
      newState: false,
      reason,
    });
    
    return true;
  } catch (error) {
    console.error("[Nova Permissions] Revoke error:", error);
    return false;
  }
}

// Apply preset to user
export async function applyPreset(
  userId: string,
  presetCode: string,
  actorId: string
): Promise<boolean> {
  try {
    const preset = await db
      .select()
      .from(novaPermissionPresets)
      .where(eq(novaPermissionPresets.code, presetCode))
      .limit(1);
    
    if (!preset[0]) return false;
    
    const permissions = preset[0].permissions as string[];
    
    // Revoke all current permissions
    await db
      .update(novaPermissionGrants)
      .set({ isGranted: false, revokedBy: actorId, revokedAt: new Date() })
      .where(eq(novaPermissionGrants.userId, userId));
    
    // Grant permissions from preset
    for (const permCode of permissions) {
      await grantPermission(userId, permCode, actorId, `Applied preset: ${presetCode}`);
    }
    
    // Log bulk action
    await db.insert(novaPermissionAudit).values({
      userId,
      actorId,
      action: "apply_preset",
      permissionCodes: permissions,
      reason: `Applied preset: ${preset[0].nameEn}`,
    });
    
    return true;
  } catch (error) {
    console.error("[Nova Permissions] Apply preset error:", error);
    return false;
  }
}

// ==================== Middleware للتحقق من الصلاحيات ====================

// Permission enforcement middleware factory
export function requireNovaPermission(permissionCode: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = (req as any).session;
    const userId = session?.userId || session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        errorAr: "المصادقة مطلوبة",
      });
    }
    
    const permitted = await hasPermission(userId, permissionCode);
    
    if (!permitted) {
      return res.status(403).json({
        success: false,
        error: `Permission denied: ${permissionCode}`,
        errorAr: `الصلاحية مرفوضة: ${permissionCode}`,
        requiredPermission: permissionCode,
      });
    }
    
    next();
  };
}

// ==================== API Routes ====================

export function registerNovaPermissionRoutes(app: Express): void {
  
  // Initialize permissions on startup
  initializeDefaultPermissions();
  
  // ==================== الحصول على جميع الصلاحيات المتاحة ====================
  app.get("/api/nova/permissions", async (req: Request, res: Response) => {
    try {
      const permissions = await db
        .select()
        .from(novaPermissions)
        .orderBy(novaPermissions.category, novaPermissions.code);
      
      // Group by category
      const grouped: Record<string, NovaPermission[]> = {};
      for (const perm of permissions) {
        if (!grouped[perm.category]) {
          grouped[perm.category] = [];
        }
        grouped[perm.category].push(perm);
      }
      
      res.json({
        success: true,
        permissions,
        grouped,
        categories: Object.keys(grouped),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== الحصول على صلاحيات المستخدم ====================
  app.get("/api/nova/permissions/user/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // Get all permissions
      const allPermissions = await db.select().from(novaPermissions);
      
      // Get user grants
      const grants = await db
        .select()
        .from(novaPermissionGrants)
        .where(eq(novaPermissionGrants.userId, userId));
      
      const grantMap = new Map(grants.map(g => [g.permissionCode, g]));
      
      // Combine permissions with grant status
      const userPermissions = allPermissions.map(perm => ({
        ...perm,
        isGranted: grantMap.get(perm.code)?.isGranted ?? false,
        grantedAt: grantMap.get(perm.code)?.grantedAt,
        grantedBy: grantMap.get(perm.code)?.grantedBy,
      }));
      
      // Group by category
      const grouped: Record<string, typeof userPermissions> = {};
      for (const perm of userPermissions) {
        if (!grouped[perm.category]) {
          grouped[perm.category] = [];
        }
        grouped[perm.category].push(perm);
      }
      
      // Count statistics
      const stats = {
        total: allPermissions.length,
        granted: userPermissions.filter(p => p.isGranted).length,
        bySecurityLevel: {
          high: userPermissions.filter(p => p.isGranted && p.securityLevel === "high").length,
          medium: userPermissions.filter(p => p.isGranted && p.securityLevel === "medium").length,
          low: userPermissions.filter(p => p.isGranted && p.securityLevel === "low").length,
          danger: userPermissions.filter(p => p.isGranted && p.securityLevel === "danger").length,
        },
      };
      
      res.json({
        success: true,
        userId,
        permissions: userPermissions,
        grouped,
        stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== منح صلاحية ====================
  app.post("/api/nova/permissions/grant", async (req: Request, res: Response) => {
    try {
      const { userId, permissionCode, reason } = req.body;
      const session = (req as any).session;
      const actorId = session?.userId || session?.user?.id || "system";
      
      if (!userId || !permissionCode) {
        return res.status(400).json({
          success: false,
          error: "userId and permissionCode required",
          errorAr: "مطلوب معرف المستخدم وكود الصلاحية",
        });
      }
      
      const result = await grantPermission(userId, permissionCode, actorId, reason);
      
      res.json({
        success: result,
        message: result ? "Permission granted" : "Failed to grant permission",
        messageAr: result ? "تم منح الصلاحية" : "فشل منح الصلاحية",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== إلغاء صلاحية ====================
  app.post("/api/nova/permissions/revoke", async (req: Request, res: Response) => {
    try {
      const { userId, permissionCode, reason } = req.body;
      const session = (req as any).session;
      const actorId = session?.userId || session?.user?.id || "system";
      
      if (!userId || !permissionCode) {
        return res.status(400).json({
          success: false,
          error: "userId and permissionCode required",
          errorAr: "مطلوب معرف المستخدم وكود الصلاحية",
        });
      }
      
      const result = await revokePermission(userId, permissionCode, actorId, reason);
      
      res.json({
        success: result,
        message: result ? "Permission revoked" : "Failed to revoke permission",
        messageAr: result ? "تم إلغاء الصلاحية" : "فشل إلغاء الصلاحية",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== منح/إلغاء مجموعة صلاحيات ====================
  app.post("/api/nova/permissions/bulk", async (req: Request, res: Response) => {
    try {
      const { userId, permissions, action, reason } = req.body;
      const session = (req as any).session;
      const actorId = session?.userId || session?.user?.id || "system";
      
      if (!userId || !Array.isArray(permissions) || !["grant", "revoke"].includes(action)) {
        return res.status(400).json({
          success: false,
          error: "Invalid request",
          errorAr: "طلب غير صالح",
        });
      }
      
      const results: { code: string; success: boolean }[] = [];
      
      for (const permCode of permissions) {
        const success = action === "grant"
          ? await grantPermission(userId, permCode, actorId, reason)
          : await revokePermission(userId, permCode, actorId, reason);
        results.push({ code: permCode, success });
      }
      
      res.json({
        success: true,
        results,
        successCount: results.filter(r => r.success).length,
        failCount: results.filter(r => !r.success).length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== تطبيق Preset ====================
  app.post("/api/nova/permissions/apply-preset", async (req: Request, res: Response) => {
    try {
      const { userId, presetCode } = req.body;
      const session = (req as any).session;
      const actorId = session?.userId || session?.user?.id || "system";
      
      if (!userId || !presetCode) {
        return res.status(400).json({
          success: false,
          error: "userId and presetCode required",
          errorAr: "مطلوب معرف المستخدم وكود الإعداد المسبق",
        });
      }
      
      const result = await applyPreset(userId, presetCode, actorId);
      
      res.json({
        success: result,
        message: result ? "Preset applied" : "Failed to apply preset",
        messageAr: result ? "تم تطبيق الإعداد المسبق" : "فشل تطبيق الإعداد المسبق",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== الحصول على Presets ====================
  app.get("/api/nova/permissions/presets", async (req: Request, res: Response) => {
    try {
      const presets = await db
        .select()
        .from(novaPermissionPresets)
        .orderBy(novaPermissionPresets.displayOrder);
      
      res.json({
        success: true,
        presets,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== سجل التدقيق ====================
  app.get("/api/nova/permissions/audit/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const audit = await db
        .select()
        .from(novaPermissionAudit)
        .where(eq(novaPermissionAudit.userId, userId))
        .orderBy(desc(novaPermissionAudit.createdAt))
        .limit(limit);
      
      res.json({
        success: true,
        audit,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== التحقق من صلاحية محددة ====================
  app.get("/api/nova/permissions/check", async (req: Request, res: Response) => {
    try {
      const { userId, permissionCode } = req.query;
      
      if (!userId || !permissionCode) {
        return res.status(400).json({
          success: false,
          error: "userId and permissionCode required",
        });
      }
      
      const permitted = await hasPermission(userId as string, permissionCode as string);
      
      res.json({
        success: true,
        permitted,
        userId,
        permissionCode,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  console.log("[Nova Permissions] Routes registered at /api/nova/permissions/*");
}
