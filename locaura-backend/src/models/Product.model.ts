import mongoose, { Schema, Document } from 'mongoose';

// 1. Dynamic Attributes: For generic fields like "Material: Cotton", "Brand: Nike", "Weight: 1kg"
export interface IProductAttribute {
    name: string;   
    value: string;  
}

// 2. Variants: For variations of the same product (e.g., Size S, M, L or different colors)
export interface IProductVariant {
    name?: string;     // e.g., 'Red - Size L'
    sku?: string;
    price?: number;    // Optional override for the base price
    stock_quantity: number;
    attributes: IProductAttribute[]; // Specific attributes for this variant
}

export interface IProduct extends Document {
    _id: mongoose.Types.ObjectId;
    category_id?: mongoose.Types.ObjectId;
    store_id: mongoose.Types.ObjectId; 

    name: string;
    description?: string;
    
    // Base pricing and stock
    price: number;
    discount_price?: number;
    discount_percentage?: number;
    sku?: string;
    stock_quantity: number;
    
    // Product Type/Category generic attributes. Allows extending to ANY product type.
    attributes: IProductAttribute[];
    
    // Optional variants (for clothes: sizes/colors. For electronics: storage capacity)
    variants?: IProductVariant[];

    images: string[];
    
    status: 'draft' | 'active' | 'inactive';
    rating: number;
    total_reviews: number;
}

const ProductAttributeSchema = new Schema({
    name: { type: String, required: true },
    value: { type: String, required: true }
}, { _id: false });

const ProductVariantSchema = new Schema({
    name: { type: String },
    sku: { type: String },
    price: { type: Number },
    stock_quantity: { type: Number, required: true, default: 0 },
    attributes: [ProductAttributeSchema]
});

const ProductSchema: Schema = new Schema({
    category_id: { type: mongoose.Types.ObjectId, ref: 'Category', index: true },
    store_id: { type: mongoose.Types.ObjectId, ref: 'Store', required: true, index: true },

    name: { type: String, required: true, trim: true },
    description: { type: String },
    
    price: { type: Number, required: true },
    discount_price: { type: Number },
    discount_percentage: { type: Number },
    sku: { type: String },
    stock_quantity: { type: Number, required: true, default: 0 },
    
    attributes: [ProductAttributeSchema],
    variants: [ProductVariantSchema],

    images: { type: [String], default: [] },
    
    status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'draft' },
    rating: { type: Number, default: 0 },
    total_reviews: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes for faster lookups (e.g., getting all active products for a store)
ProductSchema.index({ store_id: 1, status: 1 });
// Added attributes.value to text index so users can search by brand or material
ProductSchema.index({ name: 'text', description: 'text', 'attributes.value': 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);