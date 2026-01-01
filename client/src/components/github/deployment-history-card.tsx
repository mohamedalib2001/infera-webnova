import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Check, X, Clock, Loader2, FileCode } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { formatDistanceToNow } from "date-fns";

interface Operation {
  id: string;
  type: "sync" | "deploy";
  source: string | null;
  target: string;
  branch: string | null;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  error: string | null;
  details: string | null;
}

export function DeploymentHistoryCard() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const { data: operationsData, isLoading } = useQuery<{ success: boolean; operations: Operation[] }>({
    queryKey: ["/api/github/operations-history"],
    refetchInterval: 10000,
  });

  const operations = operationsData?.operations || [];
  const deployOperations = operations.filter(op => op.type === "deploy");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center"><Check className="h-4 w-4 text-green-600" /></div>;
      case "failed":
        return <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center"><X className="h-4 w-4 text-red-600" /></div>;
      case "in_progress":
        return <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center"><Loader2 className="h-4 w-4 text-blue-600 animate-spin" /></div>;
      default:
        return <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center"><Clock className="h-4 w-4 text-yellow-600" /></div>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default" className="text-xs">{isRtl ? "ناجح" : "Success"}</Badge>;
      case "failed":
        return <Badge variant="destructive" className="text-xs">{isRtl ? "فاشل" : "Failed"}</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="text-xs">{isRtl ? "جاري" : "In Progress"}</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{isRtl ? "معلق" : "Pending"}</Badge>;
    }
  };

  if (deployOperations.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          {isRtl ? "سجل النشر" : "Deployment History"}
        </CardTitle>
        <CardDescription>
          {isRtl ? "عمليات النشر الأخيرة" : "Recent deployment operations"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-[300px] overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            deployOperations.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/50" data-testid={`deployment-entry-${entry.id}`}>
                <div className="mt-0.5">{getStatusIcon(entry.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{entry.source || "Project"}</span>
                    {getStatusBadge(entry.status)}
                    <Badge variant="outline" className="text-xs">
                      <FileCode className="h-3 w-3 mr-1" />
                      {entry.details || "Files"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {isRtl ? "إلى" : "To"}: {entry.target}
                    {entry.branch && ` • ${entry.branch}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {entry.startedAt && <span>{formatDistanceToNow(new Date(entry.startedAt), { addSuffix: true })}</span>}
                    {entry.durationMs && (
                      <>
                        <span>•</span>
                        <span>{(entry.durationMs / 1000).toFixed(1)}s</span>
                      </>
                    )}
                  </div>
                  {entry.error && (
                    <p className="text-xs text-destructive mt-1">{entry.error}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}