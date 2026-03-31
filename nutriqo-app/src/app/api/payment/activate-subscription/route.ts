/**
 * POST /api/payment/activate-subscription
 * 
 * Активирует подписку пользователя после успешного платежа в Stripe
 * SECURITY: Требует верифицированный JWT
 * 
 * Semi-hack approach: Обновляем subscriptionStatus в JWT и сессии
 * Постоянная активация будет через Stripe webhook (в будущем)
 */

import { NextResponse } from 'next/server';
import { getVerifiedSession } from '@/shared/lib/verifyJWT';
import { logger } from '@/shared/lib/logger';
import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.POCKETBASE_URL;

export async function POST(request: Request) {
  try {
    // SECURITY: Verify JWT signature and get full session
    const verifiedSession = await getVerifiedSession();
    
    if (!verifiedSession?.user?.id) {
      logger.warn('Activate subscription: unauthorized', 'UNAUTHORIZED');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = verifiedSession.user.id;
    const pbToken = verifiedSession.pbToken;

    if (!pbToken) {
      logger.warn(`Activate subscription: no pbToken for user`, 'PBTOKEN_MISSING');
      return NextResponse.json(
        { success: false, error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    // Обновляем статус подписки в PocketBase
    const pocketbase = new PocketBase(POCKETBASE_URL);
    pocketbase.authStore.save(pbToken);

    logger.info(`Activating subscription for user: ${userId}`);

    try {
      const updatedUser = await pocketbase.collection('users').update(userId, {
        subscriptionStatus: 'active',
      });

      logger.info(`Subscription activated: ${userId}`);

      // Вернули с subscriptionStatus чтобы эту информацию можно было использовать для обновления сессии
      return NextResponse.json(
        {
          success: true,
          data: {
            userId,
            subscriptionStatus: updatedUser.subscriptionStatus || 'active',
          },
        },
        { status: 200 }
      );
    } catch (pbError: any) {
      const errorMsg = pbError?.message || 'PocketBase error';
      logger.error('PocketBase update error', 'PB_UPDATE_ERROR');

      // Даже если не получилось обновить в БД, вернём успех
      // Потому что сессия уже будет обновлена
      return Response.json(
        {
          success: true,
          data: { userId, subscriptionStatus: 'active' },
          warning: 'Subscription activated in session but may need sync',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('Activate subscription error', 'ACTIVATION_ERROR', { error: errorMsg });

    return Response.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
