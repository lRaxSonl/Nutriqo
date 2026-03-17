# Architecture Implementation Guide

## Обзор внесенных изменений

Реализована полная архитектура приложения Nutriqo согласно принципам FSD, SOLID и лучшим практикам безопасности.

## 1. Обновленные Модели Данных

### BaseEntity Interface
Все модели теперь наследуют от `BaseEntity`, гарантируя наличие:
- `id` (UUID v4) - генерируется PocketBase автоматически
- `created_at` (ISO 8601) - генерируется PocketBase автоматически  
- `updated_at?` (ISO 8601) - обновляется PocketBase автоматически

### Обновленные Сущности

#### User
```typescript
interface UserType extends BaseEntity {
  email: string;
  emailVisibly: boolean;
  verified: boolean;
  name: string;
  avatar?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'trial';
}
```

#### Goal
```typescript
interface GoalType extends BaseEntity {
  user_id: string;
  calories_goal: number;
  protein_goal?: number;
  fats_goal?: number;
  carbs_goal?: number;
  date: string; // ISO 8601
}
```

#### EatenFood
```typescript
interface EatenFoodType extends BaseEntity {
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein?: number;
  fats?: number;
  carbs?: number;
  goal_id: string;
  date: string; // ISO 8601
}
```

## 2. API Layer (Features)

### Feature-Sliced Design (FSD)

Структура features теперь следует правильному FSD:

```
features/
├── add-food-entry/
│   ├── api/
│   │   ├── addFoodEntry.ts (useCase функции)
│   │   └── index.ts
│   ├── ui/
│   │   └── AddFoodForm.tsx (компонент)
│   └── README.md
└── set-daily-goals/
    ├── api/
    │   ├── setDailyGoal.ts (useCase функции)
    │   └── index.ts
    ├── ui/
    │   └── GoalSetter.tsx (компонент)
    └── README.md
```

### API Functions

#### addFoodEntry API
```typescript
export async function addFoodEntry(input: AddFoodEntryInput): Promise<EatenFoodType>
export async function getFoodEntriesByGoal(goalId: string): Promise<EatenFoodType[]>
export async function getFoodEntriesByDate(date: string): Promise<EatenFoodType[]>
export async function deleteFoodEntry(id: string): Promise<void>
export async function updateFoodEntry(id: string, input: Partial<...>): Promise<EatenFoodType>
```

#### setDailyGoal API
```typescript
export async function setDailyGoal(input: SetDailyGoalInput): Promise<GoalType>
export async function getDailyGoal(userId: string, date?: string): Promise<GoalType | null>
export async function getUserGoals(userId: string): Promise<GoalType[]>
export async function updateDailyGoal(id: string, input: Partial<...>): Promise<GoalType>
export async function deleteGoal(id: string): Promise<void>
```

## 3. Data Persistence

### Автоматическое сохранение в базу

Теперь при добавлении сущностей они **автоматически сохраняются** в PocketBase:

#### Было (локальное состояние)
```typescript
const handleAddEntry = (data) => {
  const newEntry = { ...data, id: crypto.randomUUID() };
  setEntries([newEntry, ...entries]); // Только в памяти!
};
```

#### Стало (сохранение в базу)
```typescript
const handleAddEntry = async (entry: EatenFoodType) => {
  // entry уже сохранена в БД с id и created_at от PocketBase
  setEntries([entry, ...entries]);
};
```

### DailyTrackerWidget
- Загружает цели и записи о пище из базы при загрузке
- Восстанавливает данные при перезагрузке страницы
- Синхронизирует состояние с базой в реальном времени

## 4. Validation & Security

### Input Validation

#### addFoodEntry
- `name`: требуется, макс 100 символов, trimmed
- `calories`: 0-10000
- `meal_type`: только допустимые типы
- Все пищевые компоненты (protein, fats, carbs): неотрицательные числа
- `goal_id`: проверяется существование в БД

#### setDailyGoal
- `user_id`: проверяется существование в БД
- `calories_goal`: 500-10000 (обеспечивает минимум для здоровья)
- Опциональные компоненты: проверяются как неотрицательные числа

### Database Security
- **No SQL Injection**: используем ORM (PocketBase)
- **Foreign Key Validation**: проверяем существование связей перед созданием
- **Type Safety**: строгая типизация через TypeScript
- **Error Handling**: не раскрываем внутренние детали ошибок

### Authentication
- Требует сессию (NextAuth)
- userId передается из сессии, не от пользователя
- Каждый пользователь видит только свои данные

## 5. SOLID Principles Applied

