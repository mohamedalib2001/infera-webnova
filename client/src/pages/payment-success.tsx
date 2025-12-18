import { useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, User } from "lucide-react";
import { Link, useSearch } from "wouter";
import { queryClient } from "@/lib/queryClient";

export default function PaymentSuccess() {
  const { language, isRtl } = useLanguage();
  const { user } = useAuth();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const sessionId = params.get("session_id");

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
  }, []);

  const translations = {
    title: { ar: "تم الدفع بنجاح!", en: "Payment Successful!" },
    description: { 
      ar: "شكراً لك! تم تفعيل اشتراكك بنجاح.", 
      en: "Thank you! Your subscription has been activated successfully." 
    },
    welcomeBack: { ar: "مرحباً بك", en: "Welcome" },
    subscriptionActive: { 
      ar: "اشتراكك الآن نشط ويمكنك الاستفادة من جميع المميزات.", 
      en: "Your subscription is now active and you can enjoy all features." 
    },
    goToDashboard: { ar: "انتقل للوحة التحكم", en: "Go to Dashboard" },
    backToHome: { ar: "العودة للرئيسية", en: "Back to Home" },
    sessionId: { ar: "معرف الجلسة", en: "Session ID" },
  };

  const tr = (key: keyof typeof translations) => translations[key][language];

  return (
    <div className="container mx-auto px-4 py-16" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl" data-testid="payment-success-title">
              {tr("title")}
            </CardTitle>
            <CardDescription className="text-base">
              {tr("description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-muted-foreground text-sm mb-1">{tr("welcomeBack")}</p>
                <p className="font-semibold text-lg">{user.fullName || user.email}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {tr("subscriptionActive")}
                </p>
              </div>
            )}

            {sessionId && (
              <div className="text-center text-xs text-muted-foreground">
                <span>{tr("sessionId")}: </span>
                <code className="bg-muted px-2 py-1 rounded">{sessionId.slice(0, 20)}...</code>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full" data-testid="button-go-dashboard">
                <Link href="/dashboard">
                  <User className="h-4 w-4 me-2" />
                  {tr("goToDashboard")}
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full" data-testid="button-back-home">
                <Link href="/">
                  <Home className="h-4 w-4 me-2" />
                  {tr("backToHome")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
