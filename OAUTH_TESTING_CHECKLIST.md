# ✅ Чек-Лист: Как Проверить Что OAuth Работает

## 1️⃣ Проверка: API Rules установлены правильно

### Способ 1: Через Admin панель
```
1. http://pocketbase-xxx.sslip.io/_/
2. Collections → users
3. Нажмите 🛡️ API Rules
4. Проверьте что Create = "@request.auth.id = """
5. Должна быть зеленая галочка ✅
```

### Способ 2: Через API (curl)
```bash
curl -s "http://pocketbase-n133ucx2k7b95oxc9qw0qtuw.176.112.158.15.sslip.io/api/collections/users" | grep -A 2 '"createRule"'
```

Должна вывести:
```
"createRule": "@request.auth.id = """
```

---

## 2️⃣ Проверка: Создание тестового пользователя

### Тест через REST API
```bash
curl -X POST "http://pocketbase-n133ucx2k7b95oxc9qw0qtuw.176.112.158.15.sslip.io/api/collections/users/records" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_'$(date +%s)'@example.com",
    "password": "Test123456!",
    "passwordConfirm": "Test123456!",
    "name": "Test User"
  }'
```

**Ожидаемый результат:**
- ✅ Status 200
- ✅ В ответе видно `"id": "xxx"` 
- ✅ `"email": "test_XXX@example.com"`

**Если видите:**
- ❌ Status 400 → API rules неправильные
- ❌ Status 403 → Доступ запрещен
- ❌ Status 422 → Проблема с данными

---

## 3️⃣ Проверка: Server логи приложения

### Запустите dev server
```bash
cd /home/raxson/programs/Nutriqo/nutriqo-app
npm run dev
```

### Очистите cookies браузера
```
DevTools → Application → Cookies → localhost → Delete All
```

### Попробуйте логин с Google
```
1. http://localhost:3000
2. Нажмите "Sign in with Google"
3. Выберите аккаунт
4. Проверьте server консоль
```

### Ищите эти логи (✅ хорошие):
```
[OAuth SignIn] Processing OAuth user: malenkijh@gmail.com
[OAuth SignIn] ✓ User created successfully: malenkijh@gmail.com
[JWT Callback] First login for: malenkijh@gmail.com
[JWT Callback] ✓ Got PB token for OAuth user
[Session Callback] pbToken copied to session
 GET /api/auth/session 200
```

### Избегайте этих логов (❌ плохие):
```
[PBAuthHelper] ✗ Failed to create user: ClientResponseError 400
[JWT Callback] Returning token - pbToken present: false
[Session Callback] WARNING: No pbToken in JWT token!
 GET /api/goal/get-daily 401
```

---

## 4️⃣ Проверка: Трекер загружается

### Ожидаемое поведение
```
1. Логин успешен
2. Перенаправление на /
3. Трекер загружается
4. Выбираете или создаете цель
5. Видите интерфейс с калориями
```

### Если видите "Failed to load daily goal"
```
1. Откройте DevTools → Console
2. Проверьте что ошибка 401 (Unauthorized)
3. Проверьте server логи выше
4. Если эти логи есть - значит OAuth работает 80%
5. Проблема в PocketBase Rules для другой коллекции
```

---

## 5️⃣ Если всё работает

Поздравляем! 🎉

Следующие шаги:
- [ ] Создайте реальную цель питания
- [ ] Добавьте продукт
- [ ] Проверьте расчеты макросов
- [ ] Повторите логин на следующий день

---

## 🆘 Если не работает

### Выполните:
1. Убедитесь что Create rule = `@request.auth.id = ""`
2. Нажмите Save в Admin панели
3. Подождите 5-10 секунд (кэш)
4. Очистите браузер cookies
5. Перезагрузите localhost:3000

### Если помогло - отлично! ✅

### Если не помогло:
1. Скопируйте **все логи сервера** (от включения до ошибки)
2. Скопируйте **точное сообщение об ошибке**
3. Скопируйте **результат curl команды выше**
4. Поделитесь этой информацией

Это даст достаточно информации для диагностики.
