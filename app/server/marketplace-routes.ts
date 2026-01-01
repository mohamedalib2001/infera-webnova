import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  marketplaceItems, 
  marketplaceInstallations,
  insertMarketplaceItemSchema,
  insertMarketplaceInstallationSchema
} from "@shared/schema";
import { eq, and, desc, isNotNull, sql, ilike, or } from "drizzle-orm";
import { z } from "zod";

const installBodySchema = z.object({
  platformId: z.string().optional()
});

const rateBodySchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().optional()
});

const router = Router();

const defaultItems = [
  { 
    name: "E-commerce Starter", 
    nameAr: "متجر إلكتروني", 
    description: "Complete e-commerce template with cart and checkout", 
    descriptionAr: "قالب متجر إلكتروني كامل مع سلة التسوق والدفع",
    author: "WebDev Pro", 
    type: "template", 
    category: "ecommerce", 
    isPremium: false, 
    icon: "store",
    features: ["Shopping cart", "Checkout flow", "Product catalog", "Order management"],
    featuresAr: ["سلة التسوق", "عملية الدفع", "كتالوج المنتجات", "إدارة الطلبات"]
  },
  { 
    name: "Dashboard Pro", 
    nameAr: "لوحة تحكم احترافية", 
    description: "Admin dashboard with charts and analytics", 
    descriptionAr: "لوحة تحكم إدارية مع الرسوم البيانية والتحليلات",
    author: "UI Masters", 
    type: "template", 
    category: "admin", 
    isPremium: true, 
    price: 4900,
    icon: "chart",
    features: ["Analytics charts", "User management", "Reports", "Real-time data"],
    featuresAr: ["رسوم بيانية تحليلية", "إدارة المستخدمين", "التقارير", "بيانات مباشرة"]
  },
  { 
    name: "Auth Kit", 
    nameAr: "نظام المصادقة", 
    description: "Complete authentication with OAuth providers", 
    descriptionAr: "نظام مصادقة كامل مع مزودي OAuth",
    author: "Security First", 
    type: "extension", 
    category: "auth", 
    isPremium: false, 
    icon: "shield",
    features: ["OAuth integration", "JWT tokens", "Session management", "Password reset"],
    featuresAr: ["تكامل OAuth", "رموز JWT", "إدارة الجلسات", "إعادة تعيين كلمة المرور"]
  },
  { 
    name: "Payment Gateway", 
    nameAr: "بوابة الدفع", 
    description: "Stripe & PayPal integration ready", 
    descriptionAr: "تكامل جاهز مع Stripe و PayPal",
    author: "FinTech Dev", 
    type: "extension", 
    category: "payment", 
    isPremium: true, 
    price: 2900,
    icon: "credit",
    features: ["Stripe integration", "PayPal support", "Subscription billing", "Refunds"],
    featuresAr: ["تكامل Stripe", "دعم PayPal", "فواتير الاشتراك", "المبالغ المستردة"]
  },
  { 
    name: "Blog Platform", 
    nameAr: "منصة المدونات", 
    description: "Full-featured blog with CMS", 
    descriptionAr: "مدونة كاملة المميزات مع نظام إدارة المحتوى",
    author: "Content Creators", 
    type: "template", 
    category: "blog", 
    isPremium: false, 
    icon: "file",
    features: ["Rich text editor", "Categories & tags", "Comments", "SEO optimization"],
    featuresAr: ["محرر نصوص متقدم", "الفئات والعلامات", "التعليقات", "تحسين SEO"]
  },
  { 
    name: "AI Chat Widget", 
    nameAr: "ودجة الدردشة الذكية", 
    description: "Embeddable AI chatbot for support", 
    descriptionAr: "روبوت دردشة ذكي قابل للتضمين للدعم الفني",
    author: "AI Solutions", 
    type: "extension", 
    category: "ai", 
    isPremium: true, 
    price: 3900,
    icon: "bot",
    features: ["AI-powered responses", "Custom training", "Multi-language", "Analytics"],
    featuresAr: ["ردود مدعومة بالذكاء الاصطناعي", "تدريب مخصص", "متعدد اللغات", "التحليلات"]
  },
  { 
    name: "AI Customer Support Agent", 
    nameAr: "وكيل دعم العملاء الذكي", 
    description: "24/7 AI-powered customer support with ticket management", 
    descriptionAr: "دعم عملاء ذكي على مدار الساعة مع إدارة التذاكر",
    author: "INFERA AI", 
    type: "service", 
    category: "ai", 
    isPremium: true, 
    price: 9900,
    pricingModel: "usage",
    icon: "headphones",
    features: ["24/7 availability", "Ticket routing", "Sentiment analysis", "Escalation rules"],
    featuresAr: ["متاح على مدار الساعة", "توجيه التذاكر", "تحليل المشاعر", "قواعد التصعيد"]
  },
  { 
    name: "AI Analytics Engine", 
    nameAr: "محرك التحليلات الذكي", 
    description: "Real-time AI analytics with predictive insights", 
    descriptionAr: "تحليلات ذكية في الوقت الفعلي مع رؤى تنبؤية",
    author: "INFERA AI", 
    type: "service", 
    category: "ai", 
    isPremium: true, 
    price: 14900,
    pricingModel: "subscription",
    icon: "chart",
    features: ["Predictive analytics", "Anomaly detection", "Custom dashboards", "API access"],
    featuresAr: ["تحليلات تنبؤية", "اكتشاف الشذوذ", "لوحات معلومات مخصصة", "وصول API"]
  },
  { 
    name: "AI SEO Optimizer", 
    nameAr: "محسن SEO الذكي", 
    description: "AI-powered SEO analysis and optimization", 
    descriptionAr: "تحليل وتحسين SEO بالذكاء الاصطناعي",
    author: "INFERA AI", 
    type: "service", 
    category: "ai", 
    isPremium: true, 
    price: 4900,
    pricingModel: "usage",
    icon: "search",
    features: ["Content optimization", "Keyword analysis", "Competitor tracking", "Rank monitoring"],
    featuresAr: ["تحسين المحتوى", "تحليل الكلمات المفتاحية", "تتبع المنافسين", "مراقبة الترتيب"]
  },
  { 
    name: "AI Content Generator", 
    nameAr: "مولد المحتوى الذكي", 
    description: "Generate marketing content, blogs, and product descriptions", 
    descriptionAr: "توليد محتوى تسويقي ومقالات ووصف المنتجات",
    author: "INFERA AI", 
    type: "service", 
    category: "ai", 
    isPremium: true, 
    price: 7900,
    pricingModel: "usage",
    icon: "pen",
    features: ["Multi-language", "Brand voice", "SEO-optimized", "Bulk generation"],
    featuresAr: ["متعدد اللغات", "صوت العلامة التجارية", "محسن لـ SEO", "توليد بالجملة"]
  },
  { 
    name: "AI Fraud Detection", 
    nameAr: "كاشف الاحتيال الذكي", 
    description: "Real-time fraud detection and prevention", 
    descriptionAr: "كشف الاحتيال ومنعه في الوقت الفعلي",
    author: "INFERA AI", 
    type: "service", 
    category: "ai", 
    isPremium: true, 
    price: 19900,
    pricingModel: "subscription",
    icon: "shield",
    features: ["Real-time monitoring", "Risk scoring", "Pattern recognition", "Compliance reports"],
    featuresAr: ["مراقبة فورية", "تقييم المخاطر", "التعرف على الأنماط", "تقارير الامتثال"]
  },
];

