/**
 * Set Daily Goals API
 * 
 * Фичи для установления ежедневных целей по калории согласно FSD
 * Инкапсулирует бизнес логику и взаимодействие с моделями
 */

import { Goal, type GoalType } from '@/shared/lib/models/Goal';
import { logger } from '@/shared/lib/logger';

// Дефолтная модель для функций, не требующих аутентификации
const goalModel = new Goal();

interface SetDailyGoalInput {
  user_id: string;
  calories_goal: number;
  protein_goal?: number;
  fats_goal?: number;
  carbs_goal?: number;
  // Note: 'date' field not stored in PocketBase. Goals are stored once per user and updated.
}

interface SetDailyGoalOutput extends GoalType {}

/**
 * Установить ежедневную цель для пользователя
 * 
 * @param input - Данные цели
 * @param authenticatedGoalModel - Опциональный аутентифицированный экземпляр Goal модели
 * @throws Error если валидация не пройдена
 */
export async function setDailyGoal(
  input: SetDailyGoalInput,
  authenticatedGoalModel?: Goal
): Promise<SetDailyGoalOutput> {
  try {
    // Валидация входных данных
    validateGoalInput(input);

    const goalModel = authenticatedGoalModel || new Goal();

    // Note: User validation skipped - NextAuth already authenticated the user

    // Автоматический расчет БЖУ если они не переданы
    let proteinGoal = input.protein_goal ?? 0;
    let fatsGoal = input.fats_goal ?? 0;
    let carbsGoal = input.carbs_goal ?? 0;

    // Если БЖУ не были явно переданы (все 0 или undefined), рассчитываем автоматически
    if (!input.protein_goal && !input.fats_goal && !input.carbs_goal) {
      // Стандартное соотношение: Б 20%, Ж 30%, У 50%
      proteinGoal = Math.round((input.calories_goal * 0.2) / 4);
      fatsGoal = Math.round((input.calories_goal * 0.3) / 9);
      carbsGoal = Math.round((input.calories_goal * 0.5) / 4);
    }

    // Prepare data for saving (no date field - goals are per-user singletons)
    const goalData: Omit<GoalType, 'id' | 'created_at' | 'updated_at'> = {
      user_id: input.user_id,
      calories_goal: input.calories_goal,
      protein_goal: proteinGoal,
      fats_goal: fatsGoal,
      carbs_goal: carbsGoal,
      is_finished: false,
    };

    // Upsert: Update existing ACTIVE goal if present, otherwise create new
    // Important: Only update if the existing goal is not finished (is_finished != true)
    const existingActiveGoal = await goalModel.getActiveGoal(input.user_id);
    const savedGoal = existingActiveGoal
      ? await goalModel.update(existingActiveGoal.id, {
          calories_goal: goalData.calories_goal,
          protein_goal: goalData.protein_goal,
          fats_goal: goalData.fats_goal,
          carbs_goal: goalData.carbs_goal,
        } as any)
      : await goalModel.create(goalData);

    return savedGoal;
  } catch (error) {
    logger.error('Failed to set daily goal', 'GOAL_SET_ERROR', {
      errorMessage: error instanceof Error ? error.message : 'Unknown',
    });

    if (error instanceof Error) {
      throw new Error(`Failed to set daily goal: ${error.message}`);
    }

    throw new Error('Failed to set daily goal: Unknown error');
  }
}

/**
 * Получить текущую цель пользователя
 */
export async function getDailyGoal(userId: string): Promise<GoalType | null> {
  try {
    return await goalModel.getGoalByDate(userId);
  } catch (error) {
    logger.error('Failed to fetch daily goal', 'GOAL_GET_ERROR', {
      errorMessage: error instanceof Error ? error.message : 'Unknown',
    });
    throw new Error('Failed to fetch daily goal');
  }
}

/**
 * Получить все цели пользователя
 */
export async function getUserGoals(userId: string): Promise<GoalType[]> {
  try {
    return await goalModel.getGoalsByUser(userId);
  } catch (error) {
    logger.error('Failed to fetch user goals', 'GOAL_GET_USER_GOALS_ERROR', {
      errorMessage: error instanceof Error ? error.message : 'Unknown',
    });
    throw new Error('Failed to fetch user goals');
  }
}

/**
 * Обновить ежедневную цель
 */
export async function updateDailyGoal(
  id: string,
  input: Partial<Omit<SetDailyGoalInput, 'user_id' | 'date'>>
): Promise<GoalType> {
  try {
    validateGoalInput(input, true);

    const updateData: Partial<Omit<GoalType, 'id' | 'created_at'>> = {};

    if (input.calories_goal !== undefined) updateData.calories_goal = input.calories_goal;
    if (input.protein_goal !== undefined) updateData.protein_goal = input.protein_goal;
    if (input.fats_goal !== undefined) updateData.fats_goal = input.fats_goal;
    if (input.carbs_goal !== undefined) updateData.carbs_goal = input.carbs_goal;

    return await goalModel.update(id, updateData);
  } catch (error) {
    logger.error('Failed to update daily goal', 'GOAL_UPDATE_ERROR', {
      errorMessage: error instanceof Error ? error.message : 'Unknown',
    });
    throw new Error('Failed to update daily goal');
  }
}

/**
 * Удалить цель
 */
export async function deleteGoal(id: string): Promise<void> {
  try {
    await goalModel.delete(id);
  } catch (error) {
    logger.error('Failed to delete goal', 'GOAL_DELETE_ERROR', {
      errorMessage: error instanceof Error ? error.message : 'Unknown',
    });
    throw new Error('Failed to delete goal');
  }
}

/**
 * Валидация входящих данных
 * @param partial - если true, не требует все поля (для частичного обновления)
 */
function validateGoalInput(
  input: Partial<SetDailyGoalInput>,
  partial: boolean = false
): void {
  if (!partial) {
    const fullInput = input as SetDailyGoalInput;

    if (!fullInput.user_id) {
      throw new Error('User ID is required');
    }

    if (
      typeof fullInput.calories_goal !== 'number' ||
      fullInput.calories_goal < 500 ||
      fullInput.calories_goal > 10000
    ) {
      throw new Error('Calories goal must be a number between 500 and 10000');
    }
  }

  // Частичная валидация для опциональных полей
  if (
    input.calories_goal !== undefined &&
    (typeof input.calories_goal !== 'number' ||
      input.calories_goal < 500 ||
      input.calories_goal > 10000)
  ) {
    throw new Error('Calories goal must be a number between 500 and 10000');
  }

  if (
    input.protein_goal !== undefined &&
    (typeof input.protein_goal !== 'number' || input.protein_goal < 0)
  ) {
    throw new Error('Protein goal must be a non-negative number');
  }

  if (
    input.fats_goal !== undefined &&
    (typeof input.fats_goal !== 'number' || input.fats_goal < 0)
  ) {
    throw new Error('Fats goal must be a non-negative number');
  }

  if (
    input.carbs_goal !== undefined &&
    (typeof input.carbs_goal !== 'number' || input.carbs_goal < 0)
  ) {
    throw new Error('Carbs goal must be a non-negative number');
  }
}
