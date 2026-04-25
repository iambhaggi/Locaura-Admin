import { Router } from 'express';
import { StoreController } from '../controllers/StoreController';

const router = Router();
const store_controller = new StoreController();

// /api/v1/consumers/stores
router.get('/nearby', store_controller.get_nearby_stores);
router.get('/search', store_controller.search_stores_and_products);
router.get('/products/:id', store_controller.get_product_details);
router.get('/:id', store_controller.get_store_details);
router.get('/:id/products', store_controller.get_store_products);

export default router;
