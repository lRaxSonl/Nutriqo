'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { httpClient } from '@/shared/api';
import { Card } from '@/shared/ui/Card/Card';
import { Button } from '@/shared/ui/Button/Button';
import { logger } from '@/shared/lib/logger';
import {
  calculateStatistics,
  calculateMacroPercentages,
  calculateCompletionRate,
} from '@/features/statistics-calculation/model';
import { StatisticsData } from '@/entities/statistics/model';

interface StatisticPageState {
  stats: StatisticsData | null;
  isLoading: boolean;
  error: string | null;
}

export default function StatisticsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchStatistics = async () => {
      try {
        setError(null);
        const response = await httpClient.get('/api/goal/get-all');

        if (!response.ok) {
          throw new Error('Ошибка при загрузке статистики');
        }

        const goals = response.data as any[];

        // Use pure function to calculate statistics
        const calculatedStats = calculateStatistics(goals || []);

        setStats(calculatedStats);
        setLastUpdated(new Date().toLocaleString('ru-RU'));

        logger.info('Statistics loaded successfully');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Ошибка при загрузке статистики';
        setError(errorMsg);
        logger.error('Failed to load statistics', 'STATS_ERROR', {
          errorMessage: errorMsg,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [session?.user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500 dark:text-gray-400">Загружаем статистику...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error/10 border border-error rounded-lg p-6 text-center">
        <p className="text-error font-medium mb-4">⚠️ {error}</p>
        <Button onClick={() => window.location.reload()}>
          Попробовать ещё раз
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <p className="text-foreground-secondary">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">📊 Статистика</h1>
        <p className="text-foreground-secondary">Обновлено: {lastUpdated || 'Загрузка...'}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{stats.totalGoals}</div>
          <p className="text-sm text-foreground-secondary">Всего целей</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-success">{stats.finishedGoals}</div>
          <p className="text-sm text-foreground-secondary">Завершено</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-warning">{stats.unfinishedGoals}</div>
          <p className="text-sm text-foreground-secondary">Активных</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">
            {calculateCompletionRate(stats.totalGoals, stats.finishedGoals)}%
          </div>
          <p className="text-sm text-foreground-secondary">Завершения</p>
        </Card>
      </div>

      {/* Average Values */}
      <Card title="📈 Средние значения целей" className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Calories */}
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <p className="text-sm text-foreground-secondary mb-2">Средние калории</p>
            <div className="text-2xl font-bold text-primary">{stats.avgCalories}</div>
            <p className="text-xs text-foreground-secondary mt-1">ккал/день</p>
          </div>

          {/* Protein */}
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <p className="text-sm text-foreground-secondary mb-2">Средние белки</p>
            <div className="text-2xl font-bold text-blue-500">{stats.avgProtein}</div>
            <p className="text-xs text-foreground-secondary mt-1">g/день</p>
          </div>

          {/* Fats */}
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <p className="text-sm text-foreground-secondary mb-2">Средние жиры</p>
            <div className="text-2xl font-bold text-yellow-500">{stats.avgFats}</div>
            <p className="text-xs text-foreground-secondary mt-1">g/день</p>
          </div>

          {/* Carbs */}
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            <p className="text-sm text-foreground-secondary mb-2">Средние углеводы</p>
            <div className="text-2xl font-bold text-orange-500">{stats.avgCarbs}</div>
            <p className="text-xs text-foreground-secondary mt-1">g/день</p>
          </div>
        </div>

        {/* БЖУ Соотношение */}
        {stats.avgCalories > 0 && (() => {
          const macros = calculateMacroPercentages(
            stats.avgCalories,
            stats.avgProtein,
            stats.avgFats,
            stats.avgCarbs
          );
          return (
            <div className="mt-6 p-4 bg-background/50 rounded-lg border border-border">
              <p className="text-sm text-foreground-secondary mb-3">Соотношение БЖУ</p>
              <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
                <div
                  className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    width: `${macros.proteinPercent}%`,
                    minWidth: '40px',
                  }}
                >
                  Б {macros.proteinPercent}%
                </div>
                <div
                  className="bg-yellow-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    width: `${macros.fatsPercent}%`,
                    minWidth: '40px',
                  }}
                >
                  Ж {macros.fatsPercent}%
                </div>
                <div
                  className="bg-orange-500 flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    width: `${macros.carbsPercent}%`,
                    minWidth: '40px',
                  }}
                >
                  У {macros.carbsPercent}%
                </div>
              </div>
            </div>
          );
        })()}
      </Card>

      {/* Info */}
      {stats.totalGoals === 0 && (
        <Card className="p-6 text-center">
          <p className="text-foreground-secondary">
            Здесь будет показана статистика по вашим целям. Начните с создания первой цели! 🎯
          </p>
        </Card>
      )}
    </div>
  );
}
