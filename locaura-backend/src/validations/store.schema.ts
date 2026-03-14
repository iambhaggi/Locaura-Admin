import { z } from 'zod';
import { BusinessType } from '../Retailer/enums/retailer.enum';

export const register_store_schema = z.object({
    body: z.object({
        // Shop identity
        store_name: z.string().min(2, "Store Name must be at least 2 characters"),
        description: z.string().optional(),
        business_type: z.enum(BusinessType).optional(),

        // Contact details
        retailer_name: z.string().min(2, "Retailer Name must be at least 2 characters"),
        retailer_phone: z.string().min(10, "Retailer Phone must be at least 10 characters"),
        retailer_email: z.email("Invalid email address"),

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
        pan_card: z.string().length(10, "PAN must be 10 characters").or(z.literal("")).optional(),
        gstin: z.string().length(15, "GSTIN must be 15 characters").or(z.literal("")).optional(),
        fssai_license: z.string().optional(),

        // Bank Details
        bank_details: z.object({
            account_number: z.string().optional(),
            ifsc_code: z.string().optional(),
            account_holder_name: z.string().optional(),
            bank_name: z.string().optional()
        }).optional()
    })
});

export const update_store_schema = z.object({
    body: z.object({
        store_name: z.string().min(2, "Store Name must be at least 2 characters").optional(),
        description: z.string().optional(),
        business_type: z.enum(BusinessType).optional(),

        retailer_name: z.string().min(2, "Retailer Name must be at least 2 characters").optional(),
        retailer_phone: z.string().min(10, "Retailer Phone must be at least 10 characters").optional(),
        retailer_email: z.email("Invalid email address").optional(),

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

        pan_card: z.string().length(10, "PAN must be 10 characters").or(z.literal("")).optional(),
        gstin: z.string().length(15, "GSTIN must be 15 characters").or(z.literal("")).optional(),
        fssai_license: z.string().optional(),

        bank_details: z.object({
            account_number: z.string().optional(),
            ifsc_code: z.string().optional(),
            account_holder_name: z.string().optional(),
            bank_name: z.string().optional()
        }).optional(),

        store_images: z.array(z.string()).optional(),
        categories: z.array(z.string()).optional(),
        is_delivery_available: z.boolean().optional()
    })
});
