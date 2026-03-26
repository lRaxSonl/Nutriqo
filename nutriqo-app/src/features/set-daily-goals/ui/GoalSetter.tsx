'use client';

import React, { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { httpClient } from '@/shared/api';
import { Card } from '@/shared/ui/Card/Card';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { DailyGoal } from '@/entities/food/model/types';
import { CompleteDayButton } from '@/features/complete-day/ui/CompleteDayButton';
import { extractErrorMessage, extractGoalId, extractResponseError } from '../api/errorHandling';

interface GoalSetterProps {
  onSave: (goal: DailyGoal, goalId?: string) => void;
  onDelete?: () => void;
  initialGoal?: DailyGoal;
}

export const GoalSetter = ({ onSave, onDelete, initialGoal }: GoalSetterProps) => {
  const { data: session } = useSession();
  
  const [calories, setCalories] = useState(initialGoal?.calories.toString() || '2000');
  const [protein, setProtein] = useState(initialGoal?.protein ? initialGoal.protein.toString() : '');
  const [fats, setFats] = useState(initialGoal?.fats ? initialGoal.fats.toString() : '');
  const [carbs, setCarbs] = useState(initialGoal?.carbs ? initialGoal.carbs.toString() : '');
  const [isEditing, setIsEditing] = useState(!initialGoal);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Функция для автоматического расчета БЖУ
  const calculateMacros = (calories: number) => {
    // Стандартное соотношение: Б 20%, Ж 30%, У 50%
    const calculatedProtein = Math.round((calories * 0.2) / 4);
    const calculatedFats = Math.round((calories * 0.3) / 9);
    const calculatedCarbs = Math.round((calories * 0.5) / 4);

    return { calculatedProtein, calculatedFats, calculatedCarbs };
  };

  // При изменении калорий - пересчитывать БЖУ если они не заполнены
  const handleCaloriesChange = (value: string) => {
    setCalories(value);
    
    // Если поля БЖУ пусты, пересчитываем их
    if (!protein || !fats || !carbs) {
      const cal = parseInt(value) || 0;
      if (cal > 0) {
        const { calculatedProtein, calculatedFats, calculatedCarbs } = calculateMacros(cal);
        if (!protein) setProtein(calculatedProtein.toString());
        if (!fats) setFats(calculatedFats.toString());
        if (!carbs) setCarbs(calculatedCarbs.toString());
      }
    }
  };

  if (!isEditing && initialGoal) {
    return (
      <Card className="mb-6 bg-background border-border">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <span className="text-sm text-primary font-medium">Ваша цель на сегодня</span>
            <div className="text-2xl font-bold text-foreground">{initialGoal.calories} ккал</div>
            {(initialGoal.protein > 0 || initialGoal.fats > 0 || initialGoal.carbs > 0) && (
              <div className="text-sm text-foreground-secondary mt-1">
                Б: {initialGoal.protein}g | Ж: {initialGoal.fats}g | У: {initialGoal.carbs}g
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              ✏️ Изменить
            </Button>
            <CompleteDayButton />
          </div>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const goalData = {
        calories_goal: calValue,
        ...(proteinValue > 0 && { protein_goal: proteinValue }),
        ...(fatsValue > 0 && { fats_goal: fatsValue }),
        ...(carbsValue > 0 && { carbs_goal: carbsValue }),
      };
      
      // Выбираем эндпоинт в зависимости от того, создаём или обновляем цель
      const isUpdating = !!initialGoal;
      const endpoint = isUpdating ? '/api/goal/update-daily' : '/api/goal/set-daily';
      
      const response = isUpdating 
        ? await httpClient.patch(endpoint, goalData)
        : await httpClient.post(endpoint, goalData);

      if (!response.ok) {
        if (response.status === 401) {
          await signOut({ callbackUrl: '/login' });
          return;
        }
        const errorMessage = extractResponseError(response.data);
        
        if (response.status === 403 && errorMessage?.includes('PocketBase permissions error')) {
          throw new Error('PocketBase запрещает создание goals для обычного пользователя. Исправь Create rule в коллекции goals.');
        }
        
        if (response.status === 409) {
          // 409 - конфликт: существует активная цель, нельзя создать новую
          throw new Error(errorMessage || 'У вас есть незавершённая цель. Завершите её перед созданием новой.');
        }
        
        if (response.status === 404) {
          // 404 - при обновлении: не найдена активная цель
          throw new Error(errorMessage || 'Активная цель не найдена. Создайте новую цель.');
        }
        
        throw new Error(errorMessage || 'Ошибка при сохранении цели');
      }

      const goalId = extractGoalId(response.data);
      const responseData = response.data as any;
      
      const goal: DailyGoal = {
        calories: responseData.calories_goal || calValue,
        protein: responseData.protein_goal || proteinValue,
        fats: responseData.fats_goal || fatsValue,
        carbs: responseData.carbs_goal || carbsValue,
      };

      onSave(goal, goalId);
      setIsEditing(false);
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      console.error('Error saving goal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить текущую цель?')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await httpClient.delete('/api/goal/delete-daily');

      if (!response.ok) {
        if (response.status === 401) {
          await signOut({ callbackUrl: '/login' });
          return;
        }
        const errorMessage = extractResponseError(response.data);
        const msg = errorMessage || 'Ошибка при удалении цели';
        console.error('❌ Ошибка удаления цели:', {
          status: response.status,
          error: msg,
          fullResponse: response.data,
        });
        throw new Error(msg);
      }

      // Вызываем callback для удаления
      if (onDelete) {
        onDelete();
      }
      console.log('✅ Цель успешно удалена');
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      console.error('❌ Ошибка при удалении цели:', {
        message: errorMessage,
        error: err,
      });
    } finally {
      setIsDeleting(false);
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
            onChange={(e) => handleCaloriesChange(e.target.value)}
            disabled={isLoading || isDeleting}
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
            disabled={isLoading || isDeleting}
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
            disabled={isLoading || isDeleting}
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
            disabled={isLoading || isDeleting}
            min="0"
            max="500"
            placeholder="Опционально"
          />
        </div>

        {/* Кнопки */}
        <div className="flex gap-4 flex-wrap">
          <Button 
            type="submit" 
            disabled={isLoading || isDeleting}
          >
            {isLoading ? 'Сохраняется...' : 'Сохранить'}
          </Button>
          {initialGoal && (
            <>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsEditing(false)}
                disabled={isLoading || isDeleting}
              >
                Отмена
              </Button>
              <Button 
                type="button" 
                variant="danger"
                onClick={handleDeleteGoal}
                disabled={isLoading || isDeleting}
                className="text-error border-error hover:bg-error/10"
              >
                {isDeleting ? 'Удаляется...' : '🗑️ Удалить цель'}
              </Button>
            </>
          )}
        </div>
      </form>
    </Card>
  );
};