'use client';

import React from 'react';
import { DailyGoal } from '@/entities/food/model/types';
import { MacroCard } from './MacroCard';

interface MacroCardsStackProps {
  goal: DailyGoal;
  totalProtein: number;
  totalFats: number;
  totalCarbs: number;
  proteinProgress: number;
  fatsProgress: number;
  carbsProgress: number;
}

export const MacroCardsStack: React.FC<MacroCardsStackProps> = ({
  goal,
  totalProtein,
  totalFats,
  totalCarbs,
  proteinProgress,
  fatsProgress,
  carbsProgress,
}) => {
  if (!goal.protein && !goal.fats && !goal.carbs) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Белки */}
      {goal.protein > 0 && (
        <MacroCard
          label="Белки"
          current={totalProtein}
          target={goal.protein}
          progress={proteinProgress}
          iconSrc="/protein.svg"
          bgLight="bg-blue-100"
          bgDark="dark:bg-blue-800/20"
          progressColor="bg-blue-500"
        />
      )}

      {/* Жиры */}
      {goal.fats > 0 && (
        <MacroCard
          label="Жиры"
          current={totalFats}
          target={goal.fats}
          progress={fatsProgress}
          iconSrc="/fats.svg"
          bgLight="bg-yellow-100"
          bgDark="dark:bg-yellow-600/15"
          progressColor="bg-yellow-500"
        />
      )}

      {/* Углеводы */}
      {goal.carbs > 0 && (
        <MacroCard
          label="Углеводы"
          current={totalCarbs}
          target={goal.carbs}
          progress={carbsProgress}
          iconSrc="/carbohydrates.svg"
          bgLight="bg-purple-100"
          bgDark="dark:bg-purple-800/20"
          progressColor="bg-purple-500"
        />
      )}
    </div>
  );
};
