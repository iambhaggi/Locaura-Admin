import { Router, Request, Response } from 'express';
import { PayoutController } from '../controllers/PayoutController';
import { auth_middleware } from '../middlewares/auth_middleware';

export const payout_routes = Router();
const payout_controller = new PayoutController();

// Razorpay payout webhook (no auth)
payout_routes.post('/webhook', async (req: Request, res: Response) => {
    await payout_controller.webhook(req, res);
});

// All other payout routes require retailer authentication
payout_routes.use(auth_middleware);

/**
 * GET /payouts
 * List all payouts for the authenticated retailer
 */
payout_routes.get('/', async (req: Request, res: Response) => {
    await payout_controller.list_payouts(req, res);
});

/**
 * GET /payouts/pending
 * Get pending/processing payouts for the retailer
 */
payout_routes.get('/pending', async (req: Request, res: Response) => {
    await payout_controller.get_pending_payouts(req, res);
});

/**
 * POST /payouts/generate
 * Generate a new weekly payout batch
 * Body: { store_id: string }
 */
payout_routes.post('/generate', async (req: Request, res: Response) => {
    await payout_controller.generate_payout(req, res);
});

/**
 * POST /payouts/:payout_id/process
 * Process a pending payout and initiate Razorpay transfer
 */
payout_routes.post('/:payout_id/process', async (req: Request, res: Response) => {
    await payout_controller.process_payout(req, res);
});

/**
 * GET /payouts/:payout_id
 * Get payout details by ID
 */
payout_routes.get('/:payout_id', async (req: Request, res: Response) => {
    await payout_controller.get_payout_details(req, res);
});

export default payout_routes;