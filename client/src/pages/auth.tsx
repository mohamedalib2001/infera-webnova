import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Globe } from "lucide-react";
import { GradientBackground } from "@/components/gradient-background";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

const registerSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  fullName: z.string().optional(),
  language: z.enum(["ar", "en"]).default("ar"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const isRtl = language === "ar";

  const t = {
    ar: {
      welcome: "مرحباً بك في INFERA WebNova",
      subtitle: "المنصة الذكية لبناء المواقع بالذكاء الاصطناعي",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      username: "اسم المستخدم",
      fullName: "الاسم الكامل (اختياري)",
      loginBtn: "دخول",
      registerBtn: "إنشاء حساب جديد",
      loginSuccess: "تم تسجيل الدخول بنجاح",
      registerSuccess: "تم إنشاء الحساب بنجاح",
      error: "حدث خطأ",
    },
    en: {
      welcome: "Welcome to INFERA WebNova",
      subtitle: "The intelligent AI-powered website builder",
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      username: "Username",
      fullName: "Full Name (optional)",
      loginBtn: "Sign In",
      registerBtn: "Create Account",
      loginSuccess: "Login successful",
      registerSuccess: "Account created successfully",
      error: "An error occurred",
    },
  };

  const text = t[language];

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "", fullName: "" },
  });

  const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message);
        if (Array.isArray(parsed)) {
          return parsed.map((e: { message: string }) => e.message).join(", ");
        }
        return parsed.error || error.message;
      } catch {
        return error.message;
      }
    }
    return text.error;
  };

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: text.loginSuccess });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/projects");
    },
    onError: (error: unknown) => {
      toast({ title: text.error, description: handleApiError(error), variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const payload = { ...data, language };
      const res = await apiRequest("POST", "/api/auth/register", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: text.registerSuccess });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/projects");
    },
    onError: (error: unknown) => {
      toast({ title: text.error, description: handleApiError(error), variant: "destructive" });
    },
  });

  return (
    <GradientBackground>
      <div className={`min-h-screen flex items-center justify-center p-4 ${isRtl ? "rtl" : "ltr"}`} dir={isRtl ? "rtl" : "ltr"}>
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            data-testid="button-language-toggle"
          >
            <Globe className="h-4 w-4 ml-2" />
            {language === "ar" ? "English" : "عربي"}
          </Button>
        </div>

        <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-primary-foreground">IN</span>
            </div>
            <CardTitle className="text-2xl font-bold">{text.welcome}</CardTitle>
            <CardDescription>{text.subtitle}</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">{text.login}</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">{text.register}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{text.email}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="email" className="pr-10" data-testid="input-login-email" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{text.password}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="password" className="pr-10" data-testid="input-login-password" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="button-login">
                      {loginMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      {text.loginBtn}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit((d) => registerMutation.mutate(d))} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{text.email}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="email" className="pr-10" data-testid="input-register-email" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{text.username}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} className="pr-10" data-testid="input-register-username" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{text.fullName}</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-register-fullname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{text.password}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="password" className="pr-10" data-testid="input-register-password" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending} data-testid="button-register">
                      {registerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      {text.registerBtn}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </GradientBackground>
  );
}
