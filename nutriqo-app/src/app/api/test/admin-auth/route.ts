/**
 * GET /api/test/admin-auth
 * 
 * Test endpoint to verify admin authentication works
 * REMOVE THIS BEFORE PRODUCTION
 */

import { getAdminPocketBaseClient, getPocketBaseUsersCollection } from '@/shared/lib/pocketbase';

export async function GET() {
  try {
    console.log('========== TEST: Admin Authentication ==========');
    
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
    
    console.log('Admin Email configured:', !!adminEmail);
    console.log('Admin Password configured:', !!adminPassword);
    console.log('Admin Email value:', adminEmail ? `${adminEmail.substring(0, 3)}...` : 'NOT SET');
    
    if (!adminEmail || !adminPassword) {
      return Response.json({
        success: false,
        error: 'Admin credentials not configured',
        configured_email: !!adminEmail,
        configured_password: !!adminPassword,
      });
    }
    
    console.log('Attempting to get admin PocketBase client...');
    const pocketbase = await getAdminPocketBaseClient();
    const usersCollection = getPocketBaseUsersCollection();
    
    console.log(`Users collection name: ${usersCollection}`);
    console.log('Attempting to fetch all users...');
    
    const users = await pocketbase.collection(usersCollection).getFullList({
      limit: 100,
    });
    
    console.log(`✓ Successfully fetched ${users.length} users`);
    
    return Response.json({
      success: true,
      message: 'Admin auth test successful',
      users_count: users.length,
      users: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
      })),
    });
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    
    return Response.json({
      success: false,
      error: error?.message,
      status: error?.status,
      details: error?.data?.message || error?.response,
    }, { status: error?.status || 500 });
  }
}
