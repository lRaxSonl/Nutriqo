/**
 * Admin feature index
 * FSD: features/admin
 */

export { useAdmin } from './hooks/use-admin';
export { AdminLink } from './ui/AdminLink';
export { isAdmin, requireAdmin } from './lib/is-admin';
export type { AdminStats, UserWithRole } from './model/types';
