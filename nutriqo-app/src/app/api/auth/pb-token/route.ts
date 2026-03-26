import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth.config';
import { createPocketBaseClient, getPocketBaseUsersCollection } from '@/shared/lib/pocketbase';
import { logger } from '@/shared/lib/logger';

/**
 * POST /api/auth/pb-token
 * Получить PocketBase токен для текущего пользователя
 * Используется при OAuth авторизации (Google, GitHub и т.д.)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    const pocketbase = createPocketBaseClient();
    const usersCollection = getPocketBaseUsersCollection();

    // Ищем пользователя в PocketBase по email
    let pbUser;
    try {
      const users = await pocketbase.collection(usersCollection).getFullList({
        filter: `email="${session.user.email}"`,
        limit: 1,
      });
      pbUser = users[0];
    } catch (error) {
      logger.error('Error fetching PocketBase user', 'PB_USER_FETCH_ERROR', {
        email: session.user.email,
      });
    }

    // Если пользователя нет, создаём его
    if (!pbUser) {
      try {
        // Генерируем уникальный пароль для OAuth пользователя
        const oauthPassword = `oauth_${session.user.email}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        pbUser = await pocketbase.collection(usersCollection).create({
          email: session.user.email,
          password: oauthPassword,
          passwordConfirm: oauthPassword,
          name: session.user.name || session.user.email,
        });

        logger.info(`PocketBase user created for OAuth: ${pbUser.id}`);
      } catch (createError) {
        logger.error('Failed to create PocketBase user', 'PB_USER_CREATE_ERROR', {
          email: session.user.email,
          errorMessage: createError instanceof Error ? createError.message : 'Unknown',
        });
        return NextResponse.json(
          { error: 'Failed to create PocketBase user' },
          { status: 500 }
        );
      }
    }

    // Пытаемся аутентифицироваться (если уже были в PocketBase)
    let authToken;
    try {
      const authData = await pocketbase.collection(usersCollection).authWithPassword(
        session.user.email,
        pbUser.oauth_password || `oauth_${session.user.email}` // Используем сохраненный пароль если есть
      );
      authToken = authData.token;
    } catch {
      // Если обычная аутентификация не сработала, используем альтернативный механизм
      // Создаём временный токен на основе user ID
      try {
        const oauthPassword = `oauth_${session.user.email}_${pbUser.id}`;
        const authData = await pocketbase.collection(usersCollection).authWithPassword(
          session.user.email,
          oauthPassword
        );
        authToken = authData.token;
      } catch (authError) {
        logger.error('Failed to authenticate with PocketBase', 'PB_AUTH_ERROR', {
          email: session.user.email,
          pbUserId: pbUser.id,
        });
        return NextResponse.json(
          { error: 'Failed to authenticate with PocketBase' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { token: authToken, pbUserId: pbUser.id },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error in /api/auth/pb-token', 'AUTH_PB_TOKEN_ERROR', {
      errorMessage: error instanceof Error ? error.message : 'Unknown',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
