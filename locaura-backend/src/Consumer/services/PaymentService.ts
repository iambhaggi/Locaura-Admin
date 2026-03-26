import Razorpay from 'razorpay';
import crypto from 'crypto';
import PaymentModel from '../../Retailer/models/Payment.model';
import { PaymentStatus } from '../../Retailer/enums/order.enum';
import { OrderRepository } from '../../Retailer/repositories/OrderRepository';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallbackKey123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'fallbackSecretValue',
});

export class PaymentService {
    private order_repository = new OrderRepository();

    async create_razorpay_order(amount: number, currency: string = 'INR', receipt: string) {
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency,
            receipt,
        };

        try {
            const order = await razorpay.orders.create(options);
            return {
                razorpay_order_id: order.id,
                amount: order.amount,
                currency: order.currency,
            };
        } catch (error: any) {
            throw new Error(`Razorpay Order Creation Failed: ${error.message}`);
        }
    }

    verify_payment_signature(razorpay_order_id: string, razorpay_payment_id: string, signature: string): boolean {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'fallbackSecretValue')
            .update(body.toString())
            .digest('hex');

        return expectedSignature === signature;
    }

    async capture_payment(payment_id: string, razorpay_payment_id: string, razorpay_signature: string) {
        // 1. Find the payment doc
        const payment = await PaymentModel.findById(payment_id);
        if (!payment) throw new Error("Payment record not found");

        if (payment.status === PaymentStatus.COMPLETED) {
            return payment; // Already captured (idempotent)
        }

        // 2. Mark as completed
        payment.gateway_payment_id = razorpay_payment_id;
        payment.gateway_signature = razorpay_signature;
        payment.status = PaymentStatus.COMPLETED;
        await payment.save();

        // 3. Update Order payment status
        await this.order_repository.update(payment.order_id as unknown as string, {
            'payment.status': PaymentStatus.COMPLETED,
            'payment.paid_at': new Date(),
            'payment.reference': razorpay_payment_id
        });

        return payment;
    }

    async process_refund(payment_id: string) {
        const payment = await PaymentModel.findById(payment_id);
        if (!payment) throw new Error("Payment record not found");
        if (payment.status !== PaymentStatus.COMPLETED || payment.gateway !== 'razorpay') {
            throw new Error(`Cannot refund payment in status ${payment.status} or gateway ${payment.gateway}`);
        }

        try {
            const refund = await razorpay.payments.refund(payment.gateway_payment_id as string, {
                // If amount is not passed, it implies full refund
            });

            payment.status = PaymentStatus.REFUNDED;
            payment.refund_id = refund.id;
            payment.refunded_at = new Date();
            payment.refund_amount = payment.amount;
            await payment.save();

            await this.order_repository.update(payment.order_id as unknown as string, {
                'payment.status': PaymentStatus.REFUNDED
            });

            return payment;
        } catch (error: any) {
             throw new Error(`Refund Failed: ${error.message}`);
        }
    }
}
