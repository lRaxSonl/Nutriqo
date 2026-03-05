import React from 'react';
import { getServerSession } from 'next-auth';
import { UserMenu } from '@/features/auth/ui/UserMenu';
import Link from 'next/link';
import { Button } from '@/shared/ui/Button/Button';

export const Header = async () => {
  const session = await getServerSession();

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">🥑 Nutriqo</Link>
        
        {session ? (
          <UserMenu />
        ) : (
          <Link href="/login">
            <Button variant="primary">Войти</Button>
          </Link>
        )}
      </div>
    </header>
  );
};