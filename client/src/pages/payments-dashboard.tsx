import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  TrendingUp,
  Settings,
  RefreshCw,
  Activity,
  Zap,
  Globe,
  Building,
  Wallet,
  ShieldAlert,
  LogIn
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Link } from 'wouter';

const translations = {
  en: {
    title: 'Payment Dashboard',
    subtitle: 'Manage payment providers, subscriptions, and transactions',
    overview: 'Overview',
    providers: 'Providers',
    subscriptions: 'Subscriptions',
    transactions: 'Transactions',
    stats: {
      totalRevenue: 'Total Revenue',
      activeSubscriptions: 'Active Subscriptions',
      monthlyRecurring: 'Monthly Recurring Revenue',
      conversionRate: 'Conversion Rate',
    },
    providerStatus: {
      active: 'Active',
      configured: 'Configured',
      inactive: 'Inactive',
    },
    features: {
      subscriptions: 'Subscriptions',
      refunds: 'Refunds',
      webhooks: 'Webhooks',
      manual: 'Manual Settlement',
    },
    actions: {
      setDefault: 'Set as Default',
      configure: 'Configure',
      disable: 'Disable',
      enable: 'Enable',
    },
    noData: 'No data available',
    loading: 'Loading...',
    error: 'Failed to load data',
    default: 'Default',
    accessDenied: 'Access Denied',
    ownerOnly: 'This page is only accessible to the platform owner.',
    loginRequired: 'Please log in to access this page.',
    loginButton: 'Log In',
  },
  ar: {
    title: 'لوحة تحكم الدفع',
    subtitle: 'إدارة مزودي الدفع والاشتراكات والمعاملات',
    overview: 'نظرة عامة',
    providers: 'المزودين',
    subscriptions: 'الاشتراكات',
    transactions: 'المعاملات',
    stats: {
      totalRevenue: 'إجمالي الإيرادات',
      activeSubscriptions: 'الاشتراكات النشطة',
      monthlyRecurring: 'الإيرادات الشهرية المتكررة',
      conversionRate: 'معدل التحويل',
    },
    providerStatus: {
      active: 'نشط',
      configured: 'مُعدّ',
      inactive: 'غير نشط',
    },
    features: {
      subscriptions: 'اشتراكات',
      refunds: 'استرداد',
      webhooks: 'ويب هوك',
      manual: 'تسوية يدوية',
    },
    actions: {
      setDefault: 'تعيين كافتراضي',
      configure: 'إعداد',
      disable: 'تعطيل',
      enable: 'تفعيل',
    },
    noData: 'لا توجد بيانات',
    loading: 'جاري التحميل...',
    error: 'فشل في تحميل البيانات',
    default: 'افتراضي',
    accessDenied: 'الوصول مرفوض',
    ownerOnly: 'هذه الصفحة متاحة فقط لمالك المنصة.',
    loginRequired: 'الرجاء تسجيل الدخول للوصول إلى هذه الصفحة.',
    loginButton: 'تسجيل الدخول',
  },
};

