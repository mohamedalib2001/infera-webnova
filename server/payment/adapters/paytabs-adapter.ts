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

export class PayTabsAdapter extends BasePaymentAdapter {
  readonly gateway: PaymentGateway = 'PAYTABS';

  async createPayment(contract: UnifiedPaymentContract): Promise<PaymentCreateResponse> {
    this.ensureInitialized();
    
    const transactionId = this.generateTransactionId();
    
    return {
      status: 'PENDING',
      transaction_id: transactionId,
      payment_url: `https://secure.paytabs.com/payment/page/${transactionId}`,
      gateway: this.gateway,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };
  }

  async handleCallback(payload: unknown, headers: Record<string, string>): Promise<PaymentCallbackResponse> {
    this.ensureInitialized();
    
    const data = payload as Record<string, unknown>;
    
    return {
      transaction_id: String(data.cart_id || data.tran_ref || 'unknown'),
      status: data.respStatus === 'A' ? 'SUCCESS' : 'FAILED',
      amount: Number(data.cart_amount || 0),
      currency: String(data.cart_currency || 'AED') as any,
      gateway: this.gateway,
      gateway_reference: String(data.tran_ref || ''),
      paid_at: data.respStatus === 'A' ? new Date().toISOString() : undefined
    };
  }

  async verifySignature(payload: unknown, signature: string): Promise<boolean> {
    this.ensureInitialized();
    
    if (!this.config?.secret_key) return false;
    
    const data = JSON.stringify(payload);
    const expectedSignature = crypto
      .createHmac('sha256', this.config.secret_key)
      .update(data)
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
      currency: 'AED'
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
      currency: 'AED',
      gateway: this.gateway
    };
  }
}
