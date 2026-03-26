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

/**
 * Get an admin-authenticated PocketBase client for accessing all records
 * Uses admin email/password from environment variables
 * Falls back to unauthenticated client if admin credentials not available
 */
export async function getAdminPocketBaseClient() {
	const client = createPocketBaseClient();
	
	const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
	const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
	
	if (!adminEmail || !adminPassword) {
		console.warn('[PocketBase Admin] Admin credentials not configured');
		console.warn('[PocketBase Admin] Falling back to unauthenticated client');
		return client;
	}
	
	try {
		console.log('[PocketBase Admin] Authenticating as admin with email:', adminEmail);
		
		// Try to authenticate as super admin account (not as user)
		const authData = await client.admins.authWithPassword(adminEmail, adminPassword);
		
		console.log('[PocketBase Admin] ✓ Admin authenticated successfully');
		return client;
	} catch (error: any) {
		console.error('[PocketBase Admin] Failed to authenticate as admin:', error?.message);
		console.warn('[PocketBase Admin] Falling back to unauthenticated client (may have limited access)');
		return client;
	}
}