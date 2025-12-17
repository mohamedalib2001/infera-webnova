export interface PremiumTemplate {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  html: string;
  css: string;
  js: string;
}

export const PREMIUM_TEMPLATES: PremiumTemplate[] = [
  {
    id: "landing-saas",
    name: "SaaS Landing Page",
    nameAr: "صفحة هبوط SaaS",
    category: "landing",
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
  <title>المنتج</title>
</head>
<body>
  <nav class="navbar">
    <div class="container nav-content">
      <a href="#" class="logo">
        <span class="logo-icon">◆</span>
        <span class="logo-text">تقنية</span>
      </a>
      <div class="nav-links">
        <a href="#features">المميزات</a>
        <a href="#pricing">الأسعار</a>
        <a href="#testimonials">آراء العملاء</a>
        <a href="#contact">تواصل</a>
      </div>
      <div class="nav-actions">
        <a href="#" class="btn-ghost">تسجيل الدخول</a>
        <a href="#" class="btn-primary">ابدأ مجاناً</a>
      </div>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-bg"></div>
    <div class="container hero-content">
      <div class="badge">منصة متطورة</div>
      <h1>حلول سحابية ذكية<br>لمستقبل أعمالك</h1>
      <p class="hero-desc">نقدم لك أحدث التقنيات السحابية مع أمان عالي المستوى وأداء استثنائي. انطلق بأعمالك نحو القمة.</p>
      <div class="hero-actions">
        <a href="#" class="btn-primary btn-lg">ابدأ تجربتك المجانية</a>
        <a href="#" class="btn-outline btn-lg">شاهد العرض التوضيحي</a>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <span class="stat-value">+50,000</span>
          <span class="stat-label">عميل سعيد</span>
        </div>
        <div class="stat">
          <span class="stat-value">99.9%</span>
          <span class="stat-label">وقت التشغيل</span>
        </div>
        <div class="stat">
          <span class="stat-value">24/7</span>
          <span class="stat-label">دعم فني</span>
        </div>
      </div>
    </div>
  </section>

  <section id="features" class="features">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">المميزات</span>
        <h2>كل ما تحتاجه في مكان واحد</h2>
        <p>أدوات متكاملة تساعدك على تحقيق أهدافك بكفاءة عالية</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <h3>أداء فائق السرعة</h3>
          <p>سيرفرات متطورة توفر سرعة استجابة أقل من 50ms في جميع أنحاء العالم</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3>أمان متقدم</h3>
          <p>حماية بيانات بتشفير 256-bit مع مراقبة مستمرة على مدار الساعة</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <h3>توفير الوقت</h3>
          <p>أتمتة المهام المتكررة وتوفير ساعات عمل ثمينة كل أسبوع</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3>تعاون فريق</h3>
          <p>أدوات تعاون متقدمة تمكن فريقك من العمل معاً بسلاسة</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          </div>
          <h3>لوحة تحكم ذكية</h3>
          <p>واجهة سهلة الاستخدام مع تحليلات مفصلة وتقارير شاملة</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <h3>تكامل سلس</h3>
          <p>ربط مع أكثر من 100 تطبيق وخدمة بنقرة واحدة</p>
        </div>
      </div>
    </div>
  </section>

  <section id="pricing" class="pricing">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">الأسعار</span>
        <h2>خطط تناسب جميع الاحتياجات</h2>
        <p>اختر الخطة المناسبة لك وابدأ رحلة النجاح</p>
      </div>
      <div class="pricing-grid">
        <div class="pricing-card">
          <div class="pricing-header">
            <h3>الأساسية</h3>
            <div class="price">
              <span class="currency">ر.س</span>
              <span class="amount">99</span>
              <span class="period">/شهرياً</span>
            </div>
          </div>
          <ul class="pricing-features">
            <li><span class="check">✓</span> 5 مستخدمين</li>
            <li><span class="check">✓</span> 10GB تخزين</li>
            <li><span class="check">✓</span> دعم بالبريد</li>
            <li><span class="check">✓</span> تقارير أساسية</li>
          </ul>
          <a href="#" class="btn-outline btn-block">ابدأ الآن</a>
        </div>
        <div class="pricing-card featured">
          <div class="popular-badge">الأكثر شعبية</div>
          <div class="pricing-header">
            <h3>الاحترافية</h3>
            <div class="price">
              <span class="currency">ر.س</span>
              <span class="amount">299</span>
              <span class="period">/شهرياً</span>
            </div>
          </div>
          <ul class="pricing-features">
            <li><span class="check">✓</span> 25 مستخدم</li>
            <li><span class="check">✓</span> 100GB تخزين</li>
            <li><span class="check">✓</span> دعم على مدار الساعة</li>
            <li><span class="check">✓</span> تحليلات متقدمة</li>
            <li><span class="check">✓</span> API كامل</li>
          </ul>
          <a href="#" class="btn-primary btn-block">ابدأ الآن</a>
        </div>
        <div class="pricing-card">
          <div class="pricing-header">
            <h3>المؤسسات</h3>
            <div class="price">
              <span class="currency">ر.س</span>
              <span class="amount">999</span>
              <span class="period">/شهرياً</span>
            </div>
          </div>
          <ul class="pricing-features">
            <li><span class="check">✓</span> مستخدمين غير محدود</li>
            <li><span class="check">✓</span> تخزين غير محدود</li>
            <li><span class="check">✓</span> مدير حساب مخصص</li>
            <li><span class="check">✓</span> SLA مضمون</li>
            <li><span class="check">✓</span> تخصيص كامل</li>
          </ul>
          <a href="#" class="btn-outline btn-block">تواصل معنا</a>
        </div>
      </div>
    </div>
  </section>

  <section id="testimonials" class="testimonials">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">آراء العملاء</span>
        <h2>ماذا يقول عملاؤنا</h2>
      </div>
      <div class="testimonials-grid">
        <div class="testimonial-card">
          <div class="stars">★★★★★</div>
          <p>"منصة رائعة غيرت طريقة عملنا بالكامل. الدعم الفني متميز والأداء لا يصدق."</p>
          <div class="testimonial-author">
            <div class="avatar">م</div>
            <div>
              <strong>محمد العمري</strong>
              <span>مدير تقنية المعلومات</span>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="stars">★★★★★</div>
          <p>"وفرت لنا ساعات عمل كثيرة وحسنت من إنتاجية الفريق بشكل ملحوظ."</p>
          <div class="testimonial-author">
            <div class="avatar">س</div>
            <div>
              <strong>سارة الفهد</strong>
              <span>مديرة العمليات</span>
            </div>
          </div>
        </div>
        <div class="testimonial-card">
          <div class="stars">★★★★★</div>
          <p>"أفضل استثمار قمنا به هذا العام. النتائج فاقت توقعاتنا."</p>
          <div class="testimonial-author">
            <div class="avatar">أ</div>
            <div>
              <strong>أحمد الراشد</strong>
              <span>الرئيس التنفيذي</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="cta">
    <div class="container cta-content">
      <h2>جاهز للبدء؟</h2>
      <p>انضم لآلاف الشركات الناجحة واستمتع بتجربة مجانية لمدة 14 يوم</p>
      <div class="cta-actions">
        <a href="#" class="btn-white btn-lg">ابدأ تجربتك المجانية</a>
        <a href="#" class="btn-ghost-white btn-lg">تحدث مع خبير</a>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="#" class="logo">
            <span class="logo-icon">◆</span>
            <span class="logo-text">تقنية</span>
          </a>
          <p>نبني مستقبل التقنية العربية بأيدٍ عربية</p>
        </div>
        <div class="footer-links">
          <h4>المنتج</h4>
          <a href="#">المميزات</a>
          <a href="#">الأسعار</a>
          <a href="#">الأمان</a>
        </div>
        <div class="footer-links">
          <h4>الشركة</h4>
          <a href="#">من نحن</a>
          <a href="#">الوظائف</a>
          <a href="#">تواصل معنا</a>
        </div>
        <div class="footer-links">
          <h4>الدعم</h4>
          <a href="#">مركز المساعدة</a>
          <a href="#">الوثائق</a>
          <a href="#">API</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 تقنية. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </footer>
</body>
</html>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --primary-light: #818cf8;
  --secondary: #0ea5e9;
  --dark: #0f172a;
  --dark-light: #1e293b;
  --gray: #64748b;
  --gray-light: #94a3b8;
  --light: #f1f5f9;
  --white: #ffffff;
  --gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
}

body {
  font-family: 'Tajawal', sans-serif;
  color: var(--dark);
  line-height: 1.6;
  background: var(--white);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--dark);
}

