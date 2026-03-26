import mongoose, { Schema, Document } from 'mongoose';
import { PayoutStatus } from '../enums/retailer.enum';

export interface IPayout extends Document {
    _id: mongoose.Types.ObjectId;
    retailer_id: mongoose.Types.ObjectId;
    store_id: mongoose.Types.ObjectId;
    
    period: {
        from: Date;
        to: Date;
    };
    
    total_orders: number;
    total_revenue: number;
    platform_fee: number; // locaura cut
    net_payout: number;
    
    status: PayoutStatus;
    
    payout_reference?: string; // UTR or razorpay payout ID
    paid_at?: Date;
    
    createdAt: Date;
    updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
    {
        retailer_id: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true, index: true },
        store_id: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
        
        period: {
            from: { type: Date, required: true },
            to: { type: Date, required: true }
        },
        
        total_orders: { type: Number, required: true, default: 0 },
        total_revenue: { type: Number, required: true, default: 0 },
        platform_fee: { type: Number, required: true, default: 0 },
        net_payout: { type: Number, required: true, default: 0 },
        
        status: { type: String, enum: Object.values(PayoutStatus), default: PayoutStatus.PENDING },
        
        payout_reference: { type: String },
        paid_at: { type: Date }
    },
    { timestamps: true }
);

PayoutSchema.index({ store_id: 1, 'period.from': 1, 'period.to': 1 });

export const Payout = mongoose.model<IPayout>('Payout', PayoutSchema);
