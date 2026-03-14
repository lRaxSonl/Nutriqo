# Authentication Middleware

## Описание

Middleware проверяет наличие активной сессии пользователя. Если пользователь не авторизирован, его перенаправляет на страницу `/login`.

## Как это работает

### Файл: [src/middleware.ts](../../middleware.ts)

```typescript
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const publicPaths = ['/login', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Разрешить доступ к публичным путям
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Проверить токен сессии
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Если нет токена, редиректить на страницу логина
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
```

## Логика работы

1. **Проверка публичных путей**: `/login` и `/api/auth/*` доступны без авторизации
2. **Проверка токена**: Для остальных путей проверяется наличие JWT токена
3. **Редирект**: Если токена нет → редирект на `/login`
4. **Разрешение доступа**: Если токен есть → пропустить дальше

## Публичные пути (без авторизации)

```typescript
const publicPaths = ['/login', '/api/auth'];
```

- ✅ `/login` — страница входа/регистрации
- ✅ `/api/auth/*` — NextAuth endpoints (sign-in, callback, signout и т.д.)
- ✅ `/api/auth/register` — регистрация новых пользователей

## Приватные пути (требуют авторизацию)

Все остальные пути, включая:
- `/` — главная страница
- `/profile` — профиль пользователя
- `/api/*` (кроме `/api/auth`) — API endpoints

## Переменные окружения

Middleware использует `NEXTAUTH_SECRET` из `.env.local`:

```env
NEXTAUTH_SECRET=your-secret-key-here
```

**⚠️ Важно**: `NEXTAUTH_SECRET` должен быть установлен для production!

Генерация ключа:
```bash
openssl rand -base64 32
```

## Matcher конфигурация

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

Матчер исключает:
- ❌ `_next/static/*` — статические файлы Next.js
- ❌ `_next/image/*` — оптимизированные изображения
- ❌ `favicon.ico` — иконка сайта

## Добавление новых публичных путей

Если нужно открыть новый маршрут без авторизации:

```typescript
const publicPaths = [
  '/login',
  '/api/auth',
  '/pricing',        // ← новый публичный путь
  '/terms-of-service',
];
```

## Тестирование

### 1. Попытка доступа без авторизации

```bash
curl http://localhost:3000/
# Ответ: 307 редирект на /login
```

### 2. Попытка доступа к /login без авторизации

```bash
curl http://localhost:3000/login
# Ответ: 200 OK (показать страницу входа)
```

### 3. После регистрации/входа

```bash
# После успешной авторизации в браузере
# Cookies содержат next-auth токен
# Доступ к '/' разрешён
```

## Логирование и Debugging

Если middleware не работает как ожидается:

1. Проверить `.env.local`:
   ```env
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=http://localhost:3000
   ```

2. Проверить в DevTools → Application → Cookies:
   - Должна быть кука `next-auth.session-token` или `next-auth.jwt`

3. Посмотреть логи Next.js:
   ```bash
   npm run dev
   # Должны быть логи middleware срабатывания
   ```

## Production considerations

- ✅ Middleware работает на Edge (очень быстро)
- ✅ Обычно быстрее, чем getServerSession() на каждой странице
- ⚠️ Требует `NEXTAUTH_SECRET` для валидизации JWT
- ⚠️ CSRF защита работает автоматически (NextAuth)

## Альтернатива: getServerSession

Вместо middleware можно использовать `getServerSession()` на каждой цель-странице:

```typescript
// src/app/profile/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  
  return <div>...</div>;
}
```

**Но коридор рекомендует middleware** — более производительно и централизовано.
