/**
 * Admin feature types
 * FSD: features/admin/model
 */

export interface AdminStats {
  totalUsers: number;
  adminCount: number;
  premiumCount: number;
  activeSubscriptions: number;
}

export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  subscriptionStatus: 'active' | 'inactive';
  createdAt: string;
}
