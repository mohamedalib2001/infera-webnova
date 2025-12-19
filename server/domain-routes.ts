import type { Express, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { NamecheapClient } from "./namecheap-client";
import { 
  namecheapDomains,
  namecheapDnsRecords,
  domainPlatformLinks,
  namecheapContacts,
  namecheapOperationLogs,
  type User,
  type NamecheapDomain,
  type NamecheapDnsRecord,
  type DomainPlatformLink,
  type NamecheapOperationLog
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

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

function getNamecheapClient(): NamecheapClient | null {
  const apiUser = process.env.NAMECHEAP_API_USER;
  const apiKey = process.env.NAMECHEAP_API_KEY;
  const userName = process.env.NAMECHEAP_USERNAME || apiUser;
  const clientIp = process.env.NAMECHEAP_CLIENT_IP || '127.0.0.1';
  const sandbox = process.env.NAMECHEAP_SANDBOX === 'true';

  if (!apiUser || !apiKey) {
    return null;
  }

  return new NamecheapClient({
    apiUser,
    apiKey,
    userName: userName!,
    clientIp,
    sandbox
  });
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

  app.get("/api/domains/config-status", requireAuth, requireSovereign, async (req, res) => {
    const client = getNamecheapClient();
    res.json({
      configured: !!client,
      sandbox: process.env.NAMECHEAP_SANDBOX === 'true',
      message: client 
        ? { en: "Namecheap API configured", ar: "تم تكوين Namecheap API" }
        : { en: "Namecheap credentials not configured", ar: "لم يتم تكوين بيانات Namecheap" }
    });
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

      const client = getNamecheapClient();
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

      const client = getNamecheapClient();
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

      const client = getNamecheapClient();
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

      const client = getNamecheapClient();
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

      const client = getNamecheapClient();
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

      const { platformId, subdomain, targetAddress, targetPort, sslEnabled } = req.body;
      
      if (!platformId || !targetAddress) {
        return res.status(400).json({ 
          error: "Platform ID and target address required",
          errorAr: "معرف المنصة وعنوان الهدف مطلوبان"
        });
      }

      const [link] = await db.insert(domainPlatformLinks).values({
        domainId: domain.id,
        platformId,
        subdomain: subdomain || null,
        targetType: "server",
        targetAddress,
        targetPort: targetPort || null,
        sslEnabled: sslEnabled !== false,
        isActive: true,
        verificationStatus: "pending"
      }).returning();

      const client = getNamecheapClient();
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

      const client = getNamecheapClient();
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
