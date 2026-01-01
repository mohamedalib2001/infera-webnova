import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";

const registerSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير")
    .regex(/[0-9]/, "يجب أن تحتوي على رقم"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterProps {
  language?: "ar" | "en";
  onSuccess?: (user: any, tokens: { accessToken: string; refreshToken: string }) => void;
}

export default function Register({ language = "ar", onSuccess }: RegisterProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const isRTL = language === "ar";

  const texts = {
    ar: {
      title: "إنشاء حساب جديد",
      subtitle: "أدخل بياناتك لإنشاء حساب جديد",
      email: "البريد الإلكتروني",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      register: "إنشاء الحساب",
      registering: "جاري إنشاء الحساب...",
      hasAccount: "لديك حساب بالفعل؟",
      login: "تسجيل الدخول",
      success: "تم إنشاء الحساب بنجاح",
      error: "فشل إنشاء الحساب",
      passwordRules: {
        length: "8 أحرف على الأقل",
        uppercase: "حرف كبير واحد",
        number: "رقم واحد",
      },
    },
    en: {
      title: "Create Account",
      subtitle: "Enter your details to create a new account",
      email: "Email",
      username: "Username",
      password: "Password",
      confirmPassword: "Confirm Password",
      firstName: "First Name",
      lastName: "Last Name",
      register: "Create Account",
      registering: "Creating account...",
      hasAccount: "Already have an account?",
      login: "Login",
      success: "Account created successfully",
      error: "Failed to create account",
      passwordRules: {
        length: "At least 8 characters",
        uppercase: "One uppercase letter",
        number: "One number",
      },
    },
  };

  const t = texts[language];

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const password = form.watch("password");

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { confirmPassword, ...registerData } = data;
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.errorAr || result.error);
      }
      return result;
    },
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      toast({ title: t.success });
      if (onSuccess) {
        onSuccess(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({ title: t.error, description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.firstName}</FormLabel>
                      <FormControl>
                        <Input data-testid="input-first-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.lastName}</FormLabel>
                      <FormControl>
                        <Input data-testid="input-last-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.email}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" data-testid="input-email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.username}</FormLabel>
                    <FormControl>
                      <Input data-testid="input-username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.password}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          data-testid="input-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={`absolute top-0 ${isRTL ? "left-0" : "right-0"}`}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <div className="mt-2 space-y-1 text-xs">
                      {Object.entries(passwordChecks).map(([key, isValid]) => (
                        <div key={key} className={`flex items-center gap-1 ${isValid ? "text-green-600" : "text-muted-foreground"}`}>
                          {isValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {t.passwordRules[key as keyof typeof t.passwordRules]}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.confirmPassword}</FormLabel>
                    <FormControl>
                      <Input type="password" data-testid="input-confirm-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.registering}
                  </>
                ) : (
                  t.register
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {t.hasAccount}{" "}
                <Link href="/login" className="text-primary hover:underline">
                  {t.login}
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
