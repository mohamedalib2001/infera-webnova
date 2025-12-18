import { Router, Request, Response } from 'express';
import { paymentService } from './payment-service';
import { storage } from './storage';
import { WebhookHandlers } from './webhookHandlers';

const router = Router();

function isAuthenticated(req: Request): boolean {
  return !!(req as any).user;
}

function getUser(req: Request): any {
  return (req as any).user;
}

function isOwner(req: Request): boolean {
  const user = getUser(req);
  return user?.role === 'owner';
}

router.get('/config', async (req: Request, res: Response) => {
  try {
    const publishableKey = await paymentService.getPublishableKey();
    res.json({ publishableKey });
  } catch (error: any) {
    console.error('[Payment] Error getting config:', error.message);
    res.status(500).json({ 
      error: 'Failed to get payment configuration',
      errorAr: 'فشل في جلب إعدادات الدفع'
    });
  }
});

router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await storage.getSubscriptionPlans();
    res.json({ plans });
  } catch (error: any) {
    console.error('[Payment] Error getting plans:', error.message);
    res.status(500).json({ 
      error: 'Failed to get subscription plans',
      errorAr: 'فشل في جلب خطط الاشتراك'
    });
  }
});

router.post('/checkout', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const { planId, billingCycle = 'monthly' } = req.body;
    if (!planId) {
      return res.status(400).json({ 
        error: 'Plan ID is required',
        errorAr: 'معرف الخطة مطلوب'
      });
    }

    const user = getUser(req);
    const dbUser = await storage.getUser(user.id);
    if (!dbUser) {
      return res.status(404).json({ 
        error: 'User not found',
        errorAr: 'المستخدم غير موجود'
      });
    }

    const plan = await storage.getSubscriptionPlan(planId);
    if (!plan) {
      return res.status(404).json({ 
        error: 'Plan not found',
        errorAr: 'الخطة غير موجودة'
      });
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;

    const result = await paymentService.createCheckoutSession(
      dbUser,
      plan,
      billingCycle,
      `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      `${baseUrl}/payment/cancel`
    );

    res.json({ 
      sessionId: result.sessionId,
      url: result.url 
    });
  } catch (error: any) {
    console.error('[Payment] Checkout error:', error.message);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      errorAr: 'فشل في إنشاء جلسة الدفع'
    });
  }
});

router.post('/portal', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const user = getUser(req);
    const dbUser = await storage.getUser(user.id);
    if (!dbUser?.stripeCustomerId) {
      return res.status(400).json({ 
        error: 'No subscription found',
        errorAr: 'لا يوجد اشتراك'
      });
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'https';
    const returnUrl = `${protocol}://${host}/account`;

    const result = await paymentService.createCustomerPortalSession(dbUser, returnUrl);
    res.json({ url: result.url });
  } catch (error: any) {
    console.error('[Payment] Portal error:', error.message);
    res.status(500).json({ 
      error: 'Failed to create portal session',
      errorAr: 'فشل في إنشاء جلسة البوابة'
    });
  }
});

router.get('/subscription', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const user = getUser(req);
    const subscription = await storage.getUserSubscription(user.id);
    
    if (!subscription) {
      return res.json({ subscription: null });
    }

    const plan = await storage.getSubscriptionPlan(subscription.planId);
    res.json({ 
      subscription,
      plan
    });
  } catch (error: any) {
    console.error('[Payment] Get subscription error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get subscription',
      errorAr: 'فشل في جلب الاشتراك'
    });
  }
});

router.post('/subscription/cancel', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const user = getUser(req);
    const subscription = await storage.getUserSubscription(user.id);
    
    if (!subscription?.stripeSubscriptionId) {
      return res.status(400).json({ 
        error: 'No active subscription',
        errorAr: 'لا يوجد اشتراك نشط'
      });
    }

    await paymentService.cancelSubscription(subscription.stripeSubscriptionId);
    await storage.updateUserSubscription(subscription.id, {
      status: 'cancelled',
      cancelledAt: new Date(),
    });

    res.json({ 
      success: true,
      message: 'Subscription cancelled',
      messageAr: 'تم إلغاء الاشتراك'
    });
  } catch (error: any) {
    console.error('[Payment] Cancel subscription error:', error.message);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      errorAr: 'فشل في إلغاء الاشتراك'
    });
  }
});

