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

    private get_signature_secret(): string {
        return process.env.RAZORPAY_KEY_SECRET || 'fallbackSecretValue';
    }

    private create_signature(razorpay_order_id: string, razorpay_payment_id: string): string {
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        return crypto
            .createHmac('sha256', this.get_signature_secret())
            .update(body)
            .digest('hex');
    }

    async create_razorpay_order(amount: number, currency: string = 'INR', receipt: string) {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        if (!receipt || !receipt.trim()) {
            throw new Error('Receipt is required');
        }

        const options = {
            amount: Math.round(amount * 100),
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
        const expected_signature = this.create_signature(razorpay_order_id, razorpay_payment_id);
        return expected_signature === signature;
    }

    async capture_payment(
        payment_id: string,
        consumer_id: string,
        razorpay_order_id: string,
        razorpay_payment_id: string,
        razorpay_signature: string
    ) {
        const payment = await PaymentModel.findOne({ _id: payment_id, consumer_id });
        if (!payment) throw new Error('Payment record not found');

        if (!payment.gateway_order_id) {
            throw new Error('Payment is not linked with a gateway order');
        }

        if (payment.gateway_order_id !== razorpay_order_id) {
            throw new Error('Razorpay order mismatch');
        }

        if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.COMPLETED) {
            throw new Error(`Cannot capture payment in ${payment.status} status`);
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            if (payment.gateway_payment_id && payment.gateway_payment_id !== razorpay_payment_id) {
                throw new Error('Payment is already captured with a different transaction id');
            }
            return payment;
        }

        payment.gateway_order_id = razorpay_order_id;
        payment.gateway_payment_id = razorpay_payment_id;
        payment.gateway_signature = razorpay_signature;
        payment.status = PaymentStatus.COMPLETED;
        await payment.save();

        await this.order_repository.update(payment.order_id as unknown as string, {
            'payment.status': PaymentStatus.COMPLETED,
            'payment.paid_at': new Date(),
            'payment.reference': razorpay_payment_id
        });

        return payment;
    }

    async handle_payment_captured(entity: any) {
        const gateway_order_id = entity?.order_id;
        const gateway_payment_id = entity?.id;

        if (!gateway_order_id || !gateway_payment_id) {
            throw new Error('Invalid payment.captured payload');
        }

        const payment = await PaymentModel.findOne({ gateway_order_id, gateway: 'razorpay' });
        if (!payment) {
            throw new Error('Payment record not found for captured event');
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            return payment;
        }

        payment.gateway_payment_id = gateway_payment_id;
        payment.status = PaymentStatus.COMPLETED;
        payment.metadata = {
            ...(payment.metadata ? Object.fromEntries(payment.metadata as any) : {}),
            webhook_payment_captured: entity
        } as any;
        await payment.save();

        await this.order_repository.update(payment.order_id as unknown as string, {
            'payment.status': PaymentStatus.COMPLETED,
            'payment.paid_at': new Date(entity?.captured_at ? entity.captured_at * 1000 : Date.now()),
            'payment.reference': gateway_payment_id
        });

        return payment;
    }

    async handle_payment_failed(entity: any) {
        const gateway_order_id = entity?.order_id;
        const gateway_payment_id = entity?.id;
        const failure_reason = entity?.error_description || entity?.error_reason || 'Payment failed';

        if (!gateway_order_id) {
            throw new Error('Invalid payment.failed payload');
        }

        const payment = await PaymentModel.findOne({ gateway_order_id, gateway: 'razorpay' });
        if (!payment) {
            throw new Error('Payment record not found for failed event');
        }

        if (payment.status === PaymentStatus.COMPLETED || payment.status === PaymentStatus.REFUNDED) {
            return payment;
        }

        payment.gateway_payment_id = gateway_payment_id || payment.gateway_payment_id;
        payment.status = PaymentStatus.FAILED;
        payment.failure_reason = failure_reason;
        payment.metadata = {
            ...(payment.metadata ? Object.fromEntries(payment.metadata as any) : {}),
            webhook_payment_failed: entity
        } as any;
        await payment.save();

        await this.order_repository.update(payment.order_id as unknown as string, {
            'payment.status': PaymentStatus.FAILED
        });

        return payment;
    }

    async handle_refund_processed(entity: any) {
        const gateway_payment_id = entity?.payment_id;
        const refund_id = entity?.id;

        if (!gateway_payment_id || !refund_id) {
            throw new Error('Invalid refund.processed payload');
        }

        const payment = await PaymentModel.findOne({ gateway_payment_id, gateway: 'razorpay' });
        if (!payment) {
            throw new Error('Payment record not found for refund event');
        }

        payment.status = PaymentStatus.REFUNDED;
        payment.refund_id = refund_id;
        payment.refund_amount = Number(entity?.amount || payment.amount * 100) / 100;
        payment.refunded_at = new Date();
        payment.metadata = {
            ...(payment.metadata ? Object.fromEntries(payment.metadata as any) : {}),
            webhook_refund_processed: entity
        } as any;
        await payment.save();

        await this.order_repository.update(payment.order_id as unknown as string, {
            'payment.status': PaymentStatus.REFUNDED
        });

        return payment;
    }

    async handle_webhook_event(event: string, payload: any) {
        switch (event) {
            case 'payment.captured':
                return this.handle_payment_captured(payload?.payment?.entity);
            case 'payment.failed':
                return this.handle_payment_failed(payload?.payment?.entity);
            case 'refund.processed':
                return this.handle_refund_processed(payload?.refund?.entity);
            default:
                return null;
        }
    }

    async process_refund(payment_id: string) {
        const payment = await PaymentModel.findById(payment_id);
        if (!payment) throw new Error('Payment record not found');
        if (payment.status !== PaymentStatus.COMPLETED || payment.gateway !== 'razorpay') {
            throw new Error(`Cannot refund payment in status ${payment.status} or gateway ${payment.gateway}`);
        }

        try {
            const refund = await razorpay.payments.refund(payment.gateway_payment_id as string, {});

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

    async process_refund_for_consumer(payment_id: string, consumer_id: string) {
        const payment = await PaymentModel.findOne({ _id: payment_id, consumer_id });
        if (!payment) {
            throw new Error('Payment record not found');
        }

        return this.process_refund(payment_id);
    }
}
