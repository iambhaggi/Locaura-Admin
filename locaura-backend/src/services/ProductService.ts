import { ProductRepository } from '../repositories/ProductRepository';
import { StoreRepository } from '../repositories/StoreRepository';
import { IProduct, IChildProduct } from '../models/Product.model';

export class ProductService {
    private productRepository: ProductRepository;
    private storeRepository: StoreRepository;

    constructor() {
        this.productRepository = new ProductRepository();
        this.storeRepository = new StoreRepository(); // Ensures the store exists and belongs to the retailer
    }

    async create_product(retailerId: string, storeId: string, productData: Partial<IProduct>): Promise<IProduct> {
        // 1. Verify the store exists
        const store = await this.storeRepository.find_by_id_and_retailer(storeId, retailerId);
        if (!store) {
            throw new Error('UNAUTHORIZED_STORE_ACCESS');
        }

        // 2. Add the verified storeId and retailerId
        productData.store_id = store._id;
        productData.retailer_id = store.retailer_id;
        
        // 3. Optional: Map old fields if needed or handle logic for new schema
        // Left blank because target fields (price -> base_price) have changed.

        return await this.productRepository.create_product(productData);
    }

    async create_variant(retailerId: string, storeId: string, parentId: string, variantData: Partial<IChildProduct>): Promise<IChildProduct> {
        // 1. Verify ownership of the store
        const store = await this.storeRepository.find_by_id_and_retailer(storeId, retailerId);
        if (!store) {
            throw new Error('UNAUTHORIZED_STORE_ACCESS');
        }

        // 2. Verify parent product exists and belongs to this store
        const parentProduct = await this.productRepository.get_product_by_id(parentId);
        if (!parentProduct || parentProduct.store_id.toString() !== storeId) {
            throw new Error('PARENT_PRODUCT_NOT_FOUND_OR_UNAUTHORIZED');
        }

        // 3. Set associated IDs
        variantData.parent_id = parentProduct._id;
        variantData.store_id = store._id;
        variantData.retailer_id = store.retailer_id;
        
        // Inherit categories from parent if they exist
        if (parentProduct.categories && parentProduct.categories.length > 0) {
            variantData.categories = parentProduct.categories;
        }

        return await this.productRepository.create_variant(variantData);
    }

    async get_variants_by_product_id(storeId: string, productId: string) {
        // Verification to ensure the storeId maps correctly down the tree
        const parentProduct = await this.productRepository.get_product_by_id(productId);
        if (!parentProduct || parentProduct.store_id.toString() !== storeId) {
            throw new Error('PARENT_PRODUCT_NOT_FOUND_OR_UNAUTHORIZED');
        }
        return await this.productRepository.get_variants_by_product_id(productId);
    }

    async get_variant_by_id(storeId: string, variantId: string): Promise<IChildProduct> {
        const variant = await this.productRepository.get_variant_by_id(variantId);
        if (!variant || variant.store_id.toString() !== storeId) {
            throw new Error('VARIANT_NOT_FOUND_OR_UNAUTHORIZED');
        }
        return variant;
    }

    async update_variant(retailerId: string, storeId: string, variantId: string, updateData: Partial<IChildProduct>) {
        // 1. Verify ownership of the store
        const store = await this.storeRepository.find_by_id_and_retailer(storeId, retailerId);
        if (!store) {
            throw new Error('UNAUTHORIZED_STORE_ACCESS');
        }

        const updated = await this.productRepository.update_variant(variantId, storeId, updateData);
        if (!updated) throw new Error('VARIANT_NOT_FOUND');
        return updated;
    }

    async delete_variant(retailerId: string, storeId: string, variantId: string) {
        // 1. Verify ownership of the store
        const store = await this.storeRepository.find_by_id_and_retailer(storeId, retailerId);
        if (!store) {
            throw new Error('UNAUTHORIZED_STORE_ACCESS');
        }

        const deleted = await this.productRepository.delete_variant(variantId, storeId);
        if (!deleted) throw new Error('VARIANT_NOT_FOUND');
        return deleted;
    }

    async get_products_by_store_id(storeId: string, query: any = {}, page: number = 1, limit: number = 20) {
        return await this.productRepository.get_products_by_store_id(storeId, query, page, limit);
    }

    async get_product_by_id(productId: string): Promise<IProduct> {
        const product = await this.productRepository.get_product_by_id(productId);
        if (!product) throw new Error('PRODUCT_NOT_FOUND');
        return product;
    }

    async update_product(retailerId: string, storeId: string, productId: string, updateData: Partial<IProduct>) {
        // 1. Verify ownership of the store
        const store = await this.storeRepository.find_by_id_and_retailer(storeId, retailerId);
        if (!store) {
            throw new Error('UNAUTHORIZED_STORE_ACCESS');
        }

        // 2. Perform update
        const updated = await this.productRepository.update_product(productId, storeId, updateData);
        if (!updated) throw new Error('PRODUCT_NOT_FOUND');
        return updated;
    }

    async delete_product(retailerId: string, storeId: string, productId: string) {
        // 1. Verify ownership
        const store = await this.storeRepository.find_by_id_and_retailer(storeId, retailerId);
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
