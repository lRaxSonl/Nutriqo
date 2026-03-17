/**
 * Типы и константы для приемов пищи
 * Используется и в фронте и в моделях данных
 */

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Конфигурация типов приемов пищи с эмодзи и русскими названиями
 */
export const MEAL_CONFIG: Record<MealType, { label: string; emoji: string }> = {
  breakfast: {
    label: 'Завтрак',
    emoji: '🍳',
  },
  lunch: {
    label: 'Обед',
    emoji: '🍲',
  },
  dinner: {
    label: 'Ужин',
    emoji: '🍽️',
  },
  snack: {
    label: 'Перекус',
    emoji: '🍎',
  },
};

/**
 * Массив всех типов приемов пищи
 */
export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/**
 * Опции для select компонента
 */
export const MEAL_OPTIONS = MEAL_TYPES.map((type) => ({
  value: type,
  label: `${MEAL_CONFIG[type].emoji} ${MEAL_CONFIG[type].label}`,
}));
