import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, Eye, Clock, Globe, Zap, 
  Users, MousePointerClick, ArrowUp, ArrowDown, Loader2
} from "lucide-react";
import { Redirect } from "wouter";

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    avgSessionDuration: string;
    bounceRate: number;
    viewsChange: number;
    visitorsChange: number;
  };
  projects: Array<{
    id: string;
    name: string;
    views: number;
    visitors: number;
    engagement: number;
  }>;
  aiUsage: {
    totalGenerations: number;
    tokensUsed: number;
    avgResponseTime: string;
    successRate: number;
  };
  topCountries: Array<{
    country: string;
    visitors: number;
    percentage: number;
  }>;
}

const mockData: AnalyticsData = {
  overview: {
    totalViews: 12847,
    uniqueVisitors: 3421,
    avgSessionDuration: "4:32",
    bounceRate: 34.2,
    viewsChange: 12.5,
    visitorsChange: 8.3,
  },
  projects: [
    { id: "1", name: "Financial Services Platform", views: 4521, visitors: 1234, engagement: 78 },
    { id: "2", name: "Healthcare System", views: 3210, visitors: 987, engagement: 65 },
    { id: "3", name: "E-Government Portal", views: 2156, visitors: 756, engagement: 82 },
    { id: "4", name: "Education Platform", views: 1890, visitors: 543, engagement: 71 },
  ],
  aiUsage: {
    totalGenerations: 156,
    tokensUsed: 245680,
    avgResponseTime: "2.3s",
    successRate: 98.7,
  },
  topCountries: [
    { country: "Saudi Arabia", visitors: 1245, percentage: 36.4 },
    { country: "UAE", visitors: 876, percentage: 25.6 },
    { country: "Egypt", visitors: 543, percentage: 15.9 },
    { country: "United States", visitors: 421, percentage: 12.3 },
    { country: "United Kingdom", visitors: 336, percentage: 9.8 },
  ],
};

export default function Analytics() {
  const { language, isRtl } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const tr = (ar: string, en: string) => language === "ar" ? ar : en;

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated,
  });

  // Use mock data for now
  const data = analytics || mockData;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  const statCards = [
    {
      title: tr("إجمالي المشاهدات", "Total Views"),
      value: data.overview.totalViews.toLocaleString(),
      change: data.overview.viewsChange,
      icon: Eye,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: tr("الزوار الفريدون", "Unique Visitors"),
      value: data.overview.uniqueVisitors.toLocaleString(),
      change: data.overview.visitorsChange,
      icon: Users,
      color: "from-green-500 to-green-600",
    },
    {
      title: tr("متوسط مدة الجلسة", "Avg. Session"),
      value: data.overview.avgSessionDuration,
      icon: Clock,
      color: "from-violet-500 to-purple-600",
    },
    {
      title: tr("معدل الارتداد", "Bounce Rate"),
      value: `${data.overview.bounceRate}%`,
      icon: MousePointerClick,
      color: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" data-testid="analytics-title">
            {tr("التحليلات الذكية", "Smart Analytics")}
          </h1>
          <p className="text-muted-foreground">
            {tr("رؤى متقدمة عن مشاريعك واستخدام الذكاء الاصطناعي", "Advanced insights about your projects and AI usage")}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end mb-6">
        <Select defaultValue="7d">
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">{tr("آخر 24 ساعة", "Last 24 hours")}</SelectItem>
            <SelectItem value="7d">{tr("آخر 7 أيام", "Last 7 days")}</SelectItem>
            <SelectItem value="30d">{tr("آخر 30 يوم", "Last 30 days")}</SelectItem>
            <SelectItem value="90d">{tr("آخر 90 يوم", "Last 90 days")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  {"change" in stat && stat.change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm mt-1 ${stat.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stat.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      <span>{Math.abs(stat.change)}%</span>
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects" className="gap-2">
            <Globe className="h-4 w-4" />
            {tr("المشاريع", "Projects")}
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Zap className="h-4 w-4" />
            {tr("استخدام AI", "AI Usage")}
          </TabsTrigger>
          <TabsTrigger value="geo" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {tr("التوزيع الجغرافي", "Geographic")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>{tr("أداء المشاريع", "Project Performance")}</CardTitle>
              <CardDescription>
                {tr("تحليل مفصل لأداء كل مشروع", "Detailed analysis of each project's performance")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.projects.map((project) => (
                  <div key={project.id} className="flex items-center gap-4 p-4 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{project.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {project.views.toLocaleString()} {tr("مشاهدة", "views")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.visitors.toLocaleString()} {tr("زائر", "visitors")}
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <Badge variant={project.engagement >= 75 ? "default" : "secondary"}>
                        {project.engagement}% {tr("تفاعل", "engagement")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {tr("إحصائيات AI", "AI Statistics")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">{tr("إجمالي التوليدات", "Total Generations")}</span>
                  <span className="font-bold text-lg">{data.aiUsage.totalGenerations}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">{tr("الرموز المستخدمة", "Tokens Used")}</span>
                  <span className="font-bold text-lg">{data.aiUsage.tokensUsed.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">{tr("متوسط وقت الاستجابة", "Avg Response Time")}</span>
                  <span className="font-bold text-lg">{data.aiUsage.avgResponseTime}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">{tr("معدل النجاح", "Success Rate")}</span>
                  <Badge variant="default">{data.aiUsage.successRate}%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{tr("حدود الاستخدام", "Usage Limits")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{tr("توليدات AI الشهرية", "Monthly AI Generations")}</span>
                    <span>156 / 500</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full" style={{ width: "31.2%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{tr("المشاريع", "Projects")}</span>
                    <span>4 / 10</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: "40%" }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{tr("التخزين", "Storage")}</span>
                    <span>245 MB / 1 GB</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: "24.5%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geo">
          <Card>
            <CardHeader>
              <CardTitle>{tr("التوزيع الجغرافي للزوار", "Visitor Geographic Distribution")}</CardTitle>
              <CardDescription>
                {tr("من أين يأتي زوارك", "Where your visitors come from")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topCountries.map((country, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-8 text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{country.country}</span>
                        <span className="text-muted-foreground">{country.visitors.toLocaleString()} ({country.percentage}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all" 
                          style={{ width: `${country.percentage}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
