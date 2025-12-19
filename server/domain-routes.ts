import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { NamecheapClient } from "./namecheap-client";
import { storage } from "./storage";
import crypto from "crypto";
import { domainRegistrarRegistry, getTier1Providers, initializeDomainProviders } from "./domain-registrar-registry";
import { 
  namecheapDomains,
  namecheapDnsRecords,
  domainPlatformLinks,
  namecheapContacts,
  namecheapOperationLogs,
  platforms,
  type User,
  type NamecheapDomain,
  type NamecheapDnsRecord,
  type DomainPlatformLink,
  type NamecheapOperationLog,
  type Platform
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Encryption helpers for storing API keys securely
function getEncryptionKey(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set and at least 32 characters for secure encryption');
  }
  return secret;
}

function encryptApiKey(apiKey: string): string {
  const encryptionKey = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', crypto.scryptSync(encryptionKey, 'salt', 32), iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptApiKey(encryptedKey: string): string {
  try {
    const encryptionKey = getEncryptionKey();
    const [ivHex, encrypted] = encryptedKey.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(encryptionKey, 'salt', 32), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '';
  }
}

// Cache for Namecheap config
let cachedNamecheapConfig: {
  apiUser: string;
  apiKey: string;
  userName: string;
  clientIp: string;
  sandbox: boolean;
} | null = null;

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: Omit<User, 'password'>;
  }
}

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.userId) {
    return next();
  }
  return res.status(401).json({ 
    error: "Authentication required",
    errorAr: "يجب تسجيل الدخول أولاً"
  });
};

const requireSovereign = (req: Request, res: Response, next: NextFunction) => {
  const user = req.session?.user;
  if (!user || (user.role !== 'sovereign' && user.role !== 'owner')) {
    return res.status(403).json({ 
      error: "Sovereign access required",
      errorAr: "صلاحيات سيادية مطلوبة"
    });
  }
  next();
};

export async function getNamecheapClient(): Promise<NamecheapClient | null> {
  // First check cached config
  if (cachedNamecheapConfig) {
    return new NamecheapClient(cachedNamecheapConfig);
  }

  // Try to load from database (service provider API keys)
  try {
    const provider = await storage.getServiceProviderBySlug('namecheap');
    if (provider) {
      const apiKeys = await storage.getProviderApiKeys(provider.id);
      const activeKey = apiKeys.find(k => k.isActive && k.environment === 'production');
      
      if (activeKey && activeKey.encryptedKey) {
        const decryptedKey = decryptApiKey(activeKey.encryptedKey);
        // Parse metadata for username and IP
        const metadata = (provider as any).metadata || {};
        
        cachedNamecheapConfig = {
          apiUser: metadata.apiUser || activeKey.name,
          apiKey: decryptedKey,
          userName: metadata.userName || metadata.apiUser || activeKey.name,
          clientIp: metadata.clientIp || '127.0.0.1',
          sandbox: metadata.sandbox === true
        };
        
        return new NamecheapClient(cachedNamecheapConfig);
      }
    }
  } catch (e) {
    console.error("Failed to load Namecheap config from DB:", e);
  }

  // Fallback to environment variables
  const apiUser = process.env.NAMECHEAP_API_USER;
  const apiKey = process.env.NAMECHEAP_API_KEY;
  const userName = process.env.NAMECHEAP_USERNAME || apiUser;
  const clientIp = process.env.NAMECHEAP_CLIENT_IP || '127.0.0.1';
  const sandbox = process.env.NAMECHEAP_SANDBOX === 'true';

  if (!apiUser || !apiKey) {
    return null;
  }

  cachedNamecheapConfig = {
    apiUser,
    apiKey,
    userName: userName!,
    clientIp,
    sandbox
  };

  return new NamecheapClient(cachedNamecheapConfig);
}

// Clear cached config when settings are updated
export function clearNamecheapCache() {
  cachedNamecheapConfig = null;
}

async function logDomainOperation(
  domainId: string | null,
  domainName: string,
  userId: string | null,
  userEmail: string | null,
  operation: string,
  operationDetails: Record<string, unknown>,
  success: boolean,
  errorMessage?: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await db.insert(namecheapOperationLogs).values({
      domainId,
      domainName,
      userId,
      userEmail,
      operation,
      operationDetails,
      success,
      errorMessage: errorMessage || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null
    });
  } catch (e) {
    console.error("Failed to log domain operation:", e);
  }
}

