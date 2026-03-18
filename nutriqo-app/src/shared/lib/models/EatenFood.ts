import BaseModel, { BaseEntity } from './Base';
import { pb } from '@/shared/lib/pocketbase';
import { logger } from '../logger';
import { MealType } from '@/shared/types/meals';

export interface EatenFoodType extends BaseEntity {
  name: string;
  meal_type: MealType;
  calories: number;
  protein?: number;
  fats?: number;
  carbs?: number;
  goal_id: string; // Foreign key to goals collection
  // NOTE: 'date' field is not stored. Use created_at/updated_at for temporal queries.
}

class EatenFood extends BaseModel<EatenFoodType> {
  constructor(collectionName: string = 'eatenfood', client?: typeof pb) {
    super(collectionName, client);
  }

  /**
   * Получить все продукты относящиеся к цели
   */
  async getEatenFoodByGoal(goalId: string): Promise<EatenFoodType[]> {
    try {
      return await this.client.collection(this.collection).getFullList({
        filter: `goal_id="${goalId}"`
      });
    } catch (error) {
      logger.error(`Failed to fetch eaten food for goal`, 'DB_GET_FOOD_BY_GOAL_ERROR', { goalId });
      throw new Error(`Failed to fetch eaten food for goal`);
    }
  }

  /**
   * Получить продукты по дате
   * Since there's no explicit 'date' field, this filters by created_at timestamp.
   */
  async getByDate(date: string): Promise<EatenFoodType[]> {
    try {
      // Filter by created_at day matching the provided date (format: YYYY-MM-DD)
      // This is a workaround since the date field doesn't exist in the collection
      return await this.client.collection(this.collection).getFullList({
        filter: `created_at >= "${date}T00:00:00.000Z" && created_at < "${new Date(date + 'T23:59:59.999Z').toISOString()}"`
      });
    } catch (error) {
      logger.error(`Failed to fetch eaten food for date`, 'DB_GET_FOOD_BY_DATE_ERROR', { date });
      throw new Error(`Failed to fetch eaten food for date`);
    }
  }
}

export { EatenFood };
export default new EatenFood();