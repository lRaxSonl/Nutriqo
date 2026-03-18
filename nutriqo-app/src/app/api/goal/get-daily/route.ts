import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { Goal } from '@/shared/lib/models/Goal';

/**
 * GET /api/goal/get-daily
 * Получить цель за сегодня для текущего пользователя
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

    // Получаем цель (самую свежую) пользователя
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken);

    let goal;
    try {
      goal = await authenticatedGoalModel.getGoalByDate(session.user.id, '');
    } catch (fetchError) {
      console.error('Error fetching goal by date:', fetchError);
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
    console.error('Error in GET /api/goal/get-daily:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
