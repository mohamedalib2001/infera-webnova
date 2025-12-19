import bcrypt from "bcryptjs";
import { randomUUID, createHash } from "crypto";
import jwt from "jsonwebtoken";
import { db } from "../config/database";
import { users, sessions, roles, auditLogs, passwordResets } from "../../db/schema/users";
import { eq, and, gt, lt } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

interface AuthResult {
  success: boolean;
  user?: Omit<typeof users.$inferSelect, "password">;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  errorAr?: string;
  errorEn?: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type: "access" | "refresh";
}

export class AuthService {
  async register(data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResult> {
    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, data.email.toLowerCase()),
    });

    if (existingEmail) {
      return {
        success: false,
        error: "email_exists",
        errorAr: "البريد الإلكتروني مستخدم بالفعل",
        errorEn: "Email is already registered",
      };
    }

    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, data.username.toLowerCase()),
    });

    if (existingUsername) {
      return {
        success: false,
        error: "username_exists",
        errorAr: "اسم المستخدم مستخدم بالفعل",
        errorEn: "Username is already taken",
      };
    }

    const defaultRole = await db.query.roles.findFirst({
      where: eq(roles.name, "user"),
    });

    if (!defaultRole) {
      return {
        success: false,
        error: "role_not_found",
        errorAr: "خطأ في النظام",
        errorEn: "System configuration error",
      };
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const [newUser] = await db.insert(users).values({
      email: data.email.toLowerCase(),
      username: data.username.toLowerCase(),
      password: hashedPassword,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      roleId: defaultRole.id,
      status: "active",
      isVerified: false,
    }).returning();

    await this.logAction(newUser.id, "user.register", "user", newUser.id);

    const { password, ...safeUser } = newUser;
    const tokens = await this.generateTokens(newUser, defaultRole.name);

    return {
      success: true,
      user: safeUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<AuthResult> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
      with: { role: true },
    });

    if (!user) {
      return {
        success: false,
        error: "invalid_credentials",
        errorAr: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        errorEn: "Invalid email or password",
      };
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return {
        success: false,
        error: "account_locked",
        errorAr: `الحساب مقفل. حاول بعد ${remainingMinutes} دقيقة`,
        errorEn: `Account locked. Try again in ${remainingMinutes} minutes`,
      };
    }

    if (user.status !== "active") {
      return {
        success: false,
        error: "account_inactive",
        errorAr: "الحساب معطل. تواصل مع الدعم",
        errorEn: "Account is disabled. Contact support",
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      const attempts = user.failedLoginAttempts + 1;
      const updates: any = { failedLoginAttempts: attempts };

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        updates.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60000);
        await this.logAction(user.id, "user.locked", "user", user.id, null, { attempts });
      }

      await db.update(users).set(updates).where(eq(users.id, user.id));

      return {
        success: false,
        error: "invalid_credentials",
        errorAr: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        errorEn: "Invalid email or password",
      };
    }

    await db.update(users).set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress || null,
    }).where(eq(users.id, user.id));

    const tokens = await this.generateTokens(user, user.role.name);

    await db.insert(sessions).values({
      userId: user.id,
      token: hashToken(tokens.accessToken),
      refreshToken: hashToken(tokens.refreshToken),
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.logAction(user.id, "user.login", "session", null, null, { ipAddress });

    const { password: _, ...safeUser } = user;

    return {
      success: true,
      user: safeUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string, token: string): Promise<void> {
    const hashedToken = hashToken(token);
    await db.delete(sessions).where(
      and(eq(sessions.userId, userId), eq(sessions.token, hashedToken))
    );
    await this.logAction(userId, "user.logout", "session", null);
  }

  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload;

      if (payload.type !== "refresh") {
        return { success: false, error: "invalid_token" };
      }

      const hashedRefreshToken = hashToken(refreshToken);
      const session = await db.query.sessions.findFirst({
        where: and(
          eq(sessions.refreshToken, hashedRefreshToken),
          gt(sessions.expiresAt, new Date())
        ),
        with: { user: { with: { role: true } } },
      });

      if (!session || !session.user) {
        return { success: false, error: "session_expired" };
      }

      if (session.user.status !== "active") {
        await db.delete(sessions).where(eq(sessions.id, session.id));
        return { success: false, error: "account_inactive" };
      }

      const tokens = await this.generateTokens(session.user, session.user.role.name);

      await db.update(sessions).set({
        token: hashToken(tokens.accessToken),
        refreshToken: hashToken(tokens.refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }).where(eq(sessions.id, session.id));

      const { password, ...safeUser } = session.user;

      return {
        success: true,
        user: safeUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch {
      return { success: false, error: "invalid_token" };
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, error: "user_not_found" };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return {
        success: false,
        error: "invalid_password",
        errorAr: "كلمة المرور الحالية غير صحيحة",
        errorEn: "Current password is incorrect",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await db.update(users).set({
      password: hashedPassword,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));

    await db.delete(sessions).where(eq(sessions.userId, userId));
    await this.logAction(userId, "user.password_changed", "user", userId);

    return { success: true };
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      return { success: true };
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResets).values({
      userId: user.id,
      token,
      expiresAt,
    });

    await this.logAction(user.id, "user.password_reset_requested", "user", user.id);

    console.log(`[Auth] Password reset token for ${email}: ${token}`);

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    const reset = await db.query.passwordResets.findFirst({
      where: and(
        eq(passwordResets.token, token),
        gt(passwordResets.expiresAt, new Date())
      ),
    });

    if (!reset || reset.usedAt) {
      return {
        success: false,
        error: "invalid_token",
        errorAr: "رابط استعادة كلمة المرور غير صالح أو منتهي",
        errorEn: "Password reset link is invalid or expired",
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await db.update(users).set({
      password: hashedPassword,
      updatedAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    }).where(eq(users.id, reset.userId));

    await db.update(passwordResets).set({
      usedAt: new Date(),
    }).where(eq(passwordResets.id, reset.id));

    await db.delete(sessions).where(eq(sessions.userId, reset.userId));
    await this.logAction(reset.userId, "user.password_reset_completed", "user", reset.userId);

    return { success: true };
  }

  async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
      
      if (payload.type !== "access") {
        return null;
      }

      const hashedToken = hashToken(token);
      const session = await db.query.sessions.findFirst({
        where: and(
          eq(sessions.token, hashedToken),
          gt(sessions.expiresAt, new Date())
        ),
        with: { user: true },
      });

      if (!session) {
        return null;
      }

      if (session.user.status !== "active") {
        return null;
      }

      if (session.user.lockedUntil && session.user.lockedUntil > new Date()) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private async generateTokens(user: any, roleName: string) {
    const accessPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: roleName,
      type: "access",
    };

    const refreshPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: roleName,
      type: "refresh",
    };

    const accessToken = jwt.sign(accessPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(refreshPayload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

    return { accessToken, refreshToken };
  }

  private async logAction(
    userId: string | null,
    action: string,
    entityType?: string,
    entityId?: string | null,
    oldValues?: any,
    newValues?: any
  ): Promise<void> {
    await db.insert(auditLogs).values({
      userId,
      action,
      entityType: entityType || null,
      entityId: entityId || null,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
    });
  }
}

export const authService = new AuthService();
