'use client';

import React from 'react';
import { FoodEntry, MealType } from '@/entities/food/model/types';

interface MealItemProps {
  item: FoodEntry;
  mealType: MealType;
  getMealIcon: (type: MealType) => string;
  onDelete: (id: string) => void;
}

export const MealItem: React.FC<MealItemProps> = ({
  item,
  mealType,
  getMealIcon,
  onDelete,
}) => {
  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="text-lg">{getMealIcon(mealType)}</div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white truncate">{item.name}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1 flex-wrap">
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-medium">
              {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      <div className="text-right ml-3">
        <div className="font-bold text-gray-900 dark:text-white text-base">{item.calories} <span className="text-xs font-normal text-gray-500 dark:text-gray-400">ккал</span></div>
        <div className="flex gap-2 text-xs font-medium mt-1 justify-end">
          <span className="text-blue-600 dark:text-blue-400">Б:{item.protein}г</span>
          <span className="text-yellow-600 dark:text-yellow-400">Ж:{item.fats}г</span>
          <span className="text-purple-600 dark:text-purple-400">У:{item.carbs}г</span>
        </div>
      </div>
      
      <button 
        onClick={() => onDelete(item.id)}
        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 ml-2 flex-shrink-0"
        title="Удалить"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
