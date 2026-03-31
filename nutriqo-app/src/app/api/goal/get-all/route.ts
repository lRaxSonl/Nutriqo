import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSession } from '@/shared/lib/verifyJWT';
import { Goal } from '@/shared/lib/models/Goal';
import { logger } from '@/shared/lib/logger';

/**
 * GET /api/goal/get-all
 * Получить все цели пользователя для статистики
 * SECURITY: Требует верифицированный JWT
 */
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Verify JWT signature and get full session
    const verifiedSession = await getVerifiedSession();
    
    if (!verifiedSession?.user?.id) {
      logger.warn('Unauthorized get-all goals attempt - invalid JWT');
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

    // Получаем все цели пользователя
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken);
    const goals = await authenticatedGoalModel.getGoalsByUser(verifiedSession.user.id);

    return NextResponse.json(goals, { status: 200 });
  } catch (error) {
    logger.error('Failed to fetch all goals', 'GOALS_GET_ALL_ERROR', {
      errorMessage: error instanceof Error ? error.message : 'Unknown',
    });

    return NextResponse.json(
      { error: 'An error occurred while fetching goals' },
      { status: 500 }
    );
  }
}
