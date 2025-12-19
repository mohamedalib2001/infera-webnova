import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Mail, 
  Server, 
  Key, 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  EyeOff,
  Settings,
  Shield,
  RefreshCw,
  Info,
  Users,
  CreditCard,
  ShieldCheck,
  Headphones,
  Bell
} from "lucide-react";

const translations = {
  ar: {
    title: "إعدادات البريد الإلكتروني",
    subtitle: "تكوين خدمة SMTP لإرسال البريد الإلكتروني",
    status: {
      title: "حالة الخدمة",
      configured: "مُكوّن",
      notConfigured: "غير مُكوّن",
      source: "المصدر",
      database: "قاعدة البيانات",
      environment: "متغيرات البيئة",
      none: "غير محدد"
    },
    form: {
      title: "إعدادات SMTP",
      enabled: "تفعيل خدمة البريد",
      host: "خادم SMTP",
      hostPlaceholder: "mail.example.com",
      port: "المنفذ",
      secure: "اتصال آمن (SSL/TLS)",
      secureHint: "استخدم SSL/TLS للمنفذ 465، أو أوقفه للمنفذ 587",
      user: "اسم المستخدم",
      userPlaceholder: "noreply@example.com",
      pass: "كلمة المرور",
      passPlaceholder: "كلمة مرور البريد",
      from: "عنوان المُرسِل",
      fromPlaceholder: "INFERA WebNova <noreply@example.com>",
      save: "حفظ الإعدادات",
      saving: "جاري الحفظ..."
    },
    test: {
      title: "اختبار الإعدادات",
      description: "أرسل بريد تجريبي للتأكد من صحة الإعدادات",
      email: "البريد المستلم",
      emailPlaceholder: "test@example.com",
      send: "إرسال بريد تجريبي",
      sending: "جاري الإرسال...",
      success: "تم إرسال البريد بنجاح!",
      failed: "فشل إرسال البريد"
    },
    presets: {
      title: "إعدادات مُعدّة مسبقاً",
      namecheap: "Namecheap Private Email",
      gmail: "Gmail SMTP",
      outlook: "Outlook/Office 365",
      custom: "مخصص"
    },
    help: {
      title: "معلومات مفيدة",
      tips: [
        "للاستخدام مع Namecheap: mail.privateemail.com، المنفذ 465 (SSL) أو 587 (TLS)",
        "Gmail يتطلب تفعيل 'كلمة مرور التطبيقات' من إعدادات الأمان",
        "تأكد من إضافة سجلات SPF و DKIM لتحسين وصول البريد"
      ]
    },
    messages: {
      saveSuccess: "تم حفظ الإعدادات بنجاح",
      saveFailed: "فشل في حفظ الإعدادات",
      testSuccess: "تم إرسال البريد التجريبي بنجاح",
      testFailed: "فشل في إرسال البريد التجريبي"
    },
    addresses: {
      title: "عناوين البريد",
      subtitle: "عناوين البريد المخصصة لأنواع المعاملات المختلفة",
      noreply: "البريد الافتراضي",
      noreplyDesc: "للإشعارات العامة والرسائل الآلية",
      admin: "بريد الإدارة",
      adminDesc: "للإشعارات الإدارية والتقارير",
      billing: "بريد الفواتير",
      billingDesc: "للفواتير والمعاملات المالية",
      security: "بريد الأمان",
      securityDesc: "لتنبيهات الأمان وإعادة تعيين كلمات المرور",
      support: "بريد الدعم الفني",
      supportDesc: "لطلبات الدعم والمساعدة",
      save: "حفظ العناوين",
      saveSuccess: "تم حفظ عناوين البريد بنجاح"
    }
  },
  en: {
    title: "Email Settings",
    subtitle: "Configure SMTP service for sending emails",
    status: {
      title: "Service Status",
      configured: "Configured",
      notConfigured: "Not Configured",
      source: "Source",
      database: "Database",
      environment: "Environment Variables",
      none: "Not Set"
    },
    form: {
      title: "SMTP Settings",
      enabled: "Enable Email Service",
      host: "SMTP Host",
      hostPlaceholder: "mail.example.com",
      port: "Port",
      secure: "Secure Connection (SSL/TLS)",
      secureHint: "Use SSL/TLS for port 465, or disable for port 587",
      user: "Username",
      userPlaceholder: "noreply@example.com",
      pass: "Password",
      passPlaceholder: "Email password",
      from: "From Address",
      fromPlaceholder: "INFERA WebNova <noreply@example.com>",
      save: "Save Settings",
      saving: "Saving..."
    },
    test: {
      title: "Test Settings",
      description: "Send a test email to verify configuration",
      email: "Recipient Email",
      emailPlaceholder: "test@example.com",
      send: "Send Test Email",
      sending: "Sending...",
      success: "Test email sent successfully!",
      failed: "Failed to send test email"
    },
    presets: {
      title: "Presets",
      namecheap: "Namecheap Private Email",
      gmail: "Gmail SMTP",
      outlook: "Outlook/Office 365",
      custom: "Custom"
    },
    help: {
      title: "Helpful Information",
      tips: [
        "For Namecheap: mail.privateemail.com, port 465 (SSL) or 587 (TLS)",
        "Gmail requires enabling 'App Passwords' in security settings",
        "Add SPF and DKIM records to improve email deliverability"
      ]
    },
    messages: {
      saveSuccess: "Settings saved successfully",
      saveFailed: "Failed to save settings",
      testSuccess: "Test email sent successfully",
      testFailed: "Failed to send test email"
    },
    addresses: {
      title: "Email Addresses",
      subtitle: "Dedicated email addresses for different transaction types",
      noreply: "Default Email",
      noreplyDesc: "For general notifications and automated messages",
      admin: "Admin Email",
      adminDesc: "For administrative notifications and reports",
      billing: "Billing Email",
      billingDesc: "For invoices and financial transactions",
      security: "Security Email",
      securityDesc: "For security alerts and password resets",
      support: "Support Email",
      supportDesc: "For support requests and assistance",
      save: "Save Addresses",
      saveSuccess: "Email addresses saved successfully"
    }
  }
};

