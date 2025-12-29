import { Router, Request, Response, NextFunction } from "express";
import { smartCodeGenerator } from "../lib/smart-code-generator";
import { randomUUID } from "crypto";

const router = Router();

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60000;

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
  console.log(`[Smart Code Generator] ${new Date().toISOString()} | TraceID: ${traceId} | Endpoint: ${endpoint} | User: ${userId || "anonymous"}`);
};

router.use(authMiddleware);
router.use(rateLimitMiddleware);

router.post("/generate-backend", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  const userId = session?.userId;
  logRequest("/generate-backend", traceId, userId);
  
  try {
    const { requirements, sector } = req.body;
    
    if (!requirements || typeof requirements !== "string") {
      return res.status(400).json({
        success: false,
        error: "المتطلبات مطلوبة / Requirements are required"
      });
    }

    const backendSpec = await smartCodeGenerator.generateBackend(
      requirements,
      sector || "commercial"
    );

    res.json({
      success: true,
      data: backendSpec,
      traceId,
      message: "تم توليد مواصفات Backend بنجاح / Backend specification generated"
    });
  } catch (error) {
    console.error(`[Smart Code Generator] Error in /generate-backend (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل توليد Backend / Failed to generate backend",
      traceId
    });
  }
});

router.post("/generate-frontend", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  const userId = session?.userId;
  logRequest("/generate-frontend", traceId, userId);
  
  try {
    const { requirements, backendSpec } = req.body;
    
    if (!requirements || typeof requirements !== "string") {
      return res.status(400).json({
        success: false,
        error: "المتطلبات مطلوبة / Requirements are required"
      });
    }

    const fallbackBackend = await smartCodeGenerator.generateBackend(requirements, "commercial");
    const frontendSpec = await smartCodeGenerator.generateFrontend(
      requirements,
      backendSpec || fallbackBackend
    );

    res.json({
      success: true,
      data: frontendSpec,
      traceId,
      message: "تم توليد مواصفات Frontend بنجاح / Frontend specification generated"
    });
  } catch (error) {
    console.error(`[Smart Code Generator] Error in /generate-frontend (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل توليد Frontend / Failed to generate frontend",
      traceId
    });
  }
});

