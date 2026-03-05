export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodItem = {
    id: string;
    name: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
}

export interface FoodEntry extends FoodItem {
    mealType: MealType;
    date: Date; // ISO date string
}

export interface DailyGoal {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;  
}