import mongoose, { Schema, Document } from 'mongoose';

export interface IRetailer extends Document {
    _id: mongoose.Types.ObjectId;
    // owner & shop identity
    ownerName: string;
    shopName: string;
    description?: string;

    // contact & social
    email: string;
    phone: string;
    socialLinks?: {
        instagram?: string;
        whatsapp?: string;
    };

    // location (geospatial for proximity search)
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        neighborhood: string; // e.g., "Indiranagar"
    };
    location: {
        type: "Point";
        coordinates: [number, number]; // [Longitude, Latitude]
    };

    // business profile
    storeImages: string[];
    categories: string[]; // ['Men', 'Ethnic', 'Formal']
    businessHours: Array<{
        day: string;
        open: string;
        close: string;
        isClosed: boolean;
    }>;

    // inventory & delivery
    isDeliveryAvailable: boolean;
    gstin?: string;
    status: 'active' | 'inactive' | 'pending';

    // performance
    rating: number;
    totalReviews: number;
}

const RetailerSchema: Schema = new Schema({
    _id: mongoose.Types.ObjectId,
    ownerName: { type: String, required: true },
    shopName: { type: String, required: true, trim: true },
    description: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },

    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        neighborhood: { type: String, required: true }
    },

    // geoJSON for "nearby" searches
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [long, lat]
    },

    storeImages: [{ type: String }],
    categories: [{ type: String }],

    businessHours: [{
        day: { type: String },
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false }
    }],

    isDeliveryAvailable: { type: Boolean, default: false },
    gstin: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
}, { timestamps: true });

// CRITICAL: Index for proximity search
RetailerSchema.index({ location: '2dsphere' });
RetailerSchema.index({ shopName: 'text', description: 'text' });

export default mongoose.model<IRetailer>('Retailer', RetailerSchema);
