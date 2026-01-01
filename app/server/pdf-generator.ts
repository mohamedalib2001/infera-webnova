import PDFDocument from 'pdfkit';

export interface PDFPlatformData {
  id: string;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  overview: string;
  overviewAr: string;
  keyFeatures: string[];
  keyFeaturesAr: string[];
  targetMarket: string;
  targetMarketAr: string;
  competitiveAdvantage: string;
  competitiveAdvantageAr: string;
  demoScenes: { title: string; titleAr: string; description: string; descriptionAr: string; duration: string }[];
}

interface PDFOptions {
  language: 'en' | 'ar';
  type: 'pitch' | 'executive-summary' | 'investor-narrative' | 'demo-storyboard' | 'master-group';
  platform?: PDFPlatformData;
  allPlatforms?: PDFPlatformData[];
}

export function generatePitchDeckPDF(options: PDFOptions): PDFDocument {
  const isLandscape = options.type === 'pitch' || options.type === 'master-group';
  
  const doc = new PDFDocument({
    size: 'A4',
    layout: isLandscape ? 'landscape' : 'portrait',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: 'INFERA Pitch Deck',
      Author: 'Mohamed Ali Abdalla Mohamed',
      Subject: 'Investor Pitch Deck',
      Creator: 'INFERA WebNova',
    }
  });

  const isArabic = options.language === 'ar';

  if (options.type === 'master-group' && options.allPlatforms) {
    generateMasterGroupPitch(doc, isArabic, options.allPlatforms);
  } else if (options.type === 'investor-narrative') {
    generateInvestorNarrative(doc, isArabic, options.allPlatforms?.length || 21);
  } else if (options.platform) {
    if (options.type === 'pitch') {
      generateSinglePitchDeck(doc, options.platform, isArabic);
    } else if (options.type === 'executive-summary') {
      generateExecutiveSummary(doc, options.platform, isArabic);
    } else if (options.type === 'demo-storyboard') {
      generateDemoStoryboard(doc, options.platform, isArabic);
    }
  }

  return doc;
}

function generateSinglePitchDeck(doc: PDFDocument, platform: PDFPlatformData, isArabic: boolean) {
  // Title Slide
  doc.fontSize(48)
     .fillColor('#1e1b4b')
     .text(isArabic ? platform.nameAr : platform.name, { align: 'center' })
     .moveDown(0.5);
  
  doc.fontSize(24)
     .fillColor('#6366f1')
     .text(isArabic ? platform.taglineAr : platform.tagline, { align: 'center' })
     .moveDown(2);

  doc.fontSize(14)
     .fillColor('#64748b')
     .text(isArabic ? 'عرض المستثمرين' : 'Investor Pitch Deck', { align: 'center' });

  // Vision Slide
  doc.addPage();
  addSlideHeader(doc, isArabic ? 'الرؤية' : 'Vision');
  doc.fontSize(18)
     .fillColor('#1e293b')
     .text(isArabic ? platform.overviewAr : platform.overview, 50, 150, { align: 'center', width: doc.page.width - 100 });

  // Problem Slide
  doc.addPage();
  addSlideHeader(doc, isArabic ? 'المشكلة' : 'Problem');
  doc.fontSize(16)
     .fillColor('#1e293b')
     .text(isArabic ? 'التحديات الرئيسية في السوق الحالي:' : 'Key challenges in the current market:', 50, 150);
  
  doc.list([
    isArabic ? 'حلول مجزأة وغير متكاملة' : 'Fragmented and non-integrated solutions',
    isArabic ? 'نقص في الذكاء والتنبؤ' : 'Lack of intelligence and prediction',
    isArabic ? 'أمان ضعيف وحوكمة محدودة' : 'Weak security and limited governance',
    isArabic ? 'صعوبة التوسع والإدارة' : 'Difficult to scale and manage',
  ], 70, 200);

  // Solution Slide
  doc.addPage();
  addSlideHeader(doc, isArabic ? 'الحل' : 'Solution');
  doc.fontSize(18)
     .fillColor('#1e293b')
     .text(isArabic ? platform.taglineAr : platform.tagline, 50, 150, { align: 'center', width: doc.page.width - 100 })
     .moveDown();

  doc.fontSize(14);
  const features = isArabic ? platform.keyFeaturesAr : platform.keyFeatures;
  doc.list(features, 100, 220);

  // Unique Value Slide
  doc.addPage();
  addSlideHeader(doc, isArabic ? 'القيمة الفريدة' : 'Unique Value');
  doc.fontSize(18)
     .fillColor('#1e293b')
     .text(isArabic ? platform.competitiveAdvantageAr : platform.competitiveAdvantage, 50, 150, { align: 'center', width: doc.page.width - 100 });

  // Target Market Slide
  doc.addPage();
  addSlideHeader(doc, isArabic ? 'السوق المستهدف' : 'Target Market');
  doc.fontSize(18)
     .fillColor('#1e293b')
     .text(isArabic ? platform.targetMarketAr : platform.targetMarket, 50, 150, { align: 'center', width: doc.page.width - 100 });

  // Strategic Impact Slide
  doc.addPage();
  addSlideHeader(doc, isArabic ? 'الأثر الاستراتيجي' : 'Strategic Impact');
  doc.fontSize(16)
     .fillColor('#1e293b')
     .text(isArabic ? 'التأثير على الأعمال:' : 'Business Impact:', 50, 150);
  
  doc.list([
    isArabic ? 'كفاءة تشغيلية محسّنة' : 'Enhanced operational efficiency',
    isArabic ? 'تخفيض التكاليف والمخاطر' : 'Reduced costs and risks',
    isArabic ? 'قرارات أذكى وأسرع' : 'Smarter and faster decisions',
    isArabic ? 'سيادة كاملة على البيانات والعمليات' : 'Complete sovereignty over data and operations',
  ], 70, 200);

  // Contact Slide
  doc.addPage();
  addSlideHeader(doc, isArabic ? 'تواصل معنا' : 'Contact Us');
  doc.fontSize(16)
     .fillColor('#1e293b')
     .text('Mohamed Ali Abdalla Mohamed', 50, 160, { align: 'center', width: doc.page.width - 100 })
     .moveDown(0.3)
     .text('Founder & CEO - Infra Engine', { align: 'center' })
     .moveDown()
     .fillColor('#6366f1')
     .text('mohamed.ali.b2001@gmail.com', { align: 'center' })
     .moveDown(0.3)
     .text('+201026363528 | +966544803384', { align: 'center' });

  doc.end();
}

