import { Router, Request, Response } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { registerSchema, loginSchema } from "../../db/schema/users";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      messageAr: "تم إنشاء الحساب بنجاح",
      messageEn: "Account created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "validation_error",
        details: error.errors,
      });
    }
    console.error("[Auth] Register error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
      messageAr: "خطأ في الخادم",
      messageEn: "Server error",
    });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const result = await authService.login(
      data.email,
      data.password,
      ipAddress,
      userAgent
    );

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      messageAr: "تم تسجيل الدخول بنجاح",
      messageEn: "Login successful",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "validation_error",
        details: error.errors,
      });
    }
    console.error("[Auth] Login error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
      messageAr: "خطأ في الخادم",
      messageEn: "Server error",
    });
  }
});

router.post("/logout", authMiddleware, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.substring(7) || "";
    await authService.logout(req.user!.userId, token);

    res.json({
      success: true,
      messageAr: "تم تسجيل الخروج بنجاح",
      messageEn: "Logout successful",
    });
  } catch (error) {
    console.error("[Auth] Logout error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "missing_token",
        messageAr: "التوكن مطلوب",
        messageEn: "Refresh token is required",
      });
    }

    const result = await authService.refreshTokens(refreshToken);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
        messageAr: "انتهت صلاحية الجلسة",
        messageEn: "Session expired",
      });
    }

    res.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    console.error("[Auth] Refresh error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { db } = await import("../config/database");
    const { users } = await import("../../db/schema/users");
    const { eq } = await import("drizzle-orm");

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.userId),
      with: { role: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "user_not_found",
      });
    }

    const { password, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error("[Auth] Get me error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "missing_email",
        messageAr: "البريد الإلكتروني مطلوب",
        messageEn: "Email is required",
      });
    }

    await authService.requestPasswordReset(email);

    res.json({
      success: true,
      messageAr: "إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط استعادة كلمة المرور",
      messageEn: "If the email exists, a password reset link will be sent",
    });
  } catch (error) {
    console.error("[Auth] Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: "missing_fields",
        messageAr: "جميع الحقول مطلوبة",
        messageEn: "All fields are required",
      });
    }

    const result = await authService.resetPassword(token, password);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      messageAr: "تم تغيير كلمة المرور بنجاح",
      messageEn: "Password changed successfully",
    });
  } catch (error) {
    console.error("[Auth] Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

router.post("/change-password", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: "missing_fields",
        messageAr: "جميع الحقول مطلوبة",
        messageEn: "All fields are required",
      });
    }

    const result = await authService.changePassword(
      req.user!.userId,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      messageAr: "تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مجدداً",
      messageEn: "Password changed successfully. Please login again",
    });
  } catch (error) {
    console.error("[Auth] Change password error:", error);
    res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

export default router;
