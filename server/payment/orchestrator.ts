import crypto from 'crypto';
import {
  UnifiedPaymentContractSchema,
  RefundRequestSchema,
  PayoutRequestSchema,
  type UnifiedPaymentContract,
  type PaymentCreateResponse,
  type PaymentCallbackResponse,
  type RefundRequest,
  type RefundResponse,
  type PayoutRequest,
  type PayoutResponse,
  type PaymentGateway,
  type PaymentRegion
} from '@shared/payment-types';
import { paymentRouter } from './routing-config';
import { getAdapter, isGatewaySupported } from './adapters';

interface IdempotencyEntry {
  key: string;
  response: unknown;
  createdAt: Date;
  expiresAt: Date;
}

class PaymentOrchestrator {
  private idempotencyCache: Map<string, IdempotencyEntry> = new Map();
  private readonly IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000;

  async createPayment(contract: UnifiedPaymentContract): Promise<PaymentCreateResponse> {
    const validated = UnifiedPaymentContractSchema.parse(contract);
    
    if (validated.idempotency_key) {
      const cached = this.checkIdempotency(validated.idempotency_key);
      if (cached) {
        console.log(`[Payment Orchestrator] Returning cached response for idempotency key: ${validated.idempotency_key}`);
        return cached as PaymentCreateResponse;
      }
    }
    
    const region = paymentRouter.resolveRegion(validated.company_region);
    const currency = paymentRouter.resolveCurrency(validated.currency, region);
    
    const gateway = paymentRouter.selectGateway(region);
    
    if (!isGatewaySupported(gateway)) {
      throw new Error(`Gateway ${gateway} is not supported in region ${region}`);
    }
    
    const adapter = await getAdapter(gateway);
    if (!adapter) {
      throw new Error(`Failed to initialize adapter for gateway: ${gateway}`);
    }
    
    const enrichedContract: UnifiedPaymentContract = {
      ...validated,
      company_region: region,
      currency: currency,
    };
    
    console.log(`[Payment Orchestrator] Creating payment via ${gateway} for ${region} in ${currency}`);
    
    const response = await adapter.createPayment(enrichedContract);
    
    if (validated.idempotency_key) {
      this.storeIdempotency(validated.idempotency_key, response);
    }
    
    return response;
  }

  async handleCallback(
    gateway: PaymentGateway,
    payload: unknown,
    headers: Record<string, string>
  ): Promise<PaymentCallbackResponse> {
    const adapter = await getAdapter(gateway);
    if (!adapter) {
      throw new Error(`No adapter available for gateway: ${gateway}`);
    }
    
    const signature = headers['x-signature'] || headers['hmac'] || headers['signature'] || '';
    
    if (signature) {
      const isValid = await adapter.verifySignature(payload, signature);
      if (!isValid) {
        console.error(`[Payment Orchestrator] Invalid signature for ${gateway} callback`);
        throw new Error('Invalid callback signature');
      }
    }
    
    console.log(`[Payment Orchestrator] Processing callback from ${gateway}`);
    
    return adapter.handleCallback(payload, headers);
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    const validated = RefundRequestSchema.parse(request);
    
    if (validated.idempotency_key) {
      const cached = this.checkIdempotency(validated.idempotency_key);
      if (cached) {
        return cached as RefundResponse;
      }
    }
    
    const gateway = this.extractGatewayFromTransactionId(validated.transaction_id);
    
    const adapter = await getAdapter(gateway);
    if (!adapter) {
      throw new Error(`No adapter available for gateway: ${gateway}`);
    }
    
    console.log(`[Payment Orchestrator] Processing refund via ${gateway}`);
    
    const response = await adapter.refund(validated);
    
    if (validated.idempotency_key) {
      this.storeIdempotency(validated.idempotency_key, response);
    }
    
    return response;
  }

  async payout(request: PayoutRequest): Promise<PayoutResponse> {
    const validated = PayoutRequestSchema.parse(request);
    
    if (validated.idempotency_key) {
      const cached = this.checkIdempotency(validated.idempotency_key);
      if (cached) {
        return cached as PayoutResponse;
      }
    }
    
    const region = this.getCurrencyRegion(validated.currency);
    const gateway = paymentRouter.selectGateway(region);
    
    const adapter = await getAdapter(gateway);
    if (!adapter) {
      throw new Error(`No adapter available for gateway: ${gateway}`);
    }
    
    console.log(`[Payment Orchestrator] Processing payout via ${gateway}`);
    
    const response = await adapter.payout(validated);
    
    if (validated.idempotency_key) {
      this.storeIdempotency(validated.idempotency_key, response);
    }
    
    return response;
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentCallbackResponse> {
    const gateway = this.extractGatewayFromTransactionId(transactionId);
    
    const adapter = await getAdapter(gateway);
    if (!adapter) {
      throw new Error(`No adapter available for gateway: ${gateway}`);
    }
    
    return adapter.getTransactionStatus(transactionId);
  }

  async getHealthStatus(): Promise<Record<PaymentGateway, boolean>> {
    const gateways: PaymentGateway[] = ['PAYMOB', 'FAWRY', 'PAYTABS', 'STC_PAY', 'MADA', 'HYPERPAY'];
    const status: Record<string, boolean> = {};
    
    await Promise.all(
      gateways.map(async (gateway) => {
        try {
          const adapter = await getAdapter(gateway);
          status[gateway] = adapter ? await adapter.healthCheck() : false;
        } catch {
          status[gateway] = false;
        }
      })
    );
    
    return status as Record<PaymentGateway, boolean>;
  }

  getRoutingConfig() {
    return paymentRouter.getConfig();
  }

  getAvailableGateways(region: Exclude<PaymentRegion, 'AUTO'>): PaymentGateway[] {
    return paymentRouter.getAvailableGateways(region);
  }

  private extractGatewayFromTransactionId(transactionId: string): PaymentGateway {
    const parts = transactionId.split('_');
    if (parts.length >= 2) {
      const gateway = parts[1] as PaymentGateway;
      if (isGatewaySupported(gateway)) {
        return gateway;
      }
    }
    return 'PAYMOB';
  }

  private getCurrencyRegion(currency: string): Exclude<PaymentRegion, 'AUTO'> {
    switch (currency) {
      case 'EGP': return 'EGYPT';
      case 'AED': return 'UAE';
      case 'SAR': return 'KSA';
      default: return 'KSA';
    }
  }

  private checkIdempotency(key: string): unknown | null {
    const entry = this.idempotencyCache.get(key);
    if (entry && entry.expiresAt > new Date()) {
      return entry.response;
    }
    if (entry) {
      this.idempotencyCache.delete(key);
    }
    return null;
  }

  private storeIdempotency(key: string, response: unknown): void {
    const now = new Date();
    this.idempotencyCache.set(key, {
      key,
      response,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.IDEMPOTENCY_TTL)
    });
  }

  generateIdempotencyKey(): string {
    return `IK_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
}

export const paymentOrchestrator = new PaymentOrchestrator();
