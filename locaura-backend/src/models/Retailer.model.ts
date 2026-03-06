import mongoose, { Schema, Document } from 'mongoose';

export interface IRetailer extends Document {
    _id: mongoose.Types.ObjectId;
    // owner & shop identity
    owner_name?: string;
    store_name?: string;
    description?: string;
    business_type?: 'Individual' | 'Partnership' | 'Private Limited' | 'Public Limited';

    // authentication
    email?: string;
    phone: string;
    phone_verified: boolean;
    email_verified: boolean;
    
    // OTP Management
    otp?: string;
    otp_expiry?: Date;

    // contact & social
    social_links?: {
        instagram?: string;
        whatsapp?: string;
    };

    // location / Pickup Address
    address?: {
        street: string;
        city: string;
        state: string;
        zip_code: string;
        neighborhood: string;
    };
    location?: {
        type: "Point";
        coordinates: [number, number]; // [Longitude, Latitude]
    };

    // bank details
    bank_details?: {
        account_number: string;
        ifsc_code: string;
        account_holder_name: string;
    };

    // identification & tax
    gstin?: string;
    pan_card?: string;

    // business profile
    store_images: string[];
    categories: string[];
    business_hours: Array<{
        day: string;
        open: string;
        close: string;
        is_closed: boolean;
    }>;

    // status
    is_delivery_available: boolean;
    status: 'active' | 'inactive' | 'pending' | 'suspended';

    // performance
    rating: number;
    total_reviews: number;
}

const RetailerSchema: Schema = new Schema({
    owner_name: { type: String },
    store_name: { type: String, trim: true },
    description: { type: String },
    business_type: { 
        type: String, 
        enum: ['Individual', 'Partnership', 'Private Limited', 'Public Limited']
    },

    email: { type: String, unique: true, sparse: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    phone_verified: { type: Boolean, default: false },
    email_verified: { type: Boolean, default: false },

    otp: { type: String },
    otp_expiry: { type: Date },

    social_links: {
        instagram: { type: String },
        whatsapp: { type: String }
    },

    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zip_code: { type: String },
        neighborhood: { type: String }
    },

    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [long, lat]
    },

    bank_details: {
        account_number: { type: String },
        ifsc_code: { type: String },
        account_holder_name: { type: String }
    },

    gstin: { type: String, unique: true, sparse: true },
    pan_card: { type: String, unique: true, sparse: true },

    store_images: [{ type: String }],
    categories: [{ type: String }],

    business_hours: [{
        day: { type: String },
        open: { type: String },
        close: { type: String },
        is_closed: { type: Boolean, default: false }
    }],

    is_delivery_available: { type: Boolean, default: false },
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'pending', 'suspended'], 
        default: 'pending' 
    },
    rating: { type: Number, default: 0 },
    total_reviews: { type: Number, default: 0 }
}, { timestamps: true });

// CRITICAL: Index for proximity search
RetailerSchema.index({ location: '2dsphere' });
RetailerSchema.index({ store_name: 'text', description: 'text' });

export default mongoose.model<IRetailer>('Retailer', RetailerSchema);
