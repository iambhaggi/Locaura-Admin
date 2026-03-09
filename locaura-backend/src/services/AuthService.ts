import jwt from 'jsonwebtoken';
import { RetailerRepository } from '../repositories/RetailerRepository';
import { StoreRepository } from '../repositories/StoreRepository';
import { IRetailer } from '../models/Retailer.model';
import { IStore } from '../models/Store.model';
import { Logger } from '../utils/logger';
import { RetailerStatus } from '../enums/retailer.enum';

export class AuthService {
    private owner_repository = new RetailerRepository();
    private store_repository = new StoreRepository();

    // Step 1: Send OTP to Phone
    async send_phone_otp(phone: string): Promise<boolean> {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        let owner = await this.owner_repository.find_by_phone(phone);

        if (!owner) {
            // Initiate partial registration
            owner = await this.owner_repository.create({
                phone,
                otp,
                otp_expiry
            });
        } else {
            // Update existing owner with new OTP
            await this.owner_repository.update(owner._id.toString(), {
                otp,
                otp_expiry
            });
        }

        // SIMULATE SENDING SMS
        Logger.info(`[SMS SIMULATION] Sending OTP ${otp} to phone number ${phone}`, 'Auth');
        
        return true;
    }

    // Step 2: Verify Phone OTP
    async verify_phone_otp(phone: string, otp: string): Promise<{ token: string, owner: IRetailer, stores: IStore[] } | null> {
        const owner = await this.owner_repository.find_by_phone(phone);

        if (!owner || !owner.otp || !owner.otp_expiry) {
            return null;
        }

        // Check if OTP matches and is not expired
        if (owner.otp !== otp || owner.otp_expiry < new Date()) {
            return null;
        }

        // Mark phone as verified and clear OTP
        const updated_owner = await this.owner_repository.update(owner._id.toString(), {
            phone_verified: true,
            otp: undefined,
            otp_expiry: undefined
        });

        if (!updated_owner) return null;

        // Fetch user's stores if any exist yet
        const stores = await this.store_repository.find_by_owner_id(updated_owner._id.toString());

        // Generate a temporary JWT token for completion of registration or regular login
        const token = jwt.sign(
            { id: updated_owner._id.toString(), phone: updated_owner.phone, role: 'retailer' },
            process.env.JWT_SECRET!,
            { expiresIn: stores.length > 0 ? '7d' : '1h' } // Give 7 days if they have stores, otherwise 1 hour to complete profile
        );

        return { token, owner: updated_owner, stores };
    }

    // Step 3: Complete Registration Profile 
    // This updates their owner details
    async complete_profile(owner_id: any, owner_data: Partial<IRetailer>): Promise<{ owner: IRetailer } | null> {

        // 1. Update the Owner (adding email, owner_name, pan_card, etc)
        const updated_owner = await this.owner_repository.update(owner_id, owner_data);
        if (!updated_owner) return null;

        return {
            owner: updated_owner
        };
    }
}
