import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth.config';
import { addFoodEntry } from '@/features/add-food-entry/api/addFoodEntry';
import { EatenFood } from '@/shared/lib/models/EatenFood';
import { Goal } from '@/shared/lib/models/Goal';

/**
 * POST /api/food/add-entry
 * Добавить запись о съеденной пище
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

    // Получаем данные из request body
    const body = await request.json();
    const { name, meal_type, calories, protein, fats, carbs, goal_id, date } = body;

    // Создаем аутентифицированные экземпляры моделей
    const authenticatedEatenFoodModel = new EatenFood().withAuthToken(pbToken);
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken);

    // Вызываем API функцию для сохранения в БД с аутентифицированными моделями
    const entry = await addFoodEntry(
      {
        name,
        meal_type,
        calories,
        protein,
        fats,
        carbs,
        goal_id,
        date,
      },
      authenticatedEatenFoodModel,
      authenticatedGoalModel
    );

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/food/add-entry:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const isPermissionError =
      errorMessage.includes('Only superusers can perform this action') ||
      errorMessage.includes('forbidden') ||
      errorMessage.includes('403');

    if (isPermissionError) {
      return NextResponse.json(
        {
          error:
            'PocketBase permissions error: collection Create rule allows only superusers. Update collection rules for regular auth users.',
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
