'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/shared/ui/Card/Card';
import { Badge } from '@/shared/ui/Badge/Badge';
import { Button } from '@/shared/ui/Button/Button';
import { GoalSetter } from '@/features/set-daily-goals/ui/GoalSetter'; // Проверьте путь к файлу!
import { AddFoodForm } from '@/features/add-food-entry/ui/AddFoodForm';
import { DailyGoal, FoodEntry, MealType } from '@/entities/food/model/types';

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
        const response = await fetch('/api/goal/get-daily');
        
        if (response.ok) {
          const goalData = await response.json();
          setGoal({
            calories: goalData.calories_goal,
            protein: goalData.protein_goal || 0,
            fats: goalData.fats_goal || 0,
            carbs: goalData.carbs_goal || 0,
          });
          setGoalId(goalData.id);
          
          // Загружаем съеденные продукты для этой цели
          try {
            const entriesResponse = await fetch('/api/food/get-entries');
            if (entriesResponse.ok) {
              const entriesData = await entriesResponse.json();
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
        } else if (response.status === 404) {
          // Цели за сегодня нет - пользователь должен создать её
          setGoal(null);
          setGoalId(null);
          setEntries([]);
        } else {
          const errorData = await response.json();
          const errorMsg = errorData?.error || `Failed to load daily goal: ${response.status}`;
          setLoadingError(errorMsg);
          console.error('Failed to load daily goal:', errorMsg);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setLoadingError(errorMsg);
        console.error('Error loading daily goal:', error);
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

  // Обработчик добавления записи (приходит из формы)
  const handleAddEntry = (data: FoodEntry) => {
    setEntries((prev) => [data, ...prev]);
  };

  // Обработчик удаления записи
  const handleDeleteEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/food/delete-entry?entryId=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to delete entry:', errorData.error);
        return;
      }

      // Удаляем из локального состояния только если успешно удалили с сервера
      setEntries((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting food entry:', error);
    }
  };

  // Подсчет итогов
  const totalCalories = useMemo(() => 
    entries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0), 
  [entries]);

  const progress = goal ? Math.min((totalCalories / goal.calories) * 100, 100) : 0;

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
      <Card className="mb-6 bg-background border-border">
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-foreground-secondary">Загружаем вашу цель на сегодня...</div>
        </div>
      </Card>
    );
  }

  if (loadingError) {
    return (
      <Card className="mb-6 bg-background border-border">
        <div className="flex items-center gap-3 py-4 px-4">
          <div className="text-error text-xl">⚠️</div>
          <div className="flex-1">
            <p className="text-error font-medium">Ошибка загрузки цели:</p>
            <p className="text-foreground-secondary text-sm">{loadingError}</p>
          </div>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="w-full mt-3"
          variant="secondary"
        >
          Попробовать ещё раз
        </Button>
      </Card>
    );
  }

  if (!goal) {
    return <GoalSetter onSave={handleSaveGoal} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Блок цели (теперь в режиме просмотра) */}
      <GoalSetter initialGoal={goal} onSave={handleSaveGoal} />

      {/* Прогресс бар */}
      <Card className="bg-gradient-to-r from-background to-background-secondary border-border">
        <div className="flex justify-between items-end mb-3">
          <div>
            <span className="text-sm text-foreground font-medium uppercase tracking-wide">Съедено сегодня</span>
            <div className="text-4xl font-bold text-foreground mt-1">
              {totalCalories} <span className="text-lg font-normal text-primary">/ {goal.calories} ккал</span>
            </div>
          </div>
          <Badge variant={progress > 100 ? 'default' : 'success'} className="text-sm px-3 py-1">
            {Math.round(progress)}%
          </Badge>
        </div>
        
        {/* Полоска прогресса */}
        <div className="w-full bg-primary/20 rounded-full h-5 overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-700 ease-out ${
              progress > 100 ? 'bg-error' : 'bg-success'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress > 100 && (
          <p className="text-error text-sm mt-2 font-medium">⚠️ Цель превышена на {Math.round(progress - 100)}%</p>
        )}
      </Card>

      {/* Форма добавления */}
      {goalId && (
        <AddFoodForm 
          goalId={goalId} 
          onAdd={handleAddEntry} 
        />
      )}

      {/* Список по категориям */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(groupedMeals) as MealType[]).map((type) => {
          const meals = groupedMeals[type];
          if (meals.length === 0) return null;

          const mealCalories = meals.reduce((s, m) => s + (Number(m.calories) || 0), 0);

          return (
            <Card key={type} title={`${mealLabels[type]} (${mealCalories} ккал)`} className="min-h-[160px]">
              <ul className="space-y-3">
                {meals.map((item) => (
                  <li key={item.id} className="flex justify-between items-center group p-2 hover:bg-background-secondary rounded-lg transition-colors">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-xs text-foreground-secondary">
                        {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">{item.calories} ккал</span>
                      <button 
                        onClick={() => handleDeleteEntry(item.id)}
                        className="text-foreground-secondary hover:text-error opacity-0 group-hover:opacity-100 transition-all p-1"
                        title="Удалить"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
        
        {entries.length === 0 && (
          <div className="col-span-full text-center py-12 bg-background-secondary rounded-xl border border-dashed border-border">
            <p className="text-foreground-secondary text-lg">🍽️ Сегодня вы ещё ничего не записали.</p>
            <p className="text-foreground-secondary text-sm mt-1">Начните с добавления завтрака!</p>
          </div>
        )}
      </div>
    </div>
  );
};