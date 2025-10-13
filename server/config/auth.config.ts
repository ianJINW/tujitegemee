import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
}

export const authConfig = {
    jwtSecret: process.env.JWT_SECRET as string,
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
} as const;

// Type guard to ensure JWT secret is available
if (!authConfig.jwtSecret) {
    throw new Error('JWT_SECRET must be a non-empty string');
}
