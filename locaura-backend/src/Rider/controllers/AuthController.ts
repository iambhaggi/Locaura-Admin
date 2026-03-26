import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { Logger } from '../../utils/logger';

export class AuthController {
    private auth_service = new AuthService();

    send_otp = async (req: Request, res: Response) => {
        try {
            const { phone, name } = req.body;
            
            if (!phone) {
                return res.status(400).json({ success: false, message: 'Phone number is required' });
            }

            const result = await this.auth_service.send_otp(phone, name);
            res.status(200).json(result);
        } catch (error: any) {
            Logger.error(`Rider send OTP error: ${error.message}`, 'RiderAuth');
            res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }
    };

    verify_otp = async (req: Request, res: Response) => {
        try {
            const { phone, otp } = req.body;
            
            if (!phone || !otp) {
                return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
            }

            const result = await this.auth_service.verify_otp(phone, otp);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error: any) {
            Logger.error(`Rider verify OTP error: ${error.message}`, 'RiderAuth');
            res.status(500).json({ success: false, message: 'Failed to verify OTP' });
        }
    };
    
    me = async (req: Request, res: Response) => {
        try {
            // The auth middleware populates req.user
            if (!req.user || !req.user.id) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            
            const { RiderRepository } = await import('../repositories/RiderRepository');
            const repo = new RiderRepository();
            const rider = await repo.find_by_id(req.user.id);
            
            if (!rider) {
                return res.status(404).json({ success: false, message: 'Rider profile not found' });
            }
            
            res.status(200).json({ success: true, data: { rider } });
        } catch (error: any) {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };
}
