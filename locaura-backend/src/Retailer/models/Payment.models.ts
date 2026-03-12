import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    _id: mongoose.Types.ObjectId;
    order_id: mongoose.Types.ObjectId;
    transaction_id: string;
    amount: number;
    payment_method: 'cod' | 'online';
    payment_status: 'pending' | 'completed' | 'failed';
}

const PaymentSchema: Schema = new Schema({
    _id: { type: mongoose.Types.ObjectId, auto: true },
    order_id: { type: mongoose.Types.ObjectId, ref: 'Order' },
    transaction_id: { type: String, required: true },
    amount: { type: Number, required: true },
    payment_method: { type: String, required: true },
    payment_status: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', PaymentSchema);