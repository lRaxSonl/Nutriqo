'use client';

import React from 'react';
import { FoodEntry, MealType } from '@/entities/food/model/types';
import { MealItem } from './MealItem';

interface MealCardProps {
  mealType: MealType;
  meals: FoodEntry[];
  getMealIcon: (type: MealType) => string;
  getMealTitle: (type: MealType) => string;
  onDeleteEntry: (id: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  mealType,
  meals,
  getMealIcon,
  getMealTitle,
  onDeleteEntry,
}) => {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getMealIcon(mealType)}</span>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{getMealTitle(mealType)}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{meals.length} {meals.length === 1 ? 'блюдо' : 'блюд'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900 dark:text-white text-lg">{totalCalories} ккал</p>
        </div>
      </div>

      {/* Meals List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {meals.map((item) => (
          <MealItem
            key={item.id}
            item={item}
            mealType={mealType}
            getMealIcon={getMealIcon}
            onDelete={onDeleteEntry}
          />
        ))}
      </div>

      {/* Footer Summary */}
      <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-gray-500 dark:text-gray-400">Итого БЖУ:</span>
          <div className="flex gap-3">
            <span className="text-blue-600 dark:text-blue-400">Б:{totalProtein}г</span>
            <span className="text-yellow-600 dark:text-yellow-400">Ж:{totalFats}г</span>
            <span className="text-purple-600 dark:text-purple-400">У:{totalCarbs}г</span>
          </div>
        </div>
      </div>
    </div>
  );
};
