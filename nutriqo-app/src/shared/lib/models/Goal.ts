import BaseModel, { BaseEntity } from './Base';
import { pb } from '@/shared/lib/pocketbase';

export interface GoalType extends BaseEntity {
  user_id: string;
  calories_goal: number;
  protein_goal?: number;
  fats_goal?: number;
  carbs_goal?: number;
  date: string; // ISO 8601 date
}

class Goal extends BaseModel<GoalType> {
  constructor(collectionName: string = 'goals', client?: typeof pb) {
    super(collectionName, client);
  }

  /**
   * Получить все цели пользователя
   */
  async getGoalsByUser(userId: string): Promise<GoalType[]> {
    try {
      return await this.client.collection(this.collection).getFullList({
        filter: `user_id="${userId}"`
      });
    } catch (error) {
      console.error(`Error fetching goals for user ${userId}:`, error);
      throw new Error(`Failed to fetch goals for user`);
    }
  }

  /**
   * Получить цель пользователя на определенную дату
   */
  async getGoalByDate(userId: string, date: string): Promise<GoalType | null> {
    try {
      const goals = await this.client.collection(this.collection).getFullList({
        filter: `user_id="${userId}" && date="${date}"`
      });
      return (goals.length > 0 ? goals[0] : null) as unknown as GoalType | null;
    } catch (error) {
      console.error(`Error fetching goal for user ${userId} on date ${date}:`, error);
      throw new Error(`Failed to fetch goal for date`);
    }
  }

  /**
   * Получить все продукты, относящиеся к цели
   */
  async getEatenFood(goalId: string) {
    try {
      return await this.client.collection('eatenfood').getFullList({
        filter: `goal_id="${goalId}"`
      });
    } catch (error) {
      console.error(`Error fetching eaten food for goal ${goalId}:`, error);
      throw new Error(`Failed to fetch eaten food for goal`);
    }
  }
}

export { Goal };
export default new Goal();