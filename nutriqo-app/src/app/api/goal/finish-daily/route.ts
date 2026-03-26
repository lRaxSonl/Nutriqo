import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { Goal } from '@/shared/lib/models/Goal';
import { logger } from '@/shared/lib/logger';

/**
 * PATCH /api/goal/finish-daily
 * Отметить текущую цель как завершённую
 */
export async function PATCH(request: NextRequest) {
  try {
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

    // Получаем текущую цель пользователя
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken);
    
    const currentGoal = await authenticatedGoalModel.getGoalByDate(session.user.id, '');
    
    if (!currentGoal) {
      return NextResponse.json(
        { error: 'No active goal found' },
        { status: 404 }
      );
    }

    // Отмечаем цель как завершённую
    const updatedGoal = await authenticatedGoalModel.update(currentGoal.id, {
      is_finished: true,
    } as any);

    logger.info('Goal marked as finished successfully');

    return NextResponse.json(updatedGoal, { status: 200 });
  } catch (error) {
    logger.error('Failed to finish daily goal', 'GOAL_FINISH_ERROR', {
      errorMessage: error instanceof Error ? error.message : 'Unknown',
    });

    return NextResponse.json(
      { error: 'An error occurred while finishing the goal' },
      { status: 500 }
    );
  }
}
