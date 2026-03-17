import BaseModel, { BaseEntity } from './Base';
import { pb } from '@/shared/lib/pocketbase';

export interface UserType extends BaseEntity {
  email: string;
  emailVisibly: boolean;
  verified: boolean;
  name: string;
  avatar?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'trial';
}

class User extends BaseModel<UserType> {
  constructor() {
    super('users');
  }

  /**
   * Получить пользователя по email
   */
  async getByEmail(email: string): Promise<UserType | null> {
    try {
      const users = await pb.collection(this.collection).getFullList({
        filter: `email="${email}"`
      });
      return (users.length > 0 ? users[0] : null) as unknown as UserType | null;
    } catch (error) {
      console.error(`Error fetching user by email ${email}:`, error);
      throw new Error(`Failed to fetch user by email`);
    }
  }

  /**
   * Получить все цели пользователя
   */
  async getGoals(userId: string) {
    try {
      return await pb.collection('goals').getFullList({
        filter: `user_id="${userId}"`
      });
    } catch (error) {
      console.error(`Error fetching goals for user ${userId}:`, error);
      throw new Error(`Failed to fetch goals for user`);
    }
  }
}

export { User };
export default new User();