function generateExecutiveSummary(doc: PDFDocument, platform: PDFPlatformData, isArabic: boolean) {
  doc.fontSize(36)
     .fillColor('#1e1b4b')
     .text(isArabic ? 'الملخص التنفيذي' : 'Executive Summary', { align: 'center' })
     .moveDown(0.5);

  doc.fontSize(28)
     .fillColor('#6366f1')
     .text(isArabic ? platform.nameAr : platform.name, { align: 'center' })
     .moveDown(2);

  // Overview
  doc.fontSize(18)
     .fillColor('#1e1b4b')
     .text(isArabic ? 'نظرة عامة' : 'Overview')
     .moveDown(0.5);
  doc.fontSize(12)
     .fillColor('#475569')
     .text(isArabic ? platform.overviewAr : platform.overview)
     .moveDown();

  // Key Features
  doc.fontSize(18)
     .fillColor('#1e1b4b')
     .text(isArabic ? 'الميزات الرئيسية' : 'Key Features')
     .moveDown(0.5);
  doc.fontSize(12)
     .fillColor('#475569');
  const features = isArabic ? platform.keyFeaturesAr : platform.keyFeatures;
  doc.list(features, { bulletRadius: 2 }).moveDown();

  // Target Market
  doc.fontSize(18)
     .fillColor('#1e1b4b')
     .text(isArabic ? 'السوق المستهدف' : 'Target Market')
     .moveDown(0.5);
  doc.fontSize(12)
     .fillColor('#475569')
     .text(isArabic ? platform.targetMarketAr : platform.targetMarket)
     .moveDown();

  // Competitive Advantage
  doc.fontSize(18)
     .fillColor('#1e1b4b')
     .text(isArabic ? 'الميزة التنافسية' : 'Competitive Advantage')
     .moveDown(0.5);
  doc.fontSize(12)
     .fillColor('#475569')
     .text(isArabic ? platform.competitiveAdvantageAr : platform.competitiveAdvantage);

  doc.end();
}

