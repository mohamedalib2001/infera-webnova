import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Loader2, Mail, Lock, User, Sparkles, Smartphone, QrCode } from "lucide-react";
import { SiGoogle, SiGithub, SiApple } from "react-icons/si";
import { GradientBackground } from "@/components/gradient-background";
import { LanguageToggle } from "@/components/language-toggle";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, language, isRtl } = useLanguage();
  const [showOtp, setShowOtp] = useState(false);
  const [otpMethod, setOtpMethod] = useState<"email" | "authenticator">("email");
  const [otpValue, setOtpValue] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isTwoFactorLogin, setIsTwoFactorLogin] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "", fullName: "" },
  });

  // Fetch visible auth methods to show/hide social login buttons
  const { data: authMethods = [] } = useQuery<{ key: string; name: string; nameAr: string; icon: string }[]>({
    queryKey: ["/api/auth/methods"],
  });

  // Check if a specific auth method is enabled
  const isAuthMethodEnabled = (key: string) => {
    return authMethods.some(m => m.key.toLowerCase() === key.toLowerCase());
  };

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
    return t("auth.error");
  };

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: (response: any) => {
      // Check if OTP is required
      if (response.requiresOtp) {
        setPendingEmail(response.email || loginForm.getValues("email"));
        setShowOtp(true);
        
        // Check if this is TOTP 2FA login
        if (response.twoFactorEnabled) {
          setIsTwoFactorLogin(true);
          setOtpMethod("authenticator");
          toast({ 
            title: language === "ar" ? "يرجى إدخال رمز المصادقة" : "Enter your authenticator code" 
          });
        } else {
          setIsTwoFactorLogin(false);
          setOtpMethod("email");
          toast({ title: language === "ar" ? "تم إرسال رمز التحقق" : "OTP sent to your email" });
        }
        return;
      }
      
      toast({ title: t("auth.loginSuccess") });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/projects");
    },
    onError: (error: unknown) => {
      toast({ title: t("auth.error"), description: handleApiError(error), variant: "destructive" });
    },
  });

  const requestOtpMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/request-otp", {});
    },
    onSuccess: () => {
      toast({ title: language === "ar" ? "تم إرسال رمز التحقق" : "OTP sent" });
    },
    onError: (error: unknown) => {
      toast({ title: t("auth.error"), description: handleApiError(error), variant: "destructive" });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("POST", "/api/auth/verify-otp", { code });
    },
    onSuccess: () => {
      toast({ title: language === "ar" ? "تم التحقق بنجاح" : "Verified successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setShowOtp(false);
      setOtpValue("");
      setLocation("/projects");
    },
    onError: (error: unknown) => {
      toast({ title: t("auth.error"), description: handleApiError(error), variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const payload = { ...data, language };
      return await apiRequest("POST", "/api/auth/register", payload);
    },
    onSuccess: () => {
      toast({ title: t("auth.registerSuccess") });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/projects");
    },
    onError: (error: unknown) => {
      toast({ title: t("auth.error"), description: handleApiError(error), variant: "destructive" });
    },
  });

  const handleSocialLogin = () => {
    window.location.href = "/api/login";
  };

  const SocialButton = ({ provider, icon: Icon, label }: { provider: string; icon: typeof SiGoogle; label: string }) => (
    <div className="flex-1 flex flex-col items-center gap-1">
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={handleSocialLogin}
        type="button"
        data-testid={`button-${provider.toLowerCase()}-login`}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    </div>
  );

  return (
    <GradientBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="absolute top-4 end-4">
          <LanguageToggle />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img 
              src="/assets/infera-logo.png" 
              alt="INFERA WebNova" 
              className="mx-auto w-16 h-16 mb-4 object-contain"
            />
            <CardTitle className="text-2xl">{t("auth.welcome")}</CardTitle>
            <CardDescription>{t("auth.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {showOtp ? (
              <div className="space-y-6">
                <Tabs value={otpMethod} onValueChange={(v) => setOtpMethod(v as "email" | "authenticator")} dir={isRtl ? "rtl" : "ltr"}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="email" data-testid="tab-email-otp" className="gap-2">
                      <Mail className="h-4 w-4" />
                      {t("auth.emailOtp")}
                    </TabsTrigger>
                    <TabsTrigger value="authenticator" data-testid="tab-authenticator-otp" className="gap-2">
                      <Smartphone className="h-4 w-4" />
                      {t("auth.authenticatorApp")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="email">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {t("auth.otpSent")}
                      </p>
                      <p className="text-sm font-medium">{pendingEmail}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="authenticator">
                    <div className="text-center mb-4">
                      <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Smartphone className="h-12 w-12 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" 
                          ? "أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة الخاص بك"
                          : "Enter the 6-digit code from your authenticator app"}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-center" dir="ltr">
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={setOtpValue}
                    data-testid="input-otp"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button 
                  className="w-full" 
                  disabled={otpValue.length !== 6 || verifyOtpMutation.isPending}
                  onClick={() => verifyOtpMutation.mutate(otpValue)}
                  data-testid="button-verify-otp"
                >
                  {verifyOtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("auth.verifyOtp")}
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShowOtp(false)}
                >
                  {t("auth.backToLogin")}
                </Button>
              </div>
            ) : (
              <>
                {/* Only show social login buttons if at least one is enabled */}
                {(isAuthMethodEnabled("google") || isAuthMethodEnabled("github") || isAuthMethodEnabled("apple")) && (
                  <div className="flex gap-2 mb-6">
                    {isAuthMethodEnabled("google") && (
                      <SocialButton provider="Google" icon={SiGoogle} label={t("auth.google")} />
                    )}
                    {isAuthMethodEnabled("github") && (
                      <SocialButton provider="GitHub" icon={SiGithub} label={t("auth.github")} />
                    )}
                    {isAuthMethodEnabled("apple") && (
                      <SocialButton provider="Apple" icon={SiApple} label={t("auth.apple")} />
                    )}
                  </div>
                )}

                <div className="relative mb-6">
                  <Separator />
                  <span className="absolute top-1/2 start-1/2 -translate-y-1/2 -translate-x-1/2 bg-card px-2 text-xs text-muted-foreground">
                    {t("auth.or")}
                  </span>
                </div>

                <Tabs defaultValue="login" dir={isRtl ? "rtl" : "ltr"}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" data-testid="tab-login">{t("auth.login")}</TabsTrigger>
                    <TabsTrigger value="register" data-testid="tab-register">{t("auth.register")}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={(e) => { e.preventDefault(); loginForm.handleSubmit((data) => loginMutation.mutate(data))(e); }} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("auth.email")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    {...field} 
                                    type="email" 
                                    className="ps-10" 
                                    placeholder="email@example.com"
                                    data-testid="input-login-email"
                                  />
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
                              <FormLabel>{t("auth.password")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    {...field} 
                                    type="password" 
                                    className="ps-10"
                                    data-testid="input-login-password"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loginMutation.isPending}
                          data-testid="button-login-submit"
                        >
                          {loginMutation.isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                          {t("auth.loginBtn")}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={(e) => { e.preventDefault(); registerForm.handleSubmit((data) => registerMutation.mutate(data))(e); }} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("auth.email")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    {...field} 
                                    type="email" 
                                    className="ps-10"
                                    placeholder="email@example.com"
                                    data-testid="input-register-email"
                                  />
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
                              <FormLabel>{t("auth.username")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    {...field} 
                                    className="ps-10"
                                    data-testid="input-register-username"
                                  />
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
                              <FormLabel>{t("auth.fullName")}</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  data-testid="input-register-fullname"
                                />
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
                              <FormLabel>{t("auth.password")}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input 
                                    {...field} 
                                    type="password" 
                                    className="ps-10"
                                    data-testid="input-register-password"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={registerMutation.isPending}
                          data-testid="button-register-submit"
                        >
                          {registerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                          {t("auth.registerBtn")}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </GradientBackground>
  );
}
