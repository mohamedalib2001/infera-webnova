import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, FileCode, 
  RefreshCw, ChevronDown, ChevronRight, AlertCircle
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface FileViolation {
  path: string;
  type: "page" | "component" | "hook" | "service" | "util";
  lines: number;
  limit: number;
  status: "compliant" | "warning" | "violation";
}

const LIMITS = {
  page: 400, component: 300, hook: 200, service: 250, util: 150
};

export function GovernanceComplianceChecker() {
  const [expanded, setExpanded] = useState<string[]>([]);

  const { data: violations, isLoading, refetch } = useQuery<FileViolation[]>({
    queryKey: ["/api/governance/compliance-check"],
    refetchOnWindowFocus: false,
  });

  const stats = violations?.reduce((acc, v) => {
    if (v.status === "violation") acc.violations++;
    else if (v.status === "warning") acc.warnings++;
    else acc.compliant++;
    return acc;
  }, { violations: 0, warnings: 0, compliant: 0 }) || { violations: 0, warnings: 0, compliant: 0 };

  const total = (violations?.length || 0);
  const compliancePercent = total > 0 ? Math.round((stats.compliant / total) * 100) : 100;

  const grouped = violations?.reduce((acc, v) => {
    if (!acc[v.type]) acc[v.type] = [];
    acc[v.type].push(v);
    return acc;
  }, {} as Record<string, FileViolation[]>) || {};

  const toggleGroup = (type: string) => {
    setExpanded(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "violation": return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "violation": return <Badge variant="destructive">Violation</Badge>;
      case "warning": return <Badge className="bg-amber-500">Warning</Badge>;
      default: return <Badge variant="default">Compliant</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Governance Compliance Scanner</CardTitle>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1">
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            Scan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Progress value={compliancePercent} className="flex-1" />
          <span className="text-sm font-medium whitespace-nowrap">{compliancePercent}%</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <div className="font-medium">{stats.compliant}</div>
            <div className="text-muted-foreground">Compliant</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-amber-500" />
            <div className="font-medium">{stats.warnings}</div>
            <div className="text-muted-foreground">Warnings</div>
          </div>
          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <XCircle className="h-4 w-4 mx-auto mb-1 text-destructive" />
            <div className="font-medium">{stats.violations}</div>
            <div className="text-muted-foreground">Violations</div>
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {Object.entries(grouped).map(([type, files]) => (
              <Collapsible 
                key={type} 
                open={expanded.includes(type)}
                onOpenChange={() => toggleGroup(type)}
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted/50">
                  {expanded.includes(type) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                  <FileCode className="h-4 w-4" />
                  <span className="font-medium capitalize">{type}s</span>
                  <Badge variant="outline" size="sm">{files.length}</Badge>
                  <div className="flex-1" />
                  {files.some(f => f.status === "violation") && 
                    <XCircle className="h-4 w-4 text-destructive" />
                  }
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-6 space-y-1 mt-1">
                    {files.map((file) => (
                      <div 
                        key={file.path}
                        className="flex items-center gap-2 p-2 text-sm rounded-lg bg-muted/30"
                      >
                        {getStatusIcon(file.status)}
                        <span className="flex-1 truncate font-mono text-xs">{file.path}</span>
                        <span className="text-xs text-muted-foreground">
                          {file.lines}/{file.limit}
                        </span>
                        {getStatusBadge(file.status)}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>

        {stats.violations > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
            <div className="flex items-center gap-2 text-destructive font-medium">
              <AlertTriangle className="h-4 w-4" />
              {stats.violations} files exceed limits - deployment blocked
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
