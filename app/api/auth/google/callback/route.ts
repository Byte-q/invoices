// app/api/auth/google/callback/route.ts
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { encryptToken } from "@/utils/tokenSecurity";
import { getUserId, saveEncryptedTokenToDB } from "@/app/lib/data";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// 1. Configure the OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export async function GET(request: NextRequest) {
  // Use request.nextUrl.searchParams to get query parameters
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code." },
      { status: 400 }
    );
  }

  // TODO:
  // 1. Verify the 'state' parameter against the one you stored earlier for CSRF protection.

  try {
    // 2. Exchange the Authorization Code for Tokens
    const { tokens } = await oauth2Client.getToken(code);

    // **CRITICAL STEP:** Store the Refresh Token (tokens.refresh_token)
    // in your database associated with the user.
    console.log("Received Tokens:", tokens);

    const refreshToken = tokens.refresh_token;
    if (!refreshToken) {
      // This is unlikely if access_type='offline' was used, but handle it
      throw new Error("No refresh token received.");
    }

    // 1. ENCRYPT the sensitive Refresh Token
    const encryptedRefreshToken = encryptToken(refreshToken);

    // 2. STORE it securely in your database
    // Example: Link the token to the user's ID
    const userId = await getUserId();
    await saveEncryptedTokenToDB(userId!, encryptedRefreshToken);
    console.log(`Token encrypted and stored: ${encryptedRefreshToken}`); // For testing only

    // 3. Redirect the user back to your main application page
    // Note: Use NextResponse.redirect for external redirects
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    // Respond with a JSON error
    return NextResponse.json(
      { error: "Authentication failed." },
      { status: 500 }
    );
  }
}
