import { RiderRepository } from '../repositories/RiderRepository';
import { OrderRepository } from '../../Retailer/repositories/OrderRepository';
import { OrderStatus } from '../../Retailer/enums/order.enum';
import mongoose from 'mongoose';

export class DeliveryService {
    private rider_repository = new RiderRepository();
    // Assuming OrderRepository will have location-based queries
    private order_repository = new OrderRepository(); 
    
    // Geo-query for PACKED orders within Rider's service radius
    async get_available_orders(rider_id: string, lat: number, lng: number) {
        const rider = await this.rider_repository.find_by_id(rider_id);
        if (!rider) throw new Error("Rider not found");
        
        // Update rider location while we're at it
        await this.rider_repository.update_location(rider_id, lng, lat);
        
        // Return orders that are PACKED and need a delivery partner
        // In a real system, you'd use a geo-spatial query on Store.location via agg pipeline
        return this.order_repository.find_by_status(OrderStatus.PACKED); 
    }
    
    async accept_order(rider_id: string, order_id: string) {
        const order = await this.order_repository.find_by_id(order_id);
        if (!order) throw new Error("Order not found");
        
        if (order.status !== OrderStatus.PACKED || order.delivery_partner_id) {
            throw new Error("Order is no longer available");
        }
        
        // 1. Assign rider to order
        const updated_order = await this.order_repository.update(order_id, {
            delivery_partner_id: new mongoose.Types.ObjectId(rider_id),
            status: OrderStatus.SHIPPED,
            $push: {
                status_history: {
                    status: OrderStatus.SHIPPED,
                    timestamp: new Date(),
                    note: 'Order picked up by delivery partner',
                    updated_by: new mongoose.Types.ObjectId(rider_id),
                    actor_role: 'rider'
                }
            }
        });
        
        // 2. Mark rider as busy
        await this.rider_repository.update(rider_id, {
            isAvailable: false,
            currentOrderId: new mongoose.Types.ObjectId(order_id)
        });
        
        return updated_order;
    }
    
    async mark_delivered(rider_id: string, order_id: string) {
        const order = await this.order_repository.find_by_id(order_id);
        if (!order) throw new Error("Order not found");
        
        if (order.delivery_partner_id?.toString() !== rider_id) {
            throw new Error("Unauthorized to update this order");
        }
        
        // 1. Mark order delivered
        const updated_order = await this.order_repository.update(order_id, {
            status: OrderStatus.DELIVERED,
            delivered_at: new Date(),
            $push: {
                status_history: {
                    status: OrderStatus.DELIVERED,
                    timestamp: new Date(),
                    note: 'Order successfully delivered',
                    updated_by: new mongoose.Types.ObjectId(rider_id),
                    actor_role: 'rider'
                }
            }
        });
        
        // 2. Free up rider
        await this.rider_repository.update(rider_id, {
            isAvailable: true,
            currentOrderId: undefined,
            $inc: { totalDeliveries: 1 }
        });
        
        // Optional: Trigger EARNING calculation here via RiderEarning model
        
        return updated_order;
    }
}
