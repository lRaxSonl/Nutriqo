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
