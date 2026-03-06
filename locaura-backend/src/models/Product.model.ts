import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    _id: mongoose.Types.ObjectId;
    category_id: mongoose.Types.ObjectId;
    retailer_id: mongoose.Types.ObjectId;

    name: string;
    description?: string;
    price: number;
    discount_price?: number;
    discount_percentage?: number;
    sku: string;
    stock_quantity: number;
    images?: [string];
    status: 'active' | 'inactive' | 'pending';
    rating?: number;
    total_reviews?: number;
}

const ProductSchema: Schema = new Schema({
    _id: { type: mongoose.Types.ObjectId, auto: true },
    category_id: { type: mongoose.Types.ObjectId, ref: 'Category' },
    retailer_id: { type: mongoose.Types.ObjectId, ref: 'Retailer' },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    images: { type: [String] },
    discount_price: { type: Number },
    discount_percentage: { type: Number },
    sku: { type: String },
    stock_quantity: { type: Number },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
    rating: { type: Number, default: 0 },
    total_reviews: { type: Number, default: 0 }
}, { timestamps: true });

ProductSchema.index({ retailer_id: 1 });
ProductSchema.index({ category_id: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);