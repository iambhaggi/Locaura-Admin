import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { Logger } from '../../utils/logger';

export class OrderController {
    private order_service = new OrderService();

    get_store_orders = async (req: Request, res: Response) => {
        try {
            const retailer_id = req.user?.id;
            const store_id = req.query.store_id as string;
            
            if (!retailer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });
            if (!store_id) return res.status(400).json({ success: false, message: 'store_id query param is required' });

            const orders = await this.order_service.get_store_orders(store_id, retailer_id);
            res.status(200).json({ success: true, count: orders.length, data: { orders } });
        } catch (error: any) {
            Logger.error(`Retailer get orders error: ${error.message}`, 'OrderController');
            res.status(400).json({ success: false, message: error.message || 'Failed to fetch orders' });
        }
    };

    get_order_details = async (req: Request, res: Response) => {
        try {
            const retailer_id = req.user?.id;
            const order_id = req.params.id as string;
            
            if (!retailer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const order = await this.order_service.get_order_details(order_id, retailer_id);
            res.status(200).json({ success: true, data: { order } });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to fetch order details' });
        }
    };

    accept_order = async (req: Request, res: Response) => {
        try {
            const retailer_id = req.user?.id;
            const order_id = req.params.id as string;
            
            if (!retailer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const order = await this.order_service.accept_order(order_id, retailer_id);
            res.status(200).json({ success: true, message: 'Order accepted', data: { order } });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to accept order' });
        }
    };

    pack_order = async (req: Request, res: Response) => {
        try {
            const retailer_id = req.user?.id;
            const order_id = req.params.id as string;
            
            if (!retailer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const order = await this.order_service.pack_order(order_id, retailer_id);
            res.status(200).json({ success: true, message: 'Order packed', data: { order } });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to pack order' });
        }
    };

    cancel_order = async (req: Request, res: Response) => {
        try {
            const retailer_id = req.user?.id;
            const order_id = req.params.id as string;
            const { reason } = req.body;
            
            if (!retailer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const order = await this.order_service.cancel_order(order_id, retailer_id, reason || 'Cancelled by store');
            res.status(200).json({ success: true, message: 'Order cancelled', data: { order } });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message || 'Failed to cancel order' });
        }
    };
}
