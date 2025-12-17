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
import { useLanguage } from "@/hooks/use-language";
import { Loader2, Mail, Lock, User, Sparkles } from "lucide-react";
import { GradientBackground } from "@/components/gradient-background";
import { LanguageToggle } from "@/components/language-toggle";

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
    return t("auth.error");
  };

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("auth.loginSuccess") });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/projects");
    },
    onError: (error: unknown) => {
      toast({ title: t("auth.error"), description: handleApiError(error), variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const payload = { ...data, language };
      const res = await apiRequest("POST", "/api/auth/register", payload);
      return res.json();
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

  return (
    <GradientBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="absolute top-4 end-4">
          <LanguageToggle />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mb-4">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl">{t("auth.welcome")}</CardTitle>
            <CardDescription>{t("auth.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="tab-login">{t("auth.login")}</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">{t("auth.register")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
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
                  <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </GradientBackground>
  );
}
