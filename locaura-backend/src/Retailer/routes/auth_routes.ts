import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate_schema } from '../middlewares/validate_schema';
import { send_otp_schema, verify_otp_schema, complete_profile_schema } from '../../validations/auth.schema';
import { auth_middleware } from '../middlewares/auth_middleware';

const auth_router = Router();
const auth_controller = new AuthController();

// OTP Authentication Workflow
auth_router.post('/send-otp', validate_schema(send_otp_schema), auth_controller.send_otp);
auth_router.post('/verify-otp', validate_schema(verify_otp_schema), auth_controller.verify_otp);

// Profile Management
auth_router.get('/profile', auth_middleware, auth_controller.get_profile);
auth_router.post('/complete-profile', auth_middleware, validate_schema(complete_profile_schema), auth_controller.complete_profile);

export default auth_router;