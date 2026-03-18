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

    // Get request body data
    const body = await request.json();
    const { name, meal_type, calories, protein, fats, carbs, goal_id } = body;

    // Validate that essential fields are present
    if (!name || !meal_type || calories === undefined || !goal_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, meal_type, calories, goal_id' },
        { status: 400 }
      );
    }

    // Create authenticated model instances with user's PocketBase token
    const authenticatedEatenFoodModel = new EatenFood().withAuthToken(pbToken);
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken);

    // Call API function to save food entry
    const entry = await addFoodEntry(
      {
        name: String(name),
        meal_type: String(meal_type) as any,
        calories: Number(calories),
        protein: protein ? Number(protein) : undefined,
        fats: fats ? Number(fats) : undefined,
        carbs: carbs ? Number(carbs) : undefined,
        goal_id: String(goal_id),
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
