/**
 * Hook для проверки статуса подписки пользователя
 * FSD: shared/api/hooks
 */

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { httpClient } from '@/shared/api';

export function useSubscription() {
  const { data: session, update: updateSession } = useSession();

  const isPremium = useCallback(() => {
    return session?.user?.subscriptionStatus === 'active';
  }, [session?.user?.subscriptionStatus]);

  const activateSubscription = useCallback(async () => {
    try {
      const response = await httpClient.post('/api/payment/activate-subscription');
      const result = response.data as any;

      if (result.success && result.data?.subscriptionStatus === 'active') {
        // Пересинхронизируем сессию - NextAuth сам получит обновленный токен
        await updateSession();
        console.log('✓ useSubscription: Session resynchronized');
        return true;
      }
      return false;
    } catch (error) {
      console.error('useSubscription: Failed to activate:', error);
      return false;
    }
  }, [updateSession]);

  return {
    isPremium: isPremium(),
    subscriptionStatus: session?.user?.subscriptionStatus || 'inactive',
    activateSubscription,
    session,
  };
}
