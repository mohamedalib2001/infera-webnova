/**
 * INFERA WebNova - Owner Command Center
 * The ultimate sovereign control dashboard for platform owner
 */

import { 
  OwnerLayout, 
  OwnerDashboardHeader, 
  OwnerStatCard 
} from "@/components/owner-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Crown, Shield, Users, Wallet, Activity, Zap,
  TrendingUp, Server, Globe, Brain, Lock, Eye,
  AlertTriangle, CheckCircle, Clock, ArrowRight,
  BarChart3, Cpu, Database, Cloud, Network,
  Rocket, Target, Sparkles, Bell, Settings
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";

export default function OwnerCommand() {
  const { isRtl } = useLanguage();

  const stats = [
    {
      title: "Active Users",
      titleAr: "المستخدمون النشطون",
      value: "12,847",
      change: { value: "+12.5%", type: "increase" as const },
      icon: Users,
      gradient: "from-blue-500/20 to-blue-600/5",
    },
    {
      title: "Revenue",
      titleAr: "الإيرادات",
      value: "$284,520",
      change: { value: "+28.3%", type: "increase" as const },
      icon: Wallet,
      gradient: "from-green-500/20 to-green-600/5",
    },
    {
      title: "AI Operations",
      titleAr: "عمليات الذكاء",
      value: "1.2M",
      change: { value: "+45.2%", type: "increase" as const },
      icon: Brain,
      gradient: "from-violet-500/20 to-violet-600/5",
    },
    {
      title: "System Uptime",
      titleAr: "وقت التشغيل",
      value: "99.99%",
      change: { value: "Optimal", type: "neutral" as const },
      icon: Activity,
      gradient: "from-amber-500/20 to-amber-600/5",
    },
  ];

  const quickActions = [
    { 
      id: "users", 
      labelEn: "Manage Users", 
      labelAr: "إدارة المستخدمين", 
      icon: Users, 
      route: "/owner/users",
      color: "from-blue-600 to-blue-500"
    },
    { 
      id: "finance", 
      labelEn: "Financial Control", 
      labelAr: "التحكم المالي", 
      icon: Wallet, 
      route: "/owner/finance",
      color: "from-green-600 to-green-500"
    },
    { 
      id: "ai", 
      labelEn: "AI Governance", 
      labelAr: "حوكمة الذكاء", 
      icon: Brain, 
      route: "/owner/ai-governance",
      color: "from-violet-600 to-violet-500"
    },
    { 
      id: "security", 
      labelEn: "Security Center", 
      labelAr: "مركز الأمان", 
      icon: Shield, 
      route: "/owner/security",
      color: "from-red-600 to-red-500"
    },
    { 
      id: "infrastructure", 
      labelEn: "Infrastructure", 
      labelAr: "البنية التحتية", 
      icon: Server, 
      route: "/owner/infrastructure",
      color: "from-cyan-600 to-cyan-500"
    },
    { 
      id: "audit", 
      labelEn: "Audit Logs", 
      labelAr: "سجلات المراجعة", 
      icon: Eye, 
      route: "/owner/audit",
      color: "from-orange-600 to-orange-500"
    },
  ];

  const systemStatus = [
    { name: "API Gateway", nameAr: "بوابة API", status: "operational", latency: "23ms" },
    { name: "Database Cluster", nameAr: "مجموعة قاعدة البيانات", status: "operational", latency: "12ms" },
    { name: "AI Processing", nameAr: "معالجة الذكاء", status: "operational", latency: "145ms" },
    { name: "CDN Network", nameAr: "شبكة CDN", status: "operational", latency: "8ms" },
    { name: "Auth Services", nameAr: "خدمات المصادقة", status: "operational", latency: "34ms" },
    { name: "Payment Gateway", nameAr: "بوابة الدفع", status: "maintenance", latency: "89ms" },
  ];

  const recentActivities = [
    { 
      id: 1, 
      action: "New enterprise subscription", 
      actionAr: "اشتراك مؤسسي جديد",
      user: "TechCorp Inc.", 
      time: "2 min ago", 
      timeAr: "منذ دقيقتين",
      type: "success" 
    },
    { 
      id: 2, 
      action: "Security alert resolved", 
      actionAr: "تم حل تنبيه أمني",
      user: "System", 
      time: "15 min ago", 
      timeAr: "منذ 15 دقيقة",
      type: "warning" 
    },
    { 
      id: 3, 
      action: "AI model updated", 
      actionAr: "تم تحديث نموذج الذكاء",
      user: "Auto-Deploy", 
      time: "1 hour ago", 
      timeAr: "منذ ساعة",
      type: "info" 
    },
    { 
      id: 4, 
      action: "New user registered", 
      actionAr: "تسجيل مستخدم جديد",
      user: "ahmed@example.com", 
      time: "2 hours ago", 
      timeAr: "منذ ساعتين",
      type: "success" 
    },
  ];

  return (
    <OwnerLayout>
      <OwnerDashboardHeader
        title="Sovereign Command Center"
        titleAr="مركز القيادة السيادي"
        description="Complete control over your digital platform ecosystem"
        descriptionAr="تحكم كامل في منظومتك الرقمية"
        badge={{ text: "Owner Only", textAr: "للمالك فقط", variant: "owner" }}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="btn-notifications">
              <Bell className="h-4 w-4 mr-2" />
              {isRtl ? "الإشعارات" : "Alerts"}
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-amber-600 to-orange-600" data-testid="btn-settings">
              <Settings className="h-4 w-4 mr-2" />
              {isRtl ? "الإعدادات" : "Settings"}
            </Button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <OwnerStatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" data-testid="tab-overview">
            {isRtl ? "نظرة عامة" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="systems" data-testid="tab-systems">
            {isRtl ? "الأنظمة" : "Systems"}
          </TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">
            {isRtl ? "النشاط" : "Activity"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Quick Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  {isRtl ? "الإجراءات السريعة" : "Quick Actions"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {quickActions.map((action) => (
                    <Link key={action.id} href={action.route}>
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 flex flex-col items-center gap-2 hover-elevate"
                        data-testid={`quick-action-${action.id}`}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color}`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xs font-medium text-center">
                          {isRtl ? action.labelAr : action.labelEn}
                        </span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Status */}
            <Card className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-violet-400" />
                  Nova AI {isRtl ? "الحالة" : "Status"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {isRtl ? "الحالة" : "Status"}
                  </span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {isRtl ? "نشط" : "Active"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {isRtl ? "استخدام اليوم" : "Today's Usage"}
                    </span>
                    <span>12,450 / 50,000</span>
                  </div>
                  <Progress value={24.9} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-lg font-bold text-violet-400">98.2%</p>
                    <p className="text-[10px] text-muted-foreground">
                      {isRtl ? "دقة" : "Accuracy"}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-lg font-bold text-cyan-400">145ms</p>
                    <p className="text-[10px] text-muted-foreground">
                      {isRtl ? "زمن الاستجابة" : "Avg Latency"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                {isRtl ? "استخدام الموارد" : "Resource Usage"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "CPU", labelAr: "المعالج", value: 42, color: "bg-blue-500" },
                  { label: "Memory", labelAr: "الذاكرة", value: 68, color: "bg-violet-500" },
                  { label: "Storage", labelAr: "التخزين", value: 35, color: "bg-green-500" },
                  { label: "Network", labelAr: "الشبكة", value: 28, color: "bg-cyan-500" },
                ].map((resource) => (
                  <div key={resource.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isRtl ? resource.labelAr : resource.label}
                      </span>
                      <span className="font-medium">{resource.value}%</span>
                    </div>
                    <Progress value={resource.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="systems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4 text-cyan-400" />
                {isRtl ? "حالة الأنظمة" : "System Status"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus.map((system) => (
                  <div
                    key={system.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    data-testid={`system-status-${system.name.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        system.status === "operational" ? "bg-green-400" : "bg-amber-400"
                      }`} />
                      <span className="font-medium text-sm">
                        {isRtl ? system.nameAr : system.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{system.latency}</span>
                      <Badge
                        variant="outline"
                        className={
                          system.status === "operational"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        }
                      >
                        {system.status === "operational"
                          ? (isRtl ? "يعمل" : "Operational")
                          : (isRtl ? "صيانة" : "Maintenance")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-400" />
                {isRtl ? "النشاط الأخير" : "Recent Activity"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                      data-testid={`activity-${activity.id}`}
                    >
                      <div className={`p-1.5 rounded-full ${
                        activity.type === "success" ? "bg-green-500/20" :
                        activity.type === "warning" ? "bg-amber-500/20" : "bg-blue-500/20"
                      }`}>
                        {activity.type === "success" ? (
                          <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                        ) : activity.type === "warning" ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        ) : (
                          <Activity className="h-3.5 w-3.5 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {isRtl ? activity.actionAr : activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {isRtl ? activity.timeAr : activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </OwnerLayout>
  );
}
