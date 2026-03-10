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
        retailer_name: z.string().min(2, "Retailer Name must be at least 2 characters").optional(),
        email: z.email("Invalid email address").optional(),
        pan_card: z.string().min(10, "PAN must be 10 characters").max(10, "PAN must be 10 characters").optional()
    })
});
