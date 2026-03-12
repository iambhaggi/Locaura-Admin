import jwt from 'jsonwebtoken';
import { RetailerRepository } from '../repositories/RetailerRepository';
import { StoreRepository } from '../repositories/StoreRepository';
import { IRetailer } from '../models/Retailer.model';
import { IStore } from '../models/Store.model';
import { Logger } from '../../utils/logger';
import { RetailerStatus } from '../enums/retailer.enum';

export class AuthService {
    private retailer_repository = new RetailerRepository();
    private store_repository = new StoreRepository();

    // Constant for Play Store review and internal testing
    private TEST_NUMBERS = [
        '9999999999', // standard test number
        '8888888888', // alternate test number
        '7777777777'  // extra buffer test number
    ];
    private STATIC_TEST_OTP = '123456';

    // Step 1: Send OTP to Phone
    async send_phone_otp(phone: string): Promise<boolean> {
        // Generate a 6-digit OTP, unless it's a test number
        const is_test_number = this.TEST_NUMBERS.includes(phone);
        const otp = is_test_number
            ? this.STATIC_TEST_OTP
            : Math.floor(100000 + Math.random() * 900000).toString();

        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        let retailer = await this.retailer_repository.find_by_phone(phone);

        if (!retailer) {
            // Initiate partial registration
            retailer = await this.retailer_repository.create({
                phone,
                otp,
                otp_expiry
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
    async verify_phone_otp(phone: string, otp: string): Promise<{ token: string, retailer: IRetailer, stores: IStore[] } | null> {
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

        // Fetch user's stores if any exist yet
        const stores = await this.store_repository.find_by_retailer_id(updated_retailer._id.toString());

        // Generate a temporary JWT token for completion of registration or regular login
        const token = jwt.sign(
            { id: updated_retailer._id.toString(), phone: updated_retailer.phone, role: 'retailer' },
            process.env.JWT_SECRET!,
            { expiresIn: stores.length > 0 ? '7d' : '1h' } // Give 7 days if they have stores, otherwise 1 hour to complete profile
        );

        return { token, retailer: updated_retailer, stores };
    }

    // Step 3: Complete Registration Profile 
    // This updates their retailer details
    async complete_profile(retailer_id: any, retailer_data: Partial<IRetailer>): Promise<{ retailer: IRetailer } | null> {

        // 1. Update the Retailer (adding email, retailer_name, pan_card, etc)
        const updated_retailer = await this.retailer_repository.update(retailer_id, retailer_data);
        if (!updated_retailer) return null;

        return {
            retailer: updated_retailer
        };
    }
}
