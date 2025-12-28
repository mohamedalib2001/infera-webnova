import type { Express, Request, Response } from "express";
import { db } from "./db";
import { securityScanJobs, securityFindings } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

// OWASP Top 10 categories - فئات OWASP العشر الأوائل
const OWASP_CATEGORIES = {
  A01: { en: "Broken Access Control", ar: "التحكم في الوصول المعطل" },
  A02: { en: "Cryptographic Failures", ar: "فشل التشفير" },
  A03: { en: "Injection", ar: "الحقن" },
  A04: { en: "Insecure Design", ar: "التصميم غير الآمن" },
  A05: { en: "Security Misconfiguration", ar: "تهيئة أمنية خاطئة" },
  A06: { en: "Vulnerable Components", ar: "مكونات معرضة للخطر" },
  A07: { en: "Auth Failures", ar: "فشل المصادقة" },
  A08: { en: "Software & Data Integrity", ar: "سلامة البرمجيات والبيانات" },
  A09: { en: "Logging Failures", ar: "فشل التسجيل" },
  A10: { en: "SSRF", ar: "تزوير طلب من جانب الخادم" },
};

interface FindingData {
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  recommendation: string;
  recommendationAr: string;
  cweId?: string;
  owaspCategory?: string;
}

// ==================== SAST Scanner ====================
async function runSASTScan(code: string, _language: string): Promise<FindingData[]> {
  const findings: FindingData[] = [];
  
  // SQL Injection detection
  if (/(?:execute|query|raw)\s*\(\s*[`'"].*\$\{|(?:\+\s*\w+\s*\+)/gi.test(code)) {
    findings.push({
      severity: "critical",
      category: "SQL Injection",
      title: "Potential SQL Injection Vulnerability",
      titleAr: "ثغرة حقن SQL محتملة",
      description: "User input may be directly concatenated into SQL queries",
      descriptionAr: "قد يتم دمج مدخلات المستخدم مباشرة في استعلامات SQL",
      recommendation: "Use parameterized queries or prepared statements",
      recommendationAr: "استخدم الاستعلامات المعلمة أو العبارات المُعدة",
      cweId: "CWE-89",
      owaspCategory: "A03",
    });
  }
  
  // XSS detection
  if (/innerHTML\s*=|document\.write|eval\(/gi.test(code)) {
    findings.push({
      severity: "high",
      category: "Cross-Site Scripting",
      title: "Potential XSS Vulnerability",
      titleAr: "ثغرة XSS محتملة",
      description: "Unsafe DOM manipulation or code execution detected",
      descriptionAr: "تم اكتشاف تلاعب غير آمن بـ DOM أو تنفيذ كود",
      recommendation: "Use safe DOM APIs and sanitize user input",
      recommendationAr: "استخدم واجهات DOM الآمنة ونظف مدخلات المستخدم",
      cweId: "CWE-79",
      owaspCategory: "A03",
    });
  }
  
  // Hardcoded secrets detection
  if (/(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][a-zA-Z0-9]{16,}/gi.test(code)) {
    findings.push({
      severity: "critical",
      category: "Hardcoded Secrets",
      title: "Hardcoded Secret Detected",
      titleAr: "تم اكتشاف سر مشفر",
      description: "API keys, passwords, or tokens appear to be hardcoded",
      descriptionAr: "يبدو أن مفاتيح API أو كلمات المرور أو الرموز مشفرة",
      recommendation: "Use environment variables or secrets management",
      recommendationAr: "استخدم متغيرات البيئة أو إدارة الأسرار",
      cweId: "CWE-798",
      owaspCategory: "A02",
    });
  }
  
  // Insecure random
  if (/Math\.random\(\)/gi.test(code) && /(?:token|session|secret|key)/gi.test(code)) {
    findings.push({
      severity: "medium",
      category: "Weak Cryptography",
      title: "Insecure Random Number Generation",
      titleAr: "توليد أرقام عشوائية غير آمن",
      description: "Math.random() used for security-sensitive operations",
      descriptionAr: "يُستخدم Math.random() لعمليات حساسة أمنياً",
      recommendation: "Use crypto.randomBytes() or crypto.getRandomValues()",
      recommendationAr: "استخدم crypto.randomBytes() أو crypto.getRandomValues()",
      cweId: "CWE-330",
      owaspCategory: "A02",
    });
  }
  
  // Path traversal
  if (/path\.join\([^)]*\.\./gi.test(code) || /readFile\([^)]*\+/gi.test(code)) {
    findings.push({
      severity: "high",
      category: "Path Traversal",
      title: "Potential Path Traversal Vulnerability",
      titleAr: "ثغرة اجتياز المسار المحتملة",
      description: "File paths may be manipulated by user input",
      descriptionAr: "قد يتم التلاعب بمسارات الملفات بواسطة مدخلات المستخدم",
      recommendation: "Validate and sanitize file paths, use allowlists",
      recommendationAr: "تحقق من صحة مسارات الملفات ونظفها، استخدم قوائم السماح",
      cweId: "CWE-22",
      owaspCategory: "A01",
    });
  }
  
  return findings;
}

// ==================== Dependency Scanner ====================
async function runDependencyScan(packageJson: string): Promise<FindingData[]> {
  const findings: FindingData[] = [];
  
  try {
    const pkg = JSON.parse(packageJson);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    const knownVulnerable: Record<string, { severity: "critical" | "high" | "medium"; desc: string; descAr: string }> = {
      "lodash": { severity: "high", desc: "Prototype pollution vulnerabilities in older versions", descAr: "ثغرات تلوث النموذج الأولي في الإصدارات القديمة" },
      "moment": { severity: "medium", desc: "ReDoS vulnerabilities and deprecated", descAr: "ثغرات ReDoS ومهجور" },
      "request": { severity: "medium", desc: "Deprecated package with known issues", descAr: "حزمة مهجورة بمشاكل معروفة" },
    };
    
    for (const name of Object.keys(deps)) {
      if (knownVulnerable[name]) {
        const vuln = knownVulnerable[name];
        findings.push({
          severity: vuln.severity,
          category: "Vulnerable Dependency",
          title: `Potentially Vulnerable Package: ${name}`,
          titleAr: `حزمة معرضة للخطر محتملة: ${name}`,
          description: vuln.desc,
          descriptionAr: vuln.descAr,
          recommendation: "Update to latest version or find alternative package",
          recommendationAr: "حدث إلى أحدث إصدار أو ابحث عن حزمة بديلة",
          cweId: "CWE-1104",
          owaspCategory: "A06",
        });
      }
    }
  } catch {
    // Invalid JSON - will return empty findings
  }
  
  return findings;
}

// ==================== API Routes ====================
export function registerSecurityScanningRoutes(app: Express) {
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        errorAr: "المصادقة مطلوبة",
      });
    }
    next();
  };

  // ==================== Get Scanner Status ====================
  app.get("/api/security/status", async (_req: Request, res: Response) => {
    res.json({
      success: true,
      status: "operational",
      statusAr: "يعمل",
      scanners: {
        sast: { enabled: true, name: "Static Analysis", nameAr: "التحليل الثابت" },
        dast: { enabled: false, name: "Dynamic Analysis", nameAr: "التحليل الديناميكي" },
        dependency: { enabled: true, name: "Dependency Scan", nameAr: "فحص التبعيات" },
        secrets: { enabled: true, name: "Secrets Detection", nameAr: "كشف الأسرار" },
        container: { enabled: false, name: "Container Scan", nameAr: "فحص الحاويات" },
      },
      owaspCategories: OWASP_CATEGORIES,
    });
  });

  // ==================== Start SAST Scan ====================
  app.post("/api/security/scan/sast", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { code, language, projectId } = req.body;
      
      if (!code) {
        return res.status(400).json({
          success: false,
          error: "Code is required",
          errorAr: "الكود مطلوب",
        });
      }
      
      const startTime = Date.now();
      
      // Create scan job in database
      const [job] = await db.insert(securityScanJobs).values({
        userId,
        projectId,
        scanType: "sast",
        targetType: "code",
        target: (code as string).substring(0, 500),
        language: language || "javascript",
        status: "running",
        startedAt: new Date(),
        scannerVersion: "1.0.0",
      }).returning();
      
      // Run the scan
      const findingsData = await runSASTScan(code, language || "javascript");
      const scanDuration = Date.now() - startTime;
      
      // Insert findings into database
      const insertedFindings = [];
      for (const f of findingsData) {
        const [inserted] = await db.insert(securityFindings).values({
          scanJobId: job.id,
          severity: f.severity,
          category: f.category,
          title: f.title,
          titleAr: f.titleAr,
          description: f.description,
          descriptionAr: f.descriptionAr,
          recommendation: f.recommendation,
          recommendationAr: f.recommendationAr,
          cweId: f.cweId,
          owaspCategory: f.owaspCategory,
        }).returning();
        insertedFindings.push(inserted);
      }
      
      // Update job with results
      const summary = {
        totalFindings: findingsData.length,
        bySeverity: {
          critical: findingsData.filter(f => f.severity === "critical").length,
          high: findingsData.filter(f => f.severity === "high").length,
          medium: findingsData.filter(f => f.severity === "medium").length,
          low: findingsData.filter(f => f.severity === "low").length,
          info: findingsData.filter(f => f.severity === "info").length,
        },
      };
      
      const [updatedJob] = await db.update(securityScanJobs)
        .set({
          status: "completed",
          completedAt: new Date(),
          scanDuration,
          summary,
        })
        .where(eq(securityScanJobs.id, job.id))
        .returning();
      
      res.json({
        success: true,
        job: {
          ...updatedJob,
          findings: insertedFindings,
        },
        message: `Scan completed with ${findingsData.length} findings`,
        messageAr: `اكتمل الفحص مع ${findingsData.length} نتائج`,
      });
    } catch (error: any) {
      console.error("[Security Scan] SAST error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        errorAr: "فشل الفحص الأمني",
      });
    }
  });

  // ==================== Start Dependency Scan ====================
  app.post("/api/security/scan/dependency", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { packageJson, projectId } = req.body;
      
      if (!packageJson) {
        return res.status(400).json({
          success: false,
          error: "package.json content is required",
          errorAr: "محتوى package.json مطلوب",
        });
      }
      
      const startTime = Date.now();
      
      // Create scan job
      const [job] = await db.insert(securityScanJobs).values({
        userId,
        projectId,
        scanType: "dependency",
        targetType: "repository",
        target: "package.json",
        status: "running",
        startedAt: new Date(),
        scannerVersion: "1.0.0",
      }).returning();
      
      // Run the scan
      const findingsData = await runDependencyScan(packageJson);
      const scanDuration = Date.now() - startTime;
      
      // Insert findings
      const insertedFindings = [];
      for (const f of findingsData) {
        const [inserted] = await db.insert(securityFindings).values({
          scanJobId: job.id,
          severity: f.severity,
          category: f.category,
          title: f.title,
          titleAr: f.titleAr,
          description: f.description,
          descriptionAr: f.descriptionAr,
          recommendation: f.recommendation,
          recommendationAr: f.recommendationAr,
          cweId: f.cweId,
          owaspCategory: f.owaspCategory,
        }).returning();
        insertedFindings.push(inserted);
      }
      
      // Update job
      const summary = {
        totalFindings: findingsData.length,
        bySeverity: {
          critical: findingsData.filter(f => f.severity === "critical").length,
          high: findingsData.filter(f => f.severity === "high").length,
          medium: findingsData.filter(f => f.severity === "medium").length,
          low: findingsData.filter(f => f.severity === "low").length,
          info: findingsData.filter(f => f.severity === "info").length,
        },
      };
      
      const [updatedJob] = await db.update(securityScanJobs)
        .set({
          status: "completed",
          completedAt: new Date(),
          scanDuration,
          summary,
        })
        .where(eq(securityScanJobs.id, job.id))
        .returning();
      
      res.json({
        success: true,
        job: {
          ...updatedJob,
          findings: insertedFindings,
        },
        message: `Dependency scan completed with ${findingsData.length} findings`,
        messageAr: `اكتمل فحص التبعيات مع ${findingsData.length} نتائج`,
      });
    } catch (error: any) {
      console.error("[Security Scan] Dependency error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        errorAr: "فشل فحص التبعيات",
      });
    }
  });

  // ==================== Get Scan Results ====================
  app.get("/api/security/scan/:jobId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { jobId } = req.params;
      
      const [job] = await db.select()
        .from(securityScanJobs)
        .where(eq(securityScanJobs.id, jobId));
      
      if (!job) {
        return res.status(404).json({
          success: false,
          error: "Scan job not found",
          errorAr: "مهمة الفحص غير موجودة",
        });
      }
      
      if (job.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
          errorAr: "الوصول مرفوض",
        });
      }
      
      // Get findings for this job
      const findings = await db.select()
        .from(securityFindings)
        .where(eq(securityFindings.scanJobId, jobId));
      
      res.json({
        success: true,
        job: {
          ...job,
          findings,
        },
      });
    } catch (error: any) {
      console.error("[Security Scan] Get job error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        errorAr: "فشل جلب نتائج الفحص",
      });
    }
  });

  // ==================== List User's Scans ====================
  app.get("/api/security/scans", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      
      const scans = await db.select()
        .from(securityScanJobs)
        .where(eq(securityScanJobs.userId, userId))
        .orderBy(desc(securityScanJobs.createdAt))
        .limit(50);
      
      res.json({
        success: true,
        scans,
        total: scans.length,
      });
    } catch (error: any) {
      console.error("[Security Scan] List error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        errorAr: "فشل جلب قائمة الفحوصات",
      });
    }
  });

  console.log("[Security Scanning] Routes registered at /api/security/*");
}
