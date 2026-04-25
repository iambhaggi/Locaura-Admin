import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    _id: mongoose.Types.ObjectId;
    order_id: mongoose.Types.ObjectId;
    store_id: mongoose.Types.ObjectId;
    consumer_id: mongoose.Types.ObjectId;
    
    product_id?: mongoose.Types.ObjectId;
    rider_id?: mongoose.Types.ObjectId;
    
    rating: number; // 1 to 5
    title?: string;
    body?: string;
    images: string[];
    
    helpful_votes: number;
    is_verified_purchase: boolean;
    is_hidden: boolean;
    
    reply?: {
        text: string;
        replied_at: Date;
    };
    
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        order_id: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        store_id: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
        consumer_id: { type: Schema.Types.ObjectId, ref: 'Consumer', required: true },
        
        product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
        rider_id: { type: Schema.Types.ObjectId, ref: 'Rider' },
        
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, trim: true },
        body: { type: String, trim: true },
        images: { type: [String], default: [] },
        
        helpful_votes: { type: Number, default: 0 },
        is_verified_purchase: { type: Boolean, default: true },
        is_hidden: { type: Boolean, default: false },
        
        reply: {
            text: { type: String, trim: true },
            replied_at: { type: Date }
        }
    },
    { timestamps: true }
);

// Indexes
ReviewSchema.index({ store_id: 1, rating: -1 });
ReviewSchema.index({ product_id: 1, rating: -1 });
ReviewSchema.index({ consumer_id: 1, order_id: 1 }, { unique: true }); // Ensure one review per order by a consumer

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
