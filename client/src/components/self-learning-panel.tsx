import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  Building2,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  BookOpen,
  Target
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SelfLearningPanelProps {
  language?: "ar" | "en";
}

const sectorIcons: Record<string, any> = {
  financial: TrendingUp,
  healthcare: Shield,
  government: Building2,
  education: BookOpen,
  ecommerce: BarChart3,
  enterprise: Target
};

const impactColors: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  medium: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  high: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  critical: "bg-red-500/10 text-red-700 dark:text-red-400"
};

export function SelfLearningPanel({ language = "ar" }: SelfLearningPanelProps) {
  const { toast } = useToast();
  const isArabic = language === "ar";

  const statsQuery = useQuery<{
    totalPatterns: number;
    patternsBySector: Record<string, number>;
    patternsByType: Record<string, number>;
    totalInsights: number;
    pendingOptimizations: number;
    topPatterns: any[];
  }>({
    queryKey: ["/api/learning/stats"]
  });

  const insightsQuery = useQuery<{ insights: any[] }>({
    queryKey: ["/api/learning/insights"]
  });

  const sectorsQuery = useQuery<{ sectors: any[] }>({
    queryKey: ["/api/learning/sectors"]
  });

  const optimizationsQuery = useQuery<{ optimizations: any[] }>({
    queryKey: ["/api/learning/optimizations"]
  });

  const proposeOptimization = useMutation({
    mutationFn: async (algorithm: string) => {
      const res = await apiRequest("POST", "/api/learning/optimize", { algorithm });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning/optimizations"] });
      toast({
        title: isArabic ? "تم اقتراح التحسين" : "Optimization Proposed",
        description: isArabic ? data.messageAr : data.message
      });
    }
  });

  const approveOptimization = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/learning/optimizations/${id}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning/optimizations"] });
      toast({
        title: isArabic ? "تمت الموافقة" : "Approved",
        description: isArabic ? "تم الموافقة على التحسين" : "Optimization approved"
      });
    }
  });

  const stats = statsQuery.data;
  const insights = insightsQuery.data?.insights || [];
  const sectors = sectorsQuery.data?.sectors || [];
  const optimizations = optimizationsQuery.data?.optimizations || [];

  return (
    <div className="flex flex-col gap-4 h-full" dir={isArabic ? "rtl" : "ltr"}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            {isArabic ? "نظام التعلم والتطوير الذاتي" : "Self-Learning & Development System"}
          </CardTitle>
          <CardDescription>
            {isArabic 
              ? "قاعدة معرفة تتعلم من كل مشروع وتحسن الخوارزميات تلقائياً" 
              : "Knowledge base that learns from every project and auto-improves algorithms"}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalPatterns || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "أنماط متعلمة" : "Learned Patterns"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-yellow-500/10">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalInsights || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "رؤى مكتشفة" : "Insights Discovered"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-green-500/10">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.pendingOptimizations || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "تحسينات معلقة" : "Pending Optimizations"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-blue-500/10">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sectors.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? "قطاعات مدعومة" : "Supported Sectors"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-h-0">
        <Tabs defaultValue="insights" className="h-full flex flex-col">
          <TabsList className="w-full justify-start flex-wrap">
            <TabsTrigger value="insights" data-testid="tab-insights">
              <Lightbulb className="w-4 h-4 mr-1" />
              {isArabic ? "الرؤى" : "Insights"}
            </TabsTrigger>
            <TabsTrigger value="sectors" data-testid="tab-sectors">
              <Building2 className="w-4 h-4 mr-1" />
              {isArabic ? "القطاعات" : "Sectors"}
            </TabsTrigger>
            <TabsTrigger value="optimizations" data-testid="tab-optimizations">
              <TrendingUp className="w-4 h-4 mr-1" />
              {isArabic ? "التحسينات" : "Optimizations"}
            </TabsTrigger>
            <TabsTrigger value="patterns" data-testid="tab-patterns">
              <BarChart3 className="w-4 h-4 mr-1" />
              {isArabic ? "الأنماط" : "Patterns"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="flex-1 min-h-0 mt-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {isArabic ? "الرؤى المكتشفة" : "Discovered Insights"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  {insights.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {isArabic 
                        ? "لم يتم اكتشاف رؤى بعد. ابدأ ببناء مشاريع لتعلم الأنماط." 
                        : "No insights discovered yet. Start building projects to learn patterns."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {insights.map((insight: any) => (
                        <div 
                          key={insight.id} 
                          className="p-3 rounded-md border"
                          data-testid={`card-insight-${insight.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-medium">
                                  {isArabic ? insight.titleAr : insight.title}
                                </span>
                                <Badge variant="outline">{insight.type}</Badge>
                                <Badge className={impactColors[insight.impact]}>
                                  {insight.impact}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {isArabic ? insight.descriptionAr : insight.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Progress value={insight.confidence} className="h-2 w-24" />
                                <span className="text-xs text-muted-foreground">
                                  {insight.confidence}% {isArabic ? "ثقة" : "confidence"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sectors" className="flex-1 min-h-0 mt-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {isArabic ? "ملفات القطاعات" : "Sector Profiles"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sectors.map((sector: any) => {
                      const Icon = sectorIcons[sector.sector] || Building2;
                      return (
                        <div 
                          key={sector.id} 
                          className="p-4 rounded-md border"
                          data-testid={`card-sector-${sector.id}`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-md bg-muted">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">{sector.sectorAr}</h4>
                              <p className="text-xs text-muted-foreground capitalize">
                                {sector.sector}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {isArabic ? "الأنماط:" : "Patterns:"}
                              </span>
                              <span>{sector.patterns?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {isArabic ? "معدل النجاح:" : "Success Rate:"}
                              </span>
                              <span>{Math.round(sector.successRate || 0)}%</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {sector.complianceFrameworks?.slice(0, 3).map((comp: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {comp}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimizations" className="flex-1 min-h-0 mt-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-base">
                  {isArabic ? "تحسينات الخوارزميات" : "Algorithm Optimizations"}
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => proposeOptimization.mutate("code_generator")}
                  disabled={proposeOptimization.isPending}
                  data-testid="button-propose-optimization"
                >
                  {proposeOptimization.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span className="mr-1">
                    {isArabic ? "اقتراح تحسين" : "Propose"}
                  </span>
                </Button>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  {optimizations.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {isArabic 
                        ? "لا توجد تحسينات مقترحة. اضغط على 'اقتراح تحسين' للبدء." 
                        : "No optimizations proposed. Click 'Propose' to start."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {optimizations.map((opt: any) => (
                        <div 
                          key={opt.id} 
                          className="p-3 rounded-md border"
                          data-testid={`card-optimization-${opt.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-medium">{opt.algorithm}</span>
                                <Badge variant={
                                  opt.status === "approved" ? "default" :
                                  opt.status === "proposed" ? "secondary" : "outline"
                                }>
                                  {opt.status}
                                </Badge>
                                <Badge variant="outline" className="text-green-600">
                                  +{opt.expectedGain}%
                                </Badge>
                              </div>
                              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                                {(isArabic ? opt.improvementsAr : opt.improvements)?.slice(0, 3).map((imp: string, i: number) => (
                                  <li key={i} className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    {imp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {opt.status === "proposed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => approveOptimization.mutate(opt.id)}
                                disabled={approveOptimization.isPending}
                                data-testid={`button-approve-${opt.id}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="flex-1 min-h-0 mt-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {isArabic ? "توزيع الأنماط" : "Pattern Distribution"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {isArabic ? "حسب القطاع" : "By Sector"}
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(stats?.patternsBySector || {}).map(([sector, count]) => (
                          <div key={sector} className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-24 capitalize">
                              {sector}
                            </span>
                            <Progress value={(count as number) * 10} className="h-2 flex-1" />
                            <span className="text-sm w-8">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {isArabic ? "حسب النوع" : "By Type"}
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(stats?.patternsByType || {}).map(([type, count]) => (
                          <div key={type} className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-24 capitalize">
                              {type.replace("_", " ")}
                            </span>
                            <Progress value={(count as number) * 10} className="h-2 flex-1" />
                            <span className="text-sm w-8">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {stats?.topPatterns && stats.topPatterns.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          {isArabic ? "الأنماط الأكثر استخداماً" : "Most Used Patterns"}
                        </h4>
                        <div className="space-y-2">
                          {stats.topPatterns.slice(0, 5).map((pattern: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                              <span className="text-sm">{pattern.pattern?.name || "Unknown"}</span>
                              <Badge variant="outline">{pattern.frequency}x</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
