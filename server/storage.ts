import {
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type Message,
  type InsertMessage,
  type Template,
  type InsertTemplate,
  type ProjectVersion,
  type InsertProjectVersion,
  type ShareLink,
  type InsertShareLink,
  type Component,
  type InsertComponent,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type UserSubscription,
  type InsertUserSubscription,
  type Payment,
  type InsertPayment,
  type AiUsage,
  type InsertAiUsage,
  users,
  projects,
  messages,
  templates,
  projectVersions,
  shareLinks,
  components,
  subscriptionPlans,
  userSubscriptions,
  payments,
  aiUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlanByRole(role: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  
  // User Subscriptions
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: string, subscription: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
  
  // Payments
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // AI Usage
  getAiUsage(userId: string, month: string): Promise<AiUsage | undefined>;
  createAiUsage(usage: InsertAiUsage): Promise<AiUsage>;
  updateAiUsage(id: string, usage: Partial<InsertAiUsage>): Promise<AiUsage | undefined>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Messages
  getMessagesByProject(projectId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;

  // Project Versions
  getProjectVersions(projectId: string): Promise<ProjectVersion[]>;
  getProjectVersion(id: string): Promise<ProjectVersion | undefined>;
  createProjectVersion(version: InsertProjectVersion): Promise<ProjectVersion>;

  // Share Links
  getShareLink(shareCode: string): Promise<ShareLink | undefined>;
  getShareLinksByProject(projectId: string): Promise<ShareLink[]>;
  createShareLink(link: InsertShareLink): Promise<ShareLink>;
  deactivateShareLink(id: string): Promise<boolean>;

  // Components
  getComponents(): Promise<Component[]>;
  getComponentsByCategory(category: string): Promise<Component[]>;
  getComponent(id: string): Promise<Component | undefined>;
  createComponent(component: InsertComponent): Promise<Component>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeSubscriptionPlans();
    this.initializeTemplates();
    this.initializeComponents();
  }

  // Initialize subscription plans
  private async initializeSubscriptionPlans() {
    const existingPlans = await db.select().from(subscriptionPlans);
    if (existingPlans.length > 0) return;

    const plans: InsertSubscriptionPlan[] = [
      {
        name: "Free",
        nameAr: "مجاني",
        description: "Get started with basic features",
        descriptionAr: "ابدأ مع الميزات الأساسية",
        role: "free",
        priceMonthly: 0,
        priceQuarterly: 0,
        priceSemiAnnual: 0,
        priceYearly: 0,
        currency: "USD",
        features: ["1 Project", "5 Pages per Project", "10 AI Generations/month", "Basic Templates"],
        featuresAr: ["مشروع واحد", "5 صفحات لكل مشروع", "10 توليدات AI شهرياً", "قوالب أساسية"],
        maxProjects: 1,
        maxPagesPerProject: 5,
        aiGenerationsPerMonth: 10,
        customDomain: false,
        whiteLabel: false,
        prioritySupport: false,
        analyticsAccess: false,
        chatbotBuilder: false,
        teamMembers: 1,
        sortOrder: 0,
      },
      {
        name: "Basic",
        nameAr: "أساسي",
        description: "Perfect for individuals",
        descriptionAr: "مثالي للأفراد",
        role: "basic",
        priceMonthly: 999, // $9.99
        priceQuarterly: 2499, // $24.99 (save ~17%)
        priceSemiAnnual: 4499, // $44.99 (save ~25%)
        priceYearly: 7999, // $79.99 (save ~33%)
        currency: "USD",
        features: ["5 Projects", "20 Pages per Project", "50 AI Generations/month", "All Templates", "Export Code"],
        featuresAr: ["5 مشاريع", "20 صفحة لكل مشروع", "50 توليد AI شهرياً", "جميع القوالب", "تصدير الكود"],
        maxProjects: 5,
        maxPagesPerProject: 20,
        aiGenerationsPerMonth: 50,
        customDomain: false,
        whiteLabel: false,
        prioritySupport: false,
        analyticsAccess: true,
        chatbotBuilder: false,
        teamMembers: 1,
        sortOrder: 1,
      },
      {
        name: "Pro",
        nameAr: "احترافي",
        description: "For professionals and small businesses",
        descriptionAr: "للمحترفين والشركات الصغيرة",
        role: "pro",
        priceMonthly: 2999, // $29.99
        priceQuarterly: 7499, // $74.99
        priceSemiAnnual: 13499, // $134.99
        priceYearly: 23999, // $239.99
        currency: "USD",
        features: ["Unlimited Projects", "Unlimited Pages", "200 AI Generations/month", "Custom Domain", "Analytics Dashboard", "ChatBot Builder", "Priority Support"],
        featuresAr: ["مشاريع غير محدودة", "صفحات غير محدودة", "200 توليد AI شهرياً", "نطاق مخصص", "لوحة تحليلات", "منشئ الشات بوت", "دعم أولوية"],
        maxProjects: -1, // unlimited
        maxPagesPerProject: -1,
        aiGenerationsPerMonth: 200,
        customDomain: true,
        whiteLabel: false,
        prioritySupport: true,
        analyticsAccess: true,
        chatbotBuilder: true,
        teamMembers: 3,
        sortOrder: 2,
      },
      {
        name: "Enterprise",
        nameAr: "مؤسسي",
        description: "For agencies and large teams",
        descriptionAr: "للوكالات والفرق الكبيرة",
        role: "enterprise",
        priceMonthly: 9999, // $99.99
        priceQuarterly: 24999,
        priceSemiAnnual: 44999,
        priceYearly: 79999,
        currency: "USD",
        features: ["Everything in Pro", "White Label Mode", "Team Management", "API Access", "Dedicated Support", "Custom Integrations"],
        featuresAr: ["كل ميزات Pro", "وضع White Label", "إدارة الفريق", "الوصول لـ API", "دعم مخصص", "تكاملات مخصصة"],
        maxProjects: -1,
        maxPagesPerProject: -1,
        aiGenerationsPerMonth: 1000,
        customDomain: true,
        whiteLabel: true,
        prioritySupport: true,
        analyticsAccess: true,
        chatbotBuilder: true,
        teamMembers: 10,
        sortOrder: 3,
      },
      {
        name: "Sovereign",
        nameAr: "سيادي",
        description: "Complete control for government and enterprises",
        descriptionAr: "تحكم كامل للحكومات والمؤسسات الكبرى",
        role: "sovereign",
        priceMonthly: 49999, // $499.99
        priceQuarterly: 124999,
        priceSemiAnnual: 224999,
        priceYearly: 399999,
        currency: "USD",
        features: ["Everything in Enterprise", "Sovereign Dashboard", "Emergency Stop Button", "Global Analytics", "Multi-tenant Management", "Custom Deployment"],
        featuresAr: ["كل ميزات Enterprise", "لوحة تحكم سيادية", "زر إيقاف طوارئ", "تحليلات عالمية", "إدارة متعددة المستأجرين", "نشر مخصص"],
        maxProjects: -1,
        maxPagesPerProject: -1,
        aiGenerationsPerMonth: -1, // unlimited
        customDomain: true,
        whiteLabel: true,
        prioritySupport: true,
        analyticsAccess: true,
        chatbotBuilder: true,
        teamMembers: -1, // unlimited
        sortOrder: 4,
      },
    ];

    for (const plan of plans) {
      await db.insert(subscriptionPlans).values(plan as any);
    }
  }

  private async initializeTemplates() {
    const existingTemplates = await db.select().from(templates);
    if (existingTemplates.length > 0) return;

    const sampleTemplates: InsertTemplate[] = [
      {
        name: "Modern Landing Page",
        nameAr: "صفحة هبوط عصرية",
        description: "A clean, modern landing page with hero section and features",
        descriptionAr: "صفحة هبوط نظيفة وعصرية مع قسم بطل وميزات",
        category: "Landing",
        industry: "All",
        htmlCode: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>موقعك الجديد</title>
</head>
<body>
  <div class="landing">
    <header class="header">
      <nav class="nav">
        <div class="logo">العلامة التجارية</div>
        <ul class="nav-links">
          <li><a href="#features">المميزات</a></li>
          <li><a href="#about">من نحن</a></li>
          <li><a href="#contact">تواصل</a></li>
        </ul>
      </nav>
    </header>
    <main class="hero">
      <h1>ابنِ شيئاً مذهلاً</h1>
      <p>أنشئ مواقع جميلة باستخدام منصتنا القوية</p>
      <button class="cta-button">ابدأ الآن</button>
    </main>
    <section class="features" id="features">
      <h2>المميزات</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>سريع</h3>
          <p>أداء فائق السرعة</p>
        </div>
        <div class="feature-card">
          <h3>آمن</h3>
          <p>حماية على مستوى المؤسسات</p>
        </div>
        <div class="feature-card">
          <h3>قابل للتوسع</h3>
          <p>نمو بلا حدود</p>
        </div>
      </div>
    </section>
  </div>
</body>
</html>`,
        cssCode: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Tajawal', 'Inter', sans-serif; }
.landing { min-height: 100vh; }
.header { padding: 1rem 2rem; background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.nav { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
.logo { font-size: 1.5rem; font-weight: bold; color: #6366f1; }
.nav-links { display: flex; list-style: none; gap: 2rem; }
.nav-links a { text-decoration: none; color: #374151; }
.hero { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; }
.hero h1 { font-size: 3.5rem; margin-bottom: 1rem; }
.hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
.cta-button { padding: 1rem 2.5rem; font-size: 1.1rem; background: white; color: #6366f1; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.features { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; text-align: center; }
.features h2 { font-size: 2.5rem; margin-bottom: 3rem; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
.feature-card { padding: 2rem; background: #f9fafb; border-radius: 12px; }
.feature-card h3 { color: #6366f1; margin-bottom: 0.5rem; }`,
        jsCode: `document.querySelector('.cta-button').addEventListener('click', () => {
  alert('مرحباً بك! لنبدأ.');
});`,
        thumbnail: null,
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "E-commerce Store",
        nameAr: "متجر إلكتروني",
        description: "Complete e-commerce template with product showcase",
        descriptionAr: "قالب متجر إلكتروني كامل مع عرض المنتجات",
        category: "E-commerce",
        industry: "Retail",
        htmlCode: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>متجرنا</title>
</head>
<body>
  <div class="store">
    <nav class="shop-nav">
      <div class="brand">المتجر</div>
      <div class="cart-icon">السلة (0)</div>
    </nav>
    <main class="products">
      <h1>منتجاتنا</h1>
      <div class="product-grid">
        <div class="product-card">
          <div class="product-image"></div>
          <h3>منتج رائع</h3>
          <p class="price">99.99$</p>
          <button class="add-btn">أضف للسلة</button>
        </div>
        <div class="product-card">
          <div class="product-image"></div>
          <h3>منتج مميز</h3>
          <p class="price">149.99$</p>
          <button class="add-btn">أضف للسلة</button>
        </div>
        <div class="product-card">
          <div class="product-image"></div>
          <h3>منتج فاخر</h3>
          <p class="price">199.99$</p>
          <button class="add-btn">أضف للسلة</button>
        </div>
      </div>
    </main>
  </div>
</body>
</html>`,
        cssCode: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Tajawal', sans-serif; background: #f8fafc; }
.shop-nav { display: flex; justify-content: space-between; padding: 1.5rem 2rem; background: white; border-bottom: 1px solid #e5e7eb; }
.brand { font-size: 1.5rem; font-weight: bold; color: #1f2937; }
.cart-icon { cursor: pointer; color: #6366f1; font-weight: 500; }
.products { max-width: 1200px; margin: 0 auto; padding: 3rem 2rem; }
.products h1 { text-align: center; margin-bottom: 3rem; color: #1f2937; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
.product-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.product-image { height: 200px; background: linear-gradient(135deg, #667eea, #764ba2); }
.product-card h3, .product-card .price, .product-card .add-btn { padding: 0 1.5rem; }
.product-card h3 { padding-top: 1.5rem; color: #1f2937; }
.price { color: #6366f1; font-size: 1.25rem; font-weight: bold; margin: 0.5rem 0; padding: 0 1.5rem; }
.add-btn { width: calc(100% - 3rem); margin: 1rem 1.5rem 1.5rem; padding: 0.75rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }`,
        jsCode: `let cartCount = 0;
document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    cartCount++;
    document.querySelector('.cart-icon').textContent = 'السلة (' + cartCount + ')';
  });
});`,
        thumbnail: null,
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "Business Services",
        nameAr: "خدمات الشركات",
        description: "Professional services website template",
        descriptionAr: "قالب موقع خدمات احترافي",
        category: "Services",
        industry: "Business",
        htmlCode: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>خدماتنا المتميزة</title>
</head>
<body>
  <header class="header">
    <nav class="nav">
      <div class="logo">شركتنا</div>
      <ul class="nav-links">
        <li><a href="#services">خدماتنا</a></li>
        <li><a href="#about">من نحن</a></li>
        <li><a href="#contact">تواصل معنا</a></li>
      </ul>
    </nav>
  </header>
  <section class="hero">
    <h1>حلول أعمال متكاملة</h1>
    <p>نقدم خدمات استشارية وتقنية عالية الجودة</p>
    <button class="cta">احجز استشارة مجانية</button>
  </section>
  <section class="services" id="services">
    <h2>خدماتنا</h2>
    <div class="services-grid">
      <div class="service-card">
        <div class="icon">📊</div>
        <h3>استشارات الأعمال</h3>
        <p>تحليل وتطوير استراتيجيات النمو</p>
      </div>
      <div class="service-card">
        <div class="icon">💻</div>
        <h3>حلول تقنية</h3>
        <p>تطوير أنظمة مخصصة لأعمالك</p>
      </div>
      <div class="service-card">
        <div class="icon">📈</div>
        <h3>التسويق الرقمي</h3>
        <p>زيادة وصولك وتحويلاتك</p>
      </div>
    </div>
  </section>
</body>
</html>`,
        cssCode: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Tajawal', sans-serif; }
.header { background: #1f2937; padding: 1rem 2rem; }
.nav { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
.logo { color: white; font-size: 1.5rem; font-weight: bold; }
.nav-links { display: flex; list-style: none; gap: 2rem; }
.nav-links a { color: #d1d5db; text-decoration: none; }
.hero { background: linear-gradient(135deg, #1f2937, #374151); color: white; text-align: center; padding: 6rem 2rem; }
.hero h1 { font-size: 3rem; margin-bottom: 1rem; }
.hero p { font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; }
.cta { padding: 1rem 2.5rem; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; font-weight: 600; }
.services { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; text-align: center; }
.services h2 { font-size: 2.5rem; margin-bottom: 3rem; color: #1f2937; }
.services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
.service-card { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.icon { font-size: 3rem; margin-bottom: 1rem; }
.service-card h3 { color: #1f2937; margin-bottom: 0.5rem; }
.service-card p { color: #6b7280; }`,
        jsCode: `document.querySelector('.cta').addEventListener('click', () => {
  alert('شكراً لاهتمامك! سنتواصل معك قريباً.');
});`,
        thumbnail: null,
        isPremium: false,
        requiredPlan: "free",
      },
    ];

    for (const template of sampleTemplates) {
      await db.insert(templates).values(template);
    }
  }

  private async initializeComponents() {
    const existingComponents = await db.select().from(components);
    if (existingComponents.length > 0) return;

    const sampleComponents: InsertComponent[] = [
      {
        name: "Hero Section",
        nameAr: "قسم البطل",
        category: "Sections",
        industry: "All",
        htmlCode: `<section class="hero-section">
  <div class="hero-content">
    <h1>مرحباً بك في منصتنا</h1>
    <p>ابنِ موقعك الإلكتروني باستخدام الذكاء الاصطناعي</p>
    <div class="hero-buttons">
      <button class="btn-primary">ابدأ الآن</button>
      <button class="btn-secondary">اعرف المزيد</button>
    </div>
  </div>
</section>`,
        cssCode: `.hero-section { min-height: 80vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 2rem; }
.hero-content h1 { font-size: 3.5rem; margin-bottom: 1rem; }
.hero-content p { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; }
.hero-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn-primary { padding: 1rem 2rem; background: white; color: #6366f1; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary { padding: 1rem 2rem; background: transparent; color: white; border: 2px solid white; border-radius: 8px; font-weight: 600; cursor: pointer; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "Features Grid",
        nameAr: "شبكة المميزات",
        category: "Sections",
        industry: "All",
        htmlCode: `<section class="features-section">
  <h2>لماذا تختارنا؟</h2>
  <div class="features-grid">
    <div class="feature-item">
      <div class="feature-icon">⚡</div>
      <h3>سرعة فائقة</h3>
      <p>أداء محسّن وتحميل سريع</p>
    </div>
    <div class="feature-item">
      <div class="feature-icon">🔒</div>
      <h3>أمان متقدم</h3>
      <p>حماية على مستوى المؤسسات</p>
    </div>
    <div class="feature-item">
      <div class="feature-icon">🎨</div>
      <h3>تصميم مرن</h3>
      <p>تخصيص كامل حسب احتياجاتك</p>
    </div>
  </div>
</section>`,
        cssCode: `.features-section { padding: 5rem 2rem; max-width: 1200px; margin: 0 auto; text-align: center; }
.features-section h2 { font-size: 2.5rem; margin-bottom: 3rem; color: #1f2937; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
.feature-item { padding: 2rem; background: #f9fafb; border-radius: 12px; }
.feature-icon { font-size: 3rem; margin-bottom: 1rem; }
.feature-item h3 { color: #6366f1; margin-bottom: 0.5rem; }
.feature-item p { color: #6b7280; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "Pricing Table",
        nameAr: "جدول الأسعار",
        category: "Sections",
        industry: "All",
        htmlCode: `<section class="pricing-section">
  <h2>اختر خطتك</h2>
  <div class="pricing-grid">
    <div class="pricing-card">
      <h3>أساسي</h3>
      <p class="price">$9.99<span>/شهرياً</span></p>
      <ul class="features-list">
        <li>5 مشاريع</li>
        <li>50 توليد AI</li>
        <li>دعم البريد</li>
      </ul>
      <button class="pricing-btn">اشترك الآن</button>
    </div>
    <div class="pricing-card featured">
      <h3>احترافي</h3>
      <p class="price">$29.99<span>/شهرياً</span></p>
      <ul class="features-list">
        <li>مشاريع غير محدودة</li>
        <li>200 توليد AI</li>
        <li>دعم أولوية</li>
        <li>نطاق مخصص</li>
      </ul>
      <button class="pricing-btn">اشترك الآن</button>
    </div>
    <div class="pricing-card">
      <h3>مؤسسي</h3>
      <p class="price">$99.99<span>/شهرياً</span></p>
      <ul class="features-list">
        <li>كل ميزات Pro</li>
        <li>White Label</li>
        <li>API Access</li>
      </ul>
      <button class="pricing-btn">اشترك الآن</button>
    </div>
  </div>
</section>`,
        cssCode: `.pricing-section { padding: 5rem 2rem; background: #f9fafb; text-align: center; }
.pricing-section h2 { font-size: 2.5rem; margin-bottom: 3rem; }
.pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; max-width: 1000px; margin: 0 auto; }
.pricing-card { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.pricing-card.featured { border: 2px solid #6366f1; transform: scale(1.05); }
.pricing-card h3 { color: #1f2937; margin-bottom: 1rem; }
.price { font-size: 2.5rem; font-weight: bold; color: #6366f1; }
.price span { font-size: 1rem; color: #6b7280; }
.features-list { list-style: none; padding: 1.5rem 0; text-align: right; }
.features-list li { padding: 0.5rem 0; color: #374151; }
.features-list li::before { content: "✓ "; color: #10b981; }
.pricing-btn { width: 100%; padding: 1rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "Contact Form",
        nameAr: "نموذج التواصل",
        category: "Forms",
        industry: "All",
        htmlCode: `<section class="contact-section">
  <h2>تواصل معنا</h2>
  <form class="contact-form">
    <div class="form-group">
      <label for="name">الاسم</label>
      <input type="text" id="name" placeholder="اسمك الكامل" required />
    </div>
    <div class="form-group">
      <label for="email">البريد الإلكتروني</label>
      <input type="email" id="email" placeholder="example@email.com" required />
    </div>
    <div class="form-group">
      <label for="message">الرسالة</label>
      <textarea id="message" rows="4" placeholder="رسالتك..." required></textarea>
    </div>
    <button type="submit" class="submit-btn">إرسال</button>
  </form>
</section>`,
        cssCode: `.contact-section { padding: 5rem 2rem; max-width: 600px; margin: 0 auto; }
.contact-section h2 { text-align: center; font-size: 2.5rem; margin-bottom: 2rem; color: #1f2937; }
.contact-form { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #374151; }
.form-group input, .form-group textarea { width: 100%; padding: 0.875rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
.submit-btn { width: 100%; padding: 1rem; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }`,
        jsCode: `document.querySelector('.contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('تم إرسال رسالتك بنجاح!');
});`,
        thumbnail: null,
        framework: "vanilla",
        isPremium: false,
        requiredPlan: "free",
      },
      {
        name: "Footer",
        nameAr: "تذييل الصفحة",
        category: "Sections",
        industry: "All",
        htmlCode: `<footer class="site-footer">
  <div class="footer-content">
    <div class="footer-section">
      <h4>عن الشركة</h4>
      <p>نحن نقدم حلولاً مبتكرة لبناء مواقع إلكترونية احترافية باستخدام الذكاء الاصطناعي.</p>
    </div>
    <div class="footer-section">
      <h4>روابط سريعة</h4>
      <ul>
        <li><a href="#">الرئيسية</a></li>
        <li><a href="#">الخدمات</a></li>
        <li><a href="#">من نحن</a></li>
        <li><a href="#">تواصل معنا</a></li>
      </ul>
    </div>
    <div class="footer-section">
      <h4>تواصل معنا</h4>
      <ul>
        <li>info@example.com</li>
        <li>+966 50 000 0000</li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2025 جميع الحقوق محفوظة</p>
  </div>
</footer>`,
        cssCode: `.site-footer { background: #1f2937; color: white; padding: 4rem 2rem 1rem; }
.footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto 3rem; }
.footer-section h4 { margin-bottom: 1.5rem; font-size: 1.1rem; color: white; }
.footer-section p { color: #9ca3af; line-height: 1.7; }
.footer-section ul { list-style: none; padding: 0; }
.footer-section li { margin-bottom: 0.75rem; color: #9ca3af; }
.footer-section a { color: #9ca3af; text-decoration: none; }
.footer-section a:hover { color: white; }
.footer-bottom { text-align: center; padding-top: 2rem; border-top: 1px solid #374151; color: #9ca3af; }`,
        jsCode: "",
        thumbnail: null,
        framework: "vanilla",
        isPremium: false,
        requiredPlan: "free",
      },
    ];

    for (const component of sampleComponents) {
      await db.insert(components).values(component);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Subscription Plans methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true)).orderBy(asc(subscriptionPlans.sortOrder));
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan || undefined;
  }

  async getSubscriptionPlanByRole(role: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.role, role));
    return plan || undefined;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [created] = await db.insert(subscriptionPlans).values(plan as any).returning();
    return created;
  }

  // User Subscriptions methods
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt));
    return subscription || undefined;
  }

  async createUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const [created] = await db.insert(userSubscriptions).values(subscription).returning();
    return created;
  }

  async updateUserSubscription(id: string, updates: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const [subscription] = await db
      .update(userSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userSubscriptions.id, id))
      .returning();
    return subscription || undefined;
  }

  // Payments methods
  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  async updatePayment(id: string, updates: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment || undefined;
  }

  // AI Usage methods
  async getAiUsage(userId: string, month: string): Promise<AiUsage | undefined> {
    const [usage] = await db
      .select()
      .from(aiUsage)
      .where(and(eq(aiUsage.userId, userId), eq(aiUsage.month, month)));
    return usage || undefined;
  }

  async createAiUsage(usage: InsertAiUsage): Promise<AiUsage> {
    const [created] = await db.insert(aiUsage).values(usage).returning();
    return created;
  }

  async updateAiUsage(id: string, updates: Partial<InsertAiUsage>): Promise<AiUsage | undefined> {
    const [usage] = await db
      .update(aiUsage)
      .set(updates)
      .where(eq(aiUsage.id, id))
      .returning();
    return usage || undefined;
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.updatedAt));
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Message methods
  async getMessagesByProject(projectId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.projectId, projectId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  // Template methods
  async getTemplates(): Promise<Template[]> {
    return db.select().from(templates);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db.insert(templates).values(insertTemplate).returning();
    return template;
  }

  // Project Versions methods
  async getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
    return db
      .select()
      .from(projectVersions)
      .where(eq(projectVersions.projectId, projectId))
      .orderBy(desc(projectVersions.createdAt));
  }

  async getProjectVersion(id: string): Promise<ProjectVersion | undefined> {
    const [version] = await db.select().from(projectVersions).where(eq(projectVersions.id, id));
    return version || undefined;
  }

  async createProjectVersion(insertVersion: InsertProjectVersion): Promise<ProjectVersion> {
    const [version] = await db.insert(projectVersions).values(insertVersion).returning();
    return version;
  }

  // Share Links methods
  async getShareLink(shareCode: string): Promise<ShareLink | undefined> {
    const [link] = await db.select().from(shareLinks).where(eq(shareLinks.shareCode, shareCode));
    return link || undefined;
  }

  async getShareLinksByProject(projectId: string): Promise<ShareLink[]> {
    return db.select().from(shareLinks).where(eq(shareLinks.projectId, projectId));
  }

  async createShareLink(insertLink: InsertShareLink): Promise<ShareLink> {
    const [link] = await db.insert(shareLinks).values(insertLink).returning();
    return link;
  }

  async deactivateShareLink(id: string): Promise<boolean> {
    const result = await db
      .update(shareLinks)
      .set({ isActive: "false" })
      .where(eq(shareLinks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Components methods
  async getComponents(): Promise<Component[]> {
    return db.select().from(components);
  }

  async getComponentsByCategory(category: string): Promise<Component[]> {
    return db.select().from(components).where(eq(components.category, category));
  }

  async getComponent(id: string): Promise<Component | undefined> {
    const [component] = await db.select().from(components).where(eq(components.id, id));
    return component || undefined;
  }

  async createComponent(insertComponent: InsertComponent): Promise<Component> {
    const [component] = await db.insert(components).values(insertComponent).returning();
    return component;
  }
}

export const storage = new DatabaseStorage();
