import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { auth_middleware } from '../middlewares/auth_middleware';

const router = Router({ mergeParams: true }); // Important: mergeParams allows accessing :storeId from the parent router
const productController = new ProductController();

// All product routes require authentication (for now, assuming RetailerOwners manage products)
router.use(auth_middleware);

// Routes for /api/v1/stores/:store_id/products
router.route('/')
    .post(productController.create_product)
    .get(productController.get_products_by_store_id);

router.route('/:product_id')
    .get(productController.get_product_by_id)
    .put(productController.update_product)
    .delete(productController.delete_product);

export default router;
