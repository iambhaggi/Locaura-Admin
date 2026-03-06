import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    _id: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    retailer_id: mongoose.Types.ObjectId;
    product_id: mongoose.Types.ObjectId;
    quantity: number;
    total_price: number;
    payment_method: 'cod' | 'online';
    payment_status: 'pending' | 'completed' | 'failed';
    order_status: 'pending' | 'accepted' | 'shipped' | 'delivered' | 'cancelled';
}

const OrderSchema: Schema = new Schema({
    _id: { type: mongoose.Types.ObjectId, auto: true },
    user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
    retailer_id: { type: mongoose.Types.ObjectId, ref: 'Retailer' },
    product_id: { type: mongoose.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    total_price: { type: Number, required: true },
    payment_method: { type: String, enum: ['cod', 'online'], default: 'cod' },
    payment_status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    order_status: { type: String, enum: ['pending', 'accepted', 'shipped', 'delivered', 'cancelled'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);