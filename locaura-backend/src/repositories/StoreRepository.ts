import Store, { IStore } from '../models/Store.model';

export class StoreRepository {
    async find_by_retailer_id(retailer_id: string): Promise<IStore[]> {
        return await Store.find({ retailer_id });
    }

    async find_by_store_id(store_id: string): Promise<IStore | null> {
        return await Store.findById(store_id);
    }

    async create(store_data: Partial<IStore>): Promise<IStore> {
        const store = new Store(store_data);
        return await store.save();
    }

    async update(store_id: string, update_data: Partial<IStore>): Promise<IStore | null> {
        return await Store.findByIdAndUpdate(store_id, update_data, { new: true });
    }

    async find_by_id_and_retailer(store_id: string, retailer_id: string): Promise<IStore | null> {
        return await Store.findOne({ _id: store_id, retailer_id });
    }

    async delete(store_id: string): Promise<boolean> {
        const result = await Store.findByIdAndDelete(store_id);
        return !!result;
    }
}
