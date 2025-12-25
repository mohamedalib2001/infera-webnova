import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Eye, EyeOff, Crown, Shield, User, Users, Zap, Lock, Unlock,
  ChevronRight, X, Layers, Route, Settings, Code
} from "lucide-react";
import { cn } from "@/lib/utils";

type RoleType = "owner" | "sovereign" | "manager" | "employee" | "subscriber" | "free" | "pro" | "enterprise" | "public";
type CapabilityType = string;

interface VisibilityRule {
  roles: RoleType[];
  plans?: string[];
  capabilities?: CapabilityType[];
  workspaces?: string[];
}

interface ElementPermissions {
  componentName: string;
  route?: string;
  visibility: VisibilityRule;
  description?: string;
}

interface SovereignViewContextType {
  isEnabled: boolean;
  toggleView: () => void;
  registerElement: (id: string, permissions: ElementPermissions) => void;
  unregisterElement: (id: string) => void;
  inspectedElement: { id: string; permissions: ElementPermissions } | null;
  setInspectedElement: (el: { id: string; permissions: ElementPermissions } | null) => void;
  getElementPermissions: (id: string) => ElementPermissions | undefined;
}

const SovereignViewContext = createContext<SovereignViewContextType | null>(null);

export function useSovereignView() {
  const context = useContext(SovereignViewContext);
  if (!context) {
    return {
      isEnabled: false,
      toggleView: () => {},
      registerElement: () => {},
      unregisterElement: () => {},
      inspectedElement: null,
      setInspectedElement: () => {},
      getElementPermissions: () => undefined,
    };
  }
  return context;
}

const roleConfig: Record<RoleType, { icon: typeof Crown; color: string; label: string; labelAr: string }> = {
  owner: { icon: Crown, color: "text-purple-500", label: "Owner", labelAr: "المالك" },
  sovereign: { icon: Shield, color: "text-violet-500", label: "Sovereign", labelAr: "سيادي" },
  manager: { icon: Users, color: "text-blue-500", label: "Manager", labelAr: "مدير" },
  employee: { icon: User, color: "text-cyan-500", label: "Employee", labelAr: "موظف" },
  subscriber: { icon: Zap, color: "text-amber-500", label: "Subscriber", labelAr: "مشترك" },
  free: { icon: User, color: "text-green-500", label: "Free", labelAr: "مجاني" },
  pro: { icon: Zap, color: "text-blue-500", label: "Pro", labelAr: "برو" },
  enterprise: { icon: Shield, color: "text-purple-500", label: "Enterprise", labelAr: "مؤسسي" },
  public: { icon: User, color: "text-gray-500", label: "Public", labelAr: "عام" },
};

export function SovereignViewProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [inspectedElement, setInspectedElement] = useState<{ id: string; permissions: ElementPermissions } | null>(null);
  const elementsRegistry = useRef<Map<string, ElementPermissions>>(new Map());
  
  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.username === "mohamedalib2001";
  
  const toggleView = useCallback(() => {
    if (!isOwner) return;
    setIsEnabled(prev => !prev);
  }, [isOwner]);
  
  const registerElement = useCallback((id: string, permissions: ElementPermissions) => {
    elementsRegistry.current.set(id, permissions);
  }, []);
  
  const unregisterElement = useCallback((id: string) => {
    elementsRegistry.current.delete(id);
  }, []);
  
  const getElementPermissions = useCallback((id: string) => {
    return elementsRegistry.current.get(id);
  }, []);
  
  useEffect(() => {
    if (!isOwner) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        toggleView();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOwner, toggleView]);
  
  return (
    <SovereignViewContext.Provider value={{
      isEnabled: isOwner ? isEnabled : false,
      toggleView,
      registerElement,
      unregisterElement,
      inspectedElement,
      setInspectedElement,
      getElementPermissions,
    }}>
      {children}
      {isOwner && isEnabled && <SovereignOverlay />}
      {isOwner && <PermissionInspectorPanel />}
    </SovereignViewContext.Provider>
  );
}

