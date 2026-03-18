# Data Models Architecture

## Overview
Архитектура моделей данных приложения Nutriqo, следующая лучшим практикам SOLID и FSD.

## Base Entity Interface

Все сущности в приложении наследуют интерфейс `BaseEntity`:

```typescript
export interface BaseEntity {
    id: string;           // UUID v4, генерируется PocketBase автоматически
    created_at: string;   // ISO 8601 timestamp, генерируется автоматически
    updated_at?: string;  // ISO 8601 timestamp, обновляется автоматически
}
```

## Entity Models

### 1. User Model (`User.ts`)

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

**Методы:**
- `getByEmail(email: string): Promise<UserType | null>` - Найти пользователя по email
- `getGoals(userId: string)` - Получить все цели пользователя
- Наследует CRUD методы из BaseModel

**База данных:**
- Коллекция: `users`
- Первичный ключ: `id` (UUID)
- Уникальные поля: `email`

### 2. Goal Model (`Goal.ts`)

```typescript
interface GoalType extends BaseEntity {
  user_id: string;          // PocketBase auth user ID
  calories_goal: number;    // Required
  protein_goal?: number;
  fats_goal?: number;
  carbs_goal?: number;
  // Note: 'date' field not used. Goals are singletons per user, tracked via created_at/updated_at
}
```

**Методы:**
- `getGoalsByUser(userId: string): Promise<GoalType[]>` - Получить все цели пользователя
- `getGoalByDate(userId: string, date?: string): Promise<GoalType | null>` - Получить последнюю цель пользователя (сортировка по updated_at DESC)
- `getEatenFood(goalId: string)` - Получить все продукты для цели
- Наследует CRUD методы из BaseModel

**Дизайн-заметки:**
- Каждый пользователь может иметь одну активную цель
- Цели обновляются на месте, а не создаются заново для разных дат
- Используйте `created_at`/`updated_at` для отслеживания истории изменений

**База данных:**
- Коллекция: `goals`
- Первичный ключ: `id` (UUID)
- Внешний ключ: `user_id` -> PocketBase auth users
- Уникальное поле: (user_id) - один goal на пользователя

### 3. EatenFood Model (`EatenFood.ts`)

```typescript
interface EatenFoodType extends BaseEntity {
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein?: number;
  fats?: number;
  carbs?: number;
  goal_id: string;          // Foreign key
  // Note: 'date' field not used. Use created_at for temporal queries
}
```

**Методы:**
- `getEatenFoodByGoal(goalId: string): Promise<EatenFoodType[]>` - Получить продукты для цели
- `getByDate(date: string): Promise<EatenFoodType[]>` - Получить продукты за день (фильтр по created_at)
- Наследует CRUD методы из BaseModel

**Дизайн-заметки:**
- Временная информация хранится в автоматических полях `created_at`/`updated_at`
- `getByDate()` фильтрует записи по диапазону дат created_at

**База данных:**
- Коллекция: `eatenfood`
- Первичный ключ: `id` (UUID)
- Внешний ключ: `goal_id` -> `goals.id`

## Base Model Class (`Base.ts`)

Генерическая базовая модель для всех сущностей:

```typescript
export default class BaseModel<T extends BaseEntity> {
    async findAll(): Promise<T[]>
    async findById(id: string): Promise<T>
    async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>
    async update(id: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T>
    async delete(id: string): Promise<boolean>
}
```

## Architecture Principles

### 1. Separation of Concerns (SRP)
- Модели отвечают только за работу с базой
- API функции в features/ отвечают за бизнес логику и валидацию
- UI компоненты отвечают только за отображение

### 2. Type Safety
- Все сущности типизированы через TypeScript интерфейсы
- Строгая типизация при создании и обновлении данных
- Автоматическое исключение полей `id`, `created_at` при создании

### 3. Automatic ID and Timestamps
- PocketBase **автоматически** генерирует UUID для `id`
- PocketBase **автоматически** генерирует `created_at`
- PocketBase **автоматически** агрегирует `updated_at`

Достаточно передать только данные:
```typescript
// Вместо этого:
const data = {
  id: crypto.randomUUID(),
  name: 'Apple',
  created_at: new Date(),
  ...
};

// Делаем вот так:
const data = {
  name: 'Apple',
  ...
};
const result = await model.create(data); // id, created_at генерируются автоматически
```

### 4. Error Handling
- Все методы имеют try-catch блоки
- Ошибки логируются в консоль
- Выбрасываются информативные ошибки

### 5. Relationships
- Связи между сущностями через Foreign Keys
- Проверка существования связанных сущностей перед созданием
- Каскадное удаление через параметры PocketBase

## Data Flow Diagram

```
User (UI Component)
    ↓
Feature API (addFoodEntry, setDailyGoal)
    ↓ (валидация, бизнес логика)
Model (EatenFood, Goal, User)
    ↓ (CRUD операции)
PocketBase (база данных)
    ↓ (генерирует id, created_at, updated_at)
Model ← Returning typed data
    ↓
Feature API ← Returning to caller
    ↓
UI Component ← Updates state
```

## Usage Examples

### Создание записи о пище

```typescript
import EatenFood from '@/shared/lib/models/EatenFood';

// API слой (features/add-food-entry/api/addFoodEntry.ts)
export async function addFoodEntry(input: AddFoodEntryInput) {
  // Валидация
  validateFoodEntryInput(input);

  // Проверка цели
  const goal = await Goal.findById(input.goal_id);
  if (!goal) throw new Error('Goal not found');

  // Создание (id и created_at генерируются автоматически!)
  const entry = await EatenFood.create({
    name: input.name,
    calories: input.calories,
    meal_type: input.meal_type,
    goal_id: input.goal_id,
    date: input.date ?? new Date().toISOString().split('T')[0],
  });

  return entry; // { id: '...', created_at: '...', name: '...', ... }
}
```

### Получение данных

```typescript
// Получить все цели пользователя
const goals = await Goal.getGoalsByUser(userId);

// Получить записи о пище для цели
const entries = await EatenFood.getEatenFoodByGoal(goalId);

// Получить конкретную запись
const entry = await EatenFood.findById(entryId);
```

### Обновление

```typescript
// Обновить цель
const updated = await Goal.update(goalId, {
  calories_goal: 2500
});
```

## Security Considerations

1. **Валидация входных данных** - происходит в API слое перед передачей моделям
2. **Foreign Key constraints** - проверяются перед созданием (user_id, goal_id)
3. **No SQL Injection** - используем ORM (PocketBase), не raw SQL
4. **Error Information Leakage** - не раскрываем внутренние детали ошибок
5. **Access Control** - проверяется на уровне API слоя через userId из сессии

## Testing

Для тестирования моделей:

```typescript
// Mock PocketBase или используй real database для integration tests
const goal = await Goal.create({
  user_id: 'test-user',
  calories_goal: 2000,
  date: '2024-03-16'
});

expect(goal.id).toBeDefined(); // UUID
expect(goal.created_at).toBeDefined(); // ISO string
```
