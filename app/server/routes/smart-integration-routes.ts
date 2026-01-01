import { Router, Request, Response, NextFunction } from "express";
import { smartIntegrationHub } from "../lib/smart-integration-hub";

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
  const maxRequests = 20;

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

router.post("/detect", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { architecture } = req.body;
    
    if (!architecture) {
      return res.status(400).json({
        error: "Architecture required",
        errorAr: "البنية المطلوبة"
      });
    }

    const detections = await smartIntegrationHub.detectIntegrations(architecture);
    
    res.json({ 
      detections,
      count: detections.length,
      message: `Detected ${detections.length} potential integrations`,
      messageAr: `تم اكتشاف ${detections.length} تكاملات محتملة`
    });
  } catch (error) {
    res.status(500).json({
      error: "Detection failed",
      errorAr: "فشل الكشف"
    });
  }
});

router.post("/generate-api", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { integration, architecture } = req.body;
    
    if (!integration?.id) {
      return res.status(400).json({
        error: "Integration required",
        errorAr: "التكامل مطلوب"
      });
    }

    const apis = await smartIntegrationHub.generateAPIs(integration, architecture || {});
    const securityPolicy = smartIntegrationHub.generateSecurityPolicy(integration);
    const openApiSpec = smartIntegrationHub.generateOpenAPISpec(integration, apis);
    
    res.json({
      apis,
      securityPolicy,
      openApiSpec,
      message: `Generated ${apis.length} API endpoints`,
      messageAr: `تم توليد ${apis.length} نقطة API`
    });
  } catch (error) {
    res.status(500).json({
      error: "API generation failed",
      errorAr: "فشل توليد API"
    });
  }
});

router.post("/security-policy", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const { integration } = req.body;
    
    if (!integration?.id) {
      return res.status(400).json({
        error: "Integration required",
        errorAr: "التكامل مطلوب"
      });
    }

    const securityPolicy = smartIntegrationHub.generateSecurityPolicy(integration);
    
    res.json({
      securityPolicy,
      message: "Security policy generated",
      messageAr: "تم توليد سياسة الأمان"
    });
  } catch (error) {
    res.status(500).json({
      error: "Security policy generation failed",
      errorAr: "فشل توليد سياسة الأمان"
    });
  }
});

router.get("/catalog", authMiddleware, ownerOnlyMiddleware, rateLimitMiddleware, async (req, res) => {
  try {
    const catalog = [
      { key: "stripe", name: "Stripe", nameAr: "سترايب", category: "payment" },
      { key: "paypal", name: "PayPal", nameAr: "باي بال", category: "payment" },
      { key: "twilio", name: "Twilio", nameAr: "تويليو", category: "communication" },
      { key: "sendgrid", name: "SendGrid", nameAr: "سيند جريد", category: "communication" },
      { key: "firebase", name: "Firebase", nameAr: "فايربيس", category: "auth" },
      { key: "aws_s3", name: "AWS S3", nameAr: "تخزين أمازون", category: "storage" },
      { key: "openai", name: "OpenAI", nameAr: "أوبن إيه آي", category: "ai" },
      { key: "google_analytics", name: "Google Analytics", nameAr: "تحليلات جوجل", category: "analytics" },
      { key: "salesforce", name: "Salesforce", nameAr: "سيلز فورس", category: "crm" },
      { key: "sap", name: "SAP", nameAr: "ساب", category: "erp" }
    ];
    
    res.json({ catalog });
  } catch (error) {
    res.status(500).json({
      error: "Failed to get catalog",
      errorAr: "فشل في جلب الكتالوج"
    });
  }
});

export default router;
