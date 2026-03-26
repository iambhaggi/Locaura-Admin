import { RiderRepository } from '../repositories/RiderRepository';
import { RiderStatus } from '../../Retailer/enums/retailer.enum';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';

export class AuthService {
    private rider_repository = new RiderRepository();

    async send_otp(phone: string, name?: string): Promise<{ success: boolean; message: string }> {
        let rider = await this.rider_repository.find_by_phone(phone);

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        if (!rider) {
            // Create new pending rider account
            rider = await this.rider_repository.create({
                phone,
                name: name || 'Rider',
                status: RiderStatus.PENDING,
                otp,
                otp_expiry
            });
        } else {
            await this.rider_repository.update(rider._id as unknown as string, {
                otp,
                otp_expiry,
                name: name ? name : rider.name // Update name if provided during fresh intent
            });
        }

        // TODO: Integrate actual SMS gateway (e.g., Twilio, AWS SNS)
        console.log(`[Rider Auth] MOCK SMS: OTP for ${phone} is ${otp}`);

        return { success: true, message: 'OTP sent successfully' };
    }

    async verify_otp(phone: string, otp: string): Promise<{ success: boolean; token?: string; message: string; rider?: any }> {
        const rider = await this.rider_repository.find_by_phone(phone);

        if (!rider) {
            return { success: false, message: 'Rider not found' };
        }

        if (rider.otp !== otp) {
            return { success: false, message: 'Invalid OTP' };
        }

        if (rider.otp_expiry && rider.otp_expiry < new Date()) {
            return { success: false, message: 'OTP expired' };
        }

        if (rider.status === RiderStatus.SUSPENDED || rider.status === RiderStatus.REJECTED) {
            return { success: false, message: 'Your account is suspended or rejected.' };
        }

        // Clear OTP & mark verified
        const updated_rider = await this.rider_repository.update(rider._id as unknown as string, {
            otp: undefined,
            otp_expiry: undefined,
            phone_verified: true,
            // If they were pending and just verified phone, they still remain pending until KYC
        });

        const token = jwt.sign(
            { id: updated_rider?._id, phone: updated_rider?.phone, role: 'rider' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        return { 
            success: true, 
            message: 'Login successful', 
            token, 
            rider: updated_rider 
        };
    }
}
