'use client';

import React, { useEffect, useState } from 'react';
import { httpClient } from '@/shared/api';
import { AdminStats } from '@/features/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await httpClient.get('/api/admin/dashboard');
        const data = response as any;
        if (data?.data) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground-secondary">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-foreground">📊 Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-background-secondary p-6 rounded-lg border border-border shadow-sm hover:border-primary transition-colors">
          <h3 className="text-foreground-secondary text-sm font-medium mb-2">
            Всего пользователей
          </h3>
          <p className="text-4xl font-bold text-primary">
            {stats?.totalUsers || 0}
          </p>
        </div>

        {/* Admins */}
        <div className="bg-background-secondary p-6 rounded-lg border border-border shadow-sm hover:border-secondary transition-colors">
          <h3 className="text-foreground-secondary text-sm font-medium mb-2">Админов</h3>
          <p className="text-4xl font-bold text-secondary">
            {stats?.adminCount || 0}
          </p>
        </div>

        {/* Premium Users */}
        <div className="bg-background-secondary p-6 rounded-lg border border-border shadow-sm hover:border-success transition-colors">
          <h3 className="text-foreground-secondary text-sm font-medium mb-2">Premium</h3>
          <p className="text-4xl font-bold text-success">
            {stats?.premiumCount || 0}
          </p>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-background-secondary p-6 rounded-lg border border-border shadow-sm hover:border-warning transition-colors">
          <h3 className="text-foreground-secondary text-sm font-medium mb-2">
            Активные подписки
          </h3>
          <p className="text-4xl font-bold text-warning">
            {stats?.activeSubscriptions || 0}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 bg-background-secondary p-6 rounded-lg border border-border shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Общая информация</h2>
        <div className="space-y-3 text-foreground">
          <p>
            • На платформе зарегистрировано <strong className="text-primary">{stats?.totalUsers}</strong>{' '}
            пользователей
          </p>
          <p>
            • Из них <strong className="text-secondary">{stats?.adminCount}</strong> администраторов
          </p>
          <p>
            • Premium подписку имеют <strong className="text-success">{stats?.premiumCount}</strong>{' '}
            пользователей
          </p>
          <p>
            • Коэффициент конверсии:{' '}
            <strong className="text-warning">
              {stats?.totalUsers
                ? ((stats.premiumCount / stats.totalUsers) * 100).toFixed(1)
                : '0'}
              %
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}
