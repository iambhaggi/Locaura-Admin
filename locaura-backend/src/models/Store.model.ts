import mongoose, { Schema, Document } from 'mongoose';
import { IAddress, ILocation, AddressSchema, LocationSchema } from './sub-schemas/Address.schema';
import { IBankDetails, BankDetailsSchema } from './sub-schemas/BankDetails.schema';
import { IBusinessHour, BusinessHourSchema } from './sub-schemas/BusinessHours.schema';
import { ISocialLinks, SocialLinksSchema } from './sub-schemas/SocialLinks.schema';
import { BusinessType, RetailerStatus } from '../enums/retailer.enum';

export interface IStore extends Document {
    _id: mongoose.Types.ObjectId;
    owner_id: mongoose.Types.ObjectId;
    
    // shop identity
    store_name: string;
    description?: string;
    business_type?: BusinessType;

    // contact & social
    owner_name: string;
    owner_phone: string;
    owner_email: string;
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

    // status
    is_delivery_available: boolean;
    status: RetailerStatus;

    // performance
    rating: number;
    total_reviews: number;
}

const StoreSchema: Schema = new Schema({
    owner_id: { type: mongoose.Types.ObjectId, ref: 'Retailer', required: true, index: true },
    
    store_name: { type: String, trim: true, required: true },
    description: { type: String },
    business_type: {
        type: String,
        enum: Object.values(BusinessType)
    },
    owner_name: { type: String, required: true },
    owner_phone: { type: String, required: true },
    owner_email: { type: String, required: true },
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
StoreSchema.index({ location: '2dsphere' });
StoreSchema.index({ store_name: 'text', description: 'text' });

export default mongoose.model<IStore>('Store', StoreSchema);
