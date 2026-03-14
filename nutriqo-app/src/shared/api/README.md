# API Client & HTTP Wrapper

FSD-структурированная обёртка для работы с API с встроенной обработкой ошибок и react-hot-toast уведомлениями.

## Структура

```
src/shared/api/
├── http-client/
│   ├── types.ts       # Типы для API (RequestOptions, ApiResponse, HttpClientError)
│   ├── client.ts      # HttpClient класс с методами GET, POST, PUT, PATCH, DELETE
│   └── index.ts       # Экспорты
├── auth/
│   └── index.ts       # API методы для auth (register, login, etc)
├── hooks/
│   └── useHttp.ts     # useHttp хук для обработки ошибок с toast
└── index.ts           # Главный экспорт всего API слоя
```

## Использование

### 1. HttpClient - базовый fetch wrapper

```typescript
import { httpClient } from '@/shared/api';

// GET запрос
const response = await httpClient.get<UserData>('/api/users/profile');

// POST запрос
const response = await httpClient.post<LoginResponse>('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// PUT, PATCH, DELETE аналогично
```

### 2. useHttp hook - обработка ошибок с toast уведомлениями

```typescript
'use client';

import { useHttp } from '@/shared/api';

export const MyComponent = () => {
  const { handleError, handleSuccess } = useHttp();

  const handleAction = async () => {
    try {
      const data = await someApiCall();
      handleSuccess('Operation successful!');
    } catch (error) {
      handleError(error);
    }
  };
};
```

### 3. Специализированные API клиенты

```typescript
import { authApi } from '@/shared/api/auth';

// Регистрация
const result = await authApi.register({
  email: 'user@example.com',
  password: 'password123'
});
```

## Возможности

- ✅ Автоматический timeout (по умолчанию 10s)
- ✅ Обработка ошибок с типизацией
- ✅ Toast уведомления через react-hot-toast
- ✅ Строгая типизация (no-explicit-any)
- ✅ Поддержка JSON, FormData
- ✅ Абортирование долгих запросов

## ToasterProvider

Должен быть добавлен в root providers для работы toast уведомлений:

```typescript
// src/app/providers.tsx
import { ToasterProvider } from '@/shared/providers/ToasterProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToasterProvider />
      {children}
    </SessionProvider>
  );
}
```
