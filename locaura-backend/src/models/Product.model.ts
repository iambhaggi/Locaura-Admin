import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    _id: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId;
    retailerId: mongoose.Types.ObjectId;

    name: string;
    description?: string;
    price: number;
    discountPrice?: number;
    discountPercentage?: number;
    sku: string;
    stockQuantity: number;
    images?: [string];
    status: 'active' | 'inactive' | 'pending';
    rating?: number;
    totalReviews?: number;
}

const ProductSchema: Schema = new Schema({
    _id: mongoose.Types.ObjectId,
    categoryId: { type: mongoose.Types.ObjectId, ref: 'Category' },
    retailerId: { type: mongoose.Types.ObjectId, ref: 'Retailer' },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    images: { type: [String] },
    discountPrice: { type: Number },
    discountPercentage: { type: Number },
    sku: { type: String },
    stockQuantity: { type: Number },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

ProductSchema.index({ retailerId: 1 });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);