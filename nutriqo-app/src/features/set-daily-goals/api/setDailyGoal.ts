/**
 * Set Daily Goals API
 * 
 * Фичи для установления ежедневных целей по калории согласно FSD
 * Инкапсулирует бизнес логику и взаимодействие с моделями
 */

import { Goal, type GoalType } from '@/shared/lib/models/Goal';

// Дефолтная модель для функций, не требующих аутентификации
const goalModel = new Goal();

interface SetDailyGoalInput {
  user_id: string;
  calories_goal: number;
  protein_goal?: number;
  fats_goal?: number;
  carbs_goal?: number;
  date?: string; // ISO 8601, если не указана - используется текущая дата
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

    // Примечание: проверка пользователя пропущена, т.к. NextAuth уже подтвердил его существование
    // перед тем как передать session.user.id в API

    const targetDate = input.date ?? new Date().toISOString().split('T')[0];

    // Подготовка данных для сохранения
    const goalData: Omit<GoalType, 'id' | 'created_at' | 'updated_at'> = {
      user_id: input.user_id,
      calories_goal: input.calories_goal,
      protein_goal: input.protein_goal ?? 0,
      fats_goal: input.fats_goal ?? 0,
      carbs_goal: input.carbs_goal ?? 0,
      date: targetDate,
    };

    // Если цель на дату уже есть, обновляем ее вместо создания новой
    const existingGoal = await goalModel.getGoalByDate(input.user_id, targetDate);
    const savedGoal = existingGoal
      ? await goalModel.update(existingGoal.id, {
          calories_goal: goalData.calories_goal,
          protein_goal: goalData.protein_goal,
          fats_goal: goalData.fats_goal,
          carbs_goal: goalData.carbs_goal,
        })
      : await goalModel.create(goalData);

    return savedGoal;
  } catch (error) {
    console.error('Error setting daily goal:', error);

    if (error instanceof Error) {
      throw new Error(`Failed to set daily goal: ${error.message}`);
    }

    throw new Error('Failed to set daily goal: Unknown error');
  }
}

/**
 * Получить цель пользователя на определенную дату
 */
export async function getDailyGoal(userId: string, date?: string): Promise<GoalType | null> {
  try {
    const targetDate = date ?? new Date().toISOString().split('T')[0];
    return await goalModel.getGoalByDate(userId, targetDate);
  } catch (error) {
    console.error('Error fetching daily goal:', error);
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
    console.error('Error fetching user goals:', error);
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
    console.error('Error updating daily goal:', error);
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
    console.error('Error deleting goal:', error);
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
