import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "unauthorized",
      messageAr: "غير مصرح بالوصول",
      messageEn: "Unauthorized access",
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = await authService.validateToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: "invalid_token",
      messageAr: "انتهت صلاحية الجلسة",
      messageEn: "Session expired",
    });
    return;
  }

  req.user = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "unauthorized",
        messageAr: "غير مصرح بالوصول",
        messageEn: "Unauthorized access",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: "forbidden",
        messageAr: "ليس لديك صلاحية لهذا الإجراء",
        messageEn: "You don't have permission for this action",
      });
      return;
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  return requireRole("admin")(req, res, next);
}

export function requireModerator(req: Request, res: Response, next: NextFunction): void {
  return requireRole("admin", "moderator")(req, res, next);
}
