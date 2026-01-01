import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardTranslations } from "./dashboard-translations";
import type { AICostAnalytics } from "@/hooks/owner-dashboard";

interface QuickStatsCardsProps {
  t: DashboardTranslations;
  language: 'ar' | 'en';
  aiCostAnalytics?: AICostAnalytics;
  aiGlobalKillSwitch?: { globalActive: boolean; reason?: string };
  onToggleKillSwitch: () => void;
  killSwitchPending: boolean;
}

export function QuickStatsCards({ 
  t, 
  language, 
  aiCostAnalytics,
  aiGlobalKillSwitch,
  onToggleKillSwitch,
  killSwitchPending,
}: QuickStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card data-testid="card-total-tasks">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'إجمالي المهام' : 'Total Tasks'}
              </p>
              <p className="text-2xl font-bold">{aiCostAnalytics?.totalTasks || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-real-cost">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'التكلفة الفعلية' : 'Real Cost'}
              </p>
              <p className="text-2xl font-bold">
                ${(aiCostAnalytics?.totalRealCost || 0).toFixed(4)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 text-red-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-billed-cost">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'المفوتر للعملاء' : 'Billed to Users'}
              </p>
              <p className="text-2xl font-bold">
                ${(aiCostAnalytics?.totalBilledCost || 0).toFixed(4)}
              </p>
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
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'هامش الربح' : 'Margin'}
              </p>
              <p className="text-2xl font-bold">
                {((aiCostAnalytics?.margin || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={aiGlobalKillSwitch?.globalActive ? 'border-red-500 bg-red-500/5' : ''} 
        data-testid="card-ai-kill-switch"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">AI Kill Switch</p>
              <p className="text-lg font-bold">
                {aiGlobalKillSwitch?.globalActive 
                  ? (language === 'ar' ? 'نشط' : 'ACTIVE') 
                  : (language === 'ar' ? 'غير نشط' : 'Inactive')}
              </p>
            </div>
            <Button
              size="sm"
              variant={aiGlobalKillSwitch?.globalActive ? 'outline' : 'destructive'}
              onClick={onToggleKillSwitch}
              disabled={killSwitchPending}
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
  );
}
