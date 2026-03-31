/**
 * JWT Verification for API Routes
 * SECURITY: Validates token integrity using NextAuth's verified session
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth.config';
import { logger } from './logger';

export interface VerifiedToken {
  sub: string; // User ID
  email: string;
  name?: string;
  role?: 'user' | 'admin';
  iat: number;
  exp: number;
  pbToken?: string;
  pbUserId?: string;
}

export interface VerifiedSession {
  user?: any;
  pbToken?: string;
  accessToken?: string;
  jwt?: string;
  verifiedToken?: VerifiedToken;
}

/**
 * Get and verify session from NextAuth
 * CRITICAL: NextAuth already verifies JWT signature on the server side
 * We trust the session data returned by getServerSession
 */
export async function getVerifiedSession(): Promise<VerifiedSession | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      logger.debug('No session found');
      return null;
    }

    // NextAuth has already verified the JWT signature when decoding it
    // The session data comes from the verified token payload
    // We can trust this data is authentic

    // Build verified token from session data
    const verifiedToken: VerifiedToken = {
      sub: session.user.id,
      email: session.user.email || '',
      name: session.user.name || undefined,
      role: (session.user as any).role || 'user',
      pbToken: (session as any).pbToken,
      pbUserId: (session.user as any).pbUserId,
      iat: Math.floor(Date.now() / 1000) - 60, // Approximate
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    };

    return {
      ...session,
      verifiedToken,
    };
  } catch (error) {
    logger.error('Session retrieval error', 'SESSION_ERROR', { error });
    return null;
  }
}

/**
 * Get verified token from session
 */
export async function getVerifiedToken(): Promise<VerifiedToken | null> {
  const session = await getVerifiedSession();
  return session?.verifiedToken || null;
}

/**
 * Verify admin role with server-side check
 * CRITICAL: Must verify role on server - never trust client-provided claims
 */
export async function getVerifiedAdminSession(): Promise<VerifiedSession | null> {
  const session = await getVerifiedSession();

  if (!session?.verifiedToken) {
    return null;
  }

  // SECURITY: Only accept 'admin' role
  if (session.verifiedToken.role !== 'admin') {
    logger.warn(`Non-admin user attempted admin access: ${session.verifiedToken.sub}`);
    return null;
  }

  return session;
}

/**
 * Get verified admin token
 */
export async function getVerifiedAdminToken(): Promise<VerifiedToken | null> {
  const session = await getVerifiedAdminSession();
  return session?.verifiedToken || null;
}

/**
 * Verify user owns the resource (prevent privilege escalation)
 */
export async function verifyResourceOwnership(
  resourceUserId: string,
  verifiedToken: VerifiedToken
): Promise<boolean> {
  if (!resourceUserId || !verifiedToken) {
    return false;
  }

  // User can only access their own resources (unless admin)
  if (verifiedToken.sub === resourceUserId || verifiedToken.role === 'admin') {
    return true;
  }

  logger.warn(
    `Unauthorized resource access attempt - user ${verifiedToken.sub} tried to access ${resourceUserId}`
  );
  return false;
}
