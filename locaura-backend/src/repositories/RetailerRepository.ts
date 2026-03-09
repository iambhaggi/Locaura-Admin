import Retailer, { IRetailer } from '../models/Retailer.model';

export class RetailerRepository {
    async find_by_phone(phone: string): Promise<IRetailer | null> {
        return await Retailer.findOne({ phone });
    }

    async find_by_email(email: string): Promise<IRetailer | null> {
        return await Retailer.findOne({ email });
    }

    async find_by_id(id: string): Promise<IRetailer | null> {
        return await Retailer.findById(id);
    }

    async create(owner_data: Partial<IRetailer>): Promise<IRetailer> {
        const owner = new Retailer(owner_data);
        return await owner.save();
    }

    async update(id: string, update_data: Partial<IRetailer>): Promise<IRetailer | null> {
        return await Retailer.findByIdAndUpdate(id, update_data, { new: true });
    }
}
