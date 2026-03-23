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
  const [protein, setProtein] = useState(initialGoal?.protein ? initialGoal.protein.toString() : '');
  const [fats, setFats] = useState(initialGoal?.fats ? initialGoal.fats.toString() : '');
  const [carbs, setCarbs] = useState(initialGoal?.carbs ? initialGoal.carbs.toString() : '');
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
            {(initialGoal.protein > 0 || initialGoal.fats > 0 || initialGoal.carbs > 0) && (
              <div className="text-sm text-foreground-secondary mt-1">
                Б: {initialGoal.protein}g | Ж: {initialGoal.fats}g | У: {initialGoal.carbs}g
              </div>
            )}
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
    const proteinValue = protein ? parseInt(protein) : 0;
    const fatsValue = fats ? parseInt(fats) : 0;
    const carbsValue = carbs ? parseInt(carbs) : 0;

    if (calValue < 500 || calValue > 10000) {
      setError('Цель должна быть от 500 до 10000 ккал');
      return;
    }

    if (proteinValue < 0 || proteinValue > 500) {
      setError('Белки должны быть от 0 до 500g');
      return;
    }

    if (fatsValue < 0 || fatsValue > 500) {
      setError('Жиры должны быть от 0 до 500g');
      return;
    }

    if (carbsValue < 0 || carbsValue > 500) {
      setError('Углеводы должны быть от 0 до 500g');
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
          ...(proteinValue > 0 && { protein_goal: proteinValue }),
          ...(fatsValue > 0 && { fats_goal: fatsValue }),
          ...(carbsValue > 0 && { carbs_goal: carbsValue }),
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
        protein: proteinValue,
        fats: fatsValue,
        carbs: carbsValue,
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
    <Card title="Установите цели на день" className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Сообщение об ошибке */}
        {error && (
          <div className="p-3 bg-error/10 border border-error rounded-md">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        {/* Калории */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="number"
            label="Ккал в день"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            disabled={isLoading}
            min="500"
            max="10000"
            required
          />
          
          {/* Белки */}
          <Input
            type="number"
            label="Белки (g)"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            disabled={isLoading}
            min="0"
            max="500"
            placeholder="Опционально"
          />

          {/* Жиры */}
          <Input
            type="number"
            label="Жиры (g)"
            value={fats}
            onChange={(e) => setFats(e.target.value)}
            disabled={isLoading}
            min="0"
            max="500"
            placeholder="Опционально"
          />

          {/* Углеводы */}
          <Input
            type="number"
            label="Углеводы (g)"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            disabled={isLoading}
            min="0"
            max="500"
            placeholder="Опционально"
          />
        </div>

        {/* Кнопки */}
        <div className="flex gap-4">
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