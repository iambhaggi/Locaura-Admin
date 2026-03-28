import { Request, Response } from 'express';
import { RiderPayoutService } from '../services/RiderPayoutService';
import { Logger } from '../../utils/logger';
import { get_razorpay_gateway } from '../../utils/RazorpayGatewayService';

export class RiderPayoutController {
    private rider_payout_service = new RiderPayoutService();
    private razorpay_gateway = get_razorpay_gateway();

    list_payouts = async (req: Request, res: Response) => {
        try {
            const rider_id = req.user?.id;
            if (!rider_id) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const payouts = await this.rider_payout_service.list_rider_payouts(rider_id);
            return res.status(200).json({ success: true, data: { payouts } });
        } catch (error: any) {
            Logger.error(`Rider list payouts failed: ${error.message}`, 'RiderPayoutController');
            return res.status(500).json({ success: false, message: error.message });
        }
    };

    get_pending_payouts = async (req: Request, res: Response) => {
        try {
            const rider_id = req.user?.id;
            if (!rider_id) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const payouts = await this.rider_payout_service.get_pending_payouts(rider_id);
            return res.status(200).json({ success: true, data: { payouts, count: payouts.length } });
        } catch (error: any) {
            Logger.error(`Rider pending payouts failed: ${error.message}`, 'RiderPayoutController');
            return res.status(500).json({ success: false, message: error.message });
        }
    };

    generate_payout = async (req: Request, res: Response) => {
        try {
            const rider_id = req.user?.id;
            if (!rider_id) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const payout = await this.rider_payout_service.generate_weekly_payout(rider_id);
            return res.status(201).json({ success: true, message: 'Rider payout generated', data: { payout } });
        } catch (error: any) {
            Logger.error(`Rider payout generation failed: ${error.message}`, 'RiderPayoutController');
            return res.status(400).json({ success: false, message: error.message });
        }
    };

    process_payout = async (req: Request, res: Response) => {
        try {
            const rider_id = req.user?.id;
            const payout_id = req.params.payout_id;

            if (!rider_id) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            if (!payout_id || typeof payout_id !== 'string') {
                return res.status(400).json({ success: false, message: 'payout_id is required' });
            }

            const payout = await this.rider_payout_service.process_payout(payout_id, rider_id);
            return res.status(200).json({ success: true, message: 'Rider payout processing started', data: { payout } });
        } catch (error: any) {
            Logger.error(`Rider payout processing failed: ${error.message}`, 'RiderPayoutController');
            return res.status(400).json({ success: false, message: error.message });
        }
    };

    get_payout_details = async (req: Request, res: Response) => {
        try {
            const rider_id = req.user?.id;
            const payout_id = req.params.payout_id;

            if (!rider_id) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            if (!payout_id || typeof payout_id !== 'string') {
                return res.status(400).json({ success: false, message: 'payout_id is required' });
            }

            const payout = await this.rider_payout_service.get_payout_by_id(payout_id);
            if (!payout || payout.rider_id.toString() !== rider_id) {
                return res.status(404).json({ success: false, message: 'Payout not found' });
            }

            return res.status(200).json({ success: true, data: { payout } });
        } catch (error: any) {
            Logger.error(`Rider get payout details failed: ${error.message}`, 'RiderPayoutController');
            return res.status(500).json({ success: false, message: error.message });
        }
    };

    webhook = async (req: Request, res: Response) => {
        try {
            const provided_signature = req.headers['x-razorpay-signature'];
            if (!provided_signature || Array.isArray(provided_signature)) {
                return res.status(400).send('Missing signature');
            }

            const is_valid = this.razorpay_gateway.verify_webhook_signature(req.body, provided_signature, 'payouts');
            if (!is_valid) {
                return res.status(400).send('Invalid signature');
            }

            const event = req.body?.event;
            if (!event) {
                return res.status(400).send('Invalid webhook payload');
            }

            await this.rider_payout_service.handle_webhook_event(event, req.body?.payload);
            return res.status(200).send('OK');
        } catch (error: any) {
            Logger.error(`Rider payout webhook failed: ${error.message}`, 'RiderPayoutWebhook');
            return res.status(500).send('Webhook processing failed');
        }
    };
}