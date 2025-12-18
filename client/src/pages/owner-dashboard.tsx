import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Crown, 
  Bot, 
  Settings, 
  Users, 
  Activity, 
  Shield,
  Send,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  Code,
  Paintbrush,
  FileText,
  BarChart3,
  Sparkles,
  Terminal,
  Globe,
  Server,
  Database,
  Zap,
  MessageSquare,
  Plus,
  RefreshCw,
  Eye,
  History,
  CreditCard,
  Wallet,
  Smartphone,
  Building,
  Bitcoin,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  KeyRound,
  EyeOff,
  Mail,
  Chrome,
  Facebook,
  Twitter,
  Github,
  Apple,
  Monitor,
  Link as LinkIcon,
  Globe2,
  Copy,
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  User as UserIcon,
  RotateCcw
} from "lucide-react";
import type { AiAssistant, AssistantInstruction, User, PaymentMethod, AuthMethod, SovereignAssistant, SovereignCommand, SovereignActionLog } from "@shared/schema";

const translations = {
  ar: {
    title: "لوحة تحكم المالك",
    subtitle: "التحكم الكامل في منصة INFERA WebNova",
    tabs: {
      command: "مركز القيادة",
      assistants: "المساعدين AI",
      sovereign: "المساعدين السياديين",
      aiSovereignty: "سيادة الذكاء",
      domains: "النطاقات",
      payments: "بوابات الدفع",
      auth: "طرق الدخول",
      platform: "إعدادات المنصة",
      users: "المستخدمين",
      analytics: "التحليلات",
      logs: "سجل العمليات",
    },
    usageAnalytics: {
      title: "تحليلات الاستهلاك والتكلفة",
      subtitle: "مراقبة استهلاك الموارد والتكاليف والأرباح",
      todayCost: "تكلفة اليوم الفعلية",
      todayBilled: "المفوتر اليوم",
      todayMargin: "هامش الربح اليوم",
      top5Users: "أكثر 5 مستخدمين استهلاكاً",
      losingUsers: "مستخدمون خاسرون",
      losingUsersDesc: "مستخدمون تتجاوز تكلفتهم ما يدفعونه",
      profitByService: "الربح حسب الخدمة",
      noData: "لا توجد بيانات بعد",
      realCost: "التكلفة الفعلية",
      billedCost: "المفوتر",
      loss: "الخسارة",
      margin: "الهامش",
      service: "الخدمة",
      user: "المستخدم",
      usersWithLocations: "المستخدمون حسب الموقع",
      country: "الدولة",
      city: "المدينة",
      lastSeen: "آخر ظهور",
      setLimits: "تحديد الحدود",
      monthlyLimit: "الحد الشهري",
      autoSuspend: "إيقاف تلقائي عند تجاوز الحد",
    },
    domains: {
      title: "إدارة النطاقات المخصصة",
      subtitle: "ربط نطاقاتك الخاصة بمنصات المشتركين",
      addDomain: "إضافة نطاق",
      hostname: "اسم النطاق",
      hostnamePlaceholder: "example.com",
      status: "الحالة",
      verified: "تم التحقق",
      pending: "قيد الانتظار",
      verifyNow: "تحقق الآن",
      deleteConfirm: "هل تريد حذف هذا النطاق؟",
      verificationMethod: "طريقة التحقق",
      dnsTxt: "سجل DNS TXT",
      dnsCname: "سجل DNS CNAME",
      httpFile: "ملف HTTP",
      instructions: "تعليمات التحقق",
      addRecord: "أضف السجل التالي في إعدادات DNS الخاصة بك:",
      recordType: "نوع السجل",
      recordName: "اسم السجل",
      recordValue: "القيمة",
      copyValue: "نسخ القيمة",
      quota: "الحصة",
      used: "مستخدم",
      of: "من",
      primary: "أساسي",
      makePrimary: "جعله أساسي",
      ssl: "شهادة SSL",
      sslActive: "SSL نشط",
      sslPending: "SSL قيد الإصدار",
      autoRenew: "تجديد تلقائي",
    },
    aiSovereignty: {
      title: "طبقة سيادة الذكاء",
      subtitle: "تحكم كامل في جميع عمليات الذكاء الاصطناعي",
      layers: "طبقات الذكاء",
      powerControl: "التحكم بالقوة",
      externalProviders: "المزودين الخارجيين",
      subscriberLimits: "حدود المشتركين",
      killSwitch: "زر الطوارئ",
      auditLogs: "سجل التدقيق",
      constitution: "دستور الذكاء",
      newLayer: "طبقة جديدة",
      activateKillSwitch: "تفعيل الإيقاف الطارئ",
      deactivateKillSwitch: "إلغاء الإيقاف الطارئ",
      globalStop: "إيقاف شامل",
      externalStop: "إيقاف المزودين الخارجيين",
      layerStop: "إيقاف طبقة محددة",
      governance: {
        title: "الحوكمة السيادية",
        subtitle: "التوجيه السيادي النهائي - تحكم كامل",
        status: "حالة النظام",
        valid: "النظام جاهز للتشغيل",
        invalid: "النظام يحتاج إلى تكوين",
        checks: "فحوصات الاكتمال",
        passed: "ناجح",
        failed: "فاشل",
        pendingApprovals: "الموافقات المعلقة",
        noApprovals: "لا توجد موافقات معلقة",
        approve: "موافقة",
        reject: "رفض",
        hierarchy: "تسلسل السيادة",
        owner: "المالك",
        governanceSystem: "نظام الحوكمة",
        human: "الإنسان",
        ai: "الذكاء الاصطناعي",
        safeRollback: "التراجع الآمن",
        triggerRollback: "تفعيل التراجع الآمن",
        rollbackWarning: "سيؤدي هذا إلى إيقاف جميع عمليات الذكاء فوراً",
        directive: "التوجيه السيادي",
      },
      powerLevels: {
        minimal: "الحد الأدنى",
        low: "منخفض",
        medium: "متوسط",
        high: "عالي",
        maximum: "أقصى",
        unlimited: "غير محدود",
      },
      layerTypes: {
        internal: "داخلي سيادي",
        external: "خارجي مُدار",
        hybrid: "هجين",
        restricted: "مقيد للمشتركين",
      },
      constitutionRules: {
        noAIWithoutLayer: "لا ذكاء بدون طبقة",
        noAIWithoutLimits: "لا ذكاء بدون حدود",
        noUndefinedPower: "لا قوة غير محددة",
        noExternalWithoutApproval: "لا خارجي بدون موافقة المالك",
        noSubscriberAccessWithoutDecision: "لا وصول مشترك بدون قرار مالك",
      },
    },
    command: {
      title: "مركز القيادة الاستراتيجي",
      subtitle: "أرسل أوامرك للمساعدين AI ليقوموا بتنفيذها",
      newInstruction: "أمر جديد",
      selectAssistant: "اختر المساعد",
      instructionTitle: "عنوان الأمر",
      instructionContent: "تفاصيل الأمر",
      priority: "الأولوية",
      priorities: {
        low: "منخفضة",
        normal: "عادية",
        high: "عالية",
        urgent: "عاجلة",
      },
      category: "التصنيف",
      categories: {
        development: "تطوير",
        design: "تصميم",
        content: "محتوى",
        fix: "إصلاح",
        improvement: "تحسين",
      },
      requireApproval: "يتطلب موافقة",
      send: "إرسال الأمر",
      recentInstructions: "الأوامر الأخيرة",
      noInstructions: "لا توجد أوامر بعد",
    },
    assistants: {
      title: "فريق المساعدين AI",
      subtitle: "مساعدون ذكاء اصطناعي يعملون بأوامرك",
      createNew: "إنشاء مساعد جديد",
      specialties: {
        development: "التطوير",
        design: "التصميم",
        content: "المحتوى",
        analytics: "التحليلات",
        security: "الأمان",
      },
      tasksCompleted: "مهام مكتملة",
      successRate: "نسبة النجاح",
      active: "نشط",
      inactive: "غير نشط",
      sendCommand: "إرسال أمر",
    },
    platform: {
      title: "إعدادات المنصة",
      subtitle: "التحكم الكامل في إعدادات النظام",
      general: "عام",
      platformName: "اسم المنصة",
      platformNameAr: "اسم المنصة (عربي)",
      primaryDomain: "النطاق الرئيسي",
      supportEmail: "بريد الدعم",
      defaultLanguage: "اللغة الافتراضية",
      maintenance: "وضع الصيانة",
      registrationEnabled: "التسجيل مفتوح",
      announcement: "إعلان عام",
      announcementAr: "إعلان عام (عربي)",
      save: "حفظ الإعدادات",
    },
    users: {
      title: "إدارة المستخدمين السيادية",
      subtitle: "عرض وإدارة جميع مستخدمي المنصة مع صلاحيات كاملة",
      totalUsers: "إجمالي المستخدمين",
      activeUsers: "المستخدمين النشطين",
      paidUsers: "المستخدمين المدفوعين",
      suspendedUsers: "المستخدمين المعلقين",
      bannedUsers: "المستخدمين المحظورين",
      suspend: "تعليق",
      ban: "حظر",
      reactivate: "إعادة تفعيل",
      permissions: "الصلاحيات",
      statusActive: "نشط",
      statusSuspended: "معلق",
      statusBanned: "محظور",
      statusPending: "قيد الانتظار",
      statusDeactivated: "معطل",
      reasonRequired: "السبب مطلوب",
      enterReason: "أدخل سبب الإجراء",
      confirmSuspend: "هل تريد تعليق هذا المستخدم؟",
      confirmBan: "هل تريد حظر هذا المستخدم نهائياً؟",
      confirmReactivate: "هل تريد إعادة تفعيل هذا المستخدم؟",
      lastLogin: "آخر تسجيل دخول",
      failedAttempts: "محاولات فاشلة",
    },
    logs: {
      title: "سجل العمليات",
      subtitle: "تتبع جميع الأنشطة والتغييرات",
      noLogs: "لا توجد سجلات",
    },
    payments: {
      title: "مركز التحكم بالدفع",
      subtitle: "إدارة وتفعيل بوابات الدفع المتعددة",
      initialize: "تهيئة بوابات الدفع",
      noMethods: "لا توجد طرق دفع. اضغط على تهيئة لإضافتها.",
      active: "مفعّل",
      inactive: "غير مفعّل",
      configured: "مُهيأ",
      notConfigured: "غير مُهيأ",
      sandbox: "وضع الاختبار",
      production: "وضع الإنتاج",
      configure: "تهيئة",
      toggle: "تفعيل/تعطيل",
      delete: "حذف",
      currencies: "العملات المدعومة",
      countries: "الدول المدعومة",
      fees: "الرسوم",
      analytics: {
        title: "تحليلات الدفع",
        totalRevenue: "إجمالي الإيرادات",
        totalTransactions: "إجمالي المعاملات",
        successRate: "نسبة النجاح",
        activeGateways: "البوابات النشطة",
      },
    },
    auth: {
      title: "التحكم في طرق الدخول",
      subtitle: "تفعيل وإدارة طرق تسجيل الدخول للمستخدمين",
      initialize: "تهيئة طرق الدخول",
      noMethods: "لا توجد طرق دخول. اضغط على تهيئة لإضافتها.",
      active: "مفعّل",
      inactive: "غير مفعّل",
      visible: "ظاهر",
      hidden: "مخفي",
      default: "افتراضي",
      configured: "مُهيأ",
      notConfigured: "غير مُهيأ",
      toggleActive: "تفعيل/تعطيل",
      toggleVisibility: "إظهار/إخفاء",
      delete: "حذف",
      cannotModifyDefault: "لا يمكن تعديل الطريقة الافتراضية",
      methods: {
        email_password: "البريد وكلمة المرور",
        otp_email: "رمز تحقق البريد",
        google: "جوجل",
        facebook: "فيسبوك",
        twitter: "إكس (تويتر)",
        github: "جيت هاب",
        apple: "أبل",
        microsoft: "مايكروسوفت",
        magic_link: "رابط سحري",
        otp_sms: "رمز تحقق الجوال",
      },
    },
    stats: {
      totalUsers: "إجمالي المستخدمين",
      activeProjects: "المشاريع النشطة",
      aiGenerations: "توليدات AI",
      revenue: "الإيرادات",
    },
    status: {
      pending: "قيد الانتظار",
      in_progress: "جاري التنفيذ",
      completed: "مكتمل",
      failed: "فشل",
    },
    sovereign: {
      title: "المساعدون السياديون",
      subtitle: "وكلاء AI على مستوى المنصة ينفذون الرؤية الاستراتيجية للمالك",
      initialize: "تهيئة المساعدين السياديين",
      noAssistants: "لم يتم تهيئة المساعدين السياديين بعد.",
      issueCommand: "إصدار أمر",
      viewLogs: "عرض السجلات",
      types: {
        ai_governor: "حاكم الذكاء الاصطناعي",
        platform_architect: "مهندس المنصة",
        operations_commander: "قائد العمليات",
        security_guardian: "حارس الأمان والامتثال",
        growth_strategist: "استراتيجي الأعمال والنمو",
      },
      capabilities: "القدرات",
      constraints: "القيود",
      scope: "نطاق الصلاحيات",
      autonomy: "الاستقلالية",
      autonomousMode: "وضع مستقل",
      manualMode: "وضع يدوي",
      active: "نشط",
      inactive: "غير نشط",
      commandQueue: "قائمة الأوامر",
      commandStatus: {
        pending: "قيد الانتظار",
        approved: "معتمد",
        executing: "قيد التنفيذ",
        completed: "مكتمل",
        failed: "فشل",
        cancelled: "ملغي",
        rolled_back: "تم التراجع",
      },
      approve: "اعتماد",
      cancel: "إلغاء",
      rollback: "تراجع",
      recentActivity: "النشاط الأخير",
      noActivity: "لا يوجد نشاط حتى الآن",
      // Platform State Overview
      platformState: "نظرة عامة على حالة المنصة",
      healthScore: "درجة الصحة",
      healthStatus: {
        healthy: "سليم",
        degraded: "متدهور",
        critical: "حرج",
        emergency: "طوارئ",
      },
      systemStatus: "حالة النظام",
      servicesOperational: "خدمات تعمل",
      // Simulation Mode
      simulationMode: "وضع المحاكاة",
      runSimulation: "تشغيل محاكاة",
      simulationDescription: "معاينة تأثير الأوامر بدون تنفيذ فعلي",
      projectedImpact: "التأثير المتوقع",
      affectedEntities: "الكيانات المتأثرة",
      riskScore: "درجة المخاطر",
      recommendations: "التوصيات",
      // Emergency Controls
      emergencyControls: "ضوابط الطوارئ",
      emergencyDescription: "مفاتيح إيقاف شاملة للمنصة",
      activateEmergency: "تفعيل ضابط طوارئ",
      deactivateEmergency: "إلغاء تفعيل",
      emergencyTypes: {
        ai_suspension: "تعليق خدمات AI",
        platform_lockdown: "إغلاق المنصة",
        feature_disable: "تعطيل ميزة",
      },
      noActiveEmergency: "لا توجد ضوابط طوارئ نشطة",
    },
  },
  en: {
    title: "Owner Dashboard",
    subtitle: "Complete control of INFERA WebNova platform",
    tabs: {
      command: "Command Center",
      assistants: "AI Assistants",
      sovereign: "Sovereign AI",
      aiSovereignty: "AI Sovereignty",
      domains: "Domains",
      payments: "Payment Gateways",
      auth: "Login Methods",
      platform: "Platform Settings",
      users: "Users",
      analytics: "Analytics",
      logs: "Audit Logs",
    },
    usageAnalytics: {
      title: "Usage & Cost Analytics",
      subtitle: "Monitor resource consumption, costs, and profits",
      todayCost: "Today's Actual Cost",
      todayBilled: "Today's Billed",
      todayMargin: "Today's Margin",
      top5Users: "Top 5 Users by Consumption",
      losingUsers: "Losing Users",
      losingUsersDesc: "Users where cost exceeds billed amount",
      profitByService: "Profit by Service",
      noData: "No data yet",
      realCost: "Actual Cost",
      billedCost: "Billed",
      loss: "Loss",
      margin: "Margin",
      service: "Service",
      user: "User",
      usersWithLocations: "Users by Location",
      country: "Country",
      city: "City",
      lastSeen: "Last Seen",
      setLimits: "Set Limits",
      monthlyLimit: "Monthly Limit",
      autoSuspend: "Auto-suspend when limit exceeded",
    },
    domains: {
      title: "Custom Domains Management",
      subtitle: "Connect custom domains to subscriber platforms",
      addDomain: "Add Domain",
      hostname: "Domain Name",
      hostnamePlaceholder: "example.com",
      status: "Status",
      verified: "Verified",
      pending: "Pending",
      verifyNow: "Verify Now",
      deleteConfirm: "Delete this domain?",
      verificationMethod: "Verification Method",
      dnsTxt: "DNS TXT Record",
      dnsCname: "DNS CNAME Record",
      httpFile: "HTTP File",
      instructions: "Verification Instructions",
      addRecord: "Add the following record to your DNS settings:",
      recordType: "Record Type",
      recordName: "Record Name",
      recordValue: "Value",
      copyValue: "Copy Value",
      quota: "Quota",
      used: "Used",
      of: "of",
      primary: "Primary",
      makePrimary: "Make Primary",
      ssl: "SSL Certificate",
      sslActive: "SSL Active",
      sslPending: "SSL Pending",
      autoRenew: "Auto Renew",
    },
    aiSovereignty: {
      title: "AI Sovereignty Layer",
      subtitle: "Complete control over all AI operations",
      layers: "AI Layers",
      powerControl: "Power Control",
      externalProviders: "External Providers",
      subscriberLimits: "Subscriber Limits",
      killSwitch: "Kill Switch",
      auditLogs: "Audit Logs",
      constitution: "AI Constitution",
      newLayer: "New Layer",
      activateKillSwitch: "Activate Kill Switch",
      deactivateKillSwitch: "Deactivate Kill Switch",
      globalStop: "Global Stop",
      externalStop: "External Providers Stop",
      layerStop: "Layer-Specific Stop",
      governance: {
        title: "Sovereign Governance",
        subtitle: "Final Sovereign Directive - Full Control",
        status: "System Status",
        valid: "System Ready for Operation",
        invalid: "System Needs Configuration",
        checks: "Completeness Checks",
        passed: "Passed",
        failed: "Failed",
        pendingApprovals: "Pending Approvals",
        noApprovals: "No pending approvals",
        approve: "Approve",
        reject: "Reject",
        hierarchy: "Sovereignty Hierarchy",
        owner: "Owner",
        governanceSystem: "Governance System",
        human: "Human",
        ai: "Artificial Intelligence",
        safeRollback: "Safe Rollback",
        triggerRollback: "Trigger Safe Rollback",
        rollbackWarning: "This will immediately stop all AI operations",
        directive: "Sovereign Directive",
      },
      powerLevels: {
        minimal: "Minimal",
        low: "Low",
        medium: "Medium",
        high: "High",
        maximum: "Maximum",
        unlimited: "Unlimited",
      },
      layerTypes: {
        internal: "Internal Sovereign",
        external: "External Managed",
        hybrid: "Hybrid",
        restricted: "Subscriber Restricted",
      },
      constitutionRules: {
        noAIWithoutLayer: "No AI without Layer",
        noAIWithoutLimits: "No AI without Limits",
        noUndefinedPower: "No Undefined Power",
        noExternalWithoutApproval: "No External without Owner Approval",
        noSubscriberAccessWithoutDecision: "No Subscriber Access without Owner Decision",
      },
    },
    command: {
      title: "Strategic Command Center",
      subtitle: "Send commands to your AI assistants for execution",
      newInstruction: "New Command",
      selectAssistant: "Select Assistant",
      instructionTitle: "Command Title",
      instructionContent: "Command Details",
      priority: "Priority",
      priorities: {
        low: "Low",
        normal: "Normal",
        high: "High",
        urgent: "Urgent",
      },
      category: "Category",
      categories: {
        development: "Development",
        design: "Design",
        content: "Content",
        fix: "Fix",
        improvement: "Improvement",
      },
      requireApproval: "Requires Approval",
      send: "Send Command",
      recentInstructions: "Recent Commands",
      noInstructions: "No commands yet",
    },
    assistants: {
      title: "AI Assistant Team",
      subtitle: "AI assistants working under your command",
      createNew: "Create New Assistant",
      specialties: {
        development: "Development",
        design: "Design",
        content: "Content",
        analytics: "Analytics",
        security: "Security",
      },
      tasksCompleted: "Tasks Completed",
      successRate: "Success Rate",
      active: "Active",
      inactive: "Inactive",
      sendCommand: "Send Command",
    },
    platform: {
      title: "Platform Settings",
      subtitle: "Complete control of system settings",
      general: "General",
      platformName: "Platform Name",
      platformNameAr: "Platform Name (Arabic)",
      primaryDomain: "Primary Domain",
      supportEmail: "Support Email",
      defaultLanguage: "Default Language",
      maintenance: "Maintenance Mode",
      registrationEnabled: "Registration Open",
      announcement: "Global Announcement",
      announcementAr: "Global Announcement (Arabic)",
      save: "Save Settings",
    },
    users: {
      title: "Sovereign User Management",
      subtitle: "View and manage all platform users with full governance",
      totalUsers: "Total Users",
      activeUsers: "Active Users",
      paidUsers: "Paid Users",
      suspendedUsers: "Suspended Users",
      bannedUsers: "Banned Users",
      suspend: "Suspend",
      ban: "Ban",
      reactivate: "Reactivate",
      permissions: "Permissions",
      statusActive: "Active",
      statusSuspended: "Suspended",
      statusBanned: "Banned",
      statusPending: "Pending",
      statusDeactivated: "Deactivated",
      reasonRequired: "Reason is required",
      enterReason: "Enter reason for action",
      confirmSuspend: "Are you sure you want to suspend this user?",
      confirmBan: "Are you sure you want to permanently ban this user?",
      confirmReactivate: "Are you sure you want to reactivate this user?",
      lastLogin: "Last Login",
      failedAttempts: "Failed Attempts",
    },
    logs: {
      title: "Audit Logs",
      subtitle: "Track all activities and changes",
      noLogs: "No logs available",
    },
    payments: {
      title: "Payment Control Center",
      subtitle: "Manage and activate multiple payment gateways",
      initialize: "Initialize Payment Methods",
      noMethods: "No payment methods. Click initialize to add them.",
      active: "Active",
      inactive: "Inactive",
      configured: "Configured",
      notConfigured: "Not Configured",
      sandbox: "Sandbox Mode",
      production: "Production Mode",
      configure: "Configure",
      toggle: "Toggle Status",
      delete: "Delete",
      currencies: "Supported Currencies",
      countries: "Supported Countries",
      fees: "Fees",
      analytics: {
        title: "Payment Analytics",
        totalRevenue: "Total Revenue",
        totalTransactions: "Total Transactions",
        successRate: "Success Rate",
        activeGateways: "Active Gateways",
      },
    },
    auth: {
      title: "Login Methods Control",
      subtitle: "Activate and manage user login methods",
      initialize: "Initialize Login Methods",
      noMethods: "No login methods. Click initialize to add them.",
      active: "Active",
      inactive: "Inactive",
      visible: "Visible",
      hidden: "Hidden",
      default: "Default",
      configured: "Configured",
      notConfigured: "Not Configured",
      toggleActive: "Toggle Active",
      toggleVisibility: "Toggle Visibility",
      delete: "Delete",
      cannotModifyDefault: "Cannot modify default method",
      methods: {
        email_password: "Email & Password",
        otp_email: "Email OTP",
        google: "Google",
        facebook: "Facebook",
        twitter: "X (Twitter)",
        github: "GitHub",
        apple: "Apple",
        microsoft: "Microsoft",
        magic_link: "Magic Link",
        otp_sms: "SMS OTP",
      },
    },
    stats: {
      totalUsers: "Total Users",
      activeProjects: "Active Projects",
      aiGenerations: "AI Generations",
      revenue: "Revenue",
    },
    status: {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
      failed: "Failed",
    },
    sovereign: {
      title: "Sovereign AI Assistants",
      subtitle: "Platform-level AI agents executing the owner's strategic intent",
      initialize: "Initialize Sovereign Assistants",
      noAssistants: "Sovereign assistants have not been initialized yet.",
      issueCommand: "Issue Command",
      viewLogs: "View Logs",
      types: {
        ai_governor: "AI Governor",
        platform_architect: "Platform Architect",
        operations_commander: "Operations Commander",
        security_guardian: "Security & Compliance Guardian",
        growth_strategist: "Business & Growth Strategist",
      },
      capabilities: "Capabilities",
      constraints: "Constraints",
      scope: "Scope of Authority",
      autonomy: "Autonomy",
      autonomousMode: "Autonomous Mode",
      manualMode: "Manual Mode",
      active: "Active",
      inactive: "Inactive",
      commandQueue: "Command Queue",
      commandStatus: {
        pending: "Pending",
        approved: "Approved",
        executing: "Executing",
        completed: "Completed",
        failed: "Failed",
        cancelled: "Cancelled",
        rolled_back: "Rolled Back",
      },
      approve: "Approve",
      cancel: "Cancel",
      rollback: "Rollback",
      recentActivity: "Recent Activity",
      noActivity: "No activity yet",
      // Platform State Overview
      platformState: "Platform State Overview",
      healthScore: "Health Score",
      healthStatus: {
        healthy: "Healthy",
        degraded: "Degraded",
        critical: "Critical",
        emergency: "Emergency",
      },
      systemStatus: "System Status",
      servicesOperational: "Services Operational",
      // Simulation Mode
      simulationMode: "Simulation Mode",
      runSimulation: "Run Simulation",
      simulationDescription: "Preview command impact without live execution",
      projectedImpact: "Projected Impact",
      affectedEntities: "Affected Entities",
      riskScore: "Risk Score",
      recommendations: "Recommendations",
      // Emergency Controls
      emergencyControls: "Emergency Controls",
      emergencyDescription: "Platform-wide kill switches and safety mechanisms",
      activateEmergency: "Activate Emergency Control",
      deactivateEmergency: "Deactivate",
      emergencyTypes: {
        ai_suspension: "AI Services Suspension",
        platform_lockdown: "Platform Lockdown",
        feature_disable: "Feature Disable",
      },
      noActiveEmergency: "No active emergency controls",
    },
  },
};

