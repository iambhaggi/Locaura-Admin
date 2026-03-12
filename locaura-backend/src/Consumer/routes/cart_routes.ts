import { Router } from 'express';
import { CartController } from '../controllers/CartController';
import { consumer_auth_middleware } from '../middlewares/auth_middleware';
import { validate_schema } from '../../Retailer/middlewares/validate_schema';
import { add_cart_item_schema, update_cart_item_schema } from '../../validations/consumer_cart.schema';

const cart_router = Router();
const cart_controller = new CartController();

cart_router.use(consumer_auth_middleware);

cart_router.get('/', cart_controller.get_cart);
cart_router.post('/add', validate_schema(add_cart_item_schema), cart_controller.add_item);
cart_router.patch('/update/:variant_id', validate_schema(update_cart_item_schema), cart_controller.update_item_quantity);
cart_router.delete('/remove/:variant_id', cart_controller.remove_item);
cart_router.delete('/clear', cart_controller.clear_cart);

export default cart_router;
