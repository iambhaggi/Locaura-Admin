import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { Logger } from '../../utils/logger';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';

export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    // POST /api/v1/stores/:store_id/products
    public create_product = asyncHandler(async (req: Request, res: Response) => {
        const retailerId = req.user?.id as string;
        const storeId = req.params.store_id as string;
        const productData = req.body;
        
        Logger.info("Product data: ", retailerId);
        
        try {
            const product = await this.productService.create_product(retailerId, storeId, productData);
            return res
                .status(201)
                .json(new ApiResponse(201, product, 'Product created successfully'));
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                throw new ApiError(403, 'You do not have permission to add products to this store');
            }
            throw new ApiError(400, error.message || 'Failed to create product');
        }
    });

    // POST /api/v1/stores/:store_id/products/:product_id/variants
    public create_variant = asyncHandler(async (req: Request, res: Response) => {
        const retailerId = req.user?.id as string;
        const storeId = req.params.store_id as string;
        const productId = req.params.product_id as string;
        const variantData = req.body;
        
        Logger.info("Variant data: ", retailerId);
        
        try {
            const variant = await this.productService.create_variant(retailerId, storeId, productId, variantData);
            return res
                .status(201)
                .json(new ApiResponse(201, variant, 'Variant created successfully'));
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                throw new ApiError(403, 'You do not have permission to add variants to this store');
            } else if (error.message === 'PARENT_PRODUCT_NOT_FOUND_OR_UNAUTHORIZED') {
                throw new ApiError(404, 'Parent product not found or does not belong to this store');
            }
            throw new ApiError(400, error.message || 'Failed to create variant');
        }
    });

    // GET /api/v1/stores/:store_id/products/:product_id/variants
    public get_variants_by_product_id = asyncHandler(async (req: Request, res: Response) => {
        const storeId = req.params.store_id as string;
        const productId = req.params.product_id as string;
        
        try {
            const variants = await this.productService.get_variants_by_product_id(storeId, productId);
            return res
                .status(200)
                .json(new ApiResponse(200, variants, 'Variants retrieved successfully'));
        } catch (error: any) {
             if (error.message === 'PARENT_PRODUCT_NOT_FOUND_OR_UNAUTHORIZED') {
                throw new ApiError(404, 'Parent product not found or does not belong to this store');
            }
            throw new ApiError(400, error.message || 'Failed to retrieve variants');
        }
    });

    // GET /api/v1/stores/:store_id/products/:product_id/variants/:variant_id
    public get_variant_by_id = asyncHandler(async (req: Request, res: Response) => {
        const storeId = req.params.store_id as string;
        const variantId = req.params.variant_id as string;
        
        try {
            const variant = await this.productService.get_variant_by_id(storeId, variantId);
            return res
                .status(200)
                .json(new ApiResponse(200, variant, 'Variant retrieved successfully'));
        } catch (error: any) {
            if (error.message === 'VARIANT_NOT_FOUND_OR_UNAUTHORIZED') {
                throw new ApiError(404, 'Variant not found or does not belong to this store');
            }
            throw new ApiError(400, error.message || 'Failed to retrieve variant');
        }
    });

    // PUT /api/v1/stores/:store_id/products/:product_id/variants/:variant_id
    public update_variant = asyncHandler(async (req: Request, res: Response) => {
        const retailerId = req.user?.id as string;
        const storeId = req.params.store_id as string;
        const variantId = req.params.variant_id as string;
        const updateData = req.body;

        try {
            const variant = await this.productService.update_variant(retailerId, storeId, variantId, updateData);
            return res
                .status(200)
                .json(new ApiResponse(200, variant, 'Variant updated successfully'));
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                throw new ApiError(403, 'You do not have permission to modify this store');
            } else if (error.message === 'VARIANT_NOT_FOUND') {
                throw new ApiError(404, 'Variant not found or does not belong to this store');
            }
            throw new ApiError(400, error.message || 'Failed to update variant');
        }
    });

    // DELETE /api/v1/stores/:store_id/products/:product_id/variants/:variant_id
    public delete_variant = asyncHandler(async (req: Request, res: Response) => {
        const retailerId = req.user?.id as string;
        const storeId = req.params.store_id as string;
        const variantId = req.params.variant_id as string;

        try {
            await this.productService.delete_variant(retailerId, storeId, variantId);
            return res
                .status(200)
                .json(new ApiResponse(200, null, 'Variant deleted successfully'));
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                throw new ApiError(403, 'You do not have permission to modify this store');
            } else if (error.message === 'VARIANT_NOT_FOUND') {
                throw new ApiError(404, 'Variant not found or does not belong to this store');
            }
            throw new ApiError(400, error.message || 'Failed to delete variant');
        }
    });

    // GET /api/v1/stores/:store_id/products
    public get_products_by_store_id = asyncHandler(async (req: Request, res: Response) => {
        const storeId = req.params.store_id as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;
        
        let result;
        if (search) {
            const products = await this.productService.search_store_products(storeId, search);
            result = { products, total: products.length };
        } else {
            const filters = { ...req.query };
            delete filters.page;
            delete filters.limit;
            delete filters.search;
            
            result = await this.productService.get_products_by_store_id(storeId, filters, page, limit);
        }
        return res
            .status(200)
            .json(new ApiResponse(200, result, 'Products retrieved successfully'));
    });

    // GET /api/v1/stores/:store_id/products/:product_id
    public get_product_by_id = asyncHandler(async (req: Request, res: Response) => {
        const productId = req.params.product_id as string;
        
        try {
            const product = await this.productService.get_product_by_id(productId);
            return res
                .status(200)
                .json(new ApiResponse(200, product, 'Product retrieved successfully'));
        } catch (error: any) {
             if (error.message === 'PRODUCT_NOT_FOUND') {
                throw new ApiError(404, 'Product not found');
            }
            throw new ApiError(400, error.message || 'Failed to retrieve product');
        }
    });

    // PUT /api/v1/stores/:storeId/products/:productId
    public update_product = asyncHandler(async (req: Request, res: Response) => {
        const retailerId = req.user?.id as string;
        const storeId = req.params.store_id as string;
        const productId = req.params.product_id as string;
        const updateData = req.body;

        try {
            const product = await this.productService.update_product(retailerId, storeId, productId, updateData);
            return res
                .status(200)
                .json(new ApiResponse(200, product, 'Product updated successfully'));
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                throw new ApiError(403, 'You do not have permission to modify this store');
            } else if (error.message === 'PRODUCT_NOT_FOUND') {
                throw new ApiError(404, 'Product not found or does not belong to this store');
            }
            throw new ApiError(400, error.message || 'Failed to update product');
        }
    });

    // DELETE /api/v1/stores/:storeId/products/:productId
    public delete_product = asyncHandler(async (req: Request, res: Response) => {
        const retailerId = req.user?.id as string;
        const storeId = req.params.store_id as string;
        const productId = req.params.product_id as string;

        try {
            await this.productService.delete_product(retailerId, storeId, productId);
            return res
                .status(200)
                .json(new ApiResponse(200, null, 'Product deleted successfully'));
        } catch (error: any) {
            if (error.message === 'UNAUTHORIZED_STORE_ACCESS') {
                throw new ApiError(403, 'You do not have permission to modify this store');
            } else if (error.message === 'PRODUCT_NOT_FOUND') {
                throw new ApiError(404, 'Product not found or does not belong to this store');
            }
            throw new ApiError(400, error.message || 'Failed to delete product');
        }
    });
}
