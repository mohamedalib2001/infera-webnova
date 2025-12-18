import { getStripeSync } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
  }

  static async handleSubscriptionEvent(event: any): Promise<void> {
    const subscription = event.data.object;
    const customerId = subscription.customer;
    const status = subscription.status;

    console.log(`[Webhook] Subscription ${subscription.id} status: ${status}`);

    try {
      const user = await storage.getUserByStripeCustomerId(customerId);
      if (user) {
        let newStatus = 'pending';
        if (status === 'active' || status === 'trialing') {
          newStatus = 'active';
        } else if (status === 'canceled' || status === 'unpaid') {
          newStatus = 'cancelled';
        } else if (status === 'past_due') {
          newStatus = 'past_due';
        }

        const userSub = await storage.getUserSubscription(user.id);
        if (userSub) {
          await storage.updateUserSubscription(userSub.id, {
            status: newStatus,
            stripeSubscriptionId: subscription.id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });
        }

        console.log(`[Webhook] Updated user ${user.id} subscription status to ${newStatus}`);
      }
    } catch (error: any) {
      console.error('[Webhook] Error handling subscription event:', error.message);
    }
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
