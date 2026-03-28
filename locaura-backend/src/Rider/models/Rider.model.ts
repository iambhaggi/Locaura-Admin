import mongoose, { Schema, Document } from 'mongoose';
import { RiderStatus } from '../../Retailer/enums/retailer.enum';
// Use snake_case for all fields
export interface IRider extends Document {
    _id: mongoose.Types.ObjectId;
    
    // Identity & Auth
    name: string;
    phone: string;
    email?: string;
    profile_photo?: string;
    date_of_birth?: Date;
    
    // Verification
    phone_verified: boolean;
    otp?: string;
    otp_expiry?: Date;

    // Documents
    aadhaar_number?: string;
    pan_number?: string;
    driving_license_number?: string;
    driving_license_expiry?: Date;
    
    // Vehicle
    vehicle_type?: 'bike' | 'scooter' | 'cycle';
    vehicle_number?: string;
    vehicle_rc?: string;
    
    kyc_status: 'pending' | 'verified' | 'rejected';

    fcm_token?: string;

    // Location & Availability
    current_location?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    is_online: boolean;
    is_available: boolean; // false when actively on a delivery
    service_radius: number; // in km
    assigned_zones: mongoose.Types.ObjectId[];

    // Work & Earnings
    total_deliveries: number;
    total_earnings: number;
    current_order_id?: mongoose.Types.ObjectId;
    
    bank_account_number?: string;
    ifsc_code?: string;
    upi_id?: string;

    // Ratings & Performance
    average_rating: number;
    total_ratings: number;
    cancellation_rate: number;
    late_delivery_rate: number;

    // Status & Meta
    status: RiderStatus;
    onboarded_at?: Date;
    last_active_at?: Date;
    
    createdAt: Date;
    updatedAt: Date;
}

const RiderSchema = new Schema<IRider>(
    {
        name: { type: String, required: true, trim: true },
        phone: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true,
            match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number']
        },
        email: { type: String, trim: true, lowercase: true, sparse: true },
        profile_photo: { type: String },
        date_of_birth: { type: Date },

        phone_verified: { type: Boolean, default: false },
        otp: { type: String },
        otp_expiry: { type: Date },

        aadhaar_number: { type: String, sparse: true },
        pan_number: { type: String, sparse: true },
        driving_license_number: { type: String, sparse: true },
        driving_license_expiry: { type: Date },

        vehicle_type: { type: String, enum: ['bike', 'scooter', 'cycle'] },
        vehicle_number: { type: String },
        vehicle_rc: { type: String },

        kyc_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },

        current_location: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }
        },
        
        is_online: { type: Boolean, default: false },
        is_available: { type: Boolean, default: false },
        service_radius: { type: Number, default: 5 }, // Default radius in km
        assigned_zones: [{ type: Schema.Types.ObjectId, ref: 'Zone' }],

        total_deliveries: { type: Number, default: 0 },
        total_earnings: { type: Number, default: 0 },
        current_order_id: { type: Schema.Types.ObjectId, ref: 'Order' },

        bank_account_number: { type: String },
        ifsc_code: { type: String },
        upi_id: { type: String },

        average_rating: { type: Number, default: 0 },
        total_ratings: { type: Number, default: 0 },
        cancellation_rate: { type: Number, default: 0 },
        late_delivery_rate: { type: Number, default: 0 },

        status: { type: String, enum: Object.values(RiderStatus), default: RiderStatus.PENDING },
        onboarded_at: { type: Date },
        last_active_at: { type: Date }
    },
    { timestamps: true }
);

// Indexes for geospatial queries and fast lookups
RiderSchema.index({ phone: 1 });
RiderSchema.index({ current_location: '2dsphere' });
RiderSchema.index({ is_online: 1, is_available: 1, status: 1 });
RiderSchema.index({ current_order_id: 1 });

export const Rider = mongoose.model<IRider>('Rider', RiderSchema);
