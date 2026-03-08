import mongoose, { Schema, Document } from 'mongoose';
import { IAddress, ILocation, AddressSchema, LocationSchema } from './sub-schemas/Address.schema';
import { IBankDetails, BankDetailsSchema } from './sub-schemas/BankDetails.schema';
import { IBusinessHour, BusinessHourSchema } from './sub-schemas/BusinessHours.schema';
import { ISocialLinks, SocialLinksSchema } from './sub-schemas/SocialLinks.schema';
import { BusinessType, RetailerStatus } from '../enums/retailer.enum';

export interface IRetailer extends Document {
    _id: mongoose.Types.ObjectId;
    // owner & shop identity
    owner_name?: string;
    store_name?: string;
    description?: string;
    business_type?: BusinessType;

    // authentication
    email?: string;
    phone: string;
    phone_verified: boolean;
    email_verified: boolean;

    // OTP Management
    otp?: string;
    otp_expiry?: Date;

    // contact & social
    social_links?: ISocialLinks;

    // location / Pickup Address
    address?: IAddress;
    location?: ILocation;

    // bank details
    bank_details?: IBankDetails;

    // identification & tax
    gstin?: string;
    pan_card?: string;

    // business profile
    store_images: string[];
    categories: string[];
    business_hours: IBusinessHour[];

    // status
    is_delivery_available: boolean;
    status: RetailerStatus;

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
        enum: Object.values(BusinessType)
    },

    email: { type: String, unique: true, sparse: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    phone_verified: { type: Boolean, default: false },
    email_verified: { type: Boolean, default: false },

    otp: { type: String },
    otp_expiry: { type: Date },

    social_links: { type: SocialLinksSchema, default: {} },
    address: { type: AddressSchema, default: {} },
    location: { type: LocationSchema, default: { type: 'Point', coordinates: [0, 0] } },
    bank_details: {
        type: BankDetailsSchema, default: {},
        select: false
    },

    gstin: {
        type: String, unique: true,
        // sparse: true, Only include documents in this index if they actually have a value for the gstin field
        sparse: true
    },
    pan_card: {
        type: String, unique: true,
        // sparse: true, Only include documents in this index if they actually have a value for the pan_card field
        sparse: true
    },

    store_images: [{ type: String }],
    categories: [{ type: String }],

    business_hours: [BusinessHourSchema],

    is_delivery_available: { type: Boolean, default: false },
    status: {
        type: String,
        enum: Object.values(RetailerStatus),
        default: RetailerStatus.PENDING
    },
    rating: { type: Number, default: 0 },
    total_reviews: { type: Number, default: 0 }
}, { timestamps: true });

// CRITICAL: Index for proximity search
RetailerSchema.index({ location: '2dsphere' });
RetailerSchema.index({ store_name: 'text', description: 'text' });

export default mongoose.model<IRetailer>('Retailer', RetailerSchema);
