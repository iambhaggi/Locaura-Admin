import { StoreRepository } from '../repositories/StoreRepository';
import { IStore } from '../models/Store.model';
import { RetailerStatus } from '../enums/retailer.enum';
import { Logger } from '../../utils/logger';

export class StoreService {
    private store_repository = new StoreRepository();

    // Step 1: Register New Store
    // This creates a physical Store linked to an existing Retailer
    async register_store(retailer_id: string, store_data: Partial<IStore>): Promise<IStore> {
        Logger.info(`Registering new store for retailer ${retailer_id}`, 'StoreService');

        // Create the physical Store linked to this Retailer
        const new_store = await this.store_repository.create({
            retailer_id: retailer_id as any,
            ...store_data,
            status: RetailerStatus.PENDING // Business starts as pending verification
        });

        return new_store;
    }

    // Get all stores for an retailer
    async get_my_stores(retailer_id: string): Promise<IStore[]> {
        return await this.store_repository.find_by_retailer_id(retailer_id);
    }

    // Get a specific store
    async get_store_by_id(store_id: string): Promise<IStore | null> {
        return await this.store_repository.find_by_store_id(store_id);
    }

    // Update a store (with ownership check)
    async update_store(store_id: string, retailer_id: string, update_data: Partial<IStore>): Promise<IStore | null> {
        // First verify this user actually owns this store
        const store = await this.store_repository.find_by_id_and_retailer(store_id, retailer_id);
        if (!store) {
            throw new Error('Store not found or you do not have permission to update it');
        }

        return await this.store_repository.update(store_id, update_data);
    }

    // Delete a store (with ownership check)
    async delete_store(store_id: string, retailer_id: string): Promise<boolean> {
        // First verify this user actually owns this store
        const store = await this.store_repository.find_by_id_and_retailer(store_id, retailer_id);
        if (!store) {
            throw new Error('Store not found or you do not have permission to delete it');
        }

        return await this.store_repository.delete(store_id);
    }
}
