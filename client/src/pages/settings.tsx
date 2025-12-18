import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import { 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  Palette, 
  User, 
  Key,
  Info,
} from "lucide-react";

const translations = {
  ar: {
    title: "الإعدادات",
    subtitle: "إدارة إعدادات حسابك والمنصة",
    loginRequired: "يجب تسجيل الدخول لعرض الإعدادات",
    sections: {
      account: "الحساب",
      accountDesc: "إدارة معلومات حسابك الشخصية",
      notifications: "الإشعارات",
      notificationsDesc: "تخصيص تفضيلات الإشعارات",
      security: "الأمان",
      securityDesc: "إعدادات الأمان والخصوصية",
      domains: "النطاقات",
      domainsDesc: "إدارة نطاقاتك المخصصة",
      appearance: "المظهر",
      appearanceDesc: "تخصيص مظهر المنصة",
    },
    options: {
      emailNotifications: "إشعارات البريد الإلكتروني",
      pushNotifications: "الإشعارات الفورية",
      twoFactor: "المصادقة الثنائية",
      sessionTimeout: "مهلة الجلسة",
      manageDomains: "إدارة النطاقات",
      changePassword: "تغيير كلمة المرور",
      editProfile: "تعديل الملف الشخصي",
    },
  },
  en: {
    title: "Settings",
    subtitle: "Manage your account and platform settings",
    loginRequired: "Please login to view settings",
    sections: {
      account: "Account",
      accountDesc: "Manage your personal account information",
      notifications: "Notifications",
      notificationsDesc: "Customize your notification preferences",
      security: "Security",
      securityDesc: "Security and privacy settings",
      domains: "Domains",
      domainsDesc: "Manage your custom domains",
      appearance: "Appearance",
      appearanceDesc: "Customize the platform appearance",
    },
    options: {
      emailNotifications: "Email Notifications",
      pushNotifications: "Push Notifications",
      twoFactor: "Two-Factor Authentication",
      sessionTimeout: "Session Timeout",
      manageDomains: "Manage Domains",
      changePassword: "Change Password",
      editProfile: "Edit Profile",
    },
  },
};

export default function SettingsPage() {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const t = translations[language];

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t.loginRequired}</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          {t.title}
        </h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid gap-6">
        <Card data-testid="card-account">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.sections.account}
            </CardTitle>
            <CardDescription>{t.sections.accountDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.fullName || user?.username}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-edit-profile">
                {t.options.editProfile}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-notifications">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t.sections.notifications}
            </CardTitle>
            <CardDescription>{t.sections.notificationsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">{t.options.emailNotifications}</Label>
              <Switch id="email-notifications" data-testid="switch-email-notifications" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">{t.options.pushNotifications}</Label>
              <Switch id="push-notifications" data-testid="switch-push-notifications" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-security">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t.sections.security}
            </CardTitle>
            <CardDescription>{t.sections.securityDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="two-factor">{t.options.twoFactor}</Label>
              <Switch id="two-factor" data-testid="switch-two-factor" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>{t.options.changePassword}</span>
              <Button variant="outline" size="sm" data-testid="button-change-password">
                <Key className="w-4 h-4 mr-2" />
                {t.options.changePassword}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-domains">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t.sections.domains}
            </CardTitle>
            <CardDescription>{t.sections.domainsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/domains">
              <Button variant="outline" data-testid="button-manage-domains">
                <Globe className="w-4 h-4 mr-2" />
                {t.options.manageDomains}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
