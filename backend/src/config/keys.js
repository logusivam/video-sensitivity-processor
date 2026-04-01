import dotenv from 'dotenv';
dotenv.config();

export const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY 
    ? Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf-8') 
    : '';

export const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY 
    ? Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf-8') 
    : '';

if (!PRIVATE_KEY || !PUBLIC_KEY) {
    console.warn('⚠️ WARNING: JWT RSA Keys are missing from environment variables.');
}

// Ensure keys start with the correct headers, otherwise they are invalid
if (PRIVATE_KEY && !PRIVATE_KEY.includes('BEGIN RSA PRIVATE KEY') && !PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
    console.error('❌ CRITICAL: PRIVATE_KEY decoded improperly. It is not a valid RSA key.');
}