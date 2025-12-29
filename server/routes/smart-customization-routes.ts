import { Router, Request, Response, NextFunction } from "express";
import { smartCustomizationEngine } from "../lib/smart-customization-engine";

const router = Router();

const ROOT_OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ 
      error: "Authentication required",
      errorAr: "يجب تسجيل الدخول"
    });
  }
  next();
};

const ownerOnlyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userEmail = req.session?.user?.email;
  if (userEmail !== ROOT_OWNER_EMAIL) {
    return res.status(403).json({
      error: "Owner-only access",
      errorAr: "الوصول مقصور على المالك فقط"
    });
  }
  next();
};

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 25;
  
  const record = requestCounts.get(ip);
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  if (record.count >= maxRequests) {
    return res.status(429).json({ 
      error: "Rate limit exceeded", 
      errorAr: "تجاوزت الحد المسموح" 
    });
  }
  
  record.count++;
  next();
};

router.post("/command", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { command, architecture } = req.body;
    
    if (!command || typeof command !== "string") {
      return res.status(400).json({ 
        error: "Command required",
        errorAr: "الأمر مطلوب"
      });
    }
    
    const sessionId = req.session?.user?.id || "default";
    const result = await smartCustomizationEngine.processCommand(
      sessionId,
      command,
      architecture || {}
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: "Processing failed",
      errorAr: "فشل في المعالجة"
    });
  }
});

router.post("/suggestions", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { architecture } = req.body;
    const suggestions = await smartCustomizationEngine.generateSuggestions(architecture || {});
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to generate suggestions",
      errorAr: "فشل في توليد المقترحات"
    });
  }
});

router.post("/deep-modify", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { modification, architecture } = req.body;
    
    if (!modification?.type) {
      return res.status(400).json({ 
        error: "Modification type required",
        errorAr: "نوع التعديل مطلوب"
      });
    }
    
    const sessionId = req.session?.user?.id || "default";
    const result = await smartCustomizationEngine.applyDeepModification(
      sessionId,
      modification,
      architecture || {}
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: "Deep modification failed",
      errorAr: "فشل التعديل العميق"
    });
  }
});

router.post("/batch", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { commands, architecture } = req.body;
    
    if (!Array.isArray(commands) || commands.length === 0) {
      return res.status(400).json({ 
        error: "Commands array required",
        errorAr: "قائمة الأوامر مطلوبة"
      });
    }
    
    const sessionId = req.session?.user?.id || "default";
    const results = await smartCustomizationEngine.batchCommands(
      sessionId,
      commands,
      architecture || {}
    );
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ 
      error: "Batch processing failed",
      errorAr: "فشل معالجة الدفعة"
    });
  }
});

router.post("/undo", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const sessionId = req.session?.user?.id || "default";
    const undone = smartCustomizationEngine.undoLastCommand(sessionId);
    
    if (!undone) {
      return res.status(404).json({ 
        error: "Nothing to undo",
        errorAr: "لا يوجد ما يمكن التراجع عنه"
      });
    }
    
    const currentArch = smartCustomizationEngine.getCurrentArchitecture(sessionId);
    res.json({ undone, currentArchitecture: currentArch });
  } catch (error) {
    res.status(500).json({ 
      error: "Undo failed",
      errorAr: "فشل التراجع"
    });
  }
});

router.get("/history", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const sessionId = req.session?.user?.id || "default";
    const history = smartCustomizationEngine.getHistory(sessionId);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ 
      error: "Failed to get history",
      errorAr: "فشل في جلب السجل"
    });
  }
});

export default router;
