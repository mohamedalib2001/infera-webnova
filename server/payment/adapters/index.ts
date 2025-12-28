import type { PaymentAdapter, PaymentAdapterConfig } from '../adapter-interface';
import type { PaymentGateway } from '@shared/payment-types';

import { PaymobAdapter } from './paymob-adapter';
import { PayTabsAdapter } from './paytabs-adapter';
import { STCPayAdapter } from './stc-pay-adapter';
import { HyperPayAdapter } from './hyperpay-adapter';
import { MadaAdapter } from './mada-adapter';
import { FawryAdapter } from './fawry-adapter';

const adapterRegistry: Map<PaymentGateway, new () => PaymentAdapter> = new Map([
  ['PAYMOB', PaymobAdapter],
  ['PAYTABS', PayTabsAdapter],
  ['STC_PAY', STCPayAdapter],
  ['HYPERPAY', HyperPayAdapter],
  ['MADA', MadaAdapter],
  ['FAWRY', FawryAdapter],
]);

const adapterInstances: Map<PaymentGateway, PaymentAdapter> = new Map();

export function getAdapterConfigFromEnv(gateway: PaymentGateway): PaymentAdapterConfig {
  const prefix = gateway.replace(/_/g, '').toUpperCase();
  const environment = process.env.PAYMENT_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
  
  return {
    api_key: process.env[`${prefix}_API_KEY`],
    secret_key: process.env[`${prefix}_SECRET_KEY`],
    merchant_id: process.env[`${prefix}_MERCHANT_ID`],
    environment,
    webhook_secret: process.env[`${prefix}_WEBHOOK_SECRET`],
    additional_config: {
      iframe_id: process.env[`${prefix}_IFRAME_ID`],
      integration_id: process.env[`${prefix}_INTEGRATION_ID`],
    }
  };
}

export async function getAdapter(gateway: PaymentGateway): Promise<PaymentAdapter | null> {
  if (adapterInstances.has(gateway)) {
    return adapterInstances.get(gateway)!;
  }
  
  const AdapterClass = adapterRegistry.get(gateway);
  if (!AdapterClass) {
    console.warn(`[Payment] No adapter registered for gateway: ${gateway}`);
    return null;
  }
  
  const adapter = new AdapterClass();
  const config = getAdapterConfigFromEnv(gateway);
  
  try {
    await adapter.initialize(config);
    adapterInstances.set(gateway, adapter);
    return adapter;
  } catch (error) {
    console.error(`[Payment] Failed to initialize ${gateway} adapter:`, error);
    return null;
  }
}

export function getSupportedGateways(): PaymentGateway[] {
  return Array.from(adapterRegistry.keys());
}

export function isGatewaySupported(gateway: PaymentGateway): boolean {
  return adapterRegistry.has(gateway);
}

export {
  PaymobAdapter,
  PayTabsAdapter,
  STCPayAdapter,
  HyperPayAdapter,
  MadaAdapter,
  FawryAdapter,
};
