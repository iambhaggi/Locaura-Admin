import jwt from 'jsonwebtoken';
import { RetailerRepository } from '../repositories/RetailerRepository';
import { IRetailer } from '../models/Retailer.model';
import { Logger } from '../utils/logger';

export class AuthService {
    private retailerRepository = new RetailerRepository();

    // Step 1: Send OTP to Phone
    async sendPhoneOTP(phone: string): Promise<boolean> {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        let retailer = await this.retailerRepository.findByPhone(phone);

        if (!retailer) {
            // Initiate partial registration
            retailer = await this.retailerRepository.create({
                phone,
                otp,
                otpExpiry,
                status: 'pending'
            });
        } else {
            // Update existing retailer with new OTP
            await this.retailerRepository.update(retailer._id.toString(), {
                otp,
                otpExpiry
            });
        }

        // SIMULATE SENDING SMS
        Logger.info(`[SMS SIMULATION] Sending OTP ${otp} to phone number ${phone}`, 'Auth');
        
        return true;
    }

    // Step 2: Verify Phone OTP
    async verifyPhoneOTP(phone: string, otp: string): Promise<{ token: string, retailer: IRetailer } | null> {
        const retailer = await this.retailerRepository.findByPhone(phone);

        if (!retailer || !retailer.otp || !retailer.otpExpiry) {
            return null;
        }

        // Check if OTP matches and is not expired
        if (retailer.otp !== otp || retailer.otpExpiry < new Date()) {
            return null;
        }

        // Mark phone as verified and clear OTP
        const updatedRetailer = await this.retailerRepository.update(retailer._id.toString(), {
            phoneVerified: true,
            otp: undefined,
            otpExpiry: undefined
        });

        if (!updatedRetailer) return null;

        // Generate a temporary JWT token for completion of registration
        const token = jwt.sign(
            { id: updatedRetailer._id.toString(), phone: updatedRetailer.phone, role: 'retailer' },
            process.env.JWT_SECRET!,
            { expiresIn: '1h' } // Short duration for registration process
        );

        return { token, retailer: updatedRetailer };
    }

    // Step 3: Complete Registration Profile
    async completeProfile(retailerId: string, profileData: any): Promise<IRetailer | null> {
        // Here we expect business details: storeName, ownerName, email, gstin, bankDetails, panCard, address
        const updatedRetailer = await this.retailerRepository.update(retailerId, {
            ...profileData,
            status: 'pending' // Still pending until admin verification
        });

        return updatedRetailer;
    }

    // Login (for returning users)
    async loginWithOTP(phone: string, otp: string): Promise<{ token: string, retailer: IRetailer } | null> {
        const result = await this.verifyPhoneOTP(phone, otp);
        if (result) {
            // If they are fully registered, give them a longer-lived token
            if (result.retailer.status === 'active') {
                const longLivedToken = jwt.sign(
                    { id: result.retailer._id.toString(), role: 'retailer' },
                    process.env.JWT_SECRET || 'locaura_secret_key',
                    { expiresIn: '7d' }
                );
                return { token: longLivedToken, retailer: result.retailer };
            }
        }
        return result;
    }
}
