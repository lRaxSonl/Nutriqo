'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/ui/Card/Card';
import { Input } from '@/shared/ui/Input/Input';
import { Button } from '@/shared/ui/Button/Button';
import { DailyGoal } from '@/entities/food/model/types';

interface GoalSetterProps {
  onSave: (goal: DailyGoal) => void;
  initialGoal?: DailyGoal;
}

export const GoalSetter = ({ onSave, initialGoal }: GoalSetterProps) => {
  const [calories, setCalories] = useState(initialGoal?.calories.toString() || '2000');
  const [isEditing, setIsEditing] = useState(!initialGoal);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calValue = parseInt(calories) || 0;
    onSave({
      calories: calValue,
      protein: 0, // Для упрощения пока 0, можно добавить поля
      fats: 0,
      carbs: 0,
    });
    setIsEditing(false);
  };

  return (
    <Card title="Установите цель калорий" className="mb-6">
      <form onSubmit={handleSubmit} className="flex gap-4 items-end">
        <Input
          type="number"
          label="Ккал в день"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="w-40"
        />
        <Button type="submit">Сохранить</Button>
      </form>
    </Card>
  );
};