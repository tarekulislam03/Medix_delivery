import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().max(80).optional(),
  hasSeenWelcome: z.boolean().optional(),
});

export const addressSchema = z.object({
  label: z.string().max(30).optional().default('Home'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(60),
  phone: z.string().min(10, 'Valid contact phone number is required').optional(),
  villagePo: z.string().min(3, 'Village / Post Office / Street is required'),
  landmark: z.string().max(100).optional().default(''),
  pinCode: z.string().length(6, 'Pincode must be exactly 6 digits').regex(/^\d{6}$/, 'Pincode must contain numbers only'),
  isDefault: z.boolean().optional().default(false),
  geo: z
    .object({
      type: z.literal('Point').default('Point'),
      coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
    })
    .optional(),
});

export const updateAddressSchema = addressSchema.partial();
