import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { Goal } from '@/shared/lib/models/Goal';
import { EatenFood } from '@/shared/lib/models/EatenFood';
import { logger } from '@/shared/lib/logger';

/**
 * DELETE /api/goal/delete-daily
 * Удалить ежедневную цель текущего пользователя и все связанные продукты
 */
export async function DELETE(request: NextRequest) {
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

    // Create authenticated model instances with user's PocketBase token
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken);
    const authenticatedEatenFoodModel = new EatenFood().withAuthToken(pbToken);

    // Получаем последнюю цель пользователя
    const currentGoal = await authenticatedGoalModel.getGoalByDate(session.user.id);

    if (!currentGoal) {
      return NextResponse.json(
        { error: 'No goal found to delete' },
        { status: 404 }
      );
    }

    // Получаем все продукты, связанные с этой целью
    const foodEntries = await authenticatedEatenFoodModel.getEatenFoodByGoal(currentGoal.id);

    // Удаляем все связанные продукты
    for (const entry of foodEntries) {
      try {
        await authenticatedEatenFoodModel.delete(entry.id);
      } catch (deleteError) {
        logger.error('Failed to delete related food entry', 'FOOD_DELETE_ERROR', {
          entryId: entry.id,
          goalId: currentGoal.id,
          errorMessage: deleteError instanceof Error ? deleteError.message : 'Unknown',
        });
        // Продолжаем удаление остальных записей
      }
    }

    // Теперь удаляем саму цель
    await authenticatedGoalModel.delete(currentGoal.id);

    return NextResponse.json(
      { success: true, message: 'Goal and related food entries deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    // Безопасное логирование с детальной информацией
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error('Failed to delete daily goal', 'GOAL_DELETE_ERROR', {
      errorMessage,
      stack: errorStack,
    });

    // Логируем в консоль для диагностики
    console.error('Goal deletion failed:', {
      message: errorMessage,
      stack: errorStack,
    });

    // Раскрываем информативные ошибки
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    if (errorMessage.includes('permissions') || errorMessage.includes('Access denied')) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this goal' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while deleting the goal. Please try again.' },
      { status: 500 }
    );
  }
}
