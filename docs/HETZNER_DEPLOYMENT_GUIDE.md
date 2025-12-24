# دليل النشر على Hetzner - INFERA WebNova
# Hetzner Deployment Guide

## نظرة عامة | Overview

هذا الدليل يشرح كيفية إعداد النشر التلقائي من Replit/GitHub إلى سيرفر Hetzner.

This guide explains how to set up automatic deployment from Replit/GitHub to your Hetzner server.

---

## المتطلبات | Requirements

1. حساب GitHub
2. سيرفر Hetzner (مع صلاحيات root)
3. دومين (اختياري للـ SSL)

---

## الخطوة 1: ربط Replit بـ GitHub | Connect Replit to GitHub

1. في Replit، اضغط على أيقونة **Git** في الشريط الجانبي
2. اضغط **"Connect to GitHub"**
3. أنشئ repository جديد أو اربط بواحد موجود
4. اعمل commit و push للكود

---

## الخطوة 2: إعداد سيرفر Hetzner | Setup Hetzner Server

### أ. الاتصال بالسيرفر

```bash
ssh root@YOUR_SERVER_IP
```

### ب. تشغيل سكربت الإعداد

```bash
# انسخ محتوى scripts/setup-hetzner-server.sh إلى السيرفر
# ثم شغّله:
chmod +x setup-hetzner-server.sh
./setup-hetzner-server.sh
```

### ج. أو الإعداد اليدوي

```bash
# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# تثبيت PM2
npm install -g pm2

# إنشاء مجلد التطبيق
mkdir -p /var/www/infera-webnova
cd /var/www/infera-webnova

# استنساخ المستودع
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# تثبيت المكتبات
npm install

# تشغيل التطبيق
pm2 start npm --name "infera-webnova" -- run start
pm2 save
pm2 startup
```

---

## الخطوة 3: إنشاء SSH Key للنشر التلقائي | Create SSH Key

### على جهازك المحلي أو في Replit Shell:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./deploy_key -N ""
```

هذا ينشئ ملفين:
- `deploy_key` = المفتاح الخاص (Private Key) - **لا تشاركه أبداً**
- `deploy_key.pub` = المفتاح العام (Public Key)

### أضف المفتاح العام إلى سيرفر Hetzner:

```bash
# على السيرفر
echo "YOUR_PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## الخطوة 4: إضافة Secrets في GitHub | Add GitHub Secrets

⚠️ **مهم جداً**: لا تضع معلومات حساسة في الكود مباشرة!

### اذهب إلى:
GitHub Repository → Settings → Secrets and variables → Actions → New repository secret

### أضف هذه الـ Secrets:

| الاسم | القيمة | الوصف |
|-------|--------|-------|
| `HETZNER_SERVER_IP` | `123.45.67.89` | عنوان IP لسيرفرك |
| `HETZNER_SERVER_USER` | `root` | اسم المستخدم للـ SSH |
| `HETZNER_SSH_PRIVATE_KEY` | محتوى `deploy_key` | المفتاح الخاص كاملاً |
| `HETZNER_SSH_PORT` | `22` | منفذ SSH (اختياري) |

### طريقة نسخ المفتاح الخاص:

```bash
cat deploy_key
```

انسخ **كل** المحتوى بما في ذلك:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

---

## الخطوة 5: اختبار النشر التلقائي | Test Automatic Deployment

1. اعمل تغيير صغير في الكود
2. commit و push إلى GitHub
3. اذهب إلى GitHub → Actions
4. راقب تنفيذ الـ workflow
5. تحقق من السيرفر أن التغييرات ظهرت

---

## استكشاف الأخطاء | Troubleshooting

### خطأ SSH Connection refused

```bash
# تأكد من تشغيل SSH على السيرفر
systemctl status sshd

# تأكد من صحة المفتاح
ssh -i deploy_key root@YOUR_SERVER_IP
```

### خطأ Permission denied

```bash
# على السيرفر، تأكد من صلاحيات authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### التطبيق لا يعمل بعد النشر

```bash
# على السيرفر
pm2 logs infera-webnova
pm2 status
```

---

## الرجوع لنسخة سابقة | Rollback

### من GitHub:
1. اذهب إلى Actions
2. اختر deployment سابق ناجح
3. اضغط "Re-run all jobs"

### يدوياً على السيرفر:

```bash
cd /var/www/infera-webnova
git log --oneline  # اعرض التاريخ
git reset --hard COMMIT_HASH  # ارجع لـ commit معين
pm2 restart infera-webnova
```

---

## الدعم | Support

للمساعدة، تواصل عبر الدعم الفني أو افتح Issue في GitHub.
