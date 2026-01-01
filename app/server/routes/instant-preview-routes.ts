import { Router, Request, Response, NextFunction } from "express";
import { instantPreviewEngine } from "../lib/instant-preview-engine";
import { randomUUID } from "crypto";
import { storage } from "../storage";

const router = Router();

const ROOT_OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60000;

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  if (!session?.userId) {
    return res.status(401).json({
      success: false,
      error: "يجب تسجيل الدخول / Authentication required"
    });
  }
  next();
};

const ownerOnlyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  const userId = session?.userId;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "يجب تسجيل الدخول / Authentication required"
    });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user || user.email !== ROOT_OWNER_EMAIL) {
      console.log(`[Instant Preview] Access denied for user: ${user?.email || userId}`);
      return res.status(403).json({
        success: false,
        error: "صلاحيات المالك مطلوبة / Owner access required"
      });
    }
    next();
  } catch (error) {
    console.error("[Instant Preview] Owner validation error:", error);
    return res.status(500).json({
      success: false,
      error: "فشل التحقق من الصلاحيات / Permission validation failed"
    });
  }
};

const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const session = req.session as any;
  const clientId = session?.userId || req.ip || "anonymous";
  const now = Date.now();
  const record = requestCounts.get(clientId);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return next();
  }
  
  if (record.count >= RATE_LIMIT) {
    return res.status(429).json({
      success: false,
      error: "تم تجاوز حد الطلبات / Rate limit exceeded",
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
  }
  
  record.count++;
  next();
};

const logRequest = (endpoint: string, traceId: string, userId?: string) => {
  console.log(`[Instant Preview] ${new Date().toISOString()} | TraceID: ${traceId} | Endpoint: ${endpoint} | User: ${userId || "anonymous"}`);
};

router.use(authMiddleware);
router.use(ownerOnlyMiddleware);
router.use(rateLimitMiddleware);

router.post("/generate", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  logRequest("/generate", traceId, session?.userId);

  try {
    const { architecture, component } = req.body;
    
    if (!architecture) {
      return res.status(400).json({
        success: false,
        error: "مواصفات البنية مطلوبة / Architecture specification required"
      });
    }

    const preview = await instantPreviewEngine.generateLivePreview(architecture, component);
    
    res.json({
      success: true,
      data: preview,
      traceId
    });
  } catch (error) {
    console.error(`[Instant Preview] Error (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل توليد المعاينة / Failed to generate preview",
      traceId
    });
  }
});

router.post("/analyze", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  logRequest("/analyze", traceId, session?.userId);

  try {
    const { code, type } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: "الكود مطلوب / Code is required"
      });
    }

    const analysis = await instantPreviewEngine.analyzeAndSuggest(code, type || "full");
    
    res.json({
      success: true,
      data: analysis,
      traceId
    });
  } catch (error) {
    console.error(`[Instant Preview] Error (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل تحليل الكود / Failed to analyze code",
      traceId
    });
  }
});

router.post("/component", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  logRequest("/component", traceId, session?.userId);

  try {
    const { componentType, props } = req.body;
    
    if (!componentType) {
      return res.status(400).json({
        success: false,
        error: "نوع المكون مطلوب / Component type is required"
      });
    }

    const html = await instantPreviewEngine.generateComponentPreview(componentType, props || {});
    
    res.json({
      success: true,
      data: { html },
      traceId
    });
  } catch (error) {
    console.error(`[Instant Preview] Error (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل توليد المكون / Failed to generate component",
      traceId
    });
  }
});

router.get("/preview/:id", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  logRequest(`/preview/${req.params.id}`, traceId, session?.userId);

  try {
    const preview = instantPreviewEngine.getPreview(req.params.id);
    
    if (!preview) {
      return res.status(404).json({
        success: false,
        error: "المعاينة غير موجودة / Preview not found"
      });
    }
    
    res.json({
      success: true,
      data: preview,
      traceId
    });
  } catch (error) {
    console.error(`[Instant Preview] Error (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل جلب المعاينة / Failed to fetch preview",
      traceId
    });
  }
});

router.patch("/preview/:id", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  logRequest(`/preview/${req.params.id} (PATCH)`, traceId, session?.userId);

  try {
    const updated = instantPreviewEngine.updatePreview(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "المعاينة غير موجودة / Preview not found"
      });
    }
    
    res.json({
      success: true,
      data: updated,
      traceId
    });
  } catch (error) {
    console.error(`[Instant Preview] Error (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل تحديث المعاينة / Failed to update preview",
      traceId
    });
  }
});

router.get("/templates", async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      components: [
        { type: "card", name: "بطاقة", nameEn: "Card" },
        { type: "button", name: "زر", nameEn: "Button" },
        { type: "form", name: "نموذج", nameEn: "Form" },
        { type: "table", name: "جدول", nameEn: "Table" },
        { type: "dashboard", name: "لوحة تحكم", nameEn: "Dashboard" }
      ],
      layouts: [
        { type: "sidebar", name: "شريط جانبي", nameEn: "Sidebar" },
        { type: "topnav", name: "قائمة علوية", nameEn: "Top Navigation" },
        { type: "dashboard", name: "لوحة تحكم", nameEn: "Dashboard" }
      ]
    }
  });
});

export default router;
