import { useQuery } from "@tanstack/react-query";
import type { 
  AiAssistant, 
  AssistantInstruction, 
  User, 
  PaymentMethod, 
  AuthMethod, 
  SovereignAssistant, 
  SovereignCommand, 
  SovereignActionLog 
} from "@shared/schema";

export interface PlatformState {
  healthScore: number;
  status: 'healthy' | 'degraded' | 'critical' | 'emergency';
  operationalServices: number;
  totalServices: number;
}

export interface EmergencyControl {
  id: string;
  type: string;
  scope: string;
  isActive: boolean;
  reason: string;
  reasonAr?: string;
  createdAt: string;
}

export interface AICostAnalytics {
  totalRealCost: number;
  totalBilledCost: number;
  margin: number;
  totalTasks: number;
  modelBreakdown: Array<{ model: string; tasks: number; cost: number }>;
}

export interface PaymentAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  activePaymentMethods: number;
}

export function useDashboardData() {
  const { data: assistants = [], isLoading: assistantsLoading } = useQuery<AiAssistant[]>({
    queryKey: ['/api/owner/assistants'],
  });

  const { data: instructions = [], isLoading: instructionsLoading } = useQuery<AssistantInstruction[]>({
    queryKey: ['/api/owner/instructions'],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/owner/users'],
  });

  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/owner/payment-methods'],
  });

  const { data: authMethods = [], isLoading: authMethodsLoading } = useQuery<AuthMethod[]>({
    queryKey: ['/api/owner/auth-methods'],
  });

  const { data: sovereignAssistants = [], isLoading: sovereignAssistantsLoading } = useQuery<SovereignAssistant[]>({
    queryKey: ['/api/owner/sovereign-assistants'],
  });

  const { data: sovereignCommands = [], isLoading: sovereignCommandsLoading } = useQuery<SovereignCommand[]>({
    queryKey: ['/api/owner/sovereign-commands'],
  });

  const { data: sovereignLogs = [], isLoading: sovereignLogsLoading } = useQuery<SovereignActionLog[]>({
    queryKey: ['/api/owner/sovereign-logs'],
  });

  const { data: platformState, isLoading: platformStateLoading } = useQuery<PlatformState>({
    queryKey: ['/api/owner/platform-state'],
  });

  const { data: emergencyControls = [], isLoading: emergencyControlsLoading } = useQuery<EmergencyControl[]>({
    queryKey: ['/api/owner/emergency-controls'],
  });

  const { data: aiCostAnalytics, isLoading: aiCostAnalyticsLoading } = useQuery<AICostAnalytics>({
    queryKey: ['/api/owner/ai/cost-analytics'],
  });

  const { data: paymentAnalytics, isLoading: paymentAnalyticsLoading } = useQuery<PaymentAnalytics>({
    queryKey: ['/api/owner/payment-analytics'],
  });

  const { data: aiGlobalKillSwitch } = useQuery<{ globalActive: boolean; reason?: string }>({
    queryKey: ['/api/owner/ai/kill-switch'],
  });

  return {
    assistants,
    assistantsLoading,
    instructions,
    instructionsLoading,
    users,
    usersLoading,
    paymentMethods,
    paymentMethodsLoading,
    authMethods,
    authMethodsLoading,
    sovereignAssistants,
    sovereignAssistantsLoading,
    sovereignCommands,
    sovereignCommandsLoading,
    sovereignLogs,
    sovereignLogsLoading,
    platformState,
    platformStateLoading,
    emergencyControls,
    emergencyControlsLoading,
    aiCostAnalytics,
    aiCostAnalyticsLoading,
    paymentAnalytics,
    paymentAnalyticsLoading,
    aiGlobalKillSwitch,
  };
}
