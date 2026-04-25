import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { consumer_auth_middleware } from '../middlewares/auth_middleware';

const router = Router();
const order_controller = new OrderController();

router.use(consumer_auth_middleware);

// /api/v1/consumers/orders
router.get('/', order_controller.get_my_orders);
router.get('/:id', order_controller.get_order_details);
router.post('/:id/cancel', order_controller.cancel_order);

export default router;
