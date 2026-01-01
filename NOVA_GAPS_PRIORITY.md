# قائمة الفجوات في Infra Web Nova (مرتبة بالأولوية)
**تاريخ التحديث:** 20 ديسمبر 2025

---

## Critical (يجب إصلاحها قبل الإطلاق)

| # | الفجوة | الوصف | الملف المتأثر | الحل المقترح | الجهد |
|---|--------|-------|---------------|--------------|-------|
| 1 | **SMTP غير مهيأ** | لا يمكن إرسال إيميلات (OTP, notifications) - يعطل 2FA | server/email.ts | تهيئة SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL | 1 ساعة |
| 2 | **Namecheap غير مهيأ** | لا يمكن تسجيل domains تلقائياً | server/namecheap-client.ts | تهيئة NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_USERNAME | 1 ساعة |
| ~~3~~ | ~~**Stripe غير مهيأ**~~ | ✅ **مُهيأ عبر Replit Integration** | - | - | ✅ تم |
| 4 | **OpenAI غير مهيأ** | بعض ميزات AI لن تعمل | server/openai.ts | تهيئة OPENAI_API_KEY (اختياري - Anthropic متوفر) | 30 دقيقة |

**ملاحظة:** التكاملات الفعّالة حالياً:
- ✅ ANTHROPIC_API_KEY (مهيأ)
- ✅ HETZNER_API_TOKEN (مهيأ)
- ✅ DATABASE_URL (مهيأ)
- ✅ SESSION_SECRET (مهيأ)
- ✅ **Stripe (مُهيأ عبر Replit Integration - 20 ديسمبر 2025)**

---

## High Priority (خلال 30 يوم)

| # | الفجوة | الوصف | الملف المتأثر | الحل المقترح | الجهد |
|---|--------|-------|---------------|--------------|-------|
| 3 | **اختبارات E2E محدودة** | لا توجد اختبارات شاملة للتدفقات | tests/ | إضافة Playwright/Cypress tests | 1 أسبوع |
| 4 | **توثيق API محدود** | لا يوجد Swagger/OpenAPI | server/routes.ts | إضافة swagger-jsdoc | 3 أيام |
| 5 | **OIDC Provider غير مكتمل** | لا يمكن عمل SSO مع منصات خارجية | server/auth.ts | تطوير OIDC endpoints | 1 أسبوع |
| 6 | **Container Isolation** | يعتمد على بيئة Replit | server/terminal-service.ts | Docker/Firecracker integration | 2 أسبوع |

---

## Medium Priority (30-90 يوم)

| # | الفجوة | الوصف | الملف المتأثر | الحل المقترح | الجهد |
|---|--------|-------|---------------|--------------|-------|
| 7 | **API Gateway** | لا يوجد unified gateway | - | Kong/Nginx integration | 1 أسبوع |
| 8 | **Event Bus** | لا توجد رسائل بين الخدمات | - | RabbitMQ/Kafka setup | 2 أسبوع |
| 9 | **Mobile Responsive** | بعض الصفحات غير متجاوبة | client/src/pages/*.tsx | CSS improvements | 1 أسبوع |
| 10 | **Performance Caching** | لا يوجد Redis caching | server/routes.ts | Redis integration | 3 أيام |
| 11 | **Error Boundaries** | بعض الأخطاء لا تُعالج جيداً | client/src/components/ | React Error Boundaries | 3 أيام |

---

## Low Priority (90-180 يوم)

| # | الفجوة | الوصف | الملف المتأثر | الحل المقترح | الجهد |
|---|--------|-------|---------------|--------------|-------|
| 12 | **i18n للمستخدمين** | AR/EN hardcoded | client/src/ | react-i18next | 1 أسبوع |
| 13 | **Plugin Marketplace** | القوالب محدودة | marketplace | Community plugins | 2 أسبوع |
| 14 | **Advanced Analytics** | لوحات تحليلية محدودة | analytics.tsx | Chart.js/D3 dashboards | 1 أسبوع |
| 15 | **Kubernetes Deploy** | Hetzner فقط | deploy-service.ts | K8s manifests | 2 أسبوع |

---

## ملخص الفجوات

| الأولوية | العدد | الجهد الإجمالي |
|----------|-------|----------------|
| Critical | 4 | 3 ساعات |
| High | 4 | 4 أسابيع |
| Medium | 5 | 5 أسابيع |
| Low | 4 | 6 أسابيع |
| **الإجمالي** | **17** | **~15 أسبوع** |

---

## خطة الإصلاح المقترحة

### الأسبوع 1 (Critical)
- [ ] تهيئة SMTP credentials
- [ ] تهيئة Namecheap credentials
- [ ] اختبار Email + Domain workflows

### الأسابيع 2-4 (High Priority)
- [ ] كتابة E2E tests للتدفقات الرئيسية
- [ ] توثيق API مع Swagger
- [ ] بدء تطوير OIDC Provider

### الأسابيع 5-8 (Medium Priority)
- [ ] تحسين Mobile Responsiveness
- [ ] إضافة Redis Caching
- [ ] تحسين Error Handling

### الأسابيع 9-12 (Enhancement)
- [ ] API Gateway setup
- [ ] Event Bus integration
- [ ] Advanced Analytics
