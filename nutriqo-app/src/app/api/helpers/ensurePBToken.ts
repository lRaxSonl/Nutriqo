import { Session } from 'next-auth';
import { getOrCreatePocketBaseToken } from '@/shared/lib/pocketbaseAuthHelper';
import { NextResponse } from 'next/server';

/**
 * Helper function for API routes to ensure pbToken is available
 * If session has pbToken, returns it
 * If not, attempts to get/create one
 * Returns error response if unable to get token
 */
export async function ensurePBToken(session: Session | null): Promise<{
  pbToken: string | null;
  errorResponse: NextResponse | null;
}> {
  // Check if session exists
  if (!session?.user?.id) {
    return {
      pbToken: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      ),
    };
  }

  // If pbToken exists in session, use it
  if ((session as any).pbToken) {
    return {
      pbToken: (session as any).pbToken,
      errorResponse: null,
    };
  }

  // Try to get pbToken from helper
  console.log('[ensurePBToken] Getting PB token for:', session.user.email);
  try {
    const pbToken = await getOrCreatePocketBaseToken(
      session.user.email || '',
      (session.user as any)?.pbUserId
    );

    if (pbToken) {
      console.log('[ensurePBToken] Got PB token');
      return {
        pbToken,
        errorResponse: null,
      };
    } else {
      console.log('[ensurePBToken] Failed to get PB token');
      return {
        pbToken: null,
        errorResponse: NextResponse.json(
          { error: 'Failed to establish PocketBase session. Please try logging in again.' },
          { status: 401 }
        ),
      };
    }
  } catch (err) {
    console.error('[ensurePBToken] Error:', err);
    return {
      pbToken: null,
      errorResponse: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
    };
  }
}