.logo-icon {
  color: var(--primary);
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-links a {
  text-decoration: none;
  color: var(--gray);
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: var(--primary);
}

.nav-actions {
  display: flex;
  gap: 12px;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: var(--gradient);
  color: var(--white);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: transparent;
  color: var(--primary);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  border: 2px solid var(--primary);
  transition: all 0.3s;
  cursor: pointer;
}

.btn-outline:hover {
  background: var(--primary);
  color: var(--white);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: transparent;
  color: var(--gray);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.btn-ghost:hover {
  color: var(--primary);
}

.btn-lg {
  padding: 16px 32px;
  font-size: 1.1rem;
}

.btn-block {
  width: 100%;
}

.btn-white {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  background: var(--white);
  color: var(--primary);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(255, 255, 255, 0.2);
}

.btn-ghost-white {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  background: transparent;
  color: var(--white);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.btn-ghost-white:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Hero */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 120px 0 80px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: var(--gradient);
  opacity: 0.03;
}

.hero-content {
  position: relative;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.badge {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 24px;
}

.hero h1 {
  font-size: clamp(2.5rem, 5vw + 1rem, 4rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1.25rem;
  color: var(--gray);
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 64px;
}

.hero-stats {
  display: flex;
  gap: 48px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: var(--dark);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray);
}

/* Section Header */
.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 64px;
}

.section-badge {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: clamp(1.75rem, 3vw + 0.5rem, 2.5rem);
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--dark);
}

.section-header p {
  color: var(--gray);
  font-size: 1.1rem;
}

/* Features */
.features {
  padding: 100px 0;
  background: var(--light);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
}

.feature-card {
  background: var(--white);
  padding: 32px;
  border-radius: 16px;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  width: 56px;
  height: 56px;
  background: var(--gradient);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: var(--white);
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--dark);
}

