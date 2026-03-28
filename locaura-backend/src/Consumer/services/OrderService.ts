import { OrderRepository } from '../../Retailer/repositories/OrderRepository';
import { OrderStatus, PaymentStatus } from '../../Retailer/enums/order.enum';
import mongoose from 'mongoose';

export class OrderService {
    private order_repository = new OrderRepository();

    async get_consumer_orders(consumer_id: string) {
        return this.order_repository.find_by_consumer(consumer_id);
    }

    async get_order_details(order_id: string, consumer_id: string) {
        const order = await this.order_repository.find_by_id(order_id);
        if (!order || order.consumer_id.toString() !== consumer_id) {
            throw new Error('Order not found or unauthorized');
        }
        return order;
    }

    async cancel_order(order_id: string, consumer_id: string) {
        const order = await this.get_order_details(order_id, consumer_id);

        // Consumers can only cancel if it's still pending
        if (order.status !== OrderStatus.PENDING) {
            throw new Error(`Cannot cancel order in ${order.status} status`);
        }

        const cancellation_note = order.payment.status === PaymentStatus.COMPLETED
            ? 'Order cancelled by consumer (manual refund required)'
            : 'Order cancelled by consumer';

        // TODO: Trigger stock restock logic by mapping over order.items
        return this.order_repository.update(order_id, {
            status: OrderStatus.CANCELLED,
            $push: {
                status_history: {
                    status: OrderStatus.CANCELLED,
                    timestamp: new Date(),
                    note: cancellation_note,
                    updated_by: new mongoose.Types.ObjectId(consumer_id),
                    actor_role: 'consumer'
                }
            }
        });
    }
}
