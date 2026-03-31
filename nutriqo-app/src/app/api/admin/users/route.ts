/**
 * GET /api/admin/users
 * 
 * Получить список всех пользователей
 * SECURITY: Требует верифицированный JWT с role='admin'
 */

import { NextResponse } from 'next/server';
import { getVerifiedAdminToken } from '@/shared/lib/verifyJWT';
import { getAdminPocketBaseClient, getPocketBaseUsersCollection } from '@/shared/lib/pocketbase';
import { logger } from '@/shared/lib/logger';

export async function GET() {
  try {
    // SECURITY: Verify JWT signature and admin role
    const adminToken = await getVerifiedAdminToken();
    
    if (!adminToken) {
      logger.warn('Unauthorized admin access attempt - invalid JWT or missing admin role');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    logger.info(`Admin ${adminToken.sub} fetching users list`);
    
    // Use admin client for full access to all users
    const pocketbase = await getAdminPocketBaseClient();
    const usersCollection = getPocketBaseUsersCollection();

    // Get all users - now with admin privileges
    const users = await pocketbase.collection(usersCollection).getFullList({
      limit: 9999,
      sort: '-created',
    });

    logger.info(`Fetched ${users.length} users`);

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
