import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  Palette, 
  User, 
  Key,
  Info,
  Loader2,
  Save,
  Pencil,
  Camera,
  Crown,
  Upload,
} from "lucide-react";
import ownerDefaultAvatar from "@assets/unnamed_1766659248817.jpg";

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
      sovereignZoneAlerts: "تنبيهات خروج المنطقة السيادية",
      sovereignZoneAlertsDesc: "إظهار تنبيه عند الخروج من المنطقة السيادية الآمنة",
      twoFactor: "المصادقة الثنائية",
      sessionTimeout: "مهلة الجلسة",
      manageDomains: "إدارة النطاقات",
      changePassword: "تغيير كلمة المرور",
      editProfile: "تعديل الملف الشخصي",
      uploadPhoto: "تحميل صورة",
      removePhoto: "إزالة الصورة",
      photoUpdated: "تم تحديث الصورة بنجاح",
      photoRemoved: "تم إزالة الصورة",
      photoError: "فشل في تحديث الصورة",
    },
    profilePhoto: {
      title: "صورة الملف الشخصي",
      description: "صورتك الشخصية التي تظهر في المنصة",
      ownerBadge: "المالك السيادي",
    },
    editProfileDialog: {
      title: "تعديل الملف الشخصي",
      description: "تحديث معلومات حسابك الشخصية",
      firstName: "الاسم الأول",
      lastName: "الاسم الأخير",
      email: "البريد الإلكتروني",
      save: "حفظ التغييرات",
      cancel: "إلغاء",
      success: "تم تحديث الملف الشخصي بنجاح",
      error: "فشل في تحديث الملف الشخصي",
    },
    changePasswordDialog: {
      title: "تغيير كلمة المرور",
      description: "أدخل كلمة المرور الحالية والجديدة",
      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور الجديدة",
      save: "تغيير كلمة المرور",
      cancel: "إلغاء",
      success: "تم تغيير كلمة المرور بنجاح",
      error: "فشل في تغيير كلمة المرور",
      mismatch: "كلمات المرور غير متطابقة",
      tooShort: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
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
      sovereignZoneAlerts: "Sovereign Zone Exit Alerts",
      sovereignZoneAlertsDesc: "Show alert when leaving the secure sovereign zone",
      twoFactor: "Two-Factor Authentication",
      sessionTimeout: "Session Timeout",
      manageDomains: "Manage Domains",
      changePassword: "Change Password",
      editProfile: "Edit Profile",
      uploadPhoto: "Upload Photo",
      removePhoto: "Remove Photo",
      photoUpdated: "Photo updated successfully",
      photoRemoved: "Photo removed",
      photoError: "Failed to update photo",
    },
    profilePhoto: {
      title: "Profile Photo",
      description: "Your profile picture displayed on the platform",
      ownerBadge: "Sovereign Owner",
    },
    editProfileDialog: {
      title: "Edit Profile",
      description: "Update your personal account information",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      save: "Save Changes",
      cancel: "Cancel",
      success: "Profile updated successfully",
      error: "Failed to update profile",
    },
    changePasswordDialog: {
      title: "Change Password",
      description: "Enter your current and new password",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      save: "Change Password",
      cancel: "Cancel",
      success: "Password changed successfully",
      error: "Failed to change password",
      mismatch: "Passwords do not match",
      tooShort: "Password must be at least 8 characters",
    },
  },
};

