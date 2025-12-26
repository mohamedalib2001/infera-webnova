import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Lock, Scan, Mail, Smartphone, MessageSquare, Key, 
  GripVertical, Check, X, Settings, Shield, Loader2, QrCode
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type AuthMethod = 'password' | 'face_id' | 'email_otp' | 'totp' | 'sms_otp' | 'security_key';

interface MethodSetting {
  id: string;
  method: AuthMethod;
  enabled: boolean;
  position: number;
  enrolledAt: string | null;
  lastVerifiedAt: string | null;
}

interface MethodLabels {
  [key: string]: { en: string; ar: string; icon: string };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lock, Scan, Mail, Smartphone, MessageSquare, Key
};

interface MfaSettingsProps {
  language?: 'en' | 'ar';
}

export function MfaSettings({ language = 'ar' }: MfaSettingsProps) {
  const { toast } = useToast();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [enrollingMethod, setEnrollingMethod] = useState<AuthMethod | null>(null);
  const [totpQrCode, setTotpQrCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpBackupCodes, setTotpBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");

  const { data: methodsData, isLoading } = useQuery<{
    success: boolean;
    methods: MethodSetting[];
    methodLabels: MethodLabels;
  }>({
    queryKey: ['/api/auth/mfa/methods'],
  });

  const methods = methodsData?.methods || [];
  const labels = methodsData?.methodLabels || {};

  const updateOrderMutation = useMutation({
    mutationFn: async (orderedMethods: string[]) => {
      return apiRequest('/api/auth/mfa/methods/order', {
        method: 'PATCH',
        body: JSON.stringify({ orderedMethods }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/mfa/methods'] });
      toast({
        title: language === 'ar' ? 'تم تحديث الترتيب' : 'Order updated',
        description: language === 'ar' 
          ? 'تم حفظ ترتيب طرق المصادقة الجديد'
          : 'Authentication methods order has been saved',
      });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'فشل في تحديث الترتيب'
          : 'Failed to update order',
        variant: 'destructive',
      });
    }
  });

  const toggleMethodMutation = useMutation({
    mutationFn: async ({ method, enabled }: { method: AuthMethod; enabled: boolean }) => {
      return apiRequest(`/api/auth/mfa/methods/${method}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/mfa/methods'] });
    },
    onError: (error: any) => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: error.message || (language === 'ar' 
          ? 'فشل في تغيير حالة طريقة المصادقة'
          : 'Failed to toggle authentication method'),
        variant: 'destructive',
      });
    }
  });

  const enrollTotpMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/mfa/enroll/totp', { method: 'POST' });
    },
    onSuccess: (data: any) => {
      setTotpQrCode(data.qrCode);
      setTotpSecret(data.secret);
      setTotpBackupCodes(data.backupCodes || []);
      setEnrollingMethod('totp');
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'فشل في إعداد تطبيق المصادقة'
          : 'Failed to setup authenticator app',
        variant: 'destructive',
      });
    }
  });

  const verifyTotpMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest('/api/auth/mfa/enroll/totp/verify', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/mfa/methods'] });
      setEnrollingMethod(null);
      setTotpQrCode(null);
      setTotpSecret(null);
      setVerificationCode("");
      toast({
        title: language === 'ar' ? 'تم التسجيل بنجاح' : 'Enrolled successfully',
        description: language === 'ar' 
          ? 'تم تفعيل تطبيق المصادقة'
          : 'Authenticator app has been enabled',
      });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'رمز غير صحيح' : 'Invalid code',
        description: language === 'ar' 
          ? 'يرجى التحقق من الرمز وإعادة المحاولة'
          : 'Please check the code and try again',
        variant: 'destructive',
      });
    }
  });

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;

    const sortedMethods = [...methods].sort((a, b) => a.position - b.position);
    const dragIndex = sortedMethods.findIndex(m => m.id === draggingId);
    const dropIndex = sortedMethods.findIndex(m => m.id === targetId);

    if (dragIndex === -1 || dropIndex === -1) return;

    const newOrder = [...sortedMethods];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, removed);

    updateOrderMutation.mutate(newOrder.map(m => m.method));
    setDraggingId(null);
  }, [draggingId, methods, updateOrderMutation]);

  const handleToggle = useCallback((method: AuthMethod, currentEnabled: boolean, isEnrolled: boolean) => {
    if (!currentEnabled && !isEnrolled) {
      if (method === 'totp') {
        enrollTotpMutation.mutate();
      } else if (method === 'email_otp') {
        toggleMethodMutation.mutate({ method, enabled: true });
      } else {
        toast({
          title: language === 'ar' ? 'قريباً' : 'Coming Soon',
          description: language === 'ar' 
            ? 'هذه الميزة قيد التطوير'
            : 'This feature is under development',
        });
      }
      return;
    }
    toggleMethodMutation.mutate({ method, enabled: !currentEnabled });
  }, [toggleMethodMutation, enrollTotpMutation, toast, language]);

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Shield;
    return Icon;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const sortedMethods = [...methods].sort((a, b) => a.position - b.position);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {language === 'ar' ? 'طرق المصادقة' : 'Authentication Methods'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'اسحب لإعادة الترتيب، وقم بتفعيل أو تعطيل كل طريقة حسب تفضيلك'
                : 'Drag to reorder, enable or disable each method as you prefer'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" data-testid="button-reset-mfa">
            <Settings className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedMethods.map((setting, index) => {
            const label = labels[setting.method];
            const Icon = getIcon(label?.icon || 'Shield');
            const isEnrolled = !!setting.enrolledAt;

            return (
              <div
                key={setting.id}
                draggable
                onDragStart={(e) => handleDragStart(e, setting.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, setting.id)}
                className={`flex items-center gap-3 p-3 rounded-md border transition-all ${
                  draggingId === setting.id ? 'opacity-50 bg-muted' : 'bg-card hover-elevate'
                }`}
                data-testid={`mfa-method-${setting.method}`}
              >
                <div className="cursor-grab">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
                
                <div className="flex items-center gap-2 flex-1">
                  <div className="p-2 rounded-md bg-muted">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {language === 'ar' ? label?.ar : label?.en}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      {isEnrolled && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          {language === 'ar' ? 'مسجّل' : 'Enrolled'}
                        </Badge>
                      )}
                    </div>
                    {setting.lastVerifiedAt && (
                      <p className="text-xs text-muted-foreground">
                        {language === 'ar' ? 'آخر استخدام: ' : 'Last used: '}
                        {new Date(setting.lastVerifiedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    )}
                  </div>
                </div>

                <Switch
                  checked={setting.enabled}
                  onCheckedChange={() => handleToggle(setting.method, setting.enabled, isEnrolled)}
                  disabled={toggleMethodMutation.isPending}
                  data-testid={`switch-mfa-${setting.method}`}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={enrollingMethod === 'totp'} onOpenChange={() => setEnrollingMethod(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              {language === 'ar' ? 'إعداد تطبيق المصادقة' : 'Setup Authenticator App'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'امسح رمز QR باستخدام تطبيق المصادقة مثل Google Authenticator'
                : 'Scan the QR code with your authenticator app like Google Authenticator'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {totpQrCode && (
              <div className="p-4 bg-white rounded-lg">
                <img src={totpQrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            )}
            
            {totpSecret && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'ar' ? 'أو أدخل هذا الرمز يدوياً:' : 'Or enter this code manually:'}
                </p>
                <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                  {totpSecret}
                </code>
              </div>
            )}

            <div className="w-full space-y-2">
              <label className="text-sm font-medium">
                {language === 'ar' ? 'أدخل رمز التحقق:' : 'Enter verification code:'}
              </label>
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg font-mono tracking-widest"
                data-testid="input-totp-code"
              />
            </div>

            {totpBackupCodes.length > 0 && (
              <div className="w-full p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium mb-2">
                  {language === 'ar' ? 'رموز الاسترداد (احفظها في مكان آمن):' : 'Backup codes (save in a safe place):'}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {totpBackupCodes.map((code, i) => (
                    <code key={i} className="text-xs font-mono">{code}</code>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEnrollingMethod(null)} data-testid="button-cancel-totp">
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={() => verifyTotpMutation.mutate(verificationCode)}
              disabled={verificationCode.length !== 6 || verifyTotpMutation.isPending}
              data-testid="button-verify-totp"
            >
              {verifyTotpMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'ar' ? 'تأكيد' : 'Verify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MfaSettings;
