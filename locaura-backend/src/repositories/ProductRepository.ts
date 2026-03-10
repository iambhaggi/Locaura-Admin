import { Model } from 'mongoose';
import Product, { IProduct } from '../models/Product.model';
import mongoose from 'mongoose';

export class ProductRepository {
    private model: Model<IProduct>;

    constructor() {
        this.model = Product;
    }

    async create_product(productData: Partial<IProduct>): Promise<IProduct> {
        return await this.model.create(productData);
    }

    async get_product_by_id(productId: string): Promise<IProduct | null> {
        return await this.model.findById(productId);
    }

    async get_products_by_store_id(
        storeId: string, 
        query: any = {}, 
        page: number = 1, 
        limit: number = 20
    ): Promise<{ products: IProduct[], total: number }> {
        const filter = { store_id: new mongoose.Types.ObjectId(storeId), ...query };
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            this.model.find(filter)
                .populate('category_id', 'name') // Optional: populate category details instead of just ID
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.model.countDocuments(filter)
        ]);

        return { products, total };
    }

    async update_product(productId: string, storeId: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
        // We require storeId in the query to ensure a retailer can only update their own store's products
        return await this.model.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(productId), store_id: new mongoose.Types.ObjectId(storeId) },
            { $set: updateData },
            { new: true, runValidators: true }
        );
    }

    async delete_product(productId: string, storeId: string): Promise<boolean> {
        const result = await this.model.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(productId),
            store_id: new mongoose.Types.ObjectId(storeId)
        });
        return result !== null;
    }

    async search_store_products(storeId: string, searchTerm: string): Promise<IProduct[]> {
        return await this.model.find(
            { 
                store_id: new mongoose.Types.ObjectId(storeId),
                $text: { $search: searchTerm } 
            },
            { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } });
    }
}
