import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function PaymentCancel() {
  const { language, isRtl } = useLanguage();

  const translations = {
    title: { ar: "تم إلغاء الدفع", en: "Payment Cancelled" },
    description: { 
      ar: "تم إلغاء عملية الدفع. لم يتم خصم أي مبلغ من حسابك.", 
      en: "The payment process was cancelled. No charges were made to your account." 
    },
    noWorries: { 
      ar: "لا تقلق! يمكنك المحاولة مرة أخرى في أي وقت.", 
      en: "No worries! You can try again at any time." 
    },
    tryAgain: { ar: "حاول مرة أخرى", en: "Try Again" },
    backToHome: { ar: "العودة للرئيسية", en: "Back to Home" },
    needHelp: { 
      ar: "هل تحتاج مساعدة؟ تواصل معنا على", 
      en: "Need help? Contact us at" 
    },
  };

  const tr = (key: keyof typeof translations) => translations[key][language];

  return (
    <div className="container mx-auto px-4 py-16" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
              <XCircle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl" data-testid="payment-cancel-title">
              {tr("title")}
            </CardTitle>
            <CardDescription className="text-base">
              {tr("description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-muted-foreground">
                {tr("noWorries")}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full" data-testid="button-try-again">
                <Link href="/pricing">
                  <CreditCard className="h-4 w-4 me-2" />
                  {tr("tryAgain")}
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full" data-testid="button-back-home">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 me-2" />
                  {tr("backToHome")}
                </Link>
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                {tr("needHelp")}{" "}
                <a href="mailto:support@infera.ai" className="text-primary hover:underline">
                  support@infera.ai
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
