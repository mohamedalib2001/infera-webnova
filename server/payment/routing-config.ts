import type { PaymentRoutingConfig, PaymentGateway, PaymentRegion, PaymentCurrency } from '@shared/payment-types';

export const DEFAULT_ROUTING_CONFIG: PaymentRoutingConfig = {
  regions: {
    EGYPT: {
      currency: 'EGP',
      gateways: ['PAYMOB', 'FAWRY', 'PAYSKY', 'MEEZA', 'INSTAPAY'],
      fallback_gateway: 'PAYMOB'
    },
    UAE: {
      currency: 'AED',
      gateways: ['PAYTABS', 'TELR', 'AMAZON_PAYMENT_SERVICES', 'APPLE_PAY', 'GOOGLE_PAY'],
      fallback_gateway: 'PAYTABS'
    },
    KSA: {
      currency: 'SAR',
      gateways: ['STC_PAY', 'MADA', 'HYPERPAY', 'PAYTABS', 'APPLE_PAY'],
      fallback_gateway: 'HYPERPAY'
    }
  },
  default_region: 'KSA',
  gateway_priority: {
    PAYMOB: 100,
    FAWRY: 90,
    MEEZA: 80,
    INSTAPAY: 70,
    PAYSKY: 60,
    PAYTABS: 100,
    TELR: 90,
    AMAZON_PAYMENT_SERVICES: 85,
    STC_PAY: 100,
    MADA: 95,
    HYPERPAY: 90,
    APPLE_PAY: 80,
    GOOGLE_PAY: 75,
    STRIPE: 50
  }
};

export class PaymentRouter {
  private config: PaymentRoutingConfig;

  constructor(config?: PaymentRoutingConfig) {
    this.config = config || DEFAULT_ROUTING_CONFIG;
  }

  resolveRegion(region: PaymentRegion): Exclude<PaymentRegion, 'AUTO'> {
    if (region === 'AUTO') {
      return this.config.default_region;
    }
    return region;
  }

  resolveCurrency(currency: PaymentCurrency, region: Exclude<PaymentRegion, 'AUTO'>): Exclude<PaymentCurrency, 'AUTO'> {
    if (currency === 'AUTO') {
      return this.config.regions[region].currency as Exclude<PaymentCurrency, 'AUTO'>;
    }
    return currency as Exclude<PaymentCurrency, 'AUTO'>;
  }

  getAvailableGateways(region: Exclude<PaymentRegion, 'AUTO'>): PaymentGateway[] {
    const regionConfig = this.config.regions[region];
    if (!regionConfig) {
      return this.config.regions[this.config.default_region].gateways;
    }
    return regionConfig.gateways.sort((a, b) => 
      (this.config.gateway_priority[b] || 0) - (this.config.gateway_priority[a] || 0)
    );
  }

  selectGateway(
    region: Exclude<PaymentRegion, 'AUTO'>,
    preferredGateway?: PaymentGateway
  ): PaymentGateway {
    const available = this.getAvailableGateways(region);
    
    if (preferredGateway && available.includes(preferredGateway)) {
      return preferredGateway;
    }
    
    return available[0] || this.config.regions[region].fallback_gateway || 'STRIPE';
  }

  isGatewayAvailable(gateway: PaymentGateway, region: Exclude<PaymentRegion, 'AUTO'>): boolean {
    return this.getAvailableGateways(region).includes(gateway);
  }

  getCurrencyForRegion(region: Exclude<PaymentRegion, 'AUTO'>): PaymentCurrency {
    return this.config.regions[region]?.currency || 'USD';
  }

  updateConfig(config: Partial<PaymentRoutingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): PaymentRoutingConfig {
    return this.config;
  }
}

export const paymentRouter = new PaymentRouter();
