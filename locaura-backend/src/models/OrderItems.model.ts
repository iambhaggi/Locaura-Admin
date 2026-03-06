import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem extends Document {
    _id: mongoose.Types.ObjectId;
    order_id: mongoose.Types.ObjectId;
    product_id: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

const OrderItemSchema: Schema = new Schema({
    _id: { type: mongoose.Types.ObjectId, auto: true },
    order_id: { type: mongoose.Types.ObjectId, ref: 'Order' },
    product_id: { type: mongoose.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);