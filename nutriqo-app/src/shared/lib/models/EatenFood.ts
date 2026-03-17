import BaseModel, { BaseEntity } from './Base';
import { pb } from '@/shared/lib/pocketbase';
import { MealType } from '@/shared/types/meals';

export interface EatenFoodType extends BaseEntity {
  name: string;
  meal_type: MealType;
  calories: number;
  protein?: number;
  fats?: number;
  carbs?: number;
  goal_id: string; // Foreign key
  date: string; // ISO 8601 date when the food was eaten
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
      console.error(`Error fetching eaten food for goal ${goalId}:`, error);
      throw new Error(`Failed to fetch eaten food for goal`);
    }
  }

  /**
   * Получить продукты по дате
   */
  async getByDate(date: string): Promise<EatenFoodType[]> {
    try {
      return await this.client.collection(this.collection).getFullList({
        filter: `date="${date}"`
      });
    } catch (error) {
      console.error(`Error fetching eaten food for date ${date}:`, error);
      throw new Error(`Failed to fetch eaten food for date`);
    }
  }
}

export { EatenFood };
export default new EatenFood();