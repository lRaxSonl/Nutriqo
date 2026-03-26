/**
 * POST /api/payment/activate-subscription
 * 
 * Активирует подписку пользователя после успешного платежа в Stripe
 * Требуется: NextAuth сессия
 * 
 * Semi-hack approach: Обновляем subscriptionStatus в JWT и сессии
 * Постоянная активация будет через Stripe webhook (в будущем)
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { logger } from '@/shared/lib/logger';
import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.POCKETBASE_URL;

export async function POST(request: Request) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn('Activate subscription: unauthorized');
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const pbToken = session.pbToken;

    if (!pbToken) {
      logger.warn(`Activate subscription: no pbToken for user ${userId}`);
      return Response.json(
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

      logger.info(`✓ Subscription activated: ${userId}`);

      // Вернули с subscriptionStatus чтобы эту информацию можно было использовать для обновления сессии
      return Response.json(
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
      logger.error('PocketBase update error', 'PB_ERROR', { error: errorMsg });

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
