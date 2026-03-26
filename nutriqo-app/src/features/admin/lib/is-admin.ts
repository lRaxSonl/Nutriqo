/**
 * Проверить является ли пользователь администратором
 * FSD: features/admin/lib
 */

import { Session } from 'next-auth';

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'admin';
}

export function requireAdmin(session: Session | null): void {
  if (!isAdmin(session)) {
    throw new Error('Unauthorized: Admin access required');
  }
}
