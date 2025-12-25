import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Database, Code2, Server, Globe, Cpu, CheckCircle, XCircle } from "lucide-react";
import type { SystemMapSummary } from "../utils/ide-types";

interface SystemMapPanelProps {
  isRtl: boolean;
}

export function SystemMapPanel({ isRtl }: SystemMapPanelProps) {
  const { data: systemMap, isLoading } = useQuery<SystemMapSummary>({
    queryKey: ["/api/sovereign-core/system-map"],
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!systemMap || !systemMap.success) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>{isRtl ? "فشل تحميل خريطة النظام" : "Failed to load system map"}</p>
      </div>
    );
  }

  const sections = [
    {
      key: "database",
      icon: Database,
      label: isRtl ? "قاعدة البيانات" : "Database",
      color: "text-blue-400",
      data: systemMap.sections.database,
    },
    {
      key: "components",
      icon: Code2,
      label: isRtl ? "المكونات" : "Components",
      color: "text-emerald-400",
      data: systemMap.sections.components,
    },
    {
      key: "apiRoutes",
      icon: Server,
      label: isRtl ? "مسارات API" : "API Routes",
      color: "text-amber-400",
      data: systemMap.sections.apiRoutes,
    },
    {
      key: "infrastructure",
      icon: Globe,
      label: isRtl ? "البنية التحتية" : "Infrastructure",
      color: "text-rose-400",
      data: systemMap.sections.infrastructure,
    },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <Card className="bg-gradient-to-br from-slate-900/80 to-violet-950/20 border-violet-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              {isRtl ? "ملخص النظام" : "System Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label={isRtl ? "الجداول" : "Tables"}
                value={systemMap.stats.totalTables}
                color="text-blue-400"
              />
              <StatCard
                label={isRtl ? "المكونات" : "Components"}
                value={systemMap.stats.totalComponents}
                color="text-emerald-400"
              />
              <StatCard
                label={isRtl ? "المسارات" : "Routes"}
                value={systemMap.stats.totalRoutes}
                color="text-amber-400"
              />
              <StatCard
                label={isRtl ? "الخدمات" : "Services"}
                value={systemMap.stats.totalServices}
                color="text-rose-400"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>v{systemMap.version}</span>
              <span>{new Date(systemMap.lastUpdated).toLocaleString(isRtl ? "ar-SA" : "en-US")}</span>
            </div>
          </CardContent>
        </Card>

        {sections.map((section) => (
          <SectionCard key={section.key} section={section} isRtl={isRtl} />
        ))}

        <Card className="bg-gradient-to-br from-slate-900/80 to-indigo-950/20 border-indigo-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              {isRtl ? "العلاقات" : "Relationships"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemMap.sections.relationships?.map((rel: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-[10px]">{rel.from}</Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline" className="text-[10px]">{rel.to}</Badge>
                </div>
              )) || (
                <p className="text-xs text-muted-foreground">
                  {isRtl ? "لا توجد علاقات محددة" : "No relationships defined"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-700/50">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function SectionCard({ section, isRtl }: { section: any; isRtl: boolean }) {
  const Icon = section.icon;
  const items = Array.isArray(section.data) ? section.data : [];

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className={`w-4 h-4 ${section.color}`} />
          {section.label}
          <Badge variant="outline" className="text-[10px] ml-auto">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {items.length > 0 ? (
            items.slice(0, 8).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-900/30">
                <span className="truncate">{item.name || item.path || item}</span>
                {item.status !== undefined && (
                  item.status ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              {isRtl ? "لا توجد عناصر" : "No items"}
            </p>
          )}
          {items.length > 8 && (
            <p className="text-[10px] text-muted-foreground text-center">
              +{items.length - 8} {isRtl ? "المزيد" : "more"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
