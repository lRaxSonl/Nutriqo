import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { setDailyGoal } from '@/features/set-daily-goals/api/setDailyGoal';
import { Goal } from '@/shared/lib/models/Goal';

/**
 * POST /api/goal/set-daily
 * Установить ежедневную цель
 */
export async function POST(request: NextRequest) {
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

    // Get request body
    const body = await request.json();
    const { calories_goal, protein_goal, fats_goal, carbs_goal } = body;

    // Create authenticated Goal model instance with user's PocketBase token
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken);

    // Call API function to save goal (upsert if goal already exists for user)
    const goal = await setDailyGoal(
      {
        user_id: session.user.id,
        calories_goal,
        protein_goal,
        fats_goal,
        carbs_goal,
      },
      authenticatedGoalModel
    );

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/goal/set-daily:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const isPermissionError =
      errorMessage.includes('Only superusers can perform this action') ||
      errorMessage.includes('forbidden') ||
      errorMessage.includes('403');

    if (isPermissionError) {
      return NextResponse.json(
        {
          error:
            'PocketBase permissions error: goals Create rule allows only superusers. Set Create rule in goals to @request.auth.id != "" && user_id = @request.auth.id',
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
