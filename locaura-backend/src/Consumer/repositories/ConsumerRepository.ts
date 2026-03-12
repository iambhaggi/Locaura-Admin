import { Consumer, IConsumer } from '../models/Consumer.model';

export class ConsumerRepository {
    async find_by_phone(phone: string): Promise<IConsumer | null> {
        return Consumer.findOne({ phone }).exec();
    }

    async find_by_id(id: string): Promise<IConsumer | null> {
        return Consumer.findById(id).exec();
    }

    async create(consumerData: Partial<IConsumer>): Promise<IConsumer> {
        const consumer = new Consumer(consumerData);
        return consumer.save();
    }

    async update(id: string, updateData: Partial<IConsumer>): Promise<IConsumer | null> {
        // Prevent accidental phone number updates through standard update
        const { phone, ...safeData } = updateData; 
        return Consumer.findByIdAndUpdate(id, safeData, { new: true }).exec();
    }

    async add_address(id: string, address: any): Promise<IConsumer | null> {
         return Consumer.findByIdAndUpdate(
            id,
            { $push: { addresses: address } },
            { new: true }
        ).exec();
    }

    async delete(id: string): Promise<IConsumer | null> {
        return Consumer.findByIdAndUpdate(id, { status: 'deleted' }, { new: true }).exec();
    }
}
