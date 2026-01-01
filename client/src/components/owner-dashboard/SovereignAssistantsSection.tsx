import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Crown, 
  Bot, 
  Shield, 
  Zap, 
  TrendingUp, 
  Server,
  RefreshCw,
  Plus,
  Send,
  AlertCircle 
} from "lucide-react";
import type { SovereignAssistant } from "@shared/schema";
import type { DashboardTranslations } from "./dashboard-translations";

const sovereignAssistantIcons: Record<string, any> = {
  ai_governor: Bot,
  platform_architect: Server,
  operations_commander: Zap,
  security_guardian: Shield,
  growth_strategist: TrendingUp,
};

const sovereignAssistantColors: Record<string, string> = {
  ai_governor: "bg-purple-500/10 text-purple-600",
  platform_architect: "bg-blue-500/10 text-blue-600",
  operations_commander: "bg-orange-500/10 text-orange-600",
  security_guardian: "bg-red-500/10 text-red-600",
  growth_strategist: "bg-green-500/10 text-green-600",
};

interface SovereignAssistantsSectionProps {
  t: DashboardTranslations;
  language: 'ar' | 'en';
  sovereignAssistants: SovereignAssistant[];
  isLoading: boolean;
  onInitialize: () => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onToggleAutonomy: (id: string, isAutonomous: boolean) => void;
  onIssueCommand: (assistant: SovereignAssistant) => void;
  onKillSwitch: (assistantId: string) => void;
  initializePending: boolean;
  killSwitchPending: boolean;
}

export function SovereignAssistantsSection({
  t,
  language,
  sovereignAssistants,
  isLoading,
  onInitialize,
  onToggleActive,
  onToggleAutonomy,
  onIssueCommand,
  onKillSwitch,
  initializePending,
  killSwitchPending,
}: SovereignAssistantsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              {t.sovereign.title}
            </CardTitle>
            <CardDescription>{t.sovereign.subtitle}</CardDescription>
          </div>
          {sovereignAssistants.length === 0 && (
            <Button 
              onClick={onInitialize}
              disabled={initializePending}
              data-testid="button-initialize-sovereign"
            >
              {initializePending ? (
                <RefreshCw className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <Plus className="w-4 h-4 ml-2" />
              )}
              {t.sovereign.initialize}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
          </div>
        ) : sovereignAssistants.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Crown className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{t.sovereign.noAssistants}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sovereignAssistants.map((assistant) => {
              const AssistantIcon = sovereignAssistantIcons[assistant.type] || Crown;
              const colorClass = sovereignAssistantColors[assistant.type] || "bg-gray-500/10 text-gray-600";
              return (
                <Card key={assistant.id} className={`hover-elevate border ${colorClass.split(' ')[2] || 'border-border'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${colorClass}`}>
                        <AssistantIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {language === 'ar' ? assistant.nameAr : assistant.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {language === 'ar' ? assistant.descriptionAr : assistant.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className={assistant.isActive ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"}>
                        {assistant.isActive ? t.sovereign.active : t.sovereign.inactive}
                      </Badge>
                      <Switch
                        checked={assistant.isActive}
                        onCheckedChange={(checked) => onToggleActive(assistant.id, checked)}
                        data-testid={`switch-sovereign-active-${assistant.id}`}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-muted-foreground">{t.sovereign.autonomy}:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={assistant.isAutonomous ? "bg-amber-500/10 text-amber-600" : ""}>
                          {assistant.isAutonomous ? t.sovereign.autonomousMode : t.sovereign.manualMode}
                        </Badge>
                        <Switch
                          checked={assistant.isAutonomous}
                          onCheckedChange={(checked) => onToggleAutonomy(assistant.id, checked)}
                          data-testid={`switch-sovereign-autonomy-${assistant.id}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">{language === 'ar' ? 'النموذج' : 'Model'}:</span>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {assistant.model?.split('-').slice(0, 2).join('-') || 'claude-sonnet'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">{language === 'ar' ? 'المهام المنجزة' : 'Tasks Completed'}:</span>
                      <span className="font-bold">{assistant.totalTasksCompleted || 0}</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-sm font-medium">{t.sovereign.capabilities}:</p>
                      <div className="flex flex-wrap gap-1">
                        {((language === 'ar' ? assistant.capabilitiesAr : assistant.capabilities) || []).slice(0, 3).map((cap, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                        {(assistant.capabilities?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">+{(assistant.capabilities?.length || 0) - 3}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onIssueCommand(assistant)}
                      data-testid={`button-command-${assistant.id}`}
                    >
                      <Send className="w-4 h-4 ml-2" />
                      {t.sovereign.issueCommand}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onKillSwitch(assistant.id)}
                      disabled={killSwitchPending}
                      data-testid={`button-kill-${assistant.id}`}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
