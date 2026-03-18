import PocketBase from 'pocketbase';
import { logger } from './logger';

const DEFAULT_POCKETBASE_URL = 'http://127.0.0.1:8090';
const DEFAULT_USERS_COLLECTION = 'users';

export const getPocketBaseUrl = () => {
	return process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || DEFAULT_POCKETBASE_URL;
};

export const getPocketBaseUsersCollection = () => {
	return process.env.POCKETBASE_USERS_COLLECTION || DEFAULT_USERS_COLLECTION;
};

export const createPocketBaseClient = () => {
	const client = new PocketBase(getPocketBaseUrl());
	client.autoCancellation(false);
	return client;
};

/**
 * Создать аутентифицированный PocketBase клиент с токеном пользователя
 * @param token - JWT токен от PocketBase (получается при authWithPassword)
 * @throws Error если токен невалиден или истекший
 */
export const createAuthenticatedPocketBaseClient = (token: string) => {
	try {
		// Decode JWT manually to extract and validate claims
		// PocketBase JWT format: { id, email, role, exp, ...other_fields }
		const parts = token.split('.');
		if (parts.length !== 3) {
			throw new Error('Invalid token format');
		}

		const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
		
		// Validate required fields
		if (!payload.id) {
			throw new Error('Token missing user ID');
		}

		// Check expiration
		if (payload.exp) {
			const expirationTime = payload.exp * 1000; // Convert to milliseconds
			const now = Date.now();

			if (now >= expirationTime) {
				throw new Error('Token has expired');
			}
		}

		const client = new PocketBase(getPocketBaseUrl());
		client.autoCancellation(false);
		
		// Save the token with user model containing the ID and email
		// This is crucial for collection rules that rely on @request.auth.id
		client.authStore.save(token, { id: payload.id, email: payload.email } as any);
		
		return client;
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to decode token';
		logger.error('Invalid authentication token', 'AUTH_INVALID_TOKEN', { message });
		throw new Error('Invalid or expired authentication token. Please sign in again.');
	}
};

export const pb = createPocketBaseClient()