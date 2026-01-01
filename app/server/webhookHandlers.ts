import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import { createHash } from 'crypto';
import type { InsertWebhookLog, InsertPayment, InsertSubscriptionEvent, InsertRefund } from '@shared/schema';

export interface WebhookProcessResult {
  success: boolean;
  eventId: string;
  eventType: string;
  message: string;
  userId?: string;
}

export class WebhookHandlers {
  private static createPayloadHash(payload: Buffer): string {
    return createHash('sha256').update(payload).digest('hex');
  }

  static async processWebhook(payload: Buffer, signature: string): Promise<WebhookProcessResult> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const payloadString = payload.toString('utf8');
    let event: any;
    
    try {
      event = JSON.parse(payloadString);
    } catch {
      throw new Error('Invalid JSON payload');
    }

    const eventId = event.id;
    const eventType = event.type;
    const payloadHash = this.createPayloadHash(payload);

    const existingLog = await storage.getWebhookLogByEventId(eventId);
    if (existingLog) {
      if (existingLog.processed) {
        console.log(`[Webhook] Event ${eventId} already processed (idempotent skip)`);
        return {
          success: true,
          eventId,
          eventType,
          message: 'Event already processed',
          userId: existingLog.relatedUserId || undefined,
        };
      }
    }

    const logData: InsertWebhookLog = {
      eventId,
      eventType,
      provider: 'stripe',
      payloadHash,
      payload: event,
      processed: false,
      attempts: 1,
      lastAttemptAt: new Date(),
    };

    let webhookLog: any;
    try {
      if (!existingLog) {
        webhookLog = await storage.createWebhookLog(logData);
      } else {
        webhookLog = await storage.updateWebhookLog(existingLog.id, {
          attempts: existingLog.attempts + 1,
          lastAttemptAt: new Date(),
        });
      }
    } catch (err: any) {
      if (err.message?.includes('unique constraint')) {
        console.log(`[Webhook] Event ${eventId} race condition - already being processed`);
        return { success: true, eventId, eventType, message: 'Already processing' };
      }
      throw err;
    }

