import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET must be defined in .env file');
  process.exit(1);
}

export const config = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiryTime: process.env.EXPIRY_TIME || '1h'
  },
  server: {
    port: process.env.PORT || 8080,
    frontendUrl: process.env.FRONTEND_URL
  },
  mongo: {
    uri: process.env.MONGO_URI
  }
}; 