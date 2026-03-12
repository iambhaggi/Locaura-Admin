import OrderModel, { IOrder } from '../models/Orders.model';

export class OrderRepository {
    async create(order_data: Partial<IOrder>): Promise<IOrder> {
        const order = new OrderModel(order_data);
        return order.save();
    }

    async find_by_id(order_id: string): Promise<IOrder | null> {
        return OrderModel.findById(order_id);
    }
    
    async find_by_store(store_id: string): Promise<IOrder[]> {
        return OrderModel.find({ store_id }).sort({ createdAt: -1 });
    }

    async find_by_consumer(consumer_id: string): Promise<IOrder[]> {
        return OrderModel.find({ consumer_id }).sort({ createdAt: -1 });
    }

    async update(order_id: string, update_data: Partial<IOrder>): Promise<IOrder | null> {
        return OrderModel.findByIdAndUpdate(
            order_id, 
            { $set: update_data }, 
            { new: true }
        );
    }
}
