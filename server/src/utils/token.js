import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'medix_jwt_access_secret_development_938472910482018374';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'medix_jwt_refresh_secret_development_593820184729104820';

export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

export async function hashValue(value) {
  return await bcrypt.hash(String(value), 10);
}

export async function compareHash(value, hash) {
  return await bcrypt.compare(String(value), hash);
}

export function generate6DigitOtp() {
  return String(crypto.randomInt(100000, 999999));
}

export function generate4DigitOtp() {
  return String(crypto.randomInt(1000, 9999));
}

