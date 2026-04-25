import { Request, Response } from 'express';
import { AdminService } from '../services/AdminService';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { RetailerStatus } from '../../Retailer/enums/retailer.enum';

export class AdminController {
    private admin_service = new AdminService();

    get_stores = asyncHandler(async (req: Request, res: Response) => {
        const { status } = req.query;
        const stores = await this.admin_service.get_all_stores(status as string);
        return res.status(200).json(new ApiResponse(200, { stores }, "Stores fetched successfully"));
    });

    update_store_status = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!Object.values(RetailerStatus).includes(status)) {
            throw new ApiError(400, "Invalid status");
        }

        const store = await this.admin_service.update_store_status(id as string, status);
        if (!store) throw new ApiError(404, "Store not found");

        return res.status(200).json(new ApiResponse(200, { store }, "Store status updated"));
    });

    get_retailers = asyncHandler(async (req: Request, res: Response) => {
        const retailers = await this.admin_service.get_all_retailers();
        return res.status(200).json(new ApiResponse(200, { retailers }, "Retailers fetched successfully"));
    });

    get_stats = asyncHandler(async (req: Request, res: Response) => {
        const stats = await this.admin_service.get_dashboard_stats();
        return res.status(200).json(new ApiResponse(200, { stats }, "Dashboard stats fetched"));
    });
}
