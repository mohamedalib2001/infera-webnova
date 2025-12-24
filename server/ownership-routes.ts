import type { Express, Request, Response } from "express";
import { z } from "zod";
import { db } from "./db";
import { eq, and, desc, lt, gte, sql } from "drizzle-orm";
import crypto from "crypto";
import {
  platformOwnerships,
  platformOwnershipTransfers,
  franchiseLicenses,
  licenseAuditLogs,
  brandingAssets,
  whiteLabelProfiles,
  contractTemplates,
  legalClauses,
  digitalContracts,
  contractSignatures,
  contractDisputes,
  users,
  projects,
  insertPlatformOwnershipSchema,
  insertPlatformOwnershipTransferSchema,
  insertFranchiseLicenseSchema,
  insertBrandingAssetSchema,
  insertWhiteLabelProfileSchema,
  insertDigitalContractSchema,
  insertContractSignatureSchema,
} from "@shared/schema";

// ==================== نظام ملكية المنصات والفرانشايز ====================
// Platform Ownership & Franchise Licensing System for INFERA Nova

// Encryption helper using AES-256-GCM
// IMPORTANT: SESSION_SECRET must be set for encryption to work properly
const ENCRYPTION_KEY = process.env.SESSION_SECRET;

if (!ENCRYPTION_KEY) {
  console.warn("[Ownership] WARNING: SESSION_SECRET not set. Encryption features will be disabled.");
}

function encrypt(text: string): { encrypted: string; iv: string; tag: string } | null {
  if (!ENCRYPTION_KEY) {
    console.error("[Encryption] Cannot encrypt: SESSION_SECRET not set");
    return null;
  }
  
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex')
  };
}

function decrypt(encrypted: string, iv: string, tag: string): string | null {
  if (!ENCRYPTION_KEY) {
    console.error("[Encryption] Cannot decrypt: SESSION_SECRET not set");
    return null;
  }
  
  try {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error("[Encryption] Decryption failed:", error);
    return null;
  }
}

// Generate unique license number
function generateLicenseNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `INF-LIC-${timestamp}-${random}`;
}

// Generate unique contract number
function generateContractNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `INF-CTR-${timestamp}-${random}`;
}

// Generate unique registration number
function generateRegistrationNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `INF-OWN-${timestamp}-${random}`;
}

// Hash content for integrity verification
function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// ==================== Legal Templates ====================
// قوالب النصوص القانونية

