import { Router, Request, Response } from 'express';
import { NotificationUseCase } from '../app/NotificationUseCase';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';

const router = Router();

/**
 * POST /api/v1/test/notify
 * Triggers a real-time notification to a specific retailer and store.
 */
router.post('/notify', asyncHandler(async (req: Request, res: Response) => {
    const { retailer_id, store_id } = req.body;

    if (!retailer_id || !store_id) {
        return res.status(400).json(new ApiResponse(400, null, 'retailer_id and store_id are required'));
    }

    const test_order_number = `TEST-${Math.floor(1000 + Math.random() * 9000)}`;

    // Dispatch via all registered providers (WS + FCM)
    await NotificationUseCase.notify_new_order(store_id, retailer_id, test_order_number);

    return res.status(200).json(new ApiResponse(200, {
        order_number: test_order_number,
        channels: ['WEBSOCKET', 'FCM']
    }, 'Test notification triggered successfully'));
}));

export default router;
