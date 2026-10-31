import { z } from 'zod';

export const checkUserSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit mobile number is required'),
  sendOtpIfExisting: z.boolean().optional(),
});

export const sendOtpSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit mobile number is required'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit mobile number is required'),
  otp: z.string().regex(/^\d{4,6}$/, 'OTP must be 4 to 6 digits'),
  name: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token is required'),
});

