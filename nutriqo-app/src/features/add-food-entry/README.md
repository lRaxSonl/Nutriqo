# Food Entry Feature

## Overview
Фича для добавления записей о съеденной пище в приложение Nutriqo.

## Architecture (FSD)

```
add-food-entry/
├── api/                 # API слой (useCase функции)
│   ├── addFoodEntry.ts # Основная бизнес логика
│   └── index.ts       # Экспорты
├── ui/                  # UI компоненты
│   └── AddFoodForm.tsx # Форма для добавления
```

## API Functions

### `addFoodEntry(input: AddFoodEntryInput): Promise<EatenFoodType>`

Добавить запись о съеденной пище в базу данных.

**Параметры:**
- `name: string` - Название блюда
- `calories: number` - Количество калорий (0-10000)
- `protein?: number` - Белки (опционально)
- `fats?: number` - Жиры (опционально)
- `carbs?: number` - Углеводы (опционально)
- `meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'` - Тип приема пищи
- `goal_id: string` - ID цели, связанной с записью

**Возвращает:** Созданная запись с автоматически сгенерированными `id`, `created_at` и `updated_at`

**Поведение:** Timestamp автоматически устанавливается на текущее время (created_at) при создании.

**Выброс ошибок:**
- ValidationError - если данные не валидны
- NotFoundError - если goal_id не существует
- DatabaseError - если ошибка при сохранении в БД

## Security Features

### Input Validation
- Обязательная валидация всех входных данных
- Лимиты на значения (calories: 0-10000, name: макс 100 символов)
- Санитизация строк (trim())

### Database Access
- Использование ORM (PocketBase) для защиты от SQL injection
- Проверка существования связанных сущностей (goal_id)
- Правильная обработка ошибок без раскрытия внутренних деталей

### Authentication
- Требует наличие сессии для добавления записей
- Проверка прав доступа через goal_id (убедиться, что goal принадлежит текущему пользователю)

## Best Practices Applied

### SOLID Principles
- **S**ingle Responsibility - каждая функция отвечает за одно
- **O**pen/Closed - новые валидаторы добавляем без изменения основного кода
- **L**iskov Substitution - все модели расширяют BaseEntity
- **I**nterface Segregation - отдельные интерфейсы для input/output
- **D**ependency Inversion - зависим от моделей, а не конкретных реализаций БД

### FSD (Feature-Sliced Design)
- API слой (бизнес логика) отделен от UI компонентов
- Компоненты скрыты от деталей реализации
- Легко тестировать API отдельно от UI

### Error Handling
- Перехват и логирование всех ошибок
- Информативные сообщения об ошибках
- Не раскрываем внутренние детали ошибок пользователю

## Usage Example

```typescript
// В компоненте
import { addFoodEntry } from '@/features/add-food-entry/api';

const entry = await addFoodEntry({
  name: 'Яблоко',
  calories: 80,
  protein: 0,
  fats: 0,
  carbs: 20,
  meal_type: 'breakfast',
  goal_id: 'abc-123'
});
```

## Database Schema (PocketBase)

```
Collection: eatenfood
- id (uuid, auto-generated)
- name (string, required)
- meal_type (select, required) - 'breakfast' | 'lunch' | 'dinner' | 'snack'
- calories (number, required)
- protein (number, optional)
- fats (number, optional)
- carbs (number, optional)
- goal_id (relation to goals, required) - FK to goals.id
- created_at (datetime, auto-generated) - When food entry was created
- updated_at (datetime, auto-generated) - When food entry was last updated
```

**Design Notes:**
- Use `created_at` timestamp to determine when food was eaten
- To query entries for a specific day, use `getByDate(date)` which filters by created_at range
