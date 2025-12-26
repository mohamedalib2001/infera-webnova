import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState, useEffect, Suspense, lazy } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Plus, 
  Shield, 
  Users, 
  Activity, 
  Settings, 
  Rocket, 
  Code2, 
  Database, 
  Globe, 
  Lock, 
  Eye,
  Loader2,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  RefreshCw,
  Download,
  Layout,
  ExternalLink,
  Edit3,
  Palette,
  Link2,
  History,
  Brain,
} from "lucide-react";
const NovaSovereignWorkspace = lazy(() => import("@/components/nova-sovereign-workspace").then(m => ({ default: m.NovaSovereignWorkspace })));
import { 
  getPlatformLogoState, 
  checkGlobalCompliance, 
  getLogoHistory,
  subscribeToLogoSync,
  type PlatformLogoState,
  type LogoHistoryEntry
} from "@/lib/logo-binding-engine";
import { format } from "date-fns";
import type { 
  SovereignWorkspace, 
  SovereignWorkspaceProject,
  SovereignWorkspaceMember,
  SovereignWorkspaceAccessLog,
  SovereignPlatformType,
} from "@shared/schema";
import { platformIconsRegistry, type PlatformIconConfig } from "@/lib/platform-icons-registry";
import { getPlatformLandingRoute, getPlatformPitchDeckRoute } from "@/lib/platform-landing-map";

// INFERA Logo Generation Rules - قواعد توليد شعارات إنفيرا
// Style: Sovereign, Futuristic, Minimal, Timeless | سيادي، مستقبلي، بسيط، خالد
// Constraints: noText, noFaces, noGloss, subtleGradients, darkTechOnly
// بدون نص، بدون وجوه، بدون لمعان، تدرجات خفيفة، تقنية داكنة فقط

function generatePlatformLogo(
  platform: PlatformIconConfig, 
  variant: 'app-icon' | 'favicon-32' | 'favicon-16' | 'mono' | 'light' | 'dark' | 'tab-icon',
  size: number = 512
): void {
  const { primary, secondary, accent } = platform.colors;
  
  // Dark-tech base colors following sovereign aesthetic
  let bgColor = primary;
  let coreColor = secondary;
  let accentColor = accent;
  let gradientOpacity = 0.15; // Subtle gradients only
  
  if (variant === 'mono') {
    bgColor = '#0A0A0A';
    coreColor = '#FFFFFF';
    accentColor = '#FFFFFF';
    gradientOpacity = 0.1;
  } else if (variant === 'light') {
    bgColor = '#F5F5F5';
    coreColor = primary;
    accentColor = secondary;
    gradientOpacity = 0.08;
  } else if (variant === 'dark') {
    bgColor = '#050505';
    coreColor = accent;
    accentColor = secondary;
    gradientOpacity = 0.2;
  }
  
  // Sovereign Minimal Design - No text, No faces, Dark Tech aesthetic
  // Uses geometric symbols: hexagons, neural nodes, control cores
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Subtle gradient - not glossy -->
    <linearGradient id="bg-${platform.id}-${variant}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgColor}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${coreColor}" stop-opacity="${gradientOpacity}"/>
    </linearGradient>
    
    <!-- Core glow effect -->
    <radialGradient id="core-${platform.id}-${variant}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
    </radialGradient>
    
    <!-- Neural line gradient -->
    <linearGradient id="neural-${platform.id}-${variant}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${coreColor}" stop-opacity="0.2"/>
      <stop offset="50%" stop-color="${accentColor}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${coreColor}" stop-opacity="0.2"/>
    </linearGradient>
  </defs>
  
  <!-- Background - rounded sovereign container -->
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#bg-${platform.id}-${variant})"/>
  
  <!-- Outer protective ring - sovereignty shield -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.42}" fill="none" stroke="${coreColor}" stroke-width="${size * 0.008}" opacity="0.15"/>
  
  <!-- Core glow -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="url(#core-${platform.id}-${variant})"/>
  
  <!-- Central hexagonal core - representing control/sovereignty -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Outer hexagon -->
    <polygon 
      points="${[0,1,2,3,4,5].map(i => {
        const angle = (i * 60 - 90) * Math.PI / 180;
        const r = size * 0.28;
        return `${Math.cos(angle) * r},${Math.sin(angle) * r}`;
      }).join(' ')}" 
      fill="none" 
      stroke="${accentColor}" 
      stroke-width="${size * 0.012}"
      opacity="0.9"
    />
    
    <!-- Inner hexagon - layered depth -->
    <polygon 
      points="${[0,1,2,3,4,5].map(i => {
        const angle = (i * 60 - 90) * Math.PI / 180;
        const r = size * 0.18;
        return `${Math.cos(angle) * r},${Math.sin(angle) * r}`;
      }).join(' ')}" 
      fill="${coreColor}" 
      opacity="0.08"
      stroke="${coreColor}"
      stroke-width="${size * 0.006}"
    />
    
    <!-- Neural connection lines - 6 directions -->
    ${[0,1,2,3,4,5].map(i => {
      const angle = (i * 60 - 90) * Math.PI / 180;
      const inner = size * 0.08;
      const outer = size * 0.28;
      return `<line x1="${Math.cos(angle) * inner}" y1="${Math.sin(angle) * inner}" x2="${Math.cos(angle) * outer}" y2="${Math.sin(angle) * outer}" stroke="url(#neural-${platform.id}-${variant})" stroke-width="${size * 0.008}"/>`;
    }).join('\n    ')}
    
    <!-- Central intelligence node -->
    <circle r="${size * 0.06}" fill="${accentColor}" opacity="0.9"/>
    <circle r="${size * 0.035}" fill="${bgColor}" opacity="0.8"/>
    <circle r="${size * 0.018}" fill="${accentColor}"/>
    
    <!-- Orbital nodes - representing connected systems -->
    ${[0,2,4].map(i => {
      const angle = (i * 60 - 90) * Math.PI / 180;
      const r = size * 0.22;
      return `<circle cx="${Math.cos(angle) * r}" cy="${Math.sin(angle) * r}" r="${size * 0.02}" fill="${coreColor}" opacity="0.6"/>`;
    }).join('\n    ')}
  </g>
  
  <!-- Corner sovereignty marker -->
  <circle cx="${size * 0.85}" cy="${size * 0.15}" r="${size * 0.025}" fill="${accentColor}" opacity="0.7"/>
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Proper naming per archive rules
  const fileNames: Record<string, string> = {
    'app-icon': `app-icon-${size}.svg`,
    'favicon-32': 'favicon-32.svg',
    'favicon-16': 'favicon-16.svg',
    'mono': 'mono-icon.svg',
    'light': 'light-bg.svg',
    'dark': 'dark-bg.svg',
    'tab-icon': 'tab-icon.svg'
  };
  
  link.download = `${platform.id}-${fileNames[variant] || `${variant}.svg`}`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadAllLogoVariants(platform: PlatformIconConfig): void {
  // Required files per iconArchiveRules
  const variants: Array<{ variant: 'app-icon' | 'favicon-32' | 'favicon-16' | 'mono' | 'tab-icon' | 'light' | 'dark'; size: number }> = [
    { variant: 'app-icon', size: 1024 },
    { variant: 'favicon-32', size: 32 },
    { variant: 'favicon-16', size: 16 },
    { variant: 'tab-icon', size: 64 },
    { variant: 'mono', size: 512 },
    { variant: 'light', size: 512 },
    { variant: 'dark', size: 512 },
  ];
  
  variants.forEach((v, i) => {
    setTimeout(() => generatePlatformLogo(platform, v.variant, v.size), i * 400);
  });
}
import { SovereignCore } from "@/components/sovereign-core";
import { 
  Crown, Star, Briefcase, Heart, GraduationCap, Landmark,
  ShoppingCart, Truck, Home, Hotel, Newspaper, Scale,
  Cpu, Zap, Cloud, Server, Network, Layers,
  Bot, BrainCircuit, BarChart3, Workflow, PenTool,
  Sparkles
} from "lucide-react";

