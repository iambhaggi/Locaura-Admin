import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { auth_middleware } from '../middlewares/auth_middleware';

const router = Router();
const order_controller = new OrderController();

// PROTECTED ROUTES (Require Authentication)
router.use(auth_middleware);

// /api/v1/retailers/orders (or /api/v1/orders)
router.get('/', order_controller.get_store_orders);
router.get('/:id', order_controller.get_order_details);

router.patch('/:id/accept', order_controller.accept_order);
router.patch('/:id/pack', order_controller.pack_order);
router.patch('/:id/cancel', order_controller.cancel_order);

export default router;
