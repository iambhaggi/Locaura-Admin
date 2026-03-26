import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { Logger } from '../../utils/logger';

export class PaymentController {
    private payment_service = new PaymentService();

    create_order = async (req: Request, res: Response) => {
        try {
            const { amount, receipt, currency } = req.body;
            
            if (!amount || !receipt) {
                return res.status(400).json({ success: false, message: 'Amount and receipt are required' });
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
            const { 
                payment_id, // Internal IPayment doc id
                razorpay_order_id, 
                razorpay_payment_id, 
                razorpay_signature 
            } = req.body;

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
                razorpay_payment_id, 
                razorpay_signature
            );

            res.status(200).json({ success: true, message: 'Payment verified successfully', data: { payment } });
        } catch (error: any) {
            Logger.error(`Razorpay Verify error: ${error.message}`, 'PaymentController');
            res.status(500).json({ success: false, message: 'Failed to verify payment' });
        }
    };

    webhook = async (req: Request, res: Response) => {
        try {
            const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
            if (!secret) return res.status(500).send('Webhook secret not configured');

            const expectedSignature = req.headers['x-razorpay-signature'];
            if (!expectedSignature) return res.status(400).send('Missing signature');

            const crypto = require('crypto');
            const generatedSignature = crypto
                .createHmac('sha256', secret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (generatedSignature !== expectedSignature) {
                return res.status(400).send('Invalid signature');
            }

            const event = req.body.event;
            Logger.info(`Received Razorpay webhook: ${event}`, 'PaymentWebhook');

            // Handle specific events (e.g. payment.captured, payment.failed, refund.processed)
            // Routing it to payment_service based on payload

            res.status(200).send('OK');
        } catch (error: any) {
            res.status(500).send('Webhook processing failed');
        }
    };
}
