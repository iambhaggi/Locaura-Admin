import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate_schema } from '../../Retailer/middlewares/validate_schema';
import { send_otp_schema, verify_otp_schema, complete_profile_schema, add_address_schema } from '../../validations/consumer_auth.schema';
import { consumer_auth_middleware } from '../middlewares/auth_middleware';

const consumer_auth_router = Router();
const auth_controller = new AuthController();

// Consumer App OTP Flow
consumer_auth_router.post('/send-otp', validate_schema(send_otp_schema), auth_controller.send_otp);
consumer_auth_router.post('/verify-otp', validate_schema(verify_otp_schema), auth_controller.verify_otp);

// Consumer Profile Details
consumer_auth_router.post('/complete-profile', consumer_auth_middleware, validate_schema(complete_profile_schema), auth_controller.complete_profile);

// Consumer Addresses
consumer_auth_router.get('/addresses', consumer_auth_middleware, auth_controller.get_addresses);
consumer_auth_router.post('/addresses', consumer_auth_middleware, validate_schema(add_address_schema), auth_controller.add_address);
consumer_auth_router.patch('/addresses/:address_id/default', consumer_auth_middleware, auth_controller.set_default_address);
consumer_auth_router.delete('/addresses/:address_id', consumer_auth_middleware, auth_controller.delete_address);

export default consumer_auth_router;
