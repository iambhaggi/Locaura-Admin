import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { Logger } from '../../utils/logger';
export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    // POST /api/v1/stores/:store_id/products
    public create_product = async (req: Request, res: Response): Promise<void> => {
        try {
            const retailerId = req.user?.id as string; // Assumes auth_middleware is attached
            const storeId = req.params.store_id as string;
            const productData = req.body;
            Logger.info("Product data: ", retailerId);
            const product = await this.productService.create_product(retailerId, storeId, productData);
            res.status(201).json({ success: true, message: 'Product created successfully', data: product });
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                res.status(403).json({ success: false, message: 'You do not have permission to add products to this store' });
            } else {
                res.status(400).json({ success: false, message: error.message || 'Failed to create product' });
            }
        }
    };

    // POST /api/v1/stores/:store_id/products/:product_id/variants
    public create_variant = async (req: Request, res: Response): Promise<void> => {
        try {
            const retailerId = req.user?.id as string;
            const storeId = req.params.store_id as string;
            const productId = req.params.product_id as string; // Parent Product ID
            const variantData = req.body;
            
            Logger.info("Variant data: ", retailerId);
            const variant = await this.productService.create_variant(retailerId, storeId, productId, variantData);
            res.status(201).json({ success: true, message: 'Variant created successfully', data: variant });
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                res.status(403).json({ success: false, message: 'You do not have permission to add variants to this store' });
            } else if (error.message === 'PARENT_PRODUCT_NOT_FOUND_OR_UNAUTHORIZED') {
                res.status(404).json({ success: false, message: 'Parent product not found or does not belong to this store' });
            } else {
                res.status(400).json({ success: false, message: error.message || 'Failed to create variant' });
            }
        }
    };

    // GET /api/v1/stores/:store_id/products/:product_id/variants
    public get_variants_by_product_id = async (req: Request, res: Response): Promise<void> => {
        try {
            const storeId = req.params.store_id as string;
            const productId = req.params.product_id as string;
            
            const variants = await this.productService.get_variants_by_product_id(storeId, productId);
            res.status(200).json({ success: true, message: 'Variants retrieved successfully', data: variants });
        } catch (error: any) {
             if (error.message === 'PARENT_PRODUCT_NOT_FOUND_OR_UNAUTHORIZED') {
                res.status(404).json({ success: false, message: 'Parent product not found or does not belong to this store' });
            } else {
                res.status(400).json({ success: false, message: error.message || 'Failed to retrieve variants' });
            }
        }
    };

    // GET /api/v1/stores/:store_id/products/:product_id/variants/:variant_id
    public get_variant_by_id = async (req: Request, res: Response): Promise<void> => {
        try {
            const storeId = req.params.store_id as string;
            const variantId = req.params.variant_id as string;
            
            const variant = await this.productService.get_variant_by_id(storeId, variantId);
            res.status(200).json({ success: true, message: 'Variant retrieved successfully', data: variant });
        } catch (error: any) {
            if (error.message === 'VARIANT_NOT_FOUND_OR_UNAUTHORIZED') {
                res.status(404).json({ success: false, message: 'Variant not found or does not belong to this store' });
            } else {
                res.status(400).json({ success: false, message: error.message || 'Failed to retrieve variant' });
            }
        }
    };

    // PUT /api/v1/stores/:store_id/products/:product_id/variants/:variant_id
    public update_variant = async (req: Request, res: Response): Promise<void> => {
        try {
            const retailerId = req.user?.id as string;
            const storeId = req.params.store_id as string;
            const variantId = req.params.variant_id as string;
            const updateData = req.body;

            const variant = await this.productService.update_variant(retailerId, storeId, variantId, updateData);
            res.status(200).json({ success: true, message: 'Variant updated successfully', data: variant });
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                res.status(403).json({ success: false, message: 'You do not have permission to modify this store' });
            } else if (error.message === 'VARIANT_NOT_FOUND') {
                 res.status(404).json({ success: false, message: 'Variant not found or does not belong to this store' });
            } else {
                res.status(400).json({ success: false, message: error.message || 'Failed to update variant' });
            }
        }
    };

    // DELETE /api/v1/stores/:store_id/products/:product_id/variants/:variant_id
    public delete_variant = async (req: Request, res: Response): Promise<void> => {
        try {
            const retailerId = req.user?.id as string;
            const storeId = req.params.store_id as string;
            const variantId = req.params.variant_id as string;

            await this.productService.delete_variant(retailerId, storeId, variantId);
            res.status(200).json({ success: true, message: 'Variant deleted successfully' });
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                res.status(403).json({ success: false, message: 'You do not have permission to modify this store' });
            } else if (error.message === 'VARIANT_NOT_FOUND') {
                 res.status(404).json({ success: false, message: 'Variant not found or does not belong to this store' });
            } else {
                res.status(400).json({ success: false, message: error.message || 'Failed to delete variant' });
            }
        }
    };

    // GET /api/v1/stores/:store_id/products
    public get_products_by_store_id = async (req: Request, res: Response): Promise<void> => {
        try {
            const storeId = req.params.store_id as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const search = req.query.search as string;
            
            let result;
            if (search) {
                const products = await this.productService.search_store_products(storeId, search);
                result = { products, total: products.length };
            } else {
                // To DO: Extract other filters from req.query if needed (e.g. status, category_id)
                const filters = { ...req.query };
                delete filters.page;
                delete filters.limit;
                delete filters.search;
                
                result = await this.productService.get_products_by_store_id(storeId, filters, page, limit);
            }
            res.status(200).json({ success: true, message: 'Products retrieved successfully', data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to retrieve products' });
        }
    };

    // GET /api/v1/stores/:store_id/products/:product_id
    public get_product_by_id = async (req: Request, res: Response): Promise<void> => {
        try {
            const productId = req.params.product_id as string;
            const product = await this.productService.get_product_by_id(productId);
            res.status(200).json({ success: true, message: 'Product retrieved successfully', data: product });
        } catch (error: any) {
             if (error.message === 'PRODUCT_NOT_FOUND') {
                res.status(404).json({ success: false, message: 'Product not found' });
            } else {
                res.status(400).json({ success: false, message: error.message || 'Failed to retrieve product' });
            }
        }
    };

    // PUT /api/v1/stores/:storeId/products/:productId
    public update_product = async (req: Request, res: Response): Promise<void> => {
        try {
            const retailerId = req.user?.id as string;
            const storeId = req.params.store_id as string;
            const productId = req.params.product_id as string;
            const updateData = req.body;

            const product = await this.productService.update_product(retailerId, storeId, productId, updateData);
            res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                res.status(403).json({ success: false, message: 'You do not have permission to modify this store' });
            } else if (error.message === 'PRODUCT_NOT_FOUND') {
                 res.status(404).json({ success: false, message: 'Product not found or does not belong to this store' });
            } else {
                res.status(400).json({ success: false, message: error.message || 'Failed to update product' });
            }
        }
    };

    // DELETE /api/v1/stores/:storeId/products/:productId
    public delete_product = async (req: Request, res: Response): Promise<void> => {
        try {
            const retailerId = req.user?.id as string;
            const storeId = req.params.store_id as string;
            const productId = req.params.product_id as string;

            await this.productService.delete_product(retailerId, storeId, productId);
            res.status(200).json({ success: true, message: 'Product deleted successfully' });
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                res.status(403).json({ success: false, message: 'You do not have permission to modify this store' });
            } else if (error.message === 'PRODUCT_NOT_FOUND') {
                 res.status(404).json({ success: false, message: 'Product not found or does not belong to this store' });
            } else {
                res.status(400).json({ success: false, message: error.message || 'Failed to delete product' });
            }
        }
    };
}
