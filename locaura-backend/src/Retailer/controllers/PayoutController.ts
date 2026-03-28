import { Request, Response } from 'express';
import { RetailerPayoutService } from '../services/PayoutService';
import { Logger } from '../../utils/logger';


const payout_service = new RetailerPayoutService();

export class PayoutController {
    /**
     * List all payouts for the authenticated retailer
     */
    async list_payouts(req: Request, res: Response): Promise<void> {
        try {
            const retailer_id_raw = req.user?.id;
            if (!retailer_id_raw || typeof retailer_id_raw !== 'string') {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const payouts = await payout_service.list_retailer_payouts(retailer_id_raw);
            res.status(200).json({
                success: true,
                data: { payouts }
            });
        } catch (error: any) {
            Logger.error('Failed to list payouts', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Get pending payouts for the retailer
     */
    async get_pending_payouts(req: Request, res: Response): Promise<void> {
        try {
            const retailer_id_raw = req.user?.id;
            if (!retailer_id_raw || typeof retailer_id_raw !== 'string') {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const payouts = await payout_service.get_pending_payouts(retailer_id_raw);
            res.status(200).json({
                success: true,
                data: { payouts, count: payouts.length }
            });
        } catch (error: any) {
            Logger.error('Failed to get pending payouts', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Generate a weekly payout batch for a store
     * Requires: store_id in request body
     */
    async generate_payout(req: Request, res: Response): Promise<void> {
        try {
            const retailer_id_raw = req.user?.id;
            if (!retailer_id_raw || typeof retailer_id_raw !== 'string') {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const { store_id } = req.body;
            if (!store_id || typeof store_id !== 'string') {
                res.status(400).json({ success: false, message: 'store_id is required' });
                return;
            }

            const payout = await payout_service.generate_weekly_payout(store_id);
            res.status(201).json({
                success: true,
                message: 'Payout batch generated successfully',
                data: { payout }
            });
        } catch (error: any) {
            Logger.error('Failed to generate payout', error);
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message });
        }
    }

    /**
     * Process a pending payout (initiate Razorpay transfer)
     * Requires: payout_id in URL params
     */
    async process_payout(req: Request, res: Response): Promise<void> {
        try {
            const retailer_id_raw = req.user?.id;
            if (!retailer_id_raw || typeof retailer_id_raw !== 'string') {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const payout_id_raw = req.params.payout_id;
            if (!payout_id_raw || typeof payout_id_raw !== 'string') {
                res.status(400).json({ success: false, message: 'payout_id is required' });
                return;
            }

            const payout = await payout_service.process_payout(payout_id_raw);
            res.status(200).json({
                success: true,
                message: 'Payout processing initiated',
                data: { payout }
            });
        } catch (error: any) {
            Logger.error('Failed to process payout', error);
            const status = error.message.includes('cannot be processed') ? 400 : 500;
            res.status(status).json({ success: false, message: error.message });
        }
    }

    /**
     * Get payout details by ID
     */
    async get_payout_details(req: Request, res: Response): Promise<void> {
        try {
            const retailer_id_raw = req.user?.id;
            if (!retailer_id_raw || typeof retailer_id_raw !== 'string') {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            const payout_id_raw = req.params.payout_id;
            if (!payout_id_raw || typeof payout_id_raw !== 'string') {
                res.status(400).json({ success: false, message: 'payout_id is required' });
                return;
            }

            const payout = await payout_service.get_payout_by_id(payout_id_raw);
            if (!payout) {
                res.status(404).json({ success: false, message: 'Payout not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: { payout }
            });
        } catch (error: any) {
            Logger.error('Failed to get payout details', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
