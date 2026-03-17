'use client';

import React, { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Card } from '@/shared/ui/Card/Card';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { DailyGoal } from '@/entities/food/model/types';

interface GoalSetterProps {
  onSave: (goal: DailyGoal, goalId?: string) => void;
  initialGoal?: DailyGoal;
}

export const GoalSetter = ({ onSave, initialGoal }: GoalSetterProps) => {
  const { data: session } = useSession();
  
  const [calories, setCalories] = useState(initialGoal?.calories.toString() || '2000');
  const [isEditing, setIsEditing] = useState(!initialGoal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isEditing && initialGoal) {
    return (
      <Card className="mb-6 bg-background border-border">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-primary font-medium">Ваша цель на сегодня</span>
            <div className="text-2xl font-bold text-foreground">{initialGoal.calories} ккал</div>
          </div>
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Изменить
          </Button>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);

    const calValue = parseInt(calories) || 0;

    if (calValue < 500 || calValue > 10000) {
      setError('Цель должна быть от 500 до 10000 ккал');
      return;
    }

    if (!session?.user?.id) {
      setError('Пожалуйста, войдите в аккаунт');
      return;
    }

    setIsLoading(true);

    try {
      // Вызываем API endpoint для сохранения в БД
      const response = await fetch('/api/goal/set-daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calories_goal: calValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 && errorData?.error === 'Session expired. Please sign in again.') {
          await signOut({ callbackUrl: '/login' });
          return;
        }
        if (response.status === 403 && typeof errorData?.error === 'string' && errorData.error.includes('PocketBase permissions error')) {
          throw new Error('PocketBase запрещает создание goals для обычного пользователя. Исправь Create rule в коллекции goals.');
        }
        throw new Error(errorData.error || 'Ошибка при сохранении цели');
      }

      const goalData = await response.json();

      // Преобразуем ответ в формат DailyGoal для UI
      const goal: DailyGoal = {
        calories: calValue,
        protein: 0,
        fats: 0,
        carbs: 0,
      };

      onSave(goal, goalData.id);
      setIsEditing(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при сохранении цели';
      setError(errorMessage);
      console.error('Error saving goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Установите цель калорий" className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Сообщение об ошибке */}
        {error && (
          <div className="p-3 bg-error/10 border border-error rounded-md">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4 items-end">
          <Input
            type="number"
            label="Ккал в день"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            disabled={isLoading}
            className="w-40"
            min="500"
            max="10000"
          />
          <Button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Сохраняется...' : 'Сохранить'}
          </Button>
          {initialGoal && (
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};