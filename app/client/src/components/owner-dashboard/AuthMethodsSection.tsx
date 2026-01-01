import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { KeyRound, Mail, Chrome, Github, RefreshCw, Plus, Eye, EyeOff } from "lucide-react";
import { SiFacebook, SiApple, SiX } from "react-icons/si";
import type { AuthMethod } from "@shared/schema";
import type { DashboardTranslations } from "./dashboard-translations";

const authMethodIcons: Record<string, any> = {
  email_password: Mail,
  otp_email: Mail,
  google: Chrome,
  facebook: SiFacebook,
  twitter: SiX,
  github: Github,
  apple: SiApple,
  microsoft: KeyRound,
  magic_link: KeyRound,
  otp_sms: KeyRound,
};

interface AuthMethodsSectionProps {
  t: DashboardTranslations;
  language: 'ar' | 'en';
  authMethods: AuthMethod[];
  isLoading: boolean;
  onInitialize: () => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  initializePending: boolean;
}

export function AuthMethodsSection({
  t,
  language,
  authMethods,
  isLoading,
  onInitialize,
  onToggleActive,
  onToggleVisibility,
  initializePending,
}: AuthMethodsSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                {t.auth.title}
              </CardTitle>
              <CardDescription>{t.auth.subtitle}</CardDescription>
            </div>
            {authMethods.length === 0 && (
              <Button onClick={onInitialize} disabled={initializePending} data-testid="button-init-auth">
                {initializePending ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {t.auth.initialize}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8"><RefreshCw className="w-8 h-8 mx-auto animate-spin" /></div>
          ) : authMethods.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <KeyRound className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{t.auth.noMethods}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {authMethods.map((method) => {
                const MethodIcon = authMethodIcons[method.method] || KeyRound;
                const methodName = t.auth.methods[method.method as keyof typeof t.auth.methods] || method.method;
                return (
                  <Card key={method.id} className="hover-elevate">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <MethodIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{methodName}</h4>
                          <p className="text-xs text-muted-foreground">{method.method}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Badge className={method.isActive ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}>
                            {method.isActive ? t.auth.active : t.auth.inactive}
                          </Badge>
                          <Switch
                            checked={method.isActive}
                            onCheckedChange={(checked) => onToggleActive(method.id, checked)}
                            disabled={method.isDefault}
                            data-testid={`switch-auth-active-${method.id}`}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {method.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {method.isVisible ? t.auth.visible : t.auth.hidden}
                          </div>
                          <Switch
                            checked={method.isVisible}
                            onCheckedChange={(checked) => onToggleVisibility(method.id, checked)}
                            data-testid={`switch-auth-visible-${method.id}`}
                          />
                        </div>
                        {method.isDefault && (
                          <Badge variant="secondary" className="w-full justify-center">{t.auth.default}</Badge>
                        )}
                      </div>
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
