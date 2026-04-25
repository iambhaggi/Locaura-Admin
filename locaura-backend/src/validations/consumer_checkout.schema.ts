import { z } from 'zod';

export const checkout_schema = z.object({
  body: z.object({
    delivery_address_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid Address ID is required'),
    payment_method: z.enum(['COD', 'UPI', 'CARD', 'WALLET', 'NETBANKING'], {
      message: 'Invalid payment method'
    }),
    special_instructions: z.string().max(250).optional()
  })
});