async function seedMarketplaceItems() {
  const existing = await db.select().from(marketplaceItems).limit(1);
  if (existing.length === 0) {
    for (const item of defaultItems) {
      await db.insert(marketplaceItems).values(item);
    }
    console.log("Seeded marketplace with default items");
  }
}

seedMarketplaceItems().catch(console.error);

router.get("/items", async (req: Request, res: Response) => {
  try {
    const { type, category, search } = req.query;
    
    const conditions = [eq(marketplaceItems.isActive, true)];
    
    if (type && type !== "all") {
      conditions.push(eq(marketplaceItems.type, type as string));
    }
    
    if (category && category !== "all") {
      conditions.push(eq(marketplaceItems.category, category as string));
    }
    
    if (search && typeof search === "string" && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(marketplaceItems.name, searchPattern),
          ilike(marketplaceItems.description, searchPattern)
        )!
      );
    }
    
    const items = await db.select().from(marketplaceItems)
      .where(and(...conditions))
      .orderBy(desc(marketplaceItems.downloads));
    
    res.json(items);
  } catch (error) {
    console.error("Error fetching marketplace items:", error);
    res.status(500).json({ error: "Failed to fetch items", errorAr: "فشل في جلب العناصر" });
  }
});

router.get("/installations", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }
    
    const installations = await db.select({
      installation: marketplaceInstallations,
      item: marketplaceItems
    })
    .from(marketplaceInstallations)
    .innerJoin(marketplaceItems, eq(marketplaceInstallations.itemId, marketplaceItems.id))
    .where(and(
      eq(marketplaceInstallations.userId, userId),
      eq(marketplaceInstallations.isActive, true)
    ));
    
    res.json(installations);
  } catch (error) {
    console.error("Error fetching installations:", error);
    res.status(500).json({ error: "Failed to fetch installations", errorAr: "فشل في جلب التثبيتات" });
  }
});

