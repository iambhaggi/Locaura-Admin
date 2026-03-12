import mongoose, { Schema, Document } from 'mongoose';
import { IAddress, ILocation, AddressSchema, LocationSchema } from './sub-schemas/Address.schema';
import { IBankDetails, BankDetailsSchema } from './sub-schemas/BankDetails.schema';
import { IBusinessHour, BusinessHourSchema } from './sub-schemas/BusinessHours.schema';
import { ISocialLinks, SocialLinksSchema } from './sub-schemas/SocialLinks.schema';
import { BusinessType, RetailerStatus } from '../enums/retailer.enum';

export interface IStore extends Document {
    _id: mongoose.Types.ObjectId;
    retailer_id: mongoose.Types.ObjectId;
    
    // shop identity
    store_name: string;
    slug?: string;
    description?: string;
    business_type?: BusinessType;
    logo_url?: string;
    banner_url?: string;

    // contact & social
    retailer_name: string;
    retailer_phone: string;
    retailer_email: string;
    social_links?: ISocialLinks;

    // location / Pickup Address
    address?: IAddress;
    location?: ILocation;

    // bank details and tax info
    pan_card?: string;
    gstin?: string;
    // make sure store address is same as fssai license address
    fssai_license?: string; // Food Safety and Standards Authority of India
    bank_details?: IBankDetails;

    // business profile
    store_images: string[];
    categories: string[];
    business_hours: IBusinessHour[];

    // delivery & order config
    delivery_radius_km: number;
    min_order_amount: number;
    delivery_fee: number;

    // status
    is_delivery_available: boolean;
    is_active: boolean;
    status: RetailerStatus;
    is_open_now?: boolean;// to handle real-time business hours

    // performance
    rating: number;
    total_reviews: number;
}

const StoreSchema: Schema = new Schema({
    retailer_id: { type: mongoose.Types.ObjectId, ref: 'Retailer', required: true, index: true },
    
    store_name: { type: String, trim: true, required: true },
    slug: { type: String, trim: true, lowercase: true },
    description: { type: String },
    business_type: {
        type: String,
        enum: Object.values(BusinessType)
    },
    logo_url: { type: String },
    banner_url: { type: String },
    retailer_name: { type: String, required: true },
    retailer_phone: { type: String, required: true },
    retailer_email: { type: String, required: true },
    social_links: { type: SocialLinksSchema, default: {} },
    address: { type: AddressSchema, default: {} },
    location: { type: LocationSchema, default: { type: 'Point', coordinates: [0, 0] } },
    
    bank_details: {
        type: BankDetailsSchema, default: {},
        select: false
    },
    gstin: {
        type: String, unique: true,
        sparse: true
    },
    fssai_license: { type: String },

    store_images: [{ type: String }],
    categories: [{ type: String }],

    business_hours: [BusinessHourSchema],

    delivery_radius_km: { type: Number, default: 10 },
    min_order_amount: { type: Number, default: 0 },
    delivery_fee: { type: Number, default: 0 },

    is_delivery_available: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true, index: true },
    status: {
        type: String,
        enum: Object.values(RetailerStatus),
        default: RetailerStatus.PENDING
    },
    rating: { type: Number, default: 0 },
    total_reviews: { type: Number, default: 0 }
}, { timestamps: true });

// CRITICAL: Index for proximity search
StoreSchema.index({ location: '2dsphere' });
StoreSchema.index({ slug: 1, retailer_id: 1 }, { unique: true, sparse: true });
StoreSchema.index({ store_name: 'text', description: 'text' });

export default mongoose.model<IStore>('Store', StoreSchema);
