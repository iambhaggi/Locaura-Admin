import { z } from 'zod';
import { BusinessType } from '../enums/retailer.enum';

export const register_store_schema = z.object({
    body: z.object({
        // Shop identity
        store_name: z.string().min(2, "Store Name must be at least 2 characters"),
        description: z.string().optional(),
        business_type: z.enum(BusinessType).optional(),

        // Contact details
        owner_name: z.string().min(2, "Owner Name must be at least 2 characters"),
        owner_phone: z.string().min(10, "Owner Phone must be at least 10 characters"),
        owner_email: z.email("Invalid email address"),

        // Location / Address
        address: z.object({
            street: z.string().min(1, "Street is required"),
            city: z.string().min(1, "City is required"),
            state: z.string().min(1, "State is required"),
            zip_code: z.string().min(1, "Zip Code is required"),
            neighborhood: z.string().min(1, "Neighborhood is required").optional(),
            landmark: z.string().optional()
        }).optional(),
        
        // Location coordinates are often gathered automatically on frontend, 
        // making them optional in the strict validation body here unless enforced
        location: z.object({
            type: z.literal("Point").default("Point"),
            coordinates: z.array(z.number()).length(2)
        }).optional(),

        // Tax / Legal
        pan_card: z.string().min(10, "PAN must be 10 characters").max(10, "PAN must be 10 characters").optional(),
        gstin: z.string().min(15, "GSTIN must be 15 characters").max(15, "GSTIN must be 15 characters").optional(),
        fssai_license: z.string().optional(),

        // Bank Details
        bank_details: z.object({
            account_number: z.string().min(1, "Account Number is required"),
            ifsc_code: z.string().min(1, "IFSC Code is required"),
            account_holder_name: z.string().min(1, "Account Holder Name is required"),
            bank_name: z.string().optional()
        }).optional()
    })
});

export const update_store_schema = z.object({
    body: z.object({
        store_name: z.string().min(2, "Store Name must be at least 2 characters").optional(),
        description: z.string().optional(),
        business_type: z.enum(BusinessType).optional(),

        owner_name: z.string().min(2, "Owner Name must be at least 2 characters").optional(),
        owner_phone: z.string().min(10, "Owner Phone must be at least 10 characters").optional(),
        owner_email: z.email("Invalid email address").optional(),

        address: z.object({
            street: z.string().min(1, "Street is required"),
            city: z.string().min(1, "City is required"),
            state: z.string().min(1, "State is required"),
            zip_code: z.string().min(1, "Zip Code is required"),
            neighborhood: z.string().min(1, "Neighborhood is required").optional(),
            landmark: z.string().optional()
        }).optional(),
        
        location: z.object({
            type: z.literal("Point").default("Point"),
            coordinates: z.array(z.number()).length(2)
        }).optional(),

        pan_card: z.string().min(10, "PAN must be 10 characters").max(10, "PAN must be 10 characters").optional(),
        gstin: z.string().min(15, "GSTIN must be 15 characters").max(15, "GSTIN must be 15 characters").optional(),
        fssai_license: z.string().optional(),

        bank_details: z.object({
            account_number: z.string().min(1, "Account Number is required"),
            ifsc_code: z.string().min(1, "IFSC Code is required"),
            account_holder_name: z.string().min(1, "Account Holder Name is required"),
            bank_name: z.string().optional()
        }).optional(),

        store_images: z.array(z.string()).optional(),
        categories: z.array(z.string()).optional(),
        is_delivery_available: z.boolean().optional()
    })
});
