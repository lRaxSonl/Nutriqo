export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown | FormData | null;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, unknown>;
}

export class HttpClientError extends Error implements ApiError {
  status: number;
  details?: Record<string, unknown>;

  constructor(message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'HttpClientError';
    this.status = status;
    this.details = details;
  }
}
