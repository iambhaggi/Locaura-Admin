import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
    private authService = new AuthService();

    // Step 1: Request OTP
    sendOtp = async (req: Request, res: Response) => {
        try {
            const { phone } = req.body;

            if (!phone) {
                return res.status(400).json({ success: false, message: 'Phone number is required' });
            }

            await this.authService.sendPhoneOTP(phone);

            res.status(200).json({
                success: true,
                message: 'OTP sent successfully to your mobile number'
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // Step 2: Verify OTP
    verifyOtp = async (req: Request, res: Response) => {
        try {
            const { phone, otp } = req.body;

            if (!phone || !otp) {
                return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
            }

            const result = await this.authService.verifyPhoneOTP(phone, otp);

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
    completeProfile = async (req: Request, res: Response) => {
        try {
            // Assume the previous verification gave them a JWT and we decoded it to get their retailerId
            // Or just get the retailerId from headers (for now assume they send it in the body for testing)
            const { retailerId, storeName, ownerName, email, gstin, bankDetails, panCard, address, businessType } = req.body;

            if (!retailerId || !storeName || !gstin) {
                return res.status(400).json({ success: false, message: 'Missing required profile details' });
            }

            const updatedRetailer = await this.authService.completeProfile(retailerId, {
                storeName,
                ownerName,
                email,
                gstin,
                bankDetails,
                panCard,
                address,
                businessType,
                status: 'pending' // Still requires manual verification by Meesho-style admins
            });

            if (!updatedRetailer) {
                return res.status(404).json({ success: false, message: 'Retailer not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Business profile submitted successfully for verification',
                data: updatedRetailer
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
