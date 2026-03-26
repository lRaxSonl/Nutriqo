'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/shared/ui/Button/Button';

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/', label: '📊 Трекер', icon: '📊' },
    { href: '/statistics', label: '📈 Статистика', icon: '📈' },
    { href: '/profile', label: '👤 Профиль', icon: '👤' },
  ];

  // Скрываем Sidebar если пользователь не авторизован
  if (!session?.user) {
    return null;
  }

  return (
    <aside className="w-64 bg-background border-r border-border min-h-screen p-4 flex flex-col">
      {/* Logo/Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Nutriqo</h1>
        <p className="text-xs text-foreground-secondary">Трекер питания</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-primary text-white'
                  : 'text-foreground hover:bg-background-hover'
              }`}
            >
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

      {/* User Info & Logout */}
      {session?.user && (
        <div className="border-t border-border pt-4 space-y-3">
          <div className="px-4 py-2">
            <p className="text-xs text-foreground-secondary">Пользователь</p>
            <p className="font-medium text-sm truncate">{session.user.email}</p>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            🚪 Выход
          </Button>
        </div>
      )}
    </aside>
  );
};
