'use client';

import React, { useEffect, useState } from 'react';
import { httpClient } from '@/shared/api';
import { UserWithRole } from '@/features/admin';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('[Admin Users] Fetching users...');
      const response = await httpClient.get('/api/admin/users');
      const data = response as any;
      
      console.log('[Admin Users] Response:', data);
      
      const loadedUsers = data?.data?.data || data?.data || [];
      console.log('[Admin Users] Loaded users count:', loadedUsers.length);
      console.log('[Admin Users] Users:', loadedUsers);
      
      setUsers(loadedUsers);
      
      if (loadedUsers.length === 0) {
        console.warn('[Admin Users] ⚠️ No users found!');
      }
    } catch (error: any) {
      console.error('[Admin Users] ❌ Error fetching users:', error);
      console.error('[Admin Users] Error details:', {
        message: error?.message,
        status: error?.status,
        response: error?.response,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'user' | 'admin') => {
    setUpdating(userId);
    try {
      await httpClient.patch(`/api/admin/users/${userId}`, { role: newRole });
      await loadUsers();
    } catch (error) {
      console.error('Failed to change role:', error);
      alert('Ошибка при изменении роли');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        'Вы уверены что хотите удалить этого пользователя? Это действие необратимо.'
      )
    ) {
      return;
    }

    setUpdating(userId);
    try {
      await httpClient.delete(`/api/admin/users/${userId}`);
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Ошибка при удалении пользователя');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground-secondary">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-foreground">👥 Пользователи</h1>
        <div className="text-foreground-secondary text-sm">
          Всего: <span className="text-primary font-bold">{users.length}</span>
        </div>
      </div>

      <div className="bg-background-secondary rounded-lg border border-border shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Имя
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Роль
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Подписка
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Дата регистрации
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-background transition-colors">
                <td className="px-6 py-4 text-sm text-foreground">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-foreground-secondary">
                  {user.name || '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleChangeRole(
                        user.id,
                        e.target.value as 'user' | 'admin'
                      )
                    }
                    disabled={updating === user.id}
                    className="px-3 py-1 border border-border rounded-md text-sm font-medium bg-background text-foreground hover:border-primary transition-colors disabled:opacity-50"
                  >
                    <option value="user">👤 User</option>
                    <option value="admin">⚙️ Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user.subscriptionStatus === 'active'
                        ? 'bg-success bg-opacity-20 text-white'
                        : 'bg-foreground-secondary bg-opacity-20 text-white'
                    }`}
                  >
                    {user.subscriptionStatus === 'active' ? 'Active' : 'Free'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-foreground-secondary">
                  {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={updating === user.id}
                    className="text-destructive hover:text-destructive font-medium disabled:opacity-50 transition-colors hover:underline"
                  >
                    🗑️ Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="mt-8 text-center text-foreground-secondary">
          Нет пользователей
        </div>
      )}
    </div>
  );
}
