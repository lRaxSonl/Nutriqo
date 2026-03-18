import BaseModel, { BaseEntity } from './Base';
import { pb } from '@/shared/lib/pocketbase';

export interface GoalType extends BaseEntity {
  user_id: string;
  calories_goal: number;
  protein_goal?: number;
  fats_goal?: number;
  carbs_goal?: number;
  // NOTE: 'date' field is not used. Daily goals are stored once and updated via created_at/updated_at.
  // For querying today's goal, use getGoalByDate() which returns the most recent goal for the user.
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
   * Получить последнюю установленную цель пользователя
   * 
   * Design Note: PocketBase goals are stored without explicit 'date' field.
   * Each user has at most one active goal at a time, stored with created_at/updated_at timestamps.
   * This method returns the most recent goal for proper daily tracking.
   * 
   * @param userId - User ID from PocketBase auth
   * @param _date - Unused parameter (kept for API compatibility with previous version)
   * @returns Most recent goal or null if user has no goals
   */
  async getGoalByDate(userId: string, _date?: string): Promise<GoalType | null> {
    try {
      const userGoals = await this.client.collection(this.collection).getFullList({
        filter: `user_id = "${userId}"`,
        sort: '-updated_at', // Most recently updated first
        limit: 1
      });
      
      return userGoals.length > 0 ? (userGoals[0] as unknown as GoalType) : null;
    } catch (error) {
      console.error(`Error fetching goal for user ${userId}:`, error);
      throw error;
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