import { Router, Request, Response, NextFunction } from "express";
import { selfLearningEngine } from "../lib/self-learning-engine";

const router = Router();

const ROOT_OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ 
      error: "Authentication required",
      errorAr: "المصادقة مطلوبة"
    });
  }
  next();
};

const ownerOnlyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userEmail = req.session?.user?.email;
  if (userEmail !== ROOT_OWNER_EMAIL) {
    return res.status(403).json({
      error: "Owner access required",
      errorAr: "مطلوب صلاحيات المالك"
    });
  }
  next();
};

const requestCounts = new Map<string, { count: number; resetAt: number }>();

const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const key = req.session?.user?.id || req.ip || "anonymous";
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 25;

  let record = requestCounts.get(key);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
    requestCounts.set(key, record);
  }

  record.count++;
  if (record.count > maxRequests) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      errorAr: "تم تجاوز حد الطلبات"
    });
  }

  next();
};

router.post("/learn", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { projectId, sector, architecture, buildMetrics, feedback } = req.body;
    
    if (!projectId || !sector || !architecture) {
      return res.status(400).json({
        error: "Project data required",
        errorAr: "بيانات المشروع مطلوبة"
      });
    }

    const result = await selfLearningEngine.learnFromProject({
      id: projectId,
      sector,
      architecture,
      buildMetrics: buildMetrics || {
        buildTime: 0,
        errorRate: 0,
        performanceScore: 80,
        securityScore: 80,
        userSatisfaction: 80,
        reusability: 70
      },
      feedback
    });

    res.json({
      ...result,
      message: `Learned ${result.patterns.length} patterns and ${result.insights.length} insights`,
      messageAr: `تم تعلم ${result.patterns.length} نمط و ${result.insights.length} رؤية`
    });
  } catch (error) {
    res.status(500).json({
      error: "Learning failed",
      errorAr: "فشل التعلم"
    });
  }
});

router.get("/stats", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const stats = selfLearningEngine.getKnowledgeStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get stats",
      errorAr: "فشل في جلب الإحصائيات"
    });
  }
});

router.get("/insights", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { type, sector, minConfidence } = req.query;
    const insights = selfLearningEngine.getInsights({
      type: type as string,
      sector: sector as string,
      minConfidence: minConfidence ? parseInt(minConfidence as string) : undefined
    });
    res.json({ insights });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get insights",
      errorAr: "فشل في جلب الرؤى"
    });
  }
});

router.get("/sectors", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const profiles = selfLearningEngine.getSectorProfiles();
    res.json({ sectors: profiles });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get sector profiles",
      errorAr: "فشل في جلب ملفات القطاعات"
    });
  }
});

router.post("/sector-recommendations", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { sector, requirements } = req.body;
    
    if (!sector) {
      return res.status(400).json({
        error: "Sector required",
        errorAr: "القطاع مطلوب"
      });
    }

    const recommendations = await selfLearningEngine.getSectorRecommendations(
      sector,
      requirements || {}
    );

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get recommendations",
      errorAr: "فشل في جلب التوصيات"
    });
  }
});

router.post("/optimize", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { algorithm, currentPerformance } = req.body;
    
    if (!algorithm) {
      return res.status(400).json({
        error: "Algorithm name required",
        errorAr: "اسم الخوارزمية مطلوب"
      });
    }

    const optimization = await selfLearningEngine.proposeAlgorithmOptimization(
      algorithm,
      currentPerformance || {}
    );

    res.json({
      optimization,
      message: "Optimization proposed",
      messageAr: "تم اقتراح التحسين"
    });
  } catch (error) {
    res.status(500).json({
      error: "Optimization failed",
      errorAr: "فشل التحسين"
    });
  }
});

router.get("/optimizations", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const optimizations = selfLearningEngine.getOptimizations();
    res.json({ optimizations });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get optimizations",
      errorAr: "فشل في جلب التحسينات"
    });
  }
});

router.post("/optimizations/:id/approve", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const success = selfLearningEngine.approveOptimization(id);
    
    if (!success) {
      return res.status(404).json({
        error: "Optimization not found or not in proposed state",
        errorAr: "التحسين غير موجود أو ليس في حالة الاقتراح"
      });
    }

    res.json({
      success: true,
      message: "Optimization approved",
      messageAr: "تم الموافقة على التحسين"
    });
  } catch (error) {
    res.status(500).json({
      error: "Approval failed",
      errorAr: "فشلت الموافقة"
    });
  }
});

export default router;
