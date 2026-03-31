import { NextResponse } from 'next/server';
import { getVerifiedToken } from '@/shared/lib/verifyJWT';
import { createCheckoutSession } from '@/features/payment/lib/createCheckoutSession';
import { logger } from '@/shared/lib/logger';

export async function POST() {
  try {
    // SECURITY: Verify JWT signature before processing payment
    const userToken = await getVerifiedToken();
    
    if (!userToken?.sub || !userToken?.email) {
      logger.warn('Unauthorized checkout attempt - invalid JWT or missing claims');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = userToken.sub;
    const userEmail = userToken.email;

    logger.info(`Creating checkout session for user: ${userId}`);

    const checkoutUrl = await createCheckoutSession(userId, userEmail);
    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    logger.error(`Checkout error: ${error}`, 'CHECKOUT_ERROR');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}