.feature-card p {
  color: var(--gray);
  line-height: 1.7;
}

/* Pricing */
.pricing {
  padding: 100px 0;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

.pricing-card {
  background: var(--white);
  border: 1px solid var(--light);
  border-radius: 16px;
  padding: 40px 32px;
  position: relative;
  transition: all 0.3s;
}

.pricing-card:hover {
  border-color: var(--primary-light);
}

.pricing-card.featured {
  background: var(--dark);
  border-color: var(--dark);
  transform: scale(1.05);
}

.pricing-card.featured * {
  color: var(--white);
}

.pricing-card.featured .pricing-features li {
  color: var(--gray-light);
}

.pricing-card.featured .btn-primary {
  background: var(--white);
  color: var(--dark);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  background: var(--gradient);
  color: var(--white);
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
}

.pricing-header {
  text-align: center;
  margin-bottom: 32px;
}

.pricing-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.currency {
  font-size: 1.25rem;
  font-weight: 600;
}

.amount {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
}

.period {
  color: var(--gray);
  font-size: 0.875rem;
}

.pricing-features {
  list-style: none;
  margin-bottom: 32px;
}

.pricing-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--light);
  color: var(--gray);
}

.pricing-card.featured .pricing-features li {
  border-color: rgba(255, 255, 255, 0.1);
}

.check {
  color: var(--primary);
  font-weight: bold;
}

/* Testimonials */
.testimonials {
  padding: 100px 0;
  background: var(--light);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.testimonial-card {
  background: var(--white);
  padding: 32px;
  border-radius: 16px;
}

.stars {
  color: #fbbf24;
  font-size: 1.25rem;
  margin-bottom: 16px;
}

.testimonial-card p {
  font-size: 1.1rem;
  color: var(--dark);
  margin-bottom: 24px;
  line-height: 1.7;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  background: var(--gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: 700;
}

.testimonial-author strong {
  display: block;
  color: var(--dark);
}

.testimonial-author span {
  font-size: 0.875rem;
  color: var(--gray);
}

/* CTA */
.cta {
  padding: 100px 0;
  background: var(--gradient);
}

.cta-content {
  text-align: center;
  color: var(--white);
}

.cta h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 16px;
}

.cta p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 40px;
}

.cta-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Footer */
.footer {
  background: var(--dark);
  color: var(--white);
  padding: 80px 0 32px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 48px;
  margin-bottom: 64px;
}

.footer-brand p {
  color: var(--gray-light);
  margin-top: 16px;
  max-width: 280px;
}

.footer-brand .logo {
  color: var(--white);
}

.footer-links h4 {
  font-weight: 600;
  margin-bottom: 20px;
}

.footer-links a {
  display: block;
  color: var(--gray-light);
  text-decoration: none;
  padding: 8px 0;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--white);
}