export default function SettingsPage() {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const t = translations[language];
  const isOwner = user?.role === "owner";
  
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 2FA setup state
  const [show2faSetup, setShow2faSetup] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [show2faDisable, setShow2faDisable] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  
  // Sovereign zone alerts - stored in localStorage
  const [sovereignZoneAlerts, setSovereignZoneAlerts] = useState(() => {
    const stored = localStorage.getItem("sovereignZoneWarningEnabled");
    return stored === null ? true : stored === "true";
  });
  
  const handleSovereignZoneAlertsToggle = (value: boolean) => {
    setSovereignZoneAlerts(value);
    localStorage.setItem("sovereignZoneWarningEnabled", String(value));
  };
  const [twoFactor, setTwoFactor] = useState(false);

  // Fetch 2FA status
  const { data: twoFaStatus, refetch: refetch2faStatus, isLoading: is2faStatusLoading } = useQuery<{
    enabled: boolean;
    hasRecoveryCodes: boolean;
    recoveryCodesCount: number;
  }>({
    queryKey: ["/api/auth/2fa/status"],
    enabled: isAuthenticated,
  });

  // 2FA Setup mutation
  const setup2faMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/2fa/setup", {});
    },
    onSuccess: (data: any) => {
      setQrCode(data.qrCode);
      setTotpSecret(data.secret);
      setShow2faSetup(true);
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "فشل في إعداد 2FA" : "2FA setup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 2FA Enable mutation
  const enable2faMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("POST", "/api/auth/2fa/enable", { code });
    },
    onSuccess: (data: any) => {
      setRecoveryCodes(data.recoveryCodes || []);
      setShowRecoveryCodes(true);
      setShow2faSetup(false);
      setVerificationCode("");
      refetch2faStatus();
      toast({
        title: language === "ar" ? "تم تفعيل المصادقة الثنائية" : "2FA enabled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "فشل في تفعيل 2FA" : "Failed to enable 2FA",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 2FA Disable mutation
  const disable2faMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("POST", "/api/auth/2fa/disable", { code });
    },
    onSuccess: () => {
      refetch2faStatus();
      toast({
        title: language === "ar" ? "تم تعطيل المصادقة الثنائية" : "2FA disabled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "فشل في تعطيل 2FA" : "Failed to disable 2FA",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch notification preferences
  const { data: notificationPrefs } = useQuery<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    twoFactor: boolean;
  }>({
    queryKey: ["/api/user/notifications"],
    enabled: isAuthenticated,
  });

  // Sync notification preferences with fetched data
  useEffect(() => {
    if (notificationPrefs) {
      setEmailNotifications(notificationPrefs.emailNotifications);
      setPushNotifications(notificationPrefs.pushNotifications);
      setTwoFactor(notificationPrefs.twoFactor);
    }
  }, [notificationPrefs]);

  // Mutation to save notification preferences
  const saveNotificationsMutation = useMutation({
    mutationFn: async (data: { emailNotifications: boolean; pushNotifications: boolean; twoFactor: boolean }) => {
      return await apiRequest("POST", "/api/user/notifications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
    },
    onError: (error: any) => {
      toast({
        title: language === "ar" ? "فشل في حفظ الإعدادات" : "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler for notification toggle
  const handleNotificationToggle = (type: "email" | "push" | "twoFactor", value: boolean) => {
    const newPrefs = {
      emailNotifications: type === "email" ? value : emailNotifications,
      pushNotifications: type === "push" ? value : pushNotifications,
      twoFactor: type === "twoFactor" ? value : twoFactor,
    };
    
    if (type === "email") setEmailNotifications(value);
    if (type === "push") setPushNotifications(value);
    if (type === "twoFactor") setTwoFactor(value);
    
    saveNotificationsMutation.mutate(newPrefs);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string }) => {
      return await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      toast({
        title: t.editProfileDialog.success,
      });
      setEditProfileOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: t.editProfileDialog.error,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest("POST", "/api/user/change-password", data);
    },
    onSuccess: () => {
      toast({
        title: t.changePasswordDialog.success,
      });
      setChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast({
        title: t.changePasswordDialog.error,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditProfile = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setEditProfileOpen(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ firstName, lastName });
  };

  const handleChangePassword = () => {
    if (newPassword.length < 8) {
      toast({
        title: t.changePasswordDialog.tooShort,
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: t.changePasswordDialog.mismatch,
        variant: "destructive",
      });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t.loginRequired}</AlertTitle>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          {t.title}
        </h1>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Photo Section - Only visible to owner */}
        {user?.role === "owner" && (
          <Card data-testid="card-profile-photo" className="border-amber-500/30 bg-gradient-to-br from-background via-background to-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-500" />
                {t.profilePhoto.title}
                <Crown className="w-4 h-4 text-amber-500" />
              </CardTitle>
              <CardDescription>{t.profilePhoto.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-2 ring-amber-500 ring-offset-2 ring-offset-background">
                    <AvatarImage 
                      src={user?.profileImageUrl || ownerDefaultAvatar} 
                      alt={user?.fullName || "Owner"} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-purple-600 text-white font-bold text-2xl">
                      {user?.fullName?.split(" ").map(n => n[0]).join("").substring(0, 2) || "MA"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="font-bold text-lg">{user?.fullName}</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      {t.profilePhoto.ownerBadge}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid="button-upload-photo"
                      onClick={() => document.getElementById("photo-upload")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {t.options.uploadPhoto}
                    </Button>
                    <input 
                      id="photo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append("photo", file);
                          try {
                            await fetch("/api/user/profile-photo", {
                              method: "POST",
                              body: formData,
                            });
                            queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
                            toast({ title: t.options.photoUpdated });
                          } catch {
                            toast({ title: t.options.photoError, variant: "destructive" });
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profileImageUrl || (user?.role === "owner" ? ownerDefaultAvatar : undefined)} alt={user?.fullName || ""} />
                  <AvatarFallback>
                    {user?.fullName?.split(" ").map(n => n[0]).join("").substring(0, 2) || user?.username?.substring(0, 2)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.fullName || user?.username}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                data-testid="button-edit-profile"
                onClick={handleEditProfile}
              >
                <Pencil className="w-4 h-4 mr-2" />
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
              <Switch 
                id="email-notifications" 
                data-testid="switch-email-notifications"
                checked={emailNotifications}
                onCheckedChange={(checked) => handleNotificationToggle("email", checked)}
                disabled={saveNotificationsMutation.isPending}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications">{t.options.pushNotifications}</Label>
              <Switch 
                id="push-notifications" 
                data-testid="switch-push-notifications"
                checked={pushNotifications}
                onCheckedChange={(checked) => handleNotificationToggle("push", checked)}
                disabled={saveNotificationsMutation.isPending}
              />
            </div>
            {isOwner && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sovereign-zone-alerts">{t.options.sovereignZoneAlerts}</Label>
                    <p className="text-sm text-muted-foreground">{t.options.sovereignZoneAlertsDesc}</p>
                  </div>
                  <Switch 
                    id="sovereign-zone-alerts" 
                    data-testid="switch-sovereign-zone-alerts"
                    checked={sovereignZoneAlerts}
                    onCheckedChange={handleSovereignZoneAlertsToggle}
                  />
                </div>
              </>
            )}
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
            {/* Two-Factor Authentication */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t.options.twoFactor}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" 
                      ? "أضف طبقة حماية إضافية لحسابك" 
                      : "Add an extra layer of security to your account"}
                  </p>
                </div>
                {is2faStatusLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : twoFaStatus?.enabled ? (
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {language === "ar" ? "مفعّل" : "Enabled"}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {language === "ar" ? "غير مفعّل" : "Not enabled"}
                  </span>
                )}
              </div>
              
              {is2faStatusLoading ? null : twoFaStatus?.enabled ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShow2faDisable(true)}
                  disabled={disable2faMutation.isPending}
                  data-testid="button-disable-2fa"
                >
                  {disable2faMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    language === "ar" ? "تعطيل المصادقة الثنائية" : "Disable 2FA"
                  )}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setup2faMutation.mutate()}
                  disabled={setup2faMutation.isPending}
                  data-testid="button-setup-2fa"
                >
                  {setup2faMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    language === "ar" ? "إعداد المصادقة الثنائية" : "Set up 2FA"
                  )}
                </Button>
              )}
            </div>
            
            <Separator />
            <div className="flex items-center justify-between">
              <span>{t.options.changePassword}</span>
              <Button 
                variant="outline" 
                size="sm" 
                data-testid="button-change-password"
                onClick={() => setChangePasswordOpen(true)}
              >
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

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.editProfileDialog.title}
            </DialogTitle>
            <DialogDescription>
              {t.editProfileDialog.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t.editProfileDialog.firstName}</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                data-testid="input-first-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t.editProfileDialog.lastName}</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                data-testid="input-last-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.editProfileDialog.email}</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
                data-testid="input-email-disabled"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditProfileOpen(false)}
              data-testid="button-cancel-edit-profile"
            >
              {t.editProfileDialog.cancel}
            </Button>
            <Button 
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {t.editProfileDialog.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2faSetup} onOpenChange={setShow2faSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {language === "ar" ? "إعداد المصادقة الثنائية" : "Set up Two-Factor Authentication"}
            </DialogTitle>
            <DialogDescription>
              {language === "ar" 
                ? "امسح رمز QR باستخدام تطبيق المصادقة مثل Google Authenticator أو Authy"
                : "Scan the QR code with your authenticator app like Google Authenticator or Authy"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {qrCode && (
              <div className="flex justify-center">
                <img 
                  src={qrCode} 
                  alt="2FA QR Code" 
                  className="w-48 h-48 rounded-lg border"
                  data-testid="img-2fa-qrcode"
                />
              </div>
            )}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">
                {language === "ar" ? "أو أدخل هذا الرمز يدوياً:" : "Or enter this code manually:"}
              </p>
              <code className="text-sm bg-muted px-2 py-1 rounded font-mono" data-testid="text-totp-secret">
                {totpSecret}
              </code>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>
                {language === "ar" ? "أدخل رمز التحقق من التطبيق" : "Enter verification code from app"}
              </Label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                data-testid="input-2fa-verification"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShow2faSetup(false);
                setQrCode("");
                setTotpSecret("");
                setVerificationCode("");
              }}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button 
              onClick={() => enable2faMutation.mutate(verificationCode)}
              disabled={verificationCode.length !== 6 || enable2faMutation.isPending}
              data-testid="button-verify-2fa"
            >
              {enable2faMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                language === "ar" ? "تفعيل" : "Enable"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={show2faDisable} onOpenChange={setShow2faDisable}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {language === "ar" ? "تعطيل المصادقة الثنائية" : "Disable Two-Factor Authentication"}
            </DialogTitle>
            <DialogDescription>
              {language === "ar" 
                ? "أدخل رمز التحقق من تطبيق المصادقة لتعطيل المصادقة الثنائية"
                : "Enter the verification code from your authenticator app to disable 2FA"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {language === "ar" ? "رمز التحقق" : "Verification Code"}
              </Label>
              <Input
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                data-testid="input-2fa-disable-code"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShow2faDisable(false);
                setDisableCode("");
              }}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                disable2faMutation.mutate(disableCode);
                setShow2faDisable(false);
                setDisableCode("");
              }}
              disabled={disableCode.length !== 6 || disable2faMutation.isPending}
              data-testid="button-confirm-disable-2fa"
            >
              {disable2faMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                language === "ar" ? "تعطيل" : "Disable"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recovery Codes Dialog */}
      <Dialog open={showRecoveryCodes} onOpenChange={setShowRecoveryCodes}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {language === "ar" ? "أكواد الاسترداد" : "Recovery Codes"}
            </DialogTitle>
            <DialogDescription>
              {language === "ar" 
                ? "احفظ هذه الأكواد في مكان آمن. يمكنك استخدامها للدخول إذا فقدت هاتفك."
                : "Save these codes in a safe place. You can use them to sign in if you lose your phone."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{language === "ar" ? "مهم" : "Important"}</AlertTitle>
              <AlertDescription>
                {language === "ar" 
                  ? "لن تتمكن من رؤية هذه الأكواد مرة أخرى"
                  : "You won't be able to see these codes again"}
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-2 mt-4 p-4 bg-muted rounded-lg">
              {recoveryCodes.map((code, index) => (
                <code key={index} className="text-sm font-mono p-1 bg-background rounded text-center" data-testid={`text-recovery-code-${index}`}>
                  {code}
                </code>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowRecoveryCodes(false);
                setRecoveryCodes([]);
              }}
              data-testid="button-close-recovery-codes"
            >
              {language === "ar" ? "تم الحفظ" : "I've saved these codes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {t.changePasswordDialog.title}
            </DialogTitle>
            <DialogDescription>
              {t.changePasswordDialog.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t.changePasswordDialog.currentPassword}</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t.changePasswordDialog.newPassword}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.changePasswordDialog.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setChangePasswordOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              data-testid="button-cancel-change-password"
            >
              {t.changePasswordDialog.cancel}
            </Button>
            <Button 
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
              data-testid="button-save-password"
            >
              {changePasswordMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Key className="w-4 h-4 mr-2" />
              )}
              {t.changePasswordDialog.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