router.post("/generate-integrations", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  const userId = session?.userId;
  logRequest("/generate-integrations", traceId, userId);
  
  try {
    const { requirements, sector } = req.body;
    
    if (!requirements || typeof requirements !== "string") {
      return res.status(400).json({
        success: false,
        error: "المتطلبات مطلوبة / Requirements are required"
      });
    }

    const integrations = smartCodeGenerator.generateIntegrations(
      requirements,
      sector || "commercial"
    );

    res.json({
      success: true,
      data: integrations,
      traceId,
      message: "تم توليد التكاملات بنجاح / Integrations generated"
    });
  } catch (error) {
    console.error(`[Smart Code Generator] Error in /generate-integrations (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل توليد التكاملات / Failed to generate integrations",
      traceId
    });
  }
});

router.post("/generate-full", async (req: Request, res: Response) => {
  const traceId = randomUUID();
  const session = req.session as any;
  const userId = session?.userId;
  logRequest("/generate-full", traceId, userId);
  
  try {
    const { requirements, sector, options } = req.body;
    
    if (!requirements || typeof requirements !== "string") {
      return res.status(400).json({
        success: false,
        error: "المتطلبات مطلوبة / Requirements are required"
      });
    }

    const startTime = Date.now();
    
    const generatedCode = await smartCodeGenerator.generateCode(
      requirements,
      sector || "commercial",
      options
    );

    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      data: generatedCode,
      metadata: {
        traceId,
        processingTimeMs: processingTime,
        sector: sector || "commercial",
        timestamp: new Date().toISOString()
      },
      message: "تم توليد الكود الكامل بنجاح / Full code generated successfully"
    });
  } catch (error) {
    console.error(`[Smart Code Generator] Error in /generate-full (${traceId}):`, error);
    res.status(500).json({
      success: false,
      error: "فشل توليد الكود الكامل / Failed to generate full code",
      traceId
    });
  }
});

router.get("/templates", (_req: Request, res: Response) => {
  const templates = [
    {
      id: "ecommerce",
      name: "E-Commerce Platform",
      nameAr: "منصة تجارة إلكترونية",
      description: "Full e-commerce with products, cart, orders, payments",
      descriptionAr: "منصة تجارة كاملة مع منتجات وسلة وطلبات ودفع",
      sector: "commercial",
      features: ["products", "cart", "orders", "payments", "reviews", "inventory"]
    },
    {
      id: "healthcare",
      name: "Healthcare Management",
      nameAr: "إدارة صحية",
      description: "Patient records, appointments, prescriptions, billing",
      descriptionAr: "سجلات مرضى ومواعيد ووصفات وفوترة",
      sector: "healthcare",
      features: ["patients", "appointments", "prescriptions", "billing", "reports"]
    },
    {
      id: "crm",
      name: "CRM System",
      nameAr: "نظام إدارة العملاء",
      description: "Customer management, leads, deals, communications",
      descriptionAr: "إدارة عملاء وفرص بيعية وتواصل",
      sector: "commercial",
      features: ["contacts", "leads", "deals", "tasks", "communications", "reports"]
    },
    {
      id: "lms",
      name: "Learning Management",
      nameAr: "إدارة التعلم",
      description: "Courses, students, assessments, certificates",
      descriptionAr: "دورات وطلاب واختبارات وشهادات",
      sector: "education",
      features: ["courses", "students", "assessments", "certificates", "progress"]
    },
    {
      id: "hrms",
      name: "HR Management",
      nameAr: "إدارة الموارد البشرية",
      description: "Employees, attendance, payroll, leave management",
      descriptionAr: "موظفين وحضور ورواتب وإجازات",
      sector: "commercial",
      features: ["employees", "attendance", "payroll", "leave", "performance"]
    },
    {
      id: "government",
      name: "Government Portal",
      nameAr: "بوابة حكومية",
      description: "Citizen services, applications, documents, payments",
      descriptionAr: "خدمات مواطنين وطلبات ومستندات ومدفوعات",
      sector: "government",
      features: ["services", "applications", "documents", "payments", "appointments"]
    }
  ];

  res.json({
    success: true,
    data: templates
  });
});

router.get("/capabilities", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      backend: {
        databases: ["PostgreSQL", "MySQL", "MongoDB"],
        frameworks: ["Express.js", "Fastify", "NestJS"],
        features: [
          "Database Schema Generation",
          "API Route Generation",
          "Business Logic Services",
          "Middleware Generation",
          "Migration Scripts",
          "Validation Schemas"
        ]
      },
      frontend: {
        frameworks: ["React", "Vue", "Next.js"],
        styling: ["Tailwind CSS", "Shadcn UI", "Custom"],
        features: [
          "Page Generation",
          "Component Library",
          "React Hooks",
          "Form Handling",
          "Data Fetching",
          "Theme Customization"
        ]
      },
      integrations: {
        payment: ["Stripe", "PayPal", "Tap", "Mada", "STC Pay"],
        auth: ["Email/Password", "OAuth", "MFA", "SSO"],
        notifications: ["Email", "SMS", "Push", "In-App"],
        storage: ["GCS", "S3", "Azure Blob"],
        ai: ["Anthropic", "OpenAI", "Google AI"]
      },
      sectors: [
        { id: "healthcare", nameAr: "القطاع الصحي", compliance: ["HIPAA"] },
        { id: "military", nameAr: "القطاع العسكري", compliance: ["NIST", "DoD"] },
        { id: "government", nameAr: "القطاع الحكومي", compliance: ["GDPR", "NCA"] },
        { id: "commercial", nameAr: "القطاع التجاري", compliance: ["PCI-DSS"] },
        { id: "education", nameAr: "القطاع التعليمي", compliance: ["FERPA"] },
        { id: "financial", nameAr: "القطاع المالي", compliance: ["PCI-DSS", "SOX"] }
      ]
    }
  });
});

export default router;
