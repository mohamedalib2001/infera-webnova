/**
 * INFERA WebNova - Workspace Context System
 * Provides workspace state management and route protection
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { useLocation, Redirect } from "wouter";
import {
  buildSidebar,
  hasCapability as checkCapabilityUtil,
  WORKSPACES_REGISTRY,
  PLANS_REGISTRY,
  ROLES_REGISTRY,
  MENU_REGISTRY,
  type UserContext,
  type WorkspaceConfig,
  type CapabilityId,
  type BuildSidebarResult,
} from "@/lib/sovereign-registry";

// ==================== CONTEXT TYPES ====================

interface WorkspaceContextValue {
  user: UserContext | null;
  sidebarData: BuildSidebarResult | null;
  activeWorkspace: WorkspaceConfig | null;
  setActiveWorkspace: (workspaceId: string) => void;
  isRtl: boolean;
  setIsRtl: (rtl: boolean) => void;
  hasCapability: (capability: CapabilityId) => boolean;
  getRouteCapability: (route: string) => CapabilityId | null;
  canAccessRoute: (route: string) => boolean;
  switchToWorkspace: (workspaceId: string) => void;
  updateUser: (user: UserContext) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// ==================== HELPER: Build user context from auth user ====================

export function buildUserContextFromAuth(authUser: any): UserContext {
  if (!authUser) {
    return {
      id: "guest",
      role: "free",
      planId: "free",
      capabilities: [],
      isOwner: false,
    };
  }

  const role = authUser.role || "free";
  const isOwner = role === "owner";
  
  const planId = isOwner ? "sovereign" : 
    role === "sovereign" ? "sovereign" :
    role === "enterprise" ? "enterprise" :
    role === "pro" ? "pro" :
    role === "basic" ? "basic" : "free";
  
  const planConfig = PLANS_REGISTRY[planId];
  const capabilities = planConfig?.capabilities || [];
  
  const userPermissions = (authUser.permissions || []) as CapabilityId[];

  return {
    id: authUser.id,
    role,
    planId,
    capabilities: [...capabilities, ...userPermissions],
    isOwner,
  };
}

// ==================== PROVIDER ====================

interface WorkspaceProviderProps {
  children: ReactNode;
  authUser?: any;
  initialRtl?: boolean;
}

export function WorkspaceProvider({ 
  children, 
  authUser,
  initialRtl = false 
}: WorkspaceProviderProps) {
  const [user, setUser] = useState<UserContext | null>(() => 
    authUser ? buildUserContextFromAuth(authUser) : null
  );
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [isRtl, setIsRtl] = useState(initialRtl);

  useEffect(() => {
    if (authUser) {
      setUser(buildUserContextFromAuth(authUser));
    } else {
      setUser(null);
    }
  }, [authUser]);

  const sidebarData = useMemo(() => {
    if (!user) return null;
    return buildSidebar(user);
  }, [user]);

  const activeWorkspace = useMemo(() => {
    if (!sidebarData) return null;
    if (activeWorkspaceId) {
      return sidebarData.availableWorkspaces.find(w => w.id === activeWorkspaceId) || sidebarData.activeWorkspace;
    }
    return sidebarData.activeWorkspace;
  }, [activeWorkspaceId, sidebarData]);

  const setActiveWorkspace = useCallback((workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
  }, []);

  const checkCapability = useCallback((capability: CapabilityId): boolean => {
    if (!user) return false;
    return checkCapabilityUtil(user, capability);
  }, [user]);

  const getRouteCapability = useCallback((route: string): CapabilityId | null => {
    const menuItem = MENU_REGISTRY.find(m => 
      route === m.route || route.startsWith(m.route + "/")
    );
    return menuItem?.capability || null;
  }, []);

  const canAccessRoute = useCallback((route: string): boolean => {
    if (!user) return false;
    if (user.isOwner) return true;
    
    const capability = getRouteCapability(route);
    if (!capability) return true;
    
    return checkCapability(capability);
  }, [user, getRouteCapability, checkCapability]);

  const switchToWorkspace = useCallback((workspaceId: string) => {
    const workspace = WORKSPACES_REGISTRY.find(w => w.id === workspaceId);
    if (workspace) {
      setActiveWorkspaceId(workspaceId);
    }
  }, []);

  const updateUser = useCallback((newUser: UserContext) => {
    setUser(newUser);
  }, []);

  const value: WorkspaceContextValue = {
    user,
    sidebarData,
    activeWorkspace,
    setActiveWorkspace,
    isRtl,
    setIsRtl,
    hasCapability: checkCapability,
    getRouteCapability,
    canAccessRoute,
    switchToWorkspace,
    updateUser,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// ==================== HOOKS ====================

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

export function useActiveWorkspace() {
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();
  return { activeWorkspace, setActiveWorkspace };
}

export function useCapabilityCheck() {
  const { hasCapability: check } = useWorkspace();
  return check;
}

// ==================== ROUTE GUARD COMPONENTS ====================

interface RequireCapabilityProps {
  capability: CapabilityId;
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RequireCapability({ 
  capability, 
  children, 
  fallback,
  redirectTo = "/upgrade" 
}: RequireCapabilityProps) {
  const { hasCapability: check, user } = useWorkspace();
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  if (!check(capability)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Redirect to={redirectTo} />;
  }
  
  return <>{children}</>;
}

interface RequireOwnerProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireOwner({ children, fallback }: RequireOwnerProps) {
  const { user } = useWorkspace();
  
  if (!user?.isOwner) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Redirect to="/" />;
  }
  
  return <>{children}</>;
}

interface RequirePlanProps {
  minPlan: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePlan({ minPlan, children, fallback }: RequirePlanProps) {
  const { user } = useWorkspace();
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  const userPlanConfig = PLANS_REGISTRY[user.planId];
  const requiredPlanConfig = PLANS_REGISTRY[minPlan];
  
  if (!userPlanConfig || !requiredPlanConfig) {
    return <Redirect to="/upgrade" />;
  }
  
  if (userPlanConfig.level < requiredPlanConfig.level && !user.isOwner) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Redirect to="/upgrade" />;
  }
  
  return <>{children}</>;
}

// ==================== PROTECTED ROUTE WRAPPER ====================

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [location] = useLocation();
  const { canAccessRoute, user } = useWorkspace();
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  if (!canAccessRoute(location)) {
    return <Redirect to="/upgrade" />;
  }
  
  return <>{children}</>;
}

// ==================== ACCESS DENIED COMPONENT ====================

interface AccessDeniedProps {
  capability?: CapabilityId;
  requiredPlan?: string;
  isRtl?: boolean;
}

export function AccessDenied({ capability, requiredPlan, isRtl = false }: AccessDeniedProps) {
  const planConfig = requiredPlan ? PLANS_REGISTRY[requiredPlan] : null;
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4 p-8 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-red-400">
          {isRtl ? "الوصول مرفوض" : "Access Denied"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isRtl 
            ? "ليس لديك الصلاحية للوصول لهذه الميزة" 
            : "You don't have permission to access this feature"}
        </p>
        {planConfig && (
          <p className="text-xs text-muted-foreground">
            {isRtl 
              ? `مطلوب باقة ${planConfig.nameAr} أو أعلى`
              : `Requires ${planConfig.name} plan or higher`}
          </p>
        )}
        <a 
          href="/upgrade" 
          className="inline-flex items-center justify-center px-6 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-colors"
        >
          {isRtl ? "ترقية الباقة" : "Upgrade Plan"}
        </a>
      </div>
    </div>
  );
}
