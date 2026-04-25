import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { auth_middleware } from '../../Retailer/middlewares/auth_middleware';
import { role_middleware } from '../../Retailer/middlewares/role_middleware';

const router = Router();
const admin_controller = new AdminController();

// PROTECTED ROUTES (Require Authentication & Admin Role)
router.use(auth_middleware);
// router.use(role_middleware(['admin']));

// /api/v1/admin
router.get('/dashboard/stats', admin_controller.get_stats);
router.get('/stores', admin_controller.get_stores);
router.patch('/stores/:id/status', admin_controller.update_store_status);
router.get('/retailers', admin_controller.get_retailers);

export default router;
