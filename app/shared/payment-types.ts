import { z } from 'zod';

export const PaymentRegion = z.enum(['AUTO', 'EGYPT', 'UAE', 'KSA']);
export type PaymentRegion = z.infer<typeof PaymentRegion>;

export const PaymentCurrency = z.enum(['AUTO', 'EGP', 'AED', 'SAR', 'USD']);
export type PaymentCurrency = z.infer<typeof PaymentCurrency>;

export const PaymentType = z.enum(['PAYMENT', 'SUBSCRIPTION', 'PAYOUT']);
export type PaymentType = z.infer<typeof PaymentType>;

export const PaymentStatus = z.enum(['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED']);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const PaymentGateway = z.enum([
  'PAYMOB', 'FAWRY', 'MEEZA', 'INSTAPAY', 'PAYSKY',
  'PAYTABS', 'TELR', 'AMAZON_PAYMENT_SERVICES',
  'STC_PAY', 'MADA', 'HYPERPAY',
  'APPLE_PAY', 'GOOGLE_PAY',
  'STRIPE'
]);
export type PaymentGateway = z.infer<typeof PaymentGateway>;

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const PaymentMetadataSchema = z.object({
  order_id: z.string().optional(),
  notes: z.string().optional(),
  product_id: z.string().optional(),
  subscription_id: z.string().optional(),
}).passthrough();
export type PaymentMetadata = z.infer<typeof PaymentMetadataSchema>;

export const CallbackUrlsSchema = z.object({
  success: z.string().url(),
  failure: z.string().url(),
  webhook: z.string().url().optional(),
});
export type CallbackUrls = z.infer<typeof CallbackUrlsSchema>;

export const UnifiedPaymentContractSchema = z.object({
  platform_id: z.string(),
  company_region: PaymentRegion.default('AUTO'),
  payment_type: PaymentType,
  amount: z.number().positive(),
  currency: PaymentCurrency.default('AUTO'),
  customer: CustomerSchema,
  metadata: PaymentMetadataSchema.optional(),
  callback_urls: CallbackUrlsSchema,
  idempotency_key: z.string().optional(),
});
export type UnifiedPaymentContract = z.infer<typeof UnifiedPaymentContractSchema>;

export const PaymentCreateResponseSchema = z.object({
  status: PaymentStatus,
  transaction_id: z.string(),
  payment_url: z.string().url().optional(),
  gateway: PaymentGateway,
  expires_at: z.string().datetime().optional(),
});
export type PaymentCreateResponse = z.infer<typeof PaymentCreateResponseSchema>;

export const PaymentCallbackResponseSchema = z.object({
  transaction_id: z.string(),
  status: PaymentStatus,
  amount: z.number(),
  currency: PaymentCurrency,
  gateway: PaymentGateway,
  gateway_reference: z.string().optional(),
  paid_at: z.string().datetime().optional(),
});
export type PaymentCallbackResponse = z.infer<typeof PaymentCallbackResponseSchema>;

export const RefundRequestSchema = z.object({
  transaction_id: z.string(),
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
  idempotency_key: z.string().optional(),
});
export type RefundRequest = z.infer<typeof RefundRequestSchema>;

export const RefundResponseSchema = z.object({
  refund_id: z.string(),
  transaction_id: z.string(),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED']),
  amount: z.number(),
  currency: PaymentCurrency,
});
export type RefundResponse = z.infer<typeof RefundResponseSchema>;

export const PayoutRequestSchema = z.object({
  platform_id: z.string(),
  recipient: z.object({
    id: z.string(),
    name: z.string(),
    bank_account: z.string().optional(),
    iban: z.string().optional(),
    mobile_wallet: z.string().optional(),
  }),
  amount: z.number().positive(),
  currency: PaymentCurrency,
  metadata: PaymentMetadataSchema.optional(),
  idempotency_key: z.string().optional(),
});
export type PayoutRequest = z.infer<typeof PayoutRequestSchema>;

export const PayoutResponseSchema = z.object({
  payout_id: z.string(),
  status: z.enum(['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED']),
  amount: z.number(),
  currency: PaymentCurrency,
  estimated_arrival: z.string().datetime().optional(),
});
export type PayoutResponse = z.infer<typeof PayoutResponseSchema>;

export interface RegionConfig {
  currency: PaymentCurrency;
  gateways: PaymentGateway[];
  fallback_gateway?: PaymentGateway;
}

export interface PaymentRoutingConfig {
  regions: Record<Exclude<PaymentRegion, 'AUTO'>, RegionConfig>;
  default_region: Exclude<PaymentRegion, 'AUTO'>;
  gateway_priority: Record<PaymentGateway, number>;
}
