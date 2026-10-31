import { z } from 'zod';

export const cartItemSchema = z.object({
  type: z.enum(['catalog', 'prescription', 'strip']).default('catalog'),
  productId: z.string().optional(),
  qty: z.number().int().min(0).max(99).default(1),
  imageUrl: z.string().url().optional(),
  note: z.string().max(200).optional(),
});

export const updateCartItemSchema = z.object({
  productId: z.string().optional(),
  imageUrl: z.string().optional(),
  qty: z.number().int().min(0).max(99),
});
