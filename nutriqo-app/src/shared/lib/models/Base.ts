import { pb, createAuthenticatedPocketBaseClient } from '@/shared/lib/pocketbase'
import type PocketBase from 'pocketbase';

/**
 * Базовый интерфейс для всех сущностей в приложении
 * Гарантирует наличие id и created_at во всех моделях
 */
export interface BaseEntity {
    id: string; // UUID v4
    created_at: string; // ISO 8601 timestamp
    updated_at?: string; // ISO 8601 timestamp
}

/**
 * Базовая модель для всех сущностей
 * Реализует основные CRUD операции с обработкой ошибок
 */
export default class BaseModel<T extends BaseEntity> {
    protected collection: string;
    protected client: typeof pb;

    constructor(collectionName: string, client?: typeof pb) {
        this.collection = collectionName;
        this.client = client || pb;
    }

    /**
     * Создать новый экземпляр модели с аутентифицированным клиентом
     * @param token - PocketBase JWT токен от authWithPassword
     */
    withAuthToken(token: string): this {
        const authenticatedClient = createAuthenticatedPocketBaseClient(token);
        // Создаем новый экземпляр с аутентифицированным клиентом
        const newInstance = new (this.constructor as any)(this.collection, authenticatedClient);
        return newInstance as this;
    }

    /**
     * Получить все записи из коллекции
     */
    async findAll(): Promise<T[]> {
        try {
            return await this.client.collection(this.collection).getFullList();
        } catch (error) {
            console.error(`Error fetching from ${this.collection}:`, error);
            throw new Error(`Failed to fetch ${this.collection}`);
        }
    }

    /**
     * Получить запись по ID
     */
    async findById(id: string): Promise<T> {
        try {
            return await this.client.collection(this.collection).getOne(id);
        } catch (error) {
            console.error(`Error fetching ${id} from ${this.collection}:`, error);
            throw new Error(`Record not found in ${this.collection}`);
        }
    }

    /**
     * Создать новую запись
     * PocketBase автоматически генерирует id и created_at
     */
    async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
        try {
            return await this.client.collection(this.collection).create(data);
        } catch (error) {
            console.error(`Error creating record in ${this.collection}:`, error);
            const err = error as { status?: number; message?: string; response?: { message?: string } };
            const details = err.response?.message || err.message || 'Unknown error';
            throw new Error(`Failed to create record in ${this.collection}: ${details}`);
        }
    }

    /**
     * Обновить запись по ID
     */
    async update(id: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T> {
        try {
            return await this.client.collection(this.collection).update(id, data);
        } catch (error) {
            console.error(`Error updating ${id} in ${this.collection}:`, error);
            throw new Error(`Failed to update record in ${this.collection}`);
        }
    }

    /**
     * Удалить запись по ID
     */
    async delete(id: string): Promise<boolean> {
        try {
            await this.client.collection(this.collection).delete(id);
            return true;
        } catch (error) {
            console.error(`Error deleting ${id} from ${this.collection}:`, error);
            throw new Error(`Failed to delete record from ${this.collection}`);
        }
    }
}