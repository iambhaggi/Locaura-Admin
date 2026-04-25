import { Router } from 'express';
import { StoreController } from '../controllers/StoreController';
import { validate_schema } from '../middlewares/validate_schema';
import { register_store_schema, update_store_schema } from '../../validations/store.schema';
import { auth_middleware } from '../middlewares/auth_middleware';

const router = Router();
const store_controller = new StoreController();

// PROTECTED ROUTES (Require Authentication)
router.use(auth_middleware);
// /api/v1/stores
// Create a new store
router.post(
    '/register',
    validate_schema(register_store_schema),
    store_controller.register_store
);

// Get all stores for the logged in retailer
router.get(
    '/me',
    store_controller.get_my_stores
);

// Get specific store details
router.get(
    '/:id',
    store_controller.get_store
);

// Update specific store details
router.put(
    '/:id',
    validate_schema(update_store_schema),
    store_controller.update_store
);

// Delete a store
router.delete(
    '/:id',
    store_controller.delete_store
);

export default router;
