import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DashboardTranslations } from "./dashboard-translations";
import type { PlatformState } from "@/hooks/owner-dashboard";

interface DashboardHeaderProps {
  t: DashboardTranslations;
  language: 'ar' | 'en';
  platformState?: PlatformState;
}

export function DashboardHeader({ t, language, platformState }: DashboardHeaderProps) {
  const getHealthStatusColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 text-green-600';
      case 'degraded': return 'bg-yellow-500/10 text-yellow-600';
      case 'critical': return 'bg-orange-500/10 text-orange-600';
      case 'emergency': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getHealthStatusLabel = (status?: string) => {
    if (!status) return language === 'ar' ? 'جاري التحميل...' : 'Loading...';
    return t.sovereign.healthStatus[status as keyof typeof t.sovereign.healthStatus] || status;
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <Crown className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
            {t.title}
          </h1>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            {t.subtitle}
          </p>
        </div>
      </div>
      
      {platformState && (
        <div className="flex items-center gap-3">
          <Badge 
            className={getHealthStatusColor(platformState.status)}
            data-testid="badge-platform-health"
          >
            {getHealthStatusLabel(platformState.status)}
          </Badge>
          <div className="text-sm text-muted-foreground" data-testid="text-health-score">
            {t.sovereign.healthScore}: {platformState.healthScore}%
          </div>
        </div>
      )}
    </div>
  );
}
