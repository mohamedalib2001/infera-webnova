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
  
  if (!isOwner) {
    return <>{children}</>;
  }
  
  return (
    <SovereignViewContext.Provider value={{
      isEnabled,
      toggleView,
      registerElement,
      unregisterElement,
      inspectedElement,
      setInspectedElement,
      getElementPermissions,
    }}>
      {children}
      {isEnabled && <SovereignOverlay />}
      <PermissionInspectorPanel />
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
