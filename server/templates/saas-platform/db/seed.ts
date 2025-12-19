import { db } from "../server/config/database";
import { roles, permissions, rolePermissions, users } from "./schema/users";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("[Seed] Starting database seeding...");

  const existingRoles = await db.select().from(roles);
  if (existingRoles.length > 0) {
    console.log("[Seed] Roles already exist. Skipping seed.");
    return;
  }

  console.log("[Seed] Creating roles...");
  const [adminRole, moderatorRole, userRole] = await db.insert(roles).values([
    {
      name: "admin",
      nameAr: "مدير",
      description: "Full system access",
      descriptionAr: "صلاحيات كاملة للنظام",
      isSystem: true,
    },
    {
      name: "moderator",
      nameAr: "مشرف",
      description: "Moderate users and content",
      descriptionAr: "إدارة المستخدمين والمحتوى",
      isSystem: true,
    },
    {
      name: "user",
      nameAr: "مستخدم",
      description: "Standard user access",
      descriptionAr: "صلاحيات المستخدم العادي",
      isSystem: true,
    },
  ]).returning();

  console.log("[Seed] Creating permissions...");
  const permissionsList = await db.insert(permissions).values([
    { name: "users.view", nameAr: "عرض المستخدمين", category: "users" },
    { name: "users.create", nameAr: "إنشاء مستخدم", category: "users" },
    { name: "users.update", nameAr: "تحديث مستخدم", category: "users" },
    { name: "users.delete", nameAr: "حذف مستخدم", category: "users" },
    { name: "users.manage_roles", nameAr: "إدارة الصلاحيات", category: "users" },
    { name: "audit.view", nameAr: "عرض سجل المراقبة", category: "audit" },
    { name: "settings.view", nameAr: "عرض الإعدادات", category: "settings" },
    { name: "settings.update", nameAr: "تحديث الإعدادات", category: "settings" },
  ]).returning();

  console.log("[Seed] Assigning permissions to roles...");
  const adminPermissions = permissionsList.map(p => ({
    roleId: adminRole.id,
    permissionId: p.id,
  }));

  const moderatorPermissions = permissionsList
    .filter(p => ["users.view", "users.update", "audit.view"].includes(p.name))
    .map(p => ({
      roleId: moderatorRole.id,
      permissionId: p.id,
    }));

  await db.insert(rolePermissions).values([
    ...adminPermissions,
    ...moderatorPermissions,
  ]);

  console.log("[Seed] Creating default admin user...");
  const hashedPassword = await bcrypt.hash("Admin@123456", 12);

  await db.insert(users).values({
    email: "admin@platform.local",
    username: "admin",
    password: hashedPassword,
    firstName: "مدير",
    lastName: "النظام",
    roleId: adminRole.id,
    status: "active",
    isVerified: true,
    preferredLanguage: "ar",
  });

  console.log("[Seed] Database seeding completed successfully!");
  console.log("[Seed] Default admin credentials:");
  console.log("  Email: admin@platform.local");
  console.log("  Password: Admin@123456");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[Seed] Error:", error);
    process.exit(1);
  });
