import { RequestOptions, ApiResponse, HttpClientError } from './types';

const DEFAULT_TIMEOUT = 10000;

export class HttpClient {
  private baseURL: string;
  private defaultOptions: RequestInit;

  constructor(baseURL: string = '', defaultOptions: RequestInit = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...defaultOptions.headers,
      },
      ...defaultOptions,
    };
  }

  private async request<T = unknown>(
    url: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = DEFAULT_TIMEOUT, body, ...fetchOptions } = options;
    const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        ...this.defaultOptions,
        ...fetchOptions,
        headers: {
          ...this.defaultOptions.headers,
          ...fetchOptions.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: unknown = null;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        const errorMessage = (data as Record<string, unknown>)?.message || `Error: ${response.statusText}`;
        throw new HttpClientError(String(errorMessage), response.status, data as Record<string, unknown>);
      }

      return {
        ok: true,
        status: response.status,
        data: data as T,
      };
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof HttpClientError) {
        throw err;
      }

      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        throw new HttpClientError('Network error. Check your connection.', 0);
      }

      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new HttpClientError(`Request timeout after ${timeout}ms`, 408);
      }

      throw new HttpClientError(
        err instanceof Error ? err.message : 'Unknown error',
        500
      );
    }
  }

  async get<T = unknown>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  async put<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  async patch<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }

  async delete<T = unknown>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
