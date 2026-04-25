import { z } from 'zod';

export const send_otp_schema = z.object({
  body: z.object({
    phone: z.string().regex(/^\d{10}$/, 'Valid 10-digit mobile number is required'),
  }),
});

export const verify_otp_schema = z.object({
  body: z.object({
    phone: z.string().regex(/^\d{10}$/, 'Valid 10-digit mobile number is required'),
    otp: z.string().length(6, 'Valid 6-digit OTP is required'),
  }),
});

export const complete_profile_schema = z.object({
  body: z.object({
    consumer_name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Valid email is required').optional(),
  }),
});

export const add_address_schema = z.object({
  body: z.object({
    label: z.string().min(1, 'Label is required'),
    line1: z.string().min(5, 'Address line 1 must be at least 5 characters'),
    line2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit Pincode is required'),
    is_default: z.boolean().optional(),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([
        z.number().min(-180).max(180), // longitude
        z.number().min(-90).max(90)    // latitude
      ])
    }).optional()
  }),
});