export function SovereignViewToggle() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const context = useContext(SovereignViewContext);
  
  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.username === "mohamedalib2001";
  if (!isOwner || !context) return null;
  
  const { isEnabled, toggleView } = context;
  
  return (
    <Button
      variant={isEnabled ? "default" : "outline"}
      size="sm"
      onClick={toggleView}
      className={cn(
        "gap-2 transition-all",
        isEnabled && "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0"
      )}
      title={language === "ar" ? "العرض السيادي (Ctrl+Shift+S)" : "Sovereign View (Ctrl+Shift+S)"}
      data-testid="button-sovereign-view-toggle"
    >
      <Settings className="h-4 w-4" />
      <span className="hidden sm:inline">
        {language === "ar" ? "العرض السيادي" : "Sovereign View"}
      </span>
      <Badge 
        variant={isEnabled ? "secondary" : "outline"} 
        className={cn(
          "text-xs px-1.5",
          isEnabled ? "bg-white/20 text-white border-0" : ""
        )}
      >
        {isEnabled ? "ON" : "OFF"}
      </Badge>
    </Button>
  );
}

function SovereignOverlay() {
  const { language } = useLanguage();
  
  return (
    <div className="fixed bottom-4 left-4 z-[9998] pointer-events-none">
      <div className="bg-gradient-to-r from-violet-600/90 to-purple-600/90 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-2 shadow-lg">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        {language === "ar" ? "وضع السيادي نشط" : "Sovereign View Active"}
      </div>
    </div>
  );
}

interface MicroBadgeProps {
  roles: RoleType[];
  size?: "xs" | "sm";
  className?: string;
}

export function MicroBadge({ roles, size = "xs", className }: MicroBadgeProps) {
  const { isEnabled } = useSovereignView();
  const { language } = useLanguage();
  
  if (!isEnabled || roles.length === 0) return null;
  
  const primaryRole = roles[0];
  const config = roleConfig[primaryRole];
  const Icon = config.icon;
  
  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity",
        size === "xs" ? "text-[10px]" : "text-xs",
        className
      )}
      title={roles.map(r => language === "ar" ? roleConfig[r].labelAr : roleConfig[r].label).join(", ")}
    >
      <Icon className={cn("h-3 w-3", config.color)} />
      {roles.length > 1 && (
        <span className="text-muted-foreground">+{roles.length - 1}</span>
      )}
    </span>
  );
}

interface VisibilityBadgeProps {
  visibility: VisibilityRule;
  showOnHover?: boolean;
  className?: string;
}

