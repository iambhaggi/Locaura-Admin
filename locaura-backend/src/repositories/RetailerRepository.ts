import Retailer, { IRetailer } from '../models/Retailer.model';

export class RetailerRepository {
    async findByPhone(phone: string): Promise<IRetailer | null> {
        return await Retailer.findOne({ phone });
    }

    async findByEmail(email: string): Promise<IRetailer | null> {
        return await Retailer.findOne({ email });
    }

    async findById(id: string): Promise<IRetailer | null> {
        return await Retailer.findById(id);
    }

    async create(retailerData: Partial<IRetailer>): Promise<IRetailer> {
        const retailer = new Retailer(retailerData);
        return await retailer.save();
    }

    async update(id: string, updateData: Partial<IRetailer>): Promise<IRetailer | null> {
        return await Retailer.findByIdAndUpdate(id, updateData, { new: true });
    }
}
