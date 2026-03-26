'use client';

/**
 * Хук для проверки админ доступа
 * FSD: features/admin/hooks
 */

import { useSession } from 'next-auth/react';

export function useAdmin() {
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === 'admin';
  const canAccessAdmin = isAdmin;

  return {
    isAdmin,
    canAccessAdmin,
    session,
  };
}
