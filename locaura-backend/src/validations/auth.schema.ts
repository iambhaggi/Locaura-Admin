import { z } from 'zod';
import { BusinessType } from '../enums/retailer.enum';

// Step 1: Request OTP
export const send_otp_schema = z.object({
    body: z.object({
        phone: z.string().min(10, "Phone number must be at least 10 characters"),
    })
});

// Step 2: Verify OTP
export const verify_otp_schema = z.object({
    body: z.object({
        phone: z.string().min(10, "Phone number must be at least 10 characters"),
        otp: z.string().length(6, "OTP must be exactly 6 characters"),
    })
});

// Step 3: Complete Profile
export const complete_profile_schema = z.object({
    body: z.object({
        store_name: z.string().min(2, "Store Name must be at least 2 characters"),
        owner_name: z.string().min(2, "Owner Name must be at least 2 characters").optional(),
        email: z.email("Invalid email address").optional(),
        gstin: z.string().min(15, "GSTIN must be 15 characters").max(15, "GSTIN must be 15 characters"),
        pan_card: z.string().min(10, "PAN must be 10 characters").max(10, "PAN must be 10 characters").optional(),
        business_type: z.enum(BusinessType).optional(),
        address: z.object({
            street: z.string().min(1, "Street is required"),
            city: z.string().min(1, "City is required"),
            state: z.string().min(1, "State is required"),
            zip_code: z.string().min(1, "Zip Code is required"),
            neighborhood: z.string().min(1, "Neighborhood is required").optional()
        }).optional(),
        bank_details: z.object({
            account_number: z.string().min(1, "Account Number is required"),
            ifsc_code: z.string().min(1, "IFSC Code is required"),
            account_holder_name: z.string().min(1, "Account Holder Name is required")
        }).optional()
    })
});
