import { useLanguage } from "@/hooks/use-language";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  ArrowUp, 
  Code, 
  Sparkles, 
  Server, 
  Users, 
  HardDrive, 
  Wifi,
  Globe,
  Gauge
} from "lucide-react";
import { Link } from "wouter";

interface UsageItemProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  limit: number;
  unlimited: boolean;
  unlimitedLabel: string;
  testId: string;
}

function UsageItem({ icon, label, current, limit, unlimited, unlimitedLabel, testId }: UsageItemProps) {
  const percentage = unlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  return (
    <div className="space-y-2" data-testid={`usage-item-${testId}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {icon}
          <span>{label}</span>
        </div>
        <span className={`text-sm font-medium ${isCritical ? "text-red-500" : isWarning ? "text-amber-500" : ""}`}>
          {unlimited ? (
            <Badge variant="secondary" className="text-xs" data-testid={`badge-unlimited-${testId}`}>{unlimitedLabel}</Badge>
          ) : (
            <span data-testid={`text-usage-${testId}`}>{`${current.toLocaleString()} / ${limit.toLocaleString()}`}</span>
          )}
        </span>
      </div>
      {!unlimited && (
        <Progress 
          value={percentage} 
          className={`h-1.5 ${isCritical ? "[&>div]:bg-red-500" : isWarning ? "[&>div]:bg-amber-500" : ""}`} 
        />
      )}
    </div>
  );
}

export function UsageLimitsCard() {
  const { language } = useLanguage();
  const { 
    userPlan, 
    limits, 
    getAIMode, 
    getAIAutonomyLevel,
    isSandboxMode,
    hasWatermark,
    isLoading 
  } = usePermissions();

  if (isLoading || !userPlan || !limits) {
    return null;
  }

  const tr = {
    title: language === "ar" ? "حدود الاستخدام" : "Usage Limits",
    aiMode: language === "ar" ? "وضع AI" : "AI Mode",
    autonomy: language === "ar" ? "مستوى الاستقلالية" : "Autonomy Level",
    projects: language === "ar" ? "المشاريع" : "Projects",
    aiGenerations: language === "ar" ? "توليدات AI" : "AI Generations",
    deployments: language === "ar" ? "النشر النشط" : "Active Deployments",
    teamMembers: language === "ar" ? "أعضاء الفريق" : "Team Members",
    storage: language === "ar" ? "التخزين" : "Storage",
    bandwidth: language === "ar" ? "عرض النطاق" : "Bandwidth",
    domains: language === "ar" ? "النطاقات المخصصة" : "Custom Domains",
    upgrade: language === "ar" ? "ترقية الخطة" : "Upgrade Plan",
    unlimited: language === "ar" ? "غير محدود" : "Unlimited",
    sandboxWarning: language === "ar" 
      ? "أنت في وضع Sandbox - قم بالترقية للنشر الحقيقي"
      : "You're in Sandbox mode - Upgrade for real deployment",
    watermarkWarning: language === "ar"
      ? "مشاريعك تظهر علامة INFERA المائية"
      : "Your projects show INFERA watermark",
  };

  const aiModeLabels: Record<string, { en: string; ar: string }> = {
    sandbox: { en: "Sandbox", ar: "تجريبي" },
    assistant: { en: "Assistant", ar: "مساعد" },
    copilot: { en: "Copilot", ar: "مساعد ذكي" },
    operator: { en: "Operator", ar: "مشغل" },
    sovereign: { en: "Sovereign", ar: "سيادي" },
  };

  const currentAIMode = getAIMode();
  const autonomyLevel = getAIAutonomyLevel();
  const modeLabel = aiModeLabels[currentAIMode] || aiModeLabels.sandbox;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            {tr.title}
          </CardTitle>
          <Badge variant="outline">{language === "ar" ? userPlan.nameAr : userPlan.name}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sandbox Warning */}
        {isSandboxMode() && (
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{tr.sandboxWarning}</span>
          </div>
        )}

        {/* Watermark Warning */}
        {hasWatermark() && !isSandboxMode() && (
          <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{tr.watermarkWarning}</span>
          </div>
        )}

        {/* AI Mode Display */}
        <div className="space-y-2 pb-3 border-b" data-testid="ai-mode-section">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{tr.aiMode}</span>
            <Badge data-testid="badge-ai-mode">{language === "ar" ? modeLabel.ar : modeLabel.en}</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{tr.autonomy}</span>
              <span data-testid="text-autonomy-level">{autonomyLevel}%</span>
            </div>
            <Progress value={autonomyLevel} className="h-1.5" />
          </div>
        </div>

        {/* Usage Items */}
        <div className="space-y-3" data-testid="usage-items-container">
          <UsageItem
            icon={<Code className="h-4 w-4" />}
            label={tr.projects}
            current={0}
            limit={limits.maxProjects}
            unlimited={limits.maxProjects === -1}
            unlimitedLabel={tr.unlimited}
            testId="projects"
          />
          <UsageItem
            icon={<Sparkles className="h-4 w-4" />}
            label={tr.aiGenerations}
            current={0}
            limit={limits.aiGenerationsPerMonth}
            unlimited={limits.aiGenerationsPerMonth === -1}
            unlimitedLabel={tr.unlimited}
            testId="ai-generations"
          />
          <UsageItem
            icon={<Server className="h-4 w-4" />}
            label={tr.deployments}
            current={0}
            limit={limits.activeDeployments}
            unlimited={limits.activeDeployments === -1}
            unlimitedLabel={tr.unlimited}
            testId="deployments"
          />
          <UsageItem
            icon={<Users className="h-4 w-4" />}
            label={tr.teamMembers}
            current={1}
            limit={limits.teamMembers}
            unlimited={limits.teamMembers === -1}
            unlimitedLabel={tr.unlimited}
            testId="team-members"
          />
          <UsageItem
            icon={<HardDrive className="h-4 w-4" />}
            label={tr.storage}
            current={0}
            limit={limits.storageGB}
            unlimited={limits.storageGB === -1}
            unlimitedLabel={tr.unlimited}
            testId="storage"
          />
          <UsageItem
            icon={<Globe className="h-4 w-4" />}
            label={tr.domains}
            current={0}
            limit={limits.customDomains}
            unlimited={limits.customDomains === -1}
            unlimitedLabel={tr.unlimited}
            testId="domains"
          />
        </div>

        {/* Upgrade Button */}
        {userPlan.role !== "sovereign" && (
          <Button variant="outline" className="w-full mt-4" asChild data-testid="button-upgrade-plan">
            <Link href="/pricing">
              <ArrowUp className="h-4 w-4 me-2" />
              {tr.upgrade}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function UpgradePrompt({ 
  feature, 
  requiredPlan 
}: { 
  feature: string; 
  requiredPlan?: string;
}) {
  const { language } = useLanguage();

  const tr = {
    title: language === "ar" ? "ترقية مطلوبة" : "Upgrade Required",
    message: language === "ar"
      ? `هذه الميزة تتطلب خطة ${requiredPlan || "أعلى"}`
      : `This feature requires ${requiredPlan || "a higher"} plan`,
    upgrade: language === "ar" ? "عرض الخطط" : "View Plans",
  };

  return (
    <Card className="border-amber-500/30 bg-amber-500/5" data-testid="card-upgrade-prompt">
      <CardContent className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h3 className="font-semibold mb-1" data-testid="text-upgrade-title">{tr.title}</h3>
          <p className="text-sm text-muted-foreground" data-testid="text-upgrade-message">{tr.message}</p>
        </div>
        <Button asChild data-testid="button-view-plans">
          <Link href="/pricing">
            <ArrowUp className="h-4 w-4 me-2" />
            {tr.upgrade}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
