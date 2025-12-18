import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Server, 
  Database, 
  Shield, 
  Check, 
  Loader2, 
  ChevronDown,
  Code2,
  FileCode,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

interface InfrastructureStatus {
  success: boolean;
  infrastructure: {
    backend: {
      id: string;
      projectId: string;
      framework: string;
      language: string;
      status: string;
      generatedCode?: {
        files: Array<{
          path: string;
          content: string;
          language: string;
        }>;
      };
    } | null;
    database: {
      id: string;
      projectId: string;
      dbType: string;
      orm: string;
      status: string;
      schema?: Record<string, unknown>;
      generatedSchema?: {
        schemaCode: string;
      };
    } | null;
    authConfig: {
      id: string;
      projectId: string;
      authType: string;
      status: string;
    } | null;
    provisioningStatus: string;
    provisioningProgress: number;
    provisioningSteps: string[];
    isReady: boolean;
  };
}

interface InfrastructureProgressProps {
  projectId: string;
  language?: "ar" | "en";
  onViewCode?: () => void;
}

export function InfrastructureProgress({ 
  projectId, 
  language = "ar",
  onViewCode,
}: InfrastructureProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading } = useQuery<InfrastructureStatus>({
    queryKey: ["/api/projects", projectId, "infrastructure"],
    enabled: !!projectId,
    refetchInterval: (query) => {
      const queryData = query.state.data;
      if (queryData?.infrastructure?.isReady) return false;
      return 3000;
    },
  });

  const t = {
    ar: {
      title: "البنية التحتية المولدة",
      backend: "الخادم (Backend)",
      database: "قاعدة البيانات",
      auth: "نظام المصادقة",
      ready: "جاهز",
      generating: "جاري التوليد",
      pending: "في الانتظار",
      failed: "فشل",
      viewCode: "عرض الكود",
      progress: "التقدم",
      noInfrastructure: "لا توجد بنية تحتية بعد",
      provisioningStarted: "بدأ التوليد التلقائي...",
      allReady: "البنية التحتية جاهزة للاستخدام",
    },
    en: {
      title: "Generated Infrastructure",
      backend: "Backend Server",
      database: "Database",
      auth: "Authentication System",
      ready: "Ready",
      generating: "Generating",
      pending: "Pending",
      failed: "Failed",
      viewCode: "View Code",
      progress: "Progress",
      noInfrastructure: "No infrastructure yet",
      provisioningStarted: "Auto-provisioning started...",
      allReady: "Infrastructure ready to use",
    },
  };

  const txt = t[language];

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "ready":
        return <Badge variant="default" className="bg-green-500"><Check className="w-3 h-3 mr-1" /> {txt.ready}</Badge>;
      case "generating":
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> {txt.generating}</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> {txt.failed}</Badge>;
      default:
        return <Badge variant="outline">{txt.pending}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-4 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">{txt.provisioningStarted}</span>
        </CardContent>
      </Card>
    );
  }

  if (!data?.infrastructure) {
    return null;
  }

  const { infrastructure } = data;
  const showProgress = infrastructure.provisioningStatus === "running" || 
                      infrastructure.provisioningStatus === "queued";

  return (
    <Card className={infrastructure.isReady ? "border-green-500/30 bg-green-50/5" : ""}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="py-3 cursor-pointer hover-elevate">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-medium">{txt.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {infrastructure.isReady && (
                  <Badge variant="default" className="bg-green-500 text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    {txt.allReady}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 space-y-4">
            {showProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{txt.progress}</span>
                  <span>{infrastructure.provisioningProgress}%</span>
                </div>
                <Progress value={infrastructure.provisioningProgress} className="h-2" />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{txt.backend}</span>
                  {infrastructure.backend && (
                    <Badge variant="outline" className="text-xs">
                      {infrastructure.backend.framework}
                    </Badge>
                  )}
                </div>
                {getStatusBadge(infrastructure.backend?.status)}
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{txt.database}</span>
                  {infrastructure.database && (
                    <Badge variant="outline" className="text-xs">
                      {infrastructure.database.dbType} + {infrastructure.database.orm}
                    </Badge>
                  )}
                </div>
                {getStatusBadge(infrastructure.database?.status)}
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">{txt.auth}</span>
                  {infrastructure.authConfig && (
                    <Badge variant="outline" className="text-xs">
                      {infrastructure.authConfig.authType}
                    </Badge>
                  )}
                </div>
                {getStatusBadge(infrastructure.authConfig?.status)}
              </div>
            </div>

            {infrastructure.isReady && onViewCode && (
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={onViewCode}
                data-testid="button-view-generated-code"
              >
                <FileCode className="w-4 h-4" />
                {txt.viewCode}
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
