import { StoreRepository } from '../repositories/StoreRepository';
import { IStore } from '../models/Store.model';
import { RetailerStatus } from '../enums/retailer.enum';
import { Logger } from '../utils/logger';

export class StoreService {
    private store_repository = new StoreRepository();

    // Step 1: Register New Store
    // This creates a physical Store linked to an existing Owner
    async register_store(owner_id: string, store_data: Partial<IStore>): Promise<IStore> {
        Logger.info(`Registering new store for owner ${owner_id}`, 'StoreService');

        // Create the physical Store linked to this Owner
        const new_store = await this.store_repository.create({
            owner_id: owner_id as any,
            ...store_data,
            status: RetailerStatus.PENDING // Business starts as pending verification
        });

        return new_store;
    }

    // Get all stores for an owner
    async get_my_stores(owner_id: string): Promise<IStore[]> {
        return await this.store_repository.find_by_owner_id(owner_id);
    }

    // Get a specific store
    async get_store_by_id(store_id: string): Promise<IStore | null> {
        return await this.store_repository.find_by_store_id(store_id);
    }

    // Update a store (with ownership check)
    async update_store(store_id: string, owner_id: string, update_data: Partial<IStore>): Promise<IStore | null> {
        // First verify this user actually owns this store
        const store = await this.store_repository.find_by_id_and_owner(store_id, owner_id);
        if (!store) {
            throw new Error('Store not found or you do not have permission to update it');
        }

        return await this.store_repository.update(store_id, update_data);
    }

    // Delete a store (with ownership check)
    async delete_store(store_id: string, owner_id: string): Promise<boolean> {
        // First verify this user actually owns this store
        const store = await this.store_repository.find_by_id_and_owner(store_id, owner_id);
        if (!store) {
            throw new Error('Store not found or you do not have permission to delete it');
        }

        return await this.store_repository.delete(store_id);
    }
}
