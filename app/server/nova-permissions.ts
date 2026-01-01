import type { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import {
  novaPermissions,
  novaPermissionGrants,
  novaPermissionAudit,
  novaPermissionPresets,
  type NovaPermission,
  type NovaPermissionGrant,
} from "@shared/schema";

// ==================== نظام التحكم في صلاحيات نوفا ====================
// Nova AI Permission Control System for INFERA WebNova

// ==================== تعريف الصلاحيات الأساسية ====================
// Default permissions with security levels

export interface PermissionDefinition {
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: string;
  securityLevel: "high" | "medium" | "low" | "danger";
  defaultEnabled: boolean;
}

// Complete list of Nova AI permissions
export const DEFAULT_PERMISSIONS: PermissionDefinition[] = [
  // ==================== تنفيذ الكود ====================
  {
    code: "execute_nodejs",
    nameEn: "Execute Node.js Code",
    nameAr: "تنفيذ كود Node.js",
    descriptionEn: "Run Node.js code in isolated sandbox",
    descriptionAr: "تشغيل كود Node.js في بيئة معزولة",
    category: "code_execution",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "execute_python",
    nameEn: "Execute Python Code",
    nameAr: "تنفيذ كود Python",
    descriptionEn: "Run Python code in isolated sandbox",
    descriptionAr: "تشغيل كود Python في بيئة معزولة",
    category: "code_execution",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "execute_shell",
    nameEn: "Execute Shell Commands",
    nameAr: "تنفيذ أوامر Shell",
    descriptionEn: "Run limited shell commands (ls, cat, echo, etc.)",
    descriptionAr: "تشغيل أوامر shell محدودة (ls, cat, echo, إلخ)",
    category: "code_execution",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "install_packages",
    nameEn: "Install Packages",
    nameAr: "تثبيت الحزم",
    descriptionEn: "Install npm/pip packages in sandbox",
    descriptionAr: "تثبيت حزم npm/pip في البيئة المعزولة",
    category: "code_execution",
    securityLevel: "medium",
    defaultEnabled: false,
  },

  // ==================== عمليات الملفات ====================
  {
    code: "create_files",
    nameEn: "Create Files",
    nameAr: "إنشاء الملفات",
    descriptionEn: "Create new files in project",
    descriptionAr: "إنشاء ملفات جديدة في المشروع",
    category: "file_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "read_files",
    nameEn: "Read Files",
    nameAr: "قراءة الملفات",
    descriptionEn: "Read existing files in project",
    descriptionAr: "قراءة الملفات الموجودة في المشروع",
    category: "file_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "edit_files",
    nameEn: "Edit Files",
    nameAr: "تعديل الملفات",
    descriptionEn: "Modify existing files in project",
    descriptionAr: "تعديل الملفات الموجودة في المشروع",
    category: "file_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "delete_files",
    nameEn: "Delete Files",
    nameAr: "حذف الملفات",
    descriptionEn: "Remove files from project",
    descriptionAr: "حذف الملفات من المشروع",
    category: "file_operations",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "upload_files",
    nameEn: "Upload Files",
    nameAr: "رفع الملفات",
    descriptionEn: "Upload files to object storage",
    descriptionAr: "رفع الملفات إلى التخزين السحابي",
    category: "file_operations",
    securityLevel: "medium",
    defaultEnabled: true,
  },

  // ==================== عمليات قاعدة البيانات ====================
  {
    code: "db_read",
    nameEn: "Read Database",
    nameAr: "قراءة قاعدة البيانات",
    descriptionEn: "Execute SELECT queries on database",
    descriptionAr: "تنفيذ استعلامات SELECT على قاعدة البيانات",
    category: "database_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "db_write",
    nameEn: "Write Database",
    nameAr: "الكتابة في قاعدة البيانات",
    descriptionEn: "Execute INSERT/UPDATE queries",
    descriptionAr: "تنفيذ استعلامات INSERT/UPDATE",
    category: "database_operations",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "db_delete",
    nameEn: "Delete from Database",
    nameAr: "الحذف من قاعدة البيانات",
    descriptionEn: "Execute DELETE queries",
    descriptionAr: "تنفيذ استعلامات DELETE",
    category: "database_operations",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "db_schema",
    nameEn: "Modify Database Schema",
    nameAr: "تعديل هيكل قاعدة البيانات",
    descriptionEn: "Create/alter tables and columns",
    descriptionAr: "إنشاء/تعديل الجداول والأعمدة",
    category: "database_operations",
    securityLevel: "danger",
    defaultEnabled: false,
  },

  // ==================== تكامل API ====================
  {
    code: "api_read",
    nameEn: "Read External APIs",
    nameAr: "قراءة APIs الخارجية",
    descriptionEn: "Make GET requests to external services",
    descriptionAr: "إرسال طلبات GET للخدمات الخارجية",
    category: "api_integrations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "api_write",
    nameEn: "Write to External APIs",
    nameAr: "الكتابة في APIs الخارجية",
    descriptionEn: "Make POST/PUT/DELETE requests to external services",
    descriptionAr: "إرسال طلبات POST/PUT/DELETE للخدمات الخارجية",
    category: "api_integrations",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "api_oauth",
    nameEn: "OAuth Integrations",
    nameAr: "تكاملات OAuth",
    descriptionEn: "Connect to services via OAuth",
    descriptionAr: "الاتصال بالخدمات عبر OAuth",
    category: "api_integrations",
    securityLevel: "medium",
    defaultEnabled: false,
  },

  // ==================== النشر والإصدار ====================
  {
    code: "deploy_preview",
    nameEn: "Deploy Preview",
    nameAr: "نشر المعاينة",
    descriptionEn: "Deploy to preview/staging environment",
    descriptionAr: "النشر في بيئة المعاينة/الاختبار",
    category: "deployment",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "deploy_production",
    nameEn: "Deploy to Production",
    nameAr: "النشر للإنتاج",
    descriptionEn: "Deploy to production environment",
    descriptionAr: "النشر في بيئة الإنتاج",
    category: "deployment",
    securityLevel: "low",
    defaultEnabled: false,
  },
  {
    code: "deploy_vercel",
    nameEn: "Deploy to Vercel",
    nameAr: "النشر على Vercel",
    descriptionEn: "Create and deploy projects on Vercel",
    descriptionAr: "إنشاء ونشر المشاريع على Vercel",
    category: "deployment",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "deploy_netlify",
    nameEn: "Deploy to Netlify",
    nameAr: "النشر على Netlify",
    descriptionEn: "Create and deploy sites on Netlify",
    descriptionAr: "إنشاء ونشر المواقع على Netlify",
    category: "deployment",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "deploy_github",
    nameEn: "Push to GitHub",
    nameAr: "الدفع إلى GitHub",
    descriptionEn: "Create repos and push code to GitHub",
    descriptionAr: "إنشاء المستودعات ودفع الكود إلى GitHub",
    category: "deployment",
    securityLevel: "medium",
    defaultEnabled: false,
  },

  // ==================== قدرات الذكاء الاصطناعي ====================
  {
    code: "ai_chat",
    nameEn: "AI Chat",
    nameAr: "محادثة الذكاء الاصطناعي",
    descriptionEn: "Conversational AI assistance",
    descriptionAr: "المساعدة التفاعلية بالذكاء الاصطناعي",
    category: "ai_capabilities",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_code_generation",
    nameEn: "AI Code Generation",
    nameAr: "توليد الكود بالذكاء الاصطناعي",
    descriptionEn: "Generate code using AI models",
    descriptionAr: "توليد الكود باستخدام نماذج الذكاء الاصطناعي",
    category: "ai_capabilities",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_vision",
    nameEn: "AI Vision Processing",
    nameAr: "معالجة الصور بالذكاء الاصطناعي",
    descriptionEn: "Analyze images, OCR, screenshot-to-code",
    descriptionAr: "تحليل الصور، استخراج النصوص، تحويل الصور لكود",
    category: "ai_capabilities",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_autonomous",
    nameEn: "Autonomous AI Operations",
    nameAr: "العمليات الذاتية للذكاء الاصطناعي",
    descriptionEn: "Allow AI to perform multi-step tasks autonomously",
    descriptionAr: "السماح للذكاء الاصطناعي بتنفيذ مهام متعددة الخطوات ذاتياً",
    category: "ai_capabilities",
    securityLevel: "low",
    defaultEnabled: false,
  },

  // ==================== إدارة البنية التحتية ====================
  {
    code: "infra_servers",
    nameEn: "Manage Servers",
    nameAr: "إدارة الخوادم",
    descriptionEn: "Create, configure, and manage cloud servers",
    descriptionAr: "إنشاء وتكوين وإدارة الخوادم السحابية",
    category: "infrastructure",
    securityLevel: "danger",
    defaultEnabled: false,
  },
  {
    code: "infra_domains",
    nameEn: "Manage Domains",
    nameAr: "إدارة النطاقات",
    descriptionEn: "Configure domains and DNS settings",
    descriptionAr: "تكوين النطاقات وإعدادات DNS",
    category: "infrastructure",
    securityLevel: "low",
    defaultEnabled: false,
  },
  {
    code: "infra_ssl",
    nameEn: "Manage SSL Certificates",
    nameAr: "إدارة شهادات SSL",
    descriptionEn: "Issue and manage SSL certificates",
    descriptionAr: "إصدار وإدارة شهادات SSL",
    category: "infrastructure",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "infra_monitoring",
    nameEn: "Access Monitoring",
    nameAr: "الوصول للمراقبة",
    descriptionEn: "View server metrics and logs",
    descriptionAr: "عرض مقاييس الخادم والسجلات",
    category: "infrastructure",
    securityLevel: "high",
    defaultEnabled: true,
  },

  // ==================== المدفوعات والفوترة ====================
  {
    code: "payment_read",
    nameEn: "View Payments",
    nameAr: "عرض المدفوعات",
    descriptionEn: "View payment history and invoices",
    descriptionAr: "عرض سجل المدفوعات والفواتير",
    category: "payment_billing",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "payment_process",
    nameEn: "Process Payments",
    nameAr: "معالجة المدفوعات",
    descriptionEn: "Create and process payment transactions",
    descriptionAr: "إنشاء ومعالجة معاملات الدفع",
    category: "payment_billing",
    securityLevel: "danger",
    defaultEnabled: false,
  },
  {
    code: "payment_refund",
    nameEn: "Issue Refunds",
    nameAr: "إصدار المبالغ المستردة",
    descriptionEn: "Process refunds for customers",
    descriptionAr: "معالجة المبالغ المستردة للعملاء",
    category: "payment_billing",
    securityLevel: "danger",
    defaultEnabled: false,
  },

  // ==================== إدارة المستخدمين ====================
  {
    code: "users_read",
    nameEn: "View Users",
    nameAr: "عرض المستخدمين",
    descriptionEn: "View user profiles and data",
    descriptionAr: "عرض ملفات المستخدمين وبياناتهم",
    category: "user_management",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "users_create",
    nameEn: "Create Users",
    nameAr: "إنشاء المستخدمين",
    descriptionEn: "Create new user accounts",
    descriptionAr: "إنشاء حسابات مستخدمين جديدة",
    category: "user_management",
    securityLevel: "medium",
    defaultEnabled: false,
  },
  {
    code: "users_modify",
    nameEn: "Modify Users",
    nameAr: "تعديل المستخدمين",
    descriptionEn: "Edit user profiles and settings",
    descriptionAr: "تعديل ملفات المستخدمين وإعداداتهم",
    category: "user_management",
    securityLevel: "low",
    defaultEnabled: false,
  },
  {
    code: "users_delete",
    nameEn: "Delete Users",
    nameAr: "حذف المستخدمين",
    descriptionEn: "Remove user accounts",
    descriptionAr: "حذف حسابات المستخدمين",
    category: "user_management",
    securityLevel: "danger",
    defaultEnabled: false,
  },

  // ==================== إعدادات النظام ====================
  {
    code: "config_read",
    nameEn: "View Configuration",
    nameAr: "عرض الإعدادات",
    descriptionEn: "View system configuration settings",
    descriptionAr: "عرض إعدادات تكوين النظام",
    category: "system_config",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "config_modify",
    nameEn: "Modify Configuration",
    nameAr: "تعديل الإعدادات",
    descriptionEn: "Change system configuration settings",
    descriptionAr: "تغيير إعدادات تكوين النظام",
    category: "system_config",
    securityLevel: "danger",
    defaultEnabled: false,
  },
  {
    code: "secrets_read",
    nameEn: "View Secrets",
    nameAr: "عرض الأسرار",
    descriptionEn: "View API keys and secrets (masked)",
    descriptionAr: "عرض مفاتيح API والأسرار (مخفية)",
    category: "system_config",
    securityLevel: "low",
    defaultEnabled: false,
  },
  {
    code: "secrets_modify",
    nameEn: "Modify Secrets",
    nameAr: "تعديل الأسرار",
    descriptionEn: "Create, update, or delete secrets",
    descriptionAr: "إنشاء أو تحديث أو حذف الأسرار",
    category: "system_config",
    securityLevel: "danger",
    defaultEnabled: false,
  },

  // ==================== التنقل والوصول للصفحات ====================
  {
    code: "navigate_pages",
    nameEn: "Navigate All Pages",
    nameAr: "التنقل بين جميع الصفحات",
    descriptionEn: "Access and navigate to any page in the system",
    descriptionAr: "الوصول والتنقل إلى أي صفحة في النظام",
    category: "navigation_access",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "access_architecture",
    nameEn: "Access System Architecture",
    nameAr: "الوصول لبنية النظام",
    descriptionEn: "View and understand full system architecture",
    descriptionAr: "عرض وفهم البنية الكاملة للنظام",
    category: "navigation_access",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "invoke_pages",
    nameEn: "Invoke & Open Pages",
    nameAr: "استدعاء وفتح الصفحات",
    descriptionEn: "Programmatically open and invoke any page or component",
    descriptionAr: "فتح واستدعاء أي صفحة أو مكون برمجياً",
    category: "navigation_access",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "develop_pages",
    nameEn: "Develop & Modify Pages",
    nameAr: "تطوير وتعديل الصفحات",
    descriptionEn: "Create, edit, and enhance any page in the system",
    descriptionAr: "إنشاء وتعديل وتحسين أي صفحة في النظام",
    category: "navigation_access",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "access_components",
    nameEn: "Access All Components",
    nameAr: "الوصول لجميع المكونات",
    descriptionEn: "Access and modify any UI component",
    descriptionAr: "الوصول لأي مكون واجهة مستخدم وتعديله",
    category: "navigation_access",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "access_routes",
    nameEn: "Access All Routes",
    nameAr: "الوصول لجميع المسارات",
    descriptionEn: "View and modify all application routes",
    descriptionAr: "عرض وتعديل جميع مسارات التطبيق",
    category: "navigation_access",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "access_layouts",
    nameEn: "Access All Layouts",
    nameAr: "الوصول لجميع التخطيطات",
    descriptionEn: "View and modify page layouts and structures",
    descriptionAr: "عرض وتعديل تخطيطات الصفحات وهياكلها",
    category: "navigation_access",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "access_styles",
    nameEn: "Access All Styles",
    nameAr: "الوصول لجميع الأنماط",
    descriptionEn: "View and modify CSS/styling across the system",
    descriptionAr: "عرض وتعديل الأنماط عبر النظام",
    category: "navigation_access",
    securityLevel: "high",
    defaultEnabled: true,
  },

  // ==================== صلاحيات البناء المطلقة ====================
  {
    code: "build_execute_any",
    nameEn: "Execute Any Command",
    nameAr: "تنفيذ أي أمر",
    descriptionEn: "Execute any shell command without restrictions",
    descriptionAr: "تنفيذ أي أمر shell بدون قيود",
    category: "build_operations",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "build_modify_any_file",
    nameEn: "Modify Any File",
    nameAr: "تعديل أي ملف",
    descriptionEn: "Read, write, delete any file in the system",
    descriptionAr: "قراءة وكتابة وحذف أي ملف في النظام",
    category: "build_operations",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "build_create_components",
    nameEn: "Create Any Component",
    nameAr: "إنشاء أي مكون",
    descriptionEn: "Create new components, pages, and modules",
    descriptionAr: "إنشاء مكونات وصفحات ووحدات جديدة",
    category: "build_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "build_delete_components",
    nameEn: "Delete Any Component",
    nameAr: "حذف أي مكون",
    descriptionEn: "Remove components, pages, and modules",
    descriptionAr: "حذف المكونات والصفحات والوحدات",
    category: "build_operations",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "build_refactor_code",
    nameEn: "Refactor Code",
    nameAr: "إعادة هيكلة الكود",
    descriptionEn: "Perform large-scale code refactoring",
    descriptionAr: "إجراء إعادة هيكلة واسعة للكود",
    category: "build_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "build_install_deps",
    nameEn: "Install Any Dependencies",
    nameAr: "تثبيت أي تبعيات",
    descriptionEn: "Install npm, pip, or system packages",
    descriptionAr: "تثبيت حزم npm أو pip أو النظام",
    category: "build_operations",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "build_manage_db",
    nameEn: "Full Database Control",
    nameAr: "تحكم كامل في قاعدة البيانات",
    descriptionEn: "Create, alter, drop tables and manage migrations",
    descriptionAr: "إنشاء وتعديل وحذف الجداول وإدارة الترحيلات",
    category: "build_operations",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "build_manage_env",
    nameEn: "Manage Environment Variables",
    nameAr: "إدارة متغيرات البيئة",
    descriptionEn: "Create, modify, delete environment variables",
    descriptionAr: "إنشاء وتعديل وحذف متغيرات البيئة",
    category: "build_operations",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "build_manage_secrets",
    nameEn: "Full Secrets Access",
    nameAr: "وصول كامل للأسرار",
    descriptionEn: "View, create, modify, delete all secrets",
    descriptionAr: "عرض وإنشاء وتعديل وحذف جميع الأسرار",
    category: "build_operations",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "build_git_operations",
    nameEn: "Full Git Control",
    nameAr: "تحكم كامل في Git",
    descriptionEn: "Commit, push, pull, branch, merge operations",
    descriptionAr: "عمليات commit، push، pull، branch، merge",
    category: "build_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "build_deploy_anywhere",
    nameEn: "Deploy to Any Platform",
    nameAr: "النشر على أي منصة",
    descriptionEn: "Deploy to any cloud or hosting platform",
    descriptionAr: "النشر على أي منصة سحابية أو استضافة",
    category: "build_operations",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "build_run_tests",
    nameEn: "Run All Tests",
    nameAr: "تشغيل جميع الاختبارات",
    descriptionEn: "Execute unit, integration, and E2E tests",
    descriptionAr: "تنفيذ اختبارات الوحدة والتكامل والشاملة",
    category: "build_operations",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "build_manage_workflows",
    nameEn: "Manage Workflows",
    nameAr: "إدارة سير العمل",
    descriptionEn: "Start, stop, restart any workflow",
    descriptionAr: "بدء وإيقاف وإعادة تشغيل أي سير عمل",
    category: "build_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "build_access_logs",
    nameEn: "Access All Logs",
    nameAr: "الوصول لجميع السجلات",
    descriptionEn: "View all system, application, and error logs",
    descriptionAr: "عرض جميع سجلات النظام والتطبيق والأخطاء",
    category: "build_operations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "build_network_access",
    nameEn: "Full Network Access",
    nameAr: "وصول كامل للشبكة",
    descriptionEn: "Make any HTTP/WebSocket requests",
    descriptionAr: "إجراء أي طلبات HTTP/WebSocket",
    category: "build_operations",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "build_system_config",
    nameEn: "System Configuration",
    nameAr: "تكوين النظام",
    descriptionEn: "Modify system-level configurations",
    descriptionAr: "تعديل إعدادات مستوى النظام",
    category: "build_operations",
    securityLevel: "danger",
    defaultEnabled: true,
  },

  // ==================== قدرات الذكاء الاصطناعي المتقدمة ====================
  {
    code: "ai_nlp_analysis",
    nameEn: "NLP Analysis",
    nameAr: "تحليل اللغة الطبيعية",
    descriptionEn: "Analyze natural language and extract entities",
    descriptionAr: "تحليل اللغة الطبيعية واستخراج الكيانات",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_requirements_analysis",
    nameEn: "Requirements Analysis",
    nameAr: "تحليل المتطلبات",
    descriptionEn: "Analyze and convert requirements to specs",
    descriptionAr: "تحليل وتحويل المتطلبات لمواصفات",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_architecture_design",
    nameEn: "Architecture Design",
    nameAr: "تصميم البنية",
    descriptionEn: "Design system architecture from requirements",
    descriptionAr: "تصميم بنية النظام من المتطلبات",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_code_review",
    nameEn: "AI Code Review",
    nameAr: "مراجعة الكود بالذكاء الاصطناعي",
    descriptionEn: "Review code for quality and security",
    descriptionAr: "مراجعة الكود للجودة والأمان",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_debugging",
    nameEn: "AI Debugging",
    nameAr: "تصحيح الأخطاء بالذكاء الاصطناعي",
    descriptionEn: "Debug code using AI analysis",
    descriptionAr: "تصحيح الأخطاء باستخدام تحليل الذكاء الاصطناعي",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_optimization",
    nameEn: "AI Performance Optimization",
    nameAr: "تحسين الأداء بالذكاء الاصطناعي",
    descriptionEn: "Optimize code performance using AI",
    descriptionAr: "تحسين أداء الكود باستخدام الذكاء الاصطناعي",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_testing_generation",
    nameEn: "AI Test Generation",
    nameAr: "توليد الاختبارات بالذكاء الاصطناعي",
    descriptionEn: "Generate unit and integration tests",
    descriptionAr: "توليد اختبارات الوحدة والتكامل",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_documentation",
    nameEn: "AI Documentation",
    nameAr: "التوثيق بالذكاء الاصطناعي",
    descriptionEn: "Generate documentation automatically",
    descriptionAr: "توليد التوثيق تلقائياً",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_translation",
    nameEn: "AI Translation",
    nameAr: "الترجمة بالذكاء الاصطناعي",
    descriptionEn: "Translate content between languages",
    descriptionAr: "ترجمة المحتوى بين اللغات",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_security_scan",
    nameEn: "AI Security Scanning",
    nameAr: "فحص الأمان بالذكاء الاصطناعي",
    descriptionEn: "Scan code for security vulnerabilities",
    descriptionAr: "فحص الكود للثغرات الأمنية",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_cost_estimation",
    nameEn: "AI Cost Estimation",
    nameAr: "تقدير التكلفة بالذكاء الاصطناعي",
    descriptionEn: "Estimate project costs using AI",
    descriptionAr: "تقدير تكاليف المشروع باستخدام الذكاء الاصطناعي",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "ai_complexity_analysis",
    nameEn: "AI Complexity Analysis",
    nameAr: "تحليل التعقيد بالذكاء الاصطناعي",
    descriptionEn: "Analyze code complexity and maintainability",
    descriptionAr: "تحليل تعقيد الكود وقابلية الصيانة",
    category: "ai_advanced",
    securityLevel: "high",
    defaultEnabled: true,
  },

  // ==================== مترجم المخططات البنائية ====================
  {
    code: "blueprint_parse",
    nameEn: "Parse Blueprints",
    nameAr: "تحليل المخططات البنائية",
    descriptionEn: "Parse natural language into blueprints",
    descriptionAr: "تحليل اللغة الطبيعية إلى مخططات بنائية",
    category: "blueprint_compiler",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "blueprint_generate_schema",
    nameEn: "Generate Schema",
    nameAr: "توليد المخططات",
    descriptionEn: "Generate database schemas from blueprints",
    descriptionAr: "توليد مخططات قاعدة البيانات من المخططات البنائية",
    category: "blueprint_compiler",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "blueprint_generate_backend",
    nameEn: "Generate Backend",
    nameAr: "توليد الباك إند",
    descriptionEn: "Generate backend code from blueprints",
    descriptionAr: "توليد كود الباك إند من المخططات البنائية",
    category: "blueprint_compiler",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "blueprint_generate_frontend",
    nameEn: "Generate Frontend",
    nameAr: "توليد الفرونت إند",
    descriptionEn: "Generate frontend code from blueprints",
    descriptionAr: "توليد كود الفرونت إند من المخططات البنائية",
    category: "blueprint_compiler",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "blueprint_generate_infra",
    nameEn: "Generate Infrastructure",
    nameAr: "توليد البنية التحتية",
    descriptionEn: "Generate Docker and deployment configs",
    descriptionAr: "توليد إعدادات Docker والنشر",
    category: "blueprint_compiler",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "blueprint_build_complete",
    nameEn: "Complete Platform Build",
    nameAr: "بناء منصة كاملة",
    descriptionEn: "Build complete platforms from blueprints",
    descriptionAr: "بناء منصات كاملة من المخططات البنائية",
    category: "blueprint_compiler",
    securityLevel: "danger",
    defaultEnabled: true,
  },

  // ==================== النشر الخارجي ====================
  {
    code: "deploy_hetzner",
    nameEn: "Deploy to Hetzner",
    nameAr: "النشر على Hetzner",
    descriptionEn: "Provision and deploy to Hetzner Cloud",
    descriptionAr: "تجهيز والنشر على سحابة Hetzner",
    category: "external_deployment",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "deploy_aws",
    nameEn: "Deploy to AWS",
    nameAr: "النشر على AWS",
    descriptionEn: "Provision and deploy to Amazon Web Services",
    descriptionAr: "تجهيز والنشر على خدمات أمازون السحابية",
    category: "external_deployment",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "deploy_gcp",
    nameEn: "Deploy to GCP",
    nameAr: "النشر على GCP",
    descriptionEn: "Provision and deploy to Google Cloud Platform",
    descriptionAr: "تجهيز والنشر على منصة جوجل السحابية",
    category: "external_deployment",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "deploy_digitalocean",
    nameEn: "Deploy to DigitalOcean",
    nameAr: "النشر على DigitalOcean",
    descriptionEn: "Provision and deploy to DigitalOcean",
    descriptionAr: "تجهيز والنشر على DigitalOcean",
    category: "external_deployment",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "deploy_onprem",
    nameEn: "Deploy On-Premises",
    nameAr: "النشر المحلي",
    descriptionEn: "Deploy to on-premises servers",
    descriptionAr: "النشر على الخوادم المحلية",
    category: "external_deployment",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "deploy_estimate_costs",
    nameEn: "Estimate Deployment Costs",
    nameAr: "تقدير تكاليف النشر",
    descriptionEn: "Calculate deployment cost estimates",
    descriptionAr: "حساب تقديرات تكلفة النشر",
    category: "external_deployment",
    securityLevel: "high",
    defaultEnabled: true,
  },

  // ==================== المراقبة والتحليلات ====================
  {
    code: "monitor_cpu",
    nameEn: "Monitor CPU",
    nameAr: "مراقبة المعالج",
    descriptionEn: "View CPU usage metrics",
    descriptionAr: "عرض مقاييس استخدام المعالج",
    category: "monitoring",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "monitor_memory",
    nameEn: "Monitor Memory",
    nameAr: "مراقبة الذاكرة",
    descriptionEn: "View memory usage metrics",
    descriptionAr: "عرض مقاييس استخدام الذاكرة",
    category: "monitoring",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "monitor_disk",
    nameEn: "Monitor Disk",
    nameAr: "مراقبة القرص",
    descriptionEn: "View disk usage metrics",
    descriptionAr: "عرض مقاييس استخدام القرص",
    category: "monitoring",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "monitor_network",
    nameEn: "Monitor Network",
    nameAr: "مراقبة الشبكة",
    descriptionEn: "View network traffic metrics",
    descriptionAr: "عرض مقاييس حركة الشبكة",
    category: "monitoring",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "monitor_alerts",
    nameEn: "Configure Alerts",
    nameAr: "تكوين التنبيهات",
    descriptionEn: "Create and manage performance alerts",
    descriptionAr: "إنشاء وإدارة تنبيهات الأداء",
    category: "monitoring",
    securityLevel: "medium",
    defaultEnabled: true,
  },

  // ==================== إدارة الإصدارات ====================
  {
    code: "version_rollback",
    nameEn: "Version Rollback",
    nameAr: "التراجع عن الإصدار",
    descriptionEn: "Rollback to previous versions",
    descriptionAr: "التراجع إلى الإصدارات السابقة",
    category: "version_control",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "version_update",
    nameEn: "Version Update",
    nameAr: "تحديث الإصدار",
    descriptionEn: "Update to new versions",
    descriptionAr: "التحديث إلى إصدارات جديدة",
    category: "version_control",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "version_changelog",
    nameEn: "View Changelog",
    nameAr: "عرض سجل التغييرات",
    descriptionEn: "View version change history",
    descriptionAr: "عرض سجل تغييرات الإصدارات",
    category: "version_control",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "version_schedule",
    nameEn: "Schedule Updates",
    nameAr: "جدولة التحديثات",
    descriptionEn: "Schedule automatic updates",
    descriptionAr: "جدولة التحديثات التلقائية",
    category: "version_control",
    securityLevel: "medium",
    defaultEnabled: true,
  },

  // ==================== استيراد وتصدير ====================
  {
    code: "import_replit",
    nameEn: "Import from Replit",
    nameAr: "الاستيراد من Replit",
    descriptionEn: "Import projects from Replit",
    descriptionAr: "استيراد المشاريع من Replit",
    category: "import_export",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "import_github",
    nameEn: "Import from GitHub",
    nameAr: "الاستيراد من GitHub",
    descriptionEn: "Import projects from GitHub",
    descriptionAr: "استيراد المشاريع من GitHub",
    category: "import_export",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "export_project",
    nameEn: "Export Project",
    nameAr: "تصدير المشروع",
    descriptionEn: "Export project as ZIP or Docker",
    descriptionAr: "تصدير المشروع كـ ZIP أو Docker",
    category: "import_export",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "sync_reverse",
    nameEn: "Reverse Sync",
    nameAr: "المزامنة العكسية",
    descriptionEn: "Sync changes back to original platform",
    descriptionAr: "مزامنة التغييرات مرة أخرى للمنصة الأصلية",
    category: "import_export",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "detach_platform",
    nameEn: "Detach Platform",
    nameAr: "فصل المنصة",
    descriptionEn: "Detach from original platform completely",
    descriptionAr: "فصل المنصة عن المنصة الأصلية تماماً",
    category: "import_export",
    securityLevel: "danger",
    defaultEnabled: true,
  },

  // ==================== إدارة الحوكمة ====================
  {
    code: "governance_rules",
    nameEn: "Manage Rules",
    nameAr: "إدارة القواعد",
    descriptionEn: "Create and manage governance rules",
    descriptionAr: "إنشاء وإدارة قواعد الحوكمة",
    category: "governance",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "governance_compliance",
    nameEn: "Compliance Checks",
    nameAr: "فحوصات الامتثال",
    descriptionEn: "Run compliance verification checks",
    descriptionAr: "تشغيل فحوصات التحقق من الامتثال",
    category: "governance",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "governance_audit",
    nameEn: "Audit Logs",
    nameAr: "سجلات التدقيق",
    descriptionEn: "View and export audit logs",
    descriptionAr: "عرض وتصدير سجلات التدقيق",
    category: "governance",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "governance_policies",
    nameEn: "Security Policies",
    nameAr: "سياسات الأمان",
    descriptionEn: "Manage security policies",
    descriptionAr: "إدارة سياسات الأمان",
    category: "governance",
    securityLevel: "danger",
    defaultEnabled: true,
  },

  // ==================== التكاملات ====================
  {
    code: "integration_stripe",
    nameEn: "Stripe Integration",
    nameAr: "تكامل Stripe",
    descriptionEn: "Access Stripe payment APIs",
    descriptionAr: "الوصول لـ APIs دفع Stripe",
    category: "integrations",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "integration_sendgrid",
    nameEn: "SendGrid Integration",
    nameAr: "تكامل SendGrid",
    descriptionEn: "Send emails via SendGrid",
    descriptionAr: "إرسال البريد عبر SendGrid",
    category: "integrations",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "integration_twilio",
    nameEn: "Twilio Integration",
    nameAr: "تكامل Twilio",
    descriptionEn: "Send SMS via Twilio",
    descriptionAr: "إرسال الرسائل النصية عبر Twilio",
    category: "integrations",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "integration_openai",
    nameEn: "OpenAI Integration",
    nameAr: "تكامل OpenAI",
    descriptionEn: "Access OpenAI APIs",
    descriptionAr: "الوصول لـ APIs OpenAI",
    category: "integrations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "integration_anthropic",
    nameEn: "Anthropic Integration",
    nameAr: "تكامل Anthropic",
    descriptionEn: "Access Anthropic Claude APIs",
    descriptionAr: "الوصول لـ APIs Claude من Anthropic",
    category: "integrations",
    securityLevel: "high",
    defaultEnabled: true,
  },
  {
    code: "integration_storage",
    nameEn: "Cloud Storage",
    nameAr: "التخزين السحابي",
    descriptionEn: "Access cloud storage services",
    descriptionAr: "الوصول لخدمات التخزين السحابي",
    category: "integrations",
    securityLevel: "medium",
    defaultEnabled: true,
  },

  // ==================== إدارة الجلسات والمستخدمين ====================
  {
    code: "session_manage",
    nameEn: "Manage Sessions",
    nameAr: "إدارة الجلسات",
    descriptionEn: "View and terminate user sessions",
    descriptionAr: "عرض وإنهاء جلسات المستخدمين",
    category: "session_management",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "session_impersonate",
    nameEn: "Impersonate Users",
    nameAr: "انتحال المستخدمين",
    descriptionEn: "Login as another user for debugging",
    descriptionAr: "تسجيل الدخول كمستخدم آخر للتصحيح",
    category: "session_management",
    securityLevel: "danger",
    defaultEnabled: false,
  },
  {
    code: "session_2fa",
    nameEn: "Manage 2FA",
    nameAr: "إدارة المصادقة الثنائية",
    descriptionEn: "Configure two-factor authentication",
    descriptionAr: "تكوين المصادقة الثنائية",
    category: "session_management",
    securityLevel: "medium",
    defaultEnabled: true,
  },

  // ==================== التحكم في النظام ====================
  {
    code: "system_restart",
    nameEn: "Restart System",
    nameAr: "إعادة تشغيل النظام",
    descriptionEn: "Restart the application server",
    descriptionAr: "إعادة تشغيل خادم التطبيق",
    category: "system_control",
    securityLevel: "danger",
    defaultEnabled: true,
  },
  {
    code: "system_shutdown",
    nameEn: "Shutdown System",
    nameAr: "إيقاف النظام",
    descriptionEn: "Shutdown the application",
    descriptionAr: "إيقاف التطبيق",
    category: "system_control",
    securityLevel: "danger",
    defaultEnabled: false,
  },
  {
    code: "system_maintenance",
    nameEn: "Maintenance Mode",
    nameAr: "وضع الصيانة",
    descriptionEn: "Enable/disable maintenance mode",
    descriptionAr: "تفعيل/إلغاء وضع الصيانة",
    category: "system_control",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "system_backup",
    nameEn: "System Backup",
    nameAr: "نسخ احتياطي للنظام",
    descriptionEn: "Create and manage backups",
    descriptionAr: "إنشاء وإدارة النسخ الاحتياطية",
    category: "system_control",
    securityLevel: "medium",
    defaultEnabled: true,
  },
  {
    code: "system_restore",
    nameEn: "System Restore",
    nameAr: "استعادة النظام",
    descriptionEn: "Restore from backups",
    descriptionAr: "الاستعادة من النسخ الاحتياطية",
    category: "system_control",
    securityLevel: "danger",
    defaultEnabled: true,
  },
];

// Default permission presets
export const DEFAULT_PRESETS = [
  {
    code: "restrictive",
    nameEn: "Restrictive",
    nameAr: "مقيد",
    descriptionEn: "Minimal permissions for basic AI assistance only",
    descriptionAr: "صلاحيات محدودة للمساعدة الأساسية فقط",
    permissions: ["ai_chat", "ai_code_generation", "read_files", "config_read"],
    color: "green",
    icon: "Shield",
    displayOrder: 1,
    isSystem: true,
  },
  {
    code: "balanced",
    nameEn: "Balanced",
    nameAr: "متوازن",
    descriptionEn: "Standard permissions for development work",
    descriptionAr: "صلاحيات قياسية لأعمال التطوير",
    permissions: [
      "ai_chat", "ai_code_generation", "ai_vision",
      "create_files", "read_files", "edit_files", "upload_files",
      "execute_nodejs", "execute_python",
      "db_read", "db_write",
      "api_read",
      "deploy_preview",
      "users_read", "config_read", "payment_read", "infra_monitoring"
    ],
    color: "blue",
    icon: "Scale",
    displayOrder: 2,
    isSystem: true,
  },
  {
    code: "full_access",
    nameEn: "Full Access",
    nameAr: "وصول كامل",
    descriptionEn: "All permissions enabled for maximum capability",
    descriptionAr: "جميع الصلاحيات مفعلة للحد الأقصى من القدرات",
    permissions: DEFAULT_PERMISSIONS.map(p => p.code),
    color: "red",
    icon: "Key",
    displayOrder: 3,
    isSystem: true,
  },
];

// ==================== خدمات الصلاحيات ====================

// Initialize default permissions in database
export async function initializeDefaultPermissions(): Promise<void> {
  try {
    for (const perm of DEFAULT_PERMISSIONS) {
      await db
        .insert(novaPermissions)
        .values({
          code: perm.code,
          nameEn: perm.nameEn,
          nameAr: perm.nameAr,
          descriptionEn: perm.descriptionEn,
          descriptionAr: perm.descriptionAr,
          category: perm.category,
          securityLevel: perm.securityLevel,
          defaultEnabled: perm.defaultEnabled,
          isSystem: true,
        })
        .onConflictDoNothing();
    }
    
    for (const preset of DEFAULT_PRESETS) {
      await db
        .insert(novaPermissionPresets)
        .values({
          code: preset.code,
          nameEn: preset.nameEn,
          nameAr: preset.nameAr,
          descriptionEn: preset.descriptionEn,
          descriptionAr: preset.descriptionAr,
          permissions: preset.permissions,
          color: preset.color,
          icon: preset.icon,
          displayOrder: preset.displayOrder,
          isSystem: preset.isSystem,
        })
        .onConflictDoNothing();
    }
    
    console.log("[Nova Permissions] Default permissions initialized");
    // Note: High-risk permissions (execute_shell, install_packages, delete_files, db_delete)
    // require explicit manual grants via the admin UI to maintain governance and audit trails
  } catch (error) {
    console.error("[Nova Permissions] Failed to initialize:", error);
  }
}

// Get user's granted permissions
export async function getUserPermissions(userId: string): Promise<string[]> {
  const grants = await db
    .select()
    .from(novaPermissionGrants)
    .where(
      and(
        eq(novaPermissionGrants.userId, userId),
        eq(novaPermissionGrants.isGranted, true)
      )
    );
  
  return grants.map(g => g.permissionCode);
}

// Check if user has specific permission
export async function hasPermission(userId: string, permissionCode: string): Promise<boolean> {
  const grant = await db
    .select()
    .from(novaPermissionGrants)
    .where(
      and(
        eq(novaPermissionGrants.userId, userId),
        eq(novaPermissionGrants.permissionCode, permissionCode),
        eq(novaPermissionGrants.isGranted, true)
      )
    )
    .limit(1);
  
  return grant.length > 0;
}

// Grant permission to user
export async function grantPermission(
  userId: string,
  permissionCode: string,
  actorId: string,
  reason?: string
): Promise<boolean> {
  try {
    const existingGrant = await db
      .select()
      .from(novaPermissionGrants)
      .where(
        and(
          eq(novaPermissionGrants.userId, userId),
          eq(novaPermissionGrants.permissionCode, permissionCode)
        )
      )
      .limit(1);
    
    const previousState = existingGrant[0]?.isGranted ?? false;
    
    if (existingGrant.length > 0) {
      await db
        .update(novaPermissionGrants)
        .set({
          isGranted: true,
          grantedBy: actorId,
          grantedAt: new Date(),
          revokedBy: null,
          revokedAt: null,
          reason,
          updatedAt: new Date(),
        })
        .where(eq(novaPermissionGrants.id, existingGrant[0].id));
    } else {
      await db.insert(novaPermissionGrants).values({
        userId,
        permissionCode,
        isGranted: true,
        grantedBy: actorId,
        grantedAt: new Date(),
        reason,
      });
    }
    
    // Log audit
    await db.insert(novaPermissionAudit).values({
      userId,
      actorId,
      action: "grant",
      permissionCode,
      previousState,
      newState: true,
      reason,
    });
    
    return true;
  } catch (error) {
    console.error("[Nova Permissions] Grant error:", error);
    return false;
  }
}

// Revoke permission from user
export async function revokePermission(
  userId: string,
  permissionCode: string,
  actorId: string,
  reason?: string
): Promise<boolean> {
  try {
    const existingGrant = await db
      .select()
      .from(novaPermissionGrants)
      .where(
        and(
          eq(novaPermissionGrants.userId, userId),
          eq(novaPermissionGrants.permissionCode, permissionCode)
        )
      )
      .limit(1);
    
    const previousState = existingGrant[0]?.isGranted ?? false;
    
    if (existingGrant.length > 0) {
      await db
        .update(novaPermissionGrants)
        .set({
          isGranted: false,
          revokedBy: actorId,
          revokedAt: new Date(),
          reason,
          updatedAt: new Date(),
        })
        .where(eq(novaPermissionGrants.id, existingGrant[0].id));
    }
    
    // Log audit
    await db.insert(novaPermissionAudit).values({
      userId,
      actorId,
      action: "revoke",
      permissionCode,
      previousState,
      newState: false,
      reason,
    });
    
    return true;
  } catch (error) {
    console.error("[Nova Permissions] Revoke error:", error);
    return false;
  }
}

// Apply preset to user
export async function applyPreset(
  userId: string,
  presetCode: string,
  actorId: string
): Promise<boolean> {
  try {
    const preset = await db
      .select()
      .from(novaPermissionPresets)
      .where(eq(novaPermissionPresets.code, presetCode))
      .limit(1);
    
    if (!preset[0]) return false;
    
    const permissions = preset[0].permissions as string[];
    
    // Revoke all current permissions
    await db
      .update(novaPermissionGrants)
      .set({ isGranted: false, revokedBy: actorId, revokedAt: new Date() })
      .where(eq(novaPermissionGrants.userId, userId));
    
    // Grant permissions from preset
    for (const permCode of permissions) {
      await grantPermission(userId, permCode, actorId, `Applied preset: ${presetCode}`);
    }
    
    // Log bulk action
    await db.insert(novaPermissionAudit).values({
      userId,
      actorId,
      action: "apply_preset",
      permissionCodes: permissions,
      reason: `Applied preset: ${preset[0].nameEn}`,
    });
    
    return true;
  } catch (error) {
    console.error("[Nova Permissions] Apply preset error:", error);
    return false;
  }
}

// ==================== Middleware للتحقق من الصلاحيات ====================

// Permission enforcement middleware factory
export function requireNovaPermission(permissionCode: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = (req as any).session;
    const userId = session?.userId || session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        errorAr: "المصادقة مطلوبة",
      });
    }
    
    const permitted = await hasPermission(userId, permissionCode);
    
    if (!permitted) {
      return res.status(403).json({
        success: false,
        error: `Permission denied: ${permissionCode}`,
        errorAr: `الصلاحية مرفوضة: ${permissionCode}`,
        requiredPermission: permissionCode,
      });
    }
    
    next();
  };
}

