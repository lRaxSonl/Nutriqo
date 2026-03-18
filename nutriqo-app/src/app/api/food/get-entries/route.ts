import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { EatenFood } from '@/shared/lib/models/EatenFood';
import { Goal } from '@/shared/lib/models/Goal';
import { logger } from '@/shared/lib/logger';

/**
 * GET /api/food/get-entries
 * Получить все съеденные продукты для цели пользователя за сегодня
 */
export async function GET(request: NextRequest) {
  try {
    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const pbToken = session.pbToken;
    if (!pbToken) {
      return NextResponse.json(
        { error: 'Session expired. Please sign in again.' },
        { status: 401 }
      );
    }

    // Получаем сегодняшнюю цель пользователя
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken);
    const goal = await authenticatedGoalModel.getGoalByDate(session.user.id);

    if (!goal) {
      // Нет цели - возвращаем пустой массив
      return NextResponse.json([], { status: 200 });
    }

    // Получаем все съеденные продукты для этой цели
    const authenticatedEatenFoodModel = new EatenFood().withAuthToken(pbToken);
    const entries = await authenticatedEatenFoodModel.getEatenFoodByGoal(goal.id);

    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    // Безопасное логирование без раскрытия деталей
    logger.error('Failed to get food entries', 'FOOD_GET_ENTRIES_ERROR', {
      errorMessage: error instanceof Error ? error.message : 'Unknown',
    });
    
    return NextResponse.json(
      { error: 'An error occurred while retrieving your food entries' },
      { status: 500 }
    );
  }
}
