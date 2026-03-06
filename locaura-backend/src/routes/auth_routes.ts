import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const auth_router = Router();
const auth_controller = new AuthController();

// OTP Authentication Workflow
auth_router.post('/send-otp', auth_controller.send_otp);
auth_router.post('/verify-otp', auth_controller.verify_otp);

// Profile Completion (Step 2 - after login/verification)
auth_router.post('/complete-profile', auth_controller.complete_profile);

export default auth_router;