import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  BarChart3,
  Home,
  SquareTerminal,
  Code,
  Sparkles,
  FolderKanban,
  Settings,
  Crown,
  Rocket,
  ShieldCheck,
  Brain,
  Bot,
  CreditCard,
  LayoutTemplate,
  GitBranch,
  Users,
  FileText,
  Shield,
  Globe,
  Cpu,
  Zap,
  Target,
  TrendingUp,
  Building,
  GraduationCap,
  Briefcase,
  Scale,
  Megaphone,
  Store,
  Hotel,
  Train,
  FileSearch,
  Laptop,
  Map,
  Terminal,
  TestTube,
  Puzzle,
  Activity,
  Lock,
  Key,
  Server,
  Database,
  MessageSquare,
  Workflow,
  Layers,
  Package
} from "lucide-react";

interface CompletionTask {
  id: string;
  nameAr: string;
  nameEn: string;
  completed: boolean;
}

interface PageCompletion {
  path: string;
  nameAr: string;
  nameEn: string;
  icon: any;
  category: "core" | "owner" | "development" | "platforms" | "security" | "ai" | "business";
  tasks: CompletionTask[];
}

const PAGES_COMPLETION: PageCompletion[] = [
  // Core Pages
  {
    path: "/",
    nameAr: "الرئيسية",
    nameEn: "Home",
    icon: Home,
    category: "core",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "responsive", nameAr: "تصميم متجاوب", nameEn: "Responsive Design", completed: true },
      { id: "auth", nameAr: "التحقق من الهوية", nameEn: "Authentication", completed: true },
      { id: "navigation", nameAr: "التنقل", nameEn: "Navigation", completed: true },
    ]
  },
  {
    path: "/console",
    nameAr: "وحدة التحكم",
    nameEn: "Console",
    icon: SquareTerminal,
    category: "core",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "stats", nameAr: "الإحصائيات", nameEn: "Statistics", completed: true },
      { id: "quick-actions", nameAr: "إجراءات سريعة", nameEn: "Quick Actions", completed: true },
      { id: "activity", nameAr: "سجل النشاط", nameEn: "Activity Log", completed: false },
    ]
  },
  {
    path: "/ide",
    nameAr: "بيئة التطوير",
    nameEn: "Cloud IDE",
    icon: Code,
    category: "development",
    tasks: [
      { id: "monaco", nameAr: "محرر Monaco", nameEn: "Monaco Editor", completed: true },
      { id: "file-tree", nameAr: "شجرة الملفات", nameEn: "File Tree", completed: true },
      { id: "terminal", nameAr: "الطرفية", nameEn: "Terminal", completed: true },
      { id: "preview", nameAr: "المعاينة", nameEn: "Preview", completed: true },
      { id: "git", nameAr: "تكامل Git", nameEn: "Git Integration", completed: false },
      { id: "collab", nameAr: "التعاون المباشر", nameEn: "Live Collaboration", completed: false },
    ]
  },
  {
    path: "/ai-app-builder",
    nameAr: "منشئ التطبيقات بالذكاء",
    nameEn: "AI App Builder",
    icon: Sparkles,
    category: "ai",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "ai-chat", nameAr: "محادثة AI", nameEn: "AI Chat", completed: true },
      { id: "code-gen", nameAr: "توليد الكود", nameEn: "Code Generation", completed: true },
      { id: "templates", nameAr: "القوالب", nameEn: "Templates", completed: false },
      { id: "preview", nameAr: "المعاينة المباشرة", nameEn: "Live Preview", completed: false },
    ]
  },
  {
    path: "/projects",
    nameAr: "المشاريع",
    nameEn: "Projects",
    icon: FolderKanban,
    category: "core",
    tasks: [
      { id: "list", nameAr: "قائمة المشاريع", nameEn: "Project List", completed: true },
      { id: "create", nameAr: "إنشاء مشروع", nameEn: "Create Project", completed: true },
      { id: "delete", nameAr: "حذف مشروع", nameEn: "Delete Project", completed: true },
      { id: "search", nameAr: "البحث", nameEn: "Search", completed: false },
    ]
  },
  // Owner Pages
  {
    path: "/owner",
    nameAr: "لوحة المالك",
    nameEn: "Owner Dashboard",
    icon: Crown,
    category: "owner",
    tasks: [
      { id: "stats", nameAr: "الإحصائيات", nameEn: "Statistics", completed: true },
      { id: "users", nameAr: "إدارة المستخدمين", nameEn: "User Management", completed: true },
      { id: "revenue", nameAr: "الإيرادات", nameEn: "Revenue", completed: true },
      { id: "governance", nameAr: "الحوكمة", nameEn: "Governance", completed: true },
      { id: "activity", nameAr: "سجل النشاط", nameEn: "Activity Log", completed: true },
    ]
  },
  {
    path: "/owner-control-center",
    nameAr: "مركز التحكم",
    nameEn: "Control Center",
    icon: Target,
    category: "owner",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "commands", nameAr: "الأوامر", nameEn: "Commands", completed: true },
      { id: "monitoring", nameAr: "المراقبة", nameEn: "Monitoring", completed: false },
    ]
  },
  {
    path: "/sovereign-workspace",
    nameAr: "مساحة العمل السيادية",
    nameEn: "Sovereign Workspace",
    icon: Rocket,
    category: "owner",
    tasks: [
      { id: "ide", nameAr: "بيئة التطوير", nameEn: "IDE", completed: true },
      { id: "terminal", nameAr: "الطرفية", nameEn: "Terminal", completed: true },
      { id: "preview", nameAr: "المعاينة", nameEn: "Preview", completed: true },
      { id: "ai", nameAr: "مساعد AI", nameEn: "AI Assistant", completed: true },
      { id: "deploy", nameAr: "النشر", nameEn: "Deployment", completed: false },
    ]
  },
  // Security Pages
  {
    path: "/military-security",
    nameAr: "الأمان العسكري",
    nameEn: "Military Security",
    icon: ShieldCheck,
    category: "security",
    tasks: [
      { id: "fips", nameAr: "FIPS 140-3", nameEn: "FIPS 140-3", completed: true },
      { id: "pki", nameAr: "PKI/X.509", nameEn: "PKI/X.509", completed: true },
      { id: "sbom", nameAr: "SBOM Generator", nameEn: "SBOM Generator", completed: true },
      { id: "incident", nameAr: "الاستجابة للحوادث", nameEn: "Incident Response", completed: true },
      { id: "zero-trust", nameAr: "Zero Trust", nameEn: "Zero Trust", completed: false },
    ]
  },
  {
    path: "/sovereign-permissions",
    nameAr: "الصلاحيات السيادية",
    nameEn: "Sovereign Permissions",
    icon: Lock,
    category: "security",
    tasks: [
      { id: "64-perms", nameAr: "64 صلاحية", nameEn: "64 Permissions", completed: true },
      { id: "12-cats", nameAr: "12 فئة", nameEn: "12 Categories", completed: true },
      { id: "roles", nameAr: "الأدوار", nameEn: "Roles", completed: true },
      { id: "audit", nameAr: "سجل التدقيق", nameEn: "Audit Log", completed: false },
    ]
  },
  // AI Pages
  {
    path: "/nova-ai-dashboard",
    nameAr: "لوحة Nova AI",
    nameEn: "Nova AI Dashboard",
    icon: Brain,
    category: "ai",
    tasks: [
      { id: "status", nameAr: "حالة النظام", nameEn: "System Status", completed: true },
      { id: "memory", nameAr: "الذاكرة", nameEn: "Memory", completed: true },
      { id: "context", nameAr: "السياق", nameEn: "Context", completed: true },
      { id: "decisions", nameAr: "القرارات", nameEn: "Decisions", completed: false },
      { id: "learning", nameAr: "التعلم", nameEn: "Learning", completed: false },
    ]
  },
  {
    path: "/nova-sovereign-dashboard",
    nameAr: "لوحة Nova السيادية",
    nameEn: "Nova Sovereign Dashboard",
    icon: Crown,
    category: "ai",
    tasks: [
      { id: "governance", nameAr: "الحوكمة", nameEn: "Governance", completed: true },
      { id: "policies", nameAr: "السياسات", nameEn: "Policies", completed: true },
      { id: "decisions", nameAr: "القرارات", nameEn: "Decisions", completed: true },
      { id: "kill-switch", nameAr: "مفتاح الإيقاف", nameEn: "Kill Switch", completed: true },
    ]
  },
  {
    path: "/infera-agent",
    nameAr: "وكيل إنفرا",
    nameEn: "INFERA Agent",
    icon: Bot,
    category: "ai",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "chat", nameAr: "المحادثة", nameEn: "Chat", completed: true },
      { id: "actions", nameAr: "الإجراءات", nameEn: "Actions", completed: false },
      { id: "memory", nameAr: "الذاكرة", nameEn: "Memory", completed: false },
    ]
  },
  // Development Pages
  {
    path: "/testing-generator",
    nameAr: "مولد الاختبارات",
    nameEn: "Testing Generator",
    icon: TestTube,
    category: "development",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "unit", nameAr: "اختبارات الوحدة", nameEn: "Unit Tests", completed: false },
      { id: "integration", nameAr: "اختبارات التكامل", nameEn: "Integration Tests", completed: false },
      { id: "e2e", nameAr: "اختبارات E2E", nameEn: "E2E Tests", completed: false },
    ]
  },
  {
    path: "/backend-generator",
    nameAr: "مولد الباك إند",
    nameEn: "Backend Generator",
    icon: Server,
    category: "development",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "api", nameAr: "توليد API", nameEn: "API Generation", completed: false },
      { id: "db", nameAr: "قاعدة البيانات", nameEn: "Database", completed: false },
      { id: "auth", nameAr: "المصادقة", nameEn: "Authentication", completed: false },
    ]
  },
  {
    path: "/cicd-pipeline",
    nameAr: "خط أنابيب CI/CD",
    nameEn: "CI/CD Pipeline",
    icon: Workflow,
    category: "development",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "github", nameAr: "تكامل GitHub", nameEn: "GitHub Integration", completed: true },
      { id: "docker", nameAr: "Docker", nameEn: "Docker", completed: false },
      { id: "deploy", nameAr: "النشر التلقائي", nameEn: "Auto Deploy", completed: false },
    ]
  },
  {
    path: "/git-control",
    nameAr: "تحكم Git",
    nameEn: "Git Control",
    icon: GitBranch,
    category: "development",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "commits", nameAr: "الـ Commits", nameEn: "Commits", completed: true },
      { id: "branches", nameAr: "الفروع", nameEn: "Branches", completed: false },
      { id: "merge", nameAr: "الدمج", nameEn: "Merge", completed: false },
    ]
  },
  {
    path: "/collaboration",
    nameAr: "التعاون",
    nameEn: "Collaboration",
    icon: Users,
    category: "development",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "realtime", nameAr: "التحرير المباشر", nameEn: "Realtime Editing", completed: false },
      { id: "chat", nameAr: "الدردشة", nameEn: "Chat", completed: false },
      { id: "presence", nameAr: "التواجد", nameEn: "Presence", completed: false },
    ]
  },
  {
    path: "/templates",
    nameAr: "القوالب",
    nameEn: "Templates",
    icon: LayoutTemplate,
    category: "development",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "list", nameAr: "قائمة القوالب", nameEn: "Template List", completed: true },
      { id: "create", nameAr: "إنشاء من قالب", nameEn: "Create from Template", completed: false },
    ]
  },
  {
    path: "/marketplace",
    nameAr: "السوق",
    nameEn: "Marketplace",
    icon: Store,
    category: "development",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "extensions", nameAr: "الإضافات", nameEn: "Extensions", completed: false },
      { id: "install", nameAr: "التثبيت", nameEn: "Install", completed: false },
    ]
  },
  {
    path: "/maps",
    nameAr: "الخرائط",
    nameEn: "Maps",
    icon: Map,
    category: "development",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "google", nameAr: "خرائط Google", nameEn: "Google Maps", completed: false },
    ]
  },
  // Platform Landing Pages
  {
    path: "/shieldgrid-landing",
    nameAr: "ShieldGrid",
    nameEn: "ShieldGrid",
    icon: Shield,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/globalcloud-landing",
    nameAr: "GlobalCloud",
    nameEn: "GlobalCloud",
    icon: Globe,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/humaniq-landing",
    nameAr: "HumanIQ",
    nameEn: "HumanIQ",
    icon: Users,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/finance-landing",
    nameAr: "Finance AI",
    nameEn: "Finance AI",
    icon: TrendingUp,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/legal-landing",
    nameAr: "Legal AI",
    nameEn: "Legal AI",
    icon: Scale,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/marketing-landing",
    nameAr: "Marketing AI",
    nameEn: "Marketing AI",
    icon: Megaphone,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/education-landing",
    nameAr: "Education Hub",
    nameEn: "Education Hub",
    icon: GraduationCap,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/hospitality-landing",
    nameAr: "Hospitality AI",
    nameEn: "Hospitality AI",
    icon: Hotel,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/trainai-landing",
    nameAr: "TrainAI",
    nameEn: "TrainAI",
    icon: Train,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/cvbuilder-landing",
    nameAr: "CV Builder",
    nameEn: "CV Builder",
    icon: FileText,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/jobs-landing",
    nameAr: "Jobs AI",
    nameEn: "Jobs AI",
    icon: Briefcase,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/feasibility-landing",
    nameAr: "Feasibility",
    nameEn: "Feasibility",
    icon: FileSearch,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  {
    path: "/appforge-landing",
    nameAr: "AppForge",
    nameEn: "AppForge",
    icon: Package,
    category: "platforms",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "features", nameAr: "الميزات", nameEn: "Features", completed: true },
      { id: "pricing", nameAr: "الأسعار", nameEn: "Pricing", completed: false },
    ]
  },
  // Business Pages
  {
    path: "/pricing",
    nameAr: "الأسعار",
    nameEn: "Pricing",
    icon: CreditCard,
    category: "business",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "plans", nameAr: "الخطط", nameEn: "Plans", completed: true },
      { id: "stripe", nameAr: "تكامل Stripe", nameEn: "Stripe Integration", completed: true },
      { id: "checkout", nameAr: "الدفع", nameEn: "Checkout", completed: true },
    ]
  },
  {
    path: "/analytics",
    nameAr: "التحليلات",
    nameEn: "Analytics",
    icon: BarChart3,
    category: "business",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "charts", nameAr: "الرسوم البيانية", nameEn: "Charts", completed: true },
      { id: "export", nameAr: "التصدير", nameEn: "Export", completed: false },
    ]
  },
  {
    path: "/settings",
    nameAr: "الإعدادات",
    nameEn: "Settings",
    icon: Settings,
    category: "core",
    tasks: [
      { id: "profile", nameAr: "الملف الشخصي", nameEn: "Profile", completed: true },
      { id: "security", nameAr: "الأمان", nameEn: "Security", completed: true },
      { id: "notifications", nameAr: "الإشعارات", nameEn: "Notifications", completed: false },
      { id: "api-keys", nameAr: "مفاتيح API", nameEn: "API Keys", completed: false },
    ]
  },
  {
    path: "/page-performance-monitor",
    nameAr: "مراقب الأداء",
    nameEn: "Performance Monitor",
    icon: Activity,
    category: "development",
    tasks: [
      { id: "ui", nameAr: "واجهة المستخدم", nameEn: "UI Design", completed: true },
      { id: "metrics", nameAr: "المقاييس", nameEn: "Metrics", completed: true },
      { id: "issues", nameAr: "المشاكل", nameEn: "Issues", completed: true },
      { id: "solutions", nameAr: "الحلول", nameEn: "Solutions", completed: true },
    ]
  },
];