router.post("/install/:itemId", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }
    
    const { itemId } = req.params;
    
    const parsed = installBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", errorAr: "طلب غير صالح" });
    }
    const { platformId } = parsed.data;
    
    const item = await db.select().from(marketplaceItems).where(eq(marketplaceItems.id, itemId)).limit(1);
    if (item.length === 0) {
      return res.status(404).json({ error: "Item not found", errorAr: "العنصر غير موجود" });
    }
    
    const existing = await db.select().from(marketplaceInstallations)
      .where(and(
        eq(marketplaceInstallations.userId, userId),
        eq(marketplaceInstallations.itemId, itemId),
        eq(marketplaceInstallations.isActive, true)
      )).limit(1);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: "Already installed", errorAr: "مثبت مسبقاً" });
    }
    
    const [installation] = await db.insert(marketplaceInstallations).values({
      userId,
      itemId,
      platformId: platformId || null,
      installedVersion: item[0].version,
      isActive: true
    }).returning();
    
    await db.execute(sql`UPDATE marketplace_items SET downloads = COALESCE(downloads, 0) + 1 WHERE id = ${itemId}`);
    
    res.json({ 
      success: true, 
      installation,
      message: "Installed successfully",
      messageAr: "تم التثبيت بنجاح"
    });
  } catch (error) {
    console.error("Error installing item:", error);
    res.status(500).json({ error: "Installation failed", errorAr: "فشل التثبيت" });
  }
});

router.delete("/uninstall/:itemId", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }
    
    const { itemId } = req.params;
    
    await db.update(marketplaceInstallations)
      .set({ isActive: false })
      .where(and(
        eq(marketplaceInstallations.userId, userId),
        eq(marketplaceInstallations.itemId, itemId)
      ));
    
    res.json({ 
      success: true,
      message: "Uninstalled successfully",
      messageAr: "تم إلغاء التثبيت بنجاح"
    });
  } catch (error) {
    console.error("Error uninstalling item:", error);
    res.status(500).json({ error: "Uninstall failed", errorAr: "فشل إلغاء التثبيت" });
  }
});

router.post("/rate/:itemId", async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId || (req.user as any)?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", errorAr: "غير مصرح" });
    }
    
    const { itemId } = req.params;
    
    const parsed = rateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Rating must be 1-5", errorAr: "التقييم يجب أن يكون من 1 إلى 5" });
    }
    const { rating, review } = parsed.data;
    
    const installation = await db.select().from(marketplaceInstallations)
      .where(and(
        eq(marketplaceInstallations.userId, userId),
        eq(marketplaceInstallations.itemId, itemId)
      )).limit(1);
    
    if (installation.length === 0) {
      return res.status(400).json({ error: "Must install before rating", errorAr: "يجب التثبيت قبل التقييم" });
    }
    
    await db.update(marketplaceInstallations)
      .set({ rating, review, updatedAt: new Date() })
      .where(eq(marketplaceInstallations.id, installation[0].id));
    
    const allRatings = await db.select({ rating: marketplaceInstallations.rating })
      .from(marketplaceInstallations)
      .where(and(
        eq(marketplaceInstallations.itemId, itemId),
        isNotNull(marketplaceInstallations.rating)
      ));
    
    const avgRating = allRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / allRatings.length;
    
    await db.update(marketplaceItems)
      .set({ 
        rating: Math.round(avgRating * 10) / 10,
        ratingCount: allRatings.length 
      })
      .where(eq(marketplaceItems.id, itemId));
    
    res.json({ 
      success: true,
      message: "Rating saved",
      messageAr: "تم حفظ التقييم"
    });
  } catch (error) {
    console.error("Error rating item:", error);
    res.status(500).json({ error: "Rating failed", errorAr: "فشل التقييم" });
  }
});

export default router;
