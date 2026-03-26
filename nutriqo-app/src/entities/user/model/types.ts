export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  pbUserId?: string; // PocketBase user ID
  subscriptionStatus?: 'active' | 'inactive';
}