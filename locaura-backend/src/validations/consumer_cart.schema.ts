import { z } from 'zod';

export const add_cart_item_schema = z.object({
  body: z.object({
    store_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid Store ID is required'),
    variant_id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid Variant ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1')
  })
});

export const update_cart_item_schema = z.object({
  body: z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1')
  })
});
