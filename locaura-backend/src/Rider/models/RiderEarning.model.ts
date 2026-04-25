import mongoose, { Schema, Document } from 'mongoose';

export interface IRiderEarning extends Document {
    _id: mongoose.Types.ObjectId;
    rider_id: mongoose.Types.ObjectId;
    order_id: mongoose.Types.ObjectId;
    
    delivery_fee_earned: number;
    bonus?: number;
    
    status: 'pending' | 'settled';
    settled_at?: Date;
    
    createdAt: Date;
    updatedAt: Date;
}

const RiderEarningSchema = new Schema<IRiderEarning>(
    {
        rider_id: { type: Schema.Types.ObjectId, ref: 'Rider', required: true, index: true },
        order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
        
        delivery_fee_earned: { type: Number, required: true },
        bonus: { type: Number, default: 0 },
        
        status: { type: String, enum: ['pending', 'settled'], default: 'pending' },
        settled_at: { type: Date }
    },
    { timestamps: true }
);

export const RiderEarning = mongoose.model<IRiderEarning>('RiderEarning', RiderEarningSchema);
