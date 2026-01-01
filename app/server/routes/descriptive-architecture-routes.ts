import { Router, Request, Response, NextFunction } from "express";
import { descriptiveArchitectureEngine } from "../lib/descriptive-architecture-engine";
import { smartCodeGenerator } from "../lib/smart-code-generator";
import { randomUUID } from "crypto";
import { storage } from "../storage";

const router = Router();

const ROOT_OWNER_EMAIL = "mohamed.ali.b2001@gmail.com";
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 15;
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
      console.log(`[Descriptive Architecture] Access denied for user: ${user?.email || userId}`);
      return res.status(403).json({
        success: false,
        error: "صلاحيات المالك مطلوبة / Owner access required"
      });
    }
    next();
  } catch (error) {
    console.error("[Descriptive Architecture] Owner validation error:", error);
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
  console.log(`[Descriptive Architecture] ${new Date().toISOString()} | TraceID: ${traceId} | Endpoint: ${endpoint} | User: ${userId || "anonymous"}`);
};

router.use(authMiddleware);
router.use(ownerOnlyMiddleware);
router.use(rateLimitMiddleware);

router.post("/process-overview", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  logRequest("/process-overview", traceId, session?.userId);

  try {
    const { description } = req.body;
    
    if (!description || typeof description !== "string") {
      return res.status(400).json({
        success: false,
        error: "الوصف مطلوب / Description is required"
      });
    }

    const result = await descriptiveArchitectureEngine.processOverview(description);
    
    res.json({
      success: result.success,
      data: result.data,
      suggestions: result.suggestions,
      warnings: result.warnings,
      traceId
    });
  } catch (error) {
    console.error(`[Descriptive Architecture] Error (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل معالجة الوصف / Failed to process description",
      traceId
    });
  }
});

router.post("/process-data-model", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  logRequest("/process-data-model", traceId, session?.userId);

  try {
    const { requirements, context } = req.body;
    
    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: "متطلبات نموذج البيانات مطلوبة / Data model requirements are required"
      });
    }

    const result = await descriptiveArchitectureEngine.processDataModel(requirements, context || {});
    
    res.json({
      success: result.success,
      data: result.data,
      suggestions: result.suggestions,
      warnings: result.warnings,
      traceId
    });
  } catch (error) {
    console.error(`[Descriptive Architecture] Error (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل معالجة نموذج البيانات / Failed to process data model",
      traceId
    });
  }
});

router.post("/process-permissions", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  logRequest("/process-permissions", traceId, session?.userId);

  try {
    const { requirements, context } = req.body;
    
    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: "متطلبات الصلاحيات مطلوبة / Permission requirements are required"
      });
    }

    const result = await descriptiveArchitectureEngine.processPermissions(requirements, context || {});
    
    res.json({
      success: result.success,
      data: result.data,
      suggestions: result.suggestions,
      warnings: result.warnings,
      traceId
    });
  } catch (error) {
    console.error(`[Descriptive Architecture] Error (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل معالجة الصلاحيات / Failed to process permissions",
      traceId
    });
  }
});

router.post("/process-operations", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  logRequest("/process-operations", traceId, session?.userId);

  try {
    const { requirements, context } = req.body;
    
    if (!requirements) {
      return res.status(400).json({
        success: false,
        error: "متطلبات العمليات مطلوبة / Operation requirements are required"
      });
    }

    const result = await descriptiveArchitectureEngine.processOperations(requirements, context || {});
    
    res.json({
      success: result.success,
      data: result.data,
      suggestions: result.suggestions,
      warnings: result.warnings,
      traceId
    });
  } catch (error) {
    console.error(`[Descriptive Architecture] Error (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل معالجة العمليات / Failed to process operations",
      traceId
    });
  }
});

router.post("/import-document", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  logRequest("/import-document", traceId, session?.userId);

  try {
    const { content, format } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: "محتوى المستند مطلوب / Document content is required"
      });
    }

    const result = await descriptiveArchitectureEngine.parseDocument(content);
    
    res.json({
      success: true,
      data: result,
      traceId
    });
  } catch (error) {
    console.error(`[Descriptive Architecture] Error (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل استيراد المستند / Failed to import document",
      traceId
    });
  }
});

router.post("/generate-code", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  logRequest("/generate-code", traceId, session?.userId);

  try {
    const { architecture } = req.body;
    
    if (!architecture) {
      return res.status(400).json({
        success: false,
        error: "مواصفات البنية مطلوبة / Architecture specification is required"
      });
    }

    const requirements = `
Project: ${architecture.overview?.projectName || "New Project"}
Sector: ${architecture.overview?.sector || "commercial"}
Entities: ${architecture.dataModel?.entities?.map((e: any) => e.name).join(", ") || "None"}
Roles: ${architecture.permissions?.roles?.map((r: any) => r.name).join(", ") || "None"}
APIs: ${architecture.operations?.apis?.length || 0} endpoints
    `.trim();

    const backendSpec = await smartCodeGenerator.generateBackend(
      requirements,
      architecture.overview?.sector || "commercial"
    );
    
    const frontendSpec = await smartCodeGenerator.generateFrontend(
      requirements,
      backendSpec
    );
    
    const fullCode = { backend: backendSpec, frontend: frontendSpec };

    res.json({
      success: true,
      data: fullCode,
      traceId
    });
  } catch (error) {
    console.error(`[Descriptive Architecture] Error (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل توليد الكود / Failed to generate code",
      traceId
    });
  }
});

router.get("/wizard-config", async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      steps: [
        {
          id: "overview",
          title: "الوصف العام",
          titleEn: "Overview",
          description: "صف مشروعك بلغة طبيعية",
          icon: "FileText"
        },
        {
          id: "dataModel",
          title: "نمذجة البيانات",
          titleEn: "Data Model",
          description: "حدد الكيانات والعلاقات",
          icon: "Database"
        },
        {
          id: "permissions",
          title: "الصلاحيات",
          titleEn: "Permissions",
          description: "حدد الأدوار والصلاحيات",
          icon: "Shield"
        },
        {
          id: "operations",
          title: "العمليات",
          titleEn: "Operations",
          description: "حدد سير العمل والـ APIs",
          icon: "Workflow"
        }
      ],
      sectors: [
        { value: "healthcare", label: "صحي", labelEn: "Healthcare" },
        { value: "financial", label: "مالي", labelEn: "Financial" },
        { value: "government", label: "حكومي", labelEn: "Government" },
        { value: "education", label: "تعليمي", labelEn: "Education" },
        { value: "commercial", label: "تجاري", labelEn: "Commercial" },
        { value: "military", label: "عسكري", labelEn: "Military" }
      ]
    }
  });
});

export default router;
