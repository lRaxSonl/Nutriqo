# Set Daily Goals Feature

## Overview
Фича для установления ежедневных целей по калориям в приложение Nutriqo.

## Architecture (FSD)

```
set-daily-goals/
├── api/                  # API слой (useCase функции)
│   ├── setDailyGoal.ts  # Основная бизнес логика
│   └── index.ts         # Экспорты
├── ui/                   # UI компоненты
│   └── GoalSetter.tsx   # Компонент для установки целей
```

## API Functions

### `setDailyGoal(input: SetDailyGoalInput): Promise<SetDailyGoalOutput>`

Установить ежедневную цель для пользователя.

**Параметры:**
- `user_id: string` - ID пользователя
- `calories_goal: number` - Цель по калориям (500-10000, требуется)
- `protein_goal?: number` - Цель по белкам (опционально)
- `fats_goal?: number` - Цель по жирам (опционально)
- `carbs_goal?: number` - Цель по углеводам (опционально)
- `date?: string` - ISO 8601 дата (по умолчанию текущая дата)

**Возвращает:** Созданная цель с автоматически сгенерированными `id` и `created_at`

**Выброс ошибок:**
- ValidationError - если данные не валидны
- NotFoundError - если user_id не существует
- DatabaseError - если ошибка при сохранении в БД

### `getDailyGoal(userId: string, date?: string): Promise<GoalType | null>`

Получить цель пользователя на определенную дату.

### `getUserGoals(userId: string): Promise<GoalType[]>`

Получить все цели пользователя.

### `updateDailyGoal(id: string, input: Partial<...>): Promise<GoalType>`

Обновить цель.

### `deleteGoal(id: string): Promise<void>`

Удалить цель.

## Security Features

### Input Validation
- Лимиты на значения калорий (500-10000)
- Обязательная проверка user_id существования
- Санитизация всех входных данных

### Database Access
- Проверка существования пользователя перед созданием цели
- Правильная обработка ошибок при доступе к БД
- Операции через модель Goal для безопасности

### Access Control
- Требует наличие сессии (userId из сессии)
- Каждый пользователь может видеть только свои цели

## Best Practices Applied

### SOLID Principles
- **S**ingle Responsibility - отдельные функции для каждого действия
- **O**pen/Closed - валидация отделена от основной логики
- **L**iskov Substitution - все цели наследуют BaseEntity
- **I**nterface Segregation - отдельные интерфейсы для разных операций
- **D**ependency Inversion - зависим от моделей, не от реализации БД

### FSD (Feature-Sliced Design)
- API слой содержит бизнес логику
- UI полностью отделена от деталей реализации
- Легко переиспользовать API в других местах

### Error Handling
- Try-catch блоки для всех операций с БД
- Логирование ошибок в консоль
- Информативные сообщения об ошибках для пользователя

## Usage Example

```typescript
// Установить цель
const goal = await setDailyGoal({
  user_id: 'user-123',
  calories_goal: 2000
});

// Получить цель на сегодня
const todayGoal = await getDailyGoal('user-123');

// Получить все цели
const allGoals = await getUserGoals('user-123');
```

## Database Schema (PocketBase)

```
Collection: goals
- id (uuid, auto-generated)
- user_id (relation to users, required)
- calories_goal (number, required)
- protein_goal (number)
- fats_goal (number)
- carbs_goal (number)
- date (date, required)
- created_at (datetime, auto)
- updated_at (datetime, auto)
```
