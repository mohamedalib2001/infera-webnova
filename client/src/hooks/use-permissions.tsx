import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import type { SubscriptionPlan, PlanCapabilities, PlanLimits, PlanRestrictions } from "@shared/schema";

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  reasonAr?: string;
  requiredPlan?: string;
}

export interface UsageResult {
  current: number;
  limit: number;
  unlimited: boolean;
  percentUsed: number;
  remaining: number;
}

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  const { data: plans } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/plans"],
    enabled: isAuthenticated,
  });

  const userPlan = plans?.find(p => p.role === (user?.role || "free"));
  const capabilities = userPlan?.capabilities as PlanCapabilities | undefined;
  const limits = userPlan?.limits as PlanLimits | undefined;
  const restrictions = userPlan?.restrictions as PlanRestrictions | undefined;

  const getUpgradePlanFor = (capability: keyof PlanCapabilities): string | undefined => {
    if (!plans) return undefined;
    const sortedPlans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);
    for (const plan of sortedPlans) {
      const planCaps = plan.capabilities as PlanCapabilities | undefined;
      if (planCaps && planCaps[capability]) {
        return plan.name;
      }
    }
    return undefined;
  };

  const checkCapability = (capability: keyof PlanCapabilities): PermissionResult => {
    if (!capabilities) {
      return {
        allowed: false,
        reason: "No plan detected",
        reasonAr: "لا توجد خطة محددة",
      };
    }

    const value = capabilities[capability];
    if (typeof value === "boolean") {
      if (!value) {
        const requiredPlan = getUpgradePlanFor(capability);
        return {
          allowed: false,
          reason: `Upgrade to ${requiredPlan || "a higher plan"} to access this feature`,
          reasonAr: `قم بالترقية إلى ${requiredPlan || "خطة أعلى"} للوصول إلى هذه الميزة`,
          requiredPlan,
        };
      }
    }

    return { allowed: true };
  };

  const checkAIMode = (requiredMode: string): PermissionResult => {
    if (!capabilities) {
      return { allowed: false, reason: "No plan detected", reasonAr: "لا توجد خطة محددة" };
    }

    const modeHierarchy = ["sandbox", "assistant", "copilot", "operator", "sovereign"];
    const userModeIndex = modeHierarchy.indexOf(capabilities.aiMode);
    const requiredModeIndex = modeHierarchy.indexOf(requiredMode);

    if (userModeIndex < requiredModeIndex) {
      return {
        allowed: false,
        reason: `This feature requires ${requiredMode} mode or higher`,
        reasonAr: `تتطلب هذه الميزة وضع ${requiredMode} أو أعلى`,
        requiredPlan: plans?.find(p => {
          const caps = p.capabilities as PlanCapabilities | undefined;
          return caps && modeHierarchy.indexOf(caps.aiMode) >= requiredModeIndex;
        })?.name,
      };
    }

    return { allowed: true };
  };

  const getLimit = (limitKey: keyof PlanLimits): UsageResult => {
    const limit = limits?.[limitKey] ?? 0;
    const unlimited = limit === -1;

    return {
      current: 0,
      limit: unlimited ? Infinity : limit,
      unlimited,
      percentUsed: 0,
      remaining: unlimited ? Infinity : limit,
    };
  };

  const hasRestriction = (restriction: keyof PlanRestrictions): boolean => {
    return restrictions?.[restriction] ?? false;
  };

  const canDeploy = (): PermissionResult => {
    if (restrictions?.noRealDeployment) {
      return {
        allowed: false,
        reason: "Your plan does not include real deployment. Upgrade to deploy your projects.",
        reasonAr: "خطتك لا تشمل النشر الحقيقي. قم بالترقية لنشر مشاريعك.",
        requiredPlan: "Basic",
      };
    }
    return { allowed: true };
  };

  const canAccessFeature = (feature: string): PermissionResult => {
    const featureMap: Record<string, keyof PlanCapabilities> = {
      "smart-suggestions": "smartSuggestions",
      "ai-copilot": "aiCopilot",
      "ai-operator": "aiOperator",
      "ai-governance": "aiGovernance",
      "backend-generator": "backendGenerator",
      "frontend-generator": "frontendGenerator",
      "fullstack-generator": "fullStackGenerator",
      "chatbot-builder": "chatbotBuilder",
      "version-control": "versionControl",
      "cicd": "cicdIntegration",
      "api-gateway": "apiGateway",
      "white-label": "whiteLabel",
      "multi-tenant": "multiTenant",
      "compliance": "complianceModes",
      "audit-logs": "auditLogs",
      "sovereign-dashboard": "sovereignDashboard",
      "data-residency": "dataResidencyControl",
      "policy-enforcement": "policyEnforcement",
      "kill-switch": "emergencyKillSwitch",
    };

    const capabilityKey = featureMap[feature];
    if (!capabilityKey) {
      return { allowed: true };
    }

    return checkCapability(capabilityKey);
  };

  const isSandboxMode = (): boolean => {
    return restrictions?.sandboxMode ?? false;
  };

  const hasWatermark = (): boolean => {
    return restrictions?.watermark ?? false;
  };

  const getAIAutonomyLevel = (): number => {
    return capabilities?.aiAutonomy ?? 0;
  };

  const getAIMode = (): string => {
    return capabilities?.aiMode ?? "sandbox";
  };

  return {
    userPlan,
    capabilities,
    limits,
    restrictions,
    checkCapability,
    checkAIMode,
    getLimit,
    hasRestriction,
    canDeploy,
    canAccessFeature,
    isSandboxMode,
    hasWatermark,
    getAIAutonomyLevel,
    getAIMode,
    isLoading: !plans,
  };
}

export function PermissionGate({
  capability,
  feature,
  aiMode,
  children,
  fallback,
}: {
  capability?: keyof PlanCapabilities;
  feature?: string;
  aiMode?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { checkCapability, canAccessFeature, checkAIMode } = usePermissions();

  let result: PermissionResult = { allowed: true };

  if (capability) {
    result = checkCapability(capability);
  } else if (feature) {
    result = canAccessFeature(feature);
  } else if (aiMode) {
    result = checkAIMode(aiMode);
  }

  if (!result.allowed) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
