/**
 * PATCH /api/admin/users/[id]
 * DELETE /api/admin/users/[id]
 * 
 * PATCH: Изменить роль пользователя
 * DELETE: Удалить пользователя
 * 
 * SECURITY: Требует верифицированный JWT с role='admin'
 */

import { getVerifiedAdminSession } from '@/shared/lib/verifyJWT';
import { logger } from '@/shared/lib/logger';
import PocketBase from 'pocketbase';
import { NextRequest, NextResponse } from 'next/server';

const POCKETBASE_URL = process.env.POCKETBASE_URL;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // SECURITY: Verify JWT signature and admin role
    const adminSession = await getVerifiedAdminSession();
    if (!adminSession?.verifiedToken) {
      logger.warn('Unauthorized admin user patch - invalid JWT or missing admin role');
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!adminSession.pbToken) {
      logger.error('Admin verified but pbToken missing', 'PBTOKEN_MISSING');
      return NextResponse.json(
        { success: false, error: 'No PocketBase token' },
        { status: 401 }
      );
    }

    const { role } = await request.json();

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const pocketbase = new PocketBase(POCKETBASE_URL);
    pocketbase.authStore.save(adminSession.pbToken);

    const updatedUser = await pocketbase
      .collection('users')
      .update(id, { role });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    logger.error(`Failed to update user role: ${error.message}`, 'USER_PATCH_ERROR', {
      error: error.message,
    });
    if (error.message.includes('Admin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // SECURITY: Verify JWT signature and admin role
    const adminSession = await getVerifiedAdminSession();
    if (!adminSession?.verifiedToken) {
      logger.warn('Unauthorized admin user delete - invalid JWT or missing admin role');
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!adminSession.pbToken) {
      logger.error('Admin verified but pbToken missing', 'PBTOKEN_MISSING');
      return NextResponse.json(
        { success: false, error: 'No PocketBase token' },
        { status: 401 }
      );
    }

    // Нельзя удалить себя
    if (id === adminSession.user?.id) {
      logger.warn(`Admin tried to delete themselves: ${id}`);
      return NextResponse.json(
        { success: false, error: 'Cannot delete yourself' },
        { status: 400 }
      );
    }

    const pocketbase = new PocketBase(POCKETBASE_URL);
    pocketbase.authStore.save(adminSession.pbToken);

    await pocketbase.collection('users').delete(id);

    logger.info(`User deleted successfully by admin - deletedUserId: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    logger.error(
      `Failed to delete user: ${error.message || 'Unknown error'}`,
      'USER_DELETE_ERROR',
      {
        error: error.message,
        status: error.status,
      }
    );
    
    if (error.message?.includes('Admin') || error.status === 403) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (error.message?.includes('not found') || error.status === 404) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
