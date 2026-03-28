import { RiderRepository } from '../repositories/RiderRepository';
import { RiderStatus } from '../../Retailer/enums/retailer.enum';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';

export class AuthService {
    private rider_repository = new RiderRepository();

    // Constant for App/Play Store review and internal testing bypass
    private TEST_NUMBERS = [
        '9999999999', // standard test number
        '8888888888', // alternate test number
        '7777777777'  // extra buffer test number
    ];
    private STATIC_TEST_OTP = '1234';

    async send_otp(phone: string, name?: string): Promise<{ success: boolean; message: string }> {
        let rider = await this.rider_repository.find_by_phone(phone);

        // Generate 4-digit OTP, unless it's a test number bypass
        const is_test_number = this.TEST_NUMBERS.includes(phone);
        const otp = is_test_number
            ? this.STATIC_TEST_OTP
            : Math.floor(1000 + Math.random() * 9000).toString();
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

    async verify_otp(phone: string, otp: string): Promise<{ success: boolean; message: string; data?: any }> {
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

        // 3. Log developer friendly message to console
        const developer_msg = `Auth Successful: Rider ${updated_rider?.phone} (${updated_rider?._id}) logged in. Role: rider.`;
        require('../../utils/logger').Logger.success(developer_msg, 'RiderAuth');

        return { 
            success: true, 
            message: `Welcome back, ${updated_rider?.name || 'Rider'}! You're ready to start delivering.`,
            data: {
                rider: updated_rider,
                token: token
            } 
        };
    }
}