// ==================== API Routes ====================

export function registerNovaPermissionRoutes(app: Express): void {
  
  // Initialize permissions on startup
  initializeDefaultPermissions();
  
  // ==================== الحصول على جميع الصلاحيات المتاحة ====================
  app.get("/api/nova/permissions", async (req: Request, res: Response) => {
    try {
      const permissions = await db
        .select()
        .from(novaPermissions)
        .orderBy(novaPermissions.category, novaPermissions.code);
      
      // Group by category
      const grouped: Record<string, NovaPermission[]> = {};
      for (const perm of permissions) {
        if (!grouped[perm.category]) {
          grouped[perm.category] = [];
        }
        grouped[perm.category].push(perm);
      }
      
      res.json({
        success: true,
        permissions,
        grouped,
        categories: Object.keys(grouped),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== الحصول على صلاحيات المستخدم ====================
  app.get("/api/nova/permissions/user/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // Get all permissions
      const allPermissions = await db.select().from(novaPermissions);
      
      // Get user grants
      const grants = await db
        .select()
        .from(novaPermissionGrants)
        .where(eq(novaPermissionGrants.userId, userId));
      
      const grantMap = new Map(grants.map(g => [g.permissionCode, g]));
      
      // Combine permissions with grant status
      const userPermissions = allPermissions.map(perm => ({
        ...perm,
        isGranted: grantMap.get(perm.code)?.isGranted ?? false,
        grantedAt: grantMap.get(perm.code)?.grantedAt,
        grantedBy: grantMap.get(perm.code)?.grantedBy,
      }));
      
      // Group by category
      const grouped: Record<string, typeof userPermissions> = {};
      for (const perm of userPermissions) {
        if (!grouped[perm.category]) {
          grouped[perm.category] = [];
        }
        grouped[perm.category].push(perm);
      }
      
      // Count statistics
      const stats = {
        total: allPermissions.length,
        granted: userPermissions.filter(p => p.isGranted).length,
        bySecurityLevel: {
          high: userPermissions.filter(p => p.isGranted && p.securityLevel === "high").length,
          medium: userPermissions.filter(p => p.isGranted && p.securityLevel === "medium").length,
          low: userPermissions.filter(p => p.isGranted && p.securityLevel === "low").length,
          danger: userPermissions.filter(p => p.isGranted && p.securityLevel === "danger").length,
        },
      };
      
      res.json({
        success: true,
        userId,
        permissions: userPermissions,
        grouped,
        stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== منح صلاحية ====================
  app.post("/api/nova/permissions/grant", async (req: Request, res: Response) => {
    try {
      const { userId, permissionCode, reason } = req.body;
      const session = (req as any).session;
      const actorId = session?.userId || session?.user?.id || "system";
      
      if (!userId || !permissionCode) {
        return res.status(400).json({
          success: false,
          error: "userId and permissionCode required",
          errorAr: "مطلوب معرف المستخدم وكود الصلاحية",
        });
      }
      
      const result = await grantPermission(userId, permissionCode, actorId, reason);
      
      res.json({
        success: result,
        message: result ? "Permission granted" : "Failed to grant permission",
        messageAr: result ? "تم منح الصلاحية" : "فشل منح الصلاحية",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== إلغاء صلاحية ====================
  app.post("/api/nova/permissions/revoke", async (req: Request, res: Response) => {
    try {
      const { userId, permissionCode, reason } = req.body;
      const session = (req as any).session;
      const actorId = session?.userId || session?.user?.id || "system";
      
      if (!userId || !permissionCode) {
        return res.status(400).json({
          success: false,
          error: "userId and permissionCode required",
          errorAr: "مطلوب معرف المستخدم وكود الصلاحية",
        });
      }
      
      const result = await revokePermission(userId, permissionCode, actorId, reason);
      
      res.json({
        success: result,
        message: result ? "Permission revoked" : "Failed to revoke permission",
        messageAr: result ? "تم إلغاء الصلاحية" : "فشل إلغاء الصلاحية",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== منح/إلغاء مجموعة صلاحيات ====================
  app.post("/api/nova/permissions/bulk", async (req: Request, res: Response) => {
    try {
      const { userId, permissions, action, reason } = req.body;
      const session = (req as any).session;
      const actorId = session?.userId || session?.user?.id || "system";
      
      if (!userId || !Array.isArray(permissions) || !["grant", "revoke"].includes(action)) {
        return res.status(400).json({
          success: false,
          error: "Invalid request",
          errorAr: "طلب غير صالح",
        });
      }
      
      const results: { code: string; success: boolean }[] = [];
      
      for (const permCode of permissions) {
        const success = action === "grant"
          ? await grantPermission(userId, permCode, actorId, reason)
          : await revokePermission(userId, permCode, actorId, reason);
        results.push({ code: permCode, success });
      }
      
      res.json({
        success: true,
        results,
        successCount: results.filter(r => r.success).length,
        failCount: results.filter(r => !r.success).length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== تطبيق Preset ====================
  app.post("/api/nova/permissions/apply-preset", async (req: Request, res: Response) => {
    try {
      const { userId, presetCode } = req.body;
      const session = (req as any).session;
      const actorId = session?.userId || session?.user?.id || "system";
      
      if (!userId || !presetCode) {
        return res.status(400).json({
          success: false,
          error: "userId and presetCode required",
          errorAr: "مطلوب معرف المستخدم وكود الإعداد المسبق",
        });
      }
      
      const result = await applyPreset(userId, presetCode, actorId);
      
      res.json({
        success: result,
        message: result ? "Preset applied" : "Failed to apply preset",
        messageAr: result ? "تم تطبيق الإعداد المسبق" : "فشل تطبيق الإعداد المسبق",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== الحصول على Presets ====================
  app.get("/api/nova/permissions/presets", async (req: Request, res: Response) => {
    try {
      const presets = await db
        .select()
        .from(novaPermissionPresets)
        .orderBy(novaPermissionPresets.displayOrder);
      
      res.json({
        success: true,
        presets,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== سجل التدقيق ====================
  app.get("/api/nova/permissions/audit/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const audit = await db
        .select()
        .from(novaPermissionAudit)
        .where(eq(novaPermissionAudit.userId, userId))
        .orderBy(desc(novaPermissionAudit.createdAt))
        .limit(limit);
      
      res.json({
        success: true,
        audit,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== التحقق من صلاحية محددة ====================
  app.get("/api/nova/permissions/check", async (req: Request, res: Response) => {
    try {
      const { userId, permissionCode } = req.query;
      
      if (!userId || !permissionCode) {
        return res.status(400).json({
          success: false,
          error: "userId and permissionCode required",
        });
      }
      
      const permitted = await hasPermission(userId as string, permissionCode as string);
      
      res.json({
        success: true,
        permitted,
        userId,
        permissionCode,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== سياق Nova الكامل للمستخدم ====================
  // يعطي Nova معرفة كاملة بصلاحياته وسياق المنصة حسب دور المستخدم
  app.get("/api/nova/context", async (req: Request, res: Response) => {
    try {
      const session = (req as any).session;
      const userId = session?.userId || session?.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
          errorAr: "المصادقة مطلوبة",
        });
      }
      
      // Get user info
      const { storage } = await import("./storage");
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
          errorAr: "المستخدم غير موجود",
        });
      }
      
      const isOwner = user.role === 'owner' || user.role === 'sovereign';
      
      // Get user's granted permissions
      const grants = await db
        .select()
        .from(novaPermissionGrants)
        .where(and(
          eq(novaPermissionGrants.userId, userId),
          eq(novaPermissionGrants.isGranted, true)
        ));
      
      const grantedPermissions = grants.map(g => g.permissionCode);
      
      // Get all permissions for context
      const allPermissions = await db.select().from(novaPermissions);
      
      // Build permission map with granted status
      const permissionMap = allPermissions.map(p => ({
        code: p.code,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        category: p.category,
        securityLevel: p.securityLevel,
        isGranted: grantedPermissions.includes(p.code),
      }));
      
      // Platform knowledge for Nova
      const platformKnowledge = {
        name: "INFERA WebNova",
        nameAr: "إنفيرا ويب نوفا",
        description: "Sovereign Digital Operating System for building autonomous platforms",
        descriptionAr: "نظام تشغيل رقمي سيادي لبناء منصات مستقلة",
        
        // Core modules Nova knows about
        modules: {
          ai_orchestration: { name: "AI Orchestrator", nameAr: "منسق الذكاء الاصطناعي", path: "/owner/assistant-governance" },
          blueprint_system: { name: "Blueprint Generator", nameAr: "مولد البلوبرنت", path: "/nova" },
          dynamic_control: { name: "Dynamic Control", nameAr: "التحكم الديناميكي", path: "/owner/dynamic-control" },
          nova_permissions: { name: "Nova Permissions", nameAr: "صلاحيات نوفا", path: "/owner/nova-permissions" },
          user_management: { name: "User Management", nameAr: "إدارة المستخدمين", path: "/sovereign" },
          infrastructure: { name: "Infrastructure", nameAr: "البنية التحتية", path: "/owner/infrastructure" },
          analytics: { name: "Analytics", nameAr: "التحليلات", path: "/analytics" },
          deployment: { name: "Deployment", nameAr: "النشر", path: "/deployment" },
          domains: { name: "Domains", nameAr: "النطاقات", path: "/domains" },
          payments: { name: "Payments", nameAr: "المدفوعات", path: "/payments" },
          security: { name: "Security", nameAr: "الأمان", path: "/ssh-vault" },
          templates: { name: "Templates", nameAr: "القوالب", path: "/templates" },
          projects: { name: "Projects", nameAr: "المشاريع", path: "/projects" },
          builder: { name: "Visual Builder", nameAr: "المنشئ المرئي", path: "/builder" },
          ide: { name: "Cloud IDE", nameAr: "بيئة التطوير السحابية", path: "/ide" },
        },
        
        // Subscription tiers Nova understands
        subscriptionTiers: ["free", "basic", "pro", "enterprise", "sovereign", "owner"],
        
        // Current user context
        currentUser: {
          id: userId,
          role: user.role,
          email: user.email,
          fullName: user.fullName,
          isOwner,
          subscriptionTier: user.role,
        },
      };
      
      // Build Nova's capability context based on role
      const novaCapabilities = {
        // What Nova CAN do for this user
        allowed: {
          database: {
            read: grantedPermissions.includes('db_read'),
            write: grantedPermissions.includes('db_write'),
            delete: grantedPermissions.includes('db_delete'),
            schema: grantedPermissions.includes('db_schema'),
          },
          files: {
            read: grantedPermissions.includes('read_files'),
            create: grantedPermissions.includes('create_files'),
            edit: grantedPermissions.includes('edit_files'),
            delete: grantedPermissions.includes('delete_files'),
            upload: grantedPermissions.includes('upload_files'),
          },
          code: {
            executeNodejs: grantedPermissions.includes('execute_nodejs'),
            executePython: grantedPermissions.includes('execute_python'),
            executeShell: grantedPermissions.includes('execute_shell'),
            installPackages: grantedPermissions.includes('install_packages'),
          },
          ai: {
            chat: grantedPermissions.includes('ai_chat'),
            codeGeneration: grantedPermissions.includes('ai_code_generation'),
            vision: grantedPermissions.includes('ai_vision'),
            autonomous: grantedPermissions.includes('ai_autonomous'),
          },
          api: {
            read: grantedPermissions.includes('api_read'),
            write: grantedPermissions.includes('api_write'),
            oauth: grantedPermissions.includes('api_oauth'),
          },
          users: {
            read: grantedPermissions.includes('users_read'),
            create: grantedPermissions.includes('users_create'),
            modify: grantedPermissions.includes('users_modify'),
            delete: grantedPermissions.includes('users_delete'),
          },
          infrastructure: {
            monitoring: grantedPermissions.includes('infra_monitoring'),
            servers: grantedPermissions.includes('infra_servers'),
            domains: grantedPermissions.includes('infra_domains'),
            ssl: grantedPermissions.includes('infra_ssl'),
          },
          deployment: {
            preview: grantedPermissions.includes('deploy_preview'),
            production: grantedPermissions.includes('deploy_production'),
            vercel: grantedPermissions.includes('deploy_vercel'),
            netlify: grantedPermissions.includes('deploy_netlify'),
            github: grantedPermissions.includes('deploy_github'),
          },
          payments: {
            read: grantedPermissions.includes('payment_read'),
            process: grantedPermissions.includes('payment_process'),
            refund: grantedPermissions.includes('payment_refund'),
          },
          config: {
            read: grantedPermissions.includes('config_read'),
            modify: grantedPermissions.includes('config_modify'),
            secretsRead: grantedPermissions.includes('secrets_read'),
            secretsModify: grantedPermissions.includes('secrets_modify'),
          },
        },
        
        // Scope boundaries for non-owner users
        scopeBoundaries: isOwner ? null : {
          // For subscribers: Nova works within their subscription limits
          projectsLimit: user.role === 'free' ? 3 : user.role === 'basic' ? 10 : user.role === 'pro' ? 50 : 200,
          aiRequestsDaily: user.role === 'free' ? 10 : user.role === 'basic' ? 50 : user.role === 'pro' ? 200 : 500,
          storageGB: user.role === 'free' ? 1 : user.role === 'basic' ? 5 : user.role === 'pro' ? 20 : 100,
          canAccessOwnerFeatures: false,
          canModifyOtherUsers: false,
          canAccessBilling: false,
          canDeployProduction: user.role === 'pro' || user.role === 'enterprise',
        },
      };
      
      // Build Nova's response instructions based on role
      const responseGuidelines = isOwner ? {
        mode: "full_sovereign",
        modeAr: "سيادي كامل",
        instructions: [
          "You have FULL access to all platform capabilities",
          "You can read/write database, manage users, deploy, and access all configurations",
          "You can execute any code and manage infrastructure",
          "Answer in full detail with technical depth",
          "Proactively suggest optimizations and improvements",
          "You can access and modify secrets and sensitive configurations",
        ],
        instructionsAr: [
          "لديك وصول كامل لجميع قدرات المنصة",
          "يمكنك قراءة/كتابة قاعدة البيانات، إدارة المستخدمين، النشر، والوصول لجميع الإعدادات",
          "يمكنك تنفيذ أي كود وإدارة البنية التحتية",
          "أجب بتفصيل كامل وعمق تقني",
          "اقترح التحسينات والتطويرات بشكل استباقي",
          "يمكنك الوصول لوتعديل الأسرار والإعدادات الحساسة",
        ],
      } : {
        mode: "subscriber_scope",
        modeAr: "نطاق المشترك",
        instructions: [
          `You are helping a ${user.role} tier subscriber`,
          "Help them build their platforms within their subscription limits",
          "Focus on their projects and platform building needs",
          "Do not access or discuss owner-only features",
          "Do not access other users' data or configurations",
          "Redirect owner-level requests to upgrade their subscription",
        ],
        instructionsAr: [
          `أنت تساعد مشتركاً في باقة ${user.role}`,
          "ساعده في بناء منصاته ضمن حدود اشتراكه",
          "ركز على مشاريعه واحتياجات بناء المنصات",
          "لا تصل أو تناقش ميزات المالك فقط",
          "لا تصل لبيانات أو إعدادات المستخدمين الآخرين",
          "وجّه طلبات مستوى المالك لترقية اشتراكهم",
        ],
      };
      
      res.json({
        success: true,
        context: {
          user: platformKnowledge.currentUser,
          platform: platformKnowledge,
          permissions: permissionMap,
          grantedPermissionCodes: grantedPermissions,
          capabilities: novaCapabilities,
          guidelines: responseGuidelines,
          stats: {
            totalPermissions: allPermissions.length,
            grantedCount: grantedPermissions.length,
            grantedPercentage: Math.round((grantedPermissions.length / allPermissions.length) * 100),
          },
        },
      });
    } catch (error: any) {
      console.error("[Nova Context] Error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // ==================== صلاحيات WebNova الكاملة ====================
  // Grant WebNova (the platform itself) all permissions in sovereign workspace
  app.post("/api/nova/permissions/grant-full-webnova", async (req: Request, res: Response) => {
    try {
      const actorId = "ROOT_OWNER";
      const webnovaId = "webnova-sovereign";
      
      // Grant all permissions to WebNova
      const allPermissionCodes = DEFAULT_PERMISSIONS.map(p => p.code);
      
      for (const permCode of allPermissionCodes) {
        await grantPermission(webnovaId, permCode, actorId, "Full sovereign access for WebNova Core");
      }
      
      // Log audit for full access grant
      await db.insert(novaPermissionAudit).values({
        userId: webnovaId,
        actorId,
        action: "grant_full_access",
        permissionCode: "ALL",
        previousState: false,
        newState: true,
        reason: "WebNova sovereign workspace full access initialization",
      });
      
      res.json({
        success: true,
        message: "WebNova granted full sovereign permissions",
        messageAr: "تم منح WebNova صلاحيات سيادية كاملة",
        grantedCount: allPermissionCodes.length,
        permissions: allPermissionCodes,
      });
    } catch (error: any) {
      console.error("[Nova Permissions] Grant full WebNova error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });
  
  // Get WebNova's full permissions with detailed info
  app.get("/api/nova/permissions/webnova-full", async (req: Request, res: Response) => {
    try {
      const webnovaId = "webnova-sovereign";
      
      // Get all permissions definitions
      const allPermissions = await db.select().from(novaPermissions);
      
      // Get WebNova's granted permissions
      const grants = await db
        .select()
        .from(novaPermissionGrants)
        .where(and(
          eq(novaPermissionGrants.userId, webnovaId),
          eq(novaPermissionGrants.isGranted, true)
        ));
      
      const grantedCodes = grants.map(g => g.permissionCode);
      
      // Build categorized permissions list
      const categories: Record<string, Array<{
        code: string;
        nameEn: string;
        nameAr: string;
        descriptionEn: string;
        descriptionAr: string;
        securityLevel: string;
        isGranted: boolean;
        grantedAt?: Date;
      }>> = {};
      
      for (const perm of allPermissions) {
        const grant = grants.find(g => g.permissionCode === perm.code);
        const permInfo = {
          code: perm.code,
          nameEn: perm.nameEn,
          nameAr: perm.nameAr,
          descriptionEn: perm.descriptionEn,
          descriptionAr: perm.descriptionAr,
          securityLevel: perm.securityLevel,
          isGranted: grantedCodes.includes(perm.code),
          grantedAt: grant?.grantedAt || undefined,
        };
        
        if (!categories[perm.category]) {
          categories[perm.category] = [];
        }
        categories[perm.category].push(permInfo);
      }
      
      // Category translations
      const categoryNames: Record<string, { en: string; ar: string }> = {
        code_execution: { en: "Code Execution", ar: "تنفيذ الكود" },
        file_operations: { en: "File Operations", ar: "عمليات الملفات" },
        database_operations: { en: "Database Operations", ar: "عمليات قاعدة البيانات" },
        api_integrations: { en: "API Integrations", ar: "تكاملات API" },
        deployment: { en: "Deployment", ar: "النشر" },
        ai_capabilities: { en: "AI Capabilities", ar: "قدرات الذكاء الاصطناعي" },
        infrastructure: { en: "Infrastructure", ar: "البنية التحتية" },
        payment_billing: { en: "Payment & Billing", ar: "الدفع والفوترة" },
        user_management: { en: "User Management", ar: "إدارة المستخدمين" },
        system_config: { en: "System Configuration", ar: "إعدادات النظام" },
        navigation_access: { en: "Navigation & Page Access", ar: "التنقل والوصول للصفحات" },
        build_operations: { en: "Build Operations (Absolute)", ar: "عمليات البناء (مطلقة)" },
      };
      
      const totalPermissions = allPermissions.length;
      const grantedCount = grantedCodes.length;
      const powerLevel = Math.round((grantedCount / totalPermissions) * 100);
      
      res.json({
        success: true,
        webnovaId,
        powerLevel,
        powerLevelLabel: powerLevel === 100 ? "FULL_SOVEREIGN" : powerLevel >= 80 ? "HIGH" : powerLevel >= 50 ? "MEDIUM" : "LIMITED",
        powerLevelLabelAr: powerLevel === 100 ? "سيادي كامل" : powerLevel >= 80 ? "عالي" : powerLevel >= 50 ? "متوسط" : "محدود",
        stats: {
          total: totalPermissions,
          granted: grantedCount,
          percentage: powerLevel,
        },
        categories,
        categoryNames,
        allGrantedCodes: grantedCodes,
      });
    } catch (error: any) {
      console.error("[Nova Permissions] Get WebNova permissions error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // ==================== نماذج الذكاء الاصطناعي ====================
  // AI Models Management for Nova

  // In-memory AI models state (production should use database)
  const AI_MODELS = [
    {
      id: "claude-sonnet-4",
      provider: "anthropic",
      nameEn: "Claude Sonnet 4",
      nameAr: "كلود سونيت 4",
      icon: "anthropic",
      color: "#D4A574",
      capabilities: ["chat", "code", "vision", "reasoning"],
      isEnabled: true,
      isPrimary: true,
    },
    {
      id: "claude-opus-4",
      provider: "anthropic",
      nameEn: "Claude Opus 4",
      nameAr: "كلود أوبوس 4",
      icon: "anthropic",
      color: "#D4A574",
      capabilities: ["chat", "code", "vision", "reasoning", "long-context"],
      isEnabled: true,
      isPrimary: false,
    },
    {
      id: "gpt-4o",
      provider: "openai",
      nameEn: "GPT-4o",
      nameAr: "جي بي تي 4o",
      icon: "openai",
      color: "#10A37F",
      capabilities: ["chat", "code", "vision"],
      isEnabled: false,
      isPrimary: false,
    },
    {
      id: "gpt-4o-mini",
      provider: "openai",
      nameEn: "GPT-4o Mini",
      nameAr: "جي بي تي 4o ميني",
      icon: "openai",
      color: "#10A37F",
      capabilities: ["chat", "code"],
      isEnabled: false,
      isPrimary: false,
    },
    {
      id: "gemini-pro",
      provider: "google",
      nameEn: "Gemini Pro",
      nameAr: "جيميناي برو",
      icon: "google",
      color: "#4285F4",
      capabilities: ["chat", "code", "vision"],
      isEnabled: false,
      isPrimary: false,
    },
    {
      id: "nova-core",
      provider: "infera",
      nameEn: "Nova Core",
      nameAr: "نوفا كور",
      icon: "nova",
      color: "#8B5CF6",
      capabilities: ["chat", "code", "sovereign-decisions"],
      isEnabled: true,
      isPrimary: false,
    },
  ];

  let aiModelsState = [...AI_MODELS];

  // GET /api/nova/models - Get all AI models with status
  app.get("/api/nova/models", async (req: Request, res: Response) => {
    try {
      const enabledCount = aiModelsState.filter(m => m.isEnabled).length;
      const primaryModel = aiModelsState.find(m => m.isPrimary);
      
      res.json({
        success: true,
        models: aiModelsState,
        stats: {
          total: aiModelsState.length,
          enabled: enabledCount,
          disabled: aiModelsState.length - enabledCount,
        },
        primaryModel: primaryModel?.id || null,
        primaryModelName: primaryModel?.nameEn || null,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/nova/models/:modelId/toggle - Toggle model enabled/disabled
  app.post("/api/nova/models/:modelId/toggle", async (req: Request, res: Response) => {
    try {
      const { modelId } = req.params;
      const modelIndex = aiModelsState.findIndex(m => m.id === modelId);
      
      if (modelIndex === -1) {
        return res.status(404).json({ success: false, error: "Model not found" });
      }

      // Toggle the enabled state
      aiModelsState[modelIndex].isEnabled = !aiModelsState[modelIndex].isEnabled;
      
      // If disabling the primary model, set another enabled model as primary
      if (!aiModelsState[modelIndex].isEnabled && aiModelsState[modelIndex].isPrimary) {
        aiModelsState[modelIndex].isPrimary = false;
        const firstEnabled = aiModelsState.find(m => m.isEnabled);
        if (firstEnabled) {
          firstEnabled.isPrimary = true;
        }
      }

      // Log to audit
      await db.insert(novaPermissionAudit).values({
        actor: "ROOT_OWNER",
        action: aiModelsState[modelIndex].isEnabled ? "model_enabled" : "model_disabled",
        targetType: "ai_model",
        targetId: modelId,
        details: { modelName: aiModelsState[modelIndex].nameEn },
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      });

      res.json({
        success: true,
        model: aiModelsState[modelIndex],
        message: aiModelsState[modelIndex].isEnabled ? "Model enabled" : "Model disabled",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/nova/models/:modelId/set-primary - Set model as primary
  app.post("/api/nova/models/:modelId/set-primary", async (req: Request, res: Response) => {
    try {
      const { modelId } = req.params;
      const modelIndex = aiModelsState.findIndex(m => m.id === modelId);
      
      if (modelIndex === -1) {
        return res.status(404).json({ success: false, error: "Model not found" });
      }

      if (!aiModelsState[modelIndex].isEnabled) {
        return res.status(400).json({ success: false, error: "Cannot set disabled model as primary" });
      }

      // Remove primary from all models
      aiModelsState.forEach(m => m.isPrimary = false);
      
      // Set this model as primary
      aiModelsState[modelIndex].isPrimary = true;

      // Log to audit
      await db.insert(novaPermissionAudit).values({
        actor: "ROOT_OWNER",
        action: "model_set_primary",
        targetType: "ai_model",
        targetId: modelId,
        details: { modelName: aiModelsState[modelIndex].nameEn },
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      });

      res.json({
        success: true,
        model: aiModelsState[modelIndex],
        message: `${aiModelsState[modelIndex].nameEn} set as primary model`,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ==================== خريطة النظام الشاملة ====================
  // System Map - Nova AI Working Memory & Reference Guide

  // GET /api/nova/system-map/summary - Complete system topology
  app.get("/api/nova/system-map/summary", async (req: Request, res: Response) => {
    try {
      const architecture = getArchitectureMap();
      const database = await getDatabaseMap();
      const components = getComponentsMap();
      const apiRoutes = getApiRoutesMap();
      const infrastructure = getInfrastructureMap();
      const relationships = getRelationshipsMap();

      res.json({
        success: true,
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        sections: {
          architecture,
          database,
          components,
          apiRoutes,
          infrastructure,
          relationships,
        },
        stats: {
          totalTables: database.tables.length,
          totalComponents: components.frontend.length + components.backend.length,
          totalRoutes: apiRoutes.categories.reduce((acc: number, cat: any) => acc + cat.routes.length, 0),
          totalServices: infrastructure.services.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/nova/system-map/architecture - System architecture
  app.get("/api/nova/system-map/architecture", async (req: Request, res: Response) => {
    res.json({ success: true, data: getArchitectureMap() });
  });

  // GET /api/nova/system-map/database - Database schema & relationships
  app.get("/api/nova/system-map/database", async (req: Request, res: Response) => {
    res.json({ success: true, data: await getDatabaseMap() });
  });

  // GET /api/nova/system-map/components - Frontend/Backend components
  app.get("/api/nova/system-map/components", async (req: Request, res: Response) => {
    res.json({ success: true, data: getComponentsMap() });
  });

  // GET /api/nova/system-map/api-routes - All API endpoints
  app.get("/api/nova/system-map/api-routes", async (req: Request, res: Response) => {
    res.json({ success: true, data: getApiRoutesMap() });
  });

  // GET /api/nova/system-map/infrastructure - Cloud & infrastructure
  app.get("/api/nova/system-map/infrastructure", async (req: Request, res: Response) => {
    res.json({ success: true, data: getInfrastructureMap() });
  });

  // GET /api/nova/system-map/relationships - Entity relationships
  app.get("/api/nova/system-map/relationships", async (req: Request, res: Response) => {
    res.json({ success: true, data: getRelationshipsMap() });
  });

  // Helper functions for System Map data
  function getArchitectureMap() {
    return {
      nameEn: "INFERA WebNova Architecture",
      nameAr: "بنية إنفيرا ويب نوفا",
      layers: [
        {
          id: "presentation",
          nameEn: "Presentation Layer",
          nameAr: "طبقة العرض",
          color: "#3B82F6",
          components: ["React Frontend", "Shadcn UI", "TailwindCSS", "Wouter Router"],
        },
        {
          id: "application",
          nameEn: "Application Layer",
          nameAr: "طبقة التطبيق",
          color: "#8B5CF6",
          components: ["Express.js", "Nova AI Orchestrator", "Sovereign Decision Engine", "Platform API"],
        },
        {
          id: "business",
          nameEn: "Business Logic Layer",
          nameAr: "طبقة منطق الأعمال",
          color: "#10B981",
          components: ["Permissions System", "CI/CD Engine", "Smart Analysis Tools", "Military Security"],
        },
        {
          id: "data",
          nameEn: "Data Layer",
          nameAr: "طبقة البيانات",
          color: "#F59E0B",
          components: ["PostgreSQL", "Drizzle ORM", "Object Storage", "Event Store"],
        },
        {
          id: "infrastructure",
          nameEn: "Infrastructure Layer",
          nameAr: "طبقة البنية التحتية",
          color: "#EF4444",
          components: ["Hetzner Cloud", "Kubernetes", "Terraform", "Ansible"],
        },
      ],
      coreModules: [
        { id: "nova-ai", nameEn: "Nova AI", nameAr: "نوفا الذكاء الاصطناعي", icon: "brain" },
        { id: "sovereign-core", nameEn: "Sovereign Core", nameAr: "النواة السيادية", icon: "shield" },
        { id: "platform-builder", nameEn: "Platform Builder", nameAr: "منشئ المنصات", icon: "building" },
        { id: "security-layer", nameEn: "Military Security", nameAr: "الأمان العسكري", icon: "lock" },
      ],
    };
  }

  async function getDatabaseMap() {
    return {
      nameEn: "Database Schema",
      nameAr: "مخطط قاعدة البيانات",
      tables: [
        { name: "users", nameAr: "المستخدمون", columns: 8, relations: ["sessions", "workspaces"], color: "#3B82F6" },
        { name: "sessions", nameAr: "الجلسات", columns: 5, relations: ["users"], color: "#8B5CF6" },
        { name: "workspaces", nameAr: "مساحات العمل", columns: 12, relations: ["users", "projects"], color: "#10B981" },
        { name: "projects", nameAr: "المشاريع", columns: 15, relations: ["workspaces", "files"], color: "#F59E0B" },
        { name: "nova_permissions", nameAr: "صلاحيات نوفا", columns: 10, relations: ["users"], color: "#EF4444" },
        { name: "nova_permission_audit", nameAr: "سجل صلاحيات نوفا", columns: 8, relations: ["nova_permissions"], color: "#EC4899" },
        { name: "sovereign_conversations", nameAr: "محادثات سيادية", columns: 7, relations: ["workspaces"], color: "#14B8A6" },
        { name: "conversation_messages", nameAr: "رسائل المحادثات", columns: 6, relations: ["sovereign_conversations"], color: "#6366F1" },
        { name: "pki_certificates", nameAr: "شهادات PKI", columns: 12, relations: [], color: "#84CC16" },
        { name: "military_incident_response", nameAr: "استجابة الحوادث", columns: 10, relations: [], color: "#F97316" },
        { name: "security_scan_results", nameAr: "نتائج الفحص الأمني", columns: 8, relations: [], color: "#06B6D4" },
        { name: "security_audit_logs", nameAr: "سجلات التدقيق الأمني", columns: 9, relations: [], color: "#A855F7" },
      ],
      relationships: [
        { from: "users", to: "sessions", type: "one-to-many", labelEn: "has", labelAr: "يملك" },
        { from: "users", to: "workspaces", type: "one-to-many", labelEn: "owns", labelAr: "يمتلك" },
        { from: "workspaces", to: "projects", type: "one-to-many", labelEn: "contains", labelAr: "يحتوي" },
        { from: "sovereign_conversations", to: "conversation_messages", type: "one-to-many", labelEn: "includes", labelAr: "يتضمن" },
      ],
    };
  }

  function getComponentsMap() {
    return {
      nameEn: "System Components",
      nameAr: "مكونات النظام",
      frontend: [
        { id: "sovereign-core-ide", nameEn: "Sovereign Core IDE", nameAr: "بيئة التطوير السيادية", path: "client/src/components/sovereign-core-ide.tsx", lines: 8500 },
        { id: "app-sidebar", nameEn: "App Sidebar", nameAr: "الشريط الجانبي", path: "client/src/components/app-sidebar.tsx", lines: 400 },
        { id: "ui-components", nameEn: "UI Components (Shadcn)", nameAr: "مكونات الواجهة", path: "client/src/components/ui/", count: 40 },
        { id: "pages", nameEn: "Pages", nameAr: "الصفحات", path: "client/src/pages/", count: 15 },
      ],
      backend: [
        { id: "nova-permissions", nameEn: "Nova Permissions", nameAr: "صلاحيات نوفا", path: "server/nova-permissions.ts", lines: 1900 },
        { id: "military-security", nameEn: "Military Security Layer", nameAr: "طبقة الأمان العسكري", path: "server/military-security-layer.ts", lines: 800 },
        { id: "smart-analysis", nameEn: "Smart Analysis Tools", nameAr: "أدوات التحليل الذكي", path: "server/smart-analysis-tools.ts", lines: 600 },
        { id: "routes", nameEn: "API Routes", nameAr: "مسارات API", path: "server/routes.ts", lines: 500 },
        { id: "platform-api", nameEn: "Platform API", nameAr: "منصة API", path: "server/platform-api.ts", lines: 2000 },
      ],
      shared: [
        { id: "schema", nameEn: "Database Schema", nameAr: "مخطط قاعدة البيانات", path: "shared/schema.ts", lines: 400 },
      ],
    };
  }

  function getApiRoutesMap() {
    return {
      nameEn: "API Routes",
      nameAr: "مسارات API",
      categories: [
        {
          id: "nova-permissions",
          nameEn: "Nova Permissions",
          nameAr: "صلاحيات نوفا",
          color: "#8B5CF6",
          routes: [
            { method: "GET", path: "/api/nova/permissions/me", descEn: "Get current user permissions", descAr: "الحصول على صلاحيات المستخدم" },
            { method: "POST", path: "/api/nova/permissions/grant", descEn: "Grant permission", descAr: "منح صلاحية" },
            { method: "POST", path: "/api/nova/permissions/revoke", descEn: "Revoke permission", descAr: "سحب صلاحية" },
            { method: "GET", path: "/api/nova/permissions/webnova-full", descEn: "Get WebNova permissions", descAr: "صلاحيات WebNova الكاملة" },
          ],
        },
        {
          id: "nova-models",
          nameEn: "AI Models",
          nameAr: "نماذج الذكاء الاصطناعي",
          color: "#10B981",
          routes: [
            { method: "GET", path: "/api/nova/models", descEn: "List all AI models", descAr: "قائمة النماذج" },
            { method: "POST", path: "/api/nova/models/:id/toggle", descEn: "Toggle model", descAr: "تبديل النموذج" },
            { method: "POST", path: "/api/nova/models/:id/set-primary", descEn: "Set primary model", descAr: "تعيين النموذج الأساسي" },
          ],
        },
        {
          id: "sovereign-core",
          nameEn: "Sovereign Core",
          nameAr: "النواة السيادية",
          color: "#3B82F6",
          routes: [
            { method: "POST", path: "/api/sovereign-core/chat", descEn: "Chat with Nova AI", descAr: "محادثة مع نوفا" },
            { method: "GET", path: "/api/sovereign-core/conversations", descEn: "Get conversations", descAr: "المحادثات" },
          ],
        },
        {
          id: "platform",
          nameEn: "Platform API",
          nameAr: "منصة API",
          color: "#F59E0B",
          routes: [
            { method: "POST", path: "/api/platform/ai/analyze", descEn: "AI code analysis", descAr: "تحليل الكود" },
            { method: "POST", path: "/api/platform/hetzner/deploy", descEn: "Deploy to Hetzner", descAr: "النشر على Hetzner" },
            { method: "GET", path: "/api/platform/monitoring/metrics", descEn: "Get metrics", descAr: "المقاييس" },
          ],
        },
        {
          id: "military",
          nameEn: "Military Security",
          nameAr: "الأمان العسكري",
          color: "#EF4444",
          routes: [
            { method: "POST", path: "/api/military/pki/generate", descEn: "Generate PKI cert", descAr: "إنشاء شهادة PKI" },
            { method: "POST", path: "/api/military/sbom/generate", descEn: "Generate SBOM", descAr: "إنشاء SBOM" },
            { method: "POST", path: "/api/military/incident/report", descEn: "Report incident", descAr: "الإبلاغ عن حادث" },
          ],
        },
      ],
    };
  }

  function getInfrastructureMap() {
    return {
      nameEn: "Infrastructure",
      nameAr: "البنية التحتية",
      services: [
        { id: "web-server", nameEn: "Web Server", nameAr: "خادم الويب", type: "compute", status: "running", port: 5000 },
        { id: "agent-server", nameEn: "INFERA Agent", nameAr: "وكيل إنفيرا", type: "compute", status: "running", port: 5001 },
        { id: "postgresql", nameEn: "PostgreSQL", nameAr: "قاعدة البيانات", type: "database", status: "running" },
        { id: "object-storage", nameEn: "Object Storage", nameAr: "تخزين الملفات", type: "storage", status: "configured" },
      ],
      cloud: [
        { id: "hetzner", nameEn: "Hetzner Cloud", nameAr: "سحابة Hetzner", type: "provider", status: "configured" },
        { id: "kubernetes", nameEn: "Kubernetes (k3s)", nameAr: "كوبيرنيتيس", type: "orchestration", status: "ready" },
      ],
      security: [
        { id: "fips", nameEn: "FIPS 140-3 Crypto", nameAr: "تشفير FIPS", status: "active" },
        { id: "pki", nameEn: "PKI System", nameAr: "نظام PKI", status: "active" },
        { id: "zero-trust", nameEn: "Zero Trust Engine", nameAr: "محرك الثقة الصفرية", status: "active" },
      ],
    };
  }

  function getRelationshipsMap() {
    return {
      nameEn: "Entity Relationships",
      nameAr: "علاقات الكيانات",
      nodes: [
        { id: "owner", labelEn: "ROOT_OWNER", labelAr: "المالك الجذر", type: "actor", color: "#FFD700" },
        { id: "nova", labelEn: "Nova AI", labelAr: "نوفا", type: "ai", color: "#8B5CF6" },
        { id: "workspace", labelEn: "Workspace", labelAr: "مساحة العمل", type: "entity", color: "#3B82F6" },
        { id: "platform", labelEn: "Platform", labelAr: "المنصة", type: "entity", color: "#10B981" },
        { id: "permissions", labelEn: "Permissions", labelAr: "الصلاحيات", type: "system", color: "#EF4444" },
      ],
      edges: [
        { from: "owner", to: "nova", labelEn: "controls", labelAr: "يتحكم" },
        { from: "owner", to: "workspace", labelEn: "owns", labelAr: "يمتلك" },
        { from: "nova", to: "workspace", labelEn: "operates in", labelAr: "يعمل في" },
        { from: "nova", to: "permissions", labelEn: "governed by", labelAr: "محكوم بـ" },
        { from: "workspace", to: "platform", labelEn: "generates", labelAr: "ينشئ" },
      ],
    };
  }
  
  console.log("[Nova Permissions] Routes registered at /api/nova/permissions/*");
  console.log("[Nova AI Models] Routes registered at /api/nova/models/*");
  console.log("[Nova System Map] Routes registered at /api/nova/system-map/*");
}