interface SmtpConfig {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

interface EmailStatus {
  configured: boolean;
  source: "database" | "environment" | "none";
  config: {
    host: string | null;
    port: number;
    secure: boolean;
    from: string | null;
    enabled: boolean;
  } | null;
}

interface EmailAddresses {
  noreply: string;
  admin: string;
  billing: string;
  security: string;
  support: string;
}

const PRESETS = {
  namecheap: {
    host: "mail.privateemail.com",
    port: 465,
    secure: true
  },
  gmail: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false
  },
  outlook: {
    host: "smtp.office365.com",
    port: 587,
    secure: false
  }
};

export default function OwnerEmailSettings() {
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [emailAddresses, setEmailAddresses] = useState<EmailAddresses>({
    noreply: "noreply@inferaengine.com",
    admin: "",
    billing: "",
    security: "",
    support: ""
  });
  const [formData, setFormData] = useState<SmtpConfig>({
    enabled: false,
    host: "",
    port: 587,
    secure: false,
    user: "",
    pass: "",
    from: ""
  });

  const { data: emailStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<EmailStatus>({
    queryKey: ["/api/owner/email/status"],
  });

  const { data: currentSetting, isLoading: settingLoading, refetch: refetchSettings } = useQuery({
    queryKey: ["/api/owner/system-settings/category/email"],
  });

  const updateFormFromSettings = (data: any) => {
    const settingsArray = Array.isArray(data) ? data : (data?.data || []);
    const smtpSetting = settingsArray.find((s: any) => s.key === "smtp_config");
    if (smtpSetting?.value) {
      setFormData({
        enabled: smtpSetting.value.enabled || false,
        host: smtpSetting.value.host || "",
        port: smtpSetting.value.port || 587,
        secure: smtpSetting.value.secure || false,
        user: smtpSetting.value.user || "",
        pass: smtpSetting.value.pass || "",
        from: smtpSetting.value.from || ""
      });
    }
    const addressesSetting = settingsArray.find((s: any) => s.key === "email_addresses");
    if (addressesSetting?.value) {
      setEmailAddresses({
        noreply: addressesSetting.value.noreply || "noreply@inferaengine.com",
        admin: addressesSetting.value.admin || "",
        billing: addressesSetting.value.billing || "",
        security: addressesSetting.value.security || "",
        support: addressesSetting.value.support || ""
      });
    }
  };

  useEffect(() => {
    if (currentSetting) {
      updateFormFromSettings(currentSetting);
    }
  }, [currentSetting]);

  const saveMutation = useMutation({
    mutationFn: async (data: SmtpConfig) => {
      const settingsArray = Array.isArray(currentSetting) ? currentSetting : (currentSetting as any)?.data || [];
      const existingSetting = settingsArray.find((s: any) => s.key === "smtp_config");

      if (existingSetting) {
        return apiRequest("PATCH", `/api/owner/system-settings/smtp_config`, {
          value: data
        });
      } else {
        return apiRequest("POST", `/api/owner/system-settings`, {
          key: "smtp_config",
          value: data,
          category: "email",
          description: "SMTP email configuration",
          descriptionAr: "إعدادات البريد الإلكتروني SMTP"
        });
      }
    },
    onSuccess: () => {
      toast({
        title: t.messages.saveSuccess,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/system-settings/category/email"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/email/status"] });
      refetchStatus();
      refetchSettings();
    },
    onError: () => {
      toast({
        title: t.messages.saveFailed,
        variant: "destructive"
      });
    }
  });

  const testMutation = useMutation({
    mutationFn: async (to: string) => {
      return apiRequest("POST", `/api/owner/email/test`, { to });
    },
    onSuccess: () => {
      toast({
        title: t.messages.testSuccess,
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: t.messages.testFailed,
        variant: "destructive"
      });
    }
  });

  const saveAddressesMutation = useMutation({
    mutationFn: async (data: EmailAddresses) => {
      const settingsArray = Array.isArray(currentSetting) ? currentSetting : (currentSetting as any)?.data || [];
      const existingSetting = settingsArray.find((s: any) => s.key === "email_addresses");

      if (existingSetting) {
        return apiRequest("PATCH", `/api/owner/system-settings/email_addresses`, {
          value: data
        });
      } else {
        return apiRequest("POST", `/api/owner/system-settings`, {
          key: "email_addresses",
          value: data,
          category: "email",
          description: "Platform email addresses for different purposes",
          descriptionAr: "عناوين البريد الإلكتروني للمنصة لأغراض مختلفة"
        });
      }
    },
    onSuccess: () => {
      toast({
        title: t.addresses.saveSuccess,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/system-settings/category/email"] });
      refetchSettings();
    },
    onError: () => {
      toast({
        title: t.messages.saveFailed,
        variant: "destructive"
      });
    }
  });

  const applyPreset = (preset: keyof typeof PRESETS) => {
    setFormData(prev => ({
      ...prev,
      ...PRESETS[preset]
    }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleTest = () => {
    if (testEmail) {
      testMutation.mutate(testEmail);
    }
  };

  const handleSaveAddresses = () => {
    saveAddressesMutation.mutate(emailAddresses);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Mail className="h-7 w-7 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => refetchStatus()}
          data-testid="button-refresh-status"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card data-testid="card-email-status">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              {t.status.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.status.title}</span>
                  {emailStatus?.configured ? (
                    <Badge variant="default" className="bg-green-600" data-testid="badge-status-configured">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t.status.configured}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" data-testid="badge-status-not-configured">
                      <XCircle className="h-3 w-3 mr-1" />
                      {t.status.notConfigured}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t.status.source}</span>
                  <Badge variant="outline" data-testid="badge-status-source">
                    {emailStatus?.source === "database" ? t.status.database :
                     emailStatus?.source === "environment" ? t.status.environment :
                     t.status.none}
                  </Badge>
                </div>
                {emailStatus?.config && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.form.host}</span>
                      <span className="font-mono text-xs">{emailStatus.config.host || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.form.port}</span>
                      <span className="font-mono text-xs">{emailStatus.config.port}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2" data-testid="card-smtp-form">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="h-5 w-5" />
              {t.form.title}
            </CardTitle>
            <CardDescription className="flex gap-2 flex-wrap">
              {Object.keys(PRESETS).map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset as keyof typeof PRESETS)}
                  data-testid={`button-preset-${preset}`}
                >
                  {t.presets[preset as keyof typeof t.presets]}
                </Button>
              ))}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t.form.enabled}
              </Label>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                data-testid="switch-enabled"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">{t.form.host}</Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) => setFormData(prev => ({ ...prev, host: e.target.value }))}
                  placeholder={t.form.hostPlaceholder}
                  data-testid="input-host"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">{t.form.port}</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                  data-testid="input-port"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="secure" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  {t.form.secure}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">{t.form.secureHint}</p>
              </div>
              <Switch
                id="secure"
                checked={formData.secure}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, secure: checked }))}
                data-testid="switch-secure"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user">{t.form.user}</Label>
                <Input
                  id="user"
                  value={formData.user}
                  onChange={(e) => setFormData(prev => ({ ...prev, user: e.target.value }))}
                  placeholder={t.form.userPlaceholder}
                  data-testid="input-user"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass">{t.form.pass}</Label>
                <div className="relative">
                  <Input
                    id="pass"
                    type={showPassword ? "text" : "password"}
                    value={formData.pass}
                    onChange={(e) => setFormData(prev => ({ ...prev, pass: e.target.value }))}
                    placeholder={t.form.passPlaceholder}
                    data-testid="input-pass"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">{t.form.from}</Label>
              <Input
                id="from"
                value={formData.from}
                onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                placeholder={t.form.fromPlaceholder}
                data-testid="input-from"
              />
            </div>

            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="w-full"
              data-testid="button-save"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.form.saving}
                </>
              ) : (
                t.form.save
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-test-email">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5" />
              {t.test.title}
            </CardTitle>
            <CardDescription>{t.test.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">{t.test.email}</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder={t.test.emailPlaceholder}
                data-testid="input-test-email"
              />
            </div>
            <Button 
              onClick={handleTest}
              disabled={testMutation.isPending || !testEmail || !emailStatus?.configured}
              className="w-full"
              variant="outline"
              data-testid="button-test"
            >
              {testMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.test.sending}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t.test.send}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-help">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              {t.help.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {t.help.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-email-addresses">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            {t.addresses.title}
          </CardTitle>
          <CardDescription>{t.addresses.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email-noreply" className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                {t.addresses.noreply}
              </Label>
              <Input
                id="email-noreply"
                type="email"
                value={emailAddresses.noreply}
                onChange={(e) => setEmailAddresses(prev => ({ ...prev, noreply: e.target.value }))}
                placeholder="noreply@inferaengine.com"
                data-testid="input-email-noreply"
              />
              <p className="text-xs text-muted-foreground">{t.addresses.noreplyDesc}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-admin" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                {t.addresses.admin}
              </Label>
              <Input
                id="email-admin"
                type="email"
                value={emailAddresses.admin}
                onChange={(e) => setEmailAddresses(prev => ({ ...prev, admin: e.target.value }))}
                placeholder="admin@inferaengine.com"
                data-testid="input-email-admin"
              />
              <p className="text-xs text-muted-foreground">{t.addresses.adminDesc}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-500" />
                {t.addresses.billing}
              </Label>
              <Input
                id="email-billing"
                type="email"
                value={emailAddresses.billing}
                onChange={(e) => setEmailAddresses(prev => ({ ...prev, billing: e.target.value }))}
                placeholder="billing@inferaengine.com"
                data-testid="input-email-billing"
              />
              <p className="text-xs text-muted-foreground">{t.addresses.billingDesc}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-security" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-red-500" />
                {t.addresses.security}
              </Label>
              <Input
                id="email-security"
                type="email"
                value={emailAddresses.security}
                onChange={(e) => setEmailAddresses(prev => ({ ...prev, security: e.target.value }))}
                placeholder="security@inferaengine.com"
                data-testid="input-email-security"
              />
              <p className="text-xs text-muted-foreground">{t.addresses.securityDesc}</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email-support" className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-orange-500" />
                {t.addresses.support}
              </Label>
              <Input
                id="email-support"
                type="email"
                value={emailAddresses.support}
                onChange={(e) => setEmailAddresses(prev => ({ ...prev, support: e.target.value }))}
                placeholder="support@inferaengine.com"
                data-testid="input-email-support"
              />
              <p className="text-xs text-muted-foreground">{t.addresses.supportDesc}</p>
            </div>
          </div>

          <Button 
            onClick={handleSaveAddresses}
            disabled={saveAddressesMutation.isPending}
            className="w-full"
            data-testid="button-save-addresses"
          >
            {saveAddressesMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t.form.saving}
              </>
            ) : (
              t.addresses.save
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
