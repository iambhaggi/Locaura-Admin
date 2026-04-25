import { Request, Response } from 'express';
import { CheckoutService } from '../services/CheckoutService';
import { Logger } from '../../utils/logger';

export class CheckoutController {
    private checkout_service = new CheckoutService();

    process_checkout = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            if (!consumer_id) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const result = await this.checkout_service.process_checkout(consumer_id, req.body);
            
            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: result
            });
        } catch (error: any) {
            Logger.error(`Checkout processing failed for consumer ${req.user?.id}`, error);
            res.status(400).json({ success: false, message: error.message || 'Checkout failed' });
        }
    };
}
