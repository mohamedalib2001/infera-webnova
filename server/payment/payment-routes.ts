import { Router, Request, Response } from 'express';
import { paymentOrchestrator } from './orchestrator';
import {
  UnifiedPaymentContractSchema,
  RefundRequestSchema,
  PayoutRequestSchema,
  PaymentGateway,
  PaymentRegion
} from '@shared/payment-types';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
  try {
    const contract = UnifiedPaymentContractSchema.parse(req.body);
    
    const idempotencyKey = req.headers['x-idempotency-key'] as string;
    if (idempotencyKey) {
      contract.idempotency_key = idempotencyKey;
    }
    
    const response = await paymentOrchestrator.createPayment(contract);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error: any) {
    console.error('[Payment API] Create payment error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create payment'
    });
  }
});

router.post('/callback/:gateway', async (req: Request, res: Response) => {
  try {
    const gateway = req.params.gateway.toUpperCase() as PaymentGateway;
    
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers[key.toLowerCase()] = value;
      }
    }
    
    const response = await paymentOrchestrator.handleCallback(gateway, req.body, headers);
    
    console.log(`[Payment API] Callback processed for ${gateway}:`, response.transaction_id, response.status);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error: any) {
    console.error('[Payment API] Callback error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to process callback'
    });
  }
});

router.post('/refund', async (req: Request, res: Response) => {
  try {
    const request = RefundRequestSchema.parse(req.body);
    
    const idempotencyKey = req.headers['x-idempotency-key'] as string;
    if (idempotencyKey) {
      request.idempotency_key = idempotencyKey;
    }
    
    const response = await paymentOrchestrator.refund(request);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error: any) {
    console.error('[Payment API] Refund error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to process refund'
    });
  }
});

router.post('/payout', async (req: Request, res: Response) => {
  try {
    const request = PayoutRequestSchema.parse(req.body);
    
    const idempotencyKey = req.headers['x-idempotency-key'] as string;
    if (idempotencyKey) {
      request.idempotency_key = idempotencyKey;
    }
    
    const response = await paymentOrchestrator.payout(request);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error: any) {
    console.error('[Payment API] Payout error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to process payout'
    });
  }
});

router.get('/transaction/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    
    const response = await paymentOrchestrator.getTransactionStatus(transactionId);
    
    res.json({
      success: true,
      data: response
    });
  } catch (error: any) {
    console.error('[Payment API] Transaction status error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get transaction status'
    });
  }
});

router.get('/gateways/:region', async (req: Request, res: Response) => {
  try {
    const region = req.params.region.toUpperCase() as Exclude<PaymentRegion, 'AUTO'>;
    
    if (!['EGYPT', 'UAE', 'KSA'].includes(region)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid region. Must be EGYPT, UAE, or KSA'
      });
    }
    
    const gateways = paymentOrchestrator.getAvailableGateways(region);
    
    res.json({
      success: true,
      data: {
        region,
        gateways
      }
    });
  } catch (error: any) {
    console.error('[Payment API] Get gateways error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get gateways'
    });
  }
});

router.get('/config', async (req: Request, res: Response) => {
  try {
    const config = paymentOrchestrator.getRoutingConfig();
    
    res.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    console.error('[Payment API] Get config error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to get config'
    });
  }
});

router.get('/health', async (req: Request, res: Response) => {
  try {
    const status = await paymentOrchestrator.getHealthStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    console.error('[Payment API] Health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Health check failed'
    });
  }
});

router.post('/idempotency-key', async (req: Request, res: Response) => {
  const key = paymentOrchestrator.generateIdempotencyKey();
  res.json({
    success: true,
    data: { idempotency_key: key }
  });
});

export default router;
