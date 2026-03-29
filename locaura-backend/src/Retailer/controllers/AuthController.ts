import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { Logger } from '../../utils/logger';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';

export class AuthController {
    private auth_service = new AuthService();

    // Step 1: Request OTP
    send_otp = asyncHandler(async (req: Request, res: Response) => {
        const { phone } = req.body;
        Logger.info(`Phone number: ${phone}`, 'AuthController');
        if (!phone) {
            throw new ApiError(400, "Phone number is required");
        }

        await this.auth_service.send_phone_otp(phone);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "OTP sent successfully to your mobile number"));
    });

    // Step 2: Verify OTP
    verify_otp = asyncHandler(async (req: Request, res: Response) => {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            throw new ApiError(400, "Phone and OTP are required");
        }

        const result = await this.auth_service.verify_phone_otp(phone, otp);

        if (!result) {
            throw new ApiError(401, "Invalid or expired OTP");
        }

        const data = {
            token: result.token,
            retailer: result.retailer,
            stores: result.stores.map(store => ({
                id: store._id.toString(),
                name: store.store_name,
                status: store.status
            }))
        };

        return res
            .status(200)
            .json(new ApiResponse(200, data, "Phone verified successfully"));
    });

    // Step 3: Register Complete Profile
    complete_profile = asyncHandler(async (req: Request, res: Response) => {
        Logger.info(`User: ${req.user?.id}`, 'AuthController');
        
        const retailer_id = req.user?.id;
        const {
            retailer_name,
            email,
            pan_card
        } = req.body;

        if (!retailer_id) {
            throw new ApiError(401, "Unauthorized: User ID is missing");
        }

        const retailer_data = {
            retailer_name,
            email,
            pan_card
        };

        const result = await this.auth_service.complete_profile(retailer_id, retailer_data);

        if (!result) {
            throw new ApiError(404, "Retailer account not found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { retailer: result.retailer }, "Profile details updated successfully"));
    });

    get_profile = asyncHandler(async (req: Request, res: Response) => {
        const retailer_id = req.user?.id;
        const auth_header = req.headers.authorization;
        const token = auth_header?.split(' ')[1];

        if (!retailer_id) {
            throw new ApiError(401, "Unauthorized");
        }

        const result = await this.auth_service.get_profile(retailer_id);

        if (!result) {
            throw new ApiError(404, "Retailer not found");
        }

        const data = {
            token: token,
            retailer: result.retailer,
            stores: result.stores.map(store => ({
                id: store._id.toString(),
                name: store.store_name,
                status: store.status
            }))
        };

        return res
            .status(200)
            .json(new ApiResponse(200, data, "Profile fetched successfully"));
    });
}
