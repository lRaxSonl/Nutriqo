'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
// Импортируем наши UI компоненты из Shared
import { Card } from '@/shared/ui/Card/Card';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { Select } from '@/shared/ui/Select/Select';
// Импортируем типы сущности
import { FoodEntry, MealType } from '@/entities/food/model/types';

interface AddFoodFormProps {
  goalId: string;
  onAdd: (entry: FoodEntry) => void;
  onError?: (error: Error) => void;
}

export const AddFoodForm = ({ goalId, onAdd, onError }: AddFoodFormProps) => {
  const { data: session } = useSession();
  
  // Состояния формы
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Опции для селекта
  const mealOptions = [
    { value: 'breakfast', label: '🍳 Завтрак' },
    { value: 'lunch', label: '🍲 Обед' },
    { value: 'dinner', label: '🍽️ Ужин' },
    { value: 'snack', label: '🍎 Перекус' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);

    // Простая валидация
    if (!name.trim() || !calories) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    const parsedCalories = Number(calories);
    if (!Number.isFinite(parsedCalories) || parsedCalories <= 0) {
      setError('Калории должны быть больше 0');
      return;
    }

    if (!session?.user?.id) {
      setError('Пожалуйста, войдите в аккаунт');
      return;
    }

    setIsLoading(true);

    try {
      // Вызываем API endpoint для сохранения в БД
      const response = await fetch('/api/food/add-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          calories: parsedCalories,
          meal_type: mealType,
          goal_id: goalId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при добавлении продукта');
      }

      const entry = await response.json();

      // Преобразуем ответ в формат FoodEntry для UI
      const uiEntry: FoodEntry = {
        id: entry.id,
        name: entry.name,
        calories: Number(entry.calories) || 0,
        protein: Number(entry.protein) || 0,
        fats: Number(entry.fats) || 0,
        carbs: Number(entry.carbs) || 0,
        mealType: entry.meal_type,
        date: entry.created_at ? new Date(entry.created_at) : new Date(),
      };

      // Вызываем колбэк на успешное добавление
      onAdd(uiEntry);

      // Очищаем форму
      setName('');
      setCalories('');
      setMealType('breakfast');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      
      if (onError && err instanceof Error) {
        onError(err);
      }

      console.error('Error adding food entry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Добавить продукт" className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Сообщение об ошибке */}
        {error && (
          <div className="p-3 bg-error/10 border border-error rounded-md">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* Поле названия (занимает 5 колонок на больших экранах) */}
          <div className="md:col-span-5">
            <Input
              placeholder="Название (например, Яблоко)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Поле калорий (занимает 3 колонки) */}
          <div className="md:col-span-3">
            <Input
              type="number"
              placeholder="Ккал"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              disabled={isLoading}
              required
              min="0"
            />
          </div>

          {/* Выбор типа еды (занимает 2 колонки) */}
          <div className="md:col-span-2">
            <Select
              options={mealOptions}
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              disabled={isLoading}
            />
          </div>

          {/* Кнопка (занимает 2 колонки) */}
          <div className="md:col-span-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!name.trim() || !calories || isLoading}
            >
              {isLoading ? 'Добавляется...' : 'Добавить'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};