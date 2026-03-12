import { Request, Response } from 'express';
import { CartService } from '../services/CartService';
import { Logger } from '../../utils/logger';

export class CartController {
    private cart_service = new CartService();

    get_cart = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const cart_data = await this.cart_service.get_cart(consumer_id);
            res.status(200).json({ success: true, data: cart_data });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    add_item = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const { store_id, variant_id, quantity } = req.body;
            await this.cart_service.add_item(consumer_id, store_id, variant_id, quantity);
            
            // Return updated cart directly
            const updated_cart = await this.cart_service.get_cart(consumer_id);
            res.status(200).json({ success: true, message: 'Item added to cart', data: updated_cart });
        } catch (error: any) {
            Logger.error(`Failed to add item to cart: ${error.message}`, 'Cart');
            res.status(400).json({ success: false, message: error.message });
        }
    };

    update_item_quantity = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            const variant_id = req.params.variant_id as string;
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const { quantity } = req.body;
            await this.cart_service.update_item_quantity(consumer_id, variant_id, quantity);
            
            const updated_cart = await this.cart_service.get_cart(consumer_id);
            res.status(200).json({ success: true, message: 'Cart updated', data: updated_cart });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    remove_item = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            const variant_id = req.params.variant_id as string;
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            await this.cart_service.remove_item(consumer_id, variant_id);
            
            const updated_cart = await this.cart_service.get_cart(consumer_id);
            res.status(200).json({ success: true, message: 'Item removed', data: updated_cart });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    clear_cart = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            await this.cart_service.clear_cart(consumer_id);
            res.status(200).json({ success: true, message: 'Cart cleared' });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
