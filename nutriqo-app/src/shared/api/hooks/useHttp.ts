'use client';

import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { HttpClientError } from '../http-client/types';

interface UseHttpOptions {
  onSuccess?: (message?: string) => void;
  onError?: (error: HttpClientError) => void;
  showSuccess?: boolean;
  showError?: boolean;
}

export const useHttp = () => {
  const handleError = useCallback((error: unknown, options: UseHttpOptions = {}) => {
    const { onError, showError = true } = options;

    if (error instanceof HttpClientError) {
      if (showError) {
        toast.error(error.message);
      }
      onError?.(error);
    } else if (error instanceof Error) {
      if (showError) {
        toast.error(error.message);
      }
    } else {
      if (showError) {
        toast.error('Unknown error occurred');
      }
    }
  }, []);

  const handleSuccess = useCallback((message?: string, options: UseHttpOptions = {}) => {
    const { onSuccess, showSuccess = true } = options;

    if (showSuccess && message) {
      toast.success(message);
    }
    onSuccess?.(message);
  }, []);

  return { handleError, handleSuccess };
};
