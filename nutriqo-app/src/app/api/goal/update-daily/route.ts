import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedSession } from '@/shared/lib/verifyJWT';
import { Goal } from '@/shared/lib/models/Goal';
import { logger } from '@/shared/lib/logger';

/**
 * PATCH /api/goal/update-daily
 * Обновить существующую активную цель (без проверки на наличие других активных целей)
 * 
 * Отличие от POST /api/goal/set-daily:
 * - set-daily: проверяет наличие незавершённых целей, создаёт новую если нет
 * - update-daily: просто обновляет существующую активную цель
 * SECURITY: Требует верифицированный JWT
 */
export async function PATCH(request: NextRequest) {
  try {
    // SECURITY: Verify JWT signature and get full session
    const verifiedSession = await getVerifiedSession();
    
    if (!verifiedSession?.user?.id) {
      logger.warn('Unauthorized update-daily goal attempt - invalid JWT');
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

    // Получаем активную цель пользователя
    const activeGoal = await authenticatedGoalModel.getActiveGoal(verifiedSession.user.id);
    
    if (!activeGoal) {
      // Нет активной цели - нельзя обновить
      return NextResponse.json(
        { 
          error: 'No active goal found. Create a new goal using POST /api/goal/set-daily',
          errorCode: 'NO_ACTIVE_GOAL',
        },
        { status: 404 }
      );
    }

    // Обновляем существующую активную цель
    const updateData = {
      calories_goal: caloriesGoal,
      ...(protein_goal !== undefined && { protein_goal: Number(protein_goal) }),
      ...(fats_goal !== undefined && { fats_goal: Number(fats_goal) }),
      ...(carbs_goal !== undefined && { carbs_goal: Number(carbs_goal) }),
    };

    const updatedGoal = await authenticatedGoalModel.update(activeGoal.id, updateData);

    logger.error(`Goal updated successfully`, 'GOAL_UPDATE_SUCCESS', { 
      goalId: activeGoal.id,
      userId: verifiedSession.user.id,
    });

    return NextResponse.json(updatedGoal, { status: 200 });
  } catch (error) {
    // Безопасное логирование без раскрытия деталей
    logger.error('Failed to update daily goal', 'GOAL_UPDATE_ERROR', {
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
