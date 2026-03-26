import { Router } from 'express';
import { DeliveryController } from '../controllers/DeliveryController';
import { rider_auth_middleware } from '../middlewares/auth_middleware';

const router = Router();
const delivery_controller = new DeliveryController();

router.use(rider_auth_middleware);

// /api/v1/riders/deliveries
router.get('/available', delivery_controller.get_available_orders);
router.patch('/:id/accept', delivery_controller.accept_order);
router.patch('/:id/deliver', delivery_controller.mark_delivered);

export default router;
