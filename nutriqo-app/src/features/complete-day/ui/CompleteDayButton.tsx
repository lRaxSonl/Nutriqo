'use client';

import React, { useState } from 'react';
import { httpClient } from '@/shared/api';
import { Button } from '@/shared/ui/Button/Button';
import { logger } from '@/shared/lib/logger';

interface CompleteDayButtonProps {
  onComplete?: () => void;
}

export const CompleteDayButton = ({ onComplete }: CompleteDayButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!window.confirm('Вы уверены, что хотите завершить день? После этого вы не сможете добавлять записи к этой цели.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await httpClient.patch('/api/goal/finish-daily', {});

      if (!response.ok) {
        const errorData = response.data as Record<string, unknown>;
        const errorMsg = typeof errorData?.error === 'string' 
          ? errorData.error 
          : 'Ошибка при завершении дня';
        throw new Error(errorMsg);
      }

      logger.info('Goal finished successfully');
      
      // Вызываем callback
      if (onComplete) {
        onComplete();
      } else {
        // Перезагружаем страницу если нет callback
        window.location.reload();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка при завершении дня';
      setError(errorMsg);
      logger.error('Failed to finish goal', 'GOAL_FINISHED_ERROR', {
        errorMessage: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-3 p-2 bg-error/10 border border-error rounded-md">
          <p className="text-error text-xs">{error}</p>
        </div>
      )}
      <Button 
        onClick={handleClick}
        disabled={isLoading}
        className="bg-success hover:bg-success/80"
      >
        {isLoading ? 'Завершаю...' : 'Завершить день'}
      </Button>
    </>
  );
};
