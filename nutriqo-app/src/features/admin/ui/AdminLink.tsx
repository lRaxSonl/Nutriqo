'use client';

import Link from 'next/link';
import { useAdmin } from '../hooks/use-admin';

/**
 * Ссылка на админку (видима только для админов)
 * FSD: features/admin/ui
 */

export const AdminLink = () => {
  const { isAdmin } = useAdmin();

  if (!isAdmin) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="px-3 py-2 text-sm font-medium bg-secondary text-white rounded-md hover:opacity-90 transition-opacity"
    >
      ⚙️ Админ
    </Link>
  );
};
