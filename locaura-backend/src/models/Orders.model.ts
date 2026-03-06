import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    retailerId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    quantity: number;
    totalPrice: number;
    paymentMethod: 'cod' | 'online';
    paymentStatus: 'pending' | 'completed' | 'failed';
    orderStatus: 'pending' | 'accepted' | 'shipped' | 'delivered' | 'cancelled';
}

const OrderSchema: Schema = new Schema({
    _id: mongoose.Types.ObjectId,
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    retailerId: { type: mongoose.Types.ObjectId, ref: 'Retailer' },
    productId: { type: mongoose.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);