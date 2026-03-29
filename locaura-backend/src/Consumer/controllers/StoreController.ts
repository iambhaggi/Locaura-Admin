import { Request, Response } from 'express';
import { StoreService } from '../services/StoreService';
import { Logger } from '../../utils/logger';

export class StoreController {
    private store_service = new StoreService();

    get_nearby_stores = async (req: Request, res: Response) => {
        try {
            const { lat, lng, radius_km, category } = req.query;
            
            if (!lat || !lng) {
                return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
            }

            const stores = await this.store_service.get_nearby_stores(
                parseFloat(lat as string),
                parseFloat(lng as string),
                radius_km ? parseFloat(radius_km as string) : 10,
                category as string
            );
            
            res.status(200).json({ success: true, count: stores.length, data: { stores } });
        } catch (error: any) {
            Logger.error(`Consumer get nearby stores error: ${error.message}`, 'ConsumerStoreController');
            res.status(500).json({ success: false, message: 'Failed to fetch nearby stores' });
        }
    };

    get_store_details = async (req: Request, res: Response) => {
        try {
            const store_id = req.params.id as string;
            
            const store = await this.store_service.get_store_details(store_id);
            res.status(200).json({ success: true, data: { store } });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || 'Store not found' });
        }
    };

    get_store_products = async (req: Request, res: Response) => {
        try {
            const store_id = req.params.id as string;
            const category = req.query.category as string;
            
            const products = await this.store_service.get_store_products(store_id, category);
            res.status(200).json({ success: true, count: products.length, data: { products } });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Failed to fetch store products' });
        }
    };

    get_product_details = async (req: Request, res: Response) => {
        try {
            const product_id = req.params.id as string;
            const product = await this.store_service.get_product_details(product_id);
            res.status(200).json({ success: true, data: { product } });
        } catch (error: any) {
            res.status(404).json({ success: false, message: error.message || 'Product not found' });
        }
    };
}
