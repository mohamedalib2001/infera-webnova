import { getUncachableStripeClient, getStripePublishableKey } from './stripeClient';
import { storage } from './storage';
import type { User, SubscriptionPlan, UserSubscription } from '@shared/schema';

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
}

export const paymentService = new PaymentService();
