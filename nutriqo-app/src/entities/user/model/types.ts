export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  pbUserId?: string; // PocketBase user ID
  role?: UserRole; // Роль пользователя
  subscriptionStatus?: 'active' | 'inactive';
}