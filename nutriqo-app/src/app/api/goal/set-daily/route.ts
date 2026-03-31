import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSession } from '@/shared/lib/verifyJWT';
import { setDailyGoal } from '@/features/set-daily-goals/api/setDailyGoal';
import { Goal } from '@/shared/lib/models/Goal';
import { logger } from '@/shared/lib/logger';

/**
 * POST /api/goal/set-daily
 * Установить ежедневную цель
 * SECURITY: Требует верифицированный JWT
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify JWT signature and get full session
    const verifiedSession = await getVerifiedSession();
    
    if (!verifiedSession?.user?.id) {
      logger.warn('Unauthorized set-daily goal attempt - invalid JWT');
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

    // Get request body
    const body = await request.json();
    const { calories_goal, protein_goal, fats_goal, carbs_goal } = body;

    // === ВАЛИДАЦИЯ ТИПОВ И ЗНАЧЕНИЙ ===

    // Валидация calories_goal
    const caloriesGoal = Number(calories_goal);
    if (!Number.isFinite(caloriesGoal) || caloriesGoal < 500 || caloriesGoal > 10000) {
      return NextResponse.json(
        { error: 'Calories goal must be a number between 500 and 10000' },
        { status: 400 }
      );
    }

    // Валидация опциональных полей макронутриентов
    if (protein_goal !== undefined) {
      const proteinGoal = Number(protein_goal);
      if (!Number.isFinite(proteinGoal) || proteinGoal < 0 || proteinGoal > 500) {
        return NextResponse.json(
          { error: 'Protein goal must be a number between 0 and 500' },
          { status: 400 }
        );
      }
    }

    if (fats_goal !== undefined) {
      const fatsGoal = Number(fats_goal);
      if (!Number.isFinite(fatsGoal) || fatsGoal < 0 || fatsGoal > 500) {
        return NextResponse.json(
          { error: 'Fats goal must be a number between 0 and 500' },
          { status: 400 }
        );
      }
    }

    if (carbs_goal !== undefined) {
      const carbsGoal = Number(carbs_goal);
      if (!Number.isFinite(carbsGoal) || carbsGoal < 0 || carbsGoal > 500) {
        return NextResponse.json(
          { error: 'Carbs goal must be a number between 0 and 500' },
          { status: 400 }
        );
      }
    }

    // Create authenticated Goal model instance with user's PocketBase token
    const authenticatedGoalModel = new Goal().withAuthToken(pbToken!);

    // Проверяем есть ли активные (не завершённые) цели
    const unfinishedGoals = await authenticatedGoalModel.getUnfinishedGoals(verifiedSession.user.id);
    
    if (unfinishedGoals.length > 0) {
      // Есть незавршённые цели - нельзя создать новую
      return NextResponse.json(
        { 
          error: 'У вас есть незавершённая цель за предыдущий день. Завершите её перед созданием новой.',
          hasUnfinishedGoal: true,
        },
        { status: 409 }
      );
    }

    // Call API function to save goal (upsert if goal already exists for user)
    const goal = await setDailyGoal(
      {
        user_id: verifiedSession.user.id,
        calories_goal: caloriesGoal,
        protein_goal: protein_goal ? Number(protein_goal) : undefined,
        fats_goal: fats_goal ? Number(fats_goal) : undefined,
        carbs_goal: carbs_goal ? Number(carbs_goal) : undefined,
      },
      authenticatedGoalModel
    );

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    // Безопасное логирование без раскрытия деталей
    logger.error('Failed to set daily goal', 'GOAL_SET_ERROR', {
      errorMessage: error instanceof Error ? error.message : 'Unknown',
    });

    // Раскрываем только валидационные ошибки
    if (error instanceof Error) {
      if (error.message.includes('required')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    // Для всех остальных ошибок - generic message
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

