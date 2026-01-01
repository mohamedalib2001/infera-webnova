import { Router, Request, Response } from 'express';
import { paymentService } from './payment-service';
import { storage } from './storage';
import { WebhookHandlers } from './webhookHandlers';
import { aiBillingService } from './ai-billing-service';

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
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
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
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
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
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
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

router.get('/all-subscriptions', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const subscriptions = await storage.getAllUserSubscriptions();
    const plans = await storage.getSubscriptionPlans();
    const users = await storage.getAllUsers();

    const enrichedSubscriptions = subscriptions.map(sub => {
      const plan = plans.find(p => p.id === sub.planId);
      const user = users.find(u => u.id === sub.userId);
      return {
        ...sub,
        planName: plan?.name || 'Unknown',
        planNameAr: plan?.nameAr || 'غير معروف',
        userEmail: user?.email || 'Unknown',
        userName: user?.fullName || user?.email || 'Unknown',
      };
    });

    res.json({ subscriptions: enrichedSubscriptions });
  } catch (error: any) {
    console.error('[Payment] All subscriptions error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get subscriptions',
      errorAr: 'فشل في جلب الاشتراكات'
    });
  }
});

router.get('/transactions', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const events = await storage.getSubscriptionEvents(50);
    
    res.json({ transactions: events });
  } catch (error: any) {
    console.error('[Payment] Transactions error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get transactions',
      errorAr: 'فشل في جلب المعاملات'
    });
  }
});

// ==================== SUBSCRIPTION LIFECYCLE ====================

router.post('/subscription/pause', async (req: Request, res: Response) => {
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

    await paymentService.pauseSubscription(subscription.stripeSubscriptionId);
    await storage.updateUserSubscription(subscription.id, { status: 'paused' });

    res.json({ 
      success: true,
      message: 'Subscription paused',
      messageAr: 'تم إيقاف الاشتراك مؤقتاً'
    });
  } catch (error: any) {
    console.error('[Payment] Pause error:', error.message);
    res.status(500).json({ 
      error: 'Failed to pause subscription',
      errorAr: 'فشل في إيقاف الاشتراك'
    });
  }
});

router.post('/subscription/resume', async (req: Request, res: Response) => {
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
        error: 'No subscription found',
        errorAr: 'لا يوجد اشتراك'
      });
    }

    await paymentService.resumeSubscription(subscription.stripeSubscriptionId);
    await storage.updateUserSubscription(subscription.id, { status: 'active' });

    res.json({ 
      success: true,
      message: 'Subscription resumed',
      messageAr: 'تم استئناف الاشتراك'
    });
  } catch (error: any) {
    console.error('[Payment] Resume error:', error.message);
    res.status(500).json({ 
      error: 'Failed to resume subscription',
      errorAr: 'فشل في استئناف الاشتراك'
    });
  }
});

router.post('/subscription/cancel-at-period-end', async (req: Request, res: Response) => {
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

    await paymentService.cancelAtPeriodEnd(subscription.stripeSubscriptionId);
    await storage.updateUserSubscription(subscription.id, { 
      status: 'cancelling',
    });

    res.json({ 
      success: true,
      message: 'Subscription will cancel at period end',
      messageAr: 'سيتم إلغاء الاشتراك في نهاية الفترة'
    });
  } catch (error: any) {
    console.error('[Payment] Cancel at period end error:', error.message);
    res.status(500).json({ 
      error: 'Failed to schedule cancellation',
      errorAr: 'فشل في جدولة الإلغاء'
    });
  }
});

router.post('/subscription/reactivate', async (req: Request, res: Response) => {
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
        error: 'No subscription found',
        errorAr: 'لا يوجد اشتراك'
      });
    }

    await paymentService.reactivateSubscription(subscription.stripeSubscriptionId);
    await storage.updateUserSubscription(subscription.id, { status: 'active' });

    res.json({ 
      success: true,
      message: 'Subscription reactivated',
      messageAr: 'تم إعادة تفعيل الاشتراك'
    });
  } catch (error: any) {
    console.error('[Payment] Reactivate error:', error.message);
    res.status(500).json({ 
      error: 'Failed to reactivate subscription',
      errorAr: 'فشل في إعادة تفعيل الاشتراك'
    });
  }
});