.footer-bottom {
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: var(--gray);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links, .nav-actions {
    display: none;
  }
  
  .hero-stats {
    gap: 24px;
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .pricing-card.featured {
    transform: scale(1);
  }
}`,
    js: `document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });

  // Animate on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });
});`
  },
  {
    id: "ecommerce",
    name: "E-commerce Store",
    nameAr: "متجر إلكتروني",
    category: "ecommerce",
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
  <title>متجر</title>
</head>
<body>
  <header class="header">
    <div class="container header-content">
      <a href="#" class="logo">متجري</a>
      <nav class="nav-links">
        <a href="#">الرئيسية</a>
        <a href="#">المنتجات</a>
        <a href="#">العروض</a>
        <a href="#">من نحن</a>
      </nav>
      <div class="header-actions">
        <button class="icon-btn search-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button class="icon-btn cart-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="cart-count">0</span>
        </button>
      </div>
    </div>
  </header>

  <section class="hero">
    <div class="container hero-content">
      <span class="sale-badge">خصم 50%</span>
      <h1>تسوق أحدث المنتجات</h1>
      <p>اكتشف مجموعتنا المميزة من المنتجات بأفضل الأسعار</p>
      <a href="#products" class="btn-primary btn-lg">تسوق الآن</a>
    </div>
  </section>

  <section class="categories">
    <div class="container">
      <div class="category-grid">
        <div class="category-card">
          <div class="category-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
          </div>
          <span>إلكترونيات</span>
        </div>
        <div class="category-card">
          <div class="category-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
          </div>
          <span>أزياء</span>
        </div>
        <div class="category-card">
          <div class="category-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span>المنزل</span>
        </div>
        <div class="category-card">
          <div class="category-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <span>الجمال</span>
        </div>
      </div>
    </div>
  </section>

  <section id="products" class="products">
    <div class="container">
      <div class="section-header">
        <h2>منتجات مميزة</h2>
        <a href="#" class="view-all">عرض الكل</a>
      </div>
      <div class="products-grid">
        <div class="product-card" data-id="1" data-price="299">
          <div class="product-image">
            <span class="product-badge">جديد</span>
            <button class="wishlist-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <div class="product-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
            </div>
          </div>
          <div class="product-info">
            <h3>هاتف ذكي برو</h3>
            <div class="product-rating">
              <span class="stars">★★★★★</span>
              <span class="reviews">(128)</span>
            </div>
            <div class="product-price">
              <span class="current-price">299 ر.س</span>
              <span class="old-price">399 ر.س</span>
            </div>
            <button class="add-to-cart">أضف للسلة</button>
          </div>
        </div>
        <div class="product-card" data-id="2" data-price="149">
          <div class="product-image">
            <span class="product-badge sale">خصم</span>
            <button class="wishlist-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <div class="product-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            </div>
          </div>
          <div class="product-info">
            <h3>سماعات لاسلكية</h3>
            <div class="product-rating">
              <span class="stars">★★★★☆</span>
              <span class="reviews">(89)</span>
            </div>
            <div class="product-price">
              <span class="current-price">149 ر.س</span>
              <span class="old-price">199 ر.س</span>
            </div>
            <button class="add-to-cart">أضف للسلة</button>
          </div>
        </div>
        <div class="product-card" data-id="3" data-price="499">
          <div class="product-image">
            <button class="wishlist-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <div class="product-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
            </div>
          </div>
          <div class="product-info">
            <h3>لابتوب احترافي</h3>
            <div class="product-rating">
              <span class="stars">★★★★★</span>
              <span class="reviews">(256)</span>
            </div>
            <div class="product-price">
              <span class="current-price">499 ر.س</span>
            </div>
            <button class="add-to-cart">أضف للسلة</button>
          </div>
        </div>
        <div class="product-card" data-id="4" data-price="79">
          <div class="product-image">
            <button class="wishlist-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <div class="product-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
          </div>
          <div class="product-info">
            <h3>ساعة ذكية</h3>
            <div class="product-rating">
              <span class="stars">★★★★☆</span>
              <span class="reviews">(67)</span>
            </div>
            <div class="product-price">
              <span class="current-price">79 ر.س</span>
            </div>
            <button class="add-to-cart">أضف للسلة</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="features">
    <div class="container features-grid">
      <div class="feature-item">
        <div class="feature-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <div>
          <h4>شحن مجاني</h4>
          <p>للطلبات فوق 200 ر.س</p>
        </div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <h4>دفع آمن</h4>
          <p>حماية كاملة لبياناتك</p>
        </div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </div>
        <div>
          <h4>إرجاع مجاني</h4>
          <p>خلال 14 يوم</p>
        </div>
      </div>
      <div class="feature-item">
        <div class="feature-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <div>
          <h4>دعم 24/7</h4>
          <p>نحن هنا لمساعدتك</p>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-brand">
        <a href="#" class="logo">متجري</a>
        <p>وجهتك الأولى للتسوق الإلكتروني</p>
      </div>
      <div class="footer-links">
        <h4>روابط سريعة</h4>
        <a href="#">من نحن</a>
        <a href="#">تواصل معنا</a>
        <a href="#">سياسة الخصوصية</a>
      </div>
      <div class="footer-contact">
        <h4>تواصل معنا</h4>
        <p>info@mystore.com</p>
        <p>+966 50 000 0000</p>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>© 2024 متجري. جميع الحقوق محفوظة.</p>
    </div>
  </footer>
</body>
</html>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #10b981;
  --dark: #1e293b;
  --gray: #64748b;
  --gray-light: #f1f5f9;
  --white: #ffffff;
  --gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

body {
  font-family: 'Tajawal', sans-serif;
  color: var(--dark);
  line-height: 1.6;
  background: var(--white);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-links a {
  color: var(--gray);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: var(--primary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--gray-light);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray);
  transition: all 0.3s;
}

.icon-btn:hover {
  background: var(--primary);
  color: var(--white);
}

.cart-count {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: var(--primary);
  color: var(--white);
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Hero */
.hero {
  background: var(--gradient);
  padding: 80px 0;
  text-align: center;
  color: var(--white);
}

.sale-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 20px;
  border-radius: 100px;
  font-weight: 600;
  margin-bottom: 20px;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  margin-bottom: 16px;
}

.hero p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 32px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 14px 32px;
  background: var(--white);
  color: var(--primary);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 700;
  transition: transform 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-lg {
  padding: 16px 40px;
  font-size: 1.1rem;
}

/* Categories */
.categories {
  padding: 60px 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 20px;
  background: var(--gray-light);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-card:hover {
  background: var(--primary);
  color: var(--white);
}

.category-card:hover .category-icon {
  background: rgba(255, 255, 255, 0.2);
}

.category-icon {
  width: 64px;
  height: 64px;
  background: var(--white);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.category-card span {
  font-weight: 600;
}

/* Products */
.products {
  padding: 60px 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
}

.view-all {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.product-card {
  background: var(--white);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--gray-light);
  transition: all 0.3s;
}

.product-card:hover {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.product-image {
  position: relative;
  padding: 32px;
  background: var(--gray-light);
}

.product-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  color: var(--gray);
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: var(--primary);
  color: var(--white);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.product-badge.sale {
  background: var(--secondary);
}

.wishlist-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 36px;
  height: 36px;
  border: none;
  background: var(--white);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray);
  transition: all 0.3s;
}

.wishlist-btn:hover {
  color: #ef4444;
}

.product-info {
  padding: 20px;
}

.product-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.stars {
  color: #fbbf24;
}

.reviews {
  color: var(--gray);
  font-size: 0.875rem;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.current-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.old-price {
  font-size: 0.875rem;
  color: var(--gray);
  text-decoration: line-through;
}

.add-to-cart {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--primary);
  background: transparent;
  color: var(--primary);
  border-radius: 8px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s;
}

.add-to-cart:hover {
  background: var(--primary);
  color: var(--white);
}

/* Features */
.features {
  padding: 60px 0;
  background: var(--gray-light);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: var(--white);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.feature-item h4 {
  font-weight: 600;
  margin-bottom: 4px;
}

.feature-item p {
  font-size: 0.875rem;
  color: var(--gray);
}

/* Footer */
.footer {
  background: var(--dark);
  color: var(--white);
  padding: 60px 0 24px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 40px;
}

.footer-brand .logo {
  color: var(--white);
  display: inline-block;
  margin-bottom: 12px;
}

.footer-brand p {
  color: var(--gray);
}

.footer h4 {
  font-weight: 600;
  margin-bottom: 16px;
}

.footer-links a {
  display: block;
  color: var(--gray);
  text-decoration: none;
  padding: 6px 0;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--white);
}

.footer-contact p {
  color: var(--gray);
  padding: 4px 0;
}

.footer-bottom {
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: var(--gray);
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}`,
    js: `document.addEventListener('DOMContentLoaded', function() {
  let cart = [];
  const cartCountEl = document.querySelector('.cart-count');

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.product-card');
      const id = card.dataset.id;
      const price = parseInt(card.dataset.price);
      const name = card.querySelector('h3').textContent;
      
      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ id, name, price, qty: 1 });
      }
      
      updateCartCount();
      
      this.textContent = 'تمت الإضافة';
      this.style.background = '#10b981';
      this.style.color = '#fff';
      this.style.borderColor = '#10b981';
      
      setTimeout(() => {
        this.textContent = 'أضف للسلة';
        this.style.background = 'transparent';
        this.style.color = '';
        this.style.borderColor = '';
      }, 1500);
    });
  });

  function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = total;
  }

  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const svg = this.querySelector('svg');
      if (svg.getAttribute('fill') === 'none') {
        svg.setAttribute('fill', '#ef4444');
        svg.setAttribute('stroke', '#ef4444');
      } else {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
      }
    });
  });

  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function() {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
  });
});`
  },
  {
    id: "portfolio",
    name: "Portfolio",
    nameAr: "معرض أعمال",
    category: "portfolio",
    html: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
  <title>معرض الأعمال</title>
</head>
<body>
  <nav class="navbar">
    <div class="container nav-content">
      <a href="#" class="logo">أحمد.dev</a>
      <div class="nav-links">
        <a href="#about">عني</a>
        <a href="#skills">المهارات</a>
        <a href="#projects">المشاريع</a>
        <a href="#contact">تواصل</a>
      </div>
      <a href="#contact" class="btn-primary">توظيفي</a>
    </div>
  </nav>

  <section class="hero">
    <div class="container hero-content">
      <div class="hero-text">
        <span class="greeting">مرحباً، أنا</span>
        <h1>أحمد محمد</h1>
        <p class="title">مطور واجهات أمامية</p>
        <p class="desc">أحول الأفكار إلى تجارب رقمية استثنائية. متخصص في React و Next.js مع شغف بالتصميم الجميل.</p>
        <div class="hero-actions">
          <a href="#projects" class="btn-primary">شاهد أعمالي</a>
          <a href="#contact" class="btn-outline">تواصل معي</a>
        </div>
        <div class="social-links">
          <a href="#" class="social-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="#" class="social-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          </a>
          <a href="#" class="social-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          </a>
        </div>
      </div>
      <div class="hero-image">
        <div class="avatar-container">
          <div class="avatar">أ</div>
        </div>
      </div>
    </div>
  </section>

  <section id="about" class="about">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">عني</span>
        <h2>من أنا؟</h2>
      </div>
      <div class="about-content">
        <p>مطور واجهات أمامية بخبرة +5 سنوات في بناء تطبيقات ويب حديثة. أعمل مع أحدث التقنيات لتحويل الأفكار إلى منتجات رقمية ناجحة.</p>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">50+</span>
            <span class="stat-label">مشروع مكتمل</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">5+</span>
            <span class="stat-label">سنوات خبرة</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">30+</span>
            <span class="stat-label">عميل سعيد</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="skills" class="skills">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">المهارات</span>
        <h2>التقنيات التي أتقنها</h2>
      </div>
      <div class="skills-grid">
        <div class="skill-card">
          <div class="skill-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85-1.03 0-1.87-.85-1.87-1.85 0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9-.82-.08-1.63-.2-2.4-.36-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.14l-.3-.49m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.14l.3.49m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68 0 1.69-1.83 2.93-4.37 3.68.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68 0-1.69 1.83-2.93 4.37-3.68-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26m9 2.26l-.3.51c.31-.03.61-.08.88-.14-.07-.28-.18-.57-.29-.86l-.29.49m-2.89 4.04c1.59 1.5 2.97 2.08 3.59 1.7.64-.35.83-1.82.32-3.96-.77.16-1.58.28-2.4.36-.48.67-.99 1.31-1.51 1.9M8.08 9.74l.3-.51c-.31.03-.61.08-.88.14.07.28.18.57.29.86l.29-.49m2.89-4.04C9.38 4.2 8 3.62 7.37 4c-.63.35-.82 1.82-.31 3.96.77-.16 1.58-.28 2.4-.36.48-.67.99-1.31 1.51-1.9z"/></svg>
          </div>
          <h3>React</h3>
        </div>
        <div class="skill-card">
          <div class="skill-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5725 0c-.1763 0-.3098.0013-.3584.0067-.0516.0053-.2159.021-.3636.0328-3.4088.3073-6.6017 2.1463-8.624 4.9728C1.1004 6.584.3802 8.3666.1082 10.255c-.0962.659-.108.8537-.108 1.7474s.012 1.0884.108 1.7476c.652 4.506 3.8591 8.2919 8.2087 9.6945.7789.2511 1.6.4223 2.5337.5255.3636.04 1.9354.04 2.299 0 1.6117-.1783 2.9772-.577 4.3237-1.2643.2065-.1056.2464-.1337.2183-.1573-.0188-.0139-.8987-1.1938-1.9543-2.62l-1.919-2.592-2.4047-3.5583c-1.3231-1.9564-2.4117-3.556-2.4211-3.556-.0094-.0026-.0187 1.5787-.0235 3.509-.0067 3.3802-.0093 3.5162-.0516 3.596-.061.115-.108.1618-.2064.2134-.075.0374-.1408.0445-.495.0445h-.406l-.1078-.068a.4383.4383 0 01-.1572-.1712l-.0493-.1056.0053-4.703.0067-4.7054.0726-.0915c.0376-.0493.1174-.1125.1736-.143.0962-.047.1338-.0517.5765-.0517.5765 0 .6276.0187.7697.1547.0422.0374 1.3363 1.9987 2.8729 4.3593 1.5765 2.4193 2.8727 4.4117 3.3252 5.1118l.2611.4025.2183-.1313c1.9489-1.1805 3.3988-2.9344 4.2068-5.0798.2769-.7407.5256-1.7287.5948-2.4122.0187-.1843.0213-.6515.0047-.8554-.06-1.0018-.3186-2.042-.7414-2.9906a9.6044 9.6044 0 00-1.2542-2.0463c-1.8236-2.3037-4.4562-3.8217-7.3892-4.2641-.3636-.0547-1.8854-.0893-2.2996-.0533z"/></svg>
          </div>
          <h3>Next.js</h3>
        </div>
        <div class="skill-card">
          <div class="skill-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/></svg>
          </div>
          <h3>TypeScript</h3>
        </div>
        <div class="skill-card">
          <div class="skill-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"/></svg>
          </div>
          <h3>Tailwind</h3>
        </div>
        <div class="skill-card">
          <div class="skill-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/></svg>
          </div>
          <h3>JavaScript</h3>
        </div>
        <div class="skill-card">
          <div class="skill-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M11.998 24c-6.628 0-12-5.373-12-12s5.372-12 12-12c6.627 0 12 5.373 12 12s-5.373 12-12 12zm-5.5-14l1.5 9h2l1.5-9-2.5 4-2.5-4zm11 0l1.5 9h2l1.5-9-2.5 4-2.5-4z"/></svg>
          </div>
          <h3>Node.js</h3>
        </div>
      </div>
    </div>
  </section>

  <section id="projects" class="projects">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">المشاريع</span>
        <h2>أحدث أعمالي</h2>
      </div>
      <div class="projects-grid">
        <div class="project-card">
          <div class="project-image">
            <div class="project-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m9 9 6 6"/><path d="m15 9-6 6"/></svg>
            </div>
            <div class="project-overlay">
              <a href="#" class="project-link">عرض المشروع</a>
            </div>
          </div>
          <div class="project-info">
            <h3>منصة تجارة إلكترونية</h3>
            <p>متجر إلكتروني متكامل بـ React و Node.js</p>
            <div class="project-tags">
              <span>React</span>
              <span>Node.js</span>
              <span>MongoDB</span>
            </div>
          </div>
        </div>
        <div class="project-card">
          <div class="project-image">
            <div class="project-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
            <div class="project-overlay">
              <a href="#" class="project-link">عرض المشروع</a>
            </div>
          </div>
          <div class="project-info">
            <h3>لوحة تحكم تحليلات</h3>
            <p>داشبورد تفاعلي مع رسوم بيانية متقدمة</p>
            <div class="project-tags">
              <span>Next.js</span>
              <span>TypeScript</span>
              <span>Chart.js</span>
            </div>
          </div>
        </div>
        <div class="project-card">
          <div class="project-image">
            <div class="project-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="project-overlay">
              <a href="#" class="project-link">عرض المشروع</a>
            </div>
          </div>
          <div class="project-info">
            <h3>تطبيق دردشة</h3>
            <p>تطبيق محادثة فورية مع Socket.io</p>
            <div class="project-tags">
              <span>React</span>
              <span>Socket.io</span>
              <span>Express</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="contact" class="contact">
    <div class="container">
      <div class="section-header">
        <span class="section-badge">تواصل</span>
        <h2>لنعمل معاً</h2>
        <p>هل لديك مشروع في ذهنك؟ تواصل معي!</p>
      </div>
      <div class="contact-content">
        <form class="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label>الاسم</label>
              <input type="text" placeholder="اسمك الكريم">
            </div>
            <div class="form-group">
              <label>البريد الإلكتروني</label>
              <input type="email" placeholder="بريدك@مثال.com">
            </div>
          </div>
          <div class="form-group">
            <label>الرسالة</label>
            <textarea rows="5" placeholder="رسالتك هنا..."></textarea>
          </div>
          <button type="submit" class="btn-primary btn-block">إرسال الرسالة</button>
        </form>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-content">
      <p>© 2024 أحمد محمد. جميع الحقوق محفوظة.</p>
      <div class="footer-links">
        <a href="#">GitHub</a>
        <a href="#">LinkedIn</a>
        <a href="#">Twitter</a>
      </div>
    </div>
  </footer>
</body>
</html>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --dark: #0f172a;
  --dark-light: #1e293b;
  --gray: #64748b;
  --gray-light: #94a3b8;
  --light: #f1f5f9;
  --white: #ffffff;
  --gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
}

