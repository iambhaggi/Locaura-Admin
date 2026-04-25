import { Request, Response } from 'express';
import { StoreService } from '../services/StoreService';
import { Logger } from '../../utils/logger';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';

export class StoreController {
    private store_service = new StoreService();

    // Register a new store for the authenticated user
    register_store = asyncHandler(async (req: Request, res: Response) => {
        Logger.info(`User: ${req.user?.id} registering a new store`, 'StoreController');
        
        const retailer_id = req.user?.id;
        if (!retailer_id) {
            throw new ApiError(401, 'Unauthorized: User ID missing');
        }

        const store_data = req.body;
        const new_store = await this.store_service.register_store(retailer_id, store_data);

        return res
            .status(201)
            .json(new ApiResponse(201, { store: new_store }, 'Store registered successfully and is pending verification'));
    });

    // Get all stores for the authenticated user
    get_my_stores = asyncHandler(async (req: Request, res: Response) => {
        const retailer_id = req.user?.id;
        if (!retailer_id) {
            throw new ApiError(401, 'Unauthorized: User ID missing');
        }

        const stores = await this.store_service.get_my_stores(retailer_id);

        return res
            .status(200)
            .json(new ApiResponse(200, { count: stores.length, stores }, 'Stores fetched successfully'));
    });

    // Get a specific store by ID
    get_store = asyncHandler(async (req: Request, res: Response) => {
        const store_id = req.params.id as string;
        const store = await this.store_service.get_store_by_id(store_id);

        if (!store) {
            throw new ApiError(404, 'Store not found');
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { store }, 'Store fetched successfully'));
    });

    // Update a specific store
    update_store = asyncHandler(async (req: Request, res: Response) => {
        const store_id = req.params.id as string;
        const retailer_id = req.user?.id;
        const update_data = req.body;

        if (!retailer_id) {
            throw new ApiError(401, 'Unauthorized: User ID missing');
        }

        const updated_store = await this.store_service.update_store(store_id, retailer_id, update_data);

        return res
            .status(200)
            .json(new ApiResponse(200, { store: updated_store }, 'Store updated successfully'));
    });

    // Delete a specific store
    delete_store = asyncHandler(async (req: Request, res: Response) => {
        const store_id = req.params.id as string;
        const retailer_id = req.user?.id;

        if (!retailer_id) {
            throw new ApiError(401, 'Unauthorized: User ID missing');
        }

        await this.store_service.delete_store(store_id, retailer_id);

        return res
            .status(200)
            .json(new ApiResponse(200, null, 'Store deleted successfully'));
    });
}
