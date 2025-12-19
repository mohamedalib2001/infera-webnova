import { Router, Request, Response } from "express";
import { db } from "./db";
import {
  sslCertificates,
  customDomains,
  csrRequests,
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

// CSR Generation Schema
const generateCSRSchema = z.object({
  domain: z.string().min(1),
  organization: z.string().optional().default(''),
  organizationUnit: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  country: z.string().length(2).optional().default('SA'),
  email: z.string().email().optional()
});

// Generate CSR for Namecheap/other SSL providers
router.post("/generate-csr", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }

    const parsed = generateCSRSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Invalid request", 
        errorAr: "طلب غير صالح",
        details: parsed.error.errors 
      });
    }

    const { domain, organization, organizationUnit, city, state, country, email } = parsed.data;

    // Generate RSA key pair
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Build the subject string for CSR
    const subjectParts = [`CN=${domain}`];
    if (organization) subjectParts.push(`O=${organization}`);
    if (organizationUnit) subjectParts.push(`OU=${organizationUnit}`);
    if (city) subjectParts.push(`L=${city}`);
    if (state) subjectParts.push(`ST=${state}`);
    if (country) subjectParts.push(`C=${country}`);
    
    const subject = '/' + subjectParts.join('/');

    // Use OpenSSL via child_process to generate CSR
    const { execSync } = await import('child_process');
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');

    // Create temp files
    const tempDir = os.tmpdir();
    const keyFile = path.join(tempDir, `key_${Date.now()}.pem`);
    const csrFile = path.join(tempDir, `csr_${Date.now()}.pem`);

    try {
      // Write private key to temp file
      fs.writeFileSync(keyFile, privateKey, { mode: 0o600 });

      // Generate CSR using OpenSSL
      const opensslCmd = `openssl req -new -key "${keyFile}" -out "${csrFile}" -subj "${subject}" -sha256`;
      execSync(opensslCmd, { stdio: 'pipe' });

      // Read the generated CSR
      const csr = fs.readFileSync(csrFile, 'utf8');

      // Store encrypted private key for later use
      const encryptedPrivateKey = encryptData(privateKey);
      
      // Save CSR request to database
      const [csrRecord] = await db.insert(csrRequests).values({
        userId,
        domain,
        organization: organization || null,
        organizationUnit: organizationUnit || null,
        city: city || null,
        state: state || null,
        country: country || 'SA',
        email: email || null,
        csrContent: csr,
        privateKeyEncrypted: encryptedPrivateKey,
        status: 'generated',
        provider: 'namecheap',
        notes: `Subject: ${subject}`,
        notesAr: `الموضوع: ${subject}`
      }).returning();
      
      // Update domain if exists
      let existingDomain = await db.select().from(customDomains)
        .where(eq(customDomains.hostname, domain))
        .limit(1);

      if (existingDomain.length > 0) {
        // Update existing domain with CSR status
        await db.update(customDomains)
          .set({ 
            sslStatus: 'csr_generated',
            statusMessage: `CSR generated at ${new Date().toISOString()}`,
            statusMessageAr: `تم إنشاء CSR في ${new Date().toISOString()}`
          })
          .where(eq(customDomains.id, existingDomain[0].id));
      }

      // Clean up temp files
      fs.unlinkSync(keyFile);
      fs.unlinkSync(csrFile);

      res.json({ 
        success: true, 
        message: "CSR generated successfully",
        messageAr: "تم إنشاء طلب توقيع الشهادة بنجاح",
        csrId: csrRecord.id,
        csr,
        domain,
        subject,
        instructions: {
          en: "Copy the CSR above and paste it into Namecheap's SSL activation page. Keep the private key secure - you will need it to install the certificate.",
          ar: "انسخ طلب توقيع الشهادة أعلاه والصقه في صفحة تفعيل SSL في Namecheap. احتفظ بالمفتاح الخاص بشكل آمن - ستحتاجه لتثبيت الشهادة."
        },
        privateKey: privateKey // Important: User needs this to install the certificate later
      });
    } catch (opensslError) {
      // Clean up temp files on error
      try { fs.unlinkSync(keyFile); } catch {}
      try { fs.unlinkSync(csrFile); } catch {}
      throw opensslError;
    }
  } catch (error) {
    console.error("Error generating CSR:", error);
    res.status(500).json({ 
      error: "Failed to generate CSR", 
      errorAr: "فشل في إنشاء طلب توقيع الشهادة",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all CSR requests
router.get("/csr-requests", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }

    const requests = await db.select({
      id: csrRequests.id,
      domain: csrRequests.domain,
      organization: csrRequests.organization,
      status: csrRequests.status,
      provider: csrRequests.provider,
      createdAt: csrRequests.createdAt,
      submittedAt: csrRequests.submittedAt,
      issuedAt: csrRequests.issuedAt,
      expiresAt: csrRequests.expiresAt,
      notes: csrRequests.notes,
      notesAr: csrRequests.notesAr
    })
    .from(csrRequests)
    .orderBy(desc(csrRequests.createdAt));

    res.json({ csrRequests: requests });
  } catch (error) {
    console.error("Error fetching CSR requests:", error);
    res.status(500).json({ 
      error: "Failed to fetch CSR requests", 
      errorAr: "فشل في جلب طلبات CSR" 
    });
  }
});

