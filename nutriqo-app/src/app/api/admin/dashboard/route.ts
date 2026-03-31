/**
 * GET /api/admin/dashboard
 * 
 * Получить статистику для админ дашборда
 * SECURITY: Требует верифицированный JWT с role='admin'
 */

import { getVerifiedAdminSession } from '@/shared/lib/verifyJWT';
import { getAdminPocketBaseClient, getPocketBaseUsersCollection } from '@/shared/lib/pocketbase';
import { logger } from '@/shared/lib/logger';

export async function GET() {
  try {
    // SECURITY: Verify JWT signature and admin role
    const adminSession = await getVerifiedAdminSession();
    
    if (!adminSession?.verifiedToken) {
      logger.warn('Unauthorized admin dashboard access - invalid JWT or missing admin role');
      return Response.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    logger.info(`Admin ${adminSession.verifiedToken.sub} accessing dashboard`);

    const pocketbase = await getAdminPocketBaseClient();
    const usersCollection = getPocketBaseUsersCollection();

    // Получаем статистику
    const allUsers = await pocketbase.collection(usersCollection).getFullList({
      limit: 9999,
    });

    console.log(`[Admin Dashboard API] Total users: ${allUsers.length}`);

    const totalUsers = allUsers.length;
    const adminCount = allUsers.filter((u: any) => u.role === 'admin').length;
    const premiumCount = allUsers.filter(
      (u: any) => u.subscriptionStatus === 'active'
    ).length;
    // Активные подписки = premium пользователи
    const activeSubscriptions = premiumCount;

    console.log(`[Admin Dashboard API] Stats: ${totalUsers} users, ${adminCount} admins, ${premiumCount} premium`);

    return Response.json({
      success: true,
      data: {
        totalUsers,
        adminCount,
        premiumCount,
        activeSubscriptions,
      },
    });
  } catch (error: any) {
    console.error('[Admin Dashboard API] Error:', error?.message);
    
    if (error.message.includes('Admin')) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return Response.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
