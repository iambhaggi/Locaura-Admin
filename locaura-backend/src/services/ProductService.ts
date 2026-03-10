import { ProductRepository } from '../repositories/ProductRepository';
import { StoreRepository } from '../repositories/StoreRepository';
import { IProduct } from '../models/Product.model';

export class ProductService {
    private productRepository: ProductRepository;
    private storeRepository: StoreRepository;

    constructor() {
        this.productRepository = new ProductRepository();
        this.storeRepository = new StoreRepository(); // Ensures the store exists and belongs to the retailer
    }

    async create_product(ownerId: string, storeId: string, productData: Partial<IProduct>): Promise<IProduct> {
        // 1. Verify the store exists
        const store = await this.storeRepository.find_by_id_and_owner(storeId, ownerId);
        if (!store) {
            throw new Error('UNAUTHORIZED_STORE_ACCESS');
        }

        // 2. Add the verified storeId
        productData.store_id = store._id;
        
        // 3. Optional: Calculate discount percentages, validate attributes, etc
        if (productData.price && productData.discount_price && productData.discount_price < productData.price) {
            productData.discount_percentage = Math.round(((productData.price - productData.discount_price) / productData.price) * 100);
        }

        return await this.productRepository.create_product(productData);
    }

    async get_products_by_store_id(storeId: string, query: any = {}, page: number = 1, limit: number = 20) {
        return await this.productRepository.get_products_by_store_id(storeId, query, page, limit);
    }

    async get_product_by_id(productId: string): Promise<IProduct> {
        const product = await this.productRepository.get_product_by_id(productId);
        if (!product) throw new Error('PRODUCT_NOT_FOUND');
        return product;
    }

    async update_product(ownerId: string, storeId: string, productId: string, updateData: Partial<IProduct>) {
        // 1. Verify ownership of the store
        const store = await this.storeRepository.find_by_id_and_owner(storeId, ownerId);
        if (!store) {
            throw new Error('UNAUTHORIZED_STORE_ACCESS');
        }

        // 2. Perform update
        const updated = await this.productRepository.update_product(productId, storeId, updateData);
        if (!updated) throw new Error('PRODUCT_NOT_FOUND');
        return updated;
    }

    async delete_product(ownerId: string, storeId: string, productId: string) {
        // 1. Verify ownership
        const store = await this.storeRepository.find_by_id_and_owner(storeId, ownerId);
        if (!store) {
            throw new Error('UNAUTHORIZED_STORE_ACCESS');
        }

        const deleted = await this.productRepository.delete_product(productId, storeId);
        if (!deleted) throw new Error('PRODUCT_NOT_FOUND');
        return deleted;
    }

    async search_store_products(storeId: string, searchTerm: string) {
        return await this.productRepository.search_store_products(storeId, searchTerm);
    }
}
