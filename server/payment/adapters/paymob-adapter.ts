import { BasePaymentAdapter, AdapterNotImplementedError, type PaymentAdapterConfig } from '../adapter-interface';
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
import crypto from 'crypto';

export class PaymobAdapter extends BasePaymentAdapter {
  readonly gateway: PaymentGateway = 'PAYMOB';
  private authToken: string | null = null;

  async initialize(config: PaymentAdapterConfig): Promise<void> {
    await super.initialize(config);
  }

  async createPayment(contract: UnifiedPaymentContract): Promise<PaymentCreateResponse> {
    this.ensureInitialized();
    
    const transactionId = this.generateTransactionId();
    
    return {
      status: 'PENDING',
      transaction_id: transactionId,
      payment_url: `https://accept.paymob.com/api/acceptance/iframes/${this.config?.additional_config?.iframe_id}?payment_token=mock_token`,
      gateway: this.gateway,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
  }

  async handleCallback(payload: unknown, headers: Record<string, string>): Promise<PaymentCallbackResponse> {
    this.ensureInitialized();
    
    const data = payload as Record<string, unknown>;
    const obj = data.obj as Record<string, unknown> || data;
    
    return {
      transaction_id: String(obj.order?.merchant_order_id || obj.id || 'unknown'),
      status: obj.success ? 'SUCCESS' : 'FAILED',
      amount: Number(obj.amount_cents || 0) / 100,
      currency: 'EGP',
      gateway: this.gateway,
      gateway_reference: String(obj.id || ''),
      paid_at: obj.success ? new Date().toISOString() : undefined
    };
  }

  async verifySignature(payload: unknown, signature: string): Promise<boolean> {
    this.ensureInitialized();
    
    if (!this.config?.webhook_secret) return false;
    
    const data = payload as Record<string, unknown>;
    const hmacKeys = [
      'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction',
      'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded',
      'is_standalone_payment', 'is_voided', 'order.id', 'owner', 'pending',
      'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success'
    ];
    
    const obj = data.obj as Record<string, unknown> || data;
    const concatenatedString = hmacKeys.map(key => {
      const keys = key.split('.');
      let value: unknown = obj;
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k];
      }
      return String(value ?? '');
    }).join('');
    
    const expectedSignature = crypto
      .createHmac('sha512', this.config.webhook_secret)
      .update(concatenatedString)
      .digest('hex');
    
    return signature === expectedSignature;
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    this.ensureInitialized();
    
    return {
      refund_id: `RF_${this.gateway}_${Date.now()}`,
      transaction_id: request.transaction_id,
      status: 'PENDING',
      amount: request.amount || 0,
      currency: 'EGP'
    };
  }

  async payout(request: PayoutRequest): Promise<PayoutResponse> {
    throw new AdapterNotImplementedError(this.gateway, 'payout');
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentCallbackResponse> {
    this.ensureInitialized();
    
    return {
      transaction_id: transactionId,
      status: 'PENDING',
      amount: 0,
      currency: 'EGP',
      gateway: this.gateway
    };
  }
}
