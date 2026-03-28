import { Request, Response } from 'express';
import { DeliveryService } from '../services/DeliveryService';
import { Logger } from '../../utils/logger';

export class DeliveryController {
    private delivery_service = new DeliveryService();

    get_available_orders = async (req: Request, res: Response) => {
        try {
            const rider_id = req.user?.id;
            const { lat, lng } = req.query;
            
            if (!rider_id) return res.status(401).json({ success: false, message: 'Unauthorized' });
            if (!lat || !lng) return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });

            const orders = await this.delivery_service.get_available_orders(
                rider_id, 
                parseFloat(lat as string), 
                parseFloat(lng as string)
            );
            
            res.status(200).json({ success: true, count: orders.length, data: { orders } });
        } catch (error: any) {
            Logger.error(`Rider get available orders error: ${error.message}`, 'DeliveryController');
            res.status(500).json({ success: false, message: error.message || 'Failed to fetch available orders' });
        }
    };
    
    accept_order = async (req: Request, res: Response) => {
        try {
            const rider_id = req.user?.id;
            const order_id = req.params.id as string;
            
            if (!rider_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const order = await this.delivery_service.accept_order(rider_id, order_id);
            res.status(200).json({ success: true, message: 'Order accepted successfully', data: { order } });
        } catch (error: any) {
            Logger.error(`Rider accept order error: ${error.message}`, 'DeliveryController');
            res.status(400).json({ success: false, message: error.message || 'Failed to accept order' });
        }
    };

    pickup_order = async (req: Request, res: Response) => {
        try {
            const rider_id = req.user?.id;
            const order_id = req.params.id as string;
            
            if (!rider_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const order = await this.delivery_service.pickup_order(rider_id, order_id);
            res.status(200).json({ success: true, message: 'Order picked up successfully', data: { order } });
        } catch (error: any) {
            Logger.error(`Rider pickup order error: ${error.message}`, 'DeliveryController');
            res.status(400).json({ success: false, message: error.message || 'Failed to pick up order' });
        }
    };

    mark_delivered = async (req: Request, res: Response) => {
        try {
            const rider_id = req.user?.id;
            const order_id = req.params.id as string;
            
            if (!rider_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const order = await this.delivery_service.mark_delivered(rider_id, order_id);
            res.status(200).json({ success: true, message: 'Order marked as delivered', data: { order } });
        } catch (error: any) {
            Logger.error(`Rider mark delivered error: ${error.message}`, 'DeliveryController');
            res.status(400).json({ success: false, message: error.message || 'Failed to deliver order' });
        }
    };
}
