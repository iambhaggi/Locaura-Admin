import mongoose, { Schema, Document } from 'mongoose';

export type RiderPayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface IRiderPayout extends Document {
    _id: mongoose.Types.ObjectId;
    rider_id: mongoose.Types.ObjectId;
    period: {
        from: Date;
        to: Date;
    };
    total_deliveries: number;
    total_earnings: number;
    status: RiderPayoutStatus;
    payout_reference?: string;
    paid_at?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const RiderPayoutSchema = new Schema<IRiderPayout>(
    {
        rider_id: { type: Schema.Types.ObjectId, ref: 'Rider', required: true, index: true },
        period: {
            from: { type: Date, required: true },
            to: { type: Date, required: true }
        },
        total_deliveries: { type: Number, default: 0, required: true },
        total_earnings: { type: Number, default: 0, required: true },
        status: { type: String, enum: ['pending', 'processing', 'paid', 'failed'], default: 'pending' },
        payout_reference: { type: String },
        paid_at: { type: Date }
    },
    { timestamps: true }
);

RiderPayoutSchema.index({ rider_id: 1, 'period.from': 1, 'period.to': 1 });

export const RiderPayout = mongoose.model<IRiderPayout>('RiderPayout', RiderPayoutSchema);