import Store from '../../Retailer/models/Store.model';
import Retailer from '../../Retailer/models/Retailer.model';
import { RetailerStatus } from '../../Retailer/enums/retailer.enum';

export class AdminService {
    async get_all_stores(status?: string) {
        let query: any = {};
        if (status) query.status = status;
        return await Store.find(query).populate('retailer_id', 'retailer_name phone email');
    }

    async update_store_status(store_id: string, status: RetailerStatus) {
        const store = await Store.findByIdAndUpdate(store_id, { status }, { new: true });
        
        if (store) {
            // Cascade visibility: If store is active, products could remain draft but they are "available".
            // If store is suspended or inactive, we might want to hide all products.
            // For now, let's keep it simple: store status governs storefront visibility in queries.
            // But we can add a helper to update all product statuses if needed.
            const { Product } = require('../../Retailer/models/Product.model');
            if (status === RetailerStatus.SUSPENDED || status === RetailerStatus.INACTIVE) {
                await Product.updateMany({ store_id }, { status: 'inactive' });
            } else if (status === RetailerStatus.ACTIVE) {
                // We don't necessarily want to make all products active automatically (seller might have drafts)
                // but we could activate previously active ones. For now, we'll leave them as is 
                // because the search/nearby queries already filter by store status.
            }
        }
        
        return store;
    }

    async get_all_retailers() {
        return await Retailer.find({});
    }

    async get_dashboard_stats() {
        const total_stores = await Store.countDocuments({});
        const active_stores = await Store.countDocuments({ status: RetailerStatus.ACTIVE });
        const pending_stores = await Store.countDocuments({ status: RetailerStatus.PENDING });
        const total_retailers = await Retailer.countDocuments({});

        return {
            total_stores,
            active_stores,
            pending_stores,
            total_retailers
        };
    }
}
