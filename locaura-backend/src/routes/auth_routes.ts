import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const authRouter = Router();
const authController = new AuthController();

// OTP Authentication Workflow
authRouter.post('/send-otp', authController.sendOtp);
authRouter.post('/verify-otp', authController.verifyOtp);

// Profile Completion (Step 2 - after login/verification)
authRouter.post('/complete-profile', authController.completeProfile);

export default authRouter;