import mongoose from 'mongoose';
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
         if (!address._id) {
             address._id = new mongoose.Types.ObjectId();
         }
         return Consumer.findByIdAndUpdate(
            id,
            { $push: { addresses: address } },
            { new: true }
        ).exec();
    }

    async update_all_addresses(id: string, updateData: any): Promise<IConsumer | null> {
        // Use positional operator to update all elements in subdocuments
        return Consumer.findByIdAndUpdate(
            id,
            { $set: { "addresses.$[].is_default": updateData.is_default } },
            { new: true }
        ).exec();
    }

    async set_address_default(consumer_id: string, address_id: string): Promise<IConsumer | null> {
        return Consumer.findOneAndUpdate(
            { _id: consumer_id, "addresses._id": address_id },
            { $set: { "addresses.$.is_default": true } },
            { new: true }
        ).exec();
    }

    async update_address(consumer_id: string, address_id: string, updateData: any): Promise<IConsumer | null> {
        return Consumer.findOneAndUpdate(
            { _id: consumer_id, "addresses._id": address_id },
            { $set: { "addresses.$": { ...updateData, _id: address_id } } },
            { new: true }
        ).exec();
    }

    async delete(id: string): Promise<IConsumer | null> {
        return Consumer.findByIdAndUpdate(id, { status: 'deleted' }, { new: true }).exec();
    }
}
