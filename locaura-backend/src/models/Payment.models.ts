import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    _id: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    transactionId: string;
    amount: number;
    paymentMethod: 'cod' | 'online';
    paymentStatus: 'pending' | 'completed' | 'failed';
}

const PaymentSchema: Schema = new Schema({
    _id: mongoose.Types.ObjectId,
    orderId: { type: mongoose.Types.ObjectId, ref: 'Order' },
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', PaymentSchema);