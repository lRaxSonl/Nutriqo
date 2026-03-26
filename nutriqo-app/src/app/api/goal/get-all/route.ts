import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { Goal } from '@/shared/lib/models/Goal';
import { logger } from '@/shared/lib/logger';

/**
 * GET /api/goal/get-all
 * Получить все цели пользователя для статистики
 */
export async function GET(request: NextRequest) {
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

    // Получаем все цели пользователя
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken);
    const goals = await authenticatedGoalModel.getGoalsByUser(session.user.id);

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