// Get single CSR request with CSR content
router.get("/csr-requests/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }

    const { id } = req.params;
    const [request] = await db.select()
      .from(csrRequests)
      .where(eq(csrRequests.id, id))
      .limit(1);

    if (!request) {
      return res.status(404).json({ 
        error: "CSR request not found", 
        errorAr: "لم يتم العثور على طلب CSR" 
      });
    }

    // Decrypt private key for authorized users
    let decryptedPrivateKey = null;
    try {
      decryptedPrivateKey = decryptData(request.privateKeyEncrypted);
    } catch {
      decryptedPrivateKey = "Error decrypting key";
    }

    res.json({ 
      csrRequest: {
        ...request,
        privateKey: decryptedPrivateKey
      }
    });
  } catch (error) {
    console.error("Error fetching CSR request:", error);
    res.status(500).json({ 
      error: "Failed to fetch CSR request", 
      errorAr: "فشل في جلب طلب CSR" 
    });
  }
});

// Update CSR request status
router.patch("/csr-requests/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }

    const { id } = req.params;
    const { status, notes, notesAr } = req.body;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (status) {
      updateData.status = status;
      if (status === 'submitted') {
        updateData.submittedAt = new Date();
      } else if (status === 'issued') {
        updateData.issuedAt = new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;
    if (notesAr !== undefined) updateData.notesAr = notesAr;

    const [updated] = await db.update(csrRequests)
      .set(updateData)
      .where(eq(csrRequests.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ 
        error: "CSR request not found", 
        errorAr: "لم يتم العثور على طلب CSR" 
      });
    }

    res.json({ 
      success: true,
      message: "CSR request updated",
      messageAr: "تم تحديث طلب CSR",
      csrRequest: updated
    });
  } catch (error) {
    console.error("Error updating CSR request:", error);
    res.status(500).json({ 
      error: "Failed to update CSR request", 
      errorAr: "فشل في تحديث طلب CSR" 
    });
  }
});

// Delete CSR request
router.delete("/csr-requests/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }

    const { id } = req.params;
    
    await db.delete(csrRequests).where(eq(csrRequests.id, id));

    res.json({ 
      success: true,
      message: "CSR request deleted",
      messageAr: "تم حذف طلب CSR"
    });
  } catch (error) {
    console.error("Error deleting CSR request:", error);
    res.status(500).json({ 
      error: "Failed to delete CSR request", 
      errorAr: "فشل في حذف طلب CSR" 
    });
  }
});

export default router;
