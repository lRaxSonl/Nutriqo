/**
 * Stripe Webhook Handler
 * SECURITY: Verifies webhook signature before processing payments
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook } from '@/shared/lib/securityUtils';
import { createPocketBaseClient, getPocketBaseUsersCollection } from '@/shared/lib/pocketbase';
import { logger } from '@/shared/lib/logger';

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      logger.error('Missing Stripe signature header', 'WEBHOOK_SIGNATURE_MISSING');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // CRITICAL SECURITY: Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('STRIPE_WEBHOOK_SECRET not configured', 'WEBHOOK_SECRET_MISSING');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const isValid = verifyStripeWebhook(body, signature, webhookSecret);
    if (!isValid) {
      logger.error('Invalid Stripe webhook signature', 'WEBHOOK_SIGNATURE_INVALID');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Webhook signature verified - safe to process
    const event = JSON.parse(body);

    switch (event.type) {
      case 'payment_intent.succeeded':
        return await handlePaymentSuccess(event.data.object);

      case 'charge.failed':
        logger.warn('Stripe charge failed');
        return NextResponse.json({ received: true });

      case 'customer.subscription.deleted':
        return await handleSubscriptionCanceled(event.data.object);

      default:
        logger.debug(`Unhandled Stripe event: ${event.type}`);
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    logger.error(`Webhook processing error: ${error}`, 'WEBHOOK_PROCESS_ERROR');
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle successful payment - update subscription status
 */
async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const userIdFromMetadata = paymentIntent.metadata?.userId;
    const subscriptionId = paymentIntent.charges?.data?.[0]?.metadata?.subscriptionId;

    if (!userIdFromMetadata) {
      logger.warn('Payment succeeded but no userId in metadata');
      return NextResponse.json({ received: true });
    }

    // Update PocketBase user subscription status
    const pocketbase = createPocketBaseClient();
    const usersCollection = getPocketBaseUsersCollection();

    // Update using admin credentials (server-side only)
    await pocketbase.collection(usersCollection).update(userIdFromMetadata, {
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date().toISOString(),
      subscriptionId: subscriptionId || null,
    });

    logger.info(`Subscription activated for user: ${userIdFromMetadata}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error(`Error processing payment success: ${error}`, 'PAYMENT_SUCCESS_ERROR');
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

/**
 * Handle subscription canceled
 */
async function handleSubscriptionCanceled(subscription: any) {
  try {
    const subscriptionId = subscription.id;

    // Find user with this subscription ID
    const pocketbase = createPocketBaseClient();
    const usersCollection = getPocketBaseUsersCollection();

    const users = await pocketbase.collection(usersCollection).getFullList({
      filter: `subscriptionId="${subscriptionId}"`,
      limit: 1,
    });

    if (users.length > 0) {
      await pocketbase.collection(usersCollection).update(users[0].id, {
        subscriptionStatus: 'inactive',
        subscriptionId: null,
      });

      logger.info(`Subscription canceled for user: ${users[0].id}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error(`Error processing subscription cancellation: ${error}`, 'SUBSCRIPTION_CANCEL_ERROR');
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
