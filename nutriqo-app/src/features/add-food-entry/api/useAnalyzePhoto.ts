/**
 * Hook для отправки фото на анализ через API
 * FSD: features/add-food-entry/api
 */

import { useCallback, useState } from 'react';
import { httpClient } from '@/shared/api';
import { FoodPhotoAnalysisResult } from '@/features/add-food-entry/lib/foodPhotoPrompt';

export interface UseAnalyzePhotoState {
  loading: boolean;
  error: string | null;
  errorCode: string | null;
  data: FoodPhotoAnalysisResult | null;
}

export function useAnalyzePhoto() {
  const [state, setState] = useState<UseAnalyzePhotoState>({
    loading: false,
    error: null,
    errorCode: null,
    data: null,
  });

  const analyzePhoto = useCallback(async (imageBase64: string) => {
    try {
      setState({ loading: true, error: null, errorCode: null, data: null });

      const response = await httpClient.post('/api/food/analyze-photo', {
        image: imageBase64,
      });

      if (!response.ok) {
        const errorData = response.data as Record<string, any>;
        const errorCode = errorData.code || 'UNKNOWN_ERROR';
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = response.data as Record<string, any>;

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      setState({ loading: false, error: null, errorCode: null, data: result.data });
      return result.data;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setState({ loading: false, error: errorMsg, errorCode: 'API_ERROR', data: null });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, errorCode: null, data: null });
  }, []);

  return {
    ...state,
    analyzePhoto,
    reset,
  };
}