    try {
      const sync = await getStripeSync();
      await sync.processWebhook(payload, signature);

      let result: WebhookProcessResult = {
        success: true,
        eventId,
        eventType,
        message: 'Processed successfully',
      };

      switch (eventType) {
        case 'checkout.session.completed':
          result = await this.handleCheckoutCompleted(event);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          result = await this.handleSubscriptionEvent(event);
          break;
        case 'invoice.paid':
        case 'invoice.payment_succeeded':
          result = await this.handleInvoicePaid(event);
          break;
        case 'invoice.payment_failed':
          result = await this.handlePaymentFailed(event);
          break;
        case 'payment_intent.succeeded':
          result = await this.handlePaymentIntentSucceeded(event);
          break;
        case 'payment_intent.payment_failed':
          result = await this.handlePaymentIntentFailed(event);
          break;
        case 'charge.refunded':
          result = await this.handleChargeRefunded(event);
          break;
        case 'customer.created':
        case 'customer.updated':
          result = await this.handleCustomerEvent(event);
          break;
        default:
          console.log(`[Webhook] Unhandled event type: ${eventType}`);
      }

      await storage.updateWebhookLog(webhookLog.id, {
        processed: true,
        processedAt: new Date(),
        relatedUserId: result.userId,
        errorMessage: null,
      });

      return result;
    } catch (error: any) {
      console.error(`[Webhook] Error processing ${eventType}:`, error.message);
      
      await storage.updateWebhookLog(webhookLog.id, {
        errorMessage: error.message,
        lastAttemptAt: new Date(),
      });

      throw error;
    }
  }

  static async handleCheckoutCompleted(event: any): Promise<WebhookProcessResult> {
    const session = event.data.object;
    const customerId = session.customer;
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const planId = metadata.planId;
    const billingCycle = metadata.billingCycle || 'monthly';

    console.log(`[Webhook] Checkout completed for customer ${customerId}`);

    if (!userId) {
      console.warn('[Webhook] No userId in checkout session metadata');
      return {
        success: true,
        eventId: event.id,
        eventType: event.type,
        message: 'No userId in metadata',
      };
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      await storage.updateUser(userId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: session.subscription,
      });

      const plan = planId ? await storage.getSubscriptionPlan(planId) : null;
      if (plan) {
        const existingSub = await storage.getUserSubscription(userId);
        const subData = {
          userId,
          planId: plan.id,
          status: 'active' as const,
          billingCycle,
          paymentMethod: 'stripe',
          stripeSubscriptionId: session.subscription,
          stripeCustomerId: customerId,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };

        if (existingSub) {
          await storage.updateUserSubscription(existingSub.id, subData);
        } else {
          await storage.createUserSubscription(subData);
        }

        await storage.updateUser(userId, { role: plan.role });

        await storage.createSubscriptionEvent({
          userId,
          subscriptionId: session.subscription,
          eventType: 'subscription_created',
          previousPlan: null,
          newPlan: plan.name,
        });
      }

      console.log(`[Webhook] User ${userId} subscription activated`);
      
      return {
        success: true,
        eventId: event.id,
        eventType: event.type,
        message: 'Checkout processed, subscription activated',
        userId,
      };
    } catch (error: any) {
      console.error('[Webhook] Error handling checkout:', error.message);
      throw error;
    }
  }

  static async handleSubscriptionEvent(event: any): Promise<WebhookProcessResult> {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const status = subscription.status;

    console.log(`[Webhook] Subscription ${subscription.id} status: ${status}`);

    try {
      const user = await storage.getUserByStripeCustomerId(customerId);
      if (!user) {
        console.warn(`[Webhook] No user found for customer ${customerId}`);
        return {
          success: true,
          eventId: event.id,
          eventType: event.type,
          message: 'No user found for customer',
        };
      }

      let newStatus = 'pending';
      if (status === 'active' || status === 'trialing') {
        newStatus = 'active';
      } else if (status === 'canceled' || status === 'unpaid') {
        newStatus = 'cancelled';
      } else if (status === 'past_due') {
        newStatus = 'past_due';
      } else if (status === 'paused') {
        newStatus = 'paused';
      }

      const userSub = await storage.getUserSubscription(user.id);
      if (userSub) {
        await storage.updateUserSubscription(userSub.id, {
          status: newStatus,
          stripeSubscriptionId: subscription.id,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });

        const eventTypeMap: Record<string, string> = {
          'customer.subscription.created': 'subscription_created',
          'customer.subscription.updated': 'subscription_updated',
          'customer.subscription.deleted': 'subscription_cancelled',
        };

        await storage.createSubscriptionEvent({
          userId: user.id,
          subscriptionId: subscription.id,
          eventType: eventTypeMap[event.type] || 'subscription_updated',
          newPlan: userSub.planId,
        });
      }

      if (event.type === 'customer.subscription.deleted') {
        await storage.updateUser(user.id, { 
          role: 'free',
          stripeSubscriptionId: null,
        });
      }

      console.log(`[Webhook] Updated user ${user.id} subscription status to ${newStatus}`);

      return {
        success: true,
        eventId: event.id,
        eventType: event.type,
        message: `Subscription ${status} processed`,
        userId: user.id,
      };
    } catch (error: any) {
      console.error('[Webhook] Error handling subscription event:', error.message);
      throw error;
    }
  }

  static async handleInvoicePaid(event: any): Promise<WebhookProcessResult> {
    const invoice = event.data.object;
    const customerId = invoice.customer;
    const amountPaid = invoice.amount_paid;

    console.log(`[Webhook] Invoice paid for customer ${customerId}: ${amountPaid / 100} ${invoice.currency?.toUpperCase()}`);

    try {
      const user = await storage.getUserByStripeCustomerId(customerId);
      if (!user) {
        console.warn(`[Webhook] No user found for customer ${customerId}`);
        return {
          success: true,
          eventId: event.id,
          eventType: event.type,
          message: 'No user found',
        };
      }

      const userSub = await storage.getUserSubscription(user.id);

      await storage.createPayment({
        userId: user.id,
        subscriptionId: userSub?.id,
        amount: amountPaid,
        currency: invoice.currency?.toUpperCase() || 'USD',
        status: 'completed',
        paymentMethod: 'stripe',
        stripePaymentIntentId: invoice.payment_intent,
        description: `Invoice ${invoice.number || invoice.id}`,
        metadata: {
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          subscriptionId: invoice.subscription,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
        },
      });

      const pendingRetries = await storage.getPaymentRetriesBySubscription(userSub?.id || '');
      for (const retry of pendingRetries) {
        if (retry.status === 'pending') {
          await storage.updatePaymentRetry(retry.id, {
            status: 'succeeded',
            lastAttemptAt: new Date(),
          });
        }
      }

      await storage.createNotification({
        userId: user.id,
        title: 'Payment Successful',
        titleAr: 'تم الدفع بنجاح',
        message: `Your payment of ${amountPaid / 100} ${invoice.currency?.toUpperCase()} has been processed.`,
        messageAr: `تمت معالجة دفعتك بقيمة ${amountPaid / 100} ${invoice.currency?.toUpperCase()}.`,
        type: 'payment',
      });

      console.log(`[Webhook] Recorded payment for user ${user.id}`);

      return {
        success: true,
        eventId: event.id,
        eventType: event.type,
        message: 'Invoice payment recorded',
        userId: user.id,
      };
    } catch (error: any) {
      console.error('[Webhook] Error handling invoice paid:', error.message);
      throw error;
    }
  }

  static async handlePaymentFailed(event: any): Promise<WebhookProcessResult> {
    const invoice = event.data.object;
    const customerId = invoice.customer;

    console.log(`[Webhook] Payment failed for customer ${customerId}`);

    try {
      const user = await storage.getUserByStripeCustomerId(customerId);
      if (!user) {
        return { success: true, eventId: event.id, eventType: event.type, message: 'No user found' };
      }

      const userSub = await storage.getUserSubscription(user.id);

      await storage.createPayment({
        userId: user.id,
        subscriptionId: userSub?.id,
        amount: invoice.amount_due,
        currency: invoice.currency?.toUpperCase() || 'USD',
        status: 'failed',
        paymentMethod: 'stripe',
        stripePaymentIntentId: invoice.payment_intent,
        description: `Failed: Invoice ${invoice.number || invoice.id}`,
        metadata: {
          invoiceId: invoice.id,
          failureReason: invoice.last_payment_error?.message || 'Unknown',
          attemptCount: invoice.attempt_count,
        },
      });

      if (userSub) {
        const gracePeriodDays = 7;
        const gracePeriodEnd = new Date(Date.now() + gracePeriodDays * 24 * 60 * 60 * 1000);
        const nextRetry = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

        await storage.createPaymentRetry({
          userId: user.id,
          subscriptionId: userSub.id,
          stripeInvoiceId: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency?.toUpperCase() || 'USD',
          attemptNumber: invoice.attempt_count || 1,
          nextRetryAt: nextRetry,
          gracePeriodEnd,
          lastFailureReason: invoice.last_payment_error?.message,
          status: 'pending',
        });

        await storage.updateUserSubscription(userSub.id, { status: 'past_due' });
      }

      await storage.createNotification({
        userId: user.id,
        title: 'Payment Failed',
        titleAr: 'فشل الدفع',
        message: 'Your payment could not be processed. Please update your payment method to avoid service interruption.',
        messageAr: 'تعذر معالجة دفعتك. يرجى تحديث طريقة الدفع لتجنب انقطاع الخدمة.',
        type: 'payment',
      });

      console.log(`[Webhook] Payment failure recorded for user ${user.id}`);

      return {
        success: true,
        eventId: event.id,
        eventType: event.type,
        message: 'Payment failure recorded, retry scheduled',
        userId: user.id,
      };
    } catch (error: any) {
      console.error('[Webhook] Error handling payment failed:', error.message);
      throw error;
    }
  }

  static async handlePaymentIntentSucceeded(event: any): Promise<WebhookProcessResult> {
    const paymentIntent = event.data.object;
    const customerId = paymentIntent.customer;

    console.log(`[Webhook] PaymentIntent succeeded: ${paymentIntent.id}`);

    try {
      if (!customerId) {
        return { success: true, eventId: event.id, eventType: event.type, message: 'No customer ID' };
      }

      const user = await storage.getUserByStripeCustomerId(customerId);
      if (!user) {
        return { success: true, eventId: event.id, eventType: event.type, message: 'No user found' };
      }

      return {
        success: true,
        eventId: event.id,
        eventType: event.type,
        message: 'PaymentIntent succeeded processed',
        userId: user.id,
      };
    } catch (error: any) {
      console.error('[Webhook] Error handling payment intent succeeded:', error.message);
      throw error;
    }
  }

  static async handlePaymentIntentFailed(event: any): Promise<WebhookProcessResult> {
    const paymentIntent = event.data.object;
    console.log(`[Webhook] PaymentIntent failed: ${paymentIntent.id}`);

    return {
      success: true,
      eventId: event.id,
      eventType: event.type,
      message: 'PaymentIntent failure logged',
    };
  }

  static async handleChargeRefunded(event: any): Promise<WebhookProcessResult> {
    const charge = event.data.object;
    const refundAmount = charge.amount_refunded;
    const customerId = charge.customer;

    console.log(`[Webhook] Charge refunded: ${charge.id}, amount: ${refundAmount}`);

    try {
      const user = customerId ? await storage.getUserByStripeCustomerId(customerId) : null;
      
      if (user) {
        const payments = await storage.getPaymentsByUser(user.id);
        const originalPayment = payments.find(p => 
          p.stripePaymentIntentId === charge.payment_intent
        );

        if (originalPayment) {
          await storage.createRefund({
            paymentId: originalPayment.id,
            userId: user.id,
            amount: refundAmount,
            currency: charge.currency?.toUpperCase() || 'USD',
            reason: 'requested_by_customer',
            status: 'succeeded',
            stripeRefundId: charge.refunds?.data?.[0]?.id,
            processedAt: new Date(),
          });
        }

        await storage.createNotification({
          userId: user.id,
          title: 'Refund Processed',
          titleAr: 'تم معالجة الاسترداد',
          message: `A refund of ${refundAmount / 100} ${charge.currency?.toUpperCase()} has been processed.`,
          messageAr: `تم معالجة استرداد بقيمة ${refundAmount / 100} ${charge.currency?.toUpperCase()}.`,
          type: 'payment',
        });
      }

      return {
        success: true,
        eventId: event.id,
        eventType: event.type,
        message: 'Refund processed',
        userId: user?.id,
      };
    } catch (error: any) {
      console.error('[Webhook] Error handling refund:', error.message);
      throw error;
    }
  }

  static async handleCustomerEvent(event: any): Promise<WebhookProcessResult> {
    const customer = event.data.object;
    console.log(`[Webhook] Customer ${event.type}: ${customer.id}`);

    return {
      success: true,
      eventId: event.id,
      eventType: event.type,
      message: 'Customer event logged',
    };
  }

  static async handlePaymentEvent(event: any): Promise<void> {
    const invoice = event.data.object;
    const customerId = invoice.customer;
    const amountPaid = invoice.amount_paid;

    console.log(`[Webhook] Payment ${event.type} for customer ${customerId}: ${amountPaid / 100} ${invoice.currency?.toUpperCase()}`);

    try {
      const user = await storage.getUserByStripeCustomerId(customerId);
      if (user) {
        const userSub = await storage.getUserSubscription(user.id);
        await storage.createPayment({
          userId: user.id,
          subscriptionId: userSub?.id,
          amount: amountPaid,
          currency: invoice.currency?.toUpperCase() || 'USD',
          status: event.type === 'invoice.payment_succeeded' ? 'completed' : 'failed',
          paymentMethod: 'stripe',
          stripePaymentIntentId: invoice.payment_intent,
          description: invoice.description || `Subscription payment`,
          metadata: {
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
          },
        });

        console.log(`[Webhook] Recorded payment for user ${user.id}`);
      }
    } catch (error: any) {
      console.error('[Webhook] Error handling payment event:', error.message);
    }
  }
}
