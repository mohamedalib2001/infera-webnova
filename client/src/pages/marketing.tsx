import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Megaphone,
  Target,
  TrendingUp,
  Users,
  Mail,
  MessageSquare,
  BarChart3,
  Plus,
  Send,
  Calendar,
  Eye,
  MousePointerClick,
  DollarSign,
  Loader2,
  Sparkles,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "social" | "sms" | "push";
  status: "draft" | "active" | "paused" | "completed";
  audience: number;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
}

export default function Marketing() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [newCampaignName, setNewCampaignName] = useState("");

  const t = {
    ar: {
      title: "مركز التسويق",
      subtitle: "إدارة حملاتك التسويقية وتحليل الأداء",
      overview: "نظرة عامة",
      campaigns: "الحملات",
      audience: "الجمهور",
      automation: "الأتمتة",
      totalReach: "الوصول الإجمالي",
      engagement: "معدل التفاعل",
      conversions: "التحويلات",
      revenue: "الإيرادات",
      activeCampaigns: "الحملات النشطة",
      createCampaign: "إنشاء حملة جديدة",
      campaignName: "اسم الحملة",
      email: "البريد الإلكتروني",
      social: "وسائل التواصل",
      sms: "الرسائل النصية",
      push: "الإشعارات",
      draft: "مسودة",
      active: "نشطة",
      paused: "متوقفة",
      completed: "مكتملة",
      sent: "مرسل",
      opened: "مفتوح",
      clicked: "نقرات",
      budget: "الميزانية",
      spent: "المنفق",
      noData: "لا توجد بيانات",
      startCampaign: "ابدأ الحملة",
      aiSuggestions: "اقتراحات AI",
      generateContent: "توليد محتوى بالذكاء الاصطناعي",
    },
    en: {
      title: "Marketing Center",
      subtitle: "Manage your marketing campaigns and analyze performance",
      overview: "Overview",
      campaigns: "Campaigns",
      audience: "Audience",
      automation: "Automation",
      totalReach: "Total Reach",
      engagement: "Engagement Rate",
      conversions: "Conversions",
      revenue: "Revenue",
      activeCampaigns: "Active Campaigns",
      createCampaign: "Create New Campaign",
      campaignName: "Campaign Name",
      email: "Email",
      social: "Social Media",
      sms: "SMS",
      push: "Push Notifications",
      draft: "Draft",
      active: "Active",
      paused: "Paused",
      completed: "Completed",
      sent: "Sent",
      opened: "Opened",
      clicked: "Clicked",
      budget: "Budget",
      spent: "Spent",
      noData: "No data available",
      startCampaign: "Start Campaign",
      aiSuggestions: "AI Suggestions",
      generateContent: "Generate AI Content",
    },
  };

  const txt = language === "ar" ? t.ar : t.en;

  const mockCampaigns: Campaign[] = [
    {
      id: "1",
      name: language === "ar" ? "حملة إطلاق المنتج" : "Product Launch Campaign",
      type: "email",
      status: "active",
      audience: 15000,
      sent: 12500,
      opened: 4200,
      clicked: 890,
      converted: 125,
      budget: 5000,
      spent: 3200,
      startDate: "2024-01-15",
      endDate: "2024-02-15",
    },
    {
      id: "2",
      name: language === "ar" ? "ترويج وسائل التواصل" : "Social Media Promo",
      type: "social",
      status: "active",
      audience: 50000,
      sent: 45000,
      opened: 22000,
      clicked: 5600,
      converted: 340,
      budget: 10000,
      spent: 7500,
      startDate: "2024-01-10",
      endDate: "2024-03-10",
    },
    {
      id: "3",
      name: language === "ar" ? "تذكير العملاء" : "Customer Reminder",
      type: "sms",
      status: "completed",
      audience: 8000,
      sent: 8000,
      opened: 7200,
      clicked: 1800,
      converted: 450,
      budget: 2000,
      spent: 2000,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    },
  ];

  const stats = {
    totalReach: mockCampaigns.reduce((acc, c) => acc + c.audience, 0),
    engagement: 34.5,
    conversions: mockCampaigns.reduce((acc, c) => acc + c.converted, 0),
    revenue: 45600,
  };

  const getStatusBadge = (status: Campaign["status"]) => {
    const colors = {
      draft: "secondary",
      active: "default",
      paused: "secondary",
      completed: "outline",
    } as const;
    const labels = {
      draft: txt.draft,
      active: txt.active,
      paused: txt.paused,
      completed: txt.completed,
    };
    return <Badge variant={colors[status]}>{labels[status]}</Badge>;
  };

  const getTypeIcon = (type: Campaign["type"]) => {
    switch (type) {
      case "email": return <Mail className="w-4 h-4" />;
      case "social": return <MessageSquare className="w-4 h-4" />;
      case "sms": return <MessageSquare className="w-4 h-4" />;
      case "push": return <Megaphone className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-marketing-title">
            <Megaphone className="w-8 h-8 text-primary" />
            {txt.title}
          </h1>
          <p className="text-muted-foreground">{txt.subtitle}</p>
        </div>
        <Button className="gap-2" data-testid="button-create-campaign">
          <Plus className="w-4 h-4" />
          {txt.createCampaign}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">{txt.totalReach}</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-reach">
              {stats.totalReach.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+12% {language === "ar" ? "من الشهر الماضي" : "from last month"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">{txt.engagement}</CardTitle>
            <MousePointerClick className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-engagement">
              {stats.engagement}%
            </div>
            <Progress value={stats.engagement} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">{txt.conversions}</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-conversions">
              {stats.conversions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+8% {language === "ar" ? "من الشهر الماضي" : "from last month"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">{txt.revenue}</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-revenue">
              ${stats.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+25% {language === "ar" ? "من الشهر الماضي" : "from last month"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            {txt.overview}
          </TabsTrigger>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">
            <Megaphone className="w-4 h-4 mr-2" />
            {txt.campaigns}
          </TabsTrigger>
          <TabsTrigger value="audience" data-testid="tab-audience">
            <Users className="w-4 h-4 mr-2" />
            {txt.audience}
          </TabsTrigger>
          <TabsTrigger value="ai" data-testid="tab-ai">
            <Sparkles className="w-4 h-4 mr-2" />
            {txt.aiSuggestions}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{txt.activeCampaigns}</CardTitle>
              <CardDescription>
                {language === "ar" ? "نظرة عامة على حملاتك النشطة" : "Overview of your active campaigns"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCampaigns.filter(c => c.status === "active").map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between gap-4 p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        {getTypeIcon(campaign.type)}
                      </div>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.sent.toLocaleString()} {txt.sent} • {campaign.opened.toLocaleString()} {txt.opened}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</p>
                        <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2 w-24" />
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4">
            {mockCampaigns.map((campaign) => (
              <Card key={campaign.id} data-testid={`card-campaign-${campaign.id}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      {getTypeIcon(campaign.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <CardDescription>
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {campaign.startDate} - {campaign.endDate}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(campaign.status)}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">{txt.audience}</p>
                      <p className="text-lg font-semibold">{campaign.audience.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{txt.sent}</p>
                      <p className="text-lg font-semibold">{campaign.sent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{txt.opened}</p>
                      <p className="text-lg font-semibold">{campaign.opened.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{txt.clicked}</p>
                      <p className="text-lg font-semibold">{campaign.clicked.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{txt.conversions}</p>
                      <p className="text-lg font-semibold">{campaign.converted.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between gap-2">
                    <div>
                      <span className="text-sm text-muted-foreground">{txt.budget}: </span>
                      <span className="font-medium">${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span>
                    </div>
                    <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{txt.audience}</CardTitle>
              <CardDescription>
                {language === "ar" ? "إدارة وتقسيم جمهورك المستهدف" : "Manage and segment your target audience"}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {language === "ar" ? "قريباً - إدارة شرائح الجمهور" : "Coming Soon - Audience Segmentation"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                {txt.aiSuggestions}
              </CardTitle>
              <CardDescription>
                {language === "ar" ? "استخدم الذكاء الاصطناعي لتحسين حملاتك" : "Use AI to optimize your campaigns"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                <h4 className="font-medium mb-2">
                  {language === "ar" ? "توليد نص إعلاني" : "Generate Ad Copy"}
                </h4>
                <Textarea 
                  placeholder={language === "ar" ? "صف المنتج أو الخدمة التي تريد الترويج لها..." : "Describe the product or service you want to promote..."}
                  className="mb-3"
                />
                <Button className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  {txt.generateContent}
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {language === "ar" ? "أفضل وقت للإرسال" : "Best Send Time"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">10:00 AM</p>
                    <p className="text-xs text-muted-foreground">
                      {language === "ar" ? "بناءً على تفاعل جمهورك" : "Based on your audience engagement"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {language === "ar" ? "معدل الفتح المتوقع" : "Expected Open Rate"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">42%</p>
                    <p className="text-xs text-muted-foreground">
                      {language === "ar" ? "أعلى من المتوسط بـ 15%" : "15% above average"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
