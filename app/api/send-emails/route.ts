// app/api/send-email/route.ts
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { decryptToken } from "@/utils/tokenSecurity"; // Import the decryption helper
import { getEncryptedTokenFromDB, getUserId } from "@/app/lib/data"; // Function to get stored token

// Reuse the same OAuth2 client setup
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Helper function to convert message to base64url format
function base64url(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function POST(request: NextRequest) {
  const { to, subject, body } = await request.json();

  // 1. RETRIEVE the encrypted token from the database
  // In a real app, this should be linked to the current user's session
  const userId = await getUserId();
  const encryptedRefreshToken = await getEncryptedTokenFromDB(userId!); // REPLACE with actual DB call

  if (!encryptedRefreshToken) {
    return NextResponse.json(
      { error: "User token not found." },
      { status: 401 }
    );
  }

  try {
    // 2. DECRYPT the token for use
    const userRefreshToken = decryptToken(encryptedRefreshToken);

    // 2. Set the Refresh Token on the client
    oauth2Client.setCredentials({ refresh_token: userRefreshToken });

    // 3. Initialize Gmail client
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // 4. Construct the email message
    const rawMessage = [
      `To: ${to}`,
      `From: me`, // 'me' is resolved to the authenticated user's email via the token
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      body,
    ].join("\n");

    const encodedMessage = base64url(rawMessage);

    // 5. Send the email
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return NextResponse.json(
      { message: "Email sent successfully!", data: response.data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email." },
      { status: 500 }
    );
  }
}
