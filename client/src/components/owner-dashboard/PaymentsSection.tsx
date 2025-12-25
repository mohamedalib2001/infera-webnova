import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Wallet, Smartphone, Building, Bitcoin, RefreshCw, Plus } from "lucide-react";
import type { PaymentMethod } from "@shared/schema";
import type { DashboardTranslations } from "./dashboard-translations";

const paymentProviderIcons: Record<string, any> = {
  stripe: CreditCard,
  paypal: Wallet,
  tap: Smartphone,
  mada: CreditCard,
  apple_pay: Smartphone,
  google_pay: Smartphone,
  stc_pay: Wallet,
  bank_transfer: Building,
  crypto: Bitcoin,
};

interface PaymentsSectionProps {
  t: DashboardTranslations;
  language: 'ar' | 'en';
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  onInitialize: () => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  initializePending: boolean;
}

export function PaymentsSection({
  t,
  language,
  paymentMethods,
  isLoading,
  onInitialize,
  onToggleActive,
  initializePending,
}: PaymentsSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t.payments.title}
              </CardTitle>
              <CardDescription>{t.payments.subtitle}</CardDescription>
            </div>
            {paymentMethods.length === 0 && (
              <Button onClick={onInitialize} disabled={initializePending} data-testid="button-init-payments">
                {initializePending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {t.payments.initialize}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8"><RefreshCw className="w-8 h-8 mx-auto animate-spin" /></div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{t.payments.noMethods}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods.map((method) => {
                const ProviderIcon = paymentProviderIcons[method.provider] || CreditCard;
                return (
                  <Card key={method.id} className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <ProviderIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{language === 'ar' ? method.displayNameAr : method.displayName}</h4>
                          <p className="text-xs text-muted-foreground">{method.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge className={method.isActive ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}>
                          {method.isActive ? t.payments.active : t.payments.inactive}
                        </Badge>
                        <Switch
                          checked={method.isActive}
                          onCheckedChange={(checked) => onToggleActive(method.id, checked)}
                          data-testid={`switch-payment-${method.id}`}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-muted-foreground">{language === 'ar' ? 'البيئة' : 'Mode'}:</span>
                        <Badge variant="outline">{method.isSandbox ? t.payments.sandbox : t.payments.production}</Badge>
                      </div>
                      {method.supportedCurrencies && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-1">{t.payments.currencies}:</p>
                          <div className="flex flex-wrap gap-1">
                            {method.supportedCurrencies.slice(0, 4).map((currency) => (
                              <Badge key={currency} variant="secondary" className="text-xs">{currency}</Badge>
                            ))}
                            {method.supportedCurrencies.length > 4 && (
                              <Badge variant="outline" className="text-xs">+{method.supportedCurrencies.length - 4}</Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
