// app/api/auth/google/start/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.send';

// 1. Configure the OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export async function GET(request: NextRequest) {
  // Generate a random state value for security (CSRF protection)
  const state = 'your_securely_generated_state_value'; 
  // IMPORTANT: Store this 'state' value in the user's session or a secure 
  // cookie so you can verify it in the callback handler later.

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Crucial: Requests a Refresh Token
    scope: [GMAIL_SCOPE],
    state: state,
    prompt: 'consent', // Ensures users see the consent screen, even if previously authorized
  });

  // Redirect the user to Google's authorization URL
  return NextResponse.redirect(authUrl);
}