import * as dotenv from "dotenv";
dotenv.config();

export const envConfig = {
    PORT: process.env.PORT || 8080,
    frontendURL: process.env.FRONTEND_URL as string,
    mongoUri: process.env.MONGO_URI as string,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY as string,
    SENDGRID_FROM: process.env.SENDGRID_FROM as string,
    EMAIL_USER: process.env.EMAIL_USER as string,
    EMAIL_PASS: process.env.EMAIL_PASS as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    EXPIRY_TIME: process.env.EXPIRY_TIME as string,
    FRONTEND_URL_NETWORK: process.env.FRONTEND_URL_NETWORK as string,
    SMTP_HOST: process.env.SMTP_HOST as string
};