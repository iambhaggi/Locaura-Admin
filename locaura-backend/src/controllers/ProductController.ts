import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
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
            const storeId = req.params.storeId as string;
            const productId = req.params.productId as string;
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
            const storeId = req.params.storeId as string;
            const productId = req.params.productId as string;

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
