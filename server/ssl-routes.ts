import { Router, Request, Response } from "express";
import { db } from "./db";
import {
  sslCertificates,
  customDomains,
  insertSSLCertificateSchema
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { z } from "zod";
import crypto from "crypto";

const router = Router();

const encryptionKey = process.env.SESSION_SECRET;
if (!encryptionKey) {
  console.warn("[SSL] Warning: SESSION_SECRET not set. Certificate encryption may not be secure in production.");
}

function encryptData(data: string): string {
  if (!encryptionKey) {
    throw new Error("SESSION_SECRET is required for certificate encryption");
  }
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(encryptionKey, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

const uploadCertificateSchema = z.object({
  hostname: z.string().min(1),
  provider: z.string().min(1),
  certificateChain: z.string().min(1),
  privateKey: z.string().min(1)
});

const generateCertificateSchema = z.object({
  domainId: z.string().min(1)
});

router.get("/certificates", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }

    const certificates = await db.select().from(sslCertificates)
      .orderBy(desc(sslCertificates.createdAt));

    const sanitizedCerts = certificates.map(cert => ({
      ...cert,
      certificateChain: undefined,
      privateKeyRef: undefined,
      acmeChallengeToken: undefined,
      acmeChallengeResponse: undefined
    }));

    res.json({ success: true, certificates: sanitizedCerts });
  } catch (error) {
    console.error("Error fetching SSL certificates:", error);
    res.status(500).json({ 
      error: "Failed to fetch certificates", 
      errorAr: "فشل في جلب الشهادات" 
    });
  }
});

router.post("/certificates/upload", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }

    const parsed = uploadCertificateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Invalid request", 
        errorAr: "طلب غير صالح",
        details: parsed.error.errors 
      });
    }

    const { hostname, provider, certificateChain, privateKey } = parsed.data;

    let domain = await db.select().from(customDomains)
      .where(eq(customDomains.hostname, hostname))
      .limit(1);

    let domainId: string;
    if (domain.length === 0) {
      const rootDomain = hostname.split('.').slice(-2).join('.');
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      const [newDomain] = await db.insert(customDomains).values({
        tenantId: userId,
        hostname,
        rootDomain,
        verificationToken,
        createdBy: userId,
        status: 'verified',
        isVerified: true,
        verifiedAt: new Date(),
        sslStatus: 'pending'
      }).returning();
      domainId = newDomain.id;
    } else {
      domainId = domain[0].id;
    }

    const existingCert = await db.select().from(sslCertificates)
      .where(eq(sslCertificates.domainId, domainId))
      .limit(1);

    const encryptedCert = encryptData(certificateChain);
    const privateKeyRef = `secure:${crypto.randomBytes(16).toString('hex')}`;

    const certData = {
      domainId,
      hostname,
      provider,
      challengeType: 'custom',
      status: 'issued',
      certificateChain: encryptedCert,
      privateKeyRef,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      renewAfter: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      autoRenew: false
    };

    let certificate;
    if (existingCert.length > 0) {
      [certificate] = await db.update(sslCertificates)
        .set({ ...certData, updatedAt: new Date() })
        .where(eq(sslCertificates.id, existingCert[0].id))
        .returning();
    } else {
      [certificate] = await db.insert(sslCertificates).values(certData).returning();
    }

    await db.update(customDomains)
      .set({ 
        sslStatus: 'issued',
        sslIssuedAt: new Date(),
        sslExpiresAt: certData.expiresAt
      })
      .where(eq(customDomains.id, domainId));

    res.json({ 
      success: true, 
      message: "Certificate uploaded successfully",
      messageAr: "تم رفع الشهادة بنجاح",
      certificate: {
        ...certificate,
        certificateChain: undefined,
        privateKeyRef: undefined
      }
    });
  } catch (error) {
    console.error("Error uploading certificate:", error);
    res.status(500).json({ 
      error: "Failed to upload certificate", 
      errorAr: "فشل في رفع الشهادة" 
    });
  }
});

