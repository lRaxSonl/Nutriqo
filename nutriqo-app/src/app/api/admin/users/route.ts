/**
 * GET /api/admin/users
 * 
 * Получить список всех пользователей
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

    console.log('[Admin Users API] Fetching users with admin access...');
    
    // Use admin client for full access to all users
    const pocketbase = await getAdminPocketBaseClient();
    const usersCollection = getPocketBaseUsersCollection();

    console.log(`[Admin Users API] Fetching from collection: ${usersCollection}`);

    // Get all users - now with admin privileges
    const users = await pocketbase.collection(usersCollection).getFullList({
      limit: 9999,
      sort: '-created',
    });

    console.log(`[Admin Users API] ✓ Fetched ${users.length} users`);
    
    if (users.length === 0) {
      console.warn('[Admin Users API] ⚠️ Got 0 users from database');
      console.warn('[Admin Users API] This may mean:');
      console.warn('[Admin Users API]   1. No users created yet');
      console.warn('[Admin Users API]   2. Collection rules restrict access');
      console.warn('[Admin Users API]   3. Admin authentication failed (check POCKETBASE_ADMIN_EMAIL/PASSWORD)');
    }

    return Response.json({
      success: true,
      data: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role || 'user',
        subscriptionStatus: u.subscriptionStatus || 'inactive',
        createdAt: u.created,
      })),
    });
  } catch (error: any) {
    console.error('[Admin Users API] ❌ Error:', {
      message: error?.message,
      status: error?.status,
      response: error?.response,
    });
    
    if (error.message.includes('Admin')) {
      return Response.json(
        { success: false, error: 'Unauthorized', message: 'User is not admin' },
        { status: 403 }
      );
    }
    
    return Response.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch users',
        details: error?.data?.message || error?.response?.message
      },
      { status: error?.status || 500 }
    );
  }
}
