import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useDashboardMutations(language: 'ar' | 'en') {
  const { toast } = useToast();

  const initializeSovereignAssistants = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/owner/sovereign-assistants/initialize");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-assistants'] });
      toast({
        title: language === 'ar' ? 'تم التهيئة بنجاح' : 'Initialization Successful',
      });
    },
    onError: (error) => {
      toast({
        title: language === 'ar' ? 'خطأ في التهيئة' : 'Initialization Error',
        description: String(error),
        variant: 'destructive',
      });
    },
  });

  const toggleSovereignActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/owner/sovereign-assistants/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-assistants'] });
    },
  });

  const toggleSovereignAutonomy = useMutation({
    mutationFn: async ({ id, isAutonomous }: { id: string; isAutonomous: boolean }) => {
      const res = await apiRequest("PATCH", `/api/owner/sovereign-assistants/${id}`, { isAutonomous });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-assistants'] });
    },
  });

  const killSwitchSovereign = useMutation({
    mutationFn: async (assistantId: string) => {
      const res = await apiRequest("POST", `/api/owner/sovereign-assistants/${assistantId}/kill-switch`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-assistants'] });
      toast({
        title: language === 'ar' ? 'تم تفعيل زر الإيقاف' : 'Kill Switch Activated',
        variant: 'destructive',
      });
    },
  });

  const approveCommand = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/owner/sovereign-commands/${id}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-commands'] });
    },
  });

  const cancelCommand = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/owner/sovereign-commands/${id}/cancel`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-commands'] });
    },
  });

  const rollbackCommand = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/owner/sovereign-commands/${id}/rollback`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/sovereign-commands'] });
    },
  });

  const activateEmergency = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/owner/emergency-controls/activate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/emergency-controls'] });
      toast({
        title: language === 'ar' ? 'تم تفعيل ضوابط الطوارئ' : 'Emergency Controls Activated',
        variant: 'destructive',
      });
    },
  });

  const deactivateEmergency = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/owner/emergency-controls/${id}/deactivate`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/emergency-controls'] });
      toast({
        title: language === 'ar' ? 'تم إلغاء ضوابط الطوارئ' : 'Emergency Controls Deactivated',
      });
    },
  });

  const toggleAIGlobalKillSwitch = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/owner/ai/toggle-kill-switch");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/ai/kill-switch'] });
      toast({
        title: language === 'ar' ? 'تم تحديث حالة AI' : 'AI Status Updated',
      });
    },
  });

  const initializePaymentMethods = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/owner/payment-methods/initialize");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/payment-methods'] });
      toast({
        title: language === 'ar' ? 'تم تهيئة طرق الدفع' : 'Payment Methods Initialized',
      });
    },
  });

  const togglePaymentMethod = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/owner/payment-methods/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/payment-methods'] });
    },
  });

  const initializeAuthMethods = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/owner/auth-methods/initialize");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/auth-methods'] });
      toast({
        title: language === 'ar' ? 'تم تهيئة طرق الدخول' : 'Auth Methods Initialized',
      });
    },
  });

  const toggleAuthMethod = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/owner/auth-methods/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/auth-methods'] });
    },
  });

  const toggleAuthMethodVisibility = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const res = await apiRequest("PATCH", `/api/owner/auth-methods/${id}`, { isVisible });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/auth-methods'] });
    },
  });

  const suspendUser = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await apiRequest("POST", `/api/owner/users/${id}/suspend`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/users'] });
      toast({ title: language === 'ar' ? 'تم تعليق المستخدم' : 'User Suspended' });
    },
  });

  const banUser = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const res = await apiRequest("POST", `/api/owner/users/${id}/ban`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/users'] });
      toast({ title: language === 'ar' ? 'تم حظر المستخدم' : 'User Banned', variant: 'destructive' });
    },
  });

  const reactivateUser = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/owner/users/${id}/reactivate`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/owner/users'] });
      toast({ title: language === 'ar' ? 'تم إعادة تفعيل المستخدم' : 'User Reactivated' });
    },
  });

  return {
    initializeSovereignAssistants,
    toggleSovereignActive,
    toggleSovereignAutonomy,
    killSwitchSovereign,
    approveCommand,
    cancelCommand,
    rollbackCommand,
    activateEmergency,
    deactivateEmergency,
    toggleAIGlobalKillSwitch,
    initializePaymentMethods,
    togglePaymentMethod,
    initializeAuthMethods,
    toggleAuthMethod,
    toggleAuthMethodVisibility,
    suspendUser,
    banUser,
    reactivateUser,
  };
}
