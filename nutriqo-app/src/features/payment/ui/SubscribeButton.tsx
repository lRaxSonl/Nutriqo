'use client';

import React, { useState } from 'react';
import { httpClient } from '@/shared/api';
import { Button } from '@/shared/ui/Button/Button';

export const SubscribeButton = () => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await httpClient.post('/api/payment/checkout');
      const data = response.data as any;
      
      if (data.url) {
        window.location.href = data.url; // Редирект на Stripe
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

  return (
    <Button onClick={handleSubscribe} isLoading={loading} className="w-full">
      Оформить подписку ($9.99/мес)
    </Button>
  );
};