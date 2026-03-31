import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSession } from '@/shared/lib/verifyJWT';
import { Goal } from '@/shared/lib/models/Goal';
import { logger } from '@/shared/lib/logger';

/**
 * PATCH /api/goal/finish-daily
 * Отметить текущую цель как завершённую
 * SECURITY: Требует верифицированный JWT
 */
export async function PATCH(request: NextRequest) {
  try {
    // SECURITY: Verify JWT signature and get full session
    const verifiedSession = await getVerifiedSession();
    
    if (!verifiedSession?.user?.id) {
      logger.warn('Unauthorized finish-daily attempt - invalid JWT');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const pbToken = verifiedSession.pbToken;
    if (!pbToken) {
      logger.error('Session verified but pbToken missing', 'PBTOKEN_MISSING');
      return NextResponse.json(
        { error: 'Session expired. Please sign in again.' },
        { status: 401 }
      );
    }

    // Получаем текущую цель пользователя
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken);
    
    const currentGoal = await authenticatedGoalModel.getGoalByDate(verifiedSession.user.id, '');
    
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
