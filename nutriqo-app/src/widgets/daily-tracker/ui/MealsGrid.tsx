'use client';

import React from 'react';
import { FoodEntry, MealType } from '@/entities/food/model/types';
import { MealCard } from './MealCard';

interface MealsGridProps {
  mealsByType: Record<MealType, FoodEntry[]>;
  getMealIcon: (type: MealType) => string;
  getMealTitle: (type: MealType) => string;
  onDeleteEntry: (id: string) => void;
}

// Define meal order for consistent display
const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MealsGrid: React.FC<MealsGridProps> = ({
  mealsByType,
  getMealIcon,
  getMealTitle,
  onDeleteEntry,
}) => {
  // Filter to only show meal types that have entries
  const activeMeals = MEAL_ORDER.filter(
    (mealType) => mealsByType[mealType] && mealsByType[mealType].length > 0
  );

  if (activeMeals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {activeMeals.map((mealType) => (
        <MealCard
          key={mealType}
          mealType={mealType}
          meals={mealsByType[mealType]}
          getMealIcon={getMealIcon}
          getMealTitle={getMealTitle}
          onDeleteEntry={onDeleteEntry}
        />
      ))}
    </div>
  );
};
