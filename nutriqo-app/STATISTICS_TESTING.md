# Statistics Testing & Refactoring

## Overview

Статистика была полностью рефакторена согласно FSD архитектуре с чистыми функциями и комплексным юнит-тестированием.

## Архитектура (FSD)

### Entities Layer
- **`src/entities/statistics/model/types.ts`** - Типы данных
  - `StatisticsData` - Интерфейс для результата расчётов
  - `GoalForStatistics` - Интерфейс для входных целей

### Features Layer
- **`src/features/statistics-calculation/model/calculate.ts`** - Чистые функции расчёта
  - `calculateStatistics(goals)` - Основной расчёт
  - `calculateMacroPercentages(avgCal, P, F, C)` - Расчёт процентов БЖУ
  - `calculateCompletionRate(total, finished)` - Процент завершения

## Функции расчёта

### 1. calculateStatistics(goals: GoalForStatistics[]): StatisticsData

Вычисляет полную статистику из массива целей.

**Формулы:**
```
totalGoals = количество целей
finishedGoals = количество где is_finished === true
unfinishedGoals = totalGoals - finishedGoals
avgCalories = sum(calories) / totalGoals (округлено)
avgProtein = sum(protein) / totalGoals (округлено)
avgFats = sum(fats) / totalGoals (округлено)
avgCarbs = sum(carbs) / totalGoals (округлено)
```

**Особенности:**
- Обрабатывает пустые массивы (возвращает нули)
- Обрабатывает null/undefined значения макросов
- Преобразует строки в числа автоматически

### 2. calculateMacroPercentages(avgCal, avgP, avgF, avgC)

Вычисляет процентное соотношение БЖУ для визуализации.

**Формулы:**
```
proteinPercent = (avgProtein * 4 / avgCalories) * 100
fatsPercent = (avgFats * 9 / avgCalories) * 100
carbsPercent = (avgCarbs * 4 / avgCalories) * 100
```

**Калорийность:**
- Белки: 4 ккал/g
- Жиры: 9 ккал/g
- Углеводы: 4 ккал/g

### 3. calculateCompletionRate(total, finished): number

Вычисляет процент завершения целей (0-100).

```
completion = (finished / total) * 100
```

## Юнит Тесты

**Файл:** `src/features/statistics-calculation/model/__tests__/calculate.test.ts`

**Всего тестов: 25 ✅**

### Покрытие тестами

#### calculateStatistics (11 тестов)
- ✓ Пустой массив
- ✓ Null/undefined
- ✓ Одна завершённая цель
- ✓ Одна активная цель
- ✓ Подсчёт finished/unfinished целей
- ✓ Undefined is_finished = не завершено
- ✓ Корректная средняя по методу калорий
- ✓ Рounding при расчёте средних
- ✓ Нулевые макросы
- ✓ Отсутствующие макросы (undefined)
- ✓ Строковые числа (string -> number)

#### calculateMacroPercentages (5 тестов)
- ✓ Нулевые калории
- ✓ Стандартные проценты (20/30/50)
- ✓ Rounding при неровных делениях
- ✓ Нулевые макросы
- ✓ Высокобелковая диета (30/32/30)

#### calculateCompletionRate (8 тестов)
- ✓ Ноль целей
- ✓ Ноль завершённых
- ✓ 100% завершения
- ✓ 50% завершения
- ✓ 33% с rounding
- ✓ 67% с rounding
- ✓ Большие числа
- ✓ Edge case (ноль целей)

#### Integration (1 тест)
- ✓ Полная неделя целей (realistic scenario)

## Команды для тестирования

```bash
# Запустить тесты один раз
npm test

# Запустить тесты в режиме watch
npm test -- --watch

# Генерировать coverage отчёт
npm test -- --coverage

# Запустить конкретный тест файл
npm test -- calculate.test.ts
```

## Рефакторинг страницы

**Было (inline логика):**
```typescript
const totalCalories = goals.reduce((sum: number, g: any) => 
  sum + (Number(g.calories_goal) || 0), 0);
```

**Стало (чистые функции):**
```typescript
const stats = calculateStatistics(goals);
const completion = calculateCompletionRate(stats.totalGoals, stats.finishedGoals);
```

## Best Practices

### ✅ Implemented

1. **Pure Functions** - Нет побочных эффектов, легко тестировать
2. **Edge Cases** - Все граничные случаи покрыты
3. **Type Safety** - Full TypeScript типизация
4. **FSD Architecture** - Правильная структура папок
5. **AAA Pattern** - Arrange, Act, Assert в тестах
6. **Integration Tests** - Реальные сценарии тестирования
7. **Clear Names** - Понятные имена функций и переменных
8. **Comments** - Документированы формулы и особенности

### Testing Best Practices

- ✅ Каждая функция тестируется отдельно
- ✅ Граничные случаи: empty, null, zero
- ✅ Тестирование с rounding
- ✅ Тестирование типов данных (string -> number)
- ✅ Integration scenarios
- ✅ Descriptive test names
- ✅ No magic numbers - все понятно

## Файлы

```
src/
├── entities/statistics/
│   └── model/
│       ├── types.ts              (TypeScript интерфейсы)
│       └── index.ts              (Экспорты)
│
├── features/statistics-calculation/
│   └── model/
│       ├── calculate.ts          (Чистые функции расчёта)
│       ├── index.ts              (Экспорты)
│       └── __tests__/
│           └── calculate.test.ts (25 тестов)
│
└── app/statistics/
    └── page.tsx                  (Использует calculate.ts)

jest.config.js                     (Jest конфигурация)
jest.setup.js                      (Jest setup)
```

## Результаты

✅ **Build:** Успешноскомпилируется  
✅ **Tests:** 25/25 passed  
✅ **TypeScript:** No errors  
✅ **Coverage:** Все функции покрыты  
✅ **FSD:** Правильная архитектура