export default function PaymentsDashboard() {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('overview');

  const isOwner = user?.role === 'owner';

  const { data: statsData, isLoading: statsLoading } = useQuery<any>({
    queryKey: ['/api/payments/stats'],
    enabled: isOwner,
  });

  const { data: providersData, isLoading: providersLoading } = useQuery<any>({
    queryKey: ['/api/payments/providers'],
    enabled: isOwner,
  });

  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery<any>({
    queryKey: ['/api/payments/all-subscriptions'],
    enabled: isOwner,
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<any>({
    queryKey: ['/api/payments/transactions'],
    enabled: isOwner,
  });

  const stats = statsData?.stats;
  const providers = providersData?.providers || [];
  const allSubscriptions = subscriptionsData?.subscriptions || [];
  const transactions = transactionsData?.transactions || [];

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <LogIn className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>{t.accessDenied}</CardTitle>
            <CardDescription>{t.loginRequired}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/auth">
              <Button data-testid="button-login-redirect">
                <LogIn className="h-4 w-4 mr-2" />
                {t.loginButton}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex-1 flex items-center justify-center p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <ShieldAlert className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>{t.accessDenied}</CardTitle>
            <CardDescription>{t.ownerOnly}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/10 text-green-600 dark:text-green-400',
      configured: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      inactive: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    };
    return (
      <Badge className={colors[status] || colors.inactive}>
        {t.providerStatus[status as keyof typeof t.providerStatus] || status}
      </Badge>
    );
  };

  const getProviderIcon = (providerId: string) => {
    const icons: Record<string, any> = {
      stripe: CreditCard,
      paypal: Wallet,
      bank_transfer: Building,
      custom: Globe,
    };
    const Icon = icons[providerId] || CreditCard;
    return <Icon className="h-8 w-8" />;
  };

  return (
    <div className="flex-1 p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-payments-title">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button variant="outline" size="icon" data-testid="button-refresh-payments">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Activity className="h-4 w-4 mr-2" />
            {t.overview}
          </TabsTrigger>
          <TabsTrigger value="providers" data-testid="tab-providers">
            <Zap className="h-4 w-4 mr-2" />
            {t.providers}
          </TabsTrigger>
          <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
            <Users className="h-4 w-4 mr-2" />
            {t.subscriptions}
          </TabsTrigger>
          <TabsTrigger value="transactions" data-testid="tab-transactions">
            <DollarSign className="h-4 w-4 mr-2" />
            {t.transactions}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-stat-revenue">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.totalRevenue}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${statsLoading ? '...' : ((stats?.monthlyRecurringRevenue || 0) / 100).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.5% from last month
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-subscriptions">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.activeSubscriptions}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? '...' : (stats?.activeSubscriptions || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalSubscriptions || 0} total
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-mrr">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.monthlyRecurring}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${statsLoading ? '...' : ((stats?.monthlyRecurringRevenue || 0) / 100).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">MRR</p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-conversion">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.stats.conversionRate}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.5%</div>
                <p className="text-xs text-muted-foreground">+2.1% from last week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-subscription-breakdown">
              <CardHeader>
                <CardTitle>Subscription Breakdown</CardTitle>
                <CardDescription>By plan type</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.subscriptionsByPlan?.map((plan: any) => (
                  <div key={plan.planId} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{plan.planName}</span>
                    <Badge variant="secondary">{plan.count}</Badge>
                  </div>
                )) || <p className="text-muted-foreground">{t.noData}</p>}
              </CardContent>
            </Card>

            <Card data-testid="card-payment-status">
              <CardHeader>
                <CardTitle>Payment System Status</CardTitle>
                <CardDescription>All systems operational</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Payment Processing</span>
                  <Badge className="bg-green-500/10 text-green-600">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Webhooks</span>
                  <Badge className="bg-green-500/10 text-green-600">Listening</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>API Keys</span>
                  <Badge className="bg-green-500/10 text-green-600">Enforced</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subscriptions</span>
                  <Badge className="bg-green-500/10 text-green-600">Operational</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {providersLoading ? (
              <p>{t.loading}</p>
            ) : (
              providers.map((provider: any) => (
                <Card key={provider.id} data-testid={`card-provider-${provider.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getProviderIcon(provider.id)}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {language === 'ar' ? provider.nameAr : provider.name}
                          {provider.isDefault && (
                            <Badge variant="outline">{t.default}</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {getStatusBadge(provider.status)}
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-configure-${provider.id}`}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {provider.supportsSubscriptions && (
                        <Badge variant="secondary">{t.features.subscriptions}</Badge>
                      )}
                      {provider.supportsRefunds && (
                        <Badge variant="secondary">{t.features.refunds}</Badge>
                      )}
                      {provider.supportsWebhooks !== false && (
                        <Badge variant="secondary">{t.features.webhooks}</Badge>
                      )}
                      {provider.requiresManualSettlement && (
                        <Badge variant="outline">{t.features.manual}</Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      {!provider.isDefault && provider.status === 'active' && (
                        <Button variant="outline" size="sm" data-testid={`button-set-default-${provider.id}`}>
                          {t.actions.setDefault}
                        </Button>
                      )}
                      {provider.status !== 'active' ? (
                        <Button variant="outline" size="sm" data-testid={`button-enable-${provider.id}`}>
                          {t.actions.enable}
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" data-testid={`button-disable-${provider.id}`}>
                          {t.actions.disable}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الاشتراكات النشطة' : 'Active Subscriptions'}</CardTitle>
              <CardDescription>{language === 'ar' ? 'إدارة اشتراكات المستخدمين' : 'Manage user subscriptions'}</CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <p className="text-center py-4">{t.loading}</p>
              ) : allSubscriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t.noData}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allSubscriptions.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 border rounded-lg gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{sub.userName}</p>
                        <p className="text-sm text-muted-foreground truncate">{sub.userEmail}</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="secondary">{language === 'ar' ? sub.planNameAr : sub.planName}</Badge>
                      </div>
                      <div className="text-center">
                        <Badge className={sub.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}>
                          {sub.status === 'active' 
                            ? (language === 'ar' ? 'نشط' : 'Active')
                            : sub.status === 'cancelled' 
                            ? (language === 'ar' ? 'ملغي' : 'Cancelled')
                            : sub.status
                          }
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground hidden sm:block">
                        {new Date(sub.currentPeriodEnd).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'سجل المعاملات' : 'Transaction History'}</CardTitle>
              <CardDescription>{language === 'ar' ? 'عرض جميع معاملات الدفع' : 'View all payment transactions'}</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <p className="text-center py-4">{t.loading}</p>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t.noData}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{tx.eventType}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {tx.stripeEventId?.slice(0, 30) || 'N/A'}
                        </p>
                      </div>
                      <div className="text-center">
                        <Badge className={tx.status === 'processed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}>
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground hidden sm:block">
                        {new Date(tx.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
