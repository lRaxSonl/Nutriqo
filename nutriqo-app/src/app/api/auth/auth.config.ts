import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createPocketBaseClient, getPocketBaseUsersCollection } from "@/shared/lib/pocketbase";
import { getOrCreatePocketBaseToken, generateOAuthPassword, getSubscriptionStatusFromPB, getUserRoleFromPB } from "@/shared/lib/pocketbaseAuthHelper";
import { logger } from "@/shared/lib/logger";

/**
 * Получить и валидировать NEXTAUTH_SECRET
 */
function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      const errorMsg = 'NEXTAUTH_SECRET is not set. Generate it with: openssl rand -base64 32';
      logger.error(errorMsg, 'AUTH_CONFIG_ERROR');
      throw new Error(errorMsg);
    }
    
    logger.warn('⚠️ NEXTAUTH_SECRET not set (development mode). Set it in production!');
    return 'dev-insecure-secret-change-in-production';
  }
  
  // Проверяем минимальную длину
  if (secret.length < 32) {
    logger.warn('⚠️ NEXTAUTH_SECRET is too short (< 32 chars)');
  }
  
  return secret;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          const pocketbase = createPocketBaseClient();
          const usersCollection = getPocketBaseUsersCollection();
          const authData = await pocketbase
            .collection(usersCollection)
            .authWithPassword(credentials.email, credentials.password);

          console.log('[Credentials SignIn] ✓ User authenticated:', credentials.email, 'pbUserId:', authData.record.id);

          return {
            id: authData.record.id,
            email: authData.record.email,
            name: authData.record.name || authData.record.email,
            pbUserId: authData.record.id, // PocketBase user ID
            subscriptionStatus: authData.record.subscriptionStatus || 'inactive',
            role: authData.record.role || 'user', // User role from PocketBase
            pbToken: authData.token, // Сохраняем PocketBase token
          };
        } catch (error) {
          console.error('[Credentials SignIn] ✗ Authentication failed:', credentials.email);
          return null;
        }
      },
    }),
  ],

  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('\n========== [SignIn Callback] ==========');
      console.log('[SignIn Callback] STARTED - This should always log');
      console.log('[SignIn Callback]   - account?.type:', account?.type);
      console.log('[SignIn Callback]   - user.email:', user.email);
      console.log('[SignIn Callback]   - user.id:', user.id);
      
      // Обработка OAuth авторизации (Google и т.д.)
      if (account && user.email) {
        console.log('[OAuth SignIn] Processing OAuth user:', user.email);
        try {
          const pocketbase = createPocketBaseClient();
          const usersCollection = getPocketBaseUsersCollection();
          const oauthPassword = generateOAuthPassword(user.email);

          // Ищем пользователя в PocketBase
          let pbUser;
          try {
            console.log('[OAuth SignIn] Searching PB for email:', user.email);
            const users = await pocketbase.collection(usersCollection).getFullList({
              filter: `email="${user.email}"`,
              limit: 1,
            });
            pbUser = users[0];
            if (pbUser) {
              console.log('[OAuth SignIn] ✓ Found existing PB user:', user.email, 'id:', pbUser.id);
            } else {
              console.log('[OAuth SignIn] User not found in PB, will create');
            }
          } catch (findError) {
            console.log('[OAuth SignIn] Search error (expected if not found), will create:', findError);
            pbUser = null;
          }

          // Если не найден, создаём нового
          if (!pbUser) {
            try {
              console.log('[OAuth SignIn] Creating new PB user for:', user.email);
              pbUser = await pocketbase.collection(usersCollection).create({
                email: user.email,
                password: oauthPassword,
                passwordConfirm: oauthPassword,
                name: user.name || user.email,
                role: 'user', // Default role for new users
                subscriptionStatus: 'inactive', // Add required field for new users
              });
              console.log('[OAuth SignIn] ✓ User created with id:', pbUser.id);
              logger.info('OAuth user created: ' + user.email);
            } catch (createErr) {
              console.error('[OAuth SignIn] ✗ Failed to create user:', createErr);
              
              // If creation failed (e.g., email already exists), try to find existing user
              const errorMsg = (createErr as any)?.message || '';
              if (errorMsg.includes('validation_not_unique') || errorMsg.includes('unique')) {
                console.log('[OAuth SignIn] Email already exists, searching for existing...');
                try {
                  const users = await pocketbase.collection(usersCollection).getFullList({
                    filter: `email="${user.email}"`,
                    limit: 1,
                  });
                  if (users.length > 0) {
                    pbUser = users[0];
                    console.log('[OAuth SignIn] ✓ Found existing user:', pbUser.id);
                  }
                } catch (findErr) {
                  console.error('[OAuth SignIn] Failed to find existing user:', findErr);
                }
              }
            }
          }

          // Сохраняем pbUserId и subscriptionStatus для использования в jwt callback
          if (pbUser?.id) {
            (user as any).pbUserId = pbUser.id;
            (user as any).pbUserEmail = pbUser.email;
            (user as any).subscriptionStatus = pbUser.subscriptionStatus || 'inactive';
            (user as any).role = pbUser.role || 'user'; // Сохраняем роль из PB
            console.log('[OAuth SignIn] ✓ Stored in user object:');
            console.log('[OAuth SignIn]   - pbUserId:', (user as any).pbUserId);
            console.log('[OAuth SignIn]   - subscriptionStatus:', (user as any).subscriptionStatus);
            console.log('[OAuth SignIn]   - role:', (user as any).role);
          } else {
            console.warn('[OAuth SignIn] ✗ pbUser?.id missing - cannot store pbUserId');
          }
        } catch (error) {
          console.error('[OAuth SignIn] Unexpected error:', error);
          // Continue anyway to not block the login
        }
      } else if (!account) {
        console.log('[SignIn] Not OAuth (account is null) - likely Credentials provider');
      } else if (!user.email) {
        console.log('[SignIn] No user.email');
      }

      console.log('[SignIn Callback] ✓ Returning true');
      console.log('[SignIn Callback]   - user.pbUserId after:', (user as any).pbUserId);
      console.log('========== [SignIn Callback END] ==========\n');
      return true;
    },

    async jwt({ token, user, account }) {
      try {
        console.log('\n========== [JWT Callback START] ==========');
        console.log('[JWT Callback] Params received:');
        console.log('[JWT Callback]   - user:', user ? 'EXISTS' : 'NULL');
        console.log('[JWT Callback]   - account:', account ? 'EXISTS' : 'NULL');
        console.log('[JWT Callback]   - token.email:', token.email);
        console.log('[JWT Callback]   - token.pbUserId:', token.pbUserId);
        
        // При первом логине - копируем ID и данные из user объекта
        if (user) {
          console.log('[JWT Callback] ✓ User object received (first login or signIn callback)');
          console.log('[JWT Callback]   - user.id:', user.id);
          console.log('[JWT Callback]   - user.email:', user.email);
          console.log('[JWT Callback]   - user.pbUserId:', (user as any).pbUserId);
          console.log('[JWT Callback]   - user.subscriptionStatus:', (user as any).subscriptionStatus);
          
          token.id = user.id;
          token.pbUserId = (user as any).pbUserId;
          token.pbUserEmail = (user as any).pbUserEmail || user.email;
          token.subscriptionStatus = (user as any).subscriptionStatus || 'inactive';
          token.role = (user as any).role || 'user';
          
          // Если pbUserId не передался из user - нужно создать/найти пользователя в PB
          if (!token.pbUserId && user.email) {
            console.log('[JWT Callback] pbUserId missing, attempting to create/find user in PB for:', user.email);
            try {
              const pocketbase = createPocketBaseClient();
              const usersCollection = getPocketBaseUsersCollection();
              const oauthPassword = generateOAuthPassword(user.email);

              // Сначала пытаемся найти пользователя в PB
              let pbUser;
              try {
                const users = await pocketbase.collection(usersCollection).getFullList({
                  filter: `email="${user.email}"`,
                  limit: 1,
                });
                pbUser = users[0];
                if (pbUser) {
                  console.log('[JWT Callback] ✓ Found existing PB user:', user.email, 'id:', pbUser.id);
                }
              } catch (findErr) {
                console.log('[JWT Callback] User not found in PB, will create');
              }

              // Если не найден - создаём нового
              if (!pbUser) {
                try {
                  console.log('[JWT Callback] Creating new user in PB for:', user.email);
                  pbUser = await pocketbase.collection(usersCollection).create({
                    email: user.email,
                    password: oauthPassword,
                    passwordConfirm: oauthPassword,
                    name: user.name || user.email,
                    role: 'user', // Default role for new users
                    subscriptionStatus: 'inactive',
                  });
                  console.log('[JWT Callback] ✓ Created PB user with id:', pbUser.id);
                } catch (createErr) {
                  console.error('[JWT Callback] Failed to create PB user:', createErr);
                  // Continue anyway
                }
              }

              // Если успешно нашли/создали пользователя - копируем данные
              if (pbUser?.id) {
                token.pbUserId = pbUser.id;
                token.subscriptionStatus = pbUser.subscriptionStatus || 'inactive';
                token.role = pbUser.role || 'user'; // Копируем роль из PB
                console.log('[JWT Callback] ✓ Set pbUserId from PB:', token.pbUserId);
                console.log('[JWT Callback] ✓ Set role from PB:', token.role);
                
                // Получаем token от PocketBase для этого пользователя
                try {
                  const authData = await pocketbase
                    .collection(usersCollection)
                    .authWithPassword(user.email, oauthPassword);
                  if (authData?.token) {
                    token.pbToken = authData.token;
                    console.log('[JWT Callback] ✓ Got pbToken for new user');
                  }
                } catch (authErr) {
                  console.error('[JWT Callback] Failed to get pbToken:', authErr);
                }
              }
            } catch (error) {
              console.error('[JWT Callback] Unexpected error creating/finding user:', error);
            }
          }
          
          console.log('[JWT Callback] ✓ First login for:', token.email);
          console.log('[JWT Callback]   - Copied to token - id:', token.id);
          console.log('[JWT Callback]   - Copied to token - pbUserId:', token.pbUserId);
          console.log('[JWT Callback]   - Copied to token - subscriptionStatus:', token.subscriptionStatus);
          
          // Если уже есть pbToken (из signIn) - используем его
          if ((user as any).pbToken) {
            token.pbToken = (user as any).pbToken;
            console.log('[JWT Callback] ✓ Using pbToken from signIn callback');
            return token;
          }
          
          // Если есть pbUserId и pbToken - готовы возвращать
          if (token.pbUserId && token.pbToken) {
            return token;
          }
        }

        // Если pbToken уже есть в token - это значит пользователь уже аутентифицирован
        // Но pbUserId может быть missing - получим его из PocketBase по email если нужно
        if (token.pbToken && token.email && !token.pbUserId) {
          console.log('[JWT Callback] ⚠️ pbToken exists but pbUserId missing for:', token.email);
          console.log('[JWT Callback] Attempting to retrieve pbUserId from PB by email...');
          try {
            const pocketbase = createPocketBaseClient();
            const usersCollection = getPocketBaseUsersCollection();
            
            // Try lowercase email first
            console.log('[JWT Callback] Searching PB with filter: email="' + token.email + '"');
            let pbUsers = await pocketbase.collection(usersCollection).getFullList({
              filter: `email="${token.email}"`,
              limit: 1,
            });
            
            // If not found, try case-insensitive search
            if (pbUsers.length === 0) {
              console.log('[JWT Callback] Not found with exact email, trying lowercase...');
              const lowerEmail = token.email.toLowerCase();
              pbUsers = await pocketbase.collection(usersCollection).getFullList({
                filter: `email="${lowerEmail}"`,
                limit: 1,
              });
            }
            
            // If still not found, try to get all users and log them for debugging
            if (pbUsers.length === 0) {
              console.log('[JWT Callback] ⚠️ User not found in PB by email:', token.email);
              console.log('[JWT Callback] Attempting to list all users for debugging...');
              try {
                const allUsers = await pocketbase.collection(usersCollection).getFullList({
                  limit: 100,
                });
                console.log('[JWT Callback] Total users in PB:', allUsers.length);
                if (allUsers.length > 0) {
                  console.log('[JWT Callback] Sample users (first 5 emails):');
                  allUsers.slice(0, 5).forEach((u: any) => {
                    console.log('[JWT Callback]   -', u.email, '(id:', u.id + ')');
                  });
                }
              } catch (listErr) {
                console.error('[JWT Callback] Failed to list all users:', listErr);
              }
            } else {
              token.pbUserId = pbUsers[0].id;
              token.subscriptionStatus = pbUsers[0].subscriptionStatus || 'inactive';
              token.role = pbUsers[0].role || 'user';
              console.log('[JWT Callback] ✓ Found pbUserId from PB:', token.pbUserId);
              console.log('[JWT Callback] ✓ Found subscriptionStatus from PB:', token.subscriptionStatus);
              console.log('[JWT Callback] ✓ Found role from PB:', token.role);
              return token;
            }
          } catch (error) {
            console.error('[JWT Callback] Error retrieving pbUserId from PB:', error);
          }
        }

        // Если pbToken уже есть в token и pbUserId тоже - это значит пользователь уже аутентифицирован
        // Получим свежий subscriptionStatus и роль из PocketBase для синхронизации
        if (token.pbToken && token.pbUserId) {
          console.log('[JWT Callback] ✓ Refreshing subscriptionStatus and role from PB for user ID:', token.pbUserId);
          
          // Обновляем subscriptionStatus
          const freshSubscriptionStatus = await getSubscriptionStatusFromPB(token.pbUserId as string);
          if (freshSubscriptionStatus !== undefined) {
            // Только обновляем если статус изменился
            if (token.subscriptionStatus !== freshSubscriptionStatus) {
              token.subscriptionStatus = freshSubscriptionStatus;
              console.log('[JWT Callback] ✓ Updated subscriptionStatus from PB:', freshSubscriptionStatus);
            } else {
              console.log('[JWT Callback] subscriptionStatus unchanged:', freshSubscriptionStatus);
            }
          } else {
            console.log('[JWT Callback] subscriptionStatus from PB is undefined, keeping current:', token.subscriptionStatus);
          }
          
          // Обновляем role
          const freshRole = await getUserRoleFromPB(token.pbUserId as string);
          if (freshRole !== undefined) {
            // Всегда обновляем роль из PocketBase (может быть изменена админом)
            if (token.role !== freshRole) {
              token.role = freshRole;
              console.log('[JWT Callback] ✓ Updated role from PB:', freshRole);
            } else {
              console.log('[JWT Callback] role unchanged:', freshRole);
            }
          } else {
            console.log('[JWT Callback] role from PB is undefined, keeping current:', token.role);
          }
          
          return token;
        } else {
          if (!token.pbToken) console.log('[JWT Callback] No pbToken in token');
          if (!token.pbUserId) console.log('[JWT Callback] No pbUserId in token');
        }

        // OAuth users: используем helper для получения token
        if (account?.type === 'oauth' && token.email) {
          console.log('[JWT Callback] OAuth user detected, getting PB token for:', token.email);
          try {
            const pbToken = await getOrCreatePocketBaseToken(token.email as string, token.pbUserId as string);
            if (pbToken) {
              token.pbToken = pbToken;
              console.log('[JWT Callback] ✓ Got PB token for OAuth user');
            } else {
              console.warn('[JWT Callback] ✗ Failed to get PB token for OAuth user');
            }
          } catch (err) {
            console.error('[JWT Callback] Error getting PB token:', err);
            // Continue without token - will be fetched on demand in API routes
          }
        }

        console.log('[JWT Callback] Returning token');
        console.log('[JWT Callback]   - pbToken present:', !!token.pbToken);
        console.log('[JWT Callback]   - pbUserId:', token.pbUserId);
        console.log('[JWT Callback]   - role:', token.role);
        console.log('[JWT Callback]   - subscription:', token.subscriptionStatus);
        
        // Ensure role is always set
        if (!token.role) {
          token.role = 'user';
          console.log('[JWT Callback] ✓ Set default role to "user"');
        }
        
        return token;
      } catch (error) {
        console.error('[JWT Callback] Unexpected error:', error);
        // Return token anyway to not block the jwt process
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.pbUserId = token.pbUserId as string;
          session.user.role = token.role as 'user' | 'admin';
          session.user.subscriptionStatus = token.subscriptionStatus as 'active' | 'inactive';
          
          console.log('[Session Callback] ✓ Session updated from JWT token');
          console.log('[Session Callback]   - pbUserId:', session.user?.pbUserId);
          console.log('[Session Callback]   - role:', session.user?.role);
          console.log('[Session Callback]   - subscriptionStatus:', session.user?.subscriptionStatus);
        }
        // Копируем pbToken из token в session для использования в API routes
        if (token.pbToken) {
          session.pbToken = token.pbToken as string;
        } else {
          console.warn('[Session Callback] WARNING: No pbToken in JWT token!');
        }
        return session;
      } catch (error) {
        console.error('[Session Callback] Error:', error);
        return session;
      }
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: getAuthSecret(),
};
