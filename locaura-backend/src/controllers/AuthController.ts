import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { Logger } from '../utils/logger';
import { RetailerStatus } from '../enums/retailer.enum';

export class AuthController {
    private auth_service = new AuthService();

    // Step 1: Request OTP
    send_otp = async (req: Request, res: Response) => {
        try {
            const { phone } = req.body;
            Logger.info(`Phone number: ${phone}`, 'AuthController');
            if (!phone) {
                return res.status(400).json({ success: false, message: 'Phone number is required' });
            }

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

            if (!phone || !otp) {
                return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
            }

            const result = await this.auth_service.verify_phone_otp(phone, otp);

            if (!result) {
                return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
            }

            res.status(200).json({
                success: true,
                message: 'Phone verified successfully',
                data: {
                    token: result.token,
                    retailer: {
                        id: result.retailer._id,
                        phone: result.retailer.phone,
                        status: result.retailer.status
                    }
                }
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // Step 3: Register Complete Profile
    complete_profile = async (req: Request, res: Response) => {
        Logger.info(`User: ${req.user?.id}`, 'AuthController');
        try {
            const {
                store_name,
                owner_name,
                email,
                gstin,
                bank_details,
                pan_card,
                address,
                business_type
            } = req.body;
            const retailer_id = req.user?.id;
            if (!retailer_id || !store_name || !gstin) {
                return res.status(400).json({ success: false, message: 'Missing required profile details' });
            }

            const updated_retailer = await this.auth_service.complete_profile(retailer_id, {
                store_name,
                owner_name,
                email,
                gstin,
                bank_details,
                pan_card,
                address,
                business_type,
                status: RetailerStatus.PENDING
            });

            if (!updated_retailer) {
                return res.status(404).json({ success: false, message: 'Retailer not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Business profile submitted successfully for verification',
                data: updated_retailer
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
