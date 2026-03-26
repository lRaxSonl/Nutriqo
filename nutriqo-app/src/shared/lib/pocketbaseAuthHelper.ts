import { createPocketBaseClient, getPocketBaseUsersCollection } from './pocketbase';
import { logger } from './logger';

/**
 * Simple hash function for generating deterministic passwords
 * Based on email to ensure same password is generated each time
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate a deterministic password for OAuth users based on email
 * This ensures we can recreate the same password if auth fails
 */
export function generateOAuthPassword(email: string): string {
  const hash1 = simpleHash(`oauth_${email}`);
  const hash2 = simpleHash(`pb_${email}`);
  // Combine hashes and take first 20 chars to ensure good entropy
  return `pb_${(hash1 + hash2).substring(0, 20).toLowerCase()}`;
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
          
          // Не возвращаем null - может быть пользователь уже существует
          // Попробуем его найти по email и использовать его пароль
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
