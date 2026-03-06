import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem extends Document {
    _id: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

const OrderItemSchema: Schema = new Schema({
    _id: mongoose.Types.ObjectId,
    orderId: { type: mongoose.Types.ObjectId, ref: 'Order' },
    productId: { type: mongoose.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);    