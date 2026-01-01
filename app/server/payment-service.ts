import { getUncachableStripeClient, getStripePublishableKey } from './stripeClient';
import { storage } from './storage';
import type { User, SubscriptionPlan, UserSubscription, BillingProfile } from '@shared/schema';

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface CustomerPortalResult {
  url: string;
}

export class PaymentService {
  async createCustomer(user: User): Promise<string> {
    const stripe = await getUncachableStripeClient();
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.username || undefined,
      metadata: {
        userId: user.id,
        role: user.role,
      },
    });
    return customer.id;
  }

  async createCheckoutSession(
    user: User,
    plan: SubscriptionPlan,
    billingCycle: 'monthly' | 'quarterly' | 'semi_annual' | 'yearly',
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSessionResult> {
    const stripe = await getUncachableStripeClient();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      customerId = await this.createCustomer(user);
      await storage.updateUser(user.id, { stripeCustomerId: customerId });
    }

    const priceAmount = this.getPriceForCycle(plan, billingCycle);
    const interval = this.getStripeInterval(billingCycle);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: plan.currency.toLowerCase(),
          product_data: {
            name: plan.name,
            description: plan.description || undefined,
            metadata: {
              planId: plan.id,
              role: plan.role,
            },
          },
          unit_amount: priceAmount,
          recurring: { interval },
        },
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        planId: plan.id,
        billingCycle,
      },
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  }

  async createCustomerPortalSession(user: User, returnUrl: string): Promise<CustomerPortalResult> {
    const stripe = await getUncachableStripeClient();

    if (!user.stripeCustomerId) {
      throw new Error('User has no Stripe customer ID');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const stripe = await getUncachableStripeClient();
    await stripe.subscriptions.cancel(subscriptionId);
  }

  async pauseSubscription(subscriptionId: string): Promise<void> {
    const stripe = await getUncachableStripeClient();
    await stripe.subscriptions.update(subscriptionId, {
      pause_collection: { behavior: 'mark_uncollectible' },
    });
  }

  async resumeSubscription(subscriptionId: string): Promise<void> {
    const stripe = await getUncachableStripeClient();
    await stripe.subscriptions.update(subscriptionId, {
      pause_collection: null as any,
    });
  }

  async createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<any> {
    const stripe = await getUncachableStripeClient();
    return stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason: reason as any,
    });
  }

  async getPublishableKey(): Promise<string> {
    return getStripePublishableKey();
  }

  private getPriceForCycle(plan: SubscriptionPlan, cycle: string): number {
    switch (cycle) {
      case 'quarterly':
        return plan.priceQuarterly;
      case 'semi_annual':
        return plan.priceSemiAnnual;
      case 'yearly':
        return plan.priceYearly;
      default:
        return plan.priceMonthly;
    }
  }

  private getStripeInterval(cycle: string): 'month' | 'year' {
    if (cycle === 'yearly') return 'year';
    return 'month';
  }

  async getSubscriptionDetails(subscriptionId: string): Promise<any> {
    const stripe = await getUncachableStripeClient();
    return stripe.subscriptions.retrieve(subscriptionId);
  }

  async listInvoices(customerId: string, limit = 10): Promise<any[]> {
    const stripe = await getUncachableStripeClient();
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });
    return invoices.data;
  }

  async getInvoice(invoiceId: string): Promise<any> {
    const stripe = await getUncachableStripeClient();
    return stripe.invoices.retrieve(invoiceId);
  }

  async getUpcomingInvoice(customerId: string): Promise<any> {
    const stripe = await getUncachableStripeClient();
    return stripe.invoices.list({ customer: customerId, status: 'open', limit: 1 }).then(r => r.data[0] || null);
  }

  // ==================== SUBSCRIPTION LIFECYCLE ====================

  async cancelAtPeriodEnd(subscriptionId: string): Promise<void> {
    const stripe = await getUncachableStripeClient();
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

  async reactivateSubscription(subscriptionId: string): Promise<void> {
    const stripe = await getUncachableStripeClient();
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  async upgradeSubscription(
    user: User,
    currentSubscriptionId: string,
    newPlan: SubscriptionPlan,
    billingCycle: 'monthly' | 'quarterly' | 'semi_annual' | 'yearly'
  ): Promise<{ success: boolean; message: string }> {
    const stripe = await getUncachableStripeClient();
    
    try {
      const subscription = await stripe.subscriptions.retrieve(currentSubscriptionId);
      const priceAmount = this.getPriceForCycle(newPlan, billingCycle);
      const interval = this.getStripeInterval(billingCycle);

      const product = await stripe.products.create({
        name: newPlan.name,
        description: newPlan.description || undefined,
        metadata: {
          planId: newPlan.id,
          role: newPlan.role,
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceAmount,
        currency: newPlan.currency.toLowerCase(),
        recurring: { interval },
      });

      await stripe.subscriptions.update(currentSubscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: price.id,
        }],
        proration_behavior: 'create_prorations',
      });

      await storage.createSubscriptionEvent({
        userId: user.id,
        subscriptionId: currentSubscriptionId,
        eventType: 'plan_upgraded',
        newPlan: newPlan.name,
        newPrice: priceAmount,
      });

      return { success: true, message: 'Subscription upgraded successfully' };
    } catch (error: any) {
      console.error('[Payment] Upgrade error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async downgradeSubscription(
    user: User,
    currentSubscriptionId: string,
    newPlan: SubscriptionPlan,
    billingCycle: 'monthly' | 'quarterly' | 'semi_annual' | 'yearly'
  ): Promise<{ success: boolean; message: string }> {
    const stripe = await getUncachableStripeClient();
    
    try {
      const subscription = await stripe.subscriptions.retrieve(currentSubscriptionId);
      const priceAmount = this.getPriceForCycle(newPlan, billingCycle);
      const interval = this.getStripeInterval(billingCycle);

      const product = await stripe.products.create({
        name: newPlan.name,
        description: newPlan.description || undefined,
        metadata: {
          planId: newPlan.id,
          role: newPlan.role,
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceAmount,
        currency: newPlan.currency.toLowerCase(),
        recurring: { interval },
      });

      await stripe.subscriptions.update(currentSubscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: price.id,
        }],
        proration_behavior: 'none',
        billing_cycle_anchor: 'unchanged',
      });

      await storage.createSubscriptionEvent({
        userId: user.id,
        subscriptionId: currentSubscriptionId,
        eventType: 'plan_downgraded',
        newPlan: newPlan.name,
        newPrice: priceAmount,
      });

      return { success: true, message: 'Subscription downgraded - changes apply at next billing cycle' };
    } catch (error: any) {
      console.error('[Payment] Downgrade error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // ==================== REVENUE ANALYTICS ====================

  async getRevenueStats(customerId?: string): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
    cancelledSubscriptions: number;
    failedPayments: number;
    avgRevenuePerUser: number;
  }> {
    const stripe = await getUncachableStripeClient();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
      const [charges, subscriptions] = await Promise.all([
        stripe.charges.list({ limit: 100 }),
        stripe.subscriptions.list({ limit: 100, status: 'all' }),
      ]);

      const totalRevenue = charges.data
        .filter(c => c.status === 'succeeded')
        .reduce((sum, c) => sum + c.amount, 0);

      const monthlyRevenue = charges.data
        .filter(c => c.status === 'succeeded' && new Date(c.created * 1000) >= startOfMonth)
        .reduce((sum, c) => sum + c.amount, 0);

      const activeSubscriptions = subscriptions.data.filter(s => s.status === 'active').length;
      const cancelledSubscriptions = subscriptions.data.filter(s => s.status === 'canceled').length;
      const failedPayments = charges.data.filter(c => c.status === 'failed').length;
      
      const avgRevenuePerUser = activeSubscriptions > 0 
        ? Math.round(totalRevenue / activeSubscriptions) 
        : 0;

      return {
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions,
        cancelledSubscriptions,
        failedPayments,
        avgRevenuePerUser,
      };
    } catch (error: any) {
      console.error('[Payment] Stats error:', error.message);
      return {
        totalRevenue: 0,
        monthlyRevenue: 0,
        activeSubscriptions: 0,
        cancelledSubscriptions: 0,
        failedPayments: 0,
        avgRevenuePerUser: 0,
      };
    }
  }

  // ==================== PAYMENT METHODS ====================

  async getPaymentMethods(customerId: string): Promise<any[]> {
    const stripe = await getUncachableStripeClient();
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return methods.data;
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    const stripe = await getUncachableStripeClient();
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    const stripe = await getUncachableStripeClient();
    await stripe.paymentMethods.detach(paymentMethodId);
  }

  // ==================== BILLING PROFILES ====================

  async getBillingProfile(userId: string): Promise<BillingProfile | null> {
    const profiles = await storage.getBillingProfilesByUser(userId);
    return profiles.find(p => p.isDefault) || profiles[0] || null;
  }

  async updateBillingProfile(userId: string, data: Partial<BillingProfile>): Promise<BillingProfile> {
    const profiles = await storage.getBillingProfilesByUser(userId);
    const defaultProfile = profiles.find(p => p.isDefault) || profiles[0];
    
    if (defaultProfile) {
      return storage.updateBillingProfile(defaultProfile.id, data);
    }
    
    return storage.createBillingProfile({
      userId,
      ...data,
    } as any);
  }

  // ==================== RETRY FAILED PAYMENTS ====================

  async retryFailedPayment(invoiceId: string): Promise<{ success: boolean; message: string }> {
    const stripe = await getUncachableStripeClient();
    
    try {
      const invoice = await stripe.invoices.pay(invoiceId);
      return {
        success: invoice.status === 'paid',
        message: invoice.status === 'paid' ? 'Payment successful' : 'Payment still pending',
      };
    } catch (error: any) {
      console.error('[Payment] Retry error:', error.message);
      return { success: false, message: error.message };
    }
  }

  // ==================== PRORATION PREVIEW ====================

  async getProrationPreview(
    subscriptionId: string,
    newPriceId: string
  ): Promise<{ prorationAmount: number; nextBillingDate: Date }> {
    const stripe = await getUncachableStripeClient();
    
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
      const upcomingInvoice = await (stripe.invoices as any).retrieveUpcoming({
        customer: subscription.customer as string,
        subscription: subscriptionId,
      });

      return {
        prorationAmount: upcomingInvoice.amount_due,
        nextBillingDate: new Date(subscription.current_period_end * 1000),
      };
    } catch (error: any) {
      console.error('[Payment] Proration preview error:', error.message);
      return { prorationAmount: 0, nextBillingDate: new Date() };
    }
  }
}

export const paymentService = new PaymentService();
