import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { Logger } from '../../utils/logger';
import crypto from 'crypto';

export class PaymentController {
    private payment_service = new PaymentService();

    create_order = async (req: Request, res: Response) => {
        try {
            const { amount, receipt, currency } = req.body;

            if (!Number.isFinite(amount) || amount <= 0 || !receipt) {
                return res.status(400).json({ success: false, message: 'Valid amount and receipt are required' });
            }

            const razorpay_order = await this.payment_service.create_razorpay_order(amount, currency || 'INR', receipt);
            res.status(200).json({ success: true, data: razorpay_order });
        } catch (error: any) {
            Logger.error(`Razorpay Create Order error: ${error.message}`, 'PaymentController');
            res.status(500).json({ success: false, message: 'Failed to create payment order' });
        }
    };

    verify_payment = async (req: Request, res: Response) => {
        try {
            const consumer_id_raw = req.user?.id;
            const {
                payment_id,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;

            if (!consumer_id_raw || typeof consumer_id_raw !== 'string') {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            if (!payment_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({ success: false, message: 'Missing required payment verification fields' });
            }

            const is_valid = this.payment_service.verify_payment_signature(
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            );

            if (!is_valid) {
                return res.status(400).json({ success: false, message: 'Invalid payment signature' });
            }

            const payment = await this.payment_service.capture_payment(
                payment_id,
                consumer_id_raw,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            );

            res.status(200).json({ success: true, message: 'Payment verified successfully', data: { payment } });
        } catch (error: any) {
            Logger.error(`Razorpay Verify error: ${error.message}`, 'PaymentController');

            if (
                error.message?.includes('not found') ||
                error.message?.includes('mismatch') ||
                error.message?.includes('Cannot capture') ||
                error.message?.includes('different transaction') ||
                error.message?.includes('not linked')
            ) {
                return res.status(400).json({ success: false, message: error.message });
            }

            res.status(500).json({ success: false, message: 'Failed to verify payment' });
        }
    };

    refund_payment = async (req: Request, res: Response) => {
        try {
            const consumer_id_raw = req.user?.id;
            const payment_id_raw = req.params.payment_id;

            if (!consumer_id_raw || typeof consumer_id_raw !== 'string') {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            if (!payment_id_raw || typeof payment_id_raw !== 'string') {
                return res.status(400).json({ success: false, message: 'Payment id is required' });
            }

            const payment = await this.payment_service.process_refund_for_consumer(payment_id_raw, consumer_id_raw);
            return res.status(200).json({ success: true, message: 'Refund processed successfully', data: { payment } });
        } catch (error: any) {
            Logger.error(`Refund processing error: ${error.message}`, 'PaymentController');
            return res.status(400).json({ success: false, message: error.message || 'Failed to process refund' });
        }
    };

    webhook = async (req: Request, res: Response) => {
        try {
            const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
            if (!secret) return res.status(500).send('Webhook secret not configured');

            const provided_signature = req.headers['x-razorpay-signature'];
            if (!provided_signature || Array.isArray(provided_signature)) {
                return res.status(400).send('Missing signature');
            }

            const generated_signature = crypto
                .createHmac('sha256', secret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (generated_signature !== provided_signature) {
                return res.status(400).send('Invalid signature');
            }

            const event = req.body?.event;
            if (!event) {
                return res.status(400).send('Invalid webhook payload');
            }

            Logger.info(`Received Razorpay webhook: ${event}`, 'PaymentWebhook');

            try {
                await this.payment_service.handle_webhook_event(event, req.body?.payload);
            } catch (error: any) {
                Logger.error(`Webhook event processing error: ${error.message}`, 'PaymentWebhook');
            }

            return res.status(200).send('OK');
        } catch (error: any) {
            Logger.error(`Webhook processing failed: ${error.message}`, 'PaymentWebhook');
            return res.status(500).send('Webhook processing failed');
        }
    };
}
