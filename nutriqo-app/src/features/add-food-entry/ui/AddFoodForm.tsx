'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { httpClient } from '@/shared/api';
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
  const [protein, setProtein] = useState('');
  const [fats, setFats] = useState('');
  const [carbs, setCarbs] = useState('');
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

  // Функция для автоматического расчета БЖУ из калорий
  const calculateMacros = () => {
    const cal = parseInt(calories) || 0;
    if (cal <= 0) {
      setError('Введите калории для расчета');
      return;
    }

    // Стандартное соотношение: Б 20%, Ж 30%, У 50%
    const calculatedProtein = Math.round((cal * 0.2) / 4);
    const calculatedFats = Math.round((cal * 0.3) / 9);
    const calculatedCarbs = Math.round((cal * 0.5) / 4);

    setProtein(calculatedProtein.toString());
    setFats(calculatedFats.toString());
    setCarbs(calculatedCarbs.toString());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setError(null);

    // Простая валидация
    if (!name.trim() || !calories) {
      setError('Пожалуйста, заполните хотя бы название и калории');
      return;
    }

    const parsedCalories = Number(calories);
    if (!Number.isFinite(parsedCalories) || parsedCalories <= 0) {
      setError('Калории должны быть больше 0');
      return;
    }

    const parsedProtein = protein ? Number(protein) : 0;
    const parsedFats = fats ? Number(fats) : 0;
    const parsedCarbs = carbs ? Number(carbs) : 0;

    if (parsedProtein < 0 || parsedProtein > 500) {
      setError('Белки должны быть от 0 до 500g');
      return;
    }

    if (parsedFats < 0 || parsedFats > 500) {
      setError('Жиры должны быть от 0 до 500g');
      return;
    }

    if (parsedCarbs < 0 || parsedCarbs > 500) {
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
      const response = await httpClient.post('/api/food/add-entry', {
        name: name.trim(),
        calories: parsedCalories,
        ...(parsedProtein > 0 && { protein: parsedProtein }),
        ...(parsedFats > 0 && { fats: parsedFats }),
        ...(parsedCarbs > 0 && { carbs: parsedCarbs }),
        meal_type: mealType,
        goal_id: goalId,
      });

      if (!response.ok) {
        const errorMessage = (response.data as Record<string, string | unknown>)?.error;
        throw new Error(typeof errorMessage === 'string' ? errorMessage : 'Ошибка при добавлении продукта');
      }

      const entry = response.data as any;

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
      setProtein('');
      setFats('');
      setCarbs('');
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

        <div className="space-y-4 ">
          {/* Первая строка: Название, Калории, Тип еды */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Название */}
            <div className="md:col-span-6">
              <Input
                label="Название"
                placeholder="Например, Яблоко"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Калории */}
            <div className="md:col-span-3">
              <Input
                type="number"
                label="Ккал"
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                disabled={isLoading}
                required
                min="0"
              />
            </div>

            {/* Тип еды */}
            <div className="md:col-span-3">
              <Select
                label="Тип еды"
                options={mealOptions}
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* БЖУ поля */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Белки */}
            <div className="md:col-span-3">
              <Input
                type="number"
                label="Белки (g)"
                placeholder="Опционально"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                disabled={isLoading}
                min="0"
                max="500"
              />
            </div>

            {/* Жиры */}
            <div className="md:col-span-3">
              <Input
                type="number"
                label="Жиры (g)"
                placeholder="Опционально"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                disabled={isLoading}
                min="0"
                max="500"
              />
            </div>

            {/* Углеводы */}
            <div className="md:col-span-3">
              <Input
                type="number"
                label="Углеводы (g)"
                placeholder="Опционально"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                disabled={isLoading}
                min="0"
                max="500"
              />
            </div>

            {/* Кнопка "Рассчитать" */}
            <div className="md:col-span-3 flex items-end">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={calculateMacros}
                disabled={!calories || isLoading}
              >
                📊 Рассчитать
              </Button>
            </div>
          </div>

          {/* Кнопка "Добавить" на весь размер */}
          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || !calories || isLoading}
          >
            {isLoading ? '⏳ Добавляется...' : '➕ Добавить продукт'}
          </Button>
        </div>
      </form>
    </Card>
  );
};