const paymentProviderIcons: Record<string, any> = {
  stripe: CreditCard,
  paypal: Wallet,
  tap: Smartphone,
  mada: CreditCard,
  apple_pay: Smartphone,
  google_pay: Smartphone,
  stc_pay: Wallet,
  bank_transfer: Building,
  crypto: Bitcoin,
};

const specialtyIcons: Record<string, any> = {
  development: Code,
  design: Paintbrush,
  content: FileText,
  analytics: BarChart3,
  security: Shield,
};

const specialtyColors: Record<string, string> = {
  development: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  design: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  content: "bg-green-500/10 text-green-600 dark:text-green-400",
  analytics: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  security: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const sovereignAssistantIcons: Record<string, any> = {
  ai_governor: Sparkles,
  platform_architect: Building,
  operations_commander: Shield,
  security_guardian: Shield,
  growth_strategist: TrendingUp,
};

const sovereignAssistantColors: Record<string, string> = {
  ai_governor: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
  platform_architect: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  operations_commander: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  security_guardian: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
  growth_strategist: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

// Domain types from schema
interface DomainRecord {
  id: string;
  tenantId: string;
  hostname: string;
  status: string;
  verificationMethod: string;
  verificationToken: string | null;
  verifiedAt: Date | null;
  isPrimary: boolean;
  createdAt: Date;
  createdBy: string;
}

interface DomainQuota {
  tenantId: string;
  tier: string;
  maxDomains: number;
  usedDomains: number;
}

interface GovernanceStatus {
  directive: string;
  valid: boolean;
  checks: { name: string; nameAr: string; passed: boolean; message: string }[];
}

interface PendingApproval {
  id: string;
  requestId: string;
  action: string;
  layerId: string;
  taskType: string;
  impactLevel: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

// Governance Section Component
function GovernanceSection({ t, language }: { t: typeof translations.ar; language: 'ar' | 'en' }) {
  const { toast } = useToast();
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [rollbackReason, setRollbackReason] = useState("");

  const { data: governanceStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<GovernanceStatus>({
    queryKey: ['/api/governance/status'],
  });

  const { data: pendingApprovals = [], refetch: refetchApprovals } = useQuery<PendingApproval[]>({
    queryKey: ['/api/governance/approvals'],
  });

  const { data: killSwitches = [] } = useQuery<any[]>({
    queryKey: ['/api/ai-kill-switches'],
  });

  const activateKillSwitchMutation = useMutation({
    mutationFn: async (data: { scope: string; reason: string; reasonAr: string }) => {
      return apiRequest('POST', '/api/governance/kill-switch/activate', data);
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تم تفعيل زر الطوارئ' : 'Kill switch activated' });
      refetchStatus();
      queryClient.invalidateQueries({ queryKey: ['/api/ai-kill-switches'] });
    },
  });

  const processApprovalMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: 'approve' | 'reject' }) => {
      return apiRequest('POST', `/api/governance/approvals/${id}/decide`, { decision });
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تمت معالجة الموافقة' : 'Approval processed' });
      refetchApprovals();
    },
  });

  const triggerRollbackMutation = useMutation({
    mutationFn: async (data: { reason: string; reasonAr: string }) => {
      return apiRequest('POST', '/api/governance/safe-rollback', data);
    },
    onSuccess: () => {
      toast({ 
        title: language === 'ar' ? 'تم تفعيل التراجع الآمن' : 'Safe rollback triggered',
        variant: 'destructive',
      });
      setShowRollbackDialog(false);
      refetchStatus();
    },
  });

  const hierarchyItems = [
    { key: 'owner', icon: Crown, color: 'text-yellow-500' },
    { key: 'governanceSystem', icon: Shield, color: 'text-blue-500' },
    { key: 'human', icon: UserIcon, color: 'text-green-500' },
    { key: 'ai', icon: Bot, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t.aiSovereignty.governance.title}
            </CardTitle>
            <CardDescription>{t.aiSovereignty.governance.subtitle}</CardDescription>
          </div>
          <Badge variant={governanceStatus?.valid ? 'default' : 'destructive'}>
            {governanceStatus?.directive || 'LOADING'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sovereignty Hierarchy */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t.aiSovereignty.governance.hierarchy}</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {hierarchyItems.map((item, index) => (
                <div key={item.key} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t.aiSovereignty.governance[item.key as keyof typeof t.aiSovereignty.governance]}
                    </span>
                  </div>
                  {index < hierarchyItems.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t.aiSovereignty.governance.status}</h4>
            {statusLoading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 p-3 rounded-md ${governanceStatus?.valid ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                  {governanceStatus?.valid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  <span className="font-medium">
                    {governanceStatus?.valid ? t.aiSovereignty.governance.valid : t.aiSovereignty.governance.invalid}
                  </span>
                </div>
                
                <div className="grid gap-2">
                  {governanceStatus?.checks.map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="text-sm">{language === 'ar' ? check.nameAr : check.name}</span>
                      <Badge variant={check.passed ? 'default' : 'destructive'} className="text-xs">
                        {check.passed ? t.aiSovereignty.governance.passed : t.aiSovereignty.governance.failed}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kill Switch Controls */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t.aiSovereignty.killSwitch}</h4>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => activateKillSwitchMutation.mutate({ 
                  scope: 'global', 
                  reason: 'Manual activation', 
                  reasonAr: 'تفعيل يدوي' 
                })}
                disabled={activateKillSwitchMutation.isPending}
                data-testid="button-kill-switch-global"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {t.aiSovereignty.globalStop}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => activateKillSwitchMutation.mutate({ 
                  scope: 'external_only', 
                  reason: 'External providers stopped', 
                  reasonAr: 'إيقاف المزودين الخارجيين' 
                })}
                disabled={activateKillSwitchMutation.isPending}
                data-testid="button-kill-switch-external"
              >
                <Zap className="w-4 h-4 mr-2" />
                {t.aiSovereignty.externalStop}
              </Button>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t.aiSovereignty.governance.pendingApprovals}</h4>
            {pendingApprovals.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                {t.aiSovereignty.governance.noApprovals}
              </div>
            ) : (
              <div className="space-y-2">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <span className="font-medium">{approval.action}</span>
                      <span className="text-sm text-muted-foreground ml-2">({approval.impactLevel})</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => processApprovalMutation.mutate({ id: approval.id, decision: 'approve' })}
                        data-testid={`button-approve-${approval.id}`}
                      >
                        {t.aiSovereignty.governance.approve}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => processApprovalMutation.mutate({ id: approval.id, decision: 'reject' })}
                        data-testid={`button-reject-${approval.id}`}
                      >
                        {t.aiSovereignty.governance.reject}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safe Rollback */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t.aiSovereignty.governance.safeRollback}</h4>
            <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" data-testid="button-safe-rollback">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t.aiSovereignty.governance.triggerRollback}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t.aiSovereignty.governance.triggerRollback}</DialogTitle>
                  <DialogDescription>{t.aiSovereignty.governance.rollbackWarning}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label>{language === 'ar' ? 'سبب التراجع' : 'Rollback Reason'}</Label>
                  <Input
                    value={rollbackReason}
                    onChange={(e) => setRollbackReason(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل السبب...' : 'Enter reason...'}
                    data-testid="input-rollback-reason"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRollbackDialog(false)}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => triggerRollbackMutation.mutate({ 
                      reason: rollbackReason || 'Manual rollback', 
                      reasonAr: rollbackReason || 'تراجع يدوي' 
                    })}
                    disabled={triggerRollbackMutation.isPending}
                    data-testid="button-confirm-rollback"
                  >
                    {triggerRollbackMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : t.aiSovereignty.governance.triggerRollback}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Usage Analytics Section Component
function UsageAnalyticsSection({ t, language }: { t: typeof translations.ar; language: 'ar' | 'en' }) {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showLimitsDialog, setShowLimitsDialog] = useState(false);
  const [limitsForm, setLimitsForm] = useState({
    monthlyLimitUSD: 100,
    autoSuspendOnLimit: false,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<{
    totalRealCostUSD: number;
    totalBilledCostUSD: number;
    margin: number;
    top5Users: Array<{ userId: string; email: string; totalRealCost: number; totalBilledCost: number }>;
    losingUsers: Array<{ userId: string; email: string; loss: number }>;
    profitByService: Array<{ service: string; profit: number; totalBilled: number; totalCost: number }>;
  }>({
    queryKey: ['/api/owner/usage-analytics'],
  });

  const { data: usersWithLocations = [], isLoading: locationsLoading } = useQuery<Array<{
    userId: string;
    email: string;
    username: string;
    countryCode: string;
    countryName: string;
    city: string;
    lastUpdatedAt: string;
  }>>({
    queryKey: ['/api/owner/users-with-locations'],
  });

  const setLimitsMutation = useMutation({
    mutationFn: async (data: { userId: string; monthlyLimitUSD: number; autoSuspendOnLimit: boolean }) => {
      return apiRequest('POST', `/api/owner/users/${data.userId}/usage-limits`, {
        monthlyLimitUSD: data.monthlyLimitUSD,
        autoSuspendOnLimit: data.autoSuspendOnLimit,
      });
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تم تحديد الحدود' : 'Limits set successfully' });
      setShowLimitsDialog(false);
    },
    onError: (error: any) => {
      toast({ title: error.message || 'Error', variant: 'destructive' });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-today-cost">
          <CardHeader className="pb-2">
            <CardDescription>{t.usageAnalytics.todayCost}</CardDescription>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400" data-testid="text-today-cost-value">
              {analyticsLoading ? '...' : formatCurrency(analytics?.totalRealCostUSD || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-today-billed">
          <CardHeader className="pb-2">
            <CardDescription>{t.usageAnalytics.todayBilled}</CardDescription>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400" data-testid="text-today-billed-value">
              {analyticsLoading ? '...' : formatCurrency(analytics?.totalBilledCostUSD || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card data-testid="card-today-margin">
          <CardHeader className="pb-2">
            <CardDescription>{t.usageAnalytics.todayMargin}</CardDescription>
            <CardTitle className="text-2xl" data-testid="text-today-margin-value">
              {analyticsLoading ? '...' : `${((analytics?.margin || 0) * 100).toFixed(1)}%`}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Top 5 Users and Losing Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t.usageAnalytics.top5Users}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
              </div>
            ) : (analytics?.top5Users?.length || 0) > 0 ? (
              <div className="space-y-3">
                {analytics?.top5Users?.map((user, index) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`row-top-user-${index}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm">{user.email}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(user.totalBilledCost)}</p>
                      <p className="text-xs text-muted-foreground">{t.usageAnalytics.realCost}: {formatCurrency(user.totalRealCost)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t.usageAnalytics.noData}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Losing Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              {t.usageAnalytics.losingUsers}
            </CardTitle>
            <CardDescription>{t.usageAnalytics.losingUsersDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
              </div>
            ) : (analytics?.losingUsers?.length || 0) > 0 ? (
              <div className="space-y-3">
                {analytics?.losingUsers?.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg border border-destructive/30 bg-destructive/5" data-testid={`row-losing-user-${user.userId}`}>
                    <span className="text-sm">{user.email}</span>
                    <Badge variant="destructive">
                      {t.usageAnalytics.loss}: {formatCurrency(user.loss)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                <p>{language === 'ar' ? 'لا يوجد مستخدمون خاسرون' : 'No losing users'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profit by Service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t.usageAnalytics.profitByService}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
            </div>
          ) : (analytics?.profitByService?.length || 0) > 0 ? (
            <div className="space-y-3">
              {analytics?.profitByService?.map((service) => (
                <div key={service.service} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`row-service-${service.service}`}>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{service.service}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t.usageAnalytics.billedCost}</p>
                      <p className="text-sm">{formatCurrency(service.totalBilled)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t.usageAnalytics.realCost}</p>
                      <p className="text-sm">{formatCurrency(service.totalCost)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t.usageAnalytics.margin}</p>
                      <p className={`text-sm font-medium ${service.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(service.profit)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t.usageAnalytics.noData}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users with Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="w-5 h-5" />
            {t.usageAnalytics.usersWithLocations}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locationsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-2" />
            </div>
          ) : usersWithLocations.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {usersWithLocations.map((user) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg border hover-elevate" data-testid={`row-location-${user.userId}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                        {user.countryCode || '??'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.email || user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.city ? `${user.city}, ` : ''}{user.countryName || user.countryCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {user.lastUpdatedAt ? new Date(user.lastUpdatedAt).toLocaleDateString() : '-'}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedUserId(user.userId);
                          setShowLimitsDialog(true);
                        }}
                        data-testid={`button-set-limits-${user.userId}`}
                      >
                        {t.usageAnalytics.setLimits}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Globe2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t.usageAnalytics.noData}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set Limits Dialog */}
      <Dialog open={showLimitsDialog} onOpenChange={setShowLimitsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.usageAnalytics.setLimits}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t.usageAnalytics.monthlyLimit} (USD)</Label>
              <Input
                type="number"
                value={limitsForm.monthlyLimitUSD}
                onChange={(e) => setLimitsForm({ ...limitsForm, monthlyLimitUSD: parseFloat(e.target.value) || 0 })}
                data-testid="input-monthly-limit"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={limitsForm.autoSuspendOnLimit}
                onCheckedChange={(checked) => setLimitsForm({ ...limitsForm, autoSuspendOnLimit: checked })}
                data-testid="switch-auto-suspend"
              />
              <Label>{t.usageAnalytics.autoSuspend}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLimitsDialog(false)} data-testid="button-cancel-limits">
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={() => selectedUserId && setLimitsMutation.mutate({
                userId: selectedUserId,
                monthlyLimitUSD: limitsForm.monthlyLimitUSD,
                autoSuspendOnLimit: limitsForm.autoSuspendOnLimit,
              })}
              disabled={setLimitsMutation.isPending}
              data-testid="button-confirm-limits"
            >
              {setLimitsMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : (language === 'ar' ? 'حفظ' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Domains Section Component
function DomainsSection({ t, language }: { t: typeof translations.ar; language: 'ar' | 'en' }) {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainRecord | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [newDomainForm, setNewDomainForm] = useState({
    hostname: "",
    verificationMethod: "dns_txt",
    isPrimary: false,
    tenantId: "",
  });

  const { data: domains = [], isLoading: domainsLoading } = useQuery<DomainRecord[]>({
    queryKey: ['/api/domains'],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: quota } = useQuery<DomainQuota>({
    queryKey: ['/api/domains/quota', selectedTenantId],
    enabled: !!selectedTenantId,
  });

  const createDomainMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/domains', data);
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تم إضافة النطاق' : 'Domain added' });
      setShowAddDialog(false);
      setNewDomainForm({ hostname: "", verificationMethod: "dns_txt", isPrimary: false, tenantId: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
    },
    onError: (error: any) => {
      toast({ title: error.message || 'Error', variant: 'destructive' });
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/domains/${id}`);
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تم حذف النطاق' : 'Domain deleted' });
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('POST', `/api/domains/${id}/verify`);
    },
    onSuccess: () => {
      toast({ title: language === 'ar' ? 'تم التحقق من النطاق' : 'Domain verified' });
      setShowVerifyDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/domains'] });
    },
    onError: () => {
      toast({ title: language === 'ar' ? 'فشل التحقق' : 'Verification failed', variant: 'destructive' });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: language === 'ar' ? 'تم النسخ' : 'Copied' });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: language === 'ar' ? 'نشط' : 'Active', variant: 'default' },
      verified: { label: t.domains.verified, variant: 'default' },
      pending_verification: { label: t.domains.pending, variant: 'secondary' },
      ssl_pending: { label: t.domains.sslPending, variant: 'secondary' },
      ssl_issued: { label: t.domains.sslActive, variant: 'default' },
    };
    const config = statusConfig[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="w-5 h-5" />
              {t.domains.title}
            </CardTitle>
            <CardDescription>{t.domains.subtitle}</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-domain">
                <Plus className="w-4 h-4 mr-2" />
                {t.domains.addDomain}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.domains.addDomain}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'المستأجر' : 'Tenant'}</Label>
                  <Select
                    value={newDomainForm.tenantId}
                    onValueChange={(value) => {
                      setNewDomainForm({ ...newDomainForm, tenantId: value });
                      setSelectedTenantId(value);
                    }}
                  >
                    <SelectTrigger data-testid="select-tenant">
                      <SelectValue placeholder={language === 'ar' ? 'اختر المستأجر' : 'Select tenant'} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName || user.username || user.email} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {quota && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{t.domains.quota}:</span>
                      <Badge variant={quota.usedDomains >= quota.maxDomains ? 'destructive' : 'secondary'}>
                        {quota.usedDomains} / {quota.maxDomains}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t.domains.hostname}</Label>
                  <Input
                    placeholder={t.domains.hostnamePlaceholder}
                    value={newDomainForm.hostname}
                    onChange={(e) => setNewDomainForm({ ...newDomainForm, hostname: e.target.value })}
                    data-testid="input-domain-hostname"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.domains.verificationMethod}</Label>
                  <Select
                    value={newDomainForm.verificationMethod}
                    onValueChange={(value) => setNewDomainForm({ ...newDomainForm, verificationMethod: value })}
                  >
                    <SelectTrigger data-testid="select-verification-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dns_txt">{t.domains.dnsTxt}</SelectItem>
                      <SelectItem value="dns_cname">{t.domains.dnsCname}</SelectItem>
                      <SelectItem value="http_file">{t.domains.httpFile}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newDomainForm.isPrimary}
                    onCheckedChange={(checked) => setNewDomainForm({ ...newDomainForm, isPrimary: checked })}
                    data-testid="switch-primary-domain"
                  />
                  <Label>{t.domains.makePrimary}</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={() => createDomainMutation.mutate(newDomainForm)}
                  disabled={!newDomainForm.hostname || !newDomainForm.tenantId || createDomainMutation.isPending || (quota && quota.usedDomains >= quota.maxDomains)}
                  data-testid="button-submit-domain"
                >
                  {createDomainMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : t.domains.addDomain}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {domainsLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد نطاقات مسجلة' : 'No domains registered'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((domain: any) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`domain-item-${domain.id}`}
                >
                  <div className="flex items-center gap-4">
                    <Globe2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{domain.hostname}</span>
                        {domain.isPrimary && (
                          <Badge variant="outline" className="text-xs">{t.domains.primary}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(domain.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(domain.status)}
                    {domain.status === 'pending_verification' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDomain(domain);
                          setShowVerifyDialog(true);
                        }}
                        data-testid={`button-verify-${domain.id}`}
                      >
                        {t.domains.verifyNow}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(t.domains.deleteConfirm)) {
                          deleteDomainMutation.mutate(domain.id);
                        }
                      }}
                      data-testid={`button-delete-domain-${domain.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.domains.instructions}</DialogTitle>
            <DialogDescription>
              {selectedDomain?.hostname}
            </DialogDescription>
          </DialogHeader>
          {selectedDomain && (
            <div className="space-y-4 py-4">
              <p className="text-sm">{t.domains.addRecord}</p>
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t.domains.recordType}:</span>
                  <Badge variant="outline">TXT</Badge>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t.domains.recordName}:</span>
                  <code className="text-xs bg-background px-2 py-1 rounded">
                    _infera-verify.{selectedDomain.hostname}
                  </code>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">{t.domains.recordValue}:</span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-background px-2 py-1 rounded break-all">
                      {selectedDomain.verificationToken}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(selectedDomain.verificationToken || '')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
            <Button
              onClick={() => selectedDomain && verifyDomainMutation.mutate(selectedDomain.id)}
              disabled={verifyDomainMutation.isPending}
              data-testid="button-confirm-verify"
            >
              {verifyDomainMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t.domains.verifyNow}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OwnerDashboard() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("command");
  const [showNewInstructionDialog, setShowNewInstructionDialog] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<string>("");
  const [instructionForm, setInstructionForm] = useState({
    title: "",
    instruction: "",
    priority: "normal",
    category: "development",
    approvalRequired: true,
  });

  // AI Sovereignty Form States
  const [showNewLayerDialog, setShowNewLayerDialog] = useState(false);
  const [showKillSwitchDialog, setShowKillSwitchDialog] = useState(false);
  const [newLayerForm, setNewLayerForm] = useState({
    name: "",
    nameAr: "",
    purpose: "",
    purposeAr: "",
    type: "INTERNAL_SOVEREIGN",
    priority: 5,
    allowedForSubscribers: false,
    subscriberVisibility: "hidden",
  });
  const [killSwitchForm, setKillSwitchForm] = useState({
    scope: "global",
    reason: "",
    reasonAr: "",
    targetLayerId: "",
  });
  
  // Direct Assistant Command Dialog
  const [showDirectCommandDialog, setShowDirectCommandDialog] = useState(false);
  const [directCommandAssistant, setDirectCommandAssistant] = useState<any>(null);
  const [directCommandForm, setDirectCommandForm] = useState({
    command: "",
    mode: "AUTO" as "AUTO" | "MANUAL",
    preferredModel: "claude-sonnet-4-20250514",
  });
  
  const [showPowerConfigDialog, setShowPowerConfigDialog] = useState(false);
  const [selectedLayerForPower, setSelectedLayerForPower] = useState<any>(null);
  const [powerConfigForm, setPowerConfigForm] = useState({
    powerLevel: 5,
    maxTokensPerRequest: 4096,
    maxRequestsPerMinute: 60,
    maxConcurrentRequests: 10,
    cpuAllocation: "standard",
    memoryAllocation: "standard",
    costPerRequest: 0,
    monthlyBudgetLimit: null as number | null,
  });

  const { data: assistants = [], isLoading: assistantsLoading } = useQuery<AiAssistant[]>({
    queryKey: ['/api/owner/assistants'],
  });

  const { data: instructions = [] } = useQuery<AssistantInstruction[]>({
    queryKey: ['/api/owner/instructions'],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<Omit<User, 'password'>[]>({
    queryKey: ['/api/owner/users'],
  });

  const { data: userStats } = useQuery<{
    totalUsers: number;
    activeUsers: number;
    paidUsers: number;
    freeUsers: number;
    byRole: Record<string, number>;
  }>({
    queryKey: ['/api/owner/users/stats'],
  });

  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/owner/payment-methods'],
  });

  const { data: paymentAnalytics } = useQuery<any>({
    queryKey: ['/api/owner/payment-analytics'],
  });

  const { data: authMethods = [], isLoading: authMethodsLoading } = useQuery<AuthMethod[]>({
    queryKey: ['/api/owner/auth-methods'],
  });

  const { data: sovereignAssistants = [], isLoading: sovereignAssistantsLoading } = useQuery<SovereignAssistant[]>({
    queryKey: ['/api/owner/sovereign-assistants'],
  });

  const { data: sovereignCommands = [] } = useQuery<SovereignCommand[]>({
    queryKey: ['/api/owner/sovereign-commands'],
  });

  const { data: sovereignLogs = [] } = useQuery<SovereignActionLog[]>({
    queryKey: ['/api/owner/sovereign-logs'],
  });

  const { data: platformState } = useQuery<any>({
    queryKey: ['/api/owner/platform-state'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: emergencyControls = [] } = useQuery<any[]>({
    queryKey: ['/api/owner/emergency-controls'],
  });

  // AI Sovereignty Layer Queries
  const { data: aiLayers = [], isLoading: aiLayersLoading } = useQuery<any[]>({
    queryKey: ['/api/owner/ai-sovereignty/layers'],
  });

  const { data: aiPowerConfigs = [] } = useQuery<any[]>({
    queryKey: ['/api/owner/ai-sovereignty/power-configs'],
  });

  const { data: aiExternalProviders = [] } = useQuery<any[]>({
    queryKey: ['/api/owner/ai-sovereignty/external-providers'],
  });

  const { data: aiKillSwitch } = useQuery<any>({
    queryKey: ['/api/owner/ai-sovereignty/kill-switch'],
  });

  const { data: aiAuditLogs = [], isLoading: aiAuditLogsLoading } = useQuery<any[]>({
    queryKey: ['/api/owner/ai-sovereignty/audit-logs'],
  });

  // AI Agent Executor Queries (cost tracking, task history)
  const { data: aiCostAnalytics } = useQuery<{
    totalRealCost: number;
    totalBilledCost: number;
    margin: number;
    byModel: { model: string; cost: number; billed: number; tasks: number }[];
    byAssistant: { assistantId: string; cost: number; billed: number; tasks: number }[];
  }>({
    queryKey: ['/api/owner/ai/cost-analytics'],
  });

  const { data: aiTaskHistory = [] } = useQuery<any[]>({
    queryKey: ['/api/owner/ai/task-history'],
  });

  const { data: aiGlobalKillSwitch } = useQuery<{ globalActive: boolean; reason?: string }>({
    queryKey: ['/api/owner/ai/kill-switch'],
  });

  // AI Sovereignty Mutations
  const createAiLayerMutation = useMutation({
    mutationFn: async (data: typeof newLayerForm) => {
      return apiRequest('POST', '/api/owner/ai-sovereignty/layers', {
        name: data.name,
        nameAr: data.nameAr,
        purpose: data.purpose,
        purposeAr: data.purposeAr || data.purpose,
        type: data.type,
        status: 'active',
        priority: data.priority,
        allowedForSubscribers: data.allowedForSubscribers,
        subscriberVisibility: data.subscriberVisibility,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai-sovereignty/layers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai-sovereignty/audit-logs'] });
      setShowNewLayerDialog(false);
      setNewLayerForm({
        name: "", nameAr: "", purpose: "", purposeAr: "",
        type: "INTERNAL_SOVEREIGN", priority: 5,
        allowedForSubscribers: false, subscriberVisibility: "hidden",
      });
      toast({
        title: language === 'ar' ? "تمت الإضافة" : "Layer Created",
        description: language === 'ar' ? "تم إنشاء طبقة ذكاء جديدة" : "New AI layer has been created",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activateKillSwitchMutation = useMutation({
    mutationFn: async (data: typeof killSwitchForm) => {
      return apiRequest('POST', '/api/owner/ai-sovereignty/kill-switch/activate', {
        scope: data.scope,
        reason: data.reason,
        reasonAr: data.reasonAr || data.reason,
        targetLayerId: data.scope === 'layer_specific' ? data.targetLayerId : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai-sovereignty/kill-switch'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai-sovereignty/audit-logs'] });
      setShowKillSwitchDialog(false);
      setKillSwitchForm({ scope: "global", reason: "", reasonAr: "", targetLayerId: "" });
      toast({
        title: language === 'ar' ? "تم التفعيل" : "Kill Switch Activated",
        description: language === 'ar' ? "تم تفعيل زر الطوارئ" : "Kill switch has been activated",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deactivateKillSwitchMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/owner/ai-sovereignty/kill-switch/deactivate', {
        scope: 'global',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai-sovereignty/kill-switch'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai-sovereignty/audit-logs'] });
      toast({
        title: language === 'ar' ? "تم الإلغاء" : "Kill Switch Deactivated",
        description: language === 'ar' ? "تم إلغاء تفعيل زر الطوارئ" : "Kill switch has been deactivated",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPowerConfigMutation = useMutation({
    mutationFn: async (data: { layerId: string } & typeof powerConfigForm) => {
      return apiRequest('POST', '/api/owner/ai-sovereignty/power-configs', {
        layerId: data.layerId,
        powerLevel: Math.max(1, Math.min(10, data.powerLevel || 5)),
        maxTokensPerRequest: Math.max(1, data.maxTokensPerRequest || 4096),
        maxRequestsPerMinute: Math.max(1, data.maxRequestsPerMinute || 60),
        maxConcurrentRequests: Math.max(1, data.maxConcurrentRequests || 10),
        cpuAllocation: data.cpuAllocation || 'standard',
        memoryAllocation: data.memoryAllocation || 'standard',
        costPerRequest: Math.max(0, data.costPerRequest || 0),
        monthlyBudgetLimit: data.monthlyBudgetLimit && !isNaN(data.monthlyBudgetLimit) ? data.monthlyBudgetLimit : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai-sovereignty/power-configs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai-sovereignty/audit-logs'] });
      setShowPowerConfigDialog(false);
      setSelectedLayerForPower(null);
      setPowerConfigForm({
        powerLevel: 5, maxTokensPerRequest: 4096, maxRequestsPerMinute: 60,
        maxConcurrentRequests: 10, cpuAllocation: "standard", memoryAllocation: "standard",
        costPerRequest: 0, monthlyBudgetLimit: null,
      });
      toast({
        title: language === 'ar' ? "تم الحفظ" : "Power Config Saved",
        description: language === 'ar' ? "تم حفظ تكوين القوة" : "Power configuration has been saved",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check if global kill switch is active
  const isGlobalKillSwitchActive = Array.isArray(aiKillSwitch) 
    ? aiKillSwitch.some((ks: any) => ks.scope === 'global' && ks.isActive)
    : aiKillSwitch?.isActive;

  // AI Agent Executor Kill Switch mutations
  const activateAgentKillSwitchMutation = useMutation({
    mutationFn: async (data: { scope: string; targetId?: string; reason: string }) => {
      return apiRequest('POST', '/api/owner/ai/kill-switch/activate', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai/kill-switch'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai/task-history'] });
      toast({
        title: language === 'ar' ? "تم تفعيل Kill Switch" : "Kill Switch Activated",
        description: language === 'ar' ? "تم إيقاف جميع عمليات AI" : "All AI operations have been stopped",
        variant: "destructive",
      });
    },
  });

  const deactivateAgentKillSwitchMutation = useMutation({
    mutationFn: async (data: { scope: string; targetId?: string }) => {
      return apiRequest('POST', '/api/owner/ai/kill-switch/deactivate', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai/kill-switch'] });
      toast({
        title: language === 'ar' ? "تم إلغاء Kill Switch" : "Kill Switch Deactivated",
        description: language === 'ar' ? "تم استئناف عمليات AI" : "AI operations have been resumed",
      });
    },
  });

  const initializeSovereignAssistantsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/owner/initialize-sovereign-assistants');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-assistants'] });
      toast({
        title: language === 'ar' ? "تم تهيئة المساعدين السياديين" : "Sovereign Assistants Initialized",
        description: language === 'ar' ? "تمت إضافة جميع المساعدين السياديين بنجاح" : "All sovereign assistants have been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSovereignAssistantMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/owner/sovereign-assistants/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-assistants'] });
    },
  });

  const toggleSovereignAutonomyMutation = useMutation({
    mutationFn: async ({ id, isAutonomous }: { id: string; isAutonomous: boolean }) => {
      return apiRequest('PATCH', `/api/owner/sovereign-assistants/${id}/autonomy`, { isAutonomous });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-assistants'] });
      toast({
        title: language === 'ar' ? "تم تحديث الاستقلالية" : "Autonomy Updated",
        description: language === 'ar' ? "تم تحديث وضع الاستقلالية" : "Autonomy mode has been updated",
      });
    },
  });

  // Assistant-specific Kill Switch
  const toggleAssistantKillSwitchMutation = useMutation({
    mutationFn: async ({ assistantId, activate, reason }: { assistantId: string; activate: boolean; reason?: string }) => {
      return apiRequest('POST', `/api/assistants/${assistantId}/kill-switch`, { activate, reason });
    },
    onSuccess: (_, { activate }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai/kill-switch'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-assistants'] });
      toast({
        title: activate 
          ? (language === 'ar' ? "تم تفعيل Kill Switch" : "Kill Switch Activated")
          : (language === 'ar' ? "تم إلغاء Kill Switch" : "Kill Switch Deactivated"),
        description: activate
          ? (language === 'ar' ? "تم إيقاف المساعد عن التنفيذ" : "Assistant execution has been stopped")
          : (language === 'ar' ? "تم استئناف عمل المساعد" : "Assistant execution has been resumed"),
        variant: activate ? "destructive" : "default",
      });
    },
  });

  // Execute command directly on assistant
  const executeAssistantCommandMutation = useMutation({
    mutationFn: async ({ assistantId, command, mode, preferredModel }: { 
      assistantId: string; 
      command: string; 
      mode?: string;
      preferredModel?: string;
    }) => {
      const res = await apiRequest('POST', `/api/assistants/${assistantId}/execute`, { 
        command, 
        mode: mode || 'AUTO',
        preferredModel 
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai/task-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai/cost-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-assistants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assistants'] });
      
      if (data.success) {
        toast({
          title: language === 'ar' ? "تم تنفيذ الأمر بنجاح" : "Command Executed Successfully",
          description: `${language === 'ar' ? 'النموذج' : 'Model'}: ${data.model} | ${language === 'ar' ? 'الوقت' : 'Time'}: ${(data.executionTimeMs / 1000).toFixed(1)}s | ${language === 'ar' ? 'التكلفة' : 'Cost'}: $${data.cost?.billed?.toFixed(4) || '0'}`,
        });
      } else {
        toast({
          title: language === 'ar' ? "فشل التنفيذ" : "Execution Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const approveSovereignCommandMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('PATCH', `/api/owner/sovereign-commands/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-commands'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-logs'] });
      toast({
        title: language === 'ar' ? "تمت الموافقة" : "Approved",
        description: language === 'ar' ? "تمت الموافقة على الأمر" : "Command has been approved",
      });
    },
  });

  const cancelSovereignCommandMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('PATCH', `/api/owner/sovereign-commands/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-commands'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-logs'] });
      toast({
        title: language === 'ar' ? "تم الإلغاء" : "Cancelled",
        description: language === 'ar' ? "تم إلغاء الأمر" : "Command has been cancelled",
      });
    },
  });

  const rollbackSovereignCommandMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('PATCH', `/api/owner/sovereign-commands/${id}/rollback`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-commands'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-logs'] });
      toast({
        title: language === 'ar' ? "تم التراجع" : "Rolled Back",
        description: language === 'ar' ? "تم التراجع عن الأمر" : "Command has been rolled back",
      });
    },
  });

  const activateEmergencyMutation = useMutation({
    mutationFn: async (data: { type: string; scope: string; reason: string; reasonAr?: string }) => {
      return apiRequest('POST', '/api/owner/emergency-controls/activate', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/emergency-controls'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/platform-state'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-logs'] });
      toast({
        title: language === 'ar' ? "تم تفعيل ضابط الطوارئ" : "Emergency Control Activated",
        description: language === 'ar' ? "تم تفعيل ضابط الطوارئ بنجاح" : "Emergency control has been activated",
        variant: "destructive",
      });
    },
  });

  const deactivateEmergencyMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('POST', `/api/owner/emergency-controls/${id}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/emergency-controls'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/platform-state'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-logs'] });
      toast({
        title: language === 'ar' ? "تم إلغاء تفعيل الطوارئ" : "Emergency Control Deactivated",
        description: language === 'ar' ? "تم إلغاء تفعيل ضابط الطوارئ" : "Emergency control has been deactivated",
      });
    },
  });

  const initializeAuthMethodsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/owner/initialize-auth-methods');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/auth-methods'] });
      toast({
        title: language === 'ar' ? "تم تهيئة طرق الدخول" : "Login Methods Initialized",
        description: language === 'ar' ? "تمت إضافة جميع طرق الدخول بنجاح" : "All login methods have been added successfully",
      });
    },
  });

  const toggleAuthMethodMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/owner/auth-methods/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/auth-methods'] });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "لا يمكن تعديل هذه الطريقة" : "Cannot modify this method"),
        variant: "destructive",
      });
    },
  });

  const toggleAuthMethodVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      return apiRequest('PATCH', `/api/owner/auth-methods/${id}/visibility`, { isVisible });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/auth-methods'] });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "لا يمكن تعديل هذه الطريقة" : "Cannot modify this method"),
        variant: "destructive",
      });
    },
  });

  const deleteAuthMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/owner/auth-methods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/auth-methods'] });
      toast({
        title: language === 'ar' ? "تم الحذف" : "Deleted",
        description: language === 'ar' ? "تم حذف طريقة الدخول" : "Login method has been deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? "خطأ" : "Error",
        description: error.message || (language === 'ar' ? "لا يمكن حذف هذه الطريقة" : "Cannot delete this method"),
        variant: "destructive",
      });
    },
  });

  const initializePaymentMethodsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/owner/initialize-payment-methods');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/payment-methods'] });
      toast({
        title: language === 'ar' ? "تم تهيئة بوابات الدفع" : "Payment Methods Initialized",
        description: language === 'ar' ? "تمت إضافة جميع بوابات الدفع بنجاح" : "All payment gateways have been added successfully",
      });
    },
  });

  const togglePaymentMethodMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/owner/payment-methods/${id}/toggle`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['/api/owner/payment-analytics'] });
    },
  });

  const deletePaymentMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/owner/payment-methods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/payment-methods'] });
      toast({
        title: language === 'ar' ? "تم الحذف" : "Deleted",
        description: language === 'ar' ? "تم حذف طريقة الدفع" : "Payment method has been deleted",
      });
    },
  });

  const sendInstructionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/owner/instructions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/instructions'] });
      setShowNewInstructionDialog(false);
      setInstructionForm({
        title: "",
        instruction: "",
        priority: "normal",
        category: "development",
        approvalRequired: true,
      });
      toast({
        title: language === 'ar' ? "تم إرسال الأمر" : "Command Sent",
        description: language === 'ar' ? "جاري تنفيذ الأمر بواسطة المساعد" : "Command is being executed by the assistant",
      });
    },
  });

  const executeInstructionMutation = useMutation({
    mutationFn: async (instructionId: string) => {
      const response = await apiRequest('POST', `/api/owner/instructions/${instructionId}/execute`);
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/instructions'] });
      const costInfo = data.cost ? `$${data.cost.billed?.toFixed(4)} (${data.tokens?.total || 0} tokens)` : '';
      toast({
        title: language === 'ar' ? "تم التنفيذ بنجاح" : "Execution Complete",
        description: language === 'ar' 
          ? `تم تنفيذ الأمر في ${data.executionTimeMs}ms | ${costInfo}` 
          : `Completed in ${data.executionTimeMs}ms | ${costInfo}`,
      });
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/instructions'] });
      toast({
        title: language === 'ar' ? "فشل التنفيذ" : "Execution Failed",
        description: error.message || (language === 'ar' ? "حدث خطأ أثناء التنفيذ" : "An error occurred during execution"),
        variant: "destructive",
      });
    },
  });

  const initializeAssistantsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/owner/initialize-assistants');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/assistants'] });
      toast({
        title: language === 'ar' ? "تمت التهيئة" : "Initialized",
        description: language === 'ar' ? "تم إنشاء المساعدين بنجاح" : "Assistants created successfully",
      });
    },
  });

  const savePlatformSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/owner/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/settings'] });
      toast({
        title: language === 'ar' ? "تم الحفظ" : "Saved",
        description: language === 'ar' ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully",
      });
    },
  });

  // User Governance Actions (Suspend/Ban/Reactivate)
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return apiRequest('POST', `/api/owner/users/${userId}/suspend`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/users'] });
      toast({
        title: language === 'ar' ? "تم التعليق" : "Suspended",
        description: language === 'ar' ? "تم تعليق المستخدم بنجاح" : "User suspended successfully",
      });
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return apiRequest('POST', `/api/owner/users/${userId}/ban`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/users'] });
      toast({
        title: language === 'ar' ? "تم الحظر" : "Banned",
        description: language === 'ar' ? "تم حظر المستخدم بنجاح" : "User banned successfully",
      });
    },
  });

  const reactivateUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return apiRequest('POST', `/api/owner/users/${userId}/reactivate`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/users'] });
      toast({
        title: language === 'ar' ? "تمت إعادة التفعيل" : "Reactivated",
        description: language === 'ar' ? "تمت إعادة تفعيل المستخدم بنجاح" : "User reactivated successfully",
      });
    },
  });

  // Handle user governance actions
  const handleUserAction = (userId: string, action: 'suspend' | 'ban' | 'reactivate') => {
    const reason = language === 'ar' ? "إجراء من المالك" : "Owner action";
    
    if (action === 'suspend') {
      suspendUserMutation.mutate({ userId, reason });
    } else if (action === 'ban') {
      banUserMutation.mutate({ userId, reason });
    } else if (action === 'reactivate') {
      reactivateUserMutation.mutate({ userId, reason });
    }
  };

  const [platformSettings, setPlatformSettings] = useState({
    platformName: "INFERA WebNova",
    platformNameAr: "منصة انفيرا ويب نوفا",
    primaryDomain: "",
    supportEmail: "",
    maintenanceMode: false,
    registrationEnabled: true,
    announcement: "",
    announcementAr: "",
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; className: string }> = {
      pending: { icon: Clock, className: "bg-yellow-500/10 text-yellow-600" },
      in_progress: { icon: RefreshCw, className: "bg-blue-500/10 text-blue-600" },
      completed: { icon: CheckCircle, className: "bg-green-500/10 text-green-600" },
      failed: { icon: AlertCircle, className: "bg-red-500/10 text-red-600" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 ml-1" />
        {t.status[status as keyof typeof t.status] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-owner-title">{t.title}</h1>
              <p className="text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-lg px-4 py-2">
            <Crown className="w-5 h-5 ml-2" />
            {language === 'ar' ? 'المالك' : 'Owner'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.stats.totalUsers}</p>
                  <p className="text-3xl font-bold">{userStats?.totalUsers || users.length || 0}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.stats.activeProjects}</p>
                  <p className="text-3xl font-bold">{0}</p>
                </div>
                <Activity className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.stats.aiGenerations}</p>
                  <p className="text-3xl font-bold">{0}</p>
                </div>
                <Sparkles className="w-10 h-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.stats.revenue}</p>
                  <p className="text-3xl font-bold">$0</p>
                </div>
                <Zap className="w-10 h-10 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 lg:w-auto lg:inline-grid gap-1">
            <TabsTrigger value="command" className="gap-2" data-testid="tab-command">
              <Terminal className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.command}</span>
            </TabsTrigger>
            <TabsTrigger value="sovereign" className="gap-2" data-testid="tab-sovereign">
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.sovereign}</span>
            </TabsTrigger>
            <TabsTrigger value="aiSovereignty" className="gap-2" data-testid="tab-ai-sovereignty">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.aiSovereignty}</span>
            </TabsTrigger>
            <TabsTrigger value="domains" className="gap-2" data-testid="tab-domains">
              <Globe2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.domains}</span>
            </TabsTrigger>
            <TabsTrigger value="assistants" className="gap-2" data-testid="tab-assistants">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.assistants}</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2" data-testid="tab-payments">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.payments}</span>
            </TabsTrigger>
            <TabsTrigger value="auth" className="gap-2" data-testid="tab-auth">
              <KeyRound className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.auth}</span>
            </TabsTrigger>
            <TabsTrigger value="platform" className="gap-2" data-testid="tab-platform">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.platform}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2" data-testid="tab-users">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.users}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.analytics}</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2" data-testid="tab-logs">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">{t.tabs.logs}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="command" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="w-5 h-5" />
                      {t.command.title}
                    </CardTitle>
                    <CardDescription>{t.command.subtitle}</CardDescription>
                  </div>
                  <Dialog open={showNewInstructionDialog} onOpenChange={setShowNewInstructionDialog}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-new-instruction">
                        <Plus className="w-4 h-4 ml-2" />
                        {t.command.newInstruction}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{t.command.newInstruction}</DialogTitle>
                        <DialogDescription>
                          {language === 'ar' ? 'أرسل أمراً جديداً لأحد المساعدين' : 'Send a new command to an assistant'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>{t.command.selectAssistant}</Label>
                          <Select value={selectedAssistant} onValueChange={setSelectedAssistant}>
                            <SelectTrigger data-testid="select-assistant">
                              <SelectValue placeholder={t.command.selectAssistant} />
                            </SelectTrigger>
                            <SelectContent>
                              {assistants.map((assistant) => (
                                <SelectItem key={assistant.id} value={assistant.id}>
                                  {language === 'ar' ? assistant.nameAr : assistant.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t.command.instructionTitle}</Label>
                          <Input
                            value={instructionForm.title}
                            onChange={(e) => setInstructionForm({ ...instructionForm, title: e.target.value })}
                            placeholder={language === 'ar' ? 'مثال: تحسين أداء المنصة' : 'Example: Improve platform performance'}
                            data-testid="input-instruction-title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.command.instructionContent}</Label>
                          <Textarea
                            value={instructionForm.instruction}
                            onChange={(e) => setInstructionForm({ ...instructionForm, instruction: e.target.value })}
                            placeholder={language === 'ar' ? 'اكتب تفاصيل الأمر هنا...' : 'Write command details here...'}
                            rows={5}
                            data-testid="textarea-instruction"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t.command.priority}</Label>
                            <Select 
                              value={instructionForm.priority} 
                              onValueChange={(v) => setInstructionForm({ ...instructionForm, priority: v })}
                            >
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">{t.command.priorities.low}</SelectItem>
                                <SelectItem value="normal">{t.command.priorities.normal}</SelectItem>
                                <SelectItem value="high">{t.command.priorities.high}</SelectItem>
                                <SelectItem value="urgent">{t.command.priorities.urgent}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t.command.category}</Label>
                            <Select 
                              value={instructionForm.category} 
                              onValueChange={(v) => setInstructionForm({ ...instructionForm, category: v })}
                            >
                              <SelectTrigger data-testid="select-category">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="development">{t.command.categories.development}</SelectItem>
                                <SelectItem value="design">{t.command.categories.design}</SelectItem>
                                <SelectItem value="content">{t.command.categories.content}</SelectItem>
                                <SelectItem value="fix">{t.command.categories.fix}</SelectItem>
                                <SelectItem value="improvement">{t.command.categories.improvement}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={instructionForm.approvalRequired}
                            onCheckedChange={(checked) => setInstructionForm({ ...instructionForm, approvalRequired: checked })}
                            data-testid="switch-approval"
                          />
                          <Label>{t.command.requireApproval}</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => {
                            if (selectedAssistant && instructionForm.title && instructionForm.instruction) {
                              sendInstructionMutation.mutate({
                                assistantId: selectedAssistant,
                                ...instructionForm,
                              });
                            }
                          }}
                          disabled={!selectedAssistant || !instructionForm.title || !instructionForm.instruction}
                          data-testid="button-send-instruction"
                        >
                          <Send className="w-4 h-4 ml-2" />
                          {t.command.send}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="font-semibold">{t.command.recentInstructions}</h3>
                  {instructions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t.command.noInstructions}</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {instructions.map((instruction) => (
                          <Card key={instruction.id} className="hover-elevate">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {getStatusBadge(instruction.status)}
                                    <Badge variant="outline">{instruction.category}</Badge>
                                    <Badge variant="outline">{instruction.priority}</Badge>
                                  </div>
                                  <h4 className="font-medium">{instruction.title}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {instruction.instruction}
                                  </p>
                                  {instruction.response && (
                                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                                      <p className="font-medium mb-1">{language === 'ar' ? 'الرد:' : 'Response:'}</p>
                                      <p className="text-muted-foreground">{instruction.response}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {instruction.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      onClick={() => executeInstructionMutation.mutate(instruction.id)}
                                      data-testid={`button-execute-${instruction.id}`}
                                    >
                                      <Play className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button size="icon" variant="ghost">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sovereign" className="space-y-6">
            {/* Platform State Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className={platformState?.healthStatus === 'emergency' ? 'border-red-500' : platformState?.healthStatus === 'critical' ? 'border-orange-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.sovereign.healthScore}</p>
                      <p className="text-2xl font-bold">{platformState?.overallHealthScore || 100}%</p>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      platformState?.healthStatus === 'healthy' ? 'bg-green-500/10 text-green-600' :
                      platformState?.healthStatus === 'degraded' ? 'bg-yellow-500/10 text-yellow-600' :
                      platformState?.healthStatus === 'critical' ? 'bg-orange-500/10 text-orange-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                  <Badge className={`mt-2 ${
                    platformState?.healthStatus === 'healthy' ? 'bg-green-500/10 text-green-600' :
                    platformState?.healthStatus === 'degraded' ? 'bg-yellow-500/10 text-yellow-600' :
                    platformState?.healthStatus === 'critical' ? 'bg-orange-500/10 text-orange-600' :
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {(t.sovereign.healthStatus as any)?.[platformState?.healthStatus || 'healthy'] || platformState?.healthStatus}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المساعدون النشطون' : 'Active Assistants'}</p>
                      <p className="text-2xl font-bold">{platformState?.activeSovereignAssistants || 0}/5</p>
                    </div>
                    <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600">
                      <Crown className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{language === 'ar' ? 'أوامر قيد الانتظار' : 'Pending Commands'}</p>
                      <p className="text-2xl font-bold">{platformState?.pendingCommands || 0}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={emergencyControls.filter((c: any) => c.isActive).length > 0 ? 'border-red-500 bg-red-500/5' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.sovereign.emergencyControls}</p>
                      <p className="text-2xl font-bold">{emergencyControls.filter((c: any) => c.isActive).length}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${emergencyControls.filter((c: any) => c.isActive).length > 0 ? 'bg-red-500/10 text-red-600' : 'bg-gray-500/10 text-gray-600'}`}>
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  </div>
                  {emergencyControls.filter((c: any) => c.isActive).length > 0 && (
                    <Badge className="mt-2 bg-red-500/10 text-red-600">
                      {language === 'ar' ? 'نشط' : 'Active'}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Cost Analytics & Kill Switch */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card data-testid="card-ai-real-cost">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{language === 'ar' ? 'التكلفة الفعلية' : 'Real Cost'}</p>
                      <p className="text-2xl font-bold">${(aiCostAnalytics?.totalRealCost || 0).toFixed(4)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-600">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card data-testid="card-ai-billed-cost">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المحصل' : 'Billed'}</p>
                      <p className="text-2xl font-bold">${(aiCostAnalytics?.totalBilledCost || 0).toFixed(4)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card data-testid="card-ai-margin">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{language === 'ar' ? 'هامش الربح' : 'Margin'}</p>
                      <p className="text-2xl font-bold">{((aiCostAnalytics?.margin || 0) * 100).toFixed(1)}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={aiGlobalKillSwitch?.globalActive ? 'border-red-500 bg-red-500/5' : ''} data-testid="card-ai-kill-switch">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">AI Kill Switch</p>
                      <p className="text-lg font-bold">{aiGlobalKillSwitch?.globalActive ? (language === 'ar' ? 'نشط' : 'ACTIVE') : (language === 'ar' ? 'غير نشط' : 'Inactive')}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={aiGlobalKillSwitch?.globalActive ? 'outline' : 'destructive'}
                      onClick={() => aiGlobalKillSwitch?.globalActive 
                        ? deactivateAgentKillSwitchMutation.mutate({ scope: 'global' })
                        : activateAgentKillSwitchMutation.mutate({ scope: 'global', reason: 'Emergency stop' })
                      }
                      disabled={activateAgentKillSwitchMutation.isPending || deactivateAgentKillSwitchMutation.isPending}
                      data-testid="button-toggle-ai-kill-switch"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  {aiGlobalKillSwitch?.globalActive && aiGlobalKillSwitch.reason && (
                    <p className="text-xs text-red-600 mt-2">{aiGlobalKillSwitch.reason}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Emergency Controls Section */}
            <Card className="border-red-500/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      {t.sovereign.emergencyControls}
                    </CardTitle>
                    <CardDescription>{t.sovereign.emergencyDescription}</CardDescription>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => activateEmergencyMutation.mutate({
                      type: 'ai_suspension',
                      scope: 'global',
                      reason: 'Manual activation by owner',
                      reasonAr: 'تفعيل يدوي من المالك'
                    })}
                    disabled={activateEmergencyMutation.isPending}
                    data-testid="button-activate-emergency"
                  >
                    <AlertCircle className="w-4 h-4 ml-2" />
                    {t.sovereign.activateEmergency}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {emergencyControls.filter((c: any) => c.isActive).length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t.sovereign.noActiveEmergency}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emergencyControls.filter((c: any) => c.isActive).map((control: any) => (
                      <div key={control.id} className="flex items-center justify-between gap-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-600">
                              {(t.sovereign.emergencyTypes as any)?.[control.type] || control.type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {language === 'ar' ? control.reasonAr || control.reason : control.reason}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => deactivateEmergencyMutation.mutate(control.id)}
                          disabled={deactivateEmergencyMutation.isPending}
                          data-testid={`button-deactivate-emergency-${control.id}`}
                        >
                          {t.sovereign.deactivateEmergency}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sovereign Assistants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      {t.sovereign.title}
                    </CardTitle>
                    <CardDescription>{t.sovereign.subtitle}</CardDescription>
                  </div>
                  {sovereignAssistants.length === 0 && (
                    <Button 
                      onClick={() => initializeSovereignAssistantsMutation.mutate()}
                      disabled={initializeSovereignAssistantsMutation.isPending}
                      data-testid="button-initialize-sovereign"
                    >
                      {initializeSovereignAssistantsMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                      ) : (
                        <Plus className="w-4 h-4 ml-2" />
                      )}
                      {t.sovereign.initialize}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {sovereignAssistantsLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
                  </div>
                ) : sovereignAssistants.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Crown className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>{t.sovereign.noAssistants}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {sovereignAssistants.map((assistant) => {
                      const AssistantIcon = sovereignAssistantIcons[assistant.type] || Crown;
                      const colorClass = sovereignAssistantColors[assistant.type] || "bg-gray-500/10 text-gray-600";
                      return (
                        <Card key={assistant.id} className={`hover-elevate border ${colorClass.split(' ')[2] || 'border-border'}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${colorClass}`}>
                                <AssistantIcon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {language === 'ar' ? assistant.nameAr : assistant.name}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {language === 'ar' ? assistant.descriptionAr : assistant.description}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between gap-2">
                              <Badge className={assistant.isActive ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                                {assistant.isActive ? t.sovereign.active : t.sovereign.inactive}
                              </Badge>
                              <Switch
                                checked={assistant.isActive}
                                onCheckedChange={(checked) => toggleSovereignAssistantMutation.mutate({ id: assistant.id, isActive: checked })}
                                data-testid={`switch-sovereign-active-${assistant.id}`}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-muted-foreground">{t.sovereign.autonomy}:</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={assistant.isAutonomous ? "bg-amber-500/10 text-amber-600" : ""}>
                                  {assistant.isAutonomous ? t.sovereign.autonomousMode : t.sovereign.manualMode}
                                </Badge>
                                <Switch
                                  checked={assistant.isAutonomous}
                                  onCheckedChange={(checked) => toggleSovereignAutonomyMutation.mutate({ id: assistant.id, isAutonomous: checked })}
                                  data-testid={`switch-sovereign-autonomy-${assistant.id}`}
                                />
                              </div>
                            </div>

                            {/* Model & Stats */}
                            <div className="flex items-center justify-between gap-2 text-sm">
                              <span className="text-muted-foreground">{language === 'ar' ? 'النموذج' : 'Model'}:</span>
                              <Badge variant="secondary" className="text-xs font-mono">
                                {assistant.model?.split('-').slice(0, 2).join('-') || 'claude-sonnet'}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between gap-2 text-sm">
                              <span className="text-muted-foreground">{language === 'ar' ? 'المهام المنجزة' : 'Tasks Completed'}:</span>
                              <span className="font-bold">{assistant.totalTasksCompleted || 0}</span>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                              <p className="text-sm font-medium">{t.sovereign.capabilities}:</p>
                              <div className="flex flex-wrap gap-1">
                                {((language === 'ar' ? assistant.capabilitiesAr : assistant.capabilities) || []).slice(0, 3).map((cap, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {cap}
                                  </Badge>
                                ))}
                                {(assistant.capabilities?.length || 0) > 3 && (
                                  <Badge variant="outline" className="text-xs">+{(assistant.capabilities?.length || 0) - 3}</Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0 flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                setDirectCommandAssistant(assistant);
                                setDirectCommandForm({ command: "", mode: "AUTO", preferredModel: assistant.model || "claude-sonnet-4-20250514" });
                                setShowDirectCommandDialog(true);
                              }}
                              data-testid={`button-command-${assistant.id}`}
                            >
                              <Send className="w-4 h-4 ml-2" />
                              {t.sovereign.issueCommand}
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => toggleAssistantKillSwitchMutation.mutate({ 
                                assistantId: assistant.id, 
                                activate: true, 
                                reason: 'Manual stop by owner' 
                              })}
                              disabled={toggleAssistantKillSwitchMutation.isPending}
                              data-testid={`button-kill-${assistant.id}`}
                            >
                              <AlertCircle className="w-4 h-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {sovereignCommands.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    {t.sovereign.commandQueue}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {sovereignCommands.map((command) => (
                        <Card key={command.id} className="hover-elevate">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={
                                    command.status === 'completed' ? "bg-green-500/10 text-green-600" :
                                    command.status === 'executing' ? "bg-blue-500/10 text-blue-600" :
                                    command.status === 'failed' ? "bg-red-500/10 text-red-600" :
                                    command.status === 'cancelled' ? "bg-gray-500/10 text-gray-600" :
                                    command.status === 'rolled_back' ? "bg-orange-500/10 text-orange-600" :
                                    "bg-yellow-500/10 text-yellow-600"
                                  }>
                                    {t.sovereign.commandStatus[command.status as keyof typeof t.sovereign.commandStatus] || command.status}
                                  </Badge>
                                  <Badge variant="outline">{command.priority}</Badge>
                                </div>
                                <h4 className="font-medium">{command.directive}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {command.createdAt ? new Date(command.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {command.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => approveSovereignCommandMutation.mutate(command.id)}
                                      data-testid={`button-approve-${command.id}`}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => cancelSovereignCommandMutation.mutate(command.id)}
                                      data-testid={`button-cancel-${command.id}`}
                                    >
                                      <AlertCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                {(command.status === 'completed' || command.status === 'executing') && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => rollbackSovereignCommandMutation.mutate(command.id)}
                                    data-testid={`button-rollback-${command.id}`}
                                  >
                                    <History className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {sovereignLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    {t.sovereign.recentActivity}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {sovereignLogs.slice(0, 10).map((log) => (
                        <div key={log.id} className="flex items-center gap-3 p-2 rounded hover-elevate">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm">{language === 'ar' ? log.eventDescriptionAr : log.eventDescription}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.createdAt ? new Date(log.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="aiSovereignty" className="space-y-6">
            {/* AI Sovereignty Layer Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-violet-600">
                  <Shield className="w-6 h-6" />
                  {t.aiSovereignty.title}
                </h2>
                <p className="text-muted-foreground">{t.aiSovereignty.subtitle}</p>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.aiSovereignty.layers}</p>
                      <p className="text-2xl font-bold" data-testid="text-ai-layers-count">
                        {aiLayers?.length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                      <Database className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.aiSovereignty.powerControl}</p>
                      <p className="text-2xl font-bold" data-testid="text-power-configs-count">
                        {aiPowerConfigs?.length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600">
                      <Zap className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.aiSovereignty.externalProviders}</p>
                      <p className="text-2xl font-bold" data-testid="text-providers-count">
                        {aiExternalProviders?.length || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600">
                      <Globe className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={isGlobalKillSwitchActive ? 'border-red-500 bg-red-500/5' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.aiSovereignty.killSwitch}</p>
                      <p className="text-2xl font-bold" data-testid="text-kill-switch-status">
                        {isGlobalKillSwitchActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${isGlobalKillSwitchActive ? 'bg-red-500/10 text-red-600' : 'bg-gray-500/10 text-gray-600'}`}>
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Layers Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    {t.aiSovereignty.layers}
                  </CardTitle>
                  <Dialog open={showNewLayerDialog} onOpenChange={setShowNewLayerDialog}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-ai-layer">
                        <Plus className="w-4 h-4 mr-2" />
                        {language === 'ar' ? 'إضافة طبقة' : 'Add Layer'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{language === 'ar' ? 'إنشاء طبقة ذكاء جديدة' : 'Create New AI Layer'}</DialogTitle>
                        <DialogDescription>
                          {language === 'ar' ? 'تحديد إعدادات الطبقة الجديدة' : 'Configure the new AI layer settings'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                            <Input
                              value={newLayerForm.name}
                              onChange={(e) => setNewLayerForm({...newLayerForm, name: e.target.value})}
                              placeholder="Internal AI Layer"
                              data-testid="input-layer-name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                            <Input
                              value={newLayerForm.nameAr}
                              onChange={(e) => setNewLayerForm({...newLayerForm, nameAr: e.target.value})}
                              placeholder="طبقة ذكاء داخلية"
                              dir="rtl"
                              data-testid="input-layer-name-ar"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{language === 'ar' ? 'الغرض' : 'Purpose'}</Label>
                          <Textarea
                            value={newLayerForm.purpose}
                            onChange={(e) => setNewLayerForm({...newLayerForm, purpose: e.target.value})}
                            placeholder={language === 'ar' ? 'وصف الغرض من هذه الطبقة...' : 'Describe the purpose of this layer...'}
                            data-testid="input-layer-purpose"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'النوع' : 'Type'}</Label>
                            <Select value={newLayerForm.type} onValueChange={(v) => setNewLayerForm({...newLayerForm, type: v})}>
                              <SelectTrigger data-testid="select-layer-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="INTERNAL_SOVEREIGN">{t.aiSovereignty.layerTypes.internal}</SelectItem>
                                <SelectItem value="EXTERNAL_MANAGED">{t.aiSovereignty.layerTypes.external}</SelectItem>
                                <SelectItem value="HYBRID">{t.aiSovereignty.layerTypes.hybrid}</SelectItem>
                                <SelectItem value="SUBSCRIBER_RESTRICTED">{t.aiSovereignty.layerTypes.restricted}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'الأولوية (1-10)' : 'Priority (1-10)'}</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={newLayerForm.priority}
                              onChange={(e) => setNewLayerForm({...newLayerForm, priority: parseInt(e.target.value) || 5})}
                              data-testid="input-layer-priority"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <Label>{language === 'ar' ? 'متاح للمشتركين' : 'Available to Subscribers'}</Label>
                          <Switch
                            checked={newLayerForm.allowedForSubscribers}
                            onCheckedChange={(c) => setNewLayerForm({...newLayerForm, allowedForSubscribers: c})}
                            data-testid="switch-layer-subscribers"
                          />
                        </div>
                        {newLayerForm.allowedForSubscribers && (
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'مستوى الرؤية' : 'Visibility Level'}</Label>
                            <Select value={newLayerForm.subscriberVisibility} onValueChange={(v) => setNewLayerForm({...newLayerForm, subscriberVisibility: v})}>
                              <SelectTrigger data-testid="select-layer-visibility">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hidden">{language === 'ar' ? 'مخفي' : 'Hidden'}</SelectItem>
                                <SelectItem value="limited">{language === 'ar' ? 'محدود' : 'Limited'}</SelectItem>
                                <SelectItem value="full">{language === 'ar' ? 'كامل' : 'Full'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewLayerDialog(false)}>
                          {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </Button>
                        <Button 
                          onClick={() => createAiLayerMutation.mutate(newLayerForm)}
                          disabled={createAiLayerMutation?.isPending || !newLayerForm.name || !newLayerForm.nameAr || !newLayerForm.purpose}
                          data-testid="button-submit-layer"
                        >
                          {createAiLayerMutation?.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                          {language === 'ar' ? 'إنشاء الطبقة' : 'Create Layer'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {aiLayersLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
                  </div>
                ) : aiLayers?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{language === 'ar' ? 'لا توجد طبقات ذكاء' : 'No AI layers yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiLayers?.map((layer: any) => {
                      const layerType = layer.type || layer.layerType;
                      const existingPowerConfig = aiPowerConfigs?.find((pc: any) => pc.layerId === layer.id);
                      return (
                        <div key={layer.id} className="flex items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg" data-testid={`ai-layer-${layer.id}`}>
                          <div className="flex items-center gap-3">
                            <Badge className={
                              layerType === 'INTERNAL_SOVEREIGN' ? 'bg-blue-500/10 text-blue-600' :
                              layerType === 'EXTERNAL_MANAGED' ? 'bg-purple-500/10 text-purple-600' :
                              layerType === 'HYBRID' ? 'bg-green-500/10 text-green-600' :
                              'bg-orange-500/10 text-orange-600'
                            }>
                              {layerType === 'INTERNAL_SOVEREIGN' ? t.aiSovereignty.layerTypes.internal :
                               layerType === 'EXTERNAL_MANAGED' ? t.aiSovereignty.layerTypes.external :
                               layerType === 'HYBRID' ? t.aiSovereignty.layerTypes.hybrid :
                               t.aiSovereignty.layerTypes.restricted}
                            </Badge>
                            <div>
                              <p className="font-medium">{language === 'ar' ? layer.nameAr : layer.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {language === 'ar' ? 'الأولوية:' : 'Priority:'} {layer.priority || 1} | 
                                {language === 'ar' ? ' القوة:' : ' Power:'} {existingPowerConfig?.powerLevel || '-'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLayerForPower(layer);
                                if (existingPowerConfig) {
                                  setPowerConfigForm({
                                    powerLevel: existingPowerConfig.powerLevel ?? 5,
                                    maxTokensPerRequest: existingPowerConfig.maxTokensPerRequest ?? 4096,
                                    maxRequestsPerMinute: existingPowerConfig.maxRequestsPerMinute ?? 60,
                                    maxConcurrentRequests: existingPowerConfig.maxConcurrentRequests ?? 10,
                                    cpuAllocation: existingPowerConfig.cpuAllocation ?? 'standard',
                                    memoryAllocation: existingPowerConfig.memoryAllocation ?? 'standard',
                                    costPerRequest: existingPowerConfig.costPerRequest ?? 0,
                                    monthlyBudgetLimit: existingPowerConfig.monthlyBudgetLimit ?? null,
                                  });
                                } else {
                                  setPowerConfigForm({
                                    powerLevel: 5, maxTokensPerRequest: 4096, maxRequestsPerMinute: 60,
                                    maxConcurrentRequests: 10, cpuAllocation: "standard", memoryAllocation: "standard",
                                    costPerRequest: 0, monthlyBudgetLimit: null,
                                  });
                                }
                                setShowPowerConfigDialog(true);
                              }}
                              data-testid={`button-power-config-${layer.id}`}
                            >
                              <Zap className="w-4 h-4 mr-1" />
                              {existingPowerConfig ? (language === 'ar' ? 'تعديل القوة' : 'Edit Power') : (language === 'ar' ? 'تكوين القوة' : 'Configure Power')}
                            </Button>
                            <Badge variant={layer.status === 'active' ? 'default' : 'secondary'}>
                              {layer.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : layer.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Power Config Dialog */}
            <Dialog open={showPowerConfigDialog} onOpenChange={setShowPowerConfigDialog}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    {language === 'ar' ? 'تكوين القوة' : 'Power Configuration'}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedLayerForPower && (language === 'ar' 
                      ? `تكوين قوة الطبقة: ${selectedLayerForPower.nameAr}` 
                      : `Configure power for layer: ${selectedLayerForPower?.name}`)}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'مستوى القوة (1-10)' : 'Power Level (1-10)'}</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="range"
                        min={1}
                        max={10}
                        value={powerConfigForm.powerLevel}
                        onChange={(e) => setPowerConfigForm({...powerConfigForm, powerLevel: parseInt(e.target.value)})}
                        className="flex-1"
                        data-testid="input-power-level"
                      />
                      <Badge className="min-w-[3rem] justify-center">
                        {powerConfigForm.powerLevel}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {powerConfigForm.powerLevel <= 3 ? t.aiSovereignty.powerLevels.low :
                       powerConfigForm.powerLevel <= 5 ? t.aiSovereignty.powerLevels.medium :
                       powerConfigForm.powerLevel <= 7 ? t.aiSovereignty.powerLevels.high :
                       t.aiSovereignty.powerLevels.maximum}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'أقصى توكنز/طلب' : 'Max Tokens/Request'}</Label>
                      <Input
                        type="number"
                        value={powerConfigForm.maxTokensPerRequest}
                        onChange={(e) => setPowerConfigForm({...powerConfigForm, maxTokensPerRequest: parseInt(e.target.value) || 4096})}
                        data-testid="input-max-tokens"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'أقصى طلبات/دقيقة' : 'Max Requests/Minute'}</Label>
                      <Input
                        type="number"
                        value={powerConfigForm.maxRequestsPerMinute}
                        onChange={(e) => setPowerConfigForm({...powerConfigForm, maxRequestsPerMinute: parseInt(e.target.value) || 60})}
                        data-testid="input-max-requests"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'تخصيص CPU' : 'CPU Allocation'}</Label>
                      <Select value={powerConfigForm.cpuAllocation} onValueChange={(v) => setPowerConfigForm({...powerConfigForm, cpuAllocation: v})}>
                        <SelectTrigger data-testid="select-cpu">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">{t.aiSovereignty.powerLevels.minimal}</SelectItem>
                          <SelectItem value="standard">{t.aiSovereignty.powerLevels.medium}</SelectItem>
                          <SelectItem value="high">{t.aiSovereignty.powerLevels.high}</SelectItem>
                          <SelectItem value="maximum">{t.aiSovereignty.powerLevels.maximum}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'تخصيص الذاكرة' : 'Memory Allocation'}</Label>
                      <Select value={powerConfigForm.memoryAllocation} onValueChange={(v) => setPowerConfigForm({...powerConfigForm, memoryAllocation: v})}>
                        <SelectTrigger data-testid="select-memory">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">{t.aiSovereignty.powerLevels.minimal}</SelectItem>
                          <SelectItem value="standard">{t.aiSovereignty.powerLevels.medium}</SelectItem>
                          <SelectItem value="high">{t.aiSovereignty.powerLevels.high}</SelectItem>
                          <SelectItem value="maximum">{t.aiSovereignty.powerLevels.maximum}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'التكلفة/طلب' : 'Cost/Request'}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={powerConfigForm.costPerRequest}
                        onChange={(e) => setPowerConfigForm({...powerConfigForm, costPerRequest: parseFloat(e.target.value) || 0})}
                        data-testid="input-cost"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الميزانية الشهرية' : 'Monthly Budget'}</Label>
                      <Input
                        type="number"
                        placeholder={language === 'ar' ? 'غير محدود' : 'Unlimited'}
                        value={powerConfigForm.monthlyBudgetLimit ?? ''}
                        onChange={(e) => setPowerConfigForm({...powerConfigForm, monthlyBudgetLimit: e.target.value ? parseFloat(e.target.value) : null})}
                        data-testid="input-budget"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setShowPowerConfigDialog(false);
                    setSelectedLayerForPower(null);
                  }}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button 
                    onClick={() => selectedLayerForPower && createPowerConfigMutation.mutate({
                      layerId: selectedLayerForPower.id,
                      ...powerConfigForm
                    })}
                    disabled={createPowerConfigMutation?.isPending || !selectedLayerForPower}
                    data-testid="button-submit-power-config"
                  >
                    {createPowerConfigMutation?.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    {language === 'ar' ? 'حفظ التكوين' : 'Save Configuration'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Kill Switch Section */}
            <Card className="border-red-500/30">
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      {t.aiSovereignty.killSwitch}
                    </CardTitle>
                    <CardDescription>{language === 'ar' ? 'إيقاف طارئ لجميع عمليات الذكاء' : 'Emergency stop for all AI operations'}</CardDescription>
                  </div>
                  {isGlobalKillSwitchActive ? (
                    <Button 
                      variant="default"
                      onClick={() => deactivateKillSwitchMutation.mutate()}
                      disabled={deactivateKillSwitchMutation?.isPending}
                      data-testid="button-deactivate-kill-switch"
                    >
                      {deactivateKillSwitchMutation?.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {language === 'ar' ? 'إعادة التشغيل' : 'Reactivate'}
                    </Button>
                  ) : (
                    <Dialog open={showKillSwitchDialog} onOpenChange={setShowKillSwitchDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" data-testid="button-open-kill-switch-dialog">
                          <Pause className="w-4 h-4 mr-2" />
                          {language === 'ar' ? 'إيقاف طارئ' : 'Emergency Stop'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="text-red-600">{language === 'ar' ? 'تفعيل الإيقاف الطارئ' : 'Activate Kill Switch'}</DialogTitle>
                          <DialogDescription>
                            {language === 'ar' ? 'سيتم إيقاف جميع عمليات الذكاء فوراً' : 'This will immediately stop all AI operations'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'نطاق الإيقاف' : 'Stop Scope'}</Label>
                            <Select value={killSwitchForm.scope} onValueChange={(v) => setKillSwitchForm({...killSwitchForm, scope: v})}>
                              <SelectTrigger data-testid="select-kill-scope">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="global">{t.aiSovereignty.globalStop}</SelectItem>
                                <SelectItem value="external_only">{t.aiSovereignty.externalStop}</SelectItem>
                                <SelectItem value="layer_specific">{t.aiSovereignty.layerStop}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {killSwitchForm.scope === 'layer_specific' && aiLayers?.length > 0 && (
                            <div className="space-y-2">
                              <Label>{language === 'ar' ? 'الطبقة المستهدفة' : 'Target Layer'}</Label>
                              <Select value={killSwitchForm.targetLayerId} onValueChange={(v) => setKillSwitchForm({...killSwitchForm, targetLayerId: v})}>
                                <SelectTrigger data-testid="select-target-layer">
                                  <SelectValue placeholder={language === 'ar' ? 'اختر طبقة' : 'Select layer'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {aiLayers?.map((layer: any) => (
                                    <SelectItem key={layer.id} value={layer.id}>
                                      {language === 'ar' ? layer.nameAr : layer.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'السبب (إنجليزي)' : 'Reason (English)'}</Label>
                            <Textarea
                              value={killSwitchForm.reason}
                              onChange={(e) => setKillSwitchForm({...killSwitchForm, reason: e.target.value})}
                              placeholder={language === 'ar' ? 'وصف سبب الإيقاف...' : 'Describe the reason for emergency stop...'}
                              data-testid="input-kill-reason"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{language === 'ar' ? 'السبب (عربي)' : 'Reason (Arabic)'}</Label>
                            <Textarea
                              value={killSwitchForm.reasonAr}
                              onChange={(e) => setKillSwitchForm({...killSwitchForm, reasonAr: e.target.value})}
                              placeholder="وصف سبب الإيقاف بالعربية..."
                              dir="rtl"
                              data-testid="input-kill-reason-ar"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowKillSwitchDialog(false)}>
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => activateKillSwitchMutation.mutate(killSwitchForm)}
                            disabled={activateKillSwitchMutation?.isPending || !killSwitchForm.reason || (killSwitchForm.scope === 'layer_specific' && !killSwitchForm.targetLayerId)}
                            data-testid="button-confirm-kill-switch"
                          >
                            {activateKillSwitchMutation?.isPending && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                            {language === 'ar' ? 'تفعيل الإيقاف' : 'Activate Kill Switch'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isGlobalKillSwitchActive ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <div>
                        <p className="font-medium text-red-600">{language === 'ar' ? 'مفتاح الإيقاف نشط' : 'Kill Switch Active'}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'جميع عمليات الذكاء متوقفة' : 'All AI operations are suspended'}
                        </p>
                        {Array.isArray(aiKillSwitch) && aiKillSwitch.find((ks: any) => ks.scope === 'global')?.reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {language === 'ar' ? 'السبب:' : 'Reason:'} {aiKillSwitch.find((ks: any) => ks.scope === 'global')?.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{language === 'ar' ? 'النظام يعمل بشكل طبيعي' : 'System operating normally'}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Constitutional Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t.aiSovereignty.constitution}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{t.aiSovereignty.constitutionRules.noAIWithoutLayer}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{t.aiSovereignty.constitutionRules.noAIWithoutLimits}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{t.aiSovereignty.constitutionRules.noUndefinedPower}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{t.aiSovereignty.constitutionRules.noExternalWithoutApproval}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg md:col-span-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{t.aiSovereignty.constitutionRules.noSubscriberAccessWithoutDecision}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  {t.aiSovereignty.auditLogs}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiAuditLogsLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
                  </div>
                ) : aiAuditLogs?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{language === 'ar' ? 'لا توجد سجلات بعد' : 'No audit logs yet'}</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {aiAuditLogs?.slice(0, 20).map((log: any) => (
                        <div key={log.id} className="flex items-center gap-3 p-2 rounded hover-elevate" data-testid={`audit-log-${log.id}`}>
                          <div className={`w-2 h-2 rounded-full ${
                            log.actionType === 'CREATE' ? 'bg-green-500' :
                            log.actionType === 'DELETE' ? 'bg-red-500' :
                            log.actionType === 'UPDATE' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm">{log.actionType} - {log.entityType}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.timestamp ? new Date(log.timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assistants" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5" />
                      {t.assistants.title}
                    </CardTitle>
                    <CardDescription>{t.assistants.subtitle}</CardDescription>
                  </div>
                  <Button 
                    onClick={() => initializeAssistantsMutation.mutate()}
                    disabled={initializeAssistantsMutation.isPending}
                    data-testid="button-create-assistant"
                  >
                    {initializeAssistantsMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 ml-2" />
                    )}
                    {t.assistants.createNew}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {assistantsLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
                  </div>
                ) : assistants.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>{language === 'ar' ? 'لا يوجد مساعدين بعد' : 'No assistants yet'}</p>
                    <p className="text-sm">{language === 'ar' ? 'أنشئ مساعدك الأول للبدء' : 'Create your first assistant to get started'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assistants.map((assistant) => {
                      const SpecialtyIcon = specialtyIcons[assistant.specialty] || Bot;
                      return (
                        <Card key={assistant.id} className="hover-elevate">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${specialtyColors[assistant.specialty]}`}>
                                <SpecialtyIcon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {language === 'ar' ? assistant.nameAr : assistant.name}
                                </CardTitle>
                                <Badge className={assistant.isActive ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                                  {assistant.isActive ? t.assistants.active : t.assistants.inactive}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              {language === 'ar' ? assistant.descriptionAr : assistant.description}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">{t.assistants.tasksCompleted}</p>
                                <p className="font-semibold">{assistant.totalTasksCompleted}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">{t.assistants.successRate}</p>
                                <p className="font-semibold">{assistant.successRate}%</p>
                              </div>
                            </div>
                            <Progress value={assistant.successRate} className="h-2" />
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full" 
                              variant="outline"
                              onClick={() => {
                                setSelectedAssistant(assistant.id);
                                setShowNewInstructionDialog(true);
                              }}
                              data-testid={`button-command-${assistant.id}`}
                            >
                              <Send className="w-4 h-4 ml-2" />
                              {t.assistants.sendCommand}
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.payments.analytics.totalRevenue}</p>
                      <p className="text-2xl font-bold">${((paymentAnalytics?.totalRevenue || 0) / 100).toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.payments.analytics.totalTransactions}</p>
                      <p className="text-2xl font-bold">{paymentAnalytics?.totalTransactions || 0}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.payments.analytics.successRate}</p>
                      <p className="text-2xl font-bold">
                        {paymentAnalytics?.totalTransactions > 0 
                          ? Math.round((paymentAnalytics.successfulTransactions / paymentAnalytics.totalTransactions) * 100) 
                          : 0}%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-emerald-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.payments.analytics.activeGateways}</p>
                      <p className="text-2xl font-bold">{paymentAnalytics?.activePaymentMethods || 0}</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-purple-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      {t.payments.title}
                    </CardTitle>
                    <CardDescription>{t.payments.subtitle}</CardDescription>
                  </div>
                  {paymentMethods.length === 0 && (
                    <Button 
                      onClick={() => initializePaymentMethodsMutation.mutate()}
                      disabled={initializePaymentMethodsMutation.isPending}
                      data-testid="button-initialize-payments"
                    >
                      {initializePaymentMethodsMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                      ) : (
                        <Plus className="w-4 h-4 ml-2" />
                      )}
                      {t.payments.initialize}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {paymentMethodsLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>{t.payments.noMethods}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paymentMethods.map((method) => {
                      const ProviderIcon = paymentProviderIcons[method.provider] || CreditCard;
                      return (
                        <Card key={method.id} className="hover-elevate">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${method.isActive ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                <ProviderIcon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {language === 'ar' ? method.nameAr : method.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={method.isActive ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                                    {method.isActive ? t.payments.active : t.payments.inactive}
                                  </Badge>
                                  <Badge className={method.isConfigured ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"}>
                                    {method.isConfigured ? t.payments.configured : t.payments.notConfigured}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              {language === 'ar' ? method.descriptionAr : method.description}
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">{t.payments.currencies}:</span>
                                <div className="flex flex-wrap gap-1 justify-end">
                                  {method.supportedCurrencies?.slice(0, 3).map((cur) => (
                                    <Badge key={cur} variant="outline" className="text-xs">{cur}</Badge>
                                  ))}
                                  {(method.supportedCurrencies?.length || 0) > 3 && (
                                    <Badge variant="outline" className="text-xs">+{(method.supportedCurrencies?.length || 0) - 3}</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">{t.payments.fees}:</span>
                                <span>{(method.transactionFee || 0) / 100}% + ${(method.fixedFee || 0) / 100}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                  {method.sandboxMode ? t.payments.sandbox : t.payments.production}
                                </span>
                                <Badge variant="outline" className={method.sandboxMode ? "text-amber-600" : "text-green-600"}>
                                  {method.sandboxMode ? "Test" : "Live"}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="gap-2 flex-wrap">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1"
                              onClick={() => togglePaymentMethodMutation.mutate({ 
                                id: method.id, 
                                isActive: !method.isActive 
                              })}
                              disabled={togglePaymentMethodMutation.isPending}
                              data-testid={`button-toggle-${method.id}`}
                            >
                              {method.isActive ? (
                                <ToggleRight className="w-4 h-4 ml-1" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 ml-1" />
                              )}
                              {t.payments.toggle}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deletePaymentMethodMutation.mutate(method.id)}
                              disabled={deletePaymentMethodMutation.isPending}
                              data-testid={`button-delete-${method.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5" />
                      {t.auth.title}
                    </CardTitle>
                    <CardDescription>{t.auth.subtitle}</CardDescription>
                  </div>
                  {authMethods.length === 0 && (
                    <Button 
                      onClick={() => initializeAuthMethodsMutation.mutate()}
                      disabled={initializeAuthMethodsMutation.isPending}
                      data-testid="button-initialize-auth"
                    >
                      {initializeAuthMethodsMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                      ) : (
                        <Plus className="w-4 h-4 ml-2" />
                      )}
                      {t.auth.initialize}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {authMethodsLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
                  </div>
                ) : authMethods.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <KeyRound className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>{t.auth.noMethods}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {authMethods.map((method) => {
                      const authMethodIcons: Record<string, any> = {
                        email_password: Mail,
                        otp_email: KeyRound,
                        google: Chrome,
                        facebook: Facebook,
                        twitter: Twitter,
                        github: Github,
                        apple: Apple,
                        microsoft: Monitor,
                        magic_link: LinkIcon,
                        otp_sms: Smartphone,
                      };
                      const MethodIcon = authMethodIcons[method.key] || KeyRound;
                      return (
                        <Card key={method.id} className="hover-elevate">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${method.isActive ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                <MethodIcon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {language === 'ar' ? method.nameAr : method.name}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {method.isDefault && (
                                    <Badge className="bg-amber-500/10 text-amber-600">
                                      {t.auth.default}
                                    </Badge>
                                  )}
                                  <Badge className={method.isActive ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                                    {method.isActive ? t.auth.active : t.auth.inactive}
                                  </Badge>
                                  <Badge className={method.isVisible ? "bg-blue-500/10 text-blue-600" : "bg-gray-500/10 text-gray-600"}>
                                    {method.isVisible ? t.auth.visible : t.auth.hidden}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {language === 'ar' ? method.descriptionAr : method.description}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge className={method.isConfigured ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                                {method.isConfigured ? t.auth.configured : t.auth.notConfigured}
                              </Badge>
                            </div>
                          </CardContent>
                          <CardFooter className="gap-2 flex-wrap">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1"
                              onClick={() => toggleAuthMethodMutation.mutate({ 
                                id: method.id, 
                                isActive: !method.isActive 
                              })}
                              disabled={toggleAuthMethodMutation.isPending || method.isDefault}
                              data-testid={`button-toggle-auth-${method.id}`}
                            >
                              {method.isActive ? (
                                <ToggleRight className="w-4 h-4 ml-1" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 ml-1" />
                              )}
                              {t.auth.toggleActive}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleAuthMethodVisibilityMutation.mutate({ 
                                id: method.id, 
                                isVisible: !method.isVisible 
                              })}
                              disabled={toggleAuthMethodVisibilityMutation.isPending || method.isDefault}
                              data-testid={`button-visibility-${method.id}`}
                            >
                              {method.isVisible ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteAuthMethodMutation.mutate(method.id)}
                              disabled={deleteAuthMethodMutation.isPending || method.isDefault}
                              data-testid={`button-delete-auth-${method.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platform" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t.platform.title}
                </CardTitle>
                <CardDescription>{t.platform.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t.platform.platformName}</Label>
                      <Input 
                        value={platformSettings.platformName}
                        onChange={(e) => setPlatformSettings({...platformSettings, platformName: e.target.value})}
                        data-testid="input-platform-name" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.platform.platformNameAr}</Label>
                      <Input 
                        value={platformSettings.platformNameAr}
                        onChange={(e) => setPlatformSettings({...platformSettings, platformNameAr: e.target.value})}
                        data-testid="input-platform-name-ar" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.platform.primaryDomain}</Label>
                      <Input 
                        value={platformSettings.primaryDomain}
                        onChange={(e) => setPlatformSettings({...platformSettings, primaryDomain: e.target.value})}
                        placeholder="webnova.infera.com" 
                        data-testid="input-domain" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.platform.supportEmail}</Label>
                      <Input 
                        value={platformSettings.supportEmail}
                        onChange={(e) => setPlatformSettings({...platformSettings, supportEmail: e.target.value})}
                        placeholder="support@infera.com" 
                        data-testid="input-support-email" 
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t.platform.defaultLanguage}</Label>
                      <Select defaultValue="ar">
                        <SelectTrigger data-testid="select-language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <Label>{t.platform.maintenance}</Label>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'إيقاف المنصة مؤقتاً للصيانة' : 'Temporarily disable the platform'}
                        </p>
                      </div>
                      <Switch 
                        checked={platformSettings.maintenanceMode}
                        onCheckedChange={(checked) => setPlatformSettings({...platformSettings, maintenanceMode: checked})}
                        data-testid="switch-maintenance" 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <Label>{t.platform.registrationEnabled}</Label>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'السماح بتسجيل مستخدمين جدد' : 'Allow new user registrations'}
                        </p>
                      </div>
                      <Switch 
                        checked={platformSettings.registrationEnabled}
                        onCheckedChange={(checked) => setPlatformSettings({...platformSettings, registrationEnabled: checked})}
                        data-testid="switch-registration" 
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t.platform.announcement}</Label>
                    <Textarea 
                      value={platformSettings.announcement}
                      onChange={(e) => setPlatformSettings({...platformSettings, announcement: e.target.value})}
                      placeholder={language === 'ar' ? 'إعلان يظهر لجميع المستخدمين...' : 'Announcement visible to all users...'} 
                      data-testid="textarea-announcement" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.platform.announcementAr}</Label>
                    <Textarea 
                      value={platformSettings.announcementAr}
                      onChange={(e) => setPlatformSettings({...platformSettings, announcementAr: e.target.value})}
                      placeholder="إعلان يظهر لجميع المستخدمين..." 
                      data-testid="textarea-announcement-ar" 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => savePlatformSettingsMutation.mutate(platformSettings)}
                  disabled={savePlatformSettingsMutation.isPending}
                  data-testid="button-save-settings"
                >
                  {savePlatformSettingsMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Settings className="w-4 h-4 ml-2" />
                  )}
                  {t.platform.save}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t.users.title}
                </CardTitle>
                <CardDescription>{t.users.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-3xl font-bold" data-testid="text-total-users">{userStats?.totalUsers ?? users.length}</p>
                      <p className="text-sm text-muted-foreground">{t.users.totalUsers}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-3xl font-bold text-green-600" data-testid="text-active-users">{userStats?.activeUsers ?? users.filter(u => u.status === 'ACTIVE').length}</p>
                      <p className="text-sm text-muted-foreground">{t.users.activeUsers}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-3xl font-bold" data-testid="text-paid-users">{userStats?.paidUsers ?? users.filter(u => u.role !== 'free').length}</p>
                      <p className="text-sm text-muted-foreground">{t.users.paidUsers}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-3xl font-bold text-yellow-600" data-testid="text-suspended-users">{users.filter(u => u.status === 'SUSPENDED').length}</p>
                      <p className="text-sm text-muted-foreground">{t.users.suspendedUsers}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-3xl font-bold text-red-600" data-testid="text-banned-users">{users.filter(u => u.status === 'BANNED').length}</p>
                      <p className="text-sm text-muted-foreground">{t.users.bannedUsers}</p>
                    </CardContent>
                  </Card>
                </div>
                {usersLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>{language === 'ar' ? 'لا يوجد مستخدمين' : 'No users found'}</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {users.map((user) => {
                        const displayName = user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.username || user.email?.split('@')[0] || 'Unknown';
                        const initial = displayName.charAt(0).toUpperCase();
                        const userStatus = (user as any).status || 'ACTIVE';
                        const isOwner = user.role === 'owner';
                        
                        const getStatusBadge = () => {
                          switch(userStatus) {
                            case 'SUSPENDED': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">{t.users.statusSuspended}</Badge>;
                            case 'BANNED': return <Badge variant="destructive">{t.users.statusBanned}</Badge>;
                            case 'PENDING': return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">{t.users.statusPending}</Badge>;
                            case 'DEACTIVATED': return <Badge variant="secondary">{t.users.statusDeactivated}</Badge>;
                            default: return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">{t.users.statusActive}</Badge>;
                          }
                        };
                        
                        return (
                          <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border hover-elevate" data-testid={`row-user-${user.id}`}>
                            <div className="flex items-center gap-3">
                              {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                                  {initial}
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{displayName}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                {(user as any).lastLoginAt && (
                                  <p className="text-xs text-muted-foreground">{t.users.lastLogin}: {new Date((user as any).lastLoginAt).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={user.role === 'owner' ? 'default' : user.role === 'sovereign' ? 'default' : 'secondary'}>
                                {user.role === 'owner' ? (language === 'ar' ? 'المالك' : 'Owner') :
                                 user.role === 'sovereign' ? (language === 'ar' ? 'سيادي' : 'Sovereign') :
                                 user.role === 'enterprise' ? (language === 'ar' ? 'مؤسسي' : 'Enterprise') :
                                 user.role === 'pro' ? (language === 'ar' ? 'احترافي' : 'Pro') :
                                 user.role === 'basic' ? (language === 'ar' ? 'أساسي' : 'Basic') :
                                 (language === 'ar' ? 'مجاني' : 'Free')}
                              </Badge>
                              {getStatusBadge()}
                              {!isOwner && (
                                <div className="flex items-center gap-1">
                                  {userStatus === 'ACTIVE' && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => handleUserAction(user.id, 'suspend')} data-testid={`button-suspend-${user.id}`}>
                                        <Pause className="w-3 h-3" />
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => handleUserAction(user.id, 'ban')} data-testid={`button-ban-${user.id}`}>
                                        <AlertCircle className="w-3 h-3" />
                                      </Button>
                                    </>
                                  )}
                                  {(userStatus === 'SUSPENDED' || userStatus === 'BANNED') && (
                                    <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleUserAction(user.id, 'reactivate')} data-testid={`button-reactivate-${user.id}`}>
                                      <Play className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Domains Tab - النطاقات المخصصة */}
          <TabsContent value="domains" className="space-y-6">
            <DomainsSection t={t} language={language} />
          </TabsContent>

          {/* Analytics Tab - تحليلات الاستهلاك */}
          <TabsContent value="analytics" className="space-y-6">
            <UsageAnalyticsSection t={t} language={language} />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  {t.logs.title}
                </CardTitle>
                <CardDescription>{t.logs.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{t.logs.noLogs}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Direct Command Dialog */}
      <Dialog open={showDirectCommandDialog} onOpenChange={setShowDirectCommandDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              {language === 'ar' ? 'تنفيذ أمر مباشر' : 'Execute Direct Command'}
            </DialogTitle>
            <DialogDescription>
              {directCommandAssistant && (
                <span className="flex items-center gap-2 mt-1">
                  <Crown className="w-4 h-4" />
                  {language === 'ar' ? directCommandAssistant.nameAr : directCommandAssistant.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الأمر' : 'Command'}</Label>
              <Textarea
                value={directCommandForm.command}
                onChange={(e) => setDirectCommandForm({ ...directCommandForm, command: e.target.value })}
                placeholder={language === 'ar' ? 'أدخل الأمر هنا...' : 'Enter your command here...'}
                className="min-h-[120px]"
                data-testid="input-direct-command"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'وضع التنفيذ' : 'Execution Mode'}</Label>
                <Select
                  value={directCommandForm.mode}
                  onValueChange={(value: "AUTO" | "MANUAL") => setDirectCommandForm({ ...directCommandForm, mode: value })}
                >
                  <SelectTrigger data-testid="select-execution-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTO">{language === 'ar' ? 'تلقائي' : 'AUTO'}</SelectItem>
                    <SelectItem value="MANUAL">{language === 'ar' ? 'يدوي' : 'MANUAL'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {directCommandForm.mode === 'MANUAL' && (
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'النموذج' : 'Model'}</Label>
                  <Select
                    value={directCommandForm.preferredModel}
                    onValueChange={(value) => setDirectCommandForm({ ...directCommandForm, preferredModel: value })}
                  >
                    <SelectTrigger data-testid="select-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                      <SelectItem value="claude-3-opus-20240229">Claude Opus</SelectItem>
                      <SelectItem value="claude-3-haiku-20240307">Claude Haiku</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDirectCommandDialog(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={() => {
                if (directCommandAssistant && directCommandForm.command.trim()) {
                  executeAssistantCommandMutation.mutate({
                    assistantId: directCommandAssistant.id,
                    command: directCommandForm.command,
                    mode: directCommandForm.mode,
                    preferredModel: directCommandForm.mode === 'MANUAL' ? directCommandForm.preferredModel : undefined,
                  });
                  setShowDirectCommandDialog(false);
                }
              }}
              disabled={!directCommandForm.command.trim() || executeAssistantCommandMutation.isPending}
              data-testid="button-execute-direct-command"
            >
              {executeAssistantCommandMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Play className="w-4 h-4 ml-2" />
              )}
              {language === 'ar' ? 'تنفيذ' : 'Execute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
