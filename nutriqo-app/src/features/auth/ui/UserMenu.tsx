'use client';

import React from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/shared/ui/Button/Button';
import { Badge } from '@/shared/ui/Badge/Badge';
import { useAdmin } from '@/features/admin';

export const UserMenu = () => {
  const { data: session, status } = useSession();
  const { isAdmin } = useAdmin();

  if (status === 'loading') return <div>Загрузка...</div>;
  if (!session) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold">{session.user?.name}</p>
        <p className="text-xs text-foreground-secondary">{session.user?.email}</p>
      </div>
      {session.user?.image && (
        <img src={session.user.image} alt="Avatar" className="w-10 h-10 rounded-full border" />
      )}
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link
            href="/admin"
            className="px-3 py-2 text-sm font-medium bg-secondary text-white rounded-md hover:opacity-90 transition-opacity"
          >
            ⚙️ Admin
          </Link>
        )}
        <Button variant="secondary" onClick={() => signOut({ callbackUrl: '/' })}>
          Выйти
        </Button>
      </div>
    </div>
  );
};