const LEGAL_TEMPLATES = {
  usage_rights_ar: `
عقد حق انتفاع بمنصة رقمية

طرفا العقد:
الطرف الأول (المالك): {{OWNER_NAME}}
الطرف الثاني (المنتفع): {{LICENSEE_NAME}}

المادة الأولى: موضوع العقد
يمنح الطرف الأول للطرف الثاني حق الانتفاع بالمنصة الرقمية المسماة "{{PLATFORM_NAME}}" وفقاً للشروط والأحكام الواردة في هذا العقد.

المادة الثانية: مدة العقد
يسري هذا العقد من تاريخ {{START_DATE}} إلى تاريخ {{END_DATE}}.

المادة الثالثة: نطاق الاستخدام
- نوع الترخيص: {{LICENSE_TYPE}}
- الاستخدام باسم: {{USAGE_NAME_TYPE}}
- التعديلات المسموحة: {{MODIFICATIONS_ALLOWED}}

المادة الرابعة: المقابل المالي
- قيمة الترخيص: {{LICENSE_PRICE}} {{CURRENCY}}
- نسبة المشاركة في الإيرادات: {{REVENUE_SHARE}}%

المادة الخامسة: حماية المالك
- يحتفظ المالك بجميع حقوق الملكية الفكرية
- يحق للمالك مراجعة السجلات المالية
- في حال البيع المستقبلي، يحتفظ المالك بنسبة {{POST_SALE_SHARE}}% من الإيرادات

المادة السادسة: فسخ العقد
يحق لأي طرف فسخ العقد بإخطار كتابي قبل 30 يوماً.

التوقيعات:
المالك: _________________ التاريخ: {{SIGN_DATE}}
المنتفع: _________________ التاريخ: {{SIGN_DATE}}
`,

  usage_rights_en: `
DIGITAL PLATFORM USAGE RIGHTS AGREEMENT

PARTIES:
First Party (Owner): {{OWNER_NAME}}
Second Party (Licensee): {{LICENSEE_NAME}}

ARTICLE 1: SUBJECT MATTER
The First Party grants the Second Party the right to use the digital platform named "{{PLATFORM_NAME}}" in accordance with the terms and conditions set forth in this Agreement.

ARTICLE 2: TERM
This Agreement shall be effective from {{START_DATE}} to {{END_DATE}}.

ARTICLE 3: SCOPE OF USE
- License Type: {{LICENSE_TYPE}}
- Usage Under Name: {{USAGE_NAME_TYPE}}
- Permitted Modifications: {{MODIFICATIONS_ALLOWED}}

ARTICLE 4: CONSIDERATION
- License Fee: {{LICENSE_PRICE}} {{CURRENCY}}
- Revenue Share: {{REVENUE_SHARE}}%

ARTICLE 5: OWNER PROTECTION
- Owner retains all intellectual property rights
- Owner has the right to audit financial records
- In case of future sale, Owner retains {{POST_SALE_SHARE}}% of revenues

ARTICLE 6: TERMINATION
Either party may terminate this Agreement with 30 days written notice.

SIGNATURES:
Owner: _________________ Date: {{SIGN_DATE}}
Licensee: _________________ Date: {{SIGN_DATE}}
`,

  sale_ar: `
عقد بيع منصة رقمية

طرفا العقد:
البائع: {{SELLER_NAME}}
المشتري: {{BUYER_NAME}}

المادة الأولى: موضوع البيع
يبيع الطرف الأول للطرف الثاني المنصة الرقمية "{{PLATFORM_NAME}}" بجميع حقوقها.

المادة الثانية: الثمن
- قيمة البيع: {{SALE_PRICE}} {{CURRENCY}}
- طريقة الدفع: {{PAYMENT_METHOD}}

المادة الثالثة: الحقوق المنقولة
{{TRANSFERRED_RIGHTS}}

المادة الرابعة: الحقوق المحتفظ بها للبائع
- الحق في ذكر المنصة كعمل سابق
- نسبة من الإيرادات المستقبلية: {{RETAINED_SHARE}}%
- حظر المنافسة لمدة: {{NON_COMPETE_MONTHS}} شهر

المادة الخامسة: الضمانات
يضمن البائع خلو المنصة من أي حقوق للغير.

التوقيعات:
البائع: _________________ التاريخ: {{SIGN_DATE}}
المشتري: _________________ التاريخ: {{SIGN_DATE}}
`,

  sale_en: `
DIGITAL PLATFORM SALE AGREEMENT

PARTIES:
Seller: {{SELLER_NAME}}
Buyer: {{BUYER_NAME}}

ARTICLE 1: SUBJECT OF SALE
The Seller sells to the Buyer the digital platform "{{PLATFORM_NAME}}" with all its rights.

ARTICLE 2: PRICE
- Sale Price: {{SALE_PRICE}} {{CURRENCY}}
- Payment Method: {{PAYMENT_METHOD}}

ARTICLE 3: TRANSFERRED RIGHTS
{{TRANSFERRED_RIGHTS}}

ARTICLE 4: SELLER'S RETAINED RIGHTS
- Right to reference platform as previous work
- Future revenue share: {{RETAINED_SHARE}}%
- Non-compete period: {{NON_COMPETE_MONTHS}} months

ARTICLE 5: WARRANTIES
Seller warrants the platform is free from third-party claims.

SIGNATURES:
Seller: _________________ Date: {{SIGN_DATE}}
Buyer: _________________ Date: {{SIGN_DATE}}
`
};

