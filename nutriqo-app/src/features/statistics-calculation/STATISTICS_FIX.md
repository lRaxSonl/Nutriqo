# Statistics Calculation Fix (26 марта 2026)

## Проблема 🔴
Функция `calculateStatistics()` была неправильно рассчитывает средние калории, **включая активные (незавершённые) цели** в расчёты.

### Пример проблемы:
```
Завершённые цели:
- День 1: 2000 ккал ✅ (завершена)

Активные цели:
- День 2: 1500 ккал (в процессе) 

НЕПРАВИЛЬНЫЙ расчёт (старый код):
avgCalories = (2000 + 1500) / 2 = 1750 ккал ❌

ПРАВИЛЬНЫЙ расчёт (новый код):
avgCalories = 2000 / 1 = 2000 ккал ✅
```

## Решение ✅
Обновлена функция `calculateStatistics()` для учета **только завершённых целей** при расчёте средних значений.

### Изменения в коде:

**Файл:** `src/features/statistics-calculation/model/calculate.ts`

#### ДО (неправильно):
```typescript
const totalCalories = goals.reduce((sum, g) => sum + (Number(g.calories_goal) || 0), 0);
const avgCalories = Math.round(totalCalories / totalGoals); // Делим на ВСЕ цели
```

#### ПОСЛЕ (правильно):
```typescript
const finishedGoalsList = goals.filter((g) => g.is_finished === true);
const finishedGoals = finishedGoalsList.length;

// Если нет завершённых целей - averages = 0
if (finishedGoals === 0) {
  return { ..., avgCalories: 0, ... };
}

// Считаем ТОЛЬКО по завершённым целям
const totalCalories = finishedGoalsList.reduce((sum, g) => sum + (Number(g.calories_goal) || 0), 0);
const avgCalories = Math.round(totalCalories / finishedGoals); // Делим на ЗАВЕРШЁННЫЕ цели
```

## Логика ясной отписовки 📝

```typescript
/**
 * IMPORTANT: Average values are calculated from FINISHED goals only!
 * This ensures statistics reflect actual completed days, not active/in-progress goals.
 * 
 * Formula:
 * - totalGoals: count of all goals
 * - finishedGoals: count of goals where is_finished === true
 * - unfinishedGoals: totalGoals - finishedGoals
 * - avgCalories: sum(finished_calories) / finishedGoals (if any finished goals exist)
 * - avgProtein/Fats/Carbs: sum(finished_macros) / finishedGoals (rounded)
 * 
 * If no finished goals exist, averages are 0.
 * Active/unfinished goals are NOT included in average calculations.
 */
```

## Поведение

| Сценарий | Результат |
|----------|-----------|
| Все цели завершены | Среднее считается по всем завершённым |
| Есть завершённые и активные | Среднее считается ТОЛЬКО по завершённым |
| Только активные цели (нет завершённых) | avgCalories = 0 (нет данных) |
| Нет целей вообще | totalGoals = 0, все averages = 0 |

## Примеры в тестах

### Пример 1: Смешанные цели
```typescript
const goals = [
  { is_finished: true, calories_goal: 2000 },    // ✅ завершена
  { is_finished: false, calories_goal: 1500 },   // 🔄 активна - НЕ учитывается
];

// РЕЗУЛЬТАТ:
// avgCalories = 2000 (только завершённая цель)
```

### Пример 2: Только активные
```typescript
const goals = [
  { is_finished: false, calories_goal: 1800 },   // 🔄 активна
];

// РЕЗУЛЬТАТ:
// avgCalories = 0 (нет завершённых целей)
```

### Пример 3: Неделя с одной активной
```typescript
const goals = [
  { is_finished: true, calories_goal: 2000 },    // ✅
  { is_finished: true, calories_goal: 1800 },    // ✅
  { is_finished: true, calories_goal: 2200 },    // ✅
  { is_finished: false, calories_goal: 1900 },   // 🔄 - НЕ учитывается
];

// РЕЗУЛЬТАТ:
// avgCalories = (2000 + 1800 + 2200) / 3 = 2000
// (активная цель 1900 полностью игнорируется)
```

## Тестирование

- ✅ 28/28 тестов passed
- ✅ Добавлены новые тесты для проверки фильтрации активных целей
- ✅ Обновлены интеграционные тесты

### Новые тесты:
- `should only average finished goals, excluding unfinished` - проверяет фильтрацию
- `should return zero averages when no finished goals exist` - проверяет граничный случай
- `should ignore unfinished goals when calculating averages` - проверяет, что активные цели не учитываются

## Страница статистики
Теперь `/statistics` показывает **правильные средние значения**, которые отражают только завершённые дни, без влияния текущей активной цели.