### Single Responsibility (SRP)
- **Models** отвечают только за CRUD операции с БД
- **API Functions** отвечают за валидацию и бизнес логику
- **Components** отвечают только за UI и вызов API
- **Validators** отвечают за валидацию входных данных

### Open/Closed (OCP)
- Можно добавить новые валидаторы без изменения основного кода
- Можно расширить BaseModel для специфичных операций
- QueryBuilder для сложных фильтров в Models

### Liskov Substitution (LSP)
- Все модели (User, Goal, EatenFood) безопасно наследуют BaseModel
- Все сущности соответствуют BaseEntity контракту

### Interface Segregation (ISP)
- Отдельные интерфейсы для Input (что передаем) и Output (что получаем)
- Компонент не знает о деталях реализации API

### Dependency Inversion (DIP)
- Компоненты зависят от API функций, не от конкретной реализации
- Легко заменить PocketBase на другую БД

## 6. Error Handling

Все операции имеют try-catch блоки:

```typescript
try {
  validateInput(input);
  checkDependencies(input);
  const result = await operation(input);
  return result;
} catch (error) {
  console.error('Detailed error for debugging:', error);
  throw new Error(`User-friendly error message`);
}
```

## 7. Component Improvements

### AddFoodForm
- Теперь сохраняет в БД автоматически
- Требует `goalId` и `userId` из сессии
- Показывает состояние загрузки (isLoading)
- Отображает ошибки пользователю

### GoalSetter
- Теперь сохраняет в БД через API
- Требует `userId` из сессии
- Поддерживает обновление существующей цели
- Валидирует входные данные

### DailyTrackerWidget
- Получает `userId` из сессии (NextAuth)
- Загружает цели и записи из БД при монтировании
- useEffect для синхронизации с БД
- Восстанавливает состояние при перезагрузке

## 8. Migration Guide

### Для бэкенда (PocketBase)

Убедитесь, что коллекции имеют такие поля:

#### users
- `id` (text, auto-generated UUID)
- `email` (email, required, unique)
- `emailVisibly` (bool)
- `verified` (bool)
- `name` (text)
- `avatar` (text)
- `subscriptionStatus` (select: active, inactive, trial)
- `created_at` (datetime, auto)
- `updated_at` (datetime, auto)

#### goals
- `id` (uuid, auto)
- `user_id` (relation to users, required)
- `calories_goal` (number, required)
- `protein_goal` (number)
- `fats_goal` (number)
- `carbs_goal` (number)
- `date` (date, required)
- `created_at` (datetime, auto)
- `updated_at` (datetime, auto)
- Индексы: `user_id`, `date`

#### eatenfood
- `id` (uuid, auto)
- `name` (text, required)
- `meal_type` (select: breakfast, lunch, dinner, snack)
- `calories` (number, required)
- `protein` (number)
- `fats` (number)
- `carbs` (number)
- `goal_id` (relation to goals, required)
- `date` (date, required)
- `created_at` (datetime, auto)
- `updated_at` (datetime, auto)
- Индексы: `goal_id`, `date`

## 9. Тестирование

### Unit Tests для API Functions

```typescript
import { addFoodEntry } from '@/features/add-food-entry/api/addFoodEntry';

describe('addFoodEntry', () => {
  it('should create entry with valid input', async () => {
    const entry = await addFoodEntry({
      name: 'Apple',
      calories: 80,
      meal_type: 'breakfast',
      goal_id: 'goal-123'
    });
    
    expect(entry.id).toBeDefined();
    expect(entry.created_at).toBeDefined();
    expect(entry.name).toBe('Apple');
  });

  it('should throw on invalid calories', async () => {
    expect(async () => {
      await addFoodEntry({
        name: 'Apple',
        calories: 15000, // Слишком много
        meal_type: 'breakfast',
        goal_id: 'goal-123'
      });
    }).rejects.toThrow();
  });
});
```

## 10. Performance Considerations

### Database Queries
- Фильтрация на уровне БД (не в памяти)
- Индексы на часто используемых полях
- Lazy loading (загрузка по требованию)

### Frontend
- Кэширование данных в состоянии компонента
- Минимизация переполучения данных
- Мемоизация вычисленных значений через useMemo

## Next Steps

1. **Обновить PocketBase коллекции** как описано в Migration Guide
2. **Протестировать API функции** через Postman или cURL
3. **Проверить интеграцию с NextAuth** для получения userId из сессии
4. **Добавить интеграционные тесты** для проверки полного flow
5. **Настроить логирование** для мониторинга ошибок в продакшене
