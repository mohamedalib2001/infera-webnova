/**
 * Command & Control Panel | لوحة القيادة والتحكم
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  LayoutDashboard, Building2, Target, Bell, FileText, TrendingUp,
  Users, DollarSign, Clock, AlertTriangle, CheckCircle, XCircle,
  Shield, Activity, RefreshCw, ChevronRight, Star, Gauge
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  sector: string;
  sectorAr: string;
  status: string;
  version: string;
  metrics: { users: number; activeUsers: number; transactions: number; revenue: number; uptime: number; responseTime: number; errorRate: number; satisfaction: number };
  maturity: { level: string; score: number; recommendations: string[] };
  risk: { level: string; score: number; impact: string };
  compliance: { overallScore: number; frameworks: { name: string; score: number; certified: boolean }[]; pendingAudits: number };
}

interface Alert {
  id: string;
  platformId: string;
  platformName: string;
  type: string;
  severity: string;
  message: string;
  messageAr: string;
  createdAt: string;
  acknowledged: boolean;
}

interface Goal {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  status: string;
}

interface Stats {
  platforms: { total: number; byStatus: Record<string, number>; bySector: Record<string, number>; byRisk: Record<string, number>; byMaturity: Record<string, number> };
  metrics: { totalUsers: number; totalRevenue: number; avgUptime: number; avgMaturity: number };
  alerts: { total: number; bySeverity: Record<string, number>; unacknowledged: number };
  goals: { total: number; completed: number; atRisk: number; behind: number };
}

const maturityColors: Record<string, string> = {
  initial: "bg-red-500/10 text-red-500",
  developing: "bg-orange-500/10 text-orange-500",
  defined: "bg-yellow-500/10 text-yellow-500",
  managed: "bg-blue-500/10 text-blue-500",
  optimizing: "bg-green-500/10 text-green-500"
};

const riskColors: Record<string, string> = {
  minimal: "bg-green-500/10 text-green-500",
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500"
};

const statusColors: Record<string, string> = {
  planning: "bg-gray-500/10 text-gray-500",
  development: "bg-blue-500/10 text-blue-500",
  testing: "bg-purple-500/10 text-purple-500",
  staging: "bg-yellow-500/10 text-yellow-500",
  production: "bg-green-500/10 text-green-500",
  maintenance: "bg-orange-500/10 text-orange-500",
  deprecated: "bg-red-500/10 text-red-500"
};

const goalStatusColors: Record<string, string> = {
  on_track: "bg-green-500/10 text-green-500",
  at_risk: "bg-yellow-500/10 text-yellow-500",
  behind: "bg-red-500/10 text-red-500",
  completed: "bg-blue-500/10 text-blue-500"
};

export function CommandControlPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const { data: statsData, isLoading } = useQuery<{ data: Stats }>({
    queryKey: ["/api/command-control/stats"]
  });

  const { data: platformsData } = useQuery<{ data: Platform[] }>({
    queryKey: ["/api/command-control/platforms"]
  });

  const { data: alertsData } = useQuery<{ data: Alert[] }>({
    queryKey: ["/api/command-control/alerts"]
  });

  const { data: goalsData } = useQuery<{ data: Goal[] }>({
    queryKey: ["/api/command-control/goals"]
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: string) => apiRequest("POST", `/api/command-control/alerts/${alertId}/acknowledge`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/command-control/alerts"] })
  });

  const generateReportMutation = useMutation({
    mutationFn: (type: string) => apiRequest("POST", "/api/command-control/reports/generate", { type }),
  });

  const stats = statsData?.data;
  const platforms = platformsData?.data || [];
  const alerts = alertsData?.data || [];
  const goals = goalsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
  };

  return (
    <div className="space-y-6 p-6" data-testid="command-control-panel">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Command & Control
          </h2>
          <p className="text-muted-foreground">واجهة القيادة العليا</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Building2 className="w-3 h-3" />
            {stats?.platforms.total || 0} Platforms
          </Badge>
          {(stats?.alerts.unacknowledged || 0) > 0 && (
            <Badge variant="destructive" className="gap-1">
              <Bell className="w-3 h-3" />
              {stats?.alerts.unacknowledged} Alerts
            </Badge>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(stats?.metrics.totalUsers || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Users | المستخدمين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats?.metrics.totalRevenue || 0)}</p>
                <p className="text-xs text-muted-foreground">Revenue | الإيرادات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Activity className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.metrics.avgUptime?.toFixed(2) || 0}%</p>
                <p className="text-xs text-muted-foreground">Avg Uptime | متوسط التشغيل</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Gauge className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.metrics.avgMaturity || 0}%</p>
                <p className="text-xs text-muted-foreground">Avg Maturity | متوسط النضج</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <LayoutDashboard className="w-4 h-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="platforms" data-testid="tab-platforms">
            <Building2 className="w-4 h-4 mr-1" />
            Platforms
          </TabsTrigger>
          <TabsTrigger value="maturity" data-testid="tab-maturity">
            <TrendingUp className="w-4 h-4 mr-1" />
            Maturity
          </TabsTrigger>
          <TabsTrigger value="risks" data-testid="tab-risks">
            <Shield className="w-4 h-4 mr-1" />
            Risks
          </TabsTrigger>
          <TabsTrigger value="goals" data-testid="tab-goals">
            <Target className="w-4 h-4 mr-1" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">
            <Bell className="w-4 h-4 mr-1" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Platform Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platforms by Status | حسب الحالة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats?.platforms.byStatus || {}).filter(([_, count]) => count > 0).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-3">
                    <Badge className={statusColors[status] || 'bg-muted'}>{status}</Badge>
                    <Progress value={(count as number / (stats?.platforms.total || 1)) * 100} className="flex-1" />
                    <span className="text-sm font-medium w-8">{count as number}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Distribution | توزيع المخاطر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats?.platforms.byRisk || {}).map(([risk, count]) => (
                  <div key={risk} className="flex items-center gap-3">
                    <Badge className={riskColors[risk]}>{risk}</Badge>
                    <Progress value={(count as number / (stats?.platforms.total || 1)) * 100} className="flex-1" />
                    <span className="text-sm font-medium w-8">{count as number}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Maturity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Maturity Index | مؤشر النضج</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats?.platforms.byMaturity || {}).map(([level, count]) => (
                  <div key={level} className="flex items-center gap-3">
                    <Badge className={maturityColors[level]}>{level}</Badge>
                    <Progress value={(count as number / (stats?.platforms.total || 1)) * 100} className="flex-1" />
                    <span className="text-sm font-medium w-8">{count as number}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Strategic Goals Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Strategic Goals | الأهداف الاستراتيجية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-green-500">{stats?.goals.completed || 0}</p>
                    <p className="text-xs text-muted-foreground">Completed | مكتملة</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-yellow-500">{stats?.goals.atRisk || 0}</p>
                    <p className="text-xs text-muted-foreground">At Risk | معرضة للخطر</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-red-500">{stats?.goals.behind || 0}</p>
                    <p className="text-xs text-muted-foreground">Behind | متأخرة</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{stats?.goals.total || 0}</p>
                    <p className="text-xs text-muted-foreground">Total | الإجمالي</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generate Report Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => generateReportMutation.mutate('weekly')}
              disabled={generateReportMutation.isPending}
              data-testid="button-generate-report"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Report | إنشاء تقرير
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {platforms.map((platform) => (
                <Card 
                  key={platform.id} 
                  className="cursor-pointer hover-elevate"
                  onClick={() => setSelectedPlatform(selectedPlatform === platform.id ? null : platform.id)}
                  data-testid={`platform-${platform.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{platform.name}</h4>
                          <Badge className={statusColors[platform.status]}>{platform.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{platform.nameAr}</p>
                        <p className="text-xs text-muted-foreground mt-1">{platform.sector} | {platform.sectorAr}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <Badge className={maturityColors[platform.maturity.level]}>{platform.maturity.level}</Badge>
                          <Badge className={riskColors[platform.risk.level]}>{platform.risk.level}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">v{platform.version}</span>
                      </div>
                    </div>

                    {selectedPlatform === platform.id && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Users</p>
                            <p className="font-medium">{formatNumber(platform.metrics.users)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Uptime</p>
                            <p className="font-medium">{platform.metrics.uptime}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Satisfaction</p>
                            <p className="font-medium flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              {platform.metrics.satisfaction}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Compliance</p>
                            <p className="font-medium">{platform.compliance.overallScore}%</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Maturity Score: {platform.maturity.score}%</p>
                          <Progress value={platform.maturity.score} />
                        </div>
                        {platform.compliance.frameworks.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {platform.compliance.frameworks.map((f, i) => (
                              <Badge key={i} variant={f.certified ? "default" : "outline"} className="text-xs">
                                {f.name} {f.certified && <CheckCircle className="w-3 h-3 ml-1" />}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="maturity" className="mt-4">
          <div className="space-y-4">
            {platforms.sort((a, b) => b.maturity.score - a.maturity.score).map((platform) => (
              <Card key={platform.id} data-testid={`maturity-${platform.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{platform.name}</h4>
                      <Badge className={maturityColors[platform.maturity.level]}>{platform.maturity.level}</Badge>
                    </div>
                    <span className="text-2xl font-bold">{platform.maturity.score}%</span>
                  </div>
                  <Progress value={platform.maturity.score} className="h-3" />
                  {platform.maturity.recommendations.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">Recommendations:</p>
                      <ul className="text-sm space-y-1">
                        {platform.maturity.recommendations.slice(0, 2).map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <ChevronRight className="w-3 h-3 mt-1 text-muted-foreground" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="mt-4">
          <div className="space-y-4">
            {platforms.sort((a, b) => b.risk.score - a.risk.score).map((platform) => (
              <Card key={platform.id} data-testid={`risk-${platform.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{platform.name}</h4>
                      <Badge className={riskColors[platform.risk.level]}>{platform.risk.level}</Badge>
                      <Badge variant="outline">{platform.risk.impact} impact</Badge>
                    </div>
                    <span className="text-2xl font-bold">{platform.risk.score}%</span>
                  </div>
                  <Progress 
                    value={platform.risk.score} 
                    className={`h-3 ${platform.risk.level === 'critical' || platform.risk.level === 'high' ? '[&>div]:bg-red-500' : ''}`}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-4">
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = Math.round((goal.current / goal.target) * 100);
              const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
              
              return (
                <Card key={goal.id} data-testid={`goal-${goal.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <h4 className="font-medium">{goal.name}</h4>
                          <Badge className={goalStatusColors[goal.status]}>{goal.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{goal.nameAr}</p>
                        <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{progress}%</p>
                        <p className="text-xs text-muted-foreground">
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Current: {formatNumber(goal.current)} {goal.unit}</span>
                        <span>Target: {formatNumber(goal.target)} {goal.unit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <p className="font-medium">No Active Alerts</p>
                    <p className="text-sm text-muted-foreground">لا توجد تنبيهات نشطة</p>
                  </CardContent>
                </Card>
              ) : (
                alerts.map((alert) => (
                  <Card key={alert.id} className={alert.acknowledged ? 'opacity-60' : ''} data-testid={`alert-${alert.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {alert.severity === 'critical' ? (
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          ) : alert.severity === 'error' ? (
                            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                          ) : (
                            <Bell className="w-5 h-5 text-yellow-500 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">{alert.messageAr}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {alert.platformName} | {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                            {alert.severity}
                          </Badge>
                          {!alert.acknowledged && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                acknowledgeMutation.mutate(alert.id);
                              }}
                              data-testid={`acknowledge-${alert.id}`}
                            >
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CommandControlPanel;