export function VisibilityBadge({ visibility, showOnHover = true, className }: VisibilityBadgeProps) {
  const { isEnabled } = useSovereignView();
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  
  if (!isEnabled) return null;
  
  const { roles, plans, capabilities } = visibility;
  
  if (showOnHover && !isHovered) {
    return (
      <span
        className={cn(
          "inline-block w-2 h-2 rounded-full cursor-pointer transition-all",
          roles.includes("owner") ? "bg-purple-500" :
          roles.includes("pro") || roles.includes("enterprise") ? "bg-blue-500" :
          roles.includes("free") ? "bg-green-500" : "bg-gray-400",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    );
  }
  
  return (
    <div 
      className={cn(
        "absolute z-[9999] bg-popover border rounded-lg shadow-xl p-3 min-w-[200px]",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-xs font-medium mb-2 text-muted-foreground">
        {language === "ar" ? "مرئي لـ:" : "Visible to:"}
      </div>
      <div className="space-y-1">
        {Object.keys(roleConfig).map((role) => {
          const r = role as RoleType;
          const config = roleConfig[r];
          const Icon = config.icon;
          const isVisible = roles.includes(r);
          
          return (
            <div 
              key={role}
              className={cn(
                "flex items-center gap-2 text-xs",
                isVisible ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              {isVisible ? (
                <Unlock className="h-3 w-3 text-green-500" />
              ) : (
                <Lock className="h-3 w-3 text-red-500/50" />
              )}
              <Icon className={cn("h-3 w-3", config.color)} />
              <span>{language === "ar" ? config.labelAr : config.label}</span>
            </div>
          );
        })}
      </div>
      
      {capabilities && capabilities.length > 0 && (
        <>
          <Separator className="my-2" />
          <div className="text-xs">
            <span className="text-muted-foreground">
              {language === "ar" ? "الصلاحية: " : "Capability: "}
            </span>
            <code className="text-violet-500">{capabilities.join(", ")}</code>
          </div>
        </>
      )}
      
      {plans && plans.length > 0 && (
        <div className="text-xs mt-1">
          <span className="text-muted-foreground">
            {language === "ar" ? "الباقات: " : "Plans: "}
          </span>
          <span className="text-blue-500">{plans.join(", ")}</span>
        </div>
      )}
    </div>
  );
}

interface DevOverlayWrapperProps {
  children: React.ReactNode;
  id: string;
  permissions: ElementPermissions;
  className?: string;
}

export function DevOverlayWrapper({ children, id, permissions, className }: DevOverlayWrapperProps) {
  const { isEnabled, registerElement, unregisterElement, setInspectedElement } = useSovereignView();
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    registerElement(id, permissions);
    return () => unregisterElement(id);
  }, [id, permissions, registerElement, unregisterElement]);
  
  if (!isEnabled) return <>{children}</>;
  
  const primaryRole = permissions.visibility.roles[0];
  const borderColor = primaryRole === "owner" || primaryRole === "sovereign" 
    ? "border-purple-500/30" 
    : primaryRole === "pro" || primaryRole === "enterprise"
    ? "border-blue-500/30"
    : primaryRole === "free"
    ? "border-green-500/30"
    : "border-gray-500/30";
  
  return (
    <div 
      className={cn(
        "relative transition-all duration-200",
        isHovered && `border border-dashed ${borderColor} rounded-md`,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (e.altKey) {
          e.preventDefault();
          e.stopPropagation();
          setInspectedElement({ id, permissions });
        }
      }}
    >
      {children}
      
      {isHovered && (
        <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 z-50">
          <MicroBadge roles={permissions.visibility.roles} />
        </div>
      )}
    </div>
  );
}

function PermissionInspectorPanel() {
  const { inspectedElement, setInspectedElement, isEnabled } = useSovereignView();
  const { language } = useLanguage();
  
  if (!isEnabled || !inspectedElement) return null;
  
  const { permissions } = inspectedElement;
  const { visibility } = permissions;
  
  const t = {
    title: language === "ar" ? "فحص الصلاحيات" : "Permission Inspector",
    component: language === "ar" ? "المكون" : "Component",
    route: language === "ar" ? "المسار" : "Route",
    visibleTo: language === "ar" ? "مرئي لـ" : "Visible To",
    hiddenFrom: language === "ar" ? "مخفي عن" : "Hidden From",
    capabilities: language === "ar" ? "الصلاحيات" : "Capabilities",
    plans: language === "ar" ? "الباقات" : "Plans",
    close: language === "ar" ? "إغلاق" : "Close",
  };
  
  const visibleRoles = visibility.roles;
  const hiddenRoles = (Object.keys(roleConfig) as RoleType[]).filter(r => !visibleRoles.includes(r));
  
  return (
    <div className="fixed top-20 right-4 z-[10000] w-80 animate-in slide-in-from-right-5 duration-300">
      <Card className="border-violet-500/50 shadow-xl bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-violet-500" />
              {t.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setInspectedElement(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Layers className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{t.component}:</span>
              <code className="text-violet-500 font-medium">{permissions.componentName}</code>
            </div>
            
            {permissions.route && (
              <div className="flex items-center gap-2 text-xs">
                <Route className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{t.route}:</span>
                <code className="text-blue-500">{permissions.route}</code>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="text-xs font-medium text-green-600 flex items-center gap-1">
              <Unlock className="h-3 w-3" />
              {t.visibleTo}:
            </div>
            <ScrollArea className="h-20">
              <div className="space-y-1">
                {visibleRoles.map(role => {
                  const config = roleConfig[role];
                  const Icon = config.icon;
                  return (
                    <div key={role} className="flex items-center gap-2 text-xs">
                      <Icon className={cn("h-3 w-3", config.color)} />
                      <span>{language === "ar" ? config.labelAr : config.label}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          
          {hiddenRoles.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-red-500/70 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                {t.hiddenFrom}:
              </div>
              <ScrollArea className="h-16">
                <div className="space-y-1 opacity-60">
                  {hiddenRoles.map(role => {
                    const config = roleConfig[role];
                    const Icon = config.icon;
                    return (
                      <div key={role} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon className={cn("h-3 w-3", config.color)} />
                        <span>{language === "ar" ? config.labelAr : config.label}</span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {visibility.capabilities && visibility.capabilities.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  {t.capabilities}:
                </div>
                <div className="flex flex-wrap gap-1">
                  {visibility.capabilities.map(cap => (
                    <Badge key={cap} variant="secondary" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {visibility.plans && visibility.plans.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {t.plans}:
              </div>
              <div className="flex flex-wrap gap-1">
                {visibility.plans.map(plan => (
                  <Badge key={plan} variant="outline" className="text-xs">
                    {plan}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {permissions.description && (
            <>
              <Separator />
              <p className="text-xs text-muted-foreground">{permissions.description}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SidebarItemBadge({ roles }: { roles: RoleType[] }) {
  const { isEnabled } = useSovereignView();
  
  if (!isEnabled || roles.length === 0) return null;
  
  const primaryRole = roles[0];
  const config = roleConfig[primaryRole];
  const Icon = config.icon;
  
  return (
    <span className="ml-auto opacity-50">
      <Icon className={cn("h-3 w-3", config.color)} />
    </span>
  );
}

export function PageTitleBadge({ visibility }: { visibility: VisibilityRule }) {
  const { isEnabled } = useSovereignView();
  const { language } = useLanguage();
  
  if (!isEnabled) return null;
  
  const primaryRole = visibility.roles[0];
  const config = roleConfig[primaryRole];
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "opacity-70 text-xs gap-1",
        config.color
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{language === "ar" ? config.labelAr : config.label}</span>
      {visibility.roles.length > 1 && (
        <span className="text-muted-foreground">+{visibility.roles.length - 1}</span>
      )}
    </Badge>
  );
}

// Page permissions registry for route-based access control
const pagePermissionsRegistry: Record<string, { allowedRoles: RoleType[]; description: string; descriptionAr: string }> = {
  "/": { 
    allowedRoles: ["owner", "sovereign", "manager", "employee", "subscriber", "free", "pro", "enterprise", "public"],
    description: "Home page - accessible to everyone",
    descriptionAr: "الصفحة الرئيسية - متاحة للجميع"
  },
  "/home": { 
    allowedRoles: ["owner", "sovereign", "manager", "employee", "subscriber", "free", "pro", "enterprise", "public"],
    description: "Home page - accessible to everyone",
    descriptionAr: "الصفحة الرئيسية - متاحة للجميع"
  },
  "/owner": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Owner Dashboard - exclusive owner access",
    descriptionAr: "لوحة تحكم المالك - حصري للمالك"
  },
  "/owner/content-moderation": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Content Moderation - owner governance tool",
    descriptionAr: "مراقبة المحتوى - أداة حوكمة المالك"
  },
  "/api-keys": { 
    allowedRoles: ["owner", "sovereign"],
    description: "API Keys Management - owner only",
    descriptionAr: "إدارة مفاتيح API - المالك فقط"
  },
  "/users": { 
    allowedRoles: ["owner", "sovereign", "manager"],
    description: "User Management - owner and managers",
    descriptionAr: "إدارة المستخدمين - المالك والمديرين"
  },
  "/console": { 
    allowedRoles: ["owner", "sovereign", "manager", "employee", "pro", "enterprise"],
    description: "Console - authenticated users with permissions",
    descriptionAr: "وحدة التحكم - المستخدمين المصرح لهم"
  },
  "/cloud-ide": { 
    allowedRoles: ["owner", "sovereign", "manager", "employee", "subscriber", "free", "pro", "enterprise"],
    description: "Cloud IDE - all authenticated users",
    descriptionAr: "بيئة التطوير السحابية - جميع المستخدمين المسجلين"
  },
  "/ai-app-builder": { 
    allowedRoles: ["owner", "sovereign", "manager", "employee", "subscriber", "free", "pro", "enterprise"],
    description: "AI App Builder - all authenticated users",
    descriptionAr: "منشئ التطبيقات بالذكاء الاصطناعي - جميع المستخدمين"
  },
  "/ssl-certificates": { 
    allowedRoles: ["owner", "sovereign", "manager"],
    description: "SSL Certificates - administrative access",
    descriptionAr: "شهادات SSL - الوصول الإداري"
  },
  "/deploy": { 
    allowedRoles: ["owner", "sovereign", "manager", "pro", "enterprise"],
    description: "One-Click Deploy - admin and paid plans",
    descriptionAr: "النشر بنقرة واحدة - المسؤولين والباقات المدفوعة"
  },
  "/backend-generator": { 
    allowedRoles: ["owner", "sovereign", "manager", "employee", "pro", "enterprise"],
    description: "Backend Generator - development teams",
    descriptionAr: "مولد الواجهة الخلفية - فرق التطوير"
  },
  "/version-control": { 
    allowedRoles: ["owner", "sovereign", "manager", "employee", "subscriber", "free", "pro", "enterprise"],
    description: "Version Control - all authenticated users",
    descriptionAr: "التحكم بالإصدارات - جميع المستخدمين"
  },
  "/ai-copilot": { 
    allowedRoles: ["owner", "sovereign", "manager", "employee", "subscriber", "free", "pro", "enterprise"],
    description: "AI Copilot - all authenticated users",
    descriptionAr: "مساعد الذكاء الاصطناعي - جميع المستخدمين"
  },
  "/testing-generator": { 
    allowedRoles: ["owner", "sovereign", "manager", "employee", "pro", "enterprise"],
    description: "Testing Generator - development teams",
    descriptionAr: "مولد الاختبارات - فرق التطوير"
  },
  "/ci-cd": { 
    allowedRoles: ["owner", "sovereign", "manager", "pro", "enterprise"],
    description: "CI/CD Pipeline - admin and paid plans",
    descriptionAr: "خطوط CI/CD - المسؤولين والباقات المدفوعة"
  },
  // SOVEREIGN ZONE - المنطقة السيادية (المالك فقط)
  "/sovereign": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Sovereign Control Center - ROOT_OWNER exclusive",
    descriptionAr: "مركز التحكم السيادي - حصري للمالك الجذري"
  },
  "/sovereign-workspace": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Sovereign Workspace - ROOT_OWNER exclusive",
    descriptionAr: "مساحة العمل السيادية - حصري للمالك الجذري"
  },
  "/logo-factory": { 
    allowedRoles: ["owner", "sovereign"],
    description: "INFERA Logo Factory - Sovereign Visual Identity Generator - ROOT_OWNER exclusive",
    descriptionAr: "مصنع شعارات إنفيرا - مولد الهوية البصرية السيادية - حصري للمالك الجذري"
  },
  "/sovereign-plans": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Sovereign Plans - ROOT_OWNER exclusive",
    descriptionAr: "الخطط السيادية - حصري للمالك الجذري"
  },
  "/sovereign-chat": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Sovereign AI Chat - ROOT_OWNER exclusive",
    descriptionAr: "محادثة الذكاء السيادي - حصري للمالك الجذري"
  },
  "/sovereign/command-center": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Sovereign Command Center - ROOT_OWNER exclusive",
    descriptionAr: "مركز القيادة السيادي - حصري للمالك الجذري"
  },
  "/sovereign/ai-governance": { 
    allowedRoles: ["owner", "sovereign"],
    description: "AI Governance Engine - ROOT_OWNER exclusive",
    descriptionAr: "محرك حوكمة الذكاء الاصطناعي - حصري للمالك الجذري"
  },
  "/sovereign/digital-borders": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Digital Borders - ROOT_OWNER exclusive",
    descriptionAr: "الحدود الرقمية - حصري للمالك الجذري"
  },
  "/sovereign/policy-engine": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Policy Engine - ROOT_OWNER exclusive",
    descriptionAr: "محرك السياسات - حصري للمالك الجذري"
  },
  "/sovereign/trust-compliance": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Trust & Compliance - ROOT_OWNER exclusive",
    descriptionAr: "الثقة والامتثال - حصري للمالك الجذري"
  },
  "/sovereign/strategic-forecast": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Strategic Forecast - ROOT_OWNER exclusive",
    descriptionAr: "التنبؤ الاستراتيجي - حصري للمالك الجذري"
  },
  "/owner/isds": { 
    allowedRoles: ["owner", "sovereign"],
    description: "ISDS - ROOT_OWNER exclusive",
    descriptionAr: "استوديو التطوير السيادي - حصري للمالك الجذري"
  },
  "/owner/spom": { 
    allowedRoles: ["owner", "sovereign"],
    description: "SPOM Operations - ROOT_OWNER exclusive",
    descriptionAr: "عمليات SPOM - حصري للمالك الجذري"
  },
  "/owner/quality": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Quality Dashboard - ROOT_OWNER exclusive",
    descriptionAr: "لوحة الجودة - حصري للمالك الجذري"
  },
  "/owner/sidebar-manager": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Sidebar Manager - ROOT_OWNER exclusive",
    descriptionAr: "مدير الشريط الجانبي - حصري للمالك الجذري"
  },
  "/owner/ai-sovereignty": { 
    allowedRoles: ["owner", "sovereign"],
    description: "AI Sovereignty - ROOT_OWNER exclusive",
    descriptionAr: "سيادة الذكاء الاصطناعي - حصري للمالك الجذري"
  },
  "/owner/infrastructure": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Infrastructure - ROOT_OWNER exclusive",
    descriptionAr: "البنية التحتية - حصري للمالك الجذري"
  },
  "/owner/integrations": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Integration Gateway - ROOT_OWNER exclusive",
    descriptionAr: "بوابة التكامل - حصري للمالك الجذري"
  },
  "/owner/notifications": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Owner Notifications - ROOT_OWNER exclusive",
    descriptionAr: "إشعارات المالك - حصري للمالك الجذري"
  },
  "/owner/policies": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Owner Policies - ROOT_OWNER exclusive",
    descriptionAr: "سياسات المالك - حصري للمالك الجذري"
  },
  "/government-compliance": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Government Compliance - ROOT_OWNER exclusive",
    descriptionAr: "الجاهزية الحكومية - حصري للمالك الجذري"
  },
  "/content-moderation": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Content Moderation - ROOT_OWNER exclusive",
    descriptionAr: "مراقبة المحتوى - حصري للمالك الجذري"
  },
  "/staff-management": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Staff Management - ROOT_OWNER exclusive",
    descriptionAr: "إدارة الموظفين - حصري للمالك الجذري"
  },
  "/domains": { 
    allowedRoles: ["owner", "sovereign"],
    description: "Sovereign Domains - ROOT_OWNER exclusive",
    descriptionAr: "النطاقات السيادية - حصري للمالك الجذري"
  },
};

// Simplified role labels for display
const displayRoles: { role: RoleType; labelEn: string; labelAr: string }[] = [
  { role: "owner", labelEn: "Owner", labelAr: "المالك" },
  { role: "manager", labelEn: "Manager", labelAr: "مدير" },
  { role: "free", labelEn: "Free Subscriber", labelAr: "مشترك مجاني" },
  { role: "pro", labelEn: "Paid Subscriber", labelAr: "مشترك مدفوع" },
  { role: "public", labelEn: "Visitor", labelAr: "زائر" },
];

interface SovereignAccessSummaryProps {
  currentRoute: string;
}

export function SovereignAccessSummary({ currentRoute }: SovereignAccessSummaryProps) {
  const { user } = useAuth();
  const { isEnabled } = useSovereignView();
  const { language } = useLanguage();
  
  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.username === "mohamedalib2001";
  
  if (!isOwner || !isEnabled) return null;
  
  // Find matching page permissions
  const pagePerms = pagePermissionsRegistry[currentRoute] || pagePermissionsRegistry["/"];
  const allowedRoles = pagePerms?.allowedRoles || [];
  
  const t = {
    title: language === "ar" ? "صلاحيات الوصول للصفحة الحالية" : "Current Page Access Permissions",
    allowed: language === "ar" ? "مسموح" : "Allowed",
    blocked: language === "ar" ? "ممنوع" : "Blocked",
    description: language === "ar" ? pagePerms?.descriptionAr : pagePerms?.description,
  };
  
  return (
    <Card className="fixed bottom-20 left-4 z-[9997] w-72 shadow-xl border-violet-500/30 bg-background/95 backdrop-blur-sm">
      <CardHeader className="py-2 px-3 border-b border-violet-500/20">
        <CardTitle className="text-xs font-medium flex items-center gap-2 text-violet-500">
          <Eye className="h-3 w-3" />
          {t.title}
        </CardTitle>
        <p className="text-[10px] text-muted-foreground mt-1">{t.description}</p>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div className="grid gap-1.5">
          {displayRoles.map(({ role, labelEn, labelAr }) => {
            // Map display roles to actual allowed roles
            const isAllowed = (() => {
              if (role === "owner") return allowedRoles.includes("owner") || allowedRoles.includes("sovereign");
              if (role === "manager") return allowedRoles.includes("manager");
              if (role === "free") return allowedRoles.includes("free") || allowedRoles.includes("subscriber");
              if (role === "pro") return allowedRoles.includes("pro") || allowedRoles.includes("enterprise");
              if (role === "public") return allowedRoles.includes("public");
              return false;
            })();
            
            const config = roleConfig[role];
            const Icon = config.icon;
            
            return (
              <div 
                key={role} 
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 rounded-md text-xs",
                  isAllowed 
                    ? "bg-green-500/10 border border-green-500/20" 
                    : "bg-red-500/10 border border-red-500/20 opacity-60"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                  <span className={isAllowed ? "text-foreground" : "text-muted-foreground"}>
                    {language === "ar" ? labelAr : labelEn}
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1.5",
                    isAllowed 
                      ? "border-green-500/50 text-green-600 bg-green-500/10" 
                      : "border-red-500/50 text-red-500 bg-red-500/10"
                  )}
                >
                  {isAllowed ? (
                    <><Unlock className="h-2.5 w-2.5 mr-0.5" />{t.allowed}</>
                  ) : (
                    <><Lock className="h-2.5 w-2.5 mr-0.5" />{t.blocked}</>
                  )}
                </Badge>
              </div>
            );
          })}
        </div>
        
        <div className="pt-1 border-t border-border/50">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Route className="h-3 w-3" />
            <code className="bg-muted px-1 py-0.5 rounded text-[9px]">{currentRoute}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
