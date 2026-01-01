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

export class MadaAdapter extends BasePaymentAdapter {
  readonly gateway: PaymentGateway = 'MADA';

  async createPayment(contract: UnifiedPaymentContract): Promise<PaymentCreateResponse> {
    this.ensureInitialized();
    
    const transactionId = this.generateTransactionId();
    
    return {
      status: 'PENDING',
      transaction_id: transactionId,
      payment_url: `https://mada.com.sa/checkout/${transactionId}`,
      gateway: this.gateway,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  }

  async handleCallback(payload: unknown, headers: Record<string, string>): Promise<PaymentCallbackResponse> {
    this.ensureInitialized();
    
    const data = payload as Record<string, unknown>;
    
    return {
      transaction_id: String(data.merchantRefNum || data.transactionId || 'unknown'),
      status: data.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
      amount: Number(data.amount || 0),
      currency: 'SAR',
      gateway: this.gateway,
      gateway_reference: String(data.refNum || ''),
      paid_at: data.status === 'SUCCESS' ? new Date().toISOString() : undefined
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
      currency: 'SAR'
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
      currency: 'SAR',
      gateway: this.gateway
    };
  }
}
