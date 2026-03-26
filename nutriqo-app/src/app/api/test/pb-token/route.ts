import { NextRequest, NextResponse } from 'next/server';
import { getOrCreatePocketBaseToken, generateOAuthPassword } from '@/shared/lib/pocketbaseAuthHelper';

/**
 * GET /api/test/pb-token
 * Test endpoint to debug PocketBase token generation
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') || 'test@example.com';
  
  try {
    console.log('[Test PB Token] Testing for email:', email);
    const password = generateOAuthPassword(email);
    console.log('[Test PB Token] Generated password:', password);
    
    const token = await getOrCreatePocketBaseToken(email);
    console.log('[Test PB Token] Got token:', !!token);
    
    return NextResponse.json({
      email,
      password,
      tokenObtained: !!token,
      success: true,
    });
  } catch (error) {
    console.error('[Test PB Token] Error:', error);
    return NextResponse.json({
      email,
      error: error instanceof Error ? error.message : String(error),
      success: false,
    }, { status: 500 });
  }
}
