import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createPocketBaseClient, getPocketBaseUsersCollection } from "@/shared/lib/pocketbase";
import { getOrCreatePocketBaseToken, generateOAuthPassword } from "@/shared/lib/pocketbaseAuthHelper";
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

          return {
            id: authData.record.id,
            email: authData.record.email,
            name: authData.record.name || authData.record.email,
            pbToken: authData.token, // Сохраняем PocketBase token
          };
        } catch {
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
      // Обработка OAuth авторизации (Google и т.д.)
      if (account && user.email) {
        try {
          console.log('[OAuth SignIn] Processing OAuth user:', user.email);
          const pocketbase = createPocketBaseClient();
          const usersCollection = getPocketBaseUsersCollection();
          const oauthPassword = generateOAuthPassword(user.email);

          // Ищем пользователя в PocketBase
          let pbUser;
          try {
            const users = await pocketbase.collection(usersCollection).getFullList({
              filter: `email="${user.email}"`,
              limit: 1,
            });
            pbUser = users[0];
            if (pbUser) {
              console.log('[OAuth SignIn] Found existing PB user:', user.email);
            }
          } catch (findError) {
            console.log('[OAuth SignIn] User not found, creating:', user.email);
            pbUser = null;
          }

          // Если не найден, создаём нового
          if (!pbUser) {
            try {
              pbUser = await pocketbase.collection(usersCollection).create({
                email: user.email,
                password: oauthPassword,
                passwordConfirm: oauthPassword,
                name: user.name || user.email,
                subscriptionStatus: 'inactive', // Add required field for new users
              });
              console.log('[OAuth SignIn] ✓ User created:', user.email);
              logger.info('OAuth user created: ' + user.email);
            } catch (createErr) {
              console.error('[OAuth SignIn] ✗ Failed to create user:', createErr);
              
              // If creation failed (e.g., email already exists), try to find existing user
              const errorMsg = (createErr as any)?.message || '';
              if (errorMsg.includes('validation_not_unique') || errorMsg.includes('unique')) {
                console.log('[OAuth SignIn] Email might already exist, trying to find user...');
                try {
                  const users = await pocketbase.collection(usersCollection).getFullList({
                    filter: `email="${user.email}"`,
                    limit: 1,
                  });
                  if (users.length > 0) {
                    pbUser = users[0];
                    console.log('[OAuth SignIn] ✓ Found existing user after creation error:', user.email, 'ID:', pbUser.id);
                  }
                } catch (findErr) {
                  console.error('[OAuth SignIn] Failed to find existing user:', findErr);
                }
              }
            }
          }

          // Сохраняем pbUserId для использования в jwt callback
          if (pbUser?.id) {
            (user as any).pbUserId = pbUser.id;
            (user as any).pbUserEmail = pbUser.email;
            console.log('[OAuth SignIn] Stored pbUserId:', pbUser.id);
          }
        } catch (error) {
          console.error('[OAuth SignIn] Unexpected error:', error);
          // Continue anyway to not block the login
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      try {
        // При первом логине - копируем ID из user объекта
        if (user) {
          token.id = user.id;
          token.pbUserId = (user as any).pbUserId;
          token.pbUserEmail = (user as any).pbUserEmail || user.email;
          console.log('[JWT Callback] First login for:', token.email, 'pbUserId:', token.pbUserId);
          
          // Если уже есть pbToken (из signIn) - используем его
          if ((user as any).pbToken) {
            token.pbToken = (user as any).pbToken;
            console.log('[JWT Callback] Using pbToken from signIn callback');
            return token;
          }
        }

        // Если pbToken уже есть в token - возвращаем сразу
        if (token.pbToken) {
          return token;
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

        console.log('[JWT Callback] Returning token - pbToken present:', !!token.pbToken);
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
        }
        // Копируем pbToken из token в session для использования в API routes
        if (token.pbToken) {
          session.pbToken = token.pbToken as string;
          console.log('[Session Callback] pbToken copied to session');
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
