import React from 'react';
import { getServerSession } from 'next-auth';
import { UserMenu } from '@/features/auth/ui/UserMenu';
import { ThemeToggle } from '@/shared/ui/ThemeToggle/ThemeToggle';
import Link from 'next/link';
import { Button } from '@/shared/ui/Button/Button';

export const Header = async () => {
  const session = await getServerSession();

  return (
    <header className="bg-background-secondary border-b border-border py-4 px-6 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
        <Link href="/" className="text-xl font-bold text-primary">🥑 Nutriqo</Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        
          {session ? (
            <UserMenu />
          ) : (
            <Link href="/login">
              <Button variant="primary">Войти</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};