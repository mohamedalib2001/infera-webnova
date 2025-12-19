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
      twoFactor: "Two-Factor Authentication",
      sessionTimeout: "Session Timeout",
      manageDomains: "Manage Domains",
      changePassword: "Change Password",
      editProfile: "Edit Profile",
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
  
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

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
              <Switch 
                id="two-factor" 
                data-testid="switch-two-factor"
                checked={twoFactor}
                onCheckedChange={(checked) => handleNotificationToggle("twoFactor", checked)}
                disabled={saveNotificationsMutation.isPending}
              />
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