const CATEGORY_LABELS = {
  core: { ar: "الصفحات الأساسية", en: "Core Pages", color: "bg-blue-500" },
  owner: { ar: "صفحات المالك", en: "Owner Pages", color: "bg-purple-500" },
  development: { ar: "صفحات التطوير", en: "Development Pages", color: "bg-green-500" },
  platforms: { ar: "صفحات المنصات", en: "Platform Pages", color: "bg-orange-500" },
  security: { ar: "صفحات الأمان", en: "Security Pages", color: "bg-red-500" },
  ai: { ar: "صفحات الذكاء", en: "AI Pages", color: "bg-cyan-500" },
  business: { ar: "صفحات الأعمال", en: "Business Pages", color: "bg-yellow-500" },
};

export default function PagesCompletionTracker() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const calculateCompletion = (tasks: CompletionTask[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const filteredPages = useMemo(() => {
    return PAGES_COMPLETION.filter(page => {
      const matchesSearch = searchTerm === "" || 
        page.nameAr.includes(searchTerm) || 
        page.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.path.includes(searchTerm);
      const matchesCategory = selectedCategory === "all" || page.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const overallStats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    PAGES_COMPLETION.forEach(page => {
      totalTasks += page.tasks.length;
      completedTasks += page.tasks.filter(t => t.completed).length;
    });
    return {
      totalPages: PAGES_COMPLETION.length,
      totalTasks,
      completedTasks,
      percentage: Math.round((completedTasks / totalTasks) * 100)
    };
  }, []);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; pages: number }> = {};
    Object.keys(CATEGORY_LABELS).forEach(cat => {
      stats[cat] = { total: 0, completed: 0, pages: 0 };
    });
    PAGES_COMPLETION.forEach(page => {
      stats[page.category].pages++;
      stats[page.category].total += page.tasks.length;
      stats[page.category].completed += page.tasks.filter(t => t.completed).length;
    });
    return stats;
  }, []);

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-500";
    if (percentage >= 75) return "text-blue-500";
    if (percentage >= 50) return "text-yellow-500";
    if (percentage >= 25) return "text-orange-500";
    return "text-red-500";
  };

  const getCompletionBadge = (percentage: number) => {
    if (percentage >= 100) return { variant: "default" as const, label: isArabic ? "مكتمل" : "Complete" };
    if (percentage >= 75) return { variant: "secondary" as const, label: isArabic ? "متقدم" : "Advanced" };
    if (percentage >= 50) return { variant: "outline" as const, label: isArabic ? "متوسط" : "In Progress" };
    return { variant: "destructive" as const, label: isArabic ? "مبكر" : "Early" };
  };

  return (
    <div className="min-h-screen bg-background" dir={isArabic ? "rtl" : "ltr"}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">
              {isArabic ? "تتبع نسب الإكتمال" : "Completion Tracker"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isArabic 
                ? "متابعة تقدم العمل في كل صفحة من صفحات WebNova"
                : "Track work progress for each WebNova page"}
            </p>
          </div>
          <Link href="/page-performance-monitor">
            <Button variant="outline" data-testid="button-performance-monitor">
              <Activity className="w-4 h-4 mr-2" />
              {isArabic ? "مراقب الأداء" : "Performance Monitor"}
            </Button>
          </Link>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "الإكتمال الكلي" : "Overall Completion"}
                  </p>
                  <p className={`text-3xl font-bold ${getCompletionColor(overallStats.percentage)}`}>
                    {overallStats.percentage}%
                  </p>
                </div>
                <CheckCircle className={`w-12 h-12 ${getCompletionColor(overallStats.percentage)}`} />
              </div>
              <Progress value={overallStats.percentage} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "إجمالي الصفحات" : "Total Pages"}
                  </p>
                  <p className="text-3xl font-bold">{overallStats.totalPages}</p>
                </div>
                <Layers className="w-12 h-12 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "المهام المكتملة" : "Completed Tasks"}
                  </p>
                  <p className="text-3xl font-bold text-green-500">{overallStats.completedTasks}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "المهام المتبقية" : "Remaining Tasks"}
                  </p>
                  <p className="text-3xl font-bold text-orange-500">
                    {overallStats.totalTasks - overallStats.completedTasks}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Stats */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "إكتمال الفئات" : "Category Completion"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const stats = categoryStats[key];
                const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                return (
                  <div 
                    key={key}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCategory === key ? "ring-2 ring-primary" : "hover-elevate"
                    }`}
                    onClick={() => setSelectedCategory(selectedCategory === key ? "all" : key)}
                    data-testid={`category-${key}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${label.color}`} />
                      <span className="text-sm font-medium">
                        {isArabic ? label.ar : label.en}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{percentage}%</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.pages} {isArabic ? "صفحة" : "pages"}
                    </div>
                    <Progress value={percentage} className="mt-2 h-1" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isArabic ? "بحث عن صفحة..." : "Search pages..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          {selectedCategory !== "all" && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory("all")}
              data-testid="button-clear-filter"
            >
              {isArabic ? "عرض الكل" : "Show All"}
            </Button>
          )}
        </div>

        {/* Pages Grid */}
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {filteredPages.map((page) => {
              const completion = calculateCompletion(page.tasks);
              const completedCount = page.tasks.filter(t => t.completed).length;
              const badge = getCompletionBadge(completion);
              const Icon = page.icon;
              const categoryLabel = CATEGORY_LABELS[page.category];

              return (
                <Card key={page.path} className="overflow-visible" data-testid={`card-page-${page.path.replace(/\//g, '-')}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${categoryLabel.color} bg-opacity-20`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {isArabic ? page.nameAr : page.nameEn}
                          </CardTitle>
                          <code className="text-xs text-muted-foreground">{page.path}</code>
                        </div>
                      </div>
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-2xl font-bold ${getCompletionColor(completion)}`}>
                          {completion}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {completedCount}/{page.tasks.length} {isArabic ? "مهمة" : "tasks"}
                        </span>
                      </div>
                      <Progress value={completion} className="h-2" />
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                      {page.tasks.map((task) => (
                        <div 
                          key={task.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          {task.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={task.completed ? "text-muted-foreground line-through" : ""}>
                            {isArabic ? task.nameAr : task.nameEn}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action */}
                    <Link href={page.path}>
                      <Button variant="outline" className="w-full" size="sm" data-testid={`button-visit-${page.path.replace(/\//g, '-')}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {isArabic ? "زيارة الصفحة" : "Visit Page"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
