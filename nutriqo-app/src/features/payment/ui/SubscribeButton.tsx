'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { httpClient, useSubscription } from '@/shared/api';
import { Button } from '@/shared/ui/Button/Button';

export const SubscribeButton = () => {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();
  const { isPremium, activateSubscription } = useSubscription();

  // После возврата со Stripe с success=true, активируем подписку
  useEffect(() => {
    const success = searchParams?.get('success');
    if (success === 'true' && !isPremium) {
      (async () => {
        try {
          const response = await httpClient.post('/api/payment/activate-subscription');
          const result = response.data as any;

          if (result.success && result.data?.subscriptionStatus === 'active') {
            // Пересинхронизируем сессию - NextAuth сам получит обновленный токен
            await updateSession();
            console.log('✓ Session resynchronized');
          }
        } catch (error) {
          console.error('Failed to activate subscription:', error);
          // Пробуем обновить сессию в любом случае
          await updateSession();
        }
      })();
    }
  }, [searchParams, isPremium, updateSession]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await httpClient.post('/api/payment/checkout');
      const data = response.data as any;

      if (data.url) {
        // Редирект на Stripe (вернётся с ?success=true)
        window.location.href = data.url;
      } else {
        alert('Ошибка оплаты');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Ошибка оплаты');
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          ✓ Подписка активна
        </p>
      </div>
    );
  }

  return (
    <Button onClick={handleSubscribe} disabled={loading} className="w-full">
      {loading ? '⏳ Сейчас перенаправим...' : 'Оформить подписку ($4.99/мес)'}
    </Button>
  );
};