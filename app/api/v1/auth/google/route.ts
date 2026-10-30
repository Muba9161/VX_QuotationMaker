import { NextResponse } from "next/server";
import { getAppConfig } from "@/lib/config";
import { generateOAuthState, buildGoogleAuthUrl, setOAuthStateCookie } from "@/lib/auth/google";

/**
 * GET /api/v1/auth/google
 *
 * Initiates the Google OAuth 2.0 authorization code grant flow.
 * Generates a cryptographically random state token, stores it in an HTTP-only cookie,
 * and redirects the user to the Google account consent screen.
 */
export async function GET(_req: Request) {
  void _req;
  try {
    const config = getAppConfig();

    if (!config.googleClientId) {
      // Configuration missing: redirect back to login with a descriptive error
      const loginUrl = new URL("/login?error=google_auth_not_configured", config.appUrl);
      return NextResponse.redirect(loginUrl);
    }

    const redirectUri =
      config.googleCallbackUrl || `${config.appUrl}/api/v1/auth/google/callback`;

    const state = generateOAuthState();
    const googleAuthUrl = buildGoogleAuthUrl({
      clientId: config.googleClientId,
      redirectUri,
      state,
    });

    const response = NextResponse.redirect(googleAuthUrl);
    setOAuthStateCookie(response, state);

    return response;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Google OAuth Initiation Error]", err);
    }
    const fallbackUrl = new URL("/login?error=oauth_initiation_failed", "http://localhost:3000");
    return NextResponse.redirect(fallbackUrl);
  }
}

