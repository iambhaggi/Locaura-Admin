import { Request, Response } from 'express';
import { StoreService } from '../services/StoreService';
import { Logger } from '../utils/logger';

export class StoreController {
    private store_service = new StoreService();

    // Register a new store for the authenticated user
    register_store = async (req: Request, res: Response) => {
        Logger.info(`User: ${req.user?.id} registering a new store`, 'StoreController');
        
        try {
            const owner_id = req.user?.id;
            
            if (!owner_id) {
                return res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' });
            }

            const store_data = req.body;

            const new_store = await this.store_service.register_store(owner_id, store_data);

            res.status(201).json({
                success: true,
                message: 'Store registered successfully and is pending verification',
                data: {
                    store: new_store
                }
            });
        } catch (error: any) {
            Logger.error(`Store registration error: ${error.message}`, 'StoreController');
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // Get all stores for the authenticated user
    get_my_stores = async (req: Request, res: Response) => {
        try {
            const owner_id = req.user?.id;
            if (!owner_id) {
                return res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' });
            }

            const stores = await this.store_service.get_my_stores(owner_id);

            res.status(200).json({
                success: true,
                data: { stores }
            });
        } catch (error: any) {
            Logger.error(`Get my stores error: ${error.message}`, 'StoreController');
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // Get a specific store by ID
    get_store = async (req: Request, res: Response) => {
        try {
            const store_id = req.params.id as string;
            const store = await this.store_service.get_store_by_id(store_id);

            if (!store) {
                return res.status(404).json({ success: false, message: 'Store not found' });
            }

            res.status(200).json({
                success: true,
                data: { store }
            });
        } catch (error: any) {
            Logger.error(`Get store error: ${error.message}`, 'StoreController');
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // Update a specific store
    update_store = async (req: Request, res: Response) => {
        try {
            const store_id = req.params.id as string;
            const owner_id = req.user?.id;
            const update_data = req.body;

            if (!owner_id) {
                return res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' });
            }

            const updated_store = await this.store_service.update_store(store_id, owner_id, update_data);

            res.status(200).json({
                success: true,
                message: 'Store updated successfully',
                data: { store: updated_store }
            });
        } catch (error: any) {
            Logger.error(`Update store error: ${error.message}`, 'StoreController');
            
            if (error.message.includes('permission')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // Delete a specific store
    delete_store = async (req: Request, res: Response) => {
        try {
            const store_id = req.params.id as string;
            const owner_id = req.user?.id;

            if (!owner_id) {
                return res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' });
            }

            await this.store_service.delete_store(store_id, owner_id);

            res.status(200).json({
                success: true,
                message: 'Store deleted successfully'
            });
        } catch (error: any) {
            Logger.error(`Delete store error: ${error.message}`, 'StoreController');
            
            if (error.message.includes('permission')) {
                return res.status(403).json({ success: false, message: error.message });
            }
            
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
