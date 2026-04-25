import mongoose, { Schema, Document } from 'mongoose';

export interface IRetailer extends Document {
    _id: mongoose.Types.ObjectId;
    // retailer & store identity
    retailer_name: string;
    pan_card?: string;
    
    // authentication
    email: string;
    phone: string;
    phone_verified: boolean;
    email_verified: boolean;

    // OTP Management
    otp?: string;
    otp_expiry?: Date;

    // Push Notifications
    fcm_token?: string;

}

const RetailerSchema: Schema = new Schema({
    retailer_name: { type: String },
    pan_card: { type: String, sparse: true },
    
    email: { type: String, unique: true, sparse: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    phone_verified: { type: Boolean, default: false },
    email_verified: { type: Boolean, default: false },

    otp: { type: String },
    otp_expiry: { type: Date },

    fcm_token: { type: String },

}, { timestamps: true });

export default mongoose.model<IRetailer>('Retailer', RetailerSchema);
