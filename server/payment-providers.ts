export interface PaymentProviderConfig {
  id: string;
  name: string;
  nameAr: string;
  status: 'active' | 'configured' | 'inactive';
  isDefault: boolean;
  supportsSubscriptions: boolean;
  supportsRefunds: boolean;
  supportsWebhooks: boolean;
  requiresManualSettlement: boolean;
}

export interface PaymentProviderAdapter {
  readonly providerId: string;
  readonly config: PaymentProviderConfig;
  
  createCharge(amount: number, currency: string, metadata: Record<string, any>): Promise<any>;
  createSubscription?(customerId: string, priceId: string): Promise<any>;
  cancelSubscription?(subscriptionId: string): Promise<void>;
  refund?(paymentId: string, amount?: number): Promise<any>;
  verifyWebhook?(payload: Buffer, signature: string): Promise<boolean>;
}

export class StripeAdapter implements PaymentProviderAdapter {
  readonly providerId = 'stripe';
  readonly config: PaymentProviderConfig = {
    id: 'stripe',
    name: 'Stripe',
    nameAr: 'سترايب',
    status: 'active',
    isDefault: true,
    supportsSubscriptions: true,
    supportsRefunds: true,
    supportsWebhooks: true,
    requiresManualSettlement: false,
  };

  async createCharge(amount: number, currency: string, metadata: Record<string, any>) {
    const { getUncachableStripeClient } = await import('./stripeClient');
    const stripe = await getUncachableStripeClient();
    return stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata,
    });
  }

  async createSubscription(customerId: string, priceId: string) {
    const { getUncachableStripeClient } = await import('./stripeClient');
    const stripe = await getUncachableStripeClient();
    return stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
    });
  }

  async cancelSubscription(subscriptionId: string) {
    const { getUncachableStripeClient } = await import('./stripeClient');
    const stripe = await getUncachableStripeClient();
    await stripe.subscriptions.cancel(subscriptionId);
  }

  async refund(paymentId: string, amount?: number) {
    const { getUncachableStripeClient } = await import('./stripeClient');
    const stripe = await getUncachableStripeClient();
    return stripe.refunds.create({
      payment_intent: paymentId,
      amount,
    });
  }

  async verifyWebhook(payload: Buffer, signature: string) {
    return true;
  }
}

export class PayPalAdapter implements PaymentProviderAdapter {
  readonly providerId = 'paypal';
  readonly config: PaymentProviderConfig = {
    id: 'paypal',
    name: 'PayPal',
    nameAr: 'باي بال',
    status: 'configured',
    isDefault: false,
    supportsSubscriptions: true,
    supportsRefunds: true,
    supportsWebhooks: true,
    requiresManualSettlement: false,
  };

  async createCharge(amount: number, currency: string, metadata: Record<string, any>) {
    console.log('[PayPal] Creating charge:', { amount, currency });
    return {
      id: `paypal_${Date.now()}`,
      status: 'pending',
      approvalUrl: 'https://sandbox.paypal.com/approval',
    };
  }

  async createSubscription(customerId: string, priceId: string) {
    console.log('[PayPal] Creating subscription:', { customerId, priceId });
    return {
      id: `paypal_sub_${Date.now()}`,
      status: 'pending',
    };
  }

  async cancelSubscription(subscriptionId: string) {
    console.log('[PayPal] Cancelling subscription:', subscriptionId);
  }

  async refund(paymentId: string, amount?: number) {
    console.log('[PayPal] Creating refund:', { paymentId, amount });
    return {
      id: `paypal_refund_${Date.now()}`,
      status: 'completed',
    };
  }

  async verifyWebhook(payload: Buffer, signature: string) {
    return true;
  }
}

export class BankTransferAdapter implements PaymentProviderAdapter {
  readonly providerId = 'bank_transfer';
  readonly config: PaymentProviderConfig = {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    nameAr: 'تحويل بنكي',
    status: 'configured',
    isDefault: false,
    supportsSubscriptions: false,
    supportsRefunds: false,
    supportsWebhooks: false,
    requiresManualSettlement: true,
  };

  async createCharge(amount: number, currency: string, metadata: Record<string, any>) {
    return {
      id: `bank_${Date.now()}`,
      status: 'pending_verification',
      instructions: {
        bankName: 'Al Rajhi Bank',
        accountNumber: 'XXXX-XXXX-XXXX-1234',
        iban: 'SA00 0000 0000 0000 0000 0000',
        reference: `INF-${Date.now()}`,
      },
    };
  }
}

export class CustomAdapter implements PaymentProviderAdapter {
  readonly providerId = 'custom';
  readonly config: PaymentProviderConfig = {
    id: 'custom',
    name: 'Custom Provider',
    nameAr: 'مزود مخصص',
    status: 'inactive',
    isDefault: false,
    supportsSubscriptions: false,
    supportsRefunds: false,
    supportsWebhooks: false,
    requiresManualSettlement: true,
  };

  async createCharge(amount: number, currency: string, metadata: Record<string, any>) {
    return {
      id: `custom_${Date.now()}`,
      status: 'pending',
    };
  }
}

export class PaymentProviderRegistry {
  private adapters: Map<string, PaymentProviderAdapter> = new Map();
  private defaultProviderId: string = 'stripe';

  constructor() {
    this.register(new StripeAdapter());
    this.register(new PayPalAdapter());
    this.register(new BankTransferAdapter());
    this.register(new CustomAdapter());
  }

  register(adapter: PaymentProviderAdapter) {
    this.adapters.set(adapter.providerId, adapter);
    if (adapter.config.isDefault) {
      this.defaultProviderId = adapter.providerId;
    }
  }

  get(providerId: string): PaymentProviderAdapter | undefined {
    return this.adapters.get(providerId);
  }

  getDefault(): PaymentProviderAdapter {
    return this.adapters.get(this.defaultProviderId)!;
  }

  setDefault(providerId: string): boolean {
    if (this.adapters.has(providerId)) {
      this.defaultProviderId = providerId;
      return true;
    }
    return false;
  }

  listAll(): PaymentProviderConfig[] {
    return Array.from(this.adapters.values()).map(a => a.config);
  }

  listActive(): PaymentProviderConfig[] {
    return this.listAll().filter(c => c.status === 'active' || c.status === 'configured');
  }

  getConfig(providerId: string): PaymentProviderConfig | undefined {
    return this.adapters.get(providerId)?.config;
  }
}

export const paymentProviderRegistry = new PaymentProviderRegistry();
