import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from '../enums/order.enum';

export interface IPayment extends Document {
    _id: mongoose.Types.ObjectId;
    order_id: mongoose.Types.ObjectId;
    consumer_id: mongoose.Types.ObjectId;
    retailer_id: mongoose.Types.ObjectId;
    
    amount: number;
    currency: string;
    
    method: 'COD' | 'UPI' | 'CARD' | 'WALLET' | 'NETBANKING';
    gateway: 'razorpay' | 'manual' | 'cod';
    
    gateway_order_id?: string; // Razorpay order_id
    gateway_payment_id?: string; // Razorpay payment_id
    gateway_signature?: string;
    
    status: PaymentStatus;
    failure_reason?: string;
    
    refund_id?: string;
    refunded_at?: Date;
    refund_amount?: number;
    
    metadata?: Map<string, any>; // Store raw gateway webhook data
    
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
    order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    consumer_id: { type: Schema.Types.ObjectId, ref: 'Consumer', required: true, index: true },
    retailer_id: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true },
    
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    
    method: { type: String, enum: ['COD', 'UPI', 'CARD', 'WALLET', 'NETBANKING'], required: true },
    gateway: { type: String, enum: ['razorpay', 'manual', 'cod'], required: true },
    
    gateway_order_id: { type: String, sparse: true, index: true },
    gateway_payment_id: { type: String, sparse: true },
    gateway_signature: { type: String },
    
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    failure_reason: { type: String },
    
    refund_id: { type: String },
    refunded_at: { type: Date },
    refund_amount: { type: Number },
    
    metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', PaymentSchema);