import jwt from 'jsonwebtoken';
import { ConsumerRepository } from '../repositories/ConsumerRepository';
import { IConsumer } from '../models/Consumer.model';
import { Logger } from '../../utils/logger';

export class AuthService {
    private consumer_repository = new ConsumerRepository();

    // Constant for App/Play Store review and internal testing bypass
    private TEST_NUMBERS = [
        '9999999999', // standard test number
        '8888888888', // alternate test number
        '7777777777'  // extra buffer test number
    ];
    private STATIC_TEST_OTP = '123456';

    // Step 1: Send OTP to Phone
    async send_phone_otp(phone: string): Promise<boolean> {
        // Generate a 6-digit OTP, unless it's a test number bypass
        const is_test_number = this.TEST_NUMBERS.includes(phone);
        const otp = is_test_number
            ? this.STATIC_TEST_OTP
            : Math.floor(100000 + Math.random() * 900000).toString();

        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        let consumer = await this.consumer_repository.find_by_phone(phone);

        if (!consumer) {
            // Initiate partial registration
            consumer = await this.consumer_repository.create({
                phone,
                otp,
                otp_expiry
            });
        } else {
            // Update existing consumer with new OTP
            await this.consumer_repository.update(consumer._id.toString(), {
                otp,
                otp_expiry
            });
        }

        // TODO: SIMULATE SENDING SMS USING AWS SNS OR TWILIO
        Logger.info(`[SMS SIMULATION] Sending OTP ${otp} to consumer phone number ${phone}`, 'ConsumerAuth');
        
        return true;
    }

    // Step 2: Verify Phone OTP
    async verify_phone_otp(phone: string, otp: string): Promise<{ token: string, consumer: IConsumer } | null> {
        const consumer = await this.consumer_repository.find_by_phone(phone);

        if (!consumer || !consumer.otp || !consumer.otp_expiry) {
            return null;
        }

        // Check if OTP matches and is not expired
        if (consumer.otp !== otp || consumer.otp_expiry < new Date()) {
            return null;
        }

        // Mark phone as verified and clear OTP
        const updated_consumer = await this.consumer_repository.update(consumer._id.toString(), {
            phone_verified: true,
            otp: undefined,
            otp_expiry: undefined
        });

        if (!updated_consumer) return null;

        // Generate a JWT token for the Consumer
        const token = jwt.sign(
            { 
                id: updated_consumer._id.toString(), 
                phone: updated_consumer.phone, 
                role: 'consumer' // STRICT ROLE DEMARCATION
            },
            process.env.JWT_SECRET!,
            { expiresIn: '30d' } // Consumers typically stay logged in longer than retailers
        );

        return { token, consumer: updated_consumer };
    }

    // Step 3: Complete Registration Profile 
    async complete_profile(consumer_id: string, consumer_data: Partial<IConsumer>): Promise<{ consumer: IConsumer } | null> {
        const updated_consumer = await this.consumer_repository.update(consumer_id, consumer_data);
        if (!updated_consumer) return null;

        return { consumer: updated_consumer };
    }

    // Step 4: Get Profile Data
    async get_consumer(consumer_id: string): Promise<IConsumer | null> {
        return await this.consumer_repository.find_by_id(consumer_id);
    }

    async update_profile(consumer_id: string, update_data: Partial<IConsumer>): Promise<IConsumer | null> {
        return await this.consumer_repository.update(consumer_id, update_data);
    }

    async delete_account(consumer_id: string): Promise<IConsumer | null> {
        return await this.consumer_repository.update(consumer_id, { status: 'deleted' });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ADDRESS MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────────

    async add_address(consumer_id: string, address_data: any): Promise<IConsumer | null> {
        const consumer = await this.consumer_repository.find_by_id(consumer_id);
        if (!consumer) return null;

        const is_first = consumer.addresses.length === 0;
        
        // If it's the first address or explicitly marked as default
        if (is_first || address_data.is_default) {
            address_data.is_default = true;
            
            // If not the first address, we need to clear current default
            if (!is_first) {
                // Clear is_default for all existing addresses efficiently
                await this.consumer_repository.update_all_addresses(consumer_id, { is_default: false });
            }
        } else {
            // Ensure any new address added when we already have addresses is NOT default unless specified
            address_data.is_default = false;
        }

        return this.consumer_repository.add_address(consumer_id, address_data);
    }

    async update_address(consumer_id: string, address_id: string, address_data: any): Promise<IConsumer | null> {
        if (address_data.is_default) {
            // Clear other defaults first
            await this.consumer_repository.update_all_addresses(consumer_id, { is_default: false });
        }
        return this.consumer_repository.update_address(consumer_id, address_id, address_data);
    }

    async get_addresses(consumer_id: string) {
        const consumer = await this.consumer_repository.find_by_id(consumer_id);
        return consumer ? consumer.addresses : null;
    }

    async set_default_address(consumer_id: string, address_id: string): Promise<IConsumer | null> {
        // Step 1: Clear all existing defaults
        await this.consumer_repository.update_all_addresses(consumer_id, { is_default: false });

        // Step 2: Set the specific address as default
        const result = await this.consumer_repository.set_address_default(consumer_id, address_id);

        if (!result) throw new Error("Address not found");

        return result;
    }

    async delete_address(consumer_id: string, address_id: string): Promise<IConsumer | null> {
        const consumer = await this.consumer_repository.find_by_id(consumer_id);
        if (!consumer) return null;

        const filtered = consumer.addresses.filter(a => a._id?.toString() !== address_id);
        
        // If we deleted the default, set the first remaining one to default
        if (filtered.length > 0 && !filtered.some(a => a.is_default)) {
            filtered[0].is_default = true;
        }

        return this.consumer_repository.update(consumer_id, { addresses: filtered as any });
    }
}
