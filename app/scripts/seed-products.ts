import { getUncachableStripeClient } from '../server/stripeClient';
import { storage } from '../server/storage';

const SUBSCRIPTION_PLANS = [
  {
    name: 'Free',
    nameAr: 'مجاني',
    description: 'For individuals getting started',
    descriptionAr: 'للأفراد المبتدئين',
    role: 'free',
    priceMonthly: 0,
    priceQuarterly: 0,
    priceSemiAnnual: 0,
    priceYearly: 0,
    currency: 'USD',
    features: ['1 Project', '5 Pages per Project', '10 AI Generations/month', 'Community Support'],
    featuresAr: ['مشروع واحد', '5 صفحات لكل مشروع', '10 توليدات AI شهرياً', 'دعم المجتمع'],
    maxProjects: 1,
    maxPagesPerProject: 5,
    aiGenerationsPerMonth: 10,
    customDomain: false,
    whiteLabel: false,
    prioritySupport: false,
    analyticsAccess: false,
    chatbotBuilder: false,
    teamMembers: 1,
  },
  {
    name: 'Basic',
    nameAr: 'أساسي',
    description: 'For small businesses',
    descriptionAr: 'للشركات الصغيرة',
    role: 'basic',
    priceMonthly: 1999, // $19.99
    priceQuarterly: 4997, // $49.97
    priceSemiAnnual: 9594, // $95.94
    priceYearly: 17990, // $179.90
    currency: 'USD',
    features: ['3 Projects', '15 Pages per Project', '50 AI Generations/month', 'Email Support', '2 Custom Domains'],
    featuresAr: ['3 مشاريع', '15 صفحة لكل مشروع', '50 توليد AI شهرياً', 'دعم البريد الإلكتروني', 'نطاقين مخصصين'],
    maxProjects: 3,
    maxPagesPerProject: 15,
    aiGenerationsPerMonth: 50,
    customDomain: true,
    whiteLabel: false,
    prioritySupport: false,
    analyticsAccess: true,
    chatbotBuilder: false,
    teamMembers: 2,
  },
  {
    name: 'Pro',
    nameAr: 'احترافي',
    description: 'For growing businesses',
    descriptionAr: 'للشركات النامية',
    role: 'pro',
    priceMonthly: 4999, // $49.99
    priceQuarterly: 12497, // $124.97
    priceSemiAnnual: 23994, // $239.94
    priceYearly: 44990, // $449.90
    currency: 'USD',
    features: ['10 Projects', 'Unlimited Pages', '200 AI Generations/month', 'Priority Support', '5 Custom Domains', 'Analytics'],
    featuresAr: ['10 مشاريع', 'صفحات غير محدودة', '200 توليد AI شهرياً', 'دعم أولوية', '5 نطاقات مخصصة', 'تحليلات'],
    maxProjects: 10,
    maxPagesPerProject: 999,
    aiGenerationsPerMonth: 200,
    customDomain: true,
    whiteLabel: false,
    prioritySupport: true,
    analyticsAccess: true,
    chatbotBuilder: true,
    teamMembers: 5,
  },
  {
    name: 'Enterprise',
    nameAr: 'مؤسسات',
    description: 'For large organizations',
    descriptionAr: 'للمؤسسات الكبيرة',
    role: 'enterprise',
    priceMonthly: 14999, // $149.99
    priceQuarterly: 37497, // $374.97
    priceSemiAnnual: 71994, // $719.94
    priceYearly: 134990, // $1349.90
    currency: 'USD',
    features: ['Unlimited Projects', 'Unlimited Pages', 'Unlimited AI Generations', '24/7 Support', '20 Custom Domains', 'White Label', 'Team Collaboration'],
    featuresAr: ['مشاريع غير محدودة', 'صفحات غير محدودة', 'توليدات AI غير محدودة', 'دعم على مدار الساعة', '20 نطاق مخصص', 'العلامة البيضاء', 'تعاون الفريق'],
    maxProjects: 999,
    maxPagesPerProject: 999,
    aiGenerationsPerMonth: 9999,
    customDomain: true,
    whiteLabel: true,
    prioritySupport: true,
    analyticsAccess: true,
    chatbotBuilder: true,
    teamMembers: 50,
  },
  {
    name: 'Sovereign',
    nameAr: 'سيادي',
    description: 'Full platform control',
    descriptionAr: 'تحكم كامل بالمنصة',
    role: 'sovereign',
    priceMonthly: 49999, // $499.99
    priceQuarterly: 124997, // $1249.97
    priceSemiAnnual: 239994, // $2399.94
    priceYearly: 449990, // $4499.90
    currency: 'USD',
    features: ['Everything in Enterprise', 'Dedicated Infrastructure', 'Custom AI Training', 'SLA Guarantee', '50 Custom Domains', 'API Access', 'Compliance Tools'],
    featuresAr: ['كل ميزات المؤسسات', 'بنية تحتية مخصصة', 'تدريب AI مخصص', 'ضمان SLA', '50 نطاق مخصص', 'وصول API', 'أدوات الامتثال'],
    maxProjects: 9999,
    maxPagesPerProject: 9999,
    aiGenerationsPerMonth: 99999,
    customDomain: true,
    whiteLabel: true,
    prioritySupport: true,
    analyticsAccess: true,
    chatbotBuilder: true,
    teamMembers: 999,
  },
];

