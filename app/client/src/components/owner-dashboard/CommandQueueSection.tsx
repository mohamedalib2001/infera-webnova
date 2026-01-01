import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, CheckCircle, AlertCircle, History } from "lucide-react";
import type { SovereignCommand } from "@shared/schema";
import type { DashboardTranslations } from "./dashboard-translations";

interface CommandQueueSectionProps {
  t: DashboardTranslations;
  language: 'ar' | 'en';
  commands: SovereignCommand[];
  onApprove: (id: string) => void;
  onCancel: (id: string) => void;
  onRollback: (id: string) => void;
}

export function CommandQueueSection({ 
  t, 
  language, 
  commands,
  onApprove,
  onCancel,
  onRollback,
}: CommandQueueSectionProps) {
  if (commands.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "bg-green-500/10 text-green-600";
      case 'executing': return "bg-blue-500/10 text-blue-600";
      case 'failed': return "bg-red-500/10 text-red-600";
      case 'cancelled': return "bg-gray-500/10 text-gray-600";
      case 'rolled_back': return "bg-orange-500/10 text-orange-600";
      default: return "bg-yellow-500/10 text-yellow-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          {t.sovereign.commandQueue}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {commands.map((command) => (
              <Card key={command.id} className="hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(command.status)}>
                          {t.sovereign.commandStatus[command.status as keyof typeof t.sovereign.commandStatus] || command.status}
                        </Badge>
                        <Badge variant="outline">{command.priority}</Badge>
                      </div>
                      <h4 className="font-medium">{command.directive}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {command.createdAt 
                          ? new Date(command.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US') 
                          : '-'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {command.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onApprove(command.id)}
                            data-testid={`button-approve-${command.id}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCancel(command.id)}
                            data-testid={`button-cancel-${command.id}`}
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {(command.status === 'completed' || command.status === 'executing') && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onRollback(command.id)}
                          data-testid={`button-rollback-${command.id}`}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
