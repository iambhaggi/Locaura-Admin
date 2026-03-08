import jwt from 'jsonwebtoken';
import { RetailerRepository } from '../repositories/RetailerRepository';
import { IRetailer } from '../models/Retailer.model';
import { Logger } from '../utils/logger';
import { RetailerStatus } from '../enums/retailer.enum';

export class AuthService {
    private retailer_repository = new RetailerRepository();

    // Step 1: Send OTP to Phone
    async send_phone_otp(phone: string): Promise<boolean> {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        let retailer = await this.retailer_repository.find_by_phone(phone);

        if (!retailer) {
            // Initiate partial registration
            retailer = await this.retailer_repository.create({
                phone,
                otp,
                otp_expiry,
                status: RetailerStatus.PENDING
            });
        } else {
            // Update existing retailer with new OTP
            await this.retailer_repository.update(retailer._id.toString(), {
                otp,
                otp_expiry
            });
        }

        // SIMULATE SENDING SMS
        Logger.info(`[SMS SIMULATION] Sending OTP ${otp} to phone number ${phone}`, 'Auth');
        
        return true;
    }

    // Step 2: Verify Phone OTP
    async verify_phone_otp(phone: string, otp: string): Promise<{ token: string, retailer: IRetailer } | null> {
        const retailer = await this.retailer_repository.find_by_phone(phone);

        if (!retailer || !retailer.otp || !retailer.otp_expiry) {
            return null;
        }

        // Check if OTP matches and is not expired
        if (retailer.otp !== otp || retailer.otp_expiry < new Date()) {
            return null;
        }

        // Mark phone as verified and clear OTP
        const updated_retailer = await this.retailer_repository.update(retailer._id.toString(), {
            phone_verified: true,
            otp: undefined,
            otp_expiry: undefined
        });

        if (!updated_retailer) return null;

        // Generate a temporary JWT token for completion of registration
        const token = jwt.sign(
            { id: updated_retailer._id.toString(), phone: updated_retailer.phone, role: 'retailer' },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' } // Short duration for registration process
        );

        return { token, retailer: updated_retailer };
    }

    // Step 3: Complete Registration Profile
    async complete_profile(retailer_id: any, profile_data: any): Promise<IRetailer | null> {
        const updated_retailer = await this.retailer_repository.update(retailer_id, {
            ...profile_data,
            status: RetailerStatus.PENDING // Still pending until admin verification
        });

        return updated_retailer;
    }

    // Login (for returning users)
    async login_with_otp(phone: string, otp: string): Promise<{ token: string, retailer: IRetailer } | null> {
        const result = await this.verify_phone_otp(phone, otp);
        if (result) {
            // If they are fully registered, give them a longer-lived token
            if (result.retailer.status === RetailerStatus.ACTIVE) {
                const long_lived_token = jwt.sign(
                    { id: result.retailer._id.toString(), role: 'retailer' },
                    process.env.JWT_SECRET || 'locaura_secret_key',
                    { expiresIn: '7d' }
                );
                return { token: long_lived_token, retailer: result.retailer };
            }
        }
        return result;
    }
}
