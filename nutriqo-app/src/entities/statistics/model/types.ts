/**
 * Statistics Entity Model
 * FSD: entities/statistics
 */

export interface StatisticsData {
  totalGoals: number;
  finishedGoals: number;
  unfinishedGoals: number;
  avgCalories: number;
  avgProtein: number;
  avgFats: number;
  avgCarbs: number;
}

export interface GoalForStatistics {
  is_finished?: boolean;
  calories_goal: number;
  protein_goal?: number;
  fats_goal?: number;
  carbs_goal?: number;
}
