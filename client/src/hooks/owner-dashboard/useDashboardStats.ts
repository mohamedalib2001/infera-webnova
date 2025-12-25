import { useMemo } from "react";
import type { User, PaymentMethod, AuthMethod } from "@shared/schema";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  paidUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  activePaymentGateways: number;
  activeAuthMethods: number;
}

export function useDashboardStats(
  users: User[],
  paymentMethods: PaymentMethod[],
  authMethods: AuthMethod[]
): DashboardStats {
  return useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const paidUsers = users.filter(u => u.subscriptionTier !== 'free').length;
    const suspendedUsers = users.filter(u => u.status === 'suspended').length;
    const bannedUsers = users.filter(u => u.status === 'banned').length;
    const activePaymentGateways = paymentMethods.filter(m => m.isActive).length;
    const activeAuthMethods = authMethods.filter(m => m.isActive).length;

    return {
      totalUsers,
      activeUsers,
      paidUsers,
      suspendedUsers,
      bannedUsers,
      activePaymentGateways,
      activeAuthMethods,
    };
  }, [users, paymentMethods, authMethods]);
}
