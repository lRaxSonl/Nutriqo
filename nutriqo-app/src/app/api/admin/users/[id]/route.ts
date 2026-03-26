/**
 * PATCH /api/admin/users/[id]
 * DELETE /api/admin/users/[id]
 * 
 * PATCH: Изменить роль пользователя
 * DELETE: Удалить пользователя
 * 
 * Требует: NextAuth сессия с role='admin'
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { requireAdmin } from '@/features/admin';
import PocketBase from 'pocketbase';
import { NextRequest } from 'next/server';

const POCKETBASE_URL = process.env.POCKETBASE_URL;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    requireAdmin(session);

    if (!session?.pbToken) {
      return Response.json(
        { success: false, error: 'No PocketBase token' },
        { status: 401 }
      );
    }

    const { role } = await request.json();

    if (!['user', 'admin'].includes(role)) {
      return Response.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const pocketbase = new PocketBase(POCKETBASE_URL);
    pocketbase.authStore.save(session.pbToken);

    const updatedUser = await pocketbase
      .collection('users')
      .update(id, { role });

    return Response.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    if (error.message.includes('Admin')) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return Response.json(
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
    const session = await getServerSession(authOptions);
    requireAdmin(session);

    if (!session?.pbToken) {
      return Response.json(
        { success: false, error: 'No PocketBase token' },
        { status: 401 }
      );
    }

    // Нельзя удалить себя
    if (id === session?.user?.id) {
      return Response.json(
        { success: false, error: 'Cannot delete yourself' },
        { status: 400 }
      );
    }

    const pocketbase = new PocketBase(POCKETBASE_URL);
    pocketbase.authStore.save(session.pbToken);

    await pocketbase.collection('users').delete(id);

    return Response.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    if (error.message.includes('Admin')) {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    return Response.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
