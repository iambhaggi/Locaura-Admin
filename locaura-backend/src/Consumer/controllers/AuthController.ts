import { Request, Response } from 'express';
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
        Logger.info(`Consumer Phone number: ${phone}`, 'ConsumerAuthController');

        await this.auth_service.send_phone_otp(phone);

        return res
            .status(200)
            .json(new ApiResponse(200, null, 'OTP sent successfully to your mobile number'));
    });

    // Step 2: Verify OTP
    verify_otp = asyncHandler(async (req: Request, res: Response) => {
        const { phone, otp } = req.body;

        const result = await this.auth_service.verify_phone_otp(phone, otp);

        if (!result) {
            throw new ApiError(401, 'Invalid or expired OTP');
        }

        const data = {
            token: result.token,
            consumer: result.consumer
        };

        return res
            .status(200)
            .json(new ApiResponse(200, data, 'Phone verified successfully'));
    });

    // Step 3: Register Complete Profile
    complete_profile = asyncHandler(async (req: Request, res: Response) => {
        Logger.info(`Consumer Completing Profile: ${req.user?.id}`, 'ConsumerAuthController');
        
        const consumer_id = req.user?.id;
        const { consumer_name, email } = req.body;

        if (!consumer_id) {
            throw new ApiError(401, 'Consumer ID is missing');
        }

        const result = await this.auth_service.complete_profile(consumer_id, {
            consumer_name,
            email
        });

        if (!result) {
            throw new ApiError(404, 'Consumer account not found');
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { consumer: result.consumer }, 'Profile details updated successfully'));
    });

    get_consumer = asyncHandler(async (req: Request, res: Response) => {
        const consumer_id = req.user?.id;
        if (!consumer_id) {
            throw new ApiError(401, 'Unauthorized');
        }

        const consumer = await this.auth_service.get_consumer(consumer_id);

        if (!consumer) {
            throw new ApiError(404, 'Consumer not found');
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { consumer }, 'Consumer fetched successfully'));
    });

    update_profile = asyncHandler(async (req: Request, res: Response) => {
        const consumer_id = req.user?.id;
        if (!consumer_id) {
            throw new ApiError(401, 'Unauthorized');
        }

        const result = await this.auth_service.update_profile(consumer_id, req.body);

        if (!result) {
            throw new ApiError(404, 'Consumer not found');
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { consumer: result }, 'Profile updated successfully'));
    });

    delete_account = asyncHandler(async (req: Request, res: Response) => {
        const consumer_id = req.user?.id;
        if (!consumer_id) {
            throw new ApiError(401, 'Unauthorized');
        }

        const result = await this.auth_service.delete_account(consumer_id);

        if (!result) {
            throw new ApiError(404, 'Consumer not found');
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, 'Account deleted successfully'));
    });

    logout = asyncHandler(async (req: Request, res: Response) => {
        return res
            .status(200)
            .json(new ApiResponse(200, null, 'Logged out successfully'));
    });

    add_address = asyncHandler(async (req: Request, res: Response) => {
        const consumer_id = req.user?.id;
        if (!consumer_id) throw new ApiError(401, 'Unauthorized');

        const result = await this.auth_service.add_address(consumer_id, req.body);
        if (!result) throw new ApiError(404, 'Consumer not found');

        return res
            .status(201)
            .json(new ApiResponse(201, { consumer: result }, 'Address added successfully'));
    });

    update_address = asyncHandler(async (req: Request, res: Response) => {
        const consumer_id = req.user?.id;
        const address_id = req.params.address_id as string;
        if (!consumer_id) throw new ApiError(401, 'Unauthorized');

        const result = await this.auth_service.update_address(consumer_id, address_id, req.body);
        if (!result) throw new ApiError(404, 'Consumer not found');

        return res
            .status(200)
            .json(new ApiResponse(200, { consumer: result }, 'Address updated successfully'));
    });

    get_addresses = asyncHandler(async (req: Request, res: Response) => {
        const consumer_id = req.user?.id;
        if (!consumer_id) throw new ApiError(401, 'Unauthorized');

        const addresses = await this.auth_service.get_addresses(consumer_id);
        return res
            .status(200)
            .json(new ApiResponse(200, { addresses }, 'Addresses fetched successfully'));
    });

    set_default_address = asyncHandler(async (req: Request, res: Response) => {
        const consumer_id = req.user?.id;
        const address_id = req.params.address_id as string;
        if (!consumer_id) throw new ApiError(401, 'Unauthorized');

        const result = await this.auth_service.set_default_address(consumer_id, address_id);
        if (!result) throw new ApiError(404, 'Consumer not found');

        return res
            .status(200)
            .json(new ApiResponse(200, { consumer: result }, 'Default address updated successfully'));
    });

    delete_address = asyncHandler(async (req: Request, res: Response) => {
        const consumer_id = req.user?.id;
        const address_id = req.params.address_id as string;
        if (!consumer_id) throw new ApiError(401, 'Unauthorized');

        const result = await this.auth_service.delete_address(consumer_id, address_id);
        if (!result) throw new ApiError(404, 'Consumer not found');

        return res
            .status(200)
            .json(new ApiResponse(200, { consumer: result }, 'Address deleted successfully'));
    });
}
