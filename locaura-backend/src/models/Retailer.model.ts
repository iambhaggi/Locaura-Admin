import mongoose, { Schema, Document } from 'mongoose';

export interface IRetailer extends Document {
    // owner & shop identity
    ownerName?: string;
    storeName?: string;
    description?: string;
    businessType?: 'Individual' | 'Partnership' | 'Private Limited' | 'Public Limited';

    // authentication
    email?: string;
    phone: string;
    phoneVerified: boolean;
    emailVerified: boolean;
    
    // OTP Management
    otp?: string;
    otpExpiry?: Date;

    // contact & social
    socialLinks?: {
        instagram?: string;
        whatsapp?: string;
    };

    // location / Pickup Address
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        neighborhood: string;
    };
    location?: {
        type: "Point";
        coordinates: [number, number]; // [Longitude, Latitude]
    };

    // bank details
    bankDetails?: {
        accountNumber: string;
        ifscCode: string;
        accountHolderName: string;
    };

    // identification & tax
    gstin?: string;
    panCard?: string;

    // business profile
    storeImages: string[];
    categories: string[];
    businessHours: Array<{
        day: string;
        open: string;
        close: string;
        isClosed: boolean;
    }>;

    // status
    isDeliveryAvailable: boolean;
    status: 'active' | 'inactive' | 'pending' | 'suspended';

    // performance
    rating: number;
    totalReviews: number;
}

const RetailerSchema: Schema = new Schema({
    ownerName: { type: String },
    storeName: { type: String, trim: true },
    description: { type: String },
    businessType: { 
        type: String, 
        enum: ['Individual', 'Partnership', 'Private Limited', 'Public Limited']
    },

    email: { type: String, unique: true, sparse: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },

    otp: { type: String },
    otpExpiry: { type: Date },

    socialLinks: {
        instagram: { type: String },
        whatsapp: { type: String }
    },

    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        neighborhood: { type: String }
    },

    // geoJSON for "nearby" searches
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [long, lat]
    },

    bankDetails: {
        accountNumber: { type: String },
        ifscCode: { type: String },
        accountHolderName: { type: String }
    },

    gstin: { type: String, unique: true, sparse: true },
    panCard: { type: String, unique: true, sparse: true },

    storeImages: [{ type: String }],
    categories: [{ type: String }],

    businessHours: [{
        day: { type: String },
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false }
    }],

    isDeliveryAvailable: { type: Boolean, default: false },
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'pending', 'suspended'], 
        default: 'pending' 
    },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

// CRITICAL: Index for proximity search
RetailerSchema.index({ location: '2dsphere' });
RetailerSchema.index({ storeName: 'text', description: 'text' });

export default mongoose.model<IRetailer>('Retailer', RetailerSchema);