router.post("/certificates/generate", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }

    const parsed = generateCertificateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Invalid request", 
        errorAr: "طلب غير صالح" 
      });
    }

    const { domainId } = parsed.data;

    const domain = await db.select().from(customDomains)
      .where(eq(customDomains.id, domainId))
      .limit(1);

    if (domain.length === 0) {
      return res.status(404).json({ 
        error: "Domain not found", 
        errorAr: "النطاق غير موجود" 
      });
    }

    const existingCert = await db.select().from(sslCertificates)
      .where(eq(sslCertificates.domainId, domainId))
      .limit(1);

    const certData = {
      domainId,
      hostname: domain[0].hostname,
      provider: 'letsencrypt',
      challengeType: 'dns-01',
      status: 'pending',
      autoRenew: true,
      acmeChallengeToken: crypto.randomBytes(32).toString('base64url'),
      acmeChallengeResponse: crypto.randomBytes(32).toString('base64url')
    };

    let certificate;
    if (existingCert.length > 0) {
      [certificate] = await db.update(sslCertificates)
        .set({ ...certData, updatedAt: new Date() })
        .where(eq(sslCertificates.id, existingCert[0].id))
        .returning();
    } else {
      [certificate] = await db.insert(sslCertificates).values(certData).returning();
    }

    await db.update(customDomains)
      .set({ sslStatus: 'pending' })
      .where(eq(customDomains.id, domainId));

    res.json({ 
      success: true, 
      message: "Certificate generation initiated",
      messageAr: "تم بدء إنشاء الشهادة",
      certificate: {
        ...certificate,
        certificateChain: undefined,
        privateKeyRef: undefined
      },
      dnsChallenge: {
        type: 'TXT',
        name: `_acme-challenge.${domain[0].hostname}`,
        value: certificate.acmeChallengeResponse
      }
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({ 
      error: "Failed to generate certificate", 
      errorAr: "فشل في إنشاء الشهادة" 
    });
  }
});

router.post("/certificates/:id/renew", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }

    const { id } = req.params;

    const cert = await db.select().from(sslCertificates)
      .where(eq(sslCertificates.id, id))
      .limit(1);

    if (cert.length === 0) {
      return res.status(404).json({ 
        error: "Certificate not found", 
        errorAr: "الشهادة غير موجودة" 
      });
    }

    const [updated] = await db.update(sslCertificates)
      .set({ 
        status: 'renewing',
        renewalAttempts: (cert[0].renewalAttempts || 0) + 1,
        lastRenewalAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(sslCertificates.id, id))
      .returning();

    res.json({ 
      success: true, 
      message: "Certificate renewal initiated",
      messageAr: "تم بدء تجديد الشهادة",
      certificate: {
        ...updated,
        certificateChain: undefined,
        privateKeyRef: undefined
      }
    });
  } catch (error) {
    console.error("Error renewing certificate:", error);
    res.status(500).json({ 
      error: "Failed to renew certificate", 
      errorAr: "فشل في تجديد الشهادة" 
    });
  }
});

router.patch("/certificates/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }

    const { id } = req.params;
    const { autoRenew } = req.body;

    const [updated] = await db.update(sslCertificates)
      .set({ 
        autoRenew: autoRenew === true,
        updatedAt: new Date()
      })
      .where(eq(sslCertificates.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ 
        error: "Certificate not found", 
        errorAr: "الشهادة غير موجودة" 
      });
    }

    res.json({ 
      success: true, 
      message: "Certificate updated",
      messageAr: "تم تحديث الشهادة"
    });
  } catch (error) {
    console.error("Error updating certificate:", error);
    res.status(500).json({ 
      error: "Failed to update certificate", 
      errorAr: "فشل في تحديث الشهادة" 
    });
  }
});

router.delete("/certificates/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }

    const { id } = req.params;

    const cert = await db.select().from(sslCertificates)
      .where(eq(sslCertificates.id, id))
      .limit(1);

    if (cert.length === 0) {
      return res.status(404).json({ 
        error: "Certificate not found", 
        errorAr: "الشهادة غير موجودة" 
      });
    }

    await db.delete(sslCertificates).where(eq(sslCertificates.id, id));

    if (cert[0].domainId) {
      await db.update(customDomains)
        .set({ sslStatus: 'none' })
        .where(eq(customDomains.id, cert[0].domainId));
    }

    res.json({ 
      success: true, 
      message: "Certificate deleted",
      messageAr: "تم حذف الشهادة"
    });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    res.status(500).json({ 
      error: "Failed to delete certificate", 
      errorAr: "فشل في حذف الشهادة" 
    });
  }
});

export default router;
