import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Activity, UserPlus, Loader2 } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  activeSessions: number;
  newUsersThisMonth: number;
  usersByRole: Array<{
    roleName: string;
    roleNameAr: string;
    count: number;
  }>;
}

interface DashboardProps {
  language?: "ar" | "en";
}

export default function Dashboard({ language = "ar" }: DashboardProps) {
  const isRTL = language === "ar";

  const texts = {
    ar: {
      title: "لوحة التحكم",
      subtitle: "نظرة عامة على النظام",
      totalUsers: "إجمالي المستخدمين",
      activeUsers: "المستخدمون النشطون",
      activeSessions: "الجلسات النشطة",
      newThisMonth: "مستخدمون جدد هذا الشهر",
      usersByRole: "المستخدمون حسب الصلاحية",
      loading: "جاري التحميل...",
      error: "حدث خطأ في تحميل البيانات",
    },
    en: {
      title: "Dashboard",
      subtitle: "System overview",
      totalUsers: "Total Users",
      activeUsers: "Active Users",
      activeSessions: "Active Sessions",
      newThisMonth: "New Users This Month",
      usersByRole: "Users by Role",
      loading: "Loading...",
      error: "Error loading data",
    },
  };

  const t = texts[language];

  const { data, isLoading, error } = useQuery<{ success: boolean; stats: DashboardStats }>({
    queryKey: ["/api/admin/stats"],
  });

  const stats = data?.stats;

  const statCards = [
    {
      title: t.totalUsers,
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: t.activeUsers,
      value: stats?.activeUsers || 0,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: t.activeSessions,
      value: stats?.activeSessions || 0,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: t.newThisMonth,
      value: stats?.newUsersThisMonth || 0,
      icon: UserPlus,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        {t.error}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} data-testid={`card-stat-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid={`text-stat-value-${index}`}>
                {stat.value.toLocaleString(language === "ar" ? "ar-SA" : "en-US")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.usersByRole}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.usersByRole?.map((roleData, index) => {
              const percentage = stats.totalUsers > 0 
                ? Math.round((roleData.count / stats.totalUsers) * 100) 
                : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {language === "ar" ? roleData.roleNameAr : roleData.roleName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {roleData.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
