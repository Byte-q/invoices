// lib/auth-check-actions.ts (REVISED - NO PRISMA QUERY)

"use server";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth"; 
// NOTE: prisma import is removed as it's no longer needed for this check.

/**
 * Checks the session status solely by validating the HttpOnly cookie and its JWT token.
 * Does NOT query the database.
 * @returns {boolean} True if a valid, unexpired session cookie is present.
 */
export async function checkSessionStatus(): Promise<boolean> {
    const cookie = await cookies();
    const session = cookie.get('wb_session')?.value;
    
    // 1. Check for cookie existence
    if (!session) {
        return false;
    }

    try {
        // 2. Verify the JWT token
        // The verifyToken function should automatically handle:
        // - Invalid signatures
        // - Expired tokens
        const decoded = await verifyToken(session); 
        
        // If decoded is null/undefined (token invalid/expired), or userId is missing, it's false
        return !!decoded && !!decoded.userId;
    } catch (e) {
        // Any error during decoding (e.g., malformed token) means session is invalid
        return false;
    }
}