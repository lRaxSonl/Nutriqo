'use client';

import React from 'react';
import { DailyGoal } from '@/entities/food/model/types';

interface CaloriesCardProps {
  totalCalories: number;
  goal: DailyGoal;
  caloriesProgress: number;
  getProgressColor: (percent: number) => string;
}

export const CaloriesCard: React.FC<CaloriesCardProps> = ({
  totalCalories,
  goal,
  caloriesProgress,
  getProgressColor,
}) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 dark:bg-orange-900/10 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
      
      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Калории</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{totalCalories}</span>
            <span className="text-xl text-gray-400 dark:text-gray-500 font-medium">/ {goal.calories}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Осталось: <span className={caloriesProgress > 100 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
              {Math.max(0, goal.calories - totalCalories)} ккал
            </span>
          </p>
        </div>

        {/* Главная полоска прогресса калорий */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-700 ease-out ${getProgressColor(caloriesProgress)} rounded-full`}
              style={{ width: `${caloriesProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">{Math.round(caloriesProgress)}%</span>
            {caloriesProgress > 100 && (
              <span className="text-orange-600 dark:text-orange-400 font-medium">⚠️ Превышено на {Math.round(caloriesProgress - 100)}%</span>
            )}
          </div>
        </div>

        {/* БЖУ краткая информация */}
        {(goal.protein > 0 || goal.fats > 0 || goal.carbs > 0) && (
          <div className="pt-2 flex gap-4 justify-start">
            {goal.protein > 0 && (
              <div className="text-center">
                <span className="block text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">Белки</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{Math.round(goal.protein)}г</span>
              </div>
            )}
            {goal.fats > 0 && (
              <div className="text-center">
                <span className="block text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">Жиры</span>
                <span className="font-bold text-yellow-600 dark:text-yellow-400">{Math.round(goal.fats)}г</span>
              </div>
            )}
            {goal.carbs > 0 && (
              <div className="text-center">
                <span className="block text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">Углеводы</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{Math.round(goal.carbs)}г</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
