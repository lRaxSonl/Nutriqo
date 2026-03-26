/**
 * Statistics Calculation Logic
 * FSD: features/statistics-calculation/model
 * 
 * Pure functions for calculating statistics from goals
 * No side effects, fully testable
 */

import { StatisticsData, GoalForStatistics } from '@/entities/statistics/model';

/**
 * Calculate statistics from array of goals
 * 
 * @param goals - Array of goal objects with calories and macros
 * @returns Calculated statistics object
 * 
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
export function calculateStatistics(goals: GoalForStatistics[]): StatisticsData {
  // Handle empty array
  if (!goals || goals.length === 0) {
    return {
      totalGoals: 0,
      finishedGoals: 0,
      unfinishedGoals: 0,
      avgCalories: 0,
      avgProtein: 0,
      avgFats: 0,
      avgCarbs: 0,
    };
  }

  const totalGoals = goals.length;
  
  // Filter finished goals (only finished goals are used for averages)
  const finishedGoalsList = goals.filter((g) => g.is_finished === true);
  const finishedGoals = finishedGoalsList.length;
  const unfinishedGoals = totalGoals - finishedGoals;

  // If no finished goals, return zeros for averages
  if (finishedGoals === 0) {
    return {
      totalGoals,
      finishedGoals,
      unfinishedGoals,
      avgCalories: 0,
      avgProtein: 0,
      avgFats: 0,
      avgCarbs: 0,
    };
  }

  // Calculate totals from FINISHED goals only
  const totalCalories = finishedGoalsList.reduce((sum, g) => sum + (Number(g.calories_goal) || 0), 0);
  const totalProtein = finishedGoalsList.reduce((sum, g) => sum + (Number(g.protein_goal) || 0), 0);
  const totalFats = finishedGoalsList.reduce((sum, g) => sum + (Number(g.fats_goal) || 0), 0);
  const totalCarbs = finishedGoalsList.reduce((sum, g) => sum + (Number(g.carbs_goal) || 0), 0);

  // Calculate averages from finished goals (rounded to nearest integer)
  const avgCalories = Math.round(totalCalories / finishedGoals);
  const avgProtein = Math.round(totalProtein / finishedGoals);
  const avgFats = Math.round(totalFats / finishedGoals);
  const avgCarbs = Math.round(totalCarbs / finishedGoals);

  return {
    totalGoals,
    finishedGoals,
    unfinishedGoals,
    avgCalories,
    avgProtein,
    avgFats,
    avgCarbs,
  };
}

/**
 * Calculate macros percentages for visual representation
 * 
 * @param avgCalories - Average calories
 * @param avgProtein - Average protein in grams
 * @param avgFats - Average fats in grams
 * @param avgCarbs - Average carbs in grams
 * @returns Object with percentages for each macro
 * 
 * Caloric conversion:
 * - Protein: 4 kcal/g
 * - Fats: 9 kcal/g
 * - Carbs: 4 kcal/g
 */
export function calculateMacroPercentages(
  avgCalories: number,
  avgProtein: number,
  avgFats: number,
  avgCarbs: number
) {
  if (avgCalories === 0) {
    return {
      proteinPercent: 0,
      fatsPercent: 0,
      carbsPercent: 0,
    };
  }

  const proteinCalories = avgProtein * 4;
  const fatsCalories = avgFats * 9;
  const carbsCalories = avgCarbs * 4;

  const proteinPercent = Math.round((proteinCalories / avgCalories) * 100);
  const fatsPercent = Math.round((fatsCalories / avgCalories) * 100);
  const carbsPercent = Math.round((carbsCalories / avgCalories) * 100);

  return {
    proteinPercent,
    fatsPercent,
    carbsPercent,
  };
}

/**
 * Calculate completion rate
 * 
 * @param totalGoals - Total number of goals
 * @param finishedGoals - Number of finished goals
 * @returns Completion percentage (0-100)
 */
export function calculateCompletionRate(totalGoals: number, finishedGoals: number): number {
  if (totalGoals === 0) return 0;
  return Math.round((finishedGoals / totalGoals) * 100);
}
