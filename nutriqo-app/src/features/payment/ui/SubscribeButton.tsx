'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button/Button';

export const SubscribeButton = () => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await fetch('/api/payment/checkout', { method: 'POST' });
    const data = await res.json();
    
    if (data.url) {
      window.location.href = data.url; // Редирект на Stripe
    } else {
      alert('Ошибка оплаты');
    }
    setLoading(false);
  };

  return (
    <Button onClick={handleSubscribe} isLoading={loading} className="w-full">
      Оформить подписку ($9.99/мес)
    </Button>
  );
};