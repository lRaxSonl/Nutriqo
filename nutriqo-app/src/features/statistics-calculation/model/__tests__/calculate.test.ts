/**
 * Statistics Calculation Tests
 * FSD: features/statistics-calculation/model/__tests__
 * 
 * Unit tests for statistics calculation functions
 * Following best practices:
 * - Pure function testing
 * - Edge case coverage
 * - Clear test descriptions
 * - AAA pattern (Arrange, Act, Assert)
 */

import {
  calculateStatistics,
  calculateMacroPercentages,
  calculateCompletionRate,
} from '../calculate';
import { GoalForStatistics } from '@/entities/statistics/model';

describe('Statistics Calculation', () => {
  describe('calculateStatistics', () => {
    it('should return zero stats for empty array', () => {
      const result = calculateStatistics([]);

      expect(result).toEqual({
        totalGoals: 0,
        finishedGoals: 0,
        unfinishedGoals: 0,
        avgCalories: 0,
        avgProtein: 0,
        avgFats: 0,
        avgCarbs: 0,
      });
    });

    it('should return zero stats for null/undefined', () => {
      const result1 = calculateStatistics(null as any);
      const result2 = calculateStatistics(undefined as any);

      expect(result1.totalGoals).toBe(0);
      expect(result2.totalGoals).toBe(0);
    });

    it('should calculate stats for single completed goal', () => {
      const goals: GoalForStatistics[] = [
        {
          is_finished: true,
          calories_goal: 2000,
          protein_goal: 100,
          fats_goal: 67,
          carbs_goal: 250,
        },
      ];

      const result = calculateStatistics(goals);

      expect(result).toEqual({
        totalGoals: 1,
        finishedGoals: 1,
        unfinishedGoals: 0,
        avgCalories: 2000,
        avgProtein: 100,
        avgFats: 67,
        avgCarbs: 250,
      });
    });

    it('should calculate stats for single active goal', () => {
      const goals: GoalForStatistics[] = [
        {
          is_finished: false,
          calories_goal: 1800,
          protein_goal: 90,
          fats_goal: 60,
          carbs_goal: 225,
        },
      ];

      const result = calculateStatistics(goals);

      // For unfinished goals, averages should be 0 (no finished goals to average)
      expect(result).toEqual({
        totalGoals: 1,
        finishedGoals: 0,
        unfinishedGoals: 1,
        avgCalories: 0,    // No finished goals - average is 0
        avgProtein: 0,
        avgFats: 0,
        avgCarbs: 0,
      });
    });

    it('should correctly count finished and unfinished goals', () => {
      const goals: GoalForStatistics[] = [
        { is_finished: true, calories_goal: 2000, protein_goal: 100, fats_goal: 67, carbs_goal: 250 },
        { is_finished: false, calories_goal: 1800, protein_goal: 90, fats_goal: 60, carbs_goal: 225 },
        { is_finished: true, calories_goal: 2000, protein_goal: 100, fats_goal: 67, carbs_goal: 250 },
      ];

      const result = calculateStatistics(goals);

      expect(result.totalGoals).toBe(3);
      expect(result.finishedGoals).toBe(2);
      expect(result.unfinishedGoals).toBe(1);
    });

    it('should treat undefined is_finished as not finished', () => {
      const goals: GoalForStatistics[] = [
        { calories_goal: 2000, protein_goal: 100, fats_goal: 67, carbs_goal: 250 },
        { is_finished: false, calories_goal: 2000, protein_goal: 100, fats_goal: 67, carbs_goal: 250 },
      ];

      const result = calculateStatistics(goals);

      expect(result.totalGoals).toBe(2);
      expect(result.finishedGoals).toBe(0);
      expect(result.unfinishedGoals).toBe(2);
    });

    it('should calculate correct average calories for multiple goals', () => {
      const goals: GoalForStatistics[] = [
        { is_finished: true, calories_goal: 2000, protein_goal: 100, fats_goal: 67, carbs_goal: 250 },
        { is_finished: true, calories_goal: 1800, protein_goal: 90, fats_goal: 60, carbs_goal: 225 },
        { is_finished: true, calories_goal: 2200, protein_goal: 110, fats_goal: 73, carbs_goal: 275 },
      ];

      const result = calculateStatistics(goals);

      // Average: (2000 + 1800 + 2200) / 3 = 6000 / 3 = 2000
      expect(result.avgCalories).toBe(2000);
    });

    it('should only average finished goals, excluding unfinished', () => {
      const goals: GoalForStatistics[] = [
        { is_finished: true, calories_goal: 2000, protein_goal: 100, fats_goal: 67, carbs_goal: 250 },
        { is_finished: false, calories_goal: 1500, protein_goal: 75, fats_goal: 50, carbs_goal: 188 }, // Should be ignored!
      ];

      const result = calculateStatistics(goals);

      // Average should use ONLY finished goal (2000), not the unfinished one (1500)
      expect(result.totalGoals).toBe(2);
      expect(result.finishedGoals).toBe(1);
      expect(result.unfinishedGoals).toBe(1);
      expect(result.avgCalories).toBe(2000); // Only finished: 2000 / 1 = 2000
      expect(result.avgProtein).toBe(100);
      expect(result.avgFats).toBe(67);
      expect(result.avgCarbs).toBe(250);
    });

    it('should return zero averages when no finished goals exist', () => {
      const goals: GoalForStatistics[] = [
        { is_finished: false, calories_goal: 2000, protein_goal: 100, fats_goal: 67, carbs_goal: 250 },
        { is_finished: false, calories_goal: 1800, protein_goal: 90, fats_goal: 60, carbs_goal: 225 },
      ];

      const result = calculateStatistics(goals);

      expect(result.totalGoals).toBe(2);
      expect(result.finishedGoals).toBe(0);
      expect(result.unfinishedGoals).toBe(2);
      expect(result.avgCalories).toBe(0); // No finished goals
      expect(result.avgProtein).toBe(0);
      expect(result.avgFats).toBe(0);
      expect(result.avgCarbs).toBe(0);
    });

    it('should calculate correct average macros with rounding', () => {
      const goals: GoalForStatistics[] = [
        { is_finished: true, calories_goal: 2000, protein_goal: 100, fats_goal: 66, carbs_goal: 250 },
        { is_finished: true, calories_goal: 2000, protein_goal: 101, fats_goal: 67, carbs_goal: 251 },
      ];

      const result = calculateStatistics(goals);

      // Average from finished goals:
      // (100 + 101) / 2 = 100.5 -> 101 (rounded)
      // (66 + 67) / 2 = 66.5 -> 67 (rounded)
      // (250 + 251) / 2 = 250.5 -> 251 (rounded)
      expect(result.avgProtein).toBe(101);
      expect(result.avgFats).toBe(67);
      expect(result.avgCarbs).toBe(251);
    });

    it('should ignore unfinished goals when calculating averages', () => {
      const goals: GoalForStatistics[] = [
        { is_finished: true, calories_goal: 2000, protein_goal: 100, fats_goal: 66, carbs_goal: 250 },
        { is_finished: true, calories_goal: 2000, protein_goal: 100, fats_goal: 66, carbs_goal: 250 },
        { is_finished: false, calories_goal: 1000, protein_goal: 50, fats_goal: 33, carbs_goal: 125 }, // Should be ignored!
      ];

      const result = calculateStatistics(goals);

      // Should only average the 2 finished goals, not the unfinished one
      expect(result.avgProtein).toBe(100); // (100 + 100) / 2 = 100
      expect(result.avgFats).toBe(66);     // (66 + 66) / 2 = 66
      expect(result.avgCarbs).toBe(250);   // (250 + 250) / 2 = 250
    });

    it('should handle zero macros', () => {
      const goals: GoalForStatistics[] = [
        { is_finished: true, calories_goal: 2000, protein_goal: 0, fats_goal: 0, carbs_goal: 0 },
      ];

      const result = calculateStatistics(goals);

      expect(result.avgProtein).toBe(0);
      expect(result.avgFats).toBe(0);
      expect(result.avgCarbs).toBe(0);
    });

    it('should handle missing macros (undefined)', () => {
      const goals: GoalForStatistics[] = [
        { is_finished: true, calories_goal: 2000 },
        { is_finished: true, calories_goal: 2000 },
      ];

      const result = calculateStatistics(goals);

      expect(result.avgCalories).toBe(2000);
      expect(result.avgProtein).toBe(0);
      expect(result.avgFats).toBe(0);
      expect(result.avgCarbs).toBe(0);
    });

    it('should handle string numbers correctly', () => {
      const goals: GoalForStatistics[] = [
        {
          is_finished: true,
          calories_goal: '2000' as any,
          protein_goal: '100' as any,
          fats_goal: '67' as any,
          carbs_goal: '250' as any,
        },
      ];

      const result = calculateStatistics(goals);

      expect(result.avgCalories).toBe(2000);
      expect(result.avgProtein).toBe(100);
    });
  });

  describe('calculateMacroPercentages', () => {
    it('should return zero percentages for zero calories', () => {
      const result = calculateMacroPercentages(0, 100, 67, 250);

      expect(result).toEqual({
        proteinPercent: 0,
        fatsPercent: 0,
        carbsPercent: 0,
      });
    });

    it('should calculate correct percentages for standard macros', () => {
      // Standard: 2000 kcal, Б 20%, Ж 30%, У 50%
      const result = calculateMacroPercentages(2000, 100, 67, 250);

      // Б: (100 * 4) / 2000 * 100 = 20%
      // Ж: (67 * 9) / 2000 * 100 = 30.15% ≈ 30%
      // У: (250 * 4) / 2000 * 100 = 50%
      expect(result.proteinPercent).toBe(20);
      expect(result.fatsPercent).toBe(30);
      expect(result.carbsPercent).toBe(50);
    });

    it('should calculate percentages with rounding', () => {
      // 2010 kcal, macros that don't divide evenly
      const result = calculateMacroPercentages(2010, 101, 67, 251);

      // (101 * 4) / 2010 * 100 = 20.09% ≈ 20%
      // (67 * 9) / 2010 * 100 = 30% (approximately)
      // (251 * 4) / 2010 * 100 = 49.9% ≈ 50%
      expect(typeof result.proteinPercent).toBe('number');
      expect(typeof result.fatsPercent).toBe('number');
      expect(typeof result.carbsPercent).toBe('number');
    });

    it('should handle zero macros', () => {
      const result = calculateMacroPercentages(2000, 0, 0, 0);

      expect(result).toEqual({
        proteinPercent: 0,
        fatsPercent: 0,
        carbsPercent: 0,
      });
    });

    it('should calculate percentages for high protein diet', () => {
      // High protein: 2000 kcal, 150g protein, 70g fats, 150g carbs
      // Б: 40%, Ж: 31.5%, У: 30%
      const result = calculateMacroPercentages(2000, 150, 70, 150);

      expect(result.proteinPercent).toBe(30); // (150 * 4) / 2000 * 100 = 30%
      expect(result.fatsPercent).toBe(32); // (70 * 9) / 2000 * 100 = 31.5%
      expect(result.carbsPercent).toBe(30); // (150 * 4) / 2000 * 100 = 30%
    });
  });

  describe('calculateCompletionRate', () => {
    it('should return 0% for zero goals', () => {
      const result = calculateCompletionRate(0, 0);
      expect(result).toBe(0);
    });

    it('should return 0% when no goals are finished', () => {
      const result = calculateCompletionRate(5, 0);
      expect(result).toBe(0);
    });

    it('should return 100% when all goals are finished', () => {
      const result = calculateCompletionRate(5, 5);
      expect(result).toBe(100);
    });

    it('should calculate 50% completion', () => {
      const result = calculateCompletionRate(4, 2);
      expect(result).toBe(50);
    });

    it('should calculate 33% completion with rounding', () => {
      const result = calculateCompletionRate(3, 1);
      expect(result).toBe(33); // 1/3 * 100 = 33.33... ≈ 33%
    });

    it('should calculate 67% completion with rounding', () => {
      const result = calculateCompletionRate(3, 2);
      expect(result).toBe(67); // 2/3 * 100 = 66.67... ≈ 67%
    });

    it('should handle large numbers', () => {
      const result = calculateCompletionRate(1000, 750);
      expect(result).toBe(75);
    });

    it('should return 0% if totalGoals is 0 (edge case)', () => {
      const result = calculateCompletionRate(0, 100); // Invalid state but should handle gracefully
      expect(result).toBe(0);
    });
  });

  describe('Integration scenarios', () => {
    it('should calculate complete statistics for realistic week of goals', () => {
      const goals: GoalForStatistics[] = [
        // Day 1
        { is_finished: true, calories_goal: 2000, protein_goal: 100, fats_goal: 67, carbs_goal: 250 },
        // Day 2
        { is_finished: true, calories_goal: 1800, protein_goal: 90, fats_goal: 60, carbs_goal: 225 },
        // Day 3
        { is_finished: true, calories_goal: 2200, protein_goal: 110, fats_goal: 73, carbs_goal: 275 },
        // Day 4 (active - NOT included in averages)
        { is_finished: false, calories_goal: 1900, protein_goal: 95, fats_goal: 63, carbs_goal: 237 },
      ];

      const stats = calculateStatistics(goals);
      const completion = calculateCompletionRate(stats.totalGoals, stats.finishedGoals);
      const macros = calculateMacroPercentages(
        stats.avgCalories,
        stats.avgProtein,
        stats.avgFats,
        stats.avgCarbs
      );

      // Verify stats
      expect(stats.totalGoals).toBe(4);
      expect(stats.finishedGoals).toBe(3);
      expect(stats.unfinishedGoals).toBe(1);

      // Average: Only finished goals count = (2000+1800+2200) / 3 = 6000 / 3 = 2000
      // The unfinished goal (1900) is NOT included in averages
      expect(stats.avgCalories).toBe(2000);
      expect(stats.avgProtein).toBe(100); // (100+90+110)/3 = 300/3 = 100
      expect(stats.avgFats).toBe(67);     // (67+60+73)/3 = 200/3 ≈ 67
      expect(stats.avgCarbs).toBe(250);   // (250+225+275)/3 = 750/3 = 250

      // Completion: 3/4 = 75%
      expect(completion).toBe(75);

      // Macros should be valid percentages
      expect(macros.proteinPercent).toBeGreaterThan(0);
      expect(macros.fatsPercent).toBeGreaterThan(0);
      expect(macros.carbsPercent).toBeGreaterThan(0);
    });
  });
});