router.get('/invoices', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const user = getUser(req);
    const dbUser = await storage.getUser(user.id);
    
    if (!dbUser?.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await paymentService.listInvoices(dbUser.stripeCustomerId);
    res.json({ invoices });
  } catch (error: any) {
    console.error('[Payment] Get invoices error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get invoices',
      errorAr: 'فشل في جلب الفواتير'
    });
  }
});

router.get('/payments', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const user = getUser(req);
    const payments = await storage.getPaymentsByUser(user.id);
    res.json({ payments });
  } catch (error: any) {
    console.error('[Payment] Get payments error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get payments',
      errorAr: 'فشل في جلب المدفوعات'
    });
  }
});

router.post('/refund', async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const { paymentIntentId, amount, reason } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ 
        error: 'Payment intent ID is required',
        errorAr: 'معرف الدفع مطلوب'
      });
    }

    const refund = await paymentService.createRefund(paymentIntentId, amount, reason);
    res.json({ 
      success: true,
      refund,
      message: 'Refund processed',
      messageAr: 'تم معالجة الاسترداد'
    });
  } catch (error: any) {
    console.error('[Payment] Refund error:', error.message);
    res.status(500).json({ 
      error: 'Failed to process refund',
      errorAr: 'فشل في معالجة الاسترداد'
    });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const subscriptions = await storage.getAllUserSubscriptions();
    const plans = await storage.getSubscriptionPlans();

    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
      const plan = plans.find(p => p.id === sub.planId);
      if (!plan) return sum;
      switch (sub.billingCycle) {
        case 'yearly': return sum + plan.priceYearly;
        case 'quarterly': return sum + plan.priceQuarterly;
        case 'semi_annual': return sum + plan.priceSemiAnnual;
        default: return sum + plan.priceMonthly;
      }
    }, 0);

    const stats = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: activeSubscriptions.length,
      cancelledSubscriptions: subscriptions.filter(s => s.status === 'cancelled').length,
      monthlyRecurringRevenue: totalRevenue,
      subscriptionsByPlan: plans.map(plan => ({
        planId: plan.id,
        planName: plan.name,
        count: subscriptions.filter(s => s.planId === plan.id && s.status === 'active').length,
      })),
    };

    res.json({ stats });
  } catch (error: any) {
    console.error('[Payment] Stats error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get payment stats',
      errorAr: 'فشل في جلب إحصائيات الدفع'
    });
  }
});

router.get('/providers', async (req: Request, res: Response) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const providers = [
      {
        id: 'stripe',
        name: 'Stripe',
        nameAr: 'سترايب',
        status: 'active',
        supportsSubscriptions: true,
        supportsRefunds: true,
        isDefault: true,
      },
      {
        id: 'paypal',
        name: 'PayPal',
        nameAr: 'باي بال',
        status: 'configured',
        supportsSubscriptions: true,
        supportsRefunds: true,
        isDefault: false,
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        nameAr: 'تحويل بنكي',
        status: 'configured',
        supportsSubscriptions: false,
        supportsRefunds: false,
        isDefault: false,
      },
      {
        id: 'custom',
        name: 'Custom Provider',
        nameAr: 'مزود مخصص',
        status: 'inactive',
        supportsSubscriptions: false,
        supportsRefunds: false,
        isDefault: false,
      },
    ];

    res.json({ providers });
  } catch (error: any) {
    console.error('[Payment] Providers error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get providers',
      errorAr: 'فشل في جلب المزودين'
    });
  }
});

export { router as paymentRoutes };
