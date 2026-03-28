import { Router } from 'express';
import { RiderPayoutController } from '../controllers/PayoutController';
import { rider_auth_middleware } from '../middlewares/auth_middleware';

const router = Router();
const rider_payout_controller = new RiderPayoutController();

// Razorpay payout webhook route (no rider auth)
router.post('/webhook', rider_payout_controller.webhook);

router.use(rider_auth_middleware);

// /api/v1/riders/payouts
router.get('/', rider_payout_controller.list_payouts);
router.get('/pending', rider_payout_controller.get_pending_payouts);
router.post('/generate', rider_payout_controller.generate_payout);
router.post('/:payout_id/process', rider_payout_controller.process_payout);
router.get('/:payout_id', rider_payout_controller.get_payout_details);

export default router;