router.post('/subscription/upgrade', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const { newPlanId, billingCycle = 'monthly' } = req.body;
    if (!newPlanId) {
      return res.status(400).json({ 
        error: 'New plan ID is required',
        errorAr: 'معرف الخطة الجديدة مطلوب'
      });
    }

    const user = getUser(req);
    const dbUser = await storage.getUser(user.id);
    const subscription = await storage.getUserSubscription(user.id);
    
    if (!subscription?.stripeSubscriptionId || !dbUser) {
      return res.status(400).json({ 
        error: 'No active subscription',
        errorAr: 'لا يوجد اشتراك نشط'
      });
    }

    const newPlan = await storage.getSubscriptionPlan(newPlanId);
    if (!newPlan) {
      return res.status(404).json({ 
        error: 'Plan not found',
        errorAr: 'الخطة غير موجودة'
      });
    }

    const result = await paymentService.upgradeSubscription(
      dbUser,
      subscription.stripeSubscriptionId,
      newPlan,
      billingCycle
    );

    if (result.success) {
      await storage.updateUserSubscription(subscription.id, { 
        planId: newPlanId,
        billingCycle 
      });
    }

    res.json(result);
  } catch (error: any) {
    console.error('[Payment] Upgrade error:', error.message);
    res.status(500).json({ 
      error: 'Failed to upgrade subscription',
      errorAr: 'فشل في ترقية الاشتراك'
    });
  }
});

router.post('/subscription/downgrade', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const { newPlanId, billingCycle = 'monthly' } = req.body;
    if (!newPlanId) {
      return res.status(400).json({ 
        error: 'New plan ID is required',
        errorAr: 'معرف الخطة الجديدة مطلوب'
      });
    }

    const user = getUser(req);
    const dbUser = await storage.getUser(user.id);
    const subscription = await storage.getUserSubscription(user.id);
    
    if (!subscription?.stripeSubscriptionId || !dbUser) {
      return res.status(400).json({ 
        error: 'No active subscription',
        errorAr: 'لا يوجد اشتراك نشط'
      });
    }

    const newPlan = await storage.getSubscriptionPlan(newPlanId);
    if (!newPlan) {
      return res.status(404).json({ 
        error: 'Plan not found',
        errorAr: 'الخطة غير موجودة'
      });
    }

    const result = await paymentService.downgradeSubscription(
      dbUser,
      subscription.stripeSubscriptionId,
      newPlan,
      billingCycle
    );

    res.json(result);
  } catch (error: any) {
    console.error('[Payment] Downgrade error:', error.message);
    res.status(500).json({ 
      error: 'Failed to downgrade subscription',
      errorAr: 'فشل في تخفيض الاشتراك'
    });
  }
});

// ==================== PAYMENT METHODS ====================

router.get('/payment-methods', async (req: Request, res: Response) => {
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
      return res.json({ paymentMethods: [] });
    }

    const methods = await paymentService.getPaymentMethods(dbUser.stripeCustomerId);
    res.json({ paymentMethods: methods });
  } catch (error: any) {
    console.error('[Payment] Get payment methods error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get payment methods',
      errorAr: 'فشل في جلب طرق الدفع'
    });
  }
});

router.post('/payment-methods/default', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const { paymentMethodId } = req.body;
    if (!paymentMethodId) {
      return res.status(400).json({ 
        error: 'Payment method ID is required',
        errorAr: 'معرف طريقة الدفع مطلوب'
      });
    }

    const user = getUser(req);
    const dbUser = await storage.getUser(user.id);
    
    if (!dbUser?.stripeCustomerId) {
      return res.status(400).json({ 
        error: 'No customer account',
        errorAr: 'لا يوجد حساب عميل'
      });
    }

    await paymentService.setDefaultPaymentMethod(dbUser.stripeCustomerId, paymentMethodId);
    res.json({ 
      success: true,
      message: 'Default payment method updated',
      messageAr: 'تم تحديث طريقة الدفع الافتراضية'
    });
  } catch (error: any) {
    console.error('[Payment] Set default method error:', error.message);
    res.status(500).json({ 
      error: 'Failed to update payment method',
      errorAr: 'فشل في تحديث طريقة الدفع'
    });
  }
});

router.delete('/payment-methods/:id', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const { id } = req.params;
    await paymentService.detachPaymentMethod(id);
    
    res.json({ 
      success: true,
      message: 'Payment method removed',
      messageAr: 'تم حذف طريقة الدفع'
    });
  } catch (error: any) {
    console.error('[Payment] Remove method error:', error.message);
    res.status(500).json({ 
      error: 'Failed to remove payment method',
      errorAr: 'فشل في حذف طريقة الدفع'
    });
  }
});

// ==================== BILLING PROFILES ====================

router.get('/billing-profile', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const user = getUser(req);
    const profile = await paymentService.getBillingProfile(user.id);
    res.json({ profile });
  } catch (error: any) {
    console.error('[Payment] Get billing profile error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get billing profile',
      errorAr: 'فشل في جلب ملف الفوترة'
    });
  }
});

