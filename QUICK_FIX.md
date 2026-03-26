# ⚡ QUICK FIX - Ошибка 400: Failed to create record

## 🎯 В 30 секунд

1. Откройте: http://pocketbase-n133ucx2k7b95oxc9qw0qtuw.176.112.158.15.sslip.io/_/
2. Collections → users → 🛡️ API Rules (кнопка)
3. Create rule: скопируйте сюда → `@request.auth.id = ""`
4. Нажмите Save
5. Готово! ✅

---

## 📊 Статус

| Что | Статус |
|-----|--------|
| **Ошибка 400** | Это значит API rules блокирует создание |
| **Fix** | 1 строчка кода в Create rule |
| **Время** | < 1 минуты |
| **Сложность** | ⭐ Очень легко |

---

## 🔍 Как понять что сработало

Откройте DevTools → Console и попробуйте логин Google.

**Должны увидеть:**
```
[PBAuthHelper] ✓ User created successfully
[JWT Callback] ✓ Got PB token
```

**Если видите это - OAuth работает! 🎉**

---

## ❌ Если создание UI rule не найде

**Попробуйте:**
- Обновить страницу (F5)
- Выбрать коллекцию "users" еще раз
- Проверить что вы админ PocketBase
