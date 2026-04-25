import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { Logger } from '../../utils/logger';

export class OrderController {
    private order_service = new OrderService();

    get_my_orders = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const orders = await this.order_service.get_consumer_orders(consumer_id);
            res.status(200).json({ success: true, count: orders.length, data: { orders } });
        } catch (error: any) {
            Logger.error(`Consumer get orders error: ${error.message}`, 'ConsumerOrderController');
            res.status(400).json({ success: false, message: error.message || 'Failed to fetch orders' });
        }
    };

    get_order_details = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            const order_id = req.params.id as string;
            
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const order = await this.order_service.get_order_details(order_id, consumer_id);
            res.status(200).json({ success: true, data: { order } });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to fetch order details' });
        }
    };

    cancel_order = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            const order_id = req.params.id as string;
            
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const order = await this.order_service.cancel_order(order_id, consumer_id);
            res.status(200).json({ success: true, message: 'Order cancelled successfully', data: { order } });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to cancel order' });
        }
    };
}
