import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { Goal } from '@/shared/lib/models/Goal';
import { ensurePBToken } from '@/app/api/helpers/ensurePBToken';

/**
 * GET /api/goal/get-daily
 * Получить цель за сегодня для текущего пользователя
 */
export async function GET(request: NextRequest) {
  try {
    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    
    // Обеспечиваем наличие pbToken
    const { pbToken, errorResponse } = await ensurePBToken(session);
    if (errorResponse) {
      return errorResponse;
    }

    // Получаем активную (не завершённую) цель пользователя
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken!);

    let goal;
    try {
      goal = await authenticatedGoalModel.getActiveGoal(session!.user.id);
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
