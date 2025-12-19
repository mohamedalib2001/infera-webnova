import { Router, Request, Response } from "express";
import { db } from "./db";
import { 
  marketplaceItems, 
  marketplaceInstallations,
  insertMarketplaceItemSchema,
  insertMarketplaceInstallationSchema
} from "@shared/schema";
import { eq, and, sql, desc, asc } from "drizzle-orm";

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
    
    let items = await db.select().from(marketplaceItems)
      .where(eq(marketplaceItems.isActive, true))
      .orderBy(desc(marketplaceItems.downloads));
    
    if (type && type !== "all") {
      items = items.filter(i => i.type === type);
    }
    
    if (category && category !== "all") {
      items = items.filter(i => i.category === category);
    }
    
    if (search && typeof search === "string") {
      const searchLower = search.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(searchLower) || 
        i.description.toLowerCase().includes(searchLower)
      );
    }
    
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
    const { platformId } = req.body;
    
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
    
    await db.update(marketplaceItems)
      .set({ downloads: sql`${marketplaceItems.downloads} + 1` })
      .where(eq(marketplaceItems.id, itemId));
    
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
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be 1-5", errorAr: "التقييم يجب أن يكون من 1 إلى 5" });
    }
    
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
        sql`${marketplaceInstallations.rating} IS NOT NULL`
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
