import PocketBase from 'pocketbase';

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
 */
export const createAuthenticatedPocketBaseClient = (token: string) => {
	const client = new PocketBase(getPocketBaseUrl());
	client.autoCancellation(false);
	
	// Decode the JWT token to extract user info
	// PocketBase JWT format: { id, email, role, ...other_fields }
	let userId = '';
	try {
		// JWT format: header.payload.signature
		const parts = token.split('.');
		if (parts.length === 3) {
			const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
			userId = payload.id || payload.sub || '';
		}
	} catch (e) {
		console.warn('Failed to decode JWT token');
	}
	
	// Save the token with user model containing at least the ID
	// This is crucial for collection rules that rely on @request.auth.id
	client.authStore.save(token, { id: userId } as any);
	
	return client;
};

export const pb = createPocketBaseClient()