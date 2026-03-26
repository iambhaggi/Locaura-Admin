import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { consumer_auth_middleware } from '../middlewares/auth_middleware';

const router = Router();
const payment_controller = new PaymentController();

// Consumer frontend calls
router.post('/create-order', consumer_auth_middleware, payment_controller.create_order);
router.post('/verify', consumer_auth_middleware, payment_controller.verify_payment);

// Razorpay backend-to-backend webhook (no consumer auth)
router.post('/webhook', payment_controller.webhook);

export default router;