// Lightweight IDE Launcher - تحميل بيئة التطوير عند الطلب فقط
function SovereignCoreIDELauncher({ workspaceId, isOwner }: { workspaceId: string; isOwner: boolean }) {
  const [IDEComponent, setIDEComponent] = useState<React.ComponentType<{ workspaceId: string; isOwner: boolean }> | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleLaunch = async () => {
    setLoading(true);
    try {
      const mod = await import("@/components/sovereign-core-ide");
      setIDEComponent(() => mod.SovereignCoreIDE);
    } catch (e) {
      console.error("Failed to load IDE:", e);
      setLoading(false);
    }
  };
  
  if (IDEComponent) {
    return <IDEComponent workspaceId={workspaceId} isOwner={isOwner} />;
  }
  
  if (loading) {
    return (
      <div className="h-[700px] w-full bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 flex items-center justify-center rounded-lg">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-violet-400" />
          <p className="text-sm text-muted-foreground">Loading Sovereign Core IDE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[700px] w-full bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 flex items-center justify-center rounded-lg border border-violet-500/20">
      <Card className="max-w-lg bg-slate-900/80 border-violet-500/30">
        <CardHeader className="text-center pb-2">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-20" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Sovereign Core IDE
          </CardTitle>
          <CardDescription>
            بيئة التطوير السيادية
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-sm text-muted-foreground">
            Full-featured IDE with Sovereign AI for building world-class digital platforms
          </p>
          
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Code2 className="h-5 w-5 mx-auto mb-1 text-violet-400" />
              <span className="text-muted-foreground">Code Editor</span>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Shield className="h-5 w-5 mx-auto mb-1 text-green-400" />
              <span className="text-muted-foreground">Military Security</span>
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Sparkles className="h-5 w-5 mx-auto mb-1 text-cyan-400" />
              <span className="text-muted-foreground">Nova AI</span>
            </div>
          </div>
          
          <Button 
            onClick={handleLaunch}
            size="lg"
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600"
            data-testid="button-launch-ide"
          >
            <Play className="h-5 w-5 mr-2" />
            Launch IDE
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// INFERA Engine Group Platforms Registry - سجل منصات مجموعة إنفيرا
interface InferaPlatform {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  category: string;
  tier: "ROOT" | "CORE" | "STANDARD";
  icon: any;
  route?: string;
}

const inferaGroupPlatforms: InferaPlatform[] = [
  // ROOT Platform - المنصة الجذرية
  {
    id: "webnova",
    name: "INFERA WebNova",
    nameAr: "إنفيرا ويب نوفا",
    description: "Core Operating System - Digital Platform Factory",
    category: "Core OS",
    tier: "ROOT",
    icon: Crown,
    route: "/"
  },
  // CORE Platforms - المنصات الأساسية
  {
    id: "nova-ai",
    name: "Nova AI",
    nameAr: "نوفا الذكاء الاصطناعي",
    description: "Sovereign AI Assistant & Orchestrator",
    category: "AI",
    tier: "CORE",
    icon: BrainCircuit,
    route: "/nova"
  },
    {
    id: "sovereign-core",
    name: "Sovereign Core",
    nameAr: "النواة السيادية",
    description: "Governance & Access Control Engine",
    category: "Security",
    tier: "CORE",
    icon: Shield,
    route: "/sovereign"
  },
  {
    id: "cloud-ide",
    name: "Cloud IDE",
    nameAr: "بيئة التطوير السحابية",
    description: "Full-featured Development Environment",
    category: "Development",
    tier: "CORE",
    icon: Code2,
    route: "/cloud-ide"
  },
  // STANDARD Platforms - المنصات القياسية
  {
    id: "ecommerce",
    name: "E-Commerce Platform",
    nameAr: "منصة التجارة الإلكترونية",
    description: "Complete e-commerce solution with payments",
    category: "Commerce",
    tier: "STANDARD",
    icon: ShoppingCart,
  },
  {
    id: "healthcare",
    name: "Healthcare Platform",
    nameAr: "منصة الرعاية الصحية",
    description: "HIPAA compliant healthcare management",
    category: "Healthcare",
    tier: "STANDARD",
    icon: Heart,
  },
  {
    id: "education",
    name: "Education Platform",
    nameAr: "منصة التعليم",
    description: "LMS & educational content delivery",
    category: "Education",
    tier: "STANDARD",
    icon: GraduationCap,
  },
  {
    id: "government",
    name: "Government Portal",
    nameAr: "البوابة الحكومية",
    description: "Sovereign government services platform",
    category: "Government",
    tier: "STANDARD",
    icon: Landmark,
  },
  {
    id: "finance",
    name: "Finance Platform",
    nameAr: "منصة المالية",
    description: "PCI-DSS compliant financial services",
    category: "Finance",
    tier: "STANDARD",
    icon: Briefcase,
  },
  {
    id: "logistics",
    name: "Logistics Platform",
    nameAr: "منصة اللوجستيات",
    description: "Supply chain & delivery management",
    category: "Logistics",
    tier: "STANDARD",
    icon: Truck,
  },
  {
    id: "real-estate",
    name: "Real Estate Platform",
    nameAr: "منصة العقارات",
    description: "Property listings & management",
    category: "Real Estate",
    tier: "STANDARD",
    icon: Home,
  },
  {
    id: "hospitality",
    name: "Hospitality Platform",
    nameAr: "منصة الضيافة",
    description: "Hotel & booking management",
    category: "Hospitality",
    tier: "STANDARD",
    icon: Hotel,
  },
  {
    id: "media",
    name: "Media Platform",
    nameAr: "منصة الإعلام",
    description: "Content publishing & streaming",
    category: "Media",
    tier: "STANDARD",
    icon: Newspaper,
  },
  {
    id: "legal",
    name: "Legal Platform",
    nameAr: "منصة القانون",
    description: "Case management & legal services",
    category: "Legal",
    tier: "STANDARD",
    icon: Scale,
  },
  {
    id: "hr-management",
    name: "HR Management",
    nameAr: "إدارة الموارد البشرية",
    description: "Employee & payroll management",
    category: "HR",
    tier: "STANDARD",
    icon: Users,
  },
  {
    id: "crm",
    name: "CRM Platform",
    nameAr: "منصة إدارة العملاء",
    description: "Customer relationship management",
    category: "CRM",
    tier: "STANDARD",
    icon: Users,
  },
  {
    id: "erp",
    name: "ERP Platform",
    nameAr: "منصة تخطيط الموارد",
    description: "Enterprise resource planning",
    category: "ERP",
    tier: "STANDARD",
    icon: Layers,
  },
  {
    id: "iot",
    name: "IoT Platform",
    nameAr: "منصة إنترنت الأشياء",
    description: "Device management & data collection",
    category: "IoT",
    tier: "STANDARD",
    icon: Cpu,
  },
  {
    id: "analytics",
    name: "Analytics Platform",
    nameAr: "منصة التحليلات",
    description: "Business intelligence & reporting",
    category: "Analytics",
    tier: "STANDARD",
    icon: BarChart3,
  },
  {
    id: "workflow",
    name: "Workflow Platform",
    nameAr: "منصة سير العمل",
    description: "Process automation & orchestration",
    category: "Automation",
    tier: "STANDARD",
    icon: Workflow,
  },
  {
    id: "marketplace",
    name: "Marketplace Platform",
    nameAr: "منصة السوق",
    description: "Multi-vendor marketplace solution",
    category: "Commerce",
    tier: "STANDARD",
    icon: Globe,
  },
  {
    id: "saas",
    name: "SaaS Builder",
    nameAr: "منشئ SaaS",
    description: "Build & deploy SaaS applications",
    category: "Development",
    tier: "STANDARD",
    icon: Cloud,
  },
  {
    id: "booking",
    name: "Booking Platform",
    nameAr: "منصة الحجوزات",
    description: "Appointment & reservation system",
    category: "Booking",
    tier: "STANDARD",
    icon: Clock,
  },
  {
    id: "nonprofit",
    name: "Nonprofit Platform",
    nameAr: "منصة غير ربحية",
    description: "Charity & donation management",
    category: "Nonprofit",
    tier: "STANDARD",
    icon: Heart,
  },
];

function findPlatformIcon(project: SovereignWorkspaceProject): PlatformIconConfig | null {
  const code = project.code?.toLowerCase().replace(/-/g, '').replace(/_/g, '');
  const name = project.name?.toLowerCase().replace(/\s+/g, '');
  
  return platformIconsRegistry.find(icon => {
    const iconId = icon.id.toLowerCase().replace(/-/g, '');
    const iconName = icon.name.toLowerCase().replace(/\s+/g, '').replace(/™/g, '');
    return iconId.includes(code) || code.includes(iconId) ||
           iconName.includes(name) || name.includes(iconName) ||
           iconId.includes(name) || name.includes(iconId);
  }) || null;
}

const platformTypeLabels: Record<SovereignPlatformType, { en: string; ar: string; icon: any }> = {
  ecommerce: { en: "E-Commerce", ar: "تجارة إلكترونية", icon: Globe },
  healthcare: { en: "Healthcare", ar: "رعاية صحية", icon: Activity },
  government: { en: "Government", ar: "حكومي", icon: Building2 },
  education: { en: "Education", ar: "تعليمي", icon: FileText },
  finance: { en: "Finance", ar: "مالي", icon: Database },
  logistics: { en: "Logistics", ar: "لوجستي", icon: Activity },
  real_estate: { en: "Real Estate", ar: "عقاري", icon: Building2 },
  hospitality: { en: "Hospitality", ar: "ضيافة", icon: Building2 },
  media: { en: "Media", ar: "إعلامي", icon: Eye },
  nonprofit: { en: "Nonprofit", ar: "غير ربحي", icon: Users },
  legal: { en: "Legal", ar: "قانوني", icon: Shield },
  hr_management: { en: "HR Management", ar: "إدارة موارد بشرية", icon: Users },
  crm: { en: "CRM", ar: "إدارة علاقات عملاء", icon: Users },
  erp: { en: "ERP", ar: "تخطيط موارد", icon: Database },
  marketplace: { en: "Marketplace", ar: "سوق", icon: Globe },
  booking: { en: "Booking", ar: "حجوزات", icon: Clock },
  saas: { en: "SaaS", ar: "خدمة برمجية", icon: Code2 },
  analytics: { en: "Analytics", ar: "تحليلات", icon: Activity },
  iot: { en: "IoT", ar: "إنترنت الأشياء", icon: Settings },
  custom: { en: "Custom", ar: "مخصص", icon: Code2 },
};

const statusBadgeVariants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; color: string; en: string; ar: string }> = {
  draft: { variant: "secondary", color: "bg-muted", en: "Draft", ar: "مسودة" },
  building: { variant: "outline", color: "bg-yellow-500/20 text-yellow-600", en: "Building", ar: "قيد البناء" },
  testing: { variant: "outline", color: "bg-blue-500/20 text-blue-600", en: "Testing", ar: "قيد الاختبار" },
  staging: { variant: "outline", color: "bg-purple-500/20 text-purple-600", en: "Staging", ar: "تجريبي" },
  deploying: { variant: "outline", color: "bg-orange-500/20 text-orange-600", en: "Deploying", ar: "قيد النشر" },
  live: { variant: "default", color: "bg-green-500/20 text-green-600", en: "Live", ar: "مباشر" },
  active: { variant: "default", color: "bg-green-500/20 text-green-600", en: "Active", ar: "نشط" },
  maintenance: { variant: "outline", color: "bg-amber-500/20 text-amber-600", en: "Maintenance", ar: "صيانة" },
  suspended: { variant: "destructive", color: "bg-red-500/20 text-red-600", en: "Suspended", ar: "معلق" },
  archived: { variant: "secondary", color: "bg-gray-500/20 text-gray-600", en: "Archived", ar: "مؤرشف" },
};

type SovereignWorkspaceRole = "SOVEREIGN_ADMIN" | "SOVEREIGN_OPERATOR" | "AUDITOR";

const roleLabels: Record<SovereignWorkspaceRole, { en: string; ar: string; description: string }> = {
  SOVEREIGN_ADMIN: { en: "Admin", ar: "مدير", description: "Full access to platforms and team" },
  SOVEREIGN_OPERATOR: { en: "Operator", ar: "مشغل", description: "Can create and deploy platforms" },
  AUDITOR: { en: "Auditor", ar: "مدقق", description: "Read-only access with audit logs" },
};

export default function SovereignWorkspacePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("platforms");
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [inviteMemberDialogOpen, setInviteMemberDialogOpen] = useState(false);
  const [previewProject, setPreviewProject] = useState<SovereignWorkspaceProject | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "SOVEREIGN_OPERATOR" as SovereignWorkspaceRole,
  });
  const [newProjectForm, setNewProjectForm] = useState({
    code: "",
    name: "",
    nameAr: "",
    description: "",
    platformType: "custom" as SovereignPlatformType,
    category: "commercial",
  });
  
  // Logo Binding System State
  const [logoStates, setLogoStates] = useState<Map<string, PlatformLogoState>>(new Map());
  const [complianceStats, setComplianceStats] = useState<ReturnType<typeof checkGlobalCompliance> | null>(null);
  
  // Load logo states and subscribe to updates
  useEffect(() => {
    const loadLogoStates = () => {
      const states = new Map<string, PlatformLogoState>();
      platformIconsRegistry.forEach(platform => {
        const state = getPlatformLogoState(platform.id);
        if (state) {
          states.set(platform.id, state);
        }
      });
      setLogoStates(states);
      setComplianceStats(checkGlobalCompliance());
    };
    
    loadLogoStates();
    
    // Subscribe to logo sync events
    const unsubscribe = subscribeToLogoSync(() => {
      loadLogoStates();
    });
    
    return unsubscribe;
  }, []);

  const { data: workspace, isLoading: workspaceLoading, error: workspaceError } = useQuery<SovereignWorkspace>({
    queryKey: ["/api/sovereign-workspace/workspace"],
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<SovereignWorkspaceProject[]>({
    queryKey: ["/api/sovereign-workspace/projects"],
    enabled: !!workspace,
  });

  const { data: stats } = useQuery<{
    totalProjects: number;
    liveProjects: number;
    draftProjects: number;
    buildingProjects: number;
    totalMembers: number;
    activeMembers: number;
    projectsByType: Record<string, number>;
  }>({
    queryKey: ["/api/sovereign-workspace/stats"],
    enabled: !!workspace,
  });

  const { data: membersData } = useQuery<{
    owner: { id: string; username: string; email: string; fullName: string; role: string };
    members: SovereignWorkspaceMember[];
  }>({
    queryKey: ["/api/sovereign-workspace/members"],
    enabled: !!workspace,
  });

  const { data: logs = [] } = useQuery<(SovereignWorkspaceAccessLog & { user: { id: string; username: string; fullName: string } })[]>({
    queryKey: ["/api/sovereign-workspace/logs"],
    enabled: !!workspace && activeTab === "audit",
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof newProjectForm) => {
      return apiRequest("POST", "/api/sovereign-workspace/projects", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-workspace/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-workspace/stats"] });
      setNewProjectDialogOpen(false);
      setNewProjectForm({
        code: "",
        name: "",
        nameAr: "",
        description: "",
        platformType: "custom",
        category: "commercial",
      });
      toast({
        title: "Platform Created | تم إنشاء المنصة",
        description: "New platform project has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error | خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deployProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return apiRequest("POST", `/api/sovereign-workspace/projects/${projectId}/deploy`, { environment: "production" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-workspace/projects"] });
      toast({
        title: "Deployment Started | بدأ النشر",
        description: "Platform deployment has been triggered.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed | فشل النشر",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: async (data: { email: string; role: SovereignWorkspaceRole }) => {
      return apiRequest("POST", "/api/sovereign-workspace/members/invite-by-email", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-workspace/members"] });
      setInviteMemberDialogOpen(false);
      setInviteForm({ email: "", role: "SOVEREIGN_OPERATOR" });
      toast({
        title: "Invitation Sent | تم إرسال الدعوة",
        description: "Member invitation has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Invitation Failed | فشل الدعوة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return apiRequest("DELETE", `/api/sovereign-workspace/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sovereign-workspace/members"] });
      toast({
        title: "Member Removed | تم إزالة العضو",
        description: "Member has been removed from the workspace.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error | خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (workspaceLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (workspaceError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Shield className="h-16 w-16 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied | تم رفض الوصول</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You do not have permission to access the Sovereign Workspace. This area is restricted to platform owners and authorized staff only.
        </p>
        <p className="text-muted-foreground text-center max-w-md text-sm">
          ليس لديك صلاحية الوصول إلى مساحة العمل السيادية. هذه المنطقة مقتصرة على مالكي المنصات والموظفين المعتمدين فقط.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-workspace-title">
              {workspace?.name || "Sovereign Workspace"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {workspace?.nameAr || "مساحة العمل السيادية"} - Platform Factory
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3 w-3" />
            ISOLATED | معزولة
          </Badge>
          <Badge variant="default" className="gap-1">
            <Activity className="h-3 w-3" />
            {workspace?.status || "active"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Platforms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-platforms">{stats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground">إجمالي المنصات</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Live Platforms</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="stat-live-platforms">{stats?.liveProjects || 0}</div>
            <p className="text-xs text-muted-foreground">المنصات النشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">In Development</CardTitle>
            <Code2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="stat-building-platforms">{(stats?.draftProjects || 0) + (stats?.buildingProjects || 0)}</div>
            <p className="text-xs text-muted-foreground">قيد التطوير</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-team-members">{stats?.totalMembers || 1}</div>
            <p className="text-xs text-muted-foreground">أعضاء الفريق</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto flex-wrap">
          <TabsTrigger value="platforms" className="gap-2" data-testid="tab-platforms">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Platforms</span>
          </TabsTrigger>
          <TabsTrigger value="landing-pages" className="gap-2" data-testid="tab-landing-pages">
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">Landing Pages</span>
          </TabsTrigger>
          <TabsTrigger value="group-logos" className="gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30" data-testid="tab-group-logos">
            <Download className="h-4 w-4 text-purple-500" />
            <span className="hidden sm:inline text-purple-600 dark:text-purple-400">Group Platform Logos</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2" data-testid="tab-team">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2" data-testid="tab-audit">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Audit Log</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="sovereign-core" className="gap-2 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border-violet-500/30" data-testid="tab-sovereign-core">
            <Shield className="h-4 w-4 text-violet-500" />
            <span className="hidden sm:inline text-violet-600 dark:text-violet-400">Sovereign Core</span>
          </TabsTrigger>
          <TabsTrigger value="nova-ai" className="gap-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/30" data-testid="tab-nova-ai">
            <Brain className="h-4 w-4 text-cyan-500" />
            <span className="hidden sm:inline text-cyan-600 dark:text-cyan-400">Nova AI</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Platform Projects | مشاريع المنصات</h2>
              <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-platform">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Platform
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Platform | إنشاء منصة جديدة</DialogTitle>
                    <DialogDescription>
                      Define the specifications for a new sovereign platform to be generated.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="code" className="text-right">Code</Label>
                      <Input
                        id="code"
                        placeholder="INFERA-ECOM-001"
                        className="col-span-3"
                        value={newProjectForm.code}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, code: e.target.value })}
                        data-testid="input-platform-code"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name (EN)</Label>
                      <Input
                        id="name"
                        placeholder="E-Commerce Platform"
                        className="col-span-3"
                        value={newProjectForm.name}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                        data-testid="input-platform-name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="nameAr" className="text-right">Name (AR)</Label>
                      <Input
                        id="nameAr"
                        placeholder="منصة تجارة إلكترونية"
                        className="col-span-3"
                        value={newProjectForm.nameAr}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, nameAr: e.target.value })}
                        data-testid="input-platform-name-ar"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">Type</Label>
                      <Select
                        value={newProjectForm.platformType}
                        onValueChange={(value) => setNewProjectForm({ ...newProjectForm, platformType: value as SovereignPlatformType })}
                      >
                        <SelectTrigger className="col-span-3" data-testid="select-platform-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(platformTypeLabels).map(([key, { en, ar }]) => (
                            <SelectItem key={key} value={key}>
                              {en} | {ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">Category</Label>
                      <Select
                        value={newProjectForm.category}
                        onValueChange={(value) => setNewProjectForm({ ...newProjectForm, category: value })}
                      >
                        <SelectTrigger className="col-span-3" data-testid="select-platform-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="commercial">Commercial | تجاري</SelectItem>
                          <SelectItem value="sovereign">Sovereign | سيادي</SelectItem>
                          <SelectItem value="internal">Internal | داخلي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Platform description..."
                        className="col-span-3"
                        value={newProjectForm.description}
                        onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                        data-testid="input-platform-description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewProjectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createProjectMutation.mutate(newProjectForm)}
                      disabled={createProjectMutation.isPending || !newProjectForm.code || !newProjectForm.name}
                      data-testid="button-confirm-create-platform"
                    >
                      {createProjectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create Platform
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {projectsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                  <div className="text-center">
                    <h3 className="font-semibold">No Platforms Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first sovereign platform to get started.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      أنشئ أول منصة سيادية لك للبدء.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projects.map((project) => {
                  const typeInfo = platformTypeLabels[project.platformType as SovereignPlatformType] || platformTypeLabels.custom;
                  const TypeIcon = typeInfo.icon;
                  const statusInfo = statusBadgeVariants[project.deploymentStatus] || statusBadgeVariants.draft;
                  const platformIcon = findPlatformIcon(project);
                  const isLive = project.deploymentStatus === "live" || project.deploymentStatus === "active";
                  const gradientColors = platformIcon 
                    ? { from: platformIcon.colors.primary, to: platformIcon.colors.secondary }
                    : { from: '#0f172a', to: '#1e293b' };
                  
                  return (
                    <Card key={project.id} className="hover-elevate relative overflow-visible" data-testid={`card-platform-${project.id}`}>
                      {/* Live indicator - glowing green dot */}
                      {isLive && (
                        <div className="absolute -top-1.5 -right-1.5 z-10">
                          <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background shadow-lg shadow-green-500/50"></span>
                          </span>
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md"
                              style={{ background: `linear-gradient(135deg, ${gradientColors.from}, ${gradientColors.to})` }}
                            >
                              <TypeIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{project.name}</CardTitle>
                              <CardDescription className="text-xs">{project.nameAr}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className={"text-xs !border-0 " + statusInfo.color.replace("bg-", "!bg-").replace("text-", "!text-")}>
                            {statusInfo.en} | {statusInfo.ar}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Code:</span>
                            <code className="text-xs bg-muted px-2 py-0.5 rounded">{project.code}</code>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span>{typeInfo.en}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Version:</span>
                            <span>{project.version || "1.0.0"}</span>
                          </div>
                          {project.deploymentUrl && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">URL:</span>
                              <a 
                                href={project.deploymentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-xs truncate max-w-[150px]"
                              >
                                {project.deploymentUrl}
                              </a>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 gap-2 flex-wrap">
                        {(() => {
                          const landingRoute = getPlatformLandingRoute(project.code || '') || getPlatformLandingRoute(project.name || '');
                          return (
                            <>
                              {landingRoute && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => setLocation(landingRoute)}
                                  data-testid={`button-landing-${project.id}`}
                                >
                                  <Globe className="h-4 w-4 mr-1" />
                                  Landing
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1" 
                                onClick={() => {
                                  setPreviewProject(project);
                                  setShowPreviewDialog(true);
                                }}
                                data-testid={`button-view-${project.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1"
                                disabled={project.deploymentStatus === "deploying" || deployProjectMutation.isPending}
                                onClick={() => deployProjectMutation.mutate(project.id)}
                                data-testid={`button-deploy-${project.id}`}
                              >
                                {project.deploymentStatus === "deploying" ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Rocket className="h-4 w-4 mr-1" />
                                )}
                                Deploy
                              </Button>
                            </>
                          );
                        })()}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="landing-pages" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold">Platform Landing Pages | صفحات الهبوط للمنصات</h2>
                <p className="text-sm text-muted-foreground">
                  Manage and customize landing pages for each sovereign platform dynamically.
                  <span className="block text-muted-foreground/80" dir="rtl">إدارة وتخصيص صفحات الهبوط لكل منصة سيادية ديناميكياً.</span>
                </p>
              </div>
            </div>

            {projectsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <Card className="py-12">
                <CardContent className="flex flex-col items-center justify-center">
                  <Layout className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Platforms Yet | لا توجد منصات بعد</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create platforms first to manage their landing pages.
                    <span className="block" dir="rtl">أنشئ منصات أولاً لإدارة صفحات الهبوط الخاصة بها.</span>
                  </p>
                  <Button onClick={() => setNewProjectDialogOpen(true)} data-testid="button-create-platform-empty">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Platform | إنشاء منصة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => {
                  const platformIcon = findPlatformIcon(project);
                  const FallbackIcon = platformTypeLabels[project.platformType]?.icon || Globe;
                  const gradientColors = platformIcon 
                    ? { from: platformIcon.colors.primary, to: platformIcon.colors.secondary }
                    : { from: '#0f172a', to: '#1e293b' };
                  const isLive = project.deploymentStatus === "live" || project.deploymentStatus === "active" || project.deploymentStatus === "deployed";
                  const typeInfo = platformTypeLabels[project.platformType as SovereignPlatformType] || platformTypeLabels.custom;
                  
                  return (
                    <Card key={project.id} className="overflow-hidden hover-elevate relative group" data-testid={`card-landing-${project.id}`}>
                      {/* Live indicator */}
                      {isLive && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                          </span>
                        </div>
                      )}
                      
                      {/* Gradient Header with Large Icon */}
                      <div 
                        className="relative h-32 flex items-center justify-center overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${gradientColors.from}, ${gradientColors.to})` }}
                      >
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                            {platformIcon?.logoBase64 ? (
                              <img 
                                src={`data:image/png;base64,${platformIcon.logoBase64}`} 
                                alt={project.name}
                                className="w-10 h-10 object-contain"
                              />
                            ) : (
                              <FallbackIcon className="h-8 w-8 text-white drop-shadow-lg" />
                            )}
                          </div>
                          <h3 className="text-white font-bold text-lg drop-shadow-md">{project.name}</h3>
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <CardContent className="p-4 space-y-4">
                        {/* Arabic Name & Description */}
                        <div className="text-center pb-2 border-b border-border/50">
                          <p className="text-sm text-muted-foreground font-medium" dir="rtl">{project.nameAr}</p>
                          {project.description && (
                            <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">{project.description}</p>
                          )}
                        </div>
                        
                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <span className="text-muted-foreground block">Platform Code</span>
                            <Badge variant="outline" className="text-xs font-mono">{project.code}</Badge>
                          </div>
                          <div className="space-y-1 text-right" dir="rtl">
                            <span className="text-muted-foreground block">رمز المنصة</span>
                            <Badge variant="outline" className="text-xs">{typeInfo.ar}</Badge>
                          </div>
                        </div>
                        
                        {/* Status Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <Badge 
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              isLive && "!bg-green-500/20 !text-green-600 dark:!text-green-400"
                            )}
                          >
                            {isLive ? "Live | مباشر" : "Draft | مسودة"}
                          </Badge>
                          <Badge 
                            variant="secondary"
                            className={statusBadgeVariants[project.status]?.color || "bg-muted"}
                          >
                            {statusBadgeVariants[project.status]?.en || project.status}
                          </Badge>
                        </div>
                      </CardContent>
                      
                      {/* Action Buttons */}
                      <CardFooter className="p-3 gap-2 border-t bg-muted/30 flex-wrap">
                        {(() => {
                          const landingRoute = getPlatformLandingRoute(project.code || '') || getPlatformLandingRoute(project.name || '');
                          const pitchDeckRoute = getPlatformPitchDeckRoute(project.code || '') || getPlatformPitchDeckRoute(project.name || '');
                          
                          return (
                            <>
                              {landingRoute && (
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => setLocation(landingRoute)}
                                  data-testid={`button-view-landingpage-${project.id}`}
                                >
                                  <Globe className="h-4 w-4 mr-1" />
                                  Landing Page
                                </Button>
                              )}
                              {pitchDeckRoute && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => setLocation(pitchDeckRoute)}
                                  data-testid={`button-view-pitchdeck-${project.id}`}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  Pitch Deck
                                </Button>
                              )}
                              <Button 
                                variant="outline"
                                size="sm" 
                                className="flex-1"
                                onClick={() => {
                                  setPreviewProject(project);
                                  setShowPreviewDialog(true);
                                }}
                                data-testid={`button-preview-landing-${project.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Preview | معاينة
                              </Button>
                              <Button 
                                variant={project.deploymentUrl ? "default" : "secondary"}
                                size="icon"
                                asChild={!!project.deploymentUrl}
                                disabled={!project.deploymentUrl}
                                data-testid={`button-external-landing-${project.id}`}
                              >
                                {project.deploymentUrl ? (
                                  <a href={project.deploymentUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                ) : (
                                  <ExternalLink className="h-4 w-4" />
                                )}
                              </Button>
                            </>
                          );
                        })()}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Group Platform Logos - لوجوهات منصات المجموعة */}
        <TabsContent value="group-logos" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Group Platform Logos | لوجوهات منصات المجموعة
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {platformIconsRegistry.length} professional logos with multiple sizes and variants | {platformIconsRegistry.length} لوجو احترافي بأحجام وأشكال متعددة
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {complianceStats && (
                  <Badge 
                    variant={complianceStats.compliant === complianceStats.totalPlatforms ? "default" : "outline"}
                    className={complianceStats.compliant === complianceStats.totalPlatforms ? "bg-green-500" : "border-amber-500/50 text-amber-600"}
                  >
                    <Link2 className="h-3 w-3 mr-1" />
                    {complianceStats.compliant}/{complianceStats.totalPlatforms} Synced
                  </Badge>
                )}
                <Badge variant="outline" className="border-purple-500/50 text-purple-600">
                  <Download className="h-3 w-3 mr-1" />
                  Downloadable Assets
                </Badge>
              </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {platformIconsRegistry.map((platform) => {
                const logoState = logoStates.get(platform.id);
                const isSynced = logoState?.complianceStatus === "compliant";
                const isPartial = logoState?.complianceStatus === "partial";
                
                return (
                <Card 
                  key={platform.id}
                  className={cn(
                    "group border-border/50 hover:border-purple-500/30 transition-all",
                    isSynced && "border-green-500/30",
                    isPartial && "border-amber-500/30"
                  )}
                  data-testid={`card-logo-${platform.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-lg border border-border/50 relative",
                            isSynced && "ring-2 ring-green-500/50"
                          )}
                          style={{ backgroundColor: platform.colors.primary }}
                        >
                          <Globe className="h-6 w-6" style={{ color: platform.colors.accent }} />
                          {isSynced && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {isPartial && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                              <AlertCircle className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold">{platform.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{platform.nameAr}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {platform.category}
                        </Badge>
                        {logoState && (
                          <Badge 
                            variant={isSynced ? "default" : isPartial ? "outline" : "secondary"}
                            className={cn(
                              "text-[9px]",
                              isSynced && "bg-green-500",
                              isPartial && "border-amber-500/50 text-amber-600"
                            )}
                          >
                            {isSynced ? "Synced" : isPartial ? "Partial" : "Not Synced"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      "{platform.meaning}" | "{platform.meaningAr}"
                    </p>
                    {logoState && logoState.lastSync > 0 && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <History className="h-3 w-3" />
                        Last synced: {new Date(logoState.lastSync).toLocaleDateString()}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    {/* Color Palette */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] text-muted-foreground">Colors:</span>
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-5 h-5 rounded border border-border/30" 
                          style={{ backgroundColor: platform.colors.primary }}
                          title={`Primary: ${platform.colors.primary}`}
                        />
                        <div 
                          className="w-5 h-5 rounded border border-border/30" 
                          style={{ backgroundColor: platform.colors.secondary }}
                          title={`Secondary: ${platform.colors.secondary}`}
                        />
                        <div 
                          className="w-5 h-5 rounded border border-border/30" 
                          style={{ backgroundColor: platform.colors.accent }}
                          title={`Accent: ${platform.colors.accent}`}
                        />
                      </div>
                    </div>
                    
                    {/* Logo Variants Grid - 7 Required Files per Archive Rules */}
                    <div className="grid grid-cols-7 gap-1.5 p-3 bg-muted/30 rounded-lg">
                      {/* App Icon 1024x1024 */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center" style={{ backgroundColor: platform.colors.primary }}>
                          <div className="w-5 h-5 rounded" style={{ background: `linear-gradient(135deg, ${platform.colors.secondary}40, ${platform.colors.accent}60)` }} />
                        </div>
                        <span className="text-[8px] text-muted-foreground text-center">1024px</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => generatePlatformLogo(platform, 'app-icon', 1024)}
                          data-testid={`button-download-app-icon-${platform.id}`}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Favicon 32x32 */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center" style={{ backgroundColor: platform.colors.primary }}>
                          <div className="w-4 h-4 rounded-sm" style={{ background: `linear-gradient(135deg, ${platform.colors.secondary}40, ${platform.colors.accent}60)` }} />
                        </div>
                        <span className="text-[8px] text-muted-foreground text-center">32px</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => generatePlatformLogo(platform, 'favicon-32', 32)}
                          data-testid={`button-download-favicon-32-${platform.id}`}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Favicon 16x16 */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center" style={{ backgroundColor: platform.colors.primary }}>
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: platform.colors.accent }} />
                        </div>
                        <span className="text-[8px] text-muted-foreground text-center">16px</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => generatePlatformLogo(platform, 'favicon-16', 16)}
                          data-testid={`button-download-favicon-16-${platform.id}`}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Tab Icon SVG */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center bg-background">
                          <div className="w-5 h-5 rounded" style={{ background: `linear-gradient(135deg, ${platform.colors.primary}, ${platform.colors.secondary})` }} />
                        </div>
                        <span className="text-[8px] text-muted-foreground text-center">Tab</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => generatePlatformLogo(platform, 'tab-icon', 64)}
                          data-testid={`button-download-tab-${platform.id}`}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Monochrome SVG */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center bg-gray-900">
                          <div className="w-5 h-5 rounded border border-white/50" />
                        </div>
                        <span className="text-[8px] text-muted-foreground text-center">Mono</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => generatePlatformLogo(platform, 'mono', 512)}
                          data-testid={`button-download-mono-${platform.id}`}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Light Background */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center bg-gray-100">
                          <div className="w-5 h-5 rounded" style={{ background: platform.colors.primary }} />
                        </div>
                        <span className="text-[8px] text-muted-foreground text-center">Light</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => generatePlatformLogo(platform, 'light', 512)}
                          data-testid={`button-download-light-${platform.id}`}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Dark Background */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center bg-gray-950">
                          <div className="w-5 h-5 rounded" style={{ background: platform.colors.accent }} />
                        </div>
                        <span className="text-[8px] text-muted-foreground text-center">Dark</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => generatePlatformLogo(platform, 'dark', 512)}
                          data-testid={`button-download-dark-${platform.id}`}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0 flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1 text-xs"
                      onClick={() => downloadAllLogoVariants(platform)}
                      data-testid={`button-download-all-${platform.id}`}
                    >
                      <Download className="h-3 w-3" />
                      Download All (7 Files)
                    </Button>
                    <div className="flex items-center gap-1 flex-wrap">
                      {platform.usageContexts.slice(0, 3).map((ctx) => (
                        <Badge key={ctx} variant="outline" className="text-[9px]">
                          {ctx}
                        </Badge>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Team Members | أعضاء الفريق</h2>
              <Dialog open={inviteMemberDialogOpen} onOpenChange={setInviteMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-invite-member">
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Invite Team Member | دعوة عضو فريق</DialogTitle>
                    <DialogDescription>
                      Add a new member to the Sovereign Workspace by email address.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        className="col-span-3"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        data-testid="input-member-email"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">Role</Label>
                      <Select
                        value={inviteForm.role}
                        onValueChange={(value) => setInviteForm({ ...inviteForm, role: value as SovereignWorkspaceRole })}
                      >
                        <SelectTrigger className="col-span-3" data-testid="select-member-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleLabels).map(([key, { en, ar, description }]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex flex-col">
                                <span>{en} | {ar}</span>
                                <span className="text-xs text-muted-foreground">{description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteMemberDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => inviteMemberMutation.mutate(inviteForm)}
                      disabled={inviteMemberMutation.isPending || !inviteForm.email}
                      data-testid="button-confirm-invite"
                    >
                      {inviteMemberMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Invite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {membersData?.owner && (
                <Card data-testid="card-owner">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{membersData.owner.fullName || membersData.owner.username}</CardTitle>
                        <CardDescription className="text-xs">{membersData.owner.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="default">ROOT_OWNER | المالك الأصلي</Badge>
                  </CardContent>
                </Card>
              )}

              {membersData?.members.map((member) => {
                const roleInfo = roleLabels[member.role as SovereignWorkspaceRole];
                return (
                  <Card key={member.id} data-testid={`card-member-${member.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{(member as any).user?.fullName || (member as any).user?.username || "Unknown"}</CardTitle>
                            <CardDescription className="text-xs">{(member as any).user?.email}</CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeMemberMutation.mutate(member.id)}
                          disabled={removeMemberMutation.isPending}
                          data-testid={`button-remove-member-${member.id}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={member.status === "active" ? "default" : "secondary"}>
                          {roleInfo?.en || member.role} | {roleInfo?.ar || member.role}
                        </Badge>
                        <Badge variant="outline">{member.status}</Badge>
                      </div>
                      {roleInfo && (
                        <p className="text-xs text-muted-foreground mt-2">{roleInfo.description}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Audit Log | سجل التدقيق</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" data-testid="button-refresh-logs">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" data-testid="button-export-logs">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No audit logs yet</p>
                      <p className="text-muted-foreground text-sm">لا توجد سجلات تدقيق بعد</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 gap-4" data-testid={`log-entry-${log.id}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${log.success ? "bg-green-500/10" : "bg-red-500/10"}`}>
                            {log.success ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {log.user?.fullName || log.user?.username} - {log.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.resource} {log.resourceId && `(${log.resourceId.substring(0, 8)}...)`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {log.createdAt ? format(new Date(log.createdAt), "MMM d, yyyy HH:mm") : "-"}
                          </p>
                          {log.ipAddress && (
                            <p className="text-xs text-muted-foreground">{log.ipAddress}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Workspace Settings | إعدادات مساحة العمل</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">General Settings</CardTitle>
                  <CardDescription>Basic workspace configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Max Platforms</p>
                      <p className="text-xs text-muted-foreground">الحد الأقصى للمنصات</p>
                    </div>
                    <Badge variant="outline">{workspace?.settings?.maxPlatforms || 50}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Max Members</p>
                      <p className="text-xs text-muted-foreground">الحد الأقصى للأعضاء</p>
                    </div>
                    <Badge variant="outline">{workspace?.settings?.maxMembers || 10}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Security Settings</CardTitle>
                  <CardDescription>Access and audit configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Require Approval for Deploy</p>
                      <p className="text-xs text-muted-foreground">طلب الموافقة للنشر</p>
                    </div>
                    <Badge variant={workspace?.settings?.requireApprovalForDeploy ? "default" : "secondary"}>
                      {workspace?.settings?.requireApprovalForDeploy ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Auto Audit Log</p>
                      <p className="text-xs text-muted-foreground">سجل التدقيق التلقائي</p>
                    </div>
                    <Badge variant={workspace?.settings?.autoAuditLog !== false ? "default" : "secondary"}>
                      {workspace?.settings?.autoAuditLog !== false ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Notify on Access</p>
                      <p className="text-xs text-muted-foreground">إشعار عند الوصول</p>
                    </div>
                    <Badge variant={workspace?.settings?.notifyOnAccess ? "default" : "secondary"}>
                      {workspace?.settings?.notifyOnAccess ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sovereign-core" className="mt-6">
          <SovereignCoreIDELauncher workspaceId={workspace?.id || ""} isOwner={true} />
        </TabsContent>

        <TabsContent value="nova-ai" className="mt-6">
          <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-cyan-500" />
                Nova AI - Sovereign Decision Governor
              </CardTitle>
              <CardDescription>
                حاكم القرارات السيادي - ليس مجرد مساعد بل نظام حوكمة ذكي متكامل
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[600px]">
              <NovaSovereignWorkspace isOwner={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Landing Page Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {previewProject?.name} | {previewProject?.nameAr}
            </DialogTitle>
            <DialogDescription>
              Preview landing page before publishing
              <span className="block" dir="rtl">معاينة صفحة الهبوط قبل النشر</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-[500px] border rounded-lg bg-white dark:bg-slate-900 overflow-hidden">
            {previewProject ? (
              previewProject.htmlCode ? (
                <iframe
                  title={`Preview: ${previewProject.name}`}
                  className="w-full h-full border-0"
                  style={{ minHeight: '500px' }}
                  srcDoc={`
                    <!DOCTYPE html>
                    <html lang="ar" dir="rtl">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>${previewProject.name}</title>
                      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                      <style>
                        ${previewProject.cssCode || ''}
                      </style>
                    </head>
                    <body>
                      ${previewProject.htmlCode || ''}
                      <script>
                        ${previewProject.jsCode || ''}
                      </script>
                    </body>
                    </html>
                  `}
                  sandbox="allow-scripts"
                />
              ) : (
                <div className="p-8 h-full flex flex-col items-center justify-center">
                  <div className="text-center space-y-6 max-w-md">
                    <div 
                      className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${findPlatformIcon(previewProject)?.colors.primary || '#0f172a'}, ${findPlatformIcon(previewProject)?.colors.secondary || '#1e293b'})`
                      }}
                    >
                      {(() => {
                        const platformIcon = findPlatformIcon(previewProject);
                        const FallbackIcon = platformTypeLabels[previewProject.platformType]?.icon || Globe;
                        return platformIcon?.logoBase64 ? (
                          <img 
                            src={`data:image/png;base64,${platformIcon.logoBase64}`} 
                            alt={previewProject.name}
                            className="w-14 h-14 object-contain"
                          />
                        ) : (
                          <FallbackIcon className="h-12 w-12 text-white" />
                        );
                      })()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{previewProject.name}</h2>
                      <p className="text-lg text-muted-foreground mt-1" dir="rtl">{previewProject.nameAr}</p>
                    </div>
                    {previewProject.description && (
                      <p className="text-muted-foreground">{previewProject.description}</p>
                    )}
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <Badge>{previewProject.code}</Badge>
                      <Badge variant="outline">
                        {platformTypeLabels[previewProject.platformType]?.en} | {platformTypeLabels[previewProject.platformType]?.ar}
                      </Badge>
                      <Badge variant="secondary" className={"!border-0 " + (statusBadgeVariants[previewProject.deploymentStatus]?.color || statusBadgeVariants.draft.color).replace("bg-", "!bg-").replace("text-", "!text-")}>
                        {statusBadgeVariants[previewProject.deploymentStatus]?.en || statusBadgeVariants.draft.en} | {statusBadgeVariants[previewProject.deploymentStatus]?.ar || statusBadgeVariants.draft.ar}
                      </Badge>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        No landing page content yet. Click "Edit" to design your landing page.
                      </p>
                      <p className="text-sm text-muted-foreground" dir="rtl">
                        لا يوجد محتوى لصفحة الهبوط بعد. اضغط "تحرير" لتصميم صفحة الهبوط.
                      </p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No platform selected
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close | إغلاق
            </Button>
            {previewProject && (
              <Button onClick={() => {
                setShowPreviewDialog(false);
                setLocation(`/builder?projectId=${previewProject.id}`);
              }}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit | تحرير
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
