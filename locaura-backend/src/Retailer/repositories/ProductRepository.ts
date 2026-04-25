import { Model } from 'mongoose';
import { Product as Product, ChildProduct, IProduct, IChildProduct } from '../models/Product.model';
import mongoose from 'mongoose';

export class ProductRepository {
    private model: Model<IProduct>;
    private childModel: Model<IChildProduct>;

    constructor() {
        this.model = Product;
        this.childModel = ChildProduct;
    }

    async create_product(productData: Partial<IProduct>): Promise<IProduct> {
        return await this.model.create(productData);
    }

    async create_variant(variantData: Partial<IChildProduct>): Promise<IChildProduct> {
        return await this.childModel.create(variantData);
    }

    async get_variants_by_product_id(productId: string): Promise<IChildProduct[]> {
        return await this.childModel.find({ parent_id: new mongoose.Types.ObjectId(productId) })
                                    .sort({ createdAt: -1 });
    }

    async get_variant_by_id(variantId: string): Promise<IChildProduct | null> {
        return await this.childModel.findById(variantId);
    }

    async update_variant(variantId: string, storeId: string, updateData: Partial<IChildProduct>): Promise<IChildProduct | null> {
        return await this.childModel.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(variantId), store_id: new mongoose.Types.ObjectId(storeId) },
            { $set: updateData },
            { new: true, runValidators: true }
        );
    }

    async delete_variant(variantId: string, storeId: string): Promise<boolean> {
        const result = await this.childModel.findOneAndDelete({
            _id: new mongoose.Types.ObjectId(variantId),
            store_id: new mongoose.Types.ObjectId(storeId)
        });
        return result !== null;
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
                .populate('categories', 'name') // Optional: populate category details instead of just ID
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