async function seedSubscriptionPlans() {
  console.log('[Seed] Creating subscription plans in database...');
  
  for (const plan of SUBSCRIPTION_PLANS) {
    const existing = await storage.getSubscriptionPlanByRole(plan.role);
    if (existing) {
      console.log(`[Seed] Plan ${plan.name} already exists, skipping...`);
      continue;
    }
    
    await storage.createSubscriptionPlan(plan);
    console.log(`[Seed] Created plan: ${plan.name}`);
  }
  
  console.log('[Seed] Subscription plans created successfully!');
}

async function seedStripeProducts() {
  console.log('[Seed] Creating products in Stripe...');
  
  try {
    const stripe = await getUncachableStripeClient();
    
    for (const plan of SUBSCRIPTION_PLANS) {
      if (plan.priceMonthly === 0) {
        console.log(`[Seed] Skipping free plan for Stripe...`);
        continue;
      }
      
      const existingProducts = await stripe.products.search({
        query: `name:'${plan.name}'`,
      });
      
      if (existingProducts.data.length > 0) {
        console.log(`[Seed] Stripe product ${plan.name} already exists, skipping...`);
        continue;
      }
      
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          role: plan.role,
          nameAr: plan.nameAr,
        },
      });
      
      if (plan.priceMonthly > 0) {
        await stripe.prices.create({
          product: product.id,
          unit_amount: plan.priceMonthly,
          currency: plan.currency.toLowerCase(),
          recurring: { interval: 'month' },
          metadata: { billingCycle: 'monthly' },
        });
      }
      
      if (plan.priceYearly > 0) {
        await stripe.prices.create({
          product: product.id,
          unit_amount: plan.priceYearly,
          currency: plan.currency.toLowerCase(),
          recurring: { interval: 'year' },
          metadata: { billingCycle: 'yearly' },
        });
      }
      
      console.log(`[Seed] Created Stripe product: ${plan.name}`);
    }
    
    console.log('[Seed] Stripe products created successfully!');
  } catch (error: any) {
    console.error('[Seed] Error creating Stripe products:', error.message);
    console.log('[Seed] Continuing with database plans only...');
  }
}

async function main() {
  console.log('[Seed] Starting subscription seeding...');
  
  await seedSubscriptionPlans();
  await seedStripeProducts();
  
  console.log('[Seed] Seeding complete!');
}

main().catch(console.error);
