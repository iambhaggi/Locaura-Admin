import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { Logger } from '../../utils/logger';

export class AuthController {
    private auth_service = new AuthService();

    // Step 1: Request OTP
    send_otp = async (req: Request, res: Response) => {
        try {
            const { phone } = req.body;
            Logger.info(`Consumer Phone number: ${phone}`, 'ConsumerAuthController');

            await this.auth_service.send_phone_otp(phone);

            res.status(200).json({
                success: true,
                message: 'OTP sent successfully to your mobile number'
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // Step 2: Verify OTP
    verify_otp = async (req: Request, res: Response) => {
        try {
            const { phone, otp } = req.body;

            const result = await this.auth_service.verify_phone_otp(phone, otp);

            if (!result) {
                return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
            }

            res.status(200).json({
                success: true,
                message: 'Phone verified successfully',
                data: {
                    token: result.token,
                    consumer: {
                        id: result.consumer._id,
                        phone: result.consumer.phone,
                        name: result.consumer.consumer_name,
                        email: result.consumer.email
                    }
                }
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // Step 3: Register Complete Profile
    complete_profile = async (req: Request, res: Response) => {
        Logger.info(`Consumer Completing Profile: ${req.user?.id}`, 'ConsumerAuthController');
        try {
            const consumer_id = req.user?.id;
            const { consumer_name, email } = req.body;

            if (!consumer_id) {
                return res.status(400).json({ success: false, message: 'Consumer ID is missing' });
            }

            const result = await this.auth_service.complete_profile(consumer_id, {
                consumer_name,
                email
            });

            if (!result) {
                return res.status(404).json({ success: false, message: 'Consumer account not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Profile details updated successfully',
                data: {
                    consumer: result.consumer
                }
            });
        } catch (error: any) {
            Logger.error('Consumer Profile Completion Error', error);
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // ─────────────────────────────────────────────────────────────────────────────
    // ADDRESS ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────────

    add_address = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const result = await this.auth_service.add_address(consumer_id, req.body);
            if (!result) return res.status(404).json({ success: false, message: 'Consumer not found' });

            res.status(201).json({ success: true, message: 'Address added', data: { addresses: result.addresses } });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    get_addresses = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const addresses = await this.auth_service.get_addresses(consumer_id);
            res.status(200).json({ success: true, data: { addresses } });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    set_default_address = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            const address_id = req.params.address_id as string;
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const result = await this.auth_service.set_default_address(consumer_id, address_id);
            if (!result) return res.status(404).json({ success: false, message: 'Consumer not found' });

            res.status(200).json({ success: true, message: 'Default address updated', data: { addresses: result.addresses } });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    delete_address = async (req: Request, res: Response) => {
        try {
            const consumer_id = req.user?.id;
            const address_id = req.params.address_id as string;
            if (!consumer_id) return res.status(401).json({ success: false, message: 'Unauthorized' });

            const result = await this.auth_service.delete_address(consumer_id, address_id);
            if (!result) return res.status(404).json({ success: false, message: 'Consumer not found' });

            res.status(200).json({ success: true, message: 'Address deleted', data: { addresses: result.addresses } });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
