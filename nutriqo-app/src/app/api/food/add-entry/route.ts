import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSession } from '@/shared/lib/verifyJWT';
import { addFoodEntry } from '@/features/add-food-entry/api/addFoodEntry';
import { EatenFood } from '@/shared/lib/models/EatenFood';
import { Goal } from '@/shared/lib/models/Goal';
import { logger } from '@/shared/lib/logger';

const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

/**
 * POST /api/food/add-entry
 * Добавить запись о съеденной пище
 * SECURITY: Требует верифицированный JWT
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify JWT signature and get full session
    const verifiedSession = await getVerifiedSession();
    
    if (!verifiedSession?.user?.id) {
      logger.warn('Unauthorized food entry attempt - invalid JWT or missing session');
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

    // Get request body data
    const body = await request.json();
    const { name, meal_type, calories, protein, fats, carbs, goal_id } = body;

    // === ВАЛИДАЦИЯ ТИПОВ И ЗНАЧЕНИЙ ===

    // Валидация name
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Food name is required and must be a string' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Food name must be less than 100 characters' },
        { status: 400 }
      );
    }

    // Валидация meal_type
    if (!VALID_MEAL_TYPES.includes(meal_type)) {
      return NextResponse.json(
        { error: `Meal type must be one of: ${VALID_MEAL_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Валидация calories
    const caloriesNumber = Number(calories);
    if (!Number.isFinite(caloriesNumber) || caloriesNumber < 0 || caloriesNumber > 10000) {
      return NextResponse.json(
        { error: 'Calories must be a number between 0 and 10000' },
        { status: 400 }
      );
    }

    // Валидация goal_id
    if (typeof goal_id !== 'string' || goal_id.length === 0) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    // Валидация опциональных полей
    if (protein !== undefined && (typeof protein !== 'number' && typeof protein !== 'string')) {
      return NextResponse.json(
        { error: 'Protein must be a number' },
        { status: 400 }
      );
    }

    if (fats !== undefined && (typeof fats !== 'number' && typeof fats !== 'string')) {
      return NextResponse.json(
        { error: 'Fats must be a number' },
        { status: 400 }
      );
    }

    if (carbs !== undefined && (typeof carbs !== 'number' && typeof carbs !== 'string')) {
      return NextResponse.json(
        { error: 'Carbs must be a number' },
        { status: 400 }
      );
    }

    // Create authenticated model instances with user's PocketBase token
    const authenticatedEatenFoodModel = new EatenFood().withAuthToken(pbToken);
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken);

    // Call API function to save food entry
    const entry = await addFoodEntry(
      {
        name: name.trim(),
        meal_type: meal_type as any,
        calories: caloriesNumber,
        protein: protein ? Number(protein) : undefined,
        fats: fats ? Number(fats) : undefined,
        carbs: carbs ? Number(carbs) : undefined,
        goal_id,
      },
      authenticatedEatenFoodModel,
      authenticatedGoalModel
    );

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    // Безопасное логирование с деталями
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Failed to add food entry', 'FOOD_ADD_ERROR', {
      errorMessage: errorMsg,
      stack: errorStack,
    });

    // Раскрываем только валидационные ошибки
    if (error instanceof Error) {
      if (error.message.includes('Goal not found')) {
        return NextResponse.json(
          { error: 'Goal not found. Please set a daily goal first.' },
          { status: 404 }
        );
      }

      if (error.message.includes('required')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      // Логируем в консоль для диагностики
      console.error('Food entry creation failed:', {
        message: errorMsg,
        stack: errorStack,
      });
    }

    // Для всех остальных ошибок - generic message
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

