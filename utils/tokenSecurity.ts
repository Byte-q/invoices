// utils/tokenSecurity.ts (A new utility file)
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.REFRESH_TOKEN_ENCRYPTION_KEY!, 'utf-8'); // Must be 32 bytes

// Helper to encrypt the token before storing
export function encryptToken(token: string): string {
    const iv = crypto.randomBytes(16); // Initialization Vector
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Store IV along with encrypted text, separated by a colon
    return `${iv.toString('hex')}:${encrypted}`; 
}

// Helper to decrypt the token for API use
export function decryptToken(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted token format');
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedToken = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}