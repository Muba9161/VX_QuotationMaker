import crypto from "crypto";
import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

export const OAUTH_STATE_COOKIE_NAME = "vx_oauth_state";
export const OAUTH_STATE_MAX_AGE_SECONDS = 600; // 10 minutes

export interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  refresh_token?: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface VerifiedGoogleUser {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

export interface GoogleIdTokenPayload {
  iss?: string;
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

let googleOAuthClient: OAuth2Client | null = null;

export function getGoogleOAuthClient(clientId?: string): OAuth2Client {
  if (!googleOAuthClient) {
    googleOAuthClient = new OAuth2Client(clientId);
  }
  return googleOAuthClient;
}

export function _resetGoogleOAuthClient(): void {
  googleOAuthClient = null;
}

/**
 * Cryptographically verifies a Google ID token using Google's public JWKS certificates.
 * Validates the digital signature, issuer, audience (client ID), expiration, and email.
 */
export async function verifyGoogleIdToken(options: {
  idToken: string;
  clientId: string;
}): Promise<VerifiedGoogleUser> {
  const client = getGoogleOAuthClient(options.clientId);

  // verifyIdToken cryptographically verifies the token's RSA/ECDSA signature using Google's public certs,
  // and validates the audience (clientId) and expiration (exp).
  const ticket = await client.verifyIdToken({
    idToken: options.idToken,
    audience: options.clientId,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("[Google OAuth Error] Missing ID token payload");
  }

  // Validate standard issuer
  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (!payload.iss || !validIssuers.includes(payload.iss)) {
    throw new Error(`[Google OAuth Error] Invalid ID token issuer: ${payload.iss}`);
  }

  // Validate audience
  if (payload.aud !== options.clientId) {
    throw new Error("[Google OAuth Error] ID token audience mismatch");
  }

  // Validate stable Google subject identifier (sub)
  if (!payload.sub || typeof payload.sub !== "string" || payload.sub.trim() === "") {
    throw new Error("[Google OAuth Error] Missing subject identifier (sub)");
  }

  // Validate email existence
  if (!payload.email || typeof payload.email !== "string" || payload.email.trim() === "") {
    throw new Error("[Google OAuth Error] Missing email in ID token");
  }

  const emailVerified =
    payload.email_verified === true || String(payload.email_verified) === "true";

  return {
    sub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    emailVerified,
    name: payload.name,
    picture: payload.picture,
  };
}

/**
 * Generates a high-entropy cryptographic state token to protect against CSRF attacks in OAuth.
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Constructs the Google OAuth 2.0 authorization URL.
 */
export function buildGoogleAuthUrl(options: {
  clientId: string;
  redirectUri: string;
  state: string;
  prompt?: string;
  accessType?: string;
}): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", options.clientId);
  url.searchParams.set("redirect_uri", options.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", options.state);
  url.searchParams.set("access_type", options.accessType || "online");
  url.searchParams.set("prompt", options.prompt || "select_account");

  return url.toString();
}

/**
 * Exchanges authorization code for access and ID tokens from Google using OAuth2Client.
 */
export async function exchangeGoogleCode(options: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<GoogleTokenResponse> {
  try {
    const client = new OAuth2Client(
      options.clientId,
      options.clientSecret,
      options.redirectUri
    );

    const { tokens } = await client.getToken(options.code);

    return {
      access_token: tokens.access_token || "",
      id_token: tokens.id_token || undefined,
      expires_in: tokens.expiry_date
        ? Math.max(0, Math.floor((tokens.expiry_date - Date.now()) / 1000))
        : 3600,
      token_type: tokens.token_type || "Bearer",
      scope: tokens.scope || undefined,
      refresh_token: tokens.refresh_token || undefined,
    };
  } catch (err: unknown) {
    const errorObj = err as {
      response?: { data?: { error?: string; error_description?: string } };
      message?: string;
    };
    const errorMsg =
      errorObj?.response?.data?.error_description ||
      errorObj?.response?.data?.error ||
      errorObj?.message ||
      "Failed to exchange Google OAuth code";

    console.error("[Google OAuth Error] Token exchange failed:", errorMsg);
    throw new Error(`[Google OAuth Error] Token exchange failed: ${errorMsg}`);
  }
}

/**
 * Fetches user profile information from Google OpenID Connect endpoint using access token.
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`[Google OAuth Error] Failed to fetch user info: status ${res.status}`);
  }

  const data = await res.json();
  return data as GoogleUserInfo;
}

/**
 * Decodes the JWT ID token payload without requiring third-party libraries.
 */
export function decodeIdTokenPayload(idToken: string): GoogleIdTokenPayload | null {
  try {
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(payload) as GoogleIdTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Validates Google ID token standard claims.
 */
export function verifyIdTokenClaims(
  payload: GoogleIdTokenPayload,
  expectedClientId: string
): { valid: boolean; error?: string } {
  // 1. Verify audience
  if (payload.aud !== expectedClientId) {
    return { valid: false, error: "ID token audience mismatch" };
  }

  // 2. Verify issuer
  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (!payload.iss || !validIssuers.includes(payload.iss)) {
    return { valid: false, error: "ID token issuer is invalid" };
  }

  // 3. Verify expiration
  if (typeof payload.exp === "number") {
    const nowSeconds = Math.floor(Date.now() / 1000);
    // Allow 60 seconds clock skew
    if (payload.exp + 60 < nowSeconds) {
      return { valid: false, error: "ID token has expired" };
    }
  }

  return { valid: true };
}

/**
 * Attaches the temporary OAuth state cookie to an outgoing HTTP response.
 */
export function setOAuthStateCookie(res: NextResponse, state: string): void {
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: state,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the temporary OAuth state cookie.
 */
export function clearOAuthStateCookie(res: NextResponse): void {
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Retrieves the OAuth state token from the incoming request cookie.
 */
export function getOAuthStateFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${OAUTH_STATE_COOKIE_NAME}=`));

  if (match) {
    const token = match.substring(`${OAUTH_STATE_COOKIE_NAME}=`.length);
    if (token) return decodeURIComponent(token);
  }

  return null;
}

