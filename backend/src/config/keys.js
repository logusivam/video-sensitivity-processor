import dotenv from 'dotenv';
dotenv.config();

// Decode Base64 strings to UTF-8
export const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY 
    ? Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf-8') 
    : '';

export const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY 
    ? Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf-8') 
    : '';

if (!PRIVATE_KEY || !PUBLIC_KEY) {
    console.warn('⚠️ WARNING: JWT RSA Keys are missing from environment variables.');
}