router.put('/billing-profile', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const user = getUser(req);
    const profile = await paymentService.updateBillingProfile(user.id, req.body);
    res.json({ 
      profile,
      message: 'Billing profile updated',
      messageAr: 'تم تحديث ملف الفوترة'
    });
  } catch (error: any) {
    console.error('[Payment] Update billing profile error:', error.message);
    res.status(500).json({ 
      error: 'Failed to update billing profile',
      errorAr: 'فشل في تحديث ملف الفوترة'
    });
  }
});

// ==================== REVENUE ANALYTICS (Owner Only) ====================

router.get('/revenue-analytics', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const stats = await paymentService.getRevenueStats();
    res.json({ analytics: stats });
  } catch (error: any) {
    console.error('[Payment] Revenue analytics error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get revenue analytics',
      errorAr: 'فشل في جلب تحليلات الإيرادات'
    });
  }
});

// ==================== WEBHOOK LOGS (Owner Only) ====================

router.get('/webhook-logs', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await storage.getWebhookLogs(limit);
    res.json({ logs });
  } catch (error: any) {
    console.error('[Payment] Webhook logs error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get webhook logs',
      errorAr: 'فشل في جلب سجلات الويب هوك'
    });
  }
});

// ==================== REFUNDS (Owner Only) ====================

router.get('/refunds', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const refunds = await storage.getAllRefunds();
    res.json({ refunds });
  } catch (error: any) {
    console.error('[Payment] Get refunds error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get refunds',
      errorAr: 'فشل في جلب المستردات'
    });
  }
});

// ==================== RETRY FAILED PAYMENTS ====================

router.post('/retry-payment', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }

    const { invoiceId } = req.body;
    if (!invoiceId) {
      return res.status(400).json({ 
        error: 'Invoice ID is required',
        errorAr: 'معرف الفاتورة مطلوب'
      });
    }

    const result = await paymentService.retryFailedPayment(invoiceId);
    res.json(result);
  } catch (error: any) {
    console.error('[Payment] Retry payment error:', error.message);
    res.status(500).json({ 
      error: 'Failed to retry payment',
      errorAr: 'فشل في إعادة محاولة الدفع'
    });
  }
});

// ==================== PAYMENT RETRY QUEUE (Owner Only) ====================

router.get('/retry-queue', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const queue = await storage.getPendingPaymentRetries();
    res.json({ queue });
  } catch (error: any) {
    console.error('[Payment] Get retry queue error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get retry queue',
      errorAr: 'فشل في جلب قائمة إعادة المحاولة'
    });
  }
});

// ==================== AI BILLING INSIGHTS (Owner Only) ====================

router.get('/ai-insights', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const insights = await aiBillingService.generateBillingInsights();
    res.json({ insights });
  } catch (error: any) {
    console.error('[Payment] AI insights error:', error.message);
    res.status(500).json({ 
      error: 'Failed to generate AI insights',
      errorAr: 'فشل في توليد رؤى الذكاء الاصطناعي'
    });
  }
});

router.get('/ai-insights/stored', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const insights = await aiBillingService.getStoredInsights(limit);
    res.json({ insights });
  } catch (error: any) {
    console.error('[Payment] Stored insights error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get stored insights',
      errorAr: 'فشل في جلب الرؤى المحفوظة'
    });
  }
});

router.post('/ai-insights/churn-analysis', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        errorAr: 'معرف المستخدم مطلوب'
      });
    }

    const prediction = await aiBillingService.analyzeChurnRisk(userId);
    res.json({ prediction });
  } catch (error: any) {
    console.error('[Payment] Churn analysis error:', error.message);
    res.status(500).json({ 
      error: 'Failed to analyze churn risk',
      errorAr: 'فشل في تحليل خطر الإلغاء'
    });
  }
});

router.get('/ai-insights/upgrade-suggestions', async (req: Request, res: Response) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        error: 'Authentication required',
        errorAr: 'يجب تسجيل الدخول'
      });
    }
    if (!isOwner(req)) {
      return res.status(403).json({ 
        error: 'Owner access required',
        errorAr: 'مطلوب صلاحية المالك'
      });
    }

    const suggestions = await aiBillingService.suggestUpgrades();
    res.json({ suggestions });
  } catch (error: any) {
    console.error('[Payment] Upgrade suggestions error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get upgrade suggestions',
      errorAr: 'فشل في جلب اقتراحات الترقية'
    });
  }
});

export { router as paymentRoutes };