body {
  font-family: 'Tajawal', sans-serif;
  background: var(--dark);
  color: var(--white);
  line-height: 1.6;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Navbar */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(12px);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--white);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-links a {
  color: var(--gray-light);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: var(--primary);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  background: var(--gradient);
  color: var(--white);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.3);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  background: transparent;
  color: var(--white);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-block {
  width: 100%;
  justify-content: center;
}

/* Hero */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 100px 0;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.greeting {
  display: block;
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 8px;
}

.hero h1 {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 8px;
}

.title {
  font-size: 1.5rem;
  color: var(--gray-light);
  margin-bottom: 16px;
}

.desc {
  color: var(--gray);
  margin-bottom: 32px;
  max-width: 400px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  width: 40px;
  height: 40px;
  background: var(--dark-light);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-light);
  transition: all 0.3s;
}

.social-link:hover {
  background: var(--primary);
  color: var(--white);
}

.hero-image {
  display: flex;
  justify-content: center;
}

.avatar-container {
  position: relative;
}

.avatar-container::before {
  content: '';
  position: absolute;
  inset: -20px;
  background: var(--gradient);
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.05); opacity: 0.5; }
}

.avatar {
  width: 200px;
  height: 200px;
  background: var(--gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  font-weight: 800;
  position: relative;
}

/* Sections */
.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-badge {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(99, 102, 241, 0.2);
  color: var(--primary);
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.section-header h2 {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 700;
}

.section-header p {
  color: var(--gray);
  margin-top: 8px;
}

/* About */
.about {
  padding: 100px 0;
}

.about-content p {
  color: var(--gray-light);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto 48px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.stat-card {
  background: var(--dark-light);
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 800;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.stat-label {
  color: var(--gray);
  font-size: 0.875rem;
}

/* Skills */
.skills {
  padding: 100px 0;
  background: var(--dark-light);
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
}

.skill-card {
  background: var(--dark);
  padding: 32px 24px;
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s;
}

.skill-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 40px rgba(99, 102, 241, 0.1);
}

.skill-icon {
  color: var(--primary);
  margin-bottom: 16px;
}

.skill-card h3 {
  font-size: 1rem;
  font-weight: 600;
}

/* Projects */
.projects {
  padding: 100px 0;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.project-card {
  background: var(--dark-light);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
}

.project-card:hover {
  transform: translateY(-4px);
}

.project-image {
  position: relative;
  height: 200px;
  background: var(--dark);
}

.project-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--gray);
}

.project-overlay {
  position: absolute;
  inset: 0;
  background: rgba(99, 102, 241, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.project-link {
  padding: 12px 24px;
  background: var(--white);
  color: var(--primary);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
}

.project-info {
  padding: 24px;
}

.project-info h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.project-info p {
  color: var(--gray);
  font-size: 0.875rem;
  margin-bottom: 16px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.project-tags span {
  padding: 4px 12px;
  background: rgba(99, 102, 241, 0.2);
  color: var(--primary);
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Contact */
.contact {
  padding: 100px 0;
  background: var(--dark-light);
}

.contact-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 14px 16px;
  background: var(--dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--white);
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--gray);
}

/* Footer */
.footer {
  padding: 32px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer p {
  color: var(--gray);
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-links a {
  color: var(--gray-light);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--primary);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .desc {
    margin-left: auto;
    margin-right: auto;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}`,
    js: `document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Form submission
  const form = document.querySelector('.contact-form');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('شكراً لتواصلك! سأرد عليك في أقرب وقت.');
    form.reset();
  });

  // Animate on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.stat-card, .skill-card, .project-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
  });
});`
  }
];

export function findBestTemplate(prompt: string): PremiumTemplate {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('متجر') || promptLower.includes('تجار') || promptLower.includes('منتج') || 
      promptLower.includes('shop') || promptLower.includes('store') || promptLower.includes('ecommerce')) {
    return PREMIUM_TEMPLATES.find(t => t.id === 'ecommerce')!;
  }
  
  if (promptLower.includes('بورتفوليو') || promptLower.includes('أعمال') || promptLower.includes('مطور') ||
      promptLower.includes('portfolio') || promptLower.includes('developer') || promptLower.includes('personal')) {
    return PREMIUM_TEMPLATES.find(t => t.id === 'portfolio')!;
  }
  
  return PREMIUM_TEMPLATES.find(t => t.id === 'landing-saas')!;
}
