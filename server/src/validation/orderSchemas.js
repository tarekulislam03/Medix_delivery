import { z } from 'zod';

export const createOrderSchema = z.object({
  addressId: z.string().optional(),
  address: z
    .object({
      fullName: z.string().min(2),
      phone: z.string().min(10),
      villagePo: z.string().min(3),
      landmark: z.string().optional().default(''),
      pinCode: z.string().length(6),
    })
    .optional(),
  paymentMethod: z.enum(['cod', 'upi']).default('cod'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PLACED',
    'CONFIRMED',
    'PACKED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REJECTED',
    'AWAITING_CUSTOMER_CONFIRMATION',
  ]),
  note: z.string().max(200).optional(),
});

export const updateOrderPricingSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string(),
      price: z.number().min(0),
    })
  ),
  note: z.string().max(200).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().max(200).optional().default('Cancelled by customer before packing'),
});