function generateDemoStoryboard(doc: PDFDocument, platform: PDFPlatformData, isArabic: boolean) {
  doc.fontSize(36)
     .fillColor('#1e1b4b')
     .text(isArabic ? 'سيناريو العرض التوضيحي' : 'Demo Storyboard', { align: 'center' })
     .moveDown(0.5);

  doc.fontSize(28)
     .fillColor('#6366f1')
     .text(isArabic ? platform.nameAr : platform.name, { align: 'center' })
     .moveDown(2);

  platform.demoScenes.forEach((scene, index) => {
    doc.fontSize(20)
       .fillColor('#1e1b4b')
       .text(`${isArabic ? 'المشهد' : 'Scene'} ${index + 1}: ${isArabic ? scene.titleAr : scene.title}`)
       .moveDown(0.3);
    
    doc.fontSize(12)
       .fillColor('#475569')
       .text(isArabic ? scene.descriptionAr : scene.description)
       .moveDown(0.2);
    
    doc.fontSize(10)
       .fillColor('#94a3b8')
       .text(`${isArabic ? 'المدة:' : 'Duration:'} ${scene.duration}`)
       .moveDown(1.5);
  });

  doc.end();
}

function generateMasterGroupPitch(doc: PDFDocument, isArabic: boolean, platforms: PDFPlatformData[]) {
  // Title Page
  doc.fontSize(48)
     .fillColor('#1e1b4b')
     .text('INFERA Group', { align: 'center' })
     .moveDown(0.3);

  doc.fontSize(24)
     .fillColor('#6366f1')
     .text(isArabic ? 'منظومة المنصات الرقمية السيادية' : 'Sovereign Digital Platform Ecosystem', { align: 'center' })
     .moveDown(2);

  doc.fontSize(16)
     .fillColor('#64748b')
     .text(isArabic ? 'عرض المستثمرين الشامل' : 'Comprehensive Investor Pitch', { align: 'center' });

  // Ecosystem Overview
  doc.addPage();
  addSlideHeader(doc, isArabic ? 'نظرة عامة على المنظومة' : 'Ecosystem Overview');
  
  doc.fontSize(14)
     .fillColor('#1e293b')
     .text(isArabic ? `منظومة INFERA تضم ${platforms.length}+ منصة سيادية متكاملة` : `INFERA Ecosystem includes ${platforms.length}+ integrated sovereign platforms`, 50, 150, { align: 'center', width: doc.page.width - 100 });

  let y = 200;
  platforms.slice(0, 12).forEach((platform, i) => {
    if (i % 3 === 0 && i > 0) y += 30;
    doc.fontSize(10)
       .fillColor('#475569')
       .text(`• ${isArabic ? platform.nameAr : platform.name}`, 50 + (i % 3) * 250, y);
  });

  // Platform Categories
  doc.addPage();
  addSlideHeader(doc, isArabic ? 'فئات المنصات' : 'Platform Categories');
  
  const categories = [
    { name: isArabic ? 'المالية والحوكمة' : 'Finance & Governance', count: 4 },
    { name: isArabic ? 'الموارد البشرية والمواهب' : 'HR & Talent', count: 4 },
    { name: isArabic ? 'العمليات والتحكم' : 'Operations & Control', count: 3 },
    { name: isArabic ? 'الأمن السيبراني' : 'Cybersecurity', count: 2 },
    { name: isArabic ? 'التعليم والتدريب' : 'Education & Training', count: 3 },
    { name: isArabic ? 'تطوير التطبيقات' : 'App Development', count: 2 },
  ];

  y = 180;
  categories.forEach((cat, i) => {
    doc.fontSize(14)
       .fillColor('#1e293b')
       .text(`${cat.name}: ${cat.count} ${isArabic ? 'منصات' : 'platforms'}`, 100, y + i * 40);
  });

  // Strategic Value
  doc.addPage();
  addSlideHeader(doc, isArabic ? 'القيمة الاستراتيجية' : 'Strategic Value');
  
  doc.fontSize(14)
     .fillColor('#1e293b');
  
  doc.list([
    isArabic ? 'منظومة متكاملة بدون حاجة لأدوات خارجية' : 'Complete ecosystem without external tools',
    isArabic ? 'سيادة كاملة على البيانات والعمليات' : 'Complete sovereignty over data and operations',
    isArabic ? 'ذكاء اصطناعي متقدم في كل منصة' : 'Advanced AI in every platform',
    isArabic ? 'قابلية توسع غير محدودة' : 'Unlimited scalability',
    isArabic ? 'امتثال شامل للمعايير العالمية' : 'Comprehensive global compliance',
  ], 100, 180);

  // Contact
  doc.addPage();
  addSlideHeader(doc, isArabic ? 'تواصل معنا' : 'Contact Us');
  doc.fontSize(16)
     .fillColor('#1e293b')
     .text('Mohamed Ali Abdalla Mohamed', 50, 160, { align: 'center', width: doc.page.width - 100 })
     .moveDown(0.3)
     .text('Founder & CEO - Infra Engine', { align: 'center' })
     .moveDown()
     .fillColor('#6366f1')
     .text('mohamed.ali.b2001@gmail.com', { align: 'center' });

  doc.end();
}

