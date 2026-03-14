import { httpClient } from '../http-client/client';

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  ok: boolean;
  userId: string;
  emailConfirmationRequired: boolean;
}

export const authApi = {
  register: async (credentials: RegisterRequest): Promise<RegisterResponse> => {
    const response = await httpClient.post<RegisterResponse>('/api/auth/register', credentials);
    return response.data as RegisterResponse;
  },
};
