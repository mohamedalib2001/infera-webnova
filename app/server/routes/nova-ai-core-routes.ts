import { Router, Request, Response, NextFunction } from "express";
import { novaAICore, NLPAnalysisResult, TechnicalSpecification, SectorContext } from "../lib/nova-ai-core";
import { randomUUID } from "crypto";
import { storage } from "../storage";

const router = Router();

const ROOT_OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60000;

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
      console.log(`[Nova AI Core] Access denied for user: ${user?.email || userId}`);
      return res.status(403).json({
        success: false,
        error: "صلاحيات المالك مطلوبة / Owner access required"
      });
    }
    next();
  } catch (error) {
    console.error("[Nova AI Core] Owner validation error:", error);
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

const logRequest = (endpoint: string, traceId: string, userId?: string) => {
  console.log(`[Nova AI Core] ${new Date().toISOString()} | TraceID: ${traceId} | Endpoint: ${endpoint} | User: ${userId || "anonymous"}`);
};

router.use(authMiddleware);
router.use(ownerOnlyMiddleware);
router.use(rateLimitMiddleware);

router.post("/analyze", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  const userId = session?.userId;
  logRequest("/analyze", traceId, userId);
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== "string") {
      return res.status(400).json({ 
        success: false, 
        error: "النص مطلوب / Text is required" 
      });
    }

    const result = await novaAICore.analyzeRequirements(text);
    
    res.json({
      success: true,
      data: result,
      message: "تم تحليل المتطلبات بنجاح / Requirements analyzed successfully"
    });
  } catch (error) {
    console.error("[Nova AI Core] Analyze error:", error);
    res.status(500).json({ 
      success: false, 
      error: "فشل تحليل المتطلبات / Failed to analyze requirements" 
    });
  }
});

router.post("/sector-context", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  const userId = session?.userId;
  logRequest("/sector-context", traceId, userId);
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== "string") {
      return res.status(400).json({ 
        success: false, 
        error: "النص مطلوب / Text is required" 
      });
    }

    const context = novaAICore.analyzeSectorContext(text);
    
    res.json({
      success: true,
      data: context,
      message: "تم تحليل السياق القطاعي / Sector context analyzed"
    });
  } catch (error) {
    console.error("[Nova AI Core] Sector context error:", error);
    res.status(500).json({ 
      success: false, 
      error: "فشل تحليل السياق القطاعي / Failed to analyze sector context" 
    });
  }
});

router.post("/generate-specification", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  const userId = session?.userId;
  logRequest("/generate-specification", traceId, userId);
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== "string") {
      return res.status(400).json({ 
        success: false, 
        error: "النص مطلوب / Text is required" 
      });
    }

    const nlpResult = await novaAICore.analyzeRequirements(text);
    const sectorContext = novaAICore.analyzeSectorContext(text);
    const specification = await novaAICore.convertToSpecification(nlpResult, sectorContext);
    
    res.json({
      success: true,
      data: {
        analysis: nlpResult,
        sectorContext,
        specification
      },
      message: "تم إنشاء المواصفات الفنية / Technical specification generated"
    });
  } catch (error) {
    console.error("[Nova AI Core] Generate specification error:", error);
    res.status(500).json({ 
      success: false, 
      error: "فشل إنشاء المواصفات الفنية / Failed to generate specification" 
    });
  }
});

router.post("/full-analysis", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  const userId = session?.userId;
  logRequest("/full-analysis", traceId, userId);
  try {
    const { text, options } = req.body;
    
    if (!text || typeof text !== "string") {
      return res.status(400).json({ 
        success: false, 
        error: "النص مطلوب / Text is required" 
      });
    }

    const startTime = Date.now();
    
    const [nlpResult, sectorContext] = await Promise.all([
      novaAICore.analyzeRequirements(text),
      Promise.resolve(novaAICore.analyzeSectorContext(text))
    ]);
    
    const specification = await novaAICore.convertToSpecification(nlpResult, sectorContext);
    
    const processingTime = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        input: {
          text,
          language: nlpResult.language,
          timestamp: new Date().toISOString()
        },
        analysis: {
          nlp: nlpResult,
          sector: sectorContext
        },
        output: {
          specification
        },
        metadata: {
          processingTimeMs: processingTime,
          version: "1.0.0",
          engine: "Nova AI Core"
        }
      },
      message: "تم التحليل الكامل بنجاح / Full analysis completed successfully"
    });
  } catch (error) {
    console.error("[Nova AI Core] Full analysis error:", error);
    res.status(500).json({ 
      success: false, 
      error: "فشل التحليل الكامل / Failed to complete full analysis" 
    });
  }
});

router.get("/sectors", (_req: Request, res: Response) => {
  const sectors = [
    { id: "healthcare", nameAr: "القطاع الصحي", nameEn: "Healthcare", icon: "Heart" },
    { id: "military", nameAr: "القطاع العسكري", nameEn: "Military/Defense", icon: "Shield" },
    { id: "government", nameAr: "القطاع الحكومي", nameEn: "Government", icon: "Building" },
    { id: "commercial", nameAr: "القطاع التجاري", nameEn: "Commercial", icon: "ShoppingCart" },
    { id: "education", nameAr: "القطاع التعليمي", nameEn: "Education", icon: "GraduationCap" },
    { id: "financial", nameAr: "القطاع المالي", nameEn: "Financial", icon: "Banknote" }
  ];
  
  res.json({
    success: true,
    data: sectors
  });
});

router.get("/capabilities", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      nlp: {
        languages: ["ar", "en", "mixed"],
        features: [
          "Intent Detection",
          "Entity Extraction", 
          "Relationship Mapping",
          "Sentiment Analysis",
          "Complexity Assessment",
          "Keyword Extraction"
        ]
      },
      sectorAnalysis: {
        sectors: ["healthcare", "military", "government", "commercial", "education", "financial"],
        features: [
          "Automatic Sector Detection",
          "Compliance Requirements",
          "Security Level Assessment",
          "Risk Factor Analysis",
          "Architecture Recommendations"
        ]
      },
      specificationGeneration: {
        outputs: [
          "Platform Configuration",
          "Architecture Design",
          "Feature Specifications",
          "Integration Requirements",
          "Timeline Estimation",
          "Budget Projection"
        ]
      }
    }
  });
});

export default router;
