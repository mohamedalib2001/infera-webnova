import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Paintbrush, Upload, Globe, Eye, Save, Loader2,
  Building2, Palette, Code, Link2, CheckCircle2
} from "lucide-react";
import { Redirect } from "wouter";

interface WhiteLabelConfig {
  brandName: string;
  brandNameAr: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  customCss: string;
  hideWatermark: boolean;
  isActive: boolean;
}

const defaultConfig: WhiteLabelConfig = {
  brandName: "",
  brandNameAr: "",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#8B5CF6",
  secondaryColor: "#EC4899",
  customDomain: "",
  customCss: "",
  hideWatermark: false,
  isActive: false,
};

export default function WhiteLabel() {
  const { language, isRtl } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<WhiteLabelConfig>(defaultConfig);
  const [previewMode, setPreviewMode] = useState(false);

  const tr = (ar: string, en: string) => language === "ar" ? ar : en;

  const hasAccess = user?.role === "enterprise" || user?.role === "sovereign" || user?.role === "owner";

  const saveMutation = useMutation({
    mutationFn: async (data: WhiteLabelConfig) => {
      return apiRequest("POST", "/api/white-label", data);
    },
    onSuccess: () => {
      toast({ title: tr("تم حفظ الإعدادات بنجاح", "Settings saved successfully") });
    },
    onError: () => {
      toast({ title: tr("فشل في حفظ الإعدادات", "Failed to save settings"), variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  const colorOptions = [
    { value: "#8B5CF6", label: tr("بنفسجي", "Purple") },
    { value: "#3B82F6", label: tr("أزرق", "Blue") },
    { value: "#10B981", label: tr("أخضر", "Green") },
    { value: "#F59E0B", label: tr("برتقالي", "Orange") },
    { value: "#EF4444", label: tr("أحمر", "Red") },
    { value: "#EC4899", label: tr("وردي", "Pink") },
    { value: "#14B8A6", label: tr("فيروزي", "Teal") },
    { value: "#6366F1", label: tr("نيلي", "Indigo") },
  ];

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-12" dir={isRtl ? "rtl" : "ltr"}>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              {tr("ميزة حصرية", "Exclusive Feature")}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {tr(
                "نظام العلامة البيضاء متاح حصرياً لخطط Enterprise و Sovereign. قم بترقية خطتك للوصول إلى هذه الميزة.",
                "White Label system is exclusively available for Enterprise and Sovereign plans. Upgrade your plan to access this feature."
              )}
            </p>
            <Button asChild>
              <a href="/pricing">{tr("ترقية الخطة", "Upgrade Plan")}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
          <Paintbrush className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" data-testid="whitelabel-title">
            {tr("نظام العلامة البيضاء", "White Label System")}
          </h1>
          <p className="text-muted-foreground">
            {tr("خصص المنصة بهويتك التجارية", "Customize the platform with your brand identity")}
          </p>
        </div>
        <Badge variant="default" className="ms-auto">
          {user?.role === "sovereign" ? tr("سيادي", "Sovereign") : tr("مؤسسي", "Enterprise")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {tr("هوية العلامة التجارية", "Brand Identity")}
              </CardTitle>
              <CardDescription>
                {tr("أدخل معلومات علامتك التجارية", "Enter your brand information")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{tr("اسم العلامة (إنجليزي)", "Brand Name (English)")}</Label>
                  <Input
                    value={config.brandName}
                    onChange={(e) => setConfig(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="Your Brand Name"
                    data-testid="input-brand-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tr("اسم العلامة (عربي)", "Brand Name (Arabic)")}</Label>
                  <Input
                    value={config.brandNameAr}
                    onChange={(e) => setConfig(prev => ({ ...prev, brandNameAr: e.target.value }))}
                    placeholder="اسم علامتك التجارية"
                    dir="rtl"
                    data-testid="input-brand-name-ar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{tr("رابط الشعار", "Logo URL")}</Label>
                  <Input
                    value={config.logoUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    data-testid="input-logo-url"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tr("رابط الأيقونة", "Favicon URL")}</Label>
                  <Input
                    value={config.faviconUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, faviconUrl: e.target.value }))}
                    placeholder="https://example.com/favicon.ico"
                    data-testid="input-favicon-url"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {tr("الألوان والمظهر", "Colors & Appearance")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>{tr("اللون الرئيسي", "Primary Color")}</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setConfig(prev => ({ ...prev, primaryColor: color.value }))}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        config.primaryColor === color.value ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                  <Input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-10 h-10 p-0 border-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>{tr("اللون الثانوي", "Secondary Color")}</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setConfig(prev => ({ ...prev, secondaryColor: color.value }))}
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        config.secondaryColor === color.value ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                  <Input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-10 h-10 p-0 border-0 cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {tr("النطاق المخصص", "Custom Domain")}
              </CardTitle>
              <CardDescription>
                {tr("اربط نطاقك الخاص بالمنصة", "Connect your custom domain to the platform")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{tr("النطاق", "Domain")}</Label>
                <Input
                  value={config.customDomain}
                  onChange={(e) => setConfig(prev => ({ ...prev, customDomain: e.target.value }))}
                  placeholder="app.yourdomain.com"
                  data-testid="input-custom-domain"
                />
                <p className="text-xs text-muted-foreground">
                  {tr(
                    "قم بإضافة سجل CNAME يشير إلى webnova.infera.ai",
                    "Add a CNAME record pointing to webnova.infera.ai"
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {tr("CSS مخصص", "Custom CSS")}
              </CardTitle>
              <CardDescription>
                {tr("أضف أنماط CSS مخصصة للمنصة", "Add custom CSS styles to the platform")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={config.customCss}
                onChange={(e) => setConfig(prev => ({ ...prev, customCss: e.target.value }))}
                placeholder={`/* ${tr("أضف CSS المخصص هنا", "Add your custom CSS here")} */\n.custom-class {\n  color: #8B5CF6;\n}`}
                rows={8}
                className="font-mono text-sm"
                data-testid="input-custom-css"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{tr("خيارات إضافية", "Additional Options")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{tr("إخفاء العلامة المائية", "Hide Watermark")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {tr("إزالة 'مدعوم من INFERA'", "Remove 'Powered by INFERA'")}
                  </p>
                </div>
                <Switch
                  checked={config.hideWatermark}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, hideWatermark: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{tr("تفعيل العلامة البيضاء", "Enable White Label")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {tr("تطبيق الإعدادات على المنصة", "Apply settings to the platform")}
                  </p>
                </div>
                <Switch
                  checked={config.isActive}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{tr("معاينة", "Preview")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="rounded-lg border overflow-hidden"
                style={{ 
                  "--preview-primary": config.primaryColor,
                  "--preview-secondary": config.secondaryColor,
                } as React.CSSProperties}
              >
                <div 
                  className="p-3 text-white flex items-center gap-2"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {config.logoUrl ? (
                    <img src={config.logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
                  ) : (
                    <div className="h-6 w-6 rounded bg-white/20" />
                  )}
                  <span className="font-bold text-sm">
                    {language === "ar" ? config.brandNameAr || "علامتك" : config.brandName || "Your Brand"}
                  </span>
                </div>
                <div className="p-4 bg-background">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button 
                      size="sm" 
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {tr("زر رئيسي", "Primary")}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      style={{ borderColor: config.secondaryColor, color: config.secondaryColor }}
                    >
                      {tr("زر ثانوي", "Secondary")}
                    </Button>
                  </div>
                </div>
                {!config.hideWatermark && (
                  <div className="p-2 border-t text-center text-xs text-muted-foreground">
                    Powered by INFERA WebNova
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => saveMutation.mutate(config)}
              disabled={saveMutation.isPending}
              className="w-full"
              data-testid="button-save-whitelabel"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <Save className="h-4 w-4 me-2" />
              )}
              {tr("حفظ الإعدادات", "Save Settings")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfig(defaultConfig)}
              className="w-full"
            >
              {tr("إعادة تعيين", "Reset")}
            </Button>
          </div>

          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{tr("شعار مخصص", "Custom logo")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{tr("ألوان مخصصة", "Custom colors")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{tr("نطاق مخصص", "Custom domain")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{tr("إزالة العلامة المائية", "Remove watermark")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>{tr("CSS مخصص", "Custom CSS")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
