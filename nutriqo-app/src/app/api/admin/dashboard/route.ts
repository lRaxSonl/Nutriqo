/**
 * GET /api/admin/dashboard
 * 
 * Получить статистику для админ дашборда
 * Требует: NextAuth сессия с role='admin'
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { requireAdmin } from '@/features/admin';
import { getAdminPocketBaseClient, getPocketBaseUsersCollection } from '@/shared/lib/pocketbase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    requireAdmin(session);

    console.log('[Admin Dashboard API] Fetching stats...');

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
