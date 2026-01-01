import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield } from "lucide-react";
import type { DashboardTranslations } from "./dashboard-translations";
import type { EmergencyControl } from "@/hooks/owner-dashboard";

interface EmergencyControlsSectionProps {
  t: DashboardTranslations;
  language: 'ar' | 'en';
  emergencyControls: EmergencyControl[];
  onActivateEmergency: () => void;
  onDeactivateEmergency: (id: string) => void;
  activatePending: boolean;
  deactivatePending: boolean;
}

export function EmergencyControlsSection({
  t,
  language,
  emergencyControls,
  onActivateEmergency,
  onDeactivateEmergency,
  activatePending,
  deactivatePending,
}: EmergencyControlsSectionProps) {
  const activeControls = emergencyControls.filter((c) => c.isActive);

  return (
    <Card className="border-red-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              {t.sovereign.emergencyControls}
            </CardTitle>
            <CardDescription>{t.sovereign.emergencyDescription}</CardDescription>
          </div>
          <Button 
            variant="destructive"
            onClick={onActivateEmergency}
            disabled={activatePending}
            data-testid="button-activate-emergency"
          >
            <AlertCircle className="w-4 h-4 ml-2" />
            {t.sovereign.activateEmergency}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeControls.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{t.sovereign.noActiveEmergency}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeControls.map((control) => (
              <div 
                key={control.id} 
                className="flex items-center justify-between gap-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-600">
                      {(t.sovereign.emergencyTypes as Record<string, string>)?.[control.type] || control.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? control.reasonAr || control.reason : control.reason}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => onDeactivateEmergency(control.id)}
                  disabled={deactivatePending}
                  data-testid={`button-deactivate-emergency-${control.id}`}
                >
                  {t.sovereign.deactivateEmergency}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