export function registerDomainRoutes(app: Express) {
  // Initialize domain providers on startup (fire and forget)
  initializeDomainProviders().catch(err => {
    console.log("[Domains] Auto-initialization skipped or failed:", err.message);
  });

  // Get current server IP for Namecheap whitelist
  app.get("/api/domains/server-ip", requireAuth, requireSovereign, async (req, res) => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      res.json({ 
        success: true, 
        ip: data.ip,
        message: { 
          en: "Add this IP to your Namecheap API whitelist", 
          ar: "أضف هذا الـ IP إلى القائمة البيضاء في Namecheap API" 
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to detect server IP",
        errorAr: "فشل في الكشف عن IP الخادم"
      });
    }
  });

  // Save Namecheap configuration
  app.post("/api/domains/config", requireAuth, requireSovereign, async (req, res) => {
    try {
      const { apiUser, apiKey, clientIp, sandbox = false } = req.body;
      
      // Get or create Namecheap provider
      let provider = await storage.getServiceProviderBySlug('namecheap');
      if (!provider) {
        provider = await storage.createServiceProvider({
          name: "Namecheap",
          nameAr: "نيم شيب",
          slug: "namecheap",
          category: "domains",
          description: "Domain registration, DNS management, SSL certificates",
          descriptionAr: "تسجيل الدومينات، إدارة DNS، شهادات SSL",
          logo: "namecheap",
          website: "https://namecheap.com",
          docsUrl: "https://www.namecheap.com/support/api/intro/",
          isBuiltIn: true,
          status: "inactive"
        });
      }

      // Check for existing key
      const existingKeys = await storage.getProviderApiKeys(provider.id);
      const existingKey = existingKeys.find(k => k.isActive);
      
      // Validate: require all fields for new config, allow empty apiKey for updates
      if (!apiUser) {
        return res.status(400).json({ 
          error: "API User is required",
          errorAr: "مطلوب اسم مستخدم API"
        });
      }
      
      if (!clientIp) {
        return res.status(400).json({ 
          error: "Client IP is required",
          errorAr: "مطلوب عنوان IP الخادم"
        });
      }
      
      if (!apiKey && !existingKey) {
        return res.status(400).json({ 
          error: "API Key is required for new configuration",
          errorAr: "مطلوب مفتاح API للإعدادات الجديدة"
        });
      }

      // If new API key provided, update credentials
      if (apiKey) {
        // Encrypt and store API key
        const encryptedKey = encryptApiKey(apiKey);
        const keyPrefix = apiKey.substring(0, 8) + "...";
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
        
        if (existingKey) {
          // Delete old key
          await storage.deleteProviderApiKey(existingKey.id);
        }

        await storage.createProviderApiKey({
          providerId: provider.id,
          name: apiUser,
          keyHash,
          encryptedKey,
          keyPrefix,
          environment: 'production',
          isDefault: true,
          isActive: true,
          createdBy: req.session.user?.id || null
        });
      }

      // Update provider metadata with username and IP
      await storage.updateServiceProvider(provider.id, { 
        status: "active",
        metadata: { apiUser, userName: apiUser, clientIp, sandbox }
      });

      // Clear cache to use new credentials
      clearNamecheapCache();

      // Test connection
      const client = await getNamecheapClient();
      if (client) {
        const testResult = await client.getAccountBalance();
        if (testResult.success) {
          res.json({ 
            success: true, 
            message: { 
              en: "Namecheap configured successfully", 
              ar: "تم تكوين Namecheap بنجاح" 
            },
            balance: testResult.data?.balance,
            currency: testResult.data?.currency
          });
        } else {
          res.json({ 
            success: false, 
            error: testResult.error,
            errorAr: "فشل اختبار الاتصال - تحقق من البيانات وعنوان IP"
          });
        }
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Failed to create client",
          errorAr: "فشل إنشاء العميل"
        });
      }
    } catch (error) {
      console.error("Failed to save Namecheap config:", error);
      res.status(500).json({ 
        error: "Failed to save configuration",
        errorAr: "فشل حفظ الإعدادات"
      });
    }
  });

  // Get current Namecheap configuration (without exposing full API key)
  app.get("/api/domains/config", requireAuth, requireSovereign, async (req, res) => {
    try {
      const provider = await storage.getServiceProviderBySlug('namecheap');
      if (!provider) {
        return res.json({ configured: false });
      }

      const apiKeys = await storage.getProviderApiKeys(provider.id);
      const activeKey = apiKeys.find(k => k.isActive);
      const metadata = (provider as any).metadata || {};

      res.json({
        configured: !!activeKey,
        apiUser: metadata.apiUser || activeKey?.name || null,
        clientIp: metadata.clientIp || null,
        sandbox: metadata.sandbox || false,
        keyPrefix: activeKey?.keyPrefix || null,
        status: provider.status
      });
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to get configuration",
        errorAr: "فشل جلب الإعدادات"
      });
    }
  });

  app.get("/api/domains/config-status", requireAuth, requireSovereign, async (req, res) => {
    const client = await getNamecheapClient();
    res.json({
      configured: !!client,
      sandbox: process.env.NAMECHEAP_SANDBOX === 'true',
      message: client 
        ? { en: "Namecheap API configured", ar: "تم تكوين Namecheap API" }
        : { en: "Namecheap credentials not configured", ar: "لم يتم تكوين بيانات Namecheap" }
    });
  });

  // Import domains from Namecheap account
  app.post("/api/domains/import", requireAuth, requireSovereign, async (req, res) => {
    try {
      const client = await getNamecheapClient();
      if (!client) {
        return res.status(503).json({ 
          error: "Namecheap API not configured",
          errorAr: "لم يتم تكوين Namecheap API"
        });
      }

      const user = req.session.user!;
      const domainList = await client.getDomainList();
      
      if (!domainList.success || !domainList.data) {
        return res.status(400).json({ 
          error: domainList.error || "Failed to fetch domains from Namecheap",
          errorAr: "فشل جلب النطاقات من Namecheap"
        });
      }

      let imported = 0;
      let skipped = 0;
      const importedDomains: string[] = [];

      for (const domain of domainList.data) {
        // Check if domain already exists in database
        const [existing] = await db.select().from(namecheapDomains)
          .where(eq(namecheapDomains.domainName, domain.domainName.toLowerCase()));
        
        if (existing) {
          // Update existing domain
          await db.update(namecheapDomains)
            .set({
              namecheapId: domain.domainId,
              status: domain.isExpired ? 'expired' : 'active',
              expiresAt: domain.expires ? new Date(domain.expires) : null,
              isAutoRenew: domain.autoRenew,
              isLocked: domain.isLocked,
              whoisGuard: domain.whoisGuard,
              lastSyncAt: new Date()
            })
            .where(eq(namecheapDomains.id, existing.id));
          skipped++;
        } else {
          // Insert new domain
          const parts = domain.domainName.split('.');
          const sld = parts[0];
          const tld = parts.slice(1).join('.');
          
          await db.insert(namecheapDomains).values({
            domainName: domain.domainName.toLowerCase(),
            sld,
            tld,
            ownerId: user.id,
            status: domain.isExpired ? 'expired' : 'active',
            registeredAt: domain.created ? new Date(domain.created) : new Date(),
            expiresAt: domain.expires ? new Date(domain.expires) : null,
            isAutoRenew: domain.autoRenew,
            isLocked: domain.isLocked,
            whoisGuard: domain.whoisGuard,
            lastSyncAt: new Date()
          });
          
          // Update with namecheapId after insert
          await db.update(namecheapDomains)
            .set({ namecheapId: domain.domainId })
            .where(eq(namecheapDomains.domainName, domain.domainName.toLowerCase()));
          
          imported++;
          importedDomains.push(domain.domainName);
        }
      }

      // Log the operation
      await logDomainOperation(
        null,
        'bulk_import',
        user.id,
        user.email || null,
        'import',
        { imported, skipped, total: domainList.data.length },
        true,
        undefined,
        req.ip || undefined,
        req.get('user-agent')
      );

      res.json({
        success: true,
        imported,
        skipped,
        total: domainList.data.length,
        importedDomains,
        message: {
          en: `Imported ${imported} domains, ${skipped} already existed`,
          ar: `تم استيراد ${imported} نطاق، ${skipped} موجود مسبقاً`
        }
      });
    } catch (error: any) {
      console.error("Failed to import domains:", error);
      res.status(500).json({ 
        error: error.message || "Failed to import domains",
        errorAr: "فشل استيراد النطاقات"
      });
    }
  });

  // Get all platforms for domain linking
  app.get("/api/platforms", requireAuth, async (req, res) => {
    try {
      const allPlatforms = await db.select().from(platforms).orderBy(desc(platforms.createdAt));
      res.json({
        success: true,
        platforms: allPlatforms,
        total: allPlatforms.length,
        message: {
          en: "Platforms retrieved",
          ar: "تم جلب المنصات"
        }
      });
    } catch (error: any) {
      console.error("Failed to get platforms:", error);
      res.status(500).json({ 
        error: error.message || "Failed to get platforms",
        errorAr: "فشل جلب المنصات"
      });
    }
  });

  // Create a new platform
  app.post("/api/platforms", requireAuth, requireSovereign, async (req, res) => {
    try {
      const { name, nameAr, slug, description, descriptionAr, primaryUrl, type, status } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ 
          error: "Name and slug are required",
          errorAr: "الاسم والمعرف مطلوبان"
        });
      }

      // Check if slug already exists
      const [existing] = await db.select().from(platforms).where(eq(platforms.slug, slug));
      if (existing) {
        return res.status(400).json({ 
          error: "A platform with this slug already exists",
          errorAr: "منصة بهذا المعرف موجودة مسبقاً"
        });
      }

      const [newPlatform] = await db.insert(platforms).values({
        name,
        nameAr: nameAr || null,
        slug,
        description: description || null,
        descriptionAr: descriptionAr || null,
        primaryUrl: primaryUrl || null,
        type: type || 'web',
        status: status || 'active',
        ownerId: req.session.userId,
      }).returning();

      res.json({
        success: true,
        platform: newPlatform,
        message: {
          en: "Platform created successfully",
          ar: "تم إنشاء المنصة بنجاح"
        }
      });
    } catch (error: any) {
      console.error("Failed to create platform:", error);
      res.status(500).json({ 
        error: error.message || "Failed to create platform",
        errorAr: "فشل إنشاء المنصة"
      });
    }
  });

  // Delete a platform
  app.delete("/api/platforms/:id", requireAuth, requireSovereign, async (req, res) => {
    try {
      const [platform] = await db.select().from(platforms).where(eq(platforms.id, req.params.id));
      
      if (!platform) {
        return res.status(404).json({ 
          error: "Platform not found",
          errorAr: "المنصة غير موجودة"
        });
      }

      // Delete associated links first
      await db.delete(domainPlatformLinks).where(eq(domainPlatformLinks.platformId, req.params.id));
      
      // Delete the platform
      await db.delete(platforms).where(eq(platforms.id, req.params.id));

      res.json({
        success: true,
        message: {
          en: "Platform deleted successfully",
          ar: "تم حذف المنصة بنجاح"
        }
      });
    } catch (error: any) {
      console.error("Failed to delete platform:", error);
      res.status(500).json({ 
        error: error.message || "Failed to delete platform",
        errorAr: "فشل حذف المنصة"
      });
    }
  });

  // Domain Registrar Providers Management
  app.get("/api/domains/providers", requireAuth, async (req, res) => {
    const providers = domainRegistrarRegistry.listAll();
    
    // Get actual status from database for each provider
    const providersWithDbStatus = await Promise.all(providers.map(async (p) => {
      const dbProvider = await storage.getServiceProviderBySlug(p.slug);
      const actualStatus = dbProvider?.status || p.status;
      const isConfigured = actualStatus === 'active' || actualStatus === 'configured';
      return {
        ...p,
        status: actualStatus,
        isConfigured,
        isAvailable: actualStatus !== 'coming_soon' && p.status !== 'coming_soon',
      };
    }));
    
    const activeCount = providersWithDbStatus.filter(p => p.isConfigured).length;
    const availableCount = providersWithDbStatus.filter(p => p.isAvailable).length;
    
    res.json({
      success: true,
      providers: providersWithDbStatus,
      total: providers.length,
      active: activeCount,
      available: availableCount
    });
  });

  app.get("/api/domains/providers/:slug", requireAuth, async (req, res) => {
    const config = domainRegistrarRegistry.getConfig(req.params.slug);
    if (!config) {
      return res.status(404).json({ 
        error: "Provider not found",
        errorAr: "المزود غير موجود"
      });
    }
    
    const dbProvider = await storage.getServiceProviderBySlug(req.params.slug);
    
    res.json({
      success: true,
      provider: {
        ...config,
        dbId: dbProvider?.id,
        dbStatus: dbProvider?.status,
        isConfigured: config.status === 'active' || config.status === 'configured',
        isAvailable: config.status !== 'coming_soon',
      }
    });
  });

  app.post("/api/domains/providers/initialize", requireAuth, requireSovereign, async (req, res) => {
    try {
      await initializeDomainProviders();
      res.json({ 
        success: true,
        message: { 
          en: "Domain providers initialized successfully",
          ar: "تم تهيئة مزودي النطاقات بنجاح"
        },
        providers: getTier1Providers().length
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        error: error.message,
        errorAr: "فشل تهيئة مزودي النطاقات"
      });
    }
  });

  app.post("/api/domains/check-availability", requireAuth, async (req, res) => {
    try {
      const { domains } = req.body;
      if (!Array.isArray(domains) || domains.length === 0) {
        return res.status(400).json({ 
          error: "Domains array required",
          errorAr: "مصفوفة الدومينات مطلوبة"
        });
      }

      const client = await getNamecheapClient();
      if (!client) {
        return res.status(503).json({ 
          error: "Namecheap API not configured",
          errorAr: "لم يتم تكوين Namecheap API"
        });
      }

      const result = await client.checkDomainAvailability(domains);
      
      await logDomainOperation(
        null,
        domains.join(","),
        req.session.userId || null,
        req.session.user?.email || null,
        "check_availability",
        { domains, success: result.success },
        result.success,
        result.error,
        req.ip || undefined,
        req.get("user-agent")
      );

      if (result.success && result.data) {
        res.json({ 
          success: true, 
          domains: result.data,
          message: { en: "Availability checked", ar: "تم فحص التوفر" }
        });
      } else {
        res.status(400).json({ 
          error: result.error || "Failed to check availability",
          errorAr: "فشل في فحص التوفر"
        });
      }
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ أثناء فحص التوفر"
      });
    }
  });

  app.post("/api/domains/register", requireAuth, requireSovereign, async (req, res) => {
    try {
      const { domainName, years, contact, nameservers, whoisGuard } = req.body;
      
      if (!domainName) {
        return res.status(400).json({ 
          error: "Domain name required",
          errorAr: "اسم الدومين مطلوب"
        });
      }

      const client = await getNamecheapClient();
      if (!client) {
        return res.status(503).json({ 
          error: "Namecheap API not configured",
          errorAr: "لم يتم تكوين Namecheap API"
        });
      }

      const result = await client.registerDomain(domainName, years || 1, contact);

      const user = req.session.user!;
      
      if (result.success && result.data) {
        const parts = domainName.split(".");
        const sld = parts[0];
        const tld = parts.slice(1).join(".");

        const [savedDomain] = await db.insert(namecheapDomains).values({
          namecheapId: result.data.domainId,
          domainName: domainName.toLowerCase(),
          sld,
          tld,
          ownerId: user.id,
          status: "active",
          isAutoRenew: true,
          whoisGuard: whoisGuard !== false,
          registeredAt: new Date()
        }).returning();

        await logDomainOperation(
          savedDomain.id,
          domainName,
          user.id,
          user.email || null,
          "register",
          { years, whoisGuard, result: result.data },
          true,
          undefined,
          req.ip || undefined,
          req.get("user-agent")
        );

        res.json({
          success: true,
          domain: savedDomain,
          namecheapInfo: result.data,
          message: { 
            en: `Domain ${domainName} registered successfully`, 
            ar: `تم تسجيل الدومين ${domainName} بنجاح` 
          }
        });
      } else {
        await logDomainOperation(
          null,
          domainName,
          user.id,
          user.email || null,
          "register",
          { years, whoisGuard },
          false,
          result.error,
          req.ip || undefined,
          req.get("user-agent")
        );

        res.status(400).json({ 
          error: result.error || "Registration failed",
          errorAr: "فشل تسجيل الدومين"
        });
      }
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ أثناء تسجيل الدومين"
      });
    }
  });

  app.get("/api/domains", requireAuth, async (req, res) => {
    try {
      const user = req.session.user!;
      const domains = await db.select().from(namecheapDomains)
        .where(eq(namecheapDomains.ownerId, user.id))
        .orderBy(desc(namecheapDomains.createdAt));
      
      res.json({ 
        success: true, 
        domains,
        message: { en: "Domains retrieved", ar: "تم جلب الدومينات" }
      });
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ أثناء جلب الدومينات"
      });
    }
  });

  app.get("/api/domains/all", requireAuth, requireSovereign, async (req, res) => {
    try {
      const domains = await db.select().from(namecheapDomains)
        .orderBy(desc(namecheapDomains.createdAt));
      
      res.json({ 
        success: true, 
        domains,
        message: { en: "All domains retrieved", ar: "تم جلب جميع الدومينات" }
      });
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ"
      });
    }
  });

  app.get("/api/domains/:id", requireAuth, async (req, res) => {
    try {
      const [domain] = await db.select().from(namecheapDomains)
        .where(eq(namecheapDomains.id, req.params.id));
      
      if (!domain) {
        return res.status(404).json({ 
          error: "Domain not found",
          errorAr: "الدومين غير موجود"
        });
      }
      
      const user = req.session.user!;
      if (domain.ownerId !== user.id && user.role !== 'sovereign' && user.role !== 'owner') {
        return res.status(403).json({ 
          error: "Access denied",
          errorAr: "الوصول مرفوض"
        });
      }

      res.json({ success: true, domain });
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ"
      });
    }
  });

  app.post("/api/domains/:id/renew", requireAuth, requireSovereign, async (req, res) => {
    try {
      const { years } = req.body;
      const [domain] = await db.select().from(namecheapDomains)
        .where(eq(namecheapDomains.id, req.params.id));
      
      if (!domain) {
        return res.status(404).json({ 
          error: "Domain not found",
          errorAr: "الدومين غير موجود"
        });
      }

      const client = await getNamecheapClient();
      if (!client) {
        return res.status(503).json({ 
          error: "Namecheap API not configured",
          errorAr: "لم يتم تكوين Namecheap API"
        });
      }

      const result = await client.renewDomain(domain.domainName, years || 1);
      const user = req.session.user!;

      if (result.success && result.data) {
        const newExpiry = result.data.expirationDate 
          ? new Date(result.data.expirationDate) 
          : domain.expiresAt;

        await db.update(namecheapDomains)
          .set({
            expiresAt: newExpiry,
            updatedAt: new Date()
          })
          .where(eq(namecheapDomains.id, domain.id));

        await logDomainOperation(
          domain.id,
          domain.domainName,
          user.id,
          user.email || null,
          "renew",
          { years, result: result.data },
          true,
          undefined,
          req.ip || undefined,
          req.get("user-agent")
        );

        res.json({
          success: true,
          renewal: result.data,
          message: { 
            en: `Domain renewed for ${years || 1} year(s)`, 
            ar: `تم تجديد الدومين لمدة ${years || 1} سنة` 
          }
        });
      } else {
        await logDomainOperation(
          domain.id,
          domain.domainName,
          user.id,
          user.email || null,
          "renew",
          { years },
          false,
          result.error,
          req.ip || undefined,
          req.get("user-agent")
        );

        res.status(400).json({ 
          error: result.error || "Renewal failed",
          errorAr: "فشل التجديد"
        });
      }
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ أثناء تجديد الدومين"
      });
    }
  });

  app.get("/api/domains/:id/dns", requireAuth, async (req, res) => {
    try {
      const [domain] = await db.select().from(namecheapDomains)
        .where(eq(namecheapDomains.id, req.params.id));
      
      if (!domain) {
        return res.status(404).json({ 
          error: "Domain not found",
          errorAr: "الدومين غير موجود"
        });
      }

      const user = req.session.user!;
      if (domain.ownerId !== user.id && user.role !== 'sovereign' && user.role !== 'owner') {
        return res.status(403).json({ 
          error: "Access denied",
          errorAr: "الوصول مرفوض"
        });
      }

      const records = await db.select().from(namecheapDnsRecords)
        .where(eq(namecheapDnsRecords.domainId, domain.id));
      
      res.json({ success: true, records });
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ"
      });
    }
  });

  app.post("/api/domains/:id/dns", requireAuth, async (req, res) => {
    try {
      const [domain] = await db.select().from(namecheapDomains)
        .where(eq(namecheapDomains.id, req.params.id));
      
      if (!domain) {
        return res.status(404).json({ 
          error: "Domain not found",
          errorAr: "الدومين غير موجود"
        });
      }

      const user = req.session.user!;
      if (domain.ownerId !== user.id && user.role !== 'sovereign' && user.role !== 'owner') {
        return res.status(403).json({ 
          error: "Access denied",
          errorAr: "الوصول مرفوض"
        });
      }

      const { hostName, recordType, address, mxPref, ttl } = req.body;

      const [newRecord] = await db.insert(namecheapDnsRecords).values({
        domainId: domain.id,
        hostName,
        recordType,
        address,
        mxPref: recordType === 'MX' ? (mxPref || 10) : null,
        ttl: ttl || 1800,
        isActive: true
      }).returning();

      const client = await getNamecheapClient();
      if (client) {
        const allRecords = await db.select().from(namecheapDnsRecords)
          .where(eq(namecheapDnsRecords.domainId, domain.id));
        
        await client.setDnsRecords(domain.domainName, allRecords.map(r => ({
          hostName: r.hostName,
          recordType: r.recordType as any,
          address: r.address,
          mxPref: r.mxPref || undefined,
          ttl: r.ttl
        })));
      }

      await logDomainOperation(
        domain.id,
        domain.domainName,
        user.id,
        user.email || null,
        "dns_add",
        { hostName, recordType, address },
        true,
        undefined,
        req.ip || undefined,
        req.get("user-agent")
      );

      res.json({ 
        success: true, 
        record: newRecord,
        message: { en: "DNS record added", ar: "تمت إضافة سجل DNS" }
      });
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ"
      });
    }
  });

  app.delete("/api/domains/:domainId/dns/:recordId", requireAuth, async (req, res) => {
    try {
      const [domain] = await db.select().from(namecheapDomains)
        .where(eq(namecheapDomains.id, req.params.domainId));
      
      if (!domain) {
        return res.status(404).json({ 
          error: "Domain not found",
          errorAr: "الدومين غير موجود"
        });
      }

      const user = req.session.user!;
      if (domain.ownerId !== user.id && user.role !== 'sovereign' && user.role !== 'owner') {
        return res.status(403).json({ 
          error: "Access denied",
          errorAr: "الوصول مرفوض"
        });
      }

      await db.delete(namecheapDnsRecords)
        .where(eq(namecheapDnsRecords.id, req.params.recordId));

      const client = await getNamecheapClient();
      if (client) {
        const allRecords = await db.select().from(namecheapDnsRecords)
          .where(eq(namecheapDnsRecords.domainId, domain.id));
        
        await client.setDnsRecords(domain.domainName, allRecords.map(r => ({
          hostName: r.hostName,
          recordType: r.recordType as any,
          address: r.address,
          mxPref: r.mxPref || undefined,
          ttl: r.ttl
        })));
      }

      await logDomainOperation(
        domain.id,
        domain.domainName,
        user.id,
        user.email || null,
        "dns_delete",
        { recordId: req.params.recordId },
        true,
        undefined,
        req.ip || undefined,
        req.get("user-agent")
      );

      res.json({ 
        success: true,
        message: { en: "DNS record deleted", ar: "تم حذف سجل DNS" }
      });
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ"
      });
    }
  });

  app.post("/api/domains/:id/link-platform", requireAuth, requireSovereign, async (req, res) => {
    try {
      const [domain] = await db.select().from(namecheapDomains)
        .where(eq(namecheapDomains.id, req.params.id));
      
      if (!domain) {
        return res.status(404).json({ 
          error: "Domain not found",
          errorAr: "الدومين غير موجود"
        });
      }

      const { platformId, subdomain, linkType, targetAddress, targetPort, sslEnabled } = req.body;
      
      if (!platformId) {
        return res.status(400).json({ 
          error: "Platform ID required",
          errorAr: "معرف المنصة مطلوب"
        });
      }

      // Get platform details to fetch target address if not provided
      const [platform] = await db.select().from(platforms).where(eq(platforms.id, platformId));
      
      if (!platform) {
        return res.status(404).json({ 
          error: "Platform not found",
          errorAr: "المنصة غير موجودة"
        });
      }

      // Use provided targetAddress or get from platform's primaryUrl
      const finalTargetAddress = targetAddress || platform.primaryUrl || 'pending-configuration';

      const [link] = await db.insert(domainPlatformLinks).values({
        domainId: domain.id,
        platformId,
        subdomain: subdomain || null,
        targetType: linkType || "primary",
        targetAddress: finalTargetAddress,
        targetPort: targetPort || null,
        sslEnabled: sslEnabled !== false,
        isActive: true,
        verificationStatus: "pending"
      }).returning();

      const client = await getNamecheapClient();
      if (client && targetAddress) {
        const hostName = subdomain || "@";
        const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(targetAddress);
        
        await db.insert(namecheapDnsRecords).values({
          domainId: domain.id,
          hostName,
          recordType: isIpAddress ? "A" : "CNAME",
          address: targetAddress,
          mxPref: null,
          ttl: 1800,
          isActive: true
        });

        const allRecords = await db.select().from(namecheapDnsRecords)
          .where(eq(namecheapDnsRecords.domainId, domain.id));
        
        await client.setDnsRecords(domain.domainName, allRecords.map(r => ({
          hostName: r.hostName,
          recordType: r.recordType as any,
          address: r.address,
          mxPref: r.mxPref || undefined,
          ttl: r.ttl
        })));
      }

      const user = req.session.user!;
      await logDomainOperation(
        domain.id,
        domain.domainName,
        user.id,
        user.email || null,
        "link_platform",
        { platformId, subdomain, targetAddress },
        true,
        undefined,
        req.ip || undefined,
        req.get("user-agent")
      );

      res.json({ 
        success: true, 
        link,
        message: { 
          en: "Domain linked to platform", 
          ar: "تم ربط الدومين بالمنصة" 
        }
      });
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ"
      });
    }
  });

  app.get("/api/domains/:id/platform-links", requireAuth, async (req, res) => {
    try {
      const [domain] = await db.select().from(namecheapDomains)
        .where(eq(namecheapDomains.id, req.params.id));
      
      if (!domain) {
        return res.status(404).json({ 
          error: "Domain not found",
          errorAr: "الدومين غير موجود"
        });
      }

      const user = req.session.user!;
      if (domain.ownerId !== user.id && user.role !== 'sovereign' && user.role !== 'owner') {
        return res.status(403).json({ 
          error: "Access denied",
          errorAr: "الوصول مرفوض"
        });
      }

      const links = await db.select().from(domainPlatformLinks)
        .where(eq(domainPlatformLinks.domainId, domain.id));
      
      res.json({ success: true, links });
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ"
      });
    }
  });

  app.delete("/api/domains/link/:linkId", requireAuth, async (req, res) => {
    try {
      const linkId = parseInt(req.params.linkId);
      const [link] = await db.select().from(domainPlatformLinks)
        .where(eq(domainPlatformLinks.id, linkId));
      
      if (!link) {
        return res.status(404).json({ 
          error: "Link not found",
          errorAr: "الربط غير موجود"
        });
      }

      const [domain] = await db.select().from(namecheapDomains)
        .where(eq(namecheapDomains.id, link.domainId));

      const user = req.session.user!;
      if (domain && domain.ownerId !== user.id && user.role !== 'sovereign' && user.role !== 'owner') {
        return res.status(403).json({ 
          error: "Access denied",
          errorAr: "الوصول مرفوض"
        });
      }

      await db.delete(domainPlatformLinks)
        .where(eq(domainPlatformLinks.id, linkId));

      if (domain) {
        await logDomainOperation(
          domain.id,
          domain.domainName,
          user.id,
          user.email || null,
          "unlink_platform",
          { linkId, platformId: link.platformId },
          true,
          undefined,
          req.ip || undefined,
          req.get("user-agent")
        );
      }

      res.json({ 
        success: true,
        message: { en: "Platform unlinked", ar: "تم إلغاء ربط المنصة" }
      });
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ أثناء إلغاء الربط"
      });
    }
  });

  app.post("/api/domains/:id/sync", requireAuth, async (req, res) => {
    try {
      const [domain] = await db.select().from(namecheapDomains)
        .where(eq(namecheapDomains.id, req.params.id));
      
      if (!domain) {
        return res.status(404).json({ 
          error: "Domain not found",
          errorAr: "الدومين غير موجود"
        });
      }

      const user = req.session.user!;
      if (domain.ownerId !== user.id && user.role !== 'sovereign' && user.role !== 'owner') {
        return res.status(403).json({ 
          error: "Access denied",
          errorAr: "الوصول مرفوض"
        });
      }

      const client = await getNamecheapClient();
      if (!client) {
        return res.status(503).json({ 
          error: "Namecheap API not configured",
          errorAr: "لم يتم تكوين Namecheap API"
        });
      }

      const dnsResult = await client.getDnsRecords(domain.domainName);
      
      if (dnsResult.success && dnsResult.data) {
        await db.delete(namecheapDnsRecords)
          .where(eq(namecheapDnsRecords.domainId, domain.id));
        
        for (const host of dnsResult.data) {
          await db.insert(namecheapDnsRecords).values({
            domainId: domain.id,
            hostName: host.hostName,
            recordType: host.recordType,
            address: host.address,
            mxPref: host.mxPref || null,
            ttl: host.ttl || 1800,
            isActive: true
          });
        }

        await db.update(namecheapDomains)
          .set({
            lastSyncAt: new Date(),
            syncError: null,
            updatedAt: new Date()
          })
          .where(eq(namecheapDomains.id, domain.id));

        await logDomainOperation(
          domain.id,
          domain.domainName,
          user.id,
          user.email || null,
          "sync",
          { hostsCount: dnsResult.data.length },
          true,
          undefined,
          req.ip || undefined,
          req.get("user-agent")
        );

        res.json({ 
          success: true,
          hostsCount: dnsResult.data.length,
          message: { en: "Domain synced", ar: "تمت مزامنة الدومين" }
        });
      } else {
        await db.update(namecheapDomains)
          .set({
            lastSyncAt: new Date(),
            syncError: dnsResult.error,
            updatedAt: new Date()
          })
          .where(eq(namecheapDomains.id, domain.id));

        res.status(400).json({ 
          error: dnsResult.error || "Sync failed",
          errorAr: "فشلت المزامنة"
        });
      }
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ أثناء المزامنة"
      });
    }
  });

  app.get("/api/domains/logs/:domainId?", requireAuth, requireSovereign, async (req, res) => {
    try {
      const { domainId } = req.params;
      const limit = Number(req.query.limit) || 50;
      
      let logs;
      if (domainId) {
        logs = await db.select().from(namecheapOperationLogs)
          .where(eq(namecheapOperationLogs.domainId, domainId))
          .orderBy(desc(namecheapOperationLogs.createdAt))
          .limit(limit);
      } else {
        logs = await db.select().from(namecheapOperationLogs)
          .orderBy(desc(namecheapOperationLogs.createdAt))
          .limit(limit);
      }
      
      res.json({ success: true, logs });
    } catch (e: any) {
      res.status(500).json({ 
        error: e.message,
        errorAr: "حدث خطأ"
      });
    }
  });

  console.log("Domain routes registered | تم تسجيل مسارات الدومينات");
}
