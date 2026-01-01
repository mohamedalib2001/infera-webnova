import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import {
  AlertTriangle,
  Trash2,
  Shield,
  Lock,
  Calendar,
  Tag,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const translations = {
  ar: {
    securityWarning: "تحذير أمني",
    deletionWarning: "أنت على وشك حذف هذا العنصر نهائياً. هذا الإجراء لا يمكن التراجع عنه.",
    entityDetails: "تفاصيل العنصر",
    name: "الاسم",
    type: "النوع",
    status: "الحالة",
    createdAt: "تاريخ الإنشاء",
    description: "الوصف",
    passwordRequired: "التحقق من كلمة المرور مطلوب",
    passwordHint: "أدخل كلمة مرور حسابك لتأكيد عملية الحذف",
    password: "كلمة المرور",
    cancel: "إلغاء",
    delete: "حذف نهائي",
    deleting: "جاري الحذف...",
    verifying: "جاري التحقق...",
    incorrectPassword: "كلمة المرور غير صحيحة",
    deletionSuccess: "تم الحذف بنجاح",
    deletionFailed: "فشل الحذف",
    emailNotification: "سيتم إرسال إشعار بالبريد الإلكتروني بتفاصيل هذه العملية",
    project: "مشروع",
    platform: "منصة",
  },
  en: {
    securityWarning: "Security Warning",
    deletionWarning: "You are about to permanently delete this item. This action cannot be undone.",
    entityDetails: "Item Details",
    name: "Name",
    type: "Type",
    status: "Status",
    createdAt: "Created At",
    description: "Description",
    passwordRequired: "Password Verification Required",
    passwordHint: "Enter your account password to confirm deletion",
    password: "Password",
    cancel: "Cancel",
    delete: "Delete Permanently",
    deleting: "Deleting...",
    verifying: "Verifying...",
    incorrectPassword: "Incorrect password",
    deletionSuccess: "Deleted successfully",
    deletionFailed: "Deletion failed",
    emailNotification: "An email notification with details of this operation will be sent",
    project: "Project",
    platform: "Platform",
  },
};

const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

interface EntityDetails {
  id: string;
  name: string;
  type?: string;
  status?: string;
  description?: string;
  createdAt?: string | Date;
}

interface SecureDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: EntityDetails | null;
  entityType: "project" | "platform";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SecureDeletionDialog({
  open,
  onOpenChange,
  entity,
  entityType,
  onSuccess,
  onCancel,
}: SecureDeletionDialogProps) {
  const { language, isRtl } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (password: string) => {
      if (!entity) throw new Error("No entity selected");
      
      const response = await apiRequest("POST", "/api/secure-delete", {
        entityType,
        entityId: entity.id,
        password,
        entityDetails: {
          name: entity.name,
          description: entity.description,
          createdAt: entity.createdAt,
          type: entity.type,
          status: entity.status,
        },
      });
      
      if (!response.success) {
        throw new Error(response.error || "Deletion failed");
      }
      
      return response;
    },
    onSuccess: () => {
      toast({ title: t.deletionSuccess });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      form.reset();
      setPasswordError(null);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      if (error.message.includes("password") || error.message.includes("كلمة")) {
        setPasswordError(t.incorrectPassword);
      } else {
        toast({ 
          title: t.deletionFailed, 
          description: error.message, 
          variant: "destructive" 
        });
      }
    },
  });

  const handleSubmit = (values: z.infer<typeof passwordSchema>) => {
    setPasswordError(null);
    deleteMutation.mutate(values.password);
  };

  const handleCancel = () => {
    form.reset();
    setPasswordError(null);
    onOpenChange(false);
    onCancel?.();
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "-";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      return format(d, "PPP p", { locale: language === "ar" ? ar : enUS });
    } catch {
      return "-";
    }
  };

  if (!entity) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg" dir={isRtl ? "rtl" : "ltr"}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-destructive text-xl">
              {t.securityWarning}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {t.deletionWarning}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Card className="p-4 bg-muted/50 border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{t.entityDetails}</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{t.name}:</span>
              <span className="font-medium">{entity.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{t.type}:</span>
              <Badge variant="secondary" className="text-xs">
                {entityType === "project" ? t.project : t.platform}
              </Badge>
            </div>
            
            {entity.status && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{t.status}:</span>
                <Badge variant="outline" className="text-xs">{entity.status}</Badge>
              </div>
            )}
            
            {entity.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{t.createdAt}:</span>
                <span>{formatDate(entity.createdAt)}</span>
              </div>
            )}
            
            {entity.description && (
              <div className="mt-2 pt-2 border-t">
                <span className="text-muted-foreground">{t.description}:</span>
                <p className="mt-1 text-xs">{entity.description}</p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-3 mt-2">
          <div className="flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4 text-amber-500" />
            <span className="font-medium">{t.passwordRequired}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t.passwordHint}</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.password}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className={passwordError ? "border-destructive" : ""}
                          data-testid="input-deletion-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute end-0 top-0"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password-visibility"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    {passwordError && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {passwordError}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
                <Shield className="h-4 w-4 shrink-0" />
                <span>{t.emailNotification}</span>
              </div>

              <AlertDialogFooter className="gap-2 sm:gap-2">
                <AlertDialogCancel 
                  onClick={handleCancel}
                  data-testid="button-cancel-deletion"
                >
                  {t.cancel}
                </AlertDialogCancel>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={deleteMutation.isPending || !form.watch("password")}
                  data-testid="button-confirm-deletion"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.verifying}
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      {t.delete}
                    </>
                  )}
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}