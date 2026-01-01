import type {
  UnifiedPaymentContract,
  PaymentCreateResponse,
  PaymentCallbackResponse,
  RefundRequest,
  RefundResponse,
  PayoutRequest,
  PayoutResponse,
  PaymentGateway
} from '@shared/payment-types';

export interface PaymentAdapterConfig {
  api_key?: string;
  secret_key?: string;
  merchant_id?: string;
  environment: 'sandbox' | 'production';
  webhook_secret?: string;
  additional_config?: Record<string, unknown>;
}

export interface PaymentAdapter {
  readonly gateway: PaymentGateway;
  
  initialize(config: PaymentAdapterConfig): Promise<void>;
  
  createPayment(contract: UnifiedPaymentContract): Promise<PaymentCreateResponse>;
  
  handleCallback(payload: unknown, headers: Record<string, string>): Promise<PaymentCallbackResponse>;
  
  verifySignature(payload: unknown, signature: string): Promise<boolean>;
  
  refund(request: RefundRequest): Promise<RefundResponse>;
  
  payout(request: PayoutRequest): Promise<PayoutResponse>;
  
  getTransactionStatus(transactionId: string): Promise<PaymentCallbackResponse>;
  
  healthCheck(): Promise<boolean>;
}

export abstract class BasePaymentAdapter implements PaymentAdapter {
  abstract readonly gateway: PaymentGateway;
  protected config: PaymentAdapterConfig | null = null;
  protected initialized = false;

  async initialize(config: PaymentAdapterConfig): Promise<void> {
    this.config = config;
    this.initialized = true;
  }

  protected ensureInitialized(): void {
    if (!this.initialized || !this.config) {
      throw new Error(`${this.gateway} adapter not initialized. Call initialize() first.`);
    }
  }

  protected generateTransactionId(): string {
    return `TX_${this.gateway}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  abstract createPayment(contract: UnifiedPaymentContract): Promise<PaymentCreateResponse>;
  abstract handleCallback(payload: unknown, headers: Record<string, string>): Promise<PaymentCallbackResponse>;
  abstract verifySignature(payload: unknown, signature: string): Promise<boolean>;
  abstract refund(request: RefundRequest): Promise<RefundResponse>;
  abstract payout(request: PayoutRequest): Promise<PayoutResponse>;
  abstract getTransactionStatus(transactionId: string): Promise<PaymentCallbackResponse>;

  async healthCheck(): Promise<boolean> {
    return this.initialized && this.config !== null;
  }
}

export class AdapterNotImplementedError extends Error {
  constructor(gateway: PaymentGateway, method: string) {
    super(`${method} not implemented for ${gateway} adapter`);
    this.name = 'AdapterNotImplementedError';
  }
}
