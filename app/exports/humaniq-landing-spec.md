# INFERA HumanIQ Landing Page Specification

## Platform Info
- **Name**: INFERA HumanIQ
- **Name (AR)**: إنفيرا هيومان آي كيو
- **Code**: INFERA-HUMANIQ-001
- **Type**: Human Capital Intelligence Platform
- **Version**: 1.0.0

---

## Hero Section

### Badge
- EN: "Human Capital Intelligence"
- AR: "ذكاء رأس المال البشري"

### Title
- EN: "INFERA HumanIQ™"
- AR: "INFERA HumanIQ™"

### Subtitle
- EN: "Smarter People Management"
- AR: "موظفون أذكى. قرارات أدق."

### Description
- EN: "A sovereign human capital intelligence platform that treats people as strategic intelligent assets, not static records. HumanIQ doesn't manage HR... it understands it."
- AR: "منصة ذكاء سيادي لإدارة رأس المال البشري تعامل الموظفين كأصول استراتيجية ذكية وليس كأرقام أو سجلات. HumanIQ لا يدير الموارد البشرية... بل يفهمها."

### CTA Button
- EN: "Start Human Intelligence"
- AR: "ابدأ إدارة الذكاء البشري"

---

## Statistics Cards

| Stat | Value | Icon |
|------|-------|------|
| Active Employees / الموظفين النشطين | 2,847 | Users |
| Performance Rate / معدل الأداء | 94% | TrendingUp |
| Training Hours / ساعات التدريب | 12.4K | BookOpen |
| Satisfaction Rate / معدل الرضا | 92% | Heart |

---

## Feature Sections

### 1. Employee Intelligence Hub / مركز ذكاء الموظفين
- **Icon**: Brain
- **Color**: from-violet-600 to-purple-700
- **Description EN**: Smart profiles with skills analysis and behavioral insights for every employee.
- **Description AR**: ملفات شخصية ذكية مع تحليل المهارات والرؤى السلوكية لكل موظف.
- **Features**:
  - Profiles / الملفات الشخصية (UserCheck)
  - Skills / المهارات (Star)
  - Behavioral Insights / الرؤى السلوكية (Activity)

### 2. Performance & Evaluation / الأداء والتقييم
- **Icon**: Target
- **Color**: from-cyan-600 to-blue-700
- **Description EN**: AI-powered scoring with growth indicators and career development tracking.
- **Description AR**: تقييم ذكي بالـ AI مع مؤشرات النمو وتتبع التطور المهني.
- **Features**:
  - AI Scoring / تقييم AI (Award)
  - Growth Indicators / مؤشرات النمو (TrendingUp)
  - Performance Analytics / تحليل الأداء (BarChart3)

### 3. Payroll & Attendance / الرواتب والحضور
- **Icon**: Wallet
- **Color**: from-emerald-600 to-green-700
- **Description EN**: Smart payroll system with live attendance synchronization.
- **Description AR**: نظام رواتب ذكي مع مزامنة حية للحضور والانصراف.
- **Features**:
  - Smart Payroll / الرواتب الذكية (Wallet)
  - Live Attendance / الحضور المباشر (Clock)
  - Leave Management / إدارة الإجازات (Calendar)

### 4. Learning & Growth / التعلم والنمو
- **Icon**: GraduationCap
- **Color**: from-amber-600 to-orange-700
- **Description EN**: Training integration with future skills forecasting.
- **Description AR**: تكامل مع منصات التدريب وتوقع المهارات المستقبلية.
- **Features**:
  - Training Integration / تكامل التدريب (BookOpen)
  - Skill Forecast / توقع المهارات (Zap)
  - Growth Paths / مسارات النمو (Sparkles)

---

## Network Visualization (Hero Background)

Animated network of employee nodes:
| ID | Role EN | Role AR | Position (x%, y%) |
|----|---------|---------|-------------------|
| 1 | Manager | مدير | 50, 30 |
| 2 | Engineer | مهندس | 20, 60 |
| 3 | Designer | مصمم | 80, 60 |
| 4 | Analyst | محلل | 35, 85 |
| 5 | Developer | مطور | 65, 85 |
| 6 | Lead | قائد | 50, 55 |

---

## Design Tokens

### Colors
- Primary Gradient: violet-600 to cyan-600
- Hero Background: violet-950/30 to cyan-950/20
- Card Headers: Section-specific gradients

### Typography
- Title: text-4xl to text-7xl, font-bold
- Subtitle: text-2xl to text-4xl, font-light
- Body: text-lg to text-xl

### Components Used
- Badge (outline variant)
- Button (lg size)
- Card with CardHeader, CardContent, CardTitle
- motion.div (framer-motion animations)

---

## Footer CTA Section
- Background: Gradient violet-600 via purple-600 to cyan-600
- Quote EN: "HumanIQ doesn't manage HR... it understands it"
- Quote AR: "HumanIQ لا يدير الموارد البشرية... بل يفهمها"

---

## Technical Requirements

### Dependencies
- React
- wouter (routing)
- framer-motion (animations)
- lucide-react (icons)
- Tailwind CSS
- shadcn/ui components

### Bilingual Support
- RTL/LTR based on language context
- useLanguage hook for language detection

### Test IDs
- button-start-humaniq
- button-final-humaniq-cta
