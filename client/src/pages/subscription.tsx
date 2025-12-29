import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Star, Crown, Zap, Building2, Shield, Loader2, CreditCard, Calendar, AlertTriangle, ArrowUpCircle, XCircle, LogIn } from "lucide-react";
import { Link } from "wouter";
import type { SubscriptionPlan } from "@shared/schema";
import { DocLinkButton } from "@/components/doc-link-button";

interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan?: SubscriptionPlan;
}

export default function Subscription() {
  const { language, isRtl } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<UserSubscription>({
    queryKey: ["/api/subscription"],
    enabled: isAuthenticated,
  });

  const { data: plans } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/plans"],
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/payments/cancel-subscription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: language === "ar" ? "تم الإلغاء" : "Cancelled",
        description: language === "ar" 
          ? "تم إلغاء اشتراكك. سيبقى نشطاً حتى نهاية الفترة الحالية." 
          : "Your subscription has been cancelled. It will remain active until the end of the current period.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const translations = {
    title: { ar: "إدارة الاشتراك", en: "Manage Subscription" },
    currentPlan: { ar: "خطتك الحالية", en: "Your Current Plan" },
    noPlan: { ar: "لا يوجد اشتراك نشط", en: "No Active Subscription" },
    noPlanDesc: { ar: "اشترك الآن للاستفادة من جميع المميزات", en: "Subscribe now to enjoy all features" },
    browsePlans: { ar: "تصفح الخطط", en: "Browse Plans" },
    status: { ar: "الحالة", en: "Status" },
    active: { ar: "نشط", en: "Active" },
    cancelled: { ar: "ملغي", en: "Cancelled" },
    expired: { ar: "منتهي", en: "Expired" },
    billingPeriod: { ar: "فترة الفوترة", en: "Billing Period" },
    nextBilling: { ar: "الفوترة التالية", en: "Next Billing" },
    upgrade: { ar: "ترقية الخطة", en: "Upgrade Plan" },
    cancel: { ar: "إلغاء الاشتراك", en: "Cancel Subscription" },
    cancelTitle: { ar: "هل أنت متأكد؟", en: "Are you sure?" },
    cancelDesc: { 
      ar: "سيتم إلغاء اشتراكك في نهاية فترة الفوترة الحالية. لن تفقد الوصول فوراً.", 
      en: "Your subscription will be cancelled at the end of the current billing period. You won't lose access immediately." 
    },
    confirmCancel: { ar: "نعم، إلغاء الاشتراك", en: "Yes, Cancel Subscription" },
    keepPlan: { ar: "الاحتفاظ بالخطة", en: "Keep Plan" },
    loginRequired: { ar: "يجب تسجيل الدخول", en: "Login Required" },
    loginDesc: { ar: "سجل دخولك لإدارة اشتراكك", en: "Login to manage your subscription" },
    login: { ar: "تسجيل الدخول", en: "Login" },
  };

  const tr = (key: keyof typeof translations) => translations[key][language];

  const getPlanIcon = (role: string) => {
    switch (role) {
      case "free": return Zap;
      case "basic": return Star;
      case "pro": return Crown;
      case "enterprise": return Building2;
      case "sovereign": return Shield;
      default: return Zap;
    }
  };

  const getPlanColor = (role: string) => {
    switch (role) {
      case "free": return "from-gray-500 to-gray-600";
      case "basic": return "from-blue-500 to-blue-600";
      case "pro": return "from-violet-500 to-purple-600";
      case "enterprise": return "from-amber-500 to-orange-600";
      case "sovereign": return "from-rose-500 to-red-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">{tr("active")}</Badge>;
      case "cancelled":
        return <Badge variant="secondary">{tr("cancelled")}</Badge>;
      case "expired":
        return <Badge variant="destructive">{tr("expired")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16" dir={isRtl ? "rtl" : "ltr"}>
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <LogIn className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>{tr("loginRequired")}</CardTitle>
            <CardDescription>{tr("loginDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" data-testid="button-login">
              <Link href="/auth">{tr("login")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentPlan = plans?.find(p => p.role === user?.role);
  const Icon = currentPlan ? getPlanIcon(currentPlan.role) : Zap;

  return (
    <div className="container mx-auto px-4 py-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-3xl font-bold" data-testid="subscription-title">
            {tr("title")}
          </h1>
          <DocLinkButton pageId="subscription" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {currentPlan && (
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getPlanColor(currentPlan.role)} flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <div>{tr("currentPlan")}</div>
                <div className="text-2xl font-bold">
                  {currentPlan 
                    ? (language === "ar" ? currentPlan.nameAr : currentPlan.name)
                    : tr("noPlan")
                  }
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription && subscription.status !== "none" ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{tr("status")}</span>
                  </div>
                  {getStatusBadge(subscription.status)}
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{tr("billingPeriod")}</span>
                  </div>
                  <span className="font-medium">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>{tr("nextBilling")}</span>
                  </div>
                  <span className="font-medium">
                    {subscription.status === "cancelled" 
                      ? (language === "ar" ? "لن يتم التجديد" : "Will not renew")
                      : formatDate(subscription.currentPeriodEnd)
                    }
                  </span>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button asChild className="flex-1" data-testid="button-upgrade">
                    <Link href="/pricing">
                      <ArrowUpCircle className="h-4 w-4 me-2" />
                      {tr("upgrade")}
                    </Link>
                  </Button>

                  {subscription.status === "active" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="flex-1" data-testid="button-cancel-subscription">
                          <XCircle className="h-4 w-4 me-2" />
                          {tr("cancel")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{tr("cancelTitle")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {tr("cancelDesc")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{tr("keepPlan")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => cancelMutation.mutate()}
                            disabled={cancelMutation.isPending}
                          >
                            {cancelMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              tr("confirmCancel")
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">{tr("noPlanDesc")}</p>
                <Button asChild data-testid="button-browse-plans">
                  <Link href="/pricing">
                    <CreditCard className="h-4 w-4 me-2" />
                    {tr("browsePlans")}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
