import { createPocketBaseClient, getPocketBaseUsersCollection } from './pocketbase';
import { logger } from './logger';
import { generateSecureOAuthPassword, hashForLogging } from './securityUtils';

/**
 * Generate a cryptographically secure password for OAuth users
 * Uses crypto.randomBytes instead of deterministic hash (not guessable)
 * @deprecated Use generateSecureOAuthPassword from securityUtils.ts
 */
export function generateOAuthPassword(email: string): string {
  // For backward compatibility, but uses secure generation
  return generateSecureOAuthPassword(email);
}

/**
 * Helper function to get or create a PocketBase token for a user
 * Useful for OAuth users who don't have tokens during auth callbacks
 */
export async function getOrCreatePocketBaseToken(userEmail: string, pbUserId?: string): Promise<string | null> {
  try {
    const pocketbase = createPocketBaseClient();
    const usersCollection = getPocketBaseUsersCollection();
    const oauthPassword = generateOAuthPassword(userEmail);

    console.log('[PBAuthHelper] Getting or creating token for:', userEmail, 'pbUserId:', pbUserId);

    let pbUser;
    
    // Ищем пользователя по ID если есть
    if (pbUserId) {
      try {
        pbUser = await pocketbase
          .collection(usersCollection)
          .getOne(pbUserId);
        console.log('[PBAuthHelper] Found user by ID:', pbUserId);
        
        // FALLBACK: If old user doesn't have subscriptionStatus, add it
        if (!pbUser.subscriptionStatus) {
          try {
            console.log('[PBAuthHelper] Updating old user (by ID) with missing subscriptionStatus...');
            pbUser = await pocketbase.collection(usersCollection).update(pbUserId, {
              subscriptionStatus: 'inactive',
            });
            console.log('[PBAuthHelper] ✓ Updated user subscriptionStatus');
          } catch (updateErr) {
            console.warn('[PBAuthHelper] Failed to update subscriptionStatus:', updateErr);
            // Continue anyway, will try auth with password
          }
        }
      } catch (err) {
        console.log('[PBAuthHelper] User not found by ID:', pbUserId, 'error:', err);
        pbUserId = undefined;
      }
    }

    // Если не найден по ID, ищем по email
    if (!pbUser) {
      try {
        const users = await pocketbase.collection(usersCollection).getFullList({
          filter: `email="${userEmail}"`,
          limit: 1,
        });
        
        if (users.length > 0) {
          pbUser = users[0];
          console.log('[PBAuthHelper] Found user by email:', userEmail, 'ID:', pbUser.id);
          
          // FALLBACK: If old user doesn't have subscriptionStatus, add it
          if (!pbUser.subscriptionStatus) {
            try {
              console.log('[PBAuthHelper] Updating old user with missing subscriptionStatus...');
              pbUser = await pocketbase.collection(usersCollection).update(pbUser.id, {
                subscriptionStatus: 'inactive',
              });
              console.log('[PBAuthHelper] ✓ Updated user subscriptionStatus');
            } catch (updateErr) {
              console.warn('[PBAuthHelper] Failed to update subscriptionStatus:', updateErr);
              // Continue anyway, will try auth with password
            }
          }
        }
      } catch (searchErr) {
        console.error('[PBAuthHelper] Error searching user by email:', searchErr);
      }
      
      if (!pbUser) {
        console.log('[PBAuthHelper] User not found, creating new:', userEmail);
        try {
          pbUser = await pocketbase.collection(usersCollection).create({
            email: userEmail,
            password: oauthPassword,
            passwordConfirm: oauthPassword,
            name: userEmail,
            // Provide default subscription status for new OAuth users
            subscriptionStatus: 'inactive', // inactive | trial | active
          });
          console.log('[PBAuthHelper] ✓ User created successfully:', userEmail, 'ID:', pbUser.id);
        } catch (createErr) {
          // Получаем детали ошибки от PocketBase
          const errorMsg = (createErr as any)?.message || String(createErr);
          const errorData = (createErr as any)?.response?.data || {};
          
          console.error('[PBAuthHelper] ✗ Failed to create user:', userEmail);
          console.error('[PBAuthHelper] Error message:', errorMsg);
          console.error('[PBAuthHelper] Error data:', JSON.stringify(errorData, null, 2));
          
          logger.error('Failed to create PocketBase user', 'PB_USER_CREATE_ERROR', {
            email: userEmail,
            error: errorMsg,
            pocketbaseData: errorData,
          });
          
          // If email validation_not_unique error, user already exists - try to find
          if (errorData.email?.code === 'validation_not_unique' || errorMsg.includes('unique')) {
            console.log('[PBAuthHelper] Email already exists, trying to find existing user...');
            try {
              const existingUsers = await pocketbase.collection(usersCollection).getFullList({
                filter: `email="${userEmail}"`,
                limit: 1,
              });
              if (existingUsers.length > 0) {
                pbUser = existingUsers[0];
                console.log('[PBAuthHelper] ✓ Found existing user after create error:', userEmail, 'ID:', pbUser.id);
              } else {
                console.warn('[PBAuthHelper] Strange: email validation_not_unique but user not found!');
              }
            } catch (findErr) {
              console.error('[PBAuthHelper] Failed to find existing user:', findErr);
            }
          }
        }
      }
    }

    // Пытаемся аутентифицироваться с deterministic password
    try {
      console.log('[PBAuthHelper] Authenticating with deterministic password for:', userEmail);
      const authData = await pocketbase
        .collection(usersCollection)
        .authWithPassword(userEmail, oauthPassword);
        
      if (authData?.token) {
        console.log('[PBAuthHelper] ✓ Got token via deterministic password');
        return authData.token;
      } else {
        console.warn('[PBAuthHelper] ✗ No token in authData');
      }
    } catch (authErr) {
      const authErrorMsg = (authErr as any)?.message || String(authErr);
      console.error('[PBAuthHelper] ✗ Deterministic password auth failed:', authErrorMsg);
      
      // Пробуем найти пользователя в базе еще раз (может быть он был создан до этого)
      if (!pbUser) {
        console.log('[PBAuthHelper] Trying to find existing user by email again...');
        try {
          const users = await pocketbase.collection(usersCollection).getFullList({
            filter: `email="${userEmail}"`,
            limit: 1,
          });
          if (users.length > 0) {
            pbUser = users[0];
            console.log('[PBAuthHelper] Found existing user:', userEmail, 'ID:', pbUser.id);
          }
        } catch (searchErr2) {
          console.error('[PBAuthHelper] Second search failed:', searchErr2);
        }
      }
    }

    console.warn('[PBAuthHelper] Could not get PB token for:', userEmail);
    return null;
  } catch (error) {
    console.error('[PBAuthHelper] Unexpected error:', error);
    logger.error('Unexpected error in getOrCreatePocketBaseToken', 'PB_TOKEN_HELPER_UNEXPECTED', {
      email: userEmail,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Get fresh subscription status from PocketBase for a user
 * Used in JWT callback to always have current subscription status
 */
export async function getSubscriptionStatusFromPB(userId: string): Promise<'active' | 'inactive' | undefined> {
  try {
    const pocketbase = createPocketBaseClient();
    const usersCollection = getPocketBaseUsersCollection();

    const pbUser = await pocketbase.collection(usersCollection).getOne(userId);
    
    if (pbUser) {
      const subscriptionStatus = pbUser.subscriptionStatus as 'active' | 'inactive' | undefined;
      console.log('[PBAuthHelper] Retrieved subscriptionStatus from PB for user ID', userId, ':', subscriptionStatus);
      return subscriptionStatus;
    }

    console.warn('[PBAuthHelper] User not found in PB for ID:', userId);
    return undefined;
  } catch (error: any) {
    // Handle 404 gracefully - user not found in this PB instance
    if (error?.status === 404) {
      console.warn('[PBAuthHelper] User 404 in PB for ID:', userId, '- this is OK if using fallback token values');
      return undefined;
    }
    console.error('[PBAuthHelper] Error retrieving subscription status for ID', userId, ':', error);
    return undefined;
  }
}

/**
 * Get user role from PocketBase
 * Returns the role field ('user' or 'admin') from PocketBase user record
 */
export async function getUserRoleFromPB(userId: string): Promise<'user' | 'admin' | undefined> {
  try {
    const pocketbase = createPocketBaseClient();
    const usersCollection = getPocketBaseUsersCollection();

    const pbUser = await pocketbase.collection(usersCollection).getOne(userId);
    
    if (pbUser) {
      const role = (pbUser.role || 'user') as 'user' | 'admin';
      console.log('[PBAuthHelper] Retrieved role from PB for user ID', userId, ':', role);
      return role;
    }

    console.warn('[PBAuthHelper] User not found in PB for ID:', userId);
    return undefined;
  } catch (error: any) {
    // Handle 404 gracefully - user not found in this PB instance
    if (error?.status === 404) {
      console.warn('[PBAuthHelper] User 404 in PB for ID:', userId, '- this is OK if using fallback token values');
      return undefined;
    }
    console.error('[PBAuthHelper] Error retrieving role for ID', userId, ':', error);
    return undefined;
  }
}
