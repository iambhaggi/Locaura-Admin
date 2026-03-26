import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { rider_auth_middleware } from '../middlewares/auth_middleware';

const router = Router();
const auth_controller = new AuthController();

// Public routes
router.post('/send-otp', auth_controller.send_otp);
router.post('/verify-otp', auth_controller.verify_otp);

// Protected routes
router.get('/me', rider_auth_middleware, auth_controller.me);

export default router;
