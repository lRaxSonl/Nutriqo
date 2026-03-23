/**
 * Utility functions for handling API responses and errors
 */

/**
 * Safely extracts error message from API response
 */
export const extractErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>;
    if (typeof record.error === 'string') {
      return record.error;
    }
    if (typeof record.message === 'string') {
      return record.message;
    }
  }

  return 'Неизвестная ошибка';
};

/**
 * Safely extracts goal ID from API response
 */
export const extractGoalId = (data: unknown): string | undefined => {
  if (typeof data === 'object' && data !== null) {
    const record = data as Record<string, unknown>;
    if (typeof record.id === 'string') {
      return record.id;
    }
  }
  return undefined;
};

/**
 * Safely extracts error message from response data
 */
export const extractResponseError = (responseData: unknown): string | undefined => {
  if (typeof responseData === 'object' && responseData !== null) {
    const record = responseData as Record<string, unknown>;
    if (typeof record.error === 'string') {
      return record.error;
    }
  }
  return undefined;
};
