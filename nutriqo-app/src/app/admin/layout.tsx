'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/features/admin';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = useAdmin();
  const router = useRouter();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-destructive mb-4">Доступ запрещен</h1>
          <p className="text-foreground-secondary mb-6">У вас нет прав администратора</p>
          <button
            onClick={() => router.push('/')}
            className="bg-destructive text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-background-secondary text-foreground p-6 min-h-screen border-r border-border">
          <h2 className="text-2xl font-bold mb-8 text-foreground">⚙️ Админ панель</h2>
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block px-4 py-2 rounded-lg text-foreground hover:bg-background hover:border hover:border-primary transition duration-200"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="block px-4 py-2 rounded-lg text-foreground hover:bg-background hover:border hover:border-primary transition duration-200"
            >
              👥 Пользователи
            </Link>
            <Link
              href="/admin/subscriptions"
              className="block px-4 py-2 rounded-lg text-foreground hover:bg-background hover:border hover:border-primary transition duration-200"
            >
              💳 Подписки
            </Link>
            <Link
              href="/admin/activity"
              className="block px-4 py-2 rounded-lg text-foreground hover:bg-background hover:border hover:border-primary transition duration-200"
            >
              📋 Логи
            </Link>
            <Link
              href="/"
              className="block px-4 py-2 rounded-lg text-foreground hover:bg-background hover:border hover:border-primary transition duration-200 mt-8 border-t border-border pt-4"
            >
              ← Выход из админки
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
