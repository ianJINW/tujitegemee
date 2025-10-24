import * as dotenv from 'dotenv';
import type { Secret } from 'jsonwebtoken';

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
}

const jwtSecret: Secret = process.env.JWT_SECRET;
const frontendURL = process.env.FRONTEND_URL as string

export const authConfig = {
    jwtSecret,
    jwtExpiry: process.env.EXPIRY_TIME || '1h',
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    // You might want to add refresh token settings here
    refreshToken: {
        expiry: '7d',
        cookieName: 'refreshToken',
    },
    frontendURL
} as const;

// Type guard to ensure JWT secret is available
if (!authConfig.jwtSecret) {
    throw new Error('JWT_SECRET must be a non-empty string');
}

if (!authConfig.frontendURL) {
    throw new Error('FRONTEND_URL must be a non-empty string');
}