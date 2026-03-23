'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { httpClient } from '@/shared/api';
import { Button } from '@/shared/ui/Button/Button';
import { GoalSetter } from '@/features/set-daily-goals/ui/GoalSetter';
import { AddFoodForm } from '@/features/add-food-entry/ui/AddFoodForm';
import { DailyGoal, FoodEntry, MealType } from '@/entities/food/model/types';
import { CaloriesCard, MacroCardsStack, MealsGrid, EmptyState } from './index';

// Вспомогательный тип для группировки
type GroupedMeals = Record<MealType, FoodEntry[]>;

export const DailyTrackerWidget = () => {
  const { data: session } = useSession();
  
  // Состояние цели
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [isLoadingGoal, setIsLoadingGoal] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // Состояние списка записей
  const [entries, setEntries] = useState<FoodEntry[]>([]);

  // Загрузка цели за сегодня при входе пользователя
  useEffect(() => {
    if (!session?.user?.id) {
      setIsLoadingGoal(false);
      return;
    }

    const loadDailyGoal = async () => {
      setLoadingError(null);
      try {
        const response = await httpClient.get('/api/goal/get-daily');
        
        if (response.ok) {
          const goalData = response.data as any;
          setGoal({
            calories: goalData.calories_goal,
            protein: goalData.protein_goal || 0,
            fats: goalData.fats_goal || 0,
            carbs: goalData.carbs_goal || 0,
          });
          setGoalId(goalData.id);
          
          // Загружаем съеденные продукты для этой цели
          try {
            const entriesResponse = await httpClient.get('/api/food/get-entries');
            if (entriesResponse.ok) {
              const entriesData = entriesResponse.data as any[];
              const formattedEntries = entriesData.map((entry: any) => ({
                id: entry.id,
                name: entry.name,
                calories: Number(entry.calories) || 0,
                protein: Number(entry.protein) || 0,
                fats: Number(entry.fats) || 0,
                carbs: Number(entry.carbs) || 0,
                mealType: entry.meal_type,
                date: entry.created_at ? new Date(entry.created_at) : new Date(),
              }));
              setEntries(formattedEntries);
            }
          } catch (entriesError) {
            console.error('Error loading entries:', entriesError);
            // Don't set error state for entries - goal loaded successfully
          }
        }
      } catch (error: any) {
        // Проверяем статус ошибки
        if (error?.status === 404) {
          // Цели за сегодня нет - пользователь должен создать её
          setGoal(null);
          setGoalId(null);
          setEntries([]);
        } else {
          const errorMsg = error?.message || 'Failed to load daily goal';
          setLoadingError(errorMsg);
          console.error('Failed to load daily goal:', errorMsg);
        }
      } finally {
        setIsLoadingGoal(false);
      }
    };

    loadDailyGoal();
  }, [session?.user?.id]);

  // Обработчик сохранения цели
  const handleSaveGoal = (savedGoal: DailyGoal, id?: string) => {
    setGoal(savedGoal);
    if (id) {
      setGoalId(id);
    }
  };

  // Обработчик удаления цели
  const handleDeleteGoal = () => {
    setGoal(null);
    setGoalId(null);
    setEntries([]);
  };

  // Обработчик добавления записи (приходит из формы)
  const handleAddEntry = (data: FoodEntry) => {
    setEntries((prev) => [data, ...prev]);
  };

  // Обработчик удаления записи
  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      return;
    }

    try {
      const response = await httpClient.delete(`/api/food/delete-entry?entryId=${id}`);

      if (!response.ok) {
        const errorData = response.data as Record<string, unknown>;
        const errorMsg = typeof errorData?.error === 'string' 
          ? errorData.error 
          : 'Ошибка при удалении продукта';
        console.error('❌ Ошибка удаления продукта:', {
          status: response.status,
          error: errorMsg,
          fullResponse: errorData,
        });
        alert(`Ошибка: ${errorMsg}`);
        return;
      }

      // Удаляем из локального состояния только если успешно удалили с сервера
      setEntries((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Ошибка при удалении продукта';
      console.error('Error deleting food entry:', errorMsg);
      // Можно добавить toast уведомление здесь
    }
  };

  // Функция для определения цвета прогресс-бара
  const getProgressColor = (percent: number) => {
    if (percent <= 80) return 'bg-success';
    if (percent <= 99) return 'bg-warning';
    return 'bg-error';
  };

  // Функции для получения иконки и подписи приема пищи
  const getMealIcon = (mealType: MealType): string => {
    switch (mealType) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🍲';
      case 'dinner': return '🍽️';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const getMealTitle = (mealType: MealType): string => {
    switch (mealType) {
      case 'breakfast': return 'Завтрак';
      case 'lunch': return 'Обед';
      case 'dinner': return 'Ужин';
      case 'snack': return 'Перекус';
      default: return 'Прием пищи';
    }
  };

  // Подсчет итогов
  const totalCalories = useMemo(() => 
    entries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0), 
  [entries]);

  const totalProtein = useMemo(() => 
    entries.reduce((sum, item) => sum + (Number(item.protein) || 0), 0),
  [entries]);

  const totalFats = useMemo(() =>
    entries.reduce((sum, item) => sum + (Number(item.fats) || 0), 0),
  [entries]);

  const totalCarbs = useMemo(() =>
    entries.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0),
  [entries]);

  const caloriesProgress = goal ? Math.min((totalCalories / goal.calories) * 100, 100) : 0;
  const proteinProgress = goal && goal.protein > 0 ? Math.min((totalProtein / goal.protein) * 100, 100) : 0;
  const fatsProgress = goal && goal.fats > 0 ? Math.min((totalFats / goal.fats) * 100, 100) : 0;
  const carbsProgress = goal && goal.carbs > 0 ? Math.min((totalCarbs / goal.carbs) * 100, 100) : 0;

  // Группировка по приемам пищи
  const groupedMeals = useMemo(() => {
    return entries.reduce((acc, item) => {
        if (!acc[item.mealType]) {
            acc[item.mealType] = [];
        }
        acc[item.mealType].push(item);
        return acc;
    }, {} as GroupedMeals);
  }, [entries]);

  const mealLabels: Record<MealType, string> = {
    breakfast: 'Завтрак',
    lunch: 'Обед',
    dinner: 'Ужин',
    snack: 'Перекус',
  };

  // Если цель еще не установлена, показываем только настройку цели
  if (isLoadingGoal) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <div className="animate-pulse">Загружаем вашу цель на сегодня...</div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium mb-2">⚠️ Ошибка загрузки цели:</p>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{loadingError}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Попробовать ещё раз
        </Button>
      </div>
    );
  }

  if (!goal) {
    return <GoalSetter onSave={handleSaveGoal} />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Блок цели (теперь в режиме просмотра) */}
      <GoalSetter initialGoal={goal} onSave={handleSaveGoal} onDelete={handleDeleteGoal} />

      {/* Главный блок прогресса калорий и БЖУ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CaloriesCard
            totalCalories={totalCalories}
            goal={goal}
            caloriesProgress={caloriesProgress}
            getProgressColor={getProgressColor}
          />
        </div>

        {(goal.protein > 0 || goal.fats > 0 || goal.carbs > 0) && (
          <div>
            <MacroCardsStack
              goal={goal}
              totalProtein={totalProtein}
              totalFats={totalFats}
              totalCarbs={totalCarbs}
              proteinProgress={proteinProgress}
              fatsProgress={fatsProgress}
              carbsProgress={carbsProgress}
            />
          </div>
        )}
      </div>

      {/* Форма добавления */}
      {goalId && (
        <div className="w-full">
          <AddFoodForm 
            goalId={goalId} 
            onAdd={handleAddEntry} 
          />
        </div>
      )}

      {/* Список по категориям или пустое состояние */}
      {entries.length > 0 ? (
        <MealsGrid
          mealsByType={groupedMeals}
          getMealIcon={getMealIcon}
          getMealTitle={getMealTitle}
          onDeleteEntry={handleDeleteEntry}
        />
      ) : (
        <EmptyState onAddEntry={() => {
          // Scroll to the AddFoodForm
          const form = document.getElementById('add-food-form');
          form?.scrollIntoView({ behavior: 'smooth' });
        }} />
      )}
    </div>
  );
};