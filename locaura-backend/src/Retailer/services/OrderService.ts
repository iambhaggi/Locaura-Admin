import { OrderRepository } from '../repositories/OrderRepository';
import { StoreRepository } from '../repositories/StoreRepository';
import { OrderStatus } from '../enums/order.enum';
import mongoose from 'mongoose';
import { NotificationUseCase } from '../../Notifications/app/NotificationUseCase';

export class OrderService {
    private order_repository = new OrderRepository();
    private store_repository = new StoreRepository();

    async get_store_orders(store_id: string, retailer_id: string) {
        // Must verify the store belongs to the retailer
        const store = await this.store_repository.find_by_store_id(store_id);
        if (!store || store.retailer_id.toString() !== retailer_id) {
            throw new Error("Store not found or unauthorized");
        }
        return this.order_repository.find_by_store(store_id);
    }
    
    async get_order_details(order_id: string, retailer_id: string) {
        const order = await this.order_repository.find_by_id(order_id);
        if (!order || order.retailer_id.toString() !== retailer_id) {
            throw new Error("Order not found or unauthorized");
        }
        return order;
    }

    async accept_order(order_id: string, retailer_id: string) {
        const order = await this.get_order_details(order_id, retailer_id);
        
        if (order.status !== OrderStatus.PENDING) {
            throw new Error(`Cannot accept order in ${order.status} status`);
        }

        const updatedOrder = await this.order_repository.update(order_id, {
            status: OrderStatus.ACCEPTED,
            $push: {
                status_history: {
                    status: OrderStatus.ACCEPTED,
                    timestamp: new Date(),
                    note: 'Order accepted by store',
                    updated_by: new mongoose.Types.ObjectId(retailer_id),
                    actor_role: 'retailer'
                }
            }
        });

        if (updatedOrder) {
            NotificationUseCase.notify_order_status_update(updatedOrder.consumer_id as any, OrderStatus.ACCEPTED, updatedOrder.order_number);
        }

        return updatedOrder;
    }

    async pack_order(order_id: string, retailer_id: string) {
        const order = await this.get_order_details(order_id, retailer_id);
        
        if (order.status !== OrderStatus.ACCEPTED) {
            throw new Error(`Cannot pack order in ${order.status} status`);
        }

        const updatedOrder = await this.order_repository.update(order_id, {
            status: OrderStatus.PACKED,
            $push: {
                status_history: {
                    status: OrderStatus.PACKED,
                    timestamp: new Date(),
                    note: 'Order packed and ready for pickup',
                    updated_by: new mongoose.Types.ObjectId(retailer_id),
                    actor_role: 'retailer'
                }
            }
        });

        if (updatedOrder) {
             NotificationUseCase.notify_order_status_update(updatedOrder.consumer_id as any, OrderStatus.PACKED, updatedOrder.order_number);
        }

        return updatedOrder;
    }

    async cancel_order(order_id: string, retailer_id: string, reason: string) {
        const order = await this.get_order_details(order_id, retailer_id);
        
        if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status as OrderStatus)) {
            throw new Error(`Cannot cancel order in ${order.status} status`);
        }

        // TODO: Trigger stock restock logic by mapping over order.items

        return this.order_repository.update(order_id, {
            status: OrderStatus.CANCELLED,
            $push: {
                status_history: {
                    status: OrderStatus.CANCELLED,
                    timestamp: new Date(),
                    note: `Order cancelled: ${reason}`,
                    updated_by: new mongoose.Types.ObjectId(retailer_id),
                    actor_role: 'retailer'
                }
            }
        });
    }
}