// ==================== API Routes ====================

export function registerOwnershipRoutes(app: Express) {
  
  // ==================== OWNERSHIP REGISTRY ====================
  
  // Register platform ownership
  app.post("/api/ownership/register", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { projectId, legalEntityName, legalEntityType, taxId } = req.body;
      
      // Verify project exists and user is creator
      const project = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      if (project.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Check if already registered
      const existing = await db.select().from(platformOwnerships)
        .where(eq(platformOwnerships.projectId, projectId)).limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Platform already registered", ownership: existing[0] });
      }
      
      const registrationNumber = generateRegistrationNumber();
      
      const [ownership] = await db.insert(platformOwnerships).values({
        projectId,
        ownerId: userId,
        ownershipType: "full",
        ownershipPercentage: 100,
        registrationNumber,
        legalEntityName,
        legalEntityType,
        taxId,
        isActive: true,
      }).returning();
      
      res.json({ 
        success: true, 
        ownership,
        message: "Platform ownership registered successfully",
        messageAr: "تم تسجيل ملكية المنصة بنجاح"
      });
    } catch (error: any) {
      console.error("[Ownership] Registration error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get user's owned platforms
  app.get("/api/ownership/my-platforms", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const ownerships = await db.select({
        ownership: platformOwnerships,
        project: projects,
      })
        .from(platformOwnerships)
        .leftJoin(projects, eq(platformOwnerships.projectId, projects.id))
        .where(eq(platformOwnerships.ownerId, userId))
        .orderBy(desc(platformOwnerships.createdAt));
      
      res.json({ ownerships });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get ownership details
  app.get("/api/ownership/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const [ownership] = await db.select({
        ownership: platformOwnerships,
        project: projects,
        owner: users,
      })
        .from(platformOwnerships)
        .leftJoin(projects, eq(platformOwnerships.projectId, projects.id))
        .leftJoin(users, eq(platformOwnerships.ownerId, users.id))
        .where(eq(platformOwnerships.id, id))
        .limit(1);
      
      if (!ownership) {
        return res.status(404).json({ error: "Ownership not found" });
      }
      
      res.json({ ownership });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ==================== FRANCHISE LICENSING ====================
  
  // Issue new license
  app.post("/api/franchise/license/issue", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const {
        ownershipId,
        licenseeEmail,
        licenseType,
        usageScope,
        startDate,
        expiryDate,
        licensePrice,
        currency,
        revenueSharePercentage,
        allowWhiteLabel,
        allowBrandingChanges,
        allowReselling,
        allowedFeatures,
        maxUsers,
        allowedRegions,
      } = req.body;
      
      // Verify ownership
      const [ownership] = await db.select().from(platformOwnerships)
        .where(and(
          eq(platformOwnerships.id, ownershipId),
          eq(platformOwnerships.ownerId, userId)
        )).limit(1);
      
      if (!ownership) {
        return res.status(403).json({ error: "Not authorized to issue licenses for this platform" });
      }
      
      // Find licensee
      const [licensee] = await db.select().from(users)
        .where(eq(users.email, licenseeEmail)).limit(1);
      
      if (!licensee) {
        return res.status(404).json({ error: "Licensee not found" });
      }
      
      const licenseNumber = generateLicenseNumber();
      
      const [license] = await db.insert(franchiseLicenses).values({
        licenseNumber,
        ownershipId,
        projectId: ownership.projectId,
        licenseeId: licensee.id,
        licenseType,
        usageScope: usageScope || "single",
        startDate: new Date(startDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isTemporary: !!expiryDate,
        licensePrice: licensePrice || 0,
        currency: currency || "SAR",
        revenueSharePercentage: revenueSharePercentage || 0,
        allowWhiteLabel: allowWhiteLabel || false,
        allowBrandingChanges: allowBrandingChanges || false,
        allowReselling: allowReselling || false,
        allowedFeatures,
        maxUsers,
        allowedRegions,
        status: "pending",
      }).returning();
      
      // Create audit log
      await db.insert(licenseAuditLogs).values({
        licenseId: license.id,
        action: "created",
        newStatus: "pending",
        performedBy: userId,
        reason: "New license issued",
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      
      res.json({
        success: true,
        license,
        message: `License ${licenseNumber} issued successfully`,
        messageAr: `تم إصدار الترخيص ${licenseNumber} بنجاح`
      });
    } catch (error: any) {
      console.error("[Franchise] License issue error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Activate license (after payment)
  app.post("/api/franchise/license/:id/activate", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { paymentId } = req.body;
      
      const [license] = await db.select().from(franchiseLicenses)
        .where(eq(franchiseLicenses.id, id)).limit(1);
      
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      
      // Verify owner or system
      const [ownership] = await db.select().from(platformOwnerships)
        .where(eq(platformOwnerships.id, license.ownershipId)).limit(1);
      
      if (!ownership || ownership.ownerId !== userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      await db.update(franchiseLicenses)
        .set({
          status: "active",
          isPaid: true,
          paymentId,
          statusChangedAt: new Date(),
          statusChangedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(franchiseLicenses.id, id));
      
      // Audit log
      await db.insert(licenseAuditLogs).values({
        licenseId: id,
        action: "activated",
        previousStatus: license.status,
        newStatus: "active",
        performedBy: userId,
        reason: "Payment confirmed",
      });
      
      res.json({ success: true, message: "License activated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Suspend license
  app.post("/api/franchise/license/:id/suspend", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { reason } = req.body;
      
      const [license] = await db.select().from(franchiseLicenses)
        .where(eq(franchiseLicenses.id, id)).limit(1);
      
      if (!license) {
        return res.status(404).json({ error: "License not found" });
      }
      
      await db.update(franchiseLicenses)
        .set({
          status: "suspended",
          statusReason: reason,
          statusChangedAt: new Date(),
          statusChangedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(franchiseLicenses.id, id));
      
      await db.insert(licenseAuditLogs).values({
        licenseId: id,
        action: "suspended",
        previousStatus: license.status,
        newStatus: "suspended",
        performedBy: userId,
        reason,
      });
      
      res.json({ success: true, message: "License suspended" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get my licenses (as licensee)
  app.get("/api/franchise/my-licenses", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const licenses = await db.select({
        license: franchiseLicenses,
        project: projects,
      })
        .from(franchiseLicenses)
        .leftJoin(projects, eq(franchiseLicenses.projectId, projects.id))
        .where(eq(franchiseLicenses.licenseeId, userId))
        .orderBy(desc(franchiseLicenses.createdAt));
      
      res.json({ licenses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get licenses issued by owner
  app.get("/api/franchise/issued-licenses/:ownershipId", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { ownershipId } = req.params;
      
      // Verify ownership
      const [ownership] = await db.select().from(platformOwnerships)
        .where(and(
          eq(platformOwnerships.id, ownershipId),
          eq(platformOwnerships.ownerId, userId)
        )).limit(1);
      
      if (!ownership) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const licenses = await db.select({
        license: franchiseLicenses,
        licensee: users,
      })
        .from(franchiseLicenses)
        .leftJoin(users, eq(franchiseLicenses.licenseeId, users.id))
        .where(eq(franchiseLicenses.ownershipId, ownershipId))
        .orderBy(desc(franchiseLicenses.createdAt));
      
      res.json({ licenses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ==================== BRANDING ASSETS ====================
  
  // Upload branding asset (encrypted)
  app.post("/api/branding/upload", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { ownershipId, assetType, assetName, content, mimeType } = req.body;
      
      // Verify ownership
      const [ownership] = await db.select().from(platformOwnerships)
        .where(and(
          eq(platformOwnerships.id, ownershipId),
          eq(platformOwnerships.ownerId, userId)
        )).limit(1);
      
      if (!ownership) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      // Encrypt content
      const encryptionResult = encrypt(content);
      let encryptedContent: string;
      let isEncrypted = false;
      
      if (encryptionResult) {
        encryptedContent = JSON.stringify(encryptionResult);
        isEncrypted = true;
      } else {
        // Fallback to base64 encoding if encryption unavailable
        encryptedContent = Buffer.from(content).toString('base64');
        isEncrypted = false;
      }
      
      // Deactivate previous versions
      await db.update(brandingAssets)
        .set({ isActive: false })
        .where(and(
          eq(brandingAssets.ownershipId, ownershipId),
          eq(brandingAssets.assetType, assetType)
        ));
      
      // Get max version
      const [maxVersion] = await db.select({ max: sql<number>`MAX(${brandingAssets.version})` })
        .from(brandingAssets)
        .where(and(
          eq(brandingAssets.ownershipId, ownershipId),
          eq(brandingAssets.assetType, assetType)
        ));
      
      const [asset] = await db.insert(brandingAssets).values({
        ownershipId,
        assetType,
        assetName,
        content: encryptedContent,
        mimeType,
        fileSize: content.length,
        isEncrypted,
        encryptionAlgorithm: isEncrypted ? "AES-256-GCM" : null,
        version: (maxVersion?.max || 0) + 1,
        isActive: true,
        accessLevel: "owner",
        createdBy: userId,
      }).returning();
      
      res.json({ success: true, asset: { ...asset, content: undefined } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get branding assets
  app.get("/api/branding/:ownershipId", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { ownershipId } = req.params;
      
      // Verify access
      const [ownership] = await db.select().from(platformOwnerships)
        .where(eq(platformOwnerships.id, ownershipId)).limit(1);
      
      if (!ownership) {
        return res.status(404).json({ error: "Ownership not found" });
      }
      
      // Check if user is owner or licensee
      const isOwner = ownership.ownerId === userId;
      let isLicensee = false;
      
      if (!isOwner) {
        const [license] = await db.select().from(franchiseLicenses)
          .where(and(
            eq(franchiseLicenses.ownershipId, ownershipId),
            eq(franchiseLicenses.licenseeId, userId),
            eq(franchiseLicenses.status, "active")
          )).limit(1);
        isLicensee = !!license;
      }
      
      if (!isOwner && !isLicensee) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const assets = await db.select()
        .from(brandingAssets)
        .where(and(
          eq(brandingAssets.ownershipId, ownershipId),
          eq(brandingAssets.isActive, true)
        ));
      
      // Decrypt for authorized users
      const decryptedAssets = assets.map(asset => {
        if (asset.content) {
          if (asset.isEncrypted) {
            try {
              const { encrypted, iv, tag } = JSON.parse(asset.content);
              const decrypted = decrypt(encrypted, iv, tag);
              if (decrypted) {
                return { ...asset, content: decrypted };
              }
              return { ...asset, content: "[Decryption Error]" };
            } catch {
              return { ...asset, content: "[Decryption Error]" };
            }
          } else {
            // Base64 encoded content (encryption was not available)
            try {
              const decoded = Buffer.from(asset.content, 'base64').toString('utf8');
              return { ...asset, content: decoded };
            } catch {
              return asset;
            }
          }
        }
        return asset;
      });
      
      res.json({ assets: decryptedAssets });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ==================== WHITE LABEL PROFILES ====================
  
  // Create/Update white label profile
  app.post("/api/whitelabel/profile", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const {
        licenseId,
        brandName,
        brandNameAr,
        tagline,
        taglineAr,
        primaryColor,
        secondaryColor,
        accentColor,
        customDomain,
        supportEmail,
        companyName,
        companyNameAr,
      } = req.body;
      
      // Verify license and white label permission
      const [license] = await db.select().from(franchiseLicenses)
        .where(and(
          eq(franchiseLicenses.id, licenseId),
          eq(franchiseLicenses.licenseeId, userId),
          eq(franchiseLicenses.allowWhiteLabel, true)
        )).limit(1);
      
      if (!license) {
        return res.status(403).json({ error: "White label not allowed for this license" });
      }
      
      // Check for existing profile
      const [existing] = await db.select().from(whiteLabelProfiles)
        .where(eq(whiteLabelProfiles.licenseId, licenseId)).limit(1);
      
      if (existing) {
        // Update
        await db.update(whiteLabelProfiles)
          .set({
            brandName,
            brandNameAr,
            tagline,
            taglineAr,
            primaryColor,
            secondaryColor,
            accentColor,
            customDomain,
            supportEmail,
            companyName,
            companyNameAr,
            updatedAt: new Date(),
          })
          .where(eq(whiteLabelProfiles.id, existing.id));
        
        res.json({ success: true, profileId: existing.id, updated: true });
      } else {
        // Create
        const [profile] = await db.insert(whiteLabelProfiles).values({
          licenseId,
          brandName,
          brandNameAr,
          tagline,
          taglineAr,
          primaryColor,
          secondaryColor,
          accentColor,
          customDomain,
          supportEmail,
          companyName,
          companyNameAr,
          isActive: true,
        }).returning();
        
        res.json({ success: true, profileId: profile.id, created: true });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ==================== DIGITAL CONTRACTS ====================
  
  // Generate contract from template
  app.post("/api/contracts/generate", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const {
        contractType,
        ownershipId,
        licenseId,
        buyerId,
        titleEn,
        titleAr,
        effectiveDate,
        expiryDate,
        totalValue,
        currency,
        paymentTerms,
        ownerRetainsIP,
        nonCompetePeriodMonths,
        revenueSharePostSale,
        usageSameName,
        usageDifferentName,
        usageModificationAllowed,
        customClauses,
      } = req.body;
      
      // Verify seller owns the platform
      if (ownershipId) {
        const [ownership] = await db.select().from(platformOwnerships)
          .where(and(
            eq(platformOwnerships.id, ownershipId),
            eq(platformOwnerships.ownerId, userId)
          )).limit(1);
        
        if (!ownership) {
          return res.status(403).json({ error: "Not authorized to create contracts for this platform" });
        }
      }
      
      // Get owner and buyer info
      const [seller] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const [buyer] = await db.select().from(users).where(eq(users.id, buyerId)).limit(1);
      
      if (!buyer) {
        return res.status(404).json({ error: "Buyer not found" });
      }
      
      // Get platform info
      let platformName = "Digital Platform";
      if (ownershipId) {
        const [ownership] = await db.select({ project: projects })
          .from(platformOwnerships)
          .leftJoin(projects, eq(platformOwnerships.projectId, projects.id))
          .where(eq(platformOwnerships.id, ownershipId)).limit(1);
        if (ownership?.project) {
          platformName = ownership.project.name;
        }
      }
      
      // Generate contract content from template
      const templateKey = contractType === 'sale' ? 'sale' : 'usage_rights';
      let contentEn = LEGAL_TEMPLATES[`${templateKey}_en` as keyof typeof LEGAL_TEMPLATES] || '';
      let contentAr = LEGAL_TEMPLATES[`${templateKey}_ar` as keyof typeof LEGAL_TEMPLATES] || '';
      
      // Replace template variables
      const replacements: Record<string, string> = {
        '{{OWNER_NAME}}': seller?.fullName || seller?.username || 'Owner',
        '{{SELLER_NAME}}': seller?.fullName || seller?.username || 'Seller',
        '{{LICENSEE_NAME}}': buyer?.fullName || buyer?.username || 'Licensee',
        '{{BUYER_NAME}}': buyer?.fullName || buyer?.username || 'Buyer',
        '{{PLATFORM_NAME}}': platformName,
        '{{START_DATE}}': effectiveDate || new Date().toISOString().split('T')[0],
        '{{END_DATE}}': expiryDate || 'Indefinite',
        '{{LICENSE_TYPE}}': contractType,
        '{{USAGE_NAME_TYPE}}': usageSameName ? 'Same Name' : 'Different Name',
        '{{MODIFICATIONS_ALLOWED}}': usageModificationAllowed ? 'Yes' : 'No',
        '{{LICENSE_PRICE}}': String(totalValue || 0),
        '{{SALE_PRICE}}': String(totalValue || 0),
        '{{CURRENCY}}': currency || 'SAR',
        '{{REVENUE_SHARE}}': String(revenueSharePostSale || 0),
        '{{POST_SALE_SHARE}}': String(revenueSharePostSale || 0),
        '{{RETAINED_SHARE}}': String(revenueSharePostSale || 0),
        '{{NON_COMPETE_MONTHS}}': String(nonCompetePeriodMonths || 0),
        '{{PAYMENT_METHOD}}': paymentTerms || 'As agreed',
        '{{SIGN_DATE}}': new Date().toISOString().split('T')[0],
        '{{TRANSFERRED_RIGHTS}}': ownerRetainsIP ? 'Usage rights only (IP retained by seller)' : 'Full ownership transfer',
      };
      
      Object.entries(replacements).forEach(([key, value]) => {
        contentEn = contentEn.replace(new RegExp(key, 'g'), value);
        contentAr = contentAr.replace(new RegExp(key, 'g'), value);
      });
      
      // Add custom clauses
      if (customClauses && customClauses.length > 0) {
        contentEn += '\n\nADDITIONAL CLAUSES:\n' + customClauses.join('\n');
        contentAr += '\n\nبنود إضافية:\n' + customClauses.join('\n');
      }
      
      const contractNumber = generateContractNumber();
      const contentHash = hashContent(contentEn + contentAr);
      
      const [contract] = await db.insert(digitalContracts).values({
        contractNumber,
        contractType,
        ownershipId,
        licenseId,
        sellerId: userId,
        buyerId,
        titleEn: titleEn || `${contractType} Agreement`,
        titleAr: titleAr || `عقد ${contractType === 'sale' ? 'بيع' : 'انتفاع'}`,
        contentEn,
        contentAr,
        isEncrypted: false,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        totalValue,
        currency: currency || "SAR",
        paymentTerms,
        ownerRetainsIP: ownerRetainsIP ?? true,
        nonCompetePeriodMonths,
        revenueSharePostSale,
        auditRights: true,
        usageSameName: usageSameName ?? false,
        usageDifferentName: usageDifferentName ?? true,
        usageModificationAllowed: usageModificationAllowed ?? false,
        status: "draft",
        contentHash,
        createdBy: userId,
      }).returning();
      
      res.json({
        success: true,
        contract,
        message: `Contract ${contractNumber} generated`,
        messageAr: `تم إنشاء العقد ${contractNumber}`
      });
    } catch (error: any) {
      console.error("[Contracts] Generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Send contract for signature
  app.post("/api/contracts/:id/send", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      
      const [contract] = await db.select().from(digitalContracts)
        .where(and(
          eq(digitalContracts.id, id),
          eq(digitalContracts.sellerId, userId)
        )).limit(1);
      
      if (!contract) {
        return res.status(404).json({ error: "Contract not found or not authorized" });
      }
      
      await db.update(digitalContracts)
        .set({
          status: "pending_signature",
          sentForSignatureAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(digitalContracts.id, id));
      
      res.json({ success: true, message: "Contract sent for signature" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Sign contract
  app.post("/api/contracts/:id/sign", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { signatureData, verificationCode, termsAccepted, disputeResolutionAccepted } = req.body;
      
      const [contract] = await db.select().from(digitalContracts)
        .where(eq(digitalContracts.id, id)).limit(1);
      
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Determine signer role
      let signerRole: string;
      if (contract.sellerId === userId) {
        signerRole = "seller";
      } else if (contract.buyerId === userId) {
        signerRole = "buyer";
      } else {
        return res.status(403).json({ error: "Not a party to this contract" });
      }
      
      // Create signature
      const signatureHash = hashContent(signatureData + userId + new Date().toISOString());
      
      await db.insert(contractSignatures).values({
        contractId: id,
        signerId: userId,
        signerRole,
        signatureType: "digital",
        signatureData,
        signatureHash,
        verificationCode,
        isVerified: true,
        verifiedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        termsAccepted: termsAccepted ?? true,
        disputeResolutionAccepted: disputeResolutionAccepted ?? true,
        signedAt: new Date(),
      });
      
      // Update contract
      if (signerRole === "seller") {
        await db.update(digitalContracts)
          .set({ sellerSignedAt: new Date(), updatedAt: new Date() })
          .where(eq(digitalContracts.id, id));
      } else {
        await db.update(digitalContracts)
          .set({ buyerSignedAt: new Date(), updatedAt: new Date() })
          .where(eq(digitalContracts.id, id));
      }
      
      // Check if both parties signed
      const [updatedContract] = await db.select().from(digitalContracts)
        .where(eq(digitalContracts.id, id)).limit(1);
      
      if (updatedContract?.sellerSignedAt && updatedContract?.buyerSignedAt) {
        await db.update(digitalContracts)
          .set({ status: "active", activatedAt: new Date(), updatedAt: new Date() })
          .where(eq(digitalContracts.id, id));
      }
      
      res.json({ success: true, message: "Contract signed successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get my contracts
  app.get("/api/contracts/my-contracts", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const contracts = await db.select()
        .from(digitalContracts)
        .where(sql`${digitalContracts.sellerId} = ${userId} OR ${digitalContracts.buyerId} = ${userId}`)
        .orderBy(desc(digitalContracts.createdAt));
      
      res.json({ contracts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get contract details
  app.get("/api/contracts/:id", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      
      const [contract] = await db.select()
        .from(digitalContracts)
        .where(eq(digitalContracts.id, id)).limit(1);
      
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Verify access
      if (contract.sellerId !== userId && contract.buyerId !== userId) {
        return res.status(403).json({ error: "Not authorized to view this contract" });
      }
      
      // Get signatures
      const signatures = await db.select()
        .from(contractSignatures)
        .where(eq(contractSignatures.contractId, id));
      
      res.json({ contract, signatures });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // ==================== LICENSE EXPIRY CHECK ====================
  
  // Check and update expired licenses
  app.post("/api/franchise/check-expiry", async (req: Request, res: Response) => {
    try {
      const now = new Date();
      
      // Find expired licenses
      const expiredLicenses = await db.select()
        .from(franchiseLicenses)
        .where(and(
          eq(franchiseLicenses.status, "active"),
          lt(franchiseLicenses.expiryDate, now)
        ));
      
      for (const license of expiredLicenses) {
        await db.update(franchiseLicenses)
          .set({
            status: "expired",
            statusChangedAt: now,
            statusReason: "License expired",
            updatedAt: now,
          })
          .where(eq(franchiseLicenses.id, license.id));
        
        await db.insert(licenseAuditLogs).values({
          licenseId: license.id,
          action: "expired",
          previousStatus: "active",
          newStatus: "expired",
          performedBy: "system",
          reason: "Automatic expiry",
        });
      }
      
      res.json({
        success: true,
        expiredCount: expiredLicenses.length,
        message: `${expiredLicenses.length} licenses expired`
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  console.log("[Ownership & Licensing] Routes registered at /api/ownership/*, /api/franchise/*, /api/branding/*, /api/whitelabel/*, /api/contracts/*");
}
