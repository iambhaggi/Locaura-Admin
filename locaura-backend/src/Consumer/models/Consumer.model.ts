import mongoose, { Schema, Document } from 'mongoose';

export interface IConsumerAddress {
    _id?: mongoose.Types.ObjectId;
    label: string; // e.g. "Home", "Office"
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
    location?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
}

export interface ICartItem {
    variant_id: mongoose.Types.ObjectId;
    quantity: number;
    product_name?: string;
    brand_name?: string;
    price?: number;
    thumb_url?: string;
}

export interface IConsumerCart {
    store_id?: mongoose.Types.ObjectId;
    store_name?: string;
    items: ICartItem[];
    subtotal?: number;
    platform_fee?: number;
    delivery_fee?: number;
    total?: number;
}

export interface IConsumer extends Document {
    _id: mongoose.Types.ObjectId;
    phone: string;
    otp?: string;
    otp_expiry?: Date;
    phone_verified: boolean;
    
    consumer_name?: string;
    email?: string;
    
    addresses: IConsumerAddress[];
    cart: IConsumerCart;
    
    fcm_token?: string;
    
    status: 'active' | 'suspended' | 'deleted';
    
    createdAt: Date;
    updatedAt: Date;
}

const AddressSchema = new Schema<IConsumerAddress>(
    {
        label: { type: String, required: true, trim: true },
        line1: { type: String, required: true },
        line2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        is_default: { type: Boolean, default: false },
        location: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: false } // [longitude, latitude]
        }
    },
    { _id: true }
);

const CartItemSchema = new Schema<ICartItem>(
    {
        variant_id: { type: Schema.Types.ObjectId, ref: 'ChildProduct', required: true },
        quantity: { type: Number, required: true, min: 1 },
        product_name: { type: String },
        brand_name: { type: String },
        price: { type: Number },
        thumb_url: { type: String }
    },
    { _id: false }
);

const CartSchema = new Schema<IConsumerCart>(
    {
        store_id: { type: Schema.Types.ObjectId, ref: 'Store' },
        store_name: { type: String },
        items: { type: [CartItemSchema], default: () => [] },
        subtotal: { type: Number, default: 0 },
        platform_fee: { type: Number, default: 0 },
        delivery_fee: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    { _id: false }
);

const ConsumerSchema = new Schema<IConsumer>(
    {
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number']
        },
        otp: { type: String },
        otp_expiry: { type: Date },
        phone_verified: { type: Boolean, default: false },

        consumer_name: { type: String, trim: true },
        email: { 
            type: String, 
            trim: true, 
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'] 
        },

        addresses: { type: [AddressSchema], default: () => [] },
        cart: { type: CartSchema, default: () => ({ items: [] }) },

        fcm_token: { type: String },

        status: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
    },
    { timestamps: true }
);

// Search and performance indexes
ConsumerSchema.index({ phone: 1 });
ConsumerSchema.index({ email: 1 });
ConsumerSchema.index({ status: 1 });

export const Consumer = mongoose.model<IConsumer>('Consumer', ConsumerSchema);
