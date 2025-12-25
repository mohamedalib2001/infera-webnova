import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History } from "lucide-react";
import type { SovereignActionLog } from "@shared/schema";
import type { DashboardTranslations } from "./dashboard-translations";

interface RecentActivitySectionProps {
  t: DashboardTranslations;
  language: 'ar' | 'en';
  logs: SovereignActionLog[];
}

export function RecentActivitySection({ t, language, logs }: RecentActivitySectionProps) {
  if (logs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          {t.sovereign.recentActivity}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => (
              <div 
                key={log.id} 
                className="flex items-center gap-3 p-2 rounded hover-elevate"
                data-testid={`activity-log-${log.id}`}
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">
                    {language === 'ar' ? log.eventDescriptionAr : log.eventDescription}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.createdAt 
                      ? new Date(log.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') 
                      : '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
