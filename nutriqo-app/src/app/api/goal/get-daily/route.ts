import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSession } from '@/shared/lib/verifyJWT';
import { Goal } from '@/shared/lib/models/Goal';
import { logger } from '@/shared/lib/logger';

/**
 * GET /api/goal/get-daily
 * Получить цель за сегодня для текущего пользователя
 * SECURITY: Требует верифицированный JWT
 */
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Verify JWT signature and get full session
    const verifiedSession = await getVerifiedSession();
    
    if (!verifiedSession?.user?.id) {
      logger.warn('Unauthorized get-daily goal attempt - invalid JWT');
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

    // Получаем активную (не завершённую) цель пользователя
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken!);

    let goal;
    try {
      goal = await authenticatedGoalModel.getActiveGoal(verifiedSession.user.id);
    } catch (fetchError) {
      console.error('[GET /api/goal/get-daily] Error fetching active goal:', fetchError);
      throw fetchError;
    }

    if (!goal) {
      return NextResponse.json(
        { error: 'No goal found' },
        { status: 404 }
      );
    }

    return NextResponse.json(goal, { status: 200 });
  } catch (error) {
    console.error('[GET /api/goal/get-daily] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
