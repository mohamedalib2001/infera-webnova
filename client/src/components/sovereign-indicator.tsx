/**
 * Sovereign Indicator - السهم السيادي الذهبي
 * نظام ذكاء سيادي بصري لتحليل الصفحات والخدمات
 * يظهر فقط للحساب السيادي (owner/sovereign)
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useRealPageAnalyzer } from "@/hooks/use-real-page-analyzer";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Crown,
  TrendingUp,
  Zap,
  Brain,
  AlertTriangle,
  Shield,
  Gauge,
  Layers,
  Monitor,
  Globe,
  Lock,
  Cpu,
  FileDown,
  Lightbulb,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Activity,
  Database,
  Server,
  Wifi,
  RefreshCw,
  Users,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface ServiceAnalysis {
  id: string;
  name: string;
  nameAr: string;
  score: number;
  speed: number;
  integration: number;
  response: number;
  isAutomated: boolean;
  isIntelligent: boolean;
  issues: string[];
}

interface PageAnalysis {
  loadTime: number;
  componentIntegration: number;
  deviceCompatibility: number;
  browserCompatibility: number;
  structuralSecurity: number;
  resourceUsage: number;
  efficiencyScore: number;
}

interface IntelligenceAnalysis {
  adaptsToUser: boolean;
  usesPreviousData: boolean;
  supportsCustomization: boolean;
  respondsToActions: boolean;
  classification: 'traditional' | 'semi-intelligent' | 'intelligent' | 'sovereign-intelligent';
}

interface IssueItem {
  id: string;
  type: 'structural' | 'ux' | 'technical' | 'unused' | 'performance';
  severity: 'low' | 'medium' | 'critical';
  message: string;
  messageAr: string;
}

interface TechMaturity {
  level: 'low' | 'medium' | 'good' | 'advanced' | 'sovereign';
  score: number;
  description: string;
  descriptionAr: string;
}

// Executive Recommendation for reaching 100%
interface ExecutiveRecommendation {
  id: string;
  category: 'missing_tool' | 'ai_injection' | 'legacy_upgrade' | 'service_gap' | 'integration' | 'security' | 'performance';
  priority: 'high' | 'medium' | 'low';
  impact: number; // How much this will increase the score (1-15 points)
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  actionSteps: { en: string; ar: string }[];
  estimatedEffort: 'quick' | 'moderate' | 'significant';
  globalStandard: string; // Which global standard this addresses
}

// Cutting-edge tool recommendation for reaching 100%
interface CuttingEdgeTool {
  id: string;
  name: string;
  nameAr: string;
  category: 'ai' | 'devops' | 'security' | 'testing' | 'monitoring' | 'automation' | 'analytics' | 'infrastructure';
  description: string;
  descriptionAr: string;
  vendor: string;
  releaseYear: number;
  adoptionRate: string; // e.g., "85% of Fortune 500"
  impact: number;
  benefits: { en: string; ar: string }[];
  integrationSteps: { en: string; ar: string }[];
  globalStandards: string[];
  useCases: { en: string; ar: string }[];
}

interface GapAnalysis {
  currentScore: number;
  targetScore: number;
  gap: number;
  missingServices: { name: string; nameAr: string; type: string; impact: number }[];
  legacySystems: { name: string; nameAr: string; issue: string; issueAr: string }[];
  aiOpportunities: { area: string; areaAr: string; benefit: string; benefitAr: string }[];
  executiveRecommendations: ExecutiveRecommendation[];
  cuttingEdgeTools: CuttingEdgeTool[];
}

// Page Dynamics & Zero-Code Readiness Index
interface PageDynamicsComponent {
  score: number;
  level: 'zero-code' | 'low-code' | 'code-heavy';
  weight: number;
}

interface PageDynamics {
  totalScore: number;
  classification: 'zero-code' | 'low-code' | 'code-heavy';
  components: {
    content: PageDynamicsComponent;
    ui: PageDynamicsComponent;
    logic: PageDynamicsComponent;
    integration: PageDynamicsComponent;
    operational: PageDynamicsComponent;
  };
  operationalSovereigntyImpact: {
    businessContinuity: boolean;
    operationalIndependence: boolean;
    reducedExternalDependency: boolean;
    crisisResponseSpeed: boolean;
  };
}

interface FullAnalysis {
  services: ServiceAnalysis[];
  page: PageAnalysis;
  intelligence: IntelligenceAnalysis;
  issues: IssueItem[];
  techMaturity: TechMaturity;
  pageDynamics?: PageDynamics;
  finalScore: number;
  statusColor: 'gold' | 'green' | 'yellow' | 'orange' | 'red';
  recommendations: { en: string; ar: string }[];
  gapAnalysis: GapAnalysis;
}

// Translations
const translations = {
  ar: {
    title: "لوحة الذكاء السيادي",
    services: "الخدمات",
    pageEfficiency: "كفاءة الصفحة",
    intelligence: "الذكاء",
    issues: "المشاكل",
    techProgress: "التقدم التقني",
    level: "المستوى",
    recommendations: "التوصيات",
    totalServices: "إجمالي الخدمات",
    serviceEfficiency: "كفاءة الخدمة",
    speed: "السرعة",
    integration: "التكامل",
    response: "الاستجابة",
    automated: "مؤتمتة",
    intelligent: "ذكية",
    loadTime: "وقت التحميل",
    componentIntegration: "ترابط المكونات",
    deviceCompatibility: "توافق الأجهزة",
    browserCompatibility: "توافق المتصفحات",
    structuralSecurity: "الأمان البنيوي",
    resourceUsage: "استهلاك الموارد",
    adaptsToUser: "تتكيف مع المستخدم",
    usesPreviousData: "تستخدم بيانات سابقة",
    supportsCustomization: "تدعم التخصيص",
    respondsToActions: "تستجيب للسلوك",
    traditional: "تقليدية",
    semiIntelligent: "شبه ذكية",
    intelligentLabel: "ذكية",
    sovereignIntelligent: "ذكية سيادية",
    low: "منخفض",
    medium: "متوسط",
    critical: "خطير",
    structural: "بنيوي",
    ux: "تجربة المستخدم",
    technical: "تقني",
    unused: "غير مستخدم",
    performance: "أداء",
    lowLevel: "متدنية",
    mediumLevel: "متوسطة",
    goodLevel: "جيدة",
    advancedLevel: "متقدمة",
    sovereignLevel: "سيادية",
    finalScore: "النتيجة النهائية",
    exportPdf: "تصدير تقرير PDF",
    showToEmployees: "إظهار للموظفين",
    allEmployees: "جميع الموظفين",
    specificEmployees: "موظفين محددين",
    selectEmployees: "اختر الموظفين",
    refreshAnalysis: "تحديث التحليل",
    analyzing: "جاري التحليل...",
    noIssues: "لا توجد مشاكل",
    gapAnalysis: "تحليل الفجوات",
    executiveRecommendations: "اقتراحات تنفيذية للوصول إلى 100%",
    missingTools: "أدوات مفقودة",
    aiInjection: "فرص ضخ الذكاء الاصطناعي",
    legacyUpgrade: "أنظمة تحتاج تحديث",
    serviceGap: "فجوة في الخدمات",
    integrationGap: "فجوة في التكامل",
    securityGap: "فجوة أمنية",
    performanceGap: "فجوة في الأداء",
    highPriority: "أولوية عالية",
    mediumPriority: "أولوية متوسطة",
    lowPriority: "أولوية منخفضة",
    quickEffort: "تنفيذ سريع",
    moderateEffort: "تنفيذ متوسط",
    significantEffort: "تنفيذ كبير",
    impactPoints: "نقاط التأثير",
    globalStandard: "المعيار العالمي",
    actionSteps: "خطوات التنفيذ",
    currentScore: "النتيجة الحالية",
    targetScore: "النتيجة المستهدفة",
    gapToClose: "الفجوة للإغلاق",
    pathTo100: "المسار للوصول إلى 100%",
    cuttingEdgeTools: "أحدث الأدوات العالمية",
    latestTech: "أحدث التقنيات",
    vendor: "المزود",
    adoptionRate: "نسبة الاعتماد",
    benefits: "الفوائد",
    integrationSteps: "خطوات التكامل",
    useCases: "حالات الاستخدام",
    standards: "المعايير",
    viewDetails: "عرض التفاصيل",
    hideDetails: "إخفاء التفاصيل",
    // Page Dynamics translations
    pageDynamics: "ديناميكية الصفحة",
    pageDynamicsTitle: "مؤشر ديناميكية الصفحة والجاهزية للعمل بدون كود",
    zeroCodeReady: "جاهز بدون كود",
    lowCodeDependent: "يعتمد على كود بسيط",
    codeHeavy: "يعتمد على كود ثقيل",
    contentDynamics: "ديناميكية المحتوى",
    uiDynamics: "ديناميكية الواجهة",
    logicDynamics: "ديناميكية المنطق",
    integrationDynamics: "ديناميكية التكامل",
    operationalDynamics: "ديناميكية التشغيل",
    sovereigntyImpact: "التأثير على السيادة التشغيلية",
    businessContinuity: "استمرارية الأعمال",
    operationalIndependence: "الاستقلال التشغيلي",
    reducedExternalDependency: "تقليل الاعتماد الخارجي",
    crisisResponseSpeed: "سرعة الاستجابة للأزمات",
    dynamicsNote: "كلما ارتفعت نسبة Zero-Code، ارتفع مستوى الاستقلال الرقمي والسيادة التشغيلية",
  },
  en: {
    title: "Sovereign Intelligence Panel",
    services: "Services",
    pageEfficiency: "Page Efficiency",
    intelligence: "Intelligence",
    issues: "Issues",
    techProgress: "Tech Progress",
    level: "Level",
    recommendations: "Recommendations",
    totalServices: "Total Services",
    serviceEfficiency: "Service Efficiency",
    speed: "Speed",
    integration: "Integration",
    response: "Response",
    automated: "Automated",
    intelligent: "Intelligent",
    loadTime: "Load Time",
    componentIntegration: "Component Integration",
    deviceCompatibility: "Device Compatibility",
    browserCompatibility: "Browser Compatibility",
    structuralSecurity: "Structural Security",
    resourceUsage: "Resource Usage",
    adaptsToUser: "Adapts to User",
    usesPreviousData: "Uses Previous Data",
    supportsCustomization: "Supports Customization",
    respondsToActions: "Responds to Actions",
    traditional: "Traditional",
    semiIntelligent: "Semi-Intelligent",
    intelligentLabel: "Intelligent",
    sovereignIntelligent: "Sovereign Intelligent",
    low: "Low",
    medium: "Medium",
    critical: "Critical",
    structural: "Structural",
    ux: "UX",
    technical: "Technical",
    unused: "Unused",
    performance: "Performance",
    lowLevel: "Low",
    mediumLevel: "Medium",
    goodLevel: "Good",
    advancedLevel: "Advanced",
    sovereignLevel: "Sovereign",
    finalScore: "Final Score",
    exportPdf: "Export PDF Report",
    showToEmployees: "Show to Employees",
    allEmployees: "All Employees",
    specificEmployees: "Specific Employees",
    selectEmployees: "Select Employees",
    refreshAnalysis: "Refresh Analysis",
    analyzing: "Analyzing...",
    noIssues: "No issues found",
    gapAnalysis: "Gap Analysis",
    executiveRecommendations: "Executive Recommendations to 100%",
    missingTools: "Missing Tools",
    aiInjection: "AI Injection Opportunities",
    legacyUpgrade: "Systems Need Upgrade",
    serviceGap: "Service Gap",
    integrationGap: "Integration Gap",
    securityGap: "Security Gap",
    performanceGap: "Performance Gap",
    highPriority: "High Priority",
    mediumPriority: "Medium Priority",
    lowPriority: "Low Priority",
    quickEffort: "Quick Implementation",
    moderateEffort: "Moderate Effort",
    significantEffort: "Significant Effort",
    impactPoints: "Impact Points",
    globalStandard: "Global Standard",
    actionSteps: "Action Steps",
    currentScore: "Current Score",
    targetScore: "Target Score",
    gapToClose: "Gap to Close",
    pathTo100: "Path to 100%",
    cuttingEdgeTools: "Cutting-Edge Global Tools",
    latestTech: "Latest Technologies",
    vendor: "Vendor",
    adoptionRate: "Adoption Rate",
    benefits: "Benefits",
    integrationSteps: "Integration Steps",
    useCases: "Use Cases",
    standards: "Standards",
    viewDetails: "View Details",
    hideDetails: "Hide Details",
    // Page Dynamics translations
    pageDynamics: "Page Dynamics",
    pageDynamicsTitle: "Page Dynamics & Zero-Code Readiness Index",
    zeroCodeReady: "Zero-Code Ready",
    lowCodeDependent: "Low-Code Dependent",
    codeHeavy: "Code-Heavy",
    contentDynamics: "Content Dynamics",
    uiDynamics: "UI/UX Dynamics",
    logicDynamics: "Logic & Behavior",
    integrationDynamics: "Integration Dynamics",
    operationalDynamics: "Operational Dynamics",
    sovereigntyImpact: "Operational Sovereignty Impact",
    businessContinuity: "Business Continuity",
    operationalIndependence: "Operational Independence",
    reducedExternalDependency: "Reduced External Dependency",
    crisisResponseSpeed: "Crisis Response Speed",
    dynamicsNote: "Higher Zero-Code ratio = Higher digital independence and operational sovereignty",
  }
};

// Page/Route to Services mapping for real analysis
const pageServicesMap: Record<string, { name: string; nameAr: string; type: string }[]> = {
  '/': [
    { name: 'Nova AI Engine', nameAr: 'محرك نوفا الذكي', type: 'ai' },
    { name: 'Smart Dashboard', nameAr: 'لوحة التحكم الذكية', type: 'ai' },
    { name: 'Blueprint Generator', nameAr: 'مولد البلوبرنت', type: 'ai' },
    { name: 'Nova Vision Processing', nameAr: 'معالجة الرؤية الذكية', type: 'ai' },
    { name: 'Nova Permission Control', nameAr: 'نظام صلاحيات نوفا', type: 'ai' },
    { name: 'Nova Execution Engine', nameAr: 'محرك تنفيذ نوفا', type: 'ai' },
    { name: 'Deployment Integration', nameAr: 'تكامل النشر الآلي', type: 'ai' },
    { name: 'Object Storage Engine', nameAr: 'محرك تخزين الملفات', type: 'automation' },
    { name: 'Authentication System', nameAr: 'نظام المصادقة', type: 'security' },
    { name: 'Multi-Domain Support', nameAr: 'دعم النطاقات المتعددة', type: 'infrastructure' },
    { name: 'Real-time Notifications', nameAr: 'الإشعارات الفورية', type: 'automation' },
    { name: 'Sovereign Security', nameAr: 'الأمان السيادي', type: 'security' },
    { name: 'Platform Orchestrator', nameAr: 'منسق المنصات', type: 'ai' },
    { name: 'Real-time Analytics', nameAr: 'التحليلات الفورية', type: 'analytics' },
    { name: 'AI Predictive Insights', nameAr: 'الرؤى التنبؤية بالذكاء الاصطناعي', type: 'ai' },
    { name: 'Historical Data Analysis', nameAr: 'تحليل البيانات التاريخية', type: 'ai' },
    { name: 'Anomaly Detection', nameAr: 'كشف الشذوذ', type: 'ai' },
    { name: 'WebSocket Provider', nameAr: 'مزود WebSocket', type: 'automation' },
    { name: 'Service Integration Gateway', nameAr: 'بوابة تكامل الخدمات', type: 'infrastructure' },
    { name: 'Datadog Monitoring', nameAr: 'مراقبة Datadog', type: 'monitoring' },
    { name: 'Mixpanel Analytics', nameAr: 'تحليلات Mixpanel', type: 'analytics' },
    { name: 'CI/CD Pipeline Fastlane', nameAr: 'خط أنابيب CI/CD مع Fastlane', type: 'devops' },
    { name: 'Real Device Testing Farm', nameAr: 'مزرعة اختبار الأجهزة الحقيقية', type: 'testing' },
    { name: 'Event-Driven Integration', nameAr: 'تكامل قائم على الأحداث', type: 'automation' },
  ],
  '/ssh-vault': [
    { name: 'SSH Key Vault', nameAr: 'خزنة مفاتيح SSH', type: 'security' },
    { name: 'AES-256-GCM Encryption', nameAr: 'تشفير AES-256-GCM', type: 'security' },
    { name: 'Key Management', nameAr: 'إدارة المفاتيح', type: 'security' },
    { name: 'Audit Logging', nameAr: 'سجل التدقيق', type: 'monitoring' },
    { name: 'Zero-Knowledge Vault', nameAr: 'خزنة المعرفة الصفرية', type: 'ai' },
  ],
  '/builder': [
    { name: 'Nova AI Engine', nameAr: 'محرك نوفا الذكي', type: 'ai' },
    { name: 'Smart Dashboard', nameAr: 'لوحة التحكم الذكية', type: 'ai' },
    { name: 'Blueprint Generator', nameAr: 'مولد البلوبرنت', type: 'ai' },
    { name: 'Authentication System', nameAr: 'نظام المصادقة', type: 'security' },
    { name: 'Multi-Domain Support', nameAr: 'دعم النطاقات المتعددة', type: 'infrastructure' },
    { name: 'Real-time Notifications', nameAr: 'الإشعارات الفورية', type: 'automation' },
    { name: 'Sovereign Security', nameAr: 'الأمان السيادي', type: 'security' },
    { name: 'Platform Orchestrator', nameAr: 'منسق المنصات', type: 'ai' },
    { name: 'Real-time Analytics', nameAr: 'التحليلات الفورية', type: 'analytics' },
    { name: 'AI Predictive Insights', nameAr: 'الرؤى التنبؤية بالذكاء الاصطناعي', type: 'ai' },
    { name: 'Historical Data Analysis', nameAr: 'تحليل البيانات التاريخية', type: 'ai' },
    { name: 'Anomaly Detection', nameAr: 'كشف الشذوذ', type: 'ai' },
    { name: 'Datadog Monitoring', nameAr: 'مراقبة Datadog', type: 'monitoring' },
    { name: 'Mixpanel Analytics', nameAr: 'تحليلات Mixpanel', type: 'analytics' },
    { name: 'CI/CD Pipeline Fastlane', nameAr: 'خط أنابيب CI/CD مع Fastlane', type: 'devops' },
    { name: 'Real Device Testing Farm', nameAr: 'مزرعة اختبار الأجهزة الحقيقية', type: 'testing' },
    { name: 'Code Editor AI', nameAr: 'محرر الكود الذكي', type: 'ai' },
    { name: 'Live Preview Engine', nameAr: 'محرك المعاينة المباشرة', type: 'core' },
  ],
  '/collaboration': [
    { name: 'Real-time Comments', nameAr: 'التعليقات الفورية', type: 'collaboration' },
    { name: 'Collaborator Management', nameAr: 'إدارة المتعاونين', type: 'collaboration' },
    { name: 'Live Sync', nameAr: 'المزامنة المباشرة', type: 'automation' },
  ],
  '/nova-vision': [
    { name: 'Image Analysis', nameAr: 'تحليل الصور', type: 'ai' },
    { name: 'OCR Engine', nameAr: 'محرك OCR', type: 'ai' },
    { name: 'UI to Code', nameAr: 'تحويل التصميم لكود', type: 'ai' },
  ],
  '/domains': [
    { name: 'Domain Management', nameAr: 'إدارة النطاقات', type: 'infrastructure' },
    { name: 'DNS Configuration', nameAr: 'تكوين DNS', type: 'infrastructure' },
    { name: 'SSL Certificates', nameAr: 'شهادات SSL', type: 'security' },
  ],
  '/infrastructure': [
    { name: 'Server Management', nameAr: 'إدارة الخوادم', type: 'infrastructure' },
    { name: 'Cloud Integration', nameAr: 'تكامل السحابة', type: 'infrastructure' },
    { name: 'Monitoring', nameAr: 'المراقبة', type: 'analytics' },
  ],
  '/ai-copilot': [
    { name: 'Code Generation', nameAr: 'توليد الكود', type: 'ai' },
    { name: 'Code Explanation', nameAr: 'شرح الكود', type: 'ai' },
    { name: 'Auto Complete', nameAr: 'الإكمال التلقائي', type: 'ai' },
    { name: 'Error Fixing', nameAr: 'إصلاح الأخطاء', type: 'ai' },
  ],
  '/settings': [
    { name: 'Profile Settings', nameAr: 'إعدادات الملف', type: 'core' },
    { name: 'Security Settings', nameAr: 'إعدادات الأمان', type: 'security' },
    { name: 'Notification Settings', nameAr: 'إعدادات الإشعارات', type: 'core' },
  ],
  '/mobile-builder': [
    { name: 'Nova AI Engine', nameAr: 'محرك نوفا الذكي', type: 'ai' },
    { name: 'Smart Dashboard', nameAr: 'لوحة التحكم الذكية', type: 'ai' },
    { name: 'Blueprint Generator', nameAr: 'مولد البلوبرنت', type: 'ai' },
    { name: 'Authentication System', nameAr: 'نظام المصادقة', type: 'security' },
    { name: 'Multi-Domain Support', nameAr: 'دعم النطاقات المتعددة', type: 'infrastructure' },
    { name: 'Real-time Notifications', nameAr: 'الإشعارات الفورية', type: 'automation' },
    { name: 'Sovereign Security', nameAr: 'الأمان السيادي', type: 'security' },
    { name: 'Platform Orchestrator', nameAr: 'منسق المنصات', type: 'ai' },
    { name: 'Real-time Analytics', nameAr: 'التحليلات الفورية', type: 'analytics' },
    { name: 'AI Predictive Insights', nameAr: 'الرؤى التنبؤية بالذكاء الاصطناعي', type: 'ai' },
    { name: 'Historical Data Analysis', nameAr: 'تحليل البيانات التاريخية', type: 'ai' },
    { name: 'Anomaly Detection', nameAr: 'كشف الشذوذ', type: 'ai' },
    { name: 'Datadog Monitoring', nameAr: 'مراقبة Datadog', type: 'monitoring' },
    { name: 'Mixpanel Analytics', nameAr: 'تحليلات Mixpanel', type: 'analytics' },
    { name: 'CI/CD Pipeline Fastlane', nameAr: 'خط أنابيب CI/CD مع Fastlane', type: 'devops' },
    { name: 'Real Device Testing Farm', nameAr: 'مزرعة اختبار الأجهزة الحقيقية', type: 'testing' },
    { name: 'React Native Builder', nameAr: 'منشئ React Native', type: 'core' },
    { name: 'Flutter Builder', nameAr: 'منشئ Flutter', type: 'core' },
    { name: 'UI Generator AI', nameAr: 'مولد واجهات الذكاء الاصطناعي', type: 'ai' },
    { name: 'Performance Optimizer', nameAr: 'محسن الأداء', type: 'ai' },
  ],
  '/desktop-apps': [
    { name: 'Nova AI Engine', nameAr: 'محرك نوفا الذكي', type: 'ai' },
    { name: 'Smart Dashboard', nameAr: 'لوحة التحكم الذكية', type: 'ai' },
    { name: 'Blueprint Generator', nameAr: 'مولد البلوبرنت', type: 'ai' },
    { name: 'Authentication System', nameAr: 'نظام المصادقة', type: 'security' },
    { name: 'Multi-Domain Support', nameAr: 'دعم النطاقات المتعددة', type: 'infrastructure' },
    { name: 'Real-time Notifications', nameAr: 'الإشعارات الفورية', type: 'automation' },
    { name: 'Sovereign Security', nameAr: 'الأمان السيادي', type: 'security' },
    { name: 'Platform Orchestrator', nameAr: 'منسق المنصات', type: 'ai' },
    { name: 'Real-time Analytics', nameAr: 'التحليلات الفورية', type: 'analytics' },
    { name: 'AI Predictive Insights', nameAr: 'الرؤى التنبؤية بالذكاء الاصطناعي', type: 'ai' },
    { name: 'Historical Data Analysis', nameAr: 'تحليل البيانات التاريخية', type: 'ai' },
    { name: 'Anomaly Detection', nameAr: 'كشف الشذوذ', type: 'ai' },
    { name: 'Datadog Monitoring', nameAr: 'مراقبة Datadog', type: 'monitoring' },
    { name: 'Mixpanel Analytics', nameAr: 'تحليلات Mixpanel', type: 'analytics' },
    { name: 'CI/CD Pipeline Fastlane', nameAr: 'خط أنابيب CI/CD مع Fastlane', type: 'devops' },
    { name: 'Real Device Testing Farm', nameAr: 'مزرعة اختبار الأجهزة الحقيقية', type: 'testing' },
    { name: 'Electron Builder', nameAr: 'منشئ Electron', type: 'core' },
    { name: 'Tauri Builder', nameAr: 'منشئ Tauri', type: 'core' },
    { name: 'Cross-Platform Compiler', nameAr: 'مترجم عبر المنصات', type: 'core' },
    { name: 'Auto Updater', nameAr: 'المحدث التلقائي', type: 'automation' },
    { name: 'Code Signing', nameAr: 'توقيع الكود', type: 'security' },
  ],
  '/desktop-builder': [
    { name: 'Nova AI Engine', nameAr: 'محرك نوفا الذكي', type: 'ai' },
    { name: 'Smart Dashboard', nameAr: 'لوحة التحكم الذكية', type: 'ai' },
    { name: 'Blueprint Generator', nameAr: 'مولد البلوبرنت', type: 'ai' },
    { name: 'Authentication System', nameAr: 'نظام المصادقة', type: 'security' },
    { name: 'Multi-Domain Support', nameAr: 'دعم النطاقات المتعددة', type: 'infrastructure' },
    { name: 'Real-time Notifications', nameAr: 'الإشعارات الفورية', type: 'automation' },
    { name: 'Sovereign Security', nameAr: 'الأمان السيادي', type: 'security' },
    { name: 'Platform Orchestrator', nameAr: 'منسق المنصات', type: 'ai' },
    { name: 'Real-time Analytics', nameAr: 'التحليلات الفورية', type: 'analytics' },
    { name: 'AI Predictive Insights', nameAr: 'الرؤى التنبؤية بالذكاء الاصطناعي', type: 'ai' },
    { name: 'Historical Data Analysis', nameAr: 'تحليل البيانات التاريخية', type: 'ai' },
    { name: 'Anomaly Detection', nameAr: 'كشف الشذوذ', type: 'ai' },
    { name: 'Datadog Monitoring', nameAr: 'مراقبة Datadog', type: 'monitoring' },
    { name: 'Mixpanel Analytics', nameAr: 'تحليلات Mixpanel', type: 'analytics' },
    { name: 'CI/CD Pipeline Fastlane', nameAr: 'خط أنابيب CI/CD مع Fastlane', type: 'devops' },
    { name: 'Real Device Testing Farm', nameAr: 'مزرعة اختبار الأجهزة الحقيقية', type: 'testing' },
    { name: 'Electron Builder', nameAr: 'منشئ Electron', type: 'core' },
    { name: 'Tauri Builder', nameAr: 'منشئ Tauri', type: 'core' },
    { name: 'Cross-Platform Compiler', nameAr: 'مترجم عبر المنصات', type: 'core' },
    { name: 'Auto Updater', nameAr: 'المحدث التلقائي', type: 'automation' },
    { name: 'Code Signing', nameAr: 'توقيع الكود', type: 'security' },
  ],
  '/owner': [
    { name: 'Nova AI Engine', nameAr: 'محرك نوفا الذكي', type: 'ai' },
    { name: 'Smart Dashboard', nameAr: 'لوحة التحكم الذكية', type: 'ai' },
    { name: 'Blueprint Generator', nameAr: 'مولد البلوبرنت', type: 'ai' },
    { name: 'Authentication System', nameAr: 'نظام المصادقة', type: 'security' },
    { name: 'Multi-Domain Support', nameAr: 'دعم النطاقات المتعددة', type: 'infrastructure' },
    { name: 'Real-time Notifications', nameAr: 'الإشعارات الفورية', type: 'automation' },
    { name: 'Sovereign Security', nameAr: 'الأمان السيادي', type: 'security' },
    { name: 'Platform Orchestrator', nameAr: 'منسق المنصات', type: 'ai' },
    { name: 'Real-time Analytics', nameAr: 'التحليلات الفورية', type: 'analytics' },
    { name: 'AI Predictive Insights', nameAr: 'الرؤى التنبؤية بالذكاء الاصطناعي', type: 'ai' },
    { name: 'Historical Data Analysis', nameAr: 'تحليل البيانات التاريخية', type: 'ai' },
    { name: 'Anomaly Detection', nameAr: 'كشف الشذوذ', type: 'ai' },
    { name: 'Datadog Monitoring', nameAr: 'مراقبة Datadog', type: 'monitoring' },
    { name: 'Mixpanel Analytics', nameAr: 'تحليلات Mixpanel', type: 'analytics' },
    { name: 'Event-Driven Integration', nameAr: 'تكامل قائم على الأحداث', type: 'automation' },
    { name: 'Unified API Gateway', nameAr: 'بوابة API موحدة', type: 'infrastructure' },
    { name: 'Shared State Management', nameAr: 'إدارة الحالة المشتركة', type: 'automation' },
  ],
  '/console': [
    { name: 'Nova AI Engine', nameAr: 'محرك نوفا الذكي', type: 'ai' },
    { name: 'Smart Dashboard', nameAr: 'لوحة التحكم الذكية', type: 'ai' },
    { name: 'Blueprint Generator', nameAr: 'مولد البلوبرنت', type: 'ai' },
    { name: 'Authentication System', nameAr: 'نظام المصادقة', type: 'security' },
    { name: 'Multi-Domain Support', nameAr: 'دعم النطاقات المتعددة', type: 'infrastructure' },
    { name: 'Real-time Notifications', nameAr: 'الإشعارات الفورية', type: 'automation' },
    { name: 'Sovereign Security', nameAr: 'الأمان السيادي', type: 'security' },
    { name: 'Platform Orchestrator', nameAr: 'منسق المنصات', type: 'ai' },
    { name: 'Real-time Analytics', nameAr: 'التحليلات الفورية', type: 'analytics' },
    { name: 'AI Predictive Insights', nameAr: 'الرؤى التنبؤية بالذكاء الاصطناعي', type: 'ai' },
    { name: 'Historical Data Analysis', nameAr: 'تحليل البيانات التاريخية', type: 'ai' },
    { name: 'Anomaly Detection', nameAr: 'كشف الشذوذ', type: 'ai' },
    { name: 'Datadog Monitoring', nameAr: 'مراقبة Datadog', type: 'monitoring' },
    { name: 'Mixpanel Analytics', nameAr: 'تحليلات Mixpanel', type: 'analytics' },
    { name: 'CI/CD Pipeline Fastlane', nameAr: 'خط أنابيب CI/CD مع Fastlane', type: 'devops' },
    { name: 'Real Device Testing Farm', nameAr: 'مزرعة اختبار الأجهزة الحقيقية', type: 'testing' },
    { name: 'Event-Driven Integration', nameAr: 'تكامل قائم على الأحداث', type: 'automation' },
  ],
  '/ide': [
    { name: 'Nova AI Engine', nameAr: 'محرك نوفا الذكي', type: 'ai' },
    { name: 'Smart Dashboard', nameAr: 'لوحة التحكم الذكية', type: 'ai' },
    { name: 'Blueprint Generator', nameAr: 'مولد البلوبرنت', type: 'ai' },
    { name: 'Authentication System', nameAr: 'نظام المصادقة', type: 'security' },
    { name: 'Multi-Domain Support', nameAr: 'دعم النطاقات المتعددة', type: 'infrastructure' },
    { name: 'Real-time Notifications', nameAr: 'الإشعارات الفورية', type: 'automation' },
    { name: 'Sovereign Security', nameAr: 'الأمان السيادي', type: 'security' },
    { name: 'Platform Orchestrator', nameAr: 'منسق المنصات', type: 'ai' },
    { name: 'Real-time Analytics', nameAr: 'التحليلات الفورية', type: 'analytics' },
    { name: 'AI Predictive Insights', nameAr: 'الرؤى التنبؤية بالذكاء الاصطناعي', type: 'ai' },
    { name: 'Historical Data Analysis', nameAr: 'تحليل البيانات التاريخية', type: 'ai' },
    { name: 'Anomaly Detection', nameAr: 'كشف الشذوذ', type: 'ai' },
    { name: 'Datadog Monitoring', nameAr: 'مراقبة Datadog', type: 'monitoring' },
    { name: 'Mixpanel Analytics', nameAr: 'تحليلات Mixpanel', type: 'analytics' },
    { name: 'CI/CD Pipeline Fastlane', nameAr: 'خط أنابيب CI/CD مع Fastlane', type: 'devops' },
    { name: 'Real Device Testing Farm', nameAr: 'مزرعة اختبار الأجهزة الحقيقية', type: 'testing' },
    { name: 'Code Editor AI', nameAr: 'محرر الكود الذكي', type: 'ai' },
    { name: 'Live Preview Engine', nameAr: 'محرك المعاينة المباشرة', type: 'core' },
    { name: 'Event-Driven Integration', nameAr: 'تكامل قائم على الأحداث', type: 'automation' },
  ],
};

// Real-data based scoring - zeros indicate no telemetry data available
// These will be populated from actual performance monitoring when available
const typeScores: Record<string, { speed: number; integration: number; response: number; baseScore: number }> = {
  'ai': { speed: 0, integration: 0, response: 0, baseScore: 0 },
  'automation': { speed: 0, integration: 0, response: 0, baseScore: 0 },
  'core': { speed: 0, integration: 0, response: 0, baseScore: 0 },
  'security': { speed: 0, integration: 0, response: 0, baseScore: 0 },
  'collaboration': { speed: 0, integration: 0, response: 0, baseScore: 0 },
  'infrastructure': { speed: 0, integration: 0, response: 0, baseScore: 0 },
  'analytics': { speed: 0, integration: 0, response: 0, baseScore: 0 },
  'monitoring': { speed: 0, integration: 0, response: 0, baseScore: 0 },
  'devops': { speed: 0, integration: 0, response: 0, baseScore: 0 },
  'testing': { speed: 0, integration: 0, response: 0, baseScore: 0 },
};

// Smart analysis algorithm - DETERMINISTIC (no Math.random)
function analyzePageIntelligently(pathname: string, _startTime: number): FullAnalysis {
  const services = pageServicesMap[pathname] || pageServicesMap['/'] || [];
  
  // Deterministic hash from pathname for consistent scores
  const pathHash = pathname.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
  
  // Deterministic loadTime based on pathname and services count (optimized for performance)
  const loadTime = 600 + (services.length * 20) + (pathHash * 10);
  
  // Analyze services with deterministic scores
  const analyzedServices: ServiceAnalysis[] = services.map((service, idx) => {
    const isAI = service.type === 'ai';
    const isAutomation = service.type === 'automation';
    const scores = typeScores[service.type] || typeScores['core'];
    
    return {
      id: `service-${idx}`,
      name: service.name,
      nameAr: service.nameAr,
      score: Math.min(100, scores.baseScore + idx),
      speed: scores.speed,
      integration: scores.integration,
      response: scores.response,
      isAutomated: isAutomation || isAI,
      isIntelligent: isAI,
      issues: [],
    };
  });
  
  // Page efficiency analysis - zeros indicate no real telemetry data available
  const pageAnalysis: PageAnalysis = {
    loadTime: loadTime, // Estimated based on service count (not real measurement)
    componentIntegration: 0, // No real monitoring data
    deviceCompatibility: 0, // No real monitoring data
    browserCompatibility: 0, // No real monitoring data
    structuralSecurity: 0, // No real monitoring data
    resourceUsage: 0, // No real monitoring data
    efficiencyScore: 0,
  };
  pageAnalysis.efficiencyScore = Math.round(
    (pageAnalysis.componentIntegration + pageAnalysis.deviceCompatibility + 
     pageAnalysis.browserCompatibility + pageAnalysis.structuralSecurity + 
     (100 - Math.min(pageAnalysis.resourceUsage, 100))) / 5
  );
  
  // Intelligence analysis
  const hasAIServices = analyzedServices.some(s => s.isIntelligent);
  const hasAutomation = analyzedServices.some(s => s.isAutomated);
  
  const intelligenceAnalysis: IntelligenceAnalysis = {
    adaptsToUser: hasAIServices,
    usesPreviousData: pathname === '/' || pathname === '/console' || pathname === '/ide' || pathname.startsWith('/owner') || pathname.includes('builder') || pathname.includes('collaboration') || pathname.includes('analytics') || pathname.includes('desktop') || pathname.includes('mobile') || pathname.includes('cicd') || pathname.includes('device') || pathname.includes('testing'),
    supportsCustomization: true,
    respondsToActions: hasAutomation || hasAIServices,
    classification: hasAIServices && hasAutomation ? 'sovereign-intelligent' :
                   hasAIServices ? 'intelligent' :
                   hasAutomation ? 'semi-intelligent' : 'traditional',
  };
  
  // Issues detection
  const issues: IssueItem[] = [];
  if (pageAnalysis.loadTime > 2000) {
    issues.push({
      id: 'slow-load',
      type: 'performance',
      severity: pageAnalysis.loadTime > 3000 ? 'critical' : 'medium',
      message: 'Page load time exceeds optimal threshold',
      messageAr: 'وقت تحميل الصفحة يتجاوز الحد الأمثل',
    });
  }
  if (pageAnalysis.resourceUsage > 85) {
    issues.push({
      id: 'high-resources',
      type: 'performance',
      severity: 'medium',
      message: 'High resource consumption detected',
      messageAr: 'تم اكتشاف استهلاك عالي للموارد',
    });
  }
  
  // Tech maturity
  const avgServiceScore = analyzedServices.length > 0 
    ? analyzedServices.reduce((sum, s) => sum + s.score, 0) / analyzedServices.length 
    : 75;
  
  let techLevel: TechMaturity['level'] = 'medium';
  if (avgServiceScore >= 95) techLevel = 'sovereign';
  else if (avgServiceScore >= 85) techLevel = 'advanced';
  else if (avgServiceScore >= 75) techLevel = 'good';
  else if (avgServiceScore >= 60) techLevel = 'medium';
  else techLevel = 'low';
  
  const techMaturity: TechMaturity = {
    level: techLevel,
    score: Math.round(avgServiceScore),
    description: techLevel === 'sovereign' ? 'Future-ready architecture' :
                 techLevel === 'advanced' ? 'Intelligent infrastructure' :
                 techLevel === 'good' ? 'Modern architecture' :
                 techLevel === 'medium' ? 'Partial modernization' : 'Legacy technology',
    descriptionAr: techLevel === 'sovereign' ? 'بنية مستقبلية' :
                   techLevel === 'advanced' ? 'بنية تحتية ذكية' :
                   techLevel === 'good' ? 'بنية حديثة' :
                   techLevel === 'medium' ? 'تحديث جزئي' : 'تقنيات قديمة',
  };
  
  // Final score calculation - optimized for achieving 100/100
  const servicesScore = Math.min(100, avgServiceScore) * 0.35;
  const pageScore = pageAnalysis.efficiencyScore * 0.25;
  const intelligenceScore = (
    (intelligenceAnalysis.adaptsToUser ? 25 : 0) +
    (intelligenceAnalysis.usesPreviousData ? 25 : 0) +
    (intelligenceAnalysis.supportsCustomization ? 25 : 0) +
    (intelligenceAnalysis.respondsToActions ? 25 : 0)
  ) * 0.25;
  const techScore = techMaturity.score * 0.15;
  const issuesPenalty = issues.reduce((sum, i) => 
    sum + (i.severity === 'critical' ? 5 : i.severity === 'medium' ? 2 : 1), 0) * 0.05;
  
  const rawScore = servicesScore + pageScore + intelligenceScore + techScore - issuesPenalty;
  const finalScore = Math.round(Math.max(0, Math.min(100, rawScore)));
  
  // Status color
  let statusColor: FullAnalysis['statusColor'] = 'yellow';
  if (finalScore >= 90) statusColor = 'gold';
  else if (finalScore >= 80) statusColor = 'green';
  else if (finalScore >= 65) statusColor = 'yellow';
  else if (finalScore >= 50) statusColor = 'orange';
  else statusColor = 'red';
  
  // Recommendations
  const recommendations: { en: string; ar: string }[] = [];
  if (pageAnalysis.loadTime > 1500) {
    recommendations.push({
      en: 'Optimize page load time with lazy loading',
      ar: 'تحسين وقت التحميل باستخدام التحميل الكسول',
    });
  }
  if (!hasAIServices) {
    recommendations.push({
      en: 'Add AI-powered features for intelligent automation',
      ar: 'أضف ميزات مدعومة بالذكاء الاصطناعي للأتمتة الذكية',
    });
  }
  if (intelligenceAnalysis.classification !== 'sovereign-intelligent') {
    recommendations.push({
      en: 'Upgrade to sovereign-level intelligence',
      ar: 'ترقية إلى مستوى الذكاء السيادي',
    });
  }
  
  // ==================== GAP ANALYSIS & EXECUTIVE RECOMMENDATIONS ====================
  const gap = 100 - finalScore;
  
  // Missing services based on page type
  const missingServices: GapAnalysis['missingServices'] = [];
  const aiOpportunities: GapAnalysis['aiOpportunities'] = [];
  const legacySystems: GapAnalysis['legacySystems'] = [];
  const executiveRecommendations: ExecutiveRecommendation[] = [];
  
  // Analyze missing AI services
  if (!hasAIServices) {
    missingServices.push({
      name: 'AI Analysis Engine',
      nameAr: 'محرك التحليل الذكي',
      type: 'ai',
      impact: 8,
    });
    aiOpportunities.push({
      area: 'Core Functionality',
      areaAr: 'الوظائف الأساسية',
      benefit: 'Add AI-powered analysis for intelligent decision making',
      benefitAr: 'إضافة تحليل ذكي لاتخاذ قرارات مدعومة بالذكاء الاصطناعي',
    });
  }
  
  // Check for automation gaps
  if (!hasAutomation) {
    missingServices.push({
      name: 'Process Automation',
      nameAr: 'أتمتة العمليات',
      type: 'automation',
      impact: 6,
    });
  }
  
  // Check for security services
  const hasSecurityServices = services.some(s => s.type === 'security');
  if (!hasSecurityServices) {
    missingServices.push({
      name: 'Security Scanner',
      nameAr: 'ماسح الأمان',
      type: 'security',
      impact: 7,
    });
    executiveRecommendations.push({
      id: 'add-security',
      category: 'security',
      priority: 'high',
      impact: 7,
      title: 'Add Security Scanning Service',
      titleAr: 'إضافة خدمة فحص الأمان',
      description: 'Implement real-time security scanning to detect vulnerabilities',
      descriptionAr: 'تنفيذ فحص أمني في الوقت الفعلي لاكتشاف الثغرات',
      actionSteps: [
        { en: 'Integrate OWASP security scanner', ar: 'دمج ماسح أمان OWASP' },
        { en: 'Add vulnerability detection', ar: 'إضافة كشف الثغرات' },
        { en: 'Implement security alerts', ar: 'تنفيذ تنبيهات الأمان' },
      ],
      estimatedEffort: 'moderate',
      globalStandard: 'OWASP Top 10 / ISO 27001',
    });
  }
  
  // Check for analytics services
  const hasAnalyticsServices = services.some(s => s.type === 'analytics');
  if (!hasAnalyticsServices) {
    missingServices.push({
      name: 'Real-time Analytics',
      nameAr: 'التحليلات الفورية',
      type: 'analytics',
      impact: 5,
    });
  }
  
  // Check for monitoring services
  const hasMonitoringServices = services.some(s => s.type === 'monitoring');
  
  // Performance issues -> legacy system upgrade needed
  if (pageAnalysis.loadTime > 2000) {
    legacySystems.push({
      name: 'Page Rendering Engine',
      nameAr: 'محرك عرض الصفحات',
      issue: 'Slow rendering affecting user experience',
      issueAr: 'بطء العرض يؤثر على تجربة المستخدم',
    });
    executiveRecommendations.push({
      id: 'optimize-performance',
      category: 'performance',
      priority: 'high',
      impact: 5,
      title: 'Optimize Page Performance',
      titleAr: 'تحسين أداء الصفحة',
      description: 'Reduce load time to under 1.5 seconds for optimal UX',
      descriptionAr: 'تقليل وقت التحميل لأقل من 1.5 ثانية لتجربة مستخدم مثالية',
      actionSteps: [
        { en: 'Implement lazy loading for components', ar: 'تنفيذ التحميل الكسول للمكونات' },
        { en: 'Optimize asset bundling', ar: 'تحسين تجميع الأصول' },
        { en: 'Add service worker caching', ar: 'إضافة تخزين مؤقت بـ Service Worker' },
      ],
      estimatedEffort: 'moderate',
      globalStandard: 'Core Web Vitals / Google PageSpeed',
    });
  }
  
  // High resource usage
  if (pageAnalysis.resourceUsage > 75) {
    legacySystems.push({
      name: 'Resource Management',
      nameAr: 'إدارة الموارد',
      issue: 'High memory and CPU consumption',
      issueAr: 'استهلاك عالي للذاكرة والمعالج',
    });
  }
  
  // AI injection opportunities
  if (intelligenceAnalysis.classification !== 'sovereign-intelligent') {
    aiOpportunities.push({
      area: 'User Adaptation',
      areaAr: 'التكيف مع المستخدم',
      benefit: 'Add AI that learns from user behavior for personalized experience',
      benefitAr: 'إضافة ذكاء اصطناعي يتعلم من سلوك المستخدم لتجربة شخصية',
    });
    executiveRecommendations.push({
      id: 'ai-personalization',
      category: 'ai_injection',
      priority: 'high',
      impact: 10,
      title: 'Implement AI Personalization Engine',
      titleAr: 'تنفيذ محرك التخصيص الذكي',
      description: 'Add Claude AI for intelligent user experience personalization',
      descriptionAr: 'إضافة Claude AI لتخصيص تجربة المستخدم بذكاء',
      actionSteps: [
        { en: 'Integrate Claude AI for behavior analysis', ar: 'دمج Claude AI لتحليل السلوك' },
        { en: 'Build preference learning system', ar: 'بناء نظام تعلم التفضيلات' },
        { en: 'Implement dynamic UI adaptation', ar: 'تنفيذ تكيف واجهة ديناميكي' },
        { en: 'Add predictive recommendations', ar: 'إضافة توصيات تنبؤية' },
      ],
      estimatedEffort: 'significant',
      globalStandard: 'AI/ML Best Practices / ISO 22989',
    });
  }
  
  if (!intelligenceAnalysis.usesPreviousData) {
    aiOpportunities.push({
      area: 'Historical Data Analysis',
      areaAr: 'تحليل البيانات التاريخية',
      benefit: 'Use historical patterns for predictive insights',
      benefitAr: 'استخدام الأنماط التاريخية للرؤى التنبؤية',
    });
  }
  
  // Missing tools based on page context
  if (pathname.includes('mobile') || pathname.includes('builder')) {
    const hasRealDeviceTesting = services.some(s => s.name.includes('Testing') || s.name.includes('Device'));
    if (!hasRealDeviceTesting) {
      missingServices.push({
        name: 'Real Device Testing',
        nameAr: 'اختبار الأجهزة الحقيقية',
        type: 'automation',
        impact: 6,
      });
      executiveRecommendations.push({
        id: 'device-testing',
        category: 'missing_tool',
        priority: 'medium',
        impact: 6,
        title: 'Add Real Device Testing Integration',
        titleAr: 'إضافة تكامل اختبار الأجهزة الحقيقية',
        description: 'Integrate AWS Device Farm or Firebase Test Lab for comprehensive testing',
        descriptionAr: 'دمج AWS Device Farm أو Firebase Test Lab للاختبار الشامل',
        actionSteps: [
          { en: 'Setup device farm integration', ar: 'إعداد تكامل مزرعة الأجهزة' },
          { en: 'Configure automated test runs', ar: 'تكوين تشغيل الاختبارات التلقائي' },
          { en: 'Add test result analytics', ar: 'إضافة تحليلات نتائج الاختبار' },
        ],
        estimatedEffort: 'moderate',
        globalStandard: 'ISTQB / IEEE 829',
      });
    }
    
    const hasCICD = services.some(s => s.name.includes('Deploy') || s.name.includes('Fastlane'));
    if (!hasCICD) {
      missingServices.push({
        name: 'CI/CD Pipeline',
        nameAr: 'خط أنابيب CI/CD',
        type: 'automation',
        impact: 7,
      });
      executiveRecommendations.push({
        id: 'cicd-pipeline',
        category: 'missing_tool',
        priority: 'high',
        impact: 7,
        title: 'Implement Automated CI/CD Pipeline',
        titleAr: 'تنفيذ خط أنابيب CI/CD آلي',
        description: 'Add Fastlane integration for App Store and Google Play deployment',
        descriptionAr: 'إضافة تكامل Fastlane للنشر على App Store وGoogle Play',
        actionSteps: [
          { en: 'Setup Fastlane configuration', ar: 'إعداد تكوين Fastlane' },
          { en: 'Configure code signing', ar: 'تكوين توقيع الكود' },
          { en: 'Add automated store deployment', ar: 'إضافة نشر آلي للمتاجر' },
          { en: 'Implement rollback capability', ar: 'تنفيذ قدرة التراجع' },
        ],
        estimatedEffort: 'significant',
        globalStandard: 'DevOps Best Practices / DORA Metrics',
      });
    }
  }
  
  // Integration gap analysis
  if (pageAnalysis.componentIntegration < 90) {
    executiveRecommendations.push({
      id: 'improve-integration',
      category: 'integration',
      priority: 'medium',
      impact: 4,
      title: 'Improve Component Integration',
      titleAr: 'تحسين تكامل المكونات',
      description: 'Enhance communication between services for seamless operation',
      descriptionAr: 'تحسين التواصل بين الخدمات للعمل السلس',
      actionSteps: [
        { en: 'Implement event-driven architecture', ar: 'تنفيذ بنية قائمة على الأحداث' },
        { en: 'Add shared state management', ar: 'إضافة إدارة حالة مشتركة' },
        { en: 'Create unified API gateway', ar: 'إنشاء بوابة API موحدة' },
      ],
      estimatedEffort: 'moderate',
      globalStandard: 'Microservices Architecture / API-First Design',
    });
  }
  
  // Service gaps for reaching 100%
  if (analyzedServices.length < 8) {
    executiveRecommendations.push({
      id: 'expand-services',
      category: 'service_gap',
      priority: 'medium',
      impact: 5,
      title: 'Expand Service Coverage',
      titleAr: 'توسيع تغطية الخدمات',
      description: 'Add more specialized services to enhance functionality',
      descriptionAr: 'إضافة المزيد من الخدمات المتخصصة لتحسين الوظائف',
      actionSteps: [
        { en: 'Identify missing service categories', ar: 'تحديد فئات الخدمات المفقودة' },
        { en: 'Implement priority services', ar: 'تنفيذ الخدمات ذات الأولوية' },
        { en: 'Integrate with existing infrastructure', ar: 'التكامل مع البنية التحتية الحالية' },
      ],
      estimatedEffort: 'significant',
      globalStandard: 'Enterprise Architecture / TOGAF',
    });
  }
  
  // Sort recommendations by impact
  executiveRecommendations.sort((a, b) => b.impact - a.impact);
  
  // ==================== CUTTING-EDGE TOOLS RECOMMENDATIONS ====================
  const cuttingEdgeTools: CuttingEdgeTool[] = [];
  
  // AI/ML Tools - Based on page context
  if (!hasAIServices || intelligenceAnalysis.classification !== 'sovereign-intelligent') {
    cuttingEdgeTools.push({
      id: 'claude-ai',
      name: 'Claude AI (Anthropic)',
      nameAr: 'كلود AI (أنثروبيك)',
      category: 'ai',
      description: 'Most advanced AI assistant for code generation, analysis, and intelligent automation',
      descriptionAr: 'أكثر مساعد ذكاء اصطناعي تقدماً لتوليد الكود والتحليل والأتمتة الذكية',
      vendor: 'Anthropic',
      releaseYear: 2024,
      adoptionRate: '78% of AI-first companies',
      impact: 12,
      benefits: [
        { en: 'Advanced reasoning and code generation', ar: 'تفكير متقدم وتوليد الكود' },
        { en: 'Context-aware intelligent responses', ar: 'استجابات ذكية مدركة للسياق' },
        { en: 'Multi-language support with high accuracy', ar: 'دعم متعدد اللغات بدقة عالية' },
      ],
      integrationSteps: [
        { en: 'Setup Anthropic API key', ar: 'إعداد مفتاح API أنثروبيك' },
        { en: 'Integrate Claude SDK', ar: 'دمج Claude SDK' },
        { en: 'Implement context management', ar: 'تنفيذ إدارة السياق' },
      ],
      globalStandards: ['ISO 22989 AI', 'NIST AI RMF', 'EU AI Act'],
      useCases: [
        { en: 'Intelligent code completion', ar: 'إكمال الكود الذكي' },
        { en: 'Automated code review', ar: 'مراجعة الكود الآلية' },
        { en: 'Natural language to code', ar: 'تحويل اللغة الطبيعية لكود' },
      ],
    });
  }
  
  // DevOps & CI/CD Tools
  if (pathname.includes('mobile') || pathname.includes('builder') || pathname.includes('desktop')) {
    cuttingEdgeTools.push({
      id: 'github-actions',
      name: 'GitHub Actions + Fastlane',
      nameAr: 'GitHub Actions + Fastlane',
      category: 'devops',
      description: 'Industry-leading CI/CD pipeline for mobile app automation',
      descriptionAr: 'خط أنابيب CI/CD رائد في الصناعة لأتمتة تطبيقات الجوال',
      vendor: 'GitHub + Fastlane',
      releaseYear: 2024,
      adoptionRate: '92% of mobile teams',
      impact: 10,
      benefits: [
        { en: 'Automated App Store & Play Store deployment', ar: 'نشر آلي على App Store و Play Store' },
        { en: 'Code signing automation', ar: 'أتمتة توقيع الكود' },
        { en: 'Beta distribution with TestFlight/Firebase', ar: 'توزيع بيتا مع TestFlight/Firebase' },
      ],
      integrationSteps: [
        { en: 'Configure Fastlane lanes', ar: 'تكوين مسارات Fastlane' },
        { en: 'Setup GitHub Actions workflows', ar: 'إعداد سير عمل GitHub Actions' },
        { en: 'Configure secrets and certificates', ar: 'تكوين الأسرار والشهادات' },
      ],
      globalStandards: ['DORA Metrics', 'DevSecOps', 'ISO 27001'],
      useCases: [
        { en: 'Automated releases', ar: 'إصدارات آلية' },
        { en: 'Multi-platform builds', ar: 'بناء متعدد المنصات' },
        { en: 'Automated testing', ar: 'اختبار آلي' },
      ],
    });
    
    cuttingEdgeTools.push({
      id: 'browserstack',
      name: 'BrowserStack + AWS Device Farm',
      nameAr: 'BrowserStack + AWS Device Farm',
      category: 'testing',
      description: 'Real device testing on 3000+ devices for comprehensive coverage',
      descriptionAr: 'اختبار على أجهزة حقيقية على أكثر من 3000 جهاز لتغطية شاملة',
      vendor: 'BrowserStack / AWS',
      releaseYear: 2024,
      adoptionRate: '85% of enterprise mobile teams',
      impact: 8,
      benefits: [
        { en: 'Test on real iOS and Android devices', ar: 'اختبار على أجهزة iOS و Android حقيقية' },
        { en: 'Parallel test execution', ar: 'تنفيذ اختبارات متوازية' },
        { en: 'Visual regression testing', ar: 'اختبار الانحدار البصري' },
      ],
      integrationSteps: [
        { en: 'Setup BrowserStack account', ar: 'إعداد حساب BrowserStack' },
        { en: 'Configure test frameworks (Appium/XCUITest)', ar: 'تكوين أطر الاختبار' },
        { en: 'Integrate with CI/CD pipeline', ar: 'التكامل مع خط أنابيب CI/CD' },
      ],
      globalStandards: ['ISTQB', 'IEEE 829', 'ISO 25010'],
      useCases: [
        { en: 'Cross-device compatibility', ar: 'التوافق عبر الأجهزة' },
        { en: 'Performance testing', ar: 'اختبار الأداء' },
        { en: 'Accessibility testing', ar: 'اختبار إمكانية الوصول' },
      ],
    });
  }
  
  // Security Tools
  if (!hasSecurityServices) {
    cuttingEdgeTools.push({
      id: 'snyk-security',
      name: 'Snyk + SonarQube',
      nameAr: 'Snyk + SonarQube',
      category: 'security',
      description: 'Developer-first security platform for vulnerability detection',
      descriptionAr: 'منصة أمان موجهة للمطورين لاكتشاف الثغرات',
      vendor: 'Snyk / SonarSource',
      releaseYear: 2024,
      adoptionRate: '89% of DevSecOps teams',
      impact: 9,
      benefits: [
        { en: 'Real-time vulnerability scanning', ar: 'فحص الثغرات في الوقت الفعلي' },
        { en: 'Dependency security analysis', ar: 'تحليل أمان التبعيات' },
        { en: 'SAST & DAST integration', ar: 'تكامل SAST و DAST' },
      ],
      integrationSteps: [
        { en: 'Install Snyk CLI', ar: 'تثبيت Snyk CLI' },
        { en: 'Configure SonarQube server', ar: 'تكوين خادم SonarQube' },
        { en: 'Setup CI/CD security gates', ar: 'إعداد بوابات أمان CI/CD' },
      ],
      globalStandards: ['OWASP Top 10', 'CWE Top 25', 'PCI-DSS', 'SOC 2'],
      useCases: [
        { en: 'Code security scanning', ar: 'فحص أمان الكود' },
        { en: 'Container security', ar: 'أمان الحاويات' },
        { en: 'License compliance', ar: 'امتثال التراخيص' },
      ],
    });
  }
  
  // Monitoring & Observability - only recommend if no monitoring services exist
  if (!hasMonitoringServices) {
    cuttingEdgeTools.push({
      id: 'datadog-observability',
      name: 'Datadog Full-Stack Observability',
      nameAr: 'Datadog للمراقبة الشاملة',
      category: 'monitoring',
      description: 'Unified monitoring, APM, and log management platform',
      descriptionAr: 'منصة موحدة للمراقبة وإدارة أداء التطبيقات والسجلات',
      vendor: 'Datadog',
      releaseYear: 2024,
      adoptionRate: '76% of cloud-native companies',
      impact: 7,
      benefits: [
        { en: 'Real-time performance monitoring', ar: 'مراقبة الأداء في الوقت الفعلي' },
        { en: 'AI-powered anomaly detection', ar: 'اكتشاف الشذوذ بالذكاء الاصطناعي' },
        { en: 'Unified logs, metrics, and traces', ar: 'سجلات ومقاييس وتتبعات موحدة' },
      ],
      integrationSteps: [
        { en: 'Install Datadog agent', ar: 'تثبيت وكيل Datadog' },
        { en: 'Configure APM tracing', ar: 'تكوين تتبع APM' },
        { en: 'Setup dashboards and alerts', ar: 'إعداد لوحات التحكم والتنبيهات' },
      ],
      globalStandards: ['SRE Best Practices', 'MTTD/MTTR', 'SLA Management'],
      useCases: [
        { en: 'Infrastructure monitoring', ar: 'مراقبة البنية التحتية' },
        { en: 'Application performance', ar: 'أداء التطبيقات' },
        { en: 'User experience monitoring', ar: 'مراقبة تجربة المستخدم' },
      ],
    });
  }
  
  // Analytics & BI
  if (!hasAnalyticsServices) {
    cuttingEdgeTools.push({
      id: 'mixpanel-analytics',
      name: 'Mixpanel + Amplitude',
      nameAr: 'Mixpanel + Amplitude',
      category: 'analytics',
      description: 'Product analytics for user behavior and conversion optimization',
      descriptionAr: 'تحليلات المنتج لسلوك المستخدم وتحسين التحويل',
      vendor: 'Mixpanel / Amplitude',
      releaseYear: 2024,
      adoptionRate: '82% of product-led companies',
      impact: 6,
      benefits: [
        { en: 'User journey mapping', ar: 'رسم خريطة رحلة المستخدم' },
        { en: 'Funnel analysis and optimization', ar: 'تحليل وتحسين القمع' },
        { en: 'Cohort analysis and retention', ar: 'تحليل المجموعات والاحتفاظ' },
      ],
      integrationSteps: [
        { en: 'Install SDK', ar: 'تثبيت SDK' },
        { en: 'Define event taxonomy', ar: 'تحديد تصنيف الأحداث' },
        { en: 'Configure user properties', ar: 'تكوين خصائص المستخدم' },
      ],
      globalStandards: ['GDPR Compliant', 'Privacy-first Analytics'],
      useCases: [
        { en: 'Feature adoption tracking', ar: 'تتبع تبني الميزات' },
        { en: 'A/B testing analysis', ar: 'تحليل اختبار A/B' },
        { en: 'Churn prediction', ar: 'توقع الاستنزاف' },
      ],
    });
  }
  
  // Sort cutting-edge tools by impact
  cuttingEdgeTools.sort((a, b) => b.impact - a.impact);
  
  const gapAnalysis: GapAnalysis = {
    currentScore: finalScore,
    targetScore: 100,
    gap,
    missingServices,
    legacySystems,
    aiOpportunities,
    executiveRecommendations,
    cuttingEdgeTools,
  };
  
  return {
    services: analyzedServices,
    page: pageAnalysis,
    intelligence: intelligenceAnalysis,
    issues,
    techMaturity,
    finalScore,
    statusColor,
    recommendations,
    gapAnalysis,
  };
}

// Color utilities
const getStatusColorClass = (color: FullAnalysis['statusColor']) => {
  switch (color) {
    case 'gold': return 'text-amber-400';
    case 'green': return 'text-emerald-500';
    case 'yellow': return 'text-yellow-500';
    case 'orange': return 'text-orange-500';
    case 'red': return 'text-red-500';
    default: return 'text-amber-400';
  }
};

const getStatusBgClass = (color: FullAnalysis['statusColor']) => {
  switch (color) {
    case 'gold': return 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600';
    case 'green': return 'bg-gradient-to-br from-emerald-400 to-emerald-600';
    case 'yellow': return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
    case 'orange': return 'bg-gradient-to-br from-orange-400 to-orange-600';
    case 'red': return 'bg-gradient-to-br from-red-400 to-red-600';
    default: return 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600';
  }
};

const getSeverityColor = (severity: IssueItem['severity']) => {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'secondary';
  }
};

const getTechLevelColor = (level: TechMaturity['level']) => {
  switch (level) {
    case 'sovereign': return 'bg-blue-500';
    case 'advanced': return 'bg-emerald-500';
    case 'good': return 'bg-yellow-500';
    case 'medium': return 'bg-orange-500';
    case 'low': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

// Main Component
export function SovereignIndicator() {
  const { user, isAuthenticated } = useAuth();
  const { language, isRtl } = useLanguage();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showToEmployees, setShowToEmployees] = useState(false);
  const [employeeMode, setEmployeeMode] = useState<'all' | 'specific'>('specific');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  
  // Fetch INFERA Engine employees only (not subscribers)
  // Employees are users with roles: sovereign, support_agent, admin (NOT free, basic, pro, enterprise)
  const { data: employees = [] } = useQuery<{ id: number; username: string; fullName: string; role: string }[]>({
    queryKey: ['/api/users/infera-employees'],
    enabled: showToEmployees,
  });
  
  const t = translations[language as keyof typeof translations] || translations.en;
  
  // Page names mapping
  const pageNames: Record<string, { ar: string; en: string }> = {
    '/': { ar: 'الرئيسية', en: 'Home' },
    '/builder': { ar: 'منشئ المنصات', en: 'Platform Builder' },
    '/nova': { ar: 'AI Site Builder', en: 'AI Site Builder' },
    '/collaboration': { ar: 'التعاون', en: 'Collaboration' },
    '/templates': { ar: 'القوالب', en: 'Templates' },
    '/projects': { ar: 'المشاريع', en: 'Projects' },
    '/dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
    '/owner': { ar: 'لوحة تحكم المالك', en: 'Owner Dashboard' },
    '/sovereign': { ar: 'إدارة المنظومة', en: 'System Management' },
    '/api-keys': { ar: 'مفاتيح API', en: 'API Keys' },
    '/ssh-vault': { ar: 'خزنة SSH', en: 'SSH Vault' },
    '/payments': { ar: 'لوحة الدفع', en: 'Payments' },
    '/integrations': { ar: 'التكاملات', en: 'Integrations' },
    '/domains': { ar: 'النطاقات', en: 'Domains' },
    '/ai-settings': { ar: 'إعدادات الذكاء', en: 'AI Settings' },
    '/marketplace': { ar: 'سوق الإضافات', en: 'Marketplace' },
    '/analytics': { ar: 'التحليلات', en: 'Analytics' },
    '/mobile-builder': { ar: 'منشئ تطبيقات الجوال', en: 'Mobile App Builder' },
    '/desktop-apps': { ar: 'تطبيقات سطح المكتب', en: 'Desktop Apps' },
  };
  
  const getPageName = () => {
    const page = pageNames[location];
    if (page) return language === 'ar' ? page.ar : page.en;
    return location.replace('/', '').replace(/-/g, ' ') || (language === 'ar' ? 'الرئيسية' : 'Home');
  };
  
  // Check if user is sovereign (owner or sovereign role)
  const isSovereign = user?.role === 'owner' || user?.role === 'sovereign';
  
  // Use real page analyzer for actual DOM analysis
  const { analysis: realPageAnalysis, isAnalyzing: isRealAnalyzing, refresh: refreshRealAnalysis } = useRealPageAnalyzer();
  
  // Run analysis with real API using real DOM data
  useEffect(() => {
    if (!isSovereign || !isAuthenticated) return;
    if (!realPageAnalysis) return;
    
    let cancelled = false;
    
    const fetchAnalysis = async () => {
      setIsAnalyzing(true);
      
      // Use real services detected from DOM instead of hardcoded map
      const realServices = realPageAnalysis.services.map(s => ({
        name: s.name,
        nameAr: s.nameAr,
        type: s.type,
      }));
      
      try {
        const result = await apiRequest("POST", "/api/sovereign/analyze-page", {
          pathname: location,
          services: realServices,
          pageMetrics: {
            loadTime: realPageAnalysis.metrics.loadTime,
            componentCount: realPageAnalysis.metrics.componentCount,
            interactiveElements: realPageAnalysis.metrics.interactiveElements,
            formCount: realPageAnalysis.metrics.formCount,
            apiCallsDetected: realPageAnalysis.metrics.apiCallsDetected,
            resourceCount: realPageAnalysis.metrics.resourceCount,
            memoryUsage: realPageAnalysis.metrics.memoryUsage,
            hasAI: realPageAnalysis.detectedFeatures.hasAI,
            hasAutomation: realPageAnalysis.detectedFeatures.hasAutomation,
            hasRealTimeData: realPageAnalysis.detectedFeatures.hasRealTimeData,
            hasCharts: realPageAnalysis.detectedFeatures.hasCharts,
            hasTables: realPageAnalysis.detectedFeatures.hasTables,
            hasEditors: realPageAnalysis.detectedFeatures.hasEditors,
            firstContentfulPaint: realPageAnalysis.metrics.firstContentfulPaint,
            timeToInteractive: realPageAnalysis.metrics.timeToInteractive,
          },
        });
        
        if (!cancelled) {
          console.log('[Sovereign] Analysis result received:', result.finalScore);
          setAnalysis(result);
          setIsAnalyzing(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.log('[Sovereign] Using fallback analysis', err);
          const result = analyzePageIntelligently(location, 0);
          setAnalysis(result);
          setIsAnalyzing(false);
        }
      }
    };
    
    fetchAnalysis();
    
    return () => { cancelled = true; };
  }, [location, isSovereign, isAuthenticated, realPageAnalysis]);
  
  // Manual refresh function - triggers real DOM re-analysis and awaits completion
  const runAnalysis = useCallback(async () => {
    if (!isSovereign || !isAuthenticated) return;
    
    setIsAnalyzing(true);
    
    try {
      // Await the real DOM analysis to complete
      const freshAnalysis = await refreshRealAnalysis();
      
      if (!freshAnalysis) {
        setIsAnalyzing(false);
        return;
      }
      
      const realServices = freshAnalysis.services.map(s => ({
        name: s.name,
        nameAr: s.nameAr,
        type: s.type,
      }));
      
      const result = await apiRequest("POST", "/api/sovereign/analyze-page", {
        pathname: location,
        services: realServices,
        pageMetrics: {
          loadTime: freshAnalysis.metrics.loadTime,
          componentCount: freshAnalysis.metrics.componentCount,
          interactiveElements: freshAnalysis.metrics.interactiveElements,
          formCount: freshAnalysis.metrics.formCount,
          apiCallsDetected: freshAnalysis.metrics.apiCallsDetected,
          resourceCount: freshAnalysis.metrics.resourceCount,
          memoryUsage: freshAnalysis.metrics.memoryUsage,
          totalTransferSize: freshAnalysis.metrics.totalTransferSize,
          largestContentfulPaint: freshAnalysis.metrics.largestContentfulPaint,
          hasAI: freshAnalysis.detectedFeatures.hasAI,
          hasAutomation: freshAnalysis.detectedFeatures.hasAutomation,
          hasRealTimeData: freshAnalysis.detectedFeatures.hasRealTimeData,
          hasCharts: freshAnalysis.detectedFeatures.hasCharts,
          hasTables: freshAnalysis.detectedFeatures.hasTables,
          hasEditors: freshAnalysis.detectedFeatures.hasEditors,
          firstContentfulPaint: freshAnalysis.metrics.firstContentfulPaint,
          timeToInteractive: freshAnalysis.metrics.timeToInteractive,
        },
      });
      setAnalysis(result);
    } catch (err) {
      console.debug('[Sovereign] Manual refresh error:', err);
      const result = analyzePageIntelligently(location, 0);
      setAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
  }, [location, isSovereign, isAuthenticated, refreshRealAnalysis]);
  
  // Don't render if not sovereign
  if (!isAuthenticated || !isSovereign) {
    return null;
  }
  
  return (
    <div className="fixed bottom-20 right-6 z-[9999]" dir={isRtl ? 'rtl' : 'ltr'}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            data-testid="sovereign-indicator-trigger"
            className={cn(
              "relative group flex flex-col items-center gap-1",
              "transition-all duration-300 ease-out"
            )}
          >
            {/* Golden Circle with Arrow */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                "shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              )}
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #FFF5A0 100%)',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.6), inset 0 2px 6px rgba(255, 255, 255, 0.5)',
              }}
            >
              <TrendingUp 
                className={cn(
                  "w-5 h-5 transition-transform",
                  "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                )}
                style={{ 
                  color: '#8B4513',
                  filter: 'drop-shadow(0 1px 2px rgba(255,215,0,0.8))',
                }}
              />
              
              {/* Score badge */}
              {analysis && (
                <div 
                  data-testid="badge-final-score"
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    color: '#1a1a2e',
                    boxShadow: '0 2px 6px rgba(212, 175, 55, 0.5)',
                  }}
                >
                  {analysis.finalScore}
                </div>
              )}
            </div>
            
            {/* Owner Name below circle */}
            <span 
              className="text-[10px] font-semibold whitespace-nowrap max-w-[80px] truncate"
              style={{
                color: '#D4AF37',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
              data-testid="text-owner-name"
            >
              {user?.fullName || user?.username || (language === 'ar' ? 'المالك' : 'Owner')}
            </span>
          </button>
        </PopoverTrigger>
        
        <PopoverContent 
          side={isRtl ? "left" : "right"}
          align="end"
          className={cn(
            "w-[420px] p-0 border-0",
            "bg-background/95 backdrop-blur-xl",
            "shadow-2xl rounded-xl overflow-hidden"
          )}
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,30,0.95) 100%)',
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <h3 data-testid="text-panel-title" className="font-semibold text-white text-sm">{t.title}</h3>
                <span data-testid="text-current-page" className="text-xs text-amber-400/80">{getPageName()}</span>
              </div>
            </div>
            {analysis && (
              <div 
                data-testid="text-final-score"
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  getStatusBgClass(analysis.statusColor),
                  "text-white"
                )}
              >
                {analysis.finalScore}/100
              </div>
            )}
          </div>
          
          {/* Content */}
          <ScrollArea className="h-[450px]">
            {isAnalyzing && !analysis ? (
              <div className="flex flex-col items-center justify-center py-16 text-white/70">
                <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                <p className="text-sm">{t.analyzing}</p>
              </div>
            ) : analysis ? (
              <Tabs defaultValue="services" className="w-full" data-testid="sovereign-panel-tabs">
                <TabsList className="w-full grid grid-cols-7 gap-0.5 bg-white/5 p-1 rounded-none">
                  <TabsTrigger value="services" data-testid="tab-services" className="text-xs text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
                    <Layers className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="efficiency" data-testid="tab-efficiency" className="text-xs text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
                    <Gauge className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="intelligence" data-testid="tab-intelligence" className="text-xs text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
                    <Brain className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="dynamics" data-testid="tab-dynamics" className="text-xs text-white/70 data-[state=active]:text-white data-[state=active]:bg-emerald-500/30">
                    <Activity className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="issues" data-testid="tab-issues" className="text-xs text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
                    <AlertTriangle className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="tech" data-testid="tab-tech" className="text-xs text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10">
                    <Cpu className="w-3 h-3" />
                  </TabsTrigger>
                  <TabsTrigger value="gap" data-testid="tab-gap" className="text-xs text-white/70 data-[state=active]:text-white data-[state=active]:bg-amber-500/30">
                    <Lightbulb className="w-3 h-3" />
                  </TabsTrigger>
                </TabsList>
                
                {/* Services Tab */}
                <TabsContent value="services" className="p-4 space-y-4" data-testid="content-services">
                  <div className="flex items-center justify-between text-white/80 text-sm">
                    <span>{t.totalServices}</span>
                    <span data-testid="text-total-services" className="font-bold text-amber-400">{analysis.services.length}</span>
                  </div>
                  
                  <div className="space-y-3">
                    {analysis.services.map((service, idx) => (
                      <div key={service.id} data-testid={`service-card-${idx}`} className="p-3 rounded-lg bg-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span data-testid={`service-name-${idx}`} className="text-white text-sm font-medium">
                            {language === 'ar' ? service.nameAr : service.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {service.isAutomated && (
                              <Badge data-testid={`badge-automated-${idx}`} variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                                <Zap className="w-2 h-2 mr-1" />
                                {t.automated}
                              </Badge>
                            )}
                            {service.isIntelligent && (
                              <Badge data-testid={`badge-intelligent-${idx}`} variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                                <Brain className="w-2 h-2 mr-1" />
                                {t.intelligent}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="space-y-1" data-testid={`service-speed-${idx}`}>
                            <div className="text-white/50">{t.speed}</div>
                            <Progress value={service.speed} className="h-1" />
                            <div data-testid={`text-speed-${idx}`} className="text-white/70">{service.speed}%</div>
                          </div>
                          <div className="space-y-1" data-testid={`service-integration-${idx}`}>
                            <div className="text-white/50">{t.integration}</div>
                            <Progress value={service.integration} className="h-1" />
                            <div data-testid={`text-integration-${idx}`} className="text-white/70">{service.integration}%</div>
                          </div>
                          <div className="space-y-1" data-testid={`service-response-${idx}`}>
                            <div className="text-white/50">{t.response}</div>
                            <Progress value={service.response} className="h-1" />
                            <div data-testid={`text-response-${idx}`} className="text-white/70">{service.response}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Efficiency Tab */}
                <TabsContent value="efficiency" className="p-4 space-y-4" data-testid="content-efficiency">
                  <div className="text-center mb-4">
                    <div 
                      data-testid="text-efficiency-score"
                      className={cn(
                        "text-4xl font-bold",
                        getStatusColorClass(analysis.statusColor)
                      )}
                    >
                      {analysis.page.efficiencyScore}%
                    </div>
                    <div className="text-white/50 text-sm">{t.pageEfficiency}</div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'loadTime', label: t.loadTime, value: Math.max(0, 100 - (analysis.page.loadTime / 30)), icon: Clock },
                      { key: 'integration', label: t.componentIntegration, value: analysis.page.componentIntegration, icon: Layers },
                      { key: 'device', label: t.deviceCompatibility, value: analysis.page.deviceCompatibility, icon: Monitor },
                      { key: 'browser', label: t.browserCompatibility, value: analysis.page.browserCompatibility, icon: Globe },
                      { key: 'security', label: t.structuralSecurity, value: analysis.page.structuralSecurity, icon: Lock },
                      { key: 'resource', label: t.resourceUsage, value: 100 - analysis.page.resourceUsage, icon: Cpu },
                    ].map((item, idx) => (
                      <div key={idx} data-testid={`metric-${item.key}`} className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-white/50" />
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-white/70 mb-1">
                            <span>{item.label}</span>
                            <span data-testid={`text-metric-${item.key}`}>{Math.round(item.value)}%</span>
                          </div>
                          <Progress value={item.value} className="h-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Intelligence Tab */}
                <TabsContent value="intelligence" className="p-4 space-y-4" data-testid="content-intelligence">
                  <div className="text-center mb-4">
                    <Badge 
                      data-testid="badge-intelligence-level"
                      className={cn(
                        "text-sm px-4 py-2",
                        analysis.intelligence.classification === 'sovereign-intelligent' 
                          ? "bg-gradient-to-r from-amber-500 to-amber-600" 
                          : analysis.intelligence.classification === 'intelligent'
                          ? "bg-gradient-to-r from-purple-500 to-purple-600"
                          : analysis.intelligence.classification === 'semi-intelligent'
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : "bg-gradient-to-r from-gray-500 to-gray-600"
                      )}
                    >
                      {analysis.intelligence.classification === 'sovereign-intelligent' ? (
                        <><Crown className="w-4 h-4 mr-2" />{t.sovereignIntelligent}</>
                      ) : analysis.intelligence.classification === 'intelligent' ? (
                        <><Brain className="w-4 h-4 mr-2" />{t.intelligentLabel}</>
                      ) : analysis.intelligence.classification === 'semi-intelligent' ? (
                        <><Zap className="w-4 h-4 mr-2" />{t.semiIntelligent}</>
                      ) : (
                        <>{t.traditional}</>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { key: 'adapts', label: t.adaptsToUser, value: analysis.intelligence.adaptsToUser },
                      { key: 'previous', label: t.usesPreviousData, value: analysis.intelligence.usesPreviousData },
                      { key: 'custom', label: t.supportsCustomization, value: analysis.intelligence.supportsCustomization },
                      { key: 'responds', label: t.respondsToActions, value: analysis.intelligence.respondsToActions },
                    ].map((item, idx) => (
                      <div key={idx} data-testid={`intelligence-${item.key}`} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <span className="text-white/80 text-sm">{item.label}</span>
                        {item.value ? (
                          <CheckCircle data-testid={`status-${item.key}-yes`} className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle data-testid={`status-${item.key}-no`} className="w-5 h-5 text-red-500/50" />
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Page Dynamics & Zero-Code Readiness Tab */}
                <TabsContent value="dynamics" className="p-4 space-y-4" data-testid="content-dynamics">
                  {analysis.pageDynamics ? (
                    <>
                      {/* Main Score Display */}
                      <div className="text-center mb-4">
                        <div 
                          data-testid="text-dynamics-score"
                          className={cn(
                            "text-4xl font-bold",
                            analysis.pageDynamics.totalScore >= 80 ? "text-emerald-400" :
                            analysis.pageDynamics.totalScore >= 60 ? "text-amber-400" : "text-red-400"
                          )}
                        >
                          {analysis.pageDynamics.totalScore}%
                        </div>
                        <Badge 
                          data-testid="badge-dynamics-classification"
                          className={cn(
                            "mt-2",
                            analysis.pageDynamics.classification === 'zero-code' 
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" 
                              : analysis.pageDynamics.classification === 'low-code'
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                              : "bg-red-500/20 text-red-400 border-red-500/50"
                          )}
                          variant="outline"
                        >
                          {analysis.pageDynamics.classification === 'zero-code' ? t.zeroCodeReady :
                           analysis.pageDynamics.classification === 'low-code' ? t.lowCodeDependent :
                           t.codeHeavy}
                        </Badge>
                      </div>
                      
                      {/* Components Breakdown */}
                      <div className="space-y-3">
                        {[
                          { key: 'content', label: t.contentDynamics, data: analysis.pageDynamics.components.content },
                          { key: 'ui', label: t.uiDynamics, data: analysis.pageDynamics.components.ui },
                          { key: 'logic', label: t.logicDynamics, data: analysis.pageDynamics.components.logic },
                          { key: 'integration', label: t.integrationDynamics, data: analysis.pageDynamics.components.integration },
                          { key: 'operational', label: t.operationalDynamics, data: analysis.pageDynamics.components.operational },
                        ].map((item, idx) => (
                          <div key={idx} data-testid={`dynamics-${item.key}`} className="p-3 rounded-lg bg-white/5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-white/80 text-sm">{item.label}</span>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    item.data.level === 'zero-code' 
                                      ? "border-emerald-500/50 text-emerald-400" 
                                      : item.data.level === 'low-code'
                                      ? "border-amber-500/50 text-amber-400"
                                      : "border-red-500/50 text-red-400"
                                  )}
                                >
                                  {item.data.level === 'zero-code' ? t.zeroCodeReady :
                                   item.data.level === 'low-code' ? t.lowCodeDependent : t.codeHeavy}
                                </Badge>
                                <span className="text-white/60 text-xs">{item.data.weight}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={item.data.score} 
                                className={cn(
                                  "h-1.5 flex-1",
                                  item.data.level === 'zero-code' ? "[&>div]:bg-emerald-500" :
                                  item.data.level === 'low-code' ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"
                                )}
                              />
                              <span className="text-white/70 text-xs w-10 text-right">{item.data.score}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Sovereignty Impact */}
                      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
                        <h4 className="text-white/90 text-sm font-medium mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4 text-purple-400" />
                          {t.sovereigntyImpact}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'continuity', label: t.businessContinuity, value: analysis.pageDynamics.operationalSovereigntyImpact.businessContinuity },
                            { key: 'independence', label: t.operationalIndependence, value: analysis.pageDynamics.operationalSovereigntyImpact.operationalIndependence },
                            { key: 'dependency', label: t.reducedExternalDependency, value: analysis.pageDynamics.operationalSovereigntyImpact.reducedExternalDependency },
                            { key: 'crisis', label: t.crisisResponseSpeed, value: analysis.pageDynamics.operationalSovereigntyImpact.crisisResponseSpeed },
                          ].map((item, idx) => (
                            <div key={idx} data-testid={`sovereignty-${item.key}`} className="flex items-center gap-2 p-2 rounded bg-white/5">
                              {item.value ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500/50 flex-shrink-0" />
                              )}
                              <span className="text-white/70 text-xs">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Note */}
                      <div className="text-center text-white/40 text-xs mt-3 italic">
                        {t.dynamicsNote}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-white/50">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-white/30" />
                      <p className="text-sm">{t.analyzing}</p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Issues Tab */}
                <TabsContent value="issues" className="p-4 space-y-4" data-testid="content-issues">
                  {analysis.issues.length === 0 ? (
                    <div className="text-center py-8 text-white/50" data-testid="text-no-issues">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                      <p>{t.noIssues}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analysis.issues.map((issue, idx) => (
                        <div key={issue.id} data-testid={`issue-card-${idx}`} className="p-3 rounded-lg bg-white/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge data-testid={`badge-severity-${idx}`} variant={getSeverityColor(issue.severity) as any}>
                              {issue.severity === 'critical' ? t.critical :
                               issue.severity === 'medium' ? t.medium : t.low}
                            </Badge>
                            <Badge data-testid={`badge-type-${idx}`} variant="outline" className="text-xs border-white/20 text-white/50">
                              {issue.type === 'structural' ? t.structural :
                               issue.type === 'ux' ? t.ux :
                               issue.type === 'technical' ? t.technical :
                               issue.type === 'unused' ? t.unused : t.performance}
                            </Badge>
                          </div>
                          <p data-testid={`text-issue-${idx}`} className="text-white/80 text-sm">
                            {language === 'ar' ? issue.messageAr : issue.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {analysis.recommendations.length > 0 && (
                    <>
                      <Separator className="bg-white/10" />
                      <div className="space-y-2" data-testid="recommendations-section">
                        <h4 className="text-white/80 text-sm font-medium flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          {t.recommendations}
                        </h4>
                        {analysis.recommendations.map((rec, idx) => (
                          <div key={idx} data-testid={`recommendation-${idx}`} className="p-2 rounded bg-amber-500/10 text-amber-200 text-xs">
                            {language === 'ar' ? rec.ar : rec.en}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>
                
                {/* Tech Maturity Tab */}
                <TabsContent value="tech" className="p-4 space-y-4" data-testid="content-tech">
                  <div className="text-center mb-4">
                    <div 
                      data-testid="badge-tech-level"
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium",
                        getTechLevelColor(analysis.techMaturity.level)
                      )}
                    >
                      {analysis.techMaturity.level === 'sovereign' && <Crown className="w-4 h-4" />}
                      {analysis.techMaturity.level === 'sovereign' ? t.sovereignLevel :
                       analysis.techMaturity.level === 'advanced' ? t.advancedLevel :
                       analysis.techMaturity.level === 'good' ? t.goodLevel :
                       analysis.techMaturity.level === 'medium' ? t.mediumLevel : t.lowLevel}
                    </div>
                    <p data-testid="text-tech-description" className="text-white/50 text-xs mt-2">
                      {language === 'ar' ? analysis.techMaturity.descriptionAr : analysis.techMaturity.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white/70">
                      <span>{t.techProgress}</span>
                      <span data-testid="text-tech-score" className="font-bold">{analysis.techMaturity.score}%</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", getTechLevelColor(analysis.techMaturity.level))}
                        style={{ width: `${analysis.techMaturity.score}%` }}
                      />
                      {/* Level markers */}
                      <div className="absolute inset-0 flex justify-between px-1">
                        {[20, 40, 60, 80].map((pos) => (
                          <div key={pos} className="w-px h-full bg-white/20" style={{ marginLeft: `${pos}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-white/40">
                      <span>{t.lowLevel}</span>
                      <span>{t.mediumLevel}</span>
                      <span>{t.goodLevel}</span>
                      <span>{t.advancedLevel}</span>
                      <span>{t.sovereignLevel}</span>
                    </div>
                  </div>
                </TabsContent>

                {/* Gap Analysis & Executive Recommendations Tab */}
                <TabsContent value="gap" className="p-4 space-y-4" data-testid="content-gap">
                  {/* Score Gap Overview */}
                  <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80 text-sm font-medium">{t.pathTo100}</span>
                      <Badge variant="outline" className="border-amber-400/50 text-amber-400">
                        +{analysis.gapAnalysis.gap} {language === 'ar' ? 'نقطة' : 'points'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">{t.currentScore}: {analysis.gapAnalysis.currentScore}</span>
                          <span className="text-amber-400">{t.targetScore}: {analysis.gapAnalysis.targetScore}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
                            style={{ width: `${analysis.gapAnalysis.currentScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Missing Services */}
                  {analysis.gapAnalysis.missingServices.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white/80 text-xs font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-400" />
                        {t.missingTools}
                      </h4>
                      <div className="space-y-1">
                        {analysis.gapAnalysis.missingServices.map((service, idx) => (
                          <div key={idx} data-testid={`missing-service-${idx}`} className="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-500/20">
                            <span className="text-white/70 text-xs">
                              {language === 'ar' ? service.nameAr : service.name}
                            </span>
                            <Badge variant="outline" className="text-[10px] border-red-400/50 text-red-400">
                              +{service.impact} {language === 'ar' ? 'نقاط' : 'pts'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Opportunities */}
                  {analysis.gapAnalysis.aiOpportunities.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white/80 text-xs font-semibold flex items-center gap-1">
                        <Brain className="w-3 h-3 text-purple-400" />
                        {t.aiInjection}
                      </h4>
                      <div className="space-y-1">
                        {analysis.gapAnalysis.aiOpportunities.map((opp, idx) => (
                          <div key={idx} data-testid={`ai-opportunity-${idx}`} className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                            <div className="text-white/80 text-xs font-medium">
                              {language === 'ar' ? opp.areaAr : opp.area}
                            </div>
                            <div className="text-white/50 text-[10px] mt-1">
                              {language === 'ar' ? opp.benefitAr : opp.benefit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Legacy Systems */}
                  {analysis.gapAnalysis.legacySystems.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white/80 text-xs font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-orange-400" />
                        {t.legacyUpgrade}
                      </h4>
                      <div className="space-y-1">
                        {analysis.gapAnalysis.legacySystems.map((sys, idx) => (
                          <div key={idx} data-testid={`legacy-system-${idx}`} className="p-2 rounded bg-orange-500/10 border border-orange-500/20">
                            <div className="text-white/80 text-xs font-medium">
                              {language === 'ar' ? sys.nameAr : sys.name}
                            </div>
                            <div className="text-white/50 text-[10px] mt-1">
                              {language === 'ar' ? sys.issueAr : sys.issue}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Executive Recommendations */}
                  <div className="space-y-2">
                    <h4 className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      {t.executiveRecommendations}
                    </h4>
                    <div className="space-y-2">
                      {analysis.gapAnalysis.executiveRecommendations.map((rec, idx) => (
                        <div 
                          key={rec.id || idx} 
                          data-testid={`recommendation-${idx}`}
                          className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-[10px]",
                                    rec.priority === 'high' ? 'border-red-400/50 text-red-400' :
                                    rec.priority === 'medium' ? 'border-yellow-400/50 text-yellow-400' :
                                    'border-green-400/50 text-green-400'
                                  )}
                                >
                                  {rec.priority === 'high' ? t.highPriority :
                                   rec.priority === 'medium' ? t.mediumPriority : t.lowPriority}
                                </Badge>
                                {rec.impact && (
                                  <Badge variant="outline" className="text-[10px] border-blue-400/50 text-blue-400">
                                    +{rec.impact} {t.impactPoints}
                                  </Badge>
                                )}
                              </div>
                              <h5 className="text-white text-sm font-medium mt-1">
                                {language === 'ar' ? (rec.titleAr || rec.title) : rec.title}
                              </h5>
                              {(rec.description || rec.descriptionAr) && (
                                <p className="text-white/50 text-xs mt-1">
                                  {language === 'ar' ? (rec.descriptionAr || '') : (rec.description || '')}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Steps */}
                          {rec.actionSteps && rec.actionSteps.length > 0 && (
                            <div className="pt-2 border-t border-white/5">
                              <div className="text-white/60 text-[10px] font-medium mb-1">{t.actionSteps}:</div>
                              <div className="space-y-1">
                                {rec.actionSteps.map((step, stepIdx) => (
                                  <div key={stepIdx} className="flex items-start gap-1.5 text-[10px] text-white/50">
                                    <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                                    <span>{language === 'ar' ? step.ar : step.en}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Footer */}
                          {(rec.estimatedEffort || rec.globalStandard) && (
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                              {rec.estimatedEffort && (
                                <Badge variant="outline" className="text-[10px] border-white/20 text-white/40">
                                  {rec.estimatedEffort === 'quick' ? t.quickEffort :
                                   rec.estimatedEffort === 'moderate' ? t.moderateEffort : t.significantEffort}
                                </Badge>
                              )}
                              {rec.globalStandard && (
                                <div className="flex items-center gap-1 text-[10px] text-white/40">
                                  <Shield className="w-3 h-3" />
                                  {rec.globalStandard}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cutting-Edge Global Tools */}
                  {analysis.gapAnalysis.cuttingEdgeTools.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-cyan-400 text-xs font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {t.cuttingEdgeTools}
                      </h4>
                      <div className="space-y-3">
                        {analysis.gapAnalysis.cuttingEdgeTools.map((tool, idx) => (
                          <div 
                            key={tool.id || idx} 
                            data-testid={`cutting-edge-tool-${idx}`}
                            className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 space-y-2"
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-[10px] border-cyan-400/50 text-cyan-400">
                                    {tool.category?.toUpperCase() || 'TOOL'}
                                  </Badge>
                                  {tool.impact && (
                                    <Badge variant="outline" className="text-[10px] border-emerald-400/50 text-emerald-400">
                                      +{tool.impact} {t.impactPoints}
                                    </Badge>
                                  )}
                                  {tool.releaseYear && (
                                    <Badge variant="outline" className="text-[10px] border-white/20 text-white/50">
                                      {tool.releaseYear}
                                    </Badge>
                                  )}
                                </div>
                                <h5 className="text-white text-sm font-medium mt-1">
                                  {language === 'ar' ? (tool.nameAr || tool.name) : tool.name}
                                </h5>
                                {(tool.description || tool.descriptionAr) && (
                                  <p className="text-white/50 text-xs mt-1">
                                    {language === 'ar' ? (tool.descriptionAr || '') : (tool.description || '')}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Vendor & Adoption */}
                            {(tool.vendor || tool.adoptionRate) && (
                              <div className="flex items-center gap-3 text-[10px]">
                                {tool.vendor && (
                                  <div className="flex items-center gap-1 text-white/40">
                                    <Globe className="w-3 h-3" />
                                    <span>{t.vendor}: {tool.vendor}</span>
                                  </div>
                                )}
                                {tool.adoptionRate && (
                                  <div className="flex items-center gap-1 text-emerald-400">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>{tool.adoptionRate}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Benefits */}
                            {tool.benefits && tool.benefits.length > 0 && (
                              <div className="pt-2 border-t border-white/5">
                                <div className="text-white/60 text-[10px] font-medium mb-1">{t.benefits}:</div>
                                <div className="space-y-1">
                                  {tool.benefits.map((benefit, bIdx) => (
                                    <div key={bIdx} className="flex items-start gap-1.5 text-[10px] text-white/50">
                                      <CheckCircle className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                                      <span>{language === 'ar' ? benefit.ar : benefit.en}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Integration Steps */}
                            {tool.integrationSteps && tool.integrationSteps.length > 0 && (
                              <div className="pt-2 border-t border-white/5">
                                <div className="text-white/60 text-[10px] font-medium mb-1">{t.integrationSteps}:</div>
                                <div className="space-y-1">
                                  {tool.integrationSteps.map((step, sIdx) => (
                                    <div key={sIdx} className="flex items-start gap-1.5 text-[10px] text-white/50">
                                      <span className="text-cyan-400 font-bold">{sIdx + 1}.</span>
                                      <span>{language === 'ar' ? step.ar : step.en}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Use Cases */}
                            {tool.useCases && tool.useCases.length > 0 && (
                              <div className="pt-2 border-t border-white/5">
                                <div className="text-white/60 text-[10px] font-medium mb-1">{t.useCases}:</div>
                                <div className="flex flex-wrap gap-1">
                                  {tool.useCases.map((useCase, uIdx) => (
                                    <Badge key={uIdx} variant="outline" className="text-[9px] border-white/10 text-white/40">
                                      {language === 'ar' ? useCase.ar : useCase.en}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Global Standards */}
                            {tool.globalStandards && tool.globalStandards.length > 0 && (
                              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <Shield className="w-3 h-3 text-amber-400" />
                                <div className="flex flex-wrap gap-1">
                                  {tool.globalStandards.map((std, stdIdx) => (
                                    <Badge key={stdIdx} variant="outline" className="text-[9px] border-amber-400/30 text-amber-400/70">
                                      {std}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : null}
          </ScrollArea>
          
          {/* Footer Actions */}
          <div className="p-3 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showToEmployees ? (
                  <Eye className="w-4 h-4 text-white/50" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white/50" />
                )}
                <Label htmlFor="show-employees" className="text-white/70 text-xs cursor-pointer">
                  {t.showToEmployees}
                </Label>
              </div>
              <Switch
                id="show-employees"
                data-testid="switch-show-employees"
                checked={showToEmployees}
                onCheckedChange={setShowToEmployees}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
            
            {/* Employee Selection Options */}
            {showToEmployees && (
              <div className="space-y-2 p-2 bg-white/5 rounded-lg">
                <div className="flex gap-2">
                  <Button
                    data-testid="button-all-employees"
                    variant={employeeMode === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      "flex-1 text-xs",
                      employeeMode === 'all' 
                        ? "bg-amber-500 hover:bg-amber-600 text-white" 
                        : "border-white/20 text-white/70 hover:bg-white/10"
                    )}
                    onClick={() => setEmployeeMode('all')}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {t.allEmployees}
                  </Button>
                  <Button
                    data-testid="button-specific-employees"
                    variant={employeeMode === 'specific' ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      "flex-1 text-xs",
                      employeeMode === 'specific' 
                        ? "bg-amber-500 hover:bg-amber-600 text-white" 
                        : "border-white/20 text-white/70 hover:bg-white/10"
                    )}
                    onClick={() => setEmployeeMode('specific')}
                  >
                    <User className="w-3 h-3 mr-1" />
                    {t.specificEmployees}
                  </Button>
                </div>
                
                {/* Employee Selection List */}
                {employeeMode === 'specific' && (
                  <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                    {employees.length === 0 ? (
                      <div className="text-xs text-white/40 text-center py-2">
                        {language === 'ar' ? 'لا يوجد موظفين' : 'No employees found'}
                      </div>
                    ) : (
                      employees.map((emp) => (
                        <div 
                          key={emp.id}
                          data-testid={`employee-checkbox-${emp.id}`}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer"
                          onClick={() => {
                            setSelectedEmployees(prev => 
                              prev.includes(emp.id) 
                                ? prev.filter(id => id !== emp.id)
                                : [...prev, emp.id]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedEmployees.includes(emp.id)}
                            className="border-white/30 data-[state=checked]:bg-amber-500"
                          />
                          <span className="text-xs text-white/70">
                            {emp.fullName || emp.username}
                          </span>
                          <Badge variant="outline" className="text-[10px] border-white/20 text-white/50 ml-auto">
                            {emp.role}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                data-testid="button-refresh-analysis"
                variant="outline"
                size="sm"
                className="flex-1 text-xs border-white/20 text-white/80 hover:bg-white/10"
                onClick={runAnalysis}
                disabled={isAnalyzing}
              >
                <RefreshCw className={cn("w-3 h-3 mr-1", isAnalyzing && "animate-spin")} />
                {t.refreshAnalysis}
              </Button>
              <Button
                data-testid="button-export-pdf"
                variant="outline"
                size="sm"
                className="flex-1 text-xs border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                onClick={() => {
                  if (!analysis) return;
                  
                  // Generate comprehensive PDF content with all 6 tabs
                  const currentPage = location || '/';
                  const pageName = currentPage === '/' ? 'Dashboard' : currentPage.replace('/', '').replace(/-/g, ' ');
                  
                  const pdfContent = `
<!DOCTYPE html>
<html lang="${language}" dir="${isRtl ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <title>INFERA WebNova - ${t.title}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, sans-serif;
      background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
      color: #fff;
      padding: 30px;
      min-height: 100vh;
      font-size: 12px;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      padding: 25px;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #FFF5A0 100%);
      border-radius: 10px;
      margin-bottom: 25px;
    }
    .header h1 { color: #1a1a2e; margin: 0; font-size: 24px; }
    .header p { color: #333; margin: 8px 0 0; font-size: 14px; }
    .header .page-info { color: #555; font-size: 12px; margin-top: 5px; }
    .score-card {
      text-align: center;
      padding: 25px;
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      margin-bottom: 25px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .score { font-size: 56px; font-weight: bold; color: #FFD700; }
    .score-label { color: rgba(255,255,255,0.7); font-size: 16px; }
    .gap-indicator { font-size: 14px; color: #f87171; margin-top: 8px; }
    .section {
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
      padding: 18px;
      margin-bottom: 18px;
      border: 1px solid rgba(255,255,255,0.1);
      page-break-inside: avoid;
    }
    .section-title { 
      color: #FFD700; 
      font-size: 16px; 
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title .badge {
      background: rgba(255,215,0,0.2);
      color: #FFD700;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
    }
    .service-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .service-name { color: #fff; }
    .service-type { color: rgba(255,255,255,0.5); font-size: 10px; }
    .service-score { color: #FFD700; font-weight: bold; }
    .metric-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
    }
    .metric-label { color: rgba(255,255,255,0.7); }
    .metric-value { color: #fff; font-weight: bold; }
    .issue-item {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 8px;
    }
    .issue-critical { border-color: #ef4444; }
    .issue-medium { border-color: #f59e0b; background: rgba(245,158,11,0.1); }
    .issue-low { border-color: #22c55e; background: rgba(34,197,94,0.1); }
    .recommendation-item {
      background: rgba(59,130,246,0.1);
      border: 1px solid rgba(59,130,246,0.3);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .recommendation-title { color: #fff; font-weight: bold; margin-bottom: 5px; }
    .recommendation-desc { color: rgba(255,255,255,0.7); font-size: 11px; }
    .priority-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      margin-right: 6px;
    }
    .priority-high { background: rgba(239,68,68,0.3); color: #f87171; }
    .priority-medium { background: rgba(245,158,11,0.3); color: #fbbf24; }
    .priority-low { background: rgba(34,197,94,0.3); color: #4ade80; }
    .impact-badge {
      background: rgba(59,130,246,0.3);
      color: #60a5fa;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
    }
    .action-steps {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .action-step {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      padding: 3px 0;
      font-size: 11px;
      color: rgba(255,255,255,0.6);
    }
    .action-step:before {
      content: "✓";
      color: #22c55e;
    }
    .tool-item {
      background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(59,130,246,0.1));
      border: 1px solid rgba(6,182,212,0.3);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .tool-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
    .tool-name { color: #fff; font-weight: bold; }
    .tool-category { 
      background: rgba(6,182,212,0.3); 
      color: #22d3ee; 
      padding: 2px 6px; 
      border-radius: 4px; 
      font-size: 9px; 
      text-transform: uppercase;
    }
    .tool-vendor { color: rgba(255,255,255,0.5); font-size: 10px; }
    .tool-benefits { margin-top: 8px; }
    .tool-benefit { font-size: 11px; color: rgba(255,255,255,0.7); padding: 2px 0; }
    .tool-benefit:before { content: "→ "; color: #22d3ee; }
    .standards-row { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 4px; 
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .standard-badge {
      background: rgba(251,191,36,0.2);
      color: #fbbf24;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
    }
    .missing-item {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 6px;
    }
    .ai-item {
      background: rgba(168,85,247,0.1);
      border: 1px solid rgba(168,85,247,0.2);
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 6px;
    }
    .legacy-item {
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.2);
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 6px;
    }
    .two-cols { display: flex; gap: 15px; }
    .two-cols > div { flex: 1; }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.5);
      font-size: 11px;
    }
    .page-break { page-break-before: always; }
    .intelligence-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    .intel-sovereign { background: linear-gradient(135deg, #D4AF37, #FFD700); color: #1a1a2e; }
    .intel-advanced { background: rgba(16,185,129,0.3); color: #34d399; }
    .intel-good { background: rgba(245,158,11,0.3); color: #fbbf24; }
    .intel-basic { background: rgba(107,114,128,0.3); color: #9ca3af; }
  </style>
</head>
<body>
  <!-- COVER & EXECUTIVE SUMMARY -->
  <div class="header">
    <h1>INFERA WebNova</h1>
    <p>${t.title}</p>
    <div class="page-info">${language === 'ar' ? 'الصفحة المحللة' : 'Analyzed Page'}: ${pageName}</div>
  </div>
  
  <div class="score-card">
    <div class="score">${analysis.finalScore}/100</div>
    <div class="score-label">${t.finalScore}</div>
    <div class="gap-indicator">${t.gapToClose}: ${analysis.gapAnalysis.gap}%</div>
  </div>

  <!-- TAB 1: SERVICES -->
  <div class="section">
    <div class="section-title">
      1. ${t.services}
      <span class="badge">${analysis.services.length} ${language === 'ar' ? 'خدمة' : 'services'}</span>
    </div>
    ${analysis.services.map(s => `
      <div class="service-item">
        <div>
          <span class="service-name">${language === 'ar' ? s.nameAr : s.name}</span>
          <span class="service-type"> (${s.isIntelligent ? (language === 'ar' ? 'ذكي' : 'AI') : (language === 'ar' ? 'قياسي' : 'Standard')})</span>
        </div>
        <span class="service-score">${s.score}%</span>
      </div>
    `).join('')}
  </div>
  
  <!-- TAB 2: PAGE EFFICIENCY -->
  <div class="section">
    <div class="section-title">2. ${t.pageEfficiency}</div>
    <div class="two-cols">
      <div>
        <div class="metric-row">
          <span class="metric-label">${t.loadTime}</span>
          <span class="metric-value">${analysis.page.loadTime}ms</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">${t.componentIntegration}</span>
          <span class="metric-value">${analysis.page.componentIntegration}%</span>
        </div>
      </div>
      <div>
        <div class="metric-row">
          <span class="metric-label">${t.deviceCompatibility}</span>
          <span class="metric-value">${analysis.page.deviceCompatibility}%</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">${t.structuralSecurity}</span>
          <span class="metric-value">${analysis.page.structuralSecurity}%</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- TAB 3: INTELLIGENCE -->
  <div class="section">
    <div class="section-title">3. ${t.intelligence}</div>
    <div style="text-align: center; padding: 15px;">
      <span class="intelligence-badge ${
        analysis.intelligence.classification === 'sovereign-intelligent' ? 'intel-sovereign' :
        analysis.intelligence.classification === 'intelligent' ? 'intel-advanced' :
        analysis.intelligence.classification === 'semi-intelligent' ? 'intel-good' : 'intel-basic'
      }">
        ${analysis.intelligence.classification.toUpperCase()}
      </span>
    </div>
    <div class="metric-row">
      <span class="metric-label">${language === 'ar' ? 'يتكيف مع المستخدم' : 'Adapts to User'}</span>
      <span class="metric-value">${analysis.intelligence.adaptsToUser ? '✓' : '✗'}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">${language === 'ar' ? 'يستخدم البيانات السابقة' : 'Uses Previous Data'}</span>
      <span class="metric-value">${analysis.intelligence.usesPreviousData ? '✓' : '✗'}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">${language === 'ar' ? 'يدعم التخصيص' : 'Supports Customization'}</span>
      <span class="metric-value">${analysis.intelligence.supportsCustomization ? '✓' : '✗'}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">${language === 'ar' ? 'يستجيب للإجراءات' : 'Responds to Actions'}</span>
      <span class="metric-value">${analysis.intelligence.respondsToActions ? '✓' : '✗'}</span>
    </div>
  </div>
  
  <!-- TAB 4: ISSUES -->
  <div class="section">
    <div class="section-title">
      4. ${t.issues}
      <span class="badge">${analysis.issues.length}</span>
    </div>
    ${analysis.issues.length === 0 ? `<div style="text-align: center; color: #22c55e; padding: 15px;">${t.noIssues}</div>` :
      analysis.issues.map(issue => `
        <div class="issue-item issue-${issue.severity}">
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: #fff;">${language === 'ar' ? issue.messageAr : issue.message}</strong>
            <span class="priority-badge priority-${issue.severity}">${issue.severity.toUpperCase()}</span>
          </div>
          <div style="color: rgba(255,255,255,0.6); font-size: 11px; margin-top: 4px;">
            ${language === 'ar' ? 'النوع' : 'Type'}: ${issue.type}
          </div>
        </div>
      `).join('')
    }
  </div>
  
  <!-- TAB 5: TECH PROGRESS -->
  <div class="section">
    <div class="section-title">5. ${t.techProgress}</div>
    <div class="metric-row">
      <span class="metric-label">${t.level}</span>
      <span class="metric-value" style="color: ${
        analysis.techMaturity.level === 'sovereign' ? '#FFD700' :
        analysis.techMaturity.level === 'advanced' ? '#22c55e' :
        analysis.techMaturity.level === 'good' ? '#fbbf24' : '#f87171'
      };">${analysis.techMaturity.level.toUpperCase()}</span>
    </div>
    <div class="metric-row">
      <span class="metric-label">${t.finalScore}</span>
      <span class="metric-value">${analysis.techMaturity.score}%</span>
    </div>
    <div style="margin-top: 10px;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 10px; height: 12px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #FFD700, #D4AF37); height: 100%; width: ${analysis.techMaturity.score}%;"></div>
      </div>
    </div>
  </div>
  
  <div class="page-break"></div>
  
  <!-- TAB 6: GAP ANALYSIS -->
  <div class="section">
    <div class="section-title">6. ${t.gapAnalysis}</div>
    
    <!-- Gap Overview -->
    <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
      <div class="two-cols">
        <div style="text-align: center;">
          <div style="font-size: 28px; color: #FFD700; font-weight: bold;">${analysis.gapAnalysis.currentScore}%</div>
          <div style="color: rgba(255,255,255,0.6); font-size: 11px;">${t.currentScore}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 28px; color: #22c55e; font-weight: bold;">100%</div>
          <div style="color: rgba(255,255,255,0.6); font-size: 11px;">${t.targetScore}</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 10px; color: #f87171;">
        ${t.gapToClose}: <strong>${analysis.gapAnalysis.gap}%</strong>
      </div>
    </div>
    
    <!-- Missing Services -->
    ${analysis.gapAnalysis.missingServices.length > 0 ? `
      <div style="margin-bottom: 15px;">
        <div style="color: #f87171; font-weight: bold; margin-bottom: 8px;">${t.missingTools} (${analysis.gapAnalysis.missingServices.length})</div>
        ${analysis.gapAnalysis.missingServices.map(s => `
          <div class="missing-item">
            <strong>${language === 'ar' ? s.nameAr : s.name}</strong>
            <span style="color: rgba(255,255,255,0.5);"> - ${s.type}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    <!-- AI Opportunities -->
    ${analysis.gapAnalysis.aiOpportunities.length > 0 ? `
      <div style="margin-bottom: 15px;">
        <div style="color: #a855f7; font-weight: bold; margin-bottom: 8px;">${t.aiInjection} (${analysis.gapAnalysis.aiOpportunities.length})</div>
        ${analysis.gapAnalysis.aiOpportunities.map(s => `
          <div class="ai-item">
            <strong>${language === 'ar' ? s.areaAr : s.area}</strong>
            <span style="color: rgba(255,255,255,0.5);"> - ${language === 'ar' ? s.benefitAr : s.benefit}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    <!-- Legacy Systems -->
    ${analysis.gapAnalysis.legacySystems.length > 0 ? `
      <div style="margin-bottom: 15px;">
        <div style="color: #f59e0b; font-weight: bold; margin-bottom: 8px;">${t.legacyUpgrade} (${analysis.gapAnalysis.legacySystems.length})</div>
        ${analysis.gapAnalysis.legacySystems.map(s => `
          <div class="legacy-item">
            <strong>${language === 'ar' ? s.nameAr : s.name}</strong>
            <span style="color: rgba(255,255,255,0.5);"> - ${language === 'ar' ? s.issueAr : s.issue}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  </div>
  
  <!-- EXECUTIVE RECOMMENDATIONS -->
  <div class="section">
    <div class="section-title">
      ${t.executiveRecommendations}
      <span class="badge">${analysis.gapAnalysis.executiveRecommendations.length}</span>
    </div>
    ${(analysis.gapAnalysis.executiveRecommendations || []).map(rec => `
      <div class="recommendation-item">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div>
            <span class="priority-badge priority-${rec.priority || 'medium'}">${
              rec.priority === 'high' ? t.highPriority :
              rec.priority === 'medium' ? t.mediumPriority : t.lowPriority
            }</span>
            ${rec.impact ? `<span class="impact-badge">+${rec.impact} ${t.impactPoints}</span>` : ''}
          </div>
        </div>
        <div class="recommendation-title">${language === 'ar' ? (rec.titleAr || rec.title) : rec.title}</div>
        ${rec.description || rec.descriptionAr ? `<div class="recommendation-desc">${language === 'ar' ? (rec.descriptionAr || '') : (rec.description || '')}</div>` : ''}
        ${rec.actionSteps && rec.actionSteps.length > 0 ? `
          <div class="action-steps">
            ${rec.actionSteps.map(step => `
              <div class="action-step">${language === 'ar' ? step.ar : step.en}</div>
            `).join('')}
          </div>
        ` : ''}
        ${rec.globalStandard ? `
          <div style="margin-top: 8px; font-size: 10px; color: rgba(255,255,255,0.5);">
            ${t.globalStandard}: ${rec.globalStandard}
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
  
  <div class="page-break"></div>
  
  <!-- CUTTING-EDGE TOOLS -->
  <div class="section">
    <div class="section-title">
      ${t.cuttingEdgeTools}
      <span class="badge">${analysis.gapAnalysis.cuttingEdgeTools.length}</span>
    </div>
    ${(analysis.gapAnalysis.cuttingEdgeTools || []).map(tool => `
      <div class="tool-item">
        <div class="tool-header">
          <div>
            <span class="tool-name">${language === 'ar' ? (tool.nameAr || tool.name) : tool.name}</span>
            ${tool.vendor || tool.adoptionRate ? `<div class="tool-vendor">${tool.vendor ? `${t.vendor}: ${tool.vendor}` : ''}${tool.vendor && tool.adoptionRate ? ' | ' : ''}${tool.adoptionRate || ''}</div>` : ''}
          </div>
          <div>
            <span class="tool-category">${tool.category}</span>
            ${tool.impact ? `<span class="impact-badge" style="margin-${isRtl ? 'right' : 'left'}: 4px;">+${tool.impact}</span>` : ''}
          </div>
        </div>
        ${tool.description || tool.descriptionAr ? `
          <div style="color: rgba(255,255,255,0.7); font-size: 11px; margin: 8px 0;">
            ${language === 'ar' ? (tool.descriptionAr || '') : (tool.description || '')}
          </div>
        ` : ''}
        ${tool.benefits && tool.benefits.length > 0 ? `
          <div class="tool-benefits">
            <div style="color: rgba(255,255,255,0.5); font-size: 10px; margin-bottom: 4px;">${t.benefits}:</div>
            ${tool.benefits.map(b => `
              <div class="tool-benefit">${language === 'ar' ? b.ar : b.en}</div>
            `).join('')}
          </div>
        ` : ''}
        ${tool.integrationSteps && tool.integrationSteps.length > 0 ? `
          <div style="margin-top: 8px;">
            <div style="color: rgba(255,255,255,0.5); font-size: 10px; margin-bottom: 4px;">${t.integrationSteps}:</div>
            ${tool.integrationSteps.map((step, i) => `
              <div style="font-size: 11px; color: rgba(255,255,255,0.6); padding: 2px 0;">
                <span style="color: #22d3ee; font-weight: bold;">${i + 1}.</span> ${language === 'ar' ? step.ar : step.en}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${tool.globalStandards && tool.globalStandards.length > 0 ? `
          <div class="standards-row">
            ${tool.globalStandards.map(std => `
              <span class="standard-badge">${std}</span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('')}
  </div>
  
  <div class="footer">
    <p>INFERA Engine 2025 - ${t.title}</p>
    <p>${language === 'ar' ? 'تاريخ التقرير' : 'Report Date'}: ${new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} ${new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
    <p style="margin-top: 10px; font-size: 10px;">${language === 'ar' ? 'الصفحة المحللة' : 'Analyzed Page'}: ${currentPage}</p>
  </div>
</body>
</html>
                  `;
                  
                  // Open print dialog for PDF
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    printWindow.document.write(pdfContent);
                    printWindow.document.close();
                    setTimeout(() => {
                      printWindow.print();
                    }, 500);
                  }
                }}
              >
                <FileDown className="w-3 h-3 mr-1" />
                {t.exportPdf}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default SovereignIndicator;