function generateInvestorNarrative(doc: PDFDocument, isArabic: boolean, platformCount: number) {
  // Title
  doc.fontSize(42)
     .fillColor('#1e1b4b')
     .text(isArabic ? 'السرد الاستثماري' : 'Investor Narrative', { align: 'center' })
     .moveDown(0.3);

  doc.fontSize(24)
     .fillColor('#6366f1')
     .text('INFERA Group', { align: 'center' })
     .moveDown(2);

  // The Story
  doc.fontSize(18)
     .fillColor('#1e1b4b')
     .text(isArabic ? 'القصة' : 'The Story')
     .moveDown(0.5);
  
  doc.fontSize(12)
     .fillColor('#475569')
     .text(isArabic 
       ? 'في عالم يتسارع فيه التحول الرقمي، تواجه المؤسسات تحدياً كبيراً: كيف تبني منصات رقمية سيادية دون الاعتماد على حلول مجزأة وغير آمنة؟ INFERA تجيب على هذا السؤال من خلال منظومة متكاملة من المنصات الذكية التي تعمل بالذكاء الاصطناعي.'
       : 'In a world of accelerating digital transformation, organizations face a major challenge: how to build sovereign digital platforms without relying on fragmented and insecure solutions? INFERA answers this question through an integrated ecosystem of AI-powered intelligent platforms.')
     .moveDown();

  // Market Opportunity
  doc.addPage();
  doc.fontSize(18)
     .fillColor('#1e1b4b')
     .text(isArabic ? 'فرصة السوق' : 'Market Opportunity')
     .moveDown(0.5);

  doc.fontSize(12)
     .fillColor('#475569');
  doc.list([
    isArabic ? 'سوق المنصات الرقمية العالمي: $500+ مليار' : 'Global digital platform market: $500B+',
    isArabic ? 'نمو سنوي 25%+' : 'Annual growth 25%+',
    isArabic ? 'الطلب على السيادة الرقمية في ازدياد' : 'Growing demand for digital sovereignty',
    isArabic ? 'الشركات تبحث عن حلول متكاملة' : 'Companies seeking integrated solutions',
  ]).moveDown();

  // Competitive Moat
  doc.fontSize(18)
     .fillColor('#1e1b4b')
     .text(isArabic ? 'الحصانة التنافسية' : 'Competitive Moat')
     .moveDown(0.5);

  doc.fontSize(12)
     .fillColor('#475569');
  doc.list([
    isArabic ? `تكامل فريد بين ${platformCount}+ منصة` : `Unique integration across ${platformCount}+ platforms`,
    isArabic ? 'ذكاء اصطناعي أصلي في كل منصة' : 'Native AI in every platform',
    isArabic ? 'معمارية سيادية لا يمكن تقليدها بسهولة' : 'Sovereign architecture not easily replicable',
    isArabic ? 'بيانات متشاركة تخلق قيمة تراكمية' : 'Shared data creating cumulative value',
  ]).moveDown();

  // Investment Ask
  doc.fontSize(18)
     .fillColor('#1e1b4b')
     .text(isArabic ? 'طلب الاستثمار' : 'Investment Ask')
     .moveDown(0.5);

  doc.fontSize(12)
     .fillColor('#475569')
     .text(isArabic
       ? 'نبحث عن شركاء استراتيجيين يشاركوننا رؤية السيادة الرقمية للمؤسسات في المنطقة والعالم.'
       : 'We are looking for strategic partners who share our vision of digital sovereignty for organizations in the region and globally.');

  doc.end();
}

function addSlideHeader(doc: PDFDocument, title: string) {
  doc.rect(0, 0, doc.page.width, 100)
     .fill('#6366f1');
  
  doc.fontSize(32)
     .fillColor('#ffffff')
     .text(title, 50, 35, { align: 'center', width: doc.page.width - 100 });
}
