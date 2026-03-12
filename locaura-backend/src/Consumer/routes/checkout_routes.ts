import { Router } from 'express';
import { CheckoutController } from '../controllers/CheckoutController';
import { consumer_auth_middleware } from '../middlewares/auth_middleware';
import { validate_schema } from '../../Retailer/middlewares/validate_schema';
import { checkout_schema } from '../../validations/consumer_checkout.schema';

const checkout_router = Router();
const checkout_controller = new CheckoutController();

// Consumer App Checkout Flow
checkout_router.post(
    '/', 
    consumer_auth_middleware, 
    validate_schema(checkout_schema), 
    checkout_controller.process_checkout
);

export default checkout_router;
