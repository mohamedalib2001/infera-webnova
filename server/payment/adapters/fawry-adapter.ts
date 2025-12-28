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

export class FawryAdapter extends BasePaymentAdapter {
  readonly gateway: PaymentGateway = 'FAWRY';

  async createPayment(contract: UnifiedPaymentContract): Promise<PaymentCreateResponse> {
    this.ensureInitialized();
    
    const transactionId = this.generateTransactionId();
    const referenceNumber = Math.random().toString().substr(2, 10);
    
    return {
      status: 'PENDING',
      transaction_id: transactionId,
      payment_url: `https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments/status?referenceNumber=${referenceNumber}`,
      gateway: this.gateway,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  async handleCallback(payload: unknown, headers: Record<string, string>): Promise<PaymentCallbackResponse> {
    this.ensureInitialized();
    
    const data = payload as Record<string, unknown>;
    
    return {
      transaction_id: String(data.merchantRefNum || data.fawryRefNumber || 'unknown'),
      status: data.paymentStatus === 'PAID' ? 'SUCCESS' : 
              data.paymentStatus === 'EXPIRED' ? 'CANCELLED' : 'FAILED',
      amount: Number(data.paymentAmount || 0),
      currency: 'EGP',
      gateway: this.gateway,
      gateway_reference: String(data.fawryRefNumber || ''),
      paid_at: data.paymentStatus === 'PAID' ? new Date().toISOString() : undefined
    };
  }

  async verifySignature(payload: unknown, signature: string): Promise<boolean> {
    this.ensureInitialized();
    
    if (!this.config?.secret_key) return false;
    
    const data = payload as Record<string, unknown>;
    const signatureString = `${data.fawryRefNumber}${data.merchantRefNum}${data.paymentAmount}${data.orderAmount}${data.orderStatus}${data.paymentMethod}${data.paymentRefrenceNumber}${this.config.secret_key}`;
    
    const expectedSignature = crypto
      .createHash('sha256')
      .update(signatureString)
      .digest('hex');
    
    return signature.toLowerCase() === expectedSignature.toLowerCase();
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
