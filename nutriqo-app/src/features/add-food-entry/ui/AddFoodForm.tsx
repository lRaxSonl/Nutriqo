'use client';

import React, { useState } from 'react';
// Импортируем наши UI компоненты из Shared
import { Card } from '@/shared/ui/Card/Card';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { Select } from '@/shared/ui/Select/Select';
// Импортируем типы сущности
import { FoodEntry, MealType } from '@/entities/food/model/types';
import { now } from 'next-auth/client/_utils';

interface AddFoodFormProps {
  onAdd: (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => void;
}

export const AddFoodForm = ({ onAdd }: AddFoodFormProps) => {
  // Состояния формы
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');

  // Опции для селекта
  const mealOptions = [
    { value: 'breakfast', label: '🍳 Завтрак' },
    { value: 'lunch', label: '🍲 Обед' },
    { value: 'dinner', label: '🍽️ Ужин' },
    { value: 'snack', label: '🍎 Перекус' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Простая валидация
    if (!name.trim() || !calories) return;

    // Вызываем функцию передачи данных наверх (в Widget)
    onAdd({
        name: name.trim(),
        calories: parseInt(calories),
        protein: 0, // Пока заглушки, можно добавить поля позже
        fats: 0,
        carbs: 0,
        mealType,
        date: new Date(now()), // Текущая дата и время
    });

    // Очищаем форму
    setName('');
    setCalories('');
    setMealType('breakfast');
  };

  return (
    <Card title="Добавить продукт" className="mb-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* Поле названия (занимает 5 колонок на больших экранах) */}
        <div className="md:col-span-5 text-black">
          <Input
            placeholder="Название (например, Яблоко)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Поле калорий (занимает 3 колонки) */}
        <div className="md:col-span-3 text-black">
          <Input
            type="number"
            placeholder="Ккал"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            required
            min="0"
          />
        </div>

        {/* Выбор типа еды (занимает 2 колонки) */}
        <div className="md:col-span-2 text-black">
          <Select
            options={mealOptions}
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
          />
        </div>

        {/* Кнопка (занимает 2 колонки) */}
        <div className="md:col-span-2 text-black">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!name.trim() || !calories}
          >
            Добавить
          </Button>
        </div>
      </form>
    </Card>
  );
};