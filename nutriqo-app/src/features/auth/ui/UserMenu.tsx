'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/shared/ui/Button/Button';
import { Badge } from '@/shared/ui/Badge/Badge';

export const UserMenu = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Загрузка...</div>;
  if (!session) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold">{session.user?.name}</p>
        <p className="text-xs text-gray-500">{session.user?.email}</p>
      </div>
      {session.user?.image && (
        <img src={session.user.image} alt="Avatar" className="w-10 h-10 rounded-full border" />
      )}
      <Button variant="secondary" onClick={() => signOut({ callbackUrl: '/' })}>
        Выйти
      </Button>
    </